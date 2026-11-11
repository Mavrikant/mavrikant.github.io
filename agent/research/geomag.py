"""Minimal spherical-harmonic geomagnetic field synthesis (WMM / IGRF).

Implements the standard Schmidt semi-normalised expansion so that the
result can be checked against NOAA's published WMM2025 test values.
"""
import math

A_WGS84 = 6378.137          # km, WGS 84 semi-major axis
F_WGS84 = 1.0 / 298.257223563
E2 = F_WGS84 * (2.0 - F_WGS84)
A_GEOMAG = 6371.2           # km, geomagnetic reference radius


def load_wmm_cof(path):
    """Read a WMM.COF file -> (epoch, nmax, g, h, gdot, hdot)."""
    g, h, gd, hd = {}, {}, {}, {}
    epoch, nmax = None, 0
    with open(path) as fh:
        for line in fh:
            parts = line.split()
            if not parts:
                continue
            if epoch is None and len(parts) >= 3 and parts[1].startswith("WMM"):
                epoch = float(parts[0])
                continue
            if len(parts) != 6:
                continue            # trailing "9999..." separator lines
            n, m = int(parts[0]), int(parts[1])
            g[(n, m)], h[(n, m)] = float(parts[2]), float(parts[3])
            gd[(n, m)], hd[(n, m)] = float(parts[4]), float(parts[5])
            nmax = max(nmax, n)
    return epoch, nmax, g, h, gd, hd


def load_igrf(path, epoch_label):
    """Read igrf14coeffs.txt and return (nmax, g, h) for one column.

    epoch_label is e.g. '2015.0'. For the final IGRF column the file also
    carries a secular-variation column ('2025-30'); that is handled by the
    caller via extrapolate().
    """
    g, h, nmax = {}, {}, 0
    col = None
    with open(path) as fh:
        for line in fh:
            if line.startswith("c/s") or line.startswith("#"):
                continue
            parts = line.split()
            if parts[0] == "g/h":
                col = parts.index(epoch_label)
                continue
            if col is None:
                continue
            n, m = int(parts[1]), int(parts[2])
            val = float(parts[col])
            if parts[0] == "g":
                g[(n, m)] = val
            else:
                h[(n, m)] = val
            nmax = max(nmax, n)
    return nmax, g, h


def legendre_schmidt(nmax, theta):
    """Schmidt semi-normalised P_n^m(cos theta) and dP/dtheta."""
    u, w = math.cos(theta), math.sin(theta)
    P = [[0.0] * (nmax + 1) for _ in range(nmax + 1)]
    dP = [[0.0] * (nmax + 1) for _ in range(nmax + 1)]
    P[0][0], dP[0][0] = 1.0, 0.0
    for n in range(1, nmax + 1):
        # sectoral term; P_1^1 = sin(theta) exactly, the sqrt factor
        # only applies from n = 2 upwards in the Schmidt normalisation
        c = 1.0 if n == 1 else math.sqrt((2.0 * n - 1.0) / (2.0 * n))
        P[n][n] = c * w * P[n - 1][n - 1]
        dP[n][n] = c * (u * P[n - 1][n - 1] + w * dP[n - 1][n - 1])
        # tesseral / zonal terms
        for m in range(0, n):
            a = math.sqrt(float(n * n - m * m))
            b = math.sqrt(float((n - 1) * (n - 1) - m * m)) if n >= 2 else 0.0
            p2 = P[n - 2][m] if n >= 2 else 0.0
            d2 = dP[n - 2][m] if n >= 2 else 0.0
            P[n][m] = ((2.0 * n - 1.0) * u * P[n - 1][m] - b * p2) / a
            dP[n][m] = ((2.0 * n - 1.0) * (u * dP[n - 1][m] - w * P[n - 1][m])
                        - b * d2) / a
    return P, dP


def field(lat_deg, lon_deg, alt_km, nmax, g, h):
    """Return (X, Y, Z) in nT in the local geodetic frame."""
    lat = math.radians(lat_deg)
    lon = math.radians(lon_deg)

    # geodetic -> geocentric spherical
    rc = A_WGS84 / math.sqrt(1.0 - E2 * math.sin(lat) ** 2)
    p = (rc + alt_km) * math.cos(lat)
    z = (rc * (1.0 - E2) + alt_km) * math.sin(lat)
    r = math.hypot(p, z)
    lat_gc = math.asin(z / r)
    theta = math.pi / 2.0 - lat_gc

    P, dP = legendre_schmidt(nmax, theta)
    ratio = A_GEOMAG / r
    sin_t = math.sin(theta)

    br = bt = bp = 0.0
    for n in range(1, nmax + 1):
        rn = ratio ** (n + 2)
        for m in range(0, n + 1):
            gnm = g.get((n, m), 0.0)
            hnm = h.get((n, m), 0.0)
            cm, sm = math.cos(m * lon), math.sin(m * lon)
            gc_hs = gnm * cm + hnm * sm
            br += rn * (n + 1) * gc_hs * P[n][m]
            bt += -rn * gc_hs * dP[n][m]
            bp += rn * m * (gnm * sm - hnm * cm) * P[n][m]
    bp = bp / sin_t

    # geocentric -> geodetic rotation
    xg, yg, zg = -bt, bp, -br
    d = lat_gc - lat
    X = xg * math.cos(d) - zg * math.sin(d)
    Z = xg * math.sin(d) + zg * math.cos(d)
    return X, yg, Z


def elements(lat_deg, lon_deg, alt_km, nmax, g, h):
    X, Y, Z = field(lat_deg, lon_deg, alt_km, nmax, g, h)
    H = math.hypot(X, Y)
    return {
        "X": X, "Y": Y, "Z": Z, "H": H,
        "F": math.hypot(H, Z),
        "D": math.degrees(math.atan2(Y, X)),
        "I": math.degrees(math.atan2(Z, H)),
    }


def extrapolate(epoch, g, h, gd, hd, year):
    """Linear secular-variation extrapolation to a decimal year."""
    dt = year - epoch
    g2 = {k: v + gd.get(k, 0.0) * dt for k, v in g.items()}
    h2 = {k: v + hd.get(k, 0.0) * dt for k, v in h.items()}
    return g2, h2

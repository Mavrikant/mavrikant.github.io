"""Tikali pitot: park halinde tikanan prob, gizli bir altimetreye donusur."""
import math

P0, T0, L, R, g = 101325.0, 288.15, 0.0065, 287.052874, 9.80665
GAMMA, A0 = 1.4, 340.294
KT, FT = 1.943844, 3.280840


def isa(h_m):
    T = T0 - L * h_m
    return P0 * (T / T0) ** (g / (R * L)), T


def qc_from_cas(cas_ms):
    return P0 * ((1.0 + 0.2 * (cas_ms / A0) ** 2) ** 3.5 - 1.0)


def cas_from_qc(qc):
    return 0.0 if qc <= 0 else A0 * math.sqrt(
        5.0 * ((qc / P0 + 1.0) ** (2.0 / 7.0) - 1.0))


def mach(qc, Ps):
    return 0.0 if qc <= 0 else math.sqrt(5.0 * ((qc / Ps + 1.0) ** (2 / 7) - 1))


# Prob park halinde tikandi: donmus toplam basinc = deniz seviyesi statik.
Pt_donmus = P0
VMO, MMO = 350.0, 0.86     # 757 sinifi ucak icin tipik sinirlar

print("=" * 78)
print("TIKALI PITOT: gosterilen hiz artik yalnizca irtifanin fonksiyonu")
print(f"donmus Pt = {Pt_donmus/100:.1f} hPa (park halinde tikandi)")
print("=" * 78)
print(f"{'irtifa ft':>10} {'Ps hPa':>9} {'qc_olc hPa':>11} {'IAS kt':>8}"
      f" {'Mach_olc':>9} {'VMO asim':>9}")
for h_ft in (0, 576, 1000, 2000, 4000, 6688, 8000, 10000):
    Ps, T = isa(h_ft / FT)
    qc = Pt_donmus - Ps
    ias, M = cas_from_qc(qc) * KT, mach(qc, Ps)
    print(f"{h_ft:>10d} {Ps/100:>9.1f} {qc/100:>11.1f} {ias:>8.1f}"
          f" {M:>9.3f} {'EVET' if ias > VMO else '-':>9}")

print()
print("=" * 78)
print("CELISKI PENCERESI: ayni anda hem overspeed hem stall uyarisi")
print("gercek ucus: tirmanista hiz kaybi (290 -> 180 kt CAS)")
print("=" * 78)
print(f"{'irtifa ft':>10} {'gercek CAS':>11} {'gosterilen':>11} {'fark':>8}"
      f" {'overspeed':>10} {'gercek stall':>13}")
V_STALL = 200.0            # tirmanis konfigurasyonunda tipik stall hizi
for h_ft, cas_ger in ((576, 290), (2000, 275), (4000, 250),
                      (6688, 215), (8000, 195), (10000, 180)):
    Ps, T = isa(h_ft / FT)
    ias = cas_from_qc(Pt_donmus - Ps) * KT
    print(f"{h_ft:>10d} {cas_ger:>11.0f} {ias:>11.1f} {ias-cas_ger:>+8.1f}"
          f" {'EVET' if ias > VMO else '-':>10}"
          f" {'EVET' if cas_ger < V_STALL else '-':>13}")

print()
print("=" * 78)
print("MENZIL/MAKULLUK DENETIMI bu hatayi yakalar mi?")
print("=" * 78)
for h_ft in (576, 2000, 4000, 6688, 10000):
    Ps, T = isa(h_ft / FT)
    qc = Pt_donmus - Ps
    ias, M = cas_from_qc(qc) * KT, mach(qc, Ps)
    menzil_ok = 0 <= ias <= 450 and 0 <= M <= 1.0
    print(f"  {h_ft:>6d} ft -> IAS {ias:6.1f} kt, Mach {M:5.3f}"
          f"  menzil denetimi: {'GECER (hata gorunmez)' if menzil_ok else 'RED'}")

#!/usr/bin/env python3
"""RTG4 2-FF ve 3-FF senkronizatör MTBF eğrisi -> tema-duyarli inline SVG (matplotlib yok)."""
import math

YEAR = 365 * 24 * 3600.0
C1, C2 = 2.877e-5, 7.326e9          # RTG4, Microchip AN6287 Tablo 4-1
FD = 12.5e6

def mtbf_years(tmet, fc):
    if tmet <= 0:
        return 1e-300
    return math.exp(C2 * tmet) / (C1 * FD * fc) / YEAR

W, H = 760, 430
L, R, T, B = 66, 18, 26, 52
PW, PH = W - L - R, H - T - B
X0, X1 = 50.0, 220.0                 # MHz
Y0, Y1 = -10.0, 45.0                 # log10(yil)

def px(f): return L + (f - X0) / (X1 - X0) * PW
def py(v): return T + PH - (max(min(v, Y1), Y0) - Y0) / (Y1 - Y0) * PH

def curve(tco, nff):
    pts = []
    f = X0
    while f <= X1 + 1e-9:
        fc = f * 1e6
        tmet = (nff - 1) / fc - tco     # 2-FF: 1 periyot, 3-FF: 2 periyot
        if tmet > 0:
            y = math.log10(mtbf_years(tmet, fc))
            if Y0 <= y <= Y1:
                pts.append((px(f), py(y)))
        f += 2.0
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)

s = []
a = s.append
a(f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" '
  f'role="img" aria-label="RTG4 2-FF ve 3-FF senkronizatör MTBF eğrisi" '
  f'style="max-width:100%;height:auto;font-family:system-ui,sans-serif">')
a('<g fill="none" stroke="currentColor" stroke-opacity="0.28" stroke-width="1">')
for d in range(-10, 46, 10):
    a(f'<line x1="{L}" y1="{py(d):.1f}" x2="{L+PW}" y2="{py(d):.1f}"/>')
for f in range(50, 221, 25):
    a(f'<line x1="{px(f):.1f}" y1="{T}" x2="{px(f):.1f}" y2="{T+PH}"/>')
a('</g>')
a(f'<g stroke="currentColor" stroke-width="1.4" fill="none">'
  f'<path d="M{L} {T} L{L} {T+PH} L{L+PW} {T+PH}"/></g>')
a('<g fill="currentColor" font-size="11" text-anchor="end">')
for d in range(-10, 46, 10):
    a(f'<text x="{L-7}" y="{py(d)+4:.1f}">10<tspan dy="-4" font-size="8">{d}</tspan></text>')
a('</g>')
a('<g fill="currentColor" font-size="11" text-anchor="middle">')
for f in range(50, 221, 25):
    a(f'<text x="{px(f):.1f}" y="{T+PH+17}">{f}</text>')
a(f'<text x="{L+PW/2:.0f}" y="{T+PH+38}" font-size="12">hedef saat frekansı fc (MHz)</text>')
a('</g>')
a(f'<text transform="translate(15,{T+PH/2:.0f}) rotate(-90)" fill="currentColor" '
  f'font-size="12" text-anchor="middle">MTBF (yıl)</text>')

# 20 yil hedef cizgisi
y20 = py(math.log10(20))
a(f'<line x1="{L}" y1="{y20:.1f}" x2="{L+PW}" y2="{y20:.1f}" stroke="currentColor" '
  f'stroke-width="1.6" stroke-dasharray="7 4" stroke-opacity="0.75"/>')
a(f'<text x="{L+8}" y="{y20-7:.1f}" fill="currentColor" font-size="11" '
  f'font-weight="600">20 yıl hedefi</text>')

for pts, col, lab in (
    (curve(1.543e-9, 3), "#10b981", "3-FF, SET filtresi açık"),
    (curve(0.748e-9, 2), "#f59e0b", "2-FF, SET filtresi kapalı"),
    (curve(1.543e-9, 2), "#ef4444", "2-FF, SET filtresi açık"),
):
    a(f'<polyline points="{pts}" fill="none" stroke="{col}" stroke-width="2.4" '
      f'stroke-linejoin="round"/>')

ly = T + 6
for col, lab in (("#10b981", "3-FF, SET filtresi açık"),
                 ("#f59e0b", "2-FF, SET filtresi kapalı"),
                 ("#ef4444", "2-FF, SET filtresi açık")):
    a(f'<line x1="{L+PW-186}" y1="{ly}" x2="{L+PW-162}" y2="{ly}" stroke="{col}" stroke-width="2.4"/>')
    a(f'<text x="{L+PW-156}" y="{ly+4}" fill="currentColor" font-size="11">{lab}</text>')
    ly += 17
a('</svg>')

svg = "\n".join(s)
open("agent/research/mtbf-egrisi.svg", "w").write(svg)
print(svg)

#!/usr/bin/env python3
"""Senkronizator MTBF hesabi.
Katsayilar: Microchip AN6287 (eski adiyla AC474), Tablo 4-1 / 4-2.
MTBF = exp(C2 * Tmet) / (C1 * fd * fc)
"""
import math

YEAR = 365 * 24 * 3600.0

DEV = {
    "RTG4":      dict(C1=2.877e-5,  C2=7.326e9),
    "PolarFire": dict(C1=2.45e-11,  C2=2.1894e10),
}

def mtbf(dev, tmet, fc, fd):
    d = DEV[dev]
    return math.exp(d["C2"] * tmet) / (d["C1"] * fd * fc)

def tmet_for(dev, target_s, fc, fd):
    d = DEV[dev]
    return (math.log(target_s) + math.log(d["C1"] * fd * fc)) / d["C2"]

def human(s):
    if s < 1e-9:  return f"{s*1e12:.2f} ps"
    if s < 1e-6:  return f"{s*1e9:.2f} ns"
    if s < 1e-3:  return f"{s*1e6:.2f} us"
    if s < 1:     return f"{s*1e3:.2f} ms"
    if s < 3600:  return f"{s:.1f} s"
    if s < 86400: return f"{s/3600:.1f} saat"
    if s < YEAR:  return f"{s/86400:.1f} gun"
    return f"{s/YEAR:.3g} yil"

print("tau (metastabilite zaman sabiti) = 1/C2")
for k, v in DEV.items():
    print(f"  {k:10s} tau = {1/v['C2']*1e12:.1f} ps")

print("\n--- Microchip'in yayimladigi ornekleri dogrula ---")
print("RTG4  fc=100MHz fd=12.5MHz Tmet=0 -> MTBF =",
      human(mtbf("RTG4", 0, 100e6, 12.5e6)), "(dokuman: 27.81 ps)")
print("RTG4  20 yil icin gereken Tmet   =",
      f'{tmet_for("RTG4", 20*YEAR, 100e6, 12.5e6)*1e9:.2f} ns', "(dokuman: 6.08 ns)")
print("RTG4  fc=160MHz 20 yil icin Tmet =",
      f'{tmet_for("RTG4", 20*YEAR, 160e6, 12.5e6)*1e9:.2f} ns', "(dokuman: 6.15 ns)")
print("PolarFire fc=160MHz fd=80MHz Tmet=0 -> MTBF =",
      human(mtbf("PolarFire", 0, 160e6, 80e6)), "(dokuman: 3.19 us)")
print("PolarFire 20 yil icin gereken Tmet =",
      f'{tmet_for("PolarFire", 20*YEAR, 160e6, 80e6)*1e9:.2f} ns', "(dokuman: 1.50 ns)")

print("\n--- RTG4, 2-FF senkronizator, SET filtresi ACIK (Tco = 1.543 ns) ---")
print("fd = 12.5 MHz sabit, hedef 20 yil\n")
print(f'{"fc (MHz)":>9} {"Tc (ns)":>8} {"ulasilabilir":>13} {"gereken":>9} {"gercek MTBF":>14}')
print(f'{"":>9} {"":>8} {"Tmet (ns)":>13} {"Tmet(ns)":>9} {"":>14}')
for fc_mhz in (50, 80, 100, 125, 140, 160, 200):
    fc = fc_mhz * 1e6
    tc = 1.0 / fc
    avail = tc - 1.543e-9
    need = tmet_for("RTG4", 20 * YEAR, fc, 12.5e6)
    got = mtbf("RTG4", avail, fc, 12.5e6) if avail > 0 else float("nan")
    print(f"{fc_mhz:9d} {tc*1e9:8.2f} {avail*1e9:13.2f} {need*1e9:9.2f} {human(got):>14}")

print("\n--- Ayni devre, SET filtresi KAPALI (Tco = 0.748 ns) ---")
for fc_mhz in (125, 160, 200):
    fc = fc_mhz * 1e6
    avail = 1.0 / fc - 0.748e-9
    print(f"  fc={fc_mhz:3d} MHz  Tmet={avail*1e9:5.2f} ns  MTBF = {human(mtbf('RTG4', avail, fc, 12.5e6))}")

print("\n--- 3. flip-flop eklemek (Tmet bir tam clock periyodu daha kazandirir) ---")
for fc_mhz in (160, 200):
    fc = fc_mhz * 1e6
    a2 = 1.0 / fc - 1.543e-9
    a3 = a2 + 1.0 / fc
    print(f"  fc={fc_mhz:3d} MHz  2-FF: {human(mtbf('RTG4', a2, fc, 12.5e6)):>12}"
          f"   ->  3-FF: {human(mtbf('RTG4', a3, fc, 12.5e6)):>12}")

print("\n--- N adet senkronizator: tasarim MTBF'i ---")
single = mtbf("RTG4", 1.0/100e6 - 1.543e-9, 100e6, 12.5e6)
print(f"  tek ornek (RTG4 @100MHz, SET acik): {human(single)}")
for n in (1, 10, 50, 200):
    print(f"    N={n:3d} -> tasarim MTBF = {human(single/n)}")

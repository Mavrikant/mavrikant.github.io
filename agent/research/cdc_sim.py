#!/usr/bin/env python3
"""Cok-bitli CDC veri butunlugu simulasyonu.

Iddia: 2-FF senkronizator metastabiliteyi cozer, VERI BUTUNLUGUNU cozmez.
Bir sayaci bit-bit karsi saat alanina gecirirsek, bitler arasindaki kucuk
yonlendirme (routing) skew'i yuzunden hedef alan, kaynakta HIC VAR OLMAMIS
bir deger ornekleyebilir.

Model: metastabilite yok. Sadece deterministik, bit basina sabit skew.
Bu kasitli: hata metastabilite olmadan da olusuyor.
"""
import random

N_BITS   = 8
F_SRC    = 100e6          # kaynak saat
F_DST    =  77e6          # hedef saat (oransiz secildi)
SKEW_PS  = 150            # bit basina +/- yonlendirme skew'i (ps)
N_EDGES  = 2_000_000      # hedef saat kenari sayisi
SEED     = 20260827

T_SRC = 1.0 / F_SRC
T_DST = 1.0 / F_DST

rng = random.Random(SEED)
# Her bit hattinin kendi sabit yonlendirme gecikmesi var (yerlesim sonrasi sabit)
skew = [rng.uniform(-SKEW_PS, SKEW_PS) * 1e-12 for _ in range(N_BITS)]

def to_gray(v):   return v ^ (v >> 1)
def from_gray(g):
    b = 0
    while g:
        b ^= g
        g >>= 1
    return b

def run(encode, decode, label):
    mask = (1 << N_BITS) - 1
    phantom = 0          # kaynakta hic var olmamis deger
    in_window = 0        # gecis penceresine denk gelen ornek
    worst = 0            # en buyuk mutlak sayisal hata
    worst_case = None
    for k in range(1, N_EDGES + 1):
        t_d = k * T_DST
        n = int(t_d // T_SRC)          # son gecis indeksi
        t_tr = n * T_SRC
        old_v, new_v = (n - 1) & mask, n & mask
        old_w, new_w = encode(old_v), encode(new_v)
        if old_w == new_w:
            continue
        sampled = 0
        mixed = False
        for b in range(N_BITS):
            ob, nb = (old_w >> b) & 1, (new_w >> b) & 1
            if ob == nb:
                sampled |= ob << b
                continue
            # bu bit t_tr + skew[b] aninda degisiyor
            bit = nb if t_d >= t_tr + skew[b] else ob
            if bit != nb:
                mixed = True
            sampled |= bit << b
        if mixed:
            in_window += 1
        got = decode(sampled)
        if got != old_v and got != new_v:
            phantom += 1
            err = min((got - new_v) & mask, (new_v - got) & mask)
            if err > worst:
                worst, worst_case = err, (old_v, new_v, got)
    print(f"{label}")
    print(f"  gecis penceresine denk gelen ornek : {in_window:>9,} "
          f"({in_window/N_EDGES*100:.3f} %)")
    print(f"  HAYALET deger (old da degil new de): {phantom:>9,} "
          f"({phantom/N_EDGES*100:.3f} %)")
    if phantom:
        o, n_, g = worst_case
        print(f"  en kotu sayisal hata               : {worst} LSB "
              f"(ornek: {o} -> {n_} gecisinde {g} okundu)")
        mtb = N_EDGES / phantom / F_DST
        print(f"  ortalama hayalet-ler-arasi sure    : {mtb*1e6:.1f} us")
    print()

print(f"kaynak {F_SRC/1e6:.0f} MHz, hedef {F_DST/1e6:.0f} MHz, "
      f"{N_BITS} bit, skew +/-{SKEW_PS} ps, {N_EDGES:,} hedef kenari")
print(f"bit skew'leri (ps): {[round(s*1e12,1) for s in skew]}\n")

run(lambda v: v, lambda w: w, "A) Duz ikili sayac (her bit ayri 2-FF senkronizator)")
run(to_gray, from_gray, "B) Gray kodlu sayac (ayni senkronizatorler)")

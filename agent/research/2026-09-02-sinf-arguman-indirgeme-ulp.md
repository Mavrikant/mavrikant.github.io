# Araştırma Notları — sinf() doğruluğu, argüman indirgeme, ULP

Tarih: 2026-09-02 · Dal: `post/2026-09-02-sinf-arguman-indirgeme-ulp`

## Konu seçimi

Açık PR listesi (~70) ve yayındaki 24 yazı tarandı. libm doğruluğu / ULP /
argüman indirgeme konusunda hiçbir yazı veya açık PR yok. En yakın komşular:

- `_posts/2026-03-25-kayan-nokta-sayilarinin-tehlikeleri.md` — NaN, hassasiyet
  kaybı, `fmodf` ile açı normalizasyonu (sonsuz döngü). **Örtüşme yok**: o yazı
  IEEE 754 temel tuzakları; bu yazı kütüphane doğruluğu ve indirgeme.
- PR #50 (float denormalize FTZ/DAZ) — denormal davranışı, farklı konu.
- PR #146 (object code coverage §6.4.4.2.b) — sertifikasyon açısı orada yapısal
  kapsama; burada sayısal doğruluk. Yazıda object code coverage'a girilmedi.

"Bu konuyu bulmak neden zor?" → Bilgi üç ayrı disiplinde dağınık: (1) sayısal
analiz literatürü (Muller, Kahan/Ng), (2) libc kaynak kodu (fdlibm/musl
`__rem_pio2f`), (3) sertifikasyon pratiği (kütüphane kodunun kanıtı). Türkçe'de
sentezi yok; İngilizce'de bile tek yerde toplanmış hâli seyrek.

## Derinlik öğesi (Bölüm 7)

Dört ayrı somut ölçüm/deney, hepsi yeniden üretilebilir:

1. **ULP taraması** — Apple libm `sinf`/`sin`, 4800 rastgele argüman, 0'dan
   3e38'e 8 ondalık kuşak. Referans: Python `Decimal`, uyarlanabilir hassasiyet
   (|x|'in basamak sayısı + 120). Sonuç: **max 0.842 ULP, ort ~0.28 ULP**;
   büyüklükle bozulma yok. → faithful, ama correctly-rounded DEĞİL.
   `sin(DBL_MAX)` = 0.004961954789184062, 0.289 ULP.
2. **İndirgeme stratejileri** — `fmodf` (float 2π), `fmod` (double 2π),
   3×12-bit Cody–Waite, libm. Tablo: naive float 1e3'te ölüyor, double fmod
   ~1e11'de, Cody–Waite ~1e9'da; libm her yerde <1 ULP.
   Yan bulgu: [0,2π)'ye indirgeyip float'a yuvarlamak tek başına 12 ULP hata
   veriyor (x=12.3456697); [-π,π]'ye indirgemek 1 ULP.
3. **binary32 en kötü durum (özgün hesap)** — TÜM sonlu float x ≥ 1 için
   Payne–Hanek ile taranarak: **en kötü sadeleşme 29 bit**,
   x = 21999384576.0 (0x50a3e87f), k mod 4 = 1, r = 2.0126e-9,
   1 − sin(x) = 2.03e-18 → `sinf(x)` tam olarak 1.0f.
   İlk 4 en kötü: 0x3fc90fdb (25), 0x4096cbe4 (26), 0x437ce5f1 (28),
   0x50a3e87f (29). Dördü de Decimal referansla bağımsız doğrulandı.
   Üretilen 2/π bit tablosu fdlibm'in `two_over_pi` tablosuyla birebir aynı
   çıktı (0xA2F9836E4E441529…) → tablo üretimi de doğrulanmış oldu.
4. **Derleme zamanı katlama** — clang -O2, `sinf(1e22f)` çağrısı ikili koda
   `mov w8, #0xecc4 / movk w8, #48955, lsl #16` (0xbf3becc4) olarak gömülüyor;
   çalışma zamanı çağrısı yok. `float f(float x){return sinf(x);}` → `b _sinf`
   (ARM'da sin komutu yok).

Ek ölçüm: `sinf` maliyeti argüman büyüklüğüne göre 4.50 → 2.78 ns/çağrı
(küçükten büyüğe, M-serisi, -O2 -fno-vectorize, 15 tekrarın en iyisi).
Yani bu implementasyonda büyük argüman cezası YOK. Dürüst çerçeve: bu
throughput, WCET değil.

## Doğrulanmış olgular ve kaynaklar

| İddia | Kaynak |
|---|---|
| C standardı math.h doğruluğunu implementation-defined bırakır; "accuracy is unknown" denebilir | ISO/IEC 9899 (N1570) §5.2.4.2.2p6 — PDF'ten birebir çıkarıldı |
| glibc: ideal hata < 0.5 ULP; test paketi 9 ULP'ye kadar hata saymıyor | glibc manual, "Errors in Math Functions" |
| glibc aarch64: sin/cos/tan/exp/pow = 1 ULP (float+double); sin_advsimd/sin_sve/tan_advsimd = 2 ULP; j1/y1/tgamma = 9 ULP | glibc 2.40 `sysdeps/aarch64/libm-test-ulps` (curl ile çekildi) |
| double tam aralık indirgeme için 2/π'nin 1144 biti gerekir; en kötü sadeleşme 61 bit; 61+53+7=121 bit | SunPro "Argument Reduction" (K.C. Ng), §2.3–2.4 |
| Payne & Hanek, "Radian reduction for trigonometric functions", SIGNUM Newsletter 18 (1983) 19–24 | ACM DL |
| musl `__rem_pio2f`: |x| < 2^28·(π/2) için Cody–Waite ("25+53 bit pi is good enough for medium size"), üstünde `__rem_pio2_large`. Eşik 0x4dc90fdb = 421657440.0 (float(2^28·π/2) ile birebir aynı — hesapla doğrulandı) | musl kaynak |
| LLVM math çağrılarını host libm ile katlar; çapraz derlemede hedefin libm'inden farklı sonuç | llvm-dev, Nisan 2019 (Hal Finkel: "LLVM uses host routines for constant-folding math functions") |
| DO-178C'de yürütülebilirdeki "run-time library support code" ek kod olarak doğrulama gerektirir; DO-248C 4.12.1 | Rapita, "Verifying additional code for DO-178C" |
| CORE-MATH: tüm C99 binary32 fonksiyonları doğru yuvarlanmış olarak mevcut; IEEE 754-2029'da zorunlu kılınması tartışılıyor | CORE-MATH projesi / ilerleme raporu |

## Yazılmayanlar / kaçınılanlar

- DO-178C alt bölüm numarası (12.1.4 vb.) **doğrulanamadı** → yazıda numara
  verilmedi, yalnızca doğrulanabilir kaynaklara dayanan ifadeler kullanıldı.
- `-ffast-math` bu platformda `sinf` sonucunu değiştirmedi; abartılı iddia
  yerine ölçülen sonuç yazıldı, vektör varyantların 2 ULP'si glibc tablosuyla
  desteklendi.
- Gizlilik: yalnızca kamuya açık standart, kaynak kodu ve kendi ölçümlerim.

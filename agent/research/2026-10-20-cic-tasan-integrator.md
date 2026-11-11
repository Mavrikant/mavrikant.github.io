# Araştırma Notları — CIC Filtresinde Taşan İntegratör

Tarih: 2026-10-20 · Dal: `post/2026-10-20-cic-tasan-integrator`

## Konu seçimi (Faz 2)

Adaylar ve sonuç:

| Aday | Karar | Gerekçe |
|---|---|---|
| CIC desimasyon filtresinde integratör taşması | **SEÇİLDİ** | Yaygın yanılgı + ölçülebilir deney + 70 açık PR ve 27 yazıyla sıfır çakışma |
| ARINC 429 anatomisi | Bekletildi | #122 (endianness) 429'a değiniyor; ayrıca "doküman yeniden yazımı" riski yüksek |
| DO-333 formel yöntemler eki | Bekletildi | #163 abstract interpretation ile kısmi örtüşme; somut araç çıktısı üretmek zor |
| ARP4761A ortak sebep analizi (PRA/ZSA/CMA) | Bekletildi | Somut "derinlik öğesi" üretmek güç; standart metni paywall |
| ADC clock jitter ve ENOB | Bekletildi | Yayındaki bandpass sampling yazısına fazla komşu |

Çakışma kontrolü: `_posts/` (27 yazı) ve `gh pr list --state open` (70 PR) tarandı.
DSP tarafında doygun alanlar: NCO spur (#182), IIR kuantizasyonu (#178), I/Q (#170),
Q15 FIR (#114), bandpass sampling (yayında). **CIC / desimasyon / bit büyümesi yok.**
Yayındaki bandpass sampling yazısı CIC'i kendi "sonraki konu" paragrafında işaret ediyor.

## Novelty: bu konu neden zor bulunuyor? (Faz 2 / Bölüm 8)

1. Birincil kaynak (Hogenauer 1981, IEEE Trans. ASSP-29) paywall arkasında.
2. Satıcı dokümanları formülü verir, **türetmez**; taşma konusunu tek cümleyle geçer.
3. Asıl karşı-sezgisel sonuç — *saturasyonlu toplayıcı filtreyi bozar* — neredeyse
   hiçbir yerde açıkça yazmıyor. Mühendisin refleksi saturasyonun "güvenli" olduğudur.
4. C tarafı bağlantısı (signed taşma = tanımsız davranış, MISRA C:2012 Rule 1.3)
   DSP literatüründe hiç kurulmuyor; HDL kaynakları donanım, C kaynakları taşmasızlık varsayıyor.
5. Türkçe kaynak yok.

## Derinlik öğesi (Bölüm 7)

Üç tane: (a) tekrar üretilebilir sayısal deney, (b) derleyici/assembly incelemesi,
(c) matematiksel türetme + frekans cevabı analizi.

## Doğrulanmış olgular

- Hogenauer, E. B., *An Economical Class of Digital Filters for Decimation and
  Interpolation*, IEEE Trans. ASSP, cilt ASSP-29, sayı 2, ss. 155–162, Nisan 1981.
  (Künye çok sayıda bağımsız kaynakta aynı.)
- Altera CIC IP Core User Guide, UG-CIC, 2014.12.15, bölüm 3: `G = RM^N`,
  `Bout = Bin + Nlog2(RM)`, *"A data width of Bout is required for each integrator
  and differentiator for no data loss."*, diferansiyel gecikme 1 veya 2, kademe 1–12,
  Hogenauer pruning tanımı. Doğrudan Hogenauer 1981'e atıf veriyor.
- AMD CIC Compiler v4.0 (PG140, 2026-07-22): tam hassasiyette "Bmax bits internally
  for each of the integrator and differentiator stages", çıkış tarafında kırpma.
- R. Lyons, *Understanding cascaded integrator-comb filters* (Embedded.com):
  taşmanın zararsız olma koşulları — sayı aralığı ≥ çıkıştaki maksimum değer **ve**
  two's complement (saturasyonsuz) aritmetik.
- MISRA C:2012 Rule 1.3 (Required): tanımsız/kritik belirsiz davranış yasak.
  MISRA C:2012 Rule 12.4 ise *unsigned* sabit ifade wrap-around'u ile ilgili — bu konu değil.

## Ölçümler (bu makinede üretildi)

Python 3.14 + numpy 2.5.1 / scipy 1.18.1; Apple clang 21.0.0, arm64-apple-darwin27.

- Bin=16, R=64, M=1, N=4 → B = 40 bit. 4096 örnekte integratör taşma sayıları
  [0, 0, 20, 948]. Wraparound @40 bit: bit-bit aynı. @39 bit: bozuk (hata 2^39).
  Saturasyon @40 bit: **bozuk** (hata 7.5e11).
- DC tam skala: +32767 → tepe 549,739,036,672; −32768 → tepe 549,755,813,888 = 2^39
  (sınır tam oturuyor, bit-bit aynı).
- Droop / alias (R=64, M=1, bant kenarı 0.40×çıkış Nyquist):
  N=3 → 1.74 dB / −37.9 dB (B=34); N=4 → 2.32 / −50.5 (40);
  N=5 → 2.90 / −63.1 (46); N=6 → 3.47 / −75.7 (52).
- Inverse-sinc kompanzasyon FIR (çıkış hızında, firls): 11 tap 1.00 dB,
  15 tap 0.53 dB, 21 tap 0.12 dB, 31 tap 0.04 dB ripple. Q15 katsayılarla fark yok.
- C: `a + 1 > a` (int32) `-O2` ile `mov w0, #1; ret`'e indirgeniyor; `-fwrapv` ile
  gerçek karşılaştırma kalıyor. UBSan integratör satırında signed overflow raporluyor.

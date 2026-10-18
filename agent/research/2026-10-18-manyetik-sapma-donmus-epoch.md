# Araştırma notları — Manyetik sapma, donmuş epoch ve delta MV

Yazı: `_posts/2026-10-18-manyetik-sapma-donmus-epoch.md`
Tarih: 2026-10-18

## Birincil kaynaklar (hepsi indirildi ve okundu)

| Kaynak | Ne için kullanıldı |
|---|---|
| FAA PARC MagVar Recommendations, 17.06.2013 | Anchorage 2012 olayı, MV of Record süreci (Order 8260.19E Ch.2 §5), IRU MagVar tablosu özellikleri, 3° delta MV sınırı, EASA CS-25 enlem tablosu, Kanada NDA 33 havaalanı |
| NOAA NCEI WMM2025 katsayı paketi | `WMM2025.COF` (derece 12, epoch 2025.0, 13.11.2024) + 100 noktalı resmî test değerleri |
| NOAA WMM accuracy/limitations sayfası | σ_D = sqrt(0.26² + (5417/H)²), blackout <2000 nT, caution 2000–6000 nT, kabuk/iyonosfer modellenmiyor |
| BGS/NOAA WMM2015v2 Technical Note, 2019 | MIL-PRF-89500A 1° GV RMS spesifikasyonu aşma öngörüsü, döngü dışı güncelleme gerekçesi, kabuk sapma hatası 0.37° |
| IAGA/NOAA `igrf14coeffs.txt` | DGRF 2015.0 / 2020.0 (kesinleşmiş), IGRF 2025.0 + SV; geçmiş epoch hesapları |

## Derinlik öğesi: model kurma + doğrulama

`agent/research/geomag.py` — saf Python küresel harmonik sentez (WGS84 → jeosentrik,
Schmidt yarı-normalize Legendre özyinelemesi + türevi, alan bileşenleri, çerçeve
döndürmesi). Bağımlılık yok, yalnızca `math`.

**Yakalanan hata:** Legendre sektoral özyinelemesinde `sqrt((2n-1)/(2n))` çarpanını
n=1 için de uygulamak. Doğrusu P̄(1,1) = sin θ (çarpan yalnızca n≥2). Bu hata m>0 olan
tüm terimleri 0.707 ile ölçekliyordu; dipol terimi doğru kaldığı için sonuçlar "makul"
görünüyor ama sapma birkaç derece kayıyordu. Gözle yakalanamazdı.

**Doğrulama sonucu** (NOAA'nın 100 resmî test noktasına karşı, 2025.0–2029.5,
0–98 km, −87°…+89°):

```
X 0.0007 nT | Y 0.0000 | Z 0.0000 | H 0.0007 | F 0.0004
D 0.004973 deg | I 0.004992 deg
```

Yayımlanmış dosya sapmayı 2 ondalıkla verdiği için yuvarlama tavanı 0.005°. Uyum,
karşılaştırmanın çözünürlüğü kadar tam.

**Çapraz kontrol:** IGRF-14 ile WMM2025, 2025.0'da sapmada 0.002–0.008° içinde uyuşuyor
→ aşağıdaki kaymalar model farkı değil, gerçek sekuler varyasyon.

**Konum hassasiyeti:** 0.1° konum hatası sapmayı en çok 0.04° değiştiriyor
→ 2 ondalıklı havaalanı koordinatları fazlasıyla yeterli.

## Ana sonuç (2015 epoch'una donmuş tablo, 2026'da)

| Yer | Enlem | Kayma | 3°'ye |
|---|---|---|---|
| Van | 38.47 | +0.50° | ~154 yıl |
| İstanbul | 41.26 | +0.89° | ~66 yıl |
| Frankfurt | 50.03 | +1.68° | ~22 yıl |
| Anchorage | 61.17 | **−3.06°** | ~11 yıl |
| Fairbanks | 64.82 | **−3.75°** | ~9 yıl |
| Svalbard | 78.25 | **+4.65°** | ~7 yıl |

3° OEM sınırını aşan iki havaalanı, FAA'nın 2012'de fiilen krize girdiği tam o iki
havaalanı (Anchorage + Fairbanks) — bağımsız hesap, olayın coğrafyasını doğruluyor.

Anchorage'da gerçek sapma 2010 civarında 19°E'yi geçmiş; PARC 2013'te değeri
Aralık 2014'e kadar 19°E'de **tutmayı** önerdi (yani yer tarafının gerçeklikten
sapmasına bilerek izin verildi), çünkü kritik olan mutlak doğruluk değil filodaki
donmuş tablolarla uyum.

## Novelty gerekçesi

Konu üç ayrı alanın kesişiminde dağınık duruyor: jeomanyetizma (NOAA/BGS), uçuş
prosedürü tasarımı (FAA Order 8260.19E) ve aviyonik entegrasyon (IRU veritabanları).
Hiçbir kaynak üçünü birleştirmiyor; PARC raporu birleştiriyor ama bir komite
tutanağı biçiminde ve bilinmiyor. Türkçe hiç yok. Ayrıca yaygın yanılgı var:
"manyetik başlık pusuladan gelir" — taşıma kategorisi uçaklarda gelmiyor.

## Reddedilen alternatifler

- **ARINC 429 etiket/SSM anatomisi** — etiket bit-reversal açısı PR #122'de
  (Endianness'in Üç Katmanı) zaten işlenmiş; algıda çakışır.
- **DO-178C dead code vs deactivated code** — yapısal kapsama alanı 4+ açık PR ile doygun.
- **ARINC 424 path terminator'ları** — spec paywall arkasında, olgu doğrulaması riskli.

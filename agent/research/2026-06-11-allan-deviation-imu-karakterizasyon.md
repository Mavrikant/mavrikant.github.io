# Araştırma Notları — Allan Deviation ile IMU/Jiroskop Karakterizasyonu

Tarih: 2026-06-11
Slug: allan-deviation-imu-karakterizasyon
Dal: post/2026-06-11-allan-deviation-imu-karakterizasyon

## Konu Seçim Gerekçesi (Faz 2)

- Türkçe içerikte konu son derece dağınık. Türkçe arama yapıldığında çıkan içeriklerin çoğu MATLAB Allan deviation fonksiyonunun nasıl çağrılacağı — matematiksel temel + log-log slope yorumu + somut Python türetmesi birlikte yok.
- Kalman filtresi yazısının (2026-06-02) doğal yan komşusu: Kalman tuning Q matrisinin diyagonal değerlerini IMU karakterizasyonundan alır. Ama bu yazının konusu Kalman değil — Kalman'a giren parametrelerin nereden geldiği.
- Atom saatlerinden gelen tarihsel hat (David W. Allan, 1966) → telekom (PTP/SyncE phase noise) → inertial sensorlar → şimdi MEMS jiroskoplar. Bu zincir literatürde nadiren tek seferde anlatılıyor.
- Derinlik öğesi (Bölüm 7): **matematiksel türetme + tekrar üretilebilir Python deneyi**. Sentetik bir jiroskop veri serisi üzerinde overlapping Allan variance hesaplayıp ARW, B, K parametrelerini geri çıkaracağız.
- Son 3 yazı alt-alanları: yazılım zanaatı (coupling), navigasyon/füzyon (Kalman), sistem mühendisliği. Bu yazı: **metroloji + sinyal işleme + inertial navigasyon**. Yakın ama çakışmıyor.

## Açık PR Çakışma Kontrolü

- #103 (Kalman Joseph form): farklı — Kalman covariance ıraksaması
- #114 (Sabit nokta Q15): farklı
- Diğer açık PR'ların hiçbiri IMU karakterizasyonu / Allan deviation kapsamında değil.
- Yayında 2026-06-02 Kalman filtresi var — orada Allan deviation kısaca anılıyor ama ana konu değil. Bu yazı o yazının doldurmadığı boşluğu dolduruyor.

## Anahtar Olgular (doğrulandı)

1. **Allan variance tanımı**: σ²_y(τ) = (1/2)·E[(ȳ_{k+1} − ȳ_k)²]
   - Burada ȳ_k, τ uzunluğundaki k'ıncı kümenin ortalama hız değeri.
   - Klasik (standart) varyansın aksine, 1/f gürültü için yakınsar.
   - Kaynak: IEEE Std 952-1997, El-Sheimy et al. 2008.

2. **Overlapping Allan variance** (IEEE 1554-2005 tarafından önerilen):
   σ²(τ) = 1/(2·m²·(N − 2m + 1)) · Σ_{k=1}^{N−2m+1} (Σ_{i=k}^{k+m−1}(y_{i+m} − y_i))²
   - Daha iyi istatistiksel verim — aynı veriden daha düşük varyans tahmini.

3. **Log-log Allan deviation eğim → gürültü tipi haritalaması**:
   | Eğim   | Gürültü tipi             | Parametre (sembol)     |
   |--------|--------------------------|-------------------------|
   | −1     | Kuantizasyon gürültüsü   | Q                       |
   | −1/2   | Açısal rastgele yürüyüş  | N (ARW)                 |
   | 0      | Bias instability (1/f)   | B                       |
   | +1/2   | Hız rastgele yürüyüşü    | K (RRW)                 |
   | +1     | Hız rampı (drift)        | R                       |

4. **Parametre çıkarımı** (IEEE 952-1997):
   - **N (ARW)**: σ(τ=1 s) = N. Birim: (deg/s)/√Hz veya deg/√s. Saatlik birime: × 60.
   - **B (bias instability)**: σ_min ≈ 0.664 · B. Faktör: √(2·ln(2)/π) ≈ 0.6643.
   - **K (RRW)**: σ(τ=3 s) = K. Birim: (deg/s)·√s veya deg/√(s·hr).

5. **Birim dönüşümleri**:
   - ARW: 1 deg/√s = 60 deg/√hr (zira √3600 = 60).
   - Bias instability: 1 deg/s = 3600 deg/hr.

6. **Pratik değer aralıkları** (literatürden):
   - Tüketici MEMS (örn. MPU-6050): ARW ~ 0.1–1 deg/√s, B ~ 10–50 deg/hr
   - Endüstriyel MEMS (örn. ADIS16470): ARW ~ 0.3 deg/√hr, B ~ 8 deg/hr
   - Taktiksel grade FOG (örn. KVH DSP-1750): ARW ~ 0.012 deg/√hr, B ~ 0.05 deg/hr
   - Navigasyon grade RLG (örn. Honeywell GG1320): ARW ~ 0.0035 deg/√hr, B ~ 0.003 deg/hr

7. **Standartlar**:
   - IEEE Std 952-1997 (R2008) — Single-axis interferometric fiber optic gyros. **Allan variance** burada normatif.
   - IEEE Std 1554-2005 — Inertial sensor terminology; recommended practice.
   - IEEE Std 528-2001 — Inertial sensor terminology.
   - David W. Allan, "Statistics of atomic frequency standards," Proc. IEEE 54(2), 1966.

## Yapı Planı (Faz 4)

1. Giriş — IMU datasheet'inde gördüğümüz beş satır
2. Allan deviation neden var: standart varyans neden yetmiyor (1/f)
3. Tarih: atom saatlerinden inertial sensorlara
4. Matematiksel tanım (klasik + overlapping)
5. Log-log eğim tablosu: beş gürültü tipinin imzası
6. Üç parametrenin grafikten okunması: ARW, B, K
7. Python deneyi: sentetik veri üret → overlapping AVAR hesapla → parametre çıkar
8. Datasheet karşılaştırması: tüketici vs taktiksel vs navigasyon grade
9. Kalman filtresine bağlanma: Q matrisi nereden geliyor
10. Pratik tuzaklar (sıcaklık, montaj, kayıt süresi)
11. Kaynaklar

## Pratik Tuzaklar (Faz 6 ekleyecek)

- Allan variance'ın güven aralığı τ büyüdükçe çok genişler — log-log uçlarında eğim okumak yanıltıcı.
- Bias instability'i ölçebilmek için en az B periyodunun ~10 katı kadar veri lazım (saatlerce).
- Sıcaklık sürüklenmesi Allan plot'a "rampa" gibi görünür ve gerçek RRW ile karışır.
- Quantization gürültüsü modern 24-bit ADC'lerde nadiren baskındır; eski 12-bit MEMS'te görülür.

## Kaynaklar (yazıda kullanılacak)

- D. W. Allan, "Statistics of atomic frequency standards," Proc. IEEE 54(2):221–230, 1966.
- IEEE Std 952-1997 — "Specification Format Guide and Test Procedure for Single-Axis Interferometric Fiber Optic Gyros."
- IEEE Std 1554-2005 — "Recommended Practice for Inertial Sensor Test Equipment, Instrumentation, Data Acquisition, and Analysis."
- N. El-Sheimy, H. Hou, X. Niu, "Analysis and modeling of inertial sensors using Allan variance," IEEE Trans. Instrum. Meas. 57(1):140–149, 2008.
- M. Vagner, "MEMS Gyroscope Performance Comparison Using Allan Variance Method," Brno U. of Tech., 2012.
- MathWorks, "Inertial Sensor Noise Analysis Using Allan Variance" (allanvar fonksiyonu dokümantasyonu).
- Analog Devices EngineerZone — "Gyroscope Angle Random Walk."
- VectorNav, "IMU Specifications Explained."

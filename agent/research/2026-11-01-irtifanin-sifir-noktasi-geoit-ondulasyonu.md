# Araştırma Notları — İrtifanın Sıfır Noktası: Geoit Ondülasyonu, LPV ve FAS Data Block

Tarih: 2026-11-01 · Alan: navigasyon / aviyonik veri bütünlüğü
Derinlik öğeleri: (1) tekrar üretilebilir sayısal deney, (2) hata modu (failure mode) analizi,
(3) standart yorumu.

## 1. Neden bu konu (novelty gerekçesi)

"GPS irtifası yanlıştır" cümlesi internette çok, ama *neden* yanlış olduğunun aviyonik veri
zincirindeki tam yeri — yani LPV son yaklaşma segmentinin hangi düşey çatıda tanımlandığı —
dağınık ve sentezlenmemiş durumda. Bilgi üç ayrı yerde duruyor:

- geodezi literatürü (geoit, ondülasyon, EGM modelleri),
- ICAO Annex 15 / PANS-AIM (veri yayınlama ve doğruluk şartları),
- RTCA DO-229 (alıcı MOPS'u, FAS data block, ARINC 429 çıkışları).

Türkçe'de üçünü birleştiren bir kaynak bulamadım. Ayrıca yaygın bir yanılgı var: LPV'nin düşey
kılavuzunun "MSL'ye göre" hesaplandığı sanılıyor; DO-229D Appendix N.1.6 bunun tersini açıkça
söylüyor.

## 2. Doğrulanmış olgular ve kaynakları

### RTCA DO-229D (2006) — birincil kaynak, PDF'ten doğrudan okundu

- App. N.1: "The GPS and SBAS computed WGS-84 altitude is not the Mean Sea Level (MSL)
  altitude." / "All map reference charts used in aviation make reference to altitude expressed
  as a MSL altitude."
- App. N.1.1: basınç, radar ve GNSS irtifaları "are not measurements of the same fundamental
  quantity and therefore, these measurements cannot be used inter-changeably."
- App. N.1.6: "LPV approach plates reference MSL. The Final Approach Segment (FAS) is
  specified in WGS-84 coordinates, not MSL."
- App. N.1: "the EGM-96 model integrity has not been established in these MOPS." → geoit
  modeli bütünlük (integrity) kredisi taşımıyor.
- App. N.1.3: QNH / QNE / QFE modları; ABD'de geçiş irtifası 18.000 ft; "QNE altitude is not
  true MSL altitude."
- App. H, Table H-1 (minimum GPS çıkışı): label **076** "GNSS Altitude (MSL)" ve label **370**
  "GNSS Height"; ikisi de BNR, ft, 20 significant bit, 0,125 ft LSB, ±131.072 ft.
  "The GNSS Height field gives the geodetic height above the WGS-84 ellipsoid and is not
  corrected for geoidal or barometric variations." Uygulanabilir geoit modeli EGM96.
- App. D, Table D-1 (FAS data block): toplam 288 bit veri + 32 bit CRC.
  - LTP/FTP Height **Above Ellipsoid**: 16 bit, −512,0 … 6041,5 m, 0,1 m çözünürlük,
    −512 m offset'li unsigned. "represents the WGS-84 height of the LTP/FTP".
  - Glidepath Angle: 16 bit, 0…90°, 0,01°; "with respect to the horizontal plane tangent to
    the WGS-84 ellipsoid at the LTP/FTP".
  - Approach TCH: 15 bit, 0…1638,35 m, 0,05 m; LTP/FTP'nin *üstündeki* yükseklik.
  - VAL: 8 bit, 0…51,0 m, 0,2 m; 0 = düşey sapma kullanılamaz.
- App. D.5: CRC jeneratör polinomu
  G(x) = x^32+x^31+x^24+x^22+x^16+x^14+x^8+x^7+x^5+x^3+x+1 → 0x814141AB.
  D.6.1: "The CRC, CRC-32Q (Q for Qualcomm) was chosen"; tespit edilemeyen hata üst sınırı
  2^-32 = 2,3283e-10.
- App. G.3.1: baro destekli çözümde basınç irtifası "shall be corrected with the difference
  between the WGS-84 ellipsoid altitude and mean sea level altitude at the present position";
  10 derece enlem/boylam çözünürlüklü bir tablo yeterli sayılıyor. σ_ht = 33 m, σ_a = 10 m.

### ICAO Annex 15 (okunan nüsha: 2nd Edition, 2002) + güncel durum

- Geoit ondülasyonu tanımı: "The distance of the geoid above (positive) or below (negative)
  the mathematical reference ellipsoid." WGS-84 için: elipsoidal yükseklik ile ortometrik
  yükseklik arasındaki fark.
- App. B §6.6: **H = h − N**.
- App. B §6.5: geoit pratikte gelgit ölçerlerle gerçeklenir; rüzgâr/tuzluluk/akıntı kaynaklı
  "sea surface topography" sapmaları **2 m'ye** kadar; dolayısıyla farklı ulusal düşey
  ağların sıfır noktaları da benzer mertebede farklı olabilir.
- Doğruluk tablosu: WGS-84 geoit ondülasyonu — havaalanı elevation pozisyonunda 0,5 m veya
  1 ft (surveyed), 1×10⁻⁵ *essential*; pist eşiğinde hassas yaklaşma için **0,25 m veya 1 ft,
  1×10⁻⁸ *critical***.
- Güncel çatı: Annex 15 WGS-84'ü yatay datum, EGM-96'yı küresel çekim modeli olarak belirler;
  EGM-96'nın Annex 14 doğruluğunu karşılamadığı yerlerde bölgesel/ulusal geoit modeli
  geliştirilmesi istenir ve AIP'de tanımlanır. Ayrıntılı belirleme/raporlama şartları artık
  PANS-AIM (Doc 10066) Appendix 1'de.

### EGM96 / EGM2008

- Pavlis vd. (2012, JGR Solid Earth, 10.1029/2011JB008916): EGM2008 derece/sıra 2159'a kadar
  tam, 2190'a kadar ek katsayılar; EGM96'ya göre çözünürlükte ~6, doğrulukta 3–6 kat iyileşme.
  Küresel GPS/nivelman RMS: EGM96 (360) **30,3 cm**, EGM2008 (2190) **13,0 cm**.
  NGA hedefi ±15 cm.

### Transport Canada, Aviation Safety Letter 1/2021 — "The vertical challenge"

- Baro-VNAV örneği (Edmonton RWY 12, kompanzasyonsuz FMS): FAF 3600 ft indicated, nominal 3°.
  −35 °C'de gerçek irtifa 3367 ft ve etkin açı **2,5°**; +35 °C'de 3698 ft ve **3,2°**.
- Soğukta yol açı sığlaşır → uçak tasarlanandan aşağıda uçar. Transport Canada yeni/güncellenen
  FMS tasarımlarının gerçek düşey yol açısını uçurabilmesini şart koşuyor.

## 3. Kendi hesaplarım (tekrar üretilebilir)

Kod: GeographicLib geoit PGM ızgaralarını kendi yazdığım ayrıştırıcıyla okuyup bilinear
interpolasyon; CRC-32Q'yu bit seviyesinde gerçekleyip FAS data block'u Table D-1'e göre
paketleme.

- **Ayrıştırıcı doğrulaması:** (16,78 N; 3,01 W) → +28,700 m (GeographicLib dokümantasyonundaki
  egm96-5 örneği 28,7068 m). (0,0) → +17,163 m. Izgara global uçları −106,99 / +85,39 m —
  EGM96 için bilinen aralıkla uyumlu.
- **CRC doğrulaması:** DO-229D'nin G(x)'i 0x814141AB; "123456789" için hesap 0x3010BF7F →
  CRC kataloğundaki CRC-32/Q check değeriyle birebir. Yani bit sıralamam ve CRC'm doğru.
- **Türkiye havalimanlarında EGM96 ondülasyonu:** +23,5 m (Dalaman) … +38,6 m (İzmir).
  Ankara Esenboğa +36,84 m, İstanbul +37,07 m.
- **EGM2008 − EGM96 farkı (Türkiye, 36–42 N / 26–44,5 E, 0,25° ızgara, 1875 nokta):**
  min −3,50 m, maks +5,66 m, ortalama +0,33 m, std 1,35 m. Havalimanı noktalarında en büyük
  fark Van'da **1,90 m**, Kayseri'de 1,74 m, Trabzon'da 1,19 m.
  → DO-229D "EGM-96 veya EGM-06, ikisi de kabul edilebilir" derken, Annex 15 eşikte 0,25 m
  doğruluk istiyor. Model seçimi tek başına bu bütçeyi birkaç kat aşabiliyor.
- **Datum hatası deneyi:** LTP için H = 949,0 m (ortometrik) ve h = H + N = 985,8 m (elipsoidal).
  İkisiyle de geçerli FAS bloğu paketlenebiliyor; CRC'ler 0x2C356229 ve 0x0EE3B52E — ikisi de
  kendi bloğu için doğru. CRC datum hatasını yakalamıyor.
- **Geometrik sonuç:** GPA 3,00°, TCH 15,24 m (50 ft) iken h yerine H yazılırsa yol tüm uzunluğu
  boyunca 36,84 m aşağı kayıyor. Eşik geçiş yüksekliği 15,24 → **−21,60 m**; yol, eşikten
  **412 m önce** pist kotuna iniyor. DO-229D'de VAL üst sınırı 51,0 m olduğundan 36,8 m'lik
  *veri* hatası alarm limiti zarfının içinde kalıyor — VAL konum hatasını sınırlar, veri
  hatasını değil.

## 4. Gizlilik kontrolü

Tüm içerik kamuya açık standart metinleri, açık literatür ve kendi hesaplarımdan. Proje, müşteri,
ürün adı veya kurum-içi veri yok. Havalimanı koordinatları kamuya açık ve yaklaşık; ondülasyon
hesabı için yeterli (Türkiye'de ondülasyon ~50 km'de 1 m mertebesinde değişiyor). Datum hatası
senaryosu kurgusal bir analizdir; raporlanmış bir olay olarak sunulmuyor.

## 5. Kullanılmayan ama not edilen uçlar

- DO-333 formel yöntemler eki (gelecek yazı adayı — havuzda yok).
- GBAS/DO-246'da aynı FAS blok yapısının kullanımı.
- eTOD (Annex 15) düşey datum tutarlılığı ve TAWS veritabanları.

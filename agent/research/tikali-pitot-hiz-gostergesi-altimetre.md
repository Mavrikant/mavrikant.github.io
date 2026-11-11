# Araştırma Notları — Tıkalı Pitot / Hava Veri Hesabı

Yazı: `_posts/2026-10-12-tikali-pitot-hiz-gostergesi-altimetre.md`
Model betiği: `agent/research/tikali-pitot-model.py` (saf Python, bağımlılık yok)

## Doğrulanan olgular ve kaynakları

| İddia | Değer | Kaynak |
|---|---|---|
| Deniz seviyesi standart ses hızı | 340.294 m/s = 661,48 kt | USAF TPS / DTIC ADA569074 |
| CAS denklemi üssü | 2/7 = 1/3.5, γ=1.4 | DTIC ADA569074 |
| Basınç yüksekliği katsayıları | 44330.77 m, 0.1902632 | NCAR Pressure Altitude notu |
| ISA sabitleri | T0=288.15 K, L=0.0065 K/m, P0=1013.25 hPa | ICAO Standart Atmosfer |
| ARINC 706-4 başlığı | "Mark 5 Subsonic Air Data System" | SAE ITC ARINC 700 serisi kataloğu |
| Birgenair 301 tarihi/uçağı | 6 Şub 1996, B757-225, TC-GEN, 189 ölü | ASN wikibase 324523 |
| Birgenair FDR veri noktası | 03:45:28, 6.688 ft, **352 kt IAS**, +15,1° pitch, overspeed | Resmi kaza raporu (FAA nüshası) |
| Kalkışta kaptan göstergesi ölü | "80 knots" çağrısı, kaptan göstergesi çalışmıyor | CVR / resmi analiz |
| Tıkanma nedeni | Çamur arısı yuvası — **çıkarım**, problar bulunamadı | ASN, Wikipedia |
| 757 VMO / MMO | 350 KCAS / M 0,86 | FAA uçuş el kitabı listesi |
| Aeroperú 603 | 2 Eki 1996, B757-23A, N52AW, 70 ölü, statik portlarda bant | ASN wikibase 324365 |
| AF447 | 274→52 kt, otopilot 02:10:05, NAV ADR DISAGREE 02:12 | BEA 2012 final raporu |
| BUSS | AoA tabanlı; FL250 altı 3 ADR kapat, üstü 1 ADR açık bırak | Airbus FCOM/QRH aktarımları |
| Pitot tıkanma sıklığı | Kalkışta 55 olayın 44'ü | ATSB AO-2018-053 |

## Model doğrulaması

Prob yerde tıkandı varsayımı → `Pt_donmuş = Ps(saha)`. Gösterilen CAS yalnızca
irtifanın fonksiyonu olur. 6.688 ft'te model çıktısı:

| Saha QNH (hPa) | Model IAS (kt) | Rapor (kt) | Sapma |
|---|---|---|---|
| 1008 | 352,6 | 352 | +0,6 |
| 1013,25 | 356,6 | 352 | +4,6 |
| 1020 | 361,6 | 352 | +9,6 |

CAS yalnızca basınçların fonksiyonu olduğundan tropik saha sıcaklığı sonucu
etkilemez — ISA varsayımı bu kanalda zayıflık yaratmıyor.

**Yan bulgu:** Model, 4.700 ft için ~306 kt veriyor. Wikipedia'nın "4.700 ft'te
~350 kt" eşleşmesi fizikle bağdaşmıyor; resmi raporun "6.688 ft'te 352 kt"
eşleşmesi tutarlı.

## Doğrulanamayanlar (yazıda kullanılmadı veya açıkça belirsiz bırakıldı)

- Kaptanın göstergesinin "576 ft'te yeniden çalışmaya başladığı" iddiası —
  yalnızca arama özetinde geçti, birincil kaynakta doğrulanamadı → **kullanılmadı**.
- Aeroperú'da bandın türü (maskeleme / koli) ve hangi taraftaki portlar —
  ikincil kaynaklar çelişiyor → yazıda çelişki açıkça belirtildi.
- Pitot drenaj deliklerinin Birgenair'de tıkalı olup olmadığı → açık soru olarak bırakıldı.
- Boeing'in kaza sonrası eklediği "airspeed discrepancy" uyarısının ayrıntıları →
  birincil kaynak bulunamadı → **kullanılmadı**.

## Neden bu konuda derin içerik az bulunuyor

Kaza anlatıları bol (dokümanter, forum, video), ama hemen hepsi mekanizmayı
"tıkalı tüp yanlış hız gösterdi" düzeyinde bırakıyor. Denklemi yazıp gösterilen
hızın **irtifanın fonksiyonuna dönüştüğünü** türeten ve bunu FDR kaydıyla
sayısal olarak doğrulayan Türkçe kaynak yok; İngilizce'de de dağınık
(denklemler uçuş testi literatüründe, kaza verisi raporlarda, ikisi bir arada değil).

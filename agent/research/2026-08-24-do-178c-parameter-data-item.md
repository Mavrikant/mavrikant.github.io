# Araştırma Notları — DO-178C Parameter Data Item (PDI)

Tarih: 2026-08-24 · Yazı: `_posts/2026-08-24-do-178c-parameter-data-item.md`

## 1. Standart tarafı — doğrulanmış kaynak: FAA/AVS "DO-178B/C Differences Tool" Rev 010 (15.03.2014)

İndirildi ve `pdftotext` ile tarandı. PDI ile ilgili doğrulanan maddeler:

| DO-178C bölümü | DO-178B karşılığı | FAA farklar aracının söylediği |
|---|---|---|
| §2.5.1 Parameter Data Items | yok (N/A) | "Added: Entire Section >> Describes what a parameter data item comprises, what it contains, and what should be addressed." |
| §4.2.j (+ j.1–j.4) | yok | Planlamada ele alınacaklar: PDI'ların **kullanım şekli**, **software level'ı**, geliştirme/doğrulama/değiştirme süreçleri ve ilgili **araç nitelendirmesi**, **software load control ve compatibility** |
| §5.1.2 | değişiklik | "If parameter data items are planned, the high-level requirements should describe how any parameter data item is used by the software. The high-level requirements should also specify their **structure**, the **attributes** for each of their data elements, and, when applicable, the **value** of each element. The values of the parameter data item elements should be consistent with the structure of the parameter data item and the attributes of its data elements" |
| §5.4.1a / §5.4.2 | değişiklik | Entegrasyon süreci artık PDI dosyalarını da üretir: "Any Parameter Data Item File should be generated" |
| §6.6 Verification of Parameter Data Items | yok (N/A) | "Added: Entire Section >> Explains that if all of the following conditions are met, verification of a PDI can be conducted separately from the verification of the executable Object Code. Provides the criteria and activities needed to verify PDI files." |
| §7.2.1.e | değişiklik | Konfigürasyon tanımlama kapsamı PDI dosyalarını içerecek şekilde genişletildi ("since they can be separate from the executable object code data item") |
| §7.2.7.d / .e | değişiklik | Arşiv/erişim/serbest bırakma kapsamı PDI dosyalarını içerecek şekilde genişletildi |
| §8.3.e | değişiklik | Conformity review: PDI dosyaları da arşivlenmiş kaynaktan **yeniden üretilebilmeli** |
| §11.16 SCI | değişiklik | SCI artık build talimatlarında PDI'yı ve kullanılan PDI dosyalarının açık kimliğini içermeli (11.16g) |
| §11.22 Parameter Data Item File | yok (N/A) | "Added: Entire Section >> Explains what a parameter data item file consists of" |
| Tablo A-2 | değişiklik | "PDI was added to the objective relating to being loaded into the target computer" |
| Tablo A-5 | değişiklik | "Added: Activity references, **two additional objectives** for verification of PDI file and PDI file is correct and complete." |
| Annex B (Glossary) | yok | "Parameter Data Item" ve "Parameter Data Item File" yeni terim olarak eklendi |

**Numaralandırma notu:** FAA aracı Tablo A-5'e iki objektif eklendiğini söylüyor ama numara vermiyor.
Birden çok ikincil kaynak bunları **A-5 #8** ("Parameter Data Item File is correct and complete") ve
**A-5 #9** (PDI dosyasının doğrulanması) diye anıyor. Yazıda bu şekilde, "yaygın numaralandırma" kaydıyla verildi.

**Karşı-kontrol:** patmos-eng sayfası PDI objektiflerini "Table A-6 #6" ve "Table A-7 #9" diye veriyor.
Bu büyük olasılıkla hatalı: A-7 #9 yaygın olarak "kaynak koda izlenemeyen ek kodun doğrulanması"
(object code verification) objektifi olarak biliniyor — Rapita/LDRA sayfaları bunu doğruluyor.
Bu yüzden yazıda A-6/A-7 numaraları kullanılmadı; yalnızca FAA'in doğruladığı "A-5'e iki objektif"
ifadesi + ikincil kaynakların #8/#9 numaralandırması aktarıldı.

## 2. Tanım

DO-178C Annex B (ikincil kaynaklardan aktarılan sözcükler):
"a set of data that, when in the form of a Parameter Data Item File, influence the behaviour of the
software without modifying the Executable Object Code and that is managed as a separate
configuration item."

## 3. A400M / Sevilla vakası — doğrulanan olgular

- 9 Mayıs 2015, A400M MSN023, ilk uçuş (üretim kabul uçuşu), Sevilla San Pablo yakınında
  La Rinconada'ya düştü; 6 mürettebattan 4'ü öldü. (Wikipedia, BAAA)
- Uçak Türk Hava Kuvvetleri'ne teslim edilecekti (Haziran 2015 planlanan). (Wikipedia)
- Bildirilen neden: motor yazılımı Airbus tesisinde yüklenirken **üç motorda tork kalibrasyon
  parametre verisi kazara silindi**; FADEC'ler bu parametreleri okuyamadı.
- Airbus ifadesi: "engines one, two and three experienced power frozen after lift-off and did not
  respond to the crew's attempts to control the power setting in the normal way."
- Yerde kokpitte uyarı yoktu; ilk uyarı ~120 m (390 ft) irtifada geliyordu. (Wikipedia)
- Airbus 19 Mayıs 2015'te **Alert Operator Transmission (AOT)** yayımladı: bir sonraki uçuştan önce
  her motorun ECU'sunda bir kerelik kontrol + motor/ECU değişimi sonrası ek kontroller.
  (Skies Mag basın bülteni, Defense News, The Register)
- Soruşturma İspanya Silahlı Kuvvetleri kaza komisyonu **CITAAM** tarafından yürütüldü
  (14 Mayıs 2015'te devraldı). Tam teknik rapor kamuya açık değil.
- Bağlam: A400M **EASA sivil tip sertifikası** aldı (13 Mart 2013); TP400-D6 motorunun ayrı
  EASA motor tip sertifikası var (EASA.E.033) ve TCDS FADEC'i "Engine Control Unit and
  Application Software" olarak listeliyor.

**Hedge:** Ayrıntı basın + Airbus açıklamalarına dayanıyor; hangi motorların (1-2-3 mü 2-3-4 mü)
etkilendiği kaynaklar arasında tutarsız. Yazıda Airbus ifadesindeki "1, 2 ve 3" kullanıldı ve
"kamuya açık kaynaklara göre" kaydı düşüldü.

## 4. Deney (derinlik öğesi)

`scratchpad/pdi/pdi_demo.c` ve `pdi_safe.c`. Ortam: Apple clang 21.0.0, arm64-apple-darwin25.5.0,
`gcc -std=c11 -O2 -Wall -Wextra`. Çıktılar yazıya birebir kopyalandı.

- `pdi_demo`: alan sırası değişmiş iki 12 baytlık struct; aynı dosya sessizce yanlış okunuyor
  (337.50 Nm yerine −112499.88 Nm). 0xFF silinmiş bölge → NaN; 0x00 → k=0, tork her zaman 0.
- `pdi_safe`: magic + şema + uzunluk + CRC-32 + aralık + part-number uyumu kontrol eden
  bayt-bayt okuyucu; sekiz senaryonun yedisini reddediyor.
- CRC-32 (0xEDB88320 ters polinom) doğrulaması: `CRC32("123456789") = 0xCBF43926` — standart
  kontrol vektörüyle uyuşuyor.

## 5. Sınır çizgisi: PDI vs DO-200B/C

DO-200B (2013) / DO-200C — "Standards for Processing Aeronautical Data" (ED-76A/ED-76B).
Premise farklı: veri işleme zinciri boyunca **veri kalitesini** korumak/kanıtlamak. Navigasyon
veritabanları buraya girer. DO-178C PDI ise yazılımın davranışını belirleyen konfigürasyon
verisidir ve yazılım yaşam döngüsü içinde ele alınır. İkisi karıştırılıyor.

## 6. Yükleme zinciri

ARINC 665 — Loadable Software Part / Media Set Part dosya formatı (header file + data files,
Header File CRC ve Load CRC alanları). ARINC 615A — TFTP tabanlı yükleme protokolü.
DO-178C §7.4 Software Load Control. Bunlar taşıma bütünlüğünü korur; **anlamsal** doğruluğu değil.

## 7. Gizlilik kontrolü

Yazının tamamı kamuya açık kaynaklardan: FAA farklar aracı (kamuya açık PDF), EASA basın
bültenleri/TCDS, basın haberleri, ARINC/RTCA standart adları. Proje-spesifik, kurum-içi veya
ihracat kontrollü hiçbir ayrıntı yok. Deney kodu tamamen sentetik.

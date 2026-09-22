# Konu Defteri

> Otonom yazı ajanının kalıcı belleği. Her çalıştırmada okunur ve güncellenir.
> **Son senkronizasyon: 2026-08-25** (bu tarihten önceki defter üç ay geride kalmıştı).

## Yazıldı (yayında, master üzerinde)

- [x] Hello world! — 1970-01-01
- [x] Tümleşik Gereksinim Yönetimi — 2022-04-28
- [x] Yazılım Sistem Mühendisliği — 2022-04-30
- [x] Use Case Tuzakları — 2022-05-01
- [x] Yazılım Proje Yönetimi Pratikleri: Başarı ve Başarısızlık — 2022-05-01
- [x] Gereksinimler ve Test: Yedi Eksik Bağlantı Efsanesi — 2022-05-08
- [x] Fonksiyonel ve fonksiyonel olmayan yazılım gereksinimleri — 2022-07-11
- [x] CMake — 2022-07-19
- [x] Elektrik kesintisinde bilgisayarın otomatik tekrar açılmasını sağlama — 2022-08-15
- [x] Recursively Delete a Specific Folder — 2022-09-11
- [x] Merge Files with FFmpeg — 2023-03-12
- [x] Türkiye'de Debugging aşamaları — 2023-12-01
- [x] Kayan Nokta Sayılarının Tehlikeleri — 2026-03-25
- [x] Versiyon Kontrol Sistemleri: Git vs SVN vs ClearCase — 2026-03-25
- [x] MISRA C:2025 ile Neler Değişti? — 2026-04-05
- [x] Yöneylem Araştırması Yöntemleri: Kesin ve Metasezgisel Yaklaşımlar — 2026-04-14
- [x] Ölçtüğünüz Sayı Ne Kadar Doğru? Ölçüm Belirsizliği için Bir Rehber — 2026-05-06
- [x] Saatçinin Saatini Kim Kalibre Eder? Kalibrasyon Zincirinin Tepesi — 2026-05-07
- [x] Renode ile Zynq7000 Simülasyonu — 2026-05-14
- [x] Bandpass Sampling: 1 GHz Sinyali 50 MHz Clock ile Örneklemek — 2026-05-21
- [x] Sistem Mühendisliği Nedir? — 2026-05-26
- [x] Kalman Filtresi ve EKF: Gürültülü Veriden Gizli Durumu Kestirmek — 2026-06-02
- [x] Coupling'i Dengelemek: Yazılım Tasarımında Bağımlılığı Yönetmek — 2026-06-04
- [x] Antikırılgan: Belirsizlikten ve Kaostan Güç Alan Sistemler — 2026-06-24
- [x] Python'da Çalışan Filtre Hedefte Neden Patlıyor? IIR Katsayı Kuantizasyonu — 2026-08-25

## Açık PR'lar (insan inceleme bekleniyor) — 55 adet

> **UYARI — konu tekrarı birikmiş.** Defter uzun süre güncellenmediği için ajan aynı
> konuyu birden çok kez yazmış. Tespit edilen kümeler:
>
> | Konu | Çakışan PR'lar |
> |---|---|
> | `volatile` / `_Atomic` / bellek modeli | #159, #157, #156, #155, #134, #100 — **altı PR** |
> | WCET analizi | #164, #98, #88 — üç PR |
> | Watchdog tasarım desenleri | #161, #89 |
> | MC/DC ve structural coverage | #168, #77 |
> | Endianness / bitfield wire format | #166, #122 |
> | MISRA C | #151, #51 ve yayındaki "MISRA C:2025" yazısı |
>
> İnceleyen kişiye öneri: her kümeden **bir** PR seçilip diğerleri kapatılmalı.
> Bu birikim, defterin güncel tutulmamasının doğrudan sonucudur.

| PR # | Başlık | Açılış |
|------|--------|--------|
| [#176](https://github.com/mavrikant/mavrikant.github.io/pull/176) | Kod Doğru, Veri Yanlış — DO-178C'de Parameter Data Item | 2026-08-24 |
| [#175](https://github.com/mavrikant/mavrikant.github.io/pull/175) | Zynq-7000 ve S25FL512S — Güç Kesildiğinde QSPI Flash'ta Ne Kalır? | 2026-08-20 |
| [#174](https://github.com/mavrikant/mavrikant.github.io/pull/174) | MTBF Bir Ömür Değildir — 10⁻⁹ Hedefinin Aritmetiği | 2026-08-19 |
| [#173](https://github.com/mavrikant/mavrikant.github.io/pull/173) | MIL-STD-1553B Anatomisi — Manchester Kodlama, RT Zamanlaması ve Sessiz Bug'lar | 2026-08-18 |
| [#172](https://github.com/mavrikant/mavrikant.github.io/pull/172) | CAST-32A'dan AC 20-193'e — Multicore Aviyonikte Karşılıklı Etki Analizi | 2026-07-30 |
| [#171](https://github.com/mavrikant/mavrikant.github.io/pull/171) | Aviyonik Yazılımda `malloc` Yasak mı? — DO-178C, DO-332 Objektifleri ve TLSF | 2026-07-29 |
| [#170](https://github.com/mavrikant/mavrikant.github.io/pull/170) | I/Q Örnekleme ve Analitik Sinyal — İki Kanal, Karmaşık Değerler ve Negatif Frekansın Sırrı | 2026-07-28 |
| [#169](https://github.com/mavrikant/mavrikant.github.io/pull/169) | Rate Monotonic Scheduling — Liu-Layland Sınırından Response Time Analysis'e | 2026-07-27 |
| [#168](https://github.com/mavrikant/mavrikant.github.io/pull/168) | DO-178C Data ve Control Coupling — MC/DC Bittikten Sonra Yarım Kalan Structural Coverage | 2026-07-26 |
| [#167](https://github.com/mavrikant/mavrikant.github.io/pull/167) | RAIM — GPS Alıcısı Kendi Doğruluğunu Nasıl Denetler? (Least-Squares Residual, Chi-Square Test ve HPL) | 2026-07-25 |
| [#166](https://github.com/mavrikant/mavrikant.github.io/pull/166) | C Bit-Field'ları Wire Format Değildir — Endianness, Padding ve Derleyici-Bağımlı Bit Sıralaması | 2026-07-22 |
| [#165](https://github.com/mavrikant/mavrikant.github.io/pull/165) | AFDX (ARINC 664 P7) Anatomisi — Sanal Bağlantı, BAG ve Determinist Ethernet | 2026-07-14 |
| [#164](https://github.com/mavrikant/mavrikant.github.io/pull/164) | WCET'i Neden Ölçemezsiniz — Cache, Ölçüm Kuyruğu ve DO-178C 6.3.4.f | 2026-07-13 |
| [#163](https://github.com/mavrikant/mavrikant.github.io/pull/163) | Abstract Interpretation Pratikte — Interval Domain neyi kanıtlar, neyi kanıtlamaz? | 2026-07-12 |
| [#162](https://github.com/mavrikant/mavrikant.github.io/pull/162) | ARINC 653 Anatomisi — Aviyonik RTOS'ta Zaman-Uzay Bölümleme ve Sağlık İzleme | 2026-07-11 |
| [#161](https://github.com/mavrikant/mavrikant.github.io/pull/161) | Watchdog Tasarım Desenleri — Independent, Windowed, Deadman ve Sağlık İzleme | 2026-07-10 |
| [#160](https://github.com/mavrikant/mavrikant.github.io/pull/160) | Deterministik Derleme — İki Build Slave Arasında Bit-Bit Aynı İkili ve DO-178C Kanıtı | 2026-07-08 |
| [#159](https://github.com/mavrikant/mavrikant.github.io/pull/159) | volatile Yetmez — C'de eşzamanlılık, bellek modeli ve _Atomic | 2026-07-07 |
| [#158](https://github.com/mavrikant/mavrikant.github.io/pull/158) | DO-330 Araç Nitelendirmesi — TQL Belirleme, Kriter Matrisi ve Gerçek Araçlar Üzerinden Karar Ağacı | 2026-07-06 |
| [#157](https://github.com/mavrikant/mavrikant.github.io/pull/157) | volatile Yetmediğinde — Kesme, DMA ve Multicore'da Bellek Sıralaması | 2026-07-05 |
| [#156](https://github.com/mavrikant/mavrikant.github.io/pull/156) | "volatile" ne değildir — C11 _Atomic ve ARM bellek modeli | 2026-07-05 |
| [#155](https://github.com/mavrikant/mavrikant.github.io/pull/155) | 'volatile' Her Şeyi Çözmez: ISR Paylaşımı, C11 _Atomic ve ARM Bellek Modeli | 2026-07-03 |
| [#151](https://github.com/mavrikant/mavrikant.github.io/pull/151) | `setjmp`/`longjmp` Neden DAL A'da Yasak? — Stack Unwind, MISRA C 21.4 ve Assembly Anatomisi | 2026-06-24 |
| [#150](https://github.com/mavrikant/mavrikant.github.io/pull/150) | Yığın Taşması Sessiz Bir Katildir — Worst-Case Stack Analizi | 2026-06-24 |
| [#149](https://github.com/mavrikant/mavrikant.github.io/pull/149) | Gerçek zamanlı sistemler hakkında blog yazısı ekle | 2026-06-24 |
| [#147](https://github.com/mavrikant/mavrikant.github.io/pull/147) | Derleyici optimizasyonlarını elle yazmak (Zynq7000 + GCC, -O0) yazısı | 2026-06-19 |
| [#146](https://github.com/mavrikant/mavrikant.github.io/pull/146) | Object Code Coverage — DAL A'da Derleyici Boşluğu (DO-178C §6.4.4.2.b) | 2026-06-19 |
| [#145](https://github.com/mavrikant/mavrikant.github.io/pull/145) | Cortex-A Boot — Reset Vektöründen main()'e Gerçekten Ne Oluyor? | 2026-06-17 |
| [#135](https://github.com/mavrikant/mavrikant.github.io/pull/135) | MPU vs MMU — ARM'da Donanım Tabanlı Bellek Korumasının Anatomisi | 2026-06-14 |
| [#134](https://github.com/mavrikant/mavrikant.github.io/pull/134) | `volatile` Yetmez: C'de Eşzamanlılık, MMIO ve `_Atomic` | 2026-06-13 |
| [#129](https://github.com/mavrikant/mavrikant.github.io/pull/129) | Allan Deviation — IMU Datasheet'inin Gizli Dilini Çözmek | 2026-06-11 |
| [#124](https://github.com/mavrikant/mavrikant.github.io/pull/124) | Yüksek İrtifada Sessiz Hata — SEU, SECDED ECC ve Bellek Scrubbing | 2026-06-10 |
| [#122](https://github.com/mavrikant/mavrikant.github.io/pull/122) | Endianness'in Üç Katmanı — ARM BE-8/BE-32, Bitfield Tuzakları ve 1553/429 | 2026-06-09 |
| [#121](https://github.com/mavrikant/mavrikant.github.io/pull/121) | Lockstep CPU Mimarileri — Cortex-R5 DCLS, CCM-R5 ve DAL A Donanımı | 2026-06-08 |
| [#120](https://github.com/mavrikant/mavrikant.github.io/pull/120) | Priority Inversion ve Mars Pathfinder — FreeRTOS'ta Yeniden Üretim | 2026-06-08 |
| [#119](https://github.com/mavrikant/mavrikant.github.io/pull/119) | DMA ve Cache — Cortex-A9 / Zynq-7000 üzerinde sessiz veri bozulması | 2026-06-07 |
| [#118](https://github.com/mavrikant/mavrikant.github.io/pull/118) | DO-326A ve ED-202A — Aviyonik Siber Güvenlik Sertifikasyonu | 2026-06-05 |
| [#114](https://github.com/mavrikant/mavrikant.github.io/pull/114) | Sabit Nokta Aritmetik — FPU'suz Cortex-M0'da Q15 FIR Filtresi | 2026-06-04 |
| [#103](https://github.com/mavrikant/mavrikant.github.io/pull/103) | Kalman Filtresinin Sessiz İraksaması — Joseph Form, Gözlemlenebilirlik ve Tutarlılık Testleri | 2026-06-01 |
| [#102](https://github.com/mavrikant/mavrikant.github.io/pull/102) | ILS Anatomisi — Localizer 90/150 Hz DDM ve Glide Path Geometrisi | 2026-05-31 |
| [#101](https://github.com/mavrikant/mavrikant.github.io/pull/101) | ARM GIC — Cortex-A Kesme Denetleyicisinin İçine Bakmak | 2026-05-30 |
| [#100](https://github.com/mavrikant/mavrikant.github.io/pull/100) | `volatile` Yetmediğinde — Zynq-7000 Üzerinde C11 `_Atomic`, SCU ve Bellek Bariyerleri | 2026-05-29 |
| [#99](https://github.com/mavrikant/mavrikant.github.io/pull/99) | Dört Aşamalı Veri Analitiği — Mühendislikte Tanımlayıcıdan Kuralcıya | 2026-05-28 |
| [#98](https://github.com/mavrikant/mavrikant.github.io/pull/98) | WCET Analizi — Statik Yöntemler, Ölçüm Tabanlı Yaklaşımlar ve Cache'in Karanlık Tarafı | 2026-05-28 |
| [#96](https://github.com/mavrikant/mavrikant.github.io/pull/96) | Fault Tree Analizi ve Minimal Cut Set Hesabı | 2026-05-27 |
| [#90](https://github.com/mavrikant/mavrikant.github.io/pull/90) | Linker Script Anatomisi — ARM Bare-Metal için Bir .ld Dosyası Satır Satır | 2026-05-26 |
| [#89](https://github.com/mavrikant/mavrikant.github.io/pull/89) | Watchdog Timer Tasarım Desenleri — Tek-Stage Yanılgısından Rendezvous Pattern'e | 2026-05-24 |
| [#88](https://github.com/mavrikant/mavrikant.github.io/pull/88) | WCET Analizi: Statik mi, Ölçüm mü, Hibrit mi? | 2026-05-23 |
| [#79](https://github.com/mavrikant/mavrikant.github.io/pull/79) | CRC Polinom Seçimi ve Hamming Mesafesi | 2026-05-20 |
| [#78](https://github.com/mavrikant/mavrikant.github.io/pull/78) | VOR Nasıl Çalışır? 30 Hz Faz Karşılaştırması ve DVOR Geometrisi | 2026-05-19 |
| [#77](https://github.com/mavrikant/mavrikant.github.io/pull/77) | MC/DC Kapsama — DO-178C DAL A'da Modified Condition/Decision Coverage | 2026-05-17 |
| [#67](https://github.com/mavrikant/mavrikant.github.io/pull/67) | Bellek Güvenliği Devrimi — C/C++ Geliştiricileri İçin Değişen Kurallar | 2026-04-12 |
| [#54](https://github.com/mavrikant/mavrikant.github.io/pull/54) | Yeni blog yazısı: C'de Tanımsız Davranış (Undefined Behavior) | 2026-04-04 |
| [#51](https://github.com/mavrikant/mavrikant.github.io/pull/51) | Add blog post: MISRA C ve Statik Analiz | 2026-03-28 |
| [#50](https://github.com/mavrikant/mavrikant.github.io/pull/50) | Expand denormalize numbers and FTZ/DAZ section in float post | 2026-03-26 |

## Seçildi / Devam Eden

- **Python'da Çalışan Filtre Hedefte Neden Patlıyor? IIR Katsayı Kuantizasyonu** —
  dal: `post/2026-08-25-iir-katsayi-kuantizasyonu-kutup-gocu`,
  dosya: `_posts/2026-08-25-iir-katsayi-kuantizasyonu-kutup-gocu.md`,
  durum: PR açıldı (2026-08-25) — alan: sinyal işleme / sayısal gerçekleme.

## Reddedildi (bu çalıştırma)

- **Guardbanding ve uygunluk beyanı (JCGM 106 / ILAC-G8 / Z540.3)** — 2026-08-25 —
  gerekçe: yayındaki "Ölçüm Belirsizliği" yazısının *Örnek 3* bölümü TUR, PFA,
  guard band çarpanı ve ILAC-G8 vs Z540.3 farkını zaten işliyor. Anlamsal çakışma.
- **ARM CoreSight / ETM instruction trace** — 2026-08-25 — gerekçe: elde donanım
  yok; yazı doğrudan dokümantasyonun yeniden ifadesi olurdu (Bölüm 12 anti-pattern).
- **ARINC 429 anatomisi** — 2026-08-25 — gerekçe: açık PR'larda zaten üç "veri yolu
  anatomisi" yazısı var (#173 MIL-STD-1553B, #165 AFDX, #162 ARINC 653). Kalıp tekrarı.

## Fikir Havuzu (aday konular — gelecek çalıştırma için)

> Aşağıdaki adaylar yukarıdaki **57 açık PR** ve yayındaki yazılarla karşılaştırılarak
> filtrelenmelidir. Eski havuzun büyük kısmı artık açık PR'lara dönüşmüş durumda.

### Hâlâ boş görünen alanlar (yüksek öncelikli)

- [ ] **Sabit noktada limit cycle**: sıfır girişte sönmeyen salınım, ölü bant hesabı —
      bu yazının doğal devamı, alan: sinyal işleme
- [ ] **IIR bölüm sıralaması ve ölçekleme**: L2/L∞ norm ile taşma-gürültü dengesi
- [ ] **Deneysel: gerçek bir hata ayıklama seansı** — GDB + Renode üzerinde
- [ ] **DO-178C §7 konfigürasyon yönetimi**: CC1 vs CC2 kontrol kategorileri,
      SCI/SECI, hangi veri hangi kategoriye düşer — açık PR'larda hiç yok
- [ ] **Türetilmiş gereksinimler (derived requirements)** ve emniyet değerlendirmesine
      geri besleme — DO-178C'nin en yanlış anlaşılan kavramlarından
- [ ] **ARP4754A FDAL/IDAL tahsisi**: geliştirme güvence seviyesi nasıl atanır
- [ ] **CORDIC**: FPU'suz donanımda sin/cos/atan2, yakınsama ve kazanç sabiti
- [ ] **Robustness test tasarımı**: eşdeğerlik sınıfı, sınır değer, DO-178C 6.4.2.2
- [ ] **DO-333 formel yöntemler eki**: hangi objektif testle, hangisi analizle karşılanır

### Orta öncelikli

- [ ] FMEA pratikte; Fault Tree ile minimal cut set (#96 ile çakışma kontrolü şart)
- [ ] Deterministik build (#160 açık — çakışıyor, atla)
- [ ] ADS-B sinyal yapısı: PPM modülasyon, mesaj formatı
- [ ] FIR vs IIR: faz cevabı, hesaplama maliyeti, stabilite
- [ ] ECSS uzay yazılım standartları ailesi (alt-konulara bölünmeli)

## Notlar (bu çalıştırma — 2026-08-25)

- Defter 2026-05-21'den beri güncellenmemişti: 7 açık PR listeliyordu, gerçekte **57**
  var; yayındaki 5 yazı da eksikti. Bu çalıştırmada tamamı senkronize edildi.
- Seçilen konu **IIR katsayı kuantizasyonu**. Yayındaki hiçbir yazı ve açık hiçbir PR
  "IIR", "biquad" veya "kuantizasyon" geçmiyor (grep ile doğrulandı) — alan temiz.
- Son üç yayın: antikırılgan (sistem düşüncesi), coupling (yazılım tasarımı), Kalman
  (navigasyon/füzyon). Seçilen konu bu üçünden de farklı alt-alanda.
- Derinlik öğesi: **deney + benchmark**. Üç bağımsız yöntemle doğrulandı — Durand-Kerner
  kök bulma, kesin rasyonel aritmetikte Schur-Cohn testi, zaman düzleminde dürtü yanıtı.
  Kök bulucu ayrıca yeniden-çarpanlama ile doğrulandı (hata ~3e-11).
- "Neden zor bulunuyor" yanıtı: konu ders kitaplarında (Oppenheim, Proakis) *var* ama
  soyut duyarlılık türevleri olarak; pratik tarafta ise "SOS kullan" tavsiyesi
  gerekçesiz bir kural olarak dolaşıyor. İkisini birleştiren, sayı veren ve
  tekrar üretilebilir bir Türkçe kaynak yok. Ayrıca yaygın bir yanılgı çürütülüyor:
  "daha çok bit at" — 32 bit sabit nokta ve float32 ölçümde kararsız çıktı.
- Yayın kapısı: son yayın 2026-06-24, aradan 62 gün geçti; `min_yayin_araligi_gun = 2`
  fazlasıyla sağlandı. Yerel `bundle exec jekyll build` başarılı; tarayıcıda MathJax
  (34 container, 0 hata) ve Mermaid (SVG üretildi) doğrulandı.

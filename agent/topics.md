# Konu Defteri

> Otonom yazı ajanının kalıcı belleği. Her çalıştırmada okunur ve güncellenir.
> **Son tam senkronizasyon: 2026-08-31.** (Önceki senkronizasyon 2026-05-21'di;
> aradaki çalıştırmalar defteri güncellemeden PR açmış, bu yüzden aşağıdaki
> tablolar `_posts/` ve `gh pr list` çıktısından yeniden üretildi.)

## Yazıldı (yayında)

| Yazı | Tarih | Alan |
|---|---|---|
| Tümleşik Gereksinim Yönetimi | 2022-04-28 | sistem/gereksinim |
| Yazılım Sistem Mühendisliği | 2022-04-30 | sistem |
| Use Case Tuzakları | 2022-05-01 | gereksinim/analiz |
| Yazılım Proje Yönetimi Pratikleri | 2022-05-01 | proje yönetimi |
| Gereksinimler ve Test: Yedi Eksik Bağlantı | 2022-05-08 | gereksinim/test |
| Fonksiyonel Olmayan Yazılım Gereksinimleri | 2022-07-11 | gereksinim |
| CMake | 2022-07-19 | araçlar |
| Elektrik Kesintisinde Otomatik Açılış | 2022-08-15 | sistem |
| Recursively Delete a Specific Folder | 2022-09-11 | araçlar |
| Merge Files with FFmpeg | 2023-03-12 | araçlar |
| Türkiye'de Debugging Aşamaları | 2023-12-01 | kültür/mizah |
| Kayan Nokta Sayılarının Tehlikeleri | 2026-03-25 | gömülü/sayısal |
| Versiyon Kontrol: Git vs SVN vs ClearCase | 2026-03-25 | araçlar |
| MISRA C:2025 ile Neler Değişti | 2026-04-05 | standart/C |
| Yöneylem Araştırması Yöntemleri | 2026-04-14 | matematik/optimizasyon |
| Ölçüm Belirsizliği - GUM Annex F, NCSLI RP-12 | 2026-05-06 | metroloji |
| Kalibrasyon Zincirinin Tepesi | 2026-05-07 | metroloji |
| Renode ile Zynq7000 Simülasyonu | 2026-05-14 | gömülü/SoC |
| Bandpass Sampling | 2026-05-21 | RF/DSP |
| Sistem Mühendisliği Nedir | 2026-05-26 | sistem |
| Kalman Filtresi ve EKF | 2026-06-02 | navigasyon/füzyon |
| Coupling Dengesi | 2026-06-04 | yazılım tasarımı |
| Antikırılgan - Belirsizlikten Güç Alan Sistemler | 2026-06-24 | sistem/felsefe |

## Açık PR'lar (insan inceleme bekleniyor)

> **UYARI — birikme:** 2026-08-31 itibarıyla **60 açık PR** var ve bunların
> neredeyse tamamı bu ajanın açtığı yazı PR'ları. Merge kararı yalnızca insana
> ait olduğu için ajan bunları kapatamaz; ancak yeni konu seçerken bu listenin
> tamamı "işlenmiş" sayılmalıdır. Ayrıca aşağıdaki kümelerde **kendi içinde
> çakışan** PR'lar birikmiş durumda — inceleyen kişinin dikkatine:
>
> - `volatile` / C11 `_Atomic`: #134, #155, #156, #157, #159 (beş ayrı PR, aynı konu)
> - WCET analizi: #88, #98, #164 (üç ayrı PR)
> - Watchdog tasarım desenleri: #89, #161 (iki ayrı PR)
> - MISRA C: #51 ile yayındaki "MISRA C:2025" yazısı
> - Kalman filtresi: #103 ile yayındaki "Kalman Filtresi ve EKF" yazısı

| PR # | Başlık | Açılış |
|------|--------|--------|
| [#180](https://github.com/Mavrikant/mavrikant.github.io/pull/180) | INCOSE CSEP sertifikasyon yazısı | 2026-08-28 |
| [#179](https://github.com/Mavrikant/mavrikant.github.io/pull/179) | İki Flip-Flop Yeter mi? Senkronizatör MTBF'i ve Çok-Bitli CDC Tuzağı | 2026-08-27 |
| [#178](https://github.com/Mavrikant/mavrikant.github.io/pull/178) | Python'da Çalışan Filtre Hedefte Neden Patlıyor? IIR Katsayı Kuantizasyonu | 2026-08-25 |
| [#177](https://github.com/Mavrikant/mavrikant.github.io/pull/177) | chore(agent): konu defterini senkronize et — bu çalıştırmada yeni yazı yok | 2026-08-24 |
| [#176](https://github.com/Mavrikant/mavrikant.github.io/pull/176) | Kod Doğru, Veri Yanlış — DO-178C'de Parameter Data Item | 2026-08-24 |
| [#175](https://github.com/Mavrikant/mavrikant.github.io/pull/175) | Zynq-7000 ve S25FL512S — Güç Kesildiğinde QSPI Flash'ta Ne Kalır? | 2026-08-20 |
| [#174](https://github.com/Mavrikant/mavrikant.github.io/pull/174) | MTBF Bir Ömür Değildir — 10⁻⁹ Hedefinin Aritmetiği | 2026-08-19 |
| [#173](https://github.com/Mavrikant/mavrikant.github.io/pull/173) | MIL-STD-1553B Anatomisi — Manchester Kodlama, RT Zamanlaması ve Sessiz Bug'lar | 2026-08-18 |
| [#172](https://github.com/Mavrikant/mavrikant.github.io/pull/172) | CAST-32A'dan AC 20-193'e — Multicore Aviyonikte Karşılıklı Etki Analizi | 2026-07-30 |
| [#171](https://github.com/Mavrikant/mavrikant.github.io/pull/171) | Aviyonik Yazılımda `malloc` Yasak mı? — DO-178C, DO-332 Objektifleri ve TLSF | 2026-07-29 |
| [#170](https://github.com/Mavrikant/mavrikant.github.io/pull/170) | I/Q Örnekleme ve Analitik Sinyal — İki Kanal, Karmaşık Değerler ve Negatif Frekansın Sırrı | 2026-07-28 |
| [#169](https://github.com/Mavrikant/mavrikant.github.io/pull/169) | Rate Monotonic Scheduling — Liu-Layland Sınırından Response Time Analysis'e | 2026-07-27 |
| [#168](https://github.com/Mavrikant/mavrikant.github.io/pull/168) | DO-178C Data ve Control Coupling — MC/DC Bittikten Sonra Yarım Kalan Structural Coverage | 2026-07-26 |
| [#167](https://github.com/Mavrikant/mavrikant.github.io/pull/167) | RAIM — GPS Alıcısı Kendi Doğruluğunu Nasıl Denetler? (Least-Squares Residual, Chi-Square Test ve HPL) | 2026-07-25 |
| [#166](https://github.com/Mavrikant/mavrikant.github.io/pull/166) | C Bit-Field'ları Wire Format Değildir — Endianness, Padding ve Derleyici-Bağımlı Bit Sıralaması | 2026-07-22 |
| [#165](https://github.com/Mavrikant/mavrikant.github.io/pull/165) | AFDX (ARINC 664 P7) Anatomisi — Sanal Bağlantı, BAG ve Determinist Ethernet | 2026-07-14 |
| [#164](https://github.com/Mavrikant/mavrikant.github.io/pull/164) | WCET'i Neden Ölçemezsiniz — Cache, Ölçüm Kuyruğu ve DO-178C 6.3.4.f | 2026-07-13 |
| [#163](https://github.com/Mavrikant/mavrikant.github.io/pull/163) | Abstract Interpretation Pratikte — Interval Domain neyi kanıtlar, neyi kanıtlamaz? | 2026-07-12 |
| [#162](https://github.com/Mavrikant/mavrikant.github.io/pull/162) | ARINC 653 Anatomisi — Aviyonik RTOS'ta Zaman-Uzay Bölümleme ve Sağlık İzleme | 2026-07-11 |
| [#161](https://github.com/Mavrikant/mavrikant.github.io/pull/161) | Watchdog Tasarım Desenleri — Independent, Windowed, Deadman ve Sağlık İzleme | 2026-07-10 |
| [#160](https://github.com/Mavrikant/mavrikant.github.io/pull/160) | Deterministik Derleme — İki Build Slave Arasında Bit-Bit Aynı İkili ve DO-178C Kanıtı | 2026-07-08 |
| [#159](https://github.com/Mavrikant/mavrikant.github.io/pull/159) | volatile Yetmez — C'de eşzamanlılık, bellek modeli ve _Atomic | 2026-07-07 |
| [#158](https://github.com/Mavrikant/mavrikant.github.io/pull/158) | DO-330 Araç Nitelendirmesi — TQL Belirleme, Kriter Matrisi ve Gerçek Araçlar Üzerinden Karar Ağacı | 2026-07-06 |
| [#157](https://github.com/Mavrikant/mavrikant.github.io/pull/157) | volatile Yetmediğinde — Kesme, DMA ve Multicore'da Bellek Sıralaması | 2026-07-05 |
| [#156](https://github.com/Mavrikant/mavrikant.github.io/pull/156) | "volatile" ne değildir — C11 _Atomic ve ARM bellek modeli | 2026-07-05 |
| [#155](https://github.com/Mavrikant/mavrikant.github.io/pull/155) | 'volatile' Her Şeyi Çözmez: ISR Paylaşımı, C11 _Atomic ve ARM Bellek Modeli | 2026-07-03 |
| [#154](https://github.com/Mavrikant/mavrikant.github.io/pull/154) | chore(agent): sync topics ledger; no new post this run | 2026-06-25 |
| [#151](https://github.com/Mavrikant/mavrikant.github.io/pull/151) | `setjmp`/`longjmp` Neden DAL A'da Yasak? — Stack Unwind, MISRA C 21.4 ve Assembly Anatomisi | 2026-06-24 |
| [#150](https://github.com/Mavrikant/mavrikant.github.io/pull/150) | Yığın Taşması Sessiz Bir Katildir — Worst-Case Stack Analizi | 2026-06-24 |
| [#149](https://github.com/Mavrikant/mavrikant.github.io/pull/149) | Gerçek zamanlı sistemler hakkında blog yazısı ekle | 2026-06-24 |
| [#147](https://github.com/Mavrikant/mavrikant.github.io/pull/147) | Derleyici optimizasyonlarını elle yazmak (Zynq7000 + GCC, -O0) yazısı | 2026-06-19 |
| [#146](https://github.com/Mavrikant/mavrikant.github.io/pull/146) | Object Code Coverage — DAL A'da Derleyici Boşluğu (DO-178C §6.4.4.2.b) | 2026-06-19 |
| [#145](https://github.com/Mavrikant/mavrikant.github.io/pull/145) | Cortex-A Boot — Reset Vektöründen main()'e Gerçekten Ne Oluyor? | 2026-06-17 |
| [#135](https://github.com/Mavrikant/mavrikant.github.io/pull/135) | MPU vs MMU — ARM'da Donanım Tabanlı Bellek Korumasının Anatomisi | 2026-06-14 |
| [#134](https://github.com/Mavrikant/mavrikant.github.io/pull/134) | `volatile` Yetmez: C'de Eşzamanlılık, MMIO ve `_Atomic` | 2026-06-13 |
| [#129](https://github.com/Mavrikant/mavrikant.github.io/pull/129) | Allan Deviation — IMU Datasheet'inin Gizli Dilini Çözmek | 2026-06-11 |
| [#124](https://github.com/Mavrikant/mavrikant.github.io/pull/124) | Yüksek İrtifada Sessiz Hata — SEU, SECDED ECC ve Bellek Scrubbing | 2026-06-10 |
| [#122](https://github.com/Mavrikant/mavrikant.github.io/pull/122) | Endianness'in Üç Katmanı — ARM BE-8/BE-32, Bitfield Tuzakları ve 1553/429 | 2026-06-09 |
| [#121](https://github.com/Mavrikant/mavrikant.github.io/pull/121) | Lockstep CPU Mimarileri — Cortex-R5 DCLS, CCM-R5 ve DAL A Donanımı | 2026-06-08 |
| [#120](https://github.com/Mavrikant/mavrikant.github.io/pull/120) | Priority Inversion ve Mars Pathfinder — FreeRTOS'ta Yeniden Üretim | 2026-06-08 |
| [#119](https://github.com/Mavrikant/mavrikant.github.io/pull/119) | DMA ve Cache — Cortex-A9 / Zynq-7000 üzerinde sessiz veri bozulması | 2026-06-07 |
| [#118](https://github.com/Mavrikant/mavrikant.github.io/pull/118) | DO-326A ve ED-202A — Aviyonik Siber Güvenlik Sertifikasyonu | 2026-06-05 |
| [#114](https://github.com/Mavrikant/mavrikant.github.io/pull/114) | Sabit Nokta Aritmetik — FPU'suz Cortex-M0'da Q15 FIR Filtresi | 2026-06-04 |
| [#103](https://github.com/Mavrikant/mavrikant.github.io/pull/103) | Kalman Filtresinin Sessiz İraksaması — Joseph Form, Gözlemlenebilirlik ve Tutarlılık Testleri | 2026-06-01 |
| [#102](https://github.com/Mavrikant/mavrikant.github.io/pull/102) | ILS Anatomisi — Localizer 90/150 Hz DDM ve Glide Path Geometrisi | 2026-05-31 |
| [#101](https://github.com/Mavrikant/mavrikant.github.io/pull/101) | ARM GIC — Cortex-A Kesme Denetleyicisinin İçine Bakmak | 2026-05-30 |
| [#100](https://github.com/Mavrikant/mavrikant.github.io/pull/100) | `volatile` Yetmediğinde — Zynq-7000 Üzerinde C11 `_Atomic`, SCU ve Bellek Bariyerleri | 2026-05-29 |
| [#99](https://github.com/Mavrikant/mavrikant.github.io/pull/99) | Dört Aşamalı Veri Analitiği — Mühendislikte Tanımlayıcıdan Kuralcıya | 2026-05-28 |
| [#98](https://github.com/Mavrikant/mavrikant.github.io/pull/98) | WCET Analizi — Statik Yöntemler, Ölçüm Tabanlı Yaklaşımlar ve Cache'in Karanlık Tarafı | 2026-05-28 |
| [#96](https://github.com/Mavrikant/mavrikant.github.io/pull/96) | Fault Tree Analizi ve Minimal Cut Set Hesabı | 2026-05-27 |
| [#90](https://github.com/Mavrikant/mavrikant.github.io/pull/90) | Linker Script Anatomisi — ARM Bare-Metal için Bir .ld Dosyası Satır Satır | 2026-05-26 |
| [#89](https://github.com/Mavrikant/mavrikant.github.io/pull/89) | Watchdog Timer Tasarım Desenleri — Tek-Stage Yanılgısından Rendezvous Pattern'e | 2026-05-24 |
| [#88](https://github.com/Mavrikant/mavrikant.github.io/pull/88) | WCET Analizi: Statik mi, Ölçüm mü, Hibrit mi? | 2026-05-23 |
| [#79](https://github.com/Mavrikant/mavrikant.github.io/pull/79) | CRC Polinom Seçimi ve Hamming Mesafesi | 2026-05-20 |
| [#78](https://github.com/Mavrikant/mavrikant.github.io/pull/78) | VOR Nasıl Çalışır? 30 Hz Faz Karşılaştırması ve DVOR Geometrisi | 2026-05-19 |
| [#77](https://github.com/Mavrikant/mavrikant.github.io/pull/77) | MC/DC Kapsama — DO-178C DAL A'da Modified Condition/Decision Coverage | 2026-05-17 |
| [#67](https://github.com/Mavrikant/mavrikant.github.io/pull/67) | Bellek Güvenliği Devrimi — C/C++ Geliştiricileri İçin Değişen Kurallar | 2026-04-12 |
| [#54](https://github.com/Mavrikant/mavrikant.github.io/pull/54) | Yeni blog yazısı: C'de Tanımsız Davranış (Undefined Behavior) | 2026-04-04 |
| [#51](https://github.com/Mavrikant/mavrikant.github.io/pull/51) | Add blog post: MISRA C ve Statik Analiz | 2026-03-28 |
| [#50](https://github.com/Mavrikant/mavrikant.github.io/pull/50) | Expand denormalize numbers and FTZ/DAZ section in float post | 2026-03-26 |

## Seçildi / Devam Eden

- **Debugger Takınca Bug Kayboluyor: Gömülü Sistemlerde Gözlemci Etkisi** —
  dal: `post/2026-08-31-gozlemci-etkisi-halt-mode-debug`,
  dosya: `_posts/2026-08-31-gozlemci-etkisi-halt-mode-debug.md`,
  araştırma: `agent/research/2026-08-31-gozlemci-etkisi-halt-mode-debug.md`,
  durum: PR açıldı (2026-08-31) — alan: gömülü/hata ayıklama araçları.

## Reddedildi (2026-08-31 çalıştırması)

- **ARINC 429 anatomisi** — 2026-08-31 — veri yolu alanı doygun: #173 (MIL-STD-1553B)
  ve #165 (AFDX/ARINC 664) zaten açık PR olarak bekliyor.
- **INS/GNSS gevşek-sıkı kuplaj mimarileri** — 2026-08-31 — navigasyon alanı doygun:
  #103 ve yayındaki Kalman yazısı, #167 (RAIM), #129 (Allan deviation) mevcut.
- **MIL-HDBK-217 vs FIDES güvenilirlik tahmini** — 2026-08-31 — #174 (MTBF bir ömür
  değildir) ile anlamsal çakışma riski yüksek.
- **Osiloskop probu yükleme etkisi ve yükselme zamanı bütçesi** — 2026-08-31 —
  reddedilmedi, havuzda tutuldu; seçilen konuyla aynı "ölçüm aracının ölçtüğü şeyi
  bozması" temasını paylaşıyor, ardışık iki yazıda tekrar olurdu.

## Alan rotasyonu notu

Son üç yazı PR'ının alt-alanları: #179 dijital tasarım/CDC, #178 DSP/filtre,
#176 sertifikasyon/DO-178C. Bu çalıştırmada seçilen alan (gömülü hata ayıklama
altyapısı — CoreSight, FPB, DWT, ITM) üçünden de farklı.

## Fikir Havuzu (aday konular)

> Aşağıdakiler açık PR listesiyle karşılaştırılıp **hâlâ işlenmemiş** olduğu
> doğrulanmış adaylardır. Havuzun eski sürümündeki maddelerin çoğu artık açık PR
> olduğu için listeden çıkarıldı.

### Yüksek öncelikli

- [ ] **Osiloskop probu yükleme etkisi ve yükselme zamanı bütçesi** — alan: metroloji/donanım —
      `t_r ≈ 0.35/BW`, RSS bütçesi, ground lead endüktansıyla oluşan çınlama frekansı
- [ ] **JTAG tarama zinciri ve boundary scan** — alan: donanım/test — IEEE 1149.1 durum
      makinesi, TAP, üretim testinde gerçek kullanım
- [ ] **GPS zamanı, UTC ve artık saniye** — alan: navigasyon/zaman — gömülü sistemlerde
      artık saniye kaynaklı gerçek hata sınıfları
- [ ] **ARP4754A FDAL/IDAL tahsisi** — alan: sertifikasyon — geliştirme güvence seviyesi
      dağıtımı, mimari azaltma ile DAL düşürme
- [ ] **FMEA/FMECA kritiklik sayısı hesabı** — alan: güvenilirlik — #96'daki FTA yazısının
      tamamlayıcısı, MIL-STD-1629A yaklaşımı
- [ ] **Fixed-priority vs EDF çizelgeleme** — alan: gerçek zamanlı — #169 rate monotonic'i
      tamamlar ama farklı bir teorik çerçeve

### Orta öncelikli

- [ ] Statik analizin yakaladığı ve kaçırdığı hata sınıfları, somut C örnekleriyle
- [ ] ECSS yazılım standartları ailesi (alt konulara bölünmeli)
- [ ] DO-254 donanım sertifikasyonu
- [ ] ADS-B sinyal yapısı ve PPM modülasyonu
- [ ] FIR vs IIR faz cevabı ve grup gecikmesi
- [ ] İzlenebilirlik matrisi kurma pratiği

## Notlar (2026-08-31 çalıştırması)

- **Yayın kapısı:** son yayınlanan yazı 2026-06-24; `min_yayin_araligi_gun = 2` şartı
  fazlasıyla sağlanıyor. Konu, yayındaki hiçbir yazıyla ve 60 açık PR'ın hiçbiriyle
  anlamsal olarak çakışmıyor. Yayındaki "Türkiye'de Debugging Aşamaları" bir mizah
  yazısı; teknik örtüşme yok. Renode yazısı (2026-05-14) JTAG'e yalnızca değiniyor ve
  "simülasyonda hardware watchpoint sayısı sınırsızdır" diyor — bu yazı tam olarak o
  cümlenin gerçek donanımdaki karşılığını açıyor, tamamlayıcı.
- **Derinlik öğesi:** yerel deney + assembly incelemesi + standart/errata yorumu.
  `arm-none-eabi-gcc 15.2.0` ile iki program derlenip disassemble edildi; FP_CTRL
  çözümlemesi OpenOCD kaynağıyla karşılaştırılarak doğrulandı; ARM erratum 702596
  birincil kaynaktan okundu.
- **"Neden zor bulunuyor":** bilgi üç ayrı yerde dağınık — çekirdek TRM'leri (breakpoint
  bütçeleri), errata notice'ları (adımlama hataları) ve debugger kaynak kodu (gerçek
  davranış). Türkçe kaynaklarda konu neredeyse tamamen "GDB komut listesi" seviyesinde
  ele alınıyor; gözlemci etkisinin donanım mekanizması işlenmiyor.
- **Doğrulanamayan ve yazıya alınmayan:** Zynq-7000 ETB kapasitesinin tam sayısı;
  UG585'in erişilebilir bir kopyası bulunamadı, sayı verilmedi.

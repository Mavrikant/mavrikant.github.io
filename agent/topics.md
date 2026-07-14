# Konu Defteri

> Otonom yazı ajanının kalıcı belleği. Her çalıştırmada okunur ve güncellenir.

## Yazıldı (yayında, master'a merge edilmiş)

- [x] Tümleşik Gereksinim Yönetimi — 2022-04-28 — alan: sistem/gereksinim
- [x] Yazılım Sistem Mühendisliği — 2022-04-29 — alan: sistem
- [x] Use Case Tuzakları — 2022-05-01 — alan: gereksinim/analiz
- [x] Yazılım Proje Yönetimi Pratikleri — 2022-05-03 — alan: proje yönetimi
- [x] Gereksinimler ve Test: Yedi Eksik Bağlantı — 2022-05-08 — alan: gereksinim/test
- [x] Fonksiyonel Olmayan Yazılım Gereksinimleri — 2022-07-11 — alan: gereksinim
- [x] CMake — 2022-07-20 — alan: araçlar
- [x] Elektrik Kesintisinde Otomatik Açılış — 2022-08-15 — alan: sistem
- [x] Recursively Delete a Specific Folder — 2022-09-11 — alan: araçlar
- [x] Merge Files with FFmpeg — 2023-03-12 — alan: araçlar
- [x] Türkiye'de Debugging Aşamaları — 2023-12-01 — alan: kültür/proje
- [x] Kayan Nokta Sayılarının Tehlikeleri — 2026-03-25 — alan: gömülü/sayısal
- [x] Versiyon Kontrol: Git vs SVN vs ClearCase — 2026-03-25 — alan: araçlar
- [x] MISRA C:2025 ile Neler Değişti — 2026-04-05 — alan: standart/C
- [x] Yöneylem Araştırması Yöntemleri — 2026-04-14 — alan: matematik/optimizasyon
- [x] Ölçüm Belirsizliği (GUM Annex F + NCSLI RP-12) — 2026-05-06 — alan: metroloji
- [x] Kalibrasyon Zincirinin Tepesi (Birincil Standartlar) — 2026-05-07 — alan: metroloji
- [x] Renode ile Zynq7000 Simülasyonu — 2026-05-14 — alan: gömülü/SoC
- [x] Bandpass Sampling — 2026-05-21 — alan: RF/DSP
- [x] Sistem Mühendisliği Nedir? — 2026-05-26 — alan: sistem
- [x] Kalman Filtresi ve EKF — 2026-06-02 — alan: navigasyon/füzyon
- [x] Coupling'i Dengelemek — 2026-06-04 — alan: yazılım tasarımı
- [x] Antikırılgan — 2026-06-24 — alan: sistem/felsefe

## Açık PR'lar (2026-07-14 itibariyle — insan inceleme bekleniyor)

> **NOT — sağlıksız birikinti**: 30+ açık PR birikmiş ve konu tekrarları var.
> Özellikle "volatile / bellek modeli" konusunda **altı ayrı PR** (#100, #134, #155,
> #156, #157, #159), "WCET" için üç PR (#88, #98, #164), "watchdog" için iki PR
> (#89, #161) açık. İnceleyen kişinin bu tekrarları konsolide etmesi gerekir.
> Ajan bu çalıştırmada bu konuların hiçbirinden yeni PR açmamıştır.

| PR # | Başlık (kısa) | Alan | Not |
|------|---------------|------|-----|
| #164 | WCET / cache / DO-178C | gerçek zamanlı | WCET tekrar (#88, #98) |
| #163 | Abstract Interpretation — Interval Domain | statik analiz | — |
| #162 | ARINC 653 Anatomisi | aviyonik RTOS | — |
| #161 | Watchdog Tasarım Desenleri | güvenilirlik | Watchdog tekrar (#89) |
| #160 | Deterministik Derleme | araçlar/sertifikasyon | — |
| #159 | volatile Yetmez — bellek modeli & _Atomic | C/eşzamanlılık | volatile tekrar (×5!) |
| #158 | DO-330 TQL Belirleme | sertifikasyon | — |
| #157 | volatile Yetmediğinde — Kesme, DMA, Multicore | C/eşzamanlılık | volatile tekrar |
| #156 | "volatile" ne değildir | C/eşzamanlılık | volatile tekrar |
| #155 | volatile Her Şeyi Çözmez | C/eşzamanlılık | volatile tekrar |
| #154 | chore: ledger sync (post yok) | agent | — |
| #151 | setjmp/longjmp neden DAL A'da yasak | C/sertifikasyon | — |
| #150 | Worst-Case Stack Analizi | güvenilirlik | — |
| #149 | Gerçek zamanlı sistemler (DRAFT) | gerçek zamanlı | — |
| #147 | Derleyici opt. elle (DRAFT) | derleyici | — |
| #146 | Object Code Coverage DO-178C DAL A | sertifikasyon | — |
| #145 | Cortex-A Boot — reset'ten main()'e | ARM/gömülü | — |
| #135 | MPU vs MMU — ARM bellek koruması | ARM | — |
| #134 | volatile Yetmez — MMIO, _Atomic | C/eşzamanlılık | volatile tekrar |
| #129 | Allan Deviation — IMU | navigasyon/sensör | — |
| #124 | SEU, SECDED ECC, Bellek Scrubbing | güvenilirlik | — |
| #122 | Endianness — ARM BE-8/BE-32, 1553/429 | ARM/gömülü | — |
| #121 | Lockstep CPU — Cortex-R5 DCLS | ARM/güvenilirlik | — |
| #120 | Priority Inversion — Mars Pathfinder | RTOS | — |
| #119 | DMA ve Cache — Cortex-A9/Zynq-7000 | ARM | — |
| #118 | DO-326A / ED-202A siber güvenlik | sertifikasyon | — |
| #114 | Sabit Nokta Q15 FIR — Cortex-M0 | gömülü/DSP | — |
| #103 | Kalman iraksama — Joseph form | navigasyon | — |
| #102 | ILS Anatomi — localizer/glide path | navigasyon | — |
| #101 | ARM GIC | ARM | — |
| #100 | volatile Yetmediğinde — Zynq _Atomic | C/eşzamanlılık | volatile tekrar |
| #99  | Dört Aşamalı Veri Analitiği | veri | — |
| #98  | WCET Analizi — statik/ölçüm | gerçek zamanlı | WCET tekrar |
| #96  | Fault Tree — minimal cut set | güvenilirlik | — |
| #90  | Linker Script Anatomisi — ARM bare-metal | gömülü | — |
| #89  | Watchdog Tasarım Desenleri | güvenilirlik | Watchdog tekrar |
| #88  | WCET Statik mi Ölçüm mü Hibrit mi | gerçek zamanlı | WCET tekrar |
| #79  | CRC Polinom Seçimi ve Hamming Mesafesi | yazılım zanaatı | — |
| #78  | VOR — 30 Hz faz karşılaştırması | navigasyon | — |
| #77  | MC/DC Kapsama DO-178C DAL A | sertifikasyon | — |
| #67  | Bellek Güvenliği Devrimi — C/C++, Rust | güvenlik | — |
| #54  | C'de Undefined Behavior | C/derleyici | — |
| #51  | MISRA C ve Statik Analiz | standart | Yayındaki #69 ile çakışıyor |
| #50  | Float Denormalize FTZ/DAZ | gömülü/sayısal | — |

## Seçildi / Devam Eden

- **AFDX (ARINC 664 P7) Anatomisi: Sanal Bağlantı, BAG ve Determinist Ethernet** —
  dal: `post/2026-07-14-afdx-arinc-664-anatomi`,
  dosya: `_posts/2026-07-14-afdx-arinc-664-anatomi.md`,
  durum: bu çalıştırmada PR açılacak — alan: aviyonik/veri-yolları.

## Reddedildi (bu çalıştırma)

- **Volatile / _Atomic** — havuzda öncelikliydi, ama açık **6 PR'da** aynı konu
  bekliyor. Yeni PR daha fazla gürültü yaratır.
- **WCET analizi** — üç PR açık (#88, #98, #164). Konsolidasyon insan işi.
- **Watchdog tasarım desenleri** — iki PR açık (#89, #161).
- **Cortex-A boot**, **Linker script**, **GIC**, **MPU vs MMU**, **MC/DC**, **CRC
  polinomu**, **VOR**, **ILS**, **Sabit nokta Q15**, **ARINC 653**, **Endianness**,
  **DMA cache**, **Lockstep**, **Priority inversion**, **Fault Tree**, **DO-330**,
  **DO-326A**, **Object code coverage**, **setjmp/longjmp**, **Worst-case stack**,
  **Deterministik derleme**, **Kalman iraksama**, **Allan deviation**, **SEU/SECDED**,
  **Abstract interpretation**, **Bellek güvenliği (Rust)**, **Undefined behavior** —
  hepsi zaten açık PR'da. Ajan onların önüne yenisini eklemez.

## Fikir Havuzu (henüz PR'a girmemiş, gelecek çalıştırma için)

### Yüksek öncelikli (temiz boşluk + kalıcı değer)

- [ ] **MIL-STD-1553B Anatomisi** — Manchester kodlama, komut/yanıt zamanlaması,
      Bus Controller rotasyonu, dual redundant bus, saha örneği. Alan: aviyonik/
      veri-yolları. Kamuya açık standart; yazarın projesinden değil, açık literatürden.
- [ ] **ARINC-429 Anatomisi** — 32-bit kelime formatı, Label/SDI/SSM alanları,
      12.5/100 kbps hızları, tek yönlü noktadan noktaya. Alan: aviyonik/veri-yolları.
- [ ] **FMEA Pratikte — bir aviyonik alt-sistem üzerinden adım adım** — RPN
      hesabı, gerçek örnek, common cause analysis. Alan: güvenilirlik.
- [ ] **ARP4754A — Uçak Seviyesi Geliştirme Süreci** — DO-178C ve DO-254 ile
      hiyerarşi. Alan: sertifikasyon.
- [ ] **IQ Örnekleme ve Karmaşık Sinyaller** — neden 2 kanal, neden negatif
      frekans, SDR temelleri. Alan: RF/SDR. Bandpass sampling yazısının devamı.
- [ ] **ADS-B Sinyal Yapısı** — PPM modülasyon, Extended Squitter formatı, DF17.
      Alan: navigasyon/RF.
- [ ] **FIR vs IIR Filtre Tasarımı** — faz cevabı, kutup-sıfır analizi, hesaplama
      maliyeti, gömülü uygulama. Alan: DSP.
- [ ] **Radyasyona Dayanıklı Yazılım: TMR, Scrubbing, MBU** — SEU'nun ötesinde,
      voter tasarımı, timing considerations. Alan: güvenilirlik/uzay.
      (#124 SEU/SECDED'i işledi; bu farklı bir katman.)
- [ ] **RTCA DO-160G Çevresel Testler — Yazılım Perspektifi** — DO-160 test
      seviyeleri, HIRF, ışın etkileri, sıcaklık dalgalanmaları. Alan: sertifikasyon.

### Orta öncelikli (kovaya alındı)

- [ ] TSN vs AFDX — 802.1Qbv Time-Aware Shaper karşılaştırması (AFDX yazısının devamı)
- [ ] SysML — sistem mühendisliği modelleme dili
- [ ] Hardware-in-the-Loop (HIL) simülasyonu — kurulum, test tasarımı
- [ ] Model-Based Development ve DO-331 (DO-178C model tabanlı ek)
- [ ] SEE (Single Event Effects) test kampanyaları
- [ ] IEEE 1588 PTP — aviyonik ağda zaman senkronizasyonu
- [ ] Software Configuration Management — DO-178C 7. bölüm perspektifi
- [ ] JEDEC standartları ve gömülü belleklerde radyasyon dayanımı

### Düşük öncelikli / sonraya bırak

- [ ] ECSS uzay yazılım standartları ailesi (geniş, alt-konulara bölünmeli)
- [ ] DO-254 donanım sertifikasyonu (yazarın uzmanlığı ağırlıklı yazılım tarafında)
- [ ] İzlenebilirlik matrisi (klasik konu, derinlik çıkarmak zor)

## Notlar (bu çalıştırma — 2026-07-14)

- **AFDX** seçildi (alan: aviyonik/veri-yolları). Ne mevcut yazılarda ne de 30+ açık
  PR'da bu konuyu ele alan bir çalışma var. Son üç yayınlanan yazı (antikırılgan/
  sistem-felsefe, coupling/yazılım-tasarımı, Kalman/nav-sensör-füzyon) ile alan
  rotasyonu da uygun.
- **Ledger drift önemliydi**: önceki "Yazıldı" listesi Renode'da (2026-05-14) donmuştu;
  gerçekte 5 yeni yazı daha yayında (bandpass, sistem-müh, Kalman, coupling,
  antikırılgan). Şimdi senkronlandı.
- **Açık PR birikintisi kritik boyutta**: 40+ açık PR, en az 6 tanesi aynı volatile
  konusunu farklı açılardan tekrar ediyor. Ajan bu duruma yeni volatile/WCET/
  watchdog PR'ı **eklemedi**. İnceleyen kişinin öncelik konsolidasyon yapmak.
- Konu novelty gerekçesi (Bölüm 8): "AFDX iyi Türkçe kaynak neden zor bulunur?" —
  standardın kendisi (ARINC 664 P7) ARINC / SAE ITC üzerinden ücretlidir; akademik
  literatür (Network Calculus, Bauer/Scharbarg makaleleri) İngilizcedir ve
  Airbus/Boeing üretici dokümantasyonu genelde kısıtlıdır. Türkçe kaynaklar
  yüzeysel "Ethernet üzerinden aviyonik" tanıtımları düzeyinde kalır; BAG, VL,
  Lmax, jitter matematiği gibi çekirdek kavramların derinlemesine anlatımı yok
  gibidir.
- Yayın kapısı: (1) son yayın 2026-06-24 → 20 gün geçti, `min=2` fazlasıyla
  sağlandı; (2) taslak öz-denetimden geçti (aşağıda); (3) 0 çakışma.
- Yayın akışı yalnızca **PR**; ajan merge etmez, onaylamaz, kapatmaz.

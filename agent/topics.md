# Konu Defteri

> Otonom yazı ajanının kalıcı belleği. Her çalıştırmada okunur ve güncellenir.

## Yazıldı (yayında)

- [x] Tümleşik Gereksinim Yönetimi — 2022-04-28 — alan: sistem/gereksinim
- [x] Yazılım Sistem Mühendisliği — 2022-04-30 — alan: sistem
- [x] Use Case Tuzakları — 2022-05-01 — alan: gereksinim/analiz
- [x] Yazılım Proje Yönetimi Pratikleri — 2022-05-01 — alan: proje yönetimi
- [x] Gereksinimler ve Test: Yedi Eksik Bağlantı — 2022-05-08 — alan: gereksinim/test
- [x] Fonksiyonel Olmayan Yazılım Gereksinimleri — 2022-07-11 — alan: gereksinim
- [x] CMake — 2022-07-19 — alan: araçlar
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
- [x] Sistem Mühendisliği Nedir — 2026-05-26 — alan: sistem
- [x] Kalman Filtresi ve EKF — 2026-06-02 — alan: navigasyon/füzyon
- [x] Coupling'i Dengelemek — 2026-06-04 — alan: yazılım tasarımı
- [x] Antikırılgan — 2026-06-24 — alan: sistem/felsefe

## Açık PR'lar (insan inceleme bekleniyor) — 2026-07-06 anlık görüntüsü

Uzun bir insan-inceleme kuyruğu birikmiş (30+ PR). Bu çalıştırmada ajan ayrı bir
konu seçti; aşağıdaki PR'lar açık kalmaya devam ediyor. `volatile / _Atomic /
memory barriers` konusu 4 farklı PR'da varyantlar hâlinde açık (#100, #134, #155,
#156, #157) — inceleyen kişinin bir tanesini seçip diğerlerini kapatması yerinde
olur.

| PR # | Konu özeti | Alan |
|------|-----------|------|
| #157 | volatile Yetmediğinde — Kesme, DMA, Multicore | C/eşzamanlılık |
| #156 | "volatile" ne değildir — C11 _Atomic, ARM bellek modeli | C/eşzamanlılık |
| #155 | 'volatile' Her Şeyi Çözmez | C/eşzamanlılık |
| #154 | chore(agent): ledger sync | (chore) |
| #151 | setjmp/longjmp DAL A'da neden yasak | sertifikasyon |
| #150 | Yığın Taşması — Worst-Case Stack Analizi | gerçek zamanlı |
| #149 | Gerçek zamanlı sistemler | RTOS |
| #147 | GCC -O0 optimizasyonlarını elle yazmak (Zynq7000) | derleyici |
| #146 | Object Code Coverage — DAL A | sertifikasyon |
| #145 | Cortex-A Boot — reset vektöründen main()'e | gömülü/SoC |
| #135 | MPU vs MMU — ARM bellek koruması | ARM |
| #134 | volatile Yetmez — C11 _Atomic | C/eşzamanlılık |
| #129 | Allan Deviation — IMU karakterizasyon | navigasyon/DSP |
| #124 | SEU, SECDED ECC, Bellek Scrubbing | güvenilirlik |
| #122 | Endianness — ARM BE-8/BE-32, 1553/429 | ARM/protokol |
| #121 | Lockstep CPU — Cortex-R5 DCLS | ARM/DAL A |
| #120 | Priority Inversion — Mars Pathfinder | RTOS |
| #119 | DMA ve Cache — Cortex-A9/Zynq-7000 | ARM |
| #118 | DO-326A / ED-202A — Aviyonik Siber Güvenlik | sertifikasyon |
| #114 | Sabit Nokta — Cortex-M0 Q15 FIR | DSP/gömülü |
| #103 | Kalman Sessiz İraksama — Joseph Form | navigasyon |
| #102 | ILS Anatomisi — Localizer/Glide Path | navigasyon |
| #101 | ARM GIC — Cortex-A Kesme Denetleyicisi | ARM |
| #100 | volatile Yetmediğinde — Zynq-7000 | C/eşzamanlılık |
| #99 | Dört Aşamalı Veri Analitiği | veri |
| #98 | WCET — statik, ölçüm, cache | gerçek zamanlı |
| #96 | Fault Tree Analizi + Minimal Cut Set | emniyet |
| #90 | Linker Script Anatomisi — bare-metal .ld | gömülü |
| #89 | Watchdog Timer Tasarım Desenleri | güvenilirlik |
| #88 | WCET — statik/ölçüm/hibrit | gerçek zamanlı |
| #79 | CRC Polinom Seçimi + Hamming Mesafesi | hata tespiti |
| #78 | VOR — 30 Hz Faz Karşılaştırması | navigasyon |
| #77 | MC/DC Kapsama — DO-178C DAL A | sertifikasyon |
| #67 | Bellek Güvenliği Devrimi — C/C++/Rust | güvenlik |
| #54 | C'de Tanımsız Davranış (UB) | C/derleyici |
| #51 | MISRA C ve Statik Analiz | standart/C |
| #50 | FTZ/DAZ float denormal genişletme | gömülü/sayısal |

## Seçildi / Devam Eden (bu çalıştırma — 2026-07-06)

- **DO-330 Araç Nitelendirmesi: TQL Belirleme, Kriter Matrisi ve Gerçek Araçlar
  Üzerinden Karar Ağacı** —
  dal: `post/2026-07-06-do-330-arac-nitelendirmesi-tql-belirleme`,
  dosya: `_posts/2026-07-06-do-330-arac-nitelendirmesi-tql-belirleme.md`,
  durum: PR açıldı — alan: sertifikasyon/DO-330.

## Reddedildi (bu çalıştırma)

- **volatile / _Atomic / memory barrier** varyantları — 5 açık PR var (#100, #134,
  #155, #156, #157). Anlamsal örtüşme kesinleşmiş; yeni bir varyant açmak
  değersizdir.
- **Linker script anatomisi** (#90 açık), **Watchdog tasarım desenleri** (#89 açık),
  **Cortex-A boot** (#145), **MPU vs MMU** (#135), **ARM GIC** (#101),
  **Fixed-point Q15** (#114), **DMA/cache** (#119), **Endianness** (#122),
  **Lockstep CPU** (#121), **SEU/SECDED** (#124), **Priority inversion** (#120),
  **CRC polinom** (#79), **VOR** (#78), **MC/DC** (#77), **WCET** (#88, #98),
  **ILS** (#102), **Fault Tree** (#96) — hepsi açık PR olarak beklediği için
  yeniden yazılmadı.

## Fikir Havuzu (gelecek çalıştırma için — hâlâ açık PR'sı olmayanlar)

Aşağıdaki adaylar mevcut yayınlar + açık PR'larla anlamsal örtüşmüyor. Faz 2'de
tekrar değerlendirilmesi gerekir.

### Yüksek öncelikli (kalıcı değer + Türkçe boşluk)

- [ ] **Frama-C ve ACSL ile emniyet-kritik C fonksiyonu doğrulaması** —
      alan: formel doğrulama — WP plugin, gerçek fonksiyon örneği + goal analizi
- [ ] **ARP4754A — Sistem geliştirme süreci ve IDAL tahsisi** —
      alan: sertifikasyon (sistem seviyesi)
- [ ] **DO-278A — Yer sistemleri için CNS/ATM yazılım sertifikasyonu** —
      alan: sertifikasyon (yer)
- [ ] **DO-254 — Donanım sertifikasyonu (kısa özet)** — alan: donanım/sertifikasyon
- [ ] **Data coupling ve control coupling analizi — DO-178C §6.4.4.2.d** —
      alan: sertifikasyon — coverage yerine bağımlılık analizi
- [ ] **FMEA/FMECA pratikte** — alan: emniyet — gerçek alt-sistem üzerinden RPN
- [ ] **TMR (Triple Modular Redundancy) — yazılım vs donanım oylama** —
      alan: güvenilirlik
- [ ] **Interrupt latency ölçümü — Cortex-M4 vs Cortex-M7 farkları** —
      alan: gerçek zamanlı/ARM — WCET dışında bir düzey
- [ ] **JTAG/SWD/DAP mimarisi** — alan: donanım/debug altyapısı
- [ ] **ELF ve DWARF — gömülü coredump ve debug info anatomisi** —
      alan: araçlar/gömülü
- [ ] **ADS-B sinyal yapısı — DF17 mesaj formatı, PPM modülasyonu** —
      alan: navigasyon/RF
- [ ] **FIR vs IIR — faz cevabı, stabilite, hesaplama maliyeti** —
      alan: DSP (Bandpass Sampling ve Q15 FIR yazılarını tamamlayıcı)
- [ ] **PSAC, SDP, SVP, SCMP — DO-178C plan doküman haritası** —
      alan: sertifikasyon süreç
- [ ] **Deterministik/Reproducible build — SOURCE_DATE_EPOCH, embedded firmware** —
      alan: araçlar/gömülü
- [ ] **BSS clearing ve .data init — startup kodu anatomisi (Cortex-M)** —
      alan: gömülü
- [ ] **Cache coherency & MESI — Cortex-A SMP, CCI-400/CMN, PoU/PoC** —
      alan: ARM/multicore (DMA/cache #119'dan farklı odak)
- [ ] **AF447 kaza analizi — pitot, ADR, otopilot geçişleri** —
      alan: aviyonik olay analizi

### Orta öncelikli (kovaya alındı)

- [ ] Ada / SPARK aviyonikte
- [ ] Simulink Coder vs SCADE KCG karşılaştırması
- [ ] Formel doğrulama — CBMC ile bounded model checking
- [ ] Stack canaries ve control flow integrity (gömülü)
- [ ] NOR vs NAND flash — wear leveling, secure boot
- [ ] Linux için real-time yamaları (PREEMPT_RT) — havacılık dışı ama ilgili
- [ ] Havacılık için Airborne Cybersecurity — DO-355, DO-356A
- [ ] IEEE 754 uç durumlar — NaN payload, sinyal NaN

## Notlar (bu çalıştırma — 2026-07-06)

- **DO-330 Tool Qualification** seçildi (alan: sertifikasyon). Yayın kapısı:
  son yayın 2026-06-24 (Antikırılgan), min_yayin_araligi_gun=2 → 12 gün sağlandı.
- **PR backlog uyarısı:** 30+ açık PR var. Otonom ajan yayın akışına devam
  ediyor ama insan inceleme dip taşacak durumda. En kritik gözlem: `volatile`
  konusunda 5 varyant açık PR — inceleyen kişinin bir tanesini seçip diğerlerini
  kapatması gerekiyor.
- **Alan rotasyonu:** Son 3 yayın (Antikırılgan sistem/felsefe, Coupling yazılım
  tasarımı, Kalman navigasyon) sertifikasyon alanından hepsiyle farklı. DO-330
  temiz rotasyon getiriyor.
- **"Bu konuyu bulmak neden zor" yanıtı:** DO-330 standart metni ücretli;
  Türkçe kaynaklarda TQL matrisi ve kriter ayrımı neredeyse hiç işlenmemiş.
  Sektörde COTS satıcı beyaz belgeleri (LDRA, Rapita, TASKING) İngilizce
  hâkim; bu yazının somut *gerçek araç → kriter → TQL* haritası eşdeğer bir
  Türkçe kaynakta yok.
- **LLM asistan bölümü** kullanıcının feedback tercihine göre işlendi:
  Böckeler/Fowler, Willison, Karpathy referansları; sertifikasyon çerçevesinde
  onboard ML tartışması yerine geliştirme iş akışı odağı; Türkiye pratik seçenek
  listesinde yalnızca yerli/AB-yakını isimler.

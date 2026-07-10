# Konu Defteri

> Otonom yazı ajanının kalıcı belleği. Her çalıştırmada okunur ve güncellenir.

## Yazıldı (yayında)

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
- [x] Sistem Mühendisliği Nedir — 2026-05-26 — alan: sistem
- [x] Kalman Filtresi ve EKF — 2026-06-02 — alan: navigasyon/füzyon
- [x] Coupling Dengesi — 2026-06-04 — alan: yazılım tasarımı
- [x] Antikırılgan (Antifragile) — 2026-06-24 — alan: sistem/felsefe
- [x] Watchdog Tasarım Desenleri — 2026-07-10 — alan: güvenilirlik/gömülü **(bu çalıştırma)**

## Açık PR'lar (insan inceleme bekleniyor)

Backlog büyüdü (2026-07-10 itibariyle 15+ açık PR); tümü GitHub'da
`mavrikant/mavrikant.github.io` üzerinde. Kritik gözlem: **volatile / C bellek modeli /
_Atomic** konusu için beş ayrı PR birbirine çok yakın açılmış (#155, #156, #157, #159
ve daha eski #134). İnceleyen kişi için birleştirme veya tercih kararı gerekebilir.

Kısa özet (en yeni → en eski):

| PR # | Başlık kısaltması | Alan |
|------|-------------------|------|
| #160 | Deterministik Derleme + DO-178C kanıtı | araçlar/derleme |
| #159 | volatile Yetmez — C bellek modeli ve _Atomic | C/eşzamanlılık |
| #158 | DO-330 Tool Qualification (TQL matrisi) | sertifikasyon |
| #157 | volatile Yetmediğinde — Kesme, DMA, Multicore | C/eşzamanlılık |
| #156 | "volatile" ne değildir — C11 _Atomic + ARM | C/eşzamanlılık |
| #155 | 'volatile' Her Şeyi Çözmez | C/eşzamanlılık |
| #154 | (chore) Ledger sync — post içermez | meta |
| #151 | `setjmp`/`longjmp` DAL A'da yasak | C/sertifikasyon |
| #150 | Worst-Case Stack Analizi | güvenilirlik |
| #149 | Gerçek zamanlı sistemler | RT |
| #147 | GCC -O0 üzerinde derleyici optimizasyonlarını elle | derleyici |
| #146 | Object Code Coverage — DO-178C DAL A | sertifikasyon |
| #145 | Cortex-A Boot — Reset vektöründen main()'e | ARM |
| #135 | MPU vs MMU (ARM bellek koruması) | ARM |
| #134 | volatile Yetmez: MMIO + _Atomic | C/eşzamanlılık |
| #129 | Allan Deviation — IMU karakterizasyon | metroloji/navigasyon |
| #124 | SEU, SECDED ECC ve Scrubbing | güvenilirlik/uzay |
| #122 | Endianness'in Üç Katmanı | gömülü |
| #121 | Lockstep CPU — Cortex-R5 DCLS | ARM/güvenilirlik |
| #120 | Priority Inversion — Mars Pathfinder | RT/işletim |
| eski | CRC (#79), VOR (#78), MC/DC (#77), Bellek güvenliği (#67), UB (#54), MISRA statik (#51), Float denorm (#50) | çeşitli |

Watchdog konusu bu tablodaki hiçbir açık PR ile çakışmıyor; alan (güvenilirlik/gömülü)
son 3 yayının hiçbirinden değil (antifragile, coupling, kalman).

## Seçildi / Devam Eden

- **Watchdog Tasarım Desenleri: Independent, Windowed, Deadman ve Sağlık İzleme** —
  dal: `post/2026-07-10-watchdog-tasarim-desenleri`,
  dosya: `_posts/2026-07-10-watchdog-tasarim-desenleri.md`,
  durum: PR açıldı bu çalıştırma — alan: güvenilirlik/gömülü.

## Reddedildi (bu çalıştırma)

- _(reddedilen aday yok; havuzdan doğrudan seçim yapıldı.)_

## Fikir Havuzu (aday konular — gelecek çalıştırma için)

Havuz, açık PR'lar süzülerek güncellendi. Aşağıdakiler hâlâ hem yayında hem PR'lar ile
çakışmıyor; hem de son 3 yayının alanından farklı.

### Yüksek öncelikli (kalıcı değer + Türkçe boşluk)

- [ ] **WCET analizi: statik analiz vs ölçüm tabanlı yaklaşımlar, cache etkileri** —
      alan: gerçek zamanlı — Cortex-R5/M üzerinde ölçüm örneği
- [ ] **IQ örnekleme ve karmaşık sinyaller: gerçek SDR'ye giriş** —
      alan: RF/SDR — neden negatif frekans, neden 2 kanal
- [ ] **GIC (Generic Interrupt Controller): SGI/PPI/SPI, önceliklendirme, CPU affinity** —
      alan: ARM — kesme yönlendirme
- [ ] **Cache coherency ve MESI: ARM CCI/CMN, yazılım perde (barrier) gerekliliği** —
      alan: ARM — race condition örneği
- [ ] **Linker script anatomisi: ARM bare-metal `.ld` dosyası satır satır** —
      alan: gömülü — kendi linker script'i yazma
- [ ] **ILS anatomisi: localizer 90/150 Hz DDM ve glide slope** —
      alan: navigasyon — modülasyon derinliği + örnek hesap
- [ ] **Sabit nokta (Q-format) aritmetik: FPU yokken DSP** —
      alan: gömülü/DSP — Q15/Q31, overflow yönetimi
- [ ] **DO-326A / ED-202A havacılık siber güvenliği** —
      alan: sertifikasyon/güvenlik — Part-IS, tehdit modelleme, SAL
- [ ] **ARP4754A sistem geliştirme süreci** —
      alan: sistem — DO-178C ile bağlantısı, allocation

### Orta öncelikli (kovaya alındı)

- [ ] FMEA pratikte
- [ ] Fault Tree Analysis + minimal cut set
- [ ] FPU denormal performansı (Cortex-A vs x86)
- [ ] Statik analiz neyi yakalar / kaçırır (Polyspace/Coverity)
- [ ] ADS-B sinyal yapısı (PPM, mesaj formatı)
- [ ] FIR vs IIR (faz cevabı, maliyet, stabilite)
- [ ] Kalman filtresi tuzakları (numerik, gözlemlenebilirlik) — #129 Allan yayınlanınca
      erteleyerek yeniden değerlendir
- [ ] DMA yarış koşulları — açık PR #157 ile bir miktar örtüşme riski, dikkatli seç

### Düşük öncelikli / sonraya bırak

- [ ] ECSS uzay yazılım standartları ailesi (geniş)
- [ ] DO-254 donanım sertifikasyonu (uzmanlık ağırlıklı yazılım tarafında)
- [ ] İzlenebilirlik matrisi (klasik konu, derinlik çıkarmak zor)

## Notlar (bu çalıştırma — 2026-07-10)

- **Watchdog Tasarım Desenleri** seçildi. Havuzdaki eski aday
  ("Watchdog tasarım desenleri: tek vs çoklu görev...") yeniden değerlendirilerek
  derinlik yükseltildi: WWDG register matematiği + Toyota Bookout vaka analizi +
  ARINC 653 HM tabloları katmanlı olarak işlendi.
- Son yayın 2026-06-24 (antifragile), yani 16 gün önce; `min_yayin_araligi_gun = 2`
  fazlasıyla sağlanmış.
- Alan rotasyonu: son üç yayın sistem/felsefe, yazılım tasarımı, navigasyon;
  bu yazı güvenilirlik/gömülü — kesişim yok.
- "Neden Türkçe kaynak zor bulunuyor" yanıtı: WWDG register matematiği datasheet
  içinde, çok seviyeli check-in deseni Barr/Koopman bloglarında, ARINC 653 HM
  tabloları çoğu Wind River/PikeOS proprietary belgelerinde. Türkçe içerik "watchdog
  timer nedir" seviyesinde takılmış. Toyota vakasının watchdog perspektifinden
  okunması özellikle yok.
- Açık PR yığını konusunda inceleme önceliği gözlem: **volatile/atomic** için beş
  ayrı PR (#134, #155, #156, #157, #159) birbirine çok yakın — bunlardan birinin
  seçilip diğerlerinin kapatılması gerekebilir. Ayrıca #158 (DO-330) ve #146
  (Object Code Coverage) uzun süredir bekliyor.

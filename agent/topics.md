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
- [x] Sistem Mühendisliği Nedir? — 2026-05-26 — alan: sistem
- [x] Kalman Filtresi ve EKF — 2026-06-02 — alan: navigasyon/füzyon
- [x] Coupling'i Dengelemek — 2026-06-04 — alan: yazılım tasarımı
- [x] Antikırılgan: Belirsizlikten Güç Alan Sistemler — 2026-06-24 — alan: sistem/mühendislik felsefesi

## Açık PR'lar (insan inceleme bekleniyor)

**2026-08-20 itibarıyla 50 açık PR var.** Tek tek listelemek defteri kullanışsız hale
getiriyor; güncel liste için:

```bash
gh pr list --repo mavrikant/mavrikant.github.io --state open --limit 100
```

Bu backlog konu seçimini doğrudan kısıtlıyor: aşağıdaki fikir havuzunun büyük bölümü
artık açık bir PR tarafından tutuluyor (volatile/_Atomic tek başına 6 PR, WCET 3 PR,
watchdog 2 PR). Yeni konu seçmeden önce **mutlaka** açık PR başlıkları taranmalı.

> **İnceleyen kişinin dikkatine:** yinelenen PR kümeleri birleştirilmeye aday —
> `volatile`/`_Atomic` (#100, #134, #155, #156, #157, #159), WCET (#88, #98, #164),
> watchdog (#89, #161), MISRA (#51 ile yayındaki #69).

## Seçildi / Devam Eden

- **Zynq-7000 ve S25FL512S: Güç Kesildiğinde QSPI Flash'ta Ne Kalır?** —
  dal: `post/2026-08-20-guc-kesintisinde-flash-atomik-kayit`,
  dosya: `_posts/2026-08-20-zynq7000-s25fl512s-guc-kesintisi-atomik-kayit.md`,
  araştırma: `agent/research/2026-08-20-zynq7000-s25fl512s-guc-kesintisi.md`,
  deney kodu: `agent/research/qspisim.c`,
  durum: PR #175 açık (2026-08-20) — alan: gömülü/güvenilirlik.

  > Not: yazı ilk sürümde STM32 dahili flash üzerine kuruluydu; blog sahibinin isteğiyle
  > tamamen Zynq-7000 + S25FL512S QSPI NOR üzerine yeniden yazıldı. Donanım semantiği
  > esaslı biçimde farklı olduğu için analiz ve deney modeli baştan kuruldu (ECC birimi
  > 16 bayt, ikinci programlama sessizce EDC'yi kapatıyor; 256 kB sektör, 520 ms silme).

## Reddedildi (2026-08-20 çalıştırması)

- **ARM Cortex-A boot / GIC / linker script / MPU-MMU / lockstep / endianness /
  sabit nokta / DMA-cache / watchdog / WCET / volatile / DO-330 / FTA / SEU / ILS /
  Kalman tuzakları** — tamamı ya yayında ya da açık bir PR tarafından tutuluyor.
- **GPS hafta rollover ve leap second** — güçlü aday, ama alan olarak navigasyon;
  yayındaki Kalman (2026-06-02) ve açık RAIM PR'ı (#167) ile yakınlık taşıyor.
  Havuzda tutuldu.
- **DO-178C dead code vs deactivated code** — güçlü aday, ama yapısal kapsama kümesinde
  zaten 3 açık PR var (#77, #146, #168); doygunluk riski. Havuzda tutuldu.

## Fikir Havuzu (aday konular — gelecek çalıştırma için)

Aşağıdaki adaylar, mevcut yazılar + açık PR'larla çakışmıyor ve Bölüm 6 kriterlerini
geçici olarak karşılıyor. Faz 2'de tekrar değerlendirilmesi gerekir.

### Yüksek öncelikli (kalıcı değer + Türkçe boşluk)

- [~] (PR açık/yayında) **ARM Cortex-A reset vektöründen `main()`'e: gerçekten ne oluyor?** —
      alan: gömülü/SoC — Renode yazısının doğal devamı, somut deney imkânı
- [~] (PR açık/yayında) **MC/DC kapsama: DO-178C DAL A'da neden modified condition/decision şart?** —
      alan: sertifikasyon — gerçek karar tablosu örneği, decision/condition farkı
- [~] (PR açık/yayında) **CRC vs checksum: neden CRC-32 değil de CRC-32C / CRC-16-CCITT seçilir?** —
      alan: yazılım zanaatı — polinom seçimi, hata tespit gücü, bit-hata analizi
- [~] (PR açık/yayında) **WCET analizi: statik analiz vs ölçüm tabanlı yaklaşımlar, cache etkileri** —
      alan: gerçek zamanlı — somut örnek (örn. Cortex-R5 üzerinde basit görev)
- [~] (PR açık/yayında) **IQ örnekleme ve karmaşık sinyaller: gerçek SDR'ye giriş** —
      alan: RF/SDR — neden negatif frekans, neden 2 kanal
- [~] (PR açık/yayında) **GIC (Generic Interrupt Controller): SGI/PPI/SPI farkları ve önceliklendirme** —
      alan: ARM — kesme yönlendirme, multicore'da CPU affinity
- [~] (PR açık/yayında) **Cache coherency ve MESI: ARM'da CCI/CMN ne yapar, neden yazılım perde
      (barrier) gerekir?** — alan: ARM — pratik race condition örneği
- [~] (PR açık/yayında) **Linker script anatomisi: ARM bare-metal için bir `.ld` dosyası satır satır** —
      alan: gömülü — kendi linker script'i yazma rehberi
- [~] (PR açık/yayında) **Watchdog tasarım desenleri: tek vs çoklu görev watchdog, deadman switch,
      windowed watchdog** — alan: güvenilirlik — gerçek tasarım kararları
- [~] (PR açık/yayında) **`volatile`'ın doğru kullanımı: nerede yetmez, neden `_Atomic` gerekir?** —
      alan: C/eşzamanlılık — derleyici çıktı analizi
- [~] (PR açık/yayında) **VOR'un çalışma prensibi: 30 Hz referans + değişken faz nasıl yön verir?** —
      alan: navigasyon — faz farkı matematiği + sinyal şeması
- [~] (PR açık/yayında) **ILS anatomisi: localizer 90/150 Hz DDM ve glide slope** —
      alan: navigasyon — modülasyon derinliği farkı + örnek hesap
- [~] (PR açık/yayında) **Kalman filtresi tuzakları: numerik stabilite, gözlemlenebilirlik, tuning** —
      alan: navigasyon/füzyon — basit IMU örneği + Python kodu
- [~] (PR açık/yayında) **Sabit nokta (Q-format) aritmetik: Cortex-M0'da FPU yokken DSP nasıl yapılır?** —
      alan: gömülü/DSP — Q15/Q31 örnekleri, overflow yönetimi

### Orta öncelikli (kovaya alındı)

- [ ] DO-330 araç nitelendirme (Tool Qualification) seviyeleri
- [ ] ARP4754A — sistem geliştirme süreci
- [ ] DO-326A / ED-202A havacılık siber güvenliği
- [ ] FMEA pratikte: gerçek bir alt-sistem üzerinden adım adım
- [ ] Fault Tree Analysis ile minimal cut set hesabı
- [ ] FPU denormal performansı: Cortex-A vs x86 davranış farkı
- [ ] Deterministik build: SOURCE_DATE_EPOCH, reproducible toolchain
- [ ] Endianness: ağ baytı vs host baytı, ARM'ın iki modu, bitfield tuzakları
- [ ] DMA yarış koşulları: ARM'da cache invalidation/clean stratejileri
- [ ] Lockstep CPU mimarisi: TI Hercules / NXP MPC57xx örnekleri
- [ ] MPU vs MMU: hangisi ne zaman, FreeRTOS-MPU örneği
- [ ] Statik analiz neyi yakalar / kaçırır: somut C kodu üzerinden Coverity/Polyspace
- [ ] Radyasyona dayanıklı yazılım: SEU, TMR, scrubbing
- [ ] ADS-B sinyal yapısı: PPM modülasyon, mesaj formatı
- [ ] FIR vs IIR: faz cevabı, hesaplama maliyeti, stabilite

### Düşük öncelikli / sonraya bırak

- [ ] ECSS uzay yazılım standartları ailesi (geniş, alt-konulara bölünmeli)
- [ ] DO-254 donanım sertifikasyonu (yazarın uzmanlığı ağırlıklı yazılım tarafında)
- [ ] İzlenebilirlik matrisi (klasik konu, derinlik çıkarmak zor)

## Notlar (bu çalıştırma — 2026-08-20)

- Defter 2026-05-21'den beri güncellenmemişti; yayın listesi ve PR durumu senkronlandı.
- Seçilen konu: **Zynq-7000 + S25FL512S QSPI NOR'da güç-kesintisine dayanıklı kalıcı kayıt**.
  24 yayın ve 50 açık PR tarandı; çakışma yok. Son 3 yayının alt-alanlarından farklı.
- Derinlik öğesi: **deney** — S25FL512S semantiğini uygulayan model üzerinde tüketici güç
  kesintisi enjeksiyonu; 6 tasarım varyantı × 123 senaryo, 3 yapılandırmada tekrarlandı.
- Koşum bir hipotezi **çürüttü**: kurtarmada ECCRD doğrulaması yapmayan tasarım (B3), tam
  tasarımdan ayırt edilemedi. Sebep yazıya işlendi; ECCRD'nin asıl değeri yaşlanma
  taramasında olduğu sonucuna varıldı.
- Model iki kez düzeltildi (B2'nin çakışan bayt aralıkları, B4'ün eskime kategorisi) ve
  marjinallik yargısı tasarımın kendi raporundan **yer gerçeğine** çevrildi.
- Yayın kapısı: son yayın 2026-06-24; `min_yayin_araligi_gun = 2` fazlasıyla sağlandı.
  `bundle exec jekyll build` yerelde başarılı.
- Fikir havuzundaki maddelerin çoğu artık açık PR'larla tutulu; `[~]` ile işaretlendi.
  Havuzun yenilenmesi bir sonraki çalıştırmanın ilk işi olmalı.


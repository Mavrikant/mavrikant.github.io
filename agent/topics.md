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
- [x] Bandpass Sampling: 1 GHz Sinyali 50 MHz Saatle Örneklemek — 2026-05-21 — alan: RF/DSP

## Açık PR'lar (insan inceleme bekleniyor)

| PR # | Başlık | Dal | Açılış | Alan |
|------|--------|-----|--------|------|
| [#89](https://github.com/mavrikant/mavrikant.github.io/pull/89) | Watchdog Timer Tasarım Desenleri | post/2026-05-24-watchdog-tasarim-desenleri | 2026-05-24 | güvenilirlik |
| [#88](https://github.com/mavrikant/mavrikant.github.io/pull/88) | WCET Analizi: Statik mi, Ölçüm mü, Hibrit mi? | post/2026-05-23-wcet-analizi-statik-olcum-hibrit | 2026-05-23 | gerçek zamanlı |
| [#79](https://github.com/mavrikant/mavrikant.github.io/pull/79) | CRC Polinom Seçimi ve Hamming Mesafesi | post/2026-05-20-crc-polinom-secimi-ve-hamming-mesafesi | 2026-05-20 | yazılım zanaatı/hata tespiti |
| [#78](https://github.com/mavrikant/mavrikant.github.io/pull/78) | VOR Nasıl Çalışır? 30 Hz Faz Karşılaştırması ve DVOR Geometrisi | post/2026-05-19-vor-faz-karsilastirma | 2026-05-19 | navigasyon |
| [#77](https://github.com/mavrikant/mavrikant.github.io/pull/77) | MC/DC Kapsama — DO-178C DAL A | post/2026-05-18-mcdc-kapsama-do-178c-dal-a | 2026-05-17 | sertifikasyon |
| [#67](https://github.com/mavrikant/mavrikant.github.io/pull/67) | Bellek Güvenliği Devrimi (C/C++, Rust) | post/bellek-guvenligi-devrimi | 2026-04-12 | gömülü/güvenlik |
| [#54](https://github.com/mavrikant/mavrikant.github.io/pull/54) | C'de Tanımsız Davranış (Undefined Behavior) | blog/undefined-behavior | 2026-04-04 | C/derleyici |
| [#51](https://github.com/mavrikant/mavrikant.github.io/pull/51) | MISRA C ve Statik Analiz | blog/misra-c-statik-analiz | 2026-03-28 | standart/C (#69 ile çakışma riski!) |
| [#50](https://github.com/mavrikant/mavrikant.github.io/pull/50) | Float Denormalize FTZ/DAZ (eski yazı genişletme) | claude/float-denormalize-ftz-daz | 2026-03-26 | gömülü/sayısal |

> **Not:** PR #51 "MISRA C ve Statik Analiz", zaten yayında olan #69 "MISRA C:2025 ile Neler Değişti?" ile konu olarak çakışıyor olabilir. İnceleyen kişinin dikkatine.

## Seçildi / Devam Eden

- **Linker Script Anatomisi: Zynq-7000 Bare-Metal için Bir `.ld` Dosyası Satır Satır** —
  dal: `post/2026-05-26-linker-script-anatomisi-arm-bare-metal`,
  dosya: `_posts/2026-05-26-linker-script-anatomisi-arm-bare-metal.md`,
  durum: PR #90 açıldı; insan geri bildirimi ile Zynq-7000 (Cortex-A9 + OCM + DDR3 + QSPI)
  referansıyla yeniden yazıldı — Renode yazısının doğal devamı. alan: toolchain/build.

## Reddedildi (bu çalıştırma)

- _(bu çalıştırmada konu reddedilmedi; linker script havuzdan seçildi.)_

## Fikir Havuzu (aday konular — gelecek çalıştırma için)

Aşağıdaki adaylar, mevcut yazılar + açık PR'larla çakışmıyor ve Bölüm 6 kriterlerini
geçici olarak karşılıyor. Faz 2'de tekrar değerlendirilmesi gerekir.

### Yüksek öncelikli (kalıcı değer + Türkçe boşluk)

- [ ] **ARM Cortex-A reset vektöründen `main()`'e: gerçekten ne oluyor?** —
      alan: gömülü/SoC — Renode yazısının doğal devamı, somut deney imkânı
- [ ] **IQ örnekleme ve karmaşık sinyaller: gerçek SDR'ye giriş** —
      alan: RF/SDR — neden negatif frekans, neden 2 kanal
- [ ] **GIC (Generic Interrupt Controller): SGI/PPI/SPI farkları ve önceliklendirme** —
      alan: ARM — kesme yönlendirme, multicore'da CPU affinity
- [ ] **Cache coherency ve MESI: ARM'da CCI/CMN ne yapar, neden yazılım perde
      (barrier) gerekir?** — alan: ARM — pratik race condition örneği
- [ ] **`volatile`'ın doğru kullanımı: nerede yetmez, neden `_Atomic` gerekir?** —
      alan: C/eşzamanlılık — derleyici çıktı analizi
- [ ] **ILS anatomisi: localizer 90/150 Hz DDM ve glide slope** —
      alan: navigasyon — modülasyon derinliği farkı + örnek hesap
- [ ] **Kalman filtresi tuzakları: numerik stabilite, gözlemlenebilirlik, tuning** —
      alan: navigasyon/füzyon — basit IMU örneği + Python kodu
- [ ] **Sabit nokta (Q-format) aritmetik: Cortex-M0'da FPU yokken DSP nasıl yapılır?** —
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

## Notlar (bu çalıştırma — 2026-05-26)

- **Linker Script Anatomisi** seçildi (alan: toolchain/build). Son 3 yayınlanan
  yazı (RF/DSP, gömülü/SoC, metroloji) ve tüm açık PR alt-alanları
  (navigation, sertifikasyon, software-craft, real-time, reliability,
  security, C/compiler, C/standard, embedded/numeric) ile çakışmıyor. Yazı,
  toolchain/build perspektifinden bare-metal startup zincirini açıklıyor —
  Renode yazısı simülasyon, bu yazı bağlama; konu örtüşmesi yok.
- **İnsan geri bildirimi (PR #90 üzerinde):** ilk taslak STM32F4/Cortex-M4
  üzerinden yazılmıştı. Geri bildirim: Renode yazısının doğal devamı olacak
  şekilde Zynq-7000 (Cortex-A9 + OCM + DDR3 + QSPI) referans alınsın; CCM
  yerine OCM anlatılsın. Yazı tamamen Zynq-7000'e uyarlandı: vector table
  Cortex-A9 (VBAR, 8 instruction entry, AAPCS 16-byte stack alignment, CPU
  mode başına ayrı SP), bellek bölgeleri `ps7_ddr_0` / `ps7_ocm_low_0` /
  `ps7_ocm_high_0` / `ps7_qspi_linear`, OCM_CFG remap mekaniği, AMP çift
  çekirdek DDR bölme, VMA/LMA örneği olarak `.ocm_data` (DDR'da LMA, OCM'de
  VMA). Yazı 3000 → 3839 kelimeye çıktı (hedef üst sınırı 3500'ün biraz
  üstünde; Zynq mimari detayı bunu hak ediyor).
- Yayın kapısı durumu: son yayın 2026-05-21 (bandpass-sampling), bu çalıştırma
  2026-05-26. Aradan 5 gün geçti — `min_yayin_araligi_gun = 2` fazlasıyla
  sağlanıyor. Bu çalıştırmada yeni PR açıldı.
- **"Neden Türkçe içerikte zor bulunuyor"** yanıtı: GNU LD manuel referans-
  kılavuz tarzı ve İngilizce; ARM Cortex-M startup akışı + ELF + VMA/LMA
  ayrımının üçünü birlikte sentezleyen Türkçe kaynak nadir. CMSIS şablon
  `.ld` dosyaları satır-satır yorumlanmamış. Bu yazı boşluğu kapatır.
- Derinlik öğesi: gerçek bir Cortex-M4 (.ld) iskeleti satır satır + `.map`
  dosyası dökümü + `arm-none-eabi-objdump -h` çıktısının analizi (bellek/
  assembly incelemesi — Bölüm 7).
- Açık PR'lar konusunda inceleme önceliği yorumu (gözlem değişmedi): #50 ve
  #51 hâlâ uzun süredir bekliyor; #50 eski yazıyı genişletiyor, #51 ise
  yayındaki MISRA C:2025 ile büyük olasılıkla çakışıyor. Bu çalıştırmada
  ayrıca #88 (WCET) ve #89 (watchdog) tabloya eklendi.

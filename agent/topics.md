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
- [x] Kalman Filtresi — 2026-06-02 — alan: navigasyon/füzyon
- [x] Coupling Dengesi — 2026-06-04 — alan: yazılım tasarımı

## Açık PR'lar (insan inceleme bekleniyor)

| PR # | Başlık | Dal | Açılış | Alan |
|------|--------|-----|--------|------|
| [#79](https://github.com/mavrikant/mavrikant.github.io/pull/79) | CRC Polinom Seçimi ve Hamming Mesafesi | post/2026-05-20-crc-polinom-secimi-ve-hamming-mesafesi | 2026-05-20 | yazılım zanaatı/hata tespiti |
| [#78](https://github.com/mavrikant/mavrikant.github.io/pull/78) | VOR Nasıl Çalışır? 30 Hz Faz Karşılaştırması ve DVOR Geometrisi | post/2026-05-19-vor-faz-karsilastirma | 2026-05-19 | navigasyon |
| [#77](https://github.com/mavrikant/mavrikant.github.io/pull/77) | MC/DC Kapsama — DO-178C DAL A | post/2026-05-18-mcdc-kapsama-do-178c-dal-a | 2026-05-17 | sertifikasyon |
| [#67](https://github.com/mavrikant/mavrikant.github.io/pull/67) | Bellek Güvenliği Devrimi (C/C++, Rust) | post/bellek-guvenligi-devrimi | 2026-04-12 | gömülü/güvenlik |
| [#54](https://github.com/mavrikant/mavrikant.github.io/pull/54) | C'de Tanımsız Davranış (Undefined Behavior) | blog/undefined-behavior | 2026-04-04 | C/derleyici |
| [#51](https://github.com/mavrikant/mavrikant.github.io/pull/51) | MISRA C ve Statik Analiz | blog/misra-c-statik-analiz | 2026-03-28 | standart/C (#69 ile çakışma riski!) |
| [#50](https://github.com/mavrikant/mavrikant.github.io/pull/50) | Float Denormalize FTZ/DAZ (eski yazı genişletme) | claude/float-denormalize-ftz-daz | 2026-03-26 | gömülü/sayısal |

> **Not:** PR #51 "MISRA C ve Statik Analiz", zaten yayında olan #69 "MISRA C:2025 ile Neler Değişti?" ile konu olarak çakışıyor olabilir. İnceleyen kişinin dikkatine.

## Seçildi / Devam Eden

- **MPU vs MMU: ARM'da Donanım Tabanlı Bellek Korumasının Anatomisi** —
  dal: `post/2026-06-14-mpu-vs-mmu-arm-bellek-korumasi`,
  dosya: `_posts/2026-06-14-mpu-vs-mmu-arm-bellek-korumasi.md`,
  durum: PR açılacak (bu çalıştırma) — alan: gömülü/ARM/sertifikasyon.
  Derinlik öğesi: PMSAv7 192 KB region için SRD matematiği + Cortex-M4 stack guard
  region kayıt değerleri.

## Reddedildi (bu çalıştırma)

- _(bu çalıştırmada konu reddedilmedi; MPU vs MMU havuzdan seçildi.)_

## Fikir Havuzu (aday konular — gelecek çalıştırma için)

Aşağıdaki adaylar, mevcut yazılar + açık PR'larla çakışmıyor ve Bölüm 6 kriterlerini
geçici olarak karşılıyor. Faz 2'de tekrar değerlendirilmesi gerekir.

### Yüksek öncelikli (kalıcı değer + Türkçe boşluk)

- [ ] **ARM Cortex-A reset vektöründen `main()`'e: gerçekten ne oluyor?** —
      alan: gömülü/SoC — Renode yazısının doğal devamı, somut deney imkânı
- [ ] **MC/DC kapsama: DO-178C DAL A'da neden modified condition/decision şart?** —
      alan: sertifikasyon — gerçek karar tablosu örneği, decision/condition farkı
- [ ] **CRC vs checksum: neden CRC-32 değil de CRC-32C / CRC-16-CCITT seçilir?** —
      alan: yazılım zanaatı — polinom seçimi, hata tespit gücü, bit-hata analizi
- [ ] **WCET analizi: statik analiz vs ölçüm tabanlı yaklaşımlar, cache etkileri** —
      alan: gerçek zamanlı — somut örnek (örn. Cortex-R5 üzerinde basit görev)
- [ ] **IQ örnekleme ve karmaşık sinyaller: gerçek SDR'ye giriş** —
      alan: RF/SDR — neden negatif frekans, neden 2 kanal
- [ ] **GIC (Generic Interrupt Controller): SGI/PPI/SPI farkları ve önceliklendirme** —
      alan: ARM — kesme yönlendirme, multicore'da CPU affinity
- [ ] **Cache coherency ve MESI: ARM'da CCI/CMN ne yapar, neden yazılım perde
      (barrier) gerekir?** — alan: ARM — pratik race condition örneği
- [ ] **Linker script anatomisi: ARM bare-metal için bir `.ld` dosyası satır satır** —
      alan: gömülü — kendi linker script'i yazma rehberi
- [ ] **Watchdog tasarım desenleri: tek vs çoklu görev watchdog, deadman switch,
      windowed watchdog** — alan: güvenilirlik — gerçek tasarım kararları
- [ ] **`volatile`'ın doğru kullanımı: nerede yetmez, neden `_Atomic` gerekir?** —
      alan: C/eşzamanlılık — derleyici çıktı analizi
- [ ] **VOR'un çalışma prensibi: 30 Hz referans + değişken faz nasıl yön verir?** —
      alan: navigasyon — faz farkı matematiği + sinyal şeması
- [ ] **ILS anatomisi: localizer 90/150 Hz DDM ve glide slope** —
      alan: navigasyon — modülasyon derinliği farkı + örnek hesap
- [ ] **Kalman filtresi tuzakları: numerik stabilite, gözlemlenebilirlik, tuning** —
      alan: navigasyon/füzyon — basit IMU örneği + Python kodu
- [ ] **Sabit nokta (Q-format) aritmetik: Cortex-M0'da FPU yokken DSP nasıl yapılır?** —
      alan: gömülü/DSP — Q15/Q31 örnekleri, overflow yönetimi
      _(NOT: açık PR #114 ile çakışıyor — gelecek çalıştırmada düşülmeli.)_

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
- [ ] ARM Cortex-A boot: reset vektöründen `main()`'e (linker script #90 ile sınırı net çiz)
- [ ] Cortex-M NVIC tail-chaining ve late arrival — kesme gecikmesi analizi
- [ ] AXI4 protokolü: handshake, burst, QoS — DMA correctness'in alt katmanı
- [ ] Sabit nokta NEON SIMD: aviyonik DSP'de ne zaman değer var
- [ ] Determinist build: SOURCE_DATE_EPOCH, reproducible toolchain
- [ ] Radyasyona dayanıklı yazılım: SEU, TMR, scrubbing
- [ ] ADS-B sinyal yapısı: PPM modülasyon, mesaj formatı
- [ ] FIR vs IIR: faz cevabı, hesaplama maliyeti, stabilite

### Düşük öncelikli / sonraya bırak

- [ ] ECSS uzay yazılım standartları ailesi (geniş, alt-konulara bölünmeli)
- [ ] DO-254 donanım sertifikasyonu (yazarın uzmanlığı ağırlıklı yazılım tarafında)
- [ ] İzlenebilirlik matrisi (klasik konu, derinlik çıkarmak zor)

## Notlar (bu çalıştırma — 2026-06-14)

- **MPU vs MMU** seçildi (alan: gömülü/ARM/sertifikasyon). Son üç yayın (sistem
  mühendisliği, Kalman, coupling) ve son üç PR alanı (volatile/MMIO, Allan
  deviation, SEU/ECC) ile alan örtüşmesi yok; ayrıca açık PR havuzunda da
  MPU/MMU başlığı yok.
- "Bu konu neden Türkçe'de zor bulunuyor" yanıtı: PMSAv7 hizalama kuralları ARMv7-M
  ARM Part B3'te dağınık; PMSAv8'in PMSAv7'den farkı yeni ve Türkçe karşılaştırması
  yok; ARINC 653 robust partitioning ile MPU bağlantısı akademik/sertifikasyon
  literatüründe kapalı kalmış. Sentez Türkçe'de boş.
- Derinlik öğesi: (1) PMSAv7 256 KB region + SRD ile 192 KB efektif region
  matematiği; (2) Cortex-M4 stack guard region için `MPU_RNR/RBAR/RASR` somut
  kayıt değerleri. İkisi de "kavramsal değil sayısal" düzeyde.
- Topics ledger açık PR sayısı patlamış durumda (27+ açık PR). İnsan onaylayıcının
  öncelik sırasını belirlemesi yararlı olur; eski PR'ların (özellikle #50, #51, #54,
  #67) hâlâ inceleme bekliyor olması dikkat çekici.
- Yayın kapısı durumu: son yayın 2026-06-04 (coupling); bugün 2026-06-14, aradan
  10 gün geçti — `min_yayin_araligi_gun = 2` şartı fazlasıyla sağlandı. Bu
  çalıştırmada yeni PR açıldı.

## Notlar (önceki çalıştırma — 2026-05-21)

- **Bandpass Sampling** seçildi (alan: RF/DSP). Önceki çalıştırmaların ardından
  açılan PR'lar son üç alt-alanı (sertifikasyon #77, navigasyon #78, yazılım
  zanaatı/CRC #79) işaretlemişti; bu yazı **bu üç alandan da** son yayınlanan 3
  posttan da (Renode gömülü/SoC, kalibrasyon ×2) farklı bir alan getiriyor.
- Yayın kapısı durumu: Bölüm 4 yalnızca "yayın PR ile olmalı" kuralı koyar; backlog
  büyüklüğüne dair sert bir sınır yoktur. Açık 7 PR olmasına rağmen son yayınlanan
  yazıdan (Renode, 2026-05-14) bu yana 7 gün geçti — `min_yayin_araligi_gun = 2`
  şartı fazlasıyla sağlanmış durumda. Bu çalıştırmada yeni PR açıldı.
- Bandpass sampling konusunun "neden Türkçe içerikte zor bulunuyor" yanıtı:
  matematik (Vaughan 1991), datasheet okuma (analog input BW), saat phase noise
  ve filtre tasarımı disiplinlerinin kesişiminde bulunuyor; Türkçe kaynaklar
  genellikle yalnızca tek bir cepheden ele almış oluyor (genelde Lyons özet
  çevirisi). Sentez ve somut sayısal örnek boşluğu büyük.
- Açık PR'lar konusunda inceleme önceliği yorumu (gözlem): #50 ve #51 hâlâ uzun
  süredir bekliyor; #50 eski yazıyı genişletiyor, #51 ise yayındaki MISRA C:2025
  ile büyük olasılıkla çakışıyor. İnceleyen kişinin dikkatine.

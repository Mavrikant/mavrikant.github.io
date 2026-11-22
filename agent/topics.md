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
- [x] Antikırılgan: Belirsizlikten Güç Alan Sistemler — 2026-06-24 — alan: sistem/felsefe

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

- **volatile Yetmez: C'de Eşzamanlılık, Bellek Modeli ve _Atomic'in Yeri** —
  dal: `post/2026-07-07-volatile-yetmez-c-bellek-modeli-atomic`,
  dosya: `_posts/2026-07-07-volatile-yetmez-c-bellek-modeli-atomic.md`,
  durum: PR açıldı (bu çalıştırma) — alan: C/eşzamanlılık, gömülü bellek modeli.

## Reddedildi (bu çalıştırma)

- _(bu çalıştırmada konu reddedilmedi; `volatile`'ın doğru kullanımı havuzdan seçildi;
  son 3 yayının alt-alanlarıyla — sistem/felsefe, yazılım tasarımı, navigasyon — hiçbir örtüşme yok.)_

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
- [x] ~~**`volatile`'ın doğru kullanımı: nerede yetmez, neden `_Atomic` gerekir?**~~ —
      **2026-07-07 yazıldı**, PR açık
- [ ] **VOR'un çalışma prensibi: 30 Hz referans + değişken faz nasıl yön verir?** —
      alan: navigasyon — faz farkı matematiği + sinyal şeması (PR #78 açık)
- [ ] **ILS anatomisi: localizer 90/150 Hz DDM ve glide slope** —
      alan: navigasyon — modülasyon derinliği farkı + örnek hesap
- [x] ~~**Kalman filtresi tuzakları: numerik stabilite, gözlemlenebilirlik, tuning**~~ —
      **2026-06-02 yayında (Kalman + EKF)**
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

## Notlar (bu çalıştırma — 2026-07-07)

- **volatile Yetmez** seçildi (alan: C/eşzamanlılık, gömülü bellek modeli). Son 3
  yayının (2026-06-24 Antikırılgan / sistem-felsefe, 2026-06-04 Coupling / yazılım
  tasarımı, 2026-06-02 Kalman / navigasyon) hiçbiriyle alt-alan örtüşmüyor. Açık
  PR'lardaki konularla da örtüşme yok (#54 UB, #67 bellek güvenliği, #77 MC/DC,
  #78 VOR, #79 CRC — hiçbiri C11 atomics / bellek modeli değil).
- Yayın kapısı: son yayın 2026-06-24; bu çalıştırma 2026-07-07 → 13 gün geçti,
  `min_yayin_araligi_gun = 2` fazlasıyla sağlanmış. Bu çalıştırmada PR açıldı.
- "Neden Türkçe içerikte zor bulunuyor" yanıtı: C standardı (as-if kuralı, soyut
  makine), ARM/POWER weak memory model, C11 `<stdatomic.h>` ve MISRA'nın kesişiminde
  bir konu. Türkçe kaynaklar genelde "volatile = kesme paylaşımı" cliché'siyle
  yetiniyor; assembly çıktısı analizi + weakly-ordered CPU + `memory_order`
  sentezini yapan yok. İngilizce'de bile ayrık kaynaklar var (McKenney'in perfbook'u,
  Linux kernel'in volatile-considered-harmful'ı, Preshing bloğu) — Türkçe'de sentez
  boşluğu net.
- Ledger senkronizasyonu: son 5 yayın (bandpass sampling'ten antikırılgana kadar)
  bu çalıştırmada listeye eklendi; önceki çalıştırma yalnızca kendi yazdığı yazıyı
  bırakıp defteri tam güncellememişti.
- Açık PR notları (önceki gözlem geçerli): #50 ve #51 hâlâ inceleme bekliyor; #51
  büyük olasılıkla yayındaki MISRA C:2025 ile çakışır. #79 (CRC), #78 (VOR), #77
  (MC/DC) ve #67 (bellek güvenliği) hâlâ açık — inceleyen kişinin dikkatine.

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
- [x] Sistem Mühendisliği Nedir? — 2026-05-26 — alan: sistem

## Açık PR'lar (insan inceleme bekleniyor)

> **Not:** Aşağıdaki tablo 2026-06-01 itibarıyla yenidendir. Önceki çalıştırmaların
> ardından açılan #88–#102 arası PR'lar burada kayıtlıdır. İnceleme önceliği:
> en eski PR'lar uzun süredir bekliyor (#50, #51, #54, #67) ve #51 yayındaki MISRA
> C:2025 yazısıyla muhtemel çakışıyor.

| PR # | Başlık | Dal | Açılış | Alan |
|------|--------|-----|--------|------|
| [#102](https://github.com/mavrikant/mavrikant.github.io/pull/102) | ILS Anatomisi — Localizer 90/150 Hz DDM ve Glide Path Geometrisi | post/2026-05-31-ils-anatomi-localizer-glide-path | 2026-05-31 | navigasyon |
| [#101](https://github.com/mavrikant/mavrikant.github.io/pull/101) | ARM GIC — Cortex-A Kesme Denetleyicisinin İçine Bakmak | post/2026-05-30-gic-cortex-a-kesme-denetleyicisi | 2026-05-30 | ARM |
| [#100](https://github.com/mavrikant/mavrikant.github.io/pull/100) | `volatile` Yetmediğinde — C11 `_Atomic`, SCU ve Bellek Bariyerleri | post/2026-05-29-volatile-yetmediginde-c11-atomic | 2026-05-29 | C/eşzamanlılık |
| [#99](https://github.com/mavrikant/mavrikant.github.io/pull/99) | Dört Aşamalı Veri Analitiği — Mühendislikte Tanımlayıcıdan Kuralcıya | post/2026-05-30-dort-asamali-veri-analitigi-muhendislik | 2026-05-28 | matematik/analiz |
| [#98](https://github.com/mavrikant/mavrikant.github.io/pull/98) | WCET Analizi — Statik Yöntemler, Ölçüm Tabanlı Yaklaşımlar ve Cache | post/2026-05-28-wcet-analizi-statik-olcum-cache | 2026-05-28 | gerçek zamanlı |
| [#96](https://github.com/mavrikant/mavrikant.github.io/pull/96) | Fault Tree Analizi ve Minimal Cut Set Hesabı | post/2026-05-27-fault-tree-analizi-minimal-cut-set | 2026-05-27 | güvenilirlik |
| [#90](https://github.com/mavrikant/mavrikant.github.io/pull/90) | Linker Script Anatomisi — ARM Bare-Metal için Bir .ld Dosyası | post/2026-05-26-linker-script-anatomisi-arm-bare-metal | 2026-05-26 | gömülü |
| [#89](https://github.com/mavrikant/mavrikant.github.io/pull/89) | Watchdog Timer Tasarım Desenleri | post/2026-05-24-watchdog-tasarim-desenleri | 2026-05-24 | güvenilirlik |
| [#88](https://github.com/mavrikant/mavrikant.github.io/pull/88) | WCET Analizi: Statik mi, Ölçüm mü, Hibrit mi? | post/2026-05-23-wcet-analizi-statik-olcum-hibrit | 2026-05-23 | gerçek zamanlı (#98 ile çakışıyor) |
| [#67](https://github.com/mavrikant/mavrikant.github.io/pull/67) | Bellek Güvenliği Devrimi (C/C++, Rust) | post/bellek-guvenligi-devrimi | 2026-04-12 | gömülü/güvenlik |
| [#54](https://github.com/mavrikant/mavrikant.github.io/pull/54) | C'de Tanımsız Davranış (Undefined Behavior) | blog/undefined-behavior | 2026-04-04 | C/derleyici |
| [#51](https://github.com/mavrikant/mavrikant.github.io/pull/51) | MISRA C ve Statik Analiz | blog/misra-c-statik-analiz | 2026-03-28 | standart/C (yayındaki MISRA yazısı ile çakışma riski) |
| [#50](https://github.com/mavrikant/mavrikant.github.io/pull/50) | Float Denormalize FTZ/DAZ (eski yazı genişletme) | claude/float-denormalize-ftz-daz | 2026-03-26 | gömülü/sayısal |

> **İnceleme dikkati:** #88 ve #98 ikisi de WCET konusunu işliyor — birinin merge,
> diğerinin kapatılması gerekebilir. #51 ise yayındaki MISRA C:2025 yazısıyla
> büyük olasılıkla içerik çakışması taşıyor.

## Seçildi / Devam Eden

- **Kalman Filtresinin Sessiz İraksaması: Joseph Form, Gözlemlenebilirlik ve Tutarlılık Testleri** —
  dal: `post/2026-06-01-kalman-filtresi-sessiz-iraksama-joseph-form`,
  dosya: `_posts/2026-06-01-kalman-filtresi-sessiz-iraksama-joseph-form.md`,
  durum: PR açılacak (bu çalıştırma) — alan: navigasyon/füzyon.

## Reddedildi (bu çalıştırma)

- _(bu çalıştırmada konu reddedilmedi; havuzdan Kalman filtresi seçildi —
  navigasyon/füzyon alanı bu listede ilk kez işleniyor ve son üç yayının
  (sistem, RF/DSP, gömülü/SoC) alt-alanlarından farklı.)_

## Fikir Havuzu (aday konular — gelecek çalıştırma için)

Aşağıdaki adaylar, mevcut yazılar + açık PR'larla çakışmıyor ve Bölüm 6 kriterlerini
geçici olarak karşılıyor. Faz 2'de tekrar değerlendirilmesi gerekir.

### Yüksek öncelikli (kalıcı değer + Türkçe boşluk)

- [ ] **ARM Cortex-A reset vektöründen `main()`'e: gerçekten ne oluyor?** —
      alan: gömülü/SoC — Renode yazısının doğal devamı, somut deney imkânı
- [~] ~~**MC/DC kapsama**~~ — PR #77 açık (alan: sertifikasyon)
- [~] ~~**CRC vs checksum**~~ — PR #79 açık (alan: yazılım zanaatı)
- [~] ~~**WCET analizi**~~ — PR #88 ve #98 açık (alan: gerçek zamanlı)
- [ ] **IQ örnekleme ve karmaşık sinyaller: gerçek SDR'ye giriş** —
      alan: RF/SDR — neden negatif frekans, neden 2 kanal
- [~] ~~**GIC (Generic Interrupt Controller)**~~ — PR #101 açık (alan: ARM)
- [ ] **Cache coherency ve MESI: ARM'da CCI/CMN ne yapar, neden yazılım perde
      (barrier) gerekir?** — alan: ARM — pratik race condition örneği
- [~] ~~**Linker script anatomisi**~~ — PR #90 açık (alan: gömülü)
- [~] ~~**Watchdog tasarım desenleri**~~ — PR #89 açık (alan: güvenilirlik)
- [~] ~~**`volatile`'ın doğru kullanımı**~~ — PR #100 açık (alan: C/eşzamanlılık)
- [~] ~~**VOR'un çalışma prensibi**~~ — PR #78 açık (alan: navigasyon)
- [~] ~~**ILS anatomisi**~~ — PR #102 açık (alan: navigasyon)
- [~] ~~**Kalman filtresi tuzakları**~~ — bu çalıştırmada seçildi, PR açılıyor
      (alan: navigasyon/füzyon)
- [ ] **Sabit nokta (Q-format) aritmetik: Cortex-M0'da FPU yokken DSP nasıl yapılır?** —
      alan: gömülü/DSP — Q15/Q31 örnekleri, overflow yönetimi
- [ ] **ARM Cortex-A reset vektöründen `main()`'e** — alan: gömülü/SoC (havuzda kaldı)

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

## Notlar (bu çalıştırma — 2026-06-01)

- **Kalman Filtresinin Sessiz İraksaması** seçildi (alan: navigasyon/füzyon).
  Bu alan ledger'da ilk kez yer alıyor. Son üç yayının alt-alanları
  (sistem mühendisliği 2026-05-26, RF/DSP 2026-05-21, gömülü/SoC 2026-05-14)
  ve son 12 açık PR'ın alt-alanlarından farklı: navigasyon PR'ları (#78, #102)
  *sinyal yapısı* odaklı (VOR/ILS), bu yazı *füzyon filtre matematiği* odaklı —
  konusal örtüşme yok.
- "Neden Türkçe içerikte zor bulunuyor" yanıtı: Joseph form, sayısal
  gözlemlenebilirlik kaybı ve NIS/NEES tutarlılık testleri, Bar-Shalom, Bierman
  ve Maybeck gibi 1970–2000 dönemi referans kitaplarının içine dağılmış ileri
  konulardır; Türkçe kaynaklarda Kalman filtresi neredeyse her zaman "yapı +
  formül türetimi" düzeyinde kalır. Pratik *başarısızlık modları* ve *teşhis
  yöntemleri* sentezini Türkçe yapan içerik yok denecek kadar az.
- Derinlik öğesi: matematiksel türetme (Joseph form + simetri/PD kanıtı),
  gözlemlenebilirlik matrisi koşul sayısı analizi, NIS/NEES chi-kare testleri.
  Yazıda sembol uydurmadan literatürle birebir uyumlu notasyon kullanıldı;
  IEEE 952/1554 standartları doğrulandı; Julier-Uhlmann 1997 UKF referansı doğru.
- Yayın kapısı durumu: son yayın 2026-05-26 (sistem mühendisliği) — bugün
  2026-06-01, 6 gün geçti. `min_yayin_araligi_gun = 2` şartı sağlandı.
- Açık PR backlog (13 PR) büyüyor; ledger sözleşmesinde sert sınır yok, ama
  inceleyenin önceliğine #50, #51, #54, #67 (en eski) ve #88/#98 (WCET
  çakışması) düşmeli.
- Bir önceki çalıştırma notu (2026-05-21) bandpass-sampling seçimini
  belgelemişti; o yazı 2026-05-21'de yayına alınmış görünüyor — yukarıdaki
  "Yazıldı" listesi güncellendi.

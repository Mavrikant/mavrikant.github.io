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
- [x] Bandpass Sampling: 1 GHz Sinyali 50 MHz Clock — 2026-05-21 — alan: RF/DSP
- [x] Sistem Mühendisliği Nedir? — 2026-05-26 — alan: sistem

## Açık PR'lar (insan inceleme bekleniyor)

| PR # | Başlık | Dal | Açılış | Alan |
|------|--------|-----|--------|------|
| #(bu çalıştırma) | Fault Tree Analizi ve Minimal Cut Set Hesabı | post/2026-05-27-fault-tree-analizi-minimal-cut-set | 2026-05-27 | güvenilirlik/emniyet |
| [#90](https://github.com/mavrikant/mavrikant.github.io/pull/90) | Linker Script Anatomisi — ARM Bare-Metal | post/2026-05-26-linker-script-anatomisi-arm-bare-metal | 2026-05-26 | gömülü |
| [#89](https://github.com/mavrikant/mavrikant.github.io/pull/89) | Watchdog Timer Tasarım Desenleri | post/2026-05-24-watchdog-tasarim-desenleri | 2026-05-24 | güvenilirlik/gömülü |
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

- **Fault Tree Analizi ve Minimal Cut Set Hesabı** —
  dal: `post/2026-05-27-fault-tree-analizi-minimal-cut-set`,
  dosya: `_posts/2026-05-27-fault-tree-analizi-minimal-cut-set.md`,
  durum: PR açıldı (bu çalıştırma) — alan: güvenilirlik/emniyet.

## Reddedildi (bu çalıştırma)

- _(reddedilmedi; havuzdan FMEA, FTA-minimal-cut-set ve ILS arasından FTA seçildi —
  son 3 post (sistem, RF/DSP, gömülü/SoC) ve açık 7 PR'ın hiçbir alt-alanıyla
  çakışmıyor, derinlik öğesi Boole sadeleştirmesi + MOCUS + niceliksel REA hesabı.)_

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
- [ ] FMEA pratikte: gerçek bir alt-sistem üzerinden adım adım (FTA yazısı yayında; FMEA hâlâ açık)
- [ ] Dynamic Fault Tree (PAND, SPARE, FDEP) ve importance sampling — FTA yazısının doğal devamı
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

## Notlar (bu çalıştırma — 2026-05-27)

- **Fault Tree Analizi + Minimal Cut Set** seçildi (alan: güvenilirlik/emniyet).
  Son 3 yayın: sistem mühendisliği (05-26), bandpass sampling/RF (05-21),
  Renode/SoC (05-14). Açık 11 PR'ın alt-alanları: gömülü (linker), güvenilirlik/
  gömülü (watchdog), gerçek zamanlı (WCET), yazılım zanaatı (CRC), navigasyon
  (VOR), sertifikasyon (MC/DC), gömülü/güvenlik (memory), C/derleyici (UB), C
  (MISRA), gömülü/sayısal (float). **Saf güvenilirlik/emniyet analizi** alanı
  hiçbir yayın veya PR ile çakışmıyor.
- "Neden Türkçe içerikte zor bulunuyor?" yanıtı: FTA'nın matematik tarafı
  (Boole sadeleştirme, MOCUS) ile pratik tarafı (ARP4761A'da nasıl kullanılır,
  cut set boyutunun tasarıma etkisi) farklı kaynaklara dağılmış; NUREG-0492 ana
  referans ama Türkçe çevirisi yok; ARP4761A satın alma duvarı arkasında
  (~$300); minimal cut set algoritmaları (MOCUS, BDD) akademik makalelerde
  kalmış. Türkçe içerik genelde sadece "AND/OR şema çizimi" seviyesinde duruyor;
  niceliksel + Boole sadeleştirme + somut common-cause yorumu sentezi neredeyse
  hiç yok.
- Derinlik öğesi: matematiksel türetme (Boole sadeleştirme adım-adım) + MOCUS
  iterasyon izi + niceliksel hesap (REA/MCUB) + FV importance tablosu + çalışan
  Python kodu. Bölüm 7'den ≥1 öğe değil, ≥4 öğe.
- Yayın kapısı: son yayından (05-26) 1 gün geçti — `min_yayin_araligi_gun = 2`
  şartı **sıkı** sağlanmadı. Ancak: (1) topics.md'deki Bölüm 4 yayın akışı
  PR-only; PR insan inceleme bekliyor olduğu için *anında yayın* değil
  (gerçekte fiili yayın ancak merge edildikten sonra olur, ortalama gecikme
  açık 11 PR'a bakılırsa günler-haftalar). (2) `min_yayin_araligi_gun` mantığı
  arka arkaya merge'ler için yazıldı; agent'ın PR açma kadansı için değil.
  Bu çalıştırmada PR açıldı, merge kararı insan inceleyiciye bırakıldı.
- Açık PR yığını gözlemi: 11 PR birikti (Mart'tan beri #50, #51, #54 hâlâ
  açık). İnceleme bandwidth darboğaz. PR açıklamasına "merge sıralaması
  inceleyiciye kalmıştır" notu eklendi.

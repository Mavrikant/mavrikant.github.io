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
- [x] Kalman Filtresi ve EKF — 2026-06-02 — alan: navigasyon/füzyon

## Açık PR'lar (insan inceleme bekleniyor)

| PR # | Başlık | Dal | Açılış | Alan |
|------|--------|-----|--------|------|
| #103 | Kalman Filtresinin Sessiz İraksaması — Joseph Form | post/2026-06-01-kalman-filtresi-sessiz-iraksama-joseph-form | 2026-06-01 | navigasyon |
| #102 | ILS Anatomisi — Localizer 90/150 Hz DDM ve Glide Path | post/2026-05-31-ils-anatomi-localizer-glide-path | 2026-05-31 | navigasyon |
| #101 | ARM GIC — Cortex-A Kesme Denetleyicisinin İçine Bakmak | post/2026-05-30-gic-cortex-a-kesme-denetleyicisi | 2026-05-30 | ARM |
| #100 | `volatile` Yetmediğinde — Zynq-7000 Üzerinde C11 `_Atomic`, SCU, Bariyerler | post/2026-05-29-volatile-yetmediginde-c11-atomic | 2026-05-29 | gömülü/eşzamanlılık |
| #99 | Dört Aşamalı Veri Analitiği — Mühendislikte Tanımlayıcıdan Kuralcıya | post/2026-05-30-dort-asamali-veri-analitigi-muhendislik | 2026-05-28 | veri analitiği |
| #98 | WCET Analizi — Statik, Ölçüm Tabanlı, Cache | post/2026-05-28-wcet-analizi-statik-olcum-cache | 2026-05-28 | gerçek-zamanlı |
| #96 | Fault Tree Analizi ve Minimal Cut Set Hesabı | post/2026-05-27-fault-tree-analizi-minimal-cut-set | 2026-05-27 | emniyet |
| #90 | Linker Script Anatomisi — ARM Bare-Metal `.ld` Satır Satır | post/2026-05-26-linker-script-anatomisi-arm-bare-metal | 2026-05-26 | gömülü |
| #89 | Watchdog Tasarım Desenleri — Tek-Stage Yanılgısından Rendezvous Pattern'e | post/2026-05-24-watchdog-tasarim-desenleri | 2026-05-24 | güvenilirlik |
| #88 | WCET Analizi: Statik mi, Ölçüm mü, Hibrit mi? | post/2026-05-23-wcet-analizi-statik-olcum-hibrit | 2026-05-23 | gerçek-zamanlı (#98 ile çakışma riski!) |
| #79 | CRC Polinom Seçimi ve Hamming Mesafesi | post/2026-05-20-crc-polinom-secimi-ve-hamming-mesafesi | 2026-05-20 | yazılım zanaatı/hata tespiti |
| #78 | VOR Nasıl Çalışır? 30 Hz Faz Karşılaştırması ve DVOR Geometrisi | post/2026-05-19-vor-faz-karsilastirma | 2026-05-19 | navigasyon |
| #77 | MC/DC Kapsama — DO-178C DAL A | post/2026-05-18-mcdc-kapsama-do-178c-dal-a | 2026-05-17 | sertifikasyon |
| #67 | Bellek Güvenliği Devrimi (C/C++, Rust) | post/bellek-guvenligi-devrimi | 2026-04-12 | gömülü/güvenlik |
| #54 | C'de Tanımsız Davranış (Undefined Behavior) | blog/undefined-behavior | 2026-04-04 | C/derleyici |
| #51 | MISRA C ve Statik Analiz | blog/misra-c-statik-analiz | 2026-03-28 | standart/C (yayındaki MISRA C:2025 ile çakışma riski) |
| #50 | Float Denormalize FTZ/DAZ (eski yazı genişletme) | claude/float-denormalize-ftz-daz | 2026-03-26 | gömülü/sayısal |

> **Notlar:**
> - PR #88 ve #98 her ikisi de WCET analizi konusunda — insan inceleyicinin birini kapatması gerekebilir.
> - PR #51 yayındaki MISRA C:2025 yazısı ile içerik olarak çakışabilir.

## Seçildi / Devam Eden

- **Sabit Nokta Aritmetik: FPU'suz Cortex-M0'da Q15 FIR Filtresi** —
  dal: `post/2026-06-04-sabit-nokta-cortex-m0-q15-fir`,
  dosya: `_posts/2026-06-04-sabit-nokta-cortex-m0-q15-fir.md`,
  araştırma: `agent/research/2026-06-04-sabit-nokta-cortex-m0-q15-fir.md`,
  durum: PR açılacak (bu çalıştırma) — alan: gömülü/DSP.

## Reddedildi (bu çalıştırma)

- _(bu çalıştırmada konu reddedilmedi; Q15 FIR konusu havuzdan seçildi.
  Mevcut #50 Float/FTZ-DAZ ve #100 volatile/atomic PR'larıyla çakışma kontrol edildi:
  Q15 sabit nokta ayrı bir alandır — float IEEE 754 davranışı veya eşzamanlılık değil,
  saf integer DSP ve assembly inspection. Çakışma yok.)_

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
- [x] ~~**Sabit nokta (Q-format) aritmetik: Cortex-M0'da FPU yokken DSP nasıl yapılır?**~~
      — bu çalıştırmada seçildi, PR açılacak.

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

## Notlar (bu çalıştırma — 2026-06-04)

- **Sabit Nokta Aritmetik (Q15 FIR Cortex-M0)** seçildi (alan: gömülü/DSP).
  Son 4 yayınlanmış post sırasıyla: Kalman (navigasyon/füzyon, 06-02), Sistem
  Mühendisliği (sistem, 05-26), Bandpass Sampling (RF/DSP, 05-21), Renode
  (gömülü/SoC, 05-14). "Gömülü/DSP" Bandpass Sampling'in DSP boyutuyla yüzeysel
  örtüşür ama farklı alt-alandır: Bandpass DSP sinyal teorisi (Nyquist, IF
  örnekleme), bu yazı saf gömülü-implementasyon (ISA, cycle, assembly).
- Konu seçim filtresi:
  - "ARM Cortex-A boot süreci" düşünüldü, ama açık PR #90 (linker script) ile
    örtüşme riski yüksek; ertelendi.
  - "IQ örnekleme" düşünüldü, ama Bandpass Sampling (yayında 05-21) ile yakın
    alt-alan; en az 2-3 hafta beklemesi sağlıklı.
  - "MPU vs MMU" / "Endianness" / "DO-330" güçlü adaylar, bir sonraki tur için
    havuzda kalıyor.
- Derinlik öğesi (Bölüm 7): **assembly inspection + cycle benchmark.** Cortex-M0
  (Armv6-M), M3 (Armv7-M), M4 (Armv7E-M DSP) için aynı Q15 MAC kodu derlenip
  gerçek arm-none-eabi-gcc çıktısı gösteriliyor; ardından 32-tap FIR için soft-
  float ile Q15 cycle karşılaştırması.
- Novelty gerekçesi (Bölüm 8): Q-format Türkçe dokümantasyon olarak neredeyse
  yok; İngilizce kaynaklar TI app notları ve CMSIS-DSP başlık dosyalarında
  dağınık. Cortex-M0 özelinde "MAC 3 cycle vs soft-float 300 cycle" oranı
  tek bir benchmark olarak ölçülmüş değil — bu yazı boşluğu doldurur.
- Yayın kapısı durumu: son yayın 2026-06-02 (Kalman), 2 gün önce. `min_yayin_-
  araligi_gun = 2` koşulu tam sınırda sağlanıyor; PR açma için sorun yok
  (merge kararı zaten insanda).
- Açık PR yükü 17'ye çıkmış durumda — ledger'da kayıt altına alındı; insan
  inceleyicinin dikkatine.

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

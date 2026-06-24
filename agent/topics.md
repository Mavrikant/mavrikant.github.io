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
| (bu PR) | `setjmp`/`longjmp` Neden DAL A'da Yasak? — Stack Unwind, MISRA C 21.4 ve Assembly Anatomisi | post/2026-06-25-setjmp-longjmp-do-178c-dal-a | 2026-06-24 | standart/C + sertifikasyon |

> **Not:** PR #51 "MISRA C ve Statik Analiz", zaten yayında olan #69 "MISRA C:2025 ile Neler Değişti?" ile konu olarak çakışıyor olabilir. İnceleyen kişinin dikkatine.
>
> **Not:** Bu çalıştırma sırasında 33 açık PR (#150–#50 arası, çoğunluğu yazı önerisi) vardı; konu seçimi sıkı novelty filtresiyle yapıldı.

## Seçildi / Devam Eden

- **`setjmp`/`longjmp` Neden DAL A'da Yasak?** —
  dal: `post/2026-06-25-setjmp-longjmp-do-178c-dal-a`,
  dosya: `_posts/2026-06-24-setjmp-longjmp-do-178c-dal-a.md`,
  durum: PR açıldı (bu çalıştırma) — alan: standart/C + sertifikasyon.

## Reddedildi (bu çalıştırma — 2026-06-24)

- Mevcut aday havuzunun büyük çoğunluğu (Linker script, GIC, MC/DC, VOR, ILS,
  WCET, FMEA, FTA, Bellek güvenliği, Lockstep, Endianness, Sabit Nokta,
  Cortex-A boot, MPU/MMU, DMA cache, DO-326A, SEU/SECDED, Allan Deviation,
  Watchdog, Priority Inversion, Object Code Coverage, MISRA C statik analiz,
  UB, Sessiz Kalman iraksama, Worst-Case Stack, Derleyici opt -O0,
  Antikırılgan, Veri Analitiği, `volatile` ×2) **zaten açık PR halinde**;
  Faz 2'de yeniden değerlendirildi ve **`setjmp`/`longjmp` DAL A'da yasak mı?**
  konusu boşluk olarak seçildi — hiçbir açık PR ve yayında bu kesin kesişimi
  (ARM newlib assembly + MISRA Rule 21.4 + DO-178C kapsama/WCET etkisi)
  işlemiyor.

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

## Notlar (bu çalıştırma — 2026-06-24)

- **`setjmp`/`longjmp` Neden DAL A'da Yasak?** seçildi (alan: standart/C +
  sertifikasyon). Açık 33 PR taraması yapıldı; aday havuzunun yüksek-öncelikli
  kısmı ve orta-öncelikli kısmının büyük bölümü açık PR olarak halihazırda
  yazılmış. Bu konu kesişimsel: ARM newlib assembly + ISO C §7.13 + MISRA C
  Rule 21.4 + DO-178C §6.4.4 kapsama + WCET analizi etkisi. Hiçbir açık PR
  ya da yayında bu özgül kombinasyon mevcut değil.
- "Neden Türkçe içerikte bulmak zor?" yanıtı: Üç farklı disiplinin (ABI/
  assembly, C dil standardı, sertifikasyon süreçleri) kesişiminde. MISRA
  rasyonel metni ücretli; DO-178C kapsama/WCET etkileri ancak emniyet kritik
  proje deneyiminden çıkar; ARM newlib `setjmp.S`'i okuyup yorumlamak ayrı
  bir adım. Türkçe kaynaklar genelde yalnızca "setjmp ne işe yarar" düzeyinde
  kalıyor; yasak gerekçesini açan sentez yok.
- Yayın kapısı: son yayın (Coupling, 2026-06-04) ile bu yayın arasında 20 gün
  var — `min_yayin_araligi_gun = 2` fazlasıyla aşılmış. Son üç yayın
  (Coupling/yazılım, Kalman/aviyonik, Sistem Müh./sistem) ile alan farklı.
  Build (`bundle exec jekyll build`) yerel olarak temiz geçti.
- Derinlik öğesi (§7): assembly inceleme (newlib ARM `setjmp.S`) +
  standart yorumu (MISRA Rule 21.4 rasyoneli + DO-178C §6.4.4) + failure
  mode analizi (mutex/heap/FILE sızıntı senaryosu) + yeniden üretilebilir
  örnek (Cortex-A9 / -O0 vs -O2). Birden fazla derinlik öğesi taşıyor.
- Açık PR backlog'u (33 adet) önceki çalıştırmalardan birikmiş. Bu durum,
  ajan bakımından sert bir kural ihlal etmiyor (Bölüm 4 backlog sınırı
  koymuyor) ama insan inceleyicisi için dikkat çekici: ya inceleme oranı
  yetişmiyor ya da konu seçim filtresi çok geniş tutuluyor. Bir sonraki
  çalıştırma için öneri: aday havuzunda kalan boşluklar daralıyor;
  Faz 2'de "henüz açık PR olmayan" konuları açık filtreyle önceliklendir.
- Açık PR'lar konusunda inceleme önceliği yorumu (gözlem): #50 ve #51 hâlâ uzun
  süredir bekliyor; #50 eski yazıyı genişletiyor, #51 ise yayındaki MISRA C:2025
  ile büyük olasılıkla çakışıyor. İnceleyen kişinin dikkatine.

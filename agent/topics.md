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
- [x] Coupling Dengesi ve DO-178C — 2026-06-04 — alan: sertifikasyon/mimari
- [x] Antikırılgan: Belirsizlikten Güç Alan Sistemler — 2026-06-24 — alan: sistem/felsefe

## Açık PR'lar (insan inceleme bekleniyor)

> **2026-08-19'da `gh pr list` ile senkronize edildi.** Önceki hâli çok eskiydi (#50–79
> arası gösteriyordu); o yüzden bu ajan çalıştırmasında konu seçimi için deftere
> güvenilemedi ve doğrudan `gh` sorgulandı. **Her çalıştırmada bu tabloyu yeniden üret.**

**Açık PR sayısı: 40+.** Birikmiş durumda; yeni konu seçerken bu listeyi mutlaka tara.

### ⚠️ Tespit edilen mükerrer kümeler (insan dikkatine)

Aynı konuda birden fazla PR açılmış. Büyük olasılıkla tek bir yazıya indirilmeli:

- **`volatile` / C11 `_Atomic` — ALTI ayrı PR:** #100, #134, #155, #156, #157, #159.
- **WCET — iki PR:** #164 ve daha eski bir WCET PR'ı.
- **Watchdog — iki PR:** #161 ve daha eski bir watchdog PR'ı.
- **Kalman — #103** yayındaki 2026-06-02 Kalman yazısıyla örtüşebilir.
- **MISRA — #51** yayındaki MISRA C:2025 yazısıyla örtüşebilir.

### Açık PR listesi (yeniden üretmek için: `gh pr list --state open --limit 60`)

| PR # | Başlık | Alan |
|------|--------|------|
| #173 | MIL-STD-1553B Anatomisi (bu çalıştırma) | aviyonik/veri bus |
| #172 | CAST-32A → AC 20-193 multicore interference | sertifikasyon/multicore |
| #171 | Aviyonik `malloc` — DO-178C/DO-332, TLSF | gömülü/bellek |
| #170 | I/Q Örnekleme ve Analitik Sinyal | RF/DSP |
| #169 | Rate Monotonic — Liu-Layland → RTA | gerçek zamanlı |
| #168 | DO-178C Data/Control Coupling | sertifikasyon |
| #167 | RAIM — GPS integrity monitoring | navigasyon |
| #166 | C bit-field'ları wire format değildir | C/protokol |
| #165 | AFDX (ARINC 664 P7) anatomisi | aviyonik/veri bus |
| #164 | WCET — cache, ölçüm kuyruğu | gerçek zamanlı |
| #163 | Abstract Interpretation — interval domain | statik analiz |
| #162 | ARINC 653 bölümleme anatomisi | aviyonik RTOS |
| #161 | Watchdog tasarım desenleri | güvenilirlik |
| #160 | Deterministik derleme | araçlar/sertifikasyon |
| #159, #157, #156, #155, #134, #100 | `volatile` / `_Atomic` (**mükerrer küme**) | C/eşzamanlılık |
| #158 | DO-330 araç nitelendirmesi (TQL) | sertifikasyon |
| #151 | `setjmp`/`longjmp` DAL A'da neden yasak | C/sertifikasyon |
| #150 | Worst-case stack analizi | gömülü |
| #149 | Gerçek zamanlı sistemler | gerçek zamanlı |
| #147 | Derleyici optimizasyonlarını elle yazmak | gömülü/derleyici |
| #146 | Object Code Coverage — DO-178C §6.4.4.2.b | sertifikasyon |
| #145 | Cortex-A boot — reset vektöründen `main()`'e | gömülü/SoC |
| #135 | MPU vs MMU | ARM |
| #129 | Allan Deviation — IMU karakterizasyonu | navigasyon/metroloji |
| #124 | SEU, SECDED ECC, bellek scrubbing | güvenilirlik |
| #122 | Endianness'in üç katmanı (BE-8/BE-32, 1553/429) | C/protokol |
| #121 | Lockstep CPU (Cortex-R5 DCLS) | donanım/emniyet |
| #120 | Priority inversion — Mars Pathfinder | gerçek zamanlı |
| #119 | DMA ve cache — Zynq-7000 | gömülü/SoC |
| #118 | DO-326A / ED-202A siber güvenlik | sertifikasyon |
| #114 | Sabit nokta Q15 FIR — Cortex-M0 | DSP/gömülü |
| #103 | Kalman sessiz iraksama — Joseph form | navigasyon |
| #102 | ILS anatomisi | navigasyon |
| #101 | ARM GIC | ARM |
| #79 | CRC polinom seçimi | hata tespiti |
| #78 | VOR faz karşılaştırması | navigasyon |
| #77 | MC/DC kapsama | sertifikasyon |
| #67 | Bellek güvenliği (C/C++, Rust) | gömülü/güvenlik |
| #54 | C'de undefined behavior | C/derleyici |
| #51 | MISRA C ve statik analiz (**#69 ile çakışabilir**) | standart/C |
| #50 | Float denormalize FTZ/DAZ | gömülü/sayısal |
| #154 | chore: ledger sync (yazı değil) | — |

## Seçildi / Devam Eden

- **MIL-STD-1553B Anatomisi: Manchester Kodlama, RT Zamanlaması ve Sessiz Bug'lar** —
  dal: `post/2026-08-18-mil-std-1553b-anatomisi`,
  dosya: `_posts/2026-08-19-mil-std-1553b-anatomisi-manchester-rt-timing.md`,
  durum: **PR #173 açıldı** (2026-08-19) — alan: aviyonik/veri bus.
  neden az bulunuyor: erişim değil (DoD sürümü ASSIST'te ücretsiz ve public-release —
  ilk taslaktaki "paralı" iddiası yanlıştı, düzeltildi); asıl boşluk standardı *okumak*
  ile *uygulamak* arasındaki bilginin hiçbir yerde toplu olmaması + Türkçe kaynak yokluğu.

  **Bilinen kısmi örtüşme:** PR #122 (Endianness'in üç katmanı) 1553 word yapısını ve
  Manchester II'yi kendi 3. bölümünde açıklıyor. Odak farklı (o yazı bit sıralaması,
  bu yazı protokol anatomisi + zamanlama + hata modları), ama ikisi de yayınlanacaksa
  1553 word yapısının iki kez anlatılmaması için biri diğerine referans vermeli.

## Reddedildi (bu çalıştırma)

- **SEU / ECC / Bellek Scrubbing** — açık PR olarak zaten var (bkz. #146'ya karşılık gelen aday PR); duplicate riski.
- **Cortex-A Boot süreci, GIC, Linker Script, MPU vs MMU, Watchdog, Endianness, ILS, Lockstep, RAIM, AFDX, malloc/TLSF, WCET, ARINC 653, DMA/Cache, DO-330, DO-326A, Sabit Nokta, Fault Tree** — tümü açık PR'larda; şu an insan inceleme sırasında.

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

## Notlar (bu çalıştırma — 2026-05-21)

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

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
- [x] Antikırılgan Sistemler — 2026-06-24 — alan: sistem/felsefe
- [x] Dogfooding — 2026-09-04 — alan: süreç/kültür
- [x] Analitiğin Dört Hali — 2026-09-22 — alan: veri analitiği
- [x] INCOSE CSEP Sertifikasyonu — 2026-10-01 — alan: sertifikasyon/kariyer

## Açık PR'lar (insan inceleme bekleniyor)

> **UYARI — bu bölümü elle güncel tutmaya çalışmayın.** 2026-10-12 itibarıyla
> **66 açık PR** var; buraya tek tek yazmak her çalıştırmada bayatlıyor.
> Tek doğru kaynak:
>
> ```bash
> gh pr list --repo mavrikant/mavrikant.github.io --state open --limit 200
> ```
>
> Faz 2'de konu seçmeden **önce** bu komutu çalıştırın. Yayınlanmış 27 yazının
> yanı sıra 66 açık PR da konu uzayını tüketiyor; çakışma riski defterden değil
> yalnızca canlı listeden görülebilir.
>
> Birikmiş PR'larda yoğunlaşan alanlar (yeni konu seçerken kaçının):
> `volatile`/`_Atomic` (7 PR), WCET (3), DO-178C yapısal kapsama (4),
> watchdog (2), endianness (2), MC/DC, CRC, VOR, ILS, I/Q örnekleme,
> linker script, GIC, MPU/MMU, lockstep, Kalman, ARINC 653, AFDX,
> MIL-STD-1553B, RAIM, Allan deviation, sabit nokta, FTA, MTBF,
> üç kanallı oylama, senkronizatör MTBF.

## Seçildi / Devam Eden

- **Tıkalı Bir Pitot Tüpü, Hız Göstergesini Altimetreye Çevirir** —
  dal: `post/2026-10-12-tikali-pitot-hiz-gostergesi-altimetre`,
  dosya: `_posts/2026-10-12-tikali-pitot-hiz-gostergesi-altimetre.md`,
  durum: PR açıldı (2026-10-12) — alan: **hava veri / sensör arızası** (yeni alan).
  Derinlik öğesi: ISA + Saint-Venant denklemlerinden kurulan sayısal model,
  Birgenair 301 FDR kaydına (6.688 ft'te 352 kt) **5 kt içinde** oturuyor;
  QNH duyarlılık analizi ve menzil-denetimi testi dahil.

## Reddedildi

- **DO-178C ölü kod vs devre dışı kod (§6.4.4.3)** — 2026-10-12 — sertifikasyon
  alanında zaten 10+ açık PR var; alan rotasyonu gereği ertelendi (havuza alındı).
- **ARINC 429 anatomisi** — 2026-10-12 — #173 (1553B) ve #165 (AFDX) ile aynı
  "veriyolu anatomisi" kalıbı; üçüncüsü tekrar hissi verir (havuza alındı).
- **Manyetik sapma ve WMM modelinin son kullanma tarihi** — 2026-10-12 —
  ilginç ama derinlik öğesi zayıf; deney/analiz bileşeni kurulamadı.

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

### Bu çalıştırmada havuza eklenenler (2026-10-12)

- [ ] **Soğuk hava altimetre hatası** — ISA sapmasında altimetrenin *yüksek*
      okuması, ICAO soğuk hava düzeltme tablosunun türetimi ve CFIT bağlantısı —
      alan: hava veri (bu yazının doğal devamı, çakışmıyor)
- [ ] **Kısmi pitot tıkanması** — tam tıkanma yerine sızıntılı tüp: zaman sabiti,
      irtifa+zaman karışık imzası, tanılama zorluğu — alan: hava veri
- [ ] **AF447 buz kristali imzası** — mekanik tıkanmadan farklı olarak geçici ve
      iki yönlü bozulma; BEA raporu temelli — alan: hava veri
- [ ] **DO-178C ölü kod vs devre dışı kod** — §6.4.4.3 yorum belirsizliği
- [ ] **ARINC 429 anatomisi** — Harvard bi-phase, label/SDI/SSM, 32-bit kelime
- [ ] **Analitik yedeklilik (analytical redundancy)** — model tabanlı sensör
      arıza tespiti; bu yazının "ne işe yarar" bölümünün derinleştirilmesi

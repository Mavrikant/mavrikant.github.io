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
- [x] Coupling Dengesi — 2026-06-04 — alan: yazılım tasarımı
- [x] Antikırılgan Sistemler — 2026-06-24 — alan: sistem/felsefe
- [x] Dogfooding — 2026-09-04 — alan: ürün/kültür
- [x] Analitiğin Dört Hâli — 2026-09-22 — alan: veri/analitik
- [x] INCOSE CSEP Sertifikasyon Yolculuğum — 2026-10-01 — alan: sertifikasyon/kariyer

## Açık PR'lar (insan inceleme bekleniyor)

> **Bu bölümde liste TUTULMUYOR.** Master'a her merge sonrası bayatlıyordu ve
> defterdeki 7 satır gerçekteki onlarca PR'ı hiçbir zaman yansıtmadı. Konu seçmeden
> **önce** canlı listeyi oku:
>
> ```bash
> gh pr list --repo mavrikant/mavrikant.github.io --state open --limit 200 \
>   --json number,title,headRefName
> ```
>
> Adayı hem bu listeye hem `_posts/` envanterine karşı **anlam** olarak (başlık değil)
> kontrol et. 2026-10-18 sayımı: **72 açık PR**.
>
> Birikmiş PR'larda doygun alanlar: `volatile`/`_Atomic` (7+ PR), WCET (4 PR),
> DO-178C yapısal kapsama (MC/DC, object code, data/control coupling, DO-331),
> watchdog, endianness/bitfield, ARM çevre birimleri (GIC, MPU/MMU, DMA/cache, boot),
> MIL-STD-1553B, AFDX/ARINC 653, Kalman, ILS/VOR, CRC, linker script.

## Seçildi / Devam Eden

- **Manyetik Sapmanın İki Saati: Donmuş Epoch ve Kaybedilen Autoland** —
  dal: `post/2026-10-18-manyetik-sapma-donmus-epoch`,
  dosya: `_posts/2026-10-18-manyetik-sapma-donmus-epoch.md`,
  araştırma: `agent/research/2026-10-18-manyetik-sapma-donmus-epoch.md`,
  durum: PR açıldı (2026-10-18) — alan: navigasyon/jeomanyetizma + sertifikasyon.
  Derinlik öğesi: WMM küresel harmonik modelini sıfırdan kurup NOAA'nın 100 resmî
  test noktasına karşı doğrulama (D'de 0.005° — yayımlanmış hassasiyetin tavanı),
  ardından IGRF-14 DGRF ile donmuş epoch hatasının enleme göre hesabı.

## Reddedildi (2026-10-18 çalıştırması)

- **ARINC 429 etiket bit sırası / SSM BNR-BCD belirsizliği** — 2026-10-18 —
  etiket bit-reversal açısı açık PR #122'de (Endianness'in Üç Katmanı) işlenmiş;
  başlık farklı olsa da okuyucu algısında çakışır.
- **DO-178C dead code vs deactivated code** — 2026-10-18 — yapısal kapsama alanı
  4+ açık PR ile doygun; alan rotasyonu kuralına da takılıyor.
- **ARINC 424 path terminator'ları** — 2026-10-18 — spesifikasyon paywall arkasında,
  olgusal doğrulama Bölüm 10'un standardını karşılayamaz.

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

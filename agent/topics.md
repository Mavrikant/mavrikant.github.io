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
- [x] Dogfooding — 2026-09-04 — alan: ürün/kültür
- [x] Analitiğin Dört Hâli — 2026-09-22 — alan: veri analitiği
- [x] INCOSE CSEP Sertifikasyonu Yolculuğum — 2026-10-01 — alan: sertifikasyon/kariyer

## Açık PR'lar (insan inceleme bekleniyor)

> **Bu bölüm elle güncellenmiyor — tek doğru kaynak GitHub.** Konu seçmeden önce
> mutlaka şunu çalıştır:
>
> ```bash
> gh pr list --repo mavrikant/mavrikant.github.io --state open --limit 200
> ```
>
> **2026-11-01 itibarıyla 71 açık PR var.** Aşağıdaki fikir havuzunun büyük kısmı
> çoktan açık bir PR'a dönüşmüş durumda; havuzdan körlemesine konu seçmek
> neredeyse kesin olarak çakışma üretir.

Alan bazında doyum durumu (2026-11-01 taramasından):

| Alan | Durum | Örnek açık PR'lar |
|---|---|---|
| Sertifikasyon (DO-178C/330/331/332/326A) | **doygun** | #77, #118, #146, #151, #158, #163, #164, #168, #171, #172, #176, #186 |
| ARM / gömülü / SoC | **doygun** | #90, #101, #119, #121, #122, #135, #145, #150, #166, #175, #181, #183 |
| `volatile` / bellek modeli | **aşırı doygun (6 PR)** | #100, #134, #155, #156, #157, #159 |
| RF / DSP | **doygun** | #114, #170, #178, #182, #208 |
| Navigasyon | **doygun** | #78, #102, #103, #129, #167, #196, #203 |
| Güvenilirlik / emniyet | doygun | #89, #96, #124, #161, #169, #174, #179, #195 |
| Veri yolu (1553/AFDX/429) | doygun | #165, #173 |
| **Test edilebilirlik / bakım (BIT, NFF, MTBUR)** | **boş — bu çalıştırmada girildi** | — |

## Seçildi / Devam Eden

- **Söktük, Test Ettik, Arıza Yok: BIT Yanlış Alarmlarının Aritmetiği** —
  dal: `post/2026-11-01-bit-yanlis-alarm-nff-mtbur`,
  dosya: `_posts/2026-11-01-bit-yanlis-alarm-nff-mtbur.md`,
  araştırma: `agent/research/2026-11-01-bit-yanlis-alarm-nff-mtbur.md`,
  model: `agent/research/2026-11-01-bit-model.py`,
  durum: PR açıldı — alan: test edilebilirlik / bakım (yeni alan).

## Reddedildi (2026-11-01 çalıştırması)

- **ARINC 825 / CAN hata sınırlama (error confinement)** — 2026-11-01 — güçlü bir
  konu, ama #165 (AFDX) ve #173 (MIL-STD-1553B) ile birlikte üçüncü "veri yolu
  anatomisi" yazısı olurdu; alan rotasyonu kuralına takıldı. **Havuzda tutuldu.**
- **IEEE 1588 / PTP ile aviyonikte zaman senkronizasyonu** — 2026-11-01 — İngilizce
  ve Türkçe kaynak görece bol (telekom tarafından), Bölüm 8 novelty kapısını
  geçemedi.
- **Field Loadable Software (ARINC 665/666)** — 2026-11-01 — ilginç, ama #176
  (Parameter Data Item) ile veri yükleme ekseninde örtüşme riski yüksek.
  **Havuzda tutuldu.**
- **FMA contraction / kayan nokta determinizmi** — 2026-11-01 — yayındaki "Kayan
  Nokta Sayılarının Tehlikeleri" ve açık #184 (sinf argüman indirgeme), #50
  (denormal FTZ/DAZ) ile çakışıyor.

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

## Notlar (bu çalıştırma — 2026-11-01)

- **Seçilen alan yepyeni:** test edilebilirlik / bakım (BIT, NFF, MTBUR). 27 yayın
  ve 71 açık PR'ın hiçbiri bu alana girmiyor. Son 3 yayın (INCOSE CSEP, analitik,
  dogfooding) ile de alan çakışması yok.
- **#174 (MTBF Bir Ömür Değildir) ile ayrım:** o yazı emniyet ekseninde
  (10⁻⁹/uçuş saati hedefinin aritmetiği); bu yazı operasyonel güvenilirlik
  ekseninde (MTBUR, söküm hızı, yanlış alarm). Kesişim MTBF teriminin tanımıyla
  sınırlı.
- **Novelty gerekçesi:** konu pahalı standart belgelerine (ARINC 604-1, ARINC 624-1)
  ve ödeme duvarı ardındaki güvenilirlik dergilerine dağılmış durumda; üstelik
  alandaki en iyi saha verisi bir TuHK albayının IEEE makalesinde ve Türkçe
  literatürde hiç işlenmemiş.
- **Derinlik öğesi:** matematiksel türetme + sayısal doğrulama. k-ardışık onay
  filtresi için kapalı formda eşik `tau* = delta / ln(1/q)` türetildi; yanlış alarm
  olasılığı tam Markov yinelemesiyle hesaplanıp `N q^k` yaklaşımıyla karşılaştırıldı
  (3 anlamlı hanede örtüştü); yayımlanmış MTBUR/MTBF oranı ters çevrilerek ima
  edilen aralıklı arıza hızı çıkarıldı.
- **Kendi modelimin sınırını yazıya koydum:** üstel tespit yaklaşımı `tau << delta`
  rejiminde çöküyor (MC 0,0499 vs formül 2e-9); yazıda açıkça belirtildi.
- **Yerel build:** bu çalıştırmada `bundle exec jekyll build` tamamlanamadı —
  `assets/main.scss` dönüşümünde `Broken pipe` (dart-sass alt süreci ölüyor).
  Neden içerik değil, ortam: aynı anda başka bir Claude oturumu da aynı paylaşımlı
  `vendor/bundle` üzerinden build alıyordu. Jekyll yazıyı sorunsuz işledi
  (TableProcessor + MathjaxProcessor logda görünüyor). Doğrulama bunun yerine
  doğrudan kramdown ile yapıldı: 6 tablo, 1 mermaid div, 96 satır-içi + 6 display
  math span, hiçbirinde `<em>`/tablo enjeksiyonu yok.
- **Yakalanan gerçek hata:** `$\tau^{*}$` içindeki yıldız, çevresindeki `**kalın**`
  işaretleriyle çakışıp kramdown'da `<em>` bozulması üretiyordu. `\tau^{\star}`
  ile düzeltildi. **Kural: matematik içinde asla ham `*` kullanma.**

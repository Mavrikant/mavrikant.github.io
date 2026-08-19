# Konu Defteri

> Otonom yazı ajanının kalıcı belleği. Her çalıştırmada okunur ve güncellenir.
> Son senkronizasyon: **2026-08-19**

## Yazıldı (yayında)

- [x] Tümleşik Gereksinim Yönetimi — 2022-04-28 — alan: sistem/gereksinim
- [x] Yazılım Sistem Mühendisliği — 2022-04-30 — alan: sistem
- [x] Use Case Tuzakları — 2022-05-01 — alan: gereksinim/analiz
- [x] Yazılım Proje Yönetimi Pratikleri — 2022-05-01 — alan: proje yönetimi
- [x] Gereksinimler ve Test: Yedi Eksik Bağlantı — 2022-05-08 — alan: gereksinim/test
- [x] Fonksiyonel Olmayan Yazılım Gereksinimleri — 2022-07-11 — alan: gereksinim
- [x] CMake — 2022-07-19 — alan: araçlar
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
- [x] Coupling'i Dengelemek — 2026-06-04 — alan: yazılım tasarımı
- [x] Antikırılgan: Belirsizlikten Güç Alan Sistemler — 2026-06-24 — alan: sistem düşüncesi

**Son 3 yayın alt-alanı (rotasyon kısıtı için):** sistem düşüncesi · yazılım tasarımı · navigasyon/füzyon

## Açık PR'lar (insan inceleme bekleniyor)

**2026-08-19 itibarıyla 53 açık PR var.** Tek tek listelemek defteri okunmaz hâle getirdiği
için güncel liste artık burada tutulmuyor; kaynak doğrudan GitHub:

```bash
gh pr list --repo mavrikant/mavrikant.github.io --state open --limit 100
```

Backlog, konu seçimi için **çakışma listesi** olarak her çalıştırmada okunmalı. Kapsanan
alanların özeti (2026-08-19): DO-178C yapısal kapsama (MC/DC, object code, data/control
coupling), DO-330, DO-326A, WCET (3 ayrı PR), `volatile`/`_Atomic` (**7 ayrı PR** — ciddi
tekrar), ARINC 653, ARINC 664/AFDX, MIL-STD-1553B, multicore CAST-32A/AC 20-193, RTOS
çizelgeleme (RMS, priority inversion), ARM (boot, GIC, MPU/MMU, DMA/cache, lockstep),
linker script, watchdog (2 PR), deterministik derleme, statik analiz/abstract
interpretation, stack analizi, `setjmp`/`longjmp`, bit-field/endianness (2 PR), CRC,
sabit nokta, SEU/ECC, FTA, navigasyon (VOR, ILS, RAIM, Allan deviation, Kalman iraksama),
I/Q örnekleme, bellek güvenliği, UB.

> **İnceleyen kişinin dikkatine (öncelik önerisi):**
> 1. `volatile`/`_Atomic` konusunda 7 açık PR var (#100, #134, #155, #156, #157, #159 ve
>    ilgili). Biri seçilip diğerleri kapatılmalı — aksi hâlde bu konu backlog'u kilitliyor.
> 2. WCET için 3 PR (#88, #98, #164), watchdog için 2 PR (#89, #161), bit-field/endianness
>    için 2 PR (#122, #166) aynı durumda.
> 3. #51 "MISRA C ve Statik Analiz", yayındaki "MISRA C:2025 ile Neler Değişti" ile çakışıyor.
> 4. En eski PR'lar (#50, #51, #54) beş aydır bekliyor.

## Seçildi / Devam Eden

- **MTBF Bir Ömür Değildir: 10⁻⁹ Hedefinin Aritmetiği** —
  dal: `post/2026-08-19-mtbf-bir-omur-degildir`,
  dosya: `_posts/2026-08-19-mtbf-bir-omur-degildir.md`,
  araştırma: `agent/research/2026-08-19-mtbf-bir-omur-degildir.md`,
  alan: **güvenilirlik**, derinlik öğesi: matematiksel türetme + sayısal analiz,
  durum: PR açıldı (2026-08-19).

## Reddedildi

- **ARINC-429 anatomisi** — 2026-08-19 — gerekçe: açık PR'larda zaten MIL-STD-1553B (#173)
  ve AFDX/ARINC 664 (#165) var; üçüncü bir "veri yolu anatomisi" yazısı backlog'da
  doygunluk yaratır.
- **Barometrik irtifa ve ISA modeli** — 2026-08-19 — gerekçe: konu güçlü ve hâlâ havuzda,
  ama alan rotasyonu kısıtına takıldı (son yayınlanan Kalman yazısı navigasyon alanındaydı).
  Bir sonraki tur için birinci öncelikli aday.
- **CORDIC algoritması** — 2026-08-19 — gerekçe: #114 (sabit nokta Q15) ile aynı alt-alanda,
  o PR merge edilene kadar bekletilmeli.
- (önceki turlardan) MISRA C statik analiz — yayındaki MISRA C:2025 yazısıyla çakışıyor.

## Fikir Havuzu (aday konular)

### Yüksek öncelikli (kalıcı değer + Türkçe boşluk + backlog'da yok)

- [ ] **Barometrik irtifa ve ISA modeli** — alan: aviyonik/sensör — soğuk hava irtifa hatası,
      ICAO düzeltme tabloları, QNH/QNE geçişi; türetme + sayısal örnek. *(bir sonraki tur)*
- [ ] **Ortak sebep (common cause) arızaları ve β-faktör modeli** — alan: güvenilirlik —
      bu turdaki MTBF yazısının doğal devamı, ama en az bir tur beklemeli
- [ ] **Physics of Failure: sabit-λ'dan mekanizma tabanlı modellemeye** — alan: güvenilirlik
- [ ] **CORDIC: FPU'suz donanımda trigonometri** — alan: DSP/matematik *(#114 bekliyor)*
- [ ] **ARINC-429 anatomisi** — alan: veri yolu *(#173/#165 merge olduktan sonra)*
- [ ] **IEEE 1588 / PTP: aviyonikte zaman senkronizasyonu** — alan: dağıtık sistem
- [ ] **GPS sinyal edinimi: korelasyon, C/A kodu, edinim/izleme döngüleri** — alan: navigasyon
- [ ] **Türetilmiş gereksinimler (derived requirements) ve emniyet değerlendirmesine geri
      besleme** — alan: sertifikasyon/gereksinim — DO-178C §5.1.1'in en çok tartışılan maddesi
- [ ] **Dead code vs deactivated code: DO-178C §6.4.4.3** — alan: sertifikasyon
- [ ] **Formel doğrulama pratikte: SPARK / Frama-C ile bir fonksiyonun kanıtı** — alan: doğrulama

### Orta öncelikli

- [ ] MTBF üzerine Bayesçi kestirim (Telcordia yaklaşımı)
- [ ] Coffin-Manson ve sıcaklık çevrimi kaynaklı yorulma
- [ ] ARP4754B ile ARP4761A arasındaki iş bölümü — 2023 revizyonunun getirdikleri
- [ ] ECSS uzay yazılım standartları ailesi (alt-konulara bölünmeli)
- [ ] FMEA pratikte: gerçek bir alt-sistem üzerinden adım adım
- [ ] Radyasyona dayanıklı yazılım: TMR, scrubbing *(#124 SEU/ECC ile kısmi çakışma)*
- [ ] ADS-B sinyal yapısı: PPM modülasyon, mesaj formatı
- [ ] FIR vs IIR: faz cevabı, hesaplama maliyeti, stabilite

### Düşük öncelikli / sonraya bırak

- [ ] DO-254 donanım sertifikasyonu (yazarın uzmanlığı ağırlıklı yazılım tarafında)
- [ ] İzlenebilirlik matrisi (klasik konu, derinlik çıkarmak zor)

## Notlar (bu çalıştırma — 2026-08-19)

- Defter 2026-05-21'den beri güncellenmemişti; yayınlanan yazı listesi ve açık PR bölümü
  bu turda `_posts/` ve `gh pr list` ile yeniden senkronize edildi.
- **Konu seçimi:** 53 açık PR'ın hiçbiri güvenilirlik *tahmini* / MTBF konusunu işlemiyor.
  En yakını #96 (Fault Tree Analizi) — o da nitel cut-set analizi, nicel tahmin metodolojisi
  değil. Alan rotasyonu da sağlanıyor (son 3 yayın: sistem düşüncesi, yazılım tasarımı,
  navigasyon).
- **"Bu konuyu bulmak neden zor" yanıtı:** Türkçe içerikte MTBF neredeyse tamamen "ortalama
  ömür" olarak yanlış anlatılıyor. Doğru bilgi üç ayrı ve pahalı kaynak kümesine dağılmış
  durumda: standart belgeleri (MIL-HDBK-217F, FIDES 2022, IEC 61709, Telcordia SR-332),
  sertifikasyon dokümanları (AC 25.1309-1B, ARP4761A) ve akademik güvenilirlik literatürü.
  En kritik köprü — bileşen λ'sı ile 10⁻⁹/uçuş saati hedefi arasındaki *maruz kalma süresi*
  çarpanı — hiçbir Türkçe kaynakta türetilmiş hâliyle bulunmuyor.
- **Doğrulama:** Yazıdaki bütün sayılar kapalı formdan hesaplandı; 1oo2 MTTF sayısal
  integrasyonla, χ² kuantilleri tabloyla, gizli-arıza yaklaşımı tam integralle çapraz
  kontrol edildi. Yerel build (`bundle exec jekyll build`) temiz; tarayıcıda 101 MathJax
  düğümü / 0 hata, 3 Mermaid diyagramı açık ve koyu temada sorunsuz render ediyor.
- **Yayın kapısı:** son yayın 2026-06-24, aradan 56 gün geçti — `min_yayin_araligi_gun = 2`
  fazlasıyla sağlandı.

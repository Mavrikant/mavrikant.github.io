# Konu Defteri

> Otonom yazı ajanının kalıcı belleği. Her çalıştırmada okunur ve güncellenir.
> Son senkronizasyon: **2026-08-24**

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
- [x] Kalman Filtresi ve EKF — 2026-06-02 — alan: navigasyon/füzyon
- [x] Coupling'i Dengelemek — 2026-06-04 — alan: yazılım tasarımı
- [x] Antikırılgan: Belirsizlikten Güç Alan Sistemler — 2026-06-24 — alan: sistem düşüncesi

**Son 3 yayın (alan rotasyonu için):** sistem düşüncesi · yazılım tasarımı · navigasyon/füzyon

## Seçildi / Devam Eden

- **Kod Doğru, Veri Yanlış: DO-178C'de Parameter Data Item** —
  dal: `post/2026-08-24-do-178c-parameter-data-item`,
  dosya: `_posts/2026-08-24-do-178c-parameter-data-item.md`,
  araştırma: `agent/research/2026-08-24-do-178c-parameter-data-item.md`,
  durum: PR açıldı — alan: sertifikasyon/konfigürasyon verisi.

## Bu çalıştırmanın notları (2026-08-24)

- **Backlog uyarısı:** repoda **55 açık PR** var ve bunların ~50'si yayınlanmamış yazı.
  Defter en son 2026-05-21'de güncellenmişti; o tarihten sonra açılan PR'lar deftere hiç
  işlenmemiş. Bu çalıştırmada envanter GitHub'dan yeniden çekildi. Yayın kapısı kuralı
  (`min_yayin_araligi_gun = 2`) fazlasıyla sağlanıyor — son yayın 2026-06-24, arada iki ay var —
  ama **darboğaz üretimde değil, insan incelemesinde.** İnceleyen kişinin dikkatine.
- **Konu seçimi:** 24 yayınlanmış yazı + 55 açık PR başlığı taranarak anlamsal çakışma kontrolü
  yapıldı. Fikir havuzundaki yüksek öncelikli adayların neredeyse tamamı açık PR'larla tüketilmiş
  durumda (GIC, linker script, watchdog, WCET, MPU/MMU, volatile/_Atomic, IQ örnekleme, ILS,
  CRC, MC/DC, sabit nokta, lockstep, endianness, DMA/cache, SEU/ECC, DO-330, DO-326A, FTA...).
  PDI hiçbiriyle örtüşmüyor.
- **Novelty gerekçesi:** PDI, DO-178C'de tek bir bölümde toplanmamış; kavram §2.5.1, §4.2.j,
  §5.1.2, §5.4.1a, §6.6, §7.2.1, §7.2.7, §8.3, §11.16, §11.22 ve Annex A tablolarına dağılmış
  durumda. Standart ücretli olduğu için sentezlenmiş kaynak yok; Türkçe içerik ise sıfır.
  FAA'in kamuya açık "DO-178B/C Differences Tool" dokümanı bu haritayı çıkarmayı mümkün kıldı.
- **Derinlik öğesi:** gerçek deney (Apple clang 21, arm64) + standart yorumu + arıza modu analizi.
  İki C programı derlenip çalıştırıldı; çıktılar yazıya birebir alındı. CRC-32 uygulaması
  `CRC32("123456789") = 0xCBF43926` standart kontrol vektörüyle doğrulandı.
- **Reddedilenler (bu çalıştırma):** ARINC 429 anatomisi (açık PR'lardaki 1553B ve AFDX ile aynı
  "veri yolu" ailesinde, üst üste gelir); GPS hafta numarası rollover (navigasyon — son 3 yayında
  Kalman var, alan rotasyonu ihlali); kontrol yasası ayrıklaştırma (İngilizce ders kitaplarında
  doygun, novelty testini geçmiyor); derleyicinin ürettiği `__aeabi_*` runtime çağrıları
  (açık PR #146 "Object Code Coverage" ile kardeş konu, çakışma riski).

## Açık PR'lar (insan incelemesi bekliyor) — 2026-08-24 itibarıyla 55 adet

En eskiler öncelik sırasında: #50, #51, #54, #67, #77, #78, #79.
Bilinen sorun: **#51 "MISRA C ve Statik Analiz"**, yayında olan "MISRA C:2025 ile Neler Değişti"
ile büyük olasılıkla çakışıyor. Ayrıca **`volatile` konusunda altı ayrı PR var**
(#100, #134, #155, #156, #157, #159) — bunlardan en fazla biri yayınlanmalı, kalanı kapatılmalı.
Benzer şekilde WCET için iki PR (#88, #98, ayrıca #164) ve watchdog için iki PR (#89, #161) var.

> Not: tam liste `gh pr list --repo mavrikant/mavrikant.github.io --state open` ile alınır;
> burada tekrarlanmıyor çünkü hızla eskiyor.

## Fikir Havuzu (açık PR'larla çakışmayan kalan adaylar)

### Yüksek öncelikli

- [ ] **ARINC 429 anatomisi** — 32-bit kelime, label'ın sekizlik gösterimi, SDI/SSM anlambilimi,
      BNR/BCD, çözünürlük hesabı — *1553B/AFDX PR'ları merge edildikten sonra*
- [ ] **Kontrol yasası ayrıklaştırma tuzakları** — Tustin vs Euler, integrator windup,
      bumpless transfer — *novelty açısı güçlendirilmeli*
- [ ] **libc yeniden girişli değildir** — newlib `_impure_ptr`, `errno`, `__malloc_lock`,
      ISR'den `printf` — alan: gömülü/C çalışma zamanı
- [ ] **GPS hafta numarası rollover (WNRO)** — 10-bit hafta, 1999/2019 olayları, pivot yıl
      çözümü, CNAV 13-bit — alan: navigasyon/zaman
- [ ] **Dead code vs deactivated code vs extraneous code** — DO-178C §6.4.4.3 yorum belirsizliği
- [ ] **AAPCS/EABI yığın hizalaması** — ISR'de 8 bayt hizalama ihlalinin sessiz sonuçları
- [ ] **IIR katsayı kuantizasyonu** — sabit noktada kutup göçü ve stabilite kaybı
- [ ] **ARM PMU ile kesme gecikmesi ölçmek** — çevrim sayacı okumanın tuzakları

### Orta öncelikli

- [ ] DO-331 model tabanlı geliştirme ve otomatik kod üretiminin sertifikasyon kredisi
- [ ] ARP4754A — sistem geliştirme süreci
- [ ] FMEA pratikte: gerçek bir alt-sistem üzerinden adım adım
- [ ] IEEE 1588 PTP / TTEthernet — aviyonikte zaman senkronizasyonu
- [ ] Cyclic executive vs preemptive: aviyonikte neden hâlâ döngüsel çizelge
- [ ] ADS-B sinyal yapısı: PPM modülasyon, mesaj formatı
- [ ] FIR vs IIR: faz cevabı, hesaplama maliyeti, stabilite
- [ ] Robustness test case tasarımı: eşdeğerlik sınıfı ve sınır değer analizi

### Düşük öncelikli

- [ ] ECSS uzay yazılım standartları ailesi (geniş, alt-konulara bölünmeli)
- [ ] DO-254 donanım sertifikasyonu (yazarın uzmanlığı ağırlıklı yazılım tarafında)
- [ ] İzlenebilirlik matrisi (klasik konu, derinlik çıkarmak zor)

## Reddedildi (kalıcı kayıt)

- ARINC 429 — 2026-08-24 — açık PR'lardaki 1553B/AFDX ile aynı aile, üst üste gelir (ertelendi)
- GPS WNRO — 2026-08-24 — alan rotasyonu: son 3 yayında navigasyon var (ertelendi)
- Kontrol yasası ayrıklaştırma — 2026-08-24 — İngilizce literatürde doygun, novelty zayıf
- `__aeabi_*` runtime çağrıları — 2026-08-24 — açık PR #146 ile kardeş konu, çakışma riski

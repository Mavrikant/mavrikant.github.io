# Konu Defteri

> Otonom yazı ajanının kalıcı belleği. Her çalıştırmada okunur ve güncellenir.
>
> **Son senkronizasyon: 2026-11-01.** Önceki senkronizasyon 2026-05-21'di; defter altı
> aydır bayattı (7 açık PR yazıyordu, gerçekte 71 açık PR var). Konu seçmeden önce
> **mutlaka** `gh pr list --limit 200` çalıştır — defterdeki "Açık PR'lar" tablosu
> her zaman eksik olabilir.

## Yazıldı (yayında, 28 yazı)

- [x] Tümleşik Gereksinim Yönetimi — 2022-04-28 — alan: sistem/gereksinim
- [x] Yazılım Sistem Mühendisliği — 2022-04-30 — alan: sistem
- [x] Use Case Tuzakları — 2022-05-01 — alan: gereksinim/analiz
- [x] Yazılım Proje Yönetimi Pratikleri — 2022-05-01 — alan: proje yönetimi
- [x] Gereksinimler ve Test: Yedi Eksik Bağlantı — 2022-05-08 — alan: gereksinim/test
- [x] Fonksiyonel Olmayan Yazılım Gereksinimleri — 2022-07-11 — alan: gereksinim
- [x] Hello World — 2022-07-12 — alan: genel
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
- [x] Coupling Dengesi — 2026-06-04 — alan: yazılım tasarımı
- [x] Antikırılgan: Belirsizlikten Güç Alan Sistemler — 2026-06-24 — alan: sistem/felsefe
- [x] Dogfooding: Kendi Ürününü Kullanmak — 2026-09-04 — alan: ürün/süreç
- [x] Analitiğin Dört Hâli — 2026-09-22 — alan: veri analitiği
- [x] INCOSE CSEP Sertifikasyonu Yolculuğum — 2026-10-01 — alan: sertifikasyon/kariyer
- [x] İrtifanın Sıfır Noktası: Geoit Ondülasyonu — 2026-11-01 — alan: navigasyon/veri bütünlüğü
      (bu çalıştırmada PR olarak açıldı)

## Açık PR'lar — insan incelemesi bekleniyor

**2026-11-01 itibarıyla 71 açık PR var.** Tam listeyi defterde tutmak yerine şu komutla al:

```bash
gh pr list --repo Mavrikant/mavrikant.github.io --state open --limit 200 \
  --json number,title,headRefName
```

Backlog'un doygun olduğu alt-alanlar (bu alanlarda **yeni konu seçme**, çakışma kesin):

| Alt-alan | Açık PR'larda kaç kez |
|---|---|
| `volatile` / C11 `_Atomic` / bellek modeli | 7 ayrı PR (#100, #134, #155, #156, #157, #159 …) |
| WCET analizi | 3 (#88, #98, #164) |
| Watchdog tasarım desenleri | 2 (#89, #161) |
| DO-178C structural coverage (MC/DC, OCC, data/control coupling, DO-331) | #77, #146, #168, #186 |
| Kalman / navigasyon filtresi | #103 (+ yayında olan Kalman yazısı) |
| Veri yolları: 1553B, AFDX, ARINC 653 | #173, #165, #162 |
| Sayısal/DSP: IIR kuantizasyon, NCO spur, CIC, I/Q, sabit nokta, sinf | #178, #182, #208, #170, #114, #184 |
| ARM mimarisi: GIC, boot, MPU/MMU, lockstep, DMA/cache, linker script, endianness | #101, #145, #135, #121, #119, #90, #122 |
| Güvenilirlik: MTBF, FTA, SEU/ECC, priority inversion, stack analizi | #174, #96, #124, #120, #150 |
| Sertifikasyon: DO-330, DO-326A, DO-332/malloc, CAST-32A, PDI, setjmp | #158, #118, #171, #172, #176, #151 |
| Diğer: CRC polinomu, VOR, ILS, RAIM, bitfield, abstract interpretation, RMS, CDC, manyetik sapma, pitot, oylama, sayaç taşması, deterministik build, UB, MISRA, bellek güvenliği | #79, #78, #102, #167, #166, #163, #169, #179, #203, #196, #195, #183, #160, #54, #51, #67 |

> **Not:** PR #51 "MISRA C ve Statik Analiz", yayında olan "MISRA C:2025 ile Neler Değişti"
> ile çakışıyor olabilir. Ayrıca #88/#98/#164 (WCET) ve #89/#161 (watchdog) birbirinin
> neredeyse aynısı; #155/#156/#157/#159/#100/#134 (volatile) altı kez tekrar etmiş.
> İnceleyen kişinin bu kümeleri birleştirmesi ya da kapatması gerekiyor.

## Seçildi / Devam Eden

- **İrtifanın Sıfır Noktası: Geoit Ondülasyonu ve CRC'nin Yakalayamadığı 37 Metre** —
  dal: `post/2026-11-01-irtifanin-sifir-noktasi-geoit-ondulasyonu`,
  dosya: `_posts/2026-11-01-irtifanin-sifir-noktasi-geoit-ondulasyonu.md`,
  araştırma: `agent/research/2026-11-01-irtifanin-sifir-noktasi-geoit-ondulasyonu.md`,
  durum: PR açıldı — alan: navigasyon / aviyonik veri bütünlüğü.
  Derinlik öğeleri: tekrar üretilebilir sayısal deney (EGM96/EGM2008 ızgara hesabı +
  CRC-32Q gerçeklemesi + FAS data block paketleme), hata modu analizi, standart yorumu.

## Reddedildi (bu çalıştırma)

- **DO-333 formel yöntemler eki** — 2026-11-01 — reddedilmedi, *ertelendi*: konu güçlü ve
  havuzda yok, ama son yayınlanan yazı (INCOSE CSEP) sertifikasyon alanındaydı; alan
  rotasyonu için bu çalıştırmada navigasyon tarafı seçildi. **Sonraki çalıştırmanın en
  güçlü adayı.**
- **ADC ENOB / dither / noise shaping** — 2026-11-01 — yayında olan "Bandpass Sampling"
  yazısıyla ve #182 (NCO spur) ile kısmi örtüşme riski; ertelendi.
- **CAN / ARINC 825 bit stuffing ve en kötü durum çerçeve süresi** — 2026-11-01 —
  sağlam konu, ama #169 (rate monotonic) ve #164 (WCET) ile zamanlama analizi tarafında
  komşu; backlog boşalınca tekrar değerlendir.
- **RTOS tick kuantizasyonu: "gecikme süresi zaman değildir"** — 2026-11-01 — #169 (rate
  monotonic / RTA) ile anlamsal örtüşme; reddedildi.

## Fikir Havuzu (aday konular)

> Aşağıdakiler 2026-11-01'de 71 açık PR'ın tamamına karşı kontrol edildi.
> **Havuzun eski yüksek öncelikli maddelerinin hemen hepsi artık açık PR'larda var**
> (Cortex-A boot #145, MC/DC #77, CRC #79, WCET #88/#98/#164, I/Q #170, GIC #101,
> linker script #90, watchdog #89/#161, volatile ×7, VOR #78, ILS #102, Kalman #103,
> sabit nokta #114, DO-330 #158, DO-326A #118, FTA #96, SEU #124, MPU/MMU #135,
> lockstep #121, DMA/cache #119, endianness #122, deterministik build #160).
> Bu yüzden havuz sıfırdan kuruldu; aşağıdakiler backlog'da **yok**.

### Yüksek öncelikli (kalıcı değer + Türkçe boşluk + backlog'da yok)

- [ ] **DO-333 formel yöntemler eki** — alan: sertifikasyon/formel — hangi DO-178C
      objektifi formel analizle karşılanabilir, hangisi karşılanamaz; Frama-C/ACSL ya da
      SPARK ile gerçek kanıt çıktısı. (DO-331/332/330 backlog'da var, 333 YOK.)
- [ ] **eTOD ve TAWS veritabanlarında düşey datum tutarlılığı** — alan: navigasyon/veri —
      bu çalıştırmanın yazısının açık bıraktığı uç; arazi verisi ortometrik, konum
      elipsoidal.
- [ ] **ARINC 429 SSM semantiği ve veri tazeliği** — alan: veri yolu — NCD/FT/FW
      durumlarının yanlış yorumlanması; 1553B (#173) ve AFDX (#165) var, 429'un kendi
      anatomisi yok.
- [ ] **GNSS hafta numarası sarması ve artık saniyeler** — alan: navigasyon/zaman —
      #183 sayaç taşmasını genel olarak işliyor; GPS zaman çatısı ayrı ve derin.
- [ ] **Soğuk hava altimetre düzeltmesi ve Baro-VNAV sıcaklık limitleri** — alan:
      navigasyon — bu yazıda yalnızca karşıtlık olarak değinildi, kendi başına yazı olur.
- [ ] **Jitter ve kesme gecikmesi ölçümü** — alan: gerçek zamanlı — #101 GIC'i anlatıyor
      ama ölçüm metodolojisi (en kötü durum gecikme nasıl ölçülür) boş.
- [ ] **Grup gecikmesi ve faz doğrusallığı kontrol döngülerinde** — alan: DSP/kontrol —
      #178 katsayı kuantizasyonunu işliyor, faz tarafı boş.

### Orta öncelikli

- [ ] ARP4754A — sistem geliştirme süreci ve DAL atama
- [ ] FMEA pratikte: gerçek bir alt-sistem üzerinden adım adım
- [ ] ECSS uzay yazılım standartları ailesi (alt-konulara bölünmeli)
- [ ] DO-254 donanım sertifikasyonu
- [ ] ADS-B sinyal yapısı: PPM modülasyon, mesaj formatı
- [ ] İzlenebilirlik matrisi (klasik; derinlik çıkarmak zor)
- [ ] CAN / ARINC 825 bit stuffing ve en kötü durum çerçeve süresi (bkz. Reddedildi)
- [ ] ADC ENOB / dither / noise shaping (bkz. Reddedildi)

## Notlar (bu çalıştırma — 2026-11-01)

- **Alan rotasyonu:** son üç yayın INCOSE CSEP (sertifikasyon), Analitiğin Dört Hâli
  (veri analitiği), Dogfooding (ürün/süreç) idi. Bu yazı navigasyon/veri bütünlüğü
  alanında — üçünden de farklı.
- **Yayın kapısı:** son yayın 2026-10-01; bugün 2026-11-01, yani 31 gün geçti.
  `min_yayin_araligi_gun = 2` fazlasıyla sağlandı. Öz-denetim listesinin tamamı geçti.
- **Backlog uyarısı:** 71 açık PR var ve bunların en az üç kümesi kendi içinde tekrar
  ediyor (volatile ×7, WCET ×3, watchdog ×2). Ajan her çalıştırmada konu eklediği için
  backlog büyüyor ama erimiyor. Bölüm 4 yalnızca "teslim PR ile olmalı" diyor, backlog
  sınırı koymuyor; yine de insan incelemesi için **önce tekrarlanan kümelerin
  kapatılması** öneriliyor.
- **Defter bakımı:** "Açık PR'lar" tablosu artık tek tek PR listesi tutmuyor — altı ayda
  bayatladığı için bunun sürdürülebilir olmadığı görüldü. Yerine doygun alt-alan tablosu
  + canlı `gh pr list` komutu konuldu.
- **Doğrulama notu:** yazıdaki sayıların bir kısmı bu çalıştırmada hesaplandı
  (EGM96/EGM2008 ızgara interpolasyonu, CRC-32Q, FAS blok paketleme, yaklaşma geometrisi).
  Ayrıştırıcı üç bağımsız referans noktasına, CRC ise katalog check değerine (0x3010BF7F)
  karşı doğrulandı. Ayrıntı araştırma notunda.

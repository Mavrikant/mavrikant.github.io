# Konu Defteri

> Otonom yazı ajanının kalıcı belleği. Her çalıştırmada okunur ve güncellenir.
> **Son senkronizasyon: 2026-08-27.**

## UYARI — Tekrar Eden Konu Sorunu

2026-08-27 itibarıyla depoda **58 açık PR** var ve içlerinde ciddi tekrarlar bulunuyor:

| Konu | Çakışan PR'lar |
|---|---|
| `volatile` / C11 `_Atomic` / bellek modeli | #100, #134, #155, #156, #157, #159 (**altı ayrı PR**) |
| WCET analizi | #88, #98, #164 |
| Watchdog tasarım desenleri | #89, #161 |
| MISRA C + statik analiz | #51 (yayında olan MISRA C:2025 yazısıyla da çakışıyor) |

**Bu defter 2026-05-21'den 2026-08-27'ye kadar güncellenmemişti; tekrarların ana
sebebi bu.** Faz 2'de konu seçmeden önce **mutlaka** hem `_posts/` hem de
`gh pr list --limit 100` çıktısı okunmalı — sadece bu defter yeterli değil.

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
- [x] Antikırılgan: Belirsizlikten Güç Alan Sistemler — 2026-06-24 — alan: sistem/felsefe

## Açık PR'lar

58 açık PR var; tam liste için:

```bash
gh pr list --repo mavrikant/mavrikant.github.io --state open --limit 100
```

**Açık PR'lar tarafından ZATEN TUTULAN konular** (yeni yazı için seçilemez):

`volatile`/`_Atomic` · WCET · watchdog · linker script · GIC · MPU vs MMU ·
Cortex-A boot · DMA & cache tutarlılığı · lockstep CPU · endianness/bit-field ·
SEU + SECDED + scrubbing · Allan deviation · sabit nokta Q15 · IIR katsayı
kuantizasyonu · I/Q örnekleme · VOR · ILS · Kalman iraksaması · RAIM ·
MIL-STD-1553B · AFDX/ARINC-664 · ARINC-653 · CAST-32A multicore · MC/DC ·
object code coverage · data/control coupling · DO-330 · DO-326A · DO-332/malloc ·
parameter data item · deterministik derleme · abstract interpretation ·
setjmp/longjmp · worst-case stack · rate monotonic · MTBF aritmetiği · CRC
polinomu · fault tree analizi · priority inversion · bellek güvenliği ·
tanımsız davranış · QSPI flash güç kesintisi · derleyici optimizasyonu

## Seçildi / Devam Eden

- **İki Flip-Flop Yeter mi? Senkronizatör MTBF'i ve Çok-Bitli CDC Tuzağı** —
  dal: `post/2026-08-27-iki-flip-flop-yeter-mi-senkronizator-mtbf`,
  dosya: `_posts/2026-08-27-iki-flip-flop-yeter-mi-senkronizator-mtbf.md`,
  araştırma: `agent/research/2026-08-27-iki-flip-flop-yeter-mi.md`,
  durum: **PR açıldı** — alan: FPGA/dijital tasarım + güvenilirlik.
  Derinlik öğesi: matematiksel türetme + üretici katsayılarıyla sayısal analiz
  (`agent/research/mtbf_calc.py`) + yeniden üretilebilir simülasyon
  (`agent/research/cdc_sim.py`).

## Reddedildi (bu çalıştırma)

- **SEU / SECDED / bellek scrubbing** — 2026-08-27 — PR #124 tarafından tutuluyor.
- **DMA ve cache tutarlılığı (Cortex-A9 sessiz veri bozulması)** — 2026-08-27 —
  PR #119 tarafından tutuluyor; ayrıca #157 ile kısmi örtüşme.
- **ARINC 429 anatomisi** — 2026-08-27 — #173 (1553B) ve #165 (AFDX) ile birlikte
  üçüncü "veriyolu anatomisi" yazısı olurdu; kalıp tekrarı.
- **DO-254 / FPGA sertifikasyonu genel bakış** — 2026-08-27 — süreç ağırlıklı,
  Bölüm 7 derinlik öğesi için somut malzeme yok.

## Fikir Havuzu (açık PR'larla ÇAKIŞMAYAN adaylar)

2026-08-27'de tüm havuz açık PR listesine karşı denetlendi; tutulmuş konular
çıkarıldı. Kalanlar:

### Yüksek öncelikli

- [ ] **IEEE 1588 PTP ve IRIG-B: dağıtık aviyonikte zaman senkronizasyonu** —
      alan: zamanlama — jitter/hata bütçesi türetmesi mümkün
- [ ] **GPS hafta numarası rollover ve zaman ölçekleri (GPS/TAI/UTC, sıçrama
      saniyesi)** — alan: navigasyon/zaman — gerçek olay analizi
- [ ] **Fault injection ve robustness testing (DO-178C 6.4.2.2)** —
      alan: doğrulama — eşdeğerlik sınıfı türetmesi
- [ ] **FPGA'da senkronizatör dışı CDC: reset domain crossing (RDC)** —
      alan: dijital tasarım — bu çalıştırmanın yazısının doğal devamı
- [ ] **Frama-C / SPARK ile deduktif doğrulama** — alan: formel yöntem —
      #163'teki abstract interpretation'dan farklı (kanıt vs yaklaşım)
- [ ] **CBIT yanlış alarmları ve "No Fault Found" ekonomisi** —
      alan: güvenilirlik/bakım — yayımlanmış NFF istatistikleri var
- [ ] **Matris kondisyon sayısı ve kötü koşullu en küçük kareler** —
      alan: sayısal — Kalman yazısından farklı açı

### Orta öncelikli

- [ ] ECSS uzay standartları ailesi ve DO-178C ile karşılaştırma
- [ ] ARP4754A — sistem geliştirme süreci ve DAL tahsisi
- [ ] FMEA pratikte: gerçek bir alt-sistem üzerinden adım adım
- [ ] İzlenebilirlik matrisi kurma: pratik tuzaklar
- [ ] Doğrulama vs geçerleme (verification vs validation) ayrımı
- [ ] Yapısal kapsama otomasyonu ve araç nitelendirme etkileşimi

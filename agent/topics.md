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
- [x] Antikırılgan (Taleb) — 2026-06-24 — alan: sistem/felsefe

## Açık PR'lar (insan inceleme bekleniyor — 2026-07-12 tarama)

Uzun bir açık PR yığını var (bu çalıştırma öncesi 20+ post PR'ı). Ledger listesi
son çalıştırmadan bu yana ciddi biçimde eskidi. Aşağıda son çalıştırmalarda açılan
ve inceleme bekleyen ana grupların özeti:

- **DAL A / DO-178C / Emniyet-kritik**: MC/DC (#77), setjmp/longjmp DAL A (#151),
  Object Code Coverage (#146), DO-330 araç nitelendirme (#158), Deterministik
  derleme + DO-178C SECI (#160), DO-326A/ED-202A siber güvenlik (#118).
- **ARM / gömülü**: Cortex-A Boot (#145), MPU vs MMU (#135), Endianness üç katman
  (#122), Lockstep DCLS (#121), DMA + cache (#119), ARM GIC (#101), Linker Script
  (#90), Sabit nokta Q15 FIR (#114).
- **Concurrency / bellek modeli**: `volatile` üzerine çok sayıda benzer PR
  (#134, #100, #155, #156, #157, #159 — büyük olasılıkla dedupe gerekir).
- **RTOS / IMA**: ARINC 653 (#162), Watchdog tasarım desenleri (#161),
  Priority Inversion Mars Pathfinder (#120).
- **Navigasyon**: VOR (#78), ILS (#102), Kalman Joseph form (#103),
  Allan Deviation (#129).
- **Analiz / test**: WCET (#98, #88 — dupe), Fault Tree (#96), Bellek güvenliği (#67).
- **Diğer**: SEU/SECDED ECC (#124), Dört aşamalı veri analitiği (#99), CRC polinom
  seçimi (#79), Undefined Behavior (#54).

> **Genel not**: Açık PR sayısı 20'yi geçti; ledger'daki tekrarlar (özellikle
> `volatile` grubu ve WCET çiftlemesi) inceleyicinin dikkatine. Yeni yazı,
> hiçbirisiyle konu örtüşmüyor (formel yöntemler / abstract interpretation).

## Seçildi / Devam Eden

- **Abstract Interpretation Pratikte: Interval Domain Neyi Kanıtlar,
  Neyi Kanıtlamaz?** —
  dal: `post/2026-07-12-abstract-interpretation-interval-domain`,
  dosya: `_posts/2026-07-12-abstract-interpretation-interval-domain.md`,
  durum: PR açılıyor (bu çalıştırma) — alan: formel yöntemler / statik analiz.

## Reddedildi (bu çalıştırma)

- **MIL-STD-1553B — Manchester II + RT/BC/MC**: reddedilmedi, sonraki
  çalıştırmaya bırakıldı (foundational aviation, iyi bir sonraki aday).
- **AFDX / ARINC 664 Part 7**: ARINC 653'ün (PR #162) IMA kardeşi olduğu için
  domain rotasyonu adına bu çalıştırmada seçilmedi; havacılık ağı sırası gelmişken
  bir 2-3 yazı sonra ele alınabilir.

## Fikir Havuzu (aday konular — gelecek çalıştırma için)

### Yüksek öncelikli (kalıcı değer + Türkçe boşluk)

- [ ] **MIL-STD-1553B: Manchester II Kodlaması + RT/BC/MC Anatomisi** —
      alan: aviyonik veri yolu, foundational; sinyal analizi + bit hata toleransı
- [ ] **AFDX / ARINC 664 Part 7: BAG, VL Redundancy ve Deterministik Ethernet** —
      alan: modern aviyonik ağ; ARINC 653'ten sonra sırada
- [ ] **IQ Örnekleme: Neden Karmaşık Sinyal, Neden Negatif Frekans?** —
      alan: RF/DSP; Bandpass sampling yazısının doğal devamı, matematik ağır
- [ ] **FIR vs IIR: Faz Cevabı, Stabilite ve Hesaplama Maliyeti** —
      alan: DSP; Q15 FIR yazısını (#114) tamamlar niteliğinde
- [ ] **ADS-B Extended Squitter: 112-bit Framing + PPM + CRC-24** —
      alan: navigasyon; SDR ile üretilebilir bir deney
- [ ] **Frama-C ile EVA: açık kaynak abstract interpretation deneme rehberi** —
      alan: statik analiz; bu yazının doğal pratik devamı
- [ ] **DO-333 Formel Yöntemler Eki (Formal Methods Supplement)** —
      alan: sertifikasyon; sound analyzer ile MC/DC replacement pratiği
- [ ] **Interval Contractor Programming (HC4, SIVIA)** — alan: geometrik/nümerik
      hesaplama; yörünge analizinde INS envelope hesabı için kullanışlı

### Orta öncelikli (kovaya alındı)

- [ ] ARP4754A — sistem geliştirme süreci
- [ ] FMEA pratikte: gerçek bir alt-sistem üzerinden adım adım
- [ ] Cache coherency ve MESI: ARM CCI/CMN, race condition örneği
- [ ] MISRA C Directive 4.1 (RTE'ye karşı savunma) ve sound analyzer ilişkisi
- [ ] IEEE 754 subnormal davranışın Cortex-A vs x86'daki farkı
- [ ] Radar Cross Section basics (yazarın uzmanlığına yakın değil, atlanabilir)
- [ ] Time-Triggered Ethernet SAE AS-6003 TTP vs IEEE 802.1AS
- [ ] Bounded Model Checking (BMC) — CBMC / ESBMC pratikte

### Düşük öncelikli / sonraya bırak

- [ ] ECSS uzay yazılım standartları ailesi (geniş, alt-konulara bölünmeli)
- [ ] DO-254 donanım sertifikasyonu (yazarın uzmanlığı ağırlıklı yazılım tarafında)
- [ ] İzlenebilirlik matrisi (klasik konu, derinlik çıkarmak zor)

## Notlar (bu çalıştırma — 2026-07-12)

- **Abstract Interpretation** seçildi. Son yayın 2026-06-24 (Antikırılgan);
  18 gün geçmiş — `min_yayin_araligi_gun=2` fazlasıyla sağlandı. Son 3 yazı
  farklı alt-alan (sistem/felsefe, yazılım tasarımı, füzyon); bu yazı yeni bir
  alan (formel yöntemler / statik analiz) getiriyor.
- "Neden bulunması zor" yanıtı: Cousot 1977 makalesi matematik ağır, İngilizce.
  Ticari araçlar (Astrée, Polyspace, TrustInSoft) iç domain işleyişini kapalı
  tutuyor. Türkçe içerik "Polyspace kullanın" seviyesinde kalıyor; interval
  domain'in *niye* sound, *ne zaman* yanlış alarm ürettiği matematiğini anlatan
  Türkçe kaynak yok.
- Derinlik öğesi: Küçük bir C fonksiyonu üzerinde interval domain'in el ile trace
  edilmesi, widening'in devreye girdiği somut nokta ve interval'in tıkandığı
  gerçek false positive örneği (k() fonksiyonu, `x==y ∧ x!=0` yolu).
- Yayın kapısı durumu: 20+ açık PR var; ledger'daki eski liste güncellendi.
  Bu yazı yeni PR olarak açılıyor — hiçbirisiyle konu örtüşmüyor.
- Yerel `bundle exec jekyll build` başarılı (367 Sass deprecation uyarısı ihmal;
  bunlar tema kaynaklı, upstream Bootstrap SCSS'in eski `if()` sözdiziminden).

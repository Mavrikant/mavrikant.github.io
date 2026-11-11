# Konu Defteri

> Otonom yazı ajanının kalıcı belleği. Her çalıştırmada okunur ve güncellenir.
> **Son senkronizasyon: 2026-09-01.** (Önceki senkronizasyon 2026-05-21'di; defter
> aradaki çalıştırmalarda güncellenmediği için bu turda baştan yenilendi.)

## Yazıldı (yayında, `_posts/` ile senkron)

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
- [x] Antikırılgan — 2026-06-24 — alan: sistem düşüncesi

**Son 3 yayın alanı (rotasyon kısıtı için):** sistem düşüncesi → yazılım tasarımı →
navigasyon/füzyon.

## Açık PR'lar — BACKLOG UYARISI

**2026-09-01 itibarıyla 62 açık PR var** ve neredeyse tamamı bu ajanın açtığı yazı
PR'ları. Tek tek tablolamak defteri okunmaz hâle getiriyor; bunun yerine **kapsanan
alanlar** aşağıda. Yeni konu seçmeden önce mutlaka çalıştır:

```bash
gh pr list --repo Mavrikant/mavrikant.github.io --state open --limit 200 \
  --json number,title --jq '.[] | "\(.number)\t\(.title)"'
```

Açık PR'ların doyurduğu alanlar (yeni konu bu başlıklarla **çakışmamalı**):

| Alan | Açık PR'larda işlenmiş konular |
|---|---|
| DO-178C / sertifikasyon | MC/DC, object code coverage, data & control coupling, parameter data item, DO-330 TQL, DO-332 + `malloc`, DO-326A, CAST-32A / AC 20-193, `setjmp`/`longjmp` DAL A |
| Gerçek zamanlı / zamanlama | WCET (×3), Rate Monotonic + RTA, ARINC 653, watchdog (×2), priority inversion |
| C dili / derleyici | `volatile` + `_Atomic` (**×6 — aşırı doygun**), undefined behavior, MISRA + statik analiz, bit-field wire format, endianness, abstract interpretation, deterministik derleme, bellek güvenliği |
| ARM / SoC | Cortex-A boot, GIC, MPU vs MMU, DMA + cache, lockstep, worst-case stack, linker script |
| Veri yolu / ağ | MIL-STD-1553B, AFDX (ARINC 664 P7) |
| RF / DSP | NCO faz kırpma spurları, IIR katsayı kuantizasyonu, I/Q örnekleme, sabit nokta Q15 FIR, VOR, ILS |
| Navigasyon | RAIM, Kalman (Joseph form), Allan deviation |
| Güvenilirlik | MTBF aritmetiği, FTA + minimal cut set, SEU/SECDED + scrubbing, QSPI flash güç kesintisi |
| Araç / diğer | CDC senkronizatör MTBF, halt-mode debug gözlemci etkisi, CRC polinom seçimi, veri analitiği |

> **İnceleyen kişiye not:** backlog'da açık çakışmalar var — özellikle `volatile`
> konusunda altı ayrı PR (#100, #134, #155, #156, #157, #159) ve WCET konusunda üç
> ayrı PR (#88, #98, #164). Bunların çoğu merge edilmeden kapatılmalı. Ayrıca #89 ve
> #161 (watchdog) ile #103 ve mevcut Kalman yazısı da çakışıyor.

## Seçildi / Devam Eden

- **248 Gün, 149 Saat, 51 Gün: Aviyonikte Sayaç Taşmasının Anatomisi** —
  dal: `post/2026-09-01-sayac-tasmasi-248-gun-149-saat-51-gun`,
  dosya: `_posts/2026-09-01-sayac-tasmasi-248-gun-149-saat-51-gun.md`,
  durum: PR açıldı (2026-09-01) — alan: güvenilirlik / olay analizi + C.
  Derinlik öğesi: (a) üç gerçek AD üzerinden failure-mode analizi, (b) sarma
  sürelerinin aritmetik geri çıkarımı, (c) çalıştırılmış C deneyi + gerçek çıktı,
  (d) arm64/thumbv7m assembly incelemesi, (e) DO-178C §6.4.2.2 yorumu.

## Reddedildi (bu çalıştırma)

- **Guard banding / ölçüm karar riski (ILAC-G8, JCGM 106)** — 2026-09-01 —
  gerekçe: yayındaki "Ölçüm Belirsizliği" (2026-05-06) yazısı zaten ILAC G8 karar
  kuralını, kabul aralığını, risk yönünü ve "kabul mü red mi" örneğini işliyor.
  Anlamsal çakışma.
- **ADC test metrolojisi (IEEE 1241, ENOB, FFT processing gain)** — 2026-09-01 —
  gerekçe: açık PR #182 (NCO faz kırpma spurları) ve #178 (IIR kuantizasyonu) ile
  kuantizasyon-gürültüsü ekseninde çakışma riski yüksek. Havuzda tutuldu.
- **ARINC 429 anatomisi** — 2026-09-01 — gerekçe: açık PR #173 (MIL-STD-1553B) ve
  #165 (AFDX) ile aynı "veri yolu anatomisi" kalıbının üçüncü tekrarı olurdu.
  Havuzda tutuldu.

## Fikir Havuzu (aday konular — gelecek çalıştırma için)

Aşağıdakiler hem yayındaki yazılarla hem de 62 açık PR ile çakışmıyor.

### Yüksek öncelikli

- [ ] **ADC test metrolojisi: IEEE 1241, sine-fit, ENOB ve FFT processing gain
      yanılgısı** — alan: metroloji/DSP — "FFT gürültü tabanı ADC'nin gürültü tabanı
      değildir" ekseni; koherent örnekleme ve pencereleme. (Bu turda PR çakışma riski
      nedeniyle beklemeye alındı.)
- [ ] **Türetilmiş gereksinimler (derived requirements) ve emniyet değerlendirmesine
      geri besleme — DO-178C §5.1.1.b** — alan: gereksinim/sertifikasyon — en çok
      yanlış uygulanan DO-178C maddelerinden biri.
- [ ] **Dead code vs deactivated code — DO-178C §6.4.4.3** — alan: sertifikasyon —
      ikisinin karıştırılması klasik bulgu kaynağı; object code coverage PR'ıyla
      çakışmadığı doğrulanmalı.
- [ ] **ARINC 429 anatomisi: 32 bit kelime, SSM/SDI, Manchester değil BPRZ** —
      alan: veri yolu — beklemede (yukarıya bakınız).
- [ ] **IEEE 1588 PTP / TTEthernet: aviyonikte zaman senkronizasyonu** —
      alan: ağ/zamanlama — bu turdaki sayaç yazısının doğal devamı, çakışma yok.
- [ ] **CORDIC: FPU'suz donanımda `atan2` ve sin/cos** — alan: DSP/gömülü —
      sabit nokta PR'ıyla (#114) çakışmadığı doğrulanmalı.
- [ ] **Frama-C / SPARK ile deductive verification ve DO-333 formel yöntemler eki** —
      alan: formel doğrulama — #163 (abstract interpretation) ile sınır dikkatli
      çizilmeli: orada soyut yorumlama, burada tümdengelimli kanıtlama.

### Orta öncelikli

- [ ] ARP4754A — sistem geliştirme süreci ve DAL tahsisi
- [ ] FMEA pratikte: gerçek bir alt-sistem üzerinden adım adım
- [ ] ECSS uzay yazılım standartları ailesi (alt-konulara bölünmeli)
- [ ] DO-254 donanım sertifikasyonu
- [ ] ADS-B sinyal yapısı: PPM modülasyon, mesaj formatı
- [ ] FIR vs IIR: faz cevabı, hesaplama maliyeti, stabilite
- [ ] Sensör füzyonunda gözlemlenebilirlik: ne zaman kestirim yapılamaz
- [ ] Radyasyon ortamında TMR ve oylama mantığının tuzakları (#124 ile sınır kontrolü)

### Düşük öncelikli

- [ ] İzlenebilirlik matrisi (klasik konu, derinlik çıkarmak zor)
- [ ] Yapısal kapsama otomasyonu (araç odaklı, kalıcılığı düşük)

## Notlar (bu çalıştırma — 2026-09-01)

- **Yayın kapısı üç koşulu da sağlandı:** (1) öz-denetim listesi tamamlandı,
  (2) son yayından (2026-06-24) bu yana 69 gün geçti — `min_yayin_araligi_gun = 2`
  fazlasıyla sağlandı, (3) konu 23 yayın ve 62 açık PR ile karşılaştırıldı, anlamsal
  çakışma bulunmadı.
- **Alan rotasyonu:** son üç yayın sistem düşüncesi / yazılım tasarımı /
  navigasyon idi; bu yazı güvenilirlik + olay analizi alanına geçiyor. Blogda daha
  önce hiç havacılık olay/direktif analizi yapılmamıştı — tohum listesindeki
  "havacılık olay analizleri" kalemi ilk kez kullanıldı.
- **"Bu konuyu bulmak neden zor" yanıtı:** üç direktif de ayrı ayrı basında yer aldı
  ama hiçbir yerde **tek bir arıza sınıfı** olarak sentezlenmedi; sürelerin aritmetiği
  (2³¹ × 10 ms = 248,55 gün) hiçbir resmî belgede açıklanmıyor; DO-178C §6.4.2.2 ile
  bağlantısı kurulmuş bir kaynak bulunamadı; Türkçe içerik sıfır.
- **Yerel build doğrulandı:** Homebrew `ruby@3.2` ile `bundle exec jekyll build`
  temiz geçti (yalnızca mevcut Sass deprecation uyarıları). Üretilen HTML'de mermaid
  bloğu bozulmadan render oldu, 2 tablo (beklenen sayı), 3 iç bağlantının üçü de
  geçerli hedefe çözüldü.
- **Gelecek-tarih tuzağı:** `date` saati 07:00:00 olarak ayarlandı (deploy sırasında
  geçmişte kalması için).
- **Defter bakımı:** bu defter 2026-05-21'den beri güncellenmemişti; aradaki ~55 PR
  deftere hiç işlenmemişti. Backlog artık tek tek tablolanmıyor, alan bazında
  özetleniyor — 62 PR'lık listeyi elle senkron tutmak sürdürülebilir değil.

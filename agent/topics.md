# Konu Defteri

> Otonom yazı ajanının kalıcı belleği. Her çalıştırmada okunur ve güncellenir.
>
> **Son senkronizasyon: 2026-08-24.** Bundan önceki senkronizasyon 2026-05-21'deydi;
> defter üç ay boyunca güncellenmedi ve bu süre içinde **çok sayıda mükerrer konu**
> üretildi (aşağıya bakınız). Bu defter artık açık PR'ları da kapsıyor.

---

## ⚠️ FAZ 2 İÇİN ZORUNLU ADIM — Önce Açık PR'ları Oku

Konu seçmeden önce **yalnızca `_posts/` klasörüne bakmak yetmez.** Yayına girmemiş
ama zaten yazılmış 50'den fazla yazı açık PR olarak bekliyor. Bu adım atlandığı için
aynı konu defalarca yazıldı.

```bash
gh pr list --repo mavrikant/mavrikant.github.io --state open --limit 200 \
  --json number,title,headRefName,createdAt
```

Bir konu, **açık bir PR'da işlenmişse "işlenmiş" sayılır** ve yeniden seçilemez.

---

## 🔴 Tespit Edilen Mükerrer Kümeler (insan müdahalesi gerekiyor)

Aşağıdaki PR grupları büyük ölçüde **aynı konuyu** işliyor. İnceleyen kişinin her
kümeden birini seçip diğerlerini kapatması gerekiyor:

| Küme | PR'lar | Not |
|---|---|---|
| **`volatile` / C11 `_Atomic` / bellek modeli** | #100, #134, #155, #156, #157, #159 | **Altı ayrı PR, tek konu.** En ağır mükerrerlik. |
| **WCET analizi** | #88, #98, #164 | Üç PR; #164 (cache + DO-178C 6.3.4.f) en spesifik olanı. |
| **Watchdog tasarım desenleri** | #89, #161 | İki PR, neredeyse aynı kapsam. |
| **Endianness / bit-field wire format** | #122, #166 | Kısmi örtüşme; #166 dar ve derin, #122 geniş. |
| **MISRA C** | #51 vs yayındaki `2026-04-05-misra-c-2025` | #51 muhtemelen gereksiz. |
| **Kalman filtresi** | #103 vs yayındaki `2026-06-02-kalman-filtresi` | #103 ileri seviye (Joseph form) — tamamlayıcı olabilir. |
| **Gerçek zamanlı / scheduling** | #149, #169 | #169 (RMS/RTA) spesifik, #149 genel. |

Ayrıca eski ve muhtemelen bayatlamış PR'lar: #50, #51, #54, #67 (Mart–Nisan 2026).

---

## Yazıldı (yayında — `_posts/`)

| Tarih | Başlık | Alan |
|---|---|---|
| 2022-04-28 | Tümleşik Gereksinim Yönetimi | sistem/gereksinim |
| 2022-04-30 | Yazılım Sistem Mühendisliği | sistem |
| 2022-05-01 | Use Case Tuzakları | gereksinim/analiz |
| 2022-05-01 | Yazılım Proje Yönetimi Pratikleri | proje yönetimi |
| 2022-05-08 | Gereksinimler ve Test: Yedi Eksik Bağlantı Efsanesi | gereksinim/test |
| 2022-07-11 | Fonksiyonel ve Fonksiyonel Olmayan Yazılım Gereksinimleri | gereksinim |
| 2022-07-19 | CMake | araçlar |
| 2022-08-15 | Elektrik Kesintisinde Otomatik Açılış | sistem |
| 2022-09-11 | Recursively Delete a Specific Folder | araçlar |
| 2023-03-12 | Merge Files with FFmpeg | araçlar |
| 2023-12-01 | Türkiye'de Debugging Aşamaları | kültür/proje |
| 2026-03-25 | Kayan Nokta Sayılarının Tehlikeleri | gömülü/sayısal |
| 2026-03-25 | Versiyon Kontrol Sistemleri: Git vs SVN vs ClearCase | araçlar |
| 2026-04-05 | MISRA C:2025 ile Neler Değişti? | standart/C |
| 2026-04-14 | Yöneylem Araştırması Yöntemleri | matematik/optimizasyon |
| 2026-05-06 | Ölçüm Belirsizliği (GUM Annex F + NCSLI RP-12) | metroloji |
| 2026-05-07 | Kalibrasyon Zincirinin Tepesi | metroloji |
| 2026-05-14 | Renode ile Zynq7000 Simülasyonu | gömülü/SoC |
| 2026-05-21 | Bandpass Sampling | RF/DSP |
| 2026-05-26 | Sistem Mühendisliği Nedir? | sistem |
| 2026-06-02 | Kalman Filtresi ve EKF | navigasyon/füzyon |
| 2026-06-04 | Coupling'i Dengelemek | yazılım tasarımı |
| 2026-06-24 | Antikırılgan: Belirsizlikten Güç Alan Sistemler | sistem/felsefe |

**Son yayınlanan yazı: 2026-06-24.** O tarihten bu yana hiçbir PR merge edilmedi;
üretim tamamen incelemeye takılmış durumda.

---

## Açık PR'lar (insan inceleme bekleniyor — 56 adet, 2026-08-24 itibarıyla)

| PR # | Tarih | Başlık | Alan |
|---|---|---|---|
| #176 | 2026-08-24 | Kod Doğru, Veri Yanlış — DO-178C'de Parameter Data Item | sertifikasyon |
| #175 | 2026-08-20 | Zynq-7000 + S25FL512S — Güç Kesintisinde QSPI Flash | gömülü/depolama |
| #174 | 2026-08-19 | MTBF Bir Ömür Değildir — 10⁻⁹ Aritmetiği | güvenilirlik |
| #173 | 2026-08-18 | MIL-STD-1553B Anatomisi | veriyolu |
| #172 | 2026-07-30 | CAST-32A'dan AC 20-193'e — Multicore Interference | sertifikasyon/multicore |
| #171 | 2026-07-29 | Aviyonikte `malloc` — DO-178C, DO-332, TLSF | sertifikasyon/C |
| #170 | 2026-07-28 | I/Q Örnekleme ve Analitik Sinyal | RF/DSP |
| #169 | 2026-07-27 | Rate Monotonic — Liu-Layland'den RTA'ya | gerçek zamanlı |
| #168 | 2026-07-26 | DO-178C Data ve Control Coupling | sertifikasyon/kapsama |
| #167 | 2026-07-25 | RAIM — GPS Bütünlük İzleme | navigasyon |
| #166 | 2026-07-22 | C Bit-Field'ları Wire Format Değildir | C/protokol |
| #165 | 2026-07-14 | AFDX (ARINC 664 P7) Anatomisi | veriyolu |
| #164 | 2026-07-13 | WCET'i Neden Ölçemezsiniz | gerçek zamanlı |
| #163 | 2026-07-12 | Abstract Interpretation — Interval Domain | statik analiz |
| #162 | 2026-07-11 | ARINC 653 Anatomisi | aviyonik RTOS |
| #161 | 2026-07-10 | Watchdog Tasarım Desenleri | güvenilirlik |
| #160 | 2026-07-08 | Deterministik Derleme ve DO-178C Kanıtı | araçlar/sertifikasyon |
| #159 | 2026-07-07 | volatile Yetmez (4) | C/eşzamanlılık |
| #158 | 2026-07-06 | DO-330 Araç Nitelendirmesi — TQL | sertifikasyon |
| #157 | 2026-07-05 | volatile Yetmediğinde (3) | C/eşzamanlılık |
| #156 | 2026-07-05 | "volatile" ne değildir (2) | C/eşzamanlılık |
| #155 | 2026-07-03 | volatile Her Şeyi Çözmez (1) | C/eşzamanlılık |
| #151 | 2026-06-24 | `setjmp`/`longjmp` Neden DAL A'da Yasak? | C/sertifikasyon |
| #150 | 2026-06-24 | Worst-Case Stack Analizi | gömülü/analiz |
| #149 | 2026-06-24 | Gerçek Zamanlı Sistemler | gerçek zamanlı |
| #147 | 2026-06-19 | Derleyici Optimizasyonlarını Elle Yazmak | derleyici |
| #146 | 2026-06-19 | Object Code Coverage — DAL A | sertifikasyon/kapsama |
| #145 | 2026-06-17 | Cortex-A Boot — Reset Vektöründen `main()`'e | gömülü/SoC |
| #135 | 2026-06-14 | MPU vs MMU | ARM/bellek |
| #134 | 2026-06-13 | `volatile` Yetmez (5) | C/eşzamanlılık |
| #129 | 2026-06-11 | Allan Deviation — IMU Karakterizasyonu | sensör/navigasyon |
| #124 | 2026-06-10 | SEU, SECDED ECC ve Bellek Scrubbing | radyasyon/güvenilirlik |
| #122 | 2026-06-09 | Endianness'in Üç Katmanı | C/protokol |
| #121 | 2026-06-08 | Lockstep CPU Mimarileri | donanım/DAL A |
| #120 | 2026-06-08 | Priority Inversion ve Mars Pathfinder | gerçek zamanlı |
| #119 | 2026-06-07 | DMA ve Cache — Zynq-7000 | ARM/gömülü |
| #118 | 2026-06-05 | DO-326A / ED-202A Siber Güvenlik | sertifikasyon/güvenlik |
| #114 | 2026-06-04 | Sabit Nokta — Cortex-M0 Q15 FIR | gömülü/DSP |
| #103 | 2026-06-01 | Kalman'ın Sessiz İraksaması — Joseph Form | navigasyon/füzyon |
| #102 | 2026-05-31 | ILS Anatomisi — Localizer / Glide Path | navigasyon |
| #101 | 2026-05-30 | ARM GIC — Kesme Denetleyicisi | ARM |
| #100 | 2026-05-29 | volatile Yetmediğinde — Zynq C11 `_Atomic` (6) | C/eşzamanlılık |
| #99 | 2026-05-28 | Dört Aşamalı Veri Analitiği | veri/analitik |
| #98 | 2026-05-28 | WCET Analizi — Cache'in Karanlık Tarafı | gerçek zamanlı |
| #96 | 2026-05-27 | Fault Tree Analizi ve Minimal Cut Set | emniyet |
| #90 | 2026-05-26 | Linker Script Anatomisi | gömülü |
| #89 | 2026-05-24 | Watchdog Timer Tasarım Desenleri | güvenilirlik |
| #88 | 2026-05-23 | WCET Analizi: Statik mi, Ölçüm mü? | gerçek zamanlı |
| #79 | 2026-05-20 | CRC Polinom Seçimi ve Hamming Mesafesi | hata tespiti |
| #78 | 2026-05-19 | VOR Nasıl Çalışır? | navigasyon |
| #77 | 2026-05-17 | MC/DC Kapsama — DAL A | sertifikasyon |
| #67 | 2026-04-12 | Bellek Güvenliği Devrimi | gömülü/güvenlik |
| #54 | 2026-04-04 | C'de Tanımsız Davranış | C/derleyici |
| #51 | 2026-03-28 | MISRA C ve Statik Analiz | standart/C |
| #50 | 2026-03-26 | Float Denormalize FTZ/DAZ (mevcut yazıyı genişletme) | gömülü/sayısal |

---

## Bu Çalıştırma (2026-08-24) — Yayın Yok

**Karar: yeni yazı üretilmedi.** Gerekçe:

Bu çalıştırma başladığında, **aynı zamanlanmış görevin başka bir çalıştırması 90 saniye
önce** #176'yı açmıştı (`post/2026-08-24-do-178c-parameter-data-item`, 18:47 UTC;
bu çalıştırma 18:48 UTC). Dosya düzeni birebir aynı (`_posts/` + `agent/research/` +
`agent/topics.md`), yani aynı ajanın çıktısı. Görev mükerrer tetiklenmiş.

Faz 7 yayın kapısı bu nedenle **karşılanmıyor**: aynı gün ikinci bir yazı,
`min_yayin_araligi_gun = 2` şartını hangi yorumla bakılırsa bakılsın ihlal eder ve
aynı tarih/slug alanında çakışırdı. Bölüm 4'ün "şüphe varsa dur" kuralı gereği
yayın yapılmadı; çalıştırma **defter bakımına** ayrıldı.

### Yapılan iş

1. Defter 2026-05-21'den 2026-08-24'e senkronize edildi (5 yeni yayın + 49 yeni PR).
2. Açık PR'lar ilk kez deftere işlendi — **asıl kök neden buydu**: defter yalnızca
   `_posts/`'u izliyordu, dolayısıyla açık PR'da zaten yazılmış konular "işlenmemiş"
   görünüyor ve yeniden seçiliyordu. Altı ayrı `volatile` yazısı bu şekilde oluştu.
3. Faz 2'ye zorunlu `gh pr list` adımı eklendi (yukarıdaki uyarı kutusu).
4. Fikir havuzu, açık PR'larla çakışan 24 madde çıkarılarak yeniden yazıldı.

### İnsana notlar

- **Boru hattı tıkalı.** 2026-06-24'ten beri hiçbir yazı merge edilmedi; 56 açık PR
  birikti. Ajan üretmeye devam ediyor ama hiçbiri yayına çıkmıyor.
- Öncelik önerisi: önce mükerrer kümeleri kapatın (tek hamlede ~9 PR eksilir),
  sonra en eski dördü (#50, #51, #54, #67) değerlendirin.
- Zamanlanmış görevin **mükerrer tetiklendiğini** doğrulamakta fayda var — bugün iki
  çalıştırma aynı dakikada başladı.

---

## Reddedildi

- _(Bu çalıştırmada konu seçimi yapılmadı; yayın kapısı gün bazında kapalıydı.)_

---

## Fikir Havuzu (açık PR'larla çakışmayacak şekilde yeniden yazıldı)

> Aşağıdaki maddeler, 56 açık PR'ın ve 23 yayındaki yazının **hiçbiriyle**
> örtüşmeyecek şekilde seçildi. Yine de Faz 2'de `gh pr list` ile tekrar doğrulanmalı.

### Yüksek öncelikli

- [ ] **ARINC 429 elektriksel katmanı ve kelime yapısı** — alan: veriyolu —
      1553 (#173) ve AFDX (#165) işlendi, 429 boşta. RZ bipolar kodlama, label/SDI/SSM
      alanları, BNR vs BCD, 12.5 vs 100 kbit/s zamanlaması.
- [ ] **FMEA / FMECA pratikte: kritiklik sayısı nasıl hesaplanır** — alan: emniyet —
      FTA (#96) tümdengelimli, FMEA tümevarımlı; ikisi çakışmaz. MIL-STD-1629A
      RPN vs kritiklik matrisi ayrımı.
- [ ] **ARP4754A ve fonksiyonel tehlike analizi (FHA)** — alan: sistem/sertifikasyon —
      DAL atamasının nereden geldiği; DO-178C'nin girdisi. Açık PR'ların hiçbiri
      sistem seviyesine çıkmıyor.
- [ ] **FIR vs IIR: faz doğrusallığı, grup gecikmesi ve sabit-nokta stabilitesi** —
      alan: DSP — Q15 FIR (#114) uygulama tarafı; bu yazı seçim kriteri tarafı.
- [ ] **Cache coherency ve MESI: Zynq SCU ne yapar, yazılım ne zaman karışmalı** —
      alan: ARM — DMA/cache (#119) DMA'ya özel; bu yazı CPU-CPU coherency.
- [ ] **ADS-B mesaj yapısı: PPM modülasyon, DF17 formatı, CPR konum kodlaması** —
      alan: RF/navigasyon — CPR kodlaması gerçekten az anlatılan bir konu.
- [ ] **Hedef donanımda structural coverage: instrumentation'ın zamanlamayı bozması** —
      alan: sertifikasyon/test — MC/DC (#77) ve OCC (#146) *ne ölçüleceğini*
      anlatıyor; bu yazı *ölçmenin kendisinin* probleme dönüşmesini anlatıyor.

### Orta öncelikli

- [ ] Requirements-based test vs structural coverage: hangisi neyi kanıtlar
- [ ] DO-254 DAL A donanım: elemental analysis nedir
- [ ] ECSS-E-ST-40C / ECSS-Q-ST-80C — Avrupa uzay yazılımı, DO-178C ile farkları
- [ ] Barometrik irtifa vs GNSS irtifası: QNH/QFE, geoid ayrımı, RVSM
- [ ] Sayısal integrasyon şemaları (Euler/RK4/trapez) ve navigasyonda birikimli hata
- [ ] IEEE 754 yuvarlama modları ve tekrar üretilebilir kayan nokta hesabı
- [ ] Toolchain hata (bug) yönetimi: derleyici hatası bulunduğunda DO-178C ne der
- [ ] SPI/I²C sinyal bütünlüğü: gerçek osiloskop hataları ve pull-up hesabı
- [ ] Zynq PS-PL arayüzü: AXI-GP / AXI-HP / ACP hangi durumda hangisi

### Düşük öncelikli

- [ ] İzlenebilirlik matrisi (klasik konu, derinlik çıkarmak zor)
- [ ] Sertifikasyon dokümantasyon seti (PSAC, SDP, SVP…) — kuru, derinlik öğesi yok

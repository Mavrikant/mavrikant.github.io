# WCET Analizi — Araştırma Notları

## Konu Seçimi

- **Alan:** gerçek zamanlı / zamanlama analizi (son 3 yayın: sistem, RF/DSP,
  gömülü/SoC ile farklı).
- **Boşluk gerekçesi (Bölüm 8):** WCET, üç ayrı disiplinin kesişiminde —
  mikromimarı (cache, pipeline), derleyici/IR (CFG, value analizi) ve ILP/program
  doğrulama. Türkçe içerikler genellikle sadece "ölç ve marj ekle" düzeyinde kalıyor;
  statik analizin gerçek mekaniği (IPET, must/may cache analizi, timing anomaly)
  Türkçe olarak neredeyse hiç yazılmamış. İngilizce kaynaklar Wilhelm 2008 etrafında
  toplanmış akademik literatür şeklinde dağınık.
- **Derinlik öğesi (Bölüm 7):** zamanlama analizi + somut IPET formülasyonu (örnek
  bir kod parçası üzerinde ILP kurma) + Lundqvist–Stenström timing anomaly örneği.

## Doğrulanmış Kaynaklar

- **Wilhelm et al. 2008**, "The Worst-Case Execution-Time Problem—Overview of Methods
  and Survey of Tools", ACM TECS 7(3) Article 36. Canonical survey.
  <https://dl.acm.org/doi/10.1145/1347375.1347389>
- **Li & Malik 1995**, "Performance analysis of embedded software using implicit path
  enumeration", DAC '95. IPET'nin orijinal makalesi.
- **Lundqvist & Stenström 1999**, "Timing anomalies in dynamically scheduled
  microprocessors", RTSS 1999. Timing anomaly kavramının kaynağı.
  <https://ieeexplore.ieee.org/document/818828>
- **Reineke et al. 2006**, "A Definition and Classification of Timing Anomalies",
  WCET 2006. Saarbrücken grubunun resmî sınıflandırması.
  <https://www.rw.cdl.uni-saarland.de/people/reineke/private/publications/TimingAnomaliesWCET06.pdf>
- **Ferdinand & Wilhelm 1999**, "Efficient and Precise Cache Behavior Prediction for
  Real-Time Systems", Real-Time Systems 17(2). Must/May/Persistence analizinin
  temelleri.
- **DO-178C** — Section 6.3.4.f "Source Code is accurate and consistent" gereği WCET
  analizi gereksinimi. (Standart kapalı; Rapita ve sertifikasyon dokümantasyonu
  doğrulayıcı kaynak.)
- **aiT (AbsInt)** — statik WCET analizörü; DO-178B/C ve ISO 26262 için qualification
  desteği. <https://www.absint.com/ait/>
- **RapiTime (Rapita Systems)** — measurement-based; DO-330 qualification pack.
  <https://www.rapitasystems.com/products/rapitime>
- **OTAWA (IRIT, Toulouse)** — açık kaynak (LGPL) statik WCET framework.
  <http://www.otawa.fr/>
- **Heptane (INRIA Rennes)** — açık kaynak; eğitim ve araştırma için.
  <https://team.inria.fr/pacap/software/heptane/>

## Anahtar Teknik Detaylar

### IPET Formülasyonu

Bir programın CFG'sinde her basic block B_i için:
- c_i: B_i'nin maliyeti (timing model çıktısı, döngüsü)
- x_i: B_i'nin yürütme sayısı (ILP değişkeni)

**Hedef:** maximize Σ c_i × x_i

**Kısıtlar:**
1. Akış korunumu: her node için gelen kenar sayıları toplamı = giden kenar sayıları
   toplamı = x_node.
2. Giriş bloğu: x_entry = 1.
3. Döngü sınırları: x_loop_body ≤ N × x_loop_header (eğer döngü en fazla N kez
   çalışıyorsa).
4. Flow facts (manuel veya otomatik): "B_3 ve B_7 aynı path üzerinde olamaz" gibi.

ILP çözücü (lp_solve, CPLEX, Gurobi) maksimumu bulur.

### Cache Analizi — Abstract Interpretation

Her basic block girişinde "cache abstract state" tutulur. Set-associative LRU cache
için:

- **Must analysis:** abstract state'in JOIN'i kesişim; abstract age = maksimum.
  → Bir adres "must analysis"te varsa cache'te kesin olduğu garanti edilir → AH.
- **May analysis:** abstract state'in JOIN'i birleşim; abstract age = minimum.
  → Bir adres "may analysis"te yoksa cache'te kesinlikle değildir → AM.
- **Persistence analysis:** Döngülerde "ilk erişim miss, kalan tüm erişimler hit"
  sınıflandırması (FM — First Miss).

LRU'yu analiz etmek matematiksel olarak temiz; PLRU/FIFO/Random çok daha pesimist
sonuç verir. AURIX (Infineon) gibi bazı emniyet kritik MCU'larda lockable cache veya
scratchpad memory tercih edilmesinin sebeplerinden biri budur.

### Timing Anomaly — Lundqvist–Stenström Örneği

Out-of-order pipeline'da:
- A komutu cache miss → 100 cycle bekler.
- Bu süre içinde B komutu (A'ya bağımsız) yürütülür → C ve D komutlarını dispatch
  kuyruğuna alır.
- Sonuç: A miss olduğu HALDE toplam çalışma A hit olduğu duruma göre **daha kısa**
  olabilir.

Sezgi: "local worst-case ⇒ global worst-case" varsayımı düşer. Bu özellik özellikle
PowerPC 7448 gibi out-of-order, çoklu fonksiyonel birimli, branch predictor'lu
işlemcilerde gözlenmiştir.

Sonuç: timing-anomaly-free ("compositional") mimari aranır — örn. ARM Cortex-R5
(in-order, dual-issue ama deterministik), AURIX TC3xx.

### DO-178C Bağlantısı

- §6.3.4 — Source Code review and analysis objective'leri.
- §6.3.4.f — "Source Code is accurate and consistent" — WCET dahil zamanlama
  doğruluğu burada talep edilir.
- §6.4.3 — Test cilingiri: low-level requirements'a kadar inen testler. WCET tek
  başına yeterli değil; **timing margin** gösterilmeli.
- DO-178C'nin 2011 revizyonu §6.3.4.f'ye derleyici/linker seçeneklerinin ve donanım
  özelliklerinin WCET'e etkisinin gösterilmesi gereksinimini ekledi.
- DAL A/B için bağımsızlık (independence) ile birlikte analizin denetlenebilir
  olması gerekir.

### Multi-core Zorluğu

- **Shared L2 cache:** core A'nın yürütmesi core B'nin cache'ini bozar →
  inter-core interference. WCET = isolation altında WCET + interference budget.
- **Bus contention:** AXI/AHB matrisinde paylaşılan slave (DDR, shared SRAM) için
  worst-case arbitration latency hesaplanır.
- **AMP vs SMP:** ARINC 653 partition'ları AMP yaklaşımıyla daha öngörülebilir;
  SMP altında WCET kanıtlamak (CAST-32A position paper, MULCORS çalışması) çok zor.

## Konu Defterine Eklenecek Notlar

- Bandpass sampling PR'ı yayında değil ama _posts/'a girmiş; ledger'da "yayında" gibi
  görünüyor. Bu run'da düzeltme gerekmez — PR akışı dışında ledger sıralaması.
- Bu çalıştırma: alan rotasyonu sağlandı (son üç: sistem, RF/DSP, gömülü/SoC; bu yazı:
  gerçek zamanlı / zamanlama analizi).
- Sonraki iyi adaylar: Watchdog tasarım desenleri (güvenilirlik), ARM Cortex-A boot
  süreci (gömülü/SoC, biraz beklesin), Kalman filtresi tuzakları (navigasyon).

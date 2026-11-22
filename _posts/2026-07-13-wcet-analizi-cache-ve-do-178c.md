---
title: "WCET'i Neden Ölçemezsiniz — Cache, Ölçüm Kuyruğu ve DO-178C 6.3.4.f"
subtitle: "Worst-Case Execution Time on ARM: Static Analysis, Measurement-Based Methods and Their Traps"
background: "/img/posts/8.webp"
date: '2026-07-13 09:00:00'
layout: post
lang: tr
mermaid: true
---

Emniyet-kritik yazılımda bir işin "çoğu zaman" 2 milisaniyede bitiyor olması, hiçbir şey ifade etmez. Sistem yalnızca bir kez, 22 ms süren o dip senaryosunda 20 ms bütçesini aşarsa hedef takibi kayar, uçuş kontrol döngüsü kaçırılır, watchdog atar. Bu yüzden **DO-178C** DAL A/B seviyelerinde yazılımın *"çoğunlukla"* değil, **en kötü ihtimalle** ne kadar sürdüğü sorulur. Bu sayı **Worst-Case Execution Time (WCET)** olarak adlandırılır — ve modern bir SoC üzerinde bu sayıyı çıkarmak, "kodu ölç, biraz marj ekle" cümlesinin ima ettiğinden çok daha derin bir problemdir.

Bu yazı, aviyonik ve gömülü gerçek-zamanlı sistemlerde WCET'in neden bir mühendislik problemi olduğunu, standardın (RTCA DO-178C) bunu nerede istediğini, saf ölçümün neden yetmediğini, statik ve ölçüm-tabanlı yaklaşımların iç mekaniğini ve tek çekirdekli / çok çekirdekli bir Cortex üzerinde nelerin karar verici olduğunu anlatıyor.

---

## Üç Sayı: BCET, ACET, WCET

Aynı bir görevin bir çekirdekte binlerce kez çalıştırıldığını düşünün. Her koşuşta ölçülen süreleri bir histograma dizerseniz üç ayrı sayıyla karşılaşırsınız:

- **BCET** *(Best-Case Execution Time)* — dağılımın en solundaki değer; her şey lehinize gittiğinde (cache sıcak, branch tahmini isabetli, DMA sessiz).
- **ACET** *(Average-Case Execution Time)* — histogramın kütle merkezi; performans profilleri, benchmark grafikleri hep bu sayıya odaklanır.
- **WCET** *(Worst-Case Execution Time)* — dağılımın en sağı: sistemin herhangi bir giriş, herhangi bir cache/pipeline durumu ve herhangi bir kesme örüntüsü altında **hiçbir zaman** aşamayacağı üst sınır.

<div class="mermaid">
flowchart LR
    BCET(["BCET<br/>gözlenen alt sınır"]) --> ACET(["ACET<br/>ortalama, benchmark"])
    ACET --> OBS(["ÖLÇÜLEN WCET<br/>gözlenen en kötü"])
    OBS --> UB(["GERÇEK WCET<br/>hiç görülmemiş olabilir"])
    UB --> SAFE(["GÜVENLİ WCET SINIRI<br/>analizin verdiği üst sınır"])
    style BCET fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style ACET fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style OBS fill:#fde0e0,stroke:#c0392b,stroke-width:2px
    style UB fill:#f5cccc,stroke:#c0392b,stroke-width:2px
    style SAFE fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
</div>

WCET'in bir sayıdan çok bir *üst sınır* olduğuna dikkat: pratikte "gerçek WCET"i bilemezsiniz, ama üstünden asla geçemeyeceğiniz **güvenli** bir üst sınır elinizde olmalıdır. Wilhelm ve ark.'nın 2008 tarihli *"The Worst-Case Execution-Time Problem"* survey'i bu ayrımı çok net koyar: mühendisin işi, `safe estimate ≥ true WCET` eşitsizliğini kanıtlayabilir hâle getirmektir; bu sınırı elden geldiğince gerçek WCET'e yaklaştırmak ise ayrı bir problemdir. Sınır çok gevşekse sistem *time-safe* ama *time-inefficient* olur; sınır gerçek WCET'in altındaysa artık safe değildir — DAL A için bu ikincisi zaten kabul edilmez.

---

## DO-178C §6.3.4.f — Standart WCET'i Nerede İstiyor?

RTCA DO-178C, kaynak kodun gözden geçirilmesi ve analizi (Reviews and Analyses of Source Code) için altı doğrulama hedefi tanımlar. Bunlardan sonuncusu — **§6.3.4.f "Accuracy and Consistency"** — kod incelemesi sırasında hangi doğruluk niteliklerinin ele alınacağını sayar. Standardın kelimesiyle bu bölüm; taşma ve bölme sıfır gibi olağan konulara ek olarak açıkça şunları listeler:

- **worst-case execution timing**,
- **stack usage** ve bellek kullanımı,
- **resource contention** ve limitasyonlar,
- **exception handling**,
- initialize edilmemiş ve kullanılmayan değişkenler,
- görev/kesme çakışmaları nedeniyle veri bozulması.

Yani WCET, DO-178C'de tek başına ayrı bir bölüm olarak değil, kaynak kodun **"accuracy and consistency"** analiz hedefinin *içinde* geçen ve DAL A/B için "with independence" yapılması istenen bir kanıt kalemidir. DO-178C tabloları (Annex A, Table A-5) bu hedefi DAL A ve B için bağımsızlıkla, DAL C için bağımsızlık olmadan zorunlu tutar; DAL D için ise gerekli görmez.

Standart, WCET'in nasıl hesaplanacağını **söylemez**. Yönteminizi seçmek ve seçtiğiniz yöntemin `Software Verification Plan` içinde tarif edilip `Software Verification Cases and Procedures` içinde uygulanıp `Software Verification Results` içinde kanıtlanması gerekir. Sertifikasyonda karşılaştığınız DER (Designated Engineering Representative) size şunları soracaktır: seçtiğiniz yöntem *sound* (yani üst sınır güvenli) mü? Kullandığınız araç *qualified* mı — değilse **DO-330** (Software Tool Qualification) ne diyor? Kanıt sürüklenebilir (traceable) mi?

Yazının kalanı, işte bu üç sorunun altındaki teknik gerçekleri açar.

---

## Neden Çıplak Ölçüm Yetmez? Mikromimarinin Altı Düşmanı

Yıllarca birçok yerde şu cümleyi duydum: *"Fonksiyonu 10 000 kez koşturduk, hepsi bütçenin altında; problem yok."* Bu yaklaşım tek çekirdekli 8-bit bir MCU'da yeterli olabilirdi. Modern bir ARM Cortex-A9 veya Cortex-R5 üzerinde ise en fazla *"bugün, bu giriş kümesiyle, bu kesme örüntüsünde"* bir gözlem sağlar. Sınır değil, bir tanıklık.

Sebep, ölçmenin altı düşmanının bir aradalığıdır:

1. **Cache**. L1-I, L1-D ve L2 önbelleklerinin durumu (hangi satır sıcak, hangisi soğuk) bir fonksiyonun çalışma süresini büyüklük sırasıyla değiştirebilir. Cortex-A9 için L1 D-cache isabetli erişim tipik olarak birkaç çevrimde biterken, cache miss sonucu DDR3'e inen bir erişim onlarca (bazı yapılandırmalarda 100'ün üzerinde) çevrime mal olur. Fonksiyon henüz cache'te değilse veya araya giren bir görev cache'i kirlettiyse (aşağıda CRPD başlığı), süre uçar.
2. **Branch predictor**. Global history register'ın durumu ölçüm sırasında ne olursa olsun, farklı bir görev sırası sonrası tahmin oranı düşerse pipeline flush maliyetleri gizli bir zam olarak gelir.
3. **TLB**. Bellek erişimlerinin sanal-fiziksel eşlemesi TLB'de değilse page walker devreye girer; DDR'a inen bu ek erişim de gizli bir kuyruktur.
4. **DVFS ve termal**. Dinamik saat/gerilim ölçekleme, silikon sıcaklığa göre saati düşürebilir. Ölçüm klimalı laboratuvarda "temiz" iken sahada 70°C zarfında çok başka bir sayı verebilir.
5. **Pipeline in-order/out-of-order etkileşimi**. Cortex-A9 hafif out-of-order bir mikromimariye sahiptir; Cortex-R5 in-order'dır. Aynı C kodu, aynı derleyici bayraklarıyla, iki çekirdekte tamamen farklı gecikme örüntüleri üretir.
6. **DMA ve paylaşımlı fabric**. Sizin çekirdeğiniz cache miss aldığında DDR arayüzü müsait mi? Bir DMA denetleyicisi tam o anda ekran tampon belleğini basıyorsa DDR yolu için sıraya girersiniz. Ölçüm sırasında DMA sessizdiyse bu zam ölçüme yansımaz.

Bu altı düşmanın hepsi, ölçüm dağılımının **kuyruğunu** öngörülemez biçimde uzatır. Klasik "ortalama + üç sigma" mantığı burada iflas eder: dağılım Gauss değildir; ağır kuyrukludur (heavy-tailed) ve nadir olayların olasılığı normalin bin katı olabilir.

---

## Statik Analiz: Kodu Çalıştırmadan WCET

Bir sound WCET sınırı için akademinin sunduğu klasik yol, kodu hiç çalıştırmadan, **derlenmiş ikili** üzerinden yürütülür. Böyle bir aracın (aiT, Bound-T, OTAWA gibi) iç mekaniği kabaca üç katmandır:

1. **Kontrol Akış Grafiği (CFG) Çıkarma**. Nesne kodu (ELF) sökülür (disassembly), her fonksiyon ve döngü için CFG kurulur, döngü sınırları belirlenir. Döngü sayısı derleyici çıktısından çıkarılamıyorsa **flow facts** olarak açıkça beslenmek zorundadır — genelde kod içine yorum notasyonu ya da harici bir konfigürasyon dosyası ile.
2. **Mikromimari Analiz (Micro-architectural Analysis)**. Aracın içinde, hedef çekirdeğin bir **soyut modeli** vardır: pipeline, cache eviction politikası, prefetch, branch predictor. Bu model üzerinden, CFG'nin her yolunun cache, pipeline ve bellek gecikmelerini `must` ve `may` küme analizleriyle **abstract interpretation** çerçevesinde tahmin eder. "Bu blok her koşulda cache'te olur" (must-hit) ya da "olmayabilir" (may-hit / may-miss) kararları burada verilir.
3. **Yol Analizi (Path Analysis) — IPET**. Elde edilen çevrim maliyetleri **Implicit Path Enumeration Technique (IPET)** ile birleştirilir. Programın olası tüm yolları tek tek sayılmaz — çok pahalı olurdu. Bunun yerine her temel blok ve kenara bir tamsayı programlama (ILP) değişkeni atanır ve amaç fonksiyonu "toplam çevrimi maksimize et" olarak yazılır. Döngü sınırları ILP kısıtı olur. Çözücü tek geçişte üst sınırı verir.

<div class="mermaid">
flowchart LR
    ELF[[Derlenmiş ikili<br/>ELF + debug]] --> DIS[Disassembly + CFG]
    ANN[[Flow facts<br/>döngü sınırları]] --> DIS
    DIS --> MA[Micro-arch analizi<br/>cache/pipeline soyut model]
    MA --> IPET[IPET<br/>ILP çözücü]
    IPET --> UB[GÜVENLİ WCET ÜST SINIRI]
    style ELF fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style ANN fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style MA fill:#fff2cc,stroke:#b8860b,stroke-width:2px
    style UB fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
</div>

Yaklaşımın *soundness* garantisi güçlüdür: sağlıklı bir mikromimari modelle çıkan üst sınır, tanım gereği gerçek WCET'ten büyüktür. Fiyat başka yerdedir: (a) araç, hedef çekirdek için doğrulanmış (validated) bir mikromimari modele sahip olmalıdır — Cortex-M0/M4 gibi in-order çekirdekler için bu iş görecelidir, out-of-order Cortex-A9 için ciddi mühendislik ürünüdür; (b) flow facts insan işidir ve büyük kod tabanlarında hızla acı verir; (c) araç DO-178C DAL A için kullanılıyorsa sertifikasyona yardımcı verinin (`Software Life Cycle Data`) parçası olarak *tool qualification* yapılması gerekir — analiz sound olsa bile araç TQL-4/5 seviyesinde nitelendirilmemişse DER bunu kabul etmez.

---

## Ölçüm-Tabanlı Yaklaşım: Kuyruğu Ciddiye Almak

Diğer uçta, endüstride son yıllarda daha yaygın kullanılan **Measurement-Based Timing Analysis (MBTA)** yaklaşımı vardır. Rapita Systems'ın RapiTime aracının temsil ettiği bu ekol, kodu gerçek donanımda binlerce farklı senaryoyla çalıştırır, temel blok bazında zaman ölçer ve elde edilen dağılımdan bir WCET tahmini üretir. Neden karmaşık bir soyut mimari modeli yerine ölçmek? Çünkü:

- Kompleks out-of-order pipeline'ları modellemek pahalıdır ve model *unsound* olabilir.
- Gerçek DDR gecikmelerini, gerçek DVFS davranışını, gerçek DMA trafiğini yalnızca donanım verir.
- Endüstriyel kod tabanları için flow facts yükü çekilmez hâle gelebilir.

Yaklaşım iki adımdadır. **Birincisi**, koda enstrümantasyon eklenir (fonksiyon giriş/çıkış olay noktaları) ve hedef sistem üzerinde geniş bir giriş kümesiyle koşturulur. Trace verisi (nRF için ETB, Cortex-A/R için ETM, ETB, TPIU üzerinden) toplanır; bu her temel bloğun binlerce zaman gözlemini üretir. **İkincisi**, gözlenen en kötü değerin gerçek WCET'in altında kalma ihtimali istatistiksel olarak modellenir. Burada devreye **Extreme Value Theory (EVT)** girer: dağılımın kuyruğu, ortalama ya da varyans değil, **Generalized Extreme Value** (GEV — Gumbel/Fréchet/Weibull) veya **Generalized Pareto** ailesinden bir modelle temsil edilir. Amaç, "bu iş 10⁻⁹ olasılıkla bu değeri aşabilir" gibi bir olasılıksal WCET (**pWCET**) sınırı üretmek.

<div class="mermaid">
flowchart LR
    C[Enstrümante kod] --> RUN["Hedef donanımda<br/>N farklı senaryo, K koşum"]
    RUN --> TRACE[Trace verisi<br/>ETM/ETB]
    TRACE --> HIST[Blok bazında<br/>süre histogramı]
    HIST --> EVT[EVT modeli<br/>Gumbel/Pareto kuyruk]
    EVT --> pWCET[pWCET<br/>10⁻⁹ aşma olasılığı]
    style C fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style EVT fill:#fff2cc,stroke:#b8860b,stroke-width:2px
    style pWCET fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
</div>

Yöntemin gerçek zorluğu, sonuca değil kabullere gizlenmiştir. EVT'nin sound olması için gözlemlerin belirli bağımsızlık ve durağanlık koşullarını sağlaması gerekir; Cazorla, Kosmidis ve arkadaşlarının PROARTIS / MRTC serilerindeki çalışmalarında gösterildiği üzere, klasik deterministik donanımda bu koşullar çoğu zaman **sağlanmaz** — bu da EVT tabanlı pWCET'i, altına *time-randomised architecture* konmadan hard-real-time DAL A kanıtı olarak kullanmayı tartışmalı hâle getirir. Sertifikasyon otoriteleri MBTA'yı reddetmez; ama sound WCET iddiasında kullanıldığında istatistiksel varsayımların (bağımsızlık, kuyruk seçimi, örneklem yeterliliği) ayrı ayrı gerekçelendirilmesini talep eder.

Pratikte bugün endüstride sık görülen dördüncü bir yol daha var: **hibrit**. Statik CFG + ölçülmüş temel blok maliyeti + IPET. RapiTime'ın bir mod'u bu şekilde çalışır. Böylece pipeline'ı modellemek yerine ölçüyorsunuz, ama yolları hâlâ ILP ile sayıyorsunuz — bir tür orta yol.

---

## Somut Örnek — Cortex-A9'da Cache Sıcak/Soğuk Ne Kadar Fark Eder?

WCET'in ne kadar mühendislik problemi olduğunu görmek için tek başına bir sayı yeter: aynı fonksiyonun cache sıcak durumdaki süresi ile cache soğuk durumdaki süresi arasındaki oran. ARM Cortex-A9 için, ARM'ın yayınladığı *Cortex-A9 Technical Reference Manual* (rev. r4p1) ve resmi mimari referansı üzerinden şu tipik gecikmeler bilinir:

| Erişim | Tipik gecikme (çevrim) |
|---|---|
| L1 D-cache hit | 3–4 |
| L2 cache hit (PL310) | ~20 |
| L2 miss, DDR3 hit | 100–200+ (yükleyiciye ve kontrolcü konfigürasyonuna göre) |

Bu tablodan yola çıkarak, `sum[i] += a[i] * b[i]` gibi bir iç çarpım döngüsünü düşünelim. 1024 elemanlı iki float dizisi (4 KB + 4 KB = 8 KB). Cortex-A9'un tipik L1 D-cache boyutu 32 KB olduğundan, cache **sıcaksa** her erişim L1'dedir; iç iterasyonun aritmetik yükü hariç bellek maliyeti çevrim başına 3–4 çevrimdir. Cache **soğuksa** — örneğin döngüden önce başka bir görev cache'i kirletmişse — cache satırı başına (32 bayt = 8 float) DDR'a bir kez inilir; yani her 8 float için 100–200 çevrim beklemeye girersiniz.

Bir cache satırı sıcakken 8 float'ın L1 erişim maliyeti ≈ 8 × 3 = 24 çevrim, soğukken ilk satır çekiliş maliyeti tek başına 100–200 çevrim: kabaca **4×–8× yavaşlama**, sadece L1 seviyesinde. Erişim örüntüsü non-lineer olduğunda (linked list, hash tablosu, sanal fonksiyon çağrıları) ve L2 miss oranı artınca, gözlenmiş olmayan bir örüntüde 10×'un üstüne çıkmak sıradan bir sonuçtur. Wilhelm ve ark.'nın 2008 survey'inde raporlanan endüstri gözlemleri de aynı büyüklük sırasında hareket eder: modern SoC'lerde WCET / ACET oranı 5×–20× arasında olabilir.

Buradan çıkan pratik sonuç şudur: 10 000 çalıştırmadan **hiçbirinin** cache-soğuk senaryoyu yakalayamamış olması istatistiksel olarak gayet mümkündür; test senaryosu her seferinde temiz bir ısınma turuyla başlıyorsa cache zaten sıcaktır, gerçek en kötü durum sizin dağılımınızda hiç gözlenmez.

---

## CRPD — Kesme, Cache'i Öldürür

Şimdiye kadar tek bir görevi ele aldık. Gerçekte, DAL A bir aviyonik sistemde onlarca görev bir çekirdekte önceliklere göre çizelgelenir; kesme dendiğinde çalışan görev *preempt* edilir ve devraldığında cache'in bir kısmı artık başkasına aittir. Bu ek maliyet **CRPD** — *Cache-Related Preemption Delay* — olarak adlandırılır.

Preemption olduğunda düşük öncelikli görev tekrar programa girdiğinde, kendi sıcak cache satırlarının bir kısmı yüksek öncelikli görev tarafından değiştirilmiş (evicted) olur. Bu satırlara tekrar erişildiğinde yeniden getirmek gerekir — CRPD, işte bu **yeniden getirme** maliyetidir. Klasik yanıt-süresi (response time) analizi CRPD'yi hesaba katmadığında sonuç **unsound** olur.

CRPD hesabı için literatürdeki (Altmeyer, Davis, Maiza — RTSJ 2011) yaygın çerçeve iki küme üretir:

- **UCB** *(Useful Cache Blocks)*: düşük öncelikli görevin preempt edildiği anda halen "faydalı" durumda olan cache satırlarının kümesi. Bu satırlar, ileride tekrar okunmadan silinseydi CRPD'ye katkı vermezdi.
- **ECB** *(Evicting Cache Blocks)*: yüksek öncelikli görevin çalışırken kullandığı cache satırlarının kümesi — çünkü bunlar düşük öncelikli görevin UCB satırlarını kovabilir.

Kaba yaklaşımla, bir preemption başına CRPD ≈ `|UCB ∩ ECB| × (miss maliyeti)` şeklinde üst sınırlanır. UCB ve ECB, statik cache analiziyle ikili üzerinden çıkarılır. Sistemde N farklı önemli preemption noktası varsa, CRPD katkısı toplam WCET'e büyük değerler ekleyebilir; ağır yüklü çekirdeklerde bu katkı bazen görevin kendi WCET'ine yakın çıkabilir.

Pratikte iki farklı endüstri desteği vardır: **cache locking** — kritik yolların cache'te kilitlenmesi, böylece preempt edilse de silinmez; ve **cache partitioning** — cache'in görevler arasında bölünmesi (bazı ARMv7-A/A64 çekirdekler ve L2 kontrolcüleri destekler). Her iki mekanizma da fayda sağlar ama sonuç ACET'i kötüleştirir; bir *time-safety* – *time-efficiency* takasıdır.

---

## Multicore Kabusu — CAST-32A ve AMC 20-193

Şu ana kadar tarif ettiğim her problem, tek çekirdekli bir sistemde bile "iyi mühendislik" gerektiriyordu. Çoğunlukla 2, 4, hatta 8 çekirdekli SoC'ler kullandığımızda problem başka bir boyuta atlar: çekirdekler artık **paylaşılan kaynakları** — L2/L3 cache, DDR kontrolcüsü, coherency fabric, PCIe, DMA — birbirlerinden çekerler. Bir çekirdekteki görev "yalnızken" X çevrimde biterken, komşu çekirdekte DDR'a saldıran başka bir görev çalıştığında X + interference sayısında biter. Bu **interference**, tanım gereği çekirdek bazında ölçmekle görülemez.

Bu sorunu ele almak için 2016'da FAA'nın *Certification Authorities Software Team* (CAST) **CAST-32A** yayınladı: *"Multi-core Processors — Position Paper"*. CAST-32A, tavsiye niteliğinde bir konumlama belgesiydi; çekirdek başına WCET'in interference channels'ları tanımlanmadan geçerli olmadığını netleştirdi. 2022'de bu konumlanma, aviyonik dünyada bağlayıcı bir uyum aracı olan **AMC 20-193** (EASA / FAA ortak yayını) hâline geldi ve multicore sertifikasyon için uyulacak gereklerin listesini resmileştirdi:

- Paylaşılan tüm interference channels'ların tanımlanması,
- Bu channels'ların uygulama yazılımı düzeyinde nasıl yönetildiğinin/kontrol altına alındığının kanıtlanması,
- Her çekirdek başına WCET'in interference'ı **temsil eden** yükler altında (yalnız değil) ölçülmesi ya da analiz edilmesi,
- Bir çekirdekte oluşan bir hatanın diğer çekirdeklere yayılmadığının gösterilmesi.

Pratik sonuç: bir çekirdeğin ölçülen WCET'i, "her çekirdek maksimum yükte, DMA aktif, cache maksimum baskı altında" senaryosunda ölçülmelidir — çoğu ekibin ilk yaklaşımı "tek görev çalıştıralım, ölçelim" tam tersi yöndedir. Sertifikasyonun ilk redd sebeplerinden biri budur.

Endüstriye yansıması: son on beş yılda emniyet-kritik aviyonik sistemlerin çift/çok çekirdekli SoC'lerin genellikle yalnızca tek bir çekirdeğinde çalıştırılması ya da çekirdekler arasında sıkı bir yalıtımla (bkz. ARINC 653 partitioning) işletilmesi tam da bu sebepledir — interference'ı sertifikasyon otoritesine kanıtlanabilir biçimde sunmak yakın zamana kadar açık bir problemdi. AMC 20-193, ARINC 653'ün multicore uzantıları ve modern RTOS'ların cache/DDR partitioning yetenekleri tam olarak bu boşluğu doldurmak içindir.

---

## Pratik Tavsiyeler

Bugün bir aviyonik projede WCET tarafına düşen bir mühendisin göze alacağı ilk on karar şunlardır:

1. **Determinizm hedefi mimari seçimden başlar.** DAL A hedefli bir kutuya out-of-order superscalar A-serisi çekirdek koymadan önce, Cortex-R veya Cortex-M profillerinin yeterli olup olmadığını sorun. In-order pipeline + statik cache konfigürasyonu + basit branch predictor, WCET analizi için mükemmel bir hediyedir.
2. **Cache'i ya kilit ya böl.** Aviyonik SoC'lerde kritik yollar ya cache-locked ya da cache-partitioned olmalıdır. "Çoğu zaman cache'te" kabul edilemez.
3. **DDR yerine SRAM'i tercih edin.** Kritik veri ve kod bölümleri (interrupt handler, PID döngü, matris ters işlemi) tightly-coupled memory (TCM) ya da On-Chip RAM (OCRAM) içine yerleştirilirse WCET dağılımının varyansı dramatik biçimde küçülür.
4. **Kod ve veri ayrımını çakıştırma.** L1-I ve L1-D genelde ayrıdır; ancak veri erişimlerinin dizilimi, aynı seti tekrar tekrar döven bir *cache thrashing*'e yol açabilir. Padding ve struct düzenlemesi WCET'i etkiler.
5. **Recursion ve dinamik bellek yasak.** DAL A'da bu neredeyse standart bir kurala dönüşmüş durumdadır; WCET analizinin sonlu olabilmesi için de mecburidir.
6. **`setjmp`/`longjmp`, exception handling, function pointer yağmuru — hepsi düşman.** CFG'yi patlatır, statik analizi imkânsıza yaklaştırır.
7. **Ölçümü *soğuk cache* ile yapın.** Isınma turu koymayın; test senaryosu preempt edilmiş görev durumunu, DMA aktif durumu, ısı ve DVFS uç değerlerini kapsayacak şekilde tasarlayın.
8. **Marjı bir sayı olarak değil, kanıta dayalı olarak tanımlayın.** "10× marj" mantıklı görünse de sertifikasyon otoritesine "kaynağı ne, üst sınıra nasıl ekliyorsun" sorusuna cevap veremezseniz reddedilirsiniz.
9. **Aracınızı DO-330 çerçevesinde nitelendirin.** aiT, RapiTime, OTAWA gibi bir araca gerçekten dayanıyorsanız, kullandığınız sürümün TQL nitelendirmesini sertifikasyon planınıza koyun.
10. **Multicore ise interference çalışmayı yalnız bırakmayın.** Her çekirdekteki WCET, komşuların "gürültü fabrikası" çalışıyorken ölçülmelidir; sertifikasyona giden zamanlama kanıtı bu gerçeği yansıtmalıdır.

---

## Açık Sorular ve İleri Okuma

WCET, tam bitmemiş bir alandır. Şu üç yön hâlâ araştırma konusudur:

- **Probabilistic WCET** — pWCET tabanlı yaklaşımların (PROARTIS ekolü) sertifikasyon otoriteleri tarafından nasıl kabul edileceği. Time-randomised donanım az sayıda ticari SoC'de mevcut; büyük ticari çekirdekler bu yönde değil.
- **Çok çekirdekli sound analiz** — 8+ çekirdekli, coherent L3 paylaşımlı Cortex-A76/A78 gibi mimarilerde sound WCET, endüstriyel araçların yeteneklerinin sınırına yakındır; MERASA, parMERASA gibi projelerin çıktısı bugün kısmen üretime yansıdı.
- **Yapay zeka hızlandırıcıları** — DAL A hedefli sistemlerde tensor akseleratörlerin WCET'i, mimarinin closed olması ve dinamik quantization varlığı nedeniyle henüz açık bir problem.

Yakın vadede sertifikasyon otoriteleri açık dokümantasyonu olan mimariler ve statik analiz-friendly çekirdekler tarafına eğilim gösteriyor; bu, WCET'in mühendisin yalnızca "ölçüp geçtim" ile geçebileceği bir kalem değil, mimari-derleyici-standart-araç dörtlüsünün ortaklaşa taşıdığı bir kanıt olacağı anlamına geliyor.

---

## Kaynaklar

- [RTCA/DO-178C — Software Considerations in Airborne Systems and Equipment Certification (2011)](https://www.rtca.org/)
- [Reinhard Wilhelm et al. — *"The Worst-Case Execution-Time Problem: Overview of Methods and Survey of Tools"*, ACM TECS, 2008](https://dl.acm.org/doi/10.1145/1347375.1347389)
- [Sebastian Altmeyer, Robert I. Davis, Claire Maiza — *"Cache Related Pre-emption Delay Aware Response Time Analysis for Fixed Priority Pre-emptive Systems"*, RTSS 2011](https://ieeexplore.ieee.org/document/6121396)
- [FAA CAST-32A — *"Position Paper on Multi-core Processors"* (2016)](https://www.faa.gov/aircraft/air_cert/design_approvals/air_software/cast/cast_papers/media/cast-32A.pdf)
- [EASA / FAA AMC 20-193 — *"Use of multi-core processors"* (2022)](https://www.easa.europa.eu/en/document-library/certification-specifications/amc-20-general-acceptable-means-of-compliance-airworthiness-products-parts-and-appliances)
- [ARM Cortex-A9 Technical Reference Manual](https://developer.arm.com/documentation/100511/latest/)
- [ARM Cortex-R5 Technical Reference Manual](https://developer.arm.com/documentation/ddi0460/latest/)
- [AbsInt aiT WCET Analyzer](https://www.absint.com/ait/)
- [Rapita Systems — RapiTime](https://www.rapitasystems.com/products/rapitime)
- [Francisco J. Cazorla et al. — *"PROARTIS: Probabilistically Analysable Real-Time Systems"*, ACM TECS, 2013](https://dl.acm.org/doi/10.1145/2465787.2465796)
- [OTAWA — Open Toolbox for Adaptive WCET Analysis](https://www.otawa.fr/)

---
title: "WCET Analizi: Statik mi, Ölçüm mü, Hibrit mi?"
subtitle: "WCET Analysis: Static, Measurement-Based, or Hybrid?"
background: "/img/posts/8.webp"
date: '2026-05-23 09:00:00'
layout: post
lang: tr
mermaid: true
---

Aviyonik veya başka bir emniyet kritik gerçek zamanlı sistem üzerinde çalıştıysanız, şu cümleyi muhtemelen duymuşsunuzdur: *"Bu görev 2 ms içinde bitmek zorunda."* Sonra biri ekler: *"Test ettik, 1.4 ms sürüyor, payımız var."*

Asıl soru bu cümlenin gizlediği başka bir cümlededir: **Bunu nereden biliyorsunuz?** 1.4 ms'yi ölçen test, görev en kötü koşullarda mı çalışıyordu? Cache sıcakken mi, soğukken mi? Aynı çekirdek üzerinde başka bir görev tarafından önceden tahliye (preempt) edildikten sonra mı, yoksa boş sistemde mi? Dallanma geçmişi (branch history) hangi yöndeydi? Bir sonraki uçuş yazılımı sürümünde derleyici farklı bir kayıt tahsisi yaparsa o 1.4 ms ne olur?

Bu sorular **WCET (Worst-Case Execution Time)** analizinin konusudur — ve cevaplar göründüğü kadar düz değildir. Türkçe kaynaklarda WCET için pratikte birkaç cümlelik tanımdan öteye gidilmez: *"En kötü durum çalışma süresidir, gerçek zamanlı sistemlerde önemlidir."* Çoğu zaman o kadar. Oysa konunun altında 1990'lardan beri süren bir araştırma alanı, üç farklı endüstri yaklaşımı ve DO-178C'nin Tablo A-5'ten alıp Bölüm 6.3.4.f'ye yerleştirdiği somut bir sertifikasyon yükümlülüğü vardır.

Bu yazıda WCET probleminin neden zor olduğunu, üç ana yaklaşımın (statik analiz, ölçüm tabanlı, ölçüm tabanlı olasılıksal) ne yaptığını ve neyi kaçırdığını, **timing anomaly** denilen ve sezgiyi yere yıkan fenomeni, çok görevli bir RTOS'ta cache'in yarattığı görünmez maliyeti ve sonunda DO-178C'nin sizden ne istediğini somut sayılarla anlatacağım.

---

## Tabanı Şekillendirelim: WCET, BCET ve Gerçekte Olan Şey

Bir göreve giriş veriniz değişebilir, sistemin durumu değişebilir, ortam değişebilir. Aynı kodun aynı CPU üzerindeki yürütme süresi bu yüzden tek bir sayı değil, bir **dağılımdır**. Bu dağılımın matematiksel yapısı şu şekilde özetlenir:

<div class="mermaid">
graph LR
    A[BCET<br/>Best-Case<br/>Execution Time] -->|gerçek<br/>en küçük| B[Gözlenen min]
    B --> C[Tipik<br/>çalışma süresi]
    C --> D[Gözlenen max]
    D -->|gerçek<br/>en büyük| E[WCET<br/>Worst-Case<br/>Execution Time]
    E -->|güvenli<br/>üst sınır| F[WCET tahmini<br/>upper bound]
    style A fill:#bff
    style E fill:#fbb
    style F fill:#fdd
</div>

Önemli olan iki ayrım vardır. Birincisi: **gerçek WCET** bir sayıdır ama bilinmez. Hiçbir yöntem bu sayıyı doğrudan veremez; en iyi durumda **güvenli bir üst sınır** verir. İkincisi: ölçtüğünüz "max" hemen hiçbir zaman gerçek WCET değildir, çünkü en kötü giriş kombinasyonunu kapsayan girdi kümesini test ortamında üretmek genelde imkânsızdır.

İyi bir WCET tahmininin iki niteliği olmalıdır:

1. **Soundness (güvenli olma):** Tahmin asla gerçek WCET'in altında kalmamalıdır.
2. **Tightness (yakın olma):** Tahmin gerçek WCET'in 10×, 100× üstüne çıkmamalıdır, aksi halde sistem aşırı pessimistik olur ve donanım israfı yapılır.

Tüm WCET endüstrisi bu iki niteliğin arasındaki ters orantıyı yönetmek üzerine kuruludur.

---

## Yöntem 1 — Statik Analiz: Tüm Yolları Hesapla

Statik WCET analizi, programı **çalıştırmadan** kaynak veya ikili kod üzerinden tüm olası yürütme yollarını analiz eder. Yapı taşları:

- **Control-flow reconstruction:** İkili koddan çağrı grafiği ve temel bloklar çıkarılır.
- **Value analysis:** Her program noktasında değişken değerleri için bir aşırı-yaklaşım (over-approximation) hesaplanır.
- **Cache analysis:** Her instruction/data erişiminin **must-cached / may-cached / not-cached** sınıflandırması yapılır.
- **Pipeline analysis:** Pipeline durumlarının soyut bir modeli, her temel blok için döngü sayısı türetir.
- **Path analysis:** ILP (integer linear programming) ile en uzun yol bulunur, döngü sınırları ve infeasible path bilgisiyle daraltılır.

Bu yaklaşımın en gelişmiş ticari uygulaması **AbsInt aiT**'tir. aiT, statik analiz için soyut yorumlama (abstract interpretation) çerçevesini kullanır ve doğrudan derlenmiş **binary** üzerinden çalışır — kaynak kod düzeyindeki tahmin değil, gerçekten yongada çalışacak makine kodunun analizidir. Desteklenen mimariler arasında ARM Cortex-M/R/A aileleri, PowerPC e200/e500, TriCore, Infineon AURIX, Renesas RH850 vardır. aiT, ISO 26262 ve DO-178C için **Qualification Support Kit** ile birlikte gelir; yani tool qualification dokümantasyonu çoktan hazırdır.

Statik analizin **güçlü yanı:** soundness garantisi sağlar. Tüm program yolları kapsanır; ölçüm sırasında tetiklenemeyen patolojik kombinasyonlar bile dikkate alınır.

**Zayıf yanı:** pessimizm. Bir araştırma çerçevesi modern bir Cortex-A çekirdek üzerinde tek bir benchmark için **%60–%70'lik bir overestimation**'ın yalnızca dallanma tahmini (branch prediction) varsayımlarından geldiğini göstermiştir. Cache modeli, pipeline modeli, out-of-order çekirdekler eklendikçe bu yığılır. Modeli mükemmelleştirmek bir noktada exponential maliyetli hale gelir.

Statik analiz ayrıca **donanım modelinin doğruluğuyla** sınırlıdır. Cortex-A53'ün L1 cache replacement politikası errata sebebiyle dokümantasyondan farklı davranıyorsa analiz yanlış sonuç verir — ama bu yanlışlığı kimse fark etmez, ta ki saha hatası gelene kadar. Bu, donanım üreticisinin mikromimariyi ne kadar açıkladığına bağlıdır; ARM'ın TRM'leri (Technical Reference Manuals) DCLS lockstep Cortex-R5 gibi emniyet kritik çekirdekler için oldukça detaylıdır, ama bazı out-of-order Cortex-A çekirdekleri için pipeline state machine'i tam dokümante değildir.

---

## Yöntem 2 — Ölçüm Tabanlı (Measurement-Based) Analiz

Ölçüm tabanlı yaklaşımda görev, donanım veya yüksek doğruluklu bir simülatör üzerinde **defalarca** çalıştırılır, her çalıştırmanın süresi kaydedilir, gözlenen maksimum + bir güvenlik payı = WCET tahmini olarak alınır.

Bu yaklaşım pratiktir, kurulumu kolaydır ve gerçek donanım davranışını yakalar (statik modelin kaçırdığı errata dahil). Otomotiv ve havacılıkta yaygın olarak kullanılır, çünkü ekip mevcut testleri bu amaçla yeniden kullanabilir.

Sorun: **kapsama** ve **güvenlik payının nasıl seçileceği.**

İlk sorun şudur: programınızın gerçek en kötü yürütme yolunu test sırasında tetiklediğinize emin olamazsınız. Bir kontrol döngüsünün "if hata varsa yeniden kalibre et" dalı yılda iki kez tetikleniyorsa, test ortamında o dal çalışmaz; gözlenen max o dalı içermez. Bu yüzden ölçüm tabanlı analiz tipik olarak bir **yapısal kapsama** (örneğin MC/DC veya hat kapsaması) hedefiyle birlikte yapılmalıdır.

İkinci sorun: ne kadar güvenlik payı? Endüstride **%20–%50** civarında "engineering margin" eklendiğine sık rastlanır. Bu sayı, neredeyse hiçbir nesnel temeli olmayan bir folklordur. Eğer giriş uzayı sandığınızdan daha büyük, cache durumu sandığınızdan daha kötü, ya da preemption sandığınızdan daha agresif ise %20'lik pay sizi kurtarmaz.

Üçüncü ve en sinsi sorun: **timing anomaly**. Buna ayrı bir bölüm açıyorum.

---

## Sezgiyi Yere Yıkan Şey: Timing Anomaly

1999'da Lundqvist ve Stenström şu gözlemi yaptılar: modern bir out-of-order pipeline'da, **lokal olarak hızlı** bir olay (cache hit) **globalde daha yavaş** bir sonuca yol açabilir. Veya tam tersi.

Bunun neden mümkün olduğunu sezmek için bir analoji düşünün: bir kavşakta her zaman yeşil yandığında daha hızlı geçtiğinizi sanırsınız. Ama her zaman yeşil yanması, sizden önce kavşağa gelen daha yavaş bir aracın siz oraya vardığınızda hâlâ orada olmasına yol açar; kırmızıda beklediğinizde o araç çoktan gitmiş olur ve siz gerçekte daha hızlı geçersiniz. Lokal en iyi olan global en iyi değildir.

CPU'da bu, **kaynak çatışması** ile olur. Out-of-order bir pipeline'da iki bağımsız komut farklı fonksiyonel birimler için yarışır. Eğer ilk komut bir cache miss yaparsa, bellek sistemini meşgul ederken pipeline ikinci komutu yeniden sıralayıp başka bir port üzerinden hızlandırır. Ama eğer ilk komut cache hit ederse, ikinci komut sırayla onun arkasına dizilir ve daha yavaş bir port kullanmak zorunda kalır. **Cache miss, programın geri kalanını hızlandırır.**

Bunun WCET için yıkıcı sonucu şudur:

> Eğer pipeline'da timing anomaly varsa, "her cache erişimi miss olur" gibi **lokal worst-case varsayımı global worst-case'i garanti etmez.**

Bu, hem statik analizi hem de ölçüm tabanlı analizi vurur. Statik analiz, tüm pipeline durumlarının kombinasyonlarını izlemek zorundadır — saf "always miss" varsayımı **soundness'i bozar.** Ölçüm tabanlı analiz daha da kötüdür: belirli bir cache durumunda en yavaş çalıştığını gözlemleseniz bile, başka bir cache durumunda daha yavaş çalışabilir, ve siz bunu hiç görmemiş olabilirsiniz.

Daha da fenası: **domino effect**. Başlangıçtaki küçük bir gecikme, ileride pipeline ve cache durumlarını öyle bir kombinasyona kilitleyebilir ki, kaybedilen süre **sınırsızca** büyür. Lundqvist–Stenström'ün makalesinde geçen bu durum, naif bir "küçük gecikme = küçük WCET artışı" varsayımının neden ölümcül olduğunu açıklar.

Pratikte sonuç: emniyet kritik tasarımcılar **timing-predictable** mimarilere yönelir. Cortex-R ailesinin out-of-order olmaması, lockstep yapılması, dahili cache yerine TCM (Tightly Coupled Memory) tercih edilmesi tesadüf değildir. Cortex-M7'nin TCM arayüzü tam olarak **deterministik tek-saat erişim** sağlamak için vardır — cache miss'i tamamen yoldan çıkarmak için.

---

## Yöntem 3 — Hibrit ve Olasılıksal Yaklaşım: MBPTA

Saf ölçüm tabanlı analizin "ne kadar pay yeterli" sorusunu **istatistiğe** havale eden bir aile var: **MBPTA (Measurement-Based Probabilistic Timing Analysis)**. Bu yaklaşımın öncüsü Cazorla ve grubu olmuştur; temel fikir, çok sayıda yürütme süresinden **uç değer teorisi (Extreme Value Theory, EVT)** ile bir aşılma olasılığı (exceedance probability) eğrisi oturtmaktır.

İdeal hedef şuna benzer bir ifadedir:

> "Bu görevin 2.0 ms'yi aşma olasılığı, herhangi bir çalıştırmasında 10⁻⁹'dan azdır."

DO-178C için DAL A'da kabul edilen tehlikeli (catastrophic) hata oranı saat başına 10⁻⁹ mertebesinde olduğundan, bu rakamlar uçuş yazılımıyla aynı dilde konuşur. MBPTA bu yüzden son 15 yılda araştırma topluluğunda hızlandırıcı buldu.

Ama EVT'yi bir veri kümesine sağlıklı oturtmak için gerekli varsayım sancılıdır: **bağımsız ve aynı dağılımlı (i.i.d.) örnekler.** Gerçek bir CPU'da iki ardışık yürütme cache, branch predictor ve TLB durumunu paylaştığı için bağımsız değildir. MBPTA toplulukları bu sorunu **time-randomized hardware** veya yazılım katmanında yapılan random cache placement gibi tekniklerle çözmeye çalıştı; ancak bu, tipik bir Cortex-R/M üzerinde mevcut olmayan bir özelliktir. EVT'nin yanlış parametrelendirilmesi ise tehlikeli **underestimation** üretir — yani "10⁻⁹" iddiası gerçekte 10⁻⁵ olabilir.

Endüstride MBPTA hâlâ tipik olarak **araştırma ve ön-tahmin aşamasında** kalır. Sertifikasyon kanıtı olarak tek başına neredeyse hiçbir zaman kullanılmaz; statik analiz veya yapılandırılmış ölçüm tabanlı analiz ile birlikte sunulur.

Endüstriyel tarafta gerçek dünyada görülen şey, ölçüm + statik birleşimi olan **hibrit** araçlardır. Rapita Systems'ın **RapiTime** ürünü buna örnektir: kodda enstrümantasyon noktaları (ipoint) kurar, hedefte koşturur ve gözlenen blok sürelerini program yapısıyla birleştirip uç-uca WCET çıkarımı yapar. Ölçüm tabanlı kalır ama temel blok düzeyinde yaptığı için kapsama problemi blok düzeyine indirgenir — tek bir test çalıştırmasının tüm yolları gezmesi gerekmez.

---

## DO-178C Bölüm 6.3.4.f Tam Olarak Ne Diyor?

DO-178B'de WCET, "kaynak kodu doğru ve tutarlıdır" objektifinin altında yer alıyordu ama açıkça yazılmamıştı. DO-178C (2011) bunu Bölüm **6.3.4.f**'de netleştirdi: kaynak kodu incelemesinin parçası olarak yazılımın **worst-case execution timing**, **stack usage** ve **resource contention** açısından doğrulanmış olması gerektiğini söyler.

Bu paragraf üç önemli açılım içerir. Birincisi: WCET tek başına ele alınmaz — stack overflow ve kaynak çatışması ile birlikte ele alınır. İkincisi: derleyici seçeneklerinin, linker seçeneklerinin ve donanım özelliklerinin etkilerinin değerlendirilmiş olması gerekir. Yani `-O2` yerine `-O0` ile build edip WCET ölçmek kabul edilmez; sertifikalanan binary üzerinde yapılmalıdır. Üçüncüsü: bu bir **kanıt** üretme yükümlülüğüdür, yani **traceable** olarak belgelenmiş bir analiz çıktısı istenir.

Pratikte DAL A bir görev için tipik kanıt seti şudur:

| Kanıt Bileşeni | Tipik Kaynak |
|---|---|
| Görev başına WCET tahmini | aiT raporu veya RapiTime raporu |
| Pessimizm gerekçesi | Tool qualification + assumptions doc |
| Schedulability sonucu | RMA/EDF analizi, hyperperiod tablosu |
| Test ortamı identikliği | Build manifest + hardware revision lock |
| Worst-case input identifikasyonu | Test prosedürü veya WCET annotation |

Bu seti üretmek ucuz değildir. Tipik bir uçuş yazılımı projesinde WCET analizi, Verification fazının doğrulamayla en çok zaman alan ikinci–üçüncü kalemidir (en pahalısı genellikle MC/DC yapısal kapsama).

---

## Çok Görevli Sistemlerin Görünmez Maliyeti: CRPD

Tek başına bir görev için WCET hesaplamak yeterli değildir. Gerçek bir RTOS'ta görevler birbirini önceleyerek (preempt) keser. Preemption olduğunda yüksek öncelikli görev kendi cache satırlarını yükler ve önceki görevin sıcak cache satırlarını **tahliye eder**. Önceki görev geri kaldığında kendi cache satırlarını yeniden çekmek zorunda kalır. Bu ek maliyet **CRPD (Cache-Related Preemption Delay)** olarak adlandırılır.

CRPD, sistem mühendisliği açısından sinsi bir hata kaynağıdır. Tek görev ölçümlerinden çıkardığınız WCET'leri standart bir RMA (Rate Monotonic Analysis) ile birleştirirseniz, schedulability sonucu doğru gibi görünür. Ama CRPD'yi içermediği için **gerçekte schedulable olmayan** bir sistem ortaya çıkar. Sahada görünen davranış: yük arttığında düşük öncelikli kontrol görevinin deadline'ı zaman zaman aşılır; bu olay nadir olduğu için "geçici bir glitch" olarak kategorize edilir; ay başında kalibrasyon kayar, ya da hata daha fena bir şeye dönüşür.

CRPD üst sınırlamasının literatürdeki klasik yaklaşımı **UCB (Useful Cache Blocks)** kavramına dayanır: bir görev önceliği önündeki tüm görevlerin tahliye edebileceği kendi UCB sayısı kadar cache satırının yeniden yüklenme maliyetini taşır. Çoklu seviye (L1+L2) cache hiyerarşilerinde bu analiz çok daha karmaşıktır ve aktif araştırma alanıdır.

Pratik tasarımcı tavsiyesi:

1. Mümkünse **cache locking** kullanın (ARM Cortex-R ailesinde way-locking vardır): kritik görevin kod ve veri cache satırlarını kilitleyin, preemption onları tahliye edemez.
2. Cache yerine **TCM** kullanın: Cortex-M7'nin ITCM/DTCM blokları cache değildir; preemption bunları etkilemez.
3. Eğer hiçbiri yapılamıyorsa, RMA hesabında her görev için CRPD'yi ayrı bir maliyet olarak ekleyin ve yine de görevin schedulable olduğunu gösterin.

---

## Somut Bir Örnek: Aynı Kodun Üç Farklı "Çalışma Süresi"

Şu C fonksiyonunu düşünün — küçük bir IIR filtre:

```c
#define N 256
static float coeffs[N];
static float state[N];

float run_filter(float x) {
    float acc = 0.0f;
    for (int i = N - 1; i > 0; i--) {
        state[i] = state[i - 1];
        acc += coeffs[i] * state[i];
    }
    state[0] = x;
    acc += coeffs[0] * x;
    return acc;
}
```

Cortex-M7 @ 400 MHz üzerinde, tek seferlik ölçüm üç farklı senaryoda üç farklı sayı verir (tipik mertebeler — birebir sayı değil):

| Senaryo | Süre (yaklaşık) | Açıklama |
|---|---|---|
| **Cache sıcak, kesme yok** | ~3 µs | Cortex-M7 L1 I/D-cache (uygulamaya göre tipik 16 KB), tüm `coeffs`/`state` dizileri D-cache'de |
| **Cache soğuk başlangıç** | ~12 µs | İlk çağrı; dizilerin cache miss'leri yığılır |
| **Önceki preemption sonrası** | ~9 µs | Yüksek öncelikli görev D-cache'i tahliye etti; yeniden yükleme maliyeti |

Saf ölçüm tabanlı bir analiz tipik olarak ilk senaryoyu tetikleyecektir (test düzeneği döngüsel çağırır, cache sıcak kalır). Gözlenen max ≈ 3 µs olur. Mühendis %50 pay ekler: WCET ≈ 4.5 µs. Sistem 5 µs slot'a oturtulur. Sahada preemption olduğunda gerçek süre 9 µs'ye çıkar; deadline aşılır.

Statik analizle (aiT, kaynağa göre yapılandırılmış Cortex-M7 cache modeli ile) yapılan bir hesap **tüm dizilerin always-miss varsayımı altında** ≈ 14–18 µs civarında bir üst sınır verir. Pessimisttir ama soundtur. Sistem 20 µs slot'a oturtulur, slot tüketimi %50–60 civarında olur, deadline asla aşılmaz.

İkisi arasındaki fark: ölçüm sonuç **bilgi** verir, statik analiz **garanti** verir.

---

## Üç Yaklaşım, Üç Farklı Pazarlık

| Yaklaşım | Soundness | Pessimizm | Donanım modeli gerekiyor mu? | Tipik kullanım |
|---|---|---|---|---|
| **Statik analiz (aiT)** | Evet (varsayımlar geçerliyse) | Yüksek (özellikle out-of-order'da) | Evet, detaylı | DAL A/B kanıtı |
| **Saf ölçüm tabanlı** | Hayır | Düşük (engineering margin'a bağlı) | Hayır | Erken-faz, DAL C/D |
| **Hibrit (RapiTime)** | Kısmi (yapısal) | Orta | Kısmi | DAL A/B, çok yollu sistemler |
| **MBPTA** | Olasılıksal | Olasılık seviyesine göre | Hafif (ama i.i.d. zor) | Araştırma, ön tahmin |

Endüstri yığını tipik olarak şudur: erken-fazda saf ölçüm + engineering margin ile sistem tasarımı yapılır; entegrasyon fazında hibrit araçlarla doğrulama yapılır; sertifikasyon dokümantasyonu için DAL A'da statik analizden geçilir. Tek bir yaklaşımla yetinmek emniyet kritik sistemler için ya çok pahalı (saf statik) ya çok güvensiz (saf ölçüm) olur.

---

## Pratik Tavsiyeler

1. **WCET'i sistem mimarisinden kovmayın.** Kritik görevlerin cache erişimini TCM ile veya locking ile sınırlandırın; bu, hem statik analizi tightleştirir hem ölçüm dağılımını sıkıştırır.
2. **Derleyici seçeneklerini sertifikasyon kapsamında dondurun.** `-O2` ile yapılmış bir WCET analizi `-O3` build'i kapsamaz; pragma tabanlı yerel optimizasyon değişiklikleri bile analizi geçersiz kılabilir.
3. **Engineering margin'ı asla tek savunma hattı olarak kullanmayın.** %20 pay, gerçek pessimizm sebepleri hakkında elinizde hiçbir kantitatif veri olmadığında matematiksel bir kapı değil bir umutturlar.
4. **CRPD'yi schedulability hesabınızdan dışarıda bırakmayın.** Tek-görev WCET + RMA kombinasyonu, çoklu görev sistemlerinde sessizce yanlış sonuç verir.
5. **Timing anomaly olan mimarilerde dikkatli olun.** Cortex-A9 ve üstü out-of-order çekirdeklerde lokal worst-case varsayımı sound değildir; aiT gibi araçlar bunun farkında olup soyut yorumlama sırasında pipeline durumlarını branchler — bunu manuel yapmak ise neredeyse imkânsızdır.
6. **Hibrit yaklaşımda enstrümantasyon yükünü ölçün.** RapiTime gibi araçlar ipoint başına ek talimat ekler; bu ek yük gerçek koddaki cache footprint'i değiştirebilir. Üreticinin önerdiği "instrument-then-remove" akışını izleyin.

---

## Açık Sorular ve İleri Okuma

WCET araştırmasının hâlâ açık tarafları çoktur. Multi-core sertifikasyonu hâlâ kanı kalın bir konu: tek bir çekirdek üzerinde yapılan analiz, başka bir çekirdek üzerindeki bellek baskısını kapsamaz. CAST-32A ve onun yerine geçen **AMC 20-193** uyarısı tam bu eksikliği hedefliyor. Buradan başlamak için **Rapita Systems**'in multicore timing analysis çalışmaları ve EASA'nın AMC 20-193 dokümantasyonu okunmaya değer.

GPU ve hızlandırıcılarda WCET ise hâlâ olgunlaşmamış bir alan. Aviyonik sektörünün NVIDIA Orin ve benzeri SoC'leri DAL B/C için kullanmaya başlaması, MBPTA'yı yeniden gündeme getirebilir — çünkü statik analizin bu mimarilerde anlamlı bir model üretmesi yakın gelecekte gerçekçi görünmüyor.

Son bir yan not: WCET'in pratik karşılığı her zaman bir sayı değildir. Asıl çıktı, "bu sistem bu deadline'ı bu şartlarda karşılar" cümlesini destekleyen **kanıt zinciri**dir. WCET sayısı o zincirin tek bir halkası; donanım modeli, derleyici dondurma, schedulability analizi, CRPD bilanço, test ortamı identikliği halkanın diğer parçaları. Bir halkayı atlamak zincirin tamamını boşa çıkarır.

Defterimde bu yazının doğal devamı olabilecek üç konu duruyor: çok-çekirdekli sertifikasyon ve AMC 20-193; ARM lockstep mimarisi (TI Hercules, Cortex-R5 DCLS) ve fail-operational tasarım; ve schedulability'nin Liu–Layland'dan günümüze evrimi (response time analysis, sporadic server).

---

**Kaynaklar:**

- Reinhard Wilhelm et al. — ["The Worst-Case Execution-Time Problem—Overview of Methods and Survey of Tools"](https://dl.acm.org/doi/10.1145/1347375.1347389), ACM Transactions on Embedded Computing Systems, Vol. 7, No. 3, Article 36, April 2008.
- Thomas Lundqvist, Per Stenström — "Timing Anomalies in Dynamically Scheduled Microprocessors", *20th IEEE Real-Time Systems Symposium (RTSS)*, 1999.
- Jan Reineke, Björn Wachter, Stephan Thesing et al. — ["A Definition and Classification of Timing Anomalies"](https://www.rw.cdl.uni-saarland.de/people/reineke/private/publications/TimingAnomaliesWCET06.pdf), 6th International Workshop on Worst-Case Execution Time Analysis (WCET 2006).
- AbsInt — ["aiT Worst-Case Execution Time Analyzers"](https://www.absint.com/ait/index.htm), ürün sayfası ve teknik dokümantasyon.
- AbsInt — ["Worst-Case Execution Time Prediction by Static Program Analysis"](https://www.absint.com/aiT_WCET.pdf), tanıtım makalesi.
- Rapita Systems — ["DO-178B, DO-178C and Worst-Case Execution Time"](https://www.rapitasystems.com/blog/do-178b-do-178c-and-worst-case-execution-time).
- Rapita Systems — ["Multicore Timing Analysis for DO-178C"](https://www.rapitasystems.com/whitepaper/multicore-timing-analysis-do-178c) (whitepaper).
- Liliana Cucu-Grosjean, Luca Santinelli, Michael Houston, Code Lo, Tullio Vardanega, Leonidas Kosmidis, Jaume Abella, Enrico Mezzetti, Eduardo Quiñones, Francisco J. Cazorla — ["Measurement-Based Probabilistic Timing Analysis for Multi-path Programs"](https://who.rocq.inria.fr/Liliana.Cucu/sies2013.pdf), 24th Euromicro Conference on Real-Time Systems (ECRTS), 2012.
- Sebastian Altmeyer, Claire Maiza, Jan Reineke — "Resilience analysis: tightening the CRPD bound for set-associative caches", *LCTES*, 2010.
- ARM — ["Cortex-M7 Devices Technical Reference Manual"](https://developer.arm.com/documentation/ddi0489/) (TCM, cache organization, deterministic memory access).
- RTCA — *DO-178C, Software Considerations in Airborne Systems and Equipment Certification*, Section 6.3.4 (Reviews and Analyses of Source Code), December 2011.
- EASA — ["AMC 20-193 Use of multi-core processors"](https://www.easa.europa.eu/en/document-library/certification-memoranda).

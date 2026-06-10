---
title: "Yöneylem Araştırması Yöntemleri: Kesin ve Metasezgisel Yaklaşımlar"
subtitle: "Operational Research Methods: Exact and Metaheuristic Approaches"
background: "/img/posts/5.webp"
date: '2026-04-14 09:00:00'
layout: post
lang: tr
mermaid: true
tags: [yoneylem-arastirmasi]
---

Gündelik hayatın ve iş süreçlerinin pek çok problemi yüzeyde sezgisel bir karar gibi görünse de aslında birer **optimizasyon** problemidir. Hangi ürünü ne kadar üreteceğiz? Sınırlı kamyon filosuyla siparişleri hangi rotada dağıtacağız? Bir çantaya ağırlık ve değer kısıtları altında hangi eşyaları koyacağız? Bir hastanede hemşire nöbet çizelgesini nasıl yapacağız? Bu soruların ortak paydası şudur: **sınırlı kaynakları sınırlı kısıtlar altında bir amaca göre en iyileyecek şekilde dağıtmak.**

İşte **Yöneylem Araştırması** (İngilizce *Operational Research* veya *Operations Research*, kısaca OR), bu sorunları sistematik biçimde çözmek için geliştirilmiş disiplinin adıdır. Bu yazıda OR'un iki büyük yöntem ailesini — **kesin (exact) yöntemler** ve **metasezgisel (metaheuristic) yöntemler** — tanımları ve klasik örnekleriyle inceleyeceğiz. Linear Programming (LP), Integer Programming (IP), Binary Integer Programming (BIP), Mixed-Integer Programming (MIP) ve Dynamic Programming (DP) kesin yöntemleri oluşturur. Genetic Algorithm (GA), Simulated Annealing (SA), Tabu Search (TS) ve Ant Colony Optimization (ACO) ise problem çok büyüdüğünde devreye giren metasezgisel ailenin temsilcileridir. Sonunda iki dünyayı birleştiren **matheuristic** yaklaşıma ve "hangi problem hangi yöntemi ister?" sorusuna pratik bir çerçeve sunacağız.

---

## Kısa Bir Tarihçe: OR Nasıl Doğdu?

Yöneylem araştırmasının kökleri İkinci Dünya Savaşı'na uzanır. 1940 Ağustos'unda, Britanya Hava Savaşı'nın tam ortasında, fizikçi **Patrick Blackett** İngiliz ordusunun Anti-Aircraft Command'ı için bir bilim insanları grubu kurdu. Bu grup — tarihe "Blackett's Circus" (Blackett'ın Sirki) olarak geçti — anti-uçak toplarının düşman bombardımanlarını düşürme oranını iyileştirmek için mekanik hesaplama sistemlerini analiz etti. Sonuç çarpıcıydı: bir düşman uçağını düşürmek için gereken ortalama mermi sayısı, Britanya Hava Savaşı'nın başlangıcındaki **20.000'den 1941'de 4.000'e** indirildi.

1941'de Blackett RAF Coastal Command'a geçti ve burada başka bir ekip kurarak Alman U-botlarına karşı kullanılan konvoy taktiklerini, derinlik bombası ayarlarını ve uçak kamuflajını analiz etti. Kaleme aldığı "Scientists at the Operational Level" (Operasyonel Düzeyde Bilim İnsanları) başlıklı dâhili memorandum, modern "operational research" kavramının ilk resmi tanımlarından biri kabul edilir. Savaş bitmeden çok önce OR, stratejik askeri karar vermenin vazgeçilmez parçası olmuştu.

Savaş sonrasında disiplin hızla sanayiye taşındı. 1946'da Amerikan Ordusu için mekanizasyon çalışmaları yürüten genç bir matematikçi olan **George Dantzig**, 1947 yılının yazında **simpleks yöntemini** geliştirdi; böylece doğrusal programlama (linear programming) tekniği doğmuş oldu. "Linear programming" terimini kendisi değil, 1948'de Dantzig'in RAND Corporation'a yaptığı ziyarette meslektaşı **Tjalling Koopmans** önermiştir. 1952'de RAND'e katılan **Richard Bellman**, çok aşamalı karar problemlerini modellemek için **dinamik programlama**yı geliştirdi ve 1957'de aynı adı taşıyan klasik kitabı yayımladı.

1960'larda Ailsa Land ve Alison Doig'in **dal-sınır (branch-and-bound)** algoritması, Ralph Gomory'nin **kesme düzlemleri** (cutting planes) ve 1970'lerde John Holland'ın **genetik algoritmaları** ile alan hızla zenginleşti. 1980'lerle birlikte Kirkpatrick ve ekibinin **benzetimli tavlaması**, Glover'ın **tabu araması** ve Dorigo'nun **karınca kolonisi optimizasyonu** metasezgisel devrimi başlattı. Bugün OR, üretimden lojistiğe, sağlıktan finansa, enerjiden telekomünikasyona pek çok sektörün arka planında sessizce çalışan bir bilim dalıdır.

İlginçtir, OR'un bu erken dönem araştırmacılarının birçoğu Nobel ödülü kazandı: Koopmans 1975'te "kaynakların optimal tahsisi" üzerine yaptığı çalışmalarla Ekonomi Nobel'i aldı; 1994'te John Nash, John Harsanyi ve Reinhard Selten oyun teorisi üzerinden ödüle layık görüldü. Dantzig'in adı uzun yıllar Nobel için geçmesine rağmen ödül sadece ekonomi ve barış gibi alanlara verildiğinden matematiğe özgü Fields Madalyası'na da uygun olmadığı için resmi bir büyük ödül alamadı; fakat akademik camiada SIAM tarafından onun adına "Dantzig Prize" oluşturuldu ve her iki yılda bir matematiksel programlamaya katkı yapan bir bilim insanına verilir.

---

## Yöneylem Araştırması Nedir?

Her OR probleminin üç temel bileşeni vardır:

1. **Karar değişkenleri** (decision variables): Çözümü oluşturan, kontrol edebildiğimiz büyüklükler. Bir işçi sayısı, bir makinenin çalışma süresi, "bu kamyon o depoya gidecek mi?" gibi ikili kararlar.
2. **Amaç fonksiyonu** (objective function): Maksimize ya da minimize etmek istediğimiz ölçüt. Kâr, maliyet, süre, yakıt tüketimi gibi.
3. **Kısıtlar** (constraints): Gerçek hayatın çözüme dayattığı sınırlar. Bütçe, kapasite, zaman pencereleri, talep miktarları gibi.

Genel bir optimizasyon problemi matematiksel olarak şöyle yazılır:

```text
min (veya max)    f(x)
s.t.              g_i(x) ≤ 0,   i = 1..m
                  h_j(x) = 0,   j = 1..k
                  x ∈ X
```

Burada `f` amaç fonksiyonu, `g_i` eşitsizlik kısıtları, `h_j` eşitlik kısıtları ve `X` karar değişkenlerinin bulunabileceği bölgedir (sürekli sayılar, tam sayılar, ikili değerler vb.).

Bu üçlü formüle edildikten sonra iki temel soru ortaya çıkar: **(a)** çözüm uzayı ne kadar büyük? ve **(b)** garantili optimal mi, yoksa makul sürede "yeterince iyi" bir çözüm mü istiyoruz? Bu iki soruya verilen yanıt sizi ya kesin yöntemlere ya da metasezgisellere yöneltir. Bir sonraki bölümlerde bu iki aileyi tek tek ele alacağız.

---

## Kesin (Exact) Yöntemler

Kesin yöntemler, problem boyutu ve yapısı izin verdiğinde **matematiksel olarak garantili optimal çözümü** üreten tekniklerdir. Simpleks, dal-sınır ve dinamik programlama gibi algoritmalar bu ailenin temel taşlarıdır. Karşılığında ödenen bedel genellikle artan problem boyutlarında üstel mertebede büyüyen çalışma süresidir.

### Doğrusal Programlama (Linear Programming — LP)

LP, yöneylem araştırmasının en eski ve en temel aracıdır. Hem amaç fonksiyonunun hem de kısıtların **doğrusal** olduğu, karar değişkenlerinin ise **sürekli (gerçek sayı)** olabildiği problemleri çözer. Standart formu şöyle yazılır:

```text
max    z = c₁x₁ + c₂x₂ + ... + cₙxₙ
s.t.   a₁₁x₁ + a₁₂x₂ + ... + a₁ₙxₙ ≤ b₁
       a₂₁x₁ + a₂₂x₂ + ... + a₂ₙxₙ ≤ b₂
       ...
       xᵢ ≥ 0   (∀ i)
```

Dantzig'in 1947'de geliştirdiği **simpleks yöntemi**, LP çözmek için hâlâ en yaygın kullanılan algoritmadır. Simpleks'in arkasındaki sezgi saf geometriktir: LP'nin uygulanabilir bölgesi (feasible region) çok boyutlu bir çokyüzlüdür (polyhedron); optimum değer bu çokyüzlünün **köşelerinden birinde** bulunur. Simpleks tam olarak bunu yapar: bir köşeden komşu köşeye geçerek amaç fonksiyonunu iyileştirir, iyileştirme kalmayınca durur. Pratikte son derece hızlıdır; ama en kötü durumda üstel zamanda çalışabilir. 1979'da Leonid Khachiyan'ın elipsoid yöntemi ile LP'nin polinom zamanda çözülebildiğini kanıtlaması ve 1984'te Narendra Karmarkar'ın projektif **iç nokta yöntemleri**ni (interior point methods) geliştirmesi, alanın iki büyük teorik sıçramasıdır. Modern çözücüler bu iki aileyi birlikte kullanır.

LP'nin bir diğer güzelliği **ikilik teoremi**dir (duality theorem): Her LP'nin bir "eşleniği" (dual) vardır. Primal problem "kârı maksimize et" ise dual "minimum kaynak kullan" gibi yorumlanır. Dualin çözüm değeri, primale ait **gölge fiyatları** (shadow prices) verir: "Kısıt *i*'yi bir birim gevşetirsem amaç fonksiyonu ne kadar değişir?" sorusunun yanıtı. Duyarlılık analizi (sensitivity analysis), kapasite yatırımı ve fiyatlama gibi iş kararlarının temelidir.

**Klasik örnek — Üretim karışımı:** Bir mobilya atölyesi masa ve sandalye üretiyor. Her masadan 40 TL, her sandalyeden 30 TL kâr ediyor. Elimizde 400 saatlik marangozluk ve 240 saatlik cila kapasitesi var. Bir masa 4 saat marangozluk, 2 saat cila; bir sandalye 2 saat marangozluk, 2 saat cila gerektiriyor. Kârı maksimize etmek için kaç masa ve kaç sandalye üretmeliyiz?

```text
max    z = 40x₁ + 30x₂
s.t.   4x₁ + 2x₂ ≤ 400   (marangozluk)
       2x₁ + 2x₂ ≤ 240   (cila)
       x₁, x₂ ≥ 0
```

Bu küçük LP'nin optimum noktası uygulanabilir bölgenin köşelerinden birindedir. Grafik yöntemle çözüldüğünde kısıtların kesiştiği nokta `(x₁=80, x₂=40)` optimal çözüm olur ve kâr `40·80 + 30·40 = 4.400` TL'dir. Simpleks aynı sonucu saniyenin milyonda birinde bulur.

LP'nin en bilinen uygulama kategorileri:

- **Diet problem** (beslenme): En düşük maliyetle günlük besin gereksinimlerini karşılamak üzere hangi yiyeceklerden ne kadar tüketilmeli? Dantzig'in 1945'te başlayan klasik çalışmalarından biri.
- **Transportation problem** (ulaşım): *m* fabrikadan *n* depoya, her fabrika-depo çifti için farklı taşıma maliyetleri ile en ucuz akış nasıl sağlanır?
- **Assignment problem** (atama): *n* işi *n* kişiye, her eşleşme için farklı yetkinlikle en verimli şekilde nasıl atarız?
- **Blending problem** (karışım): Rafinerilerde ham petrolün benzin/dizel karışımlarına dağıtımı; en düşük maliyetli kimyasal bileşim.
- **Production planning** (üretim planlama): Birden çok ürün, birden çok dönem, kapasite ve envanter kısıtları altında toplam kârı maksimize etme.

LP pratikte **milyonlarca değişken ve kısıt** içeren modelleri modern çözücüler (Gurobi, CPLEX, HiGHS) ile saniyeler–dakikalar mertebesinde çözebilir. Bu olağanüstü ölçeklenebilirlik, LP'yi diğer tüm kesin yöntemlerin "çözüm zemini" hâline getirir: IP, BIP ve MIP'in pek çok algoritması arka planda binlerce LP çözer.

Simpleksin bir takım patolojik durumları da vardır ve bunlar pratikte bilinir: **Dejenerasyon** (degeneracy), birden fazla kısıtın aynı köşede kesişmesi durumudur; bu durumda amaç fonksiyonu iyileşmeden birkaç iterasyon yapılabilir ve en kötü durumda **çevrim** (cycling) oluşabilir. Bland'in anti-çevrim kuralı ve sözlükbilimsel kurallar (lexicographic rule) bu sorunu çözer. **Gözden geçirilmiş simpleks** (revised simplex) ise tüm tabloyu her iterasyonda güncellemek yerine yalnızca bazın tersini çarpanlara ayırarak bellek ve hesap verimini artırır; modern çözücüler bu versiyonu kullanır. Dahası büyük ölçekli ve özel yapılı LP'ler için **Dantzig-Wolfe ayrıştırması** (decomposition) ve ona dual olan **Benders ayrıştırması** gibi teknikler, problemi daha küçük alt problemlere bölerek çözer.

### Tam Sayı Programlama (Integer Programming — IP)

Karar değişkenleri **yalnızca tam sayı** değerler alabildiğinde IP'den söz ederiz. "2.4 adet çalışan işe al" gibi anlamsız sonuçlardan kaçınmak için kullanılır:

```text
max    z = cᵀx
s.t.   Ax ≤ b
       xᵢ ∈ ℤ   (∀ i)
```

IP, LP'den çok daha zordur; genel IP **NP-zor** sınıfına girer. Teorik çözüm yöntemleri Land ve Doig'in 1960'ta *Econometrica* dergisinde tanıttığı **dal-sınır algoritması** ve Gomory'nin 1958'de önerdiği **kesme düzlemleri**dir. Modern çözücüler bu ikisini **dal-ve-kesme** (branch-and-cut) şemasında birleştirir.

**Dal-sınır mekanizması:** Önce LP gevşetmesi (tam sayı şartı kaldırılmış hâli) çözülür. Eğer sonuç zaten tam sayıysa bitti. Değilse kesirli bir değişken seçilir (örneğin `x₃ = 2.7`) ve problem iki alt probleme bölünür: `x₃ ≤ 2` ve `x₃ ≥ 3`. Her alt problem kendi LP gevşetmesiyle çözülür; "sınır" değeri mevcut en iyi tam sayı çözümden daha kötüyse o dal budanır (bound). Algoritma bir ağaç biçiminde gezinerek tüm olası tam sayı çözümleri kapsadığına emin olur.

**Kesme düzlemleri** aynı zamanda güçlü bir fikirdir: LP gevşetmesine, tüm tam sayı çözümleri dışarıda bırakmayan ama mevcut kesirli LP çözümünü kesip atan yeni eşitsizlikler eklenir. Bu şekilde uygulanabilir bölge sıkılaştırılır, dallanma sayısı azalır. Gomory mixed-integer cuts, MIR, lift-and-project, flow cover gibi onlarca kesi ailesi modern çözücülerde yer alır.

IP için bir özel durum daha önemlidir: **tamamen unimodular** (totally unimodular) matrisler. Eğer kısıt matrisinin tüm karesel alt determinantları `{-1, 0, +1}` kümesinde yer alıyorsa, LP gevşetmesinin optimum çözümü zaten tam sayıdır. Bu özellik ağ akış problemleri, bazı çizelgeleme problemleri ve çift yönlü eşleme (bipartite matching) için geçerlidir — bunlar polinom zamanda çözülür.

**Klasik örnek — Tesis yerleşimi:** Bir kargo şirketi *m* aday lokasyondan bazılarını depo olarak açmak istiyor. Her depo açma maliyeti ve her müşteriye hizmet maliyeti biliniyor. Her müşterinin hangi depodan hizmet alacağı (tam sayı atama) ve hangi depoların açılacağı (0/1 karar) birlikte modellenir; toplam maliyet minimize edilir. Az sayıda aday varken dakikalarla çözülürken, yüzlerce aday için saatlere çıkabilir. Benzer yapıdaki **makine atama** ve **üniversite ders programı** problemleri de IP ile çözülür.

IP için bir diğer önemli klasik teknik **Lagrange gevşetmesi**dir (Lagrangian relaxation): Zor kısıtlar amaç fonksiyonuna ceza (Lagrange çarpanı) olarak eklenir; elde edilen gevşek problem genelde yapısal olarak daha kolaydır (çoğu kez bağımsız alt problemlere ayrışır). Çarpanlar subgradient yöntemiyle iteratif olarak güncellenir. Çıkan Lagrange duali, orijinal IP için bir alt sınır verir ve dal-sınır ağacında güçlü budama sağlar. 1970'lerde Held ve Karp'ın TSP için kullandığı bu yaklaşım, o dönemin en iyi alt sınırlarını vermiştir ve hâlâ özel yapılı büyük IP'lerde tercih edilir.

### İkili Tam Sayı Programlama (Binary Integer Programming — BIP)

Karar değişkenlerinin yalnızca **{0, 1}** değerlerini alabildiği özel bir IP türüdür. "Bir iş yapılacak mı?", "Bu rota seçilecek mi?", "Bu eşya çantaya girecek mi?" gibi **evet/hayır** kararlarında doğal modeldir:

```text
min    z = cᵀx
s.t.   Ax ≤ b
       xᵢ ∈ {0, 1}   (∀ i)
```

BIP, kombinatoryal optimizasyonun pek çok klasik problemini kapsar:

- **Knapsack problem** (sırt çantası): Hangi eşyaları seçelim?
- **Set covering** (küme örtme): Elimizdeki *m* gereksinimin tamamını karşılayacak en az sayıda araç/hizmet/eleman nasıl seçilir? Hizmet merkezi yerleştirme, elektrik ağı tasarımı, test kümesi seçimi bu sınıftadır.
- **Set partitioning** (küme bölüntüleme): Elemanları tam olarak tek bir alt kümeye düşecek şekilde nasıl gruplayalım? Havayolu mürettebat eşleme, araç rotalama sorunlarında kullanılır.
- **Matching** (eşleme): İki grup arasındaki maksimum kâra ulaşan eşleşmeyi bul.
- **Graph coloring** (çizge renklendirme): Komşu düğümler farklı renklere sahip olmak üzere minimum renk sayısı.

**Klasik örnek — Sırt çantası (Knapsack) problemi:** *n* eşya var; her biri için ağırlık *wᵢ* ve değer *vᵢ* biliniyor. Taşıyabileceğimiz maksimum toplam ağırlık *W*. Hangi eşyaları alırız?

```text
max    Σᵢ vᵢ · xᵢ
s.t.   Σᵢ wᵢ · xᵢ ≤ W
       xᵢ ∈ {0, 1}
```

Somut örnek: 4 eşya (ağırlık-değer): (2-3), (3-4), (4-5), (5-6); kapasite *W*=5. Hangi eşyaları alırız? Dört eşya var, bu yüzden 2⁴ = 16 olası alt küme var; küçük bir örnekte bile el hesabı uzar. Çözüm: `{x₁=1, x₂=1, x₃=0, x₄=0}`, toplam ağırlık 5, toplam değer 7.

Knapsack, BIP'nin ders kitabı örneği olmakla kalmaz, aynı zamanda dinamik programlama ile de çözülebilir (aşağıda DP bölümünde göreceğiz) — kesin yöntemlerin birbirine nasıl bağlandığına güzel bir örnektir. Benzer şekilde "hangi işi kabul edelim?", "hangi reklamı yayımlayalım?", "hangi yatırım projesine girelim?" gibi pek çok günlük problem BIP olarak modellenebilir.

### Karma Tam Sayı Programlama (Mixed-Integer Programming — MIP)

MIP, LP ile IP/BIP'i aynı model içinde birleştirir: bazı değişkenler sürekli (akış, süre, miktar), bazıları ise tam sayı ya da ikilidir (bir tesis açılacak mı, bir rota seçilecek mi). Gerçek dünya problemlerinin büyük çoğunluğu doğal olarak MIP'tir:

```text
min    cᵀx + dᵀy
s.t.   Ax + By ≤ b
       x ≥ 0,   y ∈ ℤⁿ
```

MIP çözücüleri son 25 yılda **milyon kat** performans artışı yaşamış bir alandır; bunun büyük kısmı donanımdan değil algoritmik iyileştirmelerden (daha iyi ön işleme, güçlü kesiler, primal sezgisel ve dallanma stratejileri) gelir. Gurobi, CPLEX ve FICO Xpress gibi araçlar pek çok endüstriyel problemi dakikalar içinde çözer.

MIP modelleri sıkça **Big-M tekniği** kullanır. "Eğer tesis *i* açıksa, akış olabilir" tipi mantıksal kuralları doğrusallaştırmak için yapılan klasik hile şudur:

```text
x_ij ≤ M · y_i       (y_i = 0 ise x_ij = 0'a zorlanır; y_i = 1 ise x_ij serbest)
```

Burada `M` yeterince büyük bir sabittir. `M`'nin çok büyük seçilmesi LP gevşetmesini zayıflatır ve çözümü yavaşlatır; çok küçük seçilmesi gerçek çözümleri dışarıda bırakır. Doğru `M` seçimi iyi MIP modellemenin sanatıdır.

**Klasik örnek — Tedarik zinciri ağ tasarımı:** Hangi fabrikaların açılacağı (ikili), hangi fabrikadan hangi dağıtım merkezine ne kadar ürün akacağı (sürekli), hangi kamyon rotalarının kullanılacağı (ikili) kararlarının birleşimi saf bir MIP'dir. Çok katmanlı modelde açma/kapama kararları ile akış kararları aynı anda optimize edilir. Toplam maliyet = sabit açılış maliyetleri + değişken üretim ve taşıma maliyetleri. Kısıtlar: müşteri talebini karşılamak, kapasiteyi aşmamak, sadece açık tesisten akış olmak.

Benzer bir yapı **unit commitment** (birim taahhüt) probleminde de görülür: Hangi elektrik santrali hangi saatte açık olacak (ikili) ve açıkken ne kadar güç üretecek (sürekli)? Bu problem, Türkiye dahil tüm elektrik piyasalarında günlük olarak çözülür ve piyasa fiyatını belirler.

### Dinamik Programlama (Dynamic Programming — DP)

Richard Bellman'ın 1957'de yayımladığı *Dynamic Programming* kitabında formalize ettiği DP, problemi **örtüşen alt problemlere** ayıran ve her alt problemi yalnızca bir kere çözerek sonucu ezberleyen bir stratejidir. Kalbinde Bellman'ın meşhur **optimallik ilkesi** (principle of optimality) yatar:

> *"Bir optimal politika, başlangıç durumu ve kararı ne olursa olsun, kalan kararların ilk karardan ortaya çıkan duruma göre de optimal bir politika oluşturmasını gerektirir."*

Özyinelemeli bir değer fonksiyonu (value function) ile ifade edilir:

```text
V(s) = min   { g(s, a) + V(T(s, a)) }
       a∈A(s)
```

Burada *s* durum, *a* aksiyon, *g* anlık maliyet, *T* geçiş fonksiyonu, *V* optimal maliyet fonksiyonudur. Durum uzayı sonlu ve ayrık olduğunda DP polinom zamanda optimal politika üretir; sürekli ve yüksek boyutlu durumlarda ise **boyutun laneti** (curse of dimensionality) devreye girer ve yaklaşık DP (Approximate Dynamic Programming) ya da pekiştirmeli öğrenme (reinforcement learning) yaklaşımlarına geçilir. Aslında modern pekiştirmeli öğrenme doğrudan DP matematiğinin üzerine kuruludur.

DP iki farklı biçimde uygulanabilir:

- **Top-down (memoization):** Özyinelemeli fonksiyon, önceden hesaplanmış değerleri bir cache'de tutar.
- **Bottom-up (tabulation):** Taban durumundan başlayarak tablo sistematik olarak doldurulur. Pratikte daha hızlıdır çünkü rekürsiyon yığını yoktur.

**Klasik örnek — Knapsack (tekrar):** Sırt çantası *O(nW)* DP ile çözülebilir. `f(i, w)`: ilk *i* eşya ve ağırlık bütçesi *w* ile elde edilebilecek maksimum değer.

```text
f(i, w) = max{ f(i-1, w),  f(i-1, w - wᵢ) + vᵢ }
```

4 eşya ve `W=5` için (`wᵢ = 2,3,4,5`, `vᵢ = 3,4,5,6`) DP tablosu:

```text
i\w   0  1  2  3  4  5
 0    0  0  0  0  0  0
 1    0  0  3  3  3  3
 2    0  0  3  4  4  7
 3    0  0  3  4  5  7
 4    0  0  3  4  5  7
```

Hücre `f(2,5) = 7`: ilk iki eşya ve 5 birim kapasiteyle elde edilebilecek en büyük değer. DP tabloyu aşağıdan yukarıya doldurur; `O(nW)` zaman ve bellek kullanır.

DP, bilgisayar biliminin tamamen olmazsa olmaz aracıdır. Birkaç yaygın uygulama:

- **Fibonacci sayıları:** *F(n) = F(n-1) + F(n-2)*. Saf rekürsiyon üstel, DP ile doğrusal.
- **En kısa yol (Bellman-Ford):** Negatif kenar ağırlıklarıyla çalışan tek klasik en kısa yol algoritması DP tabanlıdır.
- **Edit distance (Levenshtein mesafesi):** İki metin arasında kaç ekleme/silme/değişiklik var? Otomatik yazım denetiminin ve DNA dizi hizalamanın temeli.
- **Matrix chain multiplication:** `A·B·C·D` çarpımını hangi sıralama ile yapalım? Sonuç aynı ama ara hesap sayısı çok farklı.
- **Seçenek fiyatlaması:** Finansta opsiyon fiyatları geri yönde (backward induction) DP ile hesaplanır.
- **Viterbi algoritması:** Dijital iletişim ve konuşma tanımada gizli Markov modellerinin en olası yolunu bulur.

---

## Metasezgisel Yöntemler

Kesin yöntemler garantili optimal sağlar; fakat problem boyutu bir yerden sonra "makul" sürelerde çözülebilir olmaktan çıkar. Çizelgeleme, rotalama ve yerleşim gibi NP-zor problemlerin endüstriyel ölçekli örneklerinde "kanıtlanmış optimal" lüks bir hedef hâline gelir; kısa sürede üretilen **yeterince iyi** bir çözüm yeterlidir. Metasezgisel yöntemler bu boşluğu doldurur: doğadan (evrim, fizik, karınca kolonisi) ya da bilişsel süreçlerden (bellek, öğrenme) esinlenen, **genel amaçlı** ve **problem bağımsız** çerçeveler sunarlar.

Her metasezgiselin iki temel bileşenini ayırt etmek önemlidir:

- **Keşif (exploration, diversification):** Çözüm uzayının geniş bir bölgesini taramak.
- **Sömürü (exploitation, intensification):** Umut verici bölgeleri detaylıca araştırmak.

Bu iki eğilimin dengesi, algoritmanın yerel minimumlarda takılmadan küresel ölçekte iyi çözümler bulmasını sağlar. Ayarlar yanlış olursa algoritma ya hedefsizce dolaşır (çok fazla keşif) ya da ilk bulduğu yerel minimumda donar (çok fazla sömürü).

### Genetik Algoritma (Genetic Algorithm — GA)

John Holland'ın 1975'te yayımladığı *Adaptation in Natural and Artificial Systems* kitabıyla ana hatları çizilen, David Goldberg'in 1989 kitabıyla da pratikte yaygınlaşan GA, evrim kuramından esinlenen bir **topluluk (population) tabanlı** aramadır. Her çözüm bir **kromozom** olarak kodlanır; topluluk her iterasyonda **seçim** (selection), **çaprazlama** (crossover) ve **mutasyon** (mutation) operatörleriyle yenilenir.

```text
1. Rastgele başlangıç topluluğu üret
2. her iterasyon için:
     her kromozomun uygunluk (fitness) değerini hesapla
     turnuva / rulet tekerleği ile ebeveynleri seç
     çaprazlama + mutasyon ile yeni kromozomlar üret
     elitizm: en iyi k bireyi koru
3. durdurma kriteri karşılanınca en iyi kromozomu döndür
```

Holland'ın çalışmasının teorik kalbi **şema teoremi**dir (schema theorem): İyi kısa "şema"lar (belirli bir bit örüntüsüne sahip kromozom parçaları) topluluğa üstel hızla yayılır. Bu, GA'nın neden işe yaradığının teorik bir açıklamasıdır.

GA'nın gücü, kromozom kodlamasının esnekliğinden gelir:

- *İkili kodlama:* Knapsack için 0/1 diziler. Çaprazlama tek/çok nokta, mutasyon bit ters çevirme.
- *Permütasyon kodlama:* TSP için şehir sırası. Standart crossover bozuk permütasyonlar üretir, bu yüzden OX (order crossover), PMX (partially mapped crossover) gibi özel operatörler tasarlanmıştır.
- *Gerçek sayı kodlama:* Sürekli parametreler için. SBX (simulated binary crossover) ve polinom mutasyon yaygındır.
- *Ağaç kodlama (Genetic Programming):* Program/fonksiyon sentezi için; yapraklar sabitler/değişkenler, düğümler operatörlerdir.

Seçim operatörünün çeşitli varyantları vardır: **turnuva** (rastgele birkaç bireyin en iyisini seç), **rulet tekerleği** (fitness oranlı olasılıkla seç), **rank-based** (sıralama esaslı olasılık), **elitizm** (en iyi *k* bireyi değişiklik yapmadan sonraki kuşağa aktar). Çok amaçlı optimizasyonda klasik GA yerine **NSGA-II** gibi Pareto-cephe koruyan varyantlar kullanılır.

**Klasik örnek — Gezgin satıcı problemi (TSP):** *n* şehri birer kez ziyaret ederek başlangıç şehrine dönen en kısa turu bul. Kromozom permütasyon olarak temsil edilir. Çaprazlama iki ebeveynden alt turları birleştirir; mutasyon iki şehrin sırasını değiştirir. Binlerce şehirli örneklerde GA, saniyeler içinde saf rastgeleden çok daha iyi turlar üretir. TSP aynı zamanda GA, SA, TS ve ACO'nun hepsinin karşılaştırma ortak paydasıdır.

### Benzetimli Tavlama (Simulated Annealing — SA)

Kirkpatrick, Gelatt ve Vecchi'nin 13 Mayıs 1983'te *Science* dergisinde yayımladığı seminer makale, SA'yı optimizasyon dünyasına tanıtmıştır. Fiziksel tavlama sürecinden (bir metalin yavaş soğutularak minimum enerji konfigürasyonuna gelmesi) esinlenen SA, tek çözüm üzerinden yerel arama yapar; fakat yerel minimuma sıkışmamak için **kontrollü olarak kötü hareketleri kabul eder**.

```text
T ← T₀   (başlangıç sıcaklığı)
x ← x₀   (başlangıç çözümü)
her iterasyon için:
    x' ← komşu(x)
    Δ ← f(x') - f(x)
    if Δ < 0:
        x ← x'                         (daha iyiyi daima kabul et)
    else:
        x ← x' olasılıkla exp(-Δ / T)  (kötüyü bazen kabul et)
    T ← α · T   (0 < α < 1, "soğutma")
```

Kabul kuralının matematiksel kökeni 1953'te Metropolis ve arkadaşlarının istatistiksel mekanik için önerdiği **Metropolis-Hastings** algoritmasıdır; kuralın arkasındaki Boltzmann dağılımı, termodinamik dengede bir parçacığın enerji durumlarının olasılıklarını verir. Sıcaklık *T* yüksekken olasılık 1'e yakın, yani kötü hareket neredeyse her zaman kabul edilir (geniş keşif); *T* 0'a yaklaşırken olasılık 0'a iner ve algoritma saf tepeye-tırmanma'ya (hill climbing) dönüşür.

Pratikteki kritik parametre, **soğutma şemasıdır**:

- **Geometrik soğutma:** `T ← α·T`, tipik `α ∈ [0.8, 0.99]`. En yaygını.
- **Logaritmik soğutma:** `T = T₀ / ln(1 + k)`. Teorik olarak küresel optimali garantiler ama çok yavaştır.
- **Adaptif soğutma:** İlerleme durumuna göre hız ayarlanır; duraklamada yeniden ısıtma (reheating) uygulanır.

Doğru `T₀`, `α` ve durdurma kriteri problem bağımlıdır; ama SA'nın pratikteki popülaritesi, kodlamasının basit olması ve çoğu problemde makul parametrelerle iyi iş çıkarmasıdır.

**Klasik örnek — Gezgin satıcı problemi (TSP):** Kirkpatrick'in orijinal makalesi TSP üzerinde somut sonuçlar gösterir. Bir permütasyonun "komşusu" genelde iki kenarı ters çeviren 2-opt hareketidir; SA, büyük TSP örneklerinde kısa sürede kaliteli turlar bulur. SA ayrıca kombinatoryal yerleşim problemleri, makine çizelgeleme, hiperparametre ayarı ve yapay sinir ağı eğitimi gibi pek çok alanda başarıyla kullanılır.

SA'nın teorik zarafeti, Hajek'in 1988'de ispatladığı bir **yakınsama teoremi**nde yatar: Soğutma yeterince yavaş olursa (logaritmik soğutma ile) SA sonsuz sürede küresel optimali olasılık 1 ile bulur. Pratikte elbette kimse logaritmik soğutma kullanmaz; geometrik soğutma ile "sonlu sürede çok iyi çözüm" tercih edilir. Çağdaş varyantları arasında **paralel tavlama** (parallel tempering — birden fazla sıcaklıkta paralel zincirler çalıştırılır ve aralarında değişim yapılır), **quantum annealing** (D-Wave bilgisayarlarının altyapısı) ve **threshold accepting** (kötü hareketler olasılıkla değil sabit eşikle kabul edilir) sayılabilir.

### Tabu Arama (Tabu Search — TS)

Fred Glover'ın 1986'daki çalışmasıyla tanıtılan ve 1989'da *ORSA Journal on Computing*'de "Tabu Search — Part I" başlığıyla formalize ettiği TS'in ayırt edici özelliği **bellek (memory)** kullanmasıdır: daha önce yapılan hareketleri **tabu listesi**nde tutar ve kısa süreliğine tekrarlanmalarını yasaklar. Bu, yerel minimumdan çıkmayı ve döngülere düşmemeyi sağlar.

```text
x ← x₀
tabu_listesi ← ∅
best ← x
her iterasyon için:
    N(x) \ tabu_listesi içindeki en iyi komşu x'ı seç
    x ← x'
    if f(x) < f(best): best ← x
    tabu_listesi.append(x hareketinin tersine çevrilmesi)
    tabu_listesi FIFO ile güncelle
```

TS'in zarafeti hiyerarşik bellek yapısındadır:

- **Kısa dönem bellek** (short-term memory): Son yapılan hareketlerin listesi; yasaklıdır. Döngüleri engeller.
- **Orta dönem bellek** (intermediate-term memory / intensification): İyi çözümlerin ortak özelliklerini hatırlar; bu bölgelere yoğunlaştırma yapar.
- **Uzun dönem bellek** (long-term memory / diversification): Nadir ziyaret edilen bölgeleri takip eder; zaman zaman oralara atlar.

**Aspirasyon kriteri:** Bir hareket tabuda olsa bile, o zamana kadar görülen en iyi çözümü iyileştirecekse yasak kaldırılır. Bu basit kural, TS'in yerel minimuma sıkışmadan küresel olarak ilerleyebilmesinin temelidir. Glover'ın tanıttığı **stratejik osilasyon** (strategic oscillation) ise çözümün uygun bölge ile uygun olmayan bölge arasında kontrollü geçişler yapmasına izin verir; bazen kısıtları kasıtlı olarak ihlal ederek daha iyi aday çözümlere ulaşılır.

**Klasik örnek — Araç rotalama problemi (VRP):** Bir depodan çıkan *k* araçla *n* müşteriye teslimat yapacağız. Her müşterinin talebi, her aracın kapasitesi ve her rotanın toplam mesafe/zaman kısıtı var. Amaç: toplam kat edilen yolu minimize etmek. TS, 1990'larda klasik VRP üzerinde o dönemin en iyi sonuçlarını üreten yöntemlerden biri olmuştur ve bugün de kargo/lojistik uygulamalarında yaygın şekilde kullanılır. TS ayrıca zaman çizelgesi oluşturma, grafik renklendirme ve uyarlanabilir üretim sistemlerinde de etkilidir.

### Karınca Kolonisi Optimizasyonu (Ant Colony Optimization — ACO)

Marco Dorigo'nun 1992'de Politecnico di Milano'da savunduğu *Optimization, Learning and Natural Algorithms* başlıklı (aslında İtalyanca yazılmış) doktora tezinde tanıttığı ACO, gerçek karıncaların yiyecek arama davranışından esinlenir. Karıncalar yiyecek ile yuva arasında **feromon izi** bırakır; sonraki karıncalar olasılıksal olarak daha yoğun feromonlu yolları tercih eder; kısa yolların feromonu daha hızlı pekişir ve koloni zamanla en kısa yolu keşfeder. Dorigo'nun tezi sırasında Alberto Colorni ve Vittorio Maniezzo ile yakın çalışması, alanın ilk temel algoritmalarını şekillendirmiştir.

Algoritmik olarak:

```text
feromon matrisi τ_ij'yi başlat
her iterasyon için:
    her karınca k için:
        k'yi rastgele bir düğüme yerleştir
        tur tamamlanana kadar:
            komşu j'ye geçme olasılığı:
                p_ij ∝ τ_ij^α · η_ij^β       (η: sezgisel bilgi, örn. 1/d_ij)
    feromonları güncelle:
        τ_ij ← (1 - ρ) · τ_ij + Σ_k Δτ_ij^k   (ρ: buharlaşma oranı)
        Δτ_ij^k = Q / L_k                     (L_k: karınca k'nın tur uzunluğu)
```

Parametrelerin anlamı:

- `α`: feromon ağırlığı. Yüksekse kolektif hafızaya güven; düşükse rastgeleye yakın.
- `β`: sezgisel bilgi ağırlığı. Yüksekse kısa mesafeyi sever; düşükse sadece feromonla ilerler.
- `ρ`: buharlaşma oranı. Yüksekse hızlı unutur; düşükse eski bilgi uzun kalır.

ACO'nun çok sayıda varyantı geliştirilmiştir: **Ant System** (orijinal Dorigo), **Elitist Ant System** (en iyi turun feromonu ek olarak artırılır), **Max-Min Ant System** (feromon değerleri bir aralıkta sınırlı tutulur, erken yakınsama engellenir), **Ant Colony System** (Dorigo ve Gambardella'nın 1997'deki güçlendirilmiş versiyonu; lokal feromon güncellemesi eklendi).

**Klasik örnek — Gezgin satıcı problemi (TSP):** ACO'nun en yaygın gösterildiği problem TSP'dir. Her iterasyonda koloni farklı turlar deneyerek en kısa yol üzerinde feromonu pekiştirir. ACO ayrıca araç rotalama, çizelgeleme, ağ rotalama ve protein katlanması problemlerinde de yaygın olarak kullanılır. Dağıtık doğası, paralel donanımda iyi ölçeklenmesini sağlar.

---

## Kesin vs. Metasezgisel: Karşılaştırma ve Karar Çerçevesi

Hem kesin hem metasezgisel dünyayı dolaştık; şimdi bir karar çerçevesi kuralım. Aşağıdaki tablo iki yaklaşımın temel niteliklerini karşılaştırır:

| Özellik | Kesin Yöntemler (LP / IP / BIP / MIP / DP) | Metasezgisel (GA / SA / TS / ACO) |
|---------|--------------------------------------------|-----------------------------------|
| Optimallik garantisi | Evet (kanıtlanmış optimal) | Hayır (yakın optimal) |
| Tipik problem boyutu | Küçük–orta (bazı LP'ler çok büyük) | Büyük / devasa |
| Çözüm süresi | Dakika–saat; bazen üstel | Ayarlanabilir; erken durdurulabilir |
| Modelleme esnekliği | Düşük (doğrusal / sonlu durum şart) | Yüksek (her fitness fonksiyonu uygulanabilir) |
| Parametre hassasiyeti | Düşük | Yüksek (soğutma, popülasyon, feromon vb.) |
| Duyarlılık analizi | Doğal (LP duality) | Zayıf |
| Tipik alan | Atama, akış, çizelgeleme (küçük–orta) | NP-zor, büyük ölçekli problemler |

Bu karşılaştırma arka planında iki önemli teorik çerçeve vardır. Birincisi **karmaşıklık sınıflarıdır** (P, NP, NP-zor): P sınıfı polinom zamanda çözülen problemleri, NP sınıfı çözümü polinom zamanda doğrulanabilen problemleri, NP-zor sınıfı ise NP'deki her problemin polinom zamanda kendisine indirgenebildiği problemleri kapsar. Saf IP, knapsack, TSP ve VRP hepsi NP-zordur; bu, problem boyutu büyüdükçe kesin yöntemlerle çözüm zamanının katlanarak artacağı anlamına gelir.

İkincisi ise Wolpert ve Macready'nin 1997'de formülize ettiği **No Free Lunch** teoremidir: Hiçbir optimizasyon algoritması, tüm problem sınıfları üzerinde ortalama olarak diğerinden daha iyi değildir. Bu, "evrensel en iyi metasezgisel" iddialarını çürüten önemli bir teorik sonuçtır. GA, SA, TS, ACO'nun hepsinin farklı problem sınıflarında farklı güçlü yanları vardır.

Peki pratikte hangisini seçeceğiz? Aşağıdaki akış diyagramı basit bir karar çerçevesi sunar:

<div class="mermaid">
graph TD
    A[Optimizasyon problemi] --> B{Amaç ve kısıtlar doğrusal mı?}
    B -->|Evet| C{Karar değişkenleri sürekli mi?}
    B -->|Hayır| H{Ayrık durum + örtüşen alt problem?}
    C -->|Evet| D[LP]
    C -->|Hayır| E{Değişkenler yalnızca 0/1 mi?}
    E -->|Evet| F[BIP]
    E -->|Hayır| G{Karma mı?}
    G -->|Evet| I[MIP]
    G -->|Hayır| J[IP]
    H -->|Evet| K[DP]
    H -->|Hayır| L{Problem büyük ve NP-zor mu?}
    L -->|Evet| M[Metasezgisel: GA / SA / TS / ACO]
    L -->|Hayır| N[Kesin yöntem + özel yapı]
</div>

Özet: **önce problem yapısı**, sonra **ölçek**, en sonunda **çözüm süresi tercihi**. Problem doğrusal ve küçük–orta ölçekliyse LP/IP/BIP/MIP her zaman ilk tercih; büyüdükçe ve doğrusallık bozuldukça metasezgisel yaklaşımlar sahneye çıkar. DP ise aşamalı karar yapısı olan problemler için özel bir arşimet noktasıdır.

**Pratikte dikkat edilmesi gereken tuzaklar:**

- *Yanlış modelleme:* Problem doğrusal değilken LP kurmaya çalışmak ya da tersine, kolayca LP kurulabilecek bir problemi metasezgiselle çözmek yaygın hatalardır. "Bu kısıt gerçekten doğrusal mı?" sorusu ilk adımdır.
- *Ölçek iluzyonu:* Küçük test örneğinde saniyede biten bir MIP, üretim ölçeğinde saatlerce çalışabilir. Dallanma sayısı değişken sayısıyla üstel olarak artar.
- *Parametre hassasiyeti:* Metasezgisel yöntemler yanlış parametrelerle optimalin çok uzağında çözümler üretebilir. SA'nın soğutma profili, GA'nın popülasyon çeşitliliği, TS'in tabu liste uzunluğu ve ACO'nun buharlaşma oranı klasik ayar parametreleridir.
- *Çok amaçlılık:* Gerçek hayatta genelde tek amaç yoktur: "en düşük maliyet" ile "en düşük gecikme" çatışabilir. Tek bir ağırlıklı toplam yerine Pareto-optimal cepheyi aramak daha sağlıklı olabilir.
- *Çözümün uygulanabilirliği:* Matematiksel olarak optimal bir çözüm operasyonel olarak imkansız olabilir; modele girmeyen yumuşak kısıtlar çoğu zaman kullanıcı çözümü ilk gördüğünde ortaya çıkar ve modelin iyileştirilmesini gerektirir.

---

## Matheuristic: İki Dünyanın Birleşimi

Son yıllarda kesin ve metasezgisel yöntemleri **aynı çatı altında** kullanan hibrit yaklaşımların adı konmuş: **matheuristic**. Modern endüstriyel optimizasyonun büyük kısmı aslında saf bir kesin ya da saf bir metasezgisel değil, ikisinin akıllıca birleştirildiği matheuristic'ler üzerine kuruludur.

Tipik şemalar:

- **Metasezgisel içinde MIP:** GA'nın her kromozomunun fitness'ı, küçük bir MIP'in optimal çözümü ile hesaplanır. Kromozom yüksek seviye kararları (hangi tesisler açık?), MIP düşük seviye detayları (ürün akışları) çözer.
- **MIP içinde metasezgisel:** Büyük bir MIP'in içinde bir metasezgisel "iyi dallanma yönü" önerir; çözücü alt problemleri optimize eder.
- **Large Neighborhood Search (LNS):** Mevcut çözümün bir kısmı "yıkılır", kalan kısım sabit tutularak serbest kısım için küçük bir MIP çözülür.
- **Benders decomposition:** Büyük MIP iki parçaya ayrılır: master problem (karmaşık kararlar) ve alt problem (ürün akışları). Alt problemin duali ile master'a yeni kısıtlar eklenir.
- **Column generation:** Çok değişkenli problemlerin (örn. VRP) LP gevşetmesine sadece umut vaat eden değişkenler eklenir. Havayolu mürettebat ve uçak çizelgelemede standarttır.

Pratikte basit bir LNS şablonu:

```text
x ← ilk_cozum()            (MIP çözücü ile hızlı başlangıç)
best ← x
for iter = 1..N:
    S ← x'in %k'lık bir alt kümesini seç
    x'in S dışındaki değişkenlerini sabitle
    MIP çözücüye S'yi serbest bırakarak alt problemi çöz
    x' ← yeni çözüm
    if f(x') < f(best):
        best ← x'
        x ← x'
```

LNS, metasezgisel bir dış çerçeve (hangi değişkenler yıkılacak?) içinde kesin bir iç çözücünün (alt problemi optimalleştir) çalışmasıdır. Gurobi ve CPLEX'in "solution improvement heuristic" modülleri benzer mantıkla çalışır ve kullanıcı matheuristic yazmadan çözücüde hazır gelir.

Matheuristic yaklaşımları; üretim planlama, enerji ağ optimizasyonu, lojistik, havayolu operasyonları ve şehir planlama gibi geniş bir yelpazede yaygın olarak kullanılır.

---

## Belirsizlik Altında Optimizasyon: Stokastik ve Robust

Şu ana kadar tartıştığımız tüm modeller **deterministik**tir; yani tüm parametrelerin (talep, maliyet, süre) tam olarak bilindiğini varsaydık. Gerçek hayatta ise parametreler çoğu zaman belirsizdir: yarının müşteri talebi rastgele, hava durumu rastgele, makine arızaları rastgele. Belirsizlikle baş etmek için iki ana çerçeve vardır.

**Stokastik programlama** (stochastic programming): Belirsiz parametreler olasılık dağılımları ile modellenir; amaç fonksiyonu **beklenen değeri** (expected value) optimize eder. En yaygın formu iki aşamalı stokastik programlamadır: önce belirsizlik çözülmeden "burada ve şimdi" kararları verilir (kaç kamyon kiralayalım?), sonra belirsizlik gerçekleştikten sonra "recourse" (telafi) kararları verilir (yarın hangi rotaları kullanacağız?). Senaryolar yeteri kadar çok olursa problem çok büyür; Benders ayrıştırması ve **sample average approximation** (SAA) gibi teknikler bu büyüklüğü yönetir.

**Robust optimizasyon:** Parametreler için bir "belirsizlik kümesi" tanımlanır ve çözüm bu kümedeki **en kötü duruma** karşı en iyi olur. 2000'lerde Ben-Tal, Nemirovski ve Bertsimas'ın çalışmalarıyla olgunlaşan bu alan, özellikle finans, enerji ve savunma uygulamalarında tercih edilir: olasılık dağılımını tahmin etmek zorsa ya da "çok ender ama çok kötü" senaryolardan korunmak isteniyorsa robust optimizasyon doğal seçimdir.

Son yıllarda **makine öğrenmesi** ile **OR**'un kesişimi de hızla büyüyor. **Prediction + optimization** çerçevesi, bir ML modelinin tahminlerinin ardından bir MIP/metasezgisel çözücünün kararları aldığı sıralı boru hattı şeklindedir. "Predict-then-optimize" paradigması ile tahmin hatasının optimizasyon kararı üzerindeki etkisi ortak olarak eğitilir. Bu alan son 5 yılda özellikle perakende talep tahmini, enerji fiyat tahmini ve rotalama gibi uygulamalarda iz bırakmıştır.

---

## Gerçek Hayatta OR: Dikkat Çekici Uygulamalar

Yöneylem araştırması akademik bir konu olmanın çok ötesinde; neredeyse her büyük operasyonel sistemin arkasında sessizce çalışan bir bilimdir. Birkaç ikonik örnek:

- **Havayolu şirketleri — Uçak ve mürettebat çizelgelemesi:** Büyük havayolları her gün on binlerce uçuş yapar. Hangi uçak hangi bacağı uçacak (fleet assignment), pilot ve kabin ekibi nasıl gruplanacak (crew pairing), bireysel ekip çizelgeleri (crew rostering) ve yolcular bağlantı kaçırırsa hangi uçağa bindirilecek sorularının hepsi dev ölçekli MIP'lerdir. Set partitioning formülasyonu ve **column generation** bu problemlerin standart çözüm aracıdır.
- **Kargo ve lojistik — UPS ORION:** UPS, 2013'te sahaya tam olarak sürdüğü **ORION** (On-Road Integrated Optimization and Navigation) sistemi ile her kuryenin günlük rotasını optimize eder. Sistem yılda milyonlarca dolar yakıt tasarrufu sağladığını açıklamış, ayrıca sürücü başına günlük ortalama kat edilen mesafe düşmüştür. Altında klasik VRP çeşitlemelerinin sezgisel versiyonları yatar.
- **E-ticaret — Amazon depo robotları:** Amazon'un depolarında Kiva (sonra Amazon Robotics) robotları raf getirirken gerçek zamanlı rotalama ve çarpışma önleme problemi çözer. Depo yerleşimi, ürün-raf atama ve sipariş toplama rotaları sürekli yeniden optimize edilir.
- **Ulaştırma — Netflix içerik önbellekleme:** Netflix, popüler dizi/film bölümlerini hangi ISP sunucusunda hangi saatte önbelleğe alacağını optimize eder. Bu, bir atama + kapasite problemidir ve arka planda büyük bir LP/MIP olarak çözülür.
- **Sağlık — Organ transplant ağları:** ABD'deki böbrek takas programları (Kidney Paired Donation), uyumsuz bağışçı-alıcı çiftlerini eşleştirerek çok kişili takas zincirleri oluşturur. Bu bir maksimum ağırlıklı döngü eşlemesi problemidir ve IP ile çözülür; binlerce insanın hayatına dokunmuştur.
- **Enerji — Elektrik piyasası optimizasyonu:** Türkiye dahil hemen her ülkede saatlik elektrik piyasası bir MIP (unit commitment) olarak çözülür. Fiyatlar doğrudan dualin gölge fiyatlarından türer; ekonomi ve mühendislik iç içedir.
- **Spor — Takım ligi fikstürü:** Büyük futbol ligleri (Premier League, Bundesliga, Süper Lig) takımların deplasman/iç saha dengesini, derbi tarihlerini, yayın haklarını ve stadyum çakışmalarını aynı anda tatmin eden fikstürleri CP/MIP hibrit araçlarıyla oluşturur.
- **Afet ve salgın lojistiği — COVID-19 aşı dağıtımı:** 2020-2021'de COVID-19 aşılarının soğuk zincir lojistiği, aşıların hangi depolara gideceği, hangi merkezlere sevk edileceği, öncelikli grupların nasıl randevulanacağı devasa OR problemleriydi. Pfizer-BioNTech ve AstraZeneca'nın tedarik zinciri arkasında MIP modelleri vardı.

Bu örnekler OR'un **soyut bir matematik egzersizi değil**, günlük hayatın temel altyapısını şekillendiren bir mühendislik disiplini olduğunu göstermektedir. Çözülen her problemin ardında hem bir iş paydaşı hem de özel olarak ayarlanmış bir model vardır.

---

## Pratikte Hangi Araçlar Kullanılır?

Bir OR modelini çözmek için hangi aracı seçeceğiniz, problemin türüne, bütçenize ve kullandığınız programlama diline bağlıdır.

**Ticari MIP çözücüleri:**

- **Gurobi:** Günümüzün en hızlı ticari MIP çözücülerinden biri. Akademik lisans ücretsizdir.
- **IBM CPLEX:** Uzun yıllardır sektörün referans noktalarından biri.
- **FICO Xpress:** Özellikle finans ve enerji sektörlerinde yaygın.

Bu araçlar MIP, LP, quadratic programming ve bazı non-linear programming türlerini çözer; C/C++, Python, Java ve başka diller için API sunar.

**Açık kaynak çözücüler:**

- **HiGHS:** Modern, açık kaynak LP/MIP çözücüsü; performansı giderek ticari rakiplerine yaklaşıyor.
- **COIN-OR (CBC/CLP):** Olgun ve geniş kapsamlı bir koleksiyon.
- **Google OR-Tools:** LP, MIP, kısıt programlama ve rotalama için birleşik API.
- **SCIP:** Akademik lisanslı, güçlü bir dal-ve-kesme çözücüsü.
- **Pyomo, JuMP:** Python ve Julia için modelleme dilleri; arka uçta birçok çözücüye bağlanabilir.

**Metasezgisel kütüphaneler:**

- **DEAP** (Python): GA ve evrimsel hesaplama için esnek bir çerçeve.
- **simanneal** (Python): SA için minimal ve anlaşılır bir kütüphane.
- **scikit-opt** (Python): GA, SA, PSO, TSP çözümlerini tek paket altında sunar.
- **jMetal** (Java / Python): Çok amaçlı metasezgisellerin referans koleksiyonu.

Tipik bir tercih akışı şöyledir: Problem küçük-orta ve LP/MIP yapısındaysa, Pyomo ya da JuMP ile modellenip HiGHS veya akademik Gurobi ile çözülür. Problem büyük ve metasezgisel gerekiyorsa DEAP veya simanneal ile hızlı bir prototip yapılır; çalıştıktan sonra ihtiyaca göre optimize edilir ya da matheuristic'e dönüştürülür.

---

## Sonuç

Yöneylem araştırması, üretimden lojistiğe, sağlıktan finansa pek çok gerçek dünya problemini çözen olgun ve kanıtlanmış bir disiplindir. Özetle:

- **Kesin yöntemler** (LP, IP, BIP, MIP, DP) garantili optimal sağlar ve doğru araçla milyonlarca değişkenli modeller bile rutin olarak çözülebilir. Üretim karışımı, atama, tesis yerleşimi, tedarik zinciri ve aşamalı karar problemlerinde ilk tercih olmalıdır.
- **Metasezgisel yöntemler** (GA, SA, TS, ACO) optimallik garantisi vermez ama büyük, NP-zor ya da simülasyon tabanlı problemlerde makul sürede yüksek kaliteli çözümler üretir.
- **Matheuristic** yaklaşımlar ise iki dünyanın en iyilerini birleştirir ve modern endüstriyel optimizasyonun büyük kısmı aslında bu hibritler üzerine kuruludur.

Pratik öneri: Yeni bir optimizasyon problemiyle karşılaştığınızda önce **modelleyin**. Karar değişkenleri, amaç fonksiyonu ve kısıtları yazın. Model doğrusal/karma-tam sayı yapıya oturuyor ve orta ölçekliyse doğrudan bir MIP çözücü deneyin. Çözücü süre ya da bellek sınırına takılıyorsa matheuristic kurun; hiçbir matematiksel yapı çıkmıyorsa metasezgisel çerçeveyle (GA/SA/TS/ACO) ilerleyin. Her durumda, çözümün iş değeri için "yeterlilik eşiği" (ne kadar yakın optimal yeterli?) en baştan tanımlanmalıdır; bu eşik, yöntem seçimi için amaç fonksiyonundan sonraki en önemli girdidir.

Optimizasyon problemleri gündelik hayatta saklı hâlde karşımıza sürekli çıkar. Formel OR bakış açısı, bu problemleri sezgiyle değil matematikle çözmemizi, çözümlerin kalitesini ölçmemizi ve iş süreçlerinde kanıtlanabilir iyileşmeler yapmamızı sağlar. Bir sonraki "hangi iş önce?", "hangi rota en iyi?", "hangi karışımı üretelim?" sorusunu duyduğunuzda, kulağınızın arkasında bu yazıdaki tabloyu hatırlayın.

---

*Daha fazla okuma için:* Richard Bellman'ın *Dynamic Programming* (1957), David Goldberg'in *Genetic Algorithms in Search, Optimization and Machine Learning* (1989) ve Marco Dorigo ile Thomas Stützle'nin *Ant Colony Optimization* (2004) kitapları alanın klasikleri arasındadır. Tarihsel arka plan için Patrick Blackett'ın savaş dönemi OR ekipleri ve George Dantzig'in doğrusal programlamayı geliştirdiği Pentagon yıllarına odaklanan INFORMS'un *History of O.R. Excellence* serisi güzel bir başlangıçtır.

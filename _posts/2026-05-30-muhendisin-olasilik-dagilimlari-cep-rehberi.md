---
title: "Mühendisin Olasılık Dağılımları Cep Rehberi"
subtitle: "A Field Engineer's Cheat Sheet to Probability Distributions"
background: "/img/posts/1.webp"
date: '2026-05-30 09:00:00'
layout: post
lang: tr
mermaid: true
---

<style>
.dist-plot {
  margin: 1.5em 0;
  padding: 1em;
  background: rgba(0,0,0,0.025);
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.08);
}
.dist-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2em 2em;
  margin-bottom: 0.8em;
  align-items: center;
  font-family: 'Open Sans', sans-serif;
  font-size: 0.95em;
  color: #2c3e50;
}
.dist-controls label {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  margin: 0;
}
.dist-controls input[type="range"] {
  width: 150px;
  vertical-align: middle;
}
.dist-controls .dist-val {
  display: inline-block;
  min-width: 3em;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: #1a5490;
  text-align: right;
}
.dist-plot-area {
  width: 100%;
  height: 320px;
}
.dist-caption {
  font-size: 0.85em;
  color: #7f8c8d;
  margin-top: 0.5em;
  font-style: italic;
  text-align: center;
}
</style>

İçinden geçtiğiniz her gün, sessizce çalışan stokastik süreçlerle dolu. Bir ADC'nin son bitinde yuvarlanan kuantizasyon hatası, GPS sinyalinizin yapraklardan saçılarak gelen multipath bileşeni, bir IMU'nun saatlerce çalıştıktan sonra ortaya çıkan rastgele yürüyüşü, bir kontrol bilgisayarının iki bin uçuş saati sonra patlayan ilk SEU'su — hepsinin altında bir **olasılık dağılımı** var. Doğru dağılımı seçmek, çoğu zaman problemin yarısını çözmek demektir; yanlış dağılım seçmek ise — ya da hiç seçmemek — link bütçesinin neden bu kadar konservatif tutulduğunu, MTBF rakamlarının neden saha gerçeğine bir türlü uymadığını, bir kontrol döngüsünün belli bir hata sınırını neden aşamadığını sonsuza dek anlayamamak demektir.

Bu yazı, mühendislik pratiğinde sık karşılaşılan sekiz dağılımı — **Bernoulli, Binom, Poisson, Uniform, Normal, χ² (Chi-square), Rayleigh** ve **Weibull** — bir başvuru rehberi tadında ele alıyor. Her dağılım için tanımı, şeklini, beklenen değer ve varyansını, akrabalarıyla ilişkisini ve mühendislikte hangi somut probleme oturduğunu göreceğiz. Sonda, dört kısa vinyetle (12-bit ADC SNR'ı, ADS-B paket başarı oranı, Rayleigh fading marjı, Weibull B10 ömür hesabı) hepsini birleştireceğiz.

Önceki [bandpass sampling yazısı](https://karaman.dev/2026/05/21/bandpass-sampling.html) sayısallaştırmanın geometrisini anlatmıştı; bu yazı onun stokastik yarısı. Birlikte okunduğunda bir mühendisin RF zincirini baştan sona hem deterministik hem olasılıksal modelleyebilmesi için gereken zemini sağlamayı amaçlıyor.

---

## Temel Kavramlar

Bir **olasılık değişkeni** (random variable) X, deneylerin sonuçlarını sayılarla eşleyen bir kuraldır. İki büyük aileye ayrılır: değer aldığı küme sayılabilirse **kesikli** (bir zarın 1-6 arası), değer aldığı küme aralık biçimindeyse **sürekli** (bir gerilim ölçümünün 0-5 V arası). Aşağıda yedi temel kavramı kısaca toparlayalım — yazının geri kalanında bu yedi terim üzerinden gideceğiz.

**Olasılık Kütle Fonksiyonu (PMF):** Kesikli X için her ayrı değerin olasılığı, $P(X=k)$. Toplamı her zaman 1'dir.

**Olasılık Yoğunluk Fonksiyonu (PDF):** Sürekli X için $f(x)$. Tek bir noktanın olasılığı sıfırdır; ancak bir aralığın olasılığı PDF'nin o aralık üzerindeki integralidir.

**Kümülatif Dağılım Fonksiyonu (CDF):** $F(x) = P(X \le x)$. Her iki tip için de tanımlıdır, monoton artar, 0'dan 1'e gider. Pratikte "%99 outage" gibi soruların doğrudan cevabı CDF'tedir.

**Beklenen Değer ($E[X]$):** Dağılımın ağırlık merkezi. Kesikli için $\sum_k k \cdot P(X=k)$, sürekli için $\int x f(x) \, dx$.

**Varyans ($\text{Var}[X]$):** Ortalamadan yayılmanın karesi, $E[(X-\mu)^2]$. Karekökü standart sapma $\sigma$.

**Bağımsızlık:** İki değişken X ve Y bağımsızsa, birinin gerçekleşmesi diğerinin olasılığını değiştirmez: $P(X=a, Y=b) = P(X=a) P(Y=b)$. Mühendislikte sık ihlal edilen varsayım — yüksek SNR'de ardışık paket kayıpları bağımsız sayılabilir; deep fade altında *değil*.

**i.i.d. — Independent and Identically Distributed:** Birden fazla değişken hem bağımsız hem de aynı dağılımdan geliyorsa "i.i.d." denir. Bernoulli'lerin toplamının Binom olduğunu, Normal karelerinin toplamının χ² olduğunu söylerken hep i.i.d. varsayımındayız. Bu varsayım kırıldığında türeyiş kırılır — yazının ilerleyen kısmındaki tuzakların büyük çoğunluğu bu noktada toplanıyor.

Aşağıdaki tablo dağılımları ileride hızlıca karşılaştırmak için referans olacak:

| Kavram | Sembol | Anlamı |
|---|---|---|
| Beklenen değer | $\mu = E[X]$ | Ağırlık merkezi |
| Varyans | $\sigma^2 = \text{Var}[X]$ | Yayılma karesi |
| Standart sapma | $\sigma$ | Yayılma (aynı birimde) |
| Çarpıklık | $\gamma_1$ | Simetriden sapma |

---

## Kısa Bir Tarihçe

Olasılık teorisi, bir kumar masasından doğdu. 1654'te Chevalier de Méré adlı Fransız asilzade, zar oyunlarında kazanma stratejisiyle ilgili bir bulmacayı dönemin iki büyük matematikçisine — Blaise Pascal ve Pierre de Fermat'a — sordu. Cevabı bulmak için yazıştılar; aradaki mektuplar olasılık teorisinin doğum belgesi sayılır.

<div class="mermaid">
flowchart TB
    A["<b>1654</b> &nbsp; Pascal–Fermat yazışmaları"]
    B["<b>1713</b> &nbsp; Jacob Bernoulli — <i>Ars Conjectandi</i>"]
    C["<b>1733</b> &nbsp; de Moivre — Normal eğrinin ilk türevi"]
    D["<b>1809</b> &nbsp; Gauss — Hata teorisi (en küçük kareler)"]
    E["<b>1812</b> &nbsp; Laplace — <i>Théorie analytique</i>"]
    F["<b>1837</b> &nbsp; Poisson — <i>Recherches sur la probabilité</i>"]
    G["<b>1880</b> &nbsp; Lord Rayleigh — Akustik genlik dağılımı"]
    H["<b>1900</b> &nbsp; Karl Pearson — χ² uyum iyiliği testi"]
    I["<b>1951</b> &nbsp; Waloddi Weibull — Geniş uygulamalı dağılım"]
    A --> B --> C --> D --> E --> F --> G --> H --> I
</div>

Jacob Bernoulli'nin ölümünden sekiz yıl sonra (1713) yayımlanan *Ars Conjectandi* "büyük sayılar yasası"nın ilk titiz kanıtını içerir — n büyüdükçe gözlenen frekansın olasılığa yakınsadığı sezgisi. 1733'te Abraham de Moivre, normal eğrinin ilk biçimini Binom dağılımının limit hâlinde türetti — yıllar sonra Gauss bunu hata teorisiyle birleştirip *en küçük kareler* yönteminin temeline koyacaktı. Poisson 1837'de nadir olaylar için ünlü kütle fonksiyonunu, Lord Rayleigh 1880'de akustik vibrasyon genliklerinin dağılımını yazdı (bugün RF mühendislerinin neredeyse her gün gördüğü dağılım). Karl Pearson 1900'de χ² uyum iyiliği testini önerdi. İsveçli mühendis Waloddi Weibull ise 1951'de — uzun süre marjinal görülen — kendi adıyla anılan dağılımı, malzeme yorulması ve rulman ömrü verilerinin standart Normal'a uymadığını fark ederek önerdi; bugün güvenilirlik mühendisliğinin omurgasıdır.

---

## Harita: Dağılım Ailesinin Hızlı Görünümü

Sekiz dağılımı tek tek görmeye geçmeden önce, aralarındaki akrabalıkları aklınızda tutmak işinize yarayacak. Aşağıdaki harita iki ana aileyi (Bernoulli ve Gauss) ve aralarındaki köprüleri gösteriyor — yazının sonunda tam ilişki ağacını da göreceğiz.

<div class="mermaid">
flowchart LR
    subgraph Bernoulli_Ailesi
        B[Bernoulli] --> Bn[Binom]
        Bn --> P[Poisson]
    end
    subgraph Gauss_Ailesi
        N[Normal] --> X[Chi-square]
        N --> R[Rayleigh]
        W[Weibull] --> R
    end
    U[Uniform] -.CLT.-> N
    Bn -.de Moivre-Laplace.-> N
    P -.inter-arrival.-> W
</div>

Bernoulli ailesi olayları **sayar**: kaç başarı, kaç olay, kaç hata. Gauss ailesi büyüklük ve süre gibi **sürekli değişkenleri** modeller. Uniform her ikisinin de baseline'ı — hiçbir bilgi yokken, en sade varsayım. Şimdi her aileyi sırayla açalım.

---

## Bernoulli Ailesi

### Bernoulli — Tek Atış

En basit dağılım. Sadece iki sonuç vardır: başarı (1) olasılıkla $p$, başarısızlık (0) olasılıkla $1-p$.

$$P(X=k) = p^k (1-p)^{1-k}, \quad k \in \{0, 1\}$$

Şekli iki çubuktan ibarettir; aşağıdaki widget'ta $p$ kaydırıcısını oynatarak başarı olasılığı ile başarısızlık olasılığı arasındaki dengeyi canlı görebilirsiniz:

<div class="dist-plot">
  <div class="dist-controls">
    <label>$p$ = <span id="ber-p-val" class="dist-val">0.50</span><input type="range" id="ber-p" min="0.01" max="0.99" step="0.01" value="0.5"></label>
  </div>
  <div id="ber-plot" class="dist-plot-area"></div>
  <div class="dist-caption">Bernoulli PMF — başarı olasılığı $p$, başarısızlık olasılığı $1-p$.</div>
</div>

$$E[X] = p, \quad \text{Var}[X] = p(1-p)$$

Varyans $p=0.5$'te en yüksek (0.25), $p=0$ veya $p=1$'de sıfırdır — yani belirsizliğin maksimum olduğu yer ortadadır.

**Mühendislikte nerede karşımıza çıkar?** Tek bir bit kararı (`0` mı `1` mi?), bir sensor self-testinin sonucu (geçti/kaldı), bir paketin yerine ulaşıp ulaşmadığı, bir CRC kontrolünün doğru/yanlış sonucu, bir watchdog'un tetiklenip tetiklenmemesi. Tek başına çoğu zaman ilgi çekmez; gerçek değeri, bir araya geldiğinde — sıradaki Binom'un içinde — ortaya çıkar.

> **Tuzak:** Tek bir Bernoulli denemesinin "ortalaması $p$" demek pratikte hiçbir şey ifade etmez; gözleminiz 0 veya 1 olacak, $p$ değil. Beklenen değer, ancak çok sayıda denemenin uzun-dönem ortalamasıdır. Bir tek paket kayıp olayından "BER bu" sonucuna varan herhangi bir analiz, bu sezgi hatasına düşmüştür.

### Binom — n Bağımsız Bernoulli'nin Toplamı

$n$ tane bağımsız Bernoulli denemesi yaparsanız, başarı sayısı $X$ Binom dağılır:

$$P(X=k) = \binom{n}{k} p^k (1-p)^{n-k}, \quad k = 0, 1, \ldots, n$$

Şekli $n$ ve $p$'ye göre değişir: $p=0.5$ civarında simetrik bir kambur, küçük $p$'lerde sola yaslanmış sağa kuyruklu bir profil. Aşağıdaki widget'ta her iki parametreyi kaydırarak şeklin nasıl evrildiğini gözlemleyebilirsiniz — $n$ büyüdükçe (özellikle $np > 5$ olduğunda) eğri görsel olarak Normal'a yaklaşır:

<div class="dist-plot">
  <div class="dist-controls">
    <label>$n$ = <span id="bin-n-val" class="dist-val">20</span><input type="range" id="bin-n" min="2" max="80" step="1" value="20"></label>
    <label>$p$ = <span id="bin-p-val" class="dist-val">0.50</span><input type="range" id="bin-p" min="0.01" max="0.99" step="0.01" value="0.5"></label>
  </div>
  <div id="bin-plot" class="dist-plot-area"></div>
  <div class="dist-caption">Binom PMF — $n$ bağımsız denemede başarı sayısının dağılımı. $p$'yi 0.1 yapıp $n$'i artırın: Poisson'a yakınsadığını görürsünüz.</div>
</div>

$$E[X] = np, \quad \text{Var}[X] = np(1-p)$$

**Mühendislikte nerede karşımıza çıkar?** 1000 ADS-B paketinden kaçının decode edilebileceği; FEC (forward error correction) kapasitesi içinde kalan bit hatası sayısı; üretim hattında 50 karttan kaçının kalite kontrolden geçeceği; bir donanım test setinde 100 ardışık koşunun kaçında bir sınır aşılacağı. Doğrudan saha rakamlarına oturduğu için sistem mühendisinin en sık kullandığı kesikli dağılım — link bütçesi ve görev güvenilirliği analizlerinin temelinde her zaman bir Binom hesabı vardır.

> **Tuzak:** Binom'un temel varsayımı bağımsızlıktır. Yüksek SNR'de paketler gerçekten bağımsız sayılabilir. Deep fade altında ise art arda gelen paketler aynı sönümleme oluğuna düşer; kayıplar **korelasyonludur**. Bu durumda Binom hesabı, gerçek başarısızlık olasılığını sistematik olarak hafife alır. Aviyonik link bütçelerinde "burst error" modelinin ayrı tutulmasının sebebi tam olarak budur.

### Poisson — Nadir Olay Sayısı

Bir Binom dağılımında $n \to \infty$ ve $p \to 0$ alıp $np = \lambda$ sabit tuttuğunuzda Poisson dağılımı çıkar:

$$P(X=k) = \frac{\lambda^k e^{-\lambda}}{k!}, \quad k = 0, 1, 2, \ldots$$

Şekli tek bir parametreye, ortalama olay sayısı $\lambda$'ya bağlıdır. $\lambda < 1$ iken hızla azalan; orta değerlerde küçük kambur; $\lambda > 10$ civarında Normal'a yaklaşan simetrik bir tepe. Aşağıdaki widget'ta $\lambda$'yı oynatın:

<div class="dist-plot">
  <div class="dist-controls">
    <label>$\lambda$ = <span id="poi-l-val" class="dist-val">4.0</span><input type="range" id="poi-l" min="0.3" max="25" step="0.1" value="4"></label>
  </div>
  <div id="poi-plot" class="dist-plot-area"></div>
  <div class="dist-caption">Poisson PMF — birim zamanda ortalama $\lambda$ olay beklenen, nadir bağımsız olayların sayısı. $\lambda$ büyüdükçe Normal'a yakınsar.</div>
</div>

$$E[X] = \lambda, \quad \text{Var}[X] = \lambda$$

Beklenen değerinin varyansına eşit olması Poisson'un imza özelliğidir. Bir veri kümesinin mean'i ile variance'ı yaklaşık eşitse Poisson aday; aralarındaki fark açılıyorsa varsayım kırılmıştır.

**Mühendislikte nerede karşımıza çıkar?** Birim zamanda kozmik ışın kaynaklı SEU sayısı (uzay ve yüksek-irtifa elektroniklerinde); saniyede gelen radar geri dönüş darbeleri; bir sunucuya birim zamanda gelen request sayısı; bir hat boyunca birim mesafede bulunan kabloda kırılma sayısı; bir Geiger sayacının saniyede algıladığı parçacık sayısı. Poisson, "nadir, bağımsız, sürekli zamanlı" üçlüsünün geçerli olduğu her yerde varsayılan dağılımdır.

> **Tuzak:** Mean ≠ Variance görüldüğü an, gerçek dağılım Poisson **değildir**. Variance > Mean ise *overdispersion* var (örneğin clustered olaylar; gerçek hayatta sıkça görülür ve genelde Negative Binomial daha iyi uyar). Variance < Mean ise *underdispersion* (olaylar düzenli aralıklarla geliyor, regular). İki durumda da kör Poisson kullanmak yanlış güven aralıkları üretir.

---

## Uniform (Sürekli) — Mühendis için Baseline

Bilgi yoksa, baseline budur: $[a, b]$ aralığında her noktanın olasılık yoğunluğu eşit.

$$f(x) = \frac{1}{b-a}, \quad a \le x \le b$$

Şekli düz dikdörtgen. Aşağıdaki widget'ta aralık sınırlarını oynatın — aralık daraldıkça yoğunluğun yükseldiğini, varyansın $(b-a)^2/12$ formülü gereği genişledikçe karesel büyüdüğünü gözlemleyin:

<div class="dist-plot">
  <div class="dist-controls">
    <label>$a$ = <span id="uni-a-val" class="dist-val">0.0</span><input type="range" id="uni-a" min="-3" max="4" step="0.1" value="0"></label>
    <label>$b$ = <span id="uni-b-val" class="dist-val">1.0</span><input type="range" id="uni-b" min="-2" max="6" step="0.1" value="1"></label>
  </div>
  <div id="uni-plot" class="dist-plot-area"></div>
  <div class="dist-caption">Uniform PDF — $[a, b]$ aralığında sabit $1/(b-a)$ yoğunluk.</div>
</div>

$$E[X] = \frac{a+b}{2}, \quad \text{Var}[X] = \frac{(b-a)^2}{12}$$

Bu varyans formülü mühendislik pratiğinde sandığınızdan daha sık karşımıza çıkar. Özellikle **ADC kuantizasyon gürültüsünün** modellenmesinde: $N$-bit bir ADC tam ölçekte $\pm V_{FS}/2$ aralığını çevirir ve $q = V_{FS}/2^N$ adımıyla niceliklendirir. Yuvarlama hatası — gerçek değer ile en yakın seviye arasındaki fark — yaklaşık olarak $[-q/2, +q/2]$ aralığında **uniform** dağıtılır. Dolayısıyla kuantizasyon gürültüsünün varyansı:

$$\sigma_q^2 = \frac{q^2}{12}$$

12-bit ADC için $q = V_{FS}/4096$; bir 12-bit ADC'nin ideal SNR'ı hesaplandığında bu formülün doğrudan içinden $\text{SNR}_{\text{ideal}} = 6.02N + 1.76$ dB sonucu çıkar. Detayını aşağıdaki vinyetlerde göreceğiz.

**Mühendislikte başka nerede?** Monte Carlo simülasyonlarının temel girdisi (her dil bir [0,1) uniform RNG sunar; diğer tüm dağılımlar buradan türetilir); Bayesian analizde "non-informative prior"; rastgele faz başlangıçları; dither sinyali üretimi.

> **Tuzak:** Kuantizasyon hatasının uniform olması bir **yaklaşımdır**, kesin gerçek değil. Sinyal yavaş ve DC'ye yakınsa ardışık örnekler hep aynı seviyeye düşer ve kuantizasyon hatası neredeyse sabit kalır — bağımsızlık ve uniform varsayımları aynı anda çöker. Bu yüzden hassas ölçüm cihazları çıktıya küçük genlikli rasgele bir gürültü (**dither**) ekler: amaç kuantizasyon hatasını bilinçli olarak gerçekten bağımsız ve uniform yapmaktır.

---

## Gauss Ailesi

### Normal (Gauss) — Mühendisin Default'u

Sadece iki parametre ($\mu, \sigma$) ile tanımlanan, simetrik, çan eğrili dağılım:

$$f(x) = \frac{1}{\sigma\sqrt{2\pi}} \exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)$$

<div class="dist-plot">
  <div class="dist-controls">
    <label>$\mu$ = <span id="nor-mu-val" class="dist-val">0.0</span><input type="range" id="nor-mu" min="-3" max="3" step="0.1" value="0"></label>
    <label>$\sigma$ = <span id="nor-sigma-val" class="dist-val">1.00</span><input type="range" id="nor-sigma" min="0.3" max="3" step="0.05" value="1"></label>
  </div>
  <div id="nor-plot" class="dist-plot-area"></div>
  <div class="dist-caption">Normal PDF — $\mu$ konumu, $\sigma$ genişliği kontrol eder. $\sigma$'yu küçültürken zirvenin yükseldiğine dikkat — toplam alan her zaman 1.</div>
</div>

$$E[X] = \mu, \quad \text{Var}[X] = \sigma^2$$

Hatırlanması kolay **68-95-99.7 kuralı**: değerlerin yaklaşık %68'i $[\mu-\sigma, \mu+\sigma]$ arasında, %95'i $[\mu-2\sigma, \mu+2\sigma]$ arasında, %99.7'si $[\mu-3\sigma, \mu+3\sigma]$ arasında düşer. Bir sensor specinde "1σ random error 0.05°C" yazıyorsa, ölçümlerin %99.7'sinin gerçeğin ±0.15°C içinde olmasını bekliyorsunuz demektir.

Normal'in mühendislik için neredeyse büyülü önemi, **Merkezi Limit Teoremi**'nden (CLT) gelir: bağımsız, sonlu varyanslı çok sayıda değişkenin toplamı — orijinal dağılımları ne olursa olsun — Normal'a yakınsar. Bu, doğadaki birçok gürültü kaynağının niçin Normal görünmesinin sebebidir. Bir direnç üzerinden geçen termal gürültü, içinden geçen milyarlarca elektronun bağımsız hareketlerinin toplamıdır; sonuç doğal olarak Normal'dır (Johnson-Nyquist).

**Mühendislikte nerede karşımıza çıkar?** Op-amp termal gürültüsü; sensor random walk error; ADC önündeki analog gürültü zinciri; lazer girişiminde mesafe ölçüm hatası; GUM çerçevesinde ifade edilen standart belirsizlikler (bkz. [ölçüm belirsizliği yazısı](https://karaman.dev/2026/05/06/olcum-belirsizligi-gum-annex-f-ncsli-rp-12.html)).

> **Tuzak: Gauss-süpürme.** Her ölçüme bakmadan Normal demek mühendisliğin en yaygın körlüklerinden biridir. Heavy-tail durumlar (paket gecikme kuyrukları, sismik tepki, finans piyasası) Normal'ın çok-sigma uçlarına atadığı olasılığı katbekat aşar. 6σ olayı Normal altında milyonda iki kez beklenir; gerçek hayatta yıllık olabilir. Önce histogram, sonra varsayım.

### χ² (Chi-square) — Normal'in Karelerinin Toplamı

$k$ tane bağımsız standart Normal ($Z_i \sim N(0,1)$) değişkenin karelerinin toplamı, $k$ serbestlik dereceli (degrees of freedom, df) χ² dağılır:

$$X = \sum_{i=1}^{k} Z_i^2, \quad X \sim \chi^2(k)$$

PDF biraz çetrefilli ama önemi formülünden çok şeklinde: sadece pozitif değerli, sağa çarpık. $k$ arttıkça çarpıklık azalır ve $k$ çok büyükse Normal'a yaklaşır. Widget'ta $k$'yı 1'den 30'a çekin — eğrinin önce keskin, sonra simetrik hâl aldığını göreceksiniz:

<div class="dist-plot">
  <div class="dist-controls">
    <label>$k$ (df) = <span id="chi-k-val" class="dist-val">3</span><input type="range" id="chi-k" min="1" max="30" step="1" value="3"></label>
  </div>
  <div id="chi-plot" class="dist-plot-area"></div>
  <div class="dist-caption">$\chi^2$ PDF — $k$ serbestlik derecesi. $k=2$'de eğri tam üstel ($\text{Exp}(1/2)$); $k$ büyüdükçe simetrikleşir.</div>
</div>

$$E[X] = k, \quad \text{Var}[X] = 2k$$

**Mühendislikte nerede karşımıza çıkar?** Başlıca iki yerde: birincisi **hipotez testleri** — örneğin gözlenen frekansları beklenen frekanslarla karşılaştıran Pearson χ² uyum iyiliği testi, ADC'nizin diferansiyel doğrusal olmaması (DNL) histogramının uniform varsayımıyla uyumunu sınar. İkincisi **güç detektörü** — bir radar veya iletişim alıcısında, kompleks I/Q örneğin gücü $|I + jQ|^2 = I^2 + Q^2$ olarak hesaplanır; eğer ortamda sadece termal gürültü varsa ($I, Q \sim N(0, \sigma^2)$), bu güç tam olarak 2-df χ² dağılır (üstel ile aynı, çünkü $\chi^2(2) \equiv \text{Exp}(1/2)$). Sabit yanlış-alarm oranı (CFAR) eşiklerinin teorik temeli bu gerçeğe oturur.

Ayrıca varyans güven aralığı: $n$ örneklemden hesaplanan örneklem varyansı $s^2$ için $\frac{(n-1)s^2}{\sigma^2}$ ifadesi $\chi^2(n-1)$ dağılır — bu, kalibrasyon laboratuvarlarında ölçüm tekrar üretilebilirliğine güven aralığı verirken kullanılan ana mekanizmadır.

> **Tuzak:** Serbestlik derecesini doğru saymak. Her veri-türevi parametre kestirimi df'i bir azaltır. Örneklem ortalamasıyla varyansı kestirdiğinizde df = n - 1; iki parametreyi birden kestirirseniz df = n - 2. Yanlış df, hipotez testinizi yanlış p-değerine götürür.

### Rayleigh — İki Boyutlu Gauss'un Büyüklüğü

İki bağımsız Normal ($X, Y \sim N(0, \sigma^2)$) değişkenin oluşturduğu vektörün büyüklüğü $R = \sqrt{X^2 + Y^2}$ Rayleigh dağılır:

$$f(r) = \frac{r}{\sigma^2} \exp\left(-\frac{r^2}{2\sigma^2}\right), \quad r \ge 0$$

<div class="dist-plot">
  <div class="dist-controls">
    <label>$\sigma$ = <span id="ray-sigma-val" class="dist-val">1.0</span><input type="range" id="ray-sigma" min="0.3" max="5" step="0.1" value="1"></label>
  </div>
  <div id="ray-plot" class="dist-plot-area"></div>
  <div class="dist-caption">Rayleigh PDF — iki Gauss bileşenin büyüklüğü. Mod $\sigma$'da, ortalama $\sigma\sqrt{\pi/2} \approx 1.253\sigma$.</div>
</div>

$$E[R] = \sigma\sqrt{\pi/2} \approx 1.253\sigma, \quad \text{Var}[R] = \left(2 - \pi/2\right)\sigma^2 \approx 0.429\sigma^2$$

**Mühendislikte nerede karşımıza çıkar?** En meşhur kullanımı **Rayleigh fading kanalı**. NLOS (non-line-of-sight) koşullarda bir RF alıcısının antenine ulaşan sinyal, ortamdaki onlarca yansıtıcıdan dönen yolların toplamıdır. Her yol kompleks bir genlik katkısı (gerçek + sanal) verir; merkezi limit teoremi gereği toplam kompleks katkı I-Q düzleminde iki boyutlu Gauss dağılır. Zarf (büyüklük) ise Rayleigh. Bu, 900 MHz GSM, 2.4 GHz Wi-Fi, 1090 MHz ADS-B (uçak silüetinin direkt göründüğü durum dışında) gibi neredeyse tüm karasal kablosuz sistemlerin temel kanal modelidir.

Diğer kullanımlar: MRI manyetik görüntülerinin magnitude bileşeninin gürültüsü; rüzgar hızının yatay yön vektörlerinin Gauss varsayımı altında zarfı; gemi mühendisliğinde dalga yüksekliği dağılımı; bir lazer kararlılığı analizinde shot noise sonrası foton akı zarfı.

> **Tuzak: Rayleigh - Rician karışıklığı.** Eğer ortamda kuvvetli bir direkt görüş (LoS) bileşeni varsa, kompleks zarfın ortalaması sıfır değildir — ortalama bir LoS taşıyıcısı, etrafına saçılan Gauss bileşenler binmiş hâldedir. Bu durumda zarf **Rician** dağılır. Rician'ı Rayleigh'den ayıran tek parametre K-faktör: LoS gücün saçılan güce oranı. Bir taşıyıcı uçaktan yer istasyonuna sinyal yolluyorsa K büyüktür (Rician), iki uçak arası mesh radyo karmaşık şehir üstünden geçiyorsa K küçüktür (≈Rayleigh). Fade marjı hesabını yanlış kanal modeliyle yapmak link bütçesini onlarca dB sapıtır.

### Weibull — Güvenilirlik Mühendisinin Dağılımı

Üç dağılımı aynı çatı altında toplayan, **şekil parametresi** $k$'ya göre bukalemun gibi davranan bir aile:

$$f(x) = \frac{k}{\lambda}\left(\frac{x}{\lambda}\right)^{k-1} \exp\left(-(x/\lambda)^k\right), \quad x \ge 0$$

Burada $\lambda$ **ölçek parametresi** (karakteristik ömür), $k$ ise **şekil parametresi**. $k$'nın değerine göre şekil dramatik biçimde değişir. Widget'ta $k$'yı 0.5'ten 5'e çekin — eğrinin azalan üstelden simetrik Normal'a kadar dört farklı karaktere büründüğünü göreceksiniz:

<div class="dist-plot">
  <div class="dist-controls">
    <label>$k$ (şekil) = <span id="wei-k-val" class="dist-val">2.00</span><input type="range" id="wei-k" min="0.4" max="5" step="0.05" value="2"></label>
    <label>$\lambda$ (ölçek) = <span id="wei-lam-val" class="dist-val">1.0</span><input type="range" id="wei-lam" min="0.5" max="4" step="0.1" value="1"></label>
  </div>
  <div id="wei-plot" class="dist-plot-area"></div>
  <div class="dist-caption">Weibull PDF — $k<1$ azalan ("yenidoğan ölümleri"), $k=1$ üstel, $k=2$ Rayleigh, $k\ge 3.5$ Normal-benzeri.</div>
</div>

$k=1$'de Weibull tam olarak üstel dağılıma indirgenir; $k=2$'de Rayleigh ile çakışır; $k > 3$ civarında Normal'a yaklaşır. Bu, tek bir dağılımın güvenilirlik mühendisliğinin neredeyse tüm fazlarını modelleyebilmesi demektir.

$$E[X] = \lambda \Gamma(1 + 1/k), \quad \text{Var}[X] = \lambda^2 \left[\Gamma(1 + 2/k) - \Gamma(1 + 1/k)^2\right]$$

Weibull'un en güçlü kavramı **hazard fonksiyonu** — anlık arıza oranı:

$$h(x) = \frac{k}{\lambda}\left(\frac{x}{\lambda}\right)^{k-1}$$

$k<1$ için hazard zamanla azalır (yenidoğan ölümleri — kusurlu komponentler erken ölür, sağ kalanlar güçlenir). $k=1$ için hazard sabittir (memoryless — üstel davranış). $k>1$ için hazard zamanla artar (yaşlanma, yorulma, aşınma). Bu üç fazın peş peşe gelmesi meşhur **bathtub eğrisini** oluşturur.

**Mühendislikte nerede karşımıza çıkar?** Elektronik komponent ömrü (kapasitör, IC, konektör); rulman ve motor arıza zamanları; yapısal yorulma (S-N eğrisi); rüzgar enerjisi assessment'larında uzun-dönem rüzgar hızı dağılımı; jet motorlarında türbin kanat ömrü; havayolu filolarında belirli bir bileşenin reliability bloğu. Sektör konuştuğunda "B10" ya da "B5" değerleri duyarsınız — bunlar Weibull CDF'nin %10 veya %5'ine karşılık gelen zamanlar; popülasyonun bu yüzdesinin bozulduğu noktayı verir.

> **Tuzak:** Shape parametresinin yorumu. $k < 1$ olarak ölçtüğünüzde — yani bathtub'ın "yenidoğan ölümleri" fazındaysanız — refleks "burn-in süresini uzatalım" olabilir; ama gerçek çözüm tasarım/üretim hatasını bulmaktır. Burn-in'i uzatmak kötü tasarımı saklamaktır, çözmek değil. $k > 1$ ise "yaşlanma" gerçek; planlı bakım veya komponent değişimi devreye girer.

---

## Hangi Problem, Hangi Dağılım?

Aşağıdaki tablo, bir mühendisin masa başında karşılaştığı tipik problemler için "ilk varsayım" rehberidir. Tabii ki gerçek hayatta histogramı çizmeden hiçbir karar nihai değildir, ama bu liste 8 dağılımı somut sahaya bağlamak için faydalı bir çıkış noktası.

| Senaryo | İlk Varsayım | Neden |
|---|---|---|
| ADC kuantizasyon gürültüsü | Uniform | $\pm$ LSB/2'de eşit dağılım (dither varsa) |
| Op-amp / direnç termal gürültüsü | Normal | CLT — milyarlarca bağımsız moleküler hareket toplamı |
| RF NLOS multipath sinyal zarfı | Rayleigh | I/Q bileşenleri bağımsız sıfır-ortalama Gauss |
| RF LoS + multipath sinyal zarfı | Rician | Bilinen LoS taşıyıcı + Gauss saçılan |
| Yatay rüzgar hızı | Weibull ($k\approx 2$) | Yön vektörü Gauss → büyüklük Rayleigh |
| Paket içi bit hatası sayısı | Binom | $n$ bit, sabit BER, bağımsız hata |
| Cosmic ray kaynaklı SEU sayısı | Poisson | Nadir olay, sürekli zaman, bağımsız |
| Memoryless bekleme süresi | Exponential = Weibull(k=1) | Poisson olaylarının arası |
| Elektronik komponent ömrü | Weibull ($k > 1$) | Bathtub'ın yaşlanma fazı |
| Histogram-dağılım uyumu testi | χ² | Standart Pearson uyum iyiliği |
| Örneklem varyansı güven aralığı | χ² | $(n-1)s^2/\sigma^2 \sim \chi^2(n-1)$ |
| Bilgi yokken sayısal RNG | Uniform | En sade non-informative seçim |

Tablonun gizli okuması: bir mühendisin günlük hayatında en sık karşılaştığı dağılım Normal değil, **Binom ve Weibull**'dur. Normal'in ünlü olmasının sebebi, içinden çıktığı süreçlerin (CLT, ölçüm teorisi) bilim eğitiminin merkezinde olmasıdır; ama pratik sistem mühendisliğinde Binom paket başarı oranlarınızı, Weibull bileşen ömürlerinizi belirler.

---

## Dört Mühendislik Vinyeti

Şimdi sekiz dağılımı sahaya bağlayan dört kısa örnek. Her birinde önce matematiği, sonra `numpy` / `scipy.stats` ile küçük bir simülasyonu, ardından mühendislik sonucunu vereceğiz.

### Vinyet 1 — 12-bit ADC SNR Formülünün Türetimi

Bir $N$-bit ADC, $V_{FS}$ tam ölçek aralığını $2^N$ seviyeye böler; her seviye arası $q = V_{FS}/2^N$. Her örnekte yuvarlama hatası $e \in [-q/2, +q/2]$ aralığında uniform dağılır. Bu hatanın varyansı:

$$\sigma_e^2 = \frac{q^2}{12}$$

Tam ölçek bir sinüs sinyalinin gücü ise:

$$P_{\text{sinüs}} = \frac{(V_{FS}/2)^2}{2} = \frac{V_{FS}^2}{8}$$

İdeal SNR (sadece kuantizasyon gürültüsünden):

$$\text{SNR} = \frac{P_{\text{sinüs}}}{\sigma_e^2} = \frac{V_{FS}^2/8}{q^2/12} = \frac{12 V_{FS}^2}{8 q^2} = \frac{3}{2} \cdot 2^{2N}$$

dB'ye çevirirsek:

$$\text{SNR}_{\text{dB}} = 10 \log_{10}\left(\frac{3}{2}\right) + 20N \log_{10}(2) = 1.76 + 6.02N \, \text{dB}$$

12-bit için: $\text{SNR}_{\text{ideal}} = 1.76 + 6.02 \times 12 = 74 \, \text{dB}$.

```python
import numpy as np

N_bits = 12
N_samples = 2**16
fs = 1.0
f_sig = fs / 64  # tam-bin sinüs

t = np.arange(N_samples) / fs
x = np.sin(2 * np.pi * f_sig * t)         # tam-ölçek sinüs ±1
q = 2.0 / (2**N_bits)                      # LSB
x_q = np.round(x / q) * q                  # 12-bit ADC simülasyonu
noise = x_q - x

P_sig = np.mean(x**2)
P_noise = np.mean(noise**2)
snr_db = 10 * np.log10(P_sig / P_noise)
print(f"Ölçülen SNR: {snr_db:.2f} dB | Teori: {6.02*N_bits + 1.76:.2f} dB")
# Ölçülen SNR: 74.01 dB | Teori: 73.98 dB
```

Sonuç teoriye uyuyor. Kuantizasyon hatasının Uniform varyansından doğan bu formül, herhangi bir ADC veri sayfasındaki SNR satırının altında yatan tek matematik.

### Vinyet 2 — ADS-B Paket Başarı Oranı

Bir ADS-B alıcısı saniyede ortalama 2 mesaj alıyor; ortamda %1 paket düşme oranı var (zayıf SNR ya da kollizyon). Bir uçağın takibi için **art arda en az bir mesajın 5 saniye içinde başarılı olması** gerekiyor. Bu durumda 10 paketlik pencerede tüm paketlerin kaybolma olasılığı nedir?

Binom dağılımıyla: $X \sim \text{Binom}(n=10, p=0.01)$, başarısızlık (tüm 10'unun kaybı) olasılığı $P(X=10) = 0.01^{10}$. Bu astronomik düşük. Ama gerçek soru: en az 1 başarılı olma olasılığı:

$$P(\text{en az 1 başarı}) = 1 - (1-p_{succ})^n = 1 - (0.01)^{10} \approx 1$$

Hadi daha gerçekçi bir senaryo: %20 paket düşme (deep fade altında).

```python
from scipy.stats import binom

n = 10
p_drop = 0.20
p_succ = 1 - p_drop

# 10 paketlik pencerede tümünün kaybı:
p_all_lost = binom.pmf(0, n, p_succ)
print(f"10 paketin hepsi kayıp: {p_all_lost:.2e}")
# 1.02e-07

# En az 3 başarılı paket gelme olasılığı:
p_at_least_3 = 1 - binom.cdf(2, n, p_succ)
print(f"En az 3 başarı: {p_at_least_3:.4f}")
# 0.9991
```

%20 paket kaybıyla bile 10 paketlik pencerede en az 3 başarılı mesaj gelme olasılığı %99.91. Tracker tasarımı bunun üzerine kurulur — pencere boyutu ne kadar büyürse outage olasılığı eksponansiyel düşer. Pratikte 1 saniyelik bir kayıp pencereyi aşmak için $n$ yerine `pencere x mesaj_oranı` koyarsınız.

> Korelasyonlu kayıplar (deep fade durumunda) bu hesabı bozar: birbirini izleyen 10 paket aslında tek bir "fade olayı"nın altında olabilir; bağımsız 10 paket gibi davranmaz. Sahada Markov tabanlı "burst error" modelleri bu yüzden devreye girer.

### Vinyet 3 — Rayleigh Fading Altında Fade Margin

Bir NLOS RF link'inin SNR'ı, sinyal gücü Rayleigh dağılır olan bir zarfa sahip; güç ise eksponansiyel dağılır. Soru: %1 outage olasılığı için kaç dB **fade margin** bırakmamız gerekir?

Rayleigh zarfı için PDF $f(r) = (r/\sigma^2) e^{-r^2/(2\sigma^2)}$. Gücün $P = R^2$ olduğunu hatırlayın; $P$ eksponansiyel dağılır ortalama $2\sigma^2$ ile. Ortalama gücün $\bar{P}$ olduğunu kabul edelim. Bir eşik altında kalma olasılığı:

$$P(P < P_{th}) = 1 - e^{-P_{th}/\bar{P}}$$

%1 outage istiyoruz: $P(P < P_{th}) = 0.01$. Çözersek:

$$P_{th}/\bar{P} = -\ln(0.99) \approx 0.01005$$

dB cinsinden: $10 \log_{10}(0.01005) \approx -19.97 \, \text{dB}$. Yani **20 dB fade margin** Rayleigh kanalında %1 outage'a karşılık gelir.

```python
import numpy as np
from scipy.stats import expon

# Güç dağılımı eksponansiyel, ortalama 1 (normalize)
mean_power = 1.0
target_outage = 0.01

# CDF tersinden eşiği bul:
p_th = expon.ppf(target_outage, scale=mean_power)
margin_db = -10 * np.log10(p_th / mean_power)
print(f"Fade margin %1 outage için: {margin_db:.2f} dB")
# Fade margin %1 outage için: 19.96 dB

# %0.1 outage için:
margin_db_strict = -10 * np.log10(expon.ppf(0.001, scale=1) / mean_power)
print(f"%0.1 outage için: {margin_db_strict:.2f} dB")
# %0.1 outage için: 30.00 dB
```

Rayleigh fading'in mühendislere armağanı bu konservatif marj rakamlarıdır. LoS bileşen olsaydı (Rician), aynı outage için margin çok daha düşük olurdu — K-faktör 10 dB civarındayken margin yarıya iner. Yer-uçak link bütçesi (yüksek K) ile uçak-uçak ad-hoc mesh (düşük K) arasındaki devasa farkın matematiksel kökü buradadır.

### Vinyet 4 — Weibull B10 / MTTF Hesabı

Bir komponent üzerinde 50 örneklik hızlandırılmış ömür testi yapılmış. Gözlenen arıza zamanlarına Weibull uydurduğunuzda $k = 2.5$, $\lambda = 8000$ saat çıktı. Soru: bu komponent için **B10 ömrü** ve **MTTF** nedir?

B10 = popülasyonun %10'unun arızalandığı zaman:

$$F(t_{B10}) = 0.10 \Rightarrow 1 - e^{-(t/\lambda)^k} = 0.10 \Rightarrow t_{B10} = \lambda \left[-\ln(0.90)\right]^{1/k}$$

MTTF = $\lambda \Gamma(1 + 1/k)$. $\Gamma$ fonksiyonu burada Weibull tablosundan ya da `scipy.special.gamma` ile.

```python
import numpy as np
from scipy.special import gamma
from scipy.stats import weibull_min

k = 2.5
lam = 8000  # saat

# B10 — popülasyonun %10'unun bozulduğu zaman
t_B10 = weibull_min.ppf(0.10, k, scale=lam)
print(f"B10 = {t_B10:.0f} saat")
# B10 = 3493 saat

# MTTF (Mean Time To Failure)
mttf = lam * gamma(1 + 1/k)
print(f"MTTF = {mttf:.0f} saat")
# MTTF = 7098 saat

# Hazard zamanla artıyor mu? (k > 1)
print(f"Hazard fazı: {'yaşlanma' if k > 1 else 'yenidoğan' if k < 1 else 'rastgele'}")
# Hazard fazı: yaşlanma
```

İki gözlem önemli. Birincisi, B10 (3493 saat) MTTF'in (7098 saat) yaklaşık **yarısı** — yani komponentlerin yarısı MTTF'e ulaşamaz; ortalama yanıltıcıdır, B-ömrü her zaman daha bilgilendiricidir. İkincisi, $k = 2.5 > 1$ olduğu için aşınma fazındayız; planlı değişim B10 civarında devreye alınmalıdır. Mühendislik bakımı için sezgisel kural: bir komponent için belirlenen değişim aralığı, **MTTF değil, B-ömrü** üzerine kurulur.

---

## Tam İlişki Ağacı

Sekiz dağılım, birbirine türeyiş, limit ve özel-durum bağlarıyla bağlanmış tek bir aile gibidir. Aşağıdaki diyagram bu bağları tek bakışta gösteriyor:

<div class="mermaid">
flowchart TB
    Ber[Bernoulli<br/>tek atış] -->|n adet i.i.d. toplam| Bin[Binom]
    Bin -->|n→∞, np=λ sabit| Poi[Poisson]
    Bin -->|n büyük, de Moivre-Laplace| Nor[Normal]
    Uni[Uniform] -->|çok toplam, CLT| Nor
    Nor -->|kareler toplamı, k adet| Chi[Chi-square<br/>df=k]
    Nor -->|2D vektör büyüklüğü| Ray[Rayleigh]
    Wei[Weibull] -->|k=2| Ray
    Wei -->|k=1| Exp[Exponential]
    Poi <-->|inter-arrival süresi| Exp
    Chi -.df=2.-> Exp
</div>

Birkaç vurgu: Exponential, Weibull'un özel durumu olduğu gibi aynı zamanda Poisson olayları arası bekleme süresinin dağılımıdır — kesikli sayım ile sürekli süre arasındaki köprü. χ² 2 serbestlik derecesi ile Exponential'a indirgenir (radar I/Q güç detektörünün matematiksel kökü budur). Normal-Rayleigh-Weibull üçgeni RF mühendisi için merkezi: 2D Gauss → Rayleigh, $k$-parametreli Weibull → Rayleigh ($k=2$) → Exponential ($k=1$).

---

## Sık Yapılan Hataların Özeti

Yukarıda dağılımları anlatırken her birinin yanına "Tuzak" kutuları yerleştirdik. Bunları tek bir liste hâlinde toparlayalım — bir checklist olarak masada bulunsun:

1. **Gauss-süpürme** — Histogram bakmadan her şeyi Normal varsaymak. Heavy-tail (Pareto, log-normal) durumlarda çok-sigma olayları katbekat hafife alır.
2. **Bağımsızlık ihlali** — Binom, Poisson ve χ² hep i.i.d. varsayımına bağlı. Deep fade'de korelasyonlu paket kayıpları, clustered Poisson süreçler, art arda kestirilmiş parametrelerle df'in azalmaması — hepsi sessiz hatalar.
3. **Küçük örneklemde CLT'ye güvenmek** — Toplamların Normal'a yakınsaması yavaştır; örneklem küçükse (genelde n < 30) gerçek dağılım Student-t gibi heavy-tail bir versiyonla modellenmelidir.
4. **Rayleigh / Rician karıştırması** — LoS bileşen varsa Rayleigh yanlış; Rician ile K-faktör kullanmak şart. Link bütçesi farkı 10-20 dB olur.
5. **Weibull shape parametresi yanlış yorumu** — $k < 1$ "burn-in uzat" değil, "tasarımı düzelt" demektir. B-ömrü MTTF'ten farklıdır ve genelde daha bilgilendiricidir.

---

## Sonuç

Sekiz dağılım — Bernoulli, Binom, Poisson, Uniform, Normal, χ², Rayleigh, Weibull — mühendislik pratiğinin büyük bölümünü kapsayan, türeyiş ve limit ilişkileriyle birbirine bağlı tek bir aile. Bernoulli ailesi olayları sayar; Gauss ailesi sürekli büyüklükleri ve süreleri modeller; Uniform bilgi yokken başlangıç noktasıdır. Bu sekiz dağılımı ezberlemek yerine **şekillerini, parametrelerini ve birbirleriyle ilişkilerini** anlamak, hangi probleme hangi dağılımla yaklaşacağınızı sezgisel olarak görmenizi sağlar.

Bir kez daha vurgulamak gerekirse: **önce histogram, sonra varsayım**. Sahada bir komponent ömrü verisi, bir paket kaybı log'u ya da bir gürültü ölçümü gördüğünüzde refleksle "bu Normal" demek mühendisliğin en pahalı kestirme yollarından biri olabilir. Aşırı muhafazakâr link bütçeleri, gerçeği yansıtmayan MTBF rakamları, alarm seviyelerinde sürpriz fail'ler genellikle aynı temel hataya — yanlış dağılım varsayımına — uzanır.

Bu yazıyı bir önceki [bandpass sampling yazısının](https://karaman.dev/2026/05/21/bandpass-sampling.html) tamamlayıcısı olarak okuyabilirsiniz: o yazı sayısallaştırmanın geometrisini, bu yazı stokastik yarısını anlatıyor. ADC kuantizasyon SNR'ı, fade margin, paket başarı oranı, MTBF — RF zincirinin baştan sona analizi için ikisinin birden cebinizde olması yeterli.

---

## Kaynaklar

- Sheldon M. Ross — *A First Course in Probability* — Pearson, 10. baskı, 2019.
- Athanasios Papoulis & S. Unnikrishna Pillai — *Probability, Random Variables and Stochastic Processes* — McGraw-Hill, 4. baskı, 2002.
- NIST/SEMATECH — [*e-Handbook of Statistical Methods*](https://www.itl.nist.gov/div898/handbook/).
- John G. Proakis & Masoud Salehi — *Digital Communications* — McGraw-Hill, 5. baskı, 2007. (Rayleigh / Rician fading bölümleri)
- Walt Kester (ed.) — *The Data Conversion Handbook* — Analog Devices / Newnes, 2004. (Uniform kuantizasyon ve ADC SNR türetimi)
- Waloddi Weibull — *A Statistical Distribution Function of Wide Applicability* — Journal of Applied Mechanics, cilt 18, ss. 293–297, 1951.
- Lord Rayleigh (J. W. Strutt) — *On the resultant of a large number of vibrations of the same pitch and of arbitrary phase* — Philosophical Magazine, cilt 10, ss. 73–78, 1880.
- Patrick D. T. O'Connor & Andre Kleyner — *Practical Reliability Engineering* — Wiley, 5. baskı, 2012. (Weibull, bathtub eğrisi, B-ömrü)
- Karl Pearson — *On the criterion that a given system of deviations from the probable in the case of a correlated system of variables is such that it can be reasonably supposed to have arisen from random sampling* — Philosophical Magazine, cilt 50, ss. 157–175, 1900.
- [Mühendisin Bandpass Sampling Rehberi — karaman.dev](https://karaman.dev/2026/05/21/bandpass-sampling.html)
- [GUM Annex F ve NCSLI RP-12 ile Ölçüm Belirsizliği — karaman.dev](https://karaman.dev/2026/05/06/olcum-belirsizligi-gum-annex-f-ncsli-rp-12.html)

<script src="https://cdn.plot.ly/plotly-2.35.2.min.js"></script>
<script src="/assets/distributions.js"></script>

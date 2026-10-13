---
title: "Merkezi Limit Teoremi: Çan Eğrisi Neden Her Yerde Karşımıza Çıkıyor?"
subtitle: "The Central Limit Theorem: Why the Bell Curve Shows Up Everywhere"
background: "/img/posts/merkezi-limit-teoremi-cover.webp"
date: '2026-10-12 00:00:00'
layout: post
lang: tr
mermaid: true
categories: [muhendislik]
tags: [istatistik, metroloji, sinyal-isleme]
---

<script src="https://cdn.plot.ly/plotly-basic-4.1.1.min.js" integrity="sha512-orZ6OgVLrRp8vSfEJ9XXGswEzLgmW4nqH1ja1cWJRPqwAkyU0GcrM42aDvIcJjrK9EmGWyVZ3tpMmHXbCrrIaA==" crossorigin="anonymous"></script>

Bir zar atın. 1'den 6'ya her sayı eşit olasılıkla gelir; dağılım dümdüzdür. İki zar atıp toplayın: en sık 7 gelir, en seyrek 2 ve 12; dağılım bir üçgene döner. On zar atıp toplayın: ortaya istatistik kitaplarının kapağını süsleyen o tanıdık çan eğrisi çıkar. Zarın üzerinde çan eğrisine dair hiçbir şey yok. Eğri zardan değil, **toplama işleminden** doğuyor.

Bu gözlemin genel hâline **Merkezi Limit Teoremi** diyoruz (kısaca MLT; İngilizce *Central Limit Theorem*, CLT): birbirinden bağımsız çok sayıda rastgele etkinin toplamı ya da ortalaması, o etkilerin tek tek nasıl dağıldığından neredeyse bağımsız olarak normal dağılıma yaklaşır. Multimetrenin son hanesinin neden bir çan eğrisi çizerek titrediğini, bin kişilik bir anketin 85 milyonluk bir ülke hakkında nasıl söz söyleyebildiğini, [ölçüm belirsizliği]({% post_url 2026-05-06-olcum-belirsizligi-gum-annex-f-ncsli-rp-12 %}) raporlarındaki `k = 2` çarpanının neden "yaklaşık %95" anlamına geldiğini ve [Kalman filtresinin]({% post_url 2026-06-02-kalman-filtresi %}) gürültüyü neden Gauss varsaydığını açıklayan şey aynı teoremdir.

Bu yazıda teoremi önce sezgiyle, sonra formülle, sonra da çalışan kodla kuracağız. Ardından en az teoremin kendisi kadar önemli olan soruya geçeceğiz: teorem **ne zaman işlemez**? Son bölümde mühendislikten anketlere, kalite kontrolden Monte Carlo benzetimine gerçek hayattaki kullanım alanlarını dolaşacağız. Yazıdaki bütün benzetim sonuçları gerçekten çalıştırılmış kodların çıktısıdır; temel betikler metinde yer alıyor.

---

## Kısa Bir Tarihçe

Teoremin ilk hâli bir kumar probleminden doğdu. **Abraham de Moivre**, 1733'te yayımladığı Latince bir notta, çok sayıda yazı-tura atışında gelen "yazı" sayısının olasılıklarının bugün normal eğri dediğimiz eğriyle yaklaşık olarak hesaplanabileceğini gösterdi. Amacı, devasa binom katsayılarını elle hesaplamaktan kurtulmaktı; kimse bu kısayolu bir doğa yasası olarak görmedi.

1809'da **Carl Friedrich Gauss**, gök cisimlerinin yörüngelerini hesaplarken ölçüm hatalarını aynı eğriyle modelledi; eğrinin "Gauss eğrisi" diye anılması bundandır. Bir yıl sonra **Pierre-Simon Laplace** de Moivre'ın sonucunu yazı-turadan çıkarıp genelleştirdi: toplanan şeylerin yazı-tura olması gerekmiyordu, çok geniş bir sınıftaki bağımsız rastgele büyüklüklerin toplamı da aynı eğriye yaklaşıyordu. Laplace'ın teoremi Gauss'un varsayımına gerekçe sağladı: bir ölçüm hatası çok sayıda küçük, bağımsız bozucu etkinin toplamıysa, normal dağılması beklenir.

Teoremi gözle görülür kılan kişi **Francis Galton** oldu. Çivi çakılmış eğik bir tahtanın tepesinden bırakılan bilyeler her çivide rastgele sağa ya da sola sapar; alttaki bölmelerde biriken bilyeler ise her seferinde çan eğrisi çizer. Galton, 1889 tarihli *Natural Inheritance* kitabında bu düzen karşısındaki hayranlığını gizlemez; eski Yunanlar bu yasayı bilseydi onu tanrılaştırırdı, diye yazar. Bu yazının kapak görseli de böyle bir tahtanın benzetimidir: 16 sıra çivi, 3000 bilye.

Laplace'ın kanıtı bugünün ölçütleriyle eksikti. İlk genel ve kesin kanıtı, Çebişev'in öğrencisi **Aleksandr Lyapunov** 1901'de verdi. Teoreme adını 1920'de **George Pólya** koydu; "merkezi" sıfatını, teoremin olasılık kuramındaki merkezi rolü nedeniyle seçmişti. 1922'de **Jarl Lindeberg** bugün ders kitaplarında yer alan koşulu buldu; 1935'te **William Feller** ve **Paul Lévy** bu koşulun yalnızca yeterli değil, gerekli de olduğunu göstererek hikâyeyi tamamladı.

Küçük bir dipnot: **Alan Turing**, 1934'te Cambridge'de öğrenciyken, Lindeberg'in çalışmasından habersiz olarak teoremi yeniden kanıtladı. Sonuç on iki yıl önce bulunmuş olduğu için tez hiç yayımlanmadı; yine de Turing'e King's College'da araştırma üyeliği kazandırdı.

<div class="mermaid">
flowchart TB
    A["1733 · De Moivre: yazı-tura sayıları çan eğrisine yaklaşıyor"]
    B["1809 · Gauss: ölçüm hatalarını aynı eğriyle modelliyor"]
    C["1810 · Laplace: sonucu genel toplamlara taşıyor"]
    D["1889 · Galton: bilyeli tahtayla teoremi görünür kılıyor"]
    E["1901 · Lyapunov: ilk genel ve kesin kanıt"]
    F["1920 · Pólya: teoreme adını veriyor"]
    G["1922 · Lindeberg: bugün kullanılan koşul"]
    H["1935 · Feller ve Lévy: gerek ve yeter koşullar"]
    A --> B --> C --> D --> E --> F --> G --> H
</div>

---

## Teorem Ne Söylüyor?

### Zarlarla Sezgi

Açılıştaki zar deneyini kâğıt üzerinde tam olarak hesaplayabiliriz. Aşağıdaki dört panel 1, 2, 3 ve 10 zarın toplamının **kesin** olasılıklarını gösteriyor; çizgi ise aynı ortalamaya ve aynı varyansa sahip normal eğri.

<div id="grafik-zar" style="width:100%;max-width:820px;margin:1.5rem auto 2rem auto;height:500px;"></div>

Tek zarda çubuklar düz, eğriyle ilgisi yok. İki zarda üçgen. Üç zarda köşeler yuvarlanmaya başlıyor. On zarda çubuklarla eğriyi ayırt etmek zorlaşıyor.

Bunun nedeni basit bir sayma argümanı. İki zarda 2 toplamını veren tek bir dizilim vardır (1+1), 7 toplamını veren ise altı tane (1+6, 2+5, 3+4 ve tersleri). On zarda 10 toplamını veren yine tek bir dizilim varken, 35 toplamını veren 4 395 456 dizilim vardır. Uç değerlere ulaşmak için bütün zarların aynı yönde "anlaşması" gerekir; ortadaki değerlere ise sayısız farklı yoldan varılır. Büyük sapmalar birbirini götürür, geriye ortada yığılan bir tepe kalır.

### Resmî İfade

$X_1, X_2, \dots, X_n$ birbirinden bağımsız, aynı dağılımdan gelen rastgele değişkenler olsun; ortalamaları $\mu$, standart sapmaları $\sigma$ olsun ve $\sigma$ sonlu olsun. Örneklem ortalamasını $\bar{X}_n$ ile gösterelim. Teorem şunu söyler:

$$
Z_n = \frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}} \;\xrightarrow{\;d\;}\; \mathcal{N}(0, 1) \qquad (n \to \infty)
$$

Okun üzerindeki $d$ "dağılımda yakınsama" demektir: $n$ büyüdükçe $Z_n$'nin dağılımı standart normal dağılıma yaklaşır. Pratikte bunu şöyle okuruz: yeterince büyük $n$ için

$$
\bar{X}_n \;\approx\; \mathcal{N}\!\left(\mu,\ \frac{\sigma^2}{n}\right)
$$

Bu tek satırda aslında üç ayrı iddia var:

1. **Merkez.** Ortalamaların ortalaması, kaynağın gerçek ortalaması $\mu$'dür.
2. **Yayılım.** Ortalamaların standart sapması $\sigma/\sqrt{n}$'dir. Buna **standart hata** denir. Belirsizliği yarıya indirmek için dört kat, onda birine indirmek için yüz kat veri gerekir.
3. **Şekil.** Kaynak dağılım ne olursa olsun, ortalamaların dağılımı normale yaklaşır.

İlk iki madde MLT'ye özgü değildir; bağımsız değişkenlerin varyanslarının toplanmasından doğrudan çıkar. Teoremin asıl içeriği üçüncü maddedir.

<div class="mermaid">
flowchart TB
    K1["Örnekler bağımsız"]
    K2["Varyans sonlu"]
    K3["Hiçbir terim tek başına baskın değil"]
    T["n örneğin ortalaması"]
    S1["Merkez: μ"]
    S2["Yayılım: σ/√n"]
    S3["Şekil: normal dağılım"]
    K1 --> T
    K2 --> T
    K3 --> T
    T --> S1
    T --> S2
    T --> S3
</div>

### İki Yaygın Yanlış Anlama

**"Çok veri toplarsam verim normal dağılır."** Hayır. Tek tek ölçümler neyse odur; çok veri toplamak histogramı çan eğrisine çevirmez, kaynağın gerçek şeklini daha net gösterir. Normalleşen şey verinin kendisi değil, **ortalamasıdır** (ya da toplamıdır).

**"Bu zaten Büyük Sayılar Yasası."** O da değil. Büyük Sayılar Yasası, örneklem ortalamasının $\mu$'ye yaklaştığını söyler: *nereye* gidildiğini bildirir. MLT ise yolda yapılan hatanın *nasıl dağıldığını* ve *hangi hızla* küçüldüğünü söyler. Güven aralığı kurmamızı, "sonuç şu aralıktadır" diyebilmemizi sağlayan ikincisidir.

---

## Kodla Görelim: Çarpık Bir Dağılımdan Çan Eğrisine

Zar örneği fazla uysal; zarın dağılımı zaten simetrik. Teoremi daha zor bir kaynakla sınayalım: **üstel dağılım**. Arızalar arası süre, bir sunucuya gelen istekler arasındaki bekleme, radyoaktif bozunma gibi olaylar bu dağılıma uyar. Küçük değerler çok sık, büyük değerler seyrektir; dağılım simetrik olmaktan çok uzaktır (çarpıklığı 2).

Deney şu: üstel dağılımdan $n$ örnek çek, ortalamasını al; bunu 100 000 kez tekrarla ve elde edilen 100 000 ortalamanın dağılımına bak.

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(42)
TEKRAR = 100_000          # kaç kez "örneklem alıp ortalama hesaplayacağız"
mu, sigma = 1.0, 1.0      # Üstel(1) dağılımının ortalaması ve standart sapması

print(f"{'n':>4} {'ort.':>8} {'std':>8} {'σ/√n':>8} {'çarpıklık':>10} {'basıklık':>9}")
for n in (1, 2, 5, 30, 100):
    ornekler = rng.exponential(scale=1.0, size=(TEKRAR, n))
    ortalamalar = ornekler.mean(axis=1)
    print(f"{n:>4} {ortalamalar.mean():>8.4f} {ortalamalar.std(ddof=1):>8.4f} "
          f"{sigma / np.sqrt(n):>8.4f} {stats.skew(ortalamalar):>10.3f} "
          f"{stats.kurtosis(ortalamalar):>9.3f}")
```

Çıktı:

```text
   n     ort.      std     σ/√n  çarpıklık  basıklık
   1   1.0035   1.0053   1.0000      2.023     6.238
   2   0.9958   0.7042   0.7071      1.426     3.102
   5   0.9994   0.4468   0.4472      0.906     1.306
  30   0.9994   0.1823   0.1826      0.355     0.160
 100   0.9999   0.0999   0.1000      0.209     0.065
```

Tablo, teoremin üç iddiasını satır satır doğruluyor:

- **Merkez:** `ort.` sütunu her satırda 1'e yapışık.
- **Yayılım:** ölçülen `std` ile kuramsal `σ/√n` üçüncü ondalığa kadar aynı.
- **Şekil:** normal dağılımda çarpıklık da (fazlalık) basıklık da sıfırdır. İkisi de $n$ büyüdükçe sıfıra iniyor. Kuram burada da tutuyor: üstel dağılım için ortalamanın çarpıklığı $2/\sqrt{n}$, basıklığı $6/n$ olmalıdır; $n = 30$ için bu 0,365 ve 0,200 eder.

Aynı veriyi resim olarak görelim. Ortalamaları standartlaştırıp (yani $\mu$'yü çıkarıp $\sigma/\sqrt{n}$'ye bölerek) dört panelde aynı standart normal eğrinin üzerine koyuyoruz.

<div id="grafik-ustel" style="width:100%;max-width:820px;margin:1.5rem auto 2rem auto;height:500px;"></div>

$n = 1$ panelinde ham üstel dağılımı görüyorsunuz: sol tarafta dik bir duvar, sağa doğru uzun bir kuyruk. $n = 5$'te tepe ortaya çıkmış ama hâlâ sola yatık. $n = 30$'da histogram eğriye büyük ölçüde oturmuş; yine de dikkatli bakarsanız tepenin hafifçe solda, sağ kuyruğun eğrinin biraz üzerinde kaldığını görürsünüz. Bu küçük fark birazdan önem kazanacak.

### Etkileşimli Deney

Aynı deneyi tarayıcınızda, farklı kaynak dağılımlarla tekrarlayabilirsiniz. Her ayar değişikliğinde 20 000 örneklem yeniden çekilir. İlk panel kaynak dağılımı, ikinci panel $n$ örneğin ortalamasının dağılımını gösterir.

<div class="card my-3 demo-card" id="mlt-deney">
  <div class="card-header py-2"><strong>Merkezi Limit Teoremi Deneyi</strong></div>
  <div class="card-body">
    <div class="form-row mb-2">
      <div class="col-md-4 mb-2">
        <label class="mb-0 small" for="mlt-dagilim">Kaynak dağılım</label>
        <select class="custom-select custom-select-sm" id="mlt-dagilim">
          <option value="ustel" selected>Üstel (çarpık)</option>
          <option value="duzgun">Düzgün (0–1)</option>
          <option value="zar">Zar (1–6)</option>
          <option value="ikitepe">İki tepeli</option>
          <option value="lognormal">Log-normal (kalın kuyruk)</option>
          <option value="cauchy">Cauchy (sonsuz varyans)</option>
        </select>
      </div>
      <div class="col-md-5 mb-2">
        <label class="mb-0 small" for="mlt-n">Örneklem büyüklüğü n = <b id="mlt-n-deger">1</b></label>
        <input type="range" class="custom-range" id="mlt-n" min="1" max="100" value="1" step="1">
      </div>
      <div class="col-md-3 mb-2 d-flex align-items-end">
        <button class="btn btn-sm btn-outline-secondary" id="mlt-yenile" type="button">Yeniden örnekle</button>
      </div>
    </div>
    <div class="custom-control custom-checkbox small mb-2">
      <input type="checkbox" class="custom-control-input" id="mlt-sabit">
      <label class="custom-control-label" for="mlt-sabit">x eksenini sabit tut (daralmayı görmek için)</label>
    </div>
    <div class="row">
      <div class="col-md-5 mb-2"><div id="mlt-kaynak" style="height:260px;"></div></div>
      <div class="col-md-7 mb-2"><div id="mlt-ortalama" style="height:260px;"></div></div>
    </div>
    <div id="mlt-durum" class="demo-card__status px-2 py-1 rounded small" style="font-family:monospace;min-height:2.2em;"></div>
    <p class="text-muted small mt-2 mb-0">İkinci paneldeki çizgi, MLT'nin öngördüğü normal eğridir. n'yi 1'den başlayarak yavaşça artırın: histogram, kaynağın şekli ne olursa olsun çizginin üzerine oturur. Log-normalde bunun çok daha geç olduğuna, Cauchy'de ise hiç olmadığına dikkat edin (orada çizgi kaynak dağılımın kendisidir ve n ile değişmez). "x eksenini sabit tut" seçeneği açıkken n'yi artırırsanız σ/√n daralmasını da görürsünüz.</p>
  </div>
</div>

---

## "n ≥ 30 Yeterlidir" Efsanesi

İstatistik derslerinden akılda kalan kural şudur: örneklem büyüklüğü 30'u geçince normal yaklaşım kullanılabilir. Teoremin kendisinde böyle bir sayı yoktur; teorem yalnızca $n \to \infty$ için konuşur. Sonlu $n$ için hatanın ne kadar olduğunu **Berry–Esseen teoremi** söyler:

$$
\sup_x \left\lvert F_n(x) - \Phi(x) \right\rvert \;\le\; \frac{C\,\rho}{\sigma^3 \sqrt{n}}, \qquad \rho = E\,\lvert X - \mu \rvert^3
$$

Burada $F_n$ standartlaştırılmış ortalamanın gerçek dağılım fonksiyonu, $\Phi$ standart normalinki, $C$ ise 0,4748'den küçük olduğu bilinen evrensel bir sabittir. Formülün söylediği iki şey var: hata $1/\sqrt{n}$ hızıyla, yani yavaş küçülür; ve kaynağın üçüncü momenti ne kadar büyükse, yani dağılım ne kadar çarpık ve kuyruğu ne kadar kalınsa, o kadar çok veri gerekir. "30" bazı dağılımlar için fazlasıyla yeterli, bazıları için umutsuzca azdır.

Bunun pratikteki karşılığını ölçelim. Bir örneklemden %95'lik güven aralığı hesapladığımızda, bu aralığın gerçek ortalamayı %95 olasılıkla içermesini bekleriz. Peki gerçekte kaç kez içeriyor?

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(2026)
TEKRAR, PARCA = 100_000, 10_000

dagilimlar = {
    "Düzgün(0,1)":    (lambda s: rng.uniform(0, 1, s),       0.5),
    "Üstel(1)":       (lambda s: rng.exponential(1.0, s),    1.0),
    "Log-normal(0,1)": (lambda s: rng.lognormal(0, 1.0, s),  np.exp(0.5)),
}

def kapsama(uret, mu, n):
    """%95'lik t-aralığı gerçek ortalamayı kaç kez içine alıyor?"""
    t = stats.t.ppf(0.975, df=n - 1)
    isabet = 0
    for _ in range(TEKRAR // PARCA):
        x = uret((PARCA, n))
        yari = t * x.std(axis=1, ddof=1) / np.sqrt(n)
        isabet += np.sum(np.abs(x.mean(axis=1) - mu) <= yari)
    return 100 * isabet / TEKRAR

ns = (5, 10, 30, 100, 300, 1000)
print(f"{'dağılım':<16}" + "".join(f"{'n=' + str(n):>8}" for n in ns))
for ad, (uret, mu) in dagilimlar.items():
    print(f"{ad:<16}" + "".join(f"{kapsama(uret, mu, n):>8.1f}" for n in ns))
```

Üç kaynak dağılım seçtik: simetrik olan düzgün dağılım (çarpıklık 0), üstel dağılım (çarpıklık 2) ve gelir, dosya boyutu, tepki süresi gibi büyüklüklerde sık görülen log-normal dağılım (çarpıklık yaklaşık 6,2). Her hücre 100 000 örneklemin sonucu.

| Kaynak dağılım | n = 5 | n = 10 | n = 30 | n = 100 | n = 300 | n = 1000 |
|---|---:|---:|---:|---:|---:|---:|
| Düzgün(0, 1) | %93,5 | %94,6 | %94,9 | %95,0 | %95,0 | %94,9 |
| Üstel(1) | %88,2 | %89,9 | %92,8 | %94,1 | %94,7 | %94,9 |
| Log-normal(0, 1) | %82,1 | %84,1 | %88,3 | %91,7 | %93,6 | %94,3 |

<div id="grafik-kapsama" style="width:100%;max-width:780px;margin:1.5rem auto 2rem auto;height:400px;"></div>

Düzgün dağılımda 10 örnek bile yetiyor. Üstel dağılımda $n = 30$ ile kurulan "%95'lik" aralık gerçekte %92,8'lik. Log-normalde aynı aralık **%88,3**'lük: her sekiz-dokuz raporunuzdan biri, beyan ettiğiniz aralığın dışında kalan bir gerçeği saklıyor ve vaat edilen %95'e 1000 örnekle bile tam ulaşılamıyor.

Çıkarılacak ders "30 yerine 100 kullanın" değil. Sihirli bir sayı yok; gereken $n$, verinin ne kadar çarpık olduğuna bağlı. Veriniz simetrikse küçük örneklemler iş görür. Sağa doğru uzun bir kuyruk görüyorsanız ya çok daha fazla veri toplamanız ya da normal yaklaşıma dayanmayan bir yöntem (örneğin bootstrap) kullanmanız gerekir.

---

## Teorem Ne Zaman İşlemez?

Teoremin koşulları süs değildir. Her biri çiğnendiğinde farklı bir şey bozulur.

### 1. Varyans Sonsuzsa: Ortalama Almak İşe Yaramaz

**Cauchy dağılımı** dışarıdan normal dağılıma benzer: simetrik, tek tepeli bir çan. Ama kuyrukları o kadar kalındır ki ne ortalaması ne varyansı tanımlıdır. Sonucu çarpıcıdır: $n$ Cauchy örneğinin ortalaması, tek bir örnekle **tam olarak aynı** dağılıma sahiptir. Bir milyon ölçümün ortalaması, tek bir ölçümden daha güvenilir değildir.

Aşağıda aynı deneyi iki kaynakla yaptık: NumPy ile her birinden 100 000 örnek çekip (tohum 42) her adımda o ana kadarki ortalamayı çizdik.

<div id="grafik-cauchy" style="width:100%;max-width:780px;margin:1.5rem auto 2rem auto;height:400px;"></div>

Normal dağılımın koşan ortalaması birkaç yüz örnekten sonra sıfıra yapışıyor. Cauchy'ninki hiç durulmuyor: ortalama 30 000 örnekten sonra −0,12 civarında sakinleşmiş görünürken 33 143. örnek −28 447 değeriyle geliyor ve tek başına bütün ortalamayı −0,89'a çekiyor. Ne kadar beklerseniz bekleyin, bir sonraki dev sıçrama her zaman yoldadır.

Cauchy bir ders kitabı örneği gibi görünebilir ama kalın kuyruk gerçek hayatta yaygındır: dosya boyutları, ağ trafiğindeki patlamalar, deprem enerjileri, afet sigortası hasarları, servet dağılımı. Varyans sonsuz olduğunda toplamlar yine bir limite yaklaşır ama bu limit normal dağılım değil, **kararlı dağılımlar** (Lévy stable) ailesinin başka bir üyesidir. Böyle verilerde ortalama yerine medyan gibi dayanıklı ölçüler kullanılır.

### 2. Örnekler Bağımsız Değilse: Sandığınızdan Az Veriniz Var

Bir sensörü gürültüsünün bant genişliğinden hızlı örneklerseniz ardışık örnekler birbirine benzer. 1000 örnek alırsınız ama elinizde 1000 bağımsız bilgi yoktur. Ardışık örnekler arasındaki korelasyon $\rho$ ise (birinci dereceden özbağlanımlı gürültü için) etkin örnek sayısı yaklaşık olarak

$$
n_{\text{etkin}} \approx n\,\frac{1 - \rho}{1 + \rho}
$$

olur. $\rho = 0{,}9$ için 1000 örnek yalnızca 53 bağımsız örneğe bedeldir; standart hatanız sandığınızın dört katından fazladır.

Daha kötüsü de var: sıcaklıkla kayma (drift), 1/f gürültüsü, kalibrasyon hatası gibi **sistematik** etkiler ortalama alarak hiç azalmaz. $\sqrt{n}$ yalnızca hatanın rastgele ve bağımsız kısmına işler. Ölçüm belirsizliği yazısında GUM'un ilk uyarısının "tekrar ölçümleriniz gerçekten rastgele mi?" olması tesadüf değildi.

### 3. Tek Bir Bileşen Baskınsa: Toplam Ona Benzer

Lindeberg koşulunun sade Türkçesi şudur: toplamdaki hiçbir terim, toplamın varyansına tek başına hâkim olmamalıdır. On küçük etkinin yanına onların hepsinden büyük tek bir etki koyarsanız, toplam o büyük etkinin dağılımına benzer.

Bunun doğrudan bir metroloji karşılığı var. GUM, genişletilmiş belirsizlikte kullanılan $k = 2$ çarpanının "yaklaşık %95" anlamına gelmesini açıkça Merkezi Limit Teoremi'ne dayandırır (G eki, G.2). Belirsizlik bütçenizde birbirine yakın büyüklükte birkaç bağımsız bileşen varsa bu gerekçe geçerlidir. Ama bütçeye tek bir düz (üniform) bileşen hâkimse birleşik dağılım normal değil, neredeyse düzdür. Düz dağılımda %95 için $k \approx 1{,}65$ yeter; $k = 2$ ise dağılımın sınırlarının dışına taşar, yani beyan ettiğiniz "%95" aslında %100'dür. Bu örnekte hata güvenli tarafta kalıyor, ama raporladığınız güven düzeyi artık hesapladığınız şey değil.

### 4. Etkiler Çarpılıyorsa: Log-normal

MLT toplamlar hakkındadır. Etkiler toplanmak yerine **çarpılıyorsa** (art arda bağlı yükselteç kazançları, bileşik büyüme, kademeli kırılmayla oluşan parçacık boyutları) teorem çarpımın kendisine değil, logaritmasına uygulanır; çünkü çarpımın logaritması, logaritmaların toplamıdır. Sonuç, logaritması normal dağılan, kendisi ise sağa çarpık olan **log-normal dağılımdır**. RF mühendislerinin link bütçesini desibel cinsinden toplamasının ve gölgeleme sönümlemesinin "dB cinsinden normal" kabul edilmesinin arkasında bu vardır.

### 5. Kuyruklarla İlgileniyorsanız: Teorem Merkez Hakkındadır

Bu, pratikte en sık göz ardı edilen sınırdır. Normal yaklaşım dağılımın ortasında çok iyi, kuyruklarında ise göreli olarak çok kötüdür. Bunu, teoremin gömülü yazılımdaki klasik bir kullanımıyla gösterelim.

Elinizde yalnızca düzgün dağılımlı bir rastgele sayı üreteci var ve Gauss gürültüsü üretmek istiyorsunuz; `log`, `sqrt`, `cos` çağıracak işlemci bütçeniz yok. MLT'yi tersinden kullanırsınız: 12 düzgün sayıyı toplayıp 6 çıkarırsınız. Her düzgün sayının ortalaması 1/2, varyansı 1/12 olduğundan toplamın ortalaması 6, varyansı tam olarak 1 olur.

```c
#include <math.h>
#include <stdint.h>
#include <stdio.h>

/* xorshift32: küçük, hızlı, taşınabilir bir düzgün (uniform) üreteç */
static uint32_t durum = 2463534242u;

static uint32_t xorshift32(void)
{
    durum ^= durum << 13;
    durum ^= durum >> 17;
    durum ^= durum << 5;
    return durum;
}

/* [0, 1) aralığında düzgün dağılmış sayı */
static double duzgun(void)
{
    return xorshift32() / 4294967296.0;
}

/* MLT ile yaklaşık N(0, 1): 12 düzgün sayıyı topla, 6 çıkar.
 * Her birinin ortalaması 1/2, varyansı 1/12 olduğundan
 * toplamın ortalaması 6, varyansı tam olarak 1'dir. */
static double gauss12(void)
{
    double toplam = 0.0;
    for (int i = 0; i < 12; i++) {
        toplam += duzgun();
    }
    return toplam - 6.0;
}

int main(void)
{
    const int N = 1000000;
    double s1 = 0.0, s2 = 0.0, en_buyuk = 0.0;
    int ic1 = 0, ic2 = 0, ic3 = 0, dis4 = 0;

    for (int i = 0; i < N; i++) {
        double z = gauss12();
        double a = fabs(z);
        s1 += z;
        s2 += z * z;
        if (a < 1.0) ic1++;
        if (a < 2.0) ic2++;
        if (a < 3.0) ic3++;
        if (a > 4.0) dis4++;
        if (a > en_buyuk) en_buyuk = a;
    }

    double ort = s1 / N;
    printf("ortalama      : %+.4f   (ideal  0)\n", ort);
    printf("varyans       : %.4f    (ideal  1)\n", s2 / N - ort * ort);
    printf("|z| < 1 orani : %.4f    (normal 0.6827)\n", (double)ic1 / N);
    printf("|z| < 2 orani : %.4f    (normal 0.9545)\n", (double)ic2 / N);
    printf("|z| < 3 orani : %.4f    (normal 0.9973)\n", (double)ic3 / N);
    printf("|z| > 4 adedi : %d         (normal ~63)\n", dis4);
    printf("en buyuk |z|  : %.3f     (ust sinir 6)\n", en_buyuk);
    return 0;
}
```

Bir milyon örnekle çıktı:

```text
ortalama      : +0.0002   (ideal  0)
varyans       : 1.0003    (ideal  1)
|z| < 1 orani : 0.6789    (normal 0.6827)
|z| < 2 orani : 0.9554    (normal 0.9545)
|z| < 3 orani : 0.9979    (normal 0.9973)
|z| > 4 adedi : 19         (normal ~63)
en buyuk |z|  : 4.785     (ust sinir 6)
```

Ortalama, varyans ve ±1σ, ±2σ, ±3σ oranları gerçek normal dağılımdan üçüncü ondalıkta ayrışıyor; bir sensör gürültüsü benzetimi için fazlasıyla iyi. Ama 4σ'nın ötesine bakın: gerçek normal dağılım bir milyonda yaklaşık 63 örnek verirdi, bu üreteç 19 veriyor. 6σ'nın ötesinde ise hiçbir zaman, hiçbir örnek üretemez; çünkü 12 sayının toplamı en fazla 12 olabilir. Merkez kusursuz, kuyruk yanlış.

Aynı şey ters yönde de geçerlidir: gerçek veriniz merkezde normale ne kadar iyi uyarsa uysun, bu uyum kuyruklar hakkında bir şey söylemez. Bir büyüklüğün 6σ'yı aşma olasılığını normal eğriden okuyup "milyarda iki" demek, teoremin en zayıf olduğu yerde ona en çok güvenmek demektir. Nadir olayların olasılığı için uç değer kuramı, doğrudan sayım ya da hata ağacı analizi gibi yöntemler gerekir.

---

## Gerçek Hayatta Nerede Kullanılıyor?

### Ölçüm: Ortalama Almak Neden İşe Yarar?

Laboratuvarda aynı gerilimi 16 kez okuyup ortalamasını yazdığınızda yaptığınız şey MLT'nin en çıplak uygulamasıdır: rastgele gürültü $\sqrt{16} = 4$ kat azalır. Belirsizlik bütçesindeki Tip A bileşeni olan $s/\sqrt{n}$ bu formülün ta kendisidir.

Aynı fikir ADC'lerde **aşırı örnekleme** (oversampling) adıyla donanıma gömülüdür: gürültü beyazsa ve en az bir LSB mertebesindeyse, her dört kat fazla örnek ortalamaya bir bit ek çözünürlük kazandırır. 12 bitlik bir ADC'den 256 örnek ortalayarak 16 bitlik çözünürlük elde etmek mümkündür. Bedeli de aynı formülden okunur: her ek bit, örnekleme süresini dört katına çıkarır.

### Gürültünün Kendisi Neden Gauss?

Bir dirençteki termal gürültü, sayısız elektronun birbirinden bağımsız rastgele hareketinin toplamıdır. Tek bir elektronun hareketi normal dağılmaz ama toplamları dağılır. Haberleşme kuramındaki "toplanır beyaz Gauss gürültüsü" (AWGN) modeli ve bit hata oranı formülleri bu yüzden gerçekçidir. Kalman filtresinin Gauss gürültü varsayımının sahada şaşırtıcı ölçüde iyi çalışması da aynı nedene dayanır: sensör hatası çoğu zaman pek çok küçük, bağımsız etkinin toplamıdır.

### Anketler: 1000 Kişi 85 Milyonu Nasıl Temsil Eder?

Bir seçmenin "evet" demesi 0 ya da 1 değerli bir rastgele değişkendir; normal dağılımla uzaktan yakından ilgisi yoktur. Ama $n$ kişinin ortalaması, yani "evet" oranı, yaklaşık normal dağılır ve %95'lik hata payı şu olur:

$$
\pm\, 1{,}96 \sqrt{\frac{p\,(1 - p)}{n}}
$$

$p = 0{,}5$ ve $n = 1000$ için bu ±3,1 puan eder. Formülde ülke nüfusunun hiç yer almadığına dikkat edin: örneklem nüfusa göre küçük olduğu sürece hata payını nüfus değil, örneklem büyüklüğü belirler. Hata payını ±2 puana indirmek için 2401, ±1 puana indirmek için 9604 kişi gerekir; $\sqrt{n}$ yasası burada da acımasızdır. Formülün vermediği garanti ise örneklemin rastgele seçilmiş olmasıdır: yanlı bir örneklemde hata, $n$ büyüdükçe küçülmez.

A/B testleri de aynı matematiğe dayanır. Dönüşüm oranı kullanıcı başına 0/1'dir, ama binlerce kullanıcının ortalaması normal dağıldığı için iki grup arasındaki fark z-testi ya da t-testiyle sınanabilir.

### Kalite Kontrol: Kontrol Kartları

Walter Shewhart'ın 1920'lerde Bell Laboratuvarları'nda geliştirdiği kontrol kartlarında tek tek parçalar değil, 4-5 parçalık alt grupların ortalamaları izlenir. Bunun nedeni MLT'dir: tek parçaların ölçüsü normal dağılmasa bile alt grup ortalamaları normale yakındır ve ±3 standart hata sınırları anlam kazanır. Süreç kontrol altındayken bir noktanın bu sınırların dışına düşme olasılığı yaklaşık %0,27'dir; yani dışarı düşen nokta büyük olasılıkla gerçek bir değişikliğin işaretidir.

### Tolerans Analizi

On parçadan oluşan bir montajda her parçanın toleransı ±0,1 mm olsun. En kötü durum hesabı toplam ±1,0 mm verir, ama bu on parçanın hepsinin aynı anda aynı yönde sınırda olmasını gerektirir. Hatalar bağımsızsa toplam yaklaşık normal dağılır ve karekök-kareler-toplamı $\sqrt{10} \times 0{,}1 \approx 0{,}32$ mm eder. Seri üretimde tasarımların en kötü duruma göre değil buna göre yapılabilmesi, ciddi bir maliyet farkıdır. Varsayım yine bağımsızlıktır: bütün parçalar aynı aşınmış kalıptan çıkıyorsa hatalar aynı yöne kayar ve hesap çöker.

### Monte Carlo Benzetimi

Bir integrali ya da bir sistemin başarısızlık olasılığını rastgele örneklerle tahmin ettiğinizde, tahmininiz $N$ örneğin ortalamasıdır. MLT iki şey söyler: hata $1/\sqrt{N}$ hızıyla küçülür ve bu hız problemin boyutundan bağımsızdır. Yüksek boyutlu problemlerde Monte Carlo'nun rakipsiz olmasının nedeni budur. Aynı teorem, sonucun yanına yazılan güven aralığını da verir. Kötü haber de aynı formüldedir: bir ondalık basamak daha kazanmak yüz kat fazla örnek ister.

### Sigorta ve Risk Havuzu

Tek bir poliçenin hasarı öngörülemez. Ama birbirinden bağımsız $n$ poliçenin toplam hasarında beklenen değer $n$ ile, belirsizlik ise $\sqrt{n}$ ile büyür; göreli belirsizlik $1/\sqrt{n}$ ile küçülür. Sigortacılığı mümkün kılan budur. Sınırı da yine bağımsızlık koşulundadır: depremde ya da salgında hasarlar bağımsız olmaktan çıkar, havuz işlemez; reasürans tam bu yüzden vardır.

### Yazılım: Performans Ölçümü

Bir fonksiyonun çalışma süresi sağa çarpık, kalın kuyruklu bir dağılıma sahiptir: çoğu çağrı hızlıdır, arada bir önbellek ıskası ya da bağlam değişimi araya girer. Karşılaştırma (benchmark) araçlarının raporladığı "ortalama ± güven aralığı" MLT'ye dayanır ve önceki bölümdeki uyarı burada da geçerlidir: çarpık süre dağılımlarında az sayıda tekrarla kurulan aralık fazla iyimserdir. Ayrıca p99 gibi kuyruk ölçüleri ortalama değildir; onlar için MLT'nin ortalama hakkındaki güvencesi işlemez.

### Özet

| Alan | Toplanan ya da ortalanan şey | MLT'nin sağladığı |
|---|---|---|
| Metroloji | Tekrarlı ölçümler | Standart hata $s/\sqrt{n}$; $k = 2$ için yaklaşık %95 |
| ADC ve sinyal işleme | Ardışık örnekler | Her 4 kat örnek için 1 bit; Gauss gürültü modeli |
| Anket, A/B testi | 0/1 yanıtlar | Hata payı $\pm 1{,}96\sqrt{p(1-p)/n}$ |
| Kalite kontrol | Alt grup ortalamaları | ±3σ kontrol sınırları |
| Tolerans analizi | Parça hataları | En kötü durum yerine karekök-kareler-toplamı |
| Monte Carlo | Benzetim çıktıları | Boyuttan bağımsız $1/\sqrt{N}$ hata ve güven aralığı |
| Sigorta | Poliçe hasarları | Göreli belirsizliğin $1/\sqrt{n}$ ile küçülmesi |

---

## Normal Yaklaşıma Güvenmeden Önce

Bütün bu uyarıları tek bir akışta toplarsak, bir veri kümesinin ortalaması için normal yaklaşım kullanmadan önce sorulacak sorular şunlardır:

<div class="mermaid">
flowchart TD
    A{"Örnekler bağımsız mı?"}
    B{"Kalın kuyruk ya da dev aykırı değerler var mı?"}
    C{"Sorunuz ortalama hakkında mı, uç değer hakkında mı?"}
    D{"Dağılım belirgin biçimde çarpık mı?"}
    R1["Etkin örnek sayısını hesaplayın ya da blok ortalaması alın"]
    R2["Medyan gibi dayanıklı ölçüler ya da logaritma dönüşümü kullanın"]
    R3["Normal kuyruğa güvenmeyin: uç değer kuramı ya da doğrudan sayım"]
    R4["Örnek sayısını artırın ya da bootstrap ile aralık kurun"]
    R5["Normal yaklaşım güvenle kullanılabilir"]
    A -->|Hayır| R1
    A -->|Evet| B
    B -->|Evet| R2
    B -->|Hayır| C
    C -->|Uç değer| R3
    C -->|Ortalama| D
    D -->|Evet| R4
    D -->|Hayır| R5
</div>

Bu soruların hiçbiri formülle yanıtlanmaz; hepsi veriye bakmayı gerektirir. Histogramı çizmek, ardışık örnekler arasındaki korelasyona bakmak ve en büyük birkaç değerin toplamın ne kadarını oluşturduğunu kontrol etmek, çoğu zaman beş dakikalık bir iştir ve yanlış bir güven aralığından çok daha ucuzdur.

---

## Sonuç

Merkezi Limit Teoremi'nin gücü, ne kadar az şey istediğinden gelir. Kaynağın dağılımını bilmenize gerek yoktur; ortalamasını ve standart sapmasını bilmeniz yeter. Etkiler bağımsızsa, hiçbiri tek başına baskın değilse ve varyans sonluysa, toplamları çan eğrisine yaklaşır. Doğada ve mühendislikte bu kadar çok büyüklüğün normal dağılması bir tesadüf ya da bir kolaylık varsayımı değil, bu büyüklüklerin pek çok küçük etkinin toplamı olmasının sonucudur.

Teoremin pratik mirası tek bir ifadede toplanır: $\sigma/\sqrt{n}$. Ortalama almanın neden işe yaradığını, ne kadar işe yaradığını ve neden giderek pahalılaştığını aynı ifade söyler. Dört kat veri yarı belirsizlik demektir; ne daha fazlası ne daha azı.

Sınırları da en az gücü kadar önemlidir. Teorem ortalamalar hakkındadır, tek tek değerler hakkında değil. Merkez hakkındadır, kuyruklar hakkında değil. Rastgele ve bağımsız hatalar hakkındadır, sistematik hatalar hakkında değil. Ve sonsuzdaki bir limit hakkındadır; elinizdeki 30 örneğin o limite ne kadar yakın olduğunu size teorem değil, veriniz söyler.

---

**Kaynaklar:**

- Hans Fischer — [*A History of the Central Limit Theorem: From Classical to Modern Probability Theory*](https://doi.org/10.1007/978-0-387-87857-7), Springer, 2011. (De Moivre'dan Feller'e teoremin ayrıntılı tarihi.)
- Lucien Le Cam — ["The Central Limit Theorem Around 1935"](https://doi.org/10.1214/ss/1177013818), Statistical Science, Cilt 1, Sayı 1, 1986. (Pólya'nın adlandırması ve Lindeberg–Feller–Lévy dönemi.)
- S. L. Zabell — "Alan Turing and the Central Limit Theorem", The American Mathematical Monthly, Cilt 102, Sayı 6, 1995, s. 483–494. (Turing'in 1934 tarihli tezi.)
- Irina Shevtsova — ["On the absolute constants in the Berry–Esseen type inequalities for identically distributed summands"](https://arxiv.org/abs/1111.6554), arXiv:1111.6554, 2011. (Berry–Esseen sabiti için 0,4748 üst sınırı.)
- JCGM 100:2008 — [*Evaluation of measurement data — Guide to the expression of uncertainty in measurement (GUM)*](https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf), Ek G.2: "Central Limit Theorem". (Kapsama çarpanı $k$'nın gerekçesi.)
- Silicon Labs — [AN118: *Improving ADC Resolution by Oversampling and Averaging*](https://www.silabs.com/documents/public/application-notes/an118.pdf). (Her ek bit için dört kat aşırı örnekleme kuralı ve koşulları.)
- NIST/SEMATECH — [*e-Handbook of Statistical Methods*](https://www.itl.nist.gov/div898/handbook/). (Güven aralıkları, kontrol kartları ve dağılımlar için başvuru kaynağı.)
- Francis Galton — *Natural Inheritance*, Macmillan, 1889. (Bilyeli tahta ve "hata frekansı yasası" üzerine ünlü pasaj.)
- 3Blue1Brown — ["But what is the Central Limit Theorem?"](https://www.youtube.com/watch?v=zeJD6dqJ5lo). (Teoremin görsel anlatımı.)

<script src="{{ '/assets/js/posts/merkezi-limit-teoremi.js' | relative_url }}"></script>

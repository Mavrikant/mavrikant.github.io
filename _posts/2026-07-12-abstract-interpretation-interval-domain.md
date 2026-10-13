---
title: "Abstract Interpretation Pratikte: Interval Domain Neyi Kanıtlar, Neyi Kanıtlamaz?"
subtitle: "Abstract Interpretation in Practice: What an Interval-Based Sound Analyzer Can and Cannot Prove"
background: "/img/posts/5.webp"
date: '2026-07-12 09:00:00'
layout: post
lang: tr
categories: [yazilim]
tags: [emniyet-kritik, statik-analiz, formel-yontemler]
---

DO-178C DAL A tarafında çalışan biri olarak Polyspace, Astrée veya TrustInSoft gibi
araçların adını duymayan yoktur. Bu araçların ortak markası hep aynı cümledir:
*"runtime error yokluğunu ispatlar"*. Aslında bu cümlenin ardında dört on yıl önce
Grenoble'da doğmuş matematik ağır bir teori yatar: **abstract interpretation**.
İşin ilginç yanı — bu teori Türkçe kaynaklarda neredeyse hiç anlatılmamış. Blog
kayıtlarında en fazla "Polyspace kullanın" tarzı satırlar bulursunuz; oysa asıl soru
şudur: bu araç *neyi ispatlar, ne zaman yanılır, ne kadarına güvenmelidir?*

Bu yazının derdi tam olarak bu. Önce Rice teoreminin bize neden statik analizde bir
duvar çizdiğini, Cousot çiftinin bu duvarın etrafından nasıl dolaştığını göreceğiz.
Sonra en basit soyut alan olan **interval domain** üzerinden küçük bir C fonksiyonunu
el ile analiz edip, her program noktasında hesaplanan abstract state'i,
loop'ta neden **widening** gerektiğini ve interval domain'in tıkandığı somut bir
false alarm örneğini adım adım işleyeceğiz. Son olarak Astrée'nin A340/A380 fly-by-wire
yazılımında yanlış alarmı nasıl sıfıra indirdiğine ve DO-178C DAL A gözünden sound
analyzer'ın kanıt değerine bakacağız.

---

## Neden buradayız? Test ile ispat aynı şey değildir

Emniyet kritik yazılımda hedefimiz "her koşulda çalışır" kanıtıdır. DAL A için
DO-178C Tablo A-7 Objective 5, yapısal kapsamayı **MC/DC** seviyesine kadar
zorunlu tutar; ama kapsama testin sadece **hangi kodun çalıştığını** garanti eder.
Kapsanmış bir kod bloğunun her olası girdi için de doğru davrandığını göstermez.

Somutlaştırayım. Şu C kodunu düşünün:

```c
int normalize(int a, int b) {
    return a / (b - a);
}
```

Bu fonksiyon için bir test seti (a=1, b=2), (a=0, b=1), (a=-5, b=5) diyerek MC/DC
kapsamasını rahatlıkla %100'e getirebilirsiniz. Testler yeşil, coverage yeşil. Ama
`a==b` girdisinde `b - a = 0` olur ve fonksiyon çöker. Test **hiçbir zaman** bu
girdiyi denemez, çünkü sonsuz girdi uzayının sadece bir kesitine bakabilir. Bu
tuzağı yakalayabilmenin yolu, tek tek girdileri test etmek değil, kodun **tüm olası
davranışını matematiksel olarak** karakterize etmektir.

Buraya kadar iyi. Peki, tüm olası davranışı matematiksel olarak karakterize etmek
mümkün mü?

---

## Rice teoreminin duvarı

1953'te Henry Gordon Rice şunu ispatladı: bir programın **non-trivial semantik
özelliği** (yani programın gerçek davranışıyla ilgili, syntax ile ilgili olmayan bir
özellik) **karar verilemezdir**. "Bu program bir noktada divide-by-zero yapar mı?",
"Bu program sonlu adımda durur mu?", "Bu program X çıktısını verir mi?" — hepsi
karar verilemez.

Bu, teorik olarak *hiçbir statik analizin* şu iki koşulu **aynı anda** sağlayamayacağı
anlamına gelir:

- **Sound**: "Analiz `RTE yok` derse, gerçekten RTE yoktur." (false negative yok)
- **Complete**: "Analiz `RTE var` derse, gerçekten vardır." (false positive yok)

İkisini birden isterseniz Rice teoremi masaya bir taş koyar. Pratikte hangisinden
vazgeçilir? Emniyet kritik dünyada cevap her zaman **completeness**'tan
vazgeçmektir. Sound bir analiz "hiç RTE yok" derse buna güvenirsiniz; ara sıra
gereksiz alarm üretmesine tahammül edersiniz. Tersi kabul edilemez: RTE yokluğunu
söylediğinde yanılıyorsa, DAL A yazılımınıza rahatça imza atmışsınız demektir.

Bu, MISRA C ile karışan tam nokta: MISRA C daha çok bir *kod stil kurallar seti*dir.
Polyspace Bug Finder gibi araçlar, MISRA uyum kontrolü yapar ama davranış ispatı
sunmaz; **sound** değildir. Polyspace **Code Prover**, Astrée ve TrustInSoft ise
abstract interpretation üzerinden davranış ispatı sunar; **sound**tur.

---

## Abstract interpretation: eksik ama güvenli bir yorum

Patrick ve Radhia Cousot'nun 1977 POPL makalesi *("Abstract Interpretation: A Unified
Lattice Model...")* Rice'ın duvarını dolaşmanın matematiksel çerçevesini kurar.
Fikir çarpıcı basitliktedir: **program semantiğini eksik ama güvenli biçimde soyutla.**

- **Concrete semantics**: Her değişkenin gerçek değerler kümesini takip et.
  Meselâ program noktası $\ell$'de `x`'in olası değerleri $\{-3, 0, 7, 42, \ldots\}$.
  Bu küme sonsuz olabilir; ölçmek imkânsız.
- **Abstract semantics**: Bu kümeyi bir *soyut değer* ile temsil et. Örneğin
  $x \in \{-3, 0, 7, 42\}$ yerine sadece $x \in [-3, 42]$ intervalini sakla.

Abstract semantics her zaman concrete semantics'i **kapsar** (over-approximation):
gerçek olası değerler kümesi $C$ ise, abstract temsil $\gamma(A) \supseteq C$'dir.
Bu tek başına *soundness*'un mühendislik tercümesidir: aracın "olabilir" dediği her
şey içine gerçek olabilecekleri de alır; "olamaz" dediği şey gerçekten de olmaz.

Bunun bedeli hemen görülür: `x = 0` yoluyla oluşan concrete küme $\{0\}$ iken
interval $[-3, 42]$ olarak temsil edildiği için, sıfıra bölme koşulunu kontrol
ederken analiz *tekrar tekrar* "x sıfır olabilir" diyecektir. Yani soundness elde
etmek için completeness'tan vazgeçtik; abstract analiz **false positive**
(yanlış alarm) üretir. Rice'ın duvarı burada var.

Cousotların 1977 makalesindeki teknik zarafet, bu soyutlamanın **lattice teorisi**
üzerine bir Galois bağlantısı ile inşa edilmesinde ve döngü noktalarındaki fixpoint
hesaplamasının **her zaman sonlu adımda** durdurulabilmesi için gerekli olan
matematiksel altyapının kurulmasındadır. Bunu bir sonraki bölümde interval domain
üzerinden somutlaştıralım.

---

## Interval domain: en basit soyut alan

Interval domain, her tamsayı değişkeni için bir alt sınır $\ell$ ve üst sınır $u$
saklar; değişkenin abstract değeri $[\ell, u]$'dur. $\ell$ ve $u$ genişletilmiş
tamsayılardır ($\ell \in \mathbb{Z} \cup \{-\infty\}$, $u \in \mathbb{Z} \cup \{+\infty\}$).

Temel operatörler:

- **Meet** ($\sqcap$, kesişim, `if` şubesinde bilgi ekleme):
  $[a, b] \sqcap [c, d] = [\max(a,c),\ \min(b,d)]$
- **Join** ($\sqcup$, birleşim, iki kontrol akışının birleştiği yerde):
  $[a, b] \sqcup [c, d] = [\min(a,c),\ \max(b,d)]$
- **Transfer function** (assignment sonrası):
  `x = y + 1` deyimi için $[\ell_x', u_x'] = [\ell_y + 1,\ u_y + 1]$
- **Guard**: `if (x < 10)` şubesinin **then** dalında $x \sqcap [-\infty, 9]$;
  **else** dalında $x \sqcap [10, +\infty]$.

Şimdi bir örnek üzerinden gidelim. Aşağıdaki fonksiyonu satır satır yorumlayacağız:

```c
int f(int input) {
    int x = 0;                  // L1
    int y;
    if (input > 5) {            // L2
        y = 10;                  // L3
    } else {
        y = 20;                  // L4
    }
    while (x < y) {             // L5 (loop head)
        x = x + 1;               // L6
    }
    return 100 / (x + y);       // L7
}
```

Soru: L7'de `x + y` sıfır olabilir mi? Yani divide-by-zero var mı? Elle çıkalım.

**L1'den sonra**: $x = [0, 0]$, $y = \top$ (bilinmiyor, $[-\infty, +\infty]$).
**L2**'de dallanma. `input`'un aralığı bilinmediği için her iki dal da geçilebilir.

**L3'ten sonra (then dalı)**: $x = [0, 0]$, $y = [10, 10]$.
**L4'ten sonra (else dalı)**: $x = [0, 0]$, $y = [20, 20]$.

**L5'e girişte** iki dal birleşir (join):
$$y_{L5} = [10, 10] \sqcup [20, 20] = [10, 20]$$
$$x_{L5} = [0, 0]$$

Şimdi loop. Loop head'de tuttuğumuz durum $X = (x, y)$ olsun; iteratif olarak
fixpoint arayacağız. `x < y` guard'ının then dalı için interval domain'in
uygulayabildiği yaklaşım $x' \sqcap [-\infty,\ y_{\max}-1]$'dir (üst sınır kesme).

- **$X_0$ (girişte)**: $x = [0, 0]$, $y = [10, 20]$.
- **$X_1$**: guard `x < y` → $x = [0, 0] \sqcap [-\infty, 19] = [0, 0]$. Body
  `x = x+1` → $x = [1, 1]$. Loop head'e dönüş, join: $[0, 0] \sqcup [1, 1] = [0, 1]$.
- **$X_2$**: guard → $x = [0, 1]$; body → $x = [1, 2]$; join → $[0, 2]$.
- **$X_3$**: guard → $x = [0, 2]$; body → $x = [1, 3]$; join → $[0, 3]$.
- $\ldots$

Fark edeceğiniz gibi $x$'in üst sınırı her iterasyonda 1 artıyor. Bu ardışıklık
$X_{20} = ([0, 20],\ [10, 20])$'de duracak; $X_{20}$'de guard $x \sqcap [-\infty, 19]
= [0, 19]$, body $[1, 20]$, join $[0, 20]$ → fixpoint. Ama bu, 20 iterasyon
demek. Programın gerçek sabitleri (10, 20 gibi) küçük olduğu için hâlâ sonlu
adımda bittik.

Şimdi minik bir değişiklik yapalım — döngü sınırını bilinmeyen bir `input`'a çevirin:

```c
while (x < input) {
    x = x + 1;
}
```

`input` interval'i $\top = [-\infty, +\infty]$. İterasyonlar:

- $X_0$: $x = [0, 0]$
- $X_1$: guard $[-\infty, +\infty - 1] = [-\infty, +\infty]$; body $x = [1, 1]$; join $[0, 1]$
- $X_2$: guard $[0, 1]$; body $[1, 2]$; join $[0, 2]$
- $X_3$: $[0, 3]$
- $X_4$: $[0, 4]$
- $\ldots$

Bu ardışıklık **hiçbir zaman durmaz**; $\omega$ adımda $[0, +\infty]$'a ulaşır.
Statik analiz bunu bekleyemez. İşte tam burada Cousotların *widening operator*
($\nabla$) devreye girer.

---

## Widening: sonsuz zinciri sonlu adımda kesme

Widening $\nabla$, iki abstract değeri alır ve yeni bir abstract değer üretir; hem
"eskisini kapsar" hem de "sonsuz artan zinciri sonlu adımda tıkar":

$$
[a, b] \nabla [c, d] =
\begin{cases}
[a', b'] & \text{normal join} \\
a' = a & \text{eğer } c \geq a \\
a' = -\infty & \text{eğer } c < a \\
b' = b & \text{eğer } d \leq b \\
b' = +\infty & \text{eğer } d > b
\end{cases}
$$

Türkçesi: alt sınır aşağıya inmeye başladıysa −∞'a atlat; üst sınır yukarıya çıkmaya
başladıysa +∞'a atlat.

Yukarıdaki döngüye uygularsak:

- $X_0 = [0, 0]$
- $X_1$'e giden join: $[0, 0] \sqcup [1, 1] = [0, 1]$. Widening: $[0, 0] \nabla [0, 1]$;
  üst sınır arttı → $b' = +\infty$. Sonuç $[0, +\infty]$.
- $X_2$: guard $x < input$ ile then dalı: $x \sqcap [-\infty, +\infty - 1] = [0, +\infty]$.
  Body $x = [1, +\infty]$. Join: $[0, +\infty]$. Fixpoint.

Bir iterasyonda bittik. Fakat üst sınırı $+\infty$'a atladığımız için `x`'in
`input`'tan küçük kaldığı bilgisini kaybettik. **Narrowing** ($\Delta$) operatörü
bu kaybı bir ölçüde geri kazandırır: fixpoint'in sağladığı denklemleri tekrar
uygulayarak sınırları sıkılaştırır. Yine de widening/narrowing çiftinin verdiği
sonuç her zaman gerçek concrete semantics kadar dar olmaz; bu yapısal bir bilgi
kaybıdır.

Widening'in bir başka pratik varyantı **widening with thresholds** (ya da
"up-to widening") tekniğidir: doğrudan $+\infty$'a atlamak yerine, programda geçen
literal sabitlerin (kullanıcı da ekleyebilir) bir listesine bakılır ve mevcut üst
sınırdan büyük en yakın literal seçilir. Bu, Astrée'nin uygulama alanlarında sıkça
kullandığı bir hile — filtre çıkış aralıklarında yakınsamayı hızlandırır.

---

## Interval domain'in tıkandığı yer: relational bilgi kaybı

Şimdi ilginç kısım. Aşağıdaki kod fragmentine bakın:

```c
void g(int x, int y) {
    // x ve y bilinmiyor
    if (x == y) {
        int z = 100 / (x - y);   // L*
    }
}
```

L* satırında insan gözü der ki "x == y ⇒ x - y = 0, o hâlde burada kesin sıfıra
bölme var". Ama interval domain'in verdiği tanıya bakalım.

Analiz başlangıçta $x = \top$, $y = \top$. `if (x == y)` guard'ı then dalında ne yapar?
Interval domain'in *yapabildiği* şey her değişkeni ayrı bir aralıkla temsil etmektir;
"iki değişken birbirine eşit" ilişkisini **saklayamaz**. Guard'ın yapabildiği en
iyisi $x \sqcap y = \top \sqcap \top = \top$ ve bunu her iki değişkene atamaktır;
yani hiçbir bilgi kazanılmaz.

Sonra L* satırında `x - y` hesaplanır. Interval domain'de:
$$
[a, b] - [c, d] = [a - d,\ b - c]
$$
$\top - \top = [-\infty, +\infty]$. Bu aralık 0'ı içerdiği için Polyspace Code Prover
size **turuncu bir alarm** verecektir: "possible division by zero, L*".

Bu aslında gerçek bir bug — concrete semantics'te `x - y == 0` her zaman doğrudur —
ama araç bunu **kesin** olarak (kırmızı) bildirebilecek precision'a sahip değil;
"olabilir" seviyesinde (turuncu) kalır. Yani soundness ihlali yok, sadece precision
düşüklüğü. Ayrıca sound analyzer'ın raporunda **turuncu** işareti "ya gerçek bug ya
false alarm" karışımı bir yığındır ve her birini elle incelemek gerekir.

Daha ilginç bir örnek:

```c
void h(int a, int b) {
    if (a == b) {
        int t = a + 1;
        int u = b - 1;
        int diff = t - u;        // gerçekte hep 2
        int z = 100 / (diff - 2); // L**
    }
}
```

L**'de `diff - 2` gerçek dünyada her zaman 0'dır — o hâlde bu **kesin RTE**tir.
Interval domain bunu göremez: `diff` için hesaplanan aralık $[-\infty, +\infty]$
olacaktır ve Code Prover buna da turuncu alarm çıkacaktır.

Şimdi kritik örneği verelim — **gerçek false positive**:

```c
void k(int x, int y) {
    if (x == y) {
        if (x != 0) {
            int z = 100 / (x - y + x);   // L***
        }
    }
}
```

Concrete semantics: `x == y` ve `x != 0` ⇒ `x - y + x = 0 + x = x ≠ 0`. Yani L***
kesinlikle güvenlidir. Interval domain'in tanısı: iç `if`'ten sonra $x \sqcap$
`( x!=0 sonrası)`. Interval domain, `[a, b]` tipinde tek bir aralıkla ayrık kümeyi
temsil edemez; `x != 0` guard'ı `x`'i olsa olsa $[-\infty, -1] \cup [1, +\infty]$
yaparak yeni bir bilgi katardı, ama interval bunu **tek aralık** olarak
üst-yaklaştırıp $\top$ tutar. Ardından $x - y + x = \top - \top + \top = \top$ ve
Code Prover yine turuncu alarm verir.

Bu *gerçekten* false positive. Kod güvenli; analiz alarm veriyor. İşte Rice
teoreminin faturası.

---

## Interval'in ötesinde: octagon ve polyhedra

Interval'in temel eksiği **relational** bilgi tutamamasıdır: "x ile y arasında ne
ilişki var?" sorusuna cevap veremez. Bu boşluğu doldurmak için Antoine Miné'nin
2001'de tanıttığı **octagon domain** klasik cevaptır. Octagon şu biçimdeki
kısıtları temsil eder:

$$\pm X \pm Y \leq c$$

Yani `x - y ≤ 5`, `x + y ≤ 100`, `-x ≤ 3` gibi bağlantıları saklayabilir. `x == y`
guard'ı, octagon'da $x - y \leq 0 \wedge y - x \leq 0$ olarak ifade edilir; iç
kısımdaki `x - y` hesaplaması artık $[0, 0]$ verir ve sıfıra bölme durumu somut
biçimde tespit edilir.

Octagon'un maliyeti nedir? Her abstract element bir *Difference Bound Matrix* (DBM)
olarak saklanır: her $\pm X \pm Y$ çifti için bir kayıt. $n$ değişkene karşı
$O(n^2)$ bellek ve normalizasyon (shortest-path closure) için $O(n^3)$ zaman.
Interval'in $O(n)$ bellek/$O(n)$ zaman karmaşıklığı ile karşılaştırın. Yüz binlerce
satır kodu analiz eden bir araç için bu farklar büyük.

Bir sonraki adım **polyhedra domain**'dir (Halbwachs ve Cousot, 1978): her doğrusal
kısıtı temsil eder ($a_1 X_1 + a_2 X_2 + \ldots \leq c$). Ekonomisi çok pahalıdır
(gerçek uygulamalarda üstel patlama). Astrée gibi endüstriyel araçlar bu yüzden
polyhedra'yı sistem geneline değil, sadece **problemli olduğu tespit edilen** kod
parçalarına yerel olarak uygular.

Astrée'nin ilginç yanı — sadece geometrik domain'ler değil, **filter domain**'ler de
kullanır. Havacılıkta dijital filtreler (IIR alçak-geçiren, notch filtreleri) çok
yaygındır ve bunların çıkış aralığını interval veya octagon ile kanıtlamak imkânsıza
yakındır. Çünkü filtre çıkışı formal olarak
$$y_n = \sum a_k x_{n-k} - \sum b_k y_{n-k}$$
gibi bir geri beslemedir; interval domain'de $y$ ergen olur ve $\pm\infty$'a firar
eder. Astrée, filtrenin transfer fonksiyonunu analiz edip **exponential decay**
davranışını temsil eden özel bir domain kullanır ve stabil bir aralık elde eder.
Bu, Airbus fly-by-wire yazılımında yanlış alarmı sıfıra indirmenin temel
sebeplerinden biridir.

---

## Sound analyzer bir DAL A projesine ne kazandırır?

DO-178C DAL A için Tablo A-7 (Verification of Verification Process Results)
yapısal kapsama, veri/kontrol coupling ve requirements-based test kapsama
objective'lerini listeler. Fakat **hiçbir yerinde** aracın "absence of runtime
errors" ispatını doğrudan zorunlu tutmaz. Yani sound analyzer kullanmak bir
DO-178C **zorunluluğu** değildir; peki niye kullanılıyor?

Cevap: Tablo A-6 (Testing of Outputs of Integration Process) ve A-7 içindeki
bir kısım objective'in verification maliyetini düşürmek için, **DO-333 (Formal
Methods Supplement)** çerçevesi altında verilir. DO-333, formel yöntem kullanan
projeler için bu objective'lerden bazılarının formel argümanla karşılanabileceğini
söyler. Astrée / Polyspace Code Prover ile "absence of runtime errors" ispatı
sunulursa, klasik testlerin bir kısmı bu argümanla değiştirilebilir. Airbus'ün
A340/A380 fly-by-wire yazılımında bu yolu izlediği Blanchet, Cousot ve Miné'nin
PLDI 2003 makalesinde belgelenmiştir.

Bir başka pratik boyut da **DO-330 Tool Qualification** meselesidir. DO-330,
araçları üç kritere göre sınıflandırır: Criteria 1 (development tool), Criteria 2
(verification tool — çıktısı bir doğrulama aktivitesini eleyip/azaltmakta
kullanılır) ve Criteria 3 (verification tool — sadece diğer doğrulamayı
tamamlayıcı). DAL A için Criteria 2 aracı **TQL-4**, Criteria 3 aracı **TQL-5**
seviyesinde nitelendirilir. Sound analyzer'ı DO-333 kapsamında bir test
aktivitesini eleyecek şekilde kullanıyorsanız, aracın TQL-4 nitelendirmesine
ihtiyacınız vardır. AbsInt ve MathWorks bu qualification kitlerini ticari olarak
sunar. Ne lisans ne qualification pack ucuzdur; karşılığında bir sınıf test
aktivitesi ortadan kalkabilir.

---

## Pratik tavsiyeler ve tuzaklar

**Sound araç ≠ complete araç.** Polyspace Bug Finder ile Polyspace Code Prover'ı
karıştırmayın. Bug Finder, sound olmayan bir bug tarayıcıdır — hızlı, çok bulur,
ama kaçırdıkları da olur. Code Prover, sound abstract interpretation kullanır —
yavaş, çok yanlış alarm üretir, ama "yeşil" dediği kod parçası gerçekten
güvenlidir. DAL A verification kredisi için Code Prover (veya muadili) gerekir.

**Turuncu (unproven) alarmı otomatik "buglar" listesine atmayın.** Sound analyzer
üç renk üretir: kırmızı (kesin RTE), yeşil (kesin güvenli), turuncu (kanıt
sunulamıyor). Turuncu alarmlarının çoğu false positive'dir; her birini incelemek
maliyetli olsa da atlanamaz. Astrée'nin A380 kodundaki yanlış alarm sayısını
sıfıra indirmesi bir sihir değil, uygun domain seçimlerinin ve kullanıcı
tanımlı widening threshold'larının sonucudur.

**Domain zenginliğini gerektiği kadar kullanın.** Bütün analizi polyhedra ile
yapmaya kalkarsanız araç sonlanmaz veya çok geç sonlanır. Interval + octagon
kombinasyonu çoğu emniyet kritik kod için yeterlidir; polyhedra'yı yalnızca
tıkandığı yerlerde selektif olarak açın (Astrée'nin arayüzünde bu için "hint"
mekanizması vardır).

**Kısıtlamaları tanıyın.** Abstract interpretation dinamik bellek tahsisi (malloc),
rekürsif veri yapıları ve dinamik fonksiyon çağrıları (function pointer tablo
üzerinden dispatch) karşısında zayıflar. Aviyonik yazılımlar zaten bu yapılardan
kaçındığı için (MISRA C bunları büyük ölçüde yasaklar) sound analiz doğal
partneridir. Ama tipik bir Linux uygulamasına Polyspace Code Prover doğrultmak
büyük olasılıkla saatlerce süren analize karşılık kullanılamaz bir raporla
sonlanır.

**Widening threshold'larını ayarlayın.** Filtreler, çarpma-toplama kümeleşen döngüler
ve durum makineleri, standart widening ile kısa sürede $\pm\infty$'a firar eder.
Ürünlerin çoğu kullanıcıya threshold listesi tanımlamayı öneriyor; ihmal ederseniz
alarm sayınız 10 kat artar.

---

## Ne öğrendik?

Rice teoremi bize statik analizde bir duvar çekiyor: sound + complete + terminating
üçlüsünü aynı anda alamazsınız. Emniyet kritik dünyada mecburen completeness'tan
vazgeçilir; false positive'e katlanırsınız. Abstract interpretation, Cousotların 1977
POPL makalesinde formalize ettiği çerçeveyle, concrete semantics'i lattice teorisi
üzerinden eksik ama güvenli biçimde soyutlar; interval, octagon, polyhedra ve özel
domain'ler (filtre, congruence, trace partitioning) bu soyutlamanın farklı
titrleridir.

Interval domain'in temel eksiği — relational bilgi tutamaması — pratikte 
gerçek kodda sık false alarm'a yol açar. Octagon bu boşluğu doldurur; polyhedra
daha da doldurur ama pahalıdır. Endüstriyel araçlar (Astrée, Polyspace Code Prover,
TrustInSoft) bu domain'leri karışık kullanır ve *widening/narrowing* mekanizmasıyla
sonsuz döngü sorunundan kurtulur.

DAL A tarafında sound analyzer kullanmak DO-178C zorunluluğu değil, DO-333 ile
verification kredisi almanın bir yoludur. Bedeli ciddidir ama karşılığında
"bu kod hiçbir girdi için crash etmez" kanıtını elinize alırsınız; bu kanıt,
sonsuz test ile bile ulaşılamayacak bir güvence sunar.

Sonraki adım — merak edenler için — Astrée'nin filtre domain'i, Miné'nin
octagon makalesindeki DBM detayları, ve Cousotların 1977 makalesinin
soyutlama-fixpoint teorisi. Ayrıca Frama-C'nin EVA plugin'i (Evolved Value Analysis)
açık kaynak bir alternatif olarak denemeye değer; endüstriyel kalitede olmasa da
teoriyi somutlaştırmak için mükemmeldir.

---

## Kaynaklar

- Patrick Cousot, Radhia Cousot, *"Abstract Interpretation: A Unified Lattice Model
  for Static Analysis of Programs by Construction or Approximation of Fixpoints"*,
  Proc. 4th ACM Symp. on Principles of Programming Languages (POPL), Los Angeles,
  1977, pp. 238-252. [DOI 10.1145/512950.512973](https://dl.acm.org/doi/10.1145/512950.512973)
- Antoine Miné, *"The Octagon Abstract Domain"*, Higher-Order and Symbolic
  Computation, 19(1):31-100, 2006. [PDF](https://perso.lip6.fr/Antoine.Mine/publi/article-mine-HOSC06.pdf)
- Bruno Blanchet, Patrick Cousot, Radhia Cousot, Jérôme Feret, Laurent Mauborgne,
  Antoine Miné, David Monniaux, Xavier Rival, *"A Static Analyzer for Large
  Safety-Critical Software"*, PLDI 2003. [PDF](https://arxiv.org/pdf/cs/0701193)
- Patrick Cousot, *"A Personal Historical Perspective on Abstract Interpretation"*,
  FSP 2024. [PDF](https://cs.nyu.edu/~pcousot/publications.www/Cousot-FSP-2024.pdf)
- The Astrée Static Analyzer — resmi INRIA/ENS sayfası. <https://www.astree.ens.fr/>
- AbsInt Astrée ürün sayfası. <https://www.absint.com/astree/index.htm>
- MathWorks Polyspace Code Prover ürün sayfası.
  <https://www.mathworks.com/products/polyspace-code-prover.html>
- Xavier Rival, Kwangkeun Yi, *Introduction to Static Analysis: An Abstract
  Interpretation Perspective*, MIT Press, 2020.
- Michael I. Schwartzbach, *"Lecture Notes on Static Analysis"*, University of
  Aarhus. [PDF](https://lara.epfl.ch/w/_media/sav08:schwartzbach.pdf)
- Rice, H. G., *"Classes of recursively enumerable sets and their decision
  problems"*, Transactions of the American Mathematical Society, 74(2), 1953.
- RTCA/EUROCAE, *"DO-333/ED-216 — Formal Methods Supplement to DO-178C and DO-278A"*,
  2011.

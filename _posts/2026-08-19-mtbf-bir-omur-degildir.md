---
title: "MTBF Bir Ömür Değildir: 10⁻⁹ Hedefinin Aritmetiği"
subtitle: "MTBF Is Not a Lifetime: The Arithmetic Behind the 10⁻⁹ Objective"
background: "/img/posts/2.webp"
date: '2026-08-19 12:00:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [emniyet-kritik, sistem-muhendisligi]
---

Bir tedarikçi datasheet'inde "MTBF: 250.000 saat" satırını gördüğünüzde aklınızdan ne geçiyor? Çoğu mühendisin ilk refleksi bölme yapmak: 250.000 saat, 28,5 yıl. "Demek ki bu kutu 28 yıl dayanıyor." Bu cümle yanlış. Yalnızca biraz yanlış da değil; hem sayının anlamı, hem ölçüsü, hem de mühendislik kararına etkisi bakımından yanlış.

MTBF, güvenilirlik mühendisliğinin en çok kullanılan ve en çok yanlış anlaşılan sayısıdır. Aviyonikte bu yanlış anlama daha da pahalıya patlıyor, çünkü orada asıl hedef MTBF değil; uçuş saati başına $10^{-9}$ gibi bir olasılık. Bu iki sayı arasındaki köprüyü kuran şey, çoğu Türkçe kaynakta hiç geçmeyen bir çarpan: **maruz kalma süresi**.

Bu yazıda önce MTBF'in matematiksel tanımını yerine oturtacağım, sonra dört yaygın yanılgıyı sayısal karşı örneklerle tek tek yıkacağım, ardından bileşen arıza oranından sertifikasyon hedefine giden aritmetiği türeteceğim. Bütün sayılar tekrar üretilebilir: her biri kapalı formdan hesaplandı, kritik olanlar sayısal integrasyonla veya tabloyla çapraz doğrulandı.

---

## Kısa bir tarihçe: 1965'te donmuş bir el kitabı

Elektronik güvenilirlik tahmininin modern hikâyesi 1960'larda, ABD Savunma Bakanlığı'nın MIL-HDBK-217 el kitabıyla başlıyor. Fikir çekici derecede basitti: her bileşen tipi için bir taban arıza oranı tablosu ver, sonra kalite, ortam ve sıcaklık için $\pi$ (pi) çarpanlarıyla düzelt, hepsini topla, sistemin arıza oranını bul.

El kitabının son revizyonu **MIL-HDBK-217F Notice 2** ve tarihi **28 Şubat 1995**. Yani bugün hâlâ ihalelerde şart koşulan bu doküman, Pentium'un piyasaya çıktığı yıllardan kalma bileşen verisiyle çalışıyor. Sonraki revizyon (217G) için çalışmalar başladı ama tamamlanmadı. Boşluğu ticari ve bölgesel metodolojiler doldurdu:

| Metodoloji | Güncel sürüm | Kökeni / odağı |
|---|---|---|
| MIL-HDBK-217F | Notice 2, 1995 | ABD askerî; parça sayımı ve parça gerilimi yöntemleri |
| 217Plus | 2015, Notice 1 | RIAC/Quanterion; süreç faktörlerini de modele katar |
| FIDES Guide | 2022, Edition A | Fransız havacılık-savunma konsorsiyumu; misyon profili tabanlı |
| IEC 61709 | Ed. 3.0, 2017 | IEC 61709:2011 + IEC TR 62380:2004 birleşimi; dönüşüm modelleri verir, taban oran vermez |
| Telcordia SR-332 | Issue 4, 2016 | Telekom ekipmanı; saha verisiyle Bayesçi güncelleme |

Bu tablodaki en önemli satır IEC 61709. Çünkü o, diğerlerinden farklı bir şey yapıyor: taban arıza oranı **vermiyor**, yalnızca bir çalışma koşulundan diğerine dönüştürme modelleri sunuyor. Bu, sektörün 25 yılda öğrendiği dersin itirafı gibi: taban oranları evrensel bir tablodan okumak çalışmıyor.

Ne kadar çalışmadığını ABD Ulusal Araştırma Konseyi'nin 2015 tarihli *Reliability Growth: Enhancing Defense System Reliability* raporunun D ekinde görebilirsiniz. Rapor, tahmin edilen MTBF ile sahada gözlenen MTBF oranlarının vaka çalışmalarında 0,54 ile 12,20 arasında dağıldığını, bazı askerî sistemlerde bu oranın 218:1'e kadar çıktığını aktarıyor. 218 kat sapan bir tahmin, tahmin değildir.

Eleştirilerin teknik özü, Pecht ve Nash'in 1988'de *IEEE Transactions on Reliability*'de yayımladığı çalışmadan bu yana değişmedi: sabit arıza oranı varsayımı, $\pi$ faktörlerinin birbirinden bağımsız kabul edilmesi, sıcaklığın tek bir durağan değere indirgenmesi ve sıcaklık *çevriminin* tamamen gözden kaçırılması.

Bu eleştirilerin en can alıcısı ilki. Ona bakalım.

---

## MTBF neyin kısaltması değildir

Güvenilirlik matematiğinin temel nesnesi MTBF değil, **hazard rate** (anlık arıza oranı) $h(t)$'dir: bir birimin $t$ anına kadar sağ kalmış olması koşuluyla, hemen sonraki birim zamanda arızalanma eğilimi. Güvenilirlik fonksiyonu bundan türer:

$$
R(t) = \exp\!\left(-\int_0^t h(u)\,\mathrm{d}u\right), \qquad
\mathrm{MTTF} = \int_0^\infty R(t)\,\mathrm{d}t
$$

Sağdaki ifadeye dikkat edin: ortalama arıza süresi, güvenilirlik eğrisinin **altındaki alandır**. Belirli bir zamandaki güvenilirlik değil, tüm eğrinin özeti. Tek bir sayıya sıkıştırılmış bir fonksiyon.

Şimdi kritik adım. Eğer ve **yalnızca eğer** $h(t) = \lambda$ sabitse:

$$
R(t) = e^{-\lambda t}, \qquad \mathrm{MTTF} = \frac{1}{\lambda}
$$

MTBF $= 1/\lambda$ eşitliği burada, bu varsayımın altında doğar. Sabit hazard rate, "bileşenin yaşı yoktur" demektir: bir yıl çalışmış kart ile kutudan yeni çıkmış kart, gelecek saat içinde aynı olasılıkla arızalanır. Üstel dağılımın *hafızasızlık* özelliği budur.

Bu varsayım küvet eğrisinin yalnızca orta bölgesinde, erken arızalar (burn-in) elendikten sonra ve yıpranma (wear-out) başlamadan önce yaklaşık olarak geçerlidir. Elektrolitik kondansatörde, fanda, rölede, konnektörde geçerli değildir. LED'de, flash bellekte, güç MOSFET'inde geçerli değildir.

<div class="mermaid">
graph LR
    A[Erken arizalar - azalan hazard rate] --> B[Faydali omur - sabit lambda]
    B --> C[Yipranma - artan hazard rate]
</div>

Küvet eğrisinin üç bölgesinden yalnızca ortadakinde $h(t) \approx \lambda$ tutar; MTBF $= 1/\lambda$ eşitliği de yalnızca orada anlamlıdır.

Ve burada yazının ilk somut sonucu geliyor: aynı MTBF'e sahip iki ürün, aynı riske sahip değildir.

---

## Yanılgı 1: MTBF bir ömür değildir

En basit hâliyle gösterelim. MTBF'i 100.000 saat olan bir birim düşünün ve 10 yıllık sürekli bir görev tanımlayın. 10 yıl, yani 87.660 saat; bu da $\lambda t = 0{,}8766$ demek:

$$
R(10\ \text{yıl}) = e^{-0{,}8766} = 0{,}4162
$$

Yani bu birimin 10 yıl boyunca hiç arızalanmama olasılığı **%41,6**. Arızalanma olasılığı %58,4. "100.000 saat MTBF" ile "11,4 yıl dayanır" arasında sezginin kurduğu bağ tamamen kopuk: MTBF'e eşit süre kadar çalıştırdığınızda sağ kalma olasılığı $e^{-1} = 0{,}368$'dir. Herhangi bir MTBF için, herhangi bir birim için. Yani MTBF, birimlerin yaklaşık **üçte ikisinin** çoktan arızalanmış olduğu andır.

Şimdi asıl ilginç kısım. Aynı MTTF'e (100.000 saat) sahip iki farklı dağılım kuralım: biri üstel ($\beta = 1$), diğeri Weibull $\beta = 3$ (tipik bir yıpranma davranışı). Weibull için $\mathrm{MTTF} = \eta\,\Gamma(1 + 1/\beta)$ olduğundan, $\beta = 3$ için $\eta$ = 111.985 saat seçilirse iki dağılımın MTTF'i birebir aynı olur.

| Süre | $R(t)$, üstel ($\beta=1$) | $R(t)$, Weibull ($\beta=3$) |
|---|---|---|
| 1 yıl | 0,9161 | 0,9995 |
| 5 yıl | 0,6451 | 0,9418 |
| 10 yıl | 0,4162 | 0,6190 |
| 15 yıl | 0,2685 | 0,1981 |

İki ürünün datasheet'inde de "MTBF 100.000 saat" yazıyor. Beş yıllık bir görevde Weibull'lu ürün üstel olandan **%46 daha güvenilir**. On beş yıllık bir görevde ise **daha kötü** — eğriler kesişiyor. Tek bir sayıya bakarak bu iki ürün arasında seçim yapmak mümkün değil.

Pratik sonuç: bir tedarikçiden MTBF istemek yerine **görev süreniz için $R(t)$** isteyin. Cevap veremiyorsa, verdiği MTBF sayısının arkasında bir dağılım modeli yok demektir.

---

## Yanılgı 2: Yedeklilik MTBF'i ikiye katlamaz

İki özdeş kanal koyup "artık MTBF iki katı" demek, sahada duyduğum en yaygın ikinci hatadır. Türetelim. İki aktif kanal, sistem en az biri çalışırken ayakta (1oo2), onarım yok:

$$
R_{\text{sis}}(t) = 1 - \left(1 - e^{-\lambda t}\right)^2 = 2e^{-\lambda t} - e^{-2\lambda t}
$$

$$
\mathrm{MTTF}_{\text{sis}} = \int_0^\infty \left(2e^{-\lambda t} - e^{-2\lambda t}\right)\mathrm{d}t
= \frac{2}{\lambda} - \frac{1}{2\lambda} = \frac{3}{2\lambda}
$$

Yani iki kat değil, **1,5 kat**. Bir kanalın MTBF'i 10.000 saat ise, iki kanallı sistemin MTBF'i 20.000 değil 15.000 saattir. (Bunu $\lambda = 10^{-4}$ için sayısal integrasyonla doğruladım: 15.000,0 saat.) İkinci kanal, ilk kanal arızalandıktan sonra tek başına ve yedeksiz çalışmaya devam ettiği için beklenen katkısı yalnızca $1/(2\lambda)$ kadardır.

Onarım eklediğimizde tablo tamamen değişir. Üç durumlu bir Markov zinciri kuralım: her iki kanal sağlam (0), bir kanal arızalı (1), her iki kanal arızalı (2, yutucu). Onarım oranı $\mu = 1/\mathrm{MTTR}$:

<div class="mermaid">
stateDiagram-v2
    direction LR
    S0: Iki kanal saglam
    S1: Bir kanal arizali
    S2: Sistem arizali
    S0 --> S1: 2 lambda
    S1 --> S2: lambda
    S1 --> S0: mu
</div>

Yutucu duruma varış süresini yazalım. $T_0$ ve $T_1$, ilgili durumlardan başlayarak beklenen sistem arıza süreleri olsun:

$$
T_0 = \frac{1}{2\lambda} + T_1, \qquad
T_1 = \frac{1}{\lambda + \mu} + \frac{\mu}{\lambda + \mu}\,T_0
$$

İkinciyi birincide yerine koyup $T_0$ için çözünce:

$$
\mathrm{MTTF}_{\text{sis}} = T_0 = \frac{3\lambda + \mu}{2\lambda^2}
$$

Buradaki $\lambda^2$ paydası her şeyi anlatıyor. $\lambda = 10^{-4}$ (tek kanal MTBF'i 10.000 saat) için:

| MTTR | Sistem MTBF (saat) | Kabaca |
|---|---|---|
| 1 saat | $5{,}00 \times 10^{7}$ | ~5.700 yıl |
| 8 saat | $6{,}27 \times 10^{6}$ | ~715 yıl |
| 24 saat | $2{,}10 \times 10^{6}$ | ~239 yıl |
| 168 saat (bir hafta) | $3{,}13 \times 10^{5}$ | ~36 yıl |

Yedekliliğin değeri, kanal sayısından değil **onarım hızından** geliyor. Bir haftalık onarım süresiyle bir saatlik onarım süresi arasında 160 kat fark var — hiçbir donanım iyileştirmesi bu kaldıraca yaklaşamaz. Bakım konsepti bir lojistik detay değil, güvenilirlik tasarımının parçasıdır.

Ve bu, uçakta çok daha keskin bir biçimde karşımıza çıkacak. Çünkü uçakta "onarım", uçuş sırasında olmaz.

---

## Yanılgı 3: 10⁻⁹ bir bileşen hedefi değildir

Aviyonikte emniyet hedefleri arıza oranıyla değil, **uçuş saati başına ortalama olasılıkla** ifade edilir. FAA'in bu konudaki dokümanı olan AC 25.1309-1B, **30 Ağustos 2024**'te yayımlandı ve 1988 tarihli AC 25.1309-1A'yı iptal etti. Bu, alanda dikkat çekmesi gereken bir güncelleme: 2002'de dolaşıma giren ve yıllarca "Arsenal Draft" adıyla atıf alan 1B taslağı nihayet resmîleşti. İnternette bulacağınız Türkçe ve İngilizce kaynakların çok büyük kısmı hâlâ 1A'ya atıf yapıyor.

Sınıflandırma tablosu tanıdık:

| Arıza durumu sınıfı | Nitel terim | Uçuş saati başına ortalama olasılık |
|---|---|---|
| Katastrofik | Extremely Improbable | $\le 1 \times 10^{-9}$ |
| Tehlikeli (Hazardous) | Extremely Remote | $\le 1 \times 10^{-7}$ |
| Majör | Remote | $\le 1 \times 10^{-5}$ |
| Minör | Probable | $> 1 \times 10^{-5}$ |

$10^{-9}$ sayısı gökten inmedi. Kamuya açık gerekçelendirme şöyle işliyor: 1970'lerde tüm nedenler dahil kaza oranı milyon uçuş saatinde yaklaşık dört mertebesindeydi. Bunun yaklaşık %10'u sistem kaynaklı kabul edilirse, tüm sistemler için hedef $10^{-7}$/saat civarına iner. Tipik bir büyük uçakta katastrofik sonuca yol açabilecek arıza durumu sayısı kabaca 100 varsayılırsa, her bir arıza durumuna düşen pay $10^{-9}$/saat olur. Yani bu sayı fiziksel bir sabit değil, bir **bütçe paylaştırması**.

Şimdi ölçek karşılaştırması yapalım. Güvenilirlikte kullanılan FIT birimi, $10^{9}$ saatte bir arıza demektir; yani **1 FIT $= 10^{-9}$/saat**. Katastrofik bir arıza durumunun bütçesi, tam olarak 1 FIT'lik bir olasılıktır.

Tipik bir aviyonik LRU'da 2.000 civarında elektronik bileşen olduğunu ve bileşen başına ortalama 20 FIT düştüğünü varsayalım (temsilî sayılar). Kutunun toplam arıza oranı 40.000 FIT, yani $4 \times 10^{-5}$/saat; MTBF olarak 25.000 saat. Bu kutunun arıza oranı, katastrofik bütçenin **40.000 katı**. Tek bir dirençin arıza oranı bile çoğu zaman 1 FIT'in üzerindedir.

Buradan çıkan sonuç sarsıcı olmalı: **hiçbir tekil (simplex) mimari, hiçbir bileşen kalitesiyle $10^{-9}$'a ulaşamaz.** O sayı bileşenlerden değil, mimariden gelir. Peki mimari onu nasıl üretir?

---

## Maruz kalma süresi: aradaki eksik çarpan

İki bağımsız kanalın *ikisinin birden* arızalanmasını gerektiren bir arıza durumu düşünelim. Sezgi, olasılıkların çarpılacağını söyler: $\lambda_1 \lambda_2$. Ama bu boyutsal olarak yanlış — $[1/\text{saat}]^2$ birimli bir sayı, uçuş saati başına olasılık olamaz. Eksik olan çarpan zamandır ve hangi zaman olduğu tamamen mimariye bağlıdır.

Kritik ayrım şu: iki arızadan biri **gizli** (latent) mi? Yani meydana geldiğinde mürettebata veya sisteme kendini gösteriyor mu, yoksa yalnızca periyodik bir testte mi yakalanıyor? Yedek bir kanal, yedek bir hidrolik pompa, bir güvenlik monitörü — bunlar tipik olarak gizli arıza adaylarıdır, çünkü asıl kanal çalıştığı sürece arızalı olduklarını kimse fark etmez.

Gizli arızalı A birimini $T$ periyoduyla test ettiğimizi varsayalım (her testte kusursuz onarım). Rastgele bir uçuş anında A'nın **zaten arızalı olma** olasılığının ortalaması:

$$
\bar{P}_A = \frac{1}{T}\int_0^T \left(1 - e^{-\lambda_A t}\right)\mathrm{d}t
= 1 - \frac{1 - e^{-\lambda_A T}}{\lambda_A T}
\;\approx\; \frac{\lambda_A T}{2}
$$

Yaklaşım $\lambda_A T \ll 1$ rejiminde geçerli. Ne kadar geçerli olduğunu sayısal olarak kontrol ettim: $\lambda_A T = 0{,}005$ için yaklaşım hatası %0,17; $\lambda_A T = 0{,}05$ için %1,7; $\lambda_A T = 0{,}5$ için %17,3. Aviyonik ölçeklerde ($\lambda \sim 10^{-8}$, $T \sim 10^3$ saat) yaklaşım pratikte tamdır.

Sistem arıza durumunun uçuş saati başına ortalama olasılığı, "A zaten arızalıyken B'nin de arızalanması" ile verilir:

$$
\bar{P}_{\text{olay}}\;/\text{saat} \;\approx\; \lambda_B \cdot \frac{\lambda_A T}{2}
$$

Şimdi bu formülü çalıştıralım. İki kanalın da 50 FIT olduğunu varsayalım ($\lambda = 5 \times 10^{-8}$/saat — iyi tasarlanmış bir kanal için makul bir mertebe):

| Gizli arıza test aralığı $T$ | Ortalama olasılık / uçuş saati | $10^{-9}$ hedefine pay |
|---|---|---|
| 1 saat (her uçuş öncesi BIT) | $1{,}30 \times 10^{-15}$ | 767.000× |
| 10 saat | $1{,}25 \times 10^{-14}$ | 80.000× |
| 100 saat | $1{,}25 \times 10^{-13}$ | 8.000× |
| 500 saat | $6{,}25 \times 10^{-13}$ | 1.600× |
| 2.000 saat | $2{,}50 \times 10^{-12}$ | 400× |
| 5.000 saat | $6{,}25 \times 10^{-12}$ | 160× |

Tabloda okunması gereken şey şu: iki kanalı bağımsız kılmak olasılığı $10^{-8}$'den $10^{-15}$ mertebesine indiriyor — yedi mertebe. Ama test aralığı $T$, sonuca **doğrusal** olarak giriyor. Bakım aralığını 100 saatten 5.000 saate çıkarmak, olasılığı 50 kat kötüleştiriyor.

Bu, mühendislik açısından son derece pratik bir sonuç: **gizli arızaların test aralığı, güvenilirlik bütçesinde donanım kalitesiyle aynı ligde bir tasarım değişkenidir.** Bileşen kalitesini yükselterek $\lambda$'yı iki kat iyileştirmek aylar sürer ve pahalıdır; aynı kazancı, o gizli arızayı yakalayan bir BIT testini uçuş öncesi kontrole taşıyarak elde edebilirsiniz. Gizli arızaların ve maruz kalma sürelerinin ARP4761 ailesindeki emniyet değerlendirme yönteminin ayrılmaz parçası olmasının nedeni budur. Aynı nedenle, sertifikasyon tarafında bir bakım aralığını uzatmak nadiren "sadece lojistik" bir karardır: emniyet analizini geçersiz kılabilir.

Bir uyarı: yukarıdaki türev, iki arızanın bağımsız olduğu, testin kusursuz olduğu ve $\lambda T \ll 1$ olduğu varsayımlarına dayanıyor. Her iki arızanın da gizli olduğu, testlerin farklı periyotlarda yapıldığı veya ortak sebep (common cause) bulunduğu durumlarda çarpan değişir; kullanılan emniyet değerlendirme yöntemi bu konfigürasyonları ayrı ayrı ele almak zorundadır. Buradaki amaç kapalı formu ezberletmek değil, $T$'nin neden doğrudan bir çarpan olduğunu göstermek.

---

## Yanılgı 4: Yazılımın MTBF'i yoktur

Zaman zaman şartnamelerde "yazılım MTBF'i: 50.000 saat" gibi maddelerle karşılaşılıyor. Bu madde anlamsızdır ve onu yazan taraf genellikle bunu bilmez.

MTBF, **rastgele** arızalar için tanımlıdır: fiziksel bir bileşen, üretim toleransları ve çevresel gerilim altında stokastik bir zamanda bozulur. Yazılım bozulmaz. Yazılımdaki hata, ilk derlemeden itibaren oradadır; belirli bir girdi kümesi o kod yoluna ulaştığında ortaya çıkar. Bu **sistematik** bir hatadır, rastgele değil.

Bu ayrım havacılık sertifikasyonunun temel taşıdır. Yazılım tarafında olasılık hedefi yoktur; onun yerine **development assurance** (geliştirme güvencesi) vardır: DO-178C'nin DAL seviyeleri ve ARP4754B'nin FDAL/IDAL tahsisi. Hedef "yazılım $10^{-9}$ olasılıkla hata yapsın" değil, "hatanın kaçırılma ihtimalini azaltacak süreç titizliği DAL A'ya uygun olsun"dur.

<div class="mermaid">
graph TD
    A[Ariza durumu siniflandirmasi - FHA] --> B[Rastgele donanim arizalari]
    A --> C[Sistematik hatalar]
    B --> D[Nicel hedef - ucus saati basina 10^-9]
    C --> E[Gelistirme guvencesi - DAL ve FDAL-IDAL]
    D --> F[FTA, PSSA, SSA]
    E --> F
</div>

Pratik sonuç: bir emniyet analizinde donanım kolu nicel, yazılım kolu niteldir. Fault tree'nin yaprağına yazılım hatası için bir olasılık koyduğunuz an, o ağacın sayısal sonucu anlamını yitirir. (Fault tree ve minimal cut set hesabının kendisi ayrı bir yazının konusu.)

---

## Tahmin mi, kanıt mı? χ² ile MTBF'in alt sınırı

Şimdiye kadar konuştuğumuz her şey *tahmindi*. Peki sahada gözlenen veriden MTBF nasıl çıkarılır — ve ne kadar güvenle?

Üstel varsayım altında, toplam test süresi $T$ ve gözlenen arıza sayısı $r$ için MTBF'in nokta tahmini $T/r$'dir. Ama asıl işe yarayan sayı bu değil, alt güven sınırıdır. Zaman-kesikli (time-terminated) bir test için:

$$
\theta_{\text{alt}} = \frac{2T}{\chi^2_{C;\,2r+2}}
$$

Burada $C$ güven seviyesi; $\chi^2$ ise $2r+2$ serbestlik dereceli ki-kare dağılımının $C$ olasılığına karşılık gelen kuantili. (Kuantilleri çift serbestlik derecesi için kapalı formdan bisection ile hesaplayıp tabloyla doğruladım: $\chi^2_{0{,}90;\,2} = 4{,}6052$, $\chi^2_{0{,}90;\,4} = 7{,}7794$, $\chi^2_{0{,}95;\,6} = 12{,}5916$.)

20 birimi 1.000'er saat çalıştırdığınızı, yani toplam $T$ = 20.000 birim-saat biriktirdiğinizi düşünelim:

| Gözlenen arıza $r$ | Nokta tahmini $T/r$ | %60 güven alt sınırı | %90 güven alt sınırı |
|---|---|---|---|
| 0 | — | 21.827 saat | 8.686 saat |
| 1 | 20.000 saat | 9.890 saat | 5.142 saat |
| 3 | 6.667 saat | 4.790 saat | 2.994 saat |

Hiç arıza görmeden 20.000 saat test etmek, %90 güvenle söyleyebileceğiniz tek şeyi verir: MTBF **en az 8.686 saat**. 100.000 saat değil.

Peki 100.000 saatlik bir MTBF iddiasını sıfır arızayla, %90 güvenle kanıtlamak için ne kadar test gerekir? Formülü tersine çevirelim: $T = \theta \cdot \chi^2_{0{,}90;\,2}/2$, yani 100.000 × 4,6052 / 2 = 230.259 birim-saat. Yani 26,3 birim-yılı. Tek bir birimle 26 yıl; 100 birimlik bir filoyla yaklaşık 3,2 ay kesintisiz çalışma — ve bu süre boyunca **tek bir arıza bile olmayacak**.

Bu hesabı bir kez yaptıktan sonra, datasheet'lerdeki 250.000 saatlik MTBF sayılarının nereden gelmediğini anlarsınız: ölçümden gelmiyorlar. Bir tablodan toplanarak hesaplanıyorlar. Bu onları değersiz yapmaz — ama ölçüm sanmak tehlikelidir.

---

## Sıcaklığın gerçek etkisi

Tahmin el kitaplarının hepsi sıcaklık düzeltmesi yapar ve çoğu bunu Arrhenius bağıntısıyla modeller:

$$
\mathrm{AF} = \exp\!\left[\frac{E_a}{k}\left(\frac{1}{T_1} - \frac{1}{T_2}\right)\right]
$$

$E_a$ aktivasyon enerjisi (eV), $k = 8{,}617 \times 10^{-5}$ eV/K, sıcaklıklar Kelvin. Sayısal olarak:

| $E_a$ | 40 °C → 70 °C | 40 °C → 85 °C |
|---|---|---|
| 0,3 eV | 2,6× | 4,0× |
| 0,7 eV | 9,7× | 26,0× |

Yani kartın çalışma sıcaklığını 40 °C'den 85 °C'ye çıkarmak, baskın arıza mekanizmasının aktivasyon enerjisine bağlı olarak arıza oranını 4 ile 26 kat arasında büyütüyor. Termal tasarımın güvenilirlik üzerindeki kaldıracı, bileşen kalite sınıfını yükseltmenin sağladığından tipik olarak daha büyük.

Ama burada 217 eleştirisinin en haklı kısmı devreye giriyor: bu model yalnızca **durağan** sıcaklığı görür. Lehim bağlantısı yorulması, delik duvarı çatlağı, kalay whisker'ları gibi mekanizmalar sıcaklığın kendisinden çok **değişiminden** beslenir — bunlar Arrhenius'la değil, Coffin-Manson tipi çevrim modelleriyle anlatılır. Günde iki kez soğuk kalkış yapan bir aviyonik kutusu için sıcaklık çevrimi, ortalama sıcaklıktan daha belirleyici olabilir. FIDES'in misyon profili (uçuş fazlarına göre sıcaklık, titreşim, nem) tabanlı yaklaşımı tam olarak bu boşluğu kapatmak için var.

---

## Pratikte ne yapmalı

Bu yazıdan çıkarmanızı istediğim işlemsel maddeler:

1. **MTBF'i asla ömür olarak okumayın.** Servis ömrü (yıpranma) ayrı bir analizdir. Elektrolitik kondansatör, fan, röle, batarya, konnektör: bunların ömrü MTBF'ten bağımsız olarak sınırlıdır ve tipik olarak bu ömür, kutunun MTBF'inden çok daha kısadır.
2. **MTBF yerine $R(t)$ isteyin.** Görev sürenizi söyleyin, o süredeki güvenilirliği isteyin. Tedarikçi bir dağılım varsayımı belirtemiyorsa sayı zayıftır.
3. **Hangi metodolojiyle üretildiğini sorun.** MIL-HDBK-217F ile FIDES 2022, aynı karta 3-5 kat farklı arıza oranı verebilir. Metodoloji belirtilmemiş bir MTBF karşılaştırılamaz.
4. **Varsayımları isteyin:** ortam kategorisi, ortalama bileşen sıcaklığı, duty cycle, kalite sınıfı. Bunlar olmadan sayı bir mertebe kayabilir.
5. **Tahminleri mutlak değil, göreli kullanın.** Aynı metodoloji ve aynı varsayımlarla üretilmiş iki tasarımı karşılaştırmak meşrudur; tek bir tahmini saha performansının kestirimi saymak değildir.
6. **Yedeklilikte onarım süresini tasarlayın.** MTTR, sistem MTBF'ine kadratik girer. Yer değiştirme süresi, yedek parça lojistiği ve arıza tespit kabiliyeti güvenilirlik parametreleridir.
7. **Gizli arızaların test aralığını bir tasarım değişkeni sayın.** Maruz kalma süresi olasılığa doğrusal girer ve BIT tasarımıyla doğrudan kontrol edilebilir.
8. **Yazılım için olasılık üretmeyin.** Nicel emniyet hedefi donanım kolu içindir; yazılım kolu DAL/FDAL tahsisiyle yönetilir.
9. **Testten sayı çıkarırken güven sınırını yazın.** "MTBF = $T/r$" tek başına yanıltıcıdır; χ² alt sınırı gerçekte ne kanıtladığınızı söyler.

---

## Açık sorular ve ileri okuma

Bu yazının bilerek dışarıda bıraktığı üç konu var ve her biri ayrı bir yazıyı hak ediyor:

**Physics of Failure.** NRC raporunun önerdiği yön, sabit-$\lambda$ el kitaplarını tümüyle bırakıp mekanizma tabanlı modellemeye geçmek. Peki bu, bir sertifikasyon dosyasında nasıl kanıta dönüşür? Ömür modellemesi ile emniyet analizinin arayüzü hâlâ olgunlaşmış değil.

**Bayesçi kestirim.** Telcordia SR-332'nin yaptığı gibi, saha verisiyle bir öncül tahmini güncellemek. Az veriyle çalışan aviyonik programları için doğal bir çerçeve; ama sertifikasyon otoritelerinin öncül seçimine bakışı ayrı bir tartışma.

**Ortak sebep (common cause) arızaları.** Yukarıdaki bütün çarpımların dayandığı bağımsızlık varsayımı, özdeş iki kanalda çoğu zaman doğru değildir. $\beta$-faktör modelleri ve ayrışıklık (dissimilarity) gerektiren mimariler burada devreye girer — ve $10^{-9}$'a ulaşmanın gerçek zorluğu genellikle burada saklıdır.

---

## Kaynaklar

- [MIL-HDBK-217F Notice 2, *Reliability Prediction of Electronic Equipment*, 28 Şubat 1995](https://everyspec.com/MIL-HDBK/MIL-HDBK-0200-0299/MIL-HDBK-217F_NOTICE-2_14590/)
- [National Research Council, *Reliability Growth: Enhancing Defense System Reliability* (2015), Appendix D: Critique of MIL-HDBK-217](https://www.nationalacademies.org/read/18987/chapter/17)
- [M. Pecht, F. Nash, "A critique of MIL-HDBK-217E reliability prediction methods", *IEEE Transactions on Reliability*, 1988](https://ieeexplore.ieee.org/document/9859/)
- [FAA AC 25.1309-1B, *System Design and Analysis*, 30 Ağustos 2024](https://www.faa.gov/regulations_policies/advisory_circulars/index.cfm/go/document.information/documentID/1043037)
- [SAE ARP4761A, *Guidelines for Conducting the Safety Assessment Process on Civil Aircraft, Systems, and Equipment*, Aralık 2023](https://www.sae.org/standards/content/arp4761a/)
- [IEC 61709:2017, *Electric components — Reliability — Reference conditions for failure rates and stress models for conversion*](https://webstore.iec.ch/en/publication/28554)
- [FIDES Guide 2022 — resmî site](https://www.fides-reliability.org/)
- [Quanterion / RMQSI, *Confidence Bounds on the MTBF for a Time-Truncated Test*](https://www.rmqsi.org/confidence-bounds-on-the-mean-time-between-failure-mtbf-for-a-time-truncated-test/)
- [Vertical Magazine, "Understanding 'one in a billion' in aircraft system safety assessments"](https://verticalmag.com/opinions/understanding-aircraft-system-safety-assessments/)
- [Quanterion Solutions — MIL-HDBK-217 ve 217Plus durumu](https://www.quanterion.com/mil-handbook-217/)
- [Telcordia SR-332 Issue 4 (Mart 2016) — Reliability Prediction Procedure for Electronic Equipment](https://telecom-info.njdepot.ericsson.net/site-cgi/ido/docs.cgi?ID=SEARCH&DOCUMENT=SR-332)

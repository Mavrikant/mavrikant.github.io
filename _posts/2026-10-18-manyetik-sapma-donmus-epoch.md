---
title: "Manyetik Sapmanın İki Saati: Donmuş Epoch ve Kaybedilen Autoland"
subtitle: "Two Clocks of Magnetic Variation: Frozen Epochs and Lost Autoland Credit"
background: "/img/posts/5.webp"
date: '2026-10-18 11:00:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [navigasyon, emniyet-kritik, sertifikasyon]
---

Modern bir yolcu uçağının göstergesinde okuduğunuz manyetik başlık, bir ölçüm değildir. Atalesel referans birimi gerçek (true) başlığı jiroskoplarıyla hesaplar, sonra bu değerden gömülü bir tablodan okuduğu manyetik sapmayı çıkarır ve sonucu "manyetik başlık" adıyla uçuş kontrol sistemine, FMS'e ve göstergelere dağıtır. Yani pusula iğnesi yoktur; bir veritabanı sorgusu vardır.

Bu tasarım kararının sessiz bir sonucu var: o tablo bir **epoch** damgası taşır ve zamanla gerçeklikten uzaklaşır. Daha kötüsü, aynı anda yerde de bir manyetik sapma değeri yaşlanır — prosedürün, ILS'in ve pist numarasının dayandığı değer. İki veritabanı, birbirinden bağımsız iki takvimle yaşlanır. Uçuşu bozan şey ikisinin de yanlış olması değil; **ikisinin birbirinden farklı olmasıdır.**

Bu yazıda o farkın anatomisini açacağım. Yerin manyetik alanının nasıl modellendiğini anlatacak, modeli sıfırdan kurup NOAA'nın yayınladığı resmî test değerlerine karşı doğrulayacak, sonra donmuş bir epoch'un yıllar içinde kaç derece hata biriktirdiğini hesaplayacağım. Sonunda 2012'de Anchorage'da gerçekten yaşanan ve bazı uçaklara düşük görüşte autoland yasağı getiren olayın, hesapladığım sayılarla neden tam olarak orada ortaya çıktığını göreceğiz.

---

## Manyetik Başlık Nereden Gelir?

Uçaklar gerçek ve manyetik referansları karışık kullanır. Haritalar, pistler, yer seyrüsefer yardımcıları ve enstrüman yaklaşma prosedürleri manyetik referanslıdır. Buna karşılık atalesel sistemler ve alan seyrüsefer (RNAV) hesapları doğası gereği gerçek referanslıdır.

Taşıma kategorisi uçaklarda bu dönüşümün yönü şaşırtıcıdır. FAA'nın PARC raporunun ifadesiyle, atalesel referans sistemi olan uçaklar gerçek referanslı veri üretir, buna karşılık gelen manyetik veriyi *hesaplar* ve ikisini de çıktı olarak verebilir. Bu uçaklar manyetik algılayıcı verisine ihtiyaç duymaz — ne flux valve, ne flux gate. Çünkü manyetik başlık türetilmiş bir büyüklüktür:

<div class="mermaid">
graph LR
  A["Atalesel referans - IRS / IRU / ADIRU"]
  B["Gerçek başlık - true heading"]
  C["MagVar tablosu - epoch damgalı"]
  D["Manyetik başlık - sentezlenmiş"]
  E["Uçuş kontrol, FMS, göstergeler"]
  A --> B
  B -->|çıkarma| D
  C -->|tablo sorgusu| D
  D --> E
</div>

Buradaki hata bütçesi iki parçalıdır. EASA'nın CS-25 kapsamında belgelediği genel kabul, atalesel birimlerden gelen **gerçek** başlık göstergesi için doğruluğun 1 dereceden iyi veya ona eşit olmasıdır. Yani jiroskop tarafı iyidir. Manyetik başlığın doğruluğu ise tamamen tablonun kalitesine kalır ve enleme göre gevşer:

| Kabul edilebilir doğruluk | Enlem aralığı |
|---|---|
| 2 derece | 50°S – 50°N |
| 3 derece | 50°N – 73°N |
| 3 derece | 50°S – 60°S |
| 5 derece | 73°N – 79°N |
| 8 derece | 79°N – 82°N |

Tolerans kutuplara doğru genişliyor, çünkü orada manyetik alanın yatay bileşeni zayıflar ve sapmanın yıllık değişimi hızlanır. Standart, fiziğin zorluğunu kabul edip gereksinimi gevşetiyor.

Tablonun kendisi uygulamaya göre değişir: PARC raporu hem enlem/boylamın fonksiyonu olarak iki boyutlu bir **MagVar tablosundan** hem de **manyetik sapma katsayı veritabanlarından** söz eder. Yani bazı tasarımlar bir ızgara saklar, bazıları doğrudan küresel harmonik katsayıları saklar. Her iki durumda da ortak olan şey aynıdır: bir epoch'a bağlıdır.

---

## Yerin Alanı Nasıl Modellenir?

Dünya'nın ana manyetik alanı, çekirdekteki akışkan hareketinden doğar ve dış uzayda kaynaksız olduğu için bir skaler potansiyelin gradyanı olarak yazılabilir. Bu potansiyel küresel harmoniklere açılır:

$$
V(r,\theta,\lambda) = a \sum_{n=1}^{N} \left(\frac{a}{r}\right)^{n+1} \sum_{m=0}^{n} \left[ g_n^m \cos(m\lambda) + h_n^m \sin(m\lambda) \right] \bar P_n^m(\cos\theta)
$$

Burada $a = 6371{,}2$ km jeomanyetik referans yarıçapı, $\theta$ jeosentrik eş-enlem, $\lambda$ boylam, $\bar P_n^m$ Schmidt yarı-normalize edilmiş birleşik Legendre fonksiyonlarıdır. $g_n^m$ ve $h_n^m$ ise **Gauss katsayıları** — modelin tamamı bu sayı listesidir.

Alan bileşenleri potansiyelin türevlerinden gelir:

$$
B_r = -\frac{\partial V}{\partial r}, \qquad
B_\theta = -\frac{1}{r}\frac{\partial V}{\partial \theta}, \qquad
B_\lambda = -\frac{1}{r\sin\theta}\frac{\partial V}{\partial \lambda}
$$

Jeosentrik çerçeveden jeodezik çerçeveye döndürdükten sonra kuzey, doğu ve aşağı bileşenleri $X$, $Y$, $Z$ elde edilir. Aradığımız manyetik sapma, yatay düzlemde gerçek kuzey ile manyetik kuzey arasındaki açıdır:

$$
D = \arctan\frac{Y}{X}, \qquad H = \sqrt{X^2 + Y^2}
$$

Modelin zamana bağımlılığı çok basit tutulur — katsayılar doğrusal olarak ötelenir:

$$
g_n^m(t) = g_n^m(t_0) + \dot{g}_n^m\,(t - t_0)
$$

İşte epoch tam burada devreye girer. $t_0$ modelin epoch'udur; $\dot{g}_n^m$ ise **sekuler varyasyon** terimi. World Magnetic Model (WMM) 12. dereceye kadar açılır, beş yıllık döngülerle yayımlanır ve geçerliliği epoch'tan itibaren beş yıldır. Güncel sürüm WMM2025, Kasım 2024 tarihli katsayı dosyasıyla Aralık 2024'te yayımlandı ve 31 Aralık 2029'a kadar geçerli. Retrospektif çalışma için NOAA eski WMM dosyalarını bilinçli olarak dağıtmaz — 2015 öncesi için International Geomagnetic Reference Field (IGRF) kullanılmasını önerir. IGRF'in 14. nesli 13. dereceye kadar açılır ve 1900'den bugüne, geçmiş epoch'lar için **kesinleşmiş** (DGRF) katsayılar içerir.

---

## Modeli Kurup Doğrulamak

Bu yazıdaki sayılara güvenebilmek için modeli tahmin etmek yerine kurmayı tercih ettim. Saf Python ile, yalnızca `math` modülüyle küresel harmonik sentezi yazdım: WGS 84 jeodezik koordinatlardan jeosentrik küresel koordinatlara dönüşüm, Legendre fonksiyonlarının özyinelemeli hesabı, alan bileşenleri ve çerçeve döndürmesi.

Kritik parça Legendre özyinelemesidir. Schmidt yarı-normalizasyonunda sektoral terim şöyle yürür:

$$
\bar P_n^n = \sqrt{\frac{2n-1}{2n}}\;\sin\theta\;\bar P_{n-1}^{n-1}, \qquad n \ge 2
$$

tesseral ve zonal terimler ise:

$$
\bar P_n^m = \frac{(2n-1)\cos\theta\,\bar P_{n-1}^m - \sqrt{(n-1)^2-m^2}\;\bar P_{n-2}^m}{\sqrt{n^2-m^2}}
$$

İlk denemede bu özyinelemeyi tüm $n$ değerleri için aynı biçimde yazdım ve model NOAA'nın değerlerinden **binlerce nanotesla** saptı. Hata şuradaydı: $\bar P_1^1 = \sin\theta$ tam olarak geçerlidir, karekök çarpanı yalnızca $n \ge 2$'den itibaren devreye girer. $n = 1$ için $\sqrt{1/2} \approx 0{,}707$ kullanmak, $m > 0$ olan **bütün** terimleri aynı çarpanla bozuyordu — yani modelin dipol dışı her bileşenini. Düzeltme tek satırdır:

```python
# sektoral terim; P_1^1 = sin(theta) tam olarak geçerli, karekök
# çarpanı Schmidt normalizasyonunda yalnızca n >= 2'den itibaren girer
c = 1.0 if n == 1 else math.sqrt((2.0 * n - 1.0) / (2.0 * n))
P[n][n] = c * w * P[n - 1][n - 1]
dP[n][n] = c * (u * P[n - 1][n - 1] + w * dP[n - 1][n - 1])
```

Bu türden bir hatanın sinsiliği şudur: dipol terimi ($n=1$, $m=0$) doğru kaldığı için model hâlâ "makul" sonuçlar üretir. Sapma değerleri birkaç derece kayar ama işaretler ve büyüklük mertebesi doğru görünür. Gözle bakarak yakalanmaz.

Yakalatan şey doğrulamaydı. NOAA, WMM2025 katsayı paketinin içinde **100 noktalı resmî bir test değeri dosyası** yayımlıyor: 2025.0 ile 2029.5 arasında farklı tarihler, 0 ile 98 km arasında yükseklikler, −87 ile +89 derece arasında enlemler. Düzeltmeden sonra kendi hesabımı bu 100 noktaya karşı koşturdum:

```text
WMM epoch=2025.0  nmax=12  coeff pairs=90
official test points: 100

max absolute deviation from NOAA published values
  X      0.0007 nT
  Y      0.0000 nT
  Z      0.0000 nT
  H      0.0007 nT
  F      0.0004 nT
  D    0.004973 deg
  I    0.004992 deg
```

Sapma, yayımlanmış dosyanın kendi hassasiyetiyle sınırlı. NOAA sapma değerlerini iki ondalıkla veriyor; dolayısıyla yuvarlamadan gelebilecek en büyük fark 0,005 derecedir ve benim en kötü farkım 0,004973 derece. Yani uyum, karşılaştırmanın çözünürlüğü kadar tamdır.

İkinci bir çapraz kontrol daha yaptım: aynı noktaları bir de IGRF-14 ile hesaplayıp WMM2025 ile karşılaştırdım. İki model bağımsız ekipler tarafından farklı veri setleriyle üretiliyor; 2025.0 epoch'unda sapma farkları İstanbul'da 0,002, Anchorage'da 0,008, Svalbard'da 0,007 derece çıktı. Bu önemli, çünkü aşağıda hesaplayacağım kaymaların **model farkından değil gerçek sekuler varyasyondan** geldiğini garanti ediyor.

Konum hassasiyetini de ölçtüm: havaalanı koordinatlarında 0,1 derecelik bir kayma, sapmayı en fazla 0,04 derece değiştiriyor (İstanbul'da 0,017, Anchorage'da boylamda 0,036 derece). Aşağıdaki koordinatları iki ondalıkla veriyorum; tartıştığımız toleranslar derece mertebesinde olduğu için bu fazlasıyla yeterli.

---

## İki Saat

Şimdi asıl meseleye gelelim. Manyetik sapma iki yerde birbirinden bağımsız olarak saklanır ve güncellenir.

**Yer tarafı.** FAA'da bu iş Order 8260.19E ile yürür. Yayımlanan değerin adı **Magnetic Variation of Record**'dur ve RNAV prosedürleri, havaalanı seyrüsefer yardımcıları, ILS'ler, pist kerterizi, hatta ATC radar hizalaması için kullanılan manyetik sapma normalde budur. Kritik ayrıntı: MV of Record **ölçülmez**, beş yıllık geçerlilik penceresi içinde WMM ile *tahmin edilir*. ILS tesisleri için değerler yılda iki kez hesaplanıp kayıtlı değerle karşılaştırılır. Ama bir kez atandıktan sonra MV of Record, politika toleransı dışına çıkana dek **sabit bir değerdir**. Değiştiğinde ilgili tüm prosedürlerin aynı döngüde değişmesi gerekir — yani güncelleme pahalı ve toplu bir operasyondur.

**Uçak tarafı.** IRU içindeki MagVar tablosu da bir epoch'a dayanır, ama tamamen başka bir ritimle güncellenir. PARC raporunun ifadeleri burada çok nettir: bu tablolar genel olarak **en az 10 yıl** geçerli olacak şekilde tasarlanır, birçok konumda daha uzun süre yeterli doğruluktadır, gömülü veya yüklenebilir olabilir, ve tasarıma göre **5 veya 10 yılda bir** güncellenir. Ve işin can alıcı kısmı: sahadaki atalesel sistemlerin **çoğunluğu**, tablolarının güncellenebilmesi için fabrikaya ya da uygun yetkinlikte bir servis merkezine dönmek zorundadır.

Bu, AIRAC döngüsüyle güncellenen bir seyrüsefer veritabanı değildir. Kutuyu uçaktan sökmeyi gerektiren bir donanım işlemidir.

<div class="mermaid">
graph TB
  W["WMM - 5 yıllık epoch döngüsü"]
  G["Yer tarafı - MV of Record"]
  P["Prosedür, ILS, pist kerterizi"]
  I["Uçak tarafı - IRU MagVar tablosu"]
  S["Servis merkezinde güncelleme - 5 ila 10 yıl"]
  X["delta MV - kritik olan fark"]
  W --> G
  G --> P
  W --> I
  I --> S
  P --> X
  S --> X
</div>

İki saatin tik sesleri uyuşmaz. PARC raporunun not ettiği gibi, mevcut strateji altında bir havaalanındaki prosedür birkaç kez güncellenebilirken, uçaklar o havaalanı için hep aynı sabit değeri uygulamaya devam eder.

---

## Asıl Kısıt Doğruluk Değil, Fark

Burada standartların en ince ve en çok yanlış anlaşılan yorumu devreye girer.

PARC raporunun 1. ekinde, atalesel referans birimlerindeki manyetik sapma veritabanları için iki üst seviye gereksinim tanımlanır. Birincisi yukarıda gördüğümüz manyetik başlık doğruluğu. İkincisi ise otomatik kontrol gereksinimlerinden türer ve **fark** cinsinden ifade edilir: uçağın manyetik sapma olarak bildiği değer ile devletin hedeflenen yolu tanımlarken kullandığı değer arasındaki delta. Uçak üreticileri bu delta MV sınırını oldukça tutarlı biçimde **3 derece** olarak tanımlar; daha büyük değerler hizalama veya yol yakalama sırasında bozulmuş uçak davranışına ya da arıza ihbarına yol açar. Bu 3 derecelik fark, otomatik iniş ve rollout sertifikasyon kriterlerini karşılamak için de genel sınır kabul edilir.

Yani kritik büyüklük, mutlak doğruluk değil iki veritabanı arasındaki uyumdur. Bunun doğal sonucu ilk bakışta tersine görünür ve PARC raporu bunu bir dipnotta açıkça söyler: FAA "gerçek" manyetik sapmayı yakalamaya çalışmaz, modele dayanarak tahmin eder; dolayısıyla kullanıcıların konumun gerçek sapmasına **daha yakın** değerler seçmesi, performansın artacağı anlamına gelmez.

Bu cümleyi mühendislik diline çevirirsem: *bir alt sistemi tek başına daha doğru hale getirmek, sistemi bozabilir.* Çünkü ölçüt, dışarıdaki gerçeklikle değil karşı taraftaki veritabanıyla tutarlılıktır. Emniyet kritik sistemlerde sık rastladığım ama her seferinde sezgiye ters gelen bir durumdur.

En talepkâr durum da buradan çıkar: ILS yaklaşma ve iniş operasyonlarında manyetik sapma toleransı açısından en zorlayıcı uçaklar, atalesel referans ve bir MagVar veritabanından türetilmiş **sentetik** manyetik başlık veya iz kullanan autoland uçaklarıdır. Prosedürler havaalanının gerçek sapmasına göre bakımda tutulsa bile, prosedür tasarımcısının kullandığı değerlerle uçaktaki IRU veritabanındaki değerler arasındaki aşırı fark, bazı uçak tiplerinde localizer hüzmesini arayıp izlerken yanal izleme tutarsızlıklarına yol açabilir.

---

## Donmuş Epoch'un Maliyeti

Teori buraya kadar. Şimdi sayılara bakalım: 2015 epoch'una dondurulmuş bir MagVar tablosu, 2026'da uçarken kaç derece yanılır?

Bu soruyu IGRF-14 ile yanıtladım. 2015.0 ve 2020.0 kolonları **DGRF**, yani kesinleşmiş katsayılar — geçmişe dönük en iyi değerler. 2026.0 için 2025.0 epoch'unu sekuler varyasyonla öteledim. Her iki değer de aynı model ailesinden geldiği için aradaki fark saf sekuler varyasyondur.

| Havaalanı | Enlem | D 2015 | D 2020 | D 2026 | Kayma | dD/dt | 3 dereceye |
|---|---|---|---|---|---|---|---|
| Antalya (LTAI) | 36,90°N | +4,79° | +5,26° | +5,52° | +0,73° | +0,031°/yıl | ~97 yıl |
| Van (LTCI) | 38,47°N | +5,55° | +5,90° | +6,05° | +0,50° | +0,019°/yıl | ~154 yıl |
| Erzurum (LTCE) | 39,96°N | +5,87° | +6,26° | +6,45° | +0,57° | +0,024°/yıl | ~126 yıl |
| Ankara (LTAC) | 40,13°N | +5,43° | +5,91° | +6,18° | +0,75° | +0,034°/yıl | ~88 yıl |
| İstanbul (LTFM) | 41,26°N | +5,17° | +5,70° | +6,05° | +0,89° | +0,046°/yıl | ~66 yıl |
| Frankfurt (EDDF) | 50,03°N | +1,97° | +2,79° | +3,65° | +1,68° | +0,138°/yıl | ~22 yıl |
| Anchorage (PANC) | 61,17°N | +17,22° | +15,75° | +14,16° | **−3,06°** | −0,284°/yıl | ~11 yıl |
| Fairbanks (PAFA) | 64,82°N | +18,73° | +16,91° | +14,98° | **−3,75°** | −0,340°/yıl | ~9 yıl |
| Tromsø (ENTC) | 69,68°N | +8,14° | +9,49° | +11,07° | +2,93° | +0,262°/yıl | ~11 yıl |
| Svalbard (ENSB) | 78,25°N | +7,80° | +9,89° | +12,44° | **+4,65°** | +0,434°/yıl | ~7 yıl |

Sapma değerleri doğu yönünde pozitif. "Kayma" kolonu $D(2026) - D(2015)$, yani 2015 epoch'una dondurulmuş bir tablonun bugün göstereceği hata. Son kolon, mevcut değişim hızıyla 3 derecelik delta MV sınırına ulaşma süresi.

Tablonun söylediği şey açık: problem enlemle birlikte patlıyor. Türkiye'deki havaalanlarında on bir yılda biriken hata yarım dereceyle bir derece arasında — hiçbir toleransı zorlamıyor. Frankfurt'ta 1,68 dereceye çıkıyor. Ama Anchorage ve Fairbanks'te aynı on bir yıl, 3 derecelik OEM sınırını **aşıyor**.

Bu sonucu ilk gördüğümde dikkatimi çeken şey şu oldu: hesaplamaya rastgele bir havaalanı listesiyle başlamadım ama sınırı aşan iki havaalanı, FAA'nın 2012'de krize girdiği tam o iki havaalanı çıktı.

---

## Anchorage 2012

PARC MagVar Action Team, FAA'nın 2012'de Anchorage'da bildirilen **ILS yaklaşma anomalilerini** incelemesinin ardından kuruldu. Raporun kendi özetiyle: bu anomaliler, uçak güdüm sistemleri, yer seyrüsefer yardımcıları ve prosedürlerin kullandığı manyetik sapma değerleri arasındaki aşırı farkların sonucuydu. Sonuç olarak Anchorage ve Fairbanks'teki manyetik sapma güncellemeleri askıya alındı ve **bazı uçakların düşük görüşte autoflight ILS yaklaşması yapması yasaklandı.**

Takıma AIRBUS, Alaska Airlines, Boeing, Honeywell, Jeppesen, Mitre ve FAA'dan temsilciler katıldı. Raporun kısa vadeli önerileri arasında şu ikisi dikkat çekicidir:

- Anchorage havaalanı ve ILS'lerinin manyetik sapmalarını mevcut değeri olan **19 derece doğuda, Aralık 2014'e kadar tut.**
- Fairbanks değerini 2013 içinde mümkün olan en kısa sürede **20 derece doğuya güncelle.**

İlk öneri üzerinde durmaya değer. Kendi hesabımla Anchorage'da gerçek sapmanın tarihçesi şöyle:

| Yıl | Gerçek sapma | 19°E ile fark |
|---|---|---|
| 2005 | +20,54° | +1,54° |
| 2010 | +18,99° | −0,01° |
| 2012 | +18,28° | −0,72° |
| 2013 | +17,93° | −1,07° |
| 2014 | +17,58° | −1,42° |
| 2015 | +17,22° | −1,78° |
| 2026 | +14,16° | −4,84° |

Gerçek alan 2010 civarında 19 dereceyi geçip aşağı inmiş. PARC raporunun yazıldığı 2013'te yerdeki kayıtlı değer gerçeklikten zaten 1 dereceden fazla sapmıştı. Ve FAA'ya önerilen şey bunu düzeltmek değil, **daha da bozulmasına izin vermek** oldu: değeri bir buçuk yıl daha 19 derecede tut.

Bu, baştaki ilkenin saf uygulamasıdır. Uçaklardaki tabloları güncelleyemezsiniz — çoğu için kutunun servise gitmesi gerekir, bir filo için bu çok yıllı bir iştir. O hâlde kontrol edebildiğiniz tarafı, yani yeri, uçakların bildiği değere yakın tutarsınız. Gerçeklikle uyumu bilinçli olarak feda edip, filoyla uyumu korursunuz. Fairbanks'te ise tersi yapılmıştır: 2012'de gerçek değer 20,03 derece olduğu için 20 dereceye güncellemek hem gerçeğe hem muhtemelen filoya yakınsamayı sağlıyordu.

Raporun genel öneri listesinde ayrıca CAT II/III ILS tesisleri için eski manyetik sapma doğruluk standardı olan ±1 derecenin bir performans gereksinimi olarak yeniden yazılması, CAT I tesisleri için enleme bağlı olarak ±1–2 derece doğruluk istenmesi ve uçak üreticilerinden operatörlerin hangi konum ve zamanda hangi niteliklere ihtiyaç duyduğunu belgelemelerinin talep edilmesi yer alıyor.

---

## Modelin Kendi Sınırları

Epoch'u güncel tutmak her şeyi çözmez, çünkü modelin kendisinin de bir hata tabanı var.

**Model beş yılı tamamlayamayabilir.** WMM2015, 2018 başında performans spesifikasyonu toleranslarını 2018 sonu veya 2019 başında aşacağı öngörüsüyle karşılaştı. Teknik notun ifadesiyle: ızgara varyasyonunun karekök ortalama hatası, Dünya'nın dış çekirdeğindeki hızlı akışkan hareketleri nedeniyle — özellikle Kuzey kutup bölgesinde — **1 derecelik spesifikasyonu (MIL-PRF-89500A)** aşmak üzereydi. Bunun üzerine 2019 başında döngü dışı bir güncelleme, WMM2015v2 yayımlandı. Yani beş yıllık döngü bile çekirdek dinamiği karşısında garanti değil.

**Kabuk modellenmiyor.** WMM alanın yalnızca uzun dalga boylu, ağırlıkla dış çekirdek kaynaklı kısmını temsil eder. NOAA'nın kendi ifadesiyle Dünya kabuğunun ve üst mantonun, iyonosferin ve manyetosferin etkileri WMM'de temsil edilmez. Yerel sapma anomalileri nadiren de olsa 10 dereceyi aşabilir; 3–4 derecelik anomaliler yaygındır ama genellikle küçük alanları kapsar. WMM2015v2 teknik notunun hata bütçesinde kabuk kaynaklı sapma hatası 0,37 derece olarak hesaba katılıyor.

**Yatay alan zayıfladığında model çaresiz kalır.** NOAA'nın sapma belirsizliği, yatay şiddet $H$ cinsinden şöyle modellenir:

$$
\sigma_D = \sqrt{0{,}26^2 + \left(\frac{5417}{H}\right)^2} \quad \text{derece}
$$

Bu bir standart sapmadır ve $H$ küçüldükçe patlar. NOAA iki bölge tanımlar: $H < 2000$ nT olan **blackout zone** — pusulaların doğru olmadığı ve seyrüsefer için güvenilmemesi gereken bölge — ve onu çevreleyen $2000 \le H < 6000$ nT aralığındaki **caution zone**. Formülü bu eşiklerde değerlendirirsem caution zone sınırında $\sigma_D \approx 0{,}94$ derece, blackout sınırında $\sigma_D \approx 2{,}72$ derece çıkıyor.

Yukarıdaki havaalanları için hesapladığım yatay şiddetler ve belirsizlikler şöyle:

| Havaalanı | H (nT) | $\sigma_D$ |
|---|---|---|
| Antalya | 27.234 | 0,33° |
| İstanbul | 24.672 | 0,34° |
| Frankfurt | 20.118 | 0,37° |
| Anchorage | 15.219 | 0,44° |
| Fairbanks | 12.719 | 0,50° |
| Svalbard | 7.225 | 0,79° |

Hiçbiri caution zone'da değil. Yani Anchorage'daki problemin kaynağı modelin o noktadaki belirsizliği değil — belirsizlik 0,44 derece, gayet iyi. Problem tamamen **epoch farkı**ndan geliyor: alan hızla hareket ediyor ve iki veritabanı bu hareketi farklı zamanlarda yakalıyor. Bu ayrımı yapmak önemli, çünkü çözümü de belirliyor: daha iyi bir model değil, daha iyi bir konfigürasyon yönetimi gerekiyor.

---

## Türkiye'de Durum

Yukarıdaki tabloya Türkiye'den beş havaalanı koymamın nedeni, soruyu dürüstçe yanıtlayabilmekti: bu bizim problemimiz mi?

Sekuler varyasyon açısından **hayır.** Türkiye 37–42 derece enlem bandında ve sapmanın yıllık değişimi burada 0,02–0,05 derece mertebesinde. On yılda yarım derece. 3 derecelik delta MV sınırına ulaşmak için, mevcut hızlarla onlarca yıl — İstanbul için yaklaşık 66, Van için 154 yıl — gerekir. Türkiye'de konuşlu bir filo için IRU MagVar epoch'u, kendi başına operasyonel bir risk değil.

Ama bu, konunun bir Türk mühendisi ilgilendirmediği anlamına gelmiyor. Gerçekçi dört bağlam var:

**Yüksek enlemlere uçuyorsanız.** IRU tablosu uçakla birlikte gider; Antalya'da sorun çıkarmayan bir epoch, kuzey rotalarında veya kuzey Avrupa meydanlarında delta MV bütçesini zorlayabilir. Tablo ne uçtuğunuz prosedürü bilir ne de nerede olduğunuzun toleransını — PARC raporunun deyişiyle IRU veritabanı uçağın konumuna bağlıdır ve hangi prosedürün uçulduğuna dair hiçbir bilgisi yoktur.

**İkinci el veya devredilmiş aviyonik entegre ediyorsanız.** Bir LRU'nun MagVar epoch'u, parça numarasından ya da donanım sürümünden okunamaz. Kutunun en son ne zaman servise gittiğine bağlıdır. Entegrasyon yapıyorsanız bu, satıcıdan açıkça sormanız gereken bir veridir.

**Manyetik başlık üreten bir sistem tasarlıyorsanız.** Buradaki asıl mühendislik çıkarımı budur: manyetik sapma modelinin epoch'u bir **konfigürasyon öğesidir** ve izlenebilirliği kurulmalıdır. Hangi model, hangi epoch, hangi derece, hangi geçerlilik tarihi, hangi yüklenebilirlik yolu. AC 20-138C, aviyonik manyetik sapma veritabanlarının güncelliğini doğrudan ele alan ilk rehber dokümandır; PARC raporunun yazıldığı tarihte bu metnin henüz yeni kullanılmaya başlandığı ve ILS aviyoniği ile entegrasyonlarını kapsamadığı not ediliyor.

**Pist numaraları.** Pist tanımlayıcısı manyetik kerterizin en yakın on dereceye yuvarlanıp ona bölünmesiyle bulunur. Sapma kaydığında pist numarası da bir gün değişir — ve bu, eşik boyasından taksi yolu tabelalarına, haritalardan prosedürlere ve seyrüsefer veritabanlarına kadar koordineli bir değişikliktir. Türkiye'nin kayma hızlarında bu on yıllar mertebesinde bir mesele; ama bir yuvarlama sınırının hemen yanında duran bir pist için beklenenden erken gelebilir.

---

## Mühendislik Çıkarımları

Bu çalışmadan kendi adıma çıkardığım beş madde:

1. **Doğruluğu değil uyumu hedefleyin.** İki veritabanı arasındaki farkla sınırlanan bir sistemde, tek tarafı iyileştirmek performansı bozabilir. Gereksinimi "sapma şu kadar doğru olacak" diye değil, "şu iki kaynak arasındaki delta şu sınırın altında kalacak" diye yazın.
2. **Epoch'u konfigürasyon öğesi yapın.** Model adı, derecesi, epoch'u, geçerlilik sonu ve güncelleme yolu izlenebilir olmalı. Bir tarih alanı olmadan yaşlanan bir veritabanının sessizce bozulduğunu kimse fark etmez.
3. **Güncelleme maliyetini mimari karar olarak görün.** Tablonun yüklenebilir mi yoksa gömülü mü olduğu, on yıl sonra filo çapında bir operasyonel kısıt doğurur. PARC raporu, uçak üstünde veya kutu sökülmeden güncellenemeyen aviyoniğe sahip filolar için yeni sapma tablolarının devreye alınmasının çok yıllı bir süreç olabileceğini açıkça söylüyor.
4. **Yüksek enlemde manyetik referanstan vazgeçmeyi düşünün.** Kanada'nın Northern Domestic Airspace'i bu yolu seçmiş: bölgedeki 33 havaalanı kerteriz ve başlıkları manyetik yerine gerçek derece cinsinden gösteriyor, pist numaralandırması gerçek kuzeye göre yapılıyor, rüzgâr gerçek olarak veriliyor.
5. **Bağımsız bir model hesabıyla doğrulayın.** Bir kutunun verdiği manyetik başlığı, aynı konum ve tarih için bağımsız bir WMM/IGRF hesabıyla karşılaştırmak pahalı değil; yukarıdaki doğrulama saf Python'la ve resmî test vektörleriyle yapılabiliyor. Sahada kaybedilen saatlerin önüne geçer.

---

## Açık Sorular

Yazıyı yazarken yanıtlayamadığım, ilgilenen okur için açık bıraktığım sorular:

- PARC raporu, servis sağlayıcılarla uçak tarafının sapma güncelleme zamanlamasını eşleştirmesi için bir "lock-step" yöntemi öneriyor. Bu yaklaşım on yıl sonra hangi ölçüde uygulanabildi?
- Delta MV için OEM'lerin kullandığı 3 derecelik sınır, raporun belirttiği gibi oldukça tutarlı. Bu sayının türetildiği yanal kontrol analizi kamuya açık bir yerde belgelenmiş mi? Rapor, uçak entegrasyonlarındaki belirli sapma toleranslarının genellikle proprietary olduğunu söylüyor.
- WMMHR2025, ekvatorda yaklaşık 300 km çözünürlükle yayımlandı. Daha yüksek çözünürlüklü bir modelin aviyonik tablolara girmesi, uyum problemini iyileştirir mi yoksa iki taraf arasındaki farkı büyüterek kötüleştirir mi?

---

## Kaynaklar

- [PARC Magnetic Variation Recommendations (FAA, 17 Haziran 2013)](https://www.faa.gov/sites/faa.gov/files/about/office_org/headquarters_offices/avs/130617_PARCMagVarRecommendations.pdf) — Anchorage 2012 olayı, MV of Record süreci, IRU tabloları ve 3 derecelik delta MV sınırı için birincil kaynak.
- [World Magnetic Model (NOAA NCEI)](https://www.ncei.noaa.gov/products/world-magnetic-model) — WMM2025 katsayı dosyası, resmî test değerleri ve güncelleme talimatları.
- [WMM Accuracy, Limitations, and Error Model (NOAA NCEI)](https://www.ncei.noaa.gov/products/world-magnetic-model/accuracy-limitations-error-model) — sapma belirsizliği formülü, blackout ve caution zone tanımları, modellenmeyen katkılar.
- [Out-of-Cycle Update of the US/UK World Magnetic Model for 2015-2020 (BGS/NOAA, 2019)](http://geomag.bgs.ac.uk/documents/WMM2015v2_TechnicalNote.pdf) — WMM2015'in MIL-PRF-89500A spesifikasyonunu aşma öngörüsü ve WMM2015v2'nin gerekçesi.
- [IGRF-14 katsayıları (IAGA / NOAA)](https://www.ngdc.noaa.gov/IAGA/vmod/coeffs/igrf14coeffs.txt) — 1900'den bugüne DGRF/IGRF katsayıları; geçmiş epoch hesapları için kullandığım veri.
- [World Magnetic Model High Resolution (NOAA NCEI)](https://www.ncei.noaa.gov/products/world-magnetic-model-high-resolution) — WMMHR2025 ve çözünürlüğü.
- [MAG2TRUE: An avionics perspective](https://www.engineeringpilot.com/post/mag2true-an-avionics-perspective) — manyetik ve gerçek referanslar arasındaki geçişin aviyonik tarafından okunuşu.

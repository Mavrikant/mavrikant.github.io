---
title: "İki Flip-Flop Yeter mi? Senkronizatör MTBF'i ve Çok-Bitli CDC Tuzağı"
subtitle: "Are Two Flip-Flops Enough? Synchronizer MTBF and the Multi-Bit CDC Trap"
background: "/img/posts/4.webp"
date: '2026-08-27 07:30:00'
layout: post
lang: tr
mermaid: true
---

Asenkron bir sinyali kendi saat alanınıza almanız gerektiğinde verilen tavsiye hep aynıdır: *iki flip-flop koy, geç.* Bu cümle o kadar sık tekrarlandı ki artık bir mühendislik hesabı değil, bir folklor kuralı hâline geldi. Oysa arkasında ölçülmüş katsayıları olan, üstel davranan ve tasarımınızın saat frekansına akıl almaz derecede duyarlı bir formül var.

Bu yazıda birbirinden bağımsız iki soruyu ayrı ayrı ele alacağım. Birincisi: iki flip-flop gerçekten yetiyor mu? Yanıt "duruma göre" ve o "durum" sandığınızdan çok daha dar bir aralık. İkincisi, ve bence çok daha önemlisi: iki flip-flop, çözdüğünü sandığınız problemi gerçekten çözüyor mu? Burada yanıt çoğu zaman hayır — ve bu ikinci hata, birincisinden kabaca $10^{21}$ kat daha sık başınıza geliyor.

Yazı boyunca kullandığım sayılar uydurma değil; Microchip'in RTG4 ve PolarFire aileleri için yayımladığı ölçüm tabanlı karakterizasyon katsayılarından geliyor. Hesapları yeniden üretilebilir tutmak için kullandığım küçük betikleri de anlatacağım.

---

## Metastabilite: Kısa ve Dürüst Bir Tanım

Bir flip-flop'un veri girişi, saat kenarının etrafındaki setup ve hold penceresi içinde değişirse, flip-flop iç düğümlerini ne mantık-0 ne de mantık-1 olan dengesiz bir noktaya sürükleyebilir. Bu **metastabil** durumdur. Devre bir süre bu tepede kalır, sonra gürültünün ittiği tarafa doğru yuvarlanır.

Burada iki yaygın yanlış anlama var.

**Yanlış anlama 1: "Metastabilite çıkışta rastgele bir değer üretir."** Hayır. Sorun çıkışın hangi değere yerleşeceği değil — zaten asenkron bir sinyali örneklüyorsanız eski ya da yeni değeri yakalamanız ikisi de meşrudur. Sorun **ne zaman** yerleşeceğidir. Metastabil bir flip-flop'un çıkışı, bir sonraki aşamanın setup penceresini kaçıracak kadar geç kararlı hâle gelebilir; hatta ara değerde salınırken aşağı akıştaki iki farklı kapı tarafından farklı yorumlanabilir.

**Yanlış anlama 2: "Doğru flip-flop'u seçersem metastabilite olmaz."** Hiçbir flip-flop bağışık değildir; bu bir kusur değil, bistabil devrenin doğasıdır. Yapabileceğiniz tek şey, yerleşmenin gecikme ihtimalini kabul edilebilir bir seviyeye indirmektir.

İyi haber şu: metastabil durumdan çıkış olasılığı zamanla **üstel** olarak azalır. Flip-flop'a fazladan verdiğiniz her yerleşme süresi, başarısızlık olasılığını çarpan bir katsayıyla düşürür. Klasik iki flip-flop'lu senkronizatör de tam olarak bunu satın alır: birinci flip-flop metastabil olabilir, ikinci flip-flop onu bir saat periyodu sonra örnekler; aradaki süre birincinin yerleşmesi için ayrılmış bütçedir.

<div class="mermaid">
flowchart LR
  A[asenkron giriş] --> F1[FF1 - metastabil olabilir]
  F2[FF2 - yerleşmiş değer] --> U[hedef alan mantığı]
  F1 -->|Tmet yerleşme bütçesi| F2
  CK[hedef saat fc] -.-> F1
  CK -.-> F2
</div>

Buradaki kritik nokta şu: "bir saat periyodu" sabit bir güvence değildir. Frekans yükseldikçe o bütçe kısalır ve az sonra göreceğimiz gibi, sonuç doğrusal olarak değil üstel olarak kötüleşir.

---

## MTBF Bir Formüldür, Bir Slogan Değil

Senkronizatörün ortalama hata-arası süresi şöyle ifade edilir:

$$ \mathrm{MTBF} = \frac{e^{T_{met}/\tau}}{T_0 \cdot f_c \cdot f_d} $$

Burada $T_{met}$ birinci flip-flop'a tanınan **ek** yerleşme süresi, $\tau$ metastabil durumdan çıkışın zaman sabiti, $T_0$ metastabilite açıklığı (aperture), $f_c$ hedef saat frekansı ve $f_d$ asenkron verinin geçiş frekansıdır.

Microchip aynı denklemi ölçüme daha uygun bir biçimde yazıyor:

$$ \mathrm{MTBF} = \frac{e^{C_2 \cdot T_{met}}}{C_1 \cdot f_d \cdot f_c}, \qquad C_2 = \frac{1}{\tau}, \quad C_1 = T_0 $$

Bu ikinci biçim doğrudan ölçülebilir olduğu için önemli. $\ln(\mathrm{MTBF})$'i $T_{met}$'e karşı çizerseniz bir doğru elde edersiniz; eğimi $C_2$, kesişimi $C_1$'i verir. Üreticiler tam olarak bunu yapıyor: bir test devresi kurup saat kenarını veri geçişine göre kaydırıyor, milyarlarca çevrimde kaç metastabilite olayı olduğunu sayıyor ve doğruyu uyduruyorlar.

**$\tau$ ve $T_0$ türetilmez, ölçülür.** Sürece, sıcaklığa, besleme gerilimine ve hücre topolojisine bağlıdırlar. Bu yüzden "genel bir metastabilite hesabı" diye bir şey yoktur; hesap, kullandığınız aileye özeldir. Microchip'in AN6287 numaralı uygulama notunda iki aile için ölçülmüş katsayılar şöyle:

| Aile | $C_1 = T_0$ | $C_2 = 1/\tau$ | $\tau$ |
|---|---|---|---|
| RTG4 | $2.877 \times 10^{-5}$ s | $7.326 \times 10^{9}$ Hz | 136.5 ps |
| PolarFire | $2.45 \times 10^{-11}$ s | $2.1894 \times 10^{10}$ Hz | 45.7 ps |

Aradaki fark çarpıcı. RTG4 radyasyona dayanıklı, görece kaba bir süreçte üretilen bir FPGA; PolarFire daha ileri bir süreçte. $\tau$ üç kat daha küçük, $T_0$ ise **altı büyüklük mertebesi** daha küçük. Yani aynı yerleşme bütçesiyle PolarFire, RTG4'ten kıyaslanamayacak kadar iyi bir MTBF verir. Radyasyon dayanımı için ödediğiniz bedelin bir kalemi de budur.

### Hesabı Doğrulamak

Formülü kullanmadan önce doğru kurduğumdan emin olmak istedim. Microchip aynı uygulama notunda dört tane çözümlü örnek veriyor; bunları bağımsız olarak yeniden hesaplayan kısa bir Python betiği yazdım:

```python
import math
YEAR = 365 * 24 * 3600.0
C1, C2 = 2.877e-5, 7.326e9          # RTG4

def mtbf(tmet, fc, fd):
    return math.exp(C2 * tmet) / (C1 * fd * fc)

def tmet_for(target_s, fc, fd):
    return (math.log(target_s) + math.log(C1 * fd * fc)) / C2
```

Sonuçlar:

| Senaryo | Benim hesabım | Dokümandaki değer |
|---|---|---|
| RTG4, 100 MHz, 12.5 MHz, $T_{met}=0$ | 27.81 ps | 27.81 ps |
| RTG4, 100 MHz, 20 yıl için gereken $T_{met}$ | 6.08 ns | 6.08 ns |
| RTG4, 160 MHz, 20 yıl için gereken $T_{met}$ | 6.15 ns | 6.15 ns |
| PolarFire, 160 MHz, 80 MHz, $T_{met}=0$ | 3.19 µs | 3.19 µs |

Dördü de birebir tutuyor. Bundan sonraki sayılar bu doğrulanmış tabana dayanıyor.

Bu arada ilk satır kendi başına öğretici: yerleşme süresi tanımazsanız MTBF **27.81 pikosaniye** çıkıyor. Yani senkronizatör diye bir şeyiniz yok, sürekli hata üreten bir devreniz var. İki flip-flop'lu senkronizatörün tüm işlevi, o üsteldeki $T_{met}$'i sıfırdan bir saat periyoduna çıkarmaktır.

---

## Frekans Uçurumu

Şimdi asıl soruya gelelim. RTG4 üzerinde klasik 2-FF senkronizatör kuralım. Üretici veri sayfasına göre, tek olay geçici bozulma (SET) filtresi açıkken en kötü durum $T_{co} = T_{CLKQ} + T_{SUD} = 0.243 + 1.3 = 1.543$ ns. Birinci flip-flop'a kalan yerleşme bütçesi bir saat periyodu eksi bu değer:

$$ T_{met} = \frac{1}{f_c} - T_{co} $$

Asenkron veri geçiş hızını 12.5 MHz sabit tutup frekansı süpürelim:

| $f_c$ | Saat periyodu | Ulaşılabilir $T_{met}$ | 20 yıl için gereken | **Gerçekleşen MTBF** |
|---|---|---|---|---|
| 50 MHz | 20.00 ns | 18.46 ns | 5.99 ns | $9.3 \times 10^{40}$ yıl |
| 80 MHz | 12.50 ns | 10.96 ns | 6.05 ns | $8.0 \times 10^{16}$ yıl |
| 100 MHz | 10.00 ns | 8.46 ns | 6.08 ns | $7.1 \times 10^{8}$ yıl |
| 125 MHz | 8.00 ns | 6.46 ns | 6.11 ns | 247 yıl |
| 140 MHz | 7.14 ns | 5.60 ns | 6.13 ns | **151 gün** |
| 160 MHz | 6.25 ns | 4.71 ns | 6.15 ns | **4.6 saat** |
| 200 MHz | 5.00 ns | 3.46 ns | 6.18 ns | **1.4 saniye** |

Tablonun anlattığı hikâye şu: saat frekansını 100 MHz'den 160 MHz'e çıkardınız — yüzde 60'lık, son derece sıradan bir artış. Senkronizatörünüzün MTBF'i 700 milyon yıldan **dört buçuk saate** düştü. Aradaki fark **on iki büyüklük mertebesi**.

<figure>
<svg viewBox="0 0 760 430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="RTG4 2-FF ve 3-FF senkronizatör MTBF eğrisi" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
<g fill="none" stroke="currentColor" stroke-opacity="0.28" stroke-width="1">
<line x1="66" y1="378.0" x2="742" y2="378.0"/>
<line x1="66" y1="314.0" x2="742" y2="314.0"/>
<line x1="66" y1="250.0" x2="742" y2="250.0"/>
<line x1="66" y1="186.0" x2="742" y2="186.0"/>
<line x1="66" y1="122.0" x2="742" y2="122.0"/>
<line x1="66" y1="58.0" x2="742" y2="58.0"/>
<line x1="66.0" y1="26" x2="66.0" y2="378"/>
<line x1="165.4" y1="26" x2="165.4" y2="378"/>
<line x1="264.8" y1="26" x2="264.8" y2="378"/>
<line x1="364.2" y1="26" x2="364.2" y2="378"/>
<line x1="463.6" y1="26" x2="463.6" y2="378"/>
<line x1="563.1" y1="26" x2="563.1" y2="378"/>
<line x1="662.5" y1="26" x2="662.5" y2="378"/>
</g>
<g stroke="currentColor" stroke-width="1.4" fill="none"><path d="M66 26 L66 378 L742 378"/></g>
<g fill="currentColor" font-size="11" text-anchor="end">
<text x="59" y="382.0">10<tspan dy="-4" font-size="8">-10</tspan></text>
<text x="59" y="318.0">10<tspan dy="-4" font-size="8">0</tspan></text>
<text x="59" y="254.0">10<tspan dy="-4" font-size="8">10</tspan></text>
<text x="59" y="190.0">10<tspan dy="-4" font-size="8">20</tspan></text>
<text x="59" y="126.0">10<tspan dy="-4" font-size="8">30</tspan></text>
<text x="59" y="62.0">10<tspan dy="-4" font-size="8">40</tspan></text>
</g>
<g fill="currentColor" font-size="11" text-anchor="middle">
<text x="66.0" y="395">50</text>
<text x="165.4" y="395">75</text>
<text x="264.8" y="395">100</text>
<text x="364.2" y="395">125</text>
<text x="463.6" y="395">150</text>
<text x="563.1" y="395">175</text>
<text x="662.5" y="395">200</text>
<text x="404" y="416" font-size="12">hedef saat frekansı fc (MHz)</text>
</g>
<text transform="translate(15,202) rotate(-90)" fill="currentColor" font-size="12" text-anchor="middle">MTBF (yıl)</text>
<line x1="66" y1="305.7" x2="742" y2="305.7" stroke="currentColor" stroke-width="1.6" stroke-dasharray="7 4" stroke-opacity="0.75"/>
<text x="74" y="298.7" fill="currentColor" font-size="11" font-weight="600">20 yıl hedefi</text>
<polyline points="241.0,27.6 248.9,36.6 256.9,45.4 264.8,53.7 272.8,61.8 280.7,69.5 288.7,76.9 296.6,84.1 304.6,91.0 312.5,97.7 320.5,104.1 328.4,110.3 336.4,116.3 344.4,122.1 352.3,127.7 360.3,133.1 368.2,138.4 376.2,143.5 384.1,148.4 392.1,153.2 400.0,157.9 408.0,162.4 415.9,166.8 423.9,171.0 431.8,175.1 439.8,179.2 447.7,183.1 455.7,186.9 463.6,190.6 471.6,194.2 479.6,197.7 487.5,201.1 495.5,204.5 503.4,207.7 511.4,210.9 519.3,214.0 527.3,217.0 535.2,220.0 543.2,222.9 551.1,225.7 559.1,228.5 567.0,231.1 575.0,233.8 582.9,236.4 590.9,238.9 598.8,241.3 606.8,243.7 614.8,246.1 622.7,248.4 630.7,250.7 638.6,252.9 646.6,255.1 654.5,257.2 662.5,259.3 670.4,261.3 678.4,263.3 686.3,265.3 694.3,267.2 702.2,269.1 710.2,271.0 718.1,272.8 726.1,274.6 734.0,276.3 742.0,278.0" fill="none" stroke="#10b981" stroke-width="2.4" stroke-linejoin="round"/>
<polyline points="66.0,35.6 74.0,51.4 81.9,66.0 89.9,79.6 97.8,92.2 105.8,104.0 113.7,115.0 121.7,125.4 129.6,135.1 137.6,144.3 145.5,152.9 153.5,161.1 161.4,168.8 169.4,176.1 177.3,183.0 185.3,189.6 193.2,195.9 201.2,201.9 209.2,207.6 217.1,213.0 225.1,218.2 233.0,223.2 241.0,228.0 248.9,232.6 256.9,236.9 264.8,241.2 272.8,245.2 280.7,249.1 288.7,252.8 296.6,256.5 304.6,259.9 312.5,263.3 320.5,266.5 328.4,269.7 336.4,272.7 344.4,275.6 352.3,278.4 360.3,281.2 368.2,283.8 376.2,286.4 384.1,288.9 392.1,291.3 400.0,293.6 408.0,295.9 415.9,298.1 423.9,300.3 431.8,302.4 439.8,304.4 447.7,306.4 455.7,308.3 463.6,310.2 471.6,312.0 479.6,313.8 487.5,315.5 495.5,317.2 503.4,318.8 511.4,320.4 519.3,322.0 527.3,323.5 535.2,325.0 543.2,326.5 551.1,327.9 559.1,329.3 567.0,330.7 575.0,332.0 582.9,333.3 590.9,334.6 598.8,335.8 606.8,337.0 614.8,338.2 622.7,339.4 630.7,340.5 638.6,341.7 646.6,342.8 654.5,343.8 662.5,344.9 670.4,345.9 678.4,346.9 686.3,347.9 694.3,348.9 702.2,349.9 710.2,350.8 718.1,351.7 726.1,352.7 734.0,353.5 742.0,354.4" fill="none" stroke="#f59e0b" stroke-width="2.4" stroke-linejoin="round"/>
<polyline points="66.0,51.8 74.0,67.6 81.9,82.2 89.9,95.7 97.8,108.4 105.8,120.2 113.7,131.2 121.7,141.6 129.6,151.3 137.6,160.4 145.5,169.1 153.5,177.2 161.4,185.0 169.4,192.3 177.3,199.2 185.3,205.8 193.2,212.1 201.2,218.1 209.2,223.8 217.1,229.2 225.1,234.4 233.0,239.4 241.0,244.2 248.9,248.7 256.9,253.1 264.8,257.3 272.8,261.4 280.7,265.3 288.7,269.0 296.6,272.6 304.6,276.1 312.5,279.5 320.5,282.7 328.4,285.8 336.4,288.9 344.4,291.8 352.3,294.6 360.3,297.4 368.2,300.0 376.2,302.6 384.1,305.1 392.1,307.5 400.0,309.8 408.0,312.1 415.9,314.3 423.9,316.5 431.8,318.5 439.8,320.6 447.7,322.6 455.7,324.5 463.6,326.3 471.6,328.2 479.6,329.9 487.5,331.7 495.5,333.4 503.4,335.0 511.4,336.6 519.3,338.2 527.3,339.7 535.2,341.2 543.2,342.7 551.1,344.1 559.1,345.5 567.0,346.8 575.0,348.2 582.9,349.5 590.9,350.8 598.8,352.0 606.8,353.2 614.8,354.4 622.7,355.6 630.7,356.7 638.6,357.8 646.6,358.9 654.5,360.0 662.5,361.1 670.4,362.1 678.4,363.1 686.3,364.1 694.3,365.1 702.2,366.1 710.2,367.0 718.1,367.9 726.1,368.8 734.0,369.7 742.0,370.6" fill="none" stroke="#ef4444" stroke-width="2.4" stroke-linejoin="round"/>
<line x1="556" y1="32" x2="580" y2="32" stroke="#10b981" stroke-width="2.4"/>
<text x="586" y="36" fill="currentColor" font-size="11">3-FF, SET filtresi açık</text>
<line x1="556" y1="49" x2="580" y2="49" stroke="#f59e0b" stroke-width="2.4"/>
<text x="586" y="53" fill="currentColor" font-size="11">2-FF, SET filtresi kapalı</text>
<line x1="556" y1="66" x2="580" y2="66" stroke="#ef4444" stroke-width="2.4"/>
<text x="586" y="70" fill="currentColor" font-size="11">2-FF, SET filtresi açık</text>
</svg>
<figcaption><small>RTG4 üzerinde senkronizatör MTBF'i. Düşey eksen logaritmik ve elli büyüklük mertebesi kapsıyor — asıl mesele bu. 2-FF eğrileri 20 yıl hedef çizgisini 130.5 ve 145.3 MHz'de kesiyor; 3-FF eğrisi grafiğin sağ kenarının ötesinde, 257.9 MHz'de kesiyor.</small></figcaption>
</figure>

Bu davranışın nedeni doğrudan formülde. $T_{met}$, frekansla **doğrusal** olarak kısalıyor; MTBF ise $T_{met}$ ile **üstel** olarak değişiyor. Üstelin türevini alırsak pratik bir kural çıkıyor:

$$ \frac{d(\ln \mathrm{MTBF})}{d T_{met}} = C_2 = 7.326 \times 10^{9}\ \mathrm{s}^{-1} $$

Yani RTG4 için **kaybettiğiniz her 100 ps yerleşme süresi MTBF'i yaklaşık 2'ye böler**; her 1 ns ise 1500'e böler. Yerleşim aracının senkronizatör flip-flop'larını birbirinden biraz uzağa koyması, araya bir yönlendirme atlaması eklemesi — bunlar "birkaç yüz pikosaniye" diye geçiştirilen şeyler ve doğrudan MTBF'inizin katları hâlinde faturalanıyorlar.

Grafikteki kesişimler bir çapraz kontrol imkânı da veriyor. Benim hesabıma göre 2-FF senkronizatör 20 yıl hedefini **130.5 MHz**'de kaybediyor. Microchip aynı uygulama notunda, hesap ayrıntısına girmeden, RTG4 için genel bir tavsiye veriyor: *tasarım saat frekansı 125 MHz'i aştığında senkronizatör flip-flop sayısını ikinin üzerine çıkarın.* İki bağımsız yoldan gelen bu iki sayının bu kadar yakın çıkması, hem hesabın hem de tavsiyenin yerinde olduğunu gösteriyor.

---

## Radyasyon Sertliği Metastabilite Bütçesini Yiyor

Yukarıdaki tabloyu SET filtresi açıkken kurdum. Bu filtre, hücrenin içindeki tek olay geçici bozulmalarını (single event transient) süzmek için var — yani radyasyon ortamında çalışacak bir tasarımda büyük olasılıkla açık olacak. Bedeli ise veri kurulum süresinin 0.505 ns'den 1.3 ns'ye çıkması.

Aynı devreyi filtre kapalıyken hesaplayalım:

| $f_c$ | SET filtresi kapalı | SET filtresi açık |
|---|---|---|
| 125 MHz | $8.4 \times 10^{4}$ yıl | 247 yıl |
| 160 MHz | 64 gün | 4.6 saat |
| 200 MHz | 469 saniye | 1.4 saniye |

Fark sabit bir çarpan: $e^{C_2 \cdot 0.795\,\mathrm{ns}} \approx 338$. Yani **SET filtresini açmak, senkronizatörünüzün metastabilite MTBF'ini 338'e bölüyor.**

Bu, üzerinde düşünmeye değer bir tasarım gerilimi. Radyasyon kaynaklı geçici bozulmalara karşı sertleştirme yaparken, farkında olmadan metastabilite bütçenizden 0.8 ns çekip alıyorsunuz. İki mekanizma da "nadir, rastgele, yeniden üretilemez" arıza üretiyor ve sahada birbirinden ayırt edilmeleri neredeyse imkânsız. Emniyet analizinde bu iki katkının **ayrı ayrı** hesaplanması gerekiyor; birini azaltmak için yapılan şeyin diğerini artırdığını görmezseniz, bütçeyi iki kez yanlış kurarsınız.

---

## Üçüncü Flip-Flop Ne Satın Alır?

Senkronizatör zincirine bir flip-flop daha eklemek, birinci aşamaya tam bir saat periyodu daha yerleşme süresi verir. Üstelin içine giren bir tam periyot ise şu çarpanı üretir:

$$ e^{C_2 / f_c} $$

RTG4 için 160 MHz'de bu çarpan $e^{7.326 \times 10^9 / 160 \times 10^6} = e^{45.8} \approx 8 \times 10^{19}$:

| $f_c$ | 2-FF | 3-FF |
|---|---|---|
| 160 MHz | 4.6 saat | $4 \times 10^{16}$ yıl |
| 200 MHz | 1.4 saniye | $3.6 \times 10^{8}$ yıl |

Ödediğiniz bedel bir saat çevrimi gecikme. Aldığınız şey yirmi büyüklük mertebesi. Bu takasın bu kadar tek taraflı olduğu çok az mühendislik kararı vardır — ve buna rağmen "iki flip-flop" folkloru yüzünden üçüncü aşama çoğu zaman eklenmiyor.

Tersi de doğru: düşük frekanslarda üçüncü flip-flop tamamen israftır. 50 MHz'de 2-FF zaten $10^{40}$ yıl veriyor; oraya bir aşama daha eklemek yalnızca gecikme ve kaynak harcar. Karar frekansa bağlı ve bu yüzden **hesaplanması** gerekiyor.

---

## Tekil MTBF Değil, Tasarım MTBF'i

Şu ana kadar tek bir senkronizatörden konuştuk. Gerçek bir tasarımda onlarca, bazen yüzlerce senkronizatör zinciri olur. Bunlar bağımsız arıza kaynakları olduğu için oranları toplanır; yani tasarımın MTBF'i kabaca tekil MTBF'in senkronizatör sayısına bölümüdür:

$$ \mathrm{MTBF}_{\text{tasarım}} \approx \frac{\mathrm{MTBF}_{\text{tekil}}}{N} $$

Microchip'in kendi ifadesiyle: on senkronizatörlü bir tasarımda 20 yıllık bir hedefi tutturmak için formüle **200 yıl** girmeniz gerekir.

RTG4'te 100 MHz, SET filtresi açık senaryomuz için:

| Senkronizatör sayısı | Tasarım MTBF'i |
|---|---|
| 1 | $7.1 \times 10^{8}$ yıl |
| 10 | $7.1 \times 10^{7}$ yıl |
| 50 | $1.4 \times 10^{7}$ yıl |
| 200 | $3.6 \times 10^{6}$ yıl |

Bu örnekte $N$'in bir önemi yok, çünkü zaten astronomik bir paydan bölüyoruz. Ama tabloyu 140 MHz satırıyla kurun: tekil MTBF 151 gün, 50 senkronizatörle tasarım MTBF'i **3 gün**. $N$ ancak marj yokken canınızı yakıyor — yani tam da fark etmeniz gereken yerde.

Pratik sonuç: tasarımınızda kaç senkronizatör olduğunu **bilmeniz** gerekiyor. AMD'nin Vivado aracındaki `report_synchronizer_mtbf` komutu tam olarak bunu yapıyor — her CDC senkronizatör zinciri için MTBF veriyor ve hepsini kapsayan bir toplam MTBF raporluyor. İki kısıtı var: yalnızca UltraScale ailelerinde çalışıyor (7 serisi desteklenmiyor) ve senkronizatör flip-flop'larının `ASYNC_REG` özelliğinin `TRUE` olması şart — aksi hâlde araç onları senkronizatör olarak tanımıyor.

---

## Asıl Tuzak: İki Flip-Flop Veri Bütünlüğünü Çözmez

Şimdi yazının asıl meselesine geldik. Yukarıdaki her şey **tek bitlik** bir sinyal için geçerli. Peki bir sayacı, bir durum kodunu, bir zaman damgasını karşı alana geçirmek istiyorsanız?

En sık görülen refleks: her bite bir 2-FF senkronizatör koymak. Bu, tasarımı gözden geçiren birinin gözüne son derece düzenli görünür — her hat korunmuş, kural uygulanmış. Ve tamamen bozuktur.

Nedeni şu: 2-FF senkronizatör **bit başına** bir problemi **bit başına** çözer. Metastabiliteyi bastırır. Ama bir kelimenin bitleri arasındaki *tutarlılık* bit başına bir özellik değildir. Bitler kaynak alanda aynı kenarda değişir, fakat farklı yönlendirme yollarından geçtikleri için hedef flip-flop'lara birkaç yüz pikosaniyelik farkla ulaşırlar. Hedef saat kenarı tam o aralığa düşerse, bazı bitler yeni değeri, bazıları eski değeri yakalar. Ortaya çıkan kelime, kaynak alanda **hiç var olmamış** bir değer olabilir.

Bunu göstermek için küçük bir simülasyon yazdım. Simülasyonda **metastabilite hiç yok** — bu kasıtlı. Tek modellediğim şey, bit hatlarının her birinin kendine ait sabit bir yönlendirme gecikmesi olması:

```python
N_BITS, F_SRC, F_DST = 8, 100e6, 77e6
SKEW_PS, N_EDGES, SEED = 150, 2_000_000, 20260827

rng = random.Random(SEED)
# yerleşim sonrası her bit hattının sabit gecikmesi
skew = [rng.uniform(-SKEW_PS, SKEW_PS) * 1e-12 for _ in range(N_BITS)]
...
    # bu bit, t_tr + skew[b] anında değişiyor
    bit = new_bit if t_d >= t_tr + skew[b] else old_bit
```

100 MHz'lik bir kaynak alandaki 8 bitlik sayacı, 77 MHz'lik hedef alana geçiriyoruz. Bit skew'i ±150 ps, yani toplam 300 ps'lik bir yayılım: kaynak saat periyodunun yüzde üçü ve hiçbir zamanlama raporunda alarm çalmayacak bir değer. İki milyon hedef saat kenarı boyunca sonuç:

| | Düz ikili sayaç | Gray kodlu sayaç |
|---|---|---|
| Geçiş penceresine denk gelen örnek | 1739 (%0.087) | 1142 (%0.057) |
| **Hayalet değer** (ne eski ne yeni) | **1739 (%0.087)** | **0** |
| En kötü sayısal hata | 107 LSB | — |
| Ortalama hayaletler-arası süre | 14.9 µs | — |

En kötü olayı tek tek açalım. Sayaç 127'den 128'e geçiyor, yani sekiz bitin **hepsi** birden değişiyor. Hedef saat kenarı geçiş anına denk geliyor:

```text
bit numarası :   7     6     5     4     3     2     1     0
skew (ps)    : +39.6 -28.2 -36.0  +2.3 -28.0 +36.3 -104.6 +7.7
eski (127)   :   0     1     1     1     1     1     1     1
yeni (128)   :   1     0     0     0     0     0     0     0
örneklenen   :   0     0     0     1     0     1     0     1   ->  21
```

Negatif skew'li bitler (1, 3, 5, 6) yeni değerlerine çoktan geçmiş, örneklenirken 0 okunuyor. Pozitif skew'li bitler (0, 2, 4, 7) henüz değişmemiş, eski değerlerini veriyor. Sonuç `00010101`, yani **21**. Sayaç 127'den 128'e giderken hedef alan 21 okudu. 107 LSB'lik bir hata; ve bu hata, her bitin arkasında kusursuz çalışan bir 2-FF senkronizatör varken oluştu.

Gray kodunda ise hayalet değer **sıfır**. Sebebi basit: Gray kodunda ardışık değerler arasında yalnızca bir bit değişir. Geçiş penceresine denk gelen örnek yine oluyor (1142 kez), ama tek değişen bit ya eski ya yeni değerini verdiği için sonuç ya eski ya yeni sayıdır — hiçbir zaman geçersiz bir ara değer değil. En kötü ihtimalle **bir çevrim bayat** bir veri okursunuz, ki bu senkronizatörden zaten beklediğiniz şeydir.

### Ölçek Farkı

Şimdi iki riski yan yana koyalım. Aynı 100 MHz'lik tasarımda:

- **Metastabilite** kaynaklı hata: yaklaşık her $7 \times 10^{8}$ yılda bir, yani $2.2 \times 10^{16}$ saniyede bir.
- **Veri bütünlüğü** kaynaklı hata: yaklaşık her $1.5 \times 10^{-5}$ saniyede bir.

Aradaki oran kabaca $10^{21}$. Yani mühendislerin üzerine kitap okuduğu, forum tartıştığı, üretici uygulama notu indirdiği risk; görmezden geldikleri riskten **sekstilyon kat** daha nadir. Üstelik ikinci risk sessiz: hedef alan geçersiz bir sayı okur, onunla bir karar verir, bir sonraki çevrimde değer normale döner. Ne bir bayrak kalkar ne bir kesme oluşur. Saniyede altmış binden fazla bozuk okuma yapan bir arayüzünüz vardır ve zamanlama raporunuz yemyeşildir.

### Ne Yapmalı

Çok bitli bir değeri saat alanı sınırından geçirmenin üç meşru yolu var:

**Gray kodlama.** Yalnızca ardışık değerler arasında ±1 değişen büyüklükler için geçerli — yani sayaçlar ve FIFO işaretçileri. Değeri atlayarak değişen bir kaydı Gray'e çevirmek işe yaramaz; iki Gray değeri arasında birden çok bit farkı varsa aynı hayalet problemi geri gelir. Bu kısıt sık sık gözden kaçıyor.

**El sıkışma (handshake).** Kaynak alan veriyi sabit tutar, bir `req` biti kaldırır; hedef alan yalnızca `req`'i senkronize eder, veriyi doğrudan (senkronizatörsüz) okur ve `ack` ile yanıt verir. Burada senkronize edilen tek şey kontrol bitidir; veri, `req` geldiğinde zaten oturmuş durumdadır. Yavaştır ama her tür veriyle çalışır.

**Asenkron FIFO.** Gray kodlu işaretçileri el sıkışmayla birleştiren, iki alan arasında sürekli veri akışı gerektiğinde doğru çözüm. Cliff Cummings'in SNUG bildirileri bu yapının fiilî standardı hâline geldi.

Ve araç tarafında: Vivado'da CDC yollarına `set_false_path` koymak artık tavsiye edilmiyor, çünkü yolun gecikmesini tamamen serbest bırakır. Doğru yaklaşım gecikmeyi `set_max_delay -datapath_only` ile sınırlamak; bit hatları arasındaki skew'i doğrudan denetlemek içinse `set_bus_skew` var. Simülasyonumda parametre olarak verdiğim ±150 ps, tam olarak `set_bus_skew`'in kısıtladığı büyüklüktür.

---

## Sertifikasyon Tarafı

Bu konunun aviyonik tarafı, çoğu kişinin beklediğinden daha az ve daha çok normatif.

**Daha az:** FAA'nın AC 20-152A dokümanı (7 Ekim 2022 tarihli; 30 Haziran 2005 tarihli AC 20-152'yi iptal ediyor) ne metastabiliteden ne de senkronizatör MTBF'inden söz ediyor. DO-254 de bir MTBF hedefi dayatmıyor. Yani "kaç yıl yeterlidir" sorusunun standart tarafından verilmiş bir yanıtı yok; bunu tasarım güvence argümanınızın parçası olarak siz gerekçelendireceksiniz. Yukarıdaki gibi ölçülmüş üretici katsayılarına dayanan bir hesap, o gerekçenin en savunulabilir biçimidir.

**Daha çok:** AC 20-152A, tasarımın karmaşıklık değerlendirmesinde kullanılacak ölçütler arasında sayısal tasarımın **senkron mu asenkron mu** olduğunu ve **bağımsız saat sayısını** açıkça sayıyor. Bu, mimari bir kararın doğrudan sertifikasyon yüküne dönüştüğü ender ve somut örneklerden biri: tasarımınıza eklediğiniz her bağımsız saat, karmaşıklık argümanınızı ve dolayısıyla üretmeniz gereken kanıtı büyütüyor. "Nasıl olsa senkronizatör koyarız" diye eklenen bir saat alanı, bedelini yalnızca MTBF bütçesinden değil, sertifikasyon paketinden de alıyor.

Bir de kapsam notu: AC 20-152A, tek olay etkilerini (SEE) kapsamadığını açıkça belirtiyor. Yukarıda SET filtresinin metastabilite bütçesini nasıl yediğini gördük — bu iki mekanizmanın kesiştiği yer, tam olarak hiçbir dokümanın sizin yerinize düşünmediği yer.

---

## Pratik Kontrol Listesi

1. **Hesaplayın, varsaymayın.** Kullandığınız ailenin $\tau$ ve $T_0$ değerlerini bulun ve gerçek frekansınızla MTBF'i çıkarın. On satırlık bir betik yeter.
2. **Frekansı değiştirdiğinizde hesabı tekrarlayın.** Saat frekansını yükseltmek, senkronizatörleri sessizce geçersiz kılan bir değişikliktir; hiçbir araç bunu size hata olarak bildirmez.
3. **Senkronizatörlerinizi sayın.** Tasarım MTBF'i tekil MTBF bölü $N$'dir. UltraScale kullanıyorsanız `report_synchronizer_mtbf` bunu sizin için yapar.
4. **`ASYNC_REG = TRUE` koyun.** Hem sentezin senkronizatör hücrelerini optimize etmesini engeller, hem de yerleştiricinin flip-flop'ları birbirine yakın koymasını sağlar. Kazandığınız her 100 ps, RTG4 örneğinde MTBF'i iki katına çıkarır.
5. **Kaynak flip-flop ile birinci senkronizatör flip-flop'u arasına kombinasyonel mantık koymayın.** Oradaki her kapı, yerleşme bütçesinden doğrudan düşer.
6. **Çok bitli hiçbir şeyi bit-paralel senkronizatörden geçirmeyin.** Sayaç ise Gray, akış ise asenkron FIFO, tekil transfer ise el sıkışma.
7. **CDC yollarını `set_false_path` ile susturmayın.** `set_max_delay -datapath_only` ve gerektiğinde `set_bus_skew` kullanın.
8. **Radyasyon sertleştirme seçeneklerinin zamanlama bedelini metastabilite bütçesine yansıtın.** SET filtresi bedava değil.

---

## Sonuç

"İki flip-flop koy" tavsiyesi yanlış değil; eksik. Eksik olan kısmı şu: iki flip-flop, birinci flip-flop'a bir saat periyodu yerleşme süresi satın alan bir yapıdır ve o periyodun yeterli olup olmadığı tamamen sizin frekansınıza, kullandığınız hücrenin ölçülmüş katsayılarına ve tasarımınızdaki senkronizatör sayısına bağlıdır. RTG4 örneğinde aynı devre 100 MHz'de 700 milyon yıl, 160 MHz'de dört buçuk saat dayanıyor. Tavsiye değişmedi, cevap değişti.

Ama bence asıl ders ikinci yarıda. Metastabilite, hakkında en çok yazılan ve en iyi anlaşılan CDC riski; buna karşılık iyi tasarlanmış bir senkronizatörde pratikte hiç gerçekleşmiyor. Çok bitli veri bütünlüğü ise hakkında en az düşünülen risk ve simülasyonumda saniyede altmış binden fazla bozuk okuma üretti — hem de hiç metastabilite olmadan, yalnızca yüz elli pikosaniyelik bir yönlendirme farkıyla. Bir hata modunun ne kadar iyi bilindiği ile ne kadar sık gerçekleştiği arasında hiçbir bağ olmadığını hatırlatan güzel bir örnek.

Yazıdaki hesapları yeniden üretmek isteyenler için: MTBF betiği üreticinin yayımladığı dört çözümlü örneği birebir veriyor, CDC simülasyonu ise sabit tohumla (20260827) çalışıyor. İkisi de yüz satırın altında ve kendi ailenizin katsayılarıyla çalıştırmanız birkaç dakika sürer. Tavsiyem, kendi tasarımınızın sayısını görmeden bu yazıdaki hiçbir sonuca güvenmemeniz.

---

## Kaynaklar

- [Microchip AN6287 (eski adıyla AC474) — RTG4 and PolarFire Family Metastability Characterization Report](https://ww1.microchip.com/downloads/aemDocuments/documents/FPGA/ApplicationNotes/ApplicationNotes/microsemi_rtg4_metastability_characterization_report_application_note_ac474_v1.pdf) — MTBF denklemleri, ölçülmüş $C_1$/$C_2$ katsayıları ve çözümlü örnekler
- [FAA AC 20-152A — Development Assurance for Airborne Electronic Hardware (7 Ekim 2022)](https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_20-152A.pdf) — karmaşıklık ölçütleri, iptal ettiği doküman ve SEE kapsam notu
- [AMD UG903 — CDC Synchronizers and ASYNC_REG Property](https://docs.amd.com/r/en-US/ug903-vivado-using-constraints/CDC-Synchronizers-and-ASYNC_REG-Property)
- [AMD UG903 — set_bus_skew](https://docs.amd.com/r/en-US/ug903-vivado-using-constraints/set_bus_skew-Example-One)
- [AMD UG835 — report_synchronizer_mtbf](https://docs.amd.com/r/2023.2-English/ug835-vivado-tcl-commands/report_synchronizer_mtbf) — UltraScale kısıtı ve `ASYNC_REG` gereksinimi
- [AMD UG949 — Defining Clock Groups and CDC Constraints](https://docs.amd.com/r/en-US/ug949-vivado-design-methodology/Defining-Clock-Groups-and-CDC-Constraints) — `set_false_path` yerine `set_max_delay -datapath_only`
- [Clifford E. Cummings — Clock Domain Crossing (CDC) Design & Verification Techniques Using SystemVerilog, SNUG Boston 2008](https://www.paradigm-works.com/technical-library?term=clock+domain+crossing+%28cdc%29+design+%26+verification+techniques+using+systemverilog)

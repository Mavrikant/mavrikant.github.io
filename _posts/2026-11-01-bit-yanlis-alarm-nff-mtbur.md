---
title: "Söktük, Test Ettik, Arıza Yok: BIT Yanlış Alarmlarının Aritmetiği"
subtitle: "No Fault Found: The Arithmetic of BIT False Alarms and MTBUR"
background: "/img/posts/bit-yanlis-alarm-nff-cover.webp"
date: '2026-11-01 19:30:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [aviyonik, emniyet-kritik, test, gomulu-sistemler]
---

Uçak iner, bakım ekranında bir arıza mesajı durur. Teknisyen ilgili LRU'yu söker,
yerine yedeğini takar, uçak uçmaya devam eder. Sökülen kutu atölyeye gider, otomatik
test ekipmanına bağlanır ve bütün testleri geçer. Rapora şu yazılır: **arıza
bulunamadı.**

Bu senaryoyu bir kez duyduğunuzda talihsiz bir tesadüf gibi gelir. Sayılara
baktığınızda ise anlarsınız ki tesadüf değil, **norm**. Aviyonikte sökülen
kutuların yaklaşık yarısında hiçbir arıza bulunamıyor. Bu yazıda önce bu oranın ne
kadar büyük olduğunu yayımlanmış verilerle göstereceğim; sonra BIT (Built-In Test)
tasarımının içindeki asıl gerilimi — yanlış alarmı bastırmakla aralıklı arızayı
görmek arasındaki ödünleşmeyi — matematiksel olarak türetip Monte Carlo ile
doğrulayacağım. Sonunda elimizde, bir onay filtresinin ne zaman işe yaradığını, ne
zaman sadece körlük ürettiğini söyleyen kapalı formda bir eşitsizlik olacak.

---

## Önce Sayılar: NFF Bir İstisna Değil

Sektörün bu olaya verdiği ad **No Fault Found (NFF)** — ya da bazı
organizasyonlarda Cannot Duplicate (CND), Retest OK (RTOK). Aviyonikte NFF
seviyesinin %20 ile %50 arasında olduğu birden fazla çalışmada bildiriliyor ve bu
oran, planlanmamış LRU sökümlerinin yaklaşık %27'sine karşılık geliyor.

En somut ve bizim için en ilginç veri kümesi, Türk Hava Kuvvetleri'nin F-16
aviyonik bakım kayıtlarından geliyor. Mustafa Ilarslan (TuHK F-16 deposunda
aviyonik sistem mühendisi) ve Louis Y. Ungar'ın IEEE
*Instrumentation &amp; Measurement Magazine*'de yayımladığı çalışma, 2013-2014
döneminde I-level bakıma dönen birimleri teknoloji tipine göre ayırıyor:

| Teknoloji tipi | Dönen birim | NFF | NFF oranı |
|---|---:|---:|---:|
| RF | 319 | 94 | %29,5 |
| Karma (mixed) | 232 | 130 | %56,0 |
| Dijital | 368 | 175 | %47,6 |
| Analog | 54 | 34 | %63,0 |
| **Toplam** | **973** | **433** | **%44,5** |

973 birimin 433'ünde arıza bulunamamış. Yazarlar bu oranın literatürdeki
beklentilerin biraz **altında** olduğunu, yani TuHK'nın görece iyi durumda
olduğunu söylüyor — ki bu, sorunun büyüklüğü hakkında ayrıca bir şey anlatıyor.

İkinci tablo daha da çarpıcı. Ungar'ın depo seviyesine ulaşan birimler için
verdiği beklenen dağılım şöyle:

| Arıza tipi | Beklenen pay |
|---|---:|
| Kalıcı arıza - persistent fault | %14,3 |
| NFF — aralıklı arıza kaynaklı | %14,3 |
| NFF — yanlış alarm kaynaklı | %71,4 |

Depoya gelen her yedi birimden yalnızca biri gerçekten bozuk. Geri kalanın büyük
kısmı, hiç arızalanmamış bir kutunun yanlış bir arıza bildirimi yüzünden
sökülmesinden ibaret.

Bu tabloların maliyet tarafı da ölçülmüş: aviyonik bakım, modern bir uçağın bakım
maliyetinin %30'una kadar çıkabiliyor ve aviyonik bileşenler, doğrulanamayan
arızaların %80,4'ünü oluşturuyor.

---

## İki Farklı Güvenilirlik: MTBF ve MTBUR

Buradaki kafa karışıklığının kaynağı, iki ayrı büyüklüğün aynı kelimeyle
("güvenilirlik") anılması. Ayrımı net koymak gerekiyor:

- **MTBF** (Mean Time Between Failures): iki *gerçek* arıza arasındaki ortalama
  süre. Bileşen fizikine, sıcaklığa, derating'e bağlı. Üreticinin datasheet'inde
  yazan sayı budur.
- **MTBUR** (Mean Time Between Unscheduled Removals): iki *söküm* arasındaki
  ortalama süre. Kutunun gerçekten bozuk olup olmadığına değil, **BIT'in ne
  dediğine** bağlı.

İşletmeci için fatura kesen büyüklük MTBF değil MTBUR'dur. Yedek stoğu, atölye
kapasitesi, AOG riski — hepsi söküm hızıyla ölçeklenir. Ve bu ikisi birbirinden
sistematik olarak ayrılır.

Kayton ve Fried'in *Avionics Navigation Systems* kitabındaki kabaca kural, modern
aviyonikte **MTBUR'un MTBF'in yaklaşık %50'si** olduğu; bu farkın doğrudan işletme
maliyetlerini yaklaşık %40 artırdığı belirtiliyor. Raza ve Ulansky'nin
kullandığı somut örnekte ise bir A380 ADIRU birimi (Honeywell HG2030BE) için
MTBF 40.000 saat, MTBUR 23.500 saat veriliyor.

> **Kaynak uyarısı:** Bu iki sayı için atıf verilen yer bir ihracat/gümrük veri
> tabanı. Dolayısıyla 40.000 ve 23.500'ü üretici beyanı gibi değil, "sektörde
> dolaşan mertebe" olarak okumak doğru olur. Aşağıdaki akıl yürütme tek bir
> birimin kesin rakamına değil, **orana** dayanıyor.

Şimdi üç bağımsız kaynağı yan yana koyun. Her biri aynı soruyu farklı yoldan
yanıtlıyor: *sökümlerin ne kadarı gerçek bir kalıcı arızadan kaynaklanmıyor?*

| Kaynak | Yöntem | Kalıcı arıza dışı söküm payı |
|---|---|---:|
| Kayton &amp; Fried kuralı | MTBUR ≈ 0,50 × MTBF | %50 |
| ADIRU örneği | 1 − 23.500 / 40.000 | %41,3 |
| TuHK ölçümü | 433 / 973 | %44,5 |

Üç yöntem %41 ile %50 arasında buluşuyor. Birbirinden tamamen bağımsız bu üç
sayının bu kadar yakın çıkması, "sökümlerin kabaca yarısı boşa" ifadesini bir
anekdot olmaktan çıkarıp mühendislik tasarımında hesaba katılması gereken bir
parametre haline getiriyor.

---

## Aralıklı Arıza: Elektronik Değil, Mekanik Bir Olay

NFF'in baş sorumlusu **aralıklı arıza** (intermittent fault). Burada sezgiye ters
bir nokta var: modern yarı iletken bileşenler o kadar güvenilir hâle geldi ki,
aralıklı arızaların kökeni artık ağırlıklı olarak **mekanik**. Literatürde sayılan
tipik kaynaklar: elektrik kablajı, lehim bağlantıları, ekran örgüsü (screening
braid), konnektörler ve entegre devre içindeki metal hatlar.

Yani arıza, uçuş sırasındaki titreşim, termal çevrim ve nem altında ortaya çıkıp
uçak yere indiğinde kaybolan bir şey. Klasik otomatik test ekipmanının (ATE) bunu
neden yakalayamadığı da buradan çıkıyor. Literatürdeki gerekçeler şöyle
sıralanıyor:

1. İzlenen parametreler genellikle kısa bir süre boyunca ve bir kez test edilir;
   bu an, aralıklı arızanın oluştuğu anla çakışmaz.
2. Test sinyalinin dijital olarak ortalanması, taranması ve örneklenmesi aralıklı
   arızaları kaçırır.
3. Sökülen birim, arızanın oluştuğu çalışma ortamı yerine laboratuvarda test
   edilir.
4. Klasik ATE kalıcı arızaları, bozuk bileşenleri, kısa devre ve kopuklukları
   bulmak için tasarlanmıştır; aralıklı arıza teşhisi için değil.
5. Aralıklı arızalar belirli bir arıza örüntüsüne uymaz.

İkinci madde bu yazının teknik çekirdeği. Bir sinyali ortalamak gürültüyü bastırır
— ve tam olarak aynı mekanizmayla, kısa süreli gerçek bir bozulmayı da bastırır.
Bruce Sorensen'in 2003'te *Air Safety Week*'te kullandığı ifadeyle dijital
ortalama alma, no-fault-found'un arkasındaki "sigarası tüten tabanca". BIT
tasarımcısı bu bastırmayı tesadüfen değil, **bilerek** yapar. Nedeni ise bir
sonraki bölümde.

---

## BIT'in İçindeki Tasarım Kararı: Onay Filtresi

Bir BIT testini her çalıştırdığınızda, sağlam bir birimde bile küçük bir
olasılıkla "fail" sonucu alırsınız. Gürültü, besleme dalgalanması, ADC'nin son
biti, eşiğe çok yakın bir ölçüm — sebep ne olursa olsun, örnek başına sıfır
olmayan bir yanlış pozitif olasılığı vardır.

Testi saniyede bir çalıştırıyorsanız, iki saatlik bir uçuş bacağında 7200 kez
çalıştırmış olursunuz. Örnek başına yanlış pozitif olasılığı yalnızca $10^{-3}$
olsa bile, bacak başına beklenen yanlış "fail" sayısı 7,2'dir. Tek bir "fail"
gördüğünde arıza mesajı yazan bir BIT, uçakları neredeyse **her bacakta** boş yere
söktürür.

Çözüm, sektörde kalıcılık (persistence) ya da onay (confirmation) filtresi denen
şey: arıza mesajını ancak **$k$ ardışık** "fail" gördükten sonra kilitle.

<div class="mermaid">
stateDiagram-v2
    Saglam --> Aday1 : fail
    Aday1 --> Saglam : pass
    Aday1 --> Aday2 : fail
    Aday2 --> Saglam : pass
    Aday2 --> Kilitli : fail
    Kilitli --> Kilitli : mesaj kalıcı
</div>

Yukarıdaki $k = 3$ için. Mantık basit ve ikna edici: gürültü ardışık üç kez aynı
yöne sapmaz, gerçek arıza ise saplar. Sorun şu ki bu mantık, arızanın **yeterince
uzun sürdüğünü** varsayıyor. Aralıklı arıza tam olarak bu varsayımı ihlal eden
şeydir.

---

## Türetim

Modeli olabildiğince az parametreyle kuralım.

- $T$ — uçuş bacağı süresi, $\Delta$ — BIT test periyodu, dolayısıyla bacak başına
  örnek sayısı $N = T/\Delta$.
- $q$ — sağlam birimde örnek başına yanlış "fail" olasılığı (bağımsız).
- $\bar\tau$ — aralıklı arıza epizodunun ortalama süresi; epizod boyunca test
  "fail" okur.
- $\lambda_p$ — kalıcı arıza hızı, $C$ — BIT'in kalıcı arıza kapsaması.
- $\lambda_i$ — aralıklı arıza epizodu varış hızı.
- Arıza mesajı $k$ ardışık "fail" ile kilitlenir.

### Yanlış alarm olasılığı

Sağlam bir birimde, bacak başına yanlış alarm olasılığı, $N$ bağımsız
Bernoulli($q$) denemesi içinde $k$ uzunluğunda bir "fail" serisi görme
olasılığıdır. $N q^k \ll 1$ rejiminde seriler çakışmaz ve basit bir birlik sınırı
yeterince keskindir:

$$P_{\text{ya}}(k) \;\approx\; (N-k+1)\,q^{k} \;\approx\; N q^{k}$$

Bu yaklaşımı aşağıda tam değerle karşılaştıracağım; tam değer, durumu "o anki
ardışık fail sayısı" olan bir Markov zincirinden çıkıyor.

### Aralıklı arızanın yakalanma olasılığı

$\bar\tau$ ortalamalı üstel dağılımlı bir epizodun $k$ ardışık örneği
kapsayabilmesi için kabaca $\tau \ge k\Delta$ olması gerekir:

$$P_{\text{tespit}}(k) \;=\; \Pr(\tau \ge k\Delta) \;=\; e^{-k\Delta/\bar\tau}$$

### Kritik eşik

İki olasılık da $k$ ile birlikte düşüyor. Tasarımın kaderini, **hangisinin daha
hızlı düştüğü** belirliyor. Oranı bir başarım ölçütü olarak alalım:

$$\mathrm{FOM}(k) \;=\; \frac{P_{\text{tespit}}(k)}{P_{\text{ya}}(k)} \;=\; \frac{e^{-k\Delta/\bar\tau}}{N q^{k}}$$

Logaritmasını alınca $k$ doğrusal olarak ayrılıyor:

$$\ln \mathrm{FOM}(k) \;=\; k\left(\ln\frac{1}{q} - \frac{\Delta}{\bar\tau}\right) - \ln N$$

Buradan çıkan sonuç şu: onay filtresini uzatmak ancak parantez içi pozitifse işe
yarar. Yani

$$\bar\tau \;>\; \frac{\Delta}{\ln(1/q)} \;\equiv\; \tau^{\star}$$

**Onay filtresi, aralıklı arıza epizodu $\tau^{\star}$ eşiğinden uzunsa işinize yarar;
kısaysa yalnızca körlük üretir.** Eşik, test periyodunun yanlış pozitif
olasılığının logaritmasına bölümü. $\Delta = 1$ s ve $q = 10^{-3}$ için
$\tau^{\star} = 1/\ln(1000) \approx 0{,}145$ s.

Dikkat edilmesi gereken nokta: eşik $q$'ya yalnızca logaritmik olarak bağlı.
Yanlış pozitif olasılığını $10^{-3}$'ten $10^{-4}$'e çekmek — ki bu ciddi bir
donanım çabasıdır — eşiği yalnızca $0{,}145$ s'den $0{,}109$ s'ye, yani dörtte
bir oranında düşürür. Buna karşılık eşik $\Delta$'ya doğrusal bağlı: örnekleme
periyodunu yarıya indirmek eşiği doğrudan yarıya indirir. **Örnekleme hızını
artırmak, test doğruluğunu artırmaktan çok daha etkili bir koldur.**

---

## Sayılarla Doğrulama

Türetimin iki zayıf noktası var: $P_{\text{ya}}$ için birlik sınırı yaklaşımı ve
$P_{\text{tespit}}$ için "kabaca $\tau \ge k\Delta$" adımı. İkisini de kontrol
edelim. Yanlış alarm olasılığını tam olarak hesaplamak için Monte Carlo uygun
değil — $k=4$'te olasılık $10^{-9}$ mertebesinde, güvenilir bir tahmin için
$10^{10}$ civarı örnek gerekir. Onun yerine run-length Markov zincirini doğrudan
çözüyorum. Tespit tarafında ise örnekleme fazını da hesaba katan bir Monte Carlo
kullanıyorum.

```python
import random

def p_fa_exact(N, q, k):
    """N Bernoulli(q) denemesinde k ardışık 'fail' görme olasılığı (tam)."""
    st = [0.0] * k          # durum: o anki ardışık fail uzunluğu 0..k-1
    st[0] = 1.0
    latched = 0.0           # k'ya ulaşan olasılık kütlesi (yutucu durum)
    for _ in range(N):
        new = [0.0] * k
        for r in range(k):
            p = st[r]
            if p == 0.0:
                continue
            if r + 1 == k:
                latched += p * q        # kilitlendi
            else:
                new[r + 1] += p * q     # seri uzadı
            new[0] += p * (1.0 - q)     # pass -> seri sıfırlandı
        st = new
    return latched

def p_det_mc(tau_mean, delta, k, trials=400_000, seed=7):
    """Epizod süresi Exp(tau_mean), örnekleme fazı U(0, delta)."""
    rnd = random.Random(seed)
    hit = 0
    for _ in range(trials):
        tau = rnd.expovariate(1.0 / tau_mean)
        u = rnd.random() * delta                  # ilk örneğe kalan süre
        n_in = 0 if tau < u else int((tau - u) / delta) + 1
        if n_in >= k:
            hit += 1
    return hit / trials
```

$T = 2$ saat, $\Delta = 1$ s ($N = 7200$), $q = 10^{-3}$ ile iki rejimi yan yana
koyuyorum: uzun epizod ($\bar\tau = 5$ s, eşiğin çok üstünde) ve kısa epizod
($\bar\tau = 50$ ms, eşiğin altında).

**Uzun epizod — $\bar\tau = 5$ s, kriter sağlanır:**

| $k$ | $P_{\text{ya}}$ (tam) | $N q^{k}$ | $P_{\text{tespit}}$ (MC) | $e^{-k\Delta/\bar\tau}$ | FOM |
|---:|---:|---:|---:|---:|---:|
| 1 | 9,993·10⁻¹ | 7,200·10⁰ | 0,9065 | 0,8187 | 9,07·10⁻¹ |
| 2 | 7,166·10⁻³ | 7,200·10⁻³ | 0,7419 | 0,6703 | 1,04·10² |
| 3 | 7,191·10⁻⁶ | 7,200·10⁻⁶ | 0,6084 | 0,5488 | 8,46·10⁴ |
| 4 | 7,190·10⁻⁹ | 7,200·10⁻⁹ | 0,4984 | 0,4493 | 6,93·10⁷ |

**Kısa epizod — $\bar\tau = 50$ ms, kriter sağlanmaz:**

| $k$ | $P_{\text{ya}}$ (tam) | $P_{\text{tespit}}$ (MC) | FOM |
|---:|---:|---:|---:|
| 1 | 9,993·10⁻¹ | 0,0499 | 4,99·10⁻² |
| 2 | 7,166·10⁻³ | 0,0000 | 0 |
| 3 | 7,191·10⁻⁶ | 0,0000 | 0 |
| 4 | 7,190·10⁻⁹ | 0,0000 | 0 |

Birkaç şey birden doğrulanıyor:

**Yaklaşım isabetli.** $k \ge 2$ için $N q^k$ ile tam Markov değeri üç anlamlı
hanede örtüşüyor (7,166 ile 7,200; 7,191 ile 7,200). $k = 1$'de yaklaşım 7,2
veriyor — bir olasılık için anlamsız bir sayı; çünkü $Nq \ll 1$ varsayımı
çöküyor. Formülü kullanırken bu koşulu kontrol etmek gerekiyor.

**Kriter her iki yönde de çalışıyor.** Uzun epizod rejiminde FOM $k$ ile birlikte
monoton artıyor: her ek onay adımı yanlış alarmı 1000 kat düşürürken tespiti
yalnızca %18 azaltıyor. Kısa epizod rejiminde ise $k = 2$'de tespit tamamen sıfıra
düşüyor — 50 ms'lik bir epizod, 1 s aralıklı iki örneği aynı anda içeremez. Filtre
yanlış alarmı bastırıyor ama artık bastırdığı şeyin içinde gerçek arıza da var.

**Analitik formülün sınırı burada görünüyor.** Kısa epizodda $k=1$ için Monte
Carlo 0,0499 veriyor, $e^{-\Delta/\bar\tau}$ ise $e^{-20} \approx 2\cdot10^{-9}$.
Üstel ifade burada tamamen yanlış. Doğrusu $\bar\tau \ll \Delta$ rejiminde
$P_{\text{tespit}}(1) \approx \bar\tau/\Delta = 0{,}05$ — yani bir epizodun
örnekleme anına denk gelme olasılığı. Üstel yaklaşım ancak $\bar\tau \gtrsim
\Delta$ iken geçerli; eşik kriterinin yönünü doğru verse de, eşiğin altındaki
tespit olasılığını fena hâlde küçümsüyor.

Aynı veriyi logaritmik eksende görmek, iki eğrinin ayrışmasını daha net gösteriyor:

<figure class="post-figure">
<svg viewBox="0 0 660 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Onay filtresi uzunluğu k arttıkça yanlış alarm olasılığı geometrik olarak çökerken aralıklı arıza tespiti yavaş azalır; kısa epizodlarda tespit tamamen kaybolur.">
<g font-family="system-ui,sans-serif" font-size="12" fill="currentColor">
<line x1="62" y1="324.0" x2="452" y2="324.0" stroke="currentColor" stroke-opacity="0.13"/>
<text x="54" y="328.0" text-anchor="end" fill-opacity="0.75">10<tspan baseline-shift="super" font-size="9">-9</tspan></text>
<line x1="62" y1="292.0" x2="452" y2="292.0" stroke="currentColor" stroke-opacity="0.13"/>
<text x="54" y="296.0" text-anchor="end" fill-opacity="0.75">10<tspan baseline-shift="super" font-size="9">-8</tspan></text>
<line x1="62" y1="259.9" x2="452" y2="259.9" stroke="currentColor" stroke-opacity="0.13"/>
<text x="54" y="263.9" text-anchor="end" fill-opacity="0.75">10<tspan baseline-shift="super" font-size="9">-7</tspan></text>
<line x1="62" y1="227.9" x2="452" y2="227.9" stroke="currentColor" stroke-opacity="0.13"/>
<text x="54" y="231.9" text-anchor="end" fill-opacity="0.75">10<tspan baseline-shift="super" font-size="9">-6</tspan></text>
<line x1="62" y1="195.8" x2="452" y2="195.8" stroke="currentColor" stroke-opacity="0.13"/>
<text x="54" y="199.8" text-anchor="end" fill-opacity="0.75">10<tspan baseline-shift="super" font-size="9">-5</tspan></text>
<line x1="62" y1="163.8" x2="452" y2="163.8" stroke="currentColor" stroke-opacity="0.13"/>
<text x="54" y="167.8" text-anchor="end" fill-opacity="0.75">10<tspan baseline-shift="super" font-size="9">-4</tspan></text>
<line x1="62" y1="131.7" x2="452" y2="131.7" stroke="currentColor" stroke-opacity="0.13"/>
<text x="54" y="135.7" text-anchor="end" fill-opacity="0.75">10<tspan baseline-shift="super" font-size="9">-3</tspan></text>
<line x1="62" y1="99.7" x2="452" y2="99.7" stroke="currentColor" stroke-opacity="0.13"/>
<text x="54" y="103.7" text-anchor="end" fill-opacity="0.75">10<tspan baseline-shift="super" font-size="9">-2</tspan></text>
<line x1="62" y1="67.7" x2="452" y2="67.7" stroke="currentColor" stroke-opacity="0.13"/>
<text x="54" y="71.7" text-anchor="end" fill-opacity="0.75">10<tspan baseline-shift="super" font-size="9">-1</tspan></text>
<line x1="62" y1="35.6" x2="452" y2="35.6" stroke="currentColor" stroke-opacity="0.13"/>
<text x="54" y="39.6" text-anchor="end" fill-opacity="0.75">10<tspan baseline-shift="super" font-size="9">0</tspan></text>
<line x1="62" y1="26" x2="62" y2="324" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="62" y1="324" x2="452" y2="324" stroke="currentColor" stroke-opacity="0.5"/>
<text x="62.0" y="344" text-anchor="middle" fill-opacity="0.85">k=1</text>
<text x="192.0" y="344" text-anchor="middle" fill-opacity="0.85">k=2</text>
<text x="322.0" y="344" text-anchor="middle" fill-opacity="0.85">k=3</text>
<text x="452.0" y="344" text-anchor="middle" fill-opacity="0.85">k=4</text>
<text x="257" y="360" text-anchor="middle" fill-opacity="0.7">onay filtresi uzunluğu (ardışık &quot;fail&quot; sayısı)</text>
<polyline points="62.0,37.0 192.0,39.8 322.0,42.5 452.0,45.3" fill="none" stroke="#2bb3a3" stroke-width="2.4"/>
<circle cx="62.0" cy="37.0" r="3.4" fill="#2bb3a3"/>
<circle cx="192.0" cy="39.8" r="3.4" fill="#2bb3a3"/>
<circle cx="322.0" cy="42.5" r="3.4" fill="#2bb3a3"/>
<circle cx="452.0" cy="45.3" r="3.4" fill="#2bb3a3"/>
<text x="462" y="48" fill="#2bb3a3" font-size="11.5">P_tespit (epizod 5 s)</text>
<polyline points="62.0,77.3 192.0,324.0 322.0,324.0 452.0,324.0" fill="none" stroke="#2bb3a3" stroke-width="2.4" stroke-dasharray="4 3"/>
<circle cx="62.0" cy="77.3" r="3.4" fill="#2bb3a3"/>
<circle cx="192.0" cy="324.0" r="3.4" fill="#2bb3a3"/>
<circle cx="322.0" cy="324.0" r="3.4" fill="#2bb3a3"/>
<circle cx="452.0" cy="324.0" r="3.4" fill="#2bb3a3"/>
<text x="462" y="66" fill="#2bb3a3" font-size="11.5">P_tespit (epizod 50 ms)</text>
<polyline points="62.0,35.6 192.0,104.3 322.0,200.4 452.0,296.5" fill="none" stroke="#e0952a" stroke-width="2.4"/>
<circle cx="62.0" cy="35.6" r="3.4" fill="#e0952a"/>
<circle cx="192.0" cy="104.3" r="3.4" fill="#e0952a"/>
<circle cx="322.0" cy="200.4" r="3.4" fill="#e0952a"/>
<circle cx="452.0" cy="296.5" r="3.4" fill="#e0952a"/>
<text x="462" y="84" fill="#e0952a" font-size="11.5">P_yanlış-alarm (sağlam birim)</text>
<text x="462" y="112" fill-opacity="0.6" font-size="10.5">Δ = 1 s, q = 10<tspan baseline-shift="super" font-size="8">-3</tspan></text>
<text x="462" y="126" fill-opacity="0.6" font-size="10.5">bacak = 2 saat (N = 7200)</text>
<text x="462" y="140" fill-opacity="0.6" font-size="10.5">eşik: τ* = 0,145 s</text>
</g></svg>
<figcaption>Onay filtresi uzadıkça yanlış alarm olasılığı her adımda 1000 kat düşerken (turuncu), uzun epizodların tespiti yavaşça azalıyor (düz yeşil). Kısa epizodlarda tespit $k=2$’de tamamen kayboluyor (kesikli yeşil).</figcaption>
</figure>

---

## MTBUR'u Geri Hesaplamak

Modeli söküm hızına bağlayalım. Saat başına söküm hızı üç bileşenin toplamı:

$$\frac{1}{\text{MTBUR}} \;=\; \lambda_p C \;+\; \lambda_i P_{\text{tespit}} \;+\; \frac{P_{\text{ya}}}{T}$$

Üç terim sırayla: kalıcı arızadan gelen sökümler, yakalanan aralıklı
arızalardan gelen sökümler ve yanlış alarmdan gelen sökümler.

Şimdi işin ilginç kısmı. $\lambda_i$'yi kimse datasheet'e yazmıyor — aralıklı
arıza hızı ölçülmesi en zor büyüklüklerden biri. Ama MTBUR/MTBF oranı
*yayımlanıyor*. O hâlde denklemi ters çevirip, gözlenen orandan ima edilen
$\lambda_i$ değerini çıkarabiliriz.

$\lambda_p = 1/40000$ /saat ve $C = 0{,}95$ alıp ADIRU oranını ($0{,}5875$)
yerine koyduğumuzda toplam söküm hızı $4{,}255 \cdot 10^{-5}$ /saat çıkıyor.
Kalıcı arızadan gelen pay $2{,}375 \cdot 10^{-5}$ /saat, yani **%55,8**. Geri
kalan **%44,2** kalıcı arıza kaynaklı değil.

Bu sayıyı bir an için tutun: TuHK'nın ölçtüğü toplam NFF oranı %44,5'ti. Biri
Honeywell bir ADIRU'nun söküm istatistiğinden, diğeri Türk Hava Kuvvetleri'nin
atölye kayıtlarından geliyor. Aralarında hiçbir bağ yok ve iki sayı yarım puan
içinde buluşuyor. Bunun bir miktar şans olduğunu kabul etmek gerek — ama
mertebenin bu kadar tutarlı çıkması, modelin yapısının doğru olduğuna dair iyi bir
işaret.

Farklı $k$ değerleri için ima edilen aralıklı arıza hızı:

| Oran kaynağı | $k$ | $P_{\text{ya}}/T$ (/saat) | aralıklı paydan (/saat) | ima edilen $\lambda_i$ | ima edilen MTBIF |
|---|---:|---:|---:|---:|---:|
| ADIRU, 0,5875 | 2 | 3,58·10⁻³ | — | — | bütçe aşıldı |
| ADIRU, 0,5875 | 3 | 3,60·10⁻⁶ | 1,52·10⁻⁵ | 2,50·10⁻⁵ | ≈ 40.000 saat |
| ADIRU, 0,5875 | 4 | 3,60·10⁻⁹ | 1,88·10⁻⁵ | 3,77·10⁻⁵ | ≈ 26.500 saat |
| Kayton-Fried kuralı, 0,50 | 3 | 3,60·10⁻⁶ | 2,27·10⁻⁵ | 3,72·10⁻⁵ | ≈ 26.900 saat |
| Kayton-Fried kuralı, 0,50 | 4 | 3,60·10⁻⁹ | 2,63·10⁻⁵ | 5,27·10⁻⁵ | ≈ 19.000 saat |

İki tasarım sonucu çıkıyor:

**$k = 2$ bu parametrelerde mümkün değil.** Yanlış alarmın tek başına ürettiği
söküm hızı $3{,}58 \cdot 10^{-3}$ /saat; oysa gözlenen *toplam* söküm hızı
$4{,}26 \cdot 10^{-5}$ /saat. Yanlış alarm bütçeyi yaklaşık **84 kat** aşıyor.
Yani saniyede bir çalışan, örnek başına $10^{-3}$ yanlış pozitif veren bir testte
iki ardışık onay yetmez; $k \ge 3$ zorunlu. Bu, gözlenen MTBUR'dan türetilmiş bir
alt sınır — tasarımcının tercihi değil.

**Aralıklı arıza hızı kalıcı arıza hızıyla aynı mertebede.** İma edilen MTBIF
19.000-40.000 saat aralığında, yani MTBF ile karşılaştırılabilir. Konnektör ve
lehim kaynaklı mekanik olaylar, yarı iletken arızaları kadar sık. Güvenilirlik
bütçesini yalnızca bileşen arıza hızları üzerinden kuran bir analiz, sökümlerin
yarısını açıklamakta başarısız olacaktır.

---

## Sahada Ne Yapmalı

Türetimin pratik sonuçları:

**Örnekleme periyodunu kısalt, eşiği kurcalamadan önce.** $\tau^{\star} =
\Delta/\ln(1/q)$ ifadesinde $\Delta$ doğrusal, $q$ logaritmik. Test doğruluğunu
iyileştirmek için harcanan çaba, aynı çabanın örnekleme hızına yatırılmasından
çok daha az getiri sağlıyor.

**Ardışık onay yerine pencereli sayım düşün.** $m$ örneklik bir pencerede $k$ kez
"fail" ($k$-of-$m$), ardışıklık şartı olmadan, aynı yanlış alarm bastırmasını çok
daha iyi aralıklı arıza duyarlılığıyla verir. Ardışıklık şartı, epizodun örnekleme
ızgarasına hizalanmasını da gerektirdiği için fazladan ceza yazıyor.

**Kısa epizodlar için filtre değil, mandal (latch) kullan.** Epizod $\tau^{\star}$
altındaysa yazılım tarafında yapacak bir şey yok; ihtiyacınız olan, donanımda
olayı yakalayıp tutan bir tepe dedektörü ya da mandallı karşılaştırıcı. Olayı
yazılımın örnekleme ızgarasına bırakmak, onu görmemeyi seçmek demek.

**Mesajı bastırmakla olayı kaydetmemeyi ayır.** Onay filtresi bakım mesajını
bastırmalı; ham olay sayacını bastırmamalı. Kilitlenmemiş "fail" olaylarını
sayıp uçuş sonrası indirmek, aralıklı arıza eğilimini görmenin neredeyse bedava
yolu. ARINC 624'ün tanımladığı onboard maintenance system mimarisi tam olarak bu
tür veriyi taşımak için var; sorun çoğu zaman verinin olmaması değil,
değerlendirilmemesi.

**Atölyeyi uçuş ortamıyla aynı kabul etme.** Literatürdeki beş gerekçenin
üçüncüsü buydu: birim, arızanın oluştuğu ortamda değil laboratuvarda test
ediliyor. Titreşim ve termal çevrim altında test edilmeyen bir kutunun "testleri
geçmesi" bilgi değeri sınırlı bir sonuç.

---

## Modelin Sınırları

Dürüst olmak gerekirse bu model birkaç yerde fazla iyimser:

- **Bağımsızlık varsayımı.** Yanlış pozitifleri bağımsız Bernoulli denemeleri
  olarak aldım. Gerçek yanlış alarmların ortak bir nedeni (besleme gürültüsü,
  sıcaklık) olur ve kümelenir. Korelasyonlu gürültüde ardışık $k$ "fail" görme
  olasılığı $q^k$'den **çok** yüksektir; yani $k$'nın koruyuculuğu burada
  abartılmış.
- **Tek epizod, sabit şiddet.** Epizod boyunca testin kesin olarak "fail"
  okuduğunu varsaydım. Marjinal bir bozulmada test epizod içinde bile olasılıksal
  davranır.
- **Üstel dağılımlar.** Hem epizod süresi hem varışlar için üstel aldım.
  Mekanik kökenli olaylar için gerçekçi olan genellikle ağır kuyruklu
  dağılımlardır.
- **$C$ sabit.** BIT kapsamasını $k$'dan bağımsız aldım; gerçekte uzun onay
  filtresi, kısa süreli kalıcı-ama-geçici-görünen arızaların kapsamasını da düşürür.

Bu varsayımların hepsi aynı yöne çalışıyor: gerçek tasarım, modelin önerdiği
kadar rahat değil.

---

## Açık Sorular

Üzerine düşünmeye devam ettiğim birkaç nokta:

- $k$-of-$m$ pencereli sayım için $\tau^{\star}$ benzeri kapalı formda bir eşik
  çıkarılabilir mi? Ardışıklık şartının kalkması hizalanma cezasını kaldırıyor;
  eşiğin $m$'ye bağımlılığı sezgisel olarak zayıf olmalı ama türetmedim.
- Korelasyonlu yanlış pozitifler (örneğin iki durumlu bir Markov gürültü modeli)
  altında $q^k$ yerine ne geliyor ve $\tau^{\star}$ nasıl kayıyor?
- Uçuş sonrası indirilen kilitlenmemiş olay sayaçlarından $\lambda_i$'yi doğrudan
  kestirmek mümkün mü? Eğer mümkünse, MTBUR'u ters çevirmeye gerek kalmaz.

---

## Kaynaklar

- Ilarslan, M.; Ungar, L. Y. "Mitigating the Impact of False Alarms and No Fault
  Found Events in Military Systems." *IEEE Instrumentation &amp; Measurement
  Magazine*, cilt 19, sayı 4, Ağustos 2016.
  [ResearchGate kaydı](https://www.researchgate.net/publication/308867376_Mitigating_the_Impact_of_False_Alarms_and_No_Fault_Found_events_in_military_systems)
  (ilk hâli: 2015 IEEE AUTOTESTCON)
- Raza, A.; Ulansky, V. "Through-Life Maintenance Cost of Digital Avionics."
  *Applied Sciences*, 2021, 11(2), 715.
  [doi:10.3390/app11020715](https://doi.org/10.3390/app11020715)
- Raza, A. "Maintenance Model of Digital Avionics." *Aerospace*, 2018, 5(2), 38.
  [doi:10.3390/aerospace5020038](https://doi.org/10.3390/aerospace5020038)
- Ungar, L. Y. "Causes and Costs of No Fault Found Events." *Proc. IPC APEX*,
  Şubat 2015.
  [Semantic Scholar kaydı](https://www.semanticscholar.org/paper/Causes-and-Costs-of-No-Fault-Found-Events-Ungar/ac598e7a9ba53b9dab567175f525368b7fd1f532)
- Söderholm, P. "A system view of the no fault found (NFF) phenomenon."
  *Reliability Engineering &amp; System Safety*, 2007, 92(1), 1-14.
  [doi:10.1016/j.ress.2005.11.004](https://doi.org/10.1016/j.ress.2005.11.004)
- Khan, S.; Phillips, P.; Jennions, I.; Hockley, C. "No Fault Found events in
  maintenance engineering Part 1: Current trends, implications and organizational
  practices." *Reliability Engineering &amp; System Safety*, 2014, 123, 183-195.
  [doi:10.1016/j.ress.2013.11.008](https://doi.org/10.1016/j.ress.2013.11.008)
- Hockley, C.; Phillips, P. "The impact of no fault found on through-life
  engineering services." *Journal of Quality in Maintenance Engineering*, 2012,
  18(2), 141-153.
  [doi:10.1108/13552511211244166](https://doi.org/10.1108/13552511211244166)
- Bliss, J. P. "Investigation of Alarm-Related Accidents and Incidents in
  Aviation." *The International Journal of Aviation Psychology*, 2003, 13(3),
  249-268.
  [doi:10.1207/S15327108IJAP1303_04](https://doi.org/10.1207/S15327108IJAP1303_04)
- Kayton, M.; Fried, W. R. (ed.) *Avionics Navigation Systems*, 2. baskı, John Wiley
  &amp; Sons, 1997.
- ARINC 604-1, *Guidance for Design and Use of Built-In Test Equipment (BITE)*,
  Airlines Electronic Engineering Committee, 1988.
  [SAE kaydı](https://saemobilus.sae.org/standards/arinc604-1-604-1-guidance-design-use-built-test-equipment-bite)
- ARINC 624-1, *Design Guidance for Onboard Maintenance System (OMS)*, Airlines
  Electronic Engineering Committee, 1993.

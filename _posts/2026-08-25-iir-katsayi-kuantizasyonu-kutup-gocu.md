---
title: "Python'da Çalışan Filtre Hedefte Neden Patlıyor? IIR Katsayı Kuantizasyonu"
subtitle: "Coefficient Quantization, Pole Migration and Why Your High-Order IIR Filter Explodes"
background: "/img/posts/2.webp"
date: '2026-08-25 07:30:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [sinyal-isleme, gomulu-sistemler]
---

Filtreyi masaüstünde tasarlarsınız. `butter(8, 100/5000)` yazarsınız, frekans cevabına bakarsınız, geçirme bandı düz, durdurma bandı 80 dB aşağıda. Kesim frekansı tam istediğiniz yerde. Katsayıları bir başlık dosyasına dökersiniz, hedef karta gömersiniz, ve filtre çıkışı birkaç saniye içinde doygunluğa gider. Girişte hiçbir şey yokken bile.

İlk şüpheniz aritmetik olur: taşma vardır, ölçekleme yanlıştır, `int16` yerine `int32` biriktirici kullanmak gerekir. Bunların hepsini düzeltirsiniz, filtre yine patlar. Çünkü sorun aritmetikte değil. Sorun, hedefe indirdiğiniz **katsayıların artık tasarladığınız filtreyi tarif etmemesinde**.

Bu yazıda tam olarak bunu ölçeceğiz. 8. dereceden bir Butterworth alçak geçiren filtre tasarlayıp katsayılarını 16 bite yuvarlayacağız, kutupların birim çemberin dışına nereye kaçtığını bulacağız, sonra "daha çok bit atalım" refleksinin neden işe yaramadığını göreceğiz — 32 bit sabit nokta ve `float32`, ikisi de kararsız çıkacak. Ardından aynı filtreyi kaskad biquad olarak gerçekleyip **aynı 16 bitle** kararlı hale getireceğiz. Bütün deney saf Python ile, harici kütüphane olmadan tekrar üretilebilir; kararlılık kararını kayan noktaya güvenmeden, kesin rasyonel aritmetikle vereceğiz.

---

## Tasarım ile Gerçekleme Aynı Şey Değil

Sayısal filtre derslerinin çoğu transfer fonksiyonunda biter:

$$
H(z) = \frac{b_0 + b_1 z^{-1} + \cdots + b_N z^{-N}}{1 + a_1 z^{-1} + \cdots + a_N z^{-N}}
$$

Bu ifade filtreyi matematiksel olarak tam tanımlar. Ama bir filtreyi *çalıştırmak* için transfer fonksiyonu yetmez; onu bir **yapıya** (structure) dökmeniz gerekir: hangi çarpmayı hangi sırayla yapacaksınız, ara sonuçları nerede tutacaksınız, hangi sayıyı hangi formatta saklayacaksınız. Aynı $H(z)$'yi sonsuz farklı yapıyla gerçekleyebilirsiniz.

Sonsuz hassasiyette bu yapıların hepsi birbirine denktir. Sonlu kelime uzunluğunda **değildir**. Ve aradaki fark akademik bir incelik değil; kararlı bir filtre ile kararsız bir filtre arasındaki fark.

En doğrudan yapı, fark denklemini olduğu gibi yazmaktır — *direct form*:

$$
y[n] = \sum_{i=0}^{N} b_i\,x[n-i] \;-\; \sum_{i=1}^{N} a_i\,y[n-i]
$$

$N=8$ için bu, sekiz adet $a_i$ katsayısını doğrudan bellekte tutmak demektir. İşte kırılma noktası burası.

---

## Deney: 8. Dereceden Butterworth

Somut ve sıradan bir filtre seçelim — aviyonikte ya da herhangi bir veri toplama zincirinde her gün karşınıza çıkacak türden:

| Parametre | Değer |
|---|---|
| Tip | Butterworth alçak geçiren |
| Derece | 8 |
| Örnekleme frekansı $f_s$ | 10 kHz |
| Kesim frekansı $f_c$ | 100 Hz |
| $f_c / f_s$ | 0,01 |

Dar kesim frekansı bu işin kritik tarafı: $f_c/f_s$ küçüldükçe kutuplar $z=1$ noktasının etrafında sıkışır. Bizim tasarımımızda sekiz kutbun tamamı $0{,}94 < |z| < 0{,}99$ aralığında, hepsi dar bir yayda toplanmış durumda.

Filtreyi kütüphanesiz tasarlamak zor değil. Butterworth prototipinin analog kutupları kapalı formda bilinir, bilinear dönüşüm de tek satırlık bir işlem:

```python
import math, cmath

def digital_poles(N, fc, fs):
    Wc = 2*fs*math.tan(math.pi*fc/fs)          # prewarp
    sp = [cmath.exp(1j*(math.pi/2 + (2*k+1)*math.pi/(2*N))) for k in range(N)]
    return [(2*fs + Wc*s)/(2*fs - Wc*s) for s in sp]   # bilinear

def poly(roots):                                # kokleri katsayiya ac
    c = [1+0j]
    for r in roots:
        n = [0j]*(len(c)+1)
        for i, ci in enumerate(c):
            n[i] += ci; n[i+1] -= ci*r
        c = n
    return [x.real for x in c]
```

Payda katsayıları şöyle çıkıyor:

```text
a[0] =   1.000000
a[1] =  -7.677940
a[2] =  25.797220
a[3] = -49.541226
a[4] =  59.476132
a[5] = -45.708734
a[6] =  21.960120
a[7] =  -6.030172
a[8] =   0.724601
```

Bu tabloya bir mühendis gözüyle bakın. En büyük katsayı **59,48**. Bu sayıyı 16 bitlik işaretli bir tamsayıya sığdırmak için 6 tamsayı biti ayırmanız gerekiyor. İşaret biti bir tane. Geriye kesir için **9 bit** kalıyor.

Yani katsayılarınızın çözünürlüğü $2^{-9} \approx 0{,}00195$. Kutuplarınız ise $|z| = 0{,}9878$ gibi bir yerde, birim çembere 0,012 uzaklıkta duruyor. Çözünürlüğünüz, kararlılık payınızın altıda biri kadar. Bu oranı gördüğünüz anda alarm çalmalı.

---

## 16 Bit: Filtre Patlıyor

Katsayıları Q6.9 formatına yuvarlayıp kutupları tekrar hesaplayalım:

```text
Kutuplar (tam hassasiyet)  : max|z| = 0.987824   -> kararli
Kutuplar (16-bit katsayi)  : max|z| = 1.433359   -> KARARSIZ
Birim cember disina cikanlar: 1.43336, 1.43336, 1.18017, 1.18017
```

Sekiz kutbun dördü birim çemberin dışına fırladı. Bir tanesi $|z| = 1{,}43$'e kadar gitti — bu, "sınırda kararsız" değil, her örnekte genliği %43 büyüten bir kutup.

Kök bulmanın kendisi bu tür ill-conditioned polinomlarda güvenilmez olabileceği için, kararsızlığı kök bulmaya hiç başvurmadan da doğrulayalım. Fark denklemini doğrudan koşturup dürtü yanıtına bakmak tartışmaya kapalı bir delildir — katsayılar kuantize, aritmetik `float64`:

| Gerçekleme | `|y[1000]|` | `|y[2999]|` |
|---|---|---|
| float64 (tam hassasiyet) | 4,69 × 10⁻⁸ | 2,13 × 10⁻¹⁸ |
| 16-bit sabit nokta | 7,76 × 10¹⁴⁷ | taşma (NaN) |

Tam hassasiyetli filtre dürtüden sonra düzgünce sönümleniyor. 16 bitlik olan bin örnekte $10^{147}$'ye ulaşıp iki bin örnek daha sonra çift duyarlıklı kayan noktayı bile taşırıyor. Gerçek donanımda bu, filtre çıkışının bir saniyeden kısa sürede doygunluğa oturması demek.

Üçüncü ve en sağlam doğrulama yöntemi **Schur-Cohn** testidir: polinomdan yansıma katsayılarını ($k_i$) özyinelemeli olarak üretir ve filtre ancak tüm $\lvert k_i \rvert < 1$ ise kararlıdır. Kök bulmaya gerek yok, ve `fractions.Fraction` ile **kesin rasyonel aritmetikte** çalıştırılabilir — yani yuvarlama hatasının sonucu etkileme ihtimali sıfır:

```python
from fractions import Fraction as Fr

def stable(a):                      # a[0] == 1
    a = [Fr(x) for x in a]; n = len(a)-1
    while n > 0:
        k = a[n]
        if abs(k) >= 1: return False
        d = 1 - k*k
        a = [(a[i] - k*a[n-i])/d for i in range(n)]
        n -= 1
    return True
```

Üç yöntem de aynı sonucu veriyor: 16 bitte bu filtre kararsız.

---

## Neden? Wilkinson'ın Uyarısı

Buradaki olgu sinyal işlemeye özgü değil; sayısal analizin en bilinen tuzaklarından biri.

James Wilkinson 1963'te, kökleri 1'den 20'ye kadar olan tamsayılar olan bir polinom aldı ve $x^{19}$ katsayısını $2^{-23}$ kadar — milyarda bir mertebesinde — değiştirdi. Kökler yerinden oynamakla kalmadı, bazıları karmaşık düzleme dağıldı; $x=20$ kökü 20,8'e kaydı. Wilkinson bunu kariyerindeki en sarsıcı deneyim olarak anlatır. Çıkardığı sonuç bizim için doğrudan geçerli: **monom katsayıları, kökleri birbirine yakın olan bir polinomu temsil etmenin son derece kötü koşullanmış bir yoludur.**

Direct form'un payda katsayıları tam olarak bu temsildir. $a_1 \ldots a_8$, kutupların monom açılımıdır. Kutuplar sıkışık olduğunda — bizim filtrede hepsi dar bir yayda — katsayıdaki minik bir bozulma köklerde büyük bir yer değiştirmeye dönüşür.

İki etki üst üste biniyor ve ikisi de aynı yöne çalışıyor:

1. **Duyarlılık:** Kutuplar sıkışık olduğu için $\partial z_i / \partial a_k$ türevleri büyük. Küçük katsayı hatası, büyük kutup göçü.
2. **Tamsayı biti vergisi:** Katsayılar $\pm 59$ aralığına yayıldığı için sabit noktada 6 biti tamsayı kısmına ayırmak zorundasınız. Yani duyarlılığın en yüksek olduğu yerde, çözünürlüğünüz en düşük.

Derece arttıkça her iki etki de kötüleşir. Aynı $f_c/f_s = 0{,}01$ için 16 bitte dereceyi tarayalım (kesin Schur-Cohn testi):

| Derece | `max|a|` | Kesir biti | Sonuç |
|---|---|---|---|
| 2 | 1,91 | 14 | kararlı |
| 3 | 2,87 | 13 | kararlı |
| 4 | 5,52 | 12 | **kararsız** |
| 5 | 9,21 | 11 | **kararsız** |
| 6 | 17,69 | 10 | **kararsız** |
| 8 | 59,48 | 9 | **kararsız** |

Sınır 8. derecede değil. **4. derecede.** Yani "yüksek dereceli filtre" diye düşündüğünüz eşik, sandığınızdan çok daha aşağıda.

---

## "Daha Çok Bit Atalım" Neden Kurtarmıyor

Bu noktada refleks bellidir: 16 bit yetmiyorsa 32 bit kullanırız. Ölçelim. Kelime uzunluğunu tarayıp her birinde kesin kararlılık testini çalıştıralım:

| Katsayı formatı | Kesir biti | Kararlılık |
|---|---|---|
| 16 bit sabit nokta | 9 | kararsız |
| 20 bit sabit nokta | 13 | kararsız |
| 24 bit sabit nokta | 17 | kararsız |
| 28 bit sabit nokta | 21 | kararsız |
| **32 bit sabit nokta** | 25 | **kararsız** |
| 40 bit sabit nokta | 33 | kararlı |
| **`float32`** | 24 bit mantis | **kararsız** |
| `float64` | 53 bit mantis | kararlı |

İki satır burada özellikle önemli.

**32 bit sabit nokta hâlâ kararsız.** Kelime uzunluğunu ikiye katlamak bu filtreyi kurtarmıyor. Kararlılık ancak 40 bit civarında geliyor — ki bu, standart bir gömülü veri tipi değil.

**`float32` kararsız.** Bu, sahada en sık rastlanan tuzak. Cortex-M4F ya da M7 üzerinde tek duyarlıklı FPU'nuz var, `float` kullanıyorsunuz, sabit nokta ölçekleme derdinden kurtulduğunuzu düşünüyorsunuz. Ama `float32`'nin 24 bitlik mantisi, 59,48 büyüklüğündeki bir katsayıda yaklaşık $3{,}8 \times 10^{-6}$ mutlak çözünürlük demek — ve bu filtre için yeterli değil. Dürtü yanıtı ölçümü doğruluyor: `float32` direct form, bin örnekte $9{,}1 \times 10^{49}$'a ulaşıyor.

Bir ayrıntı daha var ve dürüst olmak gerekirse rahatsız edici: tabloda kararsızlık **tekdüze azalmıyor**. Yansıma katsayısının en büyük mutlak değeri 20 bitte 1,0106 iken 24 bitte 1,0701'e *yükseliyor*, sonra 32 bitte 1,0077'ye düşüyor. Yuvarlama, katsayıları rastgele bir yöne itiyor; bazen şanslısınız, bazen değil. Pratik sonucu şu: **bit ekleyerek bu problemi güvenilir biçimde çözemezsiniz.** Bir kelime uzunluğunda kararlı çıkması, bir sonrakinde de kararlı olacağının garantisi değil. Yapıyı değiştirmeniz gerekiyor.

---

## Çözüm: Kaskad Biquad

Standart çözüm, filtreyi tek bir 8. dereceden polinom olarak değil, dört adet 2. dereceden bölümün kaskadı olarak gerçeklemek — *second-order sections* (SOS):

$$
H(z) = \prod_{k=1}^{4} \frac{b_{0k} + b_{1k} z^{-1} + b_{2k} z^{-2}}{1 + a_{1k} z^{-1} + a_{2k} z^{-2}}
$$

<div class="mermaid">
flowchart LR
    X[x n] --> B1[Biquad 1] --> B2[Biquad 2] --> B3[Biquad 3] --> B4[Biquad 4] --> Y[y n]
</div>

Her bölüm bir eşlenik kutup çiftini taşır. Aynı filtreyi, **aynı 16 bitle** böyle gerçekleyelim:

```text
biquad 1: a1 = -1.880260  a2 = 0.883977   F=14  kararli
biquad 2: a1 = -1.897013  a2 = 0.900764   F=14  kararli
biquad 3: a1 = -1.928769  a2 = 0.932583   F=14  kararli
biquad 4: a1 = -1.971898  a2 = 0.975797   F=14  kararli
```

Kutup hataları da beşinci ondalık basamakta kalıyor — örneğin en kritik bölümde tam değer $0{,}987824$, kuantize değer $0{,}987810$.

Kelime uzunluğu değişmedi. Filtrenin matematiği değişmedi. Değişen tek şey, katsayıların hangi biçimde saklandığı. Peki neden bu kadar büyük fark yarattı?

**Birincisi, tamsayı biti vergisi ortadan kalktı.** Bir biquad'ın payda katsayıları için kararlılık üçgeni $\lvert a_2 \rvert < 1$ ve $\lvert a_1 \rvert < 1 + a_2 < 2$ sınırlarını dayatır. Yani hiçbir kararlı biquad'ın katsayısı 2'yi aşamaz. Tek tamsayı biti yeter, kesir için **14 bit** kalır. Direct form'daki 9 bite kıyasla LSB 32 kat daha ince.

**İkincisi ve daha önemlisi, hata yayılmıyor.** Direct form'da $a_3$'ü yuvarladığınızda sekiz kutbun *hepsi* birden yerinden oynar; kökler katsayılara topluca bağlıdır. Kaskadda 3. bölümün katsayısını yuvarladığınızda yalnızca o bölümün kutup çifti oynar, diğer altı kutup zerre kadar etkilenmez. Wilkinson'ın uyarısına dönersek: kaskad yapı, polinomu monom katsayılarıyla değil **çarpanlarıyla** temsil eder, ve çarpanlanmış temsil iyi koşullanmıştır.

---

## Direct Form I mi, II mi, Transpoze mi?

Kaskada geçtiğinizde ikinci bir seçim çıkar: her biquad'ın içini nasıl yazacaksınız? Bu tercih katsayı kuantizasyonuyla değil, **ara değerlerin dinamik aralığıyla** ilgilidir; ayrı bir konudur ama aynı yazının parçasıdır.

- **Direct Form I** girişleri ve çıkışları ayrı ayrı geciktirir; dört durum değişkeni tutar. Ara toplam tek bir biriktiricide oluşur, dolayısıyla geniş biriktiriciyle taşma kontrolü kolaydır.
- **Direct Form II** durum sayısını ikiye indirir ama iç düğümde, payda filtresinin çıkışında, giriş ve çıkışın ikisinden de daha büyük genlikler oluşabilir. Sabit noktada bu, görünmez bir taşma kaynağıdır.
- **Transposed Direct Form II** kayan noktada yaygın ve iyi davranışlıdır, fakat durum değişkenleri için yine geniş dinamik aralık ister.

Bu tercihin sektörde nasıl karara bağlandığını görmek için ARM'ın CMSIS-DSP kütüphanesinin API'sine bakmak yeterli. Kütüphane biquad kaskadı için üç aile sunar ve veri tipi desteği tesadüf değildir: Direct Form I ailesi Q15 ve Q31'i destekler, çünkü dokümantasyonun kendi ifadesiyle DF-I sabit nokta veri tipleri için sayısal olarak daha gürbüzdür. Transposed Direct Form II ailesinde ise yalnızca `float32` ve `float64` vardır — hata birikimi nedeniyle sabit nokta sürümü hiç sağlanmamıştır.

Daha çarpıcı olan, kütüphanede **olmayan** şey: CMSIS-DSP'de keyfi dereceden direct form IIR fonksiyonu hiç yoktur. Özyinelemeli filtre için sunulan tek seçenekler kaskad biquad aileleri ve lattice yapısıdır — ki lattice de katsayı duyarlılığı düşük olduğu bilinen bir yapıdır. Bu yazıda ölçtüğümüz sonuç, ARM'ın API tasarımına çoktan gömülmüş durumda.

---

## Pratik Notlar

Deneyden çıkan ve doğrudan uygulanabilir birkaç sonuç:

**Filtreyi baştan SOS olarak üretin.** Tasarım aracınızdan `[b, a]` isteyip sonra çarpanlarına ayırmak, kötü koşullanmış adımı sadece masaüstüne taşır. SciPy bunu dokümantasyonunda açıkça söyler: `output='ba'` yalnızca geriye dönük uyumluluk için varsayılandır, genel amaçlı filtreleme için `output='sos'` kullanılmalıdır, çünkü kökler ile polinom katsayıları arasındaki dönüşüm $N \ge 4$ için bile sayısal olarak hassas bir işlemdir. Aynı eşik bizim ölçümümüzde de çıktı.

**4. dereceyi bir eşik olarak kabul edin.** İki biquad'ı geçen her IIR filtresi, sabit noktada kaskad olarak gerçeklenmeli. "Sadece 4. derece, direct form yeterli" varsayımı bu deneyde yanlış çıktı.

**`float32` sizi kurtarmaz.** Kayan noktaya geçmek ölçekleme derdini azaltır, koşullandırma problemini çözmez. Kaskad yapı hem sabit noktada hem `float32`'de gereklidir.

**Bölüm sıralaması ve ölçekleme önemlidir.** Kaskadda hangi kutup çiftinin hangi sıfır çiftiyle eşleştirileceği ve bölümlerin hangi sırayla dizileceği, taşma ile gürültü tabanı arasındaki dengeyi belirler. Yaygın kural: birim çembere en yakın kutup çiftini en sona koyun, ve her kutup çiftini kendisine en yakın sıfır çiftiyle eşleştirin. Bu, ara düğümlerdeki tepe genliklerini düşürür.

**Kararlılığı sembolik olarak değil, kuantize katsayılarla doğrulayın.** Tasarım aracınızın gösterdiği kutuplar, hedefe indireceğiniz katsayıların kutupları değildir. Doğrulama adımını başlık dosyasındaki *gerçek* sayılar üzerinde yapın — yukarıdaki 20 satırlık Schur-Cohn fonksiyonu bunun için yeterlidir ve derleme öncesi bir betikte çalıştırılabilir.

**Kuantizasyon kararlılığı bitirmez, sadece başlangıcıdır.** Bu yazı yalnızca *katsayı* kuantizasyonunu ölçtü. Sabit noktada ikinci bir problem daha var: sinyal yolundaki yuvarlama, giriş sıfır olduğu halde çıkışta sönmeyen küçük salınımlar üretebilir — *limit cycle*. Kaskad yapı bunu da hafifletir ama tamamen ortadan kaldırmaz; ayrı bir analiz konusudur.

---

## Deneyi Kendiniz Koşturun

Yazıdaki bütün sayılar tek bir bağımlılıksız Python betiğinden çıktı. Üç bağımsız yöntem aynı sonuca varıyor: Durand-Kerner ile kök bulma, kesin rasyonel aritmetikte Schur-Cohn testi, ve zaman düzleminde dürtü yanıtı. Kök bulucunun kendisi de doğrulandı — bulunan kökler yeniden çarpanlanıp giriş katsayılarıyla karşılaştırıldığında hata $3 \times 10^{-11}$ mertebesinde kaldı.

Parametreleri değiştirip kendi filtrenizde deneyin. Özellikle $f_c/f_s$ oranını küçültün: 0,001'e indirdiğinizde kaskadın bile zorlanmaya başladığını göreceksiniz, ve o noktada tartışma artık yapı seçiminden çıkıp örnekleme hızını düşürmeye ya da çok kademeli desimasyona geçer.

---

## Sonuç

Bir filtre tasarımı iki ayrı karardır ve ikincisi genellikle atlanır. Transfer fonksiyonunu seçmek tasarımın yarısıdır; onu hangi yapıyla, hangi sayı formatında gerçekleyeceğinizi seçmek diğer yarısıdır. Masaüstünde `float64` ile çalışırken bu ikinci karar görünmezdir, çünkü 53 bitlik mantis bütün günahları örter. Hedefte örtmez.

Ölçtüğümüz somut sonuç şu: 8. dereceden, $f_c/f_s = 0{,}01$ olan sıradan bir Butterworth filtresi, direct form'da 16 bitle de, 32 bitle de, `float32` ile de kararsız. Aynı filtre, dört kaskad biquad olarak, 16 bitle kararlı ve kutup hatası beşinci ondalıkta.

Kelime uzunluğu meselesi değil. Temsil meselesi.

---

## Kaynaklar

- [Wilkinson's polynomial — Wikipedia](https://en.wikipedia.org/wiki/Wilkinson%27s_polynomial) — kökleri sıkışık polinomlarda monom katsayı temsilinin kötü koşullanması
- [Cleve Moler, "Wilkinson's Polynomials" — MATLAB Central](https://blogs.mathworks.com/cleve/2013/03/04/wilkinsons-polynomials/) — problemin sayısal analiz açısından anlatımı
- [`scipy.signal.butter` — SciPy Manual](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.butter.html) — `output='sos'` önerisi ve $N \ge 4$ eşiği
- [CMSIS-DSP: Biquad Cascade IIR Filters Using Direct Form I Structure](https://arm-software.github.io/CMSIS-DSP/main/group__BiquadCascadeDF1.html) — DF-I'in sabit noktada neden tercih edildiği
- [CMSIS-DSP: Biquad Cascade IIR Filters Using a Direct Form II Transposed Structure](https://arm-software.github.io/CMSIS-DSP/main/group__BiquadCascadeDF2T.html) — DF2T'nin dinamik aralık gereksinimi ve neden yalnızca kayan nokta sürümünün bulunduğu
- [Effect of Coefficient Quantization on IIR Filters — WPI ECE 503 ders notu (PDF)](https://spinlab.wpi.edu/courses/ece503_2014/9-3coefficient_quantization_iir.pdf) — direct form'da her katsayının tüm kutupları etkilemesi
- [The Effect of Coefficient Quantization on the Performance of a Digital Filter — All About Circuits](https://www.allaboutcircuits.com/technical-articles/effect-coefficient-quantization-performance-digital-filter/) — konunun giriş seviyesinde özeti

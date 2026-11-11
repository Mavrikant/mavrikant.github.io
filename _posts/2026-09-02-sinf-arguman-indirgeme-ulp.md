---
title: "sinf(1e22) Doğru Cevabı Verir — Ama Soru Yanlıştır"
subtitle: "Argument Reduction, ULP Error and What libm Actually Guarantees"
background: "/img/posts/5.webp"
date: '2026-09-02 09:00:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [kayan-nokta, gomulu, do-178c]
---

Bir kod incelemesinde şu satıra takıldım:

```c
float phase = sinf(TWO_PI * FREQ * t_since_power_on);
```

`t_since_power_on` bir `float`, saniye cinsinden ve sistem açıldığından beri artıyor. Gözden geçirmedeki soru "bu doğru mu?" değildi; "bu ne kadar doğru?" idi. Cevabı verebilmek için önce daha temel bir soruyu yanıtlamak gerekiyor: **`sinf` bize aslında ne söz veriyor?**

Çoğumuz `math.h`'ı bir kara kutu olarak kullanırız. Emniyet kritik bir yazılımda ise kara kutu diye bir şey yoktur: yürütülebilirin içine giren her komutun bir gerekçesi ve bir kanıtı olmak zorundadır. Bu yazıda `sinf`'in kapağını açıyorum — önce ne söz verildiğine, sonra pratikte ne verildiğine, en sonunda da bu sözün emniyet kritik bir projede ne anlama geldiğine bakıyorum. Yol boyunca ölçüm yapacağız; bütün sayılar kendi makinemde üretildi ve yeniden üretilebilir.

---

## Söz verilen: hiçbir şey

C standardının kayan nokta doğruluğu hakkında söyledikleri şaşırtıcı derecede azdır. ISO/IEC 9899 §5.2.4.2.2, madde 6, `math.h` fonksiyonlarının doğruluğunun **implementation-defined** olduğunu söyler ve şu cümleyle biter: *"The implementation may state that the accuracy is unknown."*

Yani standart açısından, `sinf(x)`'in `42.0f` döndürmesi uygunluk ihlali değildir. Doğruluk, dokümantasyon meselesidir; ve dokümantasyon "bilmiyorum" diyebilir.

IEEE 754-2019 biraz daha ileri gider ama yine zorlamaz: toplama, çıkarma, çarpma, bölme, karekök ve FMA **zorunlu** ve bit-bit tanımlıdır; `sin`, `cos`, `exp` gibi transandantal fonksiyonlar ise **önerilen** işlemler listesindedir. Bir implementasyon bunları standardın 9.2 maddesine uygun biçimde sağlarsa doğru yuvarlamak zorundadır — ama hiçbir libm bu uygunluğu iddia etmek zorunda değildir, ve pratikte etmez. Aradaki fark tesadüf değil: transandantal fonksiyonlarda doğru yuvarlamayı garanti etmek, "table maker's dilemma" denen zor problemi çözmeyi gerektirir.

Peki gerçek kütüphaneler ne diyor? glibc kendi kılavuzunda açıkça yazar: ideal hata her fonksiyon için 0.5 ULP'nin altındadır, ama pratikte öyle değildir. Daha çarpıcısı, glibc'nin matematik test paketi **9 ULP'ye kadar** olan hataları hata olarak işaretlemez. Mimari başına tutulan `libm-test-ulps` dosyaları bu toleransın gerçek dağılımını gösteriyor. glibc 2.40'ın `sysdeps/aarch64/libm-test-ulps` dosyasından:

| Fonksiyon | float | double | Not |
|---|---|---|---|
| `sin`, `cos`, `tan` | 1 | 1 | skaler |
| `exp`, `pow` | 1 | 1 | skaler |
| `sin_advsimd`, `sin_sve` | 1 | 2 | vektörleştirilmiş varyantlar |
| `tan_advsimd` | 2 | 2 | vektörleştirilmiş |
| `j1`, `y1`, `tgamma` | 9 | 9 | Bessel / gama |

İki şey dikkat çekiyor. Birincisi, aynı fonksiyonun **vektör varyantı skalerden daha kötü**: derleyicinin döngünüzü vektörleştirmesi doğruluk sözleşmesini değiştirebilir. İkincisi, Bessel fonksiyonlarında 9 ULP — yani "hata" ile "tolerans" aynı sayı. Bu, doğruluğun garanti değil, ölçülmüş bir gözlem olduğunun en net itirafı.

---

## Verilen: ölçelim

Sözleşme boş olduğuna göre, kullandığım implementasyonu kendim ölçmem gerekiyor. Kurulum basit: C tarafında `sinf`'i çağırıp sonucu **ham bit deseni** olarak döküyorum, Python tarafında aynı argümanın sinüsünü `Decimal` ile yüksek hassasiyetle hesaplayıp doğru yuvarlanmış `float` değeri buluyorum, aradaki farkı ULP cinsinden yazıyorum.

Referansın kritik noktası şu: argümanı `Decimal(x)` ile alıyorum, `"%.17g"` ile değil. `Decimal(float)` kurucusu double'ın **tam** değerini verir. Bunu ilk denemede atlamıştım ve `sin(DBL_MAX)` için libm'i 8.9×10¹⁵ ULP hatalı sanmıştım; hatalı olan benim referansımdı. Büyük üslerde ondalık gösterimi kesmek, indirgemeyi tümüyle bozuyor.

π'yi de Machin formülüyle (`π = 16·arctan(1/5) − 4·arctan(1/239)`) `Decimal` içinde üretiyorum ve `|x|`'in basamak sayısı kadar ek hassasiyet ayırıyorum — argüman indirgemenin yapması gereken şeyin tam olarak aynısı, sadece pahalı ve yavaş hâli.

Sekiz ondalık kuşakta 600'er rastgele argüman, toplam 4800 nokta, Apple libm (arm64, clang 21):

| Argüman kuşağı | n | max ULP | ortalama ULP |
|---|---|---|---|
| `[0, 1)` | 600 | 0.538 | 0.248 |
| `[1, 10)` | 600 | 0.544 | 0.247 |
| `[10, 10³)` | 600 | 0.789 | 0.268 |
| `[10³, 10⁶)` | 600 | 0.835 | 0.292 |
| `[10⁶, 10⁹)` | 600 | 0.792 | 0.289 |
| `[10⁹, 10¹⁵)` | 600 | 0.842 | 0.293 |
| `[10¹⁵, 10²²)` | 600 | 0.817 | 0.287 |
| `[10²², FLT_MAX)` | 600 | 0.838 | 0.290 |

İki sonuç var, ikisi de önemli:

**Bir:** En büyük hata 0.842 ULP. Bu `1 ULP`'nin altında, yani implementasyon *faithful* (sonuç, gerçek değeri kuşatan iki komşu float'tan biri). Ama `0.5 ULP`'nin üstünde, yani **doğru yuvarlanmış değil**: 4800 örneğin 567'si (%11.8) `0.5 ULP`'yi aşıyor. Yani her sekiz çağrıdan yaklaşık biri, en yakın float'ı değil komşusunu döndürüyor.

**İki:** Doğruluk argümanın büyüklüğüyle **hiç bozulmuyor**. `10²²` civarındaki hata `[0,1)` aralığındakiyle aynı. `sin(DBL_MAX)` bile 0.289 ULP ile doğru. Bu sıradan bir sonuç değil; nasıl başarıldığına bakmak gerekiyor.

---

## Neden zor: sadeleşme

`sin`'i hesaplamanın tek yolu argümanı küçültmektir. Polinom yaklaşımları yalnızca dar bir aralıkta (tipik olarak `[−π/4, π/4]`) çalışır, dolayısıyla önce şu ayrıştırma yapılır:

$$
x = k \cdot \frac{\pi}{2} + r, \qquad |r| \le \frac{\pi}{4}, \qquad k \in \mathbb{Z}
$$

`k mod 4` hangi çeyrekte olduğumuzu, `r` ise polinoma verilecek argümanı belirler. Sorun `r`'nin hesaplanmasında: `x` büyükse `k` da büyüktür ve `k·(π/2)` çıkarma işlemi **katastrofik sadeleşme** üretir. `x ≈ 2²⁰` için `k` yaklaşık 20 bit; `r`'nin doğru çıkması için `π/2`'yi 20 bit fazladan tanımanız gerekir. `x ≈ 2¹⁰⁰` için 100 bit fazladan.

Bunu somutlaştırmak için dört indirgeme stratejisini aynı argümanlar üzerinde karşılaştırdım. Hepsi sonuçta `sinf` çağırıyor; fark yalnızca argümanı nasıl küçülttüklerinde. Değerler, doğru yuvarlanmış sonuca göre ULP hatası:

| `x` | naif `fmodf` (float 2π) | `fmod` (double 2π) | Cody–Waite (48 bit) | libm `sinf` |
|---|---|---|---|---|
| 1.2346 | 0.3 | 0.3 | 0.3 | 0.3 |
| 123.46 | 32.7 | 0.3 | 0.3 | 0.7 |
| 1234.6 | 4585.6 | 8.4 | 8.4 | 0.4 |
| 1.2346e+06 | 1.07e+06 | 1.7 | 1.7 | 0.3 |
| 1.2346e+08 | 2.97e+07 | 0.6 | 1.4 | 0.4 |
| 1.2346e+09 | 3.50e+07 | 13.4 | 728.6 | 0.4 |
| 1.2346e+11 | 5.80e+07 | 319.7 | 3859.7 | 0.3 |
| 1.2346e+13 | 5.46e+06 | 14597.2 | 68824.8 | 0.2 |
| 1.2346e+16 | 7.65e+06 | 1.23e+07 | 1.17e+07 | 0.1 |
| 1.2346e+22 | 2.16e+06 | 1.63e+07 | 1.55e+06 | 0.7 |
| 1.2346e+38 | 1.90e+07 | 3.21e+07 | 1.64e+07 | 0.4 |

Tablonun okunuşu: `10⁷` ULP hata, sonucun rastgele bir sayı olması demektir. Sonuç hâlâ `[−1, 1]` aralığında görünür, `isnan` da olmaz — sadece anlamsızdır.

- **Naif float indirgeme** daha üç basamaklı sayılarda çöküyor. `float` olarak `2π`, gerçek `2π`'den `1.75×10⁻⁷` uzakta; `k` büyüdükçe bu hata `k` katına çıkıyor.
- **Double `fmod`** `10⁹`'a kadar dayanıyor. Elinizde `2π`'nin ancak double'a sığan ~53 biti var ve her binade bundan bir bit yiyor.
- **Cody–Waite** (`2π`'yi alt bitleri sıfırlanmış üç float'a bölüp sırayla çıkarma) yaklaşık 48 bit taşıyor ve `10⁸`'e kadar iyi. Sonra o da bitiyor — çünkü `n·C1` çarpımının *tam* kalması için `n`'in küçük olması gerekiyor.
- **libm** hiç yorulmuyor.

### Yan bulgu: hangi aralığa indirgediğiniz de önemli

Yukarıdaki üç naif yöntem `fmod` kullandığı için sonucu `[0, 2π)` aralığına indiriyor. Bu tek başına hata kaynağı. `x = 12.3456697f` için:

| Yöntem | indirgenmiş `r` | `sinf(r)` | ULP hatası |
|---|---|---|---|
| `[0, 2π)`'ye indir | 6.06248426 | −0.218913719 | ~12 |
| `[−π, π]`'ye indir | −0.220700875 | −0.218913555 | ~1 |
| doğrudan `sinf(x)` | — | −0.21891354 | 0.1 |

Sebep basit ama gözden kaçıyor: `6.0625` civarındaki bir float'ın ULP'si `4.77×10⁻⁷`, `0.2207` civarındakinin ULP'si `1.49×10⁻⁸`. İndirgenmiş argümanı büyük üslü bir sayı olarak saklarsanız, onu float'a yuvarlarken 32 kat daha fazla mutlak hata yaparsınız. **Argümanı sıfıra en yakın aralığa indirin.**

---

## En kötü durum ne kadar kötü?

"Kaç bit `π` gerekir?" sorusunun net bir cevabı var ve cevap, `x·(2/π)` çarpımının kesirli kısmının sıfıra ne kadar yaklaşabildiğine bağlı. Bu, Kahan'ın önerdiği klasik yaklaşımdır: `π/2`'nin katlarına en yakın kayan nokta sayılarını taramak.

Double için bu hesap SunPro'nun (K.C. Ng) meşhur *Argument Reduction* notunda yapılmıştır: en kötü durumda kesirli kısımda **61 öncül sıfır** vardır, dolayısıyla `61 + 53 + 7 = 121` bit doğruluk gerekir; üs genişliğiyle birlikte `2/π`'nin **1144 biti** saklanmalıdır.

binary32 için aynı hesabı bulamadım, o yüzden kendim yaptım. Yöntem, Payne–Hanek'in kendisi: `2/π`'yi sabit noktalı büyük bir sayı olarak tutup her float için `x·(2/π)`'nin kesirli kısmını çıkarmak, sonra bu kesrin sıfıra (ya da bire) uzaklığındaki öncül sıfırları saymak. `x ≥ 1` olan **tüm** sonlu binary32 değerleri — 128 binade × 2²³ mantis, yaklaşık 1.07×10⁹ nokta — 1.8 saniyede taranıyor:

```c
/* x = m * 2^e; 2/pi'nin e. bitinden baslayan 128 bitlik pencere */
__uint128_t F = window128(e);
for (uint32_t m = (1u<<23); m < (1u<<24); m++) {
    __uint128_t f = (__uint128_t)m * F;   /* mod 2^128: kesirli kisim */
    __uint128_t d = f, nd = (__uint128_t)0 - f;
    if (nd < d) d = nd;                   /* sifira mi bire mi yakin? */
    /* d'nin onundeki sifirlar = kaybedilen bit sayisi */
}
```

Sonuç:

| `x` | bit deseni | `k mod 4` | `r = x mod π/2` | öncül sıfır |
|---|---|---|---|---|
| 1.57079637 | `0x3fc90fdb` | 1 | 4.371e−08 | 25 |
| 4.71238899 | `0x4096cbe4` | 3 | 1.192e−08 | 26 |
| 252.898209 | `0x437ce5f1` | 1 | 4.186e−09 | 28 |
| **21999384576.0** | `0x50a3e87f` | 1 | **2.013e−09** | **29** |

binary32'nin en kötü argümanı `21999384576.0`. Bu sayı `π/2`'nin bir tek katına `2.01×10⁻⁹` kadar yakın; `sin` değeri `1 − 2.03×10⁻¹⁸`, yani `sinf` tam olarak `1.0f` döndürmek zorunda. Doğru cevabı verebilmek için `2/π`'yi en az `104 (üs) + 29 (sadeleşme) + 24 (mantis) + guard ≈ 164` bit tanıması gerekiyor.

Listenin başındaki iki değerin `float(π/2)` ve `float(3π/2)` olması hoş bir doğrulama: en kötü durumlar, beklendiği gibi, `π/2`'nin katlarına en yakın float'lar.

Bu taramayı doğrulamak için ürettiğim `2/π` bit tablosunu fdlibm'in `two_over_pi` tablosuyla karşılaştırdım — `0xA2F9836E4E441529, 0xFC2757D1F534DDC0, …` — birebir aynı çıktı. Dört en kötü durumu da bağımsız olarak `Decimal` referansıyla teyit ettim.

---

## Kütüphaneler bunu nasıl yapıyor

Gerçek implementasyonlar iki katmanlıdır: ucuz yol ve pahalı yol. musl'ın `__rem_pio2f` fonksiyonu bunu açıkça gösterir — `|x| < 2²⁸·(π/2)` için `π/2`'nin `25 + 53` bitlik iki parçasıyla Cody–Waite tarzı bir indirgeme yapar (kodun kendi yorumu: *"25+53 bit pi is good enough for medium size"*), eşiğin üstünde ise Payne–Hanek uygulayan `__rem_pio2_large`'a düşer.

Koddaki eşik `0x4dc90fdb`. Bunu float olarak açtığınızda `421657440.0` çıkıyor — `2²⁸·(π/2)`'nin float karşılığıyla birebir aynı. Yukarıdaki tablomda Cody–Waite'in `1.2346e+08` ile `1.2346e+09` arasında bozulması tesadüf değil: musl'ın eşiği tam olarak oraya konmuş.

<div class="mermaid">
flowchart TD
    X["sinf(x) çağrısı"] --> C{"argümanın büyüklüğü"}
    C -- "pi/4 altı" --> P["indirgeme yok<br/>doğrudan polinom"]
    C -- "pi/4 ile 2^28·pi/2 arası" --> M["Cody-Waite<br/>25+53 bit pi/2<br/>birkaç çarpma-çıkarma"]
    C -- "2^28·pi/2 üstü" --> L["Payne-Hanek<br/>2/pi bit tablosu<br/>çok-kelimeli çarpma"]
    P --> R["k mod 4 ve r"]
    M --> R
    L --> R
    R --> Q["çeyreğe göre<br/>sin ya da cos polinomu"]
</div>

Peki pahalı yol ne kadar pahalı? Kendi makinemde ölçtüm (M-serisi, `-O2 -fno-vectorize`, 15 tekrarın en iyisi, sıkı döngüde çağrı başına):

| Argüman aralığı | ns/çağrı |
|---|---|
| `[0, π/4)` | 4.50 |
| `[0, 2π)` | 4.35 |
| `[100, 101)` | 3.72 |
| `[10⁶, +10³)` | 3.55 |
| `[10¹⁰, +10⁷)` | 3.55 |
| `[10²², +10¹⁹)` | 3.17 |
| `[10³⁸, +10³⁵)` | 2.78 |

Beklentimin tersine, büyük argümanlar **daha yavaş değil**. Bu implementasyonun indirgemesi anlaşılan dallanmasız ve sabit maliyetli. Ama bu ölçümün ne olduğu konusunda dürüst olmak gerek: bu, sıra dışı çalıştırmalı (out-of-order) bir çekirdekte, mükemmel dal tahmini ve sıcak cache ile alınmış **throughput**. WCET değil. musl gibi iki katmanlı, dallanan bir implementasyonda in-order bir Cortex-R üzerinde tablo aynı görünmez — ve emniyet kritik bir sistemde önemli olan sayı budur. Kütüphanenizin hangi yolu izlediğini bilmiyorsanız, `sinf`'in en kötü durum süresini de bilmiyorsunuz demektir.

---

## Asıl mesele: argümanın kendisi

Buraya kadar libm'in ne kadar iyi olduğunu ölçtük. Şimdi asıl soruya gelelim: `sinf(1e22f)` doğru cevabı veriyor da, **soru doğru mu?**

`float` argümanın taşıdığı faz bilgisini ölçelim. Bir float'ın komşusuyla arasındaki mesafe (ULP) radyan cinsinden ne kadar?

| `x` [rad] | ULP(x) [rad] | ULP(x) [derece] | yorum |
|---|---|---|---|
| 10² | 7.63e−06 | 0.00044 | kullanılabilir |
| 10³ | 6.10e−05 | 0.0035 | kullanılabilir |
| 10⁴ | 9.77e−04 | 0.056 | kullanılabilir |
| 10⁵ | 7.81e−03 | 0.45 | sınırda |
| 10⁶ | 6.25e−02 | 3.6 | 1 dereceden kötü |
| 10⁷ | 1.0 | 57.3 | neredeyse bilgi yok |
| 10⁸ | 8.0 | 458 | **faz bilgisi YOK** |
| 10¹⁰ | 1024 | 5.9e+04 | faz bilgisi YOK |
| 10²² | 1.13e+15 | 6.5e+16 | faz bilgisi YOK |

`x = 10⁸` radyanda bir ULP `8 radyan` — yani `2π`'den büyük. O float, tam bir turdan geniş bir gerçek sayı aralığını temsil ediyor. Fizikte karşılığı olan açı, o aralığın herhangi bir yerinde olabilir.

İşte yazının başlığındaki iddia bu: `sinf(1e22f)` size, **`1e22f` float'unun temsil ettiği tam gerçek sayının** sinüsünü 1 ULP'nin altında hatayla verir. Bu, matematiksel olarak kusursuz bir cevaptır. Ama `1e22f`'nin temsil ettiği fiziksel büyüklük — o açı — `±2⁴⁹` genişliğinde bir belirsizlik taşıyordu. Kütüphane, sorulmaması gereken bir soruya kusursuz cevap verdi ve bunun için `1144` bitlik bir tablo taşıdı.

Bu, uzun süredir tartışılan bir tasarım kararıdır: büyük argümanlar için ya "olduğu gibi" doğru cevap verirsiniz (fdlibm, glibc, musl, Apple'ın yaptığı), ya da NaN döndürüp kullanıcıyı uyarırsınız. Standart kütüphaneler birinciyi seçti — çünkü matematiksel tutarlılık, kullanıcının modelleme hatasını yakalamaktan daha savunulabilir bir sözleşmedir. Ama sonuç şu: **kütüphane sizi bu hatadan korumayacak.**

Yazının başındaki koda dönersek: `TWO_PI * FREQ * t_since_power_on` ifadesi, 400 Hz'lik bir referans ve on saatlik bir uçuş için `9×10⁷` radyan mertebesine çıkar. `sinf` o argümanın sinüsünü kusursuz hesaplar. Hesapladığı şeyin faz ile hiçbir ilgisi kalmamıştır.

---

## Derleyici de işin içinde

Bir sürpriz daha var. Şu fonksiyonu `-O2` ile derleyin:

```c
float g(void){ return sinf(1.0e22f); }
```

Üretilen arm64 kodu:

```asm
_g:
        mov     w8, #60612          ; 0xecc4
        movk    w8, #48955, lsl #16 ; 0xbf3b
        fmov    s0, w8
        ret
```

Çağrı yok. Değer ikili dosyanın içine gömülmüş: `0xbf3becc4`. Yani `sinf`'i test ettiğinizi sandığınız o kod yolu hiç çalışmıyor.

Bu değeri kim hesapladı? Hedefin libm'i değil, **derlemeyi yapan makinenin** libm'i. LLVM'in matematik fonksiyonlarını sabit-katlaması host rutinlerine dayanır; llvm-dev tartışmasında Hal Finkel bunu açıkça söylüyor: LLVM sabit katlama için host rutinlerini kullanıyor. Aynı listede dile getirilen sonuç da net — derleyicinizin kullandığı matematik kütüphanesi ile programınızın bağlandığı kütüphane farklıysa farklı sonuç alabilirsiniz.

Ana makinede derleyip hedefte koşan bir aviyonik derleme zincirinde bu şu demek: bir sabit ifadenin değeri, hedefin çalışma zamanı davranışından bağımsız olarak, build makinesinin libc sürümüne bağlı olabilir. İki build slave'i farklı dağıtım sürümündeyse, aynı kaynaktan farklı ikili çıkar. Deterministik derleme kanıtı üretmeye çalışıyorsanız, bu tam olarak avlamanız gereken sınıftan bir bağımlılıktır.

Bu arada aynı derleme çıktısı başka bir şeyi de gösteriyor: `float f(float x){ return sinf(x); }` arm64'te tek bir `b _sinf` komutuna dönüşüyor. ARM'da sinüs komutu yok; `sinf` her zaman ve yalnızca yazılımdır. Yürütülebilirinizin içinde, sizin yazmadığınız birkaç yüz satır kod var demektir.

---

## Emniyet kritik yazılımda ne yapmalı

Bütün bunlar sertifikasyon masasına şu şekilde iniyor.

**1. Girdi aralığını gereksinim seviyesinde tanımlayın.** `sinf`'in tüm float aralığında doğru çalıştığını kanıtlamak zorunda değilsiniz — o argümanların hiçbirini üretmediğinizi kanıtlamak yeterli, hatta daha kolay. "Açı girdisi `[−2π, 2π]` aralığındadır" diyen bir düşük seviye gereksinim, doğrulama yükünü dramatik biçimde küçültür: `2/π`'nin 164 bitini değil, Cody–Waite'in 48 bitini savunmanız gerekir. Bu kısıtı gereksinime yazmıyorsanız, kanıt yükünü kütüphanenin tamamı için üstlenmişsiniz demektir.

**2. Açıyı radyan `float` olarak biriktirmeyin.** Aviyonikte yaygın ve doğru çözüm BAM'dir (Binary Angular Measurement): açıyı tam turun kesri olarak sabit noktalı bir tamsayıda tutmak. 32 bitlik bir BAM'de tam tur `2³²`'dir; sarma (wraparound) tamsayı taşmasıyla **bedava ve tam** olur, argüman indirgeme diye bir problem kalmaz, çözünürlük tüm aralıkta sabittir. Radyan `float` ise tam tersini yapar: değer büyüdükçe çözünürlük çöker. Radyan kullanmak zorundaysanız, akümülatörü her adımda sarın ve `double` tutun.

**3. Kütüphanenizi kendiniz ölçün.** Bu yazıdaki tarama yaklaşık yüz satır kod. Kullandığınız toolchain'in libm'i için bir kez çalıştırıp sonucu doğrulama kanıtı olarak saklamak, "kütüphane doğrudur" varsayımından çok daha savunulabilir. Ölçtüğünüz şeyin de ne olduğunu bilin: benimki 4800 örneklik bir tarama, bir ispat değil — ama 4800 örnek "hiç ölçmedim"den sonsuz kere iyidir.

**4. Yürütülebilire giren kütüphane kodunu unutmayın.** DO-178C'de yürütülebilirin içindeki, kaynağa izlenemeyen ek kodun doğrulanması gereken bir kategori vardır; DO-248C 4.12.1 bu bağlamda örnek olarak "run-time library support code"u açıkça sayar. `sinf` tam olarak budur. Kaynak kodunuzda görünmez, gereksinimlerinize izlenmez, ama uçakta çalışır.

**5. Vektörleştirmenin doğruluğu değiştirebileceğini hesaba katın.** glibc tablosundaki `sin_advsimd`/`sin_sve` satırları bunun somut kanıtı: aynı fonksiyonun vektör varyantı iki kat kötü. Derleyici bayraklarınız bir döngüyü vektörleştirdiğinde, sayısal sonuçlarınız — ve daha önce onayladığınız test beklentileriniz — sessizce değişebilir.

---

## Açık sorular

Doğru yuvarlanmış bir libm'in maliyeti düşüyor. CORE-MATH projesi tüm C99 `binary32` fonksiyonlarını doğru yuvarlanmış olarak gerçekledi ve bunun performans cezası olmadan yapılabildiğini gösterdi; bazı rutinleri ticari kütüphanelere girmeye başladı. IEEE 754'ün 2029 revizyonunda doğru yuvarlamanın zorunlu hâle getirilmesi tartışılıyor.

Bu, emniyet kritik taraf için ilginç bir olasılık: doğruluğu bit-bit tanımlı bir `sinf`, iki farklı toolchain'in aynı sonucu üretmesini garanti eder. Bugün elimizde olmayan şey tam olarak bu — ve deterministik derleme, test tekrarlanabilirliği, çoklu tedarikçi doğrulaması gibi problemlerin bir kısmı doğrudan bundan kaynaklanıyor.

Benim için açık kalan soru şu: kısıtlanmış girdi aralığı + doğru yuvarlanmış çekirdek fonksiyonlardan oluşan, DO-178C kanıtı taşınabilir bir "aviyonik libm" alt kümesi ne kadar küçük olabilirdi? `sin`, `cos`, `atan2`, `sqrt` ve `exp`'in `[−2π, 2π]` ile sınırlı hâlleri, bugün taşıdığımız genel amaçlı kütüphanenin ne kadarını gereksiz kılardı? Ölçtüğüm kadarıyla, cevabın "çok"tan yana olduğunu düşünüyorum.

---

## Kaynaklar

- ISO/IEC 9899 (C11 taslağı N1570), §5.2.4.2.2 madde 6 — kütüphane doğruluğu implementation-defined: <https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf>
- GNU C Library Manual, *Known Maximum Errors in Math Functions*: <https://www.gnu.org/software/libc/manual/html_node/Errors-in-Math-Functions.html>
- glibc kaynak ağacı, `sysdeps/aarch64/libm-test-ulps` (glibc 2.40): <https://github.com/bminor/glibc/blob/glibc-2.40/sysdeps/aarch64/libm-test-ulps>
- K.C. Ng (SunPro), *Argument Reduction for Huge Arguments: Good to the Last Bit*: <https://www.validlab.com/arg.pdf>
- M. Payne, R. Hanek, "Radian reduction for trigonometric functions", *ACM SIGNUM Newsletter* 18 (1983), 19–24: <https://dl.acm.org/doi/10.1145/1057600.1057602>
- musl libc, `src/math/__rem_pio2f.c`: <https://git.musl-libc.org/cgit/musl/tree/src/math/__rem_pio2f.c>
- llvm-dev, "[FP] Constant folding math library functions" (Nisan 2019): <https://lists.llvm.org/pipermail/llvm-dev/2019-April/131851.html>
- Rapita Systems, *Verifying additional code for DO-178C* (DO-248C 4.12.1 atfı): <https://www.rapitasystems.com/object-code-verification>
- CORE-MATH projesi: <https://core-math.gitlabpages.inria.fr/>
- Bu blogda ilgili yazı: [Kayan Nokta Sayılarının Tehlikeleri](/2026/03/25/kayan-nokta-sayilarinin-tehlikeleri.html)

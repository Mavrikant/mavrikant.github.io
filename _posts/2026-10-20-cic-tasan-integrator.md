---
title: "CIC Filtresinde İntegratör Taşar — ve Bu Bir Bug Değildir"
subtitle: "Why a CIC Decimator's Integrators Must Be Allowed to Overflow"
background: "/img/posts/6.webp"
date: '2026-10-20 21:00:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [sinyal-isleme, gomulu-sistemler, c-cpp]
---

Bir dijital alıcının taban bant tarafını kurarken karşınıza er geç şu sahne çıkar: FPGA'deki desimasyon filtresinin integratör registerları sürekli taşıyor. Simülasyonda dalga formuna bakarsınız, 40 bitlik akümülatör saniyede yüzlerce kez pozitif tepeden negatif tabana atlıyor. İçgüdü nettir — *"burada bir taşma var, saturasyon ekleyelim."*

O saturasyonu eklediğiniz anda filtreyi bozarsınız.

Bu, **CIC** (cascaded integrator-comb) filtrelerinin en çok yanlış bilinen özelliğidir: integratörlerin taşması bir arıza değil, tasarımın çalışma koşuludur. Taşmayı engellemeye çalışmak — register'ı genişletmek değil, *saturasyon koymak* — çıkışı bozan şeydir. Bu yazıda önce bunun neden böyle olduğunu modüler aritmetikle türeteceğiz, sonra 40 bitlik gerçek bir desimatör üzerinde ölçeceğiz, ardından aynı filtreyi C'de yazdığınızda neden MISRA C:2012 Rule 1.3'e çarptığınıza bakacağız. Sonunda da madalyonun öbür yüzüne — droop ve alias'a — geçip kompanzasyon filtresini tasarlayacağız.

Konunun internette dağınık olmasının bir sebebi var: birincil kaynak 1981 tarihli bir IEEE makalesi, satıcı dokümanları formülü verip türetmiyor, ve asıl karşı-sezgisel sonucu — saturasyonun zararlı olduğunu — neredeyse kimse açıkça yazmıyor.

---

## Kısa Bir Tarihçe: Hogenauer'in 1981 Makalesi

CIC filtresini 1981'de Eugene B. Hogenauer, IEEE Transactions on Acoustics, Speech and Signal Processing'in Nisan sayısında yayımladığı **"An Economical Class of Digital Filters for Decimation and Interpolation"** makalesiyle tanımladı (cilt ASSP-29, sayı 2, ss. 155–162). Literatürde bu yüzden *Hogenauer filtresi* adıyla da geçer.

Makalenin derdi dönemin donanım gerçeğiydi: çarpma pahalıydı. Yüksek örnekleme hızındaki bir akışı 64'e, 256'ya bölmek için klasik bir FIR kullanmak, giriş hızında yüzlerce çarpma demekti. Hogenauer'in gözlemi şuydu: katsayıları hepsi 1 olan bir hareketli ortalama filtresi, **tek bir çarpma bile kullanmadan** iki parçaya ayrılabilir — bir integratör ve bir fark alıcı (comb). Üstelik comb tarafını desimasyondan *sonraya* koyarsanız düşük hızda çalışır.

Sonuç, yalnızca toplayıcı ve registerdan oluşan bir filtredir. Kırk yıl sonra hâlâ her dijital downconverter'ın (DDC), her sigma-delta ADC'nin desimasyon zincirinin ve her SDR ön-işleyicisinin içindedir. Bu blogda daha önce [bandpass sampling](/2026/05/21/bandpass-sampling.html) yazısında 1 GHz'lik bir sinyali 50 MHz clock ile örneklemiştik; o örneklerin ardından gelen ilk blok tipik olarak budur.

---

## CIC'in Anatomisi

Bir desimasyon CIC'i üç parçadan oluşur:

1. **İntegratör bölümü** — giriş hızında çalışan $N$ adet akümülatör: $y[n] = y[n-1] + x[n]$
2. **Desimatör** — $R$ örnekte birini alır, hiçbir aritmetik yapmaz
3. **Comb bölümü** — çıkış hızında çalışan $N$ adet fark alıcı: $y[n] = x[n] - x[n-M]$

Buradaki $M$ **diferansiyel gecikme**dir ve pratikte 1 veya 2 seçilir. $N$ kademe sayısı, $R$ desimasyon oranıdır.

<div class="mermaid">
graph LR
  X[Giriş - fs hızında]
  I1[İntegratör 1]
  I2[İntegratör N]
  D[Desimasyon - R'ye böl]
  C1[Comb 1 - gecikme M]
  C2[Comb N - gecikme M]
  Y[Çıkış - fs/R hızında]
  X --> I1
  I1 --> I2
  I2 --> D
  D --> C1
  C1 --> C2
  C2 --> Y
</div>

Giriş hızına göre yazılmış transfer fonksiyonu tek bir ifadeye katlanır:

$$ H(z) = \left( \frac{1 - z^{-RM}}{1 - z^{-1}} \right)^{N} $$

Payda integratörleri, pay comb'ları temsil eder. Birinci dereceden ($N = 1$) hâli, uzunluğu $RM$ olan ve bütün katsayıları 1'e eşit bir hareketli ortalama filtresinden başka bir şey değildir. $N$ kademe, bu hareketli ortalamanın $N$ kez art arda uygulanması demektir.

Genlik cevabı buradan çıkar:

$$ \lvert H(f) \rvert = \left\lvert \frac{\sin(\pi M R f)}{R M \sin(\pi f)} \right\rvert^{N} $$

Burada $f$, giriş örnekleme hızına göre normalize edilmiş frekanstır ve ifade DC'de 1 olacak şekilde ölçeklenmiştir. Sıfırlar $1/(RM)$'in sıfırdan farklı katlarındadır — yani desimasyondan sonra taban banda katlanacak olan bantların tam ortasına.

DC kazancı ise ölçeklemeden önce şudur:

$$ G = (RM)^{N} $$

Bu sayı küçük değildir. $R = 64$, $M = 1$, $N = 4$ için $G = 64^4 = 16\,777\,216$, yani 24 bitlik bir kazanç.

---

## Bit Büyümesi: Register Ne Kadar Geniş Olmalı?

Kazanç 24 bitse, veri yolu da 24 bit büyümek zorundadır. Giriş genişliğine $b$, gereken iç genişliğe $B$ dersek:

$$ B = b + N \log_2 (RM) $$

Altera'nın CIC IP Core kılavuzu aynı formülü `Bout = Bin + Nlog2(RM)` biçiminde verir ve kritik cümleyi hemen ardına ekler: *"A data width of Bout is required for each integrator and differentiator for no data loss."* Yani bu genişlik yalnızca çıkış kademesi için değil, **her integratör ve her comb için** gereklidir. AMD'nin CIC Compiler çekirdeği de tam hassasiyet modunda içeride her kademe için `Bmax` bit kullandığını söyler.

16 bitlik bir girişle, $R = 64$, $M = 1$, $N = 4$ için:

$$ B = 16 + 4 \cdot \log_2 64 = 16 + 24 = 40 \ \text{bit} $$

Sekiz tane 40 bitlik toplayıcı. Bu, CIC'in gerçek maliyetidir: çarpıcıdan kaçarsınız ama geniş toplayıcı ödersiniz.

---

## İntegratörler Neden Taşar?

Cevap transfer fonksiyonunda duruyor. Tek bir integratörün kazancı DC'de sonsuzdur:

$$ H_{\text{int}}(z) = \frac{1}{1 - z^{-1}} \quad \Rightarrow \quad \lvert H_{\text{int}}(f) \rvert \to \infty \ \ (f \to 0) $$

Girişinize sabit bir DC bileşeni verin, akümülatör sonsuza kadar tırmanır. Hiçbir sonlu register bunu tutamaz. Dahası, $N$ integratör arka arkaya olduğunda ikincisi birincinin rampasını integre eder — parabolik büyüme, üçüncüsü kübik.

Burada önemli bir ayrım var. **Filtrenin çıkışı** sınırlıdır: tam skala bir girişte en fazla $(RM)^N \cdot 2^{b-1}$ olur ve tam olarak $B$ bite sığar. Ama **ara değerler** sığmaz. İntegratör registerları, çıkışın asla ulaşmayacağı değerlere tırmanır, taşar, baştan sarar; comb bölümü de bu sarmalanmış değerlerin farkını alır.

Soru şu: comb, sarmalanmış iki sayının farkından doğru sonucu nasıl çıkarıyor?

---

## Modüler Aritmetik Argümanı

Cevap cebirsel ve kısa. $B$ bitlik two's complement aritmetiği, tamsayılar halkasından $\mathbb{Z}/2^{B}\mathbb{Z}$ halkasına giden doğal izdüşümdür. Bu izdüşüm toplama ve çıkarmayı korur:

$$ (u + v) \bmod 2^{B} = \left( (u \bmod 2^{B}) + (v \bmod 2^{B}) \right) \bmod 2^{B} $$

Çıkarma için de aynısı geçerlidir. Bir CIC'in veri yolunda **yalnızca toplama, çıkarma ve register gecikmesi** vardır — çarpma yok, kaydırma yok, saturasyon yok, kırpma yok. Desimatör bile aritmetik yapmaz, sadece örnek atar.

Dolayısıyla tüm zincir, girişten çıkışa, modüler aritmetikle hesaplandığında tam aritmetikle hesaplanan sonucun $2^{B}$ modundaki karşılığını verir. Yani:

$$ y_{\text{wrap}} \equiv y_{\text{tam}} \pmod{2^{B}} $$

Şimdi son adım: eğer $y_{\text{tam}}$ değeri $B$ bitlik two's complement aralığına, yani $[-2^{B-1},\ 2^{B-1}-1]$ içine sığıyorsa, bu denklik sınıfının o aralıktaki **tek** temsilcisi $y_{\text{tam}}$'ın kendisidir. Register'daki bit örüntüsünü two's complement olarak okuduğunuzda tam olarak doğru sayıyı elde edersiniz. Ara değerlerin kaç kez taştığının hiçbir önemi yoktur.

Rick Lyons bu koşulları iki maddede özetler: sayı sisteminin aralığı çıkışta beklenen maksimum değere eşit ya da ondan büyük olmalı, **ve** filtre two's complement (saturasyonsuz) aritmetikle gerçeklenmeli.

Buradan üç pratik sonuç çıkar:

- **Register genişliği $B$'den dar olamaz.** O zaman gerçek çıkış da sığmaz, denklik sınıfından yanlış temsilciyi okursunuz.
- **Saturasyon öldürücüdür.** Saturasyon bir halka homomorfizması değildir; bilgiyi kalıcı olarak yok eder. Taşan bir integratörü kırptığınız anda modüler eşitlik kopar.
- **Veri yolunun ortasında kırpma yapılamaz.** LSB atmak (Hogenauer pruning) ayrı ve kontrollü bir konudur; aşağıda ayrıca değineceğiz.

İkinci maddenin altını çizmek istiyorum çünkü sezgiye ters düşen kısım orası. Emniyet kritik yazılımda refleksimiz taşmayı saturasyonla kapatmaktır. Burada saturasyon, "güvenli varsayılan" değil, tam olarak hata kaynağıdır.

---

## Elle Takip Edilebilen Bir Örnek

Argümanı altı bitle kontrol edebiliriz. $b = 4$ bit giriş, $R = 4$, $M = 1$, $N = 1$ alalım. O zaman $B = 4 + \log_2 4 = 6$ bit, aralık $[-32, 31]$.

Girişimiz sekiz adet $+7$ (4 bitlik tam skala) ve ardından dört adet $-8$ olsun.

| Adım | Giriş | İntegratör - tam | İntegratör - 6 bit |
|---|---|---|---|
| 0 | 7 | 7 | 7 |
| 1 | 7 | 14 | 14 |
| 2 | 7 | 21 | 21 |
| 3 | 7 | 28 | 28 |
| 4 | 7 | 35 | **−29** |
| 5 | 7 | 42 | −22 |
| 6 | 7 | 49 | −15 |
| 7 | 7 | 56 | −8 |
| 8 | −8 | 48 | −16 |
| 9 | −8 | 40 | −24 |
| 10 | −8 | 32 | **−32** |
| 11 | −8 | 24 | 24 |

Register 4. ve 10. adımlarda olmak üzere iki kez taştı. Desimatör 0, 4 ve 8. örnekleri alır: tam aritmetikte $7,\ 35,\ 48$; 6 bitlik registerda $7,\ -29,\ -16$.

Comb ($M = 1$) ardışık farkları alır. Tam aritmetikte çıkış $7,\ 28,\ 13$. Altı bitlik registerda:

- $7 - 0 = 7$
- $-29 - 7 = -36$, altı bitte sarar: $-36 + 64 = \mathbf{28}$
- $-16 - (-29) = \mathbf{13}$

Üçü de birebir aynı. Şimdi aynı zinciri saturasyonlu toplayıcıyla çalıştırın: integratör 4. adımda 31'de takılır ve çıkış $7,\ 24,\ -8$ olur. İkinci ve üçüncü örnek yanlıştır.

---

## Deney: 40 Bitlik Gerçek Bir Desimatör

Mini örnek ikna edici ama küçük. Gerçekçi bir yapılandırmayla — 16 bit giriş, $R = 64$, $M = 1$, $N = 4$, yani $B = 40$ bit — dört varyantı yan yana koydum: sınırsız Python tamsayılarıyla tam hassasiyet, 40 bit wraparound, 39 bit wraparound ve 40 bit saturasyon.

```python
def wrap(v, B):
    m = 1 << B
    v &= m - 1
    return v - m if v >= (m >> 1) else v

def sat(v, B):
    hi, lo = (1 << (B - 1)) - 1, -(1 << (B - 1))
    return hi if v > hi else (lo if v < lo else v)

def cic_decimate(x, R, M, N, B=None, mode="wrap"):
    if   mode == "wrap" and B: f = lambda v: wrap(v, B)
    elif mode == "sat"  and B: f = lambda v: sat(v, B)
    else:                      f = lambda v: v          # tam hassasiyet
    acc, wraps = [0] * N, [0] * N
    integ = []
    for s in x:                      # integratör bölümü, giriş hızında
        v = s
        for i in range(N):
            raw = acc[i] + v
            acc[i] = f(raw)
            if acc[i] != raw:
                wraps[i] += 1
            v = acc[i]
        integ.append(v)
    d = integ[::R]                   # desimasyon: sadece örnek atar
    delay, y = [[0] * M for _ in range(N)], []
    for s in d:                      # comb bölümü, çıkış hızında
        v = s
        for i in range(N):
            raw = v - delay[i][0]
            delay[i] = delay[i][1:] + [v]
            v = f(raw)
        y.append(v)
    return y, wraps
```

Giriş olarak iki ton artı gürültüden oluşan, 16 bitlik tam skalaya yakın 4096 örneklik bir dizi verdim. Sonuçlar:

| Varyant | İntegratör taşma sayısı | Tam hassasiyetle birebir aynı mı? | Maksimum hata |
|---|---|---|---|
| Tam hassasiyet (sınırsız tamsayı) | — | referans | — |
| 40 bit, wraparound | kademe başına 0, 0, 20, **948** | **Evet** | 0 |
| 39 bit, wraparound | — | Hayır | 549 755 813 888 |
| 40 bit, **saturasyon** | — | **Hayır** | 751 242 354 973 |

Dördüncü integratör 4096 örneğin 948'inde taştı — yani zamanın dörtte birinde. Çıkışın tepe değeri 404 839 902 360 idi; 40 bitlik aralığın sınırı $2^{39} = 549\,755\,813\,888$. Çıkış rahatça sığıyor, ara değerler sığmıyor, ve wraparound ile sonuç **bit-bit** doğru.

Genişliği bir bit kısmak çıkışı tam skala kadar kaydırıyor. Saturasyon ise doğru genişlikte bile filtreyi tamamen bozuyor — hatanın tam skaladan büyük olması çıkışın artık anlamlı bir sinyal olmadığını gösteriyor.

Sınır gerçekten tam oturuyor mu diye en kötü durumu da denedim. Sabit DC girişle:

| DC girişi | Çıkış tepe değeri | $2^{39}$ | Sığıyor mu? |
|---|---|---|---|
| +32767 | 549 739 036 672 | 549 755 813 888 | Evet |
| −32768 | 549 755 813 888 | 549 755 813 888 | Evet, tam sınırda |

$b + N\log_2(RM)$ formülü cömert değil, **tam**. Bir bit fazlası israf, bir bit eksiği hata.

---

## Peki C'de? Signed Taşma Tanımsız Davranıştır

Buraya kadar her şey donanım dünyasında temiz. VHDL'de `numeric_std` ile `signed`, Verilog'da sabit genişlikli vektör aritmetiği zaten modülerdir; tehlike yalnızca saturasyonlu bir DSP bloğu ya da elle yazılmış bir kelepçe eklediğinizde doğar.

Aynı filtreyi bir DSP'de ya da Cortex-A üzerinde C ile yazdığınızda tablo değişir. Şu integratör döngüsü:

```c
int32_t acc = 0;
for (int i = 0; i < n; i++) {
    acc += x[i];        /* taşmaya güveniyoruz */
}
```

**tanımsız davranıştır.** C standardında unsigned tamsayılar $2^{n}$ modunda sarmalanır, ama signed tamsayı taşmasının sonucu tanımsızdır. Yani az önce doğruluğunu kanıtladığımız algoritmayı, dilin size garanti etmediği bir davranışın üzerine kurmuş olursunuz.

"Pratikte çalışıyor ama" demeden önce derleyicinin bu lisansı gerçekten kullandığını görmek gerekiyor. Apple clang 21 ile arm64 üzerinde şu iki fonksiyonu derledim:

```c
int monotonic_signed(int32_t a)    { return a + 1 > a; }
int monotonic_unsigned(uint32_t a) { return a + 1u > a; }
```

`-O0` ile `monotonic_signed(INT32_MAX)` beklendiği gibi 0 döndü. `-O2` ile **1** döndü, çünkü derleyici fonksiyonu tek talimata indirdi:

```text
_monotonic_signed:
	mov	w0, #1
	ret
```

Derleyici "signed taşma olamaz" varsayımını kullanıp karşılaştırmayı tamamen sildi. `-fwrapv` eklediğinizde gerçek karşılaştırma geri geliyor:

```text
_monotonic_signed:
	mov	w8, #2147483647
	cmp	w0, w8
	cset	w0, ne
	ret
```

UBSan de integratör satırını doğrudan işaret ediyor:

```text
ub.c:7:37: runtime error: signed integer overflow:
  1073741824 + 1073741824 cannot be represented in type 'int32_t' (aka 'int')
```

Dürüst olmak gerekirse: bu testte signed akümülatörün *sonucu* yanlış çıkmadı; iki varyant da aynı değeri verdi. Mesele zaten bu — tanımsız davranışın tehlikesi bugün yanlış sonuç vermesi değil, derleyicinin o varsayımı istediği an kullanma hakkının olmasıdır. `monotonic_signed` örneği bu hakkın teorik olmadığını gösteriyor.

DO-178C ortamında bu, araç zinciri sürümü değiştiğinde yeniden doğrulama yükü demektir. MISRA C:2012 Rule 1.3 de (Required) tanımsız ve kritik belirsiz davranışı doğrudan yasaklar. Buradaki ihlal Rule 12.4 değildir — o kural *unsigned* sabit ifadelerin wrap-around'uyla ilgilidir ve çalışma zamanındaki kasıtlı modüler aritmetiği hedeflemez.

Doğru kalıp, modüler aritmetiği dilin garanti ettiği tarafta yapmaktır:

```c
/* integratör: akümülatör unsigned, yorum signed */
uint64_t acc = 0;                     /* B <= 64 için */
acc += (uint64_t)(int64_t)x[i];       /* tanımlı: mod 2^64 */

/* B bitlik two's complement olarak geri oku; 1 < B < 64 */
static int64_t as_signed(uint64_t v, unsigned B) {
    v &= (1ULL << B) - 1u;
    uint64_t sign = 1ULL << (B - 1);
    return (int64_t)(v ^ sign) - (int64_t)sign;
}
```

Sarmalama `uint64_t` üzerinde yapıldığı için tanımlıdır; işaret genişletmesi de implementation-defined dönüşüme bırakılmayıp bit işlemleriyle açıkça yazılmıştır. Tasarım dokümanında "bu akümülatörün taşması kasıtlıdır ve filtre doğruluğunun ön koşuludur" cümlesinin bulunması da — kod incelemesinde ilk kaldırılmak istenecek şey tam olarak budur — en az kod kadar önemlidir.

---

## Madalyonun Öbür Yüzü: Droop ve Alias

Taşma tarafını hallettikten sonra CIC'in asıl tasarım gerilimi kalır. Aynı $N$ parametresi iki şeyi birden belirler: geçiş bandındaki sarkma (droop) ve alias bastırma.

<figure>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 380" width="100%" role="img" aria-label="N=4, R=64, M=1 CIC filtresinin genlik cevabı; sıfırlar alias bantlarının üzerine oturuyor">
  <g fill="currentColor" font-family="inherit" font-size="12">
  <rect x="240.9" y="18" width="91.5" height="316" fill="currentColor" opacity="0.10"/>
  <rect x="469.6" y="18" width="91.5" height="316" fill="currentColor" opacity="0.10"/>
  <rect x="698.3" y="18" width="45.7" height="316" fill="currentColor" opacity="0.10"/>
  <rect x="58.0" y="18" width="45.7" height="316" fill="currentColor" opacity="0.18"/>
  <line x1="58" y1="31.7" x2="744" y2="31.7" stroke="currentColor" stroke-width="0.5" opacity="0.25"/>
  <text x="50" y="35.7" text-anchor="end" opacity="0.75">0</text>
  <line x1="58" y1="86.7" x2="744" y2="86.7" stroke="currentColor" stroke-width="0.5" opacity="0.25"/>
  <text x="50" y="90.7" text-anchor="end" opacity="0.75">-20</text>
  <line x1="58" y1="141.7" x2="744" y2="141.7" stroke="currentColor" stroke-width="0.5" opacity="0.25"/>
  <text x="50" y="145.7" text-anchor="end" opacity="0.75">-40</text>
  <line x1="58" y1="196.6" x2="744" y2="196.6" stroke="currentColor" stroke-width="0.5" opacity="0.25"/>
  <text x="50" y="200.6" text-anchor="end" opacity="0.75">-60</text>
  <line x1="58" y1="251.6" x2="744" y2="251.6" stroke="currentColor" stroke-width="0.5" opacity="0.25"/>
  <text x="50" y="255.6" text-anchor="end" opacity="0.75">-80</text>
  <line x1="58" y1="306.5" x2="744" y2="306.5" stroke="currentColor" stroke-width="0.5" opacity="0.25"/>
  <text x="50" y="310.5" text-anchor="end" opacity="0.75">-100</text>
  <line x1="58.0" y1="18" x2="58.0" y2="334" stroke="currentColor" stroke-width="0.5" opacity="0.25"/>
  <text x="58.0" y="352" text-anchor="middle" opacity="0.75">0</text>
  <line x1="286.7" y1="18" x2="286.7" y2="334" stroke="currentColor" stroke-width="0.5" opacity="0.25"/>
  <text x="286.7" y="352" text-anchor="middle" opacity="0.75">1/R</text>
  <line x1="515.3" y1="18" x2="515.3" y2="334" stroke="currentColor" stroke-width="0.5" opacity="0.25"/>
  <text x="515.3" y="352" text-anchor="middle" opacity="0.75">2/R</text>
  <line x1="744.0" y1="18" x2="744.0" y2="334" stroke="currentColor" stroke-width="0.5" opacity="0.25"/>
  <text x="744.0" y="352" text-anchor="middle" opacity="0.75">3/R</text>
  <polyline fill="none" stroke="currentColor" stroke-width="1.8" points="58.0,31.7 60.9,31.8 63.7,31.8 66.6,32.0 69.4,32.1 72.3,32.4 75.2,32.6 78.0,32.9 80.9,33.3 83.7,33.7 86.6,34.2 89.4,34.7 92.3,35.3 95.2,35.9 98.0,36.6 100.9,37.3 103.7,38.1 106.6,38.9 109.4,39.8 112.3,40.8 115.2,41.8 118.0,42.8 120.9,43.9 123.7,45.1 126.6,46.3 129.5,47.6 132.3,48.9 135.2,50.3 138.0,51.8 140.9,53.3 143.8,54.9 146.6,56.6 149.5,58.3 152.3,60.1 155.2,62.0 158.0,63.9 160.9,66.0 163.8,68.1 166.6,70.2 169.5,72.5 172.3,74.8 175.2,77.3 178.1,79.8 180.9,82.4 183.8,85.1 186.6,87.9 189.5,90.9 192.3,93.9 195.2,97.0 198.1,100.3 200.9,103.7 203.8,107.2 206.6,110.9 209.5,114.7 212.3,118.7 215.2,122.9 218.1,127.2 220.9,131.7 223.8,136.5 226.6,141.4 229.5,146.6 232.4,152.1 235.2,157.9 238.1,164.0 240.9,170.4 243.8,177.3 246.6,184.6 249.5,192.4 252.4,200.9 255.2,210.0 258.1,220.0 260.9,230.9 263.8,243.1 266.7,256.7 269.5,272.4 272.4,290.9 275.2,313.2 278.1,334.0 281.0,334.0 283.8,334.0 286.7,334.0 289.5,334.0 292.4,334.0 295.2,334.0 298.1,322.7 301.0,302.8 303.8,286.8 306.7,273.5 309.5,262.2 312.4,252.4 315.2,243.9 318.1,236.4 321.0,229.7 323.8,223.7 326.7,218.3 329.5,213.5 332.4,209.1 335.3,205.1 338.1,201.6 341.0,198.3 343.8,195.4 346.7,192.7 349.6,190.3 352.4,188.2 355.3,186.2 358.1,184.5 361.0,183.0 363.8,181.7 366.7,180.6 369.6,179.7 372.4,178.9 375.3,178.3 378.1,177.9 381.0,177.6 383.9,177.4 386.7,177.4 389.6,177.6 392.4,177.9 395.3,178.3 398.1,178.9 401.0,179.6 403.9,180.5 406.7,181.5 409.6,182.7 412.4,184.0 415.3,185.4 418.2,187.0 421.0,188.7 423.9,190.6 426.7,192.6 429.6,194.8 432.4,197.2 435.3,199.7 438.2,202.5 441.0,205.4 443.9,208.5 446.7,211.8 449.6,215.3 452.5,219.1 455.3,223.1 458.2,227.4 461.0,232.0 463.9,236.9 466.7,242.1 469.6,247.7 472.5,253.8 475.3,260.3 478.2,267.4 481.0,275.0 483.9,283.4 486.8,292.6 489.6,302.8 492.5,314.3 495.3,327.3 498.2,334.0 501.0,334.0 503.9,334.0 506.8,334.0 509.6,334.0 512.5,334.0 515.3,334.0 518.2,334.0 521.0,334.0 523.9,334.0 526.8,334.0 529.6,334.0 532.5,334.0 535.3,334.0 538.2,323.8 541.1,313.5 543.9,304.5 546.8,296.5 549.6,289.3 552.5,282.9 555.3,277.0 558.2,271.7 561.1,266.8 563.9,262.4 566.8,258.4 569.6,254.7 572.5,251.3 575.4,248.3 578.2,245.5 581.1,242.9 583.9,240.6 586.8,238.5 589.6,236.6 592.5,234.9 595.4,233.4 598.2,232.1 601.1,230.9 603.9,230.0 606.8,229.2 609.7,228.5 612.5,228.0 615.4,227.7 618.2,227.5 621.1,227.5 624.0,227.6 626.8,227.9 629.7,228.3 632.5,228.8 635.4,229.5 638.2,230.3 641.1,231.3 644.0,232.5 646.8,233.7 649.7,235.2 652.5,236.8 655.4,238.5 658.2,240.5 661.1,242.5 664.0,244.8 666.8,247.3 669.7,249.9 672.5,252.8 675.4,255.8 678.3,259.1 681.1,262.6 684.0,266.4 686.8,270.4 689.7,274.7 692.5,279.4 695.4,284.4 698.3,289.8 701.1,295.6 704.0,301.8 706.8,308.7 709.7,316.1 712.6,324.2 715.4,333.2 718.3,334.0 721.1,334.0 724.0,334.0 726.9,334.0 729.7,334.0 732.6,334.0 735.4,334.0 738.3,334.0 741.1,334.0 744.0,334.0"/>
  <circle cx="103.7" cy="38.1" r="3.5" fill="currentColor"/>
  <text x="110.7" y="28.1" text-anchor="start" font-size="11.5">bant kenarı -2.3 dB</text>
  <circle cx="240.9" cy="170.4" r="3.5" fill="currentColor"/>
  <text x="247.9" y="160.4" text-anchor="start" font-size="11.5">en kötü alias -50.5 dB</text>
  <text x="401" y="372" text-anchor="middle" opacity="0.8">giriş örnekleme hızına göre frekans [1/R birimi]</text>
  <text x="14" y="176" text-anchor="middle" opacity="0.8" transform="rotate(-90 14 176)">genlik (dB)</text>
  </g></svg>
  <figcaption><strong>Şekil 1.</strong> $N = 4$, $R = 64$, $M = 1$ CIC filtresinin genlik cevabı. Koyu gölgeli bölge geçiş bandı, açık gölgeli bölgeler desimasyondan sonra taban banda katlanacak alias bantları. Sıfırlar tam olarak alias bantlarının ortasına oturuyor — filtrenin bütün hilesi bu. Buna karşılık geçiş bandının kenarı da sıfıra doğru sarkıyor.</figcaption>
</figure>

Sıfırların alias bantlarının merkezine oturması tesadüf değil: alias bantları $1/R$ aralıklı, sıfırlar ise $1/(RM)$ aralıklıdır; $M$ tam sayı olduğu için her alias bandının merkezi aynı zamanda bir sıfırdır. Ama bir alias bandının *kenarı* sıfırdan uzaktır, ve en kötü durum DC'ye en yakın alias bandının iç kenarıdır. Geçiş bandı kenarını çıkış Nyquist'inin 0.40 katı seçersek, $R = 64$, $M = 1$ için ölçtüğüm değerler:

| $N$ | Droop 0.25×Nyq | Droop 0.40×Nyq | Droop 0.50×Nyq | En kötü alias | Gereken $B$ |
|---|---|---|---|---|---|
| 3 | 0.67 dB | 1.74 dB | 2.74 dB | −37.9 dB | 34 bit |
| 4 | 0.90 dB | 2.32 dB | 3.65 dB | −50.5 dB | 40 bit |
| 5 | 1.12 dB | 2.90 dB | 4.56 dB | −63.1 dB | 46 bit |
| 6 | 1.35 dB | 3.47 dB | 5.47 dB | −75.7 dB | 52 bit |

Tablo tasarım kararını üç sütunda özetliyor. Her ek kademe alias bastırmasına yaklaşık 12–13 dB katıyor, geçiş bandı sarkmasına yarım dB ekliyor ve veri yoluna 6 bit bindiriyor. Alias bastırma ihtiyacınız kademe sayısını belirler; droop'u sonradan düzeltirsiniz; faturayı register genişliği öder.

Düzeltme, çıkış hızında çalışan kısa bir **inverse-sinc FIR** ile yapılır. Çıkış hızında olduğu için ucuzdur. $N = 4$, $R = 64$ için `scipy.signal.firls` ile ters genlik cevabını hedefleyerek tasarladığım kompanzatörlerin geçiş bandı ripple'ı:

| Tap sayısı | Ripple - float | Ripple - Q15 katsayı |
|---|---|---|
| kompanzasyonsuz | 2.32 dB | — |
| 11 | 1.00 dB | 1.00 dB |
| 15 | 0.53 dB | 0.53 dB |
| 21 | 0.12 dB | 0.12 dB |
| 31 | 0.04 dB | 0.04 dB |

Yirmi bir tap ile 2.32 dB'lik sarkma 0.12 dB'ye iniyor. Katsayıları Q15'e kuantize etmek sonucu kayda değer biçimde değiştirmiyor — kompanzatör geniş geçiş bantlı ve düşük Q'lu olduğu için katsayı hassasiyetine duyarlı değil. (Bu, dar bantlı IIR'lerde durumun ne kadar farklı olabileceğini hatırlatıyor; orası başka bir yazının konusu.) On beş tap'lik simetrik çekirdek, Q14'te şu haliyle:

```text
h = [-109, -168,  465,  260, -1084, -585, 2925, 5192,
     2925, -585, -1084,  260,   465, -168, -109]
```

---

## Hogenauer Pruning: LSB Tarafı

Kırk bitlik sekiz toplayıcı pahalıysa, Hogenauer'in makalesindeki ikinci katkı devreye girer. **Pruning**, her kademede en anlamsız bitlerin atılmasıdır; korunan bit sayısı kademeden kademeye monoton azalır ve toplam hata, tam hassasiyetli çıkışı yuvarlarken oluşan kuantizasyon hatasından büyük olmayacak şekilde seçilir. Altera'nın kılavuzu tekniği bu şekilde tarif eder ve hesabı doğrudan Hogenauer 1981'e dayandırır.

Burada kafa karışıklığı yaratan nokta şu: pruning ile taşma aynı konu değildir, hatta aynı uçta bile değildirler. Pruning **LSB** tarafını, taşma argümanı **MSB** tarafını ilgilendirir. Pruning uygulanmış bir tasarımda da kural değişmez — her kademenin registerı, o kademede oluşabilecek maksimum değeri tutacak kadar geniş olmalı ve aritmetik sarmalamalı kalmalıdır.

Pratik not: pruning'i elle hesaplamak yerine IP çekirdeğine bırakmak genellikle doğru karardır. Altera'nın kılavuzu pruning'in yalnızca seçilen çıkış genişliği tam çözünürlükten küçük olduğunda devreye girdiğini belirtir — yani önce ne kadar çıkış hassasiyeti istediğinize karar verirsiniz, araç gerisini hesaplar.

---

## Pratikte Ne Yapmalı

Tasarım ya da inceleme sırasında bakılacak maddeler:

- **Genişliği hesapla, tahmin etme.** $B = b + N\log_2(RM)$. Bu genişlik her integratör ve her comb için geçerli, sadece çıkış için değil.
- **İç veri yolunda saturasyon yok.** Saturasyon, yuvarlama ve kırpma **yalnızca** son çıkış kademesinde yapılır. IP çekirdeği kullanıyorsanız iç saturasyon seçeneğinin kapalı olduğunu doğrulayın.
- **Sarmalamaya güvendiğini yaz.** Taşma kasıtlıdır; bunu belirtmeyen bir tasarım dokümanı, kod incelemesinde "düzeltilecek" bir kusur davet eder.
- **C'de unsigned akümülatör kullan.** Signed taşma tanımsız davranıştır; MISRA C:2012 Rule 1.3 kapsamındadır. `-fwrapv` bir yama olabilir ama taşınabilir değildir ve araç nitelendirmesi tarafında ek yük yaratır.
- **En kötü durumu DC ile test et.** Tam skala pozitif ve tam skala negatif sabit giriş, bit büyümesi sınırını zorlayan en basit vektörlerdir. Gürültülü sinüs testleri bu sınıra yaklaşmaz.
- **Bit-bit referans karşılaştırması yap.** Sınırsız tamsayı aritmetiğiyle yazılmış bir altın model, sabit genişlikli gerçeklemeyle birebir eşleşmeli. "Yakın" yeterli değildir; CIC'te doğru gerçekleme **tam** eşleşir.
- **Droop'u ayrı bir bütçe kalemi say.** Kademe sayısını alias bastırmasına göre seç, sarkmayı çıkış hızındaki kısa bir FIR ile düzelt.

---

## Açık Sorular ve İleri Okuma

Bu yazıda sabit $R$ varsaydım. Çalışma zamanında değişen desimasyon oranı, bit büyümesini en büyük $R$ değerine göre boyutlandırmayı gerektirir ve oran değiştiğinde registerların sıfırlanması gerekir — satıcı dokümanları bu konuda nettir ama literatürde geçiş anındaki transient davranış az işlenmiştir.

İkinci açık uç **sharpened CIC** yapılarıdır: filtrenin iki kopyasını polinom biçiminde birleştirerek droop'u kompanzasyon FIR'ı olmadan azaltan yaklaşımlar. Kaynak maliyetinin ne zaman kompanzasyon FIR'ından daha iyi olduğu, bana kalırsa hâlâ vaka bazında cevaplanıyor.

Üçüncüsü, pruning uygulanmış bir CIC'in gürültü analizini **ölçülmüş** biçimde doğrulamak. Hogenauer'in varyans tabanlı hata modeli giriş istatistiği hakkında varsayımlar yapar; dar bantlı bir girişte bu varsayımların ne kadar tuttuğunu merak ediyorum. Defterimde duruyor.

---

## Sonuç

CIC filtresi, "taşma kötüdür" sezgisinin yanlış olduğu nadir yerlerden biridir. Filtrenin doğruluğu, two's complement aritmetiğinin modüler yapısı üzerine kuruludur: veri yolu yalnızca toplama ve çıkarmadan oluştuğu için tüm hesap $2^{B}$ modunda korunur, ve gerçek çıkış $B$ bite sığdığı sürece ara taşmalar iz bırakmadan birbirini götürür.

Bu yüzden iki şey kritik: register genişliğini $b + N\log_2(RM)$ formülüyle hesaplamak, ve iç veri yolunda saturasyondan uzak durmak. Ölçtüğüm örnekte 40 bitlik registerlar zamanın dörtte birinde taştı ve çıkış yine de bit-bit doğruydu; aynı tasarıma saturasyon eklemek, doğru genişlikte bile çıkışı tam skaladan büyük bir hatayla bozdu.

C ile gerçekliyorsanız bir adım daha var: dilin modüler aritmetiği garanti ettiği tek yer unsigned tamsayılardır. Algoritmanın doğruluğu matematikten geliyor olabilir, ama kodun doğruluğu standardın size verdiği garantilerden gelir.

---

## Kaynaklar

- E. B. Hogenauer, "An Economical Class of Digital Filters for Decimation and Interpolation", *IEEE Transactions on Acoustics, Speech, and Signal Processing*, cilt ASSP-29, sayı 2, ss. 155–162, Nisan 1981. [IEEE Xplore](https://ieeexplore.ieee.org/document/1163535)
- Altera, *CIC IP Core User Guide*, UG-CIC, 15 Aralık 2014 — bit büyümesi, çıkış yuvarlama seçenekleri ve Hogenauer pruning bölümleri. [PDF](https://people.ece.cornell.edu/land/courses/ece5760/DE1_SOC/ug_cic.pdf)
- Intel/Altera, *CIC Intel FPGA IP User Guide* — güncel sürüm, Hogenauer pruning bölümü. [intel.com](https://www.intel.com/content/www/us/en/docs/programmable/683246/)
- AMD, *CIC Compiler v4.0 LogiCORE IP Product Guide* (PG140), 22 Temmuz 2026. [docs.amd.com](https://docs.amd.com/r/en-US/pg140-cic-compiler)
- R. Lyons, "Understanding cascaded integrator-comb filters", *Embedded.com*. [embedded.com](https://www.embedded.com/understanding-cascaded-integrator-comb-filters/)
- M. P. Donadio, "CIC Filter Introduction", 18 Temmuz 2000 — ücretsiz ve okunaklı bir giriş. [dsprelated.com](https://www.dsprelated.com/showabstract/9.php)
- MISRA C:2012 Rule 1.3 (Required), "There shall be no occurrence of undefined or critical unspecified behaviour" — kural metni ve gerekçesi. [MathWorks Polyspace](https://www.mathworks.com/help/bugfinder/ref/misrac2012rule1.3.html)
- MISRA C:2012 Rule 12.4 (Advisory) — unsigned sabit ifade wrap-around'u; bu yazıdaki konuyla karıştırılmaması için. [MathWorks Polyspace](https://www.mathworks.com/help/bugfinder/ref/misrac2012rule12.4.html)
- MathWorks, *CIC Compensation Decimator* — inverse-sinc kompanzasyon filtresi tasarımı. [mathworks.com](https://www.mathworks.com/help/dsp/ref/ciccompensationdecimator.html)

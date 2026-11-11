---
title: "32 Bitlik Akümülatör, 72 dBc'lik Spektrum: NCO'da Faz Kırpma Spurları"
subtitle: "Phase Truncation Spurs in an NCO: Deriving and Testing the −6.02·P Rule"
background: "/img/posts/2.webp"
date: '2026-08-31 14:00:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [sinyal-isleme, aviyonik]
---

FPGA'da bir NCO (numerically controlled oscillator) kurdunuz. Faz akümülatörünü 32 bit yaptınız, çünkü 100 MHz saat altında 0.023 Hz'lik frekans çözünürlüğü istiyordunuz. Sentez temiz geçti, simülasyon dalga formu kusursuz bir sinüs. Sonra çıkışın FFT'sini aldınız ve spektrumda taşıyıcının 72 dB altında, düzenli aralıklarla dizilmiş bir **spur ormanı** buldunuz. Akümülatör 32 bit; 32 × 6.02 = 192 dBc olmalıydı. Nereden çıktı bu 72?

Bu yazı o 72 sayısının nereden geldiğini anlatıyor. Ama "faz kırpma spurları vardır, seviyeleri yaklaşık −6.02·P dBc'dir" deyip geçmeyeceğiz — bu cümle Analog Devices'ın uygulama notlarından FPGA IP kılavuzlarına kadar her yerde yazıyor, hemen hiçbir yerde de türetilmiyor. Kuralı sıfırdan çıkaracağız, sonra 27 satırlık bir NumPy modeliyle 0.01 dB hassasiyetle doğrulayacağız. Yolda kuralın **yanlış** olduğu iki durum ve spurun spektrumda tam olarak nereye düşeceğini önceden söyleyen bir formül çıkacak.

---

## Neden Faz Kırpıyoruz?

Bir NCO'nun iskeleti üç parçadan ibarettir: her saat vuruşunda üzerine sabit bir **frekans ayar kelimesi** (FTW, frequency tuning word) eklenen bir akümülatör, akümülatörün değerini genliğe çeviren bir tablo ve bir DAC.

<div class="mermaid">
flowchart LR
  CLK[f_clk]
  FTW[FTW - M]
  ACC[N bit faz akümülatörü]
  TR[MSB kırpma - N bitten P bite]
  LUT[Faz-genlik tablosu - 2^P girdi x D bit]
  DAC[D bit DAC]
  OUT[Analog çıkış]
  FTW --> ACC
  CLK --> ACC
  ACC --> TR
  TR --> LUT
  LUT --> DAC
  DAC --> OUT
</div>

Akümülatör $N$ bit ise çıkış frekansı

$$ f_{\text{out}} = \frac{M}{2^{N}} \, f_{\text{clk}} $$

olur ve frekans çözünürlüğü $f_{\text{clk}}/2^{N}$'dir. 100 MHz saat ve $N = 32$ için bu 0.023 Hz demektir. Çözünürlük istiyorsanız akümülatörü büyütürsünüz; bu bedava sayılır, çünkü akümülatör sadece bir toplayıcı ve bir yazmaçtır.

Faz-genlik tablosu ise bedava değildir. Akümülatörün 32 bitinin tamamını tabloya adres olarak verseniz $2^{32}$ girdilik bir ROM gerekir — bir FPGA'nın tüm blok RAM'inin milyonlarca katı. Bu yüzden akümülatörün yalnızca **en anlamlı $P$ biti** tabloya gider, alttaki $W = N - P$ bit çöpe atılır. Tipik bir tasarımda $P$ 10 ile 16 arasındadır; çeyrek dalga simetrisiyle tablo dörtte birine iner, Sunderland ayrıştırması gibi tekniklerle daha da küçülür.

İşte tasarımın kalbindeki asimetri budur: **akümülatör genişliği $N$ frekans çözünürlüğünü belirler, faz kelimesi genişliği $P$ ise spektral saflığı belirler.** Bu ikisi birbirinden tamamen bağımsızdır ve "32 bit akümülatörüm var" cümlesi spektrum hakkında hiçbir şey söylemez. Baştaki 192 dBc beklentisinin hatası tam olarak buydu.

---

## Kırpma Hatasının Kapalı Formu

Kırpmanın ne yaptığını tam olarak yazalım. $n$'inci saat vuruşunda akümülatörün değeri

$$ \mathrm{acc}[n] = (M n) \bmod 2^{N} $$

ve ideal faz $\varphi[n] = \frac{2\pi}{2^{N}} \mathrm{acc}[n]$'dir. Tabloya giden kırpılmış faz ise en anlamlı $P$ bittir:

$$ \tilde{\varphi}[n] = \frac{2\pi}{2^{P}} \left\lfloor \frac{\mathrm{acc}[n]}{2^{W}} \right\rfloor $$

Aradaki fark, yani faz hatası:

$$ e[n] = \varphi[n] - \tilde{\varphi}[n] = \frac{2\pi}{2^{N}} \Big( \mathrm{acc}[n] - 2^{W} \big\lfloor \mathrm{acc}[n]/2^{W} \big\rfloor \Big) = \frac{2\pi}{2^{N}} \big( \mathrm{acc}[n] \bmod 2^{W} \big) $$

$2^{W}$, $2^{N}$'i tam böldüğü için $\mathrm{acc}[n] \bmod 2^{W} = (Mn) \bmod 2^{W}$ yazabiliriz. Yani:

$$ \boxed{\; e[n] = \frac{2\pi}{2^{N}} \, \big( M n \bmod 2^{W} \big) \;} $$

Bu ifade, yazının geri kalanının tamamını taşıyor. Üç şey söylüyor:

1. **Faz hatası yalnızca atılan bitlere bağlıdır.** FTW'nin üst bitlerinin hataya hiçbir katkısı yoktur.
2. **Hata rastgele değildir.** Modüler aritmetiğin ürettiği, tamamen deterministik bir testere dişi dizisidir. Deterministik ve periyodik bir hata, frekans düzleminde geniş bantlı gürültü değil, **ayrık çizgiler** — yani spur — üretir.
3. **Tepe değeri $2\pi(2^{W}-1)/2^{N} \approx 2\pi/2^{P}$'dir**, yani $P$ bitlik faz kelimesinin tam olarak bir LSB'si. Ne kadar büyük bir akümülatör kullanırsanız kullanın bu değişmez.

### Hata Ne Zaman Sıfır Olur?

$e[n]$ her $n$ için sıfırsa spur da yoktur. Bu, $M n \equiv 0 \pmod{2^{W}}$ koşuluna, yani $2^{W} \mid M$ olmasına denk gelir. Mühendislik diliyle: **FTW'nin en alttaki $W$ biti tamamen sıfırsa, atılan alanda hiç bilgi yok demektir ve faz kırpma hiçbir hata üretmez.** Bu bir yaklaşıklık değil, tam bir sonuçtur — böyle bir FTW'de spektrum, faz kırpma açısından mükemmel temizdir.

Genel durumda $\nu_2(M)$ ile $M$'nin sonundaki ikili sıfır sayısını gösterelim ve

$$ g = \gcd(M, 2^{W}) = 2^{\min(W,\,\nu_2(M))}, \qquad L = \frac{2^{W}}{g} $$

tanımlayalım. $M n \bmod 2^{W}$ dizisi $g$'nin katlarından oluşur ve **$L$ örnekte bir kendini tekrarlar**. $L = 1$ hâli yukarıdaki spursuz durumdur. $L$ ne kadar küçükse hata dizisi o kadar kısa periyotlu, spurlar o kadar seyrektir.

---

## Testere Dişinden Spur Seviyesine

Şimdi asıl soruya gelelim: bu faz hatası spektrumda ne kadar yüksek bir çizgi üretir?

$e[n] = \frac{2\pi g}{2^{N}} s[n]$ yazalım; burada $s[n] = (M/g)\,n \bmod L$ dizisi $\{0, 1, \dots, L-1\}$ değerlerini alır. $\gcd(M/g, L) = 1$ olduğundan $s[n]$, bir rampanın indislerinin karıştırılmış hâlidir — ama Fourier **genlikleri** karışmaz, yalnızca hangi frekansa düştükleri değişir (buna birazdan döneceğiz).

Bir periyotluk rampanın ($u = 0, 1, \dots, L-1$) $1/L$ ile normalize edilmiş ayrık Fourier katsayıları kapalı formda bilinir:

$$ \lvert c_j \rvert = \frac{1}{2 \sin(\pi j / L)} $$

$j = 0$ terimi dizinin ortalamasıdır; sabit bir faz kaymasından ibaret olduğu için spektrumda iz bırakmaz. Geriye kalanlar içinde temel bileşen $j = 1$ en büyüğüdür ve $j \ll L$ için katsayı kabaca $1/j$ ile düşer. Demek ki en büyük spuru temel bileşen üretecek. Onun tek taraflı sinüs genliği $2\lvert c_1 \rvert = 1/\sin(\pi/L)$, dolayısıyla faz sapmasının temel bileşeninin genliği:

$$ \beta_1 = \frac{2\pi g}{2^{N}} \cdot \frac{1}{\sin(\pi/L)} = \frac{2\pi}{2^{P}} \cdot \frac{1}{L \sin(\pi/L)} $$

(son adımda $g = 2^{W}/L$ ve $2^{W}/2^{N} = 2^{-P}$ kullanıldı).

Faz sapması küçük olduğu için dar bantlı faz modülasyonundayız: $\beta \ll 1$ iken taşıyıcının etrafında $\beta/2$ genliğinde bir çift yan bant belirir. Spurun taşıyıcıya oranı:

$$ \frac{A_{\text{spur}}}{A_{\text{c}}} = \frac{\beta_1}{2} = \frac{\pi}{2^{P} \, L \sin(\pi/L)} $$

$L$ büyükken $L\sin(\pi/L) \to \pi$ olur ve oran sadeleşerek $2^{-P}$'ye iner:

$$ \mathrm{SFDR} \;\longrightarrow\; -20\log_{10}\!\big(2^{-P}\big) = 6.0206 \cdot P \ \text{dBc} $$

İşte her yerde alıntılanan kural. Türetim onu bir "kural" olmaktan çıkarıp **büyük $L$ için geçerli bir asimptot** hâline getiriyor. Genel ifade ise şu:

$$ \boxed{\; \mathrm{SFDR} = 6.0206 \cdot P + 20\log_{10}\!\frac{L \sin(\pi/L)}{\pi} \ \text{dBc} \;} $$

Düzeltme terimi $L \ge 16$ için 0.06 dB'nin altında kalır — pratikte görünmez. Ama $L$ küçüldükçe büyür ve **işareti negatiftir**: kısa periyotlu hata dizileri asimptottan daha kötü spur üretir. En kötü hâl $L = 2$'dir:

$$ 20\log_{10}\frac{2 \sin(\pi/2)}{\pi} = 20\log_{10}\frac{2}{\pi} = -3.92 \ \text{dB} $$

Yani $-6.02P$ bir alt sınır değil; gerçek en kötü durum $6.02P - 3.92$ dBc'dir. $P = 12$ için 72.25 değil, **68.33 dBc**. Bu 3.92 dB'nin kaynağı $20\log_{10}(\pi/2)$'dir: tepe-tepe genliği $E$ olan bir testere dişinin tepe sapması $E/2$, temel harmoniğinin genliği ise $E/\pi$'dir. Yani "faz hatasının tepe değerinden" yürüyen kaba bir hesap 3.92 dB kötümser çıkar; $L$ büyükken doğru cevabı veren, tepe değil temel harmoniktir.

---

## Modeli Kurup Ölçelim

Türetim güzel de, doğru mu? Faz kırpmayı yalıtmak için genlik kuantalamasını devre dışı bırakan bir model kuralım: tablo yerine doğrudan `np.sin` çağıralım, böylece spektrumda görülen her şey **yalnızca** faz kırpmadan gelsin.

```python
import numpy as np
from math import pi, sin, log10

N, P = 32, 12          # akümülatör ve faz kelimesi genişliği
W    = N - P           # atılan bit sayısı
NS   = 1 << 20         # FFT uzunluğu

def nco(M, P, nsamp=NS, dither_bits=0, seed=20260831):
    """İdeal genlik çözünürlüklü NCO: sadece faz kırpma hatasını yalıtır."""
    n   = np.arange(nsamp, dtype=np.int64)
    acc = (M * n) % (1 << N)
    if dither_bits:
        rng = np.random.default_rng(seed)
        acc = (acc + rng.integers(0, 1 << dither_bits, nsamp)) % (1 << N)
    return np.sin(2*pi * (acc >> (N - P)) / (1 << P))

def v2(m):                      # sondaki ikili sıfır sayısı
    c = 0
    while m and m % 2 == 0: m //= 2; c += 1
    return c

def predict(M, P):
    """Teori: periyot L, birincil spur ofseti a/L, SFDR."""
    W = N - P
    g = 1 << min(W, v2(M)); L = (1 << W) // g
    if L == 1: return None                    # faz kırpma hatası yok
    return L, (M//g) % L, 6.0206*P + 20*log10(L*sin(pi/L)/pi)
```

Ölçüm tarafında bir incelik var: spurları $-120$ dBc civarında güvenle okuyabilmek için pencerenin yan loblarının spurlardan çok daha aşağıda olması gerekir. Dikdörtgen pencere ya da sıradan bir Hann bunu sağlamaz; 7 terimli Blackman-Harris'in yan lobları $-180$ dB civarındadır ve iş görür. Toplam gürültü gücünü hesaplarken de pencerenin **eşdeğer gürültü bant genişliğine** (ENBW, burada 2.632 bin) bölmek gerekir; bu düzeltme unutulursa gürültü tabanı sistematik olarak 4.2 dB kötü ölçülür.

$N = 32$, $P = 12$ ($W = 20$) için sonuçlar:

| FTW ($M$) | $\nu_2(M)$ | $L$ | SFDR tahmin | SFDR ölçüm | SNR ölçüm |
|---|---|---|---|---|---|
| 1641021440 = 1565·2²⁰ | 20 | 1 | spursuz | 324.51 dB | 308.17 dB |
| 1640677376 = 100139·2¹⁴ | 14 | 64 | 72.24 dB | **72.24 dB** | 67.08 dB |
| 524288 = 2¹⁹ | 19 | 2 | 68.32 dB | **68.32 dB** | 68.32 dB |
| 262144 = 2¹⁸ | 18 | 4 | 71.34 dB | **71.33 dB** | 67.36 dB |
| 1640531527 (tek) | 0 | 2²⁰ | 72.25 dB | **72.25 dB** | 66.78 dB |

Tahmin ile ölçüm 0.01 dB içinde örtüşüyor. İlk satır özellikle güzel: $\nu_2(M) = 20 = W$ olduğu için faz kırpma hatası **birebir sıfır** ve ölçülen 324 dB, kayan nokta aritmetiğinin gürültü tabanından başka bir şey değil. Üçüncü satır ise az önce türettiğimiz en kötü hâl: $L = 2$, ve spur asimptottan tam 3.92 dB yukarıda.

<figure>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 958 364" role="img" aria-label="Faz kırpma spurlarının spektrumu" style="width:100%;height:auto">
    <g fill="none" stroke="currentColor" stroke-opacity="0.25" stroke-width="1">
      <line x1="62" y1="18.0" x2="942" y2="18.0"/><line x1="62" y1="76.0" x2="942" y2="76.0"/><line x1="62" y1="134.0" x2="942" y2="134.0"/><line x1="62" y1="192.0" x2="942" y2="192.0"/><line x1="62" y1="250.0" x2="942" y2="250.0"/><line x1="62" y1="308.0" x2="942" y2="308.0"/>
    </g>
    <g fill="currentColor" font-size="12" font-family="system-ui,-apple-system,sans-serif">
      <text x="54" y="22.0" text-anchor="end">0</text><text x="54" y="80.0" text-anchor="end">-25</text><text x="54" y="138.0" text-anchor="end">-50</text><text x="54" y="196.0" text-anchor="end">-75</text><text x="54" y="254.0" text-anchor="end">-100</text><text x="54" y="312.0" text-anchor="end">-125</text>
      <text x="62" y="329" text-anchor="middle">0.0</text><text x="238" y="329" text-anchor="middle">0.1</text><text x="414" y="329" text-anchor="middle">0.2</text><text x="590" y="329" text-anchor="middle">0.3</text><text x="766" y="329" text-anchor="middle">0.4</text><text x="942" y="329" text-anchor="middle">0.5</text>
      <text x="502" y="351" text-anchor="middle">normalize frekans — f / f_clk</text>
      <text x="15" y="163" text-anchor="middle" transform="rotate(-90 15 163)">seviye — dBc</text>
    </g>
    <g fill="none" stroke="currentColor" stroke-opacity="0.5"><line x1="62" y1="18" x2="62" y2="308"/><line x1="62" y1="308" x2="942" y2="308"/></g>
    <line x1="62" y1="185.6" x2="942" y2="185.6" stroke="#d1495b" stroke-width="1" stroke-dasharray="6 4" stroke-opacity="0.85"/>
    <text x="70" y="179.6" fill="#d1495b" font-size="12" font-family="system-ui,-apple-system,sans-serif">−6.02 × P = −72.25 dBc</text>
    <g stroke="#d1495b" stroke-width="1.6">
      <line x1="74.3" y1="308" x2="74.3" y2="227.0"/><line x1="77.2" y1="308" x2="77.2" y2="232.9"/><line x1="101.8" y1="308" x2="101.8" y2="217.8"/><line x1="104.7" y1="308" x2="104.7" y2="237.2"/><line x1="129.3" y1="308" x2="129.3" y2="199.5"/><line x1="132.2" y1="308" x2="132.2" y2="240.3"/><line x1="156.8" y1="308" x2="156.8" y2="185.6"/><line x1="159.7" y1="308" x2="159.7" y2="242.6"/><line x1="184.3" y1="308" x2="184.3" y2="213.4"/><line x1="187.2" y1="308" x2="187.2" y2="244.3"/><line x1="211.8" y1="308" x2="211.8" y2="224.4"/><line x1="214.7" y1="308" x2="214.7" y2="245.5"/><line x1="239.3" y1="308" x2="239.3" y2="231.2"/><line x1="242.2" y1="308" x2="242.2" y2="246.1"/><line x1="266.8" y1="308" x2="266.8" y2="235.9"/><line x1="269.7" y1="308" x2="269.7" y2="246.4"/><line x1="294.3" y1="308" x2="294.3" y2="239.4"/><line x1="297.2" y1="308" x2="297.2" y2="246.1"/><line x1="321.8" y1="308" x2="321.8" y2="241.9"/><line x1="324.7" y1="308" x2="324.7" y2="245.5"/><line x1="349.3" y1="308" x2="349.3" y2="243.8"/><line x1="352.2" y1="308" x2="352.2" y2="244.3"/><line x1="376.8" y1="308" x2="376.8" y2="245.1"/><line x1="379.7" y1="308" x2="379.7" y2="242.6"/><line x1="404.3" y1="308" x2="404.3" y2="246.0"/><line x1="407.2" y1="308" x2="407.2" y2="240.3"/><line x1="431.8" y1="308" x2="431.8" y2="246.3"/><line x1="434.7" y1="308" x2="434.7" y2="237.2"/><line x1="459.3" y1="308" x2="459.3" y2="246.3"/><line x1="462.2" y1="308" x2="462.2" y2="232.9"/><line x1="486.8" y1="308" x2="486.8" y2="245.7"/><line x1="489.7" y1="308" x2="489.7" y2="227.0"/><line x1="514.3" y1="308" x2="514.3" y2="244.8"/><line x1="517.2" y1="308" x2="517.2" y2="217.8"/><line x1="541.8" y1="308" x2="541.8" y2="243.3"/><line x1="544.7" y1="308" x2="544.7" y2="199.6"/><line x1="569.3" y1="308" x2="569.3" y2="241.2"/><line x1="572.2" y1="308" x2="572.2" y2="185.6"/><line x1="596.8" y1="308" x2="596.8" y2="238.3"/><line x1="599.7" y1="308" x2="599.7" y2="213.4"/><line x1="624.3" y1="308" x2="624.3" y2="234.5"/><line x1="627.2" y1="308" x2="627.2" y2="224.4"/><line x1="651.8" y1="308" x2="651.8" y2="229.2"/><line x1="654.7" y1="308" x2="654.7" y2="231.2"/><line x1="679.3" y1="308" x2="679.3" y2="221.4"/><line x1="682.2" y1="308" x2="682.2" y2="235.9"/><line x1="706.8" y1="308" x2="706.8" y2="207.7"/><line x1="709.7" y1="308" x2="709.7" y2="239.4"/><line x1="734.3" y1="308" x2="734.3" y2="18.0"/><line x1="737.2" y1="308" x2="737.2" y2="241.9"/><line x1="761.8" y1="308" x2="761.8" y2="207.7"/><line x1="764.7" y1="308" x2="764.7" y2="243.8"/><line x1="789.3" y1="308" x2="789.3" y2="221.4"/><line x1="792.2" y1="308" x2="792.2" y2="245.1"/><line x1="816.8" y1="308" x2="816.8" y2="229.2"/><line x1="819.7" y1="308" x2="819.7" y2="246.0"/><line x1="844.3" y1="308" x2="844.3" y2="234.5"/><line x1="847.2" y1="308" x2="847.2" y2="246.3"/><line x1="871.8" y1="308" x2="871.8" y2="238.3"/><line x1="874.7" y1="308" x2="874.7" y2="246.3"/><line x1="899.3" y1="308" x2="899.3" y2="241.2"/><line x1="902.2" y1="308" x2="902.2" y2="245.7"/><line x1="926.8" y1="308" x2="926.8" y2="243.3"/><line x1="929.7" y1="308" x2="929.7" y2="244.8"/>
    </g>
    <g stroke="#2a7fb8" stroke-width="2.2">
      <line x1="734.5" y1="308" x2="734.5" y2="18.0"/>
    </g>
    <g stroke-width="3" stroke-linecap="round"><line x1="300" y1="38" x2="328" y2="38" stroke="#d1495b"/><line x1="300" y1="58" x2="328" y2="58" stroke="#2a7fb8"/></g>
    <g fill="currentColor" font-size="12.5" font-family="system-ui,-apple-system,sans-serif"><text x="336" y="42">FTW = 100139 × 2¹⁴ — taşıyıcı + 63 spur</text><text x="336" y="62">FTW = 1565 × 2²⁰ — yalnızca taşıyıcı</text></g>
  </svg>
  <figcaption><strong>Şekil 1.</strong> Aynı çıkış frekansı (0.382 f_clk), iki farklı FTW; ölçülen spektrumun tepe noktaları. Kırmızı: alttaki 14 biti sıfır olan FTW — $L = 64$, teorinin öngördüğü 63 ayrık spur frekansının tamamı ölçümde de çıkıyor. En büyük iki spur 0.0539 ve 0.2899'da, yani $a/L = 43/64$ ofsetinin tam olarak beklendiği yerde, ve kesikli çizgideki −72.25 dBc sınırına değiyor. Mavi: alttaki 20 bitin tamamı sıfır — faz kırpma hatası birebir sıfır, taşıyıcıdan başka hiçbir şey yok.</figcaption>
</figure>

$P$'yi taradığımızda kuralın ölçekleme davranışı da doğrulanıyor:

| $P$ | $L$ | FFT | 6.02·P | SFDR ölçüm | 6.02·P − 5.17 | SNR ölçüm |
|---|---|---|---|---|---|---|
| 8 | 2²⁴ | 2²⁴ | 48.16 dB | 48.13 dB | 42.99 dB | 42.84 dB |
| 10 | 2²² | 2²² | 60.21 dB | 60.20 dB | 55.04 dB | 54.67 dB |
| 12 | 2²⁰ | 2²⁰ | 72.25 dB | 72.25 dB | 67.08 dB | 66.78 dB |
| 14 | 2¹⁸ | 2²⁰ | 84.29 dB | 84.29 dB | 79.12 dB | 78.82 dB |
| 16 | 2¹⁶ | 2²⁰ | 96.33 dB | 96.33 dB | 91.16 dB | 90.86 dB |
| 18 | 2¹⁴ | 2²⁰ | 108.37 dB | 108.37 dB | 103.20 dB | 102.90 dB |
| 20 | 2¹² | 2²⁰ | 120.41 dB | 120.41 dB | 115.24 dB | 114.94 dB |

Tablodaki FTW her satırda aynı: altın orandan türetilmiş tek bir sayı. Eşleşme 0.03 dB içinde.

FFT sütunu burada süs değil. İlk denememde bütün satırları 2²⁰ uzunlukta ölçmüştüm ve $P = 8$ ile $P = 10$ satırları 0.2–0.4 dB sapma veriyordu; üstelik sapma FTW'den FTW'ye değişiyordu. Sebebi fizik değil, ölçüm çözünürlüğüydü: bu iki satırda hata dizisinin periyodu ($L = 2^{24}$ ve $2^{22}$) FFT penceresinden uzun. Pencere periyodun tamamını görmediğinde tek tek spurlar ayrışamıyor, komşu spurların pencere etekleri birincil spurun üstüne biniyor ve tepe olduğundan güçlü okunuyor. **FFT uzunluğunu $L$'ye eşit ya da ondan büyük seçtiğinizde** sapma her FTW için 0.03 dB'ye iniyor. Faz kırpma spuru ölçen herkesin bileceği bir şey: $L$'yi önce hesaplayın, FFT'yi ona göre seçin.

Sağdaki iki sütun ikinci bir sonucu doğruluyor. Faz hatasını $[0, \Delta)$ aralığında düzgün dağılmış kabul edersek ($\Delta = 2\pi/2^{P}$), varyansı $\Delta^2/12$ olur; küçük açı yaklaşımıyla çıkıştaki hata gücü $\Delta^2/24$, sinyal gücü $1/2$'dir. Buradan

$$ \mathrm{SNR} = \frac{12}{\Delta^{2}} = \frac{3 \cdot 2^{2P}}{\pi^{2}} \quad\Longrightarrow\quad \mathrm{SNR_{dB}} = 6.0206 \cdot P - 5.17 $$

çıkar ve ölçümle 0.3 dB içinde uyuşur. Dikkat edin: bu **gürültü** değil, ayrık spurlara dağılmış deterministik hata gücüdür. önceki tablodaki $L = 2$ satırında SNR ile SFDR'nin aynı çıkması (her ikisi de 68.32) tam olarak bunun ifadesi: tek bir spur çifti hatanın tamamını taşıyor.

---

## Spur Nereye Düşüyor?

Seviyeyi bulduk. Peki spur spektrumun **neresinde**? Bu, pratikte seviyeden bile önemli olabilir — ara frekans planlaması yaparken spurun geçiş bandına mı yoksa filtrenin durdurma bandına mı düşeceğini bilmek istersiniz.

$s[n] = a \cdot n \bmod L$ dizisine geri dönelim ($a = M/g$). Rampanın indislerini $a$ ile çarpmak, DFT'de katsayıları yerinden oynatır: $u = an \bmod L$ değişken değiştirmesiyle

$$ S[m] = \sum_{n} \mathrm{rampa}(an \bmod L)\, e^{-j2\pi mn/L} = \mathrm{Rampa}\big[m \, a^{-1} \bmod L\big] $$

elde edilir. Rampanın en büyük katsayısı $j = 1$'de olduğuna göre, $S[m]$'in en büyük olduğu $m$ değeri $m a^{-1} \equiv 1$, yani $m \equiv a \pmod L$ koşulunu sağlar. Sonuç sade: **birincil spur, taşıyıcıdan $\frac{a}{L} f_{\text{clk}}$ kadar uzakta, her iki yanda birer tane olmak üzere durur** ($a = (M/g) \bmod L$). Nyquist bandının dışına taşarsa katlanır.

Ölçelim:

| FTW | $f_{\text{out}}/f_{\text{clk}}$ | $a$ | $a/L$ | tahmin $f_-$ | tahmin $f_+$ | ölçülen tepe |
|---|---|---|---|---|---|---|
| 100139·2¹⁴ | 0.382000 | 43 | 0.671875 | 0.289875 | 0.053875 | **0.289875** |
| 34603073 | 0.008057 | 65 | 0.000062 | 0.007995 | 0.008119 | **0.007995** |
| 1640531527 | 0.381966 | 558663 | 0.532783 | 0.150817 | 0.085251 | **0.150817** |
| 424242424 | 0.098777 | 77215 | 0.589104 | 0.490327 | 0.312120 | **0.490327** |
| 262144 | 0.000061 | 1 | 0.250000 | 0.249939 | 0.250061 | **0.249939** |

Beş durumda da ölçülen tepe, tahmin edilen frekansa bin çözünürlüğünde oturuyor.

İkinci satır pratikte en sinsi olanı. $M = 34603073$ için $a = 65$, yani ofset $6.2 \times 10^{-5} f_{\text{clk}}$. 100 MHz saatte bu **taşıyıcıdan sadece 6.2 kHz uzakta** bir spur demektir. Seviyesi diğerleriyle aynı, −72.25 dBc. Ama spektrum analizöründe 100 kHz çözünürlük bant genişliğiyle bakıyorsanız onu ayrı bir çizgi olarak asla göremezsiniz; taşıyıcının eteğine karışır ve **faz gürültüsü gibi görünür**. Aynı tasarımda FTW'yi biraz değiştirdiğinizde ($a = 558663$) aynı spur 53 MHz uzağa gider ve apaçık bir çizgi hâline gelir. Tasarım değişmedi, tek değişen frekans komutu.

Bu, "spektrumu ölçtük, temiz çıktı" cümlesine neden temkinli yaklaşmak gerektiğini gösteriyor: faz kırpma spurlarının seviyesi FTW'den bağımsızdır, ama **konumu tamamen FTW'ye bağlıdır**. Tek bir frekansta yapılan ölçüm hiçbir şey kanıtlamaz.

---

## Kuralın Aşıldığı İkinci Durum: Harmonik Çakışması

$L = 2$ hâlini gördük. İkinci bir istisna daha var ve daha az bilinir.

Testere dişinin yalnızca temel bileşeni yok; $j = 2, 3, \dots$ harmonikleri de var ve bunlar taşıyıcı etrafında $\pm j \cdot \frac{a}{L} f_{\text{clk}}$ ofsetlerinde yan bantlar üretiyor. $a/L$ basit bir rasyonel sayıya yaklaştığında bu yan bantlar **birbirinin üstüne düşer** ve koherent olarak toplanır.

$M = 2796203$ örneğinde $a/L = 0.666667 \approx 2/3$. Öngörülen spur konumlarına bakalım:

```text
harmonik 1 (genlik ~1/1): yan bantlar 0.332682 / 0.333984
harmonik 2 (genlik ~1/2): yan bantlar 0.333985 / 0.332683
harmonik 3 (genlik ~1/3): yan bantlar 0.000652 / 0.000650

ölçülen en büyük 3 spur:
  f=0.333984 @ -70.38 dBc
  f=0.332683 @ -70.60 dBc
  f=0.332682 @ -71.25 dBc
```

Birinci harmoniğin alt yan bandı (0.333984) ile ikinci harmoniğin üst yan bandı (0.333985) aynı frekansa düşüyor. Toplandıklarında spur −72.25 dBc yerine **−70.38 dBc** oluyor; asimptotik kural 1.87 dB aşılıyor. Karşılaştırma için, $a/L$'nin basit bir kesire yakın olmadığı $M = 1234567$ durumunda harmonikler ayrı ayrı frekanslara düşüyor ve en büyük spur tam olarak −72.25 dBc'de kalıyor.

Pratik sonuç: $-6.02P$ dBc'yi bir garanti gibi kullanmayın. Gerçek en kötü durum $6.02P - 3.92$ dBc'dir ve $a/L$'nin küçük paydalı bir kesire düştüğü frekanslarda ara değerler görürsünüz. Nicholas ve Samueli'nin 1987 tarihli çalışması bu spektrumun tamamını sayı-teorik yöntemlerle kapalı formda veriyor; buradaki türetim onun yalnızca baskın terimini yeniden üretiyor.

---

## Dither: Spuru Gürültüye Çevirmek

Spurları bastırmanın klasik yolu, akümülatör çıkışına atılan bit alanı genişliğinde rastgele bir sayı eklemektir. Amaç hatayı yok etmek değil — **periyodikliğini kırmak**. Periyodikliğini kaybeden hata artık ayrık çizgiler yerine geniş bantlı gürültü üretir.

Buradaki kritik detay şu: dither, atılan **$W$ bitin tamamını** kapsamalıdır. Ölçüm:

| FTW | $L$ | dither | SFDR | SNR |
|---|---|---|---|---|
| 524288 | 2 | yok | 68.32 dBc | 68.32 dB |
| 524288 | 2 | 18 bit | 68.32 dBc | 68.32 dB |
| 524288 | 2 | **20 bit** | **107.44 dBc** | 65.32 dB |
| 1640531527 | 2²⁰ | yok | 72.25 dBc | 66.78 dB |
| 1640531527 | 2²⁰ | 18 bit | 73.15 dBc | 66.52 dB |
| 1640531527 | 2²⁰ | **20 bit** | **105.58 dBc** | 63.77 dB |

İkinci satır öğretici: $W = 20$ iken 18 bitlik dither $M = 524288$ için **hiçbir şey yapmıyor** — SFDR de SNR de tam olarak dithersiz hâliyle aynı. Sebebi aritmetik: bu FTW'de akümülatörün alt 20 biti ya 0 ya da $2^{19}$'dur, ve $2^{19} + (2^{18}-1) < 2^{20}$ olduğundan 18 bitlik bir gürültü hiçbir zaman 20. bite taşıma üretemez. Faz kelimesine giden bitler hiç değişmez, çıkış birebir aynı kalır. Dither yeterince geniş değilse tam olarak sıfır fayda sağlar; "biraz dither" diye bir şey yoktur.

Tam genişlikte dither ile takas nettir: en kötü durumda 39 dB SFDR kazanmak için 3 dB SNR ödüyorsunuz. Hata gücü korunuyor, sadece tek bir çizgiden tüm banda yayılıyor. Bu takas, alıcının önündeki filtre spuru zaten atacaksa kötü; spur geçiş bandına düşüyorsa mükemmel bir anlaşma. AMD/Xilinx'in DDS Compiler çekirdeğinde dither seçeneği için yaklaşık 12 dB'lik ek SFDR belirtilir — buradaki 39 dB'den düşük olması beklenen bir şey, çünkü ticari çekirdekler gürültü tabanını fazla yükseltmemek için daha ölçülü bir dither uygular. Alternatif yol, hatayı rastgeleleştirmek yerine **düzeltmektir**. Taylor serisi düzeltmesi, atılan bitleri çöpe atmak yerine tablodan okunan genliği birinci dereceden düzeltmekte kullanır; böylece kırpma hatasının büyük kısmı geri kazanılır. Sunderland ayrıştırması ise farklı bir eksende çalışır: aynı $P$ için gereken ROM'u küçülterek daha geniş bir faz kelimesini uygun maliyetli hâle getirir.

---

## Pratik Çıkarımlar

**Faz kelimesi genişliğini spesifikasyondan geriye doğru seçin.** İhtiyacınız 80 dBc SFDR ise $P \ge \lceil (80 + 3.92)/6.02 \rceil = 14$ bit. Akümülatör genişliğini ise frekans çözünürlüğü belirler; ikisini karıştırmayın. Ticari IP'lerde bu ayrım parametre isimlerine her zaman doğrudan yansımaz — AMD'nin DDS Compiler çekirdeğinde faz genişliği ile hedef SFDR ayrı ayrı verilir ve iç faz kırpma genişliğini araç hedef SFDR'ye göre boyutlandırır. Ne istediğinizi siz söylemezseniz varsayılan değer karar verir.

**FFT'yi hata periyoduna göre boyutlandırın.** Spuru ölçerken pencere uzunluğu $L$'den kısaysa komşu spurlar ayrışmaz ve tepe 0.2–0.4 dB fazla okunur — üstelik hata FTW'ye göre değiştiği için tutarsız görünür. Önce $L = 2^{W - \min(W,\,\nu_2(M))}$ hesaplayın, FFT'yi en az o kadar uzun seçin. Pencere de önemli: 7 terimli Blackman-Harris gibi yan lobları ölçmek istediğiniz spurun çok altında kalan bir pencere kullanın.

**Tek frekansta yapılan spektrum ölçümü kanıt değildir.** Spur seviyesi FTW'den bağımsız, konumu FTW'ye bağlıdır. Test vektörlerinize en azından şunları koyun: $\nu_2(M) = W - 1$ olan bir FTW (en kötü seviye, $6.02P - 3.92$), $a$'nın çok küçük olduğu bir FTW (taşıyıcının dibinde spur), ve $a/L$'nin $1/2$, $1/3$, $2/3$ gibi basit kesirlere yakın olduğu FTW'ler (harmonik çakışması).

**Frekans planı yapabiliyorsanız yapın.** Kanal frekanslarını FTW'nin alt bitleri sıfır olacak şekilde seçebiliyorsanız faz kırpma hatası birebir sıfırlanır. Bu her zaman mümkün değildir, ama sabit sayıda kanalla çalışan bir sistemde şaşırtıcı derecede sık mümkündür ve bedava 30-40 dB getirir.

**Faz gürültüsü gibi görünen şey spur olabilir.** Taşıyıcının 1-10 kHz yakınında beklenmedik bir etek görüyorsanız, FTW'nin $a = (M/g) \bmod L$ değerini hesaplayın. Ofset $\frac{a}{L} f_{\text{clk}}$ o etekle uyuşuyorsa aradığınız şey osilatörünüzün faz gürültüsü değil, kendi NCO'nuzun kırpma spurudur — ve çözümü tamamen farklıdır.

**Bu modelin kapsamadıkları.** Burada genlik kuantalamasını bilerek devre dışı bıraktık. Gerçek bir sistemde $D$ bitlik tablo/DAC kuantalaması ayrı bir mekanizmadır ($\mathrm{SNR} \approx 6.02D + 1.76$ dB), DAC'ın integral doğrusalsızlığı harmonikler üretir, saat jitteri ise taban gürültüsünü yükseltir. Ölçtüğünüz spektrumda bu dört mekanizma üst üste biner; hangisiyle uğraştığınızı ayırt etmenin en hızlı yolu, FTW'yi $\nu_2(M) \ge W$ olacak şekilde değiştirip faz kırpma katkısını tamamen kapatmaktır. Spurlar kaybolmuyorsa sorun başka yerdedir.

---

## Açık Sorular

Türetimde faz hatasını küçük kabul edip birinci dereceden yaklaşım kullandık. SFDR tarafında bu yaklaşım $P \ge 8$ için 0.03 dB'ye kadar tutuyor. Ama SNR tahmini bütün $P$ değerlerinde ölçümün 0.15–0.37 dB üstünde kalıyor ve bu fark $P$ ile ölçeklenmiyor — sabit bir katsayı gibi davranıyor. Kaynağının ne olduğu (hata dizisinin düzgün dağılım varsayımından sapması mı, taşıyıcı çevresinde dışladığımız koruma bandı mı) elimdeki ölçümlerle ayırt edilemedi. Ayrıca harmonik çakışmasının katkısını, çakışan bileşenlerin göreli fazını hesaba katarak kapalı formda vermedik — Nicholas ve Samueli'nin sayı-teorik çözümü bunu içeriyor ama ilişkiyi sezgisel bir tasarım kuralına indirgemek ayrı bir çalışma konusu. Son olarak buradaki bütün analiz sabit bir FTW için; frekansı süpüren ya da modüle eden bir NCO'da hata dizisi periyodikliğini kendiliğinden kaybeder ve spurlar doğal olarak yayılır. Bu "bedava dither" etkisinin ne kadar işe yaradığı, süpürme hızına bağlı ve ölçülmeyi hak ediyor.

---

## Kaynaklar

- [H. T. Nicholas III, H. Samueli — "An Analysis of the Output Spectrum of Direct Digital Frequency Synthesizers in the Presence of Phase-Accumulator Truncation", 41st Annual Frequency Control Symposium, 1987, ss. 495–502](https://www.semanticscholar.org/paper/An-Analysis-of-the-Output-Spectrum-of-Direct-in-the-Nicholas-Samueli/6566d5e90e8390aa2270e43256c4433136774bb4) — faz kırpma spektrumunun sayı-teorik tam çözümü
- [Analog Devices AN-1396 — "How to Predict the Frequency and Magnitude of the Primary Phase Truncation Spur in the Output Spectrum of a DDS"](https://www.analog.com/en/resources/app-notes/an-1396.html)
- [Analog Devices MT-085 — "Fundamentals of Direct Digital Synthesis (DDS)"](https://www.analog.com/media/en/training-seminars/tutorials/MT-085.pdf)
- [Analog Devices DDS Teknik Eğitimi, Bölüm 4 — "The Effect of DAC Resolution on Spurious Performance"](https://www.analog.com/media/en/training-seminars/design-handbooks/Technical-Tutorial-DDS/Section4.pdf)
- [Analog Devices DDS Teknik Eğitimi, Bölüm 11 — "Improving SFDR with Phase Dithering"](https://www.analog.com/media/en/training-seminars/design-handbooks/Technical-Tutorial-DDS/Section11.pdf)
- [AMD/Xilinx PG141 — DDS Compiler v6.0 LogiCORE IP Product Guide](https://www.xilinx.com/content/dam/xilinx/support/documents/ip_documentation/dds_compiler/v6_0/pg141-dds-compiler.pdf)
- [All About Circuits — "Basics of Phase Truncation in Direct Digital Synthesizers"](https://www.allaboutcircuits.com/technical-articles/basics-of-phase-truncation-in-direct-digital-synthesizers/)
- [John Gentile — "Numerically Controlled Oscillator (NCO) and Direct Digital Synthesis (DDS)"](https://john-gentile.com/kb/dsp/NCO_DDS.html)

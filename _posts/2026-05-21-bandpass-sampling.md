---
title: "Bandpass Sampling: 1 GHz Sinyali 50 MHz Saatle Örneklemek"
subtitle: "Bandpass Sampling: How to Digitize a 1 GHz Signal with a 50 MHz Clock"
background: "/img/posts/2.webp"
date: '2026-05-21 09:00:00'
layout: post
lang: tr
mermaid: true
---

Mühendislik mülakatlarında klasik bir soru vardır: *"1090 MHz'deki ADS-B sinyalini sayısal olarak yakalamak istiyorsun. Hangi hızda ADC kullanırsın?"*

Nyquist–Shannon teoremini hatırlayan herkes refleksle cevaplar: *"En az 2.18 GSPS."* Mantıklı görünür: en yüksek frekansın iki katı. Cevap teknik olarak yanlış olmasa da, gerçek hayatta hiçbir ADS-B alıcısı 2 GSPS'lik bir ADC ile çalışmaz. Tipik bir donanım, 1090 MHz'in komşuluğundaki **2 MHz** civarındaki dar bandı 50 MSPS hatta daha yavaş saatlerle örnekler — ve hiçbir şey kaybolmaz.

Burada işin sırrı **bandpass sampling** (veya *IF sampling*, *undersampling*) denilen, klasik örnekleme teoreminin az bilinen kuzenidir. Bu yazıda teoremin geometrisine, izinli/yasak örnekleme oranlarının nasıl ortaya çıktığına, spektral ters çevrilme tuzağına ve modern ADC'lerin neden GHz mertebesinde analog bant genişliği ilan ettiğine inip somut bir Python örneğiyle her şeyi yerine oturtacağız.

<figure>
  <img src="/img/posts/bandpass-sampling-signal.webp" alt="70 MHz IF bandpass sinyali ve 31.25 MSPS örnekleme noktaları" class="img-fluid rounded">
  <figcaption><strong>Şekil 1.</strong> 70 MHz IF sinyali (67.5 + 72.5 MHz iki ton, mavi) ve 31.25 MSPS örnekleme noktaları (kırmızı). Örnekler arasındaki boşluk T = 32 ns; sinyalin kendi periyodu ise yaklaşık 14 ns — klasik Nyquist açısından yetersiz ama bandpass sampling açısından mükemmel.</figcaption>
</figure>

---

## Nyquist'in Saklı Varsayımı

Genel anlamıyla Nyquist–Shannon teoremi şunu söyler: bir sinyalin **en yüksek frekans bileşeninin** en az iki katı hızla örneklersen, bilgiyi kaybetmeden geri çevirebilirsin. Bu formülasyondaki gizli varsayım, sinyalin **baseband** (taban bant) olduğudur — yani spektrumun `[0, f_max]` aralığında yaşadığını kabul eder.

Oysa modern bir RF alıcısının önündeki sinyaller hiç de böyle değildir. Bir VHF havacılık telsizi `[118, 137]` MHz aralığında çalışır; ADS-B 1090 MHz civarında birkaç megahertz'lik bir bantta yaşar; GPS L1 1575.42 MHz taşıyıcısının etrafında C/A kodu için yaklaşık ±1 MHz, P(Y) kodu içinse ±10 MHz mertebesinde bir spektruma sahiptir. Bu sinyallerin ortak özelliği **dar bantlı** olmalarıdır: f_H − f_L değeri f_c değerine kıyasla çok küçüktür. Spektrumun büyük bölümü zaten boş.

Eğer boş alanı saymayı bırakırsak — ki kimse 0 ile f_L arasındaki sessizliği örneklemek için ADC çevirmiyor — gerçek bilgi yükümüz sadece `B = f_H − f_L` kadardır. Information-theoretic alt sınır da bu: f_s ≥ 2B yeterli **olmalı**. Tek soru, *hangi* 2B'nin (ya da 3B'nin, 5B'nin) işe yarayacağıdır.

---

## Bandpass Sampling Teoremi

Resmi formülasyonu 1991'de Vaughan, Scott ve White, IEEE Transactions on Signal Processing'de yayınladığı **"The Theory of Bandpass Sampling"** makalesinde verdi (cilt 39, sayı 9, ss. 1973–1984). Teorem şunu söyler:

Spektrumu `[f_L, f_H]` aralığında yaşayan, B = f_H − f_L bant genişliğine sahip bir bandpass sinyali, aşağıdaki eşitsizliği sağlayan herhangi bir f_s ile birinci-derece tek-tip örnekleme (uniform first-order sampling) altında geri çevrilebilir biçimde sayısallaştırılabilir:

$$
\frac{2 f_H}{n} \le f_s \le \frac{2 f_L}{n - 1}
$$

burada `n`, `1 ≤ n ≤ ⌊f_H / B⌋` aralığında bir tamsayıdır.

`n = 1` aldığımızda eşitsizliğin sağ tarafı tanımsızdır (bölü sıfır); bu, klasik Nyquist durumudur: f_s ≥ 2·f_H. Daha büyük n değerleri, daha düşük örnekleme hızlarına izin verir — **ama tüm aralıklar değil**, sadece belirli aralıklar.

Burada `n`, sinyalin sonuçta yerleşeceği **Nyquist bölgesinin** indeksidir. Nyquist bölgesi `n`: `[(n−1)·f_s/2, n·f_s/2]` aralığını kapsar. Sinyalin tamamı tek bir Nyquist bölgesinin **içine** sığmak zorundadır — bir bölgenin sınırına denk gelirse iki komşu bölgeden alias'lar birbiriyle çakışır ve veri umutsuzca bozulur.

---

## Sayısal Bir Örnek: 70 MHz IF, 10 MHz Bant

Klasik bir ara frekans (intermediate frequency, IF) seçimini düşünelim: f_c = 70 MHz, B = 10 MHz, dolayısıyla f_L = 65 MHz, f_H = 75 MHz.

Bu durumda izin verilen n değerleri `1 ≤ n ≤ ⌊75 / 10⌋ = 7` aralığındadır. Her n için izinli aralık şudur:

| n | f_s_min = 2·f_H / n | f_s_max = 2·f_L / (n−1) | Aralık genişliği | Yerleşeceği bölge |
|---|---|---|---|---|
| 1 | 150 MSPS   | ∞ (üst sınır yok) | — | klasik Nyquist |
| 2 | 75 MSPS    | 130 MSPS   | 55 MSPS   | zone 2 (ters) |
| 3 | 50 MSPS    | 65 MSPS    | 15 MSPS   | zone 3 (düz) |
| 4 | 37.5 MSPS  | 43.33 MSPS | 5.83 MSPS | zone 4 (ters) |
| 5 | 30 MSPS    | 32.5 MSPS  | 2.5 MSPS  | zone 5 (düz) |
| 6 | 25 MSPS    | 26 MSPS    | 1 MSPS    | zone 6 (ters) |
| 7 | 21.43 MSPS | 21.67 MSPS | 0.24 MSPS | zone 7 (düz) |

Üç şey hemen göze çarpıyor:

1. **Yasak bölgeler vardır.** Örneğin 43 MSPS ile 50 MSPS arasında *hiçbir* n çalışmaz. Bu aralıkta sinyal mutlaka iki komşu Nyquist bölgesi arasındaki sınırı keser ve alias'lar çakışır.
2. **n büyüdükçe izinli aralık daralır.** n = 7'de pencere yalnızca 240 kHz genişliktedir. Saat kaynağınızın drift'i, anti-alias filtresinin roll-off bölgesi, sıcaklık değişimi — hepsi bu dar yarığa sığmak zorundadır. Pratikte n = 7 ile bir tasarım yapmak intihardır.
3. **Tek tek hıza inerken bir kazanım var.** 75 MSPS yerine 31 MSPS'de çalışan bir ADC seçmek, hem güç tüketimini hem dijital arka uçtaki örnek hızını yarıdan fazla düşürür. Cortex-M tabanlı bir alıcıda bu ciddi bir mimari kazançtır.

İyi bir tasarımcı aralığın **ortasında** durur. n = 3 için 50–65 MSPS aralığının ortası ~57 MSPS'dir; saatte 5 MSPS sapsa bile hâlâ izinli bölgenin içindedir.

---

## Wedge Diyagramı: Geometriye Bakmak

Bu yasak ve izinli bölgeler bir grafiğe dökülünce ortaya **wedge** (kama) diyagramı çıkar. X ekseninde normalize merkez frekansı `f_c / B`, Y ekseninde normalize örnekleme hızı `f_s / B` vardır.

İzinli bölgeler, her biri bir n değerine karşılık gelen, üçgen şeklinde "kamalar"dır. Kamaların ortak özelliği:

- **Üst kenarı** f_s = 2·f_L / (n − 1) doğrusudur.
- **Alt kenarı** f_s = 2·f_H / n doğrusudur.
- **Sol ucu** noktada (kamanın tepesi) f_s = 2·B'dir — teorik alt sınır.

Yasak bölgeler, kamalar arasındaki üçgen "boşluklar"dır ve geometrik olarak 2B'nin tamsayı katlarında biriker. Bu yüzden "f_s'i 2B'ye çok yakın seçme" sezgisi vardır: tepe noktasının yakınında çalışan bir tasarım için saat drift'inin minik bir parçası dahi sistemi yasak bölgeye sürüklemeye yeter.

Yine de wedge diyagramı sadece bir gözlem aracıdır. Saha tasarımının değişmez kuralı şudur: **bir kamanın iç noktasında dur, kenardan uzak kal.** Vaughan'ın 1991 makalesi bu hassasiyet analizini ayrı bir bölümle ele alır.

<figure>
  <img src="/img/posts/bandpass-sampling-zones.webp" alt="70 MHz IF için izinli ve yasak örnekleme hızları" class="img-fluid rounded">
  <figcaption><strong>Şekil 2.</strong> 70 MHz IF (65–75 MHz bant) için izinli (mavi/mor) ve yasak (kırmızı) örnekleme hızları. Mavi bölgeler n tek → spektrum düz; mor bölgeler n çift → spektrum ters. Kırmızı aralar hiçbir n için çalışmaz. Dikey çizgiler: n = 5 için kullanılan 31.25 MSPS (lacivert) ve n = 3 için ideal orta nokta ~57.5 MSPS (teal). Teorik alt sınır 2B = 20 MSPS noktalı çizgiyle gösterilmiş.</figcaption>
</figure>

---

## Spectral Inversion: Çift n Hayatınızı Berbat Eder

Bandpass sampling'in en sinsi tuzağı **spektral inversiyon**dur. Sinyalin Nyquist bölgesinin parite'sine bağlı olarak baseband'e indiğinde **ters çevrilmiş** olabilir.

Lyons'un *Understanding Digital Signal Processing* kitabındaki konvansiyonu kullanırsak:

- **n tek** → spektrum yukarı doğru ("upright"), orijinaliyle aynı yönde.
- **n çift** → spektrum **ters çevrilmiş** (mirror about f_s/4 in zone 1).

Hızlı bir mental doğrulama: f_s = 10 Hz, gerçek sinyalin 11.5 ila 12.5 Hz aralığında bir spektrumu olsun. Zone 3'e (n = 3, tek) düşer. Alias: |12 − 1·10| = 2 Hz. 12.5 → 2.5, 11.5 → 1.5 — alt-üst sıralama korunur. Üst kenar yine üstte.

Şimdi gerçek sinyali 7.5 ila 8.5 Hz arasına koyalım — zone 2 (n = 2, çift). Alias: 8.5 → 1.5, 7.5 → 2.5. Üst kenar artık altta. Ters çevrilmiş.

Bu, simetrik modülasyonlarda (DSB, gerçek değerli BPSK gibi) görünmez bir hatadır — spektrum simetrik olduğu için ters de aynı görünür. Ama **single sideband (SSB), asimetrik PSK, ya da Doppler işareti taşıyan FM** sinyallerinde alıcının demodülatörü tam tersine çalışır. Bandpass sampling tasarımlarında klasik bir bug kaynağıdır ve genelde "neden konuşma anlaşılır ama yön bilgisi tersine" gibi anlamsız belirtilerle kendini gösterir.

Düzeltmesi basit: örnekleri `(−1)^k` ile çarpmak ya da downconversion sonrası I/Q kanallarından birinin işaretini çevirmek yeter. Önemli olan, hangi rejimde olduğunuzu *bilmektir*.

---

## ADC'de Önemli Olan f_s Değil, Analog Bant Genişliğidir

Bandpass sampling'in pratik mühendisliği burada başlar. Bir ADC'yi 50 MSPS'de örnekleyip 1090 MHz'lik bir sinyal yakalamak istiyorsanız, **ADC'nin analog girişi 1090 MHz'i geçirebilmek zorundadır.**

İşte tam burası, Nyquist'i ezbere bilen mühendislerin tökezlediği yerdir. Çoğu kişi ADC datasheet'ine baktığında "100 MSPS" gibi sayısal hıza odaklanır ve **analog input bandwidth** (veya *full-power input bandwidth*) satırını kaçırır. Halbuki bandpass sampling'in fizibilitesi tamamen o satırla belirlenir.

Üç somut örnek üzerinden bakalım:

| ADC | Çözünürlük | Örnekleme | Analog BW | Notlar |
|---|---|---|---|---|
| Analog Devices **AD9265** | 16-bit | 125 MSPS | **650 MHz** | Datasheet açıkça "IF sampling up to 300 MHz" diyor |
| Texas Instruments **ADS5474** | 14-bit | 400 MSPS | **1.4 GHz** | 400 MHz üzerindeki sinyaller için pazarlanıyor |
| Linear Technology **LTC2208** | 16-bit | 130 MSPS | **700 MHz** | 70 fs RMS aperture jitter, undersampling için satılıyor |

Bu cihazların ilan ettikleri "Nyquist hızlarının çok üstündeki analog bant genişliği" tesadüf değildir — bandpass sampling pazarı için **kasıtlı olarak** öyle tasarlanmışlardır. Sample-and-hold devresinin RC zaman sabiti, takip kapasitansı, switch açma süresi: hepsi yüzlerce megahertz hatta gigahertz ölçeğinde sinyalin "doğru" anda yakalanmasına izin verecek şekilde optimize edilmiştir.

Bir tasarım kuralı olarak: **f_H < analog BW / 2** koşulu sağlanmadan o ADC bandpass sampling'e uygun değildir. Spec edge'inde çalışmak istemezsiniz.

---

## Sınırı Belirleyen Aslında Jitter

ADC analog bant genişliği yeterli olsa bile, yüksek IF'te sinyali sınırlandıran başka bir parametre ortaya çıkar: **saat jitter'ı**, yani aperture jitter. Tipik formülü şudur:

$$
\text{SNR}_{\text{jitter}} = -20 \log_{10}(2\pi \cdot f_{\text{in}} \cdot \sigma_t)
$$

Burada f_in **analog giriş** frekansıdır (örnekleme hızı değil!) ve σ_t saat kaynağının RMS jitter değeridir. Formülde gizli olan korkutucu gerçek şudur: SNR, sinyal frekansıyla doğrudan azalır. Baseband'de problem değil olan jitter, 1 GHz IF'te uygulamayı imkânsız hale getirebilir.

Somut bir hesap: σ_t = 100 fs (modern bir VCXO için iyi bir değer), f_in = 1 GHz:

$$
\text{SNR} = -20 \log_{10}(2\pi \cdot 10^9 \cdot 10^{-13}) \approx 64 \text{ dB}
$$

64 dB SNR, etkin bit sayısı (ENOB) cinsinden yaklaşık 10.3 bit'e karşılık gelir. Yani 16-bit'lik LTC2208'i 1 GHz'de örneklerseniz, bitlerinizin **3 ila 5 tanesini saat kaynağına kurban etmiş** olursunuz. ADC'nin ilan ettiği 78 dB SNR'ı görmek için çok daha düşük IF'te kalmanız ya da çok daha temiz bir saat (örneğin 10 fs sınıfı bir SAW veya kristal osilatör) kullanmanız gerekir.

Bu yüzden bandpass sampling tasarımlarında saat kaynağı, alıcının LO'su kadar — bazen daha fazla — özen ister. Phase noise spektrumunun, sinyal yakınında −150 dBc/Hz'in altına inebilmesi tipik bir hedeftir.

---

## Anti-Alias Filtresi Artık Bir Bandpass

Klasik baseband örneklemede anti-alias filtresi bir **alçak geçirendir** (lowpass): f_s/2 üzerindeki her şeyi keser. Bandpass sampling'de ise işin doğası değişir: hedeflediğiniz tek Nyquist bölgesinden **başka her şey** alias olur ve bandın içine düşer.

Yani filtre artık şunu yapmak zorundadır:

- `[f_L, f_H]` arasını geçirmek
- Diğer **tüm** Nyquist bölgelerine düşen sinyali ve gürültüyü bastırmak — özellikle DC'den f_L'e kadar olan geniş bant ve f_H'in üstündeki ADC analog BW'sine kadar olan bant.

Bunu sağlamak ciddi bir RF filtre tasarımı işidir. SAW (Surface Acoustic Wave) filtreleri, cavity filtreleri ya da seramik filtreler kullanılır. Pasif L-C ile yapmak istediğinizde, gereken yan-bant bastırma seviyesi (60–80 dB) ve dar bant (B/f_c = 1% civarı) yüksek-Q kapasitörler ve hassas frekans cevabı ister.

İkinci ve daha önemli nokta: filtre sinyali geçirirken bantlardaki **gürültüyü de geçirir**. Bandpass sampling'de gürültü integration aralığı `f_s/2` ile sınırlı değildir — ADC'nin analog BW'sine kadardır. Yani filtreyi geçen 600 MHz'lik geniş bir bant gürültüsü, sinyalle birlikte zone 1'e alias'lanır. Bu, Vaughan'ın 1991 makalesinin önemli bir sonucudur ve sıklıkla göz ardı edilir.

---

## Python ile Sayısal Doğrulama

Teori güzel, ama her zaman dediğim gibi *gözlerinizle görmediğiniz hiçbir şeye güvenmeyin.* Aşağıdaki Python kodu 70 MHz IF'teki 10 MHz bant genişlikli bir sinyali üretir, n = 5 için izinli olan 31.25 MSPS'de örnekler ve sonucun zone 1'de doğru yere düştüğünü gösterir.

```python
import numpy as np
import matplotlib.pyplot as plt

# Sinyal parametreleri
f_c    = 70e6        # taşıyıcı (IF merkezi)
B      = 10e6        # bant genişliği
T      = 100e-6      # toplam süre
f_high = 1.0e9       # "sürekli zaman" benzetimi için yüksek hızda örnekleme
t_high = np.arange(0, T, 1/f_high)

# Bandpass sinyali: basitlik için f_c ± B/4 konumunda iki ton
x_high = (np.cos(2*np.pi*(f_c - B/4)*t_high)
        + np.cos(2*np.pi*(f_c + B/4)*t_high))

# Bandpass sampling: f_s = 31.25 MSPS, n = 5 (izinli aralık [30, 32.5])
step = 32                       # 1.0e9 / 32 = 31.25 MSPS
f_s  = f_high / step
x_bp = x_high[::step]

# FFT
N    = len(x_bp)
X    = np.fft.fft(x_bp)
freq = np.fft.fftfreq(N, d=1/f_s)
mag  = 20*np.log10(np.abs(X) + 1e-12)

# n = 5 tek → upright; kayma miktarı (n-1)/2 · f_s = 2·f_s
shift = (5 - 1) / 2 * f_s
print("Beklenen alias tonları (MHz):",
      sorted([(f - shift) / 1e6 for f in (f_c - B/4, f_c + B/4)]))

pos = freq >= 0
peaks = freq[pos][np.argsort(mag[pos])[-2:]]
print("Ölçülen alias tonları (MHz):", sorted(peaks / 1e6))

plt.plot(freq[pos] / 1e6, mag[pos])
plt.xlabel("Frekans (MHz)"); plt.ylabel("Genlik (dB)")
plt.title(f"f_s = {f_s/1e6:.2f} MSPS, n = 5 — zone 1 alias'ı")
plt.grid(); plt.show()
```

Çalıştırınca pozitif yarıda **5 MHz ve 10 MHz** civarında iki keskin tepe görmelisiniz. Hesap doğrudan modulodur: n = 5 için kayma miktarı `(n−1)/2 · f_s = 2 · 31.25 = 62.5 MHz`; alt ton 67.5 − 62.5 = 5 MHz'e, üst ton 72.5 − 62.5 = 10 MHz'e iner. n tek olduğu için spektrum upright kalır, yani alt-üst sıra korunur.

<figure>
  <img src="/img/posts/bandpass-sampling-fft.webp" alt="Orijinal analog spektrum ve örneklenmiş alias spektrumu karşılaştırması" class="img-fluid rounded">
  <figcaption><strong>Şekil 3.</strong> <em>Sol:</em> 70 MHz IF sinyalinin orijinal analog spektrumu — tonlar 67.5 MHz ve 72.5 MHz'de. <em>Sağ:</em> 31.25 MSPS örnekleme sonrası zone 1'deki alias spektrumu — aynı tonlar 5 MHz ve 10 MHz'e inmiş, spektrum düz (n = 5 tek). Bilgi kayıpsız: tonlar arasındaki frekans farkı (5 MHz) ve göreli konumları korunuyor.</figcaption>
</figure>

Şimdi denemeye değer bir alıştırma: `step = 30` yapın — bu, f_s = 33.33 MSPS demektir ve n = 5 için izinli aralığın (32.5 MSPS) dışındadır. Sinyalin alt kenarı zone 4'e, üst kenarı zone 5'e düşer; baseband'e farklı parite ile aliase oldukları için zone 1'deki spektrum bozulur ve iki tonun konumu artık `f − shift` formülüyle doğru çıkmaz. Yasak bölgenin gözlemlenebilir kanıtı budur.

---

## Etkileşimli Simülatör

Aşağıdaki araçla f<sub>c</sub>, B ve f<sub>s</sub> değerlerini değiştirerek alias konumunu ve izinli/yasak bölge sınırlarını anlık görebilirsiniz.

<div class="card my-3" id="bps-demo">
  <div class="card-header py-2"><strong>Bandpass Sampling Simülatörü</strong></div>
  <div class="card-body">
    <div class="form-row mb-2">
      <div class="col-md-4 mb-2">
        <label class="mb-0 small">f<sub>c</sub> (IF merkezi) = <b id="v-fc">70</b> MHz</label>
        <input type="range" class="custom-range" id="sl-fc" min="10" max="400" value="70" step="1">
      </div>
      <div class="col-md-4 mb-2">
        <label class="mb-0 small">B (bant genişliği) = <b id="v-bw">10</b> MHz</label>
        <input type="range" class="custom-range" id="sl-bw" min="1" max="80" value="10" step="1">
      </div>
      <div class="col-md-4 mb-2">
        <label class="mb-0 small">f<sub>s</sub> (örnekleme) = <b id="v-fs">31.25</b> MSPS</label>
        <input type="range" class="custom-range" id="sl-fs" min="5" max="300" value="31.25" step="0.25">
      </div>
    </div>
    <div id="bps-status" class="px-2 py-1 mb-2 rounded small" style="font-family:monospace;min-height:2.2em;"></div>
    <canvas id="bps-canvas" style="width:100%;display:block;border-radius:4px;border:1px solid #dee2e6;"></canvas>
    <p class="text-muted small mt-1 mb-0">Sol: analog spektrum. Sağ: örneklenmiş zone-1 alias'ı. Yasak bölgede iki farklı zone'dan alias çakışır.</p>
  </div>
</div>

<script>
(function(){
  var el = {
    fc:document.getElementById('sl-fc'), bw:document.getElementById('sl-bw'), fs:document.getElementById('sl-fs'),
    vfc:document.getElementById('v-fc'), vbw:document.getElementById('v-bw'), vfs:document.getElementById('v-fs'),
    st:document.getElementById('bps-status'), cv:document.getElementById('bps-canvas')
  };
  var ctx = el.cv.getContext('2d');

  function rnd(v,d){ var p=Math.pow(10,d==null?2:d); return Math.round(v*p)/p; }

  function findZone(fL,fH,fs){
    var maxN=Math.floor(fH/(fH-fL));
    for(var n=1;n<=maxN;n++){
      var lo=2*fH/n, hi=n===1?1e9:2*fL/(n-1);
      if(fs>=lo-0.002&&fs<=hi+0.002) return n;
    }
    return null;
  }

  function aliasOf(f,fs,n){
    return n%2===1 ? f-(n-1)/2*fs : n/2*fs-f;
  }

  function update(){
    var fc=+el.fc.value, bw=+el.bw.value, fs=+el.fs.value;
    if(bw>=fc){bw=Math.max(1,fc-1);el.bw.value=bw;}
    var fL=fc-bw/2, fH=fc+bw/2;
    el.vfc.textContent=rnd(fc); el.vbw.textContent=rnd(bw); el.vfs.textContent=rnd(fs);

    var n=findZone(fL,fH,fs);
    var inv=n!==null&&n%2===0;
    var aL=null,aH=null;
    if(n!==null){
      aL=Math.min(aliasOf(fL,fs,n),aliasOf(fH,fs,n));
      aH=Math.max(aliasOf(fL,fs,n),aliasOf(fH,fs,n));
    }
    if(n){
      el.st.style.background='#d4edda';el.st.style.color='#155724';
      el.st.innerHTML='İZİNLİ &nbsp; n = '+n+(inv?' (<b>çift → ters spektrum</b>)':' (tek → düz spektrum)')+
        ' &nbsp;|&nbsp; Alias bandı: ['+rnd(aL)+', '+rnd(aH)+'] MHz';
    } else {
      el.st.style.background='#f8d7da';el.st.style.color='#721c24';
      el.st.innerHTML='YASAK BÖLGE &mdash; sinyal iki Nyquist zone sınırını aşıyor; alias\'lar çakışıyor';
    }
    paint(fL,fH,fs,n,aL,aH,inv);
  }

  function paint(fL,fH,fs,n,aL,aH,inv){
    var W=el.cv.parentElement.clientWidth-40, H=170;
    var dpr=window.devicePixelRatio||1;
    el.cv.width=W*dpr; el.cv.height=H*dpr;
    el.cv.style.width=W+'px'; el.cv.style.height=H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);

    var PT=30,PB=30,PL=8,MID=18;
    var pw=(W-PL*2-MID)/2, ph=H-PT-PB;
    var x1=PL, x2=PL+pw+MID;

    ctx.clearRect(0,0,W,H);
    ctx.font='11px system-ui,sans-serif';

    function panel(x0,fMin,fMax,bL,bH,title,col,extra){
      var f2x=function(f){return x0+(f-fMin)/(fMax-fMin)*pw;};
      ctx.fillStyle='#f8f9fa'; ctx.fillRect(x0,PT,pw,ph);

      /* Nyquist zone stripes on alias panel */
      if(extra&&extra.zones){
        for(var zi=1;zi<=extra.zones;zi++){
          var zx1=f2x((zi-1)*fs/2), zx2=f2x(zi*fs/2);
          ctx.fillStyle=zi%2===1?'rgba(200,230,255,0.18)':'rgba(220,200,255,0.18)';
          var rx=Math.max(x0,zx1),rw=Math.min(x0+pw,zx2)-rx;
          if(rw>0) ctx.fillRect(rx,PT,rw,ph);
        }
        ctx.strokeStyle='#c0c8d8'; ctx.lineWidth=0.5;
        for(var zi=1;zi<extra.zones;zi++){
          var bndx=f2x(zi*fs/2);
          if(bndx>x0&&bndx<x0+pw){
            ctx.setLineDash([3,3]);
            ctx.beginPath();ctx.moveTo(bndx,PT);ctx.lineTo(bndx,PT+ph);ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }

      /* signal band fill */
      if(bL!==null&&bH!==null){
        var bx1=Math.max(x0,f2x(bL)), bx2=Math.min(x0+pw,f2x(bH));
        if(bx2>bx1){
          ctx.fillStyle=col+'28'; ctx.fillRect(bx1,PT,bx2-bx1,ph);
          ctx.fillStyle=col+'aa'; ctx.fillRect(bx1,PT+ph-4,bx2-bx1,4);
          /* band edge lines */
          ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.setLineDash([]);
          [bx1,bx2].forEach(function(bx){
            ctx.beginPath();ctx.moveTo(bx,PT);ctx.lineTo(bx,PT+ph);ctx.stroke();
          });
          /* band label */
          ctx.fillStyle=col; ctx.textAlign='center'; ctx.font='10px system-ui,sans-serif';
          ctx.fillText(rnd(bL)+'–'+rnd(bH)+' MHz',(bx1+bx2)/2,PT+13);
          ctx.font='11px system-ui,sans-serif';
        }
      }

      /* border */
      ctx.strokeStyle='#dee2e6'; ctx.lineWidth=1; ctx.setLineDash([]);
      ctx.strokeRect(x0,PT,pw,ph);

      /* baseline */
      ctx.strokeStyle='#999'; ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(x0,PT+ph);ctx.lineTo(x0+pw,PT+ph);ctx.stroke();

      /* ticks */
      var nt=5;
      for(var i=0;i<=nt;i++){
        var tf=fMin+(fMax-fMin)*i/nt, tx=f2x(tf);
        ctx.strokeStyle='#ccc'; ctx.lineWidth=0.5;
        ctx.beginPath();ctx.moveTo(tx,PT);ctx.lineTo(tx,PT+ph+4);ctx.stroke();
        ctx.fillStyle='#777'; ctx.textAlign='center';
        ctx.fillText(rnd(tf,1),tx,PT+ph+14);
      }
      ctx.fillStyle='#888'; ctx.textAlign='center';
      ctx.fillText('MHz',x0+pw/2,H-4);

      /* title */
      ctx.fillStyle='#333'; ctx.textAlign='center';
      ctx.font='bold 11px system-ui,sans-serif';
      ctx.fillText(title,x0+pw/2,PT-10);
      ctx.font='11px system-ui,sans-serif';

      if(extra&&extra.inv){
        ctx.fillStyle='#6a1b9a'; ctx.textAlign='right'; ctx.font='10px system-ui,sans-serif';
        ctx.fillText('↔ ters spektrum',x0+pw-4,PT+ph-6);
        ctx.font='11px system-ui,sans-serif';
      }
    }

    /* forbidden panel */
    function forbidPanel(x0){
      ctx.fillStyle='#fff5f5'; ctx.fillRect(x0,PT,pw,ph);
      ctx.strokeStyle='#dee2e6'; ctx.lineWidth=1; ctx.strokeRect(x0,PT,pw,ph);
      ctx.fillStyle='#dc354588'; ctx.fillRect(x0,PT,pw,ph);
      ctx.fillStyle='#721c24'; ctx.textAlign='center';
      ctx.font='bold 12px system-ui,sans-serif';
      ctx.fillText('Alias çakışması',x0+pw/2,PT+ph/2+5);
      ctx.fillStyle='#333'; ctx.font='bold 11px system-ui,sans-serif';
      ctx.fillText('Yasak bölge',x0+pw/2,PT-10);
      ctx.font='11px system-ui,sans-serif';
    }

    var analogMax=Math.max(fH*1.55, fH+20);
    panel(x1,0,analogMax,fL,fH,'Analog spektrum','#1565c0',null);

    if(n!==null){
      var maxZone=Math.ceil(analogMax/(fs/2));
      panel(x2,0,fs/2,aL,aH,'Zone 1 alias (n = '+n+')',inv?'#6a1b9a':'#2e7d32',{zones:1,inv:inv});
    } else {
      forbidPanel(x2);
    }

    /* arrow */
    ctx.fillStyle='#555'; ctx.textAlign='center'; ctx.font='15px system-ui,sans-serif';
    ctx.fillText('→',x1+pw+MID/2,PT+ph/2+6);
    ctx.font='9px system-ui,sans-serif'; ctx.fillStyle='#888';
    ctx.fillText('f_s='+rnd(fs),x1+pw+MID/2,PT+ph/2+18);
  }

  [el.fc,el.bw,el.fs].forEach(function(s){s.addEventListener('input',update);});
  window.addEventListener('resize',update);
  update();
})();
</script>

---

## Mühendislik Notları ve Pratik Tuzaklar

Bandpass sampling'i sahaya çıkarmadan önce kontrol listesi:

1. **Önce f_H'i, sonra f_s'i seç.** Sinyal yüksek bandının ADC'nin analog input BW'sinin yarısını aşmaması ilk koşuldur. Bunu hesaplamadan datasheet'in MSPS satırına bakmak hatalıdır.
2. **Wedge'in tepe noktasından kaç.** Pratik bir kural: izinli aralığın ortasına denk gelen n'i seç. Eğer ortası çok dar bir kamaya düşüyorsa daha küçük n'e geç.
3. **Saatin phase noise'unu RF mühendisliği gibi düşün.** σ_t = 1 ps'lik bir saat, baseband alıcısında lüks; 1 GHz IF'te facia.
4. **Anti-alias filtresini erken seç.** SAW filtresinin sipariş süresi haftalar olabilir. Sistem mimarisinde yeri belirlenmeden FPGA yazılımına geçmek riskli.
5. **Spektral inversiyonu cebine yaz.** n çift kullanıyorsan downstream demodülatörün önüne `(-1)^k` veya I/Q swap ekle. Test günü "neden tersine konuşuyor?" diye paniklemekten daha ucuza geliyor.
6. **Gürültü figürünü unutma.** Filtreyi geçen out-of-band gürültü doğrudan baseband'e iner. Aktif önyükselticinin gürültü figürü, geniş analog BW'de etkin gürültüye dönüşür.
7. **Sıcaklık üzerinden saat drift'ini düşün.** −40 °C'de farklı bir TCXO frekansı, izinli kamadan çıkmana neden olabilir. Tasarım marjı somut olarak hesaplanmalı.

---

## Bandpass Sampling Nerede Kullanılır?

Modern alıcı mimarilerinin büyük kısmı hâlâ analog ön-karıştırıcı (mixer) ile bandı önce baseband'e ya da düşük IF'e indirir, sonra örnekler. Bunun nedeni hem analog BW yeterli ADC'lerin pahalı olması, hem de saat phase noise'unun maliyetli yönetimi.

Ama doğrudan-IF veya doğrudan-RF örnekleme yapan tasarımlar son 10 yılda hızla yayıldı:

- **AMD/Xilinx Zynq UltraScale+ RFSoC** (ZCU111, ZCU216 değerlendirme kartları) — yongaya entegre GSPS-sınıf doğrudan RF örnekleme ADC ve DAC blokları, FPGA fabric'i içinde sert IP olarak dijital downconverter/upconverter. Birkaç GHz'e ulaşan analog girişlerle, klasik mixer + IF + ADC zincirini tek yonga ile değiştirme amacı taşır.
- **Ettus USRP X410** — Zynq RFSoC tabanlı, kanal başına 400 MHz anlık bant genişliği veren doğrudan RF örnekleme platformu.
- **Yazılım tanımlı askeri telsizler** ve doğrudan-IF örnekleme yapan üst-uç ölçüm cihazları (modern spektrum analizörleri, vektör sinyal analizörleri).

Buna karşılık **PlutoSDR**, **RTL-SDR** gibi popüler hobi/laboratuvar SDR'ler bandpass sampling kullanmaz — bunların hepsinde analog quadrature downconversion yapan tuner yongaları (AD9363, R820T2 vb.) vardır. ADC görece düşük IF'te (RTL-SDR için ~3.57 MHz) çalışır. Bandpass sampling görüldüğü kadar bedava değildir; ödediği bedel, saat ve filtre alt sisteminin yüksek karmaşıklığıdır.

---

## Sonuç

Nyquist–Shannon teoremi temel bir doğrudur, ama **"en yüksek frekansın iki katı"** ezberi onu bir nevi karikatürleştirir. Sinyalin baseband değil dar-bantlı olduğu durumda, gerçek alt sınır bilgi yüküdür: f_s ≥ 2B. Bandpass sampling, bu alt sınıra hangi sayısal hilelerle nasıl yaklaşacağımızı söyler.

Pratikte bandpass sampling'i benimseyen tasarımlarda kritik karar üç sayıyla özetlenir: hangi n, hangi ADC analog BW, hangi saat jitter'ı. Bu üç sayıyı doğru yere koyarsanız, gerçekten **1 GHz'lik sinyali 50 MHz saatle örneklemek** mümkündür — ve sahada her gün çalışır. Yanlış yere koyarsanız sistem ya hiç çalışmaz ya da bazen, anlayamadığınız zamanlarda kendi kendine gizemli biçimde bozulur. RF mühendisliğinde her iki son da görülmüştür.

Sonraki yazı için iyi bir devam konusu: bandpass sampling'in çıktısı zone 1'e indikten sonra **dijital downconversion (DDC)** ile I/Q ayrımı nasıl yapılır, ve neden "f_s/4 trick" denilen küçük sihir hem CIC filtresinden hem de NCO'dan tasarruf sağlar. Bu defterimde duruyor.

---

**Kaynaklar:**

- R. G. Vaughan, N. L. Scott, D. R. White — ["The Theory of Bandpass Sampling"](https://doi.org/10.1109/78.134430), IEEE Transactions on Signal Processing, Vol. 39, No. 9, Sept. 1991, pp. 1973–1984.
- Richard G. Lyons — *Understanding Digital Signal Processing* (3rd ed., Pearson, 2010), Bölüm 2: "Sampling Bandpass Signals" ve "Spectral Inversion in Bandpass Sampling".
- Walt Kester (Analog Devices) — [MT-007 Tutorial, "Aperture Time, Aperture Jitter, Aperture Delay Time — Removing the Confusion"](https://www.analog.com/media/en/training-seminars/tutorials/MT-007.pdf).
- Walt Kester (ed.) — [*Analog-Digital Conversion*](https://www.analog.com/en/education/education-library/data-conversion-handbook.html), Analog Devices Education Library, 2004.
- Analog Devices — [AD9265 datasheet (16-bit, 125 MSPS, 650 MHz analog BW)](https://www.analog.com/en/products/ad9265.html).
- Texas Instruments — [ADS5474 datasheet (14-bit, 400 MSPS, 1.4 GHz analog BW)](https://www.ti.com/product/ADS5474).
- Analog Devices — [LTC2208 datasheet (16-bit, 130 MSPS, 700 MHz analog BW, 70 fs aperture jitter)](https://www.analog.com/en/products/ltc2208.html).
- AMD/Xilinx — [Zynq UltraScale+ RFSoC ürün sayfası ve veri sayfaları](https://www.amd.com/en/products/adaptive-socs-and-fpgas/soc/zynq-ultrascale-plus-rfsoc.html).

---
title: "I/Q Örnekleme ve Analitik Sinyal: İki Kanal, Karmaşık Değerler ve Negatif Frekansın Sırrı"
subtitle: "I/Q Sampling and the Analytic Signal: Why Two Channels, Complex Values, and Negative Frequencies"
background: "/img/posts/3.webp"
date: '2026-07-28 07:30:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [sinyal-isleme, aviyonik, rf, sdr]
---

Bir SDR kartı açıp içine baktığınızda tuhaf bir şeyle karşılaşırsınız: alıcı, RF girişinden **iki** hattı ADC'ye götürür. Datasheet'te birine `I`, diğerine `Q` denir. Yazılım tarafında `numpy` `dtype=complex64` bir dizi görürsünüz; her örnek gerçek ve sanal iki kayan noktalı sayıdan oluşur. Klasik "sinyal bir gerçel sayı akışıdır" refleksi burada bozulur.

Bu tercih tesadüf değil, temizlik de değil; sinyal işlemede kâr-zarar analizinden çıkmış bir mühendislik kararıdır. I/Q örnekleme yapıldığında bant genişliği başına düşen örnek sayısı yarıya iner, spektrumun negatif tarafı **iş yapar hâle** gelir, direct-conversion (zero-IF) alıcı topolojisi mümkün olur — ama bu kolaylığın bir bedeli vardır: iki kanal arasında birkaç yüzde birlik genlik ya da birkaç derecelik faz uyumsuzluğu, alıcının **image rejection** yeteneğini onlarca desibel aşağı çeker. Bu yazıda önce karmaşık sinyalin ne olduğunu, ardından I/Q örneklemenin gerçel örneklemeden neden yarı hızda kurtulduğunu, sonunda da mühendislik dünyasında bu şıklığın bedelini ölçen **image rejection ratio (IRR)** formülünü türetip somut sayılara oturtacağım.

---

## Nyquist'ten Kaynaklı Bir Rahatsızlık

Klasik Nyquist–Shannon teoremi `f_s ≥ 2·f_max` der. Baseband bir sinyalin spektrumu `[-B/2, +B/2]` aralığında yaşıyorsa `f_max = B/2`, dolayısıyla gerçel örnekleme için alt sınır `f_s ≥ B` çıkar. Buraya kadar tanıdık.

Fakat gerçel `x(t)` sinyalinin Fourier dönüşümü daima **konjuge simetrik**tir: `X(-f) = X*(f)`. Bu, negatif frekans bileşenlerinin pozitif olanlardan bağımsız yeni bilgi taşımadığı anlamına gelir; onlar sadece "gerçel oldum" belgesidir. Bunu görebiliyorsak — ki analog dünyada göremiyoruz, çünkü ADC gerçel örnek verir — negatif tarafı atmak ve pozitif tarafı yarı hızda örneklemek istememek için hiçbir teknik neden yok.

İşte I/Q örneklemenin bir cümlelik iddiası budur: *örneği karmaşık değerli hâle getirirsek, negatif frekans bilgisi bağımsız hâle gelir; aynı gerçel bant genişliği için gereken **karmaşık** örnekleme hızı yarıya iner ve spektrumun tamamı "iş yapan" bilgiye dönüşür.*

---

## Karmaşık Sinyal Neyi Anlatır?

Karmaşık değerli bir zaman serisini çok yerde görürsünüz ama tanımı çoğu Türkçe kaynakta gizli kalır. Şöyle net olalım: gerçel bir `x(t)` sinyaline karşılık gelen **analitik sinyal**

$$
x_a(t) = x(t) + j\, \hat{x}(t)
$$

biçiminde tanımlanır; burada `x̂(t)`, `x(t)` sinyalinin **Hilbert dönüşümü**dür. Hilbert dönüşümü, spektrumda pozitif frekans bileşenlerine −90°, negatif frekans bileşenlerine +90° faz kayması uygulayan bir all-pass filtredir. Sonuç şudur:

$$
X_a(f) =
\begin{cases}
2\,X(f), & f > 0 \\
X(0), & f = 0 \\
0, & f < 0
\end{cases}
$$

Yani analitik sinyalin spektrumu **tek yanlıdır**: negatif frekans bileşenleri sıfırlanmıştır. Gerçel dünyada bir alıcının önündeki gerçel RF sinyalini bilgisayara analitik hâlde alabilirsek — ki I/Q örnekleme tam olarak bunu yaptığını iddia eder — bandwidth başına örnek maliyetimizi yarıya indirmiş oluruz.

Analitik sinyalin modülü `|x_a(t)|`, sinyalin **anlık zarfını (envelope)** verir; argümanı `arg(x_a(t))`, **anlık fazını** ve türeviyle anlık frekansını verir. AM/FM demodülasyonun matematiği bu iki büyüklüğün çekilmesinden ibarettir; analog "envelope detector"'ün dijital karşılığı budur. Bu bir kolaylık değil, gerçel sinyalde tanımlanması sallantılı olan "anlık frekans" kavramına net bir matematiksel anlam veren yapısal bir şeydir.

---

## I/Q Örnekleme Mühendislik Olarak Nasıl Yapılır?

Teoride Hilbert dönüşümü sonsuz uzunluklu bir FIR filtre gerektirir; pratikte kimse RF alıcısında bunu böyle uygulamaz. Onun yerine analog karmaşayı ustaca kullanan bir topoloji kurulur:

<div class="mermaid">
graph LR
    A[Anten x_RF] --> B[LNA]
    B --> C[Mixer I]
    B --> D[Mixer Q]
    E[LO cos] --> C
    F[LO -sin] --> D
    C --> G[LPF I]
    D --> H[LPF Q]
    G --> I[ADC I]
    H --> J[ADC Q]
    I --> K[x_a n = I n + j Q n]
    J --> K
</div>

Gelen RF sinyali `x_RF(t) = A(t)·cos(2π·f_c·t + φ(t))` biçimindedir. İki mixer'a paralel olarak `cos(2π·f_c·t)` ve `-sin(2π·f_c·t)` — birbirinin 90° fazlı kuzenleri — verilir. Çarpım sonucunda mixer çıkışı iki tona ayrılır: taşıyıcının **etrafındaki** baseband bileşen ve `2·f_c` civarında yüksek frekans bileşen. LPF ikincisini süpürür; geriye

$$
I(t) = \tfrac{1}{2} A(t) \cos(\varphi(t)), \qquad
Q(t) = \tfrac{1}{2} A(t) \sin(\varphi(t))
$$

kalır. Bu iki hattı ADC'lerle örnekleyip `x_a[n] = I[n] + j·Q[n]` kompleks dizisini oluşturduğumuzda, matematiksel olarak analog Hilbert dönüşümü almışız gibi bir sinyal elde ederiz — üstelik hem daha ucuz hem de fiziksel olarak yapılabilir bir yoldan.

Kritik nokta: `x_a[n]`, artık **baseband karmaşık** bir sinyaldir; taşıyıcı yok olmuştur. Örnekleme hızı `f_s`, sinyalin taşıyıcı frekansıyla değil, sadece bilgi bant genişliğiyle sınırlıdır: `[−B/2, +B/2]` karmaşık spektrumu tamamen yakalamak için `f_s ≥ B` yeterlidir. Yani 5 MHz'lik ADS-B benzeri bir sinyal için gerçel örneklemede 10 MSPS gerekirken, I/Q örneklemede **karmaşık** 5 MSPS iş görür — hafıza, disk, işlem yükü tam anlamıyla yarıya iner.

---

## Bir Ton Üzerinde Karşılaştırma

Somutlaştıralım. `f_c = 1000 Hz`'lik tek bir sinüs olsun. Gerçel sinyalin Fourier dönüşümü `+1000 Hz` ve `-1000 Hz`'de iki delta içerir; iki delta simetriktir, biri diğerinin konjugesi. Analitik sinyalin dönüşümü ise sadece `+1000 Hz`'de tek bir delta içerir.

Aynı sinyalin bir frekans kayması `f_LO = 900 Hz` uygulanmış hâlini düşünün — I/Q alıcının içinde bunun tam analoğu olur. Gerçel çarpım `x(t)·cos(2π·f_LO·t)`, standart trigonometrik özdeşlik gereği hem `100 Hz`'de hem `1900 Hz`'de bileşen üretir. Karmaşık çarpım `x_a(t)·e^{-j·2π·f_LO·t}` ise sadece `100 Hz`'de bileşen üretir — 1900 Hz görüntüsü matematiksel olarak yoktur. Bu, "image rejection" denilen özelliğin en temel biçimidir.

**Bir uyarı.** Bu her zaman kâr-zarar hesabı: iki gerçel ADC yerine iki karmaşık örnekleyici kullanıyoruz, gibi geliyor ama bit sayısı olarak fark yok. Aynı bant genişliği için toplam bit hızı **aynı kalır** (2 × f_s × N_bits, iki kanal her biri f_s hızında N_bits bit). I/Q örneklemenin kazanımı bilgi teorisi anlamında bedava veri değil; **bant genişliği başına düşen örnek sayısını yarıya indirme** ve **görüntü frekansını yapısal olarak reddetme** kabiliyetidir. Sonrasındaki işlem hattı — FFT, decimator, demodulator — bu düzenli baseband spektrumda çok daha kolay çalışır.

---

## Direct-Conversion Alıcının Zayıf Yeri: I/Q Dengesizliği

Şimdiye kadar her şey matematiksel olarak zarif göründü. Fakat gerçek donanımda yukarıdaki mixer/LPF/ADC ikilisi **kusursuz** değildir. İki mixer'a giden lokal osilatör kolları ideal olarak 90° faz farkına sahip olmalıdır; pratikte 89.5° veya 90.3° olabilir. İki analog LPF filtresinin geçiş bandı kazançları aynı olmalıdır; pratikte 0.05 dB fark bulunabilir. Bu iki hata birleştiğinde analitik sinyalimiz artık gerçekten analitik olmaz: negatif frekans tarafında sızıntı belirir. Bu sızıntının şiddetine **image rejection ratio (IRR)** denir ve aviyonik alıcılarda üstünde çokça terlenilen bir metriktir.

Türetimi somutlaştıralım. Kusursuz I/Q sinyalini `x_a(t) = e^{j·2π·f·t}` alalım — pozitif frekansta tek bir spektral çizgi. Gerçek donanım Q kanalına küçük bir genlik hatası `δ` ve küçük bir faz hatası `φ` ekler. Ölçülen karmaşık sinyal şu hâle gelir:

$$
x_{\text{meas}}(t) = \cos(2\pi f t) + j\,(1+\delta)\sin(2\pi f t + \varphi)
$$

Bunu üstel gösterime açtığımızda,

$$
x_{\text{meas}}(t) = \alpha\, e^{+j 2\pi f t} + \beta\, e^{-j 2\pi f t}
$$

biçimini alır; burada

$$
\alpha = \tfrac{1}{2}\left[ 1 + (1+\delta)e^{+j\varphi} \right], \quad
\beta = \tfrac{1}{2}\left[ 1 - (1+\delta)e^{-j\varphi} \right].
$$

`α`, aslında olmasını istediğimiz pozitif frekans bileşeninin genliği; `β` ise donanım hatasının doğurduğu **görüntü**dür. Image rejection ratio, bu ikisinin güç oranıdır:

$$
\text{IRR} = 10 \log_{10}\!\left( \frac{|\alpha|^2}{|\beta|^2} \right)
= 10 \log_{10}\!\left( \frac{1 + 2(1+\delta)\cos(\varphi) + (1+\delta)^2}{1 - 2(1+\delta)\cos(\varphi) + (1+\delta)^2} \right).
$$

Küçük hatalar için (`δ ≪ 1`, `φ ≪ 1 rad`) Taylor açılımı yaparsak,

$$
\text{IRR} \approx 10 \log_{10}\!\left( \frac{4}{\delta^2 + \varphi^2} \right).
$$

Yani mühendisin cebine koyacağı basit sezgi: **hata karelerinin toplamı ne kadar küçükse, image rejection o kadar iyidir.** Şu sayısal örnekler doğrudan yukarıdaki eşitlikten çıkar:

| Genlik hatası (dB) | Faz hatası (°) | δ (lineer) | φ (rad) | IRR (dB) |
|---|---|---|---|---|
| 0.1 | 0 | 0.0115 | 0 | −45 |
| 0.5 | 0 | 0.0593 | 0 | −31 |
| 1.0 | 0 | 0.1220 | 0 | −25 |
| 0 | 1.0 | 0 | 0.01745 | −41 |
| 0 | 3.0 | 0 | 0.05236 | −32 |
| 1.0 | 5.0 | 0.1220 | 0.0873 | −23 |
| 0.1 | 1.0 | 0.0115 | 0.01745 | −40 |

Rakamların pratik yorumu şudur: 1° faz hatası veya 1 dB genlik hatası, alıcının image bantındaki başka bir sinyali sadece 25–40 dB bastırabileceği anlamına gelir. Alıcının bandında bir zayıf hedef (örneğin −90 dBm), image tarafında güçlü bir bozan (örneğin −40 dBm) varsa; ve IRR sadece 25 dB ise, image bileşeni −65 dBm olarak istenen sinyalin 25 dB üzerine çıkar — hedef gömülür. Bu senaryo modern kentsel spektrumda hiç de teorik değildir. Aviyonik direct-conversion alıcıları tipik olarak 55–75 dB IRR hedefler, ki bu hem donanım toleransları hem de sıcaklıkla değişim düşünüldüğünde ciddi bir gerekliliktir.

---

## Alıcı Kalibrasyonu: Software'ın İşi Nerede Başlar?

Gerçek dünyada `δ` ve `φ`, sıcaklığa, LO frekansına ve zamanla ilgili sürüklenmelere karşı sabit kalmaz. Bu nedenle üretim sonrası kalibrasyon yerine **çalışma sırasında** dinamik kalibrasyon standart pratik hâline gelmiştir. Temel fikir: alıcının içinde bilinen bir test sinyali (tipik olarak bilinen frekansta bir CW ton) üretilir, ADC çıktısındaki karmaşık örnekler üzerinde image bileşeninin gücü ölçülür, ve I/Q örneklerine küçük bir 2×2 matris uygulanarak bu güç minimize edilir.

Analog Devices'in AD9361 gibi transceiver'larında ve GNU Radio'nun `iqbalance_fix` bloğunda bu prensip birebir uygulanır; matris

$$
\begin{bmatrix} I' \\ Q' \end{bmatrix}
=
\begin{bmatrix} 1 & 0 \\ a & b \end{bmatrix}
\begin{bmatrix} I \\ Q \end{bmatrix}
$$

biçimindedir. `a` faz hatasını, `b` genlik hatasını düzeltir. LMS veya CMA türü bir adaptasyon algoritmasıyla `a` ve `b` iteratif olarak güncellenir; iyi ayarlanmış bir gömülü kalibrasyon, ham donanımın 25 dB IRR'ını 60–70 dB seviyesine çıkarabilir.

DC offset ayrı bir baş belasıdır. Zero-IF alıcıda LO frekansı istenen sinyalin frekansıyla çakışır; bu durumda LO'dan mixer'a sızan herhangi bir statik bileşen, ADC girişinde bir DC ofset olarak görünür ve karmaşık sinyalin `f = 0` bin'ini kirletir. Onun için modern SDR yazılımlarında (SDRSharp, GQRX, GNU Radio) genellikle DC bin bir HPF ile silinir; kullanıcı arayüzünde spektrumun tam ortasında bir "delik" görürsünüz. Bu delik bir hata değil, bir kalibrasyon artefaktıdır.

---

## Bir Deney: Aynı ADS-B Sinyalini İki Farklı Örneklemeyle Yakalamak

Kavramı somutlaştırmak için düşünsel bir deney yapalım. Elimizde 1090 MHz'de 5 MHz bant genişliğine sahip ADS-B sinyalinin baseband karmaşık gösterimi var — bir SDR'den geliyor, `x_a[n] = I[n] + j·Q[n]`, 5 MSPS. Bu karmaşık akıştan gerçel bir sinyal üretmenin sadece **gerçel kısmını almak** yoluyla yapıldığını sanmak yaygın bir yanılgıdır; gerçek dönüşüm

$$
x_{\text{real}}(t) = \text{Re}\{x_a(t)\,e^{+j 2\pi f_c t}\}
$$

biçimindedir. Yani karmaşık baseband sinyali önce bir taşıyıcı frekansa modüle etmek, sonra gerçel kısmını almak. Bu gerçel sinyalin bant genişliği `[f_c − B/2, f_c + B/2]` aralığındadır ve Nyquist alt sınırı `2·(f_c + B/2)` — 1092.5 MHz civarı.

Aksi yönde: aynı bilgiyi gerçel örneklemeyle yakalamak için ya 2.185 GSPS ADC, ya da bandpass sampling ile alt Nyquist bölgesine katlama gerekir. Her iki durumda da örnek sayısı I/Q'ya göre en az iki katıdır. Bu, GHz mertebesindeki ADC'lerin neden hâlâ çok pahalı olduğunu; buna karşılık `RTL-SDR` gibi 20 USD'lik cihazların 3.2 MSPS I/Q ile ADS-B çözebildiğini açıklar. Şıklığın tamamı analitik sinyalin tek-yanlı spektrumundan gelir.

---

## Pratik Mühendislik Tavsiyeleri

Bu konuyu bir kez öğrendikten sonra alıcılara bakışım kalıcı olarak değişti; birkaç somut kural cebimde her zaman durur:

- **Karmaşık örneklemeyle çalışıyorsan spektrumun tamamı bilgi taşır.** FFT'nin negatif frekans tarafı simetrik değildir; DC bin merkez alınarak `fftshift` ile ortalanır ve `[−f_s/2, +f_s/2]` aralığı ekranda gerçek karşılığını bulur.
- **I/Q dengesizliği spurious oluşturur.** Ekranda merkez frekansın **karşı** tarafında beklenmedik bir yansıma görüyorsan (`+f` sinyalinin `−f` tarafında zayıf kopyası), bu image rejection sorunudur — LNA'yı suçlamadan önce IRR'yi ölç.
- **Kalibrasyon sıcaklıkla değişir.** Aviyonik ekipmanda `-55°C` ile `+85°C` arası çalıştığından, tek noktada yapılmış fabrika kalibrasyonu yeterli değildir; çalışma sırasında dinamik güncelleme şarttır.
- **DC ofset ayrı bir hikâyedir.** Karmaşık spektrumun tam merkezinde her zaman bir dikey bileşen olduğunu görürsen, bu ölçtüğün bir sinyal değil; alıcı topolojisinin sana bıraktığı bir kalıntıdır.
- **Bandpass sampling ile I/Q örnekleme birbirinin rakibi değildir.** Bandpass sampling gerçel bir ADC'nin altındaki bandı kaydırır; I/Q örnekleme aynı bilgiyi karmaşık uzayda temsil eder. Modern alıcılarda ikisi birbirini tamamlar: RF girişi bandpass filtrelenir, IF'e düşürülür, sonra I/Q örnekleme yapılır.

Bu son madde, [Bandpass Sampling yazımın]({% post_url 2026-05-21-bandpass-sampling %}) doğal devamıdır: orada gerçel örneklemeyle Nyquist bölgeleri arasında oynamayı; burada aynı bilginin karmaşık uzayda nasıl bir kat daha sıkıştığını gördük.

---

## Açık Sorular ve İleri Okuma

Yazının kapsamının dışında bıraktığım ama okurun kendisi için not düşmek isteyeceği birkaç konu var:

- **Fractional-N frequency synthesizers ve LO gürültüsü:** Faz hatası `φ` yukarıda sabit alındı; gerçekte bir gürültü sürecidir. Faz gürültüsü spektrumu (dBc/Hz) IRR'ı zamanla değişen bir büyüklük hâline getirir.
- **Wideband I/Q dengesizliği:** Yukarıda tek bir frekans için IRR türettik. Geniş bantta I/Q dengesizliği frekansa bağlıdır (LPF'lerin geçiş bantlarındaki fark); wideband kalibrasyon FIR-tabanlı düzeltme kullanır — Analog Devices'in AN-2557 uygulama notu somut algoritma sunar.
- **Polyphase filter banks:** DDC (digital down-conversion) uygulamalarında polyphase filter bank yapıları, decimation + I/Q üretimini tek geçişte yapar; CIC + FIR zinciri klasik uygulamadır.
- **Aviyonik gereksinimler:** RTCA DO-181E (Mode S transponder) ve DO-260C (ADS-B) alıcı için minimum image rejection değerleri öngörür; sertifikasyon testinde MOPS test seti kullanılır.

---

## Kaynaklar

- Vaughan, R. G., Scott, N. L., White, D. R. (1991). *The Theory of Bandpass Sampling.* IEEE Transactions on Signal Processing, 39(9), 1973–1984. <https://doi.org/10.1109/78.134430>
- Analog Devices. *Mirror, Mirror on the Wall — Understanding Image Rejection and Its Impact on Desired Signals.* Analog Dialogue 51-08, Ağustos 2017. <https://www.analog.com/en/resources/analog-dialogue/articles/mirror-mirror-on-the-wall-understanding-image-rejection-and-its-impact-on-desired-signals.html>
- Analog Devices. *Quadrature Error Correction for Wideband Zero-IF Signals.* Application Note AN-2557. <https://www.analog.com/en/resources/app-notes/an-2557.html>
- Carrick, M., Reed, J. H., Dietrich, C. B. *Design and Application of a Hilbert Transformer in a Digital Receiver.* Wireless Innovation Forum Proceedings, 2011. <https://www.wirelessinnovation.org/assets/Proceedings/2011/2011-1b-carrick.pdf>
- Rice, M. (2008). *Digital Communications: A Discrete-Time Approach.* Pearson. (Bölüm 5: analitik sinyal ve pass-band–low-pass eşdeğerlik.)
- Lyons, R. G. (2010). *Understanding Digital Signal Processing* (3. baskı). Pearson. (Bölüm 8: bandpass sampling; Bölüm 9: I/Q sampling ve analitik sinyaller.)
- RTCA DO-260C. *Minimum Operational Performance Standards for 1090 MHz Extended Squitter ADS-B and TIS-B.* 2020.
- Panoradio SDR. *How to convert between real and complex IQ signals.* <https://panoradio-sdr.de/how-to-convert-between-real-and-complex-iq-signals/>

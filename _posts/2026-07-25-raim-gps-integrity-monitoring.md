---
title: "RAIM: GPS Alıcısı Kendi Doğruluğunu Nasıl Denetler?"
subtitle: "Receiver Autonomous Integrity Monitoring: Least-Squares Residual, Chi-Square Test ve Protection Levels"
background: "/img/posts/1.webp"
date: '2026-07-25 08:00:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [aviyonik, navigasyon]
---

GPS alıcısı size bir konum verdiğinde, aynı zamanda bir de sessiz vaatte bulunur: "Bu değer *doğrudur*." Peki bu vaadi kim denetler? Uzayda 20 200 km yukarıda dönen bir uydunun saati aniden 100 nanosaniye kaysa — bu, yerdeki pseudorange'i 30 metre kaydıran bir hatadır — alıcı bu hatayı yerdeki bir gözlemevine sormadan **kendi başına** fark edebilir mi? Aviyonik dünyada bu sorunun kısa cevabı çok önemlidir, çünkü bir yaklaşma prosedüründe (approach procedure) hatalı bir konum yer sisteminden pilota "uçak pistin üzerindesiniz" demek anlamına gelebilir.

Cevabın adı **RAIM** — *Receiver Autonomous Integrity Monitoring*. GPS'in yaklaşmalarda IFR (instrument flight rules) altında kullanılmasının önündeki tek engel bir dönemler tam olarak buydu: alıcı, ölçtüğü konumun "hatalı olabileceğini" ne zaman ilan edeceğini bilmiyordu. RAIM bu boşluğu istatistiksel bir hipotez testiyle kapatır. Bu yazıda RAIM'in matematik iskeletini sıfırdan kuracağız: pseudorange modelinden başlayıp least-squares çözümüne, oradan residual vektörüne, chi-square testine ve son olarak "protection level" kavramına — yani alıcının kendi hatasına dair yayınladığı üst sınıra — kadar. Yol boyunca 5 uydulu bir örnek üzerinde tek uyduya bias enjekte edip testin bunu nasıl yakaladığını sayısal olarak göreceğiz.

Bu yazı Kalman filtresi ve bandpass sampling üzerine yazdıklarımın doğal bir devamı sayılabilir. Kalman filtresi *sürekli* bir tahmin verir; RAIM ise o tahminin *ne zaman güvenilmez* olduğunu söyler. Aviyonikte ilkinden çok ikincisi hayat kurtarır.

---

## Kısa Bir Tarihçe: GPS'in "İnanılırlık" Sorunu

GPS 1978'de ilk uydunun (Block I, Navstar 1) fırlatılmasıyla operasyonel olmaya başladı, tam takım (24 uydu Block II) ise 1993'te tamamlandı. Ama havacılıkta GPS uzun süre yalnızca "supplemental" bir seyir aracı olarak kaldı. Nedeni teknik değildi — konum çözümü zaten metrelerle iyiydi — nedeni **integrity**'ydi.

Havacılıkta bir seyir sisteminin dört performans boyutu vardır (RTCA'nın ilk kez DO-208'de, sonra DO-229 serisinde detaylandırdığı):

1. **Accuracy** (doğruluk) — konumun gerçek konuma yakınlığı.
2. **Integrity** (bütünlük) — sistem hatalıysa, *zamanında uyarı verme* yeteneği.
3. **Continuity** (süreklilik) — operasyon boyunca hizmet vermeye devam etme.
4. **Availability** (erişilebilirlik) — bu üçünü aynı anda karşılama oranı.

Accuracy tek başına yetmez. Bir yaklaşmada uçak 60 m/s hızla iner. FAA'nın precision approach kategorilerinde alarm süresi (time-to-alert) yalnızca 6 saniye gibi değerlerdedir; yani sistem hata olursa 6 saniye içinde pilotu uyarmak zorundadır. GPS'in mimarisinde bu görev doğrudan atanmış değildi: kontrol segmenti (Colorado Springs'teki Master Control Station) uydu sağlığını izler, ama bir uydu hatası anons edilene kadar dakikalar geçebilir.

İşte bu boşluğa iki paralel çözüm çıktı:

- **Yerden augmentation**: WAAS (ABD), EGNOS (Avrupa), MSAS (Japonya), GAGAN (Hindistan) — SBAS ailesi. Yer istasyonları uyduları izler, düzeltme ve integrity mesajlarını jeostasyoner uydular üzerinden yayınlar. Alıcı bu mesajları kullanır.
- **Alıcı içinde autonomous çözüm**: RAIM. Yer istasyonuna ihtiyaç yok. Alıcı, aldığı ölçümlerin *kendi içindeki tutarlılığını* istatistiksel olarak test eder.

RAIM'in matematik iskeletini iki grup neredeyse eş zamanlı yayınladı: Parkinson & Axelrad'ın *"Autonomous GPS Integrity Monitoring Using the Pseudorange Residual"* (Navigation, 1988), ve Sturza'nın *"Navigation System Integrity Monitoring Using Redundant Measurements"* (Navigation, 1988). Bugün pratikte kullanılan snapshot RAIM algoritması bu iki makalenin sentezidir. TSO-C129 (1992), GPS'in supplemental navigation için ilk sertifikasyonunu verdi ve RAIM'i zorunlu tuttu. TSO-C145/C146 daha sonra WAAS-kapable alıcıları düzenledi. DO-229 serisi — bugün DO-229F güncel — MOPS'u (Minimum Operational Performance Standards) belirler; RAIM/FDE algoritmaları bu belgede tanımlıdır.

---

## Neden Sadece Bir Kalman Filtresi Yetmez?

Bir Kalman filtresi (bkz. [Kalman yazısı]({% post_url 2026-06-02-kalman-filtresi %})) gürültülü ölçümleri optimal biçimde birleştirir, doğru. Ama Kalman'ın altında yatan model iki güçlü varsayım yapar: ölçüm gürültüsü sıfır ortalamalı Gauss, ve ölçüm matrisi $H$ doğru. Bir uydunun saati anlık kayarsa, o uydunun pseudorange ölçümü artık **bias**'lı olur — sıfır ortalamalı değildir. Kalman bunu görmez, filtreye bu bias'ı en ufak dirençle içine alır ve tüm durum kestirimini kaydırır. Kovaryans matrisi $P$ kağıt üzerinde küçüktür (filtre "eminim" der), oysa gerçek hata büyümüştür.

Yani Kalman'a "innovation kovaryansı fazla mı" sorusunu sorabilirsiniz (innovation testi), ama tek bir bias'lı uyduyu tüm setten ayırt edemezsiniz. RAIM tam olarak bu ayrımı hedefler.

Hata modelleri kabaca şöyledir:

| Hata kaynağı | Tipik büyüklük | RAIM yakalar mı? |
|---|---|---|
| Uydu clock/ephemeris (nominal) | 1–3 m | Hayır — nominal, sıfır ortalamalı sayılır |
| İyonosfer (tek frekans, koreksiyonlu) | 2–5 m | Hayır — nominal gürültünün içinde |
| Troposfer (model sonrası) | 0.5–1 m | Hayır |
| Multipath (havacılıkta düşük) | 0.5–1 m | Hayır |
| **Uydu clock adım hatası** (soft failure) | 30–1000 m | **Evet** |
| **Ephemeris broadcast hatası** | 10–100 m | **Evet** |
| Alıcı gürültüsü | ~0.3 m | Nominal |

RAIM'in görevi "arka plan gürültüsünü" tanımak değil, **anormal (fault) bir ölçümün ortaya çıkışını** normalden ayırt etmektir.

---

## Pseudorange Modeli ve Linearizasyon

RAIM'i anlamak için önce alıcının konumu nasıl çözdüğünü hatırlayalım. $i$'nci uydudan gelen pseudorange ölçümü:

$$
\rho_i = \|\mathbf{r}_{s,i} - \mathbf{r}_u\| + c\,(dt_u - dt_{s,i}) + I_i + T_i + M_i + \epsilon_i
$$

Burada $\mathbf{r}_{s,i}$ uydunun ECEF konumu (efemerisden bilinir), $\mathbf{r}_u$ aradığımız kullanıcı konumu, $dt_u$ alıcının bilinmeyen saat sapması, $dt_{s,i}$ uydu saati sapması (efemeriste yayınlanır), $I_i, T_i, M_i$ iyonosfer, troposfer ve multipath, $\epsilon_i$ ise ölçüm gürültüsü. Modellenmiş bileşenleri (uydu saati düzeltmesi, iyonosfer/troposfer modelleri) çıkarınca elimizde şu kalır:

$$
\rho_i^{\text{corr}} = \|\mathbf{r}_{s,i} - \mathbf{r}_u\| + c\,dt_u + \eta_i
$$

Bilinmeyen 4'tür: $\mathbf{r}_u = (x, y, z)$ ve $c\,dt_u$. Yani en az 4 uydu gerekir. Denklem doğrusal değil — mesafe operatörü konumun karekökü. Newton-Raphson tarzı çözüm için bir başlangıç tahmini $\hat{\mathbf{r}}_u^{(0)}$ etrafında linearize ederiz. $\Delta\mathbf{x} = (\Delta x, \Delta y, \Delta z, c\,\Delta dt_u)^T$ olsun. Türev alındığında:

$$
\Delta\rho_i \approx -\hat{\mathbf{e}}_i^T \Delta\mathbf{r}_u + c\,\Delta dt_u + \eta_i
$$

Burada $\hat{\mathbf{e}}_i$ alıcıdan uyduya doğru birim vektördür. Bunu $n$ uydu için matris formunda yazarsak:

$$
\mathbf{b} = H\,\Delta\mathbf{x} + \boldsymbol{\eta}, \qquad
H = \begin{bmatrix}
-\hat{e}_{1,x} & -\hat{e}_{1,y} & -\hat{e}_{1,z} & 1 \\
-\hat{e}_{2,x} & -\hat{e}_{2,y} & -\hat{e}_{2,z} & 1 \\
\vdots & & & \vdots \\
-\hat{e}_{n,x} & -\hat{e}_{n,y} & -\hat{e}_{n,z} & 1
\end{bmatrix}
$$

$H$ boyutu $n \times 4$, geometri matrisidir. $\mathbf{b}$ ölçülen pseudorange ile nominal pseudorange arasındaki farktır. Least-squares çözümü:

$$
\Delta\hat{\mathbf{x}} = (H^T H)^{-1} H^T \mathbf{b}
$$

Ve **residual vektörü**, yani ölçüm ile çözümün yeniden ürettiği ölçüm arasındaki fark:

$$
\mathbf{r} = \mathbf{b} - H\,\Delta\hat{\mathbf{x}} = \bigl(I_n - H(H^T H)^{-1} H^T\bigr)\,\mathbf{b} = S\,\mathbf{b}
$$

$S = I_n - H(H^T H)^{-1} H^T$ bir izdüşüm matrisidir; $H$'nin sütun uzayının **dik tümleyenine** izdüşürür. Bu matrisin izi (trace) $n-4$'tür — bu da bize serbestlik derecesini verir.

Geometrik yorum: 4 uydu ile least-squares tam çözümdür, residual sıfırdır (aşağıda göreceğiz). 5 uydudan itibaren ölçümler "aşırı belirlenmiş" (overdetermined) hâle gelir; artık her ölçüm, diğer dördünün oluşturduğu çözüme birebir uyamaz. Bu tutarsızlık miktarı — SSE (sum of squared errors) — RAIM'in test istatistiğidir.

---

## Snapshot RAIM: Test İstatistiği

Parkinson-Axelrad'ın önerisi basit ve zariftir: residual vektörünün karesel toplamını al.

$$
\text{SSE} = \mathbf{r}^T \mathbf{r} = \mathbf{b}^T S \mathbf{b}
$$

Nominal koşulda (hata yok, tüm ölçümler yalnızca sıfır ortalamalı Gauss gürültüsü içeriyor), $\eta_i \sim \mathcal{N}(0, \sigma^2)$ ise:

$$
\frac{\text{SSE}}{\sigma^2} \sim \chi^2(n-4)
$$

Yani nominal SSE, serbestlik derecesi $n-4$ olan bir **ki-kare dağılımı** takip eder. Bir uydu hatalıysa (yani gerçekte $\eta_i$ yerine $\eta_i + b_i$, burada $b_i$ bias), residual istatistiği artık merkezî değil **merkezî olmayan** bir ki-kare dağılımı takip eder ve beklenen SSE değeri artar.

Test şu şekilde kurulur:

1. Nominal koşulda kabul edilebilir bir yanlış alarm olasılığı $P_{FA}$ seç (havacılıkta tipik 10⁻⁵/saat mertebesi).
2. $\chi^2(n-4)$ dağılımından bu $P_{FA}$'ya karşılık gelen bir **threshold** $\text{Th}$ hesapla.
3. Her epokta $\text{SSE}$'yi ölç. Eğer $\text{SSE} > \text{Th}^2 \cdot \sigma^2$ ise: "fault detected" bayrağı kaldır.

Örnek: $n=6$, $\sigma = 5$ m, $P_{FA} = 10^{-3}$ hedeflendiğinde ki-kare tablosundan $\chi^2_{0.001}(2) \approx 13.82$. Yani nominal SSE tavan değeri $13.82 \times 25 = 345.5$ m². Karekökü ~18.6 m. SSE'nin karekökü bu değerin üzerine çıktığında test tetiklenir.

Buradaki en can alıcı gözlem: **RAIM en az 5 uydu ister** (n-4 ≥ 1 olması için — 4 uyduda residual her zaman sıfırdır ve tutarsızlık ölçülemez). FDE (fault detection *and exclusion*) için ise en az 6 uydu gerekir: bir uyduyu dışladıktan sonra kalan 5 ile hâlâ detection kabiliyetini korumak istiyoruz.

---

## Somut Örnek: 5 Uyduya Bias Enjeksiyonu

Sayı olmadan bu matematik havada asılı kalır. Basitleştirilmiş bir örnek kuralım. Alıcı ECEF orijininde, 5 uydu görüyor ve yerel ENU (East-North-Up) koordinatlarında birim vektörlerini basitçe atadık. Standart sapma $\sigma = 5$ m (tek frekans GPS'te ölçüm sonrası tipik değer).

Geometri matrisi (dikey/yatay geometri karışık, saat sütunu tümüyle 1):

$$
H = \begin{bmatrix}
 0.50 &  0.00 &  0.87 & 1 \\
-0.50 &  0.50 &  0.71 & 1 \\
 0.00 & -0.87 &  0.50 & 1 \\
-0.71 & -0.50 &  0.50 & 1 \\
 0.71 &  0.50 &  0.50 & 1
\end{bmatrix}
$$

Serbestlik derecesi $n - 4 = 1$. Ki-kare $\chi^2(1)$ dağılımından $P_{FA} = 10^{-3}$ için threshold $\chi^2_{0.001}(1) \approx 10.83$. Yani $\text{SSE}/\sigma^2 > 10.83$ olduğunda alarm çal. $\sigma^2 = 25$, tavan SSE = 270.7 m², karekökü **~16.5 m**.

**Durum 1 (nominal)** — Tüm 5 ölçüm sıfır ortalamalı, $\sigma=5$ m Gauss gürültüsü. Örnek bir realizasyon: $\mathbf{b} = (2.48, -0.69, 3.24, 7.62, -1.17)^T$. Least-squares çözüldüğünde residual vektörü hesaplanır ve $\text{SSE} = 14.62$ m². Karekökü 3.82 m — 16.5 m thresholdunun çok altında, alarm yok. Bu beklenendir; nominal koşulda birçok epok üst üste geçer, sıra dışı bir tetikleme olmaz.

**Durum 2 (uydu 3'e 40 m bias, aynı gürültü realizasyonu)** — Diyelim ki 3. uydunun broadcast efemerisinde bir hata var ve pseudorange 40 m fazla ölçülüyor. Ölçüm vektörü: $\mathbf{b} = (2.48, -0.69, 43.24, 7.62, -1.17)^T$. Bu bias'ın *ne kadarı* konum çözümüne, *ne kadarı* residual'a düşer? İşte $S = I - H(H^TH)^{-1}H^T$ matrisinin işlevi burada devreye giriyor. Bu geometride $S$'nin köşegen değerleri sırasıyla $[0.068, 0.211, 0.308, 0.397, 0.015]$ — trace $= 1 = n-4$ (sanity check). Sadece 40 m bias etkisi (gürültü olmasa) residual'da 22.21 m'lik bir sqrt-SSE yaratır, konum çözümüne ise 23.47 m yatay ve toplam ~29 m hata kaçar. Gürültü + bias birlikte olduğunda toplam $\text{SSE} = 338.2$, karekökü 18.39 m. Threshold 16.5 m; test tetiklenir, "fault detected".

Bu örnekten üç ders çıkar:

1. **Bias'ın tümü residual'a yansımaz.** 40 m bias'ın yaklaşık 22 m'si residual'ı büyütürken, geri kalan enerji konum + saat çözümüne "sızar" ve fark edilmeden hata yaratır. İşte "protection level" kavramının doğduğu yer burasıdır.
2. **Geometri belirleyicidir.** $S$ matrisi doğrudan $H$'ye bağlıdır. Zayıf geometri (uydular gökyüzünün bir bölgesinde kümelenmiş) bias'ın çok küçük kısmının residual'a yansımasına, büyük kısmının konuma kaymasına neden olur. Aynı bias aynı $\sigma$ ile bazen yakalanır, bazen kaçırılır.
3. **Kötü uydu ≠ enjekte edilen uydu.** Aynı geometride her uydu için "yatay konum hatası / residual" oranı (SLOPE) sırasıyla $[1.54, 1.54, 1.06, 0.67, 5.03]$. Sat 5'in SLOPE'u sat 3'ünkinin ~5 katı — çünkü sat 5'in $S$ köşegeni sadece 0.015. Yani gerçek "worst-case" uydu geometriye göredir; enjekte ettiğimiz sat 3 bu geometride görece "iyi" bir uydu. Bir sonraki bölümde bu değerin doğrudan protection level'a girdiğini göreceğiz.

---

## SLOPE ve Protection Level'ın Doğuşu

Şimdi kritik soruya gelelim: alarm çalmadığı durumda, konumdaki hata **en fazla ne kadar olabilir**? "Detection kaçırdım" olasılığını hesaba katarak.

Her uydu için bir *SLOPE* değeri tanımlarız:

$$
\text{SLOPE}_i = \frac{|\text{konumda }i\text{. uydu biasının etkisi}|}{|\text{residual'da }i\text{. uydu biasının etkisi}|}
$$

Sezgi: bir uydu için bias büyüdükçe hem konum kayması hem residual büyür. Bu ikisinin **oranı** o uydunun geometriye bağlı bir sabitidir. Yüksek SLOPE'lu uydu tehlikelidir — bias'ı kolayca konuma sızdırır ama residual'ı fazla büyütmez.

En kötü uydu:

$$
\text{SLOPE}_{\max} = \max_i \text{SLOPE}_i
$$

Ve **Horizontal Protection Level** (Parkinson-Axelrad tanımıyla):

$$
\text{HPL} = \text{SLOPE}_{\max} \cdot p_{\text{bias}}(P_{MD}, P_{FA})
$$

Buradaki $p_{\text{bias}}$, verilen $P_{MD}$ (missed detection olasılığı, tipik 10⁻³) ve $P_{FA}$ için merkezî olmayan ki-kare dağılımından hesaplanan bir "en küçük tespit edilebilir bias" — yani "residual istatistiğim bu bias'ı belirtilen olasılıkla yakalayacak minimum değer". VPL (vertical) formülü aynı yapıda ama SLOPE hesabında dikey bileşen kullanılır.

Bu formülün pratik anlamı çok güçlü. Alıcı, epok başına şu üç şeyi yapar:

1. Konum çözümünü hesapla.
2. SSE'yi hesapla, threshold ile karşılaştır (detection).
3. Anlık $H$ matrisinden $\text{SLOPE}_{\max}$ ve $\text{HPL}$'yi hesapla.

Ve pilotun cihazı **HPL değerini** kullanır. Yaklaşma prosedürünün izin verdiği bir *alarm limit* vardır — RNP APCH LNAV için tipik olarak **HAL (horizontal alert limit) = 556 m** (0.3 NM), LPV için VAL = 35 m, LP için HAL = 40 m. Kurala göre:

- $\text{HPL} < \text{HAL}$: sistem *available*. Yaklaşma güvenle sürdürülebilir.
- $\text{HPL} \geq \text{HAL}$: sistem *not available*. Prosedür iptal, alternatif bir seyir yardımına geç.

Yani RAIM sadece "hata var mı?" demez; "olası hata büyüklüğünü söylediğim değerden **daha büyük değil**" garantisini de verir. Bir uydu düştüğünde ya da geometri bozulduğunda HPL sıçrar; sistem sessizce yanlış davranmaz, açıkça "kullanılamıyorum" der. Bu, integrity'nin özüdür.

---

## Fault Detection and Exclusion (FDE)

RAIM sadece "bir yerde bir hata var" der. Peki *hangi* uydu suçlu? Bunu bulup dışlamaya (exclude) FDE denir.

Sturza'nın parity space yaklaşımı burada devreye girer. $H$ matrisinin QR ayrışımı yapılır: $H = QR$, $Q$'nun $n-4$ boyutlu son sütun bloğu $Q_2$ residual uzayının bir bazıdır. Parity vektörü:

$$
\mathbf{p} = Q_2^T \mathbf{b}
$$

Kritik özellik: $\mathbf{p}$'nin dağılımı **hangi uydunun hatalı olduğuna göre farklı yönde** kayar. Yani parity uzayında $\mathbf{p}$'nin yönü, hatalı uyduyu işaret eder. Uygulamada:

1. Tüm $n$ uyduyla SSE hesapla → detection.
2. Detection tetiklenirse, sırayla her uyduyu dışla ($n-1$ uyduyla tekrar çöz).
3. En düşük SSE veren dışlama, muhtemel suçluyu belirler.
4. Kalan $n-1$ uydudan hâlâ bir çözüm üret ve yeni HPL hesapla.

Adım 2 için minimum 6 uydu şart: bir tanesi çıkarılınca 5 kalır (detection için minimum 5), böylece yeni çözümü hâlâ denetleyebiliriz. Bazı yayınlar 7 uydu ister — bu, aynı anda iki bağımsız hatanın olasılığını da hesaba katan daha muhafazakâr bir yaklaşımdır.

FDE için formal karar akışı şöyle görselleştirilebilir:

<div class="mermaid">
flowchart TD
    A[Yeni epok - n pseudorange] --> B{n >= 5 ?}
    B -- Hayır --> Z[RAIM yok; alarm]
    B -- Evet --> C[Least-squares çöz]
    C --> D[SSE hesapla]
    D --> E{SSE > Th ?}
    E -- Hayır --> F[HPL hesapla]
    F --> G{HPL < HAL ?}
    G -- Evet --> H[Konum yayınla - available]
    G -- Hayır --> I[Yayınla ama unavailable bayrağı]
    E -- Evet --> J{n >= 6 ?}
    J -- Hayır --> K[Fault - konumu red et]
    J -- Evet --> L[Her uyduyu tek tek dışla, SSE minumumu ara]
    L --> M[En kötü uyduyu çıkar]
    M --> C
</div>

---

## Baro-Aiding: Beşinci Denklem Olarak Barometrik İrtifa

RAIM'in derdi bazen "sadece 4 uydu görüyorum, detection yapamıyorum" dır. Havacılıkta bir hile geliştirildi: barometrik altimetre (baro) çıkışını sanki beşinci bir *pseudorange* ölçümü gibi $H$ matrisine ekle.

Baro dikey konumu ölçer; bu, $H$'ye eklenen yeni bir satırın $[0, 0, 1, 0]$ yapısına sahip olması demek. Böylece:

- Minimum uydu sayısı detection için 4'e, FDE için 5'e iner.
- Baro'nun kendi $\sigma$'sı vardır (~10-30 m Kalman ile birleştirildiğinde); geometri bu $\sigma$'ya duyarlıdır.
- Baro'daki hata (yerel basınç değişimi) RAIM için "sistem hatası" gibi görünebilir. Bu yüzden baro-aiding'in kullanımı MOPS'ta koşullara bağlıdır.

Pratik önemi büyüktür: hava koşulları ya da uydu geometrisi zayıfladığında RAIM availability düşer. Baro-aiding olmadan bir alıcı yaklaşmayı iptal etmek zorunda kalabilir; baro ile devam edebilir.

---

## ARAIM: Çoklu Konstelasyon Devri

Klasik RAIM tek konstelasyon (GPS L1 C/A) varsayımı üzerine kuruludur. Galileo'nun operasyonel olması (2016 sonrası) ve BeiDou'nun küresel kapsama alması (2020) ile alıcıda anlık uydu sayısı 15-25'e çıktı. Bu, iki fırsat açtı:

1. Daha güçlü FDE — birden fazla eşzamanlı hatayı çözebilme.
2. Daha sıkı protection level — daha iyi geometri sayesinde SLOPE_max düşer.

**ARAIM** (Advanced RAIM) bu fırsatı formalize etti. Kavramsal olarak snapshot RAIM'in genellemesidir ama farkları önemlidir:

- **Multiple simultaneous fault** hipotezleriyle çalışır. Klasik RAIM tek hata varsayar; ARAIM $k$-fault durumlarını (bir konstelasyondan iki uydu bozulabilir vs.) hesaba katar.
- **Solution separation** yaklaşımı kullanır: tüm alt-kümelerin çözümlerini karşılaştırır, aralarındaki fark bir integrity kaydı olarak yorumlanır.
- **Integrity Support Message** (ISM) adında yeni bir yer-yayınlı mesaj kullanır (henüz operasyonel değil): konstelasyon başına anlık P_sat, P_const değerlerini alıcıya iletir.
- Hedef performans **LPV-200** (vertical guidance to 200 ft) seviyesindedir — bu klasik RAIM'in erişemediği bir kategori.

GPS-Galileo Working Group C ARAIM Technical Subgroup, 2016 Milestone 3 raporunda çift konstelasyonun global LPV-200 desteğini teknik olarak mümkün gösterdi. FAA 2020'lerin sonunda ARAIM'i operasyonel sertifikasyona yaklaştırma yolunda çalışıyor.

---

## Sertifikasyon ile Bağlantı

RAIM'i kavramsal bir "algoritma" olarak değil, sertifikalı bir işlev olarak da anmak lazım. Havacılık standartları hiyerarşisinde konumu şöyle özetlenebilir:

- **TSO-C129** — GPS supplemental navigation for IFR, RAIM zorunlu, en az 6 uydu FDE, HAL değerleri prosedür fazına göre.
- **TSO-C145 / C146** — WAAS-capable receivers. SBAS düzeltmeleri var, RAIM yerine SBAS integrity mesajları kullanılır; SBAS kesildiğinde fallback olarak RAIM devreye girer.
- **DO-229F** — GPS/SBAS MOPS. RAIM/FDE algoritmalarının detaylı gereksinimleri, threshold hesap yöntemleri, test senaryoları.
- **DO-208** — orijinal MOPS (artık supersede), RAIM'in doğduğu belge.
- **DO-253D** — GBAS için MOPS (yerel augmentation).

Yazılım tarafında bir alıcının RAIM/FDE bloğu — çoğunlukla DAL B ya da DAL C (missed detection'ın operational impact'ine bağlı olarak) — DO-178C süreçleriyle geliştirilir. MC/DC koşullarına takılabilir; test senaryoları hem nominal hem bias-injection içerir. Statik analiz (Polyspace, Astrée), least-squares kodunun overflow durumlarını (özellikle $H^TH$'nin condition number'ı yüksek olduğunda) yakalamak için kritiktir.

---

## Pratik Mühendislik Tavsiyeleri

Bir alıcı ya da simülasyon geliştirirken RAIM tarafında sık karşılaşılan tuzaklar:

1. **$H^T H$'nin condition number'ı**. Zayıf geometri (uydular birbirine yakın) invers hesabını sayısal olarak kırar. LDL veya QR ayrışımı kullanın; doğrudan matris tersine güvenmeyin. Ayrıca condition number kendisi bir "geometry health" göstergesi olarak izlenebilir.

2. **Threshold sabit değil**. Bazı literatür $\sigma$'yı sabit varsayar. Gerçekte $\sigma_i$ her uydu için farklı olabilir (elevation'a göre değişir — düşük elevation daha gürültülüdür). Ağırlıklı least-squares $\Sigma^{-1/2}$ dönüşümüyle bu bileşenler eşitlenir ve chi-square teorisi hâlâ geçerlidir. Kod yazarken bu ağırlıklandırmayı doğru uygulamak şart.

3. **SLOPE'un birden fazla tanımı var**. Parkinson-Axelrad'ın orijinal SLOPE'u "position error / residual test statistic" iken bazı modern makaleler "$\|H^\dagger \mathbf{u}_i\| / \|S\mathbf{u}_i\|$" formunu kullanır ($\mathbf{u}_i$ i'inci uydu için birim yönü). Sonuç aynıdır ama implementasyon karışabilir; kaynağınızı seçip tutarlı kalın.

4. **P_MD kavramı sezgisiz**. $10^{-3}$ deyince kulağa büyük geliyor ama bu "epok başına" olasılıktır. 1 Hz alıcıda saatte 3600 epok = beklenen 3.6 missed detection. Bu kabul edilir mi? Aslında evet — çünkü her missed detection'ın *sonuçlanan hata büyüklüğü* HPL'nin altındadır. HPL zaten operational limit'in altında olduğu için hata operational olarak zararsızdır. Integrity metrikleri "yakalanma olasılığı"nı değil, "yakalanmadığında hasarın sınırlı kalması"nı garanti eder.

5. **Chi-square vs karekök karşılaştırma**. Bazı implementasyonlar SSE'yi karşılaştırır, bazıları $\sqrt{\text{SSE}/(n-4)}$'yi (residual RMS). İkincisi ölçü birimi olarak metre verir — okuması daha sezgisel. Ama threshold da buna göre dönüştürülmeli. Karışıklık bu iki formu birbirine karıştırmaktan çıkar.

6. **Sıralı vs snapshot**. Yukarıda anlatılan snapshot RAIM her epokta bağımsız çalışır. Sıralı (sequential) RAIM önceki epokların bilgisini de kullanır — filtre bazlı (Kalman-innovation-tabanlı) yaklaşımlardır. Daha güçlü ama daha karmaşık; sertifikasyon süreci daha ağır. Klasik havacılık alıcıları çoğunlukla snapshot ile yetinir.

---

## Açık Sorular ve İleri Okuma

RAIM konusu bu yazının kapsamının çok ötesinde derinliklere iner. Merak edenler için:

- **Multipath'in RAIM'e etkisi**. Modelin varsayımı sıfır ortalamalı Gauss; multipath bu varsayımı ihlal edebilir. Havacılıkta anten yüksekliği ve teknoloji (choke ring) bu etkiyi bastırır; ama tam çözümlü bir integrity modeli yapmak açık bir araştırma alanıdır.
- **Spoofing tespiti**. RAIM tasarımı "uydu arıza" hipotezine göre kuruludur, "kasıtlı düzmece sinyal" değil. Spoofer ölçümleri *tutarlı* şekilde bozarsa RAIM alarm çalmayabilir. Anti-spoofing yeni bir integrity katmanı ekler (ör. antenna array-based, Galileo OSNMA).
- **Cebir yerine geometri**. $H$'nin geometrik yorumu — DOP (Dilution of Precision) tarihine ve nasıl SLOPE ile ilişkili olduğuna — güzel bir derinleşme çubuğu.
- **DO-229'un versiyon farkları**. DO-229D, E, F arasında protection level formülünde ince değişiklikler var (özellikle SBAS düzeltmesi + RAIM karışımı). MOPS'a sadık kalmak gereken bir alıcı üretiyorsanız sürüm-bazlı okumak şart.

Bir sonraki yazıda muhtemelen protection level hesabını Python'da gerçek bir 12 uydu almanağıyla oynayacağım ve HPL'nin gün boyunca nasıl değiştiğini göstereceğim. RAIM matematiği kağıt üzerinde soğuktur; ama bir alıcının availability'sinin gün içinde saatlere göre nasıl inip çıktığını görmek "bu gerçekten iş yapan bir şey" hissi verir.

---

## Kaynaklar

- Parkinson, B. W., & Axelrad, P. (1988). "Autonomous GPS Integrity Monitoring Using the Pseudorange Residual." *Navigation: Journal of the Institute of Navigation*, 35(2), 255–274.
- Sturza, M. A. (1988). "Navigation System Integrity Monitoring Using Redundant Measurements." *Navigation*, 35(4), 483–501.
- Brown, R. G. (1996). "A Baseline GPS RAIM Scheme and a Note on the Equivalence of Three RAIM Methods." *Navigation*, 39(3), 301–316.
- RTCA DO-229F, *Minimum Operational Performance Standards for Global Positioning System / Satellite-Based Augmentation System Airborne Equipment*, RTCA Inc.
- RTCA DO-208, *Minimum Operational Performance Standards for Airborne Supplemental Navigation Equipment Using GPS*.
- Kaplan, E. D., & Hegarty, C. J. (2017). *Understanding GPS/GNSS: Principles and Applications* (3rd ed.), Artech House. — özellikle Bölüm 8, integrity monitoring.
- Misra, P., & Enge, P. (2011). *Global Positioning System: Signals, Measurements, and Performance* (2nd rev. ed.), Ganga-Jamuna Press. — RAIM türetimi ve pratik örnekler.
- [GPS-Galileo Working Group C ARAIM Technical Subgroup Milestone 3 Report](https://www.gps.gov/policy/cooperation/europe/2016/working-group-c/ARAIM-milestone-3-report.pdf), 2016.
- [Navipedia — ARAIM](https://gssc.esa.int/navipedia/index.php/ARAIM).
- FAA TSO-C129a, *Airborne Supplemental Navigation Equipment Using the Global Positioning System (GPS)*.
- FAA TSO-C145d / TSO-C146d, *Airborne Navigation Sensors / Standalone Systems Using SBAS*.

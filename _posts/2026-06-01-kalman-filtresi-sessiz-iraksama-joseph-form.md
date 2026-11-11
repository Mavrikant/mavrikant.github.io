---
title: "Kalman Filtresinin Sessiz İraksaması: Joseph Form, Gözlemlenebilirlik ve Tutarlılık Testleri"
subtitle: "Silent Divergence of the Kalman Filter: Joseph Form, Observability, and Consistency Tests"
background: "/img/posts/6.webp"
date: '2026-06-01 09:00:00'
layout: post
lang: tr
mermaid: true
---

Kalman filtresinin acı veren bir özelliği vardır: çoğu zaman *çalışıyor gibi görünür*. Çıktısı düzgün bir eğri çizer, kovaryans matrisi `P` küçük sayılar tutar, üzerine yapıştırdığınız grafik tatminkâr görünür. Sonra bir gün — genellikle saha denemesinde — filtre **sessizce** yanlış cevap vermeye başlar. Kestirilen pozisyon gerçek pozisyondan ayrılır, ama filtre bundan haberdar değildir; `P` küçüktür, dolayısıyla filtre kendine güveniyordur. Kestirilen değer **yanlış ama yüksek güvenli**dir. Bu duruma literatürde *filter divergence* veya daha duygulu bir tabirle *filter overconfidence* denir.

Türkçe içerikte Kalman filtresi genellikle "ne işe yarar / nasıl türetilir" düzeyinde anlatılır. Bu yazı bunun ötesine geçip filtrelerinizi gerçek sistemlerde diz çöktüren dört başarısızlık modunu işler: numerik iraksama, gözlemlenebilirlik kaybı, yanlış Q/R ayarı ve lineerleştirme hatası. Sonunda filtrenin sessizce ıraksayıp ıraksamadığını sayısal olarak nasıl test edeceğinizi anlatan kısa bir tanı kutusu var.

Notasyon hatırlatması: durum vektörü `x`, durum geçiş matrisi `F`, süreç gürültü kovaryansı `Q`, ölçüm matrisi `H`, ölçüm gürültü kovaryansı `R`, Kalman kazancı `K`, durum kovaryansı `P`. `−` üst-indisi "ölçümden önce" (a priori), `+` "ölçüm sonrası" (a posteriori) anlamındadır.

---

## 1. Klasik formun gizli tuzağı: kovaryans güncellemesi

Standart Kalman filtresinin ölçüm güncellemesi her ders kitabında aynı sıradadır:

$$
K_k = P_k^- H^T (H P_k^- H^T + R)^{-1}
$$

$$
\hat{x}_k^+ = \hat{x}_k^- + K_k (z_k - H \hat{x}_k^-)
$$

$$
P_k^+ = (I - K_k H) P_k^-
$$

Bu üçüncü satır, ders kitabının size **vermediği** uyarıyla birlikte gelir: bu formül matematiksel olarak doğru, **numerik olarak tehlikelidir**. İki nedenle:

1. **Simetri kayboluyor.** `(I - K H) P` çarpımı, kâğıt üstünde simetrik bir sonuç verir çünkü `P` simetriktir. Fakat sonlu hassasiyetli kayan nokta aritmetiğinde `(I - K H) P` çarpımının köşegen-dışı elemanları küçük yuvarlama farkları içerir. Birkaç güncellemeden sonra `P` belirgin biçimde asimetrikleşir. Bir sonraki adımdaki `H P H^T` ifadesi de simetrik olmayacağından, Kalman kazancı yanlış hesaplanır.

2. **Pozitif tanımlılık kayboluyor.** `P`, bir kovaryans matrisi olduğu için pozitif yarı-tanımlı olmak zorundadır. Yuvarlama hataları biriktiğinde `P`'nin bazı özdeğerleri **negatife düşebilir**. Negatif özdeğerli bir "kovaryans" matrisi fiziksel olarak anlamsızdır — bir durum bileşeninin varyansı negatif olamaz — ve filtre bu noktadan sonra her şeyi hatalı hesaplar.

İşin sinsi yanı: bu çöküş aniden olmaz. `P` matrisi giderek "biraz daha fazla" asimetrikleşir, en küçük özdeğeri giderek sıfıra yaklaşır, sonra eksiye sarkar. Filtre bu süre boyunca tutarlı bir çıktı üretmeye devam eder. Sahada gözlemlediğiniz semptom genellikle şu olur: filtre belirli bir eksende **anlamsız derecede kendinden emin** hale gelir; o eksene gelen ölçümler artık güncelleme üretmez çünkü `P`'nin o yönde varyansı neredeyse sıfırdır. Filtre o ekseni "bildiğine emindir" — yanlış olarak.

---

## 2. Joseph form: ders kitabının atladığı denklem

Çözüm 1968'den beri biliniyor. Peter D. Joseph'in (Bucy & Joseph kitabı) önerdiği alternatif kovaryans güncellemesi şudur:

$$
P_k^+ = (I - K_k H) P_k^- (I - K_k H)^T + K_k R K_k^T
$$

Bu form *cebirsel olarak* yukarıdaki standart formla aynıdır — kâğıt üzerinde optimal `K_k` için ikisi de aynı sonucu verir. Numerik olarak ise iki kritik üstünlüğü vardır:

**Simetri garantilidir.** `(I - K H) P (I - K H)^T` ifadesi, simetrik bir matrisin `A·P·A^T` biçimindeki simetrik sandviçidir (kongrüans dönüşümü) ve numerik olarak da simetriktir. `K R K^T` de aynı sebepten simetriktir. İki simetrik matrisin toplamı simetriktir. Joseph form bir adım daha çevirseniz bile `P`'nin simetrisini kaybetmeyi başaramazsınız.

**Pozitif yarı-tanımlılık korunur.** İki terim de pozitif yarı-tanımlı matrislerin (`P` ve `R`) sandviç çarpımıdır; pozitif yarı-tanımlı matrislerin toplamı da pozitif yarı-tanımlıdır. Yani Joseph form bir adım çalıştırdıktan sonra çıkan `P` matrisi, kayan nokta hassasiyeti ölçeğinde, garantili biçimde geçerli bir kovaryans matrisidir.

İşlem maliyeti standart formdan yaklaşık iki katıdır (`(I - KH)` çarpımı iki kez kullanılır artı `KRK^T`). Bu maliyet kayan-nokta birimi olan herhangi bir gömülü işlemcide önemsizdir. Cortex-M4 sınıfı bir işlemci üzerinde dahi 6-durumlu bir filtre için fark mikrosaniyeler düzeyindedir. **Joseph form'u kullanmamak için gerçek bir mühendislik gerekçeniz yoktur.**

Yan not: Joseph form'un ötesinde bir adım daha var — **kare-kök (square-root) Kalman filtresi**. Burada `P` yerine `P = S S^T` ile tanımlı `S` matrisini güncelliyorsunuz. Sayısal koşullanması en iyi olan form budur; nitekim MIT'de James Potter 1963'te Apollo navigasyonu için tam da bu motivasyonla geliştirmiştir. Bierman'ın **UD ayrıştırması** (`P = U D U^T`, `U` birim üst üçgen, `D` köşegen) kare-kökün biraz farklı bir biçimidir; pratikte hem hassasiyet hem de hesaplama maliyeti açısından en dengeli seçenektir. Modern gömülü uygulamalarda Joseph form ile UD ayrıştırması arasında bir seçim yapmanız gerekirse: 32-bit float ile çalışan bir IMU/GPS füzyonunda Joseph yeterlidir; 16-bit fixed-point veya 1000+ Hz ile koşan yüksek-boyutlu (>10 durum) bir filtrede UD'ye geçmek gerekebilir.

---

## 3. Gözlemlenebilirlik: filtreyi mümkün kılan koşul

Numerik form sorunu çözüldükten sonra gelen ikinci ölüm tuzağı **gözlemlenebilirlik**tir. Kalman filtresi, ne kadar iyi tasarlanmış olursa olsun, **ölçümlerin durumla ilgili yeterli bilgi taşımadığı bir sistemde** çalışmaz. Bu basit ifade pratikte çok az anlaşılır.

Tanım: Doğrusal sistem `x_{k+1} = F x_k`, ölçüm `z_k = H x_k` için gözlemlenebilirlik matrisi

$$
\mathcal{O} = \begin{bmatrix} H \\ H F \\ H F^2 \\ \vdots \\ H F^{n-1} \end{bmatrix}
$$

şeklinde tanımlıdır (`n` durum sayısı). Eğer `rank(O) = n` ise sistem **tamamen gözlemlenebilir**; aksi halde durum uzayında ölçümlerden ayırt edilemeyen bir alt-uzay vardır. Bu alt-uzayda Kalman filtresinin tahmini sürekli olarak bozulur ama `P` ne diyorsa o olur — filtre tutarsızlığı fark etmez.

Somut örnek: sabit ivmeli bir nesne, sadece **konum** ölçümleriyle takip ediliyor. Durum vektörü `[konum, hız, ivme]`, ölçüm matrisi `H = [1, 0, 0]`. Ayrık zamanlı durum geçişi

$$
F = \begin{bmatrix} 1 & T & T^2/2 \\ 0 & 1 & T \\ 0 & 0 & 1 \end{bmatrix}
$$

`O` matrisinin rankı 3'tür — sistem teorik olarak gözlemlenebilir. Buraya kadar her şey yolunda görünür. Ama pratikte iki problem var:

1. **Sayısal gözlemlenebilirlik**, teorik gözlemlenebilirlikten farklıdır. `O`'nun rankı 3 olabilir ama "etkin rank" (smallest singular value / largest singular value oranı kabul edilebilir bir eşiğin üstünde olan tekil değerlerin sayısı) çok düşük olabilir. Ölçüm zamanlamasının periyodu `T` küçüldükçe `O`'nun koşul sayısı patlar; ivme bileşeninin "gözlemlenebilirliği" sayısal olarak çöker. Filtreniz iyi ayarlı bile olsa, ivme tahmininin yakınsama süresi acı verici biçimde uzar.

2. **Ölçüm geometrisi**. INS/GPS entegrasyonu gibi gerçek sistemlerde gözlemlenebilirlik, aracın **manevra geometrisine** bağlıdır. Sabit hızla düz uçan bir uçakta IMU bias tahmini gözlemlenebilir değildir; manevra başladığı anda gözlemlenebilir hale gelir. Bu yüzden saha sınamalarında "kalibrasyon manevrası" diye bir aşama vardır: filtreyi gözlemlenebilir hale getiren özel manevralar (yere doğru hızlı bir burun aşağı + yana yatış kombinasyonu) yapılır ki bias tahminleri yakınsasın.

Pratik teşhis: filtreyi kurarken `cond(O)` hesaplayın. 10^6 üstündeyse durum vektörünüzü gözden geçirin — büyük olasılıkla ölçüm modeliniz, tahmin etmeye çalıştığınız bazı durumları "neredeyse hiç" görmüyor. Gerçek bir sistemde sık karşılaşılan örnek: 3 eksen ivmeölçer bias'ını sadece GPS pozisyonundan tahmin etmeye çalışmak. Düz uçuşta `Δbias` ile `Δgravity-projection` ayırt edilemez; filtreniz bir nedenle bu iki şeyi karıştırmaya başlar ve gerçek sebep sayısal gözlemlenebilirlikteki çöküştür.

---

## 4. Yanlış Q ve R ayarının anti-paterni

Sahada en sık gördüğüm hata şu döngüdür:

<div class="mermaid">
graph TD
    A[Filtre yavaş tepki veriyor] --> B[Q'yu büyüt]
    B --> C[Filtre artık çok gürültülü]
    C --> D[R'yi büyüt]
    D --> E[Yine yavaş tepki veriyor]
    E --> B
    style A fill:#ffe6e6
    style C fill:#ffe6e6
    style E fill:#ffe6e6
</div>

Bu döngü neredeyse her zaman temel bir yanlış anlamadan kaynaklanır: `Q` ve `R` filtreyi *ayarlama düğmesi* değildir; **gerçek sistemin gürültü istatistikleridir**. Doğru değerleri var; kâhinlik veya gözleme dayanmaz, **ölçüm**e dayanır.

**`R` için pratik yol:** Sensörü hareketsiz bırakıp uzun bir kayıt alın, ölçümlerin örneklem kovaryansını hesaplayın. Bu, `R`'nin ilk yaklaşımıdır. IMU'lar için ek olarak **Allan variance** analizi yapılır (IEEE Std 952 ve IEEE Std 1554 bu testleri standartlaştırır); Allan eğrisinin τ=1s civarındaki düşüş bölümünden "angle random walk" sayısı çıkarılır ve bu, sürekli zamanlı `R`'nin (veya süreç gürültüsünün düşük frekanslı bileşeninin) en iyi tahminidir.

**`Q` için pratik yol:** Süreç gürültüsü, durum geçiş modelinizin gerçek sistemin nasıl davrandığını ne kadar iyi yakaladığına bağlıdır. Sabit-hız modeliyle hızlanan bir aracı takip ediyorsanız, `Q` aslında **modelin sistematik hatasını** temsil eder; gerçek bir gürültü değildir. Bu durumda doğru olan `Q`'yu büyütmek değil, modeli "sabit ivme"ye yükseltmektir. Modelin doğru olduğu durumlarda `Q`, durum türetiminizdeki *fiziksel* gürültüyü (örn. ısıl mekanik titreşim, yakıt akışı varyasyonu) yansıtır ve bu da Allan variance'tan veya doğrudan ölçümden tahmin edilebilir.

**Tutarlılık testi: NIS (Normalized Innovation Squared).** Filtrenin Q ve R değerlerinin uyumlu olup olmadığını anlamanın en pratik yolu, innovation'ın istatistiğini izlemektir.

$$
\nu_k = z_k - H \hat{x}_k^-, \qquad S_k = H P_k^- H^T + R
$$

$$
\text{NIS}_k = \nu_k^T S_k^{-1} \nu_k
$$

Filtre tutarlıysa NIS, `m` serbestlik dereceli chi-kare dağılımına uyar (`m` ölçüm vektörünün boyutudur). 95% güven aralığı `[χ²_{0.025}(m), χ²_{0.975}(m)]` içinde kalmalıdır. Tek ölçüm boyutu (`m = 1`) için bu aralık yaklaşık `[0.001, 5.02]`'dir. NIS sürekli üst sınırı aşıyorsa: `R` çok küçük veya `Q` çok küçük (filtre kendini gerçekte olduğundan emin sanıyor). Sürekli alt sınırın altındaysa: tersi (filtre lüzumundan fazla mütevazi).

NIS testi sahada çalıştırırken bir uyarı: gözleminizin tek bir adımdaki değeri rastgeledir; bu yüzden uzun bir pencere (örn. son 100 örnek) üzerinden hareketli ortalama alın. Beklenen değeri `m`'dir. Hareketli ortalama `m`'in çok üzerindeyse — örneğin `3m`'i geçiyorsa — filtreniz tutarsız ve büyük olasılıkla ıraksıyor.

Bir adım daha gidip Monte Carlo simülasyonu yapabiliyorsanız **NEES (Normalized Estimation Error Squared)** testi daha güçlüdür:

$$
\text{NEES}_k = (x_k - \hat{x}_k^+)^T (P_k^+)^{-1} (x_k - \hat{x}_k^+)
$$

Bu test gerçek durumu (`x_k`) gerektirir, bu yüzden saha verisiyle değil yalnızca simülasyonla yapılır. `n` serbestlik dereceli chi-kare dağılımına uyar. NEES > NIS bir filtre için "altın kural" testtir; saha öncesi mutlaka koşturun.

---

## 5. EKF tuzağı: lineerleştirmenin sessiz hatası

Saf Kalman filtresi doğrusaldır. Gerçek sistemler nadiren doğrusaldır. Bu yüzden saha uygulamasında neredeyse her zaman **Extended Kalman Filter (EKF)** kullanılır: durum geçişi `x_{k+1} = f(x_k)` ve ölçüm modeli `z_k = h(x_k)` doğrusal olmayan fonksiyonlardır; her adımda mevcut tahmin `x̂_k` etrafında Jacobian matrislerine (`F_k = ∂f/∂x|_{x̂_k}` ve `H_k = ∂h/∂x|_{x̂_k}`) lineerleştirilir.

EKF iki yerden vurabilir:

1. **Jacobian hatası.** Karmaşık ölçüm modellerinde (örn. quaternion'lardan açı ölçümlerine, dünya-merkezli koordinatlardan radar menzil/azimut ölçümlerine geçiş) Jacobian'ı doğru türetmek zordur. Yanlış bir Jacobian filtrenin yakınsamasını engellemez — filtre yavaş ama düzgün davranır, sonra ölçüm geometrisi değişince patlar. Bu yüzden **Jacobian'ları nümerik olarak doğrulayın**: sembolik türettiğiniz Jacobian'ı, `(f(x+εe_i) - f(x-εe_i)) / (2ε)` merkezi farkla karşılaştırın. Her durum bileşeni `i` için. Bu test 10 satır kod alır ve hayat kurtarır.

2. **Lineerleştirme yetersizliği.** Çok kavisli bir manifold (örneğin SO(3) rotasyon grubu) üzerinde EKF, durum dağılımının ortalamasını ve kovaryansını eksik tahmin eder. Sıfır-ortalama Gauss varsayımı kavisli yüzeylerde geçerli değildir; ortalama gerçekte teğet uzayda değil, eğrinin "iç" tarafındadır. Kovaryans büyüdükçe (örn. uzun süre ölçümsüz kalan bir filtre) hata sistematik biçimde artar.

İkinci sorunun pratik çözümü **Unscented Kalman Filter (UKF)**'tir. Julier ve Uhlmann'ın 1997'de önerdiği bu yöntem, Jacobian hesaplamak yerine dağılımdan **sigma noktaları** (tipik olarak `2n+1` adet) seçer; bu noktaları doğrusal-olmayan fonksiyondan geçirir; çıktının ortalama ve kovaryansını hesaplar. Filtre güncellemesi geri kalan kısımda Kalman ile aynı kalır. Aynı hesaplama maliyetinde (Jacobian hesabı + matris çarpımları yerine `2n+1` fonksiyon değerlendirmesi) genellikle daha doğru ve kesinlikle daha basit kodludur — Jacobian türetmediğiniz için tüm "Jacobian hatası" kategorisi tamamen ortadan kalkar.

Tersine bir not: UKF, EKF'nin **bazı** problemlerini çözer ama numerik formun problemini değil. UKF'de de Joseph-eşdeğeri bir kovaryans güncellemesi vardır (sigma noktalarının ağırlıklı dış çarpımları + R) ve aynı simetri/pozitif-tanımlılık disiplinine ihtiyacı vardır.

---

## 6. Tanı kutusu: filtre ıraksadı mı?

Saha verisiyle çalışırken aşağıdaki kontrol listesi, filtrenin sessizce ıraksamış olup olmadığını saatler değil dakikalar içinde söyler.

| Test | Ne ölçer | Geçti / Kaldı eşiği |
|---|---|---|
| `cond(P)` izleme | `P` matrisinin koşullanması | < 10⁸ olsun; 10¹⁰'u geçerse uyarı |
| `min(eig(P))` izleme | Pozitif tanımlılık ihlali | > 0 olmalı; ≤ 0 ise filtre çoktan bozulmuş |
| `P` simetrisi | `||P - P^T||_F / ||P||_F` | < 10⁻⁶ olmalı |
| NIS ortalaması (100-pencere) | İnnovation tutarlılığı | `m`'ye yakın; > 3m kırmızı bayrak |
| NIS chi-kare aralığında kalma oranı | Uzun-dönem tutarlılık | %95'e yakın olmalı |
| İnnovation autocorrelation (lag 1..10) | İnnovation beyazlığı | Hepsi ±2/√N içinde olmalı |
| `cond(O)` (anlık) | Sayısal gözlemlenebilirlik | < 10⁶ olsun; aşan eksenleri rapor et |

Bu testlerin maliyeti birkaç matris çarpımıdır; gömülü uygulamada saniyede birkaç defa rahatlıkla koşturulur. Üretim filtrenizin yanına bir "sağlık monitörü" thread'i koyup bu değerleri loglayın. Bir gün bir manevra senaryosunda filtre tuhaf davrandığında, sebebi tahmin etmek yerine **veriyle** bulacaksınız.

Birkaç pratik son tavsiye:

- **Joseph form'u varsayılan kabul edin.** Performans optimizasyonu için "klasik forma geri dönmek" 1970'lerde mantıklıydı; bugün değil.
- **`P`'nin simetrisini her adımda zorlayın.** Joseph form ile bile, çok uzun süre çalışan bir filtrede `P ← (P + P^T) / 2` numarası "ücretsiz" bir güvenlik ağıdır.
- **Q ve R'yi sahanın seslerine kulak verirken ayarlamayın; ölçün.** Donmuş sensörle uzun kayıt + Allan variance, çoğu IMU/GPS senaryosunda doğru cevabı verir.
- **Saha testi sırasında NIS log'u tutmak ucuzdur; tutmamak pahalıdır.**
- **EKF Jacobian'larını mutlaka nümerik olarak doğrulayın.** Sembolik türetim hataları sessizdir.
- **Karmaşık nonlineer modellerde önce UKF deneyin.** Çoğu durumda EKF + Jacobian uğraşmaya değmez.
- **Filtrenin "kendinden çok emin" olduğu durumda durup soyut bir gözlemlenebilirlik analizi yapın.** Sayısal `cond(O)` veya `min(σ(O))` çoğunlukla nedeni anında söyler.

Kalman filtresi 1960'tan beri bizimle; matematiği çoktan oturmuş bir araç. Sahada gördüğümüz başarısızlıkların neredeyse tamamı, ders kitabının "ayrıntı" olarak geçtiği konularda (numerik form, gözlemlenebilirlik, Q/R tahmini, lineerleştirme) yapılan pratik hatalardır. Filtre tutarsızlığı *teşhis edilebilir* bir şeydir; tutarsız bir filtreyi sessizce yayına almak ise tasarımcının seçimidir.

---

## Kaynaklar

- Bucy, R. S., Joseph, P. D. (1968). *Filtering for Stochastic Processes with Applications to Guidance*. Interscience. (Joseph form'un kaynağı.)
- Anderson, B. D. O., Moore, J. B. (1979). *Optimal Filtering*. Prentice-Hall. (Joseph form ve sayısal kararlılık tartışması Bölüm 6.)
- Bierman, G. J. (1977). *Factorization Methods for Discrete Sequential Estimation*. Academic Press. (UD ayrıştırması ve kare-kök filtreler.)
- Maybeck, P. S. (1979). *Stochastic Models, Estimation, and Control, Vol. 1*. Academic Press. (Numerik kararlılık ve Q/R tuning üzerine klasik referans.)
- Bar-Shalom, Y., Li, X. R., Kirubarajan, T. (2001). *Estimation with Applications to Tracking and Navigation*. Wiley. (NIS / NEES tutarlılık testleri, Bölüm 5.)
- Simon, D. (2006). *Optimal State Estimation: Kalman, H∞, and Nonlinear Approaches*. Wiley. (Joseph form ve EKF/UKF karşılaştırması.)
- Groves, P. D. (2013). *Principles of GNSS, Inertial, and Multisensor Integrated Navigation Systems*, 2nd ed. Artech House. (Gözlemlenebilirlik ve manevra gereksinimleri, Bölüm 14.)
- Julier, S. J., Uhlmann, J. K. (1997). "A New Extension of the Kalman Filter to Nonlinear Systems." *Proc. SPIE*, Vol. 3068. (UKF'nin orijinal makalesi.)
- Mehra, R. K. (1970). "On the Identification of Variances and Adaptive Kalman Filtering." *IEEE Trans. Automatic Control*, 15(2): 175–184. (İnnovation autocorrelation testi.)
- IEEE Std 952-1997 (R2008). *IEEE Standard Specification Format Guide and Test Procedure for Single-Axis Interferometric Fiber Optic Gyros*. (Allan variance gyro karakterizasyonu.)
- IEEE Std 1554-2005. *IEEE Recommended Practice for Inertial Sensor Test Equipment, Instrumentation, Data Acquisition, and Analysis*. (Inertial sensör test prosedürleri.)

---
title: "ILS Anatomisi: Localizer 90/150 Hz DDM ve Glide Path Geometrisi"
subtitle: "Inside the ILS: DDM Math, Glide Path Geometry and False Beam Pitfalls"
background: "/img/posts/4.webp"
date: '2026-05-31 09:00:00'
layout: post
lang: tr
mermaid: true
---

Bir Cat IIIb iniş düşünün: Pist görüş mesafesi (RVR) 75 metre, bulut tabanı sıfır. Pilot pisti hâlâ göremezken otopilot 30 metreden aşağı süzülüyor, ana iniş takımları beton zemine dokunup süspansiyonun komprese olması saniyeden kısa bir sürede yaşanıyor. Kokpitte tek bir sayı, *deviation* göstergesi, uçağın metre cinsinden nerede durduğunu söylüyor. O sayı 0,02 puan hatalıysa uçak yan pist kenarı ışıklarına 7 metre yaklaşır; 0,1 puan hatalıysa hayat kurtaran "marjı" tamamen yer.

Bu yazı, otopilotun "0,02" diye okuduğu sayının nereden geldiğini anlatıyor. **ILS (Instrument Landing System)** üzerine Türkçe içerikte bulabileceğiniz çoğu kaynak ya pilot eğitiminden ödünç ("90 Hz fazla = sola dön") ya da ICAO Annex 10 Volume I'i parafraze ediyor. İkisi de mühendislik için yetersiz: birincisi sinyalin nasıl türetildiğini söylemiyor, ikincisi ise SARP (Standards and Recommended Practices) cümleleriyle dolup matematiği bir köşeye sıkıştırıyor. Aşağıda **CSB+SBO antenler**, **DDM (Difference in Depth of Modulation)** matematiği, **glide path geometrisi**, **sahte hüzme** (false glide slope) tuzakları ve **Cat I/II/III ayrımının** mühendislik karşılığını somut sayılarla işleyeceğiz.

---

## 1. ILS Neyi Çözer? — Geometri ile Başlamak

ILS'in görevi, son yaklaşma fazında uçağa iki sürekli açısal sapma sinyali üretmektir: **localizer** (yatay sapma, pist eksenine göre sol-sağ) ve **glide path** (dikey sapma, ideal süzülüş açısının üst-altı). Üçüncü bir öğe olan **marker beacon'lar** (75 MHz, outer/middle/inner) eskiden mesafeyi belirtmek için kullanılırdı; günümüzde çoğu pistte yerlerini **DME** (Distance Measuring Equipment) ve **GBAS** ek bilgisi almış durumda.

Sistemin temel ihtiyacı şudur: pist eşiğinin (threshold) 4-7 NM önünden başlayan bir koni içinde, uçağın ideal yörüngeden açısal sapması "sayısal olarak okunabilir" hâle getirilmeli. Sınırlar serttir. ICAO Annex 10 Volume I'e göre **Category IIIb** koşullarında:

- Karar yüksekliği (Decision Height): yok ya da 15 m altında.
- Pist görüş mesafesi (RVR): 75 m ile 175 m arası.
- Localizer kurs hatası tolerans bütçesi (95% probability, threshold üzerinde): **±4 m** mertebesinde.

Bu, sinyalin mühendislik tasarımına şunu dayatıyor: pist eşiğinde lateral 4 metrelik bir hatayı görmek için, eşikten yaklaşık 4 km öncesinde verilmiş açısal bir sinyale dayanıyorsunuz. Açısal karşılığı yaklaşık `4/4000 = 0,001 rad ≈ 0,057°`. Yani bütün bir sistem, **dakika yayı (arcminute) mertebesinde açısal hassasiyet** üretebiliyor olmak zorunda.

Bu noktada şu soru kritikleşiyor: bir antenin yaydığı RF sinyali okuyup bundan derece kesirleri çıkarmayı nasıl yapıyoruz? Cevap "frekans karşılaştırması yapmıyoruz" — VOR'da olduğu gibi taşıyıcının fazı kullanılmıyor. Onun yerine **modülasyon derinliği** kullanılıyor.

---

## 2. CSB + SBO: Aynı Frekansta İki Görev

Localizer vericisi 108–112 MHz bandında çalışır (sadece tek ondalıklı yüzlük frekanslar — `108,10`; `108,15`; `108,30` gibi). Glide path vericisi ise 329,15–335,00 MHz UHF bandında, ona eşlik eder; iki frekans havacılık kanal eşleştirme tablosunda birbiriyle ilişkilendirilmiştir, alıcı yalnızca VHF frekansını ayarlar ve UHF tarafını otomatik seçer.

ILS'in zekâsı, bu RF taşıyıcısının üzerine iki ses-frekansı tonu — **90 Hz** ve **150 Hz** — bindirmesinde değil; bunları **uzaysal olarak farklı şekilde dağıtmasında**. Mekanizma iki ayrı sinyal kompozisyonuna dayanır:

- **CSB (Carrier + Sidebands)**: Taşıyıcı, hem 90 Hz hem 150 Hz ile aynı derinlikte (her biri için `m = 0,20`, yani toplam %40 AM) modüle edilmiştir. Bu sinyal, pist ekseni boyunca simetrik bir antene verilir; kuş bakışı bir kosinüs yayılım deseni oluşturur.
- **SBO (Sidebands Only)**: Aynı 90 ve 150 Hz tonların yan bantları taşıyıcı olmadan üretilir. Bu sinyalin ilginç tarafı, antene **antifaz** olarak verilmesidir: pist ekseninin solunda 90 Hz baskındır, sağında ise 150 Hz aynı genlikle baskındır, ekseninde tam sıfırlanır.

CSB ve SBO sinyalleri aynı antene değil, **iki ayrı antene** verilir; bu antenlerin yayılım desenleri uzayda toplanır. Sonuçta uçağa erişen sinyalin matematiği şudur:

```
E(θ) = E_CSB · cos(πd/λ · sinθ) + E_SBO · sin(πd/λ · sinθ)
```

Burada `d` antenlerin merkez aralığı, `λ` taşıyıcı dalga boyu (≈ 2,7 m), `θ` pist ekseninden ölçülen açı. SBO antifaz olduğu için yatay sapma açısı `θ`'yla **işaret değiştirir**: solda 90 Hz baskın, sağda 150 Hz baskın.

Bu noktada önemli bir gözlem: alıcı, CSB ve SBO'yu ayrı sinyaller olarak ayırt etmez. Antenin **toplam** ürettiği AM sinyali demodüle eder, içinden 90 ve 150 Hz tonlarını filtreler, ikisinin tepe genliğini ölçer ve **derinlik farkına** bakar. İşte DDM tam burada doğar.

---

## 3. DDM Matematiği: 0,155 Sayısı Neden Bu Kadar Önemli

**DDM (Difference in Depth of Modulation)**, alıcıya gelen iki modülasyonun genlik farkının kesir olarak ifadesidir:

```
DDM = m_150 − m_90
```

burada `m_150` ve `m_90`, demodüle edilmiş sinyalde 150 Hz ve 90 Hz tonlarının modülasyon derinlikleri (taşıyıcı genliğine göre). Tanımı gereği DDM ±1 aralığında, **birimsiz** bir sayıdır. İşaret konvansiyonu localizer için "150 Hz baskınsa pozitif, 90 Hz baskınsa negatif"; glide path için "150 Hz baskınsa aşağıdasın, 90 Hz baskınsa yukarıdasın".

Sayısal olarak ezberlenmesi gereken iki eşik vardır:

- **Localizer tam sapma (full-scale deflection)**: `DDM = ±0,155`. Bu, alıcıdaki *Course Deviation Indicator* (CDI) iğnesinin maksimum sapmasına denk gelir.
- **Glide path tam sapma**: `DDM = ±0,175`.

Bu değerler keyfi değil — uçağın "kabul edilebilir koridorun" kenarına geldiğini gösteren mühendislik sınırlarıdır. Cat III otopilot servosu için DDM, doğrudan kontrol kanununun hata terimine girer; ana zincire katılır ve "0,02 puan" gibi alt-yüzdelik değerler ile uçağı sıralar.

Modülasyon derinliklerini somut tutalım. Pist ekseninde, CSB her iki tonu aynı `m = 0,20` derinlikle taşır, SBO bir miktar 90 ve aynı miktar 150 Hz katar ama ikisi de ekseni sıfır geçtiği için katkıları silinir. Sonuçta alıcıda `m_90 = m_150 = 0,20`, DDM = 0. Yana çıkıldıkça (örneğin 2,5° localizer çeşmesinde), SBO katkısı bir tonu artırıp diğerini azaltarak DDM'yi ±0,155'e iter. Aradaki değer **doğrusala yakın** — küçük açılarda `sin θ ≈ θ` yaklaşımıyla mühendislik için yeterince doğrusal.

Pratik bir hesap: kategorik bir Cat I localizer için **kurs duyarlılığı (course sensitivity)** spesifikasyonu, eşikte `107 m` lateral kaymanın `0,155 DDM`'ye denk gelecek şekilde ölçeklenir; bu da eşik bölgesinde yaklaşık `DDM = 0,00145 / metre` lineer eğimine karşılık gelir. Lokalize anteni eşikten örneğin `d = 3300 m` ötede ise, açısal eğim `0,00145 × 3300 ≈ 4,79 DDM/rad ≈ 0,0836 DDM/°` olur. Tam sapma 0,155 olduğuna göre, half-course-width `0,155 / 0,0836 ≈ 1,85°` çıkar. Daha kısa pistlerde aynı `107 m` toleransı daha geniş açıya yayılır; daha uzun pistlerde ise daha dar açıya sıkışır.

> **Mühendislik notu:** "Tam sapma açısı" pist ekseninden simetrik 5° genişliğinde bir koridor demek değildir. ICAO Annex 10 §3.1.3.7.3, `±0,155 DDM`'in pist eşiğinde `±107 m` lateral sapmaya denk gelecek biçimde ölçeklenmesini ister. Tam sapma açısı dolayısıyla `arctan(107 / d_eşik-localizer)` ile belirlenir; tipik pistlerde half-course-width `1,5° ile 3°` arasında, toplam kurs sektörü ise Annex 10 üst sınırı olan 6°'yi aşamaz.

---

## 4. Bir Localizer Yayılım Deseninin Geometrik Şekli

Yukarıda E(θ) için verdiğimiz birleşik elektrik alan denklemi, basitleştirilmiş "ideal iki anten" varsayımına dayanır. Gerçek bir localizer ışınsal dizisi (typically log-periodic veya köşe yansıtıcılı V-dipoles) 8-24 elemandan oluşur. Yine de prensip aynı: anten dizisi pist eksenini içerecek bir kosinüs benzeri **kurs (course) hüzmesi** ve onunla 90° antifaz bir **klereens (clearance) hüzmesi** üretir.

<div class="mermaid">
flowchart LR
    A[CSB üretici<br/>Carrier + Sidebands<br/>90 Hz @ 20%<br/>150 Hz @ 20%] --> AntCSB[CSB Anten Dizisi<br/>kosinüs deseni]
    B[SBO üretici<br/>Sidebands Only<br/>90 Hz - 150 Hz antifaz] --> AntSBO[SBO Anten Dizisi<br/>sinüs deseni - ekseni sıfır]
    AntCSB --> Boslukta((Uzayda toplanır))
    AntSBO --> Boslukta
    Boslukta --> Alici[Uçak Alıcısı<br/>AM demod<br/>90/150 Hz filtre<br/>DDM hesap]
</div>

Bu mimarinin neden seçildiğini anlamak için alternatifi düşünün: tek antenli, doğrudan iki yanı farklı modülasyonla yayan bir sistem. Böyle bir sistem sinyalin **uzaysal antifaz** özelliğini taşıyamaz; SBO'nun antifaz olması, yan loblarda DDM'nin işaretini ters çevirerek pilotu doğrudan pist eksenine çekmeyi sağlar. Tek antenli bir tasarımda yan loblar pilot için ölümcül belirsizlik kaynağı olur.

**Capture effect'in önemi:** Modern ILS alıcıları aynı kanalda iki vericiyi (örneğin biri zayıf yan kaynak) ayırt edemez. Pist seçim mantığı, daha güçlü sinyali baskınlaştırır; ama eşik (3 dB) altında karışım hataları doğar. Bu yüzden ICAO ILS *protection volume* tanımlar ve aynı bölgede ikinci bir vericinin frekans planlaması ile saatler süren saha testleri yapılır.

---

## 5. Glide Path: Aynı Prensip, Geometri Farklı

Glide path vericisi (genelde "glide slope" denir, terminoloji iki ismi de eş anlamlı kullanır) UHF'tedir (329–335 MHz, dalga boyu ≈ 90 cm). UHF tercih edilmesinin pratik sebebi: dikey yayılım için daha küçük antenler ve daha keskin yatay loblar daha kompakt bir antenle elde edilebiliyor.

Glide path'in temel geometrisi farklıdır. Bir **kapı sundurması** gibi yere dik 6-9 metre yüksekliğinde bir direğin üzerine yerleştirilen 2 veya 3 antenli bir dizilim, dik yönde DDM gradiyenti üretir. En yaygın iki mimarisi vardır:

- **Null-reference (NR) glide path**: İki anten, alttaki yere `H` yüksekliğinde, üstteki `2H` yüksekliğinde. CSB alttan, SBO üstten yayılır. Yer yansımalarının da denkleme dahil edilmesiyle "ayna anten" etkisi oluşur; nominal süzülüş açısı `θ_g = arcsin(λ / 4H)` formülüyle hesaplanır.
- **Image / Sideband-Reference glide path**: Yer iletkenliğini fazla varsaymadan çalışacak biçimde tasarlanır.

Bir örnek: 3° nominal süzülüş açısı için `H = λ / (4 sin 3°) = 0,91 / 0,209 ≈ 4,35 m`. Yani alt anten yerden ~4,35 m, üst anten ~8,70 m yükseklikte konumlandırılır. UHF antenlerin 4 m mesnetlerde tutulması mekanik açıdan görece kolay; aynı geometriyi VHF'de yapmak antenleri 16-17 m yükseğe çıkarırdı.

Nominal süzülüş açısı **çoğu büyük havalimanında 3°** olmakla birlikte, terenden veya engelden kaynaklı sınırlamalar olan pistlerde 3,5° hatta 4° tasarımları vardır. İniş hızı ve uçağın iniş takımı stres bütçesi `dh/dt = V_GS × sin θ_g` formülüne göre artar; 3° için 140 knot yer hızında bu değer ~750 ft/dak, 4° için ~1000 ft/dak — uçağın bu yüksek alçalma hızını yönetebilmesi için tip sertifikası uygunluğu gerekir.

---

## 6. Sahte Glide Path Tuzağı: Mühendislik İçin Karanlık Köşe

Glide path'in null-reference geometrisinin temel zaafı **sahte hüzmedir** (false glide slope). Nominal süzülüş açısı `θ_g`'ye ek olarak, `3θ_g`, `5θ_g`, `7θ_g`... gibi tek katlarda da DDM = 0 noktaları doğar. Yani 3° nominal hüzme için 9°'de ikinci bir "0 DDM" çizgisi bulunur ve **aynı yönde anlamlı bir glide slope sinyali yayar**.

Konsept önemli: pilot 9°'lik bir yörüngeden yaklaşıp glide slope iğnesi tam ortada görünüyorsa, sistem ona "doğru pisti yakaladın" der. Pist eşiğine vardığında ise uçak hesaplanandan üç kat fazla alçalma hızıyla pisti vurur. Tarihte birçok yaklaşma kazasında sahte glide slope yakalanması payı olmuştur; bu yüzden modern prosedürler şu kuralları getirir:

1. **Glide slope yakalama öncesi mutlaka belirli bir irtifa profilinden iniş**: Pilot, yaklaşma plakasında verilen *intercept altitude*'a uçağı stabil hâlde getirir; bu irtifa 9° hüzmesinin çok altında kalır.
2. **Alttan yakalama (capture from below)**: Stabil bir uçuş yörüngesi, yörünge altından glide slope hüzmesine girer; üstten yakalama yasaklıdır.
3. **DME / GBAS karşılaştırması**: Modern uçakların FMS sistemleri, GPS irtifasını ve DME mesafesini karşılaştırarak sahte hüzme yakalandığında **glide slope deviation flag** çıkarır.

False glide slope sayılarının kanıtı `H = λ / (4 sin θ)` formülünden gelir: hem `sin θ = λ/(4H)` hem `sin θ = 3λ/(4H)` denklemleri DDM = 0 verir; aralarındaki ilişki tek katlarda tekrar eder. Bu yüzden glide slope mühendisliği "ana hüzmenin SNR'sini yükseltmek" yerine "yan hüzmenin gücünü bastırmak" üzerine yoğunlaşır.

---

## 7. Cat I / II / III Ayrımı — Sertifikasyonun Mühendislik Karşılığı

Operasyonel kategoriler (Cat I, II, IIIa, IIIb, IIIc) pilotluk kitabında "karar yüksekliği ve RVR" ile tanımlanır:

| Kategori | Karar Yüksekliği (DH) | RVR (minimum) |
|----------|----------------------|---------------|
| Cat I    | 60 m (200 ft)        | 550 m         |
| Cat II   | 30 m (100 ft)        | 300 m         |
| Cat IIIa | 30 m altı            | 200 m         |
| Cat IIIb | 15 m altı            | 75–175 m      |
| Cat IIIc | yok                  | 0 m           |

Mühendis için bu rakamlar **sinyal bütçesinde** karşılığını bulur. ICAO Annex 10 her kategori için DDM tolerans bütçelerini tanımlar (örnekleme, gerçek SARP cümleleri için belgenin kendisi referans):

- Localizer kurs eğriliği (course bend amplitude) toleransı: Cat I için ±0,031 DDM (95%), Cat III için ±0,005 DDM (95%).
- Kurs hizalama hatası (course alignment): Cat I için ±10,5 m, Cat III için ±3 m.

Bu, donanım tasarımına çok somut bir yansır: Cat III sertifikalı bir localizer vericisinin **modülatör derinlik dengesi** binde 1 mertebesinde stabil olmalı, **anten dizisinin faz dengesi** birkaç derece içinde tutulmalı, **çift redundant izleme (M-array monitor) sistemleri** sürekli yayılan sinyalin her parametresini izleyip toleransa girdiğinde 1 saniye altında otomatik vericiyi devre dışı bırakmalıdır.

Cat III için ek olarak ICAO Annex 14 *runway visual range* gereksinimleri ve **TDM (Touchdown Zone Monitor)** ekipmanları, sistemin uçak iniş takımıyla pist beton zeminine temas ettiği bölgede de doğru sinyal verdiğini saha testleriyle kanıtlatır. Otopilot sertifikasyonu (kategorinin uçak tarafındaki ayağı) Boeing/Airbus için ayrı bir programdır; yer ve uçak tarafı birlikte sertifikalanır — buna **kombine ILS-otopilot ekosistem yaklaşımı** denir.

---

## 8. M-Array İzleme ve Yer Donanımının "İki Sigma" Tarafı

Bir Cat III localizer'ın yanında muhakkak iki ya da daha fazla **M-array near-field monitor** anteni bulunur. Bu antenler vericinin yaydığı sinyali pist hatasının `1-2 dB` mertebesinde temsil edecek şekilde örneklerler. İzleme zinciri, sinyalin **modülasyon derinliği, frekans, DDM, identity tonu (1020 Hz Morse kodu)** parametrelerini sürekli ölçer; toleransın dışına çıkarsa ana vericiyi anında devre dışı bırakır ve **standby** (yedek) vericisini devreye sokar. Toplam *yer sistemi göndergeç anahtarlama süresi* 1 saniyenin altında olmalıdır (Annex 10 SARP'ı bağlama göre değişen değerlerle yazar).

İzleme bantları aslında üç katmanlıdır:

1. **Executive monitor**: tolerans aşımında derhal vericiyi keser.
2. **Maintenance monitor**: tolerans yaklaştığında uzaktan bakım merkezine uyarı verir.
3. **Independent monitor**: Cat III için fiziksel olarak ayrı, bağımsız güç kaynağıyla beslenen ikinci bir izleme zinciri.

Bu üç katmanın olması, **common-mode failure** riskini bastırmak için. M-array izleyicisi bir yazılım hatası nedeniyle yanlış ölçüm yaparsa, bağımsız izleyici eklediğiniz Independent monitor'in fiziksel ayrımı sistemi yine durdurur. Mühendislik açısından, "iki sigma" yaklaşımı: hiçbir tek nokta arızası uçağın yanlış DDM almasına izin vermemelidir.

---

## 9. ILS'in Yerine Geçecek Sistemler: GBAS ve MMR

ILS, geometrik ve frekansal sınırlamaları olan bir sistemdir. Yerin engebeli olduğu pistlerde (örneğin İstanbul Sabiha Gökçen'in bir dönem 06 pistinde, dağ engellerinin yansımalarından kaynaklanan kurs eğrilikleri) ILS'in saha kalibrasyonu pahalıdır; bazı pistlerde Cat II/III'e çıkmak fiziksel olarak imkânsızdır. Ek olarak ILS frekansları FM yayın bandının (88-108 MHz) hemen üzerinde olduğundan, kuvvetli FM vericilerinin alıcıda *intermodulation* girişimleri yaratması bilinen bir problemdir; ICAO Annex 10 ek B FM girişim toleransını tanımlar.

Bu sınırlar nedeniyle **GBAS (Ground-Based Augmentation System)** geleneksel ILS'in yerini almak için 1990'lardan beri geliştiriliyor. GBAS, GPS düzeltme verilerini VHF Data Broadcast üzerinden uçağa yollar; uçak kendi yörüngesini hesaplar. Bir GBAS vericisi pisti ve aynı havalimanındaki *birden çok* pisti aynı anda destekleyebilir; ILS pist başına bir verici çifti ister. Sertifikasyon ilerlemesi yavaş olsa da Cat I GBAS işletime girmiş, Cat III hedefliyor.

Uçaklarda iki sistemi de okuyabilen **MMR (Multi-Mode Receiver)** standart hâline geliyor: ILS, GBAS, VOR, GPS hatta MLS yetkinliklerini tek kutuda topluyor. Yani mühendis için ILS yakın gelecekte sönmeyecek, ama yedek bir teknoloji olarak yaşamaya devam edecek.

---

## 10. Mühendise Pratik Notlar

Bir aviyonik LRU mühendisi olarak ILS donanımıyla çalışırken aklınızda tutmanız gereken birkaç şey:

1. **Demodülasyon zincirinin doğrusallığı**: AM demodülatörünün çıkışındaki harmonik bozulma DDM hesabını doğrudan etkiler. `0,2 + 0,2 = 0,4` mertebesinde toplam modülasyon ile çalıştığınızı unutmayın; harmonik bozulma `-50 dBc` mertebesinin altında tutulmalı.
2. **Bant geçişli filtreler**: 90 ve 150 Hz tonlarını dar geçiş bandı (Q ≈ 30) ile geçirin. Geniş filtreler güç hattı 50/60 Hz girişimini içeri alır; o frekansların yan bantları DDM'yi puanın binde biri ölçüsünde yanlı çekebilir.
3. **AGC tepki süresi**: ILS sinyali yaklaşırken alıcının AGC'si (Automatic Gain Control) hızlanır; AGC eğer aşırı tepki verirse `m_90` ve `m_150` ölçümlerine farklı zaman sabitleri girer, DDM'de spurious sapma görürsünüz. Tipik tasarım, AGC bant genişliğini 5 Hz'in altında tutar.
4. **Sıcaklık ve nem stabilitesi**: Cat III sertifikasyonu için verici donanımı `−40 °C ile +55 °C` arasında DDM toleranslarını koruyabilmeli. Modülatör bileşenlerinin sıcaklık katsayısı kritiktir; yapay zekâ ile değil, sıkı bileşen seçimi ve sıcaklık döngüsü testleriyle çözülür.
5. **Saha kalibrasyonu (flight inspection)**: Bir ILS sahaya kurulduktan sonra, ICAO Annex 10'a uygun bir *flight inspection* uçağı (genelde Beechcraft King Air sınıfı, özel kalibre alıcı ekipmanlı) sinyal bütçesini havadan ölçer. Bu süreç bir kategorinin sertifikalanması için kritik; üreticisi olarak donanımınızın saha varyasyonlarına dayanması (toprak iletkenliği, mevsimsel yansımalar) tasarım gereksinimidir.

---

## 11. Açık Sorular ve İleri Okuma

- **GBAS'ın Cat III geçiş eğrisi:** ICAO ve EUROCAE WG-28 üzerinden GBAS-CAT III ilerlemesi hangi noktada? FAA SLS-4000 sistemi pratik servise nasıl giriyor?
- **5G C-band komşuluğu ve radar altimetre:** FCC tarafından servise alınan 3.7-3.98 GHz 5G C-band yayını, hemen üstündeki 4.2-4.4 GHz radar altimetre bandının komşuluğunda yer alıyor; geçiş bandı izolasyonu yetersiz altimetreler bazı havalimanlarında otoland işletim sınırlamalarına yol açtı. ILS Cat III prosedürleri radar altimetre verisini *radio height* için kullandığından bu zincirin uçtan uca emniyet bütçesi nasıl tutuluyor?
- **MLS'in kısa ömrü:** 1980'lerin "ILS yerine" diye sunulan Microwave Landing System, neden çoğu havalimanına girmeden hayata veda etti? RF mühendisliği açısından dersler.
- **İklim ve buz:** Glide path direklerinde biriken buzun yansıma desenine etkisi hangi tolerans bütçesinde modellenir? Norveç havalimanlarındaki saha verileri kamuya açık raporlarda mevcut mu?

---

## Kaynaklar

- ICAO. *Annex 10 to the Convention on International Civil Aviation — Aeronautical Telecommunications, Volume I: Radio Navigation Aids*. Yedinci basım (2018) ve değişiklikleri. <https://www.icao.int/safety/airnavigation/Pages/annexes.aspx>
- FAA. *AC 120-28D — Criteria for Approval of Category III Weather Minima for Takeoff, Landing, and Rollout*. <https://www.faa.gov/regulations_policies/advisory_circulars/>
- FAA. *Order 8200.1D — United States Standard Flight Inspection Manual*. <https://www.faa.gov/documentLibrary/media/Order/Order_8200.1D.pdf>
- ICAO. *Doc 8071, Volume I — Manual on Testing of Radio Navigation Aids: Testing of Ground-based Radio Navigation Systems*. Beşinci basım. <https://www.icao.int/publications/Pages/catalogue.aspx>
- EUROCAE. *ED-46B / RTCA DO-195 — Minimum Operational Performance Standards for Airborne ILS Glide Slope Receiving Equipment*. <https://www.eurocae.net>
- EUROCAE. *ED-47C / RTCA DO-192 — MOPS for Airborne ILS Localizer Receiving Equipment*. <https://www.eurocae.net>
- Kayton, M., Fried, W. R. (eds.). *Avionics Navigation Systems*, 2. baskı, Wiley-Interscience, 1997. Bölüm 13: ILS ve MLS.
- Rinaldi, M. *Instrument Landing Systems: Principles, Operation, and Design*. Artech House (2019).
- ICAO. *Doc 9849 — GNSS Manual* ve *Doc 9905 — Required Navigation Performance Authorization Required (RNP AR) Procedure Design Manual* (GBAS/CAT III ilerlemesi için).
- FAA. *Roadmap for Performance-Based Navigation* ve *FAA NextGen GBAS Program Updates*. <https://www.faa.gov/air_traffic/technology/gbas/>
- Federal Communications Commission. *Order on Reconsideration in WT Docket No. 19-348* (3.7 GHz Band — 5G ve radar altimetre koordinasyonu). <https://www.fcc.gov/document/fcc-resolves-c-band-5g-aviation-interference-issues>

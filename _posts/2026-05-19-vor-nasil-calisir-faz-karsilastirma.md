---
title: "VOR Nasıl Çalışır? 30 Hz Faz Karşılaştırması ve DVOR Geometrisi"
subtitle: "How VOR Works — 30 Hz Phase Comparison and DVOR Geometry"
background: "/img/posts/2.webp"
date: '2026-05-19 09:00:00'
layout: post
lang: tr
mermaid: true
---

VOR (VHF Omnidirectional Range) muhtemelen havacılığın en yanlış anlaşılan radyo seyrüsefer yardımcısıdır. Pek çok pilot, mühendislik öğrencisi ve hatta sistem mühendisi VOR'u "uçağın yönünü bulan bir cihaz" olarak hatırlar. Oysa VOR ne uçağın yönüne bakar ne de sinyalin geliş açısını ölçer. Yaptığı tek şey, iki adet 30 Hz sinyal arasındaki **faz farkını** ölçmektir. O kadar.

Bu basit gerçek, VOR'un neden 80 yıl boyunca havacılığın belkemiği olduğunu, neden GPS kesintilerine karşı FAA'in MON programı kapsamında yaklaşık 580 istasyonunu canlı tutmaya devam ettiğini ve özellikle Doppler VOR (DVOR) anten dizisinin neden yaklaşık 44 fit çapında olduğunu anlamak için anahtardır. Bu yazıda VOR sinyalini katman katman açacağız, CVOR ile DVOR arasındaki rol değişimini göstereceğiz ve DVOR halka geometrisinin tek bir Doppler denkleminden nasıl çıktığını adım adım türeteceğiz.

---

## VOR Yön Bulmaz, Faz Karşılaştırır

Bir radar veya ADF (Automatic Direction Finder), antenin **fiziksel yönelimine** ya da kompozit sinyal güç farkına bakarak geliş açısı kestirir. ADF'nin loop anteni iki dipol arasındaki sinyal güç farkını kullanır; loop'un alanı sinyalin geldiği yönle birlikte değişir ve aletin iğnesi en güçlü sinyal yönünü işaretler.

VOR bunu yapmaz. Bir VOR alıcısı:

- antenin **yönüne** bakmaz,
- uçağın **başlığına** (heading) bakmaz,
- sinyalin **geliş açısına** bakmaz.

Bunlar yerine sadece iki adet 30 Hz alçak frekans sinyalini demodüle eder ve fazlarını karşılaştırır. Bu faz farkı, **istasyondan uçağa olan manyetik yatay açıyı** verir. Yani VOR'un uçağa söylediği şey "ben sana göre 234° kerterizinden bakıyorum, sen de bana göre 054° radial üzerindesin" gibi bir cümledir; uçağın hangi yöne baktığını dahi bilmeden.

Bu yanılgıyı bir kenara bıraktığımızda VOR'un ne menem bir sistem olduğunu anlatmak çok daha kolaylaşır.

---

## Kısa bir Tarihçe

VOR, II. Dünya Savaşı sonrası ICAO çatısı altında standartlaştırılan ilk VHF radyo seyrüsefer sistemidir. Erken kerteriz sistemleri (LF/MF aralığında çalışan NDB, Adcock direction finder, ABD ordusunun SCS-51 ekipmanı) ya düşük dalga boyları nedeniyle atmosferik gürültüye açıktı ya da çözünürlükleri çok kabaydı. 1940'ların sonunda geliştirilen VOR, VHF bandının (108.00–117.95 MHz) sağladığı dar bant, line-of-sight propagasyon ve elektronik faz ölçümü imkânlarını birleştirerek bu sorunları çözdü ve uzun yıllar değişmeden kaldı.

Yıllar içinde VOR'un mekanik antenli **konvansiyonel** versiyonu (CVOR) yerini, çevre engellerinden çok daha az etkilenen **Doppler** versiyonuna (DVOR) bırakmaya başladı. Bugün dünya genelinde her iki tip de saha üzerindedir; FAA, GPS yedek navigasyonu için yaklaşık 580 VOR istasyonunu 2030'a kadar **Minimum Operational Network** (MON) altında tutmayı planlıyor.

Türkiye'de de durum benzer: büyük havalimanlarının çoğu DVOR'a sahip, bazı meydanlar hâlâ CVOR ile çalışır. Aviyonik mühendisliği eğitimi alan herkesin önünde er ya da geç bir VOR alıcı modülü tasarımı, bir RNAV transition entegrasyonu veya bir VOR tabanlı yaklaşma testi belirir.

---

## CVOR: Tek Cümleyle Mekanik Sır

CVOR'un tek cümlelik özeti şudur: yeryüzünde bir kardiyoid (yarım armut şeklinde) anten paterni saniyede 30 kez döner; uçak da bu paternin oluşturduğu **30 Hz amplitüd modülasyonunu** dinler.

Hayal edelim: yerde, ortada izotrop yayan bir taşıyıcı (carrier) anteni vardır. Onun etrafında bir kardiyoid alan paterni vardır ve bu patern saniyede 30 kez (yani 1800 rpm hızla) döner. Bir uçak istasyonun doğusunda durduğunda, kardiyoidin "şişkin" yönü doğuya geldiğinde sinyal güçlü, batıya geldiğinde ise zayıf alır. Sonuç: alıcıda doğal olarak **30 Hz amplitüd modülasyonu (AM)** oluşur. Bu sinyal **VAR** (variable phase) olarak adlandırılır.

VAR sinyalinin fazı uçağın istasyona göre konumuna bağlıdır:

- Manyetik kuzeyde duran uçak, kardiyoidin kuzey hizasına geldiği anda maksimum sinyal görür.
- Doğuda duran uçak, paternin kuzey hizasına gelmesinden 1/4 dönüş (90°) sonra maksimum sinyal görür.

Yani VAR sinyalinin fazı, doğrudan **radial**'e karşılık gelir. Tek başına VAR yetmez; bir referans gerekir ki uçak "şimdi paternin sıfır radiali oluştu" anını bilsin. İşte burada **REF** sinyali devreye girer.

CVOR'un fiziksel sırrı şudur: REF sinyali taşıyıcı üzerinde başka bir kanalda taşınır — 9960 Hz'lik bir **alt-taşıyıcıda** (subcarrier), **frekans modülasyonu** ile.

### Sinyal yapısı: kompozit baseband

CVOR taşıyıcısı (örnek olarak 114.5 MHz) aşağıdaki kompozit baseband sinyalini **amplitüd modülasyonu** ile taşır:

| Bileşen | Frekans | Açıklama |
|---|---|---|
| VAR | 30 Hz | Antenin dönen paterninden doğal olarak oluşan AM zarfı |
| Subcarrier | 9960 Hz | İçinde REF'i taşıyan FM modüleli ara taşıyıcı |
| Morse ID | 1020 Hz | İstasyonun üç harfli kodunun morse'u |
| Voice | 300–3000 Hz | İsteğe bağlı sesli yayın (ATIS, Volmet) |

9960 Hz alt-taşıyıcısının kendisi de bir 30 Hz işaretle frekans modülelidir: **±480 Hz** deviasyon ile. Bu içindeki 30 Hz işaret REF'tir. REF'in özelliği, antenin nerede olduğundan **bağımsız** olmasıdır — radyo dünyasına bir kez yayılır ve manyetik kuzey ile **tam aynı fazda** olur.

<div class="mermaid">
graph TD
    A[VHF Carrier<br/>108-117.95 MHz] -->|AM| B[30 Hz VAR<br/>rotating pattern]
    A -->|AM| C[9960 Hz Subcarrier]
    A -->|AM| D[1020 Hz Morse ID]
    A -->|AM| E[300-3000 Hz Voice]
    C -->|FM ±480 Hz| F[30 Hz REF<br/>aligned with mag. north]
</div>

Aralarda neden bu kadar boşluk var? Çünkü hem alıcının basit filtrelerle ayırabilmesi hem de bileşenlerin spektrumda çakışmaması gerekir:

- VAR: 0–30 Hz dolayı
- Voice: 300–3000 Hz
- Morse ID: 1020 Hz dolayı
- Subcarrier: 9960 ± 480 Hz, yani 9480–10440 Hz aralığı

Bu spektral plan ICAO Annex 10 Volume I'de standartlaştırılmıştır; rastgele seçilmemiştir. Her bileşenin diğer bileşenlerden net biçimde ayrılabilmesi için frekans aralıkları kasıtlı olarak geniş tutulmuştur.

---

## Faz Karşılaştırması: Radyalin Türetimi

Şimdi gerçek matematiğe gelelim. Uçaktaki VOR alıcısı:

1. Carrier'ı AM demodüle eder; baseband elde eder.
2. Baseband'ten 30 Hz alçak geçiren filtre ile **VAR**'ı çıkarır.
3. Baseband'ten 9510–10410 Hz bantgeçiren filtre ile subcarrier'ı çıkarır; ardından **FM** demodüle eder ve **REF**'i elde eder.
4. İki adet 30 Hz sinyal arasındaki **faz farkını** ölçer.

Matematik şöyle tanımlanır. REF, manyetik kuzeye sabit olan bir referans sinyaldir. Bunu temel alalım:

```text
s_REF(t) = cos(2π · 30 · t)
```

VAR, antenin patern dönüşünden kaynaklı AM zarfıdır ve **uçağın bulunduğu radiale göre kaymıştır**. Eğer uçak θ radialinde ise:

```text
s_VAR(t) = cos(2π · 30 · t − θ)
```

Yani VAR, REF'i θ kadar geriden takip eder. Uçaktaki alıcının ölçtüğü faz farkı:

```text
Δφ = arg(s_VAR) − arg(s_REF) = −θ   (mod 360°)
```

Pratikte alıcı bunu pozitif değere normalize eder ve doğrudan **radial** olarak okuyucuya verir. Sayısal örnek:

| Uçak konumu | VAR-REF faz farkı | Radial |
|---|---|---|
| Tam kuzey | 0° | R-360 (R-000) |
| Doğu | 90° | R-090 |
| Tam güney | 180° | R-180 |
| Batı | 270° | R-270 |

Bu sayede VOR, hiç bir anten dizisi (array) veya yön bulma (DF) tekniği kullanmadan, sadece **iki sinyalin faz farkından** uçağın bulunduğu radyali çıkarır. Uçağın hangi yöne baktığı tamamen ilgisizdir.

### "OBS'yi 090'a aldım, neden iğne hareket etmiyor?"

OBS (Omni Bearing Selector) pilotun aletin önüne girdiği "hedef radial"dir. CDI iğnesinin hareketi, alıcının hesapladığı **gerçek faz farkı** ile OBS'nin gösterdiği **istenen faz farkı** arasındaki sapmadır. Yani iğne aslında bir faz hata göstergesidir; pilotun ne yöne baktığıyla zerre ilgisi yoktur.

Bu, "VOR yön bulur" zannının pratikte yarattığı en yaygın yanılgıdır: bir öğrenci pilot uçağı kuzeye çevirip CDI'a bakar, iğne ortada değildir, öğrenci uçağı sağa-sola çevirip iğnenin ortalanmasını bekler. Hiçbir şey değişmez — çünkü VOR alıcısı uçağın yönünden habersizdir; uçağı yere koysanız, kuyrukla burnu yer değiştirseniz dahi aletin gösterdiği radial aynı kalır.

---

## DVOR: Roller Tersine Dönerken

CVOR'un fiziksel sırrı (mekanik döner anten paterni) aynı zamanda en büyük zayıflığıdır. Antenin kardiyoid paterni civardaki binalar, ağaçlar, tepeler ve hatta park edilmiş büyük uçaklar tarafından bozulur. Bu da **scalloping** denen radyal salınımına ve yer seçimi (siting) açısından zor kısıtlara yol açar. CVOR konuşlandırılırken yakınında belirli bir yarıçap içinde ne yapı, ne yüksek araç, ne de geniş düz metal yüzey istenir.

DVOR (Doppler VOR) bu problemi şu numara ile çözer: **VAR ile REF'in rolünü tersine çevirir.**

DVOR'da:

- 30 Hz **REF**, taşıyıcı üzerinde **doğrudan AM** ile gönderilir (tüm radyallerde aynı, antenden bağımsız).
- 30 Hz **VAR**, 9960 Hz alt-taşıyıcının **FM modülasyonu** gibi *görünür* — ama aslında **Doppler etkisinden** üretilir.

DVOR bu "FM gibi görünen" subcarrier'ı nasıl yaratır? Yapay bir FM modülatörü kullanmaz; bunun yerine **iki adet karşılıklı dönen anteni** (taşıyıcıdan ±9960 Hz ofset taşıyıcılarla beslenen iki yan-bant antenini) bir dairesel anten dizisi üzerinde "döndürür". Antenler bir dairesel halkanın çevresinde sıralanmıştır ve elektronik olarak sırayla aktive edilir; öyle ki saniyede 30 kez tam tur dönen iki sanal kaynak izlenimi verirler.

Antenler döndüğü için aralarındaki **radyal hız** (uçağa yaklaşma/uzaklaşma hızı) sinüsoidal olarak değişir. Bu da yan-bant frekansının saniyede 30 kez salındığı anlamına gelir. Sonuç: alıcıya gelen 9960 Hz yan-bant aslında zamanla salınımlı bir frekans kayması yaşamış olur; alıcı bunu **9960 Hz alt-taşıyıcının FM modülasyonu** olarak yorumlar. Hiçbir donanım değişikliği gerekmez — CVOR ya da DVOR, alıcı için fark etmez.

Faz, antenin bulunduğu radyal pozisyona göre belirlenir; CVOR ile aynı sonuç: aynı alıcı, aynı bearing okur.

### Halka Çapı Neden 44 Fit?

Şimdi DVOR'un en zarif tarafı: anten halkasının çapı keyfi değildir. Tüm sistemin **±480 Hz deviasyon** spesifikasyonuna uyması için belirli bir geometriye ihtiyaç vardır. Bu geometriyi tek bir Doppler denkleminden türetebiliriz.

Dönen bir kaynağın yarattığı maksimum Doppler kayması:

```text
f_d = (v_radial_max / c) · f_c
```

Kaynağın halka üzerindeki teğetsel hızı:

```text
v = ω · r = 2π · f_rot · r
```

burada `f_rot = 30 Hz`, `r` ise halkanın yarıçapıdır.

`f_d = 480 Hz` hedefi ve VHF bandının orta noktası `f_c ≈ 113 MHz` alınırsa:

```text
r = (f_d · c) / (2π · f_rot · f_c)
  = (480 · 3×10⁸) / (2π · 30 · 113×10⁶)
```

Adım adım çözelim:

```text
Pay  = 480 × 3×10⁸ = 1.44×10¹¹
Payda = 2π × 30 × 113×10⁶ ≈ 2.13×10¹⁰
r ≈ 6.76 m
```

Çap ise:

```text
D = 2r ≈ 13.5 m ≈ 44.3 ft
```

Yani DVOR halkasının 44 fit çapı **fizik kaynaklıdır**, mühendislerin keyfi bir seçimi değildir. Spesifikasyondaki ±480 Hz deviasyon ve 30 Hz dönüş hızı birlikte, VHF bant ortalamasında bu çapı zorunlu kılar.

Bant kenarlarında küçük sapmalar olur:

| Taşıyıcı | Hesaplanan çap | Yaklaşık fit |
|---|---|---|
| 108 MHz (bant alt) | 14.15 m | 46.4 ft |
| 113 MHz (orta) | 13.51 m | 44.3 ft |
| 118 MHz (bant üst) | 12.96 m | 42.5 ft |

Üreticiler farklı taşıyıcı frekansları için ufak düzeltmeler (tipik olarak güç ya da faz dengeleme) uygular ama mekanik tasarım sabit ~44 fit etrafında dolaşır. Uygulamada 48 ila 52 anten dairesel olarak yerleştirilir, iki diametrik anten aynı anda aktif tutulur (biri üst yan-bant, biri alt yan-bant) ve elektronik komütasyon ile saniyede 30 kez dönen "sanal anten çifti" oluşturulur. Bu yapı, ortasında taşıyıcı anteni bulunan tipik DVOR fotoğraflarının matematiksel sebebidir.

### Neden DVOR Daha Doğru?

DVOR'un üstünlüğü, VAR'ı yan-bant antenlerinin **fiziksel rotasyonundan** üretmesinden gelir. Multi-path etkisiyle dolaylı yoldan gelen yan-bantlar, geliş açıları farklı olduğu için aynı anda farklı Doppler kayması taşır ve uçak alıcısında **birbirini kısmen söndürür**. Diğer yandan REF, doğrudan AM ile gönderildiği için Doppler kaymasından etkilenmez. Sonuç olarak scalloping (radyal salınımı) ve diğer multipath kaynaklı hatalar tipik olarak CVOR'un yaklaşık yarısı seviyesinde kalır.

Bunun bedeli: DVOR halkası daha büyük, daha pahalı, daha karmaşık elektronik anahtarlamalı sistemler ister. Ama özellikle dağlık, engebeli veya yapı-yoğun bölgelerde bu maliyet hızla kendini amorti eder.

---

## CVOR vs DVOR: Karşılaştırma

| Özellik | CVOR | DVOR |
|---|---|---|
| REF taşınma şekli | 9960 Hz FM alt-taşıyıcı | Doğrudan AM |
| VAR taşınma şekli | 30 Hz doğrudan AM (patern dönüşünden) | 9960 Hz FM gibi *görünen* sinyal (Doppler'dan) |
| Anten | Tek ızgara veya Alford loop, mekanik/elektronik patern dönüşü | 48–52 dairesel anten + merkez taşıyıcı anten |
| Halka çapı | — | ~13.5 m (~44 ft) |
| Scalloping hatası | ±2° aşılabilir | Tipik olarak yarısı veya daha az |
| Siting hassasiyeti | Yüksek | Düşük |
| Maliyet | Düşük | Yüksek |
| Tipik kullanım | Düşük trafikli, açık araziler | Yüksek trafikli havalimanları, engebeli arazi |

Önemli nokta: **alıcı her iki tipi de aynı şekilde okur**. Pilot ya da uçak elektroniği DVOR mu CVOR mu kullandığını bilmez, bilmesi de gerekmez. Her iki ground station da uçağa giden tasviri aynı şekilde sunar — sadece o tasviri yaratmak için kullanılan fiziksel mekanizma farklıdır.

---

## Hata Kaynakları ve Sınırlar

VOR mükemmel değildir; aşağıdaki sistematik ve rastsal hata kaynaklarını taşır.

**Scalloping (saçak hatası).** Civardaki engeller (binalar, dağlar, büyük uçaklar) sinyali yansıtır; alıcı çoklu yansımanın bileşkesini okur ve radyal salınır. ICAO standardına göre ±2° aşılmamalıdır ama dağlık arazide kolayca aşar.

**Cone of confusion (kafa karışıklığı konisi).** Yatay anten paterni dikey yönde zayıf yayılım yapar. VOR'un tam üzerinde uçtuğunuzda alıcı kararsızlaşır — birkaç saniyeliğine OFF bayrağı gösterir veya rastgele radial atar. Bu koni tipik olarak istasyon üzerinde yaklaşık ±60° açılıkta uzanır; kötü hava koşullarında bunu unutmak uçağı düz olmayan birkaç saniye için "kör" bırakır.

**Line-of-sight kısıtı.** VHF propagasyonu görüş hattıyla sınırlıdır. Standart radyo ufku formülü:

```text
d_NM ≈ 1.23 · √h_ft
```

Buna göre 1000 ft yükseklikteki bir uçak yaklaşık 39 NM, 10 000 ft'teki bir uçak yaklaşık 123 NM uzaklıktaki bir VOR'u alabilir.

**Multipath ve terrain bounce.** DVOR bu problemi azaltır ama tamamen ortadan kaldırmaz.

**Polarizasyon.** VOR yatay polarizedir. Yatkın anten kayma açısı (bank angle) büyük olduğunda alım zayıflar — özellikle dik dönüşlerde pilotlar bunu görür.

---

## Alıcı Tarafı: Pratik Bir Sinyal İşleme Hattı

Modern bir aviyonik VOR alıcısı genellikle direkt-dönüştürme (zero-IF) veya düşük-IF mimarisi kullanır; analog filtreler yerini sayısal işlemcilere bırakmıştır. Alıcı zincirinin minimum mantıksal blokları şunlardır:

<div class="mermaid">
graph LR
    A[VHF Antenna] --> B[LNA + Bandpass<br/>108-118 MHz]
    B --> C[Mixer + LO<br/>down-conversion]
    C --> D[AM Envelope<br/>Detector]
    D --> E[30 Hz LPF<br/>VAR]
    D --> F[9480-10440 Hz BPF<br/>Subcarrier]
    F --> G[FM Demodulator]
    G --> H[30 Hz LPF<br/>REF]
    E --> I[Phase Detector]
    H --> I
    I --> J[Bearing<br/>0-360]
    D --> K[ID / Voice<br/>Audio Path]
</div>

Sayısal uygulamada VAR ve REF, yeterli örnekleme hızında alınmış birer kompleks sinyal olarak temsil edilir; faz farkı bir Goertzel filtresi veya kısa bir DFT ile çıkarılır. Aşağıdaki Python referansı 30 Hz tek-tonlu bir DFT ile faz farkı hesaplar — uygulamada Goertzel daha verimlidir, ama matematiksel açıdan aynı şeyi yapar:

```python
import numpy as np

def vor_bearing(var_samples, ref_samples, fs):
    """Faz farkından VOR radyalini hesapla.

    var_samples, ref_samples: 30 Hz sinyallerden bir periyot örnek
    fs: örnekleme frekansı (Hz)
    Returns: radial (derece, 0-360)
    """
    N = len(var_samples)
    t = np.arange(N) / fs
    twiddle = np.exp(-1j * 2 * np.pi * 30 * t)

    var_phasor = np.sum(var_samples * twiddle)
    ref_phasor = np.sum(ref_samples * twiddle)

    delta_phi = np.angle(var_phasor / ref_phasor)
    return np.degrees(-delta_phi) % 360
```

30 Hz tek tonlu bir hedefin gürültü içinde tespiti son derece dar bantlı bir filtre gerektirir; bu yüzden VOR alıcıları integrasyon süresi (genelde 1–2 saniye) ile gürültüyü bastırır. Bu da uçağın **CDI** ekranındaki gözle görülür "yumuşak" tepki süresinin sebebidir; alıcı anlık değil, sürekli ortalamalı bir bearing üretir. Hızlı manevralar sırasında iğne hareketinin biraz geriden gelmesi bir hata değil, tasarımın gereğidir.

---

## VOT: Servis Atölyesinde VOR'a Soru Sormak

Havalimanlarında zaman zaman karşınıza çıkacak özel bir VOR tipi vardır: **VOT** (VOR Test Facility). Bu istasyon tek bir şey yapar — **tüm radyallere R-360 yayınlar**. Yani alıcı VOT sinyalini aldığında, uçağın havalimanı içinde nerede park ettiğinden bağımsız olarak alet 360° göstermek **zorundadır**.

Sapma genelde ±4° sınırının altında olmalıdır (FAA standardı; bölgesel farklar vardır). Pilot ya da bakım teknisyeni bunu uçağı hiç kıpırdatmadan, sadece OBS'yi çevirerek doğrulayabilir: OBS 360'a alındığında iğne ortada olmalı; OBS 180'e alındığında "FROM" yerine "TO" göstermeli ve iğne yine ortada olmalıdır.

VOT, alıcı doğruluk testi için zarif bir kalibrasyon noktasıdır ve havacılığın az bilinen ama harika bir mühendislik detayıdır.

---

## VOR'un Geleceği: GPS Sonrası Bir Senaryo

VOR resmen "ölü teknoloji" sayılmaz — özellikle GNSS kesintilerine karşı yedek olarak değerli görülür. FAA, MON (Minimum Operational Network) programı kapsamında 2030 yılına kadar ABD'de yaklaşık 307 VOR'u devre dışı bırakacak, ancak geriye kalan ~580 istasyonu GPS bağımsız bir yedek navigasyon ağı olarak işletmeye devam edecek. Hedef: bir GPS jamming/spoofing senaryosunda, kıtasal ABD'nin herhangi bir yerinden 100 NM içinde MON-uyumlu bir havalimanına radyo seyrüsefer yardımıyla inebilmek. Hizmet hacmi 5000 ft AGL ve üzeri için garanti altındadır.

Türkiye'de bugüne kadar yayımlanmış agresif bir VOR çıkarma planı yok; SHGM ve DHMİ mevcut DVOR/CVOR ağını GNSS yedeklemesi olarak korumayı sürdürüyor. Bu, hâlâ bir aviyonik mühendis için VOR alıcı modülünü ya da onun simülasyonunu hayatın bir yerinde tasarlama veya test etme ihtimalinin yüksek olduğu anlamına gelir.

GNSS'in jamming/spoofing'e karşı yapısal kırılganlığı (son yıllarda Karadeniz, Baltık ve Ortadoğu hava sahasındaki vakalar) yerli aviyonik camiasında VOR ve DME ağının önemini yeniden gündeme getirdi. Modern sivil uçaklar zaten VOR + DME + INS + GNSS dörtlüsünü bir Kalman filtresi içinde birleştirir ve bir kaynağın çökmesinde diğerlerine güvenir. VOR'un "geçmişin teknolojisi" olduğunu söylemek bu yüzden eksik bir görüştür.

---

## Sonuç

VOR, kafa kasları yerine doğru kavramlarla anlatılırsa havacılığın en zarif radyo seyrüsefer sistemlerinden biridir. Ne yön bulur ne sinyal geliş açısı ölçer; sadece **iki adet 30 Hz sinyal arasındaki faz farkını** hesaplar. CVOR bu faz farkını antenin mekanik dönüşünden üretir; DVOR aynı bilgiyi Doppler etkisiyle yaratır ve halkasının çapı bile rastgele değil, ±480 Hz deviasyon spesifikasyonundan zorunlu olarak çıkar.

Bunu kavradığınızda OBS iğnesinin neden uçağın yönüyle ilgili olmadığı, scalloping hatalarının nereden geldiği, kafa karışıklığı konisinin neden var olduğu ve neden bir VOR alıcısının 1–2 saniye yumuşak ortalama yaptığı sezgisel hale gelir. Sahada bir VOR alıcısı testi yaparken (ya da bir GPS yedek senaryosu için sistem mühendisliği yaparken) elinizdeki cihaz artık bir gizem olmayacaktır — yalnızca çok özenli bir faz karşılaştırıcısı.

---

## Kaynaklar

- ICAO Annex 10 to the Convention on International Civil Aviation, Volume I — *Aeronautical Telecommunications: Radio Navigation Aids*, 7th edition (2018).
- FAA Aeronautical Information Manual (AIM), Chapter 1: Air Navigation — [faa.gov/air_traffic/publications/atpubs/aim_html/chap1_section_1.html](https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap1_section_1.html)
- FAA, VOR Minimum Operational Network (MON) — [faa.gov/about/office_org/headquarters_offices/ato/service_units/techops/navservices/gbng/vormon](https://www.faa.gov/about/office_org/headquarters_offices/ato/service_units/techops/navservices/gbng/vormon)
- Helfrick, A. D., *Principles of Avionics*, Avionics Communications Inc.
- Kayton, M. & Fried, W. R., *Avionics Navigation Systems*, 2nd edition, John Wiley & Sons, 1997.
- Wikipedia, *VHF omnidirectional range* — [en.wikipedia.org/wiki/VHF_omnidirectional_range](https://en.wikipedia.org/wiki/VHF_omnidirectional_range)
- Sengupta, D. L., "Theory of Scalloping Amplitude Errors in Standard VOR Bearing Indications", *IEEE Transactions on Aerospace and Electronic Systems*.
- US Patent 4,604,625 — Phase-locked digital very high frequency omni-range (VOR) receiver.
- US Patent 4,591,861 — Doppler VOR.
- US Patent 7,489,274 — System and method for generating a very high frequency omnidirectional range signal.

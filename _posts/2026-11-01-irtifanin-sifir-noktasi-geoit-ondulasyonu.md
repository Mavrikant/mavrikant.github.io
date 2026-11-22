---
title: "İrtifanın Sıfır Noktası: Geoit Ondülasyonu ve CRC'nin Yakalayamadığı 37 Metre"
subtitle: "The Zero of Altitude: Geoid Undulation, the LPV Final Approach Segment and the Error a CRC Cannot Catch"
background: "/img/posts/4.webp"
date: '2026-11-01 10:00:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [aviyonik, emniyet-kritik]
---

Bir GNSS alıcısının ARINC 429 çıkışını ilk kez dokümanla karşılaştırdığınızda tuhaf bir şey görürsünüz: aynı veri yolunda, irtifa gibi görünen **iki ayrı etiket** vardır. Label 076 "GNSS Altitude (MSL)", label 370 "GNSS Height". İkisi de BNR formatında, ikisi de feet biriminde, ikisinin de çözünürlüğü 0,125 ft. Aralarındaki tek fark, hangi yüzeyin "sıfır" kabul edildiği.

Ankara'da bu iki etiket arasındaki fark yaklaşık **121 feet**.

Hangisini okuduğunuzu bilmiyorsanız, irtifa diye okuduğunuz sayı 37 metre yanlış olabilir. Ve bu, yuvarlama ya da gürültü değil; sistematik, tekrarlanabilir, tam olarak hesaplanabilir bir ofset. Bu yazı o ofsetin ne olduğunu, aviyonik veri zincirinde nerede durduğunu ve en can alıcı yerde — SBAS tabanlı LPV son yaklaşmasında — neden bir CRC tarafından yakalanamayacağını anlatıyor.

Baştan bir not: aşağıdaki sayıların bir kısmını kendim hesapladım, kodunu da paylaşıyorum. Geri kalanı açık standart metinlerinden; hepsinin kaynağı sonda.

---

## İki etiket, bir veri yolu

DO-229D'nin Appendix H'sindeki Table H-1, bir GPS/SBAS sensörünün vermesi gereken asgari çıkış kümesini listeler. İlgili iki satır şöyle:

| Label | Parametre | Format | Birim | Aralık | Sig. bit | LSB |
|---|---|---|---|---|---|---|
| 076 | GNSS Altitude (MSL) | BNR | ft | ±131.072 | 20 | 0,125 |
| 370 | GNSS Height | BNR | ft | ±131.072 | 20 | 0,125 |

Tablonun altındaki açıklama farkı net koyuyor: label 370, WGS-84 elipsoidinin üstündeki **geodetik yüksekliği** verir ve "geoidal veya barometrik değişimler için düzeltilmemiştir". Label 076 ise MSL'ye göredir. Aynı doküman, bu dönüşüm için uygulanabilir modelin **EGM96** olduğunu söyler.

Yani label 076, label 370'ten bir geoit modeli geçirilerek üretiliyor. Aradaki fark da bu yazının konusu: **geoit ondülasyonu**.

---

## Elipsoit, geoit ve ortometrik yükseklik

WGS-84, üç boyutlu bir referans çatısıdır. GPS'in çözdüğü yükseklik, bu çatının dönel elipsoidine olan dik mesafedir — saf geometrik bir büyüklük. ICAO Annex 15'in B ekinin ifadesiyle: elipsoidal yüksekliğin *fiziksel bir anlamı yoktur*; bir seviye yüzeyi göstermez, yani suyun hangi yöne akacağını söylemez.

Haritaların, yaklaşma kartlarının, pist kotlarının ve altimetrenin kullandığı yükseklik ise farklı bir büyüklüktür: **ortometrik yükseklik**, yani geoide olan mesafe. Geoit, Dünya'nın çekim alanının deniz seviyesine karşılık gelen eş-potansiyel yüzeyidir; dalgalı, düzensiz ve yalnızca gravimetrik ölçümlerle modellenebilir.

İkisini birleştiren bağıntı tek satır:

$$
H = h - N
$$

Burada $h$ elipsoidal yükseklik, $H$ ortometrik yükseklik, $N$ ise **geoit ondülasyonu**: geoidin elipsoide göre işaretli mesafesi. Annex 15 bunu "geoidin matematiksel referans elipsoidinin üstünde (pozitif) veya altında (negatif) olduğu mesafe" diye tanımlar.

Ondülasyonun büyüklüğünü hafife almak kolay. Küresel olarak $N$ yaklaşık **−107 m ile +85 m** arasında değişir. Türkiye coğrafyasında ise tamamı pozitif ve büyük: 20 ila 40 metre bandında.

Bir ayrıntı daha, çünkü "MSL" sandığınız kadar tek bir şey değil: geoit pratikte gelgit ölçerlerle gerçeklenir ve rüzgâr, tuzluluk, akıntı gibi etkiler deniz yüzeyini geoitten **2 metreye kadar** saptırır. Annex 15 bunun doğal sonucunu da yazar — farklı ulusal düşey ağların sıfır noktaları birbirinden benzer mertebede farklı olabilir. Yani düşey datum tartışmasında iki değil, üç yüzey var: elipsoit, küresel geoit modeli ve ülkenin kendi nivelman ağı.

---

## Ondülasyonu kendim hesaplamak

EGM96'yı kullanmak için küresel harmonik sentezi elle yapmak gerekmiyor; NGA'nın modelinden türetilmiş hazır ızgaralar var. GeographicLib'in dağıttığı `egm96-15.pgm`, 15 yay-dakikalık (1440 × 721) bir 16-bit PGM dosyasıdır ve başlığında ofset/ölçek bilgisini taşır. Ayrıştırmak için kütüphaneye ihtiyaç yok:

```python
def undulation(g, lat, lon):
    """EGM96 geoit yüksekliği N (m), bilinear interpolasyon.
    Izgara: satır 0 = 90N, kolon 0 = 0E, 0.25 derece adım."""
    w, h = g['w'], g['h']
    fx = (lon % 360.0) * w / 360.0
    fy = (90.0 - lat) * (h - 1) / 180.0
    ix, iy = int(math.floor(fx)), int(math.floor(fy))
    tx, ty = fx - ix, fy - iy
    iy = min(iy, h - 2)
    px = lambda r, c: g['data'][r * w + (c % w)]
    v = ((1-tx)*(1-ty)*px(iy, ix)   + tx*(1-ty)*px(iy, ix+1)
       + (1-tx)*ty    *px(iy+1, ix) + tx*ty    *px(iy+1, ix+1))
    return g['off'] + g['scale'] * v      # ofset -108 m, ölçek 0.003
```

Böyle bir kodu yazdığımda ilk işim doğrulamak oluyor, çünkü ızgara yönünü ters çevirmek sessizce yanlış sonuç veren klasik bir hatadır. Üç bağımsız kontrol:

- GeographicLib dokümantasyonunun örnek noktası (16,78 K; 3,01 B) için 28,7068 m veriliyor; benim 15' ızgaradan bulduğum **28,700 m**.
- (0, 0) noktası için EGM96'nın bilinen değeri ~17,16 m; hesabım **17,163 m**.
- Izgaranın global uçları **−106,99 m / +85,39 m** — EGM96 için yayımlanan aralıkla uyumlu.

Üçü de tutuyor. Şimdi Türkiye'ye bakalım (koordinatlar yaklaşık havaalanı referans noktaları; ondülasyon Türkiye'de ~50 km'de 1 m mertebesinde değiştiği için bu hassasiyet yeterli):

| ICAO | Havalimanı | $N$ (m) | $N$ (ft) |
|---|---|---|---|
| LTFM | İstanbul | +37,07 | +121,6 |
| LTFJ | Sabiha Gökçen | +37,53 | +123,1 |
| LTBJ | İzmir | +38,57 | +126,5 |
| LTAC | Ankara Esenboğa | +36,84 | +120,9 |
| LTAU | Kayseri | +36,24 | +118,9 |
| LTCE | Erzurum | +28,50 | +93,5 |
| LTAI | Antalya | +27,35 | +89,7 |
| LTCI | Van | +26,48 | +86,9 |
| LTCC | Diyarbakır | +25,18 | +82,6 |
| LTCG | Trabzon | +24,48 | +80,3 |
| LTBS | Dalaman | +23,46 | +77,0 |

Baştaki 121 feet buradan geliyor. Dikkat edilmesi gereken ikinci şey, değerin ülke içinde bile 15 metre oynaması: Dalaman ile İzmir arasında 15,1 m fark var. Yani "Türkiye için ondülasyon 35 metredir" diye tek bir sabit kullanmak da çalışmaz.

---

## LPV'nin düşey yolu neyin üstünde tanımlı?

Buraya kadarı geodezi. Mühendislik açısından kritik soru şu: SBAS ile uçulan LPV yaklaşmasının düşey kılavuzu hangi çatıda hesaplanıyor?

Sezgi "yaklaşma kartı MSL diyorsa hesap da MSL'dedir" der. DO-229D Appendix N.1.6 bu sezgiyi tek cümlede bozuyor: LPV yaklaşma kartları MSL'ye referans verir, **ama son yaklaşma segmenti (FAS) MSL'de değil, WGS-84 koordinatlarında tanımlıdır.**

Bunu somutlaştıran şey FAS data block'tur: yaklaşmanın yatay ve düşey geometrisini taşıyan, 288 bit veri + 32 bit CRC'lik sabit formatlı bir kayıt (DO-229D Appendix D, Table D-1). Düşey geometriyi belirleyen üç alan şöyle:

| Alan | Bit | Aralık | Çözünürlük |
|---|---|---|---|
| LTP/FTP height **above ellipsoid** | 16 | −512,0 … 6041,5 m | 0,1 m |
| Approach TCH | 15 | 0 … 1638,35 m | 0,05 m |
| Glidepath angle (GPA) | 16 | 0 … 90,0° | 0,01° |

Alan adları tartışmayı bitiriyor. Eşik noktasının yüksekliği **elipsoide göre** kodlanır (üstelik −512 m ofsetli unsigned olarak: alandaki sıfır, elipsoidin 512 m altı demektir). Süzülme açısı, "LTP/FTP'de WGS-84 elipsoidine teğet yatay düzleme göre" tanımlıdır. TCH ise eşik noktasının üstündeki yüksekliktir.

Sonuç olarak alıcı, düşey sapmayı üretmek için geoite hiç ihtiyaç duymaz. Kendi konumunu elipsoidal çatıda çözer, yolu elipsoidal çatıda kurar, farkı alır. Ondülasyon bu hesaba hiç girmez — çünkü **zaten girmiştir**: prosedür tasarımı sırasında, ölçülen ortometrik eşik kotu $H$'den $h = H + N$ ile elipsoidal yüksekliğe çevrilirken.

İşte ICAO'nun neden havaalanı kotunun yanında *ondülasyonun kendisini de* yayımlatmak zorunda olduğunun cevabı bu. Annex 15 bunu isterken doğruluk şartı da koyuyor: havaalanı elevation noktasında 0,5 m (*essential*, 1×10⁻⁵), hassas yaklaşma pist eşiğinde **0,25 m** ve bütünlük sınıfı **1×10⁻⁸ *critical***. Ayrıntılı belirleme ve raporlama şartları artık PANS-AIM (Doc 10066) Appendix 1'de.

Zincirin tamamı şöyle:

<div class="mermaid">
flowchart TD
    A["Saha ölçümü: pist eşiğinin ortometrik kotu H"] --> C
    B["Geoit modeli: ondülasyon N"] --> C
    C["AIP yayını: Annex 15 / PANS-AIM uyarınca H ve N"] --> D
    D["Prosedür tasarımı: h = H + N"] --> E
    E["FAS data block: LTP/FTP height above ellipsoid"] --> F
    F["Yetkili otorite CRC-32Q ekler"] --> G
    G["Navigasyon veritabanı, AIRAC döngüsü"] --> H
    H["Alıcı CRC'yi doğrular, düşey sapmayı elipsoidal geometriyle üretir"] --> I
    I["Pilotun gördüğü düşey sapma göstergesi"]
</div>

Dikkat: `N` zincire yalnızca **bir** yerde giriyor — tasarım adımında. Ondan sonrası tamamen geometri.

---

## CRC'nin yakalayamadığı hata

FAS data block'un bütünlüğü 32 bitlik bir CRC ile korunur. DO-229D Appendix D.5 polinomu açıkça verir:

$$
G(x) = x^{32}+x^{31}+x^{24}+x^{22}+x^{16}+x^{14}+x^{8}+x^{7}+x^{5}+x^{3}+x+1
$$

Katsayıları toplayınca bu **0x814141AB**, yani kataloglarda CRC-32/Q diye geçen polinom. Standardın bilgilendirici kısmı da seçimi doğrular: "CRC-32Q (Q for Qualcomm) was chosen" ve tespit edilemeyen hata olasılığının üst sınırı $2^{-32} = 2.3283 \times 10^{-10}$.

Burada şu soruyu sormak istedim: **tasarım adımında $N$ unutulursa, bu koruma işe yarar mı?** Yani eşiğin elipsoidal yüksekliği $h$ yerine yanlışlıkla ortometrik kotu $H$ yazılırsa.

Cevabı tahmin etmek yerine ölçmek için FAS bloğunu Table D-1'e göre bit bit paketleyen bir kod ve CRC-32Q'nun kendisini yazdım. CRC'nin doğruluğundan emin olmak için önce katalog check değerini doğruladım:

```python
POLY = 0
for e in (31, 24, 22, 16, 14, 8, 7, 5, 3, 1, 0):
    POLY |= 1 << e                      # -> 0x814141AB

def crc32q(bits):
    """DO-229D D.5: yansıtmasız, init=0, xorout=0, MSB-first."""
    reg = 0
    for b in list(bits) + [0] * 32:     # x^k * M(x)
        top = (reg >> 31) & 1
        reg = ((reg << 1) & 0xFFFFFFFF) | b
        if top:
            reg ^= POLY
    return reg
```

`crc32q(b"123456789")` → **0x3010BF7F**, CRC kataloğundaki CRC-32/Q check değeriyle birebir aynı. Demek ki bit sıralamam da CRC'm de doğru.

Sonra aynı eşik için iki blok paketledim. Esenboğa koordinatında ondülasyon $N$ = +36,84 m; varsayımsal bir eşik kotu olarak $H$ = 949,0 m aldım, doğru elipsoidal değer ise $h$ = 985,8 m:

| Blok | LTP/FTP height alanı | Kodlanan | FAS CRC |
|---|---|---|---|
| Doğru ($h = H + N$) | 985,8 m | 0x3A82 | 0x0EE3B52E |
| Hatalı (ortometrik $H$) | 949,0 m | 0x3912 | 0x2C356229 |

İkisi de kendi içinde tutarlı. Alıcı, otoritenin verdiği CRC ile kendi hesapladığını karşılaştırır ve **ikisinde de tam eşleşme** bulur. CRC bozulmayı (corruption) yakalar; yanlış-ama-tutarlı veriyi yakalamaz. Bu, CRC'nin kusuru değil, görev tanımı: bütünlük ≠ doğruluk.

Peki geometrik sonucu ne? Yol, LTP yüksekliği + TCH noktasına çakılı ve açısı teğet düzleme göre tanımlı olduğundan, LTP yüksekliği $N$ kadar küçük girildiğinde **bütün yol rijit olarak $N$ kadar aşağı kayar.** GPA 3,00° ve TCH 15,24 m (50 ft) için:

| Eşikten uzaklık | Komut yüksekliği (hatalı) | Olması gereken |
|---|---|---|
| 10 NM | 949,0 m | 985,8 m |
| 5 NM | 463,7 m | 500,5 m |
| 3 NM | 269,6 m | 306,4 m |
| 1 NM | 75,5 m | 112,3 m |
| Eşik (TCH) | **−21,6 m** | +15,2 m |

Eşik geçiş yüksekliği 50 feet yerine **−71 feet** oluyor; yani kılavuzun gösterdiği yol pistin yüzeyinin 21,6 m altından geçiyor. Yolu geriye doğru takip ederseniz pist kotunu eşikten **412 m önce** kesiyor.

En rahatsız edici kısmı şu: bu hatayı düşey alarm limiti de yakalamaz. DO-229D'de VAL alanının üst sınırı 51,0 metredir. 36,8 m'lik bir hata bu zarfın içinde kalır. Ama asıl mesele büyüklük bile değil: VAL, alıcının *konum* çözümünün hata sınırını bağlar. Verinin kendisi yanlışsa alıcı mükemmel bir konum çözümüyle yanlış yolu kusursuz biçimde uçar. Protection level mekanizmasının görmediği bir yer var ve o yer veri zincirinin kendisi.

Bu kurgusal bir analiz; raporlanmış bir olay anlatmıyorum. Ama tam olarak bu yüzden prosedür tasarımı, saha ölçümü ve veri yayını sertifikasyon kapsamındadır: zincirin bütünlük sınırı CRC değil, **$h = H + N$ dönüşümünün yapıldığı yerdir.** Uçuş kontrolü (flight check) ve prosedür doğrulaması da bu yüzden var.

---

## Model seçimi de bir hata kaynağı

DO-229D bir ayrıntıyı rahat bir dille geçer: EGM-96 2006 sonbaharında EGM-06 ile güncellenecek ve "ikisi de kabul edilebilir bir geoit modeli olarak kullanılabilir". (Modelin adı sonunda EGM2008 oldu.)

Bu cümle zararsız görünüyor. Ölçmek istedim: aynı noktada iki model ne kadar farklı $N$ veriyor? EGM2008'in 5 yay-dakikalık ızgarasını (4320 × 2161) indirip aynı interpolasyonu uyguladım.

| ICAO | Havalimanı | EGM96 | EGM2008 | Fark |
|---|---|---|---|---|
| LTCI | Van | +26,48 | +24,58 | **−1,90** |
| LTAU | Kayseri | +36,24 | +34,50 | **−1,74** |
| LTCG | Trabzon | +24,48 | +25,67 | +1,19 |
| LTBS | Dalaman | +23,46 | +24,21 | +0,75 |
| LTCE | Erzurum | +28,50 | +29,03 | +0,53 |
| LTFM | İstanbul | +37,07 | +37,44 | +0,37 |
| LTAC | Ankara Esenboğa | +36,84 | +37,17 | +0,33 |
| LTCC | Diyarbakır | +25,18 | +25,12 | −0,06 |
| LTFJ | Sabiha Gökçen | +37,53 | +37,35 | −0,18 |
| LTBJ | İzmir | +38,57 | +38,35 | −0,22 |
| LTAI | Antalya | +27,35 | +26,97 | −0,38 |

Türkiye'yi kaplayan 0,25° ızgarada (36–42 K / 26–44,5 D, 1875 nokta) fark **−3,50 m ile +5,66 m** arasında; ortalama +0,33 m, standart sapma 1,35 m. En büyük sapmalar Doğu Anadolu'nun dağlık ve gravimetrik veri açısından seyrek bölgelerinde.

Şimdi bunu şart ile yan yana koyun: Annex 15 pist eşiğinde ondülasyon için **0,25 m** doğruluk istiyor. Van'da iki "kabul edilebilir" model arasındaki 1,90 m fark, bu bütçenin yedi katından fazla. Yani model seçimi, ölçüm hatasından bağımsız olarak tek başına şartı aşabiliyor.

Bunun doğru çözümü de standartta duruyor: Annex 15, EGM-96'nın doğruluk şartlarını karşılamadığı yerlerde bölgesel veya ulusal bir geoit modelinin geliştirilmesini ve AIP'de tanımlanmasını ister. Türkiye de dahil pek çok ülkenin GNSS/nivelman verisiyle sıkılaştırılmış kendi hibrit geoit modeli vardır ve fark ölçülebilir: Turgut, İnal ve Çorumluoğlu'nun Türkiye'de 75 noktada yaptığı karşılaştırmada GPS/nivelmana göre sapmalar EGM96 için −12,8 ile +61,3 cm arasında değişirken, yerel TG99 modeli için −17,2 ile +18,2 cm bandında kalıyor. Küresel modeller yerel bir modelin yerini tutmaz. Pavlis ve arkadaşlarının EGM2008 değerlendirmesinde küresel GPS/nivelman RMS'i EGM96 için 30,3 cm, EGM2008 için 13,0 cm — iyi, ama bunlar *küresel ortalamalar*; tek bir pist eşiğinde size verilen garanti değil.

Bir yazılımcı için pratik sonuç şu: koda bir geoit tablosu gömüyorsanız, hangi model olduğunu ve sürümünü veri ile birlikte saklamak zorundasınız. "Geoit düzeltmesi uygulandı" bilgisi tek başına anlamsızdır.

---

## Basınç irtifası bu tartışmanın dışında değil

Düşey datum karmaşasını tamamlamak için dördüncü bir büyüklük daha var: basınç irtifası. DO-229D Appendix N.1.1'in cümlesi burada çok yerinde — basınç altimetresi, radar altimetresi ve GNSS sensörü irtifa üretir ama "bunlar aynı temel büyüklüğün ölçümleri değildir ve birbirinin yerine kullanılamaz".

Basınç irtifası atmosfer modeline bağlıdır, dolayısıyla sıcaklıkla kayar. Transport Canada'nın yayımladığı somut bir örnek: kompanzasyonsuz bir FMS ile uçulan bir LNAV/VNAV yaklaşmasında FAF 3600 ft *indicated* ve nominal açı 3° iken, −35 °C'de gerçek irtifa 3367 ft'e düşüyor ve etkin açı **2,5°**'ye sığlaşıyor; +35 °C'de 3698 ft'e çıkıp **3,2°**'ye dikleşiyor. Soğukta uçak tasarlanandan aşağıda uçuyor — bu yüzden kompanzasyonsuz sistemler için kartlara soğuk hava sıcaklık limiti basılır.

LPV'nin düşey yolu ise geometrik olduğu için bu etkiden tamamen bağımsızdır: sıcaklık, elipsoide teğet düzleme göre tanımlı bir açıyı değiştirmez. Bu, geometrik yaklaşmanın az konuşulan gerçek avantajıdır — "daha hassas" olmasından çok, **düşey yolunun meteorolojiye bağlı olmaması.**

Buna karşılık geometrik tarafın da kendi uyarısı var. DO-229D, EGM-96'nın MSL için makul bir yaklaşım olduğunu söyler ama hemen ardından okuyucuyu uyarır: bu modelin **bütünlüğü (integrity) bu MOPS kapsamında tesis edilmemiştir** ve EGM-96 ile QNH basınç irtifasının denkliği MOPS'un kapsamı dışındadır. Yani label 076'daki "MSL irtifası", bütünlük kredisi olmayan bir model üzerinden üretilmiş, gösterim amaçlı bir büyüklüktür. Birincil irtifa göstergesi hâlâ basınç altimetresidir.

Baro destekli GNSS çözümünde de aynı dönüşüm karşımıza çıkar: DO-229D Appendix G.3.1, yerel basınç ayarıyla düzeltilmiş basınç irtifasının ayrıca "mevcut konumda WGS-84 elipsoit irtifası ile ortalama deniz seviyesi irtifası arasındaki fark" ile düzeltilmesini şart koşar. İlginç olan, bunun için 10 derece enlem/boylamla sınırlı bir tablonun yeterli görülmesi. Bu ilk bakışta kabaca bir çözünürlük gibi durur, ama bütçeye bakınca anlaşılıyor: aynı bölümde baro destek için $\sigma_{ht} = 33$ m ve altimetre doğruluğu $\sigma_a = 10$ m alınıyor. Metre mertebesinde bir ondülasyon hatası bu gürültünün altında kalır. Aynı hata, 0,25 m şartı olan pist eşiğinde kabul edilemez. **Aynı fiziksel büyüklük, iki farklı uygulamada iki farklı doğruluk sınıfında.** Bir şartı değerlendirirken "ne kadar hassas olmalı" sorusunun cevabının her zaman kullanım yerine bağlı olduğunun güzel bir örneği.

---

## Pratikte ne yapmalı

Gömülü tarafta bu konunun pratiğe dönüşen kısmı kısa bir listeye sığıyor:

**Değişken adına datumu yazın.** `altitude_m` bir hata kaynağıdır. `alt_hae_m` ve `alt_msl_m` değildir. Aynısı arayüz tanımları (ICD) için de geçerli: ARINC 429 çözücünüzde label 076 ile 370'i aynı alana yazan bir satır varsa, o satır sessiz bir bug'dır.

**Dönüşümü tek yerde yapın.** $h \leftrightarrow H$ dönüşümü kod tabanında birden fazla yerde yapılıyorsa, eninde sonunda biri iki kez uygulanır ya da hiç uygulanmaz. Çift uygulanan ondülasyon, Türkiye'de 70 metrelik bir hatadır ve hiçbir aralık kontrolünü tetiklemez.

**Geoit modelini sürümleyin.** Hangi model, hangi ızgara çözünürlüğü, hangi interpolasyon. İnterpolasyon yöntemi bile fark eder: kullandığım PGM dosyasının başlığı, bilinear interpolasyon için maksimum hatayı 1,15 m, kübik için 0,17 m olarak veriyor. 0,25 m şartı olan bir uygulamada bilinear interpolasyon tek başına şartı ihlal eder.

**CRC'ye doğruluk görevi yüklemeyin.** FAS data block örneği bunun temiz bir vakası: 32 bitlik CRC, bozulmaya karşı $2,33 \times 10^{-10}$ üst sınır verir, anlamsal hataya karşı sıfır koruma verir. Veri doğruluğu, verinin üretildiği süreçte sağlanır — gözden geçirme, bağımsız doğrulama, uçuş kontrolü.

**Aralık kontrollerini datuma göre kurun.** LTP/FTP height alanının aralığı −512,0 … 6041,5 m. Türkiye'de ortometrik kotu 5000 m olan bir eşik yok, ama bir makullük kontrolü yazacaksanız sınırların hangi çatıda olduğunu bilmeniz gerekir; aksi halde 37 metrelik bir kayma hiçbir kontrole takılmaz.

---

## Açık sorular

Kendi adıma cevabını merak ettiğim, bu yazıda kapatmadığım birkaç uç var:

- **eTOD ve TAWS veritabanları.** Arazi ve engel verisi de düşey datum taşır. Bir TAWS, elipsoidal konumunu ortometrik arazi verisiyle karşılaştırırken dönüşümü nerede yapıyor ve o dönüşümün bütünlük argümanı nedir?
- **Ulusal geoit ile küresel modelin birlikte yaşaması.** Bir alıcı EGM96 gömülü gelir, AIP ise ulusal hibrit geoide dayanan ondülasyon yayımlar. Prosedür tasarımı ulusal modeli kullanırken alıcının gösterdiği MSL irtifası küresel modelden gelir. Bu iki değer arasındaki metre mertebesindeki fark, pilotun gördüğü sayıya nasıl yansıyor?
- **Model güncellemelerinin konfigürasyon yönetimi.** Ondülasyon değerleri yeni bir geoit modeliyle değişirse, daha önce yayımlanmış FAS data block'ları ne olur? Değişiklik sadece yeni prosedürlere mi uygulanır, yoksa yeniden hesaplama mı gerekir?

Bu soruların ortak noktası, hiçbirinin tek bir dokümanda cevaplanmaması. Düşey datum, geodezi ile aviyonik yazılımın tam sınırında duruyor ve iki taraf birbirinin diliyle yazmıyor. Bu yazıyı yazarken en çok vakit alan şey de bu oldu: cevapları bulmak değil, aynı büyüklüğün üç farklı dokümanda üç farklı adla anıldığını fark etmek.

---

## Kaynaklar

- RTCA, *DO-229D — Minimum Operational Performance Standards for Global Positioning System/Wide Area Augmentation System Airborne Equipment*, 13 Aralık 2006. Bu yazıda kullanılan bölümler: Appendix D (FAS data block, Table D-1, D.5 CRC tanımı, D.6.1), Appendix G.3 (baro destekli çözüm), Appendix H Table H-1 (ARINC 429 çıkışları), Appendix N (WGS-84'ten MSL'ye dönüşüm rehberi). [Standart sayfası](https://standards.globalspec.com/std/14281994/rtca-do-229) · [PDF nüsha](https://gnss-x.ac.cn/docs/RTCA-DO-229D.pdf)
- ICAO, *Annex 15 — Aeronautical Information Services*. Geoit ondülasyonu tanımı, $H = h - N$ bağıntısı, deniz yüzeyi topografyası ve ulusal düşey ağ farkları (Appendix B), ondülasyon doğruluk ve bütünlük şartları. [PDF nüsha (2. baskı, 2002)](https://skybrary.aero/sites/default/files/bookshelf/5854.pdf) · [daha yeni nüsha](https://www.bazl.admin.ch/dam/en/sd-web/WbmhnD3CcfVn/icao_annex_15_aeronauticalinformationservices.pdf)
- ICAO, *PANS-AIM (Doc 10066)* — ondülasyon ve kot verisinin belirlenmesi/raporlanmasına dair güncel ayrıntılı şartlar Appendix 1'de; Annex 15'in 16. baskısıyla veri şartları bu dokümana taşındı.
- N. K. Pavlis, S. A. Holmes, S. C. Kenyon, J. K. Factor, "The development and evaluation of the Earth Gravitational Model 2008 (EGM2008)", *Journal of Geophysical Research: Solid Earth*, cilt 117, B04406, 2012. EGM2008'in derecesi, EGM96'ya göre iyileşme oranları ve GPS/nivelman RMS karşılaştırmaları. [doi:10.1029/2011JB008916](https://doi.org/10.1029/2011JB008916)
- GeographicLib, *Geoid height* — EGM84/EGM96/EGM2008 ızgaraları, PGM dosya formatı ve interpolasyon hata tabloları. [geographiclib.sourceforge.io](https://geographiclib.sourceforge.io/C++/doc/geoid.html)
- NASA CDDIS, *EGM96 — The NASA GSFC and NIMA Joint Geopotential Model* — DO-229D Appendix N'in atıf verdiği kaynak; model katsayıları ve dokümantasyon. [cddis.nasa.gov](https://cddis.nasa.gov/926/egm96/egm96.html)
- Transport Canada, "The vertical challenge", *Aviation Safety Letter*, Sayı 1/2021 — Baro-VNAV'da sıcaklığın düşey yola etkisi ve sayısal örnek. [tc.canada.ca](https://tc.canada.ca/en/aviation/publications/aviation-safety-letter/issue-1-2021/vertical-challenge)
- FAA, *AC 90-107 — Guidance for Localizer Performance with or without Vertical Guidance Approach Operations*. LPV operasyonları ve FAS data block'un rolü. [faa.gov](https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_90-107.pdf)
- P. Koopman, "CRC Polynomial Zoo" — CRC-32Q'nun katalog kaydı ve check değeri. [users.ece.cmu.edu](https://users.ece.cmu.edu/~koopman/crc/crc32.html)
- B. Turgut, C. İnal, Ö. Çorumluoğlu, "Comparison of the geoid undulations obtained by EGM96, TG99 and GPS/levelling in Turkey", *Acta Geodaetica et Geophysica Hungarica*, cilt 39, sayı 4, ss. 403–410, 2004. Yaklaşık 1700 km²'lik bir alanda 75 noktada karşılaştırma; GPS/nivelmana göre farklar EGM96 için −12,8 … +61,3 cm, yerel TG99 modeli için −17,2 … +18,2 cm. [doi:10.1556/AGeod.39.2004.4.8](https://doi.org/10.1556/AGeod.39.2004.4.8)

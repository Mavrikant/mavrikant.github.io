---
title: "Zynq-7000 ve S25FL512S: Güç Kesildiğinde QSPI Flash'ta Ne Kalır?"
subtitle: "Power-Fail-Safe Persistent Storage on Zynq-7000 with S25FL512S QSPI NOR"
background: "/img/posts/6.webp"
date: '2026-08-20 07:00:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [gomulu-sistemler, c-cpp, emniyet-kritik]
---

Zynq-7000 tabanlı bir kart tasarladığınızda er ya da geç şu soruyla karşılaşırsınız: kalibrasyon katsayılarını, seri numarasını, çalışma saati sayacını, son arıza kaydını nereye yazacaksınız?

Cevap dar. Zynq'in dahili flash'ı **yoktur**. PS tarafında sadece OCM ve DDR var; ikisi de uçucu. Elinizde kalan, boot imajını da barındıran QSPI NOR flash'tır. Yani konfigürasyon verinizle FSBL'iniz, bitstream'iniz ve uygulamanız **aynı fiziksel çipte** yaşar. Bu, x86 veya dahili flash'lı bir MCU dünyasından gelen sezgilerin çoğunu geçersiz kılar.

Bu yazıda o çip olarak, Zynq kartlarında en yaygın tercihlerden biri olan **S25FL512S**'i (512 Mbit, 64 MB, Infineon/Cypress FL-S ailesi) ele alacağım. Önce bu parçanın üç sert kısıtını ve bir *sessiz* tuzağını göstereceğim, sonra Zynq'e özgü bir reset tehlikesini anlatacağım, ardından dayanıklı bir kayıt tasarımı kurup onu **her olası güç kesintisi noktasında tüketici (exhaustive) biçimde sınayan** bir hata enjeksiyon koşumuyla ölçeceğim.

Koşum, tasarım hipotezlerimden birini çürüttü. Onu da olduğu gibi aktarıyorum, çünkü çürütülen kısım aslında yazının en öğretici bulgusu.

---

## S25FL512S'in üç sert gerçeği

Veri sayfasından (Doc. 001-98284) çıkan üç sayı, bütün tasarımı belirliyor:

| Parametre | Değer | Not |
|---|---|---|
| Silme birimi | **256 kB uniform sektör** | Daha küçüğü yok — 4 kB parametre sektörü **bulunmuyor** |
| Sektör silme süresi (tSE) | **520 ms tipik, 2600 ms maks** | Güç kesintisi için devasa açık pencere |
| Programlama tamponu | 512 bayt sayfa | tPP = 340 µs tipik, 1300 µs maks |

İlk satır çoğu kişiyi şaşırtıyor. FL-S ailesinin küçük üyelerinde (128S/256S) opsiyonel 4 kB parametre sektörleri vardır; **512 Mbit ve 1 Gbit üyelerde yoktur**. Yani 8 baytlık bir sayacı güncellemek için silmeniz gereken en küçük birim 256 kB'dir ve bu iş tipik olarak yarım saniye, en kötü durumda **2,6 saniye** sürer.

Bu süre boyunca iki şey doğrudur ve ikisi de tehlikelidir. Birincisi, o sektörde veriniz **yoktur**. İkincisi — ve Zynq'e özgü olanı — flash meşguldür; o çipten okuma yapamazsınız. Boot imajınız aynı çipteyse, QSPI'yi linear (XIP) modda kullanan hiçbir kod o yarım saniye boyunca çalışamaz. Erase Suspend/Resume komutları (ERSP/EPR) bu yüzden vardır, ama onları kullanmayı hatırlamak sizin işiniz.

---

## Sessiz tuzak: ECC'yi farkında olmadan kapatmak

FL-S ailesinin az bilinen bir özelliği var: **Automatic ECC**. Her 16 baytlık hizalı blok bir "ECC unit" oluşturuyor ve kendi gizli sendromunu taşıyor. Tek bit hatasını okuma sırasında şeffafça düzeltiyor.

Buraya kadar iyi haber. Kötü haber, veri sayfasının şu cümlesinde saklı:

> "When data is first programmed within an ECC unit the ECC value is set for the entire ECC unit. If the same ECC unit is programmed more than once the ECC value is changed to disable the EDC function. A sector erase is needed to again enable Automatic ECC on that Programming Block."

Bunu bir kez daha okumaya değer. Aynı 16 baytlık birime ikinci kez yazarsanız:

- Komut **başarılı olur**. `P_ERR` kalkmaz.
- Veri **doğru yazılır** (NOR semantiği gereği bit-AND; ayrık bayt aralıklarına yazıyorsanız hiçbir şey bozulmaz).
- Ve o birimin hata düzeltmesi **sessizce kapanır**. Sektörü silene kadar da geri gelmez.

Yani fonksiyonel testleriniz geçer, üretim testiniz geçer, sahaya çıkarsınız — ve tek bit koruma ağınızın olmadığından haberiniz olmaz. Bunu size söyleyecek tek şey, açıkça sorduğunuzda `ECCRD` (18h) komutuyla okunan **ECCSR** kaydıdır. Sormazsanız kimse söylemez.

Bu, dahili flash'lı MCU dünyasından gelen alışkanlıkların tam tersi. Orada yanlış yazma girişimi genellikle bir hata bayrağı veya kesme üretir. Burada **hiçbir şey olmaz**. Tasarım kuralı buradan çıkıyor:

> Bir ECC birimine hayatı boyunca **bir kez** yazın. Kaydınızın her alanı, aynı 16 baytlık birime ikinci bir programlama gerektirmeyecek şekilde yerleşmelidir.

Bu kural, "önce veriyi yaz, sonra yanına geçerlilik bayrağını koy" veya "eski kaydı yerinde geçersiz işaretle" gibi klasik NOR numaralarını doğrudan yasaklıyor. Veri sayfası da bunu biliyor ve şeffaflığı yalnızca eski nesil FL ürünleriyle yazılım uyumluluğu için koruduğunu söylüyor.

---

## Yarım kalan bir işlem geriye ne bırakır?

"Yazma yarım kaldı" tek bir durum değil. Bu sorunun kamuya açık en iyi deneysel yanıtı hâlâ Tseng, Grupp ve Swanson'ın DAC 2011 çalışması: beş üreticiden 11 yongaya mikrosaniye çözünürlüklü aralıklarla güç kesip sonucu ölçüyorlar; güç 3,7 µs içinde sıfıra iniyor.

Dürüst bir uyarı: o çalışma **ham NAND** üzerinde yapıldı, NOR üzerinde değil. MLC'ye özgü bulguları (örneğin ikinci sayfayı programlarken birinci sayfanın bozulması) S25FL512S'e aktarılamaz. Aktarılabilen şey genel ilke ve o ilke can alıcı: **yarım kalan bir işlem, hücreleri okunabilir ama tanımsız bir ara durumda bırakır.** Tasarım açısından önemli üç bulgu:

- **Hata oranı monoton değil.** İşleme daha çok zaman tanımak daha az hata anlamına gelmiyor. "Yazma neredeyse bitmişti, herhalde iyidir" çıkarımı geçersiz.
- **Yarım programlanmış veri okumaya karşı kırılgan.** Tam programlanmış sayfada read disturb hataları 2,8 milyon okumadan sonra belirirken, yarım kalmış sayfada 1000 okumadan sonra beliriyor. Geri okuduğunuzda hatasız görünen bir kayıt, birkaç bin okuma sonra bozulabiliyor.
- **Yarım kalan silme, o bloğa yapılacak gelecekteki yazmaları güvenilmez kılıyor.** Silme komutu tamamlandığını bildirmeden önce hücreler zaten 1 olmuş oluyor; kalan süre eşik gerilimlerinin ince ayarına gidiyor. Bu ayar kesilirse sonraki programlamaların hata oranı yükseliyor.

Son madde S25FL512S için doğrudan bir kurala dönüşüyor ve veri sayfası da aynı şeyi söylüyor: *"any operation that was interrupted by a hardware reset should be reinitiated once the device is ready to accept a command sequence."* Yarım kalmış bir sektör silmesinin üzerine yazmayın; **sektörü baştan ve tam olarak silin.**

---

## Zynq'e özgü tehlike: bank adres kaydı ve reset

Şimdi Zynq tarafına geçelim, çünkü burada S25FL512S ile birlikte ortaya çıkan ve tamamen belgelenmiş bir tuzak var.

Zynq-7000'in QSPI denetleyicisi **3 baytlık adreslemeyle sınırlıdır**. 3 bayt = 16 MB. Ama S25FL512S 64 MB. Aradaki farkı kapatmak için flash'ın **Bank Address Register**'ını (BAR, `BRWR` 17h ile yazılır) kullanır, adresin üst baytını oraya koyarsınız. AMD bu konuda ayrı bir tasarım uyarısı yayımlamış durumda ([AR 57744](https://adaptivesupport.amd.com/s/article/57744?language=en_US)): uyarı, 16 MB'tan büyük QSPI flash kullanan **her** Zynq-7000 platformunu kapsıyor.

Tehlike şurada. BAR **uçucu** bir kayıttır ve veri sayfasına göre yalnızca üç durumda sıfırlanır: güç çevrimi, donanım `RESET#`, veya yazılım reset komutu. Veri sayfasının ifadesiyle varsayılan durum, "*the Bank address register loaded with zeros and the extended address mode set for 24-bit addresses*".

Şimdi şu senaryoyu düşünün: uygulamanız 16 MB sınırının üstündeki bir sektöre konfigürasyon yazıyor, dolayısıyla BAR sıfır değil. Tam o sırada watchdog atıyor ve **PS soft reset** gerçekleşiyor. Soft reset flash'ın `RESET#` bacağını sürmez — üstelik veri sayfası `RESET#`'in bazı paket seçeneklerinde **hiç dışarı çıkmadığını**, o paketlerde dahili olarak pasif duruma bağlandığını söylüyor. Yani flash'ı donanımdan resetleme imkânınız olmayabilir.

Sonuç: flash BAR'ı sıfırdan farklı halde ayakta kalır. BootROM ise 3 baytlık adreslemeyle ve bank sıfır varsayımıyla boot imajını okumaya çalışır. Yanlış 16 MB penceresinden okur. Kart boot etmez.

Bu, güç kesintisi probleminin reset zamanındaki kardeşi: **cihazda kalan uçucu durum, bir sonraki açılışı bozar.** Çözüm de aynı mantıkta — yeniden başlatmadan önce flash'a yazılım reset dizisi göndermek, ya da BAR'ı açıkça sıfırlamak.

Aynı aileden ikinci bir tuzak: `P_ERR` veya `E_ERR` kalktığında **WIP biti bir olarak kalır.** Veri sayfası açık: *"When P_ERR or E_ERR bits are set to one, the WIP bit will remain set to one indicating the device remains busy and unable to receive new operation commands. A Clear Status Register (CLSR) command must be received to return the device to standby mode."* Yani "meşgul değil" olmasını bekleyen naif bir sürücü döngüsü, başarısız bir işlemden sonra **sonsuza kadar bekler**. `CLSR` (30h) göndermeden çıkamazsınız; ardından `WRDI` ile WEL'i temizlemeniz de gerekir.

---

## Tasarım

Kısıtlar tasarımı neredeyse tek bir noktaya sıkıştırıyor:

- 256 kB silme birimi → yerinde güncelleme intihar. **Ekleyerek (append-only) yaz.**
- 16 baytlık ECC birimine bir kez yazma kuralı → **kayıt 32 bayt: iki ayrı ECC birimi.**
- Yarım kayıt görünmemeli → **commit işareti ikinci birime, en sona.**
- Sektör devri sırasında veri kaybolmamalı → **iki fazlı sektör promosyonu.**

Sektör düzeni, 16 baytlık ECC birimleri cinsinden:

```
unit[0]      : RECEIVE başlığı  (MAGIC_R | sectorseq)  <- sektör doldurulmaya başlandı
unit[1]      : ACTIVE  başlığı  (MAGIC_A | sectorseq)  <- sektör artık yetkili
unit[2+2k]   : payload          (8 bayt değer + 0xFF dolgu)
unit[2+2k+1] : commit işareti   (seq | crc32(değer, seq) | MAGIC)
```

Kurtarma yalnızca `ACTIVE` başlığı taşıyan sektörleri yetkili sayar. Devir sırasında yeni sektör önce silinir, `RECEIVE` yazılır, veri taşınır ve **ancak ondan sonra** `ACTIVE` yazılır. Kopyalama yarıda kalırsa eski sektör yetkili kalmaya devam eder.

<div class="mermaid">
stateDiagram-v2
    [*] --> Silinmis
    Silinmis --> Receive: RECEIVE başlığı yazıldı
    Receive --> Aktif: veri taşındı, ACTIVE başlığı yazıldı
    Aktif --> Dolu: slotlar tükendi
    Dolu --> Silinmis: devir sonrası silinir
    Receive --> Silinmis: yarım kalan devir, yeniden silinir
</div>

Kayıt yazma tarafı, ECC birimi kuralına dikkat ederek:

```c
static void write_record(unsigned sec, unsigned slot, uint64_t val, uint32_t seq)
{
    uint8_t u[ECC_UNIT];

    memset(u, 0xFF, ECC_UNIT);
    memcpy(u, &val, 8);
    fl_program_unit(sec, payload_unit(slot), u);          /* 1. ECC birimi: veri   */

    memset(u, 0xFF, ECC_UNIT);
    put32(u, seq); put32(u + 4, rec_crc(val, seq)); put32(u + 8, REC_MAGIC);
    fl_program_unit(sec, mark_unit(slot), u);             /* 2. ECC birimi: commit */
}
```

Her birime tam olarak bir programlama. Hiçbir alan sonradan güncellenmiyor.

---

## Deney: her kesinti noktasında tüketici hata enjeksiyonu

"Birkaç kere fişi çektim, sorun görünmüyor" bir doğrulama değil. Programlama penceresi 340 µs; rastgele fiş çekmeyle onu yakalama olasılığınız düşük. Bunun yerine flash'ı **modelleyip** her olası kesinti noktasını tek tek dolaşmak çok daha güçlü.

Model S25FL512S semantiğini uyguluyor. En kritik kısım, ikinci programlamanın **hata vermemesi**:

```c
static void fl_program_unit(unsigned s, unsigned idx, const uint8_t *data)
{
    ecc_unit_t *u = &FL[s][idx];
    int second = u->programmed;
    ...
    for (unsigned i = 0; i < ECC_UNIT; i++) u->b[i] &= data[i];
    u->programmed = 1;
    if (second) u->ecc_disabled = 1;                     /* SESSIZ: P_ERR kalkmaz */
}
```

Güç kesintisi, her flash işlemine indeks verip belirli bir indekste `longjmp` ile ortadan kaybolarak enjekte ediliyor; yarım kalan işlemin bıraktığı durum üç varyantla modelleniyor (hiç başlamadı / yarım kaldı / bitti ama komut dönmedi). Ölçek küçültüldü (sektör = 8 ECC birimi) ki tüketici arama mümkün olsun; semantik birebir korundu, gerçek geometri aşağıdaki aritmetikte kullanılıyor.

Yeniden açılıştan sonra sınanan değişmez:

> Okuma ya kesintiden önce **tamamlanmış son yazmanın** değerini, ya da kesinti anında **uçuş halindeki** değeri döndürmeli. Ayrıca kazanan kaydın ECC'si kapalı olmamalı.

Önemli bir metodoloji notu: marjinallik, tasarımın *kendi görüşüyle* değil **yer gerçeğiyle** yargılanıyor. Aksi halde ECC durumunu hiç sormayan bir tasarım, sorunu göremediği için tertemiz görünürdü.

Beş kusurlu varyant ve tam tasarım, 8 birimlik sektör ve 8 yazma ile (41 flash işlemi × 3 varyant = tasarım başına 123 senaryo):

| Tasarım | senaryo | kayıp | eskime | bozulma | marjinal | EDC-kapalı birim |
|---|---:|---:|---:|---:|---:|---:|
| A — naif yerinde güncelleme | 123 | **49** | 0 | 0 | 0 | 0 |
| B1 — tek adımlı sektör başlığı | 123 | **18** | 0 | 0 | 0 | 35 |
| B2 — payload+commit aynı ECC biriminde | 123 | 0 | 0 | 0 | **88** | 484 |
| B3 — ECCRD doğrulaması yok | 123 | 0 | 0 | 0 | 0 | 35 |
| B4 — eski kaydı yerinde geçersiz işaretle | 123 | **27** | **42** | 0 | 0 | 310 |
| C — tam tasarım | 123 | 0 | 0 | 0 | 0 | 35 |

İlk karşı-örnekler:

```
A  naif yerinde guncelleme      islem #3,  varyant 1
   -> veri kayboldu: 1 yazma tamamlanmisti, okuma bos dondu
B1 tek adimli sektor basligi    islem #10, varyant 2
   -> veri kayboldu: 3 yazma tamamlanmisti, okuma bos dondu
B2 payload+commit ayni birimde  islem #4,  varyant 2
   -> deger dogru ama kazanan kaydin EDC'si kapali (sessiz koruma kaybi)
B4 yerinde gecersiz isaretleme  islem #5,  varyant 2
   -> veri kayboldu: 1 yazma tamamlanmisti, okuma bos dondu
```

### Bulgular

**Naif tasarım senaryoların %40'ında veriyi kaybediyor.** Sürpriz değil ama S25FL512S'te büyüklüğü çarpıcı, çünkü kayıp penceresi 520 ms'lik sektör silmesinin tamamı.

**B2, bu parçanın imza hatası.** Payload ve commit işaretini aynı 16 baytlık birimin ayrık bayt aralıklarına yazmak — yani veriyi hiç bozmadan. Sonuç: **sıfır veri kaybı, sıfır bozulma.** Her fonksiyonel test geçer. Ama senaryoların **%72'sinde** kazanan kaydın EDC'si kapalıdır ve toplam 484 birim koruma ağını kaybetmiştir. Bu, hiçbir testin yakalayamayacağı türden bir hata: sistem çalışıyor, sadece artık korunmuyor. Veri sayfasındaki tek cümlelik uyarının pratikteki karşılığı tam olarak bu tablo satırıdır.

**B4, "eski kaydı yerinde geçersiz işaretle" deseninin neden tehlikeli olduğunu gösteriyor** — hem de iki ayrı şekilde. Birincisi, aynı birime ikinci yazma yine ECC'yi kapatıyor (310 birim). İkincisi ve daha kötüsü: geçersizleştirme ile yeni kaydın commit'i arasında bir pencere var. Kesinti oraya denk gelirse geçerli kayıt zaten geçersiz işaretlenmiş, yenisi ise henüz commit edilmemiştir. Kurtarma **daha eski bir sürüme** düşer. Koşum bunu 42 senaryoda yakaladı ve ayrı bir "eskime" kategorisi olarak raporluyor. Bir sürüm geri gitmek, veri kaybetmekten çoğu zaman daha sinsidir: sistem çalışmaya devam eder, sadece yanlış kalibrasyonla.

**Ve hipotezimi çürüten bulgu: B3, C'den ayırt edilemiyor.** Kurtarma sırasında `ECCRD` ile doğrulama yapmayan tasarım, üç yapılandırmanın hiçbirinde tam tasarımdan farklı sonuç vermedi. Sebebini sonradan gördüm ve mantıklı: doğru iki-birimli düzende **kopmuş bir kayıt zaten kazanamaz.** Payload koptuysa commit işareti hiç yazılmamıştır, kayıt görünmez; commit işareti koptuysa CRC tutmaz, kayıt elenir. Yani yapı, ECC durumuna bakmaya gerek kalmadan kopuk kayıtları dışarıda bırakıyor.

Bu, "ECCRD gereksiz" demek **değil**. Doğru sonuç şu: `ECCRD`, *güç kesintisi doğruluğu* için gerekli değildir; değeri başka yerdedir — yaşlanma (retention, read disturb) kaynaklı tek bit hatalarını görmek ve daha önce kötü bir desenle (B2/B4 gibi) EDC'si kapatılmış birimleri tespit etmek. Sahadaki bir kartın sağlık taramasında yeri var; kurtarma yolunun doğruluk kanıtında yok. Bu ayrımı deney yapmadan önce göremiyordum.

Tabloların yapılandırmaya bağlı olmadığını görmek için üç boyutta koşturdum:

| Yapılandırma | senaryo | A kaybı | B1 kaybı | B2 marjinal | B4 kayıp/eskime | C |
|---|---:|---:|---:|---:|---:|---:|
| 6 birim, 6 yazma | 120 | 35 | 24 | 91 | 21 / 45 | temiz |
| 8 birim, 8 yazma | 123 | 49 | 18 | 88 | 27 / 42 | temiz |
| 12 birim, 12 yazma | 144 | 77 | 12 | 97 | 39 / 45 | temiz |

Sıralama her yapılandırmada aynı; tam tasarım üçünde de sıfır hata veriyor ve B3 üçünde de C ile özdeş.

Tam tasarımdaki 35 "EDC-kapalı birim" merak uyandırabilir: bunlar 123 koşuma yayılmış, yarım kalan silmelerden artakalan **ölü** birimler. Kazanan kayıtta hiç bulunmuyorlar (marjinal sütunu sıfır) ve bir sonraki sektör silmesinde temizleniyorlar — veri sayfasının deyimiyle *"Sector erase resets all ECC bits and ECC disable flags in a sector to the default state (enabled)."*

İki dürüst sınırlama. **Birincisi**, yüzdeleri gerçek dünya olasılığı sanmayın: koşum her işlem indeksine eşit ağırlık veriyor, oysa sahada bir sektör silmesi bir sayfa programlamasından ~1500 kat uzun sürer. Gerçek olasılık dağılımı işlem sürelerine göre ağırlıklıdır — ki bu, naif tasarımın aleyhine daha da çalışır. **İkincisi**, model tek hata varsayımı yapıyor; kurtarma sırasında ikinci bir kesinti enjekte edilmiyor.

---

## Aşınma ve saklama aritmetiği

S25FL512S'in gerçek geometrisiyle bir bütçe çıkaralım: 256 kB sektör, 32 baytlık kayıt, saatte bir yazma, 10 yıl ömür.

```
Sektör başına slot  : (262144 - 32) / 32               = 8191 kayıt
Toplam yazma        : 10 yıl × 8760 saat               = 87.600 yazma
Sektör devri        : 87.600 / 8191                    ≈ 11 devir
Sektör başına silme : 11 / 2                           ≈ 6 silme
```

**Altı silme.** On yılda. 100.000 çevrimlik dayanıklılık spesifikasyonunun on binde birinden azı. Buna karşılık naif tasarımda her yazma bir sektör silmesidir: **87.600 silme**, tek bir sektörde.

Burada asıl mesele, çoğu kişinin sandığı gibi "parça ölür mü" değil. 87.600, 100.000'lik minimum spesifikasyonun altında — parça teknik olarak hayatta kalır. Asıl mesele veri sayfasının şu tablosunda:

| Harcanan P/E çevrimi | Garanti edilen saklama süresi |
|---|---|
| 1.000 çevrim | 20 yıl |
| 10.000 çevrim | 20 yıl |
| **100.000 çevrim** | **2 yıl** |

Dayanıklılık bütçesini sonuna kadar harcamak parçayı öldürmez; **saklama garantisini 20 yıldan 2 yıla düşürür.** Yani naif tasarım, ürününüzün kalibrasyon verisinin ne kadar süre okunabilir kalacağını on kat kısaltır — ve bunu hiçbir test tezgâhında göstermez, çünkü etkisi yıllar sonra ortaya çıkar. Günlükleme tarafında ise 6 çevrimle 1.000 çevrimin çok altında kalırsınız ve 20 yıllık saklama garantisi cebinizde durur.

İkinci hesap, güç kesintisine açık pencere. Naif tasarımda her yazma 520 ms silme + 340 µs programlama, yani yazma başına ~520,3 ms savunmasızlık. Günlükte ise iki ECC birimi programlaması (~680 µs) artı amorti edilmiş silme (520 ms / 8191 ≈ 64 µs), toplam ~744 µs. Oran:

```
520.340 µs / 744 µs ≈ 700
```

Günlük tabanlı tasarım, güç kesintisine açık pencereyi yaklaşık **700 kat** daraltıyor. Aynı zamanda kümülatif silme süresini 10 yılda 12,7 saatten ~6 saniyeye indiriyor — Zynq'te bu doğrudan "boot flash'ının ne kadar süre okunamaz olduğu" demek.

---

## Pratik çıkarımlar

1. **Yerinde güncelleme yapmayın.** 256 kB sektör ve 520 ms silme süresiyle bu, hem doğruluk hem saklama garantisi açısından savunulamaz.
2. **Her ECC birimine bir kez yazın.** Kaydı 32 bayta, iki ayrı 16 baytlık birime yerleştirin. "Yanına bayrak ekleme", "yerinde geçersizleştirme" gibi klasik NOR numaraları bu parçada ECC'yi sessizce kapatır.
3. **Sektör devrini iki fazlı yapın.** Yeni sektör, verisi taşınana kadar yetkili olmamalı.
4. **CRC'yi `(değer, sıra numarası)` çifti üzerinden hesaplayın** ve commit işaretini en sona yazın.
5. **`ECCRD`'yi doğruluk için değil, sağlık taraması için kullanın.** Kurtarma yolunuz zaten kopuk kayıtları eliyorsa ECC sorgusu doğruluğa bir şey katmaz; ama sahadaki bir kartta yaşlanmayı ve geçmişte kapatılmış EDC'leri ancak o gösterir.
6. **Yarım kalmış silme gördüğünüzde sektörü baştan silin.** Üzerine yazmayın.
7. **`P_ERR`/`E_ERR` sonrası `CLSR` göndermeyi unutmayın.** WIP takılı kalır; naif bir "meşgul mü" döngüsü sonsuza kadar bekler.
8. **Zynq'te BAR'ı reset öncesi sıfırlayın.** 16 MB üstünü kullanıyorsanız, yeniden başlatmadan önce flash'a yazılım reset dizisi gönderin — yoksa BootROM yanlış bankadan okur ve kart açılmaz.
9. **Doğrulamayı fiş çekerek değil, enjeksiyonla yapın.** Birkaç yüz satırlık bir model, gerçek donanımda binlerce denemeyle bulunabilecek hataları ilk koşuşta buluyor.

Son madde üzerinde ayrıca durmak isterim, çünkü asıl kazanç tasarımın kendisi değil **yöntem**. Koşum tek bir C dosyası, ana bilgisayarda saniyeler içinde çalışıyor, donanım gerektirmiyor. B4'teki "bir sürüm geriye düşme" hatası gerçek donanımda ancak talihsiz bir zamanlamayla ve muhtemelen sahada ortaya çıkardı. Emniyet-kritik bir bağlamda anormal koşul davranışını kanıtlamanız gerektiğinde, modelleyip tüketmek testin ulaşamadığı yere ulaşır.

---

## Açık sorular

- **Erase Suspend ile kurtarma.** ERSP/EPR kullanarak 520 ms'lik silmeyi bölmek, boot flash'ının okunamaz kaldığı süreyi kısaltır. Ama askıya alınmış bir silme sırasında güç giderse sektörün durumu nedir? Veri sayfası bu konuda sessiz; ölçmek gerekir.
- **Model doğrulama.** Buradaki model veri sayfasından türetildi. Gerçek bir Zynq kartı üzerinde kontrollü güç kesme düzeneğiyle karşılaştırmak, özellikle "yarım kalma" varyantlarının ne kadar temsili olduğunu gösterirdi.
- **Yaşlanma enjeksiyonu.** Bu koşum yalnızca güç kesintisini modelliyor. `ECCRD`'nin asıl değerini ölçmek için retention ve read disturb kaynaklı tek bit hatalarını da enjekte eden ikinci bir deney gerekiyor.

---

## Kaynaklar

- Infineon (Cypress), [S25FL512S, 512 Mbit (64 Mbyte), 3.0 V SPI Flash Memory](https://www.farnell.com/datasheets/2785317.pdf), Doc. 001-98284 — Automatic ECC, ECCSR/ECCRD, 256 kB uniform sektörler, tSE/tPP, `P_ERR`/`E_ERR`/WIP/CLSR, Bank Address Register, dayanıklılık ve saklama tabloları.
- AMD (Xilinx), [AR 57744 — Design Advisory for Zynq-7000 SoC: Zynq and QSPI reset requirements when using larger than 16MB flash](https://adaptivesupport.amd.com/s/article/57744?language=en_US).
- AMD (Xilinx), [AR 64011 — Zynq-7000 SoC: QSPI reset example when using larger than 16MB flash](https://adaptivesupport.amd.com/s/article/64011?language=en_US).
- AMD (Xilinx), [Zynq-7000 SoC Technical Reference Manual (UG585)](https://docs.amd.com/r/en-US/ug585-zynq-7000-SoC-TRM) — QSPI denetleyicisi ve linear addressing modu.
- H.-W. Tseng, L. M. Grupp, S. Swanson, [Understanding the Impact of Power Loss on Flash Memory](https://cseweb.ucsd.edu/~swanson/papers/DAC2011PowerCut.pdf), DAC 2011 — güç kesintisi hata modlarının deneysel taksonomisi.
- Macronix, [AN0291: Program/Erase Cycling Endurance and Data Retention in NOR Flash Memories](https://www.macronix.com/Lists/ApplicationNote/Attachments/1916/AN0291V2-ProgramErase%20Cycling%20Endurance%20and%20Data%20Retention%20in%20NOR%20Flash%20Memories.pdf) — NOR dayanıklılık ve saklama mekanizmaları.

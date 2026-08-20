---
title: "Güç Kesildiğinde Flash'ta Ne Kalır? Atomik Kayıt Tasarımı ve Hata Enjeksiyonu"
subtitle: "Power-Fail-Safe Persistent Storage on Embedded Flash"
background: "/img/posts/6.webp"
date: '2026-08-20 07:00:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [gomulu-sistemler, c-cpp, emniyet-kritik]
---

Gömülü bir cihazda hemen her zaman kalıcı olarak saklanması gereken küçük bir veri kümesi vardır: kalibrasyon katsayıları, seri numarası, çalışma saati sayacı, son arıza kaydı, kullanıcı ayarları. Bunlar RAM'de duramaz, harici bir EEPROM koymak da çoğu zaman maliyet ve kart alanı açısından kabul edilmez. Geriye tek seçenek kalır: MCU'nun kendi program flash'ının bir köşesini ayırıp oraya yazmak.

Bu noktada hemen herkesin yazdığı ilk kod şudur: sayfayı sil, yapıyı yaz, sonuna bir CRC ekle. Açılışta oku, CRC'yi doğrula, tutmuyorsa varsayılanlara dön. Temiz, anlaşılır, ve **yanlış**.

Yanlış olmasının sebebi CRC'nin zayıf olması değil. Sebep, bu tasarımın flash'ın gerçekte nasıl davrandığına dair üç varsayım yapması ve üçünün de tutmaması: yazmanın ya tamamen olup ya hiç olmadığı, yarım kalmış bir hücrenin okunabildiği, ve okumanın yan etkisiz olduğu. Aşağıda önce bu üç varsayımın neden yıkıldığını göstereceğim, sonra dayanıklı bir tasarım kuracağım, en sonunda da o tasarımı **her olası güç kesintisi noktasında tüketici (exhaustive) biçimde sınayan** bir hata enjeksiyon koşumu yazıp sonuçları paylaşacağım. Koşumun bulduğu şeylerden biri benim baştaki hipotezimi çürüttü; onu da olduğu gibi aktarıyorum.

---

## Flash gerçekte ne yapar?

Üç kural, her şeyin kaynağı:

1. **Silme biti 1 yapar, programlama biti 0 yapar.** Programlama tek yönlüdür; 0 olmuş bir biti geri 1 yapmanın tek yolu bütün sayfayı silmektir.
2. **Granularite asimetriktir.** Programlama birimi küçüktür (tipik olarak 32–128 bit), silme birimi ise koca bir sayfadır (1–8 KB).
3. **Programlama ve silme uzun sürer.** Bir sayfa silme milisaniyeler alır. Bu, güç kesintisi için geniş bir *açık pencere* demektir.

Modern STM32'lerde bu tabloya dördüncü ve çoğu kişinin gözden kaçırdığı bir madde ekleniyor: **ECC**. STM32G4 serisinde flash bir defada 72 bit programlanır — kullanıcının gördüğü 64 bit veri, artı görünmeyen 8 bit hata düzeltme kodu ([RM0440](https://www.st.com/resource/en/reference_manual/dm00355726-stm32g4-series-advanced-arm-based-32-bit-mcus-stmicroelectronics.pdf)). ST bu kodu SEC-DED olarak tanımlıyor: Hamming temelli, bir ekstra parite bitiyle güçlendirilmiş; tek bit hatasını düzeltir, çift bit hatasını yalnızca tespit eder ([AN5342](https://www.st.com/resource/en/application_note/an5342--how-to-use-error-correction-code-ecc-management-for-internal-memories-protection-on-stm32-mcus-stmicroelectronics.pdf)).

ECC'nin iki doğrudan sonucu var ve ikisi de tasarımı şekillendiriyor.

**Birincisi, bir double word yalnızca bir kez programlanabilir.** Silinmemiş bir adrese yazmaya çalışmak `FLASH_SR` içindeki `PROGERR` bayrağını kaldırır. Buradaki incelik şu: kısıt veri bitlerinden değil, ECC bitlerinden geliyor. 64 bitin tamamı `0xFF` bile olsa o double word "programlanmış" sayılır, çünkü ECC'si hesaplanıp yazılmıştır. Yani "boş alana sonradan bir bayrak daha eklerim" numarası bu mimaride çalışmaz.

**İkincisi ve daha tehlikelisi:** yarım kalmış bir programlamanın ardından o double word'ün ECC'si tutarsız kalır. Onu **okumak** `ECCD` bayrağını kaldırır ve bir **NMI** üretir. Bunu iyi anlamak gerekiyor, çünkü sezgiye tamamen aykırı:

> ECC'li bir flash'ta yarım yazılmış bir kaydı okumak "çöp veri okumak" değildir. Kesme üretir. CRC kodunuz hiç çalışmaz — çünkü CRC'yi hesaplayacak olan `memcpy` NMI'ye düşer.

Açılışta konfigürasyonu okuyan naif kod, bu senaryoda CRC'ye kadar bile gidemez; cihaz boot edemez. Bu, sahada "cihaz güç kesintisinden sonra açılmıyor" diye dönen arızaların sessiz ve yaygın bir kaynağıdır.

---

## Yarım kalan bir işlem geriye ne bırakır?

"Yazma yarım kaldı" cümlesi kulağa tek bir durum gibi geliyor, ama değil. Bu sorunun kamuya açık en iyi deneysel yanıtı hâlâ Tseng, Grupp ve Swanson'ın DAC 2011 çalışması: beş üreticiden 11 flash yongasına, komutun gönderilmesinden itibaren mikrosaniye çözünürlüklü aralıklarla güç kesip sonucu ölçüyorlar; güç 3,7 µs içinde sıfıra iniyor ([Understanding the Impact of Power Loss on Flash Memory](https://cseweb.ucsd.edu/~swanson/papers/DAC2011PowerCut.pdf)).

Burada bir uyarı borçluyum: o çalışma **ham NAND** yongaları üzerinde yapıldı, MCU-içi NOR flash üzerinde değil. MLC'ye özgü bulguların bir kısmı doğrudan aktarılamaz. Aktarılan şey ise temel ilke ve o ilke can alıcı: **yarım kalan bir işlem, hücreleri okunabilir ama tanımsız bir ara durumda bırakır.** Bulgularından mühendislik açısından en önemli dördü:

- **Hata oranı monoton değil.** İşleme daha çok zaman tanımak daha az hata anlamına gelmiyor. Bit hata oranı platolar ve ani sıçramalar yapıyor; bazı yongalarda kesinti aralığı uzadıkça hata oranı *artıyor*. Yani "yazma neredeyse bitmişti, herhalde iyidir" çıkarımı geçersiz.
- **Geriye dönük bozulma.** MLC'de ikinci sayfayı programlarken yaşanan güç kesintisi, **daha önce başarıyla tamamlanmış** birinci sayfanın verisini bozabiliyor; ölçülen bit hata oranı bir yongada %25'e, diğerinde %50'ye çıkıyor. Yazarların vurguladığı gibi bu davranış veri sayfalarında hiç geçmiyor.
- **Yarım programlanmış veri okumaya karşı kırılgan hale geliyor.** Tam programlanmış bir sayfada read disturb kaynaklı hatalar 2,8 milyon okumadan sonra belirirken, güç kesintisiyle yarım kalmış sayfada **1000 okumadan sonra** beliriyor ve hızla 3,1 × 10⁻³ seviyesine tırmanıyor. Geri okuduğunuzda hatasız görünen bir kayıt, birkaç bin okuma sonra bozulabiliyor.
- **Yarım kalan silme, o bloğa yapılacak gelecekteki yazmaları güvenilmez kılıyor.** Silme komutu tamamlandığını bildirmeden çok önce hücreler zaten 1 olmuş oluyor (50–475 µs), ama yonga kalan 2–4 ms'yi eşik gerilimlerini ince ayarlamakla geçiriyor. Bu ince ayar kesilirse, sonraki programlamaların hata oranı 0'dan %0,4–0,9 bandına çıkıyor.

Son madde, tasarım açısından belki de en önemlisi: **hasar, kesintinin olduğu yazmayla sınırlı değil.** Yarım silinmiş bir sayfa, o sayfaya bundan sonra yazacağınız her şeyi zehirler. "Silmeyi tekrar dene, olur biter" yaklaşımı bu yüzden yetmez; sayfanın yeniden ve tam olarak silinmesi gerekir.

---

## Tasarım: yerinde güncelleme yerine append-only günlük

Bu kısıtların altında doğru cevap, üzerine yazmayı tamamen terk etmek. Kayıtları **ekleyerek** yazarız; en yeni geçerli kayıt kazanır; sayfa dolunca diğer sayfaya devrederiz. ST'nin kendi EEPROM emülasyon kütüphanesi de aynı fikri kullanır: sayfa başlıklarıyla yürütülen bir durum makinesi, iki sayfa arasında günlükleme, ve açılışta çağrılan bir `EE_Init` ile yarım kalmış geçişlerin onarımı ([AN4894](https://www.st.com/resource/en/application_note/an4894-how-to-use-eeprom-emulation-on-stm32-mcus-stmicroelectronics.pdf)).

Kendi düzenim şöyle. Sayfa başına iki double word başlık, geri kalanı ikişer double word'lük kayıt slotları:

```
dw[0]      : RECEIVE başlığı   (MAGIC_R | pageseq)   <- sayfa doldurulmaya başlandı
dw[1]      : ACTIVE  başlığı   (MAGIC_A | pageseq)   <- sayfa artık yetkili
dw[2+2k]   : payload
dw[2+2k+1] : commit işareti    (seq << 32 | crc32(payload, seq))
```

İki tasarım kararı kritik:

**Commit işareti en sona yazılır.** Payload'ı yazarım, sonra üzerine `seq` ve CRC taşıyan işareti koyarım. İşaret yoksa kayıt yok sayılır. Böylece bir kayıt ya tamamen görünür ya hiç görünmez.

**Sayfa devri iki fazlıdır.** Yeni sayfayı silip önce yalnızca `RECEIVE` başlığını yazarım, veriyi taşırım, **ancak ondan sonra** `ACTIVE` başlığını yazarım. Kurtarma yalnızca `ACTIVE` başlığı olan sayfaları yetkili sayar. Kopyalama yarıda kalırsa eski sayfa yetkili kalmaya devam eder.

<div class="mermaid">
stateDiagram-v2
    [*] --> Silinmis
    Silinmis --> Receive: RECEIVE başlığı yazıldı
    Receive --> Aktif: veri taşındı, ACTIVE başlığı yazıldı
    Aktif --> Dolu: slotlar tükendi
    Dolu --> Silinmis: devir sonrası silinir
    Receive --> Silinmis: yarım kalan devir, yeniden silinir
</div>

Kayıt yazma tarafı bu kadar sade:

```c
static void j_write_record(unsigned pg, unsigned s, uint64_t payload, uint32_t seq)
{
    uint64_t mark = ((uint64_t)seq << 32) | rec_crc(payload, seq);
    fl_program(pg, slot_payload_dw(s), payload);   /* önce veri   */
    fl_program(pg, slot_mark_dw(s),    mark);      /* sonra commit */
}
```

Tarama tarafında ise ECC gerçeğiyle yüzleşmek gerekiyor. Her okuma NMI üretebileceği için, kurtarma kodunun okumaları bir yakalayıcı ardında yapması şart:

```c
/* ECC-güvenli okuma: bozuk DW'de NMI yakalanır, *bad = 1 döner. */
static uint64_t safe_read(unsigned pg, unsigned idx, int *bad)
{
    *bad = 0;
    if (!nmi_armed) return fl_read(pg, idx);      /* yakalayıcı yok -> sistem düşer */
    jmp_buf save; memcpy(save, nmi_jmp, sizeof save);
    uint64_t v = 0;
    if (setjmp(nmi_jmp) == 0) v = fl_read(pg, idx);
    else *bad = 1;
    memcpy(nmi_jmp, save, sizeof save);
    return v;
}
```

Gerçek donanımda `setjmp`/`longjmp` yerine NMI işleyicisinin içinde `FLASH_ECCR`'ı okuyup adresin beklenen tarama aralığında olup olmadığına bakar, bayrağı temizler ve akışı devam ettirirsiniz — ST'nin AN5342'de anlattığı yaklaşım da budur. Buradaki model bunun taşınabilir bir taklidi.

---

## Deney: her kesinti noktasında tüketici hata enjeksiyonu

Tasarımın doğru olduğuna ikna olmak için "birkaç kere fişi çektim, sorun görünmüyor" yeterli değil. Kesinti penceresi mikrosaniyeler mertebesinde; rastgele fiş çekmeyle o pencereyi yakalama olasılığınız düşük. Bunun yerine flash'ı **modelleyip** her olası kesinti noktasını tek tek dolaşmak çok daha güçlü.

Model, yukarıdaki üç kuralı ve ECC'yi uyguluyor: silme sayfayı `0xFF` yapar; programlama yalnızca silinmiş bir DW'ye izin verir (aksi halde `PROGERR`); bozuk bir DW'yi okumak NMI üretir. Güç kesintisi, her flash işlemine bir indeks verip belirli bir indekste `longjmp` ile ortadan kaybolarak enjekte ediliyor. Yarım kalan işlemin geriye ne bıraktığı ise üç varyantla modelleniyor — ki bu varyantlar doğrudan DAC 2011 bulgularından geliyor:

```c
static int fl_program(unsigned pg, unsigned idx, uint64_t val)
{
    if (FL.dw[pg][idx] != ERASED_DW || FL.ecc_bad[pg][idx]) { prog_errors++; return -1; } /* PROGERR */

    long me = op_index++;
    if (me == cut_at) {
        switch (cut_variant) {
        case 0:                      /* hücreye hiç dokunulmadı */
            break;
        case 1:                      /* yarım programlandı: ECC yazılamadı -> okunamaz */
            FL.dw[pg][idx]      = val | 0x00FF00FF00FF00FFull;
            FL.ecc_bad[pg][idx] = 1;
            break;
        default:                     /* veri oturdu ama komut dönmedi */
            FL.dw[pg][idx] = val;
            break;
        }
        power_cut();
    }
    FL.dw[pg][idx] = val;
    return 0;
}
```

İş yükü: açılış kurtarması + ardışık N yazma (sayfa devrini zorlayacak kadar). Her senaryoda tek bir kesinti enjekte ediliyor, sonra sistem "yeniden açılıyor", kurtarma çalıştırılıyor ve şu değişmez sınanıyor:

> Okuma ya kesintiden önce **tamamlanmış son yazmanın** değerini, ya da kesinti anında **uçuş halindeki** değeri döndürmeli. Başka hiçbir şeyi değil. Ayrıca kurtarmadan sonra depo hâlâ yazılabilir olmalı.

Karşılaştırma için beş kusurlu varyant ve bir de tam tasarım koşturdum. `PAGE_SIZE=128`, `NWRITES=10`, sayfa başına 7 slot, toplam 28 flash işlemi × 3 varyant = tasarım başına 84 senaryo:

| Tasarım | senaryo | veri kaybı | bozulma | çökme | ECC-NMI koşumu |
|---|---:|---:|---:|---:|---:|
| A — naif yerinde güncelleme | 84 | **36** | 0 | 0 | 20 |
| B1 — tek adımlı sayfa başlığı | 84 | **6** | 0 | 0 | 15 |
| B2 — commit işareti payload'dan önce | 84 | 0 | 0 | 0 | 22 |
| B3 — ECC NMI yakalayıcısı yok | 84 | 0 | 0 | **12** | 12 |
| B4 — taramada önce payload okunuyor | 84 | 0 | 0 | 0 | 22 |
| C — tam tasarım | 84 | 0 | 0 | 0 | 12 |

Koşum her kusur için ilk karşı-örneği de basıyor:

```
A  naif yerinde guncelleme        ilk karsi-ornek: islem #2, varyant 1
   -> veri kayboldu: 1 yazma tamamlanmisti, okuma bos dondu
B1 tek adimli sayfa basligi       ilk karsi-ornek: islem #18, varyant 2
   -> veri kayboldu: 7 yazma tamamlanmisti, okuma bos dondu
B3 ECC NMI yakalayicisi yok       ilk karsi-ornek: islem #2, varyant 1
   -> yeniden acilista cokme (yakalanmamis ECC NMI)
```

Bulguları tek tek okuyalım.

**Naif tasarım senaryoların %43'ünde veriyi kaybediyor.** Sürpriz değil ama büyüklüğü öğretici: silme ile yeniden yazma arasındaki pencere, toplam iş yükünün küçük bir kısmı olmasına rağmen kesinti noktalarının kahir ekseriyetini kaplıyor, çünkü silme uzun ve o pencerede sayfada hiçbir şey yok.

**Tek adımlı sayfa başlığı sessiz ama gerçek bir kayıp kapısı açıyor.** B1'de sayfa devri sırasında yeni sayfa, veri kopyalanmadan önce "yetkili" hale geliyor. Kesinti tam oraya denk gelirse kurtarma boş ama yetkili bir sayfa buluyor ve **yedi tamamlanmış yazmanın** verisi buharlaşıyor. Bu, gerçek kodda bulunması en zor hata sınıfı: yalnızca sayfa devri sırasında, yalnızca dar bir pencerede tetikleniyor. Tüketici arama bunu ilk koşuşta buluyor.

**ECC NMI yakalayıcısının yokluğu doğrudan boot çökmesi.** B3'te veri kaybı yok, bozulma yok — ama senaryoların %14'ünde cihaz açılamıyor. Dikkat çekici bir eşitlik var: B3'ün çökme sayısı (12), tam tasarımın ECC-NMI gördüğü koşum sayısına (12) tam olarak eşit. Yani **kurtarma sırasında karşılaşılan her ECC hatası, yakalayıcı yoksa bir boot çökmesidir.** Aradaki tek fark, o hatayı işleyip işlemediğiniz.

**Ve hipotezimi çürüten bulgu.** Bu koşumu yazarken beklentim, commit işaretini payload'dan önce yazmanın (B2) veri bozulmasına yol açacağıydı. Açmadı: 84 senaryonun hiçbirinde bozulma yok. Sebebini sonradan gördüm — CRC yalnızca payload'ı değil, `(payload, seq)` çiftini kapsıyor. İşaret yazılıp payload yarım kalırsa CRC tutmuyor ve kayıt zaten eleniyor. Yani **sıralama, doğruluk açısından fark yaratmıyor.**

Sıralamanın fark yarattığı yer başka: **ECC hatasına maruz kalma.** B2 ve B4, C ile aynı doğruluğu veriyor ama neredeyse iki katı koşumda NMI üretiyor (22'ye karşı 12). Sebep şu: payload'ı önce yazıp taramada işareti önce okursanız, yarım kalmış payload double word'üne **hiç dokunmazsınız** — üzerindeki işaret silinmiş durumda olduğu için tarama orada durur. Doğru sıralama hatayı önlemiyor, hatayla karşılaşma sayısını yarıya indiriyor. Emniyet-kritik bir üründe bu önemli: her NMI, doğrulanması ve DO-178C anlamında test edilmesi gereken bir istisna yolu demek. Yolun kendisinden kurtulamıyorsunuz ama tetiklenme yüzeyini küçültebiliyorsunuz.

Sonuçların yapılandırmaya bağlı olmadığını görmek için üç farklı boyutta koşturdum:

| Yapılandırma | senaryo | A kaybı | B1 kaybı | B3 çökmesi | C |
|---|---:|---:|---:|---:|---:|
| `PAGE_SIZE=64`, 8 yazma | 102 | 28 | 18 | 12 | temiz |
| `PAGE_SIZE=128`, 10 yazma | 84 | 36 | 6 | 12 | temiz |
| `PAGE_SIZE=256`, 20 yazma | 144 | 76 | 6 | 22 | temiz |

Sıralama her yapılandırmada aynı; tam tasarım üçünde de sıfır hata veriyor.

İki dürüst sınırlama: **Birincisi**, yüzdeleri gerçek dünya olasılığı sanmayın. Koşum her işlem indeksine eşit ağırlık veriyor, oysa sahada bir silme işlemi bir programlamadan onlarca kat uzun sürer; gerçek olasılık dağılımı işlem sürelerine göre ağırlıklıdır. Buradaki sayılar tasarımları **birbirine göre** sıralamak için anlamlı, mutlak arıza oranı kestirmek için değil. **İkincisi**, model tek hata varsayımı yapıyor: kurtarma sırasında ikinci bir kesinti enjekte edilmiyor. Gerçekte art arda gelen kesintiler mümkündür; günlük tabanlı tasarım buna karşı da yapısal olarak dayanıklıdır (kurtarma yalnızca okuma yapar, `ACTIVE` başlığı yazılana kadar hiçbir şey yetkili olmaz) ama bunu bu koşum kanıtlamıyor.

---

## Ömür hesabı: günlükleme yalnızca doğruluk meselesi değil

Append-only tasarımın ikinci ve daha az konuşulan faydası aşınma. Somut bir bütçe çıkaralım: 2 KB'lik iki sayfa, 16 baytlık kayıtlar, saatte bir yazma, 10 yıl ömür.

```
Sayfa başına slot   : (2048 - 16) / 16            = 127 kayıt
Toplam yazma        : 10 yıl × 8760 saat          = 87.600 yazma
Sayfa devri sayısı  : 87.600 / 127                ≈ 690 devir
Sayfa başına silme  : 690 / 2                     ≈ 345 silme
```

Karşılaştıracağımız bütçe, MCU-içi flash'ın dayanıklılık spesifikasyonu. Pek çok STM32 ailesinde bu değer **10.000 çevrim**; yalnızca bazı yeni serilerde, banka başına sınırlı bir bölge için 100.000 çevrime çıkıyor ([STM32U5 flash eğitim notu](https://www.st.com/resource/en/product_training/stm32u5-memory-flash.pdf)). 10.000 çevrime karşı 345 silme, bütçenin **%3,5'i** — rahat bir pay.

Naif tasarımda ise her yazma bir silme demek: **87.600 silme**, hem de tek bir sayfada. Bu, aynı bütçeyi **8,8 kat** aşar. Daha somut söylersek: 10.000 çevrimlik pay, saatte bir yazmayla 10.000 saatte, yani **yaklaşık 14 ayda** tükenir. Cihaz ikinci yılını göremez. Günlükleme burada bir optimizasyon değil, ürünün ömrünü mümkün kılan şey.

Dayanıklılığın diğer yüzü **veri saklama (retention)**. İkisi birbirinden bağımsız değil: NOR flash'ta baskın aşınma mekanizması tünel oksidinde elektron tuzaklanması ve bu hasar esas olarak silme/yazma çevrimlerinde oluşuyor. Micron'un TN-12-30 teknik notu, hasarın termal olarak giderilmesini (annealing) Arrhenius ilişkisiyle modelliyor ve detrapping aktivasyon enerjisini **1,1 eV** olarak veriyor (JESD22-A117'ye atıfla). Aynı notta pratik denklikler var: 125 °C'de 1000 saatlik çevrimsiz stres, 55 °C'de yaklaşık **100 yıllık** gerçek kullanıma; ya da 70 °C'de 20 yıla karşılık geliyor.

Buradan çıkan mühendislik kuralı basit ama sık ihlal ediliyor: **saklama süresi spesifikasyonu, harcadığınız çevrim sayısına bağlıdır.** JESD47I'in çevrim sonrası saklama testi (PCHTDR) tam da bunu ayrıştırır — maksimum çevrim spesifikasyonunun %10'una kadar kullanılmış bir parça için 55 °C'de 10 yıl beklenirken, spesifikasyonun %100'ünü tüketmiş bir parça için aynı sıcaklıkta beklenti 1 yıla iner. Yani dayanıklılık bütçesini sonuna kadar harcamak yalnızca "parça ölür" demek değil; **ölmeden çok önce veriyi tutamaz hale gelir** demek. Aşınma bütçesini %10'un altında tutmanın gerçek sebebi budur.

---

## Pratik çıkarımlar

Sahada bu işi yapacak birine bırakacağım liste:

1. **Yerinde güncelleme yapmayın.** Ekleyerek yazın, en yeni geçerli kaydı seçin, sayfayı devredin. Bu hem doğruluk hem ömür için gerekli.
2. **Commit işaretini en sona yazın ve taramada onu ilk okuyun.** Doğruluğu CRC zaten kurtarıyor, ama bu sıralama ECC hata yüzeyini yarıya indiriyor.
3. **ECC'li bir parçada NMI işleyicisi yazmadan kalıcı depolama yapmayın.** Bu opsiyonel bir sağlamlaştırma değil; onsuz güç kesintilerinin ölçülebilir bir kısmı doğrudan boot çökmesine dönüşüyor.
4. **Sayfa devrini iki fazlı yapın.** Yeni sayfa, verisi taşınana kadar yetkili olmamalı. Tek adımlı başlık, bulunması en zor kayıp kapısıdır.
5. **CRC'yi `(payload, sıra numarası)` çifti üzerinden hesaplayın.** Yalnızca payload'ı kapsayan bir CRC, yarım yazılmış bir başlıkla eşleşen eski bir payload'ı geçerli gösterebilir.
6. **Yarım kalmış silme gördüğünüzde sayfayı yeniden ve tam silin.** Kısmen silinmiş bir sayfa, sonraki yazmaların hata oranını yükseltir; "üzerine yazayım" demeyin.
7. **Doğrulamayı fiş çekerek değil, enjeksiyonla yapın.** Kesinti pencereleri mikrosaniyelerle ölçülüyor; rastgele deneme o pencereyi bulamaz. Flash'ı modelleyip her noktayı dolaşmak birkaç yüz satırlık iş ve gerçek hataları ilk koşuşta buluyor.

Son madde üzerinde ayrıca durmak isterim, çünkü buradaki asıl kazanç tasarımın kendisi değil **yöntem**. Yukarıdaki koşum yaklaşık 430 satır, tek bir C dosyası, ana bilgisayarda saniyeler içinde koşuyor ve donanım gerektirmiyor. Buna karşılık B1'deki sayfa devri hatası, gerçek donanımda ancak binlerce güç kesintisi denemesinden sonra ve muhtemelen sahada ortaya çıkardı. Emniyet-kritik bir bağlamda anormal koşul davranışını kanıtlamanız gerektiğinde, "modelleyip tüket" yaklaşımı, testin ulaşamadığı yere ulaşır.

---

## Açık sorular

- **Çoklu kesinti.** Bu koşum tek hata varsayıyor. Kurtarma sırasında ikinci bir kesintiyi de enjekte eden iç içe bir arama, durum uzayını karesel büyütür ama zayıf noktaları ortaya çıkarabilir.
- **Okuma sonrası bozulma.** DAC 2011, yarım programlanmış verinin 1000 okumadan sonra bozulduğunu gösteriyor. Kurtarma kodunuz böyle bir kaydı "geçerli" bulup yerinde bırakırsa, bir sonraki açılışta bozulmuş olabilir. Doğru davranış, kurtarmada bulunan her şüpheli kaydı taze bir slota **yeniden yazmak** — ama bunun aşınma maliyeti var ve dengeyi ölçmedim.
- **Model doğrulama.** Buradaki flash modeli veri sayfalarından ve literatürden türetildi; gerçek bir STM32 üzerinde kontrollü güç kesme düzeneğiyle karşılaştırılması, modelin varyantlarının ne kadar temsili olduğunu gösterirdi. Bu, bu yazının doğal devamı.

---

## Kaynaklar

- STMicroelectronics, [RM0440 — STM32G4 Series Reference Manual](https://www.st.com/resource/en/reference_manual/dm00355726-stm32g4-series-advanced-arm-based-32-bit-mcus-stmicroelectronics.pdf) — flash programlama granularitesi (64 bit veri + 8 bit ECC), `PROGERR`, `FLASH_ECCR`.
- STMicroelectronics, [AN5342 — How to use error correction code (ECC) management for internal memories protection on STM32 MCUs](https://www.st.com/resource/en/application_note/an5342--how-to-use-error-correction-code-ecc-management-for-internal-memories-protection-on-stm32-mcus-stmicroelectronics.pdf) — SEC-DED şeması, `ECCD` ve NMI işleme.
- STMicroelectronics, [AN4894 — How to use EEPROM emulation on STM32 MCUs](https://www.st.com/resource/en/application_note/an4894-how-to-use-eeprom-emulation-on-stm32-mcus-stmicroelectronics.pdf) — sayfa durum makinesi, günlükleme ve `EE_Init` onarımı.
- H.-W. Tseng, L. M. Grupp, S. Swanson, [Understanding the Impact of Power Loss on Flash Memory](https://cseweb.ucsd.edu/~swanson/papers/DAC2011PowerCut.pdf), DAC 2011 — güç kesintisi hata modlarının deneysel taksonomisi.
- Micron, [TN-12-30: NOR Flash Cycling Endurance and Data Retention](https://web.pa.msu.edu/people/edmunds/Disco_Kraken/Components/Flash_Memory/micron_tn1230_nor_flash_endurance_and_data_retention.pdf) — JESD47I nitelendirme, Arrhenius modeli, 1,1 eV detrapping aktivasyon enerjisi.
- Macronix, [AN0291: Program/Erase Cycling Endurance and Data Retention in NOR Flash Memories](https://www.macronix.com/Lists/ApplicationNote/Attachments/1916/AN0291V2-ProgramErase%20Cycling%20Endurance%20and%20Data%20Retention%20in%20NOR%20Flash%20Memories.pdf) — NOR dayanıklılık ve saklama mekanizmaları.
- JEDEC, JESD22-A117 (EEPROM dayanıklılık ve saklama stres testi) ve JESD47 (entegre devre nitelendirme standardı).

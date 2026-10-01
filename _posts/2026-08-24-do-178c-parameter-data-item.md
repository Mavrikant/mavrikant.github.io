---
title: "Kod Doğru, Veri Yanlış: DO-178C'de Parameter Data Item"
subtitle: "When the Code Is Right and the Data Is Wrong: Parameter Data Items in DO-178C"
background: "/img/posts/4.webp"
date: '2026-08-24 06:00:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [do-178c, sertifikasyon, gomulu-sistemler]
---

Emniyet kritik yazılım tartışmalarının neredeyse tamamı kodun etrafında döner: MC/DC kapsama, statik analiz, izlenebilirlik matrisi, derleyici nitelendirmesi. Oysa sahada gördüğüm en sinsi arızaların çoğu koddan değil, **kodun okuduğu veriden** çıkıyor. Kalibrasyon tabloları, limit değerleri, konfigürasyon blob'ları, uçuş zarfı parametreleri, bölümleme zaman bütçeleri... Bunlar derlenmiyor, birim testine girmiyor, çoğu projede "veri işte" diye kenarda duruyor. Ve kod kusursuz çalışırken sistem yanlış davranıyor.

DO-178C bu boşluğu kapatmak için DO-178B'de hiç olmayan bir kavram getirdi: **Parameter Data Item (PDI)**. Bu yazı, PDI'ın standartta nerede geçtiğini, hangi maddesinin en çok kaçırıldığını ve bir PDI dosyasının hedefte sessizce yanlış okunmasının ne kadar kolay olduğunu gerçek bir derleme çıktısı üzerinden anlatıyor. Sonunda da, yükleme anında bu hataları reddeden bir okuyucunun nasıl kurulduğunu gösteriyorum.

---

## Neden bu konu az konuşuluyor

PDI, ücretli bir standardın içine gömülü, birbirinden kopuk sekiz-on paragrafa dağılmış bir kavram. Tek bir "PDI bölümü" yok: planlamada bir bullet, gereksinimlerde bir cümle, doğrulamada ayrı bir alt bölüm, konfigürasyon yönetiminde bir genişletme, Annex A'da iki objektif. Standardı satın alıp baştan sona okumadıysanız — ki çoğu mühendis okumaz, projedeki plan dokümanlarını okur — kavramın bütününü hiçbir yerde göremezsiniz. Türkçe kaynak ise pratikte yok. İngilizce kaynakların çoğu da eğitim şirketlerinin pazarlama sayfaları; standardın hangi maddesinin ne dediğini net söyleyen az.

İyi haber şu: FAA'in kamuya açık **"DO-178B/C Differences Tool"** dokümanı, DO-178C'nin hangi bölümlerine PDI'nın nasıl girdiğini madde madde listeliyor. Aşağıdaki haritanın omurgası oradan geliyor.

---

## Önce hikâye: 9 Mayıs 2015, Sevilla

A400M MSN023 ilk uçuşuna çıktı. Uçak Haziran'da Türk Hava Kuvvetleri'ne teslim edilecekti. Havalanıştan kısa süre sonra Sevilla San Pablo havalimanına 5 km'den yakın bir noktada, La Rinconada'ya düştü; altı mürettebattan dördü hayatını kaybetti.

Kamuya açık kaynaklara göre olayın kökeni şuydu: uçuşun öncesinde motorların **ECU (Engine Control Unit)** yazılımı Airbus tesisinde yeniden yüklenirken, üç motorda **tork kalibrasyon parametre verisi kazara silindi ve geri yazılmadı**. FADEC'ler bu parametreleri okuyamadığı için motorlar korumalı bir moda düştü. Airbus'ın ifadesiyle "1, 2 ve 3 numaralı motorlar havalanıştan sonra *power frozen* durumuna geçti ve mürettebatın güç ayarını normal yolla değiştirme girişimlerine yanıt vermedi."

Bu vakanın bu yazı için kritik olan üç ayrıntısı var:

1. **Kod doğruydu.** ECU'daki uygulama yazılımı sertifikalıydı ve beklendiği gibi çalışıyordu. Yanlış olan, o yazılımın okuduğu veriydi.
2. **Yükleme "başarılı" göründü.** Veri eksikliği yükleme anında değil, uçuş sırasında ortaya çıktı.
3. **Yerde hiçbir kokpit uyarısı yoktu.** Basına yansıyan bilgiye göre mürettebatın alacağı ilk uyarı, uçak yaklaşık 120 metre irtifadayken geliyordu — yani kalkışı iptal etmenin çoktan imkânsız olduğu noktada.

Sevilla kazasının resmî teknik raporu İspanya Silahlı Kuvvetleri kaza komisyonu CITAAM tarafından yürütüldü ve tamamı kamuya açık değil; bu yüzden yukarıdaki ayrıntıları "kesin sebep" diye değil, **kamuya açık kaynakların anlattığı senaryo** olarak okuyun. Ama senaryonun mühendislik dersi, resmî raporun ayrıntılarından bağımsız olarak geçerli: bir konfigürasyon verisinin yokluğu, sistemi sessizce güvenli olmayan bir duruma sokabiliyor.

Bağlam için: A400M'in 13 Mart 2013 tarihli bir EASA sivil tip sertifikası var, TP400-D6 motorunun da ayrı bir EASA motor tip sertifikası (EASA.E.033) bulunuyor ve motorun tip sertifikası veri sayfası FADEC'i "Engine Control Unit and Application Software" olarak listeliyor. Yani bu, sivil sertifikasyon dünyasının kavramlarının doğrudan uygulandığı bir alan.

---

## DO-178C'nin cevabı: Parameter Data Item

DO-178C, Annex B sözlüğüne iki yeni terim ekledi. PDI'ın tanımı özetle şu: *Parameter Data Item File biçiminde olduğunda, Executable Object Code'u değiştirmeden yazılımın davranışını etkileyen ve **ayrı bir konfigürasyon öğesi olarak yönetilen** veri kümesi.*

Tanımın her parçası kasıtlı:

- **"Executable Object Code'u değiştirmeden"** — PDI'yı değiştirmek için yeniden derleme gerekmez. Güç de buradan gelir, tehlike de.
- **"Yazılımın davranışını etkileyen"** — yani bir log dosyası ya da kullanıcı tercihi değil. Sistemin fonksiyonel davranışını belirleyen veri.
- **"Ayrı bir konfigürasyon öğesi"** — kendi part number'ı, kendi baseline'ı, kendi izlenebilirliği olan bağımsız bir yaşam döngüsü verisi.

Bu tanımın en önemli sonucu şu: **PDI, "veri" olduğu için daha az disiplin gerektiren bir şey değil.** Aksine, DO-178C'nin planlama maddesi (§4.2.j) açıkça PDI'ların *software level*'ının planlarda belirlenmesini istiyor. DAL A bir fonksiyonun davranışını belirleyen bir kalibrasyon tablosu, pratikte DAL A titizliğiyle üretilip doğrulanması gereken bir yaşam döngüsü verisidir.

### PDI'ın DO-178C haritası

DO-178C'de tek bir "PDI bölümü" yok; kavram yaşam döngüsünün her aşamasına serpiştirilmiş durumda:

| Bölüm | Ne diyor |
|---|---|
| **§2.5.1 Parameter Data Items** | Yeni bölüm. PDI'ın ne olduğunu, neler içerdiğini ve nelerin ele alınması gerektiğini tanımlar |
| **§4.2.j** | Planlamada ele alınacaklar: PDI'ların kullanım şekli, **software level'ı**, geliştirme/doğrulama/değiştirme süreçleri, ilgili **araç nitelendirmesi**, yükleme kontrolü ve uyumluluk |
| **§5.1.2** | Üst seviye gereksinimler PDI'ın nasıl kullanıldığını, **yapısını**, her veri elemanının **özniteliklerini** ve uygulanabildiğinde **değerlerini** belirtmeli |
| **§5.4.1a / §5.4.2** | Entegrasyon süreci artık PDI dosyalarını da üretir |
| **§6.6 Verification of Parameter Data Items** | Yeni bölüm. PDI doğrulamasının EOC doğrulamasından **ayrı** yürütülebilmesi için sağlanması gereken koşulları ve doğrulama faaliyetlerini verir |
| **§7.2.1.e, §7.2.7.d/e** | Konfigürasyon tanımlama ve arşivleme kapsamı PDI dosyalarını içerecek şekilde genişletildi |
| **§8.3.e** | Conformity review: PDI dosyaları da arşivlenmiş kaynaktan **yeniden üretilebilmeli** |
| **§11.16** | Software Configuration Index, kullanılan PDI dosyalarını ve build talimatlarındaki yerini açıkça tanımlamalı |
| **§11.22 Parameter Data Item File** | Yeni bölüm. PDI dosyasının neyden oluştuğunu açıklar |
| **Tablo A-2** | Hedefe yüklenmeye ilişkin objektife PDI eklendi |
| **Tablo A-5** | **İki yeni objektif** eklendi: PDI dosyasının doğru ve tam olması, ve doğrulanmış olması |

Tablo A-5'e eklenen iki objektif ikincil kaynaklarda genellikle **#8** ("Parameter Data Item File is correct and complete") ve **#9** (bu doğrulamanın gerçekleştirilmiş olması) diye numaralandırılıyor. FAA'in farklar dokümanı numara vermeden "iki ek objektif" diyor; numaralandırmayı bu kayıtla kullanın. Bu arada, bazı ikincil kaynaklarda PDI objektiflerinin Tablo A-6 ve A-7'de olduğu yazıyor — bu büyük olasılıkla hatalı; A-7'nin dokuzuncu objektifi yaygın olarak kaynak koda izlenemeyen ek kodun doğrulanması (object code verification) objektifi olarak biliniyor.

<div class="mermaid">
flowchart TB
    SYS["Sistem süreçleri - ARP4754A"] --> HLR["§5.1.2 HLR: PDI nasıl kullanılır, yapısı, öznitelikleri, değerleri"]
    HLR --> INT["§5.4.1a Entegrasyon: PDI File üretilir"]
    HLR --> V66["§6.6 PDI doğrulaması - EOC'den ayrı olabilir"]
    INT --> V66
    V66 --> A5["Tablo A-5: PDI File doğru ve tam + doğrulandı"]
    INT --> CM["§7.2.1.e / §7.2.7 Konfigürasyon kimliği ve arşiv"]
    CM --> SCI["§11.16 SCI: hangi PDI dosyası, hangi build"]
    CM --> CONF["§8.3.e Conformity: arşivden yeniden üretilebilir mi"]
    A5 --> LOAD["§7.4 Software Load Control + ARINC 665 / 615A"]
    SCI --> LOAD
    LOAD --> TGT["Hedef donanım: EOC + PDI File"]
</div>

---

## En çok kaçırılan madde: §5.1.2

PDI ile ilgili projelerde en sık atlanan yer, doğrulama tarafı değil **gereksinim** tarafı. DO-178C §5.1.2, PDI planlanıyorsa üst seviye gereksinimlerin şunları belirtmesini istiyor:

- PDI'ın yazılım tarafından **nasıl kullanıldığını**,
- PDI'ın **yapısını** (structure),
- her veri elemanının **özniteliklerini** (attributes),
- uygulanabildiğinde her elemanın **değerini**,

ve ek olarak: eleman değerleri, PDI'ın yapısı ve veri elemanlarının öznitelikleriyle **tutarlı** olmalı.

Bu maddeyi bir sertifikasyon formalitesi gibi okumak kolay. Ama pratikte söylediği şey çok somut: **PDI dosyasının ikili düzeni bir gereksinim nesnesidir.** Alan sırası, alan genişliği, işaretlilik, ölçek birimi, geçerli aralık, endianlık — bunların hepsi HLR'de tanımlanmış olmak zorunda, çünkü hedefteki kod bu düzene göre okuma yapacak.

Bunu yapmadığınızda ne olduğunu göstermenin en iyi yolu, denemek.

---

## Deney: bir PDI dosyasını struct'a serimlemek

Aşağıdaki deneyi kendi makinemde (Apple clang 21.0.0, `arm64-apple-darwin25.5.0`, `gcc -std=c11 -O2 -Wall -Wextra`) çalıştırdım; çıktılar birebir kopyalanmıştır. Senaryo sentetik ama düzeni gerçek hayattan tanıdıksınız: bir tork kalibrasyon PDI'ı, dört alan, 12 bayt.

Üretici taraftaki araç bu yapıyla yazıyor:

```c
typedef struct {
    uint16_t schema;          /* şema sürümü          */
    uint16_t n_points;        /* tablo eleman sayısı  */
    float    k_nm_per_count;  /* ölçek  [Nm/count]    */
    float    offset_nm;       /* sıfır noktası [Nm]   */
} calib_gen_t;
```

Hedefteki EOC ise aynı şema sürümünü okuduğunu düşünüyor, ama başlık dosyası bir revizyonda "okunabilirlik için" düzenlenmiş ve iki `float` alanın sırası değişmiş:

```c
typedef struct {
    uint16_t schema;
    uint16_t n_points;
    float    offset_nm;       /* <-- yer değiştirdi */
    float    k_nm_per_count;
} calib_eoc_t;
```

İki yapının **boyutu aynı**: 12 bayt. Derleyici hiçbir uyarı vermez. `schema` alanı hâlâ 1 okunur, `n_points` hâlâ 4 okunur — yani naif bir "şema sürümü kontrolü" bile bu hatayı yakalayamaz. Dosya sorunsuz "yüklenir".

```text
== Yapı düzeni ==
sizeof(calib_gen_t) = 12, sizeof(calib_eoc_t) = 12
gen: schema@0 n_points@2 k@4 offset@8
eoc: schema@0 n_points@2 k@8 offset@4

== PDI dosyası (12 bayt) ==
uretici yazdi:        01000400 0000003E 000016C2

== Senaryo 1: doğru şema ==
k=0.1250 offset=-37.50 -> tork = 337.50 Nm

== Senaryo 2: alan sırası değişmiş EOC aynı dosyayı okuyor ==
okunan: schema=1 n_points=4 k=-37.5000 offset=0.12
-> tork = -112499.88 Nm  (beklenen 337.50 Nm)
```

Hexdump'ı okumak öğretici: little-endian'da `0000003E` baytları `0x3E000000` yani `0.125f`, `000016C2` ise `0xC2160000` yani `-37.5f`. İki alan yer değiştirdiği anda ölçek katsayısı `-37.5` oluyor ve 3000 sayaçlık ham okuma **-112499.88 Nm**'ye dönüşüyor. Hiçbir hata kodu, hiçbir kesme, hiçbir log yok. Sadece yanlış bir sayı.

Şimdi asıl ilginç kısım — PDI bölgesinin hiç yazılmamış olduğu durumlar:

```text
== Senaryo 3: PDI bölgesi silinmiş (flash erased, 0xFF) ==
okunan: schema=65535 n_points=65535 k=nan offset=nan
-> tork = nan Nm

== Senaryo 4: PDI bölgesi sıfırlanmış (0x00) ==
okunan: schema=0 n_points=0 k=0 offset=0
-> tork = 0 Nm  (her ham değerde 0 — sensör 'sağlam', motor 'tork üretmiyor')
```

Dördüncü senaryo, bu yazının kalbi. Silinmiş bir flash bölgesi ya da sıfırlanmış bir RAM alanı, `float` olarak okunduğunda **tam olarak 0.0f** verir — çünkü IEEE-754'te tamamı sıfır olan bit deseni geçerli bir sayıdır, hem de en masum görünenidir. Bir ölçek katsayısı sıfır olduğunda sistem çökmez, hata vermez, bölme hatası üretmez. Sadece **her ham okumayı sıfıra çevirir**. Sensör sağlıklı, kablo sağlam, kod doğru; ölçülen büyüklük ise kalıcı olarak sıfır.

Üçüncü senaryonun (`0xFF` silinmiş flash) ürettiği `NaN` aslında daha şanslı bir durum: `NaN` en azından tüm karşılaştırmalarda `false` döndürerek çoğu aralık kontrolünü tetikler. Sıfır ise hiçbir şeyi tetiklemez. Yani **en tehlikeli bozuk veri, en makul görünen bozuk veridir.**

---

## Sessiz varsayılan sorunu

Yukarıdaki dört senaryonun ortak paydası, kodun hiçbir aşamada "bu veri gerçekten yüklendi mi?" sorusunu sormaması. Gömülü yazılımda bu, birkaç yaygın alışkanlıktan doğuyor:

- **Struct serimleme (overlay).** `memcpy(&cfg, flash_addr, sizeof cfg)` ya da doğrudan `(const cfg_t *)FLASH_BASE` cast'i. Bu, dosya biçimini derleyicinin ABI kararlarına — padding, hizalama, bit-field sıralaması, endianlık — teslim etmek demektir. §5.1.2'nin "yapı ve öznitelikler HLR'de tanımlanmalı" maddesi tam da bunu engellemek için var.
- **Statik başlatıcıyla "güvenli varsayılan".** `static cfg_t cfg = { .k = 0.0f };` gibi bir varsayılan, yükleme başarısız olduğunda kodu çalışır durumda tutar. Kâğıt üzerinde savunmacı görünür; pratikte arızayı gizler.
- **`.bss` sıfırlaması.** PDI yapısı başlatılmamış bir global ise, C çalışma zamanı onu zaten sıfırlar. Yükleme hiç olmasa bile değişken "geçerli" görünen sıfırlarla dolar.
- **Yükleme kontrolünü taşıma katmanına havale etmek.** ARINC 665 tabanlı bir yükleme parçasının kendi CRC alanları vardır ve ARINC 615A yüklemesi başarıyla biter. Ama bu yalnızca **baytların doğru taşındığını** kanıtlar; taşınan baytların doğru PDI olduğunu, doğru sürüm olduğunu ya da hedefteki EOC'ye uyduğunu kanıtlamaz.

DO-178C §6.6'nın PDI doğrulamasını EOC doğrulamasından ayırma imkânı tanımasının bedeli de burada ortaya çıkıyor: PDI'yı bağımsız doğrulayabiliyorsanız, EOC'nin o PDI'yı **çalışma zamanında** doğru şekilde yorumladığını gösteren ayrı bir kanıta ihtiyacınız var. İkisi arasındaki sözleşme, tam olarak dosya biçiminin kendisidir.

---

## Savunma deseni: yükleme anında reddeden okuyucu

Çözüm karmaşık değil, sadece disiplinli. PDI dosyasına kendi kendini tanımlayan bir çerçeve koyun ve okuma işlemini bayt akışından açık biçimde yapın:

```c
#define PDI_MAGIC   0x50444931u   /* "PDI1" */
#define PDI_SCHEMA  1u
#define PDI_LEN     24u  /* magic4 + schema2 + npts2 + k4 + off4 + partno4 + crc4 */

/* Bayt akışından açık okuma — struct serimlemesi yok */
static uint16_t rd16(const uint8_t *p) { return (uint16_t)(p[0] | (p[1] << 8)); }
static uint32_t rd32(const uint8_t *p) {
    return (uint32_t)p[0] | ((uint32_t)p[1] << 8)
         | ((uint32_t)p[2] << 16) | ((uint32_t)p[3] << 24);
}
static float rdf32(const uint8_t *p) {
    uint32_t u = rd32(p); float f; memcpy(&f, &u, 4); return f;
}

static pdi_status_t pdi_load(const uint8_t *buf, size_t len,
                             uint32_t eoc_expects_part, calib_t *out)
{
    if (len != PDI_LEN)                       return PDI_ERR_LEN;
    if (rd32(buf + 0) != PDI_MAGIC)           return PDI_ERR_MAGIC;
    if (rd16(buf + 4) != PDI_SCHEMA)          return PDI_ERR_SCHEMA;
    if (rd32(buf + 20) != crc32(buf, 20))     return PDI_ERR_CRC;

    uint16_t n   = rd16(buf + 6);
    float    k   = rdf32(buf + 8);
    float    off = rdf32(buf + 12);
    uint32_t pn  = rd32(buf + 16);

    /* HLR'den gelen aralık ve öznitelik kontrolleri - DO-178C §5.1.2 */
    if (n < 2u || n > 64u)                    return PDI_ERR_RANGE;
    if (!(k > 0.01f && k < 10.0f))            return PDI_ERR_RANGE;   /* NaN da elenir */
    if (!(off > -500.0f && off < 500.0f))     return PDI_ERR_RANGE;
    if (pn != eoc_expects_part)               return PDI_ERR_COMPAT;

    out->n_points = n; out->k_nm_per_count = k;
    out->offset_nm = off; out->part_no = pn;
    return PDI_OK;
}
```

Aynı sekiz senaryoyu bu okuyucudan geçirdiğimde çıkan sonuç:

```text
1) gecerli PDI            -> OK  (k=0.125 off=-37.5 n=4)
2) silinmis bolge (0x00)  -> REDDEDILDI: magic
3) silinmis bolge (0xFF)  -> REDDEDILDI: magic
4) tek bit bozulmus CRC   -> REDDEDILDI: CRC-32
5) alanlar yer degistirmis-> REDDEDILDI: aralik disi deger
6) yanlis part number     -> REDDEDILDI: EOC/PDI uyumsuz
7) sema v2 dosyasi        -> REDDEDILDI: sema surumu
8) kisa dosya (20 bayt)   -> REDDEDILDI: uzunluk
```

Tasarımdaki her kontrolün hangi arıza sınıfını yakaladığına dikkat edin — hiçbiri süs değil:

| Kontrol | Yakaladığı arıza |
|---|---|
| Uzunluk | Kesilmiş/eksik yükleme, yanlış dosya |
| Magic | Yazılmamış/silinmiş bölge, tamamen yanlış blob |
| Şema sürümü | Biçim değişikliği sonrası eski/yeni dosya karışması |
| CRC-32 | Bit bozulması, kısmi yazma, flash yıpranması |
| Aralık kontrolü | Anlamsal bozulma: alan kayması, yanlış birim, `NaN` |
| Part number uyumu | Yanlış motor pozisyonu, yanlış kuyruk numarası, yanlış varyant |

Birkaç ayrıntı önemli:

**Aralık kontrolünü pozitif biçimde yazın.** `if (!(k > 0.01f && k < 10.0f))` ifadesi, `k` `NaN` olduğunda da reddeder; çünkü `NaN` ile yapılan her karşılaştırma `false` döner. Bunu `if (k < 0.01f || k > 10.0f)` diye yazsaydınız `NaN` her iki testi de geçemez ve **kabul edilirdi**. Emniyet kritik kodda bu tek satırlık fark, üçüncü senaryoyu sessiz kabule çevirir.

**CRC'yi doğrulayın, doğrulamasını da doğrulayın.** Yukarıdaki kod yansıtmalı CRC-32 (ters polinom `0xEDB88320`) kullanıyor. Uygulamanın doğruluğunu standart kontrol vektörüyle sınadım: `CRC32("123456789")` = `0xCBF43926` — beklenen değerle uyuşuyor. Kendi CRC rutininizi bu vektörle test etmiyorsanız, aslında ne hesapladığınızı bilmiyorsunuz demektir.

**Part number uyumluluğu ayrı bir alandır.** DO-178C §4.2.j planlamada "software load control ve compatibility"yi açıkça saymış. Pratikte bu, PDI dosyasının hangi EOC baseline'ıyla ve hangi donanım pozisyonuyla eşleştiğinin **veri içinde** taşınması demek. Sevilla senaryosunun altında yatan sınıf tam olarak budur: doğru dosyanın doğru üniteye gitmemesi.

**Ve reddettiğinizde ne yapacağınıza karar verin.** Bu, kodun değil sistem emniyet analizinin sorusu: PDI reddedildiğinde ünite hangi duruma geçmeli, bu durum operatöre **hangi aşamada** bildirilmeli? Sevilla vakasının en can alıcı ayrıntısı, uyarının varlığı ya da yokluğu değil, **zamanlamasıydı**: kalkışı iptal etmenin mümkün olduğu bir noktada gelmeyen uyarı, uyarı sayılmaz. Yükleme sonrası doğrulama, yer testinin bir parçası olmalı — uçuşun değil.

---

## Sık karıştırılan sınır: PDI mi, DO-200 verisi mi?

Konfigürasyon verisi konuşulurken iki standart sürekli birbirine karışıyor.

**DO-178C PDI**, yazılımın davranışını belirleyen ve yazılım yaşam döngüsü içinde üretilip doğrulanan konfigürasyon verisidir: kalibrasyon katsayıları, limitler, bölümleme zaman bütçeleri, filtre parametreleri.

**DO-200B / DO-200C** (Avrupa'da ED-76A / ED-76B) ise tamamen farklı bir problemi çözer: *Standards for Processing Aeronautical Data*. Buradaki mesele, aeronautical verinin — navigasyon veritabanları, prosedürler, engel verileri — kaynaktan uçağa kadar uzanan **işleme zinciri boyunca kalitesinin korunması ve kanıtlanması**. Bu bir yazılım geliştirme standardı değil, bir veri kalite yönetimi standardıdır.

Pratik ayrım şu soruyla yapılır: veri, **yazılımın nasıl davranacağını** mı belirliyor, yoksa yazılımın **üzerinde işlem yaptığı dünya bilgisi** mi? İlki PDI, ikincisi DO-200 dünyası. Bir FMS'in navigasyon veritabanı DO-200; aynı FMS'in performans hesabında kullandığı uçak-özel katsayı tablosu ise büyük olasılıkla PDI.

---

## Sahadan pratik notlar

Bunları bir kontrol listesi gibi kullanabilirsiniz:

1. **PDI'ları planlama aşamasında sayın.** PSAC/SDP'de "PDI kullanılmayacaktır" yazıp sonra bir kalibrasyon tablosu eklemek, en pahalı düzeltme yoludur. §4.2.j'nin istediği dört maddeyi (kullanım, seviye, süreç ve araç nitelendirmesi, yükleme kontrolü) baştan yanıtlayın.
2. **Dosya biçimini bir gereksinim yapın.** Alan sırası, genişlik, işaretlilik, ölçek, birim, aralık ve endianlık HLR'de yazılı olsun. Bir `.h` dosyasındaki struct tanımı gereksinim değildir.
3. **Struct serimleme yapmayın.** Bayt akışından açık okuma yazın. Bu, hem ABI bağımlılığını hem de derleyici sürümü değişikliğinde ortaya çıkan sürprizleri ortadan kaldırır.
4. **Yokluğu bir arıza olarak tanımlayın.** "Veri yoksa varsayılan kullan" değil, "veri yoksa fonksiyonu sunma ve bildir". Sıfır, hiçbir zaman güvenli varsayılan değildir.
5. **PDI'yı üreten aracı nitelendirme kapsamında değerlendirin.** PDI'ı bir Excel makrosu ya da Python betiği üretiyorsa ve bu aracın çıktısı doğrulama faaliyetiyle bağımsız olarak kontrol edilmiyorsa, DO-330 kapsamında bir tartışma kapıda demektir.
6. **Conformity review'u simüle edin.** §8.3.e, PDI dosyasının arşivlenmiş kaynaktan yeniden üretilebilmesini istiyor. Bunu bir kez gerçekten deneyin: temiz bir makinede, sadece SCI'da yazılı olanla, bit-bit aynı dosyayı üretebiliyor musunuz?
7. **Yükleme sonrası doğrulamayı test prosedürüne koyun.** Yüklemenin "başarılı" bitmesi ile verinin doğru olması iki ayrı iddiadır ve ikisi ayrı ayrı kanıt ister.

---

## Açık sorular

Bu konuda hâlâ net bir konsensüs görmediğim birkaç nokta var:

- **PDI'nın structural coverage'ı ne demek?** Kodun kapsama analizi olgun bir konu, ama "PDI eleman kapsaması" — yani her konfigürasyon elemanının en az bir gereksinim tabanlı testte gerçekten kullanılmış olması — projeler arasında çok farklı yorumlanıyor.
- **Kombinatoryal patlama.** Yüzlerce elemanlı bir PDI, teorik olarak astronomik sayıda konfigürasyon üretir. "Yalnızca teslim edilecek konfigürasyonları doğrula" ile "biçimi ve aralıkları doğrula, değerler veri olarak ayrı yönetilsin" arasındaki tercih, projenin doğrulama maliyetini birkaç kat değiştirebiliyor.
- **Alan güncellemeleri.** Sahada değişebilen PDI'lar (örneğin ünite değişiminde yeniden yüklenen kalibrasyonlar), sertifikasyon kanıtı ile operasyonel gerçeklik arasındaki en zayıf halka. Sevilla senaryosu tam olarak bu halkada kopmuştu.

Kodun doğruluğuna yatırım yaparken, o kodun okuduğu veriye aynı gözle bakmıyorsak, doğrulama bütçesinin önemli bir kısmını yanlış yere harcıyoruz demektir.

---

## Kaynaklar

- [FAA/AVS DO-178B/C Differences Tool, Rev. 010 (15.03.2014)](https://www.faa.gov/sites/faa.gov/files/aircraft/air_cert/design_approvals/air_software/differences_tool.pdf) — DO-178C'ye eklenen PDI bölümlerinin madde madde listesi
- [RTCA DO-178C / EUROCAE ED-12C, Software Considerations in Airborne Systems and Equipment Certification](https://www.rtca.org/) — birincil standart (ücretli)
- [2015 Seville Airbus A400M crash — Wikipedia](https://en.wikipedia.org/wiki/2015_Seville_Airbus_A400M_crash)
- [Airbus sends Alert Operator Transmission to A400M operators (19.05.2015)](https://skiesmag.com/press-releases/airbussendsalertoperatortransmissiontoa400moperators/)
- [Airbus warns of software bug in A400M transport planes — The Register](https://www.theregister.com/2015/05/20/airbus_warns_of_a400m_software_bug)
- [EASA certifies the Airbus A400M (13.03.2013)](https://www.easa.europa.eu/en/newsroom-and-events/press-releases/easa-certifies-airbus-a400m)
- [EASA.E.033 — Europrop International TP400-D6 engine type certificate](https://www.easa.europa.eu/en/document-library/type-certificates/engine-cs-e/easae033-europrop-international-gmbh-tp400-d6-engine)
- [AdaCore — SPARK Parameter Data Item demo](https://github.com/AdaCore/SPARK_PDI_Demo) — PDI'ın kodla ilişkisine dair açık kaynak örnek
- [RTCA DO-200B / EUROCAE ED-76A, Standards for Processing Aeronautical Data](https://ee-aero.com/glossary/do-200b/)
- [Verification scenarios of onboard databases under RTCA DO-178C and RTCA DO-200B](https://www.researchgate.net/publication/320971082_Verification_scenarios_of_onboard_databases_under_the_RTCA_DO-178C_and_the_RTCA_DO-200B) — iki standardın sınırını tartışan akademik çalışma
- [Rapita Systems — Verifying additional code for DO-178C](https://www.rapitasystems.com/object-code-verification) — Tablo A-7 objektifinin PDI ile karıştırılmaması için

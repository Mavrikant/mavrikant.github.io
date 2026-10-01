---
title: "Model Kapsaması %100, Kod Kapsaması Değil — DO-331'de Üreticinin Açtığı Boşluk"
subtitle: "100% Model Coverage Is Not Code Coverage: The Gap the Generator Opens Under DO-331"
background: "/img/posts/6.webp"
date: '2026-09-10 09:00:00'
layout: post
lang: tr
mermaid: true
---

Model tabanlı geliştirmeye geçmiş ekiplerde dolaşan bir cümle var: "Modelden kod üretiyoruz, model kapsamamız %100, simülasyonla da doğruladık — yapısal kapsamayı büyük ölçüde halletmiş sayılırız." Bu cümlenin yanlış olduğunu DO-331 tek bir paragrafta söylüyor. Ama *neden* yanlış olduğu, yanlış olduğu bilgisinden çok daha öğreticidir; çünkü mesele bir belge maddesine uymak değil, modelle kod arasındaki dönüşümün ne yaptığını görmek.

Bu yazıda önce DO-331'in en belirleyici çatalını — spesifikasyon modeli mi, tasarım modeli mi? — açacağım. Sonra model kapsamasının gerçekte neyi ölçtüğünü tanımlayacağım. Ardından küçük ama tamamen tekrar üretilebilir bir deneyle şunu göstereceğim: **aynı model, aynı gereksinimler, aynı test kümesi — ama iki farklı üretici ayarı, iki farklı yapısal kapsama sonucu.** Kod kapsaması modelin bir fonksiyonu değildir; arada duran üreticinin de fonksiyonudur. Deneyin sonunda ortaya çıkan iki kapsanmamış dalın DO-178C 6.4.4.3'e göre ne anlama geldiğini ve model kapsamasının bu soruyu neden yapısı gereği yanıtlayamayacağını tartışacağım.

---

## DO-331 Ne Getirdi, Ne Getirmedi

DO-178C, 13 Aralık 2011'de yayımlandığında yanında beş yardımcı belge geldi: DO-248C (sık sorulan sorular ve açıklamalar), DO-330 (araç nitelendirme), DO-331 (model tabanlı geliştirme ve doğrulama), DO-332 (nesne yönelimli teknolojiler) ve DO-333 (formel yöntemler). DO-331'in EUROCAE eşleniği ED-218'dir ve 1 Ocak 2012 tarihlidir.

Burada ilk yanlış anlama, "supplement" kelimesinin hafife alınmasıdır. DO-331 bağımsız bir standart değildir; DO-178C'nin objektiflerini, aktivitelerini ve yaşam döngüsü verilerini **değiştiren ve ekleyen** bir belgedir. Tabloları bu yüzden `MB.A-1` … `MB.A-10` diye numaralanır — DO-178C'nin `A-1` … `A-10` tablolarının model tabanlı karşılıkları. Yapısal kapsama objektifleri `MB.A-7` tablosunda, yani "Verification of Verification Process Results" başlığı altında durur; DO-178C'deki yeriyle aynı yerde.

İkinci yanlış anlama, DO-331'in bir kod üretimi rehberi olduğunu sanmaktır. Değildir. NASA Ames'ten Stephen Jacklin'in DO-178C ve yardımcı belgeleri özetleyen makalesi bunu açıkça söylüyor: DO-331 otomatik kod üretiminin, otomatik test üretiminin veya gereksinimlerin otomatik doğrulanmasının nasıl yapılacağını tartışmaz. Yalnızca, yazılım model tabanlı yöntemlerle geliştirildiğinde DO-178C rehberliğinin nasıl değiştirileceğini tarif eder. Üreticinizin kalitesi DO-331'in konusu değildir; o DO-330'un konusudur.

---

## İlk Çatal: Spesifikasyon Modeli mi, Tasarım Modeli mi?

DO-331'de bir projenin kaderini belirleyen tek bir sınıflandırma vardır ve planlama aşamasında yapılır. Model iki türden biridir:

- **Spesifikasyon modeli (specification model):** Yüksek seviye gereksinimleri ifade eder. Fonksiyonel, performans, arayüz ve emniyet karakteristiklerini tanımlar; ama gerçekleştirimi, yazılım mimarisini, veri akışını veya kontrol akışını **tanımlamaz**.
- **Tasarım modeli (design model):** Mimariyi ve tasarımı, yani düşük seviye gereksinimleri tanımlar. İç veri yapılarını, veri akışını ve kontrol akışını içerir.

Tablo `MB.1-1` bu ayrımı tek cümleye indirir: spesifikasyon modelleri yüksek seviye gereksinimlerin, tasarım modelleri düşük seviye gereksinimlerin **yerine geçer**.

Sınıflandırmayı yapmanın pratik ve acımasız bir testi var; APT Research'ün DO-331 brifingi bunu şöyle formüle ediyor: **modelden kod yazılabiliyorsa o bir tasarım modelidir.** Bu tek satır, sahadaki tartışmaların çoğunu bitirir. Simulink veya SCADE ile çizdiğiniz, blok blok veri akışı içeren, üzerine "Embedded Coder" düğmesine bastığınızda C çıkan bir şey, ne kadar "üst seviye" görünürse görünsün, bir tasarım modelidir.

Bu sınıflandırmanın bedeli neden önemli? Çünkü yükümlülükleri belirler:

| | Spesifikasyon modeli | Tasarım modeli |
|---|---|---|
| Neyin yerine geçer | Yüksek seviye gereksinimler | Düşük seviye gereksinimler + mimari |
| Ana yaşam döngüsü verisi | Yazılım Gereksinim Dokümanı | Yazılım Tasarım Dokümanı |
| İzlenebilirlik | Sistem gereksinimlerine | Üst gereksinimlere **ve** üretilen koda |
| İçerebileceği detay | Veri/kontrol akışı **yok** | Veri/kontrol akışı var |
| Kim yazabilir | Sistem mühendisliği de yazabilir | Yazılım süreci içinde |

İki ek kural da bu çatalın parçası. Birincisi: bir tasarım modelinin, DO-178C geliştirme sürecinin kapsamı içinde **ebeveyn gereksinimleri olmak zorundadır** — model hiçbir şeyin çocuğu olmayan bir kök olamaz. İkincisi, Jacklin'in özetlediği biçimiyle: tasarım modeli, düşük seviye gereksinimler ve üretilen kod arasında izlenebilirlik gerekir ve **düşük seviye gereksinimlere geri izlenemeyen model kodu bulunmamalıdır.**

Bu ikinci kuralı aklınızda tutun; deneyin sonunda tam olarak oraya döneceğiz.

---

## Model Kapsaması Neyi Ölçer?

Model kapsaması analizinin amacı, adının çağrıştırdığından dardır: **modelde ifade edilen, ancak gereksinim tabanlı doğrulama test durumlarıyla çalıştırılmamış gereksinimleri bulmak.** Yani bu bir *gereksinim* kapsaması etkinliğidir; ölçüm noktası modelin üzerindedir, kodun değil. Bulduğu şey tipik olarak iki kategoriden biridir: eksik test, ya da **istenmeyen işlevsellik** (unintended functionality) — modele girmiş ama hiçbir gereksinimin talep etmediği davranış.

DO-331'in model kapsaması için önerdiği ölçütler şunlar:

- tüm durum makinesi geçişleri,
- mantık denklemlerindeki kararlar,
- sayısal verilerin eşdeğerlik sınıfları ve sınır değerleri,
- tüm türetilmiş (derived) gereksinimler.

Ve kritik nokta: model kapsaması analizi **gereksinim tabanlı doğrulama test durumlarıyla** yapılmalıdır. Kapsamayı tamamlamak için modele bakıp test uydurmak, ölçüm aletinin ölçtüğü şeyi bozar.

Buraya kadar her şey makul görünüyor. Sorun, bu ölçütlerin isimlerinin yapısal kapsama ölçütlerinin isimleriyle aynı olmasından çıkıyor: "decision coverage", "condition coverage", hatta "MC/DC". Simulink Coverage gibi araçlar model üzerinde bu metrikleri gerçekten hesaplar. İsimler aynı olunca, ölçülen şeyin de aynı olduğu sanılıyor.

DO-331 bu noktada, ek MB.B'deki sık sorulan sorular listesinde (FAQ #11, `MB.B.11`) tereddüde yer bırakmıyor:

> "Model coverage analysis is different than structural coverage analysis and therefore model coverage analysis does not eliminate the need to achieve the objectives of structural coverage analysis per DO-178C section 6.4.4.2."

Belge, model kapsamasının yapısal kapsama yerine geçmesinin ancak "vaka bazında ve sertifikasyon otoriteleriyle mutabık kalınarak" düşünülebileceğini ekliyor. Yani teorik kapı tamamen kapalı değil; ama varsayılan cevap hayır.

Peki neden hayır? Çünkü modelle kodun arasında bir dönüşüm var ve o dönüşüm yapı üretiyor.

<div class="mermaid">
graph TD
    A["Gereksinimler"] --> B["Tasarım modeli"]
    B --> C["Model kapsaması ölçümü"]
    B --> D["Kod üretici"]
    D --> E["Üretilen C kodu"]
    D --> G["Modelde karşılığı olmayan yapı"]
    G --> E
    E --> F["Yapısal kapsama ölçümü"]
    C --> H["Modelde ifade edilen gereksinimler çalıştı mı"]
    F --> I["Uçakta çalışacak kodun bütün yapısı çalıştı mı"]
</div>

---

## Deney: Aynı Model, Aynı Testler, İki Farklı Kod

İddiayı yazıyla tartışmak yerine ölçmeyi tercih ediyorum. Kurgu şu: elimizde iki gereksinimlik minik bir mod mantığı olsun.

- **HLR-1:** Çıkış komutu, otopilot talebi aktif ve arıza yokken **veya** manuel geçersiz kılma aktifken geçirilir; aksi halde sıfırlanır.
- **HLR-2:** Geçirilen komut ±3000 ile sınırlanır.
- **Arayüz:** `cmd_in` için beyan edilen aralık ±10000, `bias` için ±2000; her ikisi de `int16`.

Bu, tipik bir mod mantığı + limit bloğu ikilisidir. Şimdi aynı modelden iki farklı üretici ayarıyla kod üretildiğini varsayalım. Gerçek üreticilerde bu ayarın adı tanıdıktır: **"saturate on integer overflow"** açık mı, kapalı mı? Kapalıysa toplama olduğu gibi bırakılır; açıksa üretici, ara sonucun `int16` sınırlarını aşmasına karşı açık koruma dalları serper.

Aşağıdaki `guard_A` ve `guard_B` bu iki ayarın temsilcisi. Gerçek bir Embedded Coder çıktısı değiller — elle yazılmış, üretici çıktısının bu ayardaki karakteristik kalıbını taşıyan minimal örnekler. Ölçümün kendisi ise gerçek: kodu derleyip Clang'in MC/DC enstrümantasyonuyla çalıştırıyorum.

```c
#include <stdint.h>
#define RATE_LIMIT 3000

/* A: "saturate on integer overflow" = off */
int16_t guard_A(uint8_t ap_req, uint8_t fail, uint8_t ovr,
                int16_t cmd_in, int16_t bias)
{
    int16_t y;
    if ((ap_req && !fail) || ovr) {
        int16_t s = (int16_t)(cmd_in + bias);
        if (s > RATE_LIMIT)        { y = RATE_LIMIT; }
        else if (s < -RATE_LIMIT)  { y = -RATE_LIMIT; }
        else                       { y = s; }
    } else {
        y = 0;
    }
    return y;
}

/* B: "saturate on integer overflow" = on */
int16_t guard_B(uint8_t ap_req, uint8_t fail, uint8_t ovr,
                int16_t cmd_in, int16_t bias)
{
    int16_t y;
    if ((ap_req && !fail) || ovr) {
        int32_t t = (int32_t)cmd_in + (int32_t)bias;
        if (t > 32767L)       { t = 32767L; }   /* modelde karsiligi yok */
        else if (t < -32768L) { t = -32768L; }  /* modelde karsiligi yok */
        int16_t s = (int16_t)t;
        if (s > RATE_LIMIT)        { y = RATE_LIMIT; }
        else if (s < -RATE_LIMIT)  { y = -RATE_LIMIT; }
        else                       { y = s; }
    } else {
        y = 0;
    }
    return y;
}
```

İki fonksiyon, beyan edilen sinyal aralıklarında **davranışsal olarak birebir aynı**. Modelin bakış açısından ikisi de aynı modeldir.

### Model seviyesinde %100 kapsama veren test kümesi

Gereksinimlerden türetilmiş yedi test durumu yazdım. İlk dördü HLR-1'in üç koşulu için MC/DC çiftlerini kuruyor; son üçü HLR-2'nin limit bloğunu üst sınır, alt sınır ve aralık içi olmak üzere üç eşdeğerlik sınıfında dolaşıyor. Bu, DO-331'in saydığı model kapsaması ölçütlerini — mantık denklemi kararları ve sayısal eşdeğerlik sınıfları/sınırlar — karşılayan bir kümedir.

| # | ap_req | fail | ovr | cmd_in | bias | Beklenen | Neyi kapsıyor |
|---|---|---|---|---|---|---|---|
| TC1 | 1 | 0 | 0 | 100 | 0 | 100 | temel engage |
| TC2 | 0 | 0 | 0 | 100 | 0 | 0 | `ap_req` MC/DC çifti |
| TC3 | 1 | 1 | 0 | 100 | 0 | 0 | `fail` MC/DC çifti |
| TC4 | 0 | 0 | 1 | 100 | 0 | 100 | `ovr` MC/DC çifti |
| TC5 | 1 | 0 | 0 | 9000 | 1000 | 3000 | üst limit |
| TC6 | 1 | 0 | 0 | −9000 | −1000 | −3000 | alt limit |
| TC7 | 1 | 0 | 0 | 1500 | 500 | 2000 | aralık içi |

Yedi test de her iki kodda geçiyor. Fonksiyonel olarak fark yok.

### Ölçüm

Güncel Clang sürümleri `-fcoverage-mcdc` bayrağını destekliyor; `llvm-cov` de `--show-mcdc` ile MC/DC test vektörlerini, koşul çiftlerini ve karar başına MC/DC yüzdesini raporluyor. Aşağıdaki çıktıyı Apple Clang 21 ile ürettim:

```bash
clang -O0 -std=c11 -fprofile-instr-generate -fcoverage-mapping \
      -fcoverage-mcdc mode_guard.c test_model_cases.c -o t
LLVM_PROFILE_FILE=t.profraw ./t
xcrun llvm-profdata merge -sparse t.profraw -o t.profdata
xcrun llvm-cov report ./t -instr-profile=t.profdata \
      --show-branch-summary --show-mcdc-summary -show-functions mode_guard.c
```

Sonuç:

```text
Name          Regions  Miss   Cover   Lines  Miss   Cover  Branches  Miss   Cover
guard_A            18     0 100.00%      12     0 100.00%        10     0 100.00%
guard_B            23     2  91.30%      15     0 100.00%        14     2  85.71%
TOTAL              41     2  95.12%      27     0 100.00%        24     2  91.67%
```

Ve mantık kararının MC/DC dökümü — her iki fonksiyonda da birebir aynı:

```text
|  Executed MC/DC Test Vectors:
|
|     C1, C2, C3    Result
|  1 { F,  -,  F  = F      }
|  2 { T,  F,  F  = F      }
|  3 { F,  -,  T  = T      }
|  4 { T,  T,  -  = T      }
|
|  C1-Pair: covered: (1,4)
|  C2-Pair: covered: (2,4)
|  C3-Pair: covered: (1,3)
|  MC/DC Coverage for Decision: 100.00%
```

Kapsanmayan iki dal, `guard_B`'nin taşma korumasında:

```text
   29|      5|        if (t > 32767L)       { t = 32767L; }
  |  Branch (29:13): [True: 0, False: 5]
   30|      5|        else if (t < -32768L) { t = -32768L; }
  |  Branch (30:18): [True: 0, False: 5]
```

Tablo olarak özetlersek:

| Ölçüm | Model seviyesi | `guard_A` (kod) | `guard_B` (kod) |
|---|---|---|---|
| Mantık kararı MC/DC | %100 | %100 | %100 |
| Satır (statement) | %100 | %100 | %100 |
| Dal (branch/decision) | %100 | **%100** | **%85.71** |

**Aynı model. Aynı gereksinimler. Aynı yedi test. Aynı model kapsaması. İki farklı yapısal kapsama sonucu.** Yapısal kapsama modelin bir fonksiyonu değil, model ile üretici ayarının ortak fonksiyonudur. Model tarafında ölçülen hiçbir sayı, `guard_B`'deki iki dalın varlığından haberdar değildir — çünkü o dallar modelde yoktur.

### Testi düzeltip geçebilir miyiz?

İlk refleks şudur: "Test kümesi eksik, taşmayı tetikleyen bir test ekleyelim." Ekleyemezsiniz. Beyan edilen aralıklarda `cmd_in` en fazla 10000, `bias` en fazla 2000; toplamın mutlak değeri en fazla 12000 olur, `int16` tavanı ise 32767. Bunu tahmin etmek yerine ölçtüm — beyan edilen alanın tamamını taradım:

```text
taranan kombinasyon : 80024001
ust guard tetiklendi: 0
alt guard tetiklendi: 0
gorulen max |cmd+bias|: 12000  (int16 tavani 32767)
```

Seksen milyon kombinasyonun hiçbiri o iki dalı tetiklemiyor. Yani bu bir test kümesi zaafı değil: **gereksinimlere ve arayüz spesifikasyonuna sadık kalan hiçbir test bu dalları kapsayamaz.** Kapsamak için modelin kendi beyan ettiği sinyal aralığını ihlal eden bir test yazmanız gerekir — ki bu, gereksinim tabanlı testin tanımıyla çelişir.

---

## O İki Dal Ne? — DO-178C 6.4.4.3

Yapısal kapsama analizi bir boşluk gösterdiğinde, DO-178C sizi 6.4.4.3'e — "Structural Coverage Analysis Resolution" — gönderir. Orada sınırlı sayıda çıkış kapısı vardır ve hepsi bir karar gerektirir:

1. **Test eksikliği.** Gereksinim var, testi yok. Test ekleyin. Bizim vakamızda geçersiz: hiçbir geçerli test kapsayamıyor.
2. **Gereksinim eksikliği.** Kod bir davranış yapıyor ve bunu talep eden bir gereksinim yok. Ya gereksinimi yazın ya kodu silin. Bu, üretici korumaları için cazip ama tehlikeli bir kapıdır: "int16 taşmasına karşı doyum uygulanır" diye türetilmiş bir gereksinim yazarsanız, o gereksinimin **emniyet değerlendirmesine** de gitmesi gerekir; DO-178C türetilmiş gereksinimleri sistem emniyet sürecine bildirmenizi ister.
3. **Ölü kod (dead code).** DO-178C'nin tanımıyla ölü kod, bir geliştirme hatası sonucu var olan, hedef bilgisayar ortamının **hiçbir** operasyonel konfigürasyonunda çalıştırılamayan ve bir sistem/yazılım gereksinimine izlenemeyen koddur. Beklenen aksiyon: silinir ve etkisi yeniden analiz edilir.
4. **Devre dışı kod (deactivated code).** Kasıtlı olarak vardır, bu konfigürasyonda çalışmaz; ama varlığı gerekçelendirilir ve **etkinleşemeyeceğinin** kanıtı sunulur.

Bizim iki dalımız hangisi? Cevap "duruma göre" ve işin zor kısmı burada. Dallar prensipte çalıştırılabilir — `cmd_in` ve `bias` gerçekten ±32767 tutabilen `int16` değişkenler. Yani "hiçbir operasyonel konfigürasyonda çalıştırılamaz" tanımı doğrudan oturmuyor; ölü kod demek kolay değil. Devre dışı kod demek istiyorsanız, aralık beyanının **kodda değil, kodun dışında** garanti edildiğini göstermeniz gerekir: `cmd_in`'i üreten bileşen gerçekten ±10000 ile mi sınırlı? Bu sınır kimin gereksiniminde yazıyor, kim doğruladı, arıza durumunda da geçerli mi?

Dikkat edin: yapısal kapsama analizi burada bir hata bulmadı. Yaptığı şey, cevaplamadan geçemeyeceğiniz bir **soru** üretmekti — ve bu soru bir arayüz varsayımının gerçekten garanti altında olup olmadığına dair, tam olarak emniyet-kritik yazılımda sormak isteyeceğiniz türden bir soru. Model kapsaması bu soruyu üretemez, çünkü soruyu doğuran yapı modelde yok.

Yazının başında bir kuralı akılda tutmanızı istemiştim: *düşük seviye gereksinimlere geri izlenemeyen model kodu bulunmamalıdır.* Üretici koruması tam olarak bunun ihlali gibi görünür ve bu yüzden üretilen kodda kalan her yapının bir açıklaması olması gerekir. Burada üretici nitelendirmesi (DO-330) devreye girer: nitelendirilmiş bir üreticinin ürettiği bilinen kalıplar için gerekçe, üreticinin nitelendirme paketine dayandırılabilir. Nitelendirilmemiş bir üreticide bu yükü projeniz taşır.

---

## Statement Coverage Neden Hiçbir Şey Görmedi?

Tabloya bir kez daha bakın: `guard_B`'nin **satır kapsaması %100**. Kapsanmayan iki dalın gövdesi tek satırda, `if` ile aynı satırda duruyor ve `if` satırı çalıştırılmış sayılıyor.

Bu, kapsama seviyesinin kritiklik seviyesine bağlı olmasının somut bir sonucudur. DO-178C'de yapısal kapsama objektifleri kademelidir: DAL C'de statement coverage, DAL B'de ek olarak decision coverage, DAL A'da ek olarak MC/DC beklenir. Aynı kod, aynı testlerle:

- **DAL C gözüyle:** temiz. %100 statement.
- **DAL B/A gözüyle:** iki kapsanmamış dal, gerekçelendirilmesi gereken bir soru.

Yani "modelden kod ürettik, kapsama sorunumuz yok" cümlesinin doğruluğu, farkında olunmadan yazılımın seviyesine bağımlı hale geliyor. DAL C'de gerçekten sorun görünmeyebilir; DAL B'ye yükseldiğinizde aynı üretici ayarı bir anda karşınıza çıkar.

Kapsama ölçüsünü kod üzerinde ölçmenin bir başka nedeni de şu: dal kapsaması sonucu **derleyici ve üretici ayarlarına** duyarlıdır, model ise değildir. Üretici ayarını değiştiren bir kişi, model incelemesinden geçmeyen bir değişiklikle kapsama sonuçlarını değiştirebilir.

---

## Simülasyon Doğrulama Değildir — Ama Kredi Alır

Model simülasyonundan sertifikasyon kredisi almak mümkündür; DO-331 bunu yasaklamaz, koşula bağlar. Kredi isteyen başvuru sahibinin, model doğrulama objektiflerini karşılamak için hangi inceleme ve analizlerin gerektiğini açıkça göstermesi beklenir. Analizler, **her model gereksinimi için simülasyon durumları bulunduğunu** ve bu simülasyonların hem normal aralık hem de dayanıklılık (robustness) girdilerini ele aldığını göstermelidir. Kredi için simülasyon durumları, prosedürleri ve sonuçları birer yaşam döngüsü verisi olarak üretilir ve konfigürasyon kontrolüne girer.

Karşılığında alamayacağınız şey nettir. Rapita Systems'ın DO-331 sayfasındaki formülasyon işin özünü veriyor: model kapsaması analizi yapmak, **gerçekten çalışacak olan üretilen kodun** kapsama analizini yapma ihtiyacını ortadan kaldırmaz. Aynı sayfa ikinci yarıyı da ekliyor: simülasyon kullanmak, çalıştırılabilir nesne kodunun hedef donanımda test edilmesi ihtiyacını ortadan kaldırmaz. DO-331'in kendisi de çalıştırılabilir nesne kodunun doğrulamasının öncelikle hedef bilgisayar ortamında testle yapılmasını teşvik eder.

Pratikte yaygın ve makul olan desen şudur: doğrulama etkinliklerinin bir kısmı model üzerinde erkenden yapılır, sonra aynı sonuçlar hedef üzerinde yeniden teyit edilir. MIL (model-in-the-loop) test durumlarının SIL ve HIL'de yeniden kullanılması, model tabanlı akışın gerçek getirisidir — ama getiri "objektifin silinmesi" değil, "aynı test varlığının birden çok objektifte tekrar kullanılması"dır.

Bu, boş bir vaat de değil. DLR ve TU München ekibinin DO-178C/DO-331 tabanlı akışlarını anlattıkları çalışmada, Level C bir bileşen için sektörde tipik kabul edilen kişi-gün başına ~15 satır kod metriğine karşılık ~30 satır elde ettiklerini, model seviyesinde kapsamalı simülasyon sayesinde SIL ve HIL aşamalarında model tabanlı bileşende hata bulunmadığını raporluyorlar. Yani model tabanlı akış işe yarıyor; sadece yaradığı yer, sanılan yer değil.

---

## Az Konuşulan Yük: Model Element Kütüphaneleri

Model tabanlı projelerde en geç fark edilen kalemlerden biri, kullanılan blok/element kütüphaneleridir. Bir model elemanı, sonuçta bir sembol ve ona bağlı çalıştırılabilir kod üreten bir varlıktır. DO-331 çerçevesinde her elemanın, projenin yazılım seviyesini karşıladığının güvence altına alınması ve her kütüphane için tam bir veri paketi bulunması beklenir.

Buradan çıkan pratik kural şu: kullanılmayan elemanlar kütüphaneden çıkarılmalıdır — model standardınız o elemanların kullanımını açıkça yasaklamıyorsa. Özellikle güvence altına alınmamış elemanlar için bu önemlidir. "Kütüphane zaten kurulu geliyor, biz sadece üç bloğunu kullanıyoruz" cümlesi, kapsam belirlenmediğinde denetimde sorun çıkaran cümlelerden biridir.

---

## Sahadan Pratik Çıkarımlar

1. **Sınıflandırmayı planlamada, yazılı olarak yapın.** Her model için "spesifikasyon mu, tasarım mı" sorusu PSAC ve model planlama verisinde cevaplanmış olmalı. Testi hatırlayın: modelden kod yazılabiliyorsa tasarım modelidir.
2. **Model kapsamasını ve kod kapsamasını iki ayrı metrik olarak raporlayın.** Aynı rapor sayfasında yan yana iki sütun olarak. Tek bir "kapsama %" rakamı, hangi seviyede ölçüldüğü yazmıyorsa bilgi değil gürültüdür.
3. **Üretici ayarlarını konfigürasyon kontrolüne alın.** Bu deneyde gördüğümüz gibi tek bir ayar, yapısal kapsama sonucunu değiştiriyor. Ayar değişikliği, kapsama kanıtını geçersizleştiren bir değişikliktir.
4. **Kapsama boşluklarını erken, üretici ayarı düzeyinde çözün.** Kapsanamayan üretici koruması için üç seçeneğiniz var: ayarı kapatmak (ve taşma güvenliğini başka türlü kanıtlamak), veri tipini genişletmek, ya da devre dışı kod gerekçesi yazmak. Üçüncüsü en pahalısıdır ve genelde en son fark edilir.
5. **Arayüz aralık beyanlarını gereksinim haline getirin.** Deneydeki tüm tartışma, "`cmd_in` ±10000'dir" beyanının nerede garanti altında olduğu sorusuna indi. Model bloğunun özelliğinde yazan bir aralık, doğrulanmış bir gereksinim değildir.
6. **DAL yükselirse kapsama kanıtını yeniden koşun.** DAL C'de sessiz kalan üretici korumaları, DAL B'de rapor edilir hale gelir.

---

## Açık Sorular

Bu yazıda kasıtlı olarak kenarda bıraktığım, kendi başına birer yazı olacak konular var. Üretici nitelendirmesinin TQL seviyesinin nasıl belirlendiği; nitelendirilmiş bir üreticinin çıktısında kaynak koddan nesne koda geçerken açılan ikinci boşluğun (DO-178C 6.4.4.2.b) model tabanlı akışta nasıl ele alındığı; ve model kapsamasının yapısal kapsamayla vaka bazında değiş tokuş edilmesinin — `MB.B.11`'in bıraktığı o dar kapının — pratikte hangi argümanlarla açıldığı. Üçü de aynı temel gerilimin farklı yüzleri: soyutlama seviyesi yükseldikçe kanıtın hangi seviyede toplandığı sorusu.

---

## Sonuç

Model tabanlı geliştirme, doğrulama işini erkene çeker ve aynı test varlığını birden çok objektifte kullanmanıza izin verir. Yapmadığı şey, kanıtı bir seviye yukarı taşımaktır. Uçakta çalışan şey model değil, üretilen kodun derlenmiş halidir; DO-178C'nin yapısal kapsama objektifleri de tam olarak o çalışan şeyi hedefler.

Bu yazıdaki deneyin tek cümlelik özeti şu: **model kapsaması, üreticinin eklediği yapıyı yapısı gereği göremez.** Yedi gereksinim tabanlı test, aynı modelin iki farklı kod üretimine karşı %100 ve %85.71 dal kapsaması verdi; aradaki iki dalı hiçbir geçerli test kapsayamıyordu; ve o iki dal, cevaplanması gereken gerçek bir mühendislik sorusuna işaret ediyordu. DO-331'in `MB.B.11`'de kısa bir cümleyle söylediği şey, ölçüldüğünde işte bu kadar somut.

---

## Kaynaklar

- Stephen A. Jacklin (NASA Ames Research Center), ["Certification of Safety-Critical Software Under DO-178C and DO-278A"](https://ntrs.nasa.gov/api/citations/20120016835/downloads/20120016835.pdf) — DO-331'in kapsamı, spesifikasyon/tasarım modeli ayrımı, model kapsaması ölçütleri ve simülasyon kredisi koşulları.
- TASKING / LDRA, ["DO-331/ED-216 Model-Based Development and Verification Supplement: When, where, and how it applies"](https://www.tasking.com/do-331/) — Tablo `MB.1-1` ve `MB.B.11` (FAQ #11) alıntısı. (Sayfa başlığındaki ED numarası hatalı; DO-331'in EUROCAE eşleniği ED-218'dir.)
- Rapita Systems, ["RTCA DO-331/EUROCAE ED-218"](https://www.rapitasystems.com/do-331) — model kapsamasının üretilen kodun kapsama analizini ortadan kaldırmadığı; hedef donanımda test zorunluluğu.
- Alford & Hendrix (APT Research), ["DO-331 Model Based Development and Verification Supplement"](https://www.apt-research.com/wp-content/uploads/2017/05/MBSESSS_DO-331_Alford_Hendrix.pdf) — "modelden kod yazılabiliyorsa tasarım modelidir" testi, model element kütüphanelerinin güvence yükü, MBD veri kalemleri.
- K. Dmitriev, S. Zafar, K. Schmiechen ve ark., ["A Lean and Highly-automated Model-Based Software Development Process Based on DO-178C/DO-331"](https://arxiv.org/pdf/2010.06505) — `MB.A-5`/`MB.A-7` tablolarının kullanımı ve Level C vaka çalışması metrikleri.
- LDRA, ["DO-178C & Structural Coverage Analysis"](https://ldra.com/ldra-blog/do-178c-structural-coverage-analysis/) — DO-178C 6.4.4.3, ölü kod tanımı ve kapsama boşluklarının çözüm seçenekleri.
- MathWorks, ["Types of Model Coverage"](https://www.mathworks.com/help/slcoverage/ug/types-of-model-coverage.html) ve ["Types of Code Coverage"](https://www.mathworks.com/help/slcoverage/ug/types-of-code-coverage.html) — model ve kod kapsamasının araç tarafındaki ayrımı, SIL/PIL modunda kod kapsaması.
- LLVM Project, ["Source-based Code Coverage — MC/DC Instrumentation"](https://clang.llvm.org/docs/SourceBasedCodeCoverage.html) — `-fcoverage-mcdc` bayrağı ve `llvm-cov` MC/DC raporlaması.

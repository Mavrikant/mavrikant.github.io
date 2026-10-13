---
title: "248 Gün, 149 Saat, 51 Gün: Aviyonikte Sayaç Taşmasının Anatomisi"
subtitle: "Counter Rollover in Certified Avionics: Anatomy of a Recurring Failure Class"
background: "/img/posts/6.webp"
date: '2026-09-01 07:00:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [c-cpp, emniyet-kritik]
---

2015'te FAA, tüm Boeing 787 filosuna bir uçuşa elverişlilik direktifi (*airworthiness directive*, AD) yayımladı. Direktifin gerektirdiği bakım işlemi şuydu: **uçağın elektriğini periyodik olarak kesin.**

Gerekçe metni, bir yazılımcının kanını donduracak kadar tanıdıktır:

> "A software counter internal to the GCUs will overflow after 248 days of continuous power, causing that GCU to go into failsafe mode."

Dört jeneratör kontrol ünitesinin (GCU) dördü de aynı anda enerjilenmişse, 248 gün sonra dördü birden failsafe moduna geçiyor ve uçak tüm AC elektrik gücünü kaybediyordu — uçuş fazından bağımsız olarak. Bu, DAL A seviyesinde geliştirilmiş, sertifikalandırılmış, milyonlarca dolarlık bir doğrulama sürecinden geçmiş bir yazılımda bir **32 bit sayacın taşmasıydı**.

Ve bu tek bir olay değil. Aynı arıza sınıfı, farklı üreticilerde, farklı sistemlerde, farklı sürelerle en az üç kez uçuşa elverişlilik direktifi doğurdu. Bu yazıda bu üç direktifi tek bir arıza sınıfı olarak inceleyeceğiz: sürelerin aritmetiğini geri çıkaracağız, hatanın kod seviyesindeki anatomisini derleyici çıktısına kadar takip edeceğiz ve asıl soruyu soracağız — **DO-178C doğrulama süreci bunu neden yakalamadı?**

Yazıdaki her teknik iddia kamuya açık kaynaklara (FAA/EASA direktifleri, Federal Register metinleri, C standardı) dayanıyor; deneyler kendi makinemde koştu ve çıktıları olduğu gibi aşağıda.

---

## Üç Direktif, Tek Arıza Sınıfı

| Sistem | Direktif | Süre | Sonuç |
|---|---|---|---|
| Boeing 787 — GCU (jeneratör kontrol ünitesi) | FAA AD 2015-09-07, Amdt. 39-18153, yürürlük 1 Mayıs 2015 | 248 gün | Dört GCU'nun eşzamanlı failsafe'e geçmesi, tüm AC gücün kaybı |
| Airbus A350-941 — IMA (Integrated Modular Avionics) | EASA AD 2017-0129R1, "Integrated Modular Avionics – Internal Timer – Power Cycle (Reset)" | 149 saat | Bazı aviyonik sistemler ile aviyonik ağ arasında haberleşme kaybı |
| Boeing 787 — CCS/CDN (common core system / common data network) | FAA AD 2020-06-14, Amdt. 39-19883, yürürlük 7 Nisan 2020 | 51 gün | Bayat-veri (*stale data*) izleme fonksiyonunun kaybı; pilota yanıltıcı hız/irtifa/attitude gösterimi |

Üç direktifin de gerektirdiği düzeltici işlem, kalıcı yazılım yaması gelene kadar aynı: **periyodik güç çevrimi.** FAA'in 787 GCU direktifi, 248 günlük hataya karşı bakım aralığını 120 günü aşmayacak şekilde belirledi — yani hatanın periyodunun yaklaşık yarısı. Bu, mühendislik açısından anlamlı bir seçim: bakım aralığı, kaçırılan bir bakım penceresinden sonra bile arıza noktasına ulaşılmayacak şekilde konur. A350 direktifinde ise pencere pratikte hatanın periyoduna eşittir (149 saat ≈ 6,2 gün); bu da sürenin ne kadar dar olduğunu gösterir.

787 GCU sorunu daha sonra AD 2018-20-15 ile, güç çevrimi yerine yeni GCU yazılımının kurulmasını zorunlu kılacak biçimde kalıcı olarak kapatıldı. A350 direktifi de 14 Ağustos 2018'den itibaren yamalı yazılımı yükleyen operatörler için düşüyor.

Buradaki mühendislik dersi "üreticiler beceriksiz" değil. Tam tersi: bu üç sistem de sektörün en katı yazılım süreçlerinden geçti ve hata yine de sahaya çıktı. Demek ki bu arıza sınıfının, standart doğrulama faaliyetlerinin **yapısal olarak** göremediği bir tarafı var.

---

## Sürelerin Aritmetiği: 248 Gün Nereden Geliyor?

Direktifler bize sayacın genişliğini ve tick periyodunu söylemiyor. Ama süreyi söylüyorlar, ve bu yeterli: bir sayacın sarma süresi basitçe `2^N × T` çarpımıdır. Tersine gidip hangi (genişlik, periyot) çiftinin gözlenen süreyi ürettiğini arayabiliriz.

| Genişlik × tick | Sarma süresi |
|---|---|
| 2³¹ × 10 ms | 21 474 836 s = **248,55 gün** |
| 2³¹ × 0,25 ms (= 2³² × 125 µs) | 536 871 s = **149,13 saat** |
| 2⁴⁷ ÷ 32 MHz | 4 398 047 s = **50,90 gün** |
| 2³² × 1 ms | 4 294 967 s = 49,71 gün |
| 2³¹ × 1 ms | 2 147 484 s = 24,86 gün |

Önemli bir uyarı: direktifler sayaç genişliğini ve tick periyodunu **açıklamıyor**. Aşağıdaki eşleştirmeler benim çıkarımım, üreticinin beyanı değil. Yine de eşleşmelerin ne kadar temiz olduğu, çıkarımı ciddiye almak için yeterli.

İlk satır 787 GCU'nun 248 gününe neredeyse tam oturuyor: **işaretli 32 bit bir sayaç, 10 ms'lik (santisaniye) tick ile sayıyor.** İşaretli olması kritik: taşma `2³²`de değil `2³¹`de, yani ömrün yarısında geliyor.

İkinci satır A350'nin 149 saatine oturuyor: 2³¹ × 250 µs. Aynı sonucu 2³² × 125 µs de veriyor.

Üçüncü satır 787'nin 51 gününe denk geliyor. Burada tahmin yürütmemize gerek de yok: IOActive'in yayımladığı tersine mühendislik analizi, CDN üzerinden taşınan **EDE zaman damgasının** 6 baytlık (47 kullanılabilir bit) yapısını ve ~32 MHz'lik bir sayaç frekansını işaret ediyor; bu kombinasyon tam olarak 51 gün civarında sarıyor.

Son iki satırı referans olarak koydum. 2³² × 1 ms = 49,7 gün, bilgisayar tarihinin en ünlü sarma hatasıdır (Windows 95'in `GetTickCount` kaynaklı 49,7 günlük ömrü). 2³¹ × 1 ms = 24,9 gün ise aynı sayacın işaretli okunduğunda verdiği süre.

Bu tablonun pratik değeri şudur: **projenizdeki her serbest koşan sayaç için bu çarpımı bir kere yapın ve sonucu tasarım belgesine yazın.** Sayı sistem ömründen küçükse — ki gömülü sistemlerde çoğu zaman öyledir — sarma davranışı artık bir "uç durum" değil, tasarlanması gereken normal bir çalışma koşuludur.

<div class="mermaid">
graph LR
    A["Serbest koşan sayaç: N bit, T periyot"]
    B{"2^N x T sistem ömründen kısa mı?"}
    C["Sarma gerçek bir çalışma koşulu değil"]
    D["Sarma normal bir çalışma koşuludur"]
    E["Karşılaştırmalar fark tabanlı olmalı"]
    F["Test sarma noktasından geçmeli"]
    A --> B
    B -->|Hayır| C
    B -->|Evet| D
    D --> E
    D --> F
</div>

---

## Kod Seviyesinde Ne Oluyor?

Sarma hatası neredeyse her zaman aynı satırda yaşar: bir zaman aşımı kontrolünde **mutlak karşılaştırma** kullanılması.

```c
/* YANLIŞ */
if (now() >= deadline) { timeout(); }
```

Bu satır, sayaç monoton arttığı sürece doğrudur. Sayaç sardığı anda ise iki ayrı biçimde bozulur: sarmadan önce sahte tetikleme, sarmadan sonra kaçırılmış tetikleme. Doğru deyim ise farkı alıp **işaretli** yorumlamaktır:

```c
/* DOĞRU */
if ((int32_t)(now() - deadline) >= 0) { timeout(); }
```

Neden çalıştığını görmek için deneyi koşalım. 248 gün beklemek yerine sayacı sarma noktasının üç tick öncesinden başlatıyoruz:

```c
#include <stdio.h>
#include <stdint.h>
#include <inttypes.h>

static uint32_t tick_ms10;               /* 10 ms'lik tick sayacı */
static uint32_t now(void) { return tick_ms10; }

static int timeout_kotu(uint32_t deadline) { return now() >= deadline; }
static int timeout_iyi (uint32_t deadline) { return (int32_t)(now() - deadline) >= 0; }

int main(void) {
    tick_ms10 = 0xFFFFFFFDu;             /* sarmaya 3 tick kala */
    uint32_t deadline = tick_ms10 + 5u;  /* 50 ms sonrası -> 0x00000002 */

    printf("deadline = 0x%08" PRIX32 "\n\n", deadline);
    printf(" tick        | kotu | iyi\n");
    printf("-------------+------+-----\n");
    for (int i = 0; i < 8; ++i) {
        printf(" 0x%08" PRIX32 "  |  %d   |  %d\n",
               tick_ms10, timeout_kotu(deadline), timeout_iyi(deadline));
        tick_ms10++;
    }
    return 0;
}
```

Çıktı:

```
deadline = 0x00000002

 tick        | kotu | iyi
-------------+------+-----
 0xFFFFFFFD  |  1   |  0
 0xFFFFFFFE  |  1   |  0
 0xFFFFFFFF  |  1   |  0
 0x00000000  |  0   |  0
 0x00000001  |  0   |  0
 0x00000002  |  1   |  1
 0x00000003  |  1   |  1
 0x00000004  |  1   |  1
```

Hatanın iki yüzü de bu tabloda görünüyor:

1. **Sahte zaman aşımı.** İlk üç satırda `kotu` sürümü `1` döndürüyor. Süre henüz dolmadı; `deadline` 50 ms ilerideydi. Ama `0xFFFFFFFD >= 0x00000002` aritmetik olarak doğru, dolayısıyla zaman aşımı **50 ms erken** tetikleniyor. Bir watchdog besleme mantığında bu, gereksiz bir reset demektir.
2. **Kaçırılmış zaman aşımı.** Sarmadan sonraki iki satırda `kotu` sürümü `0`'a düşüyor — süre dolmuş olsa bile. Bir haberleşme zaman aşımı bu davranışla, hattaki sessizliği fark etmez.

787 GCU'nun failsafe'e geçmesi ve CCS'in bayat-veri izlemesini kaybetmesi, tam olarak bu ikinci kategoridir: **arıza tespit mekanizmasının kendisi zaman aritmetiğine dayanıyordu ve sarma anında sessizce kör oldu.** İzleme fonksiyonunun körleşmesi, izlenen sistem bozulana kadar hiçbir belirti üretmez. Direktif metnindeki "undetected or unannunciated loss of ... message age validation" ifadesi tam da bunu anlatıyor.

---

## Doğru Deyimin Maliyeti: Üç Komut

Fark tabanlı karşılaştırma "daha pahalı" diye reddedilir bazen. Değil. `clang -O2` ile üretilen kod, arm64 için:

```
_gecti_mi:
	sub	w8, w0, w1
	mvn	w8, w8
	lsr	w0, w8, #31
	ret
```

Aynı derleyiciyle Cortex-M3/M4 hedefi (`-target thumbv7m-none-eabi`) için de aynı üç komut:

```
gecti_mi:
	subs	r0, r0, r1
	mvns	r0, r0
	lsrs	r0, r0, #31
	bx	lr
```

Çıkarma, tersleme, işaret bitini en alta kaydırma. Dallanma yok, bu yüzden dal tahmini ya da WCET açısından da sorun çıkarmıyor. Doğru deyim, yanlış olanla aynı fiyata.

Deyimin geçerliliğinin bir koşulu var ve bunu tasarım belgesine yazmak gerekiyor: **`deadline` ile `now()` arasındaki fark hiçbir zaman `2^(N-1)`'i aşmamalı.** 32 bit ve 10 ms tick ile bu sınır 248 gündür; makul her zaman aşımı bunun çok altındadır. Ama aynı deyimi 16 bit bir sayaçla 1 ms tick'te kullanıyorsanız sınır 32,7 saniyeye iner ve bu artık gerçekten dikkat edilmesi gereken bir kısıttır.

---

## Üç Tuzak

### 1. Integer promotion, deyimi sessizce bozar

`uint16_t` sayaçlarla aynı numara, cast'i unutursanız çalışmaz:

```c
uint16_t now = 0xFFFDu, deadline = 0x0002u;
printf("now-deadline (promoted int) = %d\n", now - deadline);
printf("cast yok : %d\n", (now - deadline) >= 0);
printf("cast var : %d\n", (int16_t)(now - deadline) >= 0);
```

```
now-deadline (promoted int) = 65531
cast yok : 1
cast var : 0
```

Sebep C'nin tamsayı yükseltme (*integer promotion*) kuralları: `uint16_t` işlenenler `int`'e yükseltilir, çıkarma 32 bit yapılır ve modulo-2¹⁶ sarma **hiç gerçekleşmez**. Sonuç 65531, pozitif; karşılaştırma daima doğru döner. Yani `uint16_t` sayaçlarda cast'siz "fark tabanlı" kod, her koşulda "süre doldu" diyen bir fonksiyondur. `uint32_t` ile aynı hatayı yapmazsınız çünkü `int` de 32 bittir ve sarma korunur — deyimin 32 bitte çalışıp 16 bitte çalışmaması, bu hatanın port sırasında ortaya çıkmasının tipik yoludur.

### 2. İşaretli sayaçta taşma, kontrolünüzü derleyiciye sildirir

Sayaç işaretli tipteyse durum daha kötüdür: işaretli tamsayı taşması C'de tanımsız davranıştır, ve derleyici bunu "taşma olmaz" varsayımına çevirir. Klasik taşma kontrolü:

```c
int tasma_var_mi(int32_t t) { return t + 100 < t; }
```

`clang -O2` çıktısı:

```
_tasma_var_mi:
	mov	w0, #0
	ret
```

Fonksiyon tamamen silindi; her zaman `0` dönüyor. `-fwrapv` ile derlerseniz gerçek bir karşılaştırma geri geliyor:

```
_tasma_var_mi:
	mov	w8, #65435
	movk	w8, #32767, lsl #16   ; w8 = 0x7FFFFF9B
	cmp	w0, w8
	cset	w0, gt
	ret
```

Ders: sarma davranışına dayanan her sayaç **işaretsiz** olmalı. İşaretsiz aritmetiğin modulo-2^N davranışı C standardınca garanti altındadır; işaretli taşma ise tanımsızdır ve statik analizin de, gözden geçirmenin de kaçırdığı bir noktada derleyici tarafından "optimize" edilebilir. Bu, [kayan nokta sayılarının tehlikeleri]({% post_url 2026-03-25-kayan-nokta-sayilarinin-tehlikeleri %}) yazısındaki temaya paralel bir durum: sorun aritmetiğin kendisi değil, aritmetiğin *sandığınız kurallara göre işlemiyor* olması.

MISRA C bu deyimi yasaklamaz. Kural 12.4 yalnızca **sabit ifadelerin** derleme zamanında sarmasını hedefler; çalışma zamanında bilinçli modüler aritmetik kapsam dışıdır. Buna karşılık MISRA'nın essential type kuralları örtük tip dönüşümlerini işaretler; cast'i açıkça yazmak zaten yukarıdaki birinci tuzağın da çaresidir. ([MISRA C:2025 ile neler değişti]({% post_url 2026-04-05-misra-c-2025-ile-neler-degisti %}) yazısında kural setinin genel çerçevesine bakmıştık.)

### 3. "64 bite çıkaralım" bedava değil

En sık önerilen çözüm sayacı 64 bite çıkarmaktır. 2⁶⁴ × 1 ms ≈ 585 milyon yıl; sarma sorunu pratikte biter. Ama 32 bitlik bir çekirdekte 64 bitlik bir sayaç **atomik okunamaz**: ISR sayacın alt yarısını artırıp üst yarısına taşıma yaparken ana bağlamda okuma yapıyorsanız, yırtık (*torn*) bir değer okursunuz — ve yırtılma tam olarak alt yarının sardığı anda, yani en nadir ve en kötü zamanda olur.

Standart çözüm, üst yarıyı iki kez okumaktır:

```c
static volatile uint32_t tick_hi, tick_lo;   /* ISR günceller */

static uint64_t tick_oku(void) {
    uint32_t hi1, lo, hi2;
    do {
        hi1 = tick_hi;
        lo  = tick_lo;
        hi2 = tick_hi;
    } while (hi1 != hi2);            /* araya taşıma girdiyse tekrar oku */
    return ((uint64_t)hi1 << 32) | lo;
}
```

Yani 64 bit, sarma problemini bir eşzamanlılık problemine çevirir. İkisinden biriyle uğraşmak zorundasınız; ve tek çekirdekli bir gömülü sistemde 32 bit sayaç + fark tabanlı karşılaştırma çoğu zaman daha az riskli olan taraftır.

---

## Asıl Soru: DO-178C Bunu Neden Yakalamadı?

En rahatsız edici kısım burası. DO-178C'nin robustluk testi maddesi (§6.4.2.2) bu hatayı neredeyse ismiyle tarif eder:

Maddenin robustluk kriterleri arasında, **zaman ilişkili fonksiyonlar** — filtreler, integratörler, gecikmeler — için aritmetik taşma koruma mekanizmalarını sınayan test durumları geliştirilmesi yer alır. Yani standart, tam olarak bu hatayı hedefleyen bir gereklilik içeriyor. Buna rağmen hata sahaya çıktı. Nedenini üç başlıkta toplayabiliriz:

**Sayaç, bir "zaman ilişkili fonksiyon" olarak görülmüyor.** §6.4.2.2'nin verdiği örnekler filtre, integratör ve gecikmedir — yani sinyal işleyen bloklar. Sistemin ne kadar süredir enerjili olduğunu tutan bir tick sayacı, mühendisin zihninde "altyapı"dır, bir fonksiyon değil. Gereksinim ağacında da genellikle kendine ait bir düşük seviye gereksinimi yoktur; başka gereksinimlerin *içinde* yaşar. Gereksinim tabanlı test, gereksinimi olmayan davranışı test etmez.

**Yapısal kapsama sarmayı görmez.** `if (now() >= deadline)` satırı, hem doğru hem yanlış sonuçla koşulduğunda MC/DC dahil tüm yapısal kapsama kriterlerini sağlar. Kapsama metriği "bu karar her iki yönde de alındı mı" diye sorar; "bu karar, `now()` sardığı durumda da doğru sonucu verdi mi" diye sormaz. **%100 MC/DC ile bu hatanın üstünden geçebilirsiniz ve metrik yeşil kalır.** Yapısal kapsama, gereksinim tabanlı testin *yeterliliğini* ölçen bir araçtır; test edilmemiş bir davranışı keşfetmez.

**Test süreleri, sarma sürelerinden kısadır.** 248 gün bir test kampanyasının süresi değildir; 51 gün de değildir. 149 saat (6 gün) teorik olarak koşulabilir ama tipik bir entegrasyon test kampanyasında donanım bankı 6 gün boyunca kesintisiz enerjili bırakılmaz. Uçak da öyle bırakılmaz sanılır — pratikte ise hat bakımı arasında uzun süre enerjili kalan gövdeler ortaya çıkar. Yani hem test ortamının hem de operasyonel varsayımın aynı yönde hatalı olması gerekiyor, ve tam olarak bu oldu.

Bu üçünün kesişimi, sertifikasyon süreçlerinde tanıdık bir kör noktayı tarif ediyor: **süreç, zaman ekseninde uzayan davranışları değil, mantıksal davranışları doğrulamak üzere kurulmuş.** Gereksinimlerin dili "X olduğunda Y yap" biçimindedir; "X, 2³¹ tick sonra da doğru çalışmaya devam eder" biçiminde gereksinim yazmayı kimse alışkanlık hâline getirmemiştir.

---

## Bunu Nasıl Test Edersiniz?

248 gün beklemeden. Üç pratik taktik:

**1. Sayaç ön yüklemesi (counter preload).** Test yapılandırmasında tick sayacını sıfırdan değil, sarma noktasının hemen altından başlatın. Yukarıdaki deney tam olarak budur: `tick = 0xFFFFFFFD`. Sistem birkaç saniye içinde sarma penceresinden geçer. Bunu bir derleme seçeneğine değil, sistemin normal başlatma kodundaki bir sabite bağlamak daha iyidir; böylece test edilen ikili, üretim ikilisiyle aynı kod yolunu koşar. Bazı ekipler bunu daha da ileri götürüp **üretim yazılımını da** sayacı `2^N - küçük_bir_değer` ile başlatacak biçimde yazar: sarma artık ilk dakikalarda, sahada değil laboratuvarda olur.

**2. Emülasyonda saat ileri sarma.** Renode gibi bir emülatörde sanal zamanı gerçek zamandan hızlı akıtabilirsiniz. Daha önce [Renode ile Zynq-7000 simülasyonu]({% post_url 2026-05-14-renode-ile-zynq7000-simulasyonu %}) yazısında kurduğumuz türden bir ortamda, timer periferinin tick hızını test sırasında artırmak tek satırlık bir değişikliktir; yazılım hiçbir farkı göremez.

**3. Statik olarak sarma envanteri.** Kod tabanındaki tüm serbest koşan sayaçları listeleyin ve her biri için `2^N × T` değerini hesaplayıp tasarım belgesine yazın. Bu, otomatikleştirilemeyecek kadar bağlama bağlı bir iştir ama gözden geçirme listesine bir satır olarak eklenebilir. Aradığınız desen basittir: bir değişken monoton artıyorsa ve `<`, `>`, `>=`, `<=` ile karşılaştırılıyorsa, o karşılaştırma fark tabanlı olmalıdır.

---

## Gözden Geçirme Kontrol Listesi

- Serbest koşan her sayaç için `2^N × T` hesaplandı ve tasarım belgesine yazıldı mı?
- Sarma süresi sistem ömründen kısaysa, sarma davranışı bir düşük seviye gereksinimi olarak yazıldı mı?
- Zaman karşılaştırmalarının tamamı fark tabanlı mı (`(int32_t)(a - b) >= 0`), mutlak mı?
- Sayaç tipleri işaretsiz mi? (İşaretli sayaçta taşma tanımsız davranıştır.)
- 16 bitten dar sayaçlarda integer promotion'a karşı açık cast var mı?
- Karşılaştırılan iki zaman damgası arasındaki azami fark `2^(N-1)`'in altında kalıyor mu, ve bu kısıt yazılı mı?
- 64 bit sayaç kullanılıyorsa, 32 bit çekirdekte atomik olmayan okumaya karşı korunuyor mu?
- Test kampanyasında sayaç sarma noktasından geçen en az bir test durumu var mı?
- Sistemin "azami kesintisiz enerjili kalma süresi" varsayımı yazılı mı, ve bu varsayımı bakım prosedürü gerçekten garanti ediyor mu?

Son madde en çok atlanandır ve üç direktifin de kökeninde o var. 248 gün, "hiçbir uçak bu kadar süre kesintisiz enerjili kalmaz" varsayımının sessizce gereksinim yerine geçmesidir. Yazılmamış varsayım, doğrulanamayan varsayımdır.

---

## Açık Sorular

Bu arıza sınıfının kapandığını söylemek zor. Modern IMA mimarilerinde zaman damgası taşıyan mesaj sayısı artıyor, uçuş içi eğlence ve bakım ağlarıyla birlikte sürekli enerjili kalan bileşen sayısı artıyor, ve "gövde kaç gün enerjili kalır" sorusunun cevabı operatörden operatöre değişiyor. 787 CCS direktifinin 2020'de, ilk GCU direktifinden beş yıl sonra çıkmış olması, dersin aynı üretici içinde bile tam olarak aktarılmadığını düşündürüyor.

Bana en ilginç gelen açık soru şu: sarma davranışı, gereksinim seviyesinde nasıl ifade edilmeli? "Sistem, kesintisiz 30 gün enerjili kaldıktan sonra da işlevlerini sürdürmelidir" biçimindeki bir gereksinim test edilebilir görünüyor ama pratikte test edilemez — 30 gün kimse beklemez. Gereksinimi "sayaç sarma noktasından geçildiğinde işlevler sürdürülür" biçiminde yazmak ise gereksinimi tasarım detayına bağlar, ki gereksinim mühendisliğinin kaçınmaya çalıştığı şeydir. Bu gerilimi temiz çözen bir kalıp gördüyseniz duymak isterim.

---

## Kaynaklar

- [FAA AD 2015-09-07 — Airworthiness Directives; The Boeing Company Airplanes (80 FR 24789, 1 Mayıs 2015)](https://www.govinfo.gov/content/pkg/FR-2015-05-01/html/2015-10066.htm) — 248 günlük GCU sayaç taşması, birincil kaynak
- [FAA AD 2018-20-15 (83 FR, 16 Ekim 2018)](https://www.federalregister.gov/documents/2018/10/16/2018-22152/airworthiness-directives-the-boeing-company-airplanes) — AD 2015-09-07'nin yerini alan, yeni GCU yazılımını zorunlu kılan direktif
- [FAA AD 2020-06-14 — Amdt. 39-19883 (85 FR 16237, 23 Mart 2020)](https://www.govinfo.gov/content/pkg/FR-2020-03-23/html/2020-06092.htm) — 51 günlük CCS/CDN bayat-veri izleme kaybı, birincil kaynak
- [EASA AD 2017-0129R1 — Integrated Modular Avionics – Internal Timer – Power Cycle (Reset)](https://ad.easa.europa.eu/ad/2017-0129R1) — A350-941, 149 saat
- [IOActive — A Reverse Engineer's Perspective on the Boeing 787 '51 days' Airworthiness Directive](https://www.ioactive.com/reverse-engineers-perspective-on-the-boeing-787-51-days-airworthiness-directive/) — EDE zaman damgası ve 51 günün aritmetiği üzerine teknik analiz
- [The Register — Boeing 787s must be turned off and on every 51 days](https://www.theregister.com/2020/04/02/boeing_787_power_cycle_51_days_stale_data/) — direktifin operasyonel yansıması
- [The Register — Airbus A350 software bug forces airlines to turn planes off and on every 149 hours](https://www.theregister.com/2019/07/25/a350_power_cycle_software_bug_149_hours/)
- [AdaCore — Compliance with DO-178C/ED-12C Guidance: Analysis](https://learn.adacore.com/booklets/adacore-technologies-for-airborne-software/chapters/analysis.html) — DO-178C §6.4.2.1/§6.4.2.2 robustluk testi kriterlerinin özeti
- [MathWorks — MISRA C:2023 Rule 12.4](https://www.mathworks.com/help/bugfinder/ref/misrac2023rule12.4.html) — kuralın yalnızca sabit ifadeleri kapsadığının teyidi
- [SEI CERT C — INT30-C: Ensure that unsigned integer operations do not wrap](https://wiki.sei.cmu.edu/confluence/display/c/INT30-C.+Ensure+that+unsigned+integer+operations+do+not+wrap) — işaretsiz sarma ve C standardındaki modulo davranışı

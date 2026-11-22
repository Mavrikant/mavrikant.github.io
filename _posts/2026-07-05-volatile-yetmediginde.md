---
title: "volatile Yetmediğinde: Kesme, DMA ve Multicore'da Bellek Sıralaması"
subtitle: "When volatile Isn't Enough: Interrupts, DMA, and Multicore Memory Ordering"
background: "/img/posts/2.webp"
date: '2026-07-05 08:00:00'
layout: post
lang: tr
categories: [yazilim]
tags: [c-cpp, gomulu, emniyet-kritik]
---

Gömülü bir projede kod incelerken en sık gördüğüm cümlelerden biri şudur: *"Bu değişken kesmede yazılıyor, `volatile` yaptım, artık güvenli."* Cümle iyi niyetle söylenir; söyleyen genelde on yıllık gömülü tecrübesi olan, MISRA C okumuş, hatta MC/DC kapsamıyla haşır neşir bir mühendistir. Yine de cümle çoğu zaman **yanlıştır** — ve yanlış olduğu durumların bir kısmı hiçbir zaman ürüne düşmez, bir kısmı yılda bir kez sahada patlar, bir kısmı da sertifikasyon incelemesinde ortaya çıkar.

Bu yazıda `volatile` anahtar sözcüğünün C dilinde **gerçekten ne vaat ettiğini**, hangi durumlarda tek başına yeterli olduğunu, ve hangi durumlarda "sessizce" başarısız olduğunu inceleyeceğiz. Sonra C11 ile gelen `_Atomic` niteleyicisinin ve donanım seviyesindeki bellek bariyerlerinin (`DMB`, `DSB`) devreye girdiği yerleri, ARM Cortex-A assembly çıktısı üzerinden somut olarak göreceğiz. Amaç sözlükten `volatile` tanımını tekrar etmek değil, üretim kodunda ne zaman hangi aracın gerekli olduğunu netleştirmek.

---

## Kısa Bir Tarihçe

`volatile`, C dilinin standartlaştığı ilk günlerden — ANSI C89'dan — beri mevcut. K&R'nin ikinci baskısı bu niteleyiciyi tek bir amaç için tanıtır: **derleyiciye, bu bellek konumunun programın kontrolü dışında değişebileceğini söylemek.** Klasik kullanım örneği bellek-eşlemli (memory-mapped) donanım register'larıdır. Örneğin bir UART'ın veri register'ını okuduğunuzda, aynı adresi tekrar okumak farklı bir değer verir — çünkü FIFO'dan bir sonraki baytı çekmişsinizdir. Derleyici bunu bilmez; `volatile` olmadan aynı adresin ikinci okumasını "gereksiz" görüp eleyebilir.

Bu tarihsel bağlam kritik: `volatile`, **tek çekirdekli, kesmesiz, cache'siz bir dünyanın** aracı olarak tasarlandı. C89 çıktığında (1989) tipik bir gömülü hedef 8-bit veya 16-bit bir MCU idi; multicore, out-of-order execution, cache coherency protokolü, DMA-CPU rekabeti gibi kavramlar üretim gömülü sistemlerin sözlüğünde yoktu. C11 (2011) ile birlikte C, ilk kez resmi bir **çok iş parçacıklı bellek modeline** ve `_Atomic` niteleyicisine kavuştu. Yani `volatile`'ın çözemediği eşzamanlılık problemleri için doğru araç sadece geçen on beş yılda elimize geçti; ve büyük bir mühendis kuşağı hâlâ 1989 zihniyetiyle kod yazıyor.

Hans Boehm'ün 2005 tarihli klasik makalesi "Threads Cannot be Implemented as a Library" bu boşluğu ilk kez net biçimde ortaya koymuştu: pthread modelinin C89 üzerine "kütüphane" olarak eklenmesi, derleyicinin optimizasyonlarının sessizce data race yaratmasını mümkün kılıyordu. C11'in bellek modeli, doğrudan bu problemin cevabıdır.

---

## `volatile` Aslında Ne Vaat Eder?

Standarda göre `volatile` şu üç garantiyi verir:

1. **Erişimler elemez.** Derleyici, `volatile` bir nesneye yapılan okuma veya yazmayı "gereksiz" görüp silemez.
2. **Sabit değere indirgemez.** Değişkenin daha önce yazılmış bir değeri hatırlanıp yerine sabit koyulmaz; her okuma gerçekten bellekten yapılır.
3. **Aynı volatile'a yapılan erişimler kendi aralarında yeniden sıralanmaz.** Kaynak koddaki sıra çıktıda korunur.

Ve şunları **vermez**:

- **Atomiklik yoktur.** Bir `volatile uint64_t` erişimi, hedef platformda tek bir makine komutuyla yapılabilir de yapılmayabilir de.
- **Bellek bariyeri değildir.** `volatile` bir değişkene yapılan erişim, ondan önce veya sonra gelen **başka** (volatile olsun olmasın) bellek erişimlerine göre yeniden sıralanabilir. Bu hem derleyici, hem donanım seviyesinde geçerlidir.
- **Cache tutarlılığı sağlamaz.** CPU cache'inin veya yazma tamponunun (store buffer) davranışına dokunmaz; DMA veya başka bir CPU'nun ne göreceği hakkında hiçbir söz vermez.
- **İş parçacıkları arasında görünürlük garantisi yoktur.** Bir çekirdekte yazılan `volatile` değer, başka bir çekirdek tarafından ne zaman görülür — standarda göre tanımsızdır.

SEI CERT'in **CON02-C** kuralı bu meseleyi tek cümlede özetler: *"volatile'ı senkronizasyon primitifi olarak kullanmayın."* Bu cümle Linux çekirdek geliştiricilerinin, MISRA çalışma grubunun, C standardı komitesinin ortak duruşudur.

---

## Doğru Kullanım: Kesme Paylaşımlı Bayrak (Tek Çekirdek)

`volatile`'ın gerçekten yeterli olduğu, klasik ve dar bir alan vardır: **tek çekirdekli** bir sistemde, **tek makine komutuyla** okunup yazılabilecek genişlikte bir değişkenin, ana döngü ile kesme servis rutini (ISR) arasında paylaşılması. Aşağıdaki desen sağlamdır:

```c
#include <signal.h>

static volatile sig_atomic_t event_flag = 0;

void ISR_Timer(void) {
    event_flag = 1;               /* kesme bağlamında yazılır */
}

void main_loop(void) {
    while (1) {
        if (event_flag) {         /* ana bağlamda okunur */
            event_flag = 0;
            handle_event();
        }
        /* diğer iş */
    }
}
```

Burada `volatile` niteleyicisi olmasaydı, derleyici `main_loop` içindeki `while` döngüsünü şöyle "optimize" edebilirdi: değeri register'a yükle, döngü boyunca oradan kontrol et, bellekten bir daha okuma. Bayrağı ISR ne kadar setlerse setlesin, ana bağlam onu asla göremezdi. `volatile` bu ölü döngüyü engeller.

C standardı özellikle bu senaryo için `sig_atomic_t` tipini tanımlar: platformun "kesintisiz okunup yazılabildiği" en dar tam sayı tipi. Tipik olarak 8 veya 32 bit genişliktedir. Kritik nokta şudur: **bu tekniğin sağlamlığı iki koşula bağlıdır** — tek çekirdek, ve erişimlerin tek komutla yapılıyor olması. İki koşul da bozulmaya başladığı anda `volatile` sessizce çöker.

---

## Sessiz Başarısızlık #1: Atomiklik Değildir

İlk somut örnek. Bir Cortex-M4 hedefinde saniyeleri sayan bir 64-bit sayaç tutuyoruz:

```c
static volatile uint64_t tick_us = 0;   /* SysTick ISR her µs artırır */

uint64_t read_time_us(void) {
    return tick_us;
}
```

Kodu yazan mühendisin niyeti net: `volatile` sayesinde okuma her seferinde bellekten yapılacak, kesmenin son yazdığı değer alınacak. Ama Cortex-M4'te 64-bit register yok. `arm-none-eabi-gcc -Os -mcpu=cortex-m4` derleyicisi `return tick_us;` için tipik olarak şu iki komutu üretir:

```armasm
    ldr     r0, [pc, #offset]      @ tick_us adresi
    ldr     r1, [r0, #4]           @ üst 32-bit
    ldr     r0, [r0, #0]           @ alt 32-bit
    bx      lr
```

İki `LDR` arasında SysTick kesmesi devreye girer ve sayaç `0x0000_0000_FFFF_FFFF`'ten `0x0000_0001_0000_0000`'a atlarsa, geri dönen değer `0x0000_0001_FFFF_FFFF` olur — hem gerçek eski hem gerçek yeni değerden **milyonlarca kat büyük**. Bu klasik **torn read**'tir. Değerin "milyar kat büyük" gelme frekansı çok düşük olduğu için hata aylarca gizlenebilir; bir gün bir zaman farkı hesabında geçici bir spike ile karşılaşır ve nedenini bulamazsınız.

`volatile` bu senaryoda hiçbir şey yapmadı. Derleyici zaten iki yükleme yapmak zorundaydı; `volatile` sadece onları **eleyemeyeceğini** garanti etti, ama **tek komutla yapılmalarını** sağlayamaz — o zaten mimari kısıttır.

Doğru çözüm, ya kritik bölgede kesmeyi kapatmak (`__disable_irq()` ... `__enable_irq()`), ya da C11 atomikleriyle bunu ifade etmektir:

```c
#include <stdatomic.h>

static _Atomic uint64_t tick_us = 0;

uint64_t read_time_us(void) {
    return atomic_load_explicit(&tick_us, memory_order_relaxed);
}
```

Cortex-M4'te 64-bit atomik okuma tek komutla yapılamayacağı için `stdatomic.h` bu erişimi ya bir spinlock ya da IRQ-kilit ile korur (uygulamaya göre değişir). Kritik olan: **atomiklik ihtiyacını isim düzeyinde ifade etmiş olursunuz**; derleyici platforma uygun mekanizmayı seçer. Bir gün kodu Cortex-M7 yerine `AArch64`'e taşırsanız, aynı erişim tek `LDR` ile karşılanır. `volatile` bu taşınabilirliği vermez.

---

## Sessiz Başarısızlık #2: Bellek Bariyeri Değildir

İkinci ve belki de en yaygın yanılgı: `volatile`, farklı bellek konumları arasında sıralama garantisi verdiği düşünülür. Vermez.

Klasik "üretici-tüketici" deseni:

```c
static uint32_t data;                    /* volatile DEĞİL */
static volatile int ready = 0;           /* volatile */

void producer(void) {
    data = compute();                    /* (1) */
    ready = 1;                           /* (2) */
}

void consumer(void) {
    if (ready) {                         /* (3) */
        use(data);                       /* (4) */
    }
}
```

Kodu yazan mühendisin varsayımı: derleyici (1) ve (2)'yi bu sırada bırakır çünkü `ready` `volatile`; tüketici `ready == 1` gördüğünde `data`'nın güncel olduğunu garantiler.

Bu varsayım **her iki katmanda da** yanlıştır.

**Derleyici katmanı.** C standardı, farklı bellek konumları arasında `volatile` erişiminin yeniden sıralamayı **engellediğini söylemez**. Derleyici, `data`'nın volatile olmadığını, `ready`'nin ise olduğunu görür. `data`'ya yazma ile `ready`'ye yazma arasında görünür bir bağımlılık yoksa, iyimser bir optimizer bunları yeniden sıralayabilir. Modern GCC ve Clang tipik olarak `volatile` erişimlerini "compiler barrier" gibi ele alma **eğilimindedir**, ama bu bir *standart garantisi değildir*; sadece bir kalite gözlemidir ve sürüm/optimizasyon seviyesi ile değişebilir.

**Donanım katmanı.** Diyelim ki derleyici sırayı bozmadı. Kod hâlâ yanlış. ARM Cortex-A gibi zayıf sıralı (weakly-ordered) bir mimaride, iki `STR` komutunun **belleğe düşme sırası** kaynak koddaki sırayla aynı olmak zorunda değildir. `data`'ya yapılan yazma daha sonra çıksa bile, `ready` yazması store buffer üzerinden daha erken görünebilir. Aynı şey okuma tarafında `LDR` sıralaması için de geçerlidir.

Bu nedenle taşınabilir bir yayınla-tüket protokolü şöyle yazılır:

```c
#include <stdatomic.h>

static uint32_t data;                                /* düz */
static _Atomic int ready = 0;                        /* atomik */

void producer(void) {
    data = compute();
    atomic_store_explicit(&ready, 1, memory_order_release);
}

void consumer(void) {
    if (atomic_load_explicit(&ready, memory_order_acquire) == 1) {
        use(data);
    }
}
```

`memory_order_release` derleyiciye ve donanıma şunu söyler: *"Bu yazıdan önce sıralanmış hiçbir bellek erişimi bu yazıdan sonraya taşınamaz."* Simetrik olarak `memory_order_acquire`: *"Bu okumadan sonra sıralanmış hiçbir erişim bu okumanın öncesine taşınamaz."* İkisi bir arada **release/acquire çifti** kurar ve `data`'nın görünürlüğünü garanti eder.

Cortex-A'da bu semantik tipik olarak `LDR` / `STR` çevresine bir `DMB ISH` komutu yerleştirilerek uygulanır. ARM'ın Cortex-A Programmer's Guide'ında (belge den0013) DMB (Data Memory Barrier), aynı paylaşım domain'indeki tüm gözlemcilerin, bariyerden önceki tüm explicit bellek erişimlerini, bariyerden sonrakilerden **önce** görmesini garanti eder. `volatile` bunu söz vermez — derleyiciden bu komutu emit etmesini istemenin standart bir yolu yoktur.

---

## Sessiz Başarısızlık #3: DMA ve Cache

Emniyet-kritik gömülü tarafta belki de en sinsi bug'ları yaratan senaryo. Bir Zynq-7000 üzerinde DMA ile ADC örneklerini SRAM'e taşıyor, sonra CPU'da bu tamponu işliyoruz:

```c
static volatile uint16_t adc_buffer[1024] __attribute__((aligned(64)));

void start_capture(void) {
    dma_configure(DMA_CH0, adc_buffer, 1024);
    dma_start(DMA_CH0);
}

void process_capture(void) {
    while (!dma_done(DMA_CH0)) { }
    for (int i = 0; i < 1024; i++) {
        sum += adc_buffer[i];              /* volatile okuma */
    }
}
```

Kod hem yazılım hem donanım açısından "doğru görünür" ama Cortex-A9 üzerinde `dcache` etkinken **sürekli çöp okur**. Neden? DMA transferi tamamlandığında yeni veri **fiziksel SRAM'dedir**; ama `adc_buffer` sanal adresine ait cache satırları, CPU'nun *önceki* okumasından kalan **eski verinin kopyasını** tutuyor olabilir. `volatile` okuma yapıldığında CPU `LDR` komutunu çalıştırır — L1 data cache "hit" verir, eski değeri döner. DMA'nın SRAM'e yazdığı yeni değer CPU'ya hiç ulaşmaz.

`volatile` niteleyicisinin cache ile hiçbir işi yoktur. Cache'e dokunan tek şey **cache maintenance komutlarıdır** (Cortex-A üzerinde `DCCMVAC` / `DCIMVAC` gibi). Doğru desen şudur:

```c
void start_capture(void) {
    /* DMA yazacağı için önce cache'i geçersiz kıl */
    Xil_DCacheInvalidateRange((UINTPTR)adc_buffer, sizeof(adc_buffer));
    dma_configure(DMA_CH0, adc_buffer, 1024);
    dsb();                                 /* invalidate DMA'dan önce bitmeli */
    dma_start(DMA_CH0);
}

void process_capture(void) {
    while (!dma_done(DMA_CH0)) { }
    dsb();                                 /* DMA yazması görünür olsun */
    Xil_DCacheInvalidateRange((UINTPTR)adc_buffer, sizeof(adc_buffer));
    for (int i = 0; i < 1024; i++) {
        sum += adc_buffer[i];
    }
}
```

`DSB` burada `DMB`'den güçlüdür ve gereklidir: cache invalidation komutunun kendisi bekleyerek tamamlanmalı, DMA başlamadan önce mimari olarak *bitmiş* olmalıdır. `DMB` sadece **sıralama** garanti eder, tamamlanmayı bekletmez. ARM Cortex-A Programmer's Guide bu ayrımı özellikle vurgular: DSB, bekleyen tüm explicit bellek erişimleri ve cache/TLB bakım işlemleri tamamlanana kadar pipeline'ı durdurur.

Buradaki daha derin ders şudur: `volatile`, adresin arkasındaki **cache dünyasını** görmez. Yazılım için cache "yok gibi" davranmayı yalnızca **strongly-ordered** veya **device** olarak işaretlenmiş bellek bölgeleri sağlar (MMU'daki bellek nitelikleri seviyesi). MMIO register'ları için tipik olarak sayfayı device olarak işaretleriz; DMA tamponları içinse ya non-cacheable ayrı bir sayfaya yerleştiririz ya da yukarıdaki gibi manuel cache bakımı yaparız.

---

## Sessiz Başarısızlık #4: Multicore'da Bellek Sıralaması

Cortex-A9 çift çekirdek bir SoC üzerinde, CPU0'da `producer`'ı çalıştırdığımızı, CPU1'de `consumer`'ı çalıştırdığımızı düşünelim. Bölüm 6'daki `volatile` versiyonuna geri dönelim:

```c
static uint32_t data;
static volatile int ready = 0;

/* CPU0 */ void producer(void) { data = 42; ready = 1; }
/* CPU1 */ void consumer(void) { if (ready) use(data); }
```

Bu kodun CPU1'de `data == 0` görebileceği en az iki neden vardır.

**Neden A — CPU0 tarafındaki store buffer.** ARM Cortex-A çekirdeklerinin her birinin kendi yazma tamponu vardır. `STR r0, [data_addr]` ve `STR r1, [ready_addr]` komutları program sırasında bu tampona bırakılır; tampondan L1'e, oradan L2'ye, oradan ana belleğe hangi sırada düşecekleri **mimari tarafından belirsiz** bırakılmıştır. `ready` `volatile` olsa bile mimari düzeyde iki store'un tampon-yayılma sırası değişebilir.

**Neden B — CPU1 tarafındaki spekülatif okuma.** CPU1 out-of-order execution yapan bir işlemcidir. `if (ready)` kontrolünden önce `data`'yı **spekülatif olarak** yükleyebilir. Eğer spekülatif yükleme `data = 42`'nin CPU1'e görünmesinden önce olursa, tahmin doğru çıksa bile eski `data` değeri consumer'a döner.

C11 atomikleri bu iki problemin **her ikisini de** doğru bariyerlerle çözer. Cortex-A GCC 12 çıktısında `atomic_store_explicit(&ready, 1, memory_order_release)` tipik olarak şuna benzer:

```armasm
    mov     r1, #1
    dmb     ish                    @ tüm önceki store'lar görünür olsun
    str     r1, [r0]
```

`memory_order_seq_cst` daha güçlüsünü ister, DMB'yi her iki tarafa da koyar. `memory_order_relaxed` ise bariyer eklemez — sadece derleyiciye "bu okuma/yazma optimize edilemez, tearing olmasın" der. Yani `relaxed` atomik, kabaca eski `volatile`'ın vaat ettiği tek şeyi verir; bariyer semantiğini üste açıkça sipariş edersiniz.

Bu ayrım Linus Torvalds ile Paul McKenney'nin LWN'de 2014'ten beri süren tartışmalarının özüdür: Linux çekirdeği C11 atomiklerini kısmen benimsemiş, kısmen kendi `READ_ONCE`/`WRITE_ONCE` makrolarıyla ve mimariye özel bariyerlerle devam etmiştir. Kullanıcı-alan kodu ve modern gömülü RTOS uygulamaları için ise C11 atomiklerine geçmemek için makul bir gerekçe kalmadı.

---

## `_Atomic`'in Derleyici Çıktısı — Yan Yana

Somut olsun. Aşağıdaki iki fonksiyonu `arm-none-eabi-gcc -O2 -mcpu=cortex-a9 -marm` ile derleyelim:

```c
#include <stdatomic.h>

volatile int v = 0;
_Atomic int a = 0;

void set_volatile(void)  { v = 1; }
void set_atomic_relaxed(void) {
    atomic_store_explicit(&a, 1, memory_order_relaxed);
}
void set_atomic_release(void) {
    atomic_store_explicit(&a, 1, memory_order_release);
}
void set_atomic_seqcst(void) {
    atomic_store_explicit(&a, 1, memory_order_seq_cst);
}
```

Tipik çıktı (basitleştirilmiş):

```armasm
set_volatile:
    ldr     r3, .L_v
    mov     r2, #1
    str     r2, [r3]
    bx      lr

set_atomic_relaxed:
    ldr     r3, .L_a
    mov     r2, #1
    str     r2, [r3]              @ volatile ile bit-bit aynı
    bx      lr

set_atomic_release:
    ldr     r3, .L_a
    mov     r2, #1
    dmb     ish                   @ önceki tüm store'lar bu str'den önce
    str     r2, [r3]
    bx      lr

set_atomic_seqcst:
    ldr     r3, .L_a
    mov     r2, #1
    dmb     ish
    str     r2, [r3]
    dmb     ish                   @ ve sonrası da sıralı olsun
    bx      lr
```

Üç şey dikkat çekiyor.

Birincisi, `set_volatile` ile `set_atomic_relaxed` **birebir aynı makine kodudur**. Yani `volatile`'ın belleğe düz `STR` emit etme davranışı, C11'de en zayıf atomik siparişe karşılık gelir. Farklı olan tek şey **niyet**: kodu okuyan bir sonraki mühendis (veya statik analiz aracı) `_Atomic`'i gördüğünde "bu değişken paylaşımlı" der; `volatile`'da böyle bir sinyal yoktur.

İkincisi, bellek bariyeri istediğiniz anda maliyet **belirli** ve **görünürdür**: her `DMB ISH` tipik olarak 5-20 saat çevrimi tutar (mimariye ve cache durumuna göre). `seq_cst` iki bariyer koyar; `release` bir. Neyin ne kadar tuttuğunu ölçmek ve ihtiyacınıza göre optimize etmek mümkündür. `volatile` ise sadece "bariyer koymam" der; koyma zamanı geldiğinde ne yaptığınızı bilmiyorsanız hâlâ yanlış yaparsınız.

Üçüncüsü, `relaxed` sürüm hâlâ `volatile`'ın sağladığı tek gerçek şeyi sağlar: **register'a cache'lenmez, sabit değerle değiştirilmez, elenmez**. Yani "kesmeyle paylaşılan basit bayrak" senaryosunda `_Atomic` en az `volatile` kadar iyi, ama semantik olarak daha nettir. MISRA C:2023 (ve dolayısıyla MISRA C:2025) tam olarak bu nedenle `_Atomic` niteleyicisini birinci sınıf vatandaş olarak muamele eder ve `_Atomic` niteliğinin dönüşüm yoluyla düşürülmesini yasaklar. Ölçüsüzce düşürmek, nesnenin kilit durumunu geçersiz kılabilir.

---

## Pratik Rehber

Aşağıdaki karar ağacı yıllardır kod incelemelerinde bana yol gösteriyor:

| Senaryo | Doğru araç |
|---|---|
| Bellek-eşlemli register (UART, GPIO, MMIO) | `volatile` + MMU'da device memory |
| Tek çekirdek, ISR ↔ ana döngü paylaşımlı bayrak, tek komutla erişilebilir tip | `volatile sig_atomic_t` **veya** `_Atomic` + `memory_order_relaxed` |
| Tek çekirdek, ISR ↔ ana döngü paylaşımlı **geniş** tip (64-bit vs) | Kesme kilidi (`__disable_irq`) veya `_Atomic` |
| Tek çekirdek, farklı konumlar arası sıralama gerekli (payload + flag) | Compiler barrier (`asm volatile("" ::: "memory")`) veya `_Atomic` + `release/acquire` |
| Multicore, paylaşımlı veri | `_Atomic` + `release/acquire` (veya `seq_cst`) |
| DMA tamponu, cache'li bölge | `volatile` **yetmez**: cache invalidate/clean + `DSB` |
| MMIO ile kesme paylaşımlı flag | `volatile` (register), ayrıca ISR-safe read-modify-write için kilit |
| Global durum, "olabilir değişir" his | Muhtemelen hiçbiri gerekmez; bug'ı ara |

Bir başka pratik gözlem: bir değişkenin isminin başına veya sonuna `_shared`, `_ipc`, `_isr` gibi bir ek getirin. Bu ek olan her nesnenin gerçekten `_Atomic` (veya kilitle korunuyor) olduğunu grep ile denetleyebilirsiniz. Statik analiz araçları (Coverity, Polyspace) `_Atomic` niteleyicisini bilir ve düşürülmüş erişimleri yakalar; `volatile` konusunda ise çok daha az yardımcı olurlar çünkü niteleyici zaten çok anlamlı değildir.

Son olarak, "eski kodu `_Atomic`'e taşımanın maliyeti" korkusuna bir cevap. `memory_order_relaxed` bariyer eklemez; assembly çıktısı `volatile` ile bit-bit aynı olur. Yani en azından **niyeti dokümante etmek** için hiçbir çalışma zamanı maliyeti ödemeden geçiş yapabilirsiniz. Bariyer maliyeti sadece gerçekten sıralamaya ihtiyaç duyduğunuz yerde ortaya çıkar — ve orada `volatile` zaten yanlış cevaptı.

---

## Sonuç

`volatile`, 1989'un tek çekirdekli, cache'siz, memory-mapped I/O dünyasının doğru cevabıdır. Modern gömülü sistemlerin — Cortex-A tabanlı multicore SoC'lerin, DMA-yoğun sinyal işleme mimarilerinin, RTOS koşan multithread uygulamaların — sorularına yanıt vermek için tasarlanmadı ve vermiyor.

C11 bize resmi bir bellek modeli ve `_Atomic` niteleyicisini verdi. Bugün, üretim gömülü kodda:

- **MMIO** için hâlâ `volatile` doğru cevap.
- **ISR ile paylaşım** için, dar tipte, tek çekirdekte, `volatile` yeterli — ama `_Atomic + relaxed` maliyetsiz ve daha nettir.
- **Sıralama, atomiklik, cross-thread visibility** gereken her yerde `volatile` yanlış cevap. `_Atomic` + doğru `memory_order` gerekir.
- **DMA + cache** senaryolarında `volatile` konu dışı; cache maintenance ve `DSB` şart.

Kod incelemelerinde "bunu `volatile` yaptım, tamam" cümlesini duyduğunuzda, ikinci soru "hangi problemi çözmek için?" olmalı. Cevap "kesme paylaşımı" ise ve tip dar, sistem tek çekirdek ise sorun yok. Diğer bütün cevaplar için bir sonraki soru: "atomiklik mi, sıralama mı, görünürlük mü — hangisi?" Bu üç ihtiyacın hiçbirini `volatile` karşılamıyor.

---

## Kaynaklar

- Hans-J. Boehm, "[Threads Cannot be Implemented as a Library](https://dl.acm.org/doi/10.1145/1065010.1065042)", PLDI 2005 — C11/C++11 bellek modelinin doğuş belgesi.
- SEI CERT C Coding Standard, "[CON02-C. Do not use volatile as a synchronization primitive](https://wiki.sei.cmu.edu/confluence/display/c/CON02-C.+Do+not+use+volatile+as+a+synchronization+primitive)".
- SEI CERT C Coding Standard, "[DCL22-C. Use volatile for data that cannot be cached](https://wiki.sei.cmu.edu/confluence/display/c/DCL22-C.+Use+volatile+for+data+that+cannot+be+cached)".
- Jonathan Corbet, "[C11 atomic variables and the kernel](https://lwn.net/Articles/586838/)", LWN, 2014.
- Jonathan Corbet, "[Time to move to C11 atomics?](https://lwn.net/Articles/691128/)", LWN, 2016.
- ARM, "[Cortex-A Series Programmer's Guide — Memory Ordering / Memory Barriers](https://developer.arm.com/documentation/den0013/0400/Memory-Ordering/Memory-barriers)" (belge den0013).
- ARM, "[DMB, DSB, and ISB — Instruction Reference](https://developer.arm.com/documentation/dui0489/e/arm-and-thumb-instructions/miscellaneous-instructions/dmb--dsb--and-isb)".
- MISRA, *MISRA C:2023 — Guidelines for the Use of the C Language in Critical Systems*, kural 8.17 ve `_Atomic` niteliğine ilişkin dönüşüm kısıtları. (2025 sürümü aynı çerçeveyi korur.)
- ISO/IEC 9899:2018, `_Atomic` type qualifier ve `stdatomic.h` başlığı.
- Karaman.dev, "[MISRA C:2025 ile Neler Değişti?]({% post_url 2026-04-05-misra-c-2025-ile-neler-degisti %})" — MISRA'nın C11 atomik desteğine yaklaşımı.
- Karaman.dev, "[Renode ile Zynq7000 Simülasyonu]({% post_url 2026-05-14-renode-ile-zynq7000-simulasyonu %})" — bu yazıdaki Cortex-A örneklerini simülasyonla doğrulamak için.

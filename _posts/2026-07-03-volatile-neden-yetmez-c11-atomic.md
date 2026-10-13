---
title: "'volatile' Her Şeyi Çözmez: ISR Paylaşımı, C11 _Atomic ve ARM Bellek Modeli"
subtitle: "Why 'volatile' Isn't Enough: ISR Sharing, C11 _Atomic and the ARM Memory Model"
background: "/img/posts/8.webp"
date: '2026-07-03 05:00:00'
layout: post
lang: tr
mermaid: true
---

Gömülü C dünyasında en sık tekrarlanan tavsiyelerden biri şu: "Bir değişkeni ISR ile paylaşıyorsan `volatile` ilan et, gerisi tamam." Bu cümle o kadar sık söylenir ki, artık bir refleks hâline gelmiştir. Oysa `volatile`, adı üstünde, *değişken oynaklık* hakkında bir söz verir; **atomiklik**, **görünürlük** (visibility) veya **sıralama** (ordering) hakkında hiçbir söz vermez. Bu üç ayrı garantiyi karıştırdığımızda ortaya çıkan hatalar, çoğu zaman aylarca üretimde uyur; sonra bir gün, sensör telemetrisinde saniyede bir kez, imkânsız görünen bir zıplama olarak yüzeye çıkar.

Bu yazıda önce `volatile`'ın ISO/IEC 9899:2011 standardında (yaygın adıyla C11) ne söz verdiğine bakacağız. Sonra somut bir örnek üzerinden — 32-bit Cortex-M4 üzerinde bir ISR'nin güncellediği 64-bit sayaç — `volatile`'ın neden yetmediğini derleyicinin ürettiği assembly çıktısı ile göstereceğiz. Ardından C11'in getirdiği `_Atomic`'in altında ne olduğunu, ARMv7-M ve ARMv8-A bellek modellerinin farkını, ve ne zaman `volatile`, ne zaman `_Atomic`, ne zaman gerçek bir kilit kullanmak gerektiğini konuşacağız.

---

## Hikâye: telemetrisinde imkânsız zıplayan sensör sayacı

Yerdeğerlendirme yazılımından şu şikâyet gelir: "Sensör paket sayacı bazen bir okumadan diğerine 4 milyar artıyor. Reset olmuyor, ama sayı büyük atlıyor. Bu nasıl olabilir?" Kodun ilgili yeri son derece masumdur:

```c
static volatile uint64_t rx_packet_count = 0;

void UART_IRQHandler(void)
{
    if (uart_rx_ready()) {
        (void)uart_read_byte();
        rx_packet_count++;         // ISR — saniyede binlerce kez
    }
}

uint64_t telemetry_snapshot(void)
{
    return rx_packet_count;        // görev bağlamı — 100 Hz
}
```

`rx_packet_count` `volatile` ilan edilmiş, hedef Cortex-M4 tek çekirdek, işletim sistemi FreeRTOS, kesme öncelikleri düzgün. Yine de sayaç 4 294 967 296 gibi güzelim bir sayının katları kadar zıplıyor. Bu sayının anlamı belirgindir: 32-bit sınır. Yani problem 64-bit değerin **iki ayrı 32-bit okuma** ile alınmasında, ve bu iki okuma arasında ISR'nin araya girmesindedir. Bu hata modunun adı **torn read**tir. `volatile` bu hata modunu **engellemez**, çünkü zaten öyle bir söz vermemiştir.

---

## `volatile` neye söz verir?

ISO/IEC 9899:2011 §6.7.3 paragraf 7'de şöyle der (özetle): `volatile` nitelemeli bir nesneye erişim, uygulamanın (implementation) bilmediği yollarla değişebileceği gerekçesiyle, soyut makinenin (abstract machine) belirlediği sırayı korumak ve gerçek erişim yapmak zorundadır. Pratikte derleyiciye şunları der:

- Nesneye yapılan her erişim **gerçekten bellek erişimi olarak** üretilecek — okumayı önbelleğe (register'a) alıp bir daha okumama, yazmayı bir sonraki yazmaya kadar erteleme, dead-store elemination gibi optimizasyonlar yasak.
- **Aynı** `volatile` nesneye yapılan erişimler kaynak kod sırasına göre üretilecek.

`volatile`'ın **söz vermediği** şeyler de aynı kadar önemlidir:

- **Atomiklik yoktur.** 64-bit bir `volatile` değişkene erişim tek bir talimat olmak zorunda değildir. 32-bit CPU'da tipik olarak iki LDR ile okunur, iki STR ile yazılır.
- **Sıralama garantisi başka nesnelere yayılmaz.** Farklı `volatile` nesneler arasındaki sıra yalnızca *tek bir yürütme akışı içinde* korunur; başka bir CPU'nun, DMA'nın veya ISR'nin bunu nasıl gördüğü hakkında bir söz yoktur.
- **Bellek engeli (memory barrier) üretmez.** Derleyici DMB/DSB gibi ARM barrier komutlarını `volatile` gördü diye eklemez. Ekleyecek olsaydı bile bu tek-çekirdek Cortex-M için gereksiz, çok-çekirdek Cortex-A için ise sıklıkla yetersizdir.

Yani `volatile`'ın gerçek tanım kümesi çok dardır: **derleyicinin optimizasyonlarını sınırlar**, donanımın bellek modelini değiştirmez.

---

## Cortex-M4 üzerinde 64-bit sayaç: derleyici gerçekten ne üretiyor?

ARMv7-M (Cortex-M3/M4/M7) profili **64-bit atomik erişim** komutu içermez. Bunu doğrulamak için ARMv7-M ARM'a bakabilirsiniz: LDREXD/STREXD çifti yalnızca ARMv6K, ARMv7-A ve ARMv7-R profillerinde tanımlıdır; M profili bunları desteklemez. Dolayısıyla 64-bit bir okuma iki LDR olarak, 64-bit bir yazma iki STR olarak üretilir. arm-none-eabi-gcc 13.2 üzerinde `-O2 -mcpu=cortex-m4` ile `telemetry_snapshot` fonksiyonu şuna benzer:

```asm
telemetry_snapshot:
    ldr     r3, .L_addr        @ rx_packet_count'un adresi
    ldr     r0, [r3]           @ düşük 32 bit
    ldr     r1, [r3, #4]       @ yüksek 32 bit
    bx      lr
```

ISR tarafında ise `rx_packet_count++` şuna dönüşür:

```asm
UART_IRQHandler:
    ...
    ldr     r3, .L_addr
    ldr     r2, [r3]           @ düşük 32 bit
    ldr     r1, [r3, #4]       @ yüksek 32 bit
    adds    r2, r2, #1
    adc     r1, r1, #0
    str     r2, [r3]           @ düşük yaz
    str     r1, [r3, #4]       @ yüksek yaz
    bx      lr
```

Şimdi hata modunu adım adım kurgulayalım. Diyelim ki `rx_packet_count = 0x00000000_FFFFFFFF`. Görev bağlamı `telemetry_snapshot`'ı çağırıyor:

1. Görev `ldr r0, [r3]` yapıyor — `r0 = 0xFFFFFFFF` (eski düşük yarı).
2. **Kesme geliyor.** ISR sayaçı bir arttırıyor: düşük yarı 0x00000000, yüksek yarı 0x00000001 oluyor. Belleğe yazıyor.
3. ISR bir kez daha koşuyor. Şimdi bellekte 0x00000001_00000001 var.
4. ISR biter, görev geri döner: `ldr r1, [r3, #4]` yapar — `r1 = 0x00000001`.
5. Fonksiyon `r1:r0 = 0x00000001_FFFFFFFF` döndürür.

Gerçek değer 0x100000001 iken görev 0x1FFFFFFFF görür — yaklaşık 4 milyarlık bir tepe. Sensör grafiğinde tanıdık gelen o "imkânsız zıplama" tam olarak budur. Ve dikkat: kaynak kodda hiçbir yerde `#include <atomic.h>` yok, hiçbir yerde hata yok; `volatile` da doğru şekilde kullanılmış. Sadece dilin verdiği garanti *ile* okuyucunun beklediği garanti farklı.

---

## `_Atomic`: standardın atomiklik sözü

C11, `<stdatomic.h>` başlığı ve `_Atomic` niteliği ile *atomiklik*, *görünürlük* ve *sıralama* için standart bir arayüz getirdi (ISO/IEC 9899:2011 §7.17). Aynı değişkeni şöyle tanımlarsak:

```c
#include <stdatomic.h>

static _Atomic uint64_t rx_packet_count = 0;

/* ISR içinde */
atomic_fetch_add_explicit(&rx_packet_count, 1, memory_order_relaxed);

/* Görev bağlamında */
uint64_t telemetry_snapshot(void)
{
    return atomic_load_explicit(&rx_packet_count, memory_order_relaxed);
}
```

`memory_order_relaxed`ı seçtim çünkü tek çekirdek Cortex-M'de sayaç değerinin başka bir değişkenle sıralanmasına ihtiyacımız yok; sadece atomiklik istiyoruz. Peki derleyici ne üretir? Cortex-M4 hedefinde `-O2` ile GCC'nin ürettiği çıktı ilginçtir:

```asm
telemetry_snapshot:
    push    {r4, lr}
    ldr     r0, .L_addr
    movs    r1, #0             @ memory_order_relaxed
    bl      __atomic_load_8    @ libatomic'e çağrı
    pop     {r4, pc}
```

GCC 64-bit atomik yükleme için `__atomic_load_8` adında bir kütüphane fonksiyonuna çağrı üretir. Bunun nedeni ARMv7-M'de 64-bit atomik komut olmamasıdır. Libatomic'in tipik `__atomic_load_8` implementasyonu M profilinde ya global bir spinlock ile korur, ya da — çıplak metal ve tek çekirdek durumunda daha yaygın olarak — kesmeleri maskeleyerek (`CPS ID i` ... `CPS IE i`) 64-bit okumayı kısa süreli olarak korur.

Yani `_Atomic` bize doğru sonucu verir, ama bunun bedeli:

- 64-bit için **kütüphane çağrısı** (libatomic-arm veya newlib alternatifi bağlanmalı).
- Uygulamaya göre **kısa süreli kesme maskeleme** — worst-case interrupt latency'ye eklenen deterministik ama sıfır olmayan bir gecikme.
- 64-bit load/store artık bir fonksiyon çağrısı; en zaman-kritik ISR'lerde bunun etkisini WCET analizinde hesaba katmanız gerekir.

**Alternatif — 32-bit'e düşürmek.** Çoğu zaman en pratik çözüm, sayaç yeteri kadar yavaş artıyorsa, onu 32-bit yapmaktır. ARMv7-M mimarisinde **hizalanmış 32-bit yükleme/yazma tek LDR/STR'dir ve bölünmez** (indivisible). Dolayısıyla tek yazıcı - tek okuyucu senaryosunda, hizalanmış `volatile uint32_t` gerçekten atomik okunur ve yazılır. Ama okuma-değiştir-yazma (RMW) desenleri — ki `++` operatörü tam olarak budur — hâlâ atomik değildir: LDR/ADDS/STR üç talimat, arasına kesme sığar.

**Alternatif — RMW için kısa kritik bölge.** Cortex-M'de en ucuz atomik RMW deseni, ilgili kesme kaynağını kısaca maskelemektir. Örneğin yalnızca UART ISR yazıyorsa:

```c
uint32_t irq_mask = __get_PRIMASK();
__disable_irq();
rx_packet_count++;
__set_PRIMASK(irq_mask);
```

Bu, sayaç güncellemesini tek yazıcı için atomik yapar, ancak `PRIMASK` **tüm** interrupt'ları maskeler; hard real-time bir sistemde bunun yerine `BASEPRI` ile öncelik-tabanlı maskeleme daha doğrudur. Cortex-M4 sisteminde çoğu FreeRTOS portu bunu zaten `taskENTER_CRITICAL_FROM_ISR()` altında yapar; onu kullanmak, kendi elle yazdığınız `CPS ID i`'den güvenlidir.

---

## Cortex-A / SMP: barrier gerekince `volatile` iki kat çöker

Şimdiye kadarki hata modu tek çekirdek Cortex-M'e özeldi ve *atomiklik* eksikliğiydi. Cortex-A (ARMv8-A) gibi çok çekirdekli, out-of-order, hafif gevşek (weakly ordered) bellek modeli olan bir mimariye geçtiğimizde ikinci bir eksik daha ortaya çıkar: **görünürlük ve sıralama**.

Klasik bir producer-consumer bayrağı düşünelim. CPU0 bir tampon doldurup bayrağı kaldırıyor, CPU1 bayrağı görünce tamponu okuyor:

```c
volatile uint32_t data;
volatile uint32_t ready;

/* CPU0 — producer */
data = 42;
ready = 1;

/* CPU1 — consumer */
while (ready == 0) { /* bekle */ }
uint32_t x = data;
```

ARMv8-A bellek modeli (ARM DDI 0487, "Memory Model" bölümü) `data` ve `ready`'nin CPU1 tarafından **kaynak koddaki sıraya** göre görüneceğini **garanti etmez**. Farklı adresler gevşek sıralı olduğundan, CPU1 `ready == 1`'i gördükten sonra `data`'nın hâlâ eski değerini okuyabilir. `volatile` bu senaryoda hiçbir işe yaramaz; ne DMB üretir, ne LDAR üretir, ne bir eşzamanlama çerçevesi tanımlar.

Doğrusu:

```c
_Atomic uint32_t data;
atomic_uint      ready;   /* <=> _Atomic unsigned int */

/* CPU0 — producer */
atomic_store_explicit(&data, 42, memory_order_relaxed);
atomic_store_explicit(&ready, 1, memory_order_release);

/* CPU1 — consumer */
while (atomic_load_explicit(&ready, memory_order_acquire) == 0) { }
uint32_t x = atomic_load_explicit(&data, memory_order_relaxed);
```

`release`/`acquire` çifti derleyiciyi ARMv8-A'da tipik olarak `STLR` (Store-Release) ve `LDAR` (Load-Acquire) komutlarını üretmeye zorlar. Bu komutlar donanım seviyesinde şu garantiyi verir: STLR'den *önceki* tüm bellek erişimleri, LDAR'ı *sonraki* okumalardan önce görünür. Yani `x` mutlaka 42 olur. Aynı garantiyi `volatile` ile almanın yolu ise sadece doğru yerlere elle `__DMB()` yerleştirmektir — ve pratik olarak insanlar bunu unuturlar.

ARMv7-M profilinde ise durum daha yumuşak: NVIC'ten gelen kesme, kesme-öncesi tüm bellek erişimlerinin tamamlanmasını beklemeye zorlar ve tek çekirdek olduğu için "diğer CPU"nun görünürlük problemi yoktur. Bu nedenle Cortex-M'de `volatile` + basit atomiklik önlemi çoğu zaman yeter — ama bunun sebebi `volatile`'ın güçlü olması değil, tek çekirdek + güçlü sıralamanın gizli yardımıdır. Kod Cortex-A'ya taşındığında bu yardım kaybolur.

---

## Peki `_Atomic` her yerin kilidini açmıyor mu?

Hayır. Atomik tipler *tekil değişkenler* için tasarlanmıştır. İki alan içeren bir yapı — örneğin `{ x, y }` — üzerinde koordineli değişiklik yapmanız gerekiyorsa `_Atomic struct` bunu bir kütüphane spinlock'una çevirir; kilit bedavaya gelmemiştir ve gerçek zamanlı sistemde deterministik değildir. Bu durumda:

- **Tek yazıcı, tek okuyucu** ise: iki bağımsız `_Atomic` alan + release/acquire yeterlidir.
- **Birden fazla yazıcı** varsa: bir mutex veya kesme maskeleme ile korunan kritik bölge — yani gerçek bir eşzamanlama primitifi.
- **Lock-free veri yapısı** yazıyorsanız: `atomic_compare_exchange_strong_explicit` ve ABA problemi seviyesindeki tartışmayı açtınız demektir. Bu ayrı bir yazının konusu.

---

## Pratik reçete: nerede `volatile`, nerede `_Atomic`, nerede kilit?

Aşağıdaki tabloyu Cortex-M ve Cortex-A hedefli C11+ kod tabanları için bir yol haritası olarak kullanıyorum.

| Senaryo | Doğru araç | Notlar |
|---|---|---|
| MMIO donanım register'ı | `volatile T*` | Atomiklik CPU tarafından mimari olarak sağlanır; okuma/yazma yan etkisi olmasın diye `volatile` şart. |
| `setjmp`/`longjmp` arasında değişen otomatik değişken | `volatile` | ISO C 7.13.2.1 gereği. |
| Sinyal işleyicisi ile paylaşılan bayrak | `volatile sig_atomic_t` | POSIX'te tek portable seçenek; C11+ ortamda `atomic_int` de kullanılabilir. |
| Tek yazıcı ISR + tek okuyucu görev, hizalanmış 32-bit sayaç, tek çekirdek Cortex-M | `volatile uint32_t` | Tek LDR/STR atomik. Ama sayaç RMW ise kritik bölge lazım. |
| Aynı sayaç ama 64-bit | `_Atomic uint64_t` + `memory_order_relaxed` | Libatomic çağrısı bekleyin; WCET'e ekleyin. |
| ISR içinde `x++` gibi RMW | Kısa kritik bölge (BASEPRI) veya `atomic_fetch_add_explicit` | Cortex-M0/M0+'da LDREX yok; sadece kesme maskeleme çalışır. |
| SMP Cortex-A üzerinde producer-consumer bayrağı | `_Atomic` + release/acquire | Derleyici LDAR/STLR üretir; `volatile` yetmez. |
| Çoklu alan güncellemesi (yapı) | Mutex veya seqlock | `_Atomic struct` kütüphane kilidine düşer; deterministik değildir. |
| DMA tamponu | `volatile` bloğu + `__DSB()` + cache maintenance | Cortex-A'da cache invalidate/clean açıkça yapılmalı; DSB çekirdek dışına da senkron eder. |

Cortex-M0 ve M0+'ta özel bir uyarı: bu iki çekirdekte LDREX/STREX yoktur (ARMv6-M). Dolayısıyla `<stdatomic.h>` çağrılarının çoğu libatomic içindeki *interrupt-masking* fallback'ine düşer. Kod okunabilir kalır, ama performans karakteristiği elle yazılmış "disable interrupts" bloğundan farksızdır — sadece görünmez olur. Bunu WCET tablosuna yazın.

---

## Kod inceleme rehberi: `volatile` gördüğünde sormanız gereken üç soru

Kendi kodumda ve inceleme yaptığım kodda `volatile` her karşıma çıktığında şu üç soruyu sırayla soruyorum:

1. **Bu değişken tek bir CPU komutuna sığar mı?** Hizalanmış 8/16/32-bit'te evet, 64-bit'te ARMv7-M'de hayır. Değilse `volatile` atomiklik vermez.
2. **Kaç yazıcı ve kaç okuyucu var?** Bir yazıcı - N okuyucu Cortex-M'de `volatile` + hizalanmış tip yeter; çoklu yazıcı asla yetmez.
3. **Başka bir değişkenle sıralanma gerekiyor mu?** Bir bayrak "veriye bak, veri hazır" der gibi kullanılıyorsa, bu producer-consumer'dır ve SMP mimaride `volatile` yetmez. `_Atomic` release/acquire gerekir.

Bu üç sorudan biri "hayır" derse, çözüm `volatile` ilan etmeye ek bir şey daha yapmaktan geçer.

---

## Diyagram: karar akışı

<div class="mermaid">
flowchart TD
    A[Paylaşılan değişken] --> B{MMIO — donanım register?}
    B -- Evet --> Bv[volatile T* — atomiklik mimariden]
    B -- Hayır --> C{Tek CPU komutuna sığıyor mu? hizalı 8-16-32 bit}
    C -- Hayır --> D[_Atomic + memory_order]
    C -- Evet --> E{RMW gerekli mi? artırma-azaltma}
    E -- Evet --> F{Cortex-M0 M0+ mı?}
    F -- Evet --> G[Kısa kritik bölge — BASEPRI veya PRIMASK]
    F -- Hayır --> H[atomic_fetch_add_explicit veya BASEPRI kritik bölge]
    E -- Hayır --> I{Başka değişkenle sıralanacak mı?}
    I -- Evet --> J{Tek çekirdek Cortex-M mi?}
    J -- Evet --> Jv[volatile + doğru kesme önceliği]
    J -- Hayır --> K[_Atomic + release/acquire — ARM için STLR/LDAR]
    I -- Hayır --> L[volatile yeter — hizalı tek yazıcı]
</div>

---

## Kısa toparlama

- `volatile` bir **derleyici** kısıtlamasıdır: nesneye erişimin gerçek erişim olarak üretileceğini ve aynı nesneye erişimlerin kod sırasında kalacağını söyler.
- `volatile` **atomiklik**, **görünürlük** ve **çoklu-değişken sıralama** hakkında hiçbir şey söylemez.
- 32-bit CPU'da 64-bit `volatile` erişimi kaçınılmaz olarak iki LDR ile üretilir; ISR ile paylaşımda torn read hata modunu açar.
- C11 `_Atomic` bu üç garantiyi de sağlar; ama Cortex-M4'te 64-bit atomik yükleme kütüphane çağrısına düşer, Cortex-M0/M0+'da libatomic kesme maskeleme fallback'ini kullanır. Bedelini WCET'e ekleyin.
- Cortex-A / SMP mimaride `_Atomic` release/acquire, `volatile`'ın veremediği görünürlük garantisini derleyici + donanım (STLR/LDAR) ile birlikte verir.
- MMIO, `setjmp`/`longjmp` ve sinyal işleyicisi paylaşımları `volatile`'ın gerçekten doğru cevap olduğu yerlerdir; ama bunlar da atomiklik ihtiyacını dışlamıyorsa `sig_atomic_t` gibi ek bir garanti gerekir.

Kod incelemesinde "sadece volatile ilan ettim" ile karşılaştığınızda üç soruyu sorun. Cevaplar sizi ya `volatile`'ın gerçekten yettiği dar bölgeye, ya `_Atomic`'e, ya da bir kilide yönlendirecektir.

---

## Kaynaklar

- ISO/IEC 9899:2011 — *Programming languages — C*. §6.7.3 (Type qualifiers), §7.17 (Atomics). [Kamuya açık son taslak: WG14 N1570](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf).
- ISO/IEC 9899:2018 (C17) — teknik olarak C11'in düzeltmesidir; atomik semantiğinde değişiklik yoktur.
- ARM Ltd., *Arm®v7-M Architecture Reference Manual*, DDI 0403E — LDREX/STREX komutlarının profil kapsamı, PRIMASK/BASEPRI davranışı. [developer.arm.com](https://developer.arm.com/documentation/ddi0403/latest/).
- ARM Ltd., *Arm®v8-A Architecture Reference Manual*, DDI 0487 — "Memory model" bölümü, LDAR/STLR semantiği, DMB/DSB/ISB. [developer.arm.com](https://developer.arm.com/documentation/ddi0487/latest/).
- ARM Ltd., "Barriers Litmus Tests and Cookbook", uygulama notu — SMP bellek modeli örnekleri.
- Herb Sutter, *Atomic Weapons* konuşması (C++ ve C11 atomik modeli) — 2012, kavramsal giriş için hâlâ güncel.
- H. J. Boehm, "Threads Cannot be Implemented as a Library", PLDI 2005 — `volatile` ile eşzamanlama girişiminin neden yetmediğinin temel referansı.
- GCC dokümantasyonu, `-fatomic` ve `__atomic` yerleşik fonksiyonlar sayfası. [gcc.gnu.org — Atomic Builtins](https://gcc.gnu.org/onlinedocs/gcc/_005f_005fatomic-Builtins.html).
- Linux çekirdeği belgeleri, `Documentation/memory-barriers.txt` — pratik SMP örnekleri; C++11/C11 bellek modeliyle karşılaştırma tablosu içerir.

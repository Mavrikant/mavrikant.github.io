---
title: "volatile Yetmez: C'de Eşzamanlılık, Bellek Modeli ve _Atomic'in Yeri"
subtitle: "volatile Is Not Enough: Concurrency, the Memory Model, and _Atomic in C"
background: "/img/posts/3.webp"
date: '2026-07-07 09:00:00'
layout: post
lang: tr
mermaid: true
---

Yıllar önce bir kod incelemesinde şu satırla karşılaştım:

```c
int isr_done = 0;

void ISR(void)       { isr_done = 1; }

void main_loop(void) {
    while (!isr_done) { /* bekle */ }
    process();
}
```

"Ama bu kesinlikle çalışır" dedi yazan arkadaş. "Kesme geldiğinde `isr_done` 1 olur, ana döngü bunu görür." `-O0` ile denediğimizde çalışıyordu; `-O2` ile derleyip flash'ladığımızda ana döngü sonsuza kilitlendi. Refleksle uygulanan çözüm — "`volatile` koy, geçer" — o gün için sorunu maskeledi.

`volatile`'ın **ne yaptığı**, **ne yapmadığı** ve tek başına neyi çözmediği gömülü C dünyasında hâlâ en sık yanlış anlaşılan üç meseleden biri. Bu yazı üç şeyi hedefliyor: (1) `volatile`'ı standardın öngördüğü sınırlar içinde yerine oturtmak, (2) derleyici çıktısı üstünden gerçekten neyi değiştirdiğini göstermek, (3) çok çekirdekli mimariler söz konusu olduğunda **neden yetmediğini**, C11'in `_Atomic` ile ne getirdiğini anlatmak.

---

## `volatile`'ın gerçek işi: standarttaki tanım

C11 (ISO/IEC 9899:2011) `volatile` tanımını iki farklı yerde birleştirir. §6.7.3 `volatile`'ı bir tip niteleyicisi olarak listeler; §5.1.2.3 "Program execution" ise standardın **soyut makine**sinin nasıl yorumlanacağını düzenler.

Kritik cümle §5.1.2.3'tedir: derleyicinin **"as-if" kuralı** vardır — gözlemlenebilir davranışı değiştirmedikçe her türlü optimizasyonu yapabilir. Peki "gözlemlenebilir davranış" ne? Standart üç şey tanımlar:

1. `volatile` nesnelere erişim,
2. I/O fonksiyonları aracılığıyla veri hareketi,
3. Program sonlanmasında dosyaların son durumu.

Yani `volatile` sözcüğünün somut anlamı şudur: **soyut makinenin belirttiği her erişimi derleyici gerçek bir bellek erişimine dönüştürmek zorundadır.** İki `volatile` erişim birbirinin yanında yeniden sıralanamaz. `volatile` bir değişken üstünde döngü içi bir okuma varsa, döngünün her turunda gerçek bir yükleme yapılmalıdır; derleyici değeri kayda kaldıramaz (hoist), yerelleştiremez.

Bu tanım ne söylüyor, ne söylemiyor?

- **Söylüyor:** Derleyici, tek bir `volatile` nesne için erişim sayısını, sırasını ve türünü koruyacak.
- **Söylemiyor:** Bir `volatile` erişim atomik olacak. Söylemiyor: iki farklı `volatile` erişim, non-volatile erişimlerle hangi sıraya girecek. Söylemiyor: CPU bunları bellekte hangi sırada görünür kılacak. Söylemiyor: iki çekirdek aynı `volatile` nesneyi tutarlı bir sırada görecek.

Bu ayrım yazının kalbi. Gelin bunu derleyici çıktısı üstünden görelim.

---

## Derleyici gerçekte ne yapıyor?

Aşağıdaki iki fonksiyonu düşünelim:

```c
extern int          poll_plain;
extern volatile int poll_vol;

void wait_plain(void) { while (poll_plain == 0) { /* nop */ } }
void wait_vol  (void) { while (poll_vol   == 0) { /* nop */ } }
```

`arm-none-eabi-gcc -O2 -mcpu=cortex-m4` altında `wait_plain` için üretilen tipik çıktı şuna benzer:

```asm
wait_plain:
    ldr     r3, =poll_plain
    ldr     r0, [r3]         @ değişkeni SADECE bir kez oku
    cbz     r0, .Lloop       @ 0 ise sonsuza kadar dön
    bx      lr
.Lloop:
    b       .Lloop           @ hiçbir bellek erişimi yok
```

Bu tam olarak baştaki ISR örneğindeki hatanın kökeni. Derleyici haklı: `poll_plain` `volatile` değil, döngü içinde onu değiştirebilecek başka bir gözlemlenebilir davranış yok, dolayısıyla değeri kayda alıp bir daha bakmama hakkı var.

`wait_vol` için ise çıktı şuna benzer:

```asm
wait_vol:
    ldr     r3, =poll_vol
.Lloop:
    ldr     r0, [r3]         @ HER turda yeniden yükle
    cmp     r0, #0
    beq     .Lloop
    bx      lr
```

Fark bir tek talimat değil, bir davranış farkı: birinci durumda program sonsuza kilitlenir, ikincisinde ISR bayrağı set ettiğinde döngü çıkar. Standardın "gözlemlenebilir davranış" tanımı bu çıktıda somutlaşıyor.

Bu yüzden `volatile`'ın **haklı** üç kullanım yeri vardır:

1. **Bellek eşlemeli I/O (MMIO).** Bir donanım kaydı, yazılım tarafında hiç değişmediği hâlde dışarıdan değişebilir. Yükleme ve saklamanın gerçekten donanıma inmesi gerekir.
2. **Sinyal işleyicileriyle paylaşılan bayraklar.** POSIX, sinyal işleyicide taşınabilir biçimde yalnızca `volatile sig_atomic_t` yazılabileceğini söyler.
3. **`setjmp`/`longjmp` güvenliği.** C11 §7.13.2.1, `longjmp` sonrasında `volatile` olmayan otomatik değişkenlerin değerinin belirsiz olabileceğini yazar.

Bunların dışına çıktığımız her yer artık `volatile`'ın ne yapmadığıyla ilgili.

---

## `volatile`'ın çözmediği sorun: eşzamanlılık

Aynı örneğe iki çekirdekli bir sistemde bakalım (mesela Zynq üzerindeki Cortex-A9 SMP). Çekirdek 0:

```c
extern volatile int ready;
extern volatile int data;

void producer(void) {
    data  = 42;
    ready = 1;
}
```

Çekirdek 1:

```c
void consumer(void) {
    while (ready == 0) { }
    use(data);        /* 42 gördüğünü umuyoruz */
}
```

Standardın `volatile` tanımı şunu garantiler: derleyici `data = 42` atamasını `ready = 1` atamasının sonrasına taşımayacaktır; iki `volatile` erişim birbirinden sıralanmalıdır. İyi haber bu. Kötü haber, derleyici sıraladıktan sonra sıra CPU'ya geliyor.

Modern CPU'lar (ARMv7-A, ARMv8-A, RISC-V) **weakly ordered** bir bellek modeli benimser. Yazılan bir değer, farklı yollardan farklı gözlemcilere farklı sırada görünebilir. Store buffer'lar, cache satırlarının bilgilendirme gecikmeleri, yazma birleştirme (write combining) — hepsi standardın soyut makinesinin altında çalışan mekanizmalar. C standardı bu katmanı **hiç görmez**; `volatile` yalnızca derleyiciye konuşur.

Sonuç: Çekirdek 1, `ready == 1` görebilir ama `data`'yı hâlâ eski değeriyle görüyor olabilir. Kaynak sıralaması korunmuş olsa da donanım açısından `data`'nın yeni değeri hâlâ Çekirdek 0'ın store buffer'ındadır. Bu senaryoyu üretmek için karmaşık bir örnek de gerekmez — Paul McKenney'in *perfbook*'undaki "message passing" örüntüsü tam olarak budur ve ARM/POWER üzerinde `litmus7` benzeri araçlarla gözlemlenebilir.

Bunu çözmenin iki yolu var:

1. Elle bellek engelleri: ARMv7'de `DMB ISH`, Linux `smp_wmb()`/`smp_rmb()`.
2. Dile entegre bir bellek modeli: **C11 `_Atomic`**.

İkincisi standardın sunduğu, taşınabilir yanıttır.

---

## `_Atomic` ne yapıyor?

C11 `<stdatomic.h>` (ISO/IEC 9899:2011, §7.17) ile dile bir **bellek modeli** getirdi. Aynı model C++11'de tanıtılmıştı; ikisi kasıtlı olarak birbirine yakın tutuldu. Anahtar tipler `atomic_int`, `atomic_uint`, `atomic_bool`; anahtar işlemler `atomic_load`, `atomic_store`, `atomic_exchange`, `atomic_compare_exchange_*`, `atomic_fetch_add`.

Her işlem bir `memory_order` bayrağı alır:

| Sıra                        | Sağladığı                                                        |
|-----------------------------|-------------------------------------------------------------------|
| `memory_order_relaxed`      | Sadece atomiklik; sıralama garantisi yok                          |
| `memory_order_acquire`      | Yükleme sonrası her erişim, yüklemeden sonra görünür              |
| `memory_order_release`      | Saklama öncesi her erişim, saklamadan önce görünür                |
| `memory_order_acq_rel`      | Read-modify-write için ikisi de                                   |
| `memory_order_seq_cst`      | Tüm iş parçacıklarında tek bir toplam sıra (sequential consistency) |

Producer/consumer örneğini `_Atomic` ile yazalım:

```c
#include <stdatomic.h>

atomic_int ready;
int        data;                  /* artık volatile de değil */

void producer(void) {
    data = 42;
    atomic_store_explicit(&ready, 1, memory_order_release);
}

void consumer(void) {
    while (atomic_load_explicit(&ready, memory_order_acquire) == 0) { }
    use(data);                    /* burada 42 garantidir */
}
```

Bu kodun somut anlamı: `release` yazımı `data = 42`'nin donanım seviyesinde önce görünmesini garanti eder; `acquire` yüklemesi 1 gördüğünde öncesindeki her yazma da o çekirdeğe görünür hâle gelmiştir. Aradaki `data`'nın kendisi artık `_Atomic` olmak zorunda değil, çünkü **senkronizasyon nesnesi** `ready`.

ARMv7-A üzerinde derleyici bu ipuçlarını `DMB ISH` gibi bellek engellerine çevirir; ARMv8-A'da `LDAR` (load-acquire) ve `STLR` (store-release) tek komuta iner. x86-64'te store-release neredeyse ücretsizdir — mimari zaten TSO ("total store ordering") olduğu için sadece derleyici reordering'i engellemek yeterlidir. Aynı kaynak kod, üç mimarinin de kendine özgü tuzaklarını doğru ele alır. Bu, `_Atomic`'in en büyük satış argümanıdır: **bellek modeli mimariyi soyutlar.**

---

## Ne zaman `volatile`, ne zaman `_Atomic`, ne zaman ikisi birden?

Pratik karar matrisi:

| Senaryo                                        | `volatile`           | `_Atomic`                  | Not                                          |
|------------------------------------------------|----------------------|----------------------------|----------------------------------------------|
| MMIO donanım kaydı                             | Evet                 | Genelde hayır              | Donanımın kendi sıralama semantiği var       |
| ISR ile ana döngü paylaşımı (tek çekirdek)     | Evet                 | Şart değil                 | `volatile sig_atomic_t` yeterli              |
| Kesme + çok çekirdek                           | Yetmez               | Evet (`acquire`/`release`) | Bellek engeli gerekiyor                      |
| İki iş parçacığı arası bayrak                  | Yetmez               | Evet                       | Kanonik kullanım                             |
| `setjmp`/`longjmp` yerel değişkenler           | Evet                 | –                          | C11 §7.13.2.1                                |
| Lock-free veri yapısı (kuyruk, halka arabellek) | Hayır               | Evet, önce `seq_cst`       | Karmaşık, dikkat                             |

MMIO'da nadiren `_Atomic volatile` de görürsünüz. Sebep: bir donanım kaydı hem soyut makine erişimi olarak kaybolmamalı (`volatile`), hem CPU açısından başka çekirdeklerle sıralı görünmeli (`_Atomic`). Linux çekirdeği bu meseleyi `WRITE_ONCE`/`READ_ONCE` makrolarıyla ayırır (`include/linux/compiler_types.h`), ki bu makrolar `volatile` cast tabanlıdır ve *bir* eşzamanlılık aracı olarak değil, sadece derleyicinin bir erişimi çoğaltmasını ya da yok saymasını engellemek için kullanılır. Kernel dokümantasyonundaki `volatile-considered-harmful.rst` metni de tam olarak "kilitleme yerine `volatile` kullanmayın" der.

---

## Sık yapılan üç hata

**1. Yapı üstünde `volatile`.** Bir `volatile struct` üyesine erişim, tüm yapıya atomik erişim garantisi vermez. Derleyici, üye üye yüklemek zorunda kalabilir; aralarında kesme ya da eşzamanlı erişim yarım okumaya sebep olabilir.

**2. `volatile int *p` vs `int * volatile p`.** İlki: `*p` üstünden yapılan erişim volatile'dır. İkincisi: `p`'nin kendisi (adres) volatile'dır, gösterdiği değer değil. Bu ikisi karışırsa MMIO tamamen bozulur — genelde bir emniyet kritik gözden geçirmede karşımıza çıkan en pahalı fark budur.

**3. Word-tearing.** ARM Cortex-M0'da `int64_t`'e yazma iki 32-bit talimat üretir. `volatile` bu iki yazmayı **atomik yapmaz**, sadece optimize edilmemesini sağlar. Kesme tam ortada gelirse yarım yazılmış değer okunur. Çözüm: platforma göre `atomic_int_least32_t` gibi bir `_Atomic` tip, ya da erişimin etrafında açık kesme kilitleme.

---

## Kim neyi koruyor?

<div class="mermaid">
flowchart LR
    C[C Kaynak Kodu] --> D[Derleyici Optimizasyonu]
    D --> M[Makine Kodu]
    M --> CPU["CPU / Store Buffer / Cache"]
    CPU --> MEM["Bellek — diğer çekirdekler için görünürlük"]

    subgraph L1["volatile burada iş görür"]
      C
      D
    end
    subgraph L2["_Atomic + memory_order burada iş görür"]
      M
      CPU
      MEM
    end
</div>

`volatile` yalnızca **kaynak-koddan-makine-koduna** olan çeviride derleyicinin ne yapabileceğini kısıtlar. Makine kodu çıktıktan sonraki her şey — CPU pipeline'ı, store buffer, cache tutarlılığı, çok çekirdekli görünürlük — `_Atomic`'in ve altındaki `memory_order`'ın alanıdır. Bu iki katmanı ayırmadan doğru sonuca ulaşmak zor.

---

## MISRA C açısından `volatile`

MISRA C:2012 Kural 11.8, `const` veya `volatile` niteliğini bir cast ile atmayı yasaklar. Nedeni açık: cast ederek niteleyiciyi kaybettiğinizde, derleyicinin sağladığı erişim garantisini de kaybedersiniz.

Kural 13.2 (bir ifadenin değeri ve kalıcı yan etkilerinin izin verilen tüm değerlendirme sıralarında aynı olması), `volatile` erişimlerin karmaşık ifadelere gömülmesini kısıtlar; bu yüzden bir `volatile` okumayı bir aritmetik ifadenin ortasına yerleştirmek yerine ayrı bir atamada tutmak yerleşmiş bir pratiktir:

```c
uint32_t sr = REG(UART_SR);      /* ayrı okuma */
if ((sr & TXE) != 0U) {          /* sonra kullan */
    REG(UART_DR) = c;
}
```

Genel eğilim şu: C11'den sonraki emniyet kritik kılavuzları eşzamanlılık için `_Atomic`'i tercih eder; `volatile` yalnızca kendi anlamı için — MMIO, sinyal işleyicileri ve `longjmp` güvenliği — tutulur.

---

## Pratik reçete

Aviyonik/gömülü bir kod tabanında karar akışı şuna benziyor:

1. **Bir donanım kaydına mı erişiyorsun?** Evet → `volatile`. Ayrıca gerekiyorsa cache invalidate/clean, DSB/ISB gibi mimariye özgü engeller.
2. **Aynı çekirdekte kesme ile paylaşılan bir bayrak mı?** Bayrak `sig_atomic_t` boyutunda ve tek yönlü mü (ISR yazar, main okur, ya da tersi)? Evet → `volatile sig_atomic_t`. Karşılıklı yazma varsa → `_Atomic` + `atomic_fetch_add` gibi bir RMW işlemi.
3. **Çok çekirdek ya da iş parçacığı arası mı?** Her zaman `_Atomic`. Yeni başlıyorsan `memory_order_seq_cst`'te kal; performans profillemesi olmadan bu sıralamayı gevşetme.
4. **`setjmp` kullanıyor musun?** `longjmp` sonrası korunmasını istediğin otomatik değişkenlere `volatile`.
5. **Bunların dışında?** Muhtemelen ne `volatile` ne `_Atomic` gerekiyor.

---

## Sonuç

`volatile`, C standardının bir eşzamanlılık aracı değildir; bir **derleyici yönergesidir**. Yaptığı iş çok net: soyut makinede belirtilen erişimleri fiziksel erişime dönüştür. Yapmadığı iş de aynı ölçüde net: atomikliği, CPU sıralamasını, çok çekirdekli görünürlüğü sağlamaz.

C11'den bu yana bu sorunların yeri `<stdatomic.h>` içindeki `_Atomic` ve `memory_order`. Bu araçların bedeli var — hem sözdizim hem düşünme yükü — ama karşılığında mimariden bağımsız, standart destekli, statik analizle uyumlu bir eşzamanlılık modeli getiriyor. MMIO ile eşzamanlılık farklı dünyalar: `volatile` birine, `_Atomic` diğerine bakar. İkisini karıştırdığımızda, hangisinin ne yaptığı belirsizleşir — ve `-O2` altında ortaya çıkan garip hatalar tam da bu yüzden çıkar.

Bir sonraki kod incelemede `volatile` gördüğünde soru şu olsun: bu "derleyici bir daha optimize etmesin" için mi konmuş, yoksa "iki çekirdek arasında bir şey sıralasın" için mi? İki niyet aynı anahtar sözcükle karşılanamaz.

---

## Kaynaklar

- ISO/IEC 9899:2011 (C11), §5.1.2.3 Program execution; §6.7.3 Type qualifiers; §7.13.2.1 `longjmp`; §7.17 Atomics.
- ISO/IEC 9899:2018 (C17) — C11'e karşı yalnızca hata düzeltmeleri içerir; volatile ve atomik semantiği değişmedi.
- ARM Architecture Reference Manual (ARMv8-A), Chapter B2 "The AArch64 Application Level Memory Model".
- Paul E. McKenney, *Is Parallel Programming Hard, And, If So, What Can You Do About It?* — özellikle "Advanced Synchronization: Memory Ordering" bölümü. Serbest erişim: <https://mirrors.edge.kernel.org/pub/linux/kernel/people/paulmck/perfbook/perfbook.html>
- Linux Kernel Documentation, "Why the `volatile` type class should not be used". <https://www.kernel.org/doc/html/latest/process/volatile-considered-harmful.html>
- Hans-J. Boehm, "Threads Cannot Be Implemented As a Library", HP Labs Technical Report HPL-2004-209, Kasım 2004. <https://www.hpl.hp.com/techreports/2004/HPL-2004-209.pdf>
- Jeff Preshing, "Memory Ordering at Compile Time" ve "Acquire and Release Semantics" — mimari-tarafsız açıklamalar. <https://preshing.com/20120625/memory-ordering-at-compile-time/>
- cppreference.com, "`memory_order`" (C11 semantiği C++'la aynıdır). <https://en.cppreference.com/w/c/atomic/memory_order>
- MISRA C:2012 Guidelines, Rule 11.8; Rule 13.2. MISRA C:2023 revizyonu, eşzamanlılık için C11 atomics kullanımını beklenmiş kabul eder.

---
title: "`volatile` Yetmez: C'de Eşzamanlılık, MMIO ve `_Atomic`"
subtitle: "Why `volatile` Isn't Enough: Concurrency, MMIO, and `_Atomic` in C"
background: "/img/posts/2.webp"
date: '2026-06-13 09:00:00'
layout: post
lang: tr
tags: [c, gomulu, eszamanlilik]
---

Gömülü bir kod tabanına yeni girdiğinizde gözünüze ilk çarpan şeylerden biri, etrafa serpiştirilmiş `volatile` anahtar kelimesidir. Bir kesme bayrağı vardır: `volatile uint8_t isr_flag;`. Bir donanım sayacı vardır: `volatile uint32_t *const TIMER = (uint32_t*)0x4001'0024;`. Bir ikinci çekirdeğin yazdığı paylaşımlı durum vardır: `volatile bool ready;`. Hepsi `volatile` damgasını taşır ve "iş güvene alındı" duygusu verir.

Bu duygu yanıltıcıdır. `volatile`, C dilinde en çok yanlış anlaşılan anahtar kelimedir; çünkü adı yaptığı işi anlatmaz, ve onun *sayesinde* doğru çalıştığına inanılan kodun çoğu, aslında derleyicinin henüz canınızı yakmamasına borçludur.

Bu yazı `volatile`'ın tam olarak ne *yaptığını*, neyi *yapmadığını*, C11'in `_Atomic` ile getirdiği gerçek bellek modelinin nasıl çalıştığını ve hangisini ne zaman kullanmanız gerektiğini ele alır. Sonunda ARM Cortex-A53 üzerinde gcc'nin ürettiği assembly çıktısına bakarak hikâyenin sözde değil somut olduğunu göreceğiz.

---

## `volatile`'ın aslında tek bir işi var

C standardı (C17 §6.7.3) `volatile`'ı dolambaçlı bir cümleyle tanımlar: "soyut makinenin kurallarına göre bir volatile nesneye yapılan her erişim aynen değerlendirilir". Düz Türkçesi tek satırdır:

> Derleyici, `volatile` bir nesneye yapılan okuma ve yazmaları **silemez, birleştiremez, yeniden sıralayamaz başka volatile erişimlerle göre, kayda alamaz**.

Bu kadar. Başka hiçbir şey vaat etmez.

Tipik bir gömülü mühendis için "derleyici beni kandırmasın" zaten yeterli görünür. Şu klasik döngüye bakalım:

```c
uint8_t isr_flag = 0;

void wait_isr(void) {
    while (isr_flag == 0) { /* bekle */ }
}
```

Bir kesme rutini `isr_flag = 1` yapıyor olsun. Optimizasyonsuz derlemede sorun yok. `-O2` ile derleyici şunu görür: `wait_isr` fonksiyonunun gövdesinde `isr_flag` değişmiyor; öyleyse onu bir kez okuyup register'a alıp sonsuz döngüye düşmek meşrudur. Sonuç: sistem kilitlenir. Bayrak `volatile` yapılırsa derleyici her tur belleğe geri gitmek zorundadır, döngü açılır.

İşte `volatile`'ın yaptığı şey budur: erişimi belleğe sabitler. Standart bunu "yan etkili erişim" üzerinden tanımlar — derleyici için `volatile` okumak `printf` çağırmakla aynı kategoridedir. Görmezden gelinemez.

Bunun gerçekten yararlı olduğu üç sahne vardır:

**1. Memory-mapped I/O.** Donanım kaydedicilerine erişim. `*UART_STATUS` her okumada gerçekten bus'a çıkmalıdır; derleyici "bir önceki değeri register'da tutuyordum" diye kestiremez. Bu, `volatile`'ın varoluş sebebidir.

**2. `setjmp` / `longjmp`.** C17 §7.13.2.1 ¶3'e göre, `setjmp` ile `longjmp` arasındaki blokta değeri değişen yerel değişkenler `longjmp` sonrası belirsiz değere düşer — `volatile` olarak işaretlenmedikleri sürece. `volatile`, derleyicinin değişkeni register'a alıp asıl kopyayı geride bırakmasını engeller.

**3. `sig_atomic_t` ile sinyal işleyici.** C17 §7.14.1.1 ¶5 nettir: bir sinyal işleyicisi, statik veya thread-storage süreli bir nesneye yalnızca **(a)** lock-free atomic ise veya **(b)** `volatile sig_atomic_t` tipinden bir değişkene değer atıyorsa portatif olarak dokunabilir. Aksi hâlde davranış tanımsızdır.

Üç senaryonun da ortak yanı: derleyicinin görmediği, *aynı thread* içinden asenkron biçimde değişen veriye erişmek. `volatile`'ın asıl niyeti budur.

Buraya kadar her şey iyi. Sorun başka yerde.

---

## `volatile`'ın yapMAdığı üç şey

`volatile` sayesinde "iş güvene alındı" hissi, üç farklı garantinin `volatile`'a yüklenmesinden gelir. Standart bu üç garantinin hiçbirini vermez.

**Atomiklik garantisi yok.** `volatile uint64_t counter` bir 32-bit Cortex-M üzerinde tek bir makine komutuna inmez. Okuma ve yazma iki ayrı `ldr`/`str` çiftine dönüşür. İki çekirdek veya bir kesme bu dizilişin ortasında girerse "yarım yazılmış" bir değer okursunuz. `volatile` derleyicinin erişimi *belleğe çıkarmasını* zorlar; tek komut olduğunu *garanti etmez*.

**Sıralama garantisi yok — volatile-olmayanlara karşı.** Standart yalnızca "volatile erişimler birbirine göre yeniden sıralanmaz" der. Volatile bir yazma ile sıradan bir yazma arasında derleyici (ve donanım) istediği sırayı tutabilir. Klasik tuzak:

```c
shared_data = compute();   /* sıradan yazma */
volatile_ready_flag = 1;   /* "okuyucuya hazır olduğunu söyle" */
```

Niyet açık: önce veri, sonra bayrak. Ne derleyici ne de modern bir CPU bu sırayı garanti eder. Okuyucu çekirdek `ready_flag == 1` görür, sonra `shared_data`'yı henüz güncellenmemiş hâliyle okur. Hata sistemde gerçek bir yarış koşuludur; `volatile` onu çözmez, çözüyormuş gibi görünmesine yol açar.

**Çoklu çekirdek (cache + reordering) garantisi yok.** Bu en derindeki yanılgıdır. Bir ARM Cortex-A çift çekirdeği düşünün. Çekirdek 0 paylaşımlı bir değişkene yazar. Bu yazı önce store buffer'ına, sonra L1'e, sonra L2'ye düşer; aynı satırın diğer çekirdeklerdeki kopyaları MOESI tarzı bir protokolle invalidate edilir. Bu zincir göründüğü kadar anlık değildir.

ARM mimarisi *weakly ordered*'dur — donanım yazıları/okumaları yeniden sıralama hakkını saklı tutar. Diğer çekirdeğin yazıyı görmesini istiyorsanız aradaki sırayı **belirgin bir bellek bariyeriyle** (DMB, DSB) zorlamanız gerekir. `volatile` ne derleyiciye ne de donanıma bir bariyer ürettirmez. Yazdığınız `str` komutu çıkar; barrier komutu çıkmaz.

Bu noktada Linux çekirdeği topluluğunun yıllar önce vardığı sonuca varıyoruz: "volatile düşünüldüğü kadar zararlı". [Documentation/process/volatile-considered-harmful.rst](https://www.kernel.org/doc/Documentation/process/volatile-considered-harmful.rst) belgesi (Jonathan Corbet) tam olarak şunu söyler:

> *"`volatile`'ın amacı optimizasyonu bastırmaktır ve bu neredeyse hiçbir zaman gerçekten istediğin şey değildir. Çekirdekte paylaşılan veri yapılarını istenmeyen eşzamanlı erişime karşı korumak gerekir; bu çok farklı bir iştir."*

Çekirdek dokümanı `volatile`'ı *yalnızca* dört durumda kabul eder: I/O accessor fonksiyonları, derleyicinin yan etkili inline assembly'yi silmesini önlemek, `jiffies` (eski bir miras), ve donanımın değiştirdiği coherent bellek (örn. bir NIC'in işlemiş olduğu ring buffer descriptor'larını gösteren işaretçi). Geri kalan tüm "ben bunu paylaşımlı veri için kullanıyorum" durumları, dokümanın deyişiyle, "kodda bir hatanın olduğuna dair güçlü bir gösterge"dir.

---

## C11'in cevabı: `_Atomic` ve bir bellek modeli

C99'a kadar dilin resmî olarak bir **bellek modeli** yoktu — derleyicinin, bir thread'in yazısının başka bir thread'e ne zaman ve nasıl görüneceğine dair söyleyecek bir sözü yoktu. C11 bunu değiştirdi (§5.1.2.4) ve `<stdatomic.h>` ile birlikte gerçek bir senkronizasyon araç kutusu getirdi.

Tek satırlık ayrım:

> `volatile` derleyiciye *erişimi silme* der. `_Atomic` hem derleyiciye hem donanıma *erişimin sırasını, atomikliğini ve görünürlüğünü garantile* der.

Aynı bayrak senaryosunu `_Atomic` ile yazalım:

```c
#include <stdatomic.h>

atomic_int shared_data;
atomic_int ready;

void producer(void) {
    atomic_store_explicit(&shared_data, compute(),
                          memory_order_relaxed);
    atomic_store_explicit(&ready, 1,
                          memory_order_release);
}

int consumer(void) {
    while (atomic_load_explicit(&ready,
                                memory_order_acquire) == 0) { }
    return atomic_load_explicit(&shared_data,
                                memory_order_relaxed);
}
```

Burada `release/acquire` çifti şunu söyler: "Üreticideki `release` yazısı görünürse, ondan *önce* gelen tüm sıradan yazılar da görünür." Derleyici doğru sırayı tutmak zorundadır, ve donanım için gereken bariyeri (ARM'da DMB ISH) emit etmek zorundadır. Yanlış kullanım hâlâ mümkündür, ama artık konuştuğunuz bir dil vardır.

`_Atomic`'in bellek sıralama paleti küçüktür ama hiyerarşiktir:

| `memory_order` | Sözleşme | Tipik kullanım |
|---|---|---|
| `relaxed` | Sadece atomiklik. Sıralama yok. | Bir sayaç, performans sayacı. |
| `consume` | `acquire`'in zayıf varyantı; pratikte derleyiciler `acquire`'e yükseltir. | Pratikte kaçınılır. |
| `acquire` | Bu okumadan *sonraki* hiçbir bellek erişimi yukarı taşınamaz. | Bir kilidi almak, bir bayrağı beklemek. |
| `release` | Bu yazıdan *önceki* hiçbir bellek erişimi aşağı taşınamaz. | Bir kilidi bırakmak, "veri hazır" demek. |
| `acq_rel` | İkisi birden. | Read-modify-write. |
| `seq_cst` | Global toplam sıralama. En güçlü, en pahalı. Varsayılan. | Şüphedeyseniz buradan başlayın. |

Çıplak `atomic_int x; x = 1;` yazdığınızda kullanılan varsayılan `memory_order_seq_cst`'dir — yani bedava gibi görünür ama altta yatan mimariye göre fazladan bir bariyer veya özel komut emit eder (ARMv7'de iki yanlı DMB, ARMv8'de store-release komutu). Açıkça `_explicit` sürümlerini kullanıp `relaxed`/`acquire`/`release` seçmek, gereken kadar güçlü, daha pahalı olmayan kod üretir.

Bir nüans: `_Atomic T` ile `volatile _Atomic T` farklı şeylerdir. `volatile` damgası atomiğin üstüne eklendiğinde, derleyicinin atomik erişimi bile yan etkili sayması istenir — yani arka arkaya iki `atomic_load` görse bile birleştiremez. Donanım kaydedicisi *üzerine* atomik erişim yapmak gibi nadir durumlar dışında bu kombinasyona ihtiyaç olmaz.

---

## Derinlik öğesi: gcc'nin gerçekten ürettiği komutlar

İşi pratik bir tartının üstüne koymanın tek yolu, derleyici çıktısına bakmaktır. Aynı niyetin üç farklı C kodunu, ARM Cortex-A53 hedefiyle, gcc 13 ile `-O2 -march=armv8-a` derlediğinizde gördüklerinizdir. (Üretim taraması: godbolt.org; çıktılar diğer son sürüm gcc'lerle de eşdeğer.)

**Versiyon 1 — sıradan değişken:**

```c
int shared = 0;
void writer(int v) { shared = v; }
```

Çıktı:

```asm
writer:
    adrp    x0, shared
    str     w0, [x0, #:lo12:shared]
    ret
```

Tek bir `str`. Hiçbir bariyer yok. Derleyici tek başına bu yazıyı başka yazılarla yeniden sıralamakta serbesttir.

**Versiyon 2 — `volatile`:**

```c
volatile int shared = 0;
void writer(int v) { shared = v; }
```

Çıktı:

```asm
writer:
    adrp    x0, shared
    str     w0, [x0, #:lo12:shared]
    ret
```

Aynısı. Tek fark gözle görülmüyor: derleyici bu `str`'yi başka *bir başka volatile* erişimle yeniden sıralayamaz; ama bariyer yok, donanım hâlâ istediğini yapabilir.

**Versiyon 3 — `_Atomic`, `seq_cst`:**

```c
#include <stdatomic.h>
atomic_int shared = 0;
void writer(int v) { atomic_store(&shared, v); }
```

Çıktı:

```asm
writer:
    adrp    x0, shared
    stlr    w0, [x0]            ; <-- store-release
    ret
```

Tek `str` yerine `stlr` (store-release) görüyoruz. Bu, ARMv8'in atomik sıralama için tasarladığı özel store komutudur: yazı tamamlanmadan ondan önceki tüm bellek erişimleri tamamlanmak zorundadır. Bariyer komutu emit etmek zorunda bile değil; ARM'ın yeni mimarisi bunu komutun kendisine gömmüş durumda.

**Versiyon 4 — `_Atomic`, `release`:**

```c
atomic_store_explicit(&shared, v, memory_order_release);
```

Aynı `stlr` çıkar. ARMv8 üzerinde `release` ile `seq_cst` arasındaki fark store tarafında değil, *okuma-yazma karışık* senaryolarda ortaya çıkar.

**Versiyon 5 — ARMv7-A (eski Cortex-A9 vb.) için `atomic_store` (varsayılan `seq_cst`):**

```asm
writer:
    movw    r3, #:lower16:shared
    movt    r3, #:upper16:shared
    dmb     ish                 ; <-- yazıdan önce bariyer
    str     r0, [r3]
    dmb     ish                 ; <-- yazıdan sonra bariyer
    ret
```

İki `dmb ish` (Data Memory Barrier, Inner Shareable) komutu görüyoruz. ARMv7 store-release komutuna sahip olmadığı için derleyici `seq_cst` semantiğini iki bariyerle elde etmek zorunda kalır (sadece `release` istenseydi tek `dmb ish; str` yeterdi). `volatile` sürümü ise yalnız `str`'dir; aradaki uçurum tek bir komut bile değildir, **iki komut**tur — ve yarış koşulu tam bu iki komutun olmadığı yerde meydana gelir.

İşte bu son kıyaslama, "neden çalışıyor gibi görünüyor ama bir gün üretimde patlıyor" sorusunun cevabıdır. `volatile` derleyici düzeyinde doğru komutu çıkarttırır; ama donanımın yeniden sıralama hakkını elinizden almaz. `_Atomic` (release/acquire), donanıma "şu noktada bir hizalama isterim" diyen komutları üretir.

---

## "Hangisini ne zaman?" — pratik tablo

Bir kod tabanında yön bulmak için işe yarayan kestirme:

| Senaryo | Doğru araç | Yanlış araç |
|---|---|---|
| MMIO register (UART_STATUS, GPIO_DATA) | `volatile T *` | Düz `T *` (derleyici okumayı kaçırır) |
| `setjmp`/`longjmp` arası yerel değişken | `volatile T` | Düz `T` (longjmp sonrası UB) |
| Sinyal işleyici ile `main` arası bayrak | `volatile sig_atomic_t` ya da `atomic_int` (lock-free olduğu sürece) | Düz `int` (UB) |
| Tek çekirdek, kesme ile arka plan arası tek bayt bayrağı | `volatile uint8_t` *yeter (tek baytlık okuma atomiktir)* — ama `atomic_uchar` daha temiz niyet bildirir | Çoklu çekirdekte: hiçbiri tek başına yetmez, bariyer gerekir |
| Çoklu çekirdek arası paylaşımlı değişken | `_Atomic` (`atomic_int`, `atomic_bool`, …) | `volatile`; bariyersiz hiçbir sıralama garantisi yok |
| 64-bit sayacın 32-bit makinede güncellenmesi | `_Atomic uint64_t` (lock-free destekleniyorsa) | `volatile uint64_t` (yarım yazma görülür) |
| RTOS task'ları arası produce/consume | `_Atomic` veya RTOS'un mutex/semaphore'u | `volatile` (yarış koşulu kaçınılmaz) |

Bir kurala indirgersek:

> `volatile` "derleyici beni atlatmasın" demektir. `_Atomic` "başka bir thread bunu doğru sırada görsün" demektir. İkisi farklı sorulardır.

Linux çekirdeğinin "neredeyse hiçbir yerde volatile yok" tutumu da buradan gelir: çekirdek zaten kilit, RCU, `READ_ONCE`/`WRITE_ONCE` ve `smp_*` bariyerleriyle her iki garantiyi de ayrı ayrı kuruyor. Sıradan kullanıcı kodu için bu cephanelik yok; ama C11'den itibaren `<stdatomic.h>` standart yoldur.

---

## Sık karşılaştığım dört tuzak

**1. "İkisini de yapalım" yanılgısı.** `volatile _Atomic int x;` görünce paranoyak bir mühendis yazmış sanılır. Çoğu zaman gereksizdir ve atomik erişimlerin birleştirilmesini engelleyerek performansı düşürür. İhtiyaç yalnızca: "atomik bir değişken üzerinden MMIO yapıyorum" gibi gerçekten patolojik durumlardır.

**2. `volatile` ile MMIO'ya tek başına güvenmek.** ARM Cortex-A'da bir DMA descriptor'ı yazıp donanıma "git" demek istiyorsanız, descriptor yazılarının DMA başlatma yazısından *önce* görünür olması gerekir. `volatile`, derleyicinin sırayı bozmasını engeller; ama donanımın write buffer'ında biriken yazıların boşalmasını **garantilemez**. Aralara `__dmb()` ya da `__dsb()` koymak gerekir — bu nokta nedeniyle çoğu mikrodenetleyici HAL'ı `volatile`'ı `barrier()` makrolarıyla beraber kullanır.

**3. `sig_atomic_t`'yi `_Atomic` sanmak.** Standart yalnızca **tek bir atomik atama**ya izin verir; `++` veya read-modify-write *değil*. Eğer sinyal işleyicide gerçekten artırmak istiyorsanız C11'in `atomic_int`'i lock-free ise onu kullanın; ya da işin doğasını gözden geçirin.

**4. "x86'da çalışıyor, ARM'da da çalışır" varsayımı.** x86 strongly ordered'a yakın bir bellek modeline sahiptir; çoğu eksik bariyer x86'da gizlenir. Aynı kod ARM, RISC-V veya POWER üzerinde patlar. Test ortamınız x86 ise, ürün ARM ise, kodu ARM mimarisi ölçeklerinde düşünün; godbolt'a bakın, gerekirse Renode'da simüle edin.

---

## Pratik tavsiye listesi

- Yeni kod yazıyorsanız: paylaşımlı veri için `<stdatomic.h>`'a varsayılan olarak yönelin. C11'iniz yoksa derleyiciye özel intrinsic'leri (`__atomic_*`) doğrudan kullanın; emit edilen kod yine doğru bariyerli olur.
- `volatile`'ı yalnızca üç sahnede kullanın: MMIO, `setjmp`/`longjmp`, `sig_atomic_t`. Geri kalan her yerde "buraya neden `volatile` koydum?" sorusuna verdiğiniz cevap "bayrak işte" ise, kod yanlıştır.
- Bariyerleri görmek için derleyici çıktısına bakın. ARM'da `dmb`, `dsb`, `stlr`, `ldar` komutlarını arayın; yoksa bariyer yok demektir. Bir varsayımı doğrulamak için godbolt yarım dakikalık bir tartıdır.
- HAL kodunuz `volatile` damgalı pointer'ları `barrier()` makrolarıyla beraber kullanıyorsa, bu makroların gerçekten `__dmb(SY)` veya benzeri bir komut emit ettiğini doğrulayın. "Sözde bariyer" kod tabanlarında yaygındır.
- Çok çekirdekli bir sistemde "sadece bir bayrak, basit bir şey, atomik gerekmez" cümlesini her duyduğunuzda kırmızı bayrak çekin. Basit bir bayrağın yanlış sırada okunması, üretim sahasında *aylar sonra* patlayan klasik bir hata sınıfıdır.

---

## Açık sorular ve ileri okuma

- **`memory_order_consume`** standartta var ama hiçbir derleyici düzgün uygulamıyor; pratikte her zaman `acquire`'e yükseltiliyor. Bu boşluk C2x süreçlerinde tartışılıyor; gözlemeye değer.
- **Hardware memory model'in formal modelleri** (ARM "herd7" araç ailesi, x86-TSO, Linux LKMM) C dil modelinden bağımsız olarak gelişiyor. Gerçekten kritik kod yazıyorsanız `herdtools7` ile küçük testleri *modelleyerek* doğrulamak mümkün.
- **MISRA C:2025**, çoklu thread'li koda dair (Dir 5.x ailesi) ve `volatile` kullanımına dair kurallarıyla birlikte gelir; emniyet kritik kod yazıyorsanız bu kuralları derleyici çıktısı bilgisiyle birlikte okumak çok daha anlamlıdır.
- Derinlemesine bir referans: Hans Boehm'in 2005 PLDI makalesi *"Threads cannot be implemented as a library"* — modern C/C++ bellek modelinin doğuş hikâyesi.

---

## Kaynaklar

- ISO/IEC 9899:2018, *Programming languages — C* (C17): §5.1.2.4 (Multi-threaded executions and data races), §6.7.3 (Type qualifiers), §7.13.2.1 (`setjmp`), §7.14.1.1 (`signal`), §7.17 (`<stdatomic.h>`).
- Linux kernel documentation: [*volatile considered harmful*](https://www.kernel.org/doc/Documentation/process/volatile-considered-harmful.rst) — Jonathan Corbet.
- Jonathan Corbet, [*C11 atomic variables and the kernel*](https://lwn.net/Articles/586838/), LWN, 2014.
- ARM Architecture Reference Manual for A-profile architectures (DDI 0487), *Memory Ordering* bölümü.
- ARM, *Cortex-A Series Programmer's Guide* (DEN 0013), [*Memory barriers*](https://developer.arm.com/documentation/den0013/0400/Memory-Ordering/Memory-barriers).
- cppreference: [`sig_atomic_t`](https://en.cppreference.com/w/c/program/sig_atomic_t), [`memory_order`](https://en.cppreference.com/w/c/atomic/memory_order), [`_Atomic`](https://en.cppreference.com/w/c/language/atomic).
- Hans-J. Boehm, *Threads cannot be implemented as a library*, PLDI 2005.
- Paul E. McKenney, *Is Parallel Programming Hard, And, If So, What Can You Do About It?* — bellek bariyerleri bölümü, ücretsiz PDF.
- Marc Brooker, [*C++11's atomic and volatile, under the hood on x86*](https://brooker.co.za/blog/2013/01/06/volatile.html).

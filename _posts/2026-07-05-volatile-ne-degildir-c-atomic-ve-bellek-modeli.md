---
layout: post
title: "`volatile` Ne Değildir: C11 `_Atomic` ve ARM Bellek Modeli"
subtitle: "What `volatile` Isn't: C11 Atomics and the ARM Memory Model"
background: "/img/posts/8.webp"
date: '2026-07-05 06:30:00'
lang: tr
mermaid: true
categories: [gomulu]
tags: [c, gomulu, eszamansizlik, arm]
---

Gömülü C dünyasında en çok yanlış anlaşılan anahtar sözcüklerden birini seçmek gerekseydi, listenin başında `volatile` olurdu. Kod incelemelerinde defalarca gördüm: bir kesme (ISR) ile ana görev arasında paylaşılan bir sayaç `volatile int` olarak işaretlenmiş, altına yorum düşülmüş — "*paylaşılan olduğu için `volatile`*." Yorumun ima ettiği şey açıktır: bu değişken artık güvenlidir, eşzamanlılık sorunu çözülmüştür. Halbuki C standardı `volatile`'a böyle bir söz vermez; hiçbir zaman vermedi. `volatile`, veriyi thread-safe yapmaz, atomik yapmaz, bellek erişimini başka gözlemcilere karşı sıralamaz. Yaptığı çok daha dar bir şeydir — ve yıllardır Türkçe kaynaklarda bu ayrım net biçimde çizilmemiştir.

Bu yazıda önce `volatile`'ın gerçekten ne olduğunu, sonra ne olmadığını inceleyeceğim. Sadece "yeterli değildir" demek yetmez; **hangi somut hata modlarına** yol açtığını ve ARM Cortex-M ile Cortex-A üzerinde neler olduğunu üretilen assembly üzerinden göstermek istiyorum. Ardından C11'in bize verdiği doğru araç olan `_Atomic` ve `memory_order_*` semantiğine geçeceğim. Yazının sonunda pratik bir karar ağacı ve emniyet-kritik kod bağlamında birkaç not var.

---

## Kısa bir tarihçe: `volatile` neden var?

`volatile` anahtar sözcüğü, C standardına 1989'da (ANSI C, sonradan C89/C90) girdi. K&R C'de yoktu. Motivasyonu tek başına bir problemdi: **derleyici, aslında değişiklik yaşayan bir bellek adresini "değişmiyor" varsayarak optimize etmesin.**

O günlerin en somut örnekleri şunlardı:

- **Memory-mapped I/O (MMIO):** Belirli bir adresteki 32-bit register, dış dünyaya bakan bir UART veya GPIO'nun durumunu yansıtır. Program aynı değeri iki kere okusa bile arada değer değişmiş olabilir; derleyici ikinci okumayı ilkinin sonucuyla değiştiremez.
- **Sinyal / kesme (ISR) tarafından değiştirilen değişkenler:** Ana akış bir bayrağı ("*komut geldi mi?*") sürekli sorguluyor; bayrağı ISR set ediyor. Derleyici bayrağın değişmediğini varsayıp döngüyü sonsuza kadar meşgul edecek şekilde optimize etmemeli.
- **`setjmp`/`longjmp` sınırında yaşayan otomatik değişkenler:** Uzun-atlama sonrası değeri tanımsız olmasın diye C standardı `volatile` gerektirir (C11 §7.13.2.1).

Standart bu yüzden `volatile`'ı şöyle tanımlar (C11 §6.7.3, "Type qualifiers"): *volatile-qualified* bir tip üzerinden yapılan her erişim, soyut makinenin (abstract machine) belirttiği tam biçimde gerçekleşmelidir; derleyici bu erişimleri elden çıkaramaz, birleştiremez, yerlerini değiştiremez — en azından birbirlerine ve dizisel yan etkilere (sequenced side effects) göre.

Bu çok net bir söz. Ama **çok dar bir sözdür.** Standart neyi kastettiği kadar neyi kastetmediğini de aynı yerde ima eder. Aynı bölümde şu geçer: "*What constitutes an access to an object that has volatile-qualified type is implementation-defined.*" Yani "bir erişimin ne demek olduğu" derleyici belgelerine bırakılmıştır. Standardın söz vermediği ise şunlar: atomiklik, çoklu yürütme birimi (CPU / thread) arasında sıralama, önbellek tutarlılığı, DMA/donanım gözlemcilerle senkronizasyon.

---

## `volatile` tam olarak neyi garanti eder?

Somut ifadeyle, `volatile` bir tek şeyi vaat eder: **derleyicinin nesneye yapılan erişimi kaynaktaki gibi bırakması.** Alt maddeleri açalım:

1. **Erişim silinemez.** `volatile int *reg` üzerinden `*reg` okumasını, sonucu kullanmıyor olsanız bile derleyici atmaz. Örnek: bazı ARM MMIO register'larında okumanın kendisi bir "clear-on-read" yan etkisi tetikler.
2. **Erişim birleştirilemez.** Peş peşe iki `*reg = x;` yazması tek yazmaya indirilemez.
3. **`volatile` erişimleri arasında program sırası korunur.** Aynı thread içinde, iki `volatile` erişimi yer değiştirmez. Bu, C11 §5.1.2.3'teki "sequenced before" ilişkisiyle güvence altına alınır.
4. **`volatile` olmayan erişimlerle sıralama garanti değildir.** Derleyici, `volatile` olmayan bir sıradan yazma işlemini `volatile` bir okumanın önüne veya arkasına serbestçe kaydırabilir. Standart bunu açıkça yasaklamaz.

Bu son madde en çok gözden kaçırılan yerdir. Örnekle:

```c
extern volatile uint32_t status_reg;
int data;

void isr_handler(void) {
    data = 42;                 // (A) volatile değil
    status_reg = READY_FLAG;   // (B) volatile
}
```

C standardı, (A)'nın (B)'den önce olacağını garanti eder mi? Aynı thread içinde, kaynak sırasına göre evet — çünkü (B) bir volatile yazması, (A) da bir yan etki, ve C soyut makinesi (A)'yı (B)'den önce sıralar. Derleyici (A)'yı (B)'den sonraya alamaz.

**Fakat başka bir gözlemci** (başka bir CPU çekirdeği, DMA denetleyicisi, dış donanım) için bu sıra garanti değildir. Çünkü:

- Derleyici düzeyinde sıra korunmuş olsa bile, **CPU** komutları farklı sırada tamamlayabilir (weakly-ordered mimarilerde).
- Yazma tamponu (write buffer), önbellek katmanları, bus fabric hepsi araya girer.
- `volatile`'ın bunlara söyleyecek bir sözü yoktur.

Bu, bir sonraki iddiaya götürür.

---

## `volatile` neyi garanti etmez?

Kısa liste:

- **Atomiklik.** `volatile long long x; x = y;` bir 32-bit platformda tek komut değildir; 64-bit değer iki 32-bit yazmaya bölünebilir. Bir kesme veya diğer CPU, yarım güncellenmiş değeri görebilir.
- **Read-modify-write bütünlüğü.** `volatile int counter; counter++;` bile tek adımlık değildir. Aşağıda göstereceğim.
- **Bellek sıralama (memory ordering) çok-thread/çok-çekirdek arası.** Yukarıda değindim; farklı gözlemciler için sıralama garanti edilmez.
- **Önbellek tutarlılığı.** Cortex-A'da DMA'nın yazdığı bir buffer'ı okumadan önce cache'i geçersizleştirmediyseniz, `volatile` sizi kurtarmaz.
- **Derleyici bariyeri (compiler barrier).** `volatile` erişimleri arasında sıra korunur ama bir `volatile` erişimi ile onun etrafındaki `volatile` olmayan erişimler serbestçe kaydırılabilir.

Linus Torvalds 2007'de kernel dokümanında bu noktayı özetlemiş: *"The key point to understand with regard to volatile is that its purpose is to suppress optimization, which is almost never what one really wants to do."* Kernel'de `volatile` yerine `READ_ONCE`/`WRITE_ONCE`, `smp_mb()` ve kilit primitifleri kullanılır.

---

## Somut hata modu: kesme ile ana görev arasında sayaç

Şu tipik gömülü kodu düşünün. Bir sistem tick ISR'ı bir sayaç artırıyor, ana görev de bir olay için sayacı bir aralıkta artırıyor. Yazan iki farklı bağlam, okuyan bir üçüncü modül olsun.

```c
volatile uint32_t event_count = 0;

/* Kesme bağlamı, ~1 kHz */
void tick_isr(void) {
    event_count++;             // (1)
}

/* Görev bağlamı */
void task_process_event(void) {
    /* … olay işleme … */
    event_count++;             // (2)
}
```

Yazar, `volatile` sayesinde işini bitirdiğini düşünür. Şimdi ARM Cortex-M4 için üretilen tipik assembly'ye bakalım (GCC `-O2`):

```text
; event_count++;   (Cortex-M4, GCC -O2)
LDR   r3, =event_count     ; r3 <- &event_count
LDR   r2, [r3]             ; r2 <- *r3
ADDS  r2, r2, #1           ; r2 <- r2 + 1
STR   r2, [r3]             ; *r3 <- r2
```

Üç ayrı bellek/register işlemi görüyorsunuz: **yükleme (load), değiştirme (modify), yazma (store).** Sayacın artışı **tek komut değildir.** Cortex-M4 sıralı yürütür, komutlar bölünmez ama komut *sıralarının arası* bölünebilir: LDR ile STR arasında görev bağlamındayken bir tick ISR ateşlenirse ne olur?

1. Görev: `event_count = 100`, `LDR r2, [r3]` → r2 = 100.
2. ISR ateşlenir; ISR de aynı diziyi yürütür: 100'ü okur, 101 yazar. Sayaç şimdi 101.
3. Görev geri döner. Elinde eski r2 = 100 var. `ADDS r2, r2, #1` → 101. `STR r2, [r3]` → sayaç 101.

Sonuç: iki artış yapıldı, sayaç bir arttı. `volatile` bunu **hiçbir şekilde** engellemez. Çünkü zaten böyle bir söz vermemişti; sadece "her LDR gerçekten yapılacak, her STR gerçekten yazılacak" dedi. Yani `volatile`, "atlama yok" derdi; "araya girme yok" demedi.

Bu senaryo bir aviyonik veya endüstriyel sistemde saatlerce yaşayabilir, hafif bir sapma olarak kalır; sonra ölçümlerden birinde sonucu tutmaz ve uzun bir hata avı başlar. `volatile`'a güvenmek burada tehlikelidir çünkü sinyal *doğru görünür*.

Aynı problem çok daha kaba biçimde 64-bit veri tipinde ortaya çıkar. Cortex-M üzerinde `volatile uint64_t timestamp;` bir yazımda iki STR üretir; bir okumada iki LDR. ISR araya girerse üst 32-bit yeni, alt 32-bit eski (veya tersi) bir değer okunabilir — hiçbir zaman gerçekten var olmayan bir zaman damgası. "Torn read" denen tuzağın tam kendisi.

---

## Ara özet: `volatile` neyi çözer, neyi çözmez?

Aşağıdaki tabloyu ekran ışığında yakınlaştırıp asın:

| Durum | `volatile` yeterli mi? | Not |
|---|---|---|
| MMIO register'ından okuma/yazma (tek CPU) | Evet, mecburi | Erişim ne birleştirilir ne atılır. |
| ISR'nin yazdığı, ana akışın döngüde beklediği bayrak (tek CPU) | Kısmen | Bayrak `sig_atomic_t` veya `_Atomic` boyutunda ise okuma **atomiktir**; ama karmaşık senaryolarda yetmez. |
| ISR + görev arasında paylaşılan sayaç, RMW | **Hayır** | Yukarıdaki torn artış. `_Atomic` veya kesme kilidi lazım. |
| 32-bit CPU'da 64-bit paylaşılan değer | **Hayır** | Torn read. `_Atomic uint64_t` veya kilit lazım. |
| Çok çekirdekli sistemde iki thread arasında bayrak + veri | **Hayır** | Bellek sıralama sözü verilmiyor. Bariyer/`_Atomic acquire-release` gerek. |
| DMA'nın doldurduğu buffer'ı CPU okuma (Cortex-A) | **Hayır** | Cache invalidate + memory barrier gerek. |
| `setjmp`/`longjmp` sonrası tekrar okunacak otomatik değişken | Evet, mecburi | C standardı bunu şart koşar. |

Kısa slogan: **`volatile` derleyiciye "beni optimize etme" der; CPU'ya, önbelleğe veya diğer bağlamlara hiçbir şey demez.**

---

## ARM'ın bellek modeli — Cortex-M ve Cortex-A ayrımı

`volatile`'ın ve `_Atomic`'in neye karşılık geldiğini anlamak için altta yatan mimariyi de bilmek gerekir. ARM ekosisteminde iki farklı dünya var:

### Cortex-M (ARMv6-M, ARMv7-M, ARMv8-M)

- Tek çekirdek (çoğu M sınıfı SoC'de), tek yürütme dizisi, komutlar programa göre sıralı emeklilik (in-order retire).
- Ancak *yazma tamponu (write buffer)* vardır: bir STR komutundan sonra veri henüz belleğe gitmemiş, tamponda bekliyor olabilir. Sonraki bir komut çalışırken, bir DMA veya çevresel donanım tamponu görmüyor olabilir.
- Bu yüzden Cortex-M'de bile, MMIO ile senkronize kritik anlarda (örn. DMA başlatmadan hemen önce bir konfigürasyon yazması yapıp DMA tetiklendikten sonra donanımın onu görmesini garantilemek) `DMB` (Data Memory Barrier) veya `DSB` (Data Synchronization Barrier) komutlarına ihtiyaç olur.
- Kesme sırası ile eşzamanlılık: Cortex-M'de kesme, bir komutun ortasında değil, komut sınırında girer. Yani `LDR r2, [r3]` bittikten sonra kesme girer; komutun kendisi bölünmez. Ama komut *aralarında* bölünebilir — RMW hâlâ atomik değil.

Cortex-M için basit kural: aynı çekirdek üzerinde farklı bağlamlar (ISR, görev) arasında paylaşılan veriler için sıralama zaten kaynak sırasıyla korunur, fakat **RMW atomikliği ayrı bir kaygıdır** ve `_Atomic` (veya kesme kilidi) gerektirir.

### Cortex-A / Cortex-R (ARMv7-A, ARMv8-A)

- Çok çekirdekli, çok yürütme birimli, **zayıf sıralanmış (weakly-ordered)** bellek modeli.
- CPU, farklı adreslere yönelik yükleme ve yazmaları donanımsal olarak yeniden sıralayabilir. Program sırası ≠ bellek sırası.
- Çekirdekler arası tutarlılık için "inner-shareable" ve "outer-shareable" ayrımları vardır; `DMB ISH`, `DMB ISHST`, `DMB ISHLD` gibi bariyerler farklı sıralama garantileri verir.
- ARMv8-A: `LDAR` (load-acquire) ve `STLR` (store-release) doğrudan komut olarak vardır; `LDXR`/`STXR` (exclusive load/store) ile RMW döngüsü kurulur. ARMv8.1-A LSE eklentileri (`LDADDAL` vb.) tek komutlu atomikler getirir.
- ARMv7-A: bariyerler `DMB ISH` biçiminde açıkça yazılır; `LDREX`/`STREX` ile RMW yapılır.

Peter Sewell'in Cambridge'deki kanonik "C/C++11 to processor mappings" tablosuna göre, `memory_order` sabitlerinin ARMv7-A ve AArch64'e haritalanışı şudur:

| İşlem | ARMv7-A | AArch64 |
|---|---|---|
| Load relaxed | `LDR` | `LDR` |
| Store relaxed | `STR` | `STR` |
| Load acquire | `LDR; DMB ISH` | `LDAR` |
| Store release | `DMB ISH; STR` | `STLR` |
| Load seq_cst | `LDR; DMB ISH` | `LDAR` |
| Store seq_cst | `DMB ISH; STR; DMB ISH` | `STLR` |
| seq_cst fence | `DMB ISH` | `DMB ISH` |

Bu tabloyu ezberlemenize gerek yok, ama iki şeyi hissederek çıkın:

1. **Doğru yazılmış `_Atomic` kodu, mimariyi bilen kişinin elle yazacağı asgari komut dizisidir.** Fazla bariyer atmaz — sadece semantiğin gerektirdiği kadarını atar.
2. **ARMv8-A'da doğrudan komut var**, ARMv7-A'da bariyer + sıradan yükleme/yazma vardır. Yani `_Atomic` kullanınca kod hangi mimaride derliyorsa oraya en verimli haritalanır.

---

## C11 `_Atomic` ve `<stdatomic.h>` neyi verir?

C11 (2011) ile birlikte C, gerçek bir eşzamanlılık modeliyle geldi. Standart §7.17'de `<stdatomic.h>` başlığı altında hem atomik tipleri (`atomic_int`, `atomic_uint_least32_t` gibi) hem de fonksiyonları tanımlar. Kilit fonksiyonlar:

- `atomic_load_explicit(obj, order)`
- `atomic_store_explicit(obj, value, order)`
- `atomic_fetch_add_explicit(obj, delta, order)`
- `atomic_compare_exchange_weak_explicit(obj, expected, desired, succ, fail)`

`order` parametresi `memory_order` enum'undan bir değerdir. Bu enum, verinin **atomik olması dışında** çevre erişimlerinin nasıl sıralanacağını da belirler.

### `memory_order` semantiği

Basitten sıkıya doğru:

- **`memory_order_relaxed`:** Sadece atomikliği garanti eder. Bellek sıralama sözü yoktur. Sayaç artırmak için (sadece son değer önemliyse) yeter.
- **`memory_order_acquire` (load için) / `memory_order_release` (store için):** Klasik "üretici-tüketici" senkronizasyonu. Bir thread `release` ile bayrak yazar; başka bir thread `acquire` ile bayrağı okur. `release`'ten *önceki* tüm yazımlar, `acquire`'dan *sonraki* okumalara görünür.
- **`memory_order_acq_rel`:** RMW operasyonlarında (`fetch_add` gibi) hem acquire hem release görevi görür.
- **`memory_order_seq_cst`:** Sıralı tutarlılık (sequential consistency). Tüm `seq_cst` işlemleri, tüm gözlemcilerce ortak bir toplam sıraya sahiptir. En güçlü ve en maliyetli garanti; varsayılan.

Not olarak, `memory_order_consume` da vardır fakat pratikte tüm derleyiciler onu `acquire`'a düşürür; sizin için işlemez.

### Klasik "bayrak + veri" örneği

`volatile` ile yazıldığında çok çekirdekli bir Cortex-A üzerinde arızalı olan aşağıdaki desen, `_Atomic` ile doğru biçimde şudur:

```c
#include <stdatomic.h>

static int payload;                       /* sıradan */
static atomic_int ready = 0;              /* atomik bayrak */

/* Üretici thread */
void producer(int v) {
    payload = v;                                          /* (A) */
    atomic_store_explicit(&ready, 1,
                          memory_order_release);          /* (B) */
}

/* Tüketici thread */
int consumer(void) {
    while (atomic_load_explicit(&ready,
                                memory_order_acquire) == 0) {
        /* bekle */
    }
    return payload;                                       /* (C) */
}
```

Buradaki söz şudur: (B)'nin release'i, (A)'nın (B)'den önce olduğunu; (C)'nin acquire'ı, (C)'nin (B)'den sonra olduğunu garanti eder. Sonuç: **tüketici `payload`'ı 100% doğru okur.** `volatile` bunu vaat etmezdi.

ARMv8-A'da bu, tam olarak `LDAR`/`STLR` çifti üretir. Ne bir eksik ne bir fazla bariyer — donanımın verdiği en ucuz doğru dizidir.

---

## Assembly düzeyinde karşılaştırma: `volatile int++` vs `atomic_fetch_add`

Somut olarak Cortex-M4 (ARMv7-M) için GCC `-O2` çıktısı:

```text
; ------- volatile int counter; counter++;
LDR   r3, =counter
LDR   r2, [r3]
ADDS  r2, r2, #1
STR   r2, [r3]

; ------- atomic_fetch_add_explicit(&counter, 1, memory_order_relaxed);
LDR   r3, =counter
1:
LDREX r2, [r3]        ; monitör kur, yükle
ADDS  r2, r2, #1
STREX r1, r2, [r3]    ; başarılıysa r1=0, değilse 1
CBNZ  r1, 1b          ; başarısızsa döngüye dön

; ------- atomic_fetch_add_explicit(&counter, 1, memory_order_seq_cst);
LDR   r3, =counter
DMB   ISH
1:
LDREX r2, [r3]
ADDS  r2, r2, #1
STREX r1, r2, [r3]
CBNZ  r1, 1b
DMB   ISH
```

Bu diziler ARMv7-M ve üstünde (Cortex-M3/M4/M7) geçerlidir; ARMv6-M olan Cortex-M0/M0+'da `LDREX`/`STREX` yoktur. M0'da derleyici `_Atomic` bir sayaç artışını genellikle kesme kilitleme (PRIMASK) etrafında sıradan LDR/STR olarak üretir.

İki gözlem:

1. **RMW atomiklik farkı görsel.** `_Atomic` sürüm `LDREX`/`STREX` çifti kullanır. `STREX`, `LDREX`'ten sonra bir başkasının aynı bölgeye yazması durumunda başarısız olur; kod döngüye girer, yeniden dener. Sayı **kaybolmaz.**
2. **Bariyer maliyeti seçilebilir.** `relaxed` sürümü ekstra `DMB` atmaz. Yani sadece atomiklik yeterse ekstra maliyet ödemezsiniz.

AArch64'te aynı işlem çok daha kısa olur. ARMv8.1-A LSE eklentileri varsa `LDADDAL x1, x2, [x3]` gibi tek bir atomik komut üretilir. Yoksa `LDXR`/`STXR` döngüsüne düşer.

Buradaki dersin özeti: `volatile` size RMW döngüsünü **veremez**, çünkü söz konusu değil. `_Atomic` size doğru donanım komutlarını verir — hangi mimaride çalışıyorsanız oraya en uygun olanı.

---

## Diyagram: Karar akışı

`volatile` mi, `_Atomic` mi, ikisi birden mi, hiçbiri mi?

<div class="mermaid">
flowchart TD
    A[Paylaşılan bir değişkeniniz var] --> B{Değer donanıma ait, MMIO register mı?}
    B -->|Evet| C[volatile şart. Erişim silinemesin, birleştirilmesin.]
    C --> C2{Farklı bağlamdan da erişilecek mi?}
    C2 -->|Hayır| D[volatile yeterli.]
    C2 -->|Evet, ISR veya thread| E[volatile + _Atomic veya kesme kilidi]
    B -->|Hayır| F{Yazan/okuyan tek bağlam mı?}
    F -->|Evet| G[Ne volatile ne _Atomic gerek. Sıradan değişken.]
    F -->|Hayır, birden fazla bağlam| H{Tek CPU + kesme mi, çoklu çekirdek mi?}
    H -->|Tek CPU + kesme| I{Sadece atomik okuma/yazma mı, RMW var mı?}
    I -->|Basit oku/yaz, sig_atomic_t boyutunda| J[volatile sig_atomic_t yeterli olabilir. Yine de _Atomic önerilir.]
    I -->|RMW ya da 64-bit| K[_Atomic + relaxed veya acq_rel]
    H -->|Çoklu çekirdek| L[_Atomic + acquire/release veya seq_cst. volatile gerekmez.]
</div>

Yalın haliyle özet:

- **`volatile`** = "donanım burada" işareti. MMIO, sinyal handler-otomatik değişkeni, `setjmp` senaryosu.
- **`_Atomic`** = "başka gözlemci var" işareti. ISR ile görev, iki thread, iki çekirdek.
- **İkisi birden** = "hem donanım hem başka bağlam." Örneğin bir DMA tarafından yazılan ve başka bir çekirdek tarafından okunan konfigürasyon register'ı için `_Atomic volatile` (C11 §6.7.3'te açıkça izinli).

Yaygın yanılgının aksine `volatile` ile `_Atomic` birbirinin alternatifi değil, farklı problem alanlarının işaretleridir.

---

## Emniyet-kritik bağlamda birkaç not

Aviyonik yazılım (DO-178C DAL A/B) veya benzeri emniyet-kritik alanlarda bu konu ekstra bir katmandan geçer.

### MISRA C ve `volatile`

MISRA C:2012 ve C:2025, `volatile` konusunda oldukça temkinlidir. Kural 11.8, `const` veya `volatile` niteleyicilerinin cast'lerle kaldırılmasını yasaklar; Kural 2.2, `volatile` erişimlerinin "ölü kod" sayılmayacağını belirtir. Ama MISRA'nın hiçbir yerinde "eşzamanlılık için `volatile` kullanın" denmez. Aslında MISRA C, çoklu-thread eşzamanlılığı büyük ölçüde kapsam dışı bırakır; çünkü bunun için C11 bellek modeline uygun ayrı bir kanıt zinciri gerekir.

### DO-178C ve `_Atomic`

DO-178C'nin kendisi programlama dili özelliği düzeyinde bir söz söylemez; onun ilgilendiği kod ile gereksinim/tasarım arasında izlenebilirlik ve doğrulamadır. Ama DAL A/B seviyesinde:

- Kod analiz aracınız (Polyspace, Frama-C, Astrée) C11 `_Atomic`'i doğru işleyebilmelidir. Eski bazı statik analizörler `_Atomic`'i tam desteklemez; sürüm ve konfigürasyon önemli.
- Derleyici doğrulaması (compiler qualification) gerektiği durumlarda, kullandığınız `__atomic_*` builtin'lerinin veya `<stdatomic.h>` fonksiyonlarının derleyici tarafından belgelenen davranışını okumak zorundasınız. Örneğin GCC bunları `Reference Manual > Atomic Builtins` bölümünde açıkça belgeler.
- Kesme kilidi ile RMW koruma (Cortex-M'de bir alternatif) daha kolay doğrulanabilir olsa da uzun ISR yolları veya iç içe kesmelerde tuzağa dönüşür. `_Atomic`, uygun mimari desteğinde daha yerel bir çözümdür.

Kısa özet: `_Atomic` kullanımı emniyet-kritik projede yasak değildir ama araç zincirinizin bunu **doğrulanabilir biçimde** desteklediğini teyit etmeniz gerekir. Sık gördüğüm pratik desen, kritik yerlerde `_Atomic` yerine iyi belgelenmiş bir `enter_critical()`/`exit_critical()` çifti (kesme kilitleme) tercih etmek — özellikle DAL A projelerinde araç kalifikasyon yükünü azaltmak için.

---

## Yaygın yanılgılar — kısa turlar

**"Zaten `volatile` yaptım, thread-safe."** Hayır. `volatile` derleyici optimizasyonunu kısıtlar, senkronizasyon üretmez.

**"Cortex-M sıralı yürütür, o zaman `volatile` `_Atomic` gibi çalışır."** Yürütme sıralı, ama RMW üç komuttur ve komutlar arasına kesme girebilir. `_Atomic` (LDREX/STREX döngüsü) veya kesme kilidi olmadan artış kaybolabilir.

**"`_Atomic` yavaştır."** `memory_order_relaxed` seçilirse Cortex-M'de LDREX/STREX döngüsü, sıradan LDR/STR'den yaklaşık iki kat maliyet ekler. `seq_cst` seçilirse ARMv8-A'da bir LDAR/STLR çiftidir — bariyer maliyeti yoktur. "Yavaş" damgası genellikle `seq_cst`'i her yere serpen kodlardan gelir; siz semantik neyi istiyorsa onu seçebilirsiniz.

**"Sadece `volatile` yazayım, GCC olayı çözer."** GCC bir C derleyicisidir; C standardının söylemediğini söyleyemez. GCC'nin `__sync_*` (eski, artık önerilmez) ve `__atomic_*` builtin'leri vardır ama onlar zaten `<stdatomic.h>`'in ürünü.

**"DMA buffer'ını `volatile` yaparım, sorun yok."** Cortex-A üzerinde DMA CPU önbelleğini bilmez. Buffer'ı okumadan önce cache invalidate etmeli, yazdıktan sonra clean etmelisiniz. `volatile` cache tutarlılığına dokunmaz.

**"`_Atomic uint64_t` her platformda atomiktir."** Standardın söz verdiği şey `atomic_is_lock_free(&x)` `true` dönerse atomiktir; dönmezse derleyici sizin için kilit üretir (typedef'te belirsizdir). Cortex-M0'da 64-bit atomik lock-free değildir; kilit tabanlı olur. Gömülü kritik yolda bunu ölçmek gerekir.

---

## Sonuç

`volatile`, C dilinin sunduğu en dar niteleyicilerden biridir: yalnızca **derleyici erişim optimizasyonunu kısıtlar.** Onun ötesinde hiçbir söz vermez — atomiklik, çok-thread bellek sıralaması, önbellek tutarlılığı, RMW bütünlüğü. Yıllardır süregelen "`volatile` = thread-safe" yanılgısı, gerçek gömülü sistemlerde sessizce yaşayan yarış koşullarının kaynağıdır. Çözüm C11 `_Atomic` ve `memory_order_*` semantiğidir; bunlar derleyiciye hem atomikliği hem de sıralamayı açıkça ifade etmenin yolunu verir, ardından ARM'ın hangi çeşidinde derliyorsak oraya uygun asgari komut dizisi üretilir.

Pratik özet:

- MMIO ve donanım register'ları için: **`volatile` zorunlu.**
- Bağlamlar arası paylaşım (ISR, thread, çekirdek) için: **`_Atomic` + doğru `memory_order`.**
- İkisinin birden gerektiği (donanım register + başka gözlemci) senaryolar var; `_Atomic volatile` kombinasyonu C11'in resmi çözümüdür.
- Emniyet-kritik alanlarda `_Atomic` kullanmak yasak değildir, fakat araç zincirinizin desteklediğini teyit etmeniz gerekir; alternatif olarak açıkça belgelenmiş bir kesme-kilidi deseni tercih edilebilir.

Bir sonraki kod incelemenizde `volatile int flag; flag++;` gördüğünüzde ilk sorunuz şu olsun: *"Bunun okuyucusu/yazıcısı hangi bağlamlarda? RMW var mı? Var ise `_Atomic` mi gerek, kesme kilidi mi?"* — cevabı yorumdaki "*paylaşılan olduğu için `volatile`*" cümlesi olmasın.

---

## Kaynaklar

- ISO/IEC 9899:2018, "*Information technology — Programming languages — C*" (C17; C11'e denk), §6.7.3 Type qualifiers, §7.17 Atomics.
- Linux Kernel Documentation, "*Why the 'volatile' type class should not be used*": <https://www.kernel.org/doc/html/latest/process/volatile-considered-harmful.html>
- cppreference — `volatile` (C): <https://en.cppreference.com/w/c/language/volatile>
- cppreference — `memory_order` (C): <https://en.cppreference.com/c/atomic/memory_order>
- Peter Sewell et al., "*C/C++11 mappings to processors*", University of Cambridge: <https://www.cl.cam.ac.uk/~pes20/cpp/cpp0xmappings.html>
- LLVM, "*Atomics and Concurrency*": <https://llvm.org/docs/Atomics.html>
- GCC, "*`__atomic` Builtins*": <https://gcc.gnu.org/onlinedocs/gcc/_005f_005fatomic-Builtins.html>
- Arm Learning Paths, "*The C++ Memory Model and Atomics*": <https://learn.arm.com/learning-paths/servers-and-cloud-computing/arm-cpp-memory-model/>
- Arm, "*Learn the Architecture — Memory Systems, Ordering, and Barriers*": <https://developer.arm.com/documentation/102336/latest/>
- MISRA C:2025 Guidelines (`volatile` ile ilgili Directive/Rule referansları için resmi doküman).

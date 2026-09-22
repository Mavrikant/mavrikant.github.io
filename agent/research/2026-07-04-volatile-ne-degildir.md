# Araştırma notu — `volatile` ne değildir

## Ana iddia

`volatile`, gömülü C dünyasında en çok yanlış anlaşılan anahtar sözcüklerden biri.
Genellikle "bu değişkeni thread-safe yap" anlamında kullanılır — oysa C standardı
`volatile`'a **atomiklik veya çoklu-thread sıralama** anlamında hiçbir söz vermez.
Bu boşluk, gerçek gömülü sistemlerde sessizce yaşayan yarış koşullarının kaynağıdır.

## Doğrulanmış olgular

### C standardı — `volatile`

- ISO/IEC 9899:2011 (C11), §6.7.3: `volatile`, bir nesneye erişimin "abstract
  machine" kurallarına göre tam olarak gerçekleşmesini gerektirir; erişim
  optimizasyona/kayıt tutmaya (register caching) izin vermez.
- Standart `volatile`'a atomiklik veya çok-thread bellek sıralaması vermez.
- C11 §5.1.2.3'te "sequence points" yoluyla program içi sıralama garanti edilir,
  ama bu program-içidir; başka gözlemciler için değil.

### C11 `_Atomic` ve `<stdatomic.h>`

- C11 §7.17: `atomic_*` tipleri ve `atomic_load_explicit`, `atomic_store_explicit`,
  `atomic_fetch_add_explicit` gibi fonksiyonlar.
- `memory_order` sabitleri: `relaxed`, `consume`, `acquire`, `release`, `acq_rel`,
  `seq_cst`. Varsayılan `seq_cst`.
- `_Atomic` hem atomikliği hem de bellek sıralama semantiğini garanti eder.

### Linus Torvalds — `volatile-considered-harmful`

Kaynak: <https://www.kernel.org/doc/html/latest/process/volatile-considered-harmful.html>

- "The key point to understand with regard to volatile is that its purpose is to
  suppress optimization, which is almost never what one really wants to do."
- Kernel'de `volatile` yerine kilit primitifleri (spinlock, `READ_ONCE`,
  `WRITE_ONCE`, `smp_mb()`) kullanılır.

### ARM bellek modeli

- Cortex-M (ARMv6-M, ARMv7-M, ARMv8-M): tek-CPU, sıralı yürütme. Ancak yazma
  tamponu (write buffer) ve MMIO'da erişim sıralaması için `DMB`/`DSB`/`ISB`
  gerekebilir.
- Cortex-A/R (ARMv7-A, ARMv8-A): **weakly-ordered** bellek modeli. Yükleme ve
  yazmalar donanım tarafından yeniden sıralanabilir.
- ARMv8-A LDAR/STLR: load-acquire / store-release doğrudan komutlar.
- ARMv7-A: `LDR; DMB ISH` (load-acquire), `DMB ISH; STR` (store-release).
- Read-modify-write (RMW) atomikliği: ARM'da `LDREX`/`STREX` (ARMv7), `LDXR`/`STXR`
  (ARMv8) veya doğrudan LSE atomik komutları (ARMv8.1-A).

Kaynak: Peter Sewell, "C/C++11 mappings to processors"
<https://www.cl.cam.ac.uk/~pes20/cpp/cpp0xmappings.html>

### GCC codegen

- Basit `volatile` `int x++`: `LDR / ADD / STR` — üç ayrı komut, kesintiyle
  bölünebilir; atomik değil.
- `atomic_fetch_add(&x, 1, memory_order_seq_cst)` ARMv7'de tipik olarak
  `LDREX / ADD / STREX / CBNZ (retry) + DMB` üretir; ARMv8'de LSE ile `LDADDAL`
  tek komut.

Kaynak: GCC `__atomic` Builtins
<https://gcc.gnu.org/onlinedocs/gcc/_005f_005fatomic-Builtins.html>

## Derinlik öğesi (Bölüm 7)

Bu yazının somut derinlik öğesi ikiye katlanır:

1. **Assembly incelemesi**: Aynı sayaç artırımının `volatile int` ve
   `_Atomic int` ile ARM Cortex-M4 ve Cortex-A72 için üretilen kodunu
   Compiler Explorer benzeri komutlarla göster.
2. **Hata modu yeniden üretimi**: Kesme-görev arasında paylaşılan sayacın
   `volatile` ile "korunmuş" gibi görünmesi ama gerçekte read-modify-write
   yarışıyla sayı kaybetmesi — pseudo-kod ile.

## Novelty gerekçesi

Türkçe kaynaklarda "volatile derleyici optimizasyonunu önler" seviyesinde
yüzeysel açıklamalar mevcut, fakat:

- C11 bellek modeli Türkçe olarak neredeyse hiç açıklanmamış.
- ARM'ın weakly-ordered bellek modeli ile C `volatile` arasındaki ayrım
  Türkçe teknik yazında görülmüyor.
- `_Atomic` ve `memory_order_*` semantiği çok az işlenmiş.
- Konu gömülü mühendisliği + derleyici + eşzamanlılık + ARM mimarisi
  kesişiminde; dört disiplinin biri eksik olduğunda anlatım kırılıyor.

## Kaynaklar (yazıda kullanılacak)

1. ISO/IEC 9899:2011 (C11), §6.7.3 (Type qualifiers), §7.17 (Atomics)
2. Linux kernel: <https://www.kernel.org/doc/html/latest/process/volatile-considered-harmful.html>
3. cppreference — memory_order: <https://en.cppreference.com/c/atomic/memory_order>
4. cppreference — volatile: <https://en.cppreference.com/w/c/language/volatile>
5. Peter Sewell, "C/C++11 mappings to processors":
   <https://www.cl.cam.ac.uk/~pes20/cpp/cpp0xmappings.html>
6. LLVM Atomics: <https://llvm.org/docs/Atomics.html>
7. GCC `__atomic` Builtins:
   <https://gcc.gnu.org/onlinedocs/gcc/_005f_005fatomic-Builtins.html>
8. Arm — Learn: The C++ Memory Model and Atomics:
   <https://learn.arm.com/learning-paths/servers-and-cloud-computing/arm-cpp-memory-model/>
9. Herb Sutter — "atomic<> Weapons" (CppCon 2012, iki bölüm — genel referans)

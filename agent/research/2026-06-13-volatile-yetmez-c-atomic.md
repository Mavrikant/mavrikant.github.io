# Araştırma notları — volatile yetmez

## Doğrulanmış olgular

- **C11 §7.14.1.1 ¶5:** Sinyal işleyici, statik veya thread storage duration'a
  sahip bir nesneye yalnızca `volatile sig_atomic_t` üzerinden veya lock-free
  atomic ile dokunabilir; aksi hâlde UB.
- **C11 §5.1.2.4 + §7.17:** `_Atomic` ve `<stdatomic.h>`; varsayılan bellek
  sırası `memory_order_seq_cst`.
- **Linux kernel — Documentation/process/volatile-considered-harmful.rst:**
  Jonathan Corbet (2007 civarı). Kabul edilen 4 istisna:
  1. I/O accessor fonksiyonları (mimari-bağımlı)
  2. Inline assembly içinde compiler'ın kodu silmesini engellemek
  3. `jiffies` (legacy)
  4. Donanımın değiştirdiği coherent memory pointer'ları (NIC ring buffer)
  Ana argüman: "volatile yalnızca optimizasyonu kapatır; eşzamanlılık
  güvencesi sağlamaz; gerçek bir senkronizasyon ihtiyacı varsa kilit veya
  bellek bariyeri istersin."
- **ARM mimari:** DMB (Data Memory Barrier) shareability domain içindeki
  bellek erişim sırasını zorlar; DSB ek olarak instruction stream'i de
  senkronize eder; ISB instruction pipeline'ı temizler.
- **`_Atomic` derleyici davranışı:** seq_cst default; ARMv7-A/v8-A'da
  `__atomic_load_n` / `__atomic_store_n` çağrıları DMB ISH üretir
  (gcc/clang godbolt teyit edilmeli, ama standart davranış).
- **`volatile` üç gerçek görev:** MMIO, `setjmp/longjmp`'la korunan
  yerel değişkenler (C11 §7.13.2.1), `sig_atomic_t` ile sinyal işleyici.

## Derinlik öğesi (Bölüm 7)

Bellek/assembly incelemesi: ARM Cortex-A53 için gcc -O2 ile derlenmiş bir
örnek üzerinden `volatile int` ile `_Atomic int` arasındaki çıktı farkını
göstermek (DMB ISH varlığı, yokluğu).

## Kaynaklar (yazıda kullanılacak)

- ISO/IEC 9899:2018 (C17) — §5.1.2.4, §7.14, §7.17
- Linux kernel: volatile-considered-harmful.rst
- LWN — Jonathan Corbet, "C11 atomic variables and the kernel"
- ARM ARM (DDI0487) — Memory Ordering bölümü
- ARM Cortex-A Programmer's Guide DEN0013 — Memory Barriers
- cppreference: `sig_atomic_t`, `_Atomic`, memory_order
- "What every systems programmer should know about concurrency" — Matt Kline
- Hans Boehm — "Threads cannot be implemented as a library" (PLDI 2005)

# Araştırma: `volatile` Yetmediğinde — C11 `_Atomic` ve Bellek Bariyerleri

## Doğrulanmış olgular

- **C11** (ISO/IEC 9899:2011) `<stdatomic.h>` başlığını ve `_Atomic` tür belirteci
  (type specifier) / tür niteleyicisini (type qualifier) ekledi. C18 (ISO/IEC
  9899:2018) ve C23 (ISO/IEC 9899:2024) bunu sürdürdü.
- C11'in tanımladığı memory order değerleri: `memory_order_relaxed`,
  `memory_order_consume`, `memory_order_acquire`, `memory_order_release`,
  `memory_order_acq_rel`, `memory_order_seq_cst`. Varsayılan (non-`_explicit`)
  fonksiyonlar `seq_cst` kullanır.
- `volatile`'ın C standardındaki amacı: derleyicinin değişkene yapılan erişimleri
  optimize etmesini engellemek (yani "abstract machine"in görmediği yan etkiler için
  görünür hale getirmek). Atomicity, ordering veya inter-thread visibility garantisi
  **vermez**.
- ARM mimari ailesi:
  - **ARMv6-M** (Cortex-M0, M0+, M1): LDREX/STREX **yok**. Atomicity için
    `PRIMASK` ile `CPSID i` / `CPSIE i` (kesme maskeleme).
  - **ARMv7-M** (Cortex-M3, M4, M7): LDREX/STREX/CLREX, DMB/DSB/ISB var.
  - **ARMv8-M Baseline** (Cortex-M23): LDREX/STREX **yok**.
  - **ARMv8-M Mainline** (Cortex-M33, M55, M85): LDREX/STREX var; ayrıca load-acquire
    / store-release seçenekleri.
  - **ARMv7-A / ARMv8-A** (Cortex-A): zayıf bellek modeli; çok çekirdek; LDAR/STLR
    (acquire/release) ARMv8'de.
- Single-core Cortex-M üzerinde aynı çekirdek üzerinde çalışan thread + ISR için
  cache coherency veya inter-CPU ordering sorunu yok; tek dert RMW atomicity ve
  derleyici reordering. DMB gerekmez (yalnızca core local).
- Multi-core sistemlerde (dual M7, M4+M0+, Cortex-A SMP) DMB ve cache invalidation
  zorunlu.
- GCC `<stdatomic.h>` arm-none-eabi'de: ARMv7-M+ için inline LDREX/STREX üretir;
  ARMv6-M için libatomic'e fallback ve oradan IRQ disable.

## Linus Torvalds — `volatile` zararlıdır

Kaynak: linux/Documentation/process/volatile-considered-harmful.rst.
Özet: `volatile` optimizasyonu bastırır, eşzamanlılığı korumaz; doğru araç kilit veya
atomik tiptir.

## SEI CERT CON02-C

"Do not use volatile as a synchronization primitive." Resmî CERT C kuralı.

## Açık örnek failure modu

```c
volatile uint32_t counter;          // ISR ve main loop artırıyor
counter++;                          // 3 talimat: LDR, ADD, STR
                                    // Araya kesme girerse artış kaybolur
```

## Kullanılacak derinlik öğesi

**Assembly inspection.** `arm-none-eabi-gcc -Os -mcpu=cortex-m4` ile aynı
operasyonun `volatile uint32_t` ve `atomic_uint` versiyonları derlenir; üretilen kod
karşılaştırılır. LDREX/STREX döngüsünün ortaya çıkışı somut olarak gösterilir.

## Yapı

1. Açılış: gerçek bir kaybolan-artırım hikâyesi (counter race).
2. `volatile`'ın C standardı tanımı (yan etki/abstract machine).
3. `volatile`'ın YAPMADIĞI üç şey.
4. Cortex-M4 üzerinde assembly karşılaştırması.
5. Memory ordering: derleyici + CPU reordering.
6. C11 `<stdatomic.h>` çözümü ve memory order pratiği.
7. Single-core (Cortex-M) vs multi-core farkı; DMB ne zaman?
8. Cortex-M0/M23 ve `_Atomic` tuzağı (libatomic fallback).
9. Pratik karar matrisi.
10. Tuzaklar (RMW maliyeti, `_Atomic` struct, padding).
11. Sonuç + Kaynaklar.

## Kaynaklar listesi (gerçek)

- Linux kernel: volatile-considered-harmful.rst
- SEI CERT CON02-C
- cppreference: <stdatomic.h>
- Embedded.com: "C keywords: Don't flame out over volatile" — Jack Ganssle
- ARM Architecture Reference Manual ARMv7-M (DDI 0403E)
- ARM Architecture Reference Manual ARMv6-M (DDI 0419C)
- ISO/IEC 9899:2011 §6.7.3 (volatile), §7.17 (stdatomic.h)
- Hans-J. Boehm, "Threads cannot be implemented as a library" (PLDI 2005)

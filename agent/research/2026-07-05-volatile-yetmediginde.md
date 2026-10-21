# Araştırma Notları — volatile Yetmediğinde

## Ana Kaynaklar

- **Hans Boehm, "Threads Cannot be Implemented as a Library"** (PLDI 2005) — https://dl.acm.org/doi/10.1145/1065010.1065042 — volatile'in çok iş parçacıklı programlamada neden yetersiz kaldığının klasik makalesi. C++11/C11 bellek modelinin kökeni.
- **SEI CERT C, CON02-C** "Do not use volatile as a synchronization primitive" — https://wiki.sei.cmu.edu/confluence/display/c/CON02-C.+Do+not+use+volatile+as+a+synchronization+primitive
- **SEI CERT C, DCL22-C** "Use volatile for data that cannot be cached" — https://wiki.sei.cmu.edu/confluence/display/c/DCL22-C.+Use+volatile+for+data+that+cannot+be+cached
- **LWN, "C11 atomic variables and the kernel"** (2014) — https://lwn.net/Articles/586838/
- **LWN, "Time to move to C11 atomics?"** (2016) — https://lwn.net/Articles/691128/
- **ARM Cortex-A Series Programmer's Guide (den0013)**, Memory Ordering / Memory Barriers — https://developer.arm.com/documentation/den0013/0400/Memory-Ordering/Memory-barriers
- **ARM DMB/DSB/ISB reference** — https://developer.arm.com/documentation/dui0489/e/arm-and-thumb-instructions/miscellaneous-instructions/dmb--dsb--and-isb
- **MISRA C:2025** — kural değişiklikleri MISRA C:2023 üzerinden geldi; concurrency ve `_Atomic` kuralları C11 ile uyumlu (MISRA C 2012 AMD4 evrildi).

## Ana İddialar (doğrulanmış)

1. **volatile'in gerçek üç garantisi:** (a) register'a cache'lenmez, (b) hard-code sabit değerle değiştirilmez, (c) aynı volatile'a yapılan erişimler birbirine göre yeniden sıralanmaz. **Vermediği garantiler:** atomiklik, diğer bellek erişimlerine göre sıralama, cache coherence, inter-thread visibility.
2. **Boehm 2005:** C89/pthreads modelinde derleyicinin data race yaratabildiğini gösterir. C11 memory model bu problemi çözmek için tasarlandı.
3. **Torvalds/McKenney tartışması (LWN 2014):** Linux çekirdeği kendi memory model'ini kullanır çünkü C11'in acquire/release semantiği ile kernel'in stricter load/store barrier semantiği tam örtüşmez. Kullanıcı-alan geliştiriciler için tavsiye: C11 atomik'lerini kullan.
4. **ARM DMB vs DSB:** DMB explicit memory access'lerin sıralamasını garanti eder ama bekleyerek durdurmaz; DSB ise bariyerdeki tüm erişimler tamamlanana kadar durdurur. DMA senkronizasyonunda DSB gerekir çünkü cache maintenance'ın DMA'dan önce bitmiş olması şarttır.
5. **CERT CON02-C:** volatile'in yeniden sıralamaya karşı garantisi yalnızca *aynı* volatile'a yapılan erişimler arasındadır. Farklı bellek konumları (volatile olsun olmasın) arasında derleyicinin yeniden sıralama yetkisi vardır.

## Somut Örnekler (yazıya girecek)

- **Kesme paylaşımlı 8-bit flag:** volatile sig_atomic_t doğru kullanım.
- **64-bit sayaç Cortex-M üzerinde:** iki 32-bit LDR/STR, kesme araya girerse yırtılır (torn read/write).
- **Compiler reordering:** `flag = 1; data = 42;` — volatile flag, non-volatile data. Derleyici sıraları değiştirebilir; assembly çıktısı gösterilecek.
- **DMA + cache:** producer CPU writeback cache'de, DMA eskiyi okur. volatile yardım etmez; `dcache_clean` gerekir.
- **Multicore:** ARM Cortex-A üzerinde volatile flag ile veri paylaşımı — CPU-level reordering, DMB gerekli.

## Derinlik Öğesi (Bölüm 7)

**Assembly-level analiz + zamanlama analizi** — GCC ARM çıktısıyla:
1. `volatile uint32_t x;` — LDR/STR emitleri
2. `_Atomic uint32_t x;` (memory_order_seq_cst) — LDR/STR + DMB
3. `_Atomic uint32_t x;` (memory_order_relaxed) — sadece LDR/STR (ama register cache'lenmez)

## Novelty (Bölüm 8)

Türkçe içerikte "volatile ne yapar" seviyesinde blog yazıları var (yüzeysel: "değişkenin
değişebileceğini derleyiciye söyler"). Ama derinlemesine "neden yetmez, ne zaman
_Atomic, ne zaman barrier, ne zaman cache maintenance" ayrımı yapan, ARM assembly
gösteren Türkçe içerik pratikte yok. İngilizce'de bile dağınık: bir kısmı Boehm
makalesinde, bir kısmı CERT'te, bir kısmı ARM manual'inde, bir kısmı LWN'de. Sentez
boşluğu büyük. Ayrıca konu **saha gerçeği:** senior gömülü mühendisler bile "volatile
yeter" varsayımıyla üretime bug bırakıyor.

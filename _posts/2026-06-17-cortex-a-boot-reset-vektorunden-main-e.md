---
title: "Cortex-A Boot: Reset Vektöründen `main()`'e Gerçekten Ne Oluyor?"
subtitle: "From the Reset Vector to main(): The Cortex-A Boot Sequence"
background: "/img/posts/4.webp"
date: '2026-06-17 09:00:00'
layout: post
lang: tr
mermaid: true
categories: [gomulu]
tags: [arm, cortex-a, gomulu-sistemler, zynq, boot]
---

Cortex-M tarafından gelen bir geliştirici Cortex-A'ya ilk geçtiğinde tuhaf bir boşlukla karşılaşır. Cortex-M'de vektör tablosu Flash'ın başında durur; ilk girdi başlangıç stack pointer'ıdır, ikincisi reset handler'dır, gerisini NVIC ve donanım halleder. Reset'ten `main()`'e giden yol birkaç komutla biter. Cortex-A'da öyle değil. Vektör tablosunda *adres yok*, **dallanma talimatı** var. NVIC yok. Otomatik stack frame yok. MMU başlangıçta kapalı, cache çöp dolu, FPU erişimi tuzaklı, exception modlarının her birinin ayrı stack pointer'ı var ve sen daha `main()`'i yazmadan önce hepsini elinle kurmak zorundasın.

Bu yazıda, ARM Cortex-A9 üzerinde (somut örnek olarak Zynq-7000) reset sinyalinin ayağa kalktığı andan `main()` fonksiyonunun ilk satırının yürüdüğü ana kadar geçen yolu adım adım izleyeceğiz. Xilinx'in açık kaynak `boot.S` dosyasını referans alacağız, her registeri ARM Mimari Referans Kılavuzu'nun (ARM ARM) hangi bölümünden geldiğini söyleyeceğiz, ve sonunda Renode üzerinde simüle edilmiş bir Cortex-A9'da bu adımları gözlemleyeceğiz. Bu yazının daha önceki "Renode ile Zynq7000 Simülasyonu" yazısının doğal devamı olduğunu söylemekte fayda var; orada simülatörü kurduk, burada simülatörün üzerinde dönen kodu mikroskop altına koyuyoruz.

---

## Neden Önemli?

Boot kodu hayatınızda iki kez ilginizi çeker: ilki, BSP'nin sessiz sedasız işlediği günlerde dipnot olarak; ikincisi, bir gün `main()`'e bile ulaşamayan bir tahta ile dakikalarca uğraştığınızda. İkinci durumda dipnot artık dipnot değildir, *sahnenin tam ortasıdır*. Bir DAL A projesinde "rastgele undefined instruction" diye bildirilen bir hatanın izi, çoğu zaman, boot.S'in 40. satırına kadar uzanır.

Cortex-A boot kodu emniyet kritik sertifikasyon altında ayrıca dikkat çeker. DO-178C bağlamında boot kodu uygulamanın bir parçasıdır; kapsama (coverage) ve gereksinim izlenebilirliği için her satırı yazılım emniyet sürecine dahil olmak zorundadır. Vendor tarafından gelen BSP'leri "kara kutu" sayma alışkanlığı, yazılımı sertifikasyona hazırlamaya çalışırken duvara çarpar.

---

## Üst-Seviye Akış

Zynq-7000 gibi bir PS+PL (Processing System + Programmable Logic) SoC'de reset sonrası CPU'nun `main()`'e ulaşması üç katmanlı bir akıştır:

<div class="mermaid">
flowchart LR
    A[POR / Reset] --> B[BootROM<br/>0xFFFF0000]
    B --> C[FSBL<br/>OCM 0x00000000]
    C --> D[Uygulama _start<br/>DDR adresi]
    D --> E[boot.S<br/>register init]
    E --> F[CRT0<br/>BSS/data]
    F --> G[__libc_init_array]
    G --> H[main()]
</div>

Bu yazının ana odağı sağdaki dört kutu: `_start` → `boot.S` → `CRT0` → `__libc_init_array` → `main()`. Sol taraf (BootROM ve FSBL) Zynq'e özgü; sağ taraf herhangi bir Cortex-A platformunda nerdeyse aynıdır.

**BootROM**, ROM'da maskelenmiş, ROM koduyla gelir. Zynq-7000'de 32 KB boyutundadır ve OCM'in üst 64 KB'ına alias'lı olarak `0xFFFF0000` adresinden çalışır. Boot Header'ı (QSPI, NAND, SD veya JTAG'dan) okur, FSBL'i OCM'in alt 192 KB'ına (`0x00000000`) yükler ve oraya dallanır (UG585, Bölüm 6).

**FSBL** (First Stage Bootloader), genelde Xilinx tools tarafından üretilen veya el yapımı bir betikle, PS clock'ları, DDR controller, MIO pinleri ve gerekirse PL bitstream'ini ayağa kaldırır. Sonra uygulamayı (örneğin DDR'daki `0x00100000` adresinde duran ELF'i) yükler ve oraya atlar.

Buraya kadar olan kısım vendor'a özel. CPU'nun gerçekten "ne oluyor?" sorusunun cevabı **`_start`'tan itibaren** başlar.

---

## Reset Anında CPU'nun Hali

Cortex-A9 reset'inden hemen sonra CPU şu durumdadır (Cortex-A9 TRM r4p1, "Reset" bölümü):

- **Mod:** Supervisor (SVC, CPSR.M = `10011`)
- **A, I, F bayrakları:** Set — asynchronous abort, IRQ, FIQ maskeli
- **PC:** `0x00000000` *veya* `0xFFFF0000` — `VINITHI` giriş sinyaline bağlı
- **SCTLR:** Mimari olarak sıfırlanan bitler dışındakiler implementasyon tanımlı; tipik olarak MMU (M), data cache (C), instruction cache (I) ve branch prediction (Z) hepsi kapalı
- **VBAR:** `0x00000000`
- **Cache içerikleri:** Tanımsız (önyargı: çöp)
- **TLB içerikleri:** Tanımsız
- **Diğer her şey:** Tanımsız

Yani CPU, kullanılabilir bir stack pointer'ı dahi yokken `_start` etiketinin bulunduğu adresten ilk komutu çekmeye çalışır. İlk komut **vektör tablosunun** ilk girdisidir.

### Vektör Tablosu: Cortex-A'nın Cortex-M'den En Belirgin Farkı

Cortex-A vektör tablosu, ARMv7-A ARM (DDI 0406C) Tablo B1-3'te tanımlandığı şekilde 8 girdiden oluşur ve her girdi **bir adres değil, bir komuttur**:

```armasm
.section .vectors, "ax"
.global _vector_table
_vector_table:
    LDR pc, =_start            @ 0x00 — Reset
    LDR pc, =UndefinedHandler  @ 0x04 — Undefined Instruction
    LDR pc, =SVCHandler        @ 0x08 — Supervisor Call (SWI/SVC)
    LDR pc, =PrefetchAbort     @ 0x0C — Prefetch Abort
    LDR pc, =DataAbort         @ 0x10 — Data Abort
    .word 0                    @ 0x14 — Reserved (eski ARM'da Address Exception)
    LDR pc, =IRQHandler        @ 0x18 — IRQ
    LDR pc, =FIQHandler        @ 0x1C — FIQ
```

Her giriş 32-bit'lik bir `LDR pc, =<addr>` makrosudur. Burada `=` sözdizimi, assembler'a hedef adresi yakındaki bir literal pool'a koymasını ve `LDR pc, [pc, #offset]` olarak çevirmesini söyler. Bu, vektör tablosu adres bağımsız (PC-relative) çalıştığı için handler'lar **belleğin herhangi bir yerinde** olabilir. Cortex-M'in `.word`-tabanlı tablosundan en büyük farkı budur.

Önemli bir incelik: ofset `0x14`'teki "reserved" girdisi. ARMv4'te bu, "Address Exception" idi (24-bit adres modunda); ARMv5'ten itibaren ayrıldı. Yine de tablo *düzeni* korunduğu için herkes oraya bir `.word 0` koyar.

---

## `_start`: Çıplak CPU'yu İşbirlikçi Hale Getirmek

`_start`'ın görevi CPU'yu C dilinin makul varsaydığı koşullara getirmektir. Xilinx'in `embeddedsw` reposundaki [boot.S](https://github.com/Xilinx/embeddedsw/blob/master/lib/bsp/standalone/src/arm/cortexa9/gcc/boot.S) dosyasını referans alarak adımları sırasıyla açıyoruz.

### 1. VBAR'ı Set Et

Reset anında vektör tablosu `0x00000000`'da varsayılır. Uygulama DDR'ın orta yerinden çalışıyorsa, exception handler'larını DDR'a yönlendirmek için **Vector Base Address Register**'ı (VBAR, CP15 c12) güncellemek gerekir:

```armasm
ldr   r0, =_vector_table
mcr   p15, 0, r0, c12, c0, 0    @ VBAR ← &_vector_table
isb
```

VBAR'ın CP15 kodlaması `<op1=0, CRn=c12, CRm=c0, op2=0>`. ARMv7-A ARM (DDI 0406C) Bölüm B4.1.156. `isb` (Instruction Synchronization Barrier) burada *zorunlu*, çünkü CP15 yazımının sonrası geleneksel program akışıyla senkronize değildir; sonraki bir exception'da VBAR'ın gerçekten güncel okunduğunu garanti eden tek şey ISB'dir.

Eğer `SCTLR.V` (bit 13) set ise VBAR yok sayılır, vektörler `0xFFFF0000`'a sabitlenir. Bu bayrak Cortex-A boot'unda neredeyse her zaman **0** bırakılır.

### 2. Cache ve TLB'yi Geçersiz Kıl (Invalidate)

CPU reset'inden sonra cache içerikleri tanımsızdır. Cache'i etkinleştirmeden önce *önce geçersiz kılınmalıdır*; aksi takdirde ilk DDR okumalarında çöp veri görürsünüz:

```armasm
@ I-cache (icache) invalidate, tüm satırlar
mov   r0, #0
mcr   p15, 0, r0, c7, c5, 0     @ ICIALLU
@ TLB invalidate
mcr   p15, 0, r0, c8, c7, 0     @ TLBIALL
@ Branch predictor invalidate
mcr   p15, 0, r0, c7, c5, 6     @ BPIALL
dsb
isb
```

D-cache invalidate'i bundan zor; tek bir register yazımıyla halledilmiyor. **Set/way** seviyesinde her seviyenin (L1D, L2 vb.) tüm satırlarını dolaşan bir döngü yazmak gerekir (Cortex-A9 TRM Bölüm 8.2). CMSIS-Core(A) `cache_armv7.s` bunu yapan klasik referanstır; satır sayısı L1D'de Cortex-A9'da 256, way sayısı 4'tür.

Pratikte D-cache invalidate'i atlamayın. "MMU kapalıyken cache nasıl olsa kullanılmaz" hatası en sevdiğim debug klasiklerinden: MMU'yu set edip cache'i açtığınız anda eski PoR çöpü L1'den uygulama belleğine giriverir.

### 3. Mod Mod Dolaşıp Stack Pointer'ları Set Et

ARMv7-A'da exception modlarının her birinin **banked SP'si** vardır: FIQ, IRQ, ABT, UND ve SYS modlarının ayrı `SP`, `LR` ve (FIQ için) ayrı R8–R12'si bulunur. Bir abort handler tetiklendiğinde otomatik olarak ABT moduna geçilir ve bu modun SP'sini kullanır. Eğer hiç set etmediyseniz... handler içinde *push* yapan ilk komut başka bir abort tetikler, ondan sonrası recursive abort cehennemidir.

Linker script'inizde her mod için ayrı stack alanı tahsis edip, `_start` içinde her moda kısa süreliğine girip SP'yi set etmek gerekir:

```armasm
.equ MODE_FIQ, 0x11
.equ MODE_IRQ, 0x12
.equ MODE_SVC, 0x13
.equ MODE_ABT, 0x17
.equ MODE_UND, 0x1B
.equ MODE_SYS, 0x1F
.equ NO_INT,   0xC0          @ I=1, F=1 (kesmeler maskeli)

msr   cpsr_c, #(MODE_FIQ | NO_INT)
ldr   sp, =__fiq_stack_end
msr   cpsr_c, #(MODE_IRQ | NO_INT)
ldr   sp, =__irq_stack_end
msr   cpsr_c, #(MODE_ABT | NO_INT)
ldr   sp, =__abt_stack_end
msr   cpsr_c, #(MODE_UND | NO_INT)
ldr   sp, =__und_stack_end
msr   cpsr_c, #(MODE_SYS | NO_INT)
ldr   sp, =__sys_stack_end
msr   cpsr_c, #(MODE_SVC | NO_INT)
ldr   sp, =__svc_stack_end
```

SVC modunda kalıyoruz çünkü kalan boot adımlarını (MMU, cache enable) ayrıcalıklı bir modda yapmamız gerekiyor; sonra uygulamanın esas C kodu için genelde SYS moduna geçilir.

### 4. FPU/NEON Erişimini Aç

ARMv7-A'da FPU ve NEON komutları, **CP10 ve CP11** koprosesör boşluklarındadır. Reset'ten sonra bu koprosesörlere erişim **kapalı** kabul edilir; CPACR.CP10 ve CPACR.CP11 alanlarına `0b11` (full access) yazılmadan herhangi bir VFP/NEON komutu **Undefined Instruction** exception'ı tetikler.

```armasm
@ CPACR: CP10 ve CP11'e full access
mrc   p15, 0, r0, c1, c0, 2     @ Read CPACR
orr   r0, r0, #(0xF << 20)      @ CP10/CP11 = 11_11
mcr   p15, 0, r0, c1, c0, 2     @ Write CPACR
isb

@ FPEXC: EN bit ile FPU'yu aç
mov   r0, #0x40000000           @ FPEXC.EN = 1 (bit 30)
vmsr  fpexc, r0
```

Bu blok atlandığında ya da yanlış yazıldığında ortaya çıkan klasik semptom: derleyici `-mfpu=neon-vfpv3` ile inline olarak ürettiği bir `vmov`/`vldr` komutuna düşünce `main()`'in ortasında, ilk float işlemde tahta çakılır. Vendor BSP'lerini değiştirip derleyici flag'lerini elle eşleştirirken sıkça karşılaşılan bir tuzaktır.

ARMv7-A ARM (DDI 0406C), CPACR için Bölüm B4.1.40; FPEXC için Bölüm B6.1.39. Cortex-A15'in TRM'inde ise CPACR yazımından sonra ISB komutu *zorunlu* olarak gösterilir.

### 5. MMU Tablosunu Hazırla ve Aç

Cortex-A'nın L1 D-cache'i, **MMU kapalı**yken sahnede olamaz: cache satırlarının "memory type" bilgisi MMU'dan gelir (Strongly-Ordered, Device, Normal-Cacheable, Normal-Non-Cacheable). MMU kapalıyken her şey "Strongly-Ordered" sayılır, dolayısıyla `SCTLR.C` set edilse bile veri cache'i etkin çalışmaz. C runtime, MMU açılmadan başlatılırsa, ilk yapılan büyük `memcpy` (örneğin `.data` kopyalama) saniyeler sürer.

Bu nedenle boot.S, MMU translation table'ını hazırlar ve `SCTLR.M`'i set eder. Short Descriptor Format (1MB section'lar) Zynq tarzı uygulamalar için yeterlidir:

```armasm
@ TTBR0 ← translation table base
ldr   r0, =MMUTable
mcr   p15, 0, r0, c2, c0, 0     @ TTBR0
ldr   r0, =0x55555555           @ Domain 0..15 → Client
mcr   p15, 0, r0, c3, c0, 0     @ DACR

@ SCTLR set: M | C | I | Z
mrc   p15, 0, r0, c1, c0, 0
orr   r0, r0, #(1 << 0)         @ M = 1 (MMU)
orr   r0, r0, #(1 << 2)         @ C = 1 (D-cache)
orr   r0, r0, #(1 << 11)        @ Z = 1 (branch prediction)
orr   r0, r0, #(1 << 12)        @ I = 1 (I-cache)
dsb
mcr   p15, 0, r0, c1, c0, 0     @ Write SCTLR
isb
```

`SCTLR.M`'i set ettiğiniz an, **bir sonraki komut** translation tablosuna göre çevrilir. ISB komutu burada hayati: ISB olmadan pipeline'da bir önceki sanal adresi varsayan komut hâlâ yürüyor olabilir. Yanlış yere düşmüş bir prefetch, bir abort'un kaynağına dönüşür ve haftalarca süren bir avı başlatır.

ARM çekirdek geliştirici e-posta listelerinde "ARM: LPAE: add ISBs around MMU enabling code" başlığıyla 2011-2012'de defalarca yamalanan bir konu — Linux çekirdeğinde bile birkaç tur döndü.

---

## CRT0: C Dilinin Beklediği Yere Çekilmek

`boot.S` bittiğinde CPU SVC modunda, stack pointer dolu, MMU açık, cache çalışır, FPU erişilebilir bir durumdadır. Şimdi C dilinin yaşaması için bir ortam gerekiyor: **`.bss`** sıfırlanmış, **`.data`** ROM'dan RAM'e kopyalanmış olmalı.

Newlib referansında bu işi `crt0.S` yapar:

```armasm
@ .bss sıfırla
ldr   r0, =__bss_start__
ldr   r1, =__bss_end__
mov   r2, #0
1:  cmp   r0, r1
    strlt r2, [r0], #4
    blt   1b

@ .data ROM'dan RAM'e kopyala
ldr   r0, =__data_load
ldr   r1, =__data_start
ldr   r2, =__data_end
2:  cmp   r1, r2
    ldrlt r3, [r0], #4
    strlt r3, [r1], #4
    blt   2b

@ C++ konstrüktörleri çalıştır
bl    __libc_init_array

@ main() çağır
mov   r0, #0                @ argc
mov   r1, #0                @ argv
bl    main

@ main dönerse — exit
b     exit
```

`__bss_start__`, `__data_load`, `__data_start` gibi semboller **linker script** tarafından sağlanır. Bunlar koddan değil, `.ld` dosyasındaki `PROVIDE(__bss_start__ = .)` türü direktiflerden gelir. Linker script yanlış yazıldığında — örneğin `.bss`'in `_end` sembolünü iki kez tanımlarsanız — yukarıdaki döngü ya hiç çalışmaz (atlanır) ya da yanlış adresi sıfırlar. "Programım rastgele uninitialized değişken değerleri görüyor" şikayetinin en sık nedeni budur.

`__libc_init_array`, `.init_array` bölümündeki fonksiyon işaretçilerini sırayla çağırır. `__attribute__((constructor))` ile işaretlenen C fonksiyonları ve C++ statik nesnelerinin yapıcıları buraya konur. Sıralama, derleyici tarafından üretilen ELF'in `.init_array` bölümündeki sıraya bağlıdır; *programcının yazdığı sıraya değil*. C++ kullanıyorsanız "static initialization order fiasco" hâlâ kuyruğunuza sallar.

---

## Renode ile Tüm Akışı Adım Adım İzlemek

Şimdiye kadar olan her şey kitabi. Konuyu somutlaştırmanın en güzel yolu, **simülatörde** boot kodunun her satırını adım adım yürütmek. Önceki yazıda Renode'da Zynq7000 platformunun nasıl ayağa kaldırıldığını göstermiştik; aynı kurulumun üzerine küçük bir uygulama derleyip boot'u izleyelim:

```
(machine-0) sysbus LoadELF @/tmp/hello.elf
(machine-0) cpu PC 0x00100000             # uygulama girişi
(machine-0) cpu PerformanceInMips 100
(machine-0) cpu LogFunctionNames true
(machine-0) logLevel 0 cpu
(machine-0) cpu AddHook 0x00100000 "self.DebugLog('hit _start')"
(machine-0) cpu AddHook `sym '_start'` "self.DebugLog('entered _start')"
(machine-0) cpu AddHook `sym 'main'`   "self.DebugLog('entered main')"
(machine-0) cpu Step 1
```

Renode'un en tatlı tarafı, **CP15 register'larına yazımları** loglayabilmesi:

```
(machine-0) cpu MaximumBlockSize 1
(machine-0) cpu LogPeripheralAccess true
(machine-0) start
```

Tipik bir trace'in özeti:

| Adım | PC | Komut | Etki |
|------|-----|-------|------|
| 1 | `0x00100000` | `B _start` | Vektör tablosu reset girdisi |
| 2 | `0x00100040` | `MCR p15, 0, r0, c12, c0, 0` | VBAR set |
| 3 | `0x00100050` | `MCR p15, 0, r0, c7, c5, 0` | ICIALLU |
| 4 | `0x00100100` | `MSR CPSR_c, #0xD1` | FIQ moduna geçiş |
| 5 | `0x00100104` | `LDR SP, =__fiq_stack_end` | FIQ stack |
| 6 | `0x001001A0` | `MCR p15, 0, r0, c1, c0, 2` | CPACR yazımı |
| 7 | `0x001001B0` | `VMSR FPEXC, r0` | FPU EN |
| 8 | `0x00100220` | `MCR p15, 0, r0, c1, c0, 0` | SCTLR — MMU+cache açıldı |
| 9 | `0x00100400` | `BL __libc_init_array` | CRT bitti |
| 10 | `0x00101000` | `BL main` | İçeri girdik |

Bu trace'i çıkarmak insanın boot kodunu "anladım" sandığı 50 satırın aslında 200+ komut yürüten bir hadise olduğunu gösteriyor. Daha önemlisi, bir register yazımı kaçtığında (örneğin FPEXC blokunu unuttuğunuzda) trace'in tam olarak hangi noktada Undefined Instruction handler'a saptığını sanal saatte mikrosaniye hassasiyetiyle gösterir.

Renode ayrıca CP15 erişimini "watchpoint" gibi kullanmayı sağlar:

```
sysbus.cpu AddCustomCP15Hook 15 0 1 0 0 'function(value) DebugLog("SCTLR := 0x" .. string.format("%x", value)) end'
```

Bu hook ile SCTLR'a yazılan her değeri loglayabilir, MMU enable bitinin tam olarak nerede set edildiğini sahnenin ortasında durdurabilirsiniz. JTAG ile gerçek tahta üzerinde böyle bir görünürlüğü elde etmek günler alır; simülatörde bu otomatik bir adım.

---

## Sık Görülen Boot Hataları ve Trace İmzaları

Boot kodu sessiz başarısız olur — `main()`'e ulaşılamadığı sürece `printf` yok, log yok, hata mesajı yok. Aşağıdaki imzalar bana çok zaman kazandırdı:

**Belirti:** "Tahtam reset oluyor, sonra hiçbir şey olmuyor."
**Tipik neden:** Vektör tablosunda `LDR pc, ...` yerine `B ...` (branch) kullanılmış, ama tablo `0x00000000` dışında bir adreste; PC ulaşamayacak kadar uzak bir hedefe dallanıyor. ARM `B` komutu ±32MB, `LDR pc, =...` PC-relative literal pool ile sınırsız.

**Belirti:** "main()'e girdim, ilk float işlemde tahta resetleniyor."
**Tipik neden:** CPACR'ye CP10/CP11 yazılmadı veya FPEXC.EN set edilmedi. Trace'te Undefined Instruction handler'a (`VBAR+0x04`) saptığını görürsünüz.

**Belirti:** "main() çalışıyor, ama global int değişkenlerim 0 değil."
**Tipik neden:** CRT0 `.bss` döngüsü `_bss_start` ve `_bss_end` sembollerini yanlış buluyor — genellikle linker script'te bölüm ayrımı bozuk veya `_end` mismatch.

**Belirti:** "Ara sıra Data Abort alıyorum, hep aynı yerde değil."
**Tipik neden:** MMU açılırken D-cache invalidate atlanmış, eski cache satırları yeni sanal adreslere "yapışmış". Cache flush + ISB ile çözülür.

**Belirti:** "İlk IRQ geldiğinde sistem çöküyor."
**Tipik neden:** IRQ modunun SP'si set edilmedi — handler push yapamıyor.

Bu imzalar boot kodunun "bir kez yazılır, bir daha okunmaz" olduğu varsayımına meydan okuyor. Aksine: her CPU/derleyici/SDK yükseltmesinde boot.S'i bir tur okumak, ileride bir günü kurtarır.

---

## Pratik Mühendislik Tavsiyeleri

- **Vendor BSP'sini olduğu gibi kullanmayın, ama içine girin.** Xilinx'in `embeddedsw` reposundaki `boot.S` iyi bir referanstır; ama projenizde ne yapması gerektiğini anlamadan kopyalamak, sertifikasyona girdiğinizde duvardır. Her satır için izlenebilirlik (traceability) belgesi gerekir.

- **Boot sırasını linker script ile birlikte düşünün.** Sembollerin yanlış yerde tanımlanması, kodun yanlış olmasından daha sık başınızı ağrıtır. `_bss_start`, `_data_load`, `_vector_table` gibi sembolleri linker script'inizde *PROVIDE* edin ve `boot.S` içinden referans alın.

- **Simülatörde önce, sonra tahtada.** Renode (veya QEMU/FVP) üzerinde boot trace'i çıkarmak, gerçek tahtada JTAG ile aynı görünürlüğü elde etmenin onda biri zamanını alır. Sertifikasyon hedefli projelerde simülasyonda alınan trace'i kanıt olarak kullanmak da mümkün — yeter ki simülatörün uygunluğu DO-330 (Tool Qualification) gereği gösterilsin.

- **Cache ve MMU enable'larından önce ISB.** Pipeline yüzünden sezgilerinizin yanılttığı en sinsi yer. `MCR p15, …, SCTLR` sonrası ISB **zorunlu**.

- **Exception modlarının hepsine SP verin.** Sizin uygulamanız FIQ kullanmasa bile, FIQ stack pointer'ı geçerli bir adres olmalı; bir gün spurious bir FIQ gelirse handler en azından temiz bir hata raporlayabilsin.

- **Boot süresinde fazlasından kaçının.** Boot süresi sertifikasyonda "deterministic startup time" gereksinimi olarak gelir. Cache invalidate döngüleri OCM'de mi yoksa DDR'da mı çalıştığına bağlı olarak 1 ms'den 50 ms'e uzayabilir — bunu test edip ölçün.

---

## Açık Sorular ve İleri Okuma

- **ARMv8-A 64-bit boot.** EL3/EL2/EL1 geçişleri, SCR/HCR yazımları, Generic Timer initialization. Cortex-A53 ve sonrası için boot.S önemli ölçüde farklılaşır.
- **Multicore CPU bring-up.** Cortex-A9 MPCore'da CPU 0 boot ederken CPU 1 nasıl uyandırılır? SCU yapılandırması, parking protokolü.
- **Secure boot ve TrustZone.** BootROM'un Secure World'ten Non-Secure World'e geçişini nasıl yönettiği, signature verification akışı (Zynq UltraScale+ MPSoC için CSU).
- **Lockstep çekirdeklerin boot'u.** Cortex-R5'in DCLS (Dual-Core Lock-Step) modunda boot sırasında iki çekirdek nasıl senkronize edilir; CCM-R5 katmanı ne yapar.

Bunların her biri ayrı birer yazıyı hak ediyor — özellikle Zynq UltraScale+ MPSoC için A53/R5/PMU üçlüsünün boot orkestrası başlı başına bir konu.

---

## Kaynaklar

- [ARM Architecture Reference Manual ARMv7-A and ARMv7-R edition (DDI 0406C)](https://developer.arm.com/documentation/ddi0406/latest/) — VBAR, SCTLR, CPACR, FPEXC tanımları
- [Cortex-A9 Technical Reference Manual r4p1 — Reset, CP15 system control registers](https://developer.arm.com/documentation/100511/0401/) — implementation-defined davranışlar
- [Xilinx Zynq-7000 All Programmable SoC Technical Reference Manual (UG585)](https://docs.amd.com/r/en-US/ug585-zynq-7000-SoC-TRM) — BootROM, FSBL, OCM adres haritası
- [Xilinx embeddedsw `boot.S` (Cortex-A9, gcc)](https://github.com/Xilinx/embeddedsw/blob/master/lib/bsp/standalone/src/arm/cortexa9/gcc/boot.S) — referans uygulama, satır satır okunabilir
- [Zynq-7000 FSBL — AMD Adaptive Computing Wiki](https://xilinx-wiki.atlassian.net/wiki/spaces/A/pages/439124055) — FSBL davranış detayları
- [ARM Cortex-A Series Programmer's Guide (DEN0013)](https://developer.arm.com/documentation/den0013/latest/) — boot sırası, MMU ve cache kurma sırasıyla anlatım
- [Renode Documentation — Zynq-7000 platform](https://renode.readthedocs.io/) — simülasyonda boot trace ve CP15 hook'ları
- [Bare-metal programming for ARM — Daniels Umanovskis](https://github.com/umanovskis/baremetal-arm) — bare-metal Cortex-A için pedagojik referans
- [Embedded Artistry — Exploring Startup Implementations: Newlib (ARM)](https://embeddedartistry.com/blog/2019/04/17/exploring-startup-implementations-newlib-arm/) — CRT0 ve `__libc_init_array` akışı
- [Newlib `arm/crt0.S`](https://sourceware.org/git/?p=newlib-cygwin.git;a=blob;f=newlib/libc/sys/arm/crt0.S) — referans CRT0 kaynağı

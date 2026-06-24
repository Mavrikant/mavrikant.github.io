---
title: "Linker Script Anatomisi: Zynq-7000 Bare-Metal için Bir `.ld` Dosyası Satır Satır"
subtitle: "Anatomy of a Linker Script: Walking Through a Zynq-7000 Bare-Metal `.ld` File"
background: "/img/posts/8.webp"
date: '2026-05-26 09:00:00'
layout: post
lang: tr
mermaid: true
---

Bir önceki yazıda **Renode** üzerinde Zynq-7000'i simüle etmiştik. Simülatöre bir ELF verirken arka planda görünmez bir el, kodu ve veriyi DDR'a, vector table'ı OCM'e, başlangıç değerlerini doğru bölgeye yerleştiriyor. O görünmez el, **linker script**'tir. Onu anlamadığınızda Renode size yardımcı olmaz; "şu adres neden buraya geldi" sorusu cevapsız kalır.

Bare-metal Zynq-7000 (PS tarafı, çift çekirdek Cortex-A9) projesinde derleme zincirini takip ederseniz, kodun `main()`'e ulaşmadan önce geçtiği üç temel adım vardır: derleyici, derleyici (assembler) ve linker. Linker ve onu yönlendiren `.ld` dosyası, çoğu mühendis için kutsal metindir — değiştirilmez, anlaşılmaz, "Vitis zaten üretiyor" denilip geçilir.

Oysa linker script, ürününüzün belleği nasıl tükettiğini, hangi değişkenin nereye yerleştiğini, hangi sabit verinin OCM'de hangisinin DDR'da oturduğunu, FSBL'in uygulamanızı nereye yüklediğini, kesme vektör tablosunun hangi adresten okunduğunu ve C++ kullanıyorsanız global nesnelerin constructor'larının ne zaman çağrıldığını belirleyen tek dosyadır. Onu anlamadan bare-metal hata ayıklamak, gözleri kapalı el yordamıyla yürümeye benzer.

Bu yazıda Xilinx (artık AMD) Vitis'in standalone BSP'si için ürettiği tarz bir Zynq-7000 `.ld` dosyasını **satır satır** açacağız. Sonra `arm-none-eabi-ld`'nin ürettiği `.map` dosyasından örnek satırlara bakacak, `objdump` ile bellek yerleşimini doğrulayacağız. Hedef, "şu satır şu işi yapar" düzeyinden öteye geçip neden bu yapıya ihtiyaç duyulduğunu anlamak.

---

## Kısa Bir Tarihçe: Linker Script Nereden Geldi?

GNU `ld`, 1988 yılında Cygnus / Free Software Foundation tarafından GNU Binutils paketinin bir parçası olarak yazıldı. O dönemde Unix platformları için tasarlanmıştı: COFF, ECOFF, a.out gibi nesne formatlarını destekliyor, hedef genellikle bir Unix işletim sistemiydi ve linker script — varsayılan olarak — kullanıcı tarafından yazılmıyordu. `ld` her hedef için yerleşik (built-in) bir linker script ile geliyordu; programcı bunu bilmek zorunda değildi.

ELF (Executable and Linkable Format) 1989'da System V Release 4 ile geldi ve hızla Unix dünyasının standart formatı oldu. Bugün hâlâ ARM, RISC-V, x86, PowerPC üzerinde hem hosted hem bare-metal sistemlerin neredeyse hepsi ELF üretir. ELF'in temel taşı **bölümlerdir (sections)**: kod, veri, sabitler, sembol tablosu, debug bilgisi — hepsi ayrı bölümlerde tutulur. Linker'ın görevi, birden çok nesne dosyasındaki aynı isme sahip bölümleri (örneğin tüm `.o` dosyalarının `.text` bölümlerini) birleştirip nihai bir ELF üretmektir.

Bare-metal işin denklemini değiştirdi. Bir Zynq-7000'de ne işletim sistemi var ne dinamik loader; DDR3, OCM ve QSPI Flash ayrı fiziksel kaynaklarda, ayrı adres aralıklarında oturur. Boot zinciri ROM → FSBL → uygulama olarak ilerler. Başlangıç kodu (`_boot` ya da `Reset_Handler`) yazmadan `main()`'e ulaşılamaz. Linker'a "şu bölümü şuraya koy, şunu DDR'da yer ayır ama load image'de QSPI'a yaz" demek için varsayılan script yetmez. Bu noktada `.ld` dosyası programcının elinde olmak zorundadır.

GNU LD'nin script dili 1990'larda olgunlaştı; bugün hâlâ aynı sözdizimi geçerlidir. LLVM'in `lld`'si büyük ölçüde aynı dili destekler, küçük farklarla. Yani bir bare-metal mühendisi için linker script okuma-yazma becerisi, otuz yıldan uzun ömürlü bir yatırımdır.

---

## Zynq-7000 Bellek Modeli: DDR, OCM ve QSPI Neden Ayrı?

Bir Zynq-7000 PS tarafı, linker'ın bilmesi gereken birkaç fiziksel bellek bölgesini taşır:

- **DDR3**: harici DDR3 SDRAM, PS'in DDR denetleyicisi aracılığıyla erişilir. Tipik 512 MB – 1 GB boyutunda; başlangıç adresi `0x0000_0000`. Hızlı, büyük ama enerji kesilince içeriğini kaybeder.
- **OCM (On-Chip Memory)**: SoC içinde, çekirdeklere düşük gecikmeyle bağlı **256 KB** SRAM. Dört adet 64 KB banktan oluşur. Adres haritasında nereye düşeceği `slcr.OCM_CFG[RAM_HI]` 4-bit register'ı ile bank-bank ayarlanır: her bank ya düşük aralığa (`0x0000_0000`–`0x0003_FFFF`) ya da yüksek aralığa (`0xFFFC_0000`–`0xFFFF_FFFF`) eşlenir. BootROM çıkışında OCM_CFG = `0x18` olur: ilk üç bank düşükte (192 KB, `0x0000_0000`–`0x0002_FFFF`), son bank yüksekte (64 KB, `0xFFFF_0000`–`0xFFFF_FFFF`). U-Boot çoğu zaman OCM_CFG = `0x1F` yapar: dört bankı da yüksek aralığa yığar (`0xFFFC_0000`–`0xFFFF_FFFF`).
- **QSPI Flash**: linear-addressed modda `0xFC00_0000`'dan itibaren 16 MB'lık bir pencereden okunabilir. Kalıcı, ama yazılması yavaş ve sınırlı çevrim sayılı.
- **MIO/Periphery**: register'lar `0xE000_0000`'dan itibaren bir blok; linker script açısından "yer kaplamayan" ama PROVIDE edilen sembollerde geçebilir.

Linker script'in birinci görevi, derleyiciye ve linker'a bu bellek bölgelerinin var olduğunu, hangi adres aralığında oturduklarını ve hangi izinlere (okuma / yazma / yürütme) sahip olduklarını söylemektir.

<div class="mermaid">
graph LR
    subgraph QSPI[QSPI Flash 0xFC00_0000 - 16 MB]
        BOOTHDR[Boot Image: BOOT.bin - FSBL + bitstream + app]
    end
    subgraph OCM_LOW[OCM low 0x0000_0000 - 192 KB]
        VECT[Vector Table - opsiyonel]
        FSBL[FSBL kodu - boot sırasında]
    end
    subgraph OCM_HIGH[OCM high 0xFFFF_0000 - 64 KB]
        VECT2[Vector Table - VINITHI=1 ise]
        SMALL[Düşük-gecikmeli sabitler]
    end
    subgraph DDR[DDR3 0x0010_0000 - 1 GB]
        TEXT[.text]
        RODATA[.rodata]
        DATA[.data]
        BSS[.bss]
        HEAP[heap - büyür]
        STACK[stack - küçülür]
    end
    BOOTHDR -. BootROM kopyalar .-> FSBL
    FSBL -. uygulamayı DDR'a yükler .-> TEXT
</div>

Burada kritik nokta: bare-metal bir Zynq uygulaması, ayağa kalkış senaryosuna göre **iki farklı LMA/VMA dengesine** sahip olabilir. Eğer ELF'i doğrudan JTAG ile DDR'a yüklüyorsanız, çoğu bölüm için LMA = VMA = DDR adresi olur. Ama gerçek üründe BOOT.bin'den boot ediyorsanız, FSBL ELF'inizi QSPI'dan okuyup DDR'a kopyalar; o senaryoda script açısından yine LMA = VMA (DDR), ama _yeniden lokasyona kaldırılan_ küçük bir tablo (örn. OCM'deki vector veya kritik fonksiyon) için LMA ≠ VMA tanımlanır. Bu ayrım, linker script'in en güçlü ama en yanlış anlaşılan kavramıdır.

---

## MEMORY Bloğu — Bellek Bölgelerinin Tanımı

Tipik bir Zynq-7000 standalone hedefi için MEMORY bloğu şuna benzer:

```ld
MEMORY
{
    ps7_ddr_0       (rwx) : ORIGIN = 0x00100000, LENGTH = 0x1FF00000
    ps7_ocm_low_0   (rwx) : ORIGIN = 0x00000000, LENGTH = 0x00030000
    ps7_ocm_high_0  (rwx) : ORIGIN = 0xFFFF0000, LENGTH = 0x0000FE00
    ps7_qspi_linear (rx)  : ORIGIN = 0xFC000000, LENGTH = 0x01000000
}
```

Satır satır:

- `ps7_ddr_0 (rwx)`: dış DDR3. `r` okuma, `w` yazma, `x` yürütme. Tipik 1 GB; başlangıç adresi `0x0000_0000`, fakat ilk 1 MB FSBL tarafından kullanıldığı için kullanıcı bölgesi `0x0010_0000`'dan başlatılır. Vitis BSP'sinin ürettiği script'te bu pencere `ps7_ddr_0_MEM_0` adıyla geçer; biz kısaltıyoruz.
- `ps7_ocm_low_0 (rwx)`: OCM'in düşük adres aralığına eşlenmiş 192 KB bölgesi. BootROM OCM_CFG=0x18 ayarı ile bu pencere mevcuttur. FSBL bu pencerede yaşar ve uygulamayı DDR'a yükledikten sonra kontrolü devreder.
- `ps7_ocm_high_0 (rwx)`: OCM'in yüksek aralığa eşlenmiş 64 KB bankı. `0xFFFF_0000`–`0xFFFF_FDFF`. VINITHI=1 ile bu adres alternatif reset vektör tabanı olabilir; aksi halde küçük, düşük-gecikmeli tablolar için kullanılır.
- `ps7_qspi_linear (rx)`: QSPI Flash linear-addressed pencere. Sadece okuma izniyle tanımlanır; yazma için QSPI denetleyicisi register'larıyla protokol konuşulması gerekir.

`MEMORY` bloğu sadece linker'a "bu adres aralıkları var" der; içine ne konacağı `SECTIONS` ile belirlenir.

---

## SECTIONS Bloğu — Bölümlerin Yerleştirilmesi

`SECTIONS`, linker script'in kalbidir. Her **çıktı bölümünü** (output section) sırasıyla tanımlar; her çıktı bölümü, nesne dosyalarındaki bir veya daha fazla **girdi bölümünden** (input section) oluşur.

### Vector Table — Cortex-A9'da Talimatlar, Pointer Değil

Cortex-A9 reset davranışını anlamak için iki noktayı ezberlemek gerekir:

- **VBAR (Vector Base Address Register)**: Cortex-A9'da CP15 c12 c0 0 üzerinden okunup yazılan, vector table'ın tabanını tutan register. Donanım reset anında VBAR ya `0x0000_0000` ya da `0xFFFF_0000`'a yüklenir; bu seçim, **VINITHI** konfigürasyon sinyali ile belirlenir. Zynq-7000'de varsayılan VINITHI=0; reset vektörü `0x0000_0000`'dadır ve OCM low buraya eşlendiği için ilk talimat OCM'den okunur.
- **8 girişli tablo**: Cortex-A9 (ve genel olarak ARMv7-A) vector table'ı 8 girişten oluşur: reset, undefined instruction, supervisor call (SVC/SWI), prefetch abort, data abort, reserved, IRQ, FIQ. Her giriş **bir 32-bit talimattır** — Cortex-M'deki gibi adres değil. Tipik kullanım `LDR pc, [pc, #offset]` veya kısa mesafede `B handler` formundadır.

Tipik bir Cortex-A9 vector table assembly'si Xilinx standalone BSP'nin `asm_vectors.S` dosyasında şuna benzer:

```asm
.section .vectors, "a"
_vector_table:
    LDR pc, =_boot              /* 0x00: Reset */
    LDR pc, =Undefined          /* 0x04: Undefined instruction */
    LDR pc, =SVCHandler         /* 0x08: SVC */
    LDR pc, =PrefetchAbortHandler /* 0x0C: Prefetch abort */
    LDR pc, =DataAbortHandler   /* 0x10: Data abort */
    NOP                         /* 0x14: Reserved */
    LDR pc, =IRQHandler         /* 0x18: IRQ */
    LDR pc, =FIQHandler         /* 0x1C: FIQ */
```

Linker script'te bu bölümü şöyle yerleştiririz:

```ld
SECTIONS
{
    .vectors :
    {
        KEEP(*(.vectors))
    } > ps7_ocm_low_0
    ...
}
```

Burada dikkat edilecek üç şey var:

1. **`KEEP(...)`**: linker'ın "ölü kod eliminasyonu" (`--gc-sections`) ile bu bölümü atmasını engeller. Vector table'a hiçbir C kodu doğrudan referans vermez; sadece donanım CPU exception'larında okur. `KEEP` olmadan optimizasyon vector table'ı bütünüyle çöpe atabilir — sonra cihaz boot etmez ve siz iki gün uyumadan sebebini ararsınız.
2. **`*(.vectors)`**: bütün girdi nesnelerinden `.vectors` adlı bölümleri al. `asm_vectors.S` bu isimle `.section .vectors` direktifiyle işaretlenmiştir.
3. **`> ps7_ocm_low_0`**: bu çıktı bölümünün **VMA**'sı OCM low bölgesine düşsün. Bu bölge `0x0000_0000`'dan başladığı için reset vektörü tam istediğimiz yerde, donanımın aradığı adreste oturur. VBAR'ı sonradan değiştirmiyorsak başka iş yok; değiştiriyorsak (örn. PL310 L2 cache aktif edilirken VBAR'ı DDR'daki bir kopyaya yönlendirmek), bu satırı `> ps7_ddr_0` yapıp `VBAR = &_vector_table_ddr` kodu yazarsınız.

Vector table'ın script'in başında yer alması zorunludur; çünkü OCM low bölgesi küçüktür ve FSBL'in geri kalanı da burada otururken aynı bölgede başka şeylere yer kalması gerekir.

### .text — Kod ve Salt-Okunur Veri

```ld
.text :
{
    *(.text*)
    *(.rodata*)
    *(.glue_7) *(.glue_7t)
    *(.eh_frame)

    KEEP(*(.init))
    KEEP(*(.fini))

    . = ALIGN(4);
    _etext = .;
} > ps7_ddr_0
```

Önemli noktalar:

- `*(.text*)`: tüm girdi nesnelerinden `.text` ile başlayan bütün bölümleri al. Yıldız (`*`) bir glob'tur; `.text.startup`, `.text.cold` gibi alt bölümler GCC `-ffunction-sections` ile kullanıldığında bu pattern ile yakalanır. Bu çok önemli, çünkü `-ffunction-sections` + `-Wl,--gc-sections` kombinasyonu ile çağrılmayan fonksiyonlar bağlama dışı bırakılır.
- `*(.rodata*)`: salt-okunur sabitler. `const int table[] = {...}` C kodu burada oturur.
- `*(.glue_7) *(.glue_7t)`: ARM/Thumb interworking için derleyicinin ürettiği geçiş kodu. Zynq-7000 Cortex-A9 hem ARM hem Thumb-2 çalıştırabildiği için linker tutarlılığı açısından yer ayırılır.
- `*(.eh_frame)`: C++ exception unwinding tabloları. Bare-metal projelerde tipik olarak `-fno-exceptions` ile devre dışı bırakılır, ama linker'a hatırlatmak iyi bir alışkanlıktır.
- `KEEP(*(.init))`, `KEEP(*(.fini))`: eski (sysv) constructor/destructor mekanizması. ARM EABI bunun yerine `.init_array` kullanır (aşağıda), ama uyumluluk için yine de tutulurlar.
- `. = ALIGN(4)`: konum sayacı (location counter, `.`) 4 byte sınırına hizalanır. ARMv7-A, kodun 4 byte hizalı olmasını bekler.
- `_etext = .`: bu satırın yarattığı `_etext` sembolü, `.text` bölümünün bittiği DDR adresini gösterir.

### .ARM ve .init_array — Sessiz Ama Kritik

```ld
.ARM.extab : { *(.ARM.extab*) } > ps7_ddr_0
.ARM       :
{
    __exidx_start = .;
    *(.ARM.exidx*)
    __exidx_end = .;
} > ps7_ddr_0

.preinit_array :
{
    PROVIDE_HIDDEN (__preinit_array_start = .);
    KEEP (*(.preinit_array*))
    PROVIDE_HIDDEN (__preinit_array_end = .);
} > ps7_ddr_0

.init_array :
{
    PROVIDE_HIDDEN (__init_array_start = .);
    KEEP (*(SORT(.init_array.*)))
    KEEP (*(.init_array*))
    PROVIDE_HIDDEN (__init_array_end = .);
} > ps7_ddr_0

.fini_array :
{
    PROVIDE_HIDDEN (__fini_array_start = .);
    KEEP (*(SORT(.fini_array.*)))
    KEEP (*(.fini_array*))
    PROVIDE_HIDDEN (__fini_array_end = .);
} > ps7_ddr_0
```

`.ARM.exidx`, exception index tablosu; ARM ABI tanımlı. Bare-metal'de C kullanıyor olsanız bile linker birkaç byte üretebilir. `__exidx_start` / `__exidx_end` sembolleri runtime'da gerekirse stack unwinding kütüphanelerinin aradığı sembollerdir.

Asıl ilginç olan `.init_array`. ARM EABI, statik C++ constructor'larını eski `.init` mekanizması yerine `.init_array` ile çalıştırır. Newlib'in `__libc_init_array()` fonksiyonu, linker tarafından üretilen `__init_array_start` ve `__init_array_end` sembolleri arasındaki fonksiyon pointer'larını sırayla çağırır.

`SORT(.init_array.*)` deyimi, GCC'nin `__attribute__((init_priority(N)))` ile farklı önceliklerde constructor'lar üretmesini destekler. Linker, isme göre sıralayarak deterministik bir çalışma sırası garanti eder. `KEEP` burada kritiktir; aksi halde `--gc-sections` constructor pointer dizisini "kullanılmıyor" sayar.

C++ kullanmıyorsanız bile bu bölümlerin tanımlı olması gerekir; aksi halde `__libc_init_array()` tanımsız sembolle linker hatası verir.

### .data — VMA ve LMA Ayrımının Devreye Girdiği Yer

Zynq-7000 bare-metal'de en yaygın senaryo, ELF'in tamamen DDR'da koşmasıdır. Bu durumda `.data` için VMA = LMA = DDR adresi olur ve hiçbir runtime kopya gerekmez; FSBL DDR'a yüklediğinde başlangıç değerleri zaten yerindedir:

```ld
.data :
{
    . = ALIGN(4);
    _sdata = .;
    *(.data*)
    . = ALIGN(4);
    _edata = .;
} > ps7_ddr_0
```

Ama VMA ≠ LMA, anlamlı olduğu iki Zynq senaryosu vardır:

**Senaryo 1**: hot-path veriyi OCM'e taşımak. DDR erişimleri OCM'e göre çok daha yüksek gecikmeye sahiptir. Bir ISR'da kullanılan küçük bir tablo OCM'e konursa, cache'i kirletmeden, deterministik erişim alırsınız. Ama bu tablonun başlangıç değerleri ELF'in load image'inde **bir yerde** olmalı — DDR'ın LMA tarafına koyup runtime'da OCM'e kopyalamak doğal bir çözümdür:

```ld
.ocm_data : ALIGN(4)
{
    _socm_data = .;
    *(.ocm_data*)
    _eocm_data = .;
} > ps7_ocm_high_0 AT> ps7_ddr_0

_siocm_data = LOADADDR(.ocm_data);
```

Üç anahtar mekanizma:

1. **`> ps7_ocm_high_0`**: bu bölümün **VMA**'sı OCM high'dadır. `_socm_data` ve `_eocm_data` sembolleri OCM adreslerini taşır; C kodu içinde global değişkenler bu adreslerde okunur/yazılır.
2. **`AT> ps7_ddr_0`**: ama bölümün **LMA**'sı DDR'dadır. Yani derlenmiş ELF'in load image'inde bu byte'lar DDR bölgesine yerleştirilir; FSBL onları DDR'a yazar.
3. **`_siocm_data = LOADADDR(.ocm_data)`**: `LOADADDR` makrosu, bir bölümün LMA'sını döndürür. `_siocm_data` sembolü, DDR'daki load image'in başlangıç adresini taşır. Startup kodu, bu adresten başlayıp `_socm_data` ile `_eocm_data` arasındaki OCM'e byte-byte kopyalama yapar.

Tipik startup kopyalama kodu şuna benzer:

```c
extern uint32_t _socm_data, _eocm_data, _siocm_data;

void copy_ocm_data(void) {
    uint32_t *src = &_siocm_data;
    uint32_t *dst = &_socm_data;
    while (dst < &_eocm_data) {
        *dst++ = *src++;
    }
}
```

**Senaryo 2**: bootloader / uygulama ayrımı. Eğer kendi ikinci-aşama bootloader'ınız varsa (örn. emniyet kritik bir cihazda CRC doğrulamasından sonra uygulamaya devreden bir mini-loader), uygulama ELF'i QSPI'ya yazılır, runtime'da DDR'a kopyalanır. Bu durumda `AT> ps7_qspi_linear` kullanılır ve `_sidata`'nız QSPI adresine işaret eder.

Bu mekanizma, derleyicinin "her global değişkenin başlangıç değerini bilir" varsayımını koruyan görünmez sözleşmedir. C standardı şöyle der: `int counter = 42;` yazdığınızda, program `counter`'a ilk okuduğunda 42 görmek zorundadır. Bare-metal'de bunu garanti eden tek mekanizma, ya FSBL'in zaten DDR'a yüklemiş olduğu image'dir ya da sizin elle yazdığınız `.data` kopyalama döngüsüdür. Hangisinin geçerli olduğunu mutlaka net biçimde belirlemelisiniz; "ortada bir yerde" bırakılan bir kopyalama akışı, sahada aylar sonra "RAM'deki rastgele geçmiş değerlerden dolayı tutarsız davranış" olarak ortaya çıkar.

### .bss — Sıfır İle Başlatılan

```ld
.bss :
{
    . = ALIGN(4);
    _sbss = .;
    __bss_start__ = _sbss;
    *(.bss*)
    *(COMMON)
    . = ALIGN(4);
    _ebss = .;
    __bss_end__ = _ebss;
} > ps7_ddr_0
```

`.bss`, başlangıç değeri sıfır olan veya hiç başlatılmamış global / static değişkenleri tutar. ELF'te bu bölüm `NOBITS` tipindedir: load image'de **yer tutmaz**, sadece linker `_sbss`–`_ebss` boyutunu kaydeder. Startup kodu bu aralığı sıfırlar. Bu yüzden QSPI boyutu hesabına `.bss` girmez; ama DDR boyutu hesabına girer.

`*(COMMON)` deyimi, eski K&R C ve bazı yabancı derleyicilerin `extern` tanımlamadan global değişken bildirimi yapmasından miras kalan bir konvansiyondur. Modern projede neredeyse hiç doluymaz; ama linker script'lerde alışkanlık olarak yer alır.

Zynq'ta dikkat: çift çekirdek kullanıyorsanız (CPU0 + CPU1 ayrı standalone uygulama), her çekirdeğin kendi `.bss`'i, kendi `.data`'sı, kendi stack'i olmalıdır. İki ELF'in aynı DDR bölgesini görmesi en sık karşılaşılan AMP (Asymmetric Multi-Processing) hatasıdır.

### Heap ve Stack

```ld
._heap_stack :
{
    . = ALIGN(16);
    PROVIDE ( end = . );
    PROVIDE ( _end = . );
    . = . + _HEAP_SIZE;
    . = ALIGN(16);
    _stack_end = .;
    . = . + _STACK_SIZE;
    . = ALIGN(16);
    _stack = .;
} > ps7_ddr_0
```

Burada `_HEAP_SIZE` ve `_STACK_SIZE` script'in başında veya komut satırından (`-Wl,--defsym=_STACK_SIZE=0x2000`) verilen sembollerdir. Konum sayacını bu kadar artırmak, linker'a bu kadar DDR yerinin **kullanılmış sayılmasını** söyler.

Cortex-A9'da hizalama `8` değil `16` byte'tır. AAPCS (ARM Architecture Procedure Call Standard), public arayüzlerde SP'nin 8-byte hizalı olmasını şart koşar; pratikte ise NEON ve birçok kütüphane 16-byte hizalama bekler. `_stack_end` ve `_stack` sembolleri, başlangıç kodunun her CPU modu (SVC, IRQ, FIQ, Abort, Undef, System) için ayrı stack pointer'lar kurmasında kullanılır — Cortex-A9'da Cortex-M'den farklı olarak **her exception modunun ayrı SP'si** vardır ve bunların hepsini ayrı ayrı kurmak gerekir:

```asm
/* Startup sırasında her mod için SP kurulumu */
MSR  CPSR_c, #(MODE_IRQ | I_BIT | F_BIT)
LDR  sp, =__irq_stack_top
MSR  CPSR_c, #(MODE_FIQ | I_BIT | F_BIT)
LDR  sp, =__fiq_stack_top
MSR  CPSR_c, #(MODE_SVC | I_BIT | F_BIT)
LDR  sp, =__svc_stack_top
```

`end` sembolü ise newlib'in `_sbrk()` syscall implementasyonu tarafından heap başlangıcı olarak kullanılır.

---

## Map Dosyası Analizi — Gerçekten Ne Çıktı?

Linker'a `-Wl,-Map=output.map` parametresi verdiğinizde, `arm-none-eabi-ld` insan tarafından okunabilir bir bağlama raporu üretir. Tipik bir Zynq-7000 map dosyasında şu bölümler vardır:

- **Archive member included to satisfy reference**: hangi `.o` veya `.a` dosyalarının (örn. `libxil.a` Xilinx standalone BSP) neden bağlandığı.
- **Discarded input sections**: `--gc-sections` ile elenen ölü kod.
- **Memory Configuration**: MEMORY bloğundan gelen bölgelerin özeti.
- **Linker script and memory map**: her çıktı bölümünün, girdi bölümlerinin, sembollerin adres ve boyut dökümü.

Örnek bir parça:

```text
.vectors        0x0000000000000000       0x40
                0x0000000000000000                . = ALIGN (0x4)
 *(.vectors)
 .vectors       0x0000000000000000       0x40 build/asm_vectors.o
                0x0000000000000000                _vector_table

.text           0x0000000000100000     0xb2c0
                0x0000000000100000                _ftext = .
 *(.text*)
 .text.boot     0x0000000000100000      0x1c8 build/boot.o
                0x0000000000100000                _boot
 .text.HAL_Init
                0x00000000001001c8       0xa8 build/platform.o
 .text.main     0x0000000000100270       0x44 build/main.o
 ...
                0x000000000010b2c0                _etext = .

.ocm_data       0x00000000ffff0000       0x80 load address 0x000000000010c000
                0x00000000ffff0000                _socm_data = .
 *(.ocm_data*)
 .ocm_data.lut  0x00000000ffff0000       0x80 build/dsp_kernel.o
 ...
                0x00000000ffff0080                _eocm_data = .
                0x000000000010c000                _siocm_data = LOADADDR (.ocm_data)

.data           0x000000000010c080       0x4c
                0x000000000010c080                _sdata = .
 ...

.bss            0x000000000010c0cc      0x9b8
                0x000000000010c0cc                _sbss = .
                0x000000000010c0cc                __bss_start__ = _sbss
 ...
                0x000000000010ca84                _ebss = .
```

Burada doğrulanması gereken üç şey vardır:

1. **`.vectors` `0x0000_0000`'da mı?** Evet — OCM low'a düştüğü için VBAR=0 reset davranışı için zorunlu.
2. **`.ocm_data`'nın VMA'sı `0xFFFF_0000`, LMA'sı `0x0010_C000` mu?** Evet — `load address 0x...` satırı LMA'yı gösteriyor. Yani 128 byte'lık başlangıç verisi DDR'da `_etext`'in hemen ardına yazılmış. FSBL bu byte'ları DDR'a yükleyecek; startup kodumuz oradan OCM'e kopyalayacak.
3. **`_siocm_data = LOADADDR(.ocm_data)` `0x0010_C000`'a çözümlenmiş mi?** Evet. Startup kodu bu adresten okumaya başlayacak.

Bu üç doğrulamayı her yeni Zynq projesinde yapmak — özellikle bootloader / uygulama ayrımı, AMP konfigürasyonu veya OCM remap kullanımı söz konusuysa — gözle görülür miktarda zaman kazandırır.

`objdump` ile ek bir çapraz kontrol:

```bash
$ arm-none-eabi-objdump -h build/firmware.elf

Idx Name        Size      VMA       LMA       File off  Algn
  0 .vectors    00000040  00000000  00000000  00008000  2**2
  1 .text       0000b2c0  00100000  00100000  00010000  2**3
  2 .rodata     000003a8  0010b2c0  0010b2c0  0001b2c0  2**3
  3 .ARM        00000008  0010b668  0010b668  0001b668  2**2
  4 .init_array 00000010  0010b670  0010b670  0001b670  2**2
  5 .fini_array 00000004  0010b680  0010b680  0001b680  2**2
  6 .ocm_data   00000080  ffff0000  0010c000  00020000  2**3
  7 .data       0000004c  0010c080  0010c080  0002c080  2**3
  8 .bss        000009b8  0010c0cc  0010c0cc  0002c0cc  2**3
```

`.ocm_data` satırındaki VMA ≠ LMA, linker script'in işini doğru yaptığının asıl kanıtıdır. `.vectors`'ın `0x0000_0000`'da görünmesi, OCM low'un BootROM tarafından doğru remap edildiğini varsayar — eğer cihaz boot ediyor ama vector'ler çalışmıyorsa, OCM_CFG'ye bakın.

---

## Yaygın Tuzaklar

### 1. KEEP unutulması ve `--gc-sections`

`-Wl,--gc-sections` ile birlikte kullanıldığında, vector table veya `.init_array` `KEEP` olmadan bağlamadan tamamen silinebilir. Sonuç: cihaz reset attığında VBAR'ın işaret ettiği yerden okuduğu talimat geçersizdir; cihaz "ölü" görünür. Bu hatayı oscilloskop ve debugger ile yakalamak günlerce sürebilir.

### 2. OCM remap yanılgısı

OCM_CFG register'ı SLCR (System Level Control Registers) bloğundadır ve runtime'da değiştirilebilir. Eğer linker script'iniz vector table'ı `0x0000_0000`'a koyuyorsa ama uygulamanız boot sonrası OCM_CFG'yi `0x1F` yapıp tüm bankları yüksek aralığa yığarsa, bir sonraki exception VBAR=0'dan okumaya çalışacak ve **bu bölgeye DDR3'ten okuyacaktır** — DDR'ın o adresinde ne varsa onu yürütür. Klasik bir "neden cihazım hardfault üretiyor" hatası. Çözüm: OCM remap'i değiştirmeden önce VBAR'ı yeni adrese yönlendirin.

### 3. `.data` LMA ile DDR boyutu çakışması

`firmware.bin` veya `BOOT.bin` üretirken `bootgen` veya `objcopy` LMA'yı temel alır. `.text + .rodata + .data(LMA) + .ocm_data(LMA)` toplamının DDR kullanıcı bölgesine sığması gerekir. Bunu bir görüntü boyutu kontrolü ile (örn. `arm-none-eabi-size firmware.elf`) build sırasında her zaman doğrulayın. `--print-memory-usage` flag'i de linker'dan canlı bir özet verir.

### 4. Alignment hatası

Linker `.data` bölümünü 4 byte hizasında üretir, ama startup kopyalama döngüsü `uint32_t *` üzerinden yürür. `_sdata` ve `_edata`'nın 4'e bölünebilir adreslerde olduğunu garanti etmek için `. = ALIGN(4)` zorunludur; aksi takdirde son iterasyonda 2 byte fazladan yazıp `.bss`'in başını bozarsınız. Cortex-A9 MMU açıkken ve özellikle Strongly-Ordered veya Device tipi sayfa tabloları kullanılıyorsa yanlış hizalı erişim Data Abort doğurur.

### 5. Constructor'ların çalıştırılmaması

Eğer startup kodu `__libc_init_array()` çağırmıyorsa veya linker script `.init_array` bölümünü ihtiyacı olduğu sembollerle (`__init_array_start`, `__init_array_end`) ihraç etmiyorsa, C++ global nesnelerin constructor'ları çalıştırılmaz. Sonuç: `static MyClass obj;` ile yazdığınız sınıfın iç durumu tamamen tanımsızdır. Çoğu zaman bu hata "obje sıfırlanmış görünüyor ama metodlar çağrılınca null pointer dereference" olarak ortaya çıkar.

### 6. Çift çekirdekte aynı bölgeyi paylaşmak

Zynq'ın iki Cortex-A9'u tek bir DDR görür. AMP konfigürasyonda her ELF'in linker script'ini düzenleyip `ps7_ddr_0` bölgesini bölmeden bağlarsanız, CPU0 ve CPU1 birbirlerinin `.bss`'lerini sıfırlayarak başlatır — hangisi son sıfırlarsa diğeri çöker. Vitis tarafında bu, BSP konfigürasyonunda iki uygulamanın DDR pencerelerini ayrı ayrı tanımlamayı gerektirir.

### 7. Heap büyümesi ile stack çakışması

Klasik bir hata: dinamik tahsis (örn. `malloc`) ile heap DDR'ın ortasına doğru büyürken, derin özyinelemeli bir fonksiyon stack'i aşağıya iter; ikisi ortada çakışır. Zynq-7000 Cortex-A9'da donanım stack-limit register'ı yoktur (Cortex-M7/M33'teki PSPLIM/MSPLIM gibi). Yığın taşmasını erken yakalamak için:

- MMU ile stack alanının altına bir koruyucu (guard) sayfa tanımlayın (Strongly-Ordered + No Access).
- Veya statik analiz (örn. `gcc -fstack-usage` + bir post-process script) ile maksimum stack derinliğini çıkarın.
- Veya çalışma anında stack pattern kontrolü (canary) yapın.

Linker script'in `_stack_end` / `_stack` ve heap region tanımı, bu denetimlerin temelidir.

---

## Pratik Tavsiyeler

Çok yıllık saha deneyiminden çıkardığım bazı kısa kurallar:

- **Linker script'i sürüm kontrolüne alın.** Vitis'in ürettiği `lscript.ld`'yi kontrolsüz biçimde yeniden ürettirirseniz, elinizle yaptığınız özelleştirmeler — bootloader entegrasyonu, OCM placement, AMP DDR bölme — bir buton tıklamasıyla silinir.
- **`--print-memory-usage` veya `arm-none-eabi-size` çıktısını CI'a sokun.** DDR ve OCM kullanım yüzdelerinin yüksek olduğunda erken uyarı veren bir kontrol, sahada "image sığmadı" sürprizini önler.
- **`KEEP` listesine `.vectors`, `.init_array`, `.fini_array`, `.preinit_array`'ı her zaman koyun.**
- **Her custom section için `__section_start__` ve `__section_end__` sembolü ihraç edin.** Sonradan bir runtime check (örn. CRC) yazmak istediğinizde bu sembollere ihtiyacınız olur.
- **Map dosyasını release notlarına ekleyin.** Bir sürümde "şu DDR adresinin 4 byte fazlasının nereden geldiği" sorusu sahaya çıktıktan sonra cevaplanması gereken bir soru oluyor; geçmiş map dosyaları diff almak için altın değerindedir.
- **Çift çekirdek senaryolarında DDR'ı kesin sınırlarla bölün.** CPU0 için tipik `0x0010_0000`–`0x0FFF_FFFF`, CPU1 için `0x1000_0000`–`0x1FFF_FFFF`. Paylaşılan veri için ayrı bir bölge ayırın ve cache coherency kurallarını (PL310 + ACP veya non-cacheable mapping) bilinçli planlayın.
- **OCM'i sadece gerçekten gereken yerlerde kullanın.** 256 KB'lık küçük bir kaynaktır; vector table, FSBL artıkları, kritik ISR kodu ve düşük-gecikme tabloları için saklayın.

---

## Sonuç

Linker script, bare-metal Zynq-7000 firmware'ının görünmez omurgasıdır. Reset anında CPU'nun nereden başlayacağını, global değişkenlerin değerini nereden aldığını, vector table'ın OCM'de mi DDR'de mi oturduğunu, constructor'ların hangi sırayla çalışacağını, heap'in ne kadar büyüyebileceğini hep bu dosya belirler. Onu bir kara kutu olarak kullanmak mümkün; ama hata ayıklarken oradan dönerken, kutudan parlak bir el feneri çıkmasını ummak iyimserliktir.

Bu yazıda satır satır gezdiğimiz `.ld` dosyası, gerçek bir Zynq-7000 standalone projesindeki tipik yapıdan damıtıldı. Xilinx Vitis'in ürettiği `lscript.ld`'lerin, OpenAMP referans tasarımlarının, FreeRTOS-Zynq portunun ve hatta Linux'un öncesinde koşan U-Boot SPL'nin linker script'lerindeki temel yapı taşları aynıdır; isim farkları, attribute kullanımı ve özel section yapıları değişir. Bir kez bu temel yapıyı sindirdikten sonra, hangi araç hangi script'i üretirse üretsin, ne yapıldığını rahatlıkla okuyabilirsiniz.

Bir sonraki adım olarak şu üç egzersizi öneririm: (1) bir Zynq-7000 standalone projesinde derleme sonrası `objdump -h` çıktısı ile script'inizi karşılaştırın; (2) `.bss`'i tekrar başlatma sırasını başlangıç kodunda iptal edin ve bir global int değişkenin değerini gözlemleyin (DDR refresh sonrası rastgele olmalı); (3) bir tabloyu `__attribute__((section(".ocm_data")))` ile işaretleyip OCM'e yerleştirin ve `objdump -h` çıktısında VMA `0xFFFF_xxxx`, LMA `0x0010_xxxx` çiftini doğrulayın — büyük olasılıkla ilk denemede LMA ile VMA'yı karıştıracaksınız; ikinci denemede `LOADADDR()` mantığını içselleştirmiş olacaksınız.

Linker, sessizdir; ama yaptığı işten haberdar olmadığınızda, sürpriz yapar.

---

## Kaynaklar

- [GNU LD (binutils) Documentation — Linker Scripts](https://sourceware.org/binutils/docs/ld/Scripts.html)
- [System V Application Binary Interface — Generic ABI](https://refspecs.linuxfoundation.org/elf/gabi4+/contents.html)
- [Zynq-7000 SoC Technical Reference Manual (UG585) — On-Chip Memory (OCM)](https://docs.amd.com/r/en-US/ug585-zynq-7000-SoC-TRM/On-Chip-Memory-OCM)
- [Zynq-7000 Booting and Running Without External Memory (Xilinx Wiki)](https://xilinx-wiki.atlassian.net/wiki/spaces/A/pages/18842377/Zynq-7000)
- [ARM Cortex-A9 Technical Reference Manual (ARM DDI 0388)](https://developer.arm.com/documentation/ddi0388/latest/)
- [ARMv7-A Architecture Reference Manual (ARM DDI 0406)](https://developer.arm.com/documentation/ddi0406/latest/)
- [CMSIS-Core (Cortex-A) — Vector Base Address Register (VBAR)](https://arm-software.github.io/CMSIS_6/latest/Core_A/group__CMSIS__VBAR.html)
- [Newlib Source — `libc/misc/init.c` (`__libc_init_array` implementation)](https://sourceware.org/newlib/)
- [Xilinx `embeddedsw` — Standalone BSP `lscript.ld` örnekleri (GitHub)](https://github.com/Xilinx/embeddedsw)
- [AMD/Xilinx — Vitis Linker Scripts](https://www.xilinx.com/html_docs/xilinx2018_1/SDK_Doc/SDK_concepts/concept_sdk_linkerscripts.html)
- [Interrupt by Memfault — From Zero to main(): Demystifying Firmware Linker Scripts](https://interrupt.memfault.com/blog/how-to-write-linker-scripts-for-firmware)
- [Stargirl (Thea) Flowers — The Most Thoroughly Commented Linker Script](https://blog.thea.codes/the-most-thoroughly-commented-linker-script/)
- [ARM EABI — Run-time ABI for the ARM Architecture (IHI 0043)](https://developer.arm.com/documentation/ihi0043/latest/)

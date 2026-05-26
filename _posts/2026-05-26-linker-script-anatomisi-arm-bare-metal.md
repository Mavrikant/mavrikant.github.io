---
title: "Linker Script Anatomisi: ARM Bare-Metal için Bir `.ld` Dosyası Satır Satır"
subtitle: "Anatomy of a Linker Script: Walking Through an ARM Bare-Metal `.ld` File"
background: "/img/posts/8.webp"
date: '2026-05-26 09:00:00'
layout: post
lang: tr
mermaid: true
---

Bare-metal bir ARM Cortex-M projesinde derleme zincirini takip ettiğinizde, kodun `main()`'e ulaşmadan önce geçtiği üç temel adım vardır: derleyici, derleyici (assembler) ve **linker**. İlk ikisi okul müfredatında genellikle kabaca anlatılır; üçüncüsü, yani linker ve onu yönlendiren `.ld` dosyası, çoğu mühendis için bir kutsal metindir — değiştirilmez, anlaşılmaz, "STM32CubeMX zaten üretiyor" denilip geçilir.

Oysa linker script, ürününüzün belleği nasıl tükettiğini, hangi değişkenin nereye yerleştiğini, FLASH'taki sabit verilerin RAM'e ne zaman ve nasıl kopyalandığını, kesme vektör tablosunun nerede oturduğunu ve C++ kullanıyorsanız global nesnelerin constructor'larının ne zaman çağrıldığını belirleyen tek dosyadır. Onu anlamadan bare-metal hata ayıklamak, gözleri kapalı el yordamıyla yürümeye benzer.

Bu yazıda gerçek bir Cortex-M4 (STM32F4 ailesi) için yazılmış bir `.ld` dosyasını **satır satır** açacağız. Sonra `arm-none-eabi-ld`'nin ürettiği `.map` dosyasından örnek satırlara bakacak, `objdump` ile bellek yerleşimini doğrulayacağız. Hedef, "şu satır şu işi yapar" düzeyinden öteye geçip neden bu yapıya ihtiyaç duyulduğunu anlamak.

---

## Kısa Bir Tarihçe: Linker Script Nereden Geldi?

GNU `ld`, 1988 yılında Cygnus / Free Software Foundation tarafından GNU Binutils paketinin bir parçası olarak yazıldı. O dönemde Unix platformları için tasarlanmıştı: COFF, ECOFF, a.out gibi nesne formatlarını destekliyor, hedef genellikle bir Unix işletim sistemiydi ve linker script — varsayılan olarak — kullanıcı tarafından yazılmıyordu. `ld` her hedef için yerleşik (built-in) bir linker script ile geliyordu; programcı bunu bilmek zorunda değildi.

ELF (Executable and Linkable Format) 1989'da System V Release 4 ile geldi ve hızla Unix dünyasının standart format'ı oldu. Bugün hâlâ ARM, RISC-V, x86, PowerPC üzerinde hem hosted hem bare-metal sistemlerin neredeyse hepsi ELF üretir. ELF'in temel taşı **bölümlerdir (sections)**: kod, veri, sabitler, sembol tablosu, debug bilgisi — hepsi ayrı bölümlerde tutulur. Linker'ın görevi, birden çok nesne dosyasındaki aynı isme sahip bölümleri (örneğin tüm `.o` dosyalarının `.text` bölümlerini) birleştirip nihai bir ELF üretmektir.

Bare-metal işin denklemini değiştirdi. Bir Cortex-M4'te ne dinamik loader var ne sayfalı bellek; FLASH ve SRAM ayrı fiziksel bloklarda, ayrı adres aralıklarında oturur. Başlangıç kodu (startup) yazmadan `main()`'e ulaşılamaz. Linker'a "şu bölümü şuraya koy, şunu FLASH'tan RAM'e kopyalamak için adres etiketleri üret" demek için varsayılan script yetmez. Bu noktada `.ld` dosyası programcının elinde olmak zorundadır.

GNU LD'nin script dili 1990'larda olgunlaştı; bugün hâlâ aynı sözdizimi geçerlidir. LLVM'in `lld`'si büyük ölçüde aynı dili destekler, küçük farklarla. Yani bir bare-metal mühendisi için linker script okuma-yazma becerisi, otuz yıldan uzun ömürlü bir yatırımdır.

---

## Bellek Modeli: FLASH ve SRAM Neden Ayrı?

Modern bir Cortex-M tasarımı tipik olarak şu bellek bölgelerini içerir:

- **FLASH** (NOR Flash): kod ve sabit veri için kalıcı, yazılması yavaş ve sınırlı çevrim sayısı olan, okuması hızlı bir alan.
- **SRAM** (Static RAM): okunabilen ve yazılabilen, hızlı, ama enerji kesilince içeriğini kaybeden ana iş belleği.
- **CCM/TCM** (Core-Coupled / Tightly-Coupled Memory): bazı Cortex-M4/M7 türevlerinde bulunan, CPU'ya doğrudan bağlı, daha düşük gecikmeli özel RAM.
- **Backup RAM**: VBAT pini ile beslenebilen, enerji kesilse de korunan küçük bir alan.

Linker script'in birinci görevi, derleyiciye ve linker'a bu bellek bölgelerinin var olduğunu, hangi adres aralığında oturduklarını ve hangi izinlere (okuma / yazma / yürütme) sahip olduklarını söylemektir.

<div class="mermaid">
graph LR
    subgraph FLASH[FLASH 0x0800_0000 - 1 MB]
        VTABLE[isr_vector]
        TEXT[.text]
        RODATA[.rodata]
        DATA_LMA[.data load image]
    end
    subgraph SRAM[SRAM 0x2000_0000 - 128 KB]
        DATA_VMA[.data runtime]
        BSS[.bss]
        HEAP[heap - büyür]
        STACK[stack - küçülür]
    end
    DATA_LMA -. Reset_Handler kopyalar .-> DATA_VMA
</div>

Burada kritik nokta: `.data` bölümü hem FLASH'ta hem RAM'de **iki ayrı yerde** vardır. FLASH'taki kopya **load image**'dir; sıfırdan farklı başlangıç değerlerine sahip global değişkenlerin tohum (seed) verisini taşır. RAM'deki kopya ise çalışma zamanında erişilen "asıl" kopyadır. Linker bunu mümkün kılmak için **VMA (Virtual Memory Address)** ve **LMA (Load Memory Address)** ayrımını sunar. Bu ayrım, linker script'in en kafa karıştırıcı ama en güçlü kavramıdır.

---

## MEMORY Bloğu — Bellek Bölgelerinin Tanımı

Tipik bir STM32F4 hedefi için MEMORY bloğu şuna benzer:

```ld
MEMORY
{
    FLASH    (rx)  : ORIGIN = 0x08000000, LENGTH = 1024K
    SRAM     (rwx) : ORIGIN = 0x20000000, LENGTH = 128K
    CCM      (rw)  : ORIGIN = 0x10000000, LENGTH = 64K
}
```

Satır satır:

- `FLASH (rx)`: isim ve izinler. `r` okuma, `w` yazma, `x` yürütme (executable). FLASH'a yazma izni vermemek bir hijyen tedbiridir; yanlışlıkla yazıma yönelik bir bölüm FLASH'a iliştirilirse linker uyarı verir.
- `ORIGIN`: bu bölgenin başladığı fiziksel adres. STM32F4'te FLASH 0x08000000'dan, SRAM 0x20000000'dan başlar. Bu adresler ARMv7-M bellek haritası tarafından kabaca, üretici tarafından kesin olarak tanımlanır.
- `LENGTH`: bölge uzunluğu. Linker, bir bölüm bölgeye sığmadığında **bağlama (link) zamanında** hata verir — sahada bunu sonradan keşfetmek istemezsiniz.

`MEMORY` bloğu sadece linker'a "bu adres aralıkları var" der; içine ne konacağı `SECTIONS` ile belirlenir.

---

## SECTIONS Bloğu — Bölümlerin Yerleştirilmesi

`SECTIONS`, linker script'in kalbidir. Her **çıktı bölümünü** (output section) sırasıyla tanımlar; her çıktı bölümü, nesne dosyalarındaki bir veya daha fazla **girdi bölümünden** (input section) oluşur.

### Vector Table — Mutlaka En Başta

Cortex-M reset davranışını anlamak için iki adresi ezberlemek gerekir:

- `0x00000000`: ilk Main Stack Pointer (MSP) değeri.
- `0x00000004`: Reset_Handler'ın adresi (thumb biti set, yani LSB=1).

CPU resetlendiğinde önce bu iki kelimeyi okur, MSP'yi yükler, sonra Reset_Handler'a dallanır. Daha sonra **VTOR (Vector Table Offset Register)** üzerinden tablo başka bir adrese taşınabilir; ancak ilk anda CPU sabit bir başlangıç noktası bekler. Bu sabit adres Cortex-M0/M0+'ta donanımsal olarak 0x00000000'dır (VTOR yok). Cortex-M3/M4/M7'de varsayılan VTOR yine 0'ı işaret eder; üretici, bunu boot pini veya alias bir aralık ile (örn. STM32'de 0x00000000'ın 0x08000000'a alias olması) sağlar.

Linker script'te bunu şöyle ifade ederiz:

```ld
SECTIONS
{
    .isr_vector :
    {
        KEEP(*(.isr_vector))
    } > FLASH
    ...
}
```

Burada dikkat edilecek üç şey var:

1. **`KEEP(...)`**: linker'ın "ölü kod eliminasyonu" (`--gc-sections`) ile bu bölümü atmasını engeller. Vector table'a hiçbir C kodu doğrudan referans vermez; sadece donanım CPU resetinde okur. `KEEP` olmadan optimizasyon vector table'ı bütünüyle çöpe atabilir — sonra cihaz boot etmez ve siz iki gün uyumadan sebebini ararsınız.
2. **`*(.isr_vector)`**: bütün girdi nesnelerinden `.isr_vector` adlı bölümleri al. Bizim startup `.s` veya `.c` dosyamızda vector table bu isimle `__attribute__((section(".isr_vector")))` ile işaretlenmiştir.
3. **`> FLASH`**: bu çıktı bölümünün **VMA**'sı FLASH bölgesine düşsün. Vector table FLASH'ta yaşar, oradan okunur, taşınmaz.

`.isr_vector`'un dosyanın başında yer alması zorunludur; çünkü FLASH'a yerleştirme sırasıyla yapılır ve CPU 0x08000000 / 0x00000000'da vector table bekler.

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
} > FLASH
```

Önemli noktalar:

- `*(.text*)`: tüm girdi nesnelerinden `.text` ile başlayan bütün bölümleri al. Yıldız (`*`) bir glob'tur; `.text.startup`, `.text.cold` gibi alt bölümler GCC `-ffunction-sections` ile kullanıldığında bu pattern ile yakalanır. Bu çok önemli, çünkü `-ffunction-sections` + `-Wl,--gc-sections` kombinasyonu ile çağrılmayan fonksiyonlar bağlama dışı bırakılır.
- `*(.rodata*)`: salt-okunur sabitler. `const int table[] = {...}` C kodu burada oturur.
- `*(.glue_7) *(.glue_7t)`: ARM/Thumb interworking için derleyicinin ürettiği geçiş kodu. Modern saf Thumb-2 hedeflerde (Cortex-M) genellikle boştur, ama linker tutarlılığı için yer ayırılır.
- `*(.eh_frame)`: C++ exception unwinding tabloları. Bare-metal projelerde tipik olarak `-fno-exceptions` ile devre dışı bırakılır, ama linker'a hatırlatmak iyi bir alışkanlıktır.
- `KEEP(*(.init))`, `KEEP(*(.fini))`: eski (sysv) constructor/destructor mekanizması. ARM EABI bunun yerine `.init_array` kullanır (aşağıda), ama uyumluluk için yine de tutulurlar.
- `. = ALIGN(4)`: konum sayacı (location counter, `.`) 4 byte sınırına hizalanır. ARM Cortex-M, kodun ve verinin doğal hizalı (aligned) olmasını bekler; aksi takdirde performans veya — bazı erişimlerde — UsageFault olur.
- `_etext = .`: bu satırın yarattığı `_etext` sembolü, `.text` bölümünün bittiği FLASH adresini gösterir. Bu sembol C koduna `extern uint32_t _etext;` olarak ihraç edilir ve startup'taki `.data` kopyalama döngüsünün kaynak adresi olarak kullanılır.

### .ARM ve .init_array — Sessiz Ama Kritik

```ld
.ARM.extab : { *(.ARM.extab*) } > FLASH
.ARM       : {
    __exidx_start = .;
    *(.ARM.exidx*)
    __exidx_end = .;
} > FLASH

.preinit_array :
{
    PROVIDE_HIDDEN (__preinit_array_start = .);
    KEEP (*(.preinit_array*))
    PROVIDE_HIDDEN (__preinit_array_end = .);
} > FLASH

.init_array :
{
    PROVIDE_HIDDEN (__init_array_start = .);
    KEEP (*(SORT(.init_array.*)))
    KEEP (*(.init_array*))
    PROVIDE_HIDDEN (__init_array_end = .);
} > FLASH

.fini_array :
{
    PROVIDE_HIDDEN (__fini_array_start = .);
    KEEP (*(SORT(.fini_array.*)))
    KEEP (*(.fini_array*))
    PROVIDE_HIDDEN (__fini_array_end = .);
} > FLASH
```

`.ARM.exidx`, exception index tablosu; ARM ABI tanımlı. Bare-metal'de C kullanıyor olsanız bile linker birkaç byte üretebilir. `__exidx_start` / `__exidx_end` sembolleri runtime'da gerekirse stack unwinding kütüphanelerinin aradığı sembollerdir.

Asıl ilginç olan `.init_array`. ARM EABI, statik C++ constructor'larını eski `.init` mekanizması yerine `.init_array` ile çalıştırır. Newlib'in `__libc_init_array()` fonksiyonu, linker tarafından üretilen `__init_array_start` ve `__init_array_end` sembolleri arasındaki fonksiyon pointer'larını sırayla çağırır.

`SORT(.init_array.*)` deyimi, GCC'nin `__attribute__((init_priority(N)))` ile farklı önceliklerde constructor'lar üretmesini destekler. Linker, isme göre sıralayarak deterministik bir çalışma sırası garanti eder. `KEEP` burada kritiktir; aksi halde `--gc-sections` constructor pointer dizisini "kullanılmıyor" sayar.

C++ kullanmıyorsanız bile bu bölümlerin tanımlı olması gerekir; aksi halde `__libc_init_array()` tanımsız sembolle linker hatası verir.

### .data — VMA ve LMA Hilesi

İşte linker script'in en sık yanlış anlaşılan kısmı:

```ld
.data :
{
    . = ALIGN(4);
    _sdata = .;
    *(.data*)
    . = ALIGN(4);
    _edata = .;
} > SRAM AT> FLASH

_sidata = LOADADDR(.data);
```

Üç anahtar mekanizma:

1. **`> SRAM`**: bu bölümün **VMA**'sı SRAM'dedir. `_sdata` ve `_edata` sembolleri SRAM adreslerini taşır; C kodu içinde global değişkenler bu adreslerde okunur/yazılır.
2. **`AT> FLASH`**: ama bölümün **LMA**'sı FLASH'tadır. Yani derlenmiş ELF'in load image'inde bu byte'lar FLASH bölgesine yerleştirilir; programlayıcı (flasher) onları FLASH'a yazar.
3. **`_sidata = LOADADDR(.data)`**: `LOADADDR` makrosu, bir bölümün LMA'sını döndürür. `_sidata` sembolü, FLASH'taki load image'in başlangıç adresini taşır. Startup kodu, bu adresten başlayıp `_sdata` ile `_edata` arasındaki SRAM'e byte-byte kopyalama yapar.

Tipik startup kopyalama kodu şuna benzer:

```c
extern uint32_t _sdata, _edata, _sidata;

void Reset_Handler(void) {
    /* .data: FLASH'tan SRAM'e kopyala */
    uint32_t *src = &_sidata;
    uint32_t *dst = &_sdata;
    while (dst < &_edata) {
        *dst++ = *src++;
    }

    /* .bss: sıfırla */
    extern uint32_t _sbss, _ebss;
    dst = &_sbss;
    while (dst < &_ebss) {
        *dst++ = 0;
    }

    SystemInit();
    __libc_init_array();
    main();
    while (1) { }
}
```

Bu kod, derleyicinin "her global değişkenin başlangıç değerini bilir" varsayımını koruyan görünmez sözleşmedir. C standardı şöyle der: `int counter = 42;` yazdığınızda, program `counter`'a ilk okuduğunda 42 görmek zorundadır. Bare-metal'de bunu garanti eden tek mekanizma, FLASH'tan RAM'e kopyalanan bu load image'dir. `.data` kopyalama döngüsünü startup kodundan çıkarmak, `.data` global değişkenlerinizin başlangıç değerini bozar; ve bu hata bazen aylar sonra, RAM'deki "rastgele" geçmiş değerlerden dolayı tutarsız davranış olarak ortaya çıkar.

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
} > SRAM
```

`.bss`, başlangıç değeri sıfır olan veya hiç başlatılmamış global / static değişkenleri tutar. ELF'te bu bölüm `NOBITS` tipindedir: load image'de **yer tutmaz**, sadece linker `_sbss`–`_ebss` boyutunu kaydeder. Startup kodu bu aralığı sıfırlar. Bu yüzden FLASH boyutu hesabına `.bss` girmez; ama RAM boyutu hesabına girer.

`*(COMMON)` deyimi, eski K&R C ve bazı yabancı derleyicilerin `extern` tanımlamadan global değişken bildirimi yapmasından miras kalan bir konvansiyondur. Modern projede neredeyse hiç doluymaz; ama linker script'lerde alışkanlık olarak yer alır.

### Heap ve Stack

```ld
._user_heap_stack :
{
    . = ALIGN(8);
    PROVIDE ( end = . );
    PROVIDE ( _end = . );
    . = . + _Min_Heap_Size;
    . = . + _Min_Stack_Size;
    . = ALIGN(8);
} > SRAM
```

Burada `_Min_Heap_Size` ve `_Min_Stack_Size` script'in başında veya komut satırından (`-Wl,--defsym=_Min_Stack_Size=0x800`) verilen sembollerdir. Konum sayacını bu kadar artırmak, linker'a bu kadar RAM yerinin **kullanılmış sayılmasını** söyler. Eğer `.data + .bss + heap + stack` toplamı SRAM uzunluğunu aşarsa linker bağlama hatası verir.

`end` sembolü ise newlib'in `_sbrk()` syscall implementasyonu tarafından heap başlangıcı olarak kullanılır.

Stack pointer ise script sonunda şöyle tanımlanır:

```ld
_estack = ORIGIN(SRAM) + LENGTH(SRAM);
```

Bu sembol vector table'ın 0. girişine yazılır; CPU resetinde MSP buradan yüklenir. Stack RAM'in en üstünden başlayıp aşağı doğru büyür (full descending), heap ise aşağıdan yukarı doğru. İkisi ortada çakışırsa stack overflow yaşarsınız — ARM Cortex-M7 ve M33'te MPU + stack limit register (PSPLIM/MSPLIM) ile bunu donanım seviyesinde yakalamak mümkündür.

---

## Map Dosyası Analizi — Gerçekten Ne Çıktı?

Linker'a `-Wl,-Map=output.map` parametresi verdiğinizde, `arm-none-eabi-ld` insan tarafından okunabilir bir bağlama raporu üretir. Tipik bir map dosyasında şu bölümler vardır:

- **Archive member included to satisfy reference**: hangi `.o` veya `.a` dosyalarının neden bağlandığı.
- **Discarded input sections**: `--gc-sections` ile elenen ölü kod.
- **Memory Configuration**: MEMORY bloğundan gelen bölgelerin özeti.
- **Linker script and memory map**: her çıktı bölümünün, girdi bölümlerinin, sembollerin adres ve boyut dökümü.

Örnek bir parça:

```text
.isr_vector     0x0000000008000000      0x190
                0x0000000008000000                . = ALIGN (0x4)
 *(.isr_vector)
 .isr_vector    0x0000000008000000      0x190 build/startup_stm32f407xx.o
                0x0000000008000000                g_pfnVectors

.text           0x0000000008000190     0x4ae0
 *(.text*)
 .text.HAL_Init
                0x0000000008000190       0xa8 build/stm32f4xx_hal.o
 .text.main
                0x0000000008000238       0x44 build/main.o
 ...
                0x000000000800482a                _etext = .

.data           0x0000000020000000       0x4c load address 0x0000000008004830
                0x0000000020000000                _sdata = .
 *(.data*)
 .data.SystemCoreClock
                0x0000000020000000        0x4 build/stm32f4xx_hal.o
                0x0000000020000004                SystemCoreClock
 ...
                0x000000002000004c                _edata = .
                0x0000000008004830                _sidata = LOADADDR (.data)

.bss            0x000000002000004c      0x9b8
                0x000000002000004c                _sbss = .
                0x000000002000004c                __bss_start__ = _sbss
 ...
                0x0000000020000a04                _ebss = .
```

Burada doğrulanması gereken üç şey vardır:

1. **`.isr_vector` 0x08000000'da mı?** Evet. Reset davranışı için zorunlu.
2. **`.data`'nın VMA'sı 0x20000000, LMA'sı 0x08004830 mu?** Evet — `load address 0x...` satırı LMA'yı gösteriyor. Yani 0x4c byte'lık başlangıç verisi FLASH'ta `_etext`'in hemen ardına yazılmış.
3. **`_sidata = LOADADDR(.data)` 0x08004830'a çözümlenmiş mi?** Evet. Startup kodu bu adresten okumaya başlayacak.

Bu üç doğrulamayı her yeni bare-metal projede yapmak — özellikle bootloader / uygulama ayrımı, dual-bank FLASH veya iki ayrı SRAM bölgesi söz konusuysa — gözle görülür miktarda zaman kazandırır. Map dosyası, üretiminin ucuz olmasına rağmen genellikle yeterince incelenmez.

`objdump` ile ek bir çapraz kontrol:

```bash
$ arm-none-eabi-objdump -h build/firmware.elf

Idx Name          Size      VMA       LMA       File off  Algn
  0 .isr_vector   00000190  08000000  08000000  00010000  2**0
  1 .text         00004aa0  08000190  08000190  00010190  2**3
  2 .rodata       000003a8  08004c30  08004c30  00014c30  2**3
  3 .ARM          00000008  08004fd8  08004fd8  00014fd8  2**2
  4 .init_array   00000004  08004fe0  08004fe0  00014fe0  2**2
  5 .fini_array   00000004  08004fe4  08004fe4  00014fe4  2**2
  6 .data         0000004c  20000000  08004fe8  00020000  2**3
  7 .bss          000009b8  2000004c  2000004c  00020004  2**2
```

`.data` satırındaki VMA ≠ LMA, linker script'in işini doğru yaptığının asıl kanıtıdır.

---

## Yaygın Tuzaklar

### 1. KEEP unutulması ve `--gc-sections`

`-Wl,--gc-sections` ile birlikte kullanıldığında, vector table veya `.init_array` `KEEP` olmadan bağlamadan tamamen silinebilir. Sonuç: cihaz reset attığında 0x0000_0004'ten okuduğu adres geçersizdir; HardFault. Bu hatayı oscilloskop ve debugger ile yakalamak günlerce sürebilir.

### 2. `.data` LMA ile FLASH boyutu çakışması

`firmware.bin` veya `firmware.hex` üretirken `objcopy` LMA'yı temel alır. `.text + .rodata + .data(LMA)` toplamının FLASH'a sığması gerekir. Bunu bir görüntü boyutu kontrolü ile (örn. `arm-none-eabi-size firmware.elf`) build sırasında her zaman doğrulayın. `--print-memory-usage` flag'i de linker'dan canlı bir özet verir.

### 3. Alignment hatası

Linker `.data` bölümünü 4 byte hizasında üretir, ama startup kopyalama döngüsü `uint32_t *` üzerinden yürür. `_sdata` ve `_edata`'nın 4'e bölünebilir adreslerde olduğunu garanti etmek için `. = ALIGN(4)` zorunludur; aksi takdirde son iterasyonda 2 byte fazladan yazıp `.bss`'in başını bozarsınız. Cortex-M0 ve M0+'ta yanlış hizalı 32-bit erişim ayrıca HardFault doğurur.

### 4. Constructor'ların çalıştırılmaması

Eğer startup kodu `__libc_init_array()` çağrılmıyorsa veya linker script `.init_array` bölümünü ihtiyacı olduğu sembollerle (`__init_array_start`, `__init_array_end`) ihraç etmiyorsa, C++ global nesnelerin constructor'ları çalıştırılmaz. Sonuç: `static MyClass obj;` ile yazdığınız sınıfın iç durumu (state) tamamen tanımsızdır. Çoğu zaman bu hata "obje sıfırlanmış görünüyor ama metodlar çağrılınca null pointer dereference" olarak ortaya çıkar.

### 5. Heap büyümesi ile stack çakışması

Klasik bir hata: dinamik tahsis (örn. `malloc`) ile heap RAM'in ortasına doğru büyürken, derin özyinelemeli bir fonksiyon stack'i aşağıya iter; ikisi ortada çakışır. Yığın taşmasını (stack overflow) erken yakalamak için:

- Cortex-M7 / M33 / M55 için **MSPLIM** ve **PSPLIM** stack limit register'larını kullanın.
- Veya MPU ile stack alanının altına bir koruyucu (guard) bölge tanımlayın.
- Veya statik analiz (örn. `gcc -fstack-usage` + bir post-process script) ile maksimum stack derinliğini çıkarın.

Linker script'in `_estack` ve heap/stack region tanımı, bu denetimlerin temelidir.

---

## Pratik Tavsiyeler

Çok yıllık saha deneyiminden çıkardığım bazı kısa kurallar:

- **Linker script'i sürüm kontrolüne alın.** CubeMX gibi araçların ürettiği script'i kontrolsüz biçimde yeniden ürettirirseniz, elinizle yaptığınız özelleştirmeler — bootloader entegrasyonu, özel section'lar, ENVM kullanımı — bir buton tıklamasıyla silinir.
- **`--print-memory-usage` veya `arm-none-eabi-size` çıktısını CI'a sokun.** FLASH ve SRAM kullanım yüzdelerinin yüksek olduğunda erken uyarı veren bir kontrol, sahada "image FLASH'a sığmadı" sürprizini önler.
- **`KEEP` listesine `.isr_vector`, `.init_array`, `.fini_array`, `.preinit_array`'ı her zaman koyun.**
- **Her custom section için `__section_start__` ve `__section_end__` sembolü ihraç edin.** Sonradan bir runtime check (örn. CRC) yazmak istediğinizde bu sembollere ihtiyacınız olur.
- **Map dosyasını release notlarına ekleyin.** Bir sürümde "şu RAM'in 4 byte fazlasının nereden geldiği" sorusu sahaya çıktıktan sonra cevaplanması gereken bir soru oluyor; geçmiş map dosyaları diff almak için altın değerindedir.
- **Dual-bank FLASH'lı parçalarda iki ayrı bölge tanımlayın.** Tek bir mantıksal FLASH gibi davranmak A/B sürüm geçişlerini imkânsız hale getirir.

---

## Sonuç

Linker script, bare-metal ARM firmware'ının görünmez omurgasıdır. Reset anında CPU'nun nereden başlayacağını, global değişkenlerin değerini nereden aldığını, constructor'ların hangi sırayla çalışacağını, heap'in ne kadar büyüyebileceğini hep bu dosya belirler. Onu bir kutusu içinde anlamadan kullanmak mümkün; ama hata ayıklarken oradan dönerken, kara kutudan parlak bir el feneri çıkmasını ummak iyimserliktir.

Bu yazıda satır satır gezdiğimiz `.ld` dosyası, gerçek bir Cortex-M4 STM32F4 projesindeki tipik yapıdan damıtıldı. CMSIS şablonlarındaki, STM32CubeIDE'nin ürettiklerindeki ve Zephyr / NuttX gibi RTOS'ların kendi linker script'lerindeki temel yapı taşları aynıdır; isim farkları, attribute kullanımı ve özel section yapıları değişir. Bir kez bu temel yapıyı sindirdikten sonra, hangi araç hangi script'i üretirse üretsin, ne yapıldığını rahatlıkla okuyabilirsiniz.

Bir sonraki adım olarak şu üç egzersizi öneririm: (1) bir Cortex-M4 projesinde derleme sonrası `objdump -h` çıktısı ile script'inizi karşılaştırın; (2) `.bss`'i tekrar başlatma sırasını başlangıç kodunda iptal edin ve bir global int değişkenin değerini gözlemleyin (rastgele olmalı); (3) `.data` kopyalama döngüsünü kaldırın ve `int counter = 42;` ile başlattığınız bir global değişkenin ilk değerini RTT veya UART ile yazdırın — büyük olasılıkla 42 olmayacaktır.

Linker, sessizdir; ama yaptığı işten haberdar olmadığınızda, sürpriz yapar.

---

## Kaynaklar

- [GNU LD (binutils) Documentation — Linker Scripts](https://sourceware.org/binutils/docs/ld/Scripts.html)
- [System V Application Binary Interface — Generic ABI](https://refspecs.linuxfoundation.org/elf/gabi4+/contents.html)
- [ARM Cortex-M4 Generic User Guide — Vector Table (ARM DUI 0553)](https://developer.arm.com/documentation/dui0553/latest/)
- [ARM v7-M Architecture Reference Manual (ARM DDI 0403)](https://developer.arm.com/documentation/ddi0403/latest/)
- [Newlib Source — `libc/misc/init.c` (`__libc_init_array` implementation)](https://sourceware.org/newlib/)
- [Embedded Artistry — Exploring Startup Implementations: Newlib (ARM)](https://embeddedartistry.com/blog/2019/04/17/exploring-startup-implementations-newlib-arm/)
- [Interrupt by Memfault — From Zero to main(): Demystifying Firmware Linker Scripts](https://interrupt.memfault.com/blog/how-to-write-linker-scripts-for-firmware)
- [Stargirl (Thea) Flowers — The Most Thoroughly Commented Linker Script](https://blog.thea.codes/the-most-thoroughly-commented-linker-script/)
- [ARM EABI — Run-time ABI for the ARM Architecture (IHI 0043)](https://developer.arm.com/documentation/ihi0043/latest/)
- [CMSIS-Core (M) Reference Implementation](https://arm-software.github.io/CMSIS_6/latest/Core/index.html)

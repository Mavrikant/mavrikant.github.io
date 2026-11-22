---
# SUPERSEDED — 2026-06-25
# Bu taslak yazılmıştı ancak Faz 6 (Eleştirmen) PR #119 ile birebir konu çakışması
# tespit etti: "DMA ve Cache — Cortex-A9 / Zynq-7000 üzerinde sessiz veri bozulması".
# Yayınlanmayacak. İçerik referans amaçlı saklanıyor.
title: "[SUPERSEDED] DMA ve Önbellek Uyumluluğu: ARM Cortex-A'da Görünmez Bug'ın Anatomisi"
subtitle: "DMA and Cache Coherency: Anatomy of an Invisible Bug on ARM Cortex-A"
background: "/img/posts/6.webp"
date: '2026-06-26 09:00:00'
layout: post
lang: tr
mermaid: true
---

Gömülü sistem mühendisinin kariyerinde en az bir kez başına gelen bir hata sınıfı vardır: kod laboratuvarda çalışır, JTAG bağlıyken çalışır, debug build'de çalışır, ama release build'de — özellikle yüksek veri yükü altında — periferik garip baytlar üretmeye başlar. Logic analyzer'da DMA tarafı doğru görünür; CPU tarafında okunan değer ise yanlıştır. printf eklersiniz, hata yok olur. Çıkarırsınız, geri gelir. Optimizasyon seviyesini düşürürsünüz, hata sessizleşir.

Bu klasik "Heisenbug"un kaynağı çoğu zaman tek bir gerçektir: **CPU önbelleği ve DMA aynı belleğe farklı zamanlarda, farklı görünümlerle bakmaktadır.** Bu yazı, ARM Cortex-A sınıfı bir SoC üzerinde DMA ile veri taşırken neyin yanlış gidebileceğini, neden gittiğini ve mühendislik olarak doğru yapma yollarını anlatıyor. Bu konu kötü ünlü bir biçimde dağınık dokümante edilmiştir; mimari kılavuzlar bir cephesini, RTOS kaynakları başka bir cephesini, çekirdek dokümanları üçüncü bir cephesini anlatır. Aşağıda hepsini tek bir mühendislik anlatısında birleştirmeye çalışıyorum.

---

## Neden bir sorun var?

Modern bir Cortex-A çekirdeği veriye doğrudan DRAM'den erişmez. Veri yolu üzerinde L1 D-cache (tipik 32 KB), L2 cache (256 KB–2 MB) ve bazen L3 oturur. CPU bir adrese yazdığında, varsayılan write-back politikasında değişiklik **dirty** olarak işaretlenen cache line'da kalır; DRAM'a ne zaman ineceği önbellek değiştirme (eviction) ya da explicit clean ile belirlenir.

DMA controller ise — istisnalar dışında — bu cache hiyerarşisini görmez. DMA için DRAM gerçek bellektir. CPU için DRAM, cache satırlarının ileri-geri taşındığı bir arka depodur. İki tarafın aynı adres için farklı değer gördüğü pencere işte burada açılır.

İki yönlü iki ayrı problem doğar:

- **CPU → periferik (DMA okur):** CPU yazıyor, cache'te dirty. CPU clean yapmadan DMA tetikleniyor. Periferik DRAM'dan **eski veriyi** alıyor.
- **Periferik → CPU (DMA yazar):** DMA DRAM'a yazıyor. CPU'nun cache'inde aynı adres için *temiz ama eski* bir kopya hâlâ duruyor. Cache invalidate edilmediği için CPU okurken cache hit oluyor ve **eski veriyi** alıyor.

Her iki durumun da ortak özelliği şu: işlemler **doğru çalışmış** gibi görünür — kimse "hata" üretmez. Pointer geçerlidir, DMA tamamlandı bayrağı kalkar, CPU okuma yapar, sonuç tutarsızdır.

---

## Bug'ın "görünmez" olma nedeni

Bu sınıf hatanın canınızı sıkması sadece sebebinden değil, davranışından da gelir:

1. **Tampon küçükken olmaz.** Küçük yazılar cache içinde kalır; DRAM ile farklılık asla görünmez çünkü kimse DRAM'a bakmaz. Tampon eviction tetikleyecek kadar büyüdüğünde sahne değişir.
2. **D-cache kapalıyken olmaz.** Çoğu bootloader cache'i pasif başlatır; "küçük bir programda her şey çalışıyordu, OS yüklenince bozuldu" hikayesi buradan çıkar.
3. **printf eklenince yok olur.** UART driver'ı kendi içinde memory bariyerleri ve cache trafiği üretir; problem penceresini istemeden kapatır.
4. **Build optimizasyonuna duyarlı.** Derleyici loop unrolling, scalar replacement, register coalescing yaparak cache footprint'ini değiştirir; aynı kod farklı bir cache durumunda çalışır.
5. **Yüzde 100 tekrar etmez.** Hatanın tetiklenmesi, transfer sırasında diğer kodun cache'i nasıl doldurduğuna bağlıdır. CI'da intermittent olarak görünür.

Eğer testte böyle bir desen görüyorsanız, hipotez listenizin tepesine "cache coherency" yazın.

---

## Akış üzerinden hatanın anatomisi

Aşağıdaki diyagram, en sık görülen **periferik → CPU** senaryosunu gösteriyor. CPU önce tamponu bir kez okumuş (cache'e geldi), sonra DMA aynı tampona yazıyor:

<div class="mermaid">
sequenceDiagram
    participant CPU
    participant DCache as D-Cache
    participant DRAM
    participant DMA as DMA Engine
    participant Periferik

    Note over CPU,Periferik: T1 — tampon ön ısınma
    CPU->>DCache: read buf[0..63]
    DCache->>DRAM: line miss, fetch
    DRAM-->>DCache: 0xAA bytes

    Note over CPU,Periferik: T2 — DMA tetikleniyor
    CPU->>DMA: start(src=periferik, dst=buf, len=64)
    DMA->>Periferik: read
    Periferik-->>DMA: 0xBB bytes
    DMA->>DRAM: write buf (0xBB)
    DMA-->>CPU: complete IRQ

    Note over CPU,Periferik: T3 — CPU okuma — HATA
    CPU->>DCache: read buf[0]
    DCache-->>CPU: 0xAA (stale!)
</div>

T3'te CPU 0xBB beklerken 0xAA okur. DMA gerçekten 0xBB yazmıştır; cache satırı hâlâ "geçerli" ve T1'deki içeriğiyle eşleştiği için CPU DRAM'a bakmaz. Logic analyzer'da DMA'nın doğru yazdığını teyit edersiniz; hata yine de durur. Çözüm tek bir komuttur: IRQ tamamlandıktan sonra, CPU okumadan önce cache satırını invalidate etmek.

---

## Cache bakım komutları: clean, invalidate, clean+invalidate

ARMv8-A'da temelde üç tür veri-cache bakım komutu vardır. Hangisinin gerekli olduğu, akış yönüne göre değişir:

| Komut (AArch64) | Anlamı | Ne zaman? |
|---|---|---|
| `DC CVAC` | Clean by VA to Point of Coherency | CPU yazdı, DMA okuyacak |
| `DC IVAC` | Invalidate by VA to PoC | DMA yazdı, CPU okuyacak (yalnız) |
| `DC CIVAC` | Clean + Invalidate by VA to PoC | İki yönlü/karmaşık durum |

**Point of Coherency (PoC)** kritik bir kavramdır. PoC, sistemdeki tüm gözlemcilerin (CPU'lar, DMA, GPU) ortak gördüğü noktadır — pratik olarak DRAM ya da paylaşılan son seviye buffer. PoU (Point of Unification) ise yalnızca aynı CPU'nun talimat ve veri yolları arasında ortak görünümdür. DMA için PoC gerekir, PoU yetmez. Bunu karıştırmak — kod görünüşte doğru, davranış tutarsız — yine bir Heisenbug üretir.

Bakım komutlarının ardından bir **`DSB`** zorunludur. `DC CVAC` komutu issue edilir ve hemen geri döner; bakımın gerçekten tamamlanması için pipeline'ın boşalmasını DSB sağlar. DSB olmadan, takip eden DMA tetik yazması cache bakımı henüz bitmemişken gerçekleşebilir.

AArch64 inline assembly olarak bir veri-cache clean'inin minimal hâli:

```c
static inline void clean_dcache_range(void *addr, size_t size)
{
    uintptr_t start = (uintptr_t)addr;
    uintptr_t end   = start + size;
    size_t line     = arm_dcache_line_size(); /* CTR_EL0'den */

    start &= ~(line - 1);
    for (uintptr_t p = start; p < end; p += line) {
        asm volatile ("dc cvac, %0" :: "r" (p) : "memory");
    }
    asm volatile ("dsb sy" ::: "memory");
}
```

`memory` clobber'ı derleyiciye "bu satırın etrafında bellek erişim yeniden sıralaması yapma" der; assembly'nin etkisinden bağımsız olarak gereklidir.

---

## Bariyerler: DMB vs DSB vs ISB

Üç farklı bariyer vardır ve birbirine karıştırılması sık görülen bir hatadır:

- **`DMB`** *yalnızca bellek erişim sırasını* zorlar. Bariyerin önceki erişimleri, sonraki erişimlerden önce görünür hâle gelir. Ama erişimlerin *bittiğini* garanti etmez.
- **`DSB`** çok daha katıdır: bekleyen tüm bellek erişimleri, cache/TLB/branch predictor bakım komutları **bitmiş** olur. Cache bakımının fiilen tamamlandığını teyit etmek için DSB şarttır.
- **`ISB`** pipeline'ı boşaltır. Yalnızca sistem yazmacı değişimi, MMU on/off, ASID değişimi gibi *talimat akışını ilgilendiren* değişikliklerden sonra anlam taşır. DMA için ISB'ye nadiren ihtiyaç olur.

Driver yazarken pratik kural: **cache bakımı + DSB + (sonra) tetik yazması.** Tetiği DSB'den önce yazarsanız, periferik henüz koheran olmayan veriyi okumaya başlayabilir.

---

## Cache line hizalaması — sessiz veri kaybı

Bakım komutları cache line *granularity* ile çalışır; bir byte'ı temizleyemezsiniz, tüm satırı temizlersiniz. Cortex-A53/A72/A78 ailesinde line genellikle 64 byte, Cortex-M7'de 32 byte, Apple M-serisinde 128 byte. Bunu sabit varsaymak yerine **çalışma anında CTR_EL0** yazmacından okumak doğru olandır (toolchain kütüphaneleri zaten yapar).

Asıl tuzak burada başlar: DMA tamponunuz cache line'a hizalı değilse, başlangıç ve bitiş satırlarında *tamponunuza ait olmayan veri* bulunur. Eğer tamponu invalidate ederseniz, **bitişikteki değişkenleri de yok edersiniz**. Eğer clean yaparsanız, bitişikteki — belki başka thread'in yazdığı — veriyi DRAM'a basarsınız ve klasik bir race condition kurarsınız.

Somut bir örnek: 100 byte'lık bir DMA tamponu, adresi 0x4000_0010, line boyutu 64 byte olsun. Tampon iki cache line'a yayılır: 0x4000_0000–0x4000_003F ve 0x4000_0040–0x4000_007F. İlk satırın ilk 16 byte'ı (0x00–0x0F) tampona ait *değildir* — başka bir yapı, belki bir mutex bayrağı, belki bir başka yapının kuyruk indeksi. Eğer DMA bittikten sonra naive bir invalidate döngüsü çalıştırırsanız, o 16 byte'ı da yok eder, bayrağı sıfırlarsınız, ve günlerce sürecek bir hata avına başlarsınız.

Bunun **tek doğru çözümü** DMA için ayrılan tüm tamponları cache line'a hizalı tahsis etmek ve boyutunu line'ın katı tutmaktır:

```c
#define DMA_LINE  64

typedef struct {
    uint8_t data[256];
} __attribute__((aligned(DMA_LINE))) dma_buf_t;

static dma_buf_t buf;       /* 64-byte aligned, 256 byte = 4 line */
```

GCC `aligned` öznitelikleri statik bellek için yeterlidir. Dinamik tahsiste `posix_memalign` veya `aligned_alloc` (C11), bare-metal'de özel allocator gerekir; standart `malloc` cache line hizası vermez.

CMSIS bu konuda `__ALIGNED(...)` makrosunu sağlar; Linux çekirdeğinde `__cacheline_aligned` aynı işi yapar. Yapının **sonu** da line katı olmalı — bunu sağlamanın temiz yolu yapı boyutunu padding ile yuvarlamaktır.

---

## Linux dünyasında: `dma_alloc_coherent` vs streaming

Linux çekirdeği bu sorunu iki seçenek sunarak yönetir:

- **`dma_alloc_coherent`** non-cacheable bir bellek bölgesinden tahsis eder. Cache zaten devre dışı olduğu için bakım gerekmez; sürekli kullanılan, küçük yapılar (DMA descriptor halkaları) için idealdir. Bedeli: erişim DRAM hızındadır, cache hit yoktur.
- **`dma_map_single` / `dma_unmap_single`** streaming yaklaşımıdır. Normal cache'li belleği DMA için "hazırlar" — yön bilgisine göre çekirdek doğru cache bakımını yapar. `DMA_TO_DEVICE`'da clean, `DMA_FROM_DEVICE`'da invalidate (gerekirse map sırasında da clean, çünkü line bütünüyle invalidate edilecek), `DMA_BIDIRECTIONAL`'de her ikisi. Sürekli kullanılan büyük payload'lar için doğru seçimdir.

Yön parametresini doğru vermek tek başına bir disiplindir; `DMA_FROM_DEVICE` yerine `DMA_TO_DEVICE` yazmak hatayı sessizleştirir ama altta yine cache stale'i bırakır. Driver review'larında en çok tartışılan satırlardan biridir.

---

## "Coherent donanım var, niye uğraşıyoruz?"

Cortex-A9'dan itibaren ARM, **Accelerator Coherency Port (ACP)** adında bir çözüm sunar: SCU (Snoop Control Unit) üzerinden bir AXI slave port, DMA veya FPGA hızlandırıcısının doğrudan CPU cache hiyerarşisi ile koheran konuşmasını sağlar. ACP üzerinden okuma yapan bir DMA, dirty olan satırı CPU'dan snoop eder; CPU clean yapmak zorunda değildir. Aynı şekilde ACP yazması CPU cache'ini invalidate eder.

Zynq-7000 ve Zynq UltraScale+ MPSoC'de ACP / ACE / ACE-Lite portları PL (Programmable Logic) tarafından PS (Processing System) belleğine koheran erişim için kullanılır. ACE iki yönlü cache↔cache coherency sağlar; ACE-Lite tek yönlüdür (device → cache snoop var, cache → device snoop yok). Tam coherency istiyorsanız ACE şart.

Donanım coherency varken cache bakımı yapmak hem gereksiz hem performans kaybıdır. Ama iki tuzak unutulmamalı:

1. **ACP genellikle dar bant genişliğine sahiptir.** Yüksek throughput'lu DMA için (örneğin video framebuffer) HP portlar tercih edilir; o portlar coherent **değildir** ve bakım gerektirir.
2. **Bariyerler hâlâ gerekir.** Cache coherency, *aynı veri için* tutarlılığı çözer. Sıralama (önce buffer'ı yaz, sonra "hazır" bayrağını kaldır) hâlâ DMB/DSB ister.

---

## Doğru sıra ile yanlış sıra

İki klasik akışı yan yana yazmak en aydınlatıcısı:

**Yanlış (CPU → DMA):**
```
1. CPU buffer'a veri yazar           // cache'te dirty
2. CPU DMA tetik yazar               // periferik DRAM'dan okur
3. Periferik eski veriyi alır        // çünkü clean yapılmadı
```

**Doğru:**
```
1. CPU buffer'a veri yazar
2. DC CVAC (buffer)                  // cache → DRAM
3. DSB SY                            // bakım fiilen bitsin
4. CPU DMA tetik yazar               // güvenli
```

**Yanlış (DMA → CPU):**
```
1. CPU DMA başlat                    // CPU bekler / IRQ
2. DMA tamamlandı IRQ                // ama cache'te eski veri var
3. CPU buffer'ı okur                 // cache hit → eski veri
```

**Doğru:**
```
1. CPU DMA başlat
2. DMA tamamlandı IRQ
3. DC IVAC (buffer)                  // veya CIVAC
4. DSB SY
5. CPU buffer'ı okur                 // DRAM'dan çekilir
```

Görünüşte iki ekstra satır; pratikte günlerce süren bir bug avının panzehiri.

---

## Test edilebilirlik ve doğrulama

Cache coherency bug'ları en kötü ihtimalle üretimde, en iyi ihtimalle CI'da sıçramalı olarak çıkar. Aşağıdaki üç önlem hayat kurtarır:

- **Cache'i kasıtlı kirlet.** Test fixture'larında DMA başlatmadan önce buffer'ı CPU üzerinden okuyup yazın; cache durumunu garanti hale getirin. Bug deterministik hâle gelir.
- **Bakım fonksiyonlarını mock'layın.** Gerçek donanımda değil, host taraf testlerde clean/invalidate sayaçlarıyla doğru sırayı yakalayın.
- **Statik analiz kurallarını sıkıştırın.** DMA tampon tipleri için aligned attribute zorunlu hâle getirilebilir; review'da yakalamak yerine derleyiciye yakalatın.

Renode benzeri simülatörler bir noktaya kadar yardımcı olur; ama gerçek cache modelinin tam doğrulukla simüle edilmesi nadirdir — gerçek donanımda kasıtlı stres testi (`memset` patterns, throughput burst) yerini tutmaz.

---

## Pratik mühendislik tavsiyeleri

- DMA tamponlarını **her zaman** cache line'a hizalı tahsis edin, boyutu line katı tutun. İstisna sadece donanım coherent yoldur (ACP/ACE).
- Cache line boyutunu sabit gömmeyin; CTR_EL0'den (veya CMSIS makrosundan) okuyun. Aynı kod farklı çekirdeklerde sessizce bozulmasın.
- Bakım komutundan sonra `DSB SY` yazmayı disiplinleştirin. "Çoğu zaman çalışıyor" kabul edilebilir bir gerekçe değil.
- DMA descriptor halkaları için `dma_alloc_coherent` benzeri non-cacheable yol tercih edin; payload için streaming + bakım. İki dünyayı karıştırmak okumayı zorlaştırır.
- Coherent port kullanıyorsanız bunu yorum satırı değil **tip sistemi** ile belirtin. Tampon `coherent_buf_t` ise asla bakım çağrılmasın; `streaming_buf_t` ise compile-time zorunlu olsun.
- Driver review'da iki satır arayın: tetik yazmadan önce DSB var mı, IRQ sonrası invalidate var mı. Yokları soru olarak işaretleyin.
- Code coverage'a ek olarak "cache-coherency coverage" düşünün: clean/invalidate çağrılarını sayan ve beklenen sırayı doğrulayan ayrı bir izleme katmanı.

---

## Sonuç

Cache + DMA bug'ları gömülü sistemlerde "sahada keşfedilen" hataların büyük çoğunluğunu oluşturur. Sebep tek bir komutun unutulması, sonuç günlerce sürecek bir Heisenbug avı. İyi haber: matematik temiz, kurallar dar, ve doğru disiplini bir kez kurduğunuzda problem kendini tekrar üretmez. Tek satırlık bir kuralı yazıyla kapatayım: **cache bakımını, bariyeri ve hizalamayı borç olarak değil, DMA'nın doğal maliyeti olarak tasarlayın.**

---

## Kaynaklar

- ARM Architecture Reference Manual for A-profile architecture — DC, DSB, DMB, ISB tanımları. <https://developer.arm.com/documentation/ddi0487/latest>
- ARM Cortex-A Series Programmer's Guide (DEN0013) — Bölüm "Cache coherency". <https://developer.arm.com/documentation/den0013/latest>
- ARM Cortex-R Series (Armv7-R) Programmer's Guide (DEN0042) — Memory ordering ve cache coherency. <https://developer.arm.com/documentation/den0042/latest>
- ARM Learn — Memory Systems, Ordering, and Barriers. <https://learn.arm.com/learning-paths/cross-platform/memory-latency/>
- Microchip TB3195 — Managing Cache Coherency on Cortex-M7 Based MCUs. <https://ww1.microchip.com/downloads/en/DeviceDoc/Managing-Cache-Coherency-on-Cortex-M7-Based-MCUs-DS90003195A.pdf>
- Microchip TB3295 — Handling Cache Coherency Issues at Runtime. <https://ww1.microchip.com/downloads/en/DeviceDoc/Handling_Cache_Coherency_Issues_at_Runtime_Using_Cache_Maintenance_Operations_on_Cortex-M7_DS90003295A.pdf>
- Xilinx Wiki — Zynq UltraScale+ MPSoC Cache Coherency. <https://xilinx-wiki.atlassian.net/wiki/spaces/A/pages/18842098/Zynq+UltraScale+MPSoC+Cache+Coherency>
- ARM Developer — Accelerator Coherency Port. <https://developer.arm.com/documentation/ddi0434/c/snoop-control-unit/about-the-scu/accelerator-coherency-port>
- Linux Kernel — Dynamic DMA Mapping Guide. <https://www.kernel.org/doc/Documentation/DMA-API-HOWTO.txt>
- Zephyr Project — DMA and Data Cache Coherency on ARM M7 (issue #36471). <https://github.com/zephyrproject-rtos/zephyr/issues/36471>
- Performance exploration of the Accelerator Coherency Port using Xilinx Zynq (Embedded.com). <https://www.embedded.com/performance-exploration-of-the-accelerator-coherency-port-using-xilinx-zynq/>

---
title: "DMA ve Cache: ARM Cortex-A9 Üzerinde Sessizce Eskimiş Veri Hatasının Anatomisi"
subtitle: "DMA Cache Coherency on ARM Cortex-A9: Anatomy of a Stale-Data Bug on Zynq-7000"
background: "/img/posts/3.webp"
date: '2026-06-07 09:00:00'
layout: post
lang: tr
mermaid: true
---

Sahnenin ortasından başlayalım: Zynq-7000 üzerinde Cortex-A9'da çalışan bir bare-metal uygulamamız var. PL (programmable logic) tarafındaki bir ADC, AXI DMA üzerinden DDR'a saniyede 16k örnek yazıyor. CPU, her 4096 örnekte bir devreye giriyor, ring buffer'ın sırada gelen bloğunu okuyor, FIR'dan geçiriyor, sonuçları başka bir buffer'a yazıyor. Hepsi olması gerektiği gibi görünüyor — taa ki haftalar süren bir çıktı incelemesi sırasında sinyalin içine düşmüş, garip "kâğıt parçalarına" benzeyen anomaliler farkedilene kadar. Her blokta birkaç örnek, sanki bir önceki bloktan kalmış gibi. Sürekli değil. Sıcakken daha sık. CPU yükü düşükken kayboluyor.

Bu tür bir hatayı debugger'la kovalamak, mühendislik kariyerinin en sinir bozucu egzersizlerinden biridir. Çünkü hatanın kaynağı kodun *kendisinde* değil; kodun **bellekle nasıl anlaştığında** yatar. Cache görünmez bir tabakadır: doğru çalıştığında onu unutursunuz. Yanlış çalıştığında ise — değişken yazdığınız adresten geri okumadığınız bir dünyaya hoş geldiniz.

Bu yazıda Cortex-A9'da DMA ile CPU arasındaki cache coherency problemini somut biçimde ele alacağız. Önce donanım manzarasını çıkaracak, sonra cache maintenance dilbilgisini öğrenecek, ardından bir gerçek dünya hatasını yeniden üretecek ve birkaç tane standart "düzelttim sandım ama daha kötü ettim" tuzağına düşeceğiz. Sonunda hangi durumda hangi çözümün doğru olduğunu somut bir karar tablosuna oturtacağız.

Yazı Zynq-7000 odaklı; ama anlatılan ilkeler Cortex-A9 / Cortex-A7 sınıfındaki tüm SoC'lerde, kısmen de Cortex-R5 ve Cortex-M7 üzerinde geçerli. Linux yazıyorsanız çoğunu kernel sizin için yapıyor; bare-metal veya RTOS dünyasında ise her satırı kendiniz yazmak zorundasınız.

---

## Donanım Manzarası: Kim Hangi Belleği Görüyor?

Cortex-A9'un Zynq-7000'deki bellek hiyerarşisi sandığınızdan kalabalık. Şunları aklınızda tutmak zorundasınız:

- **L1 veri cache (D-cache):** Her çekirdek için 32 KB, 4-way set associative, **32-byte line**, write-back / write-allocate (varsayılan).
- **SCU (Snoop Control Unit):** İki Cortex-A9 çekirdeği arasındaki cache satırlarını koherent tutar. SCU **çekirdekler arası** koherensten sorumludur, çekirdek-DMA arasından değil.
- **L2 cache (PL310 / L2C-310):** 512 KB, 8-way (Zynq-7000 konfigürasyonu), **32-byte line**.
- **DDR3 kontrolcüsü:** Asıl belleğin durduğu yer.
- **AXI interconnect:** CPU, DMA, PL, OCM arasındaki yolu kuran fabric.
- **ACP (Accelerator Coherency Port):** Cortex-A9 SCU'sundan PL'ye uzanan ve donanım-koherent bir yol sunan ayrı bir port (bunu sonra konuşacağız).

DMA'nın "manzarayı" nasıl gördüğü, hangi yoldan geçtiğine bağlıdır. Tipik bir AXI DMA bare-metal uygulamada — özellikle de Xilinx'in AXI DMA IP'sini varsayılan ayarlarıyla kullanıyorsanız — **DMA, DDR'a doğrudan AXI üzerinden gider, hiçbir cache'i ne görür ne haberdar olur.** Yani:

- CPU bir değişkene yazdığında, değer önce L1 D-cache'e (write-back) yazılır. DDR'a *gitmeyebilir.*
- DMA o adresi okuduğunda, doğrudan DDR'dan okur. CPU'nun L1'deki yeni değerini **göremez**.
- Tersi de aynı: DMA DDR'a yeni veri yazdığında, CPU L1 cache'ten okumaya devam eder. **Bayat veri** alır.

Bu, tek cümleyle "cache coherency problemi"dir. Çözüm üç ailede toplanır:

1. Belleği baştan **non-cacheable** yap (kolay ama yavaş).
2. Her DMA işleminden önce/sonra cache'i elle **clean** veya **invalidate** et (esnek ama hata-açık).
3. DMA path'ini **donanım-koherent** bir porttan (ACP gibi) geçir (zarif ama bant darı).

Önce ikinci aileyi — yani gerçek hayatta en çok yapılan ve en çok hata çıkaranı — ayrıntılı inceleyelim.

---

## Cache Maintenance Dilbilgisi

ARMv7-A mimarisi, veri cache'ini *bireysel cache satırı düzeyinde* yönetmek için üç işlem tanımlar. Bunları doğrudan inline assembly olarak da yazabilirsiniz; bare-metal'de genellikle Xilinx'in `Xil_DCache*` veya benzeri bir BSP sarmalayıcısı kullanılır. Üçü de "MVA" — yani Modified Virtual Address — varyantıdır; yani sanal adres aralığı verirsiniz, donanım hangi satırların etkileneceğini kendisi bulur.

| Mnemonik    | Anlamı                                   | Ne yapar?                                                                                       |
|-------------|------------------------------------------|-------------------------------------------------------------------------------------------------|
| `DCCMVAC`   | Data Cache Clean by MVA to PoC           | Satırdaki *dirty* veriyi PoC'a (Point of Coherency, yani DDR) yazar; cache'te bırakır.          |
| `DCIMVAC`   | Data Cache Invalidate by MVA to PoC      | Satırı geçersiz kılar; cache'ten atar. Dirty veriyi DDR'a yazmaz, **kaybeder**.                 |
| `DCCIMVAC`  | Data Cache Clean *and* Invalidate by MVA | Önce yazar, sonra geçersiz kılar.                                                                |

Bunların hepsi yalnızca L1 üzerinde iş görür. **PL310 ayrı bir cihazdır;** L2 üzerinde aynı işlemleri yapmak için PL310'un kendi register'larına (`CACHE_SYNC`, `INV_LINE_PA`, `CLEAN_LINE_PA`, `CLEAN_INV_LINE_PA`) yazmanız gerekir. Xilinx BSP'nin `Xil_DCacheFlushRange()` fonksiyonu doğru sırayla *hem* L1 *hem* L2 üzerinde gerekli işlemleri çağırır; en azından v8.0'dan sonra. Eski sürümlerde bu iki aşamanın iç içe geçmiş olduğu ve race condition ürettiği bilinen bir bug vardı; Xilinx bunu inner ve outer cache'i ayırarak düzeltti.

Bütün maintenance op'larının ardından bir **DSB** (Data Synchronization Barrier) gelmesi şarttır. Sebep teknik ama önemli: `DCCMVAC` bir cache komutudur, asenkron olarak gerçekleşebilir. DSB bariyeri olmadan, hemen ardından DMA'yı başlatırsanız — yani peripheral register'ına bir kontrol biti yazarsanız — DMA, cache'in DDR'a yazmasını beklemeden okumaya başlayabilir. Sonuç: yine eskimiş veri. Bunun üstüne, PL310 söz konusu olduğunda `CACHE_SYNC` register'ına da yazmak (yani outer cache'in tamamlanmasını beklemek) gerekir.

Asgari, doğru sıra şudur:

```c
/* CPU -> DMA: CPU buffer'a yazdı, DMA okuyacak */
Xil_DCacheFlushRange((INTPTR)buf, len);   /* L1+L2 clean (+invalidate) */
dsb();                                     /* maintenance ops bitsin */
StartDma(buf, len);                        /* peripheral register'a yaz */
```

```c
/* DMA -> CPU: DMA buffer'a yazdı, CPU okuyacak */
WaitDmaDone();
Xil_DCacheInvalidateRange((INTPTR)buf, len);  /* L1+L2 invalidate */
dsb();
/* artık buf[i] güvenle okunabilir */
```

İlk bakışta yeterli görünüyor. Değil.

---

## İki Yönlü Sıralama: TX ve RX Farklı Şeyler Gerektirir

DMA iki yönlü bir tür araçtır. CPU'dan periferi besleyen yön (TX) ile periferden CPU'ya veri akıtan yön (RX) farklı maintenance gerektirir, çünkü "kim taze kopyaya sahip" sorusunun cevabı farklıdır.

**TX (CPU → DMA):** CPU buffer'a yazar, DMA okur.
- Riskli senaryo: CPU'nun yeni yazdığı veri L1'de dirty kaldı; DMA DDR'dan eski veriyi okur.
- Doğru sıra: DMA başlatmadan önce buffer'ı **clean** et. (Invalidate gerekli değil; CPU bir daha okumayacak veya okusa bile L1'deki kopyası geçerli.)

**RX (DMA → CPU):** DMA buffer'a yazar, CPU okur.
- Riskli senaryo 1: DMA bittikten sonra CPU okursa, L1'de buffer'a ait *eski* satırlar varsa onlardan okur. Yeni DDR içeriğini görmez.
- Riskli senaryo 2: DMA başlamadan *önce* CPU buffer'a yakın bir yazma yapmış olabilir; o satır dirty olabilir. DMA yazma sırasında, CPU dirty satırı tahliye ederse, DMA'nın yeni yazdığı veri üstüne yazılır.
- Doğru sıra: DMA başlatmadan önce **invalidate** et (kapsamı clean+invalidate olarak yapmak güvenli olur — birazdan göreceğiz: olmuyor), DMA bittikten sonra tekrar **invalidate** et.

Bu yüzden RX yönünde "öncesi + sonrası iki kez invalidate" deseni, defansif bir kalıptır. STM32H7 / Cortex-M7 dünyasında Microchip'in TB3195 application note'u tam olarak bu kalıbı tarif eder; aynı mantık Cortex-A9 için de geçerlidir.

Şimdiye kadar her şey kâğıt üzerinde tutarlı. Asıl ağrı kesici, gerçek dünyaya inince başlıyor.

---

## Tuzak #1: Cache Line Hizalama ve Komşu Veri Bozulması

Cortex-A9'un cache satırı 32 byte. `DCIMVAC`, verilen adres aralığını kapsayan **tam cache satırlarını** geçersiz kılar. Eğer buffer'ınız bir cache satırının tam ortasında başlıyor veya bitiyorsa, o satırın geri kalanı — yani buffer'a ait olmayan başka değişkenler — **birlikte geçersiz olur.**

Şu C örneğine bakın:

```c
/* DİKKAT: hatalı kod */
struct {
    uint8_t  status;        /* offset 0,   1 byte */
    uint8_t  pad[3];        /* offset 1,   3 byte */
    uint32_t dma_buf[8];    /* offset 4,  32 byte */
    uint32_t counter;       /* offset 36,  4 byte */
} shared;

/* RX: DMA dma_buf'a yazdı, CPU okuyacak */
Xil_DCacheInvalidateRange((INTPTR)shared.dma_buf, sizeof(shared.dma_buf));
```

`shared` yapısı 32-byte hizalı varsayalım. `dma_buf`, offset 4'te başlıyor. İlk cache satırı (0..31) `status`, `pad`, ve `dma_buf[0..6]`'yı tutar; ikinci cache satırı (32..63) `dma_buf[7]` ve `counter`'ı tutar.

`Xil_DCacheInvalidateRange(&dma_buf[0], 32)` ne yapar?
- Adres 4'ten 35'e kadar geçen aralığı kapsayan satırları geçersiz kılar.
- O satırlar: ilk cache satırı (0..31) ve ikinci cache satırı (32..63).
- Yani `status` ve `counter` de geçersiz olur.

Eğer CPU `dma_buf` invalidate edilmeden hemen önce `counter`'ı bir artırmışsa — ki write-back cache'te bu yazı henüz DDR'a inmemiş olabilir — bu yazı **geri dönmeden kaybolur.** Çünkü dirty satır clean'lenmeden invalidate edildi.

Bu hatanın belirtisi tam da hikâyenin başındaki gibidir: değişkenler ara sıra eski hâline döner. Kod yeniden incelenir, *"ama ben burada açıkça yazıyorum"* denir. Ekran kırmızıdır.

**Doğrusu:** DMA buffer'larını her zaman cache satırı sınırına hizalayın *ve* uzunluğu da cache satırının katına yuvarlayın. Cortex-A9'da bu 32 byte demektir. Yapı içindeki konumlara yerleştirmek yerine — özellikle başka değişkenlerle aynı struct'ta paylaşıyorsa — DMA buffer'larını kendi tahsisinde tutun:

```c
/* Doğru kalıp */
static uint8_t dma_buf[1024] __attribute__((aligned(32)));
```

Boyut konusunda da disiplinli olun: `sizeof(dma_buf)` 32'nin katı değilse, son satırın yanına başka bir veri koymayın. En temizi, `dma_buf`'ı kendi cache satırına yalnız olarak yerleştirmek için boyutu en yakın 32 byte üst katına yuvarlayıp pad ekleyin. Linux kernel'in `__cacheline_aligned` makrosu tam olarak bunu yapar.

---

## Tuzak #2: L1 Temiz, L2 Hâlâ Kirli

Cortex-A9 üzerinde Xilinx BSP'nin eski (v7 öncesi) sürümlerinde gözlemlenen klasik bir bug: cache maintenance fonksiyonu önce L1 üzerinde clean+invalidate yapıyor, sonra L2 üzerinde aynı işlemi yapıyordu. Görünüşte mantıklı. Pratikte sorunlu.

Şu senaryoyu düşünün:

1. `Xil_DCacheFlushRange()` L1 satırını clean'liyor — dirty veri L2'ye iniyor (PL310 outer cache görevini yapıyor).
2. L1 invalidate ediliyor.
3. Henüz L2 invalidate edilmeden bir başka kod parçası (örneğin kesme handler'ı) aynı adresi okuyor. L1'den miss; L2'den hit. Veri tekrar L1'e çekiliyor.
4. L2 invalidate ediliyor. Ama L1'de yine aynı veri var.
5. DMA başlatılıyor. CPU okumaya geldiğinde, L1'deki "yenilenmiş" eski veriyi görüyor.

Bu race condition'ı yakalamak çok zor — sadece kesme handler'ı uygun anda araya girdiğinde tetiklenir. Düzeltme inner ve outer cache adımlarını birbirinden ayırmaktır: önce *bütün* L1 üzerinde işlem yap; sonra *bütün* L2 üzerinde işlem yap. Xilinx BSP v8.0 bu mantığı uygular. Eski projeleri bakıma alanların başlık not edeceği bir detay.

---

## Tuzak #3: Clean+Invalidate Yarış Koşulu

Aynı satır içindeki bitişik veriler problemini biraz daha derinleştirelim. RX yönünde defansif olarak `DCCIMVAC` (clean+invalidate) kullanırsanız ne olur?

Diyelim CPU, DMA buffer ile aynı satırı paylaşan başka bir değişkene tam o sırada yazıyor. Sıra şöyle olabilir:

1. CPU `Xil_DCacheFlushAndInvalidateRange(buf, len)` çağırıyor (yani `DCCIMVAC`).
2. PL310 işlemi başlatıyor: önce satır clean'leniyor (dirty bitler dirildi, DDR güncellendi). Bu birkaç çevrim sürer.
3. Bu sırada başka bir CPU çekirdeği veya kesme handler'ı aynı satırdaki bitişik bir değişkene yazıyor.
4. PL310 satırı şimdi invalidate ediyor — *yeni yazıyı dahil olmak üzere her şeyi atıyor.*
5. Yazı kayboldu.

Bu, ARM ARM'da "Cache maintenance operations are not atomic" şeklinde tek cümleyle geçer ama gerçek hayatta kafa karıştıran bir tuzaktır. Korunma yolu en güvenli haliyle: DMA buffer'ı **kendi cache satırlarında izole tutmak**, çevresine kimsenin yazmayacağı şekilde. Daha sıkı bir yol: maintenance op'ları sırasında o satırlara dokunulmasını yasaklayan bir yazılım sözleşmesi.

---

## Deney: ADC Ring Buffer'ında Yeniden Üretim

Hikâyenin başındaki "sinyalin içine düşmüş kâğıt parçaları" tarifi, oldukça yaygın bir paterndir. Standart bir reprodüksiyon kurgusu şöyle olabilir. Bir Zynq-7000 üzerinde, PL'deki bir ADC IP'sinden gelen örnekleri AXI DMA scatter-gather kanalıyla DDR'da bir ring buffer'a yazıyorsunuz. Buffer 16 segmentten oluşuyor, her segment 512 örnek (her örnek 4 byte) = 2048 byte. CPU her segment dolduğunda kesme alıp segmente bakıyor.

Bug'lı kod tipik olarak şöyle görünür:

```c
#define SEG_COUNT 16
#define SEG_BYTES 2048
static uint32_t ring[SEG_COUNT * SEG_BYTES / 4]
    __attribute__((aligned(4)));     /* dikkat: 4 byte hizalı, yeterli değil */

static volatile int last_idx = -1;

void DmaSegDoneIsr(int seg)
{
    last_idx = seg;
}

void ProcessLoop(void)
{
    int cur = 0;
    while (1) {
        if (cur == last_idx) {
            uint32_t *seg = &ring[cur * SEG_BYTES / 4];
            Xil_DCacheInvalidateRange((INTPTR)seg, SEG_BYTES);
            FirProcess(seg, SEG_BYTES / 4);
            cur = (cur + 1) % SEG_COUNT;
        }
    }
}
```

Buna gerçek hayatta neler olur, sırayla bakalım:

- `ring` 4 byte hizalı; 32 byte cache satırı sınırında olmayabilir. İlk segmentin başı ve sonu, *başka* bir segmentle aynı cache satırını paylaşabilir. Bir önceki çağrıdaki invalidate, bir sonraki segmentin başını da invalidate eder; eğer bu sırada DMA o bölgeye yazıyorsa, *yazı kaybolabilir.*
- DMA'nın yazma sırası ile CPU'nun okuma sırası, peripheral kesmenin geldiği an ile `Xil_DCacheInvalidateRange` çağrısı arasında — yani milisaniyenin onda biri kadar bir pencere — örtüşebilir. Hizalama doğru olsa bile, *invalidate öncesi clean yapılmamışsa* L1'de kalan eski veri DDR'a tahliye edilebilir (sıcakken cache pressure daha yüksek; LRU evict daha sık), DMA'nın taze verisini ezer. "Sıcakken hata daha sık" gözleminin biyolojik açıklaması: cache hattındaki evict aktivitesi.

Düzeltme üç adımlıdır:

```c
/* 32 byte hizala, segmentleri cache satırı sınırlarında bitir */
#define ALIGNED_SEG_BYTES (((SEG_BYTES + 31) / 32) * 32)   /* zaten 32'nin katı */
static uint32_t ring[SEG_COUNT * ALIGNED_SEG_BYTES / 4]
    __attribute__((aligned(32)));

void ProcessLoop(void)
{
    int cur = 0;
    while (1) {
        if (cur == last_idx) {
            uint32_t *seg = &ring[cur * ALIGNED_SEG_BYTES / 4];
            /* segmentleri ayrı tahsis et veya başka değişken paylaştırma */
            Xil_DCacheInvalidateRange((INTPTR)seg, ALIGNED_SEG_BYTES);
            /* invalidate sonrası, DMA bu segmente artık yazmıyor */
            FirProcess(seg, ALIGNED_SEG_BYTES / 4);
            cur = (cur + 1) % SEG_COUNT;
        }
    }
}
```

Asıl yapısal düzeltme ise `last_idx` ile DMA arasındaki yarışı kapatmak: ring buffer kafa/kuyruk durumunu kullanın ve segmenti yalnızca DMA o segmentten *ileride* olduğunda işleyin. Yoksa segmentin sonuna doğru "yazıyor olabilir DMA, ama bitti dediğinin altı yarım" durumuna düşersiniz.

Mermaid ile sıralamayı görselleştirelim:

<div class="mermaid">
sequenceDiagram
    participant DMA
    participant DDR
    participant L1
    participant CPU
    DMA->>DDR: yeni segment yaz
    DMA->>CPU: kesme (seg N done)
    Note over CPU,L1: L1'de seg N'in eski satırları var (önceki turdan)
    CPU->>L1: DCIMVAC seg N (invalidate)
    L1-->>L1: PoC'a kadar geçersiz kıl
    CPU->>CPU: DSB
    CPU->>DDR: seg N oku (L1 miss -> DDR)
    Note over CPU: artık taze veri
</div>

---

## Alternatifler: Non-Cacheable Bölge ve ACP

Bu maintenance dansına hiç girmemek isteyenlere iki yol var.

### Non-cacheable bellek

Zynq-7000'de MMU üzerinden, belirli bir bölgenin sayfa özniteliğini "Normal, Non-Cacheable" yaparak o bölgeyi cache dışında tutabilirsiniz. CPU bu bölgeye yazdığında L1'i atlar, doğrudan DDR'a iner. DMA tutarlılığı bedavadır. Xilinx BSP'de bu işlem `Xil_SetTlbAttributes()` ile yapılır; tipik attribute değeri `NORM_NONCACHE` (yani `0x11DE2`) etrafındadır ve 1 MB sayfa hizalı bir bölgeyi non-cacheable işaretler.

Burada önemli bir incelik: DMA buffer'larını **"Strongly-Ordered" veya "Device"** olarak işaretlemek *yanlıştır.* Bu iki tür, MMIO register'larına yönelik MMU sınıflarıdır; spekülasyonu ve birleştirmeyi yasaklarlar, her erişimi bireysel transaction'a çevirirler. DMA tampon bölgesinde bu davranış performansı yere indirir — her okuma 32 byte burst yerine 4 byte tek transfer olur — ve aynı zamanda erişim sıralaması üzerinde DMA için gereksiz garantiler sunar. "Normal, Non-Cacheable" doğru sınıftır; aralıklı erişim hâlâ cache olmadan yapılır ama burst dostudur.

Bedel her durumda performans: random access ağır kullanım altında düşer, sıralı tarama da L1'in lokalite kazanımından yararlanmaz. Küçük ve seyrek erişilen kontrol bloğu için ideal; yüksek bant genişliği işleyen sinyal yolu için değil.

### ACP — Donanım Koherensi

Cortex-A9'da SCU'ya doğrudan bağlı bir AXI slave portu vardır: ACP (Accelerator Coherency Port). PL'deki DMA master'ını AXI DMA üzerinden ACP'ye bağlarsanız, DMA'nın okuma ve yazmaları **donanımsal olarak koherent** hâle gelir. SCU, hangi satırların L1/L2'de bulunduğunu bilir; gerekiyorsa CPU'dan snoop yapar.

Pratikteki kazanım: cache maintenance çağrılarınız tamamen kalkar. Yazılım sade hâle gelir. Fakat:

- ACP bant genişliği SCU üzerinden serileştirilir; iki CPU çekirdeği boşken bile, ACP'nin sürekli yüksek bant genişliği veremediği görülür. JBLopen'ın Zynq-7000 benchmark çalışmasında ACP path'inin pratik tavanı, doğrudan DDR'a giden HP portunun belirgin biçimde altında kalır.
- ACP yazma trafiği L2'ye düşer. Bu, L2'yi DMA verisiyle "kirletebilir" — yani CPU'nun başka, gerçekten kullanılan veri satırlarını L2'den dışarı iter. Şanssız kullanımlarda CPU performansı düşer.

Karar: kontrol mesajları, küçük buffer'lar, latency'si önemli olan paketler için ACP. Yüksek bant genişlikli sürekli akış için HP portları + cache maintenance veya non-cacheable.

---

## Pratik Tavsiyeler

Bütün bu bilgiyi tek bir karar tablosuna sığdırmak gerekirse:

| Senaryo                                          | Önerilen yaklaşım                                 |
|---|---|
| Küçük (<1 KB), seyrek erişilen kontrol/komut bloğu | Non-cacheable bölge (MMU page attribute)         |
| Yüksek bant, sürekli akış, gecikme önemli değil    | HP port + cache maintenance + 32-byte alignment   |
| Küçük buffer, düşük gecikme, sade kod isteniyor    | ACP                                               |
| Birden çok master'ın paylaştığı buffer             | ACP veya non-cacheable                            |
| Bare-metal, kısıtlı zaman                          | Önce non-cacheable, performans gerektiğinde kademe |

Buna birkaç pratik kural eklenir:

- DMA buffer'ları **her zaman** 32 byte hizalı tahsis edin. C'de `__attribute__((aligned(32)))`. C++'ta `alignas(32)`. Heap'ten alıyorsanız `posix_memalign` veya `aligned_alloc`.
- Buffer uzunluğunu 32 byte'ın katına yuvarlayın; arta kalan slot'a başka değişken koymayın.
- Linker script'inizde `.bss.dma` ve `.data.dma` gibi ayrı section'lar tanımlayıp, DMA buffer'larını oraya yerleştirin. Bu hem hizalamayı garanti eder hem de MMU attribute'unu (non-cacheable yapacaksanız) section bazında verir.
- Her cache maintenance çağrısının arkasından `dsb()` koyun, isteğe bağlı değildir.
- `Xil_DCache*` çağırıyorsanız BSP sürümünüzü kontrol edin; eski sürüm L1/L2 race condition'ına açıktır.
- Bug ayıklarken `mmu_set_attribute()` ile DMA bölgesini geçici olarak non-cacheable yapın. Hata kayboluyorsa kaynak coherency'dir; kayboluyorsa kaynak başka yerdir. Bu, bir cache hatasını saatlerce loglara bakmaktan kurtaran küçük ama acımasız etkili bir teşhis hareketidir.
- Test koşumlarınızda yüksek cache pressure ortamı yaratın: arka planda bir başka çekirdek üzerinde büyük matris çarpımı çalıştırın. Cache evict aktivitesi tetiklenmemiş bir DMA-cache hatası, sahaya çıkana kadar bekleyen bir hatadır.

---

## Açık Sorular ve İleri Okuma

Bu yazı Cortex-A9'a odaklandı. ARMv8-A (Cortex-A53/A72) dünyasında manzara biraz değişir: cache-line size 64 byte olur, AArch64 kodda inline assembly farklıdır, sistem register erişimi yeniden tasarlanmıştır. Ancak temel mantık — clean before DMA-read, invalidate before+after DMA-write, line alignment — birebir aynıdır. Zynq UltraScale+ MPSoC'de CCI-400 üzerinden hardware coherency yaygındır; ACP'nin yerini "Cache Coherent Interconnect" alır ve donanım koherensi sistemin geneline yayılır. O dünyaya geçince, MMU attribute'larını "Inner Shareable" yapmak ve doğru AXI master'ı kullanmak yeter; cache maintenance miktarı dramatik biçimde düşer.

Açık konular: PL310'un üzerindeki ACE (AXI Coherency Extensions) imkânları, OCM (On-Chip Memory) için cache politikasının önemi (264 KB OCM'i scratch buffer olarak kullanmak, DMA için non-cacheable bir bölge gibi davranmasından dolayı, çok kullanışlıdır), ve bir adım sonrası: cache maintenance maliyetini gerçek bir benchmark ile ölçmek. Bu son nokta, bir başka yazının konusu — özellikle de WCET analizine bakanların öncelikli ilgisini çekiyor.

---

## Sonuç

DMA'nın cache ile barıştırılması, ARM SoC bare-metal mühendisliğinin sessiz vergilerinden biridir. Kâğıt üzerinde basit — clean veya invalidate, DSB, başlat — ama gerçek hayatta hizalama, satır paylaşımı, L1/L2 ayrımı ve PoC sıralamasının üst üste bindiği bir alandır. Çoğu hata kodu kötü yazıldığı için değil, yazılım modelinin görmediği bir donanım gerçeği olduğu için ortaya çıkar.

Bu yazıdan akılda kalması gereken üç şey varsa, şunlardır: birincisi, **buffer'ı kendi cache satırlarında yalnız tut**. İkincisi, **maintenance op'larının ardından mutlaka DSB**. Üçüncüsü, hatadan şüphelendiğinde **önce non-cacheable yap, sonra düşün**. Bu üç kuralı içselleştirdiğinde, "sessizce eskimiş veri" tipindeki hataların büyük çoğunluğu daha doğmadan ölür.

---

## Kaynaklar

- ARM Architecture Reference Manual, ARMv7-A and ARMv7-R edition (DDI 0406C.d), Bölüm B2.2 "Caches" ve B7 "VMSA Memory Ordering".
- Cortex-A9 Technical Reference Manual (DDI 0388H/I), Bölüm 7 "L1 Memory System".
- PL310 / L2C-310 Cache Controller Technical Reference Manual (DDI 0246H).
- Xilinx UG585 — Zynq-7000 SoC Technical Reference Manual, Bölüm 3 (Application Processing Unit) ve Bölüm 22 (DMA Controller).
- Xilinx embeddedsw — [`xil_cache.c`](https://github.com/Xilinx/embeddedsw/blob/master/lib/bsp/standalone/src/arm/cortexa9/xil_cache.c) (Cortex-A9 cache maintenance sarmalayıcıları).
- Linux Kernel `Documentation/core-api/dma-api-howto.rst` — DMA buffer alignment ve coherent vs streaming mapping kuralları.
- AMD/Xilinx Wiki, [Zynq UltraScale+ MPSoC Cache Coherency](https://xilinx-wiki.atlassian.net/wiki/spaces/A/pages/18842098/Zynq+UltraScale+MPSoC+Cache+Coherency) (yeni nesil ile karşılaştırma için).
- Microchip Technology, TB3195 — "Managing Cache Coherency on Cortex-M7 Based MCUs" (Cortex-M7 analojisi).
- JBLopen, [Zynq-7000 Bare-Metal Benchmarks](https://www.jblopen.com/zynq-benchmarks/) (ACP vs HP port bant genişliği karşılaştırması).

---
title: "ARM GIC: Kesme Denetleyicisinin İçine Bakmak"
subtitle: "ARM Generic Interrupt Controller: SGI/PPI/SPI, Priority, and Real Failure Modes"
background: "/img/posts/1.webp"
date: '2026-05-30 09:00:00'
layout: post
lang: tr
mermaid: true
---

Çok çekirdekli bir ARM SoC'ta UART'a bir bayt geldiğinde olan biteni izlerseniz, sinyalin CPU'ya ulaşana kadar geçtiği yolun büyük kısmının CPU çekirdeğinde değil, çekirdeğin dışındaki **kesme denetleyicisinde** harcandığını görürsünüz. Hangi çekirdek alacak, hangi önceliğe oturacak, başka bir kesmeyi kesmeli mi, level mı edge mı, secure mu non-secure mu — bütün bu kararlar Generic Interrupt Controller'da (GIC) verilir. CPU'ya ulaşan IRQ sinyali, GIC'in çıkışında kristalize olmuş bir karardır.

Çoğu bare-metal ve RTOS geliştiricisi GIC ile vendor BSP'sinin (örneğin Xilinx'in `XScuGic` sürücüsünün) sunduğu `Connect()`/`Enable()` arayüzü üzerinden tanışır. Bu arayüz işi bitirir, evet — ama altta neyin döndüğünü bilmediğiniz sürece şu sorunların hiçbirini hata ayıklayamazsınız: bir kesme çoklu çekirdekte neden hep aynı CPU'ya gidiyor; ISR neden EOI yazdıktan sonra anında tekrar tetikleniyor; `GICC_IAR` neden bazen 1023 dönüyor; iki farklı önceliğe sahip iki kesme neden birbirini preempt etmiyor.

Bu yazıda Cortex-A serisinin (özellikle Cortex-A9 + Zynq-7000) GIC'i üzerinden işin içine gireceğiz: mimari, kesme sınıfları (SGI/PPI/SPI), öncelik mekaniği, durum makinesi, çok çekirdekli yönlendirme, level/edge tetikleme, ve sonda bir **gerçek-dünya hata modu kataloğu** ile DAL A bağlamında kesme gecikmesi analizi.

---

## Kısa Bir Tarihçe

ARM dünyası uzun süre kesme denetleyicisini tek bir standart yerine **çekirdek başına özel** çözümlerle yönetti. Cortex-M ailesi NVIC'i (Nested Vectored Interrupt Controller) doğrudan çekirdeğin içine entegre etti — bu nedenle Cortex-M kesme dünyası "tamamen ARM mimarisidir" denir. Cortex-A ve Cortex-R tarafında ise farklı bir hikâye çalıştı: çekirdek sadece IRQ ve FIQ giriş pinlerini görüyordu; bu pinleri kim sürer, hangi sırayla, hangi öncelikle — onu çekirdeğin **dışına** yerleştirilen bir denetleyici belirliyordu.

İlk yaygın çözüm **PrimeCell VIC (PL190)** idi: tek çekirdekli, 32 kanal, görece basit. Çoklu çekirdeğin ve karmaşık SoC'lerin gelmesiyle ARM **Generic Interrupt Controller** spesifikasyonunu yayımladı. Sürümlerin kısa özeti:

| Sürüm | Tipik IP | Önemli özellik |
|---|---|---|
| GICv1 | PL390 | Çok çekirdek desteği, SGI/PPI/SPI ayrımı |
| GICv2 | GIC-400 | Sanallaştırma uzantısı (vGIC), security extensions |
| GICv3 | GIC-500, GIC-600 | Affinity routing (MPIDR tabanlı), LPI'lar, ITS |
| GICv4 | GIC-600AE, GIC-700 | Sanal LPI'lar (direct injection), güvenlik ekleri |

Xilinx Zynq-7000 ailesi (iki Cortex-A9 + FPGA) **PL390** kullanır; bu GICv1'in pratik uygulamasıdır ve GICv2 ile programcı modeli neredeyse bire bir aynıdır. Zynq UltraScale+ MPSoC (dört Cortex-A53) GIC-400 / GICv2 kullanır. Modern Cortex-A78AE veya Cortex-R52+ tabanlı emniyet kritik SoC'larda GICv3/v4 standarttır.

Bu yazıda, sahada en yaygın gördüğüm konfigürasyon olduğu için **GICv2** (≈ PL390) odaklı anlatacağım. Anlatılan kavramların büyük çoğunluğu GICv3'te de geçerli; sadece kayıt isimleri ve affinity routing modeli değişir.

---

## İki Blok: Distributor ve CPU Interface

GIC'i tek bir kara kutu olarak değil, iki ayrı bloğun mantıksal birleşimi olarak düşünmek gerekir.

<div class="mermaid">
flowchart LR
    subgraph SOC[SoC]
        subgraph SRC[Kesme Kaynakları]
            UART[UART]
            TIMER[Timer]
            DMA[DMA]
            PL[PL IRQ]
            SW[Yazılım SGI]
        end

        subgraph GIC[GIC]
            DIST[Distributor<br>GICD_*]
            CIF0[CPU Interface 0<br>GICC_*]
            CIF1[CPU Interface 1<br>GICC_*]
        end

        CPU0[Cortex-A9 #0]
        CPU1[Cortex-A9 #1]
    end

    UART --> DIST
    TIMER --> DIST
    DMA --> DIST
    PL --> DIST
    SW --> DIST

    DIST -->|IRQ/FIQ| CIF0 --> CPU0
    DIST -->|IRQ/FIQ| CIF1 --> CPU1
</div>

**Distributor** (GICD\_*) tek bir global bloktur: bütün kesme kaynaklarını görür, bunları önceliklendirir, hangisinin hangi CPU'ya gönderileceğini belirler. Adresinin tabanı tek; bütün çekirdekler aynı kayıtları görür (banked olanlar dışında, birazdan değineceğiz).

**CPU Interface** (GICC\_*) her CPU çekirdeği için ayrı bir bloktur: kendi çekirdeğine gelen kesmeyi maskeler, kabul eder, kuyruğa alır, EOI sinyalini distributora geri gönderir. Bu blok da bir kayıt uzayına maplenir, ama önemli nokta şudur: **CPU Interface'in adresi her çekirdek için aynıdır** — Cortex-A9 #0 üzerinde 0xF8F00100'e yazdığınız değer ile Cortex-A9 #1 üzerinde aynı adrese yazdığınız değer farklı yerlere gider, çünkü adres translate'i bir per-CPU alias üzerinden yapılır.

Bu detay çoklu çekirdek bring-up'ında temel bir tuzaktır: her CPU **kendi** PMR'ını ve CPU Interface kontrol kaydını ayrı ayrı initialize etmek zorundadır. CPU0'da `GICC_PMR = 0xFF` yazmak CPU1'in PMR'ını değiştirmez — CPU1'in PMR'ı hâlâ 0 (yani her şey maskeli) durumdadır ve "neden CPU1 hiç kesme almıyor" sorusunun cevabı genellikle budur.

---

## Kesme Sınıfları: SGI, PPI, SPI

GIC, kesme kaynaklarını üç sınıfa ayırır. Hepsi 0-1019 aralığındaki bir **Interrupt ID (INTID)** ile temsil edilir:

| Sınıf | INTID Aralığı | Anlamı | Banked mi? |
|---|---|---|---|
| **SGI** (Software-Generated Interrupt) | 0-15 | Bir CPU'nun başka CPU'yu (veya kendini) tetiklemesi | Evet (CPU başına) |
| **PPI** (Private Peripheral Interrupt) | 16-31 | Sadece bir CPU'ya özel çevre birimi (örn. her CPU'nun private timer'ı) | Evet (CPU başına) |
| **SPI** (Shared Peripheral Interrupt) | 32-1019 | Sistem genelindeki paylaşılan kaynaklar (UART, DMA, PL IRQ, ...) | Hayır (global) |

SGI ve PPI'lar **banked**'tir: her CPU'nun GICD görüntüsünde bu ID'lere ait enable/disable/priority/pending kayıtları o CPU'ya özgüdür. Yani CPU0'ın `GICD_ISENABLER0` kaydında bit 17'yi (PPI 17'yi) set etmek, sadece CPU0'da o PPI'yı enable eder. CPU1'in görüntüsündeki aynı bit etkilenmez.

Bu, programlama hatalarının en sık görüldüğü noktalardan biridir. Bir BSP koduna baktığınızda "burada bir bit set ediliyor, hangi CPU'da etkili?" sorusu çoğu zaman cevapsız kalır — çünkü kod muhtemelen master CPU'da çalışmıştır ama runtime ikinci çekirdeğin uyanmasından sonra niyetli olduğu davranışı sergilemez.

SPI'lar global'dir ve hangi CPU(lar)a gönderileceğini ayrı bir kayıt belirler (bkz. `GICD_ITARGETSR`).

### INTID rezerve aralıkları

`GICC_IAR` okumasından dönen INTID üç özel değer alabilir:
- **1020-1022:** rezerve / grup-spesifik sentinel (örn. GICv2'de farklı security grup için);
- **1023:** spurious interrupt — "okumaya değer bir IRQ yoktu" anlamına gelir.

1023 görmek genelde bir hata sinyalidir. Üç tipik nedeni vardır:
1. `GICC_IAR` arka arkaya iki kez okundu, ilk okuma INTID'yi tüketti, ikinci okuma boş döndü.
2. ISR çağrıldı ama o anda CPU Interface'e ulaşan kesmenin önceliği `GICC_PMR`'in altında değildi (yarış).
3. Distributor ya da CPU Interface'in forwarding biti kapalıydı.

---

## Öncelik: Kaç Bit, Hangi Karar

Her INTID'nin 8-bit bir öncelik değeri vardır (`GICD_IPRIORITYRn`). Ama önemli ayrıntı: bu 8 bitin **kaçı gerçekten implement edilmiştir** IMPLEMENTATION DEFINED'dır. Spesifikasyonun zorunlu kıldığı minimum **4 bit**'tir — yani en azından 16 farklı seviye ayırt edilebilir. Implementation ne kadar bit kullanıyorsa, o bitler **en yüksek anlamlı** uçtan başlar; alt bitler RAZ/WI (read-as-zero, write-ignored) davranır.

Cortex-A9 + PL390 (Zynq-7000) **5 bit** implement eder → 32 seviye. Bunun anlamı: PMR'a veya öncelik kaydına `0x08` yazsanız da `0x0F` yazsanız da denetleyici için aynıdır, çünkü düşük 3 bit görmezden gelinir. Yine: `0x80` yazsanız da `0x87` yazsanız da fark yok.

Bu yüzden öncelik değerlerini hep "5-bit'lik anlamlı tarafa hizalı" şekilde yazmak gerekir. `XScuGic_SetPriorityTriggerType()` zaten bunu yapar (8-bit alanı 32 seviyeye böler) ama elle register yazıyorsanız adımı 8 (= 0x08) tutmak iyi bir alışkanlıktır.

> **Önemli yön kuralı:** GIC'te **küçük öncelik değeri yüksek önceliği** ifade eder. `priority=0` en yüksek önceliktir, `priority=0xF8` (5-bit implementasyonda en düşük) en düşük. Bu mantık ARM Cortex-M NVIC'te de aynı — sahaya yeni gelen mühendisler buradan en sık tökezler.

### PMR — Priority Mask Register

`GICC_PMR` her CPU Interface'in "şu öncelikten daha **düşük öncelikli** (daha büyük sayısal değerli) hiçbir kesmeyi bana gönderme" filtresidir. `PMR=0xFF` → "her şeyi gönder". `PMR=0x00` → "hiçbir şey gönderme". Aradaki değerler, ISR içinde "şu andan itibaren benden daha düşük öncelikli kesmeleri sustur" gibi runtime kararları için kullanılır.

### BPR — Binary Point Register, ya da preemption'ı nasıl kaybedersiniz

`GICC_BPR` 3-bit bir kayıttır (değer 0-7) ve 8-bit öncelik alanını iki parçaya böler:

| BPR | Grup öncelik bitleri | Alt öncelik bitleri | Preemption?
|---|---|---|---|
| 0 | [7:1] | [0] | Maksimum (128 preemption grubu) |
| 1 | [7:2] | [1:0] | 64 grup |
| 2 | [7:3] | [2:0] | 32 grup |
| 3 | [7:4] | [3:0] | 16 grup |
| ... | ... | ... | ... |
| 7 | yok | [7:0] | **Preemption tamamen kapalı** |

İki kesmenin birbirini preempt etmesi için **grup öncelik** bitlerinin farklı olması gerekir; alt öncelik bitleri sadece aynı grup içinde sıralama yapar (preemption değil).

Bu yüzden BPR'ı çok yüksek seçmek (örneğin `BPR=7`) sistemi sessizce kilitleyebilir: GICD'ye farklı öncelikler atadığınız bütün kesmeler aynı "grup"a düştüğü için hiçbiri birbirini preempt edemez. Düşük öncelikli bir ISR uzun çalışıyorsa, yüksek öncelikli kesme **ISR bitene kadar bekler** — kesintiye uğratmaz. Bu genelde "ISR çok uzun, sonuçta jitter görüyorum" diye fark edilir; gerçek neden BPR'dır.

Tipik konfigürasyon: BPR'ı **implement edilen bit sayısının bir altı** seçmek. Cortex-A9'da 5 bit öncelik implement ediliyorsa, BPR=2 mantıklıdır (grup biti 5 bit kadar, alt öncelik yok aslında — ama yine de bir gözcü vardır).

---

## Durum Makinesi: Inactive, Pending, Active

Her INTID GIC içinde küçük bir durum makinesidir:

<div class="mermaid">
stateDiagram-v2
    [*] --> Inactive
    Inactive --> Pending: kaynak assert eder
    Pending --> Active: GICC_IAR okundu
    Active --> Inactive: GICC_EOIR yazıldı
    Active --> ActivePending: kaynak yeniden assert eder<br>(level-sensitive)
    ActivePending --> Pending: GICC_EOIR yazıldı
</div>

Buradaki kritik gözlem: **Active & Pending** durumu vardır. Level-sensitive bir kesmede, ISR çalışırken cihaz IRQ hattını hâlâ asserted tutuyorsa GIC bunu görür ve durumu "active and pending" olarak işaretler. Siz EOI yazdığınızda durum direkt Inactive'e değil **Pending**'e döner — yani aynı ISR'a anında tekrar girilir.

Bu, level-sensitive kaynaklarda en sık görülen hatalardan birinin kökenidir: ISR başında cihazın "interrupt clear" register'ını yazmazsanız (örneğin Zynq AXI Timer'ın `TCSR` kaydında T0INT bitini temizlemezsiniz), GIC EOI sonrası kesmeyi anında tekrar tetikler. Sistem "ISR sonsuz döngüde" gibi davranır, debug ettiğinizde aslında ISR her seferinde temiz çalışıyor görünür — sorun ISR'da değil, ISR çağrısı **doğru** ama sürekli yeniden geliyor.

Edge-triggered kaynaklarda bu sorun yoktur: bir kez tetiklenen sinyal pending olur, IAR okunduğunda Active'e geçer, EOI ile Inactive'e döner. Cihaz tekrar tetiklemek istiyorsa **yeni bir edge** üretmek zorundadır.

Tetikleme tipi `GICD_ICFGRn` kaydında her INTID için 2-bit bir alanla seçilir. GICv2'de bu 2 bitin **bit 0'ı RES0**'dır (GICv1'de 1-N / N-N modelini seçen "model" bitiydi, GICv2'de kaldırıldı); anlamlı olan **bit 1**'dir:
- `0b00`: level-sensitive (active-high level)
- `0b10`: edge-triggered (rising edge)

SGI'lar her zaman edge-triggered; PPI 27 ve 29 (zamanlayıcılar) genelde level. SPI'larda seçim donanım çevre birimine ve datasheet'e bağlıdır. Yanlış seçim hem yukarıdaki "sonsuz tekrar" senaryosuna hem de **kayıp kesme** senaryosuna yol açar: edge tanımladığınız ama aslında level davranan bir kaynakta, sinyal sizden önce başka bir kesmeyle çakışırsa edge'i kaçırabilirsiniz.

---

## Çok Çekirdekli: Kesmeyi Kim Alacak?

SPI'lar global olduğu için "bu kesme hangi CPU'ya gitsin?" sorusunun cevabını ayrı bir kayıt verir: **GICD_ITARGETSRn**. Her byte bir INTID'ye karşılık gelir, içeriği ise hedef CPU maskesidir:

| Bit | Hedef CPU |
|---|---|
| 0 | CPU 0 |
| 1 | CPU 1 |
| 2 | CPU 2 |
| ... | ... |
| 7 | CPU 7 |

`GICD_ITARGETSR[60] = 0x03` yazarsanız → INTID 60 hem CPU0'a hem CPU1'e route edilebilir. GIC bu durumda **1-of-N** modeli uygular: kesme tetiklendiğinde GIC, hedef setindeki CPU'lardan **birine** verir; hangisine, IMPLEMENTATION DEFINED bir mantıkla seçilir (genelde en az meşgul olan, ya da en düşük ID'li boş CPU).

Pratik tuzak: `GICD_ITARGETSR` SGI ve PPI için **banked**'tir — yani CPU0'dan okuyup yazdığınız değer kendi private görüntüsündedir, CPU1'i etkilemez. SPI aralığında (INTID ≥ 32) ise tek paylaşılan bir görüntü vardır. BSP kodları bu kuralı bilmediği için bazen SGI'ları "her CPU'ya yönlendirmek" diye SPI gibi maske yazmaya kalkar — sonuç beklenmedik.

İkinci yaygın hata: bir SPI tek CPU'ya route edilmiş, ama o CPU `wfi` (wait for interrupt) ile uyutulduğunda diğer CPU'lar tarafından **manuel uyandırma yok**. CPU0 idle döngüsünde `wfi` ile uyuyor, kesme CPU0'a route edilmiş ve CPU0 zaten kesmeyi alacaktır — bu OK. Ama CPU0 power-gated ise (örn. CPUFreq deep idle), kesme hiçbir yere gitmez. Linux'ta `irq_set_affinity` bu yüzden kritik bir API'dir; bare-metal'de aynı problemi sürücü kodu içinde manuel çözmeniz gerekir.

---

## Bir İnterrupt Hayat Hikâyesi

UART 1'in RX FIFO'suna bir bayt geldi diyelim. Zynq-7000'de UART1 INTID'si 82'dir. Olan biten:

1. UART donanımı kendi `CHNL_INT_STS` register'ında RTRIG bitini set eder ve dış IRQ pinini assert eder.
2. PL390 distributor INTID 82'yi pending yapar.
3. `GICD_ITARGETSR[82]` = `0x01` ise → CPU0 hedeflenir.
4. GICD önceliği `GICC_PMR` (CPU0) ile karşılaştırır. Düşükse blocklanır, yüksekse CPU0'ın IRQ pinine sinyal verir.
5. CPU0 mevcut komutu bitirir, IRQ exception vector'üne dallanır (`0xFFFF0018` veya CP15 VBAR ile relocate edilmişse oraya).
6. Kullanıcı assembly stub'ı `lr`'i ayarlar, çalışma kaydedicilerini stack'e iter, C tarafına atlar.
7. C handler `GICC_IAR`'ı okur. Dönen değer: 82. Bu okuma, INTID 82'yi **Pending → Active**'e geçirir ve aynı önceliği active-priority maskesine ekler (böylece aynı veya daha düşük öncelikli yeni kesmeler bloklanır; daha yüksek olanlar preempt edebilir).
8. Handler dispatch tablosundan INTID 82'ye karşılık gelen sürücü ISR'ını çağırır.
9. ISR UART'tan baytı okur, donanımın "interrupt status" bitini yazıp temizler. **Sıralama önemli**: önce kaynağı temizle, sonra EOI yaz. Tersi yaparsanız edge ile level karışıklığı yeniden tetikleme yapar.
10. Handler `GICC_EOIR`'a 82 yazar. INTID 82 **Active → Inactive**'e geçer (level-sensitive'de hâlâ asserted ise → Pending'e geri).
11. Assembly tarafı kaydedicileri restore eder ve `subs pc, lr, #4` ile geri döner.

Bu zincirde **yazılım kontrolünüzde** olan adımlar 6-10'dur. Diğerleri donanım belirler ve sabit gecikmedir. Toplam latency (kesme assert'inden ISR'ın ilk anlamlı C satırına kadar) Cortex-A9 @ 666 MHz'de — bir çevrim ≈ 1.5 ns — sıcak cache'te ve preemption yokken **200-300 çevrim ≈ 300-450 ns** mertebesindedir. Cache miss'leri, uzun bir LDM/STM komutunun bitmesi beklemesi ve özellikle MMIO erişim gecikmesi devreye girdiğinde bu rakam **800-1000 çevrim ≈ 1.2-1.5 µs**'ye kadar şişebilir.

---

## Somut Örnek: Zynq-7000'de PL'den Bir IRQ

Programmable logic tarafında bir AXI Timer var ve dolduğunda PS'a IRQ_F2P[0] üzerinden sinyal veriyor. Bu sinyal Zynq'ta SPI INTID 61'e (alternatif olarak 84-91 arası, vendor config'e göre) maplenmiştir.

Tam manuel olarak setup eden bare-metal kod:

```c
#define GICD_BASE      0xF8F01000u
#define GICC_BASE      0xF8F00100u

#define GICD_CTLR      (*(volatile uint32_t*)(GICD_BASE + 0x000))
#define GICD_ISENABLER ((volatile uint32_t*)(GICD_BASE + 0x100))
#define GICD_IPRIORITY ((volatile uint8_t *)(GICD_BASE + 0x400))
#define GICD_ITARGETSR ((volatile uint8_t *)(GICD_BASE + 0x800))
#define GICD_ICFGR     ((volatile uint32_t*)(GICD_BASE + 0xC00))

#define GICC_CTLR      (*(volatile uint32_t*)(GICC_BASE + 0x00))
#define GICC_PMR       (*(volatile uint32_t*)(GICC_BASE + 0x04))
#define GICC_BPR       (*(volatile uint32_t*)(GICC_BASE + 0x08))
#define GICC_IAR       (*(volatile uint32_t*)(GICC_BASE + 0x0C))
#define GICC_EOIR      (*(volatile uint32_t*)(GICC_BASE + 0x10))

#define IRQ_PL_TIMER   61u

void gic_init_pl_timer_irq(void) {
    /* 1. Distributor'ı enable et (her iki CPU için global) */
    GICD_CTLR = 0x1u;

    /* 2. CPU Interface'i enable et (her CPU kendi initialize etmeli) */
    GICC_CTLR = 0x1u;

    /* 3. Bütün öncelikleri görmek için PMR'ı en açık değere set et */
    GICC_PMR = 0xF8u;  /* 5-bit anlamlı, alt 3 bit hep 0 */

    /* 4. Preemption için BPR'ı 2'ye sabitle (grup biti 5 bit kadar) */
    GICC_BPR = 0x02u;

    /* 5. INTID 61'in önceliğini orta seviyeye al */
    GICD_IPRIORITY[IRQ_PL_TIMER] = 0xA0u;  /* 5-bit hizalı */

    /* 6. INTID 61'i CPU0'a route et (CPU mask = 0x01) */
    GICD_ITARGETSR[IRQ_PL_TIMER] = 0x01u;

    /* 7. INTID 61'i level-sensitive olarak konfigure et
     *    ICFGR[n]: her INTID 2 bit; bit[0] RES0, bit[1] = 0 level / 1 edge */
    uint32_t cfg = GICD_ICFGR[IRQ_PL_TIMER / 16];
    cfg &= ~(0x3u << ((IRQ_PL_TIMER % 16) * 2));      /* level (b00) */
    GICD_ICFGR[IRQ_PL_TIMER / 16] = cfg;
    /* edge isteseydik: cfg |= (0x2u << ((IRQ_PL_TIMER % 16) * 2)); */

    /* 8. Son olarak INTID 61'i enable et */
    GICD_ISENABLER[IRQ_PL_TIMER / 32] = (1u << (IRQ_PL_TIMER % 32));

    /* CPSR.I'yi temizle (irq aç) — assembly tarafı yapar */
}

void irq_handler(void) {
    uint32_t iar = GICC_IAR;
    uint32_t intid = iar & 0x3FFu;       /* alt 10 bit INTID, üst CPU ID */

    if (intid == 1023u) {
        /* Spurious — EOI yazma, sessizce dön */
        return;
    }

    if (intid == IRQ_PL_TIMER) {
        /* 1) Donanım kaynağını temizle (PL timer'ın TCSR'ı) — KRİTİK */
        clear_pl_timer_interrupt();
        /* 2) Sürücü işini yap */
        on_pl_timer_tick();
    }

    /* EOI'ı her zaman aynı IAR değerini yazarak ver */
    GICC_EOIR = iar;
}
```

Burada gözden kaçırılması kolay üç şey var:
- `GICC_EOIR`'a yazılan değer **IAR'dan okunan ham değerin tamamıdır** (sadece INTID'nin kendisi değil). Üst bitler "kesmeyi hangi CPU başlattı" bilgisini taşır (SGI'lar için kritiktir).
- Spurious 1023 durumunda **EOI yazılmaz** — yoksa active priority sayacı bozulur.
- Donanım kaynağının temizlenmesi EOI'dan önce yapılır. Tersi yaparsanız level-sensitive sinyali EOI sonrası anında tekrar görür.

---

## Hata Modu Kataloğu

Aşağıdaki sekiz vaka, sahada Zynq + Cortex-A9 sistemlerinde gördüğüm GIC hatalarının %90'ını kapsar. Hepsinin ortak özelliği: kod "doğru" görünür, hatta `XScuGic_*` API'ı ile yazılmıştır — ama altta GIC'in beklenen modeli kırılmıştır.

### 1. Spurious 1023 — IAR'ı iki kez okumak

```c
/* HATA */
uint32_t intid = GICC_IAR & 0x3FF;
log_printf("IRQ: %u\n", GICC_IAR & 0x3FF);  /* ikinci okuma! */
```

İkinci okuma kuyrukta başka bir kesme yoksa 1023 döner. Daha kötüsü: kuyrukta kesme **varsa**, ikinci okuma o kesmeyi Pending'den Active'e geçirir ve siz onu hiçbir zaman handle etmezsiniz (çünkü değişkene koymadınız). Düzeltme: IAR'ı tek seferde oku, lokal değişkende sakla.

### 2. Level-sensitive kaynakta sonsuz tekrar

ISR'ın ilk satırı `GICC_EOIR = iar` ise ve cihazın interrupt status biti henüz temizlenmemişse, EOI'dan hemen sonra kesme yeniden tetiklenir. CPU bütün zamanını bu ISR'da harcar; sistem ya kilitlenmiş ya da "süper yavaşlamış" gibi davranır. JTAG ile durdurup baktığınızda PC her zaman ISR'ın içindedir. Düzeltme: **önce kaynak temizle, sonra EOI**.

### 3. Forgotten EOI

ISR `GICC_EOIR` yazmayı unutursa: GIC'in active-priority registerı temizlenmez, yani aynı veya daha düşük öncelikli yeni hiçbir kesme bu CPU'ya iletilmez. Yüksek öncelikli kesmeler hâlâ gelir (preempt edebilirler), ama tipik bir RTOS tick'iniz aynı öncelikteyse bütün sistem zamanlaması durur. Tipik belirti: sistem belli bir donanım kesmesinden sonra "donuk" hale gelir ama hâlâ JTAG erişiminde duyarlıdır.

### 4. BPR=7 ile sessiz preemption kaybı

Vendor sample kodu çoğu zaman `GICC_BPR = 0x07` ile başlar (çünkü en muhafazakâr değerdir). Sonra siz "yüksek öncelikli" bir kesmeyi tanımlarsınız, ama düşük öncelikli ISR uzunsa onu preempt edemez. Test ortamında küçük yüklerle gözükmez; yük altında jitter olarak ortaya çıkar. Düzeltme: BPR'ı implement edilen öncelik bit sayısına uygun seçin.

### 5. CPU1'de PMR=0

İkinci çekirdek başlatıldıktan sonra "hiç kesme almıyor" durumu. Sebep: CPU1'in bring-up kodunda `GICC_PMR` ayarlanmadığı için 0 değerinde, yani her şey maskeli. Düzeltme: SMP bring-up kodunda her CPU kendi CPU Interface initialization'ını çağırmalı (`GICC_CTLR = 1`, `GICC_PMR = 0xF8`, `GICC_BPR = 2`).

### 6. SGI banked'lığını unutmak

CPU0'dan `GICD_ITARGETSR[5] = 0x03` yazıp "SGI 5'i hem CPU0 hem CPU1 alabilsin" dediniz. Olmaz. SGI'lar GICD_ITARGETSR'da banked'tir. SGI yönlendirmesi `GICD_SGIR`'a yazılırken yapılır:

```c
GICD_SGIR = (target_mask << 16) | sgi_id;
```

### 7. Yanlış edge/level config'i

Etherne MAC'in IRQ'sini edge olarak konfigure ettiniz ama donanım level davranıyor. İlk packet'te kesme alırsınız, sonra hat asserted kalır ve siz yeni bir edge bekliyorsunuz — kesme bir daha gelmez. Sistem "çalışıyor ama sadece ilk paketi alıyor" gibi davranır. Datasheet ve PS-PL bağlantı şemasını ICFGR ile karşılaştırmak şart.

### 8. ITARGETSR maskesi yanlış CPU'yu işaretliyor

IRQ aslında CPU0'a route edilmesi gereken bir SPI, ama bring-up sırasında maskeye `0x02` (yani sadece CPU1) yazıldı. CPU1 çoğu zaman idle / WFI'da olduğu için kesme gerçekten gelir ve handle edilir gibi görünür — ama latency çok yüksektir, çünkü CPU1 önce uyanır. Multi-core CPU affinity bug'ları çoğu zaman bu kadar saklı kalır; ortaya tipik olarak yük altında jitter testi ile çıkar.

---

## DAL A Bağlamında Kesme Gecikmesi Analizi

Emniyet kritik sistemde (DO-178C DAL A) bir kesme handler'ı WCET (Worst-Case Execution Time) analizine girer. Kesme **yanıt süresi** (latency) bu analizin önemli bir bileşenidir ve şu kalemlerden oluşur:

| Bileşen | Tipik (Cortex-A9 @ 666 MHz) | Belirsizlik kaynağı |
|---|---|---|
| Donanım assert → distributor sample | 1-2 GIC saat çevrimi | clock-domain crossing |
| Distributor priority arbitration | 2-5 çevrim | aynı anda gelen başka kesmeler |
| CPU Interface'e iletim | 2 çevrim | sabit |
| CPU mevcut komutu bitirir | 1-30 çevrim (LDM/STM uzun olur) | komut tipi (worst case: `LDM` 16 register) |
| Exception entry, mode switch | ~12 çevrim | bank switch sabit |
| Stack push / context save | 30-80 çevrim | kaç register? cache miss? |
| `GICC_IAR` oku | 20-60 çevrim | GIC'in MMIO erişim gecikmesi, cache miss yok |
| Handler prologue (C tarafına atlama) | 10-30 çevrim | derleyici çıktısı |
| ISR'ın ilk anlamlı satırı | — | uygulama |

Toplam worst-case sıcak cache'te ~200-300 çevrim (≈ 450 ns); soğuk cache + uzun komut + MMIO + preemption senaryolarında 800-1000 çevrim (≈ 1.5 µs) mertebesine çıkar. Bu rakamlardaki gerçek belirsizlik kaynakları:

- **Cache state.** ISR ve sürücü kodu data/instruction cache'te değilse, miss'ler kolayca 30-50 çevrim ekler. WCET analizi cache'i "always miss" varsayar (pessimistic) ya da statik cache analizi yapar (örn. AbsInt aiT, Rapita RapiTime).
- **Aynı önceliğe sahip başka kesmelerin sıralanması.** GIC, aynı önceliğe sahip iki SPI'dan önce hangisini iletir? GICv2'de bu davranış IMPLEMENTATION DEFINED'dır. Determinist analiz için kritik kesmeleri **farklı önceliklere** koymak gerekir.
- **PL390'da ARE_S yok.** GICv2 ile gelen security extensions, GICv1 PL390'da yoktur. Zynq-7000 üzerinde "secure SGI" gibi konseptler vendor BSP düzeyinde simüle edilir; kâğıt üzerinde GICv2 davranışına güvenip sertifika veremezsiniz.
- **Compiler optimizasyonları.** ISR prologue/epilogue derleyiciye göre değişir. DO-178C için ya compiler nitelendirilmiş olmalı (DO-330 Tool Qualification Level 1-5) ya da çıkan assembly review edilmeli.

WCET açısından "kötü tasarım"a sık örnekler:
- **ISR içinde mutex/lock alma.** Eğer lock başka CPU tarafından tutuluyorsa unbounded blocking gerekir. ISR içinde sadece interrupt-safe primitive kullanılmalı.
- **ISR içinde dinamik bellek (malloc).** Heap fragmentasyonu WCET'i unbounded yapar.
- **Polling loop'lar.** ISR içinde "bekle bu bit set olana kadar" tipi kod, hardware response time'a bağımlılık getirir.
- **Cascaded GIC** (GIC'in çıkışını başka bir GIC'e besleyen tasarımlar). Latency iki GIC'in serisine yayılır; nadir ama bazı SoC'larda görülür.

Lockstep CPU mimarilerinde (Cortex-R5 + dual-core lockstep) GIC genellikle paylaşılır — kesme aynı saat çevriminde her iki çekirdeğe iletilir, yanıt karşılaştırılır. Bu, GIC'in **kendisinin** lockstep edilmesi anlamına gelmez (yapılır ama nadiren); genellikle GIC tek noktadır ve "GIC arızası SoC arızasıdır" diye işaretlenir. Bu kabul DAL A safety case'inde açıkça yazılmalı.

---

## GICv3'e Bir Bakış

Aviyonik tarafında hâlâ Cortex-A9 / Cortex-R5 hâkim olduğu için pratikte en sık GICv2 ile karşılaşılır. Yine de yeni nesil SoC'lar (Zynq UltraScale+ MPSoC, NXP S32G, Renesas R-Car serisinin yeni üyeleri) GICv3 kullanır. En önemli farklar:

- **Affinity routing.** Hedef CPU artık 8-bit `GICD_ITARGETSR` maskesiyle değil, 64-bit `GICD_IROUTERn` ile, MPIDR formatında verilir. Bu, 8'den fazla CPU'lu sistemlerde gerekli oldu.
- **LPI (Locality-specific Peripheral Interrupt).** Çok büyük ID aralığında (32K+), mesaj tabanlı kesme (MSI) için.
- **ITS (Interrupt Translation Service).** PCIe MSI'larını LPI'lara çeviren ayrı bir blok.
- **Sistem register erişimi.** GICv3'te `ICC_*_EL1` sistem register'ları üzerinden CPU Interface'e erişilir; MMIO yerine direkt MRS/MSR komutlarıyla. Latency düşer, ama bare-metal bring-up'ı değişir.
- **Priority drop ile deactivate ayrımı.** GICv3'te `EOImode=1` ile EOI iki adıma bölünebilir: önce `ICC_EOIR1_EL1` ile priority drop (yeni kesmeler tekrar gelebilir), sonra `ICC_DIR_EL1` ile deactivate. Hypervisor'lar bu modeli sever, çünkü VM'den dönerken priority'yi temizleyip deactivate'i ana OS'a bırakabilir.

GICv3'e geçen bir kod tabanında en sık karşılaşılan sorun, `GICD_ITARGETSR` kullanan eski kodun GICv3'te ARE=1 olduğunda **kayıtsız** olmasıdır — yazarsınız, etkili olmaz. ARE=0 modunda legacy davranış vardır ama yeni özellikler de devre dışı kalır. Migration'da bunun erken farkedilmesi günler kazandırır.

---

## Sonuç

GIC, Cortex-A ve Cortex-R sistemlerinde "saydam" olduğu varsayılan ama bütün gerçek-zaman davranışın kendi kararlarına bağlı olduğu kritik bir bloktur. BSP'nin sunduğu `Connect/Enable/SetPriority` API'ı işi günlük geliştirme için bitirir, ama:

- Çok çekirdekli bring-up,
- DAL A için kesme latency analizi,
- "Kesme alıyorum ama ya hiç ya da sonsuz" tipi vaka analizi,
- ISR'ların preemption davranışını tasarlamak,

bunların hepsi GIC'in iç modelini bilmeyi gerektirir. Banked vs shared kayıtların ayrımı, öncelik bitlerinin gerçek implementasyonu, BPR'ın sessiz preemption etkisi, level/edge konfigürasyonunun tetikleme döngüsüyle ilişkisi — bütün bunlar BSP'nin **arkasında** kalan kararlardır.

Pratik tavsiye: bir Cortex-A platformuna sıkı bir gerçek-zaman sistem inşa ediyorsanız, vendor BSP'nin GIC sürücüsünü en az bir kez baştan sona okuyun. Hangi register'a neyi neden yazdığını öğrendiğinizde, sahada karşılaşacağınız en zor 8 hatadan en az 6'sını dakikalar içinde çözersiniz.

Renode'da bütün bu davranışlar — banked register'lar, ITARGETSR yönlendirmesi, priority arbitration, EOI sırası — modellenmiştir. Daha önceki [Renode ile Zynq7000 Simülasyonu]({% post_url 2026-05-14-renode-ile-zynq7000-simulasyonu %}) yazısında kurulan ortamda PL390 modelini debug'a takıp register düzeyinde bu hata modlarını yeniden üretmek mümkündür. Kendi sürücünüzü Renode üzerinde unit-test etmek, gerçek karta basmadan önce yukarıdaki kataloğun büyük kısmını elemine eder.

---

## Kaynaklar

- [ARM Generic Interrupt Controller Architecture Specification (IHI 0048B, GICv2)](https://developer.arm.com/documentation/ihi0048/b/)
- [ARM CoreLink GIC v3 and v4 Overview](https://developer.arm.com/architectures/learn-the-architecture/arm-corelink-generic-interrupt-controller-v3-and-v4-overview/single-page)
- [Arm GIC fundamentals — Arm Developer](https://developer.arm.com/documentation/198123/latest/Arm-GIC-fundamentals)
- [OSDev Wiki — Generic Interrupt Controller](https://wiki.osdev.org/Generic_Interrupt_Controller)
- [Cristian Sisterna — Interrupts in Zynq Systems (ICTP slides)](https://indico.ictp.it/event/8342/session/13/contribution/83/material/slides/0.pdf)
- [RealDigital — Configuring the ZYNQ GIC for Programmable Logic Interrupts](https://www.realdigital.org/doc/ffa70799dc85d2891c6a22562afc21d8)
- [Xilinx UG585 — Zynq-7000 SoC Technical Reference Manual](https://docs.amd.com/v/u/en-US/ug585-Zynq-7000-TRM)
- [Daniel Umanovskis — Bare-metal ARM tutorial, Chapter 7: Interrupts](https://github.com/umanovskis/baremetal-arm/blob/master/doc/07_interrupts.md)
- [Xilinx Wiki — Zynq-7000 Interrupt Latency Reference Design](https://xilinx-wiki.atlassian.net/wiki/spaces/A/pages/18842218/)
- [ARM Trusted Firmware — GICv2 driver](https://github.com/ARM-software/arm-trusted-firmware/tree/master/drivers/arm/gic/v2)
- [Arm Community — Spurious interrupt (1023) tartışması](https://community.arm.com/support-forums/f/embedded-and-microcontrollers-forum/6689/write-to-gicv2-s-gicd_itargetsr----wait-for-changes-to-take-effects)

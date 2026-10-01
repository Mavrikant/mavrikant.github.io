---
title: "Yığın Taşması Sessiz Bir Katildir: Gömülü Sistemlerde Worst-Case Stack Analizi"
subtitle: "Stack Overflow Is a Silent Killer — Worst-Case Stack Analysis for Embedded Systems"
background: "/img/posts/2.webp"
date: '2026-06-24 08:30:00'
layout: post
lang: tr
mermaid: true
categories: [gomulu]
tags: [aviyonik, gomulu, do-178c, arm, c]
---

Bir bug'ın en kötü versiyonu, sebebinden uzakta görünen versiyondur. Null pointer dereference temizdir: anında patlar, stack trace sebebi gösterir, debugger'ı açar oturursunuz. Yığın taşması (*stack overflow*) öyle değildir. Yığın, kendisine ayrılmış bölgenin altına bir bayt dahi taştığında, *anında bir şey olmaz*. Yığının komşusundaki veri ne ise — bir global değişken, bir RTOS görev kontrol bloğu, bir ISR vektör tablosu, başka bir görevin yığını — sessizce bozulur. Sistem belki saatlerce, belki günlerce çalışır. Sonra bir gün, yığını aşırı dolduran kombinasyon tetiklendiğinde, başka bir görevin kayıt değişkeni yanlış değere atlar, throttle açık kalır, autopilot mod değiştirir, sigorta atması gereken yer atmaz.

Bu yazı, gömülü sistemlerde **worst-case stack usage** (WCS) — en kötü durum yığın kullanımı — sorununu derinden ele alıyor. Önce gerçek bir kazanın anatomisine bakacağız, sonra problemi neden gözle çözemeyeceğimizi göreceğiz; arkasından statik analizin somut araçlarına (`-fstack-usage`, `-fcallgraph-info`, AbsInt StackAnalyzer, puncover, GNATstack) ineceğiz; sınırlarını — indirect call, recursion, assembly — tek tek konuşacağız. Sonra dinamik tarafa, *stack painting* tekniğine geçeceğiz; en sonda da donanım korumasını (MPU stack guard, ARMv8-M PSPLIM/MSPLIM) inceleyeceğiz. Yazıyı, DAL B ve üzeri aviyonik yazılımı için pratik bir kontrol listesiyle bitireceğiz.

---

## Bookout v. Toyota — Sessiz Katilin Adli Tıp Raporu

2013 yılında Oklahoma'da görülen *Bookout v. Toyota Motor Corp.* davası, gömülü yazılım tarihinin en çok atıf alan vakalarından biridir. Dava 2007 model bir Camry'nin istem dışı hızlanması (*unintended acceleration*) sonucu meydana gelen ölümlü bir kazaya dayanıyordu. Mahkemede davacı tarafın bilirkişisi olarak ifade veren Michael Barr (Barr Group), Toyota'nın Elektronik Gaz Kontrolü Sistemi (ETCS) firmware'inin kaynak kodunu — NDA altında, korumalı bir odada, haftalarca — inceledi ve birden fazla "tek nokta arıza"ya (*single point of failure*) yol açabilecek desen tespit etti. Bunların arasında en çok tartışılanı yığın taşmasıydı.

Barr'ın sunduğu rakamlar çarpıcıydı. 2005 Camry L4'ün sistem yığını (BasicTasks + ISRs için) **4096 bayt** olarak ayrılmıştı. Toyota bu yığını NASA'nın 2011'deki bağımsız değerlendirmesi sırasında ekibe bildirmiş, beyan edilen kullanım oranı **%41** idi. Barr'ın ekibi ölçtüğünde gerçek yüksek su markası (*high-water mark*) **%94**'tü. Aradaki fark, Toyota'nın elinde yığın kullanımını ölçecek bir araç ya da disiplin olmadığı için ortaya çıkmıştı. Kodda MISRA-C kurallarını ihlal eden recursion vardı; bu da analitik olarak bir üst sınır hesaplamayı imkansızlaştırıyordu. CPU'da yığın için donanım koruması (MPU stack guard ya da o tarihte mevcut olmayan ARMv8-M PSPLIM) yoktu. Sonuç olarak: yığın aştığında, OSEK işletim sisteminin kritik değişkenleri — yığının hemen üstüne yerleştirildikleri için — sessizce bozulabiliyordu. Bu bozulma, görevi öldürme ya da sayaç değişkenini sıfırlama gibi şekillerde, "throttle kapatma" görevini devre dışı bırakacak bir zinciri tetikleyebiliyordu.

Jüri Toyota'yı 3 milyon dolar tazminata mahkum etti; ardından şirket binlerce benzer davayı toplu olarak uzlaşmayla kapattı. Mühendislik açısından kalıcı miras şudur: bir yazılım WCS hatasından dolayı, mahkemede insanların hayatını kaybetmesine yol açtığı kanıtlanan ilk vakalardan biri **bu** idi. Yığın taşması artık akademik bir endişe değildir.

> **Kıssadan hisse.** Yığın boyutunu "biraz" büyütmek bir tasarım kararı değildir; ölçülmeyen bir parametredir. Ölçülmemiş bir parametre sertifikasyon sürecinde bir argüman olamaz. Ve bir uçak ya da otomobil firmware'inde, ölçülmemiş hiçbir parametreye güven duyma hakkımız yoktur.

---

## Neden "Biraz Büyük Tutalım" Çalışmaz

İlk refleks, yığını gereğinden çok daha büyük tutmaktır. Modern mikrodenetleyicilerde 256 KB SRAM rutindir; "her göreve 16 KB veririz, biter" diye düşünmek caziptir. Bu yaklaşımın üç ayrı problemi var.

**Birincisi, çoklu yığın çarpanı.** RTOS tabanlı bir sistemde her görev kendi yığınına sahiptir. 20 göreve 16 KB verirseniz 320 KB harcadınız — birçok Cortex-M cihazında bu, mevcut SRAM'in tamamı ya da fazlasıdır. Aviyonikte 30-50 göreve sahip ARINC 653 partisyonları nadir değildir. Yığın yastığı kısa süre içinde tasarımı kısıtlayan en büyük tek kalem haline gelir.

**İkincisi, kesme yuvalanması (*ISR nesting*).** Cortex-M'de kesmeler önceliğe göre yuvalanabilir. En kötü durumda, çalışan görevin yığınının üzerine en derin yuvalanmış ISR zinciri yığılır. Her ISR'in kullandığı yığını ayrı ayrı hesaplayıp en kötü yuvalamayı toplamak gerekir. "Görev yığını ne kadar olmalı" sorusunun cevabı, görevin kendi tepe kullanımı *artı* ISR zinciri tepe kullanımıdır.

**Üçüncüsü, sertifikasyon zorunluluğu.** DO-178C §6.3.4 kaynak kod analiz hedefleri arasında "kaynakların kullanılabilirliği"ni listeler ve bunun kanıtı *Software Accomplishment Summary*'de (SAS) "timing & memory margins" başlığı altında somut sayı olarak beyan edilir. ISO 26262-6 §7.4.17 paralel bir gereksinim getirir. "Bol bol tuttuk" yetmez; *ne kadar* bol tuttuğunuzu, *en kötü durumda ne kadar tüketildiğini* ve bu marjın *nasıl* belirlendiğini argüman olarak sunmanız gerekir. Marj genelde tepe kullanımın %25 ila %50 üzeri olarak alınır; ama önce **tepe kullanımı bilmeniz** lazım — onu da gözle bulamazsınız.

---

## Statik Analiz: Çağrı Grafiği + Çerçeve Boyutu

WCS sorununun matematik özü basittir. Programınızı bir çağrı grafiği (*call graph*) olarak düşünün: düğümler fonksiyonlar, kenarlar çağrılar. Her fonksiyonun kendi yığın çerçevesi (frame size) vardır: lokal değişkenler, kayıt değişkenlerinin saklanması, hizalama dolgusu. Bir yürütme yolundaki maksimum yığın kullanımı, o yolun düğümlerinin çerçeve boyutlarının toplamıdır. Programın WCS değeri ise tüm yürütme yolları üzerinden bu toplamın maksimumudur.

Çağrı grafiği döngüsüz (DAG) ise iş kolaydır: kaynak (`Reset_Handler` ya da `main`) düğümünden başlayıp her düğüm için *yan-bağımlı maksimum* hesaplanır. Bu, derin grafikleri bile lineer zamanda çözer.

<div class="mermaid">
graph TD
    main["main &mdash; 16 B"] --> proc["process_packet &mdash; 48 B"]
    proc --> parse["parse_header &mdash; 24 B"]
    proc --> crc["compute_crc &mdash; 32 B"]
    parse --> ntoh["ntohl_inline &mdash; 8 B"]
    crc --> tbl["crc_table_lookup &mdash; 16 B"]
</div>

Bu örnek grafikte iki olası yol vardır:

- `main → process_packet → parse_header → ntohl_inline` = 16 + 48 + 24 + 8 = **96 B**
- `main → process_packet → compute_crc → crc_table_lookup` = 16 + 48 + 32 + 16 = **112 B**

WCS = **112 B**. (Cortex-M'in 8 baytlık AAPCS hizalama gereksinimini de hatırlamak gerekir; pratikte derleyici çerçeve boyutlarını zaten 8'in katına yuvarlar.)

İşin kolay tarafı buydu. Geri kalanı, çerçeve boyutlarını ve çağrı grafiğini *güvenilir biçimde* nasıl çıkardığınız.

### GCC `-fstack-usage` — derleyiciden çerçeve boyutu

`-fstack-usage` ile derlerseniz, her `.c` dosyası için yanına bir `.su` dosyası düşer. Format dosya başına şu satırlardan ibarettir:

```
process_packet.c:42:8:process_packet    48    static
process_packet.c:71:5:parse_header      24    static
process_packet.c:89:5:compute_crc       32    static
```

Üç sütun: konum:fonksiyon, çerçeve baytı, niteleyici. Niteleyiciler kritik:

- **static**: çerçeve boyutu derleme anında biliniyor, sabit. Güvenle kullanın.
- **dynamic,bounded**: fonksiyon değişken-uzunluklu (VLA) bir dizi kullanıyor *ama* derleyici üst sınırı çıkarabildi. Üst sınırı raporlar; güvenli ama dikkatli kullanın.
- **dynamic**: çerçeve boyutu sınırsız (örn. `alloca(n)` ile `n` runtime değişken, veya sınırı statik olarak çıkarılamayan bir VLA). Bu satır WCS analizi açısından **kırmızı bayraktır**. Üst sınır hesaplanamaz; ya kodu değiştirin ya da runtime'da koruma şart.

Sadece `-fstack-usage` çağrı grafiğini vermez — yalnızca düğüm ağırlığını. Grafiği elde etmenin iki yolu var.

### GCC `-fcallgraph-info=su,da` — çağrı grafiği derleyiciden

GCC 10'dan itibaren (FSF 10, 2020 sürümü), `-fcallgraph-info=su,da` her derleme birimi için bir `.ci` dosyası üretir. Bu dosya [VCG (Visualization of Compiler Graphs)](https://www.absint.com/aisee/vcgmanual.htm) formatındadır ve çağrı grafiğini, `su` ile *stack usage* bilgisini, `da` ile *dynamic allocation* bilgisini içerir. Bütün CU'ların `.ci` dosyalarını birleştirip global çağrı grafiğini elde etmek için açık kaynak araçlar var; `simonjwright/stack_usage` en olgun olanlarından. (Yan not: `ccache`, `.ci` dosyalarını cache'lemiyor — eski ama hâlâ açık bir issue. Build sistemi tasarlarken aklınızda olsun.)

### Açık kaynak araçlar

- **`HBehrens/puncover`** — ELF + `.su` çıktısını parse eden web tabanlı bir görselleştirici. Çağrı grafiği üstünde yürüyebilir, hangi fonksiyonun WCS'ye en büyük katkıyı yaptığını görürsünüz. Cortex-M dünyasında en popüler ücretsiz seçenek.
- **`simonjwright/stack_usage`** — `.ci` (yani `-fcallgraph-info`) tabanlı, Ada/C ortamı için.
- **`ttsiodras/checkStackUsage`** — `.su` + objdump çağrı grafiği. Daha minimal, indirect call'lara dair manuel hint vermenize izin veriyor.

### Ticari (sertifika kitleriyle birlikte)

DAL A/B ya da ASIL-D işlerinde araç kalifikasyonu (DO-330 ya da ISO 26262-8) gerektiğinde, kullanılan araçların alt seviyeleri:

- **AbsInt StackAnalyzer** — binary üzerinde soyut yorumlama (*abstract interpretation*) yapar; yani derleyici çıktısını değil, linklenmiş `.elf`'i analiz eder. DO-178B/C qualification kit'i mevcut; AbsInt'in açıklamasına göre Airbus A380 yazılım geliştirmede kullanılıyor.
- **GNATstack (AdaCore)** — Ada ve C için, GCC `-fcallgraph-info` üzerine kurulu. Ada için recursion ve indirect-call senaryolarını argüman olarak alabiliyor.
- **Rapita RapiTest** — runtime stack painting tarafında çözüm; statik analizle birlikte hibrit yaklaşım için kullanılır.

Açık kaynak araçlar günlük geliştirme için harikadır; sertifika argümanı için ticari + kalifikasyon kiti yolu çoğu zaman tek pratik seçenektir.

---

## Statik Analizin Üç Karanlık Köşesi

Statik analiz, çağrı grafiği temizken eksiksiz cevap verir. Gerçek kod hiçbir zaman tam temiz değildir.

### 1. Indirect Call (function pointer)

```c
typedef void (*handler_t)(uint8_t*);
static handler_t handlers[16];
void dispatch(uint8_t op, uint8_t *buf) {
    handlers[op](buf);   // ← derleyici hedefi bilmez
}
```

Bu `dispatch` çağrısı, çağrı grafiğinde "asılı" kalır. `-fstack-usage` `dispatch`'in kendi çerçevesini verir ama altındaki alt-ağacı tahmin edemez. Çözüm seçenekleri:

- **Tip-imza üzerinden aşırı-yaklaşıklama (over-approximation)**: Aynı imzaya uyan tüm fonksiyonları olası hedef sayın, en büyüğünü kullanın. Hızlı ama gevşek; gereksiz büyük marj çıkarır.
- **Manuel anotasyon**: Aracın anlayacağı bir formatta "bu fonksiyon pointer şu fonksiyonlardan birine çözülür" diye listeleyin. AbsInt ve GNATstack bunu destekler. Kanıt yükü size ait: yanlış liste = yanlış WCS.
- **C++ vtable**: Sanal çağrılarda LTO ile devirtualization mümkün, ama emniyet kritikte LTO genelde kullanılmaz (debug & traceability sıkıntısı). Sanal fonksiyonlardan emniyet kritik kodda zaten kaçınılır (MISRA-C++, JSF C++ AV).

### 2. Recursion

MISRA-C 2012 **Rule 17.2** der ki: "Functions shall not call themselves, either directly or indirectly." Yasak. Çünkü recursion → çağrı grafiğinde döngü → WCS analitik olarak sonsuz (girdiye bağlı). DO-178C uyumlu kod tabanlarında recursion çoğunlukla statik analiz aracı tarafından (örn. Polyspace, LDRA, Coverity) reddedilir.

Aviyonik kodda recursion görüyorsanız, ya derinlik sınırlandırılmış (girdiye bağlı maksimum derinliği kanıtlanmış) ya da kuralın deviasyon argümanı yazılmış olmalıdır. "Stack-killing, MISRA-C rule-violating recursion" — Barr'ın Toyota raporundaki bir cümle. Tesadüf değil.

### 3. Assembly ve "siyah kutu" fonksiyonlar

Saf assembly ile yazılmış fonksiyonların derleyici tarafından bilinen bir çerçevesi yoktur. Genelde linker symbol'üne `.size` ya da ARM toolchain'inde `.cantunwind` direktifleri ekleyerek el ile beyan etmeniz gerekir. AbsInt gibi binary-seviye araçlar bunu kısmen kurtarır (assembly'yi de yorumlar); ama saf GCC akışında siz beyan etmezseniz analiz eksik kalır.

Üçüncü taraf kütüphaneler (closed-source RTOS, driver, vendor HAL) için de aynı sorun: `.su` dosyası yoktur. Ya kütüphane yazarından stack budget alın, ya da painting ile ölçün ve marj koyun.

### 4. Bonus: derleyici sürümü ve optimizasyon ayarı

Aynı kaynak kod, `-O0` ile `-O2` arasında **farklı WCS** üretir. Inlining küçük fonksiyonları büyük fonksiyonların çerçevesine emer; *tail-call optimization* çağrıyı sıçramaya çevirir. Bazen `-O2` daha az, bazen daha fazla yığın kullanır. Derleyici sürümünü ya da optimizasyon seviyesini değiştirdiğinizde WCS analizini *yeniden çalıştırın*. DO-178C'de bu zaten "değişiklik etki analizi" (*change impact analysis*) çatısı altında zorunludur.

---

## Dinamik Analiz: Stack Painting

Statik analizin yetmediği yerlerde, runtime'da gerçekten ne kadar yığın tüketildiğini ölçmek için **stack painting** (*high-water marking*) kullanılır. Yöntem ilkel ama etkili:

1. Görev başlamadan önce, yığın bölgesini tanınabilir bir desenle (`0xDEADBEEF`, `0xA5A5A5A5`) doldur.
2. Görevi olabildiğince geniş bir test profiliyle çalıştır.
3. Daha sonra yığın bölgesini tabandan başlayarak tara; orijinal desenin bozulmadığı en alt hücre, yığının ulaştığı en yüksek noktadır. Aradaki fark = high-water mark.

FreeRTOS bunu `uxTaskGetStackHighWaterMark()` ile dahili olarak yapar. Kendi RTOS'unuzda implementasyon ~20 satır C kodudur.

Avantajı: gerçek koşturma altında *gerçek* sayı verir. Dezavantajı: o sayı **sadece test ettiğiniz yolların** sayısıdır. Bir kez kapsanmamış bir hata yolu, gömülü bir watchdog handler, bir eşzamansız reset durumu — bu yolların hiçbiri painting raporunuza girmemiş olabilir.

Bu yüzden sektörde yaygın yaklaşım hibrittir: **statik analizden WCS üst sınırını al, painting'den gerçek operasyonel kullanımı al, ikisi arasındaki uçurumu açıkla.** Eğer statik 4 KB diyor, painting 1 KB diyorsa, aradaki 3 KB ya gerçekten girilemez (statik analiz tutucu) ya da test profiliniz eksik (canlı sistemde patlayabilir). Bu fark sertifikasyon argümanınızın merkezindedir.

---

## Donanım Koruması: Yığın Aştığında *Hemen* Anlayın

Statik + dinamik analiz iyi yapılmış bile olsa, yine de tek bir argo kelimeyle özetlenecek bir gerçek var: **bir gün yine de aşacak.** Yığını aşırı dolduran ve test edilmemiş bir kombinasyon prod'da tetiklenecek. Bu kaçınılmaz an için *son savunma hattı* donanım korumasıdır.

### MPU Stack Guard (ARMv7-M & ARMv8-M)

Cortex-M4/M7'de Memory Protection Unit (MPU) ile yığının altına okunamaz/yazılamaz bir bölge yerleştirebilirsiniz. Yığın aşıp bu bölgeye dokunduğu anda *MemManage* fault tetiklenir. FreeRTOS-MPU portu bunu standart olarak yapar. Avantajı: ARMv7-M dahil eski cihazlarda da çalışır. Dezavantajı: MPU bölge sayısı sınırlıdır (genelde 8), her görevin yığını için bir bölge ayırmak diğer korumalar için kullanılacak slot'ları yer.

### ARMv8-M PSPLIM/MSPLIM (Cortex-M23/M33/M35P/M55)

ARMv8-M mimarisi, yığın koruması için ilk kez dedicated donanım sundu: **PSPLIM** (Process Stack Pointer Limit) ve **MSPLIM** (Main Stack Pointer Limit) kayıt değişkenleri. Her ikisi de 32-bit; aşağı doğru büyüyen yığının erişebileceği en alt adresi (dahil) tutar.

Çekirdek davranışı: bir `PUSH`, `STMDB SP!`, ya da `SUB SP, #N` komutu, SP'yi LIM değerinin altına çekecek olursa, çekirdek **UsageFault** yükseltir ve UFSR (UsageFault Status Register) içindeki `STKOF` bitini (bit 4) sticky olarak set eder. Hata, **veri henüz yazılmadan** üretilir — yani aşılan bölgeye karışıklık girmez, anlık, deterministik bir fault elde edersiniz.

Reset_Handler'da MSPLIM'i kurmak için tipik kod (ARM scatter file / linker script `__StackLimit` sembolü tanımlamış olmalı):

```asm
Reset_Handler:
    ldr     r0, =__StackLimit
    add     r0, r0, #16            /* 16-bayt yastık (exception entry için) */
    msr     MSPLIM, r0
    /* ... normal init ... */
    bl      main
```

Yastık (`#16`) kritik. Bir exception entry sırasında çekirdek, görünür komut çalışmadan önce 8 register'ı (`R0-R3`, `R12`, `LR`, `PC`, `xPSR`) otomatik olarak yığına basar — yani fault anında zaten **32 bayt** PUSH'u talep eder. MSPLIM tam tabana kurulursa, fault handler giriş PUSH'unun kendisi LIM'in altına dolup yeni bir fault tetikler, bu da `LOCKUP` durumuna yol açar. Yastık bu chained-fault'u önler.

FreeRTOS gibi RTOS'larda PSPLIM her görev için ayrı tutulur ve `vTaskSwitchContext` sonrası bağlam değişimiyle birlikte yenilenir. Aktif Cortex-M33 FreeRTOS portu bunu desteklemektedir. Sonuç: *per-task hardware stack overflow detection*. Görev N yığınını aştığında, görev M etkilenmez; UsageFault N'in bağlamında yükselir; debugger'da hangi görev hangi noktada aştı, milisaniye geçmeden bilirsiniz.

ARMv7-M ile ARMv8-M arasındaki bu fark, modern emniyet kritik tasarımlarda parça seçimini doğrudan etkiler. Yeni bir DAL B/C projesi başlatıyorsanız ve Cortex-M sınıfı arıyorsanız, ARMv8-M (M33/M55) tercih etmek için yığın koruması tek başına yeterli bir gerekçedir.

---

## Yığını Şişiren Kalıplar — Kaçınılacaklar

Bazı kod kalıpları yığını sessizce büyütür. Aviyonik koddan kaçınılması gerekenlerin kısa listesi:

- **VLA (variable-length array)**: `int buf[n]` — `n` runtime değişken. Stack frame dinamik, MISRA-C 2012 Rule 18.8 yasaklar.
- **`alloca()`**: aynı sebepten yasak. Üst sınır yok.
- **Deep call chain in ISR**: bir ISR ne kadar fonksiyon çağırırsa, en kötü ISR-nested senaryosu o kadar derinleşir. ISR'larda mümkün olduğunca düz, kısa kod tutun; ağır işi DPC/bottom-half'a delege edin.
- **`printf` / `sprintf` / `snprintf` ailesi**: format string parser'ı, conversion buffer'ları, locale state... 1-2 KB çerçeve bulmak şaşırtıcı değil. Aviyonikte tipik olarak yasaklı; yerine sabit-format custom logger.
- **Derin nested struct'lar lokal değişken olarak**: 4 KB'lık bir struct'u lokal değişken olarak deklare ederseniz, çerçeveniz 4 KB olur. Heap ya da static storage'a alın.
- **Recursive descent parser**: bir JSON / XML / komut parser'ı doğal olarak recursive yazılır; ama emniyet kritikte iteratif yeniden yazılır ya da explicit derinlik sınırı + sayaç ile korunur.
- **C++ exception**: throw/catch zinciri unwind sırasında ek yığın kullanır. C++ kullanan aviyonik kod tabanlarında exception genelde kapatılır (`-fno-exceptions`).

---

## Pratik Playbook — DAL B+ İçin Bir Akış

Yığın güvenliğini bir proje pratiği olarak nasıl kurarsınız? Sahada işleyen bir taslak:

1. **İlk günden `-fstack-usage` her derlemede açık olsun.** CI'da `.su` dosyaları artifact olarak saklansın; öyle ki herhangi bir tarihteki bir build için WCS hesabını yeniden üretebilesiniz.
2. **`dynamic` qualifier'lı satır = build kırılır.** CI gate'i kurun: dynamic (bounded olmayan) bir frame görürse `make` patlasın. Geliştiriciyi sınırı kanıtlamaya zorlayın.
3. **Per-task WCS hesabı haftalık raporlansın.** Açık kaynak puncover ya da basit bir Python script: her görevin entry noktasından başlayıp WCS'yi hesaplasın; herhangi bir görev önceki haftaya göre %10'dan fazla yığın artırdıysa otomatik issue açılsın.
4. **Recursion ve indirect call'lar elle anote edilsin.** Bir `stack_annotations.txt` tutun; sürüm kontrolünde olsun; review zorunlu olsun. WCS aracı bu anotasyonları girdi alsın.
5. **Stack painting üretim build'inde de aktif olsun.** Her görev için high-water mark'ı periyodik telemetri ile loglayın. Statik analizle painting arasındaki farkın "neden var" cevabını bilin.
6. **Marjı %25-50 olarak alın ve değişmesin.** "Sığmıyor, marjı %10'a indirelim" eğilimine direnin. Marj yığın değil, *bilinmeyen için* yastıktır; bilinmeyenler indirimle azalmaz.
7. **Donanım koruması varsa kullanın.** ARMv8-M: PSPLIM her zaman açık. ARMv7-M/Cortex-M4/M7: FreeRTOS-MPU ya da eşdeğer MPU stack guard. Korumayı "olmayan koşullar için" değil, "olduğu gün için" kuruyorsunuz.
8. **SAS'a sayıyı yazın, marjı argümanlayın.** "Worst-case observed: 2.4 KB. Statik üst sınır: 3.1 KB. Tahsis: 4.5 KB. Marj: %45." Bu üç sayı olmadan tamamlanmış bir argüman yok.

---

## Açık Sorular ve İleri Okuma

Burada ele almadığım üç başlık, kendi yazısını hak ediyor:

- **CompCert ve formel doğrulanmış derleyici çıktısı**: WCS argümanının zayıf halkalarından biri, derleyicinin ürettiği makine kodunun semantiğine güvenmektir. Formel doğrulanmış derleyicilerle bu argüman güçleniyor. ATR, ATR 42/72'nin MFC_NG nesli aviyonik yazılımında CompCert + AbsInt Astrée'yi kullandığını duyurmuştu.
- **Stack-painted DMA buffer'ları**: DMA hedef tampon yığına alındığında painting bozulur; ölçüm aldatıcı olur. DMA tamponlarını static/heap'e ayırmak ya da painting bölgesinin dışında tutmak ayrı bir disiplin gerektirir.
- **ARINC 653 partition stack budgeting**: Time/space partitioning altında, her partition kendi WCS argümanını sunar; sistem entegratörü bunları toplayıp toplam SRAM bütçesine sığdırır. Partition arası yığın izolasyonu da MMU/MPU ile zorlanır.

Yığın güvenliği, soyut bir "iyi pratik" değil; ölçülebilir, kanıtlanabilir, sayıyla ifade edilebilir bir tasarım niteliğidir. Bookout v. Toyota davasındaki kritik fark, %41 ile %94 arasındaki o 53 puanlık uçurumdu. O uçurum bir araç eksikliği değildi; bir *disiplin* eksikliğiydi. Bu disiplin maliyetli değil; CI'a 200 satır script ve `-fstack-usage` bayrağıyla başlar.

---

## Kaynaklar

- [Embedded Artistry — Three GCC Flags for Analyzing Memory Usage](https://embeddedartistry.com/blog/2020/08/17/three-gcc-flags-for-analyzing-memory-usage/)
- [GCC Developer Options — `-fcallgraph-info`](https://gcc.gnu.org/onlinedocs/gcc/Developer-Options.html)
- [HBehrens/puncover — open source stack & code-size analyzer](https://github.com/HBehrens/puncover)
- [simonjwright/stack_usage — `-fcallgraph-info` tabanlı analiz](https://github.com/simonjwright/stack_usage)
- [ttsiodras/checkStackUsage](https://github.com/ttsiodras/checkStackUsage)
- [AbsInt StackAnalyzer](https://www.absint.com/stackanalyzer/index.htm)
- [AdaCore GNATstack — Getting Started](https://docs.adacore.com/live/wave/gnatstack/html/gnatstack_ug/Getting_Started_with_GNATstack.html)
- [Interrupt (Memfault) — A Guide to Using ARM Stack Limit Registers](https://interrupt.memfault.com/blog/using-psp-msp-limit-registers-for-stack-overflow)
- [Interrupt (Memfault) — Measuring Stack Usage the Hard Way](https://interrupt.memfault.com/blog/measuring-stack-usage)
- [Miro Samek — Are We Shooting Ourselves in the Foot with Stack Overflow?](https://www.state-machine.com/are-we-shooting-ourselves-in-the-foot-with-stack-overflow)
- [EDN — Toyota's Killer Firmware: Bad Design and Its Consequences](https://www.edn.com/toyotas-killer-firmware-bad-design-and-its-consequences/)
- [Safety Research — Toyota Unintended Acceleration and the Big Bowl of "Spaghetti" Code](https://safetyresearch.net/toyota-unintended-acceleration-and-the-big-bowl-of-spaghetti-code/)
- [Bookout v. Toyota — Michael Barr Trial Slides (archive.org)](https://archive.org/details/BookoutvToyotaMichaelBarrTrialSlides)
- [Rapita Systems — Stack Usage with RapiTest (stack painting)](https://www.rapitasystems.com/blog/how-measure-stack-usage-through-stack-painting-rapitest)
- [Beningo — 3 Ways to Perform a Worst-Case Stack Analysis](https://www.beningo.com/3-ways-to-perform-a-worst-case-stack-analysis/)
- ARM Cortex-M33 Generic User Guide — *PSPLIM/MSPLIM registers*, Arm DUI 0553 / DDI 0553

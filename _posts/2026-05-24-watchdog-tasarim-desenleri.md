---
title: "Watchdog Timer Tasarım Desenleri: Tek-Stage Yanılgısından Rendezvous Pattern'e"
subtitle: "Embedded Watchdog Design Patterns: From the Single-Stage Fallacy to the Rendezvous Pattern"
background: "/img/posts/1.webp"
date: '2026-05-24 09:00:00'
layout: post
lang: tr
mermaid: true
---

Toyota'nın 2009-2010 döneminde milyonlarca aracı *unintended acceleration* iddiasıyla geri çağırmak zorunda kaldığı süreçte, *Bookout v. Toyota Motor Corp.* davasında bilirkişi olarak görev yapan Barr Group'un yayımladığı teknik bulgular gömülü mühendislere ders niteliğinde uyarılar bıraktı. Engine Control Module yazılımında raporlanan ondan fazla problemden biri tanıdık geliyordu: **tek-stage bir watchdog timer**, ana görevlerden biri kilitlendiğinde dahi düzgün besleniyordu. Watchdog hiç havlamıyordu çünkü onu besleyen kod yolu hâlâ çalışıyordu — ama gaz pedalı verisini işleyen görev askıdaydı.

Bu detay, watchdog mekanizması hakkındaki yaygın bir yanılgıyı netleştiriyor: bir watchdog timer'ın gerçek görevi, sistemin "**hayatta**" olduğunu değil, sistemin "**doğru durumda**" olduğunu doğrulamaktır. Aradaki fark hem mimari, hem standart uyumu, hem de saha emniyeti açısından kritiktir.

Bu yazıda watchdog timer'ın evrimini; tek-stage tasarımın hangi başarısızlık modellerine karşı sessiz kaldığını; *rendezvous pattern*, windowed ve external watchdog desenlerinin getirdiği koruma katmanlarını; ve ISO 26262, IEC 61508 ile DO-178C/254'ün bu mekanizmayı nasıl konumlandırdığını ele alacağız. Hedef, bir sonraki tasarımınızda watchdog'u "son çare reset" refleksinden çıkarıp gerçek bir sistem sağlık sensörüne dönüştürmek.

---

## Kısa Bir Tarihçe

Watchdog kavramı, mikrodenetleyicilerden önce ortaya çıktı. 1970'lerin sonlarında ayrı analog/zamanlayıcı IC'leriyle kurulan bu devreler, ana işlemcinin bir GPIO hattını belirli aralıklarla tetiklemesini bekler, beklenen zamanda tetikleme gelmezse RESET pinini düşürerek sistemin yeniden başlamasını sağlardı. Bu yapı önce uzay aracı sistemlerinde ve tıbbi cihazlarda yaygınlaştı; çünkü her ikisinde de bir CPU kilitlenmesi (single event upset, deadlock, kozmik radyasyon kaynaklı flip) operasyonel bir felakete dönüşebiliyordu.

1980'lerin ortalarından itibaren Motorola 68HC11, Intel 8051 türevleri, sonrasında AVR ve PIC ailesi gibi mikrodenetleyiciler, watchdog devresini doğrudan çip içine almaya başladı. Bugün ARM Cortex-M serisinin tamamı, RISC-V'nin yaygın çekirdekleri ve neredeyse her safety-critical MCU, en az iki bağımsız watchdog modülünü standart olarak içeriyor. Ne var ki çipin watchdog modülünü içermesi, sistemin gerçekten korunduğu anlamına gelmiyor — koruma, donanımdan çok **kullanım deseninde** saklı.

---

## Yanlış Soru: "Sistem hayatta mı?"

Saha üstünde sıkça karşılaşılan kullanım örüntüsü şudur:

```c
int main(void) {
    HAL_Init();
    SystemClock_Config();
    MX_IWDG_Init();   // 4 saniye timeout
    while (1) {
        HAL_IWDG_Refresh(&hiwdg);
        run_application();
    }
}
```

Bu kod, watchdog'a soruyor: *"Main loop'a girebildim mi?"* Yanıtı **evet** olduğu sürece sistem reset edilmiyor. Buradaki yanılgı şu: ana döngünün dönmesi, sistemin doğru çalıştığını göstermez. `run_application()` içindeki bir görev sonsuz bir döngüye girse, bir mutex kilidi açılmasa, bir sensör driver'ı askıda kalsa bile döngü dönmeye devam eder ve watchdog tatmin olur.

Doğru soru şudur: *"Sistemin her kritik göreceği, son N milisaniye içinde beklenen şekilde ilerlediğine dair kanıt verdi mi?"* Bu soru, watchdog'un mimarisini temelden değiştirir. Artık tek bir refresh çağrısı değil, **her kritik görevden gelen bir yaşam belgesi** ister.

---

## Tek-Stage Yanılgısı: Somut Bir Başarısızlık Senaryosu

Üç kritik göreceği olan basit bir gömülü sistem düşünelim:

- `task_sensor`: 10 ms periyotla IMU verisini okur.
- `task_control`: 20 ms periyotla kontrol algoritmasını koşar.
- `task_comm`: 100 ms periyotla CAN bus üzerinden veri yayar.

Eğer watchdog yalnızca scheduler'ın **idle hook**'unda besleniyorsa şu senaryo açıkça sessiz kalır:

1. `task_control` bir bölme hatası nedeniyle bir hata kesmesine düşer; hata işleyici (default handler) sistemi sonsuz `while(1)` döngüsünde tutar.
2. Diğer iki görev priority'leri daha düşük olduğu için bir daha çalışma fırsatı bulamaz.
3. Idle task da koşmaya devam eder mi? Hayır — kesme zaten daha yüksek bağlamda olduğu için idle hook tetiklenmez.

Bu sade örnekte tek-stage watchdog **gerçekten** çalışır: idle koşmadığı için besleme yapılmaz, sistem reset olur. Ancak gerçek olay senaryoları neredeyse hiç bu kadar temiz değildir. Daha tipik bir hata şöyledir:

1. `task_comm` içinde kullanılan bir kuyruk producer/consumer dengesinin bozulması nedeniyle `xQueueReceive` çağrısı `portMAX_DELAY` ile asılı kalır.
2. Diğer iki görev sorunsuz çalışmaya devam eder; idle task da arada koşar.
3. Watchdog beslenmeye devam eder. Sistem 24 saat boyunca **iletişimsiz** kalır.

Bu, Barr Group'un Toyota analizinde altını çizdiği başarısızlık ailesinin tam karakteristiğidir: bir görev askıdayken, başkalarının çalışması watchdog'u tatmin etmeye yeter.

---

## Rendezvous Pattern: "Herkesin Ses Vermesi Şart"

Bu sorunun ilk doğru çözümünü yazılı kayıtlara geçiren isim Jack Ganssle'dir. 2004 tarihli *Great Watchdog Timers for Embedded Systems* makalesinde ve sonrasında genişlettiği *Watchdog Timers Revisited* yazısında, watchdog'un **her kritik görevin kendi imzasını taşıdığı bir randevu noktası** olarak tasarlanması gerektiğini argümanlar. Pattern üç temel adımdan oluşur:

1. Her kritik görev, döngüsünün sonunda kendisine ait bir flag bit'i set eder.
2. Sistemde tek bir "Watchdog Görevi" (en yüksek öncelik, çok kısa süreli) tüm flag'lerin set olup olmadığını kontrol eder.
3. Yalnızca tüm flag'ler set ise donanım watchdog'unu besler, ardından flag'leri temizler.

<div class="mermaid">
sequenceDiagram
    participant S as task_sensor
    participant C as task_control
    participant K as task_comm
    participant W as task_watchdog
    participant H as HW Watchdog

    S->>W: flag_sensor = 1
    C->>W: flag_control = 1
    K->>W: flag_comm = 1
    Note over W: tüm flag'ler set mi?
    W->>H: refresh
    Note over W: flag'leri sıfırla
    W->>W: bekle (50 ms)
</div>

Bu desenin gücü, donanım watchdog timeout'unun (örneğin 200 ms) artık her bir görevin maksimum gecikme süresinin değil, en yavaş görevin periyodunun bir miktar üstüne ayarlanabilmesidir. Eğer `task_comm` 100 ms periyotta çalışıyorsa, watchdog görevi 150 ms'de bir flag kontrolü yapar ve donanım WDT'sini 200 ms timeout ile besler. Herhangi bir görev iki periyot boyunca yaşam belgesi vermezse sistem reset edilir.

Pattern'in pratik tuzakları vardır:

- **Flag erişimi atomik olmalı:** ARM Cortex-M3+ üzerinde 32-bit bayt erişimi atomiktir; ancak `volatile` qualifier'ı atlamak derleyicinin değişkeni kaydetmemesine yol açabilir.
- **Watchdog görevinin önceliği en yüksek olmalı:** Aksi halde başka bir görevin starvation'ı, watchdog görevinin starvation'ına dönüşür.
- **Flag set etme noktası kritiktir:** Görev başında değil sonunda, mutlaka tüm işin tamamlandığına emin olduktan sonra.
- **Birden fazla görev örneği:** Eğer aynı task fonksiyonu birden çok instance ile çalışıyorsa, her instance'ın ayrı flag'i olmalı.

Aşağıda FreeRTOS üzerinde sade bir referans uygulama:

```c
#define WDT_TASK_SENSOR     (1u << 0)
#define WDT_TASK_CONTROL    (1u << 1)
#define WDT_TASK_COMM       (1u << 2)
#define WDT_ALL_FLAGS       (WDT_TASK_SENSOR | WDT_TASK_CONTROL | WDT_TASK_COMM)

static volatile uint32_t wdt_flags = 0;

static inline void wdt_checkin(uint32_t mask) {
    __atomic_or_fetch(&wdt_flags, mask, __ATOMIC_RELAXED);
}

void task_sensor(void *p) {
    for (;;) {
        read_imu_samples();
        process_samples();
        wdt_checkin(WDT_TASK_SENSOR);
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}

void task_watchdog(void *p) {
    for (;;) {
        vTaskDelay(pdMS_TO_TICKS(150));
        uint32_t snapshot = __atomic_exchange_n(
            &wdt_flags, 0, __ATOMIC_RELAXED);
        if ((snapshot & WDT_ALL_FLAGS) == WDT_ALL_FLAGS) {
            HAL_IWDG_Refresh(&hiwdg);
        }
        /* Aksi halde besleme yapma — donanım WDT zaten saymaya devam ediyor */
    }
}
```

Dikkat: bu kodda watchdog görevi `WDT_ALL_FLAGS` tamamlanmadığında **hiçbir şey yapmaz**, hata loglamak veya panic state'e gitmek için ek bir mekanizma kurulmalıdır — donanım reset'in tek seçenek olduğu durum bile bir failure transient'ı geride bırakır.

---

## Windowed Watchdog: "Çok Erken Beslersen de Resetlerim"

Klasik watchdog yalnızca **timeout** aşıldığında reset eder. Yani siz watchdog'u istediğiniz kadar erken besleyebilirsiniz; bunu yapmak sistemi rahatsız etmez. Ne yazık ki bu özellik bir başka başarısızlık ailesini görünmez yapar: **kontrolsüz hızda dönen ölü bir döngü**.

Senaryoyu somutlaştıralım. Tek-stage WDT besleme çağrısı yanlışlıkla bir kesme servis rutinine yerleştirildi. ISR sabit periyotta tetikleniyor. Şimdi ana yazılım çökse, bir görev askıya alınsa veya scheduler hiç koşmasa bile, ISR refresh'i yapmaya devam ediyor — watchdog hiç havlamaz. Bu durum, derleyici dead-code elimination yaparken bile fark edilmeyebilir.

**Windowed watchdog** mekanizması bu açığı kapatır. Refresh için izin verilen bir alt sınır ve bir üst sınır vardır:

```
+---+----------+---------+
| 0 | yasaklı  | izinli  | timeout
+---+----------+---------+
0   t_min      t_max     T
```

Eğer refresh `t_min` öncesinde gelirse — yani "çok erken" beslerseniz — sistem yine reset edilir. Bu, refresh kodunun sistem akışında **doğru bağlamda** koştuğunu zorunlu kılar. STM32 ailesinde Independent Watchdog (IWDG) ve Window Watchdog (WWDG) iki ayrı modüldür ve genellikle birlikte kullanılırlar: IWDG bağımsız bir LSI saatiyle çalışır, WWDG sistem saatinden beslenir ama pencere koruması sunar. NXP S32K, Renesas RH850 ve Infineon AURIX gibi otomotiv MCU'ları da neredeyse istisnasız pencereli watchdog içerir; bu MCU'lar ISO 26262 ASIL-D hedefli tasarlandığı için tek-stage WDT'nin diagnostic coverage'ı yetersizdir.

Pencerenin pratik hesaplaması basit görünür ama incelikli detayları vardır:

- **`t_min`**, en hızlı geçerli besleme senaryosunun süresinden biraz daha küçük olmalı. Eğer rendezvous pattern 150 ms'de bir besliyorsa, `t_min` ~120 ms civarında ayarlanır.
- **`t_max`**, en yavaş geçerli senaryonun süresinden ve cache miss'lerin yaratabileceği jitter'dan emin olarak büyük olmalı.
- Pencere genişliği daraldıkça koruma güçlenir ama **kararlı çalışma marjı azalır**. ISO 26262 perspektifinden pencere daralması diagnostic coverage'ı artırırken, false positive reset riskini de yükseltir; bu trade-off'u Hazard Analysis & Risk Assessment çıktısı belirler.

---

## External (Independent) Watchdog: "Aynı Silikon, Aynı Arıza"

Çip içi watchdog'lar dahi aynı silikonu, aynı saat ağacını, aynı güç düzlemini paylaşır. Bir clock tree arızası, bir power supply glitch'i, bir radyasyon kaynaklı flip — bunların tamamı hem ana CPU'yu hem watchdog modülünü aynı anda etkileyebilir. Emniyet kritik tasarımlarda bu, kabul edilemez bir **ortak sebep arızasıdır** (common cause failure, CCF).

Çözüm, watchdog'u tamamen ayrı bir IC'ye taşımaktır. Maxim/Analog Devices MAX6369-MAX6374 ailesi, ON Semi NCV890130, TI TPS3823, STM TPS3823 gibi düşük maliyetli "watchdog supervisor" IC'leri tam bu rolü oynar. Daha gelişmiş tasarımlarda — özellikle ASIL-D otomotiv ve aviyonik DO-254 hedefli sistemlerde — *external safety companion* IC'ler (Infineon TLF35584, NXP FS65xx, TI TPS65381) sadece watchdog değil, **soru-cevap (question-answer) watchdog** desteği de sunar:

1. Companion IC ana MCU'ya rastgele bir "soru" gönderir.
2. MCU bu soruyu, yalnızca yazılım kritik yolu doğru çalışıyorsa hesaplayabildiği bir cevaba dönüştürür.
3. Cevap belirli bir pencerede companion IC'ye geri gönderilir.
4. Eksik veya yanlış cevap → reset hattı + safe state.

Bu yapının özelliği, basit GPIO toggle'ı taklit etmenin imkânsızlığıdır. Yazılımda ölü bir döngüye girmiş bir görev, doğru cevabı **hesaplayamaz**; ISR'de boş bir GPIO toggle'ı yeterli olmaz. AUTOSAR Watchdog Manager (WdgM) modülü, bu soru-cevap mekanizmasını "supervised entity" kavramı üzerinden standardize eder ve birden fazla kritik fonksiyonun bağımsız çağrı zinciri olarak izlenmesini mümkün kılar.

---

## Reset Sebebini Ayırt Etmek: Çoğunlukla Atlanan Adım

Watchdog reset attığında çoğu sistem yeniden başlar ve **hiçbir şey loglanmaz**. Sahaya çıkmış bir cihazın saatte bir reset attığını ancak nihai müşteri "bazen donuyor" diye geri bildirim verdiğinde fark edersiniz. Oysa hemen her modern MCU, son reset sebebini bir statü register'ında tutar:

| MCU ailesi | Register | Bit isimleri |
|---|---|---|
| STM32 (F4, F7, H7) | `RCC->CSR` | `IWDGRSTF`, `WWDGRSTF`, `SFTRSTF`, `BORRSTF`, `PORRSTF`, `PINRSTF`, `LPWRRSTF` |
| NXP S32K | `RCM->SRS` | `WDOG`, `SW`, `LOCKUP`, `POR`, `LVD`, `PIN` |
| Nordic nRF52 | `POWER->RESETREAS` | `RESETPIN`, `DOG`, `SREQ`, `LOCKUP` |
| ESP32 | `RTC_CNTL_RESET_CAUSE` | `RTCWDT_RTC_RESET`, `TG0WDT_SYS_RESET`, `TG1WDT_SYS_RESET`, `INTRUSION`, `BROWN_OUT` |

İyi tasarlanmış bir bootloader, bu register'ı boot sürecinin en başında okur, kalıcı belleğe (genellikle backup SRAM, MRAM veya küçük bir flash sektörü) son N reset sebebini timestamp ile yazar ve register'ı temizler. Bu, sahada görülen davranışların kök neden analizinde **paha biçilmez** bir kaynaktır. ISO 26262 perspektifinden bu adım "post-reset diagnostic" gereksinimini doğrudan karşılar.

Bu kayıt mekanizması atlanırsa, watchdog'unuz görevini yapmış olsa bile arkasından ne öğrendiğinizi asla bilemezsiniz — sistem yalnızca üzerini örterek devam eder.

---

## ISR İçinde Beslemek: Sessiz Cinayet

Bazı kod tabanlarında watchdog refresh çağrısının kesme servis rutininin (ISR) içinde olduğunu görürsünüz. Tipik gerekçe: *"Periyodik timer ISR'm zaten her 10 ms'de tetikleniyor, neden ekstra bir görev kuruyim?"* Bu yaklaşım üç bağımsız nedenle hatalıdır:

1. **ISR çalışırken sistemin geri kalanı çalışıyor olmayabilir.** Bir hata kesmesi (HardFault, MemManage, BusFault) sistemi yakaladığında bile, NMI veya yüksek öncelikli SysTick ISR'i koşmaya devam edebilir. Refresh hâlâ yapılır, sistem reset olmaz.
2. **Görev seviyesinde bir kilitlenme ISR seviyesinde tespit edilmez.** ISR yalnızca kesme kaynağının canlı olduğunu gösterir; görev scheduler'ının çalıştığını değil.
3. **Bağlam doğrulaması yapılamaz.** Görev kendi flag'ini henüz set etmemiş olsa bile ISR refresh'i körü körüne ilerleyebilir.

Bu desen, Toyota olay analizinde de açıkça tanımlanan başarısızlık ailesinin parçasıdır. Bir watchdog refresh'i, **her zaman** bir görev bağlamında (tercihen yüksek öncelikli adanmış watchdog görevinde) ve **her zaman** doğrulanmış bir health-check'ten sonra yapılmalıdır.

---

## Standartların Gözünden Watchdog

### DO-178C / DO-254 (Aviyonik)

DO-178C, watchdog timer'ı doğrudan bir "kontrol kategorisi" olarak listelemez; bunun yerine §6.3.4.f kapsamında *resource usage analysis* ve §6.4.3 kapsamında *execution time analysis* aktivitelerinin parçası olarak konumlandırır. Pratikte DAL A ve DAL B uygulamalarda watchdog şu işlevlere hizmet eder:

- Sonsuz döngü detection (LLR'den HLR'ye temel test edilebilirlik gereği)
- Worst-case execution time (WCET) aşımının dış-kontrolü
- Partition memory protection ile birlikte tek-fail-detect kanıtı

DO-254 ise donanım watchdog'unu özellikle Level A/B donanım tasarımlarında **fault containment region** tanımının bir parçası olarak ele alır; lockstep CPU mimarileri ve external supervisor IC'ler bu nedenle aviyonik uçuş kontrol bilgisayarlarında neredeyse standarttır.

### ISO 26262 (Otomotiv)

ISO 26262-5 (donanım emniyet mekanizmaları), watchdog'u doğrudan bir *safety mechanism* olarak listeler ve diagnostic coverage hesaplamasında niceliksel bir katkı tanımlar. Tek-stage WDT genellikle "low diagnostic coverage" (~60%) sınıfına girer; windowed + question-answer watchdog kombinasyonu "high diagnostic coverage" (>%99) elde etmek için tercih edilir. ASIL-D hedeflerinde external safety companion IC'leri pratik bir zorunluluktur.

### IEC 61508 (Genel Fonksiyonel Emniyet)

IEC 61508-2 Annex A, watchdog mekanizmalarını "Programme sequence monitoring" başlığı altında ayrıntılı kategorize eder. Mekanizmaları DC katkısına göre üç gruba ayırır:

- *Temporal monitoring* (basit timeout): düşük DC
- *Logical monitoring* (sıra/kombinasyon kontrolü): orta DC
- *Combined temporal + logical*: yüksek DC

Bu sınıflandırma, niçin endüstriyel SIL 3 ve SIL 4 sistemlerinde external safety companion'ların standart haline geldiğini açıklar.

### AUTOSAR Watchdog Manager (WdgM)

Otomotiv yazılım mimarisinde AUTOSAR 4.x ile birlikte gelen Watchdog Manager modülü, donanım watchdog'unu *Supervised Entity* (SE) kavramı üzerinden soyutlar. Her SE üç boyutta izlenir:

- **Alive supervision:** SE belirlenmiş frekansta check-in yapıyor mu?
- **Deadline supervision:** SE belirli bir aralık içinde ilgili checkpoint'ler arasında ilerliyor mu?
- **Logical supervision:** SE checkpoint'leri doğru sırayla mı ziyaret ediyor?

Bu üçlü model, yukarıda anlattığımız rendezvous pattern'in matürleşmiş halidir ve safety-critical otomotiv ECU'larının fiili standardıdır.

---

## Pratik Tasarım Kararları Kontrol Listesi

Bir gömülü tasarımda watchdog konusunu karara bağlamak için aşağıdaki listeyi adım adım yanıtlamak iyi bir başlangıçtır:

- **Hangi başarısızlık modlarına karşı koruyorsunuz?** Yalnız CPU lockup mu, görev askıya alınması mı, kontrolsüz hızda dönen döngü mü, ortak sebep clock arızası mı?
- **Watchdog refresh'i hangi bağlamda yapılacak?** Asla ISR'de. Tercihen yüksek öncelikli adanmış görevde, rendezvous pattern ile.
- **Tek-stage mı, windowed mi gerekli?** ASIL-B/D, SIL 3/4, DAL A/B hedefleri windowed bekler.
- **Internal mı, external mı?** Common cause failure önemliyse external. Soru-cevap watchdog gerekiyorsa external safety companion.
- **Reset sebebi ayırt ediliyor mu?** Reset cause register'ı her boot'ta okunmalı, kalıcı belleğe loglanmalı, register temizlenmeli.
- **Reset sonrası safe state ne?** Watchdog reset attıktan sonra sistemin gideceği başlangıç durumu, hazard analizinde tanımlı olmalı.
- **Watchdog'un kendisi test ediliyor mu?** Bazı standartlar (özellikle ISO 26262 ve IEC 61508) watchdog'un kendi başına bir self-test'ten geçmesini bekler — örneğin power-on sırasında bilerek geç refresh yapıp reset üretmek (yalnız factory test akışında).
- **Watchdog parametreleri konfigürasyon yönetimi altında mı?** Timeout değerleri, pencere sınırları, izlenecek görevler — bunların hepsi sürüm kontrolünde versiyonlanmalı; alanda parametre tweak'lenmemeli.

---

## Özet

Watchdog timer, gömülü sistemde "bir şey ters giderse en kötü ihtimalle resetleriz" diye düşünülen bir konfor mekanizması değil; **sistem sağlığının aktif bir sensörüdür**. Tek-stage tasarımlar — hele ISR'de beslenen tek-stage tasarımlar — gerçek başarısızlık modlarının çoğunu sessizce kaçırır. Rendezvous pattern, windowed watchdog ve external safety companion IC'leri bu sessiz başarısızlık ailelerinin her birine spesifik bir koruma katmanı koyar.

Toyota olayında Barr Group'un bulguları, kötü tasarlanmış bir watchdog'un yokluğundan daha zararlı olabileceğini gösterdi: var olduğunu ve görevini yaptığını sanmak, mühendisleri ek koruma katmanı düşünmekten alıkoyar. Bu nedenle bir sonraki tasarımınızda watchdog satırına ulaştığınızda kendinize üç soruyu hatırlatın:

1. Hangi göreceği koruyorum — sistemin "hayatta" olmasını mı, "doğru durumda" olmasını mı?
2. Refresh'in koştuğu bağlam, izlemek istediğim görevden bağımsız mı?
3. Watchdog'un kendisi tek bir arıza moduyla birlikte susabilir mi?

Bu üç sorunun cevabı, sahada gözünüze görünmeyen davranışların kaynağında genellikle yer alır.

---

## Kaynaklar

- [Jack Ganssle, *Great Watchdog Timers for Embedded Systems* (2004)](https://www.ganssle.com/watchdogs.htm)
- [Michael Barr, *Bookout v. Toyota Motor Corp. Expert Witness Testimony — Summary*](https://embeddedgurus.com/barr-code/2013/10/an-update-on-toyota-and-unintended-acceleration/)
- [Phillip Koopman, *A Case Study of Toyota Unintended Acceleration and Software Safety*, Carnegie Mellon University presentation (2014)](https://users.ece.cmu.edu/~koopman/pubs/koopman14_toyota_ua_slides.pdf)
- [Niall Murphy, *Watchdog Timers* (Embedded Systems Programming, 2000)](https://barrgroup.com/embedded-systems/how-to/watchdog-timer-anti-patterns)
- [STMicroelectronics, *AN4502 — Watchdog timer for STM32 microcontrollers*](https://www.st.com/resource/en/application_note/an4502-watchdog-timer-for-stm32-microcontrollers-stmicroelectronics.pdf)
- [NXP, *S32K1xx Series Reference Manual — WDOG chapter*](https://www.nxp.com/products/processors-and-microcontrollers/arm-microcontrollers/s32k-automotive-mcus:S32K-MCUS)
- [Infineon, *TLF35584 Safety Companion IC Datasheet*](https://www.infineon.com/cms/en/product/power/system-basis-chips-sbc/system-supply-ic-with-multiple-supplies-and-watchdog-tlf35584/)
- [AUTOSAR, *Specification of Watchdog Manager* (Classic Platform)](https://www.autosar.org/standards/classic-platform)
- [ISO 26262-5:2018, *Road vehicles — Functional safety — Part 5: Product development at the hardware level*](https://www.iso.org/standard/68385.html)
- [IEC 61508-2:2010, *Functional safety of electrical/electronic/programmable electronic safety-related systems — Part 2: Requirements for E/E/PE safety-related systems*](https://webstore.iec.ch/publication/5516)
- [RTCA DO-178C, *Software Considerations in Airborne Systems and Equipment Certification* (2011)](https://www.rtca.org/products/do-178c-software-considerations-in-airborne-systems-and-equipment-certification/)
- [Mike Jones, *What really happened on Mars Rover Pathfinder* (1997) — watchdog reset'in görevin kurtarılmasında oynadığı rol; ileri okuma](https://www.cs.cornell.edu/courses/cs614/1999sp/papers/pathfinder.html)

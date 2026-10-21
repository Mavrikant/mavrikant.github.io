---
title: "Watchdog Tasarım Desenleri: Independent, Windowed, Deadman ve Sağlık İzleme"
subtitle: "Watchdog Design Patterns: Independent, Windowed, Deadman and Health Monitoring"
background: "/img/posts/3.webp"
date: '2026-07-10 08:00:00'
layout: post
lang: tr
mermaid: true
categories: [gomulu]
tags: [gomulu, guvenilirlik, aviyonik]
---

Emniyet-kritik yazılımın en aldatıcı satırı çoğu zaman şudur:

```c
IWDG->KR = 0xAAAA;  // watchdog kick
```

Bu satır sisteminizi çökmekten kurtarmak için yazılmıştır; ama tek başına neyi kanıtlar? Yalnızca **onu içeren yol parçasının** çalıştığını. O yol parçası bir görev döngüsünün, bir zamanlayıcı kesmesinin veya boş döngünün içinde yaşıyorsa, watchdog'un onayladığı şey sadece o parçadır — sisteminizin geri kalanı çoktan ölmüş olabilir. Watchdog konusundaki büyük yanılgı burada başlar: "watchdog varsa güvendeyiz" cümlesi, gerçekte "watchdog'u besleyen kod hâlâ çalışıyor, bunun ne anlama geldiğini bilmiyoruz" demektir.

Bu yazıda watchdog'u bir bit olarak değil, bir **tasarım sözleşmesi** olarak ele alacağız. Önce donanımın ne teklif ettiğine (independent ve windowed watchdog), sonra üstüne kurulan yazılım desenlerine (task check-in, deadman switch, ARINC 653 sağlık izleme) ve son olarak sahada tekrar tekrar aynı biçimde patlayan anti-desenlere bakacağız. Yol boyunca STM32 WWDG'nin donanım register'ları üzerinden gerçek bir zamanlama hesabı yapacak, Toyota "Bookout" davasındaki `Task X` anlatısını watchdog perspektifinden okuyacağız.

---

## Watchdog Ne Değildir?

Watchdog'un ne olduğunu tarif etmek kolay: bağımsız bir sayaç, sıfırlanmazsa CPU'yu resetler. Ne **olmadığını** söylemek daha öğreticidir:

- Watchdog bir **hata detektörü değildir.** Yalnızca "beklenen etkinliğin yokluğunu" saptar; hatanın ne olduğu, hangi görevin öldüğü, verinin bozulup bozulmadığı hakkında hiçbir şey söyleyemez.
- Watchdog **yalnızca reset üretir.** Sistem tekrar açıldığında hata durumu kaybolur; log yoksa, kalıcı hata sayacı yoksa, saha ekibi telefonda size "arada bir yeniden başlıyor" der ve iş kapanır.
- Watchdog **yazılımdan disable edilebiliyorsa yoktur.** Runaway kod yolun başında watchdog'u kapatıp sonra sonsuz döngüye girerse, watchdog'unuz sizi değil hatanızı korur.
- Watchdog **karşı-örnek verirse yalancıdır.** Yani gerçek arıza varken kick devam ediyorsa, "sağlıklı" sinyali sistem hakkında hiçbir şey ifade etmez. Bunun somut örneği aşağıda: Toyota'nın 2005 Camry ETCS'inde watchdog sağlıklı sinyali basarken throttle görevi ölmüştü.

Bu dört olumsuz cümle, watchdog tasarımının bütün ağırlığını taşır. Geri kalan her şey — pencere genişliği, kick topolojisi, sağlık izleme masası — bu dört tuzaktan hangisine kapılmayacağınızı belirlemekten ibarettir.

---

## Katman 1: Independent Watchdog — Silisyum Seviyesinde Sözleşme

Independent watchdog (STM32'de IWDG, TI Hercules'te DWWD'nin bir modu, NXP MPC57xx'te STCU/SWT, Cortex-M genelinde ayrı bir hardware block) ana saatten **bağımsız** bir düşük hızlı RC osilatörden beslenir. Bunun tek amacı vardır: CPU saati, PLL, ana kristal, ya da flash controller yolunda ne olursa olsun watchdog'un çalışmaya devam ettiğinden emin olmak.

STM32'nin klasik IWDG'si LSI (32 kHz civarı, üretim toleransı ±%15) üzerinden çalışan 12-bit down-counter'dır. Prescaler /4 ile /256 arasında 8 kademede ayarlanabilir. Yani teorik pencere genişliği yaklaşık 125 µs ile 32 saniye arasındadır. Basit görünüyor; iki tuzak var:

1. **LSI toleransı sizin problem yapılamayacak kadar büyüktür.** ±%15, 100 ms nominal pencerede 15 ms sızıntı demektir. "Kickleri 90 ms'de yapıyoruz, pencere 100 ms" diyen tasarım, kötü kader günü LSI'ın hızlı çalıştığı bir çipte reset kusar. Kural: kick periyodu pencere/2'yi geçmesin ve toleransı hesaba katın. Bunun ötesinde sıcaklık ve gerilim, LSI'ı üretim toleransının içinde daha da kaydırır; sertifikasyon kanıtı için dışsal bir referansla kalibrasyon veya en kötü hâl analizi (worst-case) gereklidir.
2. **Bir kere açılırsa kapanmaz.** IWDG için `KR` register'ına `0xCCCC` yazmak onu enable eder ve donanım seviyesinde bu bit "sticky"dir. Bu tam olarak istediğiniz davranıştır — yanlışlıkla runaway kod tarafından disable edilemez. Ama şu anlama gelir: geliştirme sırasında breakpoint yakalarsanız, watchdog **çalışmaya devam eder** ve durum bakılırken reset yer. STM32'nin `DBGMCU_APB1_FZ.DBG_IWDG_STOP` biti tam bunun için var; debug session sırasında set etmezseniz her JTAG duruşunda reset yiyerek yürürsünüz.

Independent watchdog "kalp atışı"dır: sadece CPU'nun bir yerde döndüğünü söyler. Görevlerin canlı olduğunu, kontrol yasasının doğru sonuç ürettiğini, sensörlerin okunduğunu **söylemez**. Bunun için ikinci katmana ihtiyaç var.

---

## Katman 2: Windowed Watchdog — Erken Kick'i Yasaklamak

Klasik watchdog "geç kalırsan reset" diyor. Windowed watchdog "hem erken kick edersen hem geç kalırsan reset" diyor. Bu ilk bakışta gereksiz katılık gibi görünüyor: eğer kod hızlanırsa, iyi değil mi?

Hayır. Runaway kodun ilk davranışı, çoğunlukla **watchdog kick eden yolun daha sık çağrılmasıdır** — çünkü kontrol akışı bir döngüye takılıp aynı satırı defalarca çalıştırır. Klasik watchdog bunu göremez. Windowed watchdog "kick etmen için bir minimum süre geçmeli" der: pencereden önce yapılan yazma anında reset üretir.

### STM32 WWDG: Register Seviyesinde Anatomi

STM32'nin WWDG'si tek register üzerinden konuşulur: `WWDG_CR`. İçinde:

- `T[6:0]` — 7-bit down-counter, çalışıyorsa APB1 saatinden türetilen bir sıklıkta aşağı sayar.
- `WDGA` — enable biti, sticky.
- `T6` biti "counter'ın taşma sinyali"dir. Sayıcı `0x40`'tan `0x3F`'ye geçtiğinde, yani `T6` sıfırlandığında, reset üretilir.

Ayrı bir register (`WWDG_CFR`) içinde `W[6:0]` — pencerenin üst sınırı — ve prescaler bulunur. **Kural** budur:

$$
\text{Refresh kabul edilir} \iff \text{T[6:0]} \le \text{W[6:0]} \; \text{ve} \; \text{T6}=1
$$

Yani sayıcı `0x40`'a düşmeden önce ve W değerinden aşağı düştükten sonra `T[6:0]`'a yazmalıyız. Aksi halde donanım anında reset üretir. W'nun kendisi yazılabilir; W = 0x7F (varsayılan) pencereyi devre dışı bırakır (klasik watchdog gibi davranır). W = 0x40 ise pencere sadece 1 tick geniştir — pratikte imkânsız kick.

Bir tick süresi:

$$
t_\text{tick} = \frac{4096 \cdot 2^\text{PR}}{f_\text{APB1}}
$$

`PR ∈ {0,1,2,3}` prescaler kademelerine karşılık gelir (÷1, ÷2, ÷4, ÷8). 42 MHz APB1 saatiyle, PR=3 seçilirse tick süresi 780 µs civarıdır. 64 tick'lik dolu pencere yaklaşık 50 ms verir.

### Somut Bir Hesap: 10 ms Kapalı Pencere, ~49 ms'de Reset

Diyelim ki kontrol döngümüz 20 ms periyotlu; kick'in 10 ms'den önce düşmesini istemiyoruz (runaway koruması) ve 50 ms'ye kadar mutlaka gelmesini bekliyoruz. PR=3 (÷8), APB1=42 MHz için:

$$
t_\text{tick} = \frac{4096 \cdot 8}{42 \times 10^6} \approx 780 \; \mu s
$$

Kick'in ardından donanım T[6:0]'ı 0x7F'ye yeniden yükler ve aşağı sayar. `0x7F → 0x40` arası tam 63 tick, yani $63 \times 780\,\mu s \approx 49.1\,\text{ms}$. Bu bizim mutlak reset üst sınırımız — WWDG'nin tabiatı gereği bunu esnetemeyiz; daha uzun istiyorsak prescaler artmalı.

Pencere kapalı süresi 10 ms için: $10\,000 / 780 \approx 12.8$ tick. `W[6:0]` değerini `0x7F - 13 = 0x72 = 114` olarak yazarız. Böylece:

- Sayıcı `0x7F → 0x73` aralığında (yaklaşık ilk 10 ms) kick reset üretir — pencere kapalı.
- Sayıcı `0x72 → 0x40` aralığında (10 → 49 ms) kick kabul edilir — pencere açık.
- `0x40 → 0x3F` geçişinde (T6 sıfırlanır) kick olmadıysa donanım reset üretir.

| Aşama | T[6:0] | Zaman | Davranış |
|---|---|---|---|
| Refresh anı | 0x7F | t = 0 | Sayıcı yeniden yüklendi |
| Kapalı pencere | 0x7F → 0x73 | 0 – ~10 ms | Bu aralıkta kick → reset |
| Açık pencere | 0x72 → 0x40 | ~10 – ~49 ms | Kick kabul edilir |
| Zorunlu reset | 0x40 → 0x3F | ~49 ms | Kick olmadıysa reset |

Bu hesabı tabloya koymak yararlıdır, çünkü sahada "pencere neden 12 ms iken kick 8 ms'de düşüyor?" sorusuna zamanla ilgili değil, register değeri ile ilgili yanıt verebilirsiniz — genelde birinci şüpheli, prescaler'ı doğru okumamış bir başlatma kodudur.

APB1 tolerans marjını (kristal + PLL, tipik ±%0.005 disipline edilmişse) hesaba katmak gerekmez; watchdog'un asıl marjı LSI tabanlı bağımsız watchdog'da toplanır. WWDG ana saati kullandığı için, kristal ölürse **WWDG de ölür**. Bu yüzden windowed watchdog'u genellikle independent watchdog ile **birlikte** kullanırız: WWDG saat/döngü hijyenini garanti eder, IWDG çipin genel canlılığını.

### Windowed Watchdog Neden Runaway Attack'ı Yakalar?

Pencereden önce kick eden kod iki durumdan birindedir: (a) döngü hızlanmış (örneğin fonksiyonun içine yanlış girmiş, bekleme atlamış), (b) bilerek watchdog'u susturmaya çalışan malicious kod. Klasik watchdog'da iki durum da farkedilmez — hatta durum (a) klasik watchdog'u "çok mutlu" eder. Windowed watchdog "senin kick sıklığını da normalleştiriyorum" demiş olur. Bu, DO-178C DAL A veya ISO 26262 ASIL D perspektifinden watchdog'a yüklenen görevin somut ifadesidir: yalnızca "hâlâ çalışıyor" değil, "doğru sıklıkta çalışıyor" da olmak zorundadır.

---

## Anti-desen: Timer ISR'den Kick

Şu tasarımı çok gördüm; muhtemelen siz de gördünüz:

```c
void TIM6_IRQHandler(void) {
    TIM6->SR &= ~TIM_SR_UIF;
    IWDG->KR = 0xAAAA;   // "her 10 ms'de bir kick, garanti"
    tick_counter++;
}
```

Bu satır watchdog kavramını **çürütür**. Timer ISR bir donanım kesmesidir; NVIC etkin olduğu sürece çalışır. Ana döngü, RTOS scheduler'ı, kontrol yasası, sensör okuma — hepsi çökmüş olsa bile timer ISR canlı kalır ve watchdog'u besler. Bu tam olarak Toyota Bookout davasında Barr'ın tanıklığında ortaya koyduğu tabloya karşılık gelir: watchdog'u besleyen mekanizma büyük ölçüde ETCS'in kendi task'ından değil, timer ISR benzeri bağımsız CPU yükü ölçüm mekanizmasından geliyordu. Sonuç: `Task X` (throttle kontrolü) ölse bile watchdog sinyali sağlıklı kalıyordu.

Alexandru Lazar'ın *EmbeddedRelated* üzerinde yayımlanan "Watchdog Timer Anti-patterns" makalesi tam olarak bunu isimlendirir:

> Bir düşük-öncelikli task veya ISR watchdog'u besliyorsa, watchdog kickerinin çalışması **sistemin geri kalanının çalıştığı anlamına gelmez**. Aksine, yüksek öncelikli task'lar ölmüşse düşük öncelikli task daha da rahat çalışır — çünkü rakibi yoktur.

Buradan çıkan tasarım kuralı basittir: **her periyodik görev watchdog'un beslenmesine kendi katkısını sağlamalıdır.** Kick tek yerden yapılabilir, ama karar tek yerden verilemez.

---

## Doğru Desen: Multitask Sağlık Denetimi (Task Check-in)

En sık kullanılan doğru desen "task check-in" veya "supervisor" desenidir. Her görev periyodik olarak bir "yaşıyorum" biti set eder. Bir supervisor görevi (veya en düşük öncelikli idle task) periyodik olarak biraz karmaşık bir kural değerlendirir: **tüm bekleyen biler set mi**? Cevap evet ise watchdog'u kicker, biler sıfırlanır, döngü tekrarlar.

Basit bir iskelet (STM32Cube stili, RTOS-agnostik):

```c
#include <stdatomic.h>
#include <stdint.h>

#define TASK_CTRL_LOOP    (1u << 0)
#define TASK_SENSOR_READ  (1u << 1)
#define TASK_TELEMETRY    (1u << 2)
#define ALL_TASKS_MASK    (TASK_CTRL_LOOP | TASK_SENSOR_READ | TASK_TELEMETRY)

static atomic_uint task_alive_mask;

static inline void task_check_in(uint32_t task_bit) {
    atomic_fetch_or(&task_alive_mask, task_bit);
}

static void supervisor_tick(void) {
    uint32_t snapshot = atomic_load(&task_alive_mask);
    if ((snapshot & ALL_TASKS_MASK) == ALL_TASKS_MASK) {
        atomic_store(&task_alive_mask, 0u);
        IWDG->KR = 0xAAAA;
    }
    /* Yoksa hiçbir şey yapma — bir sonraki tick'e kadar watchdog'u aç bırak. */
}
```

Bu iskeleti üç açıdan sıkıca çekmek gerekir:

- **Check-in'ler frekans bilgisi de taşımalı.** Basit "hâlâ hayattayım" biti runaway task'ı yakalamaz. Task check-in mekanizması, her görevin **en az X kez / en fazla Y kez** çağrıldığını doğrulamalıdır. Bunun için biler yerine sayaç kullanılır; supervisor pencereye bakar. Sonuç windowed watchdog'un yazılım aynasıdır.
- **Supervisor'ın kendisi kim koruyor?** Bu klasik sorudur ve donanım watchdog'unu gerektirir. Supervisor task ölürse `task_alive_mask` bir daha temizlenmez; kick olmaz; watchdog resetler. Yani supervisor'ı "watchdog'un fail-safe'i" değil, "watchdog'un tetikleyicisi" olarak konumlandırın.
- **`atomic_fetch_or` yerine `volatile |=` yazmayın.** Multicore ARM'de veya kesmelerin task'ları önleyebildiği herhangi bir yerde, `x |= 1` üç ayrı satırdır: load, or, store. Kayıp güncellemeler mümkündür. `stdatomic.h` veya `__atomic_fetch_or` derleyici intrinsic'i kullanın. Bu, watchdog kodunun **doğru** çalışabilmesi için gerekli mikroskobik disiplin.

Bu deseni ARM Cortex-M ekosisteminde uygularken yararlı bir örüntü, kick kararını **NMI seviyesinden yükseğe çıkarmamaktır**: supervisor bir NMI'da veya SysTick handler'da çalışırsa, kritik sistem hataları (hard fault içindeki fault gibi) sırasında dahi kick etme "başarısıyla" reset'i engelleyebilir.

---

## Vaka Analizi: Toyota 2005 Camry — `Task X` ve Sessiz Ölüm

Watchdog literatürünün en pahalı vakası muhtemelen Bookout v. Toyota davasıdır. 2007'de Jean Bookout'un 2005 Camry'si Oklahoma'da I-69 çıkışında istem dışı hızlandı; kaza ölümle sonuçlandı. Michael Barr'ın uzman tanıklığı (Ekim 2013) Toyota'nın Electronic Throttle Control System - Intelligent (ETCS-i) yazılımını satır satır incelemişti. Bulgular halka açıktır ve emniyet-kritik yazılım literatürünün merkezine oturdu:

- ETCS 11 000'in üzerinde global değişkenle çalışıyordu; MISRA C 1998'in kural ihlalleri binlerle sayılıyordu (Barr 81 kural ihlali daha saydı).
- Ana CPU'da ~35 görev vardı; kritik olanı `Task X` — throttle açısı hesaplama, cruise control ve fail-safe'lerin çoğunu barındıran görev — Barr tanıklığında bu görevi "kitchen-sink" olarak niteledi.
- Watchdog supervisor yalnızca **CPU load** ölçüyordu; yani "CPU meşgul mü" sorusuna bakıyordu. Bu sonucu Barr'ın kelimeleriyle özetlemek gerekirse: "It is incapable of ever detecting the death of a major task."
- Green Hills simulator üzerinde yeniden üretim: task X'in stack corruption ile ölmesi durumunda, sistem watchdog reset üretmeden ETCS "sağlıklı" görünmeye devam etti.
- Stack overflow analizi kritik bir bulguydu: task X'in stack'i başka bir bölgeye taşabiliyordu; taşan bölge task alive counter'ının olduğu yerdi. Yani task X ölmese bile "sağlıklı" bayraklarının bit-hataları oluşabiliyordu.

Watchdog perspektifinden okuyunca, tablo şudur: Toyota "watchdog var" yazdı; ama watchdog'un ne izlediği "yürüyen mühendislik" değil, "koşan CPU"ydu. Windowed watchdog kısıtı yoktu. Task check-in kısıtı yoktu. Fail-safe'lerin çoğu tam da ölen task'ın içindeydi.

Bu yorumun kaynak olmayan bir çıkarımını yapmayalım: karar Bookout için 3 milyon dolar tazminata dönüştü ve Toyota davadan saatler sonra kalan davaları uzlaştı. Ama mühendis olarak taşımamız gereken ders para değil desendir: **watchdog'un ne ölçtüğünü söyleyemiyorsanız watchdog'unuz yoktur.**

---

## Bir Adım Yukarı: ARINC 653 Sağlık İzleme

Aviyonik yazılımın çoğu bugün ARINC 653'e uygun bir partitioned kernel (VxWorks 653, PikeOS, LynxOS-178) üzerinde çalışır. Bu ekosistemde watchdog'u "bir donanım register'ı" olarak değil, **çok seviyeli sağlık izleme (Health Monitoring)** olarak düşünürüz. Standardın öngördüğü üç seviye vardır: Module, Partition, Process.

<div class="mermaid">
flowchart TD
    P[Process seviyesi hata] -->|Process HM tablosu| PA[Process action]
    PA -->|Kurtarılamıyorsa yukarı bildir| PART[Partition seviyesi hata]
    PART -->|Partition HM tablosu| PARA[Partition action]
    PARA -->|Kurtarılamıyorsa yukarı bildir| MOD[Module seviyesi hata]
    MOD -->|Module HM tablosu| MODA[Module action - genellikle donanım watchdog]
</div>

Her seviyede bir HM tablosu vardır: hata kimliği (error ID) → aksiyon eşlemesi. Yaygın aksiyonlar `IGNORE`, `PROCESS_RESTART`, `PARTITION_RESTART`, `PARTITION_STOP`, `COLD_START`, `WARM_START`. Aksiyon "yukarı bildirimi" seçtiğinde hata seviyesi bir üste sıçrar. En üstteki modul seviyesi kurtarılamıyorsa donanım watchdog'una bırakılır — yani ARINC 653 mimarisinde donanım watchdog en son savunma hattıdır.

Bu tasarımın pratikte söylediği şey şudur: bir görev ölürse yalnız o process yeniden başlar; kernel'a ait bir bellek erişim ihlaliyse tüm partition düşer; ortak kaynak (paylaşılan sampling port'un timestamp'i gibi) tutarsızlaşırsa module yeniden başlar. Windowed watchdog burada modul seviyesinde IWDG-benzeri bir görev üstlenir; process check-in ise partition seviyesinde bir supervisor tarafından izlenir.

DO-178C sertifikasyonuna hazırlanan ekipler için pratik not: HM tablonuzu **kanıtla eşleştirmek zorundasınız**. Her error ID için, hangi güvenlik gereksiniminden geldiği, hangi test case ile doğrulandığı, hangi WCET ve WCRT (worst-case response time) analizinin geçtiği izlenebilir olmalı. HM tablosunu "hızlıca dolduran" bir ekip sertifikasyonun ilerleyen aşamalarında rework'e mahkumdur.

---

## Deadman Switch ve Watchdog Zinciri

Bazı sistemler tek watchdog ile yetinmez. Uydu kontrol bilgisayarları, uçuş kontrol bilgisayarları, otonom araç ECU'ları klasik olarak birkaç watchdog'u zincir hâlinde kullanır:

1. **Internal WDT** (CPU içi): kod düzeyi canlılık.
2. **External supervisor IC** (harici gözetleyici entegresi): CPU'nun bir çıkış pinini periyodik toggle etmesini bekler; toggle durursa donanım reset'i uygular. STM32'de bunun tipik örneği TI TPS3813 veya Maxim MAX6371 gibi bir çip olur.
3. **Deadman switch** — genellikle pilot / operatör tarafından fiziksel olarak basılı tutulması gereken bir düğme; bırakılırsa mekanik veya elektriksel bir "safe" duruma geçilir. Ray araçlarında ve pek çok endüstriyel kontrol sisteminde standarttır.

Bu zincirin mantığı derinlik-savunmasıdır: yazılım supervisor'ı yanılabilir, dahili watchdog silisyum hatasıyla susabilir, ama harici bir IC bunu ayrı bir enerji domenine bağlı hâlde izleyebilir. Analog Devices'ın "Improving Industrial Functional Safety" serisinin dördüncü makalesi bunu Program Sequence Monitoring başlığı altında inceler: harici bir supervisor'a sadece "kick" değil, önceden belirlenmiş bir sıra (bir "program flow signature") gönderilir. Yanlış sıra da reset üretir. Kontrol akışı bir yerde saplanıp aynı yolları tekrar çalıştırırsa signature yanlış üretilir — bu, sadece frekans değil, **kontrol akışı bütünlüğü**ni doğrulayan bir katmandır.

Havacılıkta buna paralel bir kavram olarak "control flow monitoring" veya "structural integrity checking" ismini görürüz. DO-178C'nin verification hedefleri (Table A-7 objective 8) altında "The verification of the compatibility with the target computer" başlığı, tam olarak kontrol akışı bütünlüğü kanıtları isteyebilir.

---

## Uygulamada Sık Kaçırılan Detaylar

Watchdog kodu görünüşte küçüktür ama etrafında toplanan hatalar disproportionately büyüktür. Kısa bir kontrol listesi:

- **Debug modunda watchdog freeze biti.** STM32'de `DBGMCU_APB1_FZ`. Set etmezseniz breakpoint'te reset yersiniz; production'da yanlışlıkla set kalırsa emniyet için kritik bir kayıp olur. İki farklı build konfigürasyonu tutun.
- **Boot loader ve uygulama arasındaki geçişte watchdog süreleri.** Boot loader'ın kick periyodu genellikle uygulamadan farklıdır. Watchdog'u boot loader kapatamadığı için (independent watchdog için doğru), boot loader watchdog periyodunu uygulama için de güvenli bir tavana ayarlamalı, sonra uygulamaya sıkılaştırma bırakmalıdır.
- **Reset kaynağının log'lanması.** Reset sonrası `RCC_CSR` veya eşdeğeri register okunup **watchdog reset mi, güç açılışı mı, brown-out mu** olduğu bir kalıcı sayaça yazılmalıdır. Bu bilgi olmadan alan raporu "aralıklı reset" olarak geliyor ve teşhis edilemez hâle geliyor.
- **Watchdog kick sırasındaki spurious kesme.** Kick yazması bir 16-bit veya 32-bit register yazmasıdır; ancak WWDG gibi bazı çevre birimlerinde kick'in hemen ardından ISR seviyesindeki bir Early Wake Up Interrupt (EWI) atomik olmayabilir. WWDG'nin EWI'sı sayıcı 0x40'a düştüğünde tetiklenir; buradan kick etmek, "reset'e neredeyse geldik, hızla temizle" anlamına gelir ve fail-safe log yazımı için kullanışlıdır. Ama bu kick'i "normal işletim" olarak görmeyin.
- **Static analiz aracı watchdog kick'ini "olay-tetikleyici" olarak modelleyebilmeli.** Frama-C, Polyspace, Astrée gibi araçlar döngü sonlanma ispatı yaparken kick fonksiyonunu "side-effect yok, dönmeyi engellemeyen" olarak işlemedikleri sürece false positive üretebilirler. Kick fonksiyonunun deklarasyonuna açık bir `__attribute__` veya araca özel annotasyon eklenmesi gerekebilir.
- **Watchdog'u ısıtma dönemi (warm-up) hatası ile karıştırmayın.** MPC57xx / TI Hercules gibi SoC'lerde IWDG karşılığı olan blok, ilk yüz milisaniye içinde kapalı kalabilir; boot code'unuz bu pencerede canlılık kanıtı üretmezse sonraki kick geç kalır. Datasheet'in "Startup" bölümü bunu genelde bir tablo ile anlatır.

---

## Sonuç

Watchdog'u bir register'a atılan bir bit olarak düşünürsek, watchdog'umuz olmaz — yalnızca watchdog başlıklı bir kod satırımız olur. Emniyet-kritik yazılımın gerçek watchdog'u üç katmandan oluşur: donanım seviyesinde **independent** ve **windowed** kombinasyonu, yazılım seviyesinde **task check-in supervisor'ı**, sistem seviyesinde ise **HM tabloları ve harici bir supervisor IC**. Her katman farklı bir başarısızlık modelini kabul eder: kristal ölmesi, kontrol akışı hızlanması, tek bir görevin sessizce düşmesi, kernel bütünlüğünün bozulması.

Toyota davası, watchdog'a "vardır" demenin yetmediğini pahalı biçimde gösterdi. Barr'ın raporunun watchdog perspektifinden asıl mesajı şudur: **watchdog'un ne izlediğini bir cümlede söyleyemiyorsanız, watchdog'unuz kimseyi korumuyor demektir.** Kendi kodunuza bu soruyu bugün sorun: `IWDG_KR` register'ına yazan satırın hangi yaşam kanıtına dayandığını yazılı olarak tarif edebiliyor musunuz? Cevap "timer ISR'de çağrılıyor" ise geri dönüp bu yazıyı bir kez daha okumaya değer.

---

## Kaynaklar

- STMicroelectronics, *RM0090 — Reference Manual: STM32F405/415, STM32F407/417, STM32F427/437, STM32F429/439 advanced Arm®-based 32-bit MCUs*, IWDG ve WWDG bölümleri. <https://www.st.com/resource/en/reference_manual/rm0090-stm32f405415-stm32f407417-stm32f427437-and-stm32f429439-advanced-armbased-32bit-mcus-stmicroelectronics.pdf>
- STMicroelectronics, *STM32L4 System Window Watchdog (WWDG)*, product training. <https://www.st.com/resource/en/product_training/stm32l4_wdg_timers_wwdg.pdf>
- Michael Barr, *Bookout v. Toyota Motor Corp.* uzman tanıklığı; Safety Research & Strategies özeti: "Toyota Unintended Acceleration and the Big Bowl of 'Spaghetti' Code." <https://safetyresearch.net/toyota-unintended-acceleration-and-the-big-bowl-of-spaghetti-code/>
- Junko Yoshida, "Toyota Case: Single Bit Flip That Killed," *EE Times*, 2013. <https://www.eetimes.com/toyota-case-single-bit-flip-that-killed/>
- Junko Yoshida, "Toyota Trial: Transcript Reveals 'Task X' Clues," *EE Times*, 2013. <https://www.eetimes.com/toyota-trial-transcript-reveals-task-x-clues/>
- David Cummings ve Michael Dunn, "Toyota's killer firmware: Bad design and its consequences," *EDN*, 2013. <https://www.edn.com/toyotas-killer-firmware-bad-design-and-its-consequences/>
- Barr Group, "Toyota Expert Witness Case Study." <https://barrgroup.com/software-expert-witness/case-studies/car-unintended-acceleration>
- Alexandru Lazar, "Watchdog Timer Anti-patterns," *EmbeddedRelated*. <https://www.embeddedrelated.com/showarticle/1276.php>
- Philip Koopman, "Proper Watchdog Timer Use," *Better Embedded System SW* blog. <https://betterembsw.blogspot.com/2014/05/proper-watchdog-timer-use.html>
- Analog Devices, "Improving Industrial Functional Safety Compliance with High Performance Supervisory Circuits—Part 4: Program Sequence Monitoring Using Watchdog Timers." <https://www.analog.com/en/resources/analog-dialogue/articles/improving-industrial-functional-safety-part-4.html>
- ARINC Specification 653, *Avionics Application Software Standard Interface*, Part 1 — Required Services. Genel bakış ve HM tablo yapısı için: Wind River, "ARINC 653 Safety-Critical Applications." <https://www.windriver.com/solutions/learning/arinc-653-compliant-safety-critical-applications>
- Alfons Crespo et al., "Software fault protection with ARINC 653," ResearchGate. <https://www.researchgate.net/publication/224699153_Software_fault_protection_with_ARINC_653>
- RTCA/DO-178C, *Software Considerations in Airborne Systems and Equipment Certification*, 2011 (Table A-7 verification objectives).

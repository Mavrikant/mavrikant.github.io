---
title: "ARINC 653 Anatomisi: Aviyonik RTOS'ta Zaman-Uzay Bölümleme ve Sağlık İzleme"
subtitle: "The Anatomy of ARINC 653: Time-Space Partitioning and Health Monitoring in Avionics RTOS"
background: "/img/posts/8.webp"
date: '2026-07-11 09:00:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [aviyonik, gomulu-sistemler, rtos, sertifikasyon]
---

Modern bir yolcu uçağının kokpitinde tek bir ekran açıldığında, arkasında iki
düzine farklı avionik fonksiyonun aynı işlemciyi paylaşan bağımsız yazılım
bölümlerinden geldiğini fark etmezsiniz. Uçuş kontrol yasası, hava veri
işleme, iniş takım kontrolü ve kabin bilgi ekranı; hepsi ayrı geliştirilmiş,
farklı DAL (Design Assurance Level) seviyelerinde sertifikalandırılmış,
ama aynı silikonu paylaşan uygulamalardır. Bunu mümkün kılan sözleşme:
**ARINC 653**.

Türkçe içerikte ARINC 653 üzerine derin bir kaynak bulmak neredeyse imkânsız.
Standart pahalı, İngilizce ve büyük ölçüde ticari araç dokümantasyonu (VxWorks
653, PikeOS, INTEGRITY-178) üzerinden öğrenilmiş bir alan. Bu yazıda standardı
kurcalıyorum: zaman bölümleme neden döngüsel bir tablo, uzay bölümleme neden
sıkı bir MMU dansı, sağlık izleme neden üç katmanlı ve çok çekirdeğe geçiş
neden bu güzel resmi karıştırıyor.

Depth öğesi olarak iki somut şey işleyeceğim: (1) 100 ms'lik bir major frame
üzerinden üç bölmeli bir çizelge tablosunun (schedule table) satır satır
kurulumu ve (2) bir DAL C bölmesinde oluşan sayısal hatanın health monitoring
zinciri boyunca nasıl yükseldiği. Somut sayılarla.

---

## Neden bölümleme?

1970'ler ve 80'ler boyunca aviyonik "federated" mimarideydi: her fonksiyon
kendi LRU'sunda (Line Replaceable Unit) — kendi kutusu, kendi işlemcisi, kendi
güç kaynağı. Uçuş kontrolü ayrı kutu, hava verisi ayrı kutu, iletişim ayrı
kutu. Yalıtım muhteşemdi (donanım fiziksel olarak ayrıydı); ağırlık, güç ve
bakım maliyeti korkunçtu.

Prisaznuk'un 1992 IEEE NAECON bildirisinde formüle ettiği **Integrated Modular
Avionics (IMA)** öngörüsü basitti: neden ortak, sertifikalandırılmış bir
platformda birden çok fonksiyonu barındırmayalım? Kutuyu paylaşmak; kabloyu,
soğutmayı, ağırlığı ve yedek parçayı paylaşmak demek. Boeing 777'nin AIMS
kabini bu fikrin ilk büyük gösterisiydi. Ama tek bir sorun vardı: **DAL A bir
uçuş kontrol fonksiyonu, aynı işlemcide çalışan DAL C bir kabin bilgi
uygulamasının hatasından etkilenmemeli**.

Aksi hâlde DAL C uygulamasının bir bellek sızıntısı DAL A uygulamasını
düşürebilir; DAL C'nin bir sonsuz döngüsü DAL A'ya CPU süresi bırakmayabilir.
Bu durumda sertifikasyon açısından tüm sistem DAL A'ya çekilir — ve tüm
kabin bilgi ekranı yazılımını DAL A rigorunda geliştirmek maliyet olarak
imkânsıza yakındır.

Çözüm: platformun kendisi, uygulamalar arasında **spatial (uzaysal)** ve
**temporal (zamansal)** bağımsızlığı **argümansız, kanıtlanabilir** biçimde
garanti etmeli. John Rushby'nin 1999 NASA raporu bu argümanı formülleştirir:
bir sistemin bölümlenmiş olması demek, herhangi bir bölmenin davranışının
diğer bölmelerin belirlenmiş fonksiyonel davranışını etkileyemeyeceğinin
gösterilebilmesi demektir. ARINC 653 bu gösterimin **mekanizmasını**
standartlaştırır; RTCA DO-297 (Avrupa'da EUROCAE ED-124) IMA
**yaşam-döngüsü** rehberidir.

---

## Standart iskeleti

ARINC Report 653 tek bir belge değil, bir aile:

| Bölüm | İçerik |
|---|---|
| Part 1 — Required Services | Zorunlu APEX API çağrıları, veri türleri, davranış |
| Part 2 — Extended Services | Opsiyonel servisler: SAP portları, dosya sistemi, isim servisleri |
| Part 3 — Conformity Test Specification | Uyumluluk sınama süiti (3A, 3B) |
| Part 4 — Subset Services | Sınırlı ayak izli sistemler için alt küme |
| Part 5 — Core Software | Çok çekirdek işlemcilerde bölümleme kuralları |

Part 1'in en güncel yayınlanan sürümü Supplement 5. Supplementer standart
tarihçesi içinde önemli, çünkü bir işletim sistemi "ARINC 653'e uyumlu"
derken hangi supplement'e uyumlu olduğunu söylüyor olması gerekir; API
davranışları supplement'ler arasında değişebilir (özellikle sağlık izleme
girişleri ve multi-core semantikleri).

**APEX** (Application/EXecutive Interface) uygulamalarla MOS (Module OS)
arasındaki sözleşmedir. Uygulamalar donanıma, işletim sistemine, hatta diğer
uygulamalara yalnızca APEX üzerinden dokunur.

---

## Zaman bölümleme: döngüsel çizelge

Öncelik tabanlı bir RTOS'ta (FreeRTOS, VxWorks native, ThreadX) planlayıcı
"hazır olan en yüksek öncelikli görevi çalıştır" der. Öncelik ters çevrimi
(priority inversion) gibi meşhur hataların da anasıdır bu. ARINC 653 bu
yaklaşımı **module seviyesinde reddeder**.

MOS'un çalıştırdığı planlayıcı, önceden derlenmiş, sabit bir çizelge tablosunu
takip eder. Tablo şu yapıdadır:

- **Major time frame (MTF)**: tüm bölmelerin dönem-katı bir sürede
  tekrarlanan aktivasyon paterni. Uygulamada 10-200 ms arası tipik.
- **Partition window**: her bölmenin MTF içindeki tahsis edilmiş süresi.
  Bir bölme MTF içinde birden fazla pencereye sahip olabilir (uçuş
  kontrolünün 100 Hz döngüsü için MTF içinde eşit aralıklarla birden çok kez
  çalıştırılması gibi).
- **Slack**: MOS kendi işleri için (health monitoring, statistics) tahsis
  edilmiş boş dilimler.

Somut örnek — 100 ms'lik MTF, üç bölme:

| Bölme | DAL | Bir MTF'deki toplam CPU | Etkin dönem |
|---|---|---|---|
| FCS (Flight Control Surface Cmd) | A | 40 ms (iki × 20 ms) | 20 Hz |
| NAV (Navigation Filter) | B | 30 ms (bir × 30 ms) | 10 Hz |
| DPY (Display) | C | 20 ms (bir × 20 ms) | 10 Hz |
| Slack (MOS) | — | 10 ms | — |

MTF içindeki zaman dilimlerinin oturuşu:

| Zaman (ms) | Bölme |
|---|---|
| 0 – 20   | FCS #1 (DAL A) |
| 20 – 50  | NAV       (DAL B) |
| 50 – 70  | FCS #2 (DAL A) |
| 70 – 90  | DPY       (DAL C) |
| 90 – 100 | MOS slack |

Toplam: 20 + 30 + 20 + 20 + 10 = 100 ms. FCS window'ları 50 ms aralıklı,
yani 20 Hz kontrol döngüsü elde edilir; NAV ve DPY 10 Hz'de birer kez döner;
MOS kendi bakım işlerine 10 ms bırakır.

Bu tablonun bir yazılım verisi gibi görünmesine aldanmayın; **bu bir
sertifikasyon nesnesidir**. Tabloyu değiştirmek — bir bölmenin penceresini
büyütmek, bir bölme daha eklemek — sertifikasyon dosyasını dokunulur kılar
ve ilgili emniyet argümanı yenilenir.

Bu yaklaşımın üç can alıcı sonucu var:

1. **Zamansal izolasyon çürütülemez.** Bir bölme window'unun sonunda MOS
   context switch'i zorlar; bölme "biraz daha kaldı, izin ver" diyemez. Sonsuz
   döngü, deadlock, aç kalmış process — hiçbiri komşu bölmenin CPU süresine
   dokunmaz. En kötü ihtimalle o bölmenin **kendisi** deadline_missed alır.

2. **WCET budgeting yerelleştirilir.** Bir bölmenin worst-case execution time
   analizi yalnızca kendi window'una sığması için yapılır. Bu, statik WCET
   araçlarının işini kolaylaştırır — komşu bölmenin işlemcide neler yaptığını
   modele katmaya gerek yoktur (tek çekirdekte).

3. **Öncelik tersinmesi partition-arası imkansızdır.** DAL C bölmesi kilitli
   bir semaforu bırakmadan window'unun sonunda takılıp kalırsa, DAL A hiçbir
   şekilde bu semaforu bekleyemez — çünkü DAL A bölmesi paylaşımlı bir
   semafor değil, kendine ait senkronizasyon primitifleri kullanır. **APEX
   inter-partition iletişimi bilerek asenkron ve non-blocking'dir** (aşağıda).

Bölmenin **içinde** klasik önceliğe dayalı planlama devam eder — bir bölme
kendi window'u dahilinde birden çok process'i (thread benzeri) öncelik
sırasıyla çalıştırır. Yani ARINC 653 iki seviyeli bir planlayıcıdır: MOS
sabit çizelgeyi işletir, POS (Partition OS) her window'un içinde
process-seviyesinde öncelik tabanlı davranır.

---

## Uzay bölümleme: donanım destekli izolasyon

Zaman bölümleme kâğıda döküldüğünde güzel gözükür; ama bir DAL C bölmesi bir
yazı hatası ile DAL A bölmesinin uçuş yasası tablosuna değer yazarsa bütün
argüman çöker. Bu yüzden uzay bölümleme **donanım tarafından zorunlu
kılınmalı**:

- MMU/MPU her partition için ayrı bellek haritası. Kod, veri, yığın (heap),
  bss segmentleri partition'a özgü fiziksel/sanal bölgelerdedir.
- Context switch anında MOS TTBR (Translation Table Base Register — ARM'da)
  veya MPU region tanımını yeniden yükler.
- Bir partition komşusunun bellek bölgesine erişmeye çalışırsa donanım bir
  data abort/access fault fırlatır. MOS bunu health monitoring olayı olarak
  yakalar ve tablodaki recovery aksiyonuna yönlendirir.

Donanım gerçekten şart mı? Yalnızca yazılım kontrolüne dayalı bölümleme
(software-enforced separation) sertifikasyon otoriteleri tarafından
argümanı çok daha zor bulunur. DO-297 ve CAST pozisyon belgeleri IMA
platformlarında donanım destekli bellek korumasını fiilen şart koşar.

Bir sonraki noktayı gözden kaçırmak kolay: **I/O kaynakları da uzay
bölümlemenin parçasıdır**. Bir 1553 kart sürücüsü, bir ethernet MAC, bir GPIO
pini — hiçbirine iki bölme aynı anda dokunamaz. MOS tipik olarak bir I/O
partition ya da health-managed device driver soyutlaması sağlar; uygulama
partition'ları donanıma yalnızca APEX portları üzerinden erişir.

---

## Partition-arası iletişim: sampling ve queuing ports

Bölmeler arasında paylaşımlı bellek yok. Semafor yok. Mutex yok. Bunun
yerine iki port tipi:

- **Sampling port** — üzerine yazma semantiği. Yayıncı her yazışında bir
  önceki değeri ezer; alıcı her okumada en güncel değeri okur. Sensör
  verisi, uçuş durumu, konum güncellemesi gibi "en son değer önemli" olan
  veriler için ideal. Karakteristik özellik: mesaj kaybı **kabul edilebilir**
  ve deterministiktir.
- **Queuing port** — FIFO semantiği. Belirli derinlikte bir sıra; yayıncı
  bir mesajı iter, alıcı sırayla çeker. Komut mesajları, log kayıtları,
  event stream gibi "her mesaj önemli, sıra önemli" veriler için. Karakteristik:
  taşma (overflow) health monitoring olayıdır.

<div class="mermaid">
flowchart LR
    subgraph PART_NAV[NAV Partition]
        NAV_PROC[Navigation Filter Process]
    end
    subgraph PART_FCS[FCS Partition]
        FCS_PROC[Flight Control Process]
    end
    subgraph PART_DPY[Display Partition]
        DPY_PROC[Display Process]
    end

    NAV_PROC -- "SAMPLING: latest_position (10 Hz)" --> FCS_PROC
    FCS_PROC -- "SAMPLING: surface_cmd (25 Hz)" --> ACT[Actuator I/O]
    NAV_PROC -- "QUEUING: waypoint_events" --> DPY_PROC
</div>

Portlar birer partition-lokal endpoint; iki port arasındaki fiziksel ilişki
**channel** olarak MOS konfigürasyonunda tanımlanır. Bir sampling port'u
başka bir sampling porta bağlarsınız; portlar tek yönlüdür. Bu ayrım
sertifikasyon açısından kritik: veri akış grafı platform konfigürasyonunun
bir parçasıdır, uygulama kodunda değil.

APEX API'sinin non-blocking olması da tesadüf değil: bir bölme
`WRITE_SAMPLING_MESSAGE` çağırdığında port doluysa mesajı üzerine yazar,
ama **beklemez**. Alıcı bölme henüz çalışmıyor olabilir (window'u gelmemiş
olabilir); bu bir hata değil, normal davranıştır. Alıcı okuduğunda buffer'da
mesaj yoksa `NO_MESSAGE` alır. Blocking versiyonu vardır ama bu blocking
yalnızca bölme window'u içinde geçerlidir — bölme window'unun sonu geldiğinde
process bloke bile olsa MOS zaten context switch'i zorlayacaktır.

---

## APEX çağrıları — küçük bir örnek

Bir bölmenin başlangıç kodu şuna benzer (Ada'ya ARINC 653 bağlaması daha
yaygındır ama örneği C'de sadeleştiriyorum):

```c
#include <apex.h>

/* Konfigürasyon dışı süreç adı - APEX ile eşleşiyor */
static PROCESS_ATTRIBUTE_TYPE nav_task_attr = {
    .PERIOD          = 100 * 1000 * 1000,  /* 100 ms, nanosaniye */
    .TIME_CAPACITY   = 25  * 1000 * 1000,  /* 25 ms, WCET budget */
    .ENTRY_POINT     = nav_task_entry,
    .STACK_SIZE      = 8192,
    .BASE_PRIORITY   = 20,
    .DEADLINE        = HARD,
    .NAME            = "NAV_TASK"
};

void nav_partition_init(void)
{
    RETURN_CODE_TYPE rc;
    PROCESS_ID_TYPE  pid;
    SAMPLING_PORT_ID_TYPE pos_out_pid, imu_in_pid;

    /* Sampling port: yayınlıyoruz - IMU'dan gelen NAV çözümü */
    CREATE_SAMPLING_PORT(
        "POS_OUT", sizeof(nav_solution_t), SOURCE,
        100 * 1000 * 1000, &pos_out_pid, &rc);
    /* rc kontrolü */

    /* Sampling port: dinliyoruz - IMU raw */
    CREATE_SAMPLING_PORT(
        "IMU_IN",  sizeof(imu_raw_t), DESTINATION,
        10 * 1000 * 1000, &imu_in_pid, &rc);

    CREATE_PROCESS(&nav_task_attr, &pid, &rc);
    START(pid, &rc);

    /* Şimdi COLD/WARM_START'tan NORMAL'a geçiyoruz */
    SET_PARTITION_MODE(NORMAL, &rc);
}

void nav_task_entry(void)
{
    RETURN_CODE_TYPE rc;
    imu_raw_t        imu;
    nav_solution_t   sol;
    MESSAGE_SIZE_TYPE msg_size;
    VALIDITY_TYPE    valid;

    while (1) {
        READ_SAMPLING_MESSAGE(imu_in_pid, (MESSAGE_ADDR_TYPE)&imu,
                              &msg_size, &valid, &rc);
        if (valid == VALID) {
            nav_step(&imu, &sol);
            WRITE_SAMPLING_MESSAGE(pos_out_pid,
                                   (MESSAGE_ADDR_TYPE)&sol,
                                   sizeof(sol), &rc);
        }
        PERIODIC_WAIT(&rc);   /* bir sonraki periyoda kadar bekle */
    }
}
```

İki noktaya dikkat: (1) `TIME_CAPACITY` bir WCET budget'ıdır; process bunu
aşarsa health monitoring `deadline_missed` hatası tetikler. (2) `PERIODIC_WAIT`
process'i partition window'unun bir sonraki denk periyoduna kilitler; sleep
değildir. Bu tür API asimetrileri, ARINC 653 uygulamalarını POSIX'ten daha
"kâğıda dökük" bir programlama modeline zorlar — planlayıcının determinizmini
uygulama kodunun ifadesine yansıtır.

---

## Sağlık İzleme (Health Monitoring)

Bölümleme kadar önemli bir konu daha var: bir şey ters gittiğinde ne olur?
ARINC 653 HM üç seviyeli bir hiyerarşi tanımlar:

<div class="mermaid">
flowchart TD
    ERR[Hata olayı] --> LVL{Hangi seviye?}
    LVL -- Process --> PROC[Process Error Handler]
    LVL -- Partition --> PART[Partition Error Handler]
    LVL -- Module --> MOD[Module HM Callback]

    PROC -- "yeniden başlatılabilir mi?" --> PA1[PROCESS_RESTART]
    PROC -- "hayır, yükselt" --> PART
    PART --> PA2["PARTITION_RESTART (COLD/WARM)"]
    PART --> PA3[PARTITION_STOP → IDLE mode]
    PART -- "yükselt" --> MOD
    MOD --> PA4[MODULE_RESTART]
    MOD --> PA5[MODULE_STOP]
</div>

Ve HM configuration tablosu şu şekilde bir eşleme sağlar: **hata kaynağı ×
seviye → aksiyon**. Örnek satırlar (semantik; tam sözdizimi OS-satıcısına
göre değişir):

| Error ID | Kaynak | Seviye | Recovery |
|---|---|---|---|
| `MEMORY_VIOLATION` | Process | Process | `PROCESS_STOP` |
| `MEMORY_VIOLATION` | Partition | Partition | `PARTITION_RESTART (COLD_START)` |
| `NUMERIC_ERROR` | Process | Process | `PROCESS_RESTART` |
| `DEADLINE_MISSED` | Process | Partition | `PARTITION_RESTART (WARM_START)` |
| `APPLICATION_ERROR` | Application | Partition | `IGNORE` (uygulama zaten yakaladı) |
| `HARDWARE_FAULT` | — | Module | `MODULE_RESTART` |

Somut senaryo — DAL C display bölmesinde bir sıfıra bölme:

1. Bir sinyal işleme rutininde `divisor == 0`, sonuç: divide-by-zero exception.
2. Donanım trap MOS'a düşer; MOS `NUMERIC_ERROR` olarak sınıflandırır.
3. HM tablosunda bu kombinasyon için aksiyon `PROCESS_RESTART`. MOS yalnızca
   ilgili process'in stack ve state'ini reset eder; DAL A ve DAL B bölmeleri
   dokunulmaz.
4. Restart sırasında process kendi COLD_START vektöründen başlar; sampling
   portlar üzerine yazıldığı için bir sonraki periyotta zaten güncel veriyi
   okur; queuing portlarda hafif bir mesaj kaybı olabilir.
5. MOS olay defterine bir HM_RECORD yazar; sonraki yer bakımında bu defter
   incelenir.

Aynı hata bir DAL A uçuş kontrol bölmesinde olsaydı? Muhtemelen tablo
aksiyonu `PARTITION_RESTART (COLD_START)` olur — process seviyesinde restart
DAL A için yeterli güven vermez, çünkü sayısal hata daha derin bir uçuş
yasası bozukluğunun belirtisi olabilir. Redundant channel'lı bir mimaride
diğer kanal görevi zaten sürdürür.

**Kritik ince nokta**: HM tablosu bir kaynak dosyası değil, sertifikasyon
argümanının belkemiği. Bir hatanın "IGNORE" olarak sınıflandırılması, o
hatanın "gerçekleşse dahi emniyet analizinin sonucunu değiştirmediği" tezinin
kanıtlanmasına dayanır. Aynı şekilde `MODULE_RESTART` bir hatanın "diğer
kurtarma stratejilerinin yeterli olmadığı" tezi anlamına gelir. FAA/EASA
inceleyicileri bu tabloyu emniyet analizi belgeleriyle beraber inceler.

---

## Çok çekirdek: güzel resmin çirkin tarafı

Tek çekirdekli bir platformda ARINC 653'ün zaman izolasyonu iddiaları
matematiksel olarak temiz: bir anda tek bölme çalışır. Çok çekirdekli
platforma geçtiğinizde bu iddia darmadağın olur.

Sorun **interference channels** — çekirdekler arasında paylaşılan donanım:

- L2/L3 cache (paylaşımlı yolu üzerinden)
- Snoop bus (cache coherency trafiği)
- DRAM controller (bant genişliği paylaşımı)
- I/O bridge (PCIe/AXI bandwidth)
- Shared TLB (bazı SoC'lerde)

Core 0'da çalışan DAL A bölmesinin WCET'i, Core 1'deki DAL C bölmesinin ne
yaptığına bağlı olabilir — çünkü DAL C L2 cache'i temizliyor, DRAM
controller'ı meşgul ediyor olabilir. Bu, temporal bağımsızlık argümanının
ihlalidir.

CAST (Certification Authorities Software Team) pozisyon belgeleri (CAST-32A
ve devamı olan CAST-32B) bu sorunu adlandırır ve inceleyicinin göreceği
kanıtları listeler:

- Interference channel envanteri: paylaşımlı her donanım öğesi listelenmeli.
- Her interference channel için: kanalın maksimum etkisi ölçülmeli veya
  analitik olarak sınırlandırılmalı.
- WCET analizi tüm interference'ları içermeli veya ölçüm tabanlı testlerde
  worst-case yükleyici (stressor) partition'lar kullanılmalı.
- Cache partitioning, DRAM bandwidth reservation, deterministic cache
  coloring gibi mitigation teknikleri belgelenmeli.

Part 5 (Core Software) bu problem için mimari sözleşmeyi tanımlar. Pratikte
çoğu ilk multi-core ARINC 653 projesi **AMP** (asymmetric multiprocessing)
konfigürasyonu ile başlar: her partition tek bir çekirdeğe kilitlenir,
çekirdekler arası interference deterministik olarak sınırlandırılır.
Ardından paralel partition şemasına geçilir.

Bu, çok çekirdek performansının önemli bir kısmını masada bırakır. Deterministik
uçuş yazılımı üretimi ile "PC-benzeri" ortalama performans arasındaki gerilim,
2020'lerin aviyonik yazılım sertifikasyonunun en açık cephelerinden biri.

---

## Uygulamalar ve öğrenmek için nereden başlanır?

**Ticari**:

- **Wind River VxWorks 653** — pazarın en yaygın kullanılan ticari ARINC 653
  RTOS'larından biri; ticari uçak ve askeri IMA platformlarında referans olarak
  konumlanıyor.
- **Green Hills INTEGRITY-178** — F-35 gibi askeri programlarda referans,
  DAL A sertifikasyon dosyaları paketlenmiş halde satılır.
- **Lynx LynxOS-178** — daha küçük ayak izli ticari alternatif.
- **SYSGO PikeOS** — hypervisor tabanlı; aynı çekirdekte ARINC 653
  "personality"nin yanında Linux, native RTOS gibi başka personality'ler
  koşturabilir.
- **DDC-I Deos** — yoğun cache/interference mitigation altyapısı ile
  bilinir.

**Açık kaynak** (öğrenmek ve kurcalamak için):

- **POK** (Partitioned Operating Kernel) — ISAE-SUPAERO'dan çıkmış AADL
  tabanlı bir ARINC 653 çekirdeği; sertifiyeli değil ama pedagojik olarak
  temiz.
- **XtratuM** — Universidad Politécnica de Valencia'nın hipervizörü;
  ARINC 653 personality'sini XtratuM üzerinde kurabilirsiniz. ESA'nın uzay
  projelerinde referans olarak kullanıldı.

Bir ARINC 653 uygulamasını gerçekten yürüyen kodda görmek istiyorsanız POK
`examples/arinc653/` altında birkaç minimal örnek verir; bunlar
`schedule.xml`, `partitions.xml` ve HM konfigürasyonunu birbirine bağlar.
Standart soyutlamalar somuta iner.

---

## Sahadan tavsiyeler ve tuzaklar

- **Schedule table'ı yalnızca bir kere doğru kurmayı beklemeyin.** Uçuş
  yazılımı olgunlaştıkça bölmelerin gerçek WCET'i büyür, yeni fonksiyonlar
  gelir, yeni portlar çakışır. Her değişiklik yeni bir sertifikasyon delta
  demektir. Baştan slack'i cömert bırakın; uçuşta düzeltmek pahalıdır.
- **Sampling port kullanacaksanız veri validity time'ı hesaplayın.** Bir
  DAL A hedefinde, tüketici bölmenin "en son okuduğu değer 30 ms önce
  yazılmış" olabileceğini kabul eder. Kontrol sistemi tasarımı bu latansı
  içermelidir.
- **HM tablosunda `IGNORE`'ı savunmak ispat gerektirir.** Bir hatayı
  görmezden gelmek, o hatanın etki analizinde ele alınmış olmasını gerektirir.
  Kod incelemesinde uygulamanın hatayı gerçekten yakalayıp doğru davrandığı
  gösterilmelidir. Aksi hâlde sistem sessizce yanlış cevap verir.
- **APEX bir POSIX değildir.** `malloc`, `pthread_create`, `sleep` yok.
  Bellek ve process'ler sertifikasyon zamanı statik olarak tanımlanır.
  Uygulamanın "COLD_START" state'inde tüm CREATE_PROCESS, CREATE_SAMPLING_PORT
  çağrıları biter, sonra `NORMAL` moduna geçilir. Runtime içinde yeni
  process yaratılmaz.
- **Health monitoring loglarını uçuş sonrası indirmeyi ihmal etmeyin.** HM
  kayıtları uçuş verilerinin en değerli forensic parçalarından biridir.
  Bir intermittent hardware fault, bir cross-partition data corruption,
  bir cache-induced deadline_missed — hepsi kayıtta.
- **Multi-core partition'ı hafife almayın.** "İki çekirdek iki kat CPU"
  aviyonik açısından yanlıştır. Interference analizi, cache coloring,
  bandwidth reservation gibi ekstra mühendislik yükü ciddi bir vergi biner.
  Projenin başında Part 5 gerekliliklerine, CAST pozisyonlarına ve seçtiğiniz
  OS satıcısının çok çekirdek supplemental datasına bakmadan platform
  seçmeyin.

---

## Açık sorular

Aviyonik yazılım standartları çok sık değişmez, ama üzerlerine ne
konulacağını konuştuğumuz alanlar var:

- **Sanallaştırma ve mixed-criticality**: PikeOS gibi hipervizör tabanlı
  platformlar aynı işlemcide bir DAL A ARINC 653 personality ile bir DAL D
  Linux personality'yi barındırabiliyor. Bu birleşimin argümansal maliyeti
  hâlâ tartışmalı.
- **AI/ML entegrasyonu**: DAL A/B seviyesinde bir uygulamada ML inference
  çalıştırmak — non-deterministic latans, non-formal semantik. IMA'nın
  deterministik dünyasına bunu nasıl oturtacağımız EASA'nın "learning
  assurance" (concepts of design assurance for neural networks) çalışmasının
  başat sorularından.
- **Time-sensitive networking (TSN, IEEE 802.1)**: partition-arası
  iletişimin ağ üzerinden yapıldığı distributed IMA senaryolarında AFDX'in
  yerine TSN. Zaman-tetiklemeli scheduling'in ağa taşınması. ARINC 664 P7
  vs TSN karşılaştırması hâlâ olgunlaşıyor.

---

## Kaynaklar

- ARINC Report 653 — Avionics Application Software Standard Interface (ARINC
  Industry Activities: <https://www.aviation-ia.com/product-categories/arinc-standards>)
- RTCA DO-297 — Integrated Modular Avionics (IMA) Development Guidance and
  Certification Considerations (<https://www.rtca.org>)
- EUROCAE ED-124 — DO-297 counterpart (<https://www.eurocae.net>)
- Prisaznuk, P. J. — "Integrated Modular Avionics", *Proceedings of IEEE
  NAECON 1992*, s. 39-45.
- Rushby, J. — "Partitioning in Avionics Architectures: Requirements,
  Mechanisms, and Assurance", NASA/CR-1999-209347 (<https://ntrs.nasa.gov>)
- Watkins, C. B., & Walter, R. — "Transitioning from Federated Avionics
  Architectures to Integrated Modular Avionics", IEEE DASC 2007.
- CAST papers on multi-core processors in airborne systems (CAST-32A,
  CAST-32B), FAA Software Aircraft & Airborne Electronic Hardware policy
  page (<https://www.faa.gov/aircraft/air_cert/design_approvals/air_software>)
- POK — Partitioned Operating Kernel: <https://pok-kernel.github.io/>
- XtratuM — <http://www.xtratum.org/>
- Wind River VxWorks 653 datasheet ve programmer's guide (public marketing
  documentation).
- Green Hills INTEGRITY-178 tuMP product page.
- SYSGO PikeOS ARINC 653 Personality technical brief.
- DDC-I Deos ve cache partitioning white papers.

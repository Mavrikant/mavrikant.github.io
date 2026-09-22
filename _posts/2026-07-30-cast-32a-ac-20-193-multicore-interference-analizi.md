---
title: "CAST-32A'dan AC 20-193'e: Multicore Aviyonikte Karşılıklı Etki Analizi"
subtitle: "From CAST-32A to AC 20-193: Interference Analysis for Multi-Core Avionics"
background: "/img/posts/8.webp"
date: '2026-07-30 06:00:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [sertifikasyon, gomulu-sistemler, aviyonik]
---

Aviyonik yazılımda hoş olmayan bir sürprizin tipik hikâyesi şudur: birim testinde bir görev 5 ms'de biter, hedefte tek başına çalıştırıldığında yine 5 ms'de biter, tam sistem entegrasyonunda ise aynı görevin süresi 40 ms'ye çıkar ve zaman zaman period sınırını aşar. Kod değişmemiştir. Derleyici bayrakları değişmemiştir. Değişen tek şey, komşu üç çekirdeğin de aynı anda meşgul olmasıdır.

Bu "tek başına ölçüldüğünde iyi, birlikte çalışırken kötü" davranışı, tek çekirdekli aviyonikte pratik olarak yoktu; multicore SoC'lerin sertifikalı sistemlere girmeye başlamasıyla birlikte hem mühendislik hem de sertifikasyon dünyasında büyük bir açık haline geldi. Bu açığı kapatmak için çıkarılan belge zinciri — **CAST-32A**, ardından **EASA AMC 20-193** ve nihayet **FAA AC 20-193** — bugün multicore aviyonik yazılım sertifikasyonunun omurgasıdır. Bu yazıda belgenin ne söylediğini, "interference channel" (karşılıklı etki kanalı) kavramının neden bu kadar merkeze konduğunu, on objektifin ne istediğini ve bunları gerçek bir SoC üzerinde nasıl karşılamak gerektiğini adım adım ele alıyoruz.

---

## Kısa Bir Tarihçe

DO-178C 2011'de yayımlandığında akıldaki tipik uçuş bilgisayarı, özenle seçilmiş bir PowerPC ya da SPARC tabanlı **tek çekirdekli** bir platformdu. Multicore o dönem sivil aviyonikte istisnaydı; deterministik davranış tek çekirdeğin nispeten öngörülebilir zamanlaması üzerine inşa ediliyordu. Ancak 2010'ların ortasına gelindiğinde bir gerçekle yüzleşmek gerekti: yarı iletken sektörü tek çekirdekli SoC üretmiyor, üretse bile bunları uzun vadede tedarik etmiyordu. Yeni platformların hepsi çok çekirdekliydi — Freescale P4080, Xilinx Zynq, NXP T-series, Kalray MPPA-256, sonra ARM Cortex-A9/A15/A53/A72 kompleksleri.

Bu geçişin sertifikasyon boyutunu ele almak için **Certification Authorities Software Team (CAST)** — FAA, EASA ve TCCA'nın (Kanada) yazılım uzmanlarından oluşan gayri resmi çalışma grubu — 2014'te **CAST-32** pozisyon belgesini yayımladı. İki yıl sonra, 2016'da, daha kapsamlı ve olgun bir revizyon geldi: **CAST-32A**. Bu belge, on objektif etrafında şekillenen bir sertifikasyon çerçevesi tanımlıyordu.

CAST-32A resmi bir düzenleme olmayıp bir pozisyon belgesiydi; başka bir deyişle "otoritelerin bu konuda nasıl düşündüğünü" anlatıyordu ama bağlayıcı değildi. Endüstri onu ipek gibi kabul etti, çünkü başka bir rehber yoktu. Zaman içinde EASA, aynı içeriği bağlayıcı bir *Acceptable Means of Compliance* haline getirdi ve 2022'de **AMC 20-193**'ü [ED Decision 2022/001/R](https://www.easa.europa.eu/sites/default/files/dfu/annex_i_to_ed_decision_2022-001-r_amc_20-193_use_of_multi-core_processors_mcps.pdf) ile yayımladı. FAA ise 8 Ocak 2024'te [AC 20-193](https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_20-193.pdf)'ü yürürlüğe koyarak CAST-32A'nın yerini aldığını açıkça ilan etti. İki belge — AMC ve AC — büyük ölçüde birebir aynıdır; küresel bir uyum sağlama iradesinin nadir örneklerinden biridir.

---

## Kapsam: Kime, Neye, Ne Zaman?

AC 20-193 kendi kapsamını dar ama net tanımlar. Belge (paragraf 2.2) *"en az bir yazılım uygulamasının veya MCP'yi içeren donanım kaleminin IDAL'ı A, B veya C olan"* iki veya daha fazla **aktifleştirilmiş** çekirdekli sistemlere uygulanır. IDAL'ların tümü D veya E ise belge uygulanmaz (2.3). Devre dışı bırakılan çekirdekler için ise ilgili donanım rehberi (AC 20-152A) devreye girer.

Belgenin kasıtlı olarak dışarıda bıraktığı iki teknoloji ise dikkate değer:

- **Simultaneous multithreading (SMT):** Intel Hyper-Threading benzeri, tek fiziksel çekirdeğin birden çok mantıksal çekirdek gibi görünmesi. Otoriteler "yeterli deneyimimiz yok" diyerek konuyu ertelemiştir (paragraf 2.6.5).
- **Dinamik görev-çekirdek ataması:** İşletim sistemi ya da hypervisor'ün görevleri çalışma sırasında farklı çekirdeklere kaydırması. AC, görevlerin **açılışta** çekirdeklere sabit atanmasını ve sonrasında yer değiştirmemesini varsayar (2.6.4). "Multi-static allocation" — açılışta önceden tanımlı birkaç konfigürasyondan biri seçilip sabitlenir — dinamik değil kabul edilir.

İki önemli istisna da vardır (2.7): çekirdekler **lock-step** modunda çalışıyorsa (örneğin TI Hercules TMS570 veya NXP MPC5744P'nin DCLS Cortex-R5 çiftleri), ya da çekirdekler yalnızca klasik databuslar (ARINC 429, MIL-STD-1553) üzerinden konuşuyor ve *paylaşımlı bellek/cache/coherency fabric* içermiyorsa — bu iki durumda çekirdekler arası etkileşim için AC 20-193 objektifleri geçerli değildir. Lock-step zaten aynı işi tekrar tekrar yapan tek bir mantıksal çekirdek gibi davrandığı için "birlik" etkisi yaratmaz.

---

## "Interference Channel" — Belgenin Kalbi

AC 20-193 pek çok yeni kavram getirmez, ama bir tanesini merkeze koyar: **interference channel**. Belge (Bölüm 4, Definitions) bunu şöyle tanımlar:

> *A platform property that may cause interference between software applications or tasks.*

Bu tanım kasıtlı olarak geniştir. Bir interference channel, iki farklı çekirdek üzerinde koşan iki bağımsız görevin — aralarında **hiçbir açık veri veya kontrol akışı olmasa bile** — birinin diğerinin yürütme süresini, davranışını ya da fonksiyonel doğruluğunu etkileyebilmesini sağlayan **her türlü platform özelliğidir**. AC'nin 5.2.2 numaralı paragrafı bu noktayı özellikle vurgular: aynı fiziksel kaynak (cache, interconnect) üzerinden geçen iki bağımsız iş yükü, yazılım açısından hiçbir bağlantıları olmasa dahi platform seviyesinde **coupling** yaratır ve bu coupling WCET'i belirgin biçimde artırabilir.

Tipik interference channel örnekleri:

- **Paylaşımlı LLC (last-level cache):** Bir çekirdek çalışırken diğer çekirdeğin cache satırlarını dışarı atar. İlk çekirdeğin cache-hit oranı çöker, bellek erişimi patlar.
- **DRAM bank contention:** Aynı DDR bank'ına iki çekirdekten eşzamanlı erişim, `RAS`/`CAS` gecikmesi ve refresh döngüsü çakışmalarına neden olur.
- **Memory controller / interconnect arbitration:** ARM CCI-400 ya da CMN-600 gibi coherency fabric'ler, transaction'ları arbitrate ederken talep patlamalarında kuyruğa alır. Bir çekirdek yüksek trafik üretiyorsa diğerinin bekleme süresi uzar.
- **Cache coherency traffic:** Bir çekirdeğin yazdığı satırın diğer çekirdeğin cache'inde geçersiz kılınması (MESI'nin `Invalidate` mesajı) coherency fabric'te bant genişliği tüketir.
- **Paylaşımlı çevre birimleri:** DMA denetleyicisi, Ethernet MAC, USB gibi bloklar bus master olarak CPU trafiği ile yarışır.
- **TLB shootdown:** Bir çekirdek bellek eşleme değiştirdiğinde diğer çekirdeklere `TLBI` yayını yapılır, o sırada onların pipeline'ı durur.
- **Ortak güç/frekans domain'i:** DVFS ile bir çekirdeğin talep ettiği frekans artışı, komşu çekirdeğin de saatinin değişmesine (ya da termal kısıtlanmaya) yol açabilir.

AC 20-193 hangi kanalların "geçerli" sayılacağını size söylemez — bunu tespit ve dokümantasyon size bırakır. Yaptığınız iş, hedef platformdaki **tüm** kanalları tek tek çıkarmak, her biri için etkinin var olup olmadığını göstermek ve ihmal edilebilir olmayanları azaltmaktır. Objektiflerin tümü aslında bu tek işi farklı açılardan tekrar tekrar sorar.

---

## Somut Örnek: Zynq UltraScale+ MPSoC APU

Kavramı bir yere oturtmak için çok yaygın bir hedefi ele alalım: **Xilinx (AMD) Zynq UltraScale+ MPSoC**'nin *application processor unit* (APU) kompleksi. Yapı şöyledir:

- 4 × Cortex-A53 çekirdeği
- Her çekirdeğin **özel** L1: 32 KB I-cache, 32 KB D-cache
- Tüm çekirdeklerin **paylaşımlı** 1 MB L2 (SCU üzerinden coherent)
- Snoop Control Unit (SCU) + CCI-400 tarzı coherency fabric
- ACE + ACP portları üzerinden RPU, GPU ve PL (FPGA) tarafı ile aynı DDR'a erişim
- Tek DDR4 controller
- Real-Time Processing Unit (RPU) tarafında ayrıca 2 × Cortex-R5 (opsiyonel lock-step)

Sadece APU tarafında bile şunları saymamız gerekir: dört çekirdeğin **paylaşımlı 1 MB L2**, dört çekirdeğin ve RPU/PL'nin **paylaşımlı DDR** üzerindeki rekabeti, coherency fabric üzerindeki snoop trafiği, tek bir çekirdeğin `ic ivau` gibi cache maintenance instruction'larının diğer çekirdeklerde tetiklediği broadcast, TLB shootdown, ve PL tarafında AXI master olarak çalışan bir kernel'ın ACP üzerinden başlattığı transaction'ların CPU'lara etkisi. On kanaldan fazla eder.

Bu kompleksin görünüşteki "temiz" ARMv8 modeli, gerçek dünyada davranışı sertifikasyoncu için tahmin etmesi son derece zor bir sistemdir. Cortex-A53'ün L2'sinin **hardware prefetcher içermediği** [AMD/Xilinx belgelerinde](https://xilinx-wiki.atlassian.net/wiki/spaces/A/pages/18842098/Zynq+UltraScale+MPSoC+Cache+Coherency) net biçimde belirtilir, yani her cache miss'i tam DDR gecikmesini öder. Paylaşımlı 1 MB L2 bir çekirdek yoğun yürüyor iken üç çekirdek daha etkin oldukça, o tek çekirdeğin hit oranı hızla çöker.

---

## Neden Klasik WCET Yaklaşımı Yetersiz

Tek çekirdekli bir sistemde WCET analizi iki yoldan yürür: statik analiz (Bound-T, aiT, Chronos) ve ölçüm tabanlı analiz. Multicore'da her ikisi de aynı prensipte iflas eder: **etkinin miktarı yalnızca test edilen konfigürasyona bağlıdır**, ve gerçek worst-case'i üretmek son derece zordur.

Somut bir örnek için 2010'lu yılların en çok referans verilen çalışmasına, Nowotsch ve arkadaşlarının Freescale **P4080** üzerinde yaptığı ölçümlere bakalım. P4080, o dönemin aviyonik dünyasında yaygın bir hedefti (PikeOS ve Wind River VxWorks-653 üzerinde sertifikasyon paketleri vardı). Sekiz PowerPC e500mc çekirdeği ve paylaşımlı 2 MB L3 içeriyor.

Nowotsch ve arkadaşları, tek başına ölçtüklerinde bir yazma işlemi için maksimum **39 saat çevrimi** gecikme tespit ettiler. Aynı ölçümü sekiz çekirdek de bellek üreten trafik ile meşgul iken tekrar ettiklerinde, aynı yazma işlemi maksimum **1007 saat çevrimi** sürdü. Aynı program, aynı bayrak, aynı işlemci — **~25×** yavaşlama, tek bir işlemin worst-case'inde. Okuma tarafında da tek başına 40 çevrim olan gecikme sekiz çekirdek etkinken **~600 çevrime** çıktı. Bu sonuçlar akademik değil, sertifikalı platformlar üzerinde tekrar tekrar doğrulandı ve endüstride "multicore interference gerçek bir emniyet meselesi" konusunun tartışılmaz kanıtı oldu.

Bu tablonun sertifikasyon açısından anlamı şu: eğer aviyonik WCET analizinizi tek çekirdek koşarken yaparsanız — cazip görünür, çünkü çevre çekirdekleri kapamak ölçümü stabil hale getirir — hedefte ölçtüğünüzden **25 kat büyük** bir gecikme ile karşılaşabilirsiniz. AC 20-193'ün 5.5.3 paragrafı bu noktayı doğrudan söyler: *"The WCET of a software component or task may increase significantly when other software components or tasks are executing in parallel on the other cores of an MCP."*

Bu yüzden AC 20-193, WCET'i **hedef konfigürasyonda, tüm hosted software çalışırken** ölçmenizi ister. Buna izin veren tek istisna — ilerleyen bölümde anlatılan — **robust partitioning**'tir.

---

## On Objektif — Türkçe Özet

AC 20-193 on objektiften oluşan bir çerçeve tanımlar. Aşağıdaki tablo hem objektifin ne söylediğinin özetini hem de hangi IDAL seviyelerine uygulandığını gösterir:

| Objektif | Kısaca ne ister? | IDAL A/B | IDAL C |
|---|---|---|---|
| **MCP_Planning_1** | Planlarda MCP'yi (üretici + benzersiz ID), aktif çekirdek sayısını, yazılım mimarisini (AMP/SMP/BMP), dinamik özellikleri ve doğrulama araçlarını tanımla. | Evet | Evet |
| **MCP_Planning_2** | Paylaşımlı kaynakların (cache, interconnect, bellek) nasıl kullanılacağını yüksek seviyede tanımla; hangi donanım kaynaklarının kullanılacağını ve "safety net" ihtiyacını belirt. | Evet | Evet |
| **MCP_Resource_Usage_1** | MCP konfigürasyon ayarlarını (aktif çekirdekler, frekans, cache/memory paylaşımı, DVFS vs.) fonksiyonel ve zamanlama gereksinimlerini karşılayacak biçimde belirle ve belgeleyecek. | Evet | Evet |
| **MCP_Resource_Usage_2** | *Rezerve — AC 20-152A COTS-8'e devredildi (konfigürasyon ayarlarının kasıtsız değişimlerinin önlenmesi).* | n/a | n/a |
| **MCP_Resource_Usage_3** | Interference channel'ları tanımla ve seçtiğin azaltım yöntemlerini doğrula. | Evet | Note d'ye bak (koşullu) |
| **MCP_Resource_Usage_4** | MCP'nin ve interconnect'in mevcut kaynaklarını tespit et, uygulamalara tahsis et, ve **tüm hosted software çalışırken** taleplerin kapasiteyi aşmadığını doğrula (worst-case senaryo örtük). | Evet | Hayır |
| **MCP_Software_1** | Applicable software guidance'a (DO-178C) uygunluğu MCP bağlamında doğrula: tüm hosted bileşenler doğru çalışıyor **ve** intended final configuration'da yeterli zaman içinde bitiyor. | Evet | Evet |
| **MCP_Software_2** | Farklı çekirdeklerdeki bileşenler arası data ve control coupling'i, paylaşımlı belleği ve erişim kontrol mekanizmalarını gereksinim tabanlı testte fiilen egzersiz et. | Evet | Evet |
| **MCP_Error_Handling_1** | MCP içi arızaların etkilerini tespit et, safety objectives ile orantılı, fail-safe biçimde tespit ve ele alma yöntemleri tasarla ve doğrula; gerekirse MCP'den bağımsız "safety net". | Evet | Hayır |
| **MCP_Accomplishment_Summary_1** | Accomplishment Summary'de her bir objektifin nasıl karşılandığını dokümante et. | Evet | Evet |

Not: `MCP_Resource_Usage_2` "Reserved" olarak bırakıldı; ilgili konfigürasyon-koruma amacı [AC 20-152A](https://www.faa.gov/regulations_policies/advisory_circulars/index.cfm/go/document.information/documentID/1043682) COTS-8 objektifi tarafından zaten karşılanıyor. Bu, CAST-32A'dan AC 20-193'e geçişteki tek anlamlı numaralandırma değişikliğidir.

Uygulanabilirlik tablosuna bakınca hemen görünen bir gerçek şudur: **IDAL A, B ve C farkı yaratır**. DAL C bir sisteme, interference analizi yapmak zorunda değilseniz `MCP_Resource_Usage_4`, `MCP_Error_Handling_1` gibi objektiflerden feragat edebilirsiniz — ama o zaman `MCP_Software_1` altındaki doğrulama seçenekleriniz daralır: `MCP_Resource_Usage_3`'ü karşılamayan bir yazılım bileşenini artık "ayrı ayrı" doğrulayamaz, hedef konfigürasyonda test etmeniz gerekir.

---

## Robust Partitioning: Belgenin Kritik Ayrımı

AC 20-193'ün sunduğu en pratik "kolaylık" seçeneği, **robust partitioning** kavramıdır. Belge bunu iki alt parça olarak tanımlar:

- **Robust resource partitioning:** Bir yazılım partition'ı başka bir partition'ın kod/veri/G-Ç alanını bozamaz, tahsis edilen paylaşımlı kaynaktan (bellek, bant genişliği vs.) fazlasını **tüketemez**, ve donanım arızası tek partition'da kalır.
- **Robust time partitioning:** Zaman etkileşimi öyle azaltılmıştır ki, hiçbir partition — diğer çekirdeklerdeki diğer partition'lar hiç çalışmasa da veya hepsi bir arada çalışsa da — kendi yürütme zamanı ayrılığından fazlasını tüketmez.

Robust partitioning sağlandığında (ve doğrulandığında), MCP_Software_1 altında yazılım bileşenlerini **ayrı ayrı doğrulama ve WCET'i ayrı ayrı belirleme izni** alırsınız. Bu, sertifikasyon efora dramatik biçimde büyük fark yaratır: her artışta O(N²) yerine O(N) doğrulama iş yükü.

Ancak "ayrı ayrı doğrulama" ifadesinin belgede özel bir tanımı vardır (Note d, Bölüm 5.5): *"To 'verify separately' and 'determine the WCET separately' mean to conduct these activities without all the software executing at the same time on other cores of the MCP."* Diğer bir deyişle robust partitioning'iniz varsa, WCET'i tek başına ölçebilirsiniz — çünkü partitioning zaten diğer çekirdeklerin etkisini bertaraf ettiğini kanıtlıyor.

Sorun şu: **robust time partitioning'i tam anlamıyla sağlayan mimari çok azdır.** Uygulamada bunu üç şey yapar:

1. **Paylaşımlı kaynak izole edilir:** Cache coloring / partitioning (paylaşımlı L2/L3'ün set indekslerinin partition'lar arasında bölüştürülmesi), bank-aware bellek allocator'ı, bandwidth regulation (MemGuard tarzı).
2. **Zaman bölütlemesi determinist olur:** ARINC 653 tarzı statik major/minor frame'ler, "guaranteed time budget" temelinde arbitrage.
3. **Bunların tümü ilgili IDAL'da sertifikalanır.** AC 20-193 açık biçimde belirtir: *partitioning'i sağlayan yazılım, kendisi partitionladığı en yüksek IDAL kadar rigor ile geliştirilmeli.*

Bu üç şartın tamamını karşılayan hazır çözümler nadirdir: DDC-I'ın **Deos** RTOS'unda **SafeMC** teknolojisi ile bound-multiprocessing ve cache partitioning, Wind River **VxWorks 653** üzerindeki multi-core paketleri, ve SYSGO **PikeOS** üzerindeki multicore uzantıları. Hepsi ticari, hepsi DAL A referans paketiyle geliyor. Kendi RTOS'unuzu geliştiriyor ve robust partitioning'i sıfırdan sertifikalayacaksanız, o çabanın kendisi ayrı bir DAL A projesi büyüklüğündedir.

---

## Etki Azaltma Yaklaşımları

Robust partitioning her sistem için erişilebilir olmasa da, interference'ı azaltmak için literatürde ve pratikte olgunlaşmış birkaç teknik vardır:

### Cache partitioning (page coloring)

Paylaşımlı LLC set indekslemesi genelde adresin belli bitlerini kullanır. Sanal→fiziksel eşlemede o bitleri kontrol ederek her partition'a farklı **renk** (color) verirsiniz; farklı renkler farklı cache set'lerine düşer, birbirlerinin satırlarını atamaz. Linux çekirdeğinde `Palloc` ve benzeri yamalar bu tekniği uygular; sertifikalı RTOS'lar aynı prensibi statik ayırma ile yapar. Yan etki: her partition'ın kullanabileceği cache miktarı azalır — dolayısıyla ortalama hız düşer ama worst-case tahmin edilebilir.

### Bandwidth regulation

**MemGuard** tarzı algoritmalar her çekirdeğe periyot başına bir bellek transaction bütçesi verir; bütçe dolarsa çekirdek period sonuna kadar durdurulur. Donanımda **BRU** (Bandwidth Regulation Unit, RISC-V dünyasında öneriliyor) benzeri modüller de aynı fikri hızlandırıyor. Bu yaklaşımın gücü, kanıtlanabilir bir üst sınır sunmasıdır: hiçbir çekirdek "X MB/s'den fazla bant genişliği alamaz" derseniz, diğer çekirdeklerin worst-case ek gecikmesini analitik olarak sınırlayabilirsiniz.

### AER modeli (Acquire–Execute–Restitute)

PROXIMA ve HERCULES gibi Avrupa projelerinden çıkan, görevi üç faza bölen bir yürütme modeli: girişte veri belleğe alınır (Acquire), yürütme sırasında bellek erişimi *yasaktır* (Execute), çıkışta sonuçlar yazılır (Restitute). Execute fazında bellek trafiği olmadığı için interference sıfıra iner. Kod dönüşümü zorlu ama determinizm garantisi güçlü.

### Determinist scheduling: TDMA ve time-triggered

Çekirdeklerin belleğe erişim zamanları bir kırmızı-ışıklı kavşak gibi zaman dilimlerine ayrılır. TDMA arbitration bazı gerçek platformlarda desteklenir (Kalray MPPA çip ailesi klasik örnektir). Ortalama bant genişliği verimliliği düşer, ama analiz basitleşir.

### Çekirdek deaktivasyonu

En radikal ve — açıkçası — sertifikasyoncu için en cazip yol: dört çekirdekten üçünü kapatın, tek çekirdek üzerinde koşun. AC 20-193 bu senaryoya bile kapı bırakır (2.2): devre dışı bırakılmış çekirdekler için AC 20-152A geçerlidir. Uygulamada birçok erken multicore aviyonik projesi tam olarak bu yolu izledi — "çekirdekleri kapa, tek çekirdek gibi çalıştır" — çünkü sertifikasyon eforu daha küçüktü. Ancak modern SoC'lerin performansına ihtiyacınız varsa bu bir çözüm değil.

---

## Doğrulama: "Verify Separately" İfadesinin Tuzağı

MCP_Software_1'in "MCP platforms with robust partitioning" başlıklı kısmı çekiciydi: bileşenleri ayrı ayrı doğrulayabilirsiniz. Ancak Not (d) altında belgenin dilinin ne kadar keskin olduğu ortaya çıkıyor. "Ayrı ayrı" ifadesi belirsiz gibi görünür; belge onu tanımlar ve şunu söyler: **diğer tüm çekirdeklerdeki yazılımın eşzamanlı çalışmadığı bir konfigürasyonda test/analiz yapmak.**

Bunun pratik anlamı, robust partitioning'i belgenin tanımladığı iki alt-şart (resource + time) çerçevesinde ispatlayamıyorsanız, WCET'i **fiziksel hedef üzerinde, tüm yazılım eşzamanlı koşarken** belirlemek zorunda olduğunuzdur. Bu ölçümün nasıl yapılacağı ayrı bir problem: worst-case tetikleyen komşu yükü nasıl inşa edeceksiniz? Cevap, literatürde artık iyi bilinen **stresörlerdir** — komşu çekirdekte kasten yüksek bellek trafiği üreten sentetik programlar. Bosch ve TTTech'in ETAS/RTA veya Rapita'nın MACH178 gibi ticari çözümleri bu stresörleri hedefin özeline göre üretir; kendiniz de basit döngü tabanlı memory-hammer'lar yazabilirsiniz, ama seçilen stresörün gerçekten worst-case ürettiğini kanıtlamak ayrı bir egzersizdir.

AC ayrıca **robustness testing** ister (MCP_Software_1, Not b): standart DO-178C verification'ın kapsamadığı, MCP'nin arayüzlerine özel testlerdir — cache flush davranışı, interconnect doygunluğu, DMA-CPU çakışması, atomic operation'ların gerçek doğrulaması gibi.

---

## MCP_Software_2: Farklı Çekirdekler Arası Data ve Control Coupling

CAST-32A ve AC 20-193'ün ele aldığı bir başka ince nokta, DO-178C'nin klasik **data coupling / control coupling** analizinin multicore'da yetersiz kalışıdır. Klasik analiz, aynı adres alanındaki bileşenler arasındaki değişkenleri ve çağrı ilişkilerini taramak üzere kuruludur. Farklı çekirdeklerde koşan iki bileşenin aynı paylaşımlı belleği ya da kilitleri kullanıp kullanmadığı, klasik akış analiziyle görünmez.

MCP_Software_2 bu boşluğu doldurur: gereksinim tabanlı testler, farklı çekirdekler arasındaki data ve control coupling'i **fiilen egzersiz etmek** zorundadır. Bunun anlamı, iki çekirdeğin paylaştığı bir kuyruğu, bir semaforu, bir shared memory bloğunu, iki tarafın da eşzamanlı erişimi altında test etmektir — yalnızca "kod ikisini de çağırıyor" belgelemek yetmez.

Bu, PR incelemesi sırasında en sık kaçırılan objektiftir: ekip DO-178C data/control coupling analizini geçmiştir, ama multicore boyutu ihmal edilmiştir. `MCP_Software_2` bunu ayrıca kanıtlamayı ister.

---

## Uçtan Uca: Bir Objektif Karşılama Akışı

AC 20-193'ün uygulanması için bir örnek akış:

<div class="mermaid">
flowchart TD
    A[Planning_1: MCP secimi ve mimari - AMP/SMP/BMP] --> B[Planning_2: Paylasimli kaynaklar ve safety-net plani]
    B --> C[Resource_Usage_1: MCP konfigurasyon ayarlari belirlenir]
    C --> D[Resource_Usage_3: Interference kanallari cikarilir ve azaltim secilir]
    D --> E{Robust Partitioning tam saglaniyor mu?}
    E -- Evet --> F[Bilesenler ayri ayri dogrulanir - WCET tek basina]
    E -- Hayir --> G[Hedef konfigurasyonda tum hosted software calisirken dogrulama - stresorlerle]
    F --> H[Software_2: Cross-core data ve control coupling testleri]
    G --> H
    H --> I[Resource_Usage_4: Tum yazilim calisirken kapasite yeterli mi?]
    I --> J[Error_Handling_1: MCP ariza modlari ve safety-net]
    J --> K[Accomplishment_Summary_1: Her objektifin karsilanisi belgelenir]
</div>

Bu akış çizgisel görünse de gerçekte döngüseldir: bir interference channel geç fark edildiğinde konfigürasyona geri döner, `Resource_Usage_1`'i günceller, yeniden ölçersiniz. Aviyonik proje takvimlerinde bunun için yeterli slack bırakmayan ekipler entegrasyon fazında sert biçimde tökezliyor.

---

## Türkiye Perspektifi

Yerli aviyonik ekosistem hızla modern SoC platformlarına — Zynq UltraScale+, i.MX 8, TI Jacinto, NXP LX ailesi — geçtikçe AC 20-193 uyumu artık "belki gelecekte" değil, "şimdi" konudur. Yerli üreticilerin (TUSAŞ, ASELSAN, HAVELSAN) uçuş kontrol, misyon bilgisayarı ve görev sistemlerinde multicore SoC kullanımı yaygınlaşıyor; sertifikasyon açısından bu geçiş, tek çekirdekli hedefte olgunlaşmış DO-178C süreçlerine ek bir katman getiriyor.

Türkçe kaynakların bu alanda son derece dar olması özellikle yeni mezun mühendisler için engel oluşturuyor. Yayımlanmış belgeler İngilizce, seminerler İngilizce, endüstriyel training paketleri İngilizce. AC 20-193'ün altındaki mantığı (interference channel merkezciliği, robust partitioning'in koşulları, "verify separately" izninin sınırları) Türkçe sindirmek, ekip içinde ortak dilin oluşması için de önemli.

---

## Pratik Tavsiyeler

Multicore aviyonik yazılım sertifikasyon projesine başlıyorsanız, AC 20-193'ün ruhunu birkaç pratik kurala indirgemek mümkündür:

1. **MCP seçimini geç yapmayın.** Interference channel'ların sayısı ve doğası SoC'ye bağlıdır; seçim sertifikasyon eforunu iki kata kadar değiştirebilir. Prefer aile ile deneyimli COTS RTOS partner'lerin sertifikasyon paketi bulunan platformları.
2. **Objektifleri planlama aşamasında dokümantasyona kilitleyin.** Planning_1 ve Planning_2'yi ciddi almazsanız, sonradan gelen tüm objektifler için altyapıyı kaybedersiniz.
3. **Interference channel'ları erken çıkarın.** Tek başına bir haftalık iş; tam sistem entegrasyonundan sonra yapmaya çalışırsanız ay alır.
4. **Robust partitioning satın alın, geliştirmeyin.** Kendi başınıza yapacaksanız bu ayrı bir DAL A projesidir; sertifikalı bir RTOS ile başlayın.
5. **Stresörleri hedef için özel tasarlayın.** Genel amaçlı memory hammer'lar worst-case yakalamayabilir; SoC'nizin en zayıf noktasını (örneğin belirli bir DDR bank pattern'ı, belirli bir cache set) hedefleyen mikroçekirdekler yazın.
6. **MCP_Software_2 için ayrı test kampanyası açın.** Klasik data/control coupling analizini tekrar etmeyin; çekirdekler arası paylaşımlı bellek/kilit/kuyruk için yeni testler yazın.
7. **Devre dışı çekirdek seçeneğini masada tutun.** Bazı emniyet-kritik alt sistemler için "üç çekirdek kapa, birini kullan" en düşük risk yolu olabilir.

---

## Sonuç

CAST-32A'dan AC 20-193'e uzanan on yıllık evrim, aviyonik sertifikasyon dünyasının yarı iletken sektörünün gerçekliği ile uzlaşma çabasıdır. Belgelerin merkezine yerleşen "interference channel" kavramı, geleneksel yazılım-yalıtımı düşüncesinin platform seviyesinde kırıldığı yerdir: iki bağımsız görev, aralarında tek bir açık iletişim olmasa bile, paylaştıkları donanım katmanları üzerinden birbirlerinin zamanlamasını bozabilir.

Belge size platform seçmez, RTOS seçmez, tasarım yapmaz. Sadece şunu ister: hedef platformunuzdaki her interference channel'ı çıkarın, her birinin ne yaptığını gösterin, ve nihai konfigürasyonda hosted yazılımın tümü koşarken sisteminizin doğru ve zamanında çalıştığını kanıtlayın. Bunu yaparken cazip görünen kestirmelerin — "tek başına ölç, sonra bir güvenlik katsayısı ile çarp" — matematiksel olarak yetersiz olduğunu Nowotsch'un yıllar önce gösterdiği 25× yavaşlama rakamı gibi ölçümler açıkça ortaya koydu.

Multicore aviyonik, iyi yönetildiğinde tek çekirdeğin veremediği performans zarfını sunar; kötü yönetildiğinde ise entegrasyon fazında ekiplerin gecelerini yiyen bir kaynak haline gelir. AC 20-193, ikisi arasındaki farkın nerede geçtiğinin haritasıdır.

---

## Kaynaklar

- [FAA AC 20-193, *Use of Multi-Core Processors*, 8 Ocak 2024](https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_20-193.pdf)
- [EASA AMC 20-193, Annex I to ED Decision 2022/001/R, *Use of Multi-Core Processors (MCPs)*](https://www.easa.europa.eu/sites/default/files/dfu/annex_i_to_ed_decision_2022-001-r_amc_20-193_use_of_multi-core_processors_mcps.pdf)
- CAST-32A, *Position Paper on Multi-core Processors*, Certification Authorities Software Team, Kasım 2016. [Arşiv kopyası](https://www.cast32a.com/files/cast-32a.pdf)
- J. Nowotsch, M. Paulitsch, D. Bühler, H. Theiling, S. Wegener, M. Schmidt, *Multi-core Interference-Sensitive WCET Analysis Leveraging Runtime Resource Capacity Enforcement*, ECRTS 2014. [ResearchGate](https://www.researchgate.net/publication/278382928_Interference-sensitive_Worst-case_Execution_Time_Analysis_for_Multi-core_Processors)
- D. Iorga, T. Sorensen, J. Wickerson, A. F. Donaldson, *Slow and Steady: Measuring and Tuning Multicore Interference*, RTAS 2020. [PDF](https://www.doc.ic.ac.uk/~afd/papers/2020/RTAS.pdf)
- A. Löfwenmark, S. Nadjm-Tehrani, *Understanding Shared Memory Bank Access Interference in Multi-Core Avionics*, WCET 2016. [Dagstuhl OASIcs](https://drops.dagstuhl.de/entities/document/10.4230/OASIcs.WCET.2016.12)
- AMD/Xilinx, [*Zynq UltraScale+ MPSoC Cache Coherency*, wiki sayfası](https://xilinx-wiki.atlassian.net/wiki/spaces/A/pages/18842098/Zynq+UltraScale+MPSoC+Cache+Coherency)
- Rapita Systems, [*AC 20-193 ve AMC 20-193 rehberi*](https://www.rapitasystems.com/amc-20-193)
- LDRA, [*Understanding CAST-32A and A(M)C 20-193*](https://ldra.com/amc20-193/)
- DDC-I, [*Deos SafeMC teknik özeti — bound multi-processing ve cache partitioning*](https://www.ddci.com/solutions/products/deos/)

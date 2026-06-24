---
title: "Gerçek Zamanlı Sistemler: Hızlı Olmak ile Zamanında Olmak Aynı Şey Değildir"
subtitle: "Real-Time Systems: Hard, Firm, Soft, Best-Effort and Beyond"
background: "/img/posts/2.webp"
date: '2026-06-24 09:00:00'
layout: post
lang: tr
mermaid: true
categories: [muhendislik]
tags: [gercek-zamanli-sistemler, gomulu-sistemler, aviyonik]
---

İki "gecikme" düşünün. İlki: akşam dizinizi izlerken görüntü 200 milisaniye takılıyor, bir kare donuyor, sonra düzeliyor. Canınız sıkılır, belki söylenirsiniz, ama hayat devam eder. İkincisi: bir kaza anında hava yastığını ateşleyecek sinyal, olması gerekenden 50 milisaniye geç geliyor. Bu kez ortada can sıkıntısı yoktur; ortada bir trajedi vardır.

İki olayda da sistem "geç kaldı". Ama birinde gecikmenin bedeli bir homurtu, diğerinde bir insan hayatı. İşte **gerçek zamanlı sistemler** (*real-time systems*) tam da bu farkın üzerine kurulur. Yaygın sanının aksine gerçek zamanlılık "ne kadar hızlı" sorusu değildir; "**ne zaman**" sorusudur. Bir sonucun doğru olması yetmez — *zamanında* da olmak zorundadır. Geç gelen doğru cevap, çoğu zaman yanlış cevaptır.

Bu yazıda önce "gerçek zamanlı" kelimesinin en çok yanlış anlaşılan yanını netleştireceğiz; sonra bir deadline kaçırıldığında ne olduğuna göre sistemleri bir spektruma yerleştireceğiz — **hard, firm, soft, best-effort** ve **none**. Ardından bir sistemi gerçek zamanlı yapan şeyin ne olduğuna ve bunun pratikte nasıl sağlandığına bakacağız. En sonunda da bu beşli spektrumun *tek* sınıflandırma ekseni olmadığını, gerçek zamanlı sistemlerin başka hangi açılardan ayrıştığını göreceğiz.

---

## "Gerçek Zamanlı" Hızlı Demek Değildir

En baştan bir yanılgıyı dağıtalım: gerçek zamanlı, hızlı demek değildir. Saniyede milyarlarca işlem yapan bir sunucu gerçek zamanlı olmayabilir; saniyede yalnızca yüz işlem yapan mütevazı bir mikrodenetleyici ise kusursuz biçimde gerçek zamanlı olabilir.

Aradaki fark **determinizmdir** (*determinism*) — yani öngörülebilirlik. Gerçek zamanlı bir sistemde önemli olan, bir işin *ortalama* ne kadar sürdüğü değil, **en kötü ihtimalle** ne kadar süreceğinin garanti altında olmasıdır. Bir işlem bazen 1 milisaniyede, bazen 2 milisaniyede, ama nadiren de olsa 100 milisaniyede bitiyorsa, ortalaması ne kadar parlak olursa olsun o sistem güvenilmezdir. Çünkü gerçek zamanlı dünyada sizi vuran şey ortalama değil, o ender görülen en kötü andır.

Bu yüzden sözlüğümüze üç kavram girer:

- **Deadline (son teslim anı):** Bir işin tamamlanmış olması gereken zaman sınırı. Gerçek zamanlılığın kalbidir.
- **Gecikme (*latency*):** Bir olayın (bir sensör tetiklemesi, bir kesme) gerçekleşmesi ile sistemin ona yanıt vermesi arasında geçen süre.
- **Seğirme (*jitter*):** Bu gecikmenin ölçümden ölçüme ne kadar değiştiği. Her döngüde tam tamına 10 ms'de yanıt veren bir sistem düşük seğirmelidir; bazen 8 bazen 14 ms'de yanıt veren sistem ise yüksek seğirmelidir — ve gerçek zamanlı tasarımda seğirme çoğu zaman ham hızdan daha kıymetlidir.

Özetle: gerçek zamanlı bir sistem, "olabildiğince hızlı" çalışan değil, "**her zaman söz verdiği süre içinde**" çalışan sistemdir.

---

## Anahtar Fikir: Değerin Zamanla Değişmesi

Sistemleri sınıflandıran zarif fikir şudur: bir sonucun değeri zamanla nasıl değişir? Bir işi deadline'ından *önce* bitirirseniz tam değeri alırsınız. Peki ya deadline kaçarsa? İşte cevabın şekli, sistemin hangi sınıfa girdiğini belirler.

- Kimi sistemde deadline geçtiği an değer **uçuruma düşer**: sonuç yalnızca değersiz olmakla kalmaz, aktif olarak zarar verir.
- Kimisinde değer aniden **sıfıra iner**: geç gelen sonuç işe yaramaz, ama en azından zararı da yoktur.
- Kimisinde değer **kademeli olarak azalır**: geç gelir, biraz değer kaybeder, ama hâlâ bir işe yarar.
- Kimisinde ise deadline diye keskin bir çizgi zaten yoktur; sadece "ne kadar erken, o kadar iyi" geçerlidir.

Bu "değer fonksiyonunun" şekli, aşağıdaki beş sınıfı birbirinden ayıran asıl ölçüttür. Şimdi spektrumu en katısından en gevşeğine doğru gezelim.

---

## Spektrum: Hard, Firm, Soft, Best-Effort, None

<div class="mermaid">
flowchart LR
    A["Hard<br/>kaçarsa felaket"] --> B["Firm<br/>geç = değersiz"] --> C["Soft<br/>geç = değer kaybı"] --> D["Best-effort<br/>garanti yok"] --> E["None<br/>zaman önemsiz"]
    style A fill:#f6c1c1,stroke:#c0392b,stroke-width:2px
    style B fill:#f6d8c1,stroke:#cb6b2b,stroke-width:2px
    style C fill:#f6edc1,stroke:#b39a2b,stroke-width:2px
    style D fill:#d9e8f5,stroke:#3d6fa5,stroke-width:2px
    style E fill:#cfe8cf,stroke:#2e7d32,stroke-width:2px
</div>

Soldan sağa gidildikçe zaman kısıtının sertliği azalır, esneklik artar. Önce her birini tek tek görelim, sonra hepsini bir tabloda toplayalım.

### Hard (Katı) Gerçek Zamanlı

En tavizsiz uçtur. Bir tek deadline kaçırmak bile sistemin tümden başarısız sayılması demektir; sonuç çoğu zaman felakettir — maddi hasar, yaralanma, ölüm. Burada "geç gelen doğru cevap" yalnızca yararsız değil, tehlikelidir.

Klasik örnekler güvenlik-kritik dünyadan gelir: bir uçağın **uçuş kontrol bilgisayarı**, otomobilin **hava yastığı** ve **ABS** (kilitlenmeyi önleyen fren) denetleyicisi, bir **kalp pili**, nükleer santralin acil kapatma sistemi. Bu sistemlerin doğruluğu yalnızca "ne hesapladığına" değil, "**tam olarak ne zaman** hesapladığına" bağlıdır. Hava yastığı milisaniyeler içinde açılmazsa hiç açılmamış gibidir.

### Firm (Sıkı) Gerçek Zamanlı

Bir adım gevşemiştir. Deadline kaçırılırsa sonuç **değersizdir** — atılır, kullanılmaz — ama bu, sistemi yıkmaz. Hard ile farkı şudur: gecikmiş sonucun bedeli sıfırdır, *negatif* değil. Üstelik firm sistemler ara sıra deadline kaçırmaya tahammül edebilir; yeter ki bu sık olmasın.

Örneğin bir endüstriyel üretim hattında, robot kolu doğru anı kaçırırsa o parça ıskartaya çıkar; üzücüdür ama fabrika patlamaz, bir sonraki parçaya geçilir. Benzer biçimde geç hesaplanmış bir borsa emri ya da zamanı geçmiş bir video karesi: işe yaramaz, en doğrusu onu hiç göstermemektir.

### Soft (Esnek) Gerçek Zamanlı

Burada deadline keskin bir uçurum değil, yumuşak bir yokuştur. Deadline kaçtığında sonuç hâlâ bir **değer taşır**, sadece geciktikçe bu değer azalır. Amaç deadline'a "her zaman" değil, "çoğunlukla" uymak ve kalite ile gecikme arasında makul bir denge tutturmaktır.

En tanıdık örnekler günlük hayatımızdan: **video/ses akışı** (bir kare biraz geç gelse de izleyici çoğu zaman fark etmez), **VoIP/görüntülü görüşme**, çevrimiçi **oyunlar**, ve genel olarak bir uygulamanın **arayüz tepkiselliği**. Bir butona bastığınızda 100 ms yerine 150 ms'de yanıt almak rahatsız edicidir ama yıkıcı değildir.

### Best-Effort (Elden Geldiğince)

Artık katı bir deadline garantisi yoktur. Sistem "elinden gelenin en iyisini" yapar: kaynakları olabildiğince verimli paylaştırır, ortalama tepkiselliği ve verimi (*throughput*) yüksek tutmaya çalışır, ama hiçbir tek isteğin belirli bir süre içinde biteceğine **söz vermez**.

İnternetin temel teslim modeli budur (*best-effort delivery*): paketler genellikle hızlı ulaşır, ama hiçbir zaman garanti yoktur. Bir **web sunucusunun** istekleri yanıtlaması, genel amaçlı bir işletim sisteminin süreçleri zamanlaması da böyledir — hedef "adil ve hızlı", ama "garantili" değil.

### None (Gerçek Zamanlı Olmayan)

En gevşek uç. Zamanlama, doğruluğun bir parçası bile değildir. İş ne zaman biterse bitsin, sonuç aynı ölçüde geçerlidir; tek dert genel olarak işin makul bir sürede tamamlanmasıdır.

Gece çalışan **toplu yedekleme** işleri, ay sonu **rapor üretimi**, çevrimdışı veri analizleri, bir derleyicinin kodu derlemesi... Bunlar bir dakika erken ya da geç bitsin, kimsenin umurunda değildir. Burada "deadline" kavramı mühendislik anlamında yoktur.

### Hepsi Bir Arada

| Sınıf | Deadline kaçarsa | Tipik örnek |
|---|---|---|
| **Hard** | Felaket; sonuç zararlı | Uçuş kontrol, hava yastığı, kalp pili, ABS |
| **Firm** | Sonuç değersiz (ama zararsız), atılır | Endüstriyel üretim adımı, geç video karesi |
| **Soft** | Sonucun değeri kademeli azalır | Video/ses akışı, VoIP, oyun, arayüz |
| **Best-effort** | Garanti yok; "elinden geleni yap" | Web sunucusu, internet paket teslimi, genel OS zamanlama |
| **None** | Önemli değil; zamanlama doğruluğun parçası değil | Gece yedekleme, çevrimdışı rapor, derleme |

Önemli bir not: Bu sınıflar bütün bir cihazı değil, **tek tek görevleri** etiketler. Tek bir akıllı telefonun içinde aynı anda hard (modem/radyo zamanlaması), soft (video oynatma) ve none (arka planda fotoğraf yedekleme) görevleri yaşar. Mesele "bu sistem hangi sınıf?" değil, "bu *görevin* deadline'ı kaçarsa ne olur?" sorusudur.

---

## Bir Sistemi Gerçek Zamanlı Yapan Nedir?

Madem hız değil, peki nedir? Tek kelimeyle: **garanti**. Gerçek zamanlı bir sistem, en kötü senaryoda bile deadline'ına uyacağını *önceden kanıtlayabilen* sistemdir. Bu güvence birkaç temel kavrama dayanır:

- **WCET (En Kötü Durum Yürütme Süresi, *Worst-Case Execution Time*):** Bir görevin tamamlanmasının *en fazla* ne kadar süreceği. Gerçek zamanlı mühendis ortalama süreyle değil, bu en kötü değerle çalışır; çünkü garanti ancak en kötü duruma göre verilebilir. Bu yüzden çoğu zaman önbellek (*cache*), dallanma tahmini gibi "ortalamayı iyileştiren ama en kötü durumu öngörülemez kılan" mekanizmalar gerçek zamanlı tasarımda göze batar.
- **Sınırlı gecikme:** Bir olaya yanıt süresinin bir üst sınırının olması ve bu sınırın asla aşılmaması.
- **Düşük seğirme:** Yanıt süresinin ölçümden ölçüme neredeyse hiç değişmemesi. Özellikle kontrol döngülerinde, sürekli ama biraz oynak bir gecikme, daha büyük ama *sabit* bir gecikmeden çok daha kötü olabilir.

Buradaki asıl zihniyet kayması şudur: gündelik yazılımda "çoğu zaman hızlı olsun, ara sıra yavaşlasa da olur" makbuldür. Gerçek zamanlı dünyada ise tam tersi geçerlidir — **biraz daha yavaş ama her seferinde aynı** olmak, ortalamada parlayıp ara sıra takılmaya yeğdir. Performans burada [fonksiyonel olmayan bir gereksinim]({% post_url 2022-07-11-fonksiyonel-olmayan-yazilim-gereksinimleri %}) olarak değil, doğruluğun ayrılmaz bir parçası olarak ele alınır.

---

## Bu Garanti Nasıl Sağlanır?

Öngörülebilirlik kendiliğinden gelmez; tasarlanır. Birkaç temel araç:

**Gerçek zamanlı işletim sistemi (RTOS).** Genel amaçlı bir işletim sistemi (masaüstü Linux, Windows) verimi ve adilliği önceler; bir görevin tam olarak ne zaman çalışacağını garanti etmez. Bir **RTOS** ise (FreeRTOS, VxWorks, QNX, Zephyr ya da gerçek zaman yaması uygulanmış Linux — `PREEMPT_RT`) öngörülebilirliği her şeyin önüne koyar: en yüksek öncelikli görevin, sınırlı ve bilinen bir süre içinde işlemciye kavuşacağını taahhüt eder.

**Öncelik ve kesme (*preemption*).** Görevlere öncelik atanır; daha öncelikli bir görev hazır olduğunda, çalışan düşük öncelikli görev anında durdurulup yerini ona bırakır. Hangi görevin hangi öncelikte ne zaman çalışacağını belirleyen kurala **zamanlama algoritması** denir. İki klasik yaklaşım: **RMS** (*Rate-Monotonic Scheduling*) — daha sık tekrarlanan görev daha yüksek önceliklidir; ve **EDF** (*Earliest Deadline First*) — deadline'ı en yakın olan görev önce çalışır. (Bu algoritmaların matematiksel "zamanlanabilirlik" ispatları başlı başına bir konudur; burada sezgisel düzeyde bırakıyoruz.)

### İşler Ters Gittiğinde: Öncelik Tersinmesi

Bu mekanizmaların ne kadar incelikli olduğunu anlatan en güzel hikâye, NASA'nın 1997'de Mars'a indirdiği **Mars Pathfinder** aracından gelir. Araç yüzeye iner inmez bilgisayarı tuhaf biçimde tekrar tekrar yeniden başlamaya başlar — milyonlarca kilometre öteden hata ayıklanması gereken bir kâbus.

Suçlu, gerçek zamanlı sistemlerin meşhur tuzağı **öncelik tersinmesidir** (*priority inversion*). Yüksek öncelikli bir görev, düşük öncelikli bir görevin elinde tuttuğu bir kaynağı (paylaşılan bir veri yolu) beklerken; araya giren *orta* öncelikli ama uzun süren bir görev, düşük öncelikli görevin çalışmasını engeller. Sonuçta yüksek öncelikli görev, kendisinden daha önemsiz bir göreve dolaylı yoldan takılıp kalır — öncelikler sanki tersine dönmüştür.

<div class="mermaid">
sequenceDiagram
    participant Y as Yüksek öncelik
    participant O as Orta öncelik
    participant D as Düşük öncelik
    D->>D: kaynağı kilitler
    Y->>Y: çalışmak ister, kaynağı bekler (bloke)
    O->>O: araya girer, uzun süre CPU'yu tutar
    Note over Y,D: Düşük öncelik kaynağı bırakamaz,<br/>Yüksek öncelik bekler → tersinme!
    D->>D: nihayet çalışıp kaynağı bırakır
    Y->>Y: ancak şimdi devam edebilir
</div>

Çözüm zarif bir kalıptır: **öncelik miras alma** (*priority inheritance*). Düşük öncelikli görev, yüksek öncelikli bir görevin beklediği bir kaynağı tutuyorsa, o kaynağı bırakana dek geçici olarak yüksek önceliğe "terfi" ettirilir; böylece araya orta öncelikli görevler giremez. Pathfinder ekibi, işletim sistemindeki bu özelliği uzaktan etkinleştirerek aracı kurtardı. Hikâyenin dersi nettir: gerçek zamanlı sistemlerde hatalar çoğu zaman tek tek bileşenlerin içinde değil, [bileşenlerin paylaştığı kaynaklarda ve aralarındaki etkileşimde]({% post_url 2026-06-04-coupling-dengesi %}) saklanır.

---

## Peki, Başka Gerçek Zamanlı Sistem Türleri Var mı?

Buraya kadar gördüğümüz hard/firm/soft/best-effort/none ayrımı, sistemleri **tek bir eksende** sıralar: *bir deadline kaçırılırsa ne olur?* Ama bu, gerçek zamanlı sistemleri sınıflandırmanın tek yolu değildir. Aynı sistem, birbirinden bağımsız başka eksenlerde de etiketlenir. İşte başlıcaları:

### Zaman-Tetiklemeli mi, Olay-Tetiklemeli mi?

Hermann Kopetz'in klasik ayrımıdır. **Zaman-tetiklemeli** (*time-triggered*) bir sistemde her şey, önceden belirlenmiş küresel bir zaman çizelgesine göre olur: "her 10 ms'de bir şu sensörü oku, şu çıkışı güncelle." Olaylar değil, saat yönetir; bu da öngörülebilirliği en üst düzeye çıkarır. **Olay-tetiklemeli** (*event-triggered*) bir sistemde ise işler, dış olaylar (bir kesme, bir mesaj) geldikçe tetiklenir — daha esnektir, ama yük arttığında öngörülebilirliği korumak zorlaşır. Güvenlik-kritik sistemler determinizm uğruna sıklıkla zaman-tetiklemeli tasarıma yönelir.

### Görevler Nasıl Geliyor: Periyodik / Aperiyodik / Sporadik

Bir başka eksen, görevlerin zaman içindeki gelme deseniyle ilgilidir:

- **Periyodik** (*periodic*): Düzenli aralıklarla tekrarlayan görevler — "her 5 ms'de bir." Kontrol döngülerinin tipik halidir ve analiz etmesi en kolay olandır.
- **Sporadik** (*sporadic*): Düzensiz gelen, ama iki gelişi arasında **bilinen bir asgari süre** garantisi olan görevler. Düzensizdir ama sınırlandırılabilir.
- **Aperiyodik** (*aperiodic*): Tamamen düzensiz, asgari aralık garantisi olmayan görevler — analiz açısından en zoru.

### Tek Düğümde mi, Dağıtık mı?

Gerçek zamanlılık tek bir bilgisayarda bitmez. **Dağıtık gerçek zamanlı sistemlerde** garanti, ağ üzerinden de korunmak zorundadır — ki sıradan bir Ethernet ağı tam da best-effort olduğu için bu garantiyi vermez. Bu yüzden özel **gerçek zamanlı ağ** teknolojileri doğmuştur: otomotivde **CAN** ve **FlexRay**, aviyonikte **AFDX / ARINC 664**, ve hem zaman-tetiklemeli garantiyi hem standart Ethernet'i birleştiren **TTEthernet** ile **TSN** (*Time-Sensitive Networking*, IEEE 802.1). Bu ağlar paketlerin yalnızca ulaşmasını değil, *zamanında* ulaşmasını da güvence altına alır.

### Karışık Kritiklik (Mixed-Criticality)

Modern bir eğilim, farklı kritiklikteki görevlerin **aynı donanımı paylaşmasıdır**: aynı işlemcide hem hayati bir hard görev, hem de önemsiz bir best-effort görev koşar. Buradaki zorluk, önemsiz görevin hiçbir koşulda hayati görevin zamanlamasını bozamayacağını garanti etmektir. Aviyonikte bunun çözümü **ARINC 653** standardının getirdiği **zaman ve uzay bölümlemesidir** (*time and space partitioning*): her uygulamaya, başkalarının taşamayacağı kendi zaman dilimi ve kendi bellek alanı ayrılır. Böylece düşük kritikli bir yazılımdaki bir hata, yüksek kritikli komşusuna sıçrayamaz. Bu, [emniyet-kritik yazılım]({% post_url 2026-04-05-misra-c-2025-ile-neler-degisti %}) disiplininin gerçek zamanlılıkla buluştuğu noktadır.

### Reaktif / Senkron Sistemler

Bir de gerçek zamanlı yazılımı baştan "zaman doğru olacak şekilde" yazmaya çalışan diller vardır: **senkron diller** (*synchronous languages*) — Esterel, Lustre ve onun endüstriyel hali **SCADE**. Bu diller, programın deterministik zamanlama davranışını matematiksel olarak kanıtlanabilir kılar ve aviyonik gibi alanlarda kontrol yazılımı üretmekte kullanılır.

### Bir de "Sahte" Gerçek Zamanlılık

Son olarak, günlük dilde "real-time" kelimesi çok savrukça kullanılır: "real-time analytics", "gerçek zamanlı kontrol paneli", "canlı bildirim"... Bunların neredeyse tamamı, bu yazıdaki mühendislik anlamıyla **soft** ya da **best-effort** sistemlerdir. Birkaç saniyelik gecikme kimseyi incitmez. Gerçek bir hard gerçek zamanlı sistemden bahsederken kastedilen şey, deadline kaçırmanın bedelinin **ölçülebilir bir felaket** olduğu, milisaniyelerin sayıldığı dünyadır.

---

## Sonuç

Gerçek zamanlı sistemleri anlamanın anahtarı, baştaki o iki gecikmeyi hatırlamaktır: takılan video ile geç açılan hava yastığı. Sistemin "hızlı" olup olmadığı değil, **geç kaldığında ne olduğu** her şeyi belirler.

Bu yüzden iyi mühendis, bir görevle karşılaştığında "bunu ne kadar hızlı yapabilirim?" diye değil, önce şunu sorar: *Bu işin bir deadline'ı var mı? Varsa, o deadline'ı kaçırırsam ne olur — felaket mi (hard), çöpe atılacak bir sonuç mu (firm), azalan bir değer mi (soft), yoksa hiçbir şey mi (none)?* Cevap, hangi işletim sistemini, hangi zamanlamayı, hangi ağı ve ne kadar titizlik gerektiğini belirler.

Ve unutmayın: gerçek zamanlılık ortalamalarla değil, **en kötü durumla** ilgilenir. Bir sistemi gerçek zamanlı yapan şey, iyi günlerde ne kadar hızlı olduğu değil, en kötü gününde bile sözünü tutacağına dair verebildiği garantidir. Tıpkı [sistem mühendisliğinde]({% post_url 2026-05-26-sistem-muhendisligi-nedir %}) olduğu gibi, asıl mühendislik, ortalamanın değil, sınırların yönetilmesinde gizlidir.

---

**Kaynaklar:**

- C. L. Liu, James W. Layland — "Scheduling Algorithms for Multiprogramming in a Hard-Real-Time Environment," *Journal of the ACM*, vol. 20, no. 1, 1973. DOI: 10.1145/321738.321743.
- Giorgio C. Buttazzo — *Hard Real-Time Computing Systems: Predictable Scheduling Algorithms and Applications* (Springer).
- Hermann Kopetz — *Real-Time Systems: Design Principles for Distributed Embedded Applications* (Springer).
- Mike Jones — ["What Really Happened on Mars?"](https://www.cs.cornell.edu/courses/cs614/1999sp/papers/pathfinder.html) (Mars Pathfinder öncelik tersinmesi olayı; Glenn Reeves'in anlatımına dayanır).
- ARINC 653 — *Avionics Application Software Standard Interface* (zaman ve uzay bölümlemesi); genel bakış: [ARINC 653 (Wikipedia)](https://en.wikipedia.org/wiki/ARINC_653).
- RTCA/EUROCAE — DO-178C / ED-12C, *Software Considerations in Airborne Systems and Equipment Certification* (2011).
- The Linux Foundation — [Real-Time Linux (`PREEMPT_RT`)](https://wiki.linuxfoundation.org/realtime/start).
- IEEE 802.1 — [Time-Sensitive Networking (TSN) Task Group](https://www.ieee802.org/1/pages/tsn.html).

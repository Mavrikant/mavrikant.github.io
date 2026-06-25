---
title: "Gerçek Zamanlı Sistemler: Hızlı Değil, Zamanında"
subtitle: "Hard, Firm, Soft and Best-Effort Real-Time Systems"
background: "/img/posts/2.webp"
date: '2026-06-25 09:00:00'
layout: post
lang: tr
mermaid: true
categories: [muhendislik]
tags: [gercek-zamanli-sistemler, gomulu-sistemler, aviyonik]
---

Akşam dizi izlerken görüntü yarım saniye donar, sonra kendine gelir. Sinir olursunuz, geçer. Aynı yarım saniye, bir kaza anında hava yastığını ateşleyecek sinyalin gecikmesi olduğunda ise ortada sinir değil, bir trajedi vardır.

İki olayda da sistem geç kaldı; ama birinde bedeli bir homurtu, diğerinde bir hayat. Gerçek zamanlı sistemler kavramı tam da bu farkın üzerine kuruludur. Yaygın sanının aksine mesele "ne kadar hızlı" değil, "ne zaman" sorusudur: bir sonucun doğru olması yetmez, zamanında da gelmesi gerekir. Geç gelen doğru cevap çoğu zaman yanlış cevaptır.

---

## Gerçek Zamanlı, Hızlı Demek Değil

Önce en sık yapılan hatayı dağıtalım. Saniyede milyarlarca işlem yapan bir sunucu gerçek zamanlı olmayabilir; saniyede yüz işlem yapan ufak bir mikrodenetleyici kusursuz biçimde gerçek zamanlı olabilir. Fark hızda değil, **determinizmde** (öngörülebilirlik): bir işin ortalama ne kadar sürdüğü değil, en kötü ihtimalle ne kadar süreceğinin garanti altında olması.

Bir işlem çoğu zaman 1 ms'de bitip nadiren 100 ms'ye çıkıyorsa, ortalaması ne kadar iyi olursa olsun o sistem güvenilmezdir. Çünkü sizi vuran şey ortalama değil, o ender görülen en kötü andır.

Üç kavram işin sözlüğünü oluşturur:

- **Deadline:** İşin tamamlanmış olması gereken an.
- **Gecikme** (*latency*): Bir olay ile sistemin ona verdiği yanıt arasındaki süre.
- **Seğirme** (*jitter*): Bu gecikmenin ölçümden ölçüme ne kadar oynadığı. Her döngüde tam 10 ms'de yanıt veren bir sistem iyidir; bazen 8 bazen 14 ms diyen sistem kötüdür. Kontrol döngülerinde seğirme çoğu zaman ham hızdan daha kıymetlidir.

---

## Spektrum: Hard, Firm, Soft, Best-Effort, None

Sistemleri sınıflandıran soru tektir: deadline kaçarsa sonucun değerine ne olur? Kiminde değer uçuruma düşer, kiminde sıfırlanır, kiminde yavaşça erir, kiminde de deadline diye keskin bir çizgi zaten yoktur. Beş sınıf bu cevaba göre dizilir.

<div class="mermaid">
flowchart LR
    A["Hard<br/>kaçarsa felaket"] --> B["Firm<br/>geç = değersiz"] --> C["Soft<br/>geç = değer kaybı"] --> D["Best-effort<br/>garanti yok"] --> E["None<br/>zaman önemsiz"]
    style A fill:#f6c1c1,stroke:#c0392b,stroke-width:2px
    style B fill:#f6d8c1,stroke:#cb6b2b,stroke-width:2px
    style C fill:#f6edc1,stroke:#b39a2b,stroke-width:2px
    style D fill:#d9e8f5,stroke:#3d6fa5,stroke-width:2px
    style E fill:#cfe8cf,stroke:#2e7d32,stroke-width:2px
</div>

Soldan sağa zaman kısıtının sertliği azalır.

### Hard (Katı)

En tavizsiz uç. Tek bir deadline kaçırmak bile sistemi tümden başarısız kılar ve sonuç çoğu zaman felakettir: maddi hasar, yaralanma, ölüm. Uçağın uçuş kontrol bilgisayarı, otomobilin hava yastığı ve ABS denetleyicisi, bir kalp pili, nükleer santralin acil kapatma sistemi... Bu sistemlerin doğruluğu "ne hesapladığına" değil, "tam olarak ne zaman hesapladığına" bağlıdır. Hava yastığı milisaniyeler içinde açılmazsa hiç açılmamış sayılır.

### Firm (Sıkı)

Bir adım gevşemiştir. Deadline kaçarsa sonuç değersizdir; atılır, kullanılmaz. Ama bu sistemi yıkmaz. Hard'dan farkı, gecikmiş sonucun bedelinin sıfır olması, negatif olmaması. Üretim hattında doğru anı kaçıran robot kolunun çıkardığı parça ıskartaya gider; üzücüdür ama fabrika patlamaz. Zamanı geçmiş bir borsa emri ya da geç kalmış bir video karesi de öyledir: en doğrusu onu hiç kullanmamaktır. Firm sistemler ara sıra deadline kaçırmaya tahammül eder, yeter ki bu sık olmasın.

### Soft (Esnek)

Burada deadline keskin bir uçurum değil, yumuşak bir yokuştur. Sonuç geç gelse de hâlâ işe yarar, sadece geciktikçe değeri azalır. Hedef, deadline'a "her zaman" değil "çoğunlukla" uymaktır. Video ve ses akışı, VoIP, çevrimiçi oyunlar, bir uygulamanın arayüz tepkiselliği... Bir butona bastığınızda 100 yerine 150 ms'de yanıt almak rahatsız edicidir ama yıkıcı değildir.

### Best-Effort (Elden Geldiğince)

Artık katı bir deadline garantisi yoktur. Sistem elinden gelenin en iyisini yapar: kaynağı verimli paylaştırır, ortalama tepkiselliği ve verimi (*throughput*) yüksek tutmaya çalışır, ama hiçbir tek isteğin belirli bir süre içinde biteceğine söz vermez. İnternetin teslim modeli (*best-effort delivery*) tam böyledir. Bir web sunucusunun istekleri karşılaması veya genel amaçlı bir işletim sisteminin süreçleri zamanlaması da aynı kategoridedir: hedef "adil ve hızlı", ama "garantili" değil.

### None (Gerçek Zamanlı Olmayan)

En gevşek uç. Zamanlama, doğruluğun bir parçası bile değildir. İş ne zaman biterse bitsin sonuç aynı ölçüde geçerlidir. Gece çalışan toplu yedeklemeler, ay sonu raporları, çevrimdışı veri analizleri, bir derleyicinin kodu derlemesi... Bunların mühendislik anlamında bir deadline'ı yoktur.

### Hepsi Bir Arada

| Sınıf | Deadline kaçarsa | Tipik örnek |
|---|---|---|
| **Hard** | Felaket; sonuç zararlı | Uçuş kontrol, hava yastığı, kalp pili, ABS |
| **Firm** | Sonuç değersiz (ama zararsız), atılır | Üretim adımı, geç video karesi |
| **Soft** | Değer kademeli azalır | Video/ses akışı, VoIP, oyun, arayüz |
| **Best-effort** | Garanti yok; "elinden geleni yap" | Web sunucusu, internet paket teslimi, genel OS zamanlama |
| **None** | Önemli değil | Gece yedekleme, çevrimdışı rapor, derleme |

Dikkat: bu sınıflar koca bir cihazı değil, tek tek **görevleri** etiketler. Bir akıllı telefonun içinde aynı anda hard (modem zamanlaması), soft (video oynatma) ve none (arka planda fotoğraf yedekleme) görevleri yaşar. Doğru soru "bu sistem hangi sınıf?" değil, "bu *görevin* deadline'ı kaçarsa ne olur?"dur.

---

## Garantiyi Nasıl Veriyoruz?

Madem hız değil, bir sistemi gerçek zamanlı yapan ne? Tek kelimeyle **garanti**: en kötü senaryoda bile deadline'a uyacağını önceden kanıtlayabilmek. Bu birkaç araca dayanır.

**WCET** (en kötü durum yürütme süresi, *worst-case execution time*). Mühendis ortalamayla değil bu en kötü değerle çalışır; çünkü garanti ancak en kötü duruma göre verilebilir. Bu yüzden önbellek (*cache*) ve dallanma tahmini gibi "ortalamayı iyileştiren ama en kötü durumu öngörülemez kılan" mekanizmalar gerçek zamanlı tasarımda göze batar. Performans burada [fonksiyonel olmayan bir gereksinim]({% post_url 2022-07-11-fonksiyonel-olmayan-yazilim-gereksinimleri %}) değil, doğruluğun ayrılmaz bir parçasıdır.

**RTOS.** Masaüstü Linux ya da Windows verimi ve adilliği önceler; bir görevin tam olarak ne zaman çalışacağını garanti etmez. Bir gerçek zamanlı işletim sistemi (FreeRTOS, VxWorks, QNX, Zephyr, ya da `PREEMPT_RT` yamalı Linux) ise öngörülebilirliği öne koyar: en yüksek öncelikli görevin sınırlı ve bilinen bir süre içinde işlemciye kavuşacağını taahhüt eder.

**Zamanlama.** Görevlere öncelik verilir; öncelikli bir görev hazır olunca, çalışan düşük öncelikli görev anında durdurulur (*preemption*). Hangi görevin ne zaman çalışacağına karar veren kurala zamanlama algoritması denir. İki klasiği: RMS (*Rate-Monotonic Scheduling*), daha sık tekrarlanan görevi daha öncelikli sayar; EDF (*Earliest Deadline First*), deadline'ı en yakın olanı önce çalıştırır. Bu algoritmaların matematiksel "zamanlanabilirlik" ispatları başlı başına bir konudur.

### Mars'taki Hata: Öncelik Tersinmesi

Bu mekanizmaların ne kadar ince olduğunu en iyi anlatan hikâye, NASA'nın 1997'de Mars'a indirdiği Pathfinder aracından gelir. Araç yüzeye iner inmez bilgisayarı tekrar tekrar yeniden başlamaya başlar; milyonlarca kilometre öteden ayıklanması gereken bir kâbus.

Suçlu, gerçek zamanlı sistemlerin meşhur tuzağı **öncelik tersinmesidir** (*priority inversion*). Yüksek öncelikli bir görev, düşük öncelikli bir görevin tuttuğu paylaşılan bir kaynağı bekler. Tam o sırada araya giren orta öncelikli ve uzun süren bir görev, düşük öncelikli görevin çalışmasını engeller. Sonuçta yüksek öncelikli görev, kendisinden önemsiz bir göreve dolaylı yoldan takılıp kalır; öncelikler sanki tersine dönmüştür. Çözüm öncelik miras almadır (*priority inheritance*): paylaşılan kaynağı tutan düşük öncelikli görev, onu bırakana dek geçici olarak yüksek önceliğe terfi ettirilir. Pathfinder ekibi bu özelliği uzaktan etkinleştirip aracı kurtardı.

Pathfinder'ın hatırlattığı şey şu: gerçek zamanlı sistemlerde hatalar çoğu zaman bileşenlerin içinde değil, [paylaştıkları kaynaklarda ve aralarındaki etkileşimde]({% post_url 2026-06-04-coupling-dengesi %}) saklanır.

---

## Tek Eksen Değil

Hard/firm/soft ayrımı sistemleri tek bir eksende dizer: deadline kaçarsa ne olur? Oysa gerçek zamanlı sistemler başka eksenlerde de ayrışır. Görevler saatin yönettiği önceden belirli bir çizelgeye göre mi tetikleniyor (zaman-tetiklemeli, *time-triggered*), yoksa dış olaylar geldikçe mi (olay-tetiklemeli)? Güvenlik-kritik tasarım, öngörülebilirlik uğruna çoğu zaman ilkini seçer. Garanti tek bir bilgisayarda mı kalıyor, yoksa ağ üzerinden mi taşınıyor? Sıradan Ethernet best-effort olduğundan, otomotivde CAN ve FlexRay, aviyonikte AFDX/ARINC 664, yeni sistemlerde TSN gibi gerçek zamanlı ağlar bu yükü üstlenir. Bir de modern eğilim: farklı kritiklikteki görevleri aynı donanımda koşturmak (*mixed-criticality*). Aviyonikte bunun çözümü ARINC 653'ün getirdiği zaman ve uzay bölümlemesidir; önemsiz bir görevdeki hata, hayati komşusuna sıçrayamasın diye. Bu, [emniyet-kritik yazılım]({% post_url 2026-04-05-misra-c-2025-ile-neler-degisti %}) disiplininin gerçek zamanlılıkla buluştuğu noktadır.

---

## Sonuç

İyi mühendis bir görevle karşılaştığında "bunu ne kadar hızlı yaparım?" diye değil, önce şunu sorar: bunun bir deadline'ı var mı, kaçırırsam ne olur? Felaket mi (hard), çöpe gidecek bir sonuç mu (firm), azalan bir değer mi (soft), yoksa hiçbir şey mi (none)? Cevap; işletim sistemini, zamanlamayı, ağı ve gereken titizliği belirler.

Bir uyarı da yerinde olur: günlük dilde "real-time analytics", "canlı pano", "anlık bildirim" diye geçen şeylerin neredeyse tamamı, bu mühendislik anlamıyla soft veya best-effort'tur; birkaç saniyelik gecikme kimseyi incitmez. Gerçek bir hard sistemde ise milisaniyeler sayılır ve deadline kaçırmanın bedeli ölçülebilir bir felakettir. Sonuçta gerçek zamanlılığı belirleyen şey, sistemin iyi günlerde ne kadar hızlı olduğu değil, en kötü gününde bile sözünü tutacağına dair verebildiği garantidir.

---

**Kaynaklar:**

- C. L. Liu, James W. Layland — "Scheduling Algorithms for Multiprogramming in a Hard-Real-Time Environment," *Journal of the ACM*, vol. 20, no. 1, 1973. DOI: 10.1145/321738.321743.
- Giorgio C. Buttazzo — *Hard Real-Time Computing Systems: Predictable Scheduling Algorithms and Applications* (Springer).
- Hermann Kopetz — *Real-Time Systems: Design Principles for Distributed Embedded Applications* (Springer).
- Mike Jones — ["What Really Happened on Mars?"](https://www.cs.cornell.edu/courses/cs614/1999sp/papers/pathfinder.html) (Mars Pathfinder öncelik tersinmesi olayı; Glenn Reeves'in anlatımına dayanır).
- ARINC 653 — *Avionics Application Software Standard Interface* (zaman ve uzay bölümlemesi); genel bakış: [ARINC 653 (Wikipedia)](https://en.wikipedia.org/wiki/ARINC_653).
- The Linux Foundation — [Real-Time Linux (`PREEMPT_RT`)](https://wiki.linuxfoundation.org/realtime/start).

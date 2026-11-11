---
title: "AFDX (ARINC 664 Part 7) Anatomisi: Sanal Bağlantı, BAG ve Determinist Ethernet'in Trafik Kontratı"
subtitle: "Anatomy of AFDX: Virtual Links, BAG and the Traffic Contract Behind Deterministic Ethernet"
background: "/img/posts/8.webp"
date: '2026-07-14 09:00:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [aviyonik, veri-yollari, ethernet, determinizm]
---

Modern bir yolcu uçağının aviyonik omurgası artık büyük ölçüde Ethernet üzerinden konuşuyor. Airbus A380, A350, A400M; Boeing 787; COMAC C919; Sukhoi Superjet — hepsinin veri yolu **AFDX**, resmi adıyla **ARINC 664 Part 7**. Ancak masaüstü Ethernet'inizden farklı olarak bu ağda "en iyi gayret" (best effort) diye bir kavram yok: her akışın önceden imzalanmış bir bant genişliği kontratı var, her paketin worst-case gecikmesi kâğıt üzerinde hesaplanabiliyor ve tüm ağ ikiz olarak dolanıyor.

Bu yazıda AFDX'in "determinist Ethernet" iddiasını ayaklarının üzerine oturtan mekanizmayı adım adım söküyoruz: **Sanal Bağlantı (Virtual Link, VL)** kavramı, **BAG (Bandwidth Allocation Gap)** ile trafik denetimi, uçtan uca gecikme bütçesi, çift ağ redundansı ve switch tarafındaki police mantığı. Amaç okuyucuya "AFDX Ethernet'e benzeyen bir şey" jenerikliğinden kurtulup neden bu ağın DO-178C DAL A gereksinimlerinin altına imza atabildiğini gösterebilmek.

---

## Neden Standart Ethernet Yetmez

Ethernet uçak dışında her yerde çalışır çünkü *zaman*a değil *bant*a odaklıdır: kablo boşsa gönder, çakışırsa geri çekil (CSMA/CD tarihi bugün full-duplex switched Ethernet'te büyük ölçüde geride kaldı), kuyruk dolarsa düş. Bu "en iyi gayret" tasarımı iki temel varsayımı kırar:

1. **Gecikme sınırı yok.** Standart bir Layer-2 anahtar üzerinde kuyruk gecikmesi, karşı trafiğe göre birkaç mikrosaniyeden birkaç yüz milisaniyeye kadar dalgalanır. Uçuş kontrol sisteminde 200 ms'lik bir gecikme atağı, kanal komutunda zaman uyumsuzluğu demektir; kabul edilemez.
2. **Bant kontratı yok.** Bir aygıt patlarcasına yayın yaparsa bütün ağ dolar. Aviyonik veri yolunda tek bir arızalı LRU (Line Replaceable Unit), uçuş kontrolünün Ethernet trafiğini boğmamalıdır.

MIL-STD-1553B bu problemleri **merkezi bus controller** + Manchester kodlama + zaman dilimli komut/yanıt protokolü ile çözer: her transferin başlama anı deterministtir. Ancak 1 Mbps'lik toplam bant, günümüzün sensör füzyonu, sentetik görüş sistemleri ve akışkan aviyonik ekranlarına yetmez. ARINC 429 tek yönlü noktadan noktaya bağlantılarla determinizmi sağlar ama uçak ölçeğinde on binlerce fiziksel kablo demektir; A380 gibi bir platformda kilometrelerce ağır tel anlamına gelir.

AFDX bu iki dünyayı birleştirmek üzere ortaya çıktı: **Ethernet'in bant genişliği ve topolojik esnekliği** + **1553'ün determinizm ve bant kontratı** disiplini. Kilit fikir, fiziksel Ethernet ağı üzerine ikinci bir mantıksal katman koyarak her akışa önceden matematiksel olarak sınırlanmış bir trafik kontratı imzalatmaktır.

---

## Sanal Bağlantı (Virtual Link): Fiziksel Değil, Mantıksal Bir Boru

AFDX'in en merkezi kavramı **Sanal Bağlantı**, kısaca **VL**. Tek bir kaynak End System'den (ES) bir veya daha fazla hedef ES'e giden mantıksal, tek yönlü bir veri yoludur. "Mantıksal" burada aşağıdaki anlamda somuttur:

- Her VL'nin **benzersiz bir 16-bit tanımlayıcısı** vardır. Bu tanımlayıcı, Ethernet MAC hedef adresinin (`03:00:00:00:xx:xx`) alt 16 bitine gömülüdür — böylece switch'ler standart L2 forwarding tablolarını kullanarak VL'yi yönlendirebilir.
- Bir VL'nin çıkış noktası tek bir ES'tir; birden fazla ES'in aynı VL'ye yazması yasaktır. Kaynak tekilliği, ağ denetiminin en temel varsayımıdır.
- Bir VL, ağ tasarımı sırasında **sabit** olarak konfigüre edilir. Uçuş sırasında dinamik VL kurulumu yoktur; her VL'nin kaynağı, hedefleri, BAG'ı ve Lmax'ı yer yazılım aracıyla önceden yüklenir.

Bu tasarım, aviyonik ağda "gizli akış" kavramını ortadan kaldırır: switch, tabloda olmayan bir VL ID'sinden gelen çerçeveyi *tanımaz ve düşürür*.

<div class="mermaid">
graph LR
  ES_A["ES: FMS<br/>(Flight Mgmt)"] -- "VL 0x1A2C<br/>BAG=16 ms, Lmax=256" --> SW_A[Switch A]
  SW_A --> ES_B["ES: PFD<br/>(Primary Flt Display)"]
  SW_A --> ES_C["ES: EICAS"]
  ES_A -. Network B kopyası .-> SW_B[Switch B]
  SW_B -.-> ES_B
  SW_B -.-> ES_C
</div>

---

## BAG: Bant Genişliği Değil, Zaman Aralığı Kontratı

AFDX her VL'ye bir **Bandwidth Allocation Gap (BAG)** verir. BAG, aynı VL üzerinde arka arkaya gönderilebilecek iki çerçevenin *başlangıç zamanları* arasında en az bulunması gereken süredir. Bu değer, 1 ms ile 128 ms arasında yalnızca **ikinin kuvvetleri** olabilir:

| BAG (ms) | Anlamı | Örnek kullanım |
|---:|---|---|
| 1  | 1 kHz throughput üst sınırı | Yüksek hızlı uçuş kontrolü |
| 2  | 500 Hz | Servo geri besleme |
| 4  | 250 Hz | Aviyonik durum güncelleme |
| 8  | 125 Hz | Genel telemetri |
| 16 | 62.5 Hz | FMS çıktısı, PFD veri |
| 32 | 31.25 Hz | EICAS gösterge güncelleme |
| 64 | 15.625 Hz | Sistem izleme |
| 128| 7.8125 Hz | Bakım / arızi mesajlar |

BAG'ın "yalnızca ikinin kuvvetleri" kısıtlaması tesadüf değil: switch tarafındaki polisleme (policing) mantığını basit ve deterministik yapmak için tasarım gereği bu şekildedir. Bir port için "her BAG penceresinde en fazla bir çerçeve" kuralı, saat kaymalarına karşı **jitter** toleransıyla birlikte token-bucket-benzeri bir algoritmayla uygulanır.

Bir VL'nin sağlayabileceği azami veri hızı kabaca şudur:

$$
R_\text{max} = \frac{L_\text{max} \cdot 8}{\text{BAG (s)}}
$$

Örneğin BAG = 16 ms ve Lmax = 256 bayt (Ethernet başlığı dahil) bir VL en fazla `256 × 8 / 0.016 = 128 kbps` sağlar. Her VL için bu üst sınır önceden bilinir; ağ tasarımı sırasında tüm VL'lerin toplamı fiziksel bağlantı kapasitesinin (100 Mbps) altında tutulur ve genellikle **çok altında** — %30-40 kullanım tipiktir. Kalan kapasite, gecikme kuyruklarının şişmemesi için yastıktır.

### Jitter Toleransı

Kaynak ES tam olarak BAG anında çerçeve üretemez; işletim sistemi çizelgeleme kesikliği, MAC katmanı iletim sırası ve donanımsal saat sapması nedeniyle çerçevenin çıkış anında küçük bir **jitter** olur. AFDX bu jitter'a bir üst sınır koyar: ARINC 664 P7, bir ES'in tek bir port üzerindeki toplam çıkış jitter'ı için 500 mikrosaniye civarında bir tepe değerini aşmamayı bekler; daha kesin sınır, o port üzerindeki tüm VL'lerin Lmax toplamına ve link hızına bağlı olarak formüle edilir. Anahtar fikir şudur: switch tarafındaki police algoritması bu tolerans ile *kalibre* edilir — sıkı BAG kontratı, gerçek dünya saat gürültüsünü dışlamayacak kadar esnek ama polislik disiplinini bozmayacak kadar dardır.

---

## Uçtan Uca Gecikme Bütçesi: Kâğıt Üzerinde Kanıt

AFDX'in cazibesi, uçtan uca gecikmenin *analitik olarak* sınırlanabilmesidir. Basit tek-atlamalı (single-hop) bir örnek üzerinden görelim:

- Kaynak ES → Switch → Hedef ES topolojisi
- 100 Mbps full duplex, çerçeve boyu 1000 bayt (yaklaşık MTU)
- BAG = 4 ms, aynı switch üzerindeki en yoğun rakip trafik: 5 VL, hepsi aynı port için

Adım adım bütçe:

1. **Serileşme süresi (kaynak ES çıkışı):** `1000 × 8 / 100e6 = 80 µs`
2. **Kaynak ES jitter'ı:** ≤ 500 µs (worst-case)
3. **Kablo yayılım gecikmesi:** 20 m için ≈ 0.1 µs — ihmal edilebilir
4. **Switch işleme gecikmesi:** cut-through kesikliği yoksa, store-and-forward switch için giriş çerçevesinin tamamının alınması gerekir: 80 µs (yeniden serileşme).
5. **Switch çıkış kuyruğu gecikmesi:** Aynı çıkış portunda kuyruğa yığılan 5 VL'nin toplam boyu ile ilgili worst-case: `5 × 1000 × 8 / 100e6 = 400 µs`
6. **Hedef ES yeniden serileşme:** Zaten switch tarafından yapıldı, hedef ES için ek serileşme sıfırdır.

Toplam worst-case uçtan uca gecikme: `500 + 80 + 80 + 400 ≈ 1060 µs ≈ 1.06 ms`.

Bu sayı **analitik**tir; simülasyon değil, ağ konfigürasyonundan matematiksel olarak türetilmiştir. **Network Calculus** çerçevesi (Cruz 1991, Le Boudec & Thiran 2001) tam olarak bu tür ağların worst-case gecikme sınırlarını hesaplamak için kullanılır ve AFDX ağının sertifikasyonunda bu tür kanıtlar dokümante edilir. Bunun karşıtı olan simülasyon tabanlı gecikme ölçümü, "gördüğümüz worst-case bu kadardı" der ama garanti vermez — DO-178C DAL A'da yeterli değildir.

---

## Çift Ağ Redundansı: A ve B Aynı Anda

AFDX her frame'in iki bağımsız ağ (Network A ve Network B) üzerinden **eş zamanlı** iletildiği bir çift redundant mimari kullanır. Bu, "birincil arızalanırsa yedeğe geç" değildir; **her ikisi de her zaman aktif ve gönderiyor**.

Her frame üzerinde 1 baytlık bir **Sequence Number (SN)** vardır. Alıcı ES aşağıdaki mantığı çalıştırır:

- Aynı VL için iki ağdan da aynı SN'li frame geldiyse, ilk gelen kabul edilir, ikincisi düşer.
- Bir ağdan frame kaybolursa, diğerinden gelen SN otomatik olarak kabul edilir — aplikasyon katmanı hiçbir kayıp yaşamaz.
- SN dizisinde büyük atlama varsa (örneğin ağın uzun süreli kesintisi), alıcı SN penceresini yeniden başlatır.

SN sadece 1 bayttır (0-255 arası dolaşımlı) — bu yeterlidir çünkü BAG kontratı zaten çerçeve hızını sınırlar; SN kaybolan iki-üç çerçeveyi ayırt etmek için değil, aynı çerçevenin iki kopyasının senkronizasyonu için vardır.

Çift ağ tasarımının kabalığına dikkat: fiziksel olarak ayrı switch'ler, ayrı güç kaynakları, tercihen ayrı kablolama yolları. Bir yerdeki tek arızanın (fiziksel kesim, switch güç kaybı, konektör hatası) iki ağı birden düşürmesi mimari olarak dışlanmalıdır.

<div class="mermaid">
graph TB
  ES1[ES-1] --> SW_A1[SW-A1]
  ES1 --> SW_B1[SW-B1]
  SW_A1 --> SW_A2[SW-A2]
  SW_B1 --> SW_B2[SW-B2]
  SW_A2 --> ES2[ES-2]
  SW_B2 --> ES2
  style SW_A1 fill:#e6f3ff,stroke:#2c73d2
  style SW_A2 fill:#e6f3ff,stroke:#2c73d2
  style SW_B1 fill:#fff4e6,stroke:#d47f18
  style SW_B2 fill:#fff4e6,stroke:#d47f18
</div>

---

## Switch Tarafındaki Police: Kim Kontratını İhlal Ediyor?

AFDX switch, klasik enterprise Layer-2 switch değildir. Her giriş portu için VL bazında **police** (trafik denetim) tabloları bulunur. Bir VL için yapılan kontrol tipik olarak şunlardır:

1. **BAG uyumu:** Son çerçeveden bu yana geçen süre ≥ (BAG − izin verilen jitter) mü?
2. **Lmax uyumu:** Çerçeve boyu ≤ Lmax mı?
3. **VL ID geçerliliği:** Bu giriş portundan bu VL zaten bekleniyor mu?
4. **Sequence Number sağlığı:** SN "makul" bir sıradaymış gibi mi görünüyor?

İhlal durumunda çerçeve **switch tarafından düşürülür** ve olay bir sağlık izleme (health monitoring) sayacına yazılır. Bu, aviyonik ağın "aşırı gürültücü LRU" problemini çözer: arızalı bir end system'in patlarcasına yayın yaparak yüksek öncelikli uçuş kontrol trafiğini boğması **fiziksel olarak imkânsızdır** çünkü ilk yanlış çerçeve zaten giriş portunda emilir.

Bu mekanizma, yer bakım araçlarıyla incelenebilecek "kim ne kadar police ihlali yaptı" istatistiklerine dönüşür. Bir LRU'nun sürüklenmeye başladığını (drift), operasyonel etkiler ortaya çıkmadan çok önce burada görürsünüz.

---

## Diğer Aviyonik Veri Yolları ile Karşılaştırma

Aynı ölçekte bir bakış:

| Özellik | ARINC 429 | MIL-STD-1553B | AFDX (ARINC 664 P7) | TSN (802.1) |
|---|---|---|---|---|
| Fiziksel katman | Twisted pair | Twin-ax | 100 Mbps Ethernet | 1 Gbps+ Ethernet |
| Ham bant | 12.5/100 kbps | 1 Mbps | 100 Mbps | 1 Gbps+ |
| Topoloji | Noktadan noktaya | Bus (dual redundant) | Star (dual redundant) | Star/Mesh |
| Determinizm mekanizması | Tek yönlü, tek yayıcı | Merkezi BC + zaman dilimi | Sanal bağlantı + BAG | Time-Aware Shaper + Frame Preemption |
| Bant kontratı | N/A (tek akış) | Frame slot ayırımı | BAG × Lmax | Gate control list |
| Redundans | Yok (kablo çoğaltılır) | Dual bus, primary/backup | Aktif-aktif A + B | Frame Replication (802.1CB) |
| Tipik kullanım | Klasik gövde aviyoniği | F-16, F-22, çok askeri | A380, A350, 787, C919 | Endüstriyel, otomotiv |

AFDX ile TSN sıkça karşılaştırılır; TSN, IEEE 802.1'in son on yıldaki çalışmalarıyla determinizmi standart Ethernet'e getirmeye çalışan bir dizi alt-standarttır (802.1Qbv Time-Aware Shaper, 802.1CB Frame Replication, 802.1AS-Rev zaman senkronizasyonu). Kavramsal örtüşme belirgin: her ikisi de zaman/kontrat tabanlı trafik disiplini + eş zamanlı redundans. Fark, AFDX'in havacılık ekosistemi tarafından on yılı aşkın süredir sertifikalanmış ve alan olgunluğuna erişmiş olması; TSN'in ise çok daha esnek olması ama aviyonik sertifikasyonda henüz aynı olgunluğa ulaşmamış olmasıdır. Uzun vadede TSN'in daha genel çözüm olması muhtemel; yakın vadede AFDX en az iki uçak nesli daha aktif kalacak gibi görünüyor.

---

## Sertifikasyon: Neden AFDX DAL A Altına Girer?

DO-178C DAL A yazılım gereksinimleri açısından bir end system'in AFDX yığını (stack) tipik olarak aşağıdaki mimari beklentileri karşılamalıdır:

- **Deterministik davranış**: Herhangi bir uygulama katmanı çağrısının worst-case yürütme süresi (WCET) ölçülebilir ve doğrulanabilir.
- **Bellek koruması**: Farklı DAL seviyelerindeki uygulamalar aynı end system'de barınıyorsa (partitioning), MPU/MMU ile ayrılmış olmalıdır — genellikle ARINC 653 uyumlu bir hipervizör kullanılır.
- **Sağlık izleme ve raporlama**: SN kayıpları, ağ tarafı police uyarıları, VL bazlı hata sayaçları uygulama tarafına raporlanmalıdır. Filo bakım verisi bu sayaçlardan üretilir.
- **Redundans yönetiminin gizliliği**: Uygulama katmanı A/B ağını görmez — SN eşleştirme ve hata gizleme (masking) alt katmanda yapılır. Bu gizleme, ağ arızalarının uygulama davranışına sızmasını engeller.

Uçtan uca gecikme kanıtı ise DO-178C 6.4 (test bazlı doğrulama) + DO-297 (IMA sertifikasyonu) + ağ konfigürasyonunun (VL tablosu, BAG'lar, Lmax'lar) sıkı change control altında tutulması ile sağlanır. Bir VL'nin BAG'ının değiştirilmesi, "ufak bir konfigürasyon değişikliği" değil, worst-case gecikme kanıtının yeniden yürütülmesi anlamına gelir.

---

## Pratik Mühendislik Tavsiyeleri

AFDX ağıyla çalışan mühendislere pratik bir avuç not:

1. **BAG ve Lmax'ı asla "biraz büyütelim" diye değiştirmeyin.** Her değişiklik toplam ağ gecikme bütçesini etkiler ve worst-case analizinin yeniden yapılması gerekir.
2. **Fiziksel kablolama redundansını doğrulayın.** A ve B ağının aynı kablo kanalından geçmesi, çift ağ redundansını *tek bir alev noktasına* düşürür. Sertifikasyon incelemelerinde bu konu sıkça sorulur.
3. **VL tablolarını sürüm kontrolüne alın.** Yer aracınızın yüklediği VL konfigürasyon dosyası, en az yazılım kodunuz kadar kritik bir artefakttır. `.xml` veya `.icd` dosyaları kod olarak izlenmelidir.
4. **Switch police sayaçlarını periyodik olarak toplayın ve trendleri izleyin.** Bir LRU'nun BAG ihlallerinin yavaşça artması, o LRU'daki bir zamanlama problemine işaret eder — arıza meydana gelmeden önce yakalanabilir.
5. **Uygulama katmanının A/B ağını görmemesini test edin.** Bir ağı fiziksel olarak keserek uygulamanın davranışının değişmediğini fault injection ile kanıtlayın; bu SN eşleştirme mantığının doğruluğunu gösterir.

---

## Açık Sorular ve İleri Okuma

AFDX olgun bir standart olsa da açık tartışma konuları var:

- **Zaman senkronizasyonu**: AFDX kendi başına bir global zaman kaynağı sunmaz. Uygulamalar arası senkronizasyon için IEEE 1588 (PTP) veya benzeri bir zaman protokolü ayrıca kurgulanmalıdır. TSN'in 802.1AS-Rev ile bu tarafı ne kadar iyi çözdüğü, uzun vadede AFDX'in yerine geçmesinin en güçlü argümanlarından biri.
- **Gigabit AFDX**: Standart 100 Mbps üzerine tasarlandı; artan sensör bant genişliği (radar, elektro-optik) 1 Gbps'lik varyantlara ihtiyaç doğurdu. ARINC 664'ün Gigabit uzantıları var ancak sertifikasyon pratiği ve worst-case analiz araçları hâlâ olgunlaşma sürecinde.
- **Karışık kritiklik**: DAL A trafiği ile DAL D veya non-DAL trafiği aynı fiziksel ağda taşındığında partitioning garantisinin kanıtı, yalnızca BAG'a değil switch mimarisine ve queue yönetimine de bakar. Bu alanda güncel akademik literatür üretken bir alan.

Konuyu derinleştirmek isteyene:

## Kaynaklar

1. **ARINC Specification 664 Part 7** — *Aircraft Data Network, Part 7: Avionics Full-Duplex Switched Ethernet Network*, AEEC. Kaynak metnin kendisi; erişim ARINC / SAE ITC üzerinden ücretlidir.
2. Aeronautical Radio, Inc. (AEEC) [ARINC 664 dokümantasyon sayfası](https://www.aviation-ia.com/product-categories/636-arinc-664).
3. Jean-Yves Le Boudec, Patrick Thiran, *Network Calculus: A Theory of Deterministic Queuing Systems for the Internet*, Springer, 2001. AFDX worst-case gecikme kanıtının matematiksel temeli. PDF açık: <https://leboudec.github.io/netcal/latex/netCalBookv4.pdf>
4. Henri Bauer, Jean-Luc Scharbarg, Christian Fraboul, *Worst-case end-to-end delay analysis of an avionics AFDX network*, DATE 2010. AFDX'e Network Calculus uygulaması. IEEE Xplore.
5. Airbus, *A380 Avionics Full Duplex Switched Ethernet Presentation*, 2005. AFDX'in mimari tanıtımı; teknik konferans sunumlarında dolaşan versiyonlarına IEEE ve SAE arşivlerinden erişilebilir.
6. R. L. Cruz, *A Calculus for Network Delay, Part I: Network Elements in Isolation*, IEEE Transactions on Information Theory, Vol. 37, No. 1, 1991. Network calculus'un kurucu makalelerinden.
7. IEEE 802.1 Time-Sensitive Networking (TSN) çalışma grubu: <https://1.ieee802.org/tsn/>. AFDX ile karşılaştırma için doğrudan kaynak.
8. RTCA DO-178C ve DO-297 — havayolu yazılım ve IMA sertifikasyonu; RTCA üzerinden alınır.

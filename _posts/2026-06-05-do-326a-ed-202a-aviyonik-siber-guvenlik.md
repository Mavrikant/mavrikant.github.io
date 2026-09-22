---
layout: post
title: "DO-326A ve ED-202A: Aviyonik Siber Güvenlik Sertifikasyonu — DO-178C'nin Yetmediği Yer"
subtitle: "DO-326A and ED-202A: Cybersecurity Certification for Airworthy Avionics"
background: '/img/posts/3.webp'
date: '2026-06-05 09:00:00'
lang: tr
mermaid: true
---

Bir uçuş yönetim bilgisayarı (FMS) günümüzde yalnızca pilotla konuşmuyor: ACARS üzerinden hava trafik kontrolüne, satelit üzerinden hava yolu operasyon merkezine, kabin Wi-Fi'sından izole bir alt-ağ üzerinden bakım terminallerine, çoğu zaman da bir EFB'nin (*Electronic Flight Bag*) USB veya kablosuz bağlantısı üzerinden tablete bağlanıyor. 30 yıl önce "uçak elektroniği" demek, dış dünyaya kapalı bir kara kutu demekti. Bugün her aviyonik kutunun en az bir veri arayüzü var ve bu arayüzlerin önemli bir kısmı, ucunda kontrolümüzün dışında bir cihaz olabilecek bir kabloya bakıyor.

Bu değişim **DO-178C**'nin işine yaramadı. DO-178C yazılımın gereksinimini, tasarımını, kodunu ve testlerini, *rastgele* veya *sistematik* hatalara karşı sertifikasyon ölçütlerine bağlar — ama bilinçli, **kasıtlı** bir saldırgan tarafından oluşturulan hata durumlarına karşı değil. Aynı şey DO-254 (donanım) ve ARP4761A (emniyet değerlendirmesi) için de geçerli. Bu standartlar bir bileşenin, içinde rastgele bir bit dönmesine veya bir gereksinim eksiğine karşı nasıl korunduğunu söyler; bir saldırganın o biti ne kadar maliyetle çevirebileceğini değil.

Bu boşluğu doldurmak için yazılan standart **DO-326A / ED-202A** — *Airworthiness Security Process Specification*. 2010'da DO-326 olarak, 2014'te güncellenmiş hâliyle DO-326A olarak yayımlandı; FAA ve EASA tarafından 2019'dan itibaren aviyonik siber güvenlik için *kabul edilen tek uygunluk yolu* (AMC) olarak gösterildi.[^1] Bu yazıda DO-326A ailesinin neyi söylediğini, DO-178C ile nasıl yan yana çalıştığını, **SAL ile DAL'ın eşlenmediğini**, "airworthiness security" ile "operational security" sınırındaki yorum belirsizliklerini ve hipotetik bir bakım Ethernet portu üzerinden 7-adım sürecin nasıl işlediğini somut adımlarla ele alacağız.

---

## Standart Ailesi: Tek Bir Dokümandan Daha Fazlası

DO-326A tek başına çalışmaz; etrafında, her biri yaşam döngüsünün farklı bir parçasını adresleyen bir doküman ailesi vardır. RTCA (ABD) ve EUROCAE (Avrupa) bu aileyi paralel yayımlar — içerikleri büyük ölçüde aynıdır, isimleri farklıdır:

| RTCA | EUROCAE | Başlık | Rol |
|------|---------|--------|-----|
| DO-326A | ED-202A | Airworthiness Security Process Specification | Süreç çerçevesi — "ne yapılacak" |
| DO-356A | ED-203A | Airworthiness Security Methods and Considerations | Yöntem rehberi — "nasıl yapılacak" |
| DO-355(A) | ED-204(A) | Information Security Guidance for Continuing Airworthiness | Hizmete girişten sonra |
| DO-357 | — | Supplements to DO-326A and DO-356A | DO-178C/DO-254/ARP4754A ile entegrasyon notları |
| DO-391 | ED-201A | Aeronautical Information System Security (AISS) Framework | Üst-seviye çerçeve |
| DO-392 | ED-206 | Security Event Management | Olay yönetimi |

İki ayrı boyutu ayırmak önemli: DO-326A **süreç** standardıdır — "şu adımları izleyeceksin, şu artifaktları üreteceksin" der. DO-356A bu adımların **nasıl** uygulanacağına dair yöntem kataloğudur. Bir başvurma yaparken her ikisini birlikte göstermeniz beklenir; sadece DO-326A'ya atıfta bulunmak, "DO-178C'yi destekliyorum ama hiçbir test yapmıyorum" demeye benzer.

DO-326B revizyonu RTCA gündeminde; yayın tarihi henüz net değil. Bu yazıdaki tüm referanslar DO-326A (2014) sürümüne dayanıyor.

---

## Üç Temel Kavram: IUEI, Airworthiness Security ve Threat Condition

Standart, IT dünyasından alışık olduğumuz "confidentiality / integrity / availability" üçlüsünü değil, aviyonik dünyasına uyarlanmış kendi kavram setini kullanır.

**IUEI — Intentional Unauthorized Electronic Interaction.** Standardın temel tehdit nesnesi. Türkçesi yerine olduğu gibi kullanılır: *kasıtlı, yetkisiz, elektronik etkileşim*. Bu tanımın üç parçası da kritiktir:
- *Kasıtlı:* random bir EMI/EMC etkisi veya yıldırım IUEI değildir; onları DO-160G adresler.
- *Yetkisiz:* bakım personelinin yetkili güncellemesi IUEI değildir; saldırganın aynı portu kullanması IUEI'dir. Sınır, **yetki** üzerinden çizilir, kim olduğu üzerinden değil.
- *Elektronik:* fiziksel sabotaj, hırsızlık, kabine zorla girme — DO-326A kapsamı dışı. Bunlar havaalanı güvenliği konusu.

**Airworthiness Security.** Standartın kapsadığı koruma alanı: bir tip tasarımının (*type design*) süregelen uçabilirliğini (*continued airworthiness*) etkileyebilecek IUEI'lere karşı sistemleri tasarlamak. Burada *type design* önemlidir: standart, "şu uçak modelinin güvenli uçma kabiliyeti" ile ilgilenir, hava yolunun BT altyapısıyla değil. Bu sınır kâğıt üzerinde net görünür ama pratikte bulanıklaşır (Bölüm 7).

**Threat Condition.** ARP4761A'nın "failure condition" kavramının siber muadili. Bir IUEI'nin başarıyla gerçekleştiği varsayıldığında uçakta hangi *durumun* doğacağını tanımlar. Sınıflandırma şiddeti ARP4761A'nın katastrofik / tehlikeli / önemli / minör skalasıyla aynı bant aralığını kullanır; ama olasılık değil **şiddet** üzerinden ilerler. Çünkü siber tehditte "10⁻⁹/uçuş saati" gibi bir taban olasılık yoktur — saldırganın motivasyonu ve yeteneği zamanla değişir.

---

## Airworthiness Security Process (AWSP): Yedi Adım, 14 Artifakt

DO-326A sürecini bir akışla özetleyelim:

<div class="mermaid">
flowchart TD
    A[1. Plan for Security<br/>Aspects of Certification<br/>PSecAC] --> B[2. Security Scope<br/>Definition]
    B --> C[3. Security Risk<br/>Assessment<br/>PASRA, ASRA]
    C --> D{4. Risk<br/>Acceptability<br/>Determination}
    D -- Kabul edilemez --> C
    D -- Kabul edilebilir --> E[5. Security<br/>Development]
    E --> F[6. Security<br/>Effectiveness<br/>Assurance]
    F --> G[7. Communication<br/>of Evidences<br/>PSecAC Summary]
    F -.kanıt yetersiz.-> E
</div>

Bu yedi adım toplam **14 aktiviteye** ve onlardan üretilen 14 artifakta ayrılır. En sık atıfta bulunulanlar:

| Artifakt | Açılım | DO-178C karşılığı |
|---|---|---|
| **PSecAC** | Plan for Security Aspects of Certification | PSAC |
| **PSecAC Summary** | PSecAC Özeti (kapanışta yayımlanır) | SAS (Software Accomplishment Summary) |
| **ASSD** | Aircraft Security Scope Definition | — |
| **PASRA** | Preliminary Aircraft Security Risk Assessment | (PSSA'nın siber muadili) |
| **ASRA** | Aircraft Security Risk Assessment | (SSA'nın siber muadili) |
| **SSSD** | System Security Scope Definition | — |
| **PSSRA / SSRA** | System-seviyesi PASRA / ASRA | (sistem-seviye PSSA/SSA) |
| **ASAM** | Aircraft Security Architecture and Measures | Mimari Tasarım Dokümanı |
| **ASOG** | Aircraft Security Operator Guidance | (yok — operasyonel) |

PSecAC, DO-178C'deki PSAC ile birebir aynı role sahiptir: yaşam döngüsünü, sorumlulukları, üretilecek kanıtları, kullanılacak araçları ve standart sapmaları planlar.[^2] PSecAC Summary ise sürecin sonunda, sertifikasyon otoritesine sunulan kapanış dokümanıdır — DO-178C'deki SAS gibi.

Bu eşleştirme bir noktayı netleştirir: DO-326A, DO-178C/DO-254'ün **yerini almaz**, yanına ek bir paralel akış açar. Aynı yazılım hâlâ DO-178C'ye göre geliştirilir; sadece artık ek olarak bir PSecAC, bir tehdit modeli, bir SAL ataması ve bir security verification raporu da üretilmiş olur.

---

## SAL ve DAL: Eşlenmeyen İki Ölçek

DO-326A'da güvenlik şiddeti, **Security Assurance Level (SAL)** ile ifade edilir. SAL ölçeği genellikle SAL0–SAL3 olarak işlenir (tedarikçi yorumları biraz farklılaşır; LDRA, PTC ve AFuzion'un belgelerinde bu skala kullanılır):

- **SAL0** — koruma gereksinimi yok denecek kadar küçük; ihmal edilebilir threat condition.
- **SAL1** — minör threat condition; temel hijyen yeterli.
- **SAL2** — önemli/tehlikeli threat condition; yapılandırılmış SecRA, tasarım kararları, doğrulama.
- **SAL3** — katastrofik veya tehlikeli; ileri seviye değerlendirme, formal yöntemler veya çok katmanlı kanıt.

Buradaki en yaygın *yanılgı*, **"DAL A → SAL3"** denklemini kurmaktır. Bu, DO-178C dünyasından gelen mühendisin ilk refleksidir; ve **yanlıştır**.

DAL, *failure condition severity* + *exposure* üzerinden atanır (ARP4754A/4761A). SAL ise *threat condition severity* üzerinden — yani *saldırı başarılı olursa* ne olur sorusuyla. Bunların eşleşmesi için bir başka koşul gereklidir: bileşenin **saldırı yüzeyi** olmalı.

Düşünelim: tamamen izole bir DAL A modülü — örneğin yalnızca dahili bir veri yoluna asılı, dışarıya hiçbir arayüzü olmayan bir flight control law hesaplayıcı. ARP4761 açısından bu modül **katastrofik** failure condition'a yol açabilir → DAL A. Ama IUEI açısından saldırı yüzeyi yok denecek kadar küçük olabilir; ilgili threat condition'lar gerçekçi değildir → SAL atama düşük olur, hatta SAL0.

Tersi de geçerlidir: kabin Wi-Fi'ı üzerinden yolculara internet veren bir sistem DAL E (uçuş emniyeti üzerinde etkisi yok) olabilir; ama bu sistem aynı zamanda bir aviyonik veri yoluna paralel köprüleniyorsa, IUEI sonucunda yan etkiler katastrofik olabilir → SAL yüksek atanır, DAL ile aynı bantta olmaz.

Pratik kuralı şöyle yazabiliriz:

```
DAL  = f(failure_condition_severity, exposure_to_random_or_systematic_faults)
SAL  = f(threat_condition_severity, attack_surface, threat_agent_capability)
```

İki fonksiyonun girdileri farklıdır; çıktıları otomatik eşlenmez. Tasarımda her iki ölçeği **bağımsız** yürütmek; sonra da kararlarını çelişkili bulduğunuz yerleri *tasarım tartışması* olarak ele almak gerekir.

---

## Yorum Belirsizliği: Airworthy vs Operational Güvenlik Sınırı

DO-326A'nın en çok tartışılan, en az açık olan kısmı **kapsam sınırıdır**. Standart açıkça "type design'in airworthiness'i" diyor — ama bugünün uçağı, type design ile operasyonel altyapı arasındaki sınırı sürekli aşıyor. Birkaç gri bölge örneği:

**EFB (Electronic Flight Bag).** Class 1 ve Class 2 EFB'ler taşınabilir cihazlardır (pilotun tableti). Class 3 EFB, uçağa kalıcı olarak takılır ve aviyonik veri yoluna belirli bir arayüzle bağlanır. Tipik yorum: Class 1/2 DO-326A kapsamı dışı, Class 3 kapsam içi. Ama Class 2 bir EFB, bir USB veya kablosuz bağlantıyla aviyonik tarafa veri besliyorsa? Sınır gerçekten net değildir; sertifikasyon otoritesi her vaka için ayrıca yorumlama yapabilir.

**Bakım laptop'ları.** Tasarımda "geçici bağlanan eşya" olarak modellenirse kapsam dışı; "operasyonel kullanım için zorunlu" olarak modellenirse kapsam içi. Bu sınıflandırma sertifikasyon paketinde ASOG (Aircraft Security Operator Guidance) ile açıklığa kavuşturulur — yani bir tasarım kararını **operasyonel rehbere** taşıyarak DO-326A kapsamından çıkarmış olursunuz. Bu tekniğin doğru kullanımı yasal; abartısı ise denetimde kabul görmez.

**Veri bağlantıları (ACARS, CPDLC, ADS-B in/out).** Uçak tarafındaki avionics: DO-326A kapsamı. Yer tarafındaki istasyon, hava trafik kontrol merkezi, hava yolu operasyon merkezi: kapsam dışı. Ama sertifikasyonda *uçtan-uca güven modeli* gösterilmesi beklenir — örneğin uçak, gelen CPDLC mesajının yetkili kaynaktan geldiğine nasıl güveniyor? Bu güven varsayımı *protokol katmanında* kanıtlanmak zorunda; "yer tarafı kapsam dışı" demek "yer tarafına körü körüne güveniyorum" demek değil.

Bu belirsizlikler iki yeni dokümanla giderilmeye çalışıldı:
- **DO-355A / ED-204A** — hizmete girişten sonra (continuing airworthiness) operatöre düşen yükleri tarifler. Aircraft Network Security Program (ANSP) buna dayanır.
- **EASA Part-IS** — organizasyon-seviyesinde, *kim* bu siber riskleri yönetmekten sorumlu sorusunu yanıtlar.

---

## Düzenleyici Manzara: EASA Part-IS ve FAA AC 119-1A

DO-326A bir teknik standarttır — kendi başına yasal zorunluluk değildir; o zorunluluğu **regülatör** doğurur.

**EASA tarafında** çerçeve 2022–2023'te kapandı:
- **Commission Delegated Regulation (EU) 2022/1645** (yayın: Ekim 2022) — tasarım/üretim kuruluşları, havalimanı operatörleri ve benzer aktörler için. Uygulanma tarihi: **16 Ekim 2025**.[^3]
- **Commission Implementing Regulation (EU) 2023/203** (yayın: Ocak 2023) — AOC sahibi hava taşıyıcıları, Part-145 bakım kuruluşları, CAMO, ATO, AeMC ve FSTD operatörleri için. Uygulanma tarihi: **22 Şubat 2026**.[^4]

Her ikisi birlikte **Part-IS** olarak bilinir ve organizasyonun, aviyatik emniyeti etkileyebilecek bilgi sistemlerini tanımlama, riskleri yönetme, olayları tespit ve raporlama yükümlülüğünü getirir. Bu, ürün-seviyesindeki DO-326A ile çakışmaz — onunla **tamamlayıcıdır**: DO-326A ne tasarlanacağını söyler, Part-IS o tasarımı işleten organizasyonun nasıl davranacağını söyler.

**FAA tarafında** süreç biraz daha dağınık:
- **AC 119-1A** (Eylül 2023, AC 119-1'in (2015) yerine geçti) — Operational Authorization of Aircraft Network Security Program. AC 119-1A esas olarak operatörün ANSP kurma yükümlülüğünü işler; tasarım tarafında **DO-326A / DO-356A**'ya yönlendirir.[^5]
- **ASISP (Aircraft Systems Information Security Protection)** — FAA'in çatı kavramı, tip sertifikasyonunda Special Conditions altında uygulanır.

Sonuç: DO-326A'yı *uygulamak* artık iyi-niyetli bir tercih değil; her iki büyük regülatör için sertifikasyon yolu pratik olarak buradan geçiyor.

---

## Hipotetik Senaryo: Bir Bakım Portu, Yedi Adımda

Soyut süreç adımlarını somutlaştırmak için tamamen hipotetik bir senaryoyu adım adım yürütelim. *Hiçbir gerçek proje, ürün veya organizasyona referans yoktur; bu yalnızca standardın işleyişini göstermek için kurulmuş bir akademik örnektir.*

**Sistem:** Yeni bir bölgesel jetin yakıt miktarı hesaplayıcısı (Fuel Quantity Computer, FQC). Tank sensörlerinden veri alır, kabin ekranlarına gönderir. Bakım için doğrudan bir Ethernet konnektörü vardır; konnektör avionics bay'inde, kapalı bir bölümün arkasında.

**1. PSecAC.** Sertifikasyonun planlandığı ilk gün, security takımı PSecAC'yi başlatır. Plana şunlar girer: süreç ARP4754A ile birlikte yürütülecek, tedarikçi PSecAC alt-planları sunacak, doğrulama ölçütleri DO-356A yöntem kataloğundan seçilecek, kullanılacak araçlar belirtilecek.

**2. Security Scope Definition.** ASSD/SSSD üretilir. FQC'nin sistem sınırları belirlenir: dahili veri yolu, tank sensör girişleri, kabin görüntü arayüzü, **ve bakım Ethernet portu**. Bakım portu, dış dünyaya bakan tek arayüzdür → saldırı yüzeyinde özellikle işaretlenir.

**3. Security Risk Assessment.** İlk hipotezler:
- **Tehdit ajanı:** kötü niyetli bakım personeli; çalınmış bakım laptop'u; düşmanca bir saha aktörü.
- **IUEI senaryosu 1:** Bakım portuna sahte bir cihaz takılır, FQC'nin bellenimine yetkisiz bir güncelleme yüklemeye çalışır.
- **IUEI senaryosu 2:** Bakım portuna geçerli bakım komutu gönderilir ama yakıt kalibrasyon tablosu kasten saptırılır.
- **IUEI senaryosu 3:** Bakım portu üzerinden FQC'ye, dahili veri yoluna sahte yakıt verisi enjekte etmesini söyleyen bir test komutu gönderilir.

Senaryo 3'ün threat condition'ı analiz edilir: yakıt miktarı yanlışlığı pilotun yakıt yönetimini sapıtabilir → "hazardous" kategoriye yakın bir threat condition. SAL ataması: SAL2 veya SAL3 — final atama, ASRA içinde, ARP4754A safety assessment ile çapraz tutarlılık denetiminden sonra yapılır.

**4. Risk Acceptability Determination.** Ham riskin kabul edilemez olduğuna karar verilir.

**5. Security Development.** Tasarım kararları:
- Bakım portu, fiziksel anahtar (weight-on-wheels + kapı durumu) olmadan yazma izinli moda geçmez.
- Bellenim güncellemeleri kriptografik imza doğrulamasından geçer; FQC'nin önyüklemesinde imza doğrulanmazsa son bilinen iyi sürüm aktive olur.
- Kalibrasyon parametreleri ayrı bir imzayla korunur; çalışma sırasında veri yoluna sahte yakıt verisi gönderebilecek bir test komutu, üretim hattı dışında erişilebilir değildir (debug fuses yakılır).
- Bakım portu üzerinde gönderilen tüm komutlar, sınırlı bir izin verilen komut listesinden (allow-list) geçer; bilinmeyen komut paketleri sessizce düşürülmez, ASOG'ye anlamlı bir log üretilir.

Bu tasarım kararları DO-178C/DO-254 akışlarındaki gereksinim, tasarım ve test artifaktlarına geri beslenir — örneğin imza doğrulama mantığı bir DAL A yazılım gereksinimi hâline gelir.

**6. Security Effectiveness Assurance.** Doğrulama:
- İmza doğrulamasının kod kapsama analizi (MC/DC dahil) yapılır.
- Penetrasyon testi: kasten malformed paketler, replay saldırıları, açık portlar.
- Bakım portu fiziksel anahtarının yanlış konfigürasyonuyla yazma denemesi reddedildiğinin testi.
- Allow-list dışı bir komutla testler.

Önemli not: pen-test tek başına yeterli değildir. DO-326A'nın temel mesajlarından biri budur. Pen-test, *Security Effectiveness Assurance*'ın bir aracıdır; kanıtın tamamı değil.

**7. Communication of Evidences.** PSecAC Summary üretilir; ASRA, SSRA, ASAM ve doğrulama kanıtları birlikte regülatöre sunulur. ASOG'de operatöre yönelik talimatlar: bakım portuna takılan cihazların izlenmesi, anormal log üretimine müdahale prosedürü, vb.

Bu akış aynı zamanda **Part-IS / AC 119-1A** dünyasına nasıl bağlanır? Tasarım tarafında bu tedbirler alındı. Ama uçak hizmete girdiğinde, bakım kuruluşunun bu portu nasıl kullanacağı, anomali tespit ettiğinde nereye bildireceği, yapılan tüm bağlantıların loglarını ne kadar tutacağı **Part-IS** tarafındadır. DO-326A "uçak bunu kabul edecek altyapıya sahiptir" der; Part-IS "operatör bu altyapıyı doğru kullanır" der.

---

## Yaygın Yanılgılar

Birkaç yıldır bu dünyada dolaşan yaygın hatalı varsayımlar:

- **"DO-326A, DO-178C'nin yerine geçer."** Hayır. Paralel yürürler. Aynı yazılım hâlâ DO-178C ile geliştirilir; DO-326A bunu hedef alan IUEI'lere karşı ek bir kanıt akışı kurar.
- **"DAL A olan her şey SAL3'tür."** Hayır. SAL ve DAL farklı girdilerden çıkar (Bölüm 5). İlişki *vaka-bazlıdır*, otomatik değildir.
- **"Standartta bir security kontrol listesi vardır."** Hayır. Süreç tabanlı bir standarttır; DO-326A çıktıdaki sürece bakar, bir lookup tablosu sunmaz. DO-356A bazı yöntem kataloğu sunar ama hâlâ tasarımcının seçimini bekler.
- **"Pen-test yapınca uygunluk sağlanır."** Hayır. Pen-test, Security Effectiveness Assurance'ın bir bileşenidir; risk değerlendirmesi, tasarım kanıtları ve doğrulama planı eksikse pen-test tek başına ikna edici değildir.
- **"EFB siber güvenliği tamamen DO-326A kapsamına girer."** Kısmen. Yalnızca Class 3 EFB type design'a entegredir. Class 1/2 için operasyonel ve organizasyonel kontroller (Part-IS) belirleyicidir.
- **"DO-326A askeri uçaklara da uygulanır."** Hayır. DO-326A sivil havacılık için yazıldı. Askeri sistemlerin kendi çerçeveleri vardır (örneğin DoD'un RMF'i, NATO standartları).

---

## Pratik Tavsiyeler — Bir DO-178C Mühendisinin Listesi

Eğer halihazırda bir DO-178C/DO-254 projesinde çalışıyor ve DO-326A faaliyetlerini ilk kez eklemek zorunda kaldıysanız, birkaç pratik öneri:

1. **PSecAC'yi PSAC ile aynı sprintte başlat.** Geriye dönük yazmak en pahalı yoludur. PSAC ile ortak şablonlardan başlamak, her iki dokümanın çapraz referans almasını kolaylaştırır.
2. **Threat modeling'i ARP4761A safety assessment ile aynı odada yap.** Bir oda, iki tahta — biri failure conditions, diğeri threat conditions. Aralarındaki paralelliği ve çelişkileri canlı izlemek tek tek toplantıdan çok daha verimli.
3. **Kapsam dışı dediğin her şeyi yaz.** Hangi arayüzlerin, neden DO-326A kapsamı dışı sayıldığını gerekçeleriyle yazılı bırakın. Sertifikasyon otoritesi en çok bu sınıra bakacak.
4. **ASOG'yi son anda yazmaya kalkma.** Operasyonel rehber, tasarım kararlarınızı meşrulaştırır. Hangi varsayımı operatöre devrettiyseniz, ASOG'de gerekçesiyle yer almalı.
5. **Allow-list, deny-list'e tercih edilir.** Aviyonik komut yüzeyleri sonludur; *bilinen iyi*yi listelemek, *bilinen kötü*yü listelemekten her zaman daha sağlamdır.
6. **Tedarikçi PSecAC'lerini erkenden iste.** Çok katmanlı bir tedarik zincirinde, alt-tedarikçinin "biz security ile ilgilenmiyoruz" dediği bir kutu sizin kanıt zincirinizdeki en zayıf halkaya dönüşür.

---

## Açık Sorular ve İleri Okuma

DO-326A henüz olgunlaşmış bir disiplin değil; standartlaşma süreçleri ilerlerken birkaç soru hâlâ açık:

- **DO-326B ne getirecek?** Beklenen revizyon, IMA platformları ve formal yöntemler etrafındaki yeni endüstri pratiklerini içermeye aday.
- **SAL ölçeği nasıl sayısallaştırılır?** Standart genel olarak süreç-temelli; SAL atamasında ölçülebilir bir matrise dönüş tartışılıyor (NIST'in 2023 vektör yaklaşımı bu yönde bir öneri).[^6]
- **Quantum tehdit modeli.** Bugünün kriptografik kabulleri post-quantum dönemde geçerliliğini koruyacak mı? Bakım anahtarlarının ömrü uçağın ömrüyle eşleşir.
- **AI bileşenlerinin tehdit modeli.** Yardımcı sistemlerde makine öğrenmesi modelleri görünmeye başladıkça, "modelin manipüle edilmesi" yeni bir IUEI biçimine dönüşüyor; standart bu kategoriye henüz değinmiyor.

İleri okuma için:
- DO-326A'ya en hızlı kapı: PTC'nin tanıtım e-kitabı ve Coracademy'nin "plain-English guide" makalesi.
- Akademik bakış için NIST'in Security Assurance Levels üzerine 2023 yayını.
- Regülasyon tarafı için EASA'nın Easy Access Rules — Information Security (2023/203 + 2022/1645) — Aralık 2025 revizyonu.[^7]
- DO-356A'nın yöntem kataloğunu pratikte uygulayan bir örnek için Wind River'ın DO-356A approach raporu.

---

DO-178C bize "yazılım, niyet edildiği gibi mi çalışıyor" sorusunu titizlikle sormayı öğretti. DO-326A onun yanına bir başka soru ekliyor: "yazılım, *kim* tarafından niyet edilmediği bir şekilde çalıştırılabilir mi?" İlk soruya kanıt üretmek tek başına bir aviyonik sistemi modern dünyada uçabilir hâle getirmiyor. İki soruya da, ayrı ayrı, sistematik olarak kanıt sunmak zorundayız — çünkü bağlantısız bir uçağın bile bugün artık bir bakım portu var.

---

## Kaynaklar

1. EASA — Information Security (Part-IS) FAQ: <https://www.easa.europa.eu/en/the-agency/faqs/information-security-part>
2. EASA — Easy Access Rules for Information Security (Regulations (EU) 2023/203 and 2022/1645) — Aralık 2025 revizyonu: <https://www.easa.europa.eu/en/document-library/easy-access-rules/easy-access-rules-information-security-regulations-eu-2023203>
3. EASA — "Part-IS regulation published, completing regulatory framework for cyber-resilient aviation" haberi: <https://www.easa.europa.eu/en/newsroom-and-events/news/part-regulation-published-completing-regulatory-framework-cyber-resilient>
4. FAA — Advisory Circular AC 119-1A, *Operational Authorization of Aircraft Network Security Program (ANSP)*, Eylül 2023: <https://www.faa.gov/regulations_policies/advisory_circulars/index.cfm/go/document.information/documentID/1042159>
5. FAA — Aircraft Systems Information Security Protection (ASISP) sayfası: <https://www.faa.gov/aircraft/air_cert/design_approvals/dah/cybersecurity>
6. Avionics International / AviationToday — *How DO-326 and ED-202 Are Becoming Mandatory for Airworthiness* (Mayıs 2019): <https://www.aviationtoday.com/2019/05/01/326-ed-202-becoming-mandatory-airworthiness/>
7. Coracademy — *What is DO-326A? A plain-English guide*: <https://coracademy.co.uk/insights/what-is-do-326a.html>
8. AFuzion — *DO-326A / ED-202A Aviation Cyber-Security*: <https://afuzion.com/do-326a-ed-202a-aviation-cyber-security/>
9. PTC — *DO-326A: An Introduction to Cybersecurity & Safety in Aviation*: <https://www.ptc.com/en/blogs/alm/do-326a-an-introduction-to-cybersecurity-safety-in-avaiation-and-aircraft-systems>
10. Jama Software — *Cybersecurity in the Air: Addressing Modern Threats with DO-326A*: <https://www.jamasoftware.com/blog/blog-cybersecurity-in-the-air-addressing-modern-threats-with-do-326a/>
11. Wind River — *Secure Avionics Systems: The Wind River Approach to DO-356A Certification*: <https://www.windriver.com/resource/a-security-strategy-for-avionics-systems>
12. Military Embedded Systems — *Incorporating DO-326A security airworthiness into software-development life cycle*: <https://militaryembedded.com/avionics/safety-certification/incorporating-do-326a-security-airworthiness-into-software-development-life-cycle>
13. NIST — *Security Assurance Levels: A Vector Approach to Describing Security Requirements* (2023): <https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=906330>

[^1]: AviationToday, "How DO-326 and ED-202 Are Becoming Mandatory for Airworthiness" (2019).
[^2]: Coracademy, "What is DO-326A?" — PSecAC ile PSAC arasındaki paralellik üzerine.
[^3]: EASA Part-IS FAQ; Commission Delegated Regulation (EU) 2022/1645, uygulanma tarihi 16 Ekim 2025.
[^4]: EASA Part-IS FAQ; Commission Implementing Regulation (EU) 2023/203, uygulanma tarihi 22 Şubat 2026.
[^5]: FAA Advisory Circular AC 119-1A, 28 Eylül 2023.
[^6]: NIST 2023 yayını — *Security Assurance Levels: A Vector Approach*.
[^7]: EASA — Easy Access Rules for Information Security (Aralık 2025 revizyonu).

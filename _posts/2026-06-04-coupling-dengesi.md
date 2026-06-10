---
title: "Coupling'i Dengelemek: Yazılım Tasarımında Bağımlılığı Yönetmek"
subtitle: "Balancing Coupling in Software Design"
background: "/img/posts/coupling-dengesi-cover.webp"
date: '2026-06-04 09:00:00'
layout: post
lang: tr
mermaid: true
tags: [yazilim-tasarimi, yazilim-muhendisligi]
---

Bir satırlık bir değişiklik yaptınız: bir alanın adını `userId`'den `accountId`'ye çevirdiniz. Derleyici hata vermeye başladı. Bir dosyayı düzelttiniz, üç dosya daha kırmızı yandı. Onları da düzelttiniz; bu kez testler patladı. Yarım saat sonra "küçücük" değişikliğiniz on iki dosyaya, iki servise ve bir veritabanı şemasına dokunmuştu. Tanıdık geldi mi?

Çoğumuz bu acıya bir isim veririz: **coupling** (bağlaşım). Ve hemen ardından bir reçete yazarız: "Demek ki daha az coupling lazım, her şeyi birbirinden ayıralım (*decouple* edelim)." Ekip bu uğurda kodu mikroservislere böler — ve birkaç ay sonra, ağ üzerinden birbirine eskisinden de sıkı bağlı, ama bu kez hata ayıklaması çok daha zor bir sisteme uyanır.

Sorun coupling'in *kötü* olması değil; sorun onu yanlış anlamamız. Vlad Khononov'un 2024 tarihli kitabı **_Balancing Coupling in Software Design_** tam da bunu söylüyor: coupling, yok edilecek bir kusur değil, **dengelenecek bir tasarım niteliğidir**. Bu yazıda önce coupling'in ne olduğunu ve neden ondan tamamen kurtulamayacağımızı göreceğiz; sonra Khononov'un onu ölçmek için sunduğu üç boyutlu modeli inceleyeceğiz; ve son olarak bu fikrin en uca taşındığı yere, aviyonik yazılımın **DO‑178C** standardına bakacağız — orada coupling'i analiz etmek bir tercih değil, bir sertifikasyon şartıdır.

---

## Coupling Nedir? (Ve Neden Ondan Tamamen Kurtulamayız?)

En yalın tanımıyla coupling, iki bileşen arasındaki bağımlılıktır: *birindeki değişikliğin diğerinde de değişiklik gerektirme ihtimali.* İki modül birbirine ne kadar sıkı bağlıysa, birlikte değişme olasılıkları da o kadar yüksektir.

Khononov bu bağımlılığın özünde iki şeyin yattığını söyler: **paylaşılan bilgi** (*shared knowledge*) ve **paylaşılan yaşam döngüsü** (*shared lifecycle*). Bir bileşen, diğeri hakkında ne kadar çok şey "bilmek" zorundaysa — onun veri yapısını, kurallarını, iç işleyişini — o kadar bağlıdır. Ve o bilgi değiştiğinde, ona bağlı her yerin de değişmesi gerekir.

Burada kritik bir nokta var: coupling yalnızca yazılıma özgü değildir. Aynı ilişki bir organizasyonda (bir departmanın kararı diğerini etkiler), bir makinede (bir dişlinin dönüşü diğerini sürer), hatta bir takımda da vardır. Coupling, *birbiriyle etkileşen parçalardan oluşan her sistemin* doğal bir özelliğidir.

Peki neden ondan tamamen kurtulamayız? Çünkü **sıfır coupling'e sahip bir sistem, aslında bir sistem değildir.** Birbiriyle hiç konuşmayan, hiçbir bilgi paylaşmayan bileşenler bir bütün oluşturmaz; yalnızca yan yana duran, birbirinden habersiz parçalar yığını olur. Bir sistemin değeri — uçağın uçması, uygulamanın iş görmesi — tam da parçaların *birlikte* çalışmasından, yani onları birbirine bağlayan ilişkilerden doğar. Daha önce [Sistem Mühendisliği Nedir?]({% post_url 2026-05-26-sistem-muhendisligi-nedir %}) yazısında değindiğimiz **beliren özellikler** (*emergent properties*) işte bu bağlardan ortaya çıkar.

Coupling, sistemi bir arada tutan tutkaldır. Tutkalsız sistem dağılır; ama her yeri tutkala bulanmış sistem de kıpırdayamaz. O yüzden doğru soru "coupling'den nasıl kurtulurum?" değildir. Doğru soru şudur: **Ne tür, ne kadar ve nerede?**

---

## "Decoupling Her Zaman İyidir" Efsanesi

Yazılım kültüründe neredeyse bir slogan vardır: "sıkı bağ değil, gevşek bağ" (*loose coupling*). Bu öğüt iyi niyetlidir ama yarım kalmıştır; çünkü madalyonun iki yüzü vardır.

Bir uçta **aşırı coupling** bulunur: her şeyin her şeye bağlı olduğu, tek bir değişikliğin sistemin yarısını tetiklediği, kimsenin elini sürmeye cesaret edemediği "büyük çamur topu" (*big ball of mud*). Bunu hepimiz biliriz.

Diğer uçta ise daha sinsi bir tehlike vardır: **aşırı decoupling**. Bağımlılıktan kaçmak uğruna araya gereksiz katmanlar, soyutlamalar ve dolaylılıklar (*indirection*) koyarsınız. Tek bir akışı anlamak için yedi dosya ile üç arayüz arasında zıplamak gerekir. En meşhur örneği, gerçekte birbirine sıkı sıkıya bağlı bileşenleri ayrı servislere bölüp aralarına bir de ağ koyan **dağıtık çamur topu** (*distributed big ball of mud*) — yani yanlış kurgulanmış mikroservislerdir. Bağımlılık ortadan kalkmamıştır; yalnızca görünmez olmuş, üstüne bir de ağ gecikmesi ve dağıtık hata ayıklama derdi eklenmiştir.

Khononov bunu **arızi karmaşıklık** (*accidental complexity*) ile açıklar: problemin kendisinden değil, onu çözmek için yaptığımız kötü tasarım tercihlerinden doğan karmaşıklık. Hem aşırı coupling hem de aşırı decoupling arızi karmaşıklık üretir. Demek ki iyi tasarım bir uçta değil, **dengededir**. Geriye tek soru kalıyor: Bu dengeyi nasıl bulacağız? İşte Khononov'un asıl katkısı burada başlıyor.

---

## Coupling'i Ölçmek: Khononov'un Üç Boyutu

Khononov'un en güçlü fikri, coupling'i tek bir "az/çok" ölçeğine sıkıştırmayı bırakıp onu **üç ayrı boyutta** ele almaktır. Bir bağlantının iyi mi kötü mü olduğunu bu üç boyut birlikte belirler:

1. **Entegrasyon gücü** — ne kadar bilgi paylaşılıyor?
2. **Mesafe** — bileşenler birbirine ne kadar uzak?
3. **Oynaklık** — ne sıklıkta değişiyor?

Bunları tek tek görelim.

### 1. Entegrasyon Gücü (Integration Strength)

Entegrasyon gücü, iki bileşenin birbiriyle *ne tür ve ne kadar* bilgi paylaştığını anlatır. Khononov bunu, en güçlüden (en çok bilgi paylaşan, en kırılgan) en zayıfa (en az bilgi paylaşan, en sağlam) doğru dört seviyeye ayırır:

| Seviye | Ne paylaşılır? | Sonuç |
|---|---|---|
| **İçe nüfuz eden** (*intrusive*) | Başka bir bileşenin *iç* detayları: private alanları, veritabanı tabloları, gizli varsayımları | En kırılgan ve en örtük. Karşı taraf habersizce her an değişebilir |
| **Fonksiyonel** (*functional*) | Ortak bir iş kuralı / fonksiyonel gereksinim | Kural değişince bağlı tüm bileşenler birlikte değişmek zorunda |
| **Model** (*model*) | Ortak bir alan (*domain*) modeli | Model evrildikçe onu paylaşan herkes etkilenir |
| **Sözleşme** (*contract*) | Yalnızca açıkça yayımlanmış bir arayüz/sözleşme | En zayıf ve en sağlam. İç detaylar gizlenir; sözleşme sabit kaldıkça taraflar bağımsız değişir |

<div class="mermaid">
flowchart LR
    A["İçe nüfuz eden<br/>intrusive"] --> B["Fonksiyonel<br/>functional"] --> C["Model<br/>model"] --> D["Sözleşme<br/>contract"]
    style A fill:#f6c1c1,stroke:#c0392b,stroke-width:2px
    style B fill:#f6d8c1,stroke:#cb6b2b,stroke-width:2px
    style C fill:#f6edc1,stroke:#b39a2b,stroke-width:2px
    style D fill:#cfe8cf,stroke:#2e7d32,stroke-width:2px
</div>

Soldan sağa gidildikçe paylaşılan bilgi azalır, sağlamlık artar. En tepedeki *içe nüfuz eden* bağlaşım, bir bileşenin başka bir bileşenin kapağını açıp içine elini sokmasıdır — örneğin onun veritabanı tablosunu doğrudan okumak. En alttaki *sözleşme* bağlaşımı ise kapıdaki posta kutusundan konuşmaktır: arkada ne olduğunu bilmezsiniz, yalnızca sözleşmeye güvenirsiniz.

Aradaki farkı küçük bir örnekle görelim:

```python
# KIRILGAN — içe nüfuz eden bağlaşım (intrusive)
# Sipariş modülü, Kullanıcı modülünün VERİTABANI TABLOSUNU doğrudan okuyor.
# "users" tablosunun yapısı değişirse sipariş modülü de kırılır.
def siparis_indirimi(kullanici_id):
    row = db.query("SELECT loyalty_tier FROM users WHERE id = ?", kullanici_id)
    return 0.20 if row.loyalty_tier == "GOLD" else 0.0
```

```python
# SAĞLAM — sözleşme bağlaşımı (contract)
# Sipariş modülü, Kullanıcı modülünün YAYIMLADIĞI arayüzü çağırıyor.
# Kullanıcı modülü içeride ne yaparsa yapsın, sözleşme sabit kaldıkça sağlam kalır.
def siparis_indirimi(kullanici_id):
    seviye = kullanici_servisi.sadakat_seviyesi(kullanici_id)   # sözleşme
    return INDIRIM_TABLOSU[seviye]
```

İki kod da aynı işi yapıyor. Ama ilki, Kullanıcı modülünün veritabanı şemasına *gizlice* bağımlı; ikincisi yalnızca yayımlanmış bir sözleşmeye. Birincisinde `users` tablosuna eklenen masum bir değişiklik sipariş modülünü çökertebilir; ikincisinde Kullanıcı modülü içini baştan yazsa bile, `sadakat_seviyesi` sözleşmesi durduğu sürece sipariş modülü habersizdir.

Bu dört seviyelik fikir gökten zembille inmedi. Khononov burada, yazılım tasarımının köklerindeki iki klasik fikri — Larry Constantine'in 1970'lerdeki coupling türlerini ve Meilir Page‑Jones'un connascence kavramını — tek bir ölçekte birleştirir. (Birazdan bu soy ağacına döneceğiz.)

### 2. Mesafe (Distance)

İkinci boyut, coupling'in *mekânsal* ölçüsüdür: birbirine bağlı iki bileşen fiziksel ve örgütsel olarak ne kadar uzakta? Yakından uzağa doğru bir yelpaze düşünün:

> aynı metot içi → aynı sınıf → aynı modül → aynı namespace → ayrı servis → ayrı sistem → ayrı ekip/şirket

Mesafe neden önemli? Çünkü zincirleme bir değişiklik gerektiğinde, **o değişikliği hayata geçirmenin maliyeti mesafeyle birlikte artar.** Aynı sınıftaki iki metodu birlikte değiştirmek dakikalar sürer. Ama iki bağımlı bileşen, ayrı ekiplerin sahip olduğu ayrı servislerdeyse, aynı değişiklik artık toplantılar, sürüm planları, API versiyonlama ve ekipler arası koordinasyon demektir. Khononov buna **sahiplik mesafesi** (*ownership distance*) der: bilgi ne kadar uzun yol kat ederse, onu değiştirmenin koordinasyon yükü o kadar büyür.

### 3. Oynaklık (Volatility)

Üçüncü boyut zamansaldır: bu bileşen ne sıklıkta değişiyor? Çünkü coupling'in bedeli ancak **değişiklik olduğunda** ödenir. Hiç değişmeyen bir bileşene sımsıkı bağlı olmak neredeyse bedavadır — bağ asla "tetiklenmez". Ama sürekli evrilen, oynak bir bileşene aynı sıkılıkta bağlı olmak, her değişiklikte zincirleme acı demektir.

Bir kodun ne kadar oynak olduğunu kestirmek için Khononov, Alan Güdümlü Tasarım'ın (*Domain-Driven Design*) alt‑alan (*subdomain*) sınıflamasından yararlanır: işin kalbindeki, rekabet avantajı yaratan **çekirdek** (*core*) alanlar en sık değişir; **destekleyici** (*supporting*) ve hazır çözülebilen **genel** (*generic*) alanlar daha durağandır. Khononov'un çarpıcı sözüyle: ***oynaklık, modülerliği opsiyonel kılar.*** Kararlı koda sıkıca bağlanmak başlı başına bir sorun değildir; çünkü o bağ pratikte hiç sınanmaz.

---

## Üçünü Birleştirmek: Denge Formülü

Asıl güzellik, bu üç boyut bir araya geldiğinde ortaya çıkar. Khononov tüm kitabın özünü tek bir mantıksal ifadeye sığdırır:

> **denge = (güç XOR mesafe) VEYA DEĞİL(oynaklık)**

Korkutucu görünebilir ama söylediği şey son derece sezgiseldir. `XOR` (özel veya), "ikisinden *yalnızca biri*" demektir. Yani sağlıklı bir tasarımda güç ile mesafe **birbirine zıt** olmalıdır:

| | **Yakın mesafe** | **Uzak mesafe** |
|---|---|---|
| **Güçlü bağ** | ✅ İyi — birlikte değişenleri yan yana tut | ❌ **Küresel karmaşıklık** |
| **Zayıf bağ** | ⚠️ **Yerel karmaşıklık** | ✅ İyi — modüler, bağımsız evrilir |

Köşeleri okuyalım:

- **Güçlü + yakın = iyi.** Çok bilgi paylaşan iki şey aynı yerde durursa, onları birlikte değiştirmek kolaydır. Sıkı bağ burada sorun değil.
- **Zayıf + uzak = iyi.** Az bilgi paylaşan şeyleri ayrı servislere/modüllere dağıtmak modülerliktir; her biri kendi başına yaşar.
- **Güçlü + uzak = felaket.** Çok şey paylaşan ama birbirinden uzak bileşenler **küresel karmaşıklık** üretir; bir bilgi parçası sistemin bir ucundan diğerine yolculuk eder. Buna bir de oynaklık eklenince ortaya o meşhur **dağıtık çamur topu** çıkar.
- **Zayıf + yakın = israf.** Birbiriyle alakasız şeyleri aynı sınıfa tıkıştırmak gereksiz **yerel karmaşıklık** yaratır.

Peki `VEYA DEĞİL(oynaklık)` kısmı? O da şunu söyler: bir bileşen **kararlıysa (oynak değilse)**, yukarıdaki dengesizliğe katlanabilirsiniz — çünkü o bağ zaten hiç sınanmayacaktır. Modülerlik bedava değildir; ödediğiniz "modülerlik vergisini" yalnızca sık değişen yerlerde ödemeye değer.

Bu modeli pratiğe dökmek üç basit sezgisel kurala iner:

- **Çok bilgi paylaşıyorlarsa, yakın tut.** (Güçlü bağı kısa mesafeyle dengele.)
- **Uzaktalarsa, paylaşılan bilgiyi azalt.** (Mikroservis sınırını ancak gerçek bir sözleşmeyle geç.)
- **Kararlıysa, modülerlik zahmetine girme.** (Oynak olmayan yere mühendislik gücü harcama.)

Dikkat edin: bu, "küçük ve dağıtık her zaman daha basittir" diyen popüler mikroservis söylemine doğrudan bir itirazdır. Bileşenleri küçültüp uzaklaştırmak, aralarındaki bilgi paylaşımı (güç) hâlâ yüksekse, sistemi *basitleştirmez*; tam tersine küresel karmaşıklığı artırır.

---

## Kısa Bir Tarih: Constantine'den Connascence'a

Coupling, yazılım mühendisliğinin en eski kavramlarından biridir; Khononov'un modeli de bu birikimin üzerine kuruludur.

- **Larry Constantine (1970'ler).** *Yapısal Tasarım* (*Structured Design*) çalışmasında coupling'i ilk kez sistematik biçimde sınıflandırdı. En güçlüden (en kötü) en zayıfa (en iyi) doğru türleri şöyleydi: *içerik* (*content*), *ortak* (*common*), *dış* (*external*), *kontrol* (*control*), *damga* (*stamp*) ve *veri* (*data*) bağlaşımı. Bu sınıflama on yıllar boyunca — ve birazdan göreceğimiz gibi DO‑178C dâhil — sahada referans oldu.
- **Meilir Page‑Jones (1990'lar).** *Connascence* kavramıyla coupling'i ölçülebilir hâle getirdi. İki bileşen, biri değişince diğeri de değişmek zorundaysa "connascent"tir. Page‑Jones bağı üç eksende değerlendirdi: **güç** (değiştirmek ne kadar zor), **yerellik** (bileşenler ne kadar yakın) ve **derece** (kaç bileşeni etkiliyor) — Khononov'un güç ve mesafe boyutlarının doğrudan atası.
- **David Parnas.** *Bilgi gizleme* (*information hiding*) ilkesiyle modüllerin birbirinden iç kararları değil yalnızca *sözleşmeyi* bilmesi gerektiğini savundu — yani "sözleşme bağlaşımı"nın felsefi temelini attı.

Khononov'un katkısı, bu dağınık mirası tek bir tutarlı çerçevede — entegrasyon gücü, mesafe, oynaklık — toplamasıdır. Ve buradan güvenlik‑kritik dünyaya zarif bir köprü uzanır: DO‑178C'nin coupling diline doğrudan Constantine'in terimleriyle, **veri bağlaşımı** ve **kontrol bağlaşımı** ile gireriz.

---

## Güvenlik‑Kritik Dünyada Coupling: DO‑178C

Şimdiye kadar coupling'i bir tasarım *tercihi* olarak konuştuk: iyi mühendis dengeyi gözetir, kötüsü gözetmez. Peki ya yanlış dengenin bedeli bir insanın canıysa?

Uçak yazılımının geliştirildiği dünyada coupling artık bir üslup meselesi değildir; **kanıtlanması zorunlu bir sertifikasyon şartıdır.** Sivil havacılıkta uçuş yazılımı, RTCA ve EUROCAE'nin ortaklaşa hazırladığı **DO‑178C** standardına (Avrupa'daki adıyla *ED‑12C*) göre geliştirilir ve denetlenir. Bu, daha önce [MISRA C]({% post_url 2026-04-05-misra-c-2025-ile-neler-degisti %}) yazısında değindiğimiz türden emniyet‑kritik bir disiplindir — ama bir adım öteye geçip doğrudan bileşenler *arasındaki* bağları hedef alır.

DO‑178C, Constantine'den miras aldığı iki terimi resmî olarak tanımlar:

> **Veri bağlaşımı (*data coupling*):** Bir bileşenin, münhasıran kendi kontrolünde olmayan veriye bağımlılığı.

> **Kontrol bağlaşımı (*control coupling*):** Bir bileşenin, başka bir bileşenin yürütülmesini (ne zaman, hangi koşulda çalışacağını) etkileme biçimi veya derecesi.

Standart, bu bağların yalnızca *var olduğunu* kabul etmekle yetinmez; doğrulama sürecinin bir **objektifi** olarak (DO‑178C'nin meşhur *Tablo A‑7*'sinde) şunu talep eder: **Gereksinim temelli testlerin, bileşenler arasındaki veri ve kontrol bağımlılıklarını gerçekten *çalıştırdığını* kanıtlayın.** Burada DO‑178C, selefi DO‑178B'den ayrılır: eskiden bağları yalnızca *tanımlamak* yeterken, DO‑178C onların testlerle *uygulandığını* göstermeyi ister.

Bu gereklilik her yazılım için aynı değildir. DO‑178C, olası bir arızanın yol açacağı sonucun ağırlığına göre beş **tasarım güvence seviyesi** (*Design Assurance Level*, DAL) tanımlar:

| DAL | Arıza sonucu | Coupling analizi |
|---|---|---|
| **A** | Felaketle sonuçlanan (uçak kaybı) | Gerekli — *bağımsızlıkla* |
| **B** | Tehlikeli | Gerekli — *bağımsızlıkla* |
| **C** | Büyük | Gerekli |
| **D** | Küçük | Gerekmez |
| **E** | Emniyete etkisiz | Gerekmez |

En kritik A ve B seviyelerinde, coupling analizinin geliştiriciden **bağımsız** bir gözle doğrulanması şarttır. (Daha önce [Fonksiyonel Olmayan Yazılım Gereksinimleri]({% post_url 2022-07-11-fonksiyonel-olmayan-yazilim-gereksinimleri %}) yazısında bir aviyonik projenin DAL A gereksinimlerine kısaca değinmiştik.)

Peki bu analiz tam olarak ne yapar? Burada güzel bir tamamlayıcılık vardır. Klasik **yapısal kapsama** ölçütleri — deyim (*statement*), karar (*decision*) ve modern uçakların A seviyesinde istediği **MC/DC** (*Modified Condition/Decision Coverage*) — bir bileşenin *içindeki* tüm kod yollarının test edildiğini gösterir. Ama bir bileşen tek başına kusursuz olabilir ve yine de başka bir bileşenle *birleştiğinde* patlayabilir. Veri ve kontrol bağlaşım analizi tam bu boşluğu kapatır: bileşenlerin *arasındaki* etkileşimleri hedefler — yani [yazılım sistem mühendisliğinde]({% post_url 2022-04-30-yazilim-sistem-muhendisligi %}) V modelinin sağ kolundaki entegrasyon ve doğrulama adımlarının ta kendisidir.

<div class="mermaid">
flowchart LR
    subgraph A["Bileşen A"]
      AI["iç mantık"]
    end
    subgraph B["Bileşen B"]
      BI["iç mantık"]
    end
    A == "kontrol bağlaşımı: çağrı / dönüş" ==> B
    A -. "veri bağlaşımı: paylaşılan veri" .-> B
    style AI fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style BI fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
</div>

Yapısal kapsama kutuların *içini* test eder; veri ve kontrol bağlaşım analizi ise kutular *arasındaki okları* test eder. Pratikte ölçüm iki ayrı şekilde yapılır: **kontrol bağlaşımı** için çağrı‑çiftleri (*call‑pair*) ve dönüşlerin kapsanması — yani bileşenler arası her çağrının en az bir testte gerçekten yürütülmüş olması; **veri bağlaşımı** için ise "yaz‑oku" (*set‑use* / *define‑use*) çiftlerinin kapsanması — yani bir bileşenin yazdığı her verinin, onu okuyan bileşen tarafından bir testte gerçekten kullanılmış olması.

Bütün bu titizliğin sebebi tek bir kavramdır: **birleşim tehlikesi** (*composition hazard*). Havacılık tarihi, tek tek doğru çalışan bileşenlerin birleştiğinde — beklenmedik bir veri paylaşımı, dokümante edilmemiş bir yan etki ya da yanlış sırada tetiklenen bir çağrı yüzünden — başarısız olabildiğini acı tecrübelerle öğrendi. Hatalar çoğu zaman bileşenlerin *içinde* değil, **aralarındaki arayüzlerde** yaşar. DO‑178C, bu arayüzlerin görünür kılınmasını ve test edilmesini *zorunlu* tutarak riski kökünden hedefler.

---

## İki Dünya, Tek Ders

İlk bakışta bir tasarım kitabıyla bir havacılık standardı uzak akrabalar gibi görünür. Oysa ikisi aynı gerçeğin iki yüzüdür.

Khononov bize bir **akıl yürütme çerçevesi** verir: coupling'i üç boyutta düşün, dengeyi bilinçli kur, nereye ne kadar bağ koyacağına *karar ver*. DO‑178C ise bir **doğrulama disiplini** dayatır: bağları belgele, görünür kıl ve testlerle *çalıştığını kanıtla*. Biri "nasıl tasarlamalı", diğeri "nasıl ispatlamalı" sorusunu yanıtlar.

Ama ikisinin de altında yatan içgörü aynıdır: **risk, bileşenlerin içinde değil, aralarındaki bağlarda ve paylaşılan bilgide yoğunlaşır.** İster Khononov'un entegrasyon gücü merdiveni olsun, ister DO‑178C'nin veri/kontrol bağlaşımı ayrımı — ikisi de aynı şeyi söyler: coupling'i örtük bırakma; onu açık, bilinçli ve mümkünse test edilebilir kıl.

Aradaki tek fark **bahsin büyüklüğüdür**. Bir CRUD uygulamasında yanlış kurulmuş bir bağ, en kötü ihtimalle bir gece yarısı acil yamasıdır. Bir uçuş kontrol bilgisayarında aynı hata, can demektir. Bu yüzden havacılık, iyi mühendisin her yerde *gönüllü* yapması gerekeni *zorunlu* kılar. Disiplin aynıdır; yalnızca hata payı farklıdır.

Khononov'un üç boyutuyla DO‑178C'nin iki bağlaşım türü arasında hoş bir yankı da vardır: kontrol bağlaşımı, "bir bileşen diğerinin *ne zaman* çalışacağını etkiliyor" demektir; veri bağlaşımı ise "bir bileşen diğerinin *neyi gördüğünü* etkiliyor". Paylaşılan kontrol akışı ve paylaşılan veri — coupling dediğimiz şeyin en temel iki biçimi, ister bir mikroservis mimarisinde ister bir uçuş bilgisayarında olsun.

---

## Sonuç

Coupling'i yıllarca yanlış sevdik: ondan kaçmaya, onu yok etmeye çalıştık. Oysa coupling, sistemi sistem yapan şeydir; mesele onu *yok etmek* değil, **dengelemektir**.

Khononov'un bıraktığı pratik miras birkaç cümleye sığar:

- Coupling kaçınılmaz ve gereklidir; hedef sıfır bağ değil, **doğru bağdır**.
- Her bağı üç boyutta tart: **güç** (ne kadar bilgi paylaşılıyor), **mesafe** (ne kadar uzak), **oynaklık** (ne sıklıkta değişiyor).
- Dengeyi kur: *güçlü bağları yakın tut, uzaktakileri sözleşmeyle gevşet, kararlı yerlere modülerlik vergisi ödeme.*
- Ve en önemlisi: coupling'i **örtük bırakma**. Onu görünür, bilinçli ve — bahis büyükse — test edilebilir kıl.

Havacılık bu son ilkeyi bir standarda yazıp imza zorunluluğu getirdi. Geri kalanımız için ise bu, henüz yazılmamış ama her iyi tasarımın içinde yaşayan bir sözleşmedir. İster bir mobil uygulama yazın, ister bir uçuş kontrol sistemi: er ya da geç, sistemin kaderini bileşenlerin tek tek kalitesi değil, **aralarındaki bağların dengesi** belirleyecektir.

---

**Kaynaklar:**

- Vlad Khononov — [*Balancing Coupling in Software Design*](https://www.informit.com/store/balancing-coupling-in-software-design-universal-design-9780137353538) (Addison‑Wesley, 2024).
- [coupling.dev](https://coupling.dev/) — kitabın kavramlarını derleyen tamamlayıcı kaynak.
- Meilir Page‑Jones — *What Every Programmer Should Know About Object-Oriented Design* (1995). Ayrıca [Connascence (Wikipedia)](https://en.wikipedia.org/wiki/Connascence).
- Edward Yourdon, Larry Constantine — *Structured Design* (Prentice Hall, 1979).
- RTCA/EUROCAE — DO‑178C / ED‑12C, *Software Considerations in Airborne Systems and Equipment Certification* (2011). Genel bakış: [DO‑178C (Wikipedia)](https://en.wikipedia.org/wiki/DO-178C).
- Rapita Systems — [Data Coupling & Control Coupling for DO‑178C](https://www.rapitasystems.com/dccc).
- LDRA — [Data Coupling and Control Coupling (DCCC) analysis](https://ldra.com/capabilities/data-couplingcontrol-coupling/).
- FAA — [AC 20‑115D, Airborne Software Development Assurance](https://www.faa.gov/regulations_policies/advisory_circulars/index.cfm/go/document.information/documentID/1032046).

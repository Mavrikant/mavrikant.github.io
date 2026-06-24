---
title: "Antikırılgan: Belirsizlikten ve Kaostan Güç Alan Sistemler"
subtitle: "Antifragile: Building Systems That Gain From Disorder"
background: "/img/posts/2.webp"
date: '2026-06-24 09:00:00'
layout: post
lang: tr
mermaid: true
---

Cuma gecesi, saat 23:14. İki şirkette aynı anda prodüksiyon çöküyor. İlk ekip panikle uyanır: kimsenin tam anlamadığı, kimsenin dokunmaya cesaret edemediği bir sistem. Olay saatlerce sürer, bir günah keçisi bulunur, sessizce kapatılır. İkinci ekip için bu beklenen bir şeydir: sistem zaten kendini parçalara bölmüştür, kesinti yarım saatte kapanır, ertesi gün suçlamasız (*blameless*) bir toplantıda olaydan üç yeni test ve bir alarm doğar. Sistem, o kesintinin **ardından bir öncekinden daha sağlam** hâle gelir.

İki ekip de aynı şoka maruz kaldı; biri zarar gördü, diğeri güçlendi. İşte Nassim Nicholas Taleb'in *Incerto* serisinin (özellikle *The Black Swan* ve *Antifragile*) ekseni bu. Mühendislikte çoğu zaman "dayanıklılık" (*robustness*) peşinde koşar, kırılmayan sistemler isteriz. Ama Taleb der ki dayanıklılığın ötesinde bir şey var; o kadar yeni ki adını koymak için kelime icat etmek gerekti. Bu yazıda önce kavramı ve altındaki asimetriyi, sonra onu **yazılıma, proje ekibine, şirkete, ürüne, topluluğa ve sisteme** uygulamayı göreceğiz.

---

## Antikırılganlık Nedir? Üçlü Yelpaze

Taleb'in çıkış noktası basit: "kırılgan"ın (*fragile*) zıttını yanlış biliyoruz. Bir kargo kutusunda **"KIRILIR"** yazar; zıttı çoğu kişiye göre "dayanıklı"dır. Ama dayanıklı kutunun üstünde hiçbir şey yazmaz — onu nasıl savursanız umursamaz. Gerçek zıt, üstünde **"LÜTFEN HIRPALAYIN"** yazan, sarsıldıkça içindekinin *iyileştiği* kutu olurdu. O kelime yoktu; Taleb "antikırılgan" diye koydu.

Buradan üçlü bir yelpaze çıkar. Her şeyi volatiliteye — yani belirsizliğe, strese, rastgeleliğe, şoka — verdiği tepkiye göre üçe ayırabiliriz:

| | Volatiliteye tepkisi | Maskotu | Örnek |
|---|---|---|---|
| **Kırılgan** | Zarar görür, bozulur | Demokles'in Kılıcı | İnce kristal kadeh, aşırı optimize edilmiş tedarik zinciri |
| **Dayanıklı (Robust)** | Kayıtsız kalır, aynı kalır | Anka Kuşu | Granit kaya, yedekli sunucu |
| **Antikırılgan** | Beslenir, güçlenir | Hydra | Bağışıklık sistemi, evrim, kas |

<div class="mermaid">
flowchart LR
    V(["Volatilite / Şok / Stres"]) --> F["KIRILGAN<br/>zarar görür"]
    V --> R["DAYANIKLI<br/>aynı kalır"]
    V --> A["ANTIKIRILGAN<br/>güçlenir"]
    style V fill:#fde0e0,stroke:#c0392b,stroke-width:2px
    style F fill:#f5cccc,stroke:#c0392b,stroke-width:2px
    style R fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style A fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
</div>

En sık yapılan hata, antikırılganlığı dayanıklılıkla karıştırmaktır: dayanıklı sistem şoktan sonra *aynı* kalır, antikırılgan sistem *gelişir*. Kas ağırlık kaldırdıkça güçlenir, kemik baskı altında yoğunlaşır, bağışıklık küçük patojenlere maruz kaldıkça öğrenir — ve hepsini aşırı korumak zayıflatır. Bu yazının pratik dersi burada: **bazı şeyleri şoktan korumak, onlara verebileceğiniz en büyük zarardır.**

## Konveksite: Antikırılganlığın Matematiği

Bir şeyi antikırılgan yapan nedir? Tek kelimeyle: **asimetri**. Antikırılganın volatiliteye karşı kazancı kaybından büyüktür; iyi giderse çok kazanır, kötü giderse az kaybeder. Taleb buna *konveksite* (dışbükeylik) der. Tersini bir cam bardakta görün: onu 1 metreden bir kez bırakmak, 1 santimden yüz kez bırakmaktan beterdir — küçük sarsıntılar zararsızdır, tek büyük düşüş paramparça eder. Kayıp stresle *orantısız* büyür; bu içbükey eğri, kırılganlığın imzasıdır.

<div class="mermaid">
flowchart TB
    K0["KIRILGAN<br/>(içbükey ödeme)"] --> K1["küçük stres:<br/>az kazanç"]
    K0 --> K2["büyük stres:<br/>FELAKET kayıp"]
    A0["ANTIKIRILGAN<br/>(dışbükey ödeme)"] --> A1["küçük stres:<br/>az kayıp"]
    A0 --> A2["büyük stres:<br/>BÜYÜK kazanç"]
    style K0 fill:#f5cccc,stroke:#c0392b,stroke-width:2px
    style K2 fill:#f5cccc,stroke:#c0392b,stroke-width:2px
    style A0 fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
    style A2 fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
</div>

Antikırılganda işaret tersine döner. Bir girişimcide başarısız denemenin maliyeti sınırlıdır (biraz zaman ve sermaye), ama tutanın kazancı açık uçludur — aşağı yön kapalı, yukarı yön sonsuz. Bu yüzden Taleb tahmine değil konumlanmaya bakar: geleceği bilemezsiniz ama maruziyetinizi (*exposure*) dışbükey kılabilirsiniz. Onun için volatilite, rastgelelik, stres, hata ve zaman aynı ailedendir — düzensizliğin (*disorder*) yüzleri — ve antikırılgan şeyler hepsinden beslenir.

## Antikırılganlığın Araç Çantası

İyi haber: konveksiteyi inşa edebilirsiniz. Altı alanın hepsinde tekrar eden birkaç pratik şunlar:

- **Barbell (halter) stratejisi:** Ortayı boş bırak; ağırlığı aşırı güvenli tarafa koy, küçük bir payı çok sayıda yüksek-riskli, açık-uçlu bahse dağıt. "Orta risk"ten kaçın.
- **Opsiyonellik:** Yükümlülük değil seçenek biriktir — kötüyse kullanmak zorunda değilsin (aşağı yön sınırlı, yukarı yön açık).
- **Via negativa:** Sağlamlığı ekleyerek değil, kırılganlığı *çıkararak* artır.
- **Hormesis:** Küçük, sık ve iyileşmeye fırsat veren stresörler sistemi büyük şoka hazırlar; aşırı koruma değil kontrollü maruziyet.
- **Skin in the game:** Karar veren riski de taşısın; yoksa kayıplar sisteme, kazançlar bireye gider ve gizli kırılganlık birikir.
- **Artıklık ve ademimerkeziyet:** Yedek "verimsizlik" gibi görünür ama belirsizliğe karşı bir opsiyondur; dağıtık karar tek kırılma noktasını yok eder.

<div class="mermaid">
flowchart LR
    G["BÜYÜK KISIM<br/>AŞIRI GÜVENLİ<br/>(çekirdek, nakit, kanıtlanmış)"]
    B["KÜÇÜK KISIM<br/>ÇOK SAYIDA<br/>YÜKSEK-RİSKLİ BAHİS"]
    G -.->|ortayı boş bırak| B
    style G fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style B fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
</div>

## Uygulama: Altı Alanda Antikırılganlık

### Yazılıma

Yazılım, fikrin en doğrudan uygulandığı alan — modern mühendislik buna **Chaos Engineering** adını bile koydu. Netflix'in *Chaos Monkey*'i prodüksiyonda rastgele sunucuları *bilerek* öldürür: sistemi her gün küçük arızalara maruz bırakırsan, büyük arıza geldiğinde ona dayanacak şekilde evrilmiş olur. Aynı asimetriyi **error budget**, **feature flag** + **otomatik rollback** (hatanın aşağı yönünü saniyeler içinde kapatır), **fuzzing** ve hatayı suç değil ders sayan **suçlamasız postmortem** (*blameless postmortem*) kurar. Buradaki gizli kırılganlık aşırı optimizasyondur: her şeyi sıkıca bağlayıp son damla verimi sıkan sistem tek beklenmedik girdide çöker — [Coupling'i Dengelemek]({% post_url 2026-06-04-coupling-dengesi %}) yazısındaki gibi mesele bağımlılığı yok etmek değil *dengelemek* ve bir parça çökerken bütünün **zarif biçimde bozulmasına** (*graceful degradation*) izin vermektir.

### Bir Proje Ekibine

Ekip de strese maruz kalan bir sistemdir; antikırılganlığı krizden sonra dağılmasından mı yoksa güçlenmesinden mi belli olur. Temel taşı psikolojik güvenliktir: insanlar hatayı saklamak yerine açıkça söyleyebiliyorsa her hata ortak hafızaya işler; aksi hâlde hatalar gizlenir, birikir ve hep birlikte patlar. Pratikte bu, düşük *bus factor* için **çapraz eğitim**, belirsizliğe pay bırakan **slack**, ucuza denenip ucuza vazgeçilen **küçük deneyler** ve olaylardan ders çıkaran retrospektiflerdir. Bir ekibi her çatışma ve başarısızlıktan korumak, kullanılmayan kas gibi onu zayıflatır.

### Bir Şirkete

Şirket ölçeğinde antikırılganlık çoğu zaman barbell'dir: büyük kısım kanıtlanmış, nakit üreten çekirdekte sağlam dururken küçük bir pay çok sayıda **ucuz, açık-uçlu R&D bahsine** dağılır — çoğu tutmaz ama tutan birkaçı portföyü taşır. Kırılgan şirketin imzaları bellidir: tek müşteriye ya da tedarikçiye bağımlılık, aşırı borç (kaldıraç volatiliteyi büyütür), her şeyi "verimlilik" adına son kemiğine yontmak, kararı tek merkezde toplamak. Antikırılgan şirket ademimerkezidir, opsiyonelliği vardır, durgunlukta rakipleri elenirken pay toplar ve karar verenle riski taşıyan **aynı kişidir** (*skin in the game*).

### Bir Ürüne

Bir ürünün antikırılganlığı, gerçek dünyayla temas ettikçe bozulmaya mı yoksa öğrenmeye mi programlandığıyla ölçülür. *MVP* ve hızlı iterasyon, baştan "doğru" ürünü tahmin etme iddiasından vazgeçip onu piyasa geri bildirimiyle şekillendirmektir — tahmin yerine maruziyet. **A/B testleri** her özelliği küçük, geri alınabilir bir deneye çevirir (kötü varyant ucuza ölür); kademeli dağıtım (*canary*), beta kanalları, *dogfooding* ve kullanıcı hata raporlarını birinci sınıf veri sayan döngüler ürünü sürekli küçük stresörlere maruz bırakır. Antikırılgan ürün, şikâyeti tehdit değil ücretsiz bir test paketi olarak görür.

### Bir Topluluğa

Açık kaynak topluluğu Hydra'nın en saf örneğidir: bir bakımcı ayrılırsa proje **fork** edilebilir, tek kişiye ya da sunucuya bağlı değildir. Katkıcı çeşitliliği fikirleri sürekli sınar — kötüler tartışmada elenir, iyiler hayatta kalır. Bu antikırılganlık çatışmadan beslenir: sert kod incelemeleri, açık anlaşmazlıklar ve kamuya açık eleştiri topluluğun bağışıklık sistemidir. Aşırı merkezîleşmiş, tek kişiye bağlı, eleştiriye kapalı topluluk ise görünüşte uyumlu ama özünde kırılgandır.

### Bir Sisteme

En genel hâliyle, etkileşen parçalardan oluşan her sistemde ilkeler aynıdır. Dağıtık sistemlerde **N+1 artıklık**, **circuit breaker** (devre kesici) ve **bulkhead** (bölme perdesi), bir arızanın zincirleme tüm sistemi götürmesini engeller — su alan bölmesi batarken gemiyi yüzdüren perdeler gibi. Doğa bunun en büyük kanıtı: evrim, sayısız küçük başarısızlık üzerinden türü güçlendiren antikırılgan bir algoritmadır — birey kırılgan, tür antikırılgandır. En sinsi tuzak yine verimlilik takıntısıdır: tek senaryoya kusursuz optimize edilen sistem, o senaryonun dışındaki her şeye kırılgan olur. Bu nitelikler, [Sistem Mühendisliği Nedir?]({% post_url 2026-05-26-sistem-muhendisligi-nedir %}) yazısındaki **beliren özellikler** (*emergent properties*) gibi sistem düzeyinde doğar, tek parçaya indirgenemez.

İşte altı alanın tek bir tabloda özeti:

| Alan | Kırılgan kalıp | Antikırılgan kalıp |
|---|---|---|
| Yazılım | El değmemiş "kutsal" sunucu, manuel dağıtım | Chaos engineering, otomatik rollback, blameless postmortem |
| Proje ekibi | Tek uzmana bağımlılık, hatayı gizleme | Çapraz eğitim, psikolojik güvenlik, küçük deneyler |
| Şirket | Tek müşteri, aşırı borç, merkezî karar | Barbell portföy, opsiyonellik, skin in the game |
| Ürün | Büyük "mükemmel" lansman | MVP, A/B testi, kademeli dağıtım, geri bildirim döngüsü |
| Topluluk | Tek bakımcı, eleştiriye kapalılık | Fork edilebilirlik, çeşitlilik, açık tartışma |
| Sistem | Tek senaryoya aşırı optimizasyon | Artıklık, circuit breaker, ademimerkeziyet |

## Tuzaklar: Her Şey Antikırılgan Olmalı mı?

Bir uyarı şart: "Antikırılgan iyiyse her şeyi prodüksiyonda kırarak öğrenelim" demek tehlikeli bir yanlış okumadır. Bazı şeyler antikırılgan değil, sadece **dayanıklı** olmalıdır — bir uçağın uçuş kontrol yazılımında "chaos monkey" çalıştırmazsınız; aviyonikte **DO‑178C** gibi standartların varlık sebebi, sistemin sahada deneme-yanılmayla değil *uçmadan önce* kanıtlanmış olmasıdır. Hatanın geri döndürülemez olduğu yerde hedef konveksite değil, mutlak güvenilirliktir.

Bunun altında daha derin bir kural var: **antikırılganlık ancak hayatta kalırsan işe yarar.** Bir kez tamamen battığınızda (Taleb'in *ruin*/ergodisite kavramı) sonraki denemelerin beklenen kazancı anlamsızdır. Bu yüzden barbell **önce aşağı yönü** korur: önce sizi oyundan atacak şokları imkânsız kılın, *sonra* gerisini volatiliteden beslenmeye bırakın. Sırayı şaşırmak — koruma olmadan risk almak — antikırılganlık değil, kumardır.

## Sonuç

Antikırılganlık, geleceği daha iyi tahmin etme sanatı değil; **tahmine ihtiyaç duymadan, ne gelirse gelsin kazançlı çıkacak biçimde konumlanma** sanatıdır. Kırılgan olan dünyanın tam beklediği gibi gitmesine bel bağlar, dayanıklı olan sapmalara kayıtsız kalır, antikırılgan olan onları yakıt yapar. O yüzden mühendis, lider ya da kurucu olarak doğru soru "şu şoktan nasıl kaçınırım?" değil — bir sonrakini göremezsiniz — **"şoklardan beslenen şeyleri nasıl kurarım?"**dır. Ve Taleb'in via negativa dersi gereği bu çoğu zaman yeni bir şey eklemekle değil, yıkıma açan gizli kırılganlıkları — tek bağımlılık noktası, aşırı kaldıraç, hatayı cezalandıran kültür, son damlasına dek sıkılmış "verimli" optimizasyon — birer birer **çıkarmakla** başlar.

## Kaynaklar

- Nassim Nicholas Taleb — *Antifragile: Things That Gain from Disorder*, Random House, 2012. (Türkçesi: *Antikırılgan: Belirsizlikten Nasıl Faydalanılır*)
- Nassim Nicholas Taleb — *The Black Swan: The Impact of the Highly Improbable*, Random House, 2007.
- Nassim Nicholas Taleb — *Skin in the Game: Hidden Asymmetries in Daily Life*, Random House, 2018.
- Nassim Nicholas Taleb — *Fooled by Randomness*, Texere, 2001.
- Principles of Chaos Engineering — <https://principlesofchaos.org/>
- A. Basiri vd. — "Chaos Engineering", *IEEE Software*, 2016 (Netflix Chaos Monkey / Simian Army).
- B. Beyer, C. Jones, J. Petoff, N. R. Murphy (ed.) — *Site Reliability Engineering*, O'Reilly, 2016 (error budget, blameless postmortem).
- [Coupling'i Dengelemek: Yazılım Tasarımında Bağımlılığı Yönetmek]({% post_url 2026-06-04-coupling-dengesi %})
- [Sistem Mühendisliği Nedir?]({% post_url 2026-05-26-sistem-muhendisligi-nedir %})

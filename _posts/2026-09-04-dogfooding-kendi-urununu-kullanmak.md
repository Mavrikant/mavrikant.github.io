---
title: "Dogfooding: Kendi Ürününü Kullanmak"
subtitle: "Eating Your Own Dog Food"
background: "/img/posts/dogfooding-cover.webp"
date: '2026-09-04 09:00:00'
layout: post
lang: tr
mermaid: true
categories: [yazilim]
tags: [urun-gelistirme, yazilim-muhendisligi, test]
---

Bir ekip aylarca bir iç araç geliştirir, sürümü çıkarır, eğitim verir. Sonra aynı aracı ilk kez kendi işinde kullanmak zorunda kalır ve ilk yarım saatte hiçbir test planında yazmayan şeylerle karşılaşır. Kurulum, üç sayfalık bir Word dokümanını adım adım takip etmeyi gerektirir. Günde otuz kez yapılan işlem dört tıklama uzaktadır. Hata mesajı sorunu anlatmaz, anlaşılmaz bir hata kodu gösterir.

Bunların çoğu klasik anlamda bir hata sayılmaz ve bir gereksinimi de ihlal etmez; testler yeşildir. Ama araç kullanışsızdır ve bunu ölçen şey çoğu zaman yalnızca kullanan kişinin sabrıdır.

**Dogfooding** genelde "kendi ürününü kullanmak" diye tanımlanır. Asıl fikir bundan geniştir: ürünün başarısını, onu geliştirenlerin de maruz kaldığı gerçek kullanım koşullarında ölçmek. Bu yazının tezi de buna dayanıyor: dogfooding'in değeri hata bulmasından çok, sorunu yaşayan kişiyle sorunu düzeltebilen kişi arasındaki geri bildirim zincirini kısaltmasındadır.

## Terim nereden geliyor

İngilizcesi *eating your own dog food*, yani "kendi köpek mamanı yemek". Kökeni için genelde iki reklam hikâyesi anlatılır: 1970'lerde Alpo reklamlarında Lorne Greene'in mamayı kendi köpeğine verdiğini söylemesi ve Kal Kan'ın başkanının hissedarlar toplantısında bir kutu köpek mamasından yemesi. Ayrıntılar tartışmalı ama fikir aynı: sattığın şeye güveniyorsan önce sen tüketirsin.

Yazılıma girişi daha net. 1988'de Microsoft'ta Paul Maritz, LAN Manager'ın test yöneticisi Brian Valentine'a "Eating our own Dogfood" konu başlıklı bir e-posta yazıp ürünün şirket içinde daha çok kullanılmasını ister. Terim oradan sektöre yayılır; şirket içi kullanıma açılan sürümlere "dogfood build" denmeye başlanır.

Fikrin kendisi daha eski. Linux çekirdeği Linux üzerinde geliştirilir, Git'in kaynak kodu Git'te durur, pek çok derleyici kendi kendini derler. Dogfooding yapılabilen ürünlerde, geliştiricinin ürünü kendi işinde kullanması güçlü bir gerçeklik testidir. Ama her ürün buna uygun değildir; buna aşağıda döneceğiz.

## Asıl mekanizma: geri bildirim zinciri

Kullanıcının yaşadığı bir aksaklık, geliştiriciye genellikle uzun bir zincirin sonunda ulaşır ve her halkada bilgi kaybolur:

<div class="mermaid">
flowchart TB
    subgraph B["Dogfooding ile"]
        direction LR
        G2[Geliştirici] --> S[Sorun] --> G2
    end
    subgraph A["Dogfooding olmadan"]
        direction LR
        K[Kullanıcı] --> D[Destek] --> R[Hata kaydı] --> U[Ürün yönetimi] --> G1[Geliştirici]
    end
</div>

Kullanıcı aksaklığı çoğu zaman bildirmez. Bildirirse kelimelere döker, destek ekibi bunu bir kayda, ürün ekibi kaydı bir maddeye çevirir, madde de önceliklendirme toplantısında sıraya girer. Zincirin sonuna baştaki sinirin soluk bir kopyası ulaşır. Aksaklığı geliştiricinin kendisi yaşadığında bu çevirilerin hiçbiri gerekmez; sorun, onu çözebilecek kişinin zihninde ilk elden oluşur.

Yemek siparişi uygulaması geliştiren bir ekip, öğle yemeğini her gün kendi uygulamasından söylüyorsa, adresin her seferinde yeniden girilmesi ya da dünkü siparişi tek dokunuşla tekrarlamanın bir yolu olmaması en geç ikinci gün can sıkar ve düzeltilir. Aynı eksikliği yaşayan müşteri ise çoğu zaman şikâyet etmez; bir sonraki siparişini rakip uygulamadan verir. Ekip kendi ürününü kullanmasaydı bu kaybı büyük ihtimalle aylar sonra, düşen sipariş sayılarında görecekti.

Zincir kısalınca örtük varsayımlar da erken ortaya çıkar: "sipariş tek kişiliktir", "adres tek satıra sığar", "hesap tek kartla ödenir". Bunlar belgelerde değil kafalarda yaşar. Ekip on kişilik öğle yemeğini tek siparişte toplayıp hesabı üç karta bölmeye çalıştığı ilk gün, üçü birden yanlışlanır. Daha önce [Antikırılgan]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %}) yazısında değindiğimiz küçük ve sürekli sarsıntıların değeri de buradan gelir: her biri, ürünün tek seferde sahaya çıkıp toptan sarsılmasından ucuzdur.

## Üç yoğunluk: demo, operasyonel, kritik

"Biz de kullanıyoruz" cümlesi çok farklı şeyler anlatabilir; belirleyici olan, ekibin ürünün aksaklıklarına ne kadar maruz kaldığıdır. Yerleşik bir model olmasa da dogfooding'i pratikte üç farklı yoğunlukta düşünmek faydalı olabilir. Seviyeleri ayıran soru şudur: ürün bozulduğunda ekip ne kaybediyor?

| Seviye | Kullanım | Ürün bozulunca ekip ne kaybeder? |
|---|---|---|
| **Demo** | Ürünü kontrollü bir ortamda denemek | Pek bir şey kaybetmez |
| **Operasyonel** | Ürünü günlük işin içinde kullanmak | Zaman ve sabır |
| **Kritik** | Ürün iş akışının doğal ve vazgeçilmez bir parçası | İşin kendisini |

Slack bu üç seviyeyi görmek için iyi bir örnek. Slack, Tiny Speck adlı şirketin Glitch adlı çevrim içi oyunu geliştirirken kendi iletişimi için yazdığı bir iç araç olarak doğdu; oyun kapandığında geriye kalan asıl ürün oydu. Bir mesajlaşma aracı üzerinden bakınca seviyeler şöyle ayrışır.

**Demo** seviyesinde ürüne ayrılmış bir saatte, hazırlanmış bir ortamda bakılır. Birkaç mesaj gönderilir, bir dosya paylaşılır. Ekip ürüne kısa süre ve kendi seçtiği koşullarda maruz kalır. Bu kullanım biçimi bariz hataları yakalayabilir, ama gerçek kullanımın yarattığı maliyetleri ve sürtünmeleri ortaya çıkarmakta sınırlı kalır.

**Operasyonel** seviyede araç günlük işin içine girer. Ekip bütün yazışmasını bu araçtan yapmaya başladığında başka türden sorunlar çıkar: yüzlerce mesajın arasında arama yetersiz kalır, bildirimler ya fazla ya eksiktir, telefondan okunan mesaj bilgisayarda hâlâ okunmamış görünür. Bunları çoğu zaman ancak gün boyu aracın içinde yaşayan biri fark eder.

**Kritik** seviyede araç ekibin iş akışının tam ortasındadır: bozulursa iş durur. Mesajlaşma aracı çöktüğünde ekip birbirine ulaşamıyorsa, kesintiyi ilk ve en ağır hisseden de onu yapan ekip olur. Güvenilirlik burada müşteriye verilen bir söz olmaktan çıkıp ekibin kendi derdine dönüşür. Bir uyarı gerekiyor: bu seviye, bir aracı sırf dogfooding için yapay olarak kritik bağımlılık hâline getirmek demek değildir. Geri bildirimin gücü, ürün iş akışının doğal bir parçası olduğunda artar. Henüz olgunlaşmamış bir aracı bilerek ekibin kritik yoluna koymak, riski ekibin kendisine taşır.

## Dogfooding sizi nerede yanıltır

Tanımdaki kilit ifade "gerçek kullanım koşulları". Dogfooding'in yanılttığı yerler, ekibin koşullarının kullanıcınınkinden ayrıldığı yerlerdir ve bu ayrım çoğu zaman fark edilmez.

En önemlisi bir paradokstur: **ürünü en iyi bilen kişi, ürünün kullanılabilirlik sorunlarını görmekte en çok zorlanan kişidir.** Geliştirici ürünün nasıl çalıştığını bilir, sınırlarını bilir, hata mesajlarını yorumlayabilir, geçici çözümleri ezbere bilir ve kendi yazdığı şeye karşı sabırlıdır. Yeni bir kullanıcıyı durduran şeylerin çoğu onu durdurmaz. Dogfooding bu yüzden gerçek kullanıcı simülasyonu değildir.

Ortam da farklıdır. Yemek uygulamasını geliştiren ekip onu son model telefonlarla, hızlı ofis internetinde kullanır. Müşteri ise aynı uygulamayı üç yıllık bir telefonda, metroda, çekmeyen bir bağlantıyla açar. Ekibin her gün kullandığı uygulama, müşterinin kullandığı uygulama değildir.

Geçici çözümler de zamanla görünmez olur. "Takılırsa kapatıp aç", "önce çıkış yap, sonra tekrar gir" türünden alışkanlıklar birikir. Ekip bunları o kadar kanıksar ki şikâyet etmeyi bırakır; ta ki yeni katılan biri ilk gününde aynı sorunlara takılıp neden kimsenin bunları düzeltmediğini sorana kadar.

Son olarak ekip, kullanıcı kitlesinin dar ve atipik bir örneklemidir. Otuzlu yaşlardaki mühendislerden oluşan bir ekip, bir bankacılık uygulamasını yetmiş yaşındaki bir kullanıcının gözüyle göremez: yazılar küçük gelir, "IBAN" gibi terimler açıklama ister, yanlış bir işlemi onaylama korkusu her adımı yavaşlatır.

## Dogfooding bir doğrulama yöntemi değildir

Bütün bunlar dogfooding'in neyi sağladığını ve neyi sağlamadığını ayırmayı gerektirir. Dogfooding değerli bir geri bildirim kaynağıdır, ama kalite güvencenin ya da doğrulamanın yerini tutmaz:

| | Dogfooding | Doğrulama ve kalite güvence |
|---|---|---|
| Dayandığı şey | Gerçek kullanım | Planlı ve sistematik test |
| Ürettiği | Geri bildirim | Kanıt |
| Odak | Kullanılabilirlik, iş akışı | Gereksinimlere uygunluk |
| Güçlü yanı | Hızlı geri bildirim, örtük varsayımları açığa çıkarma | Bağımsızlık ve kapsam |
| Ölçütü | Ekibin sabrı ve deneyimi | Tanımlı kabul kriterleri |

Dogfooding gerçek kullanım geri bildirimi, kullanılabilirlik ve iş akışı sorunları, örtük varsayımların açığa çıkması ve geri bildirim gecikmesinin azalması sağlar. Buna karşılık gereksinimlerin tamamının doğrulandığını, ürüne bağımsız bir gözün baktığını, temsilî bir kullanıcı kitlesinin kapsandığını, emniyet ve güvenlik analizlerinin yapıldığını ya da sertifikasyon gereklerinin karşılandığını garanti etmez. Kullanıcı testleri, saha verisi ve bağımsız doğrulama bu açıkları kapatmak için vardır; dogfooding onları tamamlar.

## Ürünü kullanamadığınızda

Bazı ürünleri onu yapan ekip kendi işinde hiçbir zaman kullanamaz. Kalp pili yazılımı, bir uçağın uçuş kontrol yazılımı, endüstriyel bir kontrol sistemi ya da beş yaşındaki çocuklar için yapılmış bir eğitim oyunu bunun örnekleridir. Bu durumda amaç aynı kalır, ekibi gerçek kullanım koşullarına olabildiğince yaklaştırmak; yalnızca yollar değişir.

Bunlardan biri vekil ortamlardır: gerçeğe yakın test düzenekleri ve [Renode ile Zynq7000 Simülasyonu]({% post_url 2026-05-14-renode-ile-zynq7000-simulasyonu %}) yazısında anlattığımız gibi benzetim ortamları. Ürünü bu ortamlarda günlerce çalışır hâlde tutmak, onu bir kez açıp ekran akışına bakmaktan çok daha fazlasını gösterir.

Bir diğeri, ekibi kullanıcının yanına götürmektir. Hastane yazılımı yapan bir ekibin bir gününü serviste hemşirelerin yanında geçirmesi, aylarca toplanan geri bildirimden daha çok şey öğretebilir. Bu tam olarak dogfooding değildir, ama aynı zinciri kısaltır.

## Ürünün etrafındaki sistem

Ürünün kendisi kullanılamasa bile, onu üreten mühendislik sistemi her gün kullanılır. Dogfooding'in en ucuz ve çoğu zaman en verimli uygulandığı yer de burasıdır. Fikir yalnızca ürünler için değil, araçlar, süreçler ve belgeler için de geçerlidir:

- **Araç:** Bir test çatısı yazdıysanız, kendi testlerinizi onunla koşun. Bir izlenebilirlik aracı yaptıysanız, kendi projenizin izlenebilirliğini onunla üretin.
- **Süreç:** Bir kod gözden geçirme süreci tanımladıysanız, kendi değişikliklerinizi ilk o süreçten geçirin. Sürecin ağır geldiği yeri en önce siz hissedersiniz.
- **Standart:** Bir kodlama standardı yazdıysanız, kendi kodunuz o standardı ihlal etmemeli. Kâğıtta makul görünen bir kural, maliyetini onunla yazılan ilk gerçek kodda gösterir. Otomatik araçların denetleyemediği bir kural gözden geçirmelerde bitmeyen tartışmaya, sapma süreci tanımlanmamış bir kural ise sessizce delinen bir kurala dönüşür.
- **Belge:** Bir prosedür yazdıysanız, onu ilk kez prosedürü hiç bilmeyen biri uygulamalı. Girişteki üç sayfalık Word dokümanı bunun tipik örneğidir. Yazarı aracı bir kez kendi eliyle, sıfırdan kurmaya çalışsaydı doküman muhtemelen yarım sayfaya inerdi.

## Sonuç

Dogfooding bir kalite güvence yöntemi değil, bir geri bildirim düzenidir. Kullanıcıyı temsil etmez ve bağımsız doğrulamanın yerine geçmez. Ama ürünü yapanları, ürünün aksaklıklarını kendi işlerinde yaşamaya zorlayarak geri bildirim zincirini kısaltır ve raporların çoğu zaman yakalayamadığı küçük sürtünmeleri görünür kılar. En büyük değeri de çoğu zaman ürünün kendisinde değil, onu üreten araçlarda, süreçlerde ve belgelerde ortaya çıkar.

Bütün bu sınırlara rağmen tek bir soru hep geçerliliğini korur. Kendi yazdığınız aracı kullanmak istemiyorsanız, bu da başlı başına bir bulgudur.

## Kaynaklar

- Warren Harrison, ["From the Editor: Eating Your Own Dog Food"](https://doi.org/10.1109/MS.2006.72), *IEEE Software*, Cilt 23, Sayı 3, s. 5–7, 2006. Alpo ve Kal Kan hikâyeleri.
- *Inside Out: Microsoft—In Our Own Words*, Warner Books, 2000. Paul Maritz'in 1988 tarihli "Eating our own Dogfood" e-postası.
- [Slack (Wikipedia)](https://en.wikipedia.org/wiki/Slack_(software)): Slack'in Tiny Speck'te iç araç olarak doğuşu.
- Jakob Nielsen, [Why You Only Need to Test with 5 Users](https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/), Nielsen Norman Group, 2000. Temsilî kullanıcılarla yapılan kullanılabilirlik testi üzerine.
- [Antikırılgan: Belirsizlikten ve Kaostan Güç Alan Sistemler]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %})
- [Renode ile Zynq7000 Simülasyonu]({% post_url 2026-05-14-renode-ile-zynq7000-simulasyonu %})

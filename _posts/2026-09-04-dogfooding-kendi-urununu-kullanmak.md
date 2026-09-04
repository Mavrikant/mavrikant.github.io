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

Ekibin aylardır geliştirdiği iç aracı ilk kez kendi işinizde kullanmak zorunda kaldığınız günü düşünün. İlk beş dakikada, hiçbir test planında yer almayan şeylerle karşılaşırsınız: kurulum üç sayfalık bir wiki sayfası gerektirir, en sık yapılan işlem dört tıklama uzaktadır, hata mesajı sorunu değil sadece yığın izini söyler, ve gün içinde onlarca kez baktığınız ekran her açılışta en baştan yüklenir. Bunların hiçbiri "hata" değildir. Hiçbiri bir gereksinime aykırı değildir. Testler yeşildir. Yine de araç, kullanılabilir olmaktan uzaktır.

Bu boşluğun adı var: ürünü yapanlarla ürünü kullananlar arasındaki mesafe. **Dogfooding**, bu mesafeyi kapatmanın en ucuz ve en acımasız yoludur — ekibin, ürettiği ürünü kendi gerçek işinde kullanması. Aşağıda önce terimin nereden geldiğine, sonra mekanizmasının neden işlediğine, ardından pratikte hangi seviyelerde uygulandığına ve nerede yanılttığına bakacağız.

## Terimin Kökeni: Köpek Mamasından Yazılıma

Deyimin İngilizcesi *eating your own dog food*, yani "kendi köpek mamanı yemek". Kökeni için genellikle iki reklamcılık hikâyesi anlatılır: 1970'lerde Alpo marka köpek maması reklamlarında oyuncu Lorne Greene'in mamayı kendi köpeğine yedirdiğini söylemesi ve Kal Kan'ın başkanının hissedarlar toplantısında sahneye çıkıp bir kutu köpek mamasından yemesi. Hikâyelerin ayrıntıları tartışmalıdır ama vurgu ortaktır: sattığın şeye gerçekten güveniyorsan, önce sen tüket.

Yazılıma girişi daha nettir. 1988'de Microsoft'ta Paul Maritz, LAN Manager'ın test yöneticisi Brian Valentine'a "Eating our own Dogfood" başlıklı bir e-posta gönderip ürünün şirket içi kullanımının artırılmasını ister. Terim önce Microsoft kültürüne, oradan da bütün sektöre yayılır; şirket içinde günlük kullanıma açılan sürümler "dogfood build" adını alır. Kulağa hoş gelmediği için zamanla nazik türevleri de üretilmiştir — *drinking your own champagne*, *eating your own ice cream* — ama tutan, ilk ve en itici olanı oldu. Türkçede yerleşmiş bir karşılığı yok; "kendi ürününü kullanmak" en yalın çevirisi.

Fikrin kendisi ise 1988'den çok eskidir. Bir derleyicinin kendi kendini derleyebilmesi (*self-hosting*), bir işletim sistemi ekibinin geliştirmeyi o işletim sistemi üzerinde yapması, bir sürüm kontrol sisteminin kendi kaynak kodunu kendinde tutması — hepsi aynı fikrin farklı biçimleridir. Araç, kendi üzerinde kullanılabilecek kadar iyi değilse, başkası için de değildir.

## Neden İşe Yarar: Geri Bildirim Döngüsünü Kısaltmak

Dogfooding'in gücü niyette değil, mekanikte. Yaptığı tek şey, sorunu yaşayan kişi ile sorunu düzeltebilen kişi arasındaki mesafeyi sıfıra indirmektir.

Normalde bu mesafe uzundur ve her adımında bilgi kaybolur. Kullanıcı bir aksaklık yaşar, çoğu zaman bildirmez; bildirdiğinde yaşadığını kelimelere çevirir; destek ekibi bunu bir kayda çevirir; ürün ekibi kaydı bir maddeye çevirir; madde bir önceliklendirme toplantısında sıraya girer. Zincirin sonuna varan şey, başlangıçtaki sürtünmenin soluk bir kopyasıdır. Geliştirici aynı sürtünmeyi kendi yaşadığında ise çeviri adımlarının tamamı ortadan kalkar; sorun, çözebilecek kişinin zihninde ilk elden ve tam şiddetiyle oluşur.

Bunun ikinci bir etkisi önceliklendirmedir. Yazılı gereksinimler ürünün *ne yaptığını* tanımlar, ne kadar can sıktığını değil. Bir işlemin dört tıklama sürmesi hiçbir gereksinimi ihlal etmez; ama o işlemi günde otuz kez yapan bir ekipte, düzeltme listesinin üstüne kendiliğinden çıkar. Dogfooding, ölçülmesi zor olan **sürtünmeyi** ölçülebilir bir sinyale çevirir: ekibin kendi sabrı.

Üçüncüsü de örtük varsayımların ölmesidir. "Kullanıcı zaten yapılandırma dosyasını bilir", "veri her zaman temiz gelir", "bu ekrana ayda bir bakılır" türü varsayımlar belgelerde değil, kafalarda yaşar. Gerçek kullanım bunları sessizce yanlışlar. Daha önce [Antikırılgan]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %}) yazısında değindiğimiz kontrollü strese maruz kalma fikri tam olarak budur: ürünü küçük ve sürekli sarsıntılara açarak, tek büyük sahaya çıkış şokuna hazırlamak.

## Dogfooding'in Üç Seviyesi

Uygulamada "biz de kullanıyoruz" cümlesi çok farklı şeyler anlatabilir. Aradaki farkı, ürün bozulduğunda ekibin ne kaybettiği belirler.

<div class="mermaid">
flowchart LR
    S1["SEVİYE 1<br/>Denemek<br/><i>ayrılmış saat, demo ortam</i>"] --> S2["SEVİYE 2<br/>Günlük akışa almak<br/><i>gerçek veri, gerçek iş</i>"]
    S2 --> S3["SEVİYE 3<br/>Kritik yola koymak<br/><i>bozulursa ekip durur</i>"]
    style S1 fill:#fde0e0,stroke:#c0392b,stroke-width:2px
    style S2 fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style S3 fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
</div>

**Birinci seviye**, takvimde ayrılmış bir saatte, hazırlanmış bir ortamda ürüne bakmaktır. Ekran akışındaki tutarsızlıkları ve bariz hataları yakalar; ama kullanım gönüllü ve kısa olduğu için sabır sınırı hiç zorlanmaz. Bu bir gösteriden ibarettir ve çoğu "dogfooding yapıyoruz" iddiası buradadır.

**İkinci seviye**, ürünü gerçek işin bir parçası hâline getirmektir: kendi verinizle, kendi teslim tarihinizin baskısı altında. Performans sorunları, birikmiş veriyle bozulan davranışlar ve tekrar eden küçük sürtünmeler bu seviyede görünür olur.

**Üçüncü seviye**, ürünü ekibin kritik yoluna koymaktır — bozulduğunda ekibin kendi işi durur. Asıl dogfooding budur, çünkü kesinti maliyetini ilk ödeyen ekibin kendisidir. Bir derleyici ekibinin kendi derleyicisiyle derlemesi, bir sürüm kontrol ekibinin kendi sistemini kullanması bu seviyededir.

| Seviye | Ne yakalar | Ne kaçırır |
|---|---|---|
| **1 — Denemek** | Bariz hatalar, arayüz tutarsızlıkları | Sürtünme, ölçek, dayanıklılık |
| **2 — Günlük akış** | Performans, birikmiş veri, tekrar eden can sıkıntısı | Nadir arıza senaryoları, kesinti maliyeti |
| **3 — Kritik yol** | Güvenilirlik, kurtarma, gerçek operasyon maliyeti | Yeni kullanıcı deneyimi, farklı kullanım biçimleri |

Dikkat çeken şey, en sağdaki sütunun hiçbir zaman boşalmamasıdır. Seviye yükseldikçe yakalanan sorunlar derinleşir, ama kaçırılanlar yok olmaz — sadece yer değiştirir.

## Tuzaklar: Geliştirici Kullanıcı Değildir

Dogfooding'in en büyük riski, verdiği güvenin gerçekte kapsadığından geniş olmasıdır.

**Geliştirici uzman kullanıcıdır.** Ürünün zihinsel modeli zaten kafasındadır; hangi menünün nerede olduğunu, bir hatanın ne anlama geldiğini bilir. İlk kurulum acısını hiç yaşamaz, çünkü ortamı çoktan kuruludur. Bu yüzden dogfooding, kullanılabilirlik sorunları arasında en pahalı olanını — **yeni kullanıcının ilk saatini** — sistematik olarak ıskalar.

**Ortam yanlıdır.** Ekip genellikle hızlı makinelerde, iç ağda, en güncel sürümle ve doğrudan geliştiriciye ulaşabilir hâlde çalışır. Yavaş bağlantı, eski donanım, kısıtlı yetki ve "kimseye soramama" hâli örneklemin dışında kalır.

**Geçici çözümler görünmez olur.** Ekip aylar içinde ürünün kusurlarının etrafından dolaşmayı öğrenir. Bir süre sonra bu dolambaçlar bilinçli birer geçici çözüm olmaktan çıkıp sıradan alışkanlığa dönüşür ve şikâyet üretmez. Dogfooding'in en sinsi başarısızlığı budur: ekip ürünü kullanıyordur, ama artık kusurları görmemektedir.

**Kullanıcı araştırmasının yerini tutmaz.** Ekip, kullanıcı kitlesinin çoğu zaman dar ve atipik bir örneklemidir. Dogfooding, saha verisinin, kullanıcı görüşmelerinin ve kullanım ölçümlerinin tamamlayıcısıdır; ikamesi değil. Bu ikisi karıştırıldığında ortaya, ekibin kendi zevkine göre cilalanmış ama hedef kullanıcının işine yaramayan bir ürün çıkar.

Bir de ürünün doğası gereği kullanılamadığı alanlar vardır. Bir uçuş kontrol yazılımını ya da bir tıbbi cihaz yazılımını geliştirici ekip günlük işinde kullanamaz. Buralarda dogfooding'in karşılığı vekil ortamlardır: donanım test tezgâhları, [Renode ile Zynq7000 Simülasyonu]({% post_url 2026-05-14-renode-ile-zynq7000-simulasyonu %}) yazısındaki gibi simülasyon ortamları, ve ekibin gerçekten günlük olarak kullandığı iç araçlar. Ürünün kendisi dogfood edilemese bile, onu üreten araç zinciri edilebilir — ve pratikte fark çoğu zaman oradan gelir.

---

## Sonuç

Dogfooding, ne bir kalite güvence yöntemi ne de bir pazarlama jestidir; ürünle onu yapan ekip arasındaki geri bildirim döngüsünü kısaltan yapısal bir düzenlemedir. Birkaç cümleye sığdırmak gerekirse:

- Asıl mekanizma, sorunu **yaşayan** ile **çözebilen** arasındaki mesafenin sıfırlanmasıdır.
- "Kullanıyoruz" demek yetmez; ürünün ekibin **kritik yolunda** olup olmadığı sorulmalıdır.
- Yakaladığı şey hatadan çok **sürtünmedir** — ve sürtünme, hiçbir gereksinim belgesinde yazmaz.
- Geliştirici uzman kullanıcıdır: dogfooding, ilk kullanım deneyimini yapısal olarak kaçırır.
- Saha verisinin ve kullanıcı araştırmasının **tamamlayıcısıdır**, yerine geçmez.

Ürününüzü kendi işinizde kullanmak istemiyorsanız, bu başlı başına bir bulgudur. Ve muhtemelen ürününüzle ilgili öğrenebileceğiniz en değerli bulgudur.

## Kaynaklar

- Warren Harrison — "Eating Your Own Dog Food", *IEEE Software*, Cilt 23, Sayı 3, 2006.
- [Eating your own dog food (Wikipedia)](https://en.wikipedia.org/wiki/Eating_your_own_dog_food) — terimin kökeni ve 1988 tarihli Microsoft e-postası.
- Steve Blank — [*The Four Steps to the Epiphany*](https://www.amazon.com/Four-Steps-Epiphany-Steve-Blank/dp/0989200507) (2005). "Binadan dışarı çıkın" ilkesi: iç kullanımın nerede yetersiz kaldığı üzerine.
- Jakob Nielsen — [Why You Only Need to Test with 5 Users](https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/) — dogfooding'in yerini tutamadığı kullanılabilirlik testi üzerine.
- [Antikırılgan: Belirsizlikten ve Kaostan Güç Alan Sistemler]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %})
- [Renode ile Zynq7000 Simülasyonu]({% post_url 2026-05-14-renode-ile-zynq7000-simulasyonu %})

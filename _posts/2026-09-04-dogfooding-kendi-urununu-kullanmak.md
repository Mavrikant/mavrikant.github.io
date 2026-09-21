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

Bir ekip aylarca bir iç araç geliştirir, sürümü çıkarır, eğitim verir. Sonra aynı aracı ilk kez kendi işinde kullanmak zorunda kalır ve ilk yarım saatte hiçbir test planında yazmayan şeylerle karşılaşır. Kurulum, üç sayfalık bir wiki belgesini adım adım takip etmeyi gerektirir. Günde otuz kez yapılan işlem dört tıklama uzaktadır. Hata mesajı sorunu değil yığın izini söyler. Gün boyu açık duran ekran her açılışta en baştan yüklenir.

Bunların hiçbiri hata değildir. Hiçbiri bir gereksinimi ihlal etmez. Testler yeşildir. Ama araç kullanışsızdır ve bu kullanışsızlık hiçbir raporda görünmez, çünkü onu ölçen tek şey kullanan kişinin sabrıdır. **Dogfooding** dediğimiz şey de ekibin bu ölçümü kendi üzerinde yapmasıdır: ürettiğiniz ürünü kendi gerçek işinizde kullanmak.

## Terim nereden geliyor

İngilizcesi *eating your own dog food*, yani "kendi köpek mamanı yemek". Kökeni için genelde iki reklam hikâyesi anlatılır: 1970'lerde Alpo reklamlarında Lorne Greene'in mamayı kendi köpeğine verdiğini söylemesi, bir de Kal Kan'ın başkanının hissedarlar toplantısında sahnede bir kutu köpek mamasından yemesi. Hikâyelerin ayrıntıları tartışmalıdır ama ikisinin de anlattığı şey aynıdır: sattığın şeye gerçekten güveniyorsan önce sen tüketirsin.

Yazılıma nasıl girdiği daha nettir. 1988'de Microsoft'ta Paul Maritz, LAN Manager'ın test yöneticisi Brian Valentine'a "Eating our own Dogfood" konu başlıklı bir e-posta yazıp ürünün şirket içi kullanımının artırılmasını ister. Terim önce Microsoft kültürüne yerleşir, oradan sektöre yayılır; şirket içinde günlük kullanıma açılan sürümlere "dogfood build" denmeye başlanır. Kulağa hoş gelmediği için yıllar içinde kibarlaştırma denemeleri de olmuştur (*drinking your own champagne*, *eating your own ice cream*) ama tutan, ilk ve en itici olanı oldu. Türkçede yerleşmiş bir karşılığı yok.

Fikrin kendisi elbette 1988'den eskidir. Bir derleyicinin kendi kendini derlemesi (*self-hosting*), bir işletim sistemi ekibinin geliştirmeyi o işletim sistemi üzerinde yapması, bir sürüm kontrol sisteminin kendi kaynak kodunu kendinde tutması; hepsi aynı şeyin farklı adlarıdır. Araç kendi üzerinde kullanılacak kadar iyi değilse, başkası için de iyi değildir.

## Neden işe yarıyor

Dogfooding'in yaptığı tek bir şey var: sorunu yaşayan kişiyle sorunu düzeltebilen kişi arasındaki mesafeyi sıfırlamak.

Normalde bu mesafe uzundur ve her adımında bilgi kaybolur. Kullanıcı bir aksaklık yaşar, çoğu zaman hiç bildirmez. Bildirirse yaşadığını kelimelere çevirir, destek ekibi bunu bir kayda çevirir, ürün ekibi kaydı bir maddeye çevirir, madde de bir önceliklendirme toplantısında sıraya girer. Zincirin sonuna varan şey, baştaki sinirin soluk bir kopyasıdır. Geliştirici aynı aksaklığı kendisi yaşadığında bu çeviri adımlarının hepsi ortadan kalkar.

İkinci faydası önceliklendirmede ortaya çıkar. Gereksinim belgeleri ürünün ne yaptığını tanımlar, ne kadar can sıktığını değil. Bir işlemin dört tıklama sürmesi hiçbir gereksinimi ihlal etmez; ama o işlemi günde otuz kez yapan bir ekipte düzeltme listesinin en üstüne kendiliğinden çıkar. Ölçülmesi zor olan sürtünme, böylece ölçülebilir bir sinyale dönüşür.

Bir de örtük varsayımlar vardır. "Kullanıcı yapılandırma dosyasını zaten bilir", "veri temiz gelir", "bu ekrana ayda bir bakılır". Bu cümleler hiçbir belgede yazmaz, kafalarda yaşar; gerçek kullanım da onları sessizce yanlışlar. Daha önce [Antikırılgan]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %}) yazısında değindiğimiz kontrollü strese maruz kalma fikri tam olarak budur: ürünü küçük ve sürekli sarsıntılara açmak, tek büyük sahaya çıkış şokundan ucuzdur.

## "Biz de kullanıyoruz" ne demek

Bu cümle çok farklı şeyler anlatabilir. Aradaki farkı belirleyen soru şudur: ürün bozulduğunda ekip ne kaybediyor?

<div class="mermaid">
flowchart LR
    S1["Denemek<br/>ayrılmış saat, hazırlanmış ortam"] --> S2["Günlük akışa almak<br/>gerçek veri, gerçek iş"]
    S2 --> S3["Kritik yola koymak<br/>bozulursa ekibin işi durur"]
</div>

En zayıf hâli, takvimde ayrılmış bir saatte hazırlanmış bir ortamda ürüne bakmaktır. Ekran akışındaki tutarsızlıkları ve bariz hataları yakalar, ama kullanım gönüllü ve kısa olduğu için kimsenin sabrı zorlanmaz. "Dogfooding yapıyoruz" iddialarının çoğu buradadır ve aslında bir gösteriden ibarettir.

Bir üst basamak, ürünü gerçek işin parçası hâline getirmektir: kendi verinizle, kendi teslim tarihinizin baskısı altında. Performans sorunları, birikmiş veriyle bozulan davranışlar ve tekrar eden küçük sürtünmeler ancak burada görünür olur.

Asıl dogfooding ise ürünü ekibin kritik yoluna koymaktır. Ürün bozulduğunda ekibin kendi işi durur, kesintinin bedelini ilk ödeyen ekiptir. Derleyici ekibinin kendi derleyicisiyle derlemesi, sürüm kontrol ekibinin kendi sistemini kullanması bu basamaktadır. Git'in kaynak kodunun Git'te durması bir tercih değil, güvenilirlik iddiasının kendisidir.

| Basamak | Ne yakalar | Ne kaçırır |
|---|---|---|
| Denemek | Bariz hatalar, arayüz tutarsızlıkları | Sürtünme, ölçek, dayanıklılık |
| Günlük akış | Performans, birikmiş veri, tekrar eden can sıkıntısı | Nadir arıza senaryoları, kesinti maliyeti |
| Kritik yol | Güvenilirlik, kurtarma, gerçek operasyon maliyeti | Yeni kullanıcı deneyimi, farklı kullanım biçimleri |

Basamak yükseldikçe yakalanan sorunlar derinleşir, ama sağdaki sütun hiç boşalmaz.

## Nerede yanıltır

Dogfooding'in asıl riski, verdiği güvenin kapsadığı alandan geniş olmasıdır.

Her şeyden önce geliştirici uzman kullanıcıdır. Ürünün zihinsel modeli kafasındadır; hangi menünün nerede olduğunu, hangi hatanın ne anlama geldiğini bilir. İlk kurulum acısını hiç çekmez, çünkü ortamı çoktan kuruludur. Kullanılabilirlik sorunlarının en pahalısı olan yeni kullanıcının ilk saati, dogfooding'in yapısal olarak göremediği yerdir.

Ortam da yanlıdır. Ekip hızlı makinelerde, iç ağda, en güncel sürümle ve gerektiğinde geliştiriciye iki adım ötede ulaşabileceği bir yerde çalışır. Yavaş bağlantı, eski donanım, kısıtlı yetki ve kimseye soramama hâli örneklemin dışında kalır.

Üçüncüsü daha sinsidir: geçici çözümler zamanla görünmez olur. Ekip aylar içinde ürünün kusurlarının etrafından dolanmayı öğrenir; bir süre sonra bu dolambaçlar bilinçli birer geçici çözüm olmaktan çıkıp sıradan alışkanlığa döner ve şikâyet üretmez. Ekip ürünü kullanmaktadır, ama artık kusurlarını görmemektedir.

Son olarak ekip, kendi kullanıcı kitlesinin dar ve atipik bir örneklemidir. Dogfooding saha verisinin, kullanıcı görüşmelerinin ve kullanım ölçümlerinin tamamlayıcısıdır; yerine geçmez. İkisi karıştırıldığında ortaya, ekibin kendi zevkine göre cilalanmış ama hedef kullanıcının işine yaramayan bir ürün çıkar.

## Ürünü kullanamadığınız işlerde

Bazı ürünlerin doğası gereği dogfooding mümkün değildir. Uçuş kontrol yazılımı yazan ekip onu günlük işinde kullanamaz; kalp pili yazılımı için de durum aynıdır. Bu alanlarda dogfooding'in karşılığı vekil ortamlardır: donanım test tezgâhları, HIL düzenekleri ve [Renode ile Zynq7000 Simülasyonu]({% post_url 2026-05-14-renode-ile-zynq7000-simulasyonu %}) yazısında anlattığımız gibi simülasyon ortamları. Bunlar ürünü kendi işinde kullanmanın yerini tutmaz, ama "ekran akışını bir kez gördüm" ile "sistemi günlerce çalışır hâlde tuttum" arasındaki farkı kapatırlar.

Bir de şu var: ürünün kendisi dogfood edilemese bile onu üreten araç zinciri edilebilir. Derleme betikleri, test koşum araçları, konfigürasyon yönetimi, izlenebilirlik matrisini üreten betik; ekip bunların hepsini zaten her gün kullanmaktadır. Aviyonikte kalitenin pratikte nereden geldiğine bakarsanız, çoğu zaman oradan gelir.

## Sonuç

Dogfooding bir kalite güvence yöntemi değildir. Ürünle onu yapan ekip arasındaki geri bildirim döngüsünü kısaltan yapısal bir düzenlemedir ve yakaladığı şey hatalardan çok sürtünmedir. Sürtünme ise hiçbir gereksinim belgesinde yazmaz.

Sorulması gereken soru "kullanıyor muyuz" değil, "bozulduğunda bizim işimiz duruyor mu" olmalı. Cevap hayırsa ürünü kullanmıyorsunuz, sadece deniyorsunuz. Ve ürününüzü kendi işinizde kullanmak istemiyorsanız, bu da başlı başına bir bulgudur.

## Kaynaklar

- Warren Harrison, "Eating Your Own Dog Food", *IEEE Software*, Cilt 23, Sayı 3, 2006.
- [Eating your own dog food (Wikipedia)](https://en.wikipedia.org/wiki/Eating_your_own_dog_food) — terimin kökeni ve 1988 tarihli Microsoft e-postası.
- Steve Blank, [*The Four Steps to the Epiphany*](https://www.amazon.com/Four-Steps-Epiphany-Steve-Blank/dp/0989200507), 2005.
- Jakob Nielsen, [Why You Only Need to Test with 5 Users](https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/).
- [Antikırılgan: Belirsizlikten ve Kaostan Güç Alan Sistemler]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %})
- [Renode ile Zynq7000 Simülasyonu]({% post_url 2026-05-14-renode-ile-zynq7000-simulasyonu %})

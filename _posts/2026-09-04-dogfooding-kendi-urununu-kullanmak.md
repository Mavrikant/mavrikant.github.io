---
title: "Dogfooding: Kendi Ürününü Kullanmak"
subtitle: "Eating Your Own Dog Food"
background: "/img/posts/dogfooding-cover.webp"
date: '2026-09-04 09:00:00'
layout: post
lang: tr
categories: [yazilim]
tags: [urun-gelistirme, yazilim-muhendisligi, aviyonik, test]
---

Bir ekip aylarca bir iç araç geliştirir, sürümü çıkarır, eğitim verir. Sonra aynı aracı ilk kez kendi işinde kullanmak zorunda kalır ve ilk yarım saatte hiçbir test planında yazmayan şeylerle karşılaşır. Kurulum, üç sayfalık bir wiki belgesini adım adım takip etmeyi gerektirir. Günde otuz kez yapılan işlem dört tıklama uzaktadır. Hata mesajı sorunu değil yığın izini söyler.

Bunların hiçbiri hata değildir, hiçbiri bir gereksinimi ihlal etmez, testler yeşildir. Ama araç kullanışsızdır ve bunu ölçen tek şey kullanan kişinin sabrıdır. **Dogfooding**, ekibin bu ölçümü kendi üzerinde yapmasıdır: ürettiğiniz ürünü kendi gerçek işinizde kullanmak.

## Terim nereden geliyor

İngilizcesi *eating your own dog food*, yani "kendi köpek mamanı yemek". Kökeni için genelde iki reklam hikâyesi anlatılır: 1970'lerde Alpo reklamlarında Lorne Greene'in mamayı kendi köpeğine verdiğini söylemesi ve Kal Kan'ın başkanının hissedarlar toplantısında bir kutu köpek mamasından yemesi. Ayrıntılar tartışmalı ama fikir aynı: sattığın şeye güveniyorsan önce sen tüketirsin.

Yazılıma girişi daha net. 1988'de Microsoft'ta Paul Maritz, LAN Manager'ın test yöneticisi Brian Valentine'a "Eating our own Dogfood" konu başlıklı bir e-posta yazıp ürünün şirket içinde daha çok kullanılmasını ister. Terim oradan sektöre yayılır; şirket içi kullanıma açılan sürümlere "dogfood build" denmeye başlanır. Kibar alternatifler de denenmiştir (*drinking your own champagne*) ama tutan, ilk ve en itici olanı oldu.

Fikrin kendisi daha eski. Kendi kendini derleyen derleyiciler (*self-hosting*), kendi kaynak kodunu kendinde tutan sürüm kontrol sistemleri, geliştirmesi kendi üzerinde yapılan işletim sistemleri aynı ilkeye dayanır: araç kendi üzerinde kullanılacak kadar iyi değilse, başkası için de iyi değildir.

## Neden işe yarıyor

Dogfooding'in yaptığı tek şey, sorunu yaşayan kişiyle sorunu düzeltebilen kişi arasındaki mesafeyi sıfırlamaktır.

Normalde bu mesafe uzundur ve her adımında bilgi kaybolur. Kullanıcı aksaklığı çoğu zaman bildirmez. Bildirirse kelimelere döker, destek ekibi bunu bir kayda, ürün ekibi kaydı bir maddeye çevirir, madde de önceliklendirme toplantısında sıraya girer. Zincirin sonuna baştaki sinirin soluk bir kopyası ulaşır. Aksaklığı geliştiricinin kendisi yaşadığında bu çevirilerin hiçbiri gerekmez.

Aviyonikte bunun en net örneği test otomasyon altyapısıdır. DO-178C'de her yazılım gereksinimi için gereksinim tabanlı testler yazılır; DAL A bir projede bunlar yüzlerle, çoğu zaman binlerle ifade edilir ve her teslimatta yeniden koşulur. Bu testleri koşan altyapıyı yazan ekip, genellikle onu her gün kullanan ekiptir. Tezgâha bağlanmak her test için kırk saniye sürüyorsa bu gecelik koşuda saatlere dönüşür ve ertesi sabah ilk düzeltilen şey olur. Bir test "başarısız" diyor ama hangi adımda, hangi sinyalde başarısız olduğunu söylemiyorsa, raporu okuyan mühendis aynı gün raporlama kodunu açar. İkisi de bir hata kaydına dönüşmeden, aracı kullanan kişi tarafından düzeltilir.

Bir de örtük varsayımlar vardır: "tezgâh hep aynı konfigürasyonda", "log dosyası tek bir koşuya ait", "bu ekrana ayda bir bakılır". Bunlar belgelerde değil kafalarda yaşar ve gerçek kullanım onları sessizce yanlışlar. [Antikırılgan]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %}) yazısında değindiğimiz küçük ve sürekli sarsıntıların değeri de buradan gelir: her biri, tek büyük sahaya çıkış şokundan ucuzdur.

## "Biz de kullanıyoruz" ne demek

Bu cümle çok farklı şeyler anlatabilir. Farkı belirleyen soru şudur: ürün bozulduğunda ekip ne kaybediyor?

En zayıf hâli, ayrılmış bir saatte, hazırlanmış bir ortamda ürüne bakmaktır. Yeni yazılmış bir veri yolu izleme aracının demosunda birkaç ARINC 429 etiketi düzgün çözülür ve herkes memnun ayrılır. Bariz hatalar yakalanır ama kimsenin sabrı zorlanmaz. "Dogfooding yapıyoruz" iddialarının çoğu bu seviyededir.

Bir üst basamak, aracı günlük işin içine almaktır. Aynı izleyici entegrasyon tezgâhında her gün, gerçek trafikle, saatlerce açık kalmaya başladığında başka türden sorunlar çıkar: kayıt dosyası şişer, filtre ayarları her açılışta sıfırlanır, hatalı bir MIL-STD-1553 mesajı geldiğinde ekran donar. Bunları ancak aracın başında mesai harcayan biri fark eder.

En üst basamak, aracı kritik yola koymaktır: araç bozulursa ekibin işi durur. Aviyonikte bunun resmî bir karşılığı da var. Test otomasyon aracının çıktısı sertifikasyon kanıtı olarak kullanılıyor ve ayrıca elle doğrulanmıyorsa, DO-178C o aracın DO-330'a göre nitelendirilmesini ister. Ekibin kendi yazdığı araç, standart gereği gereksinimi, testi ve konfigürasyon yönetimi olan bir ürün gibi ele alınmak zorundadır. Standart burada dogfooding'i bir adım öteye taşır: aracın doğru çalıştığını "her gün kullanıyoruz, sorun yok" diye değil, kanıtla göstermenizi ister.

## Nerede yanıltır

Dogfooding'in asıl riski, verdiği güvenin kapsadığı alandan geniş olmasıdır.

Geliştirici hem uzman kullanıcıdır hem de yanlış ortamdadır. Ürünün zihinsel modeli kafasındadır, ilk kurulum acısını hiç çekmez, hızlı bir makinede ve iç ağda çalışır. Kokpit ekranı yazılımı bunu iyi gösterir. Geliştirici ekranı masasında, ofis ışığında, rahat bir mesafeden görür. Pilot ise aynı ekrana titreşen bir kabinde, eldivenle tuşlara basarak, güneş parlaması altında ya da gece görüş gözlüğüyle bakar. Geliştiricinin her gün kullandığı ekran, pilotun gördüğü ekran değildir.

Geçici çözümler de zamanla görünmez olur. Tezgâhta "önce kartı resetle, sonra koşuyu başlat, ilk sonucu yok say" türünden ritüeller birikir. Ekip bunları o kadar kanıksar ki şikâyet etmeyi bırakır; ta ki yeni katılan bir mühendis ilk haftasını bu ritüelleri öğrenmeye harcayana kadar. Ekip aracı kullanıyordur, ama artık kusurlarını görmüyordur.

Son olarak ekip, kullanıcı kitlesinin dar ve atipik bir örneklemidir. Dogfooding saha verisinin, kullanıcı görüşmelerinin ve kullanım ölçümlerinin tamamlayıcısıdır, yerine geçmez.

## Ürünü kullanamadığınızda

Uçuş yazılımını yazan ekip onu günlük işinde kullanamaz; tıbbi cihaz yazılımı için de durum aynıdır. Bu alanlarda dogfooding'in karşılığı vekil ortamlardır: donanım tezgâhları, HIL düzenekleri ve [Renode ile Zynq7000 Simülasyonu]({% post_url 2026-05-14-renode-ile-zynq7000-simulasyonu %}) yazısında anlattığımız gibi simülasyonlar. Zynq tabanlı bir kartın yazılımını simülatörde günlerce çalışır hâlde tutmak, onu bir kez tezgâhta açıp ekran akışını görmekten çok daha fazlasını gösterir.

Sürü İHA gibi Ar-Ge projeleri ise istisnadır: yer kontrol yazılımını saha denemelerinde çoğu zaman yine onu yazan ekip kullanır. Aradaki fark, ürünün kritik yola ne zaman girdiğidir. Laboratuvarda "idare eder" denen bir arayüz, sahada rüzgâr altında dizüstü bilgisayarın başında beş aracı birden izlerken hemen düzeltilecekler listesine girer.

Asıl dogfooding alanı ise ürünün etrafındaki her şeydir: derleme betikleri, test koşum araçları, veri yolu izleyicileri, izlenebilirlik matrisini üreten betikler. Belgeler de bu kapsama girer. DO-178C'de planlar ve standartlar projenin başında yazılır, sonra tüm ekip onlara uyar. Bu belgeleri yazan biri için dogfooding'in anlamı basittir: yazdığınız kodlama standardına ilk uyan siz olmalısınız. Kâğıtta makul görünen bir kural, örneğin fonksiyon başına tek çıkış noktası, maliyetini onunla yazılan ilk kesme servis rutininde gösterir. Statik analiz aracının denetleyemediği bir kural, gözden geçirme yorumlarında bitmeyen bir tartışmaya dönüşür. Sapma süreci tanımlanmamış bir kural ise sessizce delinir. Standardı yazan onu kendi kodunda uygulamazsa, bunların hepsini ilk kez sertifikasyon denetiminde öğrenir.

## Sonuç

Dogfooding bir kalite güvence yöntemi değil, geri bildirim döngüsünü kısaltan bir düzenlemedir. Aviyonikte ürünün kendisini kullanamayız, ama onu üreten araçları, doğrulayan altyapıyı ve yöneten belgeleri her gün kullanırız. Dogfooding'in bu alandaki asıl yeri orasıdır.

Kendi yazdığınız aracı kullanmak istemiyorsanız, bu da başlı başına bir bulgudur.

## Kaynaklar

- Warren Harrison, "Eating Your Own Dog Food", *IEEE Software*, Cilt 23, Sayı 3, 2006.
- [Eating your own dog food (Wikipedia)](https://en.wikipedia.org/wiki/Eating_your_own_dog_food): terimin kökeni ve 1988 tarihli Microsoft e-postası.
- RTCA DO-178C, *Software Considerations in Airborne Systems and Equipment Certification*, 2011. Bölüm 12.2: araç nitelendirmesi.
- RTCA DO-330, *Software Tool Qualification Considerations*, 2011.
- Jakob Nielsen, [Why You Only Need to Test with 5 Users](https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/).
- [Antikırılgan: Belirsizlikten ve Kaostan Güç Alan Sistemler]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %})
- [Renode ile Zynq7000 Simülasyonu]({% post_url 2026-05-14-renode-ile-zynq7000-simulasyonu %})

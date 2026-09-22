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

Bir ekip aylarca bir iç araç geliştirir, sürümü çıkarır, eğitim verir. Sonra aynı aracı ilk kez kendi işinde kullanmak zorunda kalır ve ilk yarım saatte hiçbir test planında yer almayan şeylerle karşılaşır. Kurulum, üç sayfalık bir Word dokümanını adım adım takip etmeyi gerektirir. Günde otuz kez yapılan işlem dört tıklama uzaktadır. Hata mesajı sorunu anlatmaz, bir hata kodu gösterir.

Bunların çoğu klasik anlamda hata sayılmaz; testler yeşildir. Ama araç kullanışsızdır ve bunu ölçen şey çoğu zaman yalnızca kullanan kişinin sabrıdır.

**Dogfooding** genelde "kendi ürününü kullanmak" diye tanımlanır. Asıl fikir bundan geniştir: ürünün başarısını, onu geliştirenlerin de maruz kaldığı gerçek kullanım koşullarında ölçmek. Bu yazının tezi de buna dayanıyor: dogfooding'in değeri hata bulmasından çok, sorunu yaşayan kişiyle sorunu düzeltebilen kişi arasındaki geri bildirim zincirini kısaltmasındadır.

## Terim nereden geliyor

İngilizcesi *eating your own dog food*, yani "kendi köpek mamanı yemek". Kökeni genelde köpek maması reklamlarına dayandırılır; ayrıntılar tartışmalı ama fikir açık: sattığın şeye güveniyorsan önce sen tüketirsin. Yazılıma girişi daha net: 1988'de Microsoft'ta Paul Maritz, "Eating our own Dogfood" konu başlıklı bir e-postayla LAN Manager'ın şirket içinde daha çok kullanılmasını ister. Terim oradan sektöre yayılır.

Fikrin kendisi terimden eskidir; geliştiriciler kendi geliştirme araçlarını hep kendi işlerinde de kullanmıştır. Dogfooding yapılabilen ürünlerde bu kullanım, güçlü bir gerçeklik testidir. Ama her ürün buna uygun değildir; buna aşağıda döneceğiz.

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

Kullanıcı aksaklığı çoğu zaman bildirmez. Bildirirse kelimelere döker, destek ekibi bunu bir kayda, ürün ekibi kaydı bir maddeye çevirir, madde de sıraya girer. Zincirin sonuna baştaki sinirin soluk bir kopyası ulaşır. Aksaklığı geliştiricinin kendisi yaşadığında bu çevirilerin hiçbiri gerekmez; sorun, onu çözebilecek kişinin zihninde ilk elden oluşur. Zinciri kısaltmanın somut sonucu, geri bildirim gecikmesinin (*feedback latency*) azalmasıdır: sorunun yaşanmasıyla onu düzeltebilecek kişiye ulaşması arasındaki süre günlerden saatlere, hatta dakikalara inebilir.

Yemek siparişi uygulaması geliştiren bir ekip, öğle yemeğini her gün kendi uygulamasından söylüyorsa, adresin her seferinde yeniden girilmesi ya da dünkü siparişi tek dokunuşla tekrarlamanın bir yolu olmaması en geç ikinci gün can sıkar ve düzeltme listesinin başına geçer. Aynı eksikliği yaşayan müşteri ise çoğu zaman şikâyet etmez; bir sonraki siparişini rakip uygulamadan verir ve ekip bunu ancak aylar sonra, düşen sipariş sayılarında fark edebilir.

Zincir kısalınca örtük varsayımlar da erken ortaya çıkar: "sipariş tek kişiliktir", "hesap tek kartla ödenir". Ekip on kişilik öğle yemeğini tek siparişte toplayıp hesabı üç karta bölmeye çalıştığı ilk gün, ikisi birden yanlışlanır. [Antikırılgan]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %}) yazısında değindiğimiz küçük ve sürekli sarsıntıların değeri de buradan gelir: her biri, ürünün sahada toptan sarsılmasından ucuzdur.

## Üç seviye: kontrollü, operasyonel, kritik bağımlılık

"Biz de kullanıyoruz" cümlesi çok farklı şeyler anlatabilir. Yerleşik bir model olmasa da dogfooding'i pratikte üç seviyede düşünmek faydalı olabilir. Seviyeleri ayıran soru şudur: ürün bozulduğunda ekip ne kaybediyor?

| Seviye | Kullanım | Ürün bozulunca ekip ne kaybeder? |
|---|---|---|
| **Kontrollü** | Ürünü hazırlanmış bir ortamda denemek | Pek bir şey kaybetmez |
| **Operasyonel** | Ürünü günlük işin içinde kullanmak | Zaman ve sabır |
| **Kritik bağımlılık** | İşi ürün olmadan yürütememek | İş akışının kendisini |

Ekip içi bir mesajlaşma aracı üzerinden bakınca seviyeler şöyle ayrışır.

**Kontrollü** seviyede ürüne ayrılmış bir saatte, hazırlanmış bir ortamda bakılır: birkaç mesaj gönderilir, bir dosya paylaşılır. Bu, bariz hataları yakalayabilir ama gerçek kullanımın sürtünmelerini ortaya çıkarmakta sınırlı kalır.

**Operasyonel** seviyede ekip bütün yazışmasını bu araçtan yapar ve başka türden sorunlar çıkar: yüzlerce mesajın arasında arama yetersiz kalır, bildirimler ya fazla ya eksiktir, telefondan okunan mesaj bilgisayarda hâlâ okunmamış görünür. Bunları çoğu zaman ancak gün boyu aracın içinde yaşayan biri fark eder.

**Kritik bağımlılık** seviyesinde araç olmadan iş yürümez. Mesajlaşma aracı çöktüğünde ekip birbirine ulaşamıyorsa, kesintiyi ilk ve en ağır hisseden de onu yapan ekip olur. Güvenilirlik burada müşteriye verilen bir söz olmaktan çıkıp ekibin kendi derdine dönüşür.

Bir uyarı gerekiyor: bu seviyeler bir hedef sıralaması değildir. Bağımlılık arttıkça dogfooding daha iyi olmaz; kullanılabilirlik ve iş akışı geri bildiriminin çoğu zaten operasyonel seviyede gelir, kritik bağımlılık buna yalnızca güvenilirlik boyutunu ekler. Geri bildirimin gücü, ürün iş akışının doğal bir parçası olduğunda artar. Henüz olgunlaşmamış bir aracı sırf dogfooding için ekibin kritik yoluna koymak ise riski ekibin kendisine taşır.

## Dogfooding sizi nerede yanıltır

Tanımdaki kilit ifade "gerçek kullanım koşulları". Dogfooding, ekibin koşullarının kullanıcınınkinden ayrıldığı yerlerde yanıltır.

En önemlisi bir paradokstur: **ürünü en iyi bilen kişi, ürünün kullanılabilirlik sorunlarını görmekte en çok zorlanan kişidir.** Geliştirici ürünün nasıl çalıştığını bilir, sınırlarını bilir, hata mesajlarını yorumlayabilir, geçici çözümleri ezbere bilir ve kendi yazdığı şeye karşı sabırlıdır. Yeni bir kullanıcıyı durduran şeylerin çoğu onu durdurmaz. Dogfooding bu yüzden gerçek kullanıcı deneyiminin yerine geçmez.

Ortam da farklıdır. Ekip yemek uygulamasını son model telefonlarla, hızlı ofis internetinde kullanır; müşteri ise aynı uygulamayı eski bir telefonda, çekmeyen bir bağlantıyla açar. Ekibin hiç fark etmediği bir yavaşlık, müşterinin her gün yaşadığı şey olabilir.

Geçici çözümler de zamanla görünmez olur. "Takılırsa kapatıp aç" türünden alışkanlıklar birikir ve ekip şikâyet etmeyi bırakır; ta ki yeni katılan biri ilk gününde aynı sorunlara takılana kadar.

Son olarak ekip, kullanıcı kitlesinin dar bir örneklemidir. Mühendislerden oluşan bir ekip, ürünü farklı yaş, deneyim ve teknoloji alışkanlıklarına sahip kullanıcıların gözünden kolayca göremez. Ekibe doğal gelen bir terim, bir kısayol ya da bir onay adımı, başka bir kullanıcı için ürünün en zor yeri olabilir.

## Dogfooding, sistematik doğrulamanın yerine geçmez

Dogfooding değerli bir geri bildirim kaynağıdır, ama kalite güvencesinin ya da doğrulamanın yerini tutmaz:

| | Dogfooding | Sistematik doğrulama |
|---|---|---|
| Dayandığı şey | Gerçek kullanım | Planlı test, inceleme ve analiz |
| Ürettiği | Geri bildirim | Kanıt |
| Odak | Kullanılabilirlik, iş akışı | Gereksinimlere uygunluk |
| Güçlü yanı | Hızlı geri bildirim, örtük varsayımları açığa çıkarma | Planlı kapsam, tekrarlanabilirlik |
| Ölçütü | Ekibin sabrı ve deneyimi | Tanımlı kabul kriterleri |

Dogfooding gerçek kullanım geri bildirimi üretir, kullanılabilirlik ve iş akışı sorunlarını görünür kılar, örtük varsayımları açığa çıkarır ve geri bildirim gecikmesini azaltır. Buna karşılık gereksinimlerin tamamının doğrulandığını, ürüne bağımsız bir gözün baktığını, temsilî kullanıcıların kapsandığını ya da emniyet, güvenlik veya sertifikasyon açısından gerekli diğer doğrulama faaliyetlerinin yapıldığını garanti etmez. Kullanıcı testleri, saha verisi ve bağımsız doğrulama bu açıkları kapatmak için vardır; dogfooding onları tamamlar.

## Ürünü kullanamadığınızda

Bir uçağın uçuş kontrol yazılımı veya bir kalp pili gibi ürünlerde, ürünü geliştiren ekip onu gerçek operasyonel bağlamında kullanamaz. Bu durumda yapılacak şey, gerçek kullanım koşullarını ekibe olabildiğince yaklaştırmaktır: ürünü gerçeğe yakın test düzeneklerinde ya da [Renode ile Zynq7000 Simülasyonu]({% post_url 2026-05-14-renode-ile-zynq7000-simulasyonu %}) yazısındaki gibi benzetim ortamlarında günlerce çalışır hâlde tutmak veya ekibi bir süreliğine kullanıcının yanında çalıştırmak. Bunlar tam olarak dogfooding değildir, ama aynı zinciri kısaltır.

## Ürünün etrafındaki sistem

Ürünün kendisi kullanılamasa bile, onu üreten mühendislik sistemi her gün kullanılır. Burada dogfooding'i ürün sınırının dışına taşımak mümkün: mühendislik sisteminin kendisi de dogfood edilebilir. Bu sistemin kullanıcısı zaten ekibin kendisi olduğu için, sorun ile onu düzeltecek kişi arasındaki mesafe kısadır. Emniyet açısından kritik sistemler gibi ürünün sahada kullanılamadığı alanlarda dogfooding'in en gerçekçi biçimi de çoğu zaman budur:

- **Araç:** Bir test çatısı yazdıysanız, kendi testlerinizi onunla koşun. Bir izlenebilirlik aracı yaptıysanız, kendi projenizin izlenebilirliğini onunla üretin.
- **Süreç:** Bir kod gözden geçirme süreci tanımladıysanız, kendi değişikliklerinizi ilk o süreçten geçirin. Sürecin ağır geldiği yeri en önce siz hissedersiniz.
- **Standart:** Bir kodlama standardı yazdıysanız, kendi kodunuz o standardı ihlal etmemeli. Kâğıtta makul görünen bir kural, maliyetini onunla yazılan ilk gerçek kodda gösterir.
- **Belge:** Bir prosedür yazdıysanız, onu bir kez de kendiniz, sıfırdan ve yalnızca belgeye bakarak uygulayın; mümkünse bir de onu hiç bilmeyen birine uygulatın. Girişteki üç sayfalık Word dokümanı bunun tipik örneğidir. Yazarı aracı sıfırdan kurmayı kendisi denediğinde, dokümandaki gereksiz adımlar ve eksik açıklamalar daha kolay görünür hâle gelirdi.

## Sonuç

Dogfooding bir kalite güvence yöntemi değil, bir geri bildirim düzenidir. Kullanıcıyı temsil etmez ve bağımsız doğrulamanın yerine geçmez. Ama aksaklıkları ürünü yapanların kendi işine taşıyarak geri bildirim gecikmesini azaltır ve raporların çoğu zaman yakalayamadığı küçük sürtünmeleri görünür kılar. Ürünün kendisi kullanılamadığında bile onu üreten araçlarda, süreçlerde ve belgelerde uygulanabilir.

Bütün bu sınırlara rağmen bir gözlem hep geçerliliğini korur: kendi yazdığınız aracı kullanmak istemiyorsanız, bu da başlı başına bir bulgudur.

## Kaynaklar

- Harrison, W. (2006). [Eating your own dog food](https://doi.org/10.1109/MS.2006.72). *IEEE Software*, 23(3), 5–7. Terimin köpek maması reklamlarına dayanan kökeni.
- *Inside Out: Microsoft—In Our Own Words* (2000). Warner Books. Paul Maritz'in 1988 tarihli "Eating our own Dogfood" e-postası.
- [Antikırılgan: Belirsizlikten ve Kaostan Güç Alan Sistemler]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %})
- [Renode ile Zynq7000 Simülasyonu]({% post_url 2026-05-14-renode-ile-zynq7000-simulasyonu %})

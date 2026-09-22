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

Bir ekip aylarca bir iç araç geliştirir, sürümü çıkarır, eğitim verir. Sonra aynı aracı ilk kez kendi işinde kullanmak zorunda kalır ve ilk yarım saatte hiçbir test planında yazmayan şeylerle karşılaşır. Kurulum, üç sayfalık bir Word dokümanını adım adım takip etmeyi gerektirir. Günde otuz kez yapılan işlem dört tıklama uzaktadır. Hata mesajı sorunu anlatmaz, bir hata kodu gösterir.

Bunların çoğu klasik anlamda hata sayılmaz; testler yeşildir. Ama araç kullanışsızdır ve bunu ölçen şey çoğu zaman yalnızca kullanan kişinin sabrıdır.

**Dogfooding** genelde "kendi ürününü kullanmak" diye tanımlanır. Asıl fikir bundan geniştir: ürünün başarısını, onu geliştirenlerin de maruz kaldığı gerçek kullanım koşullarında ölçmek. Bu yazının tezi de buna dayanıyor: dogfooding'in değeri hata bulmasından çok, sorunu yaşayan kişiyle sorunu düzeltebilen kişi arasındaki geri bildirim zincirini kısaltmasındadır.

## Terim nereden geliyor

İngilizcesi *eating your own dog food*, yani "kendi köpek mamanı yemek". Kökeni genelde köpek maması reklamlarına dayandırılır; ayrıntılar tartışmalı ama fikir açık: sattığın şeye güveniyorsan önce sen tüketirsin. Yazılıma girişi daha net: 1988'de Microsoft'ta Paul Maritz, "Eating our own Dogfood" konu başlıklı bir e-postayla LAN Manager'ın şirket içinde daha çok kullanılmasını ister. Terim oradan sektöre yayılır.

Fikir terimden eskidir. Geliştiricilerin kendi geliştirme araçlarını kendi iş akışlarında kullanması, self-hosting ve bootstrapping gibi pratiklerde de benzer bir geri besleme yaratır. Dogfooding yapılabilen ürünlerde bu, güçlü bir gerçeklik testidir. Ama her ürün buna uygun değildir; buna aşağıda döneceğiz.

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

Kullanıcı aksaklığı çoğu zaman bildirmez. Bildirirse kelimelere döker, destek ekibi bunu bir kayda, ürün ekibi kaydı bir maddeye çevirir, madde de sıraya girer. Zincirin sonuna baştaki sinirin soluk bir kopyası ulaşır. Aksaklığı geliştiricinin kendisi yaşadığında bu çevirilerin hiçbiri gerekmez; sorun, onu çözebilecek kişinin zihninde ilk elden oluşur. Buradaki asıl kazanç yalnızca zinciri kısaltmak değil, geri bildirim gecikmesini (*feedback latency*) azaltmaktır: sorunun yaşanmasıyla düzeltilebilecek kişiye ulaşması arasındaki süre günlerden dakikalara iner.

Yemek siparişi uygulaması geliştiren bir ekip, öğle yemeğini her gün kendi uygulamasından söylüyorsa, adresin her seferinde yeniden girilmesi ya da dünkü siparişi tek dokunuşla tekrarlamanın bir yolu olmaması en geç ikinci gün can sıkar ve düzeltilir. Aynı eksikliği yaşayan müşteri ise çoğu zaman şikâyet etmez; bir sonraki siparişini rakip uygulamadan verir ve ekip bunu aylar sonra, düşen sipariş sayılarında görür.

Zincir kısalınca örtük varsayımlar da erken ortaya çıkar: "sipariş tek kişiliktir", "adres tek satıra sığar", "hesap tek kartla ödenir". Ekip on kişilik öğle yemeğini tek siparişte toplayıp hesabı üç karta bölmeye çalıştığı ilk gün, üçü birden yanlışlanır. [Antikırılgan]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %}) yazısında değindiğimiz küçük ve sürekli sarsıntıların değeri de buradan gelir: her biri, ürünün sahada toptan sarsılmasından ucuzdur.

## Üç seviye: kontrollü, operasyonel, kritik

"Biz de kullanıyoruz" cümlesi çok farklı şeyler anlatabilir. Yerleşik bir model olmasa da dogfooding'i pratikte üç seviyede düşünmek faydalı olabilir. Seviyeleri ayıran soru şudur: ürün bozulduğunda ekip ne kaybediyor?

| Seviye | Kullanım | Ürün bozulunca ekip ne kaybeder? |
|---|---|---|
| **Kontrollü** | Ürünü hazırlanmış bir ortamda denemek | Pek bir şey kaybetmez |
| **Operasyonel** | Ürünü günlük işin içinde kullanmak | Zaman ve sabır |
| **Kritik** | Ekibin işi ürüne bağımlı | İşin kendisini |

Ekip içi bir mesajlaşma aracı üzerinden bakınca seviyeler şöyle ayrışır.

**Kontrollü** seviyede ürüne ayrılmış bir saatte, hazırlanmış bir ortamda bakılır: birkaç mesaj gönderilir, bir dosya paylaşılır. Bu, bariz hataları yakalayabilir ama gerçek kullanımın sürtünmelerini ortaya çıkarmakta sınırlı kalır.

**Operasyonel** seviyede ekip bütün yazışmasını bu araçtan yapar ve başka türden sorunlar çıkar: yüzlerce mesajın arasında arama yetersiz kalır, bildirimler ya fazla ya eksiktir, telefondan okunan mesaj bilgisayarda hâlâ okunmamış görünür. Bunları çoğu zaman ancak gün boyu aracın içinde yaşayan biri fark eder.

**Kritik** seviyede ekibin işi araca bağımlıdır. Mesajlaşma aracı çöktüğünde ekip birbirine ulaşamıyorsa, kesintiyi ilk ve en ağır hisseden de onu yapan ekip olur. Güvenilirlik burada müşteriye verilen bir söz olmaktan çıkıp ekibin kendi derdine dönüşür.

Bir uyarı gerekiyor: bu seviyeler bir hedef sıralaması değildir. Dogfooding'in yoğunluğu, ürünün ekip için ne kadar kritik olduğuyla aynı şey değildir; her gün kullanılan ama bozulduğunda işi durdurmayan bir araç da güçlü geri bildirim üretebilir. Geri bildirimin gücü, ürün iş akışının doğal bir parçası olduğunda artar. Henüz olgunlaşmamış bir aracı sırf dogfooding için ekibin kritik yoluna koymak ise riski ekibin kendisine taşır.

## Dogfooding sizi nerede yanıltır

Tanımdaki kilit ifade "gerçek kullanım koşulları". Dogfooding, ekibin koşullarının kullanıcınınkinden ayrıldığı yerlerde yanıltır.

En önemlisi bir paradokstur: **ürünü en iyi bilen kişi, ürünün kullanılabilirlik sorunlarını görmekte en çok zorlanan kişidir.** Geliştirici ürünün nasıl çalıştığını bilir, sınırlarını bilir, hata mesajlarını yorumlayabilir, geçici çözümleri ezbere bilir ve kendi yazdığı şeye karşı sabırlıdır. Yeni bir kullanıcıyı durduran şeylerin çoğu onu durdurmaz. Dogfooding bu yüzden gerçek kullanıcı deneyiminin yerine geçmez.

Ortam da farklıdır. Ekip yemek uygulamasını son model telefonlarla, hızlı ofis internetinde kullanır; müşteri ise aynı uygulamayı eski bir telefonda, çekmeyen bir bağlantıyla açar.

Geçici çözümler de zamanla görünmez olur. "Takılırsa kapatıp aç" türünden alışkanlıklar birikir ve ekip şikâyet etmeyi bırakır; ta ki yeni katılan biri ilk gününde aynı sorunlara takılana kadar.

Son olarak ekip, kullanıcı kitlesinin dar bir örneklemidir. Mühendislerden oluşan bir ekip, ürünü farklı yaş, deneyim ve teknoloji alışkanlıklarına sahip kullanıcıların gözünden göremez. Ekibe doğal gelen bir terim, bir kısayol ya da bir onay adımı, başka bir kullanıcı için ürünün en zor yeri olabilir.

## Dogfooding, sistematik doğrulamanın yerine geçmez

Dogfooding değerli bir geri bildirim kaynağıdır, ama kalite güvencenin ya da doğrulamanın yerini tutmaz:

| | Dogfooding | Doğrulama ve kalite güvence |
|---|---|---|
| Dayandığı şey | Gerçek kullanım | Planlı ve sistematik test |
| Ürettiği | Geri bildirim | Kanıt |
| Odak | Kullanılabilirlik, iş akışı | Gereksinimlere uygunluk |
| Güçlü yanı | Hızlı geri bildirim, örtük varsayımları açığa çıkarma | Bağımsızlık ve kapsam |
| Ölçütü | Ekibin sabrı ve deneyimi | Tanımlı kabul kriterleri |

Dogfooding gerçek kullanım geri bildirimi üretir, kullanılabilirlik ve iş akışı sorunlarını görünür kılar, örtük varsayımları açığa çıkarır ve geri bildirim gecikmesini azaltır. Buna karşılık gereksinimlerin tamamının doğrulandığını, ürüne bağımsız bir gözün baktığını, temsilî kullanıcıların kapsandığını ya da emniyet ve sertifikasyon gereklerinin karşılandığını garanti etmez. Kullanıcı testleri, saha verisi ve bağımsız doğrulama bu açıkları kapatmak için vardır; dogfooding onları tamamlar.

## Ürünü kullanamadığınızda

Bir uçağın uçuş kontrol yazılımı veya bir kalp pili gibi ürünlerde, ürünü geliştiren ekip onu gerçek operasyonel bağlamında kullanamaz. Bu durumda amaç aynı kalır, ekibi gerçek kullanım koşullarına olabildiğince yaklaştırmak; yalnızca yollar değişir.

Bunlardan biri vekil ortamlardır: gerçeğe yakın test düzenekleri ve [Renode ile Zynq7000 Simülasyonu]({% post_url 2026-05-14-renode-ile-zynq7000-simulasyonu %}) yazısındaki gibi benzetim ortamları. Ürünü bu ortamlarda günlerce çalışır hâlde tutmak, onu bir kez açıp bakmaktan çok daha fazlasını gösterir.

Bir diğeri, ekibi kullanıcının yanına götürmektir. Hastane yazılımı yapan bir ekibin bir gününü serviste hemşirelerin yanında geçirmesi, aylarca toplanan geri bildirimde görünmeyen bazı iş akışı sorunlarını ortaya çıkarabilir. Bu tam olarak dogfooding değildir, ama aynı zinciri kısaltır.

## Ürünün etrafındaki sistem

Ürünün kendisi kullanılamasa bile, onu üreten mühendislik sistemi her gün kullanılır. Burada dogfooding'i ürün sınırının dışına taşımak mümkün: mühendislik sisteminin kendisi de dogfood edilebilir. Bu sistemin kullanıcısı zaten ekibin kendisidir, dolayısıyla geri bildirim maliyeti düşüktür. Ürünü sahada kullanamayan ekipler için, örneğin emniyet açısından kritik sistemler geliştirenler için, dogfooding'in en gerçekçi biçimi de çoğu zaman budur:

- **Araç:** Bir test çatısı yazdıysanız, kendi testlerinizi onunla koşun. Bir izlenebilirlik aracı yaptıysanız, kendi projenizin izlenebilirliğini onunla üretin.
- **Süreç:** Bir kod gözden geçirme süreci tanımladıysanız, kendi değişikliklerinizi ilk o süreçten geçirin. Sürecin ağır geldiği yeri en önce siz hissedersiniz.
- **Standart:** Bir kodlama standardı yazdıysanız, kendi kodunuz o standardı ihlal etmemeli. Kâğıtta makul görünen bir kural, maliyetini onunla yazılan ilk gerçek kodda gösterir.
- **Belge:** Bir prosedür yazdıysanız, onu ilk kez prosedürü hiç bilmeyen biri uygulamalı. Girişteki üç sayfalık Word dokümanı bunun tipik örneğidir. Yazarı aracı sıfırdan kurmayı kendisi denediğinde, dokümandaki gereksiz adımlar ve eksik açıklamalar daha kolay görünür hâle gelirdi.

## Sonuç

Dogfooding bir kalite güvence yöntemi değil, bir geri bildirim düzenidir. Kullanıcıyı temsil etmez ve bağımsız doğrulamanın yerine geçmez. Ama ürünü yapanları aksaklıkları kendi işlerinde yaşamaya zorlayarak geri bildirim gecikmesini azaltır ve raporların çoğu zaman yakalayamadığı küçük sürtünmeleri görünür kılar. Ürünün kendisi kullanılamadığında bile onu üreten araçlarda, süreçlerde ve belgelerde uygulanabilir.

Bütün bu sınırlara rağmen tek bir soru hep geçerliliğini korur. Kendi yazdığınız aracı kullanmak istemiyorsanız, bu da başlı başına bir bulgudur.

## Kaynaklar

- Warren Harrison, ["From the Editor: Eating Your Own Dog Food"](https://doi.org/10.1109/MS.2006.72), *IEEE Software*, Cilt 23, Sayı 3, s. 5–7, 2006. Alpo ve Kal Kan hikâyeleri.
- *Inside Out: Microsoft—In Our Own Words*, Warner Books, 2000. Paul Maritz'in 1988 tarihli "Eating our own Dogfood" e-postası.
- Jakob Nielsen, [Why You Only Need to Test with 5 Users](https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/), Nielsen Norman Group, 2000. Temsilî kullanıcılarla yapılan kullanılabilirlik testi üzerine.
- [Antikırılgan: Belirsizlikten ve Kaostan Güç Alan Sistemler]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %})
- [Renode ile Zynq7000 Simülasyonu]({% post_url 2026-05-14-renode-ile-zynq7000-simulasyonu %})

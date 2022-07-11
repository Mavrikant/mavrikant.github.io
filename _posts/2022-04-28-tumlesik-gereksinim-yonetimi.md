---
title: Tümleşik Gereksinim Yönetimi
subtitle: Integrated Requirements Engineering
background: "/img/posts/babilonia.jpg"
date: '2022-04-28 15:00:13 -0400'
layout: post
lang: tr
---

<span class="caption text-muted">Users don't know what they want until you show it to them..</span>

Herhangi bir sistemi geliştirmeden önce, sistemin ne yapması gerektiğini ve kullanımının o sistem için ödeme yapacak olan kişilerin veya şirketlerin hedeflerini nasıl katkı sağlayacağını anlamalısınız. Bu, uygulama alanını (telekomünikasyon, demiryolları, bankacılık, oyunlar vs.) anlamayı; sistemin operasyonel kısıtlamaları; paydaşlar (sistemi veya sağladığı bilgileri doğrudan veya dolaylı olarak kullanan kişiler) tarafından ihtiyaç duyulan belirli işlevsellik; ve performans, güvenlik ve güvenilirlik gibi temel sistem özellikleri kapsar. Gereksinim mühendisliği, bu anlayışı geliştirmeye yardımcı olan ve sistem geliştirmede yer alan paydaşlar ve mühendisler için sistem özelliklerini belgeleyen bir dizi yapılandırılmış faaliyetlerin tümüne verilen isimdir.

## Temel Süreç

Gereksinim mühendisliği süreci, geliştirilmekte olan uygulamanın türüne, dahil olan şirketlerin büyüklüğüne ve kültürüne ve kullanılan yazılım satın alma süreçlerine bağlı olarak büyük ölçüde değişir. Yenilikçi yazılım ürünleri geliştiren küçük şirketler için, gereksinim mühendisliği süreci beyin fırtınası oturumlarından oluşabilir ve ürün "gereksinimleri", yazılımın yapması beklenen şeyin kısa bir vizyon ifadesi olabilir. Büyük askeri ve havacılık sistemleri için, sistem mühendisliği süreçlerinde normalde resmi bir gereksinim mühendisliği aşaması ve kapsamlı bir şekilde belgelenmiş sistem ve yazılım gereksinimleri vardır.

Bütün gereksinim mühendisliği süreçlerini temel adımları:
* **Ortaya Çıkarma:** Sistemle ilgili bilgi kaynaklarını belirleyin ve bunlardan gereksinimleri keşfedin.
* **Analiz:** Gereksinimlerin birbirleri ile örtüşmelerini ve çatışmalarını anlayın.
* **Doğrulama:** Sistem paydaşlarına geri dönün ve gereksinimlerin gerçekten ihtiyaç duydukları şey olup olmadığını kontrol edin.
* **Müzakere:** Kaçınılmaz olarak, paydaşların görüşleri farklı olacaktır ve önerilen gereksinimler çatışabilir. Çakışan görüşleri uzlaştırmaya ve tutarlı bir gereksinimler dizisi oluşturmaya çalışın.
* **Belgeler:** Gereksinimleri paydaşlar ve yazılım geliştiriciler anlayabileceği bir şekilde yazın. 
* **Yönetim:** Kaçınılmaz olarak yaşanacak gereksinim değişikliklerini kontrol edin.

![Gereksinim Mühendisliği Aktivite Döngüsü](/img/posts/gereksinim-muhendisligi-aktivite-dongusu.png){:style="display:block; margin-left:auto; margin-right:auto"}

Bu aktivitelerin her zaman sırayla yapılacağına inanılsada aslında bu bir döngüsel aktivitedir. 


Yazılım mühendisliği araştırma topluluğu, bir gereksinim belgesi ne kadar eksiksiz ve tutarlı olursa, yazılımın güvenilir olma ve zamanında teslim edilme olasılığının o kadar yüksek olduğunu savundu. Bu yüzden gereksinimlerin tam, eksiksiz ve tutarlı olmasını sağlayan birçok özel yöntem geliştirildi.

## Gereksinim mühendisliğinin evrimi
1970 yılında Winston Royce tarafından şelale modeli (waterfall) geliştirildi. Bu modelde, sistem gereksinimlerini anlama ve belgeleme süreci, yazılım mühendisliğindeki ilk aşamadır. Bu da gereksinim çıkarmanın yazılım geliştirmeye başlamadan önce yaptığınız bir şey olduğu ve bir kez çıkarıldıktan sonra yazılım gereksinimlerinin geliştirme sürecinde önemli ölçüde değişmeyeceği varsayımına yol açtı. Ayrıca, gereksinim çıkarmanın sistem tasarımından ayrılması gerektiği varsayımına da yol açtı. Sistem gereksinimleri, sistemin ne yapması gerektiğini tanımlamalıdır; tasarım, sistemin gereksinimlerinin nasıl uygulanacağını tanımlamalıdır.

1970’lerdeki çalışmalar bir formal gereksinim dili oluşturmaya odaklandı. 1980’lerde nesne yönelimli modelle geliştirildi. 1990’larda süreç geliştirme, hedef odaklı yaklaşımlar, formal matematiksel metodlar üzerinde çalışıldı.

Artık, gereksinim mühendisliği araştırmalarının ve uygulamalarının çoğunun temelini oluşturan ön varsayımların gerçekçi olmadığını biliyoruz. Yazılımların kullanıldığı iş ortamı değiştiği için gereksinimlerin de değişmesi kaçınılmaz. Büyük sistemler için sistem geliştirmeye başlamadan sistemin tamamını anlamak mümkün olmayabilir. Ürünün geliştirme ve operasyonel süreci boyunca paydaşlar problem hakkında yeni bilgilere ulaşıyor bu gereksinimlerin değişmesine neden oluyor. 

Gereksinim ve tasarımın birbirinden ayrılması ve birbirlerini etkilemeleri mümkün değil.

## 21. yüzyıl için gereksinim mühendisliği
20.yüzyılda gereksinim mühendisliği sistem geliştirilmeden önce yapılan bir aşama olarak görülüyordu. Yazılım geliştirmeye yönelik yeni yaklaşımlar ve işletmelerin yeni fırsatlara ve zorluklara hızla yanıt verme ihtiyacı, gereksinim mühendisliğini yazılım geliştirmedeki rolünü yeniden düşünmemizi zorunlu kılıyor. 
Yeniden düşünmemize neden olan 4 temel değişiklik:

* Sistem geliştirmeye yeni yaklaşımlar
  * Artık yazılım tekrar kullanımına odaklanılmış durumla. Bir yazılım farklı konfigürasyonlar farklı sistemlerde de kullanılmak isteniyor. Buna göre geliştirme yapılması isteniyor.
* Hızlı yazılım teslimi ihtiyacı.
  * Piyasa çok hızlı değişiyor. Bir ürün için vizyon oluşmaya başladığı anda yazılımın da geliştirilmeye başlanması şart.
* Artan gereksinim değişim oranı
  * Yazılımın hızlı teslim ihtiyacı gereksinimleri anlamak için ayrılmış olan sürenin de kısalmasına neden oluyor. Gereksinimler tam anlaşılmadığında ortaya çıkan yazılımda hatalar artıyor. Bunları düzeltmek için gereksinimlerin hızla değişmesi gerekiyor. 
* Yazılım varlıklarında daha fazla yatırım getirisi ihtiyacı.
  * Şirketler yazılım varlıklarına çok fazla para ödüyor. Bu varlıkları olabildiğince fazla faydalanmak istiyor. Bu da yeni ve eski yazılımların beraber uyum içerisinde çalışması ihtiyacını doğuruyor. 

## Eş zamanlı Gereksinim Mühendisliği
Eş zamanlı gereksinim mühendisliğinde gereksinim çıkarma, doğrulama ve yazılım geliştirme süreçleri ez zamanlı olarak yürütülür. Her aşamada ürüne yeni özellikler eklenerek sistem aşamalı olarak geliştirilir ve teslim edilir.

Bazı avantajlar:
* Düşük süreç yükü
* Değer katan isteklerin erken teslimi
* Gereksinim değişimine hızlı tepki

Geliştirici istenen özelliği parçalara bölüp maliyet analizi yapar. Müşteri temsilcisi buna göre işleri öncellendirip gelecek versiyonda olması istenen özellikleri listeler. 


## Gereksinim Mühendisliği ve COTS ürün satın alınması
COTS (Commercial off-the-shelf, Ticari kullanıma hazır) ürünler birçok alanda mevcut. Kullanmak için sadece ihtiyaca göre konfigüre edilmesi gerekiyor. COTS ürünleri satın alıp konfigüre ederek bir sistem geliştirmek mümkün. 
Geleneksel gereksinim mühendisliği prensipleri COTS ürün kullanarak sistem geliştirmeye uygun değil. Bütün gereksinimler önceden ayrıntılı bir şekilde çıkarılırsa buna göre COTS ürün bulmak imkansız olacaktır. COTS ürün seçerken esnek olmalı, ürüne göre gereksinimler yeniden tanımlanmalıdır.

PORE(Procurement-Oriented Requirements Engineering) Satın alma merkezli gereksinim mühendisliği Neil Maiden ve iş arkadaşları tarafından geliştirilen sistematik bir yaklaşımdır. Bu yaklaşımda müşteriden gereksinimler alındıktan sonra buna uygun COTS araçlar seçilip ürün geliştirmenin ve yeni gereksinimlerin bunlar üzerinde tanımlanmasıdır. 

PORE yaklaşımında üç aşamalı bir süreç uygulanıp en uygun ürün seçilir. 
1. Aday COTS yazılımını seçmek için herkese açık bilgileri kullanılır.
2. Olasılıkları daraltmak ve yeni gereksinimler çıkartmak için ürün demoları kullanılır.
3. Sistem seçimini ve gereksinimlerinizi daha da detaylandırmak için uygulamalı ürün değerlendirmeleri yapılır.


## Birlikte çalışabilirlik gereksinimleri
Şirketler zaten birçok yazılım sistemine sahip. Yeni eklenen yazılımın da eski sistemlerle birlikte çalışabiliyor olması şart.  Yazılımların uyumlu çalışabilmesi için Soren Lauesen tarafından yazdığı makalede beş prensip önerdi.
1. Açık hedef gereksinimleri kullanın ve tedarikçilerin bu gereksinimlere verdiği yanıtları değerlendirmek ve puanlamak için bir sistem geliştirin.
2. Birlikte çalışabilirlik gereksinimini teknik bir gereksinimden ziyade bir kullanıcı isteği olarak ifade edin.
3. Desteklenecek entegrasyon limitleri konusunda esnek olun.
4. Ürün evrimini düşünün ve orijinal tedarikçiden başka birinin ürün geliştirme sürecini devam edebilmesini sağlayabilecek gereksinimleri yazın.
5. Tedarikçinin projenin yüksek riskli alanlarını idare edebileceğini göstermek için sistem sözleşmesine bir deneme süresi yazın.

Daha düşük maliyetli ve değişen gereksinimlere daha duyarlı sistemlerin daha hızlı teslimine yönelik iş talepleri, yazılım mühendisliğine yönelik geleneksel "önce gereksinimler" yaklaşımının değişmesi gerektiği anlamına gelir. Gereksinim mühendisliği, yeniden kullanımdan yararlanmak ve sistemlerin değişen gereksinimleri yansıtacak şekilde gelişmesine izin vermek için sistem uygulamasıyla daha sıkı bir şekilde bütünleştirilmelidir. İş sistemi geliştiricileri bu değişiklikleri zaten benimsemiştir. Önümüzdeki birkaç yıl içinde tümleşik gereksinim mühendisliğini çoğu sistem türü için tercih edilen geliştirme modu olacağını tahmin ediyorum.

Bu yazı *Ian Sommerville*'ın *Integrated Requirements Engineering: A Tutorial* isimli makalesinden Türkçeleştirilerek oluşturulmuştur.

---
title: Yazılım Sistem Mühendisliği
background: "/img/posts/soft-sys-eng-page-header.png"
date: '2022-04-29 22:00:00'
layout: post
lang: tr
---

Yazılım projeleri gün geçtikçe daha büyük ve daha komplex hale geliyorlar. Bilgisayar donanımlarındaki performans artışı yazılımlar üzerindeki büyüklük ve komplekslik limitini baskılama ihtiyacını ortadan kaldırdı.   Donanımlar geliştikçe üzerinde çalışan yazımlarla yeni özellikler eklendi. Microsoft Word gibi bir yazılım eskiden diskete sığarken şimdi CD ile dağıtılıyor. 

Büyük yazılım projeleri tahmin edilen zamanda ve bütçe ile bitirilemiyor ya da müşterinin ihtiyaçlarını tamamen karşılayamıyor.  Bu fenomen *yazılım krizi* olarak biliniyor. Bu krize karşılık yazılım geliştiricileri yeni yöntemler geliştirdi. Sadece proje içerisinde kullanılan kaynakları, sağlanan isterleri, tamamlanan testleri takip etmek proje hakkında sağlıklı bir bilgi vermiyor. Bunlar dışında teknik sürecin ve onun ürününün de takip edilmesi şart.  Sistem mühendisliği bunu için gerekli araçları sağlıyor.

Sistem mühendisliği prensiplerinin yazılım geliştirme alanına uygulanmasına **yazılım sistem mühendisliği** diyoruz. 

![Yazılım Sistem Mühendisliği V Model](/img/posts/soft-sys-eng-v-model.png){:style="display:block; margin-left:auto; margin-right:auto"}
## Sistem ve sistem mühendisliği
Sistem ortak bir amaca hizmet eden parçaların bütünüdür. Bilgisayar sistemleri için bu parçalar; donanım, yazılım, insanlar, tesisler, ve süreçlerdir.

Sistem mühendisliği, bir ihtiyacı karşılayan en iyi çözümün bilimsel, mühendislik, ve yönetim becerileri ile bulunmasıdır. 
Sistem mühendisliğin 5 aşaması vardır:
1. Problem tanımı
1. Çözüm analizi
1. Süreç planlanması
1. Süreç kontrolü
1. Ürün değerlendirme

## Yazılım sistem mühendisliği nedir
Yazılım sistem mühendisliği terimi 1980 lere kadar gidiyor ve ilk olarak Winston W. Royce’un bunu kullandığı düşünülüyor. Yazılım sistem mühendisi, sistemin teknik yönetiminden ve son ürünün doğrulanmasından sorumludur. Yazılım sistem mühendisi, yazılım geliştiricilerin aksine kod yazmaz, proje ile ilgili dökümanları üretir. 
Yazılım sistem mühendisliği faaliyeti sistem isterleri yazılım ve donanım şeklinde parçalara bölündükten sonra başlar. 

## Yazılım sistem mühendisliği ve Yazılım mühendisliği
![Yazılım Sistem Mühendisliği V Model](/img/posts/soft-sys-eng-3-relation.png){:style="display:block; margin-left:auto; margin-right:auto"}
Hem Yazılım sistem mühendisliği hem de Yazılım mühendisliği, teknik ve yönetimsel süreçler. Yazılım mühendisleri sistemin komponentleri ve dokümantasyonunu üretir. 
Figure 1 üzerinden  sistem mühendisi, yazılım sistem mühendisi ve yazılım mühendisi arasındaki ilişki görülebilir. Sistem mühendisleri genel sistem analizini, sistem tasarımı, sistem entegrasyonunu ve testini yapar.
Yazılım geliştime aşamasının başlarında yazılım sistem mühendisi, yazılım isterlerini analiz eder ve mimari tasarım ortaya çıkartır. Yazılım sistem mühendisi ayrıca yazılımın sistem entegrasyonundan  ve testinden sorumludur.

### Yazılım sistem mühendisliği ve proje yönetimi
Proje yönetimi, yazılım sisteminin risklerini ve maliyetlerini değerlendirmeyi, proje takvimi oluşturmayı, projenin maliyetlere ve takvime uygun gittiğinden ve teknik gereksinimleri karşıladığından emin olmak için sürekli olarak projeyi denetler.
Yazılım sistem mühendisi ise teknik yaklaşımı belirler ve teknik kararlar alır. Son ürünü onaylar.

## Yazılım sistem mühendisinin görevleri 
### İster analizi
Bir yazılım geliştirme projesinin ilk aşaması sistem seviyesi isterlerin belirlenmesi ve dokümante edilmesidir. Sistem seviyesi isterler belli olduktan sonra yazılım sistem mühendisi bunları inceleyerek yazılım isterlerini belirler. 
Yazılım isterleri kategorileri:
* Fonksiyonel isterler
* Performans isterleri
* Harici arayüz isterleri
* Tasarım limitleri
* Kalite kıstasları

### Yazılım tasarımı
Yazılım tasarımı, yazalım isterlerini sağlayacak en etkili ve en verimli çözümün bulunması ve seçilmesidir.
Yazılım tasarımı geleneksel olarak 2 parçaya ayrılır:
1. Mimari tasarım
1. Detaylı tasarım

### Sürecin planlanması
Planlama, proje amaçlarını ve hedeflerini ve bunlara ulaşmak için stratejileri, politikaları, planları ve prosedürleri belirtir. Ne yapılacağını, nasıl yapılacağını, ne zaman yapılacağını ve kimin yapacağını önceden tanımlar.

### Sürecin kontrolü
Kontrol, projenin planlandığı gibi ilerlediğinden emin olmak için yapılan yönetimsel aktivitelerdir. Süreç kontrolü yapılan plandan sapmaları inceler bunlara karşı düzeltici aksiyonlar alır. Süreç orjinal plana uygun hale getirilemezse planlarlar tekrar gözden geçirilip düzeltilir. Eğer sapma aşırı boyutta ise proje iptal edilir. 

### Doğrulama, Onaylama<sup>2</sup> ve test
Doğrulama, Onaylama ve test; mühendislik sürecinin doğru ve üretilen ürünün isterleri karşılama durumunu kontrol etme çabalarıdır.

#### Doğrulama (Verification)
Bir iş ürününün bulunduğu aşamanın gereksinimlerine uygun olarak geliştirildiğinin değerlendirimesidir. Bu yapılırken planlar, gereksinim belgeleri, tasarım belgesi, kod, ve test belgeleri referans alınır. Bu belgelere bakılarak ürünün doğru mu geliştirildiği kontrol edilir.

#### Onaylama (Validation)
Geliştirilen nihai yazılımın kullanım amacına uygunluğun değerlendirilmesi ve gösterilmesidir. Onaylamanın amacı geliştirilen yazılım başta belirlenen kullanıcı ihtiyaçlarını karşıladığından ve doğru çalıştığından emin olmaktır. Başka bir deyişle ürünü amaçlanan ortama yerleştirildiğinde kullanım amacını yerine getirdiğini göstermektir. Onaylama işlemi nihai yazılım üzerinde yapılır. 

#### Test
Yazılımın tamamını ya da bir kısmını çalıştırılarak verilen girişlere karşılık beklenen tahmin edilebilir ve gözlemlenebilir çıkışların alındığının hata bulmak amacıyla kontrol edilmesidir. Test genellikle Onaylama sürecinin bir parçası olarak kabul edilir. 

Doğrulama ve onaylama teknik ve yönetimsel planları, şartname standartlarını ve prosedürlerini takip edip etmediklerini belirlemek için sistem mühendisliği, yazılım sistem mühendisliği, yazılım mühendisliği ve proje yönetimi faaliyetlerinin sürekli izlenmesi sürecidir. 

Sistem mühendisliği ve yazılım sistem mühendisliği, öncelikle sistem yaşam döngüsünün ön ucundaki teknik planlama için ve proje sonunda planların karşılandığını doğrulamak için kullanılan disiplinlerdir. Ne yazık ki, özellikle tamamı yazılımdan oluşan ve sıradan donanımda çalışan projelerde genellikle bu disiplinler gözden kaçırır.
Herhangi bir yazılım projesinin sistem yönlerinin göz ardı edilmesi, yazılımın seçilen donanım üzerinde çalışmamasına veya diğer yazılım sistemleri ile entegre edilememesine, projenin başarısızlıkla sonuçlanmasına neden olabilir.


## Referanslar
1. R. H. Thayer, "Software system engineering: a tutorial," in Computer, vol. 35, no. 4, pp. 68-73, March 2002, DOI: 10.1109/MC.2002.993773.
1. Ali Gürbüz, Yazılım Test Mühendisinin El Kitabı, Seçkin Yayıncılık, ISBN 9789750258992

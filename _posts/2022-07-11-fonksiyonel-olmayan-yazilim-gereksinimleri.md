---
title: Fonksiyonel olmayan yazılım gereksinimleri
subtitle: Non-functional Requirements in Software Engineering
background: "/img/posts/8.jpg"
date: '2022-07-11 15:59:34'
layout: post
---

Fonksiyonel olmayan gereksinimler, adından da anlaşılabileceği gibi uygulamanın işlevselliği ile ilgili olmayan, genel yazılım özelliklerini belirleyen ya da kısıtlayan gereksinimlerdir. Zaman kısıtlarının, geliştirme süreci üstündeki kısıtlamaları ve standartlarla dayatılan kısıtlamaları içerir. Fonksiyonel olmayan gereksinimler genellikle tek tek sistem özelliklerine değil sistemin tamamına uygulanır.
 
Fonksiyonel olmayan gereksinimler genellikle fonksiyonel gereksinimlere göre proje başarısında daha kritik etkiye sahiptir. Fonksiyonel olmayan bir gereksinimin karşılanmaması bütün sistemin kullanılamaz hale gelmesine, projenin iptal edilmesine neden olabilir. Örneğin bir DAL A seviyesi bir aviyonik projenin DO178 ile alakalı güvenilirlik gereksinimlerini karşılamaması üretilen ürünün sertifikalandırılamamasına ve hava aracında kullanılamamasına neden olur.

Fonksiyonel gereksinimleri ürün bileşenlerine kolayca bölmek mümkünken bunu fonksiyonel olmayan gereksinimlerde yapmak çok daha zordur. Fonksiyonel olmayan gereksinimlerin sağlanması iki nedenden dolayı tüm sistemi etkiliyor olabilir.
 
 1. Sağlanması gereken fonksiyonel olmayan gereksinim tüm sistem mimarisini etkiliyor olabilir. Örneğin performans ile alakalı bir gereksinimi sağlamak için tüm sistem mimarisinde köklü değişiklikler yapılması gerekebilir.
 2. Fonksiyonel olmayan gereksinimlerin sağlanması yeni fonksiyonel gereksinimler yaratılmasına neden olabilir. Örneğin sistemin güvenlik gereksinimi modüllerde kısıtlara neden olacak yeni fonksiyonel gereksinimler yaratabilir.
 
![Fonksiyonel olmayan gereksinimler](/img/posts/non-functional-reqs.png){:style="display:block; margin-left:auto; margin-right:auto;width: 700px;"}
 
Bu diyagramdan da görülebileceği gibi fonksiyonel olmayan gereksinimler birçok çeşitli kaynaktan gelebilir.
 
1. **Ürün gereksinimleri:** Yazılımın çalışma zamanındaki gereksinimleri. Sistemin ne kadar hızlı çalışması, ihtiyaç duyacağı disk ve max bellek kullanımı bu gereksinimlere örnektir.
2. **Organizasyonel gereksinimler:** Müşteri ve gelistiricinin organizasyonunda yer alan politika ve prosedürlerden kaynaklanan geniş gereksinimlerdir. Programlama dili, geliştirme ortamı, süreç standartları, yazılımın işletim ortamını vs gibi çevresel gereksinimler bunlara örnektir.
3. **Dış gereksinimler:** Yukarıda sayılan ilk iki gereksinim tipi dışında kalan dış kaynaklı gereksinimlerdir. Sistemin yasalara uygunluğu ve kullanıcılar tarafından kabulü için uyulması gereken etik gereksinimler dış gereksinimin olarak örneklendirilebilir.
 
Fonksiyonel olmayan gereksinimlerin genellikle yuvarlak bir dille yazılır. Bu durum onların test ve ürün kabul süreçlerini zorlaştırır. Fonksiyonel olmayan gereksinimler, fonksiyonel olan gereksinimler gibi net bir ifade ile yazılmalı, test edilebilir olmalıdır. Kabul kriterleri olabildiğince nicel metriklerle tanımlanmalıdır.

## Fonksiyonel olmayan gereksinim örnekleri
 
 Aşağıda bazı fonksiyonel olmayan gereksinim türleri ve onlara örnekler bulabilirsiniz.
 
- Hız
  -  Hızlı cevap verme (Responsiveness) ,
- Büyüklük 
  - Depolama alanı ihtiyacı
- Kullanım kolaylığı
  - Yeni kullanıcının sistemi öğrenme süresi
- Güvenilirlik (Stabilite)
  - Yazılımın son 24 saat içerisinde çalışabilir olduğun süre
- Dayanıklılık
  - Hatalara karşı nasıl tepki veriyor.
  - Hata sonrası tekrar başlama süreci
- Bakım yapılabilirlik (maintainability)
  - Dokümantasyon
  - Teknik borç
  - Clean architecture
- Taşınabilirlik
  - Hangi platformlara ve teknolojilere bağımlı.
- Performans
  - Kaç kişiye eş zamanlı hizmet verebiliyor.
- Verimlilik
  - Yazılımın sistem kaynaklarını kullanma oranı
- Güvenlik
  - Sistemin hack saldırılara karşı dayanıklılığı
  - Kullanıcı verilerinin şifrelenmesi
- Karşılıklı uyum içinde çalışma (interoperability)
  - Sistemin uyumlu olduğu donanımla
  - Etkileşimde olduğu yazılım sistemleri

---
title: Use Case Tuzakları
layout: post
date: '2022-05-01 10:51:46'
subtitle: Use Case Kullanan Gerçek Projelerde Karşılaşılan En Önemli 10 Sorun
background: "/img/posts/use-case-tuzak.jpg"
---

Use case analizi yazılım projelerinde oldukça yaygın olarak kullanılan, pratik, erişilebilir ve basit bir formattır. Fakat basit olmasının da zorlukları vardır. Bu makale de use case kullanırken karşılaşılan 10 problemden bahsedilmiştir.

Son birkaç yılda, bir dizi projenin "use case kullanarak" ilk denemelerini yaptıkları görüldü. Bu projeler, use case analizini çeşitli şekillerde kullanmıştır. Örneğin; sistem gereksinimlerinin bir parçası olarak, bir analiz tekniği olarak sistem gereksinimlerini daha açıklayıcı hale getirmek için, kullanıcı gereksinimlerini ortaya çıkarmak için. Proje ekipleri "use case" e başlarken küçük çapta sorunlarla karşılaştı fakat daha büyük projelerde de aynı sorunlarla karşılaşıldı. Bunlar; tanımsız veya birbiriyle uyuşmayan sistem sınırları, use case modelinin karmaşıklığı, use case belirtiminde yaşanan anlaşmazlıklar, uzun ve ayrıntılı projelerde zor ve asla tamamlanamayan vakalardır. Bu yazıda  örneklerin daha iyi anlaşılması için "Beyzbol Bilet Sipariş Sistemi" kullanılmış ve örneklendirilmiştir.

## En çok Karşılaşılan 10 Sorun

![Belirsiz sistem tanımı](/img/posts/use-case-tuzak.jpg){:style="display:block; margin-left:auto; margin-right:auto"}
### Problem 1 - Sistem sınırı tanımsız veya tutarsız olabilir.
#### Belirti:
Kullanım durumları tutarsız sistem kapsamında açıklanmıştır. Aktörleri belirlemeden önce sistem kapsamını belirlememiz gerekir. Öncelikle anlamamız gereken; bu bir bilgisayar sitemi mi?, bir başvuru sistemi mi? ya da tam bir ticari işletme mi? bunları belirlememiz gerekir. Bir sistem için uyumlu olmayan diğeri için uyumlu olabilir. Örneğin; "kiosk müşteri" bilet satın almak için bilgisayar sistemini kullanabilir. Aynı zamanda "kiosk müşteri" telefonla müşteri temsilcisini arayıp "telefon müşterisi" de olabilir.
#### Çözüm:
Kapsam hakkında açık olun ve sistem sınırını buna göre etiketleyin. Yani burada üçüncü bir kullanıcı olarak "telefon müşterisi" ni ayrı tutmaya gerek yoktur. "Kiosk müşteri" ikisi de olabilir. Şunu ayırt etmek gerekiyor ki telefon kullanıcısı bilet satın alma işinin bir kullanıcısıdır. Fakat bilgisayar sisteminin bir kullanıcısı değildir.


### Problem 2 - Kullanım senaryoları sistemin (aktörlerin değil) bakış açısından yazılmıştır.
#### Belirti: 
Kullanım senaryosu adları, aktörün amacından ziyade sistemin ne yaptığını tanımlar.
#### Çözüm:
Kullanım durumlarını Aktörün hedefleri açısından adlandırın. Bilet Sırası ve Görüntüleme Programı, sistemin yaptığı şeylerdir.Biletler ve Görünüm Takvimi, sistem kullanıcılarının hedefleridir. Sistemin aktörün amacını nasıl tatmin edeceğine değil, ne yapması gerektiğine odaklanılır.

#### Belirti:
Kullanım senaryosu modeli bir veri/süreç akış şemasına benziyor.
#### Çözüm: 
Kullanım senaryosu modelinin doğrudan ilişkili olmayan kullanım senaryoları içerip içermediğine dikkat etmek gerekir. Acemi modelleyiciler bu konu hakkında fazla bilgi sahibiolmadığından bu durumu kötüy kullanıp  karıştırabiliyorlar.

### Problem 3 - Aktör isimleri tutarsız olabiliyor.
#### Belirti: 
Bir rolü tanımlamak için birden fazla isim kullanılıyor. Bu en başta çok kolay bir yöntem gibi gözükse de ilerleyen zamanlarda bir takım karışıklıklara sebep olabilir ve kodlama aşamasına geçildiğinde programlamayı yapan kişi için zor olacaktır.
#### Çözüm:
Aktör adları ve diğer programlama terimleri konusunda erken anlaşmaya varılmalıdır. Bunu için bir sözlük oluşturmak iyi bir yöntemdir. Böylece projenin ileri aşamalarında ki yaşanacak karışıklıkların önüne geçilir.

<img src="/img/posts/use-case-partitioning.jpg" alt="Use case Bölümleme" width="600px" style="display:block; margin-left:auto; margin-right:auto"/>
### Problem 4 - Çok fazla use case kullanılması durumu
#### Belirti:
Kullanım senaryosu modelinde çok sayıda kullanım senaryosu vardır. Bunu önlemek için bir konuyu çok iyi anlamak gerekiyor. Use case senaryolarının ayrıntı düzeyinin uygun olduğuna ve değer sonuçlarına dikkat etmemiz gerekir. Örneğin; iyi senaryoları içermeyen " Kiosk Müşteri"nin 3 farklı use case'i var ise bunların göz önünde bulundurularak atomik bir şekilde yazılması gerekir.
#### Çözüm:
Şayet sistem çok büyük bir sistem ise; Kullanım senaryosu modeli, her biri bir paket içeren kullanım senaryosu paketlerine ayırmak gerekir. Böylece, çok fazla use case kullanılması durumunda karışıklıktan kaçınılmış olunur.


<img src="/img/posts/use-case-generalization.jpg" alt="Use case Aktör Kalıtımı" width="600px" style="display:block; margin-left:auto; margin-right:auto"/>
### Problem 5 - Aktör use case kullanım durumu bir örümcek ağına benzer
#### Belirti:
1. Aktörler ve kullanım durumları arasında çok fazla ilişki vardır.
1. Bir aktör her kullanım durumu ile etkileşime girer.
1. Bir kullanım durumu, her aktörle etkileşime girer.

#### Çözüm:
Aktörlerin çok geniş bir skalada tanımlanabilir olup olmadığını belirlemek için aktörleri incelemek gerekir. Makale de belirtilen telefon memuru ve stadyum yöneticisi arasında ki ilişki bu konuyu anlamak için idealdir. Böylece, use case modelleme notasyonu, açık bir şekilde için bir mekanizma, aktör kalıtımı sağlar.

### Problem 6 - Genellikle kullanım senaryosu özellikleri çok uzun oluyor.
#### Belirti: 
Senaryolar çok geniş çapta ve uzun sürebiliyor.
#### Çözüm: 
Use case senaryoları daha özet, daha kısa ve anlaşılır olmalı ki ilerleyen zamanlarda use case senaryolarını inceleyen kişiler için daha özet ve bütün sisteme hakim bilgiler içerebilsin.


### Problem 7 - Kullanım senaryosu spesifikasyonları kafa karıştırıcıdır.
#### Belirti: 
Kullanım senaryosunun şart içermiyor ve bir hikaye anlatmıyor
#### Çözüm:
Kullanım senaryosuna "şart" eklerseniz bu use case için daha iyi olabilir.
1. Koşullu davranışı ("Eğer...") ayrı olarak tanımlanan alternatif akışlara ayrılmalı,
1. Normal akıştan daha kısa ve anlaşılması daha kolay olur.
1. Kullanım senaryosu adımları, önemsiz olmayan algoritmaları tanımlamak için özellikle etkili değildir.
1. Şartlar kurallara ayrılarak belirtilmeli.

### Problem 8 - Use case işlevsel yetkiyi doğru bir şekilde tanımlayamıyor.
#### Belirti: 
Aktörler ve kullanım durumları arasındaki ilişkiler doğru veya tam olarak tanımlamıyor. Bunun 2 sebebi vardır. Birincisi; Kullanım senaryosu modelleyicileri, "nesne yönelimli" olmaya çalışıyorlar. "CRUD kullanımını bütün senaryoya yerleştirmek istiyorlar. İkincisi ise; arayüz ekranıyla entegre etmeye çalışıyorlar.
#### Çözüm:
Bir kullanıcıya ait bütün senaryolar tek bir seferde yazılmaya çalışılması yerine bölünerek yazılmalıdır. Böylece daha anlaşılır olur.

### Problem 9 - Müşteri modelleyici tarafından oluşturan use case'leri anlamakta zorluk çekiyor
#### Belirti: 
Müşteri kendisine onaylaması için sunulan belgeleri anlamıyor ama bunları belirli zaman içinde kabul etmesi gerekiyor. Projenin ilerleyen safhalarında kabul etmiş ama anlamış olduğu doküman üzerinden bir sistem hayata geçirildiğinde bu durum ciddi sorunlar yaratabilir.
#### Çözüm:
Çözüm olarak müşteriye anlayabileceği kadar bilgi verilmelidir. Böylece müşteri hem dokümanları anlayarak belgelere onay verecek hem de anlaşmazlıklar da en az bütçe harcanarak çözülecektir.

### Problem 10 - Use case durumları asla bitmez.
#### Belirti: 
Kullanıcı arayüzü her değiştiğinde kullanım senaryolarının değişmesi gerekiyor.
#### Çözüm:
Use case senaryolarını çok katı olmayacak şekilde birleştirilmelidir ki dokümanların modifiye edilebilmesi kolay olsun.



Not: Bu yazı Susan Lilly'nin *Use Case Pitfalls: Top 10 Problems from Real Projects Using Use Cases* isimli makalesi Türkçeleştirilerek oluşturulmuştur.

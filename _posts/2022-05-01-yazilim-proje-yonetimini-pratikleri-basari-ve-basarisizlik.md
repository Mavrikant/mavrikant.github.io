---
title: 'Yazılım Proje Yönetimini Pratikleri:  Başarı ve Başarısızlık'
layout: post
date: '2022-05-03 20:08:36'
background: "/img/posts/1.jpg"
---

1995-2004 yılları arasındaki yaklaşık 250 büyük yazılım projesinin incelenmesi ilginç benzerlikleri gösterdi. Maliyet ve çizelge tahminlerini başarıyla gerçekleştiren büyük projeleri geç kalan, bütçeyi aşan veya tamamlanmadan iptal edilen projelerle karşılaştırırken, altı ortak sorun gözlemlendi: zayıf proje planlaması, yetersiz maliyet tahmini, zayıf ölçümler, zayıf kilometre taşı takibi, zayıf değişim kontrolü ve düşük kalite kontrol. Buna karşılık, başarılı yazılım projeleri bu alanların altısında ortalamanın üzerinde olma eğilimindedir. Bu altı sorun alanının belki de en ilginç yanı, hepsinin teknik personelden çok proje yönetimiyle ilişkili olmasıdır. **İki çalışma hipotezi ortaya çıktı:** 
1. Yetersiz kalite kontrolü, maliyet ve zaman aşımına en büyük katkıyı sağlar 
2. Yetersiz proje yönetimi, yetersiz kalite kontrolünün en olası nedenidir.

**Araştırma dahilindeki 250 projeden;**
* 25 tanesi planlanan zamanda ve bütçe ile bitti,
* 50 tanesi plananan zamandan sonra bütçeyi %35 aşarak sonuçlandı,
* 175 tanesi büyük gecikmeler ve bütçe aşımı ile sonuçlandı ya da hiç tamamlanamadı.

## Başarılı ve Başarısız Proje Planlaması
Proje planlaması ifadesi, iş kırılım yapılarının oluşturulmasını ve ardından görevlerin zaman içinde ekip üyelerine dağıtılmasını kapsar. Proje planlaması, Gantt çizelgeleri, PERT çizelgeleri veya benzerleri dahil olmak üzere çeşitli zaman çizelgelerinin ve kritik yolların oluşturulmasını içerir.

**2004 yıllarında büyük yazılım projeleri için başarılı planlama şunları içerir:**
* Artemis Views veya Microsoft Project gibi otomatik planlama araçlarını kullanma.
* Eksiksiz iş kırılım yapılarının geliştirilmesi.
* Proje geliştirme faaliyetlerinin kritik yol analizinin yapılması.
* Proje süresince personel alımını ve işten ayrılmayı dikkate almak.
* Taşeronları ve uluslararası ekipleri dikkate almak.
* Gereksinimlerin toplanması ve analizi için zamanında düzeltme.
* Değişen gereksinimlerin üstesinden gelmek için zamanında düzeltme.
* Eksiksiz bir kalite kontrol faaliyetleri paketi için zamanında düzeltme.
* Gereksinim artışı önemliyse, birden fazla yayının değerlendirilmesi.

Başarı projeler planlamayı iyi yapıyor, başarısız projelerde ise çoğunlukla planlama hataları var.

**En yaygın planlama hataları:**
1. Değişen gereksinimlerle etkin bir şekilde ilgilenmemek,
2. Proje süresince personel alım sürecine katılmamak ve işten ayrılmayı öngörmemek,
3. Detaylı gereksinim analizi için zaman ayırmamak,
4. Denetimler, testler ve hata düzeltmeleri için yeterli zaman tahsis etmemek.

Başarılı projelerde planlama süreci araçlar yardımcı ile otomatize edilmiş durumda. Piyasada 50 den fazla ticari proje planlama aracı var. Başarılı projeler en az bir tanesini kullanıyor.

## Başarılı ve Başarısız Proje Maliyet Tahmini
Büyük yazılım projelerinde maliyet tahmini elle yapılamayacak kadar komplex. Piyasadaki 75’den fazla yazılım maliyet tahmini programını varlığı da bu durumu doğruluyor. Bunlardan en bilinenleri: COCOMO II, CostXpert, Knowledge-Plan, PRICE-S, SEER-SEM, SLIM

Başarılı projelerde bu programlardan en az bir tanesini kullanıyor. Birden fazla programın kullanılması nadir değil. 

**Büyük sistemler için başarılı maliyet tahmini, aşağıdakilerin kullanılmasını içerir:**
* Yazılım tahmin araçları (COCOMO II, CostXpert, KnowledgePLAN, PRICE-S, SEER-SEM, SLIM, vb.).
* İşlev noktalarına dayalı ana çıktılar için resmi boyutlandırma yaklaşımları.
* Tahminlerin benzer projelerden elde edilen geçmiş verilerle karşılaştırılması.
* Eğitimli tahmin uzmanlarının veya proje yöneticilerinin varlığı.
* Tahmine yeni ve değişen gereksinimlerin dahil edilmesi.
* Kalite tahmininin yanı sıra program ve maliyet tahmininin dahil edilmesi.

Projedeki verimlik oranın abatılarak tahmin edilmesi ya da küçük bir proje ile büyük bir projedeki verimin aynı olacağını yanılgısı en sık yapılan hatalardan. 

## Başarılı ve Başarısız Proje Ölçümlemesi
Başarılı büyük projeler çoğunlukla üretkenlik ve kalite geçmiş verilerini kaydetmek için yazılım ölçüm programlarına sahip şirketlerden çıkar. Böylece herhangi bir yeni proje, çizelgelerin, maliyetlerin, kalitenin ve diğer önemli faktörlerin geçerliliğini değerlendirmek için benzer projelerle karşılaştırılabilir. 10.000 işlev puanı alanındaki projeler için **en faydalı ölçümler** aşağıdakilerin ölçümlerini içerir:
* Birikmiş çaba.
* Birikmiş maliyetler.
* Geliştirme verimliliği.
* İsterlerin hacmi ve değişim oranı.
* Hataların kök nedeni.
* Hata giderme verimliliği.

**Geliştirme verimliliği genelde 2 farklı şekilde ölçülüyor.** 
1. Adam-ay sürede geliştirilen işlev puanı
2. Birim işlev puanı için harcanan saat

Bazı devlet kurumları ve savunma sanayi hala eski Lines-of-code metrikini kullanıyor. Bu metrik kullanımı tehlikeli çünkü sadece yazılım aşamasını değerlendiriyor. Planlama, isterler, dökümantasyon, proje yönetimi, kalite güvencesi gibi alanları yok sayıyor. Satır sayısı ve proje arasındaki ilişki kullanılan dile bağlı. Çok büyük projelerden birdan fazla yazılım dili kullanılıyor. 12 farklı yazılım dili içeren projeler mevcut.

Başarılı projelerde hataların yakalanma ve giderilme oranları da takip ediliyor. Başarılı projelerde hataların %95’i geliştirme aşamasında yakalanıyor. Bu sektör ortalaması %85’den sadece 10 puan daha yüksek. 

Projedeki büyük takvim gecikmeleri genelde test aşamasında aşırı hatalar yüzünden ortaya çıkıyor. Büyük projelerdeki yetersiz kalite kontrolü takvim gecikmelerinin ve maliyet artışlarının ana sebebi.  

## Başarılı ve Başarısız Proje Kilometre Taşı Takibi
Proje yönetimi, kilometre taşlarını oluşturmaktan, bunların tamamlanmasını izlemekten ve kilometre taşlarının başarıyla tamamlanıp tamamlanmadığını veya sorunlarla karşılaşıldığında doğru bir şekilde raporlamaktan sorumludur. Ciddi sorunlarla karşılaşıldığında, kilometre taşının tamamlandığını bildirmeden önce sorunları düzeltmek gerekir.
**Büyük projelerde bazı kilometre taşları:**
* Gereksinim incelemesi.
* Proje planının gözden geçirilmesi.
* Maliyet ve kalite tahmini incelemesi.
* Dış tasarım incelemeleri.
* Veritabanı tasarımı incelemeleri.
* İç tasarım incelemeleri.
* Kalite planı ve test planı incelemeleri.
* Dokümantasyon planı incelemesi.
* Dağıtım planı incelemesi.
* Eğitim planının gözden geçirilmesi.
* Kod incelemeleri.
* Her geliştirme test aşaması.
* Müşteri kabul testi.

Başarılı projelerin bir farklı da projede bir problem yaşandığında ya da takvimde bir gecikme görüldüğünde, düzeltici aksiyonları güçlü ve derhal bir şekilde yerine getirir.  Başarısız projelerde ise hatalar görmezden gelip ötelenir. 

## Başarılı ve Başarısız Proje Değişiklik Yönetimi
10000 işlev puanın sahip projelerde analiz ve tasarım aşamasında her ay isterlerin %1 ile %3’ü arası değişiyor, ekleniyor veya siliniyor. Bu durum proje başında ve sonunda işlev puanlarını hesaplanması ile bulundu. Proje başında 10000 işlev puan olan bir proje tasarım aşaması bittikten sonra 12000 işlev puana çıkabiliyor. Toplamda %20 lik bir proje büyümesi demek bu. Arada geçen süresini 10 ay olduğu varsayılırsa her ay proje %2 oranında büyümüş olmalı. Projedeki bu büyümeye bağlı olarak planların ve tahminlerin güncellenmesi gerekiyor.

**Başarılı bir değişiklik kontrol yönetimi aşağıdakileri içeriyor:**
* Ortak bir müşteri/geliştirme değişikliği kontrol kurulu veya belirlenmiş etki alanı uzmanları.
* Aşağı yöndeki değişiklikleri en aza indirmek için ortak uygulama tasarımı (JAD) kullanma.
* Aşağı yöndeki değişiklikleri en aza indirmek için resmi prototiplerin kullanılması.
* Değişikliklere uyum sağlamak için yinelemeli geliştirmenin planlı kullanımı.
* Tüm değişiklik taleplerinin resmi olarak gözden geçirilmesi.
* 10 fonksiyon noktasından büyük tüm değişiklikler için revize edilmiş maliyet ve zamanlama tahminleri.
* İş etkisi açısından değişiklik taleplerini önceliklendirmek.
* Değişiklik taleplerinin belirli sürümlere resmi olarak atanması.
* Çapraz referans özelliklerine sahip otomatik değişiklik kontrol araçlarını kullanma.

Gerçek dünyada isterlerin dondurmak pek olası bir durum değil. Bu yüzden değişikliğe hazır olmalıyız.  

## Başarılı ve Başarısız Proje Kalite Kontrolü
Etkili yazılım kalite kontrolü, başarılı projeleri gecikmelerden ve felaketlerden ayıran en önemli tek faktördür. Bunun nedeni, büyük sistemler için hata bulma ve düzeltmenin en pahalı maliyet unsuru olması ve diğer faaliyetlerden daha fazla zaman almasıdır.

Başarılı kalite kontrol, hem hata önleme hem de hata giderme faaliyetlerini içerir. Hata önleme ifadesi, ilk etapta bir hata veya kusur oluşturma olasılığını en aza indiren tüm faaliyetleri içerir. Kusur giderme ifadesi, her türlü teslimatta hata veya kusur bulabilen tüm faaliyetleri içerir.

**Hata Önleme:**
* Gereksinimleri toplamak için JAD.
* Resmi tasarım yöntemleri.
* Yapılandırılmış kodlama yöntemleri.
* Resmi test planları.
* Resmi test senaryosu yapımı.

**Hata Giderme:**
* Gereksinim denetimleri.
* Tasarım incelemeleri.
* Belge incelemeleri.
* Kod incelemeleri.
* Test planı ve test durumu incelemeleri.
* Arıza onarım muayeneleri.
* Yazılım kalite güvence incelemeleri.
* Birim testi.
* Bileşen testi.
* Yeni fonksiyon testi.
* Gerileme testi.
* Performans testi.
* Sistem testi.
* Kabul testleri.

Hata önleme ve hata giderme faliyetlerindeki değişim  proje sonucundaki hata oranında ciddi bir fark yaratıyor. 

Başarılı bir projede ortalama her işlev puanı 4.0 hata içeriyor ve hata önleme faliyetlerinde %95’i müşteriye teslim edilmeden yakalanıyor. Bir başka deyişle, teslim edilen yazılımda her işlev puanına karşılık 0.2 hata var ya da toplamda 2000 hata var diyebiliriz. Bunların sadece %10u (200 hata) kritik seviyede oluyor.

Başarısız bir projede ortalama her işlev puanı 7.0 hata içeriyor ve hata önleme faliyetlerinde sadece %80’i müşteriye teslim edilmeden yakalanıyor. Bir başka deyişle, teslim edilen yazılımda her işlev puanına karşılık 1.4 hata var ya da toplamda 14000 hata var diyebiliriz. Bunların sadece %20u (2800 hata) kritik seviyede oluyor.

Yukarıdaki 2 örnekten görülebileceği üzere 2 proje arasında kritik hatlarda 14 kat fark var. Bu farklı oluşturan asıl neden başarılı projelerde resmi tasarım ve kod denetimi aşamalarının hata yakalamada %65 verimli olması.

Başarısız projelerde genelde tasarım ve kodlama denetimi aşamları pas geçilip hata bulmada sadece test aşamasına  güveniliyor. **Bu durum aşağıdaki 3 probleme neden oluyor:**
1. Test sırasında hala mevcut olan çok sayıdaki hata, projeyi durma noktasına getirir,
2. Denetimsiz projeler için hatalı düzeltme eklenme oranı endişe verici derecede yüksektir
3. Yalnızca testle ilişkili genel hata giderme yüzde 80'den daha yüksek kusur giderme oranları elde etmek için yeterli değildir.

## Sonuç
Büyük yazılım sistemlerini başarısızlıkla sonuçlanmasını birçok yolu vardır. Projeyi başarılı sonuçlandırmanın ise  sadece birkaç yolu var. Proje yönetiminin, projeleri başarıya veya başarısızlığa götüren ana faktör olması ilginçtir.

Kalite kontrolünde beceriksiz ve proje yönetimi aşamalarında yetersiz olan büyük yazılım projeleri, genellikle ya tamamen başarısızlığa ya da büyük miktarda maliyet aşımına neden olur.

Başarıya götüren en önemli yazılım geliştirme uygulamaları arasında, proje başlamadan önce planlama ve tahminde bulunma, proje sırasında değişen gereksinimleri absorbe etme ve hataları veya kusurları başarılı bir şekilde en aza indirme sayılabilir.

Başarılı projeler her zaman şu kritik faaliyetlerde başarılı olur: planlama, tahmin, değişiklik kontrolü ve kalite kontrolü. Buna karşılık, geç veya başarısız bir şekilde yürütülen projelerin kusurlu veya iyimser planları, değişiklikleri öngörmeyen veya değişimi iyi idare edemeyen tahminleri vardır.

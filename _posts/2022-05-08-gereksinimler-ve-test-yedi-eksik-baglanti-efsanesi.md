---
title: 'Gereksinimler ve Test: Yedi Eksik Bağlantı Efsanesi'
background: "/img/posts/7.jpg"
date: '2022-05-08 10:44:09'
layout: post
lang: tr
---

> Test uzmanı Dorothy Graham, test gereksinimlerine test uzmanları dahil olursa çok fazla zaman ve para tasarrufu sağlayabileceğinizi iddia ediyor. Gereksinimler bazı tutarlı kalite kriterlerine sahipse, test uzmanları soru sorabilir ve sorunları biz onları koda dönüştürmeden önce bulabilir. –Suzanne Robertson

Test ve gereksinim mühendisliği arasındaki güçlü bağlantı her iki tarafa da fayda sağlayabilir, ancak çoğu zaman bu bağlantı eksiktir. Bu yazı eksik halkanın ardındaki en yaygın yedi efsaneyi veya yanlış kanıyı inceliyor.

## EFSANE 1: Başlangıçta Gereksinimler, Sonda Test 
“Henüz test hakkında düşünmemize gerek yok. Sadece gereksinimlere odaklanalım." Bu tutum, projenin sonunda zor zamanlar geçirileceğini garanti eder. Tabii ki, iyi gereksinimlerin elde edilmesi önemlidir, ancak test sırasında test uzmanlarını dahil etmek gereksinim analizi, iyi gereksinimleri sağlamanın en iyi yollarından biridir.

V-Modele göre genellikle sistem ve kullanıcı kabul testleri için gereksinim analizi sırasında, test tasarlamak için işlemlere başlandığı anda test tasarım faaliyetlerini gerçekleştiremezsiniz.

Özellikle test kullanıcıları için yaygın bir sorun, geç değişikliklerin gereksinimler üzerindeki etkisidir. Diyelim ki sistem testinin son haftalarındasınız ve kullanıcı kabul testlerinin iki hafta içinde çalışmaya başlaması planlanıyor. Aniden kullanıcılarınız, "Bu arada, sistemin bunu farklı şekilde yapmasını istiyoruz" diyor ve bu davranış şekli sistemi yapan kurumu veya kişiyi  zor durumda bırakıyor. Test tasarımı eylemi sitemin gerçekte yapılması gerekenleri vurgular. Eğer, testler erkenden tasarlasaydı sorunlar sisteme yerleşmeden önlenebilirdi. Kullanıcıları hem gereksinimlere hem de testlere dahil etmek çok önemlidir. Burada ki örneğe göre, bir arabayı almadan önce onu kullanırız ve test sürüşüne çıkarız. Böylece, arabayı almadan önce hataları tespit edebilir ve zarardan kaçınabiliriz. Araba örneğinde olduğu gibi kullanıcılarda “Siz daha bilgili olduğunuz için bizim yerimize kabul testlerini yapın demezler ve sistemi kendileri test ederler.”

## EFSANE 2: Sistem var olmadan test yapmak mümkün değildir
“Henüz hiçbir şey inşa edilmediği için herhangi bir test yapamıyoruz. Testçiler sadece sistemle oynar ve ne olduğunu görür. Her neyse, bir kağıt parçasını test edemezsiniz.” Bu teoride yanlış olan üç şey vardır.
1. Test etmek sadece olanları görmekten fazlasıdır. Bu, bundan çok daha titiz ve sistematiktir.
2. Sadece testler koşumundan daha fazlasıdır. Politika ve stratejilerde gösterildiği gibi  testleri yürütmek ve sonuçları kontrol etmek temel test sürecinin bir parçasıdır, ancak başka önemli faaliyetler de mevcuttur. 
3. Eksiksizlik ve doğruluk için yazılı gereksinim belgelerini iş veya proje hedeflerine göre test edebilir ve etmelisiniz. Gereksinimleri kağıt üzerinde test etmezseniz, sistemde çok daha önce kolayca düzeltebileceğiniz hatalar oluşturacaksınız ve bunlar erken çözülmediği için “problem çözme” maliyeti giderek artacaktır.

## EFSANE 3: Gereksinimler testte kullanılır, ancak tersi kullanılmaz
"Gereksinimleri test etmiyorsunuz - onlardan test ediyorsunuz." Bir testçinin zihniyeti, bir geliştiricinin zihniyetinden farklıdır. Biraz muğlak ama sorun yok gibi görünen bir gereksinim yazmak oldukça kolaydır. Bununla birlikte, iyi test uzmanları bir gereksinim ifadesine baktığında belirsiz, çift anlamlı veya net olmayan gereksinimleri gidermek için özel test senaryoları tasarlarlar.

Birine soyut bir kavramı açıklamaya çalıştığınızda “mesela” diyorsunuz ve kavramı netleştirmek için fikri somut ve özel durumlarla gösteriyorsunuz. Testler, gereksinimler için “örnekler”dir. Kullanım senaryolarını veya iş senaryolarını "ya olursa" diye düşünün. Belirli bir kullanıcının sistemi nasıl kullanacağını düşünürseniz, ilk tanımlandığında soyut görünen sistem işlevselliği o kullanıcıya özel hale gelir. Hem test etme hem de gereksinim analizi, bu geri bildirim döngüsünün yerinde olmasından yararlanır. İyi gereksinim mühendisliği daha iyi testler üretir; iyi test analizi daha iyi gereksinimler üretir.

## EFSANE 4: Test yazmak zorsa, bu sadece bir test problemidir
"Testçiler, gereksinimlerimizden test yazarken sorun yaşıyor gibi görünüyor - belki daha iyi testçiler almalıyız." Bir testçinin bakış açısından tüm gereksinimler eşit yaratılmamıştır. Bazıları için testler belirlemek kolaydır; diğerleri için, sistemin tam olarak ne yapması gerektiğini belirlemek (ve böylece bunları yapabileceğini doğrulamak için testleri belirlemek) bir kabustur.

Kullanılabilirlik veya performans gibi test edilebilir işlevsel olmayan gereksinimleri belirlemek zordur. Kullanımı kolay, kullanıcı dostu, çok güvenilir veya kabul edilebilir performans gibi ifadeler spesifikasyonlar değildir: belirsiz niyetlerdir. Tom Gilb'in yasasına katılıyorum: “Herhangi bir ölçüm yöntemi onu hiç ölçmemekten daha üstündür.” Bir gereksinim mükemmel bir şekilde değil, faydalı bir şekilde ölçülebilir hale getirilmeli.

## EFSANE 5: Gereksinimlerdeki küçük değişiklikler projeyi (çok) etkilemez 
“Bu giriş alanına birkaç boşluk daha ekleyin. Ekranda çok yer var. Bu küçük bir değişiklik; Çok küçük olduğu için test etmenize gerek kalmayacak.” Gereksinimler açısından küçük görünen bir değişiklik, özellikle testlerde geniş kapsamlı bir etkiye sahip olabilir. Bir alana iki karakter daha eklemenin, bu alanın tanımlandığı veritabanının yeniden düzenlenmesi gerektiği anlamına geldiğini varsayalım. Bu alan, sistemin başka bir yerinde tutulan benzer bilgilere karşılık geliyorsa ne olur? Ya bu alanı kontrol eden rutinler, uzunluğunu artırmadığınız diğer alanları da kontrol ederse? Şimdi iki kontrol rutinine mi ihtiyacınız var?

Sistemin şu anda bu değişiklikten etkilenen her durumda doğru şeyi yaptığını doğrulamak için tüm bu değişiklikleri test etmelisiniz. Ayrıca bazı beklenmedik yan etkiler ortaya çıkabilir, bu nedenle sistemin başka hiçbir alanda gerilemediğinden emin olmak için regresyon testi de yapmalısınız. Ne kadar test yapacağınız, sistem üzerinde hem bilinen hem de bilinmeyen etkileri olan bir değişikliğin risklerine bağlıdır. Test, bu tür etkilerin düşük olduğuna dair güven vererek değişiklik riskinin azaltılmasına da yardımcı olabilir.

## EFSANE 6: Testçilerin gerçekten gereksinimlere ihtiyacı yoktur
"Bu sistem için iyi gereksinimlerimiz olmadığını biliyorum, ancak elinizden geldiğince test edin - sistemin ne yaptığını görün." Bir testçinin işi, bir sistemin ne yaptığı ve ne yapması gerektiği arasında karar vermektir. Sistem, işletmenin bir hedefe ulaşmasına yardımcı olmalıdır, bu nedenle sistemin gerçekte yaptığı şey bu hedeflerle karşılaştırılmalıdır.

Testte bir kahin varsayımı vardır. Kahin varsayımı, test edenin rutin olarak doğru cevabın ne olması gerektiğini bildiğini belirtir ki bu test için temeldir. Bir test, test girdilerini, ön koşulları ve beklenen sonuçları içerir. Beklenen sonucun ne olması gerektiğini nereden biliyorsunuz? Testçilerin gereksinimlere ihtiyacı var; Aksi takdirde, bunun gerçekten bir test olmadığını iddia edebilirsiniz.

## EFSANE 7: Testçiler gereksinimler olmadan test faaliyetini yürütemez.
"Gereksinimler testlerin temelini oluşturduğundan, açıkçası yeterli gereksinimlerimiz olana kadar herhangi bir test yapamayız." Bu aynı zamanda yaygın bir testçinin yanılgısıdır. Bazen gereksinimlerin yetersiz olduğu veya hiç olmadığı sistemlerde değişiklikler yapılır. Bu, testi daha zor hale getirir, ancak ellerinizi havaya kaldırıp yapamayacağınızı söylememelisiniz.

Gereksinimler olmadan, testçiler hala bir tür test kahinine ihtiyaç duyarlar - belki sistemin çalışma şekline, eski sisteme, kullanım kılavuzlarına veya testçinin kendi fikirlerine aşina olan kullanıcılar. Sistemi test kahini test ederse ne olur? Bir sistemi yalnızca bir belgeyle karşılaştırmak yerine, test edenler sistemi ne yapması gerektiğine dair kendi kişisel görüşlerine göre yargılarlar. (Aslında, testçiler her zaman bunun bir kısmını yapmalıdır, ama bu başka bir hikaye.)

Bazıları, bir spesifikasyon olmadan, test etmediğinizi, sadece sistemi keşfettiğinizi söyleyebilir. Bu, yetersiz gereksinimler ve ciddi zaman baskısı olan durumlar için tasarlanmış keşif testi olarak bilinen yaklaşımda resmileştirilmiştir.

Test uzmanlarının daha iyi gereksinimler üretmek için sunacak çok fazla bilgisi ve tecrübesi vardır. Pratikte bu bilgiden ve tecrübeden yararlanmak için;
1. Test uzmanlarını gereksinim gözden geçirmelerine(review) ve incelemelerine(inspection) katılmaya davet edin
2. Gereksinim analizine paralel olarak test faaliyetlerini planlamaya başlayın
3. Gereksinimler spesifikasyonunda örnek olarak kullanmak için örnek test koşulları ve test senaryoları isteyin
4. Gereksinimleri analiz ederken aklınızdaki özel durumları gereksinimlere not ekleyin
5. Sistemin nasıl çalışması gerektiğine dair örnek iş senaryolarını ve kullanım durumları belirtin
6. Hem işlevsel hem de işlevsel olmayan gereksinimler için ölçülebilir kriterler belirleyin

Test etmek iki şekilde zorlayıcıdır: Bu ödüllendirici bir entelektüel aktivitedir, ancak aynı zamanda testlerin dayandığı her şeye meydan okur. Gereksinimler ve test arasındaki bağlantıyı kurun. Test uzmanlarının gereksinimlerine getirdiği zorlukları kabul eder ve teşvik ederseniz, bu yanlış anlamalardan kaçınacak ve önemli ölçüde daha iyi gereksinimler ve testler elde edeceksiniz.

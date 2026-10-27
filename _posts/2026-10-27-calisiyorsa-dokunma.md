---
title: "Çalışıyorsa Dokunma: Bir Mühendislik İlkesi Değil, Bir İtiraf"
subtitle: "If It Ain't Broke, Don't Fix It: Why It Is the Wrong Rule"
background: "/img/posts/calisiyorsa-dokunma-cover.webp"
date: '2026-10-27 09:00:00'
layout: post
lang: tr
mermaid: true
categories: [yazilim]
tags: [yazilim-muhendisligi, yazilim-tasarimi]
---

Her ekipte en az bir tane vardır: on beş yıl önce yazılmış, yazanı çoktan şirketten ayrılmış, kimsenin tam olarak anlamadığı ama "çalışan" bir modül. Yeni gelen biri o dosyayı açtığında birisi mutlaka uyarır: "Oraya dokunma, çalışıyor." Uyarı kulaktan kulağa yayılır, modülün etrafına görünmez bir çit çekilir. Yıllar içinde etrafındaki her şey değişir; o modül değişmez. Ta ki bir gün bir derleyici güncellemesi, yeni bir müşteri, bir güvenlik açığı ya da artan veri hacmi onu zorla açtırana kadar. O gün geldiğinde, modülü bilen kimse kalmamıştır.

"If it ain't broke, don't fix it" sözü ABD'de 1977'de, Carter yönetiminin bütçe direktörü Bert Lance'in *Nation's Business* dergisine verdiği demeçle yaygınlaştı. Lance'in kastı, bürokrasinin bozuk olmayan şeyleri düzeltmeye uğraşırken bozuk olanları ihmal etmesiydi. Söz yazılım dünyasına "çalışıyorsa dokunma" olarak girdi ve zamanla bir mühendislik ilkesi kılığına büründü.

Bu yazının tezi şu: **"Çalışıyorsa dokunma" bir ilke değil, bir itiraftır.** Söyleyen kişi aslında şunu söyler: *Bu sistemin nasıl çalıştığını bilmiyorum ve bir şeyi değiştirirsem neyin bozulacağını öğrenmenin bir yolu yok.* Sorun değişiklikte değil, bilgisizliktedir. Çaresi de dokunmamak değil, dokunmayı güvenli ve ucuz hâle getirmektir.

---

## Önce Sözün Hakkını Verelim

Bu söz boşuna bu kadar yaygın değil. Neredeyse her mühendisin bir hikâyesi vardır: "küçük bir temizlik" yaparken üretimi durduran bir değişiklik, düzeltilen bir hatanın açtığı iki yeni hata, cuma akşamı yapılan bir refactoring yüzünden bütün hafta sonu süren bir arıza. Test kapsamı zayıfsa, teslim tarihi yakınsa ve sistemi bilen kimse yoksa, dokunmamak kısa vadede gerçekten de en az riskli seçenek gibi görünür.

Bu sezginin daha saygın bir akrabası da var: **Chesterton'ın çiti.** G. K. Chesterton 1929'da yazdığı *The Thing* kitabında, yolun ortasına çekilmiş bir çiti görüp "bunun hiçbir işe yaradığını görmüyorum, kaldıralım" diyen bir reformcuyu anlatır. Daha akıllı reformcunun cevabı kabaca şudur: "Neye yaradığını görmüyorsan, kaldırmana izin vermem. Git ve düşün. Neden orada olduğunu bulup gelince, belki yıkmana izin veririm."

Bu hikâye çoğu zaman "çalışıyorsa dokunma"nın kanıtı olarak anılır. Oysa dikkatli okununca tam tersini söyler. Chesterton "çite dokunma" demiyor; **"önce anla, sonra karar ver"** diyor. Çitin neden orada olduğunu öğrenmek bir ön koşul, sonsuz bir yasak değil. "Çalışıyorsa dokunma" ile Chesterton'ın çiti arasındaki fark, korku ile bilgi arasındaki farktır: biri öğrenmeye çağırır, diğeri öğrenmekten kaçmayı meşrulaştırır.

## "Çalışıyor" Bir Durum Değil, Bir Anlık Görüntüdür

"Çalışıyor" dediğimizde aslında "bugün, bu koşullarda, bildiğimiz kadarıyla çalışıyor" demiş oluruz. Kod değişmese bile etrafındaki dünya değişir: derleyici yeni bir sürüme geçer, işletim sistemi bir API'yi kaldırır, bağımlılıklarda güvenlik açığı bulunur, donanım değişir, kullanıcı sayısı on katına çıkar, veri tipleri taşar. Yazılım dünyasında buna çürüme (*software rot*, *bit rot*) denir; ilginç olan, çürümenin kodun kendisinde değil, kod ile çevresi arasındaki uyumda gerçekleşmesidir.

Meir Lehman bunu 1970'lerde IBM'in OS/360 işletim sisteminin evrimini incelerken gözlemledi ve yasalara döktü. İkisi bu yazının konusunu doğrudan özetliyor:

- **Sürekli değişim:** Gerçek dünyada kullanılan bir sistem ya sürekli uyarlanır ya da giderek daha az tatmin edici hâle gelir.
- **Artan karmaşıklık:** Sistem evrildikçe, karmaşıklığı korumak ya da azaltmak için bilinçli bir iş yapılmadıkça karmaşıklığı artar.

Tarih "çalışan" sistemlerin bir anda çalışmayı bırakmasıyla dolu:

- **Ariane 5 (1996).** İlk uçuşta, ana motorun ateşlenmesinden yaklaşık 37 saniye sonra roket rotasından çıktı ve parçalandı. Sebep, Ariane 4'ten aynen alınan ataletsel referans yazılımındaki 64 bit kayan noktadan 16 bit işaretli tamsayıya yapılan korumasız bir dönüşümdü. Ariane 5'in yatay hızı Ariane 4'ünkünden beş kat hızlı artıyordu ve değişken taştı. Soruşturma raporu iki ayrıntının altını çizer. Birincisi: taşmanın yaşandığı hizalama fonksiyonunun kalkıştan sonra Ariane 5'te hiçbir işlevi yoktu, ama "ortaklık nedeniyle" (*for commonality reasons*) korunmuştu. İkincisi: Ariane 5'in uçuş yörüngesi verisi bilinçli bir kararla yazılımın gereksinimlerine ve testlerine dahil edilmemişti. Yazılım Ariane 4'te çalışıyordu; kimse onun Ariane 5'te de çalışacağını kanıtlamadı. (Sayısal dönüşümlerin başka tuzakları için: [Kayan Nokta Sayılarının Tehlikeleri]({% post_url 2026-03-25-kayan-nokta-sayilarinin-tehlikeleri %}).)
- **Log4Shell (2021).** Java dünyasının en yaygın loglama kütüphanesi Log4j'ye 2013'te eklenen bir özellik, sekiz yıl sonra internetin en kritik açıklarından biri olarak ortaya çıktı. Pek çok kurum o kütüphaneyi kullandığını bile bilmiyordu; bilenler de "çalışıyor" diye yıllardır güncellememişti.
- **2038 problemi.** 32 bit işaretli `time_t` kullanan her sistem 19 Ocak 2038'de taşacak. Bugün kusursuz çalışan bu kodun, aslında tarihi belli bir son kullanma etiketi var.

Bu örneklerin ortak noktası şu: hiçbirinde kod "bozulmadı." Değişen dünyaydı. Değişmeyen sistem ise bu yüzden kırıldı.

## Korkunun Gerçek Kaynağı: Bilmemek

"Oraya dokunma" diyen mühendise "neden?" diye sorun. Cevap neredeyse hiçbir zaman "çünkü bu modülün şu davranışı kritik ve şu testler onu koruyor" olmaz. Cevap genellikle "ne olacağını bilmiyoruz"dur. Açık konuşalım: bu söz, ne yaptığını bilmeyen ve bu yüzden korkan bir mühendisin kendini koruma refleksidir. Korkunun kendisi utanılacak bir şey değil. Sorun, korkuyu bir ilkeye dönüştürüp sistemin etrafına çit olarak çekmektir.

Michael Feathers, *Working Effectively with Legacy Code* kitabında eski kodu (*legacy code*) yaşıyla değil, tek bir ölçütle tanımlar: **testi olmayan kod.** Ne kadar yeni, ne kadar temiz yazılmış olursa olsun, testi olmayan kod eski koddur; çünkü onu değiştirdiğinizde bir şeyi bozup bozmadığınızı bilemezsiniz. Bu tanımla bakınca, değişiklik korkusu bir karakter zayıflığı değil, bir **sinyaldir**. Sistemin şunlarından en az birinin eksik olduğunu söyler:

- Davranışı sabitleyen otomatik testler
- Kodun neden böyle yazıldığını anlatan belge veya izlenebilirlik
- Bilginin birden fazla kişiye yayılmış olması
- Üretimde ne olduğunu gösteren loglar ve metrikler (gözlemlenebilirlik)

Doğru tepki korkuyu bastırıp kör bir cesaretle değişiklik yapmak da değildir, korkuya boyun eğip sistemi dondurmak da. Doğru tepki, korkunun kaynağını kurutmaktır. Feathers'ın bunun için önerdiği araç **karakterizasyon testidir** (*characterization test*): kodun ne yapması *gerektiğini* değil, bugün *ne yaptığını* kayda geçiren test.

```cpp
// 2011'den kalma, yazanı ayrılmış, belgesi olmayan fonksiyon.
double komisyon_hesapla(double tutar, int musteri_tipi);

// Karakterizasyon testi: "doğru" davranışı değil, BUGÜNKÜ davranışı kayda geçirir.
// Beklenen değerleri tahmin etmeyin. Önce bilerek yanlış bir değer yazın,
// testi çalıştırın; hata mesajı size kodun gerçekte ne döndürdüğünü söyler.
TEST(KomisyonKarakterizasyon, BugunkuDavranis)
{
    EXPECT_DOUBLE_EQ(komisyon_hesapla(1000.0, 1), 15.0);
    EXPECT_DOUBLE_EQ(komisyon_hesapla(1000.0, 2), 12.5);

    // Sürpriz: sıfır tutarda bile 5 TL alınıyor.
    EXPECT_DOUBLE_EQ(komisyon_hesapla(0.0, 1), 5.0);

    // Tanımsız müşteri tipi sessizce tip 1 gibi hesaplanıyor.
    EXPECT_DOUBLE_EQ(komisyon_hesapla(1000.0, 7), 15.0);
}
```

Bu küçük test iki iş görür. Birincisi, fonksiyonun bugünkü davranışını sabitler; artık yapılan bir değişiklik bu davranışı bozarsa bunu üretimde değil, derleme makinesinde öğrenirsiniz. İkincisi, sizi Chesterton'ın sorusuna götürür: sıfır tutarda alınan 5 TL bir hata mı, yoksa bir iş kuralı mı? Cevabı bulduğunuzda çitin neden orada olduğunu da öğrenmiş olursunuz. Korku, yerini bilgiye bırakır.

## Dokunulmayan Sistemin Bedeli: Bileşik Faiz

Ward Cunningham'ın teknik borç benzetmesinin en önemli kısmı faizdir. Borcu ödemediğiniz her gün faiz işler. "Çalışıyorsa dokunma" kuralı borcu ödememeyi bir politika hâline getirir.

Burada gözden kaçan bir ayrıntı var: bu kural pratikte hiçbir zaman "hiç dokunma" olarak uygulanmaz. Yeni özellik eklemek serbesttir; acil hata düzeltmesi serbesttir. Yasak olan yalnızca iyileştirmektir. Sonuç Lehman'ın ikinci yasasının ta kendisidir: sisteme sürekli bir şeyler eklenir, ama karmaşıklığı azaltacak iş hiç yapılmaz. Her yeni özellik bir öncekinden biraz daha pahalıya mal olur.

Faizin farklı biçimlerde ödendiğini gerçek örneklerde görmek mümkün:

**Bilgi buharlaşır.** Nisan 2020'de, pandeminin ilk haftalarında işsizlik başvuruları patlayınca New Jersey Valisi Phil Murphy, eyaletin 40 yıllık ana bilgisayar sistemleri için COBOL bilen gönüllü aradı. Sorun COBOL'un kendisi değildi; dil bugün de bankacılığın önemli bir kısmını taşıyor. Sorun, on yıllardır dokunulmayan bir sistemin bilgisinin onu bilen insanlarla birlikte emekli olmasıydı. Kimsenin dokunmadığı bir sistemi zamanla kimse bilmez.

**Ölü kod mayına dönüşür.** 1 Ağustos 2012'de Knight Capital'in otomatik emir yönlendirme sistemi, borsa açıldıktan sonraki 45 dakikada 212 müşteri emrini karşılamaya çalışırken piyasaya 4 milyondan fazla emir gönderdi; şirket 460 milyon dolardan fazla zarar etti ve kısa süre sonra bağımsızlığını kaybetti. SEC'in raporu zincirin nerede başladığını açıkça yazar: Knight, "Power Peg" adlı bir işlevi 2003'te kullanmayı bırakmış ama kodu üretim sunucularında bırakmayı seçmişti. 2005'te Power Peg'in kullandığı kümülatif miktar takibini kodun başka bir noktasına taşımış, ama Power Peg'i yeniden test etmemişti. 2012'de yeni bir özellik eski Power Peg bayrağını yeniden kullandı ve elle yapılan dağıtımda sekiz sunucudan biri atlandı. Yeni bayrak, o sunucuda dokuz yıldır uyuyan kodu uyandırdı. Buradaki ders iki yönlüdür ve ikisi de aynı yere çıkar: ölü kodu "dokunmayalım" diye bırakmak mayın döşemekti; o mayına testsiz ve elle yapılan bir değişiklikle basmak ise patlamaydı.

**Ertelenen modernizasyonun faturası bir gün gelir.** Aralık 2022'de bir kış fırtınası ABD'deki bütün havayollarını etkiledi; ama diğerleri birkaç günde toparlanırken Southwest Airlines toparlanamadı. Şirket, uçakları müsait olmasına rağmen ekipleri uçaklarla eşleştirme işini teknolojisinin kaldıramadığını ve planlamacıların bunu elle yapmak zorunda kaldığını açıkladı. Pilot sendikası, ekip planlama teknolojisinin ve süreçlerin eskidiğini yıllardır dile getirdiklerini ve uyarıların görmezden gelindiğini söyledi. Sonuç: 16.900'ü aşkın iptal edilen uçuş, 2 milyonu aşkın etkilenen yolcu ve ABD Ulaştırma Bakanlığı'nın tüketici koruma alanında bir havayoluna verdiği en büyük ceza olan 140 milyon dolar.

**Çürüme yayılır.** Hunt ve Thomas, *The Pragmatic Programmer*'da "kırık camlar" teorisini yazılıma uygular: tamir edilmeyen tek bir kırık cam, binanın terk edildiği mesajını verir ve daha fazlasını davet eder. Kimsenin dokunmaya cesaret edemediği modülün etrafında da aynısı olur. Geçici çözümler, kopyala-yapıştır kodlar ve "şimdilik böyle kalsın" yorumları birikir, çünkü asıl sorunun kaynağına zaten girilemez.

## Kırılgan Değil Esnek: Değiştirilebilirlik Bir Tasarım Niteliğidir

[Antikırılgan]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %}) yazısında, bazı sistemlerin küçük ve düzenli stresle güçlendiğinden bahsetmiştik. Kas ağırlıkla, bağışıklık denetimli maruziyetle gelişir. Taleb bunu hormesis kavramıyla anlatır. Yazılım sistemleri de bu açıdan şaşırtıcı ölçüde canlılara benzer: düzenli olarak küçük değişikliklere maruz kalan bir sistem "formda" kalır. Derleme süreci çalışır durumdadır, testler günceldir, ekip kodu tanır, dağıtım bir rutindir. Hiç sarsılmayan sistem ise ilk büyük değişiklikte kırılır, çünkü değişikliği taşıyacak kasları çoktan körelmiştir.

Martin Fowler bunu en sevdiği sözlerden biriyle özetler: **"Acıtıyorsa, daha sık yap."** (*If it hurts, do it more often.*) Büyük ve seyrek değişiklikler zordur ve hataya açıktır. Küçük ve sık değişiklikler hem kolaydır hem de hızlı geri bildirim verir; tekrar ettikçe süreç pürüzsüzleşir ve otomasyona elverişli hâle gelir. Bu bir slogan olarak kalmadı: DORA ekibinin yıllardır süren araştırmaları (*Accelerate* kitabı ve *State of DevOps* raporları) aynı sonucu tekrar tekrar gösteriyor. Sık dağıtım yapan ekipler, değişiklik kaynaklı hata oranında ve hatadan toparlanma süresinde de daha iyi. Hız ile kararlılık birbirinin alternatifi değil; birbirini besliyor.

İki yaklaşımın zamanla nereye götürdüğünü iki döngü olarak çizebiliriz:

<div class="mermaid">
flowchart TB
    subgraph K["Çalışıyorsa dokunma"]
      direction LR
      K1["Dokunulmaz"] --> K2["Bilgi<br/>buharlaşır"]
      K2 --> K3["Korku<br/>artar"]
      K3 --> K4["Değişiklik<br/>pahalanır"]
      K4 --> K1
    end
    subgraph E["Sürekli iyileştirme"]
      direction LR
      E1["Küçük<br/>değişiklik"] --> E2["Test ve<br/>öğrenme"]
      E2 --> E3["Güven<br/>artar"]
      E3 --> E4["Değişiklik<br/>ucuzlar"]
      E4 --> E1
    end
    K ~~~ E
    style K fill:#fdf0f0,stroke:#c0392b,stroke-width:2px
    style E fill:#eef8ee,stroke:#2e7d32,stroke-width:2px
    style K3 fill:#f5cccc,stroke:#c0392b,stroke-width:2px
    style E3 fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
</div>

Soldaki döngü kendini besleyen bir kısır döngüdür: dokunulmadıkça bilgi kaybolur, bilgi kayboldukça korku büyür, korku büyüdükçe değişiklik daha da pahalı ve riskli görünür. Sağdaki döngü de kendini besler, ama ters yönde. İki döngünün başlangıç noktası aynı koddur; aradaki fark, ilk adımda verilen karardır.

Değiştirilebilirliği belirleyen tek şey ekip alışkanlıkları da değildir; mimari de en az onun kadar belirleyicidir. [Coupling'i Dengelemek]({% post_url 2026-06-04-coupling-dengesi %}) yazısında anlattığımız gibi, bir değişikliğin ne kadar uzağa yayılacağını bileşenler arasındaki bağların gücü ve mesafesi belirler. Sıkı ve uzak bağlarla örülmüş bir sistemde her değişiklik gerçekten tehlikelidir ve "dokunma" refleksi bu tasarımın doğal bir sonucudur. Esnek bir tasarım, değişikliğin etkisini sınırlar ve dokunmayı yeniden güvenli kılar.

İki tutumu yan yana koyalım:

| | "Çalışıyorsa dokunma" | "Sürekli iyileştirme" |
|---|---|---|
| **Değişikliğe bakış** | Risk kaynağı, kaçınılacak bir olay | Rutin; küçük ve geri alınabilir bir iş |
| **Testin rolü** | Yok, ya da büyük sürümden önce elle | Değişikliğin ön koşulu; her committe otomatik |
| **Bilgi nerede?** | Birkaç kişinin kafasında | Testlerde, kodda, belgede |
| **Risk ne zaman ödenir?** | Ertelenir, birikir, en kötü anda tek seferde | Küçük taksitlerle, her gün |
| **Zamanla sistem** | Kırılganlaşır | Esnekleşir |

## Nasıl? Sürekli İyileştirmenin Pratikleri

Sürekli iyileştirme büyük bir proje değil, günlük bir alışkanlıktır. Bunu mümkün kılan pratiklerin hiçbiri yeni değil:

- **İzci kuralı.** Robert C. Martin'in *Clean Code*'da yaygınlaştırdığı kural: kamp alanını bulduğundan daha temiz bırak. Bir dosyaya bir hata düzeltmek için girdiysen, çıkarken bir değişkenin adını düzelt, bir fonksiyonu böl, bir test ekle. Tek tek önemsiz görünen bu adımlar, toplamda çürümenin tersine işleyen bir kuvvet oluşturur.
- **Küçük adımlarla refactoring.** Fowler'ın *Refactoring* kitabındaki tanımıyla refactoring, dışarıdan görünen davranışı değiştirmeden iç yapıyı iyileştirmektir. Anahtar kelime "küçük"tür: her adım derlenir, testler geçer, istenirse geri alınır. Büyük bir yeniden düzenleme, aslında arka arkaya yapılmış yüzlerce küçük ve güvenli adımdır.
- **Önce test.** Testi olmayan koda dokunmadan önce karakterizasyon testleriyle bugünkü davranışı sabitleyin. Ardından otomatik regresyon ve sürekli entegrasyon (CI) her değişikliği aynı güvenlik ağından geçirsin.
- **Güvenli dağıtım.** Feature flag ile yeni davranışı kodla birlikte değil, ayrı olarak açın. Kademeli dağıtım (*canary*) ile önce küçük bir kitleye sunun. Geri almayı tek bir komuta indirin. Knight Capital'in sekiz sunucusundan birini atlayan elle dağıtım, otomasyonun neden bir lüks olmadığını hatırlatır.
- **Bağımlılıkları düzenli güncelleyin.** Beş yıl bekleyip üç ana sürüm birden atlamak korkutucudur ve haklı olarak korkutucudur. Her ay küçük güncellemeler yapmak ise sıkıcıdır; iyi mühendislik çoğu zaman sıkıcıdır. Dependabot veya Renovate gibi araçlar bu işi rutine çevirir.
- **Kaizen ve retrospektif.** Japon üretim kültüründen gelen *kaizen*, iyileştirmeyi ara sıra yapılan bir kampanya olmaktan çıkarıp herkesin her gün yaptığı bir iş hâline getirir. Yazılımda bunun karşılığı, sprint sonundaki retrospektiflerden çıkan küçük ama gerçekten uygulanan iyileştirmelerdir.

## Aviyonikten Bir Ders: Uçak Uçuyor Diye Bakımı Yapılmaz mı?

Emniyet-kritik alanda çalışan bir okur burada itiraz edebilir: "Bizde durum farklı. Sertifikalı bir yazılımda her değişiklik yeniden doğrulama, yeniden belge, belki yeniden sertifikasyon demek. Biz gerçekten dokunamayız." Bu itiraz ciddiye alınmalı. Ama havacılığın kendisine bakınca, cevabın "dokunma" olmadığı görülür.

Hiçbir havayolu "uçuyorsa dokunma" demez. Her ticari uçak, uçuş saatine ve döngü sayısına bağlı olarak planlanmış A, B, C ve D bakımlarından geçer; bazı parçaların ömrü dolmadan değiştirilir, bazıları düzenli olarak muayene edilir. Bu bakım programlarının arkasındaki düşünce de ilginç bir hikâyeye sahiptir.

1960'lı ve 70'li yıllarda United Airlines'ta F. Stanley Nowlan ve Howard Heap, uçak parçalarının arıza verilerini incelediler ve 1978'de *Reliability-Centered Maintenance* (RCM) raporunu yayımladılar. Bulguları o dönemin sezgisine ters düşüyordu: parçaların büyük çoğunluğu yaşlandıkça aşınan bir arıza profili göstermiyordu ve bazı periyodik revizyonlar, sökme-takma sırasında giren hatalar ve erken dönem arızaları (*infant mortality*) yüzünden güvenilirliği artırmak yerine düşürüyordu.

İlk bakışta bu, "çalışıyorsa dokunma"nın bilimsel kanıtı gibi duruyor. Ama RCM'nin vardığı sonuç dokunmamak değildi. Sonuç, **ne zaman ve nasıl dokunulacağına arıza modlarını bilerek karar vermekti**: kimi parça için durum izleme (*condition monitoring*), kimi için düzenli muayene, kimi için ömür sınırı. Arızasının emniyete etkisi olmayan, ucuz ve kolay değiştirilen parçalar için ise bilinçli olarak "arızaya kadar çalıştır" (*run-to-failure*). Bugün havayollarının bakım programlarını oluşturduğu MSG-3 yöntemi bu düşünceye dayanır. Kör revizyon da kör dokunmamak da aynı hatanın iki yüzüdür: sistemi tanımadan karar vermek. "Çalışıyorsa dokunma", "arızaya kadar çalıştır" stratejisini düşünmeden, her parçaya, emniyet-kritik olanlar dahil uygulamaktır.

Yazılım tarafında da durum aynıdır. DO-178C "dokunma" demez; "**kanıtlayarak dokun**" der. Değişiklik etki analizi, regresyon testleri, konfigürasyon yönetimi ve izlenebilirlik, değişikliği yasaklamak için değil, değişikliği güvenle yapabilmek için vardır. Sertifikalı yazılımda değişikliğin pahalı olduğu doğrudur. Ama bu gerçek, dokunmamayı değil, **değişikliği ucuzlatan yatırımı** haklı çıkarır: otomatik çalışan gereksinim tabanlı testler, araçla üretilen izlenebilirlik matrisleri, tekrar üretilebilir derleme ortamları. Ariane 5'in dersi de buydu: bir yazılımı yeni bir bağlamda yeniden kullanmak, onu yeniden doğrulamadan "çalışıyor" saymak demek değildir.

## Sınırlar: Bu, "Her Şeyi Değiştir" Demek Değil

Bu yazı bir değişiklik övgüsü olarak okunmamalı. Sürekli iyileştirmenin de yanlış anlaşılan biçimleri var.

**Değişiklik için değişiklik.** Her yıl yeni bir çatıya (*framework*) geçmek, sırf modası geçti diye çalışan bir kütüphaneyi değiştirmek ya da birinin kişisel zevkine göre kodu baştan biçimlendirmek iyileştirme değildir. İyileştirme, değiştirmeyi kolaylaştıran, riski azaltan ya da anlamayı artıran değişikliktir. Ölçüt, sistemin yarın bugünden daha kolay değiştirilebilir olup olmadığıdır.

**Sıfırdan yeniden yazım.** "Bu kod çok kötü, baştan yazalım" fikri, "çalışıyorsa dokunma"nın ters yüzüdür ve en az onun kadar tehlikelidir. Joel Spolsky'nin 2000 yılında yazdığı "Things You Should Never Do" yazısındaki örnek hâlâ geçerlidir: Netscape tarayıcısını sıfırdan yazmaya karar verdi ve yeni sürümü çıkarana kadar geçen yaklaşık üç yıl boyunca pazarı kaybetti. Eski kod çirkin olabilir, ama içinde yıllarca toplanmış hata düzeltmelerini, kenar durumları ve Chesterton'ın çitlerini taşır. Sürekli iyileştirme büyük bir patlama değil, küçük ve geri alınabilir adımlar dizisidir.

**Bilinçli dokunmama kararı.** Ömrünün sonuna gelmiş, birkaç ay içinde kapatılacak bir ürün; tek bir müşteri için dondurulmuş ve sözleşmeyle sabitlenmiş bir sertifikalı sürüm; ya da değiştirme maliyeti getirisini açıkça aşan bir yan araç. Bu durumlarda "dokunmuyoruz" demek meşru bir mühendislik kararıdır. RCM'deki "arızaya kadar çalıştır" stratejisinin yazılımdaki karşılığıdır.

Buradaki ayrım bütün yazının özetidir: **dokunmamaya karar vermek ile dokunamamak aynı şey değildir.** Birincisi sistemi tanıyan, riskleri tartan ve bir gerekçe yazan mühendisin kararıdır. İkincisi ise sistemi tanımayan ve tanımaktan kaçan mühendisin korkusudur. Dışarıdan bakınca ikisi aynı görünür: kod değişmez. Ama birinin arkasında bilgi, diğerinin arkasında bilgisizlik vardır.

## Sonuç

"Çalışıyorsa dokunma" sözünün çekiciliği basitliğinden gelir. Ama basitliği aldatıcıdır, çünkü "çalışıyor" kalıcı bir durum değil, değişen bir dünyada alınmış bir anlık görüntüdür. Dokunulmayan sistem durmaz; sessizce çürür. Bilgisi buharlaşır, bağımlılıkları eskir, ölü kodları mayına dönüşür. Sonunda dokunmak zorunda kalındığında da bunu en kötü anda, en az bilgiyle ve en yüksek riskle yapmak gerekir.

Önerim, sözü atmak değil, onu tamamlamak:

> **Çalışıyorsa anla, test et, iyileştir.**

Bir sistemin kalitesi, bugün çalışıp çalışmadığıyla değil, yarın ne kadar kolay ve ne kadar güvenle değiştirilebildiğiyle ölçülür. Kırılgan sistemler değişiklikten korkar. Esnek sistemler değişiklikle ayakta kalır.

---

## Kaynaklar

- M. M. Lehman — "Programs, Life Cycles, and Laws of Software Evolution", *Proceedings of the IEEE*, 68(9), 1980. Genel bakış: [Lehman's laws of software evolution (Wikipedia)](https://en.wikipedia.org/wiki/Lehman%27s_laws_of_software_evolution)
- Michael Feathers — *Working Effectively with Legacy Code*, Prentice Hall, 2004.
- Martin Fowler — *Refactoring: Improving the Design of Existing Code*, 2. baskı, Addison-Wesley, 2018.
- Martin Fowler — [Frequency Reduces Difficulty](https://martinfowler.com/bliki/FrequencyReducesDifficulty.html), 2011.
- Andrew Hunt, David Thomas — *The Pragmatic Programmer*, Addison-Wesley, 1999.
- Robert C. Martin — *Clean Code*, Prentice Hall, 2008.
- Nicole Forsgren, Jez Humble, Gene Kim — *Accelerate*, IT Revolution, 2018. Ayrıca [DORA araştırmaları](https://dora.dev/).
- Jez Humble, David Farley — *Continuous Delivery*, Addison-Wesley, 2010.
- G. K. Chesterton — *The Thing*, 1929 ("The Drift from Domesticity" bölümü).
- F. S. Nowlan, H. F. Heap — *Reliability-Centered Maintenance*, United Airlines / ABD Savunma Bakanlığı, 1978 (AD-A066579).
- J. L. Lions vd. — [Ariane 5 Flight 501 Failure, Report by the Inquiry Board](https://www.cs.toronto.edu/~krj/courses/2307/disasters/ariane5rep.html), 1996.
- U.S. SEC — [Knight Capital Americas LLC, Release No. 34-70694](https://www.sec.gov/litigation/admin/2013/34-70694.pdf), 2013.
- Joel Spolsky — [Things You Should Never Do, Part I](https://www.joelonsoftware.com/2000/04/06/things-you-should-never-do-part-i/), 2000.
- RTCA/EUROCAE — DO-178C / ED-12C, *Software Considerations in Airborne Systems and Equipment Certification*, 2011.
- [Antikırılgan: Belirsizlikten ve Kaostan Güç Alan Sistemler]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %})
- [Coupling'i Dengelemek: Yazılım Tasarımında Bağımlılığı Yönetmek]({% post_url 2026-06-04-coupling-dengesi %})
- [Kayan Nokta Sayılarının Tehlikeleri]({% post_url 2026-03-25-kayan-nokta-sayilarinin-tehlikeleri %})

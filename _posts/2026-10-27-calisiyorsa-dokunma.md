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

Her ekipte bir tane vardır: yıllar önce yazılmış, yazanı çoktan ayrılmış, kimsenin tam olarak anlamadığı ama "çalışan" bir modül. Yeni gelen biri o dosyayı açtığında mutlaka uyarılır: "Oraya dokunma, çalışıyor." Modülün etrafına görünmez bir çit çekilir. Yıllar içinde etrafındaki her şey değişir; o modül değişmez. Ta ki bir derleyici güncellemesi, bir güvenlik açığı ya da yeni bir müşteri onu zorla açtırana kadar. O gün geldiğinde, modülü bilen kimse kalmamıştır.

Bu yazının tezi şu: **"Çalışıyorsa dokunma" bir ilke değil, bir itiraftır.** Söyleyen kişi aslında şunu söyler: *Bu sistemin nasıl çalıştığını bilmiyorum ve bir şeyi değiştirirsem neyin bozulacağını öğrenmenin bir yolu yok.* Sorun değişiklikte değil, bilgisizliktedir. Çaresi de dokunmamak değil, dokunmayı güvenli hâle getirmektir.

## Chesterton'ın Çiti "Dokunma" Demez

Sözün haklı bir tarafı var. Test kapsamı zayıfsa, teslim tarihi yakınsa ve sistemi bilen kimse yoksa, dokunmamak kısa vadede gerçekten en az riskli seçenek gibi görünür.

Bu sezgiye çoğu zaman Chesterton'ın çiti dayanak gösterilir. G. K. Chesterton 1929'da, yolun ortasındaki bir çiti işe yaramaz bulup kaldırmak isteyen bir reformcuyu anlatır. Akıllı cevap kabaca şudur: "Neye yaradığını bilmiyorsan kaldırmana izin vermem. Git, öğren; neden orada olduğunu anlatabildiğinde belki yıkarsın." Yani Chesterton "dokunma" demiyor; **"önce anla"** diyor. Biri öğrenmeye çağırır, diğeri öğrenmekten kaçmayı meşrulaştırır.

## "Çalışıyor" Bir Anlık Görüntüdür

"Çalışıyor" dediğimizde aslında "bugün, bu koşullarda, bildiğimiz kadarıyla çalışıyor" demiş oluruz. Kod değişmese de etrafındaki dünya değişir: derleyici, işletim sistemi, bağımlılıklar, donanım, veri hacmi. Meir Lehman bunu 1970'lerde bir yasaya dökmüştü: kullanılan bir sistem ya sürekli uyarlanır ya da giderek daha az işe yarar hâle gelir.

Ariane 5'in 1996'daki ilk uçuşu bunun en pahalı örneklerinden biridir. Roket, ateşlemeden yaklaşık 37 saniye sonra parçalandı. Ariane 4'ten aynen alınan ataletsel referans yazılımında, 64 bit kayan noktadan 16 bit tamsayıya yapılan korumasız bir dönüşüm taşmıştı; çünkü Ariane 5'in yatay hızı çok daha hızlı artıyordu. Taşmanın yaşandığı fonksiyonun kalkıştan sonra Ariane 5'te hiçbir işlevi yoktu; soruşturma raporunun ifadesiyle "ortaklık nedeniyle" korunmuştu. Yazılım Ariane 4'te çalışıyordu; kimse Ariane 5'te de çalışacağını kanıtlamadı.

Log4Shell da aynı hikâyedir: Log4j'ye 2013'te eklenen bir özellik, "çalışıyor" diye yıllarca güncellenmeyen sistemlerde sekiz yıl sonra kritik bir açığa dönüştü. Hiçbir örnekte kod bozulmadı. Değişen dünyaydı.

## Korku Bir Sinyaldir

"Oraya dokunma" diyen mühendise "neden?" diye sorun. Cevap neredeyse hiçbir zaman "şu davranış kritik ve şu testler onu koruyor" olmaz; cevap "ne olacağını bilmiyoruz"dur. Açık konuşalım: bu söz, ne yaptığını bilmeyen ve bu yüzden korkan bir mühendisin refleksidir. Korkunun kendisi ayıp değil. Sorun, korkuyu bir ilkeye dönüştürmektir.

Michael Feathers eski kodu (*legacy code*) yaşıyla değil, tek bir ölçütle tanımlar: **testi olmayan kod.** Bu tanımla bakınca değişiklik korkusu bir sinyaldir: test, belge ya da bilgiyi paylaşan ikinci bir kişi eksiktir. Doğru tepki korkuyu bastırmak da ona boyun eğmek de değil, kaynağını kurutmaktır.

Feathers'ın bunun için önerdiği araç karakterizasyon testidir: kodun ne yapması *gerektiğini* değil, bugün *ne yaptığını* kayda geçiren test. Bu testleri yazarken genellikle sürprizler çıkar: sıfır tutarda bile alınan bir komisyon, tanımsız bir girdiyi sessizce yutan bir varsayılan değer. Her sürpriz aslında Chesterton'ın sorusudur: bu bir hata mı, yoksa bir iş kuralı mı? Cevaplar bulundukça korku yerini bilgiye bırakır.

## Dokunulmayan Sistem Çürür

Ward Cunningham'ın teknik borç benzetmesinin asıl dersi faizdir: ödenmeyen borç büyür. Üstelik bu kural pratikte hiçbir zaman "hiç dokunma" olarak uygulanmaz. Yeni özellik eklemek serbesttir, acil yama serbesttir; yasak olan yalnızca iyileştirmektir. Sisteme sürekli bir şeyler eklenir, ama karmaşıklığı azaltacak iş hiç yapılmaz. Faiz farklı biçimlerde ödenir:

**Bilgi buharlaşır.** Nisan 2020'de, pandeminin ilk haftalarında işsizlik başvuruları patlayınca New Jersey Valisi Phil Murphy, eyaletin 40 yıllık ana bilgisayar sistemleri için COBOL bilen gönüllü aradı. Sorun dilin kendisi değildi; COBOL bugün de bankacılığın önemli bir kısmını taşıyor. Sorun, on yıllardır dokunulmayan bir sistemin bilgisinin onu bilen insanlarla birlikte emekli olmasıydı. Kimsenin dokunmadığı bir sistemi zamanla kimse bilmez.

**Ölü kod mayına dönüşür.** Knight Capital "Power Peg" adlı bir işlevi 2003'te kullanmayı bırakmış, ama kodu üretim sunucularında bırakmayı seçmişti. 2005'te Power Peg'in kullandığı kümülatif miktar takibini kodun başka bir noktasına taşımış, Power Peg'i yeniden test etmemişti. 2012'de yeni bir özellik eski Power Peg bayrağını yeniden kullandı; elle yapılan dağıtımda sekiz sunucudan biri atlandı ve o sunucuda dokuz yıldır uyuyan kod uyandı. SEC'in raporuna göre sonuç, 45 dakikada 460 milyon dolardan fazla zarardı. Ölü kodu "dokunmayalım" diye bırakmak mayın döşemekti; o mayına testsiz bir değişiklikle basmak ise patlamaydı.

**Ertelenen modernizasyonun faturası bir gün gelir.** Aralık 2022'de bir kış fırtınası ABD'deki bütün havayollarını vurdu; diğerleri birkaç günde toparlanırken Southwest Airlines toparlanamadı. Şirket, uçakları müsait olmasına rağmen ekipleri uçaklarla eşleştirme işini teknolojisinin kaldıramadığını, planlamacıların bunu elle yapmak zorunda kaldığını açıkladı. Pilot sendikası ise bu sistemin eskidiğini yıllardır söylediklerini ve uyarıların görmezden gelindiğini belirtti. Sonuç: 16.900'ü aşkın iptal edilen uçuş, 2 milyonu aşkın etkilenen yolcu ve ABD Ulaştırma Bakanlığı'nın tüketici koruma alanında bir havayoluna verdiği en büyük ceza olan 140 milyon dolar.

Hunt ve Thomas'ın "kırık camlar" benzetmesi de buraya oturur: tamir edilmeyen tek bir kırık cam, binanın terk edildiği mesajını verir. Kimsenin dokunmaya cesaret edemediği modülün etrafında da geçici çözümler, kopyala-yapıştır kodlar ve "şimdilik böyle kalsın" yorumları birikir.

## Kırılgan Değil Esnek

[Antikırılgan]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %}) yazısında bazı sistemlerin küçük ve düzenli stresle güçlendiğini anlatmıştık. Yazılım da böyledir: düzenli olarak küçük değişikliklere maruz kalan bir sistem formda kalır; hiç sarsılmayan sistem ilk büyük değişiklikte kırılır. Martin Fowler'ın sözüyle: **"Acıtıyorsa, daha sık yap."** DORA araştırmaları da bunu destekliyor: sık dağıtım yapan ekipler daha az değişiklik kaynaklı hata yaşıyor ve hatadan daha hızlı toparlanıyor. Hız ile kararlılık birbirini besliyor.

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

İki döngü de aynı koddan başlar; aradaki fark ilk adımda verilen karardır. Mimari de payına düşeni yapmalı. [Coupling'i Dengelemek]({% post_url 2026-06-04-coupling-dengesi %}) yazısında anlattığımız gibi, sıkı ve uzak bağlarla örülmüş bir sistemde "dokunma" refleksi tasarımın doğal sonucudur. Esnek bir tasarım, değişikliğin etkisini sınırlar ve dokunmayı yeniden güvenli kılar.

## Nasıl? Sürekli İyileştirmenin Pratikleri

Sürekli iyileştirme büyük bir proje değil, günlük bir alışkanlıktır. Bunu mümkün kılan pratiklerin hiçbiri yeni değil:

- **İzci kuralı.** Robert C. Martin'in *Clean Code*'da yaygınlaştırdığı kural: kamp alanını bulduğundan daha temiz bırak. Bir hatayı düzeltmek için girdiğin dosyadan çıkarken bir ismi düzelt, bir fonksiyonu böl, bir test ekle.
- **Küçük adımlarla refactoring.** Fowler'ın tanımıyla dışarıdan görünen davranışı değiştirmeden iç yapıyı iyileştirmek. Her adım derlenir, testler geçer, istenirse geri alınır.
- **Önce test.** Testi olmayan koda dokunmadan önce karakterizasyon testleriyle bugünkü davranışı sabitle; ardından sürekli entegrasyon her değişikliği aynı güvenlik ağından geçirsin.
- **Güvenli dağıtım.** Feature flag ile yeni davranışı koddan ayrı aç, kademeli dağıtımla (*canary*) önce küçük bir kitleye sun, geri almayı tek komuta indir. Knight Capital'in sekiz sunucudan birini atlayan elle dağıtımı, otomasyonun neden lüks olmadığını hatırlatır.
- **Bağımlılıkları düzenli güncelle.** Beş yıl bekleyip üç ana sürüm birden atlamak korkutucudur. Her ay küçük güncellemeler yapmak ise sıkıcıdır; iyi mühendislik çoğu zaman sıkıcıdır.
- **Kaizen ve retrospektif.** İyileştirmeyi ara sıra yapılan bir kampanya olmaktan çıkarıp herkesin her gün yaptığı bir iş hâline getir.

## Uçak Uçuyor Diye Bakımı Yapılmaz mı?

Emniyet-kritik alanda çalışan bir okur itiraz edebilir: "Sertifikalı yazılımda dokunamayız." Oysa hiçbir havayolu "uçuyorsa dokunma" demez. Nowlan ve Heap, United Airlines verileriyle hazırladıkları 1978 tarihli raporda, bazı periyodik revizyonların güvenilirliği artırmak yerine düşürdüğünü gösterdi. Vardıkları sonuç dokunmamak değil, arıza modlarını bilerek ne zaman ve nasıl dokunulacağına karar vermekti; bugünkü uçak bakım programları bu düşünceye dayanır. Kör bakım da kör dokunmamak da aynı hatadır: sistemi tanımadan karar vermek. DO-178C de "dokunma" demez, "kanıtlayarak dokun" der. Sertifikalı yazılımda değişikliğin pahalı olması dokunmamayı değil, değişikliği ucuzlatan yatırımı haklı çıkarır.

## Sınırlar: Bu, "Her Şeyi Değiştir" Demek Değil

Sürekli iyileştirmenin de yanlış anlaşılan biçimleri var.

**Değişiklik için değişiklik.** Her yıl yeni bir çatıya (*framework*) geçmek, sırf modası geçti diye çalışan bir kütüphaneyi değiştirmek ya da kodu birinin zevkine göre baştan biçimlendirmek iyileştirme değildir. Ölçüt, sistemin yarın bugünden daha kolay değiştirilebilir olup olmadığıdır.

**Sıfırdan yeniden yazım.** "Bu kod çok kötü, baştan yazalım" fikri, "çalışıyorsa dokunma"nın ters yüzüdür ve en az onun kadar tehlikelidir. Joel Spolsky'nin 2000'de anlattığı Netscape örneği hâlâ geçerli: tarayıcısını sıfırdan yazmaya karar veren şirket, yeni sürümü çıkarana kadar geçen yaklaşık üç yılda pazarı kaybetti. Eski kod çirkin olabilir, ama içinde yıllarca toplanmış hata düzeltmelerini ve Chesterton'ın çitlerini taşır.

**Bilinçli dokunmama kararı.** Birkaç ay içinde kapatılacak bir ürün ya da sözleşmeyle dondurulmuş sertifikalı bir sürüm için "dokunmuyoruz" demek meşru bir mühendislik kararıdır; RCM'deki "arızaya kadar çalıştır" stratejisinin yazılımdaki karşılığıdır.

Buradaki ayrım bütün yazının özetidir: **dokunmamaya karar vermek ile dokunamamak aynı şey değildir.** Birincisi sistemi tanıyan, riskleri tartan mühendisin kararıdır; ikincisi tanımayanın korkusudur. Dışarıdan ikisi aynı görünür, kod değişmez. Ama birinin arkasında bilgi, diğerinin arkasında bilgisizlik vardır.

## Sonuç

"Çalışıyor" kalıcı bir durum değil, değişen bir dünyada alınmış bir anlık görüntüdür. Dokunulmayan sistem durmaz; sessizce çürür. O yüzden sözü atmak yerine tamamlamayı öneriyorum:

> **Çalışıyorsa anla, test et, iyileştir.**

Bir sistemin kalitesi bugün çalışıp çalışmadığıyla değil, yarın ne kadar güvenle değiştirilebildiğiyle ölçülür.

## Kaynaklar

- M. M. Lehman — "Programs, Life Cycles, and Laws of Software Evolution", *Proceedings of the IEEE*, 68(9), 1980.
- Michael Feathers — *Working Effectively with Legacy Code*, Prentice Hall, 2004.
- Martin Fowler — *Refactoring: Improving the Design of Existing Code*, 2. baskı, Addison-Wesley, 2018.
- Martin Fowler — [Frequency Reduces Difficulty](https://martinfowler.com/bliki/FrequencyReducesDifficulty.html), 2011.
- Robert C. Martin — *Clean Code*, Prentice Hall, 2008.
- Andrew Hunt, David Thomas — *The Pragmatic Programmer*, Addison-Wesley, 1999.
- G. K. Chesterton — *The Thing*, 1929.
- Nicole Forsgren, Jez Humble, Gene Kim — *Accelerate*, IT Revolution, 2018. Ayrıca [DORA araştırmaları](https://dora.dev/).
- F. S. Nowlan, H. F. Heap — *Reliability-Centered Maintenance*, 1978 (AD-A066579).
- J. L. Lions vd. — [Ariane 5 Flight 501 Failure, Report by the Inquiry Board](https://www.cs.toronto.edu/~krj/courses/2307/disasters/ariane5rep.html), 1996.
- U.S. SEC — [Knight Capital Americas LLC, Release No. 34-70694](https://www.sec.gov/litigation/admin/2013/34-70694.pdf), 2013.
- Joel Spolsky — [Things You Should Never Do, Part I](https://www.joelonsoftware.com/2000/04/06/things-you-should-never-do-part-i/), 2000.
- RTCA/EUROCAE — DO-178C / ED-12C, *Software Considerations in Airborne Systems and Equipment Certification*, 2011.
- [Antikırılgan: Belirsizlikten ve Kaostan Güç Alan Sistemler]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %})
- [Coupling'i Dengelemek: Yazılım Tasarımında Bağımlılığı Yönetmek]({% post_url 2026-06-04-coupling-dengesi %})

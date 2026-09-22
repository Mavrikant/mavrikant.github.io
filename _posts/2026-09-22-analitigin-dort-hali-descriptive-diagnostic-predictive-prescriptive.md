---
title: "Analitiğin Dört Hâli: Descriptive, Diagnostic, Predictive, Prescriptive"
subtitle: "The Four Types of Analytics: Descriptive, Diagnostic, Predictive and Prescriptive"
background: "/img/posts/9.webp"
date: '2026-09-22 09:00:00'
layout: post
lang: tr
mermaid: true
categories: [muhendislik]
tags: [veri-analitigi, yoneylem-arastirmasi]
---

Çoğu ekibin veriyle ilişkisi aynı sahneyle başlar: birisi bir gösterge paneli (*dashboard*) açar, ekranda on beş grafik vardır, hepsi doğrudur, hiçbiri hiçbir şey yaptırmaz. Toplantı biter, panel kapanır, karar yine "bence" ile verilir.

Sorun verinin azlığı değildir; **sorulan sorunun türünün farkında olmamaktır.** "Geçen ay kaç arıza oldu?", "bu arızalar neden oldu?", "önümüzdeki çeyrekte kaç tane bekliyoruz?" ve "bu bütçeyle ne yapmalıyız?" dört ayrı sorudur. Dördü de veriyle yanıtlanır; ama her biri farklı yöntem, farklı veri ve farklı kanıt standardı ister. Sektör bu dört soruya dört isim verir: **descriptive** (betimleyici), **diagnostic** (tanısal), **predictive** (öngörücü) ve **prescriptive** (kuralkoyucu) analitik.

Bu yazıda dört seviyeyi tek bir örnek üzerinden, merdivenin altından tepesine doğru yürüyeceğiz. Örneğimiz, sahada birkaç bin adedi çalışan bir elektronik birimin (bir LRU, *line-replaceable unit*) arıza verisi. Her birim servis kaydı, kullanım saati ve telemetri üretiyor; ekibin elinde ise sınırlı bir bakım kapasitesi, yedek parça stoğu ve bütçe var.

---

## Kısa Bir Tarihçe

Bu sınıflandırma tek bir makaleden doğmadı; birkaç kaynağın birleşmesiyle yerleşti.

İlk tohum, **Thomas H. Davenport** ve **Jeanne G. Harris**'in 2007 tarihli *Competing on Analytics* kitabıdır. Kitap analitik uygulamaları yanıtladıkları soruya göre sıralar: raporlama "ne oldu?", tahmin "ne olacak?", optimizasyon ise "en iyi ne olabilir?" sorusunu yanıtlar.

2010'da INFORMS'un *Analytics Magazine* dergisinde yayımlanan **"The Analytics Journey"** makalesinde Irv Lustig, Brenda Dietrich, Christer Johnson ve Christopher Dziekan analitiği üç kategoriye ayırır: **descriptive**, **predictive** ve **prescriptive**. Bu üçlü, IBM ve INFORMS çevresinde hızla ortak bir dil hâline geldi.

Bugün en çok kullanılan dörtlü yapıyı ise **Gartner** yaygınlaştırdı. "Analitik yükseliş modeli" (*Analytic Ascendancy Model*) olarak bilinen şemada descriptive ile predictive arasına **diagnostic** eklenir ve dört seviye, yatay eksende zorluk, dikey eksende değer olacak şekilde yükselen bir merdiven olarak çizilir.

Etiketler yeni olsa da en üst basamağın motoru eskidir: 1950'lerden beri gelişen yöneylem araştırması ve karar teorisi. Bugün "prescriptive analytics" diye pazarlanan şeyin önemli bir kısmı, olgun bir disiplinin yeni adıdır.

---

## Dört Seviyeye Kuşbakışı

Örneğimiz üzerinden dört seviye şöyle özetlenir:

| Seviye | Soru | Amaç | Örnekteki karşılığı |
|---|---|---|---|
| **Descriptive** | Ne oldu? | Geçmişi doğru özetlemek | Son üç ayda arıza oranı bin saatte 0,8'den 1,9'a çıktı |
| **Diagnostic** | Neden oldu? | Sebebi bulmak | Artış Parti 7'den geliyor; kök neden tedarikçisi değişen bir kondansatör |
| **Predictive** | Ne olacak? | Geleceği kestirmek | Parti 7'deki bir birimin önümüzdeki 500 saatte arızalanma olasılığı %30 |
| **Prescriptive** | Ne yapmalıyız? | En uygun eylemi seçmek | Parti 7'deki 120 birimi kapasiteye göre sıraya koyup planlı bakımda değiştir |

İlk ikisi geçmişe bakar ve sistemin davranışını *anlamaya* çalışır; predictive bu anlayışı geleceğe *uzatır*; prescriptive ise bir *eylem* seçer. Dördü bağımsız değildir: **her seviye bir öncekinin çıktısını girdi olarak kullanır.** Kök nedeni bilinmeyen bir arızanın seyri güvenilir biçimde tahmin edilemez; riski bilinmeyen bir birim için akıllı bir bakım kararı verilemez. Merdiven benzetmesi buradan gelir:

<div class="mermaid">
flowchart BT
    D["DESCRIPTIVE<br/>Ne oldu?"] --> G["DIAGNOSTIC<br/>Neden oldu?"]
    G --> P["PREDICTIVE<br/>Ne olacak?"]
    P --> R["PRESCRIPTIVE<br/>Ne yapmalıyız?"]
    style D fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style G fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style P fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
    style R fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
</div>

---

## 1. Descriptive Analytics — "Ne oldu?"

Betimleyici analitik, ham veriyi anlaşılabilir bir özete dönüştürür. İşi **geçmişi doğru ve dürüst biçimde raporlamaktır**; hipotez kurmaz, sebep aramaz, gelecek hakkında iddiada bulunmaz. Araçları basittir ve tam da bu yüzden küçümsenir: toplamlar, oranlar, dağılımlar, zaman serisi grafikleri, gruplama ve kırılım tabloları.

Örneğimizde bu katman şu soruları yanıtlar: Son 12 ayda kaç birim arızalandı? Bin çalışma saati başına arıza oranı ne? Arızalar üretim partisine, yazılım sürümüne ve bölgeye göre nasıl dağılıyor? Ortalama onarım süresi (MTTR) ve arızalar arası ortalama süre (MTBF) ne?

Bu soruların cevabı basit toplamlar ve kırılımlardır; asıl zorluk **tanımlardadır**. "Arıza" ne demek: müşterinin geri gönderdiği her birim mi, yoksa laboratuvarda hatası doğrulananlar mı? Sektörde bunun ayrı bir adı bile vardır: **NFF** (*no fault found*); geri dönen birimlerin ciddi bir kısmında hiçbir hata bulunamaz. "Çalışma saati" sayaçtan mı geliyor, tahminden mi? Aynı birim iki kez arızalandıysa bu bir mi sayılır, iki mi? Bu sorular netleşmeden üretilen her sayı *garbage in, garbage out* kuralına tabidir.

Tanımlar oturduktan sonra iki alışkanlık descriptive katmanı gerçekten değerli kılar:

**Ortalamayla yetinmemek.** Ortalama onarım süresi 3 gün olabilir; ama dağılımın kuyruğunda 40 gün bekleyen müşteriler varsa asıl hikâye oradadır. Ortalamanın yanında dağılım ve yüzdelikler (p50, p90, p99) raporlanmalıdır. [Ölçüm Belirsizliği]({% post_url 2026-05-06-olcum-belirsizligi-gum-annex-f-ncsli-rp-12 %}) yazısındaki ilke burada da geçerlidir: yanında değişkenliği olmayan bir sayı eksiktir.

**Gürültüyü sinyalden ayırmak.** Aylık arıza sayısı 18'den 23'e çıktığında toplantıda "bir şeyler kötüye gidiyor" denir. Oysa süreç tamamen kararlıyken de sayılar dalgalanır. Walter Shewhart'ın 1920'lerde geliştirdiği **istatistiksel süreç kontrolü** (*SPC*) bu ayrımı yapmak için vardır: kontrol grafiğinde doğal sınırlar içinde kalan hareket "olağan nedenlere" (*common cause*), sınırları aşan hareket ise "özel nedene" (*special cause*) işaret eder. Örneğimizdeki 0,8'den 1,9'a sıçrama ikinci türdendir; açıklanmayı hak eden bir olgudur.

---

## 2. Diagnostic Analytics — "Neden oldu?"

Tanısal analitik, descriptive katmanın ortaya koyduğu olguyu açıklamaya çalışır. Tipik teknikleri:

- **Detaya inme ve dilimleme** (*drill-down*, *slice & dice*): Toplam artışı partiye, sürüme, bölgeye, üretim tarihine göre kırarak hangi alt kümeden geldiğini bulmak.
- **Pareto analizi:** Arızaların büyük kısmını üreten küçük neden kümesini bulmak.
- **Korelasyon ve hipotez testi:** İki değişken arasındaki ilişkiyi ölçmek, farkın tesadüfle açıklanıp açıklanamayacağını sınamak.
- **Kök neden analizi:** 5 Neden, Ishikawa (balık kılçığı) diyagramı, hata ağacı analizi (*FTA*).
- **Nedensel çıkarım:** A/B testi, doğal deney, fark-içinde-fark (*difference-in-differences*), karıştırıcı değişkenleri belirlemek için yönlü çevrimsiz graflar (*DAG*).

Örneğimizde kırılımlar, arıza oranındaki artışın neredeyse tamamının tek bir üretim partisinden, Parti 7'den geldiğini gösterir. O partiye bakıldığında farklı bir tedarikçiden gelen bir kondansatör göze çarpar; hata ağacı bu bulguyu destekler, laboratuvar testi de kondansatörün sıcaklık çevrimi altında erken bozulduğunu doğrular.

<div class="mermaid">
flowchart TD
    A["Gözlem: arıza oranı 0,8'den 1,9'a çıktı"] --> B["Kırılım: hangi parti / sürüm / bölge?"]
    B --> C["Bulgu: artış Parti 7'de yoğunlaşıyor"]
    C --> D["Hipotez: partideki bileşen değişikliği"]
    D --> E["Doğrulama: laboratuvar testi + hata ağacı"]
    E --> F["Kök neden: tedarikçisi değişen kondansatör"]
    style A fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style F fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
</div>

### Bu Katmanın Büyük Tuzağı: Korelasyon ≠ Nedensellik

İki şeyin birlikte hareket etmesi, birinin diğerine sebep olduğu anlamına gelmez. Diagnostic analitiğin klasik tuzakları:

- **Karıştırıcı değişken** (*confounder*): Hem X'i hem Y'yi etkileyen üçüncü bir değişken. Yeni yazılım sürümü yüklenen birimlerde arıza daha fazla görünebilir; ama o sürüm öncelikle en yoğun kullanılan birimlere yüklendiyse, asıl neden kullanım yoğunluğudur.
- **Seçilim ve hayatta kalan yanlılığı** (*selection / survivorship bias*): Yalnızca geri dönen birimleri inceliyorsanız, sahada sessizce çalışanlar hakkında hiçbir şey bilmiyorsunuzdur. Abraham Wald'ın İkinci Dünya Savaşı'ndaki uçak zırhı problemi tam olarak budur: üsse dönen uçaklardaki delikler, zırhın *gerekmediği* yerleri gösterir; vurulduğunda dönemeyen uçakların verisi elinizde yoktur.
- **Ortalamaya dönüş** (*regression to the mean*): Olağandışı kötü bir aydan sonra gelen iyileşme, alınan önlemin başarısı değil, istatistiğin doğal davranışı olabilir. Bir önlemin etkisini kanıtlamak için kontrol grubu ya da en azından basit bir öncesi-sonrası karşılaştırmasının ötesine geçen bir tasarım gerekir.
- **Simpson paradoksu:** Alt gruplarda geçerli olan bir ilişki, gruplar birleştirildiğinde tersine dönebilir.

Pratik kural: **bir açıklamayı kabul etmeden önce onu çürütecek veriyi arayın.** "Kondansatör suçlu" hipotezi doğruysa, aynı kondansatörü kullanan başka partilerde de artış görülmelidir; görülmüyorsa hipotez eksiktir.

---

## 3. Predictive Analytics — "Ne olacak?"

Öngörücü analitik, geçmişten öğrenilen örüntüyü geleceğe uzatır. Çıktısı bir kehanet değil, **bir olasılıktır**: "önümüzdeki çeyrekte 40 ila 60 arıza bekliyoruz, merkezî tahmin 48" ya da "bu birimin önümüzdeki 500 saatte arızalanma olasılığı %30".

Tipik yöntemler:

- **Regresyon:** Sürekli bir değeri tahmin etmek (beklenen arıza sayısı, kalan ömür).
- **Sınıflandırma:** Kategorik bir sonucu tahmin etmek (bu birim bir sonraki bakım periyodunda arızalanacak mı?).
- **Zaman serisi modelleri:** ARIMA, üstel düzleştirme, mevsimsellik ayrıştırması.
- **Hayatta kalma analizi** (*survival analysis*): Güvenilirlik mühendisliğinin ana aracı; Weibull dağılımıyla arıza oranının zamanla nasıl değiştiğini modellemek (meşhur "küvet eğrisi").
- **Makine öğrenmesi:** Gradient boosting, rastgele orman, sinir ağları.
- **Durum kestirimi:** Gürültülü ölçümlerden bir sistemin gizli durumunu ve kısa vadeli seyrini kestirmek. [Kalman Filtresi]({% post_url 2026-06-02-kalman-filtresi %}) yazısında ele aldığımız bu problem, "predictive" kavramının mühendislikteki en eski ve en matematiksel hâlidir.

Örneğimizde diagnostic katmanın bulgusu modele doğrudan girdi olur: parti bilgisi, telemetriden gelen sıcaklık çevrimi sayısı ve çalışma saatiyle her birime bir risk skoru üretilir. Sonuç çarpıcıdır: Parti 7'deki bir birimin önümüzdeki 500 saatte arızalanma olasılığı %30, diğer partilerde ise %3 civarındadır. Aynı model, önümüzdeki çeyrek için yedek parça talebini de öngörür.

### Tahmine Güvenmenin Şartları

Bir tahmin üretmek kolay, **güvenilebilir** bir tahmin üretmek zordur:

**Zamana göre doğrulama.** Zaman serisi verisinde rastgele eğitim/test ayrımı yapmak, modele geleceği sızdırır (*data leakage*). Ayrım zamana göre yapılmalı; model yalnızca geçmişi görüp geleceği tahmin etmelidir.

**Taban çizgisini geçmek.** Her model, "geçen ayın değeri" kadar naif bir tahminle (*baseline*) karşılaştırılmalıdır. Bu basit kural bile çoğu karmaşık modeli utandırır; geçemeyen bir modelin karmaşıklığı yalnızca maliyettir.

**Doğru metrik.** Nadir olaylarda "doğruluk" (*accuracy*) yanıltıcıdır: birimlerin %2'si arızalanıyorsa, "hiçbiri arızalanmayacak" diyen bir model %98 doğruluk elde eder ve tamamen işe yaramazdır. Kesinlik (*precision*), duyarlılık (*recall*) ve PR eğrisi gibi ölçütlere bakılmalıdır.

**Kalibrasyon.** Model "%30 risk" dediğinde, o gruptaki birimlerin gerçekten yaklaşık %30'u arızalanmalıdır. Birimleri doğru sıralamak (*discrimination*) ile olasılığı doğru vermek farklı şeylerdir; tahmin bir karar eşiğine ya da maliyet hesabına girecekse kalibrasyon şarttır.

**Belirsizliği göstermek.** "48 arıza" ile "48 ± 20 arıza" farklı kararlar doğurur. Aralığı olmayan bir tahmin belirsizliği ortadan kaldırmaz, yalnızca görünmez kılar; karar veren de ona hak etmediği bir kesinlik atfeder. [Antikırılgan]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %}) yazısındaki bakışla: amaç geleceği tam bilmek değil, yanılma ihtimaline karşı doğru konumlanmaktır.

**Kaymayı izlemek** (*drift*). Model, eğitildiği dünyanın modelidir. Tedarikçi, kullanım profili ya da yazılım değiştiğinde sessizce bozulur. Üretimdeki her modelin performans takibi ve yeniden eğitim planı olmalıdır.

### Tahmin Ne Yapılacağını Söylemez

%30'luk risk skoru önemli bir şey söyler, ama "bakım yap" demez. Tahmin, *mevcut gidişat sürerse* ne olacağını anlatır. Çoğu zaman doğru tepki tahmine hazırlanmak değil, **tahmini yanlış çıkaracak eylemi almaktır**: "bu birim arızalanacak" tahmini arızayı önleyen bir bakımı tetiklediğinde model kâğıt üzerinde "yanılır", ama tam olarak işini yapmış olur. (Bu yüzden müdahale edilen birimler, modelin performansı ölçülürken ayrıca izlenmelidir.) Riskten eyleme geçmek ayrı bir problemdir ve merdivenin son basamağının konusudur.

---

## 4. Prescriptive Analytics — "Ne yapmalıyız?"

Kuralkoyucu analitik diğer üç seviyeden yapısal olarak farklıdır: onlar bir soruya cevap verir, bu seviye **bir eylem seçer.** Girdisi predictive katmanın çıktısıdır; yanına maliyetleri, seçenekleri ve kısıtları ekler.

### En Yalın Hâli: Seçenekleri Karşılaştırmak

Tek bir Parti 7 birimini düşünelim. Önümüzdeki 500 saatte arızalanma olasılığı %30. Planlı bakımda değiştirmenin maliyeti 1.000 €; sahada arızalanmasının maliyeti ise (yedek parça, plansız yer süresi, sefer iptali) yaklaşık 12.000 €:

| Seçenek | Beklenen maliyet |
|---|---|
| Birimi planlı bakımda şimdi değiştir | 1.000 € |
| Ertele, arızalanırsa değiştir | 0,30 × 12.000 € = 3.600 € |

Karar nettir: **şimdi değiştir.** Bu basit tablo bile prescriptive analitiktir.

### Ölçek Büyüyünce: Optimizasyon

Asıl zorluk, kararı tek bir birim için değil, kısıtlar altında yüzlerce birim için aynı anda vermek gerektiğinde başlar. Parti 7'de 120 birim var, ama atölyenin haftalık kapasitesi ancak 30 birime yetiyor ve yedek kondansatör stoğu sınırlı. Hangi birimler önce? Soru artık bir optimizasyon problemidir ve üç bileşeni vardır:

1. **Karar değişkenleri:** Gerçekten kontrol edilebilen şeyler. Burada her birim için tek bir evet/hayır kararı: bu hafta bakıma alınsın mı?
2. **Amaç fonksiyonu:** İyileştirilmek istenen ölçüt. Burada toplam beklenen maliyet: bakıma alınan birimlerin bakım maliyeti ile alınmayanların beklenen arıza maliyetinin toplamı.
3. **Kısıtlar:** Gerçek hayatın çözüme dayattığı sınırlar. Burada haftalık atölye saati ve kondansatör stoğu.

Bir birimin beklenen arıza maliyeti, arıza olasılığı ile arıza maliyetinin çarpımıdır ve o olasılık predictive katmandan gelir. Merdivenin mantığı burada somutlaşır: **prescriptive model, predictive modelin çıktısı olmadan kurulamaz.** Kararların evet/hayır biçiminde olduğu bu yapı, [Yöneylem Araştırması Yöntemleri]({% post_url 2026-04-14-operasyonel-arastirma-yontemleri %}) yazısında ele aldığımız tam sayılı programlamanın ta kendisidir.

Prescriptive analitiğin araç çantası bununla sınırlı değildir:

- **Matematiksel optimizasyon:** LP, MIP, kısıt programlama. Kısıtların sert, amacın net olduğu durumlarda en güçlü araç.
- **Simülasyon:** Kesikli olay simülasyonu ve Monte Carlo. Sistem analitik olarak modellenemeyecek kadar karmaşıksa, binlerce senaryo koşturup politikaları karşılaştırmak.
- **Karar analizi:** Karar ağaçları, beklenen değer hesapları, bilginin değeri (*value of information*).
- **Karar kuralları:** Her zaman bir çözücüye gerek yoktur. "Parti 7 birimlerinde bakım aralığını 500 saatten 400 saate indir" gibi basit bir kural da bir reçetedir ve genellikle uygulanması en kolay olanıdır.
- **Pekiştirmeli öğrenme:** Ardışık kararların olduğu, geri bildirimin gecikmeli geldiği ortamlarda güçlüdür; ama emniyet-kritik alanlarda doğrulanabilirliği ciddi bir problemdir.

### Uygulanabilirlik: En Sık Atlanan Şart

Prescriptive katmanın en yaygın hatası, matematiksel olarak optimal ama pratikte uygulanamaz bir çözüm üretmektir. Model yalnızca kapasiteyi bildiği için planı rahatça kurar; oysa yedek kondansatörün tedarik süresi altı haftadır ve iki müşterinin sözleşmesi birimlerin belirli dönemlerde sökülmesine izin vermez. Modelde olmayan kısıt, sahada planı bozar. İyi bir prescriptive model, çözücünün gücüyle değil, **gerçek kısıtları modele koymakla** iyi olur.

Sunum da çözüm kadar önemlidir. Tek bir "optimal" cevap yerine birkaç senaryo, kararı veren insanın işini kolaylaştırır: "kapasiteyi haftada 10 birim artırırsanız beklenen arıza maliyeti şu kadar düşer" cümlesi, tek bir sayıdan çok daha kullanışlıdır. Doğrusal programlamanın doğal olarak ürettiği **duyarlılık analizi** tam da bu yüzden değerlidir.

---

## Dört Seviye Bir Arada: Analitik Döngü

Merdiven, seviyelerin birbirine nasıl dayandığını gösterir; gerçek hayatta ise dört seviye bir döngü içinde çalışır. Eylem alınır, sonucu ölçülür, ölçüm yeni bir descriptive girdi olur:

<div class="mermaid">
flowchart LR
    V["Veri<br/>(telemetri, servis kaydı, üretim)"] --> D["Descriptive<br/>ne oldu"]
    D --> G["Diagnostic<br/>neden oldu"]
    G --> P["Predictive<br/>ne olacak"]
    P --> R["Prescriptive<br/>ne yapmalı"]
    R --> E["EYLEM"]
    E -. "sonuç yeniden ölçülür" .-> V
    style V fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style E fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
</div>

Örneğimizde döngü şöyle kapanır: Parti 7 birimleri değiştirildikten sonra descriptive katman arıza oranının yeniden 0,8 seviyesine inip inmediğini ölçer. İndiyse kök neden doğru bulunmuş ve eylem işe yaramıştır. İnmediyse diagnostic hipotez eksiktir ve merdiven yeniden tırmanılır.

Bu, [Sistem Mühendisliği Nedir?]({% post_url 2026-05-26-sistem-muhendisligi-nedir %}) yazısındaki doğrulama fikrinin veri tarafındaki karşılığıdır: etkisi ölçülmeyen bir karar öğrenmeye dönüşmez. Analitik olgunluğun gerçek işareti panelin güzelliği değil, **bu döngünün ne kadar hızlı döndüğüdür.**

---

## Sık Yapılan Hatalar

**Merdiveni atlamak.** En yaygın hata budur. Ekip henüz "geçen ay kaç arıza oldu?" sorusunu tutarlı yanıtlayamazken bir makine öğrenmesi projesi başlatılır. Model, tanımları belirsiz veriyle eğitilir; çıkan sayıya kimse güvenmez; proje sessizce ölür. Descriptive katman sıkıcıdır, ama pazarlığa açık değildir.

**İşi yanlış adlandırmak.** Kendini "öngörücü analitik projesi" diye tanıtan pek çok çalışma, yakından bakıldığında üzerine bir eğilim çizgisi çizilmiş bir descriptive rapordur; "yapay zekâ" diye sunulan bazı çalışmalar ise aslında iyi kurulmuş bir optimizasyon modelidir. Yanlış ad, yanlış beklenti ve yanlış kabul kriteri üretir. Basit bir turnusol işe yarar:

- "Bir gösterge paneli hazırladım." → büyük ihtimalle **descriptive**.
- "Arızanın kök nedenini buldum." → **diagnostic**.
- "Bir sonraki arızayı tahmin ediyorum." → **predictive**.
- "Hangi bakımın, testin ya da konfigürasyonun seçileceğini optimize ediyorum." → **prescriptive**.

**Ölçütü hedefe çevirmek.** Goodhart yasası der ki: "Bir ölçüt hedef hâline geldiğinde, iyi bir ölçüt olmaktan çıkar." Arıza sayısı bir performans hedefine bağlandığında, kayıtlar "arıza değil, kullanıcı hatası" diye sınıflanmaya başlar ve descriptive katmanın dürüstlüğü, yani bütün merdivenin temeli, sessizce aşınır.

---

## Pratik Çerçeve: Nereden Başlamalı?

Bir ekip işe merdivenin altından değil, **iyileştirmek istediği karardan geriye doğru** giderek başlamalıdır. Soru "hangi analitik seviyesindeyiz?" değil, "bu kararı ne engelliyor?" sorusudur:

<div class="mermaid">
flowchart TD
    S["Hangi kararı<br/>iyileştirmek istiyorum?"] --> Q{"Kararı ne engelliyor?"}
    Q -- "Ne olduğunu bilmiyoruz" --> D["DESCRIPTIVE:<br/>tanımları netleştir, ölçmeye başla"]
    Q -- "Biliyoruz ama<br/>sebebini bilmiyoruz" --> G["DIAGNOSTIC:<br/>kırılım + kök neden"]
    Q -- "Sebebi biliyoruz,<br/>seyri bilmiyoruz" --> P["PREDICTIVE:<br/>tahmin + belirsizlik"]
    Q -- "Seyri biliyoruz,<br/>seçenek çok" --> R["PRESCRIPTIVE:<br/>optimizasyon / karar kuralı"]
    style S fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style R fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
</div>

Üç kural bu yaklaşımı tamamlar:

- **Eylemi baştan tasarlayın.** Bir analizi ya da bir grafiği kurmadan önce şu soruya yazılı bir cevabınız olsun: *"Bu sayı değişirse ne yapacağız?"* Cevap yoksa o grafik dekordur. Bu tek alışkanlık, işe yaramaz analizlerin çoğunu daha başlamadan eler.
- **Her basamak için "yeterince iyi" bir eşik belirleyin.** Descriptive katmanın kusursuz olmasını beklerseniz hiçbir zaman yukarı çıkamazsınız. Tanımlar tutarlıysa ve veri kalitesinin sınırları biliniyorsa bir üst basamağa geçilebilir.
- **Her problem tepeyi gerektirmez.** Bazı kararlar için iyi kurulmuş bir kontrol grafiği, en gelişmiş tahmin modelinden daha değerlidir. Merdivende ne kadar yükseleceğinizi kararın kendisi belirler.

---

## Sonuç

Descriptive, diagnostic, predictive ve prescriptive analitik dört ayrı teknoloji değil, **dört ayrı sorudur**: ne oldu, neden oldu, ne olacak, ne yapmalıyız. Her biri bir öncekinin cevabına dayanır ve dördü birlikte, eylemin sonucunu yeniden ölçen tek bir döngü oluşturur.

Çerçevenin asıl değeri, bir ekibe ortak bir dil vermesidir. "Bir yapay zekâ projesi yapalım" cümlesi bir şey ifade etmez. "Arıza verimizde önce artışın kaynağını bulacağız, sonra birimlere risk skoru üreteceğiz, en sonunda bakım planını kapasiteye göre optimize edeceğiz" cümlesi ise bir yol haritasıdır ve her adımının ne zaman tamamlandığı bellidir.

Hangi basamakta durursanız durun, ölçüt aynıdır: analitik, karar için vardır. Hiçbir kararı değiştirmeyen bir sayı, ne kadar doğru hesaplanmış olursa olsun, yalnızca maliyettir.

---

**Kaynaklar:**

- Thomas H. Davenport, Jeanne G. Harris — *Competing on Analytics: The New Science of Winning* (Harvard Business Review Press, 2007).
- Irv Lustig, Brenda Dietrich, Christer Johnson, Christopher Dziekan — "The Analytics Journey", *Analytics Magazine* (INFORMS), Kasım/Aralık 2010.
- Gartner — [Gartner Glossary: Prescriptive Analytics](https://www.gartner.com/en/information-technology/glossary/prescriptive-analytics).
- INFORMS — [What is Operations Research / Analytics](https://www.informs.org/Explore/Operations-Research-Analytics).
- Walter A. Shewhart — *Economic Control of Quality of Manufactured Product* (1931). Ayrıca [Statistical process control (Wikipedia)](https://en.wikipedia.org/wiki/Statistical_process_control).
- Judea Pearl, Dana Mackenzie — *The Book of Why: The New Science of Cause and Effect* (Basic Books, 2018).
- Abraham Wald — [Survivorship bias (Wikipedia)](https://en.wikipedia.org/wiki/Survivorship_bias).
- Charles Goodhart — [Goodhart's law (Wikipedia)](https://en.wikipedia.org/wiki/Goodhart%27s_law).
- Nate Silver — *The Signal and the Noise* (Penguin, 2012).

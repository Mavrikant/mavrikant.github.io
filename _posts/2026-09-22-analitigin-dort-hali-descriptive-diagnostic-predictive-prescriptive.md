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

Sorun verinin azlığı değildir; **sorulan sorunun türünün farkında olmamaktır.** "Geçen ay kaç arıza kaydı açıldı?" ile "bu arızaların kök nedeni ne?" farklı sorulardır. "Önümüzdeki çeyrekte kaç tane bekliyoruz?" ise bambaşka bir soru, "bu bütçeyle hangi iki iyileştirmeyi yapmalıyım?" ise bambaşka bir sorudur. Dördü de veriyle yanıtlanır; ama dördü farklı yöntem, farklı veri ve farklı kanıt standardı ister.

Sektörde bu dört soruyu adlandıran yaygın bir çerçeve var: **descriptive** (betimleyici), **diagnostic** (tanısal), **predictive** (öngörücü) ve **prescriptive** (kuralkoyucu / reçete yazan) analitik. Bu yazıda bu dört seviyeyi tek tek tanımlayacak, her birini aynı örnek üzerinden yürütecek, aralarındaki geçişlerde yapılan klasik hataları ve "hangi seviyeye ne zaman ihtiyacım var?" sorusunun pratik cevabını ele alacağız.

---

## Kısa Bir Tarihçe: Dört Seviye Nereden Çıktı?

Bu sınıflandırma tek bir makaleden doğmadı; birbirini besleyen birkaç kaynağın birleşmesiyle yerleşti.

İlk tohum, **Thomas H. Davenport** ve **Jeanne G. Harris**'in 2007 tarihli *Competing on Analytics* kitabıdır. Kitapta analitik uygulamaları, yanıtladıkları soruya göre bir merdiven biçiminde sıralanır: raporlama "ne oldu?" sorusunu, uyarılar "şimdi ne yapmalıyım?" sorusunu, tahmin "ne olacak?" sorusunu, optimizasyon ise "en iyi ne olabilir?" sorusunu yanıtlar. Merdivenin alt basamaklarında geçmiş, üst basamaklarında gelecek vardır.

İkinci kaynak yöneylem araştırması dünyasıdır. 2010 yılının Kasım/Aralık sayısında INFORMS'un *Analytics Magazine* dergisinde yayımlanan **"The Analytics Journey"** makalesinde Irv Lustig, Brenda Dietrich, Christer Johnson ve Christopher Dziekan analitiği üç kategoriye ayırır: **descriptive**, **predictive** ve **prescriptive**. Bu üçlü ayrım, özellikle IBM ve INFORMS çevresinde hızla standart bir dil hâline geldi.

Üçüncü kaynak **Gartner**'dır. Gartner'ın "analitik yükseliş modeli" (*Analytic Ascendancy Model*) olarak bilinen ve 2012 civarında yayılan şemasında dört seviye, yatay eksende zorluk, dikey eksende değer olacak şekilde çizilir; descriptive ile prescriptive arasına **diagnostic** eklenerek bugün en çok kullanılan dörtlü yapı ortaya çıkar. Şemanın altında iki soru vardır: *"Ne oldu?"*tan başlayıp *"Ne yapmalıyım?"*a uzanan bir eksende ilerlerken hem üretilen değer hem de gereken olgunluk artar.

Dördüncü olarak, bu dilin altında çok daha eski bir zemin yatar: 1950'lerden itibaren gelişen yöneylem araştırması ve karar teorisi. Daha önce [Yöneylem Araştırması Yöntemleri]({% post_url 2026-04-14-operasyonel-arastirma-yontemleri %}) yazısında ele aldığımız doğrusal programlama, dinamik programlama ve metasezgiseller, bugün "prescriptive analytics" etiketiyle pazarlanan şeyin motorudur. Yani en üst seviye yeni bir icat değil; yeni bir isimle ambalajlanmış, olgun bir disiplindir.

Bu tarihçenin pratik bir sonucu var: çerçeve akademik bir teoriden çok, **karar sorularını sınıflandırmaya yarayan ortak bir dildir**. Değeri kesinliğinde değil, bir ekibin "biz hangi soruyu soruyoruz?" konusunda anlaşmasını sağlamasındadır.

---

## Dört Seviyeye Kuşbakışı

Dört seviyeyi en kısa biçimde yanıtladıkları soruyla ayırt ederiz:

<div class="mermaid">
flowchart LR
    D["DESCRIPTIVE<br/>Ne oldu?"] --> G["DIAGNOSTIC<br/>Neden oldu?"]
    G --> P["PREDICTIVE<br/>Ne olacak?"]
    P --> R["PRESCRIPTIVE<br/>Ne yapmalıyım?"]
    style D fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style G fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style P fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
    style R fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
</div>

| Seviye | Soru | Zaman ekseni | Tipik çıktı | Tipik yöntem |
|---|---|---|---|---|
| **Descriptive** | Ne oldu? | Geçmiş | Rapor, gösterge paneli, özet istatistik | Toplama, gruplama, görselleştirme, SPC |
| **Diagnostic** | Neden oldu? | Geçmiş | Kök neden analizi, açıklama | Detaya inme, korelasyon, hipotez testi, nedensel çıkarım |
| **Predictive** | Ne olacak? | Gelecek | Tahmin, olasılık, risk skoru | Regresyon, zaman serisi, sınıflandırma, makine öğrenmesi |
| **Prescriptive** | Ne yapmalıyım? | Gelecek + karar | Eylem önerisi, plan, politika | Optimizasyon, simülasyon, karar kuralları, pekiştirmeli öğrenme |

Dikkat edilecek nokta şu: **her seviye bir öncekinin üzerine kurulur.** Nedenini bilmediğiniz bir şeyi güvenilir biçimde tahmin edemezsiniz; tahmin edemediğiniz bir şey için akıllı bir eylem öneremezsiniz. Merdivenin alt basamaklarını atlayıp doğrudan tepeye tırmanma girişimleri, veri projelerinin en yaygın başarısızlık sebebidir.

### Bu Yazı Boyunca Kullanacağımız Örnek

Soyut kalmamak için tek bir örneği dört seviyede de yürüteceğiz: **sahadaki bir cihaz filosunun arıza verisi.** Diyelim ki belirli bir elektronik birimden (bir LRU, *line-replaceable unit*) sahada birkaç bin adet var; her birim servis kayıtları, kullanım saati ve telemetri üretiyor. Ekibin elinde bakım maliyeti, yedek parça stoğu ve kısıtlı bir mühendislik kapasitesi var.

---

## 1. Descriptive Analytics — "Ne oldu?"

Betimleyici analitik, ham veriyi insan tarafından anlaşılabilir bir özete dönüştürür. Yaptığı iş **geçmişi doğru ve dürüst biçimde raporlamaktır**; hipotez kurmaz, sebep aramaz, gelecek hakkında iddiada bulunmaz.

Tipik araçları basittir ve tam da bu yüzden küçümsenir: toplamlar, ortalamalar, oranlar, dağılımlar, zaman serisi grafikleri, gruplama ve kırılım tabloları.

Örneğimizde descriptive katman şu soruları yanıtlar:

- Son 12 ayda kaç birim arızalandı?
- Arıza oranı bin çalışma saati başına kaç?
- Arızalar hangi üretim partisine, hangi yazılım sürümüne, hangi coğrafyaya dağılıyor?
- Ortalama onarım süresi (MTTR) ve arızalar arası ortalama süre (MTBF) ne?

Bu katmanın kodu genellikle böyle görünür:

```sql
SELECT
    date_trunc('month', failure_date) AS ay,
    hw_batch,
    sw_version,
    COUNT(*)                          AS ariza_sayisi,
    COUNT(*) * 1000.0 / SUM(op_hours) AS bin_saat_basina_ariza
FROM field_failures
WHERE failure_date >= now() - interval '12 months'
GROUP BY 1, 2, 3
ORDER BY 1;
```

Basit görünüyor, ama iyi bir descriptive katman kurmak sanıldığı kadar kolay değildir. Zorluğun büyük kısmı analizde değil, **tanımlarda** yatar:

- "Arıza" ne demek? Müşterinin geri gönderdiği her birim mi, yoksa test sonucu hata doğrulananlar mı? Sektörde bunun için ayrı bir isim bile vardır: **NFF** (*no fault found*) — geri dönen birimlerin ciddi bir kısmında laboratuvarda hiçbir hata bulunamaz.
- "Çalışma saati" nereden geliyor? Sayaçtan mı, tahminden mi?
- Aynı birim iki kez arızalandıysa bu bir mi iki mi sayılır?

Bu tanımlar netleşmeden kurulan her üst katman, yanlış temelin üstüne inşa edilir. Veri dünyasının en eski özdeyişi burada devreye girer: *garbage in, garbage out.*

İki nokta özellikle önemli:

**Ortalama tek başına yalan söyler.** Ortalama onarım süresi 3 gün olabilir, ama dağılımın kuyruğunda 40 gün bekleyen müşteriler varsa asıl hikâye oradadır. Ortalamanın yanında mutlaka dağılım, yüzdelikler (p50, p90, p99) ve değişkenlik raporlanmalıdır. Aynı mantığı ölçüm dünyasında da görürüz: [Ölçüm Belirsizliği]({% post_url 2026-05-06-olcum-belirsizligi-gum-annex-f-ncsli-rp-12 %}) yazısındaki gibi, bir sayının yanında belirsizliği yoksa o sayı eksiktir.

**Gürültüyü sinyal sanmak.** Bu ay arıza sayısı 18'den 23'e çıktığında toplantıda "bir şeyler kötüye gidiyor" denir. Oysa süreç tamamen kararlıyken de sayılar dalgalanır. Walter Shewhart'ın 1920'lerde geliştirdiği **istatistiksel süreç kontrolü** (*SPC*) tam olarak bu ayrımı yapmak için vardır: kontrol grafiğinde doğal değişkenlik sınırları içinde kalan bir hareket "olağan nedenlere" (*common cause*), sınırları aşan bir hareket ise "özel nedene" (*special cause*) işaret eder. Descriptive katmanın en değerli katkılarından biri, ekibi her dalgalanmaya tepki vermekten kurtarmasıdır.

---

## 2. Diagnostic Analytics — "Neden oldu?"

Tanısal analitik, descriptive katmanın gösterdiği bir olguyu açıklamaya çalışır. Artık "ne oldu"yu biliyoruz; sorulan soru **"bu neden böyle oldu?"**dur.

Bu katmanın tipik teknikleri:

- **Detaya inme ve dilimleme** (*drill-down*, *slice & dice*): Toplam arıza artışını partiye, sürüme, coğrafyaya, müşteriye, üretim tarihine göre kırarak artışın hangi alt kümeden geldiğini bulmak.
- **Pareto analizi:** Arızaların %80'ini üreten %20'lik neden kümesini bulmak.
- **Korelasyon ve hipotez testi:** İki değişken arasındaki ilişkiyi ölçmek, farkın tesadüfle açıklanıp açıklanamayacağını sınamak.
- **Kök neden analizi:** 5 Neden, Ishikawa (balık kılçığı) diyagramı, hata ağacı analizi (*FTA*).
- **Nedensel çıkarım:** A/B testi, doğal deney, fark-içinde-fark (*difference-in-differences*), yönlü çevrimsiz graf (*DAG*) ile karıştırıcı değişkenlerin belirlenmesi.

Örneğimizde şöyle işler: descriptive katman "son üç ayda bin saat başına arıza oranı 0,8'den 1,9'a çıktı" der. Diagnostic katman kırılımlara bakar ve artışın neredeyse tamamının tek bir üretim partisinden geldiğini bulur. Sonra o partiyi inceler: aynı partide farklı bir tedarikçiden gelen bir kondansatör kullanılmıştır. Hata ağacı bu bulguyu doğrular; laboratuvar testi kondansatörün sıcaklık çevrimi altında erken bozulduğunu gösterir. Kök neden bulunmuştur.

<div class="mermaid">
flowchart TD
    A["Gözlem: arıza oranı 2 katına çıktı"] --> B["Kırılım: hangi parti / sürüm / bölge?"]
    B --> C["Bulgu: artış tek bir partide yoğunlaşıyor"]
    C --> D["Hipotez: parti içindeki bileşen değişikliği"]
    D --> E["Doğrulama: laboratuvar testi + hata ağacı"]
    E --> F["Kök neden: tedarikçi değişen kondansatör"]
    style A fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style F fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
</div>

### Bu Katmanın Büyük Tuzağı: Korelasyon ≠ Nedensellik

Diagnostic analitiğin tamamı bu tek cümlenin etrafında döner. İki şeyin birlikte hareket etmesi, birinin diğerine sebep olduğu anlamına gelmez. Klasik tuzaklar:

- **Karıştırıcı değişken** (*confounder*): Hem X'i hem Y'yi etkileyen üçüncü bir değişken. Yeni yazılım sürümü yüklenen birimlerde arıza daha fazla görünüyor olabilir; ama o sürüm öncelikle en çok kullanılan birimlere yüklendiyse, asıl neden kullanım yoğunluğudur.
- **Seçilim yanlılığı** (*selection bias*): Yalnızca geri dönen birimleri inceliyorsanız, sahada sessizce çalışan birimler hakkında hiçbir şey bilmiyorsunuzdur. İkinci Dünya Savaşı'nda Abraham Wald'ın uçak zırhı problemi tam olarak budur: üsse dönen uçaklardaki delikler, zırhın *gerekmediği* yerleri gösterir; vurulduğunda dönemeyen uçakların verisi elinizde yoktur. Bu **hayatta kalan yanlılığı** (*survivorship bias*), arıza analizinde de aynen geçerlidir.
- **Ortalamaya dönüş** (*regression to the mean*): Olağandışı kötü bir aydan sonra gelen iyileşme, aldığınız önlemin başarısı değil, istatistiğin doğal davranışı olabilir. Bir önlemin etkisini ölçmek istiyorsanız kontrol grubuna ya da en azından öncesi-sonrası karşılaştırmasının ötesine geçen bir tasarıma ihtiyacınız vardır.
- **Simpson paradoksu:** Alt gruplarda geçerli olan bir ilişki, gruplar birleştirildiğinde tersine dönebilir.

Pratik kural şudur: **bir açıklamayı kabul etmeden önce onu çürütecek veriyi arayın.** "Kondansatör suçlu" hipotezi doğruysa, aynı kondansatörü kullanan diğer partilerde de artış görülmelidir; görülmüyorsa hipotez eksiktir.

---

## 3. Predictive Analytics — "Ne olacak?"

Öngörücü analitik, geçmiş veriden öğrendiği örüntüyü geleceğe uzatır. Çıktısı bir kehanet değil, **bir olasılık dağılımıdır**: "önümüzdeki çeyrekte 40 ila 60 arıza bekliyoruz, merkezî tahmin 48" ya da "bu birimin önümüzdeki 500 saat içinde arızalanma olasılığı %12".

Tipik yöntemler:

- **Regresyon:** Sürekli bir değeri tahmin etmek (beklenen arıza sayısı, kalan ömür).
- **Sınıflandırma:** Kategorik bir sonucu tahmin etmek (bu birim önümüzdeki bakım periyodunda arızalanacak mı?).
- **Zaman serisi modelleri:** ARIMA, üstel düzleştirme, mevsimsellik ayrıştırması.
- **Hayatta kalma analizi** (*survival analysis*): Güvenilirlik mühendisliğinin ana aracı; Weibull dağılımı ile arıza oranının zamanla nasıl değiştiğini modellemek (meşhur "küvet eğrisi").
- **Makine öğrenmesi:** Gradient boosting, rastgele orman, sinir ağları.
- **Durum kestirimi:** Gürültülü ölçümlerden bir sistemin gizli durumunu ve onun kısa vadeli seyrini kestirmek. Bu, [Kalman Filtresi]({% post_url 2026-06-02-kalman-filtresi %}) yazısında ayrıntılı ele aldığımız problemin ta kendisidir ve "predictive" kelimesinin mühendislikteki en eski, en matematiksel hâlidir.

Örneğimizde predictive katman, telemetriden gelen sıcaklık çevrimi sayısı, çalışma saati, parti bilgisi ve geçmiş arıza verisiyle her birime bir risk skoru üretir; ayrıca önümüzdeki iki çeyrek için yedek parça talebini öngörür.

### Tahmin Modelini Ciddiye Almanın Şartları

Bir tahmin modeli üretmek kolay, **güvenilebilir** bir tahmin modeli üretmek zordur. Birkaç kritik nokta:

**Doğru şekilde doğrulama.** Zaman serisi verisinde rastgele eğitim/test ayrımı yapmak, modele geleceği sızdırır (*data leakage*). Ayrım zamana göre yapılmalı, model yalnızca geçmişi görüp geleceği tahmin etmelidir.

**Doğru metrik.** Nadir olaylarda "doğruluk" (*accuracy*) yanıltıcıdır: birimlerin %2'si arızalanıyorsa, "hiçbiri arızalanmayacak" diyen bir model %98 doğruluk elde eder ve tamamen işe yaramazdır. Nadir olaylar için kesinlik (*precision*), duyarlılık (*recall*), F1 ve PR eğrisi altındaki alan gibi ölçütlere bakılır.

**Kalibrasyon.** Model "%10 risk" dediğinde, bu gruptaki birimlerin gerçekten yaklaşık %10'u arızalanmalıdır. Sıralama başarısı (*discrimination*) ile kalibrasyon farklı şeylerdir; karar eşiği belirleyecekseniz kalibrasyon şarttır.

**Belirsizliği raporlamak.** Nokta tahmini tek başına tehlikelidir. "48 arıza" ile "48 ± 20 arıza" farklı kararlar doğurur. Güven/öngörü aralığı olmayan bir tahmin, belirsizliğini gizleyerek onu ortadan kaldırmaz; yalnızca görünmez kılar.

**Kayma** (*drift*). Model, eğitildiği dünyanın modelidir. Tedarikçi değişir, kullanım profili değişir, yazılım güncellenir — model sessizce bozulur. Üretimdeki her modelin performans takibi ve yeniden eğitim planı olmalıdır.

**Temel oran ve taban çizgisi.** Her modelin karşılaştırılacağı bir taban çizgisi (*baseline*) olmalıdır: "geçen ayın değeri" kadar basit bir kural bile çoğu karmaşık modeli utandırabilir. Eğer modeliniz bu naif tahmini geçemiyorsa, karmaşıklık sadece maliyettir.

---

## 4. Prescriptive Analytics — "Ne yapmalıyım?"

Kuralkoyucu analitik, merdivenin en üst basamağıdır ve diğerlerinden yapısal olarak farklıdır: ilk üç seviye **dünyayı anlamaya** çalışır, bu seviye **dünyayı değiştirecek eylemi seçer**.

Bunun için üç şeye ihtiyaç vardır:

1. **Karar değişkenleri:** Gerçekten kontrol edebildiğiniz şeyler. Hangi birimler önleyici bakıma alınacak? Yedek parça stoğu ne olacak? Mühendislik kapasitesi hangi düzeltmeye ayrılacak?
2. **Amaç fonksiyonu:** Neyi iyileştirmeye çalışıyorsunuz? Toplam maliyet mi, uçuşa elverişlilik oranı mı, müşteri kesinti süresi mi?
3. **Kısıtlar:** Bütçe, personel, tedarik süresi, sözleşme yükümlülükleri, sertifikasyon gereksinimleri.

Bu üçlü tanıdık gelmeli; [Yöneylem Araştırması Yöntemleri]({% post_url 2026-04-14-operasyonel-arastirma-yontemleri %}) yazısındaki optimizasyon probleminin tam olarak aynı iskeletidir:

```text
min   Σ_i ( bakım_maliyeti_i · x_i )  +  Σ_i ( ariza_maliyeti_i · p_i(x_i) )
s.t.  Σ_i saat_i · x_i  ≤  kapasite
      Σ_i parça_i · x_i ≤  stok
      x_i ∈ {0, 1}          (i biriminin bu dönem bakıma alınıp alınmayacağı)
```

Burada `p_i` predictive katmandan gelir: bakım yapılmazsa i biriminin arızalanma olasılığı. Yani **prescriptive katman, predictive katmanın çıktısını girdi olarak kullanır.** Bu bağımlılık zinciri, dört seviyenin neden sıralı olduğunu en iyi gösteren yerdir.

Prescriptive analitiğin araç çantası:

- **Matematiksel optimizasyon:** LP, MIP, kısıt programlama. Kısıtların sert ve amacın net olduğu durumlarda en güçlü araç.
- **Simülasyon:** Kesikli olay simülasyonu ve Monte Carlo. Sistem analitik olarak modellenemeyecek kadar karmaşıksa, binlerce senaryo koşturup politikaları karşılaştırmak.
- **Karar analizi:** Karar ağaçları, beklenen değer hesapları, bilginin değeri (*value of information*).
- **Karar kuralları ve politikalar:** Her zaman büyük bir çözücüye gerek yoktur; "risk skoru 0,3'ü aşan birimi bir sonraki planlı bakımda değiştir" gibi basit bir eşik kuralı da bir reçetedir — ve genellikle uygulanması en kolay olanıdır.
- **Pekiştirmeli öğrenme:** Ardışık kararların olduğu, geri bildirimin gecikmeli geldiği ortamlarda. Güçlüdür, ama emniyet-kritik alanlarda doğrulanabilirliği ciddi bir problemdir.

### Uygulanabilirlik: En Sık Atlanan Şart

Prescriptive katmanda en sık yapılan hata, matematiksel olarak optimal ama pratikte uygulanamaz bir çözüm üretmektir. Model "bu 120 birimi önümüzdeki hafta bakıma al" der; ama sahada o hafta 30 birim kapasite vardır, parça tedarik süresi altı haftadır ve üç müşterinin sözleşmesi o birimlerin sökülmesine izin vermez.

Bu yüzden iyi bir prescriptive model, **gerçek kısıtları modele koymakla** iyi olur; çözücünün gücüyle değil. Ve tek bir "optimal" cevap yerine birkaç senaryo sunmak, kararı veren insanın işini kolaylaştırır: "bütçeyi %20 artırırsanız beklenen arıza maliyeti şu kadar düşer" cümlesi, tek bir sayıdan çok daha kullanışlıdır. Bu, doğrusal programlamanın doğal olarak ürettiği **duyarlılık analizinin** neden bu kadar değerli olduğunu da açıklar.

---

## Dört Seviye Aynı Anda: Bütünleşik Bir Bakış

Dört katman sırayla değil, gerçek hayatta bir döngü hâlinde çalışır. Eylem alınır, sonuç ölçülür, ölçüm yeni bir descriptive girdi olur:

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

Bu döngü, [Sistem Mühendisliği Nedir?]({% post_url 2026-05-26-sistem-muhendisligi-nedir %}) yazısındaki doğrulama fikriyle aynı mantığı taşır: bir kararın etkisi ölçülmüyorsa, o karar öğrenmeye dönüşmez. Analitik olgunluğun gerçek işareti panelin güzelliği değil, **bu döngünün ne kadar hızlı döndüğüdür.**

---

## Sık Yapılan Hatalar

**1. Merdiveni atlamak.** En yaygın hata. Ekip henüz "geçen ay kaç arıza oldu" sorusunu tutarlı yanıtlayamazken makine öğrenmesi projesi başlatılır. Model, tanımları belirsiz ve kalitesi düşük veriyle eğitilir; çıkan sayıya kimse güvenmez; proje sessizce ölür. **Descriptive katman sıkıcıdır ama pazarlıksızdır.**

**2. Karara bağlanmayan metrik.** Bir gösterge paneline bir grafik eklemeden önce sorulacak soru şudur: *"Bu sayı değiştiğinde ne yapacağım?"* Cevap yoksa o grafik dekordur. Aynı şey tahminler için de geçerlidir: hiçbir kararı değiştirmeyen bir tahminin değeri sıfırdır.

**3. Tahmini kader sanmak.** Öngörü, mevcut davranış sürerse ne olacağını söyler. Doğru tepki genellikle tahmine hazırlanmak değil, **tahmini yanlış çıkaracak eylemi almaktır.** "Bu birim arızalanacak" tahmini, arızayı önleyen bakımı tetiklediğinde model "yanlış çıkar" — ve tam olarak işe yaramış olur. Bu, tahmin performansı ölçümünü de zorlaştırır; müdahale edilen vakaların ayrı izlenmesi gerekir.

**4. Goodhart yasası.** "Bir ölçüt hedef hâline geldiğinde, iyi bir ölçüt olmaktan çıkar." Arıza sayısı hedeflendiğinde kayıtlar "arıza değil, kullanıcı hatası" diye sınıflanmaya başlar. Ölçütün kendisi değil, ölçtüğü şey önemlidir.

**5. Belirsizliği saklamak.** Yuvarlak, tek ve aralıksız sayılar toplantıda güzel durur, kararda tehlikelidir. Bir tahminin yanında aralığı yoksa, karar veren kişi ona hak etmediği bir kesinlik atfeder. [Antikırılgan]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %}) yazısındaki bakış açısıyla söylersek: amaç geleceği tam bilmek değil, yanılma ihtimaline karşı maruziyeti doğru kurmaktır.

**6. Araç seçimini problemden önce yapmak.** "Bir veri gölü kuralım, sonra ne yapacağımıza bakarız" yaklaşımı, çözüm arayan bir araç üretir. Doğru sıra terstir: önce karar, sonra soru, sonra yöntem, en sonunda araç.

---

## Pratik Çerçeve: Nereden Başlamalı?

Bir ekip bu dört seviyeyi nasıl sıraya koymalı? İşe merdivenin altından değil, **kararın kendisinden geriye doğru** giderek başlamak en verimlisidir:

<div class="mermaid">
flowchart TD
    S["Hangi kararı<br/>iyileştirmek istiyorum?"] --> Q{"Kararı ne engelliyor?"}
    Q -->|"Ne olduğunu bilmiyoruz"| D["DESCRIPTIVE:<br/>tanımları netleştir, ölçmeye başla"]
    Q -->|"Biliyoruz ama<br/>sebebini bilmiyoruz"| G["DIAGNOSTIC:<br/>kırılım + kök neden"]
    Q -->|"Sebebi biliyoruz,<br/>seyri bilmiyoruz"| P["PREDICTIVE:<br/>tahmin + belirsizlik"]
    Q -->|"Seyri biliyoruz,<br/>seçenek çok"| R["PRESCRIPTIVE:<br/>optimizasyon / karar kuralı"]
    style S fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style R fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
</div>

Birkaç pratik kural:

- **Her seviye için "yeterince iyi" bir eşik belirleyin.** Descriptive katmanın mükemmel olmasını beklerseniz hiçbir zaman üst basamağa çıkamazsınız. Tanımlar tutarlıysa ve veri kalitesi bilinen sınırlar içindeyse yeterlidir.
- **En üst seviyeye her problem için ihtiyacınız yok.** Bazı kararlar için iyi bir kontrol grafiği, en iyi tahmin modelinden daha değerlidir.
- **Basit modelle başlayın.** Naif taban çizgisi → doğrusal model → karmaşık model. Her adımda "bu karmaşıklık ne kadar ek değer getirdi?" sorusunu yanıtlayın.
- **Eylemi baştan tasarlayın.** Analizi kurmadan önce "sonuç X çıkarsa ne yapacağız, Y çıkarsa ne yapacağız?" sorusuna yazılı bir cevabınız olsun. Bu tek alışkanlık, işe yaramaz analizlerin çoğunu daha başlamadan eler.

---

## Sonuç

Descriptive, diagnostic, predictive ve prescriptive analitik, aslında dört farklı teknoloji değil; **dört farklı sorunun adıdır.** Geçmişi betimlemek, geçmişi açıklamak, geleceği kestirmek ve geleceği şekillendirecek eylemi seçmek.

Bu çerçevenin asıl faydası, bir ekibe ortak bir dil vermesidir. "Bir yapay zekâ projesi yapalım" cümlesi hiçbir şey ifade etmez; "elimizdeki arıza verisiyle önce kök nedeni bulmak, sonra risk skoru üretmek, en sonunda bakım planını optimize etmek istiyoruz" cümlesi ise bir yol haritasıdır — ve her adımının ne zaman tamamlandığı bellidir.

Kapanışta akılda kalması gereken üç cümle:

- **Üst basamaklar alt basamaklara borçludur.** Tanımları belirsiz veriyle kurulan tahmin modeli, sağlam görünen bir kum kalesidir.
- **Analitik, karar için vardır.** Hiçbir kararı değiştirmeyen sayı, ne kadar doğru hesaplanmış olursa olsun, maliyetten ibarettir.
- **Belirsizlik gizlenmez, yönetilir.** Bir tahminin değeri kesinliğinde değil, ne kadar yanılabileceğini dürüstçe söylemesindedir.

---

**Kaynaklar:**

- Thomas H. Davenport, Jeanne G. Harris — *Competing on Analytics: The New Science of Winning* (Harvard Business Review Press, 2007).
- Irv Lustig, Brenda Dietrich, Christer Johnson, Christopher Dziekan — "The Analytics Journey", *Analytics Magazine* (INFORMS), Kasım/Aralık 2010.
- Gartner — [Analytics Ascendancy Model / Gartner Glossary: Prescriptive Analytics](https://www.gartner.com/en/information-technology/glossary/prescriptive-analytics).
- INFORMS — [What is Operations Research / Analytics](https://www.informs.org/Explore/Operations-Research-Analytics).
- Walter A. Shewhart — *Economic Control of Quality of Manufactured Product* (1931). Ayrıca [Statistical process control (Wikipedia)](https://en.wikipedia.org/wiki/Statistical_process_control).
- Judea Pearl, Dana Mackenzie — *The Book of Why: The New Science of Cause and Effect* (Basic Books, 2018).
- Abraham Wald — [Survivorship bias (Wikipedia)](https://en.wikipedia.org/wiki/Survivorship_bias).
- Charles Goodhart — [Goodhart's law (Wikipedia)](https://en.wikipedia.org/wiki/Goodhart%27s_law).
- Nate Silver — *The Signal and the Noise* (Penguin, 2012).

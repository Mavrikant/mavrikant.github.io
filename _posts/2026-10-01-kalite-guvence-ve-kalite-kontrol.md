---
title: "Kalite Güvence ve Kalite Kontrol: Yazılımda QA ile QC Arasındaki Fark"
subtitle: "Quality Assurance vs. Quality Control in Software"
background: "/img/posts/kalite-guvence-kalite-kontrol-cover.webp"
date: '2026-10-01 00:00:00'
layout: post
lang: tr
mermaid: true
categories: [yazilim]
tags: [yazilim-muhendisligi, test, emniyet-kritik]
---

Sürüm çıkmış, sahadan ilk hata kaydı gelmiştir. Toplantıda sorulan ilk soru çoğu zaman aynıdır: "QA bunu nasıl kaçırdı?" Soruyu soran, sürümden önce testleri koşan ekibi kastediyordur; o ekibin kapısında gerçekten de "QA" yazar. Oysa soru bir karışıklığı ele verir. Testi koşan ekibin görevi hatayı yakalamaksa, yaptığı iş kalite **kontroldür**. Kalite **güvence** başka bir soru sorar: Bu hata ürüne nasıl girdi, sürecimiz onu neden ne önledi ne de erken yakaladı?

Bu ayrım bir kelime oyunu değildir. "Kaliteden QA sorumludur" diye düşünen bir organizasyon, kaliteyi sürecin sonundaki bir ekibe havale eder. Geliştirici işi "duvarın üstünden" atar, test ekibi her sürümde aynı türden hataları yeniden bulur ve bu türlerin neden tekrar ettiğini soran çıkmaz. Bu yazının tezi şudur: **kalite kontrol (*quality control*, QC) ürüne bakar ve bugünkü hatayı bulur; kalite güvence (*quality assurance*, QA) sürece bakar ve yarınki hatanın oluşmasını engeller.** İkisi rakip değil, birbirini besleyen iki döngüdür.

Bu yazıda önce tanımları standartlar üzerinden netleştireceğiz, ardından tek bir gömülü yazılım hatası üzerinden iki bakışın nasıl ayrıştığını göreceğiz.

---

## Tanımlar: Aynı Şemsiyenin Altında İki Ayrı Soru

ISO 9000:2015 ikisini de kalite yönetiminin (*quality management*) bir parçası sayar ve aradaki farkı tek bir kelimeyle koyar:

- **Kalite güvence:** Kalite yönetiminin, kalite gereksinimlerinin karşılanacağına dair **güven sağlamaya** odaklanan kısmı.
- **Kalite kontrol:** Kalite yönetiminin, kalite gereksinimlerini **karşılamaya** odaklanan kısmı.

Aynı standarda göre kalite yönetimi bu ikisinin yanında kalite planlamayı ve kalite iyileştirmeyi de kapsar:

<div class="mermaid">
flowchart TD
    QM["KALİTE YÖNETİMİ"] --> P["Kalite planlama<br/>hedefler, planlar, standartlar"]
    QM --> A["Kalite güvence (QA)<br/>süreçlerin güven vermesi"]
    QM --> C["Kalite kontrol (QC)<br/>ürünün gereksinimlere uygunluğu"]
    QM --> I["Kalite iyileştirme<br/>süreci ve ürünü geliştirmek"]
    style QM fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style A fill:#fdf1d8,stroke:#b7791f,stroke-width:2px
    style C fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
</div>

Yazılım mühendisliğinin eski sözlüğü IEEE 610.12-1990 (bugün ISO/IEC/IEEE 24765) farkı daha da somut tanımlar: kalite güvence "ürünlerin geliştirildiği ya da üretildiği **süreci** değerlendirmek için tasarlanmış faaliyetler", kalite kontrol ise "geliştirilmiş ya da üretilmiş **ürünlerin** kalitesini değerlendirmek için tasarlanmış faaliyetler"dir.

ISTQB'nin temel seviye müfredatı (CTFL v4.0) ise testin QA olmadığını açıkça yazar: test bir kalite kontrol biçimidir. QC ürün odaklı ve düzeltici, QA süreç odaklı ve önleyici bir yaklaşımdır; QA, iyi bir süreç doğru izlendiğinde iyi bir ürün çıkacağı varsayımına dayanır. Müfredat, QA'nın projedeki herkesin sorumluluğu olduğunu da ekler.

---

## Kısa Bir Tarihçe: Muayeneden Önlemeye

Kalite kontrol seri üretimle birlikte doğdu. 1920'lerde Bell Laboratuvarları'nda Walter Shewhart, hatalı parçaları tek tek ayıklamak yerine sürecin doğal değişkenliğini ölçmeyi önerdi. Kontrol grafiği ve [Analitiğin Dört Hâli]({% post_url 2026-09-22-analitigin-dort-hali-descriptive-diagnostic-predictive-prescriptive %}) yazısında değindiğimiz istatistiksel süreç kontrolü bu fikirden çıktı. Fikrin özü şuydu: muayene hatalı parçayı bulur ama onu üreten süreci düzeltmez.

W. Edwards Deming bunu bir yönetim ilkesine dönüştürdü. On dört ilkesinin üçüncüsü, kaliteye ulaşmak için muayeneye bağımlı olmayı bırakmayı ve kaliteyi ürüne en baştan yerleştirmeyi ister. Joseph Juran kalite yönetimini planlama, kontrol ve iyileştirmeden oluşan bir üçleme olarak tarif etti. Armand Feigenbaum ise kaliteyi yalnızca üretimin değil, tasarımdan satış sonrasına kadar bütün organizasyonun işi saydı (*total quality control*).

Bu çizginin ortak yönü, ağırlığın ürünü muayene etmekten süreci güvenilir kılmaya kaymasıdır. Bu kaymayı en keskin ve en pazarlanabilir biçimde ifade eden kişi ise Philip Crosby oldu.

---

## Crosby ve "Kalite Bedavadır"

Philip Crosby, 1960'ların başında Martin şirketinin Pershing füzesi programında doğan "sıfır hata" (*zero defects*) hareketinin içinde yer almış, ardından ITT'de uzun yıllar kaliteden sorumlu başkan yardımcılığı yapmıştı. 1979'da yayımlanan *Quality Is Free* kitabı şu cümleyle açılır:

> Kalite bedavadır. Bir hediye değildir, ama bedavadır. Para tutan şey kalitesizliktir: işi ilk seferde doğru yapmamayı içeren bütün eylemler.

Crosby'nin iddiası, kalitenin pazarlık edilecek bir maliyet kalemi olmadığıdır. Pahalı olan kalite değil, hatadır: yeniden işleme, hurda, garanti, sahada arıza, kaybedilen müşteri. Önlemeye harcanan para bu kayıplardan fazlasıyla geri döner. Crosby'nin bu kitapta ortaya koyduğu ve daha sonra *Quality Without Tears* (1984) kitabında "kalite yönetiminin dört mutlak ilkesi" adıyla toparladığı fikirler, QA ile QC ayrımının belki de en net ifadesidir:

| Crosby'nin ilkesi | Ne demek? | Yazılımdaki karşılığı |
|---|---|---|
| **Kalite, gereksinimlere uygunluktur** | Kalite "iyilik" ya da "lüks" değil, ölçülebilir bir uygunluktur | Gereksinimler ölçülebilir ve doğrulanabilir yazılmadıkça kaliteden söz edilemez |
| **Kalite sistemi önlemedir** | Kalite, değerlendirmeyle (*appraisal*) değil önlemeyle sağlanır | QC hatayı bulur; QA hatanın oluşmasını engeller |
| **Performans standardı sıfır hatadır** | "Kabul edilebilir hata düzeyi" diye bir hedef konmaz | Bilinen bir hata sınıfı "normal" sayılmaz |
| **Kalitenin ölçüsü uygunsuzluğun bedelidir** | Kalite, işi yanlış yapmanın parasal maliyetiyle ölçülür | Yeniden çalışma, sahada hata ve gecikmenin maliyeti görünür kılınır |

İkinci ilke bu yazının konusunu tek cümlede özetler. Crosby'ye göre değerlendirme, yani muayene ve test, hatalı ürünü ayıklar ama hatayı üreten süreci değiştirmez. Asıl kalite sistemi hatanın nedenini anlayıp ortadan kaldırmaktır. Üçüncü ilke de aynı yöne bakar: üretimde yaygın olan "kabul edilebilir kalite düzeyi" (*acceptable quality level*, AQL) kavramını Crosby, başarısızlığı önceden planlamak diye eleştirir.

Kitabın bir başka bölümü, kaliteyle ilgili yanlış varsayımları sıralar. İkisi bugün de yazılım ekiplerinde yaşar. Birincisi kalite sorunlarını sahadaki çalışanların yarattığı varsayımıdır. Oysa çalışan, kendisine verilen süreç, araç ve gereksinimle çalışır; hataların çoğu bu sistemden gelir. İkincisi kalitenin kalite departmanında doğduğu varsayımıdır. Crosby'ye göre kalite departmanı kaliteyi ölçer, raporlar ve sistemi kurar, ama kaliteyi üretmez. Kaliteyi işi yapan herkes üretir. Bu, "kaliteden QA ekibi sorumludur" yanılgısının kırk yıllık reddidir.

Crosby'nin yazılım dünyasına belki de en kalıcı katkısı dolaylıdır. Kitaptaki **kalite yönetimi olgunluk ızgarası** (*quality management maturity grid*), bir organizasyonun kaliteye bakışını beş aşamada tarif eder: belirsizlik, uyanış, aydınlanma, bilgelik ve kesinlik. Watts Humphrey, Carnegie Mellon Yazılım Mühendisliği Enstitüsü'nde (SEI) yazılım süreç olgunluğu çerçevesini geliştirirken bu ızgaradan ilham aldı. Bugün CMM ve CMMI olarak bilinen olgunluk seviyeleri bu çalışmadan doğdu. Yazılımdaki süreç odaklı kalite güvence anlayışının önemli bir kolu bu yüzden Crosby'ye uzanır.

Crosby'yi yazılıma uyarlarken iki yere dikkat etmek gerekir:

- **Uygunluk yetmez.** Crosby'nin tanımı, gereksinimlerin doğru olduğunu varsayar. Juran'ın "kullanıma uygunluk" (*fitness for use*) tanımı bu yüzden onu tamamlar. [Sistem Mühendisliği Nedir?]({% post_url 2026-05-26-sistem-muhendisligi-nedir %}) yazısındaki ayrımla söylersek, uygunluk doğrulamaya (*verification*), kullanıma uygunluk ise onaylamaya (*validation*) karşılık gelir. Gereksinimlerine kusursuz uyan bir yazılım da yanlış ürün olabilir.
- **Sıfır hata bir slogan değil, bir tutumdur.** Deming, işçilerden "sıfır hata" isteyen slogan ve afişlerin kaldırılmasını isteyen ilkesiyle bu hareketi açıkça eleştirmişti. Hatayı sistem üretiyorsa çalışana yapılan çağrı işe yaramaz. Yazılımda ise sıfır hata ayrıca kanıtlanamaz, çünkü test hataların yokluğunu gösteremez. Crosby'nin fikrinden yazılıma kalan doğru okuma şudur: sıfır hata ulaşıldığı iddia edilen bir sonuç değil, hatayı "işin doğası" diye kabullenmeyen bir yönetim standardıdır. Bulunan her hata, onu üreten sistem hakkında bir bilgidir.

---

## Yan Yana: QA ve QC

| | Kalite Güvence (QA) | Kalite Kontrol (QC) |
|---|---|---|
| **Odak** | Süreç | Ürün |
| **Yaklaşım** | Önleyici | Tespit edici ve düzeltici |
| **Sorduğu soru** | İşi doğru biçimde mi yapıyoruz? | Ortaya çıkan ürün gereksinimleri karşılıyor mu? |
| **Ne zaman** | Proje başlamadan başlar, yaşam döngüsü boyunca sürer | Her iş ürünü ortaya çıktığında |
| **Kim** | Projedeki herkes; bağımsız bir QA fonksiyonu güvence verir | Ürünü inceleyen, analiz eden ve test edenler |
| **Tipik faaliyetler** | Planlar, standartlar, kontrol listeleri, süreç denetimi, kök neden analizi, eğitim | Gözden geçirme, statik analiz, test, kabul |
| **Çıktısı** | Uyumsuzluk bulguları, süreç iyileştirmeleri | Hata kayıtları, test ve inceleme raporları |
| **Başarı ölçütü** | Aynı hata türü bir daha görülmez | Bu sürümün hataları müşteriden önce yakalanır |

Tablonun en sık yanlış okunan satırı "ne zaman" satırıdır. QC'nin sona, QA'nın başa ait olduğu düşünülür. Yazılımda bu doğru değildir.

---

## Yazılımın Farkı: Kopya Değil, Tasarım

Bir fabrikada QC'nin işi, aynı tasarımın binlerce kopyası arasında tasarımdan sapanları yakalamaktır: takım aşınır, malzeme partisi değişir, ölçüler kayar. Yazılımda bu tür bir sapma neredeyse yoktur. Derlenen ikili dosyanın milyonuncu kopyası ilkiyle bit bit aynıdır. Yazılımdaki hataların hemen hepsi **tasarım hatasıdır**. Ortada tek bir ürün vardır ve o ürün ya doğrudur ya değildir.

Bunun iki sonucu var. Birincisi, yazılımda QC örnekleme yapmaz; tek bir tasarım ürününü, yani gereksinimi, mimariyi, kodu ve test prosedürünü inceler. Gözden geçirme, statik analiz ve test bu yüzden yazılım QC'sinin üç ana aracıdır.

İkincisi, QC "sondaki muayene" değildir. Bir gereksinim belgesini belirsizlik ve test edilebilirlik açısından gözden geçirmek, projenin ilk haftalarında yapılan bir QC faaliyetidir. [Gereksinimler ve Test]({% post_url 2022-05-08-gereksinimler-ve-test-yedi-eksik-baglanti-efsanesi %}) yazısında anlatılan, test uzmanının gereksinim aşamasına katılması da budur. QA ile QC'yi ayıran şey **ne zaman** yapıldıkları değil, **neye baktıklarıdır**: ürüne mi, ürünü üreten sürece mi?

---

## Bir Hata, İki Soru

Farkı somutlaştırmak için gömülü bir birimi ele alalım. Birim sahada kesintisiz çalışırken yaklaşık 50 günde bir kendiliğinden yeniden başlıyor. Laboratuvardaki testlerin hiçbiri birkaç saatten uzun sürmediği için sorun sürümden önce görülmemiş. İnceleme şu satırlara ulaşıyor:

```c
uint32_t deadline = millis() + TIMEOUT_MS;
/* ... */
if (millis() > deadline) {      /* sayaç taşınca yanlış */
    start_recovery();
}
```

`millis()` 32 bitlik bir milisaniye sayacıdır ve 2³² ms ≈ 49,7 günde sıfıra döner. Taşmaya yakın bir anda hesaplanan `deadline` küçük bir sayıya sarar, `millis() > deadline` koşulu beklenenden çok önce doğru olur ve kurtarma yolu yanlışlıkla tetiklenir.

### QC'nin sorusu: Bu ürün nasıl düzelir?

- Karşılaştırma taşmaya dayanıklı hâle getirilir: `if ((uint32_t)(millis() - start) >= TIMEOUT_MS)`. İşaretsiz çıkarma, sayaç sarmış olsa bile geçen süreyi doğru verir.
- Sayacı taşmanın hemen öncesinden başlatan bir regresyon testi eklenir.
- Düzeltme gözden geçirilir, testler koşulur, birim yeni sürüm alır.

Bunların hepsi doğru ve gereklidir. Ama hepsi *bu* hatayla ilgilidir.

### QA'nın sorusu: Bu hata türü süreçten nasıl kaçtı?

- **Gözden geçirme:** Kod incelemesi yapılmış, ama kontrol listesinde zaman, sayaç ve taşmayla ilgili tek bir madde yok. İnceleyen, aramadığı şeyi bulamamış.
- **Kodlama standardı:** Zaman karşılaştırmaları için ortak bir yardımcı fonksiyon tanımlanmamış; her geliştirici kendi kalıbını yazıyor.
- **Test stratejisi:** Test ortamı sayacı her açılışta sıfırdan başlatıyor. 50 günlük bir koşu hiçbir planda yok, olması da gerçekçi değil.
- **Gereksinimler:** "Birim en fazla kaç gün kesintisiz çalışacak?" sorusu hiçbir gereksinimde sorulmamış.

Buradan çıkan aksiyonlar ürünü değil süreci değiştirir: inceleme kontrol listesine bir madde, standarda zaman karşılaştırmaları için onaylı tek bir fonksiyon ve onu zorlayan bir statik analiz kuralı, test ortamında sayacın taşmaya yakın bir değerden başlatılması, gereksinimlere de bir kesintisiz çalışma süresi. Linux çekirdeği bunlardan birini yıllardır uygular: zaman sayacı `jiffies`, açılıştan yaklaşık beş dakika sonra taşacak bir değerden başlatılır. Böylece taşma hataları haftalar sonra değil, her açılışın ilk dakikalarında ortaya çıkar. Kök neden analizi bir QC işi de doğurur: Aynı kalıp kod tabanının başka yerlerinde de var mı?

Bu senaryo teorik değildir. FAA 2015'te yayımladığı bir uçuşa elverişlilik direktifinde, 248 gün boyunca kesintisiz enerjili kalan bir Boeing 787'nin, jeneratör kontrol ünitelerindeki (GCU) bir yazılım sayacı taştığında bütün AC elektrik gücünü kaybedebileceğini bildirdi. Sorun laboratuvar testlerinde fark edilmişti; kalıcı yazılım düzeltmesine kadar uygulanan önlem, uçağın elektriğinin belirli aralıklarla tamamen kesilip yeniden verilmesiydi. (248 gün, 32 bitlik işaretli bir sayaçla santisaniye sayıldığında taşmanın gerçekleştiği süreye denk gelir.)

İki soru iki ayrı döngü kurar:

<div class="mermaid">
flowchart TD
    S["SÜREÇ<br/>planlar, standartlar,<br/>kontrol listeleri"] --> U["ÜRÜN<br/>gereksinim, tasarım, kod"]
    U --> K["KONTROL<br/>inceleme, analiz, test"]
    K -- "hata bulundu" --> D["Düzelt +<br/>regresyon testi"]
    D --> U
    K -. "hata verisi" .-> R["Kök neden:<br/>süreç neden kaçırdı?"]
    R -. "süreç değişikliği" .-> S
    style K fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
    style D fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
    style R fill:#fdf1d8,stroke:#b7791f,stroke-width:2px
    style S fill:#fdf1d8,stroke:#b7791f,stroke-width:2px
</div>

İç döngü (QC, yeşil) ürünü bu sürüm için düzeltir. Dış döngü (QA, turuncu) aynı hatanın bir sonraki üründe oluşma ihtimalini düşürür. Yalnızca iç döngüyü çalıştıran bir ekip, her sürümde aynı türden hataları yeniden bulur ve bunu "test ekibimiz çok iyi" diye yorumlayabilir.

---

## Çoğu Faaliyetin İki Yüzü Vardır

Bir faaliyetin QA mı QC mi olduğunu adı değil, sorduğu soru belirler. Günlük işlerin çoğunun hem ürüne hem sürece bakan bir yüzü vardır:

| Faaliyet | QC yüzü (ürün) | QA yüzü (süreç) |
|---|---|---|
| Kod incelemesi | Bu değişiklikteki hatayı bulmak | Kontrol listesini tanımlamak; incelemenin gerçekten yapılıp kayda geçtiğini denetlemek |
| Statik analiz | Araç bulgularını gidermek | Hangi kural setinin (örneğin [MISRA C]({% post_url 2026-04-05-misra-c-2025-ile-neler-degisti %})) zorunlu olduğuna ve sapmaların nasıl onaylanacağına karar vermek |
| Test | Testi koşmak, hatayı raporlamak | Test stratejisi, kapsam hedefi, giriş/çıkış kriterleri |
| CI hattı | Her birleştirmede kapıları çalıştırmak | "Hiçbir değişiklik kapıyı atlamaz" politikası; kapıların neyi içereceği |
| Hata kaydı | Hatayı düzeltmek | Hatanın türünü ve hangi aşamada kaçtığını sınıflandırıp eğilimi izlemek |
| Kök neden analizi | Aynı kalıbı kod tabanında aramak | Sürecin hangi adımının hatayı kaçırdığını bulup değiştirmek |
| Süreç denetimi | — | Ekibin kendi planlarına uyup uymadığını bağımsız olarak kontrol etmek |

Tablonun dersi şudur: QA ayrı bir ekibin yaptığı ayrı bir iş olmak zorunda değildir. Çoğu zaman zaten yapılan bir QC faaliyetine "bu bize süreç hakkında ne söylüyor?" sorusunu eklemek yeterlidir.

---

## Emniyet Kritik Yazılımda: DO-178C'nin Ayrımı

Sivil havacılık yazılımının temel kılavuzu DO-178C bu ayrımı süreç yapısına gömer. **Doğrulama süreci** (*software verification process*) yaşam döngüsü çıktılarını, yani gereksinimleri, tasarımı, kodu ve testleri, gözden geçirme, analiz ve testle değerlendirir. Bu ürün odaklı bir faaliyettir ve karakteri QC'dir. Standart, doğrulamanın yalnızca test olmadığını, testin genel olarak hataların yokluğunu gösteremeyeceğini özellikle vurgular.

**Yazılım kalite güvence süreci** (*software quality assurance*, SQA) ise ayrı bir süreçtir ve başka sorular sorar: Planlar ve standartlar yazılmış ve gözden geçirilmiş mi? Geliştirme ve doğrulama süreçleri bu planlara ve standartlara uyuyor mu? Aşamalar arası geçiş kriterleri sağlanmış mı? Sertifikasyona sunulan ürün için uygunluk incelemesi (*conformity review*) yapılmış mı?

<div class="mermaid">
flowchart TD
    PL["Planlar ve standartlar<br/>PSAC, SDP, SVP, SQAP"] --> GEL["Geliştirme süreçleri<br/>gereksinim, tasarım, kod"]
    GEL --> CIK["Yaşam döngüsü verisi"]
    CIK --> DOG["Doğrulama süreci<br/>gözden geçirme, analiz, test"]
    DOG -- "problem raporu" --> GEL
    SQA["SQA süreci<br/>bağımsız güvence"] -. "planlara uyuluyor mu?" .-> GEL
    SQA -. "plana göre doğrulandı mı?" .-> DOG
    SQA -. "uygunluk incelemesi" .-> CIK
    style DOG fill:#d5f0d5,stroke:#2e7d32,stroke-width:2px
    style SQA fill:#fdf1d8,stroke:#b7791f,stroke-width:2px
</div>

İki ayrıntı, ayrımın neden ciddiye alındığını gösterir. Birincisi, DO-178C SQA hedeflerinin **bağımsızlıkla** karşılanmasını ister: güvenceyi, güvence verilen işi yapanlardan bağımsız biri sağlar ve bulduğu uyumsuzluğun giderilmesini sağlayacak yetkiye sahiptir. İkincisi, SQA test yazmaz ve test sonuçlarını yeniden hesaplamaz. Testin plana uygun yapıldığını, sonuçların kayda geçtiğini ve problem raporlarının kapatıldığını güvenceye alır. [Sistem Mühendisliği Nedir?]({% post_url 2026-05-26-sistem-muhendisligi-nedir %}) yazısındaki V modelinin sağ kolu doğrulamayı tarif eder; SQA ise V'nin iki kolunun da planlandığı gibi yürüdüğünü gözetir.

---

## Ölçmek: Aynı Veri, İki Okuma

ISTQB müfredatına göre test sonuçlarını hem QC hem QA kullanır: QC hataları düzeltmek için, QA ise geliştirme ve test süreçlerinin ne kadar iyi işlediğini görmek için. Aynı hata kaydı iki ayrı metriğe dönüşür:

- **QC metrikleri** bu ürünün durumunu anlatır: açık hata sayısı ve önem dağılımı, test geçme oranı, yapısal kapsam, statik analiz bulguları.
- **QA metrikleri** sürecin etkinliğini anlatır. En bilineni Capers Jones'un **hata giderme etkinliğidir** (*defect removal efficiency*, DRE): sürümden önce bulunan hataların, sürümden önce ve sonra (genellikle sürümü izleyen ilk 90 günde) bulunan toplam hatalara oranı. Sürümden önce 180, sonra 20 hata bulunduysa DRE %90'dır. Bir adım ötesi aşama bazlı bakıştır. Her hata için "hangi aşamada yapıldı, hangi aşamada bulundu?" diye sorulur. Gereksinim hataları sistematik olarak sistem testinde yakalanıyorsa sorun testte değil, gereksinim incelemesindedir.

Kalite maliyeti de aynı ayrıma oturur. Feigenbaum'a dayandırılan önleme–değerlendirme–hata (*prevention–appraisal–failure*, PAF) modeli, kaliteyle ilgili harcamaları dört gruba ayırır:

| Maliyet türü | Örnek | Karşılığı |
|---|---|---|
| **Önleme** | Eğitim, standartlar, kontrol listeleri, süreç iyileştirme | QA |
| **Değerlendirme** | Gözden geçirme, test, test ortamları, araçlar | QC |
| **İç hata** | Sürümden önce bulunan hatanın düzeltilmesi, yeniden test | QC'nin yakaladığı |
| **Dış hata** | Saha arızası, geri çağırma, destek, itibar kaybı | İkisinin de kaçırdığı |

Crosby'nin "uygunsuzluğun bedeli" son iki satırın toplamıdır ve çoğu organizasyonda hiçbir bütçe kaleminde ayrıca görünmez. Önleme ve değerlendirmeye harcanan para bu bedeli düşürmek için harcanır. [Sistem Mühendisliği Nedir?]({% post_url 2026-05-26-sistem-muhendisligi-nedir %}) yazısındaki hata maliyeti eğrisi, bir hatanın ne kadar geç bulunursa o kadar pahalıya mal olduğunu hatırlatır. "Kalite bedavadır" iddiası da buradan gelir: önleme, maliyetini dış hatadan kurtardığı parayla öder.

Bir uyarı: bu metrikler öğrenmek için vardır. Bulunan hata sayısı test ekibinin, sahada çıkan hata sayısı geliştiricinin performans hedefine bağlandığında, [Analitiğin Dört Hâli]({% post_url 2026-09-22-analitigin-dort-hali-descriptive-diagnostic-predictive-prescriptive %}) yazısında andığımız Goodhart yasası devreye girer. Hatalar "iyileştirme talebi" diye kaydedilmeye, kayıtlar pazarlık konusu olmaya başlar ve QA'nın beslendiği veri kirlenir.

---

## Sık Yapılan Hatalar

- **"QA = test ekibi."** Unvanlar böyle olsa da test ekibinin günlük işi büyük ölçüde QC'dir. Asıl sorun isim değil, sonuçtur: QA bir ekibe havale edildiğinde süreci sorgulamak kimsenin işi olmaz.
- **"Kalite sonda kontrol edilir."** Deming'in uyarısı yazılımda daha da geçerlidir. Dijkstra'nın sözüyle test, hataların varlığını gösterebilir ama yokluğunu asla gösteremez. Sondaki test, ürüne yerleştirilmemiş kaliteyi sonradan ekleyemez.
- **"Süreç iyiyse ürünü incelemeye gerek yok."** İyi bir süreç hata olasılığını düşürür, ama belirli bir ürünün doğru olduğuna dair kanıt üretmez. ISO 9001 belgesi ya da bir olgunluk seviyesi bir sürecin varlığını belgeler, tek bir sürümün hatasız olduğunu değil. Kanıt QC'den gelir. [Dogfooding]({% post_url 2026-09-04-dogfooding-kendi-urununu-kullanmak %}) yazısındaki geri bildirim ile kanıt ayrımının bir benzeri burada da geçerlidir.
- **"Kaliteden QA ekibi sorumludur."** Crosby'nin "kalite, kalite departmanında doğar" diye eleştirdiği varsayımın bugünkü hâlidir. Kod "nasılsa testte bulunur" diye teslim edilir ve test ekibi bir güvenlik ağına dönüşür. Kaliteyi onu üreten sağlar; QA bunun sağlandığına dair güven verir.
- **"Sola kaydırmak QA yapmaktır."** Testi ve incelemeyi erkene çekmek (*shift-left*) değerlidir, ama çoğunlukla QC'yi erkene taşır. Hata erken bulunur, ama yine de yapılmıştır. Hatanın hiç yapılmamasını sağlayan şey dış döngüdür.
- **"QA kâğıt işidir."** Denetim yalnızca kayıtların var olup olmadığına baktığında QA gerçekten kâğıt işine dönüşür. İyi bir denetim, kaydın anlattığı işin gerçekten yapılıp yapılmadığına bakar.

---

## Küçük Bir Ekip İçin Başlangıç

Bağımsız bir QA birimi kurmak her ekip için gerçekçi değildir. Dış döngüyü çalıştırmak için de gerekli değildir:

- **Kaçan her hata için iki soru sorun.** Hata kaydında "nasıl düzeltildi?" alanının yanına "neden daha önce yakalanmadı?" alanını ekleyin. Cevapları birkaç ayda bir toplu okuyun; tekrar eden cevaplar sürecin zayıf noktalarıdır.
- **Kontrol listelerini kendi hatalarınızdan türetin.** Genel geçer yüz maddelik bir liste okunmaz. Kendi kaçan hatalarınızdan çıkan on madde ise inceleyenin aradığı şeyi değiştirir.
- **QC'yi makineye, QA'yı insana bırakın.** Derleme, statik analiz ve testler her değişiklikte otomatik koşmalı. İnsan dikkati "bu tür hatalar neden hâlâ çıkıyor?" sorusuna ayrılmalı.
- **"Bitti"yi yazılı tanımlayın.** Bir işin bitmiş sayılması için gereken inceleme, test ve belge adımlarını yazmak en küçük ve en etkili QA adımıdır. Denetim de ilk olarak buna uyulup uyulmadığına bakar.
- **Denetimi dönüşümlü yapın.** Bir ekip üyesinin, başka bir ekibin yakın tarihli birkaç değişikliğini "tanımlı adımlar izlendi mi?" sorusuyla incelemesi küçük ölçekte bağımsızlık sağlar.

---

## Sonuç

Kalite kontrol ve kalite güvence aynı hedefe farklı yerlerden bakar. QC ürüne bakar ve bugünkü hatayı bulur; QA sürece bakar ve yarınki hatanın oluşmasını engeller. Yalnızca QC'si olan bir ekip aynı hataları her sürümde yeniden bulur. Yalnızca QA'sı olan bir ekip ise süreçlerine uyduğunu belgeler, ama ürününün doğru olduğunu gösteremez.

Ayrımı akılda tutmanın en kısa yolu, bulunan her hata için iki soru sormaktır: "Bunu nasıl düzeltiriz?" ve "Bunun bir daha olmaması için neyi değiştiririz?" İlki kalite kontroldür, ikincisi kalite güvence. Crosby'nin kırk yılı aşkın süre önce söylediği gibi, pahalı olan ikinci soruyu sormak değil, sormamaktır.

---

**Kaynaklar:**

- Philip B. Crosby — *Quality Is Free: The Art of Making Quality Certain* (McGraw-Hill, 1979).
- Philip B. Crosby — *Quality Without Tears: The Art of Hassle-Free Management* (McGraw-Hill, 1984).
- ISO 9000:2015 — *Quality management systems — Fundamentals and vocabulary* (3.3.6 kalite güvence, 3.3.7 kalite kontrol).
- IEEE 610.12-1990 — *IEEE Standard Glossary of Software Engineering Terminology*; yerini alan ISO/IEC/IEEE 24765 — *Systems and software engineering — Vocabulary*.
- ISTQB — *Certified Tester Foundation Level Syllabus v4.0* (2023), bölüm 1.2.2 "Testing and Quality Assurance (QA)".
- RTCA DO-178C — *Software Considerations in Airborne Systems and Equipment Certification* (2011), bölüm 6 (doğrulama) ve 8 (kalite güvence).
- W. Edwards Deming — *Out of the Crisis* (MIT Press, 1986).
- Joseph M. Juran — "The Quality Trilogy", *Quality Progress*, 1986.
- Armand V. Feigenbaum — *Total Quality Control* (McGraw-Hill, 1961).
- Walter A. Shewhart — *Economic Control of Quality of Manufactured Product* (1931).
- Watts S. Humphrey — *Managing the Software Process* (Addison-Wesley, 1989).
- Capers Jones — *Software Quality: Analysis and Guidelines for Success* (1997).
- Edsger W. Dijkstra — "Notes on Structured Programming" (EWD249, 1970).
- FAA — [Airworthiness Directive 2015-09-07, The Boeing Company Airplanes (787)](https://www.federalregister.gov/documents/2015/05/01/2015-10066/airworthiness-directives-the-boeing-company-airplanes).

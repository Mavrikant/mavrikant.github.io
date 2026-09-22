---
title: "Analitiğin Dört Hâli: Descriptive, Diagnostic, Predictive, Prescriptive"
subtitle: "The Four Types of Analytics: Descriptive, Diagnostic, Predictive and Prescriptive"
background: "/img/posts/analitigin-dort-hali-cover.webp"
date: '2026-09-22 09:00:00'
layout: post
lang: tr
mermaid: true
categories: [muhendislik]
tags: [veri-analitigi, yoneylem-arastirmasi]
---

Çoğu ekibin veriyle ilişkisi aynı sahneyle başlar: bir gösterge paneli (*dashboard*) açılır, ekranda on beş grafik vardır, hepsi doğrudur, hiçbiri bir şey yaptırmaz; karar yine "bence" ile verilir. Sorun verinin azlığı değil, **sorulan sorunun türünün farkında olmamaktır.** "Ne oldu?", "neden oldu?", "ne olacak?" ve "ne yapmalıyız?" farklı yöntem ve farklı kanıt standardı isteyen dört ayrı sorudur. Bunlara sırasıyla **descriptive** (betimleyici), **diagnostic** (tanısal), **predictive** (öngörücü) ve **prescriptive** (kuralkoyucu) analitik denir.

Sınıflandırmanın kökleri, Davenport ve Harris'in 2007 tarihli *Competing on Analytics* kitabına ve INFORMS'un 2010'da yayımladığı "The Analytics Journey" makalesindeki descriptive–predictive–prescriptive üçlüsüne dayanır. Bugün en yaygın olan dörtlü hâlini, araya diagnostic'i ekleyen Gartner'ın "analitik yükseliş modeli" (*Analytic Ascendancy Model*) yerleştirdi. Etiketler yeni olsa da en üst basamağın motoru, 1950'lerden beri gelişen yöneylem araştırmasıdır.

Bu yazıda dört seviyeyi tek bir örnek üzerinden ele alacağız: sahada birkaç bin adedi çalışan bir elektronik birimin (LRU, *line-replaceable unit*) arıza verisi ve kapasitesi, stoğu ve bütçesi sınırlı bir bakım ekibi.

---

## Dört Seviyeye Kuşbakışı

| Seviye | Soru | Amaç | Örnekteki karşılığı |
|---|---|---|---|
| **Descriptive** | Ne oldu? | Geçmişi doğru özetlemek | Son üç ayda arıza oranı bin saatte 0,8'den 1,9'a çıktı |
| **Diagnostic** | Neden oldu? | Sebebi bulmak | Artış Parti 7'den geliyor; kök neden tedarikçisi değişen bir kondansatör |
| **Predictive** | Ne olacak? | Geleceği kestirmek | Parti 7'deki bir birimin önümüzdeki 500 saatte arızalanma olasılığı %30 |
| **Prescriptive** | Ne yapmalıyız? | En uygun eylemi seçmek | Parti 7'deki 120 birimi kapasiteye göre sıraya koyup planlı bakımda değiştir |

Seviyeler bağımsız değildir: **her biri bir öncekinin çıktısını girdi olarak kullanır.** Kök nedeni bilinmeyen bir arızanın seyri güvenilir biçimde tahmin edilemez; riski bilinmeyen bir birim için doğru bakım kararı verilemez. Alınan eylemin sonucu da yeniden ölçülür ve zincir bir döngüye dönüşür:

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

---

## 1. Descriptive Analytics — "Ne oldu?"

Betimleyici analitik ham veriyi toplamlar, oranlar, dağılımlar ve kırılımlarla özetler; sebep aramaz, tahmin yapmaz. Hesaplar basittir; zorluk **tanımlardadır**. "Arıza", müşterinin geri gönderdiği her birim mi, yoksa laboratuvarda hatası doğrulananlar mı? (Geri dönen birimlerin ciddi bir kısmında hata bulunamaz; sektör buna **NFF**, *no fault found*, der.) Çalışma saati sayaçtan mı geliyor, tahminden mi? Bu sorular netleşmeden üretilen her sayı *garbage in, garbage out* kuralına tabidir.

Tanımlar oturduktan sonra iki alışkanlık bu katmanı değerli kılar:

- **Ortalamayla yetinmemek.** Ortalama onarım süresi 3 gün olabilir; ama kuyrukta 40 gün bekleyen müşteriler varsa asıl hikâye oradadır. Yüzdelikler (p50, p90, p99) de raporlanmalıdır; [Ölçüm Belirsizliği]({% post_url 2026-05-06-olcum-belirsizligi-gum-annex-f-ncsli-rp-12 %}) yazısındaki gibi, yanında değişkenliği olmayan bir sayı eksiktir.
- **Gürültüyü sinyalden ayırmak.** Kararlı bir süreçte de sayılar dalgalanır. Walter Shewhart'ın **istatistiksel süreç kontrolü** (*SPC*), kontrol sınırları içinde kalan hareketi olağan (*common cause*), sınırları aşanı özel nedenli (*special cause*) sayar. Örneğimizdeki 0,8'den 1,9'a sıçrama ikinci türdendir ve açıklanmayı hak eder.

---

## 2. Diagnostic Analytics — "Neden oldu?"

Tanısal analitik bu olguyu açıklar. Başlıca araçları detaya inme ve dilimleme (*drill-down*), Pareto analizi, korelasyon ve hipotez testi, kök neden analizi (5 Neden, Ishikawa, hata ağacı) ve nedensel çıkarımdır (A/B testi, fark-içinde-fark). Örneğimizde zincir şöyle ilerler:

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

İki şeyin birlikte hareket etmesi, birinin diğerine sebep olduğu anlamına gelmez. Bu katmanın tuzakları buradan doğar:

- **Karıştırıcı değişken:** Yeni yazılım sürümlü birimler daha çok arızalanıyor görünebilir; ama sürüm önce en yoğun kullanılan birimlere yüklendiyse asıl neden kullanım yoğunluğudur.
- **Hayatta kalan yanlılığı:** Yalnızca geri dönen birimlere bakan, sahada sessizce çalışanları görmez. Wald'ın uçak zırhı örneğindeki gibi: üsse dönen uçaklardaki delikler, zırhın *gerekmediği* yerleri gösterir.
- **Ortalamaya dönüş:** Kötü bir aydan sonraki iyileşme, alınan önlemin değil istatistiğin eseri olabilir; bir önlemin etkisini kanıtlamak için kontrol grubu gerekir.
- **Simpson paradoksu:** Alt gruplarda geçerli bir ilişki, gruplar birleşince tersine dönebilir.

Pratik kural: **bir açıklamayı kabul etmeden önce onu çürütecek veriyi arayın.** Kondansatör suçluysa, aynı kondansatörü kullanan başka partilerde de artış görülmelidir.

---

## 3. Predictive Analytics — "Ne olacak?"

Öngörücü analitik, geçmişten öğrendiği örüntüyü geleceğe uzatır; çıktısı bir kehanet değil, **bir olasılıktır**. Araçları regresyon, sınıflandırma, zaman serisi modelleri, güvenilirlik mühendisliğinin temel aracı olan hayatta kalma analizi (Weibull, "küvet eğrisi"), makine öğrenmesi ve [Kalman Filtresi]({% post_url 2026-06-02-kalman-filtresi %}) gibi durum kestiricileridir.

Örneğimizde diagnostic bulgusu modele doğrudan girer: parti bilgisi, sıcaklık çevrimi sayısı ve çalışma saatinden her birime bir risk skoru üretilir. Parti 7'deki bir birimin önümüzdeki 500 saatte arızalanma olasılığı %30, diğer partilerde %3'tür. Bu sayıya güvenebilmek için:

- **Zamana göre doğrulayın.** Rastgele eğitim/test ayrımı modele geleceği sızdırır (*data leakage*).
- **Naif bir tahmini geçin.** "Geçen ayın değeri" gibi bir taban çizgisini (*baseline*) geçemeyen modelin karmaşıklığı yalnızca maliyettir.
- **Doğru metriği seçin.** Birimlerin %2'si arızalanıyorsa "hiçbiri arızalanmaz" diyen model %98 doğrudur ve işe yaramaz; nadir olaylarda kesinliğe (*precision*) ve duyarlılığa (*recall*) bakılır.
- **Kalibrasyonu kontrol edin.** "%30 risk" denen birimlerin gerçekten yaklaşık %30'u arızalanmalıdır; tahmin bir maliyet hesabına girecekse bu şarttır.
- **Belirsizliği gösterin.** "48 arıza" ile "48 ± 20 arıza" farklı kararlar doğurur. [Antikırılgan]({% post_url 2026-06-24-antikirilgan-belirsizlikten-guc-alan-sistemler %}) yazısındaki bakışla: amaç geleceği tam bilmek değil, yanılma ihtimaline karşı doğru konumlanmaktır.
- **Kaymayı izleyin** (*drift*). Tedarikçi, kullanım ya da yazılım değiştiğinde model sessizce bozulur.

---

## 4. Prescriptive Analytics — "Ne yapmalıyız?"

%30'luk risk "bakım yap" demez; yalnızca gidişat sürerse ne olacağını söyler. Kuralkoyucu analitik bu olasılığa maliyetleri, seçenekleri ve kısıtları ekleyip **bir eylem seçer.** Çoğu zaman amaç tahmini yanlış çıkarmaktır: arızayı önleyen bakım, modeli kâğıt üzerinde "yanıltır" ama tam olarak işini yapmasını sağlar.

En yalın hâli seçenekleri karşılaştırmaktır. Parti 7'deki bir birimi planlı bakımda değiştirmek 1.000 €, sahada arızalanması (yedek parça, plansız yer süresi, sefer iptali) yaklaşık 12.000 € tutuyor:

| Seçenek | Beklenen maliyet |
|---|---|
| Birimi planlı bakımda şimdi değiştir | 1.000 € |
| Ertele, arızalanırsa değiştir | 0,30 × 12.000 € = 3.600 € |

Karar nettir: **şimdi değiştir.** Asıl zorluk, aynı kararı 120 birim için, haftada ancak 30 birime yeten atölye kapasitesi ve sınırlı kondansatör stoğu altında vermektir. Bu artık bir optimizasyon problemidir: her birim için "bu hafta bakıma alınsın mı?" kararı verilir, toplam beklenen maliyet (bakım maliyetleri artı bakıma alınmayanların arıza olasılığı × arıza maliyeti) en aza indirilir, kapasite ve stok kısıt olarak girer. Evet/hayır kararlarından oluşan bu yapı, [Yöneylem Araştırması Yöntemleri]({% post_url 2026-04-14-operasyonel-arastirma-yontemleri %}) yazısında ele aldığımız tam sayılı programlamadır.

Optimizasyon tek araç değildir. Sistem analitik olarak modellenemeyecek kadar karmaşıksa simülasyon (Monte Carlo, kesikli olay), ardışık ve belirsiz kararlar için karar ağaçları kullanılır. Çoğu zaman "Parti 7 birimlerinde bakım aralığını 500 saatten 400 saate indir" gibi basit bir **karar kuralı** da yeterlidir ve uygulanması en kolay reçetedir.

Bu katmanın en sık hatası, optimal ama uygulanamaz bir plan üretmektir. Kondansatörün tedarik süresi altı haftaysa ya da bir müşterinin sözleşmesi birimlerin sökülmesine izin vermiyorsa, bunları bilmeyen model sahada boşa düşer. İyi bir model çözücünün gücüyle değil, **gerçek kısıtları içermesiyle** iyidir. Tek bir cevap yerine senaryolar sunmak da ("kapasite haftada 10 birim artarsa maliyet şu kadar düşer") kararı kolaylaştırır.

Eylemin ardından döngü kapanır: arıza oranı yeniden 0,8'e inerse kök neden doğru bulunmuştur; inmezse diagnostic hipotez eksiktir. [Sistem Mühendisliği Nedir?]({% post_url 2026-05-26-sistem-muhendisligi-nedir %}) yazısındaki doğrulama fikrinin veri tarafındaki karşılığı budur: etkisi ölçülmeyen bir karar öğrenmeye dönüşmez.

---

## Sık Yapılan Hatalar

- **Merdiveni atlamak.** Ekip "geçen ay kaç arıza oldu?" sorusunu tutarlı yanıtlayamazken makine öğrenmesi projesi başlatır; tanımları belirsiz veriyle eğitilen modele kimse güvenmez. Descriptive katman sıkıcıdır ama pazarlığa açık değildir.
- **İşi yanlış adlandırmak.** Üzerine eğilim çizgisi çizilmiş bir rapor "öngörücü analitik", iyi kurulmuş bir optimizasyon modeli "yapay zekâ" diye sunulur. Yanlış ad, yanlış beklenti ve yanlış kabul kriteri üretir; bir işin hangi soruyu yanıtladığına bakmak, onu doğru adlandırmaya yeter.
- **Ölçütü hedefe çevirmek.** Goodhart yasasına göre hedef hâline gelen bir ölçüt, iyi bir ölçüt olmaktan çıkar. Arıza sayısı performans hedefine bağlanınca kayıtlar "kullanıcı hatası" diye sınıflanmaya başlar ve merdivenin temeli aşınır.

---

## Nereden Başlamalı?

İşe merdivenin altından değil, **iyileştirilmek istenen karardan geriye doğru** başlanmalıdır. Soru "hangi seviyedeyiz?" değil, "bu kararı ne engelliyor?" sorusudur:

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

- **Eylemi baştan tasarlayın.** Bir grafiği kurmadan önce "bu sayı değişirse ne yapacağız?" sorusuna yazılı bir cevabınız olsun; yoksa o grafik dekordur.
- **"Yeterince iyi" olunca ilerleyin.** Tanımlar tutarlı ve veri kalitesinin sınırları biliniyorsa bir üst basamağa geçilebilir; kusursuzluk beklemek ilerlemeyi durdurur.
- **Tepeye çıkmak zorunlu değildir.** Bazı kararlar için iyi bir kontrol grafiği, en gelişmiş tahmin modelinden daha değerlidir.

---

## Sonuç

Dört seviye dört ayrı teknoloji değil, aynı döngünün dört sorusudur. Çerçevenin asıl değeri, ekibe ortak bir dil vermesidir. "Bir yapay zekâ projesi yapalım" bir şey ifade etmez; "önce artışın kaynağını bulacağız, sonra birimlere risk skoru üreteceğiz, en sonunda bakım planını kapasiteye göre optimize edeceğiz" ise her adımının ne zaman bittiği belli olan bir yol haritasıdır.

---

**Kaynaklar:**

- Thomas H. Davenport, Jeanne G. Harris — *Competing on Analytics: The New Science of Winning* (Harvard Business Review Press, 2007).
- Irv Lustig, Brenda Dietrich, Christer Johnson, Christopher Dziekan — "The Analytics Journey", *Analytics Magazine* (INFORMS), Kasım/Aralık 2010.
- Gartner — [Gartner Glossary: Prescriptive Analytics](https://www.gartner.com/en/information-technology/glossary/prescriptive-analytics).
- Walter A. Shewhart — *Economic Control of Quality of Manufactured Product* (1931). Ayrıca [Statistical process control (Wikipedia)](https://en.wikipedia.org/wiki/Statistical_process_control).
- Judea Pearl, Dana Mackenzie — *The Book of Why: The New Science of Cause and Effect* (Basic Books, 2018).
- Abraham Wald — [Survivorship bias (Wikipedia)](https://en.wikipedia.org/wiki/Survivorship_bias).
- Charles Goodhart — [Goodhart's law (Wikipedia)](https://en.wikipedia.org/wiki/Goodhart%27s_law).

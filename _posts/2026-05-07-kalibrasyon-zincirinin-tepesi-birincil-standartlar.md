---
title: "Saatçinin Saatini Kim Kalibre Eder? Kalibrasyon Zincirinin Tepesi"
subtitle: "Who Calibrates the Calibrators? The Top of the Traceability Chain"
background: "/img/posts/9.webp"
date: '2026-05-07 09:00:00'
layout: post
lang: tr
mermaid: true
---

<script src="https://cdn.plot.ly/plotly-basic-2.27.0.min.js"></script>

Akreditasyon denetimi sabahı. Denetçi elinde bir kalem, masanızdaki Keysight 34465A multimetreyi gösteriyor.

— "Bu cihazı neyle kalibre ediyorsunuz?"
— "Yan rafta duran Fluke 5720A kalibratörle."
— "Peki Fluke 5720A neyle kalibre edildi?"
— "Geçen yıl TÜBİTAK UME'ye gönderdik."
— "Peki UME neyle kalibre etti?"

Kısa bir sessizlik. Cevabı tahmin ediyorsunuz ama ifadeyi bulamıyorsunuz: *daha iyi bir kalibratörle*. Peki o kalibratör neyle? *Daha iyisiyle.* Sonra? Sonsuza mı gidiyor bu zincir?

[Bir önceki yazıda]({% post_url 2026-05-06-olcum-belirsizligi-gum-annex-f-ncsli-rp-12 %}) bir cihazın belirsizliğinin nasıl hesaplandığını adım adım gördük. Belirsizlik bütçesinin son satırında "kalibrasyon belgesi (UME, k=2)" diye bir kaynak vardı; o satıra bir sayı yazıp geçtik. Bu yazıda o satırın **arkasını** açacağız. Kalibrasyon belgesindeki belirsizlik nereden geliyor? UME bu sayıyı nasıl üretiyor? Ve zincirin en tepesindeki cihazlar — ki onlar bu sektörün gerçekten en hassas ölçüm aletleri — *nasıl* doğrulanıyorlar?

Cevap, mühendislikten yavaş yavaş fiziğe doğru kayıyor. Zincirin tepesinde başka bir cihaz yok. Doğa yasaları var.

---

## İzlenebilirlik Piramidi

Önceki yazıda izlenebilirlik zincirini lineer bir akış olarak çizmiştik: SI → UME → akredite lab → cihaz. Aslında bu akış bir piramidin yan kesiti. Tepede bir avuç birincil standart var; tabanda dünyadaki milyonlarca ölçüm cihazı.

<div class="mermaid">
flowchart TB
    SI["<b>Seviye 0</b> &nbsp; SI Birim Tanımları<br/>7 doğa sabiti — h, c, e, k, N_A, Δν_Cs, K_cd<br/><i>belirsizlik: tanım gereği sıfır</i>"]
    PRI["<b>Seviye 1</b> &nbsp; Birincil Standartlar<br/>NMI'ler — UME, NIST, PTB, NPL, BIPM<br/>Sezyum fıskiyesi, Kibble terazisi, Josephson, kuantum Hall<br/><i>belirsizlik: 10⁻⁹ – 10⁻¹⁶</i>"]
    REF["<b>Seviye 2</b> &nbsp; İkincil / Transfer Standartlar<br/>Akredite kalibrasyon laboratuvarları, TÜRKAK<br/>Fluke 732C, ESI SR104, Agilent 3458A<br/><i>belirsizlik: 10⁻⁷ – 10⁻⁸</i>"]
    WORK["<b>Seviye 3</b> &nbsp; Çalışma Standartları<br/>Sanayinin lab referansı<br/>Fluke 5720A/5730A, Druck DPI 620<br/><i>belirsizlik: 10⁻⁶</i>"]
    UUT["<b>Seviye 4</b> &nbsp; Saha Cihazları (UUT)<br/>Multimetre, basınç sensörü, sıcaklık probu<br/><i>belirsizlik: 10⁻⁴ – 10⁻⁵</i>"]
    SI --> PRI --> REF --> WORK --> UUT
    style SI fill:#1a73e8,color:#fff,stroke:#0c4ea2,stroke-width:2px
    style PRI fill:#2e7d32,color:#fff,stroke:#1b5e20,stroke-width:2px
    style REF fill:#e8711a,color:#fff,stroke:#a14b00,stroke-width:2px
    style WORK fill:#c62828,color:#fff,stroke:#8a1010,stroke-width:2px
    style UUT fill:#6a1b9a,color:#fff,stroke:#3c0d59,stroke-width:2px
</div>

Piramidi okumanın iki yolu var. Yukarıdan aşağı baktığınızda her seviyede **belirsizlik artar, maliyet düşer, erişim genişler**. Aşağıdan yukarı baktığınızda her cihaz "bir üstündeki seviyenin daha hassas örneğine" karşı kalibre edilir. Bu mantığın doğal sonucu, en üstte de bir cihaz olması gerektiği — ve onun da bir başkasına karşı kalibre edilmesi gerektiği. Ama bir yerde durması lazım. Yoksa kalibrasyon kavramının kendisi anlamsız.

| Seviye | Tipik cihaz | Kim sahibi | Tipik belirsizlik (10 V için) |
|--------|-------------|------------|-------------------------------|
| 0 | (cihaz yok, doğa sabiti) | doğa | 0 (tanım) |
| 1 | Programlanabilir Josephson voltaj standardı | UME, NIST, PTB | ~0,05 µV (5 ppb) |
| 2 | Fluke 732C / ESI SR104 / Agilent 3458A | TÜRKAK akrediteli lab | ~5 µV (0,5 ppm) |
| 3 | Fluke 5720A / 5730A | Sanayi lab | ~50 µV (5 ppm) |
| 4 | Keysight 34465A multimetre | Test mühendisi | ~500 µV (50 ppm) |

Piramidin her seviyesinde belirsizlik yaklaşık **bir mertebe** (10×) artıyor. Bu rastlantı değil. Pratik bir kuraldır: **referans cihazınız, kalibre edeceğiniz cihazdan en az dört kat daha iyi olmalı** (TUR ≥ 4 kuralı, önceki yazıdaki Z540.3 sınırı). Üreticiler ve akredite laboratuvarlar piramidi bu kurala göre kurarlar; tipik aralık 4 ile 10 arasında değişir. Daha iyi olmak şart değil çünkü pahalı; ama 4'ün altına düşmek de pratik olarak kararı bozar.

---

## "Kim Kalibre Eder?" Sorusunun Sonu

Şimdi denetçinin sorusuna geri dönelim. Piramitte hep yukarı çıkıyoruz: cihaz, kalibratör, transfer standardı, NMI'nin birincil standardı. Sonunda Seviye 1'e ulaşıyoruz. UME'deki sezyum fıskiyesi. Kibble terazisi. Josephson eklem dizisi. **Bunları kim kalibre ediyor?**

Yanıt iki kademede gelir.

İlk kademe pratiğin cevabıdır: **kimse**. Birincil standart başka bir cihaza karşı doğrulanmaz. Çünkü daha hassası yok. Eğer birinci sınıf bir Josephson voltaj standardından sapma görmek isterseniz, bunu görmenin tek yolu **başka bir Josephson standardı** ile karşılaştırmaktır. Bu da "kalibrasyon" değil, **karşılaştırma** olarak tanımlanır. (Bu konuya bölüm 6'da döneceğiz.)

İkinci kademe felsefenin cevabıdır: **doğa yasaları**. Modern birincil standartlar, başka bir cihazın değerlerine karşı değil, **fiziğin sabit niceliklerine** karşı tanımlanır. Sezyum fıskiyesinin doğru çalışıp çalışmadığını anlamanın yolu, ürettiği frekansın gerçekten sezyum-133 atomunun hiperince geçişine denk düşüp düşmediğine bakmaktır. Bu geçiş frekansı (Δν_Cs) ise **tam tanım gereği** 9 192 631 770 Hz'tir; SI saniyesi tam olarak böyle tanımlanmıştır.

Yani saat "kalibre" edilmez. **Sayar.** Saatin görevi sezyum-133 atomlarını gözlemleyip kaç hiperince geçiş geçtiğini saymaktır. Eğer 9 192 631 770 saymışsa, üzerinden 1 saniye geçmiş demektir. Tanım, fizik ve cihaz aynı şeyi söylüyor.

Tarih boyunca her zaman böyle değildi.

1889'dan 2019'a kadar **kilogram**ın tanımı şöyleydi: "Uluslararası Kilogram Prototipi (IPK), Saint-Cloud'daki Pavillon de Breteuil'de (posta adresi: Sèvres) BIPM kasasında saklanan platin-iridyum silindirin kütlesi." Yani dünyadaki *bir tek* gerçek 1 kg vardı; o silindir. Diğer her şey ona göre tanımlanmıştı. IPK günlük çalışma için kullanılmıyordu; yanında BIPM'in kendi yedekleri (témoin) ve bir avuç çalışma standardı vardı. Tarih boyunca yalnızca dört defa kasadan çıkarıldı — 1889 onayı ve üç doğrulama kampanyası (1939-46, 1989-92, 2014). Bu kampanyalarda BIPM yedekleri ve ülkelerin ulusal prototipleri (K20, K54...) IPK ile karşılaştırıldı. IPK'nın kendisinin bir kalibrasyonu yoktu — *o*, kalibrasyonun referansıydı.

Sorun şuydu: özellikle 1989-92 karşılaştırmasında, IPK ile resmi yedekleri arasında ortalama yaklaşık **50 µg**'lık bir farklılaşma raporlandı (yedeklerin çoğu IPK'ya göre kütle kazandı, ya da IPK kütle kaybetti). Yaklaşık bir asırlık değişim 50 mikrogram. Az gibi duruyor — ama önemli olan miktarı değil, ilkesi: **eğer 1 kg'ın tanımı bu silindirse**, silindir değişirse 1 kg da değişir. Mantık olarak silindirin *yanlış* olması mümkün değildi. Yanlış olan, dünyadaki diğer tüm 1 kg ölçümleriydi.

Bu durum, dünyanın en hassas ölçümlerini yapan kuruluşları rahatsız etti. Birim tanımı bir esere bağlıyken, eserin iyi durumda olup olmadığından asla emin olamazdınız.

16 Kasım 2018'de BIPM'in **26. Genel Konferansı (CGPM)** çözümü oybirliğiyle kabul etti: SI birimleri artık eserlere değil, **doğa sabitlerine** bağlanacak. Planck sabiti tam değer atandı, belirsizlik sıfır. IPK emekli edildi. Aynı şey amper, kelvin ve mol için de yapıldı. Yeni tanımlar 20 Mayıs 2019'da — Metre Konvansiyonu'nun 144. yıl dönümünde, yani Dünya Metroloji Günü'nde — yürürlüğe girdi.

Bu, 130 yılın en büyük metroloji reformuydu. Ve şimdi zincirin tepesinde *cihaz* yok; *fizik* var.

> **Akılda kalsın — birincil standart kalibre edilmez:** Bir sezyum fıskiyesini "şuna karşı kalibre ettik" diyemezsiniz. Sadece başka bir sezyum fıskiyesiyle **karşılaştırırsınız**. Anlaşmazlık olursa fizik konuşur, cihaz değil.

---

## 2019 Devrimi: Sabitler Tanımlanır, Birimler Türetilir

Reformun mantığı tek satırla şu: önceden birim tanımı belliydi, doğa sabiti ölçülürdü; şimdi doğa sabiti tanımlıdır, birim ölçülür.

<div class="mermaid">
flowchart LR
    subgraph eski["1889 – 2019: Eserden Birime"]
        A1["Eser<br/>(IPK, metre çubuğu)"] --> A2["Birim<br/>(kg, m)"]
        A2 --> A3["Sabit<br/>(h, c) ölçülür"]
    end
    subgraph yeni["2019 sonrası: Sabitten Birime"]
        B1["Sabit<br/>(h, c, e, k, ...)<br/><i>tam değer atanır</i>"] --> B2["Birim<br/>(kg, m, A, K, ...)"]
        B2 --> B3["Gerçekleme<br/>(Kibble, Josephson, ...)"]
    end
    style A1 fill:#fce4ec,stroke:#c2185b
    style A2 fill:#f8bbd0,stroke:#c2185b
    style A3 fill:#f48fb1,stroke:#c2185b
    style B1 fill:#e3f2fd,stroke:#1565c0
    style B2 fill:#90caf9,stroke:#1565c0
    style B3 fill:#42a5f5,stroke:#1565c0,color:#fff
</div>

Reformun yarım asrı bulan tarihsel dönüm noktaları:

<div class="mermaid">
flowchart TB
    Y1875["<b>1875</b><br/>Metre Konvansiyonu imzalandı<br/>BIPM kuruldu"]
    Y1889["<b>1889</b><br/>1. CGPM<br/>IPK ve metre prototipi onaylandı<br/><i>(eserlerle tanım çağı başlar)</i>"]
    Y1960["<b>1960</b><br/>11. CGPM<br/>SI resmi olarak ilan edildi<br/>metre kripton-86'ya bağlandı"]
    Y1967["<b>1967</b><br/>13. CGPM<br/>saniye sezyum-133'e bağlandı<br/><i>(ilk fiziksel sabit tabanlı tanım)</i>"]
    Y1983["<b>1983</b><br/>17. CGPM<br/>metre ışık hızıyla tanımlandı<br/>(c = tam değer)"]
    Y2005["<b>2005</b><br/>CIPM tavsiyesi<br/>kilogramın yeniden tanımı önerildi"]
    Y2018["<b>2018-11-16</b><br/>26. CGPM oybirliği<br/>h, e, k, N_A tam değer atandı"]
    Y2019["<b>2019-05-20</b><br/>Yeni SI yürürlükte<br/><i>(IPK emekli; tüm tanımlar sabit tabanlı)</i>"]
    Y1875 --> Y1889 --> Y1960 --> Y1967 --> Y1983 --> Y2005 --> Y2018 --> Y2019
    style Y1875 fill:#fce4ec,stroke:#c2185b
    style Y1889 fill:#f8bbd0,stroke:#c2185b
    style Y1960 fill:#e1bee7,stroke:#7b1fa2
    style Y1967 fill:#d1c4e9,stroke:#512da8
    style Y1983 fill:#c5cae9,stroke:#3949ab
    style Y2005 fill:#bbdefb,stroke:#1565c0
    style Y2018 fill:#90caf9,stroke:#1565c0
    style Y2019 fill:#1a73e8,color:#fff,stroke:#0c4ea2,stroke-width:2px
</div>

Eski sistemde Planck sabitinin "ölçülmüş değeri" vardı, sürekli daha hassas ölçüm yapmaya çalışıyorduk. Yeni sistemde Planck sabiti **tam olarak** 6,626 070 15 × 10⁻³⁴ J·s. Belirsizlik sıfır, çünkü tanım böyle. Ölçtüğümüz şey artık Planck sabiti değil — **kilogram**. Yani Kibble terazisi, kilogramı Planck sabitinden ne kadar iyi *gerçekleyebildiğimizi* sınar.

Yedi tanımlayıcı sabit (defining constants):

| Sabit | Sembol | Tam değer | Tanımladığı SI birimi |
|-------|--------|-----------|------------------------|
| Sezyum-133 hiperince geçiş frekansı | Δν_Cs | 9 192 631 770 Hz | saniye (s) |
| Vakumda ışık hızı | c | 299 792 458 m/s | metre (m) |
| Planck sabiti | h | 6,626 070 15 × 10⁻³⁴ J·s | kilogram (kg) |
| Temel yük | e | 1,602 176 634 × 10⁻¹⁹ C | amper (A) |
| Boltzmann sabiti | k | 1,380 649 × 10⁻²³ J/K | kelvin (K) |
| Avogadro sabiti | N_A | 6,022 140 76 × 10²³ mol⁻¹ | mol |
| 540 THz ışınım için aydınlanma etkinliği | K_cd | 683 lm/W | kandela (cd) |

Tablonun anlamı şu: bu yedi sayıyı doğa kanunu olarak kabul ediyoruz. Diğer her şey buradan türüyor. Saniye Δν_Cs'den, metre c × s'den, kilogram h'den, amper e'den, kelvin k'den... Dünyanın her yerinde aynı yedi sayı kullanılıyor; herkes aynı birime sahip.

Pratik bir test: bir Türk laboratuvarındaki 1 kg ile bir Alman laboratuvarındaki 1 kg birbirinden farklı olabilir mi? Eski sistemde **evet** — Türk silindiri Sèvres'deki orijinalden ne kadar farklılaştığına bağlı. Yeni sistemde **hayır** — her ikisi de aynı Planck sabitinden türetiliyor; en kötü ihtimalle gerçekleme cihazlarının belirsizliği kadar farklılık olur, sistematik bir kayma yok.

> **Akılda kalsın — gerçekleme (realization) ile kalibrasyonun farkı:** Kalibrasyon, bir cihazın değerini *üst seviyedeki* başka bir cihaza göre düzeltmektir. Gerçekleme, bir cihazın değerini *birim tanımına* — yani fiziksel bir olguya — göre üretmektir. Birincil standart kalibre edilmez, birimi gerçekler.

---

## Birincil Standartlar Yakın Plan

Sırayla altı birimin birincil gerçeklenişine bakalım. Her biri için soracağımız sorular: cihaz nedir, hangi sabite dayanır, tipik belirsizlik nedir, dünyada ve Türkiye'de kim çalıştırıyor.

### Saniye: Sezyum Fıskiyesi ve Optik Saatler

SI tüm birimleri arasında en hassas tanımlananı saniyedir. Çünkü sezyum-133 atomunun hiperince geçişi, doğanın sunduğu en kararlı periyodik olgu sayılıyor.

İlk pratik sezyum atomik saati 1955'te NPL'de (İngiltere) Louis Essen ve Jack Parry tarafından yapıldı; sıcak bir fırından çıkan atom demetini frekans rezonansından geçiren bir düzendi, doğruluğu 1×10⁻⁹ mertebesindeydi. **Sezyum fıskiyesi** ise modern tasarım: atomlar lazerle soğutuluyor (mikrokelvin mertebesinde), yukarı doğru fırlatılıyor, yerçekimiyle aşağı düşüyor. Bu "fıskiye" geometrisi atomların rezonans bölgesinden iki kez geçmesini sağlıyor — birincide frekansı işaretliyor, ikincide kontrol ediyor. Daha uzun gözlem süresi, daha keskin rezonans, daha düşük belirsizlik.

<div class="mermaid">
flowchart TB
    OVEN["Sezyum atom kaynağı<br/>(katı sezyum-133, ısıtılır)"]
    COOL["Lazer soğutma<br/>µK seviyesine indir"]
    TOSS["Yukarı doğru lazerle fırlat<br/>(saniyede ~5 m hız)"]
    UP["Yukarı çıkış<br/>mikrodalga kavitesinden geç (1. geçiş)"]
    PEAK["Tepe noktası<br/>(yerçekimi atomları durdurur)"]
    DOWN["Aşağı düşüş<br/>aynı kaviteden tekrar geç (2. geçiş)"]
    DETECT["Floresan dedektörü<br/>kaç atom 'işaretli' durumda?"]
    SERVO["Mikrodalga frekansını ayarla<br/>maksimum işaretli atom sayısı için"]
    OVEN --> COOL --> TOSS --> UP --> PEAK --> DOWN --> DETECT --> SERVO
    SERVO -.-> UP
    style OVEN fill:#fce4ec,stroke:#c2185b
    style COOL fill:#e1bee7,stroke:#7b1fa2
    style TOSS fill:#c5cae9,stroke:#3949ab
    style UP fill:#bbdefb,stroke:#1565c0
    style PEAK fill:#b3e5fc,stroke:#0277bd
    style DOWN fill:#bbdefb,stroke:#1565c0
    style DETECT fill:#c8e6c9,stroke:#388e3c
    style SERVO fill:#fff9c4,stroke:#f57f17
</div>

Tipik kararlılıklar:

- 1955 NPL sezyum demet saati (Essen-Parry): ~10⁻⁹ (~30 yılda 1 s — yine de mekanik saatlerden bin kat daha iyi)
- Klasik sezyum demet saati (1990'lar): ~10⁻¹³ – 10⁻¹⁴
- Modern sezyum fıskiyesi (NIST-F1 hâlâ aktif, PTB-CSF1/CSF2): ~5×10⁻¹⁶ – 1×10⁻¹⁵
- En iyi optik latis saati (JILA/NIST stronsiyum, 2024): 8,1×10⁻¹⁹

10⁻¹⁶ kararlılık ne demek? Saat ~300 milyon yılda 1 saniye sapar demek. 8×10⁻¹⁹'un anlamı ise **evrenin yaşının iki katı boyunca 1 saniyeden az sapma**.

Sezyum saatinin doğruluğu yetmiş yılda yaklaşık 10 milyar kat iyileşti — bilim tarihinde belki de en büyük tek kuantitatif ilerleme:

<div id="grafik-saat-tarihi" style="width:100%;max-width:760px;margin:1.5rem auto 2.5rem auto;height:380px;"></div>
<script>
(function(){
  var data = [{
    type: 'scatter',
    mode: 'lines+markers',
    x: [1955, 1968, 1991, 1999, 2005, 2014, 2019, 2024],
    y: [1e-9, 1e-12, 1e-13, 1.5e-15, 1e-15, 1.1e-16, 9.4e-19, 8.1e-19],
    text: ['NPL Essen-Parry sezyum demet', 'NBS-3 sezyum demet', 'Klasik sezyum demet (PTB)', 'NIST-F1 sezyum fıskiyesi', 'Optik atom saati ilk gösterimler', 'NIST-F2 ilk değerlendirme', 'NIST Al+ kuantum mantık saati', 'JILA Sr optik latis saati'],
    hovertemplate: '%{x}<br>%{text}<br>Bağıl belirsizlik: %{y:.2e}<extra></extra>',
    marker: { size: 10, color: '#1a73e8' },
    line: { color: '#1a73e8', width: 2 }
  }];
  var layout = {
    title: { text: 'Sezyum/optik atom saatlerinin doğruluğu (1955–2024)', font: { size: 14 } },
    xaxis: { title: 'Yıl' },
    yaxis: { title: 'Bağıl belirsizlik (log eksen)', type: 'log', autorange: true },
    margin: { l: 80, r: 30, t: 50, b: 50 },
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff'
  };
  Plotly.newPlot('grafik-saat-tarihi', data, layout, {responsive: true, displayModeBar: false});
})();
</script>

Türkiye tarafında UME'nin Zaman ve Frekans Laboratuvarı 1994'ten beri BIPM'in koordine ettiği Uluslararası Atom Zamanı (TAI) ağına katkı sağlıyor. UME birincil standardı bir **sezyum fıskiyesi değil**, hidrojen maser (1 adet) + ticari sezyum atom saati ensemble'ı (5 adet) + GPS alıcılarından (2 adet) oluşan bir sistem. UTC(UME) zaman ölçeğinin belirsizliği 2×10⁻¹⁴'ün altında. UME ayrıca **stronsiyum tabanlı optik latis saati** projesini sürdürüyor; tamamlandığında Türkiye'nin zaman birimi gerçekleme doğruluğu 100 kattan fazla iyileşecek.

Optik saatler bir sonraki SI yeniden tanımının başında. CCTF (Time & Frequency Consultative Committee) yol haritası 2030'a kadar saniye tanımının optik geçişlere kaymasını öngörüyor. O zaman sezyum, kilogramın IPK silindiri gibi tarihe karışacak.

### Metre: Saniyeden Türeyen Mesafe

Metre tanımı 1983'ten beri şudur: vakumda ışığın 1/299 792 458 saniyede aldığı yol. Yani metreyi gerçekleme problemi, **ışık hızı** ile bağlanmış bir frekans/zaman ölçme problemine indirgenir.

Pratikte metre, **stabilize edilmiş lazerlerle** gerçeklenir:

- 633 nm iyot-stabilize He-Ne lazer (BIPM önerilen liste, ~10⁻¹¹ kararlılık)
- 532 nm iyot-stabilize Nd:YAG lazer
- 1542 nm asetilen-stabilize lazer (telekomünikasyon dalga boyu)

Bu lazerlerin frekansı sezyum saatine karşı sayılır (frekans tarağı/optik kombinasyon teknolojisi); böylece metre dolaylı olarak sezyumdan geliyor. Boy ölçümü ⇒ frekans ölçümü ⇒ saniye standardı ⇒ sezyum.

UME'de uzunluk laboratuvarı 633 nm iyot-stabilize HeNe lazerle çalışıyor; mekanik mihenkleri, blok mihenklerini, koordinat ölçüm cihazlarını bu lazerden türetilen interferometrik ölçümlerle kalibre ediyor.

### Kilogram: Kibble Terazisi ve Planck Sabiti

Reformun en dramatik tarafı kilogramda. 130 yıl boyunca kütle birimini Saint-Cloud'daki bir silindir tanımlıyordu. 20 Mayıs 2019'dan itibaren tanım şu: kilogram, Planck sabiti tam değerinden Kibble terazisi (veya eşdeğer yöntem) ile gerçeklenen kütledir.

Kibble terazisi (eskiden "watt terazisi", Haziran 2016'da mucidi Bryan Kibble [1938-2016] anısına CCU kararıyla yeniden adlandırıldı) iki aşamada çalışır:

<div class="mermaid">
flowchart TB
    subgraph weighing["1. TARTMA FAZI (statik)"]
        W1["Test kütlesi yerçekiminde:<br/>F_grav = m · g"]
        W2["Bobinden akım geçer:<br/>F_coil = B · L · I"]
        W3["Denge kurulur:<br/><b>m · g = B · L · I</b>"]
        W1 --> W3
        W2 --> W3
    end
    subgraph moving["2. HAREKET FAZI (dinamik)"]
        M1["Bobin manyetik alanda<br/>kontrollü hızda hareket: v"]
        M2["Bobinde indüklenen voltaj:<br/><b>V = B · L · v</b>"]
        M1 --> M2
    end
    COMBINE["İki fazı çarp ⇒ B·L sadeleşir<br/><b>m · g · v = V · I</b><br/>(mekanik güç = elektrik güç)"]
    QUANTUM["V Josephson'dan (∝ h)<br/>I = V_R / R, R kuantum Hall'den (∝ h/e²)<br/>⇒ V·I tamamen Planck sabitiyle ifade edilir"]
    KG["m = h · (sayılan frekanslar²) / (g · v) · (sayısal sabitler)<br/><i>kilogram, başka bir kütleye değil h'ye karşı tartılır</i>"]
    weighing --> COMBINE
    moving --> COMBINE
    COMBINE --> QUANTUM --> KG
    style weighing fill:#fce4ec,stroke:#c2185b
    style moving fill:#e3f2fd,stroke:#1565c0
    style COMBINE fill:#fff9c4,stroke:#f57f17
    style QUANTUM fill:#e8f5e9,stroke:#2e7d32
    style KG fill:#1a73e8,color:#fff,stroke:#0c4ea2
</div>

İki fazın püf noktası: tek başına `B·L` (manyetik alan × bobin uzunluğu) çarpımı çok hassas ölçülemez. Ama tartma fazında `B·L = m·g/I` ve hareket fazında `B·L = V/v` aynı çarpımdır; iki ifadeyi eşitlediğinizde `B·L` tamamen sadeleşir. Geriye kalan `m·g·v = V·I` ilişkisi, kütleyi yerçekimi ivmesi (g, mutlak gravimetrelerle ölçülür), hız (v, lazer interferometre), voltaj (V, Josephson) ve akım (I, kuantum Hall direnciyle ölçülen voltaj farkından) cinsinden verir. Sonuç: `m` doğrudan Planck sabitine bağlanır.

Kibble terazileri NIST-4 (ABD), NRC (Kanada), BIPM (Fransa), PTB (Almanya), NIM (Çin), KRISS (Güney Kore), LNE (Fransa) tarafından çalıştırılıyor. Tipik bağıl belirsizlikler 10⁻⁸ mertebesinde.

**Türkiye tarafı:** UME, Kibble terazisi geliştirmesini 2014'te başlattı; ülke için kilogramın salınımlı mıknatıs (oscillating magnet) tipi Kibble terazisiyle gerçeklenmesi yolunu seçti. Bu tasarımda mıknatıs hareketsiz kütleyle birlikte titrer; sinyal frekans alanında okunur. Yayımlanan ön ölçümlerde 1 kg paslanmaz çelik artefakt 54 ppb (yaklaşık ±54 µg) bağıl belirsizlikle ölçüldü; aynı düzenekle Planck sabiti 6 ppm bağıl standart belirsizlikle elde edildi. Günlük kalibrasyon hizmeti hâlâ BIPM kalibrasyonlu transfer kilogram referansı üzerinden veriliyor; Kibble teraziyle gerçekleme tam üretim seviyesine geçildiğinde devreye alınacak.

Alternatif yöntem: **Avogadro projesi** veya **X-ışını kristal yoğunluk (XRCD) yöntemi**. Hassas işlenmiş tek kristal silisyum küresinin atom sayısı X-ışını difraksiyonu ile sayılıyor; N_A tam değer olduğundan kütle hesaplanıyor. Almanya'daki PTB bu yöntemin başlıca yürütücüsü; uluslararası IAC (International Avogadro Coordination) konsorsiyumunda LNE, NMIJ, INRIM, NIST de var. 2019'daki ilk uluslararası `kg` karşılaştırmasında (CCM.M-K8.2019) Kibble terazisi sonuçları XRCD sonuçlarıyla iyi tutarlılık gösterdi.

### Volt: Josephson Eklem Dizileri

Süperiletken bir eklemden geçen elektronlar, eklem mikrodalga ile ışınlandığında **kuantize voltaj basamakları** üretir:

```text
V_n = n · f / K_J
K_J = 2e / h  (Josephson sabiti)
```

`n` tam sayı (basamak numarası), `f` mikrodalga frekansı (sezyum saatten gelir), K_J ise temel sabitlerden türeyen *tam* bir sayı. Yani V tamamen sayılan bir frekansa bağlı; sıvı helyum sıcaklığında (4 K) eklem doğru çalıştığı sürece, voltaj **doğa kanunu** kadar kararlı.

Pratik cihaz: **Programlanabilir Josephson Voltaj Standardı (PJVS)**. On binlerce eklemin diziliminde dijital olarak basamak seçilebiliyor; istenen voltaj (0 – 10 V arası) belirleniyor. Tipik belirsizlik 1 part in 10⁹ — yani 10 V'ta ~0,01 µV.

Cihaz kullanışlı ama maliyetli ve karmaşık altyapı gerektiriyor: ya sıvı helyum (geleneksel) ya da kapalı çevrim cryocooler (modern, tercih edilen) ile 4 K civarına soğutma, hassas mikrodalga jeneratörü, manyetik ekranlama, geri besleme elektroniği. Bu nedenle PJVS dünyada büyük ölçüde NMI'lerde ve birkaç askeri/araştırma laboratuvarında bulunuyor; sıvı helyum tedariğinde dünya çapındaki sıkıntılar son yıllarda cryocooler tabanlı sistemlere geçişi hızlandırdı. UME'de DC Voltaj Laboratuvarı Josephson tabanlı sistemiyle hizmet veriyor; Türkiye'deki akredite kalibrasyon laboratuvarları DC voltaj izlenebilirliklerini buradan alıyor.

Dünyada NIST, PTB, NPL, BIPM, NMIJ, KRISS, NMIA başta olmak üzere pek çok NMI PJVS işletiyor. Bunların hepsi BIPM'in koordine ettiği sürekli karşılaştırmalara katılıyor (**BIPM.EM-K10** DC voltaj Josephson karşılaştırması; bağlı olarak BIPM.EM-K11 ile 1,018 V ve 10 V Zener referans karşılaştırmaları).

### Ohm: Kuantum Hall Etkisi

İki boyutlu elektron gazına sahip bir GaAs/AlGaAs yarı iletkeni 1,5 K sıcaklıkta ve 10 T manyetik alan altında ölçtüğünüzde, Hall direnci sürekli değil **kuantize** değerler alır:

```text
R_H = R_K / i
R_K = h / e²  (von Klitzing sabiti)
R_K = 25 812,807 45 Ω  (tam değer, h ve e tam olduğundan)
```

`i` tam sayı (Landau seviyesi numarası, tipik olarak 1, 2, 3, 4); R_K von Klitzing sabiti, hidrojenden tutun da galaktik bulutlara kadar her yerde aynı.

i=2 platosunda direnç **tam olarak** 12 906,403 725 Ω — laboratuvarda hiç direnç telini ölçmeden, sadece manyetik alan ve sıcaklık doğru ayarlandığında. Bu plato genişliği yeterince büyükse (manyetik alan birkaç tesla aralığında), direnç değerinin kararlılığı 10⁻⁹ mertebesinde.

UME'de Kuantum Hall laboratuvarı 2010'lardan beri çalışıyor. Türkiye'deki tüm DC direnç ölçümlerinin tepe noktası burası. Direnç laboratuvarları periyodik olarak ESI SR104 veya benzeri 10 kΩ standart dirençlerini UME'ye gönderir; UME bunları kuantum Hall ile karşılaştırır, sertifikayla geri verir.

Josephson + kuantum Hall kombinasyonunun önemli bir yan etkisi var: ikisi birlikte kullanıldığında **akım** ve **güç** de doğrudan h ve e cinsinden ölçülebilir. Kibble terazisinin işleyişi tam olarak bu birlikteliğe dayanıyor. Aynı laboratuvar üç temel elektriksel birimi (V, Ω, A) ortak fizikten türetir.

### Kelvin: Boltzmann'dan Pratik Sıcaklığa

Sıcaklık biraz farklı bir hikâye. 2019 reformunda kelvin tanımı Boltzmann sabitine bağlandı:

```text
T = E / k  (E enerji, k Boltzmann sabiti)
```

Termodinamik sıcaklık ilkesel olarak ya **akustik gaz termometresi** (gaz içindeki ses hızı T'ye bağlı) ya da **Johnson gürültüsü termometresi** (bir direnç üzerinde termal gürültünün gücü T'ye bağlı) ile ölçülür. Bu yöntemler temel; ama günlük kalibrasyon için pratik değil — saatlerce ölçüm gerektiriyorlar.

Pratik dünyada kelvin **ITS-90 (International Temperature Scale 1990)** ile gerçeklenir. ITS-90, 0,65 K'den 1357 K'ye kadar sıcaklık aralığını **17 sabit faz geçişi** ile etiketler:

| Sabit nokta | Sıcaklık (K) | Sıcaklık (°C) |
|-------------|--------------|----------------|
| Suyun üçlü noktası | 273,16 | 0,01 |
| Galyum erime | 302,9146 | 29,7646 |
| İndiyum donma | 429,7485 | 156,5985 |
| Kalay donma | 505,078 | 231,928 |
| Çinko donma | 692,677 | 419,527 |
| Alüminyum donma | 933,473 | 660,323 |
| Gümüş donma | 1234,93 | 961,78 |

Suyun üçlü noktası en kritiği: özel olarak hazırlanmış cam hücrelerde (TPW cell, triple point of water) buz, sıvı ve buhar dengede; sıcaklık tam olarak 273,16 K. Bu hücreler dünyada birkaç laboratuvarda üretilir; UME'nin de kendi TPW hücreleri var.

Sıcaklık piramidi şöyle çalışıyor: SI tanımı (Boltzmann) ile birincil termometreler (akustik gaz/Johnson gürültüsü) ITS-90 sabit noktalarını **doğrular**; UME bu sabit noktaları muhafaza eder; akredite laboratuvarlar UME'den izlenebilirlik alır; sanayi termometreleri akredite laboratuvarlardan kalibre olur. Sıradan bir PT100 sensörünün kalibrasyon belgesindeki belirsizlik, son tahlilde Boltzmann sabitine ve ITS-90 hücrelerine bağlanır.

> **Akılda kalsın — birincil ile pratik aynı şey değil:** Kelvin SI'da Boltzmann üzerinden tanımlı, ama dünyada hiçbir kalibrasyon laboratuvarı doğrudan akustik gaz termometresi kullanmaz. Pratik referans ITS-90'dır. Tanım fiziksel, gerçekleme tarihsel ve pratik. İkisi arasındaki tutarlılığı NMI'ler üst düzey karşılaştırmalarla kontrol eder.

### Birincil Gerçeklemelerin Karşılaştırması

Yedi SI temel biriminin en iyi gerçekleme belirsizlikleri arasında 15 mertebelik bir uçurum var. Saniye en hassas, kandela en kaba. Bu fark hem tarihsel hem de fiziksel: bazı olgular daha kararlı, bazılarını ölçmek daha zor.

<div id="grafik-si-belirsizlik" style="width:100%;max-width:760px;margin:1.5rem auto 2.5rem auto;height:380px;"></div>
<script>
(function(){
  var data = [{
    type: 'bar',
    orientation: 'h',
    x: [8.1e-19, 1e-11, 1.5e-8, 1e-9, 1e-9, 1e-7, 1e-4],
    y: ['Saniye (Sr optik latis saati)', 'Metre (iyot-stabilize HeNe)', 'Kilogram (Kibble terazisi)', 'Amper (Josephson + QHE üzerinden)', 'Mol (XRCD / Si küre)', 'Kelvin (akustik gaz termometresi)', 'Kandela (kriyojenik radyometre)'],
    text: ['8×10⁻¹⁹', '~10⁻¹¹', '~1,5×10⁻⁸', '~10⁻⁹', '~10⁻⁹', '~10⁻⁷', '~10⁻⁴'],
    textposition: 'auto',
    marker: { color: ['#1a73e8', '#1976d2', '#1565c0', '#0d47a1', '#2e7d32', '#c62828', '#b71c1c'] }
  }];
  var layout = {
    title: { text: '7 SI temel biriminin en iyi gerçekleme belirsizlikleri (bağıl, log eksen)', font: { size: 14 } },
    xaxis: { title: 'Bağıl belirsizlik (log eksen)', type: 'log', autorange: true },
    yaxis: { autorange: 'reversed' },
    margin: { l: 280, r: 30, t: 50, b: 60 },
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff'
  };
  Plotly.newPlot('grafik-si-belirsizlik', data, layout, {responsive: true, displayModeBar: false});
})();
</script>

Grafiği okumak: saniye gerçeklemesi 10¹⁵ kat daha hassas (8×10⁻¹⁹) iken kandelanın gerçeklemesi 10⁻⁴ mertebesinde. Bu, kandelanın "kötü" tanımlanması demek değil — fiziksel olgu (insan gözünün spektral duyarlılığı) doğası gereği belirsiz. Saniye ise atomik geçişe dayanıyor; daha kararlı bir olgu yok.

Pratik sonuç: bir test mühendisi için frekans ölçümü daima en güvenilir; sıcaklık ve aydınlatma ölçümleri en kaba. Belirsizlik bütçenizde bu mertebe farkı yansır.

---

## Uluslararası Karşılaştırmalar (CIPM MRA)

Diyelim UME'nin Josephson voltaj standardı 10 V'ta 0,01 µV belirsizlik beyan ediyor. Bunun gerçekten doğru olduğunu nasıl biliyoruz? Hiçbir cihaza karşı kalibre etmediğimize göre — peki *yanılıyor* olabilir mi? Mesela laboratuvarın mikrodalga jeneratörü kalibrasyondan kaymış, ekleme yanlış frekans gönderiyor olabilir mi?

Bu olasılığı sıfırlamanın tek yolu **uluslararası karşılaştırma**. Aynı 10 V'u dünyanın farklı bir laboratuvarında, bağımsız bir Josephson sisteminde de üretip iki sonucu karşılaştırırsanız, ikisinin tutarlı olması (beyan edilen belirsizliklerin altında) sistemin sağlıklı çalıştığının kanıtıdır.

Bu süreç **CIPM MRA (Mutual Recognition Arrangement)** çatısı altında yürütülür. 14 Ekim 1999'da Paris'te 38 üye devletin NMI direktörleri ve iki uluslararası kuruluş tarafından imzalanan MRA, üye ülkelerin metroloji enstitülerinin birbirinin sertifikalarını karşılıklı tanımasını sağlar. **Türkiye TÜBİTAK UME aracılığıyla 1999 kuruluş imzacılarından biri.** Bugün 62 üye devlet, 40 ortak ve 4 uluslararası kuruluşu, toplam 250'yi aşkın enstitüyü kapsıyor. MRA'nın iki ayağı var: **Anahtar Karşılaştırmalar (Key Comparisons)** ve **CMC kayıtları**.

<div class="mermaid">
flowchart TB
    BIPM["<b>BIPM</b><br/>Karşılaştırmayı koordine eder<br/>Pilot laboratuvar atar"]
    TS["<b>Transfer Standardı</b><br/>(örn. zener voltaj referansı,<br/>1 kg paslanmaz çelik kütle, ...)"]
    NMI1["NMI 1 (NIST)<br/>ölçer, raporlar"]
    NMI2["NMI 2 (PTB)<br/>ölçer, raporlar"]
    NMI3["NMI 3 (UME)<br/>ölçer, raporlar"]
    NMI4["NMI 4 (NPL)<br/>ölçer, raporlar"]
    PILOT["<b>Pilot Lab</b><br/>verileri toplar<br/>Referans değer (KCRV)<br/>her NMI için ofset (D_i)"]
    KCDB["<b>KCDB</b><br/>(Key Comparison Database)<br/>açık erişim"]
    BIPM --> TS
    TS --> NMI1
    TS --> NMI2
    TS --> NMI3
    TS --> NMI4
    NMI1 --> PILOT
    NMI2 --> PILOT
    NMI3 --> PILOT
    NMI4 --> PILOT
    PILOT --> KCDB
    style BIPM fill:#1a73e8,color:#fff
    style TS fill:#fbbc04,color:#000
    style PILOT fill:#34a853,color:#fff
    style KCDB fill:#673ab7,color:#fff
</div>

Akış şöyle: BIPM bir karşılaştırma planlar, pilot laboratuvar atar. Pilot, bir transfer standardını (örneğin Fluke 7000 zener voltaj referansı, 1 kg paslanmaz çelik kütle, 100 Ω resistör) hazırlar ve katılımcı NMI'lere gönderir. Her NMI standardı kendi birincil sistemine karşı ölçer ve sonucu raporlar. Pilot, sonuçları toplar; ağırlıklı ortalamadan **referans değeri (KCRV — Key Comparison Reference Value)** hesaplar; her NMI için sapmayı (D_i) yayınlar. Tüm sonuçlar **KCDB** açık veritabanında saklanır.

Karşılaştırmaların adlandırması: koordinatör kuruluşun kodu + alanı belirten alt komite + sıra numarası. Birkaç tipik örnek:

| Kod | Karşılaştırma alanı | Tipik transfer standardı |
|-----|----------------------|---------------------------|
| BIPM.EM-K10 | DC voltaj — Josephson (sürekli karşılaştırma) | BIPM transfer Josephson sistemi |
| BIPM.EM-K11 | 1,018 V ve 10 V Zener referansları | zener voltaj referansı (Fluke 732B vb.) |
| CCT-K7 / CCT-K7.2021 | suyun üçlü noktası (TPW) | TPW hücreleri |
| CCT-K9 | ITS-90 sabit noktaları (83,8 K – 692,7 K, çinko, galyum, kalay vb.) | platin direnç termometre |
| CCM.M-K8 | 1 kg gerçeklemeleri (Kibble + XRCD, 2019/2021/2024) | paslanmaz çelik kütle |
| CCL-K11 | optik frekans / dalga boyu (sürekli) | iyot-stabilize He-Ne 633 nm vb. |

Her NMI'nin verdiği değerin **belirsizlik bütçesini aşacak şekilde** sapması, problem işaretidir. Örnek olarak 2021-2022'de yapılan **CCT-K7.2021** karşılaştırmasında, 21 katılımcı NMI'nin TPW gerçeklemeleri arasındaki **maksimum fark 111 µK, standart sapma 28 µK** olarak rapor edildi — yani uluslararası sıcaklık ölçeğinin koordinasyonu sub-mK seviyesinde tutarlı. Eğer bir NMI 1 mK saparsa, hücreleri yeniden değerlendirilir, kapsamı revize edilir, sertifikalardaki belirsizlik artar.

Karşılaştırmaların ikinci ürünü **CMC (Calibration and Measurement Capability)** beyanları. CMC, bir NMI'nin sunduğu rutin kalibrasyon hizmeti için **beyan edilebilir en iyi belirsizliği** ifade eder. Akran değerlendirmesinden geçer, KCDB'de yayınlanır. Türk sanayicisi UME'den hangi alanda hangi belirsizlikle hizmet alabileceğini buradan görür; aynı sayfada NIST veya PTB'nin aynı kapsamı görür ve karşılaştırır.

> **Akılda kalsın — birincil standart kontrolü iki katmanlıdır:** İçsel olarak fiziksel sabite bağlanır (gerçekleme), dışsal olarak başka NMI'lerin gerçeklemeleriyle karşılaştırılır (KC). Tek katmandan biri kaymışsa diğer katmandan yakalanır.

---

## TÜBİTAK UME ve Türkiye'nin Birincil Standartları

UME, 11 Ocak 1992'de TÜBİTAK Marmara Araştırma Merkezi bünyesinde, Gebze'de kuruldu. Bugün çok sayıda laboratuvarda zaman/frekans, elektriksel, kütle, uzunluk, sıcaklık, basınç, kuvvet, akustik, fotometri ve iyonlaştırıcı radyasyon alanlarında birincil standart işletiyor.

Yaklaşık başlık başlık birincil yetenekler (kesin değerler için KCDB'ye bakılmalı):

| Alan | Birincil cihaz/yöntem | Tipik belirsizlik mertebesi |
|------|------------------------|------------------------------|
| Zaman/frekans | 1 hidrojen maser + 5 sezyum atom saati ensemble (UTC(UME)); TAI'ye katkı 1994'ten beri; stronsiyum optik latis saati geliştirme aşamasında | UTC(UME) < 2×10⁻¹⁴ |
| DC voltaj | Programlanabilir Josephson (PJVS) | ~10⁻⁹ |
| DC direnç | Kuantum Hall etkisi | ~10⁻⁹ |
| Kütle (1 kg) | Salınımlı mıknatıs Kibble terazisi (geliştirme; ön ölçümler 54 ppb); BIPM kalibrasyonlu transfer prototipi (servis) | ~50 µg (transfer) |
| Uzunluk | İyot-stabilize He-Ne lazer (633 nm) + frekans tarağı | ~10⁻¹¹ |
| Sıcaklık | ITS-90 sabit nokta hücreleri + SPRT'ler + birincil radyasyon termometresi | ~50 µK (suyun üçlü noktası mertebesi) |
| Basınç | Piston-silindir basınç dengesi | ~10⁻⁵ mertebesi |
| Kuvvet | Karşılaştırma kuvvet ölçer makinesi | ~10⁻⁵ mertebesi |
| Akustik | Karşılıklı (reciprocity) basınç-pistonfon kalibrasyonu | ~0,05 dB |

UME'nin KCDB'deki CMC kayıtları herkese açık. Türk akredite kalibrasyon laboratuvarları (TÜRKAK belgesi alanlar) UME'den izlenebilirlik alır; akredite olmayan iç laboratuvarlar (örneğin bir fabrikanın kalite kontrol bölümü) ya doğrudan UME'ye giderler ya da bir akredite labdan hizmet alırlar.

Aviyonik ve savunmada tipik bir akış şöyle olur. TUSAS'ın bir uçak gövdesinde kullandığı **PT100 sıcaklık sensörü**, üretici dokümanına göre 6 ayda bir kalibre edilmeli. TUSAS bunu TÜRKAK akredite bir kalibrasyon laboratuvarına gönderir; lab kendi referans termometresini (genelde ikinci sınıf Standart Platin Direnç Termometresi, SPRT) kullanarak fırın içinde sensörü doğrular. O lab kendi SPRT'sini her 1-2 yılda UME'ye gönderir; UME ITS-90 sabit noktalarında SPRT'yi karakterize eder. UME'nin sabit nokta hücreleri belirli aralıklarla CCT-K7, CCT-K9 anahtar karşılaştırmalarına katılır — yani başka NMI'lerin TPW hücreleriyle, başka galyum-erime hücreleriyle çapraz kontrol edilir.

Bu zincirin yedi halkası var: **Boltzmann sabiti → ITS-90 → UME hücreleri → SPRT → akredite lab → PT100 → uçak**. Her halka bir kalibrasyon belgesi, bir izlenebilirlik kanıtı taşır. Ucundaki sayı (uçaktaki PT100'ün okuduğu sıcaklık) ancak zincir baştan sona sağlamsa anlamlı.

---

## Belirsizlik Piramidi: Yukarıdan Aşağıya

Önceki yazıda **u_birleşik** kavramını tanıttık: birden çok belirsizlik kaynağının karekök kareler toplamı. İzlenebilirlik zincirinin her aktarımı, mevcut belirsizliğin üzerine yeni bir katkı ekler. Tipik bir DC voltaj zincirinde aşağıdaki gibi büyür:

| Seviye | Cihaz | Tipik U(10 V) | Bağıl belirsizlik | Tipik maliyet |
|--------|-------|---------------|--------------------|----------------|
| 1 — UME | Programlanabilir Josephson | 0,05 µV | 5 ppb | $400k+ |
| 2 — Akredite lab | Fluke 732C bank + 3458A | 5 µV | 0,5 ppm | $80k+ |
| 3 — Sanayi lab | Fluke 5720A kalibratör | 50 µV | 5 ppm | $30k+ |
| 4 — Saha | Keysight 34465A multimetre | 500 µV | 50 ppm | $4k+ |

Her seviyede bağıl belirsizlik yaklaşık 10× kötüleşiyor. Bu pratik bir sonuç değil, kalibrasyon sürecinin doğasından geliyor: her aktarımda transfer cihazının kendi katkısı, ortam etkileri (sıcaklık, nem, EMG), operatör katkısı, kabloların direnci eklenir. Üç-dört katkıyı kareli toplamla birleştirdiğinizde sonuç yaklaşık on kat artar.

<div id="grafik-zincir" style="width:100%;max-width:760px;margin:1.5rem auto 2.5rem auto;height:380px;"></div>
<script>
(function(){
  var data = [{
    type: 'bar',
    orientation: 'h',
    x: [0.05, 5, 50, 500],
    y: ['Seviye 1: UME (Josephson)', 'Seviye 2: Akredite lab (Fluke 732C + 3458A)', 'Seviye 3: Sanayi lab (Fluke 5720A)', 'Seviye 4: Saha multimetresi (Keysight 34465A)'],
    text: ['0,05 µV (5 ppb)', '5 µV (0,5 ppm)', '50 µV (5 ppm)', '500 µV (50 ppm)'],
    textposition: 'auto',
    marker: { color: ['#1a73e8', '#e8711a', '#c62828', '#6a1b9a'] }
  }];
  var layout = {
    title: { text: '10 V için Beklenen Belirsizlik (zincirin her seviyesinde)', font: { size: 14 } },
    xaxis: { title: 'Genişletilmiş belirsizlik U (µV) — log eksen', type: 'log' },
    yaxis: { autorange: 'reversed' },
    margin: { l: 280, r: 30, t: 50, b: 60 },
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff'
  };
  Plotly.newPlot('grafik-zincir', data, layout, {responsive: true, displayModeBar: false});
})();
</script>

Grafikten çıkan ders şu: **alttaki cihazınızın belirsizliği üstteki halkaların belirsizliklerine bağımlıdır**. Multimetreyle 50 ppm okuyabiliyorsanız, kalibratörünüz 5 ppm sunuyor olmalı; kalibratörünüzü kalibre eden lab 0,5 ppm sunmalı; o labın referansı 5 ppb olmalı. Dört halka. Birinde sorun varsa, sayısal değer altta düzgün okunsa bile **anlamı yok**.

Bunun pratik karşılığı: kalibrasyon sertifikasında "UME izlenebilirliği" yazsa bile zincirde halka eksikse (bir halkadaki cihazın geçerli akreditasyonu yoksa, ya da belge süresi geçmişse) tüm zincir geçersiz. Akreditasyon denetiminde ilk sorulan sorular tam olarak bunu test eder.

> **Akılda kalsın — TUR'unuz sizinle değil zincirinizle başlar:** Multimetrenizle 50 ppm okuyabilmek için zincirin tepesinde 5 ppb belirsizlikli bir Josephson sistemine ihtiyacınız var. Aradaki halkalardan biri kayarsa hepsi etkilenir. Belirsizlik bütçenizdeki "sertifika belirsizliği" tek satırı, aslında tüm üst zincirin damıtılmış halidir.

---

## Kalibrasyon Sertifikasından İzlenebilirlik Çıkarımı

Önceki yazıda akreditasyon denetiminde sorulanlar listesi vermiştik. Bu yazının pratik sonucu olarak listeyi izlenebilirlik tarafına genişletelim. Eline kalibrasyon sertifikası geldiğinde test mühendisinin sorması gereken sorular:

- **Sertifikayı veren laboratuvar akredite mi?** TÜRKAK numarası (örn. AB-0001-K) veya muadil bir ILAC üyesi akreditasyon kuruluşu numarası olmalı. Akreditasyon kapsam belgesi sorularak doğrulanır; ölçüm büyüklüğünüzün kapsamda olduğundan emin olun.
- **Kullanılan üst kademe ekipmanın seri numarası belirtilmiş mi?** "Fluke 5720A, S/N 9876543" gibi. Bu olmadan zincir kanıtlanamaz.
- **Üst kademe ekipmanın bir önceki kalibrasyonunun belge numarası ve tarihi yazılmış mı?** "Reference instrument: UME ID K-2024-…" şeklinde. Sertifika tarihiniz, üst kademe sertifikanın geçerlilik süresi içinde olmalı.
- **Beyan edilen belirsizlik U + k + PDF varsayımı içeriyor mu?** "U = 28 µV, k=2, normal dağılım" yeterli; sadece "± 28 µV" yetersiz.
- **TUR ≥ 4 sağlanıyor mu?** Cihazınızın spec'i ile sertifika belirsizliği oranı 4'ün altındaysa, kabul/red kararı için güvenlik payı (guard band) hesaplanmalı.
- **Çevre koşulları belgelenmiş mi?** Sertifika ölçüm sırasındaki sıcaklık (genelde 23 ± 2 °C) ve nem değerlerini içermeli. Sizin laboratuvarınızda koşullar farklıysa düzeltme veya ek belirsizlik gerekir.
- **Süre sonu belirtilmiş mi?** "Geçerlilik 1 yıl", "kalibrasyon aralığı kullanıcı sorumluluğunda" vb. ayrımına dikkat edin.
- **Izlenebilirlik beyanı genel mi yoksa NMI numarasıyla mı?** "Traceable to SI through UME via … " spesifikse iyi; sadece "Traceable to NIST/UME" cümlesi tek başına yeterli kanıt değil.

Bu sekiz madde aslında zincirin her halkasını sorgulayan tek bir kontrol listesi. Bir tanesi cevapsız kalıyorsa zincirde kopukluk var demektir; bu durumda kalibrasyon sertifikası işinize yaramaz.

---

## Sonuç

"Saatçinin saatini kim kalibre eder?" sorusunun cevabı — biraz şaşırtıcı bir biçimde — *kimse*. Zincirin tepesinde bir cihaz değil, bir doğa kanunu var. Sezyum fıskiyesi, Kibble terazisi, Josephson eklem dizisi, kuantum Hall örnekleri başka bir cihaza karşı kalibre edilmez; doğrudan fiziksel sabitleri **gerçekler**. 2019 SI yeniden tanımı bu fikri tüm temel birimlere taşıdı: artık bir kilogram bile bir parçaya değil, Planck sabitine bağlı.

Birincil standartların kendi içlerindeki tutarlılığı **uluslararası karşılaştırmalar** garanti ediyor. CIPM MRA çatısı altında BIPM koordinasyonunda yürütülen anahtar karşılaştırmalar (KC), her NMI'nin gerçeklemesini diğerleriyle düzenli olarak çapraz kontrol ediyor; sonuçlar KCDB'de açık. UME bu sürecin aktif bir parçası — Türk sanayisi ve test mühendisi, UME üzerinden dünya birincil standart sistemine bağlı.

Bir test mühendisi için pratik mesaj kalın çizgilerle şu: kalibrasyon sertifikanızı sadece imzalı bir kâğıt olarak değil, bir **zincir kanıtı** olarak okuyun. Halkaları sayın. Eksik halka varsa "geçti/kaldı" kararınızın altında imzanız var, onun altında da sizin doğruladığınızı varsaydığınız zincir. Zincir kopuksa karar da kopuktur.

Önceki yazıda söz verdiğimiz **Monte Carlo simülasyonu** yazısı hâlâ yolda. Doğrusal olmayan ölçüm modellerinde GUM'un karekök kareler toplam yaklaşımı yetersiz kalıyor; bilgisayarda 100 000 simülasyon yaparak dağılımı doğrudan üretmek gerekiyor. Bir sonraki yazıda RP-12 Ek B'nin uygulamalı versiyonunu yazacağız — önceki yazıdaki üç örneği Monte Carlo ile yeniden çözeceğiz, sonuçları klasik GUM hesabıyla karşılaştıracağız.

---

## Kaynaklar

- [BIPM — SI Brochure (9. baskı, 2019)](https://www.bipm.org/en/publications/si-brochure)
- [BIPM — Resolution 1 of the 26th CGPM (2018) — SI yeniden tanımı](https://www.bipm.org/en/committees/cg/cgpm/26-2018/resolution-1)
- [BIPM — CIPM MRA ana sayfası](https://www.bipm.org/en/cipm-mra)
- [BIPM — KCDB (Key Comparison Database)](https://www.bipm.org/kcdb/)
- [BIPM — Kibble balance ana sayfası](https://www.bipm.org/en/mass-metrology/kibble-balance)
- [NIST — SI Yeniden Tanımı (2019) genel sayfası](https://www.nist.gov/si-redefinition)
- [NIST — "How Atomic Clocks Work" (sezyum fıskiyesi açıklaması)](https://www.nist.gov/atomic-clocks/how-atomic-clocks-work/fountains-atoms-exquisite-timekeepers)
- [NIST — NIST-4 Kibble Balance proje sayfası](https://www.nist.gov/programs-projects/redefining-kilogram-kibble-balance)
- [NPL — "What is the SI?" eğitim sayfası](https://www.npl.co.uk/si-units)
- [NPL — Bryan Kibble biyografi](https://www.npl.co.uk/about-us/history/famous/bryan-kibble)
- [PTB — Atomic Fountain Clock CSF1 ve CSF2](https://www.ptb.de/cms/en/ptb/fachabteilungen/abt4/fb-44/ag-441/realisation-of-the-si-second.html)
- [Stock, M. — "The Watt or Kibble Balance: a Technique for Implementing the New SI Definition of the Unit of Mass", *Metrologia* 53 (2016)](https://iopscience.iop.org/article/10.1088/0026-1394/53/5/A46)
- [BIPM — ITS-90 Defining Document](https://www.bipm.org/en/committees/cc/cct/publications-cc.html)
- [Ahmedov H. ve ark. — "A UME Kibble Balance Displacement Measurement Procedure" (UME Kibble terazisi)](https://www.researchgate.net/publication/365573229_A_UME_Kibble_balance_displacement_measurement_procedure)
- [TÜBİTAK UME — Zaman ve Frekans Laboratuvarı](https://www.ume.tubitak.gov.tr/en/laboratuvarlarimiz/time-frequency-and-wavelength-laboratories)
- [TÜBİTAK UME — Ulusal Metroloji Enstitüsü ana sayfası](https://www.ume.tubitak.gov.tr/)
- [TÜRKAK — Akreditasyon Kapsam Sorgulama](https://www.turkak.org.tr/)
- [ILAC — Uluslararası Laboratuvar Akreditasyonu Birliği](https://ilac.org/)
- [JILA — Optik Latis Saat Çalışmaları (Ye Lab)](https://jila.colorado.edu/yelabs)
- [Wikipedia — 2019 redefinition of the SI base units (özet)](https://en.wikipedia.org/wiki/2019_revision_of_the_SI)

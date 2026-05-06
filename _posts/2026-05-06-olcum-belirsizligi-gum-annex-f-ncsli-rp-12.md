---
title: "Ölçtüğünüz Sayı Ne Kadar Doğru? Ölçüm Belirsizliği için Bir Rehber"
subtitle: "How Accurate Is Your Measurement? A Guide to Measurement Uncertainty"
background: "/img/posts/3.webp"
date: '2026-05-06 09:00:00'
layout: post
lang: tr
mermaid: true
---

<script src="https://cdn.plot.ly/plotly-basic-2.27.0.min.js"></script>

Test laboratuvarındaki ilk gününüz. Önünüzdeki multimetre 24,98 V gösteriyor. Test belgesi diyor ki: cihazın çıkışı 24 V ± 1 V olmalı. Yan masadaki kıdemli mühendis formun üstüne büyük harflerle "GEÇTİ" yazıyor. Doğru değer 24,98 V. Sınırın çok içinde. Tamam.

Ama dur. O ekrandaki 24,98 sayısı ne kadar gerçeği yansıtıyor? Multimetre dün kalibre edildi. Kabloların kendi direnci var. Oda sıcaklığı sabah 21 °C iken öğleden sonra 25 °C oldu. Bakır konnektörlerde küçük gerilimler oluşuyor. Bunların hepsi, ekrandaki sayının yanına bir hata payı ekliyor. Eğer bu pay 5 mV ise sorun yok. Ama ya 1,5 V ise? O zaman cihaz gerçekte 23,5 V ya da 26,5 V çıkış veriyor olabilir. Sınırın dışında, yani aslında geçmemiş.

İşte bu hata payına **ölçüm belirsizliği** diyoruz. Bu yazının amacı, belirsizliği nasıl hesapladığınızı sıfırdan anlatmak. İki uluslararası kılavuza dayanacağız. Birincisi **GUM** (Türkçe açılımıyla "Ölçüm Belirsizliğinin İfadesi Kılavuzu"), uluslararası referans. İkincisi **NCSLI RP-12**, ABD kalibrasyon mühendislerinin yazdığı pratik el kitabı. Üç gerçek örnek üzerinden hesabı tamamlayacağız: bir voltmetre, bir sıcaklık sensörü, bir basınç sensörü. Sayılar gerçek, formüller gerçek; dil olabildiğince sade.

---

## Bu Belgeler Nereden Çıktı?

Ölçüm belirsizliği bilimi yaklaşık 50 yıllık. Aşağıdaki zaman çizelgesi ana adımları gösteriyor.

<div class="mermaid">
flowchart TB
    A["<b>1977</b> &nbsp; CIPM, BIPM'e talimat verdi<br/><i>Ortak bir dile geçilmesi sağlanmalı</i>"]
    B["<b>1980</b> &nbsp; INC-1 kararı<br/>Tip A ve Tip B kavramları ilk kez"]
    C["<b>1993</b> &nbsp; İlk GUM yayını<br/>ISO + IEC + OIML + BIPM ortak imza"]
    D["<b>1995</b> &nbsp; İlk NCSLI RP-12 yayımlandı"]
    E["<b>2006</b> &nbsp; ANSI Z540.3 standardı<br/>Yanlış kabul olasılığı %2 sınırı"]
    F["<b>2008</b> &nbsp; JCGM 100:2008 + JCGM 101<br/>GUM yenilendi, Monte Carlo eklendi"]
    G["<b>2013</b> &nbsp; NCSLI RP-12 yeni baskı<br/>Howard Castrup öncülüğünde"]
    H["<b>2020</b> &nbsp; JCGM GUM-6<br/>Modelleme ve uygulama rehberi"]
    A --> B --> C --> D --> E --> F --> G --> H
    style A fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style B fill:#dbe7f5,stroke:#4a6fa5,stroke-width:2px
    style C fill:#cee0f3,stroke:#4a6fa5,stroke-width:2px
    style D fill:#bfd6f0,stroke:#4a6fa5,stroke-width:2px
    style E fill:#aecbed,stroke:#4a6fa5,stroke-width:2px
    style F fill:#9cc0e9,stroke:#3a5f95,stroke-width:2px
    style G fill:#88b3e5,stroke:#3a5f95,stroke-width:2px
    style H fill:#73a6e0,stroke:#2a4f85,stroke-width:2px,color:#fff
</div>

1970'lerde dünyada ölçüm yapan büyük kurumlar — Amerika'da NIST, İngiltere'de NPL, Almanya'da PTB, Fransa'da BIPM — ortak bir derde sahipti. Hepsi aynı miktarı ölçüyordu (1 metrenin uzunluğu, 1 kilogramın ağırlığı), ama her biri farklı şekilde rapor ediyordu. Kimi "± 0,1 mm" yazıyordu, kimi "%95 güvenle 0,15 mm". Sonuçları karşılaştırmak çok zordu.

1977'de uluslararası ağırlıklar ve ölçümler komitesi **CIPM**, alt birimi olan BIPM'den bu sorunu çözmesini istedi. BIPM, 1980'de 11 ulusal metroloji laboratuvarından uzmanları bir araya getirdi ve "Belirsizlik Beyanı Çalışma Grubu" toplandı. Çalışma grubunun çıkardığı **INC-1 (1980)** kararı, bugün hâlâ kullandığımız iki kavramı tanımladı:

- **Tip A belirsizlik:** Aynı ölçümü defalarca yaparak, çıkan sayıların ne kadar dağıldığına bakarak hesaplanan belirsizlik. Örneğin cihazı 10 kez ölçüp standart sapmayı hesaplamak.
- **Tip B belirsizlik:** Tekrarlı ölçüm dışındaki her bilgi. Kalibrasyon belgesi, üretici kataloğu, geçmiş deneyim.

13 yıl sonra, 1993'te bu fikirler genişletildi ve uluslararası dört kuruluş (ISO, IEC, OIML, BIPM) ortak bir el kitabı yayımladı: **GUM**. 2008'de küçük düzeltmelerle yeniden basıldı, bugün **JCGM 100:2008** adıyla kullanılıyor. Sonra ek belgeler geldi: **JCGM 101** (Monte Carlo simülasyonu ile belirsizlik hesabı, 2008), **JCGM 102** (birden fazla sonuç veren ölçümler, 2011), **JCGM 106** (uyum kararı, 2012).

Amerika tarafında **NCSL International** kalibrasyon mühendislerinin oluşturduğu bir dernek. 1995'te ilk **RP-12** belgesini yayımladılar, 2013'te tamamen yeniden yazdılar. RP-12, GUM'un akademik dilini günlük kalibrasyon laboratuvarının diline çevirir. Yanına 2006'da yayımlanan **ANSI Z540.3** standardı kalibrasyon laboratuvarları için bağlayıcı kurallar getirir.

Türkiye'de **TÜBİTAK UME** (Ulusal Metroloji Enstitüsü) ulusal ölçüm referanslarını korur. **TÜRKAK** kalibrasyon laboratuvarlarına akreditasyon verir. Aldığınız kalibrasyon belgesinin doğruluğu, bu zincirden geçerek Paris'in batısındaki Sèvres ilçesinde bulunan BIPM merkezine ve oradan da SI birim tanımlarına bağlanır. Bu bağlantıya **izlenebilirlik** deniyor.

İzlenebilirlik zinciri görsel olarak şu şekilde:

<div class="mermaid">
flowchart TB
    SI[SI Birim Tanımları<br/>BIPM, Sèvres - Fransa<br/>2019'dan beri Planck sabiti, c, e, k_B, ...]
    UME[TÜBİTAK UME<br/>Ulusal Metroloji Enstitüsü<br/>Türkiye'nin birincil referansı]
    KAL[Akredite Kalibrasyon Laboratuvarı<br/>TÜRKAK belgeli<br/>ISO 17025 uyumlu]
    UUT[Test edilen cihaz<br/>multimetre, PT100, basınç sensörü...]
    URUN[Ürün ölçümü<br/>uçak, otomobil, medikal cihaz...]
    SI --> UME
    UME --> KAL
    KAL --> UUT
    UUT --> URUN
    style SI fill:#1a73e8,color:#fff
    style UME fill:#2e7d32,color:#fff
    style KAL fill:#e8711a,color:#fff
    style UUT fill:#c62828,color:#fff
    style URUN fill:#6a1b9a,color:#fff
</div>

Her okun başında ve sonunda bir **belirsizlik kazanımı** olur. SI tanımlarındaki belirsizlik atomik mertebede sıfıra yakındır. UME'nin referansları nano düzeyde belirsizlik taşır. Akredite laboratuvarın belirsizliği biraz daha büyük, sizin cihazınızın daha da. Ürün ölçümünüzün belirsizliği zincirin son halkası — ve eğer zincirde kopukluk varsa (mesela "akredite olmayan bir laboratuvarda kalibre ettirdik") tüm zincir geçersiz olur.

---

## Belirsizlik Nedir? Birkaç Temel Kavram

Önce küçük bir sözlük. Bu kavramları sık karıştırırız:

| Terim | Anlamı |
|-------|--------|
| **Hata** | Ölçtüğümüz değer eksi gerçek değer. Gerçek değeri hiçbir zaman tam bilemediğimiz için hatayı da tam bilemeyiz. |
| **Belirsizlik** | Ölçüme atfedebileceğimiz değerlerin dağılımı. "Sayım şu civarda olabilir" demek. |
| **Doğruluk (accuracy)** | Ölçümün gerçek değere ne kadar yakın olduğu. |
| **Kesinlik (precision)** | Aynı ölçümü tekrarladığımızda sayıların birbirine ne kadar yakın çıktığı. |
| **Tolerans** | Ürünün kabul edilebilir aralığı (örn. 24 V ± 1 V). |
| **İzlenebilirlik** | Ölçüm cihazımızın doğruluğunun zincir halinde uluslararası referansa bağlanması. |

Doğruluk ve kesinlik birbirinden bağımsız iki şey. Bir cihaz çok doğru ama az kesin olabilir, ya da çok kesin ama doğru olmayabilir. Bunu anlatmanın en kolay yolu nişan tahtasıdır. Aşağıda dört durum var: her tahtada beş atış var; merkez gerçek değer, atışlar ölçümler.

<div id="grafik-dogruluk" style="width:100%;max-width:760px;margin:1.5rem auto 2.5rem auto;height:680px;"></div>
<script>
(function(){
  var MEAS = '#c62828';
  var CENTER = '#1a73e8';

  function meas(xs, ys, xaxis, yaxis, showleg){
    return {x:xs, y:ys, mode:'markers', type:'scatter',
            marker:{size:12, color:MEAS, line:{color:'#000', width:1}},
            xaxis:xaxis, yaxis:yaxis,
            name:'Ölçüm sonucu (5 tekrar)',
            legendgroup:'meas', showlegend:showleg};
  }
  function center(xaxis, yaxis, showleg){
    return {x:[0], y:[0], mode:'markers', type:'scatter',
            marker:{size:20, color:CENTER, symbol:'star', line:{color:'#000', width:1.5}},
            xaxis:xaxis, yaxis:yaxis,
            name:'Gerçek değer (hedef merkezi)',
            legendgroup:'center', showlegend:showleg};
  }
  function targetShapes(xref, yref){
    var shapes = [];
    [3, 2, 1].forEach(function(r){
      shapes.push({
        type:'circle', xref:xref, yref:yref,
        x0:-r, y0:-r, x1:r, y1:r,
        line:{color:'#888', width:1},
        fillcolor: r===3 ? 'rgba(220,220,220,0.4)' : (r===2 ? 'rgba(240,240,240,0.4)' : 'rgba(255,255,255,0.6)')
      });
    });
    return shapes;
  }

  var data = [
    meas([0.15,-0.1,0.05,-0.05,0.1], [0.05,0.1,-0.1,0.15,-0.05], 'x1', 'y1', true),
    center('x1', 'y1', true),
    meas([0.9,0.7,0.6,1.0,0.8], [-0.5,-0.3,-0.7,-0.4,-0.6], 'x2', 'y2', false),
    center('x2', 'y2', false),
    meas([1.2,-0.8,0.5,-1.4,1.5], [1.3,-1.0,1.4,0.6,-0.9], 'x3', 'y3', false),
    center('x3', 'y3', false),
    meas([1.6,-1.2,0.9,-0.6,1.4], [-1.5,1.7,-1.6,-1.8,-2.0], 'x4', 'y4', false),
    center('x4', 'y4', false)
  ];
  var shapes = []
    .concat(targetShapes('x1','y1'))
    .concat(targetShapes('x2','y2'))
    .concat(targetShapes('x3','y3'))
    .concat(targetShapes('x4','y4'));
  var ax = function(){ return {range:[-3.2,3.2], showgrid:false, zeroline:false, showticklabels:false, fixedrange:true};};

  var layout = {
    grid: {rows:2, columns:2, pattern:'independent', ygap:0.30, xgap:0.10},
    xaxis: ax(), yaxis: ax(),
    xaxis2: ax(), yaxis2: ax(),
    xaxis3: ax(), yaxis3: ax(),
    xaxis4: ax(), yaxis4: ax(),
    annotations:[
      {text:'<b>1) Doğru ve kesin</b><br><span style="font-size:11px;color:#555">merkezde toplanmış</span>',
       x:0.225, y:1.04, xref:'paper', yref:'paper', showarrow:false, font:{size:13}, align:'center', xanchor:'center', yanchor:'bottom'},
      {text:'<b>2) Doğru değil ama kesin</b><br><span style="font-size:11px;color:#555">sapma (bias) var, ama tutarlı</span>',
       x:0.775, y:1.04, xref:'paper', yref:'paper', showarrow:false, font:{size:13}, align:'center', xanchor:'center', yanchor:'bottom'},
      {text:'<b>3) Doğru ama kesin değil</b><br><span style="font-size:11px;color:#555">merkez etrafı, dağınık</span>',
       x:0.225, y:0.46, xref:'paper', yref:'paper', showarrow:false, font:{size:13}, align:'center', xanchor:'center', yanchor:'bottom'},
      {text:'<b>4) Ne doğru ne kesin</b><br><span style="font-size:11px;color:#555">her yerde, sapma + dağınık</span>',
       x:0.775, y:0.46, xref:'paper', yref:'paper', showarrow:false, font:{size:13}, align:'center', xanchor:'center', yanchor:'bottom'}
    ],
    shapes: shapes,
    margin:{l:30, r:30, t:80, b:80},
    plot_bgcolor:'#ffffff', paper_bgcolor:'#ffffff',
    legend:{orientation:'h', x:0.5, xanchor:'center', y:-0.02, yanchor:'top', font:{size:12},
            bgcolor:'rgba(255,255,255,0.85)', bordercolor:'#ccc', borderwidth:1},
    showlegend:true
  };
  Plotly.newPlot('grafik-dogruluk', data, layout, {responsive:true, displayModeBar:false});
})();
</script>

İdeal durum tabii ki sol üst: hem doğru hem kesin. Sağ üst tehlikeli; cihaz çok kesin ölçüm yapıyor (atışlar bir arada) ama hep yanlış yönde sapıyor. **Sapma (bias)** dediğimiz durum bu. Sağ alt durumda atışlar merkezi etrafına yığılmış ama dağınık; ortalamasını alırsak doğru cevaba ulaşırız. Kalibrasyon ve belirsizlik analizinin işi, bu dört durumdan hangisinde olduğumuzu bulup uygun şekilde raporlamaktır.

Belirsizliği iki adımda hesaplıyoruz. Önce her bir kaynağı **standart belirsizlik** denilen bir sayıya dönüştürüyoruz (1 sigmaya, yani normal dağılımın bir standart sapmasına denk düşen değer). Sonra hepsini birleştirip **birleşik belirsizlik** elde ediyoruz. Birleştirme yöntemi şu: her bileşeni karesel olarak topla, sonra karekökünü al. Buna "**karekök kareler toplamı**" diyelim, kısaltılmışı **KKT** (İngilizce literatürde RSS).

```text
u_birleşik² = u_1² + u_2² + u_3² + ...
u_birleşik = √(u_1² + u_2² + u_3² + ...)
```

Neden böyle topluyoruz? Çünkü farklı kaynaklardan gelen küçük rastlantısal hatalar, doğrudan toplanmaz; istatistik kuralı gereği kareleri toplanır. İki adet ±1 mm hata yan yana geldiğinde sonuç ±2 mm değil, ±1,4 mm olur (√2 ≈ 1,41).

Son olarak, **kapsama faktörü** denilen bir sayı (genelde k=2) ile çarparak **genişletilmiş belirsizliği** elde ederiz. k=2, yaklaşık olarak %95 güven düzeyine karşılık gelir. Yani "U=56 µV (k=2)" demek, "gerçek değer büyük olasılıkla ölçtüğümüz sayının 56 µV içinde" demek.

> **Akılda kalsın — üç temel formül:**
> - **Standart belirsizlik:** her bileşeni 1σ'a çevir (Tip A için s/√n; Tip B için aralığı dağılım faktörüne böl).
> - **Birleşik belirsizlik:** u_birleşik = √(u₁² + u₂² + ... + uₙ²)
> - **Genişletilmiş belirsizlik:** U = k × u_birleşik (genelde k = 2, ≈ %95 güven)

Tip B belirsizlikleri standart belirsizliğe çevirirken bir varsayım yapmamız gerekir: dağılım nasıl dağılıyor? Üretici "±1 mV" diyorsa o aralığın içinde her değer eşit ihtimalli mi, yoksa orta yoğun mu? Üç tipik durum:

- **Düz (üniform) dağılım:** Aralık içinde her nokta eşit olası. Standart belirsizliği = a / √3.
- **Üçgen dağılım:** Orta nokta daha olası, kenarlar düşer. Standart belirsizliği = a / √6.
- **Normal dağılım:** Genelde sertifikadan gelir. k ile birlikte verilirse, standart belirsizlik = U / k.

Bilgi yoksa, en güvenli tercih düz dağılım varsaymaktır. Aşağıdaki grafik dört dağılım tipini yan yana gösteriyor; hepsinde aralık ±1 birim, ama içerideki olasılık şekli farklı.

<div id="grafik-pdf" style="width:100%;max-width:780px;margin:1.5rem auto 2.5rem auto;height:340px;"></div>
<script>
(function(){
  var x = [];
  for (var i=-150; i<=150; i++) x.push(i/100);
  var uniform = x.map(function(v){return (v>=-1 && v<=1) ? 0.5 : 0;});
  var triangular = x.map(function(v){return (v>=-1 && v<=1) ? (1-Math.abs(v)) : 0;});
  var normal = x.map(function(v){var s=0.5; return Math.exp(-v*v/(2*s*s))/(s*Math.sqrt(2*Math.PI));});
  var ushape = x.map(function(v){return (v>-1 && v<1) ? 1/(Math.PI*Math.sqrt(1-v*v)) : 0;});
  var common = {type:'scatter', mode:'lines', fill:'tozeroy', line:{width:2}};
  var data = [
    Object.assign({}, common, {x:x, y:uniform, name:'Düz', xaxis:'x1', yaxis:'y1', line:{color:'#1a73e8', width:2}, fillcolor:'rgba(26,115,232,0.25)'}),
    Object.assign({}, common, {x:x, y:triangular, name:'Üçgen', xaxis:'x2', yaxis:'y2', line:{color:'#e8711a', width:2}, fillcolor:'rgba(232,113,26,0.25)'}),
    Object.assign({}, common, {x:x, y:normal, name:'Normal', xaxis:'x3', yaxis:'y3', line:{color:'#2e7d32', width:2}, fillcolor:'rgba(46,125,50,0.25)'}),
    Object.assign({}, common, {x:x, y:ushape, name:'U-shape', xaxis:'x4', yaxis:'y4', line:{color:'#6a1b9a', width:2}, fillcolor:'rgba(106,27,154,0.25)'})
  ];
  var ax = function(){ return {range:[-1.5,1.5], showgrid:false, zeroline:false, showticklabels:false, fixedrange:true};};
  var ay = function(){ return {showgrid:false, zeroline:false, showticklabels:false, fixedrange:true};};
  var layout = {
    grid:{rows:1, columns:4, pattern:'independent'},
    xaxis:ax(), yaxis:ay(), xaxis2:ax(), yaxis2:ay(),
    xaxis3:ax(), yaxis3:ay(), xaxis4:ax(), yaxis4:ay(),
    annotations:[
      {text:'<b>Düz</b><br>u = a/√3', x:0, y:1.15, xref:'x1', yref:'paper', showarrow:false, font:{size:13}},
      {text:'<b>Üçgen</b><br>u = a/√6', x:0, y:1.15, xref:'x2', yref:'paper', showarrow:false, font:{size:13}},
      {text:'<b>Normal</b><br>u = U/k', x:0, y:1.15, xref:'x3', yref:'paper', showarrow:false, font:{size:13}},
      {text:'<b>U-shape</b><br>u = a/√2', x:0, y:1.15, xref:'x4', yref:'paper', showarrow:false, font:{size:13}}
    ],
    showlegend:false,
    margin:{l:10, r:10, t:50, b:30},
    plot_bgcolor:'#ffffff', paper_bgcolor:'#ffffff'
  };
  Plotly.newPlot('grafik-pdf', data, layout, {responsive:true, displayModeBar:false});
})();
</script>

U-shape dağılım sıcaklık dalgalanmaları gibi durumlarda görülür: termostatlı bir oda sıcaklığı çoğunlukla alt sınır veya üst sınıra yakın salınır, orta noktada nadir kalır. Klasik üç dağılım dışında ihtiyaç doğdukça başka dağılımlar da kullanılır.

> **Akılda kalsın — aralığı standart belirsizliğe çevirme:**
>
> | Elinizde olan | Yapacağınız |
> |---------------|-------------|
> | Sertifika "U = ... (k=2)" der | u = U / 2 |
> | Sertifika "U = ... (k=3)" der | u = U / 3 |
> | Üretici "±a" der, ek bilgi yok | u = a / √3 *(düz/üniform)* |
> | "Merkez yakını daha olası" notu var | u = a / √6 *(üçgen)* |
> | Termostat dalgalanması, ±a sınırlı | u = a / √2 *(U-shape)* |
>
> Şüpheliyseniz **düz dağılım** seçin — en muhafazakâr olanı.

---

## GUM Annex F: Pratik Uyarılar

GUM'un ana metni biraz akademik dilde yazılmış: integraller, kovaryans matrisleri. Yeni başlayan biri için zorlu bir okuma. Ama belgenin **F eki** (Annex F) bambaşka. Doğrudan ölçüm yapan mühendise sesleniyor, en sık yapılan yanlışları sıralıyor, çözüm öneriyor. Aşağıda en önemli yedi noktayı açıklayalım.

### 1. Tekrar ölçümleriniz gerçekten "rastgele" mi?

10 ölçüm aldınız, standart sapmasını hesapladınız, "Tip A belirsizlik = 5 mV" dediniz. Ama o 10 ölçüm sırasında oda sıcaklığı 1 °C arttı, kalibratör yavaşça kaymaya başladı, kablonun bağlantı noktasında küçük voltajlar birikti. Bu durumda standart sapma rastgele dalgalanmayı değil, **sıralı bir gidişatı** ölçer. GUM uyarısı: tekrar ölçümler arasında koşulları gerçekten yenileyin. Cihazı kapatıp açın, sıfırlayın, kabloyu temizleyin, ısıl dengelenmeyi bekleyin.

### 2. Ortalamanın belirsizliği ile tek ölçümün belirsizliği farklı şeyler.

10 ölçümün ortalamasının standart belirsizliği s/√10 olur. Yani standart sapmayı √10 ile bölersiniz. Ama gelecekte yapılacak tek bir ölçümün belirsizliği s'in kendisidir. Test prosedüründe gelecekte hep 10 kez ölçüp ortalama mı raporlayacaksınız, yoksa tek ölçüm mü? Birinciyse s/√10, ikinciyse s. Pek çok kişi bu ikisini karıştırır.

### 3. Birden fazla küçük örnek varsa havuzlayın.

Diyelim ki 10 farklı günde, her gün 5 ölçüm yapıyorsunuz. Toplam 50 ölçüm var ama her gün için ayrı bir standart sapma çıkıyor. Hangisini kullanacaksınız? GUM cevabı: hepsini "havuzlayın". Şu formülle:

```text
        Σ ν_i · s_i²
s² =  ──────────────
          Σ ν_i
```

Burada her grubun "serbestlik derecesi" ν_i = n_i − 1. Sonuç: tek bir küçük gruba göre çok daha güvenilir bir s. Ölçüm tekrarlanabilirliği çalışmalarının (R&R çalışmaları) matematiksel temeli budur.

### 4. Üreticinin verdiği değerleri olduğu gibi alın.

Tip B belirsizliği hesaplarken sık yapılan bir hata: "Üretici ±100 µV demiş ama ben yine de 200 µV koyayım, daha güvenli olsun." Bu yanlış. Elinizdeki kanıt ne ise onu kullanın. Sertifika varsa sertifikadan, üretici belgesi varsa o belgeden, geçmiş ölçüm verisi varsa o veriden. Kendi sezginizle "biraz daha kötümser olalım" demek, sayıları güvenilmez yapar.

### 5. PDF varsayımı yargı gerektirir.

Üretici "±1%" diyorsa, içindeki dağılım nasıl? Üretici belirtmediyse düz dağılım varsayın. "Çoğunlukla orta yakınında çıkar" diye bir not varsa üçgen dağılım. Ama bu kararı belgenizde yazılı olarak gerekçelendirmelisiniz.

### 6. Bağımsızlık varsayımı çoğu zaman yanlıştır.

Birleşik belirsizlik formülü ("kareler toplamının karekökü") sadece **birbirinden bağımsız** kaynaklar için geçerli. Eğer iki ölçüm aynı kalibratörden besleniyorsa, sertifikalarındaki belirsizlikler ilişkili demektir. Aynı operatör, aynı oda, aynı ortam koşulları... bunlar belirsizlikleri ilişkili kılar. İlişkili kaynakları "bağımsız" kabul edip topladığınızda, sonuç gerçeğin altında ya da üstünde çıkar. GUM bunun için ek bir terim ekler:

```text
u² = Σ u_i² + 2 · Σ u_ij
```

İkinci terim, ilişkili kaynak çiftleri arasında pozitifse belirsizliği büyütür, negatifse küçültür.

### 7. Sertifika belirsizliklerinde gizli sıcaklık tuzağı

Bu özellikle test laboratuvarlarında sık görülen bir tuzak. Kalibrasyon belgesi diyor ki: "Cihazın belirsizliği ±28 µV (k=2)". Sonra ayrıca "ölçümler 23 °C ± 1 °C odada yapıldı" notu var. Şimdi siz cihazı kendi laboratuvarınızda 23 °C ± 3 °C koşullarda kullanıyorsunuz. Cihazın sıcaklık katsayısı bilgisini kataloga bakıp ayrıca ekliyorsunuz.

Burada gizli bir çift sayma var. Cihazın 23 °C ± 1 °C aralığındaki davranışı zaten kalibrasyon belgesindeki ±28 µV içine girmiş. Siz "±3 °C" aralığını eklerken sadece **fark olan ±2 °C'lik kısmı** hesaba katmalısınız, tüm ±3 °C'yi değil. Aksi halde sıcaklık etkisini iki kez sayarsınız ve belirsizliği gerçeğin üstünde gösterirsiniz.

> **Bu yedi maddenin ortak fikri:** Belirsizlik bir tahmin değil, bir hesap. Her seçiminizi (dağılım varsayımı, bağımsızlık kararı, hangi sertifika değerinin kullanıldığı) belgenizde yazılı tutun. Akreditasyon denetiminde her birinin gerekçesi sorulur.

---

## "k=2 mi, k=3 mü?" Sorusu

Genişletilmiş belirsizliği hesaplarken k değerini seçmemiz gerekiyor. Çoğu uygulamada k=2 (yaklaşık %95 güven) standart. Bazı kritik uygulamalarda k=3 (yaklaşık %99 güven) tercih ediliyor. Ama ikisi arasında dikkat etmemiz gereken bir ayrıntı var.

k=2 yaklaşık %95'lik güven düzeyine **sadece ölçüm sayısı yeterince çoksa** karşılık geliyor. Eğer Tip A hesaplamasında az sayıda ölçüm yaptıysanız (örneğin sadece 5), istatistiksel dağılım normal değil **Student-t** dağılımı oluyor. Bu durumda k=2 yerine biraz daha büyük bir değer kullanmak gerekir.

Bu hesabı **Welch-Satterthwaite formülü** yapar:

```text
                u_birleşik⁴
ν_etkin =  ──────────────────
              Σ (u_i⁴ / ν_i)
```

Buradaki ν_etkin "etkin serbestlik derecesi". Tip A bileşeninin serbestlik derecesi n−1, Tip B bileşenleri için (sertifikadan veya katalog değerinden geldikleri için) genelde sonsuz kabul edilir. Etkin serbestlik derecesi yeterince büyükse (genelde 30'dan büyük) k=2 güvenle kullanılabilir. Daha küçükse Student-t tablosundan k değerini bakarsınız.

Pratik tavsiye: ölçümlerinizi en az 30 kere yapıyorsanız k=2 düşünmeyin bile, doğrudan kullanın. Daha az ölçüm yapıyorsanız etkin serbestlik derecesini hesaplayın. Hesabı kolaylaştıran bedava araçlar var; örneğin Amerika'nın NIST kurumunun yayımladığı "NIST Uncertainty Machine" web aracı bu hesabı tek tıkla yapar.

---

## NCSLI RP-12: Pratik Bir El Kitabı

GUM size "ne yapmanız gerektiğini" söyler. NCSLI RP-12 ise "nasıl yaparsınız, hangi tabloları kullanırsınız, hangi şablonu doldurursunuz" sorusunu yanıtlar. 2013 baskısı NCSLI'nin Belirsizlik Analizi Komitesi tarafından yazıldı; komitenin başında belirsizlik analizinin önde gelen isimlerinden Howard Castrup (Integrated Sciences Group kurucusu, NCSLI Wildhack Ödülü 2002 sahibi) vardı.

RP-12'nin yapısı GUM'dan biraz farklı. GUM "Tip A vs Tip B" ayrımıyla giderken, RP-12 hata kaynaklarını günlük dile daha yakın gruplara ayırır:

- **Sapma (bias):** Cihazın gerçek değerden sürekli aynı yönde sapması.
- **Rastgele:** Ölçümden ölçüme sebepsiz dalgalanma.
- **Kayma (drift):** Zamanla yavaş değişme.
- **Çevre:** Sıcaklık, nem, EMG (elektromanyetik girişim).
- **Operatör:** Kim ölçtü.
- **Yöntem:** Hangi adımlarla ölçüldü.

Bu sınıflandırma, kalibrasyon laboratuvarı çalışanlarının kafasındaki gerçeğe daha yakın. Bir sorun bulduklarında "bu hangi kategoriden?" sorusuna kolay cevap verirler.

RP-12'de işine yarayacak özel bölümler:

- **Üretici belgesinden belirsizlik çıkarmak:** Hangi belge satırı hangi belirsizlik kaynağına karşılık geliyor; hangi durumlarda hangi PDF varsayılmalı.
- **Aynı anda birden çok cihazı kalibre etmek:** Kalibrasyon prosedürü tek bir referansla 10 cihazı doğruluyorsa, belirsizlik nasıl bölüştürülür.
- **Düzeltilmemiş sapmalar için belirsizlik:** Sertifika "+0,12 mV sapma" diyor ama prosedürünüz düzeltme uygulamıyor. Bu sapmayı belirsizliğe nasıl yansıtırsınız.
- **Monte Carlo simülasyonu:** Doğrusal olmayan ölçüm modellerinde klasik GUM yöntemi yetersiz kalır. Bilgisayarda 100.000 simülasyon yapıp dağılımı doğrudan üretirsiniz. RP-12 bu yöntemi pratik bir şekilde anlatır.

**ANSI Z540.3 ile bağlantı.** Bu standart bir kalibrasyon laboratuvarının uyması gereken kurallardan biri. Ana maddesi şudur: kalibrasyon sonucu yanlış kabul olasılığı %2'den fazla olamaz. Ya da bunu hesaplamak zorsa, **TUR ≥ 4:1** olmalıdır. TUR, "test belirsizlik oranı" demek; cihazın toleransının kalibrasyon belirsizliğine oranı. Örnek: cihazın toleransı ±100 µV, kalibrasyon belirsizliği ±25 µV ise TUR = 4. RP-12 bu kuralı sağlamak için gerekli hesap yöntemlerini sunar.

**Türkiye uygulaması.** TÜRKAK akreditasyonlu kalibrasyon laboratuvarları çoğunlukla Avrupa rehberi EA-4/02'yi takip eder. Ama Türkiye'nin aviyonik (TUSAS, BAYKAR), savunma (ASELSAN, ROKETSAN) ve otomotiv (Togg ve tedarikçileri) firmaları ABD merkezli müşterilere de iş yapıyor. ABD ortağına rapor verdiğinizde NCSLI RP-12 ve Z540.3'e atıf gerekiyor. Yani Türk test mühendisinin masasında giderek artan oranda her iki belge de bulunmalı.

---

## Örnek 1: Voltmetre Kalibrasyonu

**Senaryo.** Sistem entegrasyon laboratuvarında elinizdeki voltmetre (Keysight 34465A, 6½ haneli) referans bir kalibratörle (Fluke 5720A) doğrulanıyor. Kalibratör tam olarak 10,000 V veriyor. Voltmetrenin bu değeri ne kadar doğru okuduğunu ve okumanın ne kadar belirsizlik içerdiğini hesaplayacağız. Ortam sıcaklığı (23 ± 2) °C.

### Adım 1: Tip A — 10 kez ölçüm yapın

Aynı koşullarda 10 ardı ardına ölçüm. Her ölçüm öncesinde voltmetrenin girişini açıp kapayıp kabloyu temizliyoruz (önceki bölümdeki 1. uyarı). Sonuçlar:

| Ölçüm | Değer (V) |
|-------|-----------|
| 1 | 9,999870 |
| 2 | 9,999910 |
| 3 | 9,999890 |
| 4 | 9,999895 |
| 5 | 9,999860 |
| 6 | 9,999900 |
| 7 | 9,999875 |
| 8 | 9,999895 |
| 9 | 9,999920 |
| 10 | 9,999875 |

- Ortalama: x̄ = 9,999889 V
- Standart sapma: s ≈ 19 µV
- Ortalamanın standart belirsizliği: u_A = s / √10 ≈ 6 µV

### Adım 2: Tip B — Diğer kaynakları listeleyin

Her kaynağı düzgün bir tabloya koyarız. Aralığı (üreticinin verdiği değer) ilgili dağılım varsayımıyla bölerek standart belirsizliğe geçeriz.

| Kaynak | Aralık | Dağılım | Bölme | u (µV) |
|--------|--------|---------|-------|--------|
| Kalibratör sertifikası (UME, k=2) | ±28 µV | normal | 2 | 14,0 |
| Voltmetre çözünürlüğü (1 µV son hane) | ±0,5 µV | düz | √3 | 0,29 |
| Sıcaklık katsayısı (±2 °C, 2 ppm/°C × 10 V) | ±40 µV | düz | √3 | 23,1 |
| Bakır konnektörlerde gerilim oluşumu | ±3 µV | düz | √3 | 1,73 |
| Hat gürültüsü (50 Hz) | ±2 µV | normal | 1 | 2,0 |
| Kalibratörün 1 yıllık kayması | ±5 µV | düz | √3 | 2,89 |

### Adım 3: Birleşik belirsizliği hesaplayın

Her bileşeni karesel olarak topla, karekök al:

```text
u² = 6² + 14² + 0,29² + 23,1² + 1,73² + 2² + 2,89²
u² = 36 + 196 + 0,08 + 533,6 + 3 + 4 + 8,4
u² ≈ 781
u  ≈ 28 µV
```

### Adım 4: Genişletilmiş belirsizlik

Kapsama faktörü k=2 ile çarpın:

```text
U = 2 × 28 = 56 µV
```

### Adım 5: Sonucu ifade edin

Voltmetrenin okuması = (9,999889 ± 0,000056) V, k = 2.

Yani gerçek değer büyük olasılıkla 9,999833 V ile 9,999945 V arasında.

### Hangi kaynak en çok katkı veriyor?

Aşağıdaki grafikte, yedi belirsizlik kaynağının her birinin katkısını sıralı görüyorsunuz. Sıcaklık katsayısı toplam belirsizliğin yarısından fazlasını oluşturuyor.

<div id="grafik-multimetre" style="width:100%;max-width:760px;margin:1.5rem auto 2.5rem auto;height:380px;"></div>
<script>
(function(){
  var data = [{
    type: 'bar',
    orientation: 'h',
    x: [533.6, 196, 36, 8.4, 4, 3, 0.08],
    y: ['Sıcaklık katsayısı', 'Kalibratör sertifikası', 'Tekrar ölçüm (Tip A)', 'Kalibratör kayması', 'Hat gürültüsü', 'Bakır konnektör', 'Voltmetre çözünürlüğü'],
    text: ['68,3%', '25,1%', '4,6%', '1,1%', '0,5%', '0,4%', '0,01%'],
    textposition: 'auto',
    marker: { color: '#1a73e8' }
  }];
  var layout = {
    title: { text: 'Voltmetre Belirsizlik Bütçesi (varyans katkısı)', font: { size: 14 } },
    xaxis: { title: 'Varyans katkısı (µV²)' },
    yaxis: { autorange: 'reversed' },
    margin: { l: 180, r: 30, t: 50, b: 50 },
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff'
  };
  Plotly.newPlot('grafik-multimetre', data, layout, {responsive: true, displayModeBar: false});
})();
</script>

Grafiğin söylediği şey net. Belirsizliği düşürmek isteseniz nereye yatırım yaparsınız? Voltmetreye değil. Daha pahalı bir kalibratöre de değil. **Oda sıcaklığını sabitlemeye.** Sıcaklık aralığı ±2 °C yerine ±0,5 °C olsa, sıcaklık katkısı 23 µV'den 6 µV'ye düşer; toplam belirsizlik 28 µV'den 16 µV'ye iner. Hiçbir cihaz yatırımı yapmadan, sadece klimayı düzgün ayarlayarak belirsizliği yarıya indirdiniz.

> **Akılda kalsın — Pareto kuralı:**
> Belirsizlik bütçesindeki bileşenleri varyans katkısına göre sıralayın. **İlk iki kaynak çoğu zaman toplamın %80–90'ını oluşturur.** İyileştirmeye onlardan başlayın; küçük katkılarla uğraşmak vakit ve para kaybı. Önce en büyük katkıyı yarıya indirmek, geri kalan altıyla uğraşmaktan daha çok kazandırır.

### Bu sonucu kabul etmeli miyiz?

Voltmetrenin teknik kataloğu diyor ki cihazın 10 V'ta toleransı ±100 µV. Şimdi TUR hesaplayalım:

```text
TUR = Tolerans / Belirsizlik = 100 / 56 ≈ 1,8
```

Z540.3'ün 4:1 sınırının çok altında. Ya kabul kararı verirken çok dikkatli olacağız (güvenlik payı uygulayacağız), ya da belirsizliği düşüreceğiz. Üç seçenek var:

1. **Sıcaklığı sabitle.** Yukarıda anlatıldı. Belirsizlik 16 µV'ye iner, TUR = 6,3 olur. En ucuz çözüm.
2. **Daha iyi kalibratör kullan.** UME'nin daha düşük belirsizlikle kalibre ettiği bir referans kaynağa geç. Sertifika belirsizliği ±10 µV olabilir. Ama maliyet artar.
3. **Müşteriyle konuş.** Belki ±100 µV toleransı çok sıkı, gerçek uygulamada ±200 µV bile yeterli olabilir.

Bir test mühendisinin işi sadece sayı üretmek değil, bu üç seçeneği masaya getirip yöneticisiyle tartışmak. Belirsizlik bütçesi olmadan bu konuşmayı yapamazsınız.

---

## Örnek 2: Sıcaklık Sensörü ile Test Fırını Ölçümü

**Senaryo.** Endüstriyel bir parçanın yüksek sıcaklık dayanım testini yapıyorsunuz. Test gereksinimi: parça 200 °C ± 2 °C ortamda 30 dakika çalışmalı. Fırının içine bir **PT100** sensörü koymuşsunuz. (PT100, 0 °C'de tam 100 ohm direnç gösteren platin tel sensörü; sıcaklıkla direnç doğrusal artar; çalışma aralığı tipik olarak −200 °C ile +650 °C arası.) Sensör bir **veri toplama kartına** (DAQ kartı, NI 9217) bağlı, kart bilgisayara veriyor.

Sıcaklığın gerçek değeri ne olabilir? Belirsizlik bütçesi:

| Kaynak | Aralık | Dağılım | u (°C) |
|--------|--------|---------|--------|
| PT100 kalibrasyon belgesi (UME, k=2) | ±0,15 °C | normal | 0,075 |
| Sensörün kendi kendine ısınması (1 mA × 100 Ω = 0,1 mW; ısıl direnç 0,5 K/mW) | ±0,05 °C | düz | 0,029 |
| Bir yıllık kayma (kalibrasyondan bu yana) | ±0,10 °C | düz | 0,058 |
| Fırın iç hacminde sıcaklık dağılımı (önceki ölçümlerden 0,3 °C tepe-tepe) | ±0,15 °C | üçgen | 0,061 |
| DAQ kartı (NI 9217 katalog değeri, 200 °C civarı) | ±0,15 °C | normal | 0,075 |
| 4 telli kablo direnç dengesizliği | ±0,02 °C | düz | 0,012 |
| 30 ölçümün dağılımı (Tip A, s=0,04 °C) | s/√30 | normal | 0,007 |

**Birleşik belirsizlik:**

```text
u² = 0,075² + 0,029² + 0,058² + 0,061² + 0,075² + 0,012² + 0,007²
u² = 0,00563 + 0,00084 + 0,00336 + 0,00372 + 0,00563 + 0,00014 + 0,00005
u² ≈ 0,0194
u  ≈ 0,14 °C
```

**Genişletilmiş belirsizlik (k=2):**

```text
U = 2 × 0,14 = 0,28 °C
```

**Sonuç:** Fırının iç sıcaklığı = (200,00 ± 0,28) °C, k = 2.

Hangi bileşenler en çok katkı yapıyor? Bakalım:

<div id="grafik-pt100" style="width:100%;max-width:760px;margin:1.5rem auto 2.5rem auto;height:380px;"></div>
<script>
(function(){
  var data = [{
    type: 'bar',
    orientation: 'h',
    x: [0.00563, 0.00563, 0.00372, 0.00336, 0.00084, 0.00014, 0.00005],
    y: ['PT100 kalibrasyon belgesi', 'DAQ kartı', 'Fırın sıcaklık dağılımı', 'Kayma', 'Kendi kendine ısınma', 'Kablo dengesizliği', 'Tekrar ölçüm (Tip A)'],
    text: ['29,1%', '29,1%', '19,2%', '17,3%', '4,3%', '0,7%', '0,3%'],
    textposition: 'auto',
    marker: { color: '#e8711a' }
  }];
  var layout = {
    title: { text: 'PT100 Belirsizlik Bütçesi (varyans katkısı)', font: { size: 14 } },
    xaxis: { title: 'Varyans katkısı (°C²)' },
    yaxis: { autorange: 'reversed' },
    margin: { l: 200, r: 30, t: 50, b: 50 },
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff'
  };
  Plotly.newPlot('grafik-pt100', data, layout, {responsive: true, displayModeBar: false});
})();
</script>

**Test mühendisi olarak ne dersiniz?** Gereksinim 200 ± 2 °C, ölçüm belirsizliği 0,28 °C. TUR = 2 / 0,28 ≈ 7,1. Z540.3'ün 4:1 sınırının çok üstünde, sorunsuz.

Ama gereksinim daha sıkı olsaydı (örneğin 200 ± 0,5 °C), TUR = 1,8'e düşerdi. Bu durumda yapılacak iş şu: önce belirsizliği düşürmek lazım. Grafiğe bakın. İlk üç kaynak (PT100 belgesi, DAQ kartı, fırın dağılımı) toplam belirsizliğin %75'ini oluşturuyor. İyileştirme öncelikleri:

1. PT100'ü TÜBİTAK UME'de daha düşük belirsizlikle yeniden kalibre ettirin. ±0,15 yerine ±0,05 °C.
2. Daha yüksek doğruluklu DAQ kartı alın (NI 9226 gibi).
3. Fırın içine ek termal blok koyun, hava sirkülasyonunu artırın.

Bu üç adım belirsizliği yarıya indirir. Hangi kaynağa dokunmadan da ayrı ayrı denenebilir. Mantığı: önce büyüğü azalt, sonra küçükleri düşün.

---

## Örnek 3: Bir Sensörü Kabul mü Edelim, Reddedelim mi?

**Senaryo.** Bir otomotiv basınç sensörü 0–100 bar arasında ölçüm yapıyor. Kalite kontrolünden geçmesi için toleransı ±0,10 bar. Yani ölçüm cihazı bir referans değer verirken sensör ±0,10 bar içinde okumalı. Kalibrasyon sürecinin belirsizliği: U = 0,025 bar.

**TUR hesabı:**

```text
TUR = Tolerans / Belirsizlik = 0,10 / 0,025 = 4
```

Z540.3'ün 4:1 sınırına tam denk geldi. Bu sayı yetiyor mu?

Soruyu şöyle çevirelim: ölçüm cihazı sensörü "geçti" diye işaretlediği halde sensör aslında toleransın dışındaysa, bu **yanlış kabul** olur. Yanlış kabul olasılığı (PFA = Probability of False Accept) ne kadar?

Önce yanlış kabulun ne demek olduğunu görsel olarak görelim. Aşağıda bir sensörün ölçüm dağılımı çizilmiş. Sensörün gerçek değeri 0,098 bar diyelim — yani toleransın iç sınırına çok yakın. Ölçüm cihazı U = 0,025 bar belirsizlikle bu sensörü ölçüyor. Ölçüm sonucu, gerçek değer civarında bir normal dağılımdan rastgele bir nokta gibi düşünebiliriz. Ölçüm 0,10'un altında çıkarsa "geçti" diyoruz — ama gerçek değer 0,098'de bile, ölçüm dağılımının bir kısmı 0,10'un üstüne taşar. Taşan bu kısım yanlış kabul bölgesidir.

<div id="grafik-pfa-gorsel" style="width:100%;max-width:760px;margin:1.5rem auto 2.5rem auto;height:400px;"></div>
<script>
(function(){
  var x = [];
  for (var i=0; i<=400; i++) x.push(0.05 + i*(0.15-0.05)/400);
  var mu = 0.098, sigma = 0.0125;
  var pdf = x.map(function(v){return Math.exp(-(v-mu)*(v-mu)/(2*sigma*sigma))/(sigma*Math.sqrt(2*Math.PI));});
  var maxY = Math.max.apply(null, pdf);
  var xAccept = x.filter(function(v){return v <= 0.10;});
  var pdfAccept = xAccept.map(function(v){return Math.exp(-(v-mu)*(v-mu)/(2*sigma*sigma))/(sigma*Math.sqrt(2*Math.PI));});
  var xReject = x.filter(function(v){return v > 0.10;});
  var pdfReject = xReject.map(function(v){return Math.exp(-(v-mu)*(v-mu)/(2*sigma*sigma))/(sigma*Math.sqrt(2*Math.PI));});
  var data = [
    {x:xAccept, y:pdfAccept, type:'scatter', mode:'lines', fill:'tozeroy',
     line:{color:'#2e7d32', width:2}, fillcolor:'rgba(46,125,50,0.30)',
     name:'Doğru kabul (geçti)', hoverinfo:'skip'},
    {x:xReject, y:pdfReject, type:'scatter', mode:'lines', fill:'tozeroy',
     line:{color:'#c62828', width:2}, fillcolor:'rgba(198,40,40,0.55)',
     name:'Yanlış kabul (gerçekte tolerans dışı)', hoverinfo:'skip'}
  ];
  var layout = {
    title:{text:'Ölçüm Dağılımı ve Yanlış Kabul Bölgesi', font:{size:14}},
    xaxis:{title:'Ölçüm değeri (bar)', range:[0.05, 0.15], zeroline:false},
    yaxis:{title:'Olasılık yoğunluğu', showticklabels:false, zeroline:false},
    shapes:[
      {type:'line', x0:0.10, x1:0.10, y0:0, y1:maxY*1.05,
       line:{color:'#000', width:2, dash:'dash'}},
      {type:'line', x0:mu, x1:mu, y0:0, y1:maxY*0.85,
       line:{color:'#1a73e8', width:1.5, dash:'dot'}}
    ],
    annotations:[
      {x:0.10, y:maxY*1.10, text:'Tolerans sınırı<br>0,10 bar', showarrow:false, font:{size:11}},
      {x:mu, y:maxY*0.92, text:'Gerçek değer<br>0,098 bar', showarrow:false, font:{size:11, color:'#1a73e8'}},
      {x:0.115, y:maxY*0.30, text:'Yanlış<br>kabul', showarrow:true, arrowhead:2, ax:-25, ay:-30, font:{size:11, color:'#c62828'}}
    ],
    showlegend:true, legend:{x:0.02, y:0.98},
    margin:{l:60, r:30, t:50, b:60},
    plot_bgcolor:'#ffffff', paper_bgcolor:'#ffffff'
  };
  Plotly.newPlot('grafik-pfa-gorsel', data, layout, {responsive:true, displayModeBar:false});
})();
</script>

Yeşil alan: ölçüm 0,10'un altında çıkıyor, doğru kabul. Kırmızı alan: ölçüm 0,10'un üstünde çıkıyor (gerçekte sensör tolerans içinde olduğu halde). Burada ölçüm cihazı "reddet" diyecek — ama bu durumda **yanlış red**. Tam tersi durum, yani sensörün gerçek değeri 0,103 bar olursa (tolerans dışı), ölçüm yine dağılım gösterir, ve dağılımın bir kısmı 0,10'un altına düşer; o zaman ölçüm cihazı "geçti" diyor ama sensör aslında tolerans dışı — **yanlış kabul**. Bu yazının kalan kısmında yanlış kabul bizi daha çok ilgilendiriyor (üreticinin çıkardığı bozuk ürün).

Aşağıdaki ikinci grafik, TUR'a göre yanlış kabul olasılığının nasıl değiştiğini gösteriyor. Eğri, sensörün gerçek değerinin tolerans içinde **uniform dağıldığı** varsayımı altında.

<div id="grafik-tur-pfa" style="width:100%;max-width:760px;margin:1.5rem auto 2.5rem auto;height:380px;"></div>
<script>
(function(){
  var data = [{
    type: 'scatter',
    mode: 'lines+markers',
    x: [1, 1.5, 2, 2.5, 3, 4, 6, 10],
    y: [30, 15, 8, 5, 3, 1.5, 0.5, 0.1],
    line: { color: '#c62828', width: 3 },
    marker: { size: 8, color: '#c62828' },
    name: 'Yanlış kabul olasılığı'
  }];
  var layout = {
    title: { text: 'TUR ile Yanlış Kabul Olasılığının Değişimi', font: { size: 14 } },
    xaxis: { title: 'TUR (Tolerans / Belirsizlik)' },
    yaxis: { title: 'Yanlış kabul olasılığı (%)', type: 'log' },
    shapes: [{
      type: 'line', x0: 4, x1: 4, y0: 0.05, y1: 30,
      line: { color: '#888', width: 2, dash: 'dash' }
    }],
    annotations: [{
      x: 4, y: 1.5, xref: 'x', yref: 'y',
      text: 'Z540.3 sınırı (4:1)', showarrow: true, arrowhead: 2, ax: 60, ay: -30
    }],
    margin: { l: 70, r: 30, t: 50, b: 60 },
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff'
  };
  Plotly.newPlot('grafik-tur-pfa', data, layout, {responsive: true, displayModeBar: false});
})();
</script>

TUR = 4'te bile yanlış kabul olasılığı yaklaşık %1,5. 10.000 sensör sevkiyatında 150 hatalı kabul demek. Bu yüzden Z540.3 ek bir önlem öneriyor: **kabul aralığını güvenlik payı kadar daraltmak**. Buna **güvenlik payı** (İngilizcesi guard band) deniyor.

Z540.3 6. yöntemde güvenlik payı çarpanı M, TUR'a göre tablodan okunur. PFA'yı %2'nin altında tutmak için tipik değerler:

| TUR | M çarpanı | Güvenlik payı (= M × U) |
|-----|-----------|-------------------------|
| 4:1 | ≈ 0,053 | %5,3 × U |
| 3:1 | ≈ 0,155 | %15,5 × U |
| 2:1 | ≈ 0,282 | %28,2 × U |
| 1:1 | ≈ 0,457 | %45,7 × U |

TUR azaldıkça güvenlik payı büyür; bu mantıklı, çünkü belirsizlik tolerans büyüklüğüne yaklaştıkça yanlış kabul riski artıyor. Bizim örneğimiz için TUR = 4:

```text
Güvenlik payı = 0,053 × 0,025 = 0,00133 bar
Yeni kabul aralığı = ±(0,10 − 0,00133) = ±0,09867 bar
```

Yani sensörün ölçümü 0,099 bar çıkarsa: tolerans içinde ama güvenlik payı dışında. "Sınırda, manuel inceleme" durumu.

Karşılaştırma için: ILAC G8 (Avrupa) güvenlik payını sade bir şekilde **U** olarak alır (M = 1). Bu daha muhafazakâr; bizim örneğimizde güvenlik payı 0,025 bar olur, kabul aralığı ±0,075 bar'a kadar daralır. ILAC ve ANSI farkı sahada önemli; müşterinizin hangi standardı şart koştuğuna bakın.

**Önemli bir uyarı.** "TUR ≥ 4 yeter" varsayımı eski bir kuraldır. Henry Zumbrun adlı uzman 2021'de yazdığı "TUR=4 Neden Yeterli Değil" makalesinde gerçek üretim verisi üzerinden gösterdi: bir ölçüm sınıra çok yakın çıktığında TUR=4 bile %30+ yanlış kabul olasılığı yaratabilir. Bu yüzden modern uygulama, sadece TUR'a bakmak değil, gerçek PFA'yı hesaplamaktır. Z540.3 6. yöntem ya da **ILAC G8** (Avrupa eşdeğeri, güvenlik payı = 1×U formülünü kullanır) bu işi yapar.

> **Akılda kalsın — kabul/red kararı:**
> - **TUR = Tolerans / Genişletilmiş belirsizlik (U)**
> - **Z540.3 (ABD):** Yanlış kabul olasılığı (PFA) ≤ %2 olmalı; pratik değilse TUR ≥ 4. Method 6 ile güvenlik payı: TUR=4 için ≈ 0,053×U; TUR=2 için ≈ 0,28×U.
> - **ILAC G8 (Avrupa):** Güvenlik payı = 1×U (kabul aralığı her iki yandan U kadar daraltılır).
> - **Önemli:** TUR ≥ 4 yeter zannetmeyin. Ölçüm sınıra çok yakın çıkarsa TUR=4 bile %30+ yanlış kabul üretebilir. Karar verirken hem TUR'a hem ölçümün sınıra uzaklığına bakın.

---

## Yedi Pratik Tavsiye

Yazıyı bir el kitabına dönüştürelim. Yarın işe gittiğinizde uygulayabileceğiniz somut yedi madde:

1. **Belirsizlik bütçesini test prosedürünün parçası yapın.** Test belgesinin içine "belirsizlik bütçesi" başlıklı bir bölüm koyun. Sonradan eklenen bütçe çoğunlukla eksik kalır.

2. **Tek ölçüm yapmayın.** En az 10 tekrar ölçüm. Mümkünse iki farklı operatör, iki farklı gün. Kıdemli mühendis "bir kez ölçtüm geçti" derse, "tekrar yapalım" deyin.

3. **Kalibrasyon belgelerini saklayın.** Her cihazın izlenebilirlik zincirinde TÜRKAK akreditasyonlu bir laboratuvarın belgesi olmalı. Belge numaralarını test belgesine yazın. Akreditasyon denetiminde her birinin sorulması olası.

4. **İlişkili kaynakları arayın.** Aynı kalibratörden iki cihaz besleniyorsa, sertifika belirsizlikleri ilişkili. Aynı oda, aynı kullanıcı, aynı kablolar; bunlar ilişki yaratır. Bağımsızlık varsayımı doğal değildir, doğru olduğunu göstermek size düşer.

5. **PDF varsayımlarını yazılı gerekçelendirin.** "Düz dağılım kullandım çünkü üretici belirtmedi" gibi bir not her satırın yanında olsun.

6. **TUR ≥ 4 yeterli demeyin.** Yanlış kabul olasılığını hesaplayın. Z540.3 6. yöntem ya da ILAC G8 ile güvenlik payı ekleyin.

7. **Sonucu doğru ifade edin.** "Geçti" yerine: "9,999889 V, U = 56 µV (k=2). Tolerans 10,000 V ± 100 µV. Sonuç: tolerans içinde, güvenlik payı içinde." Sayı + birim + belirsizlik + k dörtlüsü eksik olduğunda rapor da eksik.

---

## Hızlı Referans Kartı

Bu bölümü ayrı bir sayfaya yazdırıp masanızın üstüne koyabilirsiniz. Belirsizlik bütçesi yaparken sürekli geri dönülen şablon.

### Adım adım belirsizlik hesabı

1. Ölçtüğünüz büyüklüğün **bileşenlerini listeleyin** (Tip A + Tip B kaynakları).
2. Her bileşen için **standart belirsizliği** (u) hesaplayın:
   - Tip A: birden fazla ölçüm → s/√n
   - Tip B: aralığı dağılım faktörüne böl
3. **Birleşik belirsizlik:** u = √(Σ uᵢ²)
4. **Genişletilmiş belirsizlik:** U = k × u (genelde k = 2)
5. **Sonucu yazın:** "X = (değer ± U) birim, k = 2"
6. **TUR kontrol edin:** TUR = Tolerans / U; gerekirse güvenlik payı uygulayın.

### Aralık → standart belirsizlik dönüşüm tablosu

| Veri kaynağı | Standart belirsizlik formülü |
|--------------|------------------------------|
| Sertifika "U, k=2" | u = U / 2 |
| Sertifika "U, k=3" | u = U / 3 |
| Üretici spec "±a" (bilgi yok) | u = a / √3 |
| "Merkez yakını daha olası" | u = a / √6 |
| Termostat dalgalanması | u = a / √2 |
| Tip A: n ölçüm, ortalama raporlanır | u = s / √n |
| Tip A: tek ölçüm raporlanır | u = s |

### Karar kuralı

| TUR (Tolerans / U) | Yaklaşık PFA | Yapılacak |
|--------------------|--------------|-----------|
| ≥ 10 | ≤ %0,1 | Sorunsuz |
| ≥ 4 | ≤ %1,5 | Z540.3 sınırı, dikkat |
| 2–4 | %2–8 | Güvenlik payı şart |
| < 2 | %8+ | Belirsizliği düşür ya da toleransı gevşet |

### Akreditasyon denetiminde sorulanlar

- Her cihazın izlenebilirlik zinciri belge numarası var mı?
- Tip B bileşenleri için PDF varsayımı **yazılı gerekçesi** var mı?
- Bağımsızlık varsayımı kontrol edildi mi (aynı kalibratör, aynı operatör)?
- Tip A ölçümleri arasında koşullar gerçekten yenilendi mi?
- TUR < 4 ise PFA hesabı belgelenmiş mi?
- Sonuç raporu "değer + birim + U + k" dörtlüsünü içeriyor mu?

### Belirsizlik bütçesi şablonu (kopyala-doldur)

| # | Kaynak | Aralık | Dağılım | Bölme | u (birim) | u² | Katkı % |
|---|--------|--------|---------|-------|-----------|-----|---------|
| 1 | (örn. kalibrasyon belgesi) | ± ... | normal | 2 | ... | ... | ... |
| 2 | (örn. çözünürlük) | ± ... | düz | √3 | ... | ... | ... |
| 3 | (örn. sıcaklık etkisi) | ± ... | düz | √3 | ... | ... | ... |
| 4 | (örn. drift) | ± ... | düz | √3 | ... | ... | ... |
| 5 | (Tip A, n ölçüm) | s = ... | normal | √n | ... | ... | ... |
| | **Birleşik (u)** | | | | **√Σ** | **= ?** | %100 |
| | **Genişletilmiş (U, k=2)** | | | | **2u** | | |

Tabloyu doldurduktan sonra "Katkı %" sütunu hangi bileşenin en çok katkıyı verdiğini gösterir; iyileştirmeye en büyük yüzdeden başlayın.

---

## Sonuç

GUM teorik temeli kuruyor, **F eki** günlük ölçüm yapan mühendise yönelik en pratik bölüm. NCSLI RP-12 GUM'u günlük dile çeviriyor, somut tablo ve şablonlar veriyor. ANSI Z540.3 ile birleşince kalibrasyon laboratuvarlarının uyması gereken kurallar bütünü ortaya çıkıyor.

Türkiye'de uçak elektroniği (TUSAS, BAYKAR), savunma (ASELSAN, ROKETSAN), otomotiv (Togg ve tedarikçileri) ve medikal cihaz alanında bu disiplin yavaş yavaş zorunlu hale geliyor. Akreditasyon denetimleri sertleşiyor, müşteriler belirsizlik bütçesini bir formalite değil mühendislik ürünü olarak istiyor.

Bir test mühendisinin işi sadece sayı üretmek değil. Sayının yanına eklenecek "± şu kadar" değerini de üretmek. Bu olmadan "geçti" sözünün ölçüsel bir karşılığı yok; sadece bir tahmin.

Bir sonraki yazıda aynı problemleri **Monte Carlo simülasyonu** ile çözeceğiz. Doğrusal olmayan ölçüm modellerinde (radyo frekans güç ölçümü, dinamik basınç gibi) klasik kareli toplam yaklaşımı yetersiz kalır; bilgisayarda 100.000 simülasyon yaparak dağılımı doğrudan üretmek gerekir.

---

## Kaynaklar

- [JCGM 100:2008 — Ölçüm Belirsizliğinin İfadesi Kılavuzu (BIPM PDF)](https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf)
- [JCGM 101:2008 — Monte Carlo ile Belirsizlik Dağılımı (Ek 1)](https://www.bipm.org/documents/20126/2071204/JCGM_101_2008_E.pdf)
- [JCGM GUM-6:2020 — Ölçüm Modelleri Geliştirme ve Kullanma](https://www.bipm.org/documents/20126/2071204/JCGM_GUM_6_2020.pdf)
- [GUM F Eki — Belirsizlik Bileşenlerini Hesaplamak için Pratik Rehber (HTML)](https://www.iso.org/sites/JCGM/GUM/JCGM100/C045315e-html/C045315e_FILES/MAIN_C045315e/AF_e.html)
- [GUM H Eki — Sayısal Örnekler (HTML)](https://www.iso.org/sites/JCGM/GUM/JCGM100/C045315e-html/C045315e_FILES/MAIN_C045315e/AH_e.html)
- [NCSLI RP-12: Ölçüm Belirsizliklerini Belirleme ve Raporlama (2013)](https://ncsli.org/store/viewproduct.aspx?id=16960491)
- [EA-4/02 M:2013 — Avrupa Kalibrasyon Belirsizliği Rehberi](https://www.isobudgets.com/pdf/uncertainty-guides/ea-4-02-m-2013-expression-of-the-uncertainty-of-measurement-in-calibration.pdf)
- [Henry Zumbrun — TUR=4 Neden Yeterli Değil (Morehouse, 2021)](https://mhforce.com/wp-content/uploads/2021/04/TUR-is-not-enough-1-1.pdf)
- [Welch-Satterthwaite Formülü Pratik Açıklaması (In Compliance Magazine)](https://incompliancemag.com/using-welch-satterthwaite-formula-in-uncertainty-analysis/)
- [Etkin Serbestlik Derecesi Hesabı (ISOBudgets)](https://www.isobudgets.com/calculating-effective-degrees-of-freedom/)
- [Güvenlik Payı (Guard Band) Açıklaması (ISOBudgets)](https://www.isobudgets.com/guard-banding-how-to-take-uncertainty-into-account/)
- [Basınç Ölçüm Belirsizliği Rehberi (Fluke Calibration)](https://www.fluke.com/en-us/learn/blog/pressure-calibration/guide-determining-pressure-measurement-uncertainty)
- [TÜBİTAK UME — Ulusal Metroloji Enstitüsü](https://www.ume.tubitak.gov.tr/)
- [TÜRKAK — Türk Akreditasyon Kurumu](https://www.turkak.org.tr/)

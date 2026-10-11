---
title: "Tıkalı Bir Pitot Tüpü, Hız Göstergesini Altimetreye Çevirir"
subtitle: "When a Blocked Pitot Tube Turns the Airspeed Indicator into an Altimeter"
background: "/img/posts/6.webp"
date: '2026-10-12 00:30:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [aviyonik, sensor, emniyet, hava-veri]
---

6 Şubat 1996 gecesi, Puerto Plata'dan kalkan bir Boeing 757-225 tırmanışın yedinci dakikasında aynı anda iki uyarı veriyordu: **overspeed** kornası ve **stick shaker**. Biri "çok hızlısın", diğeri "düşmek üzeresin" diyordu. İkisi birbirini dışlar; ikisi aynı anda doğru olamaz. Mürettebat hangisinin doğru olduğuna karar veremedi ve uçak Atlantik'e düştü. 189 kişi öldü.

Bu yazının konusu o gece hangi insan hatasının yapıldığı değil. Beni ilgilendiren şu: **hava veri bilgisayarı (ADC) hiç bozulmamıştı.** Tek bir devre arızalanmadı, tek bir satır kod yanlış çalışmadı, tek bir sayı taşmadı. ADC önüne gelen basınçları aldı, ses altı hava veri denklemlerini uyguladı ve sonucu yayınladı. Denklemler doğruydu. Aritmetik doğruydu. Çıkan sayı ise 150 knot yanlıştı.

Bu, gömülü yazılımda en sevmediğim arıza sınıfıdır: **girdisi bozuk ama çıktısı geçerli görünen hesap.** Menzil denetimi yakalamaz, makulluk denetimi yakalamaz, watchdog atmaz, CRC tutar, assertion patlamaz. Çünkü hesabın kendisinde yanlış bir şey yoktur. Bu yazıda pitot-statik denklemlerini türetip tıkalı bir probun bu denklemlerin içinden nasıl geçtiğini sayı sayı izleyeceğiz; sonra modeli gerçek kaza kaydına dayayıp ne kadar tuttuğuna bakacağız.

---

## Uçak Hızını Ölçmez, Hesaplar

Modern bir yolcu uçağında "hız sensörü" diye bir cihaz yoktur. Dışarıdan alınan tek şey **iki basınçtır**:

- **Toplam basınç** $P_t$ — öne bakan, ucu açık **pitot** tüpünden. İçindeki hava durgundur; hem ortam statik basıncını hem de akışın durma noktasında dönüşen kinetik enerjisini taşır.
- **Statik basınç** $P_s$ — gövdenin yanındaki, akışa paralel **statik portlardan**. İdeal olarak yalnızca ortam basıncını görür.

Geri kalan her şey bu ikisinden türetilir. Aradaki fark **impact basıncıdır**:

$$
q_c = P_t - P_s
$$

Dikkat: $q_c$ dinamik basınç $\tfrac{1}{2}\rho V^2$ değildir. Sıkıştırılamaz akış varsayımı yalnızca çok düşük hızlarda geçerlidir; yolcu uçağı hızlarında sıkıştırılabilirlik ihmal edilemez.

<div class="mermaid">
graph LR
  PT[Pitot probu - toplam basınç Pt]
  PS[Statik port - statik basınç Ps]
  ADC[Hava Veri Bilgisayarı ADC]
  QC[impact basıncı qc = Pt - Ps]
  CAS[CAS - gösterge hızı]
  MACH[Mach sayısı]
  ALT[basınç yüksekliği]
  TAS[TAS - gerçek hız]
  TAT[Toplam sıcaklık probu]
  PT --> ADC
  PS --> ADC
  TAT --> ADC
  ADC --> QC
  QC --> CAS
  QC --> MACH
  PS --> ALT
  MACH --> TAS
</div>

---

## Dört Kanal, Dört Farklı Bağımlılık

ARINC 706 "Mark 5 Subsonic Air Data System", bir ADC'nin üretmesi gereken parametre kümesini ve arayüzünü tanımlar. Parametrelerin ardındaki denklemler ise standart sıkıştırılabilir ses altı akış bağıntılarıdır; aşağıdaki formları USAF Test Pilot School'un ilgili teknik notundan aldım.

**Gösterge hızı (CAS).** Saint-Venant bağıntısının tersi:

$$
V_c = a_0 \sqrt{5\left[\left(\frac{q_c}{P_0} + 1\right)^{2/7} - 1\right]}
$$

Burada $a_0 = 340.294$ m/s (661,48 kt) deniz seviyesi standart ses hızı, $P_0 = 1013.25$ hPa standart deniz seviyesi basıncıdır. $2/7$ üssü $1/3.5$ demektir ve $\gamma = 1.4$ için izentropik ilişkiden gelir.

Buradaki en kritik ayrıntıyı altını çizerek geçeyim: **$V_c$ yalnızca $q_c$'ye bağlıdır.** $P_0$ ve $a_0$ birer sabittir — gerçek deniz seviyesi basıncı değil, *tanım gereği* sabit. Yani CAS, ne irtifaya ne de dış hava sıcaklığına bağlıdır. Bu, birazdan kurduğum modelin tropik bir havaalanında bile geçerli olmasını sağlayacak.

**Mach sayısı.** Aynı form, ama bu kez payda gerçek statik basınç:

$$
M = \sqrt{5\left[\left(\frac{q_c}{P_s} + 1\right)^{2/7} - 1\right]}
$$

**Basınç yüksekliği.** Yalnızca $P_s$'den, ICAO Standart Atmosfer troposfer modeliyle:

$$
h_p = \frac{T_0}{L}\left[1 - \left(\frac{P_s}{P_0}\right)^{RL/g}\right]
$$

$T_0 = 288.15$ K, $L = 0.0065$ K/m, $R = 287.05$ J/(kg·K), $g = 9.80665$ m/s². Katsayılar sadeleştirilince tanıdık form çıkar: $h_p = 44330.77\left[1 - (P_s/P_0)^{0.1902632}\right]$ metre.

**Gerçek hız (TAS).** Mach ve toplam sıcaklık probundan türetilen statik sıcaklıkla:

$$
V_t = M\sqrt{\gamma R T}
$$

Tablo halinde bağımlılıklar:

| Kanal | Girdi | $P_t$ bozulursa | $P_s$ bozulursa |
|---|---|---|---|
| CAS | $q_c$ | bozulur | bozulur |
| Mach | $q_c$, $P_s$ | bozulur | bozulur |
| Basınç yüksekliği | $P_s$ | **etkilenmez** | bozulur |
| TAS | Mach, $T$ | bozulur | bozulur |

Burada ilk ipucu var: **tıkalı bir pitot, altimetreyi hiç etkilemez.** Altimetre doğru çalışmaya devam eder. Bu, mürettebat için bir avantaj gibi görünür; aslında tuzağın ta kendisidir, çünkü "irtifa doğru olduğuna göre sistem sağlam" hissi verir.

---

## Sağlam Sistemde Sayılar

Önce referans noktası kuralım. Sabit 290 kt CAS ile tırmanan bir uçak:

| İrtifa (ft) | $P_s$ (hPa) | $q_c$ (hPa) | CAS (kt) | Mach | TAS (kt) |
|---|---|---|---|---|---|
| 0 | 1013,2 | 143,0 | 290,0 | 0,438 | 290,0 |
| 5.000 | 843,1 | 143,0 | 290,0 | 0,478 | 311,0 |
| 10.000 | 696,8 | 143,0 | 290,0 | 0,523 | 334,1 |
| 20.000 | 465,6 | 143,0 | 290,0 | 0,631 | 387,4 |
| 30.000 | 300,9 | 143,0 | 290,0 | 0,766 | 451,7 |
| 35.000 | 238,4 | 143,0 | 290,0 | 0,848 | 488,6 |

Sabit CAS, sabit $q_c$ demektir — çünkü CAS yalnızca $q_c$'nin fonksiyonu. Statik basınç düştükçe aynı $q_c$ giderek daha büyük bir Mach'a ve daha büyük bir TAS'a karşılık gelir. 35.000 ft'te 290 kt gösterge hızı, 489 kt gerçek hız demektir. Buraya kadar her şey beklendiği gibi.

---

## Tıkalı Pitot: Gösterge Gizli Bir Altimetreye Dönüşür

Şimdi probu tıkayalım. Birgenair'de prob **yerde park halindeyken** tıkandı; uçak 20 gün boyunca prob kapakları takılı olmadan beklemişti ve bir çamur arısının (mud dauber) yuva yaptığı değerlendirildi. Problar hiç bulunamadığı için bu çıkarım, gözlem değil.

Tıkalı tüp kapalı bir hacme dönüşür. İçindeki basınç, tıkandığı andaki değerde **donar**. Prob yerde tıkandıysa:

$$
P_t^{\text{donmuş}} = P_s(\text{saha}) \approx P_0
$$

ADC ise hâlâ $q_c = P_t - P_s$ hesaplamaya devam eder. Artık $P_t$ sabit, $P_s$ ise irtifayla **düşen** bir büyüklük. Dolayısıyla:

$$
q_c^{\text{ölçülen}}(h) = P_t^{\text{donmuş}} - P_s(h)
$$

ve bunu CAS denkleminde yerine koyduğumuzda:

$$
V_c^{\text{gösterilen}}(h) = a_0 \sqrt{5\left[\left(\frac{P_t^{\text{donmuş}} - P_s(h)}{P_0} + 1\right)^{2/7} - 1\right]}
$$

Bu ifadede **hız yoktur.** Sağ tarafta uçağın gerçek hızına ait tek bir terim bile kalmamıştır. Gösterge artık yalnızca irtifanın fonksiyonudur — yani fiilen ikinci bir altimetredir, sadece knot biriminde kalibre edilmiş bir altimetre.

ISA atmosferi ve $P_t^{\text{donmuş}} = 1013.25$ hPa ile sayılar:

| Basınç yüksekliği (ft) | $P_s$ (hPa) | $q_c^{\text{ölç}}$ (hPa) | Gösterilen IAS (kt) | Gösterilen Mach |
|---|---|---|---|---|
| 0 | 1013,2 | 0,0 | **0,0** | 0,000 |
| 1.000 | 977,2 | 36,1 | 148,3 | 0,228 |
| 2.000 | 942,1 | 71,1 | 206,9 | 0,324 |
| 4.000 | 875,1 | 138,1 | 285,3 | 0,462 |
| 6.688 | 791,2 | 222,1 | **357,0** | 0,605 |
| 8.000 | 752,6 | 260,6 | 384,5 | 0,666 |
| 10.000 | 696,8 | 316,4 | 420,3 | 0,751 |

İlk satır kritik: **yerde gösterge sıfırdır.** Kalkış koşusunda kaptanın hız göstergesi hiç hareket etmez. Kaza raporunun CVR dökümünde yardımcı pilot "80 knots" diye seslenir ve kaptan kendi göstergesinin çalışmadığını söyler. Resmi analiz de bunu doğrular: kaptanın göstergesinde başlangıçta hiçbir gösterim yoktu, ancak tırmanış sırasında sol üst pitot tüpündeki tıkanma nedeniyle hatalı bilgi vermeye başladı.

Modelin söylediği tam olarak budur. Uçak havalanıp tırmanmaya başladığı anda $P_s$ düşmeye başlar, $q_c^{\text{ölçülen}}$ sıfırdan büyümeye başlar ve ölü gösterge **kendiliğinden canlanır**. Üstelik makul bir değerle canlanır — 1.000 ft'te 148 kt, 2.000 ft'te 207 kt. Bunlar tırmanış için gayet normal görünen sayılardır. Arıza, kendini onarmış gibi görünür.

---

## Modeli Kaza Kaydına Dayamak

Buraya kadarı teori. Şimdi modeli gerçek veriye karşı sınayalım.

Resmi kaza raporu kesin bir veri noktası veriyor: saat 03:45:28'de uçak **6.688 ft** irtifada, **gösterge hızı 352 knot**, burun yukarı 15,1 derece, merkez otopilot bağlıyken overspeed alarmı çalıyor.

Yukarıdaki tablonun 6.688 ft satırına bakın: modelin tahmini **357,0 kt**. Kayıtlı değerden 5 kt, yani **%1,4** sapma.

Bu kadar yakın bir tutma tesadüf olabilir mi diye saha basıncına karşı duyarlılığa baktım. $P_t^{\text{donmuş}}$ tam olarak sahanın o günkü basıncıdır; Puerto Plata deniz seviyesinde ve o geceki QNH elimde yok:

| Saha QNH (hPa) | Model IAS (kt) | Rapor (kt) | Sapma |
|---|---|---|---|
| 1008 | 352,6 | 352 | +0,6 |
| 1010 | 354,1 | 352 | +2,1 |
| 1013,25 | 356,6 | 352 | +4,6 |
| 1016 | 358,7 | 352 | +6,7 |
| 1020 | 361,6 | 352 | +9,6 |

Makul QNH aralığının tamamında model 352–362 kt arasında kalıyor; alt uçta kayıtlı değere 1 kt'den yakın. Sıcaklığın hiç rol oynamaması da modeli güçlendiriyor: CAS yalnızca basınçların fonksiyonu olduğu için, Karayipler'in tropik sıcaklığı bu hesabı değiştirmez. Değiştirseydi, ISA varsayımım ciddi bir zayıflık olurdu.

Model ayrıca ikincil kaynaklar arasındaki bir çelişkiyi de ayırt ediyor. Wikipedia 4.700 ft'te yaklaşık 350 kt okunduğunu yazıyor; resmi rapor 6.688 ft'te 352 kt diyor. Model 4.700 ft için yaklaşık 306 kt veriyor — yani 350 kt o irtifada fizikle bağdaşmıyor. Rapordaki eşleşme tutarlı, Wikipedia'daki değil. Fiziğin ikincil kaynaklar arasında hakemlik yapabilmesi hoşuma gidiyor.

<figure>
<svg viewBox="0 0 748 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tıkalı pitot durumunda gösterilen hız ile gerçek hızın irtifayla birlikte ters yönde ayrışması">
<g stroke="currentColor" stroke-opacity="0.18" stroke-width="1">
<line x1="62" y1="354.0" x2="600" y2="354.0"/>
<line x1="62" y1="316.7" x2="600" y2="316.7"/>
<line x1="62" y1="279.3" x2="600" y2="279.3"/>
<line x1="62" y1="242.0" x2="600" y2="242.0"/>
<line x1="62" y1="204.7" x2="600" y2="204.7"/>
<line x1="62" y1="167.3" x2="600" y2="167.3"/>
<line x1="62" y1="130.0" x2="600" y2="130.0"/>
<line x1="62" y1="92.7" x2="600" y2="92.7"/>
<line x1="62" y1="55.3" x2="600" y2="55.3"/>
<line x1="62" y1="18.0" x2="600" y2="18.0"/>
<line x1="62.0" y1="22" x2="62.0" y2="354"/>
<line x1="169.6" y1="22" x2="169.6" y2="354"/>
<line x1="277.2" y1="22" x2="277.2" y2="354"/>
<line x1="384.8" y1="22" x2="384.8" y2="354"/>
<line x1="492.4" y1="22" x2="492.4" y2="354"/>
<line x1="600.0" y1="22" x2="600.0" y2="354"/>
</g>
<g stroke="currentColor" stroke-width="1.6" fill="none"><path d="M62 22 L62 354 L600 354"/></g>
<line x1="62" y1="95.8" x2="600" y2="95.8" stroke="#d1495b" stroke-width="1.6" stroke-dasharray="7 5"/>
<line x1="62" y1="206.2" x2="600" y2="206.2" stroke="#e09f3e" stroke-width="1.6" stroke-dasharray="3 4"/>
<polyline fill="none" stroke="#2e86ab" stroke-width="2.8" stroke-linejoin="round" points="62.0,354.0 88.9,276.7 115.9,244.6 142.8,220.0 169.6,199.5 196.6,181.7 223.5,165.8 250.4,151.4 277.2,138.2 304.2,126.0 331.1,114.6 358.0,103.8 384.8,93.7 411.8,84.1 438.7,74.9 465.6,66.2 492.4,57.8 519.4,49.7 546.3,42.0 573.2,34.5 600.0,27.3"/>
<polyline fill="none" stroke="#3a9647" stroke-width="2.8" stroke-linejoin="round" stroke-dasharray="9 5" points="62.0,140.1 115.9,141.6 169.6,151.3 223.5,159.5 277.2,170.0 331.1,182.6 384.8,190.8 421.9,196.0 492.4,210.9 600.0,221.9"/>
<circle cx="421.9" cy="94.4" r="5.5" fill="#2e86ab" stroke="currentColor" stroke-width="1.5"/>
<text x="413.9" y="81.4" fill="currentColor" font-size="12.5" text-anchor="end">FDR: 6.688 ft / 352 kt</text>
<g fill="currentColor" font-size="12.5">
<text x="53" y="358.5" text-anchor="end">0</text>
<text x="53" y="284.0" text-anchor="end">100</text>
<text x="53" y="209.2" text-anchor="end">200</text>
<text x="53" y="134.5" text-anchor="end">300</text>
<text x="53" y="59.8" text-anchor="end">400</text>
<text x="62.0" y="373" text-anchor="middle">0</text>
<text x="169.6" y="373" text-anchor="middle">2.000</text>
<text x="277.2" y="373" text-anchor="middle">4.000</text>
<text x="384.8" y="373" text-anchor="middle">6.000</text>
<text x="492.4" y="373" text-anchor="middle">8.000</text>
<text x="600.0" y="373" text-anchor="middle">10.000</text>
<text x="331.0" y="391" text-anchor="middle" font-size="13">basınç yüksekliği (ft)</text>
<text transform="translate(16,188.0) rotate(-90)" text-anchor="middle" font-size="13">hız (kt)</text>
</g>
<line x1="612" y1="38" x2="636" y2="38" stroke="#2e86ab" stroke-width="2.8"/>
<text x="642" y="42.5" fill="currentColor" font-size="12">gösterilen IAS</text>
<line x1="612" y1="64" x2="636" y2="64" stroke="#3a9647" stroke-width="2.8" stroke-dasharray="9 5"/>
<text x="642" y="68.5" fill="currentColor" font-size="12">gerçek CAS</text>
<line x1="612" y1="90" x2="636" y2="90" stroke="#d1495b" stroke-width="2.8" stroke-dasharray="7 5"/>
<text x="642" y="94.5" fill="currentColor" font-size="12">VMO 350 kt</text>
<line x1="612" y1="116" x2="636" y2="116" stroke="#e09f3e" stroke-width="2.8" stroke-dasharray="3 4"/>
<text x="642" y="120.5" fill="currentColor" font-size="12">stall ~200 kt</text>
</svg>
<figcaption><strong>Şekil 1.</strong> Tıkalı pitot senaryosunda gösterilen hız irtifayla birlikte tek yönlü artar; gerçek hız ise otopilotun burun yukarı tepkisiyle düşer. İki eğri yaklaşık 3.200 ft'te makas gibi kesişir. Mavi eğri ve işaretli nokta gerçektir: eğri modelden, nokta resmi kaza raporunun FDR kaydından gelir ve ikisi örtüşür. Yeşil eğri ise FDR verisi değil, otopilot tepkisiyle tutarlı temsili bir profildir.</figcaption>
</figure>

---

## Çelişki Penceresi

Şimdi iki eğriyi birlikte okuyalım. Otopilot, tıkalı kanaldan gelen "hız artıyor" bilgisine tepki olarak burnu kaldırıp gücü azaltır. Yani **gösterge hızlandıkça uçak gerçekte yavaşlar.** İki eğri zıt yönlere gider:

| İrtifa (ft) | Gerçek CAS (kt) | Gösterilen IAS (kt) | Fark | Overspeed? | Gerçekte stall'a yakın? |
|---|---|---|---|---|---|
| 2.000 | 275 | 206,9 | −68,1 | hayır | hayır |
| 4.000 | 250 | 285,3 | +35,3 | hayır | hayır |
| 6.688 | 215 | 357,0 | +142,0 | **evet** | hayır |
| 8.000 | 195 | 384,5 | +189,5 | **evet** | **evet** |
| 10.000 | 180 | 420,3 | +240,3 | **evet** | **evet** |

Buradaki **gerçek CAS sütunu FDR kaydı değildir**; tırmanışta güç azaltma ve burun yukarı tepkiyle tutarlı, temsili bir profildir. Gösterilen IAS sütunu ise modelden gelir ve 6.688 ft satırı kayıtla doğrulanmıştır. Son iki satır o gecenin kokpitini niteliksel olarak anlatır. Overspeed uyarısı **gösterilen** hızdan tetiklenir ve 757 için VMO 350 kt / M 0,86'dır. Stick shaker ise hücum açısı sensöründen tetiklenir ve hücum açısı pitot tüpünden bağımsızdır — yani **gerçeği** söyler. İki uyarı farklı fizikten beslendiği için aynı anda çalabilir ve ikisi de kendi girdisine göre doğrudur.

Mürettebatın yaşadığı çelişki bir arıza değil, **sistemin tasarlandığı gibi çalışmasının** sonucudur. Resmi sebep, mürettebatın stick shaker'ı yaklaşan stall uyarısı olarak tanıyamaması ve stall kurtarma prosedürünü uygulamaması olarak belirlenmiştir. Ama o çelişkiyi kokpite taşıyan şey, tek bir tıkalı tüptür.

---

## Aynanın Öteki Yüzü: Statik Taraf

Aynı yılın 2 Ekim'inde, Lima'dan kalkan bir Aeroperú 757'si (N52AW) benzer bir çıkmaza girdi ve 70 kişi öldü. Bu kez arıza pitotta değil, **statik portlardaydı**: bakım sırasında gövdeye yapıştırılan bant uçuştan önce sökülmemişti.

Statik taraf tıkandığında bozulma deseni tersine döner:

- **Altimetre donar.** $h_p$ yalnızca $P_s$'nin fonksiyonu olduğu için, $P_s$ sabit kalırsa irtifa göstergesi tırmanışa rağmen sabit okur. Gece, okyanus üzerinde, görsel referans yokken bu ölümcüldür.
- **Tırmanışta gösterge hızı düşük okur.** $q_c = P_t - P_s^{\text{donmuş}}$ ifadesinde $P_t$ irtifayla düşerken $P_s$ sabit kaldığı için fark küçülür; yeterince tırmanıldığında sıfıra iner.
- **Dikey hız sıfır gösterir.**

Kaynakların ayrıntıda ayrıştığını belirtmem gerek: bandın maskeleme bandı mı koli bandı mı olduğu ve hangi taraftaki portların kapalı olduğu konusunda ikincil kaynaklar çelişiyor; sağ taraftaki portlar hiç bulunamadı. Gerçek olayda tıkanma muhtemelen kısmiydi ve mürettebat birbiriyle çelişen uyarılar aldı. Bu yüzden yukarıdaki üç maddeyi Aeroperú'nun birebir yeniden üretimi olarak değil, **tam tıkalı statik portun genel imzası** olarak sunuyorum.

İki kazanın ortak dersi şu: ADC'nin dört kanalı iki basınca bağlıdır ve o iki basınç, gövdenin dışındaki **birkaç milimetrelik deliklerdir.** Yazılımın ne kadar nitelendirilmiş olduğunun bununla ilgisi yoktur.

---

## Menzil Denetimi Neden Yakalayamaz?

Şimdi işin yazılım tarafına gelelim. Gömülü bir sensör işleme zincirinde standart savunma hattı şudur: girdiyi menzile göre denetle, çıktıyı makulluğa göre denetle, değişim hızını sınırla.

Tıkalı pitot senaryosunu bu üç denetimden geçirelim. Tipik bir ses altı ADC için CAS menzili 0–450 kt, Mach menzili 0–1,0 kabul edelim:

| İrtifa (ft) | IAS (kt) | Mach | Menzil denetimi |
|---|---|---|---|
| 1.000 | 148,3 | 0,228 | **geçer** |
| 2.000 | 206,9 | 0,324 | **geçer** |
| 4.000 | 285,3 | 0,462 | **geçer** |
| 6.688 | 357,0 | 0,605 | **geçer** |
| 10.000 | 420,3 | 0,751 | **geçer** |

Hiçbiri yakalanmaz. Üstelik değişim hızı denetimi de yakalamaz: gösterge sıçramıyor, düzgün ve sürekli biçimde tırmanıyor. Türevi makul, ikinci türevi makul. Sinyal, bir sensörün bozulduğunda beklediğiniz hiçbir patolojiyi göstermiyor — ne gürültü, ne sıçrama, ne takılma, ne doyma.

Sebebi matematikseldir ve genelleştirilebilir: **arızalı girdi, transfer fonksiyonunun geçerli tanım kümesinin içine düşmüştür.** $q_c^{\text{ölçülen}}$ pozitif, sonlu ve sürekli bir büyüklüktür; CAS denklemi onu sorunsuz işler. Denklem, kendisine verilen $q_c$'nin hangi fiziksel süreçten geldiğini bilmez ve bilemez.

Bu, hava veri sistemlerine özgü bir durum değil. Aynı deseni her yerde görürsünüz:

- Donmuş bir enkoder, duran bir motoru "sabit hızda" gösterir.
- Kısa devre olmuş bir termokupl, oda sıcaklığına yakın geçerli bir değer üretir.
- Kendi kendini test eden bir ADC, referans gerilimi kaydığında tüm kanallarda tutarlı biçimde yanlış okur.

Hepsinde ortak nokta: **çıktı geçerli, girdi değil.** Ve geçerli bir çıktıya bakarak girdinin geçerliliğini çıkaramazsınız.

---

## O Zaman Ne İşe Yarar?

Tek bir kanalın kendi içinde bu arızayı tespit etmesi mümkün değildir. Tespit, ancak **kanalın dışından** gelen bilgiyle olur. Pratikte üç yol var.

**1. Bağımsız kanalları karşılaştır.** 757'de üç pitot-statik kaynağı vardı ve yalnızca kaptanınki tıkalıydı. Yani bilgi oradaydı: yardımcı pilotun göstergesi yaklaşık 220 kt gösterirken kaptanınki 300 kt'yi aşıp yükseliyordu. Sorun bilginin yokluğu değil, **bu tutarsızlığın mürettebata açıkça bildirilmemesiydi.** Fark, iki göstergeye aynı anda bakan bir insanın gözünde kalmıştı. Kaptan hangisinin doğru olduğunu çözemedi. Resmi raporun aktardığına göre overspeed alarmı çaldığında "bu önemli değil" diyerek uyarının devre kesicisinin çekilmesini istedi; Wikipedia'nın aktarımında ise her iki göstergenin de yanlış olduğu sonucuna varmıştı.

Buradaki mühendislik dersi "yedeklilik ekle" değil — yedeklilik zaten vardı. Ders şu: **yedekliliğin değeri, tutarsızlığın yüzeye çıkarılmasıyla sınırlıdır.** Karşılaştırmayı yapıp sonucu kullanıcıya iletmeyen bir sistem, üç kanala sahip olmanın parasını öder ama faydasını almaz.

**2. Farklı fiziğe dayanan bir kaynak kullan.** Hücum açısı sensörü pitot basıncından tamamen bağımsızdır. Airbus'ın **BUSS** (Back-Up Speed Scale) özelliği tam olarak bunu yapar: hız göstergesini kaldırıp yerine hücum açısından türetilen renkli bir emniyetli zarf gösterir. Pitot arızasından etkilenmez, çünkü pitotu hiç kullanmaz. Prosedür de buna göredir — FL250 altında üç ADR de kapatılıp BUSS'a geçilir; üstünde stall koruması korunsun diye bir ADR açık bırakılır ve pitch/thrust tablolarıyla uçulur.

Aynı fikir gömülü sistemlerde genel bir kalıptır: kritik bir büyüklüğü, **farklı bir fiziksel prensiple** ölçen ikinci bir yoldan doğrula. Aynı tip iki sensör aynı ortak-mod arızaya birlikte yakalanır; farklı prensipli iki sensör yakalanmaz.

**3. Modele dayalı tutarlılık denetimi.** Pitch açısı, motor itkisi ve ağırlık biliniyorsa uçağın hızı dar bir aralığa hapsolur. 15 derece burun yukarı, azalan güç ve artan hız fiziksel olarak bağdaşmaz. Bu tür **analitik yedeklilik** denetimleri ek donanım gerektirmez; yalnızca sistemin dinamik modelini yazılıma koymayı gerektirir.

Sayıların sahada ne kadar sık gerektiğine dair bir fikir: ATSB'nin incelemesinde kalkışta bildirilen 55 güvenilmez hız olayının 44'ü pitot tıkanmasından kaynaklanmış. Bu nadir bir arıza değil.

---

## Pratik Çıkarımlar

Hava veri sistemi yazmıyor olsanız bile, sensör işleyen her gömülü yazılım için taşınabilir maddeler:

- **Menzil denetimini tespit mekanizması sanmayın.** Menzil denetimi yalnızca *bariz* bozulmayı yakalar. Sinsi arızaların çoğu menzilin içinde kalır. Menzil denetimi gereklidir ama asla yeterli değildir.
- **Her kanal için "hangi girdi bozulursa bu kanal bozulur" tablosunu yazın.** Yukarıdaki dört satırlık tablo, tıkalı pitotun altimetreyi etkilemediğini ve bunun neden yanıltıcı olduğunu bir bakışta gösteriyor. Bu tabloyu tasarım aşamasında üretmek, FMEA'nın en ucuz kısmıdır.
- **Donmuş sinyal, gürültülü sinyalden tehlikelidir.** Gürültü kendini belli eder; donma etmez. Sensör girdilerine yalnızca menzil değil, **beklenen değişkenlik** denetimi de koyun — ama bu senaryonun donmuş girdiyi *değişen* çıktıya çevirdiğini de unutmayın.
- **Karşılaştırma sonucunu kullanıcıya iletin.** İki kanal arasında eşik üstü fark varsa, bunu bir bayrağa yazıp geçmeyin; görünür kılın. Birgenair'de eksik olan buydu.
- **Ortak-mod arızayı ayrı düşünün.** Üç özdeş sensör, üç özdeş kapağın takılmamasına karşı koruma sağlamaz. Aeroperú'da üç statik portun hepsi aynı bakım hatasına maruz kalmıştı.
- **Fiziksel kök nedeni modelleyin.** Bu yazıdaki eğriyi üretmek yüz satır Python aldı. Karşılığında, arızanın imzasının "gürültü" değil "irtifanın monoton fonksiyonu" olduğunu öğrendim. Bu imzayı bilen bir tanılama mantığı yazılabilir; bilmeyen yazılamaz.

---

## Açık Sorular

Bu modeli kurarken cevaplayamadığım, ilerisi için not ettiğim birkaç şey var.

**Kısmi tıkanma.** Tüm hesap, tam tıkanma varsayımına dayanıyor. Küçük bir sızıntı varsa donmuş basınç ortam basıncına doğru bir zaman sabitiyle sönümlenir ve gösterge, irtifanın fonksiyonu olmaktan çıkıp irtifa ile zamanın karışık bir fonksiyonuna döner. Bu, tanılama açısından daha zor bir imzadır ve gerçek olayların çoğunun burada yaşadığından şüpheleniyorum.

**Drenaj delikleri.** Pitot probları su tahliyesi için küçük drenaj deliklerine sahiptir. Ön ağız tıkalıyken drenaj açıksa sistem tamamen kapalı bir hacim değildir; bu durumda gösterge sıfıra doğru düşer, yükselmez. Birgenair verisi yükselen bir imza gösterdiğine göre drenaj da tıkalıydı ya da etkisiz kalacak kadar küçüktü — ama bunu kaynaklardan doğrulayamadım.

**Isıtma.** Pitot ısıtması buzlanmaya karşı çalışır, böcek yuvasına karşı hiçbir şey yapmaz. AF447'de problar ısıtmalıydı ve yine de yüksek irtifa buz kristalleriyle tıkandılar; kaydedilen gösterge hızı 274 kt'den 52 kt'ye düştü ve otopilot 02:10:05'te devreden çıktı. Buz tıkanmasının imzası bu yazıdaki mekanik tıkanma imzasından farklı — geçici ve iki yönlü. Onu ayrı bir yazıda ele almak gerek.

---

## Sonuç

Birgenair 301'in hava veri bilgisayarı doğru çalıştı. Denklemleri doğru uyguladı, sayıları doğru hesapladı, sonuçları doğru yayınladı. Ürettiği hız, kendisine verilen basınç farkının doğru karşılığıydı. Sadece o basınç farkı artık hızı değil, irtifayı ölçüyordu.

Gömülü yazılımda doğruluğu çoğu zaman "hesap doğru mu" diye tanımlarız — ve bu tanım, nitelendirme kanıtı üretmek için fazlasıyla elverişlidir. Ama sahada uçağı düşüren şey yanlış hesap değil, **doğru hesabın yanlış girdiye uygulanmasıdır.** Bu arıza sınıfına karşı tek savunma, hesabın dışına çıkıp "bu girdi fiziksel olarak mümkün mü" diye sormaktır. Bu soruyu soran kod yoksa, sistem kendi doğru cevabının içinde kaybolur.

Yazıdaki tüm sayılar, ISA atmosfer modeli ve yukarıdaki denklemlerle yazılmış kısa bir Python betiğinden üretildi; isteyen kendi sayılarıyla yeniden üretebilir. Benim için en öğretici kısmı, modelin resmi kaza kaydına 5 kt içinde oturması oldu. Fizik, kazanın neden olduğunu değil ama **nasıl göründüğünü** şaşırtıcı bir sadakatle anlatıyor.

---

**Kaynaklar:**

- SAE ITC / ARINC — [ARINC 706-4, *Mark 5 Subsonic Air Data System*](https://aviation-ia.sae-itc.com/product-categories/arinc-standards/700-series) (ARINC 700 serisi kataloğu).
- Dirección General de Aeronáutica Civil (Dominik Cumhuriyeti) — [*Final Aviation Accident Report, Birgenair Flight ALW-301, Puerto Plata, 6 February 1996*](https://www.faa.gov/sites/faa.gov/files/Birgenair301_Accident_Report.pdf) (FAA tarafından yayımlanan nüsha).
- NTSB — [*Birgenair Flight 301 Safety Recommendations*](https://www.faa.gov/sites/faa.gov/files/Birgenair301_NTSB_Recommendations.pdf).
- FAA Lessons Learned — [Boeing 757-200, TC-GEN (Birgenair 301)](https://www.faa.gov/lessons_learned/transport_airplane/accidents/TC-GEN).
- Aviation Safety Network — [Accident Boeing 757-225 TC-GEN, 6 February 1996](https://aviation-safety.net/wikibase/324523) ve [Accident Boeing 757-23A N52AW, 2 October 1996](https://aviation-safety.net/wikibase/324365).
- NCAR / EOL — [*Note re: Calculation of Pressure Altitude*](https://ncar.github.io/aircraft_ProcessingAlgorithms/www/PressureAltitude.pdf) (44330.77 ve 0.1902632 katsayılarının türetimi).
- US Air Force Test Pilot School / DTIC — [*Subsonic Relationships Between Pressure Altitude, Calibrated Airspeed and Mach Number*](https://apps.dtic.mil/sti/pdfs/ADA569074.pdf).
- BEA — [*Final Report on the accident on 1st June 2009 to the Airbus A330-203 registered F-GZCP, Air France flight 447*](https://bea.aero/en/investigation-reports/notified-events/detail/accident-to-the-airbus-a330-203-registered-f-gzcp-operated-by-air-france-on-01-06-2009-in-the-atlantic-ocean/) (2012).
- ATSB — [*Airspeed indication failure on take-off involving Airbus A330, 9M-MTK, Brisbane Airport, 18 July 2018* (AO-2018-053)](https://www.atsb.gov.au/investigations/ao-2018-053).
- Wikipedia — [International Standard Atmosphere](https://en.wikipedia.org/wiki/International_Standard_Atmosphere) (ISA sabitleri için ikincil referans).

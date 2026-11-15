---
title: "Neden Hiç Akıllanmıyoruz? Hatalardan Ders Çıkaramayan Ekipler"
subtitle: "Why Teams Keep Repeating the Same Mistakes"
background: "/img/posts/neden-hic-akillanmiyoruz-cover.webp"
date: '2026-10-01 09:00:00'
layout: post
lang: tr
mermaid: true
categories: [muhendislik]
tags: [yazilim-muhendisligi, emniyet-kritik, proje-yonetimi]
---

Müşteri kabul testinin sabahı, test düzeneğini inceleyen müşteri temsilcisi RF sinyal üretecinin kalibrasyon etiketinde durur: kalibrasyonun süresi üç hafta önce dolmuş. Test ertelenir, cihaz acil kalibrasyona gönderilir ve son üç haftada bu cihazla alınan bütün ölçümlerin geçerliliği sorgulanmak zorunda kalınır. Olay sonrası toplantısında biri ortak klasörde eski bir belge bulur. İki yıl önce, başka bir proje, aynı sebep. Belgenin "Çıkarılan dersler" başlığı altında tek bir aksiyon var: "Kalibrasyon bitiş tarihleri takvime eklenecek." Aksiyonun durumu "tamamlandı". Takvim ise geçen yıl ekipten ayrılan bir arkadaşın takvimiymiş.

O ekip iki yıl önce dersini çıkarmıştı: rapor yazılmış, aksiyon atanmış ve kapatılmıştı. Yine de aynı hata tekrarlandı. NATO'nun ders öğrenme sürecinde bu farkın bir adı var: bir ders, onun için önerilen düzeltici eylem uygulanana kadar yalnızca bir *tespit edilmiş ders* (*lesson identified*) olarak kalır. *Öğrenilmiş ders* (*lesson learned*) sayılması için bir şeyin gerçekten değişmesi gerekir.

---

## Ders Nerede Saklanıyor?

Bir ders üç yerde saklanabilir: insanların hafızasında, bir belgede ya da sistemin kendisinde. Bu üç yer, bir bilgisayardaki saklama katmanlarına benzer:

- **Hafıza uçucudur.** "Daha dikkatli olunacak" ya da "ekibe duyuruldu" diye kapanan bir ders, onu bilen kişi ayrıldığında, unuttuğunda ya da yoğun bir haftaya girdiğinde kaybolur. Girişteki takvim hatırlatması bunun örneğidir.
- **Belge kalıcıdır, ama kendiliğinden çalışmaz.** Rapor, prosedür ya da "çıkarılan dersler" arşivi yıllarca durur; işe yaraması için birinin onu doğru anda bulup okuması gerekir. Çoğu arşivin pek okunmamasının sebebi de budur.
- **Sistem her seferinde çalışır.** Süresi dolmuş bir cihazla teste başlamayı reddeden test yazılımı, kalibrasyon tarihini kimsenin hatırlamasına ihtiyaç duymaz; ders, hikâyeyi hiç duymamış bir sonraki mühendis için de geçerlidir. [Kalite Güvence ve Kalite Kontrol]({% post_url 2026-10-01-kalite-guvence-ve-kalite-kontrol %}) yazısındaki sayaç taşması örneğinde de dersi kalıcı kılan, test ortamına ve kodlama standardına yapılan değişiklikti.

Kontrol listeleri ve otomatik uyarılar belge ile sistem arasında durur: işin içine girerler, ama atlanabilirler. Akıllanmamanın çoğu, derslerin ilk iki yerde kalıp sisteme hiç taşınamamasıdır.

---

## Ders Neden Sisteme Taşınmıyor?

### Hata bir kişide bitiyor

Bir olay incelemesinin en kolay cevabı "insan hatası"dır. Kalibrasyon tarihini kaçıran, yanlış komutu çalıştıran biri hep vardır. Cevap çoğu zaman doğrudur da, ama incelemeyi orada bitirir ve dersi en uçucu yere, bir kişinin dikkatine yazar: "İlgili personel uyarıldı."

Sidney Dekker'in insan hatası üzerine çalışmalarının çıkış noktası, insan hatasının incelemenin vardığı sonuç değil, başladığı yer olduğudur. Sorulması gereken, o kişinin o an elindeki bilgiyle bu kararı neden makul bulduğudur. Gece yarısı alarmla uyanan nöbetçi mühendis yanlış sunucuyu yeniden başlatır ve raporda "dikkatsizlik" yazar. Oysa iki sunucunun adı tek harfle ayrılıyordur ve izleme ekranı ikisini yan yana, aynı renkte gösteriyordur. Olay bittikten sonra her şey açık görünür; sonucu bilen birinin, bilmeyen birini yargılaması kolaydır.

### Hatayı söylemek pahalı

Amy Edmondson 1990'larda iki hastanede ilaç uygulama hatalarını incelerken beklemediği bir sonuçla karşılaştı: daha iyi yönetilen, ekip içi ilişkileri daha güçlü servisler daha fazla hata kaydediyordu. Bu ekipler daha çok hata yapmıyor, hatayı söylemekten çekinmiyordu. Diğer servislerde de hatalar oluyordu ama sessizce düzeltiliyor, kayda geçmiyordu.

Mühendislik ekiplerinde de aynısı olur. "Sıfır olay" bir performans hedefine dönüştüğünde olaylar değil, olay kayıtları azalır; kayda geçmeyen bir olaydan da ders çıkmaz. Havacılık bunu kurala bağlamıştır: ICAO'nun Ek 13'üne göre kaza incelemesinin tek amacı yeni kazaları önlemektir, suç ya da sorumluluk paylaştırmak değildir. Pilotlar ve kontrolörler de yaşadıkları olayları NASA'nın yürüttüğü ASRS'ye gizlilik içinde ve cezalandırılma korkusu olmadan bildirebilir.

### Sapma normalleşiyor

1 Şubat 2003'te Columbia uzay mekiği atmosfere dönüşte parçalandı ve yedi astronot hayatını kaybetti. Kalkışta dış yakıt tankından kopan bir köpük parçası, sol kanadın ön kenarındaki ısı koruma panellerini delmişti. Köpük kopması yeni değildi: önceki uçuşlarda defalarca görülmüş ve sorunsuz biten her uçuş, köpüğün tehlikesiz olduğunun kanıtı gibi okunmuştu. Kaza İnceleme Kurulu (CAIB), 17 yıl önceki Challenger kazasına yol açan kurumsal nedenlerin aradaki bütün değişikliklere rağmen düzeltilmediği sonucuna vardı. Challenger'da contalardaki (O-ring) aşınma da aynı yoldan geçmişti: önce beklenmeyen bir bulgu, sonra kabul edilen bir risk, sonra olağan bir durum. Sosyolog Diane Vaughan buna **sapmanın normalleşmesi** (*normalization of deviance*) adını verir.

Yazılım ekiplerinde bu süreç daha sessiz işler. Bir test ara sıra kırmızı olur, yeniden çalıştırınca geçer; birkaç hafta sonra herkes onu yeniden çalıştırmaya alışmıştır. Derleyici uyarıları önce on, sonra yüz, sonra bin olur. İzleme sistemindeki bir alarm her gece çalar ve susturulur. Her biri tek başına makul bir karardır, ama sonunda gerçek bir arızanın sinyali gürültünün içinde kaybolur. Sisteme taşınmış dersler de bu yolla aşınabilir.

Bir sapmanın normalleşip normalleşmediğini anlamak için şu soru yeterlidir: Bunu ilk gördüğümüzde ne yapardık? İlk kez kırmızı olan bir test için hata kaydı açılırdı. Bugün aynı test için kimse kayıt açmıyorsa, kabul eşiği kaymış demektir.

### Acil olan önemliyi yiyor

Nelson Repenning ve John Sterman'ın 2001 tarihli makalesinin başlığı bu mekanizmayı özetler: *Kimse, hiç yaşanmamış sorunları çözdüğü için takdir görmez.* Hedefin gerisinde kalan bir ekip daha çok çalışır ve bunun için gereken zamanı iyileştirmeden alır. İyileştirme yapılmadıkça süreç kabiliyeti aşınır, hatalar artar ve baskı yeniden yükselir. Yazarlar bu kısır döngüye *kabiliyet tuzağı* (*capability trap*) der:

<div class="mermaid">
flowchart TD
    B["İş baskısı artar"] --> Y["Yangın söndürülür,<br/>geçici çözümler"]
    Y --> Z["İyileştirmeye<br/>zaman kalmaz"]
    Z --> K["Süreç kabiliyeti aşınır,<br/>hatalar artar"]
    K --> B
    style B fill:#fdf1d8,stroke:#b7791f,stroke-width:2px
    style K fill:#fdf1d8,stroke:#b7791f,stroke-width:2px
</div>

Olay aksiyonları bu döngünün ilk kurbanıdır: kimse onları reddetmez, yalnızca her seferinde daha acil bir işin arkasında kalırlar. Teslim tarihini belirleyen yönetim baskıyı sürdürdükçe, orta kademedeki bir ekibin döngüyü kendi başına kırması zordur. Yine de ekibin elinde üç kaldıraç vardır:

- **Kapasiteyi bir kez pazarlık edin.** Her aksiyon için ayrı ayrı izin istemek yerine, her iterasyonun küçük ama sabit bir payını olay aksiyonlarına ayırmayı yönetimle bir kez kararlaştırın. Önemli olan payın büyüklüğü değil, her sprintte yeniden tartışılmamasıdır.
- **Bedeli yönetimin diliyle yazın.** Girişteki olayın bedeli ertelenen kabul testi, tekrarlanan ölçümler ve müşteriye yazılan açıklamadır. Test yazılımına eklenecek kalibrasyon kontrolü ise birkaç günlük iştir. İki rakam yan yana konduğunda karar çoğu zaman kolaylaşır.
- **Ertelemeyi açık bir karar hâline getirin.** Önceliklendirilmeyen bir aksiyon sessizce beklemez; "kabul edilen risk" olarak, erteleme kararını veren yöneticinin adıyla kapatılır. Böylece risk, teslim tarihini belirleyen seviyede sahiplenilir.

---

## Ders Nasıl Kalıcı Olur?

Bir aksiyonun ne kadar kalıcı olduğu, insan hafızasına ve dikkatine ne kadar az dayandığıyla ilgilidir. Sağlık sektöründe kök neden analizi için geliştirilen RCA² yaklaşımı da aksiyonları bu ölçüte göre sıralar: eğitim, uyarı ve yeni prosedür gibi insana dayanan aksiyonlar zayıf; kontrol listeleri orta; hatayı zorlayan ya da imkânsız kılan tasarım değişiklikleri güçlüdür. Girişteki olaya uygulanınca:

| Dersin yeri | Kalibrasyon olayında | Kalıcılığı |
|---|---|---|
| **Hafıza** | "Kalibrasyon tarihleri takvime eklenecek." | Kişiyle birlikte gider |
| **Belge** | Kalibrasyon prosedürüne yeni bir madde | Okunursa işe yarar |
| **Kontrol listesi, uyarı** | Test öncesi "kalibrasyonlar geçerli mi?" maddesi; bitişe 60 gün kala uyarı | İşin içindedir, ama atlanabilir |
| **Sistem** | Süresi dolmuş cihazla teste başlamayan test yazılımı | Kimse hatırlamasa da çalışır |

Bu tablo "daha çok kural koyun" demek değildir. İyi bir sistem kontrolü yeni bir onay adımı eklemez; insanların hatırlamak zorunda olduğu bir adımı ortadan kaldırır. Test yazılımı kalibrasyonu kendisi kontrol ettiğinde, takvimdeki hatırlatma da kontrol listesindeki madde de gereksizleşir. RCA² de süreci basitleştirmeyi güçlü aksiyonlar arasında sayar. Ama sistemin de bakımı vardır: yanlış alarm üreten bir kontrol bir süre sonra atlatılmaya başlanır ve sapmanın normalleşmesi kendi kurduğumuz bariyerden geri döner. Her otomatik kontrolün de bir sahibi olmalı, işe yaramayanlar düzenli olarak kaldırılmalıdır.

Her ders bu kadar güçlü bir aksiyon gerektirmez. Bu yazıdaki örneklerin çoğu emniyet kritik dünyadan geliyor; bir web uygulamasında hızlı denemek, ölçmek ve gerekirse geri almak çoğu zaman doğru stratejidir. Ama "hızlı hata yap" ilkesi yeni hatalar içindir; aynı hatayı her çeyrekte yeniden yapmak hız değil, kayıptır. Bir ders için ne kadar güçlü bir aksiyon gerektiğini iki soru belirler: Hata tekrar ederse ne kaybederiz? Fark edip geri almak ne kadar sürer? Müşteri kabul testinden önce kalibrasyonu dolan bir cihazda iki cevap da ağırdır. Dahili bir panodaki yazım hatası için hafif bir aksiyon yeter.

---

## Bir Ekip İçin Başlangıç

- **"Sorumlu kişi"yi çıkarın, "aksiyon sahibi"ni bırakın.** Olay şablonunda hatayı yapan kişiyi soran alanın yerine "o an elde olan bilgi" ve "karar noktaları" alanlarını koyun. Suçlamasız inceleme, hesap sorulmayan inceleme demek değildir: geçmişteki hata için kimse suçlanmaz, ama her aksiyonun kapanana kadar takip edecek bir sahibi ve hedef tarihi olur. Bu kişi çoğu zaman olayı yaşayan değil, ilgili süreci ya da sistemi yöneten kişidir.
- **Az ama güçlü aksiyon yazın.** Bir inceleme en fazla üç aksiyonla kapansın ve bunlardan en az biri orta ya da güçlü olsun; RCA² de her inceleme için en az bir orta ya da güçlü aksiyon önerir. On zayıf aksiyon, bir güçlü aksiyonun yerini tutmaz.
- **Açık aksiyonlara tavan ve süre koyun.** Ekibin açık olay aksiyonu sayısına bir üst sınır belirleyin, örneğin on. Sınır doluyken yeni bir aksiyon ancak eskisi kapanarak ya da açıkça ertelenerek eklenebilir. Altmış gün içinde başlanmayan aksiyon kendiliğinden yönetime çıkar: ya önceliği yükselir ya da kabul edilen risk olarak kapanır.
- **"Tamamlandı" için kanıt isteyin.** Bir aksiyon, ilgili değişikliğin, testin ya da kontrolün bağlantısı olmadan kapanmasın.
- **Tekrarı ayrı bir olay sayın.** Her incelemede "bu daha önce yaşandı mı?" diye sorun. Cevap evetse, inceleme önceki incelemenin neden işe yaramadığını da konu alsın.
- **Bildirmeyi ucuzlatın.** Kısa bir form, suçlamasız bir dil ve ramak kala olaylar için de aynı kanal yeterlidir. Bildirim sayısının artması kötü haber sayılmasın.

---

## Öğrendiğimizi Nasıl Anlarız?

Bu önerilerin işe yarayıp yaramadığını birkaç basit sayı gösterir:

| Metrik | Nasıl hesaplanır | Sağlıklı eğilim |
|---|---|---|
| **Tekrarlayan olay oranı** | Kök nedeni daha önceki bir olayla aynı olan olayların yüzdesi | Düşer |
| **Aksiyon güç dağılımı** | Kapanan aksiyonların zayıf, orta ve güçlü payları | Orta ve güçlünün payı artar |
| **Gecikmiş aksiyon oranı** | Hedef tarihini geçmiş açık aksiyonların yüzdesi | Düşer |
| **Ramak kala bildirim oranı** | Olay başına ramak kala bildirimi sayısı | Artar |

Tek bir değerden çok eğilim önemlidir; çeyrekten çeyreğe bakmak yeterlidir. Bu sayılar ekibin kendine tuttuğu bir aynadır. Kişilere hedef olarak verildiklerinde aynı kök neden farklı kelimelerle yazılmaya, aksiyonlar da olduklarından güçlü etiketlenmeye başlar.

---

## Sonuç

Akıllanmamak çoğu zaman bir zekâ ya da dikkat sorunu değil. Ekipler hatalarını görür, tartışır ve çoğu zaman doğru dersi de bulur. Kaybolan şey, dersin hafızadan ve belgeden sisteme taşındığı adımdır.

Girişteki ekip için doğru soru "kalibrasyonu kim kaçırdı?" değildi. Doğru soru, iki yıl önceki dersin neden bir kişinin takviminde yaşadığıydı. Test yazılımı kalibrasyon süresi dolmuş bir cihazla teste başlamayı reddetseydi, o takvime hiç gerek kalmazdı.

---

**Kaynaklar:**

- Columbia Accident Investigation Board — *Report, Volume I* (NASA, 2003), bölüm 8 "History as Cause: Columbia and Challenger".
- Diane Vaughan — *The Challenger Launch Decision: Risky Technology, Culture, and Deviance at NASA* (University of Chicago Press, 1996).
- Sidney Dekker — *The Field Guide to Understanding 'Human Error'* (3. baskı, Ashgate, 2014).
- Amy C. Edmondson — "Learning from Mistakes Is Easier Said Than Done", *Journal of Applied Behavioral Science* 32(1), 1996.
- ICAO — *Annex 13: Aircraft Accident and Incident Investigation*, bölüm 3.1.
- NASA — [Aviation Safety Reporting System (ASRS)](https://asrs.arc.nasa.gov/).
- Nelson P. Repenning, John D. Sterman — "Nobody Ever Gets Credit for Fixing Problems that Never Happened", *California Management Review* 43(4), 2001.
- National Patient Safety Foundation — *RCA²: Improving Root Cause Analyses and Actions to Prevent Harm* (2015).
- NATO JALLC — *The NATO Lessons Learned Handbook* (3. baskı, 2016).

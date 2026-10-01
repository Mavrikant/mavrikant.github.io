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

Gece yarısı üretimdeki bir servis durur. Sebep bir saat içinde bulunur: süresi dolmuş bir TLS sertifikası. Ertesi sabahki olay sonrası toplantısında biri ortak klasörde eski bir belge bulur. İki yıl önce, aynı servis, aynı sebep. Belgenin "Çıkarılan dersler" başlığı altında tek bir aksiyon var: "Sertifika bitiş tarihleri takvime eklenecek." Aksiyonun durumu "tamamlandı". Takvim ise geçen yıl ekipten ayrılan bir arkadaşın takvimiymiş.

O ekip iki yıl önce dersini çıkarmıştı: rapor yazılmış, aksiyon atanmış ve kapatılmıştı. Yine de aynı hata tekrarlandı.

NATO'nun ders öğrenme sürecinde bu farkın bir adı var. Bir olaydan çıkan ders önce *tespit edilmiş ders* (*lesson identified*) olarak kaydedilir. *Öğrenilmiş ders* (*lesson learned*) sayılması için, onun için önerilen düzeltici eylemin onaylanıp uygulanması gerekir. Rapor yazmak ilk adımı tamamlar. İkinci adım, hikâyeyi hiç duymamış bir sonraki kişinin de farklı davranmasını sağlayan bir değişiklik ister.

---

## On Yedi Yıl Arayla

Bu yalnızca küçük ekiplerin derdi değil. 1 Şubat 2003'te Columbia uzay mekiği atmosfere dönüşte parçalandı ve yedi astronot hayatını kaybetti. Kalkışta dış yakıt tankından kopan bir köpük parçası sol kanadın ön kenarına çarpmış, ısı koruma panellerinde bir delik açmıştı.

Kaza İnceleme Kurulu (CAIB), raporunun bir bölümünü 17 yıl önceki Challenger kazasıyla karşılaştırmaya ayırdı. Vardığı sonuç ağırdı: Challenger'dan sonra yapılan bütün değişikliklere rağmen, o kazaya yol açan kurumsal nedenler düzeltilmemişti. Kurula göre bu kalıcı ve sistemik kusurlar giderilmezse, bir sonraki kazanın da zemini hazırdı.

Ders çıkarmayı engelleyen mekanizmalar, bir uzay ajansında da bir yazılım ekibinde de birbirine benzer.

---

## Neden Öğrenemiyoruz?

### Hata bir kişide bitiyor

Bir olay incelemesinin en kolay cevabı "insan hatası"dır. Sertifikayı yenilemeyi unutan, yanlış komutu çalıştıran biri hep vardır. Cevap çoğu zaman doğrudur da, ama incelemeyi orada bitirir. Aksiyon "ilgili personel uyarıldı" ya da "daha dikkatli olunacak" olur; sistemde hiçbir şey değişmez ve aynı tuzak bir sonraki kişiyi bekler. CAIB da NASA'nın sorunlarının yalnızca emeklilikler, istifalar ya da görev değişiklikleriyle çözülemeyeceğini yazmıştı.

Sidney Dekker'in insan hatası üzerine çalışmalarının çıkış noktası, hatanın sebep değil, sistemin derinlerindeki bir sorunun belirtisi olduğudur. Bu bakışta insan hatası, incelemenin vardığı sonuç değil, başladığı yerdir. Sorulması gereken, o kişinin o an elindeki bilgiyle bu kararı neden makul bulduğudur. Gece yarısı alarmla uyanan nöbetçi mühendis yanlış sunucuyu yeniden başlatır ve raporda "dikkatsizlik" yazar. Oysa iki sunucunun adı tek harfle ayrılıyordur ve izleme ekranı ikisini yan yana, aynı renkte gösteriyordur. Olay bittikten sonra her şey açık görünür; sonucu bilen birinin, bilmeyen birini yargılaması kolaydır. Psikolojide buna sonradan görme yanlılığı (*hindsight bias*) denir.

### Hatayı söylemek pahalı

Amy Edmondson 1990'larda iki hastanede ilaç uygulama hatalarını incelerken beklemediği bir sonuçla karşılaştı: daha iyi yönetilen, ekip içi ilişkileri daha güçlü servisler daha fazla hata kaydediyordu. Sebep, bu ekiplerin daha çok hata yapması değil, hatayı söylemekten çekinmemesiydi. Diğer servislerde de hatalar oluyordu ama sessizce düzeltiliyor, kayda geçmiyordu. Edmondson bu farkı sonraki çalışmalarında *psikolojik güvenlik* kavramıyla açıkladı.

Mühendislik ekiplerinde de aynısı olur. "Sıfır olay" bir performans hedefine dönüştüğünde olaylar değil, olay kayıtları azalır. Küçük aksaklıklar el altından düzeltilir, ramak kala durumlar hiç konuşulmaz.

Havacılık bu sorunu kurumsal olarak ele alan sektörlerin başında gelir. ICAO'nun kaza ve olay incelemesini düzenleyen Ek 13'üne göre incelemenin tek amacı yeni kaza ve olayları önlemektir; suç ya da sorumluluk paylaştırmak bu faaliyetin amacı değildir. ABD'de FAA ile NASA'nın 1976'dan beri birlikte yürüttüğü Havacılık Emniyeti Raporlama Sistemi (ASRS) de pilotların, kontrolörlerin ve bakım personelinin yaşadıkları olayları gizlilik içinde ve cezalandırılma korkusu olmadan bildirebildiği gönüllü bir sistemdir.

Raporlama sistemi ne kadar iyi olursa olsun, bedelin bir kısmı içimizdedir. Sosyal psikologlar Carol Tavris ve Elliot Aronson, insanların hatalarını kabul etmek yerine geçmiş kararlarını haklı çıkarmaya ne kadar yatkın olduğunu bilişsel çelişki (*cognitive dissonance*) üzerinden anlatır: "yetkin biriyim" inancı ile "yanlış karar verdim" bilgisi yan yana durmakta zorlanır ve çoğu zaman feda edilen, bilgi olur. Bir kararı ne kadar uzun ve ne kadar açık savunmuşsak, ondan dönmek de o kadar zorlaşır.

### Sapma normalleşiyor

Columbia'yı düşüren köpük kopması yeni bir şey değildi. Önceki uçuşlarda defalarca görülmüş, zamanla uçuş emniyetini değil bakım işlerini ilgilendiren olağan bir sorun sayılmaya başlanmıştı; sorunsuz biten her uçuş, köpüğün tehlikesiz olduğunun bir kanıtı gibi okunuyordu. Challenger'da katı yakıtlı roket iticilerinin contalarındaki (O-ring) aşınma da aynı yoldan geçmişti: önce beklenmeyen bir bulgu, sonra kabul edilen bir risk, sonra olağan bir durum. Sosyolog Diane Vaughan buna **sapmanın normalleşmesi** (*normalization of deviance*) adını verir.

Robin Dillon ve Catherine Tinsley'nin deneyleri, aynı eğilimin bireysel kararlarda da işlediğini gösterir: şans sayesinde kötü bitmeyen bir olay (*near miss*) uyarı olarak değil, sistemin sağlam olduğunun işareti olarak algılanır ve insanlar ardından daha riskli seçeneklere yönelir.

Yazılım ekiplerinde bu süreç daha sessiz işler. Bir test ara sıra kırmızı olur, yeniden çalıştırınca geçer; birkaç hafta sonra herkes onu yeniden çalıştırmaya alışmıştır. Derleyici uyarıları önce on, sonra yüz, sonra bin olur. İzleme sistemindeki bir alarm her gece çalar ve susturulur. Her biri tek başına makul bir karardır, ama sonunda gerçek bir arızanın sinyali gürültünün içinde kaybolur.

Bir sapmanın normalleşip normalleşmediğini anlamak için şu soru yeterlidir: Bunu ilk gördüğümüzde ne yapardık? İlk kez kırmızı olan bir test için hata kaydı açılırdı. Bugün aynı test için kimse kayıt açmıyorsa, kabul eşiği kaymış demektir.

### Ders belgede kalıyor

Çoğu kurumun bir "çıkarılan dersler" arşivi vardır ve bu arşivler pek okunmaz. ABD Sayıştayı (GAO) 2002'de NASA'yı incelediğinde, ajansın program ve proje yöneticilerinin derslerini düzenli olarak toplamadığını ve paylaşmadığını, dolayısıyla derslerin sonraki görevlerde uygulandığından emin olamadığını raporladı.

Daha temel bir sorun da var: belge hiçbir şeyi zorlamaz. Girişteki ekibin dersi bir takvim hatırlatmasında yaşıyordu ve hatırlatmanın sahibiyle birlikte gitti. Ekipler dağılır, insanlar ayrılır, klasörler taşınır. Bir dersin ayakta kalması için onu bilen birine ihtiyaç duymadan çalışan bir şeye dönüşmesi gerekir: bir teste, bir kontrole, bir tasarım kuralına. [Kalite Güvence ve Kalite Kontrol]({% post_url 2026-10-01-kalite-guvence-ve-kalite-kontrol %}) yazısındaki sayaç taşması örneğinde de dersi kalıcı kılan şey rapor değil, test ortamında ve kodlama standardında yapılan değişiklikti.

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

Olay sonrası aksiyon maddeleri bu döngünün ilk kurbanıdır. Toplantıda herkes hemfikirdir, maddeler yazılır, sahipleri atanır. Sonra sürüm takvimi bastırır ve maddeler hiçbir planlamaya giremez. Aksiyonlar reddedilmez; yalnızca her seferinde daha acil bir işin arkasında kalır.

---

## Ders Nasıl Kalıcı Olur?

Havacılığın en bilinen hikâyelerinden biri bu soruya iyi bir cevap verir. 30 Ekim 1935'te Boeing'in yeni bombardıman uçağı prototipi Model 299, ABD Ordu Hava Birliği'nin değerlendirme uçuşunda kalkıştan hemen sonra dikleşip düştü. Uçağı deneyimli test pilotu Binbaşı Ployer Hill kullanıyordu; Boeing'in baş test pilotu Leslie Tower da kokpitteydi. Sebep, kumanda yüzeylerini yerde sabitleyen kilidin açılmamış olmasıydı. Bundan çıkan ders "pilotlar daha dikkatli olsun" olmadı. Test pilotları taksi, kalkış ve iniş için kısa bir kontrol listesi hazırladı; uçağın pilot hafızasına bırakılamayacak kadar karmaşık olduğu kabul edildi.

Bir aksiyonun ne kadar kalıcı olduğu, insan hafızasına ve dikkatine ne kadar az dayandığıyla ilgilidir. Sağlık sektöründe kök neden analizleri için geliştirilen RCA² yaklaşımı bunu bir aksiyon hiyerarşisine dönüştürür: eğitim ve yeni prosedür gibi insana dayanan aksiyonlar zayıf, kontrol listesi gibi bilişsel yardımcılar orta, hatayı zorlayan ya da imkânsız kılan tasarım değişiklikleri (*forcing function*) güçlü sayılır. Yazılıma uyarlanınca tablo şöyle görünür:

| Güç | Aksiyon türü | Girişteki sertifika olayında |
|---|---|---|
| **Zayıf** | Eğitim, uyarı e-postası, yeni prosedür, "daha dikkatli olunacak" | "Sertifika bitiş tarihleri takvime eklenecek." |
| **Orta** | Kontrol listesi, şablon, otomatik izleme ve alarm | Bitişe 30 gün kala ekip kanalına düşen alarm |
| **Güçlü** | Otomasyon, süreci basitleştirmek, hatayı imkânsız kılan kontrol | Otomatik yenileme; süresi yaklaşan sertifikayla dağıtımı durduran kontrol |

Zayıf aksiyonlar işe yaramaz değildir; tek başlarına bırakıldıklarında kalıcı olmazlar. RCA² bu yüzden her incelemenin en az bir orta ya da güçlü aksiyonla sonuçlanmasını önerir. Yazılımda güçlü aksiyonun en tanıdık örneği basittir: düzeltilen her hata, onu bir daha yakalayacak otomatik bir testle kapanır ve test kırıldığında değişiklik birleştirilemez.

Güçlü aksiyon, daha çok kural demek değildir. Her olaydan sonra bir onay adımı ya da yeni bir prosedür eklenen süreç zamanla ağırlaşır; insanlar kuralların etrafından dolaşmaya başlar ve sapmanın normalleşmesi başka bir kapıdan geri gelir. RCA² hiyerarşisinde süreci basitleştirmek de güçlü aksiyonlar arasında sayılır.

---

## Bir Ekip İçin Başlangıç

- **Olay şablonundan "sorumlu kişi" alanını çıkarın.** Yerine "o an elde olan bilgi" ve "karar noktaları" alanlarını koyun.
- **Her aksiyonun gücünü yazın.** Aksiyon listesinde her maddenin yanında zayıf, orta ya da güçlü yazsın. Yalnızca zayıf aksiyonlarla biten bir inceleme kapanmış sayılmasın.
- **Aksiyonları normal işin içine koyun.** Olay aksiyonları ayrı bir belgede değil, ekibin iş takip sisteminde diğer işlerle birlikte yaşasın. "Tamamlandı" demek için kanıt isteyin: ilgili commit'in, testin ya da kontrolün bağlantısı.
- **Tekrarı ayrı bir olay sayın.** Her incelemede "bu daha önce yaşandı mı?" diye sorun. Cevap evetse, inceleme yalnızca olayı değil, önceki incelemenin neden işe yaramadığını da konu alsın.
- **Bildirmeyi ucuzlatın.** Kısa bir form, suçlamasız bir dil ve ramak kala olaylar için de aynı kanal yeterlidir. Bildirim sayısının artması kötü haber sayılmasın.
- **Olay raporlarını ekip dışına açın.** Bir ekibin yaşadığı olay, aynı altyapıyı kullanan başka bir ekibin henüz yaşamadığı olaydır. Raporları kolay bulunur bir yerde ve herkesin okuyabileceği bir dille paylaşın.
- **Eski olayları yeni projeye taşıyın.** Yeni bir projenin başlangıç toplantısına, benzer projelerin olay raporlarından seçilmiş kısa bir liste koyun. Kimse arşive gitmiyorsa, arşivi toplantıya getirin.

---

## Sonuç

Akıllanmamak çoğu zaman bir zekâ ya da dikkat sorunu değil. Ekipler hatalarını görür, tartışır ve çoğu zaman doğru dersi de bulur. Kaybolan şey, dersin rapordan sisteme geçtiği adımdır.

Girişteki ekip için doğru soru "sertifikayı kim unuttu?" değildi. Doğru soru, iki yıl önceki dersin neden bir kişinin takviminde yaşadığıydı. Sertifikalar otomatik yenilenseydi, o takvime hiç gerek kalmazdı.

---

**Kaynaklar:**

- Columbia Accident Investigation Board — *Report, Volume I* (NASA, 2003), bölüm 8 "History as Cause: Columbia and Challenger".
- Diane Vaughan — *The Challenger Launch Decision: Risky Technology, Culture, and Deviance at NASA* (University of Chicago Press, 1996).
- Sidney Dekker — *The Field Guide to Understanding 'Human Error'* (3. baskı, Ashgate, 2014).
- Amy C. Edmondson — "Learning from Mistakes Is Easier Said Than Done", *Journal of Applied Behavioral Science* 32(1), 1996.
- Carol Tavris, Elliot Aronson — *Mistakes Were Made (But Not by Me)* (Harcourt, 2007).
- Robin L. Dillon, Catherine H. Tinsley — "How Near-Misses Influence Decision Making Under Risk: A Missed Opportunity for Learning", *Management Science* 54(8), 2008.
- ICAO — *Annex 13: Aircraft Accident and Incident Investigation*, bölüm 3.1.
- NASA — [Aviation Safety Reporting System (ASRS)](https://asrs.arc.nasa.gov/).
- GAO — [*NASA: Better Mechanisms Needed for Sharing Lessons Learned*, GAO-02-195 (2002)](https://www.gao.gov/products/gao-02-195).
- Nelson P. Repenning, John D. Sterman — "Nobody Ever Gets Credit for Fixing Problems that Never Happened", *California Management Review* 43(4), 2001.
- National Patient Safety Foundation — *RCA²: Improving Root Cause Analyses and Actions to Prevent Harm* (2015).
- NATO JALLC — *The NATO Lessons Learned Handbook* (3. baskı, 2016).

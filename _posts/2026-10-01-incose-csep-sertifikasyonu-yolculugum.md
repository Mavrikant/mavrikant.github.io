---
title: "INCOSE CSEP: Sınavdan Sertifikaya Bir Yol Haritası"
subtitle: "My Road to INCOSE CSEP Certification"
background: "/img/posts/incose-csep-sertifikasi.webp"
date: '2026-10-01 22:21:00'
layout: post
lang: tr
mermaid: true
categories: [muhendislik]
tags: [sistem-muhendisligi, sertifikasyon, kariyer, incose]
---

Altmış ay deneyim, en az üç farklı alanda on ikişer ay, referanslarla doğrulanmış bir deneyim dosyası ve 100 puanlanan soruluk bir sınav. Nitelikli bir dereceye sahip bir aday için INCOSE **CSEP** (Certified Systems Engineering Professional) sertifikasyonunun şartları kabaca bunlar. Benim dosyamda bunlara ek olarak sekiz referans vardı; cebimden çıkan da 610 USD ile 1.000 TL oldu.

12 Ağustos 2026 Çarşamba günü başvurumun onaylandığı e-posta geldiğinde, hedefi koyduğum günden bu yana yaklaşık on dokuz ay geçmişti: hedefi 2025'in ilk aylarında koymuş, altı ay hazırlanmış, sınava 10 Ocak 2026'da girmiştim. Süreçte beni en çok zorlayan şey sınav olmadı; kendi deneyimimi başkasının doğrulayabileceği bir dille anlatmak oldu.

Bu yazıda o süreci anlatıyorum: sınava nasıl hazırlandığımı, Türkiye'deki kâğıt oturumu, başvuru formunda DO-178C deneyimimi sistem mühendisliği alanlarına nasıl eşlediğimi ve referans sürecini. Sonda da INCOSE'un herkese açık dizininden Türkiye'deki sertifika sahiplerine bakıyorum. Sistem mühendisliğinin kendisini daha önce [Sistem Mühendisliği Nedir?]({% post_url 2026-05-26-sistem-muhendisligi-nedir %}) yazısında ele almıştım; bu yazı o disiplindeki yetkinliğin nasıl belgelendiğine odaklanıyor.

> **Güncellik notu:** Buradaki kurallar, ücretler ve formlar benim 2025–2026'da yaşadığım süreci yansıtıyor ve INCOSE bunları sık güncelliyor. Bu yazıyı neyle karşılaşacağınızı öngörmek için kullanın; başvururken INCOSE'un [sertifikasyon sayfalarını](https://www.incose.org/certification/) esas alın.

---

## INCOSE ve SEP Programı

**INCOSE** (International Council on Systems Engineering), 1990'da kurulmuş, sistem mühendisliğinin uluslararası meslek örgütü. En bilinen yayını **Systems Engineering Handbook**: ISO/IEC/IEEE 15288'deki yaşam döngüsü süreçlerinin uygulanmasına yönelik kapsamlı bir rehber ve sertifikasyon sınavının tek resmî kaynağı.

INCOSE'un **SEP** (Systems Engineering Professional) sertifikasyon programı üç kademeden oluşuyor:

| Kademe | Deneyim şartı | Bilgi sınavı | Referans | Geçerlilik | Başvuru ücreti (üye) |
|---|---|---|---|---|---|
| **ASEP** — Associate SEP | Deneyim şartı yok | Gerekli | Gerekmez | 5 yıl | 180 USD |
| **CSEP** — Certified SEP | Nitelikli derece ile en az 60 ay doğrudan SE deneyimi | Gerekli | Gerekli | 3 yıl | 350 USD |
| **ESEP** — Expert SEP | Kariyerin ileri aşaması: uzun süreli SE deneyimi ve liderlik | Yazılı sınav yok; mülakat | Gerekli | 10 yıl | 630 USD |

ASEP yeni mezunlar ve alana geçiş yapanlar için giriş kapısı; ESEP ise kariyerinin ileri aşamasındaki, alana yön vermiş kişiler için. Ortadaki CSEP hem *bildiğinizi* (sınavla) hem de *yaptığınızı* (referanslarla doğrulanmış deneyimle) göstermenizi istiyor. Bu iki adımın sırası serbest: ben önce sınava girip sonra başvurdum, ama başvuru dosyasını sınavdan önce de açabiliyorsunuz.

**INCOSE üyeliği Ekim 2025'ten beri sertifikasyon için zorunlu değil.** Ben üyeliği, sertifikasyon ücretlerindeki indirim ve INCOSE kaynaklarına erişim nedeniyle tercih ettim; Türkiye'ye özel ücret avantajını [Takvim ve Maliyet](#takvim-ve-maliyet) bölümünde anlatıyorum. Tablodaki ücretler INCOSE'un [fiyat sayfasındaki](https://www.incose.org/certification/pricing-requirements/) üye fiyatları.

---

## Neden CSEP?

Kariyerimin büyük bölümü **DO-178C DAL A** seviyesinde aviyonik yazılım geliştirerek geçti. Bu dünyada gereksinim yönetimi, izlenebilirlik, doğrulama ve konfigürasyon kontrolü zaten günlük işin parçası. Bir süre sonra fark ettim ki bu pratikleri "aviyonik yazılımın kuralları" olarak öğrenmiştim; oysa çoğu, sistem mühendisliğinin genel pratiklerinin belirli bir sektöre uyarlanmış hâliydi.

Bu farkın pratik bir bedeli var. Sistem tarafındaki meslektaşlarınızla aynı şeyi kastedip farklı kelimeler kullanıyorsunuz; ya da aynı kelimeleri kullanıp farklı şeyler kastediyorsunuz. "Doğrulama" (*verification*) ile "geçerleme" (*validation*) arasındaki ayrım, "gereksinim" ile "tasarım kısıtı" arasındaki sınır, bir arayüz kontrol dokümanının kime ait olduğu... Bunlar akademik ayrımlar değil, proje geciktiren tartışmalar.

CSEP'e yönelmemin üç sebebi vardı:

1. **Ortak dil.** Handbook'u sistematik biçimde çalışmak, parça parça öğrendiğim pratikleri tek bir çerçeveye oturttu. Yazılım tarafından bakınca "süreç yükü" gibi görünen pek çok şeyin sistem tarafında nereye oturduğunu görmek, o yükü anlamlı kıldı.
2. **Belgelenebilirlik.** Savunma ve havacılık projelerinde sistem mühendisliği yetkinliğimi, uluslararası ölçekte tanınan ve bağımsız biçimde doğrulanmış bir belgeyle gösterebilmek istedim.
3. **Disiplinli okuma bahanesi.** Bir sınav tarihi olmadan yüzlerce sayfalık bir el kitabını baştan sona okumam pek olası değildi.

---

## Birinci Adım: Bilgi Sınavı

### Sınavın yapısı

INCOSE bilgi sınavı çoktan seçmeli ve **tek kaynağı** SE Handbook. Ağustos 2023 ile 14 Mart 2025 arasında uygulanan "hibrit" sınav, dördüncü ve beşinci baskıların *ortak* içeriğinden soru soruyordu. [15 Mart 2025'ten itibaren](https://www.incose.org/certification/start-your-certification/taking-the-exam/) sınav içeriğinin tamamı beşinci baskıdan geliyor; bugün hazırlananlar için dördüncü baskı artık birincil kaynak değil.

Sınavda 100 puanlanan soru var. Bunlara ek olarak, ileride kullanılıp kullanılmayacağına karar verilmek üzere denenen ve puanlanmayan 20 ya da 50 beta soru gelebiliyor. Standart bilgisayar sınavının süresi 120 dakika. Benim girdiğim 10 Ocak 2026 tarihli Türkiye oturumunda ise **100 soru için 130 dakika** verildi, yani soru başına yaklaşık bir dakika on sekiz saniye. Süre ve soru sayısı oturuma göre değişebiliyor; kendi davet e-postanızda yazan rakama bakın. Bu süre soruları sakin okumak ve şüpheli bıraktıklarınıza dönmek için yeterli, yeter ki tek bir soruda beş dakika harcamayın.

INCOSE sabit bir geçme yüzdesi yayımlamıyor. Kendi [açıklamasına göre](https://www.incose.org/certification/about-the-certification-program/certification-blog/certification-blog/2022/03/18/how-does-exam-scoring-work) her sınav versiyonunun geçme puanı aynı değil; daha zor bir soru setinde daha düşük bir puan da geçmeye yetebiliyor. Sorular Handbook'un geneline yayılıyor; "şu bölümü atlarım" gibi bir lüksünüz yok.

Sınava istediğiniz sıklıkta da giremiyorsunuz: INCOSE on iki aylık dönem içinde [en fazla üç deneme](https://www.incose.org/certification/start-your-certification/taking-the-exam/) hakkı tanıyor ve her deneme ayrıca ücretlendiriliyor.

### Türkiye'de kâğıt oturum

INCOSE sınavı iki formatta sunuyor: kendi bilgisayarınızdan, canlı uzaktan gözetmenli (**online proctored**) olarak ya da INCOSE onaylı bir gözetmenin denetiminde **kâğıt üzerinde**. Benim hazırlandığım dönemde Prometric test merkezi seçeneği bulunmuyordu.

İlk planım online sınava daha erken bir tarihte girmekti. Sonra Türkiye'de düzenlenen kâğıt oturumun ücretinin **1.000 TL** olduğunu gördüm; online sınavın 80 USD olduğu düşünülünce aradaki fark birkaç ay beklemeye değerdi. Hazırlığı biraz uzattım ve **10 Ocak 2026'da ODTÜ Teknokent'teki SSB Akademi binasında sınava girdim.** Türkiye'de bu organizasyonu INCOSE TR şubesi ve SSB Akademi yürütüyor; SSB Akademi ayrıca CSEP sınavına hazırlık eğitimi de düzenliyor.

Kâğıt formatın bir faydası daha var: uzun ve iç içe geçmiş şıkları kâğıtta taramak daha kolay, soruların üzerini işaretleyip sonra geri dönebiliyorsunuz.

Kısıtı ise takvim. Kâğıt oturumlar belirli tarihlerde açılıyor, sizin hazır olduğunuz ana göre değil. **2026'da benim girdiğim Türkiye kâğıt oturumu ocak ayında yapıldı.** Bu, hazırlığımın bitiş çizgisini benim değil takvimin belirlemesi demekti: ekimde hazır olsaydım da ocağı bekleyecektim, kasımda geride kaldığımı fark etseydim erteleyecek yerim yoktu. Oturumu kaçırsaydım seçeneğim bir sonraki kâğıt oturumu beklemek ya da online sınava dönmekti. Oturumların tarihleri ve sıklığı değişebildiği için güncel INCOSE TR ve SSB Akademi duyurularını takip edin.

---

## Nasıl Hazırlandım?

Toplam hazırlık sürem **altı ay** oldu: haftada birkaç akşam ve hafta sonlarının bir kısmıyla ilerleyen, düzenli ama sakin bir dönem. Üç kaynak kullandım.

### Handbook'u iki kez okumak

![INCOSE Systems Engineering Handbook, beşinci baskı](/img/posts/incose-se-handbook-v5.webp){:style="display:block; margin-left:auto; margin-right:auto; max-width:320px" .img-fluid}

*INCOSE Systems Engineering Handbook, 5. baskı — sınavın tek resmî kaynağı. Kapak görseli INCOSE ve Wiley'e aittir.*

**İngilizce SE Handbook v5'i baştan sona iki kez okudum.** Hazırlığın belkemiği buydu, ama iki okuma birbirinin tekrarı değildi.

İlk okumada satır satır ilerledim ve önemli gördüğüm her yerin altını çizdim; "önce bir göz gezdireyim" turu değildi.

![Altı çizilerek okunmuş bir Handbook sayfası](/img/posts/incose-handbook-notlarim.webp){:style="display:block; margin-left:auto; margin-right:auto" .img-fluid}

*Başucu kitabımdan bir sayfa.*

İkinci okuma daha da detaylıydı ve amacı özümsemekti. Bu kez her süreci **girdileri, aktiviteleri ve çıktıları** üzerinden okudum; süreçlerin birbirini nasıl beslediğini ve aynı kavramın farklı bölümlerde nasıl tekrar karşıma çıktığını görmeye çalıştım. Handbook'un cümlelerini tanımakla kavramı anlamak arasındaki farkı bu turda kapattım. En yüksek getiriyi de bu yöntem sağladı: "şu sürecin çıktısı hangisidir?" tipi sorular, süreçleri bu üçlü üzerinden düşünmemiş adayı zorluyor.

### Türkçe dördüncü baskının yeri

![INCOSE Sistem Mühendisliği El Kitabı, dördüncü versiyon, Savunma Sanayii Akademi Yayınları](/img/posts/incose-se-el-kitabi-v4-tr.webp){:style="display:block; margin-left:auto; margin-right:auto; max-width:320px" .img-fluid}

*Sistem Mühendisliği El Kitabı'nın Türkçe çevirisi — dördüncü versiyon, Savunma Sanayii Akademi Yayınları.*

Handbook'un **Türkçe çevirisi dördüncü baskıya ait** ve Savunma Sanayii Akademi Yayınları tarafından *Sistem Mühendisliği El Kitabı — Sistem Ömür Devri Yönetimi ve Faaliyetleri için Kılavuz* adıyla yayımlanmış durumda. Onu da bir kez okudum. Aviyonikte "verification" ve "validation" gibi terimleri zaten İngilizce kullanıyoruz; ama "enabling system", "system of interest" ya da "measures of effectiveness" gibi kavramların Türkçesini okumak, kavramı gerçekten anlayıp anlamadığımı test etmenin iyi bir yoluydu.

Yine de **Türkçe çeviri bir sınav kaynağı değil.** Sınav artık beşinci baskıdan soruluyor ve iki baskı arasında yapısal farklar var. Ayrıca sınav İngilizce ve şıklar sıklıkla Handbook'un tam ifadelerini kullanıyor; kavramı Türkçe bilmek, doğru İngilizce ifadeyi seçmenizi garanti etmiyor.

### Soru çözmenin yeri

Üçüncü kaynağım Udemy'deki pratik soru setleriydi. Bunlar bilgi öğretmiyor, ama iki işe yarıyor:

- **Soru formatını tanımak.** INCOSE soruları çoğu zaman "hangisi *en iyi* tanımlar" ya da "hangisi *değildir*" biçiminde kuruluyor. Şıkların üçü makul görünüyor, biri Handbook'un tam ifadesi. Bu kalıba alışmak sınavda ciddi zaman kazandırıyor.
- **Boşlukları tespit etmek.** Yanlış cevapladığım her soruda Handbook'un ilgili bölümüne dönüp işaret koydum. Hazırlığın son ayında kitabın tamamını değil, bu işaretli bölümleri çalıştım.

Piyasadaki pratik soruların hiçbiri gerçek sınav sorularının birebir yansıması değil; bazıları eski baskıya dayanıyor, bazılarının cevap anahtarı tartışmalı. Doğru cevap oranınızı bir hedef olarak değil, zayıf bölümlerinizi bulmak için bir araç olarak kullanın. Kullandığım setlerin bağlantıları [Kaynaklar](#kaynaklar) bölümünde.

---

## Sınav Günü

Kâğıt oturum, INCOSE prosedürleri gereği oldukça kurallı ilerliyor. Benim oturumumdaki düzen şöyleydi:

| Saat | Ne oluyor |
|---|---|
| 09.00 | Binada olma sınırı; girişte kayıt ve cep telefonlarının kutulara bırakılması |
| 09.10'a kadar | Numaralı oturma düzenine göre yerleşme, yoklama, kimlik ve sözlük kontrolü |
| 09.10 | INCOSE prosedürü gereği sınav bilgilendirme notunun okunması |
| 09.30 – 11.40 | Sınav — 100 soru, 130 dakika |

Sınav sabahı sürpriz yaşamamak için:

- **Sınav İngilizce, ama yanınızda sözlük bulundurabiliyorsunuz.** Sözlük girişte kontrol ediliyor. Yine de terminolojiyi Handbook'un kendi ifadeleriyle öğrenmek şart: sözlük "requirement" kelimesini çevirir, "measure of effectiveness" ile "measure of performance" arasındaki farkı anlatmaz.
- **Kimlik ve sözlük dışında hiçbir doküman içeri alınmıyor;** telefonunuz girişte teslim ediliyor.
- **Kurşun kalem ve silgiyi kendiniz götürüyorsunuz.**
- **Araçla gidecekseniz plaka kaydını önceden yaptırın.** Teknokent araç kartı olmayanların plaka bilgisini önceden organizasyona bildirip nizamiye kaydı yaptırması gerekiyordu; aksi hâlde araçla giriş mümkün olmuyordu.
- **Sonuçlar oturumun sonunda açıklanmıyor ve puan verilmiyor.** Sonuç INCOSE tarafından e-postayla iletiliyor; ne zaman geleceği INCOSE'un yoğunluğuna bağlı. E-postada yalnızca başarılı olup olmadığınız yazıyor, kaç doğru yaptığınız paylaşılmıyor. Geçme eşiğine ne kadar yaklaştığınızı hiç öğrenmediğiniz için hazırlığı rahat bir payla planlamak mantıklı.
- **Sonucun paylaşımı için rıza isteniyor.** INCOSE TR ekibi, sonucunuzun kendileriyle paylaşılabilmesi için bir rıza metni imzalatıyor; amaç, sınavı geçen adayları başvuru adımına yönlendirebilmek.

---

## İkinci Adım: Başvuru

Sınavı geçtikten sonra elinizde bir "bilgi yeterliliği" oluyor, sertifika değil. Benim için asıl zor kısım bundan sonrasıydı.

> **Not:** Bu bölüm Temmuz–Ağustos 2026'daki akışı anlatıyor. Benim başvurumda Form 1 doldurulup yüklenen bir **PDF dosyasıydı**; Ağustos 2026'daki portal güncellemesinden sonra form doğrudan **web sitesi üzerinden** dolduruluyor. Güncel akış için INCOSE'un [CSEP başvuru sayfasını](https://www.incose.org/certification/start-your-certification/applying-for-csep/) esas alın.

### 60 ay ve üç alan kuralı

[Nitelikli bir dereceye sahip](https://www.incose.org/wp-content/uploads/2026/01/CER-PROC-01_Certification-Program-Definition-and-Requirements_2026.pdf) CSEP adaylarının en az **60 ay doğrudan sistem mühendisliği deneyimi** göstermesi ve bu deneyimin en az **üç farklı SE alanında en az 12'şer ay** içermesi gerekiyor. Nitelikli dereceye sahip olmayan adaylarda referansların doğrulaması gereken deneyim on yıla çıkıyor. Yani INCOSE yalnızca süreye değil, **derinlik ve genişliğe** de bakıyor.

Başvuru formunda deneyim, önceden tanımlı **14 sistem mühendisliği alanına** dağıtılarak beyan ediliyor:

1. Gereksinim mühendisliği — *Requirements Engineering*
2. Sistem ve karar analizi — *System and Decision Analysis*
3. Mimari ve tasarım geliştirme — *Architecture/Design Development*
4. Sistem entegrasyonu — *Systems Integration*
5. Doğrulama ve geçerleme — *Verification and Validation*
6. Sistem işletimi ve bakımı — *System Operation and Maintenance*
7. Teknik planlama — *Technical Planning*
8. Teknik izleme ve kontrol — *Technical Monitoring and Control*
9. Tedarik ve temin — *Acquisition and Supply*
10. Bilgi ve konfigürasyon yönetimi — *Information and Configuration Management*
11. Risk ve fırsat yönetimi — *Risk and Opportunity Management*
12. Yaşam döngüsü süreçlerinin tanımlanması ve yönetimi — *Lifecycle Process Definition and Management*
13. Özel mühendislik dalları — *Specialty Engineering* (emniyet, güvenilirlik, güvenlik, insan faktörleri, yaşam döngüsü maliyeti ve benzerleri)
14. Kurumsal proje etkinleştirme faaliyetleri — *Organizational Project Enabling Activities*

Hiçbirine oturmayan ama sistem mühendisliği olduğunu gerekçelendirebildiğiniz işler için bir de "Diğer" seçeneği var; ancak üç alan kuralı 14 tanımlı alan üzerinden değerlendiriliyor.

Deneyim **tam zamana eşdeğer (FTE) ay** cinsinden yazılıyor. Aynı takvim döneminde birden fazla alanda çalıştıysanız o dönemin eforunu alanlar arasında bölüştürüyorsunuz ve alanlara dağıttığınız toplam, takvimdeki süreyi aşamıyor. "Aynı yıl hem gereksinim yazdım hem entegrasyon yaptım" diyerek o on iki ayı iki alana da tam olarak yazamıyorsunuz.

---

## DO-178C Deneyimini SE Diline Çevirmek

Benim gibi yazılım kökenli mühendisler için başvurunun asıl zihinsel egzersizi, yaptığı işi INCOSE'un diline çevirmek. Bu çeviride akılda tutulması gereken ilk kural şu: **DO-178C kapsamında yapılan her faaliyet otomatik olarak sistem mühendisliği deneyimi sayılmıyor.** Bir faaliyeti ancak fiilen siz yürüttüyseniz beyan edebilirsiniz.

Bu şartla, DO-178C dünyasındaki işlerin karşılıkları büyük ölçüde mevcut:

- Üst seviye ve alt seviye yazılım gereksinimlerinin yazılması, gözden geçirilmesi ve izlenebilirliğin kurulması → **Gereksinim mühendisliği**
- Gereksinim tabanlı testler, yapısal kapsam analizi, test sonuçlarının yönetimi → **Doğrulama ve geçerleme**
- Donanım-yazılım entegrasyonu, arayüzlerin tanımlanması ve yönetimi → **Sistem entegrasyonu**
- DO-178C planlarının ve standartlarının yazılması, geliştirme süreçlerinin tanımlanması ve iyileştirilmesi → **Yaşam döngüsü süreçlerinin tanımlanması ve yönetimi**
- Konfigürasyon yönetimi, sürüm kontrolü, sertifikasyon verilerinin yönetimi → **Bilgi ve konfigürasyon yönetimi**
- Gözden geçirmeler, uygunluk denetimleri, ilerleme ve kalite ölçütlerinin takibi → **Teknik izleme ve kontrol**
- DAL A seviyesinde emniyet analizlerine katkı, güvenilirlik ve güvenlik çalışmaları → **Özel mühendislik dalları**
- Test otomasyonu altyapısının kurulması ve ekibin bu altyapıyla çalışacak biçimde yetkinleştirilmesi → **Kurumsal proje etkinleştirme faaliyetleri**

Örneğin DAL A seviyesinde bir projede çalışmış olmak tek başına Specialty Engineering deneyimi oluşturmuyor; emniyet, güvenilirlik ya da güvenlik analizini gerçekten sizin yapmış olmanız gerekiyor. Aynı şekilde bir test altyapısı geliştirmiş olmak kendiliğinden kurumsal etkinleştirme faaliyeti değil; o altyapının kurumsal düzeyde bir yetkinliğe dönüşmesinde rol almış olmanız gerekiyor.

Eşlemeyi yaparken abartmamak önemli. Değerlendirme komitesi, beyan ettiğiniz alanların referanslarınızın doğrulayabileceği türden olmasını bekliyor. Bir alanda 12 ayı zorlayarak doldurmaktansa, gerçekten güçlü olduğunuz üç alanı sağlam biçimde belgelemek daha iyi. Formu yazarken her satır için kendime şunu sordum: "Referansım bu cümleyi okusa, gözünü kırpmadan onaylar mı?" Cevap tereddütlüyse cümleyi ya yumuşattım ya çıkardım.

---

## Referanslar ve Değerlendirme

### Kim referans olabilir?

CSEP başvurusunda deneyiminizi [referanslar](https://www.incose.org/certification/start-your-certification/being-a-reference/) doğruluyor. Kurallar özetle şöyle:

- Referans en az beş yıllık iş deneyimine sahip olmalı ve sistem mühendisliğine aşina olmalı; yani yaptığınız işin gerçekten sistem mühendisliği olduğunu değerlendirebilecek durumda olmalı. Sistem mühendisi ya da INCOSE üyesi olması şart değil.
- Referans, beyan ettiğiniz deneyim döneminde sizi tanıyor ve o işten haberdar olmalı. Sonradan tanıştığınız biri o dönemi doğrulayamaz.
- Referansların toplamı, gerekli deneyimin tamamını (nitelikli dereceye sahip adaylarda beş yıl, diğerlerinde on yıl) kapsamalı. Tek bir referansın tüm deneyimi doğrulaması gerekmiyor; öte yandan derinlik, genişlik ve süre şartının tamamını tek başına doğrulayabilen bir referans da yeterli sayılabiliyor.
- Referansın sizinle akrabalık bağı olmamalı.
- **INCOSE mevcut ve eski yöneticileri ile müşteri tarafını ideal referans olarak tanımlıyor; astlarınız referans olamıyor.** Benim dosyamda da en güçlü doğrulama, ilgili dönemdeki yöneticilerimden geldi.

Ben asgari sayıyla yetinmedim: **çalıştığım son üç iş yerinden toplam sekiz referans** verdim. İki sebebi vardı. Birincisi kapsama: beyan ettiğim altmış aylık deneyim tek bir projeye ya da tek bir yöneticinin görüş alanına sığmıyordu; her dönemi ve her deneyim alanını o işi bizzat gören biriyle eşleştirmek istedim. İkincisi dayanıklılık: referansların formu doldurması gönüllülüğe dayanıyor, araya izin, yoğunluk ya da unutma girebiliyor. Sekiz kişiden birkaçı gecikse bile dosya eksik kalmıyordu.

### Başvurudan sonra ne oluyor?

Başvuruyu gönderdikten hemen sonra INCOSE Sertifikasyon Ofisi'nden bir "sonraki adımlar" e-postası geliyor. Süreç şöyle işledi:

1. **Tarama.** Sertifikasyon Ofisi önce başvuru formunuzun şartlara uygun olup olmadığını kontrol ediyor. Bu onay gelmeden referans adımına geçmiyorsunuz.
2. **Referanslar.** Form uygun bulununca her referansınıza iki şey gönderiyorsunuz: doldurduğunuz **Form 1**'in bir kopyası ve **dijital referans mektubunun** ([Form 4B](https://forms.office.com/pages/responsepage.aspx?id=k6cjNVAORka4CyXYO9fylpdnShHiChFNk4sYt-8URhFUN1RNUE5NSDdKTlRVSkNZVFdYRkwyOVlPSC4u&route=shorturl)) bağlantısı. Form 1'in kopyası şart, çünkü referans sizin hangi dönemde hangi alanda ne beyan ettiğinizi görmeden mektubu dolduramıyor. Mektup gönderildiğinde doğrudan INCOSE'a ulaşıyor. Formun kendi uyarısına göre doldurulması yaklaşık **30 dakika** sürüyor; bunu referansınıza baştan söyleyin.
3. **Değerlendirme ve karar.** Referans mektupları tamamlanınca dosya değerlendiriliyor ve sonuç e-postayla bildiriliyor.

Ben sürece girene kadar referans trafiğini INCOSE'un yürüttüğünü sanıyordum. Öyle değil: **referans sürecini siz başlatıyor ve siz takip ediyorsunuz.** Bu yüzden referanslara önceden haber vermek, sürecin hızını belirleyen şey. Başvurumun yaklaşık **üç buçuk haftada** sonuçlanmasının en büyük sebebi, referanslarımın mektupları hızla doldurmasıydı.

---

## Takvim ve Maliyet

Benim takvimim ve harcamalarım aşağıda. Bu bir CSEP fiyat listesi değil; iki yıllık üyelik, başvuru ücreti ve Türkiye'deki kâğıt oturumdan oluşan kişisel toplamım:

| Tarih | Adım | Maliyet |
|---|---|---|
| 2025 başı | CSEP hedefinin konması | — |
| 18 Mart 2025 | INCOSE üyeliği — Regular PPP 2 | 130 USD |
| Temmuz 2025 | Handbook v5 ile hazırlığa başlangıç | — |
| 10 Ocak 2026 | Bilgi sınavı, SSB Akademi / ODTÜ Teknokent | 1.000 TL |
| 9 Mart 2026 | Üyelik yenileme | 130 USD |
| Ocak–Temmuz 2026 | Başvuru dosyasının hazırlanması ve ertelenmesi | — |
| 19 Temmuz 2026 | CSEP başvurusunun gönderilmesi | 350 USD |
| 12 Ağustos 2026 | Başvurunun onaylanması | — |
| | **Toplam** | **610 USD + 1.000 TL** |

INCOSE'un [fiyat sayfasına](https://www.incose.org/certification/pricing-requirements/) göre üyeler için CSEP başvuru ücreti 350 USD, online sınav 80 USD; kâğıt sınavın ücreti ise oturumu düzenleyen etkinliğe göre değişiyor.

**Üyelik.** Ekim 2025'ten beri zorunlu olmasa da üye olmayanların ödediği ücretler belirgin biçimde yüksek. Türkiye için ayrıca bir avantaj var: INCOSE bireysel üyelik aidatını ülkelerin satın alma gücüne göre kademelendiriyor. Türkiye "Regular PPP 2" kademesinde ve yıllık aidat, standart 175 USD yerine **130 USD**. Bu fark yüzünden sürece üye olarak başlamak benim için açık ara daha ucuzdu.

**On iki ay kuralı.** Sınavı ocakta geçmiştim ama başvuruyu ancak temmuzda gönderdim; aradaki altı ayın sebebi başvuru ücretiydi. Ertelemeye son veren şey şu oldu: [bilgi yeterliliği](https://www.incose.org/wp-content/uploads/2026/01/CER-PROC-01_Certification-Program-Definition-and-Requirements_2026.pdf) çoğu durumda 12 ay geçerli; bu nedenle sertifikasyon başvurusunun bu süre içinde tamamlanması gerekiyor. Süre dolarsa sınava yeniden girmeniz gerekiyor. Benim buradan çıkardığım ders: **sınava, başvuru ücretini ödemeye hazır olduğunuzda girin.**

---

## Sertifika Sonrası: Yenileme

CSEP üç yıl geçerli. [Yenilemek](https://www.incose.org/certification/maintaining-renewing-certification/renewing-certification/) için üç yıllık dönem içinde **120 PDU** (Professional Development Unit) toplamanız ve **100 USD** yenileme ücreti (üye fiyatı) ödemeniz gerekiyor. Üyelik yenileme için de zorunlu değil ama ücretler yine üyeler lehine. Koşullar değişebildiği için yenileme zamanı geldiğinde INCOSE'un sayfasından teyit edin.

PDU'lar yalnızca eğitim ve konferanslardan gelmiyor; sistem mühendisi olarak çalışmak, ekip liderliği yapmak, meslek örgütü ve şube etkinliklerine katılmak, makale yazmak ve gönüllü görevler almak da sayılıyor. Dönem içinde 120'nin üzerinde PDU biriktirirseniz en fazla 30'unu bir sonraki döneme aktarabiliyorsunuz.

INCOSE bir **PDU kayıt defteri** tutmanızı ve gerektiğinde belgeleyebilmenizi bekliyor. Üç yıl sonra geriye dönüp hatırlamaya çalışmak yerine, katıldığınız her etkinliği o gün kaydetmek çok daha kolay. Ben bu kaydı sertifikayı aldığım gün açtım.

---

## INCOSE Dizininde Türkiye

Süreci bitirdikten sonra merak ettim: Türkiye'de benim gibi kaç kişi var? INCOSE'un herkese açık [SEP dizini](https://www.incose.org/certification/certification-faqs/sep-directory/) bu soruya kısmen cevap veriyor. Bu bölümdeki bütün sayılar, **28 Ağustos 2026'da aldığım anlık görüntüye** dayanıyor; dizin sürekli değiştiği için bugün baktığınızda farklı sayılar görürsünüz. O tarihte Türkiye merkezli **141 kayıt** listeleniyordu.

### Dizin neyi göstermiyor?

Dizin, sertifika almış herkesi değil, yalnızca listelenmeyi kabul eden ve **sertifikası o an geçerli olanları** gösteriyor; yani gerçek sayı daha yüksek. CSEP üç yılda bir, ASEP beş yılda bir yenilenmek zorunda ve yenilemeyen kişi listeden tamamen düşüyor. Veride bunun izi açıkça görülüyor: **121 CSEP kaydının** 80'inde ilk sertifikalanma tarihiyle bitiş tarihi arasındaki fark üç yıl (hiç yenilememişler), 30'unda altı yıl (bir kez yenilemişler), 11'inde yedi yıl veya daha uzun. Listedeki "2013" kaydı, 2013'ten beri sertifikasını dört kez yenilemiş bir kişiye ait.

Bu yüzden **eski yıllar olduğundan az görünüyor.** 2015'te sertifika alıp 2018'de yenilemeyen bir mühendis bu veride hiç yok. Aşağıdaki yıl kırılımı bir büyüme serisi olarak değil, bugünkü kayıtların yaş dağılımı olarak okunmalı.

<div class="mermaid">
xychart-beta
    title "Bugün geçerli sertifikaların ilk sertifikalanma yılı"
    x-axis ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"]
    y-axis 0 --> 36
    bar [1, 1, 1, 1, 0, 0, 3, 17, 12, 3, 10, 27, 31, 34]
</div>

Soldaki çöküş, 2013–2019 arasında Türkiye'de kimsenin sertifika almadığı anlamına gelmiyor; o yıllarda sertifika alanların çoğunun bugün geçerli bir sertifikası olmadığı anlamına geliyor. Bu iki durumu veriden ayıramıyoruz.

### Son üç yıl kendi arasında karşılaştırılabilir

Grafiğin sağ tarafı bu çarpıklıktan etkilenmiyor. CSEP döngüsü üç yıl olduğu için 2024 ve 2025 kohortları henüz bir yenileme eşiğinden geçmedi; ilk yenileme tarihleri 2027 ve 2028. 2023 kohortu için bunu söyleyemeyiz, çünkü onların ilk yenileme tarihi 2026'ydı.

Son üç yılın sayıları **2024'te 27, 2025'te 31, 2026'nın ilk sekiz ayında 34 kayıt.** Son sütun sekiz ayı kapsadığı hâlde 2025'in tamamını geçmiş durumda. Gözlenen sayılar artıyor, ama 2026 tamamlanmadığı için yıllık eğilimi bu veriyle kesinleştirmek doğru olmaz. SSB Akademi'nin hazırlık eğitimi ve Türkiye'deki yüz yüze oturumlar erişimi kolaylaştırıyor olabilir; ama bu veriyle bir neden-sonuç ilişkisi kurulamaz.

### Önümüzdeki yılların yenileme takvimi

Aşınma geriye dönük seriyi bozuyor ama ileriye dönük olana dokunmuyor: bitiş tarihi olan 135 sertifikanın ne zaman yenilenmesi gerektiğini tam olarak biliyoruz. (Dizin 6 ESEP kaydı için bitiş tarihi göstermiyor; bu bir dizin özelliği, sertifikanın süresiz olduğu anlamına gelmiyor.)

<div class="mermaid">
xychart-beta
    title "Mevcut sertifikaların yenileme yılı"
    x-axis ["2026", "2027", "2028", "2029", "2030", "2031"]
    y-axis 0 --> 46
    bar [16, 36, 32, 43, 4, 4]
</div>

Bu 135 kaydın 42'sinin süresi anlık görüntüden sonraki bir yıl içinde doluyor; 2029 sonuna kadar ise 127 sertifikanın, yani süreli kayıtların %94'ünün yenilenmesi gerekiyor. Bugünkü 141 sayısının nereye gideceğini büyük ölçüde bu yenileme dalgası belirleyecek.

### Sertifika ağırlıklı olarak savunma ve havacılıkta

İşvereni belirtilmiş 105 kaydın **79'u (%75) savunma ve havacılık** kuruluşlarında. TÜBİTAK'ın 12 kaydını da eklerseniz oran %87'ye çıkıyor; TÜBİTAK'ı ayrı tuttum, çünkü SAGE ve BİLGEM savunma ağırlıklı olsa da kurumun geneli için aynı şeyi söylemek zor. Aynı kuruluşun farklı yazımlarını birleştirdim; kişi adlarını bilinçli olarak paylaşmıyorum. Dizindeki işveren bilgisi kişinin kayıt anındaki işvereni de olabilir.

| Kurum | Kişi | Pay |
|---|---:|---:|
| ASELSAN | 31 | %22,0 |
| TÜBİTAK | 12 | %8,5 |
| HAVELSAN | 9 | %6,4 |
| Turkish Aerospace (TUSAŞ) | 9 | %6,4 |
| ROKETSAN | 7 | %5,0 |
| SSB | 4 | %2,8 |
| TEI | 3 | %2,1 |
| TOGG | 2 | %1,4 |
| TRMOTOR | 2 | %1,4 |
| Tek kişilik diğer kurumlar (26 ayrı kurum) | 26 | %18,4 |
| Belirtilmemiş | 36 | %25,5 |

ASELSAN tek başına tüm listenin beşte birinden fazlasını oluşturuyor. Savunma ve havacılık grubunda yerli kuruluşların yanında Rolls-Royce, RTX Rockwell Collins ve Thales gibi yabancı şirketler de var. Grubun dışında kalan 14 kayıt ise otomotiv (TOGG, Ford Otosan, FEV), sanayi ve elektronik (Bosch, Philips), yazılım, danışmanlık ve belgelendirme alanlarına dağılıyor. Kayıtların dörtte birinde işveren belirtilmediği için oranlar kesin değil, ama ağırlık merkezi net.

### Seviye dağılımı

Bugün geçerli sertifikaların dağılımı beklendiği gibi CSEP ağırlıklı: **121 CSEP (%85,8), 14 ASEP (%9,9), 6 ESEP (%4,3)**.

Dizindeki en eski ASEP kaydı 2023 tarihli. ASEP beş yıl geçerli olduğu için 2022'de alınmış bir ASEP 2027'ye kadar listede olurdu ve öyle bir kayıt yok; bu, ASEP'in Türkiye'de yeni yaygınlaştığına dair makul ama kesin olmayan bir işaret. ESEP tarafı ise altı kişiyle çok dar; uzun süreli deneyim ve liderlik şartı düşünülünce beklenen bir sonuç.

### Bu listedeki son satır

Anlık görüntünün alındığı tarihte dizindeki en yeni CSEP kaydı bana aitti. Süreci tek başıma koştuğum bir maraton gibi hatırlıyorum, ama listeye bakınca aynı anda onlarca kişinin aynı yoldan geçtiğini görüyorum. Üç yıl sonra bu listede kalıp kalmayacağımı ise PDU defterim belirleyecek.

---

## CSEP Kimin İşine Yarar?

CSEP aldım diye ertesi gün kariyerimde dramatik bir değişiklik olmadı. Benim açımdan CSEP'in en anlamlı olduğu üç durum şunlardı:

**Savunma ve havacılık projeleri.** Yukarıdaki dağılımın da gösterdiği gibi, Türkiye'de sertifika sahipleri ağırlıklı olarak bu sektörde. Sistem mühendisliği süreçlerinin merkezde olduğu bu projelerde, yetkinliğimi bağımsız bir kurumun doğruladığı bir belgeyle gösterebilmek benim için anlamlıydı.

**Yazılımdan sisteme geçiş.** Benim durumum tam olarak bu. Yazılımda derinleşmiş bir mühendisin sistem tarafına adım atarken karşılaştığı en büyük engel, deneyiminin yalnızca "yazılım deneyimi" olarak okunması. Benim için CSEP'in asıl faydası, yıllardır yaptığım işi sistem mühendisliği terminolojisiyle ifade edebilmekti.

**Uluslararası ortak projeler.** Çok ortaklı programlarda ortak bir terminolojiye sahip olmak işi kolaylaştırıyor; CSEP de yerel deneyimi uluslararası ölçekte tanınan bir formata çeviriyor.

Benim gördüğüm kadarıyla, sistem seviyesinde sorumluluk almayacak bir rolde çalışan biri için bu yatırımın karşılığını değerlendirmek daha zor.

---

## Almayı Düşünenlere Öneriler

1. **Önce uygunluğunuzu kontrol edin.** Deneyim şartını karşılamıyorsanız ASEP ile başlayın; ASEP'ten sonra beş yıl içinde CSEP'e geçerken sınavı tekrar vermeniz gerekmiyor.
2. **Referanslarınızı sınavdan önce belirleyin.** Uygun referans bulamayacaksanız, bunu sınav ücretini ödemeden öğrenmek istersiniz.
3. **Handbook v5'i süreç bazında çalışın.** Her süreç için amaç, girdiler, aktiviteler, çıktılar; soruların önemli bir bölümü bu mantık üzerinden kuruluyor.
4. **Başvuru ücretini sınavdan önce bütçeleyin.** On iki aylık kural erteleme payınızı sınırlıyor.
5. **Deneyim beyanında ölçülü olun ve PDU defterini ilk günden açın.**

---

## Sonuç

CSEP sürecinin bana kazandırdığı en değerli şey unvan olmadı. Altı aylık hazırlık, on yıla yakın sürede parça parça öğrendiğim pratikleri tek bir çerçeveye oturttu ve bu çerçevenin ne kadarını gerçekten bildiğimi, ne kadarını sadece uyguladığımı gösterdi. Alanın Handbook'un çok ötesine geçtiğini görmek, sınavdan sonra ikinci yüksek lisansım olarak sistem mühendisliğine başlamamın da sebebi oldu.

Başvuru dosyası ise başka bir şey öğretti: yaptığınız işi başkasının anlayacağı ve doğrulayabileceği bir dille anlatmak, işin kendisinden ayrı bir beceri. Deneyim tablosunu doldururken kendi kariyerime dışarıdan bakmak zorunda kaldım: hangi işler gerçekten sistem seviyesinde sorumluluk taşıyordu, hangileri iyi yapılmış ama dar kapsamlı işlerdi? Bu egzersizi, sertifikaya başvurmayacak olsanız bile tavsiye ederim.

Aynı yolu yürüyecek olanlara kolaylıklar dilerim. Süreçle ilgili sorusu olanlar [iletişim]({{ '/contact' | relative_url }}) sayfasından bana ulaşabilir.

---

## Kaynaklar

- [INCOSE Certification Program](https://www.incose.org/certification/)
- [SEP Certification Program Definitions & Requirements, 2026](https://www.incose.org/wp-content/uploads/2026/01/CER-PROC-01_Certification-Program-Definition-and-Requirements_2026.pdf) — deneyim şartları, üyelik ve bilgi yeterliliğinin geçerlilik süresi
- [Applying for CSEP — INCOSE](https://www.incose.org/certification/start-your-certification/applying-for-csep/)
- [Taking the Exam — INCOSE](https://www.incose.org/certification/start-your-certification/taking-the-exam/)
- [Being a Reference — INCOSE](https://www.incose.org/certification/start-your-certification/being-a-reference/)
- [Certification Pricing and Requirements — INCOSE](https://www.incose.org/certification/pricing-requirements/)
- [Renewing Certification — INCOSE](https://www.incose.org/certification/maintaining-renewing-certification/renewing-certification/)
- [Certification FAQs — INCOSE](https://www.incose.org/certification/certification-faqs/)
- [How to Apply for CSEP, 2026](https://www.incose.org/wp-content/uploads/2026/07/CSEP_HowToApply_2026.pdf) — başvurunun adım adım anlatımı
- [Form 2 — CSEP Application Instructions](https://www.incose.org/wp-content/uploads/2026/01/form-2-instructions-for-completing-form-1-1.pdf) — Form 1'in nasıl doldurulacağı ve deneyim alanlarının tanımları
- [FORM 4B: Reference for CSEP/ESEP](https://forms.office.com/pages/responsepage.aspx?id=k6cjNVAORka4CyXYO9fylpdnShHiChFNk4sYt-8URhFUN1RNUE5NSDdKTlRVSkNZVFdYRkwyOVlPSC4u&route=shorturl) — referansların dolduracağı dijital mektup
- [How to Register for an Exam, online ve kâğıt](https://www.incose.org/wp-content/uploads/2026/08/EXAM_HowToRegister_Online-and-Paper.pdf)
- [How to Renew or Reinstate a SEP, 2026](https://www.incose.org/wp-content/uploads/2026/07/SEP_HowToReneworReinstate_2026.pdf)
- INCOSE, *Systems Engineering Handbook*, 5. baskı, Wiley — sınavın tek resmî kaynağı
- INCOSE, *Sistem Mühendisliği El Kitabı*, dördüncü versiyon, Savunma Sanayii Akademi Yayınları — Türkçe çeviri
- [Savunma Sanayii Akademi](https://www.ssa.gov.tr/) — CSEP hazırlık eğitimi ve Türkiye'deki kâğıt sınav oturumu
- [INCOSE TR](https://tr.linkedin.com/company/incosetr)
- [SEP Directory — INCOSE](https://www.incose.org/certification/certification-faqs/sep-directory/) — "INCOSE Dizininde Türkiye" bölümündeki sayıların kaynağı; 28 Ağustos 2026 anlık görüntüsü

### Pratik soru setleri (Udemy)

Hazırlık sırasında kullandığım soru setleri. Hiçbiri INCOSE'un resmî kaynağı değildir; teşhis aracı olarak faydalıdırlar, tek başına hazırlık kaynağı olarak değil.

- [INCOSE ASEP/CSEP Practice Knowledge Exams, 5th Ed.](https://www.udemy.com/course/incose-asepcsep-practice-knowledge-exams-5th-ed)
- [INCOSE Certified Systems Engineering Professional, CSEP](https://www.udemy.com/course/incose-certified-systems-engineering-professional-csep)
- [INCOSE ASEP/CSEP Practice Test](https://www.udemy.com/course/incose-asepcsep-practice-test)
- [Systems Engineering Practitioner: Prep for SE Handbook v5](https://www.udemy.com/course/systems-engineering-practitioner-prep-for-se-handbook-v5)

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

Sürüm çıkmış, sahadan ilk hata kaydı gelmiştir. Toplantıda sorulan ilk soru çoğu zaman aynıdır: "QA bunu nasıl kaçırdı?" Soruyu soran, sürümden önce testleri koşan ekibi kastediyordur; o ekibin kapısında da gerçekten "QA" yazar.

Oysa testi koşan ekibin görevi hatayı yakalamaksa, yaptığı iş kalite kontroldür (*quality control*, QC). Kalite güvence (*quality assurance*, QA) başka bir şey sorar: Bu hata ürüne nasıl girdi, süreç onu neden ne önledi ne de daha erken yakaladı?

| | Kalite güvence (QA) | Kalite kontrol (QC) |
|---|---|---|
| **Bakış** | Süreç | Ürün |
| **Amaç** | Hatanın oluşmasını ve tekrarlanmasını azaltmak | Hatayı bulmak |
| **Örnek** | Süreç denetimi, standartlar, kök neden analizi | Gözden geçirme, analiz, test |

---

## Bir Hata, İki Soru

Gömülü bir birim sahada kesintisiz çalışırken yaklaşık 50 günde bir kendiliğinden yeniden başlıyor. Laboratuvardaki testlerin hiçbiri birkaç saatten uzun sürmediği için sorun sürümden önce görülmemiş. İnceleme şu satırlara ulaşıyor:

```c
uint32_t deadline = millis() + TIMEOUT_MS;
/* ... */
if (millis() > deadline) {      /* sayaç taşınca yanlış */
    start_recovery();
}
```

`millis()` 32 bitlik bir milisaniye sayacıdır ve 2³² ms ≈ 49,7 günde sıfıra döner. Taşmaya yakın bir anda hesaplanan `deadline` küçük bir sayıya sarar, koşul beklenenden çok önce doğru olur ve kurtarma yolu yanlışlıkla tetiklenir.

### QC'nin sorusu: Bu ürün nasıl düzelir?

Bitiş zamanı yerine başlangıç zamanı saklanır ve karşılaştırma taşmaya dayanıklı hâle getirilir: `if ((uint32_t)(millis() - start) >= TIMEOUT_MS)`. İşaretsiz çıkarma, sayaç sarmış olsa bile geçen süreyi doğru verir. Sayacı taşmanın hemen öncesinden başlatan bir regresyon testi eklenir, düzeltme gözden geçirilir ve birim yeni sürüm alır. Bunların hepsi gerekli, ama hepsi *bu* hatayla ilgili.

### QA'nın sorusu: Bu hata türü süreçten nasıl kaçtı?

- **Gözden geçirme:** Kod incelemesi yapılmış, ama kontrol listesinde zaman, sayaç ya da taşmayla ilgili tek madde yok. İnceleyen, aramadığı şeyi bulamamış.
- **Kodlama standardı:** Zaman karşılaştırmaları için ortak bir fonksiyon yok; herkes kendi kalıbını yazıyor.
- **Test stratejisi:** Test ortamı sayacı her açılışta sıfırdan başlatıyor. 50 günlük bir koşu hiçbir planda yok, olması da gerçekçi değil.
- **Gereksinimler:** "Birim en fazla kaç gün kesintisiz çalışacak?" sorusu hiçbir gereksinimde sorulmamış.

Bu cevapların her biri ürünü değil süreci değiştirir. Kontrol listesine bir madde eklenir, zaman karşılaştırmaları tek bir onaylı fonksiyona bağlanıp statik analizle zorlanır, gereksinimlere bir kesintisiz çalışma süresi girer. Test ortamı da sayacı taşmaya yakın bir değerden başlatır. Linux çekirdeği bunu yıllardır yapar: `jiffies` sayacı açılıştan yaklaşık beş dakika sonra taşacak bir değerden başlar, böylece taşma hataları haftalar sonra değil ilk dakikalarda görünür. Kök neden analizi bir QC işi de doğurur: Aynı kalıp kod tabanının başka yerlerinde de var mı?

Bu senaryo teorik değil. FAA 2015'te yayımladığı bir uçuşa elverişlilik direktifinde, 248 gün kesintisiz enerjili kalan bir Boeing 787'nin, jeneratör kontrol ünitelerindeki bir yazılım sayacı taştığında bütün AC elektrik gücünü kaybedebileceğini bildirdi. Sorun laboratuvar testinde bulunmuştu; kalıcı düzeltme gelene kadar çözüm, uçağın elektriğini belirli aralıklarla tamamen kesip yeniden vermekti. (248 gün, 32 bitlik işaretli bir sayaç santisaniye saydığında taşmanın gerçekleştiği süreye denk gelir.)

Hata bulunduğunda QC döngüsü çalışıyor: düzelt, tekrar test et, kapat. QA ise bir adım geri çekilip "Bu neden buraya kadar geldi?" diye soruyor. Böylece aynı hatanın bir sonraki sürümde tekrar çıkmaması için süreçte bir şey değişiyor.

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

---

## Standartlar Ne Diyor?

ISO 9000:2015 ikisini de, kalite planlama ve kalite iyileştirmeyle birlikte kalite yönetiminin parçası sayar. Tanımlardaki fark tek kelimededir: kalite kontrol, kalite gereksinimlerini **karşılamaya** odaklanır; kalite güvence ise bu gereksinimlerin karşılanacağına dair **güven sağlamaya**. Yani QA'nın ürettiği şey güvencedir: müşteriye, yönetime ya da sertifikasyon otoritesine ürünün güvenilir bir süreçle üretildiğini gösterebilmek.

ISTQB'nin temel seviye müfredatı (CTFL v4.0) testin QA olmadığını açıkça yazar: test bir kalite kontrol biçimidir. QA ise iyi bir süreç doğru izlendiğinde iyi bir ürün çıkacağı varsayımına dayanır ve projedeki herkesin sorumluluğudur.

Yazılımın üretimden bir farkı da var. Fabrikada QC aynı tasarımın binlerce kopyası arasında tasarımdan sapanı arar. Yazılımın kopyaları ise bit bit aynıdır; hata kopyada değil tasarımdadır. Bu yüzden yazılımda QC tek bir tasarım ürününü (gereksinimi, kodu, test prosedürünü) gözden geçirme, analiz ve testle inceler.

---

## Fikir Yeni Değil: Muayeneden Önlemeye

Ayrımın kökü üretim mühendisliğindedir. 1920'lerde Bell Laboratuvarları'nda Walter Shewhart, hatalı parçaları tek tek ayıklamak yerine sürecin değişkenliğini ölçmeyi önerdi; kontrol grafiği ve istatistiksel süreç kontrolü bu fikirden çıktı. W. Edwards Deming, on dört ilkesinin üçüncüsünde kaliteye muayeneyle ulaşmaya çalışmayı bırakıp kaliteyi ürüne baştan yerleştirmeyi istedi. Joseph Juran kalite yönetimini planlama, kontrol ve iyileştirmeden oluşan bir üçleme olarak tarif etti; Armand Feigenbaum ise kaliteyi bütün organizasyonun işi saydı (*total quality control*). Hepsinde ağırlık, ürünü muayene etmekten süreci güvenilir kılmaya kayar.

Bu kaymayı en açık biçimde söyleyen Philip Crosby oldu. 1979 tarihli *Quality Is Free* kitabı şu cümlelerle açılır:

> Kalite bedavadır. Bir hediye değildir, ama bedavadır. Para tutan şey kalitesizliktir: işi ilk seferde doğru yapmamayı içeren bütün eylemler.

Crosby bu fikirleri sonradan *Quality Without Tears* (1984) kitabında dört ilkede toparladı: kalite gereksinimlere uygunluktur; kalite sistemi değerlendirme değil önlemedir; performans standardı sıfır hatadır; kalitenin ölçüsü uygunsuzluğun bedelidir. İkinci ilke, QA ile QC ayrımının kalite yönetimi dilindeki karşılığıdır. Sıfır hata ilkesi ise üretimde yaygın "kabul edilebilir kalite düzeyi" (*acceptable quality level*, AQL) anlayışına karşı çıkar: Crosby'ye göre kabul edilebilir bir hata oranı belirlemek, başarısızlığı önceden planlamaktır. Yazılımda sıfır hata kanıtlanabilecek bir sonuç değil, ama bulunan hatayı "işin doğası" saymamak için hâlâ kullanışlı bir standart.

### Uygunluk Yetmez

Crosby'nin tanımının bir sınırı var: uygunluk, gereksinimlerin doğru olduğunu varsayar. Juran'ın "kullanıma uygunluk" (*fitness for use*) tanımı bu boşluğu kapatır. [Sistem Mühendisliği Nedir?]({% post_url 2026-05-26-sistem-muhendisligi-nedir %}) yazısındaki ayrımla söylersek, uygunluk doğrulamaya (*verification*), kullanıma uygunluk ise onaylamaya (*validation*) karşılık gelir. Gereksinimlerine kusursuz uyan bir yazılım da yanlış ürün olabilir, çünkü gereksinimlerin kendisi baştan yanlış yazılmış olabilir.

---

## Emniyet Kritik Yazılımda: DO-178C

Emniyet kritik bir projede bu ayrımı günlük işte görmek kolay. Bir test prosedürünün başarısız olması QC'nin problemi. Aynı sınıftaki hatanın üç farklı testte tekrar tekrar karşımıza çıkması ise artık süreç problemidir. DO-178C bu iki işi iki ayrı sürece verir. **Doğrulama süreci** (*software verification process*) gereksinimleri, tasarımı, kodu ve testleri gözden geçirme, analiz ve testle değerlendirir; ürüne bakar ve karakteri QC'dir. Standart, doğrulamanın yalnızca test olmadığını ve testin genel olarak hataların yokluğunu gösteremeyeceğini özellikle vurgular.

**Yazılım kalite güvence süreci** (*software quality assurance*, SQA) ise işin nasıl yapıldığına bakar: Planlar ve standartlar yazılıp gözden geçirilmiş mi? Geliştirme ve doğrulama, planlara ve standartlara uygun yürüyor mu? Aşama geçiş kriterleri sağlanmış mı? Sertifikasyona sunulan ürün için uygunluk incelemesi (*conformity review*) yapılmış mı?

Pratikteki fark şurada: SQA test yazmaz ve test sonuçlarını yeniden hesaplamaz. Testin plana uygun yapıldığını, sonuçların kayda geçtiğini ve problem raporlarının kapatıldığını güvenceye alır. DO-178C bu güvencenin bağımsız olmasını ister: SQA'yı işi yapanlardan başka biri yürütür ve bulduğu uyumsuzluğu düzelttirecek yetkiye sahiptir.

---

## Aynı Faaliyetin İki Yüzü

Bir faaliyetin QA mı QC mi olduğunu adı değil, sorduğu soru belirler. Günlük işlerin çoğunun iki yüzü vardır:

| Faaliyet | QC yüzü (ürün) | QA yüzü (süreç) |
|---|---|---|
| Kod incelemesi | Bu değişiklikteki hatayı bulmak | Kontrol listesini tanımlamak; incelemenin gerçekten yapıldığını denetlemek |
| Statik analiz | Araç bulgularını gidermek | Hangi kural setinin (örneğin [MISRA C]({% post_url 2026-04-05-misra-c-2025-ile-neler-degisti %})) zorunlu olduğuna ve sapmaların nasıl onaylanacağına karar vermek |
| Test | Testi koşmak, hatayı raporlamak | Test stratejisi, kapsam hedefi, giriş/çıkış kriterleri |
| CI hattı | Her birleştirmede kapıları çalıştırmak | Hiçbir değişikliğin kapıyı atlamaması; kapıların neyi içereceği |
| Hata kaydı | Hatayı düzeltmek | Hatanın türünü ve hangi aşamada kaçtığını izlemek |

---

## Sık Yapılan Üç Hata

- **QA test değildir.** QA bir test ekibine havale edildiğinde süreci sorgulamak kimsenin işi olmaz. Aynı türden hatalar her sürümde yeniden bulunur ve bu, test ekibinin başarısı diye okunur. Crosby bu yanılgıyı "kalite, kalite departmanında doğar" varsayımı olarak eleştirmişti; kaliteyi işi yapanlar üretir.
- **İyi süreç, doğru ürünün kanıtı değildir.** Süreç hata olasılığını düşürür, ama belirli bir sürümün doğru olduğunu göstermez. ISO 9001 belgesi ya da bir olgunluk seviyesi, sürecin varlığını belgeler; tek bir sürümün hatasız olduğunu değil. Ürünün doğruluğuna dair kanıt yine gözden geçirmeden, analizden ve testten gelir.
- **Shift-left otomatik olarak QA değildir.** Testi ve incelemeyi erkene çekmek değerlidir, ama çoğu zaman yalnızca QC'yi erkene taşır; [gereksinim incelemesi]({% post_url 2022-05-08-gereksinimler-ve-test-yedi-eksik-baglanti-efsanesi %}) de bir QC faaliyetidir. Hata daha ucuza bulunur ama yine de yapılmış olur. Yapılmamasını sağlayan, süreçteki bir değişikliktir.

---

## Küçük Bir Ekip İçin Başlangıç

Bağımsız bir QA birimi kurmak her ekip için gerçekçi değildir; süreci sorgulamaya başlamak için de gerekli değildir:

- **Kaçan her hata için iki soru sorun.** Hata kaydında "nasıl düzeltildi?" alanının yanına "neden daha önce yakalanmadı?" alanını ekleyin. Cevapları birkaç ayda bir toplu okuyun. Örneğin gereksinim hataları sistematik olarak sistem testinde yakalanıyorsa, sorun testte değil gereksinim incelemesindedir.
- **Kontrol listelerini kendi hatalarınızdan türetin.** Genel geçer yüz maddelik bir liste okunmaz. Kendi kaçan hatalarınızdan çıkan on madde ise inceleyenin aradığı şeyi değiştirir.
- **QC'yi makineye, QA'yı insana bırakın.** Derleme, statik analiz ve testler her değişiklikte otomatik koşsun; insan dikkati tekrar eden hatalara ayrılsın.
- **"Bitti"yi yazılı tanımlayın.** Bir işin bitmiş sayılması için gereken inceleme, test ve belge adımlarını yazmak en küçük QA adımıdır. Denetim de ilk olarak buna uyulup uyulmadığına bakar.
- **Denetimi dönüşümlü yapın.** Bir ekip üyesinin, başka bir ekibin yakın tarihli birkaç değişikliğini "tanımlı adımlar izlendi mi?" sorusuyla incelemesi küçük ölçekte bağımsızlık sağlar.
- **Hata sayılarını kişilere hedef olarak vermeyin.** Bulunan ya da kaçan hata sayısı birinin performans hedefine bağlandığında kayıtlar pazarlık konusu olur ve QA'nın dayandığı veri bozulur.

---

## Sonuç

QC ile QA birbirinin alternatifi değil. QC'yi ihmal eden bir ekip hatalarını sahada öğrenir. QA'yı ihmal eden ekip ise hatalarını bulmaya devam eder, ama aynı türden hataların neden tekrar ettiğini sormaz.

Girişteki toplantıya dönersek, "QA bunu nasıl kaçırdı?" sorusunun aslında iki parçası var: Testler bu hatayı neden yakalamadı? Süreç bu hatanın yazılmasına neden izin verdi? İlkine test ekibi cevap verebilir. İkincisine ancak bütün ekip birlikte cevap verebilir.

---

**Kaynaklar:**

- Philip B. Crosby — *Quality Is Free: The Art of Making Quality Certain* (McGraw-Hill, 1979).
- Philip B. Crosby — *Quality Without Tears: The Art of Hassle-Free Management* (McGraw-Hill, 1984).
- ISO 9000:2015 — *Quality management systems — Fundamentals and vocabulary* (3.3.6, 3.3.7).
- ISTQB — *Certified Tester Foundation Level Syllabus v4.0* (2023), bölüm 1.2.2.
- RTCA DO-178C — *Software Considerations in Airborne Systems and Equipment Certification* (2011).
- W. Edwards Deming — *Out of the Crisis* (MIT Press, 1986).
- Joseph M. Juran — *Juran's Quality Handbook* (McGraw-Hill; ilk baskısı 1951'de *Quality Control Handbook* adıyla).
- FAA — [Airworthiness Directive 2015-09-07, The Boeing Company Airplanes (787)](https://www.federalregister.gov/documents/2015/05/01/2015-10066/airworthiness-directives-the-boeing-company-airplanes).

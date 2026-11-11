---
title: "MIL-STD-1553B Anatomisi: Manchester Kodlama, RT Zamanlaması ve Sessiz Bug'lar"
subtitle: "Anatomy of MIL-STD-1553B: Manchester Coding, RT Timing, and the Silent Failure Modes"
background: "/img/posts/1.webp"
date: '2026-08-19 00:05:00'
layout: post
lang: tr
categories: [aviyonik]
tags: [aviyonik, gomulu, protokol, sertifikasyon]
mermaid: true
---

Aviyonik entegrasyonun en sinir bozucu bug sınıflarından biri, 1978'de tasarlanmış 1 Mbps'lik bir seri bus'ın etrafında toplanır. **MIL-STD-1553B** yaklaşık yarım asırdır F-16, C-130, tank ateş kontrolü ve modern insansız hava aracı sistemlerinde iş görmeye devam ediyor. Kimse "modern" değil diye onu değiştirmiyor; çünkü kırk yıllık saha kanıtı, yeni bir protokolün on yıllık laboratuvar kanıtından ağır basıyor. Yeni platformlarda AFDX (ARINC 664 P7) ve TSN geliyor, ama 1553 elden kolay çıkmıyor.

Bir not: standardın güncel revizyonu aslında **MIL-STD-1553C**'dir — 28 Şubat 2018 tarihli ve kapağında açıkça *"SUPERSEDING MIL-STD-1553B, 21 September 1978"* yazar. Ama sahada, ICD'lerde ve konuşma dilinde herkes hâlâ "1553B" der. Ben de yaygın kullanımı izleyip "1553B" diyeceğim; buna karşılık bu yazıdaki **bütün madde numaraları ve sayısal değerler 1553C'nin ASSIST üzerinden kamuya açık metninden** doğrulanmıştır. Böylece iddiaların hiçbiri için bana güvenmek zorunda değilsiniz — madde numarasını açıp bakabilirsiniz.

Sorun şu ki 1553B'nin sessiz köşeleri hâlâ mühendisleri ısırıyor. Ve bunun sebebi erişim değil: standardın DoD sürümü **ücretsizdir** — kapağında *"Approved for public release. Distribution is unlimited."* yazar ve ASSIST veri tabanından herkes indirebilir. (Paralı olan, SAE'nin ticari türevi AS15531'dir.)

Asıl sebep başka: 1553B'yi *okumak* ile *uygulamak* arasında geniş bir boşluk var. Standart kırk küsur sayfalık, yoğun ve normatif bir metindir; hangi maddenin sahada hangi hata moduna dönüştüğünü söylemez. Bu bilgi üretici application note'larına, el kitaplarına ve kurum içi ICD'lere dağılmıştır — hiçbir yerde toplu değildir. Üstüne Türkçe teknik kaynak neredeyse yok. Bu yazıda tam olarak o boşluğu doldurmaya çalışıyorum: fiziksel katmandan mesaj zamanlamasına, oradan entegrasyon aşamasında hayatı zehir eden beş sessiz hata moduna — hepsi kamuya açık kaynaklara ve madde numaralarına bağlı.

---

## Neden Manchester Biphase-L?

1553B fiziksel katmanda çift-redundant, ekranlı-örgülü ("shielded twisted pair"), transformatörle izole edilmiş bir kablo çifti üzerinden 1 Mbps'lik bir serial buştur. Standardın §4.3.3.2 maddesi kodlamayı *"Manchester II bi-phase level"* olarak tanımlar ve bit karşılıklarını net verir: mantıksal `1` **pozitif darbeyi negatif darbe izleyecek** şekilde (1/0), mantıksal `0` ise bunun tersi (0/1) olarak gönderilir. Yani alıcı, bir bit-zamanının ortasındaki geçişin **yönünden** biti çıkarır.

```
Bit değeri:   1        0        1        1        0
             ┌──┐     ┌──┐     ┌──┐     ┌──┐     ┌──┐
Sinyal:  ────┘  └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘  └────
                   ↑        ↑        ↑        ↑
              orta geçiş   orta geçiş  orta geçiş  orta geçiş
              (yüksek→düşük: "1")  (düşük→yüksek: "0")
```

Bu tercih rastlantı değildir. Manchester kodlamanın iki somut faydası vardır ve ikisi de transformatörle izole, emniyet-kritik bir bus için doğrudan koşuldur:

1. **Kendi kendini saatler.** Her bit-zamanının orta noktasında zorunlu bir geçiş vardır; alıcının DPLL'i saatini bu geçişten yeniler. NRZ tabanlı bir kodlama uzun `0...0` veya `1...1` dizilerinde saat kilidini kaybederdi — ve 1553'te ayrı bir saat hattı yoktur.
2. **DC-serbest.** Her bit-zamanı bir pozitif ve bir negatif yarımdan oluştuğu için ortalama değer sıfırdır. Bus transformatörle kuplajlıdır ve transformatör DC geçirmez; dolayısıyla DC bileşeni olan bir kodlama bu fiziksel katmanda zaten çalışamazdı.

Buna karşılık bir de bedeli vardır ve bu bedel sahada karşınıza çıkar: biphase-**L** *level-sensitive*'dir, yani `1`'i `0`'dan ayıran şey geçişin **yönüdür**. Kablo çiftini ters bağlarsanız her bit tersine döner; sync desenleri de bozulacağı için terminal hiçbir şeyi çözemez. 1553 kablolamasında hat polaritesinin (ve konnektörde hangi pinin pozitif olduğunun) titizlikle korunmasının sebebi budur — "nasılsa diferansiyel, ters bağlansa ne olur" düşüncesi burada çalışmaz.

İkinci bedel bant genişliğidir: bit başına iki sinyal seviyesi gerektiği için 1 Mbps'lik veri, 1 MHz'lik temel bileşen yerine **2 MHz**'e uzanan bir spektrum işgal eder. 1978'de bu bir sorun değildi; bugün de değil.

---

## Word Anatomisi: 3 + 16 + 1

1553B'deki her şey **word** birimi üzerinden dönüyor. §4.3.3.4 word boyunu tanımlar: 16 bit, artı sync dalga formu, artı parity biti — toplam **20 bit-zamanı**. 1 MHz'lik bit hızında bu tam olarak **20 µs** eder:

| Alan | Uzunluk | Açıklama |
|---|---|---|
| Sync | 3 bit-zamanı | Word tipini gösterir (aşağıda) |
| Payload | 16 bit | Address, veri, kontrol bitleri |
| Parity | 1 bit | **Odd** parity (tek eşlik) |

Sync alanı Manchester **kuralına uymaz** — ve bu kasıtlıdır. Normal bir bit-zamanında orta noktada bir geçiş olmak zorundadır; sync bunun tersini yapar ve **1.5 bit-zamanı boyunca aynı seviyeyi** tutar. Bu, kodlamanın kural ihlalidir; tam da bu yüzden alıcı sync'i asla normal bir bit'le karıştırmaz. İki sync deseni vardır:

- **Komut/Status sync:** 1.5 µs pozitif, ardından 1.5 µs negatif (H-L)
- **Data sync:** 1.5 µs negatif, ardından 1.5 µs pozitif (L-H)

Yani alıcı sync'i çözer çözmez word'ün bir **komut/status** mı yoksa **data** mı olduğunu bilir. Bu ayrım kritiktir: bir Bus Controller, Remote Terminal'in gönderdiği word'ün status word mü yoksa data mı olduğunu payload'a bakmadan sync'ten anlar.

Parity **odd** parity'dir (§4.3.3.5.1.6: son bit, kendisinden önceki 16 bit üzerinde tek eşlik). Yani payload'daki bitlerin toplamı ile parity bitinin toplamı tek sayı olur. Tek bit hatasını yakalar; çift bit hatasını yakalayamaz. 1553B'nin hata tespiti temelde iki katmandır: **Manchester kural ihlali** (bir bit-zamanı içinde geçiş olmaması) ve **parity**. Bunlar birlikte tek bir bit hatasını neredeyse kesin, iki bit hatasını çoğunlukla yakalar.

---

## Üç Word Tipi: Command, Status, Data

Sync + payload birleşince üç word tipi çıkar. Anatomileri şöyledir:

**Komut Word (BC → RT):**

```
  bit:   15 14 13 12 11 | 10  |  9  8  7  6  5  | 4  3  2  1  0
        ┌──────────────┬─────┬──────────────────┬──────────────┐
        │  RT Address  │ T/R │    Subaddress    │  Word Count  │
        │   (5 bit)    │(1b) │     (5 bit)      │   / Mode     │
        │   0..30      │     │    0..31         │   (5 bit)    │
        └──────────────┴─────┴──────────────────┴──────────────┘
   RT Address 31 (0b11111) = broadcast
   T/R = 0 (Receive, BC → RT) veya 1 (Transmit, RT → BC)
   Subaddress 0 veya 31 = mode command (word count alanı komut kodu olur)
   Word count = 0 aslında 32 word demektir.
```

**Status Word (RT → BC):**

```
  bit:   15 14 13 12 11 | 10  9  8  7  6  5  4  3  2  1  0
        ┌──────────────┬────────────────────────────────────┐
        │  RT Address  │  ME  IN SRQ  RSV RSV RSV  BR  BSY   │
        │   (5 bit)    │  SF  DBC  TF                        │
        └──────────────┴────────────────────────────────────┘
   ME  = Message Error (parite/kodlama/format hatası tespit edildi)
   IN  = Instrumentation (her zaman 0; T/R ile ayrışmayı destekler)
   SRQ = Service Request
   BR  = Broadcast Command Received
   BSY = Busy
   SF  = Subsystem Flag
   DBC = Dynamic Bus Control Acceptance
   TF  = Terminal Flag
```

**Data Word:** Sync `L-H`, ardından 16 bit uygulama verisi, ardından odd parity. Byte sıralaması standartta belirtilmez — bu yüzden 1553B üzerinde 16-bit'ten büyük veri taşırken (örneğin float32 veya uint32) hangi word'ün **most significant**, hangisinin **least significant** olduğu ICD'de (Interface Control Document) sabitlenmek zorundadır. Sırayı yanlış anlamak sessiz bir hatadır ve integrationdayken *"aynı sayı ama farklı"* diye üç gün kaybettirir.

---

## Zamanlama Disiplini: Bir Mesajın Tam Ömrü

Bir 1553B mesajının hayatı milisaniye değil **mikrosaniye** ölçeğinde ölçülür. Standart üç kritik zaman aralığı tanımlar:

- **Response Time (yanıt süresi) — §4.3.3.8:** RT, geçerli bir komut word'üne **4,0 – 12,0 µs** arasında yanıt vermek zorundadır. Süre, son word'ün orta-bit sıfır geçişinden status word sync'inin orta-bit sıfır geçişine kadar ölçülür.
- **Intermessage Gap (mesaj arası boşluk) — §4.3.3.7:** **Bus controller**, mesajlar arasında en az **4,0 µs** boşluk sağlamak zorundadır. Dikkat: bu bir *BC* yükümlülüğüdür, RT'nin değil.
- **No-Response Timeout — §4.3.3.9:** Bir terminalin, yanıt gelmediğine hükmetmeden önce bekleyeceği **minimum** süre **14,0 µs**'dir. Değer tesadüf değildir: 12 µs (azami meşru response time) üzerine 2 µs marj.

BC-RT (BC'nin RT'ye veri gönderdiği) tipik bir tek-mesaj işleminin toplam süresi şöyle çıkar:

$$
T_{msg} = T_{command} + N_{data} \cdot T_{data} + T_{response} + T_{status}
$$

Standart, komut ile ilk data word arasında ve data word'ler arasında ekstra gap gerektirmez — word'ler sırt sırta gelir. RT ise komutu (ve data'yı) aldıktan sonra 4–12 µs "düşünüp" status'unu yayar. Worst-case (12 µs) response time varsayıp 32-word'lük maksimum bir BC-RT mesajı için:

$$
T_{max} = 20\,\mu s + 32 \cdot 20\,\mu s + 12\,\mu s + 20\,\mu s = 692\,\mu s
$$

Yani tek bir mesaj yaklaşık 0.7 ms sürer. Bunun ardından minimum 4 µs gap, sonra bir sonraki mesaj. 32-word data'daki bilgi yükü 32 × 16 = 512 bit; toplam kanal işgali 696 µs; bu da yaklaşık **735 kbps**'lik uygulama katmanı bant genişliği demektir. Bu, **teorik tavan**dır ve yalnızca bus'ı ardışık 32-word'lük mesajlarla doldurduğunuzda geçerlidir. Gerçek bir BC frame'i asla böyle görünmez: mesajların çoğu birkaç word'lüktür, ve word count küçüldükçe sabit overhead (komut + status + response time + gap ≈ 56 µs) baskın hale gelir. Tek data word'lük bir mesajda kanal işgali 76 µs'ye karşılık yalnızca 16 bit taşınır — yani ~210 kbps. 1553B'de bant genişliğinin asıl düşmanı bit hızı değil, **mesaj başına sabit overhead**tir; bu yüzden iyi bir ICD, seyrek güncellenen sinyalleri tek tek mesajlara dağıtmak yerine gruplayarak taşır.

---

## Dual Redundancy: Ne Zaman Bus A'dan Bus B'ye Geçilir?

1553B'nin en önemli emniyet özelliği çift bus'tır: aynı RT'ler **her iki bus'a da** (A ve B) transformatörle bağlıdır. Herhangi bir anda yalnızca bir bus aktiftir. BC, bir mesajı A'da başlatır; RT o bus'tan cevap verir. Peki BC, hangi durumda alternate bus'a geçer?

Standart bir "otomatik" bus anahtarlama algoritması **dayatmaz**; bunu BC yazılımına bırakır. Yaygın strateji şudur:

<div class="mermaid">
graph TD
    A[BC komutu Bus A üzerinde gönderir] --> B{Geçerli status word geldi mi?}
    B -->|Evet - ME=0| C[Başarılı - Bus A'da kal]
    B -->|Hayır - 14 µs timeout| D[Aynı komutu Bus B'de tekrarla]
    B -->|Evet - ME=1| D
    D --> E{Geçerli status word geldi mi?}
    E -->|Evet - ME=0| F[Başarılı - bundan sonra Bus B ile başla]
    E -->|Hayır ya da ME=1| G[RT'yi arızalı işaretle ve raporla]
    style C fill:#cfe8cf,stroke:#2e7d32,stroke-width:2px
    style F fill:#f6edc1,stroke:#b39a2b,stroke-width:2px
    style G fill:#f6c1c1,stroke:#c0392b,stroke-width:2px
</div>

Kritik detay: standart, bus'ları arasında **hangisinin tercih edildiğinin** BC'nin bilmesini ister. BC herhangi bir mesajı önce **bir** bus'ta dener; başarısız olursa diğerinde tekrar dener; ikinci deneme de başarısız olursa **RT'yi** arızalı olarak işaretler. Buradaki hata modu şu: BC yazılımı "hep A'da başla" derse ve bus A koparsa, her mesaj önce A'da 14 µs timeout ile başarısız olur, sonra B'de yeniden yapılır. Bu tek başına bant genişliğini yarıya indirir ve latency'yi iki katına çıkarır. İyi BC yazılımları son başarılı bus'ı hatırlar ve onunla başlar.

---

## Sessiz Bug'lar: Entegrasyon Laboratuvarındaki Beş Ölümcül Detay

Aşağıdakiler, standardın ve üretici uygulama notlarının satır aralarında kalan ama entegrasyon aşamasında günler yiyebilen kalıplardır. Hepsi açık kaynaklardan — standardın kendisi, MIL-HDBK-1553A ve terminal üreticilerinin application note'ları — izlenebilir.

### 1. Broadcast + Status: Kim Yanıt Verecek?

Önce adresin kendisi: §4.3.3.5.1.2'ye göre sync'i izleyen beş bit RT adresidir, her RT'ye **benzersiz** bir adres atanır, ve ondalık **31 (`11111`) benzersiz adres olarak atanamaz** — broadcast opsiyonu kullanılıyorsa RT'ye kendi adresine *ek olarak* ortak adres 31 atanır. Yani kullanılabilir benzersiz RT adresi sayısı 32 değil **31**'dir (0–30).

Broadcast komutunu **hiçbir RT status word ile yanıtlamaz**. Standardın dili nettir: RT, mesaj doğrulamasından sonra status word'ündeki broadcast-received bit'ini set eder **ve status word'ü göndermez**. Amaç açık: onlarca RT aynı anda cevap verirse bus'ta çakışma olur. BC, o bit'i daha sonra ayrı bir *transmit status word* mode komutuyla sorgular.

Sessiz bug şu: broadcast'a status beklemeyen bir BC, "no-response timeout" 14 µs boyunca bekler mi beklemez mi? Standart demez ki *"broadcastta timeout uygulanmaz"*. Uygulamacılar iki farklı yol tutar: (a) broadcast sonrası timer'ı devreye sokmaz, hemen sonraki mesaja geçer; (b) genel kurala göre 14 µs bekler. İkinci yaklaşım güvenlidir ama tüm broadcast'larda 14 µs boşuna harcar. Aynı BC'yi farklı platforma taşırken bu farkın yazılıma girdiği yerde hesap kaymış olur.

### 2. "Invalid" ile "Illegal" Aynı Şey Değildir — ve Illegal Tespiti Opsiyoneldir

Burası 1553B'nin en çok karıştırılan köşesi. İki tamamen farklı mekanizma benzer isimler taşır:

**Invalid command (geçersiz komut) — §4.4.3.3:** Word, temel doğrulama testlerinden geçemez — sync deseni bozuk, Manchester kural ihlali var, bit sayısı tutmuyor ya da parity yanlış. Standardın dili burada kesindir: RT böyle bir komut word'üne **yanıt vermeyecektir**. Status word hiç gönderilmez, BC 14 µs sonra timeout görür. Belirsizlik yok.

**Illegal command (yasa dışı komut) — §4.4.3.4:** Word bütün doğrulama testlerinden **geçer** — kodlaması kusursuzdur — ama subaddress/mode alanı, word count alanı ya da T/R biti o RT'de **uygulanmamış** bir kombinasyonu gösterir. Örneğin RT yalnızca SA=1..5 tanımlıyken BC'nin SA=17'ye yazmaya çalışması.

Kritik nokta, standardın kendi cümlesinde: *"The RT designer has the option of monitoring for illegal commands."* Yani **illegal command tespiti opsiyoneldir.** Aynı madde iki yolu da tarif eder:

- RT bu opsiyonu **uygulamışsa**: illegal komutu ve doğru sayıda geçerli data word'ü aldığında *yalnızca status word* ile yanıt verir, **Message Error (ME)** bit'ini set eder ve aldığı bilgiyi **kullanmaz**.
- RT bu opsiyonu **uygulamamışsa**: komutu meşru sayar, protokolü normal işletir. Sonuç, uygulama katmanına sessizce akan **çöp veridir** — hiçbir hata bayrağı kalkmadan.

Standart ayrıca sorumluluğu net bir yere koyar: *"It is the responsibility of the bus controller to assure that no illegal commands are sent out."* Yani illegal komut göndermemek **BC'nin** işidir; RT'nin yakalaması bir güvenlik ağı bile değil, sadece bir opsiyondur.

İşte gerçek hata modu bu. Aynı bus üzerinde iki farklı üreticinin RT'si varsa, ICD'de tanımsız bir subaddress'e yapılan aynı hatalı BC yazımı:

- Üretici A'nın RT'sinde → status word, ME=1. BC hatayı görür, loglar, izole eder.
- Üretici B'nin RT'sinde → normal status, ME=0. BC **hiçbir şey görmez.** Çöp veri uygulama katmanına sessizce akar.

İkinci durum birincisinden kat kat tehlikelidir; çünkü ortada tespit edilen bir arıza yoktur, yalnızca *yanlış veri* vardır. ME bit'inin kendisi bu boşluğu kapatmaz: §4.3.3.5.3.3'e göre ME bit'ini **bütün** RT'ler uygulamak zorundadır, ama onu *illegal command* için set etmek yalnızca opsiyonu uygulayan RT'nin yaptığı bir iştir.

Pratik sonuç: BC'nizin fault isolation mantığını yazarken "ME bit'i gelmedi, demek ki komut meşruydu" varsayımını **kuramazsınız**. Her RT'nin illegalization uygulayıp uygulamadığı ICD'de tek tek yazılmalıdır.

### 3. RT Address Çakışması ve Odd Parity Aldatması

Önce bir kavram ayrımı: command word'ün sonundaki odd parity biti, **word'ün 16 payload biti üzerindeki** parity'dir — standart bunu tanımlar. Bahsedeceğim şey farklıdır ve standardın kendisinde değil, **ticari 1553 terminal bileşenlerinin yerleşik kuralında** yaşar.

RT address 5 bittir ve tipik olarak RT donanımı üzerindeki bir "address plug" ile fiziksel jumper/pin olarak ayarlanır. DDC, Sital, NAI gibi üreticilerin terminal entegrelerinde bu 5 adres pininin (`RTAD4..RTAD0`) yanına bir **altıncı pin** konur: `RTADP` — *RT Address Parity*. Kural, `RTAD4..RTAD0` ve `RTADP` içindeki mantıksal `1`'lerin toplamının **tek** olmasıdır. Örneğin RT adresi 0 (`00000`) isteniyorsa, `RTADP` mantıksal `1`'e çekilmelidir.

Parity'yi yanlış ayarlarsanız sonuç serttir ve teşhisi zordur: **RT kendi adresine gelen hiçbir mesajı tanımaz.** Bus'ta tamamen sessiz kalır. Belirti, "RT ölü" gibi görünür — güç var, LED yanıyor, ama BC her komutta timeout alıyor. Kablo, transceiver ve yazılım saatlerce boşuna kontrol edilir; sorun tek bir jumper'dadır.

Aynı adresi iki RT'ye vermek daha sinsi bir bug'dır. İki RT aynı bus'ta aynı anda status word göndermeye başlar. Manchester kodlamada ortada geçiş yönü çakışırsa alıcı için **kural ihlali** olur; BC bunu encoding hatası olarak yakalar ve status'u geçersiz sayar. Ama iki status word'ün payload'ları tesadüfen aynıysa (aynı adres alanı, tüm bayraklar sıfır), bus üzerindeki toplam sinyal okunabilir çıkabilir ve BC hiçbir şey fark etmez. Entegrasyonda "arada bir garip data" diyorsanız, ilk kontrol edeceğiniz şey her RT'nin address plug'ıdır — hem değeri hem parity'si.

### 4. Bus-Coupler Stub Uzunluğu ve Yansıma

Fiziksel katman detayı, ama fatura yazılıma kesilir. Standart iki bağlantı yöntemi ve iki farklı stub uzunluğu sınırı tanımlar:

| Bağlantı | Stub uzunluğu | Madde | Neden |
|---|---|---|---|
| **Transformer-coupled** | 20 feet'i (≈ 6,1 m) aşmamalı | §4.5.1.5.1 | Ana bus üzerindeki empedans yükünü sınırlar; kuplaj transformatörü yansımayı sönümler |
| **Direct-coupled** | 1 feet'i (≈ 30 cm) aşmamalı | §4.5.1.5.2 | Kuplaj transformatörü yok; stub doğrudan yük olarak görünür, yansıma çok daha sert |

Burada ince ama önemli bir dil ayrıntısı var: her iki maddede de standart *"should not exceed"* der — **"shall" değil.** Yani bunlar zorlayıcı gereksinim değil, **tavsiye**dir. Buna karşılık aynı maddelerin devamı ("*If a transformer coupled stub is used, then the following shall apply*") kuplaj transformatörünün sarım oranından direct-coupled bağlantıdaki 55,0 Ω ± %2 izolasyon direncine kadar bir dizi **shall** getirir. Pratikte anlamı şudur: stub'ı uzatmak sizi resmen "uygunsuz" yapmaz, ama sinyal bütünlüğü gereksinimlerini (§4.5.1.5.1.4 stub gerilim aralığı gibi) sağlayamaz hale gelirseniz *orada* uygunsuz olursunuz. Transformer-coupled bağlantı bu yüzden neredeyse her zaman tercih edilir; direct-coupled yalnızca kutu içi çok kısa mesafelerde anlamlıdır.

Test tezgâhında bu sınırların aşılması çok kolaydır: laboratuvar masasının üzerinde "geçici" bir uzatma kablosuyla 8 metrelik bir transformer-coupled stub yaptığınızda, yansıma nedeniyle bit hata oranı yükselir. Belirti sinsidir — sistem *çoğu zaman* çalışır, ama arada ME bit'i set olan status'lar görürsünüz. Doğru tanı yöntemi osiloskopu stub'ın RT ucuna koyup dalga formundaki distorsiyona ve overshoot'a bakmaktır. Yazılım penceresinden bakıldığında ise bu tablo "şu RT arada bir flake atıyor" gibi görünür ve saatlerce boşuna yazılım debug'ı yapılır. 1553B'de aralıklı (intermittent) hataların ilk şüphelisi her zaman kablodur.

### 5. Terminal Flag ve BIT Sonrası Yanlış Sinyal

Status word içindeki **Terminal Flag (TF)** bit'i, RT'nin kendi Built-In Test (BIT) sonucunda bir arıza bulduğunu bildirir. Standart TF'yi tanımlar, ama onu tam olarak *hangi koşulda* set edeceğinizi RT tasarımcısına bırakır — ve asıl sessiz bug, güç açılışı penceresinde saklıdır.

Standart, RT'nin PBIT (Power-up BIT) tamamlanana kadar bus'ta nasıl davranacağını zorunlu kılmaz. İki makul tasarım tercihi vardır ve ikisi de sahada görülür:

- RT, PBIT bitene kadar komutlara **hiç yanıt vermez.** BC bunu "no response" olarak kaydeder.
- RT, PBIT süresince status'unu **TF=1** (ya da BSY=1) ile yayar. BC bunu "RT arızalı/meşgul" olarak kaydeder.

İki davranış BC'nin arıza yönetim mantığında **farklı kod yollarına** düşer. Aynı bus üzerinde farklı üreticilerin (ya da aynı üreticinin farklı firmware kuşaklarının) RT'leri varsa, tamamen normal olan bir güç açılışı sekansı log'da iki farklı olay tipi üretir. Bunu önceden bilmeyen bir BC, açılıştaki geçici "no response"u kalıcı arıza sayıp RT'yi devre dışı bırakabilir. Doğru yaklaşım, güç açılışı için tanımlı bir "RT hazır olma" penceresi belirlemek ve bu pencere içindeki no-response/TF olaylarını arıza sayacına yazmamaktır — ama bu pencerenin süresi de ICD'de yazılmalıdır, çünkü standart onu da söylemez.

---

## Bus Analyzer Neyi Görür?

Standart, BC ve RT'nin yanına üçüncü bir terminal tipi daha tanımlar: **bus monitor (BM)**. BM bus'a hiç müdahale etmez, yalnızca dinler — bu yüzden 1553B debug'ının temel aracıdır. Pratikte bunu ya adanmış bir analiz kartı (Alta Data Technologies, DDC, AIM gibi üreticilerden) ya da BM modunda çalışan bir terminal sağlar. Tipik bir log en yalın haliyle şuna benzer:

```
Time (µs)   Bus  Word Type    Content                Notes
─────────   ───  ──────────   ────────────────────   ─────
00000.000    A   Command      RT=05 T/R=0 SA=03 WC=04
00000.020    A   Data         0x1234
00000.040    A   Data         0x5678
00000.060    A   Data         0xABCD
00000.080    A   Data         0xEF01
00000.106    A   Status       RT=05 ME=0 BR=0 TF=0    Response gap: 6 µs
00000.126    A   [gap]                                Intermessage gap: 4 µs
00000.130    A   Command      RT=07 T/R=1 SA=01 WC=01
...
```

İyi bir analiz oturumunda dikkat edilecek şeyler:

- **Response time dağılımı:** 4–12 µs sınırının hangi tarafında yığılıyor? Ortalama 6-8 µs olmalıdır. 11 µs'a yakın değerler, RT'nin marj erozyonu yaşadığının işaretidir; sıcaklık ve gerilim ile daha da artabilir.
- **Intermessage gap:** BC'nin ürettiği gap'ler bazen 4 µs'a tam oturur. Marjı görmek için 6-8 µs planlanmalıdır; aksi halde bir RT geç yanıt verdiğinde BC bir sonraki komutu erken başlatır ve iki word bus üzerinde çakışır.
- **ME (Message Error) sayacı:** Sağlıklı bir bus'ta günde bir kaç ME görebilirsiniz — bu genelde geçici gürültü kaynaklıdır. Saatte on ME sinyalinizin fiziksel sorununa işarettir.
- **Bus anahtarlaması:** BC log'unda "aynı komut A'da timeout, B'de başarılı" örüntüsü ardışık çıkıyorsa bir RT'nin A tarafındaki stub'ında sorun vardır. Yazılım "arıza toleranslı çalışıyor" gibi görünür ama arıza sabitlenmiştir.

---

## Standardın Sessiz Kaldığı Yerler

Standardın kendisi şaşırtıcı derecede kısadır: 1553C, ekler dahil kırklı sayfalarda biter. Buna karşılık onu *yorumlayan* el kitabı MIL-HDBK-1553A birkaç yüz sayfadır. Aradaki fark tesadüf değil, tasarımın kendisidir — ve standardın önsözü bunu itiraf eder: aynı standarda uyan iki bus arasında, uygulama gereksinimleri ve **"designer options"** yüzünden farklar bulunabileceğini, sistem tasarımcısının BC donanım ve yazılımını bu farkları karşılayacak şekilde tasarlaması gerektiğini söyler.

Yani 1553B'de karşılaştığınız uyumsuzlukların çoğu bug değil, **standardın bilerek açık bıraktığı seçim noktalarıdır.**

Standardın belirsiz bıraktığı şeyler:

- Data word'ler için byte/word sıralaması (endianness).
- Broadcast sonrası BC'nin bekleme davranışı.
- Illegal command tespitinin uygulanıp uygulanmayacağı (illegalization opsiyoneldir).
- RT'nin PBIT süresince bus'ta nasıl davranacağı.
- Terminal Flag'in tam anlamı ve set/reset koşulları.
- Bus anahtarlama algoritması.
- 32 word'ü aşan büyük veri transferi (bunun için mesajı chunk'lara bölmek uygulama katmanı sorumluluğudur).
- RT-RT transferinin (bir RT'den diğer RT'ye doğrudan) BC tarafından nasıl orkestre edileceği (standart mesajı tanımlar ama zamanlama marjını uygulamaya bırakır).

Bu yüzden 1553B bir *protokol* olduğu kadar bir *sözleşme kültürüdür*. Her platform için ayrıntılı bir **Interface Control Document** (ICD) yazılır; ICD burada sayılan tüm belirsizlikleri tek tek kapatır. İki farklı ICD birbirine ait iki bileşen aynı bus'a takıldığında uyuşmazlıklar entegrasyon sırasında saatler-günler süren tuhaf davranışlar olarak ortaya çıkar. Deneyimli 1553B mühendisleri bir ICD'yi ilk okuduklarında "bu belirsiz" dedikleri yerlerin listesini çıkarır ve entegrasyon başlamadan önce netleştirir.

---

## Pratik Tavsiyeler

Bugün 1553B ile çalışan biriyseniz, yukarıdaki hata modlarından çıkan pratikler:

1. **ICD'yi standarttan daha ciddiye alın.** Standardın sessiz bıraktığı her nokta ICD'de netleştirilmelidir; yoksa entegrasyonda tartışma kaynağı olur.
2. **Response time'ı hep 10 µs üstü marjla test edin.** Sınırda test etmek üretimde sıcaklıkla veya eskiyen bileşenle patlayan zaman-bomba bug'ları örter.
3. **Intermessage gap'i 4 µs'a değil 6 µs'a bekleyin.** Bant genişliğinden çok az kaybedersiniz, marj kazanırsınız.
4. **Broadcast sonrası davranışı yazılım katmanınızda açıkça sabitleyin.** Kod yorumunda ("neden burada 14 µs bekliyorum" veya "neden hemen ilerliyorum") gerekçesini yazın.
5. **Her RT'nin illegalization uygulayıp uygulamadığını ICD'de tek tek yazın.** Uygulamayan bir RT, hatalı komuta sessizce çöp veriyle karşılık verir; ME bit'inin yokluğu "komut meşruydu" anlamına gelmez.
6. **Bus analyzer log'unu yorumlamayı öğrenin.** ME sayacı ve response time histogramı olmadan 1553B debug'ı yapılamaz. En az bir kez bir analyzer'ı bir gün boyunca elinize alıp bilerek bug enjekte edin.
7. **Endianness'i bir kez tespit edin, ICD'ye yazın, sonra unutmayın.** float32 taşıma sırasında word sırasını yanlış anlamak en yaygın "ama sayı doğru neden değer yanlış" bug'ıdır.

---

## Kapanış

1553B, aviyonik dünyanın en dayanıklı standartlarından biridir. Onu dayanıklı kılan şey mükemmelliği değil — belirsizliklerine rağmen kırk yıl boyunca **uygulama alanında** işlemeye devam etmesidir. Yeni bir protokol seçtiğinizde onun kaç saha saati biriktirdiğini soran mühendis, aslında 1553B'ye baktığında ne göreceğini biliyor demektir: her hata modu görülmüş, her belirsizlik ICD ile kapatılmış, her uygulama akıllıca ele alınmış. Sıradaki neslin — TTP/C, TSN, AFDX — bu birikime yaklaşması onlarca yıl alacak.

Standart 47 sayfa. El kitabı 459 sayfa. Sizinki, uygulama kararlarını yazdığınız kendi notlarınızdır — kısa tutun ama yazın; on yıl sonra o notlar sizi kurtarır.

---

## Kaynaklar

- **MIL-STD-1553B ve Notice 2.** *Digital Time Division Command/Response Multiplex Data Bus.* U.S. Department of Defense. Ana normatif belge; DLA'nın ASSIST veri tabanından aranabilir: <https://quicksearch.dla.mil/>.
- **MIL-STD-1553C (28 Şubat 2018).** MIL-STD-1553B'yi supersede eden güncel revizyon. Word formatları, RT adresi ve parity kuralları için: [tam metin PDF](https://www.astronics.com/docs/default-source/ballard-technology/certificates/mil-std-1553c-dla.pdf).
- **MIL-HDBK-1553A (1988).** *Multiplex Applications Handbook.* Standardı yorumlayan, standardın kendisinden çok daha uzun resmi el kitabı. ASSIST üzerinden erişilebilir.
- **SAE AS15531.** 1553B'nin ticari (SAE) eşdeğeri. **SAE AS4111 / AS4112**: RT ve BC doğrulama test planları.
- **"Review and Rationale of MIL-STD-1553 A and B."** Standardın tasarım gerekçelerini anlatan klasik metin: [milstd1553.com PDF](https://www.milstd1553.com/wp-content/uploads/2012/12/MIL-STD-1553B.pdf).
- **MIL-STD-1553 Designer's Guide — Notice II ve Overview bölümleri.** Illegal command opsiyonelliği ve "responding in form" davranışı için: <https://www.milstd1553.com/resources-2/desginers-guide/notice-ii/> ve [Overview](https://www.milstd1553.com/resources-2/desginers-guide/designers-notes/mil-std-1553-overview/).
- **AIM GmbH, MIL-STD-1553 Tutorial.** Zamanlama ve stub uzunluğu tavsiyeleri: <https://www.aim-online.com/products-overview/tutorials/mil-std-1553-tutorial/>.
- **Alta Data Technologies, MIL-STD-1553 Tutorial and Reference.** Bus analyzer perspektifi ve ME bit kullanımı: [PDF](https://www.altadt.com/wp-content/uploads/dlm_uploads/2014/09/Alta_MIL-STD-1553-Tutorial-and-Reference.pdf).
- **Terminal üretici veri sayfaları — RT adres parity pini.** `RTAD4..RTAD0` yanındaki `RTADP` (RT Address Parity) pin kuralı üretici entegrelerinde tanımlıdır; örn. [North Atlantic Industries FTJ modül sayfası](https://www.naii.com/model/FTJ) ve [DDC teknik SSS](https://www.ddc-web.com/en/support/technical-support/faqs).
- **AIM GmbH, MIL-STD-1553 Overview (v2.3).** Kuplaj yöntemleri, stub uzunlukları ve word formatları için derli toplu bir özet: [PDF](https://www.aim-online.com/wp-content/uploads/2019/01/aim-ovw1553-u.pdf).
- **Bloomy, MIL-STD-1553B Technical Brief.** Broadcast davranışı ve status word bit tanımları: <https://www.bloomy.com/support/blog/mil-std-1553b-technical-brief>.

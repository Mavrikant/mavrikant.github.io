---
title: "Lockstep CPU Mimarileri: Cortex-R5 DCLS, CCM-R5 ve DAL A Donanımı Neden Böyle Görünür?"
subtitle: "Dual-Core Lockstep on Cortex-R5 / TMS570 and the Math Behind Safety-Critical Silicon"
background: "/img/posts/2.webp"
date: '2026-06-09 09:00:00'
layout: post
lang: tr
mermaid: true
---

Emniyet kritik bir kart üzerinde çalıştıysanız tanıdık bir hisle karşılaşmışsınızdır: datasheet "iki çekirdek" diyor ama yazılım yalnızca bir çekirdek görüyor. Linker script tek bir vector tablosuna işaret ediyor, OS tek CPU üzerinde koşuyor, breakpoint'i koyduğunuz yerde bir tane PC değişiyor. İkinci çekirdek nerede?

İkinci çekirdek **görmemeniz için** oradadır. Ona "checker", "shadow" veya "redundant" core deniyor; sizin gördüğünüz "master" CPU'nun yaptığı her şeyi iki saat çevrimi gecikmeyle tekrar yapıyor ve her saat darbesinde sonuçları sessizce karşılaştırıyor. Eşleşmezse devreye giren tek bir donanım sinyali — TI Hercules'te `ESM_ERR`, ARM TCLS'te `nERRIRQ` — sistemi güvenli duruşa götürüyor.

Bu yazıda bu "görünmez ikiz" mimarisinin neden böyle kurulduğunu inceleyeceğiz: Cortex-R5 tabanlı **Dual-Core Lockstep (DCLS)** mimarisinin saat seviyesinde nasıl çalıştığını, **TMS570** ailesindeki **CCM-R5** karşılaştırma modülünün iki çevrimlik kaymayı (skew) neden seçtiğini, IEC 61508 / ISO 26262 / DO-254 dünyasının istediği **diagnostic coverage** (DC) sayısının DCLS ile nasıl ilişkilendiğini, ve bu mimarinin **çözmediği** problem olan **common-cause failure**'lara karşı tasarımcının ne yapmak zorunda olduğunu konuşacağız.

Sonunda, "iki çekirdek koyalım, oylarız" cümlesinin neden sandığınızdan daha derin bir mühendislik kararı olduğunu görmüş olacaksınız.

---

## Neden tek bir CPU yetmiyor?

Önce "neyden" korunduğumuzu netleştirelim. Tek bir CPU çekirdeği, doğru üretilmiş bir silikon üzerinde bile, çalışırken üç sınıf hataya açıktır:

1. **Geçici (transient) hatalar.** Atmosferik nötron veya alfa parçacığı bir flip-flop'un durumunu çevirir (SEU — Single Event Upset), bir lojik geçidi anlık olarak yanlış çıkış üretir (SET — Single Event Transient). Yer seviyesinde bile, 28 nm ve altı düğümlerde silikon-cm²-saat başına FIT (Failures In Time) oranları ölçülebilir seviyededir.
2. **Aralıklı (intermittent) hatalar.** Marjinal bir transistör, sıcaklık veya gerilim sınırında yanlış çalışır; soğuduğunda tekrar düzelir. EMI maruziyeti veya beslemedeki anlık çökme aynı kategoriye girer.
3. **Kalıcı (permanent) hatalar.** Bir net stuck-at-1 olur, bir SRAM bit kalıcı bozulur, bir gate elektromigrasyon nedeniyle açık devre olur.

Yazılım tarafında "watchdog'u sıkıştırırım, görevler kontrol toplamı yapar" demek bu sınıfların *bazılarını* yakalar ama hiçbirini garantilemez. Asıl problem şudur: **bir CPU kendi kendi sonucunu doğrulayamaz.** Aritmetik birim 2+2'ye 5 derse, o sonucu okuyan kontrol akışı da aynı bozuk birime güvenmek zorundadır. Bağımsız bir gözlemciye ihtiyacımız var.

En basit bağımsız gözlemci nedir? Aynı işi yapan ikinci bir CPU.

---

## DCLS'nin omurgası: aynı girdi, sapmasız aynı çıktı

**Dual-Core Lockstep** mimarisinin önermesi tek satırla özetlenir:

> İki özdeş CPU'ya, aynı saat ve aynı girdiler verilirse, her saat çevriminde aynı çıktıları üretirler. Üretmiyorlarsa, en az biri hatalıdır.

Pratiğe inerken bu önerme bir dizi soru doğurur: Hangi seviyede karşılaştıracaksınız? Tüm sinyalleri mi, sadece dış bus arayüzünü mi? Karşılaştırıcı (comparator) nerede oturacak ve onun da arızalanabileceğini hesaba kattınız mı? İki çekirdek aynı silikondaysa, gerçekten "bağımsız" mıdır? İki çekirdek **birbirini** mi karşılaştırıyor yoksa bir üçüncü blok mu?

TMS570 / Cortex-R5 DCLS'in tasarım kararları bu sorulara verilen somut yanıtlardır. Sırasıyla görelim.

### Karşılaştırma seviyesi: bus arayüzü, iç boru hattı değil

Cortex-R5'in iç boru hattındaki her flip-flop'u dışarı çıkarıp karşılaştırmak fiziksel olarak imkânsız. Bunun yerine **bus düzeyinde** karşılaştırma yapılır: çekirdeğin AXI master arayüzünde gördüğünüz tüm sinyaller (`AWADDR`, `AWVALID`, `WDATA`, `WSTRB`, `RREADY`, `ARADDR`...), kesme yanıtları, ve bazı çekirdek-dış sinyalleri — yani çekirdeğin "dünyaya söylediği her şey" — karşılaştırılır.

Bunun mantığı şudur: bir SEU iç bir flip-flop'u devirirse, ya hata bir sonraki çevrimde dışarı sızar (o anda yakalanır), ya ASLA dışarı sızmaz (yani semantik olarak hata değildir — dead state). Eğer asla dışarı sızmıyorsa, programın gözlenebilir davranışını değiştirmiyor demektir; yakalamamız da gerekmez. **Gözlemlenebilir hatayı yakalamak yeterlidir.**

Bu, TMS570 referans dokümantasyonunda "CPU output compare" olarak geçer. CCM-R5 modülü ([TMS570LC4357 datasheet, §7.5](https://www.ti.com/product/TMS570LC4357)), iki R5F çekirdeğinin bus çıkışlarını eşleştirir.

### Karşılaştırma noktası: iki çevrim skew

Burası DCLS'in göründüğünden daha rafine bir tarafı. Naif kurgu şudur: iki CPU'yu aynı saatle besle, çıkışlarını aynı anda karşılaştır. Bu kurgu işler — ama bir tehlikesi vardır: her ikisi de **tam aynı anda** bir SET'e maruz kalabilir. Kozmik bir parçacık iki çekirdeğin de bir gate'ini eşzamanlı bozarsa, karşılaştırıcı eşit görür ve hata kaçar.

Bu yüzden hem TMS570 CCM-R5'te hem de ARM'ın referans TCLS uygulamasında çekirdekler arasında bir **zamansal kayma (temporal diversity)** vardır. CCM-R5'te şöyle çalışır:

- Master CPU'ya gelen girdi (bus, kesme, vb.) **olduğu saat çevriminde** iletilir.
- Checker CPU'ya gelen girdi **iki çevrim geciktirilerek** iletilir.
- Master CPU'nun çıkışı **iki çevrim tamponlanır**, sonra karşılaştırıcıya gider.
- Checker CPU'nun çıkışı **doğrudan** karşılaştırıcıya gider.

Sonuç: karşılaştırıcının önünde her iki yol da aynı T anına ait sinyallere sahiptir (master için: T-2'de hesapladı, 2 çevrim bekletti; checker için: 2 çevrim geç başladı, T-2'de hesapladı, doğrudan getirdi). Ama silikon üzerinde **iki çekirdek fiziksel olarak farklı çevrimlerde çalışıyor**: master saat 100'de bir komutu yürütürken, checker saat 98'deki komutu yürütüyor.

```
saat:        ... T-2   T-1    T     T+1   T+2  ...
master CPU:  ...  X     Y     Z     ...
checker CPU: ...        X     Y     Z     ...
karşılaştırıcı girişleri (T anında):
   master tarafı:  X (2 çevrim önceki çıkış, gecikmeli)
   checker tarafı: X (checker'ın o anki çıkışı)
```

Bu sayede T anında ortaya çıkan bir ortak kip bozulması (örn. iki çekirdek yanına aynı anda bir alfa parçacığı düşmesi) **iki farklı komuta** etki eder. Karşılaştırıcı bu farklılığı görür ve hatayı yakalar.

Bu kaymanın bedeli de var: iki çevrim, hata tespitinin gecikmesidir. Bir hata oluştuktan sonra `nERRIRQ` (veya CCM çıkışı) yükselene kadar yaklaşık 2 çevrim + karşılaştırıcı boru hattı geçer. 300 MHz Cortex-R5F üzerinde bu, **~10 nanosaniye** mertebesindedir. Emniyet işletim modunda bu, "anında" sayılır.

### Yapısal bağımsızlık ve "master-master" değil "master-checker"

CCM-R5 düzgün bir tasarım kararıyla daha ileri gider: iki R5F çekirdeği **kelimesi kelimesine aynı RTL değildir**. Floorplan üzerinde **birbirine zıt yönlendirilmiş** (mirrored) yerleştirilirler ve farklı saat ağı dallarından beslenirler. Mantıken aynı, fiziksel olarak farklı.

Bu, "neden iki çekirdek bağımsız diyebiliyoruz?" sorusuna verilen yanıttır. Aynı silikon üzerinde oldukları için %100 bağımsız değildirler — bu noktaya birazdan döneceğiz. Ama RTL özdeş, layout aynalı, saat ağı dalları farklı bir yapı, ortak kip bozulmalarına karşı tek bir 'dump iki kopya' yaklaşımından kayda değer biçimde daha sağlamdır.

Bir başka kritik karar: **iki çekirdek birbirini karşılaştırmaz.** Karşılaştırmayı bağımsız bir donanım bloğu — CCM-R5 — yapar. Sebep basit: master ve checker özdeş RTL olduğu için, her ikisinin de yapacağı karşılaştırma aynı hataya açıktır. Karşılaştırıcının kendisi farklı, daha basit ve `LBIST` ile periyodik olarak test edilebilen bir bloktur.

---

## DO-254 / DAL A açısı: "donanım da kanıtlanabilir mi?"

Yazılım tarafında DO-178C size MC/DC kapsama, gereksinim izlenebilirliği, statik analiz gibi yöntemler sunar. Donanım tarafında ise [DO-254](https://www.rtca.org/training/do-254-design-assurance-guidance-for-airborne-electronic-hardware/) (RTCA DO-254 / EUROCAE ED-80) muadil bir yapı kurar: **Design Assurance Levels (DAL)** A'dan E'ye, programmable logic ve karmaşık özel devreler (Custom Micro-Coded Components — CMCC) için kanıt zinciri ister.

Cortex-R5 gibi sertifika hedefli COTS bir IP, doğrudan "DAL A sertifikalı" olarak satılmaz. Onun yerine ARM size **safety package** dokümantasyonu verir: FMEA özetleri, FIT bütçeleri, sertifika edilebilir bir kullanım rehberi. Siz, sistem entegratörü olarak, bu paketi *kendi* DAL A argümanınızın bir parçası olarak kullanırsınız. Yani DCLS'in "donanım hatasını yakaladığı" iddiası, sertifikasyonda **sayılarla** desteklenmek zorundadır. Bu noktada DC (diagnostic coverage) bir slogan değil, bir formül girer devreye.

### DC tanımı ve DCLS'in tipik rakamı

ISO 26262-5 (Annex D) ve IEC 61508-2 (Annex C) diagnostic coverage'ı şu çerçevede tanımlar:

```
DC = (yakalanan tehlikeli hata oranı) / (toplam tehlikeli hata oranı)
   = λ_DD / (λ_DD + λ_DU)
```

Burada `λ_DD` "Detected Dangerous" (tespit edilen tehlikeli) hata oranı, `λ_DU` "Undetected Dangerous" (tespit edilmeyen tehlikeli) hata oranıdır. Hedef: ASIL D / SIL 3 için DC ≥ %99 (tehlikeli hataların sadece %1'i kaçacak).

DCLS, ISO 26262-5 Annex D Table D.1'de "redundant CPU (lockstep)" başlığı altında **High** kategorisine sokulur — yani %99 ve üstü DC kanıtlamak için kabul edilen bir mekanizma. Pratikte üreticiler (TI, NXP, Infineon, Renesas) DCLS için tipik olarak **%99 — %99.9** arası DC iddia eder ve bu iddiayı FMEDA ([Failure Modes, Effects and Diagnostic Analysis](https://en.wikipedia.org/wiki/Failure_modes,_effects,_and_diagnostic_analysis)) tablolarıyla destekler.

Buradaki "tipik %99" sayısı kritik bir uyarıyla gelir: bu sadece **çekirdeğin** DC'sidir. Çevre birimleri (DMA, kesme denetleyicisi, FlexRay/CAN, ADC) genelde DCLS koruması altında değildir; onlar için ayrı mekanizmalar (ECC, CRC, sample-and-compare) gerekir. Sistem-seviye DC'yi ölçerken, *DCLS dışı* alanların ağırlıkça payı, çoğu projede DC bütçesini sıkıştıran asıl unsurdur.

### Bir basit FMEDA hesabı

Diyelim ki bir Cortex-R5F çekirdeğinin tahmini ham hata oranı `λ_core = 50 FIT` (10⁹ saatte 50 hata). Bunun tehlikeli olabilecek (yani çıkışları etkileyecek) kısmı `λ_D ≈ 0.5 × λ_core = 25 FIT` olsun. DCLS'in iddialı DC'si %99 ise:

```
λ_DD = 0.99 × 25 = 24.75 FIT  (CCM yakalar)
λ_DU =  0.01 × 25 = 0.25 FIT  (kaçar)
```

ASIL D, "ana fonksiyonun" `λ_DU` toplamının `< 10 FIT` olmasını ister. Tek başına Cortex-R5 + DCLS bu eşiğin altındadır. Ama sisteme bir SRAM eklediğinizde, üzerinde tek-bit-ECC + iki-bit-tespit varsa onun da DC'si yaklaşık %99 olur ve kendi λ_DU'sunu ekler. Bus matrisi, kesme denetleyicisi, DMA kanalları — her biri ayrı bir kalem. Sonunda **sistem-seviye λ_DU bütçesi** birikim toplamıdır.

Yapılan iş, FMEDA tablosunda bu kalemleri tek tek yazıp "bu hata neyi tetikler — DCLS yakalar mı — yakalamazsa ne olur" üçlüsünü, COTS IP'nin verdiği safety package'ı temel alarak doldurmaktır. ASIL D / DAL A'da bu tablo yüzlerce satır olabilir.

---

## DCLS'in çözmediği problem: common-cause failures

Buraya kadar her şey, "iki çekirdek bağımsız hata yapar" varsayımına dayandı. Bu varsayım her zaman geçerli olmaz. İki çekirdeği aynı anda aynı şekilde bozan olaylara **common-cause failure** (CCF) veya **common-mode failure** denir, ve bunlar DCLS'in en zayıf noktasıdır.

Tipik CCF kaynakları:

| Kaynak | Etki | Tipik korunma |
|---|---|---|
| Beslemenin ani çökmesi | İki çekirdek aynı anda yanlış çalışır | Voltaj monitörü, brown-out reset |
| Saat sinyali bozulması | Aynı saatten beslenen iki çekirdek aynı yanlış işi yapar | Bağımsız saat monitörü (PLL-PLL crosscheck) |
| Sıcaklık aşımı | Aynı die'da iki çekirdek aynı şekilde davranır | On-chip sıcaklık sensörü + SAFE state |
| EMI maruziyeti | Yakın yerleşik iki çekirdek aynı transient'i görür | Layout aynalama + temporal skew |
| Tasarım hatası (systematic) | İkisi de aynı RTL ile aynı yanlış işi yapar | Süreç tarafında ele alınır; ASIL/DAL süreç şartları |
| Üretim hatası (mask defect) | Aynı maskeyi paylaşan iki çekirdek bozulur | Düşük olasılıklı; floorplan ayrımı azaltır |

Görüldüğü gibi DCLS, **rastgele bağımsız** donanım hatalarına karşı çok iyidir; ama **sistematik** veya **ortak çevresel** hatalara karşı kendi başına yetmez. Bu yüzden TMS570 gibi MCU'lar tek tasarım kararı olarak DCLS'e yaslanmaz; yanına şunları koyar:

- **LBIST (Logic Built-In Self-Test)**: Reset sonrası CPU lojiğini PRPG (pseudo-random pattern generator) ile sıkıştırılmış bir imza testine sokar. Bu, üretim hatası veya kalıcı arızanın boot anında tespitidir. Hercules ailesi için tipik LBIST süresi birkaç milisaniyedir.
- **PBIST (Programmable BIST)**: SRAM bloklarını march C-, march U gibi standart algoritmalarla test eder.
- **CCM self-test**: Karşılaştırıcının kendisinin de bozulabileceği için, periyodik olarak CCM'e bilinçli bir farklılık enjekte edip alarmın çaldığı doğrulanır. TI dokümantasyonunda bu "PSCON lockstep self-test" adıyla geçer ([e2e.ti.com — CCM-R5F PSCON](https://e2e.ti.com/support/microcontrollers/hercules-safety-microcontrollers-group/hercules/f/hercules-safety-microcontrollers-forum/929269/tms570lc4357-esm-error-1-31-during-self-tests-pmm5-of-ccm-r5f-pscon-lockstep-self-test)).
- **Voltaj ve saat monitörleri**: Bağımsız bir RC osilatörden saati izleyen "windowed watchdog", besleme rayını izleyen voltaj komparatörü.

Yani Hercules MCU'nun safety manual'ini açtığınızda DCLS'in dışında onlarca "safety mechanism" listelenir. DCLS, donanım emniyet hikâyesinin **en görünür** parçasıdır ama tek parçası değildir.

---

## Yazılım tarafında ne değişir?

Pratik soru: bu mimarinin üzerinde kod yazarken hayatınız nasıl değişir?

İyi haber: çoğunlukla değişmez. Software'in modeli **tek bir CPU**'dur. RTOS (FreeRTOS, SafeRTOS), tek bir görev zamanlayıcı, tek bir kesme sistemi görür. Vektör tablosu tek, yığın tek. Lockstep tamamen donanım katmanında saklıdır.

Ama bir avuç gerçek vardır:

1. **İki çekirdek var ama performans tek çekirdek kadardır.** "2 × 300 MHz" değildir; "300 MHz, doğrulanmış" demektir. Bu, datasheet'in DMIPS sayısının neden "tek çekirdek" gibi göründüğünü açıklar.

2. **Bazı blokların görünür kullanım davranışı var.** Örneğin CCM-R5'in self-test'ini başlatmak için bir register dizisini boot sırasında yazmanız gerekir. TI'ın HALCoGen / SafeTI gibi araçları bunu otomatik yapar; manuel boot kodu yazıyorsanız safety manual'in bu bölümünü atlamak boot zamanı ESM hatalarına yol açar.

3. **Karşılaştırma hatası geri dönüşsüzdür.** ESM (Error Signaling Module) bir lockstep hatası raporladığında, mimari varsayım "duruma güvenilemez"dir. Tipik tepkide kayıt yapmadan SAFE state'e (örn. tüm çıkışları yüksek empedansa) gidersiniz; çünkü RAM'in bile doğru olduğu garanti edilemez. Yazılımın bu durumdan "anlamlı bir log yazıp devam edeyim" diye dönmesi beklenmez.

4. **Determinizm bir "feature" değil, varsayımdır.** DCLS'in çalışması için iki çekirdeğin **kesinlikle aynı** girdiyle aynı sonucu üretmesi gerekir. Yani: dış asenkron olaylar (kesmeler, DMA yanıtları) iki çekirdeğe **eşzamanlı** ulaşmalı; çekirdek içi tüm rastgele kaynaklar (örn. TRNG) ya devre dışı olmalı ya da output karşılaştırma yolundan çıkarılmış olmalı. Bunu silikon tasarımcısı garanti eder, ama yazılım bu varsayımı bozacak bir mod açarsa (örn. unbuffered TRNG'yi normal akışta okumak), bilinmedik bir nedenle lockstep alarmı yer.

5. **Cache ve MMU/MPU davranışı titizlikle birlikte test edilmelidir.** Cortex-R5'in MPU'su küçüktür (8 veya 16 region); ama lockstep bağlamında her iki çekirdeğin MPU'su da aynı şekilde yapılandırılmış sayılır (çünkü ikisi aynı RTL'ı koşuyor). Yazılım açısından sadece bir MPU vardır.

Geliştirici için netice: DCLS'i bir performans gizemi olarak görmeyin. Datasheet'teki "iki çekirdek" gerçek bir CPU'nun yanına sessiz bir denetçi koyar. O denetçi, sizin kodunuzu görmüyor; sadece o kodun donanım üzerindeki ifadesini iki kez gözlüyor.

---

## ARM'ın bir adım sonrası: TCLS ve neden üç?

DCLS bir hatayı **tespit eder**, ama düzeltmez. Karşılaştırıcı "eşit değil" der; hangisi doğru, hangisi yanlış belli değildir. Yapabileceğiniz tek şey güvenli duruşa gitmektir.

Birçok uygulama için bu yeterlidir (uçakta hata varsa ikinci kanal devralır, otomobilde sistem brake-by-wire yedek modu açar). Ama "fail-operational" — yani bir hata olsa da çalışmaya devam etmesi gereken — sistemler için tek bir kanalın güvenli duruşa gitmesi kabul edilemez.

İşte burada üçüncü çekirdek devreye girer. ARM'ın **TCLS (Triple Core Lock-Step)** Cortex-R5 versiyonu ([Iturbe et al., ACM TOCS, 2019](https://dl.acm.org/doi/10.1145/3323917)), aynı yapıyı üç çekirdekle kurar ve **çoğunluk oylaması** (2-out-of-3) yapar. Bir çekirdek yanlış sonuç verirse, çoğunluk "doğru" olanı seçer, hatalı çekirdek bir sonraki tahmini güvenli noktada (örn. bir senkronizasyon barriers'ı sonrası) çoğunluğun durumuna senkronize edilir, sistem çalışmaya devam eder. TCLS Cortex-R5 araştırmasında belirtildiği gibi, üç çekirdekli yapı **ortak çevreden gelen tek bir SET'in sistemi durdurmasını** engelleyerek availability'yi artırır.

Bedel: alan ve güç ~%50 artar (basitçe iki yerine üç çekirdek + daha karmaşık oylama mantığı). NXP'nin S32G ailesi de benzer bir yaklaşım sunar (delayed lockstep çeşitleri). DCLS-DCLS, TMR, TCLS, asymmetric/checker-only redundancy — saha hızla yeni varyantlar üretiyor; ama hepsinin omurgası aynı: "bağımsız ikinci bir gözlemci" varsayımı.

---

## Bir başkalaşım: Cortex-A65AE, Split-Lock ve uygulama işlemcileri

Bahsetmeden geçilemez bir gelişme: yüksek performanslı uygulama işlemcileri de DCLS'e yaklaştı. ARM'ın **Cortex-A65AE** (otomotiv için tasarlanmış Neoverse-derivative) ve daha sonra A78AE, **Split-Lock** modu sunar:

- Split modunda: çekirdekler bağımsız çalışır, normal SMP CPU'ları gibi davranır (yüksek performans).
- Lock modunda: aynı küme içindeki iki çekirdek lockstep'e geçer, performans yarıya iner ama ASIL D / DAL A diagnostic coverage elde edilir.

Mod seçimi boot zamanında, bir donanım pinine veya boot ROM seçimine bağlıdır; çalışma zamanında değişmez. Bunun anlamı: aynı silikon, infotainment için "split" konfigürasyonda, fren kontrolcüsü için "lock" konfigürasyonda kullanılabilir. Tasarım maliyeti tek bir die'a düşer, OEM'ler iki ayrı SoC yerine bir SoC alır.

Ama bu, yazılım açısından önemli bir tuzak yaratır: aynı parça numarasının altında **iki farklı bilgisayar mimarisi** yatabilir. Bir geliştirici "şu A65AE üzerinde benim kodum koşuyor" derken hangi modu kastettiğini açıkça belirlemek zorundadır; aynı kod split'te 4 CPU görürken lock'ta 2 CPU görür ve performans karakteristiği farklıdır. Bootloader'da MIDR/PARTID okumakla yetinmeyin; safety configuration register'larını da okuyun.

---

## "Önce donanım emin olsun" stratejisinin altında yatan ekonomi

DCLS gibi bir mimari neden hâlâ popüler? Sonuçta yazılımsal redundancy var: TMR (Triple Modular Redundancy) yazılım katmanında, AN3-AN5 gibi N-version programming yaklaşımları, control flow integrity. Hepsi yazılır.

Cevap, dağıtım maliyetinde. Donanımsal lockstep'i bir kez tasarlarsınız ve milyonlarca MCU'da sıfır ek mühendislik ile yeniden kullanırsınız. Yazılımsal redundancy ise her uygulama için yeniden mühendislik gerektirir: hangi hesabı çiftleyeceğiz, ne sıklıkla karşılaştıracağız, hata olduğunda sistem durumu nedir? Her uygulama ekibinin bunu tekrar yapması, hem güvenilirlik açısından kötü (sürekli yeni hatalar) hem de maliyet açısından imkânsızdır.

Bu yüzden uçaktaki FCC, otomobildeki ABS, asansörün hız sınırlayıcısı, üç-fazlı motor sürücüsünün koruma kartı — hepsi DCLS veya benzeri donanımsal redundancy mimarisi üzerinde koşan, **basit ve doğrulaması kolay** yazılımlar barındırır. Donanımın katlanmış olması, yazılımın katlanmamış olmasına izin verir; ve sertifikasyon argümanı toplamda küçülür.

Şöyle bir ifade kullanılır: *"Yazılım kanıtlanması en pahalı olandır. Donanım katmanında çözebildiğiniz her şeyi orada çözün."* DCLS bu felsefenin en bilinen örneklerinden biridir.

---

## Bir sahada, ne arayacaksınız?

Eğer bu sınıf bir MCU üzerinde çalışıyorsanız (TMS570, RH850, AURIX, S32K, S32G, S32E), proje başlangıcında safety manual'i okurken şu sorulara açıkça yanıt arayın:

1. **CCM/lockstep self-test'i kim başlatıyor?** Boot ROM mu, sizin başlangıç kodunuz mu? Self-test'ten önce ortaya çıkan bir lockstep hatası nasıl ele alınıyor?
2. **ESM (Error Signaling Module) hangi hataları kimseye iletmeden gizliyor olabilir?** ESM'in maske register'larını **bilinçli** doldurun, default değerlere güvenmeyin.
3. **Karşılaştırıcı hangi periferikleri kapsamıyor?** O periferikler için bağımsız bir DC mekanizması var mı? CRC, ECC, sample-compare?
4. **Hangi register'lara yazmak lockstep'i bozar?** TRNG, performance counter'lar, debug işlemleri için tipik tuzaklardır.
5. **LBIST/PBIST periyodu nedir?** Tipik yaklaşım: reset'te tam test, çalışma sırasında belirli aralıklarla "interval BIST". Bu periyodu safety case'iniz hesaba katmış mı?
6. **CCM self-test geçmesi için kaç çevrim gerek?** O süre boyunca çekirdek ne yapıyor? Bu, boot time'a ne ekliyor?
7. **Common-cause bütçesi**: PSU monitörü var mı, saat crosscheck var mı, sıcaklık sensörü nasıl bağlanmış?

Bu soruların yanıtları sertifikasyon DAL A / ASIL D hedefine ulaşmak ile ulaşamamak arasındaki farktır.

---

## Sonuç: görünmez ikiz

DCLS'in en güzel yanı, doğru çalıştığında **hiçbir şey** olmamasıdır. Yazılımcı tek bir CPU görür, tek bir görev zamanlaması yapar, tek bir vektör tablosu kurar. Ama her saat darbesinde, üçüncü bir blok — CCM-R5 — onun göremediği bir iki-çekirdek-iki-çevrim-skew dansını izler ve yanlış bir adım anında bütün sistemi güvenli duruşa götürür.

Bu mimari, "yazılım her şeyi doğrulayabilir" iddiasının zarif bir reddi gibi okunur. Bazı kanıtlar yazılımın katmanında, derinde olamaz; donanıma kazınmaları gerekir. Ve emniyet kritik dünyada bu, lüks değil zarurettir.

Bir sonraki sefer datasheet "Dual Core Lockstep" derken, arkasındaki 2 çevrimlik temporal skew'i, aynalanmış floorplan'ı, periyodik self-test'i, ve common-cause bütçesini hatırlayın. "İki çekirdek koyalım" cümlesi, derinine indikçe bambaşka bir mühendislik manzarasına açılıyor.

---

## Kaynaklar

- Texas Instruments, *TMS570LC4357 Hercules Microcontroller* — ürün sayfası ve datasheet: <https://www.ti.com/product/TMS570LC4357>
- Texas Instruments, *Safety Manual for TMS570LS07x/09x Hercules™* (SPNU620): <https://www.ti.com/lit/fs/spnu620a/spnu620a.pdf>
- Texas Instruments E2E forum, *TMS570LS3137: Lockstep verification and intended behavior of the CPUs*: <https://e2e.ti.com/support/microcontrollers/hercules/f/hercules-safety-microcontrollers-forum/740590/tms570ls3137-lockstep-verification-and-intended-behavior-of-the-cpus>
- Texas Instruments E2E forum, *TMS570LC4357: ESM Error 1.31 during self-tests PMM5 of (CCM-R5F) PSCON lockstep self-test*: <https://e2e.ti.com/support/microcontrollers/hercules-safety-microcontrollers-group/hercules/f/hercules-safety-microcontrollers-forum/929269/tms570lc4357-esm-error-1-31-during-self-tests-pmm5-of-ccm-r5f-pscon-lockstep-self-test>
- ARM Cortex-R5 Technical Reference Manual: <https://developer.arm.com/documentation/ddi0460/c/>
- X. Iturbe, B. Venu, E. Ozer, J.-L. Poupat, G. Gimenez, H.-U. Zurek, *The Arm Triple-Core Lock-Step (TCLS) Processor*, ACM Transactions on Computer Systems, 2019: <https://dl.acm.org/doi/10.1145/3323917>
- ARM Cortex-A65AE Technical Reference Manual, Split-Lock section: <https://developer.arm.com/documentation/101385/0101/Functional-description/Introduction/Split-Lock>
- *Variable Delayed Dual-Core Lockstep (VDCLS) Processor for Safety and Security Applications*, MDPI Electronics, 2023: <https://www.mdpi.com/2079-9292/12/2/464>
- Synopsys, *ASIL D ISO 26262 Compliance for Automotive SoCs*: <https://www.synopsys.com/articles/asil-d-systematic-iso-26262-compliance.html>
- Infineon, *AURIX™ TC3xx Family — Functional Safety Documentation*: <https://www.infineon.com/products/microcontroller/32-bit-tricore/aurix-tc3xx>
- Renesas, *RH850 Automotive MCUs — Lockstep Configurations*: <https://www.renesas.com/en/products/microcontrollers-microprocessors/rh850-automotive-mcus>
- IEC 61508-2:2010, *Functional safety of electrical/electronic/programmable electronic safety-related systems — Part 2*
- ISO 26262-5:2018, *Road vehicles — Functional safety — Part 5: Product development at the hardware level* (Annex D, Hardware fault diagnostic coverage)
- RTCA DO-254 / EUROCAE ED-80, *Design Assurance Guidance for Airborne Electronic Hardware*: <https://www.rtca.org/training/do-254-design-assurance-guidance-for-airborne-electronic-hardware/>

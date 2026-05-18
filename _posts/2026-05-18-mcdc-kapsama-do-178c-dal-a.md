---
layout: post
title: "MC/DC Kapsama: DO-178C DAL A'da Neden Modified Condition/Decision Coverage?"
subtitle: "MC/DC Coverage: Why DO-178C DAL A Requires Modified Condition/Decision Coverage"
background: "/img/posts/2.webp"
date: '2026-05-18 09:00:00 +0300'
lang: tr
---

Sertifikasyon denetiminin ikinci günü. Denetçi karşınıza bir kod parçası koyuyor:

```c
if (altitude_valid && (gear_down || on_ground)) {
    enable_landing_logic();
}
```

Sonra soruyor:

— "Bu `if` için kaç tane test yazdınız?"
— "İki. Şartın `true` olduğu durum ve `false` olduğu durum."
— "%100 karar kapsamasını sağlıyor o zaman."
— "Evet."
— "Yazılım seviyeniz neydi?"
— "DAL A."
— "O zaman bu yetmez."

Hatalı değil. DO-178C **DAL A** (Design Assurance Level A — "felaket" sonuçlu hata sınıfı) yazılımı için **modified condition/decision coverage** (MC/DC) zorunludur. İki test geçmek yerine, en az **dört** test yazmanız ve her birinin sadece tek bir koşulu değiştirerek o koşulun karar sonucunu nasıl tek başına etkilediğini göstermeniz gerekir. Bunun nedeni, "iki test geçti" demenin avionics yazılımında "test ettim" anlamına gelmemesi.

Bu yazıda MC/DC'nin neden var olduğunu, üç farklı resmi tanımını (Unique-Cause, Masking, hibrit), short-circuit değerlendirmenin standartla nasıl uzlaştırıldığını, *coupled conditions* tuzağını ve gerçek bir karar tablosu üzerinden minimum N+1 test seti üretmenin nasıl yapıldığını adım adım göstereceğim. Hedef, internette dolaşan yüzeysel "her koşulu test et" özetlerinin **arkasındaki** standart yorumunu açmak.

---

## Kapsama Merdiveni: MC/DC Nerede Duruyor?

Yapısal kapsama (structural coverage) ölçütlerini en zayıftan en güçlüye sıralarsak:

| Kapsama tipi | Tanım | N koşul için minimum test |
|---|---|---|
| Statement (satır) | Her satır en az bir kez çalıştı | 1 |
| Decision (karar) | Her karar `true` ve `false` oldu | 2 |
| Condition | Her koşul `true` ve `false` oldu | 2 (genelde) |
| Condition/Decision | Yukarıdaki ikisi birlikte | 2 |
| **MC/DC** | Her koşul, kararın sonucunu **bağımsız olarak** etkiledi | **N+1** (minimum) |
| Multiple Condition (MCC) | Tüm koşul kombinasyonları denendi | **2<sup>N</sup>** |

MCC matematiksel olarak en güçlüsüdür ama kombinatorik patlama yüzünden 10 koşullu bir karar için 1024 test gerektirir — pratikte uygulanamaz. Diğer uçtaki "decision coverage" çok ucuzdur ama içeride bir koşulun yanlış kodlandığını yakalayamaz. MC/DC bu ikisinin arasındaki **mühendislik uzlaşması**dır: maliyet `2<sup>N</sup>` yerine doğrusal (`N+1`) kalır, buna karşılık her koşulun karar üzerindeki bağımsız etkisi kanıtlanır.

> Bu ölçütün havacılığa girişi tesadüf değil. Kriter 1990'ların başında **John J. Chilenski** ve Steven P. Miller tarafından Boeing 777'nin uçuş yazılımı sertifikasyonu sürecinde olgunlaştırıldı; ardından 1992'de yayınlanan DO-178B'ye girdi ve DO-178C (2011) ile aynen taşındı.

---

## DO-178C'nin Sözleşmesi: Tanımlar Tam Olarak Ne Diyor?

DO-178C'nin §6.4.4.2 ve Annex A Tablo A-7'sinde geçen tanımları İngilizce metne sadık biçimde aktaralım — sertifikasyon belgelerinde kelime seçimi öneme bağlanır:

- **Condition (koşul):** "A Boolean expression containing no Boolean operators." Yani `a > 0`, `flag`, `ptr == NULL` birer koşuldur; `a > 0 && flag` *değildir*.
- **Decision (karar):** "A Boolean expression composed of conditions and zero or more Boolean operators." Önemli: bir karar mutlaka `if`/`while` içinde olmak zorunda değil — DO-178C'nin terminolojisinde `bool x = a && b;` ataması da bir karardır. (DO-248C bunu açıkça netleştirmiştir.)
- **Modified Condition/Decision Coverage (MC/DC):** Her giriş/çıkış noktası en az bir kez çalıştırılmalı; her karar tüm olası sonuçları almalı; her koşul tüm olası sonuçları almalı; **ve her koşulun, kararın sonucunu bağımsız olarak etkilediği gösterilmelidir.**

Bu dördüncü madde MC/DC'yi tanımlayan maddedir. Geri kalan üçü zaten "condition + decision" kapsamasıdır.

DO-178C Tablo A-7'nin **5 numaralı hedefi** (Test Coverage of Software Structure — MC/DC) sadece **DAL A** için zorunlu işaretlidir. DAL B için 6 numaralı hedef (Decision Coverage) yeter; DAL C için 7 numaralı hedef (Statement Coverage) yeter. DAL D'de yapısal kapsama hedefi yoktur. Yani MC/DC, "felaket" sonuçlu hata sınıfının pahalı bedelidir; daha düşük kritiklik için ücretsiz değildir.

---

## "Bağımsız Olarak Etkilemek" Tam Olarak Ne Demek?

İşin püf noktası burada. Aşağıdaki karar üzerinden gidelim:

```c
result = A && (B || C);
```

Üç koşul var: `A`, `B`, `C`. Truth table sekiz satır:

| # | A | B | C | B\|\|C | sonuç |
|---|---|---|---|---|---|
| 1 | F | F | F | F | F |
| 2 | F | F | T | T | F |
| 3 | F | T | F | T | F |
| 4 | F | T | T | T | F |
| 5 | T | F | F | F | F |
| 6 | T | F | T | T | T |
| 7 | T | T | F | T | T |
| 8 | T | T | T | T | T |

MC/DC için her koşul için **bir bağımsızlık çifti** (independence pair) bulmamız lazım: iki test, içinde *sadece o koşul* değişiyor ve karar sonucu da değişiyor.

**A için bağımsızlık çifti.** Sadece A'nın değiştiği, B ve C'nin sabit kaldığı iki satır arıyoruz. (1,5): B=F, C=F, A değişiyor → sonuç F→F. Olmaz, sonuç değişmedi. (2,6): B=F, C=T, A değişiyor → F→T. Bu işe yarar. Aynı şekilde (3,7) ve (4,8) de işe yarar.

**B için bağımsızlık çifti.** Sadece B değişecek. A=T olmalı (yoksa kısa-devre B'yi maskeler), C=F olmalı (yoksa B'nin etkisi yok olur). (5,7): A=T, C=F, B değişiyor → F→T. Tek seçenek bu.

**C için bağımsızlık çifti.** Aynı mantık simetrik: A=T, B=F olmalı. (5,6): A=T, B=F, C değişiyor → F→T.

Yani MC/DC için seçeceğimiz minimum test seti:

| Test # | Truth-table satırı | A | B | C | sonuç |
|---|---|---|---|---|---|
| T1 | 2 | F | F | T | F |
| T2 | 5 | T | F | F | F |
| T3 | 6 | T | F | T | T |
| T4 | 7 | T | T | F | T |

Sadece **4 test**. N+1 = 4. Bunların:

- A'nın bağımsız etkisini gösteren çift: (T1, T3) — sonuç F→T
- B'nin bağımsız etkisini gösteren çift: (T2, T4) — sonuç F→T
- C'nin bağımsız etkisini gösteren çift: (T2, T3) — sonuç F→T
- Tüm koşullar hem T hem F oldu, karar hem T hem F oldu. ✔

8 satırlık MCC yerine 4 test. Bu indirim, MC/DC'yi "afford edilebilir" yapan şeydir.

---

## Üç Form: Unique-Cause, Masking, Hibrit

Yukarıda kullandığımız tanım — *sadece ilgili koşul değişir, kalan koşullar sabit kalır* — DO-178B'nin ilk yıllarındaki **Unique-Cause MC/DC** tanımıdır. Ama 2000'lerin başında bu tanım iki nedenle aşındı:

1. **Short-circuit değerlendirme.** C, C++, Ada, Java gibi dillerde `&&` ve `||` operatörleri kısa-devre yapar. `A && B` ifadesinde A=F ise B değerlendirilmez. Soru: B'nin değeri Unique-Cause anlamında "değişti" sayılır mı, eğer hiç değerlendirilmediyse?
2. **Coupled conditions.** `(a > 0 && b) || (a > 0 && c)` gibi ifadelerde `a > 0` koşulu iki kez geçer. Unique-Cause çifti — sadece bir oluşumu değiştirip diğerini sabit tutmak — bu durumda **matematiksel olarak imkânsızdır.**

FAA, 2001'de bu sorunları ele almak için John Chilenski'ye **DOT/FAA/AR-01/18** raporunu hazırlattı ("An Investigation of Three Forms of the Modified Condition/Decision Coverage Criterion", Ağustos 2001). Bu rapor üç formu resmen tanımladı:

**1. Unique-Cause MC/DC.** Orijinal, en sıkı tanım. Bağımsızlık çiftinde sadece ilgili koşul değişir. Coupled conditions varsa %100 ulaşılamaz.

**2. Masking MC/DC.** Daha esnek. Bağımsızlık çiftinde başka koşullar da değişebilir, **şart** ki kararın sonucunu yalnızca ilgili koşulun değişimi belirlesin — yani diğer koşulların etkisi boolean cebrinde "maskelenmiş" olsun. Örneğin `A && B` ifadesinde A=F ise, B ne olursa olsun sonucu etkilemez; B "maskelenmiştir". Bu form coupled conditions ile uyumludur ve modern derleyici/araç implementasyonlarının çoğu (LLVM `-fcoverage-mcdc` dahil) bu formu uygular.

**3. Unique-Cause + Masking (hibrit).** Singular koşullar için Unique-Cause kuralı uygulanır; yalnızca coupled koşullar için Masking'e izin verilir. Unique-Cause'un saflığını kaybetmeden coupled durumlarda da %100'e ulaşmak isteyenlerin tercihi.

DO-178C bu üç formdan herhangi birinin kullanılmasını **kabul eder**, ama DO-248C (DO-178C'nin destekleyici Frequently Asked Questions / Discussion Papers belgesi) seçilen formun yazılım doğrulama planı (Software Verification Plan) içinde *açıkça beyan edilmesini* zorunlu kılar. Yani "MC/DC yapıyoruz" yazıp geçemezsiniz — *hangi* MC/DC'yi yaptığınızı yazmak zorundasınız.

> Pratikte: ticari avionics araçların büyük çoğunluğu (LDRA Testbed, VectorCAST/Cover, Parasoft C/C++test, Rapita RapiCover) varsayılan olarak Masking MC/DC raporlar. Daha sıkı bir form istiyorsanız konfigürasyon ile zorlamanız gerekir — ve bunu sertifikasyon liaison toplantısında savunmaya da hazır olun.

---

## Short-Circuit Tuzağı: Aynı Kodun İki Yorumu

Şu C kodunu düşünün:

```c
if (ptr != NULL && ptr->ready) {
    /* ... */
}
```

`ptr` kontrolü zorunlu — yoksa NULL dereference. `&&`'nin kısa-devre semantiği sayesinde `ptr == NULL` durumunda `ptr->ready` hiç değerlendirilmez. Bu **doğru** ve gerekli bir savunma.

Şimdi MC/DC sorusu: `ptr->ready` koşulunun bağımsız etkisini göstermek için (ptr=NULL, ready=*) ↔ (ptr=NULL, ready=*) çifti kuramayız çünkü zaten kısa-devre yüzünden `ready` okunmuyor. Unique-Cause açısından bu test çifti tartışmalı.

DO-248C'nin yorumu net: kısa-devre nedeniyle hiç değerlendirilmeyen bir koşul, MC/DC analizi açısından "değeri belirsiz" sayılır. Masking MC/DC bu durumu doğal olarak ele alır — koşul değerlendirilmediyse maskelenmiş kabul edilir. Bu yüzden modern araçlar ve standart yorumu bu konuda Masking lehinde konsolide olmuştur.

Pratik sonuç: yukarıdaki ifade için **3 test yeter**:

| Test | ptr | ptr->ready | sonuç |
|---|---|---|---|
| T1 | NULL | — (değerlendirilmedi) | F |
| T2 | non-NULL | F | F |
| T3 | non-NULL | T | T |

- `ptr` için bağımsızlık çifti (T1, T2): F→F? Hayır, bu da işe yaramıyor. Doğru çift (T1, T3): NULL→non-NULL, sonuç F→T. ✔
- `ready` için bağımsızlık çifti (T2, T3): ptr sabit non-NULL, ready F→T, sonuç F→T. ✔

İki koşullu bir karar için N+1=3 test. Önemli ayrıntı: T1'de `ready`'nin değeri "değerlendirilmedi" olarak işaretlenmelidir — test raporunda "her ne olursa olsun" değil. Bu, audit izinde takip edilebilirlik için kritik.

---

## Coupled Conditions: Standart Yorumunun Gri Bölgesi

Şimdi gerçekten can sıkıcı durum:

```c
result = (a > 0 && b) || (a > 0 && c);
```

`a > 0` iki kez geçiyor. Boolean cebri olarak bu, `a > 0 && (b || c)`'ye denktir; ama statik analizci kodu yazıldığı gibi görür. `a > 0`'ın bir oluşumunu değiştirip diğerini sabit tutmak imkânsızdır — değişken aynı, eşzamanlı değişirler. Unique-Cause MC/DC bu kararda **%100'e asla ulaşmaz**.

Üç pratik çözüm:

1. **Kodu yeniden yaz.** En temizi: `a > 0 && (b || c)`. Coupling ortadan kalkar.
2. **Hibrit MC/DC formunu beyan et.** Bu özel durum için Masking'e izin verildiğini doğrulama planında belirt.
3. **Kapsama hedefini "deviation" ile düşür.** Belirli ifadeler için %100 yerine "demonstrably maximum achievable" hedeflenir; gerekçe sertifikasyon dosyasına eklenir. Bu, DER (Designated Engineering Representative) ile özel müzakere gerektirir ve sertifikasyon riski yaratır.

Sahada birinci seçenek **her zaman tercih edilir.** İkincisi yeterli ama "verification plan'i değiştir" demek küçük bir iş değildir. Üçüncüsü son çare. Coupled conditions'ı erken yakalamak için statik analiz kurallarına ("aynı koşul aynı kararda iki kez geçmez") bir kural eklemek pratik bir koruma.

> İlginç bir nokta: MISRA C ailesi ([bir önceki yazıda]({% post_url 2026-04-05-misra-c-2025-ile-neler-degisti %}) ele aldığım gibi), `&&` ve `||` operatörlerinin sağ operandında kalıcı yan etki (persistent side-effect) içeren ifadeleri yasaklayan bir kural barındırır. Bu kural birincil olarak short-circuit'in beklenmeyen sonuçlarını engellemek için var ama MC/DC analizini de basitleştirir — yan etkisiz koşullarla bağımsızlık ispatı çok daha temiz olur.

---

## Yaygın Yanılgılar

**"Decision coverage %100 ise MC/DC otomatik %100'dür."** Hayır. Decision coverage sadece kararın `true` ve `false` aldığını gösterir; içerideki tek bir koşulun karara *katkı yapıp yapmadığını* göstermez. `if (A || B)` için iki test ((A=T,B=F) ve (A=F,B=F)) decision coverage'ı %100 yapar ama B'nin bağımsız etkisini hiç göstermez.

**"Tüm 2<sup>N</sup> kombinasyonu test etsem MC/DC kesin tutar."** Doğru — ama MCC'yi DAL A için zorunlu sayan kimse yok. MC/DC, bu maliyetten kurtulmanın resmi yoludur. Yine de %100 MCC herhangi bir MC/DC formunu trivially sağlar.

**"`if (x)` tek koşul olduğu için MC/DC'nin anlamı kalmıyor."** Doğru — tek koşullu kararlarda MC/DC, decision coverage'a indirgenir. N=1 için N+1=2 zaten {x=T, x=F}.

**"Makrolar MC/DC'yi etkilemez."** Hayır, çok etkiler. `#define IS_VALID(x) ((x) > 0 && (x) < MAX)` makrosunu `if (IS_VALID(temp))` içinde çağırırsanız, preprocessor sonrası karar `(temp > 0 && temp < MAX)` olur ve iki koşullu MC/DC analizi gerektirir. Pek çok araç preprocessor *sonrası* metni analiz eder. Bu, kapsama raporlarında "kayıp" görünen ama aslında makronun içinden gelen koşulların gerçek sebebidir. Çoğu sertifikasyon ekibi sonradan bu farkı keşfeder.

**"Karar atamaları sayılmaz."** Hayır. `bool ok = a && b;` bir karardır — DO-178C'nin tanımı kontrol akışı değişikliğine bağlı değil. DO-248C'nin ilgili Discussion Paper'ı bu noktayı açıkça netleştirmiştir.

---

## Araç Tarafı: Kim Ne Yapıyor?

Üretim avionics ortamında MC/DC ölçümü neredeyse her zaman *kalifiye* (DO-330 ile nitelendirilmiş) ticari araçlarla yapılır:

- **LDRA Testbed** — Masking ve Unique-Cause her ikisini destekler; sertifikasyon paketi (Tool Qualification Support Pack — TQSP) ile gelir.
- **VectorCAST/Cover** — Masking varsayılan; konfigürasyonla Unique-Cause'a geçirilebilir.
- **Rapita RapiCover** — özellikle on-target (gerçek donanım üstü) kapsama ölçümü için tasarlandı; instrumented binary boyutunu minimize eden teknikler kullanır.
- **Parasoft C/C++test** — MC/DC dahil tüm yapısal kapsama formlarını üretir.

Açık kaynak tarafında durum yeni değişmeye başladı: **LLVM 18** (2024) `-fcoverage-mcdc` bayrağını ekledi — yalnızca Masking MC/DC, en fazla 6 koşullu kararlar için (uygulama bitmap kullandığı için 2<sup>6</sup>=64 ile sınırlı). **GCC** tarafında Jørgen Kvalsvik'in patch serisi `-fcondition-coverage` ile aynı yönde ilerliyor. Ama bu araçlar **kalifiye değil** — bir DO-178C projesinde kapsama "kanıtı" olarak kullanılamazlar. En fazla geliştirme sırasında "yaklaşık" hedefe ne kadar yaklaşıldığını görmek için iyi bir sigorta.

DO-330 (Software Tool Qualification Considerations) burada devreye girer. Bir aracın çıktısı sertifikasyon kanıtı olarak kullanılacaksa — örneğin "%100 MC/DC sağlandı" raporu — aracın kendisinin de yanlış sonuç vermediği doğrulanmalıdır. Kapsama araçları genelde **TQL-5** (Tool Qualification Level 5) gerektirir; yani aracın işlevsel gereksinimleri, geliştirme süreci ve doğrulama kanıtı sunulmalıdır. Ticari satıcılar bu paketi (TQSP) hazır sunar; ev yapımı bir araç yazarsanız bu süreci kendiniz kurmak zorundasınız ve bu, aracı yazmaktan daha uzun sürer.

---

## Pratik Mühendislik Tavsiyeleri

Saha deneyimi (kendi projemden değil, kamuya açık avionics literatüründen damıtarak):

1. **Karmaşık kararları daha küçük parçalara bölün.** 6 koşullu tek bir `if` yerine, ara değişkenlere atanmış 2-3 koşullu kararlar yazın. MC/DC test sayısı da, kod okunabilirliği de iyileşir. Bonus: LLVM'in 6-koşul sınırına takılmazsınız.
2. **Yan etkili koşullardan kaçının.** `if (consume_token() && validate())` gibi ifadeler kısa-devre nedeniyle `validate()`'i koşula bağlı çağırır. Bu hem MISRA ihlali hem MC/DC analizini bulanıklaştırır.
3. **Coupled conditions için statik analiz kuralı ekleyin.** Aynı koşulun aynı kararda iki kez geçmesi tespit edilebilir bir desendir; CI'da yakalayın.
4. **Hangi MC/DC formunu kullandığınızı doğrulama planında ilk gün belirleyin.** Sonradan değiştirmek tüm test setlerini geçersiz kılabilir.
5. **Makro içeren kararları gözden geçirin.** Makro kapsamasız raporlar gerçeği saklar; preprocessor *sonrası* kapsama ölçümünü tercih edin.
6. **Kapsama eksiklerini "test ekle" refleksiyle değil, "neden eksik?" sorusu ile çözün.** Çoğu zaman cevap "ölü kod" veya "tasarım hatası"dır; daha fazla test yazmak semptomu maskeler.
7. **Defensive coding'i abartmayın.** Her satıra savunmalı `if` koymak, MC/DC bütçesini ve test bakım maliyetini patlatır. Pre-condition'ları sınır katmanda tutun, çekirdek mantığı temiz yazın.

---

## Açık Sorular ve İleri Okuma

MC/DC modeli mükemmel değil. Birkaç bilinen sınırı:

- **Veri akışını (data flow) ölçmez.** Bir karar doğru çalışsa bile yanlış girdi ile çağrılırsa bug üretir. MC/DC bunu görmez; bunun için requirement-based testing (gereksinime dayalı test) zaten zorunludur ve MC/DC'nin tamamlayıcısıdır.
- **Object code coverage'ı garanti etmez.** DO-178C §6.4.4.2(b) DAL A için *kaynak kodun derleyici tarafından nasıl object code'a çevrildiğinin* de doğrulanmasını ister (object code traceability). Eğer derleyici optimizasyonları MC/DC ölçümünden sonra object code'da koşul birleştirir/böler/yeniden sıralarsa, ek analiz gerekir. Bu, "additional verification" başlığı altında pek çok DAL A projesinin en pahalı kalemlerinden biridir.
- **Yeni dillerin durumu.** Rust, Zig gibi dillerde MC/DC ölçümü olgun değil. Sertifikasyonlu Rust geliştirme zincirleri yeni yeni şekilleniyor (örneğin Ferrocene'in kapsama desteği henüz MC/DC sertifika kalitesinde değil). Önümüzdeki yıllarda bu boşluk dolacak.

Daha derine inmek için birinci elden kaynaklar:

- **NASA/TM-2001-210876** — Hayhurst, Veerhusen, Chilenski, Rierson (2001), "A Practical Tutorial on Modified Condition/Decision Coverage". Bu, MC/DC'yi öğrenmek için hâlâ tek bir belge önerseydim öneririm.
- **DOT/FAA/AR-01/18** — Chilenski (2001), "An Investigation of Three Forms of the Modified Condition/Decision Coverage Criterion". Üç formun resmi tanımları burada.
- **RTCA DO-178C** §6.4.4.2, Annex A Tablo A-7 — standardın kendisi (ücretli).
- **RTCA DO-248C** — DO-178C destekleyici belgesi; MC/DC ile ilgili Discussion Paper'lar standart yorum belirsizliklerini (karar atama vs kontrol akışı, kısa-devre, coupled conditions vb.) açıkça çözer.
- **RTCA DO-330** — araç nitelendirme; kapsama aracı kullanıyorsanız zorunlu okuma.

---

## Kaynaklar

- [Hayhurst, Veerhusen, Chilenski, Rierson, "A Practical Tutorial on Modified Condition/Decision Coverage", NASA/TM-2001-210876, Mayıs 2001](https://shemesh.larc.nasa.gov/fm/papers/Hayhurst-2001-tm210876-MCDC.pdf)
- [Chilenski, "An Investigation of Three Forms of the Modified Condition/Decision Coverage Criterion", DOT/FAA/AR-01/18, Ağustos 2001](https://www.faa.gov/sites/faa.gov/files/aircraft/air_cert/design_approvals/air_software/AR-01-18_MCDC.pdf)
- [Modified Condition/Decision Coverage — Wikipedia](https://en.wikipedia.org/wiki/Modified_condition/decision_coverage)
- [NASA NPR 7150.2D §3.7.4 — Software Engineering Requirements](https://nodis3.gsfc.nasa.gov/displayDir.cfm?Internal_ID=N_PR_7150_002D_)
- [MaskRay, "Modified condition/decision coverage (MC/DC) and compiler implementations", Ocak 2024](https://maskray.me/blog/2024-01-28-mc-dc-and-compiler-implementations)
- [LDRA, "DO-178C & Structural Coverage Analysis"](https://ldra.com/ldra-blog/do-178c-structural-coverage-analysis/)
- [Rapita Systems, "MC/DC Coverage" referans sayfası](https://www.rapitasystems.com/mcdc-coverage)
- [Vector, "Complete Verification and Validation for DO-178C", Beyaz bülten](https://cdn.vector.com/cms/content/know-how/aerospace/Documents/Complete_Verification_and_Validation_for_DO-178C.pdf)
- [LLVM, MC/DC instrumentation kullanım kılavuzu (`-fcoverage-mcdc`)](https://clang.llvm.org/docs/SourceBasedCodeCoverage.html#mc-dc-instrumentation)

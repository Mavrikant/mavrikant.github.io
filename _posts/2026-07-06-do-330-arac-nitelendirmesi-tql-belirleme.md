---
title: "DO-330 Araç Nitelendirmesi: TQL Belirleme, Kriter Matrisi ve Gerçek Araçlar Üzerinden Karar Ağacı"
subtitle: "DO-330 Tool Qualification: Determining TQL Through Criteria and a Decision Tree Over Real Tools"
background: "/img/posts/8.webp"
date: '2026-07-06 04:00:00'
layout: post
lang: tr
mermaid: true
---

Sertifikalı bir aviyonik yazılım projesinde, DAL A seviyesinde bir bileşen için tüm gereksinim doğrulaması, tüm yapısal kapsama analizi, tüm review kanıtları yerinde. Uçuş yazılımı DAL A tablosu A-7'yi baştan sona geçmiş. Sonra bir gün, kullanılan koşu-zamanı test çerçevesinin — ekibin `pytest`-üstünde yıllardır geliştirdiği kendi otomasyon aracının — belli bir uç koşulda bir başarısızlığı sessizce "geçti" olarak raporladığı ortaya çıkıyor. Bir hata değil, on ay boyunca kurgulanmış onlarca test sonucu şüpheli hale geliyor. Sertifika otoritesi soruyor: **Bu aracı nasıl nitelendirdiniz? Kanıtlarınız nerede?**

Bu soru DO-330'un varlık nedenidir. Aviyonik yazılım sertifikasyonunda araçlar, üzerinde çalıştıkları koda sızmadan, doğrudan onun kanıt zincirini kırabilir. Bir araç yazılıma hatalı bir talimat gömerse (üretim aracı) veya hatalı bir talimatı görmezden gelirse (doğrulama aracı), gerçek uçakta gerçek insanlar bunun sonucunu yaşar. Bu yazıda DO-330'un neden ayrı bir standart olduğunu, üç kriterinin ne demeye geldiğini, TQL matrisinin nasıl okunması gerektiğini ve — Türkçe literatürde en zayıf yeri olan — gerçek araçların bu matriste nereye düştüğünü somut örneklerle inceleyeceğim.

---

## Kısa Bir Tarihçe: §12.2'den Ayrı Bir Standarda

1992'de yayımlanan **DO-178B**, tool qualification'ı tek bir bölümde — §12.2'de — bitiriyordu. İki kategori vardı: *development tools* ve *verification tools*. Nitelendirme için gereken kanıtlar da yine 178B'nin gövdesinden ödünç alınıyordu. Sonuç: her sertifika projesi tool qualification'ı biraz farklı yorumluyor, otorite (FAA, EASA) her defasında farklı miktarda kanıt istiyordu.

2004'te başlayan DO-178C çalışması bu belirsizliği bir tasarım hatası olarak gördü. 178C komitesi, tool qualification'ın 178C'nin gövdesinden çıkarılıp kendi başına duran bir dokümana taşınmasına karar verdi. Böylece:

- Aynı standart DO-178C (havada), DO-278A (yerde), DO-254 (donanım) için ortak bir tool qualification tabanı olabilirdi.
- Araç geliştiricileri (COTS satıcıları) doğrudan bir dokümana bakarak *ne teslim etmeleri gerektiğini* görebilirdi.
- Objective'ler ve kanıt seti standart hale gelirdi.

Sonuçta ortaya çıkan dört ek doküman — DO-330 (Tool Qualification), DO-331 (Model-Based), DO-332 (Object-Oriented), DO-333 (Formal Methods) — hepsi aynı tarihi taşır: **13 Aralık 2011**. Bu dört doküman, DO-178C ile birlikte "178C setinin" beşinci ayağıdır (altıncısı, gerekçe ve rasyonel içeren DO-248C).

DO-330 içinde kendi hayat döngüsünü kurar: araç için de bir Tool Development Plan, Tool Verification Plan, Tool Quality Assurance Plan vardır. Yani araç, üzerinde çalıştığı yazılımın sertifikasyon süreç mantığını *kendisi için* uygular. Bu, standardın en incelikli yanıdır: bir araç DAL A yazılımı için TQL-1 seviyesinde nitelendirilecekse, o araç için üretilen kanıt paketi DAL A yazılımının kanıt paketine benzer bir sıkılıkta olmak zorundadır.

---

## Neden Bir Aracın "Nitelendirilmesi" Gerekir?

Çekirdek soru şudur: hangi araçlar? Bir editör (Emacs, VSCode) DO-330 kapsamına girer mi? Bir kelime işlemci (spesifikasyon yazan)? Basit bir shell script? Cevap DO-178C §11.20'de saklıdır: bir aracın nitelendirilmesi ancak o araç, standardın normalde talep ettiği bir *süreci* — bir doğrulama aktivitesini veya bir geliştirme aktivitesini — *ortadan kaldırıyor, azaltıyor veya otomatize ediyor*sa gereklidir. Çıktı manuel olarak doğrulanmıyorsa.

Bu son cümleyi vurgulamak lazım: **çıktı manuel olarak doğrulanmıyorsa**. Bir araç çalıştırıp sonucunu bir insanın gözü ile satır satır kontrol ediyorsanız, aracın kendisi nitelendirmeye tabi değildir. Doğrulama insanın omzunda kalır. Fakat bu tez pratikte çoğu zaman çürüktür: 200.000 satır yapısal kapsama raporunu bir insan gerçekten kontrol edemez; sadece "gördüm" der. Sertifika otoritesi böyle bir tezi kabul etmez. Bu yüzden pratikte, ciddi aviyonik projelerde araç sayısı 20–60 arasında değişir ve büyük çoğunluğu bir seviyede nitelendirilir.

Editör kapsam dışıdır çünkü tüm çıktısı (kaynak kod) sonradan derleyici, statik analizör, test aracı gibi ilerideki araçlar tarafından zaten kontrol edilir. Ama bir "kod otomasyonu" makrosu, insanların yazması gerekmeyen kodu üretiyorsa, o makro Criterion 1'e girebilir. Sınır her zaman "*bu çıktıyı başka bir şey doğruluyor mu?*" sorusunda belirlenir.

---

## Üç Kriter: Aracın Kimliği

DO-330 araçları üç kritere ayırır. Sözleşme cümleleri kritiktir; birebir bilinmesi gerekir:

- **Criterion 1** — *A tool whose output forms part of the airborne software and could therefore introduce an error.* Türkçesi: çıktısı uçuş yazılımının parçası hâline gelen ve dolayısıyla ona hata sızdırabilecek araç.
- **Criterion 2** — *A tool that automates verification activities and whose output is used to justify reducing or eliminating other verification or development processes.* Türkçesi: doğrulama aktivitelerini otomatize eden **ve** çıktısı başka doğrulama/geliştirme süreçlerini azaltmayı veya ortadan kaldırmayı meşrulaştırmak için kullanılan araç.
- **Criterion 3** — *A tool that, within the scope of its intended use, could fail to detect an error.* Türkçesi: kullanılış kapsamı içinde bir hatayı görmezden gelme ihtimali olan araç.

Bu üç tanım biraz aynı şeyi tekrar ediyor gibi görünse de aralarında keskin farklar var. Şöyle özetleyebiliriz:

<div class="mermaid">
flowchart TD
    A[Araç çıktısı uçuş yazılımının parçası mı?] -->|Evet| C1[Criterion 1: üretim aracı]
    A -->|Hayır - bir doğrulama aracı| B[Çıktısı başka bir sürecin yerine geçiyor mu?]
    B -->|Evet - ör. structural coverage manuel review yerine| C2[Criterion 2: yerine geçen doğrulama aracı]
    B -->|Hayır - sadece ek güven veriyor| C3[Criterion 3: ek güven aracı]
</div>

Criterion 1 kolay: kod üreteci, derleyici (bazı durumlarda), linker script otomasyonu, model-based tasarımdaki auto-code-generator hep buraya girer. Aracın hatası doğrudan uçan koda yansır.

Criterion 2 ve 3 arasındaki fark inceliklidir. Şöyle bir örnek düşünelim: bir statik analiz aracı MISRA C ihlallerini bulup rapor ediyor. Eğer proje planınızda "manuel kod review'da MISRA uyumu ayrıca kontrol edilecek" yazılıysa ve bu manuel review gerçekten yapılıyorsa, statik analiz aracı sadece ek güven veriyor demektir → **Criterion 3**. Ama planda "MISRA uyum kanıtı olarak statik analiz aracı çıktısı yeterlidir, ayrı review yapılmayacaktır" yazılıysa → aracın çıktısı manuel süreçlerin *yerine geçiyor* → **Criterion 2**.

Bu nedenle **aynı araç, aynı proje kapsamında, farklı intended use altında farklı kritere düşebilir.** Bu, DO-330'un en çok yanlış anlaşılan noktasıdır. Bir araca "TQL-5" etiketi vurup kenara koymak mümkün değildir; o etiket ancak Tool Qualification Plan (TQP)'da tanımlanmış belirli bir kullanım için geçerlidir.

---

## TQL Matrisi: 3 Kriter × 4 DAL

Kriter belirlendikten sonra, kullanılan yazılımın DAL seviyesi ile bir tabloya bakılır ve gereken **Tool Qualification Level** (TQL) çıkar:

| Yazılım DAL | Criterion 1 | Criterion 2 | Criterion 3 |
|:---:|:---:|:---:|:---:|
| **A**       | **TQL-1** | TQL-4 | TQL-5 |
| **B**       | **TQL-2** | TQL-4 | TQL-5 |
| **C**       | TQL-3     | TQL-5 | TQL-5 |
| **D**       | TQL-4     | TQL-5 | TQL-5 |

Matrisin okuma anahtarları:

- **TQL-1 en zorlu, TQL-5 en gevşek** seviyedir. Sayı küçüldükçe kanıt yükü artar.
- Yazılım DAL A ise, üretim aracı (Criterion 1) TQL-1'e çıkar — bu, aracın kendisinin neredeyse DAL A yazılımı gibi kanıtlanması demektir. Auto code generator satan bir şirket için bu, ürünün bütününü değil, belirli bir *kullanım profili*ni nitelendirmek anlamına gelir.
- Kriter 3, DAL seviyesi ne olursa olsun **TQL-5**tir. Sadece güven veren, kritik sürecin yerine geçmeyen bir araç sınırlı kanıtla yetinebilir.
- DAL D için Kriter 1 bile TQL-4'e düşer. DAL E (emniyet etkisi yok) tabii ki kapsam dışı.

Matrisi bir hafıza kancası olarak akılda tutmanın en kolay yolu: "üretim aracı DAL ile aynı şiddete tırmanır; doğrulama-yerine-geçen araç iki basamak (TQL-4/5) etrafında dolaşır; sadece güven veren araç her zaman TQL-5'te kalır."

---

## Kriter 2 vs Kriter 3: İnce Ayrımı Somutlaştırmak

Kriter 2 ve 3 arasındaki ayrım gerçek projelerde en sık tartışma çıkaran konudur. Şu iki cümle standart yorumunun kalbidir:

- **Kriter 2**: aracın çıktısı, DO-178C tablosundaki bir objective'i *azaltıyor veya ortadan kaldırıyor*. Yani başka türlü yapılacak bir işi bu araç yapıyor.
- **Kriter 3**: aracın çıktısı, DO-178C tablosundaki hiçbir objective'i azaltmıyor. Sürecin kendisi ayrıca yürütülüyor; araç sadece "ek göz".

İki örnekle netleşir:

1. **Yapısal kapsama aracı** (LDRA TBrun, VectorCAST/Cover, Rapita RapiCover). Uçuş yazılımında MC/DC kapsama kanıtı, DO-178C DAL A için tablo A-7 objective 8'in gereğidir. Bu kapsamayı üretmek için manuel yol pratikte imkânsızdır. Dolayısıyla yapısal kapsama aracı bu objective'in *tek gerçek kanıt üreteci*dir → başka bir sürecin yerine geçiyor → **Kriter 2** → DAL A yazılım için **TQL-4**.

2. **Genel amaçlı statik analiz aracı** (Coverity, Klocwork, PVS-Studio) yalnızca "kod kalitesi metriklerine ek görünürlük sağlamak" için kullanılıyorsa, DO-178C objective'lerinden hiçbirini ortadan kaldırmıyorsa → **Kriter 3** → **TQL-5**.

Kritik gözlem: **projedeki kullanım biçimini değiştirdiğinizde aracın TQL'i değişir.** Aynı Coverity, "MISRA-C uyum kanıtı üretilmesi için tek yol" olarak kullanılıyorsa Kriter 2'ye kayar. Bu nedenle Tool Qualification Plan'ın "intended use" bölümü uzatmalı ve titiz yazılmalıdır: neyin *yerine* geçtiğini, neyi *azaltmadığını* açıkça beyan etmek gerekir.

---

## Gerçek Araçlar Üzerinden Karar Ağacı

Şimdi Türkçe kaynaklarda neredeyse hiç yapılmamış olan alıştırmayı yapalım: yaygın araçları bu matrise oturtalım. Uyarı: her karar, aracın **hangi kullanımla, hangi DAL yazılımı için** kullanıldığına bağlıdır. Aşağıdaki sınıflandırma, yaygın kullanım profillerine göredir; gerçek proje bağlamında farklı çıkabilir.

| Araç | Tipik intended use | Kriter | DAL A → TQL |
|:---|:---|:---:|:---:|
| **arm-none-eabi-gcc** (kaynak → obje) | Derleyici, çıktı airborne kodun parçası | 1 | TQL-1 |
| **GNAT Pro Ada** (SPARK dahil) | Derleyici + formal analiz | 1 (+ 2) | TQL-1 (+ TQL-4) |
| **Simulink Coder / Embedded Coder** | Model → C/C++ auto-generation | 1 | TQL-1 |
| **ANSYS SCADE Suite KCG** | Sertifikalı kod üreteci | 1 | TQL-1 |
| **LDRA TBrun / VectorCAST** | Structural coverage kanıtı | 2 | TQL-4 |
| **AbsInt aiT WCET** | WCET kanıtı, ölçüm-tabanlı yaklaşımın yerine | 2 | TQL-4 |
| **Astrée** | Runtime hata kanıtı (formal) | 2 | TQL-4 |
| **Polyspace Bug Finder / Code Prover** | Kullanıma göre değişir | 2 veya 3 | TQL-4 veya TQL-5 |
| **Coverity / SonarQube** | Kalite metriği, ek göz | 3 | TQL-5 |
| **Python + pytest test scripti** | Requirements-based test çalıştırıcısı | 2 | TQL-4 |
| **Configuration management (Git + hooks)** | Baseline, versiyonlama | 3 | TQL-5 |
| **Rhapsody / Cameo review araçları** | Manuel review ek desteği | 3 | TQL-5 |
| **CI orchestrator (Jenkins pipeline)** | Otomasyon iskeleti | 3 | TQL-5 |
| **Doküman üreteci (Sphinx, LaTeX)** | Manuel doğrulanan çıktı | Kapsam dışı | — |

Bu tabloda tuzak birkaç noktada gizlidir:

**Derleyici mutlaka TQL-1 değildir.** DO-178C'nin ilginç bir okuma kolaylığı vardır: derleyici, üretilen makine kodunun *doğruluğu üzerinden* değil, üretilen kaynak-kod-eşleşmesinin *yapısal kapsama analizi ile doğrulanması* üzerinden meşrulaştırılabilir. Yani "compiler + object code coverage" ile derleyiciyi TQL-1'e çıkarmadan geçmek mümkün olabilir. Bu, uzun süredir sektörün gcc'yi resmi olarak TQL-1 nitelendirmesine gerek duymadan kullanabilmesinin ardındaki nedendir. Object code coverage'ın kendisi ayrıca bir tartışmadır (§6.4.4.2.b) ama derleyici nitelendirmesinden kaçınmanın yolu olarak kullanılır.

**Simulink Coder ile SCADE KCG arasındaki fark.** Her ikisi de kod üretecidir → Kriter 1 → TQL-1. Ama SCADE KCG **satıcı tarafından** DAL A için nitelendirilmiş olarak gelir; kullanıcı satıcının kanıt paketini kabul eder. Simulink Coder'ı DAL A için kullanmak istiyorsanız, ya MathWorks'ün DO Qualification Kit'ini alıp *kendi bağlamınızda* nitelendirmeyi tamamlamanız, ya da üretilen kodu bir "known good baseline" gibi ayrıca doğrulamanız gerekir. Bu, model-based development'ta kritik bir bütçe kararıdır.

**Kendi Python test aracınız muhtemelen TQL-4.** Ekiplerin en sık tökezlediği yer burasıdır. `pytest` üzerine yazılmış 5.000 satırlık ekip-içi test çerçevesi, "requirements-based test" objective'inin (DAL A tablo A-7 objective 1–4) yerine geçiyorsa Kriter 2'ye girer ve DAL A yazılımı için TQL-4 nitelendirmesine ihtiyaç duyar. TQL-4 kanıt yükü tahmin edildiğinden daha ağırdır: hayat döngüsü verileri, süreç planı, doğrulama kanıtı, konfigürasyon yönetimi ve QA denetimi hepsi araç için ayrı üretilmek zorundadır. Türkiye'de çoğu ekibin "kendi test aracımız" yerine olgun bir COTS test aracı (LDRA TBrun, VectorCAST, Rapita RVS) kullanmayı tercih etmesinin *sertifikasyon ekonomisi* açısından ana nedeni budur.

---

## TQL-4 ve TQL-5 Aslında Ne İster?

TQL matrisinin en çok karşılaşılan iki hücresi TQL-4 ve TQL-5. Kaba bir özet:

- **TQL-5**: DO-330 Tablo T-0 ve T-1'in en dar alt kümesi. Temel olarak *bir plan yaz, aracın intended use'unu ve operasyonel gereksinimlerini belge et, kurulum ve konfigürasyonunu izlenebilir hale getir, kullanım kayıtlarını sakla*. Yeni bir tool geliştirmiyorsanız, birkaç günlük iş yükü.
- **TQL-4**: Tablo T-1'in daha büyük bir kısmı. Aracın *tool operational requirements* seti, bu gereksinimlerin doğrulanma kanıtı (test raporu), konfigürasyon yönetimi, sorun raporlama süreci ve QA denetimi. Ek olarak: aracın *known problems* listesi ve *problem reports* düzenli olarak güncellenmelidir.

TQL-1/2/3 için ise DO-330 tam sertifikasyon paketi ister: plans (TQP, TDP, TVP, TCMP, TQAP), tool requirements ve design data, tool source code, tool test cases ve prosedürleri, koverage kanıtı, ve — TQL-1'e çıkıldığında — aracın DAL A yazılımı gibi izlenebilir olması. Bu paketin bir COTS satıcısı tarafından tek başına üretilmesi yıllar süren bir yatırımdır; bu yüzden gerçek TQL-1 nitelendirilmiş COTS araçlar çok azdır ve satın alma bedelleri milyon dolar mertebesindedir.

---

## En Sık Yapılan Hata: "Output Verification" Argümanı

Sertifika projelerinde ekipler tool qualification'dan kaçınmak için sıklıkla şu argümanı öne sürer: *"Aracın çıktısı zaten manuel doğrulanıyor, o yüzden nitelendirme gerekmez."* Bu argüman prensipte doğrudur (§11.20). Ama pratikte sertifika otoritesi bu argümanı kabul edebilmesi için üç şeyi görmek ister:

1. **Doğrulama gerçekten yapılıyor mu?** Bir insanın imzasının olduğu bir sayfa yetmez; hangi kriterlere göre doğrulandığı, kimin yaptığı, tekrar edilebilir olup olmadığı belgelenmiş olmalı.
2. **Doğrulama ölçeklenebilir mi?** 500 sayfalık kapsama raporunu manuel doğrulamak fiziken mümkün değildir. Sertifika otoritesi bunu bilir.
3. **Doğrulama gerçekten *bağımsız* mı?** Aynı ekip, aynı aracın çıktısını "kontrol ediyorum" derse bağımsızlık zayıflar. Farklı bir araç veya farklı bir gözle yapılıyor olması gerekir.

Bu üç kapının hiçbirinden geçmeyen bir "output verification" argümanı reddedilir ve proje geç bir tarihte tool qualification borcu ile başbaşa kalır. Bunu erken keşfetmek — plan aşamasında, PSAC'ta — bir sertifika projesinin bütçe ve takvim başarısı için belirleyicidir.

---

## Kanıt Paketi: Bir Aracın Kendi Hayat Döngüsü

Bir aracın TQL-4 seviyesinde bile nitelendirilmesi, aslında minyatür bir DO-178C süreci demektir. DO-330 Tablo T-0 aşağıdaki temel dokümanları tanımlar (paranteziler DO-178C plans-set eşdeğerleridir):

- **Tool Qualification Plan (TQP)** — nasıl PSAC'sa öyle. Aracın kim tarafından, hangi ortamda, hangi objective'lere göre nitelendirileceği.
- **Tool Development Plan (TDP)** — Software Development Plan eşdeğeri.
- **Tool Verification Plan (TVP)** — Software Verification Plan eşdeğeri.
- **Tool Configuration Management Plan (TCMP)** — Software CM Plan eşdeğeri.
- **Tool Quality Assurance Plan (TQAP)** — Software QA Plan eşdeğeri.
- **Tool Operational Requirements (TOR)** — aracın kullanıcı tarafından *nasıl kullanılacağına* dair gereksinimler. Bu, aracın "kabul kriterleri"ni verir.
- **Tool Operational Verification and Validation Cases and Procedures (TOVVCP)** — TOR'un test edilme prosedürleri.
- **Tool Accomplishment Summary (TAS)** — Software Accomplishment Summary eşdeğeri.

TQL-5'te bu setin çok küçük bir alt kümesi (temelde TQP + TOR + kullanım kanıtı) yeterlidir. TQL-4'te set genişler. TQL-1'e çıkıldığında satıcı belgelerinin yanına *tool source code* ve *tool structural coverage* dahi eklenir.

Pratik ipucu: hemen hemen her sertifika projesinde, TOR belgesi projenin tool qualification bütçesinde en çok gecikmeye yol açan artefakttır. Sebep basittir: bir aracın "operasyonel gereksinimlerini" yazmak, aracı kullanmayı öğrenmekle iç içedir ve çoğu ekip TOR'u projenin *sonlarına* doğru yazmaya başlar. En doğrusu, TOR'u aracı kullanmaya başlamadan önce çerçeve olarak yazmak, kullanım süresince olgunlaştırmaktır.

---

## LLM Destekli Kodlama Asistanları ve DO-330

Bir güncel soru: Copilot, Cursor, Claude Code gibi LLM destekli asistanlar DO-330 çerçevesinde nereye düşer? Bunun kesin bir sertifika otoritesi rehberi henüz yok (2026 itibarıyla EASA'nın AI Concept Paper'ının Level 1B/2 revizyonları hâlâ tartışmada). Ama DO-330 mantığıyla düşününce yol nettir.

Bir kod önerici, önerdiği kodu geliştiricinin gözden geçirdiği ve gerektiğinde reddettiği bir editör eklentisiyse — bir editör gibidir. Çıktısı, ilerideki derleyici, statik analizör, doğrulama araçları tarafından tekrar tekrar süzülür. Bu haliyle kapsam dışıdır. Fakat asistan yazılım-üretim akışında "otomatik kod ekle, çalıştır, teste sok, üretime bas" gibi bir zincirin parçası hâline gelirse ve geliştirici müdahalesi zayıflarsa, o zaman **Kriter 1** kapısını çalar — o çıktı airborne yazılımın parçası olur.

Birgitta Böckeler ve Martin Fowler'ın ThoughtWorks "Exploring Generative AI" yazı dizisinde vurguladıkları çekirdek nokta bu tartışmayı iyi çerçeveler: LLM asistanları verimliliği artırır *ama insan gözden geçirmesi kritik yollarda çıkarılırsa*, ekibin toplam hata dinamiği değişir. Simon Willison'ın "Vibe coding" yazılarında altı çizilen "kabul etmeden önce oku" ilkesi, DO-330 çerçevesindeki "output verification" mantığının modern dille söylenmiş hâlidir. Andrej Karpathy'nin aynı terimi popülerleştiren yaklaşımı prototip için mükemmeldir, ama emniyet-kritik projede olduğu gibi taşınamaz — üretimi geliştirici gözden geçirmiyorsa, araç Kriter 1'e taşınır ve sertifikasyon yükü bir anda katlanır.

Türkiye'de aviyonik ve savunma ekipleri (TUSAŞ, ASELSAN, BAYKAR, HAVELSAN, STM) LLM asistanlarını benimserken pratik strateji aynı olmalı: **asistan çıktısını insan review'ının yerine geçirmeyin, yanına koyun.** Kod önerisini kabul etmeden okuyun, üretilen testleri kabul etmeden gözden geçirin. Bu yapıldığı sürece asistan bir "productivity accelerator"dır, DO-330 kapsamına girmez. Yapılmadığında Kriter 1 yükü kaçınılmazdır ve TQL-1 nitelendirmesi bir LLM asistanı için bugünkü teknolojiyle pratik olarak imkânsızdır (model değişkenliği, tekrar üretilebilirlik problemi).

Sektör 5 yılda büyük olasılıkla iki katmana ayrışacak: (1) mevcut sertifikalı zincirlerin içinde asistanı yalnızca insan-gözden-geçirmesi ile besleyen ekipler, (2) sertifikalı kod üreteci olmak için model davranışını "constrained decoding" ve formal spec ile sınırlandıran ilk COTS satıcıları. İkincisi henüz erken evre, ama sertifikasyon otoritelerinin bu yönde *Discussion Paper*'larla ısınmasını bekleyebiliriz.

---

## Pratik Tavsiyeler — Sahaya Yakın

Uzun bir standart tartışmasının sonunda, bu yazının somut çıkarımlarını dört madde olarak toplayabilirim:

1. **Tool listesini erken çıkarın.** Projenin başında (PSAC yazım aşamasında), kullanılacak tüm araçların bir listesi ve her biri için kriter belirlenmiş olmalı. Ortaya listenin kabaca yarısı Kriter 3, geri kalanı Kriter 2, birkaç tanesi Kriter 1 olarak çıkar. Bu liste "living document"tır; proje süresince değişir ama başlangıç fotoğrafı olmadan bütçe gerçekçi olamaz.

2. **Intended use'u dar yazın.** TQP'de aracın intended use'unu "genel" değil, "spesifik" tanımlayın. Örneğin "LDRA TBrun ile MC/DC kapsama üretilecek, condition coverage veya branch coverage kanıtı bu araçla üretilmeyecektir" gibi dar cümleler, kanıt yükünü aracın gerçekten kullanılan yönleriyle sınırlı tutar.

3. **COTS tercih edin, kanıt paketi al.** Bir aracın satıcı tarafından TQL-4 nitelendirilmiş versiyonuyla gelmesi, projenizin aylarını kurtarır. Satın alma anında satıcının Tool Qualification Kit'inin projenizin DAL seviyesini kapsayıp kapsamadığını mutlaka doğrulayın. Bir ambalajın "DO-178C ready" yazması yeterli değildir; hangi *TQL* için, hangi DAL için ve hangi kullanım profili için nitelendirmiş olduklarını görün.

4. **Kendi araç yazmaktan kaçının.** Bir Python test scriptinin yıllar içinde büyüyerek 10.000 satırlık bir çerçeveye dönüştüğü çok gördüm. Sonuç neredeyse her zaman aynı: proje DAL A'ya çıkıldığı gün, bu çerçeve TQL-4 borcu olarak masaya oturur ve ekibin altı ayı bu borcu ödemekle geçer. Sertifikasyon ekonomisi olgun COTS'un lehinedir.

---

## Sonuç

DO-330, DO-178C setinin en az konuşulan ama en sık yakalanılan halkasıdır. Süreç metriklerinizi (yapısal kapsama, gereksinim doğrulama, statik analiz) araçlarla ürettiğiniz için, bu araçların kendisi projenizin kanıt zincirinin parçasıdır. Üç kriter × dört DAL matrisi göründüğü kadar mekanik değildir: aracın *intended use*'una ve projenizin *plan ne der*'ine göre kayar. TQL-4 ve TQL-5 arasındaki fark bir alan, ama TQL-4 ile TQL-1 arasındaki fark bir okyanustur; aracın hangi tarafa düştüğünü erken teşhis etmeden proje bütçesi tahmin edilemez.

Sahadaki en pratik zihinsel model şudur: aracın çıktısını *başka bir aracın veya başka bir insanın gerçekten kontrol edip etmediğini* sor. Ediyorsa Kriter 3 ya da kapsam dışı. Etmiyorsa Kriter 2 veya Kriter 1. Cevabı proje planında yazmak, sonradan hatırlayarak yazmaktan çok daha ucuzdur.

---

## Kaynaklar

- [RTCA DO-330 — Software Tool Qualification Considerations (2011)](https://www.rtca.org/) — Standardın kendisi ücretli; RTCA/EUROCAE üzerinden temin edilir.
- [DO-330 Introduction – Tool Qualification (AFuzion)](https://afuzion.com/do-330-introduction-tool-qualification/)
- [DO-330 Software tool qualification considerations (TASKING, eski LDRA sayfası)](https://www.tasking.com/do-330/)
- [DO-330 (Rapita Systems)](https://www.rapitasystems.com/do-330)
- [DO-330 Introduction: Software Tool Qualification (Visure)](https://www.visuresolutions.com/do-178-guide/do-330/)
- [Trusting the tools: an agile approach to tool qualification for DO-178C (Military Embedded Systems)](https://militaryembedded.com/avionics/safety-certification/trusting-tools-agile-approach-tool-qualification-do-178c)
- [Formal Methods Tool Qualification, NASA/CR–2017-219371](https://shemesh.larc.nasa.gov/fm/FMinCert/NASA-CR-2017-219371.pdf)
- [DO-178C — Software Considerations in Airborne Systems and Equipment Certification (arc42 quality model)](https://quality.arc42.org/standards/do-178c)
- [FAA Advisory Circular AC 20-115D — Airborne Software Development Assurance](https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_20-115D.pdf)
- [Birgitta Böckeler & Martin Fowler — Exploring Generative AI (ThoughtWorks)](https://martinfowler.com/articles/exploring-gen-ai.html)
- [Simon Willison — Vibe coding notları](https://simonwillison.net/tags/vibecoding/)

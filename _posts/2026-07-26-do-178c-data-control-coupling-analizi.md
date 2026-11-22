---
title: "DO-178C Data ve Control Coupling — MC/DC Bittikten Sonra Yarım Kalan Structural Coverage"
subtitle: "DCCC Analysis in DO-178C: The Half of Structural Coverage Most Teams Get Wrong"
background: "/img/posts/9.webp"
date: '2026-07-26 09:00:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [do-178c, emniyet-kritik]
---

DAL A bir modülü bitirdiniz. Statement, decision ve MC/DC kapsamalarının hepsi %100. Kapsama raporunu klasöre koyup rahat bir nefes aldınız — sertifikasyon açısından "structural coverage" işi kapandı sanıyorsunuz. Sonra bağımsız gözden geçirici (DER veya iç kalite ekibi) tek bir soruyla geliyor: *"Data coupling ve control coupling analizinizin sonucu nerede?"* Cevap yoksa DO-178C Tablo A-7 objektif 8 açık; DAL A ve B için bağımsızlık şartıyla. Uçmuyorsunuz.

DCCC (data coupling & control coupling coverage) analizi, structural coverage'ın MC/DC ile aynı tablodaki ama çok daha az konuşulan yarısıdır. Bu yazıda önce standardın ne dediğine bakıyoruz, ardından CAST-19 pozisyon kâğıdının neyi düzelttiğine; sonra üç modüllük küçük bir aviyonik C örneği üzerinde önce statik faz (potansiyel coupling'lerin çıkarılması), sonra dinamik faz (requirements-based testlerle hangi coupling'in "exercised" edildiği) somut olarak yürütülüyor. Son bölüm neden takımların bu objektifi yanlış anladığını ve entegrasyon test planına bunu baştan gömmenin nasıl yapılacağını ele alıyor.

---

## Standart tam olarak ne diyor?

DO-178C'de iki yer sizi bağlar. Birincisi Tablo A-7 (*Verification of Verification Process Results*) objektif 8: **"Test coverage of software structure (data coupling and control coupling) is achieved."** Bu satır DAL A, B ve C için gereklidir; DAL A ve B'de **bağımsızlıkla** sağlanır — yani analizi ve doğrulamayı üretici mühendisin dışında birinin yapması gerekir.

İkincisi, standardın 6.4.4.2 bölümünün ilgili paragrafı structural coverage analizini üç parça olarak sıralar: (a) statement / decision / MC/DC kapsaması, (b) source-to-object code kapsaması (yalnızca DAL A), (c) **"analysis to confirm that the requirements-based testing has exercised the data and control coupling between code components."** Yani DCCC, kapsama analizinin *ayrı bir kalemi* olarak listelenir; MC/DC ile yer değiştirmez, MC/DC'nin bir alt kümesi de değildir.

Bu ayrım kritik. Tablo A-7 objektif 8, aynı tablodaki objektiflerden farklı bir soruyu yanıtlar:

- MC/DC (objektif 5) tek bir kod bloğunun *içindeki* karar mantığının yeterince zorlanıp zorlanmadığını ölçer.
- Source-to-object (objektif 9) derleyicinin ürettiği ikiliye kaynak kodun eksiksiz yansıyıp yansımadığını ölçer.
- DCCC (objektif 8) modüller *arasındaki* etkileşimlerin gereksinim tabanlı testlerle gerçekten çalıştırılıp çalıştırılmadığını ölçer.

DO-178C, DO-178B'ye göre bu maddeyi kayda değer biçimde sıkılaştırdı: 178B'nin ilgili tümcesi daha yorumlanabilirdi ve pratikte birçok takım "modüller çağırıldı, iş bitti" diyerek geçiştiriyordu. 178C, "*requirements-based testing has exercised*" ifadesini kalın çizgiyle koydu — sadece kod dinamik olarak yürütüldü değil, gereksinim tabanlı test setinizin ta kendisi bu ilişkileri tetiklemiş olmalı.

---

## CAST-19 neyi düzeltti?

Standart bu kadar açık olduğu hâlde uygulamada tutarsızlık o kadar büyüktü ki, Amerika, Avrupa ve Kanada sertifikasyon otoritelerinin ortak çalışma grubu olan CAST (Certification Authorities Software Team) Ocak 2004'te bir pozisyon kâğıdı yayımladı: **CAST-19, "Clarification of Structural Coverage Analyses of Data Coupling and Control Coupling"**. Bugün hâlâ DER'lerin bavulundadır; DO-178C güncellendiğinde bile CAST-19'un tanımları ve niyet açıklaması geçerliliğini korudu.

CAST-19'un kendi cümleleriyle tanımlar şöyle:

> **Data coupling:** "The dependence of a software component on data not exclusively under the control of that software component."
>
> **Control coupling:** "The manner or degree by which one software component influences the execution of another software component."

Basitleştirirsek: **data coupling** bir modülün başka bir modüle bıraktığı veya başka bir modülden aldığı veriye olan bağımlılığıdır — global değişkenler, paylaşılan buffer'lar, fonksiyon parametreleri, dönüş değerleri hep buraya girer. **Control coupling** ise bir modülün başka bir modülü "ne zaman", "hangi koşulda", "hangi sırayla" çalıştırdığını belirleyen ilişkidir — bir fonksiyon çağrısının varlığı, bir bayrağa göre farklı bir dalın seçilmesi, bir kesmenin başka bir görevi uyandırması.

CAST-19'un düzelttiği yaygın yanılgı, DCCC objektifinin ne için var olduğuydu. Pozisyon kâğıdı analizin niyetini tek cümlede özetler: modüllerin **tasarımcının istediği biçimde birbirini etkilediğini ve istemediği biçimlerde etkilemediğini** göstermek. Yani sadece "arayüz mevcut" değil, arayüzün *o gereksinimin gerektirdiği biçimde ve yalnızca o biçimde* çalıştığının kanıtı. Ölçüm de bir kez daha vurgulanır: **entegre bileşenlerin gereksinim tabanlı testleri sırasında** yapılır — birim testte veya kaba fonksiyonel testte değil.

CAST-19'un yardımcı bir noktası daha var: objektif, "statik bir aktivite (link map veya çağrı ağacı inceleme), dinamik bir aktivite (test çalıştırma) veya ikisinin bir birleşimi" ile sağlanabilir. Pratikte modern takımların hepsi **hibrit** yaklaşım kullanır: coupling *envanteri* statik analizle çıkarılır, *exercise* kanıtı dinamik izleme ile toplanır. Nedenini biraz sonraki örnekte göreceksiniz.

---

## Ne DEĞİL? — En sık gördüğüm dört yanlış anlaşılma

Bir DCCC bulgusu ile karşılaşan takımın ilk refleksleri genelde şudur:

**Yanlış 1 — "MC/DC %100'e ulaştıysak DCCC da otomatik olarak sağlanır."** Sağlanmaz. MC/DC bir kod bloğunun içindeki koşulları zorlar; iki farklı modülün ortak bir global üzerinden konuşup konuşmadığını sormaz. Örnek: `ahrs.c` içindeki `estimate_attitude()` fonksiyonu MC/DC olarak %100 kapsanabilir, ama içinde okuduğu `imu_data_ready_flag` bayrağını başka bir modülün ne zaman set ettiği hiç test edilmemiş olabilir. MC/DC bunu görmez.

**Yanlış 2 — "Unit test'te fonksiyon çağrıldıysa control coupling exercised olmuş demektir."** Değildir. Unit test, çağrılan modülü genellikle *stub'lar*. Yani gerçek modülün gerçek karar mantığıyla çağrı yapılmaz. Entegrasyon aşamasında iki gerçek modülün birbirini gerçek koşullarda çağırdığının kanıtı gerekir.

**Yanlış 3 — "Modül A modül B'yi çağırıyorsa bu bir control coupling'tir; çağrı sayısına bakarız."** Yetmiyor. Modül A, modül B'nin `foo()` fonksiyonunu şart 1'de çağırıp, `bar()` fonksiyonunu şart 2'de çağırıyorsa iki farklı control coupling ilişkisi vardır; her ikisinin de gereksinim tabanlı testle tetiklendiğinin gösterilmesi gerekir. Aynı şekilde `foo()` çağrısı bir `if` içinde yaşıyorsa, o `if`'in *her iki dalı* için (çağrı olan ve olmayan) requirements-based testin var olması ve o modüllerin arasındaki karar sonucunun gözlenmesi beklenir.

**Yanlış 4 — "Global değişkeni okuyorsam bu bir data coupling'tir; test setim modülü koşuyorsa yeter."** Coupling ilişkisi *set-use çifti* düzeyinde tanımlanır. Değişkeni birden fazla modül yazıyorsa, hangi *yazan* modülün, hangi *okuyan* modülü etkilediği ayrı ilişkilerdir. `imu_data_ready_flag` bayrağını hem `imu_isr()` set ediyor hem `builtin_test()` set edebiliyorsa, iki farklı set-use çiftinin de exercised edildiğinin kanıtı gerekir. Bunun mühendislik faydası da açık: iki farklı setter varsa, gereksinimin ikisinden de haberi olmalı, yoksa "istenmeyen etki" gerçekleşiyor demektir.

---

## Somut örnek: üç modüllük bir IMU/AHRS boru hattı

Bir aviyonik bileşenimiz olsun. Üç C modülü, ortak bir arayüz dosyası:

```c
/* imu_driver.h */
#include <stdint.h>

typedef struct {
    float wx, wy, wz;     /* rad/s */
    float ax, ay, az;     /* m/s^2 */
    uint32_t seq;
} imu_sample_t;

extern volatile uint8_t   imu_data_ready_flag;
extern volatile uint8_t   imu_fault_flag;
extern imu_sample_t       imu_last_sample;

void imu_driver_init(void);
void imu_isr(void);                  /* SPI DMA tamam kesmesi */
void imu_builtin_test(void);         /* periyodik BIT */
```

```c
/* ahrs.h */
typedef struct {
    float roll, pitch, yaw;
    uint8_t valid;
} attitude_t;

void ahrs_init(void);
void ahrs_step(attitude_t *out);     /* 100 Hz görev */
```

```c
/* tm_scheduler.h */
void tm_scheduler_tick(void);        /* 100 Hz zamanlayıcı */
```

Modüllerin içi kısaca şöyle çalışıyor. `imu_driver.c` SPI DMA tamamlanma kesmesinde `imu_isr()` içinden `imu_last_sample`'ı yazar ve `imu_data_ready_flag`'i 1 yapar. `imu_builtin_test()` periyodik BIT sırasında hata bulursa `imu_fault_flag`'i 1'e çeker; buluttmazsa `imu_data_ready_flag`'e dokunmaz. `ahrs.c` içindeki `ahrs_step()`, `imu_data_ready_flag` set ise `imu_last_sample`'ı okur, `attitude_t` üretir ve bayrağı temizler; değilse `out->valid = 0` verir. `imu_fault_flag` set ise `out->valid = 0` ve bir alarm bayrağı üretir. `tm_scheduler_tick()`, `ahrs_step()`'i 100 Hz çağırır ve sonucu telemetriye koyar.

### Statik faz — potansiyel coupling'lerin envanteri

Bir statik analiz aracının (LDRA TBvision, VectorCAST, Rapita RVS, Coverity gibi) bize vereceği çıktıyı elle çıkaralım. Önce **çağrı grafiği** (control coupling adayları):

<div class="mermaid">
graph LR
    ISR[imu_isr] -.SPI DMA done.-> IMU[imu_driver internals]
    BIT[imu_builtin_test] --> IMU
    TICK[tm_scheduler_tick] --> AHRS_STEP[ahrs_step]
    AHRS_STEP --> READ[imu_data okuma]
    TICK --> TM[telemetry_publish]
</div>

Kontrol coupling adayları: `tm_scheduler_tick → ahrs_step`, `tm_scheduler_tick → telemetry_publish`. `imu_isr` ve `imu_builtin_test` doğrudan başka bir modülü çağırmıyor, ama diğer modüllerin davranışını *veri üzerinden* değiştiriyorlar (bunlar data coupling).

Sonra **set-use çiftleri** (data coupling adayları):

| Değişken | Yazan modül | Okuyan modül | Set-use çifti |
|---|---|---|---|
| `imu_data_ready_flag` | `imu_driver.imu_isr` | `ahrs.ahrs_step` | DC1 |
| `imu_data_ready_flag` | `ahrs.ahrs_step` (temizleme) | `ahrs.ahrs_step` (sonraki tur okuma) | DC2 (aynı modül içi — coupling *değildir*, bilgi amaçlı) |
| `imu_last_sample` | `imu_driver.imu_isr` | `ahrs.ahrs_step` | DC3 |
| `imu_fault_flag` | `imu_driver.imu_builtin_test` | `ahrs.ahrs_step` | DC4 |
| `attitude_t out` (yapı üyeleri) | `ahrs.ahrs_step` | `tm_scheduler.tm_scheduler_tick` | DC5 (parametre) |

Ve control coupling ilişkilerini daha ince ayrıştıralım:

| ID | İlişki | Anlam |
|---|---|---|
| CC1 | `tm_scheduler_tick` → `ahrs_step` çağrısı — her tick | Her 10 ms |
| CC2 | `ahrs_step` içi `if (imu_data_ready_flag) { ... }` "true" dalı → `imu_last_sample` okuma | Veri hazır yolu |
| CC3 | `ahrs_step` içi "false" dalı → `out->valid = 0` | Veri yok yolu |
| CC4 | `ahrs_step` içi `if (imu_fault_flag) { ... }` "true" dalı → alarm bayrağı | Fault yolu |
| CC5 | `tm_scheduler_tick` içi `if (out.valid) telemetry_publish(...)` | Yayınlama kararı |

Statik faz bize şu envanteri verdi: **5 data coupling ilişkisi (DC2 aynı modülde, coupling dışı) + 5 control coupling ilişkisi**. Bu envanter *tavan* değil, *taban*: gerçekte pointer aritmetiği, fonksiyon pointer'ları veya derleyici sonrası uzantılar gibi statik analizin göremediği ek ilişkiler olabilir. Bu nedenle CAST-19 dinamik gözlemi zorunlu tutar.

### Dinamik faz — gereksinim tabanlı testin verdikleri

Şimdi bileşenin üst gereksinimlerini düşünelim. Diyelim ki gereksinim seti şöyle:

- **HLR-01:** IMU'dan geçerli bir örnek geldiğinde, sistem 20 ms içinde geçerli bir attitude çıktısı üretmelidir.
- **HLR-02:** IMU'dan iki ardışık örnek gelmezse, attitude çıktısı invalid işaretlenmelidir.
- **HLR-03:** BIT arıza bildirdiğinde, attitude çıktısı invalid işaretlenmeli ve fault alarmı yayınlanmalıdır.
- **HLR-04:** Attitude çıktısı invalid iken telemetri yayınlanmamalıdır.

Bu gereksinimlere karşılık gelen dört RBT (requirements-based test) senaryosu düşünelim:

- **T1 (nominal):** IMU örnek gelir → `ahrs_step` sonuç üretir → telemetri yayınlanır.
- **T2 (veri yok):** IMU kesmesi hiç gelmez → `ahrs_step` invalid döner → telemetri yayınlanmaz.
- **T3 (BIT arıza):** BIT fault set eder → `ahrs_step` invalid döner + alarm → telemetri yayınlanmaz.
- **T4 (arıza sonrası nominal):** Önce T3, sonra BIT temizler ve nominal örnek gelir.

Enstrümante edilmiş çalıştırma sonrası coupling ilişkilerinin kapsama matrisi:

| İlişki | Tür | T1 | T2 | T3 | T4 | Exercised? |
|---|---|---|---|---|---|---|
| DC1 (`imu_data_ready_flag`: `imu_isr` → `ahrs_step`) | data | ✓ | | | ✓ | Evet |
| DC3 (`imu_last_sample`: `imu_isr` → `ahrs_step`) | data | ✓ | | | ✓ | Evet |
| DC4 (`imu_fault_flag`: `imu_builtin_test` → `ahrs_step`) | data | | | ✓ | ✓ | Evet |
| DC5 (`attitude_t`: `ahrs_step` → `tm_scheduler_tick`) | data | ✓ | ✓ | ✓ | ✓ | Evet |
| CC1 (`tm_scheduler_tick` → `ahrs_step`) | control | ✓ | ✓ | ✓ | ✓ | Evet |
| CC2 (`ahrs_step` içi data-ready true → okuma) | control | ✓ | | | ✓ | Evet |
| CC3 (`ahrs_step` içi data-ready false → invalid) | control | | ✓ | | | Evet |
| CC4 (`ahrs_step` içi fault true → alarm) | control | | | ✓ | ✓ | Evet |
| CC5 (`tm_scheduler_tick` içi valid → publish) | control | ✓ | | | ✓ (kısmen) | Evet |

Şimdi ilginç yer. Bir gözden geçirici bu tabloyu görüp haklı olarak sorabilir:

> — `imu_data_ready_flag` başka bir setter'dan da geliyor mu? Örneğin bir güç açılış senaryosunda?

Kod baktığımızda `imu_driver_init()` içinde de bayrağı 0'lıyoruz — bu bir "set" sayılır ve `ahrs_step` okuma tarafıyla bir çift daha oluşturur: **DC1'.** Test setine bu çifti tetikleyecek bir "sıfırdan boot" senaryosu eklenmediyse, statik faz olası ilişkiyi çıkardı ama dinamik faz "exercised" damgasını basamaz — objektifin kapanmadığı yer burasıdır. CAST-19'un ısrarla vurguladığı nokta budur: **statik envanter kadar kapsama bir yükümlülüktür**, sadece "çalıştırdım, testler geçti" değil.

Aynı şekilde CC4'ün "false" dalını (fault temizken çağrının kısa yoldan geçmesi) yalnızca T1'in kapsadığı görülür; ama fault-temiz + data-yok kombinasyonu (T2 doğru sayılabilir ama fault-flag'in false olduğu ayrıca gözlenmesi gerekiyor mu?) gibi ince noktalar analizde çıkmalı ve gerekiyorsa test seti tamamlanmalıdır. Objektifin ruhu, "bulunan her ilişkinin gereksinim tabanlı bir senaryodan geçmesidir" — kombinatoryal patlamayı önlemek adına, DCCC kapsaması *set-use çifti* düzeyinde ölçülür, tüm kombinasyonlar düzeyinde değil. Bu MC/DC ile karışmasın: MC/DC koşulların bağımsız etkisini arar; DCCC ilişkilerin *varlığının bir kez zorlanmasını* arar.

---

## Envanter üretimini elle yapmak istersen — küçük bir yardımcı script

Ticari araç yoksa bile, ön çalışma için basit bir statik envanter script'iyle çok yol alınır. Aşağıdaki Python taslak, `clang -Xclang -ast-dump=json` çıktısı üzerinden global set-use çiftlerini ve modüller arası çağrıları çıkarmanın iskeletidir. Sertifikasyon aracı yerine geçmez (bkz. DO-330 tool qualification), ama planlama aşamasında test tasarımını yönlendirmek için işe yarar:

```python
import json, sys, collections

# clang -Xclang -ast-dump=json -fsyntax-only <file>.c > ast.json
data = json.load(open(sys.argv[1]))

writes = collections.defaultdict(set)   # var -> set of (module, function)
reads  = collections.defaultdict(set)
calls  = collections.defaultdict(set)   # (from_module, from_fn) -> callee

def walk(node, module, cur_fn=None):
    kind = node.get("kind")
    if kind == "FunctionDecl":
        cur_fn = node["name"]
    if kind == "BinaryOperator" and node.get("opcode") == "=":
        lhs = node["inner"][0]
        if lhs.get("kind") == "DeclRefExpr":
            var = lhs["referencedDecl"]["name"]
            writes[var].add((module, cur_fn))
    if kind == "DeclRefExpr" and node.get("referencedDecl", {}).get("kind") == "VarDecl":
        var = node["referencedDecl"]["name"]
        reads[var].add((module, cur_fn))
    if kind == "CallExpr":
        callee = node["inner"][0].get("referencedDecl", {}).get("name")
        if callee:
            calls[(module, cur_fn)].add(callee)
    for child in node.get("inner", []):
        walk(child, module, cur_fn)

walk(data, module=sys.argv[2])

# Set-use çiftleri (data coupling adayları):
for var in set(writes) & set(reads):
    for w in writes[var]:
        for r in reads[var]:
            if w[0] != r[0]:
                print(f"DC: {var}: {w[0]}.{w[1]} -> {r[0]}.{r[1]}")

# Modül-modül çağrılar (control coupling adayları):
for (m, f), callees in calls.items():
    for c in callees:
        print(f"CC?: {m}.{f} -> {c}")
```

Gerçek bir projede statik envanter aracını değiştirecek olgunlukta bir script değil; niyeti gösteren minimal bir iskelet. Ama bu 30 satırı bir CI adımına koymak, "yeni bir global değişken erken evre baremli mi" gibi sorulara erken yanıt verir.

---

## Hibrit ölçüm: statik + dinamik faz neden ikisi de gerekli?

Yalnız statik: aracın gördüğü ilişkiler için tavan çıkar; ama pointer indirection, fonksiyon pointer tabloları (örn. sanal fonksiyon dispatch, bir "dispatcher_t[]" dizisinden çağrı), inline assembly, DMA'nın belleğe yazması gibi konularda kör kalır. Bu ilişkiler *var* olmalarına rağmen çağrı grafiğinde görünmez.

Yalnız dinamik: aracın enstrüman ettiği yerlerde gerçek exercise'ı görürsünüz, ama gördüğünüzün "kapsama" olduğunu iddia edemezsiniz — çünkü "başka hangi ilişki var mıydı" sorusunun cevabı statik envantere gömülüdür. Yalnız dinamik ölçümle bir DER'e "coupling kapsamamız %100" demek anlamsızdır: "%100 *neyin*?"

Bu yüzden LDRA, Rapita RVS ve VectorCAST'in DCCC modülleri hepsi **hibrit** çalışır: derleme aşamasında statik envanter, koşum sırasında enstrümantasyon, sonra iki çıktının çakıştırılması. Kapsama raporu şu üç kolonu içerir: (a) statik envanter, (b) dinamik olarak gözlenen ilişkiler, (c) ikisinin farkı — yani "gördüm ama zorlayamadım" listesi. Sertifikasyon dosyanızın gövdesi de tam olarak bu üçüncü kolonun *neden boş* olduğunu (veya boş değilse *hangi gereksinimin eksikliğinden geldiğini*) açıklayan analizdir.

Bir yan not: hibrit araç çıktısı doğrudan bir sertifikasyon kanıtına dönüştürüldüğünde, o araç DO-178C çerçevesinde bir "software verification tool" haline gelir. Otomatikleştirdiğiniz doğrulama sürecinin çıktısına güvendiğiniz oranda araç için DO-330 kapsamında **tool qualification** (uygun TQL seviyesinde) yapılması gerekebilir; DAL A'da çoğunlukla TQL-4 (verification-only tool) gerekir. Bu bir bürokrasi meselesi değil, "aracın hata etmediğini bağımsız olarak gösterdik mi" sorusunun cevabıdır.

---

## Süreç tarafı: entegrasyon test planına baştan gömmek

Görülme sıklığına göre pratik önerilerim:

**Envanter üretimini design faz çıktısı say.** Coupling'i test aşamasında keşfetmek geç kalmışlıktır. Modüller arası arayüz dokümanı zaten var; oraya set-use tablosunu ve control coupling matrisini bir ek olarak eklemek çok az iş, ama test tarafına hedef üretir. Böylece "hangi test hangi ilişkiyi kapsar" izlenebilirlik matrisi RBT'nin bir sütunu olur.

**RBT tasarımını "hikaye" değil "durum" tabanlı düşün.** Nominal senaryo + bir kaçış yolu genelde MC/DC'yi doyurur ama DCCC'yi doyurmaz. Fault-injection'lar, boot senaryoları, watchdog reset sonrası döngüler, iki farklı setter'ın araya girdiği yarış koşulları — bunlar CC/DC ilişkilerini zorlar. Setter'ları haritalayıp her setter için en az bir gereksinim tabanlı zorlama şart.

**Global durum minimizasyonu bir mühendislik meselesi.** DCCC yükü modülleriniz arasındaki paylaşılan durum sayısıyla doğrusal büyümez, süperliner büyür — her yeni global bir set-use tablosunun ortaya çıkardığı yeni çiftleri getirir. Tasarım aşamasında bir bayrağı kaldırıp fonksiyon parametresine dönüştürmek, DCCC efortunu ölçülebilir biçimde düşürür. (Coupling'in "iyi/kötü" değil "yönetilecek bir nitelik" olduğu tartışması için önceki [Coupling'i Dengelemek]({% post_url 2026-06-04-coupling-dengesi %}) yazısına bakabilirsiniz — o yazı design bakış açısını, bu yazı sertifikasyon bakış açısını verir.)

**Bağımsızlığı önceden planla.** DAL A ve B'de objektif independence şartıyla; yani DCCC analizini yürüten ve çıktıyı kabul eden kişilerin geliştirici olmaması, tercihen ayrı bir doğrulama ekibinde olması gerekir. Bunu takvim sonuna atarsanız, entegrasyon testi bitmiş olur ama kabul yeşilı gecikir.

**Multicore girildiyse CAST-32A'yı da hatırla.** Multicore uygulamalar için A(M)C 20-193 ve CAST-32A ek objectives getirir; bunlar arasında paylaşılan kaynak ("interference channel") analizinin de olması gerektiğinin unutulmaması gerekiyor. DCCC ilişkilerinin bir kısmı bu bağlamda "interference" olarak da yeniden analiz edilecektir.

---

## Toparlarken

DO-178C structural coverage bir masanın dört ayağıdır: statement, decision, MC/DC ve DCCC. İlk üçünü yeşile boyayıp dördüncüyü unutmak, sadece objektif 8'i sağlamamak değil; standartın altında yatan mühendislik argümanını da eksik bırakmaktır. Argüman şu: iyi test edilmiş bir modül *tek başına* iyi test edilmiş olabilir, ama iyi test edilmiş bir sistem *modüller arasındaki her etkileşimin tasarımcının istediği biçimde çalıştığının kanıtına* sahip olan sistemdir.

DCCC'nin işi bunu göstermektir. Ve gösterdiği iş, aslında bir modülün "temiz tasarlanmış olup olmadığının" en dürüst göstergesidir: gizli globaller ne kadar çoksa envanter ne kadar şişerse, "exercised" damgası ne kadar zor basılıyorsa, tasarımınız o kadar sıkı bağlanmış demektir. Bu yüzden sertifikasyon aslında bir mühendislik kalitesi ölçüsüdür — bürokrasiye indirgemek yerine, coupling analizinin ortaya çıkardığı ilişkileri baştan aza indirmeyi hedefleyen bir tasarım kültürü, hem uçmak için gereken kanıtı hem de bakımını yapmayı kolaylaştıran bir kod tabanını birlikte üretir.

---

## Kaynaklar

- RTCA/EUROCAE — DO-178C / ED-12C, *Software Considerations in Airborne Systems and Equipment Certification* (2011). Genel bakış: [DO-178C (Wikipedia)](https://en.wikipedia.org/wiki/DO-178C).
- CAST — *Position Paper CAST-19: Clarification of Structural Coverage Analyses of Data Coupling and Control Coupling* (Ocak 2004, Rev 2). FAA CAST papers sayfasından erişilebilir: <https://www.faa.gov/aircraft/air_cert/design_approvals/air_software/cast/cast_papers>.
- Rapita Systems — [Data Coupling & Control Coupling for DO-178C](https://www.rapitasystems.com/dccc) ve [Introduction to Data Coupling and Control Coupling for DO-178C](https://www.rapitasystems.com/blog/introduction-data-coupling-and-control-coupling-do-178c).
- LDRA — [Data Coupling and Control Coupling (DCCC) analysis](https://ldra.com/capabilities/data-couplingcontrol-coupling/) ve *Understanding and Measuring DCCC* teknik beyaz kâğıdı.
- AdaCore — [Compliance with DO-178C/ED-12C Guidance: Analysis](https://learn.adacore.com/booklets/adacore-technologies-for-airborne-software/chapters/analysis.html), *DCCC'nin analitik ve dinamik yönleri*.
- CAST-32A ile ilişki için: A(M)C 20-193 özet — [Rapita Systems, AMC 20-193](https://www.rapitasystems.com/amc-20-193).
- DO-330 tool qualification arka planı için — MC/DC ve DCCC otomasyonu tool qualification perspektifi: [LDRA — Tool Qualification](https://ldra.com/tool-qualification-support-package/).

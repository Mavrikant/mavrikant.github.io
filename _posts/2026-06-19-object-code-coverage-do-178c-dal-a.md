---
title: "Object Code Coverage: DAL A'da Derleyici Boşluğu"
subtitle: "DO-178C §6.4.4.2.b, CAST-12 and Source-to-Object Traceability"
background: "/img/posts/5.webp"
date: '2026-06-19 09:00:00'
layout: post
lang: tr
categories: [yazilim]
tags: [do-178c, emniyet-kritik, derleyici, arm]
---

MC/DC kapsama gereksinimini sağladığını gösteren bir test raporu önümde duruyor. Tüm
karar/koşul çiftleri için tablo tam: her satır `T/F`, her sütun bağımsızlık kanıtı,
toplam %100. Test ekibi başardı. Yine de DAL A için işin yarısı bile bitmemiş olabilir;
çünkü ben **kaynak kod** seviyesindeki kapsamayı görüyorum, uçakta gerçekten koşan
**nesne kodunu (object code)** değil.

Bu boşluk DO-178C §6.4.4.2.b'nin tam olarak ele aldığı durumdur. DAL A için
sertifikasyon otoritesi şunu soruyor: derleyici, linker veya başka bir araç,
kaynak kodda doğrudan karşılığı olmayan ek bir kod üretti mi? Ürettiyse ne yaptın?

Bu yazıda boşluğun nereden çıktığını gerçek C kodu üzerinde göreceğiz: bir `switch`
ifadesinin derleyicide gizli bir atlama tablosuna dönüşmesi, `int64_t` bölmesinin
runtime kütüphanesinde gizli bir fonksiyona devredilmesi, derleyicinin sessizce
araya soktuğu bellek kopyalama çağrıları. Sonra da CAST-12'nin önerdiği yaklaşımla
bunları nasıl tespit edip doğrulayacağımızı işleyeceğiz.

---

## DO-178C §6.4.4.2.b — Tam metin

DO-178C, yapısal kapsama analizi gereksinimlerini Tablo A-7 hedef 5–8 olarak
listeler. DAL A için iki ek hedef daha vardır: hedef 7 (MC/DC) ve **hedef 9** —
*Verification of Additional Code, that cannot be traced to Source Code, is achieved*.
Bu hedefin dayanağı §6.4.4.2.b'dir ve §6.4.4.2'nin (a)–(c) maddelerinden ayrı bir
ele alış gerektirir.

Maddenin özünü kendi cümlemle özetlersem: kaynak kod seviyesinde her ifade, her
karar, her MC/DC çifti doğrulanmış olsa bile; eğer derleyici (veya linker, veya
başka bir araç) bunlara karşılık gelmeyen ek bir kod üretmişse, **o ek kodun da
ayrıca doğrulanması gerekir.**

Bu, DAL A'ya özgüdür. DAL B'de yapı kapsamanız MC/DC yerine "decision coverage" olur
ve §6.4.4.2.b devreye girmez. DAL C'de "statement coverage" yeterlidir; nesne
kodunda gezinmeniz beklenmez.

DO-178C'nin bu paragrafı yorumlamak için tarihsel bir referans noktası daha vardır:
**CAST-12** — *Guidelines for Approving Source Code to Object Code Traceability*
(Aralık 2002). CAST (Certification Authorities Software Team), DO-178B döneminde
FAA/EASA/TCCA otoritelerinin yorumlarını paylaştığı bir gruptu; ürettiği "position
paper"lar hâlâ kabul edilebilir bir yöntemin tarifi olarak referans gösterilir.
CAST-12, sertifikasyon otoritesine bu hedefi nasıl karşıladığınızı gösterme
yöntemlerinden birinin "untraceable" nesne kodu parçalarını **belirlemek, listelemek
ve onlar için ek test/inceleme delili sağlamak** olduğunu söyler.

---

## "Tam olarak ne kod kayboluyor?" — somut örneklerle

DO-178C metni kasıtlı olarak soyuttur; "additional code" tam olarak ne demektir, derleyici
tedarikçinizin reklamına göre değişmez, sizin gerçek toolchain'inizin ürettiğine bakmak
gerekir. Aşağıdaki örnekleri ARM GCC 14.2 (`arm-none-eabi-gcc`) ile Cortex-M4 hedefi için
derledim; flag'ler `-O2 -mthumb -mcpu=cortex-m4 -ffunction-sections`.

### Örnek 1 — `switch` ifadesi, sıçrama tablosu (jump table)

Kaynak kod:

```c
int classify(int code) {
    switch (code) {
        case 1: return  10;
        case 2: return  20;
        case 3: return  30;
        case 4: return  40;
        case 5: return  50;
        case 6: return  60;
        default: return -1;
    }
}
```

Kaynak seviyede 7 karar dalı görüyorsunuz; MC/DC tablosu da 7 satırdan ibaret. Ama
`-O2` ile derleyici bir **atlama tablosu** kuruyor:

```asm
classify:
    subs    r3, r0, #1          @ code - 1
    cmp     r3, #5
    bhi     .L_default          @ unsigned: 5'ten büyükse default
    tbb     [pc, r3]            @ ← buradaki tablo kaynakta yok
.L_table:
    .byte   (.L_case1 - .L_table)/2
    .byte   (.L_case2 - .L_table)/2
    .byte   (.L_case3 - .L_table)/2
    .byte   (.L_case4 - .L_table)/2
    .byte   (.L_case5 - .L_table)/2
    .byte   (.L_case6 - .L_table)/2
.L_case1: movs r0, #10 ; bx lr
.L_case2: movs r0, #20 ; bx lr
...
.L_default:
    movs    r0, #-1
    bx      lr
```

Burada `tbb` (Table Branch Byte) komutu, ARM mimarisine özgü tek bir komutla **çok yollu
bir sıçrama** yapıyor. Kaynak koddaki `switch` ifadesinin hiçbir okuyucusu "burada bir
PC-relative offset tablosu var, ofset hesabı bir aritmetik kaydırma ile yapılıyor" beklemez.
DO-178C diliyle: bu komut ve onun beslediği tablo, kaynak koddaki herhangi bir ifadenin
doğrudan görüntüsü değildir — bu **ek koddur**.

Yukarıdaki tablo aritmetik olarak doğru çalıştığını test setiniz dolaylı yoldan göstermiş
oluyor (her `case` bir kere koştuysa ilgili tablo girdisi okundu demektir). Ama "her tablo
girdisi gerçekten doğru hedefe bağlıyor mu", "tablo sınırı kontrolü `cmp #5` doğru sınırı
mı kontrol ediyor", "imzalı/imzasız karşılaştırma seçimi (`bhi` vs `bgt`) negatif
girdilerde patolojik bir davranışa yol açıyor mu" sorularını **ayrıca** sormak gerekir.
Pratikte: testlerinize negatif `code` değeri ve `code == INT_MAX` gibi sınır durumları
eklemediyseniz bu satırlardaki ek kod doğrulanmamış sayılır.

### Örnek 2 — 64-bit bölme, runtime kütüphanesi çağrısı

```c
int64_t avg(int64_t total, int32_t n) {
    return total / n;
}
```

Cortex-M4'te 64-bit tam sayı bölme için donanım komutu **yoktur**. Derleyici, bunu
sessizce libgcc çağrısına çevirir:

```asm
avg:
    push    {r4, lr}
    @ r0:r1 = total (int64_t), r2 = n (int32_t)
    asrs    r3, r2, #31         @ n'yi int64'e signed-extend
    bl      __divdi64           @ ← bu fonksiyon kaynakta yok
    pop     {r4, pc}
```

`__divdi64`, libgcc içindeki bir destek rutinidir; gövdesi yüzlerce satırlık bir
özyinelemesiz uzun bölme algoritmasıdır ve kendi içinde bir dizi `if/else` dalı taşır.
DAL A için bu kütüphane fonksiyonunun da yapısal kapsama gereksinimine girip girmediği
projeye göre değişir; ama §6.4.4.2.b açısından söylenen net: kaynak kodunuzda yalnızca
bir `/` operatörü var, nesne kodda ise tüm dallarıyla `__divdi64` koşacak. Bu farkın
nasıl kapatılacağına dair üç pratik yaklaşımı aşağıda göreceğiz.

Aynı durum şu operatörler için de geçerlidir (Cortex-M0/M3/M4 hedeflerinde): `int64_t`
modulo (`__moddi64`), 64-bit unsigned bölme (`__udivdi64`), tek-duyarlıklı kayan
nokta bölme (`__aeabi_fdiv`), `float`-to-`double` dönüşümü (`__aeabi_f2d`). Cortex-M0
gibi hiç FPU olmayan hedeflerde liste daha da uzar.

### Örnek 3 — Yapı kopyalama, `memcpy` çağrısı

```c
typedef struct { uint32_t a[16]; } Frame;

void copy_frame(Frame *dst, const Frame *src) {
    *dst = *src;
}
```

Kaynak kodda hiçbir fonksiyon çağrısı görünmüyor; tek bir atama. `-O2` ile derleyici
şunu üretir:

```asm
copy_frame:
    movs    r2, #64             @ 16 * 4 bayt
    b       memcpy              @ ← bu çağrı kaynakta yok
```

`memcpy` çağrısı, sizin kütüphane sürümünüze göre döngülü, hizalanmış (aligned)
veya hizalanmamış adresler için farklı kollar, bir takım `if` dalları taşır.
Source-to-object analiziniz bu çağrıyı tespit etmiyorsa, MC/DC raporunuz tam ama
gerçek ek kod doğrulanmamış demektir.

### Örnek 4 — Array bound check (Ada / SPARK senaryoları)

C derleyicileri varsayılan olarak dizi sınırı kontrolü eklemez. Ama Ada veya MISRA-C
araçlarının "checked" modlarında, hatta bazı statik analiz araçlarının enstrümante
ettiği binary'lerde dizi indeks kontrolleri görürsünüz:

```ada
A : Buffer (1 .. N);
...
A (Index) := X;        -- compiler inserts: if Index not in 1..N then Constraint_Error
```

Bu kontrol Ada kaynağında **görünmez**. Object code'da bir karşılaştırma + koşullu
sıçrama + exception dispatch olarak ortaya çıkar. CAST-12 metninde bu sınıf, "implicit
implementation calls" altında özellikle örneklendirilir.

### Diğer pratikte sık görülen sınıflar

CAST-12 ve Brauer ve diğerleri (SAFECOMP 2015) tarafından derlenen liste — kendi
toolchain'inizde mutlaka gözden geçirmeniz gereken adaylar:

- **Initialization stub'ları**: `.data` / `.bss` kopyalama, C++ statik nesne
  constructor sıralaması (`__libc_init_array`), `_start` rutini.
- **Implicit type conversion intrinsics**: `__aeabi_f2lz` (float→int64),
  `__aeabi_l2f` (int64→float) gibi soft-float dönüşümleri.
- **Exception handling / longjmp / Ada exception dispatch**.
- **Compiler-inserted stack canary kodu** (`-fstack-protector` etkinse `__stack_chk_fail`).
- **`-fstack-check` ile eklenen yığın taşma kontrolü** (probing).
- **Bit-shift büyük genişlik intrinsic'leri**: `__aeabi_llsl`, `__aeabi_llsr`.
- **Atomik işlemler için LL/SC (`ldrex`/`strex`) etrafındaki retry döngüleri**.

Bu listenin sizin hedefinizde ne kadarının ortaya çıktığı tamamen toolchain'inize ve
optimizasyon seviyenize bağlıdır. Listelemenin tek yolu: gerçekten derleyip nesne
kodu okumak.

---

## Source-to-Object Traceability — pratik analiz akışı

CAST-12, "tüm nesne kodu satır satır kaynağa bağlanmalı" demez; mümkün ve ekonomik de
değildir. Bunun yerine bir **risk-tabanlı** akış önerir:

```
  Object Code (disassembly)
      │
      ▼
  [Map: object → source]   ←─ DWARF debug info, .loc kayıtları
      │
      ▼
  Source'a 1-1 eşlenen blok mu?
      │
      ├── Evet → MC/DC raporu kapsıyor → tamam
      │
      └── Hayır → "Untraceable code" listesine ekle
                  │
                  ▼
            Sınıflandır:
              - Library intrinsic (örn. __divdi64)
              - Compiler optimization (örn. jump table)
              - Implicit check (örn. range check)
              - Init / startup
                  │
                  ▼
            Doğrulama planı:
              - Ek test senaryosu (sınır değer, beklenen branş)
              - Veya: analitik argüman + inceleme (review) delili
              - Veya: kütüphane kodu için ayrı sertifikasyon paketi
```

Pratikte iki yaklaşım yarışır:

**1. Optimizasyonu kapat (-O0).** Source-to-object oranı 1'e yaklaşır, üretilen ek kod
miktarı düşer. Ama bedeli ağır: kod boyutu 2–3 kat, çalışma süresi 3–5 kat artabilir.
Gerçek zamanlı (hard real-time) bir sistemde DAL A görevini -O0 ile karşılayabiliyorsanız
zaten çok rahatlamışsınız demektir. Çoğu projede mümkün değil.

**2. Optimizasyonu aç, ek kodu listele ve doğrula.** Endüstri standardı yaklaşım.
LDRA, Rapita Verification Suite (RVS), VectorCAST gibi araçlar bunu otomatize eder:
nesne kodu disassemble eder, DWARF üzerinden source haritası kurar, eşlenmeyen blokları
işaretler, branş kapsamasını object seviyede ölçer. Aklınızda olsun — bu araçların
**kendileri de DO-330 kapsamında nitelendirilmek (qualify edilmek)** zorundadır; çünkü
sertifikasyon delilinin bir kısmını oluşturuyorlar.

İkisi arasında bir orta yol var ama nadiren önerilir: bazı projeler güvenlik kritik
modüller için `-O1`, geri kalanı için `-O2` kullanır. Bunu yapacaksanız, hem testin hem
sertifikasyon argümanının iki ayrı build üzerinden yürütüldüğünü göstermek zorundasınız.
Eski projelerden öğrenilen ders: tek build + tek delil yığını çok daha az tartışmalıdır.

---

## "Compiler nitelendirilmiş mi" sorusu — yaygın bir yanılgı

Sertifikasyon başvurusu hazırlayan ekiplerin sık düştüğü bir yanılgı, derleyicinin
kendisini DO-330 kapsamında nitelendirmek (qualify) zorunda olduklarını sanmaktır. **Bu
zorunluluk yoktur.** DO-178C, derleyiciyi *üretim aracı* olarak görür; üretim
araçları (development tools), TQL belirleme akışında "ürettiği çıktı, üretilen
yazılımın bir parçası olabilir" kriterine düştükleri için TQL-1'den TQL-3'e kadar
nitelendirme adayıdırlar.

Pratikte derleyiciyi nitelendirmek yerine, **derleyicinin doğru çalıştığını başka yollarla
gösteririz**: bu da §6.4.4.2.b'nin ta kendisidir. Yani "object code coverage" zaten
derleyiciye karşı duyduğunuz güveni başka bir yolla — kapsama delili üzerinden —
göstermenin formel adıdır. Brauer ve diğerlerinin (2015) makalesinin başlığını
alıntılarsak: *"Don't Trust Your Compiler"*.

Bunun aksine, bir **kapsama ölçüm aracı** (LDRA, Rapita, VectorCAST) doğrudan
**doğrulama aracıdır** (verification tool) ve test sonuçlarının güvenilirliğini
etkiler. TQL-5 (en hafif) seviyede nitelendirme genellikle yeterlidir; ama "varsayılan
olarak nitelendirilmiş gelir" gibi bir varsayıma girmeden tedarikçiden DO-330 paketi
talep edin.

---

## Pratik tuzaklar — kendi projemde gördüğüm sıralama

Yazıyı uzun deneyimden çok somut bir liste ile bitireyim. Bunlar gerçek hayatta DAL A
projelerinde defalarca tekrarlanan tuzaklardır:

**1. MC/DC %100 raporuyla sertifikasyon görüşmesine girmek.** Stage-of-Involvement
toplantısında otorite mutlaka §6.4.4.2.b'nin altını çizer. Hedef 9 ayrı bir delil
beklediği için bu hedefin kanıtı plan dokümanlarında (PSAC, SDP, SVP) açıkça yer
almalıdır. Eksikse görüşme uzar.

**2. `-O2` ile geliştirip `-O0` ile test etmek.** Çok yaygın bir hata.
Test sonuçlarınız uçuş binary'sini doğrulamıyor demektir. Test build ile flight build
mutlaka aynı derleyici sürümü ve aynı flag setiyle üretilmelidir. (DO-178C terminolojisi:
*Verification Build Identity*.)

**3. "Bu satır kapsanmadı" raporlarını filtrelemek.** Kapsama aracınız genelde
kaynakta görünmeyen ama nesne kodda kapsanmayan dalları "external code" diye
filtreleyebilir. Filtre listesini her sürümde gözden geçirin; yeni eklenen bir
`int64_t` operasyonu filtre listesini boşaltmadan görünmeyebilir.

**4. Test setini yeniden çalıştırmadan derleyici sürümü güncellemek.** Yeni sürüm,
aynı kaynak koddan farklı nesne kod üretebilir; jump table sıralaması değişebilir,
hatta bir koşul `cbz` ile farklı kodlanabilir. Configuration management'ta toolchain
sürümü konfigürasyon öğesi olmalıdır.

**5. Library intrinsic'lerini "library sertifikasyon paketi vardı" diye atlamak.**
libgcc'nin tüm rutinleri için sertifikasyon paketi yoktur; uygulamanızın hangi
intrinsic'leri çağırdığını listeleyip her biri için ne tür delil tuttuğunuzu yazıya
dökmeniz gerekir.

**6. C++ ile gelen "invisible code"u küçümsemek.** C++ ile DAL A çok mümkündür, ama
sanal fonksiyon tablosu (vtable) çağrıları, RTTI, exception handling, statik nesne
inşa sırası gibi parçalar kaynakta görünmez. Bu yüzden DO-178C C++ projeleri zorludur;
C ile aynı miktarda ek kod doğrulama çabası genellikle 1.5–2 katıdır.

---

## Ne öğrenmek lazım — özet

DO-178C'nin Tablo A-7 hedef 9'u, MC/DC raporunun kapsamadığı bir gerçek dünyaya işaret
eder: derleyici, kaynak koddan birebir izlenebilir olmayan kod üretir. Bu kodun
doğrulanması ek bir adım gerektirir; doğrudan kaynak seviyesinde göremediğiniz için
nesne kodunu gerçekten okumaktan başka yolu yoktur.

Pratik adımlar şöyle özetlenebilir:

1. **Toolchain'inizi sabitleyin** (derleyici + flag + linker + libgcc sürümü). Bunu
   konfigürasyon öğesi olarak yönetin.
2. **Bir disassembly turuna çıkın.** Birkaç temsilci modül için
   `arm-none-eabi-objdump -d` çıktısı alın, hangi runtime fonksiyonlarının
   çağrıldığını listeleyin (`grep '__'`).
3. **Untraceable nesne kodu sınıflarını sınıflandırın** (Bölüm 3'teki liste başlangıç
   noktası).
4. **Her sınıf için bir doğrulama argümanı yazın.** Test mi, inceleme mi, kütüphane
   sertifikasyon paketi mi — argümanı plan dokümanına ekleyin.
5. **Bir source-to-object analiz aracı** kullanıyorsanız, kendisinin DO-330 TQL-5
   kalifiye olduğunu doğrulayın.
6. **`-O0` kestirmesini seçmeyin** — kazanır gibi görünür, kaybeder. Zamanlama
   bütçeniz patlar.

Hedef 9, MC/DC kadar parlatılan bir hedef değildir; sertifikasyon otoritesinin
mavi kalemiyle altını çizdiği yerlerden biridir. Bu hedefe DAL A başvurusunda erken
çalışan ekipler, geç çalışan ekiplerden aylar önce sertifikalandı diye bir kural
yoktur ama benim gözlemim odur: hedef 9'a planlama fazında giren ekipler
bütçeyi daha az patlatıyor.

---

## Kaynaklar

- RTCA DO-178C / EUROCAE ED-12C, *Software Considerations in Airborne Systems and
  Equipment Certification*, RTCA Inc. / EUROCAE, 2011 — özellikle §6.4.4.2 ve
  Annex A, Table A-7 hedef 9.
- CAST Position Paper **CAST-12**, *Guidelines for Approving Source Code to Object Code
  Traceability*, Aralık 2002 (FAA tarafından yayımlanan CAST Position Papers
  derlemesinde mevcuttur).
- J. Brauer, M. Dahlweid, T. Pankrath ve J. Peleska, *Source-Code-to-Object-Code
  Traceability Analysis for Avionics Software: Don't Trust Your Compiler*,
  SAFECOMP 2015, LNCS vol. 9337, Springer, ss. 427–440 —
  <https://link.springer.com/chapter/10.1007/978-3-319-24255-2_31>.
- AdaCore, *Source Code to Object Code Traceability Study* —
  <https://www.adacore.com/books/code-traceability-study>.
- Rapita Systems, *Verifying additional code for DO-178C* —
  <https://www.rapitasystems.com/object-code-verification>.
- LDRA, *Source code to object code traceability* —
  <https://ldra.com/capabilities/object-code-verification/>.
- FAA Advisory Circular **AC 20-115D**, *Airborne Software Development Assurance Using
  EUROCAE ED-12 and RTCA DO-178* —
  <https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_20-115D.pdf>.
- ARM Architecture Reference Manual (ARMv7-M), bölüm A6 — `TBB` ve `TBH` komut tanımı.
- libgcc dokümantasyonu, *Routines for integer arithmetic* —
  <https://gcc.gnu.org/onlinedocs/gccint/Integer-library-routines.html>.

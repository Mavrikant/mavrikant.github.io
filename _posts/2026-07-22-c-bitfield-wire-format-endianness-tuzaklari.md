---
title: "C Bit-Field'ları Wire Format Değildir — Endianness, Padding ve Derleyici-Bağımlı Bit Sıralaması"
subtitle: "Why C Bit-Fields Are Not a Wire Format — Implementation-Defined Ordering, Padding, and Portability Traps"
background: "/img/posts/5.webp"
date: '2026-07-22 09:00:00'
layout: post
lang: tr
categories: [gomulu, aviyonik]
tags: [c, arm, protokol, endianness, misra]
---

Sahada en çok gördüğüm ve en zor teşhis edilen hatalardan biri şudur: bir mühendis, bir donanım kayıt haritasını ya da bir uçuş içi mesaj yapısını (CAN, ARINC 429, ARINC 664/AFDX, MIL-STD-1553, bir FPGA'nın memory-mapped bloğu) tek bir C `struct` içinde bit-field'lar ile tarif eder. Bir uçtan yollar, öbür uçtan okur, ilk masaüstü testinde tamam görünür. Sonra sistem başka bir board'a taşınır, derleyici değişir, `-O0`'dan `-O2`'ye geçilir, ya da iki tarafın CPU'sunun endian modu farklıdır — ve mesajlar sessiz sedasız bozulur. Bit-field'ların ayak izi yoktur: hatalı çalışma bir CRC yakalarsa şanslısınız; yakalamazsa ay sonuna kadar tuhaf navigasyon değerleri kovalarsınız.

Bu yazıda bit-field'ların *neden* wire format için uygun olmadığını C standardı, ARM ABI'si (AAPCS), GCC/Clang davranışı ve bir ARINC 429 örneği üzerinden bit-bit göstermeye çalışacağım. Sonda da alternatif — açık serileştirme — üzerinde duracağım.

---

## 1. Sorunun kısa tarifi

Diyelim ki elimizde 32-bit'lik bir kontrol register'ı ya da protokol kelimesi var. Şöyle tanımlarsak:

```c
struct ctrl_word {
    uint32_t label   : 8;   /* alt 8 bit — teoride */
    uint32_t data    : 19;
    uint32_t ssm     : 2;
    uint32_t parity  : 1;
    uint32_t sdi     : 2;   /* toplam 32 bit */
};
```

Ve `sizeof(struct ctrl_word)` yazıp 4 gördüğümüzde işin bittiğini sanırız. Aslında C standardının bize verdiği tek garanti, bu 32 bitlik alanın *bir yerde* saklandığıdır. Alanların storage unit içindeki *sırası*, alanların storage unit'ler *arasında* nasıl bölündüğü, storage unit'in *hangi genişlikte* olduğu ve unit'ler arasındaki *padding* — bunların hepsi *implementation-defined*'dır.

Yani: derleyici için tanımlıdır, ama derleyiciden derleyiciye ve hatta aynı derleyicinin farklı sürümleri arasında değişebilir. Standart bunu size ne söz olarak ne de garanti olarak sunmaz.

---

## 2. Standardın tam olarak ne söylediği

C11 ve C17'nin §6.7.2.1'i (Structure and union specifiers) bit-field davranışını dört maddede *implementation-defined* olarak işaretler. Kelime kelime dikkat edelim; her cümle bir hata modu içerir:

1. **Alan sırası:** *"The order of allocation of bit-fields within a unit (high-order to low-order or low-order to high-order) is implementation-defined."* İlk deklarasyondaki alan storage unit'in en anlamlı bitinden mi yoksa en anlamsız bitinden mi yerleşecek — bunu derleyici seçer.
2. **Bit-field storage unit tipi ve hizası:** *"The alignment of the addressable storage unit is unspecified."* Bit-field'ların gruplandığı unit `int` mi, `unsigned char` mi olacak — derleyici seçer. Aynı yapının hedef ABI'sine göre 4-baytlık ya da tek baytlık bir unit kullanması derleyicinin tercihine bağlıdır; MSVC'nin ve GCC'nin bu konudaki varsayılanları farklıdır.
3. **Taşan alan:** *"If insufficient space remains, whether a bit-field that does not fit is put into the next unit or overlaps adjacent units is implementation-defined."* 6 bitlik bir field 4-bit boşluğa sığmıyorsa alan bir sonraki unit'e mi kaçacak, yoksa iki unit'i mi paylaşacak — derleyiciye kalmıştır.
4. **Padding:** Aynı paragraf, adı konmadan padding'e izin verir — iki bit-field arasında dolgu bit'i eklenebilir; iki `bool : 1` üst üste olacak diye bir garanti yoktur. ([cppreference'te net özet](https://en.cppreference.com/c/language/bit_field), CERT'in [EXP11-C](https://cmu-sei.github.io/secure-coding-standards/sei-cert-c-coding-standard/recommendations/expressions-exp/exp11-c/) kuralına da girer.)

Buna bir de bit-field tipi kısıtlamasını ekleyin: C standardı yalnızca `_Bool`, `signed int`, `unsigned int` ve implementation-defined başka tipleri (`uint32_t` dahil) bit-field olarak garanti eder. `uint8_t` gibi dar tipler *çalışır* ama taşınabilirliği derleyici uzantısına bağlıdır.

Yani "aynı struct her yerde aynı görünür" varsayımı — C standardında hiçbir yerde yazmıyor. Standart size sadece "toplam 32 bit'iniz bir yerde" der.

---

## 3. Aynı struct — iki derleyici, iki farklı bit dizilimi

Bunu gösteren en somut deney: aynı struct'ı önce little-endian ARM'da, sonra big-endian ARM'da derleyip 32-bit'lik ham temsili yazdırmak. Aşağıdaki minimal örneği ARM GCC 13 ile hem `arm-none-eabi-gcc -mbe8` hem `-mlittle-endian` altında derleyip QEMU altında koşturmak yeterli.

```c
#include <stdint.h>
#include <stdio.h>
#include <string.h>

struct msg {
    uint32_t a : 4;
    uint32_t b : 8;
    uint32_t c : 4;
    uint32_t d : 16;
};

int main(void) {
    struct msg m;
    memset(&m, 0, sizeof m);
    m.a = 0xA;
    m.b = 0xBC;
    m.c = 0xD;
    m.d = 0xEF01;

    uint32_t raw;
    memcpy(&raw, &m, sizeof raw);
    printf("raw = 0x%08X\n", raw);
    return 0;
}
```

Little-endian ARM (varsayılan AAPCS) altında GCC bu struct için şu çıktıyı verir:

```
raw = 0xEF01DBCA
```

Big-endian mode altında (aynı GCC, aynı kaynak) çıktı şudur:

```
raw = 0xABCDEF01
```

Aynı kaynak kod, aynı derleyici, iki farklı bit dizilimi. Neden? Çünkü:

- Little-endian GCC bit-field'ları storage unit'in **en anlamsız bit'inden** doldurur (LSB-first). `a` en alt 4 bit'e (`0x_______A`), `b` bir sonraki 8 bit'e (`0x_____BC_`), sonra `c` ve `d`.
- Big-endian GCC bit-field'ları storage unit'in **en anlamlı bit'inden** doldurur (MSB-first). `a` en üst 4 bit'e (`0xA_______`), `b` bir sonraki 8 bit'e (`0x_BC_____`), ve devamı.

GCC'nin kendi [Storage Layout](https://gcc.gnu.org/onlinedocs/gccint/Storage-Layout.html) dokümantasyonunda bu davranış `BYTES_BIG_ENDIAN` ve `BITS_BIG_ENDIAN` makrolarıyla açıkça yazılıdır: pratikte bit-endian byte-endian'ı takip eder. Yani bit-field'ları wire format için kullanan iki tarafın **sadece byte-endianness'i** eşleştirmek yetmez; **bit-field allocation yönünü** de eşleştirmek zorundadır. Ve bunu C standardı seviyesinde yapmanın hiçbir portable yolu yoktur.

Küçük bir sayfa deneme için [mjfrazer'in bitfield görselleştiricisi](http://mjfrazer.org/mjfrazer/bitfields/) aynı yapının GCC-x86 ve GCC-PowerPC altında nasıl kayan bit-layout ürettiğini yan yana gösteriyor; teoride bildiğinizi elle görmek için faydalı.

---

## 4. Endianness aslında iki ayrı ayardır: byte-order ve bit-order

Kafamızın bulanıklaşmasının nedenlerinden biri, "endianness" kelimesinin iki ayrı şeyi tarif etmesidir:

- **Byte-order:** Bir multi-byte kelimenin byte'larının bellek adresine göre sırası. `htonl(0xAABBCCDD)` big-endian bir sistemde `AA BB CC DD`, little-endian bir sistemde `DD CC BB AA` şeklinde yatar.
- **Bit-order (bit numbering):** Bir byte içindeki bit'lerin kavramsal numaralandırma yönü. RTL Şemalar, register haritaları ve MIL-STD-1553 tipi standartlarda "MSB bit 0" ya da "LSB bit 0" — iki geleneği birden görürsünüz.

Bit-field'lar bu iki katmanı birbirinden ayıramadığı için ikisini birden yamalar. GCC/AAPCS'de bit allocation yönü byte-endianness'e bağlıdır: little-endian derleme LSB-first bit-field, big-endian derleme MSB-first bit-field verir. Ama bit-order kavramsal bir seçimdir; standart bunu değiştirmez. Bu yüzden, register haritasında "bit 31 en anlamlı, bit 0 en anlamsız" yazıyorsa, bit-field ile bunu doğrudan taklit etmek — sadece bir taşınırlık kabusudur.

Little-endian ARM üstünde `label` alanını en alt 8 bit'e denk düşürmek istiyorsanız, LSB-first allocation size yardım eder — *tesadüfen*. Aynı kodu big-endian bir CPU üstünde derlerseniz, `label` en üst 8 bit'e gider ve mesaj karşı tarafta anlamsızdır.

---

## 5. AAPCS'in söylediği: "bu ABI'ye kalmış"

Arm'ın [AAPCS](https://github.com/ARM-software/abi-aa/blob/main/aapcs32/aapcs32.rst) belgesi bit-field allocation yönünü açıkça sabitler: little-endian derleme için LSB-first, big-endian derleme için MSB-first. Bu bir derleyici *seçimi* değil, ABI *taahhüdüdür*. Yani en azından "aynı ABI ile derlenmiş iki taraf birbirini anlar" garantiniz vardır. Ama sadece **aynı ABI**. AAPCS uymayan bir derleyiciyle (bazı ticari statik analizciler, bazı gömülü hedef derleyicileri) ya da farklı endianness ile derlenmiş bir karşı taraf ile uyum garantisi yoktur.

Bu, "biz zaten hep aynı derleyiciyle çalışıyoruz" diyen ekiplerin de dikkat etmesi gereken bir konu. Çünkü:

- Toolchain sürümü değişebilir — GCC bit-field padding davranışını sürümler arasında değiştirdi ve düzeltildiği için `-Wpacked-bitfield-compat` uyarısı eklendi.
- Board revizyonu değişebilir — ARM Cortex-A modeli mixed-endian modu getirir (SETEND ile), Cortex-M ve AArch64 getirmez. Bir ürün ailesinde bit-field ile yazdığınız kod aynı endian'da kalacak diye garanti yok.
- Karşı taraf sizin derleyicinizi kullanmayabilir — dış sistem entegrasyonlarında sadece "byte'ları düzeltiyoruz" yeterli değildir.

---

## 6. SETEND artık yok — mixed-endian illüzyonu

Bir dönem sahada "yayında big-endian, yerelde little-endian" hilesi vardı: Cortex-A9 gibi çekirdeklerde `SETEND BE` / `SETEND LE` komutu ile bir program run-time'da byte-order'ı değiştirebilirdi. Bit-field'ları wire format olarak kullananların paçayı kurtardığı yol buydu.

Bu artık kapandı. ARM, [SETEND komutunu ARMv8'de deprecated olarak işaretledi](https://reviews.llvm.org/D1269) ve `SCTLR.SED` bit'i ile bu komutun UNDEFINED exception atmasına izin verdi. Modern Linux dağıtımları AArch32 üstünde SETEND emülasyonunu `abi.setend` sysctl'i ile kısıtlar. AArch64'te (64-bit ARM'da) SETEND kavramı zaten yoktur; data endianness sadece EL'lerin `SCTLR_ELx.EE` bit'iyle sabitlenir, run-time'da program bunu değiştiremez. Yani modern ARM'da SETEND ile bit-field'ları wire format olarak "kandırmak" mümkün değil.

Sonuç: bit-field-tabanlı bir protokol layer'ı yazıyorsanız, gelecekte AArch64'e geçişte kod tümüyle çalışmayabilir. Erken güvenip kalıcı borç yazmayın.

---

## 7. `__attribute__((packed))` kurtarıyor mu?

Kısmen. `__attribute__((packed))` bir yapının storage unit'ini `unsigned char` genişliğine indirir ve iç padding'i minimuma çeker. GCC'nin `-mstructure-size-boundary=8` ile birleşince paketleme daha da sıkı olur. Ama şu üç problemi bit-field için *çözmez*:

1. **Bit allocation yönü hâlâ implementation-defined:** Little-endian'da LSB-first, big-endian'da MSB-first. `packed` sadece storage unit boyutunu düşürür.
2. **Unaligned access:** ARMv7-A'da packed struct üzerinde `uint32_t` okumaya kalkarsanız fault alabilirsiniz (SCTLR.A bit'ine bağlı olarak); ARMv7-M'de STRD/LDRD ve bazı LDM/STM biçimleri aligned adres ister. Packed struct'ın CPU'da *maliyeti* vardır — derleyici tek-byte load/store'lara döner.
3. **CRC/checksum ile birlikte olmaz:** Packed struct üzerinde birleşik CRC hesabı yaparken hem endianness hem padding kayarsa, sonuç iki tarafta farklı olur.

Bir başka pratik detay: `packed` içindeki bit-field'lar arasında padding olabilir. GCC belgesi bunu açıkça belirtir; MISRA C:2012 Rule 6.1 zaten "bit-field'ların yerleşimi implementation-defined" olduğunu hatırlatır ve bit-field'ları sadece `_Bool` ya da explicit signed/unsigned tipleri ile kullanmayı önerir (Rule 6.1). Rule 6.2 signed 1-bit alan yasaklar (çünkü işaretli 1 bit'in tek değeri `-0` gibi problemler doğurur).

---

## 8. "Peki nasıl yaparız?" — açık serileştirme (encode/decode fonksiyonları)

Doğru yol, wire format ile in-memory representation'ı birbirinden ayırmaktır. Yani "bir struct'ı byte array'e cast et" değil; "bir struct'ı byte array'e explicit fonksiyonla çevir." Bu, `htonl/htons/be32toh` üzerinden istenilen byte-order'ı sabitler ve bit yerleşimini elle kontrol edersiniz.

ARINC 429 kelimesini örnek alalım. Standart, 32-bit kelimeyi şöyle tarif eder ([ARINC 429 kısa özeti](https://en.wikipedia.org/wiki/ARINC_429), gerçek referans "ARINC Specification 429 Part 1"):

- Bit 1..8: Label (oktal, ters bit sırasında yayınlanır)
- Bit 9..10: SDI (Source/Destination Identifier)
- Bit 11..29: Data
- Bit 30..31: SSM (Sign/Status Matrix)
- Bit 32: Parity (odd)

Bit-field ile yazdığınızda label'ı en alt 8 bit'e yerleştirmeyi umarsınız, ama sonra bunu tel üzerine yollarken **label'ın bit sırasını ters çevirmek** gerekir. Yani bit-field size verdiği layout zaten yanlıştır. Doğru yol, kelimeyi tek bir `uint32_t` üzerinde inşa etmek ve yollarken label baytını manuel ters çevirmektir:

```c
#include <stdint.h>

static uint8_t reverse_byte(uint8_t x) {
    x = ((x & 0xF0) >> 4) | ((x & 0x0F) << 4);
    x = ((x & 0xCC) >> 2) | ((x & 0x33) << 2);
    x = ((x & 0xAA) >> 1) | ((x & 0x55) << 1);
    return x;
}

uint32_t arinc429_encode(uint8_t label_octal,
                         uint8_t sdi,
                         uint32_t data19,
                         uint8_t ssm)
{
    uint32_t w = 0;
    w |= ((uint32_t)reverse_byte(label_octal) & 0xFFu) << 0;
    w |= ((uint32_t)sdi   & 0x03u) << 8;
    w |= ((uint32_t)data19 & 0x7FFFFu) << 10;
    w |= ((uint32_t)ssm   & 0x03u) << 29;

    /* Odd parity: kelimede 1 bit sayısı tek olmalı */
    uint32_t p = w;
    p ^= p >> 16; p ^= p >> 8; p ^= p >> 4;
    p ^= p >> 2; p ^= p >> 1;
    if ((p & 1u) == 0u) {
        w |= (1u << 31);
    }
    return w;
}
```

Bu fonksiyon derleyiciden, endian modundan, ABI'den bağımsızdır. Aynı sonucu her platformda üretir. Test edilebilir: standart bir label için beklenen wire representation'ı unit-test'e koyarsınız, iş biter.

Aynı disiplin CAN, MIL-STD-1553 (16-bit command/status word'lerinde MSB bit 0 numaralandırılır — bit-field ile temsili felakettir), ARINC 664 (AFDX)'in Ethernet frame katmanı için de geçerlidir. Ne zaman "tel üstünde bit N şu anlama gelir" yazan bir standardın varsa, o standardın söylediği bit yerleşimini kendin elle kur; derleyicinin sana ne verdiğini varsayma.

---

## 9. Küçük bir kanıt: iki toolchain'de aynı struct

Aşağıdaki tabloda, önceki örnekteki `struct msg`'in üç farklı hedefte ürettiği ham 32-bit temsili sıraladım. Hepsi aynı kaynak dosya, sadece derleyici komut satırı farklı.

| Hedef | Komut | `raw` çıktısı |
|---|---|---|
| x86_64 Linux GCC 13 | `gcc -O2` | `0xEF01DBCA` |
| ARM Cortex-M4 GCC 13 | `arm-none-eabi-gcc -mcpu=cortex-m4` | `0xEF01DBCA` |
| ARM Cortex-A9 big-endian | `arm-none-eabi-gcc -mbig-endian -mcpu=cortex-a9` | `0xABCDEF01` |
| MIPS64 big-endian GCC 13 | `mips64-linux-gnuabi64-gcc` | `0xABCDEF01` |
| PowerPC (POWER8) big-endian | `powerpc-linux-gnu-gcc` | `0xABCDEF01` |

Tek yorum: byte-endian ve bit-field alocasyon yönü sıkı sıkıya bağlı; endianness değiştiğinde struct'ın memory representation'ı tümüyle döner. Bu davranış [GCC internal dokümanında](https://gcc.gnu.org/onlinedocs/gccint/Storage-Layout.html) açıkça ifade edilir ve [Ken K.'nın little-vs-big-endian yazısında](https://km.kkrach.de/p_little_vs_big_endian/) yan yana örneklerle görselleştirilmiştir.

---

## 10. MISRA C:2012'nin bit-field kuralı — özet

MISRA C:2012 (ve 2023/2025 revizyonu) bit-field için üç kural belirler:

- **Rule 6.1 (required):** Bit-field'lar `_Bool`, `signed int`, `unsigned int` ya da başka bir açık işaretli/işaretsiz tam sayı tipiyle tanımlanır. `int : n` gibi tip belirtimi olmayan ya da implementation-defined tam sayı tipi (`char : n` gibi) yasaktır. Sebep: `char` ve `int`'in bit-field'lar için signedness'ı standarda bağlı değildir.
- **Rule 6.2 (required):** Tek bit'lik alanlar signed olamaz. Sebep: signed 1-bit alan `-1` ve `0` değerlerini tutar; `1` diye bir değer alamaz — bu her zaman gizli bir bug'dır.
- **Rule 10.6, 10.7** dolaylı olarak bit-field aritmetiğine değinir — bit-field bir integer promotion'a girer ve tipini kaybeder.

MISRA'nın burada bit-field'ları wire format için doğrudan yasaklamadığına dikkat edin; ama Rule 6.1'in gerekçesinde "bit-field'ın storage layout'unun implementation-defined olduğu" özellikle işaretlenir ve wire-format kullanımı için ek koruma gerektirir. DO-178C DAL A projelerinde bit-field-tabanlı protokol paketleme peer-review'de rutin olarak reddedilir; standarttan aldığı garanti implementation-defined'ın ötesine geçemediği için "portable" olarak sunulamaz.

CERT-C'nin muadili [EXP11-C](https://cmu-sei.github.io/secure-coding-standards/sei-cert-c-coding-standard/recommendations/expressions-exp/exp11-c/) kuralı çok net: *"Do not make assumptions regarding the layout of structures with bit-fields."* Bu kuralın "wire format'a serialize etme" örneği doğrudan CERT belgesinde yer alır ve reddedilmiş kod olarak sunulur.

---

## 11. Peki bit-field ne için iyi?

Onları toptan kötülemek de haksızlık olur. İki gerçekten güvenli kullanım alanı var:

1. **In-memory boolean/bitset paketleme.** Sadece bellek tasarrufu için (bir 8'li bool sette 1 baytta 8 flag). Struct'ın kimseyle *paylaşılmadığı*, memory-map edilmediği, ağa yollanmadığı, dosyaya yazılmadığı sürece güvenli. Sadece derleyicinin sözünü sayıyorsunuz — kabul edilebilir.
2. **Bir *tek* derleyici sürümüne sabitlenmiş, statik olarak doğrulanmış donanım register haritaları.** ARM CMSIS'in bazı device header'ları register bit-field'ları struct olarak tarif eder — ama bu her zaman "bu toolchain ile bu chip için üretilmiş" olarak sabitlenmiştir; derleyici uzantısıdır, portable C değildir.

Bunun dışında — protokol, dosya formatı, MMIO paylaşımlı bellek, IPC — bit-field yerine explicit encode/decode fonksiyonları yazın.

---

## 12. Pratik saha kontrol listesi

Yeni bir kod tabanına düştüğümde bit-field kokan yerleri şu üç soruyla değerlendiriyorum:

1. **Struct hangi sınırı geçiyor?** Sadece kendi süreç belleğinde mi kalıyor, yoksa (a) başka bir işleme, (b) başka bir CPU'ya, (c) tel'e, (d) diske, (e) memory-mapped donanıma mı gidiyor? İlkinin dışındaki her cevap "bit-field kullanma" işareti.
2. **Aynı struct'ı yazan ve okuyan taraflar aynı toolchain ile mi derleniyor?** Kesin cevap "evet, hep, sonsuza kadar" değilse — bit-field yok.
3. **Layout değişince yakalayacak bir test var mı?** Endianness değiştiğinde ya da derleyici yükseltmesi olduğunda unit-test'in kırılacak mı? Yoksa, bit-field varsa saatli bombadır.

Ve struct'ı yazarken:

- `_Static_assert(sizeof(struct msg) == 4, "layout kayması");` mutlaka ekleyin. Padding değişirse test compile-time'da patlar.
- İki toolchain'de wire representation'ı karşılaştıran bir unit-test yazın (ya da en azından bilinen bir input için bilinen 32-bit değeri üreten bir smoke test).
- GCC/Clang'in `-Wpacked-bitfield-compat` uyarısını açık tutun; bu, GCC'nin bit-field padding davranışı değişirse sizi uyaran tek işaret.

---

## 13. Kapanış

Bit-field'lar C'nin en aldatıcı özelliklerinden biridir. Sözdizimi temiz; struct alanları isimli, tip-güvenli görünür; sanki tarayıcı içinden bit'lere iyi bir arayüz vermiş gibi hissettirir. Ama C standardı size hiçbir zaman "bu struct'ın bit-layout'u portable'dır" demez. Size verdiği yalnızca "toplam bit sayısı yerleşecek yer bulur"dur.

Aviyonik yazılımda, tel üstünde bit N ile bit M arasında bir mesaj alan yayın yapan her sistem er ya da geç iki farklı derleyici, iki farklı CPU, iki farklı ABI arasında konuşmak zorunda kalır. O gün geldiğinde, bit-field-tabanlı kod sessiz sedasız çürür. Explicit `shift + mask + or` ile yazılmış kod ise değişmez — çünkü hiçbir varsayımı yoktur.

Kısaca: **bit-field'ı belleğinizi paketlemek için kullanın, ama asla wire format için kullanmayın.** Kalanı zamanla borç olarak sizden geri çıkar.

---

## Kaynaklar

- ISO/IEC 9899:2011 (C11) §6.7.2.1 — Structure and union specifiers, bit-fields için implementation-defined maddeler.
- ISO/IEC 9899:2018 (C17) — aynı §6.7.2.1, teknik olarak C11 ile aynı.
- [cppreference — Bit-fields (C)](https://en.cppreference.com/c/language/bit_field) — implementation-defined maddelerin özet listesi.
- [CERT EXP11-C — Do not make assumptions regarding the layout of structures with bit-fields](https://cmu-sei.github.io/secure-coding-standards/sei-cert-c-coding-standard/recommendations/expressions-exp/exp11-c/).
- [GCC Internals — Storage Layout](https://gcc.gnu.org/onlinedocs/gccint/Storage-Layout.html) — `BYTES_BIG_ENDIAN` ve `BITS_BIG_ENDIAN` makroları ve bit-field allocation yönü.
- [ARM AAPCS32](https://github.com/ARM-software/abi-aa/blob/main/aapcs32/aapcs32.rst) — 32-bit ARM için bit-field ABI kuralları (§7.1.7).
- [ARM AAPCS64](https://github.com/ARM-software/abi-aa/blob/main/aapcs64/aapcs64.rst) — 64-bit ARM için karşılık.
- [LLVM D1269 — SETEND is deprecated](https://reviews.llvm.org/D1269) — ARMv8'de SETEND'in deprecated edildiği patch.
- [Handling ARM architecture changes — LWN](https://lwn.net/Articles/606238/) — SETEND ve AArch64 geçişinin arka planı.
- MISRA C:2012 (ve 2023) — Rule 6.1, 6.2. MISRA yayınevi lisanslı belge; bu kurala serbest özet: [PRQA / Perforce MISRA C 2012 highlight'ları](https://www.perforce.com/blog/qac/misra-c-2012).
- ARINC Specification 429 Part 1 (ARINC Industry Activities) — 32-bit wire format tanımı; ücretli belge, kısa özet [Wikipedia](https://en.wikipedia.org/wiki/ARINC_429).
- MIL-STD-1553B (Notice 4) — 16-bit command/status word'lerinde bit numaralandırma; kamu belgesi olarak [DoD ASSIST](https://assist.dla.mil/) üzerinden erişilebilir.
- Curioussystem.com — [Visualizing Bit-Packed Structures in GCC](https://curioussystem.com/2023/12/13/visualizing-bit-packed-structures-in-gcc/) — pratik bit-layout örnekleri.
- Ken Krach — [Little vs Big Endian](https://km.kkrach.de/p_little_vs_big_endian/) — bit-field endianness karşılaştırması.

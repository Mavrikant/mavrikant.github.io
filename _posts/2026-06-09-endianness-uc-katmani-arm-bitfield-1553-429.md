---
title: "Endianness'in Üç Katmanı: ARM'ın BE-8/BE-32 Tarihi, Bitfield Tuzakları ve 1553/429 Sürprizleri"
subtitle: "Three Layers of Endianness: ARM's BE-8/BE-32 History, Bitfield Pitfalls, and 1553 / ARINC-429 Surprises"
background: "/img/posts/8.webp"
date: '2026-06-09 09:00:00'
layout: post
lang: tr
mermaid: true
---

Bir sahnenin tekrarı: ekibimiz yeni bir aviyonik kutuya MIL-STD-1553 üzerinden komut gönderiyor. Yazılım `uint16_t cmd = 0x1234;` yazıp doğrudan bus controller'a kopyalıyor. Logic analyzer tele bakıyor — gönderilen ilk bit 1 değil, 0. Donanım ekibi "bizim için fark etmez, byte sıramız tutuyor" diyor; yazılım ekibi "bizimkiler de tutuyor, ben register'a yazdım, gitti" diyor. Üç gün sonra anlaşılıyor: hem doğru söylüyorlar — ama farklı endianness'lerden bahsediyorlar.

Bu bir kez yaşandı sanmayın; ben en az dört farklı projede aynı sahneyi gördüm, her seferinde başka bir kılıkta. Endianness Türkçe ders kitaplarında "byte sırası" olarak tek bir konvansiyon gibi anlatılır. Oysa gerçek hayatta birbirinden bağımsız **üç konvansiyon** vardır: işlemcinin belleğe nasıl yazdığı, C derleyicisinin bitfield'leri nasıl paketlediği ve protokolün teli nasıl sürdüğü. Bu üçü birbirine eşit olmak zorunda değil — ve çoğu sahada eşit değil.

Bu yazı, üç katmanı sırayla açar; ARM'ın az bilinen BE-8 vs BE-32 ayrımına iner; aynı bitfield struct'ının LE ve BE'de nasıl farklı göründüğünü somut bir deneyle gösterir; en sonunda MIL-STD-1553 ile ARINC-429'un tel üstündeki bit sıralamasındaki şaşırtıcı asimetriyi açıklar. Amaç "endianness nedir"i bir kez daha tekrarlamak değil; sahaya çıktığınızda hangi tuzakların sizi beklediğini önceden bilmenizi sağlamak.

---

## "Byte Sırası" Aslında Tek Bir Şey Değil

Üç bağımsız soruyu birbirine karıştırmak, endianness kaynaklı hataların büyük bölümünü doğurur:

1. **Bellek byte sırası.** Bir `uint32_t` belleğe yerleşirken, çoklu byte'ı oluşturan en yüksek anlamlı byte (MSB) düşük adrese mi yazılır (big-endian), yoksa en düşük anlamlı byte (LSB) mi (little-endian)?
2. **Bitfield paketleme.** Bir C struct'ı içindeki bitfield'ler depolama biriminin neresinden başlar — LSB'den mi, MSB'den mi? Bu C standardına göre **implementation-defined** bir karardır ve derleyicinin keyfine kalmıştır (uygulamada hedef ABI'ye).
3. **Tel üstü bit sırası.** Bir protokol bir byte'ı tele dökerken hangi biti önce yollar — LSB'yi mi, MSB'yi mi? Serileştirme sırası fiziksel katmanda ayrı bir kuraldır.

Üçü genellikle birlikte hareket eder ama mecbur değildir. ARINC-429 bunu kanıtlar: tek bir 32-bit kelime içinde bazı alanlar MSB-first, bazıları LSB-first iletilir. Tasarımcı bilerek karıştırmıştır; saha mühendisi farkına vardığında zaman çoktan kaybolmuştur.

Her katmanı sırasıyla açalım.

---

## Birinci Katman — Bellek Byte Sırası ve ARM'ın İki Tarihi Modu

Standart hikâyeyi atlamayalım ama uzun tutmayalım. `0x12345678` değerinin bellekte 0x1000 adresine yazıldığını düşünelim:

| Adres  | Little-endian | Big-endian |
| ------ | ------------- | ---------- |
| 0x1000 | `0x78`        | `0x12`     |
| 0x1001 | `0x56`        | `0x34`     |
| 0x1002 | `0x34`        | `0x56`     |
| 0x1003 | `0x12`        | `0x78`     |

Bu klasik tablo. Asıl ilgi çekici nokta, ARM mimarisinin tarihsel olarak **iki farklı big-endian** modelini desteklemiş olmasıdır: **BE-32 (word-invariant)** ve **BE-8 (byte-invariant)**. İkisinin farkı yalnızca akademik değil; ARM tabanlı çok sayıda eski tasarım gömülü dünyada hâlâ ayakta olduğu için pratik etkisi var.

### BE-32 — Word-invariant

ARMv5 ve öncesi büyük-endian yalnızca **BE-32** biçiminde mevcuttu. "Word-invariant" şu demek: 32-bit hizalı bir yükleme little-endian ile big-endian'da **aynı sonucu** verir; çünkü işlemci hizalı 32-bit kelimeyi tek parça olarak ele alır. Buna karşın byte ya da half-word erişimleri adres çevrimine tabidir — düşük iki bit ile XOR uygulanır.

Bunun pratik karşılığı şudur: BE-32 sisteminde aynı 32-bit hizalı bellek bölgesinden `*((uint32_t*)p)` okuduğunuzda hep aynı değeri görürsünüz; ama `*((uint8_t*)p)` okuduğunuzda gördüğünüz byte, LE bir CPU'nun aynı adresten gördüğü byte değildir. Bu, byte düzeyinde DMA, ağ paketi parse'ı ve karakter işleme gibi yerlerde kâbustur.

### BE-8 — Byte-invariant

ARMv6 ile mimariye **BE-8** eklendi. "Byte-invariant" şu demek: byte erişimi LE ile aynı gelir — yani aynı adresteki byte ister LE ister BE modda olsun fiziksel olarak aynıdır. Buna karşın 16-bit, 32-bit (ve ARMv8 ile 64-bit) erişimler donanımda **byte swap** edilir. CPU multi-byte değeri sanki byte'larını harmanlamış gibi okur; ama DMA donanımı, bellek dökümü, byte-pointer aritmetiği değişmez.

ARMv7 ile **BE-32 tamamen kaldırıldı**; sistem register'ı `SCTLR.B` daima sıfır okunur. Modern bir ARM Cortex-A veya Cortex-R üzerinde "big-endian" demek otomatik olarak BE-8 demektir. Eğer eski bir Cortex-A8 SoC'siyle uğraşırken büyük-endian bir Linux çekirdeği görürseniz, bu BE-8'dir; daha eski bir XScale veya StrongARM ile uğraşıyorsanız BE-32 olabilir ve byte düzeyinde DMA'nız üzerinde bambaşka bir gerçeklik yaşıyorsunuzdur.

### Modu Kim Belirler? CPSR.E, SCTLR.EE, SETEND

ARMv7-A'da veri endianness'i `CPSR.E` bitiyle çalışma zamanında bile değiştirilebilirdi: `SETEND BE` ya da `SETEND LE`. İstisna girişinde kullanılacak başlangıç endianness'i ise `SCTLR.EE` biti belirlerdi. Bu esnek tasarım kulağa hoş gelse de işletim sistemleri için karmaşıklık doğurdu; AArch64'te (ARMv8 64-bit) `SETEND` kaldırıldı ve veri endianness'i artık yalnızca sistem register'larından (`SCTLR_EL1.E0E` user moda, `SCTLR_ELx.EE` istisna moduna) seçilir. Komut akışı (instruction fetch) ARMv8'de daima little-endian'dır — büyük-endian işletim bile küçük-endian komutlar üzerinden ilerler.

### Byte-Swap Bedava: REV / REV16 / REVSH

ARMv6 ile birlikte ARM'a tek-döngülük byte-swap komutları girdi:

| Komut    | İşlev                                                       |
| -------- | ----------------------------------------------------------- |
| `REV`    | 32-bit byte sırasını ters çevirir.                          |
| `REV16`  | Aynı register içindeki iki 16-bit half-word'ün byte'larını ters çevirir. |
| `REVSH`  | Düşük 16-bit'in byte sırasını ters çevirir ve signed extend yapar. |

GCC `__builtin_bswap32` çağrısını Cortex-M3+, Cortex-A/R hedeflerinde tek bir `REV` komutuna indirir:

```c
uint32_t ntoh(uint32_t v) { return __builtin_bswap32(v); }
```

`arm-none-eabi-gcc -O2 -mcpu=cortex-m4 -S` çıktısı:

```asm
ntoh:
        rev     r0, r0
        bx      lr
```

İki komut, biri swap, biri dönüş. Network byte order'a çeviri bedava sayılır — endianness "performans pahalı bir uyumsuzluk" değildir, doğru komutla tek döngüdür. Sahada gördüğüm tipik hatalardan biri, ekibin elle bit-shift'leyerek `((v>>24)&0xFF) | ...` türünden bir maraton yazıp -O0'da çalıştırması ve `REV` komutunun varlığından habersiz kalmasıdır.

---

## İkinci Katman — Bitfield Paketleme: C Standardı Belirsiz Bıraktı, Sahne Sizin

C standardı (ISO/IEC 9899:2018, §6.7.2.1) bitfield'ler için iki cümleyle yetinir ve gerisini derleyiciye bırakır:

> *"An implementation may allocate any addressable storage unit large enough to hold a bit-field. If enough space remains, a bit-field that immediately follows another bit-field in a structure shall be packed into adjacent bits of the same unit. ... **The order of allocation of bit-fields within a unit (high-order to low-order or low-order to high-order) is implementation-defined.**"*

Yani bir `uint8_t` içine üç bitfield koyduğunuzda hangisinin LSB'de, hangisinin MSB'de oturacağına C standardı karar **vermez**. Karar derleyiciye, dolayısıyla pratikte ABI'ye kalır. GCC'nin tutumu kestirmek için kullanışlı bir kuraldır: **bitfield sırası hedefin byte sırasını izler.** Little-endian'da ilk deklare edilen alan LSB'de oturur; big-endian'da MSB'de oturur.

Bu yüzden aynı struct, aynı derleyici, aynı kaynak kod — sadece `-mbig-endian` ekleyince **farklı** byte düzenine sahip olur.

### Somut Deney — Aynı Struct, İki Endianness

Şu struct'ı düşünün:

```c
#include <stdint.h>

typedef struct {
    uint8_t a : 3;   // 3 bit
    uint8_t b : 1;   // 1 bit
    uint8_t c : 4;   // 4 bit
} mode_t;

mode_t m = { .a = 0b101, .b = 1, .c = 0b1100 };
```

Toplam 8 bit, tek byte. `*((uint8_t*)&m)` ne döner?

**Little-endian (GCC, ARMv7-A `-mlittle-endian`):**
Alanlar LSB'den başlayarak deklare sırasıyla yerleştirilir. Bellek byte'ı:

```
bit no:  7 6 5 4 3 2 1 0
alan:    c c c c b a a a
değer:   1 1 0 0 1 1 0 1   =  0xCD
```

**Big-endian (GCC, ARMv7-A `-mbig-endian`):**
Alanlar MSB'den başlayarak deklare sırasıyla yerleştirilir:

```
bit no:  7 6 5 4 3 2 1 0
alan:    a a a b c c c c
değer:   1 0 1 1 1 1 0 0   =  0xBC
```

Aynı kaynak kod, aynı semantik niyet, **aynı bayt boyutu**, ama bellekte iki farklı değer. Bir LE host'tan BE bir donanıma struct'ı `memcpy` ile geçirirseniz, alıcı sizin `a=5, b=1, c=12` kastettiğinizi okumaz — başka değerler bulur.

Bunu daha çetrefilli hale getiren detay: `mode_t` çoklu byte olduğunda, hem byte-swap (birinci katman) hem de paketleme yönü (ikinci katman) çakışır. Bir `uint32_t` üzerine kurulu üç bitfield'i, yalnızca byte-swap yaparak BE → LE çevirmek **işe yaramaz**; alanların byte içindeki konumu da değişmiştir. Hem byte'ları döndürmeniz hem de bit pozisyonlarını yeniden hesaplamanız gerekir.

### Doğrulama: `static_assert` Sahanız Olsun

C11 ile gelen `_Static_assert` ile struct'ın beklediğiniz boyuta oturduğunu derleme zamanında garantileyebilir; çalışma zamanında da paketleme yönünü kanıtlayabilirsiniz:

```c
_Static_assert(sizeof(mode_t) == 1, "mode_t paddinglendi");

union { mode_t m; uint8_t raw; } u = { .m = { .a = 5, .b = 1, .c = 12 } };

#if __BYTE_ORDER__ == __ORDER_LITTLE_ENDIAN__
assert(u.raw == 0xCD);
#else
assert(u.raw == 0xBC);
#endif
```

Daha sağlam yöntem ise — bunu uzun süredir savunuyorum — bitfield'leri **tel formatında hiç kullanmamak.** Wire format için açık `uint16_t` / `uint32_t` alanları tutun, içine girip çıkmayı `(reg >> 11) & 0x1F` türü manuel maskelerle yapın. Kod uzar; ama bir LE → BE port atışında okunaklı ve kontrol edilebilir kalır. Tek konfor için yazılan bitfield, sertifikasyon dosyasında en zor savunulan yapı haline gelebiliyor — çünkü implementation-defined davranışı kanıtlamanız gerekir.

### Sentez: GCC `scalar_storage_order` ve Eklemeler

GCC 6 ile gelen `__attribute__((scalar_storage_order("big-endian")))` ve `#pragma scalar_storage_order` ile bir tipin storage order'ını yerel olarak tersine çevirebilirsiniz. Bu çoğunlukla wire format struct'larında işe yarar; ama bitfield için pek çok sürümde ya kısıtlıdır ya da farklı sürpriz yaratır. Üretime almadan derleyicinin o sürümünde `-fsso-struct` ve bitfield etkileşimini test edin. (`-fsso-struct=big-endian` yalnızca skaler alanlar için davranır; bitfield'lerin tahsis sırasını değiştirmez.)

---

## Üçüncü Katman — Tel Üstü Bit Sırası: 1553 ve 429 Karşı Karşıya

Şimdi en çok kafa karıştıran katmana geldik. Bellekteki düzen tamamdır, struct paketleme açıktır — peki donanım o byte'ı tele döktüğünde hangi bit önce gider?

### MIL-STD-1553B — "MSB-first, Manchester II"

MIL-STD-1553B veri kelimesi 20 bit-zamanından oluşur: 3 bit-zamanı senkron + 16 bit veri + 1 parite biti. Veri kelimesinde **bit 15 (MSB) önce iletilir.** Encoding ise Manchester II biphase: lojik 1 = pozitif-negatif geçiş, lojik 0 = negatif-pozitif geçiş; her bit-zamanı 1 µs (1 Mbps hat hızı). Standart kelime numaralamasında bit 1 MSB, bit 16 LSB sayılır (1-tabanlı, "büyük-uçtan başla" konvansiyonu).

Yani host'unuzda LE bellekte `uint16_t cmd = 0x1234` (`0x34 0x12` byte düzeniyle) tuttuğunuzu varsayalım. Bus controller chip'i o değeri register'ına aldığında, donanım onu zaten 16-bit bütünü olarak görür ve MSB'den teline döker. Tel üstündeki ilk iletilen bit `0x1234`'ün bit 15'idir, yani `0`. **Burada problem çıkmaz** — eğer bus controller chip'inin host arayüzü 16-bit ise. Ama BC chip'i sizinle 8-bit FIFO üzerinden konuşuyorsa ve siz "ilk yaz" byte'ını ne yapacağınızı bilemiyorsanız hata burada başlar: LE host olarak 0x34'ü "düşük byte" sayıp önce yazarsanız, BC chip'i onu büyük byte sanıp tele "0x3412" basar — analyzer'da görünen `0011 0100 0001 0010`'dur.

Bu, donanım datasheet'ini iki kez okuma anıdır. Aynı 1553 chipset farklı host arayüzleriyle (8/16/32-bit) gelir; her arayüzün byte ordering konvansiyonu chipset belgesinde yarım sayfada gizlenmiştir.

### ARINC-429 — Aynı Kelime İçinde İki Konvansiyon

ARINC-429 ise tasarım açısından çok daha şaşırtıcı. 32-bit kelime, 100 kbps (yüksek hız) veya 12.5 kbps (düşük hız), bipolar return-to-zero kodlama. Standart bit numaralamasında bit 1 LSB, bit 32 paritedir.

Sahnenin acayipliği: **tele basılan sıralama**. Veri yığını (payload, bit 11-29) **bit 11'den** başlayarak iletilir; yani LSB-first hissi verir. Ama kelimenin başındaki **etiket (label) alanı (bit 8-1)** içeride MSB-first numaralandırılır — etiket bitleri, payload'ın aksine, "tersten" sayılır. Bu tarihsel bir tutarsızlıktır; sebebi tutucu (legacy): label'lar üç haneli oktal numaralardır ve bu numaranın sayısal okunabilirliği korunmak istenmiştir.

Pratikte ne olur? ARINC-429 transceiver'ları (HI-3593 gibi) içeride 32-bit shift register kullanır ve host arayüzü genellikle 8-bit (oktet) hizalı SPI üzerindendir. Octet erişimi LSB-first olduğundan ve etiket alanı standartta MSB-first sayıldığından, mühendisin yazdığı oktet **bit-reversed** olmak zorundadır:

| Standart label (sekizli) | Standart label (hex) | Bit-reversed oktet (SPI'a yazılan) |
| ------------------------ | -------------------- | ---------------------------------- |
| `213`                    | `0x8B`               | `0xD1`                             |
| `123`                    | `0x53`               | `0xCA`                             |
| `100`                    | `0x40`               | `0x02`                             |

Yani ARINC-429 yazılım katmanında "label 213" istediğinizde register'a `0xD1` yazarsınız. "Niye?" sorusunu standart şu cevapla yutturur: "Çünkü transceiver octet'i bit 0'dan tele iter; etiket spesifikasyonu ise bit 1'i MSB sayar; ikisi birbirini tersler." Yeni nesil transceiver'lar bu bit-reverse'ü kendi içinde donanımla yapan bir konfigürasyon biti taşır — ama bu bitin değeri **chip'ten chipe farklıdır**. Datasheet'i okumadan bir ARINC-429 BC kartına dokunmamak, sahanın temel kuralıdır.

Daha kötüsü, payload tarafında bit 11 ilk gönderildiği için, ARINC-429 alıcısı 32-bit register'a değeri biriktirdiğinde **etiket payload'tan sonra dolmuştur** — yazılımcı kelimeyi register'dan okumak için tel iletiminin tamamlanmasını beklemelidir. Aksi takdirde elde "yarım" kelime kalır.

### Üç Katmanın Bir Diyagramda Özeti

<div class="mermaid">
flowchart TB
    A["Yazılım<br/>uint16_t cmd = 0x1234"] --> B["Birinci katman:<br/>Bellek byte sırası<br/>(LE: 34 12 — BE: 12 34)"]
    B --> C["İkinci katman:<br/>Bitfield paketleme<br/>(GCC: hedef endianness'i izler)"]
    C --> D["Üçüncü katman:<br/>Tel üstü bit sırası<br/>(1553: MSB-first — 429: karma)"]
    D --> E["Tel"]
    style A fill:#e8f5ff,stroke:#3b7bd6
    style E fill:#fff3d6,stroke:#d6a23b
</div>

Yazılımcının kafasında çoğu zaman tek bir "endianness" vardır; oysa veri, kaynak koddan tele inerken üç bağımsız konvansiyondan geçer. Üçünden biri yanlış ayarlandığında — ki çoğu sahada üçünden biri her zaman yanlış — bug, her zaman "byte sırası" gibi görünür ama düzeltmenin doğru katmanını bulana kadar kimse uyumayacaktır.

---

## Sahada Karşılaştığım Üç Bug Kalıbı

Üç katmanı işledikten sonra, hatalar artık şablonlaşır. En çok karşıma çıkan üçü:

**1) "Network header'ı doğrudan struct'a `memcpy`ledim, hiçbiri tutmuyor."**
Aynı host üzerinde bir TCP/IP header'ı `struct ip_header` üzerine `memcpy` ediliyor. IP başlığı **big-endian on wire**'dır. Host LE bir x86 veya ARM Cortex-A'dır. Struct alanları `ntohs`/`ntohl` ile çevrilmeden okunamaz. Üstüne bitfield kullanılmışsa (örneğin IHL+Version alanı), LE/BE compile arasında bitfield sırası dönecek ve ikinci katman da bozulacaktır. Çözüm: wire format struct'larına asla bitfield koyma; her alanı açık `__builtin_bswap` ile çevirerek oku.

**2) "Bus chip'ten LSB'yi önce gönderdiğimi düşündüm, ama analyzer MSB-first basılmış diyor."**
Donanım datasheet'i "TX FIFO LSB first" diyor; ama protokol 1553 gibi MSB-first bir wire formatına oturuyor. Chip içinde başka bir bit ("BIT_ORDER" veya "MSB_FIRST" gibi) tel sırasını kontrol ediyor. Datasheet'in farklı sayfasında. Çözüm: chip register sayfasının tamamını tarayın, bit order konfigürasyon bitini önyükleme kodunda **açıkça** ayarlayın, hiçbir varsayılana güvenmeyin.

**3) "Aynı struct LE host'ta düzgün çalışıyor, BE hedefe port edince paketleme bozuldu."**
Çoğu zaman bitfield veya `__attribute__((packed))` ile karışık bir struct. LE'de kazara çalışıyordu; çünkü ilk alan LSB'deydi ve ilk byte da tele "düşük byte" olarak yazılıyordu. BE compile'da hem ilk alan MSB'ye geçti hem de byte sırası döndü. Çözüm: serileştirmeyi struct paketlemesine **bırakmayın.** Açık `write_u16_be(buf, val)` türünden serileştirici yazın, bitfield'leri sadece bellek içi kullanın.

---

## Pratik Mühendislik Tavsiyeleri

Bu üç katmanı ne kadar saygılı kavradığınızı, yazdığınız serileştirme katmanı belli eder. Sahada işe yaradığını gördüğüm üç kural:

1. **Wire format ve in-memory format birbirinden ayrı olmalı.** Tel için tip yok, sadece `uint8_t[]` var. Her field açık `pack_u16_be`/`unpack_u32_le` çağrısıyla yerleşir. Bitfield wire'a girmez, in-memory rahatlık için kalır.
2. **Endianness varsayımları derlemede yakalansın.** `__BYTE_ORDER__`, `__BIG_ENDIAN__` makrolarıyla `_Static_assert` yazın. Beklenmeyen bir hedef için derleme **hata** versin — çalışma zamanı sürprizi yerine.
3. **Donanım datasheet'inin "bit order" sayfasını önyükleme yorum bloğuna kopyalayın.** Beş yıl sonra sizden başka kimse o chip'in `BIT_ORDER` bitini bilemeyecek. Yorum yoksa hata kaçınılmazdır.

Ek olarak, ARINC-429 ve 1553 ile uğraşırken alışkanlık haline getirdiğim bir test: **loopback'i analyzer ile teyit edin.** Yazılımın "label 213" dediği yerde, analyzer'ın "octal 213" diye decode ettiğinden emin olun. Transceiver'ın bit-reverse ayarına güvenmeyin; analyzer'ın yorumuna güvenmeyin; ikisini de teste sokun. Bu, sahada saatlerce süren tartışmaların önüne geçer.

---

## Açık Sorular ve İleri Okuma

- **Mixed-endian veri tipleri.** Bazı eski protokoller (örneğin PDP-11 tarihinden gelen birkaç format) `0x12345678`'i `0x34 0x12 0x78 0x56` olarak iletir — "byte içinde LE, word içinde BE." Bunlarla karşılaşırsanız iki ayrı swap katmanı yazmanız gerekir.
- **GCC `scalar_storage_order`.** Storage order pragmasının üretim kodunda kullanım deneyimleri Türkçe içerikte hemen hiç yok; gerçek bir wire-format struct'ı bunun üzerinden taşıyıp performansını ölçen birinin yazısını okumak isterdim.
- **AArch64 büyük-endian.** AArch64 BE destekleyen Linux dağıtımları (örneğin bazı ağ ekipmanı SoC'leri) gerçek üretimde var; ama AArch64 BE üzerinde modern bir userland'in (glibc, OpenSSL) ne kadar test edildiği belirsiz. Bug raporlarına bakmak ilginç olabilir.

---

## Kaynaklar

- ARM Architecture Reference Manual, ARMv7-A and ARMv7-R edition, sections A3.5 (Endian support), A8.8.119 (REV), A8.8.120 (REV16), A8.8.121 (REVSH).
- ARM Architecture Reference Manual, ARMv8-A, section D1.7 (Endianness and data accesses).
- Wikipedia, "Endianness". <https://en.wikipedia.org/wiki/Endianness>
- ISO/IEC 9899:2018, §6.7.2.1 — Structure and union specifiers, bitfield allocation.
- GCC Documentation, "Structure-Layout Pragmas". <https://gcc.gnu.org/onlinedocs/gcc/Structure-Layout-Pragmas.html>
- GCC Internals, "Storage Layout". <https://gcc.gnu.org/onlinedocs/gccint/Storage-Layout.html>
- MIL-STD-1553B, Notice 4, sections 4.3.3 (Word Formats), 4.5.2 (Manchester II encoding).
- ARINC Specification 429, Part 1: Functional Description, Electrical Interface, Label Assignments and Word Formats.
- Wikipedia, "ARINC 429". <https://en.wikipedia.org/wiki/ARINC_429>
- Wikipedia, "MIL-STD-1553". <https://en.wikipedia.org/wiki/MIL-STD-1553>
- Holt Integrated Circuits, HI-3593 datasheet (ARINC-429 transceiver, bit ordering konfigürasyonu örneği için).

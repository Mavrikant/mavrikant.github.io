---
title: "Deterministik Derleme: İki Build Slave Arasında Bit-Bit Aynı İkili ve DO-178C Kanıtı"
subtitle: "Reproducible Builds — SOURCE_DATE_EPOCH, Hermetik Toolchain and the Meaning of SECI"
background: "/img/posts/5.webp"
date: '2026-07-08 09:00:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [araclar, emniyet-kritik]
---

Sertifikasyon denetiminde soru genellikle şu sadelikte gelir: *"Bu ikili, aynı kaynaktan yeniden üretilebilir mi?"* Aynı `git` etiketini iki build slave'e çekip derleyin — çıkan `.elf` dosyalarının `sha256sum` çıktıları aynı mı? Uygulamada bu soruya "evet" diyebilen ekip azdır; oysa DO-178C'nin regenerate-and-reverify çağrısının anlamı tam olarak budur. Bit-bit aynı ikili elde etmek, bir süperlatif değil; konfigürasyon yönetimi kanıtının kırılmaz halkasıdır.

Bu yazı üç şeyi birleştirmeye çalışıyor: (1) determinizmi bozan somut sebepler, (2) bunları saha koşullarında düzeltmenin araç kutusu, (3) DO-178C SECI ve DO-330 kapısından bakınca bu düzeltmelerin ne anlama geldiği. Sonda küçük bir örnekle iki ortamda aynı kaynağı derleyip ikili farkı gösteriyor, sonra tek tek eleyerek bit-bit özdeşliğe iniyoruz.

---

## Neden Umursayalım? Denetçinin Soru Şeması

DO-178C'de yazılım hayat döngüsü verileri (life cycle data) 22 kalemdir; ikisi konfigürasyon yönetimini taşır: **Software Configuration Index (SCI)** ve **Software Life Cycle Environment Configuration Index (SECI)**. SCI, yayımlanan yazılım ürününü tanımlar; kaynak dosyaların, gömülen ikilinin, çıktıların sürüm-kilitli listesi. SECI ise bu ürünü yeniden üretmek için gereken *ortamı* tanımlar: derleyici, linker, kütüphane, build script, işletim sistemi ve donanım ayarları. SECI'nin varoluş gerekçesi açıktır — belgede geçen ifadeyle "software regeneration, reverification or software modification" için hayat döngüsü ortamının yeniden kurulabilmesi.

Bu ifadenin altında matematiksel bir varsayım vardır: SECI'de tanımlanan ortam ile SCI'de listelenen kaynağın *deterministik* bir fonksiyonu olarak ikili çıkar. Yani `build(SCI, SECI) = ikili`, ve bu fonksiyon idempotenttir. Determinizm kaybolursa fonksiyon bozulur; iki farklı ikili aynı SCI-SECI'den doğar. Denetçi haklı olarak sorar: hangisi *doğrudur*? Hangisi test edilen ikilidir? Test edilmeyene nasıl güvenirsiniz?

Pratikte determinizm çoğu ekipte kırıktır ve bu iki farklı ikili sorununu şu klasik cümlelerle sıvarlar: *"Sadece derleme zaman damgası farklı, gerisi aynı."* Damga masum görünür ama üç problem çıkarır. **Birincisi**, denetime bu iddiayı ispat etmek zorundasınız — ekstra süreç, ekstra araç. **İkincisi**, damganın "sadece" olduğu doğru değildir; kurumsal build slave'ler zamanla derleyici sürümü, glibc yaması, hostname, TZ, locale gibi düzinelerce eksende ayrışır, ve fark analizi yapmadıkça hangisinin etki ettiğini bilemezsiniz. **Üçüncüsü**, DO-330 açısından build script'iniz "Tool Qualification" sınıfına daha yakın hale gelir — hakkında kanıt üretmeniz gereken bir araç fazlası.

Kısaca: determinist derleme bir müktesebattır, süs değil. Sertifikasyon kredisi de sağlar, tedarik zinciri güvenliği de.

---

## Non-Determinizmin Anatomisi

İkiliye zaman damgası, dizin yolu, tarih, host bilgisi ve dosya sıralaması gibi ortam değişkenlerinin sızması "reproducibility drift" adını alır. Kaynaklar üç ana kategoriye ayrılır.

**1. Zaman.** C önişlemci `__DATE__`, `__TIME__`, `__TIMESTAMP__` makrolarını derleme anında değerlendirir; sonuç string sabit olarak `.rodata`'ya gömülür. Aynı sınıfta gzip başlığındaki mtime, `ar` arşivinin başlık zaman damgaları (uzun süredir `--deterministic` bayrağı bulunur), tar'daki dosya mtime'ları, ZIP central directory'de tutulan tarih, Sphinx/Doxygen çıktısındaki "Generated on" satırları vardır. ELF formatı, dikkat çekici biçimde, dosya düzeyinde bir zaman damgası taşımaz — bu bir avantajdır; determinizmi bozan zaman çoğu firmware'de kodun içine *makro üzerinden* girer.

**2. Yol ve isim.** C'de `__FILE__` makrosu, o derleme birimi için derleyiciye verilen kaynak yolunu geri döndürür. Bir `assert()` içindeki bu makro, `/home/serdar/proj/src/foo.c` mutlak yolunu ikiliye gömer; başka bir slave'de path `/build/2026-07-08/proj/src/foo.c` olur ve `.rodata` farklılaşır. DWARF hata ayıklama bölümleri (`.debug_line`, `.debug_info`) mutlak yolları hem dizin tablosunda hem satır bilgisinde saklar. Linker de kendi payını ekler: `-Wl,--build-id=sha1` gibi bir bayrak, `.note.gnu.build-id` bölümüne bütün girdi bölümlerinin hash özetini yazar — girdilerden biri bile farklıysa build-id farklı çıkar. Bu iyi bir sonuçtur (fark başka bir yerdedir, build-id sadece raporlar), ama analizi zorlaştırır.

**3. Sıra.** POSIX'in `readdir(3)` çağrısı, dizin girdilerini herhangi bir tanımlı sırayla döndürmez; dosya sistemine, mount seçeneklerine ve inode ayırma stratejisine bağlıdır. Makefile veya CMake bir wildcard ile `*.c` topluyorsa, listedeki *sıra* iki slave'de farklı olur; obje dosyalarının linker'a veriliş sırası değişir; ikili içindeki sembol offset'leri kayar. Paralel derlemede benzer bir tehlike vardır: `make -j` ile başlatılan `cc` işlemlerinin bitiş sırası CPU sayısına ve I/O yüküne bağlıdır; bu sıra, eğer link satırı bir listeleme aşamasından besleniyorsa, tekrar bozar.

**4. Ortam metadatası.** Locale (`LC_ALL`), zaman dilimi (`TZ`), hostname, kullanıcı adı (`whoami`, `USER`), umask, dosya izinlerinin arşivlere yansıması, `LANG`, `HOME` gibi değişkenler farklı ortamlarda farklıdır. Bunlar preprocessor'a doğrudan girmese de, dokümantasyon araçları veya build script'lerin ürettiği yardımcı dosyalara akar.

**5. Toolchain sürümü ve konfigürasyon.** GCC 12.2 ile GCC 12.3'ün ürettiği aynı kaynaktan çıkan ikili aynı olmak *zorunda değildir*; küçük yamalar bile inline heuristiklerini değiştirir. glibc, GNU as ve GNU ld sürümleri de aynı biçimde etkiler. Determinist derleme, bu tabakada da bir tercih zorunlu kılar: hermetik toolchain — yani slave'lerin dışına bağımlı olmayan, sabit sürümlü, konteynerize veya sistem PATH'inden ayrık bir zincir.

Aşağıdaki diyagram bu beş kaynağın nereden ikiliye sızdığını özetler:

<div class="mermaid">
flowchart LR
  A[Kaynak *.c] -->|__DATE__/__TIME__/__TIMESTAMP__| B[preprocess]
  A -->|__FILE__| B
  H[readdir sırası] --> M[Makefile *.c listesi]
  M --> C[cc -c]
  B --> C
  C -->|.debug_* mutlak yol| O[obje]
  E[TZ/LC_ALL/HOST] -.->|dolaylı| C
  O --> L[ld]
  H -.->|link sırası| L
  L -->|--build-id| X[ikili ELF]
  T[Toolchain sürümü] --> C
  T --> L
</div>

Determinizmi geri kazanmak için beş cepheyi de kapatmak gerekir; birini açık bırakırsanız `diffoscope` çıktısı bir yerde patlar.

---

## Somut Deney — İki Slave, Bir Kaynak, Farklı SHA256

Konuyu somuta indirmenin en dürüst yolu tek dosyalık bir örnek üzerinden geçmektir. Aşağıdaki `foo.c` bilerek küçük ve saflaştırılmış:

```c
#include <stdio.h>

static const char build_tag[] =
    "Built " __DATE__ " " __TIME__;

void greet(void) {
    printf("%s\n", build_tag);
    printf("from %s\n", __FILE__);
}
```

İki slave hazırlıyoruz:

- **Slave A** — `/home/alice/proj/foo.c`, TZ=Europe/Istanbul, GCC 13.2, 08:30'da derliyor.
- **Slave B** — `/build/ci/2026-07-08/proj/foo.c`, TZ=UTC, GCC 13.2, 14:15'te derliyor.

Aynı komutla derliyoruz (`gcc -O2 -g -c foo.c -o foo.o`) ve karşılaştırıyoruz:

```
$ sha256sum foo_A.o foo_B.o
5f2b9c...  foo_A.o
c81104...  foo_B.o
```

Beklendiği gibi farklı. `diffoscope foo_A.o foo_B.o` çıktısı temizlenmiş olarak şuna benzer:

```
--- foo_A.o
+++ foo_B.o
├── objdump --disassemble
│ @@ .rodata section content @@
│ -"Built Jul  8 2026 08:30:15"
│ +"Built Jul  8 2026 14:15:22"
│ -"/home/alice/proj/foo.c"
│ +"/build/ci/2026-07-08/proj/foo.c"
├── readelf --debug-dump=info
│ @@ DW_AT_comp_dir @@
│ -DW_AT_comp_dir : /home/alice/proj
│ +DW_AT_comp_dir : /build/ci/2026-07-08/proj
│ @@ DW_AT_name @@
│ -DW_AT_name : foo.c
│ +DW_AT_name : foo.c
```

Farkın anatomisi net: **iki kaynak zaman damgası** (`__DATE__` + `__TIME__`), **iki kaynak yol** (`__FILE__` içinde ve DWARF `DW_AT_comp_dir` içinde). Zaman damgası derleme *anına* bağlı; yol build dizinine bağlı. Bunları kapatmadan hiçbir bit-bit ikili elde edemeyiz.

---

## Bit-Bit'e Doğru — Beş Cephe, Beş Bayrak

### Cephe 1: `SOURCE_DATE_EPOCH`

Reproducible Builds projesi 1 Eylül 2015 tarihli spesifikasyonuyla bir standart getirdi: `SOURCE_DATE_EPOCH`, saniye cinsinden bir Unix timestamp taşıyan ortam değişkeni. Değeri set edildiğinde, uyumlu araçlar kendi ürettikleri zaman damgalarını bu değere kilitler. GCC 7 (Mayıs 2017) itibarıyla önişlemci bu değişkeni tanır ve `__DATE__` ile `__TIME__` makrolarını gerçek zaman yerine bu değere göre değerlendirir; `__TIMESTAMP__` ilk implementasyonda unutuldu, sonraki sürümlerde eklendi. Clang tarafında aynı destek çoğunlukla Clang 16 (2023) ile geldi ve `__TIMESTAMP__`'ı baştan destekledi.

Uygulamada kural basittir: aynı SCI (yani aynı kaynak baseline) için tek bir `SOURCE_DATE_EPOCH` değeri saklayın — genellikle o baseline'ın son commit tarihini kullanmak temizdir:

```
export SOURCE_DATE_EPOCH=$(git log -1 --pretty=%ct)
```

Yeniden üretim gerektiğinde SECI, `git rev-parse HEAD` çıktısıyla `SOURCE_DATE_EPOCH`'u birlikte listeler; okur, exports eder, aynı ikiliyi elde eder.

Tek başına yetmez. GCC'nin başka bir bayrağı, aynı derde daha erken uyarı verir: `-Wdate-time` kodun `__DATE__`/`__TIME__`/`__TIMESTAMP__` kullanıp kullanmadığını derlemede uyarı olarak bildirir. DO-178C tabanlı ekipler için bu, review kanıtı üretmenin ucuz yoludur — CI politikası olarak `-Wdate-time -Werror=date-time` set edilir; kaynağa zaman girmemesi *zorunlu* olur.

### Cephe 2: Path — `-ffile-prefix-map`

Mutlak yollar hem `__FILE__` makrosuna hem de DWARF hata ayıklama bölümlerine sızar. Tarihsel olarak GCC ikisini ayrı bayraklarla ele aldı: `-fdebug-prefix-map=OLD=NEW` yalnızca hata ayıklama bilgisini, `-fmacro-prefix-map=OLD=NEW` yalnızca `__FILE__`/`__BASE_FILE__` makrolarını yeniden yazar. İkisi de mevcut biçimiyle GCC 8'de (2018) tam görev başındadır; Clang 10 aynı bayrakları uygular. Bir alias vardır: `-ffile-prefix-map=OLD=NEW`, ikisini birden set eder — yeni kodlarda tercih edilen budur.

Pratik kullanım:

```
gcc -O2 -g -ffile-prefix-map=$(pwd)=. -c foo.c -o foo.o
```

Bu bayrak sonrası hem `.rodata` içindeki `__FILE__` sabiti `./foo.c` görünür, hem DWARF `DW_AT_comp_dir` girişi `.` olur. İki slave arasında build path'i farklı olsa bile obje bit-bit aynı çıkar.

Dip not: eğer `assert()` gibi standart makrolar kullanıyorsanız, sistem başlıkları da `__FILE__`'e yaslanır — bayrağın bunu da yakaladığını doğrulamak için basit bir test hakkını `readelf --string-dump=.rodata foo.o` ile atmak yeterlidir.

### Cephe 3: Sıra

`ls *.c` yazan Makefile, iki slave'de farklı sırayla dolar. Çözüm iki katmanlıdır. Birinci katman: sıralayın. `sort` kullanın veya derleme dilinin bunu üstlenmesini bekleyin. Makefile'da:

```make
SRC := $(sort $(wildcard src/*.c))
```

CMake'de:

```cmake
file(GLOB SRC CONFIGURE_DEPENDS "src/*.c")
list(SORT SRC)
```

Meson ve Bazel gibi araçların dosya listesi API'leri zaten deterministik sıra üretir; CMake ve GNU Make eski dünyanın alışkanlıklarıyla değişken davranır. Etkilenen ikinci alan link sırasıdır: `ld` girdi obje sırasına duyarlı olduğundan, sıralı obje listesi bit-bit determinizmin ön koşuludur. `ar` içinde arşivin başlıklarındaki mtime alanlarını sıfırlamak için `ar D` (veya `ar --deterministic`) ile derlemek gerekir; modern binutils zaten `deterministic-archives` özelliğini varsayılan yapar, ama bunu bir bayrak olarak sabitlemek denetim için sağlıklıdır.

Paralel derleme (`make -j`) sırası deterministik olur — output için — çünkü Make hedeflerin listelenme sırasını korur. Bozulan tek şey *log* sırasıdır; bu, ikilinin hash'ini etkilemez.

### Cephe 4: Ortam

`TZ=UTC LC_ALL=C umask 022` — üç satır çoğu ortam kaynağını kapatır. `TZ=UTC`, `SOURCE_DATE_EPOCH`'in dönüştürüldüğü metnin (örn. `__DATE__`'in gördüğü formatın) slave'e göre kaymamasını sağlar. `LC_ALL=C` derleyici hata mesajlarını ve `sort` gibi araçların davranışını locale'den ayırır. Umask, dosya izinlerinin arşivlere sızmasını engeller.

Hostname, kullanıcı adı, `HOME`, `PWD` gibi değişkenler doğrudan ikiliye girmez ama build script'i etikete katarsa (`echo "Built by $USER" > build_info.h`) girer. Çözüm: kaynağa host/user gömmeyi *tasarım kararı* olarak reddetmek. Denetime "Serdar tarafından derlendi" cümlesi bir bilgi değildir; SCI zaten bu bilgiyi kayıt altına alır.

### Cephe 5: Hermetik Toolchain

Aynı GCC "sürümü" iki farklı dağıtımda gerçekten aynı GCC değildir; distro yamaları, target multilib ayarları, plugin desteği ve default flag'ler farklı olabilir. Sertifikasyon dünyasında bu bir SECI kanıtı ile karşılanır — SECI'ye derleyicinin *sha256'sını*, kullanılan konfigürasyon çıktısını (`gcc -v`, `gcc --version`), spec dosyalarını ve `libgcc.a` sürümünü yazarsınız.

Modern pratikte bunu iki yöntemle taşıyoruz. **(a)** OCI/Docker konteyneri: tam Debian snapshot'ından (snapshot.debian.org, tarih-kilitli) türetilmiş, saklanan ve SECI'ye hash'iyle atıfta bulunulan bir image. **(b)** Bootstrap edilmiş toolchain: kaynak kod + Nix veya Bazel gibi bir sistemle deterministik olarak yeniden inşa edilen bir zincir. İkisi de aynı amaca hizmet eder: SECI'nin işaret ettiği bit dizisi, bir yıl sonra da hâlâ türetilebilir olsun.

Uygulamada, aynı image çekildiğinden emin olmak için `docker image inspect` `sha256` özetiyle atıfta bulunmak, tag'e güvenmemek şarttır. `debian:12` tag'i zaman içinde başka image'lara işaret eder; `debian@sha256:...` işaret etmez.

---

## Deneyi Kapatalım

Beş cephenin bayraklarını uygulayıp aynı örneği tekrar derliyoruz:

```
export SOURCE_DATE_EPOCH=$(git log -1 --pretty=%ct)
export TZ=UTC LC_ALL=C
gcc -O2 -g -Wdate-time \
    -ffile-prefix-map=$(pwd)=. \
    -c foo.c -o foo.o
```

Slave A ve Slave B'de bu satırları koşuyoruz. Sonuç:

```
$ sha256sum foo_A.o foo_B.o
9a4d17...  foo_A.o
9a4d17...  foo_B.o
$ diffoscope foo_A.o foo_B.o
# çıktı boş; dosyalar özdeş
```

Tam bir firmware'de bu şemayı yalnızca `.o`'lara değil, `.a` arşivlerine, `.elf` çıktılarına, `.hex`/`.bin` dönüşümlerine kadar taşırız. Linker tarafında ek iki bayrak devreye girer:

- `-Wl,--build-id=sha1` (veya kesinlikle kararlı istiyorsanız `-Wl,--build-id=none`), böylece build-id yalnızca girdi hash'ine bağlı kalır ya da hiç üretilmez.
- `-Wl,--no-insert-timestamp` (PE/COFF hedefleri için), Windows tarafında zamanı sıfırlamak istediğinizde.

Bunu bir CI adımı olarak "reproducibility gate" olarak da kurabilirsiniz: iki farklı `TMPDIR` altında, iki farklı `TZ` ile, iki farklı `HOME`'da build yapıp `sha256sum` eşitliğini bir test olarak koşarsınız. Determinizm bir kere kırıldığında sessizce fark eden bir muhafız olur.

---

## SECI'ye Ne Yazılır?

SECI, "toolchain yüklüdür" cümlesinden fazlasını ister. Aşağıdaki iskelet, denetlenebilir bir SECI'nin ne taşıdığını gösterir:

| Alan | Örnek |
|---|---|
| Toolchain image | `debian@sha256:9c74e18...` (OCI digest) |
| Derleyici | `arm-none-eabi-gcc 13.2.1 20231009 (release)` — çıktı ekli |
| Derleyici sha256 | `arm-none-eabi-gcc: 3d1a...` |
| Linker | `GNU ld (GNU Binutils) 2.42` — sha256 ekli |
| Bayraklar | `-O2 -g -Wdate-time -ffile-prefix-map=$(pwd)=. -Wl,--build-id=sha1` |
| Ortam | `SOURCE_DATE_EPOCH=1720425600 TZ=UTC LC_ALL=C` |
| Build script | `build.sh sha256: 7f22...` |
| Host OS | `Linux 6.1.0 (deb: bookworm-slim@sha256:...)` |
| Kaynak baseline | `git rev-parse HEAD` çıktısı |

SECI bu tabloyla birlikte SCI'ye tekrar üretilebilirlik cümlesi ekler: "Bu SCI + SECI'den üretilen ikili, `sha256: ab12...`'dir. Aynı ortamda tekrar üretim de aynı hash'i vermek zorundadır." Bu cümle, bir gözlemcinin herhangi bir noktada dönüp doğrulayabildiği bir *hipotez*'dir. Determinizm olmasaydı, bu cümle yerine düzinelerce sayfa açıklama gerekirdi.

---

## DO-330 Açısı: Build Script'iniz Aslında Bir Araç mı?

DO-330 (Software Tool Qualification Considerations) tool'ları etkilerine göre sınıflandırır. Basitleştirilmiş kural: eğer bir araç doğrulama aktivitesini otomatikleştiriyor veya kod üretiyorsa ve *çıktısı sonrasında bağımsız olarak doğrulanmıyorsa*, aracın kendisi nitelendirmeye tabidir. Bir build script determinist değilse, bu çizgi bulanıklaşır — script'in her çalışması farklı bir çıktı üretiyorsa, "çıktısı bağımsız olarak doğrulanıyor" savunması zorlaşır.

Determinist derleme, DO-330 tarafındaki hikâyeyi sadeleştirir: script bir *deterministic function* olduğundan, girdisi (SCI + SECI) ve çıktısı (ikili) arasında matematiksel bir denklik kurulur. Bunu deneysel olarak "bin defa çalıştırdık, aynı sha256'yı ürettik" cümlesiyle destekleyebilirsiniz. Böylece build script, bir "criteria 3" aracı gibi ele alınabilir (etki minör, çıktı ayrıca doğrulanır) — TQL-5 seviyesinde yalın bir kanıt paketi yeter.

Aynı yorum, sertifikasyon dışı ortamlar için de "sürdürülebilir CI" formülüdür. Değişmeyen girdi değişmez çıktı üretiyorsa, cache invaliation kararları kolaylaşır ve `ccache`/`sccache` etkisi maksimize olur. Supply-chain saldırıları perspektifinden de aynı ilke koruyucu olur: iki bağımsız slave aynı ikiliyi üretmiyorsa, birinde bir manipülasyon vardır.

---

## Uç Durumlar ve Bilinen Tuzaklar

**Debug info olmadan aynı, olduğunda farklı.** `-g` bayrağıyla DWARF katmanı devreye girer; `DW_AT_comp_dir`, `DW_AT_name`, dizin tablosu, satır tablosu — hepsi yol ve zaman taşıyıcısıdır. `-ffile-prefix-map` bu katmanı hedefler; ama Rust'ta `--remap-path-prefix`, Go'da `-trimpath` gibi eşdeğerlerini bilmek gerekir. Çoklu-dilli bir üründe her dilin kendi çözümü vardır; SECI hepsini bir başlık altında toplamak zorundadır.

**PIE ve ASLR ile karışıklık.** Position Independent Executable üreten linker, konum bağımsızlığı sağlar ama determinizmi bozmaz. ASLR bir *çalışma zamanı* olgusudur — aynı ikiliye rağmen her koşuda bellek layoutu değişir. Bu ikisi bazen karıştırılır; determinizm hedefleyen ekipler ASLR'yi kapatmayı düşünür oysa bu yanlış problemi çözer.

**LTO (Link Time Optimization).** `-flto` ile birleşen küresel optimizasyon aşaması, iş parçacığı sayısına duyarlıdır: `--jobs=4` ile `--jobs=8` bazen farklı ikili üretir çünkü inlining kararları bir queue'dan tüketilme sırasına bağlı olabilir. GCC'de `-flto=1` (tek iş parçacığı) veya `-flto=jobserver` ile determinist bir noktaya çekilir; sonrasında paralellik yalnızca hız ekseninde çalışır, ikili sonuca dokunmaz.

**Konteynerin içinde tarih akmaya devam eder.** OCI image'ları katman katman inşa edildiğinden, her katmanın manifest'inde bir zaman damgası vardır. `docker build` ürettiği image'ın son katman zamanı, build zamanına eşittir. `docker buildx` `--build-arg SOURCE_DATE_EPOCH=` ve `--output type=oci,rewrite-timestamp=true` seçenekleriyle bunu çözer. Konteyner bit-bit aynı istenmiyor ama içinden çıkan uygulama ikilisinin aynı olması yetiyorsa, bu ayrımı SECI'de yazmak önemlidir.

**Assembly ve `.note` bölümleri.** `.note.gnu.property`, `.note.gnu.build-id`, `.note.ABI-tag` — bunlar araç zinciriyle birlikte gelir ve genellikle deterministtir; ama linker versiyonu değişirse `.note.gnu.property` içeriği sessizce kayar. Bu, hermetik toolchain zorunluluğunu güçlendiren küçük bir kanıttır.

**FPU/soft-float default'lar.** Aynı `arm-none-eabi-gcc` iki farklı distro paketlemesiyle farklı `--with-multilib` default'larına sahip olabilir; `-mfpu=vfpv3-d16 -mfloat-abi=hard` gibi bayrakları *açıkça* set etmek, "default'a güvenmek yerine" tercih edilmelidir. Aynısı `-march`, `-mcpu`, `-mtune` için de geçerlidir. Determinizm burada çıktının değil, girdinin sabitlenmesidir.

---

## Pratik Kontrol Listesi

Bir aviyonik/gömülü ekibin sıfırdan uygulayabileceği en dar disiplinli set:

1. `SOURCE_DATE_EPOCH` `git log -1 --pretty=%ct` ile bağlanır; SECI'de kayıtlıdır.
2. Derleyici bayraklarına `-Wdate-time -ffile-prefix-map=$(pwd)=. -Werror=date-time` eklenir.
3. Linker bayraklarına `-Wl,--build-id=none` veya sabit bir seçim eklenir; `ar --deterministic` varsayılan yapılır.
4. Ortam sabitleri build script başında set edilir: `TZ=UTC LC_ALL=C umask 022`.
5. Toolchain sha256'sıyla SECI'ye kilitlenir; bir Docker image ise `debian@sha256:...` biçimindedir.
6. Kaynak listeleri sıralanır (`sort` veya build sistemi API'si).
7. CI'da bir "reproducibility gate" adımı vardır: farklı `TMPDIR`/`TZ`/`HOME`'da iki paralel build, `sha256sum` eşitliği koşul.
8. `flto` kullanılıyorsa `jobserver` veya sabit iş parçacığı sayısı ile kilitlenir.
9. Konteyner tabanlı build'de `--build-arg SOURCE_DATE_EPOCH=` ve buildx zaman-yeniden-yazma açık.
10. Bir yıllık kanıt saklama: her ikilinin `sha256`'sı SCI'ye yazılır; ortam SECI'de tanımlanır.

Bu listenin ilk üç maddesi bir öğleden sonrada devreye girer ve etki eder. Kalanı bir sprint çerçevesinde, geri kalan CI iyileştirmeleriyle birlikte yürür.

---

## Açık Sorular ve İleri Okuma

Determinist derleme, çözülmüş bir problem değildir. Rust ekosistemi bunu proc-macro ve build.rs kaçaklarıyla; JVM dünyası Maven timestamp gömme alışkanlıklarıyla, Java bytecode'un `Class-Path` girişleriyle boğuşuyor. Kernel dünyasında Linux, `KBUILD_BUILD_TIMESTAMP` ve `SOURCE_DATE_EPOCH` çifti üzerinden bir denge kurmuş durumda; kullanıcı-uzayı için Debian, `debian/rules` seviyesinde varsayılan olarak deterministic build üretiyor. Aviyonik tarafında bu araç ve yaklaşımların "araç nitelendirmesi" perspektifinden nasıl belgeleneceği hâlâ olgunlaşan bir alan; SC-205/EUROCAE WG-71'in bir sonraki güncellemesinin bu ekosistemi nasıl karşılayacağı henüz açık.

Devam okuma niyetindeyseniz: reproducible-builds.org üzerindeki spec ve dokümantasyon geniş bir taban sunuyor; Memfault'un firmware odaklı yazısı gömülü perspektiften somut örnekler veriyor; Conan blog'unun C/C++ notu paketleme diline oturuyor.

---

## Kaynaklar

- [Reproducible Builds — SOURCE_DATE_EPOCH Specification (2015-09-01)](https://reproducible-builds.org/specs/source-date-epoch/)
- [Reproducible Builds — SOURCE_DATE_EPOCH Documentation](https://reproducible-builds.org/docs/source-date-epoch/)
- [Reproducible Builds — Timestamps documentation](https://reproducible-builds.org/docs/timestamps/)
- [Reproducible Builds — Build path documentation](https://reproducible-builds.org/docs/build-path/)
- [Debian Wiki — ReproducibleBuilds/TimestampsFromCPPMacros](https://wiki.debian.org/ReproducibleBuilds/TimestampsFromCPPMacros)
- [GCC Preprocessor Options — SOURCE_DATE_EPOCH ve -Wdate-time](https://gcc.gnu.org/onlinedocs/gcc/Preprocessor-Options.html)
- [GCC Debugging Options — -fdebug-prefix-map, -fmacro-prefix-map, -ffile-prefix-map](https://gcc.gnu.org/onlinedocs/gcc/Debugging-Options.html)
- [Clang 16.0.0 Release Notes — SOURCE_DATE_EPOCH desteği](https://releases.llvm.org/16.0.0/tools/clang/docs/ReleaseNotes.html)
- [diffoscope — in-depth comparison of files, archives, and directories](https://diffoscope.org/)
- [Linux Kernel — Reproducible builds dokümantasyonu](https://docs.kernel.org/kbuild/reproducible-builds.html)
- [Conan Blog — An introduction to deterministic builds with C/C++](https://blog.conan.io/2019/09/02/Deterministic-builds-with-C-C++.html)
- [Interrupt (Memfault) — Reproducible Firmware Builds](https://interrupt.memfault.com/blog/reproducible-firmware-builds)
- [Reproducible Builds — Wikipedia genel bakış](https://en.wikipedia.org/wiki/Reproducible_builds)
- RTCA DO-178C, *Software Considerations in Airborne Systems and Equipment Certification*, Aralık 2011 — özellikle Bölüm 11 hayat döngüsü verileri arasında Software Configuration Index (SCI) ve Software Life Cycle Environment Configuration Index (SECI) tanımları.
- RTCA DO-330, *Software Tool Qualification Considerations*, Aralık 2011.

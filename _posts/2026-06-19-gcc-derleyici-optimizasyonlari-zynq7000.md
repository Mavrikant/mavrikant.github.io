---
title: "Derleyici Optimizasyonlarını Elle Yazmak: Zynq7000 ve GCC ile -O0"
subtitle: "Compiler Optimizations by Hand at -O0"
background: "/img/posts/2.webp"
date: '2026-06-19 09:00:00'
layout: post
lang: tr
mermaid: true
categories: [yazilim]
tags: [c-cpp, gomulu-sistemler]
---

Bir derleyiciye `-O2` verdiğinizde, arka planda onlarca optimizasyon pass'i devreye girer: common subexpression'lar elenir, loop-invariant ifadeler dışarı taşınır, değişkenler register'larda tutulur, küçük fonksiyonlar inline edilir. Peki ya `-O0` ile derliyorsanız? O zaman derleyici neredeyse hiçbir şey yapmaz; yazdığınız her ifadeyi olduğu gibi, harfiyen makine koduna çevirir.

Bu yazıda, temel derleyici optimizasyonlarını **GCC** ve **Zynq7000**'in ARM Cortex-A9 çekirdeği üzerinden tek tek inceleyeceğiz. Her optimizasyon için önce derleyicinin `-O0`'da ürettiği assembly'ye bakacak, sonra **aynı sonucu elle nasıl yazabileceğimizi** göreceğiz. Amaç sadece hız değil; derleyicinin sizin için sessizce ne yaptığını anlamak. Çünkü bir optimizasyonu elle yazabiliyorsanız, onu gerçekten anlamışsınız demektir.

Bu yazıdaki tüm assembly çıktıları gerçek `arm-none-eabi-gcc 13.2` ile üretildi ve doğrulandı.

---

## Neden -O0'da Takılı Kalırsınız?

`-O0`, performans için değil; **öngörülebilirlik** için vardır. Birkaç yaygın senaryo:

- **Debug:** `-O0` ile her kaynak satırı birebir bir makine kodu bloğuna karşılık gelir. Değişkenler bellektedir, `gdb` ile her birini istediğiniz an okuyabilirsiniz. `-O2`'de değişkenler register'larda "uçuşur", kod satırları yer değiştirir ve debugger çoğu zaman `<optimized out>` der.
- **Belirleyici davranış:** Bazı ekipler, üretilen nesne kodunun kaynak kod ile satır satır izlenebilir olmasını ister. `-O0` bu eşlemeyi en saf haliyle korur.
- **Araç ve kütüphane kısıtları:** Eski bir BSP, satıcının desteklediği belirli bir derleyici bayrağı ya da bir optimizasyonun ortaya çıkardığı (gizli) bir hatadan kaçınma isteği sizi `-O0`'a hapsedebilir.

Sebebi ne olursa olsun, `-O0`'da kaldığınızda performansı geri kazanmanın tek yolu **kodu derleyicinin yapacağı işi yapacak şekilde yeniden yazmaktır**. İşte tam olarak bunu öğreneceğiz.

---

## GCC Optimizasyon Seviyeleri

Elle optimizasyona geçmeden önce GCC'nin neyi hangi seviyede açtığını bilmek gerekir. Çünkü "elle yapacağınız" şeyler aslında belirli seviyelerde otomatik olarak yapılan pass'lerin ta kendisidir.

| Seviye | Amaç | Tipik etkinleşen pass'lerin bir kısmı |
|--------|------|--------------------------------------|
| `-O0` | Hızlı derleme, kolay debug (varsayılan) | Yok denecek kadar az |
| `-O1` | Temel optimizasyon | Register allocation, dead code elimination (DCE), basit CSE, constant propagation |
| `-O2` | Üretim için önerilen denge | `-O1` + LICM, daha agresif CSE, inlining, branch prediction, alignment |
| `-O3` | Maksimum hız | `-O2` + loop unrolling, vektörizasyon (auto-SIMD), agresif inlining |
| `-Os` | Boyut için optimizasyon | `-O2`'nin boyutu büyütmeyen alt kümesi |
| `-Og` | Debug'ı bozmadan optimizasyon | `-O1` benzeri, ancak debug deneyimi korunur |
| `-Ofast` | `-O3` + standart-dışı matematik (`-ffast-math`) | Kayan nokta kurallarını gevşetir; dikkatli kullanın |

Buradaki kritik mesaj şudur: **register allocation, CSE, LICM, dead code elimination ve inlining `-O1` ve sonrasında gelir.** `-O0`'da bunların hiçbiri yapılmaz. Bizim elle taklit edeceğimiz optimizasyonların çoğu işte bu listede.

<div class="mermaid">
flowchart LR
    SRC["C kaynağı"] --> FE["Front-end<br/>(ayrıştırma)"]
    FE --> GIMPLE["GIMPLE<br/>(yüksek seviye IR)"]
    GIMPLE -->|"-O1+ pass'leri:<br/>CSE, LICM, DCE,<br/>constant propagation, inlining"| RTL["RTL<br/>(düşük seviye IR)"]
    RTL -->|"register allocation<br/>(-O1+)"| ASM["Assembly"]
    GIMPLE -.->|"-O0: pass'lerin<br/>çoğu ATLANIR"| RTL
    style GIMPLE fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style RTL fill:#e8eef7,stroke:#4a6fa5,stroke-width:2px
    style ASM fill:#d6e9d6,stroke:#3a7d3a,stroke-width:2px
</div>

---

## Zynq7000, Cortex-A9 ve Toolchain

[Önceki bir yazıda](/2026/05/14/renode-ile-zynq7000-simulasyonu.html) Zynq7000'i Renode ile simüle etmiştik. Hatırlatalım: Zynq7000'in PS (Processing System) tarafında çift çekirdekli **ARM Cortex-A9** bulunur. Bu çekirdek **ARMv7-A** mimarisini uygular; süperskaler (çift komut yayımlayabilen), sıra-dışı (out-of-order) yürütmeye sahip, NEON SIMD birimi ve donanımsal VFPv3 FPU ile gelir. Yani aslında hızlı bir çekirdektir — `-O0` ile onu boşa harcamak yazık olur.

Örnekleri şu komutla derleyeceğiz:

```bash
arm-none-eabi-gcc -mcpu=cortex-a9 -mfpu=neon -mfloat-abi=hard \
                  -O0 -S ornek.c -o ornek.s
```

- `-mcpu=cortex-a9` hedef çekirdeği belirtir.
- `-mfpu=neon -mfloat-abi=hard` donanımsal FPU/NEON'u register geçişiyle (hard-float) kullanır.
- `-S` assembly üretir (`.o` yerine `.s`). Üretilen kodu `objdump -d ornek.o` ile de inceleyebilirsiniz.

Assembly'yi okurken iki şeye dikkat edin: **bellek erişimleri** (`ldr` = load, `str` = store) ve **branch'ler** (`b`, `bl`, `blt`...). `-O0`'da performansı yiyen şey neredeyse her zaman gereksiz `ldr`/`str` çiftleridir.

### -O0 Gerçekte Ne Yapar?

En basit fonksiyonla başlayalım:

```c
int add(int a, int b) { return a + b; }
```

`-O2` ile sonuç beklediğiniz gibidir — iki komut:

```armasm
add:
	add	r0, r0, r1
	bx	lr
```

Aynı fonksiyon `-O0` ile:

```armasm
add:
	str	fp, [sp, #-4]!     @ prolog
	add	fp, sp, #0
	sub	sp, sp, #12        @ yereller için stack'te yer aç
	str	r0, [fp, #-8]      @ a  -> stack
	str	r1, [fp, #-12]     @ b  -> stack
	ldr	r2, [fp, #-8]      @ a  <- stack (az önce yazdığımızı geri okuyoruz!)
	ldr	r3, [fp, #-12]     @ b  <- stack
	add	r3, r2, r3         @ a + b
	mov	r0, r3             @ dönüş değeri
	add	sp, fp, #0         @ epilog
	ldr	fp, [sp], #4
	bx	lr
```

İki komut yerine on bir komut. Üstelik `a` ve `b` zaten `r0` ve `r1` register'larındayken, derleyici onları stack'e yazıp **hemen geri okuyor**. İşte `-O0`'ın temel davranışı budur:

> **`-O0`'da her yerel değişken bellekte (stack'te) yaşar.** Bir değişkene her dokunduğunuzda bir `ldr`, her atadığınızda bir `str` üretilir. Değerler register'larda tutulmaz; çünkü register allocation `-O1`'de gelen bir optimizasyondur.

Bu tek cümle, geri kalan her şeyi açıklar. Elle yapacağımız optimizasyonların ortak hedefi şudur: **bellek erişimlerinin ve tekrarlanan hesapların sayısını azaltmak.**

---

## GCC'nin -O0'da Bile Yaptıkları

Buraya kadar "derleyici hiçbir şey yapmıyor" izlenimi verdik. Bu tam doğru değil. GCC'nin front-end'i ve komut seçici, `-O0`'da bile bazı dönüşümleri yapar. Bunları bilmek, **boşuna uğraşmamak** için önemlidir.

**1. Sabit katsayılı çarpma → shift.** `x * 8` yazdığınızda derleyici çarpma komutu (`mul`) kullanmaz:

```c
int mul8(int x) { return x * 8; }
```

```armasm
	ldr	r3, [fp, #-8]      @ x
	lsl	r3, r3, #3         @ x << 3  (yani x * 8) -- mul YOK
	mov	r0, r3
```

Demek ki `x * 8` yerine elle `x << 3` yazmanın `-O0`'da **hiçbir faydası yoktur**. İkisi de aynı koda derlenir.

**2. Sabit sayıya bölme → sihirli çarpma.** ARM'ın `sdiv` komutu olsa bile, sabit bölende derleyici onu kullanmaz; bunun yerine "ters çarpan" (magic number) tekniğini uygular:

```c
int div7(int x) { return x / 7; }
```

```armasm
	ldr	r3, [fp, #-8]      @ x
	movw	r2, #9363
	movt	r2, 37449          @ magic constant 0x92492493
	smull	r1, r2, r2, r3     @ 64-bit çarpma
	add	r2, r2, r3
	asr	r2, r2, #2
	asr	r3, r3, #31
	sub	r3, r2, r3         @ sonuç = x / 7  -- sdiv YOK
```

**3. İşaretsiz sayıda 2'nin kuvvetiyle mod → maskeleme.** `x % 8u` ifadesi tek bir `and` komutuna iner:

```armasm
	and	r3, r3, #7         @ x & 7  (x % 8u)
```

> **Dikkat:** Bu yalnızca **işaretsiz** (`unsigned`) sayılarda geçerlidir. İşaretli bir `int` için `x % 8`, negatif değerlerin işaretini korumak zorunda olduğundan basit bir `and`'e inmez. Eğer değerin daima pozitif olduğunu biliyorsanız, türü `unsigned` yapmak (ya da elle `x & 7` yazmak) gerçek bir kazanç sağlar.

**4. Tek ifade içinde constant folding.** Bir ifade tamamen constant'lardan oluşuyorsa, derleme zamanında hesaplanır:

```c
int secs_per_day(void) { return 60 * 60 * 24; }
```

```armasm
	movw	r3, #20864
	movt	r3, #1             @ 0x15180 = 86400  -- çarpma YOK
```

Yani bu dört optimizasyonu elle yapmaya çalışmak boşunadır; GCC bunları zaten `-O0`'da halleder. Asıl iş, derleyicinin **yapmadığı** optimizasyonlarda başlıyor.

---

## Constant Propagation

GCC tek bir ifade içindeki constant'ları katlar ama **ifadeler arasında** constant yaymaz. Şu örneğe bakalım:

```c
int hesap(void) {
    int x = 10;
    int y = 20;
    return x * y + 5;
}
```

İnsan gözüyle sonucun `205` olduğu apaçık. Ama `-O0`'da derleyici bunu bilmez; `x` ve `y`'yi birer değişken gibi ele alır:

```armasm
	mov	r3, #10
	str	r3, [fp, #-8]      @ x = 10
	mov	r3, #20
	str	r3, [fp, #-12]     @ y = 20
	ldr	r3, [fp, #-8]      @ x
	ldr	r2, [fp, #-12]     @ y
	mul	r3, r2, r3         @ x * y   <-- çalışma zamanında çarpıyor!
	add	r3, r3, #5
	mov	r0, r3
```

Derleme zamanında bilinen bir değeri çalışma zamanında hesaplıyoruz. Çözüm, değeri gerçekten bir **constant** olarak ifade etmek. En temiz yol `enum` veya `#define`:

```c
enum { CARPAN = 10, CARPILAN = 20 };

int hesap(void) {
    return CARPAN * CARPILAN + 5;   /* tamamen constant ifade */
}
```

Artık çıktı tek bir `mov r3, #205`'tir. Aynı prensip önceden hesaplanabilen tablolar için de geçerlidir: bir sinüs tablosunu çalışma zamanında `for` döngüsüyle doldurmak yerine, derleme zamanında hesaplanmış bir `static const` dizi olarak gömün.

> **C'ye özgü tuzak:** C dilinde `const int n = 10;` bir **constant expression** değildir; dizi boyutu olarak ya da `case` etiketinde kullanılamaz ve `-O0`'da yayılmaz. Compile-time constant istiyorsanız `enum` veya `#define` kullanın. (C++'ta `constexpr` bu işi yapar.)

---

## Common Subexpression Elimination (CSE)

Aynı hesabı iki kez yazarsanız, `-O0` onu iki kez yapar. Klasik örnek:

```c
void hesapla(int *y, int *z, int a, int b, int c) {
    *y = a * b + c;
    *z = a * b - c;   /* a * b ikinci kez hesaplanıyor */
}
```

`-O0` çıktısında `mul` komutu **iki kez** görünür:

```armasm
	ldr	r3, [fp, #-16]     @ a
	ldr	r2, [fp, #-20]     @ b
	mul	r2, r2, r3         @ a * b  (1. kez)
	...
	ldr	r3, [fp, #-16]     @ a  (yeniden yükleniyor)
	ldr	r2, [fp, #-20]     @ b  (yeniden yükleniyor)
	mul	r2, r2, r3         @ a * b  (2. kez)
	...
```

Tekrarlanan ifadeyi bir yerel değişkende saklayın:

```c
void hesapla(int *y, int *z, int a, int b, int c) {
    int t = a * b;     /* bir kez hesapla */
    *y = t + c;
    *z = t - c;
}
```

Yeni çıktıda `mul` yalnızca **bir kez** yer alır; üstelik `a` ve `b`'nin ikinci kez yüklenmesi de ortadan kalkar. `t` değişkeni `-O0`'da yine stack'te tutulur (bir `str` + iki `ldr`), ama bir çarpma ve iki yük kazandık. Hesap ne kadar pahalıysa (bölme, `sqrt`, fonksiyon çağrısı...) kazanç o kadar büyür.

Bu teknik sadece aritmetik için değil, **tekrarlanan adres hesapları** için de altın değerindedir: `m[i][j]` gibi çok boyutlu indekslemeleri ya da `cfg->net->iface->mtu` gibi uzun pointer zincirlerini bir kez çözüp yerele alın.

---

## Loop-Invariant Code Motion (LICM)

Bir döngünün içinde, her iterasyonda **aynı sonucu** üreten bir hesap varsa, onu döngü dışına taşıyın. `-O0` bunu asla kendi yapmaz.

```c
/* ÖNCE: x * y + z her iterasyonda yeniden hesaplanıyor */
for (int i = 0; i < n; i++) {
    a[i] = b[i] * (x * y + z);
}

/* SONRA: loop-invariant ifade bir kez hesaplanıyor */
int kat = x * y + z;
for (int i = 0; i < n; i++) {
    a[i] = b[i] * kat;
}
```

Ama bu optimizasyonun en sinsi ve en pahalı biçimi şudur:

```c
/* TUZAK: döngü koşulunda strlen */
for (int i = 0; i < strlen(s); i++) {
    out[i] = s[i];
}
```

Buradaki `strlen(s)` her iterasyonda yeniden çağrılır. Üretilen kodda `bl strlen` döngü testinin içinde yer alır. `strlen`'in kendisi O(n) olduğundan, bu döngü gizlice **O(n²)** karmaşıklığına çıkar. Bir kez dışarı alın:

```c
size_t n = strlen(s);          /* tek bir bl strlen */
for (size_t i = 0; i < n; i++) {
    out[i] = s[i];
}
```

Doğrulama: ilk sürümde `bl strlen` her tur çalışırken, ikinci sürümde **yalnızca bir kez** çağrılır. `-O2` bunu bazen kendi yapar (çünkü `strlen` "saf" işaretlenmiştir), ama `-O0`'da tüm sorumluluk sizdedir. Aynı dikkat `vector.size()`, `list_length()` gibi her çağrıldığında dolaşan fonksiyonlar için de geçerlidir.

---

## Strength Reduction ve Induction Variable'lar

Sıra `-O0`'ın en çok zorlandığı yere geldi: **dizi indeksleme**. `a[i]` ifadesi aslında `*(a + i * sizeof(int))` demektir. `-O0` her iterasyonda bu adresi sıfırdan hesaplar — bir shift (çarpma) ve bir toplama.

```c
int topla(const int *a, int n) {
    int s = 0;
    for (int i = 0; i < n; i++) s += a[i];
    return s;
}
```

Döngü gövdesinde her tur şunu görürüz:

```armasm
.L3:
	ldr	r3, [fp, #-12]     @ i
	lsl	r3, r3, #2         @ i * 4   <-- adres hesabı
	ldr	r2, [fp, #-16]     @ a
	add	r3, r2, r3         @ a + i*4
	ldr	r3, [r3]           @ a[i]
	ldr	r2, [fp, #-8]      @ s
	add	r3, r2, r3
	str	r3, [fp, #-8]      @ s +=
	ldr	r3, [fp, #-12]     @ i
	add	r3, r3, #1         @ i++
	str	r3, [fp, #-12]
.L2:
	ldr	r2, [fp, #-12]     @ i
	ldr	r3, [fp, #-20]     @ n
	cmp	r2, r3
	blt	.L3
```

İterasyon başına **15 komut** ve içinde bir `lsl` (çarpma). Akla ilk gelen çözüm, indeks yerine bir pointer'la dolaşmaktır:

```c
/* İlk deneme: pointer'la dolaş */
for (const int *p = a; p < a + n; p++) s += *p;
```

Ama burada öğretici bir tuzak var. Bu haliyle gövde sadeleşse de, döngü **koşulundaki** `a + n` ifadesi her iterasyonda yeniden hesaplanır (yine bir `lsl` + `add`). Ölçtüğümüzde yine **iterasyon başına 15 komut** çıkar — yani hiçbir kazanç yok! Çarpmayı gövdeden çıkardık, koşula taşıdık.

Doğru çözüm, **sınırı da döngü dışına almaktır** (yani aynı zamanda bir LICM):

```c
int topla(const int *a, int n) {
    int s = 0;
    const int *son = a + n;        /* sınır bir kez hesaplanır */
    for (const int *p = a; p < son; p++) s += *p;
    return s;
}
```

Şimdi gövde temiz:

```armasm
.L3:
	ldr	r3, [fp, #-12]     @ p
	ldr	r3, [r3]           @ *p     <-- adres hesabı YOK
	ldr	r2, [fp, #-8]      @ s
	add	r3, r2, r3
	str	r3, [fp, #-8]      @ s +=
	ldr	r3, [fp, #-12]     @ p
	add	r3, r3, #4         @ p++
	str	r3, [fp, #-12]
.L2:
	ldr	r2, [fp, #-12]     @ p
	ldr	r3, [fp, #-16]     @ son
	cmp	r2, r3
	bcc	.L3
```

İterasyon başına **12 komut** ve artık `lsl` yok. Üç sürümün karşılaştırması:

| Sürüm | İterasyon başına komut | Çarpma (`lsl`) |
|-------|------------------------|----------------|
| Dizi indeksleme `a[i]` | 15 | Var (gövdede) |
| Pointer, sınır içeride `p < a + n` | 15 | Var (koşulda) |
| Pointer, sınır dışarıda `p < son` | **12** | **Yok** |

Ders nettir: pointer'a geçmek tek başına yetmez; sınırı da hesaplanmış halde tutmalısınız. Buna derleyici literatüründe **induction variable strength reduction** denir ve `-O2`'de otomatik yapılır.

---

## Bellek Trafiğini Azaltmak

`-O0`'da en büyük maliyet, baştan söylediğimiz gibi, sürekli stack'e gidip gelmektir. Her global okuması, her struct alanı erişimi, her pointer dereference'i birden fazla `ldr` demektir. Stratejiniz şu olmalı: **sık eriştiğiniz bir değeri döngü öncesinde bir yerele alın, döngü sonrasında geri yazın.**

```c
/* ÖNCE: her iterasyonda nesneyi ve alanını yeniden yükle */
for (int i = 0; i < n; i++) {
    cfg->toplam += veri[i] * cfg->katsayi;
}

/* SONRA: değişmez alanı bir yerele al, biriktirmeyi yerelde yap */
int katsayi = cfg->katsayi;     /* bir kez yükle */
int toplam  = cfg->toplam;
for (int i = 0; i < n; i++) {
    toplam += veri[i] * katsayi;
}
cfg->toplam = toplam;            /* bir kez geri yaz */
```

`cfg->katsayi` bir loop-invariant'tır; her tur `cfg`'yi yükleyip `+offset` ile alanı okumak yerine bir kez yapın. `toplam` da artık dereference yerine doğrudan bir yerelde birikir.

### Peki `register` Keyword'ü?

Klasik refleks, sıcak değişkenlere `register` koymaktır:

```c
register int toplam = 0;
```

Gerçek şu ki **modern GCC `register` ipucunu büyük ölçüde yok sayar**; register allocation'ı tamamen kendi grafiği üzerinden yapar (ve bu allocation `-O1`'de başlar). C++17'de `register` zaten tamamen kullanımdan kaldırıldı. `-O0`'da `register` koysanız bile değişken çoğu zaman stack'te kalır.

> **Acı gerçek:** `-O0`'da bir döngü sayacını gerçekten register'da tutmanın güvenilir tek yolu, en az `-O1` (veya debug'ı bozmayan `-Og`) ile derlemektir. Register allocation elle taklit edilemez; yapabileceğiniz en iyi şey, **erişilen ayrı bellek konumlarının sayısını** azaltmaktır.

---

## Loop Unrolling

`-O0`'da her döngü iterasyonu, asıl işten bağımsız olarak, sabit bir "yönetim vergisi" öder: sayacı artır, sınırla karşılaştır, branch'le. Yukarıdaki `topla` örneğinde bu vergi iterasyon başına yaklaşık **7 komuttu**:

```armasm
	ldr	r3, [fp, #-12]     @ i        ┐
	add	r3, r3, #1         @ i++      │ artırma
	str	r3, [fp, #-12]     @          ┘
	ldr	r2, [fp, #-12]     @ i        ┐
	ldr	r3, [fp, #-20]     @ n        │ test
	cmp	r2, r3             @          │
	blt	.L3                @          ┘
```

Döngüyü elle "açarsanız", bu 7 komutluk vergiyi her eleman yerine her **dört** elemanda bir ödersiniz:

```c
int topla(const int *a, int n) {
    int s = 0;
    int i = 0;
    int m = n & ~3;                 /* 4'ün katına yuvarla */
    for (; i < m; i += 4) {         /* ana döngü: 4'erli */
        s += a[i] + a[i+1] + a[i+2] + a[i+3];
    }
    for (; i < n; i++) {            /* kalan (remainder) döngüsü */
        s += a[i];
    }
    return s;
}
```

Döngü kontrol yükü dörtte bire iner. Bedeli ise daha fazla kod (ikili boyutta artış), bir de kalan elemanları işleyen ikinci döngünün okunabilirliği azaltmasıdır. Tarihî bir merak olarak, [Duff's device](https://en.wikipedia.org/wiki/Duff%27s_device) unrolling ile kalan döngüsünü `switch` kullanarak tek yapıda birleştirir; zekice ama günümüzde okunabilirlik açısından genellikle önerilmez.

> Unrolling agresifleştikçe getiri azalır; 4 ya da 8 katı çoğu durumda yeterlidir. Ölçmeden unroll etmeyin — fazla unrolling, komut cache'ini (I-cache) kirleterek işleri yavaşlatabilir.

---

## Inlining

Küçük yardımcı fonksiyonlar `-O0`'da pahalıdır: her çağrı bir `bl`, bağlam kaydı, argümanların stack'e yazılıp okunması demektir. Doğal refleks `static inline` yazmaktır:

```c
static inline int kare(int x) { return x * x; }
int kullan(int a) { return kare(a) + 1; }
```

Ama burada çoğu kişinin bilmediği bir gerçek var: **`-O0`'da GCC `inline` keyword'ünü dikkate almaz ve yine de gerçek bir çağrı üretir:**

```armasm
kullan:
	...
	bl	kare              @ çağrı hâlâ duruyor!
	...
```

Çözüm, derleyiciyi zorlayan **fonksiyon attribute'u** kullanmaktır. `always_inline`, optimizasyon seviyesi `-O0` olsa **bile** fonksiyonu inline eder:

```c
static inline __attribute__((always_inline))
int kare(int x) { return x * x; }

int kullan(int a) { return kare(a) + 1; }
```

Artık çağrı kayboldu, çarpma doğrudan yerleşti:

```armasm
kullan:
	...
	mul	r3, r3, r3        @ kare() inline edildi -- bl YOK
	add	r3, r3, #1
	...
```

Bu, `-O0`'da işe yarayan en güçlü tekniklerden biridir. Taşınabilir (GCC'ye özgü olmayan) alternatif ise **fonksiyon-benzeri makrolardır**:

```c
#define KARE(x) ((x) * (x))
```

Ama makroların iki klasik tehlikesini unutmayın: **tip güvenliği yoktur** ve **argüman birden fazla değerlendirilir** — `KARE(i++)` `i`'yi iki kez artırır. Mümkünse `always_inline` tercih edin; makroyu son çare olarak kullanın.

---

## Birkaç Ekstra Teknik

**Büyük struct'ları değerle değil, pointer'la geçirin.** `-O0`'da bir struct'ı değerle (by value) geçirmek, tüm baytlarının çağrı yerinde kopyalanması demektir:

```c
typedef struct { int a[8]; } Buyuk;

int isle_kopya(Buyuk b);          /* 32 baytlık kopya gerektirir */
int isle_ptr(const Buyuk *b);     /* sadece bir adres (4 bayt) geçer */
```

Ölçtüğümüzde, `isle_kopya`'yı çağırmak çağrı yerinde **7 bellek erişimi** (kopya) üretirken, `isle_ptr` yalnızca **2** üretir. Yapı büyüdükçe fark açılır. Değiştirmeyecekseniz `const` pointer ile geçirin.

**Uzun `if-else` zincirlerini arama tablosuna çevirin.** `-O0`'da `switch` çoğu zaman sıralı `cmp`/`b` karşılaştırmalarına iner; bir enum'u metne çevirmek gibi durumlarda dizi tabanlı arama hem daha hızlı hem daha okunaklıdır:

```c
/* ÖNCE: her çağrıda zincirleme karşılaştırma */
const char *renk_adi(int r) {
    if (r == 0) return "kirmizi";
    if (r == 1) return "yesil";
    if (r == 2) return "mavi";
    return "?";
}

/* SONRA: sabit zamanlı arama */
static const char *const RENKLER[] = { "kirmizi", "yesil", "mavi" };
const char *renk_adi(int r) {
    return (r >= 0 && r < 3) ? RENKLER[r] : "?";
}
```

**Branchless kod — temkinli kullanın.** `-O0`'da `a > b ? a : b` gerçek bir branch üretir. Bit hileleriyle branch'i yok edebilirsiniz:

```c
int max2(int a, int b) {
    return a ^ ((a ^ b) & -(a < b));   /* branchless max */
}
```

Ancak bu, okunabilirliği ciddi biçimde bozar ve çoğu zaman erken optimizasyondur. Cortex-A9 branch prediction'da iyidir; bu numarayı yalnızca ölçümle kanıtlanmış sıcak yollarda kullanın.

---

## Zynq'te Ölçüm: Cortex-A9 Cycle Counter

Buraya kadarki tüm iddialar "şu kadar komut azaldı" üzerineydi. Ama gerçek performans çekirdek, cache ve bellek davranışına bağlıdır. **Tahmin etmeyin, ölçün.** Cortex-A9'un PMU'su (Performance Monitoring Unit) bir cycle counter (PMCCNTR) içerir; bare-metal kodda CP15 üzerinden okuyabilirsiniz:

```c
#include <stdint.h>

/* Cycle counter'ı etkinleştir (supervisor/EL1 modu gerekir) */
static inline void cevrim_sayacini_ac(void) {
    /* PMCR: E=etkinleştir (bit0), C=cycle counter'ı sıfırla (bit2) */
    asm volatile("mcr p15, 0, %0, c9, c12, 0" :: "r"(1u | (1u << 2)));
    /* PMCNTENSET: CCNT'yi (bit31) aç */
    asm volatile("mcr p15, 0, %0, c9, c12, 1" :: "r"(0x80000000u));
}

static inline uint32_t cevrim_oku(void) {
    uint32_t c;
    asm volatile("mrc p15, 0, %0, c9, c13, 0" : "=r"(c));  /* PMCCNTR */
    return c;
}
```

Kullanımı:

```c
cevrim_sayacini_ac();
uint32_t bas = cevrim_oku();
int sonuc = topla(dizi, N);       /* ölçülecek kod */
uint32_t bit = cevrim_oku();
printf("topla(): %u cycle\n", bit - bas);
```

İki sürümü (önce/sonra) aynı veriyle ölçüp gerçek farkı görebilirsiniz. Linux altında çalışıyorsanız PMU'ya doğrudan erişim yerine `perf stat` kullanın. Renode gibi bir simülatörde ise [önceki yazıda](/2026/05/14/renode-ile-zynq7000-simulasyonu.html) anlatıldığı gibi yürütme belirleyici olduğundan, komut sayımı tekrarlanabilir bir ölçüt olur.

---

## Gerçeklik Kontrolü

Tüm bu tekniklere rağmen, dürüst olmak gerekirse: **`-O0`'da en etkili "optimizasyon", `-O0`'da kalmamaktır.** `-Og` veya `-O1` size register allocation'ı, temel CSE'yi, LICM'i ve dead code elimination'ı neredeyse bedavaya verir — üstelik `-Og` debug'ı da bozmaz. Elle mikro-optimizasyon, optimizasyon seviyesinin sizin elinizde olmadığı durumlar için bir **son çaredir**.

Elle optimizasyonun bedeli vardır:

- **Okunabilirlik ve bakım:** Pointer yürüyüşleri, açılmış döngüler ve bit hileleri kodu anlamayı zorlaştırır.
- **Hata riski:** Açılmış bir döngünün kalan kısmını ya da `n & ~3` sınırını yanlış yazmak kolaydır.
- **Standart uyumu:** Emniyet-kritik projelerde MISRA C gibi kılavuzlar, pointer aritmetiğini ve `goto`/Duff's device türü yapıları kısıtlar. ([MISRA C:2025 yazısına](/2026/04/05/misra-c-2025-ile-neler-degisti.html) göz atın.)

### Özet Tablo

| Optimizasyon | GCC `-O0`'da yapar mı? | Elle nasıl yapılır | Risk |
|--------------|:---------------------:|--------------------|------|
| Constant×kuvvet, constant÷, `unsigned`%kuvvet | **Evet** | Gerek yok | — |
| Tek ifade içinde constant folding | **Evet** | Gerek yok | — |
| Constant propagation (ifadeler arası) | Hayır | `enum`/`#define`/literal | Düşük |
| Common subexpression elimination (CSE) | Hayır | Yerel geçici değişken | Düşük |
| Loop-invariant code motion (LICM) | Hayır | Hesabı döngü dışına al | Düşük |
| Induction variable (indeks→pointer) | Hayır | Pointer + sınırı dışarı al | Orta |
| Register allocation | Hayır | (Mümkün değil — `-O1`/`-Og` kullan) | — |
| Loop unrolling | Hayır | 4/8'erli aç + kalan döngüsü | Orta |
| Inlining | Hayır (`inline` yok sayılır) | `always_inline` / makro | Orta |
| Büyük struct kopyası | Hayır | `const` pointer'la geçir | Düşük |

Derleyici optimizasyonları sihir değildir; sistematik, mekanik dönüşümlerdir. `-O0`'da bu dönüşümleri elle yazabiliyorsanız, hem o anki kısıtın altından kalkmış olursunuz hem de `-O2`'nin perde arkasında ne yaptığını gerçekten anlarsınız. Ve çoğu zaman varacağınız sonuç şu olur: **derleyiciye güvenin, ona daha yüksek bir optimizasyon seviyesi verin ve kazandığınız zamanı algoritmanızı iyileştirmeye harcayın.**

---

**Kaynaklar:**

- [GCC: Options That Control Optimization](https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html)
- [Arm Cortex-A9 Technical Reference Manual](https://developer.arm.com/documentation/100511/latest/)
- [Arm Architecture Reference Manual (ARMv7-A/R) — PMU](https://developer.arm.com/documentation/ddi0406/latest/)
- [Compiler Explorer (godbolt.org)](https://godbolt.org/) — kaynak ve assembly'yi yan yana görmek için
- [Agner Fog — Optimizing software in C++](https://www.agner.org/optimize/optimizing_cpp.pdf)
- [GCC: Common Function Attributes (`always_inline`)](https://gcc.gnu.org/onlinedocs/gcc/Common-Function-Attributes.html)

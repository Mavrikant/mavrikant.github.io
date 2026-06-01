---
title: "C'de Tanımsız Davranış: Derleyicinin Sizi Uyarmadığı Mayın Tarlası"
background: "/img/posts/7.jpg"
date: '2026-04-03 10:00:00'
layout: post
lang: tr
---

C dilinin en güçlü yanı donanıma yakınlığıdır; en tehlikeli yanı da budur. C standardı, bazı işlemlerin sonucunu bilinçli olarak **tanımsız** bırakır. Derleyici bu durumlarda ne isterse yapabilir — programınız doğru çalışabilir, çökebilir veya en kötüsü, **yanlış ama inandırıcı** sonuçlar üretebilir. Bu yazıda, özellikle gömülü sistemlerde ve güvenlik-kritik yazılımlarda sıkça karşılaşılan tanımsız davranış (undefined behavior, kısaca **UB**) örneklerini ve korunma yöntemlerini inceliyoruz.

---

## Tanımsız Davranış Nedir?

C standardı (C11 §3.4.3) tanımsız davranışı şöyle tanımlar:

> *"Taşınabilir olmayan veya hatalı bir program yapısının ya da hatalı verinin kullanılmasında, bu standardın herhangi bir gereksinim dayatmadığı davranış."*

Standart üç farklı "belirsizlik" seviyesi tanımlar:

| Terim | Açıklama | Örnek |
|-------|----------|-------|
| **Implementation-defined** | Derleyici belgelemek zorunda | `int` boyutu (16/32/64 bit) |
| **Unspecified** | Birkaç geçerli seçenekten biri olur | Fonksiyon argümanlarının değerlendirilme sırası |
| **Undefined** | Her şey olabilir | İşaretli tamsayı taşması |

Tanımsız davranışın en önemli farkı şudur: derleyici, UB'nin **asla gerçekleşmeyeceğini varsayarak** optimizasyon yapabilir. Bu, beklenmedik sonuçlara yol açar.

---

## 1. İşaretli Tamsayı Taşması

C'de işaretsiz (`unsigned`) tamsayı taşması iyi tanımlıdır: modüler aritmetik uygulanır. Ancak **işaretli** (`signed`) tamsayı taşması **tanımsız davranıştır**.

```c
#include <limits.h>
#include <stdio.h>

int main() {
    int x = INT_MAX;
    printf("x     = %d\n", x);
    printf("x + 1 = %d\n", x + 1);  // UB!
    return 0;
}
```

Birçok geliştirici "ikiye tümleyen (two's complement) aritmetiği nedeniyle `INT_MIN` döner" diye düşünür. Ancak bu bir **garanti değildir.** Derleyici, `x + 1 > x` ifadesinin her zaman `true` olduğunu varsayarak kontrolleri tamamen silebilir:

```c
// Güvenlik kontrolü: taşma var mı?
if (x + 1 > x) {
    // Derleyici bu dalı "her zaman doğru" sayıp
    // kontrolü tamamen kaldırabilir!
    printf("Taşma yok\n");
}
```

### Gerçek Dünya Etkisi

2007 yılında GCC, Linux çekirdeğindeki şu kontrolü optimize edip silmiştir:

```c
// Çekirdeğin istediği şey: taşma kontrolü
if (ptr + offset < ptr) {
    // Taşma tespit edildi, işlemi reddet
    return -EFAULT;
}
```

GCC, işaretçi aritmetiğinde taşmanın UB olduğunu bildiğinden, `ptr + offset < ptr` ifadesinin **asla doğru olamayacağını** varsayarak tüm `if` bloğunu silmiştir. Sonuç: güvenlik açığı.

### Çözüm

```c
#include <stdint.h>
#include <stdbool.h>

// Güvenli toplama: taşmayı önceden kontrol et
bool guvenli_topla(int a, int b, int *sonuc) {
    if (b > 0 && a > INT_MAX - b) return false;  // Pozitif taşma
    if (b < 0 && a < INT_MIN - b) return false;  // Negatif taşma
    *sonuc = a + b;
    return true;
}
```

GCC ve Clang'ın `__builtin_add_overflow()` gibi yerleşik fonksiyonları da kullanılabilir:

```c
int sonuc;
if (__builtin_add_overflow(a, b, &sonuc)) {
    // Taşma oluştu
}
```

---

## 2. Null İşaretçi Erişimi

Null işaretçisini dereference etmek tanımsız davranıştır. Ancak derleyici bundan çok daha fazlasını çıkarır:

```c
void islem(int *ptr) {
    int deger = *ptr;        // (1) ptr kullanıldı → null olamaz
    if (ptr == NULL) {       // (2) Derleyici: "ptr null olamaz" → kontrol gereksiz
        return;
    }
    printf("%d\n", deger);
}
```

Satır (1)'de `ptr` dereference edildiği için, derleyici `ptr`'nin null olmadığını varsayar. Bu yüzden satır (2)'deki null kontrolü **optimize edilip silinir.** Eğer `ptr` gerçekten null ise, kontrol hiçbir zaman çalışmaz ve program çöker — ya da daha kötüsü, çökmez ama bozuk veriyle devam eder.

### Doğru Sıralama

```c
void islem(int *ptr) {
    if (ptr == NULL) {       // Önce kontrol et
        return;
    }
    int deger = *ptr;        // Sonra kullan
    printf("%d\n", deger);
}
```

---

## 3. Başlatılmamış Değişken Kullanımı

```c
int main() {
    int x;              // Başlatılmamış
    if (x == 0) {       // UB: x'in değeri belirsiz
        printf("Sıfır\n");
    }
    return 0;
}
```

Birçok geliştirici "bellek sıfırlanır" veya "stack'te ne varsa o olur" diye düşünür. Ancak derleyici, başlatılmamış değişkeni **her seferinde farklı** bir değere sahipmiş gibi ele alabilir. Hatta farklı optimizasyon seviyelerinde farklı sonuçlar üretebilir.

### Gömülü Sistemlerde Tehlike

Güvenlik-kritik gömülü sistemlerde bu durum özellikle tehlikelidir. Başlatılmamış bir durum değişkeni, kontrol sisteminizi beklenmedik bir duruma sokabilir:

```c
typedef enum { DURUM_BOSTA, DURUM_AKTIF, DURUM_HATA } Durum;

void baslat(void) {
    Durum mevcut_durum;  // Başlatılmamış!
    // ...
    if (mevcut_durum == DURUM_BOSTA) {
        motoru_calistir();  // Beklenmedik anda çalışabilir!
    }
}
```

### Çözüm: Her Zaman Başlat

```c
Durum mevcut_durum = DURUM_BOSTA;  // Açık başlangıç değeri
```

---

## 4. Dizi Sınırı Dışına Erişim

C, dizi sınırlarını kontrol etmez. Bu, performans için bir kazançtır; güvenlik için bir felakettir:

```c
int dizi[5] = {10, 20, 30, 40, 50};

// UB: dizi[5] sınır dışı
printf("%d\n", dizi[5]);

// Daha da kötüsü: stack'teki başka bir değişkeni bozabilir
dizi[5] = 999;
```

### Buffer Overflow ve Güvenlik

Dizi sınırı aşımı, tarihte en fazla istismar edilen güvenlik açığı türlerinden biridir. Morris Worm'dan (1988) günümüze kadar sayısız saldırının temelinde bu UB yatar:

```c
// Klasik buffer overflow
char tampon[64];
gets(tampon);  // Kullanıcı 64 bayttan fazla girerse → UB → güvenlik açığı
```

`gets()` fonksiyonu bu nedenle C11 standardında kaldırılmıştır. Yerine `fgets()` kullanılmalıdır:

```c
char tampon[64];
fgets(tampon, sizeof(tampon), stdin);  // Sınır korumalı
```

---

## 5. Strict Aliasing İhlali

C'nin **strict aliasing** kuralı, farklı türdeki işaretçilerin aynı bellek bölgesini göstermeyeceğini varsayar (belirli istisnalar dışında). Bu kural, derleyicinin agresif optimizasyon yapmasını sağlar:

```c
// UB: strict aliasing ihlali
float f = 3.14f;
int *ip = (int *)&f;          // float* → int* dönüşümü
printf("Bitler: 0x%08X\n", *ip);  // UB!
```

### Neden Tehlikeli?

Derleyici, `*ip`'nin `f`'yi etkilemeyeceğini varsayarak `f`'nin değerini bir register'da tutar ve bellekten tekrar okumaz. Bu, beklediğiniz sonucu almayacağınız anlamına gelir.

### Doğru Yöntem: `memcpy`

```c
#include <string.h>

float f = 3.14f;
int i;
memcpy(&i, &f, sizeof(i));    // Tanımlı davranış
printf("Bitler: 0x%08X\n", i);
```

Modern derleyiciler `memcpy`'yi optimize ederek gerçek bir kopyalama yapmaz; aynı performansı sağlar.

---

## 6. Çift `free` ve Use-After-Free

Dinamik bellek yönetimindeki UB'ler, güvenlik açıklarının en yaygın kaynaklarından biridir:

```c
#include <stdlib.h>

int *ptr = malloc(sizeof(int));
*ptr = 42;

free(ptr);
// ptr artık serbest bırakılmış belleğe işaret ediyor

*ptr = 99;    // UB: use-after-free
free(ptr);    // UB: double free
```

### Çözüm: Serbest Bırakılan İşaretçiyi Null Yap

```c
free(ptr);
ptr = NULL;   // Artık yanlışlıkla erişim segfault verir
              // (ki bu, sessiz bozulmadan iyidir)
```

---

## Derleyici Bayrakları ve Araçlar

Tanımsız davranışı tespit etmek için modern araçlar büyük kolaylık sağlar:

### Derleme Zamanı

```bash
# GCC / Clang: Tüm uyarıları aç
gcc -Wall -Wextra -Wpedantic -Werror kaynak.c

# Daha agresif kontroller
gcc -fsanitize=undefined -fsanitize=address kaynak.c
```

### Çalışma Zamanı

| Araç | Tespit Ettiği UB Türleri |
|------|--------------------------|
| **UBSan** (`-fsanitize=undefined`) | Tamsayı taşması, sınır dışı erişim, null dereference |
| **ASan** (`-fsanitize=address`) | Buffer overflow, use-after-free, double free |
| **MSan** (`-fsanitize=memory`) | Başlatılmamış bellek okuma |
| **Valgrind** | Bellek sızıntıları, geçersiz erişim |

### Statik Analiz

```bash
# Clang Static Analyzer
scan-build gcc -c kaynak.c

# Cppcheck
cppcheck --enable=all kaynak.c
```

Havacılık ve savunma projelerinde kullanılan **MISRA C** ve **CERT C** kodlama standartları, UB'ye yol açan yapıların büyük çoğunluğunu yasaklar. Statik analiz araçları (Polyspace, QA·C, Coverity) bu kurallara uyumu otomatik olarak denetler.

---

## Özet

| UB Türü | Tipik Belirti | Önlem |
|---------|---------------|-------|
| İşaretli tamsayı taşması | Güvenlik kontrollerinin silinmesi | `__builtin_add_overflow()` veya önceden kontrol |
| Null dereference | Null kontrollerinin optimize edilip silinmesi | Erişimden önce kontrol et |
| Başlatılmamış değişken | Farklı çalıştırmalarda farklı sonuç | Her zaman başlangıç değeri ver |
| Dizi sınırı aşımı | Stack bozulması, güvenlik açığı | `fgets()`, sınır kontrolü |
| Strict aliasing ihlali | Yanlış optimizasyon | `memcpy` kullan |
| Double free / use-after-free | Heap bozulması | `free` sonrası `ptr = NULL` |

C'de tanımsız davranış, "benim makinemde çalışıyor" yanılsamasının en büyük kaynağıdır. Farklı bir derleyici sürümü, farklı bir optimizasyon seviyesi veya farklı bir hedef platform — her biri sessiz olan hatayı gürültülü bir çökmeye ya da daha kötüsü, fark edilmeyen bir güvenlik açığına dönüştürebilir.

UB'den korunmanın yolu, **derleyici uyarılarını açmak**, **sanitizer'ları kullanmak**, **statik analiz araçlarından faydalanmak** ve **kodlama standartlarına (MISRA C, CERT C) uymaktır.** Modern C yazmak, yalnızca sözdizimini bilmek değil; dilin **tanımlamadığı** şeyleri de bilmektir.

---

**Kaynaklar:**
- [C11 Standard §3.4.3 — Undefined Behavior](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1548.pdf)
- [What Every C Programmer Should Know About Undefined Behavior](https://blog.llvm.org/2011/05/what-every-c-programmer-should-know.html)
- [SEI CERT C Coding Standard](https://wiki.sei.cmu.edu/confluence/display/c/SEI+CERT+C+Coding+Standard)
- [GCC UndefinedBehaviorSanitizer](https://gcc.gnu.org/onlinedocs/gcc/Instrumentation-Options.html)

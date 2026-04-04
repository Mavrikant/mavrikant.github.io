---
title: "C/C++'da Tanımsız Davranış: Derleyicinin Sessiz Düşmanı"
background: "/img/posts/8.jpg"
date: '2026-04-04 12:00:00'
layout: post
lang: tr
---

Bir önceki yazımızda [kayan nokta sayılarının tehlikelerinden](/2026/03/25/kayan-nokta-sayilarinin-tehlikeleri.html) bahsetmiştik. O yazıdaki bazı örnekler aslında daha derin bir sorunun parçasıydı: **Tanımsız Davranış** (*Undefined Behavior*, kısaca **UB**). C ve C++ dillerinin en güçlü yanı olan donanıma yakınlık, aynı zamanda en tehlikeli yanıdır. Bu yazıda, UB'nin ne olduğunu, derleyicilerin bunu nasıl istismar ettiğini ve güvenlik-kritik sistemlerde bu tuzaklardan nasıl kaçınılacağını inceleyeceğiz.

## Tanımsız Davranış Nedir?

C standardı (ISO/IEC 9899) üç tür "sorunlu" davranış tanımlar:

| Davranış Türü | Tanım | Örnek |
|----------------|--------|-------|
| **Implementation-defined** | Sonuç derleyiciye bağlıdır ama belgelenmelidir | `int` boyutu, `char`'ın işaretli olup olmadığı |
| **Unspecified** | Birden fazla geçerli sonuç mümkündür | Fonksiyon argümanlarının değerlendirilme sırası |
| **Undefined** | Standart hiçbir garanti vermez | Null pointer dereference, signed overflow |

Tanımsız davranış durumunda derleyici kelimenin tam anlamıyla **her şeyi** yapabilir. Programınız çökebilir, yanlış sonuç üretebilir ya da — belki de en tehlikelisi — *görünürde doğru* çalışabilir. "Nasal demons" (burundan şeytan çıkması) ifadesi, C topluluğunda UB'nin sonuçlarının tamamen öngörülemez olduğunu vurgulamak için kullanılır.

## Basit Ama Ölümcül: Signed Integer Overflow

En yaygın ve en çok göz ardı edilen UB kaynaklarından biri, işaretli tamsayı taşmasıdır:

```c
#include <stdio.h>
#include <limits.h>

int main() {
    int x = INT_MAX;
    int y = x + 1; // Tanımsız davranış!

    printf("INT_MAX = %d\n", x);
    printf("INT_MAX + 1 = %d\n", y);

    return 0;
}
```

"Ama bu sadece sarılır (wrap around) ve negatif bir sayı verir" diye düşünüyor olabilirsiniz. `-O0` ile derlediğinizde muhtemelen haklısınız. Ancak optimizasyon açıkken derleyici bu kodu tamamen farklı yorumlayabilir.

### Derleyici Neden Bunu Önemser?

Modern derleyiciler UB'yi bir **optimizasyon fırsatı** olarak görür. Mantık şöyledir:

> "Standart bu durumun asla gerçekleşmeyeceğini söylüyor. O halde bu durumu varsayarak kodu optimize edebilirim."

Şu örneğe bakın:

```c
int check_overflow(int x) {
    if (x + 100 < x) {
        // Taşma kontrolü — x + 100, x'ten küçükse taşma olmuştur
        return 1; // taşma var
    }
    return 0; // taşma yok
}
```

GCC, `-O2` ile bu fonksiyonu şuna derler:

```asm
check_overflow:
    xorl    %eax, %eax    ; return 0
    ret
```

Derleyici tüm `if` bloğunu silmiştir! Neden? Çünkü signed integer overflow tanımsız davranıştır, dolayısıyla derleyici `x + 100 < x` ifadesinin **asla doğru olamayacağını** varsayar. Matematiksel olarak, taşma yoksa `x + 100` her zaman `x`'ten büyüktür.

Bu, güvenlik açısından felaket olabilir. Taşma kontrolü yazmışsınızdır ama derleyici onu sessizce kaldırmıştır.

### Güvenli Alternatif

```c
#include <limits.h>

int safe_add(int a, int b) {
    if (b > 0 && a > INT_MAX - b) return -1; // taşma
    if (b < 0 && a < INT_MIN - b) return -1; // alt taşma
    return a + b;
}
```

Ya da GCC/Clang'ın yerleşik fonksiyonlarını kullanabilirsiniz:

```c
int result;
if (__builtin_add_overflow(a, b, &result)) {
    // Taşma oluştu
}
```

## Null Pointer Dereference ve Elenen Kontroller

Bir diğer klasik UB kaynağı:

```c
void process(int *ptr) {
    int val = *ptr;        // ptr burada dereference ediliyor

    if (ptr == NULL) {     // Derleyici bu kontrolü silebilir!
        printf("Hata: NULL pointer!\n");
        return;
    }

    printf("Değer: %d\n", val);
}
```

Derleyici şöyle düşünür: "`*ptr` ifadesi zaten çalıştırıldı. Eğer `ptr` NULL olsaydı, bu tanımsız davranış olurdu. Tanımsız davranış olmadığını varsayıyorum, dolayısıyla `ptr` NULL olamaz. `if` bloğunu silerim."

Bu, Linux çekirdeğinde gerçek bir güvenlik açığına yol açmıştır (CVE-2009-1897). Düzeltme sıralama değişikliği ile yapılmıştır:

```c
void process_safe(int *ptr) {
    if (ptr == NULL) {     // Önce kontrol et
        printf("Hata: NULL pointer!\n");
        return;
    }

    int val = *ptr;        // Sonra dereference et
    printf("Değer: %d\n", val);
}
```

## Başlatılmamış Değişkenler: Schrödinger'in Değeri

```c
int oyna() {
    int x; // Başlatılmamış!

    if (x == 0) {
        printf("Sıfır\n");
    } else {
        printf("Sıfır değil\n");
    }

    return x;
}
```

Bu kod her çalıştırıldığında farklı sonuç verebilir. Daha da kötüsü, derleyici `x`'in herhangi bir değere sahip olabileceğini varsayarak her iki dalı da silebilir veya ikisinden birini seçebilir. `x` burada bir "Schrödinger değişkeni" gibidir — gözlemleyene kadar ne olduğu belli değildir, hatta gözlemledikten sonra bile tutarlı olmayabilir.

Clang bazı durumlarda başlatılmamış değişkenleri sabit olarak ele alabilir ve beklenmedik optimizasyonlara yol açabilir:

```c
int foo() {
    int x;       // başlatılmamış
    int y = x;   // UB — ama Clang bunu görmezden gelebilir
    int z = x;   // x her iki satırda farklı değer "üretebilir"

    if (y == z) {
        // Derleyici bunu "her zaman doğru" kabul etmeyebilir!
    }

    return 0;
}
```

## Strict Aliasing: Gizli Katil

C'nin strict aliasing kuralı, farklı tiplerdeki pointer'ların aynı bellek bölgesini göstermediğini varsaymaya izin verir:

```c
#include <stdint.h>
#include <stdio.h>

float int_bits_to_float_YANLIS(int i) {
    // Strict aliasing ihlali — tanımsız davranış!
    return *(float *)&i;
}

float int_bits_to_float_DOGRU(int i) {
    float f;
    memcpy(&f, &i, sizeof(f)); // Güvenli
    return f;
}
```

Neden `memcpy` güvenli de pointer cast güvenli değil? Çünkü `memcpy` byte düzeyinde bir kopyalama yapar ve aliasing kurallarını ihlal etmez. Derleyiciler `memcpy`'yi tanır ve genellikle aynı makine kodunu üretir — ama tanımsız davranış olmadan.

### Gerçek Dünyadan Bir Örnek

Gömülü sistemlerde sıkça karşılaşılan bir yapı:

```c
// Donanım registerına yazma — YANLIŞ
void write_register_bad(volatile uint32_t *reg, float value) {
    *(volatile uint32_t *)&value = *(uint32_t *)&value; // UB
    *reg = *(uint32_t *)&value;                          // UB
}

// Doğru yöntem
void write_register_good(volatile uint32_t *reg, float value) {
    uint32_t bits;
    memcpy(&bits, &value, sizeof(bits));
    *reg = bits;
}
```

## Sınır Dışı Dizi Erişimi

```c
int arr[4] = {10, 20, 30, 40};
int val = arr[5]; // Tanımsız davranış
```

Bu sadece "yanlış değer okumak" değildir. Derleyici, dizi erişiminin her zaman sınırlar içinde olduğunu varsayabilir ve buna dayanarak optimizasyonlar yapabilir:

```c
int table[4] = {0, 1, 2, 3};

int lookup(unsigned int index) {
    if (index < 4)
        return table[index];
    return -1; // Geçersiz indeks
}
```

Bu fonksiyon güvenli görünür. Ancak şu çağrıyı düşünün:

```c
int x = table[user_input]; // UB eğer user_input >= 4
int y = lookup(user_input);
```

İlk satırdaki UB yüzünden derleyici `user_input < 4` olduğunu varsayabilir ve `lookup` içindeki sınır kontrolünü silebilir.

## UB ve Güvenlik-Kritik Yazılımlar

Aviyonik yazılım geliştirirken (DO-178C kapsamında), UB bir "hata" değil, bir **sertifikasyon engelidir**. MISRA C ve MISRA C++ standartları, UB kaynaklarının büyük çoğunluğunu yasaklar:

| MISRA Kuralı | Kapsam | Zorunluluk |
|--------------|--------|------------|
| Rule 10.1 | Signed integer overflow | Required |
| Rule 11.3 | Pointer cast (aliasing) | Required |
| Rule 18.1 | Sınır dışı dizi erişimi | Required |
| Rule 9.1 | Başlatılmamış değişken | Mandatory |
| Rule 1.3 | Tüm undefined behavior | Required |

### Statik Analiz Araçları

Güvenlik-kritik projelerde UB tespiti için statik analiz araçları vazgeçilmezdir:

- **Polyspace** (MathWorks): Formal doğrulama ile UB'yi matematiksel olarak kanıtlar. DO-178C için sertifikalıdır.
- **Coverity** (Synopsys): Büyük kod tabanlarında UB ve güvenlik açıklarını tespit eder.
- **Clang Static Analyzer**: Açık kaynaklı, CI/CD süreçlerine kolayca entegre edilebilir.
- **PC-lint / FlexeLint**: MISRA uyumluluğu kontrolü yapar.
- **cppcheck**: Açık kaynaklı ve hafif bir alternatif.

### Derleyici Bayrakları

Geliştirme sürecinde UB'yi yakalamak için şu bayrakları kullanmalısınız:

```bash
# GCC / Clang — Tanımsız davranış sanitizer'ı
gcc -fsanitize=undefined -fno-sanitize-recover=all -O2 main.c -o main

# Tüm sanitizer'ları birlikte
gcc -fsanitize=undefined,address -fno-omit-frame-pointer -O1 main.c -o main
```

UBSan çalışma zamanında şöyle bir çıktı üretir:

```
main.c:5:15: runtime error: signed integer overflow:
2147483647 + 1 cannot be represented in type 'int'
```

**`-ftrapv`** bayrağı ise signed integer overflow durumunda programı doğrudan çökertir (SIGABRT):

```bash
gcc -ftrapv main.c -o main
```

## Pratik Kontrol Listesi

Projenizde UB riskini minimize etmek için:

1. **Derleyici uyarılarını açın ve hata olarak değerlendirin:**
   ```bash
   gcc -Wall -Wextra -Werror -Wpedantic -std=c11
   ```

2. **Sanitizer'ları CI/CD sürecinize ekleyin** — her commit'te UBSan ve ASan çalıştırın.

3. **MISRA uyumluluğu hedefleyin** — güvenlik-kritik olmasanız bile, MISRA kuralları UB'nin çoğunu önler.

4. **`unsigned` tamsayıları tercih edin** — taşma davranışı tanımlıdır (modüler aritmetik). Ancak dikkat: negatif değer gerektiren hesaplamalarda `unsigned` kendi tuzaklarını getirir.

5. **`memcpy` kullanın, pointer cast değil** — tip dönüşümü gereken her yerde.

6. **Değişkenleri her zaman başlatın** — C++'da `{}` ile, C'de `= {0}` ile.

7. **Statik analiz aracı kullanın** — en azından `cppcheck` veya Clang Static Analyzer.

## Sonuç

C ve C++, programcıya güvenir. Bu güven, performans ve esneklik sağlar ama bir bedeli vardır: tanımsız davranış. Modern derleyiciler bu güveni agresif optimizasyonlar için kullanır ve "işe yarıyor gibi görünen" kodunuz bir derleyici güncellemesi veya optimizasyon seviyesi değişikliğiyle çökebilir.

Özellikle gömülü ve güvenlik-kritik sistemlerde, UB bir "teorik sorun" değil, gerçek bir güvenlik ve güvenilirlik riskidir. Derleyici bayrakları, sanitizer'lar ve statik analiz araçları bu riski azaltır — ama en önemli silah, UB'nin ne olduğunu anlamak ve kodunuzda onu tanıyabilmektir.

*"In C, undefined behavior is the compiler's way of saying: you broke the contract, and now I'm free to do whatever I want."*

## Kaynaklar

- ISO/IEC 9899:2018 — C18 Standardı
- [What Every C Programmer Should Know About Undefined Behavior](https://blog.llvm.org/2011/05/what-every-c-programmer-should-know.html) — Chris Lattner, LLVM Blog
- MISRA C:2012 — Guidelines for the Use of the C Language in Critical Systems
- [A Guide to Undefined Behavior in C and C++](https://blog.regehr.org/archives/213) — John Regehr
- DO-178C — Software Considerations in Airborne Systems and Equipment Certification

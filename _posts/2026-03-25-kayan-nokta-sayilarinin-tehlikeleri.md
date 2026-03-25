---
title: Kayan Nokta Sayılarının Tehlikeleri
background: "/img/posts/6.jpg"
date: '2026-03-25 09:00:00'
layout: post
lang: tr
---

Yazılım geliştirirken `float` ve `double` türlerini sıklıkla kullanırız. Ancak kayan nokta sayıları, görünürde masum olan birçok tuzak barındırır. Bu yazıda, IEEE 754 standardının getirdiği sınırlamalar ve bu sınırlamaların nasıl beklenmedik hatalara yol açabileceği üzerinde duracağız.

## IEEE 754 ve Özel Değerler

Modern bilgisayarlar kayan nokta sayılarını [IEEE 754](https://en.wikipedia.org/wiki/IEEE_754) standardına göre temsil eder. Bu standart yalnızca gerçek sayıları değil, bir dizi **özel değeri** de tanımlar:

| Değer | Açıklama |
|-------|----------|
| `+INF` | Pozitif sonsuz |
| `-INF` | Negatif sonsuz |
| `+NaN` | Sayı Değil (Not a Number) - pozitif |
| `-NaN` | Sayı Değil (Not a Number) - negatif |

Bu değerler nasıl oluşur?

```c
#include <stdio.h>

int main() {
    float pos_inf =  1.0f / 0.0f;  // +INF
    float neg_inf = -1.0f / 0.0f;  // -INF
    float nan_val =  0.0f / 0.0f;  // NaN
    float sqrt_neg = sqrtf(-1.0f); // NaN

    printf("1/0   = %f\n", pos_inf);  // inf
    printf("-1/0  = %f\n", neg_inf);  // -inf
    printf("0/0   = %f\n", nan_val);  // -nan veya nan
    return 0;
}
```

### NaN Yayılımı (NaN Propagation)

NaN değerinin en sinsi özelliği, **bulaşıcı** olmasıdır. NaN içeren herhangi bir aritmetik işlemin sonucu da NaN olur:

```c
float a = 0.0f / 0.0f;  // NaN
float b = a + 5.0f;     // NaN
float c = a * 0.0f;     // NaN (sıfırla çarpmak bile kurtarmaz!)
float d = a - a;        // NaN

printf("%f %f %f %f\n", b, c, d); // nan nan nan nan
```

Bu durum, hesaplama zincirinin herhangi bir noktasında oluşan bir NaN'ın tüm sonuçları sessizce bozmasına yol açar. Hata mesajı yoktur, program çökmez; sadece anlamsız çıktılar üretilir.

### NaN Karşılaştırmaları

NaN, kendisi dahil hiçbir değere eşit değildir:

```c
float nan_val = 0.0f / 0.0f;

printf("%d\n", nan_val == nan_val);  // 0 (FALSE!)
printf("%d\n", nan_val != nan_val);  // 1 (TRUE)
printf("%d\n", nan_val < 1.0f);     // 0 (FALSE)
printf("%d\n", nan_val > 1.0f);     // 0 (FALSE)
```

NaN kontrolü için `isnan()` fonksiyonu kullanılmalıdır:

```c
#include <math.h>

if (isnan(deger)) {
    // NaN durumunu ele al
}
```

---

## Hassasiyet Kaybı: 0.1 + 1M - 1M ≠ 0.1

Onluk sistemde tam olarak ifade edilen birçok sayı, ikili (binary) kayan nokta sisteminde **sonsuz kesirli bir seriye** dönüşür. `0.1` bunların en bilinen örneğidir.

```c
#include <stdio.h>

int main() {
    float  f = 0.1f + 1000000.0f - 1000000.0f;
    double d = 0.1  + 1000000.0  - 1000000.0;

    printf("float:  %.10f\n", f);  // 0.1015625000 (YANLIŞ!)
    printf("double: %.10f\n", d);  // 0.1000000134 (hâlâ hatalı)
    printf("beklenen: 0.1000000000\n");
    return 0;
}
```

Büyük bir sayıyla toplama yapıldığında, küçük sayının hassas bitleri kaybolur. Büyük sayı çıkarıldığında kayıp geri döndürülemez.

Bu tür **katastrofik iptal (catastrophic cancellation)** hataları, finansal hesaplamalarda ve bilimsel simülasyonlarda ciddi sonuçlar doğurabilir.

---

## Döngü Sayacı Olarak Float Kullanmak

[SEI CERT C Coding Standard](https://wiki.sei.cmu.edu/confluence/display/c/FLP30-C.+Do+not+use+floating-point+variables+as+loop+counters), kayan nokta değişkenlerini döngü sayacı olarak kullanmayı **açıkça yasaklar**.

```c
// YANLIŞ - Kayan nokta döngü sayacı
for (float f = 0.1f; f != 1.0f; f += 0.1f) {
    // Bu döngü hiç bitmeyebilir ya da beklenenden
    // farklı sayıda çalışabilir!
    printf("%.10f\n", f);
}
```

`0.1` ikili sistemde tam temsil edilemediğinden, toplanan hata birikir ve döngü `1.0f` değerine hiç ulaşamayabilir veya atlar. Döngü sayacı olarak her zaman tamsayı kullanın:

```c
// DOĞRU
for (int i = 1; i <= 10; i++) {
    float f = i * 0.1f;
    printf("%.10f\n", f);
}
```

---

## Kayan Nokta Karşılaştırması: Eşitlik Kontrolü

İki kayan nokta sayısını `==` ile karşılaştırmak neredeyse her zaman yanlıştır:

```c
float a = 0.1f + 0.2f;
float b = 0.3f;

if (a == b) {
    printf("Eşit\n");       // Bu satır hiç çalışmayabilir!
} else {
    printf("Eşit değil\n"); // Büyük ihtimalle bu çalışır
}
```

Bunun yerine **epsilon (delta) karşılaştırması** yapılmalıdır:

```c
#include <math.h>
#include <float.h>

int float_esit(float a, float b) {
    return fabsf(a - b) < FLT_EPSILON;
}

int double_esit(double a, double b) {
    return fabs(a - b) < DBL_EPSILON;
}
```

Ancak sabit bir epsilon her durumda işe yaramaz. Sayıların büyüklüğüne göre **göreli (relative) epsilon** kullanmak daha sağlamlıdır:

```c
int goreli_esit(double a, double b, double epsilon) {
    double fark = fabs(a - b);
    double buyuk = fmax(fabs(a), fabs(b));
    if (buyuk < DBL_MIN) return fark < epsilon; // Her ikisi de sıfıra yakın
    return (fark / buyuk) < epsilon;
}
```

---

## Sonsuz Döngü Tuzağı: While ile Açı Normalizasyonu

Bir açıyı `[0°, 360°)` aralığına çekmek için sık yazılan kod şöyle görünür:

```c
// YANLIŞ - Sonsuz döngüye girebilir!
float normalize_aci(float aci) {
    while (aci >= 360.0f) {
        aci -= 360.0f;
    }
    while (aci < 0.0f) {
        aci += 360.0f;
    }
    return aci;
}
```

Bu kod küçük sayılar için doğru çalışır. Ancak `aci` değeri çok büyükse **hiç bitmez.**

### Neden?

`float` türü 32 bittir ve yaklaşık **7 anlamlı ondalık basamak** tutabilir. Büyük sayılarda hassasiyet o kadar kabalaşır ki, `360.0f` çıkarmak sonucu hiç değiştirmez — sayı kendi kendine eşit kalır.

```c
#include <stdio.h>

int main() {
    float buyuk = 1e10f;  // 10,000,000,000

    float sonuc = buyuk - 360.0f;

    if (sonuc == buyuk) {
        printf("360.0f cikarmak hic etki yapmadi!\n");
        // Bu satır çalışır: 1e10f - 360.0f == 1e10f
    }
    return 0;
}
```

`1e10f` sayısının ULP'si (Unit in the Last Place — son basamağın değeri) yaklaşık **1024.0f**'dir. Yani `float` bu büyüklükte iki komşu sayı arasındaki fark 1024'tür. `360 < 1024` olduğundan çıkarma işlemi **yuvarlama hatası yüzünden tamamen kaybolur** ve `aci` bir sonraki iterasyonda hâlâ `>= 360.0f` olur.

```
1e10f  →  1e10f - 360.0f  →  yuvarlama  →  1e10f   (değişmedi)
1e10f  →  1e10f - 360.0f  →  yuvarlama  →  1e10f   (değişmedi)
...  (sonsuz döngü)
```

### Çözüm: `fmodf` Kullan

Standart kütüphanenin `fmodf` fonksiyonu bu işi tek adımda ve güvenle yapar:

```c
#include <math.h>

float normalize_aci(float aci) {
    aci = fmodf(aci, 360.0f);   // Kalanı al: [-360, 360) aralığına çeker
    if (aci < 0.0f) {
        aci += 360.0f;           // Negatifi pozitife çevir
    }
    return aci;
}
```

```c
int main() {
    printf("%.2f\n", normalize_aci(1e10f));   // 0.00  (doğru)
    printf("%.2f\n", normalize_aci(450.0f));  // 90.00 (doğru)
    printf("%.2f\n", normalize_aci(-90.0f));  // 270.00 (doğru)
    printf("%.2f\n", normalize_aci(720.5f));  // 0.50  (doğru)
    return 0;
}
```

`fmodf`, bölme işlemini doğrudan gerçekleştirdiğinden büyük sayılarda da çalışır ve döngü gerektirmez. Aynı prensip `double` için `fmod`, tam sayıya yakın değerler için `remainder` fonksiyonlarına da uygulanır.

### Özet Karşılaştırma

| Yöntem | `aci = 45.0f` | `aci = 1e10f` |
|--------|--------------|---------------|
| `while` döngüsü | Doğru | **Sonsuz döngü** |
| `fmodf` | Doğru | Doğru |

---

## Performans: Float vs Double

Kayan nokta işlemleri, özellikle eski veya gömülü sistemlerde, tamsayı işlemlerine kıyasla **çok daha yavaş** çalışabilir. Yazılım tabanlı kayan nokta birimi (soft-float) kullanan sistemlerde (bazı mikrodenetleyiciler) bir `double` çarpması onlarca döngü sürebilir.

Modern masaüstü işlemcilerde FPU donanımı bu farkı büyük ölçüde kapatmış olsa da şunlara dikkat etmek gerekir:

- **Denormalize sayılar (subnormals):** FPU'nun donanım hızlandırmasından yararlanamaz; sıradan sayılara kıyasla onlarca kat daha yavaş işlenebilir.
- **Vektörleştirme engelleyici karşılaştırmalar:** NaN kontrolü gerektiren kodlar SIMD optimizasyonunu zorlaştırır.

---

## Özet

| Tuzak | Öneri |
|-------|-------|
| NaN yayılımı | `isnan()` ile kontrol et |
| Hassasiyet kaybı | Büyük ve küçük sayıları doğrudan toplamaktan kaçın |
| Float döngü sayacı | Tamsayı sayaç kullan |
| `==` ile karşılaştırma | Epsilon tabanlı karşılaştırma kullan |
| Denormalize sayılar | Performans kritik kodlarda `FTZ`/`DAZ` bayraklarını değerlendir |
| `while` ile açı normalizasyonu | `fmodf` / `fmod` kullan |

Kayan nokta matematiği güçlü bir araçtır; ancak bu araçın sınırlarını bilmek, güvenilir ve doğru yazılımlar geliştirmenin temel koşuludur.

---

**Kaynaklar:**
- [SEI CERT C: FLP30-C](https://wiki.sei.cmu.edu/confluence/display/c/FLP30-C.+Do+not+use+floating-point+variables+as+loop+counters)
- [Microsoft: Why Floating-Point Numbers May Lose Precision](https://learn.microsoft.com/en-us/cpp/build/why-floating-point-numbers-may-lose-precision?view=msvc-170)
- [What Every Computer Scientist Should Know About Floating-Point Arithmetic](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html)

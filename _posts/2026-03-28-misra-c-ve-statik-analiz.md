---
title: "MISRA C ve Statik Analiz: Güvenlik Kritik Yazılımda Hataları Daha Kod Yazılırken Yakalamak"
background: "/img/posts/7.jpg"
date: '2026-03-28 10:00:00'
layout: post
lang: tr
---

Bir önceki yazımda kayan nokta sayılarının sessizce nasıl hatalara yol açabildiğinden bahsetmiştim. O yazıdaki tuzakların ortak noktası şuydu: **derleyici hiçbir uyarı vermez, program çökmez, ama sonuç yanlıştır.** Peki bu tür hataları kod çalışmadan önce — hatta yazılırken — yakalamak mümkün mü?

Evet. **Statik analiz** ve **MISRA C** gibi kodlama standartları tam olarak bunu hedefler. Bu yazıda, özellikle havacılık ve savunma sanayiinde hayati öneme sahip olan bu araç ve kuralları inceleyeceğiz.

---

## Statik Analiz Nedir?

Statik analiz, kaynak kodun **çalıştırılmadan** incelenmesidir. Derleyicinin yakalayamadığı birçok potansiyel hatayı — tanımsız davranış, bellek sızıntısı, erişilemeyen kod, başlatılmamış değişken kullanımı — derleme zamanında tespit eder.

Bunu şöyle düşünebilirsiniz:

| Yöntem | Ne zaman çalışır? | Ne bulur? |
|--------|-------------------|-----------|
| Derleyici uyarıları | Derleme zamanı | Sözdizimi hataları, tip uyumsuzlukları |
| **Statik analiz** | **Derleme zamanı** | **Tanımsız davranış, mantık hataları, standart ihlalleri** |
| Birim testi | Çalışma zamanı | Fonksiyonel hatalar |
| Dinamik analiz (Valgrind vb.) | Çalışma zamanı | Bellek hataları, yarış koşulları |

Statik analiz, test yazılmadan ve program çalıştırılmadan **tüm olası yolları** inceleyebildiği için diğer yöntemlere güçlü bir tamamlayıcıdır.

---

## Neden Sadece Derleyici Uyarıları Yetmez?

`-Wall -Wextra` açık bile olsa derleyiciler birçok tehlikeli durumu yakalayamaz:

```c
#include <stdio.h>

int bolme(int a, int b) {
    return a / b;  // b == 0 ise tanımsız davranış!
}

int main() {
    int x;          // Başlatılmamış değişken
    int y = x + 1;  // Tanımsız davranış!

    int dizi[10];
    dizi[10] = 42;  // Dizi taşması!

    printf("%d\n", bolme(10, 0));
    return 0;
}
```

Bu kod birçok derleyicide **uyarısız** derlenir. Ancak bir statik analiz aracı (Cppcheck, Polyspace, PC-lint vb.) bu üç hatayı da yakalar:

```
[uninitvar] Başlatılmamış değişken 'x' kullanıldı (satır 9)
[arrayIndexOutOfBounds] Dizi erişimi sınır dışı: dizi[10] (satır 12)
[zerodiv] Sıfıra bölme riski: bolme(10, 0) (satır 14)
```

---

## MISRA C Nedir?

**MISRA C** (Motor Industry Software Reliability Association), C dilinde güvenli ve taşınabilir kod yazmak için oluşturulmuş bir kurallar setidir. Otomotiv sektöründe doğmuş olsa da bugün **havacılık (DO-178C)**, **medikal (IEC 62304)**, **demiryolu (EN 50128)** ve **nükleer** gibi güvenlik kritik tüm sektörlerde fiili standart haline gelmiştir.

### Neden C? Neden MISRA?

C dili güçlü ama tehlikelidir. Otomatik bellek yönetimi yoktur, tanımsız davranış (undefined behavior) sayısı yüzlerle ifade edilir ve derleyiciler bu durumları yakalamakla yükümlü değildir. MISRA C, bu tehlikeli bölgeleri sistematik olarak kapatmayı hedefler.

MISRA C:2012 (güncel versiyon) **175 kural** içerir ve bu kurallar üç kategoriye ayrılır:

| Kategori | Anlamı | Esneklik |
|----------|--------|----------|
| **Zorunlu (Mandatory)** | Mutlaka uyulmalı | Sapma (deviation) **izni yok** |
| **Gerekli (Required)** | Uyulmalı | Gerekçeli sapma izni var |
| **Tavsiye (Advisory)** | Uyulması önerilir | Esnek |

---

## Somut Örneklerle MISRA C Kuralları

### Kural 10.1 — Örtük tür dönüşümü yasaklanır

```c
// MISRA ihlali
int32_t a = 100;
float b = a;  // Örtük int → float dönüşümü

// MISRA uyumlu
float b = (float)a;  // Açık (explicit) dönüşüm
```

Kayan nokta yazısında gördüğümüz hassasiyet kayıplarının birçoğu tam da bu tür örtük dönüşümlerden kaynaklanır. MISRA, geliştiricinin bilinçli bir seçim yapmasını zorlar.

### Kural 14.1 — Döngüde float sayaç yasaklanır

```c
// MISRA ihlali — FLP30-C ile aynı gerekçe
for (float f = 0.1f; f < 1.0f; f += 0.1f) {
    // ...
}

// MISRA uyumlu
for (int i = 1; i < 10; i++) {
    float f = (float)i * 0.1f;
    // ...
}
```

Bu kural, kayan nokta yazısında anlattığımız sonsuz döngü ve birikim hatası sorunlarını doğrudan adresler.

### Kural 13.5 — Mantıksal operatörlerin yan etkisi olmamalı

```c
// MISRA ihlali
if (x > 0 && ++y > 5) {  // ++y yan etkidir
    // ...
}

// MISRA uyumlu
++y;
if (x > 0 && y > 5) {
    // ...
}
```

Kısa devre değerlendirmesi (short-circuit evaluation) nedeniyle `++y` çalışmayabilir — bu da gizli bir hatadır.

### Kural 17.7 — Fonksiyon dönüş değeri göz ardı edilmemeli

```c
// MISRA ihlali
fclose(fp);  // fclose hata dönebilir

// MISRA uyumlu
if (fclose(fp) != 0) {
    // Hata işleme
}
```

### Kural 21.3 — `malloc`, `free` ve dinamik bellek yasaklanır

Evet, **güvenlik kritik** yazılımda dinamik bellek tahsisi genellikle yasaktır:

```c
// MISRA ihlali
int *p = (int *)malloc(10 * sizeof(int));

// MISRA uyumlu — statik tahsis
int buffer[10];
int *p = buffer;
```

Bunun nedeni, `malloc`'un başarısız olma ihtimali, bellek parçalanması (fragmentation) ve heap taşması gibi çalışma zamanında öngörülemeyen durumlar yaratmasıdır. Uçuş kontrol yazılımında "bellek yetersiz" hatası kabul edilemez.

---

## Yaygın Statik Analiz Araçları

| Araç | Lisans | Öne Çıkan Özellik |
|------|--------|-------------------|
| **Polyspace** (MathWorks) | Ticari | Formal doğrulama, DO-178C sertifikasyon desteği |
| **PC-lint Plus** (Gimpel) | Ticari | Derinlemesine veri akışı analizi |
| **Coverity** (Synopsys) | Ticari | Büyük ölçekli projeler, CI/CD entegrasyonu |
| **Cppcheck** | Açık kaynak | Ücretsiz, kolay kurulum, iyi başlangıç noktası |
| **Clang Static Analyzer** | Açık kaynak | LLVM tabanlı, yol duyarlı analiz |
| **ECLAIR** (Bugseng) | Ticari | MISRA tam uyumluluk sertifikası |

### Cppcheck ile Hızlı Başlangıç

Açık kaynak projelerinizde bile statik analizden faydalanabilirsiniz:

```bash
# Kurulum
sudo apt install cppcheck

# Basit analiz
cppcheck --enable=all --std=c11 src/

# MISRA kontrolü (addon ile)
cppcheck --addon=misra src/

# Sonuçları XML olarak dışa aktarma (CI/CD için)
cppcheck --enable=all --xml src/ 2> rapor.xml
```

### CI/CD'ye Entegrasyon

Statik analizi sürekli entegrasyon hattına (CI/CD pipeline) eklemek, hataların ana dala (main branch) ulaşmasını engeller. Önceki yazıda bahsettiğimiz Git tabanlı iş akışlarıyla birleştirildiğinde:

```yaml
# .github/workflows/statik-analiz.yml (örnek)
name: Statik Analiz
on: [push, pull_request]
jobs:
  cppcheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: sudo apt-get install -y cppcheck
      - run: cppcheck --enable=all --error-exitcode=1 src/
```

---

## DO-178C ve Statik Analiz

Havacılık sektöründe yazılım sertifikasyonu **DO-178C** (Software Considerations in Airborne Systems and Equipment Certification) standardına göre yapılır. Bu standart, yazılımı kritiklik seviyesine göre **A'dan E'ye** beş düzeyde sınıflandırır:

| Seviye | Hasar Etkisi | Örnek |
|--------|-------------|-------|
| **A** | Katastrofik (can kaybı) | Uçuş kontrol yazılımı |
| **B** | Tehlikeli | Motor kontrol yazılımı |
| **C** | Büyük | Radar ekranı |
| **D** | Küçük | Kabin aydınlatma |
| **E** | Etkisiz | Eğlence sistemi |

Seviye A yazılımda:
- **MC/DC (Modified Condition/Decision Coverage)** düzeyinde test kapsamı gereklidir
- Kaynak kod, nesne kodu ve gereksinimler arasında **tam izlenebilirlik** zorunludur
- Statik analiz, bu hedeflere ulaşmanın en maliyet etkin yollarından biridir

DO-178C'nin ek dokümanı **DO-333 (Formal Methods Supplement)**, Polyspace gibi formal doğrulama araçlarının belirli test aktivitelerinin **yerine** kullanılmasına izin verir. Bu, doğrulama maliyetini önemli ölçüde düşürebilir.

---

## Pratikte İş Akışı

Gerçek bir güvenlik kritik projede statik analiz şu şekilde konumlanır:

```
Gereksinim → Tasarım → Kodlama → Statik Analiz → Birim Testi → Entegrasyon Testi → Sertifikasyon
                          ↑            |
                          └── Hata ────┘
                          (düzelt ve tekrar analiz et)
```

Tipik bir günlük iş akışı:

1. Geliştirici kodu yazar
2. **Yerel statik analiz** çalıştırır (IDE entegrasyonu veya komut satırı)
3. İhlalleri düzeltir
4. Commit oluşturur ve push eder
5. **CI/CD'deki statik analiz** otomatik çalışır
6. Merge request/pull request incelemesinde analiz raporu kontrol edilir

Bu döngü, hataların geliştirme sürecinin en erken aşamasında yakalanmasını sağlar. Bir hatanın maliyeti, keşfedildiği aşamaya göre **katlanarak** artar: kodlama sırasında bulunan hata birkaç dakikada düzeltilebilirken, sertifikasyon aşamasında bulunan aynı hata haftalarca gecikmeye neden olabilir.

---

## Sonuç

MISRA C ve statik analiz, güvenlik kritik yazılım geliştirmenin olmazsa olmazıdır. Ancak bu araçlar yalnızca havacılık veya otomotiv projeleriyle sınırlı değildir. Herhangi bir C/C++ projesinde:

- **Cppcheck** veya **Clang Static Analyzer** ile başlayın
- Derleyici uyarılarını `-Wall -Wextra -Werror` ile açık tutun
- CI/CD hattına statik analiz adımı ekleyin
- Kayan nokta ve bellek yönetimi gibi riskli alanları özellikle takip edin

Yazılımda "çalışıyor" ile "doğru çalışıyor" arasındaki fark büyüktür. Statik analiz, bu farkı daha ilk satırda görmenizi sağlar.

---

**Kaynaklar:**
- [MISRA C:2012 — Guidelines for the use of the C language in critical systems](https://www.misra.org.uk/)
- [SEI CERT C Coding Standard](https://wiki.sei.cmu.edu/confluence/display/c/SEI+CERT+C+Coding+Standard)
- [DO-178C — Software Considerations in Airborne Systems](https://en.wikipedia.org/wiki/DO-178C)
- [Cppcheck — Static analysis tool for C/C++](https://cppcheck.sourceforge.io/)
- [What Every Computer Scientist Should Know About Floating-Point Arithmetic](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html)

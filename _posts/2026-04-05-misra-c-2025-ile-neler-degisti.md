---
title: "MISRA C:2025 ile Neler Değişti?"
subtitle: "What Changed with MISRA C:2025?"
background: "/img/posts/7.jpg"
date: '2026-04-05 09:00:00'
layout: post
lang: tr
---

Emniyet kritik yazılım geliştirme dünyasında MISRA C kuralları, onlarca yıldır en temel referans kaynaklarından biri olma özelliğini koruyor. Otomotivden havacılığa, medikal cihazlardan demiryolu sistemlerine kadar geniş bir yelpazede kullanılan bu kılavuz, Mart 2025'te yeni bir sürümle güncellendi: **MISRA C:2025**.

Bu yazıda MISRA C:2012'den (ve 2023 düzeltme paketi olan MISRA C:2023'ten) bu yana nelerin değiştiğini, yeni eklenen kuralları, kaldırılan ve devre dışı bırakılan kuralları, kod örnekleriyle detaylı şekilde inceleyeceğiz.

---

## Kısa Bir Tarihçe

| Sürüm | Yıl | C Standardı Desteği | Kural Sayısı |
|-------|------|---------------------|--------------|
| MISRA C:1998 | 1998 | C90 | 127 |
| MISRA C:2004 | 2004 | C90 | 141 |
| MISRA C:2012 | 2013 | C90, C99 | 159 (143 kural + 16 direktif) |
| MISRA C:2023 | 2023 | C90, C99, C11/C18 | 221 |
| **MISRA C:2025** | **2025** | **C90, C99, C11/C18** | **225** |

MISRA C:2025, devrimsel bir değişiklik yerine **evrimsel bir iyileştirme** sunuyor. MISRA C:2023'ün getirdiği çoklu iş parçacığı (multithreading) ve atomik tip desteğinin üzerine, 4 yeni kural, 2 silinen kural, 1 devre dışı bırakılan kural ve 69 diğer düzenleme ile toplam **79 değişiklik** içeriyor.

---

## Yeni Kurallar

MISRA C:2025 ile birlikte 4 yeni kural eklendi. Her birini örneklerle inceleyelim.

### Kural 8.18 — Başlık Dosyalarında Belirsiz Tanımlara (Tentative Definition) İzin Verilmez

**Sınıflandırma:** Required (Zorunlu)

C dilinde, bir değişken herhangi bir ilk değer (initializer) olmadan ve `extern` anahtar kelimesi kullanılmadan tanımlanırsa, bu bir **belirsiz tanım** (tentative definition) olarak kabul edilir. Eğer bu tanım bir başlık dosyasında yer alırsa ve bu dosya birden fazla derleme biriminde (`#include` ile) dahil edilirse, bağlayıcı (linker) hataları veya beklenmeyen davranışlar ortaya çıkabilir.

```c
/* config.h - başlık dosyası */

/* Uyumsuz (Non-compliant): Belirsiz tanım */
int32_t global_counter;

/* Uyumlu (Compliant): extern bildirimi */
extern int32_t global_counter;
```

**Neden önemli?** Belirsiz tanımlar, hem tanımlama (definition) hem de bildirim (declaration) gibi davranır. Birden fazla `.c` dosyası aynı başlık dosyasını dahil ettiğinde, aynı değişkenin birden fazla kopyası oluşabilir:

```c
/* modul_a.c */
#include "config.h"   /* global_counter burada tanımlanır */

/* modul_b.c */
#include "config.h"   /* global_counter burada da tanımlanır! */

/* Sonuç: Bağlayıcı hatası veya tanımsız davranış */
```

Doğru yaklaşım, değişkeni yalnızca bir `.c` dosyasında tanımlamak ve başlık dosyasında `extern` ile bildirmektir:

```c
/* config.h */
extern int32_t global_counter;  /* Sadece bildirim */

/* config.c */
#include "config.h"
int32_t global_counter = 0;     /* Gerçek tanım burada */
```

---

### Kural 8.19 — Kaynak Dosyalarında Harici Bildirim Yapılmamalıdır

**Sınıflandırma:** Advisory (Tavsiye)

Bu kural, `extern` bildirimlerinin `.c` dosyaları içinde değil, yalnızca başlık dosyalarında yapılması gerektiğini belirtir. Kaynak dosya içinde yapılan `extern` bildirimleri, gizli bağımlılıklar oluşturur ve kodun bakımını zorlaştırır.

```c
/* Uyumsuz (Non-compliant): .c dosyasında extern bildirimi */
void sensor_oku(void) {
    extern int32_t kalibrasyon_degeri;  /* Gizli bağımlılık! */
    int32_t sonuc = ham_deger + kalibrasyon_degeri;
}
```

```c
/* Uyumlu (Compliant): Başlık dosyasında bildirim */

/* kalibrasyon.h */
extern int32_t kalibrasyon_degeri;

/* sensor.c */
#include "kalibrasyon.h"
void sensor_oku(void) {
    int32_t sonuc = ham_deger + kalibrasyon_degeri;
}
```

**Neden önemli?** Bir fonksiyon gövdesi içindeki `extern` bildirimi, o değişkenin nereden geldiğini gizler. Kod incelemesi sırasında bağımlılıklar kolayca gözden kaçabilir. Başlık dosyası kullanıldığında ise bağımlılık açıkça görülür ve derleyici tip uyumsuzluklarını yakalayabilir.

---

### Kural 11.11 — İşaretçiler Dolaylı Olarak NULL ile Karşılaştırılmamalıdır

**Sınıflandırma:** Advisory (Tavsiye)

C dilinde bir işaretçi, `if` koşulunda doğrudan kullanıldığında dolaylı olarak boolean'a dönüştürülür. Bu, işaretçinin `NULL` olup olmadığını kontrol eder ama **niyet belirsiz** kalır. MISRA C:2025, işaretçi karşılaştırmalarının açık (explicit) yapılmasını tavsiye eder.

```c
int32_t *ptr = fonksiyon_cagir();

/* Uyumsuz (Non-compliant): Dolaylı karşılaştırma */
if (ptr) {
    /* ... */
}

/* Uyumsuz (Non-compliant): Dolaylı karşılaştırma */
if (!ptr) {
    /* ... */
}

/* Uyumsuz (Non-compliant): Dolaylı tür dönüşümü */
bool gecerli = (bool)ptr;

/* Uyumlu (Compliant): Açık karşılaştırma */
if (ptr != NULL) {
    /* ... */
}

/* Uyumlu (Compliant): Açık karşılaştırma */
if (ptr == NULL) {
    /* ... */
}
```

**Neden önemli?** Açık karşılaştırma, kodun **niyetini** belgeliyor. `if (ptr)` yazdığınızda okuyucu, bunun bir boolean değer mi yoksa NULL kontrolü mü olduğunu anlamak için bağlamı incelemeye zorlanır. `if (ptr != NULL)` ise amacı doğrudan ifade eder. Bu kural, MISRA'nın **temel tip modeli** (essential type model) ile de uyumludur: işaretçiler boolean değildir.

---

### Kural 19.3 — Bir Union Elemanı, Daha Önce Ayarlanmadıysa Okunamaz

**Sınıflandırma:** Required (Zorunlu)

Union'lar C dilinde bellekte aynı alanı paylaşan farklı türleri temsil eder. Bir eleman üzerinden yazıp farklı bir eleman üzerinden okumak **tanımsız davranışa** (undefined behavior) yol açabilir, çünkü bellek düzeni platforma bağlıdır.

```c
union veri {
    int32_t tamsayi;
    float   ondalik;
};

union veri d;

/* Uyumlu (Compliant): Yazılan eleman okunuyor */
d.tamsayi = 42;
int32_t x = d.tamsayi;      /* OK: Aynı eleman */

/* Uyumsuz (Non-compliant): Farklı eleman okunuyor */
d.tamsayi = 42;
float y = d.ondalik;         /* Tanımsız davranış! */
```

Bu tür bir kullanım, özellikle **type punning** (tür hilesi) olarak bilinen teknikte karşımıza çıkar:

```c
/* Tehlikeli: IEEE 754 bitlerini okuma girişimi */
union {
    float   f;
    uint32_t u;
} pun;

pun.f = 3.14f;
uint32_t bits = pun.u;  /* Uyumsuz: Tanımsız davranış */

/* Güvenli alternatif: memcpy kullanımı */
float f = 3.14f;
uint32_t bits_guvenli;
memcpy(&bits_guvenli, &f, sizeof(bits_guvenli));
```

**Neden önemli?** Union üzerinden type punning, platformdan platforma farklı sonuçlar üretebilir (endianness, hizalama, padding). `memcpy` kullanımı hem taşınabilir hem de derleyici optimizasyonları açısından güvenlidir.

---

## Silinen Kurallar

MISRA C:2025 ile birlikte **2 kural silinmiştir**. Silinen kural numaraları gelecekte yeniden kullanılmayacaktır; bu, eski sürümlerle karışıklığı önlemek için alınmış bilinçli bir karardır.

Silinen kurallardan biri **Kural 21.2**'dir. Bu kuralın kapsadığı konular artık diğer kurallar tarafından karşılanmaktadır.

---

## Devre Dışı Bırakılan Kural: 15.5 — Tek Çıkış Noktası

MISRA C:2025'in belki de en dikkat çekici değişikliği, uzun süredir tartışmalı olan **Kural 15.5**'in (tek çıkış noktası — single point of exit) **devre dışı bırakılmasıdır** (disapplied).

Bu kural, bir fonksiyonun yalnızca tek bir `return` ifadesi içermesi gerektiğini zorunlu kılıyordu:

```c
/* Eski yaklaşım: Tek çıkış noktası (Kural 15.5'e uyumlu) */
int32_t bul(const int32_t *dizi, size_t boyut, int32_t hedef) {
    int32_t sonuc = -1;

    for (size_t i = 0u; i < boyut; i++) {
        if (dizi[i] == hedef) {
            sonuc = (int32_t)i;
            break;
        }
    }

    return sonuc;  /* Tek çıkış noktası */
}
```

```c
/* Yeni yaklaşım: Erken dönüş artık kabul edilebilir */
int32_t bul(const int32_t *dizi, size_t boyut, int32_t hedef) {
    for (size_t i = 0u; i < boyut; i++) {
        if (dizi[i] == hedef) {
            return (int32_t)i;  /* Erken dönüş */
        }
    }

    return -1;
}
```

**Neden devre dışı bırakıldı?** Modern yazılım geliştirme pratiğinde, erken dönüşlerin kodun okunabilirliğini ve bakımını kolaylaştırdığı yaygın olarak kabul görmektedir. Tek çıkış noktası kuralı, özellikle hata kontrolü gereken fonksiyonlarda gereksiz iç içe geçmelere ve karmaşık kontrol akışlarına neden oluyordu:

```c
/* Tek çıkış noktası ile karmaşık hata kontrolü */
int32_t dosya_isle(const char *yol) {
    int32_t sonuc = HATA_BILINMEYEN;
    FILE *fp = fopen(yol, "r");

    if (fp != NULL) {
        char *tampon = malloc(TAMPON_BOYUT);
        if (tampon != NULL) {
            if (fread(tampon, 1, TAMPON_BOYUT, fp) > 0u) {
                sonuc = veriyi_isle(tampon);
            } else {
                sonuc = HATA_OKUMA;
            }
            free(tampon);
        } else {
            sonuc = HATA_BELLEK;
        }
        fclose(fp);
    } else {
        sonuc = HATA_DOSYA;
    }

    return sonuc;  /* Derin iç içe geçme! */
}
```

```c
/* Erken dönüş ile aynı fonksiyon — çok daha okunabilir */
int32_t dosya_isle(const char *yol) {
    FILE *fp = fopen(yol, "r");
    if (fp == NULL) {
        return HATA_DOSYA;
    }

    char *tampon = malloc(TAMPON_BOYUT);
    if (tampon == NULL) {
        fclose(fp);
        return HATA_BELLEK;
    }

    int32_t sonuc;
    if (fread(tampon, 1, TAMPON_BOYUT, fp) > 0u) {
        sonuc = veriyi_isle(tampon);
    } else {
        sonuc = HATA_OKUMA;
    }

    free(tampon);
    fclose(fp);
    return sonuc;
}
```

> **Dikkat:** IEC 61508 ve ISO 26262 gibi fonksiyonel güvenlik standartları hâlâ tek çıkış noktası yaklaşımını talep edebilir. MISRA C:2025, bu kuralı silmek yerine **devre dışı bırakarak**, ihtiyaç halinde yeniden etkinleştirilebilir kılmıştır.

---

## Mevcut Kurallardaki Önemli Güncellemeler

### İşaretçi Dönüşüm Kuralları: 11.3, 11.4, 11.6

Bu kurallar, `intptr_t` ve `uintptr_t` türlerini hesaba alacak şekilde güncellendi. Artık tamsayılar ile adreslerin tamsayı temsili arasında daha fazla dönüşüm imkanı sunuluyor:

```c
#include <stdint.h>

void *ptr = get_address();

/* MISRA C:2012'de sorunlu olabilirdi */
uintptr_t addr = (uintptr_t)ptr;

/* İşlem yap (örn: hizalama kontrolü) */
if ((addr & 0x3u) != 0u) {
    /* Hizalanmamış adres */
}

/* MISRA C:2025'te intptr_t ailesi ile dönüşüm açıkça destekleniyor */
ptr = (void *)addr;
```

Bu değişiklik özellikle düşük seviyeli sistem programlama, **işaretçi etiketleme** (pointer tagging) ve donanım kayıt adresleriyle çalışma gibi senaryolarda önemlidir.

### Direktif 4.6 — Kayan Nokta Türleri Kapsam Dışı

Direktif 4.6, daha önce uygulama tanımlı (implementation-defined) davranışa sahip temel türlerin yerine boyut belirten türlerin (`int32_t`, `uint16_t` vb.) kullanılmasını öneriyordu. MISRA C:2025'te **kayan nokta türleri bu direktifin kapsamından çıkarılmıştır**. Bunun nedeni, `float` ve `double` türlerinin IEEE 754 ile zaten standartlaştırılmış olması ve boyut belirten kayan nokta alternatiflerinin yaygın olmamasıdır.

### Switch-Case Yapısında Esneklik

MISRA C:2025'te switch-case yapılarındaki kural güncellemeleriyle, bir case bloğu artık yalnızca `break` ile değil, `return`, `continue` veya `abort()` gibi ifadelerle de sonlandırılabilir. Bu, daha önce erişilemez kod (unreachable code) uyarılarına neden olan gereksiz `break` ifadelerini ortadan kaldırır:

```c
/* MISRA C:2012: break zorunlu, return sonrası break gereksiz */
switch (komut) {
    case KOMUT_OKU:
        return veri_oku();
        break;           /* Erişilemez kod uyarısı! */
    case KOMUT_YAZ:
        veri_yaz();
        break;
    default:
        abort();
        break;           /* Erişilemez kod uyarısı! */
}

/* MISRA C:2025: return ve abort() yeterli */
switch (komut) {
    case KOMUT_OKU:
        return veri_oku();   /* break gerekmez */
    case KOMUT_YAZ:
        veri_yaz();
        break;
    default:
        abort();             /* break gerekmez */
}
```

---

## Yapısal Değişiklikler

MISRA C:2025, kural organizasyonunda da önemli yenilikler getirdi:

| Değişiklik Türü | Sayı |
|------------------|------|
| Yeni kural | 4 |
| Yeniden numaralandırılan kural | 3 |
| Silinen kural | 2 |
| Devre dışı bırakılan kural | 1 |
| Normatif/teknik güncelleme | 12 |
| Bilgilendirici/editöryal güncelleme | 57 |
| **Toplam değişiklik** | **79** |

Dikkat çeken yapısal yenilikler:

- **"Silindi" ve "Devre dışı" kategorileri** ilk kez tanımlandı. Bu, eski kural numaralarının yeniden kullanılmasını engelliyor ve sürümler arası geçişi kolaylaştırıyor.
- **Bazı kurallar direktife, bazı direktifler kurala dönüştürüldü** — daha doğru sınıflandırma için.
- **3 kural** daha uygun bölümlere taşındı.
- **Sürekli yayın modeli** (rolling release) benimsendi. Artık bağımsız düzeltme paketleri (amendment) yerine, güncellemeler doğrudan yeni sürüm numaralarıyla yayınlanacak.

---

## MISRA C:2025'e Geçiş Stratejisi

Halihazırda MISRA C:2012 veya MISRA C:2023 kullanan projeler için geçiş nispeten kolaydır:

1. **Statik analiz araçlarınızı güncelleyin.** Perforce QAC, LDRA, Parasoft, Polyspace gibi büyük araç sağlayıcıları MISRA C:2025 desteğini eklemeye başlamıştır.

2. **Yeni kuralları değerlendirin.** Özellikle Kural 8.18 ve 19.3 (Required) zorunlu olduğundan, mevcut kodunuzda ihlal olup olmadığını kontrol edin.

3. **Kural 15.5 politikanızı gözden geçirin.** MISRA artık tek çıkış noktası gerektirmese de, projenizin bağlı olduğu fonksiyonel güvenlik standardı (IEC 61508, ISO 26262, DO-178C) bunu gerektiriyor olabilir.

4. **`intptr_t` kullanımınızı gözden geçirin.** Kural 11.3, 11.4 ve 11.6'daki değişiklikler, düşük seviyeli donanım erişimi olan kodlarda daha fazla esneklik sağlayabilir.

5. **Addendum 6'yı inceleyin.** MISRA C:2025 ADD6, kuralların uygulanabilirlik eşlemesini (applicability mapping) içerir.

---

## Sonuç

MISRA C:2025, köklü bir devrim değil ama önemli bir evrim. Yeni kurallar gerçek dünya sorunlarını hedefliyor: başlık dosyalarındaki belirsiz tanımlar, gizli `extern` bağımlılıkları, dolaylı NULL karşılaştırmaları ve union'ların güvensiz kullanımı.

Belki de en önemlisi, **tek çıkış noktası kuralının devre dışı bırakılması**, MISRA'nın modern yazılım geliştirme pratiklerine uyum sağlama iradesini gösteriyor.

C dili, emniyet kritik sistemlerde hâlâ baskın konumda ve MISRA C bu dilde güvenli kod yazmak için en kapsamlı kılavuz olmaya devam ediyor. MISRA C:2025 ile birlikte gelen C23/C24 desteği hazırlığı da, bu kılavuzun geleceğe dönük yol haritasının net olduğunu gösteriyor.

---

*Kaynaklar:*
- *MISRA C:2025, Motor Industry Software Reliability Association, Mart 2025*
- *[Perforce — What Developers Need to Know About MISRA C:2025](https://www.perforce.com/blog/sca/misra-c-2025)*
- *[LDRA — MISRA C 2025: The whys and wherefores of what's new](https://ldra.com/ldra-blog/misra-c-2025-the-whys-and-wherefores-of-whats-new/)*
- *[Qt — MISRA C:2025: A closer look at some of the changes](https://www.qt.io/quality-assurance/blog/misra-c-2025)*

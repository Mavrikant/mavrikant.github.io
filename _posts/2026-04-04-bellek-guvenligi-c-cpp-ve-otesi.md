---
title: "Bellek Güvenliği: C/C++ Geliştiriciler İçin Varoluşsal Bir Soru"
subtitle: "CISA, Beyaz Saray ve AB ne diyor? Güvenlik açıklarının %70'inin kaynağı olan bellek hatalarını anlamak"
background: "/img/posts/7.jpg"
date: '2026-04-04 10:00:00'
layout: post
lang: tr
---

2026 yılına girerken yazılım dünyasında sessiz bir devrim yaşanıyor. ABD hükümeti, **CISA** (Siber Güvenlik ve Altyapı Güvenliği Ajansı) ve **FBI** ortaklaşa yayımladıkları raporlarda C ve C++ gibi bellek güvenli olmayan dillerin kritik altyapılarda kullanımının **ulusal güvenlik riski** oluşturduğunu açıkça ilan etti. Ocak 2026 itibarıyla yazılım üreticilerinin bir **bellek güvenliği yol haritası** yayımlamış olması bekleniyor. Avrupa tarafında ise **EU Cyber Resilience Act**'ın ilk uygulama aşaması Eylül 2026'da başlıyor.

Peki bu ne anlama geliyor? C/C++ öldü mü? Güvenlik-kritik sistemlerde ne yapmalıyız? Bu yazıda bellek güvenliği kavramını kökünden ele alacak, gerçek dünyadan örneklerle açıklayacak ve geleceğe dair pratik bir bakış sunacağız.

---

## Bellek Güvenliği Nedir?

Bellek güvenliği, bir programın yalnızca kendisine tahsis edilmiş bellek alanlarına erişmesini garanti eden özelliktir. Bellek güvenli olmayan bir dilde aşağıdaki hata sınıfları ortaya çıkabilir:

| Hata Türü | Açıklama | Tipik Sonuç |
|-----------|----------|-------------|
| **Buffer Overflow** | Dizinin sınırları dışına yazma | Kod çalıştırma saldırısı |
| **Use-After-Free** | Serbest bırakılmış belleğe erişim | Çökme veya veri bozulması |
| **Double Free** | Aynı belleğin iki kez serbest bırakılması | Heap bozulması |
| **Null Pointer Dereference** | Null işaretçi üzerinden erişim | Segmentation fault |
| **Dangling Pointer** | Geçersiz belleğe işaret eden işaretçi | Tanımsız davranış |
| **Memory Leak** | Serbest bırakılmayan bellek | Kaynak tükenmesi |

Microsoft, Google ve Apple'ın yayımladığı güvenlik raporlarına göre, tüm güvenlik açıklarının yaklaşık **%70'i** bellek güvenliği hatalarından kaynaklanıyor. Bu oran onlarca yıldır değişmiyor.

---

## C/C++'ta Bellek Hataları: Sahadan Örnekler

### 1. Buffer Overflow — Klasik Ama Hâlâ Güncel

```c
#include <string.h>
#include <stdio.h>

void giris_kontrol(const char *parola) {
    char tampon[16];
    int yetkili = 0;

    strcpy(tampon, parola);  // Tehlike! Sınır kontrolü yok

    if (yetkili) {
        printf("Erisim izni verildi!\n");
    }
}

int main() {
    // 16 bayttan uzun bir girdi, 'yetkili' değişkenini ezebilir
    giris_kontrol("AAAAAAAAAAAAAAAAAAAAAAAA");
    return 0;
}
```

`strcpy` fonksiyonu hedef tamponun boyutunu kontrol etmez. 16 bayttan uzun bir girdi, yığındaki (stack) komşu değişkenleri — bu örnekte `yetkili` bayrağını — ezebilir. Bu, tarihte sayısız saldırının temelini oluşturmuştur.

**Güvenli alternatif:**

```c
strncpy(tampon, parola, sizeof(tampon) - 1);
tampon[sizeof(tampon) - 1] = '\0';
```

### 2. Use-After-Free — Sessiz Katil

```c
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

typedef struct {
    char isim[32];
    int yetki_seviyesi;
} Kullanici;

int main() {
    Kullanici *k = (Kullanici *)malloc(sizeof(Kullanici));
    strcpy(k->isim, "Serdar");
    k->yetki_seviyesi = 1;

    free(k);  // Bellek serbest bırakıldı

    // ... başka bir malloc aynı adresi döndürebilir ...

    // Tehlike! Serbest bırakılmış belleğe erişim
    printf("Kullanici: %s (Yetki: %d)\n", k->isim, k->yetki_seviyesi);

    return 0;
}
```

`free()` çağrısından sonra işaretçi hâlâ eski adrese işaret eder. Bu bellek yeniden tahsis edilmiş olabilir ve farklı veriler içerebilir. Saldırganlar bu durumu **kontrollü veri yerleştirme** ile istismar edebilir. Bu hata sınıfı, modern tarayıcılardaki en yaygın güvenlik açığı türüdür.

### 3. Tanımsız Davranış (Undefined Behavior) — Derleyicinin Kara Deliği

```c
#include <stdio.h>
#include <limits.h>

int main() {
    int x = INT_MAX;
    x = x + 1;  // İşaretli tamsayı taşması → tanımsız davranış

    // Derleyici bu satırı tamamen kaldırabilir,
    // veya x'in her zaman pozitif olduğunu varsayabilir
    if (x > 0) {
        printf("Bu satir beklenmedik sekilde calisabilir.\n");
    }

    return 0;
}
```

C/C++ standardı tanımsız davranışta derleyiciye tam serbestlik tanır. Derleyici optimizasyonları, tanımsız davranış içeren kodu **tamamen beklenmedik şekillerde** dönüştürebilir. Bu, güvenlik-kritik sistemlerde felakete yol açabilir.

---

## Rakamlarla Bellek Güvenliği Sorunları

Gerçek dünya verileri durumun ciddiyetini ortaya koyuyor:

| Kaynak | Bulgu |
|--------|-------|
| **Microsoft** (2019) | Son 12 yılda düzeltilen CVE'lerin %70'i bellek güvenliği hatası |
| **Google Chrome** (2020) | Yüksek öncelikli güvenlik hatalarının %70'i bellek güvenliği kaynaklı |
| **Android** (2022) | Bellek güvenli dillere geçişle yeni bellek hataları %76'dan %24'e düştü |
| **NSA** (2022) | Bellek güvenli dillere geçiş önerisi yayımlandı |
| **CISA/FBI** (2024) | Kritik yazılımlarda C/C++ kullanımının sonlandırılması çağrısı |
| **CISA** (2026) | Bellek güvenliği yol haritası yayımlama son tarihi: Ocak 2026 |

---

## Bellek Güvenli Diller ve Yaklaşımlar

### Rust: Derleme Zamanında Güvenlik

Rust, **ownership** (sahiplik) sistemi ile bellek güvenliğini çalışma zamanı maliyeti olmadan sağlar:

```rust
fn main() {
    let s1 = String::from("merhaba");
    let s2 = s1;  // s1'in sahipliği s2'ye taşındı (move)

    // println!("{}", s1);  // Derleme hatası! s1 artık geçersiz
    println!("{}", s2);     // Sorunsuz çalışır
}
```

```rust
fn main() {
    let mut veri = vec![1, 2, 3];

    let referans = &veri[0];

    // veri.push(4);  // Derleme hatası! 
    // Değiştirilebilir ve değiştirilemez referanslar aynı anda var olamaz

    println!("İlk eleman: {}", referans);
}
```

Rust'ın **borrow checker** mekanizması bu kuralları **derleme zamanında** zorunlu kılar. Bu sayede:
- Buffer overflow → Derleme hatası veya çalışma zamanı panic
- Use-after-free → Derleme hatası (ownership sistemi engeller)
- Data race → Derleme hatası (borrow kuralları engeller)
- Null pointer → Derleme hatası (`Option<T>` tipi zorunlu)

### C++ Modern Yaklaşımlar

C++11 ve sonrası, bellek güvenliğini iyileştiren araçlar sunuyor:

```cpp
#include <memory>
#include <vector>
#include <span>

void modern_cpp_ornekleri() {
    // Ham işaretçi yerine akıllı işaretçiler
    auto ptr = std::make_unique<int>(42);
    // Otomatik olarak serbest bırakılır, double-free imkansız

    // Ham dizi yerine konteynerler
    std::vector<int> v = {1, 2, 3, 4, 5};
    // v.at(10);  // std::out_of_range exception fırlatır

    // C++20: std::span ile güvenli dizi görünümü
    std::span<int> s(v);
    // Boyut bilgisi taşır, sınır kontrolü yapılabilir
}
```

Ancak C++'ın güvenlik garantileri **isteğe bağlıdır**. `unsafe` blokları açıkça işaretleyen Rust'ın aksine, C++'ta güvensiz kod yazmak varsayılan davranıştır.

### Diğer Bellek Güvenli Diller

| Dil | Mekanizma | Çalışma Zamanı Maliyeti | Gömülü Uygunluk |
|-----|-----------|------------------------|------------------|
| **Rust** | Ownership + Borrow Checker | Yok (sıfır maliyet) | Yüksek |
| **Ada/SPARK** | Güçlü tip sistemi + Formal doğrulama | Düşük | Çok yüksek |
| **Go** | Garbage collector | Orta | Düşük |
| **Java** | JVM + Garbage collector | Yüksek | Çok düşük |
| **Swift** | ARC (Otomatik Referans Sayımı) | Düşük | Orta |

Gömülü ve güvenlik-kritik sistemler için gerçekçi alternatifler **Rust** ve **Ada/SPARK** ile sınırlıdır. Go ve Java gibi diller, çöp toplayıcı (garbage collector) nedeniyle gerçek zamanlı sistemlerde deterministik davranış gereksinimlerini karşılayamaz.

---

## Güvenlik-Kritik Sistemlerde Durum

Aviyonik, otomotiv ve medikal gibi güvenlik-kritik alanlarda durum daha karmaşıktır.

### DO-178C ve Bellek Güvenliği

Havacılık yazılımlarında uygulanan **DO-178C** standardı, belirli bir programlama dili zorunluluğu getirmez. Ancak:

- **DAL A** (felaket seviyesi) yazılımlarda her kod satırının doğrulanması gerekir
- Yapısal kapsam analizi (MC/DC) zorunludur
- Bellek güvenliği hataları, **DO-178C Supplement 3** (Formal Methods) kapsamında formal doğrulama ile ele alınabilir

Pratikte birçok aviyonik sistem hâlâ **MISRA C/C++** kurallarına uygun C/C++ kullanmaktadır. MISRA standartları, bellek güvenliği risklerini azaltmak için katı kurallar tanımlar:

- Dinamik bellek tahsisi yasaktır (MISRA C Rule 21.3)
- İşaretçi aritmetiği kısıtlanmıştır
- Tanımsız davranışa yol açabilecek yapılar engellenmiştir

### Statik Analiz Araçları

Bellek güvenli dillere geçiş yapılamayan projelerde, statik analiz araçları kritik bir savunma hattı oluşturur:

| Araç | Yaklaşım | Güçlü Yönü |
|------|----------|------------|
| **Coverity** | Statik analiz | Büyük kod tabanları |
| **Polyspace** | Soyut yorumlama | DO-178C sertifikasyonu |
| **ASAN/MSAN/TSAN** | Çalışma zamanı enstrümantasyon | Geliştirme aşamasında hata tespiti |
| **Valgrind** | Dinamik analiz | Bellek sızıntısı tespiti |
| **Clang-Tidy** | Linter + Statik analiz | CI/CD entegrasyonu |

Bu araçlar hataları **azaltır** ancak **ortadan kaldırmaz**. Dil seviyesinde garanti ile araç seviyesinde tespit arasındaki fark, güvenlik-kritik sistemlerde hayati önem taşır.

---

## Pratik Bir Yol Haritası

Mevcut C/C++ kod tabanını bir gecede yeniden yazmak mümkün değil. CISA'nın önerdiği kademeli yaklaşım şöyle özetlenebilir:

### Aşama 1: Envanter ve Önceliklendirme

```
Tüm kod tabanı
├── Ağ-yüzlü bileşenler ← Öncelik 1 (en yüksek risk)
├── Kriptografi modülleri ← Öncelik 2
├── Kullanıcı girdisi işleyen bileşenler ← Öncelik 3
└── İç bileşenler ← Öncelik 4
```

### Aşama 2: Mevcut Koddaki Riskleri Azaltma

1. **Derleyici korumalarını etkinleştirin:**
   ```bash
   gcc -fstack-protector-strong -D_FORTIFY_SOURCE=2 \
       -Wformat -Wformat-security -Werror=format-security \
       -fPIE -pie -Wl,-z,relro,-z,now main.c
   ```

2. **Sanitizer'ları CI/CD'ye entegre edin:**
   ```bash
   # AddressSanitizer ile derleme
   gcc -fsanitize=address -fno-omit-frame-pointer -g main.c

   # MemorySanitizer (başlatılmamış bellek okumalarını tespit eder)
   clang -fsanitize=memory -fno-omit-frame-pointer -g main.c

   # UndefinedBehaviorSanitizer
   gcc -fsanitize=undefined -g main.c
   ```

3. **MISRA uyumluluğu sağlayın** (güvenlik-kritik projeler için)

### Aşama 3: Yeni Bileşenleri Güvenli Dilde Yazma

C/C++ ile Rust arasında **FFI** (Foreign Function Interface) kullanarak kademeli geçiş mümkündür:

```rust
// Rust tarafı: güvenli sarmalayıcı
#[no_mangle]
pub extern "C" fn guvenli_tampon_kopyala(
    hedef: *mut u8,
    hedef_boyut: usize,
    kaynak: *const u8,
    kaynak_boyut: usize,
) -> i32 {
    if kaynak_boyut > hedef_boyut {
        return -1;  // Taşma engellendi
    }

    let kaynak_dilim = unsafe {
        std::slice::from_raw_parts(kaynak, kaynak_boyut)
    };
    let hedef_dilim = unsafe {
        std::slice::from_raw_parts_mut(hedef, hedef_boyut)
    };

    hedef_dilim[..kaynak_boyut].copy_from_slice(kaynak_dilim);
    0  // Başarılı
}
```

```c
// C tarafı: Rust fonksiyonunu çağırma
extern int guvenli_tampon_kopyala(
    unsigned char *hedef, size_t hedef_boyut,
    const unsigned char *kaynak, size_t kaynak_boyut
);

int main() {
    unsigned char hedef[16];
    unsigned char kaynak[] = "Merhaba Dunya!";

    int sonuc = guvenli_tampon_kopyala(
        hedef, sizeof(hedef),
        kaynak, sizeof(kaynak)
    );

    if (sonuc == 0) {
        printf("Kopyalama basarili: %s\n", hedef);
    }
    return 0;
}
```

### Aşama 4: Ölçme ve Raporlama

CISA yol haritasının temel beklentisi, organizasyonların ilerlemeyi **ölçülebilir** şekilde raporlamasıdır:

- Bellek güvenli dilde yazılmış kod oranı (%)
- Statik analiz kapsamı
- Bilinen bellek güvenliği açıklarının kapatılma süresi
- CI/CD'de sanitizer entegrasyon durumu

---

## Sonuç

Bellek güvenliği artık akademik bir tartışma değil, **düzenleyici bir gereklilik** haline geliyor. C ve C++ ölmedi — hâlâ milyarlarca satır kritik kod bu dillerde çalışıyor ve bu kodun büyük bölümü onlarca yıl daha aktif olacak. Ancak yeni projelerde ve yüksek riskli bileşenlerde bellek güvenli alternatiflere yönelmek, artık bir tercih değil zorunluluk.

Güvenlik-kritik alanda çalışan mühendisler olarak bizim görevimiz:

1. **Mevcut C/C++ kodunu** statik analiz, sanitizer ve MISRA kurallarıyla güçlendirmek
2. **Yeni bileşenleri** mümkün olduğunca bellek güvenli dillerde yazmak
3. **Ekip yetkinliğini** Rust veya Ada/SPARK gibi dillerde geliştirmek
4. **Düzenleyici gereklilikleri** (CISA yol haritası, EU CRA) takip etmek ve uyum sağlamak

Bellekle dans etmeye devam edeceğiz — ama artık daha iyi koruma ekipmanlarıyla.

---

**Kaynaklar:**

- [CISA — Memory Safe Languages: Reducing Vulnerabilities](https://www.cisa.gov/resources-tools/resources/memory-safe-languages-reducing-vulnerabilities-modern-software-development)
- [CISA/FBI — Product Security Bad Practices (2024)](https://www.cisa.gov/resources-tools/resources/product-security-bad-practices)
- [The White House — Back to the Building Blocks (2024)](https://www.whitehouse.gov/oncd/briefing-room/2024/02/26/press-release-technical-report/)
- [NSA — Software Memory Safety (2022)](https://media.defense.gov/2022/Nov/10/2003112742/-1/-1/0/CSI_SOFTWARE_MEMORY_SAFETY.PDF)
- [Google — Memory Safety in Android (2024)](https://security.googleblog.com/2024/09/eliminating-memory-safety-vulnerabilities-Android.html)
- [KDAB — Memory-Safety Roadmap for CISA Compliance](https://www.kdab.com/software-technologies/rust/memory-safety-roadmap-for-secure-programming/)
- [EU Cyber Resilience Act](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act)

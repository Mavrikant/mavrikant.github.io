---
title: "C++ ve Bellek Güvenliği: 2026'da Neredeyiz?"
subtitle: "C++ and Memory Safety: Where Are We in 2026?"
background: "/img/posts/5.jpg"
date: '2026-04-10 09:00:00'
layout: post
lang: tr
---

C ve C++ dilleri, yarım asrı aşkın süredir sistem programlamanın bel kemiğini oluşturuyor. İşletim sistemlerinden gömülü yazılımlara, oyun motorlarından aviyonik sistemlere kadar performansın kritik olduğu her yerde bu diller karşımıza çıkıyor. Ancak son birkaç yılda, bu dillerin en temel özelliklerinden biri olan **manuel bellek yönetimi**, ciddi bir tartışmanın merkezine oturdu.

2026'nın ilk çeyreğinde üç önemli gelişme neredeyse eş zamanlı yaşandı: ABD federal kurumlarının bellek güvenliği yol haritası son tarihi geldi, C++26 standardı tamamlandı ve Safe C++ önerisi reddedildi. Bu yazıda, bellek güvenliği tartışmasının nereden geldiğini, nereye gittiğini ve güvenlik-kritik yazılım geliştiricileri olarak bizleri nasıl etkilediğini inceleyeceğiz.

---

## Sorunun Boyutu: Rakamlar Ne Diyor?

Bellek güvenliği zaafiyetleri, yazılım dünyasının en eski ve en maliyetli sorunlarından biridir. Microsoft'un yıllarca süren iç araştırmaları, kritik güvenlik açıklarının **yaklaşık %70'inin** bellek güvenliği hatalarından kaynaklandığını ortaya koydu. Google'ın Chromium projesi de benzer oranlar raporladı.

Bu hataların ana kategorileri şunlardır:

| Hata Türü | Açıklama | Tipik Sonuç |
|-----------|----------|-------------|
| **Buffer overflow** | Dizinin sınırları dışına yazma | Uzaktan kod çalıştırma |
| **Use-after-free** | Serbest bırakılmış belleğe erişim | Çökme, veri bozulması |
| **Double free** | Aynı belleği iki kez serbest bırakma | Heap bozulması |
| **Null pointer dereference** | Null göstericinin kullanılması | Çökme |
| **Uninitialized read** | Başlatılmamış değişkenin okunması | Öngörülemeyen davranış |

C ve C++ dillerinde bu hataların tümü **tanımsız davranışa** (undefined behavior) yol açar. Derleyici, bu durumların asla gerçekleşmeyeceğini varsayar ve optimizasyonlarını buna göre yapar. Sonuç: hata sessizce oluşur, testte yakalanmayabilir ve üretimde felaket senaryolarına neden olabilir.

```c
// Klasik bir buffer overflow örneği
void parse_input(const char *input) {
    char buffer[64];
    strcpy(buffer, input);  // input 64 byte'tan uzunsa?
    // Saldırgan, dönüş adresini değiştirip
    // kendi kodunu çalıştırabilir
}
```

---

## ABD Hükümetinin Son Hamlesi: "2026'ya Kadar Yol Haritanızı Çıkarın"

Kasım 2024'te ABD Siber Güvenlik ve Altyapı Güvenliği Ajansı (CISA) ve FBI ortak bir rapor yayımladı: **"Product Security Bad Practices"**. Bu rapor, bellek güvenliği olmayan dillerin (başta C ve C++) kullanımını açıkça bir **"kötü pratik"** olarak nitelendirdi.

Raporun en dikkat çekici maddeleri:

- Yazılım üreticileri, **1 Ocak 2026'ya** kadar bellek güvenliği yol haritalarını yayımlamalıdır
- Yol haritası, bellek güvenliği zaafiyetlerinin nasıl azaltılacağını **önceliklendirilmiş** biçimde açıklamalıdır
- Bellek güvenli dillere geçiş veya donanım düzeyinde koruma mekanizmaları önerilmektedir
- Destek sonu (end-of-support) tarihi 1 Ocak 2030'dan önce olan ürünler muaf tutulmuştur

Bu, yalnızca bir tavsiye değil; CISA, yol haritası yayımlamamayı **"ulusal güvenlik, ulusal ekonomik güvenlik ve halk sağlığı için tehlikeli"** olarak nitelendirdi.

Elbette bu, "yarın C++ yazmayı bırakın" anlamına gelmiyor. Milyarlarca satır C/C++ kodu bir gecede yeniden yazılamaz. Ancak mesaj net: **statüko artık kabul edilebilir değil**.

---

## C++ Topluluğunun Cevabı: İki Yol, Bir Kavşak

C++ standart komitesi, bellek güvenliği baskısına iki farklı yaklaşımla yanıt verdi. Bu iki yaklaşım arasındaki gerilim, 2025 yılının en hararetli tartışmalarından birini oluşturdu.

### Yol 1: Safe C++ — Rust'ın İzinde

**Sean Baxter** tarafından önerilen Safe C++, adından da anlaşılacağı gibi Rust'ın sahiplik (ownership) ve ödünç alma (borrowing) modelini C++ diline entegre etmeyi hedefliyordu. Temel fikir şuydu:

- Kodda `safe` bağlamı (context) tanımlanabilecekti
- Bu bağlam içinde derleyici, Rust benzeri ömür (lifetime) kontrollerini zorunlu kılacaktı
- Güvenli fonksiyonlar yalnızca diğer güvenli fonksiyonları çağırabilecekti
- Ham göstericiler (raw pointers) ve güvensiz işlemler `unsafe` olarak işaretlenecekti

```cpp
// Safe C++ önerisinin kavramsal gösterimi
safe void process_data(borrow<vector<int>> data) {
    // Derleyici, data'nın ömrünü (lifetime)
    // derleme zamanında doğrular
    for (auto& item : data) {
        // Güvenli erişim garantili
    }
}
```

Bu yaklaşım radikal bir dönüşüm vaat ediyordu. Ancak Eylül 2025'te Baxter, projeyi durdurduğunu açıkladı: *"Rust güvenlik modeli komitede popüler değil. Benim tarafımda yapılacak daha fazla çalışma bunu değiştirmeyecek. Profiles tartışmayı kazandı."*

Safe C++'ın reddedilme nedenleri karmaşıktır, ancak birkaç temel faktör öne çıkar:

1. **Geriye dönük uyumluluk endişesi:** Mevcut C++ kodunun büyük bölümü yeniden yazılmak zorunda kalabilirdi
2. **Dil karmaşıklığı:** C++ zaten son derece karmaşık; yeni bir ömür sistemi eklemek bu karmaşıklığı katlar
3. **Komite dinamikleri:** Farklı kullanıcı gruplarının çelişen öncelikleri, uzlaşıyı zorlaştırdı

### Yol 2: Profiles — Kademeli İyileştirme

C++ dilinin yaratıcısı **Bjarne Stroustrup** tarafından savunulan Profiles yaklaşımı, daha tutucu ama pragmatik bir yol izledi. Profiles, mevcut C++ kodunu kırmadan, derleyici bayrakları aracılığıyla belirli güvenlik kurallarını zorunlu kılan **isteğe bağlı güvenlik katmanlarıdır**.

Profiles'ın hedeflediği üç temel alan:

- **Bounds safety (sınır güvenliği):** Dizi ve konteyner erişimlerinde sınır kontrolü
- **Type safety (tür güvenliği):** Başlatılmamış değişkenler dahil, tür sistemi ihlallerinin önlenmesi
- **Lifetime safety (ömür güvenliği):** Sarkan göstericilerin (dangling pointers) derleme zamanında tespit edilmesi

Profiles, C++26'ya yetişemedi, ancak C++29 için aktif geliştirme sürmektedir. WebKit projesinin 4 milyondan fazla satır C++ kodunu benzer bir alt küme yaklaşımıyla güçlendirmiş olması, bu stratejinin gerçekçi olduğunu gösteriyor.

---

## C++26: Gerçekte Ne Geldi?

Mart 2026'da Londra'daki ISO C++ toplantısında C++26 standardı tamamlandı. Herb Sutter'ın ifadesiyle **"C++11'den bu yana en etkileyici sürüm."** Bellek güvenliği açısından bizi ilgilendiren iki önemli yenilik var:

### 1. Erroneous Behavior: Başlatılmamış Değişkenlerin Sonu

C++26 öncesinde, başlatılmamış yerel değişkenlerin okunması **tanımsız davranış** (undefined behavior) idi. Derleyici bu durumda kelimenin tam anlamıyla her şeyi yapabilirdi.

C++26 ile birlikte bu durum **"erroneous behavior"** (hatalı davranış) olarak yeniden tanımlandı. Fark önemli: program artık belirsiz değil, **belirli ama hatalı** bir davranış sergiliyor. Derleyiciler bunu tespit edip uyarı veya hata üretebilir.

```cpp
int main() {
    int x;          // başlatılmamış
    int y = x + 1;  // C++23: Tanımsız davranış (UB)
                     // C++26: Hatalı davranış (erroneous behavior)
                     // Derleyici bunu yakalayabilir
    return y;
}
```

Bu tek başına devrimsel görünmeyebilir, ancak CISA raporundaki zaafiyetlerin önemli bir bölümünü oluşturan başlatılmamış bellek okumalarını ele alıyor.

### 2. Hardened Standard Library: Sınır Kontrollü Konteynerler

C++26'nın bellek güvenliği için belki de en somut katkısı, standart kütüphanenin **güçlendirilmiş (hardened)** modudur. Bu modda `vector`, `span`, `string` ve `string_view` gibi yaygın türler otomatik olarak sınır kontrolü uygular.

```cpp
#include <vector>

int main() {
    std::vector<int> v = {1, 2, 3};

    // C++23: Tanımsız davranış — sessizce bozuk veri okur
    // C++26 (hardened): Çalışma zamanında yakalanır ve program
    //                   kontrollü biçimde sonlandırılır
    int x = v[10];
}
```

Google'ın üretim ortamında yaptığı ölçümler etkileyici: hardened mod, **ortalama %0.3 performans maliyetiyle** 1000'den fazla hatayı önlemiş ve segfault oranlarını **%30 azaltmıştır**.

### 3. Contracts: Sözleşme Tabanlı Programlama

C++26 ile gelen `contract` mekanizması, fonksiyonlara ön koşul (precondition) ve son koşul (postcondition) tanımlama imkanı sunar. Bu, C'nin `assert` makrosunun çok daha güçlü ve standart bir versiyonudur.

```cpp
int safe_divide(int a, int b)
    pre(b != 0)             // Ön koşul: b sıfır olmamalı
    post(r: r * b == a)     // Son koşul: sonuç doğrulanır
{
    return a / b;
}

void process_buffer(int* ptr, size_t size)
    pre(ptr != nullptr)     // Null gösterici kontrolü
    pre(size > 0)           // Geçerli boyut kontrolü
{
    // ptr güvenle kullanılabilir
}
```

Contracts, özellikle güvenlik-kritik sistemlerde fonksiyonel güvenlik doğrulaması için büyük bir adım. DO-178C ve benzeri standartlarda gereksinimlerin koda bağlanması (requirements traceability) için de değerli bir araç olabilir.

---

## Rust: Odadaki Fil

Bellek güvenliği tartışmasında Rust'tan bahsetmemek imkansız. Rust'ın sahiplik modeli, bellek güvenliği hatalarını **derleme zamanında** ortadan kaldırır — çalışma zamanı maliyeti sıfırdır. Peki Rust, C/C++'ın yerini gerçekten alabilir mi?

### Rust'ın Güçlü Yanları

- **Derleme zamanı güvenlik garantisi:** Sahiplik ve ödünç alma kuralları, use-after-free ve data race hatalarını imkansız kılar
- **Sıfır maliyetli soyutlama:** Güvenlik kontrolleri çalışma zamanında ek yük oluşturmaz
- **Modern araç zinciri:** Cargo, Clippy ve Miri gibi araçlar geliştirme deneyimini iyileştirir
- **Büyük ölçekli benimseme:** Microsoft, Google, Amazon, Meta ve Linux çekirdeği Rust kullanıyor

### Güvenlik-Kritik Sistemlerde Durum

Rust'ın güvenlik-kritik sistemlerdeki durumu hızla değişiyor:

- **Ferrocene**: Rust'ın ISO 26262 (otomotiv) ve IEC 61508 sertifikalı derleyicisi, üretimde kullanılmaya başlandı
- **Embedded World 2026'da** Rust/C karma AUTOSAR geliştirme için donanım düzeyinde kod kapsama demoları sunuldu
- **MISRA C:2025'in Addendum 6'sı**, Rust ile C arasındaki etkileşim kurallarını tanımlamaya başladı

Ancak bazı önemli kısıtlamalar da var:

- **DO-178C sertifikasyonu** için henüz Rust'a özgü bir kılavuz (MISRA Rust gibi) yok
- Mevcut C/C++ kod tabanlarıyla **FFI (Foreign Function Interface)** entegrasyonu, güvenlik garantilerini kısmen zayıflatır
- **Araç nitelemesi** (tool qualification) süreçleri yeni derleyiciler için uzun ve maliyetlidir
- Gömülü sistemlerde bazı platformlar için **Rust desteği sınırlı** olabilir

---

## Güvenlik-Kritik Yazılım Geliştiricileri Ne Yapmalı?

Bu gelişmeler ışığında, özellikle havacılık, otomotiv ve medikal gibi alanlarda çalışan geliştiriciler için somut öneriler:

### Kısa Vadede (Bugün)

1. **Statik analiz araçlarını etkin kullanın.** MISRA C/C++ uyumlu araçlar (Polyspace, Helix QAC, PC-lint Plus, Cppcheck), bellek güvenliği hatalarının büyük çoğunluğunu derleme zamanında yakalar
2. **AddressSanitizer (ASan) ve MemorySanitizer (MSan)** gibi dinamik analiz araçlarını test süreçlerinize entegre edin
3. **C++26'nın hardened moduna** hazırlanın — derleyiciniz desteklemeye başladığında test ortamınızda etkinleştirin

### Orta Vadede (1-3 Yıl)

4. **Contracts kullanmaya başlayın.** C++26 derleyici desteği yaygınlaştıkça, kritik fonksiyonlara ön koşul ve son koşul eklemek güvenliği artıracaktır
5. **Yeni modüller ve bileşenler için Rust'ı değerlendirin.** Sıfırdan yazılan, izole edilebilir bileşenler Rust için ideal adaylardır
6. **MISRA C:2025 ve Addendum 6** kapsamındaki Rust-C etkileşim kurallarını takip edin

### Uzun Vadede (3+ Yıl)

7. **C++29 Profiles'ı** takip edin — mevcut C++ kod tabanlarınız için en gerçekçi güvenlik iyileştirme yolu bu olabilir
8. **Karma dil stratejisi** geliştirin: Mevcut kodu C++ ile sürdürün, yeni bileşenleri Rust ile yazın, FFI sınırlarını minimumda tutun

---

## Sonuç

2026, bellek güvenliği tartışmasında bir dönüm noktası. C++ topluluğu, Rust benzeri radikal bir dönüşüm yerine kademeli iyileştirme yolunu seçti. C++26 ile gelen hardened kütüphane ve erroneous behavior tanımları önemli adımlar, ancak tek başlarına yeterli değil.

Gerçekçi bakış açısı şu: **Ne C++ bir gecede terk edilecek, ne de Rust her sorunu çözecek.** Güvenlik-kritik yazılım dünyasında değişim yavaş ama kararlı ilerliyor. CISA'nın baskısı, C++26'nın yenilikleri ve Rust'ın olgunlaşması birlikte bir dönüşümü tetikliyor.

Bu dönüşümde kaybeden, "her zaman böyle yaptık" diyenler olacak. Kazanan ise araçlarını, dillerini ve süreçlerini sürekli sorgulayan, güvenliği tasarımın ayrılmaz bir parçası olarak gören mühendisler olacak.

Bir sonraki yazıda C++26 Contracts mekanizmasını detaylı inceleyebiliriz — güvenlik-kritik sistemlerde fonksiyonel güvenlik doğrulaması için nasıl kullanılabileceğini örneklerle görelim.

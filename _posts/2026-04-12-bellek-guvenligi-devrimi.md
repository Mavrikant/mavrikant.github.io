---
title: "Bellek Güvenliği Devrimi: C/C++ Geliştiricileri İçin Değişen Kurallar"
subtitle: "The Memory Safety Revolution: Changing Rules for C/C++ Developers"
background: "/img/posts/5.jpg"
date: '2026-04-12 09:00:00'
layout: post
lang: tr
---

2024 yılının sonunda ABD'nin siber güvenlik ajansı CISA, FBI ve NSA ortak bir bildirgede kritik altyapı yazılımlarında C ve C++ gibi bellek-güvensiz dillerin kullanımının büyük bir risk oluşturduğunu açıkladı. Bu bildirge, yazılım dünyasında ciddi tartışmalara yol açtı. Peki tehdit gerçekten bu kadar büyük mü, ve güvenlik-kritik yazılım geliştiricileri bu yeni gerçekliğe nasıl hazırlanmalı?

---

## Bellek Güvenliği Nedir?

Bellek güvenliği (memory safety), bir programın yalnızca kendisine tahsis edilmiş bellek bölgelerine erişebilmesini ve bu bölgeler üzerinde yalnızca tanımlı işlemler yapabilmesini garanti eden bir özelliktir. Bu özellikten yoksun kod, aşağıdaki hata kategorilerini barındırabilir:

| Hata Türü | Açıklama | Tipik Sonuç |
|---|---|---|
| **Buffer overflow** | Ayrılan bellek sınırı aşılarak yazma | Çökme, kod çalıştırma |
| **Use-after-free** | Serbest bırakılmış belleğe erişim | Tanımsız davranış, saldırı vektörü |
| **Null pointer dereference** | NULL göstericinin referansını alma | Çökme, güvenlik açığı |
| **Integer overflow** | Tamsayı taşması | Yanlış hesaplama, bellek bozulması |
| **Double free** | Aynı belleği iki kez serbest bırakma | Heap bozulması |
| **Dangling pointer** | Geçersiz bellek adresini tutan gösterici | Tanımsız davranış |

C ve C++, bu hataların tamamına açıktır. Dil spesifikasyonu bu hataları "tanımsız davranış" (undefined behavior) olarak sınıflandırır; derleyici bu durumda istediğini yapabilir — çoğunlukla da tam olarak beklemediğiniz şeyi yapar.

---

## Rakamlar Yalan Söylemez

Bellek güvenliği sorunlarının boyutunu anlamak için büyük teknoloji şirketlerinin verilerine bakmak yeterli:

- **Microsoft:** Son 12 yılda kapatılan CVE'lerin **%70'i** bellek güvenliği hatalarından kaynaklanmıştır.
- **Google (Chrome):** Tarayıcıdaki yüksek ve kritik önemdeki güvenlik açıklarının **%70'i** bellek güvenliği sorunlarıdır.
- **Google (Android):** 2019'da tespit edilen açıkların **%76'sı** bellek güvenliği hataları iken, bu oran Android'in Rust'a geçiş süreciyle 2024'te **%24'e düşmüştür.**
- **NSA raporu (2022):** Yaygın saldırı yöntemlerinin önemli bir bölümü bellek güvenliği açıklarından yararlanmaktadır.

Bu veriler, bellek güvenliğinin bir akademik tartışma konusu değil, gerçek dünya güvenliğini doğrudan etkileyen kritik bir mesele olduğunu ortaya koyuyor.

---

## ABD Hükümetinin Tutumu: Bir Yol Haritası Zorunluluğu

Kasım 2024'te CISA, NSA, FBI ve beş müttefik ülkenin siber güvenlik ajanslarının ortak kaleme aldığı **"Product Security Bad Practices"** belgesi, yazılım endüstrisine net bir mesaj verdi:

> *"Kritik altyapı için yazılım geliştirirken, kolaylıkla kullanılabilecek bellek-güvenli alternatifler mevcutken, C veya C++ gibi bellek-güvensiz bir dilde yeni ürün geliştirmek tehlikelidir ve ulusal güvenlik, ekonomik güvenlik ile kamu sağlığı açısından riski önemli ölçüde artırmaktadır."*

Aynı belge, **1 Ocak 2026 tarihine kadar** mevcut ürünler için bir bellek güvenliği yol haritası yayımlanmasını "güçlü bir şekilde teşvik etmektedir." Bu yol haritasının kapsaması gerekenler:

1. Kod tabanındaki bellek güvensiz bileşenlerin envanteri
2. Ağa bakan (network-facing) ve hassas işlevleri yürüten kritik bileşenlerin önceliklendirilmesi
3. Bellek güvensiz kodun kademeli olarak azaltılması için somut bir takvim
4. Ara dönem için uygulanacak azaltıcı teknikler

Bu bildirgeler yasal bağlayıcılığı olmayan tavsiye niteliğinde olsa da ABD federal kurumlarının bu yönde konumlanması, kritik altyapı sağlayıcıları ve savunma tedarikçileri üzerinde önemli bir baskı yaratmaktadır.

---

## Avrupa Birliği'nin Yaklaşımı: Siber Dayanıklılık Yasası

Atlantik'in öte yakasında ise somut yasal yükümlülükler devreye girmekte. Avrupa Birliği'nin **Siber Dayanıklılık Yasası (Cyber Resilience Act - CRA)**, "dijital unsur içeren ürünler" için sıkı güvenlik gereksinimlerini zorunlu kılıyor. Gömülü yazılım geliştiricilerini doğrudan ilgilendiren temel maddeler:

### 11 Eylül 2026 — İlk Uygulama Basamağı

Bu tarihten itibaren üreticiler, aktif olarak istismar edilen güvenlik açıklarını ve ürün güvenliğini etkileyen önemli olayları **24 saat içinde** yetkili CSIRT'e (Bilgisayar Güvenliği Olay Müdahale Ekibi) ve ENISA'ya bildirmekle yükümlü olacak.

### Aralık 2027 — Tam Uyum Zorunluluğu

Yasanın tüm hükümleri bu tarihte yürürlüğe girecek. Kapsam son derece geniş: akıllı ev aletlerinden endüstriyel IoT cihazlarına, ağ ekipmanlarından firmware içeren her türlü donanıma kadar neredeyse tüm bağlantılı ürünler CRA kapsamında.

**SBOM (Software Bill of Materials — Yazılım Malzeme Listesi) zorunluluğu**, özellikle dikkat çekici bir gereklilik. Tüm bileşenlerin, kullanılan kütüphanelerin ve bağımlılıkların belgelenmesi artık bir seçenek değil, bir zorunluluk haline geliyor.

Embedded World 2026 fuarındaki sektör temsilcilerinin ortak kanaatine göre CRA, 2026-2027 döneminin gömülü yazılım sektörünü en çok şekillendirecek düzenleyici faktörü olacak.

---

## Güvenlik-Kritik Sistemlerde Rust: Sertifikasyon Yolculuğu

Peki, bu baskıların gösterdiği alternatif bellek-güvenli diller ne durumda? Özellikle Rust, son yıllarda güvenlik-kritik topluluk içinde yoğun ilgi görüyor.

### Rust'ın Temel Güvenlik Garantileri

Rust'ın sahiplik (ownership) modeli, derleme zamanında bellek güvenliğini garanti eder:

```rust
fn main() {
    let v = vec![1, 2, 3];
    
    // Rust, v'nin sahipliğini v2'ye taşır
    let v2 = v;
    
    // Derleme hatası: 'v' artık geçerli değil
    // println!("{:?}", v);  // error[E0382]: use of moved value: `v`
    
    // v2 geçerli ve kullanılabilir
    println!("{:?}", v2);
}
```

Bu model, use-after-free ve dangling pointer gibi hataları **derleme zamanında** yakalar; runtime overhead olmaksızın.

### Sertifikasyon Durumu

Güvenlik-kritik sistemlerde kullanım için standart sertifikasyonlar kritik önem taşır:

| Alan | Standart | Rust Durumu |
|---|---|---|
| Otomotiv | ISO 26262 | **Ferrocene** (Ferrous Systems + AdaCore) — SIL nitelikli derleyici mevcut |
| Endüstriyel | IEC 61508 | Ferrocene aracılığıyla SIL 2 nitelikli |
| Havacılık | DO-178C | Mevcut değil (çalışmalar devam ediyor) |
| Medikal | IEC 62304 | Kısmi — Sınıf B projelerinde fiili kullanım var |
| Demiryolu | EN 50128 | Araştırma aşamasında |

Ocak 2026'da Rust topluluğunun güvenlik-kritik çalışma grubu, **"Güvenlik-Kritik Sistemde Rust Göndermek Ne Gerektirir?"** başlıklı kapsamlı bir değerlendirme yayımladı. Bu değerlendirme, havacılık (DO-178C) sertifikasyonu için hâlâ önemli eksikliklerin bulunduğunu ancak otomotiv ve endüstriyel alanda pratik uygulamanın artık mümkün olduğunu ortaya koyuyor.

### MISRA ve Rust

Bir önceki yazımızda MISRA C:2025'i incelemiştik. MISRA'nın bu revizyonuna eşlik eden **Addendum 6**, Rust programlama dili için MISRA C kurallarının uygulanabilirliğini değerlendiriyor. Bu belge, MISRA C kurallarından hangilerinin Rust'ta kategorik olarak geçersiz olduğunu tanımlayarak, MISRA C'ye benzer Rust'a özgü kılavuzlar için temel çalışmayı oluşturuyor.

Öte yandan Rust Foundation bünyesinde kurulan **Safety-Critical Rust Consortium**, DO-178C uyumlu bir Rust geliştirme ortamı için çalışmalarını sürdürüyor.

---

## C/C++ Geliştiricileri Ne Yapmalı?

Tüm bu gelişmeler, mevcut C/C++ kod tabanlarını ve geliştiricileri ortadan kaldırmıyor. Ancak değişim kaçınılmaz. İşte güvenlik-kritik alanda çalışan C/C++ geliştiricileri için pratik bir yol haritası:

### 1. Bellek Güvenliği Envanteri Çıkarın

Projenizin hangi bileşenlerinin bellek güvenliği açısından yüksek risk taşıdığını belirleyin:

- Ağa bakan (network-facing) kod
- Dış kaynaklı verileri işleyen kod  
- Dinamik bellek tahsisi yoğun bileşenler
- Harici kütüphane sınır arayüzleri

### 2. Mevcut C/C++ Kodu için Araçları Kullanın

Bellek güvenliği garantisi vermek için dil değiştirmek tek yol değil. Mevcut C/C++ kodu için etkili araçlar:

```bash
# AddressSanitizer — bellek hataları tespiti
gcc -fsanitize=address -g my_program.c -o my_program

# UndefinedBehaviorSanitizer — tanımsız davranış tespiti
gcc -fsanitize=undefined my_program.c -o my_program

# Valgrind — runtime bellek analizi
valgrind --leak-check=full ./my_program

# Statik analiz (clang-tidy, Coverity, Polyspace, LDRA, vb.)
clang-tidy my_program.c --checks=clang-analyzer-security.*
```

MISRA C:2025 kurallarına uymak da önemli ölçüde bellek güvenliği riskini azaltır; dinamik bellek tahsisinin kısıtlanması (Kural 21.3), gösterici aritmetiğine sınırlamalar ve sınır kontrolü gereksinimleri bu bağlamda değerlendirilebilir.

### 3. Yeni Bileşenler için Rust'ı Değerlendirin

Sıfırdan yazılan yeni bileşenler için Rust ciddi bir seçenek haline geldi. Özellikle:

- **C FFI (Foreign Function Interface):** Rust kodu, mevcut C kod tabanıyla sorunsuz birlikte çalışabilir.
- **Kritik yeni modüller:** Özellikle ağa bakan veya dış girdi işleyen yeni modüller için Rust tercih edilebilir.

```rust
// C'den çağrılabilecek güvenli Rust fonksiyonu
#[no_mangle]
pub extern "C" fn process_packet(
    buf: *const u8,
    len: usize,
) -> i32 {
    // Rust, null pointer kontrolünü zorunlu kılar
    if buf.is_null() || len == 0 {
        return -1;
    }
    
    // SAFETY: C caller, buf ve len'in geçerli olduğunu garantilemeli
    let data = unsafe { std::slice::from_raw_parts(buf, len) };
    
    // data artık güvenli Rust kodu ile işlenebilir
    process_data(data)
}

fn process_data(data: &[u8]) -> i32 {
    // Sınır kontrollü erişim — buffer overflow imkansız
    if data.len() < 4 {
        return -2;
    }
    data[0] as i32  // Güvenli, panik olmaz
}
```

### 4. SBOM Altyapısı Kurun

CRA'nın zorunlu kıldığı SBOM'a hazırlık için şimdiden adım atın:

- **SPDX** veya **CycloneDX** formatını benimseyin
- CMake, Conan veya vcpkg gibi bağımlılık yöneticileri ile entegre SBOM üretimini otomatize edin
- Güvenlik açığı tarama araçlarını (Grype, OWASP Dependency-Check) CI/CD hattına ekleyin

---

## Sonuç

Bellek güvenliği meselesi artık yalnızca teknik bir tercih sorunu değil; aynı zamanda hukuki bir uyum gerekliliği ve ulusal güvenlik boyutu olan bir mesele haline geldi. Bu değişimi birkaç cümleyle özetlemek gerekirse:

- **Kısa vadede** (2026): CISA yol haritası beklentileri ve CRA'nın raporlama yükümlülükleri devreye giriyor.
- **Orta vadede** (2027): CRA'nın tam uyum yükümlülükleri ve SBOM gereksinimleri tüm bağlantılı ürünleri kapsıyor.
- **Uzun vadede**: Güvenlik-kritik sistemlerde Rust veya benzeri bellek-güvenli dillerin kullanımı standart bir gereklilik haline gelebilir.

Ancak bu tablo C ve C++'ın "ölümü" anlamına gelmiyor. Onlarca yıllık birikim, olgunlaşmış araç ekosistemleri, sertifikalı derleyiciler ve devasa kod tabanı göz önünde bulundurulduğunda, özellikle havacılık ve savunma sektörü için C/C++ uzun yıllar kritikliğini koruyacak. Değişen şey, bu dillerin kullanımının çok daha titiz bir güvenlik anlayışıyla gerçekleşmesi gerekliliği.

Mevcut C/C++ kodunuzu MISRA C:2025 kuralları ve kapsamlı statik analizle sertleştirin, yeni bileşenler için Rust'ı ciddiye alın ve CRA uyum sürecine şimdiden başlayın. Fırtına geliyor — ama hazırlıklı geliştiriciler için bu aynı zamanda bir fırsat.

---

*Bu yazı, Embedded World 2026 bulguları, CISA/NSA/FBI'ın ortak güvenlik bildirgeleri ve Rust topluluğunun güvenlik-kritik çalışma grubunun Ocak 2026 değerlendirmesi esas alınarak hazırlanmıştır.*

---
title: Fonksiyonel ve fonksiyonel olmayan yazılım gereksinimleri
subtitle: Functional and Non-functional Requirements in Software Engineering
background: "/img/posts/8.webp"
date: '2022-07-11 15:59:34'
layout: post
lang: tr
tags: [gereksinim-muhendisligi, yazilim-muhendisligi]
---

Yazılım gereksinimleri, bir sistemin ne yapması gerektiğini ve hangi kısıtlar altında çalışacağını tanımlar. Gereksinimler genellikle iki ana başlık altında sınıflandırılır: **fonksiyonel gereksinimler** ve **fonksiyonel olmayan gereksinimler**. Fonksiyonel gereksinimler sistemin *ne yapması* gerektiğini anlatırken, fonksiyonel olmayan gereksinimler sistemin bu işi *nasıl* (ne kadar hızlı, ne kadar güvenli, ne kadar güvenilir) yapması gerektiğini belirler.

Bu ayrım her zaman keskin değildir; çoğu zaman iç içe geçerler. Örneğin "kullanıcı verileri şifrelenmelidir" şeklindeki fonksiyonel olmayan bir güvenlik gereksinimi, "sistem AES-256 ile şifreleme yapmalıdır" gibi yeni fonksiyonel gereksinimler doğurabilir. Yine de gereksinimleri bu iki grupta düşünmek hem analizi hem de testi kolaylaştırır.

<div class="mermaid">
graph LR
    R[Yazılım Gereksinimleri] --> F[Fonksiyonel Gereksinimler]
    R --> NF[Fonksiyonel Olmayan Gereksinimler]
    F --> F1[Sistemin sunduğu servisler]
    F --> F2[Girdilere verilen tepkiler]
    F --> F3[Belirli durumlardaki davranışlar]
    NF --> P[Ürün gereksinimleri]
    NF --> O[Organizasyonel gereksinimler]
    NF --> E[Dış gereksinimler]
</div>

## Fonksiyonel gereksinimler

Fonksiyonel gereksinimler; sistemin sağlaması gereken servisleri, belirli girdilere nasıl tepki vereceğini ve belirli durumlarda nasıl davranacağını tanımlayan ifadelerdir. Bazı durumlarda sistemin ne *yapmaması* gerektiğini de belirtebilirler.

Örnek olarak bir kütüphane yönetim sistemi düşünelim:

- Kullanıcı; kitap adına, yazara veya ISBN numarasına göre arama yapabilmelidir.
- Sistem, ödünç verilen her kitap için son iade tarihini otomatik olarak hesaplamalıdır.
- İade tarihi geçen kullanıcılara her gün e-posta hatırlatması gönderilmelidir.
- Yalnızca yönetici rolündeki kullanıcılar katalogdan kitap silebilmelidir.

Fonksiyonel gereksinimler yazılırken iki temel özelliğe dikkat edilmelidir:

- **Eksiksizlik (completeness):** Kullanıcının ihtiyaç duyduğu tüm servisler tanımlanmış olmalıdır.
- **Tutarlılık (consistency):** Gereksinimler birbiriyle çelişmemeli, aynı konuda farklı yerlerde birbirini tutmayan tanımlar bulunmamalıdır.

Büyük ve karmaşık sistemlerde bu iki özelliği aynı anda sağlamak pratikte çok zordur. Bunun başlıca nedeni, doğal dille yazılan gereksinimlerin çoğu zaman belirsiz olmasıdır. "Sistem uygun bir biçimde tepki vermelidir" gibi bir ifade, onu yazan ile okuyan tarafından farklı yorumlanabilir. İyi yazılmış bir fonksiyonel gereksinim, yoruma yer bırakmayacak kadar net ve test edilebilir olmalıdır.

## Fonksiyonel olmayan gereksinimler

Fonksiyonel olmayan gereksinimler, adından da anlaşılabileceği gibi uygulamanın işlevselliği ile ilgili olmayan, genel yazılım özelliklerini belirleyen ya da kısıtlayan gereksinimlerdir. Zaman kısıtlarını, geliştirme süreci üstündeki kısıtlamaları ve standartlarla dayatılan kısıtlamaları içerir. Fonksiyonel olmayan gereksinimler genellikle tek tek sistem özelliklerine değil sistemin tamamına uygulanır.

Fonksiyonel olmayan gereksinimler genellikle fonksiyonel gereksinimlere göre proje başarısında daha kritik etkiye sahiptir. Fonksiyonel olmayan bir gereksinimin karşılanmaması bütün sistemin kullanılamaz hale gelmesine, projenin iptal edilmesine neden olabilir. Örneğin DAL A seviyesindeki bir aviyonik projenin DO-178 ile alakalı güvenilirlik gereksinimlerini karşılamaması, üretilen ürünün sertifikalandırılamamasına ve hava aracında kullanılamamasına neden olur.

Fonksiyonel gereksinimleri ürün bileşenlerine kolayca bölmek mümkünken bunu fonksiyonel olmayan gereksinimlerde yapmak çok daha zordur. Fonksiyonel olmayan gereksinimlerin sağlanması iki nedenden dolayı tüm sistemi etkiliyor olabilir.

1. Sağlanması gereken fonksiyonel olmayan gereksinim tüm sistem mimarisini etkiliyor olabilir. Örneğin performans ile alakalı bir gereksinimi sağlamak için tüm sistem mimarisinde köklü değişiklikler yapılması gerekebilir.
2. Fonksiyonel olmayan gereksinimlerin sağlanması yeni fonksiyonel gereksinimler yaratılmasına neden olabilir. Örneğin sistemin güvenlik gereksinimi modüllerde kısıtlara neden olacak yeni fonksiyonel gereksinimler yaratabilir.

<div class="mermaid">
graph LR
    NF[Fonksiyonel Olmayan Gereksinimler] --> UR[Ürün Gereksinimleri]
    NF --> ORG[Organizasyonel Gereksinimler]
    NF --> DIS[Dış Gereksinimler]

    UR --> KUL[Kullanılabilirlik Gereksinimleri]
    UR --> VER[Verimlilik Gereksinimleri]
    UR --> GVB[Güvenilebilirlik Gereksinimleri]
    UR --> GUV[Güvenlik Gereksinimleri]
    UR --> TAS[Taşınabilirlik Gereksinimleri]
    UR --> BAK[Bakım Yapılabilirlik Gereksinimleri]
    UR --> BIR[Birlikte Çalışabilirlik Gereksinimleri]
    UR --> OLC[Ölçeklenebilirlik Gereksinimleri]
    KUL --> ERS[Erişilebilirlik Gereksinimleri]
    VER --> PERF[Performans Gereksinimleri]
    VER --> ALAN[Alan Gereksinimleri]
    GVB --> DAY[Dayanıklılık Gereksinimleri]
    GVB --> KUR[Kurtarılabilirlik Gereksinimleri]

    ORG --> CEV[Çevresel Gereksinimler]
    ORG --> OPR[Operasyonel Gereksinimler]
    ORG --> GEL[Geliştirme Gereksinimleri]
    GEL --> STD[Standart ve Süreç Gereksinimleri]
    GEL --> DIL[Programlama Dili Gereksinimleri]

    DIS --> DUZ[Düzenleyici Gereksinimler]
    DIS --> ETK[Etik Gereksinimler]
    DIS --> YAS[Yasal Gereksinimler]
    DIS --> MAH[Mahremiyet Gereksinimleri]
    YAS --> MUH[Muhasebe Gereksinimleri]
    YAS --> EMN[Emniyet ve Güvenlik Gereksinimleri]
    YAS --> UYM[Uyumluluk Gereksinimleri]
</div>

Bu diyagramdan da görülebileceği gibi fonksiyonel olmayan gereksinimler birçok çeşitli kaynaktan gelebilir.

1. **Ürün gereksinimleri:** Yazılımın çalışma zamanındaki gereksinimleri. Sistemin ne kadar hızlı çalışması, ihtiyaç duyacağı disk ve maksimum bellek kullanımı bu gereksinimlere örnektir.
2. **Organizasyonel gereksinimler:** Müşteri ve geliştiricinin organizasyonunda yer alan politika ve prosedürlerden kaynaklanan geniş gereksinimlerdir. Programlama dili, geliştirme ortamı, süreç standartları, yazılımın işletim ortamı gibi çevresel gereksinimler bunlara örnektir.
3. **Dış gereksinimler:** Yukarıda sayılan ilk iki gereksinim tipi dışında kalan dış kaynaklı gereksinimlerdir. Sistemin yasalara uygunluğu ve kullanıcılar tarafından kabulü için uyulması gereken etik gereksinimler dış gereksinimlere örnek olarak verilebilir.

## Fonksiyonel olmayan gereksinim örnekleri

Aşağıda bazı fonksiyonel olmayan gereksinim türleri ve onlara örnekler bulabilirsiniz.

- **Hız** — Hızlı cevap verme (responsiveness), saniyede işlenebilen işlem sayısı.
- **Büyüklük** — Depolama alanı ve bellek ihtiyacı.
- **Kullanım kolaylığı** — Yeni kullanıcının sistemi öğrenme süresi.
- **Güvenilirlik (stabilite)** — Yazılımın belirli bir zaman aralığında kesintisiz çalışabilme süresi.
- **Dayanıklılık** — Hatalara karşı nasıl tepki verdiği ve hata sonrası tekrar başlama süreci.
- **Bakım yapılabilirlik (maintainability)** — Dokümantasyon, teknik borç, temiz mimari (clean architecture).
- **Taşınabilirlik** — Hangi platformlara (işletim sistemi, işlemci) ve teknolojilere (dil, framework) bağımlı olduğu.
- **Performans** — Aynı anda kaç kullanıcıya hizmet verebildiği.
- **Verimlilik** — Yazılımın sistem kaynaklarını kullanma oranı.
- **Güvenlik** — Sistemin saldırılara karşı dayanıklılığı, kullanıcı verilerinin şifrelenmesi, kişisel verilerin korunması ve kullanıcı mahremiyetinin sağlanması.
- **Birlikte çalışabilirlik (interoperability)** — Sistemin uyumlu olduğu donanım ve etkileşimde olduğu yazılım sistemleri.

### Ölçülebilir olmalı

Fonksiyonel olmayan gereksinimler genellikle yuvarlak bir dille yazılır. Bu durum onların test ve ürün kabul süreçlerini zorlaştırır. "Sistem kullanıcı dostu olmalıdır" ya da "sistem hızlı çalışmalıdır" gibi ifadeler birer niyet beyanıdır, gereksinim değildir. Fonksiyonel olmayan gereksinimler de fonksiyonel gereksinimler gibi net bir ifadeyle yazılmalı ve test edilebilir olmalıdır. Kabul kriterleri olabildiğince nicel metriklerle tanımlanmalıdır.

Aşağıdaki tabloda bazı fonksiyonel olmayan özelliklerin nasıl ölçülebilir hale getirilebileceği gösterilmiştir.

| Özellik | Ölçü (metrik) |
|---------|----------------|
| Hız | Saniyede işlenen işlem sayısı, kullanıcı/olay yanıt süresi, ekran tazeleme süresi |
| Büyüklük | Ihtiyac duyulan minimum bellek/depolama miktarı |
| Kullanım kolaylığı | Eğitim süresi, yardım ekranı sayısı |
| Güvenilirlik | Ortalama arızasız çalışma süresi (MTTF), kullanılamama olasılığı, erişilebilirlik oranı |
| Dayanıklılık | Arıza sonrası yeniden başlama süresi, hataya yol açan olayların yüzdesi |
| Taşınabilirlik | Platforma (işletim sistemi, işlemci) baglı kodların yüzdesi, desteklenen isletim sistemi sayısı |

## Fonksiyonel ve fonksiyonel olmayan gereksinimlerin karşılaştırılması

| | Fonksiyonel gereksinimler | Fonksiyonel olmayan gereksinimler |
|---|---|---|
| Neyi tanımlar | Sistemin *ne yapması* gerektiğini | Sistemin işini *nasıl* yapması gerektiğini |
| Kapsam | Genellikle tek tek özellikler/bileşenler | Çoğunlukla sistemin tamamı |
| Örnek | "Kullanıcı ISBN'e göre arama yapabilmeli" | "Arama sonucu 1 saniye içinde dönmeli" |
| Test edilebilirlik | Görece kolay | Nicel metrik tanımlanmazsa zor |
| Karşılanmadığında | İlgili özellik çalışmaz | Tüm sistem kullanılamaz/kabul edilemez hale gelebilir |

Özetle başarılı bir yazılım, yalnızca beklenen işlevleri yerine getirmekle kalmaz; bunları kabul edilebilir hız, güvenilirlik ve güvenlik seviyelerinde yapar. Fonksiyonel ve fonksiyonel olmayan gereksinimleri en baştan birlikte, net ve ölçülebilir biçimde tanımlamak; projenin ilerleyen aşamalarında ortaya çıkacak maliyetli sürprizlerin önüne geçer.

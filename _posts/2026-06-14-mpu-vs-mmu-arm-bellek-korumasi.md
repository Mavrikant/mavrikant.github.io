---
title: "MPU vs MMU: ARM'da Donanım Tabanlı Bellek Korumasının Anatomisi"
subtitle: "MPU vs MMU on ARM — The Anatomy of Hardware-Enforced Memory Protection"
background: "/img/posts/8.webp"
date: '2026-06-14 09:00:00'
layout: post
lang: tr
tags: [arm, gomulu, do-178c, bellek-koruma]
---

Bir hata raporu var: uçuş yazılımında saatlerce çalıştıktan sonra rastgele bir görev, hiç değiştirmediği bir global değişkenin değerinin değiştiğini görüyor. Tipik şüpheli, başka bir görevin ya da kesmenin yanlış adrese yazıyor olması. Logger açıyorsunuz, izlere bakıyorsunuz, hiçbir görev o adrese yazmıyor — ama değer yine de değişiyor.

Sonra fark ediyorsunuz: değişiklik yapan görevin call stack derinliği son sürümde biraz arttı. Stack alanı taştı, hemen yanındaki `.data` bölümüne girdi ve siz farkına bile varmadan oradan ilerledi. CPU bunu *hata* olarak görmedi; yazma yetkisi olan bir adrese yazma yapıldı, donanım tarafından her şey yolunda. Birkaç saat sonra, bambaşka bir görev "yanlış" veriyi okurken yakalandı.

Cortex-A çalıştıran bir Linux süreci olsaydı bu hata `SIGSEGV` ile anında yakalanırdı; ama bare-metal bir Cortex-M veya Cortex-R üzerinde, **MPU yapılandırılmadığı sürece** CPU'nun stack ile heap arasındaki sınır hakkında en ufak fikri yoktur. Donanım tabanlı bellek koruması bir konfor değil; emniyet kritik sistemlerde DO-178C anlamında *partitioning* kanıtının fiziksel altyapısıdır. Ve bu altyapının iki farklı yüzü var: **MPU** (sayfasız) ve **MMU** (sayfalı). Bu yazıda her ikisinin de iç işleyişine, ARM'ın üç farklı kuşağındaki (PMSAv7 / PMSAv8 / VMSA) farklarına ve özellikle PMSAv7'nin geliştiricileri çıldırtan hizalama (alignment) kurallarına ineceğiz.

---

## MPU ve MMU: Ne Aynı, Ne Farklı?

Her ikisi de aynı temel soruna cevap verir: *"Bu çekirdekte koşan kod bu adrese erişmeli mi?"* Cevap "hayır" ise donanım bir fault üretir, yazılım kontrolü ele alır. Farklılık bu cevabın nasıl üretildiğindedir.

**MMU (Memory Management Unit)** sanal adresleri fiziksel adreslere çevirir. Her erişimde işlemci sanal adresi alır, bir TLB (Translation Lookaside Buffer) araması yapar, gerekirse sayfa tablosu yürür ve hem fiziksel adresi hem erişim izinlerini üretir. Bu modelin gücü ayrı süreçlerin aynı sanal adresi farklı fiziksel sayfalara map edebilmesidir — Linux, QNX, INTEGRITY-178 hep bu modeli kullanır. Bedeli ise TLB miss penalty'si, sayfa tablolarının ek belleği, context switch sırasındaki TLB invalidation maliyeti ve bellek erişim sürelerinin tahmin edilemez hale gelmesidir.

**MPU (Memory Protection Unit)** sanal-fiziksel çevirimi *yapmaz*. Adres mimarinin fiziksel adresidir; MPU yalnızca o adrese erişimin izinli olup olmadığını söyler. CPU bir fetch/load/store yaptığında, MPU bir dizi tanımlı *region* arasından adrese uyanları bulur ve geçerli izinleri uygular. Hiçbir TLB miss, hiçbir sayfa tablosu yürüyüşü yok — gecikme deterministik. Bu nedenle Cortex-R5 gibi sert gerçek zamanlı kuşaklar veya bare-metal Cortex-M kullanan emniyet kritik kodlar MMU yerine MPU tercih eder.

İki ayrım pratik sonuçlar doğurur. MMU'da bir görev kendi sanal adres uzayını başka bir görevin uzayıyla aynı sayılarla doldurabilir; MPU'da herkes aynı fiziksel adres uzayında oturur, bölümleme sadece erişim izinleriyle yapılır. MMU'da her bir 4 KB sayfaya bağımsız izin verilebilir; MPU'da region sayısı azdır (8-16) ve dolayısıyla region planlaması bir tasarım problemi olur. MMU'da en kötü durum erişim süresi TLB miss + sayfa tablosu yürüyüşü kadardır; MPU'da en kötü durum tek bir karşılaştırıcı turudur.

---

## PMSAv7: ARMv7-M / ARMv7-R'in MPU'su

Cortex-M3, Cortex-M4, Cortex-M7 ve Cortex-R5 — yani DAL A aviyonik yazılımının çok sevdiği çekirdekler — **PMSAv7** (Protected Memory System Architecture v7) MPU'sunu kullanır. Spesifikasyonu ARMv7-M Architecture Reference Manual'in Part B3'ünde tanımlıdır.

Temel veri yapısı bir *region*'dır. Her region'ın dört kritik özelliği var: **base address**, **size**, **access permissions** (privileged/unprivileged için ayrı), **memory type attributes** (TEX, C, B bitleri). PMSAv7'de toplam region sayısı çekirdeğe bağlı: M3 ve M4 için 8, M7 için 16'ya kadar, Cortex-R5 için implementasyona göre 12 veya 16.

PMSAv7'nin tasarımdaki tek en sinir bozucu kuralı şudur:

> **Bir region'ın boyutu mutlaka 2'nin kuvveti olmalı (32 bayttan 4 GB'a kadar) ve base address bu boyuta hizalı olmalıdır.**

Yani 128 KB bir region tanımlayabilirsiniz, ama tabanı 0x20018000 olamaz; 0x20000000 veya 0x20020000 gibi 128 KB sınırlarına oturmak zorundadır. Bu kural donanımı basit tutmak için var: 32 bitlik adresin yüksek bitleri region maskesi olarak doğrudan karşılaştırmaya giriyor. Ama yazılım tarafında bu kuralın bedeli ağırdır.

---

## Concrete: PMSAv7 ile 192 KB Region Nasıl Yapılır?

Pratik bir senaryo: 256 KB SRAM'in 192 KB'ı bir görevin RW-data alanı olarak ayrılacak, kalan 64 KB başka bir görev için. Naif çözüm: "192 KB region tanımlarım." Kural çiğneniyor — 192, ikinin kuvveti değil.

İki çıkış var. Birincisi 192 KB'ı iki region'a bölmek: 128 KB + 64 KB. Bunlar power-of-2 ve sıralı şekilde komşulanabilir. Maliyet: iki region slot harcanıyor, oysa MPU slotu kıt kaynak.

İkincisi PMSAv7'nin sırrı olan **Sub-Region Disable (SRD)** mekanizmasıdır. Region boyutu 256 bayt veya üstüyse, MPU o region'ı **8 eşit alt bölgeye** böler ve `MPU_RASR` kaydındaki 8-bit SRD alanı her bir sub-region'ı bireysel olarak devre dışı bırakabilir. Şimdi 256 KB region tanımlayalım, base 0x20000000:

- 256 KB / 8 = **32 KB** her sub-region
- 192 KB istemek için: alttan 6 sub-region (0..5) etkin, üstten 2 sub-region (6, 7) devre dışı
- SRD bit pattern: `0b11000000` = `0xC0`

Sonuçta tek MPU slotu ile 0x20000000–0x2002FFFF arası 192 KB'lık efektif bir koruma alanı elde edildi; üstteki 64 KB başka bir region tarafından kullanılabilir. `MPU_RASR` kaydındaki anahtar alanları (Cortex-M4):

| Alan | Bit | Değer | Anlam |
|---|---|---|---|
| SIZE | [5:1] | `0b10001` (17) | 2^(17+1) = 256 KB |
| SRD | [15:8] | `0xC0` | Üstteki iki sub-region disable |
| AP | [26:24] | `0b011` | Tam RW (priv + unpriv) |
| XN | [28] | 1 | Execute Never (veri bölgesi) |
| ENABLE | [0] | 1 | Region aktif |

Bu numara her zaman işe yaramaz: efektif boyut 32 KB'ın katı olmak zorunda ve istenmeyen sub-region'lar mutlaka uç köşelerde olmalı — ortadan bir parça çıkaramazsınız (yani 192 KB için "alttan 1, üstten 1 disable" da bir seçenektir, ama "ortadan 2 disable" geometrik olarak farklı bir bölge yaratır, RW istediğiniz blok parçalanır). Pratikte SRD bir region'ı budamak için iyi, region'ı şekillendirmek için sınırlıdır.

---

## Overlap Önceliği — Pek Çok Geliştirici Bunu Tersine Hatırlar

PMSAv7'de region'lar üst üste binebilir; bir adres birden fazla region'ın kapsamındaysa donanım hangisinin izinlerini uygular?

> **PMSAv7'de yüksek numaralı region kazanır.** (ARMv7-M ARM, B3.5.3)

Bu, "sonra tanımlanan eskisinin üstüne yazar" gibi sezgisel hissedilebilir, ama numara sırası önemlidir, programlama sırası değil. Pratikte sık görülen kullanım: Region 0 tüm flash'a privileged-read-only RX izni verir; Region 1 bir bootloader yamasını içeriği için bir alt-bloğa RWX izni verir. Region 1'in numarası daha büyük olduğundan, çakışan bölgede Region 1'in izinleri geçerli olur. Bu özelliği yanlış varsayarak Region 0'ı son sıraya koyan bir geliştirici, bootloader yamasını bilmeden read-only hâle getirir.

ARMv8-M (PMSAv8) bu davranışı tamamen değiştirir: PMSAv8'de **overlapping region'lar CONSTRAINED UNPREDICTABLE'dır** ve uyumlu implementasyonların erişimi reddedip fault üretmesi olağan davranıştır. Yani PMSAv7'den PMSAv8'e geçen kodun overlap stratejisini yeniden düşünmesi gerekir; "yüksek kazanır" mantığını sezgisel olarak portlayan kodlar PMSAv8 üzerinde tahmin edilemez şekilde patlayabilir.

---

## Concrete: MPU-Tabanlı Stack Guard

DAL A koşan görevlerin en sevilmeyen hatası, stack overflow'un sessizce komşu belleğe yazıp çok sonra patlamasıdır. MPU bu sınıfı tamamen ortadan kaldırabilir.

Fikir: her görev için stack'in en altına (büyüyüş yönünün tersine) küçük bir "guard" region koyun, ona privileged+unprivileged için **erişimsiz** (no access) izin verin. Stack overflow olduğu anda CPU bu region'a yazma yapmaya çalışır, MPU MemManage fault üretir, sistem deterministik bir noktada durur. Cortex-M4 üzerinde 32 KB stack'in tabanında 32 baytlık bir guard kuralım (Region 4 olsun, taban 0x20040000):

```c
/* RNR: Region 4 seç */
MPU->RNR = 4;
/* RBAR: base = 0x20040000, VALID=0 (RNR'den al) */
MPU->RBAR = 0x20040000UL;
/* RASR:
 *   SIZE = 4    -> 2^(4+1) = 32 byte
 *   AP   = 0b000 -> hiç erişim yok (priv + unpriv)
 *   XN   = 1    -> execute never
 *   ENABLE = 1
 */
MPU->RASR = (4U << 1)        /* SIZE */
          | (0U << 24)       /* AP = no access */
          | (1U << 28)       /* XN */
          | 1U;              /* ENABLE */
```

Stack guard'ın boyutu **32 bayt** seçildi çünkü PMSAv7'nin minimum region boyutu budur. Stack 0x20040020'den yukarı doğru büyürse, taşma anında 0x20040000–0x2004001F aralığına yazma denemesi MemManage fault'a yol açar. Stack overflow artık "saatler sonra başka yerde patlayan veri bozulumu" değil, "anında, deterministik, log'lanabilir bir hata" olur.

Hangi MemManage durumunda olduğumuzu ayırt etmek için handler'da `SCB->CFSR` kaydındaki `MMFSR.DACCVIOL` (data access violation) bitini ve `MMFAR` (Memory Management Fault Address Register) içeriğini okumak gerekir. `MMFAR`'da guard'a denk gelen bir adres varsa neden açıktır: o görevin stack'i taştı.

Bu desenin DO-178C kapsamında çok özel bir yeri var: bölümleme analizinde *"control flow stack'ten heap'e geçemez"* kanıtı isteniyorsa, MPU stack guard bu kanıtın donanım tabanlı en kuvvetli formudur. Statik analiz aracı stack derinliğine üst sınır verir; MPU bu sınırın aşılamadığını fiziksel olarak garanti eder. İkisi birlikte savunmanın iki katmanını oluşturur (`belt and suspenders`).

---

## PMSAv8: Hizalama Cehenneminden Çıkış

ARMv8-M (Cortex-M23, M33, M55) ve ARMv8-R (Cortex-R52) **PMSAv8** kullanır. Tek bir tasarım değişikliği geliştiricinin hayatını dramatik şekilde iyileştirir:

> **Region boyutu artık 2'nin kuvveti olmak zorunda değil; base ve limit ayrı kayıtlarda tutulur ve her ikisi yalnızca 32 baytın katı olmak zorundadır.**

Yani 192 KB region doğrudan tanımlanır: `RBAR = 0x20000000`, `RLAR = 0x2002FFE0`. SRD numarasına gerek yok, hizalama gymnastiği yok. 192 KB için tek bir slot harcanır, ne fazla ne eksik.

PMSAv8 bir diğer değişiklik daha getirir: bellek tip kodlaması artık `TEX`/`C`/`B` bitleri ile region'a *gömülü* değildir. Bunun yerine sekiz tip global olarak `MAIR0` ve `MAIR1` (Memory Attribute Indirection Register) kayıtlarında tanımlanır; her region sadece 3-bit bir `AttrIndx` ile hangi tipi kullandığını söyler. Bu, MMU'da kullanılan modelle uyumlu hale getirir ve mimari boyunca tek bir bellek tipi semantiği sağlar. Ama bedeli: MAIR'i unutmak sessiz bir cache attribute hatası demektir, çünkü `AttrIndx = 0` initial olarak çoğu sistemde "strongly-ordered" tanımlanır ve performans çakılır.

PMSAv7'den PMSAv8'e geçen ekipler için pratik öğüt: alignment headache'i ortadan kalkıyor diye sevinmeden önce, overlap stratejinizi gözden geçirin ve MAIR'i ilk init kodunda set edin.

---

## Cortex-A'da Tablo: MMU'nun Bedeli ve Faydası

Cortex-A serisi MMU kullanır (VMSAv7-A veya VMSAv8-A). Pratik fark zincirli:

- Her erişim önce TLB'ye gider; TLB miss durumunda donanım sayfa tablosunu yürür (page table walk). ARMv7-A Short-Descriptor format için 1 MB section veya 4 KB / 64 KB page; Long-Descriptor / LPAE için 3-4 seviyeli tablo. Worst case birkaç bellek erişimi.
- TLB sınırlıdır (örn. Cortex-A9'da 64-entry birleştirilmiş main TLB + her tarafta micro-TLB); kötü locality sürekli TLB miss üretir.
- Context switch'te ASID değişimi ve gerektiğinde TLB invalidate komutları gerekir.
- Cache-sayfa renklendirme (page coloring), TLB shootdown ve TLB throttling Linux dünyasının ekmek-su problemleri haline gelir.

Bu zinciri kabul etmenin karşılığı sanal adres uzayıdır: bir görev kendi adres uzayını tasarlayabilir, fork/exec çalışır, paylaşılan kütüphaneler aynı sanal adrese map edilebilir, position-independent code biraz nefes alır. Linux ve modern desktop sistemlerinin bu modele bağımlı olmasının nedeni budur.

Aviyonik tarafta bu liste tam tersine bir maliyettir. Sertifikasyon ekipleri WCET (Worst-Case Execution Time) için TLB miss'i hesaba katmak zorundadır; bu sayı kötüdür ve "ölçüm tabanlı" yaklaşımı zorlaştırır. Bu nedenle DAL A koşan uçuş kontrol bilgisayarları genelde Cortex-R5 (MPU'lu, MMU'suz) veya Cortex-M (PMSAv7) kullanır. Cortex-A daha çok IMA (Integrated Modular Avionics) ortamlarında, hipervizör altında, MMU'su zaten kabul edilen ortamlarda görülür.

---

## ARINC 653, DO-297 ve "Robust Partitioning"

DO-178C §2.4 ve §2.5.1 bölümleme analizini yazılım emniyeti kapsamına alır: bir partition'da yaşanan bir hata diğerine yayılmamalı (*spatial partitioning*) ve bir partition'ın aşırı kaynak kullanması diğerinin zamanını yememeli (*temporal partitioning*). Bu kavramların formel mimari çerçevesi **ARINC 653 Part 1** standardındadır ve sertifikasyon süreci **DO-297** tarafından tarif edilir.

Spatial partitioning donanım tabanlı bellek korumasıyla sağlanır: her partition'ın yalnızca kendi belleğine erişebilmesi gerekir. Cortex-A ortamında bunu MMU + ayrı sayfa tablosu yapar; Cortex-R5 / Cortex-M ortamında MPU yapar. ARINC 653'ün "robust partitioning" tanımı çok keskin: bir partition'ın kontrolündeki herhangi bir yazılım hatasının başka bir partition'a yayılması fiziksel olarak imkânsız olmalıdır. Sadece konvansiyonla değil, donanımla.

MPU'nun pratik avantajı burada da görülür: Cortex-R5 üzerinde her görev geçişinde MPU region'larını yeniden yapılandırmak, MMU sayfa tablosu değiştirmekten çok daha hızlı ve deterministiktir. ARINC 653 scheduler'ı major frame içinde minor frame'leri sırayla çalıştırırken, partition switch sırasında MPU register set'i değişir — TLB invalidate yok, kontekst değişim süresi tahmin edilebilir.

FreeRTOS-MPU bu fikrin küçük ölçekli, sertifikasyona girmeyen ama mimarisi temiz örneğidir: her kullanıcı görevi "restricted task" olarak başlatılır, kernel görev başlatırken o göreve özel MPU region setini yükler, yalnızca o göreve verilen RW veri ve RX kod bölgelerine erişim sağlar. Sistem çağrıları SVC üzerinden çekirdeğe geçişle yapılır; kernel privileged moda geçince geçici olarak background region geçerli olur.

---

## Tasarım Tavsiyeleri ve Tuzaklar

**Region bütçeniz dar, planlayın.** Cortex-M4'te 8, Cortex-M7'de 16 region var. Tipik bir dağılım: 1 flash RX, 1 SRAM RW, 1 device peripheral, 1 stack guard, 2 görev-özel veri, 2 görev-özel kod, 2 bootloader ve diğerleri. SRD'yi region'ları birleştirip slot tasarrufu için kullanın.

**Power-of-2 alignment'ı erken bir sınır olarak görün.** Linker script'inizde DAL A görev belleklerini 4 KB veya 8 KB sınırlarına hizalamak başlangıçta lükstür; ama MPU region planlaması başlayınca her bayt kazandırır. PMSAv8'e geçiş bunu yumuşatır ama PMSAv7 üzerinde lineer çalışmıyorsanız geri dönüşü pahalıdır.

**Background region'a güvenmeyin.** `MPU_CTRL.PRIVDEFENA = 1` ile privileged kod default memory map'e otomatik erişim alır; bu confort'tur, ama kernel kodunun yanlış pointer'la herhangi bir yere yazmasının kapısını açar. Yüksek emniyet sınıfında PRIVDEFENA = 0 ile kernel'i de explicit region'lara bağlamak daha güçlüdür.

**Cache + MPU tutarsızlığı sessiz bir öldürücüdür.** Cortex-M7 ve Cortex-A çekirdeklerinde MPU bellek tipini de söyler. Aynı fiziksel bellek hem cacheable hem non-cacheable iki region'la map edilirse, DMA + CPU paylaşımı sırasında cache koherans bozulur ve veri sessizce bozulur. Bir region için seçtiğiniz `TEX`/`C`/`B` (PMSAv7) veya `AttrIndx → MAIR` (PMSAv8) kombinasyonunu mimari dokümandan birebir doğrulayın.

**Stack guard'ı her görev için kurun, sadece test edilen senaryolarda değil.** PMSAv7'de region sayısı kısıtlıyken stack guard "lüks" gibi gelir; gerçekte DAL A koşan bir görevin overflow'unu önceden yakalayan tek deterministik araç budur.

**MemManage handler yazın.** Vektör tablosunda MemManage entry'si yoksa MPU fault'u HardFault'a yükselir ve debug çok zorlaşır. Handler'da `MMFAR` ve `CFSR.MMFSR` içeriğini logger'a basıp deterministic bir reset yapmak debug süresini günden saate indirir.

---

## Açık Sorular ve İleri Okuma

PMSAv8'in PMSAv7'ye göre sertifikasyon dosyalanmasında ne tür farklar getireceği henüz olgunlaşmış değil — özellikle "overlap UNDEFINED" davranışının robust partitioning argümanında nasıl ele alındığı hâlâ proje-bazlı yorumlanıyor. Cortex-R52'nin (ARMv8-R + PMSAv8) yaygınlaşmasıyla bu konunun pratik sertifikasyon literatürü hızla büyüyecek; izlemeye değer.

Yine de bugün, MPU'yu *opsiyonel bir lüks* değil, **uçuş yazılımının fiziksel bölümleme altyapısı** olarak tasarlamak — ve PMSAv7'nin alignment kurallarını taşma sonrası borçlanmak yerine baştan bir kısıtlama olarak görmek — sertifikasyon ekibinin ve sahanın 2'nci güne kadar fark ettiği farktır.

---

## Kaynaklar

- ARM, *ARMv7-M Architecture Reference Manual* (DDI 0403E.e), Part B3 "The System Level Memory Model"
- ARM, *Cortex-M4 Devices Generic User Guide* (DUI 0553), Bölüm 4.5 "Memory Protection Unit"
- ARM, *Cortex-M7 Devices Generic User Guide* (DUI 0646), MPU bölümü
- ARM, *Cortex-R5 Technical Reference Manual* (DDI 0460), MPU ve cache bölümleri
- ARM, *ARMv8-M Architecture Reference Manual* (DDI 0553), MPU bölümü — overlap UNDEFINED davranışı ve PMSAv8 base/limit modeli
- ARM, *Cortex-A Series Programmer's Guide* (DEN 0013D), VMSA ve TLB bölümleri
- ARINC 653 Part 1 (Supplement 4, 2015), "Avionics Application Software Standard Interface"
- RTCA, DO-297 "Integrated Modular Avionics (IMA) Development Guidance and Certification Considerations"
- RTCA, DO-178C §2.4 (Software Level Definitions), §2.5.1 (Partitioning Considerations)
- FreeRTOS, "Memory Protection Unit Support" — <https://www.freertos.org/Documentation/02-Kernel/03-Supported-devices/02-Memory-protection-support>

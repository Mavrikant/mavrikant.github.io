# Araştırma Notları — MPU vs MMU ARM

## Anahtar kaynaklar (gerçek, doğrulanmış)

- ARM Architecture Reference Manual ARMv7-M (DDI 0403E.e), Part B3 — MPU register tanımları, PMSAv7 region kuralları
- ARM Cortex-M4 Devices Generic User Guide (DUI 0553), Bölüm 4.5 — MPU programlama
- ARM Cortex-M7 Devices Generic User Guide (DUI 0646) — 16-region MPU
- ARM Cortex-R5 Technical Reference Manual (DDI 0460) — PMSAv7-R MPU, 16 region, cache+MPU etkileşimi
- ARM Architecture Reference Manual ARMv8-M (DDI 0553) — PMSAv8: base/limit kayıtları, MAIR
- ARM Cortex-A Series Programmer's Guide (DEN 0013D), VMSA bölümü — sayfa tablosu hiyerarşisi
- ARINC 653 Part 1 (2015) — IMA için zaman/uzay bölümlemesi
- DO-297 — IMA geliştirme rehberi
- DO-178C §2.4, §6.4.3 — bölümleme analizi gereksinimleri
- FreeRTOS-MPU: https://www.freertos.org/Documentation/02-Kernel/03-Supported-devices/02-Memory-protection-support

## Teknik gerçekler doğrulandı

### PMSAv7 (Cortex-M3/M4/M7, Cortex-R4/R5)
- Region sayısı: M3/M4 → 8, M7 → 16, R5 → 12 veya 16 (implementasyona bağlı)
- Region size: 2^N bayt, 32 B (N=5) ile 4 GB (N=32) arası
- Base alignment: base address region size'a hizalı olmak ZORUNDA
- Subregion Disable (SRD): region ≥ 256 B ise region'ı 8 eşit alt bölgeye böler, her birini disable edebilir; bu kuralla 256 KB region → 8 × 32 KB sub-region → 2 sub-region disable → 192 KB efektif
- Overlap precedence: PMSAv7'de YÜKSEK numaralı region kazanır (ARMv7-M ARM B3.5.1)
- Background region: MPU_CTRL.PRIVDEFENA = 1 → privileged mode için default memory map background olarak aktif

### PMSAv8 (Cortex-M23/M33/M55, ARMv8-R Cortex-R52)
- Base ve limit kayıtları (RBAR/RLAR), her ikisi 32 B çoklu
- Power-of-2 zorunluluğu KALDIRILDI
- Memory attribute encoding: MAIR0/MAIR1 üzerinden indirek, region'da yalnızca AttrIndx[2:0]
- Overlap: HATA — overlapping bölge ARMv8-M'de "UNPREDICTABLE" değil, FAULT üretir (ARMv8-M ARM, MPU section)

### Cortex-A (VMSAv7-A, VMSAv8-A)
- MMU: TTBR0/TTBR1, iki seviyeli sayfa tablosu (Short-descriptor) veya 3-4 seviye (Long-descriptor / LPAE)
- L1 1 MB section, 16 MB supersection veya L2 pointer
- L2 4 KB small page veya 64 KB large page
- TLB invalidation, ASID, context switch maliyeti

### Bellek tipi kodlaması (PMSAv7)
- TEX[2:0], C, B → strongly-ordered / device / normal (cacheable/bufferable kombinasyonları)
- Cortex-M7'de MPU cache attribute'ları cache controller'ı yönetir

## Tuzaklar

1. **Alignment trap (PMSAv7):** 192 KB istiyorsanız 192 KB region tanımlanamaz; ya 128+64 KB iki region, ya da 256 KB region + SRD (her sub-region 32 KB, 2 tanesini disable → 192 KB) — base 256 KB alignment'ta olmak zorunda
2. **Overlap precedence sürprizi:** PMSAv7'de yüksek region number kazanır; pek çok geliştirici tersini varsayar
3. **Stack guard:** Stack tabanına read/write yasaklayan bir küçük region koyarak overflow'u sessiz heap bozulumundan önce MemManage fault'a çevirmek — DAL A için kanıt
4. **MemManage fault'sa: vektor handler yoksa HardFault'a düşer → debug zor
5. **Cache + MPU tutarsızlığı (Cortex-M7):** TEX/C/B yanlış set edilirse cacheable bölge non-cacheable ile çakışıp yumuşak veri bozulumu

## Derinlik öğesi seçimi

İki öğe: (1) Concrete alignment math + SRD ile 192 KB region türetme; (2) Stack guard region setup kodu Cortex-M4 için (somut kayıt değerleri).

## "Bu konu neden Türkçe'de zor bulunuyor?"

- ARM dokümanları İngilizce ve ücretsiz ama dense; PMSAv7 alignment kuralları parçalı şekilde Part B3'te
- Pek çok Türkçe gömülü eğitim Cortex-M genel programlamayı işliyor; MPU çoğu zaman atlanıyor (uygulamada vendor HAL'leri kullanmak yetiyor)
- PMSAv8'in PMSAv7'ye göre farkı yeni; tek tek karşılaştıran Türkçe kaynak fiilen yok
- ARINC 653 / DO-297 ile MPU-tabanlı partitioning bağlantısı genelde yalnızca akademik makalelerde geçer
- Sentez (PMSAv7 + PMSAv8 + Cortex-A MMU + DO-178C partitioning) Türkçe'de boş alan

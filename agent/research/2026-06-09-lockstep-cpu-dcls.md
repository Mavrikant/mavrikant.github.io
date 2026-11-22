# Araştırma Notları — Lockstep CPU Mimarileri (DCLS)

**Tarih:** 2026-06-09
**Yazı:** `_posts/2026-06-09-lockstep-cpu-dcls-tms570-cortex-r5.md`
**Alan:** Gömülü/safety — donanım fault tolerance mimarisi.

## Konu seçim gerekçesi

- Mevcut yazılarda ve açık 20+ PR'da yer almıyor (PR'lar: priority inversion, DMA+cache,
  DO-326A cyber, fixed-point, Kalman, ILS, GIC, volatile, WCET ×2, FTA, linker script,
  watchdog, CRC, VOR, MC/DC, memory safety, UB, MISRA — hiçbiri donanım DCLS değil).
- Yazarın aviyonik DAL A uzmanlığına oturuyor; "sahadan notlar" tonu açısından doğal.
- Son 3 yayın (coupling/DO-178C, Kalman, sistem mühendisliği) farklı alanlardı; bu
  yazı RF/DSP'ye yakın olmayan yeni bir alt-alan getiriyor.

## "Neden Türkçe içerikte zor bulunuyor" yanıtı

Konu birden çok disiplinin kesişiminde:
- ARM Cortex-R TRM (ücretsiz ama yoğun)
- TI Hercules safety manual (PDF, 200+ sayfa)
- ISO 26262-5 Annex D (ücretli standart)
- IEC 61508-2 Annex C (ücretli)
- DO-254 (ücretli)
- ACM/MDPI akademik makaleler

Türkçe içerikte ya pazarlama özetleri ("ASIL D destekli") ya da datasheet özet çevirileri
var; "neden 2 çevrim skew", "DC nasıl hesaplanır", "common-cause neden sorun" gibi
sentez gerektiren açılardan Türkçe kaynak yok.

## Derinlik öğesi (Bölüm 7)

İki somut derinlik öğesi taşınıyor:
1. **Zamansal kayma matematiği**: CCM-R5'in 2-cycle input delay + 2-cycle output delay
   düzeneğinin neden böyle olduğunun türetimi ve hangi hata sınıfını yakaladığı.
2. **FMEDA hesabı**: 50 FIT ham çekirdek hata oranı üzerinden λ_DD/λ_DU bütçesi ve
   ASIL D için < 10 FIT λ_DU eşiğinin nasıl karşılandığı.

## Doğrulanan teknik iddialar

| İddia | Kaynak |
|---|---|
| TMS570LC4357: 2× Cortex-R5F lockstep, 300 MHz, 498 DMIPS | TI.com ürün sayfası |
| CCM-R5: 2 çevrim skew (input+output) | TI E2E forum, EUROS blog |
| ASIL D = %99 DC hedefi | ISO 26262-5 / IEC 61508-2; Synopsys yazısı |
| DCLS ISO 26262-5 Annex D "High" sınıfı | Synopsys + ISO standardına atıf |
| ARM TCLS = 3 çekirdek + 2/3 oylama | Iturbe et al., ACM TOCS 2019 |
| Cortex-A65AE Split-Lock modu | ARM TRM 101385/0101 |

## Kullanılmayan ama bilinen kaynaklar

- *Variable Delayed Dual-Core Lockstep (VDCLS)* — MDPI Electronics 2023; akademik
  iyileştirme önerisi, mevcut ürünleri tartışmıyor (alıntılandı ama detaya inilmedi).
- NXP S32E/S32G safety manual'ı — TI yerine NXP odağı çok dağıtıcı olurdu.

## Açık sorular / ileri okuma

- AURIX TC4xx (2025+) yeni nesil lockstep tasarımı nasıl evrildi?
- RISC-V dünyasında lockstep: Codasip, SiFive S2 Safety nasıl yaklaşıyor?
- DO-254 DAL A iddiası taşıyan FPGA-on-SoC tasarımlarında lockstep mantığı (Microchip
  PolarFire SoC, Xilinx Zynq UltraScale+ MPSoC RPU çifti) — ayrı bir yazı konusu.

# Araştırma Notları — DMA + Cache Coherency (Cortex-A9 / Zynq-7000)

## Neden bu konu (Faz 2 + Faz 8)

- Son üç yayın alanı: yazılım tasarımı (coupling), navigasyon (Kalman), sistem
  mühendisliği. Bu yazı **gömülü/SoC** alanına dönüyor; o alanda son yayın
  Renode (2026-05-14, 24 gün önce).
- Açık PR #100 ("`volatile` Yetmediğinde — C11 `_Atomic`, SCU, bellek bariyerleri")
  CPU↔CPU senkronizasyonunu ele alıyor. Bu yazı ise CPU↔DMA cephesindeki
  cache coherency problemini ele alıyor — örtüşmüyor. Ortak yön: DSB bariyeri.
- "Bu konuyu Türkçe bulmak neden zor?" — ARM ARM, Xilinx wiki, Linux kernel
  yamaları ve forumlardaki cevaplar arasında dağınık; ortak hatalar (partial
  line, adjacent variable corruption, L1/L2 ayrı bakım) hiç bir yerde tek bir
  sentezde toplanmamış. Türkçe içerikte neredeyse hiç yok.

## Doğrulanmış olgular

- Cortex-A9 L1 D-cache: 32 KB, 4-way, **32-byte line**.
- L2 cache controller: PL310 (Zynq-7000'de standart), aynı şekilde **32-byte
  line**, 512 KB / 8-way (Zynq-7000 konfigürasyonunda).
- Cache maintenance ops (ARMv7-A, AArch32):
  - `DCCMVAC` — Clean Data Cache by MVA to PoC.
  - `DCIMVAC` — Invalidate Data Cache by MVA to PoC.
  - `DCCIMVAC` — Clean and Invalidate Data Cache by MVA to PoC.
  - `PoC` = Point of Coherency.
- Zynq-7000'de inner cache (L1) ile outer cache (L2/PL310) ayrı olarak yönetilir;
  L1 üzerinde MCR ile, L2 üzerinde PL310 register'larına yazarak.
- `Xil_DCacheFlushRange()` (Xilinx BSP) önce L1 → sonra L2 üzerinde clean+invalidate
  yapar; v8.0'da inner/outer ayrımı düzeltildi.
- `Xil_DCacheInvalidateRange()` benzer mantıkla, sadece invalidate.
- DMA başlatmadan önce **DSB** bariyeri şarttır: cache maintenance op'unun
  bitmesi ile DMA transferinin başlaması arasında bellek görünürlüğünü
  garanti eder.
- ACP (Accelerator Coherency Port) — Cortex-A9 SCU üzerinden cache-coherent
  DMA path'i. Zynq-7000'de PL'den gelen master'lar için kullanılabilir;
  yazılım cache maintenance'ı gereksiz kılar ama bant genişliği sınırlıdır
  (64-bit AXI, SCU snoop tarafından serileştirilir).
- Partial-line problemi: DMA buffer'ı bir cache line'ın sadece bir kısmını
  kaplıyorsa, invalidate o satırdaki komşu veriyi de yok eder.
  - clean+invalidate kombinasyonu yarış koşuluna açık: clean ile invalidate
    arasında CPU komşu değişkene yazarsa, yazı kaybolur.

## Yapı (Faz 4)

1. Hook: 0x0000_0000 değil, "8 örnekten sonra biri eski" gibi sinsi bir hata.
2. Donanım manzarası: Cortex-A9 + L1 + PL310 + DDR + AXI/DMA path.
3. Cache maintenance dilbilgisi (üç op + DSB).
4. İki yön: CPU→DMA (clean before), DMA→CPU (invalidate after / sometimes before+after).
5. Tuzaklar:
   - L1 yetmez, L2 de gerek.
   - Cache-line alignment (start + length).
   - Adjacent variable corruption (somut C örneği).
   - Clean+invalidate yarış koşulu.
6. Deney / failure mode: ADC ring buffer örneği, bug ve fix.
7. Alternatifler: Non-cacheable region, ACP, write-through+no-allocate.
8. Pratik tavsiyeler.
9. Açık sorular.
10. Kaynaklar.

Derinlik öğesi (Bölüm 7): **failure mode + cache maintenance instruction
walkthrough + somut yarış koşulu reprodüksiyonu.**

## Kaynaklar

- ARM ARM (ARMv7-A & ARMv7-R), DDI 0406C.d — bölüm B2.2 "Caches".
- Cortex-A9 Technical Reference Manual, DDI 0388H/I — bölüm 7 "L1 Memory System".
- PL310 (L2C-310) Technical Reference Manual, DDI 0246H.
- Xilinx UG585 (Zynq-7000 TRM) — bölüm 3.4 "Caches", bölüm 22 "DMA Controller".
- Xilinx embeddedsw — `lib/bsp/standalone/src/arm/cortexa9/xil_cache.c`.
- Linux kernel `Documentation/core-api/dma-api-howto.rst`.
- Microchip TB3195 — "Managing Cache Coherency on Cortex-M7 Based MCUs"
  (yan kıyaslama için).

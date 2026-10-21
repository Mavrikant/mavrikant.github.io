# Araştırma Notları — DMA ve Cache Uyumluluğu (ARM Cortex-A)

## Tarih
2026-06-25

## Temel doğrulanmış olgular

- **Cache line boyutu:** Cortex-A serisinde genellikle 64 byte (Cortex-A53, A72,
  A78, A53'lü Zynq UltraScale+). Cortex-M7'de 32 byte. Apple M-serisi 128 byte.
  CMSIS: `__SCB_DCACHE_LINE_SIZE` (M-serisi). Cortex-A için CTR_EL0 (AArch64) /
  CTR (AArch32) sistem yazmacından okunur (DminLine/IminLine alanları).
- **Cache maintenance işlemleri (AArch64):**
  - `DC CVAC` (Data Cache Clean by Virtual Address to Point of Coherency)
  - `DC IVAC` (Data Cache Invalidate by Virtual Address to PoC)
  - `DC CIVAC` (Clean + Invalidate by Virtual Address to PoC)
- **Bariyerler:**
  - `DMB` (Data Memory Barrier): yalnızca *bellek erişim sırasını* zorlar.
  - `DSB` (Data Synchronization Barrier): tüm bekleyen bellek erişimleri,
    cache, branch predictor ve TLB bakımları tamamlanır. Cache bakımının
    *gerçekten bittiğini* garantilemek için cache işleminden sonra `DSB` gerekir.
  - `ISB` (Instruction Synchronization Barrier): pipeline'ı boşaltır; sistem
    yazmacı değişikliklerinden sonra gerekir.
- **PoC vs PoU:** Point of Coherency — sistemdeki tüm gözlemciler (CPU'lar,
  DMA, GPU) için ortak görünüm. PoU — aynı CPU'nun talimat/veri yolları
  arasında ortak görünüm. DMA için *PoC* gerekir.
- **ACP (Accelerator Coherency Port):** Cortex-A9/A53 SCU üzerinden hardware
  coherent erişim sağlar. ACP üzerinden DMA yapan ek bakıma ihtiyaç duymaz.
  Zynq-7000 ve UltraScale+ MPSoC'de mevcut.
- **AXI ACE / ACE-Lite:** ACE iki yönlü cache↔cache coherency, ACE-Lite
  device→cache (DMA okumalarını coherent yapar ama CPU writebacks DMA tarafına
  görünür değildir — ACP/ACE'nin tam coherent versiyonu gerekir).

## Tipik hata senaryoları

1. **CPU yazıyor → DMA okuyor:** CPU verisi cache'te dirty, DRAM'da eski. Eğer
   CPU clean yapmadan DMA tetiklenirse, periferik **eski veriyi** alır.
2. **DMA yazıyor → CPU okuyor:** DMA DRAM'a yazar, CPU cache'inde ilgili line
   var. CPU cache'ten **eski veriyi** okur. Çözüm: DMA bittikten sonra
   invalidate.
3. **Tampon başlangıcı/sonu cache line'a hizalı değil:** Invalidate komşu
   değişkeni de yok eder (kazara yazılan veri kaybolur) ya da clean DMA'ya
   bitişik bayrak verisini de yazar (yarış koşulu).
4. **Eşzamanlı yarış:** Clean ile DMA tetiği arasında diğer kod cache'i tekrar
   doldurursa, periferik tutarsız veri alabilir. Bariyer + tetik sırası kritik.

## Linux dma_alloc_coherent vs streaming

- `dma_alloc_coherent`: kalıcı, non-cacheable bölgede tampon ayırır. Yavaş ama
  bakım gerekmez. Tanımlayıcı (descriptor) için iyi.
- `dma_map_single` / `dma_unmap_single`: streaming — cache'li bellek + uygun
  yönde clean/invalidate. Veri payload'u için yaygın.
- Yön (DMA_TO_DEVICE / FROM_DEVICE / BIDIRECTIONAL) çekirdeğe hangi cache
  bakımının gerektiğini söyler.

## "Bug görünmez" durumlar (debugging zorluğu)

- Build optimizasyon seviyesi değişince ortaya çıkar/kaybolur (compiler farklı
  cache footprint üretir).
- D-cache kapalıyken çalışır (debug build, MMU ayarı).
- Küçük buffer'larda hiç olmaz, büyük buffer'larda görünür (eviction olunca
  DRAM güncellenir).
- Aynı kart üzerinde çoğu zaman çalışır, nadiren bozulur (cache içeriği
  ön-kondisyonuna bağlı).
- printf/UART eklenince yok olur (cache state değişir — Heisenbug).

## Kaynak doğrulamaları (web search 2026-06-25)

- ARM Cortex-A Programmer's Guide (DEN0013D), Bölüm "Cache coherency".
- ARM Cortex-R Programmer's Guide (DEN0042).
- ARM Architecture Reference Manual — Memory Barriers (DMB/DSB/ISB tanımları).
- Microchip TB3195 / TB3295 — Cortex-M7 cache coherency teknik dokümanları.
- Xilinx wiki: Zynq UltraScale+ MPSoC Cache Coherency, ACP/ACE-Lite/ACE
  farkları.
- Zephyr RTOS issue #36471 — gerçek tartışma, alignment ve invalidate sırası.
- Linux DMA API Howto — dma_alloc_coherent vs streaming akışı.

## Derinlik öğesi seçimi (Bölüm 7)

**Failure mode analizi + bellek/assembly inceleme.** Yazıda:
- Concrete bug scenario adım adım (cache line / DMA timeline diyagramı).
- Yanlış sıra ile doğru sıranın karşılaştırılması.
- Hizalama tuzağı için somut hesaplama (cache line × buffer offset).
- AArch64 inline assembly cache bakım örneği.

## Notlar

- Yazar daha önce "Renode ile Zynq7000 Simülasyonu" yazısında SoC tarafına
  girdi; bu yazı doğal devam — ama simülasyondan çok gerçek donanım üzerine.
- Türkçe kaynak boşluğu büyük: konu DMA driver yazımı + ARM mimarisi + RTOS
  bakımı kesişiminde; her cephe ayrı yerlerde dağınık.

# Araştırma Notları — ARM GIC

## Kaynaklar (doğrulanmış)
- ARM Generic Interrupt Controller Architecture Specification (IHI 0048B, GICv2)
- ARM CoreLink GIC v3/v4 Overview — developer.arm.com/architectures/learn-the-architecture
- OSDev Wiki — Generic Interrupt Controller
- Cristian Sisterna, "Interrupts in Zynq Systems", ICTP slides
- RealDigital — Configuring the ZYNQ GIC for Programmable Logic Interrupts
- Xilinx UG585 (Zynq-7000 TRM) — GIC bölümü
- baremetal-arm (umanovskis) — interrupts dokümanı
- ARM Trusted Firmware GICv2 driver kaynak kodu
- Arm Community forum: spurious interrupt 1023 davranışı

## Sayısal kesinler
- SGI: ID 0-15
- PPI: ID 16-31 (PE başına banked)
- SPI: ID 32-1019 (GICv2'de en fazla 988 SPI)
- Spurious IRQ ID: 1023 (GICv1/v2)
- Group interrupt sentinel: 1022
- Öncelik bit sayısı: IMPLEMENTATION DEFINED, minimum 4 bit
- Cortex-A9 / PL390 (Zynq-7000): 5 bit -> 32 öncelik seviyesi
- GICC_BPR: 3-bit, değer 0-7
- Zynq-7000 GIC base: 0xF8F00000 (CPU interface) + 0xF8F01000 (distributor)

## Kayıt eşlemeleri (Zynq-7000 PL390)
- ICCICR (GICC_CTLR): 0xF8F00100
- ICCPMR (GICC_PMR): 0xF8F00104
- ICCBPR (GICC_BPR): 0xF8F00108
- ICCIAR (GICC_IAR): 0xF8F0010C
- ICCEOIR (GICC_EOIR): 0xF8F00110
- ICDDCR (GICD_CTLR): 0xF8F01000
- ICDISER (GICD_ISENABLERn): 0xF8F01100
- ICDICER (GICD_ICENABLERn): 0xF8F01180
- ICDIPR (GICD_IPRIORITYRn): 0xF8F01400
- ICDIPTR (GICD_ITARGETSRn): 0xF8F01800
- ICDICFR (GICD_ICFGRn): 0xF8F01C00

## Tipik hata modları (yazıda kullanılacak)
1. GICC_IAR'ı iki kez okumak -> ikinci okuma 1023 döner
2. Level-sensitive kaynakta cihazın IRQ hattını temizlemeden EOI yazmak -> sürekli yeniden tetikleme
3. SPI için GICD_ITARGETSR maskesi yanlış -> kesme tek CPU'ya gidiyor, o CPU WFI'de değilse hiçbir şey olmuyor
4. GICC_BPR=7 -> preemption tamamen kapalı (her şey aynı grup öncelik)
5. EOI yazmayı unutmak -> active priority drop olmaz -> aynı veya daha düşük öncelikli kesmeler hiç gelmez
6. SGI/PPI için GICD_ITARGETSR banked, CPU0'dan yazdığın değer CPU1'de görünmez
7. GICC_PMR power-up sonrası 0 (her şey maskeli) -- her CPU'da ayrı set etmek lazım

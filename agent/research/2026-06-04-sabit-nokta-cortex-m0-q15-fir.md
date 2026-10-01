# Araştırma Notu — Sabit Nokta DSP, Cortex-M0, Q15 FIR

## Doğrulanmış teknik gerçekler

### ARM ISA seviyeleri (kaynak: ARM Architecture Reference Manual; ARM® Cortex®-M Programming Manuals)

| Çekirdek | ISA | DSP eklentisi | İlgili komutlar |
|---|---|---|---|
| Cortex-M0 / M0+ | Armv6-M | yok | MULS (32×32→32 düşük), ASR, SXTH; **YOK:** SSAT, UDIV/SDIV, SMULBB, SMLAL |
| Cortex-M1 | Armv6-M | yok | M0 ile benzer |
| Cortex-M3 | Armv7-M | yok | SSAT, USAT, UDIV, SDIV gelir; DSP komutları yine yok |
| Cortex-M4 | Armv7E-M | **var** | SMULBB/BT/TB/TT, SMULWB/WT, SMLAL, SMLABB, SMLALD, SMLAD, QADD/QSUB |
| Cortex-M7 | Armv7E-M | var | M4 üzeri |
| Cortex-M33 | Armv8-M ana | opsiyonel | DSP eklentisi opsiyonel |

### Cortex-M0 MULS gecikmesi

- Cortex-M0 TRM: MULS iki implementation seçeneği — **fast** (1 cycle) ve **small** (32 cycle, 1 bit/cycle Booth-like).
- Cortex-M0+ TRM: yalnızca fast (1 cycle) seçeneği.
- Pek çok mikrodenetleyici (STM32F0, nRF51, RP2040 Cortex-M0+) fast multiplier ile gelir.

### Q-format (Texas Instruments SLAA329, CMSIS-DSP belgeleri, Wikipedia "Q (number format)")

- Notasyon: `Qm.n` — m tam-sayı, n kesir bit; toplam m+n+1 bit (sign).
- `Q15` (= `Q1.15`) → 1 sign + 15 kesir bit; int16; aralık [−1, 1 − 2⁻¹⁵]; çözünürlük 2⁻¹⁵ ≈ 3.05 × 10⁻⁵.
- `Q31` (= `Q1.31`) → int32; aralık [−1, 1 − 2⁻³¹].
- Çarpma: `Q m1.n1 × Q m2.n2 = Q(m1+m2+1).(n1+n2)` — bit toplamı: ham sonuç (m1+n1+1) + (m2+n2+1) bit.
- `Q15 × Q15 = Q2.30` → int32'de tutulur; sonuç [−1, 1] aralığında, **tek istisna** −1 × −1 = +1 overflow yaratır (Q15 max 1−2⁻¹⁵).

### CMSIS-DSP sözleşmeleri

- `q15_t = int16_t`, `q31_t = int32_t`, `q63_t = int64_t`.
- `arm_fir_q15(S, src, dst, blockSize)` — coefficient array Q15, accumulator Q31, çıkış Q15.
- Round-to-nearest: çıkışa `(acc + (1<<14)) >> 15`.
- Saturasyon: `__SSAT(value, 16)` — Armv7-M'de tek komut; M0'da yazılım emülasyonu.
- Header: `arm_math.h` (eski) veya `arm_math_types.h` + `arm_math_f16.h` (yeni CMSIS-DSP).

### Soft-float maliyeti (Cortex-M0, libgcc, gcc-arm-none-eabi)

Yaklaşık değerler — sürüm ve seviyeye göre değişir:

| Çağrı | Cycle (yaklaşık) |
|---|---|
| `__aeabi_fmul` (32-bit float ×) | 90–180 |
| `__aeabi_fadd` (32-bit float +) | 80–200 |
| `__aeabi_fdiv` | 200–500 |
| `__aeabi_f2iz` (float→int) | 50–100 |

Kaynak: ARM CMSIS-DSP belgesi `arm_q15_to_f32` bölümleri, gcc-arm-embedded soft-float benchmarks, ChibiOS forumlarındaki ölçümler. Cortex-M3'te bu rakamlar biraz düşer (UDIV/SDIV ve barrel shifter sayesinde), Cortex-M4F'te zaten donanım FPU vardır.

### Saturasyon

- −1 × −1 = +1 = `0x40000000` Q30; >> 15 = `0x8000` = −32768 olarak yorumlanır (yanlış!); doğrusu 32767'ye saturasyon.
- Cortex-M3+: `SSAT Rd, #16, Rs, ASR #15` → tek komut.
- Cortex-M0: koşullu kontrol + sabit yükleme; 5–7 komut.

### Yuvarlama modları

- **Truncation:** `prod >> 15` — beklenen değerin altına yatkın (DC kayması).
- **Round-to-nearest (away from zero):** `(prod + (1<<14)) >> 15` — yarım LSB ekle, sonra truncate.
- **Round-to-even (banker's):** karmaşık; CMSIS-DSP çoğunlukla nearest kullanır.

### Headroom (guard bits)

N-tap FIR için worst-case kazanç toplamı `Σ|h[k]|`. Bu sum L1-norm. Eğer Q15 katsayı ve Q15 giriş, accumulator için:
- Düşük geçiş filtresi (Σh = 1): headroom = 0 bit, Q31 yeter.
- Yüksek/bantgeçişi: kazanç >1 olabilir, ek guard bit gerekir → Q63 accumulator veya tap normalizasyonu.

## Kaynak listesi (gerçek, erişilebilir)

1. ARM, *ARM® Cortex®-M0 Devices Generic User Guide* (DUI 0497A). developer.arm.com/documentation/dui0497.
2. ARM, *ARM® Cortex®-M4 Devices Generic User Guide* (DUI 0553B). developer.arm.com/documentation/dui0553.
3. ARM, *Cortex-M0 Technical Reference Manual* — multiplier options bölümü. developer.arm.com/documentation/ddi0432.
4. ARM, *Armv7-M Architecture Reference Manual* — DSP extension komut tanımları. developer.arm.com/documentation/ddi0403.
5. Texas Instruments, *MSP430 Application Report SLAA329 — Fixed-Point Arithmetic*. ti.com/lit/an/slaa329.
6. ARM, *CMSIS-DSP Library Documentation*. arm-software.github.io/CMSIS-DSP/latest/.
7. Wikipedia, "Q (number format)" — Q15/Q31 tanımı. en.wikipedia.org/wiki/Q_(number_format).
8. Joe Bungo, *Fixed-Point Math: A Practical Approach* (ARM blog 2018). community.arm.com.
9. Trevor Pinkney, "Cortex-M0 vs M0+ vs M3 vs M4 instruction differences" — Microchip developer help.
10. GCC documentation, `gcc-arm-none-eabi` — `-mcpu=cortex-m0 -mfloat-abi=soft` davranışı.

## Derinlik öğesi seçimi

**Assembly inspection + cycle benchmark.** Aynı Q15 MAC (`a*b + acc`) hem Cortex-M0 (Armv6-M) hem de Cortex-M4 (Armv7E-M, DSP) için derlenecek, gerçek arm-none-eabi-gcc çıktısı gösterilecek, sonra 32-tap FIR için soft-float ile karşılaştırılacak.

## Gizlilik kontrolü

- Kullanılan tüm bilgiler ARM'ın kamuya açık dokümanlarından ve CMSIS-DSP'nin (Apache 2.0) açık kaynak repositorisinden.
- Hiçbir proje, müşteri, ürün, iç süreç referansı yok.
- ITAR/EAR kapsamına girmez (genel mikrodenetleyici DSP bilgisi).

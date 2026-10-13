---
title: "Sabit Nokta Aritmetik: FPU'suz Cortex-M0'da Q15 FIR Filtresi"
subtitle: "Fixed-Point Arithmetic: A Q15 FIR Filter on FPU-Less Cortex-M0"
background: "/img/posts/8.webp"
date: '2026-06-04 09:00:00'
layout: post
lang: tr
---

Bir akustik sensör projesinde 48 kHz örnekleme hızında 32-tap'lık bir alçak-geçiren FIR filtresi koşturmam gerekti. Donanım: bir Cortex-M0+ tabanlı düşük güç MCU, 48 MHz saat, FPU yok. İlk denemem klasikti — filtre katsayılarını `float` olarak tanımladım, MAC döngüsünü düz C ile yazdım, derledim. Sonuç: 48 kHz örnek başına işlemcinin **bütün** 1000 cycle bütçesinin neredeyse 10 katı tükeniyordu. Filtre tek başına işlemciyi tıkadı.

Aynı filtreyi Q15 sabit nokta ile tekrar yazdığımda çevrim sayısı yaklaşık **yüz kat** düştü ve CPU bütçesinin yalnızca %10'unu kullandı. Bu yazıda o yüz kat farkının nereden geldiğini somut assembly üzerinden göstereceğim, Q15'in nasıl çalıştığını ve hangi tuzaklara dikkat etmek gerektiğini sıfırdan kuracağım.

İlginç olan şu: Cortex-M0'ın komut seti (Armv6-M) DSP komutlarından mahrumdur — ne `SMULBB`, ne `SMLAL`, ne `SSAT`. Sadece `MULS` ve birkaç temel komut. Buna rağmen iyi yazılmış bir Q15 MAC döngüsü, soft-float emülasyonunu kâğıt üstünde paçavraya çevirir. Ortada sihir yok, sadece doğru tasarlanmış sayı temsili var.

---

## Önce Soruyu Doğru Soralım: Neden Sabit Nokta?

Mühendislikte "FPU yok" ifadesi iki şey demek olabilir:

1. **Donanımsal FPU bulunmuyor.** Cortex-M0/M0+/M1/M3 bu kategoride. Float işlemleri derleyici tarafından `libgcc`'nin `__aeabi_*` rutinleri ile yazılıma emüle edilir. Bir `float` çarpma ~100 cycle, bir bölme ~300 cycle gibi rakamlar konuşulur.
2. **FPU var ama kullanmak istemiyoruz.** Genelde determinizm kaygısı: float işlemleri IEEE 754'ün kenar durumlarında (denormal, NaN, Inf) öngörülebilir gecikme vermez; sertifikasyon altında WCET (worst-case execution time) analizi yapmak istemezsiniz. Veya enerji bütçesi nedeniyle FPU'yu güçten alıyorsunuz.

Her iki durumda da sabit nokta cevabı verir. Ama sabit nokta sadece "float yerine int kullan" değildir; **kaydırma yerini kafanda saklamak** demektir. Q-format notasyonu bunun mühendislik dilidir.

İlginç bir veri: CMSIS-DSP kütüphanesinin tüm temel filtre fonksiyonları (`arm_fir_q15`, `arm_biquad_q15`, `arm_iir_q15`) Q15 ve Q31 sürümleriyle gelir. Cortex-M4 üzerinde donanım FPU varken bile pek çok ekibin Q15 sürümünü tercih etmesinin nedeni budur: deterministik gecikme + düşük bellek.

---

## Q-Format Notasyonu: Bir LSB Ne Kadar Eder?

`Qm.n` notasyonunda `m` tam-sayı bitlerini, `n` kesir bitlerini gösterir. Sign biti m'e dahil değildir (geleneklerden birine göre — sektör birleşik bir tanım üzerinde anlaşmaz, ama TI ve CMSIS-DSP "m sign bit hariç" konvansiyonunu kullanır). Bu yazı boyunca onu kullanacağım.

Pratikte en sık karşılaşacağınız iki format:

| Format | Tip | Aralık | Çözünürlük (1 LSB) | Kullanım |
|---|---|---|---|---|
| **Q15** = Q1.15 | `int16_t` | [−1, 1 − 2⁻¹⁵] ≈ [−1, +0.99997] | 2⁻¹⁵ ≈ 30.5 µ | Filtre katsayıları, audio örnekleri |
| **Q31** = Q1.31 | `int32_t` | [−1, 1 − 2⁻³¹] | 2⁻³¹ ≈ 0.466 n | FIR/IIR accumulator |

Hesap kabaca şöyle yürür: ham int16 değerini `2¹⁵ = 32768`'e bölünce gerçek değeri elde edersiniz.

```c
int16_t q15 = 0x4000;          // = 16384
float real = q15 / 32768.0f;   // = 0.5
```

`0x4000` Q15'te `+0.5`'tir. `0x8000` (yani `−32768`) Q15'te `−1.0`'dır. `0x7FFF` Q15'te `+0.999969...`'dur — yani Q15 asla tam olarak `+1.0` tutamaz; bu, ileride saturasyon başlığına döneceğimiz bir asimetridir.

---

## Q15 × Q15: Çarpımın Anatomisi

Sabit nokta aritmetiğin tek püf noktası vardır: **çarpma sonrası kesir biti sayısı toplanır.** Q15 × Q15 = Q2.30 üretir.

Görsel olarak:

```text
   s . xxxxxxxxxxxxxxx       (Q1.15  — 16 bit)
×  s . yyyyyyyyyyyyyyy       (Q1.15  — 16 bit)
─────────────────────
  ss . xxxxxx...yyyyyy       (Q2.30  — 32 bit)
```

Sonuç 32-bit signed bir sayıdır; iki sign biti üst tarafta, 30 kesir biti altta. C tarafında:

```c
int16_t a = 0x4000;             // Q15: +0.5
int16_t b = 0x6000;             // Q15: +0.75
int32_t prod_q30 = (int32_t)a * (int32_t)b;   // Q2.30
```

`(int32_t)` cast'leri kritik. Onlarsız `int16_t * int16_t` ifadesi C kurallarına göre önce `int`'e promote edilir (integer promotion), sonra çarpılır; standart compliant ama derleyici 16-bit hedeflerde patlayabilir. Üst seviye taşınabilir kod için cast'i bırakmayın.

Sonucu tekrar Q15'e döndürmek için 15 bit sağa kaydırmamız gerekir:

```c
int16_t result = (int16_t)(prod_q30 >> 15);   // Q15
```

`+0.5 × +0.75 = +0.375` olmalı. Kontrol: `0x4000 × 0x6000 = 0x18000000` (Q30 = +0.375). `0x18000000 >> 15 = 0x3000` = +0.375 (Q15). ✓

---

## Cortex-M0 Assembly: `MULS` Ne Yapar, Ne Yapamaz?

Şimdi yukarıdaki tek satırlık MAC ifadesinin Cortex-M0'da nasıl derlendiğini görelim. Aşağıdaki C kodu:

```c
int32_t q15_mac(int16_t a, int16_t b, int32_t acc) {
    return acc + (((int32_t)a * (int32_t)b) >> 15);
}
```

Derlenmiş hali (`arm-none-eabi-gcc -mcpu=cortex-m0 -mthumb -O2 -S`):

```armasm
q15_mac:
        sxth    r0, r0          @ r0 = (int32_t)(int16_t)r0  — sign-extend
        sxth    r1, r1          @ r1 = (int32_t)(int16_t)r1
        muls    r0, r1, r0      @ r0 = r0 * r1  (low 32 bits)
        asrs    r0, r0, #15     @ r0 = r0 >> 15   (arithmetic, sign-preserving)
        adds    r0, r2, r0      @ r0 = acc + r0
        bx      lr
```

Beş komut. Tipik Cortex-M0+ (fast multiplier) üzerinde her biri 1 cycle, dolayısıyla **MAC başına 5 cycle + dönüş.** Döngü içinde yazdığınızda `bx lr` ve `sxth` overhead'i azalır; ham MAC `muls + asrs + adds` üçlüsüne iner: **3 cycle.**

Burada görmeniz gereken iki şey var:

**Birincisi, `MULS` 32×32→32 düşük döner.** Yani çarpımın yalnızca alt 32 biti elde edilir. Q15 için bu yeterlidir çünkü iki sign-extended int16'nın çarpımı zaten 32 bite sığar. Cortex-M4+ DSP eklentisinin `SMULL/UMULL` (32×32→64) komutu burada yoktur — ama Q15 için ihtiyacımız da yok.

**İkincisi, `SXTH` kritik.** Cortex-M0'ın Thumb-1 komut seti yalnızca düşük yarı-kelimeyi (low halfword) işleyen tek bir aritmetik komut bilmez. Üst değerlerin temiz olduğundan emin olmak için sign-extension komutunu sürmeniz gerekir. Eğer giriş zaten `int32_t` ise (ki accumulator olarak çoğu zaman öyledir), bu komut atlanır.

Şimdi Cortex-M0'da **olmayan** komutları görelim. Aynı `q15_mac` Cortex-M3'te (`-mcpu=cortex-m3`) derlenince:

```armasm
q15_mac:
        sxth    r0, r0
        sxth    r1, r1
        muls    r0, r1, r0
        add     r0, r2, r0, asr #15   @ tek komutla shift + add
        bx      lr
```

Cortex-M3 (Armv7-M) "barrel shifter" sayesinde shift'i ücretsiz birleştirir: 4 komut, MAC başına 2 cycle.

Cortex-M4'te (`-mcpu=cortex-m4 -mthumb`) DSP eklentisi devreye girer:

```armasm
q15_mac:
        smlabb  r0, r0, r1, r2   @ r0 = (low16 r0)*(low16 r1) + r2
        asrs    r0, r0, #15      @ Q30 -> Q15
        bx      lr
```

`SMLABB` — *"Signed Multiply Accumulate, Bottom×Bottom"* — alt yarı-kelimeleri 16×16→32 olarak çarpar, üçüncü operandı toplar, hepsi tek cycle'da. MAC başına **1 cycle.**

Hatta accumulator'ı 32-bit yerine 64-bit tutmak istersek (taşma güvenliği için):

```armasm
q15_fir_loop:
        ldrsh   r4, [r1], #2      @ örnek yükle, post-inc
        ldrsh   r5, [r2], #2      @ katsayı yükle
        smlal   r6, r7, r4, r5    @ {r7:r6} += r4 * r5  (Q31 acc)
        subs    r3, #1
        bne     q15_fir_loop
```

`SMLAL` — *"Signed Multiply Accumulate Long"* — 32×32→64 sonuca 64-bit accumulator ekler. Cortex-M4'te 1 cycle. Cortex-M0'da bu komut **mevcut değil**; aynı sonucu yazılımda elde etmek için 64-bit toplama rutini çağırırsınız, ki o ayrı bir maliyettir.

Özet:

| Çekirdek | MAC cycle | Notlar |
|---|---|---|
| Cortex-M0 (fast mult) | 3 | `muls + asrs + adds` |
| Cortex-M0 (small mult) | 34 | `muls` 32 cycle (bit-serial Booth) |
| Cortex-M3 | 2 | barrel shifter shift'i birleştirir |
| Cortex-M4 (DSP) | 1 | `smlabb` veya `smlal` |

"Small multiplier" yalnızca Cortex-M0'ın sentez zamanı bir seçeneğidir — Cortex-M0+ daima 1-cycle multiplier ile gelir. Yine de yeni bir parçaya başlarken silikon datasheet'inden bunu **doğrulayın**: nadir de olsa M0 lisanslayan üreticiler small multiplier seçmiş olabilir, ve yanlış varsayım sizi 30x yavaşlatabilir. Yaygın parçalar (STM32F0, nRF51, RP2040 Cortex-M0+) fast multiplier ile gelir.

---

## Soft-Float Maliyeti: Neden Yüz Kat?

Cortex-M0'da `float a * float b` ifadesi şuna derlenir:

```armasm
        push    {lr}
        bl      __aeabi_fmul     @ libgcc soft-float multiply
        pop     {pc}
```

`__aeabi_fmul`'un ne yaptığı sürüm-bağımlıdır ama ana hatlar:

1. İki float'ı mantissa + exponent + sign olarak ayır.
2. Sign'ları XOR'la.
3. Exponent'leri topla, bias düzelt.
4. Mantissa'ları unsigned 24×24 → 48 olarak çarp (Cortex-M0'da `MULS` 32×32→32 ile birkaç parçada).
5. Sonucu normalize et (leading 1 araması).
6. Yuvarla (round-to-nearest-even).
7. Sonucu yeniden pack'le.
8. Denormal / NaN / Inf kenarlarını kontrol et.

Tipik bir Cortex-M0'da `__aeabi_fmul` çağrısının ölçülmüş gecikmesi **90–180 cycle** arasındadır (gcc sürümü ve giriş değerlerine göre değişir). `__aeabi_fadd` benzer şekilde **80–200 cycle**. Bir MAC iki çağrı demek: **200–400 cycle.**

Karşılaştırma:

| İşlem | Cortex-M0 cycle | İşlem hızı (48 MHz'de) |
|---|---|---|
| Q15 MAC (sabit nokta) | 3 | 16 MMAC/s |
| Float MAC (soft-float) | ~300 | 160 kMAC/s |

**Oran: yaklaşık 100 katı.** Giriş bu yazının başındaki "filtrem kendi bütçesinin 10 katını yiyordu" anekdotu işte bu yüz katın sahaya yansımasıydı.

48 kHz örnek başına işlemcinin 48 MHz / 48 kHz = 1000 cycle'lık bütçesi var. 32-tap FIR için:

- **Q15:** ~32 × 3 + döngü ek yükü ≈ 110 cycle (CPU'nun %11'i).
- **Soft-float:** ~32 × 300 ≈ 9600 cycle (CPU'nun %960'ı — yani olanaksız).

Filtre boyutu büyüdükçe makas açılır. 128-tap için Q15 hâlâ rahat (~440 cycle, %44), soft-float artık tek başına ekrandaki tüm pixel'leri yiyen bir canavar.

---

## Saturasyon ve Yuvarlama: Sessiz Hatalar

Q15 aritmetiğin asıl tehlikesi taşma değil — taşma görüldüğünde fark ederseniz. **Asıl tehlike sessiz hatadır:** yanlış yuvarlama yüzünden DC offset birikmesi, kötü saturasyon yüzünden distortion, yanlış headroom yüzünden clipping.

### Saturasyon: −1 × −1 Köşesi

Q15 aralığının asimetrik olduğunu söylemiştim: [−1, +1 − 2⁻¹⁵]. Bu, çarpmada bir tek istisna doğurur: `(−1) × (−1) = +1`, ama +1 Q15'te yok. Bit seviyesinde:

```
0x8000 × 0x8000 = 0x40000000   (Q30 = +1.0, eğer Q30 +1'i tutabilseydi)
0x40000000 >> 15 = 0x00008000   (Q15: bit pattern int16'da −32768 demek!)
```

Yani naif `>> 15` size `−1.0` döner — yanlış işaret! CMSIS-DSP bu yüzden her saturasyona ihtiyacı olan yerde Q15'i Q31 accumulator'a alır ve sonunda `__SSAT(acc, 16)` ile kırpar:

```c
// CMSIS-DSP arm_fir_q15 sonu (basitleştirilmiş)
acc = __SSAT(acc >> 15, 16);
*dst++ = (q15_t)acc;
```

Cortex-M4+'da `SSAT` tek komuttur:

```armasm
ssat    r0, #16, r0, asr #15
```

Cortex-M0'da yazılım emülasyonu yapılır:

```c
// Manuel saturasyon — Cortex-M0 friendly
static inline int16_t sat_q15(int32_t x) {
    if (x > 32767)  return 32767;
    if (x < -32768) return -32768;
    return (int16_t)x;
}
```

Bu rutin Cortex-M0'da yaklaşık 5–6 cycle ekler. Filtre uçlarında bir kez çağrıldığı için döngü içine girmez, gözardı edilebilir. Ama eğer her MAC'ten sonra saturasyon yapıyorsanız (savunmacı kod), 3 cycle'lık MAC bir anda 9 cycle'a çıkar — bu yüzden CMSIS-DSP saturasyonu yalnızca son yazıma erteler.

### Yuvarlama: DC Kayması

Saf truncate (`>> 15`) negatif değerleri her zaman aşağı yuvarlar. Pozitif/negatif dengeli bir sinyalde bu, **her örnekte yarım LSB'lik bir bias** doğurur — yani DC offset birikir. Audio sinyallerinde bu hafif bir "thump" olarak duyulur.

Çözüm: round-to-nearest:

```c
int16_t result = (int16_t)((prod_q30 + (1 << 14)) >> 15);
```

`(1 << 14) = 16384` Q30'da yarım LSB'dir; eklenince tam yarıda yukarı yuvarlanır, bias ortadan kalkar. Cortex-M0'da bu bir `adds` komutu kadar — 1 cycle. Ödemeye değer.

İleri seviye: round-to-even (banker's rounding), yarı yuvarlama biasını da silsen daha karmaşık. Audio için round-to-nearest yeterli; ölçü/calibrasyon için round-to-even tercih edilebilir.

### Headroom: Accumulator Taşması

N-tap FIR filtresinin worst-case kazancı `Σ|h[k]|` (katsayıların mutlak değerinin toplamı, yani L1 norm). Q15 girişin maksimum genliği 1, dolayısıyla accumulator'ın görebileceği maksimum genlik `Σ|h[k]| × 1 = Σ|h[k]|`'dir.

- **Alçak geçiren filtre** (gain ≤ 1): `Σ|h[k]|` genelde 1'in altında veya hafif üstünde. Q31 accumulator (= Q1.31, [−1, +1] aralık) yeter.
- **Yüksek geçiren / bantgeçiren / yüksek-Q rezonatör**: `Σ|h[k]|` 2, 4 hatta 16 olabilir. Q31'i taşırır.

İki seçenek:

1. **Headroom katsayılarda:** katsayıları ön-ölçekleyin (ör. `h[k] /= 4`), filtre çıkışını sonradan tekrar `<< 2` ile ölçekleyin. Bu yaklaşım çoğu mikrodenetleyici DSP işinde uygulanır.
2. **Q63 accumulator:** 64-bit signed accumulator. CMSIS-DSP'nin `arm_fir_fast_q15` varyantı Q31, `arm_fir_q15` varyantı 64-bit accumulator kullanır — performansla emniyet arasındaki takastır.

İkinci seçenek Cortex-M4'te `SMLAL` ile zarif olur ama Cortex-M0'da 64-bit toplama her MAC'i 8–10 cycle'a çıkarır. M0 için seçenek 1 daha sağlıklı.

---

## 32-Tap FIR: Tam Tur

Şimdi bütün parçaları birleştirelim. Bir alçak geçiren FIR (cutoff = 4 kHz @ 48 kHz fs, 32 tap, Hamming window) için Python ile katsayıları üretelim:

```python
import numpy as np
from scipy.signal import firwin

h = firwin(numtaps=32, cutoff=4000, fs=48000, window='hamming')
h_q15 = np.round(h * 32768).astype(np.int16)

# Sanity check
print(f"Sum h    = {np.sum(h):.4f}")        # ≈ 1.0
print(f"Sum |h|  = {np.sum(np.abs(h)):.4f}")# ≈ 1.0 (LP filter)
print(f"Max h_q15 = {h_q15.max()}")          # < 32767 ✓
print(np.array2string(h_q15, separator=', ', max_line_width=72))
```

Çıktı (örnek):

```
Sum h    = 1.0000
Sum |h|  = 1.0028
Max h_q15 = 5121

[-9, -36, -85, -154, -240, -322, -370, -340,
 -187, 138, 660, 1383, 2273, 3258, 4204, 4948,
 5121, 4948, 4204, 3258, 2273, 1383,  660,  138,
 -187, -340, -370, -322, -240, -154,  -85,  -36]
```

`Σ|h| = 1.0028` neredeyse 1 — Q31 accumulator için headroom problem değil. Filtre kodu Cortex-M0 için:

```c
#include <stdint.h>

#define N_TAPS 32

static const int16_t h[N_TAPS] = {
    -9, -36, -85, -154, -240, -322, -370, -340,
    -187, 138, 660, 1383, 2273, 3258, 4204, 4948,
    5121, 4948, 4204, 3258, 2273, 1383,  660,  138,
    -187, -340, -370, -322, -240, -154,  -85,  -36
};

static int16_t state[N_TAPS] = {0};  // delay line
static uint8_t idx = 0;

int16_t fir_q15(int16_t x) {
    state[idx] = x;

    int32_t acc = 0;
    uint8_t k = idx;
    for (uint8_t t = 0; t < N_TAPS; t++) {
        acc += (int32_t)state[k] * (int32_t)h[t];
        k = (k == 0) ? (N_TAPS - 1) : (k - 1);
    }

    // Round-to-nearest, scale back to Q15, saturate
    acc = (acc + (1 << 14)) >> 15;
    if (acc >  32767) acc =  32767;
    if (acc < -32768) acc = -32768;

    idx = (idx + 1) & (N_TAPS - 1);   // N_TAPS = 32, ring buffer
    return (int16_t)acc;
}
```

Birkaç detay:

- **Ring buffer mask** çalışsın diye `N_TAPS` 2'nin kuvveti seçildi (32 = 2⁵). Eğer 33 tap olsaydı, `idx % N_TAPS` modulo'su Cortex-M0'da `UDIV` olmadığı için çok daha pahalı olurdu (libgcc'nin `__udivsi3` rutini çağrılırdı). 2'nin kuvveti olmayan tap sayısı planlıyorsanız, durum tablosunu lineer kaydırın (memmove) ya da iki paralel buffer kullanın.
- **`(int32_t)` cast'leri** integer promotion tuzağına karşı zorunlu.
- **Saturasyon yalnızca son yazımda** yapıldı; her MAC'ten sonra değil.
- **`acc + (1 << 14)`** yuvarlama biası kaldırıyor.

`-mcpu=cortex-m0 -O2` ile derlendiğinde iç döngü:

```armasm
.L4:
        ldrsh   r6, [r3, r5, lsl #1]    @ M0'da yok — M3+ gerek
        ldrsh   r7, [r4, r5, lsl #1]
        muls    r6, r7, r6
        asrs    r6, r6, #15
        adds    r2, r2, r6
        ...
```

Aslında Cortex-M0'da `LDRSH Rd, [Rn, Rm, LSL #imm]` formu yoktur (Thumb-1 kısıtlaması). Derleyici bu durumda iki ayrı komuta böler:

```armasm
.L4:
        lsls    r0, r5, #1
        ldrsh   r6, [r3, r0]
        ldrsh   r7, [r4, r0]
        muls    r6, r7, r6
        asrs    r6, r6, #15
        adds    r2, r2, r6
        adds    r5, r5, #1
        cmp     r5, #32
        bne     .L4
```

Yani gerçek MAC iç döngüsü yaklaşık **12 cycle/tap** olur — `LSLS` (1) + iki `LDRSH` (her biri Cortex-M0'da 2 cycle) + `MULS` (1) + `ASRS` (1) + `ADDS` (1) + döngü kontrolü `ADDS + CMP + BNE` (taken dalı 3 cycle). 32-tap × 12 ≈ 384 cycle; çağrı ek yükü ile birlikte ~420 cycle. Saturasyon ve ring buffer aritmetiği ile birlikte **~450 cycle/örnek**.

48 kHz'de bu CPU'nun %45'i. Hâlâ soft-float'ın 20'de biri ama "MAC 3 cycle" teorik alt sınırından epey uzak — fark, LDR maliyeti ve döngü ek yüküdür. Daha hızlı istiyorsanız:

1. **El yazısı assembly** ile döngüyü unroll edin (4-8 kat).
2. **CMSIS-DSP `arm_fir_fast_q15`** kullanın — `block`-based çağrı tek seferde N örnek işler, ön/son ek yükünü amortize eder.
3. **DMA + double buffer** ile arka planda örnekleri toplayın, filtreyi block halinde uygulayın.

Cortex-M4'te aynı kod `smlal + asr` üçlüsüne döner, ~3 cycle/tap, 32-tap = ~110 cycle. M0'a göre 3 kat hızlı; ama M0'ın kendi bütçesi içinde rahatlıkla iş görür.

---

## CMSIS-DSP'nin Yaptığı Hilelerle Karşılaştırma

CMSIS-DSP'nin `arm_fir_q15` kaynağı (Apache 2.0 lisans, ARM-software/CMSIS-DSP repository) Cortex-M4 hedefinde 4-örnek unroll edilmiş `__SMLALD` kullanır. `SMLALD` "Signed Multiply Accumulate Long Dual" — iki 16×16 çarpımı tek komutta yapıp 64-bit accumulator'a ekler. M4'te tek cycle.

```c
// CMSIS-DSP arm_fir_q15.c — Cortex-M4 hot loop (kısaltıldı)
acc0 = __SMLALD(*pCoef++, *pSamples++, acc0);
acc1 = __SMLALD(*pCoef++, *pSamples++, acc1);
acc2 = __SMLALD(*pCoef++, *pSamples++, acc2);
acc3 = __SMLALD(*pCoef++, *pSamples++, acc3);
```

Cortex-M0 hedefinde aynı dosya farklı bir koda derlenir — naif MAC döngüsü. CMSIS-DSP burada `#if defined(ARM_MATH_DSP)` bloğu ile DSP komutlarını mevcudiyetine göre koşullu derler. Yani üst seviye API aynı, alt seviye implementation çekirdeğe göre değişir. Bu, taşınabilir DSP kodu yazmanın pratik yoludur — kendi MAC'inizi yazmak yerine CMSIS-DSP'yi kullanın; ARM ekibi onlarca mikro-mimari için optimize etmiştir.

Tek istisna: çok sıkı kontrol istediğiniz emniyet kritik kodlar. CMSIS-DSP MISRA-uyumlu değildir (Apache 2.0 lisansı altında üçüncü taraf kod). DO-178C DAL B/A altında üçüncü taraf kütüphane kullanmak için DO-330 araç/component nitelendirmesi gerekir, ki bu maliyetli olabilir.

---

## Pratik Tavsiyeler

Sahadan birkaç ders:

**1. Katsayıları derleme zamanında üretin.** Yukarıdaki Python snippet'ini build sistemine entegre edin (örn. CMake'in `add_custom_command`'i ile); `.h` dosyası `int16_t` array üretsin. Katsayıları runtime'da hesaplamak Cortex-M0'da intihar.

**2. Tap normalizasyonu yapın.** Filtrenin DC kazancı (`Σh`) 1'den farklıysa, katsayıları `h' = h / Σh` ile normalize edin; sonra istediğiniz kazancı ayrı bir post-multiply ile uygulayın. Bu, headroom yönetimini öngörülebilir kılar.

**3. State buffer'ı ring olarak tutun ve uzunluğunu 2'nin kuvveti yapın.** UDIV yok — modulo'yu maskeleme ile yapın.

**4. Saturasyon ucuz değildir, yerini seçin.** Her MAC sonrasında değil, son yazım öncesinde. Headroom analizi yapıp Q31 accumulator'ın yeterli olduğundan emin olun.

**5. Float'a "test için" geri dönmeyin.** Sabit nokta filtrenizi doğrularken Python tarafında aynı katsayılarla `scipy.signal.lfilter` ile karşılaştırın, çıktıları örnek-örnek bit-exact eşleştirin. Round-to-nearest seçtiyseniz farklar gizleyici olabilir; Python tarafında da aynı yuvarlama modunu simüle edin.

**6. Stack frame'i gözleyin.** Cortex-M0'da `state[N_TAPS]` global olmalı, stack'te değil; stack'te tutarsanız her örnekte bellek kopyalama maliyeti çıkar.

**7. WCET'inizi ölçün.** Cycle counter'lı bir M0 zor bulunur (DWT M3+'ta var). GPIO toggle + osiloskop ya da SysTick okuma ile en kötü-durum örnek başına cycle'ı doğrulayın. Soft-float kullanıyorsanız, gerçekten bazı girdilerde (denormal, overflow) işlerin **fena halde** uzayabileceğini unutmayın — Q15'in deterministik gecikmesi gerçek bir mühendislik faydasıdır.

---

## Açık Sorular

İki konu burada geçemedi, ileride ayrı yazılara değer:

- **Biquad IIR Q15'te numerik stabilite:** doğrudan form II vs transpose form vs cascade — round-off birikiminin pole konumu üzerindeki etkisi.
- **CMSIS-DSP'nin "fast" varyantları emniyet kritik kodlarda kullanılabilir mi:** Q31 accumulator'lı varyantlar headroom kaybeder; sertifikasyon için "fast"in yan etkileri.

İkisi de saha deneyimi gerektiriyor; sonraki yazıda dönerim.

---

## Kaynaklar

1. ARM, *Cortex-M0 Devices Generic User Guide* (DUI 0497A) — Thumb-1 komut seti referansı. <https://developer.arm.com/documentation/dui0497/>
2. ARM, *Cortex-M0 Technical Reference Manual* (DDI 0432) — fast/small multiplier seçenekleri. <https://developer.arm.com/documentation/ddi0432/>
3. ARM, *Cortex-M4 Devices Generic User Guide* (DUI 0553) — DSP eklentisi (SMLABB, SMLAL, SMLALD, SSAT). <https://developer.arm.com/documentation/dui0553/>
4. ARM, *Armv7-M Architecture Reference Manual* (DDI 0403) — saturating ve DSP komutlarının semantiği. <https://developer.arm.com/documentation/ddi0403/>
5. Texas Instruments, *Fixed-Point Arithmetic in MSP430 Applications* — Application Report SLAA329. <https://www.ti.com/lit/an/slaa329>
6. ARM-software, *CMSIS-DSP Library Documentation* — `arm_fir_q15`, `__SSAT`, `__SMLALD` referansları. <https://arm-software.github.io/CMSIS-DSP/latest/>
7. ARM-software, *CMSIS-DSP* GitHub repository (Apache 2.0) — `arm_fir_q15.c` kaynağı. <https://github.com/ARM-software/CMSIS-DSP>
8. Wikipedia, "Q (number format)" — Qm.n notasyonu ve sektördeki konvansiyon farkları. <https://en.wikipedia.org/wiki/Q_(number_format)>
9. Joe Bungo (ARM), *Fixed-Point Math in Embedded Software* — ARM Community blog. <https://community.arm.com/arm-community-blogs/>
10. GCC documentation, `gcc-arm-none-eabi` — `-mfloat-abi=soft` ve libgcc soft-float rutinleri (`__aeabi_fmul`, `__aeabi_fadd`). <https://gcc.gnu.org/onlinedocs/>

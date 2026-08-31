# Araştırma Notları — Gözlemci Etkisi / Halt-Mode Debug

Tarih: 2026-08-31 · Dal: `post/2026-08-31-gozlemci-etkisi-halt-mode-debug`

## Doğrulanmış olgular (birincil kaynak)

### Cortex-A9 (Zynq-7000 PS) — ARM DDI 0388B
- §10.3.1: "six breakpoints, two with context ID comparison capability, BRP4 and BRP5" ve
  "two watchpoints". DBGDIDR[31:28] WRP=0b0001 (iki WRP), [27:24] BRP=0b0101 (altı BRP),
  [23:20] Context=0b0001.
- DBGDSCR[14] = Halting debug-mode enable, [15] = Monitor debug-mode enable (reset 0).
- DBGDSCR[11] = Interrupts disable (debugger IRQ/FIQ girişlerini kapatabilir).
- DBGDSCR[10] = DbgAck: DBGACK/DBGTRIGGER çıkışlarını zorlar. "Some systems rely on
  DBGACK to determine whether the application or debugger generates the data accesses."
- §10.5.3 DBGPCSR: son dal hedefinin VA'sını örnekler; [1:0] işlemci durumunu kodlar.
  DBGDIDR[13]=1 → Cortex-A9'da DBGPCSR mevcut. → Halt etmeden istatistiksel profil.

### Cortex-M7 — ARM DDI 0489F
- Yapılandırma tablosu: reduced set = 2 watchpoint + 4 breakpoint; full set = 4 watchpoint
  + 8 breakpoint. Uygulama zamanında seçilir.
- §9.3: "The FPB does not support Flash patching. The FP_REMAP register is not implemented
  and is RAZ/WI." FPB v2 mimarisi.
- FP_CTRL reset değeri 0x10000040 (4 comparator) / 0x10000080 (8 comparator).
  Dipnot işaretleri (a/b) PDF metninde değere bitişik çıkıyor.
- DHCSR @ 0xE000EDF0, DEMCR @ 0xE000EDFC, DWT_CYCCNT @ 0xE0001004,
  DWT_CPICNT/EXCCNT/SLEEPCNT/LSUCNT sırayla 0xE0001008..0xE0001014.
- ITM_STIM0–STIM31 @ 0xE0000000. TRCENA (DEMCR) önce açılmalı.
- DWT comparator kullanımları: hardware watchpoint, ETM trigger, PC sampler event trigger,
  data address sampler event trigger.

### ARM erratum 702596 (Cortex-M7 SDEN v8.0, 28-Nov-2018)
- "Single stepping Cortex-M7 enters pending exception handler", Programmer Cat C.
- Present in r0p1, fixed in r0p2. Tam workaround yok; debugger C_MASKINTS'i mümkün olan
  en erken anda set edip temizlememeli.

### OpenOCD (src/target/cortex_m.c)
- `cortex_m->fp_num_code = ((fpcr >> 8) & 0x70) | ((fpcr >> 4) & 0xF);`
  `cortex_m->fp_num_lit = (fpcr >> 8) & 0xF;`
- Comparator tükendiğinde: "Can not find free FPB Comparator!"
- Yazılım breakpoint'i BKPT opcode'unu `target_write_memory` ile belleğe yazar; orijinal
  komut `breakpoint->orig_instr` içinde saklanır.

### Semihosting
- SEGGER KB: BKPT 0xAB (ARMv6-M/v7-M) ya da SVC; "The target is halted for the duration of
  the semihosting operation". Debugger yoksa HardFault.
- Sysprogs ölçümü (STM32): ITM'e doğrudan yazma 2.775 µs; `printf` + FastSemihosting
  12.525 µs; doğrudan FastSemihosting kanal çağrısı 2.985 µs.

### STM32 DBGMCU
- DBGMCU APBx freeze register'ları: DBG_IWDG_STOP, DBG_WWDG_STOP, DBG_TIMx_STOP, DBG_RTC_STOP.
- Yazmadan önce DBGMCU saatinin açılması gerekiyor (topluluk kayıtlarında sık hata).

## Yerel deney (bu makinede yapıldı)
- arm-none-eabi-gcc 15.2.0, `-mcpu=cortex-m4 -mthumb -O2 -ffreestanding`.
- `dbgcap.c` → FP_CTRL/DWT_CTRL/DHCSR okuyan bütçe sayacı; disassembly alındı.
  FP_CTRL çözümlemem OpenOCD'nin ifadesiyle bit-bit aynı sonucu veriyor.
- `logcost.c` → `itm_putc` 11 komut / halt yok; `sh_write0` 4 komut ama `bkpt 0x00ab`
  çekirdeği durduruyor. "Kısa fonksiyon pahalı fonksiyondur" örneği.

## Doğrulanamayanlar (yazıya girmedi)
- Zynq-7000 ETB kapasitesinin tam sayısı (UG585'in erişilebilir bir kopyası bulunamadı).
  Yazıda sayı verilmedi, yalnızca "on-chip tampon dairesel ve küçüktür" niteliği kullanıldı.

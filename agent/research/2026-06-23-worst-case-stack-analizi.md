# Worst-Case Stack Analizi — Araştırma Notları

## Çekirdek tezler

- Yığın taşması diğer bug'lardan farklıdır: **sessizdir, gecikmelidir, başka veriyi
  bozar**. Hata, sebebinden uzakta tetiklenir.
- Statik (compile-time) ve dinamik (runtime) analizler birbirini tamamlar; hiçbiri
  tek başına yetmez.
- Donanım koruması (MPU stack guard, ARMv8-M PSPLIM/MSPLIM) "son savunma hattı"dır,
  birinci hat değildir.

## Bookout v. Toyota (2013) — somut motivasyon

- Michael Barr tanıklığı: 2005 Camry L4 sistem yığını **4096 bayt**.
- Toyota NASA'ya **%41** doluluk bildirmiş; gerçek **%94**.
- OSEK OS değişkenleri yığının üstüne komşu yerleştirilmiş → taşma kritik
  değişkenleri bozabiliyor.
- MISRA-C ihlali olan recursion bulunmuş.
- Donanım bellek koruması yok → taşma sessizce başka veriyi yiyor.
- Sonuç: jüri Toyota'yı sorumlu buldu (Bookout v. Toyota, Oklahoma, 2013).

Kaynaklar:
- Barr trial slides: https://archive.org/stream/BookoutvToyotaMichaelBarrTrialSlides/BarrTrialSlides_FINAL_SCRUBBED_djvu.txt
- EDN: https://www.edn.com/toyotas-killer-firmware-bad-design-and-its-consequences/
- Safety Research: https://safetyresearch.net/toyota-unintended-acceleration-and-the-big-bowl-of-spaghetti-code/

## GCC -fstack-usage

- Her derleme birimi için `.su` dosyası üretir.
- Format: `file:line:col:function    bytes    qualifier`
- Qualifier: `static`, `dynamic`, `dynamic,bounded`
- `static`: kesin
- `dynamic,bounded`: VLA var ama sınırı biliniyor → güvenli üst sınır
- `dynamic`: sınırsız (örn. `alloca` ile keyfi boyut) → analiz tehlikeli

## GCC -fcallgraph-info=su,da (GCC 10+)

- Her CU için `.ci` dosyası (VCG formatında) çağrı grafiği üretir.
- `su`: stack-usage decoration ekler (eq. -fstack-usage)
- `da`: dinamik tahsis bilgisi ekler
- ccache cache'lemez (issue #1400).
- Araçlar bu dosyaları toplayıp toplam çağrı grafiğini oluşturup max-flow hesaplar.

## Açık kaynak araçlar

- HBehrens/puncover — web UI, ELF + .su parse eder, callgraph görselleştirir
- simonjwright/stack_usage — -fcallgraph-info temelli
- ttsiodras/checkStackUsage — .su + custom callgraph
- sharkfox/stack-usage — Python

## Ticari (DO-178C qualified)

- AbsInt StackAnalyzer — Airbus A380'de kullanılıyor
- GNATstack (AdaCore) — Ada + C
- Rapita RapiTest (stack painting)

## Sınırlar / "neden zor"

1. **Function pointer (indirect call)**: derleyici hedefi bilmez. Çözüm: tip-imzaya
   göre olası hedef kümesi (over-approx) ya da manuel tablo verme.
2. **Recursion**: çağrı grafiği döngülü → sonsuz. MISRA-C 2012 Rule 17.2 yasak.
   Çözüm: ya recursion'ı kaldır ya da çağrı derinliği için sertifika ver.
3. **Assembly**: derleyici stack frame'i bilmez. Manuel `# stack-usage: N` direktifi
   ya da elle ölçüm.
4. **longjmp / setjmp**: kontrol akışını kırar.
5. **ISR nesting**: en kötü iç içe ISR senaryosu eklenmeli.
6. **Compiler optimizasyon değişikliği**: -O0 → -O2 stack kullanımı **artabilir**
   (inlining, sıralama) ya da azalabilir. Her config için analiz tekrar.

## Stack painting (watermark)

- Yığını 0xDEADBEEF gibi pattern ile doldur.
- Görevi çalıştır.
- Sonra tara: en alt değişmemiş hücre yüksek su markası.
- FreeRTOS: `uxTaskGetStackHighWaterMark()` bunu yapar.
- Avantaj: gerçek çıkışta gerçek değer.
- Dezavantaj: **worst-case değil, observed**. Test kapsamadığın yol her şeyi
  değiştirebilir.

## ARMv8-M PSPLIM/MSPLIM (Cortex-M23/M33/M35P/M55)

- 32-bit register, alt sınır adresi.
- `SP == LIM` veya SP'yi LIM altına düşürecek `PUSH`/`STMDB`/`SUB SP` → UsageFault.
- UFSR.STKOF (bit 4) set olur (sticky).
- Padding (16 bayt) önerilir: exception entry sırasında çekirdek otomatik PUSH
  yapar, sınır yetersizse LOCKUP olur.
- Per-task PSPLIM swap context-switch'te → her görev kendi sınırı.
- FreeRTOS Cortex-M33 port'u destekler.

ARMv7-M (M0/M3/M4/M7): donanım PSPLIM yok. Çözüm: MPU region + canary + painting.

## MPU stack guard

- Yığının altına (büyüme yönü aşağı ise) yazma izni olmayan MPU bölgesi koy.
- Taşma → MemManage fault.
- FreeRTOS-MPU port'unda standart.
- Cortex-M4/M7'de elden geliyor.

## DO-178C / memory margin

- 6.3.4 source code analysis: stack analysis architectural safety req'in parçası.
- SAS (Software Accomplishment Summary): timing & memory margin beyan edilir.
- Tool qualification: AbsInt StackAnalyzer için DO-330 TQL kit'i mevcut.
- "Margin" tipik %25-50 (sektör pratiği, standart sayı yok).

## Yapılacak figür

İçinden geçecek somut kod örneği:
- main → process_packet → parse_header → checksum
- Her birinin .su'da bayt değeri
- WCS hesabı tablosu
- Sonra function pointer eklenince ne kaybediliyor

## Kaynak listesi (ham)

1. https://embeddedartistry.com/blog/2020/08/17/three-gcc-flags-for-analyzing-memory-usage/
2. https://gcc.gnu.org/onlinedocs/gcc/Developer-Options.html (-fcallgraph-info)
3. https://github.com/HBehrens/puncover
4. https://github.com/simonjwright/stack_usage
5. https://github.com/ttsiodras/checkStackUsage
6. https://www.absint.com/stackanalyzer/index.htm
7. https://docs.adacore.com/live/wave/gnatstack/html/gnatstack_ug/Getting_Started_with_GNATstack.html
8. https://interrupt.memfault.com/blog/using-psp-msp-limit-registers-for-stack-overflow
9. https://interrupt.memfault.com/blog/measuring-stack-usage
10. https://www.state-machine.com/are-we-shooting-ourselves-in-the-foot-with-stack-overflow
11. https://www.edn.com/toyotas-killer-firmware-bad-design-and-its-consequences/
12. https://safetyresearch.net/toyota-unintended-acceleration-and-the-big-bowl-of-spaghetti-code/
13. https://archive.org/details/BookoutvToyotaMichaelBarrTrialSlides (Barr slides)
14. https://www.beningo.com/3-ways-to-perform-a-worst-case-stack-analysis/
15. https://www.rapitasystems.com/blog/how-measure-stack-usage-through-stack-painting-rapitest

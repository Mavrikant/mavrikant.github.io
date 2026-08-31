---
title: "Debugger Takınca Bug Kayboluyor: Gömülü Sistemlerde Gözlemci Etkisi"
subtitle: "The Observer Effect in Embedded Debugging: Halt-Mode Debug, Breakpoint Budgets and Non-Invasive Tracing"
background: "/img/posts/2.webp"
date: '2026-08-31 09:00:00'
layout: post
lang: tr
mermaid: true
categories: [araclar]
tags: [gomulu-sistemler, araclar]
---

Gömülü tarafta çalışan herkesin sicilinde en az bir tane vardır: sahada tekrarlanan, log'da izi olan, ama debugger'ı takıp breakpoint koyduğunuz anda ortadan kaybolan bir hata. Ya da tam tersi — kod sahada aylardır sorunsuz koşarken, siz breakpoint'te beklerken kart aniden yeniden başlar. İkisi de aynı yanılgının iki yüzü: **debugger'ın sistemi durdurduğu varsayımı.**

Debugger sistemi durdurmaz. Yalnızca **çekirdeği** durdurur. Zamanlayıcılar sayar, DMA transfer eder, watchdog geri sayar, ikinci çekirdek koşmaya devam eder, UART FIFO'su taşar, motor dönmeye devam eder. Siz kaynak kodun 412. satırında durup değişkenlere bakarken, gözlemlediğiniz sistem artık ölçmek istediğiniz sistem değildir.

Bu yazıda gömülü hata ayıklamanın gözlemci etkisini donanım seviyesinde ele alacağım: halt-mode debug gerçekte neyi durdurur, donanım breakpoint bütçeniz neden bu kadar küçüktür, tek adım atmak (single step) neden en yalancı araçtır, `printf` neden sandığınızın binlerce katı pahalıdır ve sistemi durdurmadan gözlemlemenin hangi yolları var. Yazı boyunca kullandığım sayıların hepsi ARM'ın teknik referans kılavuzlarından; sonda paylaştığım assembly çıktıları ise bu yazıyı yazarken kendi makinemde `arm-none-eabi-gcc 15.2.0` ile üretildi.

---

## Halt Ne Demek: Duran Çekirdek, Durmayan Sistem

ARM'ın hata ayıklama mimarisi iki kipe ayrılır ve bu ayrım her şeyin temelidir.

**Halting debug-mode** (durduran kip): bir hata ayıklama olayı — breakpoint, watchpoint, harici tetik — geldiğinde işlemci normal komut akışını bırakır ve **debug state** denen özel bir duruma girer. Bu durumda çekirdek uygulama komutu yürütmez; onun yerine debug portu üzerinden gelen komutları yürütür. Debugger'ınızın "register'ları oku, belleği yaz, devam et" dediği yer burasıdır.

**Monitor debug-mode** (izleyen kip): aynı olay çekirdeği durdurmak yerine bir istisna (exception) tetikler. Hedefte koşan bir debug monitörü bu istisnayı yakalar, iletişimi kendisi yürütür. Çekirdek teknik olarak koşmaya devam eder — kesmeler işlenebilir, kritik döngüler dönebilir.

Cortex-A9 üzerinde bu iki kip DBGDSCR register'ının iki ayrı bitiyle açılır: bit [14] halting debug-mode enable, bit [15] monitor debug-mode enable, ikisinin de reset değeri 0'dır ve halting kipi açıksa o kazanır. Cortex-M tarafında karşılığı DHCSR (`0xE000EDF0`) register'ındaki `C_DEBUGEN` / `C_HALT` bitleri ile DEMCR (`0xE000EDFC`) içindeki monitör kipi kontrolüdür.

Pratikte ne olur? Neredeyse tüm JTAG/SWD tabanlı akışlar halting kipini kullanır. Yani `break`, `step`, `continue` yazdığınız her an çekirdek debug state'e girip çıkar. Ve **debug state yalnızca çekirdeği kapsar.**

<div class="mermaid">
flowchart TD
    BP[Breakpoint tetiklendi]
    CORE[Çekirdek - debug state, komut yürütmüyor]
    T[Zamanlayıcı - saymaya devam]
    D[DMA denetleyicisi - transfer devam]
    W[Watchdog - geri sayım devam]
    C2[İkinci çekirdek - koşmaya devam]
    P[UART ve CAN FIFO - veri gelmeye devam]
    PHY[Fiziksel sistem - motor, valf, ısıtıcı]
    BP --> CORE
    BP --> T
    BP --> D
    BP --> W
    BP --> C2
    BP --> P
    BP --> PHY
</div>

Bu tablonun en sinsi satırı watchdog'dur. Breakpoint'te otuz saniye durup değişken incelediniz; watchdog 1 saniyelik penceresini çoktan aşmıştır ve siz `continue` dediğiniz anda — ya da daha kötüsü, siz düşünürken — kart reset atar. Bunu ilk yaşadığınızda debugger'ın bozuk olduğunu düşünürsünüz.

### Donanımın sunduğu tek çıkış yolu: DBGACK

ARM bu sorunu görmüş ve çekirdeğin debug state'te olduğunu dış dünyaya bildiren bir sinyal tanımlamış. Cortex-A9'da DBGDSCR bit [10] `DbgAck` bitidir; set edildiğinde DBGACK ve DBGTRIGGER çıkışları, işlemcinin gerçek durumundan bağımsız olarak yüksek zorlanır. TRM bunun sebebini açıkça yazar: bazı sistemler veri erişimlerini uygulamanın mı yoksa debugger'ın mı ürettiğini anlamak için DBGACK'e bakar.

Ama DBGACK yalnızca bir sinyaldir; onu dinleyip zamanlayıcıyı durduran mantığı **SoC tasarımcısının** koyması gerekir. Ve buradaki ayrım üreticiden üreticiye değişir.

ST'nin STM32 ailesinde bu iş DBGMCU bloğuna verilmiştir: `DBGMCU` içindeki APB freeze register'larında `DBG_IWDG_STOP`, `DBG_WWDG_STOP`, `DBG_TIMx_STOP`, `DBG_RTC_STOP` gibi bitler vardır. İlgili biti set ettiğinizde çekirdek halt olduğunda o çevre birimi de sayımı durdurur. Topluluk forumlarında bu bitlerin "çalışmadığına" dair sürekli soru gelir; sebebi neredeyse her seferinde aynıdır — DBGMCU bloğunun saati açılmadan register'a yazılmaya çalışılmıştır.

Bu tür bir freeze mekanizmasının olmadığı ya da yalnızca bazı çevre birimlerini kapsadığı platformlarda tek seçeneğiniz kodu buna göre yazmaktır. Pratik kural: **watchdog besleme mantığınızın debug derlemesinde farklı davranması gerekiyorsa, bunu derleme zamanında ve açıkça yapın** — çalışma zamanında "debugger var mı" diye bakan koşul, sahaya çıkacak ikili dosyada başlı başına bir risktir.

Fiziksel dünya için ise hiçbir freeze biti yoktur. Motor sürücüsünün PWM çıkışı, ısıtıcının rölesi, hidrolik valfi — çekirdek halt olduğunda son yazılan durumu korurlar. Güç elektroniği ya da hareketli parça sürüyorsanız, breakpoint koymak donanımı gerçekten yakabilir. Bu tür sistemlerde debug oturumundan önce çıkışları güvenli duruma çeken bir donanım interlock'u, opsiyonel bir konfor değil zorunluluktur.

---

## Breakpoint Bütçeniz Sandığınızdan Küçük

Gömülü hata ayıklamada ikinci büyük yanılgı, breakpoint'in bedava olduğudur. Masaüstünde öyledir; gömülüde değil.

İki farklı mekanizma var:

**Yazılım breakpoint'i.** Debugger, durmak istediğiniz adresteki komutu bellekten okuyup saklar, yerine bir `BKPT` komutu yazar. Çekirdek oraya geldiğinde tuzağa düşer. OpenOCD'nin `cortex_m.c` dosyasında bu tam olarak böyle yapılır: `BKPT` opcode'u `target_write_memory` ile hedefe yazılır, orijinal komut `breakpoint->orig_instr` alanında tutulur ve breakpoint kaldırılırken geri yazılır.

**Donanım breakpoint'i.** Çekirdeğin içindeki karşılaştırıcı birimine bir adres yüklersiniz; komut getirme adresi eşleştiğinde çekirdek durur. Bellek hiç değişmez.

Yazılım breakpoint'i sayıca sınırsızdır ama iki durumda kullanılamaz. Birincisi, kod flash'ta koşuyorsa: flash'a tek bir kelime yazmak için sayfayı silmek gerekir, debugger bunu her breakpoint için yapamaz. İkincisi, kod bütünlüğünü kendi kontrol eden sistemlerde: kod bölgesi üzerinden CRC hesaplayan bir power-on self test, yazılım breakpoint'i konmuş bir görüntüde **doğru şekilde** başarısız olur. Emniyet kritik tarafta bu daha derin bir soruna işaret eder — belleği değiştirdiğiniz anda test ettiğiniz nesne, sertifikasyona sunacağınız nesne olmaktan çıkar.

Geriye donanım breakpoint'i kalır ve işte orada sayılar acımasızdır.

### Gerçek sayılar

**Cortex-M7.** FPB (Flash Patch and Breakpoint) birimi, uygulama zamanında yapılandırılır: TRM'nin ifadesiyle indirgenmiş yapılandırma **2 watchpoint + 4 breakpoint**, tam yapılandırma **4 watchpoint + 8 breakpoint** karşılaştırıcısı sunar. Ayrıca Cortex-M7'nin FPB'si version 2 mimarisini uygular ve TRM açıkça yazar: flash patch desteklenmez, `FP_REMAP` register'ı yoktur, RAZ/WI'dir. Yani eski Cortex-M3/M4'te mümkün olan "flash'taki komutu RAM'den yamalamak" numarası burada yok.

**Cortex-A9** — yani Zynq-7000'in işlemci sistemi. TRM'nin 10.3.1 bölümü net: altı breakpoint, bunlardan ikisi (BRP4 ve BRP5) context ID karşılaştırma yetenekli, ve **iki watchpoint**. Bu sayılar DBGDIDR register'ından okunabilir: bit [31:28] WRP alanı `0b0001` okur (iki watchpoint register çifti), bit [27:24] BRP alanı `0b0101` okur (altı breakpoint register çifti).

İki watchpoint. Bir Zynq üzerinde koşan Linux'ta ya da bare-metal uygulamada, "şu değişken ne zaman bozuluyor" sorusunu aynı anda ancak iki adres için sorabilirsiniz.

### Kendi bütçenizi sayan program

Bu sayıları belgeden okumak yerine hedeften okumak her zaman daha iyidir; özellikle silikon üreticisi çekirdeği indirgenmiş yapılandırmayla almışsa. Cortex-M için gereken tek şey üç register:

```c
#define FP_CTRL   (*(volatile uint32_t *)0xE0002000UL)
#define DWT_CTRL  (*(volatile uint32_t *)0xE0001000UL)
#define DHCSR     (*(volatile uint32_t *)0xE000EDF0UL)

typedef struct {
    uint8_t fpb_rev;           /* FPB mimari surumu */
    uint8_t num_code;          /* komut karsilastiricisi sayisi */
    uint8_t num_lit;           /* literal karsilastiricisi sayisi */
    uint8_t num_watch;         /* DWT karsilastiricisi sayisi */
    uint8_t debugger_attached; /* DHCSR.C_DEBUGEN */
} dbg_caps_t;

void dbg_probe(dbg_caps_t *c)
{
    uint32_t fp  = FP_CTRL;
    uint32_t dwt = DWT_CTRL;

    c->fpb_rev  = (uint8_t)((fp >> 28) & 0xF);
    /* NUM_CODE parcali: ust bitler [14:12], alt bitler [7:4] */
    c->num_code = (uint8_t)((((fp >> 12) & 0x7) << 4) | ((fp >> 4) & 0xF));
    c->num_lit  = (uint8_t)((fp >> 8) & 0xF);
    c->num_watch = (uint8_t)((dwt >> 28) & 0xF);
    c->debugger_attached = (uint8_t)(DHCSR & 0x1U);
}
```

`NUM_CODE` alanının register içinde ikiye bölünmüş olması, ARMv7-M'in geriye dönük uyumluluk borcudur ve elle kod yazarken kolayca yanlış çözülür. Doğru çözdüğümü, OpenOCD'nin aynı işi yapan satırıyla karşılaştırarak doğruladım:

```c
/* OpenOCD, src/target/cortex_m.c */
cortex_m->fp_num_code = ((fpcr >> 8) & 0x70) | ((fpcr >> 4) & 0xF);
cortex_m->fp_num_lit  = (fpcr >> 8) & 0xF;
```

İki ifade bit-bit aynı sonucu verir — `(fpcr >> 8) & 0x70`, `((fpcr >> 12) & 0x7) << 4` ile özdeştir.

Yukarıdaki fonksiyonu `-mcpu=cortex-m4 -mthumb -O2` ile derleyip disassemble ettiğimde çıkan kod, bu işin ne kadar ucuz olduğunu gösteriyor:

```text
00000000 <dbg_probe>:
   0:	4b12      	ldr	r3, [pc, #72]	@ (4c <dbg_probe+0x4c>)
   2:	f8df c04c 	ldr.w	ip, [pc, #76]	@ 50 <dbg_probe+0x50>
   6:	681b      	ldr	r3, [r3, #0]
   8:	f8dc c000 	ldr.w	ip, [ip]
   c:	0f19      	lsrs	r1, r3, #28
   e:	2200      	movs	r2, #0
  10:	f361 0207 	bfi	r2, r1, #0, #8
  14:	0a19      	lsrs	r1, r3, #8
  16:	b500      	push	{lr}
  18:	f001 0170 	and.w	r1, r1, #112	@ 0x70
  1c:	f3c3 1e03 	ubfx	lr, r3, #4, #4
  20:	ea41 010e 	orr.w	r1, r1, lr
  24:	f3c3 2303 	ubfx	r3, r3, #8, #4
  28:	f361 220f 	bfi	r2, r1, #8, #8
  2c:	f363 4217 	bfi	r2, r3, #16, #8
  30:	ea4f 7c1c 	mov.w	ip, ip, lsr #28
  34:	f36c 621f 	bfi	r2, ip, #24, #8
  38:	f04f 23e0 	mov.w	r3, #3758153728	@ 0xe000e000
  3c:	6002      	str	r2, [r0, #0]
  3e:	f8d3 3df0 	ldr.w	r3, [r3, #3568]	@ 0xdf0
  42:	f003 0301 	and.w	r3, r3, #1
  46:	7103      	strb	r3, [r0, #4]
  48:	bd00      	pop	{pc}
  4a:	bf00      	nop
  4c:	e0002000 	.word	0xe0002000
  50:	e0001000 	.word	0xe0001000
```

Yirmi üç komut. Sondaki iki `.word` sabiti FPB ve DWT taban adresleridir; `0x38` ve `0x3e` satırlarındaki `0xe000e000 + 0xdf0` ise DHCSR'nin ta kendisi. Bunu boot sırasında bir kez çağırıp sonucu log'a basmak, "acaba kaç breakpoint'im var" tahminiyle uğraşmaktan çok daha ucuz.

Son satırlarda gizli bir bonus da var: `DHCSR & 1` ifadesi `C_DEBUGEN` bitini okur ve size **debugger bağlı mı** sorusunun cevabını verir. Bu bilgi, birazdan geleceğimiz semihosting tuzağı için hayati.

### Bütçe dolduğunda ne oluyor

Cevap: sessiz bir hata değil, ama kolayca gözden kaçan bir hata. OpenOCD boştaki karşılaştırıcıyı bulamadığında şu mesajı verir:

```text
Can not find free FPB Comparator!
```

GDB tarafında bu genellikle `Cannot insert breakpoint N` olarak görünür ve — kritik nokta — **komut satırında bunu `continue` çıktısının içinde kaçırmak çok kolaydır.** Beş breakpoint koyup dördünün gerçekten kurulduğu bir oturumda, beşincinin hiç tetiklenmemesini "kod oraya girmiyor" diye yorumlarsınız. Yanlış sonuç çıkarmanın en verimli yollarından biri budur.

Pratik alışkanlık: bir oturumda breakpoint listesini `info breakpoints` ile aralıklı olarak kontrol edin, ve "buraya hiç girmiyor" sonucuna varmadan önce o breakpoint'in gerçekten kurulu olduğunu doğrulayın.

---

## Single Step: En Yalancı Araç

Tek adım atmak, gözlemci etkisinin en yoğun olduğu yerdir. Sebebi basit: her adım arasında çekirdek debug state'e girip çıkar, yani her adım aralarında **binlerce çevrim** geçer. Kesme yoğun bir sistemde bu, adım attığınız kodun gördüğü dünyayı tamamen değiştirir.

ARM bu sorunun farkında ve bir kaçış kapısı bırakmış: DHCSR içindeki `C_MASKINTS` biti. Set edildiğinde adımlama sırasında kesmelerin alınmasını engeller. Mimari bu bitin yazılmasına da bir koşul koyar — değeri değiştirilirken çekirdeğin zaten halt olmuş olması ve aynı yazmada `C_HALT` bitine de 1 yazılması gerekir; aksi halde davranış UNPREDICTABLE'dır.

Cortex-A tarafında benzer bir mekanizma DBGDSCR bit [11] "interrupts disable" bitidir; set edildiğinde IRQ ve FIQ giriş sinyalleri devre dışı kalır. TRM bunun tipik kullanımını bile örnekliyor: debugger, hedefte bir işletim sistemi servis rutini çalıştırırken araya kesme girmesini istemez.

### Ve sonra silikon araya girer

Buraya kadar her şey temiz. Ama Cortex-M7'nin erken silikon revizyonlarında bu mekanizma **çalışmıyor**. ARM'ın Cortex-M7 Software Developer Errata Notice belgesindeki 702596 numaralı erratum, başlığıyla birlikte şöyle: *"Single stepping Cortex-M7 enters pending exception handler."* Programmer Cat C olarak sınıflanmış, r0p1'de mevcut, r0p2'de düzeltilmiş.

Erratum'un mekanizması şu: çekirdek debug state'e girdiğinde ya da debug state'teyken etkin bir kesme pending hale gelirse, ve o sırada `C_MASKINTS` herhangi bir an sıfırsa, çekirdek debug state'ten çıkarken maskelenmesi gereken o kesme **yine de alınabilir**. Belgenin "Implications" bölümü sonucu net söylüyor: debugger, `C_MASKINTS` değerinden bağımsız olarak, adımlama sırasında pending bir kesmenin işleyicisine girecektir.

Tam bir workaround yok. ARM'ın önerdiği azaltma yolları debugger'a düşüyor: `C_MASKINTS`'i mümkün olan en erken anda set etmek, temizlememek, ve yalnızca kullanıcı açıkça isterse debug state'ten çıkarken temizlemek. J-Link bu davranışı sürüm V6.10b'den beri uyguluyor.

Bunu bilmeden STM32F7 ailesinde adımlama yapan bir mühendisin gördüğü tablo şudur: `step` diyorsunuz, imleç bir alt satıra gitmek yerine kesme işleyicisinin içine atlıyor. İnternet forumlarında bu, yıllarca "debugger bozuk" ve "derleyici satır bilgisini yanlış üretiyor" başlıklarıyla tartışıldı. Gerçek cevap ARM'ın errata belgesinde, sayfa 32'de duruyordu.

Buradaki genel ders şu: **hata ayıklama donanımı da donanımdır ve onun da errata'sı vardır.** Yeni bir platformda tuhaf debugger davranışıyla karşılaştığınızda, çekirdeğin errata notice'ını okumak çoğu zaman en kısa yoldur — ve çekirdek revizyonunu (`r0p1` gibi) hedeften okuyup log'lamak, o okumayı anlamlı kılan tek bilgidir.

---

## `printf`'in Faturası: Semihosting

Şimdi gözlemci etkisinin en yaygın ve en az fark edilen kaynağına gelelim.

Semihosting, hedefteki kodun dosya açma, yazma, konsola basma gibi işleri host makinedeki debugger'a devretmesini sağlayan bir sözleşmedir. Mekanizması şudur: hedef, `r0` register'ına bir işlem numarası, `r1`'e parametre bloğunun adresini koyar ve ARMv6-M/ARMv7-M'de `BKPT 0xAB` komutunu yürütür. Bu bir breakpoint'tir — **çekirdek durur.** Debugger, `r0`'ı okuyarak hangi işlemin istendiğini anlar, işi host tarafında yapar, sonucu `r0`'a yazar ve çekirdeği devam ettirir. SEGGER'ın belgelendirmesinin ifadesiyle: hedef, semihosting işlemi süresince halt halindedir.

Bu maliyetin ne kadar görünmez olduğunu göstermek için iki logging yolunu aynı bayrakla derleyip disassemble ettim. Birincisi ITM stimulus portuna doğrudan bayt yazan klasik yol; ikincisi semihosting `SYS_WRITE0`:

```c
/* Yol 1: ITM stimulus portuna tek bayt */
void itm_putc(char c)
{
    if ((ITM_TCR & 1U) && (ITM_TER & 1U)) {
        while (ITM_STIM0 == 0U) { }
        *(volatile char *)0xE0000000UL = c;
    }
}

/* Yol 2: semihosting SYS_WRITE0 (islem numarasi 0x04) */
void sh_write0(const char *s)
{
    __asm volatile (
        "mov r0, #4      \n"
        "mov r1, %0      \n"
        "bkpt #0xAB      \n"
        : : "r" (s) : "r0", "r1", "memory");
}
```

`-mcpu=cortex-m4 -mthumb -O2` ile derlenmiş hali:

```text
00000000 <itm_putc>:
   0:	f04f 4360 	mov.w	r3, #3758096384	@ 0xe0000000
   4:	f8d3 2e80 	ldr.w	r2, [r3, #3712]	@ 0xe80
   8:	07d1      	lsls	r1, r2, #31
   a:	d507      	bpl.n	1c <itm_putc+0x1c>
   c:	f8d3 2e00 	ldr.w	r2, [r3, #3584]	@ 0xe00
  10:	07d2      	lsls	r2, r2, #31
  12:	d503      	bpl.n	1c <itm_putc+0x1c>
  14:	681a      	ldr	r2, [r3, #0]
  16:	2a00      	cmp	r2, #0
  18:	d0fc      	beq.n	14 <itm_putc+0x14>
  1a:	7018      	strb	r0, [r3, #0]
  1c:	4770      	bx	lr

00000020 <sh_write0>:
  20:	4603      	mov	r3, r0
  22:	f04f 0004 	mov.w	r0, #4
  26:	4619      	mov	r1, r3
  28:	beab      	bkpt	0x00ab
  2a:	4770      	bx	lr
```

`itm_putc` içindeki `0xe80` ve `0xe00` ofsetleri `ITM_TCR` ve `ITM_TER` register'ları; `0x1a` satırındaki `strb r0, [r3, #0]` ise stimulus portuna yazan tek komut. `0x14`–`0x18` arasındaki üç komutluk döngü, FIFO'nun boşalmasını bekler.

Statik olarak bakıldığında semihosting kazanıyor: dört komut, ITM yolunun on bir komutuna karşı. Kod boyutuna bakarak seçim yapan biri semihosting'i seçer.

Ama `bkpt 0x00ab` sıradan bir komut değil. O tek komut çekirdeği durdurur, debug probe'unun JTAG/SWD üzerinden bir gidiş-dönüş yapmasını, host tarafında bir dosya yazma işleminin tamamlanmasını ve ardından çekirdeğin yeniden başlatılmasını bekler. Maliyet birimi çevrim değil, **probe gidiş-dönüşüdür.**

Ölçülü bir karşılaştırma için Sysprogs'un STM32 üzerinde yaptığı testler iyi bir referans: aynı dört karakterlik dizgiyi ITM'e doğrudan yazmak 2.775 µs sürerken, `printf` üzerinden FastSemihosting ile yazmak 12.525 µs sürüyor. Buradaki FastSemihosting'in klasik semihosting değil, tam olarak bu maliyeti azaltmak için tasarlanmış optimize bir kanal olduğunu vurgulayayım — ve **optimize edilmiş hali bile** doğrudan ITM yazmanın dört buçuk katı. Klasik `BKPT 0xAB` yolunda her çağrının kendi halt/resume döngüsünü ödediğini düşünürseniz aradaki mesafe büyür.

1 kHz'lik bir kontrol döngüsünde her çevrimin bütçesi 1000 µs'dir. Döngü içine konan tek bir semihosting `printf`, o bütçenin ölçülebilir bir kısmını — bazı yapılandırmalarda tamamını — yiyebilir. "Log ekleyince zamanlama bozuldu" cümlesinin arkasında neredeyse her zaman bu vardır.

### İkinci tuzak: debugger yokken

Semihosting'in daha kötü bir yan etkisi var. `BKPT 0xAB` komutunu yakalayacak bir debugger yoksa ne olur? Cortex-M'de yakalanmamış bir breakpoint HardFault üretir. SEGGER'ın belgesi bunu doğrudan söylüyor: debugger yoksa CPU çökebilir.

Yani semihosting `printf`'i olan bir ikili dosya, laboratuvarda kusursuz çalışıp sahada ilk log satırında HardFault ile durabilir. Bunu üretim yapılandırmasından ayıklamayı unutmak, gömülü dünyanın klasik sahaya kaçan hatalarından biridir.

Korunma yolu, biraz önce ölçtüğümüz `DHCSR & 1` kontrolüdür: debugger bağlı değilse semihosting çağrısını hiç yapmayın. Ama gerçek çözüm, semihosting'i logging için hiç kullanmamaktır.

---

## Sistemi Durdurmadan Gözlemlemek

Buraya kadarki her şey aynı sonuca çıkıyor: **halt etmek pahalı bir gözlem yöntemidir.** Neyse ki CoreSight mimarisi, çekirdeği durdurmayan bir gözlem katmanı da içeriyor ve bu katman sahada fena halde az kullanılıyor.

### DWT: ölçen, durdurmayan birim

Data Watchpoint and Trace birimi çoğu mühendisin aklında yalnızca watchpoint kaynağı olarak yer eder. Oysa Cortex-M7 TRM'ye göre tam bir DWT'nin dört karşılaştırıcısı dört farklı şekilde yapılandırılabilir: donanım watchpoint'i, **ETM tetikleyicisi**, **PC örnekleme olay tetikleyicisi** ve **veri adresi örnekleme olay tetikleyicisi.**

Yani aynı karşılaştırıcıyı "bu adrese yazılınca dur" yerine "bu adrese yazılınca iz kaydına bir olay bas" diye programlayabilirsiniz. Sistem koşmaya devam eder, siz olayları toplarsınız.

DWT ayrıca ücretsiz bir ölçüm laboratuvarı barındırır. Sayaçlar ve adresleri:

| Register | Adres | Ne sayar |
|---|---|---|
| `DWT_CYCCNT` | `0xE0001004` | Çevrim sayısı |
| `DWT_CPICNT` | `0xE0001008` | İlk çevrim hariç tüm komut çevrimleri |
| `DWT_EXCCNT` | `0xE000100C` | Kesme giriş/çıkış ek yükü |
| `DWT_SLEEPCNT` | `0xE0001010` | Uyku çevrimleri |
| `DWT_LSUCNT` | `0xE0001014` | Load/store birimi işlemleri |

`CYCCNT`, gömülü zamanlama ölçümünün en dürüst aracıdır: iki okuma arasındaki fark, ölçüm için harcadığınız birkaç çevrim dışında hiçbir bozulma içermez. "Bu fonksiyon ne kadar sürüyor" sorusunu breakpoint'le değil `CYCCNT` farkıyla cevaplayın. Tek şart, DEMCR içindeki `TRCENA` bitinin önceden açılmış olmasıdır — TRM bunu bir ön koşul olarak belirtir.

`EXCCNT` ise nadiren kullanılan ama çok şey söyleyen bir sayaçtır: kesme giriş-çıkış ek yükünü ayrı sayar. Kesme yoğunluğu artınca yararlı iş oranının nasıl düştüğünü doğrudan görürsünüz.

### ITM: birkaç komuta log

ITM (Instrumentation Trace Macrocell) `0xE0000000` adresinden başlayan 32 adet stimulus portu sunar. Bir porta yazmak tek bir `str` komutudur; yukarıdaki disassembly'de `strb r0, [r3, #0]` satırı tam olarak budur. Veri, TPIU üzerinden SWO pini ile dışarı çıkar ve host tarafında toplanır. Çekirdek durmaz.

İki uyarı: birincisi, ITM portlarına erişim ayrıcalıklıdır — kullanıcı kipinde koşan görevlerden yazmak için `ITM_TPR` üzerinden izin vermeniz gerekir (`PRIVMASK` alanı portları sekizerli gruplar halinde açar). İkincisi, SWO bant genişliği sonludur; FIFO dolduğunda yukarıdaki döngü bloke olur ve gözlemci etkisi geri gelir. Yüksek hızlı yollarda ham metin yerine ikili olay kodları basmak — bir `uint32_t` olay kimliği, bir `uint32_t` yük — bant genişliğini büyük ölçüde rahatlatır.

### DBGPCSR: halt etmeden profil çıkarmak

Cortex-A9'un en az bilinen debug özelliği bence budur. TRM'nin 10.5.3 bölümünde tanımlanan DBGPCSR (Program Counter Sampling Register), en son dal hedefinin sanal adresini örnekler. Alt iki bit işlemci durumunu kodlar — `0b00` ARM durumu, `0bx1` Thumb ya da ThumbEE — böylece profil aracı gerçek adresi çıkarabilir. Cortex-A9'da varlığı DBGDIDR bit [13]'ün 1 okumasıyla ilan edilir.

Bunun anlamı şu: harici bir debugger, çekirdeği hiç durdurmadan, düzenli aralıklarla DBGPCSR'yi okuyup nerede zaman harcandığının istatistiksel profilini çıkarabilir. Klasik örnekleme tabanlı profiller — `perf` ya da masaüstündeki muadilleri — mantık olarak aynı işi yapar. Gömülü tarafta bu, "kod nerede takılıyor" sorusuna breakpoint koymadan cevap vermenin en temiz yoludur.

### İz (trace) makrocell'leri ve tamponun sınırı

Bir adım ötesi tam komut izidir: Cortex-M'de ETM, Cortex-A9'da PTM, yürütülen komut akışını sıkıştırılmış biçimde dışarı verir. Zynq-7000'in hata ayıklama altyapısı CoreSight tabanlıdır ve PTM ile ITM'nin yanında yonga üstü bir Embedded Trace Buffer barındırır.

Buradaki kısıt tamponun kendisidir. Yonga üstü iz tamponları daireseldir ve kapasiteleri sınırlıdır; dolduklarında en eski kayıtların üzerine yazarlar. Sonuç şu: elinizde her zaman **son** birkaç bin komutun izi olur, hatanın başladığı an değil. Bu yüzden iz, tek başına değil bir tetikleyiciyle birlikte kullanılır — DWT ya da watchpoint karşılaştırıcısını "bu koşul oluşunca izi durdur" diye programlarsınız, tampon o anın etrafındaki pencereyi tutar. Daha geniş pencere isterseniz izi harici bir trace probe'una ya da sistem belleğine yönlendirmeniz gerekir; ikisi de ek donanım ve ek pin maliyeti demektir.

### En taşınabilir yöntem: RAM'de halka tampon

Bütün bu donanımın bulunmadığı ya da erişilemediği durumlar için, hâlâ en pratik yöntem sıkıcı olanıdır: RAM'de sabit boyutlu bir halka tampon, içine ikili olay kayıtları, ve tamponu reset'ten sağ çıkacak bir bölüme yerleştirmek. Kayıt maliyeti birkaç komuttur, gözlemci etkisi ihmal edilebilir, ve tampon çöktükten sonra ya da watchdog reset'inden sonra okunabilir.

Aslında sahada tekrarlanan ama laboratuvarda yakalanamayan hataların çoğu için doğru araç budur. Bir breakpoint size sistemin **bir anını** gösterir; halka tampon size hatadan önceki **son yüz olayı** gösterir. Zamanlamaya bağlı hatalarda ikincisi neredeyse her zaman daha bilgilendiricidir.

---

## Hangi Hata İçin Hangi Araç

Bütün bunları pratik bir karar tablosuna indirgeyelim.

| Belirti | Yanlış refleks | Doğru araç |
|---|---|---|
| Debugger takınca kayboluyor | Daha çok breakpoint | RAM halka tamponu, DWT olay tetikleyicisi |
| Breakpoint'te beklerken reset atıyor | Debugger'ı suçlamak | Watchdog freeze biti, ya da debug derlemesinde watchdog penceresi |
| Adım atınca kesme işleyicisine giriyor | Satır bilgisini suçlamak | Çekirdek errata'sı, `C_MASKINTS`, revizyon kontrolü |
| Log ekleyince zamanlama bozuldu | Log'u azaltmak | Semihosting'i bırakıp ITM ya da RAM tamponu |
| Bu değişkeni kim bozuyor | Kodu gözle taramak | Donanım watchpoint - ama bütçe iki tane olabilir |
| Bu fonksiyon ne kadar sürüyor | Breakpoint arası kronometre | `DWT_CYCCNT` farkı |
| Zaman nereye gidiyor | Fonksiyonlara log serpmek | DBGPCSR örneklemesi ya da PC sampler |
| Çok çekirdekli sistemde tutarsızlık | Tek çekirdeği durdurmak | Cross-trigger ile eşzamanlı halt, ya da iz |

Tablonun üzerine tek bir kural koymak gerekirse: **gözlem yönteminin sisteme maliyetini, ölçtüğünüz büyüklüğün mertebesiyle karşılaştırın.** 1 µs'lik bir jitter'ı 12 µs maliyetli bir log'la ölçemezsiniz. Bu, ölçüm belirsizliğinden bildiğimiz aynı disiplinin hata ayıklamaya uygulanmış hali; ölçüm aracının çözünürlüğü ve sisteme etkisi, ölçtüğü büyüklüğün yanında ihmal edilebilir olmak zorundadır.

---

## Pratik Kontrol Listesi

Yeni bir platformda hata ayıklama altyapısını kurarken kendi kullandığım sıra:

1. **Bütçeyi hedeften oku.** `FP_CTRL` / `DWT_CTRL` (Cortex-M) ya da DBGDIDR (Cortex-A) değerlerini boot log'una bas. Kaç breakpoint ve kaç watchpoint'iniz olduğunu tahmin etmeyin.
2. **Çekirdek revizyonunu log'la.** Errata belgeleri revizyon bazlıdır; `r0p1` mi `r0p2` mi olduğunu bilmeden errata okumak işe yaramaz.
3. **Watchdog davranışını derleme zamanında ayır.** Freeze biti varsa kullan, yoksa debug yapılandırmasında pencereyi uzat — ama bu farkı çalışma zamanı koşuluyla değil, derleme yapılandırmasıyla yap.
4. **Semihosting'i logging yolundan çıkar.** ITM varsa ITM, yoksa RAM halka tamponu. Semihosting yalnızca test koşum çıktısı gibi zamanlamaya duyarsız yerlerde kalsın.
5. **`TRCENA`'yı aç ve `CYCCNT`'yi kullanılabilir bırak.** Zamanlama ölçümü isteyen ilk soru geldiğinde hazır olsun.
6. **En az bir DWT karşılaştırıcısını boş tut.** Hepsini watchpoint'e bağlarsanız, gerçek sorun çıktığında tetikleyici koyacak yeriniz kalmaz.
7. **Reset'ten sağ çıkan bir tampon bölgesi ayır.** Linker script'inde başlangıçta sıfırlanmayan küçük bir bölge, watchdog reset'lerinin sebebini bulmanın en ucuz yoludur.
8. **Fiziksel çıkışlar için güvenli duruma geçiş yolu bırak.** Motor, ısıtıcı ya da valf süren bir sistemde debug oturumu donanım hasarı riskidir.

---

## Sonuç

Gömülü hata ayıklamada temel gerilim şudur: bir sistemi anlamak için onu gözlemlemeniz gerekir, ama en yaygın gözlem yöntemimiz — çekirdeği durdurmak — sistemin geri kalanını durdurmaz. Ortaya çıkan şey, gerçek sistemle laboratuvar sisteminin farklı davranmasıdır. Zamanlamaya bağlı hataların debugger altında kaybolması bir tuhaflık değil, bu yöntemin doğrudan sonucudur.

Çıkış yolu daha fazla breakpoint koymak değil, gözlem maliyetini ölçtüğünüz büyüklüğün altına indirmektir. Bunun için gereken donanım büyük ölçüde zaten çipin içinde: çevrim sayacı, olay tetikleyicileri, PC örnekleyici, iz makrocell'i, stimulus portları. Bunların çoğu bugün kullanılmıyor çünkü varsayılan araç zinciri sizi `break` ve `step` ile karşılıyor, gerisini kendiniz kurmanız gerekiyor.

Bir kez kurduğunuzda ise sahada tekrarlanıp laboratuvarda kaybolan hata sınıfı büyük ölçüde kapanır — çünkü artık sistemi durdurarak değil, koşarken izliyorsunuzdur.

---

## Kaynaklar

- [Arm Cortex-A9 Technical Reference Manual (ARM DDI 0388B)](https://documentation-service.arm.com/static/5e8e264088295d1e18d37ce8) — breakpoint/watchpoint sayıları (§10.3.1), DBGDSCR bit tanımları, DBGDIDR alanları, DBGPCSR (§10.5.3)
- [Arm Cortex-M7 Processor Technical Reference Manual (ARM DDI 0489F)](https://www.pjrc.com/teensy/DDI0489F_cortex_m7_trm.pdf) — FPB yapılandırmaları ve FPBv2 (§9.3), DWT karşılaştırıcı kullanımları ve sayaçları (Bölüm 11), ITM stimulus portları
- [Cortex-M7 (AT610) and Cortex-M7 with FPU (AT611) Software Developer Errata Notice, v8.0](https://www.state-machine.com/doc/Cortex-M7_Software_Developers_Errata_Notice_v8.pdf) — erratum 702596, "Single stepping Cortex-M7 enters pending exception handler"
- [ARMv7-M Architecture Reference Manual — Debug Halting Control and Status Register (DHCSR)](https://developer.arm.com/documentation/ddi0403/d/Debug-Architecture/ARMv7-M-Debug/Debug-register-support-in-the-SCS/Debug-Halting-Control-and-Status-Register--DHCSR) — `C_DEBUGEN`, `C_HALT`, `C_STEP`, `C_MASKINTS` semantiği
- [OpenOCD kaynak kodu — `src/target/cortex_m.c`](https://github.com/openocd-org/openocd/blob/master/src/target/cortex_m.c) — FP_CTRL çözümlemesi, FPB comparator tahsisi, yazılım breakpoint yerleştirme
- [SEGGER Knowledge Base — Semihosting](https://kb.segger.com/Semihosting) — `BKPT 0xAB` mekanizması, hedefin halt kalması, debugger yokken HardFault
- [Interrupt (Memfault) — Introduction to ARM Semihosting](https://interrupt.memfault.com/blog/arm-semihosting) — semihosting protokolünün register seviyesinde anlatımı
- [Sysprogs Forum — STM32 SWO vs FastSemihosting](https://sysprogs.com/w/forums/topic/stm32-swo-vs-fastsemihosting/) — ITM'e doğrudan yazma ve semihosting'in ölçülen süreleri
- [Interrupt (Memfault) — Faster Debugging with Watchpoints](https://interrupt.memfault.com/blog/cortex-m-watchpoints) — `DWT_COMP` / `DWT_MASK` / `DWT_FUNCTION` ile watchpoint programlama
- [Zynq-7000 SoC Technical Reference Manual (UG585) — CoreSight Embedded Trace Buffer](https://docs.amd.com/r/en-US/ug585-zynq-7000-SoC-TRM/CoreSight-Embedded-Trace-Buffer-etb) — Zynq-7000 hata ayıklama altyapısının CoreSight bileşenleri

---
title: "`setjmp`/`longjmp` Neden DAL A'da Yasak? — Stack Unwind, MISRA C 21.4 ve Assembly Anatomisi"
subtitle: "Why setjmp/longjmp is forbidden in safety-critical avionics code"
background: "/img/posts/4.webp"
date: '2026-06-24 09:00:00 +0300'
layout: post
lang: tr
categories: [yazilim]
tags: [c-cpp, emniyet-kritik]
---

Bir gömülü mühendis için `setjmp`/`longjmp` ilk bakışta zarif bir kaçış kapısıdır: iç içe yedi fonksiyonun derinliklerinde bir sensör cevap vermediğinde, çağrı yığınını (call stack) tek bir hamlede çözüp başlangıçtaki "hata kurtarma" noktasına geri sıçramak — exception handling'in C'deki ucuz benzeri. Sahada gördüğüm üzere, çoğu zaman da işe yarar gibi görünür: ünite testlerini geçer, kod analiz aracında sarı bir uyarı vardır ama "yıllardır böyle yazıyoruz" denir. Sonra DAL A bir projede statik analiz raporu masaya konur ve **MISRA C Rule 21.4 ihlali** olarak işaretlenmiş on iki satırı silmeniz istenir.

Bu yazıda o "neden yasak?" sorusunu üç katmanda açıyorum: önce ARM üzerinde `setjmp`/`longjmp`'un fiilen ne **yaptığını** newlib assembly'sinden inceliyoruz; sonra dilin standardının (ISO/IEC 9899) **ne söylemediğini** — yani longjmp'tan sonra neyin tanımsız (undefined) olduğunu — açıyoruz; en sonunda MISRA C, CERT C ve DO-178C'nin bu küçük makro çiftine niye bu kadar sert davrandığını koyuyoruz. Boyunca yeniden üretilebilir küçük örnekler var; sonunda DAL A bağlamında ne yapmanız gerektiğine dair somut desenler.

Yazı boyunca varsayımlarım açık: `gcc 13.2` (arm-none-eabi), newlib `4.4`, Cortex-A9 / Cortex-M4 hedefler, MISRA C:2012 + 2023 düzeltmeleri (Rule 21.4 her ikisinde aynı), DO-178C + DO-330. Ev sahibinde de derleyip incelediğim için x86-64 System V ABI'nın `__sigsetjmp` davranışı da yer yer karşılaştırma için geçecek.

---

## 1. `setjmp`/`longjmp` aslında ne yapar?

Standart kütüphane arayüzü tek satırda anlatılabilir: `setjmp(jmp_buf env)` çağrıldığı noktada **0** döner ve "burası" durumunu `env`'e kaydeder; daha sonra başka bir noktadan `longjmp(env, val)` çağrıldığında, kontrol akışı `setjmp`'ın çağrıldığı satıra geri döner ama bu kez `setjmp` `val`'ı (sıfır geçilirse 1'i) döndürür. Yani çağrı yığınında ne kadar derin olduğunuz fark etmez: tek bir atımla geriye sıçrarsınız.

```c
#include <setjmp.h>
#include <stdio.h>

static jmp_buf g_env;

static void deep_failure(int code) {
    /* … beş kat alta inmiş çağrı zinciri … */
    longjmp(g_env, code);
}

int main(void) {
    int rc = setjmp(g_env);
    if (rc == 0) {
        deep_failure(42);   /* asla buradan dönmez */
    } else {
        printf("kurtarma: rc=%d\n", rc);
    }
    return 0;
}
```

C++'taki `throw`/`catch`'in aksine bu mekanizma **tip-bilgisiz**dir, **yıkıcı çağırmaz**, ve hiçbir kaynağı temizleme garantisi vermez. Tam olarak hesabını veremediğimiz sihir burada başlar.

---

## 2. ARM newlib implementasyonu — neyi gerçekten kaydediyor?

Buraya kadar her şey API tanımı. Asıl ilginç soru şu: makineye indiğimizde `jmp_buf` neye benziyor ve `longjmp` "geri sıçrama"yı nasıl beceriyor?

Newlib'in `newlib/libc/machine/arm/setjmp.S` dosyası, klasik (non-Thumb-1) ARM için yaklaşık şu sıralamayı yapar: `setjmp` AAPCS'in **callee-saved** kaydedici kümesini — yani `r4–r11`, yığın işaretçisi `sp` (r13) ve dönüş adresi `lr` (r14) — yığın yerine `env`'in işaret ettiği belleğe yazar. ARMv6-M (Thumb-1) varyantında düşük/yüksek kaydedici ikiye bölünüp iki `stmia` ile yazılır; özü değişmez:

```armasm
;; arm — setjmp(jmp_buf env)
;;   r0 = env
setjmp:
    stmia   r0!, {r4-r11}    ; callee-saved genel kaydedicileri yaz
    str     sp, [r0], #4     ; yığın işaretçisini yaz
    str     lr, [r0], #4     ; dönüş adresini (= "burası") yaz
    mov     r0, #0           ; setjmp ilk çağrıda 0 döner
    bx      lr
```

`longjmp` ise sırayı tersine işletir, sonra `r0`'a dönüş değerini koyup `lr` üzerinden geri sıçrar:

```armasm
;; arm — longjmp(jmp_buf env, int val)
;;   r0 = env, r1 = val
longjmp:
    ldmia   r0!, {r4-r11}    ; callee-saved'leri geri yükle
    ldr     sp, [r0], #4     ; yığını geri yükle  ⟵ sahanın geri sarıldığı an
    ldr     lr, [r0], #4     ; "burası"yı geri yükle
    movs    r0, r1
    it      eq
    moveq   r0, #1           ; val==0 ise dönüş değerini 1'e zorla
    bx      lr               ; setjmp'ın satırına dön
```

Bu kadar. Hiçbir yıkıcı çağrılmaz, hiçbir kaynak serbest bırakılmaz, çekirdek tarafında — bu bare-metal kod, kernel falan yok — hiçbir bildirim yapılmaz.

Bu altı-yedi talimat üzerinden DAL A için kritik üç gözlem yapabilirim:

1. **Yığın işaretçisi tek bir `ldr` ile geri sarılır.** `sp`'nin eski hâli ile bugünkü hâli arasındaki — yani `setjmp` çağrısından `longjmp` çağrısına kadarki — tüm yığın çerçeveleri **anında ulaşılmaz hâle gelir**. C diliyle konuşursak: o çerçevelerdeki otomatik depolama süreli (automatic storage duration) nesnelerin ömrü "biter" — ama yıkıcı çağrılmaz. C'de yıkıcı yoktur zaten; C++'ta ise bu yüzden tanımsızdır (bkz. §6 ve ERR52-CPP).
2. **Yalnızca callee-saved kaydediciler korunur.** Yani `r0–r3`, `r12` (ip), ve VFP hard-float ABI ile derlendiyseniz `s0–s15` (FPU caller-saved) korunmaz. Eğer bir değişkeni derleyici bu kaydedicilerin birinde tutuyorsa, longjmp sonrası değeri **belirsiz** olur — bu §3'teki "indeterminate value" kuralının makine seviyesindeki nedenidir.
3. **`env`'in içeriği opak değil — yığın işaretçisi içerir.** Saldırgan veya bozulmuş bellek `env`'i değiştirebilirse, `longjmp`'tan sonra rastgele bir adrese sıçrarsınız ve yığın da kontrol edemediğiniz bir yere taşınır. CERT-C MSC22-C bunu açıkça uyarır.

`_JBLEN` (`jmp_buf`'un uzunluğu) standart tarafından opak bırakılır; newlib ARM tarafında derleyici varyantına göre 10–23 arası, x86-64'te 25; varsayımdan kaçının, taşınabilir kod yazıyorsanız boyutuyla oynamayın.

---

## 3. Standardın söylediği şey — ve söylemediği

ISO/IEC 9899:2011 ve 9899:2018 metinleri `setjmp`/`longjmp`'ı tek bir bölümde (§7.13) tanımlar; cazip görünen bu mekanizmanın neden tehlikeli olduğunu da en sade hâliyle aynı bölümde sıralar. Üç kuralı vurgulamak istiyorum:

**(a) Otomatik nesnelerin indeterminate olma kuralı.** §7.13.2.1/3:

> All accessible objects have values, and all other components of the abstract machine have state, as of the time `longjmp` was called, **except that the values of objects of automatic storage duration that are local to the function containing the invocation of the corresponding setjmp macro that do not have volatile-qualified type and have been changed between the setjmp invocation and longjmp call are indeterminate**.

Pratik karşılığı: `setjmp`'ı çağıran fonksiyonun içindeki **`volatile` olmayan** yerel değişkenleri, eğer `setjmp` ile `longjmp` arasında değiştirdiyseniz, `longjmp` sonrası değerleri tanımsızdır. Aşağıdaki kod gerçek bir sahaya çıkarıldığında — derleyici sürümüne ve optimizasyon bayrağına göre — değişen bir hata kaynağıdır:

```c
int counter = 0;
int rc = setjmp(env);
if (rc == 0) {
    counter = 1;          /* setjmp ile longjmp arasında değişti */
    deep_failure(42);
} else {
    /* counter burada 1 mi, 0 mı, çöp mü? — indeterminate. */
    if (counter == 1) { ... }   /* UB */
}
```

Düzeltmesi `int counter` yerine `volatile int counter` yazmak; çünkü `volatile` derleyiciyi değişkeni her sefer belleğe yazmaya zorlar, yani `setjmp`'ın sıçraması sırasında "çöpe gitmiş" bir kaydedicide yaşamaz. Ama bu çare statik analiz aracının uyarısını susturur; gerçek sorunun (kaynak temizliği) altını çizmek için yeterli değildir.

**(b) Çağrılabilir fonksiyon olmaması.** `setjmp` standart kütüphanenin **makro** olarak tanımlanabileceği nadir başlık girdilerinden biridir; ifade içinde çağrılması — örneğin `x = setjmp(env) + 1` — tanımsızdır (§7.13.1.1/4). Yalnızca dört bağlam izinlidir: tek başına ifade, `if`/`switch` kontrolü, karşılaştırma operatörünün operandı, mantıksal `!` operandı.

**(c) Çağıran fonksiyonun hâlâ yığında olması zorunluluğu.** `longjmp` çağrıldığında, `setjmp`'ın bağlandığı fonksiyon **hâlâ aktif** olmalıdır — yani henüz return etmemiş olmalı. Etmişse davranış tanımsızdır. ARM assembly seviyesinde nedeni §2.1'de görmüştünüz: `sp` artık o çerçeveyi göstermiyor, geri sarılan yığın çoktan başka şeyler tarafından yeniden kullanılıyor olabilir.

Bu üç kural birlikte düşünüldüğünde "kaçış kapısı" iddiası hızla zayıflar: dilin kendisi, sıçradıktan sonra fonksiyonun yerel durumunu temizleme sorumluluğunu **size** yıkar. Ne yazık ki C'nin elinde bu temizliği yapacak araç yoktur — yıkıcı, scope-exit, defer hiçbiri yok. RAII'nin C'de karşılığı `setjmp`/`longjmp` değildir; **eksik olduğu yer** zaten budur.

---

## 4. `longjmp`'ın temizlemediği şeyler

Standart, dolaylı olarak, "şu listedeki nesnelerin durumu korunmaz" demez. Şunları açıkça **bildirir** ya da **bildirmez**:

| Kaynak/Durum | longjmp sonrası ne olur? |
|---|---|
| Heap belleği (`malloc` ile) | Sızar — `free` çağrılmaz |
| Açık dosya tanıtıcıları (`FILE*`, fd) | Sızar — `fclose` çağrılmaz |
| Edinilmiş mutex/semaphore | Sızar — kilitli kalır, deadlock |
| `volatile`-olmayan otomatik değişkenler | Indeterminate (§3.a) |
| `volatile` otomatik / static değişkenler | Korunur |
| Sinyal maskesi | **Korunmaz** (C standardı); POSIX'te `sigsetjmp` ile |
| Floating-point durum bayrakları (FE_INEXACT vb.) | Korunmaz |
| Açık FILE* tamponları | Tanımsız — kısmen yazılmış olabilir |
| C++ otomatik nesnelerin yıkıcıları | Çağrılmaz → UB (ERR52-CPP) |
| VLA'lar (variable length array) | Yığın üzerinde "kaybolur", sızıntı |

Gerçek bir saha hatasını burada özetleyeyim — adı/projesi olmadan, jenerik haliyle: bir veri toplayıcı her ölçüm bloğunda `pthread_mutex_lock`, `fopen`, ve birkaç `malloc` yapıyordu; herhangi bir sensör hatasında `longjmp` ile dış döngüye sıçrıyordu. Hafıza birkaç saat boyunca düzgün gözüktü çünkü her döngüde "yeni" tamponlar açılıp boş bırakılıyordu. Ama mutex kilitli kaldı: ikinci sıçramadan sonra ana iş parçacığı yeni bir ölçüm bloğu başlatamadı. Hata, "her şey çalışıyor ama yeni ölçüm gelmiyor" gibi sessiz bir şekilde göründü. Bu klasik bir `longjmp` sızıntısıdır; teşhisi haftalar sürer.

---

## 5. MISRA C ve CERT C ne diyor?

**MISRA C:2012 Rule 21.4** — *Required, decidable*:

> The standard header file `<setjmp.h>` shall not be used.

Bu kural 2023 düzeltme paketiyle ve [MISRA C:2025'in yeniden organize edilmiş başlığıyla](/2026/04/05/misra-c-2025-ile-neler-degisti) aynı kalmıştır. Rasyonel kısmı (yalnızca lisanslı dokümandan alıntılanabilir, dolayısıyla burada özetle aktarıyorum) iki nokta üzerine inşa edilir: (1) yapılandırılmış olmayan kontrol akışı (unstructured control flow) analiz edilemez ve test edilemez; (2) tanımsız davranış için kapı açan kullanım örnekleri pratikte çoktur. MISRA "deviation"ı (sapma) bu kural için kolay alınmaz: gerekçe çoğunlukla "donanım hatasından kurtulma için tek pratik mekanizma" olur ve değerlendirici sizi alternatif tasarıma yönlendirir.

**CERT C MSC22-C** *Use the setjmp(), longjmp() facility securely* — Rule 21.4'ten farklı olarak yasaklamaz, "güvenli kullan" der ama liste şunları kapsar:

- `longjmp` ile **dönülen fonksiyon hâlâ yığında olmalı** (5'inci kez söylüyorum çünkü en sık ihlal edilen kural budur).
- Sinyal işleyici (signal handler) içinden `longjmp` çağrısı **tanımsızdır**; `siglongjmp` kullanın (POSIX).
- `setjmp` yalnızca izinli dört bağlamda çağrılabilir (§3.b).
- `jmp_buf` bütünlüğü korunmalıdır; saldırgan kontrolüne açık bir veri yapısı yapılmamalıdır.

**CERT C++ ERR52-CPP** *Do not use setjmp() or longjmp()* — adı her şeyi söylüyor. C++ tarafında non-trivial yıkıcı bulunan herhangi bir otomatik nesnenin kapsamı `setjmp`/`longjmp` çifti tarafından "atlanıyorsa" davranış doğrudan tanımsızdır (ISO/IEC 14882 §18.10/4). Bu yüzden DO-178C C++ projelerinde Rule 21.4'ün ikizi ERR52-CPP'dir; ikisi de aslında aynı şeyi söyler: bu mekanizmayı kullanmayın.

---

## 6. DO-178C tarafından bakıldığında

DAL A bir projede `setjmp`/`longjmp` kullanmaya kalktığınızda karşınıza çıkacak üç sertifikasyon engeli vardır.

**Yapısal kapsama (structural coverage) çatlağı.** DO-178C §6.4.4.2, DAL A için MC/DC + decision + statement kapsamayı zorunlu kılar. Sorun: `longjmp` çağrısı, kaynak kodda bağlanmamış bir "edge" yaratır. Kapsama analizi araçları (LDRA, VectorCAST, Cantata) bu sıçramayı genellikle "kapsam dışı" olarak işaretler — çünkü temel akış grafiğindeki bir kenarı temsil etmez, *çağrı yığını*nın bir özelliğidir. Sonuç olarak "kapsamadık ama önemli değil" diyemezsiniz; DER (Designated Engineering Representative) bunu kabul etmez. Object Code Coverage (DAL A'da §6.4.4.2.b ile devreye girer) hesabı ise tamamen başka bir baş ağrısıdır — assembly seviyesinde `bx lr` ile yapılan sıçramanın source seviyesindeki karşılığı yok denecek kadar opak.

**WCET (Worst-Case Execution Time) analizinin çökmesi.** Statik WCET araçları (aiT, Bound-T, RapiTime) yapılandırılmış kontrol akışı varsayar. `longjmp`'a denk geldiklerinde kayıt edilen yığın derinliğini ve çıkış yolunu bilemezler — yığın işaretçisinin nereye taşınacağı yalnızca **çalışma zamanında** belli olur. Sonuç: WCET üst sınırı ya çok pesimist çıkar (her olası dönüş noktasını ekleyerek) ya da analiz "bu fonksiyonu analiz edemiyorum" diyerek reddeder. DO-178C §6.3.4.f zamanlama analiz hedefini bu durumda gösteremezsiniz.

**Veri ve kontrol bağlaması (data/control coupling) görünmezliği.** §6.4.4.2.d, DAL A ve B için bileşenler arası veri ve kontrol bağlamalarının analiz edilmesini ister. `setjmp`/`longjmp` çifti, kaynak kodda görünmeyen — header'ın altına gömülmüş — bir kontrol bağlaması yaratır. Modül A'da `setjmp`, Modül F'de `longjmp` olduğunda izlenebilirlik (traceability) matrisinde bu bağı yakalayamazsınız.

Tool qualification açısından da bir tuzak var: bir hata kurtarma kütüphanesi olarak `setjmp`/`longjmp`'u sarmalayan bir framework yazıyorsanız (örn. bir "try/catch" makro tabanlı kütüphane) ve bunun çıktısı doğrulamayı etkiliyorsa, DO-330 TQL değerlendirmesinin nesnesisiniz. Pratikte: bu yolu seçmek istemezsiniz.

---

## 7. Yeniden üretilebilir bir örnek — ne kaybediliyor?

Aşağıdaki tek dosyalık örnek, `longjmp`'ın hangi kaynakları "düşürdüğünü" göstermek için kasten saçma sapan yazılmış. Cortex-A9 üzerinde, `arm-none-eabi-gcc -O0 -g` ile derleyip Renode altında koşturmak için tasarlandı; ev sahibi makinede `gcc -O0` ile de aynı davranışı görürsünüz.

```c
#include <setjmp.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static jmp_buf env;
static int allocs = 0;
static int frees  = 0;

static void *trace_malloc(size_t n) { allocs++; return malloc(n); }
static void  trace_free(void *p)    { frees++;  free(p); }

static void deeper(int depth) {
    char *buf = trace_malloc(64);
    memset(buf, 0xAA, 64);
    if (depth == 0) {
        /* Burada free yok — bilinçli olarak */
        longjmp(env, 1);
    } else {
        deeper(depth - 1);
        trace_free(buf);   /* bu satıra hiç ulaşılmaz */
    }
}

int main(void) {
    int counter = 0;       /* DİKKAT: volatile değil — §3.a */
    if (setjmp(env) == 0) {
        counter = 7;
        deeper(5);
    }
    printf("counter=%d  allocs=%d  frees=%d\n",
           counter, allocs, frees);
    return 0;
}
```

`-O0` ile çalıştırın: muhtemelen `counter=7 allocs=6 frees=0`. `-O2` ile çalıştırın: `counter`'ın değeri "indeterminate" olduğu için derleyici onu artık kaydediciye iyice yerleştirir ve `longjmp` sonrası ya `7` ya da çöp basabilir — sürüm ve hedef değişince de değişir. Sızıntı tablosu nettir: **6 `malloc`, 0 `free`**. Aynı şekilde, `deeper` içinde `pthread_mutex_lock` veya `fopen` çağırsaydık, mutex'ler kilitli, dosyalar açık kalırdı.

Bu örneği DO-178C ekibine "geçici" çözüm olarak götürdüğünüzü düşünün: `counter` için `volatile`, kaynak temizliği için her `longjmp` öncesi elle `free` çağrıları, mutex'ler için sentinel'lar, `FILE*`'lar için elle `fclose`. Yirmi satırlık güzel kaçış kapısı, iki yüz satırlık "her noktada elle unwind" şeridine dönüşür ve hâlâ Rule 21.4 ihlali olarak kalır. O noktada artık alternatifi yazmak ucuzdur.

---

## 8. Pratik öneriler — hata akışını nasıl yazmalı?

DAL A'da hata yönetimi için tasarladığım, projelerde defalarca gördüğüm dört desen var:

**1. Açık hata kodu döndürme (status return).** Klasik. Her fonksiyon bir `status_t` döndürür; çağıran kontrol eder ve gerekiyorsa kaynak temizliğini kendi seviyesinde yapar. Sıkıcı, ama izlenebilir; MISRA Rule 17.7 ile (return value göz ardı edilmemeli) birlikte düşünüldüğünde, statik analiz size yardım eder. Kaynak temizliği için `goto cleanup;` deseni MISRA Rule 15.1/15.2 sınırlarında izinlidir — geriye atlama yapmadığınız sürece. Linux çekirdek kodunun büyük çoğunluğu böyle yazılır.

```c
status_t process(void) {
    status_t st;
    void *p = NULL;
    FILE *f = NULL;

    p = malloc(N);   if (!p) { st = E_NOMEM; goto cleanup; }
    f = fopen(...);  if (!f) { st = E_IO;    goto cleanup; }
    st = step1(p);   if (st != OK) goto cleanup;
    st = step2(p, f);

cleanup:
    if (f) fclose(f);
    if (p) free(p);
    return st;
}
```

**2. Durum makinesi (state machine).** Hatayı kontrol akışıyla değil, durumla taşıyın. Periyodik çağrılan bir "tick" fonksiyonu, her durumdan çıkışta hangi sonraki duruma geçeceğini açıkça yazar; hata durumları doğrudan `RECOVERY` veya `FAIL_SAFE` durumlarına bağlanır. Bu desen, kapsama analizini ve WCET hesabını kolaylaştırır çünkü kontrol akışı yapılandırılmıştır.

**3. Hata bandı + watchdog kombinasyonu.** Tamamen kurtarılamaz bir hata için "kaçmaya" çalışmak yerine watchdog'un sistemi yeniden başlatmasına izin verin. DAL A'da bu, çoğu zaman *en güvenli* alternatif olduğu için tercih edilir: kontrolsüz bir longjmp sıçraması yerine kontrollü bir reset, sertifikasyon kapsama analizine açıktır.

**4. C++'ta exception — yine de dikkatle.** C++ kullanıyorsanız ve toolchain'iniz exception desteğini sertifika düzeyinde sağlıyorsa (örn. AdaCore'un GNAT Pro for ARM Cortex'i veya bazı Wind River dağıtımları), `try`/`catch` `longjmp`'a göre üstündür çünkü RAII ile birlikte gerçek bir unwind yapar. Ama "exception-free C++" alt kümesi — JSF AV C++ ve büyük ölçüde AUTOSAR C++14 — DAL A için çoğunlukla daha tercih edilebilir.

Hangi deseni seçerseniz seçin, kuralı tek satırda özetlemek mümkün: **kontrol akışı kaynak kodunda görünmelidir**. `setjmp`/`longjmp` bu kuralı yerel olarak ihlal eder; DO-178C'nin DAL A için talep ettiği güvence seviyesinde bu ihlalin maliyeti, kazandığı zariflikten kat kat fazladır.

---

## 9. Kapanış

`setjmp`/`longjmp`'un derdi "tehlikeli olması" değil; derdi, kullanım sözleşmesinin C dilinin verebileceğinden daha fazlasını talep etmesidir. Yıkıcı yok, scope-exit yok, defer yok — yığını sıfırlayan ama temizlik yapmayan bir mekanizmanın etrafına emniyet kritik bir sistemin sorumluluklarını yığamazsınız. MISRA C Rule 21.4 ve CERT C++ ERR52, dilin elinin yetmediği yere kurulan kuralları temsil eder. DO-178C ise bunu daha sert bir dille tekrar eder: yapılandırılmamış kontrol akışı sertifika edilebilir değildir.

Bir sonraki PR'da bir `<setjmp.h>` `#include`'una rastlarsanız, asıl soru "hata kurtarma için başka ne kullanırım?" değil; soru, "bu fonksiyon hangi kaynakları edinmiş ve `longjmp` sıçrayınca onların sahibi kim olacak?" Cevap "bilmiyorum" veya "umarım hiçbiri" ise, satır silinmeli.

---

## Kaynaklar

- ISO/IEC 9899:2018, *Information technology — Programming languages — C*, §7.13 *Nonlocal jumps* (`<setjmp.h>`).
- MISRA C:2012, *Guidelines for the Use of the C Language in Critical Systems* — Rule 21.4 (Amendment 2 ile teyid edildi).
- SEI CERT C Coding Standard — [MSC22-C: Use the setjmp(), longjmp() facility securely](https://wiki.sei.cmu.edu/confluence/display/c/MSC22-C.+Use+the+setjmp(),+longjmp()+facility+securely).
- SEI CERT C++ Coding Standard — [ERR52-CPP: Do not use setjmp() or longjmp()](https://wiki.sei.cmu.edu/confluence/display/cplusplus/ERR52-CPP.+Do+not+use+setjmp()+or+longjmp()).
- RTCA DO-178C / EUROCAE ED-12C, *Software Considerations in Airborne Systems and Equipment Certification* — özellikle §6.4.4 yapısal kapsama, §6.3.4 zamanlama analizi, §6.4.4.2.d veri/kontrol bağlama.
- RTCA DO-330, *Software Tool Qualification Considerations* — TQL seviyeleri.
- Newlib kaynak ağacı: `newlib/libc/machine/arm/setjmp.S` ve `newlib/libc/include/machine/setjmp.h`.
- Arm Compiler for Embedded — [`setjmp`/`longjmp` library reference](https://developer.arm.com/documentation/100073/0624/The-C-and-C---Library-Functions-Reference/longjmp--).
- Mark Mossberg, *Let's Understand setjmp/longjmp* (2016) — [offlinemark.com](https://offlinemark.com/lets-understand-setjmp-longjmp/).
- Paul J. Lucas, *setjmp(), longjmp(), and Exception Handling in C* — [dev.to](https://dev.to/pauljlucas/setjmp-longjmp-and-exception-handling-in-c-1h7h).
- WG14 N1318, *longjmp() from signal handler* — [open-std.org](http://www.open-std.org/jtc1/sc22/wg14/www/docs/n1318.htm).

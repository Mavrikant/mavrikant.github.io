---
title: "Ortancayı Almak Yetmez: Üç Kanallı Oylamanın İki Çökme Noktası"
subtitle: "Median Is Not Enough: Two Failure Points of Triplex Voting"
background: "/img/posts/4.webp"
date: '2026-10-09 09:00:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [emniyet-kritik, aviyonik, sistem-muhendisligi]
---

Emniyet kritik sistem tasarımında klasik bir soru vardır: *"Aynı büyüklüğü ölçen üç sensörün var, biri yanlış değer veriyor. Ne yaparsın?"*

Cevap neredeyse refleks haline gelmiştir: **ortancayı al.** Üç değeri sırala, ortadakini kullan. Arızalı kanal uçta kalır, elenir. Ortalama alsaydın hata üçte bir oranında çıktıya sızacaktı; ortanca ise arızalı değeri çıktıya hiç sokmaz.

Bu cevap doğrudur. Eksik olan, cevabın hangi varsayıma yaslandığıdır. Ortanca oylayıcının tek arızaya dayanıklılığı, *kanalların bağımsız olduğu* varsayımının bir sonucudur — bir teoremin değil. Bu varsayım çöktüğünde oylayıcı sessizce yanlış cevap verir: hiçbir bayrak kalkmaz, hiçbir mesaj üretilmez, çünkü oylayıcı açısından her şey normaldir. Üç değer var, biri ortada, o kullanılıyor.

Bu yazıda iki gerçek olayın tasarım analizini yapacağım. İlki, ortancanın bilinçli olarak *kullanılmadığı* bir mimaride, onun yerine konan yamanın açtığı 1,2 saniyelik pencere. İkincisi, ortancanın kullanıldığı ve iki kanalın aynı yöne kaydığı durum. İkisinin ortak dersi, oylayıcının matematiğinde değil, bağımsızlık varsayımının fizikte ve sertifikasyon aritmetiğinde nasıl kaybolduğunda.

Her iki olayın kaynağı kamuya açık: ATSB'nin [AO-2008-070](https://www.atsb.gov.au/investigations/ao-2008-070) nihai raporu ve FAA/EASA'nın uçuşa elverişlilik direktifleri. Aşağıdaki tüm sayılar bu belgelerden.

---

## Ortanca oylayıcı tam olarak neyi garanti eder?

Üç kanal `a1, a2, a3` ve `m = medyan(a1, a2, a3)` olsun. Ortancanın iki güzel özelliği var:

**1. Seçimdir, karışım değildir.** `m` her zaman kanallardan *birinin* değeridir. Ortalama ise var olmayan bir değer üretebilir. Arızalı bir kanal 50° gösterirken diğerleri 2° gösteriyorsa, ortalama 18° gibi fiziksel olarak hiçbir sensörün ölçmediği bir sayı verir — ve bu sayı eşik testlerini geçecek kadar makul görünebilir.

**2. Tek arızaya dayanıklıdır (koşullu).** Üç kanaldan biri *keyfi biçimde* yanlış olsa bile, kalan ikisi doğruysa ortanca o ikisinin arasında kalır. Arızalı kanal ister +∞, ister -∞ olsun fark etmez; sıralamada uca gider.

İkinci özelliğin ince yeri şurada: garanti "biri arızalı" değil, **"en fazla biri arızalı"**. Klasik `f` arızaya dayanıklılık için `n ≥ 2f + 1` kanal gerekir; `n = 3` ile `f = 1`'dir. İki kanal birlikte yanılırsa ortanca arızalı çiftin içinden bir değer seçer ve doğru olan tek kanalı azınlıkta bırakıp atar. Dahası, bunu *kendinden emin* biçimde yapar: oylayıcı iki arızalı kanalın birbirini doğruladığını görür.

Bu, oylayıcının bir kusuru değil, tanımı. ATSB raporu, medyan kullanımının genel olarak sağlam olmasına rağmen "bir algoritmanın etkili çalışmasını sağlamak için hâlâ dikkate alınması gereken birçok yön" bulunduğunu söylerken Ricky Butler'ın NASA teknik raporu [*A Primer on Architectural Level Fault Tolerance*](https://ntrs.nasa.gov/citations/20080009026)'na atıf veriyor — oylama, arıza tespiti ve güvenilirlik analizini bir arada ele alan, serbestçe erişilebilir bir başlangıç metni. Boeing'in 1979'da başvurduğu [US 4,276,648](https://patents.google.com/patent/US4276648A/en) numaralı mid-value select patenti ise bunu pratik bir özellikle kabul ediyor: patent, iki kanal tek bir ek arıza felakete yol açacak kadar ayrıştığında operatörü uyaran bir mekanizma içerir. Yani sorun 1979'da biliniyordu.

Pratikte iki soru kalıyor: kanalların bağımsız olduğunu nasıl *biliyoruz*, ve bağımsız olmadıklarını fark ettiğimizde ne yapıyoruz?

---

## Birinci olay: ortancanın reddedildiği yer

A330/A340'ın elektrikli uçuş kontrol sistemi (EFCS), üç ADIRU'dan gelen veriyi kullanır. ATSB raporunun 2.1.5 bölümü, uçuş kontrol birincil bilgisayarlarının (FCPC) parametrelerin **çoğu** için medyan kullandığını söylüyor — rapordaki ifadeyle yaygın ve genel olarak sağlam bir teknik.

Ama hücum açısı (AOA) için medyan kullanılmıyordu. Gerekçe yazılım değil, **sac metal** (bu yazıdaki rapor ve direktif alıntılarının çevirileri bana ait; özgün metinler kaynaklarda):

> AOA 1 sensörü gövdenin sol tarafında, AOA 2 ve AOA 3 sensörleri ise sağ tarafta birbirine yakın konumdaydı. Sonuç olarak, yan kayma gibi bazı durumlarda AOA 2 ve AOA 3'ün AOA 1'den belirgin biçimde farklı değerler üretme potansiyeli vardı.

Bunun oylayıcı için anlamı şu: uçak yan kayarken AOA 2 ve AOA 3 birlikte, aynı yönde ve aynı miktarda sapar. Medyan bu durumda sağ taraftaki çiftten birini seçer ve **doğruya en yakın olan AOA 1'i reddeder**. Rapor bu sonucu açıkça yazıyor. Yani A330'da ortancanın bağımsızlık varsayımı, normal uçuş koşullarında bile aerodinamik olarak ihlal ediliyordu.

Tasarımcıların çözümü ortancayı bırakmak oldu: `AOA_FCPC_input`, `AOA_average = (AOA 1 + AOA 2) / 2` üzerinden hesaplanıyordu. Medyan tamamen atılmadı, ama rolü değişti — **girdi olmaktan çıkıp izleme referansı oldu**.

Bu doğru bir mühendislik kararı. Bağımsız olmayan kanalları eşit ağırlıkla oylatmak yerine, bağımsızlık varsayımına güvenmeyen bir birleştirme seçildi. Bedeli ise şu: ortalama, ortancanın aksine arızalı değeri doğrudan çıktıya sızdırır. O yüzden ortalamanın etrafına koruma katmanları gerekti.

### Ortalamanın etrafındaki dört katman

Rapordan çıkardığım kadarıyla algoritmanın korumaları şöyleydi:

| Katman | Davranış |
|---|---|
| Geçerlilik | ADIRU verisini SSM ile `invalid` işaretlerse FCPC yok sayar |
| Tutarlılık izleme | Üç değer 40 ms'de bir (25 Hz) okunur; biri medyandan eşiği aşacak kadar **1 saniyeden uzun** saparsa ilgili ADR **uçuşun kalanı için** reddedilir |
| Memorisation | AOA 1 veya AOA 2 medyandan eşik kadar saparsa, son geçerli `AOA_FCPC_input` **1,2 saniye** boyunca dondurulur |
| Rate limit | Normal modda `AOA_FCPC_input` değişim hızı sınırlanır |

Dikkat edilecek nokta: tutarlılık izlemesi medyanı kullanıyor. Yani medyan hâlâ sistemde — ama artık *değer üretmek* için değil, *sapma ölçmek* için. Bu ayrım yazının geri kalanının anahtarı.

Peki 1,2 saniye dolduğunda ne olur? Rapor bunu şöyle anlatıyor:

> 1,2 saniyelik memorisation periyodunun sonunda, FCPC'ler mevcut AOA 1 ve AOA 2 değerlerinin ortalamasını bir örnek için `AOA_FCPC_input` olarak kullandı. Bu değere rate limit uygulanmadı ve (1 saniyelik tutarlılık izlemesi dışında) üç AOA değeri arasında karşılaştırma yapılmadı.

İşte boşluk burada. Durum makinesi normal moda dönerken **tek bir örnek için dört katmanın üçü devre dışı kalıyor**: karşılaştırma yok, rate limit yok, memorisation yeniden tetiklenemiyor. Geriye yalnızca 1 saniyelik yavaş izleme kalıyor — ki 400 ms'lik bir spike'ı yakalamasına imkân yok.

<div class="mermaid">
stateDiagram-v2
    [*] --> Normal
    Normal: Normal mod
    Normal: cikti = rate_limit(ortalama(AOA1, AOA2))
    Memo: Memorisation (1.2 s)
    Memo: cikti = son gecerli deger
    Memo: yeni spike yeni periyot baslatmaz
    Tek: Korumasiz tek ornek
    Tek: cikti = ortalama(AOA1, AOA2)
    Tek: rate limit yok, karsilastirma yok
    Normal --> Memo : AOA1 veya AOA2 medyandan esik kadar sapti
    Memo --> Tek : 1.2 s doldu
    Tek --> Normal : bir ornek sonra
    Normal --> Reddedildi : sapma 1 s'den uzun surdu
    Reddedildi: ADR ucusun kalani icin reddedilir
    Reddedildi: murettebata mesaj uretilmez
</div>

---

## ADIRU neden 50,625° dedi? Bir bit takma adı hikâyesi

7 Ekim 2008'de VH-QPA tescilli A330-303, Learmonth'un 154 km batısında 37.000 ft'te seyir uçuşundaydı. ADIRU 1 aralıklı olarak hatalı değerler yayınlamaya başladı. FDR'de kayıtlı AOA spike'larının çoğu **50,625°** idi.

Bu sayı rastgele değil. Raporun 3.3.4 bölümü, ilk 50,625° spike'ının ikili değerinin o andaki irtifanın ikili değerine karşılık geldiğini tespit ediyor. Arıza mekanizması ise şöyle tarif edilmiş: LTN-101 ADIRU'nun CPU modülü **bir parametrenin değerini başka bir parametrenin etiketiyle** birleştiriyordu.

Bunu doğrulayabiliriz. Rapor iki ağırlık veriyor: ARINC 429 BNR formatında **AOA için bit 27 = 45°**, **irtifa için bit 27 = 32.768 ft**. FDR'de AOA alanı bit 20–27, irtifa alanı bit 14–27 olarak kaydediliyor. Geri kalanı ikili aritmetik:

```python
# ARINC 429 BNR: her bit, bir ustteki bitin yarisi kadar agirlik tasir
def bits(value, msb_weight, msb=27, lsb=14):
    out, rem, w = {}, value, msb_weight
    for b in range(msb, lsb - 1, -1):
        if rem >= w - 1e-9:
            out[b] = w
            rem -= w
        w /= 2
    return out, rem

aoa_w = {b: 45.0 / 2 ** (27 - b) for b in range(20, 28)}   # AOA alani: bit 20-27

for alt in (37000, 12492):
    s, rem = bits(alt, 32768.0)                            # irtifa: bit 27 = 32768 ft
    val = sum(aoa_w[b] for b in s if 20 <= b <= 27)
    print(f"{alt:>6} ft -> set bitler {sorted(s, reverse=True)}"
          f" -> AOA alani olarak {val} derece (kalan {rem:g})")
```

```text
 37000 ft -> set bitler [27, 24, 19, 15] -> AOA alani olarak 50.625 derece (kalan 0)
 12492 ft -> set bitler [25, 24, 19, 18, 15, 14] -> AOA alani olarak 16.875 derece (kalan 0)
```

37.000 ft = 32.768 + 4.096 + 128 + 8, yani bit 27, 24, 19 ve 15. AOA alanı yalnızca bit 20–27'yi okur; bit 19 ve 15 alanın altında kalır. Geriye bit 27 ve 24 kalıyor: 45° + 5,625° = **50,625°**.

İkinci satır tesadüf olmadığını gösteriyor: raporun kaydettiği diğer spike değeri 16,875°, o anki irtifa ise 12.492 ft. Aynı hesap 11,25° + 5,625° = 16,875° veriyor. İki bağımsız eşleşme.

Bu, verinin aşağı akıştaki tek-sözcük kontrollerini neden geçtiğini de açıklıyor. Sözcük geçerli bir ARINC 429 çerçevesi, pariteyi sağlıyor ve SSM'si `valid` diyor. Veri **sözdizimsel olarak kusursuz, anlamsal olarak çöp**. Bir alıcının bunu tek bir sözcüğe bakarak yakalaması mümkün değil; ancak kanallar arası karşılaştırma yakalayabilir. Yani bütün yük oylayıcıda.

Burada ters bir ayrıntı var. 50,625° tek başına hiçbir hücum açısı için makul değil — ve raporun 2.1.7 bölümüne göre `AOA_FCPC_input` değeri -10° ile +30° aralığının dışına çıksa kontrol yasası normal'den alternate'e döner, yüksek AOA koruması da böylece devre dışı kalırdı. Ama FCPC'nin kullandığı değer ham spike değil, **ortalamaydı**: (50,625 + 2,3) / 2 = 26,46°. Ortalama alma, saçma bir değeri 30° eşiğinin **altına** indirip inandırıcı hale getirdi ve normal yasayı — dolayısıyla korumayı — ayakta tuttu. ATSB de 5.2.2'de bunu tersinden söylüyor: `AOA_FCPC_input` 30°'yi geçseydi EFCS alternate yasaya döner ve düzeltici mekanizmalardan biri — yüksek AOA koruması — etkin olmazdı.

---

## Yamanın açtığı pencere: 1,2 saniyelik zamanlama arızası

Rapora göre FCPC algoritması, tek bir ADIRU'dan gelen hatalı AOA verisinin neredeyse bütün biçimlerini başarıyla yönetiyordu: basamak değişimi, kaçak (runaway), tek spike, ve çoklu spike'ların çoğu. 7 Ekim uçuşunda ADIRU 1'den çok sayıda spike geldi ve **neredeyse hepsi** etkili biçimde filtrelendi.

Yönetemediği tek desen şuydu: bir spike memorisation periyodunu tetikler, **ikinci spike periyodun bittiği anda** hazır bulunur.

Algoritmayı rapordaki tarife göre modelleyip bu deseni verdim. Eşik ve rate limit değerleri raporda verilmiyor — aşağıdaki 5° ve 10°/s yalnızca örnek; davranışın niteliğini değiştirmiyorlar, sayısal detayı etkiliyorlar.

```python
DT, REJECT_T, MEMO_T = 0.040, 1.000, 1.200   # 25 Hz, 1 s red, 1.2 s memorisation
THRESHOLD, RATE_LIMIT = 5.0, 10.0            # ornek degerler (kamuya acik degil)

class FCPC:
    def __init__(self):
        self.out = None
        self.memo_left, self.memo_value, self.post_memo = 0.0, None, False
        self.dev_prev, self.dev_timer = False, [0.0, 0.0, 0.0]
        self.rejected = [False, False, False]

    def step(self, aoa):
        m = sorted(aoa)[1]                                  # medyan: yalnizca izleme icin

        for i in range(3):                                  # 1 s tutarlilik -> kalici red
            if abs(aoa[i] - m) > THRESHOLD:
                self.dev_timer[i] += DT
                if self.dev_timer[i] > REJECT_T:
                    self.rejected[i] = True
            else:
                self.dev_timer[i] = 0.0

        pair = [i for i in (0, 1) if not self.rejected[i]] or [2]
        raw = sum(aoa[i] for i in pair) / len(pair)          # AOA_average
        dev = any(abs(aoa[i] - m) > THRESHOLD for i in pair)

        if self.out is None:
            self.out, self.dev_prev = raw, dev
            return self.out, "init"
        if self.memo_left > 1e-9:                            # memorisation suruyor
            self.memo_left -= DT
            self.dev_prev = dev
            return self.memo_value, "memo"
        if self.post_memo:                                   # TEK korumasiz ornek
            self.post_memo = False
            self.out, self.dev_prev = raw, dev
            return self.out, "post-memo"
        if dev and not self.dev_prev:                        # sapmanin yukselen kenari
            self.memo_value, self.memo_left = self.out, MEMO_T - DT
            self.post_memo, self.dev_prev = True, dev
            return self.memo_value, "memo-basladi"

        step_max = RATE_LIMIT * DT                           # normal mod + rate limit
        self.out += max(-step_max, min(step_max, raw - self.out))
        self.dev_prev = dev
        return self.out, "normal"
```

Girdi olarak AOA 2 ve AOA 3'ü gerçek değerde (2,3°) sabit tutup, AOA 1'e 400 ms süren iki adet 50,625° spike veriyorum. Tek değişken, spike'lar arasındaki mesafe:

```text
=== Senaryo D - iki spike, arasi 1.2 s (QF72) ===
  t= 0.00s  AOA=  2.30 / 2.30 / 2.30  ->  AOA_FCPC=  2.30  [init]
  t= 1.00s  AOA= 50.62 / 2.30 / 2.30  ->  AOA_FCPC=  2.30  [memo-basladi]
  t= 1.04s  AOA= 50.62 / 2.30 / 2.30  ->  AOA_FCPC=  2.30  [memo]
  t= 2.20s  AOA= 50.62 / 2.30 / 2.30  ->  AOA_FCPC= 26.46  [post-memo]
  t= 2.24s  AOA= 50.62 / 2.30 / 2.30  ->  AOA_FCPC= 26.46  [normal]
  TEPE AOA_FCPC_input = 26.46 deg | reddedilen ADR: yok

=== Ayni spike cifti, arasi 0.6 s ===
  t= 1.00s  AOA= 50.62 / 2.30 / 2.30  ->  AOA_FCPC=  2.30  [memo-basladi]
  t= 2.20s  AOA=  2.30 / 2.30 / 2.30  ->  AOA_FCPC=  2.30  [post-memo]
  TEPE AOA_FCPC_input = 2.30 deg | reddedilen ADR: yok
```

İlk senaryoda `AOA_FCPC_input` **26,46°**'ye atlıyor. Raporun verdiği değer: *"50,6°'lik bir AOA 1 spike'ı ve 2,3°'lik bir AOA 2 değerinin ortalamasına dayanarak"* `AOA_FCPC_input` **26°**. `(50,625 + 2,3) / 2 = 26,46`. Model bağımsız olarak aynı sayıyı üretiyor.

İkinci senaryoda **tam olarak aynı iki spike**, yalnızca 0,6 s arayla. Çıktı hiç kıpırdamıyor; ikinci spike memorisation penceresinin içinde kalıyor ve yeni bir periyot tetiklemediği için tamamen yutuluyor.

Bu, bir değer arızası değil, **zamanlama arızası.** Spike'ın büyüklüğü, süresi, hangi kanaldan geldiği aynı; değişen tek şey iki olay arasındaki gecikme. Girdi uzayında bu kadar ince bir dilimi gereksinim tabanlı testle bulmak için, önce böyle bir desenin var olabileceğini düşünmek gerekir.

Uçakta sonuç şuydu: 26°'lik `AOA_FCPC_input`, yüksek AOA koruması ile anti pitch-up kompanzasyonunu birlikte tetikleyerek **10° nose-down elevator komutu** üretti. Uçak -8,4° pitch açısına ulaştı, dikey ivme -0,80 g'ye düştü ve ilk pitch-down'da toplam 690 ft alçaldı. 303 yolcunun en az 110'u ve 12 ekip üyesinin 9'u yaralandı; 12 kişi ciddi şekilde. Kısa süre sonra ikinci bir pitch-down daha yaşandı.

Simülasyonun küçük bir yan ürünü var: ATSB, 26°'lik değerin yaklaşık 400 ms sürdüğünü tespit ederek ikinci spike'ın **400 ms'den uzun ama 1 saniyeden kısa** olduğu sonucuna varıyor. Çünkü 1 saniyeyi geçse ADR 1 reddedilecek ve bir arıza mesajı kaydedilecekti. Tasarımın iki eşiği — 1 s red ve 1,2 s memorisation — arasındaki dar aralık, hem arızanın oluşmasına hem de sonradan teşhis edilmesine imkân verdi.

---

## İkinci olay: iki kanal, aynı yön

Şimdi raporun en çok düşündüren paragrafına geliyoruz. ATSB, 2.1.6 bölümünde algoritmanın *bilinen* ikinci zayıflığını da anlatıyor:

> Hatalı AOA değerlerinin `AOA_FCPC_input` değerini önemli ölçüde etkileyebileceği bir diğer senaryo, iki AOA değerinin eş zamanlı sapmasını içeriyordu. Sapmaların, sapma süresi boyunca benzer büyüklükte olması gerekiyordu. Bu olursa algoritma doğru AOA'yı reddeder ve `AOA_FCPC_input`'u kalan iki hatalı değerin ortalamasına dayandırırdı.

Rapor hemen ardından ekliyor: üretici bu senaryoyu A330/A340 geliştirilirken **tespit etmişti**; ancak iki ADR'nin eş zamanlı arızası "extremely improbable" kabul edilmişti.

2.5.3 bölümü bu kararın aritmetiğini veriyor. Sistem emniyet değerlendirmesinde (SSA), "gerçeğinden büyük hatalı değer kullanımı" arıza koşulunun sonuçlarından biri şöyle tanımlanmış: *elevatörlerde mürettebatın karşı koyamayacağı bir pitch-down komutu.* Bu `hazardous` sınıflandırılmış, hedef olasılık üretici tarafından 10⁻⁹/uçuş saati konmuş. Ve SSA'nın bu arıza koşuluna götürdüğünü bulduğu **tek** senaryo, iki ADR'nin aynı anda hatalı veri vermesiydi; olasılığı **ADIRU üreticilerinin sağladığı FMEA'lara dayanarak** hedefin altında hesaplanmıştı.

Burada iki ayrı sorun var ve ikisi de tanıdık:

**Birincisi:** 1,2 saniyelik senaryo SSA'da hiç yok. Rapor nedenini de söylüyor — ADIRU üreticisinin FMEA'sı "çoklu, tespit edilmeyen spike" arıza modunu içermiyordu. Alt seviye FMEA'da olmayan bir arıza modu, üst seviye SSA'da bir senaryo üretemez. 1992–2009 arasında 28 milyondan fazla A330/A340 uçuş saatinde bu, tek bilinen örnek olarak kaldı; ADIRU tarafında ise 128 milyon birim çalışma saatinde üç olay.

**İkincisi, ve daha ilginç olanı:** iki ADR'nin eş zamanlı arızası, iki *birimin* bağımsız arızası olarak modellenmiş. İki FMEA olasılığının çarpımı küçük bir sayı verir. Ama bu çarpım yalnızca arızalar bağımsızsa geçerlidir.

### Buzlanmanın çarpımla ilgisi yok

5 Kasım 2014'te D-AIDP tescilli bir A321, Bilbao'dan kalkışında tırmanırken **iki AOA probu birlikte tıkandı**. FAA'in bu olay üzerine yayımladığı direktifin metni:

> Bir Airbus A321 uçağının tırmanışta iki hücum açısı (AOA) probunda tıkanmayla karşılaştığı, bunun Mach sayısı artarken Alpha Protection (Alpha Prot) devreye girmesine yol açtığı bir olay rapor edilmiştir. Uçuş ekibi tam kontrolü yeniden sağlamayı başarmış ve uçuş olaysız sonlanmıştır.

Mekanizma kısmı daha da öğretici:

> Alpha Prot tıkanmış AOA probları nedeniyle devreye girdiğinde, uçuş kontrol yasaları sürekli bir nose-down pitch oranı emreder; en kötü durumda bu, kumanda kolu tam geriye çekilse bile durdurulamaz. Nose-down komutu sırasında Mach sayısı artarsa, Alpha Prot'un AOA değeri düşmeye devam eder. Sonuç olarak uçuş kontrol yasaları, hız minimum seçilebilir hızın (VLS) üzerinde olsa bile nose-down pitch oranı emretmeye devam eder.

Birincil raporun aktarıldığı ikincil kaynaklara göre AOA 1 sabit 4,2°'de, bir dakika sonra AOA 2 sabit 4,6°'de kilitlenmişti; uçak FL195'e tırmanıyordu ve dış hava -35 °C idi. Bu değerlere dikkat: ne 0°, ne 90°, ne de `NaN`. **Makul, birbirine yakın, sorgulanmayacak iki sayı.**

Üçüncü probun ne durumda olduğunu düşünelim. Uçak tırmanıyor, gerçek hücum açısı artıyor, üçüncü prob bunu doğru ölçüyor. Saf bir medyan oylayıcıda sonuç:

```text
=== Iki vane ayni degere donmus: saf medyan oylayici ===
  t= 0.0s  AOA=4.20 / 4.60 /  2.00  ->  medyan= 4.20   (gercek= 2.00)
  t= 0.5s  AOA=4.20 / 4.60 /  3.50  ->  medyan= 4.20   (gercek= 3.50)
  t= 1.0s  AOA=4.20 / 4.60 /  5.00  ->  medyan= 4.60   (gercek= 5.00)
  t= 1.5s  AOA=4.20 / 4.60 /  6.50  ->  medyan= 4.60   (gercek= 6.50)
  t= 2.0s  AOA=4.20 / 4.60 /  8.00  ->  medyan= 4.60   (gercek= 8.00)
```

Oylayıcı 4,2° ile 4,6° arasında gidip geliyor; gerçek değer 8°'ye çıkmışken bile. Doğru ölçen tek kanal, oylamada hiçbir zaman ortancaya düşmediği için çıktıyı asla etkilemiyor. Ve donmuş çift birbirine 0,4° uzaklıkta olduğundan, kanallar arası uyuşmazlık testleri de sessiz kalır — çünkü *onlar* birbirleriyle uyumlu; uyumsuz olan üçüncü, yani doğru olan.

A320 ailesinin AOA konsolidasyon mantığının ayrıntıları kamuya açık değil, bu yüzden uçakta tam olarak hangi kuralın işlediğini iddia etmiyorum. Ama ilke mimariden bağımsız: **iki kanal aynı yanlış değerde buluştuğunda, çoğunluk yanlış taraftadır.**

Asıl mesele, bu iki kanalın niçin birlikte arızalandığı. Cevap FMEA'ların çarptığı olasılıklarda değil: ortak bir neden var. Aynı buzlanma koşulu, aynı prob tipi, benzer montaj geometrisi. FAA'in sonraki direktifi tam olarak buna yöneliyor — belirli AOA sensörlerinin tıkanmaya daha yatkın olduğu tespit edilmiş; konik plakaların değiştirilmesi, prob değişimi ve ısıtma fonksiyon testi zorunlu kılınmış. Dikkat çekici olan, ilk düzeltmenin (Aralık 2014, acil direktif) tamamen **prosedürel** olması: uçuş el kitabına anormal Alpha Prot prosedürü eklenmesi. Donanım düzeltmesi 2017'yi buldu.

Yani A330'da aerodinamik olarak öngörülen ve bilinçli olarak tasarıma yansıtılan "iki kanal birlikte sapabilir" durumu, A321'de bambaşka bir mekanizmayla — buzlanmayla — ve bu kez *donmuş* değerlerle gerçekleşti. İki olay arasında altı yıl var.

---

## Mühendislik çıkarımları

İkisini birlikte okuduğumda, oylayıcı tasarımı için şu başlıklar kalıyor:

**Oylayıcıyı durumsuz tutmaya çalış; tutamıyorsan her geçişi test et.** QF72'nin arıza modu, oylayıcının kendisinde değil, oylayıcıya eklenen **durumda**. Memorisation bir bellektir; bellek bir durum makinesi getirir; durum makinesi geçişler getirir; ve arıza bir geçişte saklanıyordu. Durumsuz bir medyan fonksiyonunda zamanlamaya duyarlı arıza modu yoktur. Durum eklemek zorundaysan, "hangi durumdan hangisine" matrisinin her hücresini bir test senaryosuyla eşle — kod kapsaması bunu sana vermez; `post_memo` dalı tek bir normal spike testiyle de %100 kapsanır.

**Pencere kenarlarında koruma bırakma.** Buradaki asıl kusur, memorisation'ın varlığı değil, çıkışının korumasız olması: bir örnek boyunca ne rate limit ne karşılaştırma uygulanıyordu. Bir filtreden "normal" moda dönerken korumaların *hepsi* geçerli olmalı. Geçiş anı, bir sistemin en kırılgan olduğu andır; tasarımda en az düşünülen an da genellikle odur.

**Bağımsızlığı varsayma, kanıtla.** İki kanalın bağımsız olduğu iddiası bir olasılık çarpımı değil, bir mühendislik argümanıdır ve ayrı ayrı gösterilmesi gerekir: fiziksel yerleşim (aynı tarafta mı?), ortam (aynı buzlanma bölgesinde mi?), besleme ve ısıtma devresi, kablaj yolu, üretim lotu, kalibrasyon geçmişi, yazılım sürümü. A330'un AOA 2 ve AOA 3'ü *tasarım gereği* bağımsız değildi ve tasarımcılar bunu biliyordu. A321'in iki probu ise ortak bir çevresel neden üzerinden bağımlı hale geldi. ARP4754A'nın ortak neden analizini (CCA) ayrı bir disiplin olarak koymasının sebebi tam olarak bu: nicel FMEA aritmetiği ortak nedeni görmez.

**"Olasılığı düşük" ile "mekanizması yok" aynı şey değil.** SSA, iki ADR'nin eş zamanlı hatasını bulmuş ve 10⁻⁹ altına yerleştirmişti. Hesap, verilen FMEA'lara göre doğruydu. Yanlış olan, sorunun biçimiydi: "bu iki şey birlikte ne sıklıkla bozulur?" yerine "bu iki şeyi birlikte bozabilecek bir mekanizma var mı?" diye sormak gerekiyordu. İkinci soru buzlanmayı bulur, birincisi bulmaz.

**Oylayıcının kararlarını dışa vur.** Raporun en sessiz ama en can sıkıcı detayı şu: FCPC bir ADR'yi uçuşun kalanı için reddettiğinde, **mürettebata hiçbir uyarı veya dikkat mesajı üretilmiyordu.** Bir oylayıcı, yedekliliği harcadığında bunu söylemelidir — yoksa sistem tek kanala düşmüş olarak uçmaya devam eder ve kimse bilmez. Boeing'in 1979 patentinin iki kanal fazla ayrıştığında operatörü uyarmayı düşünmüş olması, bunun yeni bir fikir olmadığını gösteriyor.

**Çapraz kontrol için ikinci bir fizik kullan.** Üç AOA probunun hepsi aynı ölçüm prensibini paylaşıyor, dolayısıyla ortak neden hepsini birlikte vurabilir. Analitik yedeklilik — hücum açısını bağımsız büyüklüklerden (pitch, uçuş yolu açısı, dikey ivme, hız) kestirip oylamaya dördüncü bir "sanal kanal" olarak sokmak — farklı bir fiziğe dayandığı için aynı buz tabakasından etkilenmez. Bedeli model hatası ve ek karmaşıklık; ama ortak nedene karşı oylamanın tek gerçek savunması bu.

---

## Açık bırakılan sorular

Bu iki olayı okuduktan sonra kendi tasarımlarıma sorduğum ve net cevabı olmayan sorular:

- Üç kanaldan ikisi birbirine yakınsa, bu *doğrulama* mı yoksa *ortak neden şüphesi* mi? Patentin 1979'da önerdiği gibi "çok yakınsa da uyar" mantığı, yanlış alarm oranını kabul edilemez hale getirmeden kurulabilir mi?
- Bir oylayıcıya bellek eklemek zorunlu olduğunda, durum geçişlerinin kapsanmasını kanıtlamak için yapısal kapsama dışında hangi kanıt üretilebilir? Formel doğrulama (model checking) bu sınıf arızalar için pratik mi — çünkü 1,2 saniyelik desen, zamanlı bir özellik olarak ifade edilebilir görünüyor.
- Analitik yedeklilikle oylama yapan bir mimaride, model hatası yeni bir ortak neden haline gelmez mi?

---

## Kaynaklar

- ATSB, *In-flight upset — Airbus A330-303, VH-QPA, 154 km west of Learmonth, Western Australia, on 7 October 2008*, Aviation Occurrence Investigation AO-2008-070 (nihai rapor, 19 Aralık 2011) — [soruşturma sayfası](https://www.atsb.gov.au/investigations/ao-2008-070). Özellikle böl. 2.1.4–2.1.6 (izleme ve AOA hesaplama mantığı), 2.5.3–2.5.4 (algoritmanın emniyet değerlendirmesi), 3.3.4 (bit eşleşmeleri), 5.2 (tasarım sınırlaması).
- ATSB, [*Angle of attack processing algorithm*](https://www.atsb.gov.au/safety-issues/AO-2008-070-SI-02) — AO-2008-070-SI-02 emniyet sorunu kaydı.
- FAA, *Airworthiness Directives; Airbus Airplanes*, 82 FR 40675, 28 Ağustos 2017 — [Federal Register kaydı](https://www.federalregister.gov/documents/2017/08/28/2017-16860/airworthiness-directives-airbus-airplanes). A321'in iki AOA probunun tıkanması olayı, Alpha Prot mekanizması ve emniyetsiz durum tanımı. Öncesi: FAA Acil AD 2014-25-51 (10 Aralık 2014) ve EASA AD 2014-0266-E.
- Butler, R. W., [*A Primer on Architectural Level Fault Tolerance*](https://ntrs.nasa.gov/citations/20080009026), NASA/TM-2008-215108, NASA Langley Research Center, 2008. ATSB raporunun oylama algoritmaları için atıf verdiği kaynak.
- Tomlinson, L. R. (Boeing), [*Midvalue signal selection and fault detection apparatus and method*](https://patents.google.com/patent/US4276648A/en), US 4,276,648, başvuru 4 Eylül 1979, tescil 30 Haziran 1981. Mid-value select, integral equalization ve kanal ayrışması uyarısı.
- SAE ARP4754A, *Guidelines for Development of Civil Aircraft and Systems* ve SAE ARP4761, *Guidelines and Methods for Conducting the Safety Assessment Process on Civil Airborne Systems and Equipment* — ortak neden analizi (CCA) ve SSA süreçleri için referans standartlar.

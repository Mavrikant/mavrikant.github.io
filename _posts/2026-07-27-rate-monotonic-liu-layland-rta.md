---
title: "Rate Monotonic Scheduling: Liu-Layland Sınırından Response Time Analysis'e"
subtitle: "From the Liu-Layland Bound to Response Time Analysis in Fixed-Priority Preemptive Scheduling"
background: "/img/posts/4.webp"
date: '2026-07-27 09:00:00'
layout: post
lang: tr
mermaid: true
categories: [aviyonik]
tags: [gercek-zamanli, aviyonik, rtos, do-178c]
---

Gerçek zamanlı bir sistemin işi hızlı çalışmak değil, **söz verdiği anda bitirmek**tir. Uçuş kontrol yasası her 10 ms'de bir yeni çıktı üretmek zorundaysa, üretememek "biraz gecikmek" değil, tanım gereği hatadır. Peki bir görev kümesi verildiğinde, tüm görevlerin deadline'larını kaçırmayacağını **önceden matematiksel olarak** nasıl kanıtlayabiliriz?

Bu soruya 1973'te Liu ve Layland şaşırtıcı bir cevap verdi: sabit öncelikli (fixed-priority) preemptive bir çekirdek üzerinde, önceliklerinizi periyodun tersine göre atarsanız ve toplam CPU kullanımı belirli bir eşiği geçmezse, hiçbir deadline kaçırılmaz. Ne var ki bu eşik, çoğu mühendisin sezgisiyle çelişir: 100% değil, sonsuzda **%69.3**'e düşer. Daha da ilginci, bu sınır kanıtlayıcı ama karamsardır — geçemeyen bir görev kümesi, aslında sıklıkla deadline'larını hâlâ tutturur.

Bu yazıda önce Rate Monotonic Analysis (RMA) sınırının nereden geldiğini türetiyor, sonra sınırı geçemeyen bir görev kümesini **Response Time Analysis (RTA)** ile bit-bit doğruluyor, ve ARINC 653 bölümlü aviyonik RTOS'larda bu iki yöntemin nerede birleştiğini gösteriyoruz. Amaç bir sonraki uçuş yazılımı iş bildirgenizde "schedulability proof" başlığının altına ne yazılacağını bilmek.

---

## 1. Görev modeli: Liu-Layland dünyası

Analiz somut olsun diye önce dünyayı sadeleştirelim. Klasik periyodik görev modelinde her görev $\tau_i$ üç sayı ile tanımlanır:

- $T_i$ — periyot (görev her $T_i$ zaman biriminde bir kez tetiklenir),
- $C_i$ — **worst-case execution time** (WCET; en kötü senaryoda görev bir tur içinde ne kadar CPU zamanı harcar),
- $D_i$ — bağıl deadline (görev tetiklendikten sonra kaç zaman birimi içinde bitmesi gerekir).

Klasik Liu-Layland varsayımlarında $D_i = T_i$ alınır; yani deadline periyotla aynıdır. Görevler bağımsızdır (kilit yoktur), preemption anlıktır (context switch maliyeti yok), tek işlemci vardır. WCET'in kendisinin nereden geldiği — cache, pipeline, ölçüm — başka bir yazının konusu; burada $C_i$'yi verili kabul ediyoruz.

Bir görev kümesinin CPU kullanımı doğal biçimde tanımlanır:

$$U = \sum_{i=1}^{n} \frac{C_i}{T_i}$$

$U > 1$ ise hiçbir zamanlama algoritması bu kümeyi çalıştıramaz — CPU zaten yetmiyor. Asıl soru şu: $U \le 1$ olduğunda gerçekten çalışır mı, yoksa öncelik atama şansımızı mı ziyan ediyoruz?

---

## 2. Rate Monotonic Priority Assignment (RMPA)

Liu-Layland'in ilk teoremi öncelik atamayla ilgilidir: **statik önceliklerle çalışan tüm çizelgeleyiciler arasında, periyodu kısa olana yüksek öncelik veren atama optimaldir**. Buradaki "optimal" tanımı açıktır — başka herhangi bir statik atamayla çizelgelenebilen bir görev kümesi, RM atamasıyla da çizelgelenir.

Sezgi basit: kısa periyotlu bir görev daha sık deadline'a çarpar, dolayısıyla bekleme lüksü daha azdır. Daha uzun periyotlu bir görevin arkasına düşerse, kaçınılmaz olarak deadline'ını kaçırır. RM atamasında $T_1 \le T_2 \le \dots \le T_n$ sıralaması, öncelik sıralamasını doğrudan verir.

Uyarı: RMPA "en iyi statik atama"dır — dinamik öncelik veren algoritmalar (Earliest Deadline First, EDF) $U = 1$'e kadar çıkabilir. Aviyonikte EDF pratikte kullanılmaz; çünkü bir görev overrun yaparsa hangi görevin etkileneceğini önceden söylemek zordur, izolasyon ve hata-etki analizi bozulur. Sabit öncelik, sertifikasyon lehinde daha az saldırı yüzeyi bırakır.

---

## 3. Liu-Layland utilization sınırı: nereden geliyor %69.3?

İkinci teorem, RMPA ile çizelgelenebilirliği garanti eden yeterli (sufficient) bir koşul verir:

$$U \le U_{LL}(n) = n \left( 2^{1/n} - 1 \right)$$

Bu sınır $n$ görev sayısıyla değişir ve monoton azalır: $U_{LL}(1) = 1$, $U_{LL}(2) \approx 0.828$, $U_{LL}(3) \approx 0.780$, ..., ve

$$\lim_{n \to \infty} U_{LL}(n) = \ln 2 \approx 0.693$$

Bu sınır sezgiye ters gelir. "Görevleri sıkıştırıp CPU'nun %85'ini kullanan bir görev kümesi neden deadline kaçırsın ki? Boş CPU var." Cevap, kritik anlarda yatar.

**Kritik an argümanı.** Liu ve Layland'in kanıtının kalbi, sabit öncelikli bir çizelgeleyicide bir görevin en uzun response time'ının, o görevin **kendinden yüksek öncelikli tüm görevlerle aynı anda tetiklendiği** anda oluşacağını göstermesidir. Buna kritik an (critical instant) denir. Bir görev kümesinin çizelgelenebilirliğini kanıtlamak için, her görevin kritik anındaki durumunu analiz etmek yeterlidir.

En düşük öncelikli görev $\tau_n$ için kritik anda gerçekleşen yük, $\tau_n$'nin deadline'ından önce $\tau_n$'in $C_n$ birimlik CPU zamanına sığabilmesini gerektirir. Aradaki tüm yüksek öncelikli görevler $\tau_n$'yi preemption'a uğratır. Bu koşulu görev kümeleri üzerinde optimize edip en kötü ihtimalde bile sığdırılabilir olma sınırını bulunca, $U_{LL}(n) = n(2^{1/n}-1)$ formülü çıkar.

Sınırın **yeterli ama gerekli olmadığını** bir kere daha vurgulamak lazım: $U > U_{LL}(n)$ olan bir görev kümesi de çizelgelenebilir olabilir. Sınır, "kötü niyetli" görev periyot oranları için en dar kalıbı çizer; iyi seçilmiş periyotlar (özellikle harmonik olanlar) bu sınırın çok üstünde çalışır.

**Harmonik kümeler için sınır neden 1?** Eğer görev periyotları harmoniksa — yani her $T_i$, kendinden büyük her $T_j$'yi tam böler — utilization sınırı %100'e çıkar. Kanıtı basittir: harmonik durumda kritik andaki yüksek öncelikli tüketim, tam periyot katlarında biter ve boşluk kalmaz. Aviyonikte periyotlar sıklıkla 1 ms, 5 ms, 10 ms, 20 ms, 50 ms gibi bir hiyerarşi olarak seçilir; bu tesadüf değildir, RMA lehine çalışan bir tasarım tercihidir.

---

## 4. Sayısal örnek: sınır ne diyor, gerçek ne diyor?

Somut bir görev kümesi alalım. Bir uçuş yönetim modülü düşünelim:

| Görev | $T_i$ (ms) | $C_i$ (ms) | $U_i = C_i/T_i$ |
|---|---:|---:|---:|
| $\tau_1$: sensör okuma | 10 | 3 | 0.300 |
| $\tau_2$: durum kestirimi | 25 | 6 | 0.240 |
| $\tau_3$: kontrol yasası | 50 | 12 | 0.240 |

Toplam kullanım $U = 0.780$. Üç görev için Liu-Layland sınırı $U_{LL}(3) = 3(2^{1/3}-1) \approx 0.7797$. Yani $U = 0.780 > U_{LL}(3)$ — sınırı **geçemedik**, ki bu tarafı %0.03 puan farkla. RM sınırı diyor ki: "çizelgeleneceğini garanti edemem."

Ama garanti edememek, çizelgelenmeyecek anlamına gelmez. Sınırı geçen bir kümenin gerçekten çizelgelenip çizelgelenmediğini görmek için daha keskin bir teste ihtiyaç var. O test Response Time Analysis'tir.

---

## 5. Response Time Analysis (RTA): tam ve keskin

Joseph ve Pandya'nın 1986'da formalize ettiği RTA, her görev için worst-case response time'ı doğrudan hesaplar; sonra $R_i \le D_i$ kontrolü yapar. Bu koşul hem yeterli hem gereklidir; yani "hem doğrulanabilir hem de yanlış negatif üretmez."

Formül şudur:

$$R_i = C_i + \sum_{j \in hp(i)} \left\lceil \frac{R_i}{T_j} \right\rceil C_j$$

Burada $hp(i)$, $\tau_i$'den yüksek öncelikli görevlerin kümesidir. Sağ taraf $R_i$'ye bağlı; bu **implicit** bir denklemdir, kapalı formda çözülmez. Sabit nokta iterasyonuyla çözülür:

$$R_i^{(0)} = C_i, \qquad R_i^{(k+1)} = C_i + \sum_{j \in hp(i)} \left\lceil \frac{R_i^{(k)}}{T_j} \right\rceil C_j$$

İterasyon iki yerden birinde durur: $R_i^{(k+1)} = R_i^{(k)}$ olursa (fixed point bulundu, $R_i$ bu) veya $R_i^{(k+1)} > D_i$ olursa (deadline zaten aşıldı, deadline kaçıyor).

**İnce nokta:** Tavan fonksiyonu $\lceil \cdot \rceil$ kritik. Bu, $\tau_i$'nin response time'ı içinde yüksek öncelikli görev $\tau_j$'nin **kaç kere tetikleneceğini** ve tamamının preemption'a girip gireceğini sayar. Yani $\tau_j$'nin toplam preemption yükü $\lceil R_i / T_j \rceil \cdot C_j$'dir; bir sonraki $\tau_j$ tetiklenmesi $R_i$'den önce olursa, bir kez daha yer tutar.

---

## 6. Sayısal örneğe RTA uygulaması

Yukarıdaki üç görevli örnekte RM önceliklerini uygulayalım: $\tau_1$ (10 ms) en yüksek, $\tau_3$ (50 ms) en düşük öncelik.

**$\tau_1$ (en yüksek öncelik).** $hp(1) = \emptyset$; RTA denklemi $R_1 = C_1 = 3$ ms verir. $R_1 = 3 \le D_1 = 10$: geçti.

**$\tau_2$ (orta öncelik).** $hp(2) = \{\tau_1\}$.

$$R_2^{(0)} = C_2 = 6$$
$$R_2^{(1)} = 6 + \lceil 6/10 \rceil \cdot 3 = 6 + 3 = 9$$
$$R_2^{(2)} = 6 + \lceil 9/10 \rceil \cdot 3 = 6 + 3 = 9 \quad \text{(fixed point)}$$

$R_2 = 9 \le D_2 = 25$: geçti (çok geniş marj).

**$\tau_3$ (en düşük öncelik).** $hp(3) = \{\tau_1, \tau_2\}$.

$$R_3^{(0)} = C_3 = 12$$
$$R_3^{(1)} = 12 + \lceil 12/10 \rceil \cdot 3 + \lceil 12/25 \rceil \cdot 6 = 12 + 6 + 6 = 24$$
$$R_3^{(2)} = 12 + \lceil 24/10 \rceil \cdot 3 + \lceil 24/25 \rceil \cdot 6 = 12 + 9 + 6 = 27$$
$$R_3^{(3)} = 12 + \lceil 27/10 \rceil \cdot 3 + \lceil 27/25 \rceil \cdot 6 = 12 + 9 + 12 = 33$$
$$R_3^{(4)} = 12 + \lceil 33/10 \rceil \cdot 3 + \lceil 33/25 \rceil \cdot 6 = 12 + 12 + 12 = 36$$
$$R_3^{(5)} = 12 + \lceil 36/10 \rceil \cdot 3 + \lceil 36/25 \rceil \cdot 6 = 12 + 12 + 12 = 36 \quad \text{(fixed point)}$$

$R_3 = 36 \le D_3 = 50$: geçti, 14 ms marjla.

Sonuç: Liu-Layland sınırı bu kümeyi reddetti, RTA hepsini geçirdi. Kaçınılan sonuç: gerçek zamanlı sistemcinin cephanesinde utilization bound tek başına yeterli değildir. RTA kesin cevabı verir; utilization bound, "hızlı bir tarama testi"dir.

Bu farkın pratik bir yansıması var: bir görev kümesini yüzeysel bir utilization hesabıyla "olmaz" diye reddedip WCET budama seferberliği başlatan bir ekip, çoğu zaman gereksiz mühendislik masrafına giriyordur.

---

## 7. Görsel: kritik andan itibaren zaman çizelgesi

Yukarıdaki örneğin kritik anından (tüm görevlerin aynı anda tetiklendiği $t=0$'dan) itibaren ilk 40 ms'sini adım adım simüle edelim. RM önceliği $\tau_1 > \tau_2 > \tau_3$. Her hücre 1 ms; hangi görevin CPU'da olduğunu harfle gösteriyoruz ($\tau_i \to i$), boşluk yok çünkü $U < 1$'de olsak da kritik andan sonraki 36 ms boyunca CPU sürekli meşguldür.

```
t: 0    5    10   15   20   25   30   35   40
   |    |    |    |    |    |    |    |    |
   111222222311133333331113322222111233....
```

Adım adım okunuşu: $\tau_1$ 0–3'te çalışır, $\tau_2$ 3–9'da (WCET tamamı bitti, birinci job biter), $\tau_3$ 9–10'da 1 ms iş yapabilir, sonra $t=10$'da $\tau_1$'in ikinci tetiklenmesi preemption yapar (10–13), $\tau_3$ 13–20 arası 7 ms daha sürer, $t=20$'de $\tau_1$ üçüncü kez tetiklenir (20–23), $\tau_3$ 23–25 arası 2 ms daha sürer, $t=25$'te $\tau_2$'nin ikinci job'ı tetiklenir ve $\tau_3$'ten yüksek öncelikli olduğu için 25–30 arası 5 ms işler; $t=30$'da $\tau_1$'in dördüncü tetiklenmesi hem $\tau_2$'yi hem $\tau_3$'ü öteler (30–33), sonra $\tau_2$'nin kalan 1 ms'si 33–34'te biter, son olarak $\tau_3$ 34–36 arasında son 2 ms'sini yapıp tamamlanır. Toplam: $\tau_3$ için $1 + 7 + 2 + 2 = 12$ ms iş, 36. ms'de tamamlandı, deadline 50 ms — 14 ms marj. RTA'nın verdiği $R_3 = 36$ ile birebir tutarlı.

Utilization bound'un bu 14 ms marja bakmadan neden "olmaz" dediği artık daha anlaşılırdır: sınır, en kötü durumdaki periyot oranları için çizilmiş bir kalıptır ve harmonik olmayan her küme için gerçek marjı gizler.

---

## 8. Gerçek dünya düzeltmeleri: blocking, jitter, context switch

RTA'nın 5. bölümdeki formu Liu-Layland dünyasında yaşar. Aviyonik bir yazılımda üç ek terim onu bozar.

**Blocking ($B_i$).** Görev bağımsız değildir; paylaşılan kaynaklar (kilitler, mesaj kutuları, DMA kanalları) vardır. Bir düşük öncelikli görev bir kilit tutmuşken yüksek öncelikli görev tetiklenirse, kilitli kalır. Priority Inheritance Protocol (PIP) ile bu bloklamayı sınırlarsınız; en kötü durumda görev sadece kendisinden düşük öncelikli görevlerin en uzun kritik bölge sürelerinden birine takılabilir. Bunu bir $B_i$ terimi olarak $R_i$'ye eklersiniz:

$$R_i = C_i + B_i + \sum_{j \in hp(i)} \left\lceil \frac{R_i}{T_j} \right\rceil C_j$$

PIP'in görev bağımlılıkları üzerindeki etkisini analiz etmek başlı başına bir konu; Mars Pathfinder olayı bu ekleme yapılmadığında ne olabileceğinin klasik örneğidir.

**Release jitter ($J_i$).** Bir görev sabit periyotta tetiklenmeyebilir; olayla tetikleniyorsa (örneğin kesme sonrası çalışıyorsa), tetiklenme anı $\pm J_i$ salınım gösterebilir. Bu, yüksek öncelikli görevlerin belirli bir zaman diliminde bir tetiklenme daha içeri sıkıştırabileceği anlamına gelir. Düzeltme sağ taraftaki tavana geçer:

$$R_i = C_i + B_i + \sum_{j \in hp(i)} \left\lceil \frac{R_i + J_j}{T_j} \right\rceil C_j$$

**Context switch maliyeti.** Preemption anında CPU registers, FPU state, MMU/MPU register'ları saklanır ve geri yüklenir. Cortex-M4F için birkaç yüz ns, cache/MMU'lu bir Cortex-A için birkaç μs olabilir. RTA'da bunu $C_i$ içine dahil etmek — yani "$C_i$ WCET zaten context switch maliyetlerini içermeli" — en temiz yaklaşımdır. Aksi hâlde her preemption başına iki context switch maliyeti eklemek gerekir.

**Deadline neq period.** Liu-Layland $D_i = T_i$ varsayar. Bu bazı görevlerde (sensör senkronizasyonu, gecikme bütçesi ayrılmış görevler) tutmaz. Deadline Monotonic Priority Assignment (DMPA), sabit önceliği periyoda göre değil bağıl deadline'a göre atar ve $D_i \le T_i$ (constrained deadline) durumu için optimaldir. RTA aynen çalışır; sadece $D_i$ karşılaştırmasını $R_i \le D_i$ olarak yaparsınız.

---

## 9. Aviyonik bağlam: ARINC 653 ve DAL A

Aviyonikte bu teorinin adresi ARINC 653'tür. ARINC 653'te CPU zaman uzayı **major frame** adı verilen sabit uzunlukta bir çerçeveye bölünür, çerçevenin içi partition'lara ait **minor frame** pencerelerinden oluşur. Her partition kendi içinde process (görev) çalıştırır; process'ler klasik sabit öncelikli preemptive scheduling'e tabidir. Yani ARINC 653 iki katmanlı bir çizelgeleyicidir: dışta zaman-tetiklemeli partition table (statik olarak konfigüre edilir, tasarım zamanı verilir), içte RMA-tarzı fixed-priority.

Bu ikilinin schedulability analizi ilginç bir problemdir çünkü partition penceresi kapandığında görev preemption'a uğramaz — resim kayar, partition uyur, bir sonraki minor frame'de kaldığı yerden devam eder. RTA'ya bu, "yüksek öncelikli iş yükü" olarak değil, "erişilebilir CPU süresi" olarak girer. Her partition'ın kendi görev seti için RTA yaparken, response time'ın **birden fazla minor frame'e yayıldığını** hesaba katmak zorundasınızdır. Bu, pür Liu-Layland dünyasından bir sapmadır.

**DAL A açısından ne değişir?** DO-178C schedulability için özel bir yöntem dayatmaz; ama section 6.3.4.f (source code'un doğrulanması) ve 6.3.5.a (executable object code timing) bir "schedulability analysis" yapılmış olmasını **söktürür**. Sertifikasyon otoritesine sunulan Software Verification Report'ta iki şey görülmek istenir:

1. Her görevin WCET'i belgelenmiş ve bir yöntemle (ölçüm, statik analiz veya hibrit) türetilmiş olmalı.
2. Görev kümesi için çizelgelenebilirlik kanıtı olmalı; bu kanıtın gerekçesi (utilization bound, RTA, tam simülasyon) belirtilmeli.

Pratik: sertifikasyon sürecinde utilization bound tek başına yeterli sayılmaz, çünkü yeterli koşul sağlamayan kümeler pas geçilirse mühendislik hatası olur; hem yeterli hem gerekli olan RTA (blocking + jitter düzeltilmiş) standart araçtır. LDRA'nın timing analysis modülleri, RapiTime, aiT WCET Analyzer — bunlar sertifikasyon dosyalarına giren araçlardır; DO-330 kapsamında araç nitelendirme (tool qualification) ihtiyacı analize göre değişir.

---

## 10. Sık yapılan üç hata

**Bir. Utilization bound'a "hard" bir sınır muamelesi.** "$U = 0.72$, $U_{LL}(4) = 0.756$, geçtik" — bu doğrudur, ama tersini kanıt saymak yanlıştır. Sınırı geçemeyen kümeler için ilave RTA yapmadan reddetme, mühendislik masrafına yol açar. Test hem yeterli hem gerekli olan RTA'dır.

**İki. WCET'i tipik execution time zannetmek.** RTA'ya giren $C_i$, en kötü durum yürütme süresidir. Ortalama sürelerle yapılan RTA yalancı yeşil verir. Ölçümle WCET bulmak da yeterli değildir — cache'in en kötü durumu her ölçümde tetiklenmez. Ölçüm tabanlı WCET tahminine standart bir güvenlik marjı eklemek çok yaygın, ama gerçekte cache-aware statik analiz olmadan bu kestirimi savunmak zordur.

**Üç. Priority inversion'ı hesaba katmamak.** Kilitler yoksa RTA temizdir. Kilitler varsa ve PIP yoksa, blocking süresi teorik olarak sınırsızdır ("unbounded priority inversion"). Aviyonik bir çekirdek seçerken PIP veya priority ceiling protocol desteği aranmalı; RTA'da her görev için $B_i$ terimi hesaplanmalıdır. Mars Pathfinder olayı bu hatanın uzayda karşılığıdır.

---

## 11. Toparlama

Rate Monotonic teorisi, gerçek zamanlı çizelgelemenin ilk matematiksel omurgasıdır. Utilization bound bir dedektöre benzer: %69.3 (asimptotik) ışığı yanıyorsa görev kümesi kesinlikle güvenlidir; yanmıyorsa "başka bir yerden bakmak lazım" der. RTA, o başka bir yerdir: her görev için worst-case response time'ı iteratif olarak çözer, hem yeterli hem gerekli koşulu verir, blocking/jitter/context switch gibi gerçekliği hesaba katmaya izin verir.

Aviyonikte RTA'yı elle iterate etmek zorunda değilsiniz — LDRA, RapiTime, aiT gibi araçlar bunu otomatikleştirir. Ancak arka planda ne yaptıklarını bilmemek, "araç yeşil dedi" ile "yazılım deadline kaçırmayacak" arasında yanlış bir eşleme kurmaya götürür. Sonuçta sertifikasyon otoritesine karar veren siz olduğunuzda ne kadar çabuk açıklarsanız, o kadar hızlı kabul görür.

Bir sonraki adım tabii ki bu analizin daha zor versiyonları: hierarchical scheduling (ARINC 653), mixed-criticality (Vestal 2007), multicore'da paylaşılan cache/bus/DRAM'ın schedulability'e etkisi. Bunlar açık araştırma alanları; hepsi burada kurduğumuz iskeletin üzerine oturur.

---

## Kaynaklar

- Liu, C. L. & Layland, J. W. (1973). "Scheduling Algorithms for Multiprogramming in a Hard-Real-Time Environment." *Journal of the ACM*, 20(1), 46–61.
- Joseph, M. & Pandya, P. (1986). "Finding Response Times in a Real-Time System." *The Computer Journal*, 29(5), 390–395.
- Audsley, N., Burns, A., Richardson, M., Tindell, K. & Wellings, A. (1993). "Applying New Scheduling Theory to Static Priority Preemptive Scheduling." *Software Engineering Journal*, 8(5), 284–292. (RTA'nın blocking + jitter genelleştirmesi.)
- Sha, L., Rajkumar, R. & Lehoczky, J. P. (1990). "Priority Inheritance Protocols: An Approach to Real-Time Synchronization." *IEEE Transactions on Computers*, 39(9), 1175–1185.
- Buttazzo, G. C. (2011). *Hard Real-Time Computing Systems: Predictable Scheduling Algorithms and Applications* (3. baskı). Springer.
- ARINC 653P1-5. *Avionics Application Software Standard Interface — Part 1: Required Services*. Aeronautical Radio, Inc. / SAE ITC.
- RTCA DO-178C. *Software Considerations in Airborne Systems and Equipment Certification*. Section 6.3 (Reviews and Analyses of Software Requirements/Design/Code), özellikle timing/schedulability başlıkları.
- RTCA DO-330. *Software Tool Qualification Considerations*.
- Wilhelm, R., Engblom, J., Ermedahl, A. et al. (2008). "The Worst-Case Execution-Time Problem — Overview of Methods and Survey of Tools." *ACM Transactions on Embedded Computing Systems*, 7(3), Article 36. (Statik ve ölçüm tabanlı WCET yaklaşımlarına referans.)
- Vestal, S. (2007). "Preemptive Scheduling of Multi-Criticality Systems with Varying Degrees of Execution Time Assurance." *RTSS 2007*. (Mixed-criticality açılışı; bu yazının dışındaki bir sonraki halka.)

---
title: "CRC Polinom Seçimi ve Hamming Mesafesi"
subtitle: "Why Picking CRC-32 Is Rarely the Right Answer"
background: "/img/posts/6.webp"
date: '2026-05-20 09:00:00'
layout: post
lang: tr
---

Emniyet kritik bir iletişim hattını tasarlarken yapılan en yaygın hatalardan biri şudur: birisi "32-bit CRC ekleyelim, hatalardan korunuruz" der ve konu kapanır. Genellikle de eklenen CRC'nin polinomu, Ethernet'in 1980'lerden kalma `0x04C11DB7` polinomu olur — çünkü `zlib`'in içinde o vardır, dolayısıyla "standart" sayılır.

Bu seçim çoğu zaman fena değildir. Ama "fena değil" ile "doğru karar" arasındaki fark, emniyet kritik bir sistemde sahaya çıkmış bir bug'la veya temiz bir sertifikasyon kanıtı arasındaki fark olabilir. Bu yazıda CRC polinom seçiminin gerçekten ne anlama geldiğini, Hamming mesafesinin (HD) neden birincil metrik olduğunu, mesaj uzunluğunun seçimi nasıl kökünden değiştirdiğini ve "CRC-32 kullan, geç" yanılgısının nerede çatlayıp döküldüğünü konuşacağım. Aşağıda hem Phillip Koopman'ın Carnegie Mellon'daki onlarca yıllık veritabanından somut sayılar, hem de meraklı okuyucunun kendi makinesinde tekrar üretebileceği küçük bir Python deneyi var.

---

## CRC kısaca: bölmenin kalanı, hiçbir şey daha fazla değil

Mesajınızı `M(x)` adında bir polinom olarak düşünün — her bit, GF(2) (yani modülo-2) üzerinde tanımlı bir polinomun katsayısı. Generator polinomunuz `G(x)` ise (örneğin CRC-16-CCITT için `x^16 + x^12 + x^5 + 1`), CRC değeri şudur:

```
R(x) = (M(x) · x^n) mod G(x)        # n = G'nin derecesi
```

Gönderdiğiniz codeword `M(x)·x^n + R(x)`'tir; bu codeword `G(x)` ile tam bölünür. Alıcı tekrar bölme yapar, kalan sıfır değilse hata vardır.

İşte tüm hikâye bu. CRC bir polinom bölmesinin kalanıdır; gizemli bir kriptografik dönüşüm değildir, tek yönlü bir hash da değildir. Bir CRC'nin **ne kadar iyi bir CRC olduğu**, seçtiğiniz `G(x)` polinomunun cebirsel özelliklerine bağlıdır — bit sayısına değil.

Bir CRC, hata vektörü `E(x)`'i ancak ve ancak `G(x) | E(x)` olduğunda gözden kaçırır. Yani polinom seçimi, hangi hata desenlerinin geçeceğini doğrudan belirler.

---

## Hamming mesafesi: tek metrikle ölçemediğiniz şey ne ölçülebilir?

**Hamming mesafesi (HD)**, bir hata tespit kodunun gerçek dayanıklılığını ifade eden temel sayıdır. Tanım net:

> Bir `(n, k)` kodu HD=d ise; codeword'de tespit edilemeyen bir hataya yol açmak için **en az d adet bit hatasının** aynı anda oluşması gerekir.

HD=4 demek: 1, 2 ve 3 bit hata her zaman yakalanır. 4 bit hatalardan **bazıları** yakalanmayabilir — hangileri olduğu polinoma bağlıdır. HD=6 demek: 5 bite kadar her şey yakalanır.

Bu çoğu zaman göz ardı edilen bir noktadır: bir CRC'nin tespit ettiği hata sayısı tek bir sayı değildir, **mesaj uzunluğunun bir fonksiyonudur.** Aynı polinom kısa mesajda HD=6, uzun mesajda HD=4 verebilir. Codeword uzadıkça `G(x)`'in böleni olan hata polinomlarının sayısı artar; bir noktada bunlardan biri "ufak" (az bitli) bir hataya karşılık gelmeye başlar ve HD düşer.

Koopman'ın CRC veritabanı tam bu eğriyi haritalandırmak için vardır: her polinom için *"hangi mesaj uzunluğuna kadar HD kaç?"* sorusunun cevabı.

---

## Mesaj uzunluğu HD'yi nasıl çatırdatır? Ethernet örneği

IEEE 802.3 Ethernet, `0x04C11DB7` polinomunu (bilinen adıyla **CRC-32-IEEE**) kullanır. Bu polinom 1975'te seçildi, milyarlarca cihazda. Şimdi soru: bu polinom Ethernet'in maksimum frame uzunluğunda nasıl davranıyor?

Maksimum Ethernet frame (header + payload + CRC) 1518 byte = **12,144 bit** codeword'tür. Koopman'ın 2002 makalesinde yayımladığı analizden CRC-32-IEEE'nin doğrulanabilir karakteristiği şu:

- **HD=5**, codeword ≤ 2,974 bit
- **HD=4**, codeword ≤ 91,607 bit
- **HD=3**, codeword > 91,607 bit

Yani Ethernet'in jumbo frame'leri (9000 byte ≈ 72,000 bit) dahi hâlâ HD=4'tedir; ama klasik 1518 byte frame için CRC-32-IEEE'nin verdiği HD **4**'tür. Beş bit hatasından biri istatistiksel olarak gözden kaçabilir.

Şimdi karşılaştırma. Aynı uzunluk için **CRC-32C** (Castagnoli, `0x1EDC6F41`) — Intel'in SSE4.2 ile donanım komutuna bağladığı, iSCSI/SCTP/Btrfs/ext4/NVMe gibi modern protokollerin tercih ettiği polinom. Koopman ve Chakravarty (2004) Castagnoli polinomunun **Ethernet maksimum frame boyutunda HD=6** verdiğini gösterir — yani 5 bit hatasına kadar her şeyi garantili yakalar. Aynı 32-bitlik alanı kaplıyor, aynı yazılım/donanım maliyeti, ama tespit gücü bir mertebe daha yüksek. Fark, sadece polinom katsayılarındandır.

İşte Phillip Koopman'ın yıllardır vurguladığı tablo: **"hangi polinom?" sorusunun cevabı, "kaç bitlik CRC?" sorusunun cevabından çok daha önemlidir.**

---

## Bu konuyu bulmak neden zor?

Açıkça söyleyelim: bu bilgi internette dağınık ve sentezlenmemiş hâldedir. CRC veritabanı Koopman'ın CMU sayfasında durur, akademik makaleler IEEE paywall'larının arkasındadır, FAA'nın bu konudaki tek resmi rehberi olan AC 00-66 sadece "şu rapora bakın" der ve raporu ekler. Türkçe içerikte ise konu neredeyse hiç işlenmemiştir; mevcut Türkçe yazıların büyük çoğunluğu Wikipedia'nın `0x04C11DB7`'ye verdiği yarım yamalak açıklamayı tekrarlar.

Bunun pratik sonucu şudur: emniyet kritik proje yapan mühendislerin çoğu yanlış polinomu doğru olduğunu sanarak seçer. Hata tespit kapsamı standartta yer alır, kimse sorgulamaz, sertifikasyon kanıtında "CRC-32 kullanılmıştır" yazar — ama hangi CRC-32 ve hangi mesaj uzunluğunda hangi HD verdiği yazmaz.

---

## Standartların seçimleri: yan yana bakınca tablo değişiyor

Aşağıdaki tablo, gömülü/aviyonik mühendisin sahada karşılaştığı yaygın protokollerin CRC kararını özetliyor. Bilerek hem iyi hem kötü örnekler var.

| Protokol | Polinom | Hex | HD (tipik mesaj boyunda) |
|---|---|---|---|
| ARINC-429 | (CRC yok — odd parity) | – | HD=2 (tek-bit) |
| MIL-STD-1553 | (CRC yok — Manchester + parity) | – | HD=2 (tek-bit) |
| CAN classic | CRC-15 | `0x4599` | HD=6 — ama stuff-bit ile bazı desenlerde HD=2'ye düşer |
| CAN XL | CRC-17 + CRC-21 | (Senger 2020) | HD=6 frame boyunca |
| FlexRay header | CRC-11 | `0x385` | HD=6 |
| Ethernet / AFDX (ARINC-664 P7) | CRC-32-IEEE | `0x04C11DB7` | HD=4 @ 1518 byte |
| iSCSI / SCTP / NVMe / ext4 | CRC-32C (Castagnoli) | `0x1EDC6F41` | HD=6 @ 1518 byte |
| Bluetooth classic (BR/EDR) payload | CRC-16-CCITT | `0x1021` | HD=4 |
| PNG, zlib, ZIP | CRC-32-IEEE | `0x04C11DB7` | HD=4–3 (boyut bağımlı) |

Birkaç dikkat çekici nokta:

**ARINC-429 ve MIL-STD-1553'te CRC yok.** Her ikisi de tek-bit parity ile yetinir. ARINC-429 1977'de düşük hızlı, gürültüye dayanıklı bir veri yolu olarak tasarlandı; mesajları 32-bittir, 25 yıllık veri istatistikleri parity'nin pratikte yeterli olduğunu söylüyor. Ama tek bir bit hatası bile yakalanırken çift bit hata gözden kaçar; bu protokollerin daha katı veri bütünlüğü gerektiren modern kullanımları için ek bir uygulama-katmanı bütünlük şeması (sıra numarası, sequence count, mesaj-bazlı CRC) gerekir.

**CAN'da stuff-bit etkisi.** CAN classic, frame boyunca aynı bitin beş kez ardışık tekrarını engellemek için "bit stuffing" yapar — beş aynı bit görürse zıt bir bit ekler. Bu, fiziksel hat senkronizasyonu için iyidir, ama HD soyutlamasını yıkar: bir veya birkaç hatalı bit, alıcının stuff-bit yorumunu da yanlış yaptırabilir; bu da CRC için "etkin" gördüğü hata vektörünün uzunluğunu değiştirir. CiA'nın analizine göre bazı 1–2 bit hata desenleri stuffing yorumundaki kaymalar nedeniyle CRC-15'in göremediği daha uzun hatalara dönüşür ve etkin HD bu desenler için 2'ye iner. **CAN XL CRC'leri bu problem göz önünde tutularak yeniden seçildi.**

**Ethernet'in `0x04C11DB7`'si.** En çok kullanılan CRC-32 polinomu; ama Koopman 2002 makalesi çok net: aynı 32-bit ile HD=6'ya kadar çıkan polinomlar varken bu polinom HD=4'tedir. Castagnoli'nin polinomu (`0x1EDC6F41`) hem matematiksel olarak optimal hem de Intel CRC32C donanım komutuyla 10x'lere kadar hızlandırılabilir.

---

## Yaygın yanılgılar

### "Daha uzun CRC daha iyidir"

Yarı doğru. 32 bitlik CRC, 16 bitlik bir CRC'ye göre daha geniş bir codeword uzayını korur, ama **kötü seçilmiş bir 32-bit CRC, iyi seçilmiş bir 16-bit CRC'den daha az HD verebilir.** Örneğin CRC-16-CCITT (`0x1021`) 4090 bite kadar HD=4 verirken, kötü tasarlanmış bir CRC-32 aynı uzunlukta HD=2'de takılabilir. CRC genişliği "ekstra bit alan harcadığım kadar koruma alıyorum" değildir — sadece bir tavandır.

### "CRC-32 IEEE her zaman doğru cevap"

Hayır. Ethernet ve PNG için tarihî olarak makul bir seçimdi, ama:

- Aynı uzunluk için CRC-32C daha iyi HD verir.
- Intel ve ARM donanım komutları **CRC-32C için** vardır, IEEE-CRC-32 için değil — hız da daha iyi.
- 2002'de Koopman, internet uygulamaları için "iSCSI polinomu" (CRC-32C) önerdi; bugün modern sistemlerin neredeyse hepsi onu kullanır.

### "Checksum yeterli, neden CRC?"

Bu en pahalı yanılgıdır. Maxino ve Koopman'ın 2009 çalışması Fletcher ve Adler checksum'larını yan yana ölçer:

- **Fletcher-16:** Codeword 2056 bitten uzayınca HD=2'ye iner. Yani 2056 bitten sonra çift bit hataların tamamı garantili yakalanamaz hâle gelir.
- **Fletcher-8:** 68 bitten itibaren HD=2.
- **Adler-32:** Kısa mesajlarda zayıf; 1 MB'lık veri için HD=3.

Aynı genişlikteki "iyi" bir CRC, aynı HD'de bile kaçan-hata olasılığını daha düşük tutar. Tek istisna: bazı çok kısıtlı sistemlerde Fletcher'ın aritmetik basitliği önem kazanır. Ama emniyet kritik sistemde bu hız kazancı, doğru CRC polinomunu hızlı bir algoritmayla (slicing-by-8, donanım komutu) hesaplayarak da elde edilebilir.

---

## Burst hata: CRC'nin az reklamı yapılan en güçlü yönü

CRC sadece rastgele bit hatalarına karşı değil, **art arda gelen ardışık hatalar** için de istatistiksel garantiler verir. Sayısal sezgisi şudur:

**Teorem:** n-bit genişliğinde bir CRC, en fazla n bit uzunluğundaki **tüm** burst hatalarını garantili tespit eder.

Kanıtı kısa: bir burst hata, en az 1 ve en fazla `L` bit uzunluğunda, en az bir ucu "1" olan bir hata polinomudur. `G(x)`'in derecesi `n` ise `L ≤ n` için `E(x)`'in `G(x)` ile bölünebilmesi imkânsızdır — çünkü `E(x)`'in derecesi `G(x)`'in derecesinden küçüktür.

Bunun pratik anlamı:

- **CRC-15 (CAN):** 15 bit uzunluğundaki tüm burst'leri yakalar.
- **CRC-16:** 16 bit burst'lerin tamamı yakalanır.
- **CRC-32:** 32 bitlik tüm burst'ler.

`L = n+1` durumunda kaçma olasılığı `2^{-(n-1)}`'dir. `L > n+1` için kaçma olasılığı en kötü `2^{-n}`'dir.

Bu özellik, yalnızca CRC'ye özgüdür. Fletcher veya Adler checksum'larında burst-hata davranışı çok daha zayıftır; ardışık birkaç bit ters dönerse aritmetik toplamın değeri korunabilir, çünkü ekleme operasyonu bu hatalara karşı taraflı değildir.

---

## Mat. türetme: tek bir hata polinomu CRC'yi nasıl atlatır?

Hatanın CRC'yi atlatması demek `G(x) | E(x)`, yani `G(x)` `E(x)`'i tam böler demektir. Bir hatanın atlatma olasılığını analiz etmek için kombinatoryal sayım yapılır.

Diyelim ki k-bit dataword'ümüz var, n-bit CRC'miz var. Toplam codeword uzunluğu N = k+n. j bitlik bir hata için olası hata vektörü sayısı `C(N, j)`'dir. Bunlardan kaçı `G(x)`'in katıdır?

`G(x)`'in `N` bite kadar olan katlarının sayısı `2^{N-n}` — `2^k`'dir. Yani toplam `2^N` codeword'ün `2^k`'sı meşru, geri kalan `2^N - 2^k`'sı hata. CRC'nin tespit edemediği hata sayısı tam olarak `2^k - 1` (sıfır hatası dahil değil, sadece sıfır olmayan codeword polinom katları).

Bu noktadan sonra polinomun cebirsel detayı devreye girer: hangi `2^k - 1` polinomu meşru codeword'lere eklendiğinde "az bitli" bir hata gibi görünür? Bu, polinomun bölenleri ile yakından ilişkilidir — özellikle `G(x)`'in primitif olup olmadığı, faktörize edilebilir olup olmadığı.

İşte Koopman'ın veritabanını oluştururken yaptığı tam olarak budur: her aday polinom için, mümkün olan tüm hata vektörlerini sayıp HD'yi mesaj uzunluğunun bir fonksiyonu olarak çıkarır. Brute-force aramayla 32 bite kadar tüm polinomlar değerlendirilmiştir; sonuç tablolar Koopman'ın CMU sayfasındadır.

---

## Python deneyi: kendi polinomunu Hamming mesafesine karşı test et

Aşağıdaki kısa script, küçük bir polinom için Hamming mesafesini kaba kuvvetle hesaplar. Hedef: bir gece kendi makinenizde çalıştırın ve teorinin verdiği sayıyı kendi gözünüzle teyit edin.

```python
"""
Belirli bir polinom + dataword uzunluğu için tam Hamming mesafesini
hesaplar. Yöntem: tüm d-bit hata desenlerini sırayla dener, ilk olarak
generator polinomuna tam bölünen deseni (tespit edilemeyen hata)
bulduğunda d'yi döner.

Sadece küçük (n + k <= ~25 bit) parametreler için pratiktir; daha uzun
mesajlar için Koopman'ın yayımladığı `hdlen` aracını kullanın.
"""
from itertools import combinations

def hamming_distance(poly, n, k):
    """
    poly: G(x) — en yüksek bit dahil n+1 bitlik tamsayı
    n   : CRC genişliği (bit)
    k   : dataword uzunluğu (bit)
    Döner: tespit edilemeyen ilk hatanın bit sayısı (yani HD).
    """
    N = k + n
    for d in range(1, N + 1):
        for positions in combinations(range(N), d):
            err = 0
            for p in positions:
                err |= 1 << p
            # E(x) mod G(x) — eğer sıfır olursa CRC bu hatayı görmez
            reg = err
            for i in range(N - 1, n - 1, -1):
                if (reg >> i) & 1:
                    reg ^= poly << (i - n)
            if reg == 0:
                return d
    return N + 1  # teorik üst sınır

# Birkaç bilinen küçük polinom — çıktıyı kendi makinenizde teyit edin
# CRC-3-GSM:  x^3 + x + 1     -> 0b1011  = 0x0B
# CRC-4-ITU:  x^4 + x + 1     -> 0b10011 = 0x13
# CRC-5-USB:  x^5 + x^2 + 1   -> 0b100101 = 0x25
for name, poly, n, k in [
    ("CRC-3-GSM", 0x0B, 3, 4),
    ("CRC-4-ITU", 0x13, 4, 8),
    ("CRC-5-USB", 0x25, 5, 11),
]:
    print(f"{name} (k={k}): HD = {hamming_distance(poly, n, k)}")
```

Bu denemeyi `combinations(range(N), d)` çevriminin patladığı boyuta kadar genişletip "**aynı n için farklı polinomlar farklı HD veriyor**" tezini kendiniz gözlemleyebilirsiniz. Örneğin n=8 için aynı dataword uzunluğunda Koopman'ın optimal önerisi `0x9B`'yi CRC-8/AUTOSAR'da kullanılan `0x2F` veya CCITT'in eski `0x07`'siyle karşılaştırın — farklı polinomlar farklı HD üretir; bu da neden polinom seçiminin "bit sayısı kararı" değil "cebir kararı" olduğunu doğrudan gösterir.

Algoritma O(C(N, d) · N) çalışır — gerçek polinomlar için (32 bit codeword, d=5+) on milyarlarca kombinasyona ulaşır. Üretim ölçeğinde bu deneyimi yapmak için Koopman'ın açık kaynaklı `hdlen` aracı tercih edilir; ama küçük parametrelerle "polinom bölünür / bölünmez" davranışını kendi gözünüzle görmek için yukarıdaki script yeterlidir.

---

## Implementasyon: doğru polinomu seçtiniz, peki nasıl hesaplarsınız?

Polinom seçimi yaratıcı kısımdır; implementasyon zanaattır. Üç katmana ayırmak gerekir:

**Bit-bit yazılım hesaplaması.** En basit. Her bit için bir XOR ve kaydırma. ~10x daha yavaş. Sadece ROM kısıtı uç noktada olan mikrokontrolörler için.

**Sarwate algoritması (byte-bazlı, 256 girişli tablo).** Yaygın gömülü sistemde varsayılan. 1 KB ROM/SRAM. Mesaj uzunluğu ile lineer.

**Slicing-by-4 ve slicing-by-8.** Intel'in 2006'da tanıttığı, 32-64 bitlik kelimeleri tek seferde işleyen versiyon. 4-8 KB tablo. Cache'i sıcak tutarsanız Sarwate'in 2.6x'i. Modern Linux kernel `lib/crc32.c` bunu kullanır.

**Donanım komutu.** Intel SSE4.2'de `CRC32` komutu *yalnızca* CRC-32C için vardır (Castagnoli polinomu). ARMv8'in isteğe bağlı CRC eklentisinde hem IEEE-CRC-32 hem CRC-32C için komutlar var. Bir Cortex-A53 üzerinde bu, ~10x'lik hız kazancına karşılık gelir. Yani aviyonik bir sistemde Zynq UltraScale+ tarafında CRC-32C kullanırsanız donanım komutu sizi bedavaya hızlandırır.

Burada kritik bir mühendislik kararı vardır: **standart polinom seçtiniz diye düşünüp uygulamanızı yıllarca yavaş tutmayın.** Eğer "CRC-32-IEEE" kullanan eski bir kod yığını miras aldıysanız ve donanım CRC32C'i destekliyorsa, taşımanın değdiği bir alan olabilir — hem hız hem HD aynı anda iyileşir. (Ama protokol-uyumluluğu kıracaksa bunu yapmayın; protokol uyumu polinom seçimini sabitler.)

---

## Mühendis için karar rehberi

Bu listeyi gerçek bir tasarım kararı verirken kullanın:

1. **Mesaj uzunluğunuzu (bit cinsinden) tanımlayın.** Bu, ilk önemli girdidir; "byte" düşünmek yanıltır.
2. **Hedef Hamming mesafenizi belirleyin.** Emniyet kritik sistemlerde tipik olarak HD=6 (her 5 bit hatasına kadar garantili tespit) hedeflenir. Sistem güvenliği analizinden (ARP4761) gelen hata oranı bütçesi, gözden kaçan bit-hata olasılığının ne kadar olabileceğini belirler; CRC genişliği ve HD seçimi bu bütçeye geri-yansıtılarak yapılır — doğrudan ARP4761 sayfasından çıkmaz, ama sistem analizinin bir alt-bütçesidir.
3. **Koopman'ın tablolarından (CMU sayfası) o uzunluk + HD için optimal polinomu bulun.** CRC genişliği önce değil; kriter önce.
4. **Burst-hata profilinizi gözden geçirin.** Fiziksel katmanınız genelde tek-bit'li bağımsız hatalar mı, yoksa yığılmış burst'ler mi üretir? CRC genişliği burst tespit garantisinin alt sınırını verir.
5. **Stuff-bit veya çerçeveleme tuhaflıkları var mı?** CAN classic gibi durumlarda HD'yi soyut tablodan değil, gerçek frame davranışı altında hesaplayın.
6. **Donanım hızlandırması var mı?** Hedef CPU'nuzun CRC komutlarını destekleyip desteklemediğini öğrenin; varsa polinom seçiminizi buna göre kalibre edin.
7. **Sertifikasyon kanıtınızda sadece "CRC-32 kullanıldı" yazmayın.** Polinomu hex olarak, mesaj uzunluk aralığını, hedef HD'yi ve hangi referansa dayandığınızı açıkça belirtin. AC 00-66 + DOT/FAA/TC-14/49 bu konunun bilinen tek otoritatif rehberidir; alıntılayın.
8. **CRC'yi başka bir entegrite katmanıyla kombinlemek gerekiyor mu?** Çok katmanlı sistemlerde (örn. AFDX VL + uygulama protokolü) iki katmanlı CRC'lerin etkin HD'si trivial bir çarpım değildir; analiz gerekir.

---

## Açık sorular ve ileri okuma

Birkaç şey hâlâ aktif tartışma alanı:

**Donanım hızlandırma için optimize edilmiş polinomlar.** CRC-32C'nin Intel SSE4.2'ye girmesi seçimi pratikte sabitledi; ama gelecekteki ISA'larda farklı polinomların donanım desteği gelirse seçim baştan değişebilir.

**Çok katmanlı hata tespit kapsamı.** AFDX bir frame'de Ethernet CRC-32 taşır; üzerine konan ARINC-664 sistem-mesajları kendi entegritelerini yönetir. İkisinin bileşik HD'si nedir? İki katmanlı CRC'lerin etkin tespit gücü trivial bir çarpım değildir; aynı polinomu iki kez kullanmak korelasyon yaratabilir. Bu, akademik literatürün hâlâ olgunlaşmakta olduğu bir alandır.

**Kuantum sonrası dünyada CRC'nin yeri.** CRC kriptografik değildir; aktif saldırıya karşı hiçbir koruma sağlamaz. Aviyonik siber güvenlik çağında (DO-326A/ED-202A) hata tespit kodlarının yanına mesaj kimlik doğrulaması (MAC, HMAC, CMAC) konması gerekir — ama bu ayrı bir yazı konusu.

---

## Kaynaklar

- Koopman, P. **"Best CRC Polynomials."** Carnegie Mellon University. <https://users.ece.cmu.edu/~koopman/crc/>
- Koopman, P. **"32-Bit Cyclic Redundancy Codes for Internet Applications."** DSN 2002. <https://users.ece.cmu.edu/~koopman/networks/dsn02/dsn02_koopman.pdf>
- Koopman, P., Chakravarty, T. **"Cyclic Redundancy Code (CRC) Polynomial Selection For Embedded Networks."** DSN 2004. <https://users.ece.cmu.edu/~koopman/roses/dsn04/koopman04_crc_poly_embedded.pdf>
- Koopman, P., Driscoll, K., Hall, B. **"Selection of Cyclic Redundancy Code and Checksum Algorithms to Ensure Critical Data Integrity."** DOT/FAA/TC-14/49, March 2015. <https://users.ece.cmu.edu/~koopman/pubs/faa15_tc-14-49.pdf>
- Maxino, T. C., Koopman, P. **"The Effectiveness of Checksums for Embedded Control Networks."** IEEE Transactions on Dependable and Secure Computing, 2009. <https://users.ece.cmu.edu/~koopman/pubs/maxino09_checksums.pdf>
- Castagnoli, G., Brauer, S., Herrmann, M. **"Optimization of Cyclic Redundancy-Check Codes with 24 and 32 Parity Bits."** IEEE Trans. Communications, 1993.
- FAA. **"Advisory Circular AC 00-66: Selection of Cyclic Redundancy Code and Checksum Algorithms to Ensure Critical Data Integrity."** August 2015.
- Senger, C. **"CRC Error Detection for CAN XL."** CAN Newsletter Magazine, June 2020. <https://www.can-cia.org/fileadmin/cia/documents/publications/cnlm/june_2020/20-2_p14_cnlm_crc_error_detection_for_can_xl_dr_christian_senger_institute_of_telecommunications_university_of_stuttgart.pdf>
- CAN in Automation. **"Cyclic Redundancy Check (CRC) in CAN Frames."** <https://www.can-cia.org/can-knowledge/cyclic-redundancy-check-crc-in-can-frames>
- Intel Corporation. **"Fast CRC Computation for Generic Polynomials Using PCLMULQDQ Instruction."** White Paper, 2009.
- ARINC. **ARINC Specification 664P7: Aircraft Data Network, Part 7 - Avionics Full-Duplex Switched Ethernet Network.**
- IEEE Std 802.3-2018. **"IEEE Standard for Ethernet."**

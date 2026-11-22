# Araştırma notları — Üç kanallı oylama / medyan oylayıcının çökme noktaları

Tarih: 2026-10-09 · Alan: emniyet & güvenilirlik / uçuş kontrol

## Neden bu konu (novelty)

Medyan (mid-value select) oylayıcı, Türkçe ve İngilizce içerikte "üç sensör varsa
ortancayı al" düzeyinde, çözülmüş bir problem gibi anlatılıyor. Oylayıcının
**ne zaman çöktüğü** ise üç ayrı yerde dağınık duruyor: (1) kaza raporlarının
sistem tasarımı bölümlerinde, (2) pahalı standart belgelerinde (ARP4754A /
ARP4761 ortak neden analizi), (3) 1980'lerin patent ve NASA teknik raporlarında.
Bu üçünü birleştiren, somut sayı veren Türkçe bir metin yok. Ayrıca yaygın bir
yanılgı var: "medyan tek arızaya dayanıklıdır" doğru, ama bu dayanıklılığın
**kanal bağımsızlığı varsayımına** dayandığı neredeyse hiç söylenmiyor.

## Derinlik öğesi (Bölüm 7)

İki tane kullanıldı:
1. **Gerçek bir bug'ın yeniden üretimi** — ATSB raporundaki FCPC AOA algoritması
   modellendi, QF72'deki iki-spike senaryosu çalıştırıldı, raporun verdiği
   `AOA_FCPC_input = 26°` değeri bağımsız olarak üretildi (26,46°).
2. **Kodlama/bit incelemesi** — ARINC 429 BNR alan ağırlıklarından, 37.000 ft
   irtifa değerinin AOA alanı olarak okunduğunda 50,625°; 12.492 ft'in 16.875°
   verdiği gösterildi. Raporun kaydettiği iki spike değeriyle birebir eşleşiyor.

Simülasyon kodu: `/private/tmp/.../scratchpad/sim/voter.py` (yazıya gömüldü).

## Doğrulanmış olgular (kaynak bazında)

### ATSB AO-2008-070 (QF72, A330-303 VH-QPA, 7 Ekim 2008, Learmonth'un 154 km batısı)

- FCPC, ADIRU parametrelerinin **çoğu** için medyan kullanıyordu (böl. 2.1.5).
  Rapor: medyan kullanımı "common technique", "generally robust", ama bir
  algoritmanın etkili çalışması için başka birçok konu düşünülmeli (Butler 2006
  → gerçekte Butler 2008, NASA/TM-2008-215108; raporun kaynakçası s. 13170).
- **AOA için medyan KULLANILMADI.** Gerekçe fiziksel: AOA 1 gövdenin solunda,
  AOA 2 ve AOA 3 sağda birbirine yakın (böl. 1.6.4). Yan kayma (sideslip) gibi
  durumlarda AOA 2 ve 3 tutarlı biçimde sapabilir; medyan bu durumda doğruya en
  yakın olan AOA 1'i reddeder. Bu yüzden `AOA_average = (AOA1 + AOA2)/2`.
- İzleme (böl. 2.1.4): üç değer **40 ms'de bir** (25 Hz) okunur; bir değer
  medyandan eşiği aşacak kadar **1 saniyeden uzun** süre saparsa ilgili ADR
  **uçuşun kalanı için** reddedilir. *Bu reddetme mürettebata uyarı/mesaj
  üretmiyordu.*
- `AOA_FCPC_input` rate limit'lidir. AOA 1 veya AOA 2 medyandan eşik kadar
  saparsa, son geçerli değer **1,2 saniye** boyunca hatırlanır (memorisation).
- 1,2 s'nin sonunda: mevcut AOA 1 ve AOA 2'nin ortalaması **tek bir örnek için**
  doğrudan kullanılır — **rate limit yok, üç değer arasında karşılaştırma yok**
  (1 saniyelik tutarlılık izlemesi dışında). Tasarım boşluğu tam buradadır.
- Memorisation süresi içindeki başka spike'lar yeni bir periyot başlatmaz.
- Senaryo D: AOA 1'de iki spike, ikincisi birincinin başlangıcından 1,2 s sonra
  → ikinci spike geçerli kabul edilir.
- Olay sayıları: ilk spike 50,6° (AOA 2 = 2,3°) → `AOA_FCPC_input = 26°`,
  10° nose-down elevator komutu, maksimum -8,4° pitch açısı, -0,80 g.
  Simülasyon, 26°'nin ~400 ms sürdüğünü gösterdi → spike 400 ms'den uzun,
  1 s'den kısa (yoksa ADR 1 reddedilirdi).
- Eşik ve rate limit değerleri raporda **verilmiyor** → yazıda örnek değer
  kullanıldığı açıkça belirtildi.
- SSA (böl. 2.5.3): "use of erroneous value, greater than the actual one" →
  sonuç "runaway of the AOA protection: pitch-down command on the elevators that
  cannot be counteracted by the crew" → `hazardous` sınıfı → hedef
  "extremely remote", üretici kendi hedefini "extremely improbable" koymuş.
  SSA'nın bulduğu **tek** senaryo: **iki ADR'nin aynı anda hatalı veri vermesi**;
  ADIRU FMEA'larına dayanarak olasılığı **10⁻⁹/uçuş saati altında** hesaplanmış.
  1,2 s'lik çoklu spike senaryosu SSA'da hiç yok.
- Böl. 2.5.4: senaryonun bulunamama nedenleri — ADIRU üreticisinin FMEA'sı bu
  arıza modunu (çoklu, tespit edilmeyen spike) içermiyordu; 1991-92 tasarım
  döneminde böyle bir davranış bilinmiyordu; karmaşık bir sistemde tüm arıza
  modlarını simülasyon/testle bulmak pratik değil.
- 1992-2009 arası 28 milyon+ A330/A340 uçuş saatinde bu tek örnek.
- ADIRU arıza mekanizması: LTN-101'in CPU modülü **bir parametrenin değerini
  başka bir parametrenin etiketiyle** birleştiriyordu. 128 milyon+ birim
  çalışma saatinde 3 bilinen olay.
- Bit eşleşmesi (böl. 3.3.4): ilk 50,625° spike'ının ikili değeri o andaki
  irtifanın (37.000 ft) ikili değerine karşılık geliyor. Mach spike'larının
  %88'i irtifa değeriyle **tam** eşleşiyor. İlk 16,875° spike'ı ise 12.492 ft'e
  karşılık geliyor. FDR'de AOA bit 20-27 + işaret, irtifa bit 14-27 + işaret
  kaydediliyor; AOA için bit 27 = 45°, irtifa için bit 27 = 32.768 ft.
- Yaralanmalar: 303 yolcudan en az 110'u ve 12 kabin/uçuş ekibinden 9'u
  yaralandı; 12 kişi ciddi.
- Üretici AOA algoritmasını sonradan yeniden tasarladı.

### LH1829 (A321-231 D-AIDP, 5 Kasım 2014, Bilbao çıkışı)

- Birincil düzenleyici metin: FAA AD 2017-16860 (EASA AD 2015-0135 ve öncesi
  EASA 2014-0266-E / FAA Emergency AD 2014-25-51'in devamı). Metin:
  "An occurrence was reported where an Airbus A321 aeroplane encountered a
  blockage of two Angle of Attack (AOA) probes during climb, leading to
  activation of the Alpha Protection (Alpha Prot) while the Mach number
  increased. The flight crew managed to regain full control and the flight
  landed uneventfully."
- Mekanizma (aynı AD): "When Alpha Prot is activated due to blocked AOA probes,
  the flight control laws order a continuous nose down pitch rate that, in a
  worst case scenario, cannot be stopped with backward sidestick inputs, even in
  the full backward position. If the Mach number increases during a nose down
  order, the AOA value of the Alpha Prot will continue to decrease. As a result,
  the flight control laws will continue to order a nose down pitch rate, even if
  the speed is above minimum selectable speed, known as VLS."
- "This condition, if not corrected, could result in loss of control of the
  airplane."
- Nedensel zincir: belirli UTC Aerospace (Goodrich) / SEXTANT-THOMSON AOA
  sensörlerinin tıkanmaya daha yatkın olduğu; AOA sensör konik plakalarının
  değiştirilmesi, prob değişimi ve ısıtma fonksiyon testi istendi.
- İlk düzeltme **prosedüreldi**: AFM'e anormal Alpha Prot prosedürü eklenmesi
  (FAA Emergency AD 2014-25-51, 10 Aralık 2014). Donanım düzeltmesi 2017'de.
- İkincil kaynaklar (aviation-safety.net wikibase, AeroInside; BFU'nun Kasım
  2014 bülteni aktarılıyor): 07:56'da AOA 1 sabit 4,2°'de kaldı, bir dakika
  sonra AOA 2 sabit 4,6°'de kaldı; FL195'e tırmanırken dış hava -35 °C;
  mürettebat FAC 1 ve 2'yi yeniden başlattı, sonuç alamadı; ADU'ları devre dışı
  bırakınca kurtarabildi; ~4.000 ft irtifa kaybı. **Bu sayılar birincil rapordan
  değil** → yazıda bu şekilde etiketlendi. Flightglobal 4,5° / 4,2° diyor,
  yani ikincil kaynaklar birbirini tutmuyor; yazıda tek bir sayıya
  yüklenmedi.
- A320 ailesinin AOA konsolidasyon mantığının ayrıntısı kamuya açık değil →
  yazıda A320'nin oylama kuralı hakkında iddia yok, yalnızca genel ilke.

### Literatür

- US 4,276,648 — "Midvalue signal selection and fault detection apparatus and
  method", Boeing, buluş sahibi Lloyd R. Tomlinson; başvuru 4 Eylül 1979,
  tescil 30 Haziran 1981. MVS + integral equalization (statik ofsetleri
  eşitleme) + hızlı/yavaş uyuşmazlık izleme. Patent, iki kanal tek bir ek arıza
  felakete yol açacak kadar ayrıştığında operatörü uyarmayı da içeriyor.
- Butler, R. W. (2008), *A Primer on Architectural Level Fault Tolerance*,
  NASA/TM-2008-215108, NTRS 20080009026. ATSB raporunun atıf verdiği kaynak.

## Reddedilen alternatif konular (bu çalıştırma)

- **ARINC 429 bit seviyesi anatomisi** — açık PR #122 (endianness, 1553/429) ve
  #173 (MIL-STD-1553B) ile kısmi örtüşme riski. (Bu yazıda 429 yalnızca bir
  araç olarak, bit takma adı (aliasing) örneği için kullanıldı.)
- **Dead code vs deactivated code (DO-178C 6.4.4.3)** — yapısal kapsama alt-alanı
  açık PR'larda doygun (#77 MC/DC, #146 object code coverage, #168 data/control
  coupling, #186 model kapsaması).
- **Quaternion vs Euler / gimbal lock** — navigasyon alt-alanı doygun (#167 RAIM,
  #103 Kalman, #102 ILS, #129 Allan deviation, #170 I/Q) ve internette zaten bol.
- **CORDIC sabit nokta** — #114 (Q15 FIR) ile örtüşüyor.

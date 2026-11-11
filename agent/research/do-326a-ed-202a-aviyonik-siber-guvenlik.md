# Araştırma Notları — DO-326A / ED-202A

> Konu: Aviyonik siber güvenlik sertifikasyonu, DO-178C ile farklar, EASA Part-IS,
> FAA AC 119-1A.

## Standart ailesi

| Doküman | Başlık | Tarih | Eşdeğer |
|---------|--------|-------|---------|
| RTCA DO-326A | Airworthiness Security Process Specification | Ağustos 2014 | EUROCAE ED-202A |
| RTCA DO-356A | Airworthiness Security Methods and Considerations | Haziran 2018 | EUROCAE ED-203A |
| RTCA DO-355(A) | Information Security Guidance for Continuing Airworthiness | — | EUROCAE ED-204(A) |
| RTCA DO-357 | Supplements to DO-326A and DO-356A | — | EUROCAE ED-205 (Process Standard for Security Certification / Declaration of Air Traffic Management / Air Navigation Services Ground Systems — farklı kapsam) |
| RTCA DO-391 | Aeronautical Information System Security (AISS) Framework | — | EUROCAE ED-201A |
| RTCA DO-392 | Security Event Management Guidance | — | EUROCAE ED-206 |

Notlar:
- DO-326 (orijinal) 2010, DO-326A 2014. DO-326B revizyonu RTCA gündeminde — tarih
  henüz net değil. ED-202A halen geçerli yayın.
- 2019'da DO-326A / ED-202A FAA ve EASA tarafından **kabul edilen tek AMC** olarak
  konumlandı (kaynak: AviationToday Mayıs 2019, AFuzion).

## Anahtar kavramlar

- **IUEI (Intentional Unauthorized Electronic Interaction)** — DO-326A'nın
  tanımladığı tehdit türü. Sıklıkla "siber tehdit" olarak çevrilir.
- **AWSP (Airworthiness Security Process)** — yedi adımlı süreç:
  1. Plan for Security Aspects of Certification (PSecAC)
  2. Security Scope Definition
  3. Security Risk Assessment
  4. Risk Acceptability Determination
  5. Security Development
  6. Security Effectiveness Assurance
  7. Communication of Evidences

- Yedi adım toplam **14 aktiviteye** ayrılır; her aktivite bir artifakt üretir:
  PSecAC, PSecAC Summary, ASSD, PASRA, ASRA, SSSD, PSSRA, SSRA, ASAM, ASOG, ASV, …
  (Coracademy makalesi, Tonex eğitim kataloğu).

- **SAL (Security Assurance Level)** — DO-326A'da SAL0–SAL3 ölçeği; SAL3 en güçlü.
  Doğrulama derinliği SAL'a göre değişir. Tedarikçilerin yorumu farklılaşıyor (LDRA,
  PTC, AFuzion blog'larında SAL0/1/2/3 anlatımı).

- **PSecAC ↔ PSAC analojisi** — PSecAC DO-178C'deki PSAC ile birebir aynı role
  sahip: yaşam döngüsünü, faaliyetleri, kanıtları planlar.

## DAL ↔ SAL ilişkisi (kabul gören yorum)

Tedarikçi ve danışman dokümantasyonu (PTC, AFuzion, Wind River, LDRA) şunu söylüyor:
SAL atama, security risk severity'ye dayanır; DAL ise (DO-178C/ARP4761) failure
condition severity'ye. İki ölçek **otomatik eşlenmez** — bir DAL A bileşeni SAL3
olmak zorunda değildir (örneğin tamamen izole edilmiş, harici arayüzü olmayan bir
DAL A modülünün IUEI yüzeyi yok denecek kadar küçükse SAL0 atanabilir). Bu konu
yorum belirsizliği yaratıyor.

## Airworthy vs Operational sınırı (yorum belirsizliği)

DO-326A kapsamı = **tip tasarımının (type design) süregelen uçabilirliği**.
Aşağıdakiler kapsama girer:
- Aircraft Security Operator Guidance (ASOG) — operatöre verilen prosedürler
- ASRA, SSRA — risk değerlendirmesi
- Yazılım/donanım tasarım kararları

Aşağıdakiler **DO-326A kapsamı dışı**:
- Hava yolu IT altyapısının siber güvenliği
- Yer istasyonu, planlama sistemleri
- Bilet/check-in sistemleri

Sınır gri bölgeleri:
- EFB (Electronic Flight Bag) Class 1/2/3 → Class 3 (kurulu) DO-326A kapsamına
  giriyor; Class 1/2 girmiyor.
- Maintenance laptop'lar → tasarım kararı: kalıcı bağlantı varsa kapsam içi.
- ACARS/CPDLC veri bağlantıları → uçak tarafı kapsam içi, yer tarafı dışı.

Bu belirsizlikler **DO-355A** (continuing airworthiness) ve **EASA Part-IS** ile
giderilmeye çalışılıyor.

## EASA Part-IS

- **Delegated Regulation (EU) 2022/1645** — 03/10/2022 yayınlandı.
  Uygulanabilirlik: 16/10/2025. Kapsam: tasarım/üretim kuruluşları (DOA/POA),
  havaalanları, vb.
- **Implementing Regulation (EU) 2023/203** — 27/01/2023 yayınlandı.
  Uygulanabilirlik: 22/02/2026. Kapsam: hava taşıyıcıları (AOC), Part-145
  bakım, CAMO, ATO, AeMC, FSTD operatörleri.
- Part-IS bir **organizasyon-seviyesi** zorunluluk; ürün-seviyesi siber
  güvenlik (DO-326A) ile tamamlayıcı, çakışmaz.

## FAA AC 119-1A

- Eylül 2023 yayınlandı; AC 119-1'i (2015) iptal etti.
- Adı: "Operational Authorization of Aircraft Network Security Program (ANSP)"
- Operasyonel onay için ANSP kurma gereksinimleri; tasarım tarafında DO-326A
  kullanmaya yönlendiriyor.
- ASISP (Aircraft Systems Information Security Protection) — FAA'in çatı kavramı.

## Yaygın yanılgılar (literatürden derleme)

1. "DO-326A DO-178C'nin yerini alır" — yanlış. Paralel ve tamamlayıcı.
2. "Her DAL A bileşeni SAL3'tür" — yanlış. Otomatik haritalama yok.
3. "Standart bir security kontrol listesi var" — yanlış. Süreç tabanlı, kontrol
   listesi yok; SecRA çıktısı tasarımı yönlendirir.
4. "EFB siber güvenliği DO-326A kapsamı" — kısmen. Sadece Class 3.
5. "Pen-test yapınca uygunluk sağlanır" — yanlış. Pen-test 'Security Effectiveness
   Assurance' adımının bir parçası, yeterli değil.

## Kaynaklar (yazıda kullanılacak — hepsi açık)

1. EASA — Information Security (Part-IS) FAQ:
   https://www.easa.europa.eu/en/the-agency/faqs/information-security-part
2. EASA — Easy Access Rules for Information Security (2025 revizyonu):
   https://www.easa.europa.eu/en/document-library/easy-access-rules/easy-access-rules-information-security-regulations-eu-2023203
3. EASA — Part-IS yayın haberi:
   https://www.easa.europa.eu/en/newsroom-and-events/news/part-regulation-published-completing-regulatory-framework-cyber-resilient
4. FAA AC 119-1A:
   https://www.faa.gov/regulations_policies/advisory_circulars/index.cfm/go/document.information/documentID/1042159
5. FAA ASISP sayfası:
   https://www.faa.gov/aircraft/air_cert/design_approvals/dah/cybersecurity
6. AviationToday — "How DO-326 and ED-202 Are Becoming Mandatory" (2019):
   https://www.aviationtoday.com/2019/05/01/326-ed-202-becoming-mandatory-airworthiness/
7. Coracademy — DO-326A plain-English guide:
   https://coracademy.co.uk/insights/what-is-do-326a.html
8. AFuzion — DO-326A/ED-202A genel bakış:
   https://afuzion.com/do-326a-ed-202a-aviation-cyber-security/
9. Jamasoftware — DO-326 modern threats:
   https://www.jamasoftware.com/blog/blog-cybersecurity-in-the-air-addressing-modern-threats-with-do-326a/
10. PTC — DO-326A intro:
    https://www.ptc.com/en/blogs/alm/do-326a-an-introduction-to-cybersecurity-safety-in-avaiation-and-aircraft-systems
11. Wind River — Secure Avionics Systems / DO-356A approach:
    https://www.windriver.com/resource/a-security-strategy-for-avionics-systems
12. NIST — "Security Assurance Levels: A Vector Approach" (akademik):
    https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=906330
13. Military Embedded Systems — Incorporating DO-326A into SDLC:
    https://militaryembedded.com/avionics/safety-certification/incorporating-do-326a-security-airworthiness-into-software-development-life-cycle

## Derinlik öğesi (Bölüm 7)

Yazı iki ayrı derinlik öğesi taşıyacak:
1. **Standart yorumu (ambiguity interpretation)** — airworthy/operational sınırı ve
   DAL↔SAL ilişkisindeki belirsizlik, kabul gören tedarikçi yorumlarıyla birlikte.
2. **Worked example (hipotetik)** — bir bakım Ethernet portu üzerinden gelen
   IUEI tehdidinin AWSP 7 adımı boyunca takibi.

## Neden bu konuyu Türkçe'de bulmak zor?

- DO-326A standart metni paywall arkasında (RTCA store).
- Türkçe akademik/blog literatürü neredeyse yok; mevcut yazıların büyük kısmı
  "siber güvenlik genel" düzeyinde, aviyonik-spesifik değil.
- Konunun kavşağında üç ayrı disiplin var: safety engineering (DO-178C/254/ARP4761),
  cybersecurity (genel IT/OT), regülasyon (EASA/FAA). Üçünü birden anlayan kaynak az.
- EASA Part-IS düzenlemesinin yürürlüğe girmesi 2025-2026 — konu yeni güncellendi.

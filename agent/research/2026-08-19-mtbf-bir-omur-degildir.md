# Araştırma Notları — MTBF Bir Ömür Değildir (10⁻⁹ aritmetiği)

Tarih: 2026-08-19 · Alan: güvenilirlik · Derinlik öğesi: matematiksel türetme + sayısal analiz

## Neden bu konu (novelty)

Türkçe kaynaklarda MTBF neredeyse tamamen "ortalama ömür" olarak yanlış anlatılıyor.
Doğru içerik üç ayrı yerde dağınık duruyor: (a) pahalı/erişimi zor standart belgeleri
(MIL-HDBK-217F, FIDES, IEC 61709), (b) sertifikasyon dokümanları (AC 25.1309-1B,
ARP4761A), (c) akademik güvenilirlik literatürü. En kritik köprü — bileşen λ'sı ile
10⁻⁹/uçuş saati hedefi arasındaki *maruz kalma süresi* çarpanı — Türkçe içerikte
neredeyse hiç anlatılmıyor. Ayrıca "yazılımın MTBF'i" istenen RFP'ler hâlâ dolaşımda.

Son 3 yayınlanan yazının alt-alanları: sistem düşüncesi (Antikırılgan), yazılım tasarımı
(Coupling), navigasyon/füzyon (Kalman). Bu yazı "güvenilirlik" alanına dönüyor.
Açık 53 PR'ın hiçbiri güvenilirlik tahmini / MTBF konusunu işlemiyor (en yakını #96 FTA,
o da nitel cut-set analizi — çakışmıyor).

## Doğrulanan olgular

| İddia | Kaynak | Durum |
|---|---|---|
| MIL-HDBK-217F Notice 2 tarihi: 28 Şubat 1995 | Reliability Analytics / everyspec / NAVSEA PDF | ✔ |
| MIL-HDBK-217G projesi tamamlanmadı; 217F N2 son revizyon | DLA PSMC sunumu, Quanterion | ✔ |
| 217Plus:2015 Notice 1, Quanterion tarafından sürdürülüyor | quanterion.com | ✔ |
| IEC 61709 Ed. 3.0 (2017), IEC 61709:2011 + IEC TR 62380:2004 birleşimi | IEC webstore | ✔ |
| FIDES Guide 2022 Edition A; UTE C 80-811 referansı | fides-reliability.org | ✔ |
| AC 25.1309-1B **30 Ağustos 2024**'te yayımlandı, 1A'yı iptal etti | FAA AC bilgi sayfası, Federal Register 2024-18511 | ✔ |
| 2002 "Arsenal Draft" 1B yıllarca resmî olmadan atıf aldı | Wikipedia AC 25.1309-1 revizyon tablosu | ✔ |
| Sınıflandırma: Katastrofik ≤1e-9, Tehlikeli ≤1e-7, Majör ≤1e-5 (uçuş saati başına) | AC 25.1309-1B / AMC 25.1309 | ✔ |
| 10⁻⁹ türetmesi: ~4 kaza/10⁶ saat → %10 sistem kaynaklı → ~1e-7 → ÷100 olay = 1e-9 | Vertical Magazine (CS 25.1309 AMC'ye atıfla) | ✔ |
| ARP4761A ve ARP4754B, 20 Aralık 2023'te yayımlandı (ED-135 / ED-79B) | ANSI webstore, SAE | ✔ |
| NRC 2015 "Reliability Growth" Ek D: 217 tahmin/saha oranları 0.54–12.20, bir vakada 218:1 | nationalacademies.org/read/18987/chapter/17 | ✔ |
| 217 eleştirisi (sabit λ, tek-nokta sıcaklık, π faktör bağımsızlığı) | Pecht & Nash 1988 IEEE Trans. Rel.; NRC 2015 Ek D | ✔ |
| Zaman-kesikli test MTBF alt sınırı θ_L = 2T/χ²(C, 2r+2) | Quanterion/RMQSI Knowledge Center, Accendo | ✔ |

## Hesaplanan sayılar (python3, tekrar üretilebilir)

- λ=1/100000 h⁻¹, t=10 yıl=87.660 h → R=0.4162 → %58,4 arıza olasılığı.
- Weibull β=3, MTTF aynı 100.000 h (η=111.985): R(10 yıl)=0.6190, R(15 yıl)=0.1981.
  Üstel: R(10)=0.4162, R(15)=0.2685. → Aynı MTBF, ters sıralanan risk. Kesişim var.
- 1oo2 onarımsız: MTTF = 1.5/λ (numerik integral 15.000 h @ λ=1e-4 ile doğrulandı).
- 1oo2 onarımlı: MTTF=(3λ+μ)/(2λ²); λ=1e-4 için MTTR 8 h → 6.27e6 h (~715 yıl),
  MTTR 168 h → 3.13e5 h (~36 yıl). Onarım süresi kadratik etkili.
- χ² kuantilleri bisection ile hesaplandı, tabloyla doğrulandı
  (χ²(0.90, 2)=4.6052; χ²(0.90, 4)=7.7794; χ²(0.95, 6)=12.5916).
- 20.000 saat test, 0 arıza → %90 güvenle MTBF ≥ 8.686 h (nokta tahmin 20.000 h).
- 100.000 h MTBF'i 0 arızayla %90 güvenle göstermek: 230.259 birim-saat (26,3 birim-yıl);
  100 birimle ~3,2 ay.
- Gizli arıza ortalama olasılığı: P̄ = 1 − (1−e^{−λT})/(λT) ≈ λT/2.
  λT=0.005 için yaklaşım hatası %0,17; λT=0.5 için %17,3.
- 50 FIT × 50 FIT, aktif+gizli çift arıza: T=100 h → 1.25e-13/h; T=2000 h → 2.50e-12/h.
- Arrhenius: Ea=0.7 eV, 40→85 °C → AF=26.0; Ea=0.3 eV aynı sıçrama → AF=4.0.

## Gizlilik kontrolü

Yazının tamamı kamuya açık standart/literatür ve kendi türetmelerim üzerine kurulu.
Proje adı, müşteri, iç süreç, gerçek λ verisi, tedarikçi datasheet'i yok. Sayısal
örneklerin tamamı uydurma-ama-tipik değerlerle kurgulanmış ve öyle olduğu yazıda belirtiliyor.

## Kullanılmayan / sonraya bırakılan

- Coffin-Manson sıcaklık çevrimi modeli (yalnızca bir cümleyle anıldı; ayrı yazı olur)
- Physics-of-Failure / PoF yaklaşımı ve CALCE metodolojisi (ayrı yazı adayı)
- Bayesçi MTBF kestirimi (ayrı yazı adayı)

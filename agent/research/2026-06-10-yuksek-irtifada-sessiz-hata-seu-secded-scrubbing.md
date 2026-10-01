# Araştırma — Yüksek İrtifada Sessiz Hata: SEU, SECDED ECC ve Bellek Scrubbing

Tarih: 2026-06-10

## Doğrulanmış olgular

- JESD89A deniz seviyesi referansı: ~13 n/cm²/sa (E > 10 MeV), NYC referansı. Sürüm:
  JESD89A (Eki 2006), revize JESD89B (2021).
- IEC TS 62396-1:2016 (Edition 2.0). 40 kft / 45° enlem referans akısı ~6000 n/cm²/sa →
  deniz seviyesine göre ~460x. Literatürde 30–35 kft için ~300x sık alıntılanır.
- SECDED Hamming (72,64): 64 veri + 8 parity, Hamming mesafesi 4 → tek bit düzelt,
  çift bit tespit. 3-bit hata → miscorrection riski (silent corruption).
- Tüm yaygın server-class DDR ECC DIMM'ler (72 bit veri yolu) SECDED kullanır
  (genellikle Hsiao kodu varyantı).
- SEC-DED-DAEC: bitişik çift bit hatasını düzeltebilen varyant. <28nm proseslerinde
  pratik kazanç. Bazı IBM POWER ve uzay-class ASIC'lerde.
- FIT = 10^9 saatte 1 arıza. MTTF_DBE ≈ 1/(72·f) · √(π/(2·Q)).
- Xilinx SEM IP (PG187/PG036), Kintex UltraScale için ~100 ms tam-cihaz scrub
  (NASA NEPP). XAPP1088 (2009) Virtex-4 için orijinal app note.
- Microchip RT PolarFire AN5087: programlanabilir periyod, ms–saniyeler arası.
- Saturn V LVDC: IBM Owego, 7 pipeline aşamasında donanım TMR + majority voter,
  250 saatte ~0.996 güvenilirlik.
- Space Shuttle GPC: 4 senkron + 1 bağımsız BFS; "redundant set + sumword
  comparison"; 6.25 ms'de bir karşılaştırma, 3 ardışık uyumsuzluk → arızalı.
- Voter SEU'ya açık → triplicated voters yaygın çözüm.

## Belgelenmiş olaylar

- 2003 Belçika Schaerbeek seçimi: Maria Vindevogel'e +4096 (= 2^12) oy. 13. bitin
  flip olması. Cosmic-ray SEU teşhisi.
- Cassini SSDR: ~71 bit-flip/gün arka plan oranı.
- Curiosity rover Şubat 2013: flash bellek bozulması → A→B bilgisayar geçişi.
  NASA "kozmik ışınla tutarlı" dedi, kesin SEU teşhisi yok.
- Sun UltraSPARC II (2000–2001): L2 cache yalnızca parity, ecache parity panic.
  PR krizi.

## Standartlar

- JEDEC JESD89A → JESD89B (2021): toprak seviyesi cosmic-ray + alpha SER ölçüm.
- IEC TS 62396 ailesi: atmosferik radyasyon, aviyonik. Edition 2.0 (2016).
- ECSS-Q-ST-60-15C Rev.1 (2025-03-20): uzay RHA.
- DO-178C / DO-254: radyasyonu DOĞRUDAN zorunlu kılmaz; süreç standartları.
  SEU ele alımı ARP4761 + IEC 62396 üzerinden, sistem güvenlik
  değerlendirmesinde.

## Proses ölçeklendirme

- 65nm planar → 14nm FinFET SRAM: cross-section ~40x düşüş.
- Buna karşın MBU/SEU oranı %2.2 → %7.6'ya yükseldi.
- FinFET geçişi büyük tek seferlik kazanç sağladı.

## Doğrulanamayan / şüpheli

- "Schiff 2008" — yok, gerçek referans Sun ecache 2000–2001.
- "300x" rakamı: 460x daha doğru IEC için; aralık olarak "300–500x" ver.
- Curiosity için "kesin SEU" deme.

## Kaynaklar (yazıda kullanılacak)

- JEDEC JESD89A: https://www.jedec.org/standards-documents/docs/jesd-89a
- IEC TS 62396-1:2016: https://webstore.iec.ch/en/publication/24053
- ECSS-Q-ST-60-15C Rev.1:
  https://ecss.nl/wp-content/uploads/2025/03/ECSS-Q-ST-60-15C-Rev.1(20March2025).pdf
- Xilinx SEM IP PG187:
  https://www.xilinx.com/support/documentation/ip_documentation/sem_ultra/v3_1/pg187-ultrascale-sem.pdf
- Microchip AN5087:
  https://ww1.microchip.com/downloads/aemDocuments/documents/FPGA/ApplicationNotes/ApplicationNotes/RT_PolarFire_EDAC_and_Scrubbing_of_Fabric_RAMs_AN5087.pdf
- Belçika 2003: https://en.wikipedia.org/wiki/Electronic_voting_in_Belgium
- Cassini SSDR:
  https://www.researchgate.net/publication/245438831_Analysis_of_Single-Event_Upset_Rates_on_the_Clementine_and_Cassini_Solid-State_Recorders
- Curiosity:
  https://mars.nasa.gov/MSL/mission/mars-rover-curiosity-mission-updates/index.cfm?mu=curiosity-update-safe-mode
- arXiv 1704.03991: https://arxiv.org/pdf/1704.03991
- LANL Radiation Effect Testing Handbook:
  https://lansce.lanl.gov/facilities/Radiation%20Effects/_assets/Radiation-Effect-Testing-Handbook-LAUR-19-30813.pdf
- Saturn V LVDC: https://en.wikipedia.org/wiki/Launch_Vehicle_Digital_Computer
- Shuttle GPC:
  https://klabs.org/DEI/Processor/shuttle/shuttle_primary_computer_system.pdf

## Derinlik öğesi seçimi

Birden çok somut analiz:

1. SECDED Hamming(72,64) syndrome decode matematiği — parity-check matrisi
   kullanımı, syndrome → bit konumu eşlemesi, 3-bit miscorrection örneği.
2. Scrubbing interval türetmesi — FIT → Poisson → DBE birikme olasılığı; somut
   sayılarla Zynq UltraScale örneği (~100 ms vs ~10 saniye karşılaştırması).

İki derinlik öğesi: matematiksel türetme + standart yorumu.

## "Neden Türkçe içerikte zor bulunuyor"

- Fizik (atmosferik nötron) + güvenilirlik matematiği (FIT, Poisson) + dijital
  tasarım (Hamming, scrubbing) + sertifikasyon (IEC 62396, DO-254) dört
  disiplinin kesişimi.
- Türkçe içerik genelde "ECC nedir" yüzeysel anlatımı; scrubbing aralığı
  hesabı veya MBU artışı tartışması yok.
- Birincil kaynaklar dağınık: JEDEC, IEC, NASA NEPP, Xilinx/Microchip app
  notes — birleştirilmiş Türkçe sentez yok.
- IEC 62396 ücretli ve dolaylı bilinir.

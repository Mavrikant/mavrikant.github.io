# Araştırma Notları — BIT Yanlış Alarmı, No Fault Found ve MTBUR

Tarih: 2026-11-01 — Konu alanı: güvenilirlik / test edilebilirlik (testability)

## Doğrulanmış olgular (birincil kaynaktan okundu)

### 1. Ilarslan & Ungar (IEEE Instrum. Meas. Mag., c. 19, s. 4, Ağustos 2016)
PDF birebir `pdftotext` ile okundu. Mustafa Ilarslan: TurAF F-16 deposunda aviyonik
sistem mühendisi (albay). Louis Y. Ungar: A.T.E. Solutions.

**Tablo 2 — TurAF 2013-2014 NFF dağılımı (I-level):**

| Teknoloji | Toplam dönen | NFF | %NFF |
|---|---|---|---|
| RF | 319 | 94 | 29.5% |
| Mixed | 232 | 130 | 56.0% |
| Digital | 368 | 175 | 47.6% |
| Analog | 54 | 34 | 63.0% |
| TOPLAM | 973 | 433 | 44.5% |

Metinden: "the TurAF has been experiencing NFF rates of 30% to 63% depending on unit
types"; "the overall distribution of NFFs is about 45%, with analog LRUs having the
highest rate of NFFs at 63%".

**Tablo 1 — Depoda beklenen UUT dağılımı** (kaynak: Ungar, IPC APEX 2015):
- Persistent Faults (PF): %14.3
- NFF Intermittent Faults (NFF IF): %14.3
- NFF False Alarms (NFF FA): %71.4

RF LRU'ların bir kısmı HAVELSAN'da onarılıyor; yazarlar düşük RF NFF oranını
"yerel onarım + kolay iletişim" ile ilişkilendiriyor.

### 2. Raza & Ulansky, "Through-Life Maintenance Cost of Digital Avionics",
Appl. Sci. 2021, 11(2), 715. DOI 10.3390/app11020715
- "In avionics, the estimated level of NFF is 20% to 50% [4,5], leading to about 27%
  of unscheduled removals of avionics LRU [6]."
- "The aviation industry's false alarm rate is very high, achieving 28% of all
  incidents related to alarms [7]." (Bliss 2003)
- "According to [8], in the Turkish Air Force, the overall percentage of NFF is 45%,
  with a distribution of NFF 47.6% for digital and 63% for analog LRU." (= Ilarslan)
- "Under [28], the MTBUR is about 50% of the MTBF for modern avionics, where MTBF is
  the mean time between permanent failures. This difference between MTBUR and MTBF
  leads to increased direct operating costs of about 40% [29]."
  [28] = Kayton & Friend, Avionics Navigation Systems, 2. baskı, Wiley 1997, s. 700.
- "The reliability characteristics of the HG2030BE ADIRU are as follows: MTBF is
  40,000 h, and MTBUR is 23,500 h [40]."
  **UYARI:** [40] bir ihracat/gümrük veri tabanı (zauba.com). Bu iki sayı üretici
  verisi gibi sunulmamalı; "mertebe" olarak kullan ve kaynak zayıflığını yaz.

### 3. Raza, "Maintenance Model of Digital Avionics", Aerospace 2018, 5(2), 38.
DOI 10.3390/aerospace5020038
- Aviyonik bakım maliyeti uçak bakım maliyetinin %30'una kadar çıkabiliyor.
- NFF oranı aviyonikte %20-50. Aralıklı arızalar (intermittent faults) NFF'in baş nedeni.
- "avionics components account for 80.4% of all unconfirmed failures, which ... leads
  to 26.6% of unscheduled removals of avionics LRUs/LRMs"
- Askeri aviyonikte NFF ~%70 (ref [16]).
- Aralıklı arızalar **mekanik kökenli**: kablaj, lehim bağlantıları, ekran örgüsü,
  konnektörler, entegre devre metal hatları.
- Klasik ATE'nin aralıklı arızayı kaçırma nedenleri (5 madde, birebir):
  1. parametreler kısa süre ve tek kez test edilir, arıza anıyla çakışmaz
  2. dijital ortalama alma / tarama / örnekleme aralıklı arızayı kaçırır
  3. sökülen birim arızanın oluştuğu ortam yerine laboratuvarda test edilir
  4. ATE kalıcı arıza/kısa devre/kopukluk için tasarlanmış
  5. aralıklı arızalar belirli bir arıza örüntüsüne uymaz

### 4. Standartlar
- **ARINC 604-1** (30 Eylül 1988, 92 s.) "Guidance for Design and Use of Built-In Test
  Equipment (BITE)" — BITE etkinliği/maliyet/karmaşıklık dengesi; Centralized Fault
  Display System tanımı. Guidance, bağlayıcı spesifikasyon değil.
- **ARINC 624-1** (30 Ağustos 1993) "Design Guidance for Onboard Maintenance System
  (OMS)" — BITE, OMD, ACMS, haberleşme protokolü; LRU'lar arası ARINC 429.
- Sorensen, B. "Digital averaging — the smoking gun behind 'no-fault-found'",
  Air Safety Week, 24 Şubat 2003 (Ilarslan ref [2]).

### 5. NFF literatürü (Raza & Ulansky referansları)
- Söderholm, P. "A system view of the no fault found (NFF) phenomenon."
  Reliab. Eng. Syst. Saf. 2007, 92, 1-14.
- Khan, S.; Phillips, P.; Jennions, I.; Hockley, C. "No Fault Found events in
  maintenance engineering Part 1." Reliab. Eng. Syst. Saf. 2014, 123, 183-195.
- Hockley, C.; Phillips, P. "The impact of no fault found on through-life engineering
  services." J. Qual. Maint. Eng. 2012, 18, 141-153.
- Bliss, J.P. "Investigation of alarm-related accidents and incidents in aviation."
  Int. J. Aviat. Psychol. 2003, 13, 249-268.

## Üçgenleme (yazının omurgası)
Üç bağımsız kaynak "sökülen kutuların yaklaşık %40-50'sinde arıza bulunmuyor"da
buluşuyor:
- Kayton & Friend kuralı MTBUR ≈ 0.5 × MTBF  → %50
- ADIRU örneği 23.500 / 40.000 = 0.5875      → %41.25
- TurAF ölçülen toplam NFF                    → %44.5

## Derinlik öğesi
Matematiksel türetme + Monte Carlo doğrulaması: k-ardışık onay filtresinin
(confirmation/persistence filter) yanlış alarm ile aralıklı arıza tespiti üzerindeki
zıt etkisi; kapalı formda eşik koşulu `tau_ort > Delta / ln(1/q)`; MTBUR/MTBF oranının
geri hesaplanması ve yayımlanmış oranlarla karşılaştırılması.

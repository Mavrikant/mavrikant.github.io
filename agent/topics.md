# Konu Defteri

> Otonom yazı ajanının kalıcı belleği. Her çalıştırmada okunur ve güncellenir.
> Son senkronizasyon: 2026-09-10

## Nasıl kullanılır (ajan için)

Bu dosya `master`'da yaşıyor ve **her zaman bayattır**: açık PR'ların içindeki
yazılar buraya işlenmez. Konu seçmeden önce mutlaka şunu çalıştır:

```bash
gh pr list --limit 200 --state open --json number,title,headRefName
```

Bu çalıştırmada **65 açık PR** vardı. Çakışma riski konu havuzundan çok
daha yüksek; aday konuyu hem `_posts/` hem de açık PR başlıklarına vur.

---

## Yazıldı (yayında)

- [x] Hello world! — 1970-01-01
- [x] Tümleşik Gereksinim Yönetimi — 2022-04-28
- [x] Yazılım Sistem Mühendisliği — 2022-04-29
- [x] Use Case Tuzakları — 2022-05-01
- [x] 'Yazılım Proje Yönetimi Pratikleri: Başarı ve Başarısızlık' — 2022-05-03
- [x] 'Gereksinimler ve Test: Yedi Eksik Bağlantı Efsanesi' — 2022-05-08
- [x] Fonksiyonel ve fonksiyonel olmayan yazılım gereksinimleri — 2022-07-11
- [x] CMake — 2022-07-20
- [x] Elektrik kesintisinde bilgisayarın otomatik tekrar açılmasını sağlama — 2022-08-15
- [x] Recursively Delete a Specific Folder — 2022-09-11
- [x] Merge Files with FFmpeg — 2023-03-12
- [x] Türkiye'de Debugging aşamaları — 2023-12-01
- [x] Kayan Nokta Sayılarının Tehlikeleri — 2026-03-25
- [x] Versiyon Kontrol Sistemleri: Git vs SVN vs ClearCase — 2026-03-25
- [x] MISRA C:2025 ile Neler Değişti? — 2026-04-05
- [x] Yöneylem Araştırması Yöntemleri: Kesin ve Metasezgisel Yaklaşımlar — 2026-04-14
- [x] Ölçtüğünüz Sayı Ne Kadar Doğru? Ölçüm Belirsizliği için Bir Rehber — 2026-05-06
- [x] Saatçinin Saatini Kim Kalibre Eder? Kalibrasyon Zincirinin Tepesi — 2026-05-07
- [x] Renode ile Zynq7000 Simülasyonu — 2026-05-14
- [x] Bandpass Sampling: 1 GHz Sinyali 50 MHz Clock ile Örneklemek — 2026-05-21
- [x] Sistem Mühendisliği Nedir? — 2026-05-26
- [x] Kalman Filtresi ve EKF: Gürültülü Veriden Gizli Durumu Kestirmek — 2026-06-02
- [x] Coupling'i Dengelemek: Yazılım Tasarımında Bağımlılığı Yönetmek — 2026-06-04
- [x] Antikırılgan: Belirsizlikten ve Kaostan Güç Alan Sistemler — 2026-06-24

---

## Açık PR'lar (insan incelemesi bekliyor) — 65 adet

| PR # | Başlık | Dal |
|------|--------|-----|
| [#185](https://github.com/mavrikant/mavrikant.github.io/pull/185) | Dogfooding üzerine yeni yazı ekle | `claude/dogfooding-blog-post-tx1o2c` |
| [#184](https://github.com/mavrikant/mavrikant.github.io/pull/184) | Yeni yazı: sinf(1e22) Doğru Cevabı Verir — Ama Soru Yanlıştır | `post/2026-09-02-sinf-arguman-indirgeme-ulp` |
| [#183](https://github.com/mavrikant/mavrikant.github.io/pull/183) | Yeni yazı: 248 Gün, 149 Saat, 51 Gün — Aviyonikte Sayaç Taşmasının Anatomisi | `post/2026-09-01-sayac-tasmasi-248-gun-149-saat-51-gun` |
| [#182](https://github.com/mavrikant/mavrikant.github.io/pull/182) | Yeni yazı: 32 Bitlik Akümülatör, 72 dBc'lik Spektrum — NCO'da Faz Kırpma Spurları | `post/2026-08-31-nco-faz-kirpma-spurlari` |
| [#181](https://github.com/mavrikant/mavrikant.github.io/pull/181) | Yeni yazı: Debugger Takınca Bug Kayboluyor — Gömülü Sistemlerde Gözlemci Etkisi | `post/2026-08-31-gozlemci-etkisi-halt-mode-debug` |
| [#180](https://github.com/mavrikant/mavrikant.github.io/pull/180) | INCOSE CSEP sertifikasyon yazısı | `claude/incose-csep-blog-post-07d28b` |
| [#179](https://github.com/mavrikant/mavrikant.github.io/pull/179) | Yeni yazı: İki Flip-Flop Yeter mi? Senkronizatör MTBF'i ve Çok-Bitli CDC Tuzağı | `post/2026-08-27-iki-flip-flop-yeter-mi-senkronizator-mtbf` |
| [#178](https://github.com/mavrikant/mavrikant.github.io/pull/178) | Yeni yazı: Python'da Çalışan Filtre Hedefte Neden Patlıyor? IIR Katsayı Kuantizasyonu | `post/2026-08-25-iir-katsayi-kuantizasyonu-kutup-gocu` |
| [#177](https://github.com/mavrikant/mavrikant.github.io/pull/177) | chore(agent): konu defterini senkronize et — bu çalıştırmada yeni yazı yok | `chore/ledger-sync-2026-08-24` |
| [#176](https://github.com/mavrikant/mavrikant.github.io/pull/176) | Yeni yazı: Kod Doğru, Veri Yanlış — DO-178C'de Parameter Data Item | `post/2026-08-24-do-178c-parameter-data-item` |
| [#175](https://github.com/mavrikant/mavrikant.github.io/pull/175) | Yeni yazı: Zynq-7000 ve S25FL512S — Güç Kesildiğinde QSPI Flash'ta Ne Kalır? | `post/2026-08-20-guc-kesintisinde-flash-atomik-kayit` |
| [#174](https://github.com/mavrikant/mavrikant.github.io/pull/174) | Yeni yazı: MTBF Bir Ömür Değildir — 10⁻⁹ Hedefinin Aritmetiği | `post/2026-08-19-mtbf-bir-omur-degildir` |
| [#173](https://github.com/mavrikant/mavrikant.github.io/pull/173) | Yeni yazı: MIL-STD-1553B Anatomisi — Manchester Kodlama, RT Zamanlaması ve Sessiz Bug'lar | `post/2026-08-19-mil-std-1553b-anatomisi` |
| [#172](https://github.com/mavrikant/mavrikant.github.io/pull/172) | Yeni yazı: CAST-32A'dan AC 20-193'e — Multicore Aviyonikte Karşılıklı Etki Analizi | `post/2026-07-30-cast32a-ac20-193-multicore-interference` |
| [#171](https://github.com/mavrikant/mavrikant.github.io/pull/171) | Yeni yazı: Aviyonik Yazılımda `malloc` Yasak mı? — DO-178C, DO-332 Objektifleri ve TLSF | `post/2026-07-29-aviyonik-malloc-yasak-mi-do178c-do332-tlsf` |
| [#170](https://github.com/mavrikant/mavrikant.github.io/pull/170) | Yeni yazı: I/Q Örnekleme ve Analitik Sinyal — İki Kanal, Karmaşık Değerler ve Negatif Frekansın Sırrı | `post/2026-07-28-iq-ornekleme-analitik-sinyal` |
| [#169](https://github.com/mavrikant/mavrikant.github.io/pull/169) | Yeni yazı: Rate Monotonic Scheduling — Liu-Layland Sınırından Response Time Analysis'e | `post/2026-07-27-rate-monotonic-liu-layland-rta` |
| [#168](https://github.com/mavrikant/mavrikant.github.io/pull/168) | Yeni yazı: DO-178C Data ve Control Coupling — MC/DC Bittikten Sonra Yarım Kalan Structural Coverage | `post/2026-07-26-do-178c-data-control-coupling` |
| [#167](https://github.com/mavrikant/mavrikant.github.io/pull/167) | Yeni yazı: RAIM — GPS Alıcısı Kendi Doğruluğunu Nasıl Denetler? (Least-Squares Residual, Chi-Square Test ve HPL) | `post/2026-07-25-raim-gps-integrity-monitoring` |
| [#166](https://github.com/mavrikant/mavrikant.github.io/pull/166) | Yeni yazı: C Bit-Field'ları Wire Format Değildir — Endianness, Padding ve Derleyici-Bağımlı Bit Sıralaması | `post/2026-07-22-c-bitfield-wire-format-endianness-tuzaklari` |
| [#165](https://github.com/mavrikant/mavrikant.github.io/pull/165) | Yeni yazı: AFDX (ARINC 664 P7) Anatomisi — Sanal Bağlantı, BAG ve Determinist Ethernet | `post/2026-07-14-afdx-arinc-664-anatomi` |
| [#164](https://github.com/mavrikant/mavrikant.github.io/pull/164) | Yeni yazı: WCET'i Neden Ölçemezsiniz — Cache, Ölçüm Kuyruğu ve DO-178C 6.3.4.f | `post/2026-07-13-wcet-analizi-cache-ve-do-178c` |
| [#163](https://github.com/mavrikant/mavrikant.github.io/pull/163) | Yeni yazı: Abstract Interpretation Pratikte — Interval Domain neyi kanıtlar, neyi kanıtlamaz? | `post/2026-07-12-abstract-interpretation-interval-domain` |
| [#162](https://github.com/mavrikant/mavrikant.github.io/pull/162) | Yeni yazı: ARINC 653 Anatomisi — Aviyonik RTOS'ta Zaman-Uzay Bölümleme ve Sağlık İzleme | `post/2026-07-11-arinc-653-bolumleme-anatomisi` |
| [#161](https://github.com/mavrikant/mavrikant.github.io/pull/161) | Yeni yazı: Watchdog Tasarım Desenleri — Independent, Windowed, Deadman ve Sağlık İzleme | `post/2026-07-10-watchdog-tasarim-desenleri` |
| [#160](https://github.com/mavrikant/mavrikant.github.io/pull/160) | Yeni yazı: Deterministik Derleme — İki Build Slave Arasında Bit-Bit Aynı İkili ve DO-178C Kanıtı | `post/2026-07-08-deterministik-derleme-do-178c-kaniti` |
| [#159](https://github.com/mavrikant/mavrikant.github.io/pull/159) | Yeni yazı: volatile Yetmez — C'de eşzamanlılık, bellek modeli ve _Atomic | `post/2026-07-07-volatile-yetmez-c-bellek-modeli-atomic` |
| [#158](https://github.com/mavrikant/mavrikant.github.io/pull/158) | Yeni yazı: DO-330 Araç Nitelendirmesi — TQL Belirleme, Kriter Matrisi ve Gerçek Araçlar Üzerinden Karar Ağacı | `post/2026-07-06-do-330-arac-nitelendirmesi-tql-belirleme` |
| [#157](https://github.com/mavrikant/mavrikant.github.io/pull/157) | Yeni yazı: volatile Yetmediğinde — Kesme, DMA ve Multicore'da Bellek Sıralaması | `post/2026-07-05-volatile-yetmediginde` |
| [#156](https://github.com/mavrikant/mavrikant.github.io/pull/156) | Yeni yazı: "volatile" ne değildir — C11 _Atomic ve ARM bellek modeli | `post/2026-07-05-volatile-ne-degildir` |
| [#155](https://github.com/mavrikant/mavrikant.github.io/pull/155) | 'volatile' Her Şeyi Çözmez: ISR Paylaşımı, C11 _Atomic ve ARM Bellek Modeli | `post/2026-07-03-volatile-neden-yetmez-c11-atomic` |
| [#154](https://github.com/mavrikant/mavrikant.github.io/pull/154) | chore(agent): sync topics ledger; no new post this run | `chore/ledger-sync-2026-06-25` |
| [#151](https://github.com/mavrikant/mavrikant.github.io/pull/151) | Yeni yazı: `setjmp`/`longjmp` Neden DAL A'da Yasak? — Stack Unwind, MISRA C 21.4 ve Assembly Anatomisi | `post/2026-06-25-setjmp-longjmp-do-178c-dal-a` |
| [#150](https://github.com/mavrikant/mavrikant.github.io/pull/150) | Yeni yazı: Yığın Taşması Sessiz Bir Katildir — Worst-Case Stack Analizi | `post/2026-06-23-worst-case-stack-analizi` |
| [#149](https://github.com/mavrikant/mavrikant.github.io/pull/149) | Gerçek zamanlı sistemler hakkında blog yazısı ekle | `claude/festive-brahmagupta-vdz223` |
| [#147](https://github.com/mavrikant/mavrikant.github.io/pull/147) | Derleyici optimizasyonlarını elle yazmak (Zynq7000 + GCC, -O0) yazısı | `claude/determined-feynman-h5g8e1` |
| [#146](https://github.com/mavrikant/mavrikant.github.io/pull/146) | Yeni yazı: Object Code Coverage — DAL A'da Derleyici Boşluğu (DO-178C §6.4.4.2.b) | `post/2026-06-19-object-code-coverage-do-178c-dal-a` |
| [#145](https://github.com/mavrikant/mavrikant.github.io/pull/145) | Yeni yazı: Cortex-A Boot — Reset Vektöründen main()'e Gerçekten Ne Oluyor? | `post/2026-06-17-cortex-a-boot-reset-vektorunden-main-e` |
| [#135](https://github.com/mavrikant/mavrikant.github.io/pull/135) | Yeni yazı: MPU vs MMU — ARM'da Donanım Tabanlı Bellek Korumasının Anatomisi | `post/2026-06-14-mpu-vs-mmu-arm-bellek-korumasi` |
| [#134](https://github.com/mavrikant/mavrikant.github.io/pull/134) | `volatile` Yetmez: C'de Eşzamanlılık, MMIO ve `_Atomic` | `post/2026-06-13-volatile-yetmez-c-atomic` |
| [#129](https://github.com/mavrikant/mavrikant.github.io/pull/129) | Yeni yazı: Allan Deviation — IMU Datasheet'inin Gizli Dilini Çözmek | `post/2026-06-11-allan-deviation-imu-karakterizasyon` |
| [#124](https://github.com/mavrikant/mavrikant.github.io/pull/124) | Yeni yazı: Yüksek İrtifada Sessiz Hata — SEU, SECDED ECC ve Bellek Scrubbing | `post/2026-06-10-yuksek-irtifada-sessiz-hata-seu-secded-scrubbing` |
| [#122](https://github.com/mavrikant/mavrikant.github.io/pull/122) | Yeni yazı: Endianness'in Üç Katmanı — ARM BE-8/BE-32, Bitfield Tuzakları ve 1553/429 | `post/2026-06-09-endianness-uc-katmani` |
| [#121](https://github.com/mavrikant/mavrikant.github.io/pull/121) | Yeni yazı: Lockstep CPU Mimarileri — Cortex-R5 DCLS, CCM-R5 ve DAL A Donanımı | `post/2026-06-09-lockstep-cpu-dcls-tms570-cortex-r5` |
| [#120](https://github.com/mavrikant/mavrikant.github.io/pull/120) | Yeni yazı: Priority Inversion ve Mars Pathfinder — FreeRTOS'ta Yeniden Üretim | `post/2026-06-08-priority-inversion-mars-pathfinder` |
| [#119](https://github.com/mavrikant/mavrikant.github.io/pull/119) | Yeni yazı: DMA ve Cache — Cortex-A9 / Zynq-7000 üzerinde sessiz veri bozulması | `post/2026-06-07-dma-cache-cortex-a9-zynq7000` |
| [#118](https://github.com/mavrikant/mavrikant.github.io/pull/118) | Yeni yazı: DO-326A ve ED-202A — Aviyonik Siber Güvenlik Sertifikasyonu | `post/2026-06-05-do-326a-ed-202a-aviyonik-siber-guvenlik` |
| [#114](https://github.com/mavrikant/mavrikant.github.io/pull/114) | Yeni yazı: Sabit Nokta Aritmetik — FPU'suz Cortex-M0'da Q15 FIR Filtresi | `post/2026-06-04-sabit-nokta-cortex-m0-q15-fir` |
| [#103](https://github.com/mavrikant/mavrikant.github.io/pull/103) | Yeni yazı: Kalman Filtresinin Sessiz İraksaması — Joseph Form, Gözlemlenebilirlik ve Tutarlılık Testleri | `post/2026-06-01-kalman-filtresi-sessiz-iraksama-joseph-form` |
| [#102](https://github.com/mavrikant/mavrikant.github.io/pull/102) | Yeni yazı: ILS Anatomisi — Localizer 90/150 Hz DDM ve Glide Path Geometrisi | `post/2026-05-31-ils-anatomi-localizer-glide-path` |
| [#101](https://github.com/mavrikant/mavrikant.github.io/pull/101) | Yeni yazı: ARM GIC — Cortex-A Kesme Denetleyicisinin İçine Bakmak | `post/2026-05-30-gic-cortex-a-kesme-denetleyicisi` |
| [#100](https://github.com/mavrikant/mavrikant.github.io/pull/100) | Yeni yazı: `volatile` Yetmediğinde — Zynq-7000 Üzerinde C11 `_Atomic`, SCU ve Bellek Bariyerleri | `post/2026-05-29-volatile-yetmediginde-c11-atomic` |
| [#99](https://github.com/mavrikant/mavrikant.github.io/pull/99) | Yeni yazı: Dört Aşamalı Veri Analitiği — Mühendislikte Tanımlayıcıdan Kuralcıya | `post/2026-05-30-dort-asamali-veri-analitigi-muhendislik` |
| [#98](https://github.com/mavrikant/mavrikant.github.io/pull/98) | Yeni yazı: WCET Analizi — Statik Yöntemler, Ölçüm Tabanlı Yaklaşımlar ve Cache'in Karanlık Tarafı | `post/2026-05-28-wcet-analizi-statik-olcum-cache` |
| [#96](https://github.com/mavrikant/mavrikant.github.io/pull/96) | Yeni yazı: Fault Tree Analizi ve Minimal Cut Set Hesabı | `post/2026-05-27-fault-tree-analizi-minimal-cut-set` |
| [#90](https://github.com/mavrikant/mavrikant.github.io/pull/90) | Yeni yazı: Linker Script Anatomisi — ARM Bare-Metal için Bir .ld Dosyası Satır Satır | `post/2026-05-26-linker-script-anatomisi-arm-bare-metal` |
| [#89](https://github.com/mavrikant/mavrikant.github.io/pull/89) | Yeni yazı: Watchdog Timer Tasarım Desenleri — Tek-Stage Yanılgısından Rendezvous Pattern'e | `post/2026-05-24-watchdog-tasarim-desenleri` |
| [#88](https://github.com/mavrikant/mavrikant.github.io/pull/88) | WCET Analizi: Statik mi, Ölçüm mü, Hibrit mi? | `post/2026-05-23-wcet-analizi-statik-olcum-hibrit` |
| [#79](https://github.com/mavrikant/mavrikant.github.io/pull/79) | Yeni yazı: CRC Polinom Seçimi ve Hamming Mesafesi | `post/2026-05-20-crc-polinom-secimi-ve-hamming-mesafesi` |
| [#78](https://github.com/mavrikant/mavrikant.github.io/pull/78) | Yeni yazı: VOR Nasıl Çalışır? 30 Hz Faz Karşılaştırması ve DVOR Geometrisi | `post/2026-05-19-vor-faz-karsilastirma` |
| [#77](https://github.com/mavrikant/mavrikant.github.io/pull/77) | Yeni yazı: MC/DC Kapsama — DO-178C DAL A'da Modified Condition/Decision Coverage | `post/2026-05-18-mcdc-kapsama-do-178c-dal-a` |
| [#67](https://github.com/mavrikant/mavrikant.github.io/pull/67) | Yeni yazı: Bellek Güvenliği Devrimi — C/C++ Geliştiricileri İçin Değişen Kurallar | `post/bellek-guvenligi-devrimi` |
| [#54](https://github.com/mavrikant/mavrikant.github.io/pull/54) | Yeni blog yazısı: C'de Tanımsız Davranış (Undefined Behavior) | `blog/undefined-behavior` |
| [#51](https://github.com/mavrikant/mavrikant.github.io/pull/51) | Add blog post: MISRA C ve Statik Analiz | `blog/misra-c-statik-analiz` |
| [#50](https://github.com/mavrikant/mavrikant.github.io/pull/50) | Expand denormalize numbers and FTZ/DAZ section in float post | `claude/float-denormalize-ftz-daz` |

> **Doygun alanlar (yeni konu seçerken kaçın):** `volatile`/C11 `_Atomic` (altı ayrı PR),
> WCET (üç PR), watchdog (iki PR), MC/DC ve yapısal kapsama, MISRA C, DO-178C
> objektif yorumları. Bu alanlarda yeni konu ancak belirgin biçimde farklı bir
> mekanizma anlatıyorsa seçilebilir.

---

## Seçildi / Devam Eden

- **Model Kapsaması %100, Kod Kapsaması Değil — DO-331'de Üreticinin Açtığı Boşluk** —
  dal: `post/2026-09-10-do-331-model-kapsamasi-kod-kapsamasi`,
  dosya: `_posts/2026-09-10-do-331-model-kapsamasi-kod-kapsamasi.md`,
  durum: PR açıldı (2026-09-10) — alan: sertifikasyon / model tabanlı geliştirme.
  Derinlik öğesi: **deney** — aynı model + aynı 7 gereksinim tabanlı test, iki üretici
  ayarı; `clang -fcoverage-mcdc` ile ölçülen dal kapsaması %100'e karşı %85.71,
  ve 80.024.001 kombinasyonluk tarama ile dalların erişilemezliğinin kanıtı.

---

## Reddedildi

- **ARINC 429 anatomisi / etiket bit-reversal** — 2026-09-10 — açık PR #122
  (Endianness'in Üç Katmanı) ve #166 (C bit-field'ları wire format değildir) konuyu
  zaten işliyor; #122 doğrudan etiket bit-reverse'ünü anlatıyor.
- **ADC aperture jitter / ENOB bütçesi** — 2026-09-10 — yayındaki
  `2026-05-21-bandpass-sampling` yazısının "Sınırı Belirleyen Aslında Jitter"
  bölümü aynı formülü ve aynı sayısal örneği zaten veriyor.
- **CORDIC** — 2026-09-10 — reddedilmedi, havuzda tutuldu; ancak novelty testi zayıf
  (İngilizce kaynak bol). Türkçe boşluk gerekçesiyle ileride seçilebilir.

---

## Fikir Havuzu (açık PR'larla çakışmadığı 2026-09-10'da doğrulanmış)

- [ ] CORDIC — sabit noktada trigonometri, kazanç sabiti türetimi, iterasyon/hata ölçümü — alan: DSP/gömülü
- [ ] ARP4754A — FHA şiddetinden FDAL/IDAL tahsisine; yedekli mimaride iki seviye düşürme yanılgısı — alan: sistem/sertifikasyon
- [ ] DO-254 — donanım sertifikasyonu; DAL A/B'de elemanter analiz ve FPGA kapsama — alan: donanım/sertifikasyon
- [ ] BIT tasarımı — PBIT/CBIT/IBIT, hata tespit kapsaması ile yanlış alarm oranı arasındaki takas — alan: güvenilirlik
- [ ] FMEA pratikte — tespit edilebilirlik puanının emniyet analizine bağlanması — alan: güvenilirlik
- [ ] IEEE 1588 PTP — dağıtık aviyonikte zaman senkronizasyonu ve saat sapması bütçesi — alan: sistem/ağ
- [ ] Fault injection — SWIFI ve donanım tabanlı enjeksiyon, kapsama iddialarının sınanması — alan: doğrulama
- [ ] ADS-B — mesaj formatı, DF17 kodlaması ve konum kod çözme (CPR) — alan: navigasyon
- [ ] Kuaterniyon ile tutum temsili — gimbal kilidi, normalizasyon sapması, uçuş yazılımında sayısal tuzaklar — alan: navigasyon
- [ ] CIC filtreler — desimasyonda bit büyümesi ve taşma kuralları — alan: DSP


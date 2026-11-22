# Konu Defteri

> Otonom yazı ajanının kalıcı belleği. Her çalıştırmada okunur ve güncellenir.
>
> **Uyarı (2026-10-09):** Bu dosya `master`'da uzun süre güncellenmedi, çünkü her
> çalıştırma kendi dalında güncelliyor ve PR'lar merge edilmiyor. Bu yüzden
> **defteri tek doğruluk kaynağı sayma.** Konu seçmeden önce mutlaka
> `gh pr list --repo mavrikant/mavrikant.github.io --state open --limit 100`
> çalıştır; açık PR'lar yayındaki yazılardan çok daha geniş bir alanı kaplıyor.

## Yayında olan yazılar (2026-10-09 itibarıyla)

sistem/gereksinim: tümleşik gereksinim yönetimi (2022-04-28), yazılım sistem
mühendisliği (2022-04-30), use case tuzakları (2022-05-01), proje yönetimi
pratikleri (2022-05-01), gereksinimler ve test (2022-05-08), fonksiyonel olmayan
gereksinimler (2022-07-11), sistem mühendisliği nedir (2026-05-26), coupling
dengesi (2026-06-04), antikırılgan sistemler (2026-06-24), dogfooding
(2026-09-04), INCOSE CSEP (2026-10-01) ·
araçlar: CMake (2022-07-19), klasör silme (2022-09-11), ffmpeg (2023-03-12),
Git/SVN/ClearCase (2026-03-25), Renode + Zynq7000 (2026-05-14) ·
C/standart: kayan nokta tehlikeleri (2026-03-25), MISRA C:2025 (2026-04-05) ·
matematik/veri: yöneylem araştırması (2026-04-14), Kalman filtresi (2026-06-02),
analitiğin dört hali (2026-09-22) ·
metroloji: ölçüm belirsizliği (2026-05-06), kalibrasyon zinciri (2026-05-07) ·
RF/DSP: bandpass sampling (2026-05-21) ·
kültür: Türkiye'de debugging (2023-12-01) ·
emniyet/uçuş kontrol: **üç kanallı oylama (2026-10-09 — bu çalıştırma)**

## Açık PR birikmesi — alan bazında doygunluk haritası

Bu çalıştırmada **70 açık PR** vardı. Konu seçerken "yayında yok" yetmiyor;
aşağıdaki alanlar PR kuyruğunda zaten işlenmiş durumda:

| Alt-alan | Kuyrukta işlenmiş konular (PR no) |
|---|---|
| Yapısal kapsama / DO-178C | MC/DC (#77), object code coverage (#146), data & control coupling (#168), DO-331 model kapsaması (#186), PDI (#176), DO-330 TQL (#158), setjmp/longjmp DAL A (#151) |
| Eşzamanlılık / bellek modeli | `volatile` + `_Atomic` — **altı ayrı PR** (#100, #134, #155, #156, #157, #159) |
| Zamanlama / WCET | WCET ×3 (#88, #98, #164), rate monotonic (#169), ARINC 653 (#162), CAST-32A multicore (#172), gerçek zamanlı sistemler (#149) |
| ARM / SoC | Cortex-A boot (#145), GIC (#101), MPU vs MMU (#135), DMA+cache (#119), lockstep (#121), linker script (#90), endianness (#122), bit-field wire format (#166), derleyici optimizasyonu (#147) |
| Veri yolları | MIL-STD-1553B (#173), AFDX/ARINC 664 (#165) |
| Navigasyon / DSP | RAIM (#167), Kalman Joseph form (#103), ILS (#102), VOR (#78), Allan deviation (#129), I/Q örnekleme (#170), IIR kuantizasyon (#178), NCO spur (#182), sabit nokta Q15 (#114), sinf argüman indirgeme (#184) |
| Güvenilirlik / emniyet | MTBF (#174), FTA minimal cut set (#96), SEU/SECDED (#124), watchdog ×2 (#89, #161), priority inversion (#120), sayaç taşması (#183), yığın analizi (#150) |
| Diğer | CRC polinom (#79), bellek güvenliği (#67), UB (#54), MISRA statik analiz (#51), FTZ/DAZ (#50), deterministik derleme (#160), abstract interpretation (#163), DO-326A (#118), malloc/DO-332 (#171), QSPI flash atomikliği (#175), CDC senkronizatör (#179), halt-mode debug gözlemci etkisi (#181), QA/QC (#191) |

**Sonuç:** fikir havuzunun eski "yüksek öncelikli" maddelerinin neredeyse tamamı
kuyrukta. Yeni konu, bu haritanın dışından seçilmeli.

## Seçildi / Devam Eden

- **Ortancayı Almak Yetmez: Üç Kanallı Oylamanın İki Çökme Noktası** —
  dal: `post/2026-10-09-uc-kanalli-oylama-cokme-noktalari`,
  dosya: `_posts/2026-10-09-uc-kanalli-oylama-cokme-noktalari.md`,
  araştırma: `agent/research/2026-10-09-uc-kanalli-oylama-cokme-noktalari.md`,
  alan: emniyet & güvenilirlik / uçuş kontrol, durum: PR açıldı.
  Derinlik öğesi: (a) ATSB AO-2008-070'teki FCPC AOA algoritmasının modellenip
  QF72 arızasının yeniden üretilmesi (raporun verdiği 26° bağımsız olarak
  üretildi), (b) ARINC 429 BNR bit ağırlıklarından 37.000 ft → 50,625° ve
  12.492 ft → 16,875° takma adının türetilmesi.

## Reddedildi (2026-10-09)

- **ARINC 429 bit seviyesi anatomisi** — #122 (endianness, 1553/429) ve #173
  (1553B) ile kısmi örtüşme. (429 bu yazıda yalnızca bir araç olarak kullanıldı;
  müstakil bir yazı olarak hâlâ mümkün ama o iki PR merge olduktan sonra
  yeniden değerlendirilmeli.)
- **Dead code vs deactivated code (DO-178C 6.4.4.3)** — yapısal kapsama alt-alanı
  kuyrukta doygun (#77, #146, #168, #186).
- **Quaternion vs Euler / gimbal lock** — navigasyon kuyrukta doygun; ayrıca
  internette zaten bol ve derinlik çıkarmak zor.
- **CORDIC sabit nokta** — #114 (Q15 FIR) ile örtüşüyor.

## Fikir Havuzu (güncellenmiş — kuyruktakiler çıkarıldı)

Aşağıdakiler hem yayındaki yazılarla hem de 70 açık PR'la çakışmıyor:

- [ ] **Sensör füzyonunda analitik yedeklilik** — model tabanlı kestirimi
      dördüncü "sanal kanal" olarak oylamaya sokmak; model hatasının yeni bir
      ortak neden haline gelmesi. (Bu yazının açık bıraktığı soru.)
- [ ] **Confirmation time / persistence tasarımı** — arıza teyit süresi ile
      yanlış alarm oranı arasındaki takas; eşik + süre çiftinin birlikte
      seçilmesi. Oylama yazısının doğal devamı ama ayrı bir konu.
- [ ] **ARP4761 ortak neden analizi (CCA) pratikte** — zonal safety analysis,
      particular risks, common mode analysis üçlüsü; nicel FMEA'nın göremediği.
- [ ] **Equalization / nulling** — redundant kanallar arası statik ofsetin
      entegral geri besleme ile eşitlenmesi (US 4,276,648'deki mekanizma);
      ne zaman arızayı maskeler?
- [ ] **ADS-B mesaj yapısı** — PPM modülasyon, DF17 formatı, CPR konum kodlaması.
- [ ] **FIR vs IIR seçimi** — faz cevabı, grup gecikmesi, hesaplama maliyeti.
      (#178 IIR kuantizasyonunu işliyor, seçim kriteri ayrı.)
- [ ] **ECSS yazılım standartları ailesi** — ECSS-E-ST-40C / Q-ST-80C,
      DO-178C ile karşılaştırma. (Geniş; alt-konulara bölünmeli.)
- [ ] **İzlenebilirlik matrisi otomasyonu** — araç nitelendirmesi gerektirip
      gerektirmediği sorusu üzerinden. (Klasik konuya DO-330 açısı.)
- [ ] **FMEA pratikte** — gerçek bir alt-sistem üzerinden adım adım; tespit
      edilemeyen arıza modlarının (QF72'deki gibi) FMEA'dan nasıl kaçtığı.
- [ ] **DO-254 donanım sertifikasyonu** — yazarın uzmanlığı yazılım tarafında
      ağırlıklı; ancak DAL A donanım/yazılım sınırı ilginç.

## Notlar (2026-10-09 çalıştırması)

- Yayın kapısı: son yayın 2026-10-01 (CSEP), aradan 8 gün geçti;
  `min_yayin_araligi_gun = 2` fazlasıyla sağlandı.
- Alan rotasyonu: son 3 yayın sistem mühendisliği/sertifika (CSEP), veri
  analitiği, süreç/kültür (dogfooding) idi. Bu yazı emniyet & uçuş kontrol —
  üçünden de farklı.
- Gizlilik kontrolü: yazı tamamen kamuya açık kaza raporu (ATSB), uçuşa
  elverişlilik direktifi (FAA/EASA), NASA teknik raporu ve ABD patenti üzerine
  kurulu. Yazarın proje deneyiminden hiçbir detay kullanılmadı; proje, müşteri,
  ürün adı veya iç süreç geçmiyor.
- Doğrulama: `bundle exec jekyll build` (Homebrew ruby@3.2) başarılı; üretilen
  sayfa yerel sunucuda tarayıcıda açılıp Mermaid `stateDiagram-v2` diyagramının
  gerçekten SVG'ye dönüştüğü doğrulandı (sitede ilk kez bu diyagram tipi
  kullanılıyor).
- Simülasyon ve bit türetmesi yazının içine gömüldü; her iki kod bloğu da
  gerçekten çalıştırıldı ve çıktıları birebir yazıya alındı.

# Araştırma notları — DO-331 model kapsaması vs kod kapsaması

Tarih: 2026-09-10 · Yazı: `_posts/2026-09-10-do-331-model-kapsamasi-kod-kapsamasi.md`

## Novelty gerekçesi

"Bu konuda derin içerik neden zor bulunuyor?"

- DO-331 ücretli bir RTCA belgesi; `MB.B.11` FAQ'sini alıntılayan kamuya açık kaynak
  sayısı bir elin parmaklarını geçmiyor (TASKING/LDRA sayfası, Rapita sayfası).
- İngilizce içeriğin büyük kısmı araç satıcısı pazarlama materyali; ölçülmüş bir
  karşı örnek sunan bir kaynak bulunamadı.
- Türkçe kaynak yok.
- Yaygın yanılgı içeriyor: "model kapsaması = yapısal kapsama" (isimler aynı olduğu
  için: decision, condition, MC/DC).
- Repoda (24 yayın + 65 açık PR) model tabanlı geliştirmeye dair **hiçbir** içerik yok;
  DO-178C tarafı ise doygun.

## Doğrulanan olgular ve kaynakları

| İddia | Kaynak |
|---|---|
| DO-178C ve beş yardımcı belge; DO-331 13 Aralık 2011 | NASA/Jacklin makalesi, ref. listesi |
| DO-331 ≡ ED-218, 1 Ocak 2012 | Accuristech/EUROCAE kaydı, Rapita sayfa başlığı |
| Spesifikasyon modeli = HLR, gerçekleştirim/mimari/veri-kontrol akışı içermez | NASA/Jacklin §VII.A; APT brifingi |
| Tasarım modeli = LLR + mimari; ebeveyn gereksinimi zorunlu | APT brifingi |
| "Modelden kod yazılabiliyorsa tasarım modelidir" | APT brifingi |
| LLR'ye izlenemeyen model kodu olmamalı | NASA/Jacklin §VII.A |
| Model kapsaması ölçütleri (durum geçişleri, mantık kararları, eşdeğerlik sınıfları, türetilmiş gereksinimler) | NASA/Jacklin §VII.B |
| Model kapsaması istenmeyen işlevsellik bulabilir | APT brifingi |
| `MB.B.11` alıntısı (model kapsaması ≠ yapısal kapsama, DO-178C 6.4.4.2) | TASKING/LDRA DO-331 sayfası |
| Model kapsaması, üretilen kodun kapsama analizini ortadan kaldırmaz; hedefte test şart | Rapita DO-331 sayfası |
| Simülasyon kredisi koşulları (her model gereksinimi için simülasyon durumu, normal + robustness) | NASA/Jacklin §VII.C |
| `MB.A-5` / `MB.A-7` tablo adları; Level C vaka çalışması (≈30 vs ≈15 satır/kişi-gün) | arXiv 2010.06505 (DLR/TUM) |
| DO-178C 6.4.4.3 = Structural Coverage Analysis Resolution; ölü kod tanımı | LDRA yapısal kapsama blogu |
| `-fcoverage-mcdc`, `--show-mcdc`, `-show-mcdc-summary` | clang.llvm.org SourceBasedCodeCoverage |

**Doğrulanamadığı için yazıdan çıkarılanlar:**
- Model kapsaması analizinin DO-331'deki tam bölüm numarası (`MB.6.7` olduğu tahmin
  edilebilir ama kamuya açık kaynakla teyit edilemedi) — yazıda numara verilmedi.
- `-fcoverage-mcdc`'nin hangi Clang sürümünde geldiği — "güncel sürümler" denildi.
- TASKING/LDRA sayfası DO-331'i "ED-216" diye anıyor; bu hatalı, yazıda dipnotla belirtildi.

## Deney

Kaynak dosyalar yazının içinde birebir yer alıyor. Ölçüm ortamı: Apple Clang 21,
macOS arm64.

Sonuç (aynı model, aynı 7 gereksinim tabanlı test):

```
guard_A  regions 18/18 100.00%   lines 12/12 100.00%   branches 10/10 100.00%
guard_B  regions 21/23  91.30%   lines 15/15 100.00%   branches 12/14  85.71%
```

Mantık kararı MC/DC her iki fonksiyonda %100 (C1/C2/C3 çiftleri kapalı).
Kapsanmayan iki dal: `guard_B`'deki int16 taşma koruması.

Beyan edilen aralıklarda (|cmd_in| ≤ 10000, |bias| ≤ 2000) ustel tarama:
80.024.001 kombinasyon, guard dalları 0 kez tetiklendi, görülen max |cmd+bias| = 12000
(int16 tavanı 32767). Yani hiçbir gereksinim tabanlı test bu dalları kapsayamaz.

## Reddedilen adaylar

- **ARINC 429 etiket bit-reversal** — açık PR #122 ve #166 zaten işliyor.
- **ADC aperture jitter / ENOB** — yayındaki bandpass sampling yazısı aynı formülü veriyor.
- **CORDIC** — çakışma yok ama novelty testi zayıf; havuzda bırakıldı.

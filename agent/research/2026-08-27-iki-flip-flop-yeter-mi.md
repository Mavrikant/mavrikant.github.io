# Araştırma notları — Senkronizatör MTBF'i ve çok-bitli CDC

## Neden bu konu az bulunuyor
- Metastabilite teorisi her yerde anlatılıyor ama **ölçülmüş katsayılarla sayısal
  bir sonuca kadar götüren** kaynak yok denecek kadar az; τ ve T0 üretici
  karakterizasyon raporlarında gömülü.
- "İki flip-flop koy" tavsiyesi folklor hâline gelmiş; frekans bağımlılığı ve
  N-senkronizatör toplamı neredeyse hiç tartışılmıyor.
- Çok-bitli veri bütünlüğü ile metastabilite sürekli birbirine karıştırılıyor.
- Türkçe kaynak: pratikte sıfır.

## Doğrulanmış olgular
| Olgu | Kaynak | Değer |
|---|---|---|
| MTBF = e^(C2·Tmet)/(C1·fd·fc) | Microchip AN6287 EQ10/EQ12 | — |
| RTG4 katsayıları | AN6287 Tablo 4-1 | C1=2.877e-5 s, C2=7.326e9 Hz (τ=136.5 ps) |
| PolarFire katsayıları | AN6287 Tablo 4-2 | C1=2.45e-11 s, C2=2.1894e10 Hz (τ=45.7 ps) |
| RTG4 Tco, SET filtresi açık | AN6287 §5.1 (DS0131) | 0.243 + 1.3 = 1.543 ns |
| RTG4 Tco, SET filtresi kapalı | AN6287 §5.1 | 0.243 + 0.505 = 0.748 ns |
| RTG4 > 125 MHz için 2-FF yetmez | AN6287 §5.1 | üreticinin kendi tavsiyesi |
| N senkronizatör MTBF'i böler | AN6287 §5.1 | 10 örnek -> 200 yıl gerekir |
| ASYNC_REG=TRUE gerekli | AMD UG903 / UG912 | yerleşim + optimizasyon koruması |
| report_synchronizer_mtbf | AMD UG835 | sadece UltraScale, ASYNC_REG şart, toplam MTBF verir |
| set_max_delay -datapath_only, set_bus_skew | AMD UG949 / UG903 | false_path artık tercih edilmiyor |
| AC 20-152A tarihi ve iptali | FAA AC 20-152A s.1, §3 | 10/7/22; AC 20-152 (30 Haziran 2005) iptal |
| AC 20-152A karmaşıklık ölçütleri | AC 20-152A §4 | "senkron mu asenkron mu", "bağımsız saat sayısı" |
| AC 20-152A SEE kapsamıyor | AC 20-152A §1 | açık ifade |

## Kendi hesaplarım (agent/research/mtbf_calc.py)
Microchip'in dört yayımlanmış örneği birebir yeniden üretildi (27.81 ps / 6.08 ns /
6.15 ns / 3.19 us / 1.50 ns) -> uygulama doğrulandı.

Türetilen yeni sonuçlar (RTG4, fd=12.5 MHz, hedef 20 yıl):
- 100 MHz -> 7.12e8 yıl; 125 MHz -> 247 yıl; 140 MHz -> 151 gün;
  160 MHz -> 4.6 saat; 200 MHz -> 1.4 s
- 20 yıl sınırının geçildiği frekans: 2-FF SET açık 130.5 MHz
  (Microchip'in ">125 MHz" tavsiyesiyle tutarlı), SET kapalı 145.3 MHz,
  3-FF 257.9 MHz
- SET filtresinin bedeli: 0.795 ns -> MTBF x338
- Genel kural: her 100 ps yerleşme süresi ~2 kat MTBF

## Simülasyon (agent/research/cdc_sim.py, seed 20260827)
100 MHz -> 77 MHz, 8 bit, ±150 ps bit skew'i, 2e6 hedef kenarı, metastabilite YOK:
- Düz ikili sayaç: 1739 hayalet değer (%0.087), en kötü hata 107 LSB
  (127->128 geçişinde 21 okundu), ortalama 14.9 us'de bir
- Gray kodlu sayaç: 0 hayalet değer
Karşılaştırma: metastabilite MTBF'i 7.12e8 yıl = 2.25e16 s; hayalet aralığı 1.49e-5 s
-> oran ~1.5e21.

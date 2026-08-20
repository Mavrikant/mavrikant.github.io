# Araştırma Notları — Güç Kesintisinde Flash Atomik Kayıt

Tarih: 2026-08-20 · Alan: gömülü / güvenilirlik

## Konu neden seçildi

Mevcut 24 yayın ve 50 açık PR tarandı. Gömülü kalıcı depolama (EEPROM emülasyonu,
güç-kesintisine dayanıklı kayıt, flash dayanıklılık/saklama) hiçbir yayında ve hiçbir
açık PR'da işlenmemiş. Son 3 yayının alt-alanları (aviyonik/sinyal işleme, yazılım
tasarımı, sistem düşüncesi) ile de çakışmıyor.

## "Bu konuyu bulmak neden zor?"

Konu üç ayrı disiplinin kesişiminde duruyor ve hiçbir kaynak üçünü birden vermiyor:

1. Flash fizik/güvenilirlik literatürü (JEDEC, üretici teknik notları) — dayanıklılık ve
   saklama matematiğini verir, yazılım tasarımına hiç değinmez.
2. MCU üreticisi uygulama notları (ST AN4894) — bir çözüm verir, ama *neden* öyle
   olduğunu ve hangi hata modlarına karşı olduğunu açıklamaz.
3. Akademik güç kesintisi ölçümleri (DAC 2011) — hata modlarını ölçer, ama NAND/SSD
   bağlamındadır, MCU-içi NOR + ECC durumuna çevrilmemiştir.

ECC'li MCU flash'ında yarım yazmanın **NMI** ürettiği ve dolayısıyla CRC tabanlı
savunmanın mimari olarak yetersiz kaldığı gerçeği, yalnızca forum başlıklarına dağılmış
durumda. Türkçe kaynak esasen yok.

## Derinlik öğesi (Bölüm 7)

Deney + hata modu analizi: 428 satırlık bir C flash modeli üzerinde **tüketici güç
kesintisi enjeksiyonu**. Her flash işlemi indeksinde 3 yarım-kalma varyantı denenip
kurtarma sonrası değişmez sınanıyor. Altı tasarım varyantı karşılaştırıldı.

Kaynak: `agent/research/flashsim.c`
Derleme: `cc -O2 -Wall -Wextra -std=c11 -o flashsim flashsim.c && ./flashsim`

## Sonuçlar (PAGE_SIZE=128, NWRITES=10 → tasarım başına 84 senaryo)

| Tasarım | kayıp | bozulma | çökme | ECC-NMI koşumu |
|---|---:|---:|---:|---:|
| A naif yerinde güncelleme | 36 | 0 | 0 | 20 |
| B1 tek adımlı sayfa başlığı | 6 | 0 | 0 | 15 |
| B2 commit işareti payload'dan önce | 0 | 0 | 0 | 22 |
| B3 ECC NMI yakalayıcısı yok | 0 | 0 | 12 | 12 |
| B4 taramada önce payload | 0 | 0 | 0 | 22 |
| C tam tasarım | 0 | 0 | 0 | 12 |

Duyarlılık: PAGE_SIZE 64/128/256 (8/10/20 yazma) ile tekrarlandı; sıralama değişmiyor,
C üç yapılandırmada da sıfır hata veriyor.

### Çürütülen hipotez

Başlangıç hipotezi "commit işaretini payload'dan önce yazmak veri bozulmasına yol açar"
idi. **Çürütüldü**: CRC `(payload, seq)` çiftini kapsadığı için yarım kayıt zaten eleniyor;
84 senaryoda sıfır bozulma. Sıralamanın gerçek etkisi doğrulukta değil, ECC hatasına
maruz kalmada: 22 koşuma karşı 12. Yazıda bu, çürütülmüş hipotez olarak açıkça anlatıldı.

### Öne çıkan bulgu

B3'ün çökme sayısı (12), C'nin ECC-NMI gördüğü koşum sayısına (12) **tam olarak eşit**.
Yani kurtarma sırasındaki her ECC hatası, yakalayıcı yoksa bir boot çökmesidir.

## Bilinen sınırlamalar (yazıda açıkça belirtildi)

- Yüzdeler gerçek dünya olasılığı değil: her işlem indeksine eşit ağırlık veriliyor,
  oysa silme programlamadan çok daha uzun sürer.
- Tek hata varsayımı: kurtarma sırasında ikinci kesinti enjekte edilmiyor.
- DAC 2011 çalışması ham NAND üzerinde; MCU-içi NOR'a aktarılan şey genel ilke.

## Doğrulanmış olgular ve kaynakları

- STM32G4 flash 72 bit (64 veri + 8 ECC) programlanır; silinmemiş adrese yazma `PROGERR`
  kaldırır — RM0440.
- ECC şeması SEC-DED (Hamming + ekstra parite); `ECCD` → NMI — AN5342.
- ST EEPROM emülasyonu: sayfa durum makinesi + `EE_Init` onarımı — AN4894.
- DAC 2011: 11 yonga / 5 üretici / 72–34 nm; güç 3,7 µs'de sıfır; monoton olmayan BER;
  geriye dönük bozulma %25–50; read disturb 2,8M → 1000 okuma; yarım silme sonrası
  program BER %0,4–0,9; silme 50–475 µs'de biter ama komut 2–4 ms sonra döner.
- Micron TN-12-30: JESD47I; detrapping Ea = 1,1 eV (JESD22-A117); 1000 h @125 °C çevrimsiz
  ≈ 100 yıl @55 °C (veya 20 yıl @70 °C); PCHTDR: spesifikasyonun %10'u için 55 °C'de 10 yıl,
  %100'ü için 1 yıl.
- STM32 dayanıklılık tabanı 10 kcycle; STM32U5'te banka başına sınırlı bölgede 100 kcycle.

## Aşınma bütçesi hesabı (yazıda kullanıldı)

2 KB sayfa, 16 B kayıt, saatte bir yazma, 10 yıl:
- slot/sayfa = (2048-16)/16 = 127
- toplam yazma = 87.600 → devir = 87.600/127 ≈ 690 → sayfa başına silme = 345
- 10.000 çevrime karşı %3,5
- naif: 87.600 silme → bütçeyi 8,8 kat aşar; 10.000 saat ≈ 14 ayda tükenir

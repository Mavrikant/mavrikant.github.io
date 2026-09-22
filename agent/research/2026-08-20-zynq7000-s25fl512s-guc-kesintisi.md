# Araştırma Notları — Zynq-7000 + S25FL512S Güç Kesintisi ve Atomik Kayıt

Tarih: 2026-08-20 · Alan: gömülü / güvenilirlik

## Konu neden seçildi

24 yayın ve 50 açık PR tarandı. Kalıcı depolama / QSPI NOR / flash dayanıklılık-saklama
alanı repoda tamamen boş. Son 3 yayının alt-alanlarından (sinyal işleme, yazılım tasarımı,
sistem düşüncesi) farklı. Zynq-7000 daha önce yalnızca Renode simülasyonu yazısında geçmiş,
orada da QSPI/kalıcı depolama işlenmemiş.

## "Bu konuyu bulmak neden zor?"

Üç disiplinin kesişiminde ve hiçbir kaynak üçünü birden vermiyor:

1. Flash güvenilirlik literatürü (JEDEC, üretici notları) — dayanıklılık/saklama matematiği,
   yazılım tasarımına değinmez.
2. Üretici veri sayfası — kısıtları tek cümlelik uyarılar hâlinde verir, sonuçlarını çıkarmaz.
3. Akademik güç kesintisi ölçümleri (DAC 2011) — hata modlarını ölçer, NAND/SSD bağlamında.

Asıl boşluk: S25FL512S'te aynı ECC birimine ikinci kez yazmak **sessizce** EDC'yi kapatır.
Hata bayrağı kalkmaz, veri bozulmaz, test geçer. Bu tek cümlelik veri sayfası uyarısının
tasarım sonuçları hiçbir yerde derli toplu anlatılmamış. Türkçe kaynak yok.

## Derinlik öğesi (Bölüm 7)

Deney + hata modu analizi: S25FL512S semantiğini uygulayan bir model üzerinde tüketici
güç kesintisi enjeksiyonu. Kaynak: `agent/research/qspisim.c`

```
cc -O2 -Wall -Wextra -std=c11 -o qspisim qspisim.c && ./qspisim
```

## Sonuçlar (8 birim/sektör, 8 yazma → 123 senaryo/tasarım)

| Tasarım | kayıp | eskime | bozulma | marjinal | EDC-kapalı |
|---|---:|---:|---:|---:|---:|
| A naif yerinde güncelleme | 49 | 0 | 0 | 0 | 0 |
| B1 tek adımlı sektör başlığı | 18 | 0 | 0 | 0 | 35 |
| B2 payload+commit aynı ECC biriminde | 0 | 0 | 0 | 88 | 484 |
| B3 ECCRD doğrulaması yok | 0 | 0 | 0 | 0 | 35 |
| B4 yerinde geçersiz işaretleme | 27 | 42 | 0 | 0 | 310 |
| C tam tasarım | 0 | 0 | 0 | 0 | 35 |

Duyarlılık (6/8/12 birim, 6/8/12 yazma): sıralama değişmiyor; C üçünde de temiz;
B3 üçünde de C ile özdeş.

### Çürütülen hipotez

"Kurtarmada ECCRD ile doğrulama yapmamak marjinal kayıt kabulüne yol açar" beklentisi
**çürütüldü**. B3, üç yapılandırmanın hiçbirinde C'den farklı sonuç vermedi. Sebep: doğru
iki-birimli düzende kopmuş kayıt zaten kazanamaz (payload koptuysa commit yok; commit
koptuysa CRC tutmaz). Doğru sonuç yazıya işlendi: ECCRD güç kesintisi doğruluğu için
gerekli değil; değeri yaşlanma taraması ve geçmişte kapatılmış EDC tespiti.

### Metodoloji notu

Marjinallik, tasarımın kendi görüşüyle değil **yer gerçeğiyle** yargılandı. İlk sürümde
tasarımın kendi raporu kullanılıyordu ve ECC durumunu hiç sormayan B3 bu yüzden yanıltıcı
biçimde tertemiz görünüyordu.

### Model düzeltmeleri (ilk sürümden)

- B2 başta payload ile commit'i **çakışan** bayt aralıklarına yazıyordu; bu güç kesintisi
  olmadan da bozuluyordu, yani power-fail bulgusu değildi. Ayrık bayt aralıklarına
  çevrildi — gerçekçi hâli: veri bozulmaz, yalnızca EDC sessizce kapanır.
- B4'ün "bozulma" olarak sayılan 42 senaryosu aslında **bir sürüm geriye düşme**;
  ayrı `eskime` kategorisi eklendi.

## Doğrulanmış olgular ve kaynakları

S25FL512S veri sayfası (Doc. 001-98284, Rev. *Q):
- Uniform 256 kB sektör; 512-Mb/1-Gb FL-S yalnızca 256 kB sektör destekler (4 kB yok).
- tSE = 520 ms tipik / 2600 ms maks; tPP (512 B) = 340 µs tipik / 750-1300 µs maks.
- Automatic ECC: 16 bayt hizalı/uzunlukta ECC unit; 8 ECC biti + 1 devre dışı bayrağı;
  tek bit düzeltme. "If the same ECC unit is programmed more than once the ECC value is
  changed to disable the EDC function. A sector erase is needed to again enable Automatic
  ECC on that Programming Block."
- "Sector erase resets all ECC bits and ECC disable flags in a sector to the default state."
- ECCSR yalnızca ECCRD (18h) ile okunur.
- P_ERR/E_ERR set iken WIP 1 kalır; CLSR (30h) gerekir; ardından WRDI ile WEL temizlenir.
- Bank Address Register (BRWR 17h / BRRD 16h / BRAC B9h); güç açılışı, donanım reset ve
  yazılım reset sonrası sıfır + 24-bit adres modu. RESET# bazı paketlerde dışarı çıkmaz.
- "any operation that was interrupted by a hardware reset should be reinitiated"
- Dayanıklılık 100K çevrim min. Saklama: 1K çevrim → 20 yıl, 10K → 20 yıl, **100K → 2 yıl**.

AMD/Xilinx:
- AR 57744: Zynq QSPI denetleyicisi 3 baytlık adreslemeyle sınırlı; >16 MB flash için
  extended address register gerekir; 16 MB'tan büyük flash kullanan tüm Zynq-7000
  platformlarını kapsar. AR 64011 reset akışı örneği.
- QSPI linear mode taban adresi 0xFC00_0000.

## Aşınma/saklama aritmetiği (yazıda kullanıldı)

256 kB sektör, 32 B kayıt, saatte bir yazma, 10 yıl:
- slot/sektör = (262144-32)/32 = 8191
- toplam yazma = 87.600 → devir ≈ 11 → sektör başına silme ≈ 6
- naif: 87.600 silme → 100K spesifikasyonun altında ama saklama 20 yıl → 2 yıla düşer
- açık pencere: naif ~520,3 ms/yazma; günlük ~744 µs/yazma → ~700 kat fark
- kümülatif silme süresi: 12,7 saat → ~6 saniye

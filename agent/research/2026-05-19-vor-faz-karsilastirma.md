# Araştırma Notları — VOR Nasıl Çalışır?

Tarih: 2026-05-19
Slug: 2026-05-19-vor-faz-karsilastirma

## Doğrulanan olgular

- **VHF bandı:** 108.00–117.95 MHz. Kanal aralığı standart 100 kHz; 50 kHz
  kanallar Annex 10 Vol V §4.2.3.1 ile izinli. (ICAO Annex 10 Vol I, FAA AIM Ch.1)
- **9960 Hz alt-taşıyıcı:** CVOR'da REF'i taşır, ±480 Hz FM deviasyonu ile.
  (Wikipedia VHF omnidirectional range, US Patent 4,604,625)
- **DVOR halka çapı:** ~13.5 m / ~44 ft, ~6.7 m yarıçap. (US Patent referansları)
- **DVOR anten sayısı:** 48–52 dairesel anten + merkez taşıyıcı anten.
- **Morse ID:** 1020 Hz tonlu, üç harfli istasyon kodu. (FAA AIM)
- **Scalloping standardı:** ±2° üst limit. (IEEE Sengupta, exam materials)
- **VOR MON:** 2030 hedefiyle FAA, ~580 istasyonu GPS-yedek olarak tutuyor,
  ~307 istasyon kademeli olarak devre dışı bırakılıyor. (FAA VOR MON)
- **VOT:** Tüm radyallere 360° gönderir; alıcı doğruluğu ±4° (FAA standardı).
- **Yatay polarizasyon:** VOR yatay polarizedir.
- **Radyo ufku formülü:** d_NM = 1.23 × √h_ft (standart yaklaşım).

## DVOR halka çapı matematiksel türetmesi

```
f_d = (v / c) × f_c       (Doppler)
v   = 2π × f_rot × r      (teğetsel hız, f_rot = 30 Hz)
r   = f_d × c / (2π × f_rot × f_c)
    = 480 × 3e8 / (2π × 30 × 113e6)
    ≈ 6.76 m
D   = 2r ≈ 13.5 m ≈ 44.3 ft
```

Bant kenarlarında küçük sapma:
- f_c = 108 MHz → D ≈ 14.15 m (~46.4 ft)
- f_c = 118 MHz → D ≈ 12.96 m (~42.5 ft)

Pratikte ~44 ft sabit, ±480 Hz deviasyon spesifikasyonu yaklaşık tutulur.

## Çıkarılan / Doğrulanamayan İddialar

- Türkiye'deki spesifik VOR istasyonu frekansları ASIN/AIP'den teyit edilmediği
  için yazıda **özel istasyon adı veya frekansı verilmedi**; sadece genel cümle.
- Stuart Seeley'nin VOR patent bağlantısı net değildi — SCS-51 ABD Ordusu
  ekipmanı olarak referans verildi, Seeley'nin spesifik patenti iddia edilmedi.

## Yazıda kullanılan derinlik öğeleri (Bölüm 7)

1. **Matematiksel türetme:** DVOR halka çapının ±480 Hz spesifikasyonundan
   tek bir Doppler denklemiyle nasıl çıktığı.
2. **Standart yorumu:** ICAO Annex 10 spektral planı (neden 30 Hz, 1020 Hz,
   9960 Hz boşlukları seçildi).
3. **Kod örneği:** I/Q faz dedektörü için Python referans implementasyonu
   (Goertzel/DFT temelli).
4. **Yanlış anlama açıklaması:** "VOR yön bulur" yanılgısının pratik
   sonuçlarının netleştirilmesi.

## Neden Türkçe'de bulunması zor?

- Türkçe içerikler genelde "VOR sinyal yayar, açı verir" Wikipedia seviyesinde
  kalıyor; faz karşılaştırması mekanizması açıklanmıyor.
- DVOR halka geometrisinin matematiksel türetmesi tek tek İngilizce makaleler
  ve patent dosyalarında dağınık halde; Türkçe tek-yerde derli toplu yok.
- ICAO Annex 10 ücretli ve sadece kurumlarda erişilebilir.
- Pek çok ders/kurs "VOR direction finder"a benzer açıklamalarla geçiştiriyor;
  yanılgıyı düzelten Türkçe içerik nadir.

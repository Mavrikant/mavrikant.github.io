# Araştırma notları — Endianness'in üç katmanı (2026-06-09)

## Doğrulanan olgular

### ARM endianness mimarisi
- **BE-32 (word-invariant)**: ARMv5 ve öncesi. 32-bit erişimler aynı görünür; byte ve half-word erişimler adres çevrimi ile redirect edilir. ARMv7 ile kaldırıldı.
- **BE-8 (byte-invariant)**: ARMv6 ile geldi. Byte erişim LE ile aynı; çoklu byte erişimde byte swap yapılır. ARMv7 ve sonrası için tek desteklenen BE biçimi.
- **ARMv7-A**: CPSR.E biti veri endianness'ini taşır. SETEND komutu çalışma zamanında bunu değiştirebilirdi.
- **ARMv8-A AArch64**: SETEND kaldırıldı. Instruction fetch her zaman LE; veri endianness'i SCTLR_EL1.E0E ve SCTLR_ELx.EE üzerinden seçilir.
- **REV / REV16 / REVSH**: ARMv6+ byte-swap komutları. Tek döngüde 32-bit (REV), 16-bit çiftleri (REV16), signed half-word (REVSH).

Kaynak: ARM ARM (ARMv7-A v8-A Architecture Reference Manual), Wikipedia Endianness.

### GCC bitfield ordering
- C99/C11 §6.7.2.1: "The order of allocation of bit-fields within a unit is implementation-defined."
- GCC: bitfield'ler hedefin byte order'ını takip eder. LE'de ilk deklare edilen alan LSB'de; BE'de MSB'de.
- ARM EABI / AAPCS belirtir: storage unit içinde tahsis sırası endianness'e bağlı.
- `-fsso-struct=big-endian` / `pragma scalar_storage_order` GCC eklentisi.

Kaynak: GCC docs (Storage Layout, Structure-Layout Pragmas).

### ARINC-429
- 32-bit word, 100 kbit/s (LS) veya 12.5 kbit/s (LS).
- Bit 1 (LSB) önce gönderilir. Ama: **Label alanı (bit 8..1)** içeride MSB-first numaralandırılmıştır — tarihsel sebep.
- Pratikte transceiver shift register'ı LSB-first olduğundan, octet erişiminde "ters etiket" (bit-reversed) yazılır/okunur. Örnek: label 213 (octal) → 0x8B → bit-reversed 0xD1 oktet olarak yazılır.

Kaynak: Wikipedia ARINC 429, superavionics.com label decoder, toddheffley.com commentary.

### MIL-STD-1553B
- 16-bit data word, 1 MHz Manchester II biphase encoding.
- Sync (3 bit-time) + 16 data + 1 parity = 20 bit-time.
- **Bit 15 (MSB) önce iletilir.** Big-endian on wire.
- Logic 1 = positive-to-negative geçiş; logic 0 = negative-to-positive (Manchester II).

Kaynak: MIL-STD-1553B doc, UEI tutorial, Wikipedia MIL-STD-1553.

## Derinlik öğeleri (Bölüm 7)

1. **Deney**: Aynı bitfield struct'ı GCC ile LE ve BE hedefe compile edip `gdb`'de bellek dökümü göstermek → ikisi farklı görünüyor.
2. **Standart yorumu**: C standardının "implementation-defined" alanına dair somut yorum + ARINC-429 etiket bit numaralandırma belirsizliğinin sahada nasıl yanlış anlaşıldığı.
3. **Assembly inspection**: REV/REV16 komutlarının `-O2` ile `__builtin_bswap32`'den nasıl üretildiği.
4. **Gerçek hata kalıbı**: 1553 BC'den 0x1234 göndermek istenen yerde host LE struct'ın doğrudan kopyalanması → tel üstünde 0x3412 görünür.

## Novelty (Bölüm 8)

Türkçe içerik arandığında bulunanlar:
- Çoğunlukla "little vs big endian nedir" düzeyinde başlangıç anlatımı.
- ARM'ın BE-8/BE-32 ayrımı Türkçe kaynakta neredeyse hiç yok.
- Bitfield bit sırası tuzakları kısaca geçilir, GCC'nin endianness ile bağı somutlanmaz.
- ARINC-429 label bit-reversal ve 1553 MSB-first nüansı pratikten kopuk anlatılır.

Sentez (3 katman + ARM mimari + aviyonik veriyolu) Türkçe içerikte bulunmuyor.

## Olası gizlilik riski

- Hiçbir proje-spesifik veri yok. MIL-STD-1553 ve ARINC-429 açık standartlar.
- ARM endianness ARM Ltd belgelerinden açık.
- Bitfield örnekleri standart C kodu.
- ✅ Güvenli.

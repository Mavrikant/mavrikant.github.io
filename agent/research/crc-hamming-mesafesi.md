# Araştırma Notları: CRC ve Hamming Mesafesi

## Doğrulanan Olgular

### Koopman optimal polinomlar (CMU sayfası, implicit +1 gösterimi)
- CRC-8 / HD=4: 0x247, 501 bit dataword'e kadar
- CRC-8 / HD=3: 0xe7, 247 bit
- CRC-16 / HD=4: 0xd175, 32,751 bit
- CRC-16 / HD=3: 0x8d95, 65,519 bit
- CRC-24 / HD=4: 0x9945b1
- CRC-32 / HD=6: 0xba0dc66b (Koopman 2002 paper)
- CRC-32 / HD=4: 0xc9d204f5, 2.1G bit
- CRC-32 / HD=5: 0xd419cc15, 65,505 bit
- CRC-32 / HD=3: 0xad0424f3

### Standartlaştırılmış polinomlar
- IEEE 802.3 CRC-32 (Ethernet): 0x04C11DB7 — Ethernet MTU 1518 byte = 12,144 bit; HD=4 üzeri için HD=2'ye düşer
- CRC-32C (Castagnoli): 0x1EDC6F41 — iSCSI, SCTP, Btrfs, ext4, NVMe; daha iyi HD karakteristiği
- CRC-16-CCITT (XMODEM): 0x1021 — HD=4 32,751 bite kadar; çift hatalar tek hatalardan iki kat daha büyük olasılıkla kaçar
- CAN classic CRC-15: 0x4599 (x^15 + x^14 + x^10 + x^8 + x^7 + x^4 + x^3 + 1) — HD=6 ama stuff-bit yüzünden bazı desenler için HD=2'ye düşer
- CAN XL: CRC-17 + CRC-21, HD=6 frame boyunca
- AFDX/ARINC-664 P7: IEEE 802.3 CRC-32 kullanır
- ARINC-429: sadece odd parity (CRC yok)
- MIL-STD-1553: Manchester + odd parity (CRC yok)

### Diğer checksum algoritmaları (Maxino & Koopman 2009)
- Fletcher-16: 2056 bit codeword'den itibaren HD=2
- Fletcher-8: 68 bit'ten itibaren HD=2
- Adler-32: HD=3 ~1M bit'e kadar (kısa mesajlarda zayıf)
- CRC her ek HD bitiyle daha iyi olur, ama Fletcher/Adler aynı HD'de bile CRC'den kötü undetected-error olasılığı verir

### FAA referansı
- DOT/FAA/TC-14/49 (2015) "Selection of Cyclic Redundancy Code and Checksum Algorithms to Ensure Critical Data Integrity" — Koopman, Driscoll, Hall
- FAA AC 00-66 (2015-08-04) bu raporu referans olarak duyurur
- Beş bulgu: (1) CRC genelde checksum'dan üstün, (2) yaygın standartlar suboptimal olabilir, (3) HD birincil metrik, (4) tek tip çözüm yok, (5) gerçek dünya etkili birden çok ikincil faktör

### Implementasyon
- Sarwate (1988): byte-bazlı table-driven, 1 KB tablo
- Slicing-by-4 / Slicing-by-8 (Intel, 2006): 4-8 KB tablo, 2-3x hız
- Donanım: Intel SSE4.2 `CRC32` (CRC-32C için), ARMv8 isteğe bağlı CRC eklentisi

### Burst-error özellikleri
- N-bit CRC tüm <N bit burst hatalarını yakalar
- N-bit burst'ler 1/2^(N-1) olasılıkla kaçar
- N+1 bit ve uzun burst'ler en kötü 1/2^N olasılıkla kaçar

## Kaynak listesi (yazıya konulacak)
- Koopman, P. "Best CRC Polynomials." users.ece.cmu.edu/~koopman/crc/
- Koopman, P., Chakravarty, T. "Cyclic Redundancy Code (CRC) Polynomial Selection For Embedded Networks." DSN 2004
- Koopman, P. "32-Bit Cyclic Redundancy Codes for Internet Applications." DSN 2002
- Maxino, T., Koopman, P. "The Effectiveness of Checksums for Embedded Control Networks." IEEE TDSC 2009
- Castagnoli, G., Brauer, S., Herrmann, M. "Optimization of Cyclic Redundancy-Check Codes with 24 and 32 Parity Bits." IEEE Trans. Commun. 1993
- Koopman, P., Driscoll, K., Hall, B. "Selection of CRC and Checksum Algorithms..." DOT/FAA/TC-14/49, 2015
- FAA AC 00-66, 2015-08-04
- CiA: "CRC Error Detection for CAN XL" — Senger, 2020
- ARINC 664 Part 7
- IEEE 802.3-2018

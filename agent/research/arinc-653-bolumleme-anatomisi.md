# Araştırma Notları — ARINC 653 Bölümleme Anatomisi

## Standart yapısı
- ARINC Report 653: Avionics Application Software Standard Interface
- Part 1: Required Services (Supplement 5 en güncel yayınlanan; APEX API'nin çekirdek çağrıları)
- Part 2: Extended Services (isteğe bağlı — SAP, dosya sistemi, isim servisleri)
- Part 3A/3B: Conformity Test Specification
- Part 4: Subset Services (küçük ayak izli sistemler için)
- Part 5: Core Software (çok çekirdek işlemcilerde bölümleme kuralları)
- İlk yayın: 1996-1997 (Boeing 777 sonrası IMA'ya geçişle örtüşür)

## IMA bağlamı
- RTCA DO-297: IMA guidance
- EUROCAE ED-124: DO-297'nin Avrupa muadili
- Federated → Integrated: her fonksiyon için ayrı LRU (Line Replaceable Unit) yerine
  ortak platformda barındırılan çoklu uygulamalar.

## Bölümleme mekanizması
- **Zaman**: cyclic (döngüsel) schedule table; major time frame içinde her partition için
  önceden sabitlenmiş bir "window" (dilim). MOS (Module OS) planlayıcı sabit tabloyu takip
  eder; öncelik tabanlı değildir.
- **Uzay**: MMU/MPU tabanlı bellek koruması. Her partition kendi kod, veri, yığın alanına
  sahiptir. Diğer partition'ların bellek bölgelerine erişim donanım tarafından reddedilir.
- **Kaynak**: I/O ve donanım kaynak erişimi de bölümleme dahilindedir (device driver
  soyutlaması partition ötesi çakışmaya izin vermez).

## APEX API (kısaltmalarla)
- Partition Management: GET_PARTITION_STATUS, SET_PARTITION_MODE
- Process Management: CREATE_PROCESS, START, STOP, RESUME, PERIODIC_WAIT
- Time Management: TIMED_WAIT, GET_TIME, REPLENISH
- Intra-partition:
  - Buffer (FIFO)
  - Blackboard (paylaşımlı bellek benzeri, son değer)
  - Semaphore
  - Event
- Inter-partition:
  - Sampling port (üzerine yazan tek örnek — sensör verisi gibi)
  - Queuing port (FIFO — komut/mesaj)
- Health Monitoring: REPORT_APPLICATION_MESSAGE, GET_ERROR_STATUS, RAISE_APPLICATION_ERROR

## Health Monitoring (HM)
- 3 seviye: Process (SW error), Partition, Module
- HM tablosu XML/config ile tanımlanır: hata kodu × seviye → recovery action
- Recovery aksiyonları (ARINC 653 Part 1):
  - IGNORE
  - PROCESS_RESTART
  - PARTITION_RESTART (COLD_START / WARM_START)
  - PARTITION_STOP → IDLE mode
  - MODULE_RESTART
  - MODULE_STOP
- Hata kaynakları: illegal_request, application_error, numeric_error, memory_violation,
  deadline_missed, hardware_fault, power_fail, partition_config
- Process states: DORMANT / READY / RUNNING / WAITING
- Partition modes: IDLE / COLD_START / WARM_START / NORMAL

## Multi-core (Part 5 & CAST-32A/B)
- CAST-32A / CAST-32B: CAST (Certification Authorities Software Team) position papers on
  multi-core processors in airborne systems.
- "Interference channels": shared cache, shared bus, DRAM controller, snoop bus.
- WCET analizi zorlaşır; deterministic olması için çoğu program tek çekirdeğe kilitleme
  ile başlar (AMP), sonra symmetric olarak parallel partition'lar eklenir.

## Örnek uygulamalar
- Ticari: Wind River VxWorks 653, Green Hills INTEGRITY-178, Lynx LynxOS-178, SYSGO PikeOS
  (hypervisor + ARINC 653 personality), DDC-I Deos.
- Açık kaynak: POK (Partitioned Operating Kernel — ISAE-SUPAERO); XtratuM (UPV,
  hypervisor katmanı).
- Sertifikasyon: MOS + POS + uygulamalar DO-178C DAL A/B/C rigor'unda sertifikalandırılır.

## Kaynaklar (yazıda dahil edilecek)
- ARINC Report 653 — Aeronautical Radio Inc. (ARINC Industry Activities catalog)
- RTCA DO-297 — Integrated Modular Avionics (IMA) Development Guidance
- EUROCAE ED-124
- POK: https://pok-kernel.github.io/
- XtratuM: http://www.xtratum.org/
- CAST-32A / CAST-32B: FAA CAST position papers (CAST papers listesi FAA.gov)
- Rushby, "Partitioning in Avionics Architectures: Requirements, Mechanisms, and
  Assurance" (NASA CR-1999-209347) — bölümleme bağımsızlık argümanı
- Prisaznuk, "Integrated modular avionics" (IEEE NAECON 1992) — IMA ilk formülasyon
- ARINC 653 Part 1 API çağrı listesi ve semantikler her ana OS'nin dev docs'unda
  özetlenmiş: Wind River VxWorks 653 Programmer's Guide, DDC-I Deos manuals, PikeOS
  ARINC 653 personality docs.

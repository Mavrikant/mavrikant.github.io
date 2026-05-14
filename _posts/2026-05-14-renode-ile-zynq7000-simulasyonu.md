---
title: "Renode ile Zynq7000 Simülasyonu"
subtitle: "Zynq7000 Simulation with Renode"
background: "/img/posts/5.webp"
date: '2026-05-14 09:00:00'
layout: post
lang: tr
mermaid: true
---

Gömülü sistem geliştirmenin en yorucu yanlarından biri, donanımın kendisidir. FPGA bitstream'leri saatler süren sentez işlemleri ister, geliştirme kartları ekipler arasında paylaşılır, JTAG bağlantıları kopar, sahada hata ayıklamak ise her zaman mümkün olmayabilir. Sürekli entegrasyon (CI) altyapısına fiziksel kart bağlamak ayrı bir mühendislik problemidir.

İşte bu noktada **Renode** devreye giriyor. Bu yazıda, Xilinx (artık AMD) **Zynq7000** SoC ailesinin Renode üzerinde nasıl simüle edildiğine, donanım çevre birimleri ile FPGA tarafının nasıl modellendiğine ve bu yaklaşımın hangi avantajları getirdiğine bakacağız.

---

## Renode Nedir?

[Renode](https://renode.io), [Antmicro](https://antmicro.com/) tarafından geliştirilen, **Apache 2.0** lisansı ile dağıtılan açık kaynak bir tam SoC emülatörüdür. QEMU'nun aksine yalnızca CPU emülasyonuna odaklanmaz; çevre birimleri, sensörler, ağ arayüzleri, kablosuz iletişim modülleri ve hatta birden fazla cihazın aynı anda çalıştığı sistemleri tek bir simülasyon ortamında ele alır.

Renode'un öne çıkan özellikleri:

- **Geniş platform desteği:** 100'den fazla SoC ve geliştirme kartı (ARM Cortex-M/A, RISC-V, x86, PowerPC)
- **Python ile genişletilebilirlik:** Yeni bir çevre birimi, birkaç satırlık bir Python betiği ile eklenebilir
- **Deterministik yürütme:** Aynı senaryo her çalıştırıldığında tıpatıp aynı sonucu üretir
- **Robot Framework entegrasyonu:** Test otomasyonu doğrudan desteklenir
- **Yerleşik GDB sunucusu:** Hata ayıklama için ek araç gerekmez

QEMU'dan en belirgin farkı, Renode'un **sistem entegrasyon testlerine** odaklı tasarlanmış olmasıdır. UART çıktısını yakalamak, GPIO durumunu değiştirmek, sensörden değer "enjekte etmek" ya da ağ trafiğini iki sanal cihaz arasında köprülemek gibi işlemler birinci sınıf vatandaştır.

---

## Zynq7000 Mimarisine Kısa Bir Bakış

Zynq7000, tek bir silikon üzerinde iki dünyayı birleştirir:

- **PS (Processing System):** Çift çekirdekli **ARM Cortex-A9** (866 MHz'e kadar), NEON SIMD birimi, donanımsal FPU, L1/L2 önbellek, DDR3 denetleyicisi ve sabit çevre birimleri (UART, SPI, I2C, GPIO, USB, Gigabit Ethernet, SD/MMC).
- **PL (Programmable Logic):** Artix-7 ya da Kintex-7 ailesinden bir **FPGA dokusu**. Geliştiricinin kendi IP bloklarını, hızlandırıcılarını veya özel arayüzlerini sentezleyebildiği yer.
- **AXI Interconnect:** PS ile PL arasındaki yüksek bant genişlikli köprü. AXI3 / AXI4 protokolü üzerinden General-Purpose (GP), High-Performance (HP) ve Accelerator Coherency Port (ACP) bağlantıları sunar.

PS tarafı, donanım üreticisi tarafından sabitlenmiş bir mikrodenetleyiciye benzer. PL tarafı ise tamamen sizin elinizdedir; bitstream ile yeniden programlayabilirsiniz. İşte Renode'un Zynq7000'i simüle ederken bu iki dünyayı nasıl ele aldığı yazının kalbini oluşturuyor.

<div class="mermaid">
graph TB
    subgraph PS[Processing System - PS]
        CPU0[Cortex-A9 #0]
        CPU1[Cortex-A9 #1]
        GIC[GIC Interrupt Controller]
        UART[PS7_UART]
        GPIO[PS7_GPIO]
        TIMER[Triple Timer Counter]
        DDR[DDR3 Controller]
    end
    subgraph PL[Programmable Logic - PL / FPGA]
        IP1[Özel IP Bloğu]
        IP2[AXI Slave Peripheral]
        IP3[DMA Hızlandırıcı]
    end
    AXI{AXI Interconnect}
    CPU0 --> AXI
    CPU1 --> AXI
    UART --> GIC
    GPIO --> GIC
    TIMER --> GIC
    AXI --> IP1
    AXI --> IP2
    AXI --> IP3
</div>

---

## Kurulum

Renode'u edinmenin birkaç yolu vardır. Linux üzerinde en hızlı yol resmi paket deposunu kullanmaktır:

```bash
# Ubuntu / Debian
wget https://github.com/renode/renode/releases/latest/download/renode_latest.deb
sudo apt install ./renode_latest.deb

# Çalıştır
renode
```

Docker tercih edenler için resmi imaj da mevcuttur:

```bash
docker run -it --rm antmicro/renode:latest
```

Kaynaktan derleme isteyenler `dotnet` SDK 8.0 ile depoyu çekip `build.sh` betiğini çalıştırabilir. macOS ve Windows için de hazır paketler bulunuyor.

Kurulum doğrulaması basittir: `renode` komutu sizi `(monitor)` istemi ile karşılayacaktır.

---

## İlk Simülasyon: .resc Senaryo Dosyası

Renode iki tür dosya kullanır:

- **`.repl`** (Renode Platform) — Platformun tanımı: hangi çevre birimleri hangi adreslerde, hangi IRQ'lara bağlı.
- **`.resc`** (Renode Script) — Senaryo: hangi platformu yükle, hangi firmware'i çalıştır, hangi pencereleri aç.

Renode kurulumu, Zynq tabanlı popüler kartlar için hazır platform dosyaları içerir. Örneğin **ZedBoard** için tipik bir senaryo şöyle görünür:

```
:name: ZedBoard ile Zynq7000 Simulasyonu
:description: Zynq7000 uzerinde bare-metal firmware

mach create "zedboard"
machine LoadPlatformDescription @platforms/boards/zedboard.repl

# UART cikti penceresini ac
showAnalyzer sysbus.uart1

# Firmware'i yukle
sysbus LoadELF @firmware.elf

# CPU0'i belirli bir adresten baslat
cpu0 PC 0x00100000

start
```

Bu senaryoyu `renode boot.resc` ile çalıştırdığınızda yeni bir pencere açılır ve UART çıktısı orada akmaya başlar. `pause`, `step`, `start` komutları ile zamanı tamamen kontrol edebilirsiniz; simülasyonu istediğiniz anda dondurabilir, tek tek talimat ilerletebilir veya gerçek zamandan kat kat hızlı çalıştırabilirsiniz.

---

## Platform Tanımı: .repl Dosyaları

Bir `.repl` dosyası, platformun adres haritasını, kesme bağlantılarını ve reset değerlerini tanımlar. ZedBoard platformunun küçük bir parçası:

```
gic: IRQControllers.ARM_GenericInterruptController @ {
        sysbus new Bus.BusMultiRegistration { address: 0xF8F00000; size: 0x1000; region: "distributor" };
        sysbus new Bus.BusMultiRegistration { address: 0xF8F00100; size: 0x100; region: "cpuInterface" }
    }
    [0-1] -> cpu0@[0-1]

uart1: UART.Cadence_UART @ sysbus 0xE0001000
    -> gic@52

gpio: GPIOPort.XilinxGPIOPS @ sysbus 0xE000A000
    IRQ -> gic@53

ttc0: Timers.Cadence_TTC @ sysbus 0xF8001000
    [0-2] -> gic@[42-44]
```

Burada `Cadence_UART`, `XilinxGPIOPS` gibi tip isimleri, Renode içinde hazır olarak gelen çevre birimi modellerine karşılık gelir. Adres alanı (`0xE0001000`), reset davranışı ve IRQ numarası, fiziksel Zynq7000 ile birebir eşleşir. Yani aynı sürücü kodu, hem Renode üzerinde hem gerçek kart üzerinde değişiklik gerektirmeden çalışır.

İhtiyacınız olan bir çevre birimi platformda yoksa, kendi `.repl` dosyanızı yazarak ya da mevcut olanı `using` ile dahil edip üzerine ekleme yaparak özelleştirebilirsiniz.

---

## Donanım Çevre Birimlerinin Simülasyonu

Renode, çevre birimlerini **kayıt davranış seviyesinde** (register-transaction-level) modeller. Cycle-accurate değildir; yani saat döngüsü hassasiyetinde zamanlama yapmaz. Bunun yerine, yazılımın gördüğü her şeyin doğru olmasına odaklanır: aynı register adresleri, aynı bit alanları, aynı IRQ tetikleme davranışı, aynı protokol durum makineleri.

Zynq7000 için yerleşik olarak modellenen başlıca çevre birimler:

- **UART (PS7_UART / Cadence_UART)** — Tam fonksiyonel; FIFO seviyesi, baud rate, IRQ davranışı
- **GIC (Generic Interrupt Controller)** — ARM PrimeCell standart GIC modeli
- **TTC (Triple Timer Counter)** — Üç bağımsız 16-bit sayaç
- **GPIO (XilinxGPIOPS)** — 4 banka, MIO ve EMIO pinleri
- **I2C, SPI** — Cadence master/slave denetleyicileri
- **DMA, Ethernet (GEM), SD/MMC** — Temel düzeyde modellenmiştir

Bir çevre birim eksikse, **Python ile birkaç satırda** basit bir model yazılabilir. Renode'un `PythonPeripheral` sınıfı, harici `.py` dosyalarını doğrudan çevre birim olarak yükler. Önce platforma yeni cihazı ekleriz:

```
my_sensor: Python.PythonPeripheral @ sysbus 0x43C00000
    size: 0x100
    initable: true
    filename: "@scripts/my_sensor.py"
```

Sonra Python betiğini yazarız. Burada `request` nesnesi her bus erişiminde otomatik gelir:

```python
# my_sensor.py
if request.isInit:
    sensor_value = 0

elif request.isRead:
    if request.offset == 0x00:
        request.value = sensor_value      # sicaklik degeri
    elif request.offset == 0x04:
        request.value = 0x0001            # durum bayragi: hazir

elif request.isWrite:
    if request.offset == 0x08:
        sensor_value = request.value      # firmware kalibrasyon yazabilir
```

Hepsi bu kadar — sınıf, kalıtım ya da derleme adımı yok. Renode konsolundan simülasyon sırasında `sysbus.my_sensor WriteDoubleWord 0x08 42` yazarak sensör değerini değiştirebilirsiniz; firmware tam o anda farklı bir koda dallanır. Bu, **fault injection** testleri için son derece güçlü bir araçtır.

---

## FPGA / PL Tarafı Nasıl Simüle Edilir?

Renode'un en sık sorulan sorularından biri: "Peki ya FPGA?" Renode kendi başına Verilog ya da VHDL kodunu yorumlamaz. PL tarafını ele almak için üç yaygın yaklaşım vardır:

### a) Mock / Stub Peripheral

FPGA'da yapılacak işin **davranışsal modelini** Python olarak yazarsınız. AXI register haritası taklit edilir, içerideki algoritma host kodunda çalışır. RTL test edilmez ama yazılım entegrasyonu sorunsuz ilerler. Yukarıdaki `my_sensor.py` örneği aslında bu yaklaşımın tipik bir örneğidir.

**Ne zaman uygun?** Henüz HDL kodu yazılmadan, sadece yazılım tarafının ilerlemesi gerektiğinde. PoC ve early-stage firmware geliştirmesi için ideal.

### b) Verilator Co-simülasyon

Renode, **Verilator** ile sıkı entegrasyona sahiptir. HDL kaynak dosyaları Verilator ile C++'a derlenir; ortaya çıkan ikili dosya bir soket aracılığıyla Renode'a bağlanır. Renode'un AXI işlemleri (read/write transaction'lar) bu köprü üzerinden Verilator'a iletilir, Verilator yanıtı geri döner. PL bloğunuz **gerçek RTL** ile test edilmiş olur.

```
mach create "zynq_with_pl"
machine LoadPlatformDescription @platforms/boards/zedboard.repl

# Verilator ile co-sim baglantisi
sysbus LoadCFG @my_axi_ip.cfg
machine LoadPeripheralAtAddress sysbus.myPLBlock 0x43C00000
```

**Ne zaman uygun?** PL bloğunuzun RTL doğrulamasını da sistem testine dahil etmek istediğinizde. Saf RTL simülasyonuna kıyasla yavaş kalsa da, yazılım sürücüleriyle birlikte uçtan uca test imkânı verir.

### c) AXI Bus Modeli + Soyut Peripheral

İkisinin arası bir yol: HDL yazmadan, AXI protokolünün doğru ritmini taklit eden bir **Python peripheral** yazarsınız. AXI handshake'i ve register davranışını modellersiniz; gerçek FPGA mantığı yerine kabul edilebilir bir yazılım modeli koyarsınız. Örneğin yazılan veriyi sayıp, hazır bayrağı tutan minimal bir AXI slave:

```python
# axi_fifo.py - Yazilanlari sayan basit AXI slave
if request.isInit:
    write_count = 0
    last_data = 0

elif request.isRead:
    if request.offset == 0x00:
        request.value = 0xDEADBEEF       # IP ID register
    elif request.offset == 0x04:
        request.value = write_count       # kac kez yazildi
    elif request.offset == 0x08:
        request.value = last_data         # son yazilan veri

elif request.isWrite:
    if request.offset == 0x08:
        last_data = request.value
        write_count += 1
```

Bu kadar küçük bir model bile, sürücü geliştirmek ve yazılım entegrasyonunu test etmek için yeterlidir; RTL henüz olgunlaşmamış olsa bile çalışır.

### Üç Yaklaşımın Karşılaştırması

| Yaklaşım | Hız | Gerçekçilik | Kurulum Zorluğu | RTL Testi |
|----------|-----|-------------|------------------|-----------|
| Mock peripheral | Çok yüksek | Düşük | Çok kolay | Hayır |
| AXI bus modeli | Yüksek | Orta | Orta | Hayır |
| Verilator co-sim | Düşük | Yüksek | Yüksek | Evet |

Pratikte ekipler bu yaklaşımları **birlikte** kullanır: yazılım ekibi mock peripheral ile hızlıca ilerler, RTL hazır olduğunda Verilator co-simülasyonuna geçilir.

---

## Test Otomasyonu

Renode, **Robot Framework** ile gelir. Bu, simülasyonun CI/CD ortamlarına entegrasyonunu çok kolaylaştırır. Tipik bir test dosyası şuna benzer:

```robot
*** Settings ***
Suite Setup     Setup
Suite Teardown  Teardown
Test Setup      Reset Emulation
Resource        ${RENODEKEYWORDS}

*** Test Cases ***
Boot ZedBoard Firmware
    Execute Command          include @scripts/boot.resc
    Create Terminal Tester   sysbus.uart1
    Start Emulation
    Wait For Line On Uart    Boot tamamlandi
    Wait For Line On Uart    Sensor degeri: 42

GPIO Pini Yuksek Cikmali
    Execute Command          include @scripts/boot.resc
    Start Emulation
    Execute Command          sysbus.gpio WritePin 7 true
    # Firmware'in pini okuyup yanit vermesini bekle
    Wait For Line On Uart    Pin 7 yuksek
```

Komut: `renode-test test.robot`. CI ortamında bu komut, fiziksel kart gerektirmeden bütün regresyon testlerini koşturur. Uzun boot sürelerini atlamak için **snapshot/restore** mekanizmasını kullanabilirsiniz: simülasyonu bir kez boot edip diski snapshot olarak kaydeder, sonraki testlerde o noktadan başlarsınız.

---

## Avantajlar

Renode ile Zynq7000 simülasyonunun fiziksel kartla karşılaştırması:

| Özellik | Fiziksel Kart | Renode Simülasyon |
|---------|---------------|-------------------|
| Birim maliyet | Yüksek (~$200+) | Sıfır |
| CI/CD entegrasyonu | Karmaşık (kart farm gerekir) | Tek Docker imajı |
| Paralel test | 1 kart = 1 test | Sınırsız (CPU sayısı kadar) |
| Determinizm | Düşük (zamanlama varyasyonu) | Yüksek (bit-bit tekrarlanabilir) |
| Hata ayıklama | JTAG + ek donanım | Yerleşik GDB sunucusu |
| Zaman kontrolü | Yok | Pause / step / hızlandır |
| Multi-node senaryo | Karmaşık | Yerleşik |
| Sensör değeri enjeksiyonu | Donanım hilesi | Tek komut |
| Boot süresi | Saniyeler | Snapshot ile ms |

Buna ek olarak Renode, **donanım gelmeden önce** firmware geliştirmeyi mümkün kılar. Yeni bir kart için PCB üretimi haftalar alırken, yazılım ekibi Renode üzerinde ilk gün çalışmaya başlayabilir. Donanım geldiğinde, port maliyeti çoğu zaman birkaç satır `.repl` değişikliğiyle sınırlı kalır.

Eğitim ve dokümantasyon açısından da çok değerlidir: yeni katılan bir mühendis, kart için sıraya girmek zorunda kalmadan ilk haftadan itibaren kodu çalıştırıp deney yapabilir.

---

## Sınırlamalar

Renode'un her şeye çare olmadığını da unutmamak gerekir:

- **Cycle-accurate değildir.** Gerçek zamanlı performans profili ölçümü için uygun değildir. Cache miss oranları, DDR3 timing'i, pipeline davranışı gerçek donanımdaki sonuçlarla birebir örtüşmez.
- **Tüm çevre birimleri tam modellenmemiştir.** Zynq7000'in PCIe, USB OTG gibi bazı blokları yalnızca temel düzeyde simüle edilir.
- **FPGA HDL doğrulaması için Verilator gibi ek bir araç gerekir.** Renode tek başına RTL çalıştıramaz.
- **Analog dünya kısıtlıdır.** ADC/DAC kanalları yerleşik olarak gelmez; veri akışını siz "enjekte etmelisiniz".

Bu sınırlamalara rağmen, sistem entegrasyon testlerinin **%80'i** Renode üzerinde yapılabilir. Geri kalan kısım fiziksel donanımda son doğrulamayla tamamlanır.

---

## Sonuç

Zynq7000 gibi PS+PL hibrit bir SoC'yi geliştirmek, donanım kaynaklı bekleme süreleri ve test maliyetleri yüzünden çoğu zaman acı verici olur. Renode, açık kaynak doğası, geniş çevre birim kütüphanesi ve Verilator ile co-simülasyon yeteneği sayesinde bu sürecin önemli bir bölümünü masaüstüne ya da CI sunucusuna taşımanıza imkân tanır.

Yazılım, donanım gelmeden hazır olabilir; testler her commit'te otomatik koşabilir; "şu hatayı tekrarlat" denildiğinde simülasyon snapshot'ı paylaşmak yeterli olabilir. Üstelik bunların tümü, lisans ücreti olmadan.

Renode'un Zynq7000'i ile başlamak için yapmanız gereken yalnızca `renode` komutunu çalıştırmak ve `start @scripts/single-node/zedboard.resc` yazmak. Geri kalanı zaten gömülü mühendisin bildiği iş.

---

**Kaynaklar:**

- [Renode resmi sitesi](https://renode.io)
- [Renode GitHub deposu](https://github.com/renode/renode)
- [Renode dokümantasyonu](https://renode.readthedocs.io)
- [Antmicro — Verilator ile Renode co-simülasyon](https://antmicro.com/blog/2020/06/co-simulating-rtl-with-renode/)
- [AMD/Xilinx Zynq7000 SoC ailesi](https://www.amd.com/en/products/adaptive-socs-and-fpgas/soc/zynq-7000.html)
- [Renode Robot Framework rehberi](https://renode.readthedocs.io/en/latest/introduction/testing.html)

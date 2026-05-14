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

## UART'ı TCP'ye Bağlamak

Renode'un en pratik özelliklerinden biri, sanal UART'ları **TCP soketleri** olarak dışa açabilmesidir. Bu sayede headless ortamlarda (CI sunucuları, Docker container'lar, uzak makinalar) simülasyonu çalıştırıp `telnet`, `netcat` ya da kendi test betiğinizle bağlanabilirsiniz.

Renode tarafında iki komut yeter:

```
emulation CreateServerSocketTerminal 3456 "uart_term"
connector Connect sysbus.uart1 uart_term
start
```

İlk komut 3456 portunda bir TCP sunucusu açar, ikincisi sanal UART'ı bu sokete bağlar. Artık başka bir terminalden bağlanabilirsiniz:

```bash
$ telnet localhost 3456
Trying 127.0.0.1...
Connected to localhost.
Boot tamamlandi
Sensor degeri: 42
> help
Komutlar: status, reset, dump
```

Klavyeden yazdığınız her karakter firmware'in UART RX FIFO'suna düşer; firmware'in TX FIFO'suna yazdığı her karakter terminale akar. Tıpkı gerçek bir kart gibi.

Bu, **otomatik testleri Python ile yazmanın** en temiz yoludur. Pexpect ya da düz `socket`:

```python
import socket

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("localhost", 3456))

# Boot tamamlanmasini bekle
buf = b""
while b"Boot tamamlandi" not in buf:
    buf += s.recv(4096)

# Komut gonder, cevabi yakala
s.sendall(b"sensor read\n")
buf = b""
while b"\n" not in buf:
    buf += s.recv(4096)

print("Firmware cevabi:", buf.decode().strip())
s.close()
```

Birden fazla UART'a aynı anda farklı portlarda hizmet verebilirsiniz — örneğin debug UART'ı 3456, telemetri UART'ı 3457. Aynı simülasyonda iki ayrı Python istemcisi farklı port'lara bağlanır.

Ek olarak UART'ı dosyaya yazdırmak da mümkündür:

```
sysbus.uart1 CreateFileBackend @uart.log true
```

CI'da test başarısız olduğunda bu log dosyası paha biçilmezdir.

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

## Hata Ayıklama: GDB ile Bağlanmak

Renode, her sanal CPU için **GDB Remote Serial Protocol** sunucusu açabilir. Bu, fiziksel JTAG bağlantısının yerine geçer; üstelik çok daha hızlı ve dert üretmez. Kablosu kopmaz, hedef "wedge" olmaz, sürücü çakışmaz.

Renode tarafında:

```
machine StartGdbServer 3333
```

Başka terminalde:

```bash
arm-none-eabi-gdb firmware.elf
(gdb) target remote :3333
(gdb) b main
Breakpoint 1 at 0x100040
(gdb) c
Continuing.
Breakpoint 1, main () at main.c:42

(gdb) info registers
r0   0x00000000
r1   0xe0001000
...
(gdb) x/16wx 0xE0001000   # UART register'larini incele
```

Tüm standart GDB özellikleri çalışır:

- **Breakpoint, watchpoint, conditional break:** Hardware watchpoint sayısı simülasyonda sınırsızdır
- **Stack trace, frame inspection:** Tam debug bilgisi varsa kaynak satırına kadar
- **Memory read/write:** Aktif simülasyonda istediğiniz adresi okuyup yazabilirsiniz
- **Source-level stepping:** `step`, `next`, `finish`

Bir watchpoint örneği — GPIO data register'ı her değiştiğinde dur:

```
(gdb) watch *(uint32_t*)0xE000A040
Hardware watchpoint 1: *(unsigned int*)0xE000A040
(gdb) c
Hardware watchpoint 1: *(unsigned int*)0xE000A040
Old value = 0
New value = 1
```

**Time-travel hata ayıklama:** Renode deterministik olduğu için, hatadan önce snapshot alıp koşumu tamamlayabilir, sonra snapshot'ı yeniden yükleyip farklı bir yol deneyebilirsiniz. Heisenbug avına alışkın olanlar için bu çok değerli bir kapasitedir.

VS Code, CLion, Eclipse'in GDB entegrasyonu doğrudan çalışır. Tipik bir `launch.json`:

```json
{
    "type": "cppdbg",
    "request": "launch",
    "program": "${workspaceFolder}/build/firmware.elf",
    "miDebuggerServerAddress": "localhost:3333",
    "miDebuggerPath": "/usr/bin/arm-none-eabi-gdb"
}
```

Tek değişiklik — gerçek board için kullanılan OpenOCD adresinin yerine Renode portu. Kalan tüm IDE deneyimi aynı.

---

## Hook'lar: Renode'un Süper Gücü

Hook'lar, simülasyon sırasında belirli olaylara **Python callback** bağlamanın yoludur. Renode'u QEMU'dan ya da basit bir emülatörden ayıran en güçlü özellik bu olabilir. Hook ile, gerçek donanımda asla erişemeyeceğiniz iç durumlara müdahale edebilirsiniz.

### Adres tabanlı (watchpoint) hook

Belirli bir adrese yapılan her yazmayı yakala:

```
sysbus AddWatchpoint 0xE000A040 4 1 "print('GPIO yazildi: ' + hex(value))"
```

Parametreler: adres, byte boyutu, write modu (1=write, 2=read), Python ifadesi. Firmware bu register'a her yazdığında ekrana satır basılır. Bu yöntemle protokol traces çıkarmak, donanımda yapılması son derece zor olan bir iş.

### Fonksiyon başı hook

Bir sembole varıldığında çalışacak callback:

```
cpu0 AddHook `sysbus GetSymbolAddress "panic"` "print('PANIC! PC=' + hex(pc))"
```

`panic` fonksiyonu çağrıldığında log basılır — ya da `machine Pause` ile simülasyonu durdurursunuz. Hata yakalama için ideal.

### Fault injection hook

Diyelim SPI flash okuma fonksiyonunun **17. çağrısında** hata enjekte etmek istiyorsunuz. Fiziksel donanımda bu çok zordur; Renode'da Python ile birkaç satır:

```python
# fault_inject.py
call_count = 0

def on_spi_read_entry(cpu):
    global call_count
    call_count += 1
    if call_count == 17:
        # R0 (donus degeri) = 0xFFFFFFFF (hata)
        cpu.SetRegisterUnsafe(0, 0xFFFFFFFF)
        # Fonksiyonu erken sonlandir
        cpu.PC = cpu.GetRegisterUnsafe(14).RawValue  # LR
```

Bu betiği Renode'a yükleyip `spi_read` sembolüne bağlayın. Test, retry mantığını gerçekçi koşullar altında doğrular.

### Coverage toplama

```
cpu0 EnableProfilerCollapsedStack "@coverage.txt" 0
```

Her instruction'ı yakalar, hangi fonksiyonların ne kadar çalıştığını üretir. Çıktıyı `inferno-flamegraph` ile besleyerek bir gecede tam **flame graph** üretebilirsiniz. Donanımda coverage almak `gcov` ile bile bu kadar temiz değildir.

### IRQ hook

Bir kesme tetiklendiğinde:

```
sysbus.gic AddInterruptHook 52 "print('UART IRQ tetiklendi')"
```

IRQ akışını anlamak için altın değerinde. Çoklu kesme yarış koşullarını anlamada da yardımcı.

**Önemli:** Hook'ları her zaman test sonrası temizleyin (`cpu0 RemoveAllHooks` ya da spesifik `RemoveHook`). Aksi takdirde sonraki testlere taşınır ve flakiness oluşturur.

Hook'lar, Renode'u sıradan bir emülatörden, **gözlemlenebilir ve müdahale edilebilir** bir sisteme dönüştürür.

---

## Diğer İleri Düzey Özellikler

Renode'un günlük kullanımda ezberlenmesi gereken birkaç başka özelliği:

### Logger seviyeleri ve filtreleri

```
sysbus.uart1 LogLevel 0    # NOISY - her byte'i logla
sysbus.gpio  LogLevel 3    # WARNING ve uzeri
logFile @sim.log true
```

Her çevre birimi bağımsız log seviyesi alır. Sorunlu modülü debug log'una yükseltip diğerlerini sessizleştirebilirsiniz; CI loglarınız böylece manageable kalır.

### Snapshot / Restore

```
Save @before-test.snapshot
# ... test calistir, sistemde degisiklik yap
Load @before-test.snapshot
# ... tertemiz bastan basla
```

Tipik kullanım: Linux boot edildikten sonra snapshot al, her test snapshot'tan başlasın. 30 saniyelik boot, 50 ms restore'a düşer. Bu, CI suite süresini dramatik şekilde kısaltır.

### Multi-machine simülasyonu

```
mach create "node1"
machine LoadPlatformDescription @platforms/boards/zedboard.repl
mach create "node2"
machine LoadPlatformDescription @platforms/boards/zedboard.repl

emulation CreateSwitch "switch1"
connector Connect node1.eth0 switch1
connector Connect node2.eth0 switch1
```

İki Zynq7000 kartı arasında Ethernet trafiği simüle edilir. Distributed sistem firmware'i, master/slave protokoller, redundancy senaryoları için olmazsa olmaz.

### Time control

```
emulation SetGlobalQuantum '0.000010'   # 10 us quantum
machine Pause
machine Resume
```

Simülasyonu duraklat, yavaşlat, hızlandır. Real-time zorunluluğu olmayan testler simülasyonu **gerçek zamandan kat kat hızlı** koşturarak saatlerce sürecek bir testi dakikalara indirebilir.

### Wireless ve PCAP

Renode'un IEEE 802.15.4 (Zigbee), BLE ve LoRa için sanal "radio medium" desteği vardır. Birden fazla cihaz aynı medyumda paket alıp gönderir, Wireshark uyumlu PCAP dosyası kaydedilir. Mesh ağ firmware'i geliştirenler için biçilmiş kaftan.

### Sembol bazlı `cpu0 LogFunctionNames`

```
cpu0 LogFunctionNames true
```

Her fonksiyon çağrısını log'a yazar. Boot sırasında ne çağrıldığını görmek, çağrı grafiğini anlamak için çok hızlı bir araç.

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

## Geliştirme, Debug ve Test için Avantajlar

Renode ile Zynq7000 simülasyonunun fiziksel kartla yüksek seviyeli karşılaştırması:

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

Bu tablo özet sunuyor; üç ayrı disiplin için somut faydalara bakalım.

### Geliştirme tarafında

- **Donanım gelmeden başla.** Yeni bir Zynq7000 kartı tasarlandığı sırada yazılım ekibi simülasyon üzerinde sürücüleri yazmaya başlayabilir. PCB üretimi 6 hafta sürüyorsa, o 6 hafta atılmış değildir.
- **Hızlı iterasyon.** Bitstream sentezi 30 dakikaysa, Renode platform değişikliği 2 saniyedir. Yazılım geliştiriciler, donanım ekibinin bir sonraki sentezini beklemek zorunda kalmaz.
- **Yeni katılan eşiği düşer.** Yeni gelen mühendise kart, JTAG, USB-UART, lab erişimi ayarlamak yerine `git clone && renode boot.resc` yeterli olur.
- **Aynı kod, hem simülasyon hem gerçek donanım.** Renode adresleri ve davranışı fiziksel SoC ile birebir eşleşir; sürücü kodu portlama olmadan iki tarafta çalışır.

### Debug tarafında

- **Determinizm.** Aynı bug aynı şekilde tekrar üretilir; "bende çalışıyor" durumu yoktur. Reproducer'lar snapshot ya da `.resc` betiği olarak paylaşılır.
- **Time-travel.** Bug'dan önce snapshot alın, koşumu tamamlayın, sonra snapshot'ı yükleyip farklı bir yolda deneyin. Heisenbug'ları çözmek için fiziksel donanımda imkansıza yakın bir kapasite.
- **Görünürlük.** Hook'lar ve logger sayesinde gerçek donanımda görünmez olan iç durumlar (register snapshot'ı, IRQ akışı, AXI handshake) izlenebilir hale gelir.
- **GDB her zaman bağlı.** JTAG kopmaz, hedef wedge olmaz. İstediğiniz anda dur, durumu incele, devam et.
- **Coverage temiz toplanır.** Renode tarafından üretilen instruction trace, tamamen offline işlenebilir; gerçek donanımda bunu yapmak için ek donanım veya kod enstrümantasyonu gerekir.

### Test tarafında

- **CI/CD entegrasyonu.** Robot Framework + headless Renode + Docker = her commit'te full sistem testi. Kart farm operasyonel maliyeti yoktur.
- **Paralel koşum.** Tek makinede 16 simülasyon paralel; tek board farmında 16 fiziksel kart gerekirdi.
- **Fault injection.** "Şu IRQ kaybolsa ne olur? DMA timeout olursa? Sensör NaN dönerse?" Hepsi tek hook satırı ile test edilebilir; fiziksel donanımda haftalar süren senaryolar.
- **Regresyon süresi.** Snapshot'lar ile bir geceyi 100x test koşumuna çevirebilirsiniz; günlük geri bildirim döngüsü çok daha sıkıdır.
- **Veri odaklı test.** Sensör girdilerini dosyadan besleyen Python peripheral'lar, aynı testi yüzlerce farklı veri setiyle koşturmayı mümkün kılar.

---

## Kullanım Alanları

Renode + Zynq7000 ikilisinin somut kullanım alanları:

**1. Bootloader geliştirme.** U-Boot, FSBL, SPL ve özel bootloader'lar Renode'da boot edilir. SD kart imajı yüklenir, JTAG ya da USB-UART kurmaya gerek kalmaz. Her commit'te boot tamamlanma süresi otomatik ölçülür ve regresyon olarak işaretlenebilir.

**2. Linux kernel hata ayıklama.** Custom kernel patch'leri Renode üzerinde test edilir. `kgdb` çalıştırmak fiziksel kartta yorucudur; Renode'un yerleşik GDB sunucusu doğrudan çekirdek sembollerine bağlanır.

**3. Avionik ve fonksiyonel güvenlik.** DO-178C, IEC 61508, EN 50128 gibi standartlar yüksek test kapsamı ve **kanıtlanabilir tekrarlanabilirlik** gerektirir. Renode'un deterministik yapısı bu beklentiyi doğal olarak karşılar; testi `.resc` betiği olarak sertifikasyon dosyasına eklemek mümkündür.

**4. Drone, robot ve otonom sistemler.** Sensör verisini dosyadan besleyen mock peripheral'lar ile simüle edilen GPS, IMU, lidar girdileriyle uçuş kontrol algoritmaları test edilir. Saha uçuşu yapmadan algoritma doğrulanır.

**5. Eğitim laboratuvarları.** Üniversite ya da kurum içi eğitimlerde, her öğrenci için kart sağlamak yerine herkesin laptop'ında Renode çalışır. Yanlış kod yazılsa bile kart yanmaz.

**6. Güvenlik araştırması.** Firmware fuzzing'i hızlandırır; AFL veya libFuzzer ile birlikte koşturulur. Side-channel analizi için instruction trace çıkarılabilir. CVE PoC'leri snapshot olarak paylaşılır, reproducer net olur.

**7. Firmware OTA güncelleme testleri.** OTA başarısız olursa fiziksel kart bricklenir; Renode'da bricklendiyse `Reset` komutu yeterli. Riskli bootloader değişikliklerini Renode'da yüzlerce kez test edip karta sadece kararlı versiyonu atabilirsiniz.

**8. Müşteri demo'ları ve eğitim.** Sahaya kart götürmeden firmware'in çalıştığını gösterebilirsiniz. Müşteriye veya entegrasyon ortağına Docker imajı bırakırsanız, kart olmadan da değerlendirebilir.

**9. Hızlı PoC ve teklif aşaması.** Müşteri "şu çevre birimi destekleniyor mu?" diye sorduğunda, fiziksel kart sipariş etmeden Renode'da basit bir prototip yapıp gösterebilirsiniz.

---

## Best Practices

Renode'u proje sürecine sokarken biriken pratik dersler:

**1. `.resc` ve `.repl` dosyalarını versiyon kontrolünde tutun.** Bunlar projeye ait konfigürasyondur; firmware kaynak kodu kadar değerlidir. Repo'da `sim/` klasörü açın, scriptleri orada yaşatın, code review'a tabi tutun.

**2. Renode versiyonunu pinleyin.** `renode --version` çıktısını CI loglarına yazdırın; Dockerfile'da spesifik tag (örn. `antmicro/renode:1.14.0`) kullanın. Determinizm bunu gerektirir; aynı testin aynı sonucu üretmesi versiyon sabitliğiyle başlar.

**3. Snapshot stratejisi kurun.** Uzun boot'ları her test başında tekrarlamak israftır. "Linux boot tamamlandıktan sonra", "Init script çalıştıktan sonra" gibi tipik anlarda snapshot alın, test suite'leri bu noktadan başlatın. Tek bir karmaşık projede toplam CI süresini saatlerden dakikalara çekebilir.

**4. Logger seviyesini ortama göre ayarlayın.** CI'da `LogLevel 3` (Warning); lokal debug'da `LogLevel 0` (Noisy). Aksi takdirde CI logu fazlasıyla şişer, gerçek sorunlar gürültü altında kaybolur.

**5. Hook'ları test sonrası temizleyin.** `Suite Teardown` veya `Test Teardown`'da `cpu0 RemoveAllHooks` ile sıfırlayın. Hook leak'i, en sinsi flakiness kaynağıdır.

**6. Custom peripheral'lar küçük olsun.** Bir Python peripheral 50 satırı geçiyorsa, ayrı bir `.py` dosyasına alın ve `pytest` ile unit test yazın. Test edilmemiş peripheral, ana firmware'in tüm hatalarını maskeleyebilir.

**7. Robot Framework testlerini paralel koşturun.** `pabot` ile paralel koşum mümkündür. Her test kendi machine instance'ında izole olsun; `Reset Emulation` Test Setup'ta zorunlu olsun.

**8. UART çıktısını dosyaya da yazdırın.** `sysbus.uart1 CreateFileBackend @uart.log true` ile UART akışını dosyaya kaydedin. CI'da test başarısız olduğunda bu log paha biçilmezdir.

**9. Headless modu kullanın.** GUI Renode debug için iyi; CI için `--disable-xwt --console` veya `--hide-monitor` ile başlatın. Hız kazanırsınız, ekran bağımlılığı kalmaz.

**10. Real-time bağımlılıkları dikkatli ele alın.** Renode `RealTimeMode`'da fiziksel zamana hizalanmaya çalışır ama saat doğruluğu çekirdek kullanımına bağlıdır. Sıkı timing testleri için `MachineQuantum` ve `GlobalQuantum` ile deterministik time-step kullanın; gerçek zamana güvenmeyin.

**11. Sensör akışlarını dosyadan besleyin.** Sensör simülasyonunu inline değil, JSON/CSV dosyasından okuyacak Python peripheral yazın. Aynı test senaryosu farklı veri setleriyle koşturulabilir — data-driven testing kapısı açılır.

**12. Mevcut platformları kopyalayıp özelleştirin.** `@platforms/boards/zedboard.repl`'i kopyalayıp `my_board.repl` yapın, `using` ile orijinali dahil edip üzerine **sadece farkları** yazın. Renode güncellemelerinde temel platform iyileşirken sizin patch'iniz korunur.

**13. Coverage'ı simülasyondan toplayın.** `cpu0 EnableProfilerCollapsedStack` ile çıkan log + `inferno-flamegraph` = bir gecede test kapsamı raporu. Manuel kart üzerinde coverage almak çok daha pahalıdır.

**14. PR'lara Renode test sonucu ekleyin.** GitHub Actions'ta `renode-test`'in çıktısını PR yorumuna yapıştıran bir adım kurun. Reviewer'lar testin yeşil olduğunu görerek inceler; "deneyip baktım" kültürünü destekler.

**15. Renode dokümantasyonunu sıkça açın.** Renode hızla gelişiyor; `renode.readthedocs.io` yeni özellikler için en güncel kaynaktır. Antmicro blog'u Verilator entegrasyonu, yeni platformlar ve case study'ler için kıymetlidir.

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

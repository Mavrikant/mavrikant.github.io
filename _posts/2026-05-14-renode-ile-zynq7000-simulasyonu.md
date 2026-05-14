---
title: "Renode ile Zynq7000 Simülasyonu"
subtitle: "Zynq7000 Simulation with Renode"
background: "/img/posts/5.webp"
date: '2026-05-14 09:00:00'
layout: post
lang: tr
mermaid: true
---

Gömülü sistem geliştirmenin en yorucu yanlarından biri donanımın kendisidir. FPGA bitstream'leri saatler süren sentez işlemleri gerektirir, geliştirme kartları ekipler arasında paylaşılır, JTAG bağlantıları kopar, sahada hata ayıklamak ise çoğu zaman pratik değildir. Sürekli entegrasyon (CI) altyapısına fiziksel kart bağlamak ayrı bir mühendislik problemidir.

İşte bu noktada **Renode** devreye giriyor. Bu yazıda, Xilinx (artık AMD) **Zynq7000** SoC ailesinin Renode üzerinde nasıl simüle edildiğine, donanım çevre birimleri ile FPGA tarafının nasıl modellendiğine ve bu yaklaşımın hangi avantajları getirdiğine bakacağız.

---

## Renode Nedir?

[Renode](https://renode.io), [Antmicro](https://antmicro.com/) tarafından geliştirilen ve **MIT** lisansı ile dağıtılan açık kaynak bir tam-SoC emülatörüdür. QEMU'nun aksine yalnızca CPU emülasyonuna odaklanmaz; çevre birimlerini, sensörleri, ağ arayüzlerini, kablosuz iletişim modüllerini ve hatta birden fazla cihazın aynı anda çalıştığı sistemleri tek bir simülasyon ortamında ele alır.

Renode'un öne çıkan özellikleri:

- **Geniş platform desteği:** 100'den fazla SoC ve geliştirme kartı (ARM Cortex-M/A, RISC-V, x86, PowerPC)
- **Python ile genişletilebilirlik:** Yeni bir çevre birimi, birkaç satırlık bir Python betiği ile eklenebilir
- **Deterministik yürütme:** Aynı senaryo her çalıştırıldığında tıpatıp aynı sonucu üretir
- **Robot Framework entegrasyonu:** Test otomasyonu doğrudan desteklenir
- **Yerleşik GDB sunucusu:** Hata ayıklama için ek araç gerekmez

Renode'un QEMU'dan en belirgin farkı, **sistem entegrasyon testlerine** odaklı tasarlanmış olmasıdır. UART çıktısını yakalamak, GPIO durumunu değiştirmek, sensörden değer "enjekte etmek" ya da ağ trafiğini iki sanal cihaz arasında köprülemek gibi işlemler Renode'da birinci sınıf vatandaş muamelesi görür.

---

## Zynq7000 Mimarisine Kısa Bir Bakış

Zynq7000, tek bir silikon üzerinde iki dünyayı birleştirir:

- **PS (Processing System):** Çift çekirdekli **ARM Cortex-A9** (1 GHz'e kadar, parça hızına göre), NEON SIMD birimi, donanımsal FPU, L1/L2 önbellek, DDR3 denetleyicisi ve sabit çevre birimleri (UART, SPI, I2C, GPIO, USB, Gigabit Ethernet, SD/MMC).
- **PL (Programmable Logic):** Artix-7 ya da Kintex-7 ailesinden bir **FPGA dokusu**; geliştiricinin kendi IP bloklarını, hızlandırıcılarını veya özel arayüzlerini sentezlediği alandır.
- **AXI Interconnect:** PS ile PL arasındaki yüksek bant genişlikli köprüdür. AXI3 / AXI4 protokolü üzerinden General-Purpose (GP), High-Performance (HP) ve Accelerator Coherency Port (ACP) bağlantılarını sunar.

PS tarafı, donanım üreticisi tarafından sabitlenmiş bir mikrodenetleyiciye benzer. PL tarafı ise tamamen sizin elinizdedir; bitstream ile yeniden programlayabilirsiniz. Renode'un bu iki dünyayı simüle ederken nasıl ele aldığı, yazının kalbini oluşturuyor.

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

Kaynaktan derlemek isteyenler `dotnet` SDK 8.0 ile depoyu çekip `build.sh` betiğini çalıştırabilir. macOS ve Windows için de hazır paketler mevcuttur.

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

Bu senaryoyu `renode boot.resc` ile çalıştırdığınızda yeni bir pencere açılır ve UART çıktısı orada akmaya başlar. `pause`, `step`, `start` komutlarıyla zamanı tamamen kontrol edebilirsiniz: simülasyonu istediğiniz anda dondurabilir, talimatları tek tek ilerletebilir veya gerçek zamandan kat kat hızlı çalıştırabilirsiniz.

---

## Platform Tanımı: .repl Dosyaları

Bir `.repl` dosyası, platformun adres haritasını, kesme bağlantılarını ve reset değerlerini tanımlar. ZedBoard platformunun küçük bir parçası:

```
gic: IRQControllers.ARM_GenericInterruptController @ {
        sysbus new Bus.BusMultiRegistration { address: 0xF8F01000; size: 0x1000; region: "distributor" };
        sysbus new Bus.BusMultiRegistration { address: 0xF8F00100; size: 0x100; region: "cpuInterface" }
    }
    [0-1] -> cpu0@[0-1]

uart1: UART.Cadence_UART @ sysbus 0xE0001000
    -> gic@50

gpio: GPIOPort.XilinxGPIOPS @ sysbus 0xE000A000
    IRQ -> gic@52

ttc0: Timers.Cadence_TTC @ sysbus 0xF8001000
    [0-2] -> gic@[10-12]
```

Burada `Cadence_UART`, `XilinxGPIOPS` gibi tip adları, Renode içinde hazır olarak gelen çevre birimi modellerine karşılık gelir. Adres alanı (`0xE0001000`), reset davranışı ve IRQ numarası, fiziksel Zynq7000 ile birebir eşleşir. Bu sayede aynı sürücü kodu, hem Renode'da hem de gerçek kartta değişiklik gerektirmeden çalışır.

İhtiyacınız olan bir çevre birimi platformda yoksa iki seçeneğiniz var: kendi `.repl` dosyanızı baştan yazmak, ya da mevcut olanı `using` ile dahil edip üzerine ekleme yapmak.

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

Eksik bir çevre birimi varsa, **Python ile birkaç satırda** basit bir model yazılabilir. Renode'un `PythonPeripheral` sınıfı, harici `.py` dosyalarını doğrudan çevre birimi olarak yükler. Önce platforma yeni cihazı ekleriz:

```
my_sensor: Python.PythonPeripheral @ sysbus 0x43C00000
    size: 0x100
    initable: true
    filename: "@scripts/my_sensor.py"
```

Sonra Python betiğini yazarız. Her bus erişiminde `request` nesnesi otomatik olarak sağlanır:

```python
# my_sensor.py
if request.IsInit:
    sensor_value = 0

elif request.IsRead:
    if request.Offset == 0x00:
        request.Value = sensor_value      # sicaklik degeri
    elif request.Offset == 0x04:
        request.Value = 0x0001            # durum bayragi: hazir

elif request.IsWrite:
    if request.Offset == 0x08:
        sensor_value = request.Value      # firmware kalibrasyon yazabilir
```

Hepsi bu kadar — sınıf, kalıtım ya da derleme adımı yok. Renode konsolundan simülasyon sırasında `sysbus.my_sensor WriteDoubleWord 0x08 42` yazarak sensör değerini değiştirebilirsiniz; firmware tam o anda farklı bir koda dallanır. Bu, **fault injection** testleri için son derece güçlü bir araçtır.

---

## UART'ı TCP'ye Bağlamak

Renode'un en pratik özelliklerinden biri, sanal UART'ları **TCP soketleri** olarak dışa açabilmesidir. Bu sayede ekransız ortamlarda (CI sunucuları, Docker konteynerleri, uzak makineler) simülasyonu çalıştırıp `telnet`, `netcat` ya da kendi test betiğinizle bağlanabilirsiniz.

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

Birden fazla UART'ı aynı anda farklı portlardan dışa açabilirsiniz — örneğin debug UART'ı 3456, telemetri UART'ı 3457 portundan. Aynı simülasyona iki ayrı Python istemcisi, iki ayrı porttan bağlanır.

Ek olarak UART'ı dosyaya yazdırmak da mümkündür:

```
sysbus.uart1 CreateFileBackend @uart.log true
```

CI'da test başarısız olduğunda bu log dosyası paha biçilmezdir.

---

## FPGA / PL Tarafı Nasıl Simüle Edilir?

Renode'un en sık sorulan sorularından biri: "Peki ya FPGA?" Renode kendi başına Verilog ya da VHDL kodunu yorumlamaz. PL tarafını ele almak için üç yaygın yaklaşım vardır:

### a) Mock / Stub Peripheral

FPGA'da yapılacak işin **davranışsal modelini** Python ile yazarsınız. AXI register haritası taklit edilir, içerideki algoritma host kodunda çalışır. RTL test edilmez ama yazılım entegrasyonu sorunsuz ilerler. Yukarıdaki `my_sensor.py` örneği aslında bu yaklaşımın tipik bir uygulamasıdır.

**Ne zaman uygun?** Henüz HDL kodu yazılmadan, sadece yazılım tarafının ilerlemesi gerektiğinde. PoC ve erken aşama firmware geliştirme için idealdir.

### b) Verilator Co-simülasyon

Renode, **Verilator** ile sıkı entegrasyona sahiptir. HDL kaynak dosyaları Verilator ile C++'a derlenir; ortaya çıkan paylaşılan kütüphane Renode'a bağlanır. Renode'un AXI işlemleri (read/write transaction'lar) bu köprü üzerinden Verilator'a iletilir, Verilator yanıtı geri döner. PL bloğunuz **gerçek RTL** ile test edilmiş olur.

Önce `.repl` dosyasında co-simüle edilecek peripheral'ı tanımlarız:

```
my_axi_ip: CoSimulated.CoSimulatedPeripheral @ sysbus <0x43C00000, +0x1000>
    frequency: 100000000
```

Sonra `.resc` betiğinde Verilator çıktısı paylaşımlı kütüphaneyi bağlarız:

```
sysbus.my_axi_ip SimulationFilePath @libVtop.so
```

Bundan sonra firmware'in `0x43C00000` adresine yaptığı her AXI okuma/yazma, Verilator simülasyonuna iletilir; RTL'in yanıtı geri döner.

**Ne zaman uygun?** PL bloğunuzun RTL doğrulamasını da sistem testine dahil etmek istediğinizde. Saf RTL simülasyonuna kıyasla yavaş kalsa da, yazılım sürücüleriyle birlikte uçtan uca test imkânı verir.

### c) AXI Bus Modeli + Soyut Peripheral

İkisinin arası bir yol: HDL yazmadan, AXI protokolünün doğru ritmini taklit eden bir **Python peripheral** yazarsınız. AXI handshake'i ve register davranışını modellersiniz; gerçek FPGA mantığı yerine kabul edilebilir bir yazılım modeli koyarsınız. Örneğin yazılan veriyi sayıp, hazır bayrağı tutan minimal bir AXI slave:

```python
# axi_fifo.py - Yazilanlari sayan basit AXI slave
if request.IsInit:
    write_count = 0
    last_data = 0

elif request.IsRead:
    if request.Offset == 0x00:
        request.Value = 0xDEADBEEF       # IP ID register
    elif request.Offset == 0x04:
        request.Value = write_count       # kac kez yazildi
    elif request.Offset == 0x08:
        request.Value = last_data         # son yazilan veri

elif request.IsWrite:
    if request.Offset == 0x08:
        last_data = request.Value
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

Renode, her sanal CPU için **GDB Remote Serial Protocol** sunucusu açabilir. Bu, fiziksel JTAG bağlantısının yerine geçer; üstelik çok daha hızlıdır ve sorun çıkarmaz. Kablosu kopmaz, hedef "wedge" olmaz, sürücü çakışması yaşanmaz.

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

**Time-travel hata ayıklama:** Renode deterministik olduğu için, hatadan önce snapshot alıp koşumu tamamlayabilir, sonra snapshot'ı yeniden yükleyip farklı bir yol deneyebilirsiniz. Heisenbug avına alışkın olanlar için bu çok değerli bir yetenektir.

### Reverse Debugging — Geri Adım Atmak

Renode'un belki de en az bilinen yeteneklerinden biri **GDB reverse execution** desteğidir. Yani simülasyonu sadece duraklatmakla kalmaz, **geriye doğru** da çalıştırabilirsiniz.

Açmak için, GDB bağlanmadan önce Renode tarafında tek satırlık bir ayar yeterlidir:

```
machine StartGdbServer 3333
reverseExecMode true
```

Sonra GDB'de standart "reverse" komutları çalışır:

```
(gdb) target remote :3333
(gdb) b main
(gdb) c
Breakpoint 1, main () at main.c:42

(gdb) n                # 5 satir ileri git
(gdb) n
(gdb) n
(gdb) n
(gdb) n

(gdb) reverse-step     # bir satir geri (rs kisaltmasi)
(gdb) reverse-stepi    # bir assembly instruction geri (rsi)
(gdb) reverse-continue # son breakpoint'e ya da ilk snapshot'a kadar geri
(gdb) rsi 50           # 50 instruction geri
```

Mekanizma snapshot tabanlıdır: Renode arka planda periyodik state snapshot'ları alır; reverse komutları, en yakın snapshot'a dönüp oradan tekrar ileri koşturarak istenen noktaya ulaşır. Bu yüzden:

- Reverse hız olarak forward'dan yavaş çalışır
- Snapshot sıklığı performans/granülerlik dengesini belirler
- **Tek çekirdek (single-core) emülasyonlarda** desteklenir; çift Cortex-A9'lu Zynq7000'de bu özelliği kullanmak isterseniz SMP yerine yalnızca tek CPU başlatan bir senaryo kurmanız gerekir

**Pratik değer:** Diyelim ki zor yeniden üretilen bir hata yakaladınız. Kritik anı geçtikten sonra, bir register'ın yanlış değer aldığını fark ettiniz. Forward debugging'de tüm koşumu sıfırdan başlatıp doğru noktada durmaya çalışırsınız. Reverse ile bulunduğunuz noktadan **geriye doğru** giderek ilk yanlış adımı bulursunuz — çoğu zaman dakikalar yerine saniyeler içinde.

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

Tek değişiklik şudur: gerçek board için kullanılan OpenOCD adresinin yerine Renode portu yazılır. Geri kalan tüm IDE deneyimi aynıdır.

---

## Hook'lar: Renode'un Süper Gücü

Hook'lar, simülasyon sırasında belirli olaylara **Python callback** bağlamanın yoludur. Renode'u QEMU'dan ya da basit bir emülatörden ayıran en güçlü özellik budur. Hook'lar sayesinde, gerçek donanımda asla erişemeyeceğiniz iç durumlara müdahale edebilirsiniz.

### Adres tabanlı (watchpoint) hook

Belirli bir adrese yapılan her yazmayı yakalayalım:

```
sysbus AddWatchpointHook 0xE000A040 DoubleWord Write "print('GPIO yazildi: ' + hex(value))"
```

Parametreler: adres, genişlik (`Byte` / `Word` / `DoubleWord` / `QuadWord` ya da numerik `1`/`2`/`4`/`8`), erişim modu (`Read` / `Write` / `ReadWrite`), Python ifadesi. Firmware bu register'a her yazdığında ekrana satır basılır. Bu yöntemle protokol trace'i çıkarmak, fiziksel donanımda son derece zordur.

### Fonksiyon başı hook

Bir sembole varıldığında çalışacak callback'i kurmak için `AddSymbolHook` kullanılır; komut sembolün adresini otomatik olarak çözer:

```
cpu0 AddSymbolHook "panic" "print('PANIC! PC=' + hex(pc))"
```

`panic` fonksiyonu çağrıldığında log basılır — ya da `machine Pause` ile simülasyonu durdurursunuz. Hata yakalama için idealdir.

### Fault injection hook

Diyelim ki SPI flash okuma fonksiyonunun **17. çağrısında** hata enjekte etmek istiyorsunuz. Fiziksel donanımda bunu yapmak çok zordur; Renode'da Python ile birkaç satır yeterlidir:

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
cpu0 EnableProfilerCollapsedStack @coverage.txt false
```

Her instruction'ı yakalar; hangi fonksiyonların ne kadar çalıştığını ortaya çıkarır. Çıktıyı `inferno-flamegraph` ile besleyerek bir gecede eksiksiz bir **flame graph** üretebilirsiniz. Donanımda coverage toplamak `gcov` ile dahi bu kadar temiz olmaz.

### IRQ hook

Bir kesme tetiklendiğinde, CPU üzerinden hook bağlanır:

```
cpu0 AddHookAtInterruptBegin "print('IRQ basladi')"
cpu0 AddHookAtInterruptEnd   "print('IRQ bitti')"
```

IRQ akışını anlamak için altın değerindedir. Çoklu kesme yarış koşullarını çözmekte de yardımcı olur.

**Önemli:** Hook'lar simülasyon ömrü boyunca aktif kalır. Test izolasyonu için her test başlangıcında `Reset Emulation` ile makine durumunu tertemiz başlatın; aksi takdirde hook'lar sonraki testlere taşınır ve flakiness kaynağı olur.

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

Her çevre birimi bağımsız log seviyesi alır. Sorunlu modülü debug log'una yükseltip diğerlerini sessizleştirebilirsiniz; CI loglarınız böylece yönetilebilir kalır.

### Snapshot / Restore

```
Save @before-test.snapshot
# ... test calistir, sistemde degisiklik yap
Load @before-test.snapshot
# ... tertemiz bastan basla
```

Tipik kullanım: Linux boot edildikten sonra snapshot alın, her test bu snapshot'tan başlasın. 30 saniyelik boot, 50 ms'lik restore'a düşer. Bu yaklaşım CI suite süresini dramatik şekilde kısaltır.

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

İki Zynq7000 kartı arasında Ethernet trafiği simüle edilir. Dağıtık sistem firmware'i, master/slave protokoller ve redundans senaryoları için olmazsa olmazdır.

### Time control

```
emulation SetGlobalQuantum '0.000010'   # 10 us quantum
machine Pause
machine Resume
```

Simülasyonu duraklatabilir, yavaşlatabilir veya hızlandırabilirsiniz. Gerçek zaman zorunluluğu olmayan testler, simülasyonu **gerçek zamandan kat kat hızlı** koşturarak saatlerce sürecek bir testi dakikalara indirebilir.

### Wireless ve PCAP

Renode'un IEEE 802.15.4 (Zigbee) ve Bluetooth Low Energy için sanal "radio medium" desteği vardır. Birden fazla cihaz aynı medyumda paket alıp gönderir, Wireshark uyumlu PCAP dosyası kaydedilir (Ethernet, 802.15.4 ve BLE için). Mesh ağ firmware'i geliştirenler için biçilmiş kaftan.

### Sembol bazlı `cpu0 LogFunctionNames`

```
cpu0 LogFunctionNames true
```

Her fonksiyon çağrısını log'a yazar. Boot sırasında nelerin çağrıldığını görmek ve çağrı grafiğini anlamak için son derece hızlı bir araçtır.

---

## Test Otomasyonu

Renode, kutudan çıktığı haliyle **Robot Framework** desteği sunar. Bu özellik, simülasyonun CI/CD ortamlarına entegrasyonunu çok kolaylaştırır. Tipik bir test dosyası şuna benzer:

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

Çalıştırma komutu: `renode-test test.robot`. CI ortamında bu komut, fiziksel kart gerektirmeden bütün regresyon testlerini koşturur. Uzun boot sürelerini atlamak için **snapshot / restore** mekanizmasını kullanabilirsiniz: simülasyonu bir kez boot edip durumu snapshot olarak kaydedersiniz, sonraki testler o noktadan başlar.

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

- **Donanım gelmeden başlanır.** Yeni bir Zynq7000 kartı tasarlandığı sırada yazılım ekibi simülasyon üzerinde sürücüleri yazmaya başlayabilir. PCB üretimi 6 hafta sürüyorsa, o 6 hafta boşa gitmez.
- **Hızlı iterasyon.** Bitstream sentezi 30 dakika sürüyorsa, Renode'da platform değişikliği 2 saniye sürer. Yazılım geliştiricilerin donanım ekibinin bir sonraki sentezini beklemesine gerek kalmaz.
- **Yeni katılım eşiği düşer.** Yeni gelen mühendise kart, JTAG, USB-UART ve lab erişimi ayarlamak yerine `git clone && renode boot.resc` yeterli olur.
- **Aynı kod hem simülasyonda hem gerçek donanımda çalışır.** Renode'un adresleri ve davranışı fiziksel SoC ile birebir eşleşir; sürücü kodu port etmeden iki tarafta da koşar.

### Debug tarafında

- **Determinizm.** Aynı bug aynı şekilde tekrar üretilir; "bende çalışıyor" durumu yoktur. Reproducer'lar snapshot ya da `.resc` betiği olarak paylaşılır.
- **Time-travel.** Bug'dan önce snapshot alın, koşumu tamamlayın, sonra snapshot'ı yükleyip farklı bir yolda deneyin. Heisenbug'ları çözmek için fiziksel donanımda imkansıza yakın bir yetenektir.
- **Görünürlük.** Hook'lar ve logger sayesinde gerçek donanımda görünmez olan iç durumlar (register snapshot'ı, IRQ akışı, AXI handshake) izlenebilir hale gelir.
- **GDB her zaman bağlı.** JTAG kopmaz, hedef wedge olmaz. İstediğiniz anda durdurursunuz, durumu incelersiniz, devam ettirirsiniz.
- **Coverage temiz toplanır.** Renode tarafından üretilen instruction trace tamamen offline işlenebilir; gerçek donanımda bunu yapmak için ek donanım ya da kod enstrümantasyonu gerekir.

### Test tarafında

- **CI/CD entegrasyonu.** Robot Framework + ekransız Renode + Docker = her commit'te tam sistem testi. Kart farmının operasyonel maliyeti yoktur.
- **Paralel koşum.** Tek bir makinede 16 simülasyon paralel çalışır; aynısını fiziksel kart farmında yapmak 16 ayrı kart gerektirir.
- **Fault injection.** "Şu IRQ kaybolsa ne olur? DMA timeout olursa? Sensör NaN dönerse?" Hepsi tek hook satırı ile test edilebilir; fiziksel donanımda kurulması haftalar sürecek senaryolar dakikalara iner.
- **Regresyon süresi.** Snapshot'lar sayesinde bir gecede onlarca kat fazla test koşturulur; günlük geri bildirim döngüsü çok daha sıkı hale gelir.
- **Veri odaklı test.** Sensör girdilerini dosyadan besleyen Python peripheral'lar, aynı testi yüzlerce farklı veri kümesiyle koşturmayı mümkün kılar.

---

## Kullanım Alanları

Renode + Zynq7000 ikilisinin somut kullanım alanları:

**1. Bootloader geliştirme.** U-Boot, FSBL, SPL ve özel bootloader'lar Renode'da boot edilir. SD kart imajı yüklenir, JTAG ya da USB-UART kurmaya gerek kalmaz. Her commit'te boot tamamlanma süresi otomatik ölçülür ve regresyon olarak işaretlenebilir.

**2. Linux kernel hata ayıklama.** Custom kernel patch'leri Renode üzerinde test edilir. `kgdb` çalıştırmak fiziksel kartta yorucudur; Renode'un yerleşik GDB sunucusu doğrudan çekirdek sembollerine bağlanır.

**3. Avionik ve fonksiyonel güvenlik.** DO-178C, IEC 61508, EN 50128 gibi standartlar yüksek test kapsamı ve **kanıtlanabilir tekrarlanabilirlik** gerektirir. Renode'un deterministik yapısı bu beklentiyi doğal olarak karşılar; testi `.resc` betiği olarak sertifikasyon dosyasına eklemek mümkündür.

**4. Drone, robot ve otonom sistemler.** Mock peripheral'lar üzerinden GPS, IMU ve lidar girdileri dosyadan simüle edilerek uçuş kontrol algoritmaları test edilir. Saha uçuşu yapmadan algoritma doğrulanmış olur.

**5. Eğitim laboratuvarları.** Üniversite ya da kurum içi eğitimlerde, her öğrenci için kart sağlamak yerine herkesin laptop'ında Renode çalışır. Yanlış kod yazılsa bile kart yanmaz.

**6. Güvenlik araştırması.** Firmware fuzzing'i hızlandırır; AFL veya libFuzzer ile birlikte koşturulur. Side-channel analizi için instruction trace çıkarılabilir. CVE PoC'leri snapshot olarak paylaşılır, reproducer net olur.

**7. Firmware OTA güncelleme testleri.** OTA başarısız olursa fiziksel kart bricklenir; Renode'da bricklendiyse `Reset` komutu yeterlidir. Riskli bootloader değişikliklerini Renode'da yüzlerce kez test edip karta yalnızca kararlı sürümü atabilirsiniz.

**8. Müşteri demo'ları ve eğitim.** Sahaya kart götürmeden firmware'in çalıştığını gösterebilirsiniz. Müşteriye veya entegrasyon ortağına Docker imajı bırakırsanız, kart olmadan da deneyebilirler.

**9. Hızlı PoC ve teklif aşaması.** Müşteri "şu çevre birimi destekleniyor mu?" diye sorduğunda, fiziksel kart sipariş etmeden Renode'da basit bir prototip yapıp gösterebilirsiniz.

---

## Best Practices

Renode'u proje sürecine sokarken biriken pratik dersler:

**1. `.resc` ve `.repl` dosyalarını versiyon kontrolünde tutun.** Bunlar projeye ait konfigürasyondur; firmware kaynak kodu kadar değerlidir. Repo'da `sim/` klasörü açıp betikleri orada tutun ve kod incelemesine tabi kılın.

**2. Renode versiyonunu pinleyin.** `renode --version` çıktısını CI loglarına yazdırın; Dockerfile'da spesifik tag (örn. `antmicro/renode:1.14.0`) kullanın. Determinizm bunu gerektirir; aynı testin aynı sonucu üretmesi versiyon sabitliğiyle başlar.

**3. Snapshot stratejisi kurun.** Uzun boot'ları her test başında tekrarlamak israftır. "Linux boot tamamlandıktan sonra" ya da "init betiği çalıştıktan sonra" gibi tipik anlarda snapshot alıp test suite'lerini bu noktadan başlatın. Bu yaklaşım, karmaşık bir projede toplam CI süresini saatlerden dakikalara çekebilir.

**4. Logger seviyesini ortama göre ayarlayın.** CI'da `LogLevel 3` (Warning); lokal debug'da `LogLevel 0` (Noisy). Aksi takdirde CI logu fazlasıyla şişer, gerçek sorunlar gürültü altında kaybolur.

**5. Test başlangıçlarını izole edin.** Her test başında `Reset Emulation` çağırın; bu, kalan hook'lar dahil makine durumunu tertemiz sıfırlar. Hook sızıntısı, en sinsi flakiness kaynağıdır.

**6. Custom peripheral'lar küçük olsun.** Bir Python peripheral 50 satırı geçiyorsa ayrı bir `.py` dosyasına alın ve `pytest` ile birim testini yazın. Test edilmemiş bir peripheral, ana firmware'in hatalarını maskeleyebilir.

**7. Robot Framework testlerini paralel koşturun.** `pabot` ile paralel koşum mümkündür. Her test kendi makine örneğinde izole olsun; `Reset Emulation`, `Test Setup` adımında zorunlu olsun.

**8. UART çıktısını dosyaya da yazdırın.** `sysbus.uart1 CreateFileBackend @uart.log true` ile UART akışını dosyaya kaydedin. CI'da test başarısız olduğunda bu log paha biçilmezdir.

**9. Ekransız modu kullanın.** Renode GUI yerel hata ayıklama için iyidir; CI için ise `--disable-xwt --console` veya `--hide-monitor` bayraklarıyla başlatın. Hem hız kazanırsınız hem de ekran bağımlılığı kalmaz.

**10. Real-time bağımlılıkları dikkatli ele alın.** Renode `RealTimeMode`'da fiziksel zamana hizalanmaya çalışır ama saat doğruluğu çekirdek kullanımına bağlıdır. Sıkı timing testleri için `emulation SetGlobalQuantum` ile deterministik time-step kullanın; gerçek zamana güvenmeyin.

**11. Sensör akışlarını dosyadan besleyin.** Sensör simülasyonunu kod içine gömmek yerine, JSON / CSV dosyasından okuyacak şekilde yazın. Aynı test senaryosu farklı veri kümeleriyle koşturulabilir — veri odaklı test (data-driven testing) kapısı böylece açılır.

**12. Mevcut platformları kopyalayıp özelleştirin.** `@platforms/boards/zedboard.repl`'i kopyalayıp `my_board.repl` yapın, `using` ile orijinali dahil edip üzerine **sadece farkları** yazın. Renode güncellemelerinde temel platform iyileşirken sizin patch'iniz korunur.

**13. Coverage'ı simülasyondan toplayın.** `cpu0 EnableProfilerCollapsedStack` ile çıkan log + `inferno-flamegraph` = bir gecede test kapsamı raporu. Manuel kart üzerinde coverage almak çok daha pahalıdır.

**14. PR'lara Renode test sonucu ekleyin.** GitHub Actions'ta `renode-test` çıktısını PR yorumuna yapıştıran bir adım kurun. İnceleyiciler testin yeşil olduğunu görerek incelemeye başlar; bu, "deneyip baktım" kültürünü destekler.

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

Yazılım, donanım gelmeden hazır olabilir; testler her commit'te otomatik koşabilir; "şu hatayı tekrarlat" denildiğinde simülasyon snapshot'ı paylaşmak yeterli olabilir. Üstelik bunların tümü için herhangi bir lisans ücreti ödemezsiniz.

Renode'un Zynq7000'i ile başlamak için yapmanız gereken yalnızca `renode` komutunu çalıştırıp `start @scripts/single-node/zedboard.resc` yazmaktır. Gerisi, zaten gömülü mühendisin bildiği iştir.

---

**Kaynaklar:**

- [Renode resmi sitesi](https://renode.io)
- [Renode GitHub deposu](https://github.com/renode/renode)
- [Renode dokümantasyonu](https://renode.readthedocs.io)
- [Antmicro — Verilator ile Renode co-simülasyon](https://antmicro.com/blog/2020/06/co-simulating-rtl-with-renode/)
- [AMD/Xilinx Zynq7000 SoC ailesi](https://www.amd.com/en/products/adaptive-socs-and-fpgas/soc/zynq-7000.html)
- [Renode Robot Framework rehberi](https://renode.readthedocs.io/en/latest/introduction/testing.html)

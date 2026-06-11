# Araştırma — Priority Inversion ve Mars Pathfinder

## Doğrulanmış olgular

- **Pathfinder iniş tarihi:** 4 Temmuz 1997
- **RTOS:** VxWorks (Wind River)
- **Donanım yolu:** MIL-STD-1553
- **Görevler (Glenn Reeves'ın aktarımına göre):**
  - `bc_sched` — 1553 yolu zamanlayıcısı (yüksek öncelik)
  - `bc_dist` — yol veri dağıtım (yüksek öncelik)
  - ASI/MET — meteoroloji veri toplama (düşük öncelik)
  - Comm — iletişim (orta öncelik)
- **Mutex flag'i:** VxWorks `semMCreate()` çağrısında `SEM_INVERSION_SAFE` opsiyonu
  varsayılan olarak kapalı bırakılmıştı; `SEM_Q_PRIORITY` ile birlikte verilmeliydi.
- **Reset mekanizması:** `bc_sched` bir sonraki döngüyü hazırlarken `bc_dist`'in
  bitmediğini gördü; bu deadline ihlali sistem reset'ini tetikledi (watchdog değil,
  zamanlayıcı kontrolünün kendisi).
- **Düzeltme:** Uzaya küçük bir C programı yüklendi; mutex flag çalışma sırasında
  `priority inheritance ON` olacak şekilde değiştirildi. Reset'ler durdu.

## FreeRTOS karşılığı

- `xSemaphoreCreateMutex()` → varsayılan olarak priority inheritance açık.
- `xSemaphoreCreateBinary()` → priority inheritance YOK; ikili semaforla aynı senaryo
  reset üretir.
- `configUSE_MUTEXES = 1` gerekli (varsayılan).
- FreeRTOS priority ceiling protokolünü doğrudan desteklemez; PCP isteyen,
  vTaskPrioritySet ile elle kurmak zorunda.

## Worst-case blocking analizi

- **PIP (Priority Inheritance Protocol):** Bir görev, kendisinden daha düşük öncelikli
  her kilit sahibinden gelen bloklamayı toplayabilir → "chained blocking". Worst-case:
  `n` kilit ve `m` düşük öncelikli görev varsa `O(min(n, m))` blok süresi.
- **PCP (Priority Ceiling Protocol):** Her kaynağa bir tavan öncelik atanır; bir görev
  bir kaynağı talep edip kullandığında onun tavanına yükseltilir. **En fazla bir** kritik
  bölge boyu blok; deadlock olamaz.

## Kaynaklar

- Glenn Reeves, "What really happened on Mars Rover Pathfinder", Cornell CS614 archive
- Reeves'in orijinal e-postası — CCSU arşivi
- Wind River, "semMLib reference, VxWorks"
- FreeRTOS Kernel Documentation — Mutexes, Priority Inheritance
- Liu, J.W.S., "Real-Time Systems", Prentice Hall, 2000 — Chapter on resource access
  control (PIP, PCP, SRP)
- Sha, Rajkumar, Lehoczky, "Priority Inheritance Protocols: An Approach to Real-Time
  Synchronization", IEEE TC, 1990

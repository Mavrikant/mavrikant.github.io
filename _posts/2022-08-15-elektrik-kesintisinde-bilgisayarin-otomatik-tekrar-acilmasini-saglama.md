---
title: Elektrik kesintisinde bilgisayarın otomatik tekrar açılmasını sağlama
background: "/img/posts/3.jpg"
date: '2022-08-15 12:00:00'
layout: post
lang: tr
---

Bu yöntem DELL OptiPlex kasalar için anlatilmistir. BİOS ayarlari diğer markalarda da benzer olmakla beraber bir miktar farklılık gösterebilir. 

- Bilgisayar kapatılır
- Bilgisayar tekrar açılırken F2 tusu ile BİOS ayarlarına girilir.

![](/img/posts/reboot-after-power-outage-1.png){:style="display:block; margin-left:auto; margin-right:auto;width: 700px;"}

- Sol menuden Power Management altındaki AC Recovery başlıgına tıklanır.
- Sağ taraftan Power On  ya da istegimize gore Last Power State seçilir.

![](/img/posts/reboot-after-power-outage-2.png){:style="display:block; margin-left:auto; margin-right:auto;width: 700px;"}

- **Power Off:** Elektrik kesilip gelirse veya güç kablosunu çıkarıp taksanız bile sistem kapalı kalmaya devam edecektir. 
- **Power On:** Sistem kapalıyken bile elektrik kesilip gelirse veya güç kablosunu çıkarıp taksanız, sisteme otomatik olarak elektrik verilecek ve çalışmaya başlayacaktır.
- **Last Power State:** Eğer sisteminiz açıkken elektrik gidip gelirse ve güç kablosunu çıkarıp takarsanız, sistem tekrar açılacaktır. Ama sistem kapalıyken elektrik gidip gelirse veya güç kablosunu çıkarıp takarsanız sisteme elektrik verilmeyecektir; yani sistem otomatik açılmayacaktır.

![](/img/posts/reboot-after-power-outage-3.png){:style="display:block; margin-left:auto; margin-right:auto;width: 700px;"}

- Sağ alttaki Apply butonuna tıklanır.

![](/img/posts/reboot-after-power-outage-4.png){:style="display:block; margin-left:auto; margin-right:auto;width: 700px;"}

- Save as Custom User Settings checkbox'u işaretlenir.
- OK butonuna tıklanır.

![](/img/posts/reboot-after-power-outage-5.png){:style="display:block; margin-left:auto; margin-right:auto;width: 700px;"}

- Sağ alttaki Exit butonuna tıklayarak BİOS'tan çıkılır.
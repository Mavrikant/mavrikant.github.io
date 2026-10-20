---
title: Elektrik kesintisinde bilgisayarın otomatik tekrar açılmasını sağlama
background: "/img/posts/elektrik-kesintisi-otomatik-acilma-cover.webp"
date: '2022-08-15 12:00:00'
layout: post
lang: tr
categories: [araclar]
tags: [ipuclari, araclar]
---

Bu yöntem DELL OptiPlex kasalar için anlatılmıştır. BIOS ayarları diğer markalarda da benzer olmakla beraber bir miktar farklılık gösterebilir. 

- Bilgisayar kapatılır
- Bilgisayar tekrar açılırken F2 tuşu ile BIOS ayarlarına girilir.

![Dell BIOS ayarları: Power Management altında AC Recovery seçili, sağda Power On işaretli](/img/posts/reboot-after-power-outage-1.webp){:style="display:block; margin-left:auto; margin-right:auto;width: 700px;"}

- Sol menüden Power Management altındaki AC Recovery başlığına tıklanır.
- Sağ taraftan Power On  ya da isteğimize göre Last Power State seçilir.

![AC Recovery seçeneklerinin açıklaması: Power Off, Power On ve Last Power State](/img/posts/reboot-after-power-outage-2.webp){:style="display:block; margin-left:auto; margin-right:auto;width: 700px;"}

- **Power Off:** Elektrik kesilip gelirse veya güç kablosunu çıkarıp taksanız bile sistem kapalı kalmaya devam edecektir. 
- **Power On:** Sistem kapalıyken bile elektrik kesilip gelirse veya güç kablosunu çıkarıp taksanız, sisteme otomatik olarak elektrik verilecek ve çalışmaya başlayacaktır.
- **Last Power State:** Eğer sisteminiz açıkken elektrik gidip gelirse ve güç kablosunu çıkarıp takarsanız, sistem tekrar açılacaktır. Ama sistem kapalıyken elektrik gidip gelirse veya güç kablosunu çıkarıp takarsanız sisteme elektrik verilmeyecektir; yani sistem otomatik açılmayacaktır.

![BIOS ekranının sağ altındaki Apply düğmesi](/img/posts/reboot-after-power-outage-3.webp){:style="display:block; margin-left:auto; margin-right:auto;width: 700px;"}

- Sağ alttaki Apply butonuna tıklanır.

![Apply Settings Confirmation penceresi: Save as Custom User Settings işaretli, ardından OK](/img/posts/reboot-after-power-outage-4.webp){:style="display:block; margin-left:auto; margin-right:auto;width: 700px;"}

- Save as Custom User Settings checkbox'u işaretlenir.
- OK butonuna tıklanır.

![BIOS ekranının sağ altındaki Exit düğmesi](/img/posts/reboot-after-power-outage-5.webp){:style="display:block; margin-left:auto; margin-right:auto;width: 700px;"}

- Sağ alttaki Exit butonuna tıklayarak BIOS'tan çıkılır.

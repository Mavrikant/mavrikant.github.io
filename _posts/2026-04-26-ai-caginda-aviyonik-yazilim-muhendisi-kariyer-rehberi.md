---
title: "Aviyonik Yazılım Mühendisi İçin LLM'leri Etkin Kullanma Rehberi"
subtitle: "An Avionics Software Engineer's Guide to Effective LLM Use in 2026 and Beyond"
background: "/img/posts/8.webp"
date: '2026-04-26 09:00:00'
layout: post
lang: tr
mermaid: true
---

LLM'ler aviyonik yazılım geliştirmede artık gerçek bir araç. Claude Code, Cursor, Copilot doğru kullanıldığında bireysel verimi %30–50 artırıyor; günde yarım saatten birkaç saate kadar zaman kazandırıyor. Yanlış kullanıldığında ise sertifikasyon riski yaratıyor, izlenebilirliği bozuyor, mühendisi yanıltıyor.

Bu yazı 2026 ve sonrası için aviyonik yazılım mühendisine LLM'leri **en etkin** nasıl kullanması gerektiğini anlatıyor: pratik, somut, aviyonik bağlamına özel tavsiyeler — son 12 ayda olgunlaşmış araç ve kalıplara dayanarak.

---

## Doğru Aracı Seçin

LLM'i nasıl kullandığınız hangi aracı kullandığınızla başlar.

| Araç | Nerede iyi | Nerede dikkat |
|---|---|---|
| **Claude Code** (CLI, ajan) | Eski kod tabanı keşfi, çok adımlı analiz, araç kullanımı (MCP) | Otonom çalışmaya bırakmamak; her adımı görüp onaylamak |
| **Cursor** (IDE) | Yerinde kod yazımı, yeniden düzenleme, hızlı sorular | Otomatik tamamlamayı kabul etmeden önce mutlaka okumak |
| **GitHub Copilot** (IDE eklentisi) | Kısa öneriler, satır-içi tamamlama | Şirket politikası ve veri akışı netleşmeden ITAR/EAR kapsamlı koda açmamak |
| **Aider** (açık kaynak CLI) | Yerinde model deploy, izlenebilir Git diff'i | Performans Claude/Cursor'a göre düşük olabilir |

**Veri gizliliği.** ITAR, EAR ve DGA kontrollü kod genel buluttaki LLM'lere yapıştırılamaz. 2025 boyunca Anthropic, Microsoft ve Google büyük müşteriler için yerinde (on-premise) ve sıfır-eğitim deploy seçeneklerini olgunlaştırdı. Şirketinizin onaylı listesinin dışındaki bir aracı kontrollü kod için kullanmayın.

**Üç farklı kullanım modu var:** tek atış soru–cevap, IDE eşliği (satır-içi öneri), ajan (çok adımlı, otonom). Aviyonik için kural basit: ajan modunu yalnızca **sertifikasyon dışı** işlerde kullanın — eski kod anlama, doküman özeti, prototipleme. Sertifikasyona giden artefaktlarda her adım görünür ve onaylanır olmalı.

---

## En Yüksek Getirili Beş Kullanım

Bu beş alan günlük zamandan en çok kazandıran ve risk açısından kontrol edilebilir olanları:

**1. Eski kod tabanını anlama.** *"Bu fonksiyon ne yapıyor? Hangi gereksinimleri karşılıyor olabilir? Çağrı zincirinde nereye uyuyor?"* — Claude Code'un en güçlü olduğu yer. 20 yıllık aviyonik kodbazlarında onboarding süresini gün/ay seviyesinden saatlere indirebilir.

**2. Birim test taslakları.** *"DAL B, C99, MISRA C:2025'e uygun, şu fonksiyon için MC/DC kapsam veren test taslağı"* — taslak iyi çıkar, ama kapsam ve eşdeğerlik insan kontrolü ister. Kazanç zaman; doğrulama sizin işiniz.

**3. İzlenebilirlik matrisi taslakları.** Gereksinim metni → kod eşleşmesi öneren bir taslak çıkartmak üç saatlik manuel işi 40 dakikaya indirir; ardından bir saat insan inceleme şart. Net kazanç yarım gün.

**4. Statik analiz uyarısı triajı.** Polyspace, Frama-C, Astrée çıktılarını LLM'e sınıflandırtmak — gerçek hata mı, yanlış pozitif mi, hangi gereksinim ilgili mi — saatler kazandırır. Karar yine sizin.

**5. Format ve şablon çevirme.** Gereksinim metnini DOORS formatına; test sonucunu sertifikasyon raporu şablonuna; eski C koddan model temelli giriş bloğuna. LLM'in sıfır risk + yüksek getirili klasik işi.

---

## Bunu LLM'e Yaptırmayın

LLM'i kullanmamak gereken yerler aynı netlikte:

- **Güvenlik analizi (FHA, FTA, FMEA).** Hata modunu, etkisini ve kritikliğini insan değerlendirir. LLM önerilerinin hepsi gözden geçirilmeden taslağa geçemez.
- **Mimari karar verme.** Karpathy ve DHH'nin son 12 ayda art arda söylediği gibi: *AI mimari karar vermiyor, vermeyecek.* Bu sizin alanınız.
- **Bağımsızlık (independence) gerektiren incelemeler.** DO-178C kodu yazan kişiyle inceleyenin farklı olmasını ister. LLM'e yazdırdığınız kodu LLM'e inceletemezsiniz; bu DO-178C objektifini ihlal eder.
- **Doğrudan sertifikasyon artefaktı.** Çıktıyı kopyala–yapıştır cert dosyasına atmak sizi DO-330 anlamında "araç kalifikasyonu" yükümlülüğüne sokar. Her zaman insan inceleme + revizyon arada olsun.
- **Kriptografi ve güvenlik kritik kod.** Bilinen kütüphaneleri çağırmak hariç, LLM'in ürettiği şifreleme veya doğrulama mantığı kullanılmamalı.

<div class="mermaid">
flowchart LR
    classDef green fill:#c6f6d5,stroke:#22543d,color:#22543d
    classDef yellow fill:#fefcbf,stroke:#744210,color:#744210
    classDef red fill:#fed7d7,stroke:#742a2a,color:#742a2a

    A[Gereksinim Yakalama]:::yellow
    B[Yüksek Seviye Tasarım]:::red
    C[Düşük Seviye Tasarım]:::yellow
    D[Kodlama]:::green
    E[Birim Test Tasarımı]:::green
    F[Birim Test Yürütme]:::green
    G[Entegrasyon Testi]:::yellow
    H[Sistem Testi]:::yellow
    I[Sertifikasyon Dosyası]:::red

    A --> B --> C --> D --> E --> F --> G --> H --> I
</div>

> **Renk anahtarı —** Yeşil: LLM rahatça kullanılır. Sarı: LLM yardımcı, insan onayı şart. Kırmızı: LLM araç değil, sadece referans.

---

## Aviyonik Bağlamında Etkili Prompt Kalıpları

İyi prompt iyi çıktının ön şartı. Aviyonik için özel olarak şu unsurları **her** istemde verin:

1. **DAL seviyesi** (A, B, C, D)
2. **Hedef dil ve standart** (C99, C11, Ada 2012, MISRA C:2025)
3. **Hedef donanım kısıtı** (PowerPC e500, ARM Cortex-R5, ARINC 653 partition scheduling)
4. **Gereksinim referansı** (örn. *"REQ-FCS-014'ü karşılayacak"*)
5. **Mevcut kod stili** (en fazla 30 satır örnek paste)

İşe yarayan kalıplar:

- **Önce test, sonra kod.** *"Şu gereksinim için önce MC/DC kapsam veren test taslağı yaz; ardından testleri geçecek bir implementasyon öner."* Beck'in TDD tezinden çıkan en güvenli kalıp.
- **Akıl yürütmeyi göster.** *"Cevabını vermeden önce hangi DO-178C objektiflerini etkilediğini ve neden bu yaklaşımı seçtiğini madde madde açıkla."*
- **Ters bakış.** *"Bu implementasyonda ne ters gidebilir? Hangi uç durumlar unutulmuş?"*
- **Yapılandırılmış çıktı.** *"Cevabını JSON olarak ver: {requirement_ids, risks, tests}."* Aşağı akış araçlarına bağlamak kolaylaşır.
- **Çoklu model.** Önemli soruları iki farklı modele (Claude + Gemini ya da Claude + GPT) sorun, anlaşmazlığa bakın — fark genellikle bir bilgi açığını gösterir.

---

## Araç Entegrasyonu: MCP'yi Tanıyın

Anthropic'in Kasım 2024'te açtığı **Model Context Protocol (MCP)** 2025 boyunca olgunlaştı ve aviyonik için en somut entegrasyon fırsatı. Protokol, LLM'i geliştirme araçlarına standart bir şekilde bağlar.

Pratik MCP kullanım örnekleri:

- **DOORS MCP** — gereksinimleri doğal dille sorgulayın: *"DAL B kapsamındaki tüm timing gereksinimlerini listele."*
- **Polyspace MCP** — statik analiz çıktısını gereksinime bağlayın.
- **Git MCP** — *"Şu fonksiyonun son 5 yıllık değişiklik gerekçeleri."*
- **Kod arama MCP** — *"Partition timing ihlali olabilecek kalıpları bul."*

Şirketinizde DOORS, Polarion veya Polyspace için MCP sunucusu henüz yoksa bunu kurmak — yarım gün — sizi araç tarafında bir adım önde tutar. Erken entegratör avantajı bugün gerçek.

---

## Yaygın Tuzaklar

LLM'in yanılgıya düştüğü zamanları tanımak başlı başına bir yetenek. Aviyonik'te en sık görülenler:

- **Halüsine API ve fonksiyonlar.** Var olmayan bir RTOS çağrısı, var olmayan bir VxWorks fonksiyonu. Çözüm: dokümantasyondan referans isteyin, çıktıyı derleyin.
- **Makul görünen ama yanlış testler.** Test "doğru görünür" ama yanlış davranışı doğrulamaktadır. Çözüm: testi gereksinime geri bağlayın, adım adım inceleme yapın.
- **Eksik concurrency / partition timing.** LLM ARINC 653 partition scheduling'i kabaca anlar, derinlikli akıl yürütmez. Çözüm: zamanlama analizini manuel tutun.
- **Eski standart referansları.** Sıkça DO-178B objektiflerini DO-178C olarak gösterir. Çözüm: standart numarasını ve sürümünü her zaman doğrulayın.
- **MISRA ihlali.** LLM dinamik bellek tahsisi, özyineleme veya yasaklanmış kalıpları DAL B/A kodda önerebilir. Çözüm: Polyspace ya da MISRA denetleyiciyi pipeline'da tutun.
- **Aşırı özgüvenli çıktı.** LLM "emin" konuşur ama emin değildir. Çözüm: kritik soruda *"Cevabınla ilgili belirsizlikler ve daha fazla bilgi gerektirecek noktalar"* da isteyin.

---

## DO-178C / DO-330 Disiplini

LLM kullanırken sertifikasyon disiplinini koruma yolları:

- **İzlenebilirliği elden bırakmayın.** LLM çıktısı sertifikasyon artefaktına dönüşüyorsa, hangi gereksinimden geldiği aynı satırda yazılı olmalı.
- **Araç kalifikasyonu eşiğini bilin.** Çıktınız doğrulama olmadan artefakt oluyorsa DO-330 yükümlülüğü doğar. Pratik kural: her LLM çıktısının önünde insan inceleme + revizyon adımı olsun.
- **Bağımsızlığı koruyun.** Kodu LLM yazdıysa, incelemeyi başka bir mühendis (ve isterse başka bir LLM) yapsın.
- **Prompt günlüğü tutun.** Hangi prompt, hangi cevap, hangi karar — saklayın. Denetimde değerli, kendi öğrenme eğrinizde de.

---

## Günlük Alışkanlıklar

LLM'leri etkin kullanan mühendislerin ortak rutini var:

- **Prompt günlüğü.** Günde 5–10 dakika: bugünkü kullanımlar, kazanç, hata. Ay sonunda kalıpları görürsünüz.
- **Doğrulama-önce zihniyeti.** Çıktıyı kabul etmeden önce *"Bu nasıl yanlış olabilir?"* sorusunu rutin halinde sorun.
- **Kuşkusuzluk eşiği.** LLM "kesin" konuştuğunda alarm çalsın. Çoğu zaman bilgi açığı vardır.
- **Aylık araç güncellemesi.** LLM ekosistemi 6 ayda büyük oranda değişir. Ayda en az 1 saat yeni araç, yeni model, yeni MCP sunucusu okuyun.
- **Topluluk takibi.** Böckeler / Fowler ThoughtWorks memoları, Simon Willison blogu, Kent Beck Substack — ayda bir göz atın.

---

## Sonuç

LLM'ler aviyonik yazılım geliştirme iş akışını yeniden çiziyor. Doğru kullanılmaları için üç ilke yeter:

1. **Doğru aracı, doğru görev için kullanın.** Yüksek getirili beş kullanım ve "yapmayın" listesi netleşmiş durumda.
2. **Sertifikasyon disiplinini bırakmayın.** İzlenebilirlik, bağımsızlık, doğrulama — LLM olsa da olmasa da aynı.
3. **Güncel kalın.** Araç ekosistemi 6 ayda büyük oranda değişir; ayda 1 saat yatırım uzun vadede en yüksek getiri.

Doğru kullanılan LLM 8 yıllık aviyonik yazılımcının üretkenliğini katlar. Yanlış kullanılan LLM aynı mühendisi sertifikasyon riskine sokar. Fark, alışkanlıklarınızda.

---

## Kaynaklar

- [Andrej Karpathy — *Software is Changing (Again)*, YC AI Startup School, Haziran 2025](https://www.youtube.com/watch?v=LCEmiRjPEtQ)
- [ThoughtWorks — Exploring Generative AI (Birgitta Böckeler & Martin Fowler, 2025 memoları)](https://martinfowler.com/articles/exploring-gen-ai.html)
- [Simon Willison — LLM weblog (MCP ve ajanlar üzerine 2024–2025 yazıları)](https://simonwillison.net/)
- [Anthropic — Building Effective Agents (Aralık 2024)](https://www.anthropic.com/research/building-effective-agents)
- [Anthropic — Model Context Protocol (Kasım 2024 lansman, 2025 olgunlaşma)](https://modelcontextprotocol.io/)
- [Kent Beck — Tidy First & Augmented Coding (2025)](https://tidyfirst.substack.com/)
- [DHH — AI hype eleştirisi yazıları (2025–2026)](https://world.hey.com/dhh)
- [Stack Overflow Developer Survey 2025 — AI Tools](https://survey.stackoverflow.co/2025)

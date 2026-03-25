---
title: "Versiyon Kontrol Sistemleri: Git vs SVN vs ClearCase"
background: "/img/posts/4.jpg"
date: '2026-03-25 12:00:00'
layout: post
lang: tr
---

Yazılım geliştirmenin vazgeçilmez parçası olan versiyon kontrol sistemleri (VCS), kod değişikliklerini takip eder, ekip çalışmasını koordine eder ve geçmişe dönük izlenebilirlik sağlar. Bu yazıda en yaygın üç sistemi — **Git**, **SVN (Subversion)** ve **ClearCase** — mimari, özellik ve kullanım kolaylığı açısından karşılaştıracağız.

---

## Mimari: Merkezi mi, Dağıtık mı?

Üç sistem arasındaki en temel fark mimaridir.

<div class="mermaid">
graph TD
    subgraph Git - Dağıtık
        GR[Uzak Repo] <-->|push/pull| GL1[Geliştirici A - Yerel Repo]
        GR <-->|push/pull| GL2[Geliştirici B - Yerel Repo]
        GR <-->|push/pull| GL3[Geliştirici C - Yerel Repo]
    end
</div>

<div class="mermaid">
graph TD
    subgraph SVN / ClearCase - Merkezi
        CR[Merkezi Sunucu] -->|checkout| CL1[Geliştirici A]
        CR -->|checkout| CL2[Geliştirici B]
        CL1 -->|commit| CR
        CL2 -->|commit| CR
    end
</div>

| Özellik | Git | SVN | ClearCase |
|---------|-----|-----|-----------|
| Mimari | Dağıtık | Merkezi | Merkezi |
| Yerel commit | Evet | Hayır | Hayır |
| Çevrimdışı çalışma | Tam | Kısıtlı | Hayır |
| Tam geçmiş yerel | Evet | Hayır | Hayır |

---

## Git

2005 yılında Linux çekirdeği geliştirmesi için Linus Torvalds tarafından yazılan Git, günümüzde dünyada en çok kullanılan VCS'dir.

### Temel Kavramlar

```
Çalışma Dizini  →  git add  →  Staging (Index)  →  git commit  →  Yerel Repo
                                                                        ↕
                                                                   git push/pull
                                                                   Uzak Repo
```

### Güçlü Yönleri

- **Dallanma (branching) ucuzdur:** Yeni bir dal oluşturmak milisaniyeler alır; dal esasen bir işaretçidir.
- **Çevrimdışı çalışma:** Tüm geçmiş yerel diskinizdedir; sunucuya erişim olmadan commit, diff ve log işlemleri yapılabilir.
- **Hız:** Tüm işlemler (diff, log, blame) yerel olduğundan çok hızlıdır.
- **Esnek iş akışları:** GitFlow, trunk-based, forking — her ekibe uygun bir model mevcuttur.

### Sık Kullanılan Komutlar

```bash
git init                    # Yeni repo başlat
git clone <url>             # Uzak repoyu klonla
git checkout -b feature/x   # Yeni dal oluştur ve geç
git add .                   # Değişiklikleri sahneye al
git commit -m "mesaj"       # Yerel commit
git push origin feature/x   # Uzak repoya gönder
git merge main              # Dalları birleştir
git rebase main             # Değişiklikleri yeniden uygula
git stash                   # Değişiklikleri geçici olarak sakla
```

### Zayıf Yönleri

- Büyük ikili (binary) dosyalar için uygun değildir (LFS eklentisi gerekir)
- Öğrenme eğrisi dik olabilir (`rebase`, `cherry-pick`, `reflog`...)
- Merkezi erişim kontrolü SVN/ClearCase kadar ince taneli değildir

---

## SVN (Subversion)

2000 yılında CVS'in sorunlarını gidermek amacıyla geliştirilen SVN, merkezi bir sunucu üzerinden çalışır. Hâlâ kurumsal ortamlarda ve eski projelerde yaygındır.

### Temel Kavramlar

SVN'de `branches/`, `tags/` ve `trunk/` dizinleri dosya sistemi seviyesindedir; dal oluşturmak aslında sunucuda bir kopyalama işlemidir.

```
svn repository/
├── trunk/          ← Ana geliştirme hattı
├── branches/
│   ├── feature-x/
│   └── release-1.0/
└── tags/
    └── v1.0.0/
```

### Sık Kullanılan Komutlar

```bash
svn checkout <url>          # Çalışma kopyası al
svn update                  # Sunucudan güncelle
svn add dosya.c             # Takibe ekle
svn commit -m "mesaj"       # Sunucuya gönder
svn diff                    # Değişiklikleri göster
svn log                     # Geçmişi göster
svn merge <url>             # Dalları birleştir
svn revert dosya.c          # Değişikliği geri al
```

### Güçlü Yönleri

- Basit ve anlaşılır model; Git'e göre öğrenmesi kolay
- Dosya/dizin bazında erişim kontrolü (`svnserve` + `authz`)
- Kısmi checkout: yalnızca bir alt dizini alabilirsiniz
- İkili dosya yönetimi daha az sorunlu
- `svn:externals` ile bağımlılık yönetimi

### Zayıf Yönleri

- Sunucu bağlantısı olmadan commit yapılamaz
- Dallanma maliyetli (sunucu tarafı kopyalama)
- Birleştirme (merge) geçmişi Git kadar güçlü takip edilmez
- Tüm repo geçmişi yerel değil

---

## IBM Rational ClearCase

ClearCase, 1992'de Rational Software tarafından geliştirildi; daha sonra IBM tarafından satın alındı. Başta havacılık, savunma ve telekomünikasyon gibi **yüksek güvenceli ve denetlenen (regulated)** sektörlerde yaygındır.

### Temel Kavramlar

ClearCase'in en özgün özelliği **VOB (Versioned Object Base)** ve **View** mimarisidir:

- **VOB:** Tüm versiyon bilgisinin depolandığı merkezi veri tabanı
- **View (Dynamic / Snapshot):**
  - *Dynamic View:* Dosyalar ağ üzerinden canlı olarak bağlanır (mount edilir), disk alanı kullanmaz
  - *Snapshot View:* Dosyalar yerel diske kopyalanır, çevrimdışı çalışılabilir
- **Config Spec:** Hangi versiyonların görüneceğini tanımlayan kural seti

```
VOB
 └── element/
      ├── main/
      │    ├── 1  (versiyon 1)
      │    ├── 2  (versiyon 2)
      │    └── feature-x/
      │         └── 1
      └── ...
```

### ClearCase MultiSite

Coğrafi olarak dağılmış ekipler için VOB'ları replike eden **MultiSite** özelliği, kurumsal düzeyde kullanımı mümkün kılar.

### Güçlü Yönleri

- **İnce taneli erişim kontrolü:** Dosya, element, hatta versiyon seviyesinde izin yönetimi
- **Tam denetlenebilirlik:** DO-178C, AS9100, CMMI gibi standartların gerektirdiği iz kaydı
- **UCM (Unified Change Management):** Aktivite (activity) bazlı değişiklik takibi
- **Dynamic View:** Çok büyük repolar için disk alanından bağımsız çalışma
- **Güçlü etiketleme ve baseline:** Release yönetimi için zengin altyapı

### Zayıf Yönleri

- Kurulum ve bakım son derece karmaşık ve pahalı
- Lisans maliyeti yüksek
- Modern CI/CD araçlarıyla entegrasyon zor
- Komut satırı arayüzü `cleartool` alışılmadık
- Geliştirici deneyimi (DX) Git'in çok gerisinde

### Temel ClearCase Komutları

```bash
cleartool lsview            # Mevcut view'ları listele
cleartool setview myview    # View'a geç
cleartool checkout -nc dosya.c   # Dosyayı düzenlemeye aç
cleartool checkin -m "mesaj" dosya.c  # Değişikliği kaydet
cleartool lshistory dosya.c      # Dosya geçmişini göster
cleartool diff -pred dosya.c     # Önceki versiyonla karşılaştır
cleartool mkbl -full BASELINE_1  # Baseline oluştur
```

---

## Kapsamlı Karşılaştırma Tablosu

| Özellik | Git | SVN | ClearCase |
|---------|:---:|:---:|:---------:|
| Mimari | Dağıtık | Merkezi | Merkezi |
| Çevrimdışı commit | ✅ | ❌ | ❌ |
| Dallanma hızı | Çok hızlı | Yavaş | Orta |
| Merge kalitesi | Çok iyi | Orta | İyi (UCM) |
| İkili dosya desteği | Orta (LFS) | İyi | İyi |
| Erişim kontrolü | Kaba | İnce | Çok ince |
| Denetlenebilirlik | Orta | Orta | Çok yüksek |
| Öğrenme eğrisi | Orta-Dik | Düz | Çok dik |
| Kurulum maliyeti | Düşük | Orta | Çok yüksek |
| CI/CD entegrasyonu | Mükemmel | İyi | Zor |
| Topluluk / ekosistem | Devasa | Orta | Küçük |
| Büyük repo performansı | Orta | İyi | İyi |

---

## Hangi Sistemi Seçmeli?

```
Proje türü nedir?
│
├── Açık kaynak / web / startup
│    └── → Git (GitHub / GitLab / Bitbucket)
│
├── Kurumsal, orta ölçek, basit iş akışı
│    └── → SVN (veya Git'e geçiş planla)
│
└── Havacılık, savunma, DO-178C / AS9100
     ├── Mevcut süreçler ClearCase etrafında mı kurulu?
     │    └── → ClearCase (kısa vadede)
     └── Yeni proje / modernizasyon
          └── → Git + güçlü CI/CD + politika araçları
```

---

## ClearCase'den Git'e Geçiş

Savunma sanayii gibi sektörlerde ClearCase'den Git'e geçiş giderek yaygınlaşmaktadır. Bu süreçte dikkat edilmesi gereken noktalar:

1. **Geçmiş aktarımı:** `git-cc` veya `clearcase2git` araçları VOB geçmişini Git'e taşır
2. **İnce erişim kontrolünü karşılama:** GitLab/GitHub'ın `CODEOWNERS`, branch koruma kuralları ve zorunlu inceleme (required review) özellikleri kullanılabilir
3. **Denetlenebilirlik:** Signed commits (`git commit -S`) ve koruma dalları iz kaydını güçlendirir
4. **Büyük ikili dosyalar:** Git LFS ile yönetilmelidir

---

## Özet

- **Git:** Modern yazılım geliştirmenin fiili standardı. Hız, esneklik ve ekosistem açısından rakipsiz.
- **SVN:** Basitliği ve merkezi erişim kontrolüyle hâlâ geçerli; ancak uzun vadede Git'e geçişi öneririz.
- **ClearCase:** Yüksek güvenceli, denetlenen projelerde derinlemesine izlenebilirlik ve ince erişim kontrolü sunar; ancak maliyeti ve karmaşıklığı yüksektir.

Doğru araç, projenin ölçeğine, sektörün gereksinimlerine ve ekibin olgunluğuna bağlıdır. Ancak günümüzde yeni bir projeye başlıyorsanız Git neredeyse her zaman ilk tercih olmalıdır.

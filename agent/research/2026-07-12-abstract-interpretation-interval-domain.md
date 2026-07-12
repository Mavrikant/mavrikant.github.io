# Araştırma Notu — Abstract Interpretation (Interval Domain)

## Doğrulanmış olgular

- **Cousot & Cousot 1977 POPL**: "Abstract Interpretation: A Unified Lattice Model for
  Static Analysis of Programs by Construction or Approximation of Fixpoints",
  4th ACM Symp. on Principles of Programming Languages, Los Angeles, s. 238-252.
  DOI: 10.1145/512950.512973. İlk taslak 1975'te Grenoble'da "Vérification statique de
  la cohérence dynamique des programmes" olarak sunulmuş.
- **Rice teoremi (1953)**: Turing-tam dillerin non-trivial semantik özellikleri
  karar verilemez. Bu yüzden `sound` ve `complete` bir analiz *aynı anda* mümkün değil.
- **Astrée** (Airbus + INRIA/ENS): Kasım 2003'te Airbus A340 uçuş kontrol yazılımı
  132 KLOC C üzerinde runtime error yokluğunu kanıtladı. 2004'ten itibaren A380
  fly-by-wire yazılımında da kullanıldı. Yayınlar: astree.ens.fr, absint.com/astree.
- **Miné octagon domain**: Antoine Miné, "The Octagon Abstract Domain",
  Higher-Order and Symbolic Computation, 2006 (ilk fikir 2001 AST'te). ±X ± Y ≤ c
  kısıtlarını temsil eder. DBM (Difference Bound Matrix). Kübik en kötü durum,
  interval'den precise, polyhedra'dan ucuz.
- **Polyspace Code Prover**: Sound abstract interpretation tabanlı; runtime error
  yokluğunu ispatlar. DO-178C DAL A süreçlerinde kullanılır (TQL-4 için nitelendirme).
- **Polyspace Bug Finder**: Complete değil sound değil — pratik bug arama aracı.
- **Widening (∇)**: Sonsuz artan zincirleri sonlu adımda durdurur. Standart interval
  widening: alt sınır azalıyorsa −∞, üst sınır artıyorsa +∞'a atlar.
- **Widening with thresholds ("up-to widening")**: Sabit değerlere (programda geçen
  literal'ler veya kullanıcı tanımlı) atlar; +∞'a gitmek yerine bir üst eşiğe.
- **Narrowing (△)**: Widening'den sonra düzeltici; fixpoint'e döner ama loop koşulunun
  bilgiyi geri kazandırması gerek.

## Kilit teknik nokta — Interval domain'in temel eksiği

- Interval, relational olmayan bir domain. `x = y` bilgisi kaybolur.
- Örnek: `int x=[0,10], y=[0,10]; if (x==y) z = x/y;` — division-by-zero alarmı
  üretir, çünkü y=0 hâlâ interval'de. Oysa x==y ⇒ y=0 ise x=0 olamaz (çakışırdı).
  Octagon (x-y≤0 & y-x≤0) veya polyhedra bu tuzağı çözer.

## Astrée'nin domain mimarisi

Astrée sadece interval değil, çok sayıda tamamlayıcı domain kullanır (bkz.
Blanchet, Cousot et al. 2003):
- Interval (temel)
- Octagon (relational, hızlı)
- Congruence (a·Z + b)
- Filter domains (dijital filtrelerin exponential decay davranışı için özel)
- Trace partitioning (kontrol akışı bilgisi)

Bu birleşim, A340/A380 flight control kodunda yanlış alarm sayısını sıfıra indirmiştir.

## Kaynaklar (yazıda kullanılacak)

1. Cousot & Cousot 1977, POPL — özgün makale
2. Cousot 2024, "A Personal Historical Perspective on Abstract Interpretation" — FSP
3. Miné 2006, "The Octagon Abstract Domain" — HOSC
4. Blanchet et al. 2003, "A Static Analyzer for Large Safety-Critical Software" — PLDI
5. astree.ens.fr — resmi Astrée sitesi
6. absint.com/astree — ticari Astrée
7. Wikipedia: Abstract Interpretation, Astrée, Rice's theorem — genel referans
8. MathWorks Polyspace Code Prover ürün sayfası
9. Schwartzbach lecture notes — pedagojik açıklama
10. Rival & Yi 2020, "Introduction to Static Analysis" — MIT Press kitabı

## Yazıda kullanılmayacak fakat kontrol edilmiş

- Grokipedia sayfaları (Grokipedia içerik güvenilirliği düşük; sadece çapraz doğrulama
  için kullandım, kaynak listesine koymayacağım).
- Kalıcı erişim şüpheli görülen bazı arxiv preprint'leri; öz kaynak olarak Cousot 1977
  ve Miné 2006 yeterli.

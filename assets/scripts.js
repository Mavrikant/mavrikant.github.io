(function () {
  // ---------------------------------------------------------------------------
  // Theme toggle (light/dark)
  // ---------------------------------------------------------------------------
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
  }

  function initThemeToggle() {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // One shared, visually hidden live region for short status messages
  // (WCAG 4.1.3), e.g. "copied to clipboard".
  var liveRegion = null;
  function announce(text) {
    if (!liveRegion) {
      liveRegion = document.createElement('p');
      liveRegion.className = 'sr-only';
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = '';
    setTimeout(function () { liveRegion.textContent = text; }, 50);
  }

  // ---------------------------------------------------------------------------
  // Code blocks: language badge + copy-to-clipboard buttons
  // ---------------------------------------------------------------------------
  function languageFromBlock(block) {
    var code = block.querySelector('code');
    if (code) {
      for (var i = 0; i < code.classList.length; i++) {
        var cls = code.classList[i];
        if (cls.indexOf('language-') === 0) return cls.slice('language-'.length);
      }
    }
    var hl = block.classList || [];
    for (var j = 0; j < hl.length; j++) {
      var c = hl[j];
      if (c.indexOf('language-') === 0) return c.slice('language-'.length);
    }
    return null;
  }

  function initCodeEnhancements() {
    var blocks = document.querySelectorAll('div.highlight, figure.highlight');
    blocks.forEach(function (block) {
      // Language badge
      if (!block.hasAttribute('data-lang')) {
        var lang = languageFromBlock(block);
        if (lang && lang !== 'plaintext' && lang !== 'text') {
          block.setAttribute('data-lang', lang);
        }
      }

      // Long lines scroll sideways inside <pre>; make that scroll region
      // reachable from the keyboard (WCAG 2.1.1).
      var pre = block.querySelector('pre');
      if (pre && !pre.hasAttribute('tabindex')) pre.setAttribute('tabindex', '0');

      // Copy button
      if (block.querySelector('.copy-code-btn')) return;
      if (!pre) return;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-code-btn';
      btn.setAttribute('aria-label', 'Kodu panoya kopyala');
      btn.textContent = 'Kopyala';

      btn.addEventListener('click', function () {
        var code = pre.innerText;
        var done = function () {
          btn.textContent = 'Kopyalandı';
          btn.classList.add('is-copied');
          announce('Kod panoya kopyalandı.');
          setTimeout(function () {
            btn.textContent = 'Kopyala';
            btn.classList.remove('is-copied');
          }, 1800);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(done).catch(function () {
            fallbackCopy(code, done);
          });
        } else {
          fallbackCopy(code, done);
        }
      });

      block.appendChild(btn);
    });
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    if (done) done();
  }

  // ---------------------------------------------------------------------------
  // Table of contents: build from h2/h3 inside .post-content, enable scroll-spy
  // ---------------------------------------------------------------------------
  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  function initPostToc() {
    var toc = document.querySelector('.post-toc');
    var content = document.querySelector('.post-content');
    if (!toc || !content) return;

    var headings = content.querySelectorAll('h2, h3');
    if (headings.length < 3) {
      toc.classList.add('is-empty');
      return;
    }

    var nav = toc.querySelector('#post-toc-nav');
    if (!nav) return;

    var ul = document.createElement('ul');
    var usedIds = {};

    // Heading text without footnote markers (<sup>) or injected anchors, so
    // "Onaylama<sup>2</sup>" does not become "Onaylama2" in the TOC and slug.
    function headingText(h) {
      var clone = h.cloneNode(true);
      Array.prototype.forEach.call(clone.querySelectorAll('sup, .heading-anchor'), function (el) {
        el.parentNode.removeChild(el);
      });
      return (clone.textContent || '').replace(/\s+/g, ' ').trim();
    }

    headings.forEach(function (h) {
      if (!h.id) {
        var base = slugify(headingText(h)) || 'section';
        var id = base;
        var i = 2;
        while (usedIds[id] || document.getElementById(id)) {
          id = base + '-' + i++;
        }
        h.id = id;
        usedIds[id] = true;
      } else {
        usedIds[h.id] = true;
      }

      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = headingText(h);
      a.dataset.target = h.id;
      if (h.tagName === 'H3') a.classList.add('toc-h3');
      li.appendChild(a);
      ul.appendChild(li);
    });

    nav.appendChild(ul);

    // Collapsible toggle (small screens — sidebar is always open on >=1280px)
    var toggle = toc.querySelector('.post-toc__toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var open = toc.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      // Collapse after following a link on small screens
      nav.addEventListener('click', function (e) {
        if (e.target.closest('a') && window.matchMedia('(max-width: 1279.98px)').matches) {
          toc.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Scroll spy: the active entry is the last heading whose top has passed
    // the reading line below the navbar; at the very bottom it is the last
    // heading. Computed from scroll position, so it stays right after jumps
    // (End/Home, TOC clicks, reloads mid-page) where intersection events miss.
    var links = nav.querySelectorAll('a');
    var byId = {};
    links.forEach(function (l) { byId[l.dataset.target] = l; });
    var current = null;

    function spy() {
      var line = 120;
      var id = null;
      var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        id = headings[headings.length - 1].id;
      } else {
        for (var i = 0; i < headings.length; i++) {
          if (headings[i].getBoundingClientRect().top <= line) id = headings[i].id;
          else break;
        }
      }
      if (id === current) return;
      if (current && byId[current]) byId[current].classList.remove('is-active');
      if (id && byId[id]) {
        byId[id].classList.add('is-active');
        keepInView(byId[id]);
      } else {
        nav.scrollTop = 0; // above the first heading: show the list from its start
      }
      current = id;
    }

    // Long TOCs scroll inside the sticky sidebar: keep the active entry
    // visible by scrolling the nav box only (never the page).
    function keepInView(link) {
      if (nav.scrollHeight <= nav.clientHeight) return;
      var top = link.getBoundingClientRect().top - nav.getBoundingClientRect().top + nav.scrollTop;
      var bottom = top + link.offsetHeight;
      if (top < nav.scrollTop + 24) nav.scrollTop = Math.max(0, top - 24);
      else if (bottom > nav.scrollTop + nav.clientHeight - 24) nav.scrollTop = bottom - nav.clientHeight + 24;
    }

    var spyTicking = false;
    window.addEventListener('scroll', function () {
      if (!spyTicking) {
        spyTicking = true;
        window.requestAnimationFrame(function () { spyTicking = false; spy(); });
      }
    }, { passive: true });
    window.addEventListener('resize', spy);
    spy();
  }

  // ---------------------------------------------------------------------------
  // Heading anchors: hover-revealed deep links on article headings (h2-h4).
  // Reuses any id already assigned by the TOC builder; assigns one otherwise so
  // every section is directly linkable.
  // ---------------------------------------------------------------------------
  var ANCHOR_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';

  function initHeadingAnchors() {
    var content = document.querySelector('.post-content');
    if (!content) return;

    var headings = content.querySelectorAll('h2, h3, h4');
    var usedIds = {};

    headings.forEach(function (h) {
      if (!h.id) {
        var base = slugify(h.textContent || '') || 'section';
        var id = base;
        var i = 2;
        while (usedIds[id] || document.getElementById(id)) {
          id = base + '-' + i++;
        }
        h.id = id;
      }
      usedIds[h.id] = true;

      if (h.querySelector('.heading-anchor')) return;

      var a = document.createElement('a');
      a.className = 'heading-anchor';
      a.href = '#' + h.id;
      a.setAttribute('aria-label', 'Bu bölüme bağlantı');
      a.innerHTML = ANCHOR_ICON;
      h.appendChild(a);
    });
  }

  // ---------------------------------------------------------------------------
  // Content accessibility touch-ups for markup that comes from Markdown:
  // - tables sit in a .table-scroll wrapper that becomes a focusable, labelled
  //   region when it overflows (keyboard scrolling on phones) — the role goes
  //   on the wrapper so the table keeps its table semantics;
  // - embedded videos without a title get one;
  // - an empty header cell (a matrix corner) becomes a plain data cell.
  // ---------------------------------------------------------------------------
  function initContentA11y() {
    var content = document.querySelector('.post-content');
    if (!content) return;

    var wrappers = [];
    content.querySelectorAll('table').forEach(function (table) {
      if (table.parentNode.classList && table.parentNode.classList.contains('table-scroll')) return;
      var wrap = document.createElement('div');
      wrap.className = 'table-scroll';
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
      wrappers.push(wrap);

      table.querySelectorAll('th').forEach(function (th) {
        if (th.textContent.trim()) return;
        var td = document.createElement('td');
        Array.prototype.forEach.call(th.attributes, function (a) { td.setAttribute(a.name, a.value); });
        th.parentNode.replaceChild(td, th);
      });
    });

    function markScrollable() {
      wrappers.forEach(function (wrap, i) {
        if (wrap.scrollWidth > wrap.clientWidth + 1) {
          wrap.setAttribute('tabindex', '0');
          wrap.setAttribute('role', 'region');
          // Numbered so each region landmark has a unique name.
          wrap.setAttribute('aria-label', 'Tablo ' + (i + 1) + ' (yatay kaydırılabilir)');
        } else {
          wrap.removeAttribute('tabindex');
          wrap.removeAttribute('role');
          wrap.removeAttribute('aria-label');
        }
      });
    }
    markScrollable();
    window.addEventListener('resize', markScrollable);

    content.querySelectorAll('iframe').forEach(function (frame) {
      if ((frame.getAttribute('title') || '').trim()) return;
      frame.setAttribute('title', /youtube/.test(frame.src) ? 'YouTube videosu' : 'Gömülü içerik');
    });
  }

  // ---------------------------------------------------------------------------
  // Scroll-to-top: floating button revealed after the first viewport of scroll.
  // ---------------------------------------------------------------------------
  function initScrollTop() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'scroll-top';
    btn.setAttribute('aria-label', 'Başa dön');
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>';
    document.body.appendChild(btn);

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });

    var ticking = false;
    function update() {
      ticking = false;
      btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8);
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  // ---------------------------------------------------------------------------
  // Desktop navbar headroom: once the reader scrolls past it, the navbar is
  // parked just above the viewport (`is-fixed`) and slides back in on
  // scroll-up (`is-visible`), so search, theme and menu stay one flick away on
  // long posts. Styles live under `#mainNav.is-fixed` in _sass/styles.scss
  // (keyboard focus inside the parked bar also reveals it, via :focus-visible).
  // Below 992px the navbar keeps the theme's original behaviour: it sits at
  // the top of the page and scrolls away (the scroll-to-top button brings the
  // reader back to it).
  // ---------------------------------------------------------------------------
  function initNavbarScroll() {
    var nav = document.getElementById('mainNav');
    if (!nav) return;
    var desktop = window.matchMedia('(min-width: 992px)');
    var lastY = window.scrollY;
    var ticking = false;

    // Park (but do not show) the bar when the page opens mid-scroll: a reload,
    // a back navigation or an anchor link restores the scroll position before
    // any scroll event, and a resize can cross the breakpoint mid-page.
    function sync() {
      lastY = window.scrollY;
      nav.classList.remove('is-visible');
      nav.classList.toggle('is-fixed', desktop.matches && lastY > nav.offsetHeight);
    }

    function update() {
      ticking = false;
      var y = window.scrollY;
      if (!desktop.matches) {
        nav.classList.remove('is-fixed', 'is-visible');
        lastY = y;
        return;
      }
      // Ignore trackpad jitter so the bar does not flicker.
      if (Math.abs(y - lastY) < 4) return;
      if (y < lastY) {
        if (y > 0 && nav.classList.contains('is-fixed')) nav.classList.add('is-visible');
        else nav.classList.remove('is-fixed', 'is-visible');
      } else {
        // Hiding or parking the bar must not leave an open "Projeler" menu
        // hanging into the viewport.
        closeNavDropdowns();
        nav.classList.remove('is-visible');
        if (y > nav.offsetHeight && !nav.classList.contains('is-fixed')) nav.classList.add('is-fixed');
      }
      lastY = y;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    window.addEventListener('pageshow', sync);
    if (desktop.addEventListener) desktop.addEventListener('change', sync);
    sync();
  }

  // ---------------------------------------------------------------------------
  // Mobile navbar: toggle .show on the responsive collapse target.
  // Replaces the Bootstrap 4 jQuery collapse handler so we can drop tooltip
  // initialization without losing the menu toggle.
  // ---------------------------------------------------------------------------
  function initNavbarToggle() {
    var btn = document.querySelector('.navbar-toggler');
    var target = document.getElementById('navbarResponsive');
    if (!btn || !target) return;

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var isOpen = target.classList.toggle('show');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // ---------------------------------------------------------------------------
  // Navbar dropdowns: vanilla JS replacement for Bootstrap 4 jQuery dropdown.
  // ---------------------------------------------------------------------------
  function closeNavDropdowns() {
    document.querySelectorAll('.nav-item.dropdown.show').forEach(function (el) {
      el.classList.remove('show');
      var t = el.querySelector('[data-toggle="dropdown"]');
      if (t) t.setAttribute('aria-expanded', 'false');
      var m = el.querySelector('.dropdown-menu');
      if (m) m.classList.remove('show');
    });
  }

  function initNavbarDropdowns() {
    var toggles = document.querySelectorAll('[data-toggle="dropdown"]');
    if (!toggles.length) return;

    toggles.forEach(function (toggle) {
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var parentLi = toggle.closest('.dropdown');
        if (!parentLi) return;
        var menu = parentLi.querySelector('.dropdown-menu');
        if (!menu) return;
        var isOpen = parentLi.classList.contains('show');
        closeNavDropdowns();
        if (!isOpen) {
          parentLi.classList.add('show');
          menu.classList.add('show');
          toggle.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', closeNavDropdowns);

    // Escape closes an open dropdown and returns focus to its toggle.
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var openToggle = document.querySelector('.nav-item.dropdown.show [data-toggle="dropdown"]');
      if (!openToggle) return;
      closeNavDropdowns();
      openToggle.focus();
    });
  }

  // ---------------------------------------------------------------------------
  // Reading progress bar (post pages): fills as the reader scrolls the page
  // ---------------------------------------------------------------------------
  function initReadingProgress() {
    var bar = document.querySelector('.reading-progress__bar');
    if (!bar) return;

    var ticking = false;
    function update() {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var progress = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = 'scaleX(' + Math.min(Math.max(progress, 0), 1) + ')';
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    window.addEventListener('resize', update);
    // Re-sync when lazy-loaded content (e.g. giscus comments) changes the page height
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { update(); }).observe(document.body);
    }
    update();
  }

  // ---------------------------------------------------------------------------
  // Scroll reveal: post cards rise in as they enter the viewport.
  // Without JS (or with reduced motion) the `reveal-ready` class is never
  // added, so cards stay fully visible.
  // ---------------------------------------------------------------------------
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var items = document.querySelectorAll('.post-card');
    if (!items.length) return;

    document.documentElement.classList.add('reveal-ready');

    var observer = new IntersectionObserver(function (entries) {
      var delay = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        observer.unobserve(el);
        // Stagger items revealed in the same batch (e.g. initial viewport)
        setTimeout(function () { el.classList.add('is-revealed'); }, delay);
        delay += 70;
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });

    items.forEach(function (el) { observer.observe(el); });
  }

  // ---------------------------------------------------------------------------
  // Site search: overlay fed by /search.json, Turkish-folded substring match
  // ---------------------------------------------------------------------------
  function foldTr(text) {
    return text
      .toLocaleLowerCase('tr')
      .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u')
      .replace(/î/g, 'i').replace(/â/g, 'a').replace(/û/g, 'u');
  }

  function initSearch() {
    var modal = document.getElementById('search-modal');
    var input = document.getElementById('search-input');
    var resultsEl = document.getElementById('search-results');
    var emptyEl = document.getElementById('search-empty');
    if (!modal || !input || !resultsEl) return;

    var index = null;
    var loading = false;
    var lastFocus = null;
    var debounceTimer = null;

    function loadIndex() {
      if (index || loading) return;
      loading = true;
      fetch('/search.json')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          index = data.map(function (post) {
            return {
              post: post,
              title: foldTr(post.title),
              tags: foldTr((post.tag_names || []).join(' ')),
              body: foldTr([post.subtitle, post.excerpt, post.content].join(' '))
            };
          });
          loading = false;
          // Re-run the query typed while the index was downloading
          if (input.value) render(input.value);
        })
        .catch(function () { loading = false; });
    }

    function open() {
      lastFocus = document.activeElement;
      modal.hidden = false;
      void modal.offsetWidth;
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      input.focus();
      loadIndex();
    }

    function close() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      var onEnd = function () {
        modal.hidden = true;
        modal.removeEventListener('transitionend', onEnd);
      };
      modal.addEventListener('transitionend', onEnd);
      setTimeout(function () { modal.hidden = true; }, 400);
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    var statusEl = document.getElementById('search-status');
    function announceResults(text) {
      if (statusEl) statusEl.textContent = text;
    }

    function render(query) {
      resultsEl.textContent = '';
      emptyEl.hidden = true;
      var q = foldTr(query.trim());
      if (q.length < 2 || !index) { announceResults(''); return; }

      var scored = [];
      index.forEach(function (entry) {
        var score = 0;
        if (entry.title.indexOf(q) !== -1) score += 3;
        if (entry.tags.indexOf(q) !== -1) score += 2;
        if (entry.body.indexOf(q) !== -1) score += 1;
        if (score > 0) scored.push({ score: score, post: entry.post });
      });
      scored.sort(function (a, b) { return b.score - a.score; });

      if (!scored.length) {
        emptyEl.hidden = false;
        announceResults('Sonuç bulunamadı.');
        return;
      }
      announceResults(Math.min(scored.length, 8) + ' sonuç');

      scored.slice(0, 8).forEach(function (item) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = item.post.url;
        a.className = 'search-result';

        var title = document.createElement('span');
        title.className = 'search-result__title';
        title.textContent = item.post.title;

        var meta = document.createElement('span');
        meta.className = 'search-result__meta';
        meta.textContent = item.post.date_display +
          ((item.post.tag_names || []).length ? ' · ' + item.post.tag_names.join(', ') : '');

        a.appendChild(title);
        a.appendChild(meta);
        li.appendChild(a);
        resultsEl.appendChild(li);
      });
    }

    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () { render(input.value); }, 120);
    });

    // Keep Tab / Shift+Tab inside the dialog while it is open (aria-modal).
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusables = Array.prototype.filter.call(
        modal.querySelectorAll('input, button, a[href]'),
        function (el) { return el.offsetParent !== null; }
      );
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // Arrow keys move between the input and result links
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var links = resultsEl.querySelectorAll('a');
      if (!links.length) return;
      e.preventDefault();
      var list = Array.prototype.slice.call(links);
      var pos = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        (pos === -1 ? list[0] : list[Math.min(pos + 1, list.length - 1)]).focus();
      } else if (pos <= 0) {
        input.focus();
      } else {
        list[pos - 1].focus();
      }
    });

    document.querySelectorAll('.search-toggle').forEach(function (btn) {
      btn.addEventListener('click', open);
    });

    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-search-close]')) close();
    });

    document.addEventListener('keydown', function (e) {
      var isOpen = modal.classList.contains('is-open');
      if (e.key === 'Escape' && isOpen) {
        close();
        return;
      }
      var inField = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '') ||
        (document.activeElement && document.activeElement.isContentEditable);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        isOpen ? close() : open();
      } else if (e.key === '/' && !isOpen && !inField) {
        e.preventDefault();
        open();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Giscus: keep the embedded widget in sync with the site theme toggle
  // ---------------------------------------------------------------------------
  function initGiscusThemeSync() {
    if (!document.getElementById('giscus-container')) return;

    document.addEventListener('themechange', function (e) {
      var frame = document.querySelector('iframe.giscus-frame');
      if (!frame) return;
      frame.contentWindow.postMessage(
        { giscus: { setConfig: { theme: e.detail.theme } } },
        'https://giscus.app'
      );
    });
  }

  // ---------------------------------------------------------------------------
  // Share: copy-link button on post pages
  // ---------------------------------------------------------------------------
  function initShareCopy() {
    document.querySelectorAll('.share-copy').forEach(function (btn) {
      var feedback = btn.querySelector('.share-copy__feedback');

      btn.addEventListener('click', function () {
        var url = btn.getAttribute('data-share-url') || window.location.href;
        var done = function () {
          btn.classList.add('is-copied');
          if (feedback) feedback.textContent = 'Kopyalandı';
          setTimeout(function () {
            btn.classList.remove('is-copied');
            if (feedback) feedback.textContent = '';
          }, 1800);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done).catch(function () {
            fallbackCopy(url, done);
          });
        } else {
          fallbackCopy(url, done);
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Lightbox: click-to-zoom for post images (delegated, markup-agnostic)
  // ---------------------------------------------------------------------------
  function initLightbox() {
    var content = document.querySelector('.post-content');
    if (!content) return;

    var overlay = null;
    var lastFocus = null;

    function eligible(img) {
      return img && img.tagName === 'IMG' && !img.closest('a') && !img.closest('.mermaid');
    }

    // Zoom affordance on eligible images
    content.querySelectorAll('img').forEach(function (img) {
      if (eligible(img)) img.classList.add('is-zoomable');
    });

    function buildOverlay() {
      overlay = document.createElement('div');
      overlay.className = 'lightbox';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Görsel büyütme');
      overlay.hidden = true;

      var img = document.createElement('img');
      img.className = 'lightbox__img';
      img.alt = '';

      var caption = document.createElement('p');
      caption.className = 'lightbox__caption';

      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'lightbox__close';
      closeBtn.setAttribute('aria-label', 'Kapat');
      closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

      overlay.appendChild(closeBtn);
      overlay.appendChild(img);
      overlay.appendChild(caption);
      document.body.appendChild(overlay);

      overlay.addEventListener('click', close);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
      });
    }

    function open(sourceImg) {
      lastFocus = document.activeElement;
      if (!overlay) buildOverlay();

      var img = overlay.querySelector('.lightbox__img');
      var caption = overlay.querySelector('.lightbox__caption');
      img.src = sourceImg.currentSrc || sourceImg.src;
      // Aspect ratio drives the CSS size: the zoomed image fills the free
      // area (never smaller than it was inline).
      if (sourceImg.naturalWidth && sourceImg.naturalHeight) {
        img.style.setProperty('--ar', String(sourceImg.naturalWidth / sourceImg.naturalHeight));
      }
      caption.textContent = sourceImg.alt || '';
      caption.hidden = !sourceImg.alt;

      overlay.hidden = false;
      void overlay.offsetWidth;
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      overlay.querySelector('.lightbox__close').focus();
    }

    function close() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      var onEnd = function () {
        overlay.hidden = true;
        overlay.removeEventListener('transitionend', onEnd);
      };
      overlay.addEventListener('transitionend', onEnd);
      setTimeout(function () { overlay.hidden = true; }, 400);
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    content.addEventListener('click', function (e) {
      var img = e.target.closest('img');
      if (eligible(img)) open(img);
    });
  }

  // ---------------------------------------------------------------------------
  // Mermaid: load on demand and render with the active theme. Loading mermaid
  // ourselves (instead of letting it auto-start from <head>) lets us pick the
  // dark/light theme before the first render and re-render on theme changes.
  // ---------------------------------------------------------------------------
  function initMermaid() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.mermaid'));
    if (!nodes.length) return;

    // Read a diagram's source out of the DOM. Post bodies write the source as
    // raw HTML, so a `<br/>` inside a node label is parsed as a real <br>
    // element; textContent alone would drop it and glue the two lines into one
    // ("DESCRIPTIVENe oldu?"). Put the literal tag back so Mermaid still sees
    // the line break it was written with.
    //
    // jekyll-spaceship's table processor also backslash-escapes `[ ( * $ " _`
    // on every line that contains a `|`, including edge labels such as
    // `A -->|push| B[Repo]`. Mermaid then reads `B\` as the node id, so a later
    // plain `B` becomes a second, empty node. Strip those escapes back out.
    function sourceOf(n) {
      var clone = n.cloneNode(true);
      Array.prototype.forEach.call(clone.querySelectorAll('br'), function (br) {
        br.parentNode.replaceChild(document.createTextNode('<br/>'), br);
      });
      return clone.textContent.trim().split('\n').map(function (line) {
        return line.indexOf('|') === -1 ? line : line.replace(/\\([*$[("_])/g, '$1');
      }).join('\n');
    }

    // Stash each diagram's source before mermaid replaces it with an SVG.
    nodes.forEach(function (n) {
      if (!n.hasAttribute('data-mermaid-src')) {
        n.setAttribute('data-mermaid-src', sourceOf(n));
      }
    });

    function currentTheme() {
      return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default';
    }

    function render() {
      if (!window.mermaid) return;
      nodes.forEach(function (n) {
        n.removeAttribute('data-processed');
        // Diagram source is plain text (Mermaid reads textContent); assigning
        // via textContent avoids reinterpreting it as HTML.
        n.textContent = n.getAttribute('data-mermaid-src');
      });
      // Mermaid 12 switched flowcharts to the ELK layout and the "neo" look
      // with narrow (120px) label wrapping, which turns the posts' multi-line
      // nodes into tall, thin columns. Keep the classic dagre rendering the
      // diagrams were written for.
      window.mermaid.initialize({
        startOnLoad: false,
        theme: currentTheme(),
        look: 'classic',
        layout: 'dagre',
        flowchart: { look: 'classic', layout: 'dagre', wrappingWidth: 200 }
      });
      try {
        Promise.resolve(window.mermaid.run({ nodes: nodes }))
          .then(function () { darkenPastelClusters(); fixLabelContrast(); markZoomable(); })
          .catch(function () {});
      } catch (e) {}
    }

    // Posts colour nodes with inline `style X fill:#fde0e0` pastels. The dark
    // theme's light label text is unreadable on those (≈1.2:1), and a dark fill
    // would be just as bad in the light theme. After rendering, give each node
    // whose label contrast is below 4.5:1 a dark or light ink, whichever reads.
    function luminance(rgb) {
      var c = rgb.map(function (v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    }

    function parseRgb(str) {
      var m = (str || '').match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      var p = m[1].split(',').map(parseFloat);
      if (p.length > 3 && p[3] === 0) return null;
      return p.slice(0, 3);
    }

    function contrast(a, b) {
      var la = luminance(a), lb = luminance(b);
      return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
    }

    function fixLabelContrast() {
      var DARK = [26, 29, 35], LIGHT = [245, 247, 250];
      nodes.forEach(function (n) {
        n.querySelectorAll('g.node, g.cluster').forEach(function (g) {
          var shape = g.querySelector('rect, polygon, path, circle, ellipse');
          var fill = shape && parseRgb(getComputedStyle(shape).fill);
          if (!fill) return;
          var labels = g.querySelectorAll('.nodeLabel, .cluster-label span, text');
          labels.forEach(function (el) {
            var ink = parseRgb(getComputedStyle(el).color);
            if (ink && contrast(ink, fill) >= 4.5) return;
            var pick = contrast(DARK, fill) >= contrast(LIGHT, fill) ? DARK : LIGHT;
            var css = 'rgb(' + pick.join(',') + ')';
            el.style.setProperty('color', css, 'important');
            if (el.tagName.toLowerCase() === 'text') el.style.setProperty('fill', css, 'important');
          });
        });
      });
    }

    // Posts colour subgraphs with inline pastel fills (`style KF fill:#e8f0fb`).
    // In the dark theme those stay glaring light boxes and the theme's light
    // edge strokes vanish on them (≈1.3:1). Turn such clusters into a dark
    // tint of the same hue so the arrows inside read again.
    function darkenPastelClusters() {
      if (currentTheme() !== 'dark') return;
      nodes.forEach(function (n) {
        n.querySelectorAll('g.cluster > rect, g.cluster > path').forEach(function (shape) {
          var fill = parseRgb(getComputedStyle(shape).fill);
          if (!fill || luminance(fill) < 0.5) return;
          var r = fill[0] / 255, g = fill[1] / 255, b = fill[2] / 255;
          var max = Math.max(r, g, b), min = Math.min(r, g, b), h = 0;
          if (max !== min) {
            var d = max - min;
            h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
          }
          shape.style.setProperty('fill', 'hsl(' + Math.round(h * 60) + ', 30%, 17%)', 'important');
        });
      });
    }

    // Mermaid scales a wide diagram down to the column, so the whole diagram
    // is always visible. Below 75% its labels get hard to read (4–7px on
    // phones): such diagrams get a "Büyüt" button (or a click on the diagram)
    // that opens them at a readable size in a dialog where they can be panned.
    var ZOOM_BELOW = 0.75;
    var EXPAND_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';

    function naturalWidth(svg) {
      var vb = svg && svg.viewBox && svg.viewBox.baseVal;
      return vb && vb.width ? vb.width : 0;
    }

    function markZoomable() {
      nodes.forEach(function (n) {
        var svg = n.querySelector('svg');
        var natural = naturalWidth(svg);
        var small = natural > 0 && svg.getBoundingClientRect().width / natural < ZOOM_BELOW;
        var btn = n.querySelector('.mermaid-zoom');
        n.classList.toggle('is-zoomable', small);
        if (small && !btn) {
          btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'mermaid-zoom';
          btn.innerHTML = EXPAND_ICON + '<span>Büyüt</span>';
          btn.setAttribute('aria-label', 'Diyagramı büyüt');
          n.appendChild(btn);
        } else if (!small && btn) {
          n.removeChild(btn);
        }
        if (!n.hasAttribute('data-zoom-bound')) {
          n.setAttribute('data-zoom-bound', '');
          n.addEventListener('click', function (e) {
            if (n.classList.contains('is-zoomable') &&
                (e.target.closest('.mermaid-zoom') || e.target.closest('svg'))) openZoom(n);
          });
        }
      });
    }

    var dialog = null;
    var lastFocus = null;

    function closeZoom() {
      dialog.classList.remove('is-open');
      dialog.hidden = true;
      dialog.querySelector('.lightbox__diagram').textContent = '';
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    function buildDialog() {
      dialog = document.createElement('div');
      dialog.className = 'lightbox lightbox--diagram';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-label', 'Diyagram büyütme');
      dialog.hidden = true;
      dialog.innerHTML =
        '<button type="button" class="lightbox__close" aria-label="Kapat"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
        // The pan area is focusable so arrow keys scroll it.
        '<div class="lightbox__diagram mermaid" tabindex="0" role="group" aria-label="Diyagram"></div>';
      document.body.appendChild(dialog);
      var closeBtn = dialog.querySelector('.lightbox__close');
      var box = dialog.querySelector('.lightbox__diagram');
      closeBtn.addEventListener('click', closeZoom);
      dialog.addEventListener('click', function (e) { if (e.target === dialog) closeZoom(); });
      document.addEventListener('keydown', function (e) {
        if (dialog.hidden) return;
        if (e.key === 'Escape') {
          closeZoom();
        } else if (e.key === 'Tab') {
          // Keep focus inside the dialog: close button <-> pan area.
          e.preventDefault();
          (document.activeElement === closeBtn ? box : closeBtn).focus();
        }
      });
    }

    function openZoom(n) {
      var svg = n.querySelector('svg');
      var natural = naturalWidth(svg);
      if (!natural) return;
      lastFocus = document.activeElement;
      if (!dialog) buildDialog();
      var box = dialog.querySelector('.lightbox__diagram');
      var clone = svg.cloneNode(true);
      // Fill the screen width, but never below 70% of the natural size (the
      // pan area scrolls instead) nor above 100% (no blurry upscaling).
      clone.style.maxWidth = natural + 'px';
      clone.style.width = 'max(100%, ' + Math.round(natural * 0.7) + 'px)';
      box.textContent = '';
      box.appendChild(clone);
      dialog.hidden = false;
      void dialog.offsetWidth;
      dialog.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      dialog.querySelector('.lightbox__close').focus();
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(markZoomable, 200);
    });

    var loaded = false;
    function load() {
      if (loaded) return;
      loaded = true;
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/mermaid@12.0.0/dist/mermaid.min.js';
      s.integrity = 'sha512-0uJL5EivCQYBDuqMMniV+WcmAuSDOwYmKZmMvr62gjH9drRRCnRJL2hu8Z/G99IV4MBL2icNYHE5xs1EXlFmjw==';
      s.crossOrigin = 'anonymous';
      s.onload = render;
      document.head.appendChild(s);
    }

    load();
    document.addEventListener('themechange', function () {
      if (window.mermaid) render();
    });
  }

  // ---------------------------------------------------------------------------
  // Plotly: charts are authored with light backgrounds. In dark mode, keep the
  // hand-tuned light figure but frame it so it reads as a deliberate figure
  // rather than a glaring untreated block. Re-fit on theme change so Plotly
  // recomputes the responsive size after the framing margin shifts.
  // ---------------------------------------------------------------------------
  function initPlotlyTheme() {
    if (!window.Plotly) return;
    document.addEventListener('themechange', function () {
      document.querySelectorAll('.js-plotly-plot').forEach(function (gd) {
        try { window.Plotly.Plots.resize(gd); } catch (e) {}
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Plotly never wraps titles, so on phones a long chart or x-axis title runs
  // past the figure edge and is clipped. When one doesn't fit, break it at
  // word boundaries (growing that margin by the added lines); the authored
  // text and margins come back once the figure is wide enough again.
  // ---------------------------------------------------------------------------
  function initPlotlyTitles() {
    if (!window.Plotly) return;
    var LINE = 1.3; // Plotly's line spacing, in font sizes
    var ctx = document.createElement('canvas').getContext('2d');

    function width(text, font) {
      ctx.font = font.size + 'px ' + font.family;
      return ctx.measureText(text).width;
    }

    function wrap(text, font, max) {
      var lines = [], line = '';
      text.split(' ').forEach(function (word) {
        var next = line ? line + ' ' + word : word;
        if (line && width(next, font) > max) { lines.push(line); line = word; } else { line = next; }
      });
      lines.push(line);
      return lines;
    }

    function fit(gd) {
      var full = gd._fullLayout;
      if (!full || !full.xaxis) return;
      var orig = gd._titleFit || (gd._titleFit = {
        title: full.title.text, x: full.xaxis.title.text, t: full.margin.t, b: full.margin.b
      });
      var W = full.width, size = full._size;
      var update = {};

      function plan(text, font, avail, key, marginKey, base, current) {
        if (!text || text.indexOf('<') !== -1) return; // leave authored markup alone
        var lines = width(text, font) > avail ? wrap(text, font, avail) : [text];
        var next = lines.join('<br>');
        if (next === current) return;
        update[key] = next;
        update[marginKey] = base + Math.round((lines.length - 1) * font.size * LINE);
      }

      // The chart title is centred on the figure, the x-axis title on the plot.
      plan(orig.title, full.title.font, W - 16, 'title.text', 'margin.t', orig.t, full.title.text);
      var cx = size.l + size.w / 2;
      plan(orig.x, full.xaxis.title.font, 2 * Math.min(cx, W - cx) - 8,
        'xaxis.title.text', 'margin.b', orig.b, full.xaxis.title.text);

      if (Object.keys(update).length) window.Plotly.relayout(gd, update);
    }

    document.querySelectorAll('.js-plotly-plot').forEach(function (gd) {
      if (typeof gd.on === 'function') gd.on('plotly_afterplot', function () { fit(gd); });
      fit(gd);
    });
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  // ---------------------------------------------------------------------------
  // Bayram splash — first-visit Kurban Bayramı greeting
  // ---------------------------------------------------------------------------
  function initBayramSplash() {
    var splash = document.getElementById('bayram-splash');
    if (!splash) return;

    var STORAGE_KEY = 'bayram_splash_2026_seen';
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') return;
    } catch (e) {}

    var lastFocus = document.activeElement;

    function open() {
      splash.hidden = false;
      // Force a reflow so the transition runs from the hidden state.
      void splash.offsetWidth;
      splash.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      var closeBtn = splash.querySelector('.bayram-splash__close');
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      splash.classList.remove('is-open');
      document.body.style.overflow = '';
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}

      var onEnd = function () {
        splash.hidden = true;
        splash.removeEventListener('transitionend', onEnd);
      };
      splash.addEventListener('transitionend', onEnd);
      // Fallback in case transitionend doesn't fire.
      setTimeout(function () { splash.hidden = true; }, 400);

      if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus();
      }
    }

    splash.addEventListener('click', function (e) {
      var target = e.target.closest('[data-bayram-close]');
      if (target) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && splash.classList.contains('is-open')) close();
    });

    open();
  }

  ready(function () {
    initThemeToggle();
    initCodeEnhancements();
    initContentA11y();
    initPostToc();
    initHeadingAnchors();
    initScrollTop();
    initNavbarToggle();
    initNavbarScroll();
    initNavbarDropdowns();
    initBayramSplash();
    initReadingProgress();
    initScrollReveal();
    initSearch();
    initShareCopy();
    initLightbox();
    initGiscusThemeSync();
    initMermaid();
    initPlotlyTheme();
    initPlotlyTitles();
  });
})();

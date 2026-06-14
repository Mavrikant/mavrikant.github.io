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

      // Copy button
      if (block.querySelector('.copy-code-btn')) return;
      var pre = block.querySelector('pre');
      if (!pre) return;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-code-btn';
      btn.setAttribute('aria-label', 'Copy code to clipboard');
      btn.textContent = 'Copy';

      btn.addEventListener('click', function () {
        var code = pre.innerText;
        var done = function () {
          btn.textContent = 'Copied';
          btn.classList.add('is-copied');
          setTimeout(function () {
            btn.textContent = 'Copy';
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

    headings.forEach(function (h) {
      if (!h.id) {
        var base = slugify(h.textContent || '') || 'section';
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
      a.textContent = h.textContent || '';
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

    // Scroll spy
    if (!('IntersectionObserver' in window)) return;

    var links = nav.querySelectorAll('a');
    var byId = {};
    links.forEach(function (l) { byId[l.dataset.target] = l; });

    var setActive = function (id) {
      links.forEach(function (l) { l.classList.remove('is-active'); });
      if (byId[id]) byId[id].classList.add('is-active');
    };

    var visible = new Set();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visible.add(e.target.id);
        else visible.delete(e.target.id);
      });
      // Pick the first visible heading (top-most in document order)
      for (var i = 0; i < headings.length; i++) {
        if (visible.has(headings[i].id)) {
          setActive(headings[i].id);
          return;
        }
      }
    }, { rootMargin: '-80px 0px -65% 0px', threshold: 0 });

    headings.forEach(function (h) { observer.observe(h); });
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
  function initNavbarDropdowns() {
    var toggles = document.querySelectorAll('[data-toggle="dropdown"]');
    if (!toggles.length) return;

    function closeAllDropdowns() {
      document.querySelectorAll('.nav-item.dropdown.show').forEach(function (el) {
        el.classList.remove('show');
        var t = el.querySelector('[data-toggle="dropdown"]');
        if (t) t.setAttribute('aria-expanded', 'false');
        var m = el.querySelector('.dropdown-menu');
        if (m) m.classList.remove('show');
      });
    }

    toggles.forEach(function (toggle) {
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var parentLi = toggle.closest('.dropdown');
        if (!parentLi) return;
        var menu = parentLi.querySelector('.dropdown-menu');
        if (!menu) return;
        var isOpen = parentLi.classList.contains('show');
        closeAllDropdowns();
        if (!isOpen) {
          parentLi.classList.add('show');
          menu.classList.add('show');
          toggle.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', closeAllDropdowns);
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

    function render(query) {
      resultsEl.textContent = '';
      emptyEl.hidden = true;
      var q = foldTr(query.trim());
      if (q.length < 2 || !index) return;

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
        return;
      }

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

    // Stash each diagram's source before mermaid replaces it with an SVG.
    nodes.forEach(function (n) {
      if (!n.hasAttribute('data-mermaid-src')) {
        n.setAttribute('data-mermaid-src', n.textContent.trim());
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
      window.mermaid.initialize({ startOnLoad: false, theme: currentTheme() });
      try { window.mermaid.run({ nodes: nodes }); } catch (e) {}
    }

    var loaded = false;
    function load() {
      if (loaded) return;
      loaded = true;
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.12.0/mermaid.min.js';
      s.integrity = 'sha512-5TKaYvhenABhlGIKSxAWLFJBZCSQw7HTV7aL1dJcBokM/+3PNtfgJFlv8E6Us/B1VMlQ4u8sPzjudL9TEQ06ww==';
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
    initPostToc();
    initHeadingAnchors();
    initScrollTop();
    initNavbarToggle();
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
  });
})();

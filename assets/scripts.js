$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

(function () {
  // ---------------------------------------------------------------------------
  // Theme toggle (light/dark)
  // ---------------------------------------------------------------------------
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
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
  // Copy-to-clipboard buttons on code blocks
  // ---------------------------------------------------------------------------
  function initCodeCopyButtons() {
    var blocks = document.querySelectorAll('div.highlight, figure.highlight, .highlight');
    blocks.forEach(function (block) {
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initThemeToggle();
      initCodeCopyButtons();
    });
  } else {
    initThemeToggle();
    initCodeCopyButtons();
  }
})();

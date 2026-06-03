/* Lineer Kalman Filtresi — etkileşimli simülatör.
   Sabit-hız modeli (durum = [konum, hız]); yalnızca konum ölçülüyor.
   2x2 matrisler elle açılmış; harici kütüphane yok. Saf Canvas 2D.
   JS, jekyll-spaceship/kramdown'ın script içindeki '[' ve '(' karakterlerini
   bozmaması için ayrı dosyaya çıkarıldı (bkz. bandpass-sampling.js). */
(function () {
  var el = {
    R: document.getElementById('kf-sl-R'),
    Q: document.getElementById('kf-sl-Q'),
    V: document.getElementById('kf-sl-V'),
    vR: document.getElementById('kf-v-R'),
    vQ: document.getElementById('kf-v-Q'),
    vV: document.getElementById('kf-v-V'),
    play: document.getElementById('kf-btn-play'),
    reset: document.getElementById('kf-btn-reset'),
    st: document.getElementById('kf-status'),
    cv: document.getElementById('kf-canvas')
  };
  if (!el.cv) return;
  var ctx = el.cv.getContext('2d');

  var dt = 1.0;
  var WIN = 90;            // görünür adım penceresi
  var STEP_EVERY = 6;      // kaç frame'de bir filtre adımı (~10 Hz)
  var TRUE_Q = 0.05;       // gerçek dünyanın (sabit) süreç gürültüsü

  var hist, k, truePos, trueVel, x0, x1, p00, p01, p11, sumSqErr, nErr;
  var running = true, frame = 0, lastInfo = null;

  function randn() {            // Box-Muller ile standart normal
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function rnd(v, d) { var p = Math.pow(10, d == null ? 2 : d); return Math.round(v * p) / p; }

  function reset() {
    hist = []; k = 0;
    truePos = 0; trueVel = +el.V.value;
    x0 = 0; x1 = 0; p00 = 500; p01 = 0; p11 = 500;   // belirsiz başlangıç
    sumSqErr = 0; nErr = 0; frame = 0; lastInfo = null;
  }

  function params() {
    var sigma = +el.R.value, R = sigma * sigma;       // ölçüm gürültüsü
    var q = +el.Q.value;                              // filtrenin VARSAYDIĞI süreç gürültüsü
    return {
      R: R, q: q,
      Q00: q * dt * dt * dt * dt / 4,                 // beyaz-gürültü ivme modeli (dt=1)
      Q01: q * dt * dt * dt / 2,
      Q11: q * dt * dt
    };
  }

  function stepSim() {
    var pr = params();
    // --- gerçek dünya: hız, slider değerine doğru çekilen bir rastgele yürüyüş ---
    trueVel += TRUE_Q * randn();
    trueVel += 0.04 * ((+el.V.value) - trueVel);
    truePos += trueVel * dt;
    var z = truePos + Math.sqrt(pr.R) * randn();      // gürültülü ölçüm

    // --- TAHMİN  (F = [[1, dt],[0, 1]]) ---
    var xp0 = x0 + x1 * dt;
    var xp1 = x1;
    var pp00 = p00 + 2 * dt * p01 + dt * dt * p11 + pr.Q00;   // F P Fᵀ + Q
    var pp01 = p01 + dt * p11 + pr.Q01;
    var pp11 = p11 + pr.Q11;

    // --- GÜNCELLEME  (H = [1, 0]) ---
    var y = z - xp0;                 // yenilik (innovation)
    var S = pp00 + pr.R;
    var k0 = pp00 / S;               // Kalman kazancı bileşenleri
    var k1 = pp01 / S;
    x0 = xp0 + k0 * y;
    x1 = xp1 + k1 * y;
    p00 = (1 - k0) * pp00;           // P = (I - K H) P⁻
    p01 = (1 - k0) * pp01;
    p11 = pp11 - k1 * pp01;

    var sd = Math.sqrt(Math.max(p00, 0));
    var e = x0 - truePos; sumSqErr += e * e; nErr++;
    hist.push({ k: k, truth: truePos, meas: z, est: x0, sd: sd });
    if (hist.length > WIN) hist.shift();
    k++;
    return { k0: k0, p00: p00 };
  }

  function paint() {
    var W = el.cv.parentElement.clientWidth - 32, H = 340;
    var dpr = window.devicePixelRatio || 1;
    el.cv.width = W * dpr; el.cv.height = H * dpr;
    el.cv.style.width = W + 'px'; el.cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    var PL = 46, PR = 12, PT = 12, PB = 26;
    var pw = W - PL - PR, ph = H - PT - PB;

    var ymin = 1e9, ymax = -1e9;
    hist.forEach(function (h) {
      ymin = Math.min(ymin, h.truth, h.meas, h.est - 2 * h.sd);
      ymax = Math.max(ymax, h.truth, h.meas, h.est + 2 * h.sd);
    });
    if (!isFinite(ymin)) { ymin = -5; ymax = 5; }
    var pad = (ymax - ymin) * 0.1 + 1e-6; ymin -= pad; ymax += pad;

    var k0v = hist.length ? hist[0].k : 0;
    var kNv = hist.length ? hist[hist.length - 1].k : WIN;
    var span = Math.max(WIN - 1, kNv - k0v);
    function X(kk) { return PL + (kk - k0v) / span * pw; }
    function Y(v) { return PT + (ymax - v) / (ymax - ymin) * ph; }

    ctx.fillStyle = '#fcfcfd'; ctx.fillRect(PL, PT, pw, ph);
    ctx.font = '10px system-ui,sans-serif';
    for (var i = 0; i <= 4; i++) {
      var gy = PT + ph * i / 4, gv = ymax - (ymax - ymin) * i / 4;
      ctx.strokeStyle = '#eef0f3'; ctx.beginPath(); ctx.moveTo(PL, gy); ctx.lineTo(PL + pw, gy); ctx.stroke();
      ctx.fillStyle = '#999'; ctx.textAlign = 'right'; ctx.fillText(rnd(gv, 0), PL - 6, gy + 3);
    }

    if (hist.length > 1) {
      ctx.fillStyle = 'rgba(21,101,192,0.15)';     // ±2σ güven bandı
      ctx.beginPath();
      hist.forEach(function (h, i) { var x = X(h.k), y = Y(h.est + 2 * h.sd); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
      for (var j = hist.length - 1; j >= 0; j--) { var h = hist[j]; ctx.lineTo(X(h.k), Y(h.est - 2 * h.sd)); }
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = '#2e7d32'; ctx.lineWidth = 2;   // gerçek konum
      ctx.beginPath();
      hist.forEach(function (h, i) { var x = X(h.k), y = Y(h.truth); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
      ctx.stroke();

      ctx.strokeStyle = '#1565c0'; ctx.lineWidth = 2;   // KF kestirimi
      ctx.beginPath();
      hist.forEach(function (h, i) { var x = X(h.k), y = Y(h.est); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(220,53,69,0.6)';            // ölçümler
    hist.forEach(function (h) { ctx.beginPath(); ctx.arc(X(h.k), Y(h.meas), 2.6, 0, 2 * Math.PI); ctx.fill(); });

    ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; ctx.strokeRect(PL, PT, pw, ph);
    ctx.fillStyle = '#888'; ctx.textAlign = 'center'; ctx.fillText('adım (k)', PL + pw / 2, H - 6);

    var lx = PL + 8, ly = PT + 12;
    function sw(c, t) { ctx.fillStyle = c; ctx.fillRect(lx, ly - 8, 12, 9); ctx.fillStyle = '#444'; ctx.textAlign = 'left'; ctx.fillText(t, lx + 16, ly); ly += 15; }
    sw('#2e7d32', 'gerçek konum'); sw('#1565c0', 'KF kestirimi');
    sw('rgba(220,53,69,0.75)', 'ölçüm'); sw('rgba(21,101,192,0.3)', '±2σ band');
  }

  function status() {
    if (!lastInfo) { el.st.innerHTML = '&nbsp;'; return; }
    var rmse = nErr ? Math.sqrt(sumSqErr / nErr) : 0;
    el.st.innerHTML = 'Kalman kazancı K[konum] = <b>' + rnd(lastInfo.k0, 3) +
      '</b> &nbsp;|&nbsp; P[0,0] = <b>' + rnd(lastInfo.p00, 2) +
      '</b> &nbsp;|&nbsp; anlık konum RMSE = <b>' + rnd(rmse, 3) + '</b>';
  }

  function loop() {
    frame++;
    if (running && frame % STEP_EVERY === 0) { lastInfo = stepSim(); status(); }
    paint();
    requestAnimationFrame(loop);
  }

  function syncReadouts() {
    el.vR.textContent = (+el.R.value).toFixed(1);
    el.vQ.textContent = (+el.Q.value).toFixed(4);
    el.vV.textContent = (+el.V.value).toFixed(1);
  }
  [el.R, el.Q, el.V].forEach(function (s) { s.addEventListener('input', syncReadouts); });
  el.play.addEventListener('click', function () {
    running = !running; el.play.textContent = running ? '⏸ Duraklat' : '▶ Oynat';
  });
  el.reset.addEventListener('click', function () { reset(); syncReadouts(); });
  window.addEventListener('resize', paint);

  syncReadouts(); reset();
  requestAnimationFrame(loop);
})();

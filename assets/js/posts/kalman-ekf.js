/* Genişletilmiş Kalman Filtresi (EKF) — etkileşimli simülatör.
   2B sabit-hız hedefi; orijindeki sensör menzil (r) ve açı (θ) ölçüyor.
   Ölçüm h(x) = [hypot(px,py), atan2(py,px)] doğrusal-olmayan; her adımda
   Jacobian H_k değerlendirilir. Küçük sabit-boyutlu matris işlemleri elle.
   Saf Canvas 2D; harici kütüphane yok. JS ayrı dosyaya çıkarıldı. */
(function () {
  var el = {
    sr: document.getElementById('ekf-sl-sr'),
    sth: document.getElementById('ekf-sl-sth'),
    q: document.getElementById('ekf-sl-q'),
    turn: document.getElementById('ekf-sl-turn'),
    vsr: document.getElementById('ekf-v-sr'),
    vsth: document.getElementById('ekf-v-sth'),
    vq: document.getElementById('ekf-v-q'),
    vturn: document.getElementById('ekf-v-turn'),
    play: document.getElementById('ekf-btn-play'),
    reset: document.getElementById('ekf-btn-reset'),
    st: document.getElementById('ekf-status'),
    cv: document.getElementById('ekf-canvas')
  };
  if (!el.cv) return;
  var ctx = el.cv.getContext('2d');

  // ---- küçük matris yardımcıları (satır dizisi biçiminde) ----
  function mul(A, B) {
    var m = A.length, n = B.length, p = B[0].length, C = [];
    for (var i = 0; i < m; i++) { C[i] = []; for (var j = 0; j < p; j++) { var s = 0; for (var t = 0; t < n; t++) s += A[i][t] * B[t][j]; C[i][j] = s; } }
    return C;
  }
  function T(A) { var m = A.length, n = A[0].length, C = []; for (var j = 0; j < n; j++) { C[j] = []; for (var i = 0; i < m; i++) C[j][i] = A[i][j]; } return C; }
  function matvec(A, x) { var r = []; for (var i = 0; i < A.length; i++) { var s = 0; for (var t = 0; t < x.length; t++) s += A[i][t] * x[t]; r[i] = s; } return r; }
  function addM(A, B) { return A.map(function (r, i) { return r.map(function (v, j) { return v + B[i][j]; }); }); }
  function subM(A, B) { return A.map(function (r, i) { return r.map(function (v, j) { return v - B[i][j]; }); }); }
  function inv2(M) { var a = M[0][0], b = M[0][1], c = M[1][0], d = M[1][1]; var det = a * d - b * c; if (Math.abs(det) < 1e-12) det = det < 0 ? -1e-12 : 1e-12; var id = 1 / det; return [[d * id, -b * id], [-c * id, a * id]]; }
  function eye(n) { var I = []; for (var i = 0; i < n; i++) { I[i] = []; for (var j = 0; j < n; j++) I[i][j] = (i === j) ? 1 : 0; } return I; }

  var dt = 1.0;
  var F = [[1, 0, dt, 0], [0, 1, 0, dt], [0, 0, 1, 0], [0, 0, 0, 1]];
  var STEP_EVERY = 6, MAXK = 80;

  function randn() { var u = 0, v = 0; while (u === 0) u = Math.random(); while (v === 0) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function rnd(v, d) { var p = Math.pow(10, d == null ? 2 : d); return Math.round(v * p) / p; }
  function wrap(a) { a = (a + Math.PI) % (2 * Math.PI); if (a < 0) a += 2 * Math.PI; return a - Math.PI; }

  function h(x) { return [Math.hypot(x[0], x[1]), Math.atan2(x[1], x[0])]; }   // doğrusal-olmayan ölçüm
  function Hjac(x) {                                                            // ölçüm Jacobian'ı (2x4)
    var px = x[0], py = x[1], r2 = px * px + py * py, r = Math.sqrt(r2);
    if (r < 1e-6) r = 1e-6, r2 = 1e-12;
    return [[px / r, py / r, 0, 0], [-py / r2, px / r2, 0, 0]];
  }

  function Qmat() {                          // Q = G qa Gᵀ, beyaz-gürültü ivme
    var qa = +el.q.value, h2 = dt * dt / 2;
    var G = [[h2, 0], [0, h2], [dt, 0], [0, dt]];
    return mul(mul(G, [[qa, 0], [0, qa]]), T(G));
  }
  function Rmat() { var sr = +el.sr.value, sth = (+el.sth.value) * Math.PI / 180; return [[sr * sr, 0], [0, sth * sth]]; }

  var xt, xhat, P, truth, est, meas, k, sumSqErr, nErr;
  var running = true, frame = 0;

  function reset() {
    // gerçek hedef: orijinden uzakta, ekrana sığacak bir başlangıç (hafif rastgele)
    var ang = 2.4 + (Math.random() - 0.5) * 0.5;
    var rad = 27 + (Math.random() - 0.5) * 4;
    xt = [rad * Math.cos(ang), rad * Math.sin(ang), 1.3 + Math.random() * 0.3, 0.2 + Math.random() * 0.3];
    xhat = [xt[0] + 3 * randn(), xt[1] + 3 * randn(), 0, 0];
    P = [[16, 0, 0, 0], [0, 16, 0, 0], [0, 0, 9, 0], [0, 0, 0, 9]];
    truth = []; est = []; meas = []; k = 0; sumSqErr = 0; nErr = 0; frame = 0;
  }

  function stepSim() {
    var Q = Qmat(), R = Rmat();
    // --- gerçek dünya: sabit hız + yavaş dönüş ---
    var z = [h(xt)[0] + Math.sqrt(R[0][0]) * randn(), h(xt)[1] + Math.sqrt(R[1][1]) * randn()];
    truth.push([xt[0], xt[1]]); meas.push(z);
    xt = matvec(F, xt);
    var tr = (+el.turn.value) * Math.PI / 180, c = Math.cos(tr), s = Math.sin(tr);
    var vx = xt[2], vy = xt[3]; xt[2] = c * vx - s * vy; xt[3] = s * vx + c * vy;   // hız vektörünü döndür

    // --- EKF TAHMİN  (f doğrusal → F sabit) ---
    xhat = matvec(F, xhat);
    P = addM(mul(mul(F, P), T(F)), Q);
    // --- EKF GÜNCELLEME ---
    var Hk = Hjac(xhat);
    var hx = h(xhat);
    var y = [z[0] - hx[0], wrap(z[1] - hx[1])];        // açı farkını [-π, π]'ye sar
    var S = addM(mul(mul(Hk, P), T(Hk)), R);
    var K = mul(mul(P, T(Hk)), inv2(S));               // 4x2 Kalman kazancı
    xhat = [xhat[0] + K[0][0] * y[0] + K[0][1] * y[1],
            xhat[1] + K[1][0] * y[0] + K[1][1] * y[1],
            xhat[2] + K[2][0] * y[0] + K[2][1] * y[1],
            xhat[3] + K[3][0] * y[0] + K[3][1] * y[1]];
    P = mul(subM(eye(4), mul(K, Hk)), P);
    P = addM(P, T(P)).map(function (r) { return r.map(function (v) { return v / 2; }); });   // simetrikleştir

    est.push([xhat[0], xhat[1]]);
    var e0 = xhat[0] - truth[truth.length - 1][0], e1 = xhat[1] - truth[truth.length - 1][1];
    sumSqErr += e0 * e0 + e1 * e1; nErr++;
    k++;
    if (k >= MAXK || Math.hypot(xhat[0], xhat[1]) < 2) reset();
  }

  function paint() {
    var W = el.cv.parentElement.clientWidth - 32, H = 420;
    var dpr = window.devicePixelRatio || 1;
    el.cv.width = W * dpr; el.cv.height = H * dpr;
    el.cv.style.width = W + 'px'; el.cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fcfcfd'; ctx.fillRect(0, 0, W, H);

    // dünya sınırları (sensör + yörüngeler), eşit ölçek
    var xs = [0], ys = [0], i;
    for (i = 0; i < truth.length; i++) { xs.push(truth[i][0]); ys.push(truth[i][1]); }
    for (i = 0; i < est.length; i++) { xs.push(est[i][0]); ys.push(est[i][1]); }
    var minx = Math.min.apply(null, xs), maxx = Math.max.apply(null, xs);
    var miny = Math.min.apply(null, ys), maxy = Math.max.apply(null, ys);
    var cx = (minx + maxx) / 2, cy = (miny + maxy) / 2;
    var wspan = Math.max(maxx - minx, maxy - miny, 10) * 1.25;
    var sc = Math.min(W, H) / wspan;
    function w2s(px, py) { return [W / 2 + (px - cx) * sc, H / 2 - (py - cy) * sc]; }

    // grid
    ctx.strokeStyle = '#eef0f3'; ctx.lineWidth = 1;
    var gstep = Math.pow(10, Math.round(Math.log(wspan / 6) / Math.LN10));
    for (var gx = Math.ceil((cx - wspan / 2) / gstep) * gstep; gx <= cx + wspan / 2; gx += gstep) {
      var a = w2s(gx, cy - wspan); var b = w2s(gx, cy + wspan); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    for (var gy = Math.ceil((cy - wspan / 2) / gstep) * gstep; gy <= cy + wspan / 2; gy += gstep) {
      var a2 = w2s(cx - wspan, gy); var b2 = w2s(cx + wspan, gy); ctx.beginPath(); ctx.moveTo(a2[0], a2[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke();
    }

    // sensörden son ölçüme ışın
    if (meas.length) {
      var lm = meas[meas.length - 1]; var mpt = w2s(lm[0] * Math.cos(lm[1]), lm[0] * Math.sin(lm[1])); var o = w2s(0, 0);
      ctx.strokeStyle = 'rgba(220,53,69,0.35)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(mpt[0], mpt[1]); ctx.stroke(); ctx.setLineDash([]);
    }
    // ölçüm noktaları (menzil/açı → xy), son ~30
    ctx.fillStyle = 'rgba(220,53,69,0.5)';
    for (i = Math.max(0, meas.length - 30); i < meas.length; i++) {
      var mp = w2s(meas[i][0] * Math.cos(meas[i][1]), meas[i][0] * Math.sin(meas[i][1]));
      ctx.beginPath(); ctx.arc(mp[0], mp[1], 2.6, 0, 2 * Math.PI); ctx.fill();
    }
    // gerçek yörünge
    if (truth.length > 1) {
      ctx.strokeStyle = '#2e7d32'; ctx.lineWidth = 2; ctx.beginPath();
      for (i = 0; i < truth.length; i++) { var p = w2s(truth[i][0], truth[i][1]); if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); }
      ctx.stroke();
    }
    // EKF kestirimi
    if (est.length > 1) {
      ctx.strokeStyle = '#1565c0'; ctx.lineWidth = 2; ctx.beginPath();
      for (i = 0; i < est.length; i++) { var pe = w2s(est[i][0], est[i][1]); if (i === 0) ctx.moveTo(pe[0], pe[1]); else ctx.lineTo(pe[0], pe[1]); }
      ctx.stroke();
    }
    // 2σ kovaryans elipsi (konum bloğu)
    if (est.length) {
      var a = P[0][0], b = P[0][1], cc = P[1][1];
      var tt = (a + cc) / 2, dd = Math.sqrt(((a - cc) / 2) * ((a - cc) / 2) + b * b);
      var l1 = tt + dd, l2 = Math.max(tt - dd, 1e-9);
      var phi = Math.atan2(l1 - a, b);
      var ec = est[est.length - 1]; var center = w2s(ec[0], ec[1]);
      var A1 = 2 * Math.sqrt(l1) * sc, A2 = 2 * Math.sqrt(l2) * sc;  // 2σ yarı-eksenler (piksel)
      ctx.strokeStyle = 'rgba(21,101,192,0.7)'; ctx.fillStyle = 'rgba(21,101,192,0.12)'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var th = 0; th <= 2 * Math.PI + 0.01; th += 0.15) {
        var exx = Math.cos(th) * A1, eyy = Math.sin(th) * A2;   // ana/yan eksen bileşenleri (piksel)
        var rx = center[0] + exx * Math.cos(phi) - eyy * Math.sin(phi);
        var ry = center[1] - (exx * Math.sin(phi) + eyy * Math.cos(phi));   // ekran y'si ters
        if (th === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // güncel işaretçiler
      ctx.fillStyle = '#1565c0'; ctx.beginPath(); ctx.arc(center[0], center[1], 4, 0, 2 * Math.PI); ctx.fill();
    }
    if (truth.length) { var tc = w2s(truth[truth.length - 1][0], truth[truth.length - 1][1]); ctx.fillStyle = '#2e7d32'; ctx.beginPath(); ctx.arc(tc[0], tc[1], 4, 0, 2 * Math.PI); ctx.fill(); }
    // sensör
    var so = w2s(0, 0);
    ctx.fillStyle = '#333'; ctx.save(); ctx.translate(so[0], so[1]); ctx.rotate(Math.PI / 4); ctx.fillRect(-6, -6, 12, 12); ctx.restore();
    ctx.fillStyle = '#333'; ctx.font = '10px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('Sensör', so[0] + 9, so[1] + 4);

    // legend
    var lx = 10, ly = 16;
    ctx.font = '10px system-ui,sans-serif';
    function sw(c, t) { ctx.fillStyle = c; ctx.fillRect(lx, ly - 8, 12, 9); ctx.fillStyle = '#444'; ctx.textAlign = 'left'; ctx.fillText(t, lx + 16, ly); ly += 15; }
    sw('#2e7d32', 'gerçek yörünge'); sw('#1565c0', 'EKF kestirimi');
    sw('rgba(220,53,69,0.7)', 'ölçüm (r,θ→xy)'); sw('rgba(21,101,192,0.4)', '2σ elips');
  }

  function status() {
    if (!nErr) { el.st.innerHTML = '&nbsp;'; return; }
    var rmse = Math.sqrt(sumSqErr / nErr);
    var r = Math.hypot(xhat[0], xhat[1]);
    var psig = Math.sqrt(Math.max(P[0][0] + P[1][1], 0));
    el.st.innerHTML = 'konum RMSE = <b>' + rnd(rmse, 2) + ' m</b> &nbsp;|&nbsp; güncel menzil r = <b>' +
      rnd(r, 1) + ' m</b> &nbsp;|&nbsp; konum belirsizliği ≈ <b>' + rnd(psig, 2) + ' m</b>';
  }

  function loop() {
    frame++;
    if (running && frame % STEP_EVERY === 0) { stepSim(); status(); }
    paint();
    requestAnimationFrame(loop);
  }

  function syncReadouts() {
    el.vsr.textContent = (+el.sr.value).toFixed(2);
    el.vsth.textContent = (+el.sth.value).toFixed(1);
    el.vq.textContent = (+el.q.value).toFixed(4);
    el.vturn.textContent = (+el.turn.value).toFixed(1);
  }
  [el.sr, el.sth, el.q, el.turn].forEach(function (s) { s.addEventListener('input', syncReadouts); });
  el.play.addEventListener('click', function () { running = !running; el.play.textContent = running ? '⏸ Duraklat' : '▶ Oynat'; });
  el.reset.addEventListener('click', function () { reset(); syncReadouts(); });
  window.addEventListener('resize', paint);

  syncReadouts(); reset();
  requestAnimationFrame(loop);
})();

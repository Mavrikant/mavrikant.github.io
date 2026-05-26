(function () {
  // ====== Math helpers ======
  function logFact(n) {
    if (n <= 1) return 0;
    if (n < 200) {
      let s = 0;
      for (let i = 2; i <= n; i++) s += Math.log(i);
      return s;
    }
    return n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n);
  }
  function logBinomCoef(n, k) { return logFact(n) - logFact(k) - logFact(n - k); }

  // Lanczos gamma
  function gammaFn(z) {
    var g = 7;
    var c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
             771.32342877765313, -176.61502916214059, 12.507343278686905,
             -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gammaFn(1 - z));
    z -= 1;
    var x = c[0];
    for (var i = 1; i < g + 2; i++) x += c[i] / (z + i);
    var t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }
  function logGamma(z) { return Math.log(Math.abs(gammaFn(z))); }

  // ====== PMF / PDF ======
  function binomPMF(k, n, p) {
    if (k < 0 || k > n) return 0;
    if (p <= 0) return k === 0 ? 1 : 0;
    if (p >= 1) return k === n ? 1 : 0;
    return Math.exp(logBinomCoef(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
  }
  function poissonPMF(k, lam) {
    if (k < 0) return 0;
    return Math.exp(k * Math.log(lam) - lam - logFact(k));
  }
  function normalPDF(x, mu, s) {
    var z = (x - mu) / s;
    return Math.exp(-z * z / 2) / (s * Math.sqrt(2 * Math.PI));
  }
  function chiSqPDF(x, k) {
    if (x <= 0) return 0;
    return Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.log(2) - logGamma(k / 2));
  }
  function rayleighPDF(x, s) {
    if (x < 0) return 0;
    return (x / (s * s)) * Math.exp(-x * x / (2 * s * s));
  }
  function weibullPDF(x, k, lam) {
    if (x < 0) return 0;
    if (x === 0) return k === 1 ? 1 / lam : (k < 1 ? 1e9 : 0);
    return (k / lam) * Math.pow(x / lam, k - 1) * Math.exp(-Math.pow(x / lam, k));
  }

  // ====== Plotly defaults ======
  var baseLayout = {
    margin: { t: 25, b: 50, l: 60, r: 20 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Lora, serif', size: 13, color: '#2c3e50' },
    showlegend: false,
    hoverlabel: { bgcolor: '#fff', bordercolor: '#bbb' }
  };
  var baseConfig = { responsive: true, displayModeBar: false };
  function annot(text) {
    return [{
      x: 0.98, y: 0.95, xref: 'paper', yref: 'paper',
      text: text, showarrow: false, align: 'right',
      font: { size: 12, color: '#555' },
      bgcolor: 'rgba(255,255,255,0.7)', borderpad: 4
    }];
  }

  // ====== Plot functions ======
  function plotBernoulli() {
    var p = parseFloat(document.getElementById('ber-p').value);
    document.getElementById('ber-p-val').textContent = p.toFixed(2);
    var trace = {
      x: ['0 (başarısızlık)', '1 (başarı)'],
      y: [1 - p, p], type: 'bar',
      marker: { color: ['#c0392b', '#27ae60'] },
      text: [(1 - p).toFixed(3), p.toFixed(3)],
      textposition: 'outside',
      hovertemplate: '%{x}<br>P = %{y:.4f}<extra></extra>'
    };
    var layout = Object.assign({}, baseLayout, {
      yaxis: { title: 'P(X = k)', range: [0, 1.15] },
      xaxis: { title: '' },
      annotations: annot('E = ' + p.toFixed(2) + ' &nbsp;&nbsp; Var = ' + (p * (1 - p)).toFixed(3))
    });
    Plotly.react('ber-plot', [trace], layout, baseConfig);
  }

  function plotBinom() {
    var n = parseInt(document.getElementById('bin-n').value);
    var p = parseFloat(document.getElementById('bin-p').value);
    document.getElementById('bin-n-val').textContent = n;
    document.getElementById('bin-p-val').textContent = p.toFixed(2);
    var xs = [], ys = [];
    for (var k = 0; k <= n; k++) { xs.push(k); ys.push(binomPMF(k, n, p)); }
    var trace = {
      x: xs, y: ys, type: 'bar',
      marker: { color: '#2980b9' },
      hovertemplate: 'k = %{x}<br>P(X=k) = %{y:.4f}<extra></extra>'
    };
    var layout = Object.assign({}, baseLayout, {
      xaxis: { title: 'k', dtick: Math.max(1, Math.floor(n / 15)) },
      yaxis: { title: 'P(X = k)' },
      annotations: annot('E = ' + (n * p).toFixed(2) + ' &nbsp;&nbsp; Var = ' + (n * p * (1 - p)).toFixed(2))
    });
    Plotly.react('bin-plot', [trace], layout, baseConfig);
  }

  function plotPoisson() {
    var lam = parseFloat(document.getElementById('poi-l').value);
    document.getElementById('poi-l-val').textContent = lam.toFixed(1);
    var xmax = Math.max(10, Math.ceil(lam + 4 * Math.sqrt(lam)));
    var xs = [], ys = [];
    for (var k = 0; k <= xmax; k++) { xs.push(k); ys.push(poissonPMF(k, lam)); }
    var trace = {
      x: xs, y: ys, type: 'bar',
      marker: { color: '#8e44ad' },
      hovertemplate: 'k = %{x}<br>P(X=k) = %{y:.4f}<extra></extra>'
    };
    var layout = Object.assign({}, baseLayout, {
      xaxis: { title: 'k', dtick: Math.max(1, Math.floor(xmax / 15)) },
      yaxis: { title: 'P(X = k)' },
      annotations: annot('E = Var = ' + lam.toFixed(2))
    });
    Plotly.react('poi-plot', [trace], layout, baseConfig);
  }

  function plotUniform() {
    var a = parseFloat(document.getElementById('uni-a').value);
    var b = parseFloat(document.getElementById('uni-b').value);
    if (b <= a) b = a + 0.1;
    document.getElementById('uni-a-val').textContent = a.toFixed(1);
    document.getElementById('uni-b-val').textContent = b.toFixed(1);
    var h = 1 / (b - a);
    var xs = [a - 1.5, a, a, b, b, b + 1.5];
    var ys = [0, 0, h, h, 0, 0];
    var trace = {
      x: xs, y: ys, type: 'scatter', mode: 'lines',
      line: { color: '#16a085', width: 3, shape: 'linear' },
      fill: 'tozeroy', fillcolor: 'rgba(22,160,133,0.25)',
      hovertemplate: 'x = %{x:.2f}<br>f(x) = %{y:.3f}<extra></extra>'
    };
    var layout = Object.assign({}, baseLayout, {
      xaxis: { title: 'x' },
      yaxis: { title: 'f(x)', range: [0, Math.max(h * 1.4, 0.3)] },
      annotations: annot('E = ' + ((a + b) / 2).toFixed(2) +
        ' &nbsp;&nbsp; Var = ' + (((b - a) * (b - a)) / 12).toFixed(3))
    });
    Plotly.react('uni-plot', [trace], layout, baseConfig);
  }

  function plotNormal() {
    var mu = parseFloat(document.getElementById('nor-mu').value);
    var s = parseFloat(document.getElementById('nor-sigma').value);
    document.getElementById('nor-mu-val').textContent = mu.toFixed(1);
    document.getElementById('nor-sigma-val').textContent = s.toFixed(2);
    var xmin = -8, xmax = 8, N = 200;
    var xs = [], ys = [];
    for (var i = 0; i < N; i++) {
      var x = xmin + (xmax - xmin) * i / (N - 1);
      xs.push(x); ys.push(normalPDF(x, mu, s));
    }
    var trace = {
      x: xs, y: ys, type: 'scatter', mode: 'lines',
      line: { color: '#2c3e50', width: 3 },
      fill: 'tozeroy', fillcolor: 'rgba(44,62,80,0.18)',
      hovertemplate: 'x = %{x:.2f}<br>f(x) = %{y:.4f}<extra></extra>'
    };
    var layout = Object.assign({}, baseLayout, {
      xaxis: { title: 'x', range: [xmin, xmax] },
      yaxis: { title: 'f(x)' },
      annotations: annot('μ = ' + mu.toFixed(1) + ' &nbsp;&nbsp; σ = ' + s.toFixed(2))
    });
    Plotly.react('nor-plot', [trace], layout, baseConfig);
  }

  function plotChi() {
    var k = parseInt(document.getElementById('chi-k').value);
    document.getElementById('chi-k-val').textContent = k;
    var xmax = Math.max(20, k + 5 * Math.sqrt(2 * k));
    var N = 200, xs = [], ys = [];
    for (var i = 0; i < N; i++) {
      var x = 0.01 + xmax * i / (N - 1);
      xs.push(x); ys.push(chiSqPDF(x, k));
    }
    var trace = {
      x: xs, y: ys, type: 'scatter', mode: 'lines',
      line: { color: '#d35400', width: 3 },
      fill: 'tozeroy', fillcolor: 'rgba(211,84,0,0.18)',
      hovertemplate: 'x = %{x:.2f}<br>f(x) = %{y:.4f}<extra></extra>'
    };
    var layout = Object.assign({}, baseLayout, {
      xaxis: { title: 'x' },
      yaxis: { title: 'f(x)' },
      annotations: annot('df = ' + k + ' &nbsp; E = ' + k + ' &nbsp; Var = ' + (2 * k))
    });
    Plotly.react('chi-plot', [trace], layout, baseConfig);
  }

  function plotRayleigh() {
    var s = parseFloat(document.getElementById('ray-sigma').value);
    document.getElementById('ray-sigma-val').textContent = s.toFixed(1);
    var xmax = 5 * s, N = 200, xs = [], ys = [];
    for (var i = 0; i < N; i++) {
      var x = xmax * i / (N - 1);
      xs.push(x); ys.push(rayleighPDF(x, s));
    }
    var trace = {
      x: xs, y: ys, type: 'scatter', mode: 'lines',
      line: { color: '#c0392b', width: 3 },
      fill: 'tozeroy', fillcolor: 'rgba(192,57,43,0.18)',
      hovertemplate: 'r = %{x:.2f}<br>f(r) = %{y:.4f}<extra></extra>'
    };
    var mean = s * Math.sqrt(Math.PI / 2);
    var layout = Object.assign({}, baseLayout, {
      xaxis: { title: 'r' },
      yaxis: { title: 'f(r)' },
      annotations: annot('σ = ' + s.toFixed(2) + ' &nbsp;&nbsp; E[R] = ' + mean.toFixed(2))
    });
    Plotly.react('ray-plot', [trace], layout, baseConfig);
  }

  function plotWeibull() {
    var k = parseFloat(document.getElementById('wei-k').value);
    var lam = parseFloat(document.getElementById('wei-lam').value);
    document.getElementById('wei-k-val').textContent = k.toFixed(2);
    document.getElementById('wei-lam-val').textContent = lam.toFixed(1);
    var xmax = 4 * lam, N = 250, xs = [], ys = [];
    for (var i = 0; i < N; i++) {
      var x = (i === 0 ? 0.001 : xmax * i / (N - 1));
      xs.push(x); ys.push(weibullPDF(x, k, lam));
    }
    // clip extreme values for visualization stability
    var ymax = 0;
    for (var j = 0; j < ys.length; j++) if (ys[j] < 1e6 && ys[j] > ymax) ymax = ys[j];
    var ycap = ymax * 1.3;
    var trace = {
      x: xs, y: ys, type: 'scatter', mode: 'lines',
      line: { color: '#7d3c98', width: 3 },
      fill: 'tozeroy', fillcolor: 'rgba(125,60,152,0.18)',
      hovertemplate: 'x = %{x:.2f}<br>f(x) = %{y:.4f}<extra></extra>'
    };
    var mttf = lam * gammaFn(1 + 1 / k);
    var layout = Object.assign({}, baseLayout, {
      xaxis: { title: 'x', range: [0, xmax] },
      yaxis: { title: 'f(x)', range: [0, ycap] },
      annotations: annot('k = ' + k.toFixed(2) + ' &nbsp; λ = ' + lam.toFixed(1) +
        ' &nbsp; MTTF = ' + mttf.toFixed(2))
    });
    Plotly.react('wei-plot', [trace], layout, baseConfig);
  }

  // ====== Bind & init ======
  function bind(id, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', fn);
  }
  function init() {
    if (typeof Plotly === 'undefined') { setTimeout(init, 50); return; }
    bind('ber-p', plotBernoulli);
    bind('bin-n', plotBinom); bind('bin-p', plotBinom);
    bind('poi-l', plotPoisson);
    bind('uni-a', plotUniform); bind('uni-b', plotUniform);
    bind('nor-mu', plotNormal); bind('nor-sigma', plotNormal);
    bind('chi-k', plotChi);
    bind('ray-sigma', plotRayleigh);
    bind('wei-k', plotWeibull); bind('wei-lam', plotWeibull);
    plotBernoulli(); plotBinom(); plotPoisson(); plotUniform();
    plotNormal(); plotChi(); plotRayleigh(); plotWeibull();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();

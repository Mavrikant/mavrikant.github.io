// Merkezi Limit Teoremi yazısının grafikleri ve etkileşimli deneyi.
// Plotly (basic bundle) yazının başında yüklenir; bu dosya yazının sonunda çağrılır.
// Gömülü ölçüm verileri, yazıda verilen Python betiklerinin çıktısıdır.
(function () {
  'use strict';
  if (!window.Plotly) return;

  var MAVI = '#2a78d6', TURUNCU = '#eb6834', YESIL = '#1baf7a';
  var MUREKKEP = '#33332f', IKINCIL = '#6b6a66', IZGARA = '#ecebe7', EKSEN = '#c9c8c2';
  var YAZI = { family: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif', size: 13, color: IKINCIL };
  var AYAR = { responsive: true, displayModeBar: false };

  function dar() { return window.innerWidth < 576; }

  function tr(v, d) { return v.toFixed(d).replace('.', ','); }

  function normalPdf(x, mu, sigma) {
    var z = (x - mu) / sigma;
    return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
  }

  function aralik(a, b, adet) {
    var out = [];
    for (var i = 0; i < adet; i++) out.push(a + (b - a) * i / (adet - 1));
    return out;
  }

  function eksen(ek) {
    var e = {
      gridcolor: IZGARA, zeroline: false, linecolor: EKSEN, ticks: 'outside',
      tickcolor: EKSEN, ticklen: 4, automargin: true
    };
    for (var k in ek) { if (Object.prototype.hasOwnProperty.call(ek, k)) e[k] = ek[k]; }
    return e;
  }

  function duzen(ek) {
    var d = {
      font: YAZI, separators: ',.', plot_bgcolor: '#ffffff', paper_bgcolor: '#ffffff',
      margin: { l: 56, r: 16, t: 56, b: 66 }, bargap: 0.12, hovermode: 'closest',
      legend: { orientation: 'h', x: 0, y: 1.02, yanchor: 'bottom', font: { color: MUREKKEP } }
    };
    for (var k in ek) { if (Object.prototype.hasOwnProperty.call(ek, k)) d[k] = ek[k]; }
    return d;
  }

  // Dört küçük panel: geniş ekranda 2x2, dar ekranda alt alta.
  function dortlu(id, paneller, ortak) {
    var el = document.getElementById(id);
    if (!el) return;
    var tek = dar();
    el.style.height = (tek ? 980 : 500) + 'px';
    var veri = [], notlar = [];
    var d = duzen({
      margin: { l: 56, r: 16, t: 84, b: 66 },
      legend: { orientation: 'h', x: 0, y: 1.1, yanchor: 'bottom', font: { color: MUREKKEP } },
      grid: { rows: tek ? 4 : 2, columns: tek ? 1 : 2, pattern: 'independent', xgap: 0.14, ygap: tek ? 0.42 : 0.26 }
    });
    var sonSatir = tek ? paneller.length - 1 : paneller.length - 2;
    paneller.forEach(function (p, i) {
      var s = i === 0 ? '' : String(i + 1);
      p.izler.forEach(function (iz) {
        iz.xaxis = 'x' + s;
        iz.yaxis = 'y' + s;
        iz.showlegend = i === 0;
        veri.push(iz);
      });
      if (i < sonSatir) delete p.x.title;
      d['xaxis' + s] = eksen(p.x);
      d['yaxis' + s] = eksen(p.y);
      notlar.push({
        text: '<b>' + p.baslik + '</b>', showarrow: false, font: { size: 13, color: MUREKKEP },
        xref: 'x' + s + ' domain', yref: 'y' + s + ' domain', x: 0, y: 1.03, xanchor: 'left', yanchor: 'bottom'
      });
    });
    d.annotations = notlar;
    if (ortak) { for (var k in ortak) { if (Object.prototype.hasOwnProperty.call(ortak, k)) d[k] = ortak[k]; } }
    Plotly.newPlot(el, veri, d, AYAR);
  }

  // ---------------------------------------------------------------------------
  // Grafik 1 — zar toplamlarının tam (kesin) dağılımı ve normal yaklaşım
  // ---------------------------------------------------------------------------
  function zarDagilimi(n) {
    var p = [1];
    for (var k = 0; k < n; k++) {
      var q = [];
      for (var j = 0; j < p.length + 5; j++) q.push(0);
      for (var i = 0; i < p.length; i++) {
        for (var f = 0; f < 6; f++) q[i + f] += p[i] / 6;
      }
      p = q;
    }
    return p; // p[0] toplamın n olma olasılığı
  }

  function zarGrafigi() {
    var paneller = [1, 2, 3, 10].map(function (n) {
      var p = zarDagilimi(n);
      var xs = p.map(function (_, i) { return n + i; });
      var mu = 3.5 * n, sigma = Math.sqrt(35 * n / 12);
      var cx = aralik(n - 0.5, 6 * n + 0.5, 160);
      return {
        baslik: n + ' zar',
        izler: [
          { type: 'bar', x: xs, y: p, name: 'Kesin olasılık', legendgroup: 'kesin', marker: { color: MAVI },
            hovertemplate: 'toplam %{x}<br>olasılık %{y:.4f}<extra></extra>' },
          { type: 'scatter', mode: 'lines', x: cx, y: cx.map(function (x) { return normalPdf(x, mu, sigma); }),
            name: 'Aynı ortalama ve varyansa sahip normal eğri', legendgroup: 'normal',
            line: { color: MUREKKEP, width: 2 }, hoverinfo: 'skip' }
        ],
        x: { title: { text: 'zarların toplamı' }, dtick: n === 10 ? 10 : (n === 3 ? 3 : 1) },
        y: { rangemode: 'tozero', nticks: 5 }
      };
    });
    dortlu('grafik-zar', paneller);
  }

  // ---------------------------------------------------------------------------
  // Grafik 2 — Üstel(1) dağılımından n örneğin standartlaştırılmış ortalaması
  // (clt_sim.py, tohum 42, 100 000 tekrar; kutu genişliği 0,2; aralık [-3, 5])
  // ---------------------------------------------------------------------------
  var USTEL = {
    1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.904, 0.7356, 0.6102, 0.4981, 0.4088, 0.3349, 0.2695, 0.2231, 0.1874, 0.1488, 0.1197, 0.1011, 0.0852, 0.0659, 0.0563, 0.0437, 0.0396, 0.0301, 0.0237, 0.0197, 0.0184, 0.015, 0.0103, 0.0092, 0.0073, 0.0057, 0.0053, 0.0043, 0.004, 0.0022],
    2: [0, 0, 0, 0, 0, 0, 0, 0.0009, 0.1857, 0.4008, 0.4985, 0.5192, 0.5019, 0.4663, 0.4098, 0.3529, 0.3059, 0.2514, 0.2152, 0.1718, 0.1434, 0.1161, 0.0964, 0.0746, 0.0616, 0.0483, 0.0382, 0.0306, 0.0232, 0.0184, 0.0152, 0.0111, 0.0093, 0.0078, 0.0056, 0.0038, 0.0043, 0.0027, 0.0021, 0.0013],
    5: [0, 0, 0, 0, 0.001, 0.0152, 0.0595, 0.1351, 0.2178, 0.3093, 0.3654, 0.4195, 0.4306, 0.4358, 0.4024, 0.3839, 0.3285, 0.2882, 0.247, 0.207, 0.163, 0.1338, 0.1048, 0.0833, 0.0656, 0.0519, 0.0395, 0.0261, 0.0221, 0.0171, 0.0134, 0.0086, 0.0067, 0.0039, 0.0035, 0.0029, 0.0024, 0.0013, 0.001, 0.001],
    30: [0.0011, 0.0026, 0.0083, 0.0165, 0.0332, 0.059, 0.0886, 0.1397, 0.1955, 0.2432, 0.304, 0.3523, 0.382, 0.3968, 0.3997, 0.3869, 0.3639, 0.3232, 0.2838, 0.2359, 0.194, 0.1546, 0.1176, 0.093, 0.0675, 0.0478, 0.0378, 0.024, 0.0164, 0.0123, 0.0065, 0.0045, 0.0029, 0.0018, 0.0009, 0.0007, 0.0003, 0.0003, 0.0003, 0.0001]
  };

  function ustelGrafigi() {
    var merkez = [];
    for (var i = 0; i < 40; i++) merkez.push(Math.round((-2.9 + 0.2 * i) * 10) / 10);
    var cx = aralik(-3, 5, 161);
    var cy = cx.map(function (x) { return normalPdf(x, 0, 1); });
    var paneller = [1, 2, 5, 30].map(function (n) {
      return {
        baslik: 'n = ' + n,
        izler: [
          { type: 'bar', x: merkez, y: USTEL[n], name: 'Benzetim (100 000 ortalama)', legendgroup: 'olcum',
            marker: { color: MAVI }, hovertemplate: 'z ≈ %{x:.1f}<br>yoğunluk %{y:.3f}<extra></extra>' },
          { type: 'scatter', mode: 'lines', x: cx, y: cy, name: 'Standart normal N(0, 1)', legendgroup: 'normal',
            line: { color: MUREKKEP, width: 2 }, hoverinfo: 'skip' }
        ],
        x: { title: { text: 'standartlaştırılmış ortalama z' }, range: [-3, 5], dtick: 1 },
        y: { range: [0, 0.95], dtick: 0.2 }
      };
    });
    dortlu('grafik-ustel', paneller, { bargap: 0.08 });
  }

  // ---------------------------------------------------------------------------
  // Grafik 3 — %95'lik t-aralığının gerçek kapsama oranı (coverage.py, tohum 2026)
  // ---------------------------------------------------------------------------
  function kapsamaGrafigi() {
    var el = document.getElementById('grafik-kapsama');
    if (!el) return;
    var ns = [5, 10, 30, 100, 300, 1000];
    var seriler = [
      { ad: 'Düzgün(0, 1)', renk: MAVI, y: [93.5, 94.6, 94.9, 95.0, 95.0, 94.9] },
      { ad: 'Üstel(1)', renk: TURUNCU, y: [88.2, 89.9, 92.8, 94.1, 94.7, 94.9] },
      { ad: 'Log-normal(0, 1)', renk: YESIL, y: [82.1, 84.1, 88.3, 91.7, 93.6, 94.3] }
    ];
    var veri = seriler.map(function (s) {
      return {
        type: 'scatter', mode: 'lines+markers', x: ns, y: s.y, name: s.ad,
        line: { color: s.renk, width: 2 }, marker: { color: s.renk, size: 8, line: { color: '#ffffff', width: 2 } },
        hovertemplate: s.ad + '<br>n = %{x}<br>kapsama %%{y:.1f}<extra></extra>'
      };
    });
    var d = duzen({
      xaxis: eksen({ type: 'log', title: { text: 'örneklem büyüklüğü n (logaritmik)' }, tickvals: ns, ticktext: ns.map(String), range: [Math.log10(4), Math.log10(1300)] }),
      yaxis: eksen({ title: { text: 'gerçek kapsama (%)' }, range: [80, 96.5], dtick: 5 }),
      shapes: [{ type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 95, y1: 95, line: { color: MUREKKEP, width: 1 } }],
      annotations: [{ xref: 'paper', x: 0.01, y: 95, yanchor: 'bottom', xanchor: 'left', showarrow: false,
        text: 'vaat edilen: %95', font: { size: 12, color: MUREKKEP } }]
    });
    Plotly.newPlot(el, veri, d, AYAR);
  }

  // ---------------------------------------------------------------------------
  // Grafik 4 — koşan ortalama: Normal(0,1) ve Cauchy(0,1) (cauchy.py, tohum 42)
  // ---------------------------------------------------------------------------
  var KOSAN = {
    n: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 23, 24, 26, 28, 30, 32, 35, 37, 40, 43, 46, 50, 54, 58, 62, 67, 72, 77, 83, 89, 96, 103, 111, 119, 128, 138, 148, 159, 171, 184, 198, 212, 228, 245, 264, 284, 305, 328, 353, 379, 407, 438, 471, 506, 544, 585, 629, 676, 727, 782, 840, 904, 971, 1044, 1123, 1207, 1298, 1395, 1500, 1613, 1734, 1864, 2004, 2154, 2316, 2490, 2677, 2878, 3094, 3327, 3577, 3845, 4134, 4444, 4778, 5137, 5523, 5937, 6383, 6862, 7378, 7932, 8527, 9168, 9856, 10596, 11392, 12248, 13167, 14156, 15219, 16362, 17591, 18912, 20332, 21859, 23500, 25265, 27162, 29202, 31395, 33752, 36287, 39012, 41941, 45091, 48477, 52117, 56031, 60239, 64762, 69625, 74854, 80475, 86518, 93015, 100000],
    normal: [0.3047, -0.3676, 0.0051, 0.2389, -0.1991, -0.3829, -0.3099, -0.3107, -0.2781, -0.3356, -0.2251, -0.1415, -0.1256, -0.0361, -0.0025, -0.0561, -0.0311, -0.0826, -0.032, -0.0402, -0.0131, -0.019, -0.0476, -0.0121, 0.0168, 0.07, 0.0437, 0.0688, 0.0383, 0.05, 0.0591, 0.0912, 0.0686, 0.0658, 0.0306, 0.0568, 0.0222, 0.0206, 0.0179, 0.0047, -0.0229, -0.0433, -0.0595, -0.0589, -0.0394, -0.0674, -0.0595, -0.0542, -0.0572, -0.0435, -0.0299, -0.0443, -0.019, -0.0545, -0.05, -0.0278, -0.0382, -0.0076, -0.014, 0.0079, -0.0037, -0.0238, -0.0149, -0.0198, -0.0167, -0.0236, -0.0288, -0.0375, -0.0453, -0.0316, -0.0357, -0.0415, -0.0349, -0.0287, -0.019, -0.025, -0.0241, -0.0267, -0.0206, -0.0331, -0.0389, -0.0419, -0.0552, -0.049, -0.0457, -0.0452, -0.0327, -0.0304, -0.0241, -0.0171, -0.0175, -0.0128, -0.0181, -0.0169, -0.0157, -0.021, -0.0164, -0.0075, -0.0063, -0.005, -0.003, -0.0105, -0.0064, -0.0067, -0.0104, -0.0119, -0.0122, -0.0137, -0.0132, -0.0118, -0.0089, -0.0088, -0.0023, -0.0003, 0.0058, 0.0044, 0.0064, 0.0074, 0.0111, 0.0089, 0.0093, 0.0082, 0.0082, 0.0064, 0.0032, 0.0033, 0.0009, -0.0003, -0.001, -0.001, -0.001, -0.0003, -0.0015, -0.0018, -0.0023, -0.003, -0.0042],
    cauchy: [-0.6586, -1.4131, -1.4062, -18.6032, -15.1721, -12.777, -10.9688, -9.4825, -7.9978, -7.2131, -6.7536, -6.1022, -5.3045, -4.9814, -4.7201, -4.5853, -4.2764, -4.0797, -3.3527, 0.1673, 0.0984, 0.0563, 0.018, -0.0413, -0.5004, -0.7306, -0.7165, -0.9272, -0.8314, -0.7885, -0.81, -0.5434, -1.0263, -0.9535, -1.4427, -1.221, -1.3032, -1.4729, -1.2697, -0.6802, -0.8644, -0.8191, -0.6456, -0.6575, -0.7013, -1.8587, -1.7581, -1.7221, -1.5855, -1.4463, -1.3173, -1.248, -0.7977, -0.6947, -0.8184, -0.8069, -0.8144, -4.0671, -3.3837, -1.4284, -1.7212, -1.6104, -1.0687, -0.9452, -0.9613, -0.8591, -0.8134, -0.795, -0.155, -0.3171, -0.4032, 1.1064, 0.9528, 0.8006, 0.9509, 0.9196, 0.8545, 0.6895, 0.6583, -1.1639, -0.9258, -0.7585, -0.9725, -0.822, -0.7844, -0.7977, -0.7781, -0.7081, -0.924, -0.8387, -1.2832, -0.554, -0.6307, -0.6093, -0.5903, -0.4653, -0.3253, -0.287, -0.2621, -0.2139, -0.2053, -0.169, -0.0293, -0.0042, 0.099, 0.0227, -0.3999, -0.3057, -0.3212, -0.2043, 0.0312, 0.2012, 0.171, 0.1495, -0.1433, -0.1579, -0.146, -0.1322, -0.1909, -0.2248, -0.121, -0.8903, -0.808, -0.2784, -0.1526, -0.1768, -0.2503, -0.5441, -0.5546, -0.5188, -0.4881, -0.4666, -0.4256, -0.4102, -0.4178, -0.4691, -0.2267]
  };

  function cauchyGrafigi() {
    var el = document.getElementById('grafik-cauchy');
    if (!el) return;
    function iz(ad, y, renk) {
      return {
        type: 'scatter', mode: 'lines', x: KOSAN.n, y: y, name: ad, line: { color: renk, width: 2 },
        hovertemplate: ad + '<br>ilk %{x} örneğin ortalaması: %{y:.3f}<extra></extra>'
      };
    }
    var d = duzen({
      xaxis: eksen({ type: 'log', title: { text: 'örnek sayısı (logaritmik)' }, range: [0, 5],
        tickvals: [1, 10, 100, 1000, 10000, 100000], ticktext: ['1', '10', '100', '1000', '10 000', '100 000'] }),
      yaxis: eksen({ title: { text: 'o ana kadarki ortalama' }, zeroline: true, zerolinecolor: EKSEN, zerolinewidth: 1 }),
      annotations: [{
        x: Math.log10(33752), y: -0.8903, ax: -70, ay: 46, showarrow: true, arrowhead: 0, arrowwidth: 1, arrowcolor: IKINCIL,
        text: '33 143. örnek: −28 447', font: { size: 12, color: MUREKKEP }
      }]
    });
    Plotly.newPlot(el, [iz('Normal(0, 1)', KOSAN.normal, MAVI), iz('Cauchy(0, 1)', KOSAN.cauchy, TURUNCU)], d, AYAR);
  }

  // ---------------------------------------------------------------------------
  // Etkileşimli deney
  // ---------------------------------------------------------------------------
  var TEKRAR = 20000;

  function gauss() {
    var u = 1 - Math.random(), v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  var DAGILIMLAR = {
    duzgun: { mu: 0.5, sigma: Math.sqrt(1 / 12), alt: 0, ust: 1, uret: function () { return Math.random(); } },
    ustel: { mu: 1, sigma: 1, alt: 0, ust: 6, uret: function () { return -Math.log(1 - Math.random()); } },
    zar: { mu: 3.5, sigma: Math.sqrt(35 / 12), alt: 1, ust: 6, kafes: 1, uret: function () { return 1 + Math.floor(6 * Math.random()); } },
    ikitepe: { mu: 0.5, sigma: Math.sqrt(0.09 + 0.0064), alt: -0.1, ust: 1.1, uret: function () { return (Math.random() < 0.5 ? 0.2 : 0.8) + 0.08 * gauss(); } },
    lognormal: { mu: Math.exp(0.5), sigma: Math.sqrt((Math.E - 1) * Math.E), alt: 0, ust: 10, uret: function () { return Math.exp(gauss()); } },
    cauchy: { mu: null, sigma: null, alt: -10, ust: 10, uret: function () { return Math.tan(Math.PI * (Math.random() - 0.5)); } }
  };

  // Kutu kenarları. Kafesli (ayrık) dağılımda kutu genişliği kafes adımının tam
  // katı seçilir ve kenarlar kafes noktalarının arasına düşer; yoksa histogramda
  // sahte bir dalgalanma (moiré) oluşur.
  function kutular(lo, hi, hedef, adim) {
    var gen, bas;
    if (adim) {
      gen = adim * Math.max(1, Math.ceil((hi - lo) / adim / hedef));
      bas = (Math.ceil(lo / adim - 1e-9) - 0.5) * adim;
    } else {
      gen = (hi - lo) / hedef;
      bas = lo;
    }
    var adet = Math.max(1, Math.ceil((hi - bas) / gen - 1e-9));
    return { bas: bas, gen: gen, adet: adet };
  }

  function histogram(degerler, k) {
    var say = [], merkez = [], i;
    for (i = 0; i < k.adet; i++) { say.push(0); merkez.push(k.bas + (i + 0.5) * k.gen); }
    for (i = 0; i < degerler.length; i++) {
      var j = Math.floor((degerler[i] - k.bas) / k.gen);
      if (j >= 0 && j < k.adet) say[j]++;
    }
    var yog = say.map(function (c) { return c / (degerler.length * k.gen); });
    return { x: merkez, y: yog };
  }

  function deneyiKur() {
    var kok = document.getElementById('mlt-deney');
    if (!kok) return;
    var el = {
      dagilim: document.getElementById('mlt-dagilim'),
      n: document.getElementById('mlt-n'),
      nDeger: document.getElementById('mlt-n-deger'),
      sabit: document.getElementById('mlt-sabit'),
      yenile: document.getElementById('mlt-yenile'),
      durum: document.getElementById('mlt-durum'),
      kaynak: document.getElementById('mlt-kaynak'),
      ortalama: document.getElementById('mlt-ortalama')
    };
    var bekleyen = false;

    function panelDuzeni(baslik, lo, hi) {
      return duzen({
        margin: { l: 16, r: 12, t: 44, b: 40 }, showlegend: false, bargap: 0.06,
        xaxis: eksen({ range: [lo, hi] }),
        yaxis: eksen({ showticklabels: false, ticks: '', rangemode: 'tozero', showgrid: false }),
        annotations: [{ text: '<b>' + baslik + '</b>', showarrow: false, xref: 'paper', yref: 'paper', x: 0, y: 1.02,
          xanchor: 'left', yanchor: 'bottom', font: { size: 13, color: MUREKKEP } }]
      });
    }

    function ciz() {
      bekleyen = false;
      var D = DAGILIMLAR[el.dagilim.value];
      var n = +el.n.value;
      var i, j, t;
      el.nDeger.textContent = n;

      var tekler = new Float64Array(TEKRAR), ortalamalar = new Float64Array(TEKRAR);
      for (i = 0; i < TEKRAR; i++) {
        t = 0;
        for (j = 0; j < n; j++) t += D.uret();
        ortalamalar[i] = t / n;
        tekler[i] = D.uret();
      }

      // Kaynak dağılım
      var hk = histogram(tekler, kutular(D.alt, D.ust, 48, D.kafes));
      Plotly.react(el.kaynak, [{ type: 'bar', x: hk.x, y: hk.y, marker: { color: IKINCIL }, hoverinfo: 'skip' }],
        panelDuzeni('Kaynak dağılım (tek örnek)', D.kafes ? D.alt - 0.5 : D.alt, D.kafes ? D.ust + 0.5 : D.ust), AYAR);

      // Ortalamaların dağılımı
      var se = D.sigma === null ? null : D.sigma / Math.sqrt(n);
      var lo = D.alt, hi = D.ust;
      if (se !== null && !el.sabit.checked) {
        lo = Math.max(D.alt, D.mu - 4.5 * se);
        hi = D.kafes || D.ust === 1 ? Math.min(D.ust, D.mu + 4.5 * se) : D.mu + 4.5 * se;
      }
      var hm = histogram(ortalamalar, kutular(lo, hi, 60, D.kafes ? D.kafes / n : 0));
      var cx = aralik(lo, hi, 240), cy;
      if (se !== null) {
        cy = cx.map(function (x) { return normalPdf(x, D.mu, se); });
      } else {
        cy = cx.map(function (x) { return 1 / (Math.PI * (1 + x * x)); });
      }
      var tepe = Math.max.apply(null, hm.y.concat(cy));
      var pd = panelDuzeni(n + ' örneğin ortalaması', lo, hi);
      pd.yaxis.range = [0, tepe * 1.08];
      Plotly.react(el.ortalama, [
        { type: 'bar', x: hm.x, y: hm.y, marker: { color: MAVI }, hoverinfo: 'skip' },
        { type: 'scatter', mode: 'lines', x: cx, y: cy, line: { color: MUREKKEP, width: 2 }, hoverinfo: 'skip' }
      ], pd, AYAR);

      // Özet satırı
      var m = 0, s2 = 0, s3 = 0;
      for (i = 0; i < TEKRAR; i++) m += ortalamalar[i];
      m /= TEKRAR;
      for (i = 0; i < TEKRAR; i++) { t = ortalamalar[i] - m; s2 += t * t; s3 += t * t * t; }
      var sd = Math.sqrt(s2 / (TEKRAR - 1));
      if (se !== null) {
        var carpiklik = (s3 / TEKRAR) / Math.pow(s2 / TEKRAR, 1.5);
        el.durum.textContent = 'ortalamaların ortalaması ' + tr(m, 4) + ' (kuram ' + tr(D.mu, 4) + ') · standart sapması ' +
          tr(sd, 4) + ' (kuram σ/√n = ' + tr(se, 4) + ') · çarpıklık ' + tr(carpiklik, 2);
      } else {
        var sirali = Array.prototype.slice.call(ortalamalar).sort(function (a, b) { return a - b; });
        var ceyrek = sirali[Math.floor(0.75 * TEKRAR)] - sirali[Math.floor(0.25 * TEKRAR)];
        el.durum.textContent = 'ortalama ve varyans tanımsız · ortalamaların çeyrekler arası genişliği ' + tr(ceyrek, 2) +
          ' (n ne olursa olsun kuram 2,00) · en uç ortalama ' + tr(Math.max(Math.abs(sirali[0]), Math.abs(sirali[TEKRAR - 1])), 0);
      }
    }

    function iste() {
      if (bekleyen) return;
      bekleyen = true;
      window.requestAnimationFrame(ciz);
    }

    el.dagilim.addEventListener('change', iste);
    el.n.addEventListener('input', iste);
    el.sabit.addEventListener('change', iste);
    el.yenile.addEventListener('click', iste);
    ciz();
  }

  function baslat() {
    zarGrafigi();
    ustelGrafigi();
    kapsamaGrafigi();
    cauchyGrafigi();
    deneyiKur();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', baslat);
  } else {
    baslat();
  }
})();

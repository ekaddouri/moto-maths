// Courbe d'un polynôme de degré 3 en SVG, axes gradués en x et en y,
// et tableau de variations.
const fmt = v => String(Math.round(v * 100) / 100).replace('-', '−').replace('.', ',');
const FS = 11;   // taille du texte des graduations (unités du dessin, qui fait 280 de large)

export function graphSVG(co, xr, marks, hl) {
  const f = x => ((co[0] * x + co[1]) * x + co[2]) * x + co[3];
  const W = 280, H = 165, L = 30, R = 8, T = 8, B = 10, N = 90;
  let lo = 0, hi = 0; const P = [];
  for (let i = 0; i <= N; i++) {
    const x = xr[0] + (xr[1] - xr[0]) * i / N, y = f(x);
    P.push([x, y]); lo = Math.min(lo, y); hi = Math.max(hi, y);
  }
  if (hl !== undefined) { lo = Math.min(lo, hl); hi = Math.max(hi, hl); }
  const pad = (hi - lo) * 0.07 || 1; lo -= pad; hi += pad;
  const px = x => L + (x - xr[0]) / (xr[1] - xr[0]) * (W - L - R);
  const py = y => H - B - (y - lo) / (hi - lo) * (H - T - B);
  const span = hi - lo, st = span > 60 ? 20 : span > 30 ? 10 : span > 18 ? 5 : span > 7 ? 2 : 1;
  const ln = (x1, y1, x2, y2, c, w, dash) => '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + c + '" stroke-width="' + w + '"' + (dash ? ' stroke-dasharray="6 4"' : '') + '/>';
  const tx = (x, y, s, anchor, c) => '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" fill="' + c + '" font-size="' + FS + '" font-weight="bold" font-family="Arial" text-anchor="' + anchor + '">' + s + '</text>';
  let s = '<svg class="graph" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">';
  const y0 = py(0);
  for (let x = Math.ceil(xr[0]); x <= Math.floor(xr[1]); x++) {
    s += ln(px(x), T, px(x), H - B, 'rgba(255,255,255,.12)', 1);
    if (x !== 0) s += tx(px(x), Math.min(H - 2, y0 + 13), fmt(x), 'middle', '#b8c7ff');
  }
  for (let y = Math.ceil(lo / st) * st; y <= hi; y += st) {
    s += ln(L, py(y), W - R, py(y), 'rgba(255,255,255,.12)', 1);
    if (y !== 0) s += tx(L - 4, py(y) + 4, fmt(y), 'end', '#b8c7ff');
  }
  s += ln(L, y0, W - R, y0, '#c7d2ff', 1.4);
  if (xr[0] <= 0 && xr[1] >= 0) s += ln(px(0), T, px(0), H - B, '#c7d2ff', 1.4);
  s += tx(L - 4, y0 + 4, '0', 'end', '#b8c7ff');
  if (hl !== undefined) {
    s += ln(L, py(hl), W - R, py(hl), '#ff7ae0', 1.8, true);
    s += tx(W - R - 2, py(hl) - 5, 'y = ' + fmt(hl), 'end', '#ff7ae0');
  }
  s += '<polyline fill="none" stroke="#4fd8ff" stroke-width="2.8" stroke-linejoin="round" points="' +
    P.map(p => px(p[0]).toFixed(1) + ',' + py(p[1]).toFixed(1)).join(' ') + '"/>';
  (marks || []).forEach(m => {
    const X = px(m[0]), Y = py(m[1]);
    s += '<circle cx="' + X.toFixed(1) + '" cy="' + Y.toFixed(1) + '" r="4.5" fill="#ffd166" stroke="#fff" stroke-width="1.2"/>';
    // étiquette sous le point s'il est sous l'axe (pour ne pas cacher les graduations), au-dessus sinon
    const below = (m[1] < 0 && Y + 18 < H - 2) || Y < 26;
    s += tx(Math.max(44, Math.min(W - 34, X)), below ? Y + 18 : Y - 9, '(' + fmt(m[0]) + ' ; ' + fmt(m[1]) + ')', 'middle', '#ffd166');
  });
  return s + '</svg>';
}

// Tableau de variations : t = { x:[abscisses], f:[valeurs] } (textes, ex. '−2').
// Les flèches se déduisent des valeurs : elles montent si la valeur suivante est plus grande.
export function tabSVG(t) {
  const num = v => parseFloat(String(v).replace('−', '-').replace(',', '.'));
  const v = t.f.map(num), n = v.length, W = 280, H = 100, C = 44, HI = 50, LO = 90;
  const X = i => C + 18 + i * (W - C - 36) / (n - 1);
  const high = i => (i > 0 && v[i] > v[i - 1]) || (i < n - 1 && v[i] > v[i + 1]);
  const Y = i => high(i) ? HI : LO;
  const txt = (x, y, s, c) => '<text x="' + x.toFixed(1) + '" y="' + y + '" fill="' + c + '" font-size="14" font-weight="bold" font-family="Arial" text-anchor="middle">' + s + '</text>';
  let s = '<svg class="graph tab" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
    '<rect x="1" y="1" width="' + (W - 2) + '" height="' + (H - 2) + '" fill="none" stroke="#c7d2ff" stroke-width="1.2"/>' +
    '<line x1="1" y1="30" x2="' + (W - 1) + '" y2="30" stroke="#c7d2ff" stroke-width="1.2"/>' +
    '<line x1="' + C + '" y1="1" x2="' + C + '" y2="' + (H - 1) + '" stroke="#c7d2ff" stroke-width="1.2"/>' +
    txt(C / 2, 21, 'x', '#ffd166') + txt(C / 2, 70, 'f(x)', '#ffd166');
  for (let i = 0; i < n; i++) { s += txt(X(i), 21, t.x[i], '#fff'); s += txt(X(i), Y(i), t.f[i], '#4fd8ff'); }
  for (let i = 0; i < n - 1; i++) {
    const x1 = X(i) + 14, y1 = Y(i) - 5, x2 = X(i + 1) - 14, y2 = Y(i + 1) - 5;
    const a = Math.atan2(y2 - y1, x2 - x1), h = 7;
    s += '<line x1="' + x1.toFixed(1) + '" y1="' + y1 + '" x2="' + x2.toFixed(1) + '" y2="' + y2 + '" stroke="#fff" stroke-width="1.8"/>' +
      '<polygon fill="#fff" points="' + x2.toFixed(1) + ',' + y2 + ' ' +
      (x2 - h * Math.cos(a - 0.45)).toFixed(1) + ',' + (y2 - h * Math.sin(a - 0.45)).toFixed(1) + ' ' +
      (x2 - h * Math.cos(a + 0.45)).toFixed(1) + ',' + (y2 - h * Math.sin(a + 0.45)).toFixed(1) + '"/>';
  }
  return s + '</svg>';
}

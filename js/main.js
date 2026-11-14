import { BANK, THEME_NAMES } from './questions.js';
import { Race, CIRCUITS, SKINS, mult } from './game.js';
import * as G3 from './scene.js';
import { graphSVG, tabSVG } from './graph.js';
import * as SND from './audio.js';
import { S, persist, pilotLevel, pct, themeRank, bilanText, verify, makeDefi, readDefi, exportSave, importSave } from './store.js';

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const COLORS = ['#ff5964', '#ffd166', '#38bdf8'], LET = ['A', 'B', 'C'];
const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);
const coarse = matchMedia('(pointer: coarse)').matches;
const motionPref = matchMedia('(prefers-reduced-motion: reduce)').matches;
let race = null, paused = false, frozen = false, panels = [], lastOpts = null, target = null, onHome = false;
let col = false, flip = false, flipPref = null, last = 0, tick = 0, installEvt = null, q3d = coarse ? 1 : 2, fAcc = -2, fN = 0;
const reduced = () => S.lowfx || motionPref;
const visual = q => (q.g ? graphSVG(q.g, q.xr) : '') + (q.tv ? tabSVG(q.tv) : '');
const visualFix = q => (q.g ? graphSVG(q.g, q.xr, q.m, q.hl) : '') + (q.tv ? tabSVG(q.tv) : '');

/* ================= Écrans ================= */
function show(html) { const s = $('#screen'); s.innerHTML = '<div class="card">' + html + '</div>'; s.hidden = false; onHome = false; }
function modal(html) { const m = $('#modal'); m.innerHTML = '<div class="card">' + html + '</div>'; m.hidden = false; }
function closeModal() { $('#modal').hidden = true; $('#modal').innerHTML = ''; }
function flash(c) {
  if (reduced()) return;
  const f = $('#flash'); f.style.transition = 'none'; f.style.background = c; f.style.opacity = 0.3;
  requestAnimationFrame(() => { f.style.transition = 'opacity .6s'; f.style.opacity = 0; });
}

function profile() {
  show('<h1>SUPER MOTO MATHS</h1><p>Bienvenue pilote ! Dis-nous qui tu es.</p>' +
    '<input id="inName" placeholder="Ton prénom" maxlength="20" value="' + esc(S.name) + '">' +
    '<input id="inCls" placeholder="Ta classe (ex. TMA1)" maxlength="12" value="' + esc(S.cls) + '">' +
    '<p id="msg" class="note"></p><p>Ces informations restent sur ton appareil.</p>' +
    '<button class="bigbtn" data-act="saveProfile">C\'EST PARTI</button>' +
    '<button class="btn" data-act="transfer">📥 J\'ai déjà joué ailleurs : importer ma progression</button>');
}

function home() {
  race = null; target = null; paused = frozen = false; closeModal();
  $('#panels').innerHTML = ''; panels = []; $('#btnPause').hidden = true; SND.music(false);
  G3.setTheme(3); G3.setBikes([S.skin]);
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  let inst = '';
  if (!standalone) inst = installEvt ? '<button class="btn" data-act="install">📲 Installer le jeu sur cet appareil</button>'
    : ios ? '<p class="note">📲 Installe le jeu : bouton Partager, puis « Sur l\'écran d\'accueil ». Sans installation, Safari peut effacer ta progression après quelques jours.</p>'
      : '<p>📲 Pour jouer sans internet : menu du navigateur, puis « Ajouter à l\'écran d\'accueil ».</p>';
  show('<h1>SUPER MOTO MATHS</h1><p>Salut <b>' + esc(S.name) + '</b> — Pilote niveau <b>' + pilotLevel(S.xp) + '</b> (' + S.xp + ' XP)</p>' +
    '<button class="bigbtn" data-act="circuits">🏁 COURSE SOLO</button>' +
    '<button class="btn" data-act="duel">⚔️ Duel sur cet appareil<small>2 joueurs, écran partagé — clavier : Q/D et flèches</small></button>' +
    '<button class="btn" data-act="defi">🎯 Défi par code<small>Rejoue la course d\'un ami</small></button>' +
    '<button class="btn" data-act="bilan">📊 Mon bilan</button>' +
    '<button class="btn" data-act="garage">🏍 Garage et réglages</button>' +
    '<button class="btn" data-act="prof">🎓 Espace prof</button>' + inst);
  onHome = true;
}

function circuits() {
  let h = '<h1>CIRCUITS</h1>';
  CIRCUITS.forEach((c, i) => {
    const open = i === 0 || S.circ[i - 1].s >= 1;
    h += '<button class="btn' + (open ? '' : ' lock') + '" ' + (open ? 'data-act="play" data-v="' + i + '"' : '') + '>' + (open ? '' : '🔒 ') + c.name +
      ' <span style="color:#ffd166">' + stars(S.circ[i].s) + '</span><small>' + c.sub +
      (open ? (S.circ[i].b ? ' — record : ' + S.circ[i].b + ' pts' : '') : ' — termine le circuit précédent') + '</small></button>';
  });
  show(h + '<button class="btn" data-act="home">← Menu</button>');
}

function garage() {
  const lv = pilotLevel(S.xp);
  let h = '<h1>GARAGE</h1><p>De nouvelles motos se débloquent avec ton niveau de pilote.</p>';
  SKINS.forEach((s, i) => {
    const open = lv >= s.lvl, hex = n => '#' + n.toString(16).padStart(6, '0');
    h += '<button class="btn' + (open ? '' : ' lock') + (S.skin === i ? ' on' : '') + '" ' + (open ? 'data-act="skin" data-v="' + i + '"' : '') + '>' +
      '<span class="swatch" style="background:' + hex(s.body) + '"></span><span class="swatch" style="background:' + hex(s.neon) + '"></span>' +
      s.name + (open ? '' : ' 🔒 niveau ' + s.lvl) + '</button>';
  });
  h += '<h2>Réglages</h2><button class="btn' + (reduced() ? ' on' : '') + '" data-act="lowfx">✨ Effets réduits : ' + (reduced() ? 'oui' : 'non') +
    '<small>' + (motionPref ? 'Activé par le réglage « réduire les animations » de l\'appareil' : 'Pas de flashs, pas de secousses de caméra') + '</small></button>';
  show(h + '<button class="btn" data-act="home">← Menu</button>');
}

function bilan() {
  const r = themeRank();
  let h = '<h1>MON BILAN</h1><p><b>' + esc(S.name) + '</b> — ' + esc(S.cls) + '</p><div class="statgrid">' +
    '<div class="stat"><b>' + pilotLevel(S.xp) + '</b><span>Niveau pilote</span></div>' +
    '<div class="stat"><b>' + S.runs + '</b><span>Courses</span></div>';
  Object.keys(THEME_NAMES).forEach(k => { h += '<div class="stat"><b>' + (pct(k) === null ? '—' : pct(k) + ' %') + '</b><span>' + THEME_NAMES[k] + '</span></div>'; });
  h += '<div class="stat"><b>' + S.circ.reduce((a, c) => a + c.s, 0) + '/12</b><span>Étoiles</span></div></div>';
  if (r) h += '<p>💪 Point fort : <b>' + THEME_NAMES[r.best] + '</b>' + (r.worst !== r.best ? '<br>🎯 À travailler : <b>' + THEME_NAMES[r.worst] + '</b>' : '') + '</p>';
  h += recap(S.missed, 'Dernières questions ratées');
  h += '<h2>Envoyer à mon prof</h2><textarea id="ta" readonly>' + esc(bilanText()) + '</textarea><p id="msg" class="note"></p>' +
    '<button class="bigbtn" data-act="sendTa">📤 ENVOYER À MON PROF</button>' +
    '<button class="btn" data-act="transfer">🔁 Transférer ma progression<small>vers un autre navigateur ou l\'appli installée</small></button>' +
    '<button class="btn" data-act="editProfile">Modifier prénom / classe</button><button class="btn" data-act="home">← Menu</button>';
  show(h);
}

function transfer() {
  modal('<h2>🔁 Transférer ma progression</h2><p>1. Ici, copie ton code de sauvegarde :</p>' +
    '<textarea id="ta" readonly style="height:90px">' + esc(exportSave()) + '</textarea><p id="msg" class="note"></p>' +
    '<button class="btn" data-act="sendTa">📋 Copier / partager mon code</button>' +
    '<p>2. Sur l\'autre appareil ou dans l\'appli installée, colle le code ici :</p>' +
    '<textarea id="inSave" style="height:90px" placeholder="Coller le code SMM-…"></textarea><p id="msg2" class="note"></p>' +
    '<button class="bigbtn" data-act="importSave">IMPORTER</button><button class="btn" data-act="closeModal">Fermer</button>');
}

function prof() {
  show('<h1>ESPACE PROF</h1><p>Collez ici le bilan reçu d\'un élève pour vérifier qu\'il n\'a pas été modifié.</p>' +
    '<textarea id="taProf" placeholder="Coller le bilan ici"></textarea><p id="msg" class="note"></p>' +
    '<button class="bigbtn" data-act="check">VÉRIFIER</button><button class="btn" data-act="home">← Menu</button>');
}

function defi(pre) {
  show('<h1>DÉFI PAR CODE</h1><p>Tape le code reçu d\'un ami : tu joueras exactement les mêmes questions.</p>' +
    '<input id="inCode" placeholder="Code du défi" value="' + esc(pre || '') + '" autocapitalize="characters">' +
    '<p id="msg" class="note"></p><button class="bigbtn" data-act="defiGo">JOUER CE DÉFI</button>' +
    '<p>Pour lancer un défi : termine une course solo, puis touche « Défier un ami ».</p><button class="btn" data-act="home">← Menu</button>');
}

function recap(ids, title) {
  const u = ids.filter((v, i, a) => a.indexOf(v) === i && BANK[v]);
  if (!u.length) return '';
  let h = '<div class="recap"><h3>📚 ' + title + '</h3>';
  u.forEach(i => { const q = BANK[i]; h += '<div>• ' + esc(q.q) + '<br>→ <b>' + esc(q.a[0]) + '</b><br>' + esc(q.e) + '</div>'; });
  return h + '</div>';
}

async function sendText(text) {
  try { if (navigator.share) { await navigator.share({ text }); return 'Partagé !'; } }
  catch (e) { if (e && e.name === 'AbortError') return ''; }
  try { await navigator.clipboard.writeText(text); return 'Copié ! Colle-le dans ta messagerie.'; } catch (e) { }
  return 'Sélectionne le texte ci-dessus et copie-le.';
}

/* ================= Mode test de la banque (adresse terminée par #test) ================= */
function selfTest() {
  const err = [], cnt = { G: [0, 0, 0], D: [0, 0, 0], E: [0, 0, 0] };
  const num = v => parseFloat(String(v).replace('−', '-').replace(',', '.'));
  BANK.forEach((q, i) => {
    const e = m => err.push('Question n° ' + i + ' (« ' + String(q.q || '').slice(0, 40) + ' ») : ' + m);
    if (!THEME_NAMES[q.th]) e('thème th inconnu');
    if (![1, 2, 3].includes(q.d)) e('difficulté d différente de 1, 2 ou 3');
    else if (cnt[q.th]) cnt[q.th][q.d - 1]++;
    if (!q.f) e('famille f manquante');
    if (!q.q || !q.e) e('énoncé q ou explication e manquant');
    if (!Array.isArray(q.a) || q.a.length !== 3) e('il faut exactement 3 réponses');
    else if (new Set(q.a.map(s => String(s).trim())).size !== 3) e('deux réponses identiques');
    if (q.g) {
      if (q.g.length !== 4 || !q.xr || q.xr.length !== 2 || !(q.xr[0] < q.xr[1])) e('courbe g ou intervalle xr incorrect');
      else (q.m || []).forEach(m => {
        const y = ((q.g[0] * m[0] + q.g[1]) * m[0] + q.g[2]) * m[0] + q.g[3];
        if (Math.abs(y - m[1]) > 1e-9) e('le point (' + m[0] + ' ; ' + m[1] + ') n\'est pas sur la courbe (f(' + m[0] + ') = ' + y + ')');
        if (m[0] < q.xr[0] || m[0] > q.xr[1]) e('le point (' + m[0] + ' ; ' + m[1] + ') sort de l\'intervalle xr');
      });
    } else if (q.m || q.hl !== undefined) e('m ou hl sans courbe g');
    if (q.tv && (!q.tv.x || !q.tv.f || q.tv.x.length !== q.tv.f.length || q.tv.x.length < 2 || q.tv.f.some(v => isNaN(num(v))))) e('tableau tv incorrect');
  });
  const ok = !err.length;
  show('<h1>MODE TEST</h1><div class="testrep"><p>' + BANK.length + ' questions vérifiées.</p>' +
    Object.keys(cnt).map(k => '<p>' + THEME_NAMES[k] + ' : ' + cnt[k].reduce((a, b) => a + b, 0) + ' (niveau 1 : ' + cnt[k][0] + ', niveau 2 : ' + cnt[k][1] + ', niveau 3 : ' + cnt[k][2] + ')</p>').join('') +
    (ok ? '<p class="note">✔ Aucune erreur de forme détectée.</p>' : '<p class="ko"><b>' + err.length + ' erreur(s) :</b><br>' + err.map(esc).join('<br>') + '</p>') +
    '<p>Ce test contrôle la forme des questions et la position des points remarquables sur les courbes. Il ne remplace pas la relecture mathématique des réponses.</p></div>' +
    '<button class="btn" data-act="home">← Menu</button>');
  document.body.dataset.test = ok ? 'ok' : 'ko';
}

/* ================= Panneaux joueurs (1 en solo, 2 en duel) ================= */
function buildPanels(n) {
  const box = $('#panels'); box.innerHTML = ''; panels = [];
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div'); el.className = 'pp';
    el.innerHTML = '<div class="hud"><span class="hearts"></span><span class="score"></span><span class="speed"></span><span class="prog"></span></div>' +
      '<div class="streak"></div><div class="qbox" hidden><div class="qtheme"></div><div class="qtext"></div><div class="qgraph"></div>' +
      '<div class="answers"></div><div class="qtimer"><i></i></div></div><div class="toast" hidden></div>';
    box.appendChild(el);
    const g = c => el.querySelector(c);
    const p = { el, i, hearts: g('.hearts'), score: g('.score'), speed: g('.speed'), prog: g('.prog'), streak: g('.streak'), q: g('.qbox'), theme: g('.qtheme'), text: g('.qtext'), graph: g('.qgraph'), ans: g('.answers'), fill: g('.qtimer i'), toast: g('.toast'), tt: 0 };
    el.addEventListener('pointerdown', ev => {
      if (!race || paused || frozen) return;
      const r = el.getBoundingClientRect(); let x = (ev.clientX - r.left) / r.width;
      if (el.classList.contains('flip')) x = 1 - x;
      race.input(i, x < 0.4 ? 'L' : x > 0.6 ? 'R' : 'OK');
    });
    // Toucher l'énoncé ou la courbe pour mieux lire ne choisit pas de voie (seuls les boutons de réponse comptent)
    p.q.addEventListener('pointerdown', ev => ev.stopPropagation());
    panels.push(p);
  }
  layout();
}
function layout() {
  col = innerHeight > innerWidth; flip = col && (flipPref === null ? coarse : flipPref);
  $('#panels').className = panels.length > 1 ? 'duel ' + (col ? 'col' : 'row') : '';
  if (panels[1]) panels[1].el.classList.toggle('flip', flip);
}
window.addEventListener('resize', layout);

function views() {
  const W = innerWidth, H = innerHeight;
  if (!race || race.players.length === 1) return [{ i: 0, x: 0, y: 0, w: W, h: H, flip: false }];
  if (col) return [{ i: 0, x: 0, y: 0, w: W, h: H / 2, flip: false }, { i: 1, x: 0, y: H / 2, w: W, h: H / 2, flip }];
  return [{ i: 0, x: 0, y: 0, w: W / 2, h: H, flip: false }, { i: 1, x: W / 2, y: 0, w: W / 2, h: H, flip: false }];
}

function toast(p, cls, html, ms) {
  p.toast.className = 'toast ' + cls; p.toast.innerHTML = html; p.toast.hidden = false;
  clearTimeout(p.tt); p.tt = setTimeout(() => { p.toast.hidden = true; }, ms);
}
function mark() {
  panels.forEach(p => { const c = race.players[p.i].choice; Array.from(p.ans.children).forEach((b, k) => b.classList.toggle('sel', k === c)); });
}
function hud() {
  if (!race) return;
  panels.forEach(p => {
    const pl = race.players[p.i];
    p.hearts.textContent = race.duel ? 'J' + (p.i + 1) + ' · ' + pl.correct + ' ✔' : race.noLives ? '🎯 Défi · ' + pl.correct + ' ✔' : '♥'.repeat(Math.max(0, pl.lives)) + '♡'.repeat(Math.max(0, 3 - pl.lives));
    p.score.textContent = pl.score + ' pts';
    p.speed.textContent = Math.round(pl.speed) + ' km/h';
    p.prog.textContent = 'Q ' + Math.min(race.answered + 1, race.nq) + '/' + race.nq;
    p.streak.textContent = pl.streak >= 2 ? '🔥 ×' + mult(pl).toFixed(1) : '';
  });
}

/* ================= Liaison jeu -> interface ================= */
const ui = {
  question(a) {
    panels.forEach(p => {
      p.theme.textContent = THEME_NAMES[a.q.th]; p.text.textContent = a.q.q;
      p.graph.innerHTML = visual(a.q); p.ans.innerHTML = '';
      a.order.forEach((ai, k) => {
        const b = document.createElement('div'); b.className = 'ans'; b.style.background = COLORS[k];
        b.innerHTML = '<small>Portail ' + LET[k] + '</small>' + esc(a.q.a[ai]);
        b.addEventListener('pointerdown', ev => { ev.stopPropagation(); if (!paused && !frozen) race.input(p.i, k); });
        p.ans.appendChild(b);
      });
      p.fill.style.width = '100%'; p.q.hidden = false; p.toast.hidden = true;
    });
  },
  choice() { mark(); SND.sfx('tick'); },
  timer(fr) { panels.forEach(p => { p.fill.style.width = (fr * 100) + '%'; }); },
  sfx(n) { SND.sfx(n); if (n === 'hit') flash('#ff5964'); },
  resolved(q, res) {
    panels.forEach(p => {
      p.q.hidden = true; const r = res[p.i];
      if (r.ok) toast(p, 'ok', '✅ Bien joué ! +' + r.gain + ' pts' + (r.life ? '<br>❤️ +1 vie' : ''), 1300);
      else if (race.duel) toast(p, 'ko', (r.none ? '⏱ Pas de réponse' : '❌ Raté') + '<br>Réponse : <b>' + esc(q.a[0]) + '</b>', 2800);
    });
    const r = res[0]; SND.sfx(r.ok ? 'good' : 'bad'); flash(r.ok ? '#39ff88' : '#ff5964'); hud();
    if (!race.duel && !r.ok) {
      frozen = true;   // la course est en pause jusqu'au bouton "Compris"
      modal('<h2>' + (r.none ? '⏱ Pas de réponse cette fois' : '💡 Pas grave, on regarde') + '</h2><p class="qrec">' + esc(q.q) + '</p>' +
        visualFix(q) + '<p>Bonne réponse : <b class="good">' + esc(q.a[0]) + '</b></p><p>' + esc(q.e) + '</p>' +
        (r.shield ? '<p class="note">🛡 Bouclier de départ : tu gardes 1 vie.</p>' : '') +
        '<button class="bigbtn" data-act="ok">COMPRIS</button>');
    }
  },
  end() { endRace(); }
};

/* ================= Course ================= */
function startRace(o) {
  lastOpts = o; $('#screen').hidden = true; closeModal();
  const duel = o.mode === 'duel';
  buildPanels(duel ? 2 : 1);
  G3.setTheme(o.circuit); G3.setBikes(duel ? [S.skin, (S.skin + 1) % SKINS.length] : [S.skin]);
  race = new Race(o, ui); paused = frozen = false;
  $('#btnPause').hidden = false; SND.music(true); hud();
}
function pause() {
  if (!race || race.phase === 'done' || paused || frozen) return;
  paused = true; SND.music(false);
  modal('<h2>⏸ Pause</h2><button class="bigbtn" data-act="resume">REPRENDRE</button>' +
    (race.duel ? '<button class="btn" data-act="flip">🔄 Retourner l\'écran du joueur 2<small>pour jouer face à face, téléphone posé à plat</small></button>' : '') +
    '<button class="btn" data-act="home">Quitter la course</button>');
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { pause(); SND.setMuted(true); }   // plus aucun son téléphone en poche
  else SND.setMuted(S.mute);
});

function endRace() {
  $('#btnPause').hidden = true; SND.music(false);
  if (race.duel) return endDuel();
  const r = race.result(), o = lastOpts, lv0 = pilotLevel(S.xp);
  S.runs++; S.xp += r.score;
  for (const k in r.stats) { S.th[k][0] += r.stats[k][0]; S.th[k][1] += r.stats[k][1]; }
  S.missed = r.missed.concat(S.missed).filter((v, i, a) => a.indexOf(v) === i).slice(0, 8);
  let news = '';
  if (o.mode === 'solo') {
    const c = S.circ[o.circuit];
    if (r.stars > c.s) { if (!c.s && o.circuit < 3) news += '<p class="note">🔓 Circuit débloqué : ' + CIRCUITS[o.circuit + 1].name + '</p>'; c.s = r.stars; }
    if (r.score > c.b) { c.b = r.score; news += '<p class="note">🏆 Nouveau record !</p>'; }
  }
  const lv1 = pilotLevel(S.xp);
  if (lv1 > lv0) {
    news += '<p class="note">⬆️ Pilote niveau ' + lv1 + ' !</p>';
    SKINS.filter(s => s.lvl > lv0 && s.lvl <= lv1).forEach(s => { news += '<p class="note">🏍 Moto débloquée : ' + s.name + '</p>'; });
  }
  if (!persist()) news += '<p>Sauvegarde impossible sur cet appareil : ta progression ne sera pas gardée.</p>';
  if (r.win) SND.sfx('finish');
  let h = '<h1>' + (r.win ? '🏁 COURSE TERMINÉE !' : '🔧 ARRÊT AU STAND') + '</h1>' +
    (r.win ? (o.mode === 'solo' ? '<div class="stars">' + stars(r.stars) + '</div>' : '') : '<p>Plus de vies cette fois. Chaque erreur corrigée te rapproche du podium !</p>');
  if (o.mode === 'defi' && target) {
    const me = r.correct !== target.correct ? r.correct > target.correct : r.score > target.score;
    const tie = r.correct === target.correct && r.score === target.score;
    h += '<h2>' + (tie ? '🤝 Égalité parfaite !' : me ? '🏆 Défi remporté !' : '💪 Défi perdu… revanche ?') + '</h2>' +
      '<p>Toi : <b>' + r.correct + '/' + r.answered + '</b> (' + r.score + ' pts)<br>Ton adversaire : <b>' + target.correct + '/' + target.ids.length + '</b> (' + target.score + ' pts)</p>';
  }
  h += '<div class="statgrid"><div class="stat"><b>' + r.correct + '/' + r.answered + '</b><span>Bonnes réponses</span></div>' +
    '<div class="stat"><b>' + r.score + '</b><span>Score</span></div>' +
    '<div class="stat"><b>' + Math.round(r.vmax) + '</b><span>Vitesse max (km/h)</span></div>' +
    '<div class="stat"><b>' + r.dist.toFixed(1).replace('.', ',') + ' km</b><span>Distance</span></div></div>' + news +
    recap(r.missed, 'À revoir pour la prochaine course') +
    '<button class="bigbtn" data-act="replay">🔄 REJOUER</button>' +
    '<button class="btn" data-act="share" data-v="' + makeDefi(o.circuit, r.ids, r.correct, r.score) + '">⚔️ ' + (o.mode === 'defi' ? 'Envoyer la revanche' : 'Défier un ami sur cette course') + '</button>' +
    '<button class="btn" data-act="home">Menu</button>';
  show(h);
}

function endDuel() {
  const a = race.players[0], b = race.players[1];
  S.duels++; persist(); SND.sfx('finish');
  const w = a.correct !== b.correct ? (a.correct > b.correct ? 0 : 1) : (Math.abs(a.time - b.time) < 0.05 ? -1 : (a.time < b.time ? 0 : 1));
  const line = (p, n) => '<div class="stat"><b>' + p.correct + '/' + race.answered + '</b><span>Joueur ' + n + ' — ' + p.time.toFixed(1) + ' s de réflexion</span></div>';
  show('<h1>⚔️ FIN DU DUEL</h1><h2>' + (w < 0 ? '🤝 Égalité parfaite !' : '🏆 Joueur ' + (w + 1) + ' gagne !') + '</h2>' +
    (a.correct === b.correct && w >= 0 ? '<p>Même nombre de bonnes réponses : le plus rapide l\'emporte.</p>' : '') +
    '<div class="statgrid">' + line(a, 1) + line(b, 2) + '</div>' +
    recap(a.missed.concat(b.missed), 'Corrections du duel') +
    '<button class="bigbtn" data-act="replay">🔄 REVANCHE</button><button class="btn" data-act="home">Menu</button>');
}

/* ================= Actions des boutons ================= */
const ACT = {
  home, circuits, garage, bilan, prof, pause, transfer,
  defi() { defi(''); },
  editProfile: profile,
  saveProfile() {
    const n = $('#inName').value.trim(), c = $('#inCls').value.trim();
    if (!n) { $('#msg').textContent = 'Écris ton prénom pour commencer.'; return; }
    S.name = n; S.cls = c; persist(); boot2();
  },
  importSave() {
    const m = $('#msg2');
    if (!importSave($('#inSave').value)) { m.textContent = 'Code invalide : recopie-le en entier, sans rien modifier.'; return; }
    m.textContent = '✔ Progression importée !'; setTimeout(() => { closeModal(); if (S.name) home(); else profile(); }, 900);
  },
  play(v) { startRace({ mode: 'solo', circuit: +v }); },
  duel() { startRace({ mode: 'duel', circuit: 3 }); },
  defiGo() {
    const d = readDefi($('#inCode').value);
    if (!d) { $('#msg').textContent = 'Code invalide : vérifie les caractères.'; return; }
    target = d; startRace({ mode: 'defi', circuit: d.circuit, fixed: d.ids });
  },
  replay() { if (lastOpts) startRace(lastOpts); },
  skin(v) { S.skin = +v; persist(); G3.setBikes([S.skin]); garage(); },
  lowfx() { if (motionPref) return; S.lowfx = !S.lowfx; persist(); G3.setReduced(reduced()); garage(); },
  flip() { flipPref = !flip; layout(); },
  ok() { closeModal(); frozen = false; if (race) race.resume(); },
  resume() { closeModal(); paused = false; SND.music(true); },
  closeModal,
  share(code) {
    const d = readDefi(code); if (!d) return;
    const link = location.origin + location.pathname + '?defi=' + code;
    modal('<h2>⚔️ Ton défi</h2><p>Envoie ce message à un ami :</p><textarea id="ta" readonly>' +
      esc('Défi Super Moto Maths ! J\'ai eu ' + d.correct + '/' + d.ids.length + ' (' + d.score + ' pts). Fais mieux : ' + link + ' — ou tape le code ' + code + ' dans « Défi par code ».') +
      '</textarea><p id="msg" class="note"></p><button class="bigbtn" data-act="sendTa">📤 ENVOYER</button><button class="btn" data-act="closeModal">Fermer</button>');
  },
  async sendTa() {
    const ta = document.querySelector('#modal #ta') || $('#ta'), box = ta.parentNode.querySelector('#msg');
    const m = await sendText(ta.value); box.textContent = m;
    if (m.indexOf('Sélectionne') === 0) { ta.focus(); ta.select(); }
  },
  check() {
    const r = verify($('#taProf').value.trim()), m = $('#msg');
    m.textContent = r === null ? 'Aucun code trouvé : collez le message en entier.' : r ? '✔ Bilan authentique : le texte n\'a pas été modifié.' : '✘ Le texte ne correspond pas au code : il a été modifié.';
  },
  mute() {
    S.mute = !S.mute; persist(); SND.setMuted(S.mute);
    $('#btnMute').textContent = S.mute ? '🔇' : '🔊';
  },
  async install() { if (installEvt) { installEvt.prompt(); installEvt = null; home(); } }
};
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-act]'); if (!b) return;
  const f = ACT[b.dataset.act]; if (f) f(b.dataset.v, b);
});
window.addEventListener('keydown', ev => {
  if (!race || paused || frozen) return;
  const k = ev.key.toLowerCase(), two = race.players.length > 1, pr = two ? 1 : 0;
  const m = { arrowleft: [pr, 'L'], arrowright: [pr, 'R'], arrowup: [pr, 'OK'], q: [0, 'L'], d: [0, 'R'], z: [0, 'OK'], ' ': [0, 'OK'] }[k];
  if (m) { race.input(m[0], m[1]); ev.preventDefault(); }
  else if (!two && k.length === 1 && '123'.indexOf(k) >= 0) race.input(0, +k - 1);
  else if (k === 'escape' || k === 'p') pause();
});
window.addEventListener('beforeinstallprompt', ev => { ev.preventDefault(); installEvt = ev; if (onHome) home(); });
window.addEventListener('hashchange', () => { if (location.hash === '#test' && !race) selfTest(); });

/* ================= Boucle principale ================= */
function loop(ts) {
  requestAnimationFrame(loop);
  const t = ts / 1000, raw = t - last, dt = Math.min(0.05, raw > 0 ? raw : 0.016); last = t;
  const run = !!race && !paused && !frozen && race.phase !== 'done';
  if (run) {
    race.update(dt);
    if (++tick % 6 === 0) hud();
    // mesure des images par seconde : on allège les effets si l'appareil peine
    fAcc += raw; fN++;
    if (fAcc >= 2.5) { const f = fN / fAcc; fAcc = 0; fN = 0; if (f < 42 && q3d > 0) { q3d--; G3.setQuality(q3d); } }
  }
  G3.frame(race ? (run ? dt : 0) : dt, t, race, views());
  SND.engine(race ? race.players[0].speed : 0, run);
}

/* ================= Démarrage ================= */
function boot2() {
  if (location.hash === '#test') return selfTest();
  const code = new URLSearchParams(location.search).get('defi');
  if (code) { try { history.replaceState(null, '', location.pathname); } catch (e) { } home(); defi(code); }
  else home();
}
if (!G3.init($('#cv'), q3d)) {
  show('<h1>OUPS</h1><p>Ce navigateur ne peut pas afficher la 3D (WebGL indisponible). Essaie avec Chrome, Safari ou Firefox à jour, ou sur un autre appareil.</p>');
} else {
  G3.setReduced(reduced());
  $('#btnMute').textContent = '🔇'; S.mute = true;   // son toujours coupé au lancement
  if (S.name || location.hash === '#test') boot2(); else profile();
  requestAnimationFrame(loop);
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready).then(() => {
    const o = $('#offline'); o.hidden = false; setTimeout(() => { o.hidden = true; }, 4000);
  }).catch(() => { });
}

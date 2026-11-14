import { BANK } from './questions.js';

/* ===== RÉGLAGES FACILES À MODIFIER ===== */
export const CFG = {
  NQ: 10,            // questions par course solo
  NQ_DUEL: 10,       // questions par duel
  LIVES: 3, MAXLIVES: 3,
  LIFE_STREAK: 3,    // une vie regagnée toutes les 3 bonnes réponses de suite
  SAFE_Q: 3,         // pas de fin de partie pendant les 3 premières questions
  BASEV: 80, MAXV: 220, MINV: 70, BOOST: 15, PENALTY: 35,   // vitesses en km/h
  READ: 6,           // secondes de ralenti pour lire (sans graphique)
  READ_GRAPH: 7,     // idem avec graphique ou tableau
  ACT: 5,            // secondes supplémentaires avant les portails
  AFTER_CHOICE: 2.5, // une fois la voie choisie, les portails arrivent en 2,5 s…
  MIN_LOCK: 3,       // …mais jamais avant 3 s après l'apparition de la question
  PORTAL_Z: 110, LANE: 3, ROWS: 3, ROW_GAP: 32, SPAWN_Z: 150
};

export const CIRCUITS = [
  { name: 'Graphix City', sub: 'Lecture graphique', th: ['G'], lvl: 1, top: 0x0a0633, hor: 0x3a1466, glow: 0xff2bd6, neon: 0x00e5ff, neon2: 0xff2bd6, fog: 0x1b0d44 },
  { name: 'Dérivator', sub: 'Dérivée et variations', th: ['D'], lvl: 1, top: 0x021a2b, hor: 0x064a5a, glow: 0x00ffa8, neon: 0x39ff88, neon2: 0x00c8ff, fog: 0x06303c },
  { name: 'Zéro Zone', sub: 'Équation f(x) = 0', th: ['E'], lvl: 1, top: 0x1a0505, hor: 0x5a1a0a, glow: 0xff7a1a, neon: 0xffb020, neon2: 0xff3344, fog: 0x3a1208 },
  { name: 'Grand Prix', sub: 'Les 3 thèmes mélangés', th: ['G', 'D', 'E'], lvl: 2, top: 0x05051a, hor: 0x2a1060, glow: 0x9d5cff, neon: 0xffffff, neon2: 0x9d5cff, fog: 0x150a38 }
];

export const SKINS = [
  { name: 'Néon', body: 0xff2d6f, neon: 0x00e5ff, lvl: 1 },
  { name: 'Plasma', body: 0x7c3aed, neon: 0xff2bd6, lvl: 2 },
  { name: 'Toxic', body: 0x1f2937, neon: 0x39ff14, lvl: 3 },
  { name: 'Solar', body: 0xff8a00, neon: 0xffe14d, lvl: 5 },
  { name: 'Glacier', body: 0xe2f3ff, neon: 0x38bdf8, lvl: 7 },
  { name: 'Légende', body: 0x111111, neon: 0xffd700, lvl: 10 }
];

export const mult = p => Math.min(5, 1 + (Math.max(p.streak, 1) - 1) * 0.5);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export class Race {
  // o = { mode:'solo'|'duel'|'defi', circuit:0..3, fixed:[numéros de questions] }
  constructor(o, ui) {
    this.ui = ui; this.mode = o.mode; this.duel = o.mode === 'duel';
    this.noLives = o.mode !== 'solo';   // duel et défi : toutes les questions sont jouées
    this.circuit = CIRCUITS[o.circuit]; this.fixed = o.fixed || null;
    this.nq = this.fixed ? this.fixed.length : (this.duel ? CFG.NQ_DUEL : CFG.NQ);
    this.players = [];
    for (let i = 0; i < (this.duel ? 2 : 1); i++) this.players.push({
      lane: 1, laneX: 1, choice: null, choiceT: 0, lives: CFG.LIVES, streak: 0, score: 0, correct: 0,
      speed: CFG.BASEV, vmax: CFG.BASEV, time: 0, missed: [], boostT: -9, hitT: -9, orbs: 0
    });
    this.t = 0; this.dist = 0; this.v = 0; this.slow = 1; this.answered = 0; this.over = false;
    this.level = this.circuit.lvl; this.okRun = 0; this.koRun = 0; this.retry = [];
    this.used = new Set(); this.ids = []; this.ents = []; this.qa = null;
    this.stats = { G: [0, 0], D: [0, 0], E: [0, 0] };
    this.thOff = Math.floor(Math.random() * 3);
    this.startFree();
  }

  startFree() {
    this.phase = 'free';
    this.rows = this.duel ? 0 : CFG.ROWS; this.rowDist = 15; this.wait = this.duel ? 1.8 : 0;
  }

  // Choix de la question : thèmes équilibrés, niveau adaptatif, retour des familles ratées
  pick() {
    if (this.fixed) return this.fixed[this.answered] % BANK.length;
    const best = list => {
      if (!list.length) return -1;
      let m = 9; list.forEach(i => { m = Math.min(m, Math.abs(BANK[i].d - this.level)); });
      const c = list.filter(i => Math.abs(BANK[i].d - this.level) === m);
      return c[Math.floor(Math.random() * c.length)];
    };
    const all = BANK.map((q, i) => i).filter(i => !this.used.has(i));
    if (this.retry.length && this.answered >= this.retry[0].at) {
      const r = this.retry.shift(), i = best(all.filter(k => BANK[k].f === r.f));
      if (i >= 0) return i;
    }
    const ths = this.circuit.th, th = ths[(this.answered + this.thOff) % ths.length];
    let i = best(all.filter(k => BANK[k].th === th));
    if (i < 0) i = best(all);
    if (i < 0) { this.used.clear(); i = Math.floor(Math.random() * BANK.length); }
    return i;
  }

  startQuestion() {
    const id = this.pick(); this.used.add(id); this.ids.push(id);
    const q = BANK[id], order = shuffle([0, 1, 2]), read = (q.g || q.tv) ? CFG.READ_GRAPH : CFG.READ;
    this.qa = { id, q, order, correctLane: order.indexOf(0), read, T: read + CFG.ACT, T0: read + CFG.ACT, t: 0, z: -CFG.PORTAL_Z };
    this.players.forEach(p => { p.choice = null; p.choiceT = 0; });
    this.phase = 'question'; this.ui.question(this.qa);
  }

  // a = 'L', 'R', 'OK' ou un numéro de voie 0..2
  input(i, a) {
    const p = this.players[i]; if (!p || this.phase === 'done') return;
    if (a === 'L') p.lane = Math.max(0, p.lane - 1);
    else if (a === 'R') p.lane = Math.min(2, p.lane + 1);
    else if (typeof a === 'number') p.lane = Math.max(0, Math.min(2, a));
    if (this.phase === 'question') { p.choice = p.lane; p.choiceT = this.qa.t; this.ui.choice(i); }
  }

  spawnRow() {
    const l = shuffle([0, 1, 2]), z = -CFG.SPAWN_Z;
    this.ents.push({ type: 'obs', lane: l[0], z, hit: false });
    for (let k = 0; k < 3; k++) this.ents.push({ type: 'orb', lane: l[1], z: z - 7 * k, hit: false });
    if (Math.random() < 0.35) this.ents.push({ type: 'boost', lane: l[2], z, hit: false });
  }

  collide(p, e) {
    if (e.type === 'obs') { p.speed = Math.max(CFG.MINV, p.speed - 20); p.hitT = this.t; this.ui.sfx('hit'); }
    else if (e.type === 'orb') { p.orbs++; p.score += Math.round(10 * mult(p)); this.ui.sfx('orb'); }
    else { p.speed = Math.min(CFG.MAXV, p.speed + 10); p.vmax = Math.max(p.vmax, p.speed); p.boostT = this.t; this.ui.sfx('boost'); }
  }

  update(dt) {
    if (this.phase === 'done') return;
    this.t += dt;
    const P = this.players;
    const slowTarget = (this.phase === 'question' && this.qa.t < this.qa.read) ? 0.35 : 1;
    this.slow += (slowTarget - this.slow) * Math.min(1, dt * 4);
    let sp = 0; P.forEach(p => { sp += p.speed; p.laneX += (p.lane - p.laneX) * Math.min(1, dt * 10); });
    this.v = sp / P.length / 3.6 * this.slow;
    const d = this.v * dt; this.dist += d;

    if (this.phase === 'free') {
      this.wait -= dt;
      if (this.rows > 0) { this.rowDist -= d; if (this.rowDist <= 0) { this.spawnRow(); this.rows--; this.rowDist = CFG.ROW_GAP; } }
      const p = P[0];
      for (const e of this.ents) {
        e.z += d;
        if (!e.hit && e.z > -1 && e.z < 2.5 && Math.abs(p.laneX - e.lane) < 0.55) { e.hit = true; this.collide(p, e); }
      }
      this.ents = this.ents.filter(e => e.z < 10);
      if (!this.rows && !this.ents.length && this.wait <= 0) this.startQuestion();
    } else if (this.phase === 'question') {
      const a = this.qa, rem = Math.max(a.T - a.t, 1e-3);
      a.z += (-a.z) * Math.min(1, dt / rem); a.t += dt;
      // Tout le monde a choisi : on raccourcit l'attente, sans jamais couper les premières secondes de lecture
      if (P.every(p => p.choice !== null)) a.T = Math.min(a.T, Math.max(a.t + CFG.AFTER_CHOICE, CFG.MIN_LOCK));
      this.ui.timer(Math.max(0, (a.T - a.t) / a.T0));
      if (a.t >= a.T) this.resolve();
    } else if (this.phase === 'hold') {
      this.hold -= dt;
      if (this.hold <= 0) {
        if (this.over || this.answered >= this.nq) { this.phase = 'done'; this.ui.end(); }
        else this.startFree();
      }
    }
  }

  resolve() {
    const a = this.qa, q = a.q, res = []; this.answered++;
    this.players.forEach(p => {
      const none = p.choice === null, ok = !none && p.choice === a.correctLane;
      const r = { ok, none, gain: 0, life: false, shield: false };
      p.time += none ? a.T0 : p.choiceT;
      if (ok) {
        p.correct++; p.streak++;
        p.speed = Math.min(CFG.MAXV, p.speed + CFG.BOOST); p.vmax = Math.max(p.vmax, p.speed);
        r.gain = Math.round(100 * mult(p) + p.speed / 2); p.score += r.gain; p.boostT = this.t;
        if (!this.noLives && p.streak % CFG.LIFE_STREAK === 0 && p.lives < CFG.MAXLIVES) { p.lives++; r.life = true; }
      } else {
        p.streak = 0; p.speed = Math.max(CFG.MINV, p.speed - CFG.PENALTY); p.missed.push(a.id); p.hitT = this.t;
        if (!this.noLives) { p.lives--; if (p.lives <= 0 && this.answered <= CFG.SAFE_Q) { p.lives = 1; r.shield = true; } }
      }
      res.push(r);
    });
    if (!this.duel) { const s = this.stats[q.th]; s[1]++; if (res[0].ok) s[0]++; }
    if (!this.duel) {   // difficulté adaptative en solo seulement
      if (res[0].ok) {
        this.okRun++; this.koRun = 0;
        if (this.okRun >= 3) { this.level = Math.min(3, this.level + 1); this.okRun = 0; }
      } else {
        this.koRun++; this.okRun = 0; this.retry.push({ f: q.f, at: this.answered + 2 });
        if (this.koRun >= 2) { this.level = Math.max(1, this.level - 1); this.koRun = 0; }
      }
    }
    this.over = !this.noLives && this.players[0].lives <= 0;
    this.phase = 'hold'; this.hold = this.duel ? 3 : (res[0].ok ? 1.3 : Infinity);
    this.qa = null;   // correction du bug d'origine : la question active est bien libérée
    this.ui.resolved(q, res);
  }

  resume() { if (this.phase === 'hold') this.hold = 0; }

  result() {
    const p = this.players[0], pct = this.answered ? p.correct / this.answered : 0;
    const win = !this.over && this.answered >= this.nq;
    return {
      win, pct, stars: win ? (pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1) : 0,
      score: p.score, correct: p.correct, answered: this.answered, vmax: p.vmax,
      dist: this.dist / 1000, missed: p.missed, ids: this.ids, stats: this.stats
    };
  }
}

import { CIRCUITS, MODES, MODE_NAME } from './game.js';
import { THEME_NAMES, BANK } from './questions.js';

const KEY = 'smm3-save-v1', SALT = 'moto-maths-2026';
// circ[i] = { D:{s,b}, I:{s,b}, C:{s,b} } — un palmarès par mode de vitesse
// s = étoiles (0..3), b = meilleur score
const slot = () => ({ s: 0, b: 0 });
const circBlank = () => ({ D: slot(), I: slot(), C: slot() });
const blank = () => ({
  name: '', cls: '', xp: 0, runs: 0, duels: 0,
  circ: [0, 1, 2, 3].map(circBlank),
  th: { G: [0, 0], D: [0, 0], E: [0, 0] },             // [réussies, posées]
  missed: [], skin: 0, mute: true, lowfx: false, mode: 1   // mode = dernier mode choisi
});
export const S = blank();

const clampSlot = x => ({ s: Math.max(0, Math.min(3, (x && x.s) | 0)), b: Math.max(0, (x && x.b) | 0) });
// Met la sauvegarde au format courant (migration de l'ancien format {s,b} vers D/I/C)
function fixCirc(r) {
  if (!Array.isArray(r.circ) || r.circ.length !== 4) return false;
  r.circ = r.circ.map(c => {
    if (c && typeof c === 'object' && ('D' in c || 'I' in c || 'C' in c)) {
      return { D: clampSlot(c.D), I: clampSlot(c.I), C: clampSlot(c.C) };
    }
    // Ancienne sauvegarde : la progression d'avant les modes est conservée en Intermédiaire
    return { D: slot(), I: clampSlot(c), C: slot() };
  });
  return true;
}
// Contrôle de forme d'une sauvegarde (localStorage ou code collé par l'élève)
function valid(r) {
  if (!(r && typeof r === 'object' &&
    r.th && ['G', 'D', 'E'].every(k => Array.isArray(r.th[k]) && r.th[k].length === 2) &&
    Array.isArray(r.missed) && typeof r.xp === 'number')) return false;
  if (!fixCirc(r)) return false;
  if (!Number.isInteger(r.mode) || r.mode < 0 || r.mode >= MODES.length) r.mode = 1;
  return true;
}
try { const r = JSON.parse(localStorage.getItem(KEY)); if (valid(r)) Object.assign(S, r); } catch (e) { }
export function persist() { try { localStorage.setItem(KEY, JSON.stringify(S)); return true; } catch (e) { return false; } }

// Meilleur palmarès d'un circuit, tous modes confondus (sert aux menus et au bilan)
export function bestOf(c) {
  let w = { s: -1, b: -1, k: '' };
  MODES.forEach(m => {
    const v = c[m.id] || slot();
    if (v.s > w.s || (v.s === w.s && v.b > w.b)) w = { s: v.s, b: v.b, k: m.id };
  });
  return w.s < 0 ? { s: 0, b: 0, k: '' } : w;
}

export const pilotLevel = xp => 1 + Math.floor(Math.sqrt(xp / 400));
export const pct = k => S.th[k][1] ? Math.round(100 * S.th[k][0] / S.th[k][1]) : null;
export function themeRank() {
  const ks = Object.keys(S.th).filter(k => S.th[k][1] >= 3);
  if (!ks.length) return null;
  ks.sort((a, b) => pct(b) - pct(a));
  return { best: ks[0], worst: ks[ks.length - 1] };
}

function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(36).toUpperCase();
}
const norm = s => s.normalize('NFC').replace(/\s+/g, '');
const sign = body => hash(SALT + norm(body)).padStart(7, '0');

export function bilanText() {
  const p = k => S.th[k][1] ? pct(k) + ' % (' + S.th[k][0] + '/' + S.th[k][1] + ')' : 'pas encore joué';
  const r = themeRank();
  const L = [
    'SUPER MOTO MATHS - Bilan',
    'Élève : ' + S.name + ' - Classe : ' + S.cls,
    'Date : ' + new Date().toLocaleDateString('fr-FR'),
    'Niveau pilote : ' + pilotLevel(S.xp) + ' (' + S.xp + ' XP)',
    'Courses : ' + S.runs + ' - Duels : ' + S.duels,
    'Circuits : ' + CIRCUITS.map((c, i) => {
      const w = bestOf(S.circ[i]);
      return c.name + ' ' + w.s + '/3' + (w.k && w.s ? ' (' + MODE_NAME(w.k) + ')' : '');
    }).join(', ')
  ].concat(Object.keys(THEME_NAMES).map(k => THEME_NAMES[k] + ' : ' + p(k)));
  L.push('Point fort : ' + (r ? THEME_NAMES[r.best] : 'à venir'));
  L.push('À travailler : ' + (r && r.worst !== r.best ? THEME_NAMES[r.worst] : 'à venir'));
  const miss = S.missed.filter(i => BANK[i]).slice(0, 3);
  if (miss.length) L.push('Dernières erreurs :', ...miss.map(i => '- [' + THEME_NAMES[BANK[i].th] + '] ' + BANK[i].q));
  const body = L.join('\n') + '\n';
  return body + 'Code : ' + sign(body);
}
// true = intact, false = modifié, null = code introuvable
export function verify(text) {
  const m = text.match(/Code\s*:\s*([0-9A-Za-z]+)\s*$/);
  if (!m) return null;
  return sign(text.slice(0, m.index)) === m[1].toUpperCase();
}

/* ----- Code de sauvegarde : transférer sa progression (ex. Safari -> appli installée) ----- */
export function exportSave() {
  const b = btoa(unescape(encodeURIComponent(JSON.stringify(S))));
  return 'SMM-' + b + '-' + sign(b);
}
// Renvoie true si la progression a été importée, false si le code est invalide
export function importSave(code) {
  const c = String(code || '').replace(/\s+/g, ''), m = c.match(/^SMM-([A-Za-z0-9+/=]+)-([0-9A-Z]+)$/);
  if (!m || sign(m[1]) !== m[2]) return false;
  try {
    const r = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
    if (!valid(r)) return false;
    Object.assign(S, r, { mute: true }); persist(); return true;
  } catch (e) { return false; }
}

/* ----- Codes défi : circuit + questions + bonnes réponses + score + contrôle -----
   Format inchangé : les codes déjà distribués aux élèves restent valides. */
const b36 = (n, l) => Math.max(0, Math.min(n, Math.pow(36, l) - 1)).toString(36).toUpperCase().padStart(l, '0');
const chk = b => hash(SALT + b).slice(-2).padStart(2, '0');
export function makeDefi(circuit, ids, correct, score) {
  const b = circuit + ids.map(i => b36(i, 2)).join('') + b36(correct, 1) + b36(score, 4);
  return b + chk(b);
}
export function readDefi(code) {
  code = (code || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
  const n = (code.length - 8) / 2;
  if (n < 1 || n % 1) return null;
  const b = code.slice(0, -2);
  if (chk(b) !== code.slice(-2)) return null;
  const circuit = +b[0]; if (!(circuit >= 0 && circuit <= 3)) return null;
  const ids = []; for (let i = 0; i < n; i++) ids.push(parseInt(b.substr(1 + 2 * i, 2), 36));
  if (ids.some(i => !(i < BANK.length))) return null;   // code créé avec une autre banque de questions
  return { circuit, ids, correct: parseInt(b[1 + 2 * n], 36), score: parseInt(b.slice(2 + 2 * n), 36) };
}

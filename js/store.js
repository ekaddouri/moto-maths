import { CIRCUITS } from './game.js';
import { THEME_NAMES, BANK } from './questions.js';

const KEY = 'smm3-save-v1', SALT = 'moto-maths-2026';
const blank = () => ({
  name: '', cls: '', xp: 0, runs: 0, duels: 0,
  circ: [0, 1, 2, 3].map(() => ({ s: 0, b: 0 })),      // s = étoiles, b = meilleur score
  th: { G: [0, 0], D: [0, 0], E: [0, 0] },             // [réussies, posées]
  missed: [], skin: 0, mute: true, lowfx: false
});
export const S = blank();
// Contrôle de forme d'une sauvegarde (localStorage ou code collé par l'élève)
function valid(r) {
  return r && typeof r === 'object' && Array.isArray(r.circ) && r.circ.length === 4 &&
    r.th && ['G', 'D', 'E'].every(k => Array.isArray(r.th[k]) && r.th[k].length === 2) &&
    Array.isArray(r.missed) && typeof r.xp === 'number';
}
try { const r = JSON.parse(localStorage.getItem(KEY)); if (valid(r)) Object.assign(S, r); } catch (e) { }
export function persist() { try { localStorage.setItem(KEY, JSON.stringify(S)); return true; } catch (e) { return false; } }

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
    'Circuits : ' + CIRCUITS.map((c, i) => c.name + ' ' + S.circ[i].s + '/3').join(', ')
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

/* ----- Codes défi : circuit + questions + bonnes réponses + score + contrôle ----- */
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

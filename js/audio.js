// Sons entièrement synthétisés (WebAudio). Coupé par défaut.
let ctx = null, master = null, eng = null, engGain = null, playing = false, nextT = 0, step = 0;
const BASS = [55, 55, 110, 55, 65.4, 65.4, 130.8, 65.4, 49, 49, 98, 49, 73.4, 73.4, 146.8, 73.4];
const LEAD = [440, 523.3, 659.3, 523.3, 587.3, 440, 392, 523.3];

function ensure() {
  if (ctx) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.connect(ctx.destination);
    eng = ctx.createOscillator(); eng.type = 'sawtooth'; eng.frequency.value = 60;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420;
    engGain = ctx.createGain(); engGain.gain.value = 0;
    eng.connect(f); f.connect(engGain); engGain.connect(master); eng.start();
    setInterval(sched, 100);
  } catch (e) { ctx = null; }
}
function tone(f, t0, dur, type, vol) {
  if (!ctx || ctx.state !== 'running') return;
  try {
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + t0;
    o.type = type || 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(vol || 0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  } catch (e) { }
}
function sched() {
  if (!ctx || !playing || ctx.state !== 'running') return;
  if (nextT < ctx.currentTime) nextT = ctx.currentTime + 0.05;
  while (nextT < ctx.currentTime + 0.25) {
    const t0 = nextT - ctx.currentTime;
    tone(BASS[step % 16], t0, 0.2, 'sawtooth', 0.07);
    if (step % 4 === 2) tone(LEAD[(step >> 2) % 8], t0, 0.25, 'triangle', 0.045);
    nextT += 0.27; step++;
  }
}
// À appeler depuis un clic (exigence des navigateurs)
export function setMuted(m) {
  if (!m) ensure();
  if (ctx) { try { m ? ctx.suspend() : ctx.resume(); } catch (e) { } }
}
export function music(on) { playing = on; }
export function engine(kmh, on) {
  if (!ctx || ctx.state !== 'running') return;
  eng.frequency.setTargetAtTime(45 + kmh * 0.55, ctx.currentTime, 0.1);
  engGain.gain.setTargetAtTime(on ? 0.045 : 0, ctx.currentTime, 0.15);
}
export function sfx(n) {
  if (n === 'good') { tone(620, 0, 0.1); tone(930, 0.1, 0.18); }
  else if (n === 'bad') tone(170, 0, 0.32, 'sawtooth', 0.13);
  else if (n === 'orb') tone(1250, 0, 0.07, 'sine', 0.08);
  else if (n === 'hit') tone(90, 0, 0.25, 'square', 0.14);
  else if (n === 'boost') { tone(440, 0, 0.08); tone(660, 0.06, 0.12); }
  else if (n === 'tick') tone(800, 0, 0.04, 'sine', 0.05);
  else if (n === 'finish') { tone(523, 0, 0.14); tone(659, 0.14, 0.14); tone(784, 0.28, 0.14); tone(1046, 0.42, 0.4); }
}

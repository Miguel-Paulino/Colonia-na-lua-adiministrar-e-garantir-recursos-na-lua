// Selene: Colônia Lunar — RPG 2D de mapa, estilo clássico
const cv = document.getElementById('c'), g = cv.getContext('2d');
cv.width = 640; cv.height = 480; cv.focus();
const T = 32, NM = ['Oxigênio', 'Energia', 'Água'], K = ['o2', 'en', 'ag'], LB = ['O₂', 'EN', 'H₂O'];
const COR = { o2: '#4fc3f7', en: '#ffd54f', ag: '#4f8cff', term: '#b0b8d0' };
const OB = { o2: [3, 3], en: [16, 3], ag: [3, 8], term: [16, 8], npc: [9, 5] };
const DIR = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
 
// 6 fases, 2 caminhos em cada. e = efeitos, c = influência corporativa.
const F = {
  f1: { t: 'Fase 1 · Pouso', x: 'Onde erguer a Base Alfa?', o: [
    { t: 'Polo Sul: gelo e sombra', e: { ag: 15, en: -5 }, n: 'f2a' },
    { t: 'Mar da Tranquilidade: sol e planície', e: { en: 15, ag: -5 }, n: 'f2b' }] },
  f2a: { t: 'Fase 2 · Gelo Eterno', x: 'Água sobra, falta Sol. A Terra oferece apoio.', o: [
    { t: 'Aceitar a agência internacional', e: { en: 10, mo: 10 }, n: 'f3a' },
    { t: 'Assinar contrato exclusivo com a MoonCorp', e: { en: 20, mo: -10, c: 1 }, n: 'f3b' }] },
  f2b: { t: 'Fase 2 · Campos Solares', x: 'Energia sobra, falta água.', o: [
    { t: 'Construir usina de gelo sustentável', e: { ag: 15, mo: 5 }, n: 'f3a' },
    { t: 'Minerar sem limites', e: { ag: 25, mo: -15, c: 1 }, n: 'f3b' }] },
  f3a: { t: 'Fase 3 · Colônia Aberta', x: 'Chegam novos colonos. Qual o foco?', o: [
    { t: 'Laboratório aberto a todos', e: { mo: 15, o2: 5 }, n: 'f4a' },
    { t: 'Indústria de hélio-3 regulada', e: { en: 15, mo: -5 }, n: 'f4b' }] },
  f3b: { t: 'Fase 3 · Domínio Corporativo', x: 'A MoonCorp cobra até pelo ar que respiramos.', o: [
    { t: 'Negociar e dividir o controle', e: { mo: 10, o2: -5 }, n: 'f4b' },
    { t: 'Reprimir os protestos', e: { o2: 15, mo: -25, c: 1 }, n: 'f4c' }] },
  f4a: { t: 'Fase 4 · Cidade Cúpula', x: 'A colônia prospera e atrai atenção.', o: [
    { t: 'Abrir a cúpula a visitantes', e: { mo: 10, ag: -5 }, n: 'f5a' },
    { t: 'Investir em cultivo de alimentos', e: { o2: 10, en: -5 }, n: 'f5b' }] },
  f4b: { t: 'Fase 4 · Encruzilhada', x: 'A colônia é viável, mas dependente da Terra.', o: [
    { t: 'Buscar independência', e: { mo: 5, en: -5 }, n: 'f5b' },
    { t: 'Aceitar mais investimento corporativo', e: { en: 10, mo: -5, c: 1 }, n: 'f5c' }] },
  f4c: { t: 'Fase 4 · Poeira e Medo', x: 'Ninguém mais confia em você.', o: [
    { t: 'Anistiar os rebeldes', e: { mo: 15, en: -10 }, n: 'f5b' },
    { t: 'Dobrar a vigilância', e: { o2: 10, mo: -15, c: 1 }, n: 'f5c' }] },
  f5a: { t: 'Fase 5 · Era de Ouro', x: 'Há recursos e paz. Qual será a meta?', o: [
    { t: 'Fundar uma universidade lunar', e: { mo: 10 }, n: 'f6a' },
    { t: 'Priorizar a segurança da base', e: { en: -5, o2: 5 }, n: 'f6b' }] },
  f5b: { t: 'Fase 5 · Meio-Termo', x: 'A base se sustenta, mas com dívidas.', o: [
    { t: 'Pagar a dívida com as reservas', e: { ag: -10, mo: 5 }, n: 'f6b' },
    { t: 'Renegociar com a MoonCorp', e: { en: 10, c: 1 }, n: 'f6c' }] },
  f5c: { t: 'Fase 5 · Sombra da Corporação', x: 'A MoonCorp quer o controle total.', o: [
    { t: 'Resistir ao lado dos colonos', e: { mo: 10, o2: -10 }, n: 'f6b' },
    { t: 'Ceder em troca de recursos', e: { en: 15, mo: -15, c: 1 }, n: 'f6c' }] },
  f6a: { t: 'Fase 6 · Decisão Final: Aurora', x: 'O Conselho da Terra espera seu rumo.', o: [
    { t: 'Declarar a Lua patrimônio de todos', e: {}, n: 'F1' },
    { t: 'Liderar a expedição a Marte', e: {}, n: 'F2' }] },
  f6b: { t: 'Fase 6 · Decisão Final: Equilíbrio', x: 'A base é viável, mas frágil.', o: [
    { t: 'Fechar a base e se isolar', e: {}, n: 'F3' },
    { t: 'Refundar a colônia com novas regras', e: {}, n: 'F4' }] },
  f6c: { t: 'Fase 6 · Decisão Final: Sombra', x: 'A MoonCorp aguarda sua assinatura.', o: [
    { t: 'Vender a base', e: {}, n: 'F5' },
    { t: 'Governar com mão de ferro', e: {}, n: 'F6' }] }
};
const FIM = {
  F1: ['Aliança Lunar', 'A Lua vira patrimônio de toda a humanidade. A ciência floresce e a colônia vira lar.', 'bom'],
  F2: ['Ponte para Marte', 'Sua base se torna o porto de partida para o planeta vermelho. Uma nova era começa.', 'bom'],
  F3: ['Fortaleza Isolada', 'A base sobrevive sozinha, segura e fria. Ninguém mais chega, ninguém mais sai.', 'neutro'],
  F4: ['Segunda Chance', 'Depois de erros graves, os colonos reconstroem a base em bases mais justas.', 'neutro'],
  F5: ['Lua S/A', 'A MoonCorp compra tudo. Colonos viram funcionários e o ar passa a ter mensalidade.', 'ruim'],
  F6: ['Ditadura de Poeira', 'Seu governo se mantém pelo medo. A colônia vive, mas ninguém quer ficar.', 'ruim'],
  X1: ['Asfixia', 'O oxigênio acabou. A Base Alfa silenciou.', 'ruim'],
  X2: ['Apagão', 'Sem energia, o calor e a pressão falharam. A noite lunar venceu.', 'ruim'],
  X3: ['Sede', 'Sem água, a colônia não resistiu. Faltou equilíbrio.', 'ruim'],
  X4: ['Motim', 'Os colonos perderam a esperança e tomaram a base.', 'ruim']
};
const TIPO = { bom: '#6be3a1', neutro: '#f2c14e', ruim: '#ff5a5f' };
 
let S, id, ph, pool, done = {}, mode = 'title', P = { x: 9, y: 10, d: 'u', mv: 0, t: 0 }, dlg, menu, endId, keys = {};
const fin = () => { try { return JSON.parse(localStorage.fim || '[]'); } catch (_) { return []; } };
const clamp = () => { K.forEach(k => S[k] = Math.min(60, S[k])); S.mo = Math.min(100, S.mo); };
const say = (l, cb) => { mode = 'dlg'; dlg = { l, i: 0, n: 0, cb }; };
const choose = (o, cb, q) => { mode = 'menu'; menu = { o, cb, q, i: 0 }; };
const solid = (x, y) => x <= 0 || x >= 19 || y <= 1 || y >= 14 || Object.values(OB).some(o => o[0] == x && o[1] == y);
 
function novo() {
  S = { o2: 30, en: 30, ag: 30, mo: 50, c: 0 }; id = 'f1'; ph = 1; pool = 6; done = {};
  P = { x: 9, y: 10, d: 'u', mv: 0, t: 0 };
  say(['Ano 2090. Você comanda a Base Alfa, na Lua.',
    'Em cada fase, visite as 3 estações e escolha quantos colonos enviar. Depois, use o terminal para encerrar o ciclo.',
    F.f1.t + '. Colonos livres: 6.']);
}
function act() {
  const [dx, dy] = DIR[P.d], k = Object.keys(OB).find(k => OB[k][0] == P.x + dx && OB[k][1] == P.y + dy);
  if (!k) return;
  if (k == 'npc') {
    const m = K.reduce((a, b) => S[b] < S[a] ? b : a, 'o2');
    return say(['Dra. Luna: ' + (S[m] < 25 ? `${NM[K.indexOf(m)]} está baixo (${Math.round(S[m])}). Mande mais colonos para lá.` : 'Tudo estável. Quando terminar, fale com o terminal.'),
      'Dra. Luna: O consumo sobe a cada fase. Os colonos novos ajudam.']);
  }
  if (k == 'term') return term();
  if (done[k]) return say(['Esta estação já foi operada neste ciclo.']);
  const o = [...Array(Math.min(4, pool) + 1).keys()].map(n => n + (n == 1 ? ' colono' : ' colonos'));
  choose(o, n => { pool -= n; S[k] += n * 4; done[k] = 1; clamp(); say([n ? `${n} colonos trabalham na estação. +${n * 4} ${NM[K.indexOf(k)]}.` : 'A estação ficou parada.']); },
    `Estação de ${NM[K.indexOf(k)]}. Colonos livres: ${pool}. Quantos enviar?`);
}
function term() {
  if (!K.every(k => done[k])) return say(['Terminal: opere as 3 estações antes de encerrar o ciclo.']);
  const c = 4 + 2 * ph;
  K.forEach(k => S[k] -= c); clamp();
  if (K.some(k => S[k] < 10)) S.mo -= 10;
  if (dead()) return;
  say([`Ciclo encerrado. Consumo: ${c} de cada recurso.`], () =>
    choose(F[id].o.map(o => o.t), esc, F[id].t + ': ' + F[id].x));
}
function dead() {
  const m = K.findIndex(k => S[k] <= 0);
  if (m >= 0) { fim('X' + (m + 1)); return 1; }
  if (S.mo <= 0) { fim('X4'); return 1; }
}
function esc(i) {
  const o = F[id].o[i];
  for (const k in o.e) S[k] += o.e[k];
  clamp(); if (dead()) return;
  id = o.n;
  if (FIM[id]) return fim(id);
  ph = +id[1]; pool = 5 + ph; done = {};
  say([F[id].t + '.', F[id].x + ` Colonos livres: ${pool}.`]);
}
function fim(e) {
  mode = 'end'; endId = e;
  try { const a = fin(); if (!a.includes(e)) localStorage.fim = JSON.stringify(a.concat(e)); } catch (_) {}
}
function press() {
  if (mode == 'title') return novo();
  if (mode == 'end') { mode = 'title'; return; }
  if (mode == 'dlg') {
    const l = dlg.l[dlg.i];
    if (dlg.n < l.length) return dlg.n = l.length;
    if (++dlg.i < dlg.l.length) { dlg.n = 0; return; }
    mode = 'walk'; return dlg.cb && dlg.cb();
  }
  if (mode == 'menu') { mode = 'walk'; return menu.cb(menu.i); }
  if (mode == 'walk') act();
}
const KM = { arrowup: 'u', w: 'u', arrowdown: 'd', s: 'd', arrowleft: 'l', a: 'l', arrowright: 'r', d: 'r' };
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k.startsWith('arrow') || k == ' ') e.preventDefault();
  const d = KM[k];
  if (d) {
    keys[d] = 1;
    if (mode == 'menu' && !e.repeat) menu.i = (menu.i + (d == 'u' || d == 'l' ? -1 : 1) + menu.o.length) % menu.o.length;
  } else if (!e.repeat && ['z', 'enter', ' '].includes(k)) press();
});
addEventListener('keyup', e => { const d = KM[e.key.toLowerCase()]; if (d) keys[d] = 0; });
 
function upd(dt) {
  if (P.mv) { P.t += dt / 140; if (P.t >= 1) { P.x = P.tx; P.y = P.ty; P.mv = 0; } }
  else if (mode == 'walk') {
    const d = ['u', 'd', 'l', 'r'].find(k => keys[k]);
    if (d) {
      P.d = d; const nx = P.x + DIR[d][0], ny = P.y + DIR[d][1];
      if (!solid(nx, ny)) { P.tx = nx; P.ty = ny; P.t = 0; P.mv = 1; }
    }
  }
  if (mode == 'dlg') dlg.n = Math.min(dlg.n + dt / 25, dlg.l[dlg.i].length);
}
 
// ---------- desenho ----------
function sprite(x, y, d, c, bob) {
  g.fillStyle = '#0006'; g.fillRect(x + 8, y + 26, 16, 4);
  g.fillStyle = c; g.fillRect(x + 9, y + 15 + bob, 14, 11);
  g.fillStyle = '#e8e8f0'; g.fillRect(x + 8, y + 4 + bob, 16, 12);
  g.fillStyle = '#1a2a55';
  if (d == 'd') g.fillRect(x + 10, y + 7 + bob, 12, 7);
  if (d == 'l') g.fillRect(x + 8, y + 7 + bob, 8, 7);
  if (d == 'r') g.fillRect(x + 16, y + 7 + bob, 8, 7);
}
const box = (x, y, w, h) => { g.fillStyle = '#0d1530'; g.fillRect(x, y, w, h); g.strokeStyle = '#e6ebf5'; g.lineWidth = 3; g.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3); };
function wrap(s, w) {
  const out = []; let l = '';
  for (const p of s.split(' ')) { const t = l ? l + ' ' + p : p; if (g.measureText(t).width > w && l) { out.push(l); l = p; } else l = t; }
  out.push(l); return out;
}
const text = (s, x, y) => wrap(s, 580).forEach((l, i) => g.fillText(l, x, y + i * 22));
function draw(t) {
  g.font = 'bold 16px "Courier New",monospace'; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  if (mode == 'title' || mode == 'end') {
    g.fillStyle = '#050a18'; g.fillRect(0, 0, 640, 480);
    g.fillStyle = '#fff'; for (let i = 0; i < 60; i++) g.fillRect((i * 97) % 640, (i * 53) % 480, 2, 2);
    g.textAlign = 'center';
    if (mode == 'title') {
      g.fillStyle = '#5cd6ff'; g.font = 'bold 48px "Courier New",monospace'; g.fillText('SELENE', 320, 190);
      g.fillStyle = '#e6ebf5'; g.font = 'bold 20px "Courier New",monospace'; g.fillText('Colônia Lunar', 320, 225);
      g.font = 'bold 16px "Courier New",monospace';
      if (t % 1000 < 650) g.fillText('Pressione Z ou Enter', 320, 320);
      g.fillStyle = '#8d9ab5'; g.fillText(`Finais descobertos: ${fin().length}/${Object.keys(FIM).length}`, 320, 370);
    } else {
      const f = FIM[endId];
      g.fillStyle = TIPO[f[2]]; g.fillText('Final ' + f[2], 320, 150);
      g.fillStyle = '#fff'; g.font = 'bold 32px "Courier New",monospace'; g.fillText(f[0], 320, 200);
      g.font = 'bold 16px "Courier New",monospace'; g.textAlign = 'left';
      g.fillStyle = '#e6ebf5'; wrap(f[1], 500).forEach((l, i) => g.fillText(l, 70, 250 + i * 24));
      g.textAlign = 'center'; g.fillStyle = '#8d9ab5'; g.fillText('Pressione Z para voltar ao menu', 320, 400);
    }
    return;
  }
  const corp = S.c > 0;
  for (let y = 0; y < 15; y++) for (let x = 0; x < 20; x++) {
    const w = x == 0 || x == 19 || y <= 1 || y == 14;
    g.fillStyle = w ? '#4a5470' : (x + y) % 2 ? (corp ? '#3a2733' : '#27304a') : (corp ? '#34222d' : '#222a40');
    g.fillRect(x * T, y * T, T, T);
    if (w) { g.fillStyle = '#5d6890'; g.fillRect(x * T, y * T, T, 3); }
  }
  for (const k in OB) {
    const x = OB[k][0] * T, y = OB[k][1] * T;
    if (k == 'npc') { sprite(x, y, 'd', '#ff9a3c', 0); continue; }
    g.globalAlpha = done[k] ? .45 : 1; g.fillStyle = COR[k]; g.fillRect(x + 1, y + 1, 30, 30);
    g.fillStyle = '#0d1530'; g.fillRect(x + 4, y + 4, 24, 24);
    g.fillStyle = COR[k]; g.textAlign = 'center'; g.font = 'bold 12px "Courier New",monospace';
    g.fillText(k == 'term' ? '>_' : LB[K.indexOf(k)], x + 16, y + 21); g.globalAlpha = 1;
  }
  const f = P.mv ? P.t : 0;
  sprite((P.x + (P.mv ? (P.tx - P.x) * f : 0)) * T, (P.y + (P.mv ? (P.ty - P.y) * f : 0)) * T, P.d, corp ? '#ff5a5f' : '#5cd6ff', P.mv ? Math.round(Math.sin(t / 60) * 2) : 0);
  // HUD
  g.fillStyle = '#0b1226'; g.fillRect(0, 0, 640, 60); g.textAlign = 'left';
  [...K, 'mo'].forEach((k, i) => {
    const x = 10 + i * 155, mx = k == 'mo' ? 100 : 60;
    g.font = 'bold 13px "Courier New",monospace'; g.fillStyle = '#e6ebf5'; g.fillText(`${k == 'mo' ? 'Moral' : NM[i]} ${Math.round(S[k])}`, x, 18);
    g.fillStyle = '#243252'; g.fillRect(x, 24, 140, 7);
    g.fillStyle = S[k] < 10 ? '#ff5a5f' : k == 'mo' ? '#6be3a1' : COR[k]; g.fillRect(x, 24, 140 * Math.max(0, S[k]) / mx, 7);
  });
  g.fillStyle = '#8d9ab5'; g.fillText(`${F[id].t} · colonos livres: ${pool}`, 10, 50);
  g.font = 'bold 16px "Courier New",monospace';
  if (mode == 'dlg') {
    box(10, 370, 620, 100); g.fillStyle = '#fff';
    text(dlg.l[dlg.i].slice(0, dlg.n | 0), 28, 400);
    if (dlg.n >= dlg.l[dlg.i].length && t % 800 < 500) g.fillText('▼', 600, 458);
  }
  if (mode == 'menu') {
    box(10, 370, 620, 100); g.fillStyle = '#fff'; text(menu.q, 28, 400);
    const h = menu.o.length * 26 + 16, y = 360 - h;
    box(10, y, 620, h);
    menu.o.forEach((o, i) => { g.fillStyle = i == menu.i ? '#ffd54f' : '#e6ebf5'; g.fillText((i == menu.i ? '▶ ' : '   ') + o, 28, y + 28 + i * 26); });
  }
}
let last = 0;
(function loop(t) { upd(Math.min(50, t - last || 16)); last = t; draw(t); requestAnimationFrame(loop); })(0);
 
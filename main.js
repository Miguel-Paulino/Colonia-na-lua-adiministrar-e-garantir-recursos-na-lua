// Selene: Colônia Lunar — gestão de recursos com caminhos ramificados
const $ = s => document.querySelector(s);
const NM = ['Oxigênio', 'Energia', 'Água'], K = ['o2', 'en', 'ag'];
 
// Cada fase tem 2 caminhos. 'c' = influência corporativa (deixa a base vermelha).
const F = {
  f1: { t: 'Fase 1 · Pouso em Selene', x: 'Sua nave toca o solo lunar. Onde erguer a Base Alfa?', o: [
    { t: 'Polo Sul: crateras com gelo', e: { ag: 15, en: -5 }, n: 'f2a' },
    { t: 'Mar da Tranquilidade: plano e ensolarado', e: { en: 15, ag: -5 }, n: 'f2b' }] },
  f2a: { t: 'Fase 2 · O Gelo Eterno', x: 'O gelo garante água, mas o Sol mal chega ao polo. A Terra oferece apoio.', o: [
    { t: 'Aceitar ajuda de uma agência internacional', e: { en: 10, mo: 10 }, n: 'f3a' },
    { t: 'Assinar contrato exclusivo com a MoonCorp', e: { en: 20, mo: -10, c: 1 }, n: 'f3b' }] },
  f2b: { t: 'Fase 2 · Campos Solares', x: 'Energia sobra, mas a água vem de longe. Como resolver?', o: [
    { t: 'Construir uma usina de gelo sustentável', e: { ag: 15, mo: 5 }, n: 'f3a' },
    { t: 'Minerar tudo sem limites', e: { ag: 25, mo: -15, c: 1 }, n: 'f3b' }] },
  f3a: { t: 'Fase 3 · Colônia Aberta', x: 'Novos colonos chegam. Qual será o foco da colônia?', o: [
    { t: 'Laboratório científico aberto a todos', e: { mo: 15, o2: 5 }, n: 'f4a' },
    { t: 'Indústria de hélio-3 regulada', e: { en: 15, mo: -5 }, n: 'f4b' }] },
  f3b: { t: 'Fase 3 · Domínio Corporativo', x: 'A MoonCorp cobra até pelo ar que você respira. Os colonos reclamam.', o: [
    { t: 'Negociar e dividir o controle', e: { mo: 10, o2: -5 }, n: 'f4b' },
    { t: 'Reprimir os protestos', e: { o2: 15, mo: -25, c: 1 }, n: 'f4c' }] },
  f4a: { t: 'Fase 4 · Decisão final: Aurora', x: 'A colônia prospera. O Conselho da Terra espera seu rumo definitivo.', o: [
    { t: 'Declarar a Lua território científico de todos', e: {}, n: 'F1' },
    { t: 'Fechar a base e guardar tudo para si', e: {}, n: 'F2' }] },
  f4b: { t: 'Fase 4 · Decisão final: Encruzilhada', x: 'A colônia é viável, mas dependente. Quem vai guiar o futuro?', o: [
    { t: 'Expandir para Marte em parceria', e: {}, n: 'F3' },
    { t: 'Vender a base para a MoonCorp', e: {}, n: 'F4' }] },
  f4c: { t: 'Fase 4 · Decisão final: Poeira e Ferro', x: 'A colônia produz, mas ninguém confia em você.', o: [
    { t: 'Entregar o poder ao povo', e: {}, n: 'F5' },
    { t: 'Governar com mão de ferro', e: {}, n: 'F6' }] }
};
 
// [título, texto, tipo]
const FIM = {
  F1: ['Aliança Lunar', 'A Lua vira patrimônio de toda a humanidade. A ciência floresce e a colônia se torna lar.', 'bom'],
  F3: ['Ponte para Marte', 'Sua base vira o porto de partida para o planeta vermelho. Uma nova era começa.', 'bom'],
  F2: ['Fortaleza Isolada', 'A base sobrevive sozinha, segura e fria. Ninguém mais chega, ninguém mais sai.', 'neutro'],
  F5: ['Segunda Chance', 'Depois de erros graves, o povo reconstrói a colônia em bases mais justas.', 'neutro'],
  F4: ['Lua S/A', 'A MoonCorp compra tudo. Colonos viram funcionários e o ar passa a ter preço mensal.', 'ruim'],
  F6: ['Ditadura de Poeira', 'Seu governo se mantém pelo medo. A colônia vive, mas ninguém quer ficar.', 'ruim'],
  X1: ['Asfixia', 'O oxigênio acabou. A Base Alfa silenciou.', 'ruim'],
  X2: ['Apagão', 'Sem energia, o calor e a pressurização falharam. A noite lunar venceu.', 'ruim'],
  X3: ['Sede', 'Sem água, a colônia não resistiu. Você precisava de mais equilíbrio.', 'ruim'],
  X4: ['Motim', 'Os colonos perderam a esperança e tomaram a base.', 'ruim']
};
 
let S, W, id, ph = 0;
const fin = () => { try { return JSON.parse(localStorage.fim || '[]'); } catch (_) { return []; } };
 
function hud() {
  if (!S) return ($('#hud').innerHTML = '');
  $('#hud').innerHTML = K.map((k, i) =>
    `<div class="r"><span>${NM[i]}</span><b>${Math.round(S[k])}</b><i style="width:${Math.max(0, S[k]) / 60 * 100}%"></i></div>`).join('') +
    `<div class="r"><span>Moral</span><b>${Math.round(S.mo)}</b><i style="width:${Math.max(0, S.mo)}%"></i></div>`;
}
const clamp = () => { K.forEach(k => S[k] = Math.min(60, S[k])); S.mo = Math.min(100, S.mo); };
 
function menu() {
  S = null; ph = 0; hud();
  $('#p').innerHTML = `<h2>Selene: Colônia Lunar</h2>
    <p>Você comanda a Base Alfa. Distribua colonos entre oxigênio, energia e água, e tome decisões que levam a quatro fases, vários caminhos e seis finais. Nem todos são felizes.</p>
    <button onclick="novo()">Novo jogo</button>
    <small>Finais descobertos: ${fin().length}/${Object.keys(FIM).length}</small>`;
}
function novo() { S = { o2: 25, en: 25, ag: 25, mo: 50, c: 0 }; W = [4, 3, 3]; id = 'f1'; aloc(); }
 
function aloc() {
  ph = +id[1]; hud();
  $('#p').innerHTML = `<h2>${F[id].t}</h2><h3>Distribua os 10 colonos</h3>` +
    K.map((k, i) => `<div class="w"><span>${NM[i]}</span><button onclick="w(${i},-1)" aria-label="Menos">−</button><b id="w${i}">${W[i]}</b><button onclick="w(${i},1)" aria-label="Mais">+</button></div>`).join('') +
    `<button id="go" onclick="ciclo()">Executar 3 ciclos</button>`;
  w(0, 0);
}
function w(i, d) {
  const s = W.reduce((a, b) => a + b);
  if (W[i] + d >= 0 && s + d <= 10) W[i] += d;
  K.forEach((_, j) => $('#w' + j).textContent = W[j]);
  $('#go').disabled = W.reduce((a, b) => a + b) !== 10;
}
 
function ciclo() {
  const cons = 4 + ph; // consumo por recurso a cada ciclo
  for (let j = 0; j < 3; j++) K.forEach((k, i) => S[k] += W[i] * 3 - cons);
  clamp();
  if (K.some(k => S[k] < 10)) S.mo -= 10;
  hud();
  const m = K.findIndex(k => S[k] <= 0);
  if (m >= 0) return fim('X' + (m + 1));
  if (S.mo <= 0) return fim('X4');
  const f = F[id];
  $('#p').innerHTML = `<h2>${f.t}</h2><p>${f.x}</p>` +
    f.o.map((o, i) => `<button class="o" onclick="esc(${i})">${o.t}</button>`).join('');
}
 
function esc(i) {
  const o = F[id].o[i];
  for (const k in o.e) S[k] += o.e[k];
  clamp(); hud();
  const m = K.findIndex(k => S[k] <= 0);
  if (m >= 0) return fim('X' + (m + 1));
  if (S.mo <= 0) return fim('X4');
  id = o.n;
  FIM[id] ? fim(id) : aloc();
}
 
function fim(e) {
  const f = FIM[e], a = fin();
  try { if (!a.includes(e)) localStorage.fim = JSON.stringify(a.concat(e)); } catch (_) {}
  $('#p').innerHTML = `<small class="${f[2]}">Final ${f[2]}</small><h2>${f[0]}</h2><p>${f[1]}</p><button onclick="menu()">Voltar ao menu</button>`;
}
 
// Cenário 2D: estrelas, Terra, relevo, domos (um por fase) e um rover
const cv = $('#c'), g = cv.getContext('2d');
cv.width = 900; cv.height = 360;
const st = Array.from({ length: 70 }, () => [Math.random() * 900, Math.random() * 230, Math.random() * 1.5 + .5]);
function draw(t) {
  g.fillStyle = '#050a18'; g.fillRect(0, 0, 900, 360);
  g.fillStyle = '#fff';
  st.forEach(([x, y, r]) => { g.globalAlpha = .5 + .5 * Math.sin(t / 500 + x); g.fillRect(x, y, r, r); });
  g.globalAlpha = 1;
  g.fillStyle = '#2a6fd6'; g.beginPath(); g.arc(780, 70, 34, 0, 7); g.fill();
  g.fillStyle = '#3fae5a'; g.beginPath(); g.arc(770, 62, 12, 0, 7); g.fill();
  g.fillStyle = '#8c8c96'; g.beginPath(); g.moveTo(0, 360); g.lineTo(0, 270);
  for (let x = 0; x <= 900; x += 30) g.lineTo(x, 265 + 10 * Math.sin(x / 70));
  g.lineTo(900, 360); g.fill();
  g.fillStyle = '#6d6d78';
  [[120, 305, 26], [430, 325, 34], [720, 310, 22]].forEach(([x, y, r]) => { g.beginPath(); g.ellipse(x, y, r, r / 3, 0, 0, 7); g.fill(); });
  const luz = S && S.c > 0 ? '255,90,95' : '92,214,255';
  for (let i = 0; i < ph; i++) {
    const x = 120 + i * 190;
    g.fillStyle = `rgba(${luz},.25)`; g.beginPath(); g.arc(x, 275, 40, Math.PI, 0); g.fill();
    g.strokeStyle = `rgb(${luz})`; g.stroke();
    g.fillStyle = '#c9ced9'; g.fillRect(x - 40, 275, 80, 14);
    g.fillStyle = `rgba(${luz},${.5 + .5 * Math.sin(t / 300 + i)})`; g.fillRect(x - 5, 250, 10, 10);
  }
  g.fillStyle = '#ddd'; g.fillRect((t / 25) % 960 - 30, 292, 22, 8);
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
menu();
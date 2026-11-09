'use strict';
/* Lunar Industries: Colônia Selene
   Jogo 2D de construção de base lunar com narrativa ramificada. 25 dias, 4 rotas políticas, 17 finais. */

const $ = s => document.querySelector(s);
const NOMES = {o2:'oxigênio', en:'energia', agua:'água', comida:'comida', moral:'moral', cred:'créditos', pop:'colonos'};
const BARRAS = [['o2','Oxigênio'],['en','Energia'],['agua','Água'],['comida','Comida'],['moral','Moral']];
const ROTAS = {terra:'Aliança com a Terra', corp:'Helion Corp', indep:'Independência', ciencia:'Ciência / Marte'};
const ULTIMO_DIA = 25;

/* ---------- FINAIS ---------- */
const FINAIS = {
  independencia:{k:'win',t:'Independência Lunar',x:'A bandeira da República de Selene sobe no polo sul. Sem dever nada à Terra nem à Helion, a colônia decide o próprio futuro.'},
  alianca:{k:'win',t:'Parceria Terra-Lua',x:'A ATLAS transforma Selene na primeira base científica permanente da humanidade. Os colonos viram heróis e as naves de suprimento chegam todo mês.'},
  helio:{k:'win',t:'Império do Hélio-3',x:'Os contratos enchem os cofres e a colônia vira a capital energética do sistema Terra-Lua. Rica, próspera e livre de dívidas.'},
  marte:{k:'win',t:'Rumo a Marte',x:'O foguete construído com cristal lunar decola. Selene vira o porto de partida da primeira missão tripulada a Marte.'},
  sobrevivente:{k:'neu',t:'Sobreviventes',x:'Sem se aliar a ninguém, vocês resistiram. Selene é pequena e frágil, mas continua de pé e pronta para o próximo capítulo.'},
  abandono:{k:'neu',t:'Evacuação Honrosa',x:'A Terra ordena a evacuação. Todos voltam vivos para casa, mas a colônia fica vazia e silenciosa.'},
  asfixia:{k:'bad',t:'Sem ar',x:'O oxigênio acabou. Os alarmes tocaram até o silêncio total. Faltou manter a eletrólise em dia.'},
  apagao:{k:'bad',t:'Apagão lunar',x:'Sem energia, o aquecimento falhou e a noite lunar fez o resto. A colônia congelou.'},
  sede:{k:'bad',t:'Sede',x:'Os reservatórios secaram. Sem água não há plantas, nem ar, nem esperança.'},
  fome:{k:'bad',t:'Fome',x:'As estufas não deram conta. Sem comida, a colônia foi abandonada por quem ainda tinha forças.'},
  motim:{k:'bad',t:'Motim',x:'A moral chegou ao fundo. Os colonos tomaram a sala de controle e a colônia se desfez em disputas.'},
  despovoada:{k:'bad',t:'Colônia vazia',x:'Já não resta nenhum colono. Só as máquinas continuam ligadas, sem ninguém para ouvi-las.'},
  escravos:{k:'bad',t:'Escravos da Helion',x:'O contrato foi assinado sem preparo. A Helion assumiu tudo e os colonos viraram mão de obra presa à empresa.'},
  falha_foguete:{k:'bad',t:'Falha na decolagem',x:'O foguete explodiu na plataforma. Faltou energia ou oxigênio para o lançamento, e o sonho de Marte virou fumaça.'},
  vendida:{k:'bad',t:'Colônia vendida',x:'Você vendeu Selene para a Helion e embolsou os créditos. Eles são seus, mas ninguém mais te olha nos olhos.'},
  declinio:{k:'bad',t:'Declínio lento',x:'Sem aliados e sem estoque, a colônia definhou mês após mês até a última luz apagar.'}
};

/* ---------- ESTADO ---------- */
let s;
const novo = () => ({
  dia:1, o2:70, en:70, agua:70, comida:70, moral:70, cred:60, pop:12,
  pts:{terra:0,corp:0,indep:0,ciencia:0},
  blds:[], tempo:0, vel:1, log:[], vistos:[]
});
const minRec = () => Math.min(s.o2, s.en, s.agua, s.comida);
const clamp = v => Math.max(0, Math.min(100, v));

function aplicar(fx = {}) {
  for (const k in fx) {
    if (k === 'cred') s.cred = Math.max(0, s.cred + fx[k]);
    else if (k === 'pop') s.pop = Math.max(0, s.pop + fx[k]);
    else s[k] = clamp(s[k] + fx[k]);
  }
}
function descr(fx = {}) {
  return Object.keys(fx).map(k => `${fx[k] > 0 ? '+' : '−'}${Math.abs(fx[k])} ${NOMES[k]}`).join(', ');
}
function morte() {
  if (s.pop <= 0) return 'despovoada';
  if (s.o2 <= 0) return 'asfixia';
  if (s.en <= 0) return 'apagao';
  if (s.agua <= 0) return 'sede';
  if (s.comida <= 0) return 'fome';
  if (s.moral <= 0) return 'motim';
  return null;
}
function anota(t) { s.log.unshift(`Dia ${s.dia}: ${t}`); s.log = s.log.slice(0, 6); }

/* ---------- EVENTOS ---------- */
const op = (t, fx, extra = {}) => ({t, fx, ...extra});
const HISTORIA = {
  3:{t:'Contato da Terra', x:'A agência ATLAS e a Helion Corp mandam mensagens ao mesmo tempo. Cada uma quer controlar o futuro da colônia e oferece algo em troca.', o:[
    op('Aceitar a ajuda da ATLAS', {comida:15, agua:10}, {pts:{terra:2}, m:'A ATLAS envia suprimentos e relatórios semanais.'}),
    op('Fechar acordo discreto com a Helion', {cred:30}, {pts:{corp:2}, m:'A Helion adianta créditos e pede preferência no hélio-3.'}),
    op('Recusar os dois: a Lua se vira sozinha', {moral:8}, {pts:{indep:2}, m:'Os colonos comemoram a decisão ousada.'})]},
  7:{t:'Contrato do hélio-3', x:'A Helion quer exclusividade sobre toda a extração de hélio-3 da colônia. A oferta é generosa, mas vem com cláusulas pesadas.', o:[
    op('Assinar o contrato', {cred:40, moral:-5}, {pts:{corp:2}, m:'O dinheiro entra, mas a equipe fica desconfiada.'}),
    op('Negociar uma parceria', {cred:15}, {pts:{corp:1, terra:1}, m:'Um acordo meio a meio que não agrada totalmente a ninguém.'}),
    op('Rejeitar e criar uma cooperativa', {moral:10, cred:-10}, {pts:{indep:1}, m:'Os colonos se sentem donos do próprio trabalho.'})]},
  11:{t:'A cratera brilhante', x:'Os sensores detectam gelo e um cristal desconhecido no fundo da cratera Shackleton. Pode ser a descoberta do século, ou uma armadilha.', o:[
    op('Expedição completa', {en:-10, comida:-5, cred:10}, {pts:{ciencia:2}, risco:{p:.3, fx:{pop:-2, moral:-8}, m:'Houve um desabamento e dois colonos se perderam.'}, m:'A equipe volta com amostras do cristal.'}),
    op('Enviar um rover robô', {cred:-10}, {pts:{ciencia:1}, m:'O rover traz imagens e uma amostra pequena.'}),
    op('Ignorar a cratera', {moral:3}, {m:'Prudência. Mas a dúvida fica no ar.'})]},
  15:{t:'Tempestade solar', x:'Uma erupção solar atinge a Lua em poucas horas. Radiação alta na superfície.', o:[
    op('Abrigar todos nos túneis', {en:-12, o2:-8, moral:-3}, {m:'Ninguém se fere, mas o consumo dispara.'}),
    op('Manter os painéis ligados', {en:25, o2:-10}, {risco:{p:.5, fx:{pop:-2, moral:-6}, m:'A radiação atingiu uma equipe externa.'}, m:'Os painéis armazenam uma carga enorme de energia.'}),
    op('Pedir orientação à ATLAS', {moral:2}, {req:s=>s.pts.terra >= 2, pts:{terra:1}, m:'A ATLAS manda um protocolo de proteção perfeito.'})]},
  19:{t:'Greve dos mineradores', x:'O cansaço pesa. Os mineradores param o trabalho e exigem melhores condições.', o:[
    op('Aumentar as rações', {comida:-12, moral:15}, {m:'A greve termina com festa e barriga cheia.'}),
    op('Chamar a segurança da Helion', {moral:-15, cred:20}, {req:s=>s.pts.corp >= 2, pts:{corp:1}, m:'A ordem volta à força, mas o clima fica pesado.'}),
    op('Assembleia democrática', {moral:8, en:-3}, {pts:{indep:1}, m:'Todos votam as regras e se sentem ouvidos.'}),
    op('Citar o protocolo da ATLAS', {moral:-5}, {pts:{terra:1}, m:'Os mineradores voltam, mas contrariados.'})]},
  22:{t:'O ultimato', x:'A Terra e a Helion cobram uma resposta. A decisão final chegará em três dias. Prepare-se para o caminho que escolheu.', o:[
    op('Reforçar laços com a Terra', {cred:-10}, {pts:{terra:2}, m:'Relatórios e promessas fortalecem a parceria.'}),
    op('Estocar para a independência', {comida:-5, agua:-5, moral:6}, {pts:{indep:2}, m:'O povo se mobiliza em torno de uma ideia.'}),
    op('Construir um foguete de pesquisa', {cred:-15, en:-6}, {req:s=>s.cred >= 15, pts:{ciencia:2}, m:'A oficina vira laboratório dia e noite.'}),
    op('Fechar o contrato final com a Helion', {cred:25, moral:-5}, {pts:{corp:2}, m:'Assinatura em mãos e a Helion sorri.'})]},
  25:{t:'A grande decisão', x:'O dia chegou. A Terra, a Helion e seus próprios colonos esperam sua decisão. O que você escolhe para a Colônia Selene?', o:[
    op('Declarar independência', {}, {req:s=>s.pts.indep >= 3, fim:s=>minRec() >= 35 && s.moral >= 40 ? 'independencia' : 'motim'}),
    op('Selar a aliança com a Terra', {}, {req:s=>s.pts.terra >= 3, fim:s=>s.moral >= 35 && minRec() >= 30 ? 'alianca' : 'abandono'}),
    op('Assinar o império do hélio-3', {}, {req:s=>s.pts.corp >= 3, fim:s=>s.cred >= 60 && s.moral >= 40 ? 'helio' : 'escravos'}),
    op('Lançar a missão a Marte', {}, {req:s=>s.pts.ciencia >= 3 && s.cred >= 40, fim:s=>s.en >= 40 && s.o2 >= 40 ? 'marte' : 'falha_foguete'}),
    op('Resistir sem escolher lado', {}, {fim:s=>minRec() >= 50 ? 'sobrevivente' : 'declinio'}),
    op('Vender a colônia para a Helion', {}, {fim:'vendida'})]}
};
const ALEATORIOS = [
  {t:'Chuva de micrometeoritos', x:'Alertas disparam. Uma saraivada de pedras minúsculas vem em direção ao domo principal.', o:[
    op('Reforçar o domo', {en:-6, cred:-8}, {m:'O reforço aguenta tudo.'}),
    op('Apostar que não é nada', {}, {risco:{p:.5, fx:{o2:-15, pop:-1}, m:'Um impacto rompeu um módulo.'}, m:'Por sorte, nenhum impacto sério.'})]},
  {t:'Vazamento no reservatório', x:'Um cano trinca no reservatório principal de água.', o:[
    op('Consertar agora', {cred:-10, en:-3}, {m:'Reparo bem feito.'}),
    op('Improvisar com fita', {agua:-12}, {m:'Segura, mas perde-se muita água.'})]},
  {t:'Fungo na estufa', x:'Um fungo cobre as folhas da estufa em poucas horas.', o:[
    op('Queimar a plantação', {comida:-15}, {m:'Os danos ficam contidos.'}),
    op('Tratar com químicos', {cred:-10, agua:-5}, {m:'A maior parte se salva.'})]},
  {t:'Turistas milionários', x:'Uma nave de turistas pede para visitar a colônia, com pagamento adiantado.', o:[
    op('Receber os turistas', {cred:25, moral:-3, comida:-6}, {m:'Dinheiro fácil, nervos à flor da pele.'}),
    op('Recusar', {moral:3}, {m:'A privacidade da colônia vale mais.'})]},
  {t:'Sinal misterioso', x:'Um sinal de rádio repetitivo vem do lado oculto da Lua.', o:[
    op('Investigar', {en:-5}, {pts:{ciencia:1}, risco:{p:.3, fx:{moral:-8}, m:'O sinal assustou a equipe.'}, m:'Era uma sonda antiga cheia de dados úteis.'}),
    op('Ignorar', {}, {m:'Melhor não mexer.'})]},
  {t:'Pane no reator', x:'O reator principal começa a oscilar e a temperatura sobe.', o:[
    op('Reparo completo', {cred:-15, en:10}, {m:'O reator fica melhor do que novo.'}),
    op('Gambiarra rápida', {en:10}, {risco:{p:.4, fx:{en:-20, pop:-1}, m:'A gambiarra falhou e houve um acidente.'}, m:'Funcionou, por enquanto.'})]},
  {t:'Aniversário na base', x:'Uma colona completa um ano na Lua e a base inteira quer comemorar.', o:[
    op('Fazer a festa', {moral:12, comida:-6}, {m:'Música, risadas e saudade da Terra.'}),
    op('Seguir o trabalho', {cred:8, moral:-4}, {m:'Produtivo, mas ficou um clima estranho.'})]},
  {t:'Nave de refugiados', x:'Uma nave com colonos de outra base pede abrigo. Eles estão sem suprimentos.', o:[
    op('Acolher todos', {pop:3, comida:-8, agua:-6, moral:4}, {m:'Mais braços, mais bocas. A colônia cresce.'}),
    op('Recusar', {moral:-6}, {m:'A decisão pesa na consciência de todos.'})]},
  {t:'Poeira nos filtros', x:'A poeira lunar entope os filtros de ar. O ar fica pesado.', o:[
    op('Limpar todos os filtros', {en:-4, o2:8}, {m:'Ar limpo de novo.'}),
    op('Deixar para depois', {o2:-8}, {m:'O ar piora, e a tosse também.'})]},
  {t:'Suspeita de sabotagem', x:'Peças desaparecem do almoxarifado. Alguém está agindo contra a colônia.', o:[
    op('Investigar os colonos', {moral:-3, cred:-5}, {m:'Nada é provado, mas a tensão sobe.'}),
    op('Instalar câmeras', {cred:-10, moral:3}, {m:'O culpado aparece e a confiança volta.'})]}
];

/* ---------- JOGO 2D (canvas, vista lateral da base) ---------- */
const W = 960, H = 480, CEL = 64, CHAO = 200, COLS = 15, DIA_SEG = 6;
const cv = $('#cv'), g = cv.getContext('2d');
const TIPOS = {
  solar:{n:'Painel solar', c:20, sup:true, cor:'#3b6fb0', prod:{en:5}},
  eletro:{n:'Gerador de O₂', c:25, sup:true, cor:'#6bc0c9', prod:{o2:5, en:-2}},
  antena:{n:'Antena da Terra', c:30, sup:true, cor:'#c9c9d1', prod:{en:-1}, pts:['terra', 5]},
  gelo:{n:'Extrator de gelo', c:25, sub:true, cor:'#8fd0e8', prod:{agua:5, en:-2}},
  estufa:{n:'Estufa', c:25, sub:true, cor:'#5da35f', prod:{comida:5, agua:-1}},
  mina:{n:'Mina de hélio-3', c:35, sub:true, cor:'#c88a3a', prod:{cred:8, en:-2}, pts:['corp', 6]},
  lab:{n:'Laboratório', c:40, sub:true, cor:'#9b6fd1', prod:{en:-2, cred:-2}, pts:['ciencia', 3]},
  hab:{n:'Alojamento', c:20, cor:'#d8c9a0', prod:{moral:2}, pts:['indep', 8]}
};
let sel = null, mouse = null, bloq = true, tick = 0, ult = performance.now();
const estrelas = Array.from({length:90}, () => ({x:Math.random() * W, y:Math.random() * (CHAO - 20), r:Math.random() * 1.6 + .4, f:Math.random() * 6}));
const rochas = Array.from({length:160}, () => ({x:Math.random() * W, y:CHAO + 8 + Math.random() * 248, r:Math.random() * 3 + 1}));

const cx = c => c * CEL;
const cy = r => r === 0 ? CHAO - CEL : CHAO + (r - 1) * CEL;
function celula(px, py) {
  let row;
  if (py >= CHAO - CEL && py < CHAO) row = 0;
  else if (py >= CHAO && py < CHAO + 4 * CEL) row = 1 + Math.floor((py - CHAO) / CEL);
  else return null;
  const col = Math.floor(px / CEL);
  return col >= 1 && col < COLS ? {col, row} : null;
}
const predioEm = (c, r) => s && s.blds.find(b => b.x === c && b.y === r);
function valida(k, c, r) {
  const T = TIPOS[k];
  return !predioEm(c, r) && !(T.sup && r !== 0) && !(T.sub && r === 0) && s.cred >= T.c;
}

/* ----- painéis laterais ----- */
function desenhaLateral() {
  $('#dia').textContent = s ? `Dia ${s.dia} de ${ULTIMO_DIA}` : '';
  $('#recursos').innerHTML = s ? BARRAS.map(([k, n]) =>
    `<div class="m ${s[k] < 25 ? 'low' : ''}"><span>${n}</span><b>${s[k]}</b><i style="width:${s[k]}%"></i></div>`).join('') +
    `<div class="stat"><span>Créditos</span><b>${s.cred}</b></div><div class="stat"><span>Colonos</span><b>${s.pop}</b></div>
     <div class="stat"><span>Prédios</span><b>${s.blds.length}</b></div>` : '';
  $('#rotas').innerHTML = s ? Object.keys(ROTAS).map(k => `<div class="rota"><span>${ROTAS[k]}</span><b>${s.pts[k]}</b></div>`).join('') : '';
  $('#log').innerHTML = s ? s.log.map(l => `<li>${l}</li>`).join('') : '';
  $('#loja').innerHTML = Object.keys(TIPOS).map(k => {
    const T = TIPOS[k];
    return `<button data-t="${k}" class="${sel === k ? 'ativo' : ''}" ${s && s.cred >= T.c ? '' : 'disabled'}>${T.n}
      <small>${T.c} créditos · ${T.sup ? 'superfície' : T.sub ? 'subsolo' : 'qualquer lugar'}<br>${descr(T.prod)} por dia${T.pts ? `, +1 ${ROTAS[T.pts[0]]} a cada ${T.pts[1]} dias` : ''}</small></button>`;
  }).join('');
  $('#loja').querySelectorAll('[data-t]').forEach(b => b.onclick = () => { sel = sel === b.dataset.t ? null : b.dataset.t; desenhaLateral(); });
  ['vPausa', 'v1', 'v2'].forEach((id, i) => $('#' + id).classList.toggle('ativo', !!s && s.vel === i));
}
function palco(h) {
  const p = $('#palco');
  p.innerHTML = h; p.hidden = !h; bloq = !!h;
  desenhaLateral();
  p.querySelector('button')?.focus({preventScroll:true});
}

/* ----- fluxo ----- */
function intro() {
  s = null; sel = null;
  palco(`<div class="cena"><span class="tag">Gestão de base lunar em 2D</span>
    <h2>Lunar Industries: Colônia Selene</h2>
    <p>Construa a base na superfície e nos túneis, controle oxigênio, energia, água, comida e moral por 25 dias e decida o destino da colônia.</p>
    <p>Escolha um prédio na lista da direita e clique na base para construir. Painéis, geradores de oxigênio e antenas ficam na superfície. Extratores, estufas, minas e laboratórios ficam no subsolo. Eventos aparecem durante o jogo e cada escolha soma pontos em uma das quatro rotas políticas. Existem 4 vitórias, 2 finais neutros e 11 derrotas.</p>
    <button class="prim" id="comecar">Iniciar missão</button></div>`);
  $('#comecar').onclick = comeca;
}
function comeca() {
  s = novo(); s.vel = 1;
  s.blds = [{t:'solar', x:2, y:0}, {t:'eletro', x:4, y:0}, {t:'hab', x:7, y:0}, {t:'gelo', x:3, y:1}, {t:'estufa', x:5, y:1}];
  anota('A base foi ativada');
  palco('');
}
function constroi(c, r) {
  const T = TIPOS[sel];
  s.cred -= T.c; s.blds.push({t:sel, x:c, y:r});
  anota(`Construído: ${T.n}`);
  if (s.cred < T.c) sel = null;
  desenhaLateral();
}
function novoDia() {
  const d = {o2:-2 - Math.floor(s.pop / 8), en:-2, agua:-2 - Math.floor(s.pop / 10), comida:-2 - Math.floor(s.pop / 8), moral:-1};
  for (const b of s.blds) {
    const T = TIPOS[b.t];
    for (const k in T.prod) d[k] = (d[k] || 0) + T.prod[k];
    if (T.pts && s.dia % T.pts[1] === 0) s.pts[T.pts[0]]++;
  }
  aplicar(d);
  const m = morte();
  if (m) return fim(m);
  s.dia++;
  const e = HISTORIA[s.dia] || (Math.random() < .55 ? aleatorio() : null);
  desenhaLateral();
  if (e) mostraEvento(e, !!HISTORIA[s.dia]);
}
function aleatorio() {
  let pool = ALEATORIOS.filter(e => !s.vistos.includes(e.t));
  if (!pool.length) { s.vistos = []; pool = ALEATORIOS; }
  const e = pool[Math.floor(Math.random() * pool.length)];
  s.vistos.push(e.t);
  return e;
}
function mostraEvento(e, hist) {
  const botoes = e.o.map((o, i) => {
    const ok = !o.req || o.req(s);
    return `<button data-o="${i}" ${ok ? '' : 'disabled'}>${o.t}<small>${ok ? descr(o.fx) : 'Requer mais pontos na rota correspondente'}</small></button>`;
  }).join('');
  palco(`<div class="cena"><span class="tag">${hist ? 'Evento da história' : 'Evento do dia'}</span>
    <h2>${e.t}</h2><p>${e.x}</p><div class="escolhas">${botoes}</div></div>`);
  $('#palco').querySelectorAll('[data-o]').forEach(b => b.onclick = () => escolhe(e, +b.dataset.o));
}
function escolhe(e, i) {
  const o = e.o[i];
  aplicar(o.fx);
  let msg = o.m || '';
  if (o.pts) for (const k in o.pts) s.pts[k] += o.pts[k];
  if (o.risco && Math.random() < o.risco.p) { aplicar(o.risco.fx); msg = `${o.risco.m} (${descr(o.risco.fx)})`; }
  anota(o.t);
  if (o.fim) return fim(typeof o.fim === 'function' ? o.fim(s) : o.fim);
  const m = morte();
  if (m) return fim(m);
  palco(`<div class="cena"><span class="tag">Resultado</span><h2>${o.t}</h2>
    <div class="res">${msg}<br><small>${descr(o.fx) || 'Sem custos'}</small></div>
    <button class="prim" id="cont">Voltar à base</button></div>`);
  $('#cont').onclick = () => palco('');
}

/* ----- finais ----- */
const lerFinais = () => { try { return JSON.parse(localStorage.getItem('lunar_finais')) || []; } catch { return []; } };
function fim(id) {
  const f = FINAIS[id], achados = lerFinais();
  if (!achados.includes(id)) { achados.push(id); try { localStorage.setItem('lunar_finais', JSON.stringify(achados)); } catch {} }
  palco(`<div class="cena fim-${f.k}"><span class="tag">${{win:'Vitória', neu:'Final neutro', bad:'Derrota'}[f.k]}</span><h2>${f.t}</h2>
    <p>${f.x}</p>
    <div class="res">A colônia durou até o dia ${s.dia}. Finais descobertos: ${achados.length} de ${Object.keys(FINAIS).length}.</div>
    <button class="prim" id="denovo">Jogar de novo e tentar outro caminho</button></div>`);
  $('#denovo').onclick = intro;
}
function mostraFinais() {
  const achados = lerFinais();
  $('#listaFinais').innerHTML = Object.keys(FINAIS).map(id => {
    const f = FINAIS[id];
    return achados.includes(id) ? `<div class="f ${f.k}"><b>${f.t}</b></div>` : `<div class="f lock">??? (${{win:'vitória', neu:'neutro', bad:'derrota'}[f.k]})</div>`;
  }).join('');
  $('#dlgFinais').showModal();
}

/* ----- desenho ----- */
function predio(b) {
  const T = TIPOS[b.t], k = tick + b.x * 1.7;
  g.save(); g.translate(cx(b.x), cy(b.y));
  if (b.y > 0) { g.fillStyle = '#3d3a46'; g.fillRect(2, 2, CEL - 4, CEL - 4); }
  switch (b.t) {
    case 'solar':
      g.fillStyle = '#555a66'; g.fillRect(30, 34, 4, 30);
      g.translate(32, 34); g.rotate(-.45 + Math.sin(k * .6) * .04);
      g.fillStyle = T.cor; g.fillRect(-27, -6, 54, 10);
      g.strokeStyle = '#9fc4ee'; g.lineWidth = 1;
      for (let i = -18; i <= 18; i += 12) { g.beginPath(); g.moveTo(i, -6); g.lineTo(i, 4); g.stroke(); }
      break;
    case 'eletro':
      g.fillStyle = '#37444b'; g.fillRect(10, 22, 44, 42);
      g.fillStyle = T.cor; g.fillRect(14, 26, 36, 8);
      g.fillStyle = '#bfeaf0';
      for (let i = 0; i < 3; i++) g.fillRect(20 + i * 12, 58 - ((k * 20 + i * 14) % 22), 4, 4);
      break;
    case 'antena':
      g.fillStyle = '#777'; g.fillRect(30, 26, 4, 38);
      g.strokeStyle = T.cor; g.lineWidth = 4; g.beginPath(); g.arc(32, 24, 17, Math.PI * .05, Math.PI * .95); g.stroke();
      if (Math.sin(k * 4) > 0) { g.fillStyle = '#e2574c'; g.fillRect(30, 14, 5, 5); }
      break;
    case 'gelo':
      g.fillStyle = '#2d4b5c'; g.fillRect(8, 28, 48, 30);
      g.fillStyle = T.cor; g.fillRect(28, 4, 8, 22 + Math.sin(k * 5) * 5); g.fillRect(24, 28 + Math.sin(k * 5) * 5, 16, 4);
      break;
    case 'estufa':
      g.fillStyle = '#25402b'; g.fillRect(8, 14, 48, 40);
      g.fillStyle = T.cor;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) g.fillRect(14 + i * 14, 20 + j * 16 - Math.sin(k + i) * 1.5, 8, 10);
      break;
    case 'mina':
      g.fillStyle = '#4a3a24'; g.fillRect(4, 40, 56, 14);
      g.fillStyle = T.cor; g.fillRect(8 + (k * 22) % 36, 26, 16, 14);
      g.fillStyle = '#222'; g.fillRect(12 + (k * 22) % 36, 40, 4, 4); g.fillRect(20 + (k * 22) % 36, 40, 4, 4);
      break;
    case 'lab':
      g.fillStyle = '#2b2440'; g.fillRect(8, 14, 48, 40);
      g.fillStyle = T.cor; g.fillRect(14, 20, 12, 12); g.fillRect(34, 20, 16, 8);
      g.fillStyle = Math.sin(k * 3) > 0 ? '#f0a43a' : '#5a4a2a'; g.fillRect(40, 38, 8, 8);
      break;
    case 'hab':
      g.fillStyle = T.cor; g.beginPath(); g.arc(32, CEL - 2, 28, Math.PI, 0); g.fill();
      g.fillStyle = '#f0c36a';
      for (let i = 0; i < 3; i++) g.fillRect(16 + i * 12, 40, 7, 8);
      break;
  }
  g.restore();
}
function astronauta(x, y, i) {
  const p = Math.sin(tick * 8 + i * 2) * 3;
  g.strokeStyle = '#cfd4d8'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x + p, y); g.moveTo(x, y - 6); g.lineTo(x - p, y); g.stroke();
  g.fillStyle = '#e8e4da'; g.fillRect(x - 3, y - 15, 6, 10);
  g.fillStyle = '#cfd8dc'; g.beginPath(); g.arc(x, y - 18, 4, 0, 7); g.fill();
  g.fillStyle = '#f0a43a'; g.fillRect(x - 2, y - 19, 4, 2);
}
function desenha() {
  g.clearRect(0, 0, W, H);
  const ceu = g.createLinearGradient(0, 0, 0, CHAO);
  ceu.addColorStop(0, '#06070c'); ceu.addColorStop(1, '#1d2132');
  g.fillStyle = ceu; g.fillRect(0, 0, W, CHAO);
  for (const e of estrelas) { g.globalAlpha = .5 + .5 * Math.sin(tick * 1.5 + e.f); g.fillStyle = '#fff'; g.fillRect(e.x, e.y, e.r, e.r); }
  g.globalAlpha = 1;
  g.fillStyle = '#2f6fb5'; g.beginPath(); g.arc(820, 64, 30, 0, 7); g.fill();
  g.fillStyle = '#4f9a5a'; g.beginPath(); g.arc(812 + Math.sin(tick * .1) * 5, 60, 12, 0, 7); g.fill();
  g.fillStyle = '#ffffff55'; g.beginPath(); g.arc(828, 54, 10, 0, 7); g.fill();
  g.fillStyle = '#2a2830'; g.fillRect(0, CHAO, W, 4 * CEL);
  g.fillStyle = '#1a191d'; g.fillRect(0, CHAO + 4 * CEL, W, H - CHAO - 4 * CEL);
  g.fillStyle = '#3a3842';
  for (const r of rochas) g.fillRect(r.x, r.y, r.r, r.r);
  g.fillStyle = '#a39d8d'; g.fillRect(0, CHAO - 2, W, 8);
  g.fillStyle = '#7b7669';
  for (const x of [120, 340, 560, 780, 900]) { g.beginPath(); g.ellipse(x, CHAO + 2, 26, 4, 0, 0, 7); g.fill(); }

  const blds = s ? s.blds : [];
  g.fillStyle = '#4a4754';
  for (let r = 1; r <= 4; r++) {
    const doLinha = blds.filter(b => b.y === r);
    if (doLinha.length) g.fillRect(0, cy(r) + 56, (Math.max(...doLinha.map(b => b.x)) + 1) * CEL, 6);
  }
  g.fillStyle = '#1d1c22'; g.fillRect(14, CHAO - 56, 36, 4 * CEL + 56);
  g.fillStyle = '#6b6878'; g.fillRect(31, CHAO - 56, 2, 4 * CEL + 56);
  g.fillStyle = '#f0a43a'; g.fillRect(20, CHAO + 10 + (Math.sin(tick * .6) + 1) * 90, 24, 30);

  if (sel) {
    g.strokeStyle = '#ffffff14'; g.lineWidth = 1;
    for (let c = 1; c <= COLS; c++) { g.beginPath(); g.moveTo(c * CEL, CHAO - CEL); g.lineTo(c * CEL, CHAO + 4 * CEL); g.stroke(); }
    for (let r = 0; r <= 4; r++) { g.beginPath(); g.moveTo(CEL, cy(r)); g.lineTo(W, cy(r)); g.stroke(); }
  }
  blds.forEach(predio);

  if (s) {
    for (let i = 0; i < Math.min(s.pop, 10); i++) {
      const v = 12 + (i % 4) * 7, tr = W - 140, p = (i * 97 + tick * v) % tr;
      astronauta(i % 2 ? W - 70 - p : 70 + p, CHAO - 2, i);
    }
    const rx = (tick * 24) % (W + 120) - 60;
    g.fillStyle = '#d98a3a'; g.fillRect(rx, CHAO - 14, 34, 8);
    g.fillStyle = '#222'; g.beginPath(); g.arc(rx + 7, CHAO - 5, 4, 0, 7); g.arc(rx + 27, CHAO - 5, 4, 0, 7); g.fill();
  }
  if (mouse && s && !bloq) {
    const c = celula(mouse.x, mouse.y);
    if (c && sel) {
      g.fillStyle = valida(sel, c.col, c.row) ? '#7bc67e66' : '#e2574c66';
      g.fillRect(cx(c.col), cy(c.row), CEL, CEL);
    } else if (c) {
      const b = predioEm(c.col, c.row);
      if (b) {
        g.font = '14px "IBM Plex Sans", sans-serif'; g.fillStyle = '#000c';
        g.fillRect(mouse.x + 10, mouse.y - 26, g.measureText(TIPOS[b.t].n).width + 14, 24);
        g.fillStyle = '#fff'; g.fillText(TIPOS[b.t].n, mouse.x + 17, mouse.y - 9);
      }
    }
  }
  if (s) {
    g.fillStyle = '#0008'; g.fillRect(10, 10, 210, 26);
    g.fillStyle = '#f0a43a'; g.fillRect(14, 14, 202 * (s.tempo / DIA_SEG), 4);
    g.fillStyle = '#e4e0d4'; g.font = '700 13px "Chakra Petch", sans-serif';
    g.fillText(`Dia ${s.dia}/${ULTIMO_DIA}${s.vel ? '' : '  PAUSADO'}`, 14, 31);
  }
}
function loop(now) {
  const dt = Math.min(.1, (now - ult) / 1000); ult = now; tick += dt;
  if (s && !bloq && s.vel) {
    s.tempo += dt * s.vel;
    if (s.tempo >= DIA_SEG) { s.tempo -= DIA_SEG; novoDia(); }
  }
  desenha();
  requestAnimationFrame(loop);
}

/* ----- controles ----- */
const pos = e => { const r = cv.getBoundingClientRect(); return {x:(e.clientX - r.left) * W / r.width, y:(e.clientY - r.top) * H / r.height}; };
cv.onmousemove = e => mouse = pos(e);
cv.onmouseleave = () => mouse = null;
cv.onclick = e => {
  if (!s || bloq || !sel) return;
  const p = pos(e), c = celula(p.x, p.y);
  if (c && valida(sel, c.col, c.row)) constroi(c.col, c.row);
};
cv.oncontextmenu = e => { e.preventDefault(); sel = null; desenhaLateral(); };
const velo = v => { if (s) { s.vel = v; desenhaLateral(); } };
$('#vPausa').onclick = () => velo(0);
$('#v1').onclick = () => velo(1);
$('#v2').onclick = () => velo(2);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { sel = null; desenhaLateral(); }
  if (e.code === 'Space' && s && !bloq && !$('#dlgFinais').open) { e.preventDefault(); velo(s.vel ? 0 : 1); }
});
$('#btnFinais').onclick = mostraFinais;
$('#fecharFinais').onclick = () => $('#dlgFinais').close();

intro();
requestAnimationFrame(loop);
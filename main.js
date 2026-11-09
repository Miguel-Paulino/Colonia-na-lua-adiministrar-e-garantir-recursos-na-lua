'use strict';
/* Lunar Industries: Colônia Selene
   Jogo de gestão com narrativa ramificada. 25 dias, 4 rotas políticas, 17 finais. */

const $ = s => document.querySelector(s);
const NOMES = {o2:'oxigênio', en:'energia', agua:'água', comida:'comida', moral:'moral', cred:'créditos', pop:'colonos'};
const BARRAS = [['o2','Oxigênio'],['en','Energia'],['agua','Água'],['comida','Comida'],['moral','Moral']];
const ROTAS = {terra:'Aliança com a Terra', corp:'Helion Corp', indep:'Independência', ciencia:'Ciência / Marte'};
const ULTIMO_DIA = 25;
const DIAS_HISTORIA = [3,7,11,15,19,22,25];

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
  dia:1, o2:70, en:70, agua:70, comida:70, moral:70, cred:30, pop:12,
  pts:{terra:0,corp:0,indep:0,ciencia:0},
  mod:{o2:0,en:0,agua:0,comida:0},
  log:[], vistos:[]
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

/* ---------- AÇÕES DIÁRIAS ---------- */
const ACOES = [
  {n:'Extrair gelo', fx:{agua:14, en:-3}},
  {n:'Cultivar estufas', fx:{comida:14, agua:-3}},
  {n:'Manter painéis solares', fx:{en:14}},
  {n:'Eletrólise de O₂', fx:{o2:14, en:-4}},
  {n:'Minerar hélio-3', fx:{cred:15, en:-4}},
  {n:'Folga e refeição coletiva', fx:{moral:12, comida:-3}},
  {n:'Pesquisa científica', fx:{cred:-5, moral:2}, pts:{ciencia:1}}
];
const MODULOS = [['o2','Domo de oxigênio'],['en','Mini-reator'],['agua','Reciclador de água'],['comida','Estufa hidropônica']];
const CUSTO_MOD = 30;

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

/* ---------- INTERFACE ---------- */
function desenhaLateral() {
  $('#dia').textContent = s ? `Dia ${s.dia} de ${ULTIMO_DIA}` : '';
  if (!s) { $('#recursos').innerHTML = ''; $('#rotas').innerHTML = ''; $('#log').innerHTML = ''; return; }
  $('#recursos').innerHTML = BARRAS.map(([k, n]) =>
    `<div class="m ${s[k] < 25 ? 'low' : ''}"><span>${n}</span><b>${s[k]}</b><i style="width:${s[k]}%"></i></div>`).join('') +
    `<div class="stat"><span>Créditos</span><b>${s.cred}</b></div>
     <div class="stat"><span>Colonos</span><b>${s.pop}</b></div>
     <div class="stat"><span>Módulos</span><b>${s.mod.o2 + s.mod.en + s.mod.agua + s.mod.comida}</b></div>`;
  $('#rotas').innerHTML = Object.keys(ROTAS).map(k => `<div class="rota"><span>${ROTAS[k]}</span><b>${s.pts[k]}</b></div>`).join('');
  $('#log').innerHTML = s.log.map(l => `<li>${l}</li>`).join('');
}
const palco = h => { $('#palco').innerHTML = h; desenhaLateral(); $('#palco').querySelector('button')?.focus({preventScroll:true}); };

function intro() {
  s = null;
  palco(`<div class="cena"><span class="tag">Gestão e decisões</span>
    <h2>Colônia Selene</h2>
    <p>Você é o administrador da primeira colônia permanente da Lua. Por 25 dias você precisa manter oxigênio, energia, água, comida e moral acima de zero, e decidir de que lado a colônia ficará quando a Terra e a Helion Corp pedirem uma resposta.</p>
    <p>A cada dia você escolhe uma ação e enfrenta um evento. Suas escolhas somam pontos nas quatro rotas políticas e abrem ou fecham finais. Existem 4 vitórias, 2 finais neutros e 11 derrotas.</p>
    <button class="prim" id="comecar">Iniciar missão</button></div>`);
  $('#comecar').onclick = () => { s = novo(); mostraAcoes(); };
}

function mostraAcoes() {
  const ac = ACOES.map((a, i) => {
    const sem = a.fx.cred < 0 && s.cred < -a.fx.cred;
    return `<button data-a="${i}" ${sem ? 'disabled' : ''}>${a.n}<small>${descr(a.fx)}${a.pts ? ', +1 ciência' : ''}</small></button>`;
  }).join('');
  const mo = MODULOS.map(([k, n]) => {
    const full = s.mod[k] >= 3;
    return `<button data-m="${k}" ${full || s.cred < CUSTO_MOD ? 'disabled' : ''}>${n} (nível ${s.mod[k]}/3)<small>−${CUSTO_MOD} créditos, +3 ${NOMES[k]} por dia</small></button>`;
  }).join('');
  palco(`<div class="cena"><span class="tag">Dia ${s.dia}: manhã</span>
    <h2>O que a base faz hoje?</h2>
    <p>Escolha uma ação. Todo dia a colônia consome oxigênio, energia, água e comida, e o consumo cresce com o número de colonos.</p>
    <div class="grade">${ac}</div>
    <p class="sub">Investir na base também gasta o dia:</p>
    <div class="grade">${mo}</div></div>`);
  $('#palco').querySelectorAll('[data-a]').forEach(b => b.onclick = () => faz(+b.dataset.a));
  $('#palco').querySelectorAll('[data-m]').forEach(b => b.onclick = () => investe(b.dataset.m));
}
function faz(i) {
  const a = ACOES[i];
  aplicar(a.fx);
  if (a.pts) for (const k in a.pts) s.pts[k] += a.pts[k];
  anota(a.n);
  checa(mostraEvento);
}
function investe(k) {
  s.cred -= CUSTO_MOD; s.mod[k]++;
  anota(`Melhoria: ${MODULOS.find(m => m[0] === k)[1]}`);
  checa(mostraEvento);
}
function checa(prox) { const m = morte(); m ? fim(m) : prox(); }

function sorteiaEvento() {
  if (HISTORIA[s.dia]) return HISTORIA[s.dia];
  let pool = ALEATORIOS.filter(e => !s.vistos.includes(e.t));
  if (!pool.length) { s.vistos = []; pool = ALEATORIOS; }
  const e = pool[Math.floor(Math.random() * pool.length)];
  s.vistos.push(e.t);
  return e;
}
function mostraEvento() {
  const e = sorteiaEvento();
  const hist = !!HISTORIA[s.dia];
  const botoes = e.o.map((o, i) => {
    const ok = !o.req || o.req(s);
    const dica = ok ? descr(o.fx) : 'Requer mais pontos na rota correspondente';
    return `<button data-o="${i}" ${ok ? '' : 'disabled'}>${o.t}<small>${dica}</small></button>`;
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
  if (o.risco && Math.random() < o.risco.p) { aplicar(o.risco.fx); msg = o.risco.m + ' (' + descr(o.risco.fx) + ')'; }
  anota(o.t);
  if (o.fim) return fim(typeof o.fim === 'function' ? o.fim(s) : o.fim);
  const m = morte();
  if (m) return fim(m);
  palco(`<div class="cena"><span class="tag">Resultado</span><h2>${o.t}</h2>
    <div class="res">${msg}<br><small>${descr(o.fx) || 'Sem custos'}</small></div>
    <button class="prim" id="prox">Terminar o dia</button></div>`);
  $('#prox').onclick = fimDoDia;
}

function fimDoDia() {
  const d = {o2:-2 - Math.floor(s.pop / 8), en:-2, agua:-2 - Math.floor(s.pop / 10), comida:-2 - Math.floor(s.pop / 8), moral:-1};
  for (const k in s.mod) d[k] = (d[k] || 0) + s.mod[k] * 3;
  const antes = {o2:s.o2, en:s.en, agua:s.agua, comida:s.comida, moral:s.moral};
  aplicar(d);
  const m = morte();
  if (m) return fim(m);
  const resumo = Object.keys(d).map(k => `${s[k] - antes[k] >= 0 ? '+' : '−'}${Math.abs(s[k] - antes[k])} ${NOMES[k]}`).join(', ');
  s.dia++;
  anota('A noite passou');
  palco(`<div class="cena"><span class="tag">Fim do dia</span><h2>Noite na Colônia Selene</h2>
    <div class="res">Consumo e produção do dia: ${resumo}.</div>
    <button class="prim" id="amanha">Começar o dia ${s.dia}</button></div>`);
  $('#amanha').onclick = mostraAcoes;
}

/* ---------- FINAIS ---------- */
const lerFinais = () => { try { return JSON.parse(localStorage.getItem('lunar_finais')) || []; } catch { return []; } };
function fim(id) {
  const f = FINAIS[id];
  const achados = lerFinais();
  if (!achados.includes(id)) { achados.push(id); try { localStorage.setItem('lunar_finais', JSON.stringify(achados)); } catch {} }
  const rot = {win:'Vitória', neu:'Final neutro', bad:'Derrota'}[f.k];
  palco(`<div class="cena fim-${f.k}"><span class="tag">${rot}</span><h2>${f.t}</h2>
    <p>${f.x}</p>
    <div class="res">Você sobreviveu até o dia ${s.dia}. Finais descobertos: ${achados.length} de ${Object.keys(FINAIS).length}.</div>
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
$('#btnFinais').onclick = mostraFinais;
$('#fecharFinais').onclick = () => $('#dlgFinais').close();

intro();
'use strict';

/* =========================================================
COLÔNIA SELENE: jogo 2D de administração na Lua
- Canvas 2D: base lunar, módulos clicáveis e tripulantes animados
- Gestão de recursos: oxigênio, energia, água, comida e moral
- História ramificada: decisões mudam a reputação e levam a
finais diferentes (4 finais de sucesso, 1 neutro e 3 derrotas)
========================================================= */

/* ===================== CONFIGURAÇÃO ===================== */
const DIAS_TOTAIS = 30;
const LARGURA = 1000;
const ALTURA = 460;
const SOLO_Y = 335;

const RECURSOS = {
oxigenio: { nome: 'Oxigênio', icone: '💨', cor: '#5ec8ff' },
energia: { nome: 'Energia', icone: '⚡', cor: '#ffd24d' },
agua: { nome: 'Água', icone: '💧', cor: '#4d8bff' },
comida: { nome: 'Comida', icone: '🌱', cor: '#7ddc6a' },
moral: { nome: 'Moral', icone: '💙', cor: '#ff7eb6' }
};

const CAMINHOS = {
terra: { nome: 'Terra', icone: '🌍' },
ciencia: { nome: 'Ciência', icone: '🔬' },
industria: { nome: 'Indústria', icone: '⛏️' },
autonomia: { nome: 'Autonomia', icone: '🏴' }
};

const ICONE_MATERIAIS = '🔩';

/* ===================== PERSONAGENS ===================== */
const PERSONAGENS = [
{
id: 'helena', nome: 'Cmdr. Helena Reis', curto: 'Helena', papel: 'Comandante',
icone: '👩‍🚀', cor: '#ff9f43', especialidade: ['habitat', 'comms'],
desc: 'Brasileira, 42 anos. Disciplinada, protege a tripulação acima de tudo.'
},
{
id: 'kenji', nome: 'Eng. Kenji Tanaka', curto: 'Kenji', papel: 'Engenheiro de sistemas',
icone: '🧑‍🔧', cor: '#4dd0e1', especialidade: ['solar', 'oxigenio'],
desc: 'Japonês, 35 anos. Calmo e pragmático, resolve qualquer falha técnica.'
},
{
id: 'amara', nome: 'Dra. Amara Okafor', curto: 'Amara', papel: 'Bióloga e médica',
icone: '👩‍⚕️', cor: '#9be564', especialidade: ['estufa', 'lab'],
desc: 'Nigeriana, 38 anos. Empática e curiosa, cuida das plantas e das pessoas.'
},
{
id: 'teo', nome: 'Téo Marques', curto: 'Téo', papel: 'Técnico de mineração',
icone: '🧑‍🏭', cor: '#ff6b6b', especialidade: ['mina', 'gelo'],
desc: 'Brasileiro, 24 anos. Impulsivo e ambicioso, o mais jovem da missão.'
}
];

const NPCS = {
vance: { nome: 'Dr. Elias Vance', papel: 'Controle da Missão, na Terra', icone: '🛰️' },
voss: { nome: 'Marlene Voss', papel: 'Diretora da LunarCorp', icone: '💼' },
aria: { nome: 'ARIA', papel: 'Inteligência artificial da base', icone: '🤖' }
};

function pessoa(id) {
return PERSONAGENS.find(p => p.id === id) || NPCS[id];
}

/* ===================== MÓDULOS DA BASE ===================== */
const MODULOS = [
{ id: 'solar', nome: 'Painéis Solares', icone: '☀️', x: 62, efeito: { energia: 26 }, recurso: 'energia' },
{ id: 'gelo', nome: 'Extrator de Gelo', icone: '🧊', x: 187, efeito: { agua: 22, energia: -6 }, recurso: 'agua' },
{ id: 'oxigenio', nome: 'Gerador de O₂', icone: '🫧', x: 312, efeito: { oxigenio: 26, agua: -6, energia: -8 }, recurso: 'oxigenio' },
{ id: 'habitat', nome: 'Habitat', icone: '🏠', x: 437, efeito: { moral: 14, comida: -2 }, recurso: 'moral' },
{ id: 'estufa', nome: 'Estufa', icone: '🌿', x: 562, efeito: { comida: 22, agua: -5 }, recurso: 'comida' },
{ id: 'mina', nome: 'Mina de Regolito', icone: '⛏️', x: 687, efeito: { materiais: 12, energia: -8, industria: 1 } },
{ id: 'lab', nome: 'Laboratório', icone: '🔬', x: 812, efeito: { ciencia: 2, energia: -6, moral: 2 } },
{ id: 'comms', nome: 'Comunicações', icone: '📡', x: 937, efeito: { terra: 2, moral: 4, energia: -4 } }
];

/* ===================== MELHORIAS ===================== */
const MELHORIAS = [
{ id: 'paineis', nome: 'Painéis extras', icone: '☀️', custo: 30, desc: '+7 de energia por dia', extra: { autonomia: 1 } },
{ id: 'recicladorAgua', nome: 'Reciclador de água', icone: '♻️', custo: 30, desc: '−3 de consumo de água por dia', extra: { autonomia: 1 } },
{ id: 'hidroponia', nome: 'Hidroponia', icone: '🥬', custo: 35, desc: '+6 de comida por dia', extra: { ciencia: 1 } },
{ id: 'recicladorO2', nome: 'Reciclador de O₂', icone: '🫧', custo: 35, desc: '+5 de oxigênio por dia', extra: { ciencia: 1 } },
{ id: 'blindagem', nome: 'Blindagem anti-radiação', icone: '🛡️', custo: 25, desc: 'Reduz danos de tempestades e impactos', extra: { autonomia: 1 } }
];

/* ===================== ESTADO DO JOGO ===================== */
let estado;
let acao = null; // ação em andamento (tripulante caminhando/trabalhando)
let bloqueado = true; // bloqueia cliques durante eventos e transições
let hoverId = null; // módulo sob o mouse
let flutuantes = []; // textos que sobem na tela (+26 ⚡)
let fade = 0; // escurecimento ao trocar de dia
let tempo = 0;

const $ = id => document.getElementById(id);
const limitar = (v, min, max) => Math.max(min, Math.min(max, v));

function novoEstado() {
return {
dia: 1,
recursos: { oxigenio: 75, energia: 75, agua: 75, comida: 75, moral: 70 },
materiais: 20,
caminho: { terra: 0, ciencia: 0, industria: 0, autonomia: 0 },
flags: {},
upgrades: {},
equipe: PERSONAGENS.map((p, i) => ({
id: p.id, vivo: true, usado: false,
x: 380 + i * 42, y: SOLO_Y + 26 + (i % 2) * 12,
alvoX: 0, dir: 1
})),
pa: 4,
selecionado: 0,
fome: 0,
aleatoriosVistos: [],
log: [],
terminou: false
};
}

function vivos() { return estado.equipe.filter(c => c.vivo); }

function selecionarProximo() {
estado.selecionado = estado.equipe.findIndex(c => c.vivo && !c.usado);
}

function registrar(msg) {
estado.log.unshift(`Dia ${Math.min(estado.dia, DIAS_TOTAIS)}: ${msg}`);
if (estado.log.length > 40) estado.log.pop();
}

function iconeDe(k) {
if (k in RECURSOS) return RECURSOS[k].icone;
if (k === 'materiais') return ICONE_MATERIAIS;
return CAMINHOS[k].icone;
}

const sinal = v => (v > 0 ? '+' : '−') + Math.abs(v);

/* Aplica mudanças em recursos, materiais e reputação. */
function ajustar(delta, op = {}) {
let i = 0;
for (const [k, v0] of Object.entries(delta)) {
let v = v0;
if (op.bonus && v > 0 && (k in RECURSOS || k === 'materiais')) v = Math.round(v * 1.25);
if (k in RECURSOS) estado.recursos[k] = limitar(estado.recursos[k] + v, 0, 100);
else if (k === 'materiais') estado.materiais = Math.max(0, estado.materiais + v);
else if (k in CAMINHOS) estado.caminho[k] = Math.max(0, estado.caminho[k] + v);
else continue;
if (op.x !== undefined && v !== 0) {
flutuar(op.x, `${sinal(v)} ${iconeDe(k)}`, v > 0 ? '#8dffa0' : '#ff9d9d', i++);
}
}
}

function descreverEfeito(ef, bonus = false) {
return Object.entries(ef).map(([k, v0]) => {
const v = (bonus && v0 > 0 && (k in RECURSOS || k === 'materiais')) ? Math.round(v0 * 1.25) : v0;
return `${sinal(v)} ${iconeDe(k)}`;
}).join(' ');
}

function instantaneo() {
return { r: { ...estado.recursos }, m: estado.materiais, c: { ...estado.caminho } };
}

function resumoDiff(a) {
const partes = [];
for (const k of Object.keys(RECURSOS)) {
const d = Math.round(estado.recursos[k] - a.r[k]);
if (d) partes.push(`${RECURSOS[k].icone} ${sinal(d)}`);
}
const dm = estado.materiais - a.m;
if (dm) partes.push(`${ICONE_MATERIAIS} ${sinal(dm)}`);
for (const k of Object.keys(CAMINHOS)) {
const d = estado.caminho[k] - a.c[k];
if (d) partes.push(`${CAMINHOS[k].icone} ${sinal(d)}`);
}
return partes.join(' ');
}

/* ===================== EVENTOS DA HISTÓRIA ===================== */
/* Cada evento tem dia fixo. As escolhas alteram recursos, reputação
e "flags" que mudam o final. */
const EVENTOS = [
{
dia: 1, quem: 'aria', titulo: 'Briefing de chegada',
texto: 'Bem-vinda à Base Selene, comandante. Temos 30 dias para provar que a colônia se sustenta antes que a janela de transporte da Terra se feche. Todo recurso é limitado e cada decisão deixa marcas. Qual será a prioridade da missão?',
escolhas: [
{ texto: '🔬 Ciência: entender a Lua antes de explorá-la', exec: () => { ajustar({ ciencia: 2 }); return 'A equipe organiza os primeiros experimentos. A curiosidade dá ritmo ao trabalho.'; } },
{ texto: '🏴 Autossuficiência: depender só de nós mesmos', exec: () => { ajustar({ autonomia: 2 }); return 'A tripulação concorda: cada módulo deve funcionar sem ajuda externa.'; } },
{ texto: '⛏️ Mineração: transformar a Lua em riqueza', exec: () => { ajustar({ industria: 2, materiais: 10 }); return 'Téo mal se contém de animação. As primeiras amostras de regolito já estão separadas.'; } },
{ texto: '🌍 Diplomacia: manter a Terra por perto', exec: () => { ajustar({ terra: 2, moral: 5 }); return 'Uma videochamada com as famílias levanta o ânimo de todos.'; } }
]
},
{
dia: 3, quem: 'kenji', titulo: 'Tempestade solar',
texto: 'O alerta dispara: uma tempestade de partículas solares chega à superfície em poucas horas. Kenji pede uma decisão imediata.',
escolhas: [
{
texto: '🛏️ Abrigo total: desligar sistemas não essenciais',
exec: () => {
const b = estado.upgrades.blindagem;
ajustar({ energia: b ? -4 : -14, moral: -2, autonomia: 1 });
return b ? 'A blindagem anti-radiação funcionou. Quase nenhum dano.'
: 'Todos se abrigam no habitat. Ninguém se fere, mas a energia cai bastante.';
}
},
{
texto: '🎲 Manter a produção e arriscar (50%)',
exec: () => {
if (Math.random() < 0.5) {
ajustar({ materiais: 12, industria: 1 });
return 'Sorte! A tempestade passa de raspão e a produção extra rende materiais.';
}
ajustar({ oxigenio: -10, agua: -8, moral: -8 });
return 'Falhas em cascata nos sistemas. Oxigênio e água sofrem, e o medo se espalha.';
}
},
{
texto: '📡 Pedir o protocolo de emergência à Terra',
exec: () => { ajustar({ terra: 2, energia: -5 }); return 'O Controle da Missão envia o protocolo. Seguro, mas custa tempo e energia.'; }
}
]
},
{
dia: 6, quem: 'vance', titulo: 'Proposta da Agência Espacial Global',
texto: 'Selene, aqui é o Controle da Missão. A Agência Espacial Global quer relatórios semanais e voz ativa nas decisões da colônia. Em troca, oferece um carregamento de suprimentos.',
escolhas: [
{
texto: '🤝 Aceitar a parceria completa',
exec: () => { estado.flags.parceriaAEG = true; ajustar({ terra: 3, materiais: 15, autonomia: -1 }); return 'Os suprimentos chegam rápido. Em troca, a Terra passa a acompanhar cada passo da colônia.'; }
},
{
texto: '📦 Pedir apenas suprimentos de emergência',
exec: () => { ajustar({ materiais: 10, comida: 8, terra: 1 }); return 'A Agência envia o básico e respeita a sua independência. Por enquanto.'; }
},
{
texto: '🏴 Recusar e seguir por conta própria',
exec: () => { estado.flags.recusouAEG = true; ajustar({ autonomia: 2, moral: 5, terra: -1 }); return 'A tripulação aplaude. Na Terra, o silêncio do Conselho deixa a decisão no ar.'; }
}
]
},
{
dia: 9, quem: 'teo', titulo: 'Gelo na cratera sombreada',
texto: 'Téo voltou do reconhecimento ofegante: há um depósito enorme de gelo no fundo de uma cratera que nunca recebe luz. Como vamos explorar?',
escolhas: [
{
texto: '🔍 Explorar com cautela e estudar o depósito',
req: () => estado.recursos.energia >= 20, reqTexto: 'Requer ao menos 20 de energia',
exec: () => { ajustar({ agua: 25, ciencia: 1, energia: -15 }); return 'Amara e Téo coletam amostras de gelo antigo. Água garantida e dados valiosos.'; }
},
{
texto: '🏗️ Extração industrial imediata',
req: () => estado.recursos.energia >= 25, reqTexto: 'Requer ao menos 25 de energia',
exec: () => { estado.flags.mineracaoAgressiva = true; ajustar({ agua: 30, industria: 2, materiais: 10, energia: -20, moral: -3 }); return 'Máquinas pesadas rasgam a cratera. Muita água e material, mas o local nunca mais será o mesmo.'; }
},
{
texto: '🛑 Proteger o local para pesquisa futura',
exec: () => { estado.flags.protegeuGelo = true; ajustar({ ciencia: 2, terra: 1, moral: 2 }); return 'A cratera vira reserva científica. Hoje não rende água, mas rende prestígio.'; }
}
]
},
{
dia: 12, quem: 'amara', titulo: 'Praga na estufa',
texto: 'Um fungo desconhecido se espalha pelas bandejas de cultivo. Amara precisa agir antes que a colheita inteira apodreça.',
escolhas: [
{
texto: '✂️ Descartar as plantas contaminadas',
exec: () => { ajustar({ comida: -15, ciencia: 1 }); return 'A praga é contida. Perdemos parte da colheita, mas Amara aprende muito com o fungo.'; }
},
{
texto: '🧪 Usar o antifúngico de reserva (10 materiais)',
req: () => estado.materiais >= 10, reqTexto: 'Requer 10 materiais',
exec: () => { ajustar({ materiais: -10, comida: -3 }); return 'O tratamento funciona e quase tudo é salvo.'; }
},
{
texto: '🧬 Experimento genético nas sementes (60%)',
exec: () => {
if (Math.random() < 0.6) { ajustar({ comida: 20, ciencia: 2 }); return 'Funcionou! Uma linhagem resistente nasce e a estufa produz mais do que nunca.'; }
ajustar({ comida: -25, moral: -5 }); return 'A mutação falha e a estufa colapsa. Uma perda dolorosa.';
}
}
]
},
{
dia: 15, quem: 'voss', titulo: 'A proposta da LunarCorp',
texto: 'Aqui é Marlene Voss, da LunarCorp. Soubemos do hélio-3 nas rochas de Selene. Financiamos a sua expansão em troca de direitos exclusivos de mineração. É uma oferta que não se repete.',
escolhas: [
{
texto: '✍️ Assinar o contrato',
exec: () => { estado.flags.contratoLunarCorp = true; ajustar({ materiais: 40, industria: 3, terra: -1, autonomia: -1 }); return 'Os caminhões de carga chegam em dias. A colônia ganha fôlego, mas agora tem um dono.'; }
},
{
texto: '⚖️ Negociar um acordo parcial',
req: () => estado.caminho.ciencia >= 2 || estado.caminho.terra >= 3, reqTexto: 'Requer Ciência 2 ou Terra 3 para ter poder de barganha',
exec: () => { ajustar({ materiais: 20, industria: 1, autonomia: 1, terra: 1 }); return 'Com bons argumentos, você fecha um acordo equilibrado, sem ceder o controle.'; }
},
{
texto: '🚫 Rejeitar a oferta',
exec: () => { estado.flags.recusouCorp = true; ajustar({ autonomia: 2, moral: 3 }); return 'Voss encerra a ligação com um sorriso frio. A colônia segue livre, e mais pobre.'; }
}
]
},
{
dia: 18, quem: 'helena', titulo: 'Conflito na tripulação',
texto: 'Téo quebrou o protocolo e saiu sozinho para minerar. Kenji o acusa de colocar todos em risco. A discussão esquenta no refeitório e todos olham para você.',
escolhas: [
{
texto: '📋 Impor disciplina e registrar a falta',
exec: () => { ajustar({ moral: -8, terra: 1 }); return 'A ordem é restabelecida, mas o clima fica pesado nos próximos dias.'; }
},
{
texto: '🍲 Reunir todos para um jantar e conversar',
exec: () => { ajustar({ moral: 6, comida: -4 }); return 'Entre risadas e desabafos, o grupo se reaproxima. A tensão se dissolve.'; }
},
{
texto: '🎖️ Dar a Téo a liderança da mineração',
exec: () => { estado.flags.teoLider = true; ajustar({ industria: 2, moral: 3, materiais: 8 }); return 'Téo assume o desafio com orgulho. A produção da mina dispara.'; }
}
]
},
{
dia: 21, quem: 'kenji', titulo: 'Impacto no módulo de oxigênio',
texto: 'Um micrometeoroide perfurou a parede do gerador de O₂. O ar escapa em um assobio fino. Kenji precisa de uma ordem agora.',
escolhas: [
{
texto: '🔧 Reparo completo (15 materiais)',
req: () => estado.materiais >= 15, reqTexto: 'Requer 15 materiais',
exec: () => { ajustar({ materiais: -15, oxigenio: -3, autonomia: 1 }); return 'Kenji sela o rombo com uma placa nova. Pouca perda de ar.'; }
},
{
texto: '🪛 Remendo com sucata (60%)',
exec: () => {
if (Math.random() < 0.6) { ajustar({ oxigenio: -4 }); return 'O remendo segura! Kenji ganha mais uma lenda para contar.'; }
ajustar({ oxigenio: estado.upgrades.blindagem ? -12 : -25 }); return 'O remendo cede e o oxigênio escapa em grande quantidade.';
}
},
{
texto: '🚪 Isolar o módulo e usar as reservas',
exec: () => { ajustar({ oxigenio: -12, moral: -4, energia: -4 }); return 'A reserva segura a barra, mas o clima fica tenso.'; }
}
]
},
{
dia: 24, quem: 'aria', titulo: 'Anomalia magnética no lado oculto',
texto: 'Os sensores detectam uma anomalia magnética intensa, com sinais que não combinam com nenhuma rocha conhecida. Pode ser uma descoberta histórica, ou apenas ruído.',
escolhas: [
{
texto: '🛰️ Organizar uma missão científica',
req: () => estado.recursos.energia >= 15, reqTexto: 'Requer ao menos 15 de energia',
exec: () => { estado.flags.anomalia = true; ajustar({ energia: -12, ciencia: 3 }); return 'A equipe volta com amostras que mudam o que se sabe sobre o interior da Lua.'; }
},
{
texto: '💰 Vender os dados à LunarCorp',
req: () => !!estado.flags.contratoLunarCorp, reqTexto: 'Requer o contrato com a LunarCorp',
exec: () => { estado.flags.vendeuDados = true; ajustar({ materiais: 30, industria: 2, ciencia: -1 }); return 'A LunarCorp paga bem e não faz perguntas. Você prefere não pensar no que eles vão descobrir.'; }
},
{
texto: '🌍 Transmitir tudo para a Terra',
exec: () => { ajustar({ terra: 3, ciencia: 1, moral: 4 }); return 'Cientistas de todo o mundo comemoram. Selene vira manchete.'; }
},
{
texto: '🙈 Ignorar e focar na sobrevivência',
exec: () => { ajustar({ moral: -2 }); return 'Há coisas mais urgentes. Mas o mistério fica ali, esperando.'; }
}
]
},
{
dia: 27, quem: 'helena', titulo: 'O grande mandato',
texto: 'Faltam três dias. A Terra anuncia que a janela de transporte vai fechar e que a colônia precisa decidir o que será dela. Todos aguardam a sua palavra, comandante. Esta é a decisão que define o final da história.',
escolhas: [
{
texto: '🏴 Declarar a independência de Selene',
req: () => estado.caminho.autonomia >= 5, reqTexto: 'Requer Autonomia 5',
exec: () => { estado.flags.final = 'independencia'; ajustar({ moral: 10 }); return 'A bandeira de Selene sobe no mastro. A Terra vai ter que lidar com isso.'; }
},
{
texto: '🌍 Reforçar a aliança com a Terra',
req: () => estado.caminho.terra >= 5, reqTexto: 'Requer Terra 5',
exec: () => { estado.flags.final = 'terra'; ajustar({ moral: 8, materiais: 15 }); return 'A Agência promete uma rota fixa de abastecimento. Selene será uma ponte entre dois mundos.'; }
},
{
texto: '⛏️ Consolidar o império do hélio-3',
req: () => estado.caminho.industria >= 5, reqTexto: 'Requer Indústria 5',
exec: () => { estado.flags.final = 'industria'; ajustar({ materiais: 25, moral: 4 }); return 'As máquinas já trabalham a plena carga. A economia de Selene vai crescer rápido.'; }
},
{
texto: '🚀 Lançar a missão Ares rumo a Marte',
req: () => estado.caminho.ciencia >= 5, reqTexto: 'Requer Ciência 5',
exec: () => { estado.flags.final = 'marte'; ajustar({ materiais: -10, moral: 12 }); return 'Kenji e Amara já rabiscam os primeiros planos da nave. A humanidade vai olhar para mais longe.'; }
},
{
texto: '🌘 Seguir como estamos e esperar o que vier',
exec: () => { estado.flags.final = 'sobreviventes'; return 'Sem grandes anúncios, a colônia continua. O futuro fica em aberto.'; }
}
]
}
];

/* Eventos menores, sorteados nos dias sem evento fixo. */
const ALEATORIOS = [
{
quem: 'aria', titulo: 'Poeira lunar nos painéis',
texto: 'A poeira eletrostática cobriu os painéis solares e a geração caiu.',
escolhas: [
{ texto: '🧹 Limpar agora', exec: () => { ajustar({ energia: 8, moral: -1 }); return 'Painéis limpos. A energia sobe, mas ninguém gostou da caminhada.'; } },
{ texto: '⏳ Deixar para depois', exec: () => { ajustar({ energia: -8 }); return 'A produção cai enquanto a poeira se acumula.'; } }
]
},
{
quem: 'vance', titulo: 'Pacote de suprimentos',
cond: s => s.caminho.terra >= 2,
texto: 'Graças à boa relação com a Terra, uma cápsula extra de suprimentos pousou perto da base. Você pode escolher o que priorizar.',
escolhas: [
{ texto: '🔩 Ficar com os materiais', exec: () => { ajustar({ materiais: 12 }); return 'Peças e placas novas para as melhorias.'; } },
{ texto: '🍱 Ficar com as rações e a água', exec: () => { ajustar({ comida: 14, agua: 8 }); return 'A despensa respira aliviada.'; } }
]
},
{
quem: 'amara', titulo: 'Saudade de casa',
texto: 'A tripulação anda calada. Na Terra, é aniversário de um dos filhos de Kenji, e o clima na base pesa.',
escolhas: [
{ texto: '📞 Autorizar uma videochamada coletiva', exec: () => { ajustar({ energia: -4, moral: 10 }); return 'Entre lágrimas e sorrisos, o grupo se reanima.'; } },
{ texto: '🎯 Manter o foco no trabalho', exec: () => { ajustar({ moral: -6, materiais: 4 }); return 'O trabalho rende, mas os olhares ficam distantes.'; } }
]
},
{
quem: 'teo', titulo: 'Veio de minério raro',
texto: 'Durante uma perfuração, Téo esbarrou em uma veia de minério brilhante e quer saber o que fazer.',
escolhas: [
{ texto: '⛏️ Extrair imediatamente', exec: () => { ajustar({ materiais: 14, energia: -6, industria: 1 }); return 'Um bom carregamento de metal raro para a base.'; } },
{ texto: '🔬 Mandar para análise no laboratório', exec: () => { ajustar({ ciencia: 1, energia: -3, materiais: 4 }); return 'Amara confirma: a composição é inédita.'; } }
]
},
{
quem: 'kenji', titulo: 'Falha no reciclador',
texto: 'Uma válvula do reciclador de água começou a vazar e Kenji aguarda a sua ordem.',
escolhas: [
{ texto: '🔧 Consertar com peças (8 materiais)', req: () => estado.materiais >= 8, reqTexto: 'Requer 8 materiais', exec: () => { ajustar({ materiais: -8 }); return 'Vazamento selado e sistema estável.'; } },
{ texto: '💧 Aguentar o vazamento por enquanto', exec: () => { ajustar({ agua: -12 }); return 'Parte da água se perde, mas a base segue operando.'; } }
]
},
{
quem: 'helena', titulo: 'Noite de cinema',
texto: 'Alguém lembrou que há filmes antigos no servidor. Que tal uma noite de cinema no habitat?',
escolhas: [
{ texto: '🍿 Liberar a noite de cinema', exec: () => { ajustar({ moral: 9, comida: -3 }); return 'Pipoca de estufa, risadas e um final de dia memorável.'; } },
{ texto: '📋 Adiar para depois da missão', exec: () => { ajustar({ moral: -2, materiais: 3 }); return 'O trabalho segue, mas a tripulação suspira.'; } }
]
},
{
quem: 'aria', titulo: 'Chuva de micrometeoritos',
texto: 'Uma nuvem de micrometeoritos cruza a órbita da base nas próximas horas.',
escolhas: [
{ texto: '🛡️ Ativar o escudo de emergência', exec: () => { ajustar({ energia: -10 }); return 'O escudo segura quase tudo, com um custo alto de energia.'; } },
{ texto: '🎲 Confiar na sorte', exec: () => {
if (estado.upgrades.blindagem || Math.random() < 0.55) { return 'A chuva passa sem danos significativos.'; }
ajustar({ oxigenio: -8, agua: -6 }); return 'Alguns impactos atingem tanques e tubulações.';
} }
]
}
];

function sortearAleatorio() {
const disponiveis = ALEATORIOS
.map((e, i) => ({ e, i }))
.filter(({ e, i }) => !estado.aleatoriosVistos.includes(i) && (!e.cond || e.cond(estado)));
if (!disponiveis.length) return null;
const { e, i } = disponiveis[Math.floor(Math.random() * disponiveis.length)];
estado.aleatoriosVistos.push(i);
return e;
}

/* ===================== FINAIS ===================== */
const FINAIS = {
independencia: {
titulo: '🏴 Selene livre', tipo: 'bom',
texto: 'No dia 30, a bandeira de Selene é erguida ao lado dos módulos que vocês mesmos construíram. A colônia produz o que consome, e o que sobra vira moeda de troca. A Terra protesta, negocia e, por fim, reconhece a primeira nação lunar.'
},
terra: {
titulo: '🌍 Ponte entre mundos', tipo: 'bom',
texto: 'Selene se torna o grande porto científico da humanidade. Com a Agência Espacial Global, vocês constroem uma cadeia de abastecimento estável e transformam a base na ponte permanente entre a Terra e a Lua.'
},
industria: {
titulo: '⛏️ O império do hélio-3', tipo: 'bom',
texto: 'Os comboios de hélio-3 partem de Selene toda semana. A economia da Terra passa a depender da sua mina, e a colônia, rica e movimentada, vira o maior centro industrial fora do planeta.'
},
marte: {
titulo: '🚀 Rumo ao planeta vermelho', tipo: 'bom',
texto: 'A nave Ares é montada em órbita lunar com materiais de Selene e a ciência desenvolvida pela tripulação. Quando os motores acendem rumo a Marte, a colônia se torna o primeiro degrau da humanidade para o resto do Sistema Solar.'
},
sobreviventes: {
titulo: '🌘 Sobreviventes', tipo: 'neutro',
texto: 'Vocês sobreviveram a 30 dias difíceis, sem um rumo definido para o futuro. Selene continua de pé, mas depende de decisões que ainda não foram tomadas. Talvez uma próxima missão traga outro destino.'
},
sufocamento: {
titulo: '💀 Silêncio no vácuo', tipo: 'ruim',
texto: 'O alarme de oxigênio soa pela última vez. Sem ar, a colônia mergulha no silêncio. Os investigadores na Terra concluem que a falha não foi técnica, foi de planejamento.'
},
motim: {
titulo: '🔥 Motim em Selene', tipo: 'ruim',
texto: 'Sem esperança, a tripulação deixa de obedecer. Portas trancadas, discussões e sabotagens. A missão termina antes do tempo e Selene é abandonada.'
},
extincao: {
titulo: '🛰️ Base abandonada', tipo: 'ruim',
texto: 'Sem tripulantes, a base fica à deriva na poeira lunar. Resta apenas a voz de ARIA repetindo mensagens para a Terra, sem resposta.'
}
};

function epilogos() {
const f = estado.flags;
const l = [];
if (f.contratoLunarCorp) l.push('A LunarCorp mantém o seu contrato sobre o hélio-3 de Selene.');
if (f.recusouCorp) l.push('Recusar a LunarCorp preservou a liberdade de decisão da colônia.');
if (f.parceriaAEG) l.push('A Agência Espacial Global manteve uma estação de apoio em órbita.');
if (f.recusouAEG) l.push('A decisão de recusar a Agência ainda é debatida na Terra.');
if (f.mineracaoAgressiva) l.push('A cratera de gelo foi explorada até quase se esgotar.');
if (f.protegeuGelo) l.push('A cratera de gelo virou uma reserva científica protegida.');
if (f.teoLider) l.push('Téo, agora líder da mineração, virou símbolo da nova geração lunar.');
if (f.anomalia) l.push('Os estudos da anomalia magnética abriram um novo campo de pesquisa.');
if (f.vendeuDados) l.push('Os dados da anomalia foram vendidos, e ninguém sabe o que a LunarCorp descobriu.');
return l;
}

function definirFinal() {
const f = estado.flags.final;
return (f && FINAIS[f]) ? f : 'sobreviventes';
}

function fim(id) {
estado.terminou = true;
bloqueado = true;
const f = FINAIS[id];
const media = Math.round(Object.values(estado.recursos).reduce((a, b) => a + b, 0) / 5);
let estrelas = 0;
let qualidade = '';
if (f.tipo !== 'ruim') {
estrelas = media >= 65 ? 3 : media >= 40 ? 2 : 1;
qualidade = media >= 65 ? 'Selene fecha o ciclo próspera, com os estoques cheios.'
: media >= 40 ? 'A colônia chega estável, mas ainda frágil.'
: 'A colônia chega ao fim no limite, por um fio.';
}
const lista = f.tipo === 'ruim' ? [] : epilogos();
const caminhosHtml = Object.entries(CAMINHOS)
.map(([k, c]) => `<div>${c.icone} ${c.nome}<strong>${estado.caminho[k]}</strong></div>`).join('');
const html = `
${f.tipo === 'ruim' ? '' : `<div class="estrelas" aria-label="${estrelas} de 3 estrelas">${'⭐'.repeat(estrelas)}${'☆'.repeat(3 - estrelas)}</div>`}
<p>${f.texto}</p>
${qualidade ? `<p>${qualidade}</p>` : ''}
${lista.length ? `<p class="epilogo">${lista.join(' ')}</p>` : ''}
<div class="stats">
<div>Dia final<strong>${Math.min(estado.dia, DIAS_TOTAIS)}/${DIAS_TOTAIS}</strong></div>
<div>Tripulantes vivos<strong>${vivos().length}/4</strong></div>
<div>Média dos recursos<strong>${media}%</strong></div>
${caminhosHtml}
</div>`;
atualizarUI();
mostrarTela(f.titulo, html, '🔄 Jogar novamente', iniciarJogo);
}

/* ===================== FLUXO DO DIA ===================== */
function novoDia() {
estado.equipe.forEach(c => { c.usado = false; });
estado.pa = vivos().length;
selecionarProximo();
}

function perderTripulante() {
const lista = vivos();
if (!lista.length) return;
const c = lista[Math.floor(Math.random() * lista.length)];
c.vivo = false;
const p = PERSONAGENS.find(x => x.id === c.id);
ajustar({ moral: -15 });
registrar(`💔 ${p.nome} não resistiu à falta de suprimentos.`);
}

function verificarFim() {
if (estado.terminou) return true;
if (estado.recursos.oxigenio <= 0) { fim('sufocamento'); return true; }
if (estado.recursos.moral <= 0) { fim('motim'); return true; }
if (vivos().length === 0) { fim('extincao'); return true; }
return false;
}

function encerrarDia() {
if (estado.terminou || bloqueado || acao) return;
bloqueado = true;

const n = vivos().length;
const up = estado.upgrades;
ajustar({
oxigenio: -2 * n + (up.recicladorO2 ? 5 : 0),
agua: -Math.max(1, Math.round(1.5 * n) - (up.recicladorAgua ? 3 : 0)),
comida: -2 * n + (up.hidroponia ? 6 : 0),
energia: -(6 + n) + (up.paineis ? 7 : 0),
moral: -3
});

const r = estado.recursos;
if (r.energia <= 0) { ajustar({ oxigenio: -12, moral: -8 }); registrar('⚡ Apagão! O suporte de vida falhou por horas.'); }
if (r.agua <= 0) { ajustar({ oxigenio: -6, moral: -10 }); registrar('💧 Sem água! A tripulação sofre com a desidratação.'); }
if (r.comida <= 0) { estado.fome++; ajustar({ moral: -10 }); registrar('🌱 Sem comida! A fome começa a pesar.'); }
else estado.fome = 0;

const baixos = ['oxigenio', 'energia', 'agua', 'comida'].filter(k => r[k] > 0 && r[k] < 25).length;
if (baixos) ajustar({ moral: -2 * baixos });
if (estado.fome >= 2) { perderTripulante(); estado.fome = 0; }

fade = 1;
if (verificarFim()) return;

estado.dia++;
if (estado.dia > DIAS_TOTAIS) { fim(definirFinal()); return; }

novoDia();
registrar('Amanhece sobre Selene.');
atualizarUI();

setTimeout(() => {
if (!proximoEvento()) { bloqueado = false; atualizarUI(); }
}, 800);
}

/* Mostra o evento do dia. Retorna true se abriu alguma janela. */
function proximoEvento() {
let ev = EVENTOS.find(e => e.dia === estado.dia);
if (!ev && estado.dia >= 2 && Math.random() < 0.4) ev = sortearAleatorio();
if (!ev) return false;
mostrarEvento(ev);
return true;
}

/* ===================== AÇÕES NOS MÓDULOS ===================== */
function usarModulo(m) {
if (!m || estado.terminou || bloqueado || acao) return;
if (estado.pa <= 0) { toast('Sem ações hoje. Encerre o dia.'); return; }
const c = estado.equipe[estado.selecionado];
if (!c || !c.vivo || c.usado) { toast('Escolha um tripulante disponível.'); return; }
const idx = estado.selecionado;
c.alvoX = m.x + (idx - 1.5) * 15;
acao = { crew: c, modulo: m, fase: 'indo', tempo: 0 };
}

function concluirAcao() {
const { crew: c, modulo: m } = acao;
acao = null;
const p = PERSONAGENS.find(x => x.id === c.id);
const bonus = p.especialidade.includes(m.id);
ajustar(m.efeito, { bonus, x: m.x });
c.usado = true;
estado.pa--;
registrar(`${p.curto} em ${m.nome}${bonus ? ' ★' : ''}: ${descreverEfeito(m.efeito, bonus)}`);
selecionarProximo();
atualizarUI();
}

function comprarMelhoria(m) {
if (bloqueado || estado.upgrades[m.id] || estado.materiais < m.custo) return;
estado.upgrades[m.id] = true;
ajustar({ materiais: -m.custo, ...m.extra });
registrar(`🔧 Melhoria instalada: ${m.nome}.`);
toast(`${m.nome} instalado!`);
atualizarUI();
}

/* ===================== JANELAS (EVENTOS E TELAS) ===================== */
function mostrarEvento(ev) {
bloqueado = true;
const p = pessoa(ev.quem);
$('mIcone').textContent = p.icone;
$('mNome').textContent = p.nome;
$('mPapel').textContent = p.papel;
$('mTitulo').textContent = ev.titulo;
$('mTexto').textContent = ev.texto;
$('mResumo').textContent = '';
const box = $('mEscolhas');
box.innerHTML = '';

ev.escolhas.forEach(es => {
const b = document.createElement('button');
b.type = 'button';
b.className = 'escolha';
const liberada = !es.req || es.req();
const span = document.createElement('span');
span.textContent = es.texto;
b.appendChild(span);
if (!liberada) {
const aviso = document.createElement('small');
aviso.textContent = `🔒 ${es.reqTexto}`;
b.appendChild(aviso);
b.disabled = true;
}
b.addEventListener('click', () => {
const antes = instantaneo();
const resultado = es.exec();
registrar(`${ev.titulo}: decisão tomada.`);
mostrarResultado(resultado, resumoDiff(antes));
});
box.appendChild(b);
});

$('modal').classList.remove('hidden');
const primeira = box.querySelector('button:not(:disabled)');
if (primeira) primeira.focus();
}

function mostrarResultado(texto, resumo) {
$('mTexto').textContent = texto;
$('mResumo').textContent = resumo;
const box = $('mEscolhas');
box.innerHTML = '';
const b = document.createElement('button');
b.type = 'button';
b.className = 'btn-primario';
b.textContent = 'Continuar';
b.addEventListener('click', fecharModal);
box.appendChild(b);
b.focus();
atualizarUI();
}

function fecharModal() {
$('modal').classList.add('hidden');
if (verificarFim()) return;
bloqueado = false;
atualizarUI();
}

function mostrarTela(titulo, corpoHtml, textoBotao, aoClicar) {
$('tTitulo').textContent = titulo;
$('tCorpo').innerHTML = corpoHtml;
const b = $('tBotao');
b.textContent = textoBotao;
b.onclick = () => { $('tela').classList.add('hidden'); aoClicar(); };
$('tela').classList.remove('hidden');
b.focus();
}

function modalAberto() {
return !$('modal').classList.contains('hidden') || !$('tela').classList.contains('hidden');
}

let toastTimer;
function toast(msg) {
const t = $('toast');
t.textContent = msg;
t.classList.remove('hidden');
clearTimeout(toastTimer);
toastTimer = setTimeout(() => t.classList.add('hidden'), 1800);
}

/* ===================== INTERFACE (HTML) ===================== */
function construirHUD() {
const hud = $('hud');
hud.innerHTML = '';
for (const [k, r] of Object.entries(RECURSOS)) {
const d = document.createElement('div');
d.className = 'recurso';
d.id = 'rec-' + k;
d.innerHTML = `<div class="rec-topo"><span>${r.icone} ${r.nome}</span><strong id="val-${k}">0</strong></div>
<div class="barra"><div class="barra-preench" id="bar-${k}" style="background:${r.cor}"></div></div>`;
hud.appendChild(d);
}
}

function renderEquipe() {
const box = $('equipe');
box.innerHTML = '';
PERSONAGENS.forEach((p, i) => {
const c = estado.equipe[i];
const b = document.createElement('button');
b.type = 'button';
b.className = 'tripulante';
b.title = p.desc;
b.style.setProperty('--cor', p.cor);
if (i === estado.selecionado) b.classList.add('ativo');
if (!c.vivo) b.classList.add('perdido');
else if (c.usado) b.classList.add('cansado');
const espec = p.especialidade.map(id => MODULOS.find(m => m.id === id).icone).join(' ');
const status = !c.vivo ? 'Perdido' : c.usado ? 'Já agiu hoje' : 'Disponível';
b.innerHTML = `<span class="avatar">${p.icone}</span>
<span class="info"><strong>${p.nome}</strong><small>${p.papel}</small><small>★ ${espec} · ${status}</small></span>`;
b.addEventListener('click', () => {
if (acao || bloqueado || !c.vivo || c.usado) return;
estado.selecionado = i;
atualizarUI();
});
box.appendChild(b);
});
}

function renderMelhorias() {
const box = $('melhorias');
box.innerHTML = '';
MELHORIAS.forEach(m => {
const comprada = !!estado.upgrades[m.id];
const b = document.createElement('button');
b.type = 'button';
b.className = 'melhoria' + (comprada ? ' comprada' : '');
b.disabled = comprada || estado.materiais < m.custo;
b.innerHTML = `<span class="icone">${m.icone}</span>
<span class="info"><strong>${m.nome}</strong><small>${m.desc}</small></span>
<span class="preco">${comprada ? '✔' : ICONE_MATERIAIS + ' ' + m.custo}</span>`;
b.addEventListener('click', () => comprarMelhoria(m));
box.appendChild(b);
});
}

function atualizarUI() {
$('dia').textContent = Math.min(estado.dia, DIAS_TOTAIS);
$('pa').textContent = estado.pa;
$('materiais').textContent = estado.materiais;

for (const k of Object.keys(RECURSOS)) {
const v = Math.round(estado.recursos[k]);
$('val-' + k).textContent = v;
$('bar-' + k).style.width = v + '%';
$('rec-' + k).classList.toggle('critico', v < 25);
}

$('caminhos').innerHTML = Object.entries(CAMINHOS)
.map(([k, c]) => `<div class="caminho"><span>${c.icone} ${c.nome}</span><strong>${estado.caminho[k]}</strong></div>`).join('');

renderEquipe();
renderMelhorias();

$('log').innerHTML = '';
estado.log.slice(0, 10).forEach(t => {
const li = document.createElement('li');
li.textContent = t;
$('log').appendChild(li);
});

$('btnDia').classList.toggle('pulsar', estado.pa === 0 && !bloqueado);
}

/* ===================== DESENHO 2D (CANVAS) ===================== */
const canvas = $('game');
const ctx = canvas.getContext('2d');

const estrelasFundo = Array.from({ length: 120 }, () => ({
x: Math.random() * LARGURA, y: Math.random() * (SOLO_Y - 50),
r: Math.random() * 1.5 + 0.4, f: Math.random() * 6.28
}));

const crateras = Array.from({ length: 16 }, () => ({
x: Math.random() * LARGURA,
y: SOLO_Y + 36 + Math.random() * (ALTURA - SOLO_Y - 90),
rx: 14 + Math.random() * 36, ry: 3 + Math.random() * 7
}));

function rr(x, y, w, h, r, cor) {
ctx.beginPath();
ctx.moveTo(x + r, y);
ctx.arcTo(x + w, y, x + w, y + h, r);
ctx.arcTo(x + w, y + h, x, y + h, r);
ctx.arcTo(x, y + h, x, y, r);
ctx.arcTo(x, y, x + w, y, r);
ctx.closePath();
if (cor) ctx.fillStyle = cor;
ctx.fill();
}

function sombra(x, largura) {
ctx.fillStyle = 'rgba(0,0,0,.32)';
ctx.beginPath();
ctx.ellipse(x, SOLO_Y + 3, largura / 2 + 8, 7, 0, 0, Math.PI * 2);
ctx.fill();
}

function desenharTerra(x, y, r, t) {
ctx.save();
ctx.shadowColor = 'rgba(90,170,255,.55)';
ctx.shadowBlur = 26;
ctx.beginPath();
ctx.arc(x, y, r, 0, Math.PI * 2);
const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.15, x, y, r);
g.addColorStop(0, '#78bcff');
g.addColorStop(1, '#1b4aa8');
ctx.fillStyle = g;
ctx.fill();
ctx.shadowBlur = 0;
ctx.clip();
const dx = (t * 3) % (r * 2);
ctx.fillStyle = '#3f9b4f';
for (const off of [-r * 2, 0, r * 2]) {
const ox = x - dx + off;
ctx.beginPath(); ctx.ellipse(ox - r * 0.3, y - r * 0.25, r * 0.38, r * 0.24, 0.4, 0, Math.PI * 2); ctx.fill();
ctx.beginPath(); ctx.ellipse(ox + r * 0.35, y + r * 0.3, r * 0.3, r * 0.2, -0.3, 0, Math.PI * 2); ctx.fill();
}
ctx.fillStyle = 'rgba(255,255,255,.35)';
ctx.beginPath(); ctx.ellipse(x + r * 0.05, y - r * 0.1, r * 0.5, r * 0.08, 0.2, 0, Math.PI * 2); ctx.fill();
ctx.restore();
}

function desenharFundo(t) {
const g = ctx.createLinearGradient(0, 0, 0, SOLO_Y);
g.addColorStop(0, '#02030a');
g.addColorStop(1, '#111b3d');
ctx.fillStyle = g;
ctx.fillRect(0, 0, LARGURA, SOLO_Y);

ctx.fillStyle = '#fff';
for (const e of estrelasFundo) {
ctx.globalAlpha = 0.45 + 0.45 * Math.sin(t * 1.4 + e.f);
ctx.fillRect(e.x, e.y, e.r, e.r);
}
ctx.globalAlpha = 1;

desenharTerra(865, 82, 42, t);

const montanhas = [[0, 300], [80, 262], [150, 290], [240, 236], [330, 285], [430, 252], [520, 292],
[640, 244], [740, 284], [850, 256], [930, 288], [1000, 262]];
ctx.fillStyle = '#2a2f45';
ctx.beginPath();
ctx.moveTo(0, SOLO_Y);
montanhas.forEach(([px, py]) => ctx.lineTo(px, py));
ctx.lineTo(LARGURA, SOLO_Y);
ctx.closePath();
ctx.fill();

const solo = ctx.createLinearGradient(0, SOLO_Y, 0, ALTURA);
solo.addColorStop(0, '#9a9ca8');
solo.addColorStop(1, '#4b4d59');
ctx.fillStyle = solo;
ctx.fillRect(0, SOLO_Y, LARGURA, ALTURA - SOLO_Y);

for (const c of crateras) {
ctx.fillStyle = 'rgba(40,42,54,.45)';
ctx.beginPath(); ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2); ctx.fill();
ctx.strokeStyle = 'rgba(210,212,224,.25)';
ctx.lineWidth = 1.5;
ctx.beginPath(); ctx.ellipse(c.x, c.y - 1, c.rx, c.ry, 0, Math.PI, Math.PI * 2); ctx.stroke();
}
}

/* ----- Módulos ----- */
function desenharSolar(x) {
const carga = estado.recursos.energia / 100;
sombra(x, 90);
for (let i = -1; i <= 1; i++) {
const px = x + i * 32;
ctx.fillStyle = '#6b7488';
ctx.fillRect(px - 2, SOLO_Y - 30, 4, 30);
ctx.save();
ctx.translate(px, SOLO_Y - 34);
ctx.rotate(-0.4);
ctx.fillStyle = `rgb(${(20 + 40 * carga) | 0},${(60 + 80 * carga) | 0},${(150 + 90 * carga) | 0})`;
ctx.fillRect(-15, -7, 30, 14);
ctx.strokeStyle = 'rgba(255,255,255,.35)';
ctx.lineWidth = 1;
for (const k of [-5, 5]) { ctx.beginPath(); ctx.moveTo(k, -7); ctx.lineTo(k, 7); ctx.stroke(); }
ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(15, 0); ctx.stroke();
ctx.restore();
}
}

function desenharGelo(x, t) {
sombra(x, 80);
ctx.strokeStyle = '#9aa4b8';
ctx.lineWidth = 3;
ctx.beginPath(); ctx.moveTo(x - 22, SOLO_Y); ctx.lineTo(x, SOLO_Y - 80); ctx.lineTo(x + 22, SOLO_Y); ctx.stroke();
ctx.lineWidth = 1.5;
ctx.beginPath(); ctx.moveTo(x - 12, SOLO_Y - 38); ctx.lineTo(x + 12, SOLO_Y - 38); ctx.stroke();
const b = Math.sin(t * 5) * 6;
ctx.fillStyle = '#e0b341';
ctx.fillRect(x - 4, SOLO_Y - 70, 8, 36 + b);
ctx.fillStyle = '#d0d6e2';
ctx.beginPath(); ctx.moveTo(x - 5, SOLO_Y - 34 + b); ctx.lineTo(x + 5, SOLO_Y - 34 + b); ctx.lineTo(x, SOLO_Y - 24 + b); ctx.fill();
rr(x + 26, SOLO_Y - 28, 22, 28, 6, '#7fd3ff');
ctx.fillStyle = 'rgba(255,255,255,.5)';
ctx.fillRect(x + 31, SOLO_Y - 24, 4, 18);
}

function desenharO2(x, t) {
sombra(x, 90);
for (let i = 0; i < 3; i++) {
const px = x - 30 + i * 30;
rr(px - 11, SOLO_Y - 60, 22, 60, 10, '#cfe9ff');
ctx.fillStyle = '#5ea6d8';
ctx.fillRect(px - 11, SOLO_Y - 36, 22, 6);
ctx.fillStyle = '#9aa4b8';
ctx.fillRect(px - 3, SOLO_Y - 68, 6, 8);
ctx.fillStyle = 'rgba(190,235,255,.8)';
for (let j = 0; j < 2; j++) {
const by = SOLO_Y - 72 - ((t * 18 + i * 11 + j * 17) % 34);
ctx.beginPath(); ctx.arc(px + Math.sin(t * 3 + j) * 3, by, 2, 0, Math.PI * 2); ctx.fill();
}
}
}

function desenharHabitat(x, t) {
sombra(x, 110);
ctx.fillStyle = '#d7dbe6';
ctx.beginPath(); ctx.arc(x, SOLO_Y, 46, Math.PI, 0); ctx.fill();
ctx.fillStyle = '#aeb5c6';
ctx.fillRect(x - 46, SOLO_Y - 8, 92, 8);
const luz = estado.recursos.moral > 25 ? '#ffe28a' : '#ff6b6b';
for (const i of [-1, 1]) rr(x + i * 22 - 8, SOLO_Y - 30, 16, 12, 4, luz);
rr(x - 7, SOLO_Y - 24, 14, 24, 4, '#7d869b');
ctx.strokeStyle = '#9aa4b8';
ctx.lineWidth = 2;
ctx.beginPath(); ctx.moveTo(x + 22, SOLO_Y - 42); ctx.lineTo(x + 22, SOLO_Y - 66); ctx.stroke();
ctx.fillStyle = Math.sin(t * 3) > 0 ? '#6be28f' : '#1f4a2d';
ctx.beginPath(); ctx.arc(x + 22, SOLO_Y - 68, 3, 0, Math.PI * 2); ctx.fill();
}

function desenharEstufa(x, t) {
sombra(x, 100);
ctx.fillStyle = 'rgba(140,230,150,.25)';
ctx.strokeStyle = 'rgba(180,255,190,.75)';
ctx.lineWidth = 2;
ctx.beginPath(); ctx.arc(x, SOLO_Y, 44, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
ctx.beginPath(); ctx.moveTo(x, SOLO_Y - 44); ctx.lineTo(x, SOLO_Y); ctx.stroke();
ctx.beginPath(); ctx.arc(x, SOLO_Y, 22, Math.PI, 0); ctx.stroke();
ctx.fillStyle = estado.recursos.comida > 25 ? '#5cc95b' : '#a8b04a';
for (let i = -3; i <= 3; i++) {
const h = 12 + Math.abs((i * 7) % 5) + 3 + Math.sin(t * 2 + i) * 1.5;
ctx.fillRect(x + i * 11 - 2, SOLO_Y - h, 4, h);
ctx.beginPath(); ctx.ellipse(x + i * 11, SOLO_Y - h, 6, 4, 0.4, 0, Math.PI * 2); ctx.fill();
}
}

function desenharMina(x, t) {
sombra(x, 100);
ctx.fillStyle = '#6f7080';
ctx.beginPath(); ctx.moveTo(x + 4, SOLO_Y); ctx.lineTo(x + 30, SOLO_Y - 26); ctx.lineTo(x + 56, SOLO_Y); ctx.fill();
rr(x - 44, SOLO_Y - 22, 44, 16, 4, '#f0b429');
rr(x - 40, SOLO_Y - 38, 20, 16, 3, '#ffd36b');
rr(x - 37, SOLO_Y - 35, 14, 9, 2, '#2b3a55');
ctx.fillStyle = '#23252e';
for (const px of [x - 36, x - 8]) { ctx.beginPath(); ctx.arc(px, SOLO_Y - 5, 7, 0, Math.PI * 2); ctx.fill(); }
ctx.save();
ctx.translate(x - 2, SOLO_Y - 24);
ctx.rotate(-0.8 + Math.sin(t * 2) * 0.25);
ctx.fillStyle = '#d99a0b';
ctx.fillRect(0, -3, 40, 6);
ctx.fillRect(36, -3, 10, 14);
ctx.restore();
}

function desenharLab(x, t) {
sombra(x, 90);
rr(x - 36, SOLO_Y - 42, 72, 42, 6, '#c9d2e6');
rr(x - 28, SOLO_Y - 34, 26, 16, 3, '#2b6cb0');
ctx.fillStyle = Math.sin(t * 4) > 0 ? '#6be28f' : '#1f4a2d';
ctx.beginPath(); ctx.arc(x + 20, SOLO_Y - 28, 3.5, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = '#8892a6';
ctx.fillRect(x + 12, SOLO_Y - 54, 4, 12);
ctx.save();
ctx.translate(x + 14, SOLO_Y - 56);
ctx.rotate(t * 1.5);
ctx.fillStyle = '#e8ecf6';
ctx.fillRect(-14, -2, 28, 4);
ctx.restore();
}

function desenharComms(x, t) {
sombra(x, 70);
ctx.fillStyle = '#8a93a8';
ctx.fillRect(x - 3, SOLO_Y - 70, 6, 70);
ctx.save();
ctx.translate(x, SOLO_Y - 70);
ctx.rotate(-0.7);
ctx.fillStyle = '#e4e8f2';
ctx.beginPath(); ctx.ellipse(0, 0, 26, 9, 0, 0, Math.PI * 2); ctx.fill();
ctx.restore();
ctx.fillStyle = Math.sin(t * 4) > 0 ? '#ff4d4d' : '#5a1d1d';
ctx.beginPath(); ctx.arc(x, SOLO_Y - 74, 3.5, 0, Math.PI * 2); ctx.fill();
ctx.lineWidth = 2;
for (let i = 0; i < 3; i++) {
const rad = 10 + ((t * 20 + i * 12) % 36);
ctx.strokeStyle = `rgba(127,211,255,${1 - rad / 46})`;
ctx.beginPath(); ctx.arc(x + 8, SOLO_Y - 84, rad, -1.3, -0.3); ctx.stroke();
}
}

const DESENHOS = {
solar: desenharSolar, gelo: desenharGelo, oxigenio: desenharO2, habitat: desenharHabitat,
estufa: desenharEstufa, mina: desenharMina, lab: desenharLab, comms: desenharComms
};

function desenharModulos(t) {
ctx.textAlign = 'center';
MODULOS.forEach((m, i) => {
DESENHOS[m.id](m.x, t);
const hover = hoverId === m.id && !bloqueado;

if (m.recurso && estado.recursos[m.recurso] < 25) {
ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 6);
ctx.font = '22px sans-serif';
ctx.fillText('⚠️', m.x, SOLO_Y - 100);
ctx.globalAlpha = 1;
}

ctx.font = (hover ? 'bold ' : '') + '12px "Segoe UI", sans-serif';
ctx.fillStyle = hover ? '#ffffff' : '#d3d9ec';
ctx.fillText(`[${i + 1}] ${m.nome}`, m.x, SOLO_Y + 78);

if (hover) {
ctx.strokeStyle = 'rgba(255,179,71,.9)';
ctx.lineWidth = 2;
ctx.setLineDash([6, 4]);
ctx.strokeRect(m.x - 58, SOLO_Y - 112, 116, 138);
ctx.setLineDash([]);
ctx.fillStyle = '#ffd89a';
ctx.font = 'bold 13px "Segoe UI", sans-serif';
ctx.fillText(descreverEfeito(m.efeito), m.x, SOLO_Y + 96);
}
});
}

/* ----- Tripulantes ----- */
function desenharTripulante(c, idx, t) {
if (!c.vivo) return;
const p = PERSONAGENS[idx];
const andando = acao && acao.crew === c && acao.fase === 'indo';
const trabalhando = acao && acao.crew === c && acao.fase === 'trabalhando';
const passo = andando ? Math.sin(t * 14) * 5 : 0;
const balanco = trabalhando ? Math.sin(t * 18) * 1.5 : 0;

ctx.save();
ctx.globalAlpha = c.usado ? 0.6 : 1;
ctx.translate(c.x, c.y + balanco);
if (c.dir < 0) ctx.scale(-1, 1);

ctx.fillStyle = 'rgba(0,0,0,.35)';
ctx.beginPath(); ctx.ellipse(0, 0, 13, 4, 0, 0, Math.PI * 2); ctx.fill();

ctx.fillStyle = '#c9cfdd';
ctx.fillRect(-7 + passo * 0.5, -14, 6, 14);
ctx.fillRect(1 - passo * 0.5, -14, 6, 14);
rr(-14, -34, 7, 18, 3, '#9aa3b8');
rr(-9, -34, 18, 22, 5, '#eef1f8');
ctx.fillStyle = p.cor;
ctx.fillRect(-4, -29, 9, 6);
ctx.fillStyle = '#eef1f8';
ctx.beginPath(); ctx.arc(0, -43, 11, 0, Math.PI * 2); ctx.fill();
const v = ctx.createLinearGradient(-4, -50, 8, -36);
v.addColorStop(0, '#7fd6ff');
v.addColorStop(1, '#1b3a7a');
ctx.fillStyle = v;
ctx.beginPath(); ctx.ellipse(3, -43, 7, 6, 0, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = 'rgba(255,255,255,.65)';
ctx.beginPath(); ctx.ellipse(1, -45, 2.5, 1.5, -0.4, 0, Math.PI * 2); ctx.fill();
ctx.restore();

if (idx === estado.selecionado && !c.usado && !acao) {
ctx.fillStyle = p.cor;
const oscila = Math.sin(t * 5) * 3;
ctx.beginPath();
ctx.moveTo(c.x - 7, c.y - 66 + oscila);
ctx.lineTo(c.x + 7, c.y - 66 + oscila);
ctx.lineTo(c.x, c.y - 56 + oscila);
ctx.fill();
}
}

function desenharFlutuantes() {
ctx.textAlign = 'center';
ctx.font = 'bold 16px "Segoe UI", sans-serif';
for (const f of flutuantes) {
ctx.globalAlpha = Math.max(0, 1 - f.t / 1.5);
ctx.fillStyle = 'rgba(0,0,0,.6)';
ctx.fillText(f.txt, f.x + 1, f.y + 1);
ctx.fillStyle = f.cor;
ctx.fillText(f.txt, f.x, f.y);
}
ctx.globalAlpha = 1;
}

function flutuar(x, txt, cor, desloc) {
flutuantes.push({ x, y: SOLO_Y - 112 - desloc * 20, txt, cor, t: 0 });
}

function desenhar(t) {
ctx.clearRect(0, 0, LARGURA, ALTURA);
desenharFundo(t);
desenharModulos(t);

const ordem = estado.equipe.map((c, i) => ({ c, i })).sort((a, b) => a.c.y - b.c.y);
ordem.forEach(({ c, i }) => desenharTripulante(c, i, t));
desenharFlutuantes();

if (fade > 0) {
ctx.fillStyle = `rgba(2,4,12,${fade})`;
ctx.fillRect(0, 0, LARGURA, ALTURA);
if (fade > 0.25 && !estado.terminou) {
ctx.globalAlpha = Math.min(1, fade);
ctx.fillStyle = '#ffffff';
ctx.textAlign = 'center';
ctx.font = 'bold 36px "Chakra Petch", "Segoe UI", sans-serif';
ctx.fillText(`Dia ${Math.min(estado.dia, DIAS_TOTAIS)}`, LARGURA / 2, ALTURA / 2);
ctx.globalAlpha = 1;
}
}
}

/* ===================== ANIMAÇÃO ===================== */
function atualizarAnimacoes(dt) {
if (fade > 0) fade = Math.max(0, fade - dt * 1.1);

flutuantes.forEach(f => { f.t += dt; f.y -= 22 * dt; });
flutuantes = flutuantes.filter(f => f.t < 1.5);

if (!acao) return;
const c = acao.crew;
if (acao.fase === 'indo') {
const dx = c.alvoX - c.x;
const passo = 170 * dt;
if (Math.abs(dx) <= passo) {
c.x = c.alvoX;
acao.fase = 'trabalhando';
acao.tempo = 0.55;
} else {
c.x += Math.sign(dx) * passo;
c.dir = Math.sign(dx);
}
} else {
acao.tempo -= dt;
if (acao.tempo <= 0) concluirAcao();
}
}

let ultimoTs = 0;
function loop(ts) {
const dt = Math.min(0.05, (ts - ultimoTs) / 1000 || 0);
ultimoTs = ts;
tempo += dt;
atualizarAnimacoes(dt);
desenhar(tempo);
requestAnimationFrame(loop);
}

/* ===================== ENTRADA (MOUSE E TECLADO) ===================== */
function posCanvas(ev) {
const r = canvas.getBoundingClientRect();
return { x: (ev.clientX - r.left) * LARGURA / r.width, y: (ev.clientY - r.top) * ALTURA / r.height };
}

function moduloEm(p) {
return MODULOS.find(m => Math.abs(p.x - m.x) <= 58 && p.y >= SOLO_Y - 125 && p.y <= SOLO_Y + 100);
}

canvas.addEventListener('mousemove', ev => {
const m = moduloEm(posCanvas(ev));
hoverId = m ? m.id : null;
canvas.style.cursor = m && !bloqueado ? 'pointer' : 'default';
});

canvas.addEventListener('mouseleave', () => { hoverId = null; });

canvas.addEventListener('click', ev => {
const m = moduloEm(posCanvas(ev));
if (m) usarModulo(m);
});

document.addEventListener('keydown', ev => {
if (modalAberto() || ev.ctrlKey || ev.metaKey || ev.altKey) return;
if (ev.key >= '1' && ev.key <= '8') usarModulo(MODULOS[Number(ev.key) - 1]);
else if (ev.key.toLowerCase() === 'n') encerrarDia();
});

$('btnDia').addEventListener('click', encerrarDia);

/* ===================== INÍCIO DO JOGO ===================== */
function iniciarJogo() {
estado = novoEstado();
acao = null;
flutuantes = [];
fade = 0;
hoverId = null;
bloqueado = true;
registrar('A Base Selene entra em operação.');
atualizarUI();
proximoEvento();
}

function telaInicial() {
const html = `
<p>Ano de 2049. Você é a comandante <strong>Helena Reis</strong>, líder da primeira colônia permanente da Lua, a Base Selene, na borda da cratera Shackleton. Em 30 dias, a janela de transporte da Terra se fecha, e a colônia precisa provar que sobrevive sozinha.</p>
<ul class="regras">
<li><strong>Clique nos módulos</strong> da base (ou tecle 1 a 8) para mandar um tripulante trabalhar. Cada tripulante vivo dá uma ação por dia.</li>
<li><strong>Especialistas</strong> (★) rendem 25% a mais nos módulos da própria área.</li>
<li><strong>Encerre o dia</strong> para gastar oxigênio, energia, água e comida. Se o oxigênio ou a moral chegarem a zero, a missão acaba.</li>
<li><strong>Suas decisões</strong> em cada evento mudam a reputação com a Terra, a ciência, a indústria e a autonomia e levam a finais diferentes.</li>
</ul>`;
mostrarTela('🌙 Colônia Selene', html, '🚀 Iniciar missão', iniciarJogo);
}

estado = novoEstado();
construirHUD();
atualizarUI();
telaInicial();
requestAnimationFrame(loop);
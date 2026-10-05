// Estado do Jogo (Recursos Iniciais)
const gameState = {
    energy: 100,
    supplies: 30,
    corporate: 50,
    experience: 0,
    level: 1,
    discoveries: new Set(),
    visitedPoints: new Set()
};

// Elementos da Interface
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const startBtn = document.getElementById('start-btn');
const storyText = document.getElementById('story-text');
const choicesPanel = document.getElementById('choices-panel');

// Elementos dos Recursos
const resEnergy = document.getElementById('res-energy');
const resSupplies = document.getElementById('res-supplies');
const resCorporate = document.getElementById('res-corporate');
const energyBar = document.getElementById('energy-bar');
const suppliesBar = document.getElementById('supplies-bar');
const influenceBar = document.getElementById('influence-bar');
const playerLevel = document.getElementById('player-level');
const playerXp = document.getElementById('player-xp');
const xpBar = document.getElementById('xp-bar');
const xpTrack = document.querySelector('.xp-track');
const levelPerk = document.getElementById('level-perk');
const questTitle = document.getElementById('quest-title');
const questDescription = document.getElementById('quest-description');
const chapterHeading = document.querySelector('.story-heading .eyebrow');
const mapCanvas = document.getElementById('world-map');
const mapContext = mapCanvas.getContext('2d');
const mapMessage = document.getElementById('map-message');
const interactButton = document.getElementById('interact-btn');

const explorer = { x: 360, y: 245, speed: 24 };
let currentMapScene = '';
let currentNodeKey = 'intro';

const mapScenes = {
    base: {
        name: 'Base Possible One',
        color: '#77745d',
        landmarks: [
            { x: 112, y: 104, color: '#d1a96b', shape: 'dome' },
            { x: 345, y: 84, color: '#8ba77d', shape: 'greenhouse' },
            { x: 565, y: 143, color: '#9b8bb4', shape: 'antenna' }
        ],
        points: [
            { id: 'medbay', x: 112, y: 104, title: 'Enfermaria', text: 'A equipe médica ainda tem filtros reserva. Deixá-los funcionando garante mais tempo para a tripulação.', effects: { supplies: 3 }, xp: 10 },
            { id: 'greenhouse', x: 345, y: 84, title: 'Estufa hidropônica', text: 'Você ajusta os painéis de cultivo e recupera sementes lunares preservadas.', discover: 'greenhouse', effects: { supplies: 5 }, xp: 10 },
            { id: 'antenna', x: 565, y: 143, title: 'Antena de comunicação', text: 'Um sinal fraco vem de uma estação científica soterrada. As coordenadas foram registradas no mapa.', discover: 'signal', xp: 15 }
        ]
    },
    expedition: {
        name: 'Planície dos Ecos',
        color: '#8a806c',
        landmarks: [
            { x: 118, y: 155, color: '#74a6a1', shape: 'cache' },
            { x: 355, y: 103, color: '#d1a96b', shape: 'ruins' },
            { x: 590, y: 161, color: '#9b8bb4', shape: 'beacon' }
        ],
        points: [
            { id: 'water-cache', x: 118, y: 155, title: 'Reserva de gelo', text: 'Você recupera gelo de uma perfuração antiga. A água extra pode sustentar a colônia por mais alguns dias.', effects: { supplies: 7 }, discover: 'water', xp: 15 },
            { id: 'research-archive', x: 355, y: 103, title: 'Arquivo científico', text: 'Entre dados de pesquisa, você encontra um projeto de reator limpo e a prova de que a reserva de energia lunar pode ser reativada.', discover: 'archive', effects: { energy: 8 }, xp: 20 },
            { id: 'survivor-beacon', x: 590, y: 161, title: 'Baliza dos pesquisadores', text: 'A baliza confirma que os cientistas isolados estão vivos. Você salva as coordenadas do abrigo deles.', discover: 'researchers', xp: 15 }
        ]
    },
    storm: {
        name: 'Cratera sob tempestade',
        color: '#71695e',
        landmarks: [
            { x: 135, y: 110, color: '#8ba77d', shape: 'shelter' },
            { x: 363, y: 176, color: '#d1a96b', shape: 'battery' },
            { x: 579, y: 103, color: '#9b8bb4', shape: 'antenna' }
        ],
        points: [
            { id: 'storm-shelter', x: 135, y: 110, title: 'Abrigo pressurizado', text: 'O abrigo aguenta a tempestade e pode proteger os pesquisadores durante a travessia.', discover: 'shelter', effects: { supplies: 3 }, xp: 10 },
            { id: 'energy-cache', x: 363, y: 176, title: 'Baterias enterradas', text: 'Sob uma camada de poeira, você encontra baterias auxiliares ainda carregadas.', discover: 'battery', effects: { energy: 12 }, xp: 15 },
            { id: 'storm-antenna', x: 579, y: 103, title: 'Antena de longo alcance', text: 'A antena restaurada transmite os dados científicos e abre um canal para negociar uma aliança independente.', discover: 'uplink', effects: { corporate: 5 }, xp: 15 }
        ]
    }
};

const mapNodeScenes = {
    intro: 'base',
    routeCorporate: 'base',
    corporateVote: 'base',
    routeIndependence: 'base',
    independenceCouncil: 'base',
    routeDisaster: 'base',
    generatorRepairs: 'base',
    preparation: 'base',
    lunarExpedition: 'expedition',
    firstContact: 'expedition',
    lunarStorm: 'storm',
    finalDecision: 'storm'
};

const questDetails = {
    intro: ['Sinal de socorro', 'Decida como salvar a colônia da crise de abastecimento.'],
    routeCorporate: ['O preço do progresso', 'Investigue a carga antes de decidir o destino da tripulação.'],
    corporateVote: ['A decisão da diretoria', 'Escolha entre obedecer ao contrato ou defender os colonos.'],
    routeIndependence: ['Raízes na Lua', 'Descubra como manter a colônia viva sem apoio da Terra.'],
    independenceCouncil: ['Uma comunidade nascente', 'Ganhe a confiança dos colonos e organize a resistência.'],
    routeDisaster: ['Noite sem energia', 'Os geradores estão falhando; encontre uma solução.'],
    generatorRepairs: ['Consertos de emergência', 'Recupere energia antes que a expedição fique no escuro.'],
    preparation: ['Preparativos para a jornada', 'Equipe a expedição para encontrar uma solução duradoura.'],
    lunarExpedition: ['Além da cratera', 'Explore a região e descubra recursos ou sinais de vida.'],
    firstContact: ['Vozes no silêncio', 'Uma transmissão inesperada pode mudar o futuro da colônia.'],
    lunarStorm: ['A tempestade se aproxima', 'Proteja a base e escolha o que salvar primeiro.'],
    finalDecision: ['O destino de Possible One', 'Use tudo o que aprendeu para decidir o futuro da colônia.'],
    finalCorporate: ['Retorno à Terra', 'Seu caminho levou a colônia ao resgate corporativo.'],
    finalIndependence: ['Um novo mundo', 'A colônia conquistou seu lugar entre as estrelas.'],
    finalRescue: ['Uma nova aliança', 'A colônia sobreviveu e conquistou voz própria.'],
    finalScience: ['A descoberta lunar', 'Compartilhe a descoberta científica que pode transformar a vida na Lua.'],
    finalExodus: ['Evacuação heroica', 'Leve todos para a segurança antes que a colônia seja perdida.'],
    finalFrontier: ['Um novo lar', 'Construa uma comunidade científica livre na fronteira lunar.'],
    finalDisaster: ['Silêncio lunar', 'A Lua guardará para sempre o fim da expedição.']
};

const chapterDetails = {
    intro: 'CAPÍTULO I · A ÚLTIMA FRONTEIRA',
    routeCorporate: 'CAPÍTULO I · A ÚLTIMA FRONTEIRA',
    corporateVote: 'CAPÍTULO I · A ÚLTIMA FRONTEIRA',
    routeIndependence: 'CAPÍTULO I · A ÚLTIMA FRONTEIRA',
    independenceCouncil: 'CAPÍTULO I · A ÚLTIMA FRONTEIRA',
    routeDisaster: 'CAPÍTULO I · A ÚLTIMA FRONTEIRA',
    generatorRepairs: 'CAPÍTULO I · A ÚLTIMA FRONTEIRA',
    preparation: 'CAPÍTULO II · TERRITÓRIO DESCONHECIDO',
    lunarExpedition: 'CAPÍTULO II · TERRITÓRIO DESCONHECIDO',
    firstContact: 'CAPÍTULO III · ECOS DO PASSADO',
    lunarStorm: 'CAPÍTULO III · ECOS DO PASSADO',
    finalDecision: 'CAPÍTULO IV · O FUTURO DA COLÔNIA',
    finalCorporate: 'EPÍLOGO · RETORNO À TERRA',
    finalIndependence: 'EPÍLOGO · UM NOVO MUNDO',
    finalRescue: 'EPÍLOGO · UMA NOVA ALIANÇA',
    finalScience: 'EPÍLOGO · A DESCOBERTA LUNAR',
    finalExodus: 'EPÍLOGO · EVACUAÇÃO HEROICA',
    finalFrontier: 'EPÍLOGO · UM NOVO LAR',
    finalDisaster: 'EPÍLOGO · SILÊNCIO LUNAR'
};

// Banco de Dados da História (Nós do Jogo)
const storyNodes = {
    intro: {
        text: "Comandante, a nave de suprimentos da Terra acabou de colidir no espaço profundo. Nosso estoque atual de Oxigênio e Comida garante apenas 30 dias de sobrevivência. O inverno lunar se aproxima e a refinaria está consumindo muita energia. Como prosseguir?",
        choices: [
            {
                text: "Manter a refinaria ativa e cumprir as cotas da Lunar Industries.",
                nextNode: "routeCorporate",
                effects: { energy: -12, supplies: -3, corporate: 12 }
            },
            {
                text: "Redirecionar energia para minerar gelo e ampliar as estufas.",
                nextNode: "routeIndependence",
                effects: { energy: -18, supplies: 8, corporate: -12 }
            },
            {
                text: "Distribuir energia entre os sistemas e investigar os geradores.",
                nextNode: "routeDisaster",
                effects: { energy: -25, supplies: -2, corporate: 2 }
            }
        ]
    },
    routeCorporate: {
        text: "A refinaria voltou a operar, mas os sensores detectaram uma falha na carga de Hélio-3. A diretoria exige o envio imediato; a tripulação diz que parte do carregamento pode ser usada para consertar o gerador.",
        choices: [
            {
                text: "Inspecionar o carregamento antes de enviá-lo.",
                nextNode: "corporateVote",
                effects: { energy: -5, supplies: -3, corporate: 6 }
            },
            {
                text: "Suspender o turno e deixar os engenheiros descansarem.",
                nextNode: "corporateVote",
                effects: { energy: 4, supplies: -4, corporate: -6 }
            }
        ]
    },
    corporateVote: {
        text: "A inspeção confirma que a Lunar Industries enviou peças defeituosas. A diretoria ameaça cancelar o contrato se a cota atrasar. Os colonos aguardam sua decisão.",
        choices: [
            {
                text: "Cumprir o contrato e pedir peças de reposição à Terra.",
                nextNode: "preparation",
                effects: { energy: -6, supplies: -3, corporate: 10 }
            },
            {
                text: "Requisitar as peças para a colônia e negociar de igual para igual.",
                nextNode: "preparation",
                requiredLevel: 2,
                effects: { energy: 5, supplies: 4, corporate: -8 }
            }
        ]
    },
    routeIndependence: {
        text: "A prospecção encontra gelo sob a cratera, mas as ferramentas estão gastas. A equipe das estufas propõe duas soluções: recuperar o velho extrator ou concentrar o trabalho nas plantações.",
        choices: [
            {
                text: "Reativar o extrator de gelo para garantir água e oxigênio.",
                nextNode: "independenceCouncil",
                effects: { energy: -8, supplies: 9, corporate: -5 }
            },
            {
                text: "Ampliar as estufas e produzir alimentos para a tripulação.",
                nextNode: "independenceCouncil",
                effects: { energy: -10, supplies: 6, corporate: -4 }
            }
        ]
    },
    independenceCouncil: {
        text: "A colheita anima a colônia, mas alguns trabalhadores temem que a Lunar Industries corte o suporte médico. A assembleia pede um plano que mantenha todos unidos.",
        choices: [
            {
                text: "Dividir os suprimentos e formar um conselho de moradores.",
                nextNode: "preparation",
                effects: { energy: -3, supplies: 5, corporate: -3 }
            },
            {
                text: "Organizar uma equipe técnica para tornar a base autossuficiente.",
                nextNode: "preparation",
                requiredLevel: 2,
                effects: { energy: -5, supplies: 9, corporate: -6 }
            }
        ]
    },
    routeDisaster: {
        text: "Os alarmes confirmam que um gerador está superaquecendo. A energia cai a cada minuto, e a noite lunar ainda está longe do fim.",
        choices: [
            {
                text: "Desligar setores não essenciais e poupar as baterias.",
                nextNode: "generatorRepairs",
                effects: { energy: 8, supplies: -3, corporate: -2 }
            },
            {
                text: "Enviar a equipe de manutenção para reparar o núcleo.",
                nextNode: "generatorRepairs",
                effects: { energy: -8, supplies: -3, corporate: 2 }
            }
        ]
    },
    generatorRepairs: {
        text: "A equipe encontra uma peça rachada no núcleo do gerador. Há uma bateria auxiliar, mas ela só aguenta parte da noite. Com habilidade, é possível fazer o conserto durar mais.",
        choices: [
            {
                text: "Instalar a bateria auxiliar e manter a enfermaria ligada.",
                nextNode: "preparation",
                effects: { energy: 14, supplies: -3, corporate: 2 }
            },
            {
                text: "Recalibrar o núcleo e recuperar parte da energia perdida.",
                nextNode: "preparation",
                requiredLevel: 2,
                effects: { energy: 18, supplies: -2, corporate: 3 }
            }
        ]
    },
    preparation: {
        text: "A base consegue ganhar algum tempo. Uma antiga carta topográfica menciona um módulo científico enterrado do outro lado da cratera. Uma expedição pode revelar a causa da crise e os recursos que ainda restam.",
        choices: [
            {
                text: "Preparar um rover rápido para alcançar o módulo primeiro.",
                nextNode: "lunarExpedition",
                effects: { energy: -8, supplies: -2, corporate: 2 }
            },
            {
                text: "Levar ferramentas de mineração e coletar gelo no caminho.",
                nextNode: "lunarExpedition",
                effects: { energy: -11, supplies: 3, corporate: -2 }
            },
            {
                text: "Montar uma expedição protegida com a ajuda dos engenheiros.",
                nextNode: "lunarExpedition",
                requiredLevel: 2,
                effects: { energy: -5, supplies: 1, corporate: 1 }
            }
        ]
    },
    lunarExpedition: {
        text: "O rover chega ao módulo soterrado. No interior, os sensores encontram reservas de água, um mapa de túneis e uma transmissão que continua se repetindo, apesar de a estação estar abandonada.",
        choices: [
            {
                text: "Recuperar os tanques de água antes que o módulo desabe.",
                nextNode: "firstContact",
                effects: { energy: -4, supplies: 10, corporate: 1 }
            },
            {
                text: "Seguir o sinal até a antena que transmite sob a superfície.",
                nextNode: "firstContact",
                effects: { energy: -7, supplies: -2, corporate: 3 }
            },
            {
                text: "Usar o mapa de túneis para encontrar um atalho de volta.",
                nextNode: "firstContact",
                requiredLevel: 2,
                effects: { energy: -2, supplies: 3, corporate: 1 }
            }
        ]
    },
    firstContact: {
        text: "A transmissão vem de um posto de pesquisa esquecido. Uma cientista responde: ela e sua equipe estão isoladas numa galeria próxima. Conhecem uma rota segura até uma reserva de energia, mas precisam saber se podem confiar em Possible One.",
        choices: [
            {
                text: "Convidar os pesquisadores para se juntarem à colônia.",
                nextNode: "lunarStorm",
                effects: { energy: -4, supplies: -3, corporate: -3 }
            },
            {
                text: "Trocar dados científicos por coordenadas da reserva.",
                nextNode: "lunarStorm",
                effects: { energy: 2, supplies: 3, corporate: 4 }
            },
            {
                text: "Decifrar o sinal e verificar a rota antes de responder.",
                nextNode: "lunarStorm",
                requiredLevel: 3,
                effects: { energy: -2, supplies: 1, corporate: 2 }
            }
        ]
    },
    lunarStorm: {
        text: "Uma tempestade de poeira atinge a cratera. A antena está prestes a cair, a reserva de energia pode ser soterrada e os pesquisadores estão a caminho. Você só tem tempo para coordenar uma operação.",
        choices: [
            {
                text: "Reforçar o escudo da base para proteger toda a tripulação.",
                nextNode: "finalDecision",
                effects: { energy: -8, supplies: -2, corporate: 1 }
            },
            {
                text: "Salvar a antena para manter contato com a Terra.",
                nextNode: "finalDecision",
                effects: { energy: -5, supplies: -3, corporate: 6 }
            },
            {
                text: "Usar o mapa e coordenar duas equipes em segurança.",
                nextNode: "finalDecision",
                requiredLevel: 3,
                effects: { energy: -4, supplies: 2, corporate: 2 }
            }
        ]
    },
    finalDecision: {
        text: "A tempestade passa. Os pesquisadores estão a salvo, e os dados coletados podem mudar tudo. A colônia se reúne para escolher entre voltar à Terra, ficar na Lua ou construir um futuro que ninguém imaginava.",
        choices: [
            {
                text: "Aceitar o resgate da Lunar Industries e voltar à Terra.",
                nextNode: "finalCorporate",
                effects: { energy: 0, supplies: 0, corporate: 10 }
            },
            {
                text: "Declarar a colônia independente e compartilhar os recursos.",
                nextNode: "finalIndependence",
                effects: { energy: 0, supplies: 4, corporate: -10 }
            },
            {
                text: "Negociar uma aliança e continuar na Lua com autonomia.",
                nextNode: "finalRescue",
                requiredLevel: 3,
                effects: { energy: 2, supplies: 2, corporate: 2 }
            },
            {
                text: "Publicar o projeto do reator limpo para todas as colônias.",
                nextNode: "finalScience",
                requiredLevel: 3,
                requiredDiscoveries: ['archive'],
                effects: { energy: 5, supplies: 2, corporate: -5 }
            },
            {
                text: "Evacuar a tripulação e os pesquisadores em uma nave de emergência.",
                nextNode: "finalExodus",
                requiredResources: { energy: 15, supplies: 18 },
                effects: { energy: -10, supplies: -5, corporate: 2 }
            },
            {
                text: "Fundar uma comunidade científica livre na fronteira lunar.",
                nextNode: "finalFrontier",
                requiredLevel: 4,
                requiredDiscoveries: ['archive', 'researchers', 'uplink', 'water', 'greenhouse'],
                effects: { energy: 5, supplies: 5, corporate: -8 }
            }
        ]
    },
    finalCorporate: {
        text: "🏆 FINAL: RETORNO À TERRA. O resgate da Lunar Industries chega a tempo. Sua tripulação volta em segurança; a empresa anuncia sua promoção, mas Possible One continua sob controle corporativo.",
        choices: [{ text: "Jogar Novamente", nextNode: "restart" }]
    },
    finalIndependence: {
        text: "🚀 FINAL: UMA NOVA NAÇÃO. Com água, energia e o apoio dos pesquisadores, a colônia declara sua independência. Possible One se torna o primeiro lar permanente da humanidade fora da Terra.",
        choices: [{ text: "Jogar Novamente", nextNode: "restart" }]
    },
    finalRescue: {
        text: "🌙 FINAL: AUTONOMIA ENTRE AS ESTRELAS. A Lunar Industries reconhece a colônia como parceira. Os pesquisadores ficam, os recursos são compartilhados e Possible One escolhe seu próprio caminho sem romper todos os laços com a Terra.",
        choices: [{ text: "Jogar Novamente", nextNode: "restart" }]
    },
    finalScience: {
        text: "🔬 FINAL: A DESCOBERTA LUNAR. O projeto do reator limpo é compartilhado com a Terra e outras colônias. A energia deixa de ser uma arma de negociação, e Possible One passa a liderar uma nova era de cooperação científica.",
        choices: [{ text: "Jogar Novamente", nextNode: "restart" }]
    },
    finalExodus: {
        text: "🛟 FINAL: EVACUAÇÃO HEROICA. Você usa as reservas cuidadosamente guardadas para transportar todos em segurança. A colônia é abandonada, mas nenhuma vida é deixada para trás. A tripulação lembra seu comando como a decisão mais humana da missão.",
        choices: [{ text: "Jogar Novamente", nextNode: "restart" }]
    },
    finalFrontier: {
        text: "🌱 FINAL: UM NOVO LAR. Com água, ciência, energia e uma comunidade unida, nasce um assentamento lunar independente. Não é apenas uma base de mineração: é o primeiro lar construído para pertencer a todos.",
        choices: [{ text: "Jogar Novamente", nextNode: "restart" }]
    },
    finalDisaster: {
        text: "💀 FINAL: O DESASTRE NA ESCURIDÃO. Os sistemas congelaram e as estufas morreram. Meses depois, equipes de resgate encontraram apenas uma base silenciosa sob o regolito lunar. A Lua não perdoa erros.",
        choices: [{ text: "Jogar Novamente", nextNode: "restart" }]
    }
};

// Atualiza os painéis visuais de recursos
function updateUI() {
    resEnergy.textContent = gameState.energy;
    resSupplies.textContent = gameState.supplies;
    resCorporate.textContent = gameState.corporate;

    energyBar.style.width = `${gameState.energy}%`;
    suppliesBar.style.width = `${Math.min(gameState.supplies / 30 * 100, 100)}%`;
    influenceBar.style.width = `${Math.min(gameState.corporate, 100)}%`;
    energyBar.classList.toggle('low', gameState.energy < 30);
    suppliesBar.classList.toggle('low', gameState.supplies < 15);

    const experienceToNextLevel = experienceForNextLevel(gameState.level);
    playerLevel.textContent = gameState.level;
    playerXp.textContent = gameState.experience;
    xpBar.style.width = `${gameState.experience / experienceToNextLevel * 100}%`;
    xpTrack.setAttribute('aria-valuemax', experienceToNextLevel);
    xpTrack.setAttribute('aria-valuenow', gameState.experience);
    levelPerk.textContent = gameState.level < 2
        ? 'Nível 2: decisões especializadas'
        : gameState.level < 3
            ? 'Nível 3: decisões de elite'
            : gameState.level < 4
                ? 'Nível 3: rotas e finais especiais desbloqueados'
                : 'Nível 4: final secreto disponível';
}

function experienceForNextLevel(level) {
    return 80 + (level - 1) * 40;
}

function mapSceneForNode(nodeKey) {
    return mapNodeScenes[nodeKey] || 'base';
}

function drawMapLandmark(landmark) {
    mapContext.fillStyle = '#262b2a';
    mapContext.fillRect(landmark.x - 18, landmark.y + 9, 36, 20);
    mapContext.fillStyle = landmark.color;

    if (landmark.shape === 'dome' || landmark.shape === 'shelter') {
        mapContext.beginPath();
        mapContext.arc(landmark.x, landmark.y + 7, 22, Math.PI, 0);
        mapContext.fill();
        mapContext.fillRect(landmark.x - 22, landmark.y + 7, 44, 10);
    } else if (landmark.shape === 'greenhouse') {
        mapContext.fillRect(landmark.x - 23, landmark.y - 9, 46, 25);
        mapContext.strokeStyle = '#d5c498';
        mapContext.lineWidth = 2;
        mapContext.beginPath();
        mapContext.moveTo(landmark.x - 23, landmark.y - 9);
        mapContext.lineTo(landmark.x, landmark.y - 22);
        mapContext.lineTo(landmark.x + 23, landmark.y - 9);
        mapContext.stroke();
    } else if (landmark.shape === 'antenna') {
        mapContext.fillRect(landmark.x - 3, landmark.y - 25, 6, 45);
        mapContext.fillRect(landmark.x - 18, landmark.y - 23, 36, 4);
        mapContext.fillRect(landmark.x - 12, landmark.y - 30, 24, 4);
    } else if (landmark.shape === 'ruins') {
        mapContext.fillRect(landmark.x - 25, landmark.y - 15, 50, 32);
        mapContext.fillStyle = '#49473f';
        mapContext.fillRect(landmark.x - 9, landmark.y - 2, 18, 19);
        mapContext.fillStyle = landmark.color;
    } else if (landmark.shape === 'cache') {
        mapContext.fillRect(landmark.x - 19, landmark.y - 11, 38, 24);
        mapContext.fillStyle = '#4c615d';
        mapContext.fillRect(landmark.x - 11, landmark.y - 5, 22, 5);
        mapContext.fillStyle = landmark.color;
    } else if (landmark.shape === 'battery') {
        mapContext.fillRect(landmark.x - 17, landmark.y - 20, 34, 40);
        mapContext.fillRect(landmark.x - 8, landmark.y - 25, 16, 6);
        mapContext.fillStyle = '#3b4038';
        mapContext.fillRect(landmark.x - 10, landmark.y - 10, 20, 5);
        mapContext.fillRect(landmark.x - 10, landmark.y, 20, 5);
        mapContext.fillStyle = landmark.color;
    } else {
        mapContext.fillRect(landmark.x - 17, landmark.y - 13, 34, 28);
        mapContext.fillRect(landmark.x - 4, landmark.y - 24, 8, 12);
    }
}

function renderMap() {
    const scene = mapScenes[currentMapScene];
    mapContext.fillStyle = scene.color;
    mapContext.fillRect(0, 0, mapCanvas.width, mapCanvas.height);

    for (let y = 0; y < mapCanvas.height; y += 24) {
        for (let x = 0; x < mapCanvas.width; x += 24) {
            const variation = (Math.imul(x + 13, 31) ^ Math.imul(y + 7, 17)) % 5;
            mapContext.fillStyle = variation === 0 ? 'rgba(228, 217, 191, 0.07)' : 'rgba(27, 30, 30, 0.05)';
            mapContext.fillRect(x, y, 24, 24);
        }
    }

    mapContext.fillStyle = 'rgba(226, 214, 187, 0.1)';
    [[60, 54, 24], [276, 221, 33], [502, 48, 26], [660, 236, 19]].forEach(([x, y, radius]) => {
        mapContext.beginPath();
        mapContext.arc(x, y, radius, 0, Math.PI * 2);
        mapContext.fill();
        mapContext.strokeStyle = 'rgba(33, 35, 34, 0.18)';
        mapContext.stroke();
    });

    mapContext.strokeStyle = 'rgba(220, 208, 181, 0.28)';
    mapContext.lineWidth = 8;
    mapContext.beginPath();
    mapContext.moveTo(26, 252);
    mapContext.quadraticCurveTo(170, 207, 286, 237);
    mapContext.quadraticCurveTo(440, 271, 694, 224);
    mapContext.stroke();

    scene.landmarks.forEach(drawMapLandmark);

    scene.points.forEach(point => {
        const visited = gameState.visitedPoints.has(point.id);
        mapContext.beginPath();
        mapContext.arc(point.x, point.y - 30, visited ? 11 : 15, 0, Math.PI * 2);
        mapContext.fillStyle = visited ? 'rgba(169, 179, 159, 0.4)' : 'rgba(209, 169, 107, 0.2)';
        mapContext.fill();
        mapContext.strokeStyle = visited ? '#a8b39f' : '#f0cb89';
        mapContext.lineWidth = 2;
        mapContext.stroke();
        mapContext.fillStyle = visited ? '#a8b39f' : '#f0cb89';
        mapContext.font = 'bold 15px Arial';
        mapContext.textAlign = 'center';
        mapContext.fillText(visited ? '✓' : '!', point.x, point.y - 25);
    });

    mapContext.fillStyle = '#d7d4ca';
    mapContext.beginPath();
    mapContext.arc(explorer.x, explorer.y, 10, 0, Math.PI * 2);
    mapContext.fill();
    mapContext.strokeStyle = '#343b3d';
    mapContext.lineWidth = 3;
    mapContext.stroke();
    mapContext.fillStyle = '#d1a96b';
    mapContext.beginPath();
    mapContext.arc(explorer.x, explorer.y - 3, 4, 0, Math.PI * 2);
    mapContext.fill();

    mapMessage.textContent = `${scene.name} · ${gameState.visitedPoints.size} locais investigados`;
}

function moveExplorer(direction) {
    const movement = {
        up: [0, -explorer.speed],
        down: [0, explorer.speed],
        left: [-explorer.speed, 0],
        right: [explorer.speed, 0]
    }[direction];

    if (!movement || gameScreen.classList.contains('hidden')) return;
    explorer.x = Math.max(18, Math.min(mapCanvas.width - 18, explorer.x + movement[0]));
    explorer.y = Math.max(24, Math.min(mapCanvas.height - 18, explorer.y + movement[1]));
    renderMap();
}

function interactWithMap() {
    if (gameScreen.classList.contains('hidden')) return;

    const points = mapScenes[currentMapScene].points;
    const nearbyPoint = points.find(point => Math.hypot(point.x - explorer.x, point.y - 30 - explorer.y) < 42);

    if (!nearbyPoint) {
        mapMessage.textContent = 'Aproxime-se de um marcador dourado (!) para investigar.';
        return;
    }

    if (gameState.visitedPoints.has(nearbyPoint.id)) {
        mapMessage.textContent = `${nearbyPoint.title} já foi investigado.`;
        return;
    }

    gameState.visitedPoints.add(nearbyPoint.id);
    if (nearbyPoint.discover) gameState.discoveries.add(nearbyPoint.discover);
    if (nearbyPoint.effects) {
        gameState.energy = Math.min(100, Math.max(0, gameState.energy + (nearbyPoint.effects.energy || 0)));
        gameState.supplies = Math.max(0, gameState.supplies + (nearbyPoint.effects.supplies || 0));
        gameState.corporate = Math.min(100, Math.max(0, gameState.corporate + (nearbyPoint.effects.corporate || 0)));
    }

    addExperience(nearbyPoint.xp);
    updateUI();
    goToNode(currentNodeKey);
    mapMessage.textContent = `${nearbyPoint.title}: ${nearbyPoint.text} (+${nearbyPoint.xp} XP)`;
}

function addExperience(amount) {
    gameState.experience += amount;
    let experienceToNextLevel = experienceForNextLevel(gameState.level);
    while (gameState.experience >= experienceToNextLevel) {
        gameState.experience -= experienceToNextLevel;
        gameState.level += 1;
        experienceToNextLevel = experienceForNextLevel(gameState.level);
    }
}

function choiceLockReason(choice) {
    if (choice.requiredLevel && gameState.level < choice.requiredLevel) {
        return `Requer nível ${choice.requiredLevel}`;
    }
    if (choice.requiredDiscoveries) {
        const missing = choice.requiredDiscoveries.filter(discovery => !gameState.discoveries.has(discovery));
        if (missing.length) return 'Investigue mais locais no mapa 2D';
    }
    if (choice.requiredResources) {
        const missing = Object.entries(choice.requiredResources).find(([resource, amount]) => gameState[resource] < amount);
        if (missing) {
            const [resource, amount] = missing;
            const resourceName = { energy: 'energia', supplies: 'suprimentos' }[resource];
            return `Requer ${amount} de ${resourceName}`;
        }
    }
    return '';
}

// Controla a transição e exibição do texto da história
function goToNode(nodeKey) {
    if (nodeKey === "restart") {
        gameState.energy = 100;
        gameState.supplies = 30;
        gameState.corporate = 50;
        gameState.experience = 0;
        gameState.level = 1;
        gameState.discoveries = new Set();
        gameState.visitedPoints = new Set();
        nodeKey = "intro";
    }

    currentNodeKey = nodeKey;
    const nextMapScene = mapSceneForNode(nodeKey);
    if (nextMapScene !== currentMapScene) {
        currentMapScene = nextMapScene;
        explorer.x = 360;
        explorer.y = 260;
    }

    const node = storyNodes[nodeKey];
    const [currentQuest, currentObjective] = questDetails[nodeKey];
    questTitle.textContent = currentQuest;
    questDescription.textContent = currentObjective;
    chapterHeading.textContent = chapterDetails[nodeKey];
    storyText.textContent = node.text;
    choicesPanel.innerHTML = ""; // Limpa escolhas anteriores
    renderMap();

    node.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.classList.add('btn', 'choice-btn');
        const lockReason = choiceLockReason(choice);
        button.disabled = Boolean(lockReason);
        const number = document.createElement('span');
        number.classList.add('choice-number');
        number.textContent = `0${index + 1}`;

        const copy = document.createElement('span');
        copy.classList.add('choice-copy');
        copy.textContent = lockReason ? `${choice.text} (${lockReason})` : choice.text;

        const arrow = document.createElement('span');
        arrow.classList.add('choice-arrow');
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '↗';

        button.append(number, copy, arrow);
       
        button.addEventListener('click', () => {
            if (choiceLockReason(choice)) return;

            // Aplica os efeitos nos recursos (se houver)
            if (choice.effects) {
                gameState.energy = Math.min(100, Math.max(0, gameState.energy + (choice.effects.energy || 0)));
                gameState.supplies = Math.max(0, gameState.supplies + (choice.effects.supplies || 0));
                gameState.corporate = Math.min(100, Math.max(0, gameState.corporate + (choice.effects.corporate || 0)));
                addExperience(40);
            }
           
            // Checa condições críticas antes de ir para o próximo nó
            if (gameState.energy <= 0 || gameState.supplies <= 0) {
                goToNode("finalDisaster");
            } else {
                goToNode(choice.nextNode);
            }
        });
        choicesPanel.appendChild(button);
    });
    updateUI();
}

// Iniciar Jogo
startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    goToNode('intro');
});

document.querySelectorAll('[data-move]').forEach(button => {
    button.addEventListener('click', () => moveExplorer(button.dataset.move));
});

interactButton.addEventListener('click', interactWithMap);
mapCanvas.addEventListener('click', () => mapCanvas.focus());

document.addEventListener('keydown', event => {
    const directions = {
        ArrowUp: 'up', w: 'up', W: 'up',
        ArrowDown: 'down', s: 'down', S: 'down',
        ArrowLeft: 'left', a: 'left', A: 'left',
        ArrowRight: 'right', d: 'right', D: 'right'
    };
    if (directions[event.key]) {
        event.preventDefault();
        moveExplorer(directions[event.key]);
    } else if (event.key === 'e' || event.key === 'E') {
        interactWithMap();
    }
});

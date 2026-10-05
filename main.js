// Estado do Jogo (Recursos Iniciais)
const gameState = {
    energy: 100,
    supplies: 30,
    corporate: 50,
    experience: 0,
    level: 1
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
    finalCorporate: ['Uma vitória amarga', 'Seu caminho levou a colônia ao resgate corporativo.'],
    finalIndependence: ['Um novo mundo', 'A colônia conquistou seu lugar entre as estrelas.'],
    finalRescue: ['Uma nova aliança', 'A colônia sobreviveu e conquistou voz própria.'],
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
    finalCorporate: 'EPÍLOGO · UMA VITÓRIA AMARGA',
    finalIndependence: 'EPÍLOGO · UM NOVO MUNDO',
    finalRescue: 'EPÍLOGO · UMA NOVA ALIANÇA',
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
        text: "A tempestade passa. Com os pesquisadores a salvo e novas reservas descobertas, Possible One tem uma chance real de sobreviver. Agora, a colônia precisa decidir que futuro construir.",
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
                text: "Negociar uma aliança: continuar na Lua com autonomia.",
                nextNode: "finalRescue",
                requiredLevel: 3,
                effects: { energy: 2, supplies: 2, corporate: 2 }
            }
        ]
    },
    finalCorporate: {
        text: "🏆 FINAL: RETORNO À TERRA. O resgate da Lunar Industries chega a tempo. Sua tripulação volta em segurança e a empresa anuncia sua promoção, mas Possible One continuará sob controle corporativo.",
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
            : 'Nível 3+: rotas e escolhas especiais desbloqueadas';
}

function experienceForNextLevel(level) {
    return 80 + (level - 1) * 40;
}

// Controla a transição e exibição do texto da história
function goToNode(nodeKey) {
    if (nodeKey === "restart") {
        gameState.energy = 100;
        gameState.supplies = 30;
        gameState.corporate = 50;
        gameState.experience = 0;
        gameState.level = 1;
        nodeKey = "intro";
    }

    const node = storyNodes[nodeKey];
    const [currentQuest, currentObjective] = questDetails[nodeKey];
    questTitle.textContent = currentQuest;
    questDescription.textContent = currentObjective;
    chapterHeading.textContent = chapterDetails[nodeKey];
    storyText.textContent = node.text;
    choicesPanel.innerHTML = ""; // Limpa escolhas anteriores

    node.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.classList.add('btn', 'choice-btn');
        const locked = choice.requiredLevel && gameState.level < choice.requiredLevel;
        button.disabled = Boolean(locked);
        const number = document.createElement('span');
        number.classList.add('choice-number');
        number.textContent = `0${index + 1}`;

        const copy = document.createElement('span');
        copy.classList.add('choice-copy');
        copy.textContent = locked
            ? `${choice.text} (requer nível ${choice.requiredLevel})`
            : choice.text;

        const arrow = document.createElement('span');
        arrow.classList.add('choice-arrow');
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '↗';

        button.append(number, copy, arrow);
       
        button.addEventListener('click', () => {
            if (locked) return;

            // Aplica os efeitos nos recursos (se houver)
            if (choice.effects) {
                gameState.energy = Math.min(100, Math.max(0, gameState.energy + (choice.effects.energy || 0)));
                gameState.supplies = Math.max(0, gameState.supplies + (choice.effects.supplies || 0));
                gameState.corporate = Math.min(100, Math.max(0, gameState.corporate + (choice.effects.corporate || 0)));
                gameState.experience += 40;

                let experienceToNextLevel = experienceForNextLevel(gameState.level);
                while (gameState.experience >= experienceToNextLevel) {
                    gameState.experience -= experienceToNextLevel;
                    gameState.level += 1;
                    experienceToNextLevel = experienceForNextLevel(gameState.level);
                }
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

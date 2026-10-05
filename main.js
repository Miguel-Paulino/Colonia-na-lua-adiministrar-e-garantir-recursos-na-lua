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
const questTitle = document.getElementById('quest-title');
const questDescription = document.getElementById('quest-description');

const questDetails = {
    intro: ['Sinal de socorro', 'Decida como salvar a colônia da crise de abastecimento.'],
    routeCorporate: ['O preço do progresso', 'Atenda à Lunar Industries ou proteja sua tripulação.'],
    routeIndependence: ['Raízes na Lua', 'Garanta o futuro de uma colônia sem apoio da Terra.'],
    routeDisaster: ['Noite sem energia', 'Encontre uma saída antes que os geradores parem.'],
    finalCorporate: ['Uma vitória amarga', 'Seu caminho levou a colônia ao resgate corporativo.'],
    finalIndependence: ['Um novo mundo', 'A colônia conquistou seu lugar entre as estrelas.'],
    finalDisaster: ['Silêncio lunar', 'A Lua guardará para sempre o fim da expedição.']
};

// Banco de Dados da História (Nós do Jogo)
const storyNodes = {
    intro: {
        text: "Comandante, a nave de suprimentos da Terra acabou de colidir no espaço profundo. Nosso estoque atual de Oxigênio e Comida garante apenas 30 dias de sobrevivência. O inverno lunar se aproxima e a refinaria está consumindo muita energia. Como prosseguir?",
        choices: [
            {
                text: "Focar na Refinaria: Manter produção máxima para agradar a Lunar Industries.",
                nextNode: "routeCorporate",
                effects: { energy: -20, supplies: -10, corporate: 35 }
            },
            {
                text: "Focar em Sobrevivência: Redirecionar energia para minerar gelo e ampliar as estufas.",
                nextNode: "routeIndependence",
                effects: { energy: -30, supplies: 15, corporate: -30 }
            },
            {
                text: "Tentar Equilíbrio: Manter tudo ligado e torcer por uma nave de emergência rápida.",
                nextNode: "routeDisaster",
                effects: { energy: -50, supplies: -5, corporate: 5 }
            }
        ]
    },
    routeCorporate: {
        text: "Os carregamentos de minério foram enviados no prazo e as ações da Lunar Industries dispararam. Porém, os colonos estão exaustos, com fome e confinados aos seus alojamentos sem entretenimento. A diretoria exige o lote final de Hélio-3.",
        choices: [
            {
                text: "Entregar o lote final (Exigir esforço máximo da tripulação).",
                nextNode: "finalCorporate",
                effects: { energy: -10, supplies: -10, corporate: 20 }
            },
            {
                text: "Recuar e dar descanso à tripulação (Arriscar quebra de contrato).",
                nextNode: "routeDisaster",
                effects: { energy: 10, supplies: -5, corporate: -20 }
            }
        ]
    },
    routeIndependence: {
        text: "A primeira colheita das estufas hidropônicas verticais foi um sucesso! O oxigênio estabilizou através da quebra do gelo da cratera. A diretoria cortou nossos canais oficiais de comunicação ao notar a falta de envios de minério. Estamos sozinhos.",
        choices: [
            {
                text: "Declarar Independência oficial da colônia lunar.",
                nextNode: "finalIndependence",
                effects: { energy: 0, supplies: 20, corporate: -50 }
            }
        ]
    },
    routeDisaster: {
        text: "O gerenciamento hesitante sobrecarregou os geradores. No meio da noite lunar de 14 dias, os alarmes começam a soar. O sistema elétrico principal está prestes a colapsar.",
        choices: [
            {
                text: "Iniciar protocolo de evacuação e desligamento.",
                nextNode: "finalDisaster",
                effects: { energy: -40, supplies: -10, corporate: -10 }
            }
        ]
    },
    // Finais do Jogo
    finalCorporate: {
        text: "🏆 FINAL: O CORPORATIVISTA EFICIENTE. Os lucros foram garantidos e o resgate chegou. Você é promovido a Diretor Executivo na Terra, mas deixa para trás uma colônia sem alma, transformada em uma prisão corporativa fria.",
        choices: [{ text: "Jogar Novamente", nextNode: "restart" }]
    },
    finalIndependence: {
        text: "🚀 FINAL: A REBELIÃO AUTOSSUSTENTÁVEL. A colônia prospera de forma independente. As estufas estão cheias e o ar é puro. Vocês não são mais funcionários da Terra, mas os primeiros verdadeiros cidadãos da Lua!",
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

    const experienceToNextLevel = 100 + (gameState.level - 1) * 50;
    playerLevel.textContent = gameState.level;
    playerXp.textContent = gameState.experience;
    xpBar.style.width = `${gameState.experience / experienceToNextLevel * 100}%`;
    xpTrack.setAttribute('aria-valuemax', experienceToNextLevel);
    xpTrack.setAttribute('aria-valuenow', gameState.experience);
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
    storyText.textContent = node.text;
    choicesPanel.innerHTML = ""; // Limpa escolhas anteriores

    node.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.classList.add('btn', 'choice-btn');
        const number = document.createElement('span');
        number.classList.add('choice-number');
        number.textContent = `0${index + 1}`;

        const copy = document.createElement('span');
        copy.classList.add('choice-copy');
        copy.textContent = choice.text;

        const arrow = document.createElement('span');
        arrow.classList.add('choice-arrow');
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '↗';

        button.append(number, copy, arrow);
       
        button.addEventListener('click', () => {
            // Aplica os efeitos nos recursos (se houver)
            if (choice.effects) {
                gameState.energy = Math.max(0, gameState.energy + (choice.effects.energy || 0));
                gameState.supplies = Math.max(0, gameState.supplies + (choice.effects.supplies || 0));
                gameState.corporate = Math.max(0, gameState.corporate + (choice.effects.corporate || 0));
                gameState.experience += 35;

                let experienceToNextLevel = 100 + (gameState.level - 1) * 50;
                while (gameState.experience >= experienceToNextLevel) {
                    gameState.experience -= experienceToNextLevel;
                    gameState.level += 1;
                    experienceToNextLevel = 100 + (gameState.level - 1) * 50;
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

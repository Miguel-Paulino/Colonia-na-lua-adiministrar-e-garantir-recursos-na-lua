// Estado do Jogo (Recursos Iniciais)
const gameState = {
    energy: 100,
    supplies: 30,
    corporate: 50
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

    // Alertas visuais se os recursos estiverem baixos
    resEnergy.style.color = gameState.energy < 30 ? "var(--danger-color)" : "var(--accent-color)";
    resSupplies.style.color = gameState.supplies < 15 ? "var(--danger-color)" : "var(--accent-color)";
}

// Controla a transição e exibição do texto da história
function goToNode(nodeKey) {
    if (nodeKey === "restart") {
        gameState.energy = 100;
        gameState.supplies = 30;
        gameState.corporate = 50;
        nodeKey = "intro";
    }

    const node = storyNodes[nodeKey];
    storyText.textContent = node.text;
    choicesPanel.innerHTML = ""; // Limpa escolhas anteriores

    node.choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.text;
        button.classList.add('btn', 'choice-btn');
       
        button.addEventListener('click', () => {
            // Aplica os efeitos nos recursos (se houver)
            if (choice.effects) {
                gameState.energy = Math.max(0, gameState.energy + (choice.effects.energy || 0));
                gameState.supplies = Math.max(0, gameState.supplies + (choice.effects.supplies || 0));
                gameState.corporate = Math.max(0, gameState.corporate + (choice.effects.corporate || 0));
            }
           
            updateUI();

            // Checa condições críticas antes de ir para o próximo nó
            if (gameState.energy <= 0 || gameState.supplies <= 0) {
                goToNode("finalDisaster");
            } else {
                goToNode(choice.nextNode);
            }
        });
        choicesPanel.appendChild(button);
    });
}

// Iniciar Jogo
startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    updateUI();
    goToNode('intro');
});

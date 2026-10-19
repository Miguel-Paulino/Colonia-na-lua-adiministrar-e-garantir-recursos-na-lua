
"use strict";

// ================================================
// LUNARIS: ECOS DA LUA
// RPG de exploração, administração e batalhas.
// ================================================

const $ = (id) => document.getElementById(id);

function createInitialState() {
  return {
    day: 1,
    hp: 100,
    maxHp: 100,
    mp: 40,
    maxMp: 40,
    xp: 0,
    level: 1,

    oxygen: 80,
    water: 70,
    food: 70,
    power: 60,
    credits: 50,
    trust: 60,
    research: 0,
    wins: 0,

    route: "",
    flags: {},
    scene: "intro",
    inBattle: false,
    enemy: null,
    playerTurn: true,
    defending: false,
    gameOver: false,
    final: false,
    onVictory: null
  };
}

let game = createInitialState();
let battleMessages = [];
let actionLocked = false;

// ================================================
// HABILIDADES
// ================================================

const skills = [
  {
    id: "shot",
    name: "Disparo de Plasma",
    icon: "🔫",
    cost: 0,
    damage: 18,
    description: "Ataque básico sem custo de energia."
  },
  {
    id: "pulse",
    name: "Pulso Lunar",
    icon: "⚡",
    cost: 10,
    damage: 32,
    description: "Ataque elétrico poderoso."
  },
  {
    id: "drone",
    name: "Drone de Combate",
    icon: "🤖",
    cost: 14,
    damage: 25,
    description: "Um drone ataca o inimigo."
  },
  {
    id: "heal",
    name: "Nanorreparo",
    icon: "💚",
    cost: 12,
    heal: 30,
    description: "Recupera até 30 pontos de vida."
  }
];

// ================================================
// INIMIGOS
// ================================================

const enemies = {
  slime: {
    name: "Gosma do Vácuo",
    icon: "🟣",
    hp: 48,
    damage: 9,
    xp: 20,
    credits: 8,
    description: "Uma criatura que absorveu minerais lunares.",
    attackName: "Cuspe Corrosivo",
    specialChance: 0.25,
    specialMultiplier: 1.5,
    specialName: "Ácido Lunar"
  },

  sentinel: {
    name: "Sentinela Abandonada",
    icon: "🤖",
    hp: 72,
    damage: 13,
    xp: 30,
    credits: 15,
    description: "Um robô de mineração que considera todos invasores.",
    attackName: "Rajada Mecânica",
    specialChance: 0.30,
    specialMultiplier: 1.4,
    specialName: "Rajada Dupla"
  },

  hunter: {
    name: "Caçador da Cratera",
    icon: "👾",
    hp: 92,
    damage: 16,
    xp: 40,
    credits: 20,
    description: "Uma criatura que protege os depósitos de gelo.",
    attackName: "Garras Gravitacionais",
    specialChance: 0.30,
    specialMultiplier: 1.6,
    specialName: "Investida Gravitacional"
  },

  boss: {
    name: "GUARDIÃO DO ABISMO",
    icon: "👹",
    hp: 150,
    damage: 20,
    xp: 100,
    credits: 40,
    description: "Uma entidade mecânica ligada às ruínas.",
    attackName: "Canhão de Energia",
    specialChance: 0.35,
    specialMultiplier: 1.7,
    specialName: "Aniquilação Lunar"
  }
};

// ================================================
// INTERFACE
// ================================================

function updateUI() {
  $("day").textContent =
    `DIA ${String(game.day).padStart(2, "0")}`;

  const phases = {
    intro: "INICIALIZAÇÃO",
    colony: "ADMINISTRAÇÃO",
    exploration: "EXPLORAÇÃO",
    ruins: "INVESTIGAÇÃO",
    final: "DESFECHO",
    battle: "COMBATE"
  };

  $("phase").textContent = game.inBattle
    ? "COMBATE"
    : phases[game.scene] || "MISSÃO";

  $("hp-text").textContent =
    `${game.hp} / ${game.maxHp}`;

  $("mp-text").textContent =
    `${game.mp} / ${game.maxMp}`;

  $("xp-text").textContent =
    `${game.xp} XP · NV ${game.level}`;

  $("hp-bar").style.width =
    `${game.hp / game.maxHp * 100}%`;

  $("mp-bar").style.width =
    `${game.mp / game.maxMp * 100}%`;

  [
    "oxygen",
    "water",
    "food",
    "power",
    "credits",
    "trust",
    "research",
    "wins"
  ].forEach((id) => {
    $(id).textContent = game[id];
  });

  if (game.enemy) {
    $("enemy-hp-text").textContent =
      `${game.enemy.hp} / ${game.enemy.maxHp}`;

    $("enemy-hp-bar").style.width =
      `${Math.max(0, game.enemy.hp / game.enemy.maxHp * 100)}%`;
  }

  const objectives = {
    intro: "Decida como começar sua missão.",
    colony: "Administre os recursos e proteja os colonos.",
    exploration: "Explore a Lua e descubra recursos.",
    ruins: "Investigue a estrutura subterrânea.",
    final: "Decida o futuro de Lunaris."
  };

  $("objective").textContent = game.inBattle
    ? "Derrote o inimigo e sobreviva."
    : objectives[game.scene] || "Continue sua jornada.";
}

function setScene({
  label = "MISSÃO",
  title,
  icon = "🌙",
  text,
  choices = [],
  art = "moon"
}) {
  game.inBattle = false;
  game.enemy = null;
  game.playerTurn = true;
  actionLocked = false;

  $("battle-panel").classList.add("hidden");

  $("scene-label").textContent = label;
  $("scene-title").textContent = title;
  $("scene-icon").textContent = icon;
  $("story").innerHTML = text;
  $("scene-art").className = `scene-art art-${art}`;

  const container = $("choices");
  container.innerHTML = "";

  choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.className = "choice-button";

    const key = document.createElement("span");
    key.className = "choice-key";
    key.textContent = String.fromCharCode(65 + index);

    const labelElement = document.createElement("span");
    labelElement.textContent = choice.label;

    button.append(key, labelElement);

    button.addEventListener("click", () => {
      if (actionLocked || game.gameOver || game.final) return;
      choice.action();
    });

    container.appendChild(button);
  });

  updateUI();
}

// ================================================
// RECURSOS E SOBREVIVÊNCIA
// ================================================

function changeResources(changes) {
  for (const [key, amount] of Object.entries(changes)) {
    if (typeof game[key] !== "number") continue;

    game[key] = Math.max(
      0,
      Math.min(100, game[key] + amount)
    );
  }

  updateUI();
  checkSurvival();
}

function advanceDay() {
  if (game.gameOver || game.final) return;

  game.day++;
  game.oxygen -= 3;
  game.water -= 3;
  game.food -= 2;
  game.power -= 2;
  game.mp = Math.min(game.maxMp, game.mp + 5);

  updateUI();
  checkSurvival();
}

function checkSurvival() {
  if (game.gameOver || game.final) return true;

  if (game.hp <= 0) {
    endGame(
      "death",
      "SILÊNCIO ETERNO",
      "Alex cai durante a missão. Sem seu comandante, " +
      "a expedição termina tragicamente."
    );
    return true;
  }

  const depleted = [
    ["oxygen", "oxigênio"],
    ["water", "água"],
    ["food", "alimentos"],
    ["power", "energia"]
  ].find(([key]) => game[key] <= 0);

  if (depleted) {
    endGame(
      "death",
      "COLÔNIA EM COLAPSO",
      `O estoque de ${depleted[1]} acabou. ` +
      "Os sistemas essenciais deixam de funcionar."
    );
    return true;
  }

  return false;
}

// ================================================
// INÍCIO DO JOGO
// ================================================

function startGame() {
  game = createInitialState();
  battleMessages = [];
  actionLocked = false;
  renderIntro();
  updateUI();
}

function renderIntro() {
  game.scene = "intro";

  setScene({
    label: "TRANSMISSÃO RECEBIDA",
    title: "Bem-vindo a Lunaris",
    icon: "🌍",
    art: "moon",

    text:
      "Ano 2089. A humanidade construiu uma colônia " +
      "no polo sul lunar.\n\n" +
      "Você é Alex, o novo comandante de Lunaris. " +
      "Existem 120 colonos, recursos limitados e uma " +
      "região desconhecida esperando para ser explorada.\n\n" +
      "<strong>ÍRIS:</strong> " +
      "\"Comandante, precisamos escolher nossa primeira prioridade. " +
      "O futuro da humanidade depende de suas decisões.\"\n\n" +
      "A Terra brilha no horizonte. Sua missão começa agora.",

    choices: [
      {
        label: "Fortalecer a colônia.",
        action: () => {
          game.route = "colony";
          changeResources({
            oxygen: 8,
            water: 10,
            trust: 10,
            credits: -10
          });
          if (!game.gameOver) renderColony();
        }
      },
      {
        label: "Explorar a cratera.",
        action: () => {
          game.route = "explorer";
          changeResources({
            research: 5,
            trust: -5
          });
          if (!game.gameOver) renderExploration();
        }
      },
      {
        label: "Investigar os sinais misteriosos.",
        action: () => {
          game.route = "mystery";
          changeResources({
            power: -5,
            research: 12
          });
          if (!game.gameOver) renderRuins();
        }
      }
    ]
  });
}

$("restart").addEventListener("click", startGame);
startGame();
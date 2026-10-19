(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const TILE = 32;
  const COLS = 20;
  const ROWS = 12;

  const $ = id => document.getElementById(id);

  const initialResources = () => ({
    oxygen: 100,
    water: 100,
    energy: 100,
    food: 100,
    ore: 0,
    ice: 0
  });

  let state;
  let map;
  let deposits;
  let buildings;
  let player;
  let day;
  let ended;
  let logMessages;

  // Tipos de terreno: solo, rocha, gelo, minério e base.
  function reset() {
    state = initialResources();
    day = 1;
    ended = false;
    player = { x: 2, y: 2, dir: "down" };
    buildings = [];
    logMessages = [];
    map = [];
    deposits = [];

    for (let y = 0; y < ROWS; y++) {
      map[y] = [];
      for (let x = 0; x < COLS; x++) {
        const edge = x === 0 || y === 0 ||
          x === COLS - 1 || y === ROWS - 1;
        const n = (x * 17 + y * 31 + x * y * 7) % 23;
        map[y][x] = edge ? "rock" : n < 3 ? "rock" : "soil";
      }
    }

    // Área inicial segura para a colônia.
    for (let y = 1; y <= 4; y++) {
      for (let x = 1; x <= 5; x++) map[y][x] = "soil";
    }
    map[2][2] = "base";

    const places = [
      [7, 2, "ice"], [9, 4, "ore"], [13, 2, "ore"],
      [15, 5, "ice"], [6, 7, "ore"], [10, 8, "ice"],
      [14, 9, "ore"], [17, 8, "ice"], [4, 9, "ice"],
      [11, 3, "ice"], [8, 10, "ore"], [17, 2, "ore"],
      [3, 6, "ore"], [12, 6, "ice"], [5, 4, "ore"]
    ];

    for (const [x, y, type] of places) {
      map[y][x] = "soil";
      deposits.push({ x, y, type, amount: type === "ice" ? 3 : 2 });
    }

    addLog("Sistema iniciado. Colônia estabelecida.");
    addLog("Colete gelo e minério para sobreviver.");
    render();
    updateUI();
  }

  function addLog(message) {
    logMessages.unshift(message);
    logMessages = logMessages.slice(0, 8);
    const log = $("log");
    if (log) {
      log.replaceChildren();
      for (const msg of logMessages) {
        const p = document.createElement("p");
        p.textContent = msg;
        log.appendChild(p);
      }
    }
  }

  function drawTile(x, y, type) {
    const px = x * TILE;
    const py = y * TILE;

    if (type === "rock") {
      ctx.fillStyle = "#222b3b";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "#39475b";
      ctx.fillRect(px + 4, py + 5, 19, 10);
      ctx.fillStyle = "#151d2b";
      ctx.fillRect(px + 15, py + 19, 13, 9);
    } else {
      ctx.fillStyle = (x + y) % 2 ? "#697487" : "#737e90";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "#8791a1";
      ctx.fillRect(px + 4, py + 7, 3, 3);
      ctx.fillRect(px + 23, py + 21, 4, 3);
      ctx.fillStyle = "#5a6578";
      ctx.fillRect(px + 12, py + 26, 5, 2);
    }

    if (type === "base") {
      ctx.fillStyle = "#253e52";
      ctx.fillRect(px + 3, py + 3, 26, 26);
      ctx.fillStyle = "#c3e7e8";
      ctx.fillRect(px + 8, py + 7, 16, 17);
      ctx.fillStyle = "#f6c85f";
      ctx.fillRect(px + 13, py + 3, 6, 5);
      ctx.fillStyle = "#42677b";
      ctx.fillRect(px + 12, py + 12, 8, 12);
    }
  }

  function drawDeposit(d) {
    const px = d.x * TILE;
    const py = d.y * TILE;

    if (d.amount <= 0) return;

    if (d.type === "ice") {
      ctx.fillStyle = "#a8f2ff";
      ctx.fillRect(px + 7, py + 9, 18, 14);
      ctx.fillStyle = "#e6ffff";
      ctx.fillRect(px + 12, py + 6, 8, 17);
      ctx.fillStyle = "#64b9e5";
      ctx.fillRect(px + 10, py + 20, 13, 4);
    } else {
      ctx.fillStyle = "#f2bb65";
      ctx.fillRect(px + 7, py + 12, 18, 12);
      ctx.fillStyle = "#fff0a4";
      ctx.fillRect(px + 12, py + 8, 10, 8);
      ctx.fillStyle = "#a96e46";
      ctx.fillRect(px + 17, py + 20, 9, 5);
    }
  }

  function drawBuilding(b) {
    const px = b.x * TILE;
    const py = b.y * TILE;

    if (b.type === "oxygen") {
      ctx.fillStyle = "#b9e8e7";
      ctx.fillRect(px + 5, py + 7, 22, 20);
      ctx.fillStyle = "#438d99";
      ctx.fillRect(px + 9, py + 11, 14, 9);
      ctx.fillStyle = "#70e1dc";
      ctx.fillRect(px + 13, py + 13, 6, 5);
    } else if (b.type === "farm") {
      ctx.fillStyle = "#5b9462";
      ctx.fillRect(px + 3, py + 7, 26, 20);
      ctx.fillStyle = "#a5e6a4";
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(px + 6 + i * 6, py + 10, 3, 13);
        ctx.fillRect(px + 5 + i * 6, py + 10, 5, 4);
      }
    } else {
      ctx.fillStyle = "#f4d477";
      ctx.fillRect(px + 3, py + 12, 26, 13);
      ctx.fillStyle = "#c0e8ee";
      ctx.fillRect(px + 6, py + 14, 9, 9);
      ctx.fillStyle = "#b6baca";
      ctx.fillRect(px + 17, py + 14, 9, 9);
    }
  }

  function drawPlayer() {
    const px = player.x * TILE;
    const py = player.y * TILE;

    // Sombra.
    ctx.fillStyle = "#293143";
    ctx.fillRect(px + 6, py + 25, 21, 5);

    // Mochila.
    ctx.fillStyle = "#d28e48";
    ctx.fillRect(px + 4, py + 12, 7, 13);

    // Traje.
    ctx.fillStyle = "#f2eee1";
    ctx.fillRect(px + 10, py + 13, 13, 13);
    ctx.fillStyle = "#70e1dc";
    ctx.fillRect(px + 13, py + 16, 7, 5);

    // Capacete.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(px + 9, py + 4, 16, 13);
    ctx.fillStyle = "#4c91b4";
    ctx.fillRect(px + 12, py + 7, 11, 7);
    ctx.fillStyle = "#a7edee";
    ctx.fillRect(px + 14, py + 8, 4, 2);
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        drawTile(x, y, map[y][x]);
      }
    }

    for (const d of deposits) drawDeposit(d);
    for (const b of buildings) drawBuilding(b);
    drawPlayer();

    // Marcador da base.
    ctx.strokeStyle = "#f6c85f";
    ctx.lineWidth = 2;
    ctx.strokeRect(2 * TILE + 1, 2 * TILE + 1, TILE - 2, TILE - 2);
  }

  function updateUI() {
    for (const key of ["oxygen", "water", "energy", "food", "ore", "ice"]) {
      const el = $(key);
      if (el) el.textContent = state[key];
    }

    $("day").textContent = `DIA ${String(day).padStart(2, "0")}`;
    $("position").textContent =
      `X: ${String(player.x + 1).padStart(2, "0")} / Y: ${String(player.y + 1).padStart(2, "0")}`;

    const danger = ["oxygen", "water", "energy", "food"]
      .some(key => state[key] <= 25);

    $("status").textContent = ended
      ? (day > 15 ? "MISSÃO CONCLUÍDA" : "MISSÃO ENCERRADA")
      : danger ? "ALERTA: RECURSOS BAIXOS" : "SISTEMA OPERACIONAL";

    $("status").classList.toggle("warning", danger || ended);

    for (const id of ["buildOxygen", "buildFarm", "buildSolar", "endDay"]) {
      $(id).disabled = ended;
    }

    $("weather").textContent = ended ? "FIM DA MISSÃO" : "VÁCUO EXTERNO";
  }

  function move(dx, dy) {
    if (ended) return;

    if (dx > 0) player.dir = "right";
    if (dx < 0) player.dir = "left";
    if (dy > 0) player.dir = "down";
    if (dy < 0) player.dir = "up";

    const nx = player.x + dx;
    const ny = player.y + dy;

    if (nx < 1 || ny < 1 || nx >= COLS - 1 || ny >= ROWS - 1) {
      addLog("Limite do setor explorável.");
      return;
    }

    if (map[ny][nx] === "rock") {
      addLog("Rocha intransponível. Procure outro caminho.");
      return;
    }

    player.x = nx;
    player.y = ny;

    // Recursos encontrados no terreno são coletados automaticamente.
    const deposit = deposits.find(d =>
      d.x === nx && d.y === ny && d.amount > 0
    );

    if (deposit) {
      if (deposit.type === "ice") {
        deposit.amount--;
        state.ice += 1;
        state.water = Math.min(100, state.water + 12);
        addLog("Gelo lunar coletado: +1 gelo e +12 água.");
      } else {
        deposit.amount--;
        state.ore += 2;
        addLog("Minério coletado: +2 unidades.");
      }
    }

    render();
    updateUI();
  }

  function interact() {
    if (ended) return;

    const near = deposits.find(d =>
      d.amount > 0 &&
      Math.abs(d.x - player.x) + Math.abs(d.y - player.y) <= 1
    );

    if (near) {
      if (near.type === "ice") {
        near.amount--;
        state.ice++;
        state.water = Math.min(100, state.water + 18);
        addLog("Extração manual de gelo: +18 água.");
      } else {
        near.amount--;
        state.ore += 2;
        addLog("Extração manual concluída: +2 minério.");
      }
    } else if (map[player.y][player.x] === "base") {
      addLog("Base lunar: volte aqui para planejar sua expedição.");
    } else {
      addLog("Nenhum recurso próximo. Explore o mapa.");
    }

    render();
    updateUI();
  }

  function build(type, cost) {
    if (ended) return;

    if (state.ore < cost) {
      addLog(`Minério insuficiente. Necessário: ${cost}.`);
      return;
    }

    if (buildings.some(b => b.x === player.x && b.y === player.y) ||
        map[player.y][player.x] === "base") {
      addLog("Escolha um terreno livre para construir.");
      return;
    }

    state.ore -= cost;
    buildings.push({ x: player.x, y: player.y, type });

    const names = {
      oxygen: "Gerador de oxigênio",
      farm: "Estufa hidropônica",
      solar: "Painel solar"
    };
    addLog(`${names[type]} construído. Produção ativa.`);
    render();
    updateUI();
  }

  function endDay() {
    if (ended) return;

    day++;

    // Consumo diário básico da equipe.
    state.oxygen -= 12;
    state.water -= 10;
    state.energy -= 8;
    state.food -= 10;

    // Infraestrutura construída gera recursos a cada dia.
    for (const b of buildings) {
      if (b.type === "oxygen") state.oxygen += 28;
      if (b.type === "farm") state.food += 24;
      if (b.type === "solar") state.energy += 22;
    }

    // Um pouco de energia também mantém a reciclagem de água.
    if (state.energy > 0) state.water += 3;

    for (const key of ["oxygen", "water", "energy", "food"]) {
      state[key] = Math.max(0, Math.min(100, state[key]));
    }

    if (["oxygen", "water", "energy", "food"]
      .some(key => state[key] <= 0)) {
      ended = true;
      addLog("Falha crítica de suporte à vida. Missão encerrada.");
    } else if (day > 15) {
      ended = true;
      addLog("15 dias de sobrevivência concluídos. Você venceu!");
    } else {
      addLog(`Dia ${day}: consumo calculado e sistemas atualizados.`);
    }

    updateUI();
    render();
  }

  document.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();
    const keys = [
      "arrowup", "arrowdown", "arrowleft", "arrowright",
      "w", "a", "s", "d", "e", " "
    ];

    if (!keys.includes(key)) return;

    event.preventDefault();

    if (key === "arrowup" || key === "w") move(0, -1);
    if (key === "arrowdown" || key === "s") move(0, 1);
    if (key === "arrowleft" || key === "a") move(-1, 0);
    if (key === "arrowright" || key === "d") move(1, 0);
    if (key === "e") interact();
    if (key === " ") endDay();
  });

  $("buildOxygen").addEventListener("click",
    () => build("oxygen", 12));
  $("buildFarm").addEventListener("click",
    () => build("farm", 10));
  $("buildSolar").addEventListener("click",
    () => build("solar", 8));
  $("endDay").addEventListener("click", endDay);
  $("restart").addEventListener("click", reset);

  reset();
})();
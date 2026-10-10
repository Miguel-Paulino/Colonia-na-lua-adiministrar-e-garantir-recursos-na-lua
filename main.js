/* ============================================================
   COLÔNIA LUNAR: HORIZONTE — main.js
   Jogo 3D de administração de colônia na Lua.
   5 níveis | 3 rotas (Ciência / Indústria / Diplomacia)
   ============================================================ */

/* ----------------- ESTADO DO JOGO ----------------- */
const state = {
  res: { energy: 60, oxygen: 50, water: 50, minerals: 40, science: 0, credits: 80, reputation: 0 },
  level: 1,
  routes: { science: 0, industry: 0, diplomacy: 0 },
  buildings: [],
  selected: null,
  solarBoost: 0,       // tempestade solar: painéis x2 por N ticks
  gameWon: false,
  nextId: 1,
  crew: [
    { id: 'vega',  name: 'Cmd. Valéria Vega',  role: 'Comando',    bonus: 'all',       icon: '👩‍🚀', assigned: null, desc: '+25% em tudo no módulo designado' },
    { id: 'kenji', name: 'Eng. Kenji Tanaka',  role: 'Engenharia', bonus: 'industry',  icon: '👨‍🔧', assigned: null, desc: '+60% de produção industrial' },
    { id: 'aisha', name: 'Dra. Aisha Marek',   role: 'Ciência',    bonus: 'science',   icon: '👩‍🔬', assigned: null, desc: '+60% de pesquisa científica' },
    { id: 'ravi',  name: 'Emb. Ravi Costa',    role: 'Diplomacia', bonus: 'diplomacy', icon: '🧑‍💼', assigned: null, desc: '+60% em comércio e reputação' },
  ],
};

const LEVELS = [
  { n: 1, name: 'Módulo de Pouso',  need: 0 },
  { n: 2, name: 'Base Alfa',        need: 50 },
  { n: 3, name: 'Domo Selene',      need: 120 },
  { n: 4, name: 'Complexo Tycho',   need: 220 },
  { n: 5, name: 'Cidade Horizonte', need: 340 },
];
const FINAL_NEED = 340;

/* ----------------- DEFINIÇÃO DE MÓDULOS ----------------- */
const BUILD_DEFS = {
  solar:  { name: 'Painel Solar',       icon: '⚡', cost: { minerals: 10 },
            prod: { energy: 6 }, desc: 'Gera energia solar. Essencial para tudo.' },
  miner:  { name: 'Extrator de Rególito', icon: '⛏️', cost: { minerals: 15, energy: 5 },
            prod: { minerals: 3 }, cons: { energy: 2 }, desc: 'Minera minérios da superfície lunar.' },
  water:  { name: 'Destilador de Água', icon: '💧', cost: { minerals: 20 },
            prod: { water: 4 }, cons: { energy: 3 }, desc: 'Extrai gelo de crateras e o destila.' },
  oxygen: { name: 'Fábrica de O₂',      icon: '🫧', cost: { minerals: 25, water: 5 },
            prod: { oxygen: 5 }, cons: { energy: 3, water: 1 }, desc: 'Eletrólise: água vira oxigênio respirável.' },
  lab:    { name: 'Laboratório',        icon: '🔬', cost: { minerals: 30, oxygen: 10 },
            prod: { science: 4 }, cons: { energy: 4, oxygen: 1 }, desc: 'Pesquisa de ponta. Rota da Ciência.' },
  trade:  { name: 'Hub de Comércio',    icon: '🚀', cost: { minerals: 35, oxygen: 15 },
            prod: { credits: 6, reputation: 2 }, cons: { oxygen: 2 }, desc: 'Negocia com a órbita e a Terra. Rota da Diplomacia.' },
  hab:    { name: 'Habitação',          icon: '🏠', cost: { minerals: 20, oxygen: 10 },
            prod: {}, cons: { energy: 1, oxygen: 1 }, desc: 'Abriga a tripulação com conforto.' },
  elevator: { name: 'Elevador Orbital', icon: '🛗', cost: { minerals: 100, credits: 100, science: 40 },
            prod: {}, special: true, desc: 'A GRANDE OBRA: conecta a colônia à órbita. Exige Nível 5.' },
};

const costText = c => Object.entries(c).map(([k, v]) => `${v} ${({energy:'⚡',oxygen:'🫧',water:'💧',minerals:'⛏️',science:'🔬',credits:'💰'})[k]||k}`).join(' + ');

/* ----------------- CENA 3D ----------------- */
let scene, camera, renderer, controls, raycaster, mouse;
const clickable = [];
let rover, roverDir = 1, roverT = 0;
const meteors = [];
let earth, beaconTime = 0;

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020308);

  camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 2000);
  camera.position.set(45, 32, 45);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  document.getElementById('game-container').appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 3, 0);
  controls.maxPolarAngle = Math.PI / 2.05;
  controls.minDistance = 15; controls.maxDistance = 160;
  controls.enableDamping = true;

  // Luz do Sol + ambiente
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.4);
  sun.position.set(80, 100, 40); sun.castShadow = true;
  sun.shadow.camera.left = -80; sun.shadow.camera.right = 80;
  sun.shadow.camera.top = 80; sun.shadow.camera.bottom = -80;
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0x334455, 0.9));

  // Solo lunar
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(140, 64),
    new THREE.MeshStandardMaterial({ color: 0x8f8f92, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  ground.name = 'ground';
  scene.add(ground); clickable.push(ground);

  // Crateras decorativas
  for (let i = 0; i < 26; i++) {
    const r = 2 + Math.random() * 5;
    const crater = new THREE.Mesh(
      new THREE.RingGeometry(r * 0.7, r, 24),
      new THREE.MeshBasicMaterial({ color: 0x6e6e72, side: THREE.DoubleSide })
    );
    const a = Math.random() * Math.PI * 2, d = 25 + Math.random() * 100;
    crater.position.set(Math.cos(a) * d, 0.02, Math.sin(a) * d);
    crater.rotation.x = -Math.PI / 2;
    scene.add(crater);
  }

  // Estrelas
  const starGeo = new THREE.BufferGeometry();
  const starPos = [];
  for (let i = 0; i < 1600; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(700 + Math.random() * 300);
    v.y = Math.abs(v.y);
    starPos.push(v.x, v.y, v.z);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.4 })));

  // Terra no céu
  earth = new THREE.Mesh(
    new THREE.SphereGeometry(9, 32, 32),
    new THREE.MeshPhongMaterial({ color: 0x3a7bd5, emissive: 0x0a2a55, shininess: 60 })
  );
  earth.position.set(-90, 70, -140);
  scene.add(earth);
  const moonGlow = new THREE.Mesh(
    new THREE.SphereGeometry(9.8, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x5588ff, transparent: true, opacity: 0.15 })
  );
  earth.add(moonGlow);

  // Colônia inicial
  addBuilding('base', 0, 0, true);
  addBuilding('solar', -8, -6, true);
  addBuilding('miner', 10, -8, true);
  addBuilding('water', -9, 7, true);
  addBuilding('oxygen', 9, 8, true);
  buildCrewModels();
  buildRover();

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  renderer.domElement.addEventListener('click', onClick);
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  animate();
  setInterval(gameTick, 2000);
  setInterval(randomEvent, 30000);
  setTimeout(() => showOverlay('🌙 Bem-vindo à Colônia Horizonte',
    'Você é o <b>Comandante da Colônia Lunar</b>.<br><br>' +
    '• Gerencie <b>⚡ energia, 🫧 oxigênio, 💧 água e ⛏️ minérios</b><br>' +
    '• Construa módulos na barra inferior<br>' +
    '• Escolha sua rota: <b>🔬 Ciência</b>, <b>⚙️ Indústria</b> ou <b>🤝 Diplomacia</b> — qualquer combinação leva ao <b>Nível 5</b><br>' +
    '• No topo, construa o <b>🛗 Elevador Orbital</b> para vencer!<br><br>' +
    'Boa sorte, Comandante.'), 800);
}

/* ----------------- MODELOS 3D ----------------- */
function mesh(geo, color, x, y, z, opts = {}) {
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .8 }, opts)));
  m.position.set(x, y, z); m.castShadow = true;
  return m;
}

function makeBuildingMesh(type) {
  const g = new THREE.Group();
  const white = 0xd8dde3, metal = 0x9aa3ad, glow = 0x66ccff;
  switch (type) {
    case 'base':
      g.add(mesh(new THREE.CylinderGeometry(4, 4.6, 3, 12), white, 0, 1.5, 0));
      g.add(mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.4, 8), metal, 0, 3.6, 0));
      g.add(mesh(new THREE.BoxGeometry(2.4, .8, .2), glow, 0, 1.6, 4.45, { emissive: 0x2266aa }));
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2 + Math.PI / 4;
        g.add(mesh(new THREE.CylinderGeometry(.15, .2, 1.6, 6), metal, Math.cos(a) * 3.6, .8, Math.sin(a) * 3.6));
      }
      break;
    case 'solar':
      g.add(mesh(new THREE.CylinderGeometry(.12, .12, 2.2, 6), metal, 0, 1.1, 0));
      const panel = mesh(new THREE.BoxGeometry(4, .12, 2.4), 0x1a3fa0, 0, 2.3, 0, { metalness: .6, roughness: .3 });
      panel.rotation.x = -0.5; g.add(panel);
      break;
    case 'miner': {
      g.add(mesh(new THREE.CylinderGeometry(1.6, 2, 1.2, 8), metal, 0, .6, 0));
      const drill = mesh(new THREE.ConeGeometry(.5, 2.2, 8), 0x555c66, 0, .4, 0);
      drill.rotation.x = Math.PI; g.add(drill);
      g.userData.spin = drill;
      const leg1 = mesh(new THREE.BoxGeometry(.15, 2, .15), metal, 1.4, 1, 0); leg1.rotation.z = .4; g.add(leg1);
      const leg2 = mesh(new THREE.BoxGeometry(.15, 2, .15), metal, -1.4, 1, 0); leg2.rotation.z = -.4; g.add(leg2);
      break;
    }
    case 'water':
      g.add(mesh(new THREE.SphereGeometry(2.2, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2),
        0x9fd8ff, 0, 0, 0, { transparent: true, opacity: .55, roughness: .2 }));
      g.add(mesh(new THREE.CylinderGeometry(2.3, 2.3, .3, 20), metal, 0, .15, 0));
      break;
    case 'oxygen': {
      g.add(mesh(new THREE.BoxGeometry(3, .3, 2), metal, 0, .15, 0));
      g.add(mesh(new THREE.CylinderGeometry(.55, .55, 2.2, 12), 0xcfe8ff, -.7, 1.4, 0));
      g.add(mesh(new THREE.CylinderGeometry(.55, .55, 2.2, 12), 0xcfe8ff, .7, 1.4, 0));
      g.add(mesh(new THREE.SphereGeometry(.56, 12, 8), 0xaee0ff, -.7, 2.55, 0));
      g.add(mesh(new THREE.SphereGeometry(.56, 12, 8), 0xaee0ff, .7, 2.55, 0));
      break;
    }
    case 'lab':
      g.add(mesh(new THREE.BoxGeometry(3.6, 2, 2.6), white, 0, 1, 0));
      g.add(mesh(new THREE.SphereGeometry(1.3, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0x88ffee, 0, 2, 0, { transparent: true, opacity: .6 }));
      g.add(mesh(new THREE.BoxGeometry(1, .7, .1), glow, 0, 1.2, 1.32, { emissive: 0x2266aa }));
      break;
    case 'trade': {
      g.add(mesh(new THREE.CylinderGeometry(3.4, 3.6, .3, 8), 0x666e78, 0, .15, 0));
      g.add(mesh(new THREE.CylinderGeometry(.5, .7, 2.4, 10), white, 0, 1.5, 0));
      g.add(mesh(new THREE.ConeGeometry(.5, 1.1, 10), 0xff6b6b, 0, 3.2, 0));
      g.add(mesh(new THREE.BoxGeometry(1.8, .4, .4), metal, 1.4, .9, 0));
      break;
    }
    case 'hab':
      g.add(mesh(new THREE.CylinderGeometry(1.8, 1.8, 4.4, 14, 1, false, 0, Math.PI), white, 0, 0, 0));
      g.children[0].rotation.z = Math.PI / 2; g.children[0].position.y = 0;
      g.children[0].rotation.y = 0;
      g.add(mesh(new THREE.BoxGeometry(4.4, .25, 3.6), metal, 0, .12, 0));
      g.add(mesh(new THREE.BoxGeometry(.9, .6, .1), glow, 1, .9, 1.75, { emissive: 0x2266aa }));
      break;
    case 'elevator': {
      g.add(mesh(new THREE.CylinderGeometry(2.6, 3.4, 1.2, 8), metal, 0, .6, 0));
      g.add(mesh(new THREE.CylinderGeometry(.25, .45, 46, 8), 0xccd6e0, 0, 24, 0));
      g.add(mesh(new THREE.CylinderGeometry(.05, .05, 40, 6), 0x88ddff, 0, 50, 0, { emissive: 0x3399cc }));
      g.add(mesh(new THREE.SphereGeometry(1.4, 12, 10), 0xffd166, 0, 72, 0));
      g.add(mesh(new THREE.BoxGeometry(1.4, 1, .8), white, 0, 8, 0));
      break;
    }
  }
  // Baliza pulsante
  const beacon = mesh(new THREE.SphereGeometry(.18, 8, 8), 0xff4444, 0, type === 'elevator' ? 74 : 4.6, 0, { emissive: 0xff2222 });
  beacon.userData.isBeacon = true;
  g.add(beacon);
  return g;
}

function addBuilding(type, x, z, free = false) {
  const def = BUILD_DEFS[type];
  if (!free) {
    for (const k in def.cost) {
      if (state.res[k] < def.cost[k]) { addLog(`❌ Recursos insuficientes para <b>${def.name}</b>.`); return null; }
    }
    for (const k in def.cost) state.res[k] -= def.cost[k];
  }
  const b = { id: state.nextId++, type, upgrade: 1, damaged: false, x, z };
  b.group = makeBuildingMesh(type);
  b.group.position.set(x, 0, z);
  b.group.userData.building = b;
  b.group.traverse(o => { o.userData.building = b; });
  scene.add(b.group);
  clickable.push(b.group);
  state.buildings.push(b);
  if (!free) addLog(`🔧 <b>${def.name}</b> construído!`);
  return b;
}

function buildCrewModels() {
  const colors = { vega: 0xffd166, kenji: 0xff9f1c, aisha: 0x2ec4b6, ravi: 0xe06cff };
  state.crew.forEach((c, i) => {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(.34, .4, 1, 10), 0xe8ecf0, 0, .9, 0));       // corpo
    g.add(mesh(new THREE.SphereGeometry(.3, 12, 10), 0xe8ecf0, 0, 1.65, 0));          // capacete
    g.add(mesh(new THREE.SphereGeometry(.2, 10, 8), 0x223344, 0, 1.65, .16, { emissive: 0x335577 })); // visor
    g.add(mesh(new THREE.BoxGeometry(.4, .6, .25), colors[c.id], 0, 1, -.38));       // mochila colorida
    const a = -Math.PI / 2 + i * 0.9;
    g.position.set(Math.cos(a) * 7.5, 0, Math.sin(a) * 7.5);
    g.userData.crewId = c.id;
    scene.add(g);
    c.model = g;
  });
}

function buildRover() {
  rover = new THREE.Group();
  rover.add(mesh(new THREE.BoxGeometry(2, .7, 1.3), 0xb8bec6, 0, .75, 0));
  rover.add(mesh(new THREE.BoxGeometry(1, .4, 1), 0x888f98, .3, 1.3, 0));
  for (const [wx, wz] of [[-.7, .65], [.7, .65], [-.7, -.65], [.7, -.65]])
    rover.add(mesh(new THREE.CylinderGeometry(.35, .35, .25, 10), 0x3a3f46, wx, .35, wz, { rotation: { x: 0 } }));
  rover.children.slice(2).forEach(w => w.rotation.x = Math.PI / 2);
  rover.add(mesh(new THREE.SphereGeometry(.12, 8, 8), 0xff4444, -.8, 1.2, 0, { emissive: 0xff2222 }));
  scene.add(rover);
}

/* ----------------- POSICIONAMENTO EM ESPIRAL ----------------- */
function nextFreeSpot() {
  const i = state.buildings.length;
  const golden = 2.4;
  const r = 6 + golden * Math.sqrt(i) * 1.6;
  const a = i * 2.4;
  return [Math.cos(a) * r, Math.sin(a) * r];
}

/* ----------------- CLIQUE / SELEÇÃO ----------------- */
function onClick(e) {
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(clickable, true);
  if (!hits.length) { selectBuilding(null); return; }
  const obj = hits[0].object;
  if (obj.name === 'ground') { selectBuilding(null); return; }
  const b = obj.userData.building;
  if (b) selectBuilding(b);
}

function selectBuilding(b) {
  if (state.selected) state.selected.group.traverse(o => {
    if (o.material && o.material.emissive && !o.userData.isBeacon) o.material.emissive.setHex(o.userData.origEmissive || 0x000000);
  });
  state.selected = b;
  const panel = document.getElementById('info-panel');
  if (!b) { panel.classList.add('hidden'); renderCrew(); return; }
  b.group.traverse(o => {
    if (o.material && o.material.emissive && !o.userData.isBeacon) {
      o.userData.origEmissive = o.material.emissive.getHex();
      o.material.emissive.setHex(0x224466);
    }
  });
  updateInfoPanel();
  panel.classList.remove('hidden');
  renderCrew();
}

function updateInfoPanel() {
  const b = state.selected; if (!b) return;
  const def = BUILD_DEFS[b.type];
  document.getElementById('info-name').textContent = `${def.icon} ${def.name} — Nv.${b.upgrade}`;
  document.getElementById('info-desc').textContent = def.desc + (b.damaged ? ' ⚠️ DANIFICADO!' : '');
  const parts = [];
  if (def.prod && Object.keys(def.prod).length)
    parts.push('Produz: ' + Object.entries(def.prod).map(([k, v]) => `${(v * (1 + (b.upgrade - 1) * .5)).toFixed(0)} ${({energy:'⚡',oxygen:'🫧',water:'💧',minerals:'⛏️',science:'🔬',credits:'💰',reputation:'🤝'})[k]}`).join(', '));
  if (def.cons) parts.push('Consome: ' + Object.entries(def.cons).map(([k, v]) => `${v} ${({energy:'⚡',oxygen:'🫧',water:'💧'})[k]}`).join(', '));
  const crewHere = state.crew.find(c => c.assigned === b.id);
  if (crewHere) parts.push(`Tripulante: ${crewHere.icon} ${crewHere.name.split(' ')[0]} ${crewHere.name.split(' ')[1]}`);
  document.getElementById('info-prod').textContent = parts.join(' | ');

  const btns = document.getElementById('info-buttons');
  btns.innerHTML = '';
  if (!def.special) {
    const up = document.createElement('button');
    const cost = 10 * b.upgrade;
    up.textContent = `⬆️ Melhorar (${cost} ⛏️)`;
    up.disabled = state.res.minerals < cost;
    up.onclick = () => {
      if (state.res.minerals >= cost) { state.res.minerals -= cost; b.upgrade++; scaleBuilding(b); addLog(`⬆️ <b>${def.name}</b> melhorado para Nv.${b.upgrade}!`); updateInfoPanel(); }
    };
    btns.appendChild(up);
  }
  if (b.damaged) {
    const fix = document.createElement('button');
    fix.textContent = '🔩 Reparar (8 ⛏️)';
    fix.disabled = state.res.minerals < 8;
    fix.onclick = () => {
      if (state.res.minerals >= 8) {
        state.res.minerals -= 8; b.damaged = false;
        b.group.traverse(o => { if (o.material && o.material.color) o.material.color.setHex(o.userData.origColor || 0xffffff); });
        addLog(`🔩 <b>${def.name}</b> reparado!`); updateInfoPanel();
      }
    };
    btns.appendChild(fix);
  }
  if (def.special && state.level < 5) {
    const warn = document.createElement('button');
    warn.textContent = '🔒 Requer Nível 5'; warn.disabled = true;
    btns.appendChild(warn);
  }
  const close = document.createElement('button');
  close.textContent = '✖ Fechar';
  close.onclick = () => selectBuilding(null);
  btns.appendChild(close);
}

function scaleBuilding(b) {
  const s = 1 + (b.upgrade - 1) * .15;
  b.group.scale.set(s, s, s);
}

/* ----------------- TICK DO JOGO ----------------- */
function gameTick() {
  if (state.gameWon) return;
  let gained = { science: 0, industry: 0, diplomacy: 0 };
  state.buildings.forEach(b => {
    const def = BUILD_DEFS[b.type];
    if (b.damaged || !def.prod || !Object.keys(def.prod).length) return;
    if (def.cons) for (const k in def.cons) if (state.res[k] < def.cons[k]) return;
    if (def.cons) for (const k in def.cons) state.res[k] -= def.cons[k];
    let mult = 1 + (b.upgrade - 1) * .5;
    if (state.solarBoost > 0 && b.type === 'solar') mult *= 2;
    const crew = state.crew.find(c => c.assigned === b.id);
    if (crew) {
      if (crew.bonus === 'all') mult *= 1.25;
      else if (crew.bonus === 'industry' && (b.type === 'miner' || b.type === 'trade')) mult *= 1.6;
      else if (crew.bonus === 'science' && b.type === 'lab') mult *= 1.6;
      else if (crew.bonus === 'diplomacy' && b.type === 'trade') mult *= 1.6;
    }
    for (const k in def.prod) {
      const amt = def.prod[k] * mult;
      state.res[k] += amt;
      if (k === 'minerals') gained.industry += amt;
      if (k === 'science') gained.science += amt;
      if (k === 'reputation') gained.diplomacy += amt;
    }
  });
  state.solarBoost = Math.max(0, state.solarBoost - 1);
  state.routes.science += gained.science;
  state.routes.industry += gained.industry;
  state.routes.diplomacy += gained.diplomacy;
  checkLevel();
  updateHUD();
  if (state.selected) updateInfoPanel();
}

function checkLevel() {
  const total = state.routes.science + state.routes.industry + state.routes.diplomacy;
  let lv = 1;
  LEVELS.forEach(l => { if (total >= l.need) lv = l.n; });
  if (lv > state.level) {
    state.level = lv;
    const L = LEVELS[lv - 1];
    showOverlay(`🚀 NÍVEL ${lv}: ${L.name}`,
      `A colônia evoluiu para <b>${L.name}</b>!<br><br>` +
      (lv === 5 ? '🎉 Você chegou ao topo! Agora construa o <b>🛗 Elevador Orbital</b> (botão na barra inferior) para vencer o jogo!'
                 : 'Continue expandindo — a próxima meta está mais perto.'));
    addLog(`🚀 <b>Nível ${lv}</b> alcançado: ${L.name}!`);
  }
}

/* ----------------- EVENTOS ALEATÓRIOS ----------------- */
function randomEvent() {
  if (state.gameWon) return;
  const roll = Math.random();
  if (roll < 0.22) {
    const candidates = state.buildings.filter(b => b.type !== 'base' && !b.damaged);
    if (candidates.length) {
      const b = candidates[Math.floor(Math.random() * candidates.length)];
      b.damaged = true;
      b.group.traverse(o => { if (o.material && o.material.color) { o.userData.origColor = o.material.color.getHex(); o.material.color.setHex(0x662222); } });
      state.res.energy = Math.max(0, state.res.energy - 10);
      spawnMeteors();
      showOverlay('☄️ Chuva de Micrometeoritos!',
        `O <b>${BUILD_DEFS[b.type].name}</b> foi atingido e parou de funcionar!<br>Repare-o clicando nele (custa 8 ⛏️).`);
      addLog(`☄️ <b>${BUILD_DEFS[b.type].name}</b> danificado por micrometeoritos!`);
    }
  } else if (roll < 0.4) {
    state.solarBoost = 15;
    showOverlay('🌞 Tempestade Solar!', 'Seus painéis solares rendem o <b>dobro</b> pelos próximos instantes. Aproveite!');
    addLog('🌞 Tempestade solar: painéis x2!');
  } else if (roll < 0.58) {
    state.res.credits += 30; state.res.oxygen += 20;
    showOverlay('📦 Carga da Terra!', 'Um navio de suprimentos chegou da Terra: <b>+30 💰 e +20 🫧</b>.');
    addLog('📦 Carga da Terra recebida: +30 💰, +20 🫧.');
  } else if (roll < 0.74) {
    state.res.science += 15;
    showOverlay('📡 Sinal Anômalo!', 'Seus sensores captaram um sinal não identificado debaixo da superfície. Estudo rápido: <b>+15 🔬</b>.');
    addLog('📡 Sinal anômalo estudado: +15 🔬.');
  } else if (roll < 0.88) {
    state.res.reputation += 20;
    showOverlay('👥 Turistas Orbitais!', 'Um grupo de turistas visitou a colônia e voltou encantado. <b>+20 🤝</b> de reputação.');
    addLog('👥 Turistas: +20 🤝.');
  } else {
    state.res.oxygen = Math.max(0, state.res.oxygen - 12);
    showOverlay('⚠️ Micro-vazamento!', 'Um pequeno vazamento no domo foi contido. Custo: <b>-12 🫧</b>.');
    addLog('⚠️ Micro-vazamento: -12 🫧.');
  }
  updateHUD();
}

function spawnMeteors() {
  for (let i = 0; i < 8; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(.3, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffaa33 }));
    m.position.set((Math.random() - .5) * 120, 40 + Math.random() * 30, (Math.random() - .5) * 120);
    m.userData.vel = new THREE.Vector3((Math.random() - .5) * .3, -.8 - Math.random() * .5, (Math.random() - .5) * .3);
    scene.add(m); meteors.push(m);
  }
}

/* ----------------- VITÓRIA ----------------- */
function winGame() {
  state.gameWon = true;
  showOverlay('🏆 COLÔNIA HORIZONTE COMPLETA!',
    `O <b>Elevador Orbital</b> está operacional!<br><br>` +
    `Progresso final:<br>🔬 Ciência: <b>${Math.floor(state.routes.science)}</b><br>` +
    `⚙️ Indústria: <b>${Math.floor(state.routes.industry)}</b><br>` +
    `🤝 Diplomacia: <b>${Math.floor(state.routes.diplomacy)}</b><br><br>` +
    `Sua colônia na Lua agora está conectada às estrelas. A humanidade agradece, Comandante. 🌙`,
    true);
  addLog('🏆 <b>VITÓRIA!</b> Elevador Orbital concluído!');
}

/* ----------------- HUD ----------------- */
function updateHUD() {
  const map = { energy: 'r-energy', oxygen: 'r-oxygen', water: 'r-water', minerals: 'r-minerals', science: 'r-science', credits: 'r-credits', reputation: 'r-reputation' };
  for (const k in map) document.getElementById(map[k]).textContent = Math.floor(state.res[k]);

  const total = state.routes.science + state.routes.industry + state.routes.diplomacy;
  document.getElementById('level-num').textContent = 'NÍVEL ' + state.level;
  document.getElementById('level-name').textContent = LEVELS[state.level - 1].name;
  document.getElementById('level-fill').style.width = Math.min(100, total / FINAL_NEED * 100) + '%';

  document.getElementById('bar-science').style.width = Math.min(100, state.routes.science / FINAL_NEED * 100) + '%';
  document.getElementById('bar-industry').style.width = Math.min(100, state.routes.industry / FINAL_NEED * 100) + '%';
  document.getElementById('bar-diplomacy').style.width = Math.min(100, state.routes.diplomacy / FINAL_NEED * 100) + '%';

  document.querySelectorAll('.build-btn').forEach(btn => {
    const type = btn.dataset.type;
    const def = BUILD_DEFS[type];
    const ok = Object.entries(def.cost).every(([k, v]) => state.res[k] >= v);
    const locked = def.special && state.level < 5;
    btn.disabled = !ok || locked;
    if (def.special) btn.querySelector('.b-cost').textContent = locked ? '🔒 Requer Nv.5' : costText(def.cost);
  });
}

function buildBuildBar() {
  const bar = document.getElementById('build-buttons');
  Object.entries(BUILD_DEFS).forEach(([type, def]) => {
    if (type === 'base') return;
    const btn = document.createElement('button');
    btn.className = 'build-btn';
    btn.dataset.type = type;
    btn.innerHTML = `<span class="b-icon">${def.icon}</span><span>${def.name}</span><span class="b-cost">${costText(def.cost)}</span>`;
    btn.onclick = () => {
      const [x, z] = nextFreeSpot();
      const b = addBuilding(type, x, z);
      if (b) {
        if (type === 'elevator') winGame();
        controls.target.set(x, 3, z);
        updateHUD();
      }
    };
    bar.appendChild(btn);
  });
}

function renderCrew() {
  const list = document.getElementById('crew-list');
  list.innerHTML = '';
  state.crew.forEach(c => {
    const card = document.createElement('div');
    card.className = 'crew-card';
    const here = c.assigned ? state.buildings.find(b => b.id === c.assigned) : null;
    card.innerHTML = `<div class="c-name">${c.icon} ${c.name}</div>
      <div class="c-role">${c.role}</div>
      <div class="c-desc">${c.desc}</div>
      <div class="c-status">${here ? '⚙️ Em: ' + BUILD_DEFS[here.type].name : '🟢 Disponível'}</div>`;
    const btn = document.createElement('button');
    if (state.selected && !BUILD_DEFS[state.selected.type].special) {
      btn.textContent = here && here.id === state.selected.id ? '✖ Remover' : '⇢ Designar aqui';
      btn.onclick = () => {
        state.crew.forEach(o => { if (o.assigned === state.selected.id) o.assigned = null; });
        c.assigned = (here && here.id === state.selected.id) ? null : state.selected.id;
        addLog(`${c.icon} <b>${c.name.split(' ')[0]} ${c.name.split(' ')[1]}</b> ${c.assigned ? 'designado ao ' + BUILD_DEFS[state.selected.type].name : 'liberado'}.`);
        renderCrew(); if (state.selected) updateInfoPanel();
      };
    } else {
      btn.textContent = 'Selecione um módulo'; btn.disabled = true;
    }
    card.appendChild(btn);
    list.appendChild(card);
  });
}

function addLog(msg) {
  const log = document.getElementById('log');
  const e = document.createElement('div');
  e.className = 'log-entry';
  e.innerHTML = msg;
  log.prepend(e);
  while (log.children.length > 8) log.lastChild.remove();
}

function showOverlay(title, html, victory = false) {
  document.getElementById('overlay-title').innerHTML = title;
  document.getElementById('overlay-text').innerHTML = html;
  const btn = document.getElementById('overlay-btn');
  btn.textContent = victory ? '↻ Jogar novamente' : 'Continuar';
  btn.onclick = () => {
    document.getElementById('overlay').classList.add('hidden');
    if (victory) location.reload();
  };
  document.getElementById('overlay').classList.remove('hidden');
}

/* ----------------- LOOP DE ANIMAÇÃO ----------------- */
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  beaconTime += 0.05;

  // Rover patrulha entre a base e a zona de mineração
  if (rover) {
    roverT += 0.004 * roverDir;
    if (roverT > 1) { roverT = 1; roverDir = -1; }
    if (roverT < 0) { roverT = 0; roverDir = 1; }
    rover.position.lerpVectors(new THREE.Vector3(5, 0, 3), new THREE.Vector3(24, 0, -14), roverT);
    rover.lookAt(24, 0, -14);
  }

  // Broca gira
  state.buildings.forEach(b => {
    if (b.group.userData.spin && !b.damaged) b.group.userData.spin.rotation.y += 0.25;
  });

  // Balizas pulsantes
  scene.traverse(o => {
    if (o.userData.isBeacon) {
      const s = 1 + Math.sin(beaconTime * 3 + o.position.x) * .4;
      o.scale.set(s, s, s);
    }
  });

  // Meteoro caindo
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    m.position.add(m.userData.vel);
    if (m.position.y < 0) { scene.remove(m); meteors.splice(i, 1); }
  }

  earth.rotation.y += 0.0004;
  renderer.render(scene, camera);
}

/* ----------------- INICIALIZAÇÃO ----------------- */
buildBuildBar();
updateHUD();
renderCrew();
addLog('🌙 <b>Colônia Horizonte</b> estabelecida no Mar da Tranquilidade.');
addLog('📡 Conexão com a Terra: estável.');
init();
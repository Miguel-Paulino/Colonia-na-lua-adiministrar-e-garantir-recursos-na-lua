const RESOURCES = ['energy', 'oxygen', 'water', 'minerals', 'food', 'science', 'credits'];
const RESOURCE_LABELS = {
  energy: 'Energia',
  oxygen: 'Oxigênio',
  water: 'Água',
  minerals: 'Minérios',
  food: 'Alimento',
  science: 'Ciência',
  credits: 'Créditos',
};
const RESOURCE_ICONS = {
  energy: 'ϟ',
  oxygen: '◉',
  water: '◒',
  minerals: '⬡',
  food: '✿',
  science: '⌘',
  credits: '◈',
};

const LEVELS = [
  { name: 'Primeiros passos', goal: 'Uma casa entre as estrelas', next: 'Base Alfa', threshold: 0 },
  { name: 'Base Alfa', goal: 'Uma base que respira', next: 'Domo Selene', threshold: 25 },
  { name: 'Domo Selene', goal: 'Uma comunidade lunar', next: 'Complexo Tycho', threshold: 65 },
  { name: 'Complexo Tycho', goal: 'Alcançar a órbita', next: 'Cidade Horizonte', threshold: 120 },
  { name: 'Cidade Horizonte', goal: 'O próximo grande salto', next: 'Elevador Orbital', threshold: 190 },
];

const BUILDINGS = {
  base: {
    name: 'Módulo de comando', icon: '⌂', category: 'COMANDO', level: 1,
    cost: {}, production: {}, consumes: {}, route: {}, specialty: 'commander',
    description: 'O coração da missão e o primeiro lar da tripulação.',
  },
  solar: {
    name: 'Campo solar', icon: 'ϟ', category: 'ENERGIA', level: 1,
    cost: { minerals: 14, energy: 5 }, production: { energy: 18 }, consumes: {},
    description: 'Painéis de perovskita transformam luz em eletricidade para toda a base.',
    route: { industry: 0.2 }, specialty: 'engineering',
  },
  mine: {
    name: 'Extrator lunar', icon: '⬡', category: 'INDÚSTRIA', level: 1,
    cost: { minerals: 18, energy: 8 }, production: { minerals: 5 }, consumes: { energy: 3 },
    description: 'Raspa o regolito para recuperar metais e materiais de construção.',
    route: { industry: 1.6 }, specialty: 'engineering',
  },
  water: {
    name: 'Sonda de gelo', icon: '◒', category: 'ÁGUA', level: 1,
    cost: { minerals: 18, energy: 8 }, production: { water: 5 }, consumes: { energy: 2 },
    description: 'Aquece o gelo subterrâneo da cratera e abastece os reservatórios.',
    route: {}, specialty: 'engineering',
  },
  oxygen: {
    name: 'Reciclador de ar', icon: '◉', category: 'SUPORTE À VIDA', level: 1,
    cost: { minerals: 20, energy: 8 }, production: { oxygen: 5 }, consumes: { energy: 3, water: 2 },
    description: 'Recicla água e captura oxigênio para os módulos habitados.',
    route: {}, specialty: 'engineering',
  },
  greenhouse: {
    name: 'Estufa lunar', icon: '✿', category: 'AGRICULTURA', level: 1,
    cost: { minerals: 24, energy: 10 }, production: { food: 5, science: 1 }, consumes: { energy: 2, water: 1 },
    description: 'Cultiva alimentos e experimenta espécies adaptadas à baixa gravidade.',
    route: { science: 1.4 }, specialty: 'science',
  },
  habitat: {
    name: 'Domo habitável', icon: '⌂', category: 'COMUNIDADE', level: 1,
    cost: { minerals: 23, energy: 9 }, production: {}, consumes: { energy: 1 },
    description: 'Um espaço seguro para a tripulação viver e transformar a base em lar.',
    route: { community: 2.2 }, specialty: 'commander',
  },
  lab: {
    name: 'Laboratório', icon: '✳', category: 'PESQUISA', level: 2,
    cost: { minerals: 30, energy: 12 }, production: { science: 5 }, consumes: { energy: 4, oxygen: 1 },
    description: 'Investiga o solo, a vida e as tecnologias necessárias para a próxima etapa.',
    route: { science: 5 }, specialty: 'science',
  },
  comms: {
    name: 'Antena de longo alcance', icon: '⌁', category: 'COMUNICAÇÃO', level: 3,
    cost: { minerals: 32, energy: 12 }, production: { credits: 4 }, consumes: { energy: 3 },
    description: 'Abre um canal confiável com a Terra e atrai apoio para a colônia.',
    route: { community: 4.5 }, specialty: 'commander',
  },
  shield: {
    name: 'Abrigo contra radiação', icon: '⬟', category: 'SEGURANÇA', level: 4,
    cost: { minerals: 40, energy: 15 }, production: {}, consumes: { energy: 2 },
    description: 'Camadas de água e regolito protegem a tripulação das tempestades solares.',
    route: { industry: 2.5 }, specialty: 'engineering',
  },
  elevator: {
    name: 'Elevador orbital', icon: '↑', category: 'GRANDE PROJETO', level: 5,
    cost: { minerals: 110, energy: 35, science: 40, credits: 35 }, production: {}, consumes: {},
    description: 'A ponte entre a Lua e a órbita. A obra que abre um novo capítulo.',
    route: {}, specialty: 'commander', final: true,
  },
};

const CREW = [
  { id: 'mei', name: 'Mei Nakamura', role: 'Engenheira de sistemas', specialty: 'engineering', icon: '👩🏽‍🚀', bonus: 'Módulos de energia, extração e suporte +30%.' },
  { id: 'imani', name: 'Imani Okafor', role: 'Bióloga e pesquisadora', specialty: 'science', icon: '👩🏾‍🔬', bonus: 'Estufas e laboratórios +30%.' },
  { id: 'tomas', name: 'Tomás Ribeiro', role: 'Comandante da missão', specialty: 'commander', icon: '🧑🏻‍🚀', bonus: 'Habitação e comunicação +30%.' },
];

const state = {
  resources: { energy: 80, oxygen: 60, water: 55, minerals: 65, food: 38, science: 0, credits: 35 },
  routes: { science: 0, industry: 0, community: 0 },
  level: 1,
  buildings: [],
  selectedBuilding: null,
  selectedCrew: null,
  placement: null,
  expeditionPath: 'science',
  expeditionCooldown: 0,
  ticks: 0,
  started: false,
  paused: false,
  won: false,
  lowResourceWarnings: new Set(),
  nextBuildingId: 1,
};

let scene;
let camera;
let renderer;
let controls;
let ground;
let placementMarker;
let raycaster;
let pointer;
let clock;
let rover;
let astronauts = [];
let tickTimer;
let toastTimer;
let hoveredPosition = null;

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function initScene() {
  if (typeof THREE === 'undefined' || !THREE.OrbitControls) {
    openModal(
      'Não conseguimos abrir a janela da Lua.',
      'O motor 3D não carregou. Confira sua conexão e atualize a página para tentar de novo.',
      'Tentar novamente',
      () => window.location.reload(),
    );
    return false;
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x151820);
  scene.fog = new THREE.FogExp2(0x151820, 0.0023);

  camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 800);
  camera.position.set(70, 67, 81);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  $('#game-container').prepend(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.minDistance = 48;
  controls.maxDistance = 145;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.minPolarAngle = Math.PI * 0.2;
  controls.enablePan = false;

  scene.add(new THREE.HemisphereLight(0xc5d4e8, 0x35312c, 2.05));
  const sun = new THREE.DirectionalLight(0xffe3b0, 3.3);
  sun.position.set(-45, 82, 38);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -85;
  sun.shadow.camera.right = 85;
  sun.shadow.camera.top = 85;
  sun.shadow.camera.bottom = -85;
  sun.shadow.bias = -0.00025;
  scene.add(sun);

  buildMoonSurface();
  buildSky();
  buildHorizonLandmarks();
  buildInitialColony();
  buildAstronauts();
  buildRover();

  ground = scene.getObjectByName('moon-ground');
  placementMarker = new THREE.Mesh(
    new THREE.RingGeometry(4.1, 4.35, 48),
    new THREE.MeshBasicMaterial({ color: 0xd8f279, transparent: true, opacity: 0.88, side: THREE.DoubleSide }),
  );
  placementMarker.rotation.x = -Math.PI / 2;
  placementMarker.position.y = 0.16;
  placementMarker.visible = false;
  scene.add(placementMarker);

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  clock = new THREE.Clock();

  renderer.domElement.addEventListener('pointermove', onWorldPointerMove);
  renderer.domElement.addEventListener('pointerleave', () => { placementMarker.visible = false; });
  renderer.domElement.addEventListener('click', onWorldClick);
  window.addEventListener('resize', onResize);
  animate();
  return true;
}

function standardMaterial(color, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.82, ...extra });
}

function createMesh(geometry, color, x, y, z, extra = {}) {
  const object = new THREE.Mesh(geometry, standardMaterial(color, extra));
  object.position.set(x, y, z);
  object.castShadow = true;
  object.receiveShadow = true;
  return object;
}

function buildMoonSurface() {
  const surface = new THREE.Mesh(
    new THREE.CircleGeometry(110, 128),
    standardMaterial(0x77777a, { roughness: 1 }),
  );
  surface.name = 'moon-ground';
  surface.rotation.x = -Math.PI / 2;
  surface.position.y = -0.26;
  surface.receiveShadow = true;
  scene.add(surface);

  const dust = new THREE.Mesh(
    new THREE.CircleGeometry(38, 96),
    new THREE.MeshBasicMaterial({ color: 0x99918a, transparent: true, opacity: 0.15 }),
  );
  dust.rotation.x = -Math.PI / 2;
  dust.position.y = -0.23;
  scene.add(dust);

  for (let i = 0; i < 42; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 28 + Math.random() * 66;
    const radius = 1.4 + Math.random() * 4.6;
    const crater = new THREE.Mesh(
      new THREE.RingGeometry(radius * 0.66, radius, 28),
      new THREE.MeshBasicMaterial({ color: i % 3 ? 0x57585b : 0xaaa29a, side: THREE.DoubleSide, transparent: true, opacity: 0.42 }),
    );
    crater.position.set(Math.cos(angle) * distance, -0.21, Math.sin(angle) * distance);
    crater.rotation.x = -Math.PI / 2;
    scene.add(crater);

    if (i % 2 === 0) {
      const rock = createMesh(new THREE.DodecahedronGeometry(0.6 + Math.random() * 1.3, 0), 0x55565a, crater.position.x + 4, 0.3, crater.position.z - 3);
      rock.scale.set(1.3, 0.65, 1);
      scene.add(rock);
    }
  }

  const grid = new THREE.GridHelper(110, 44, 0xa6a18f, 0x87847c);
  grid.position.y = -0.23;
  grid.material.transparent = true;
  grid.material.opacity = 0.075;
  scene.add(grid);
}

function buildSky() {
  const positions = [];
  for (let i = 0; i < 1200; i++) {
    const vector = new THREE.Vector3().randomDirection().multiplyScalar(260 + Math.random() * 150);
    if (vector.y < 0) vector.y *= -1;
    positions.push(vector.x, vector.y + 35, vector.z);
  }
  const stars = new THREE.BufferGeometry();
  stars.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: 0xe7ebf0, size: 1.25, sizeAttenuation: false })));

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(7.4, 36, 28),
    new THREE.MeshStandardMaterial({ color: 0x2f789b, emissive: 0x102b50, roughness: 0.58 }),
  );
  earth.position.set(-72, 58, -105);
  scene.add(earth);
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(8.2, 32, 24),
    new THREE.MeshBasicMaterial({ color: 0x63a6d6, transparent: true, opacity: 0.12 }),
  );
  earth.add(glow);
}

function buildHorizonLandmarks() {
  const beacon = new THREE.Group();
  const rock = createMesh(new THREE.DodecahedronGeometry(3.8, 1), 0x62616a, 0, 1.5, 0);
  rock.scale.set(1.5, 0.42, 1.15);
  beacon.add(rock);
  const pole = createMesh(new THREE.CylinderGeometry(0.12, 0.18, 8, 8), 0x969084, 0, 5, 0);
  beacon.add(pole);
  const light = createMesh(new THREE.SphereGeometry(0.55, 12, 10), 0xd8f279, 0, 9.1, 0, { emissive: 0x647522, emissiveIntensity: 1.7 });
  beacon.add(light);
  beacon.position.set(-29, 0, -22);
  scene.add(beacon);

  for (let i = 0; i < 16; i++) {
    const rock = createMesh(new THREE.DodecahedronGeometry(1 + Math.random() * 2.3, 0), 0x65656a, -33 + Math.random() * 68, 0.2, -32 - Math.random() * 15);
    rock.scale.y = 0.52;
    scene.add(rock);
  }
}

function buildingModel(type) {
  const group = new THREE.Group();
  const white = 0xd8d4c7;
  const dark = 0x4a5156;
  const metal = 0x9d9b92;
  const teal = 0x5e9b9b;
  const glass = 0x78a9ad;

  switch (type) {
    case 'base': {
      group.add(createMesh(new THREE.CylinderGeometry(4.8, 5.3, 1.3, 12), dark, 0, 0.65, 0));
      group.add(createMesh(new THREE.CylinderGeometry(3.7, 4, 2.8, 12), white, 0, 2.65, 0));
      group.add(createMesh(new THREE.SphereGeometry(3.4, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2), glass, 0, 4, 0, { transparent: true, opacity: 0.78, metalness: 0.22 }));
      group.add(createMesh(new THREE.CylinderGeometry(0.11, 0.11, 5.2, 8), metal, 0, 6.8, -2.4));
      group.add(createMesh(new THREE.SphereGeometry(0.42, 12, 10), 0xd8f279, 0, 9.5, -2.4, { emissive: 0x657422, emissiveIntensity: 1.5 }));
      for (let i = 0; i < 4; i++) {
        const angle = i * Math.PI / 2;
        const window = createMesh(new THREE.BoxGeometry(1.4, 0.55, 0.12), 0x7fbfc2, Math.cos(angle) * 3.78, 2.5, Math.sin(angle) * 3.78, { emissive: 0x27464b, emissiveIntensity: 0.4 });
        window.rotation.y = -angle;
        group.add(window);
      }
      break;
    }
    case 'solar':
      group.add(createMesh(new THREE.CylinderGeometry(0.22, 0.3, 2.7, 8), metal, 0, 1.35, 0));
      for (const x of [-1.9, 1.9]) {
        const panel = createMesh(new THREE.BoxGeometry(3.5, 0.13, 3.1), 0x274965, x, 2.7, 0, { metalness: 0.62, roughness: 0.36 });
        panel.rotation.x = -0.12;
        panel.rotation.z = x < 0 ? 0.15 : -0.15;
        group.add(panel);
        for (let row = -1; row <= 1; row++) {
          const line = createMesh(new THREE.BoxGeometry(3.25, 0.04, 0.035), 0x91b5c1, x, 2.79, row * 0.82);
          line.rotation.z = panel.rotation.z;
          group.add(line);
        }
      }
      break;
    case 'mine':
      group.add(createMesh(new THREE.CylinderGeometry(1.9, 2.3, 1.1, 10), dark, 0, 0.55, 0));
      group.add(createMesh(new THREE.CylinderGeometry(0.22, 0.42, 2.5, 8), 0xb49167, 0, 0.3, 0));
      for (const side of [-1, 1]) {
        const arm = createMesh(new THREE.BoxGeometry(0.18, 1.9, 0.18), metal, side * 1.7, 1.1, 0);
        arm.rotation.z = side * 0.45;
        group.add(arm);
      }
      const drill = createMesh(new THREE.ConeGeometry(0.5, 1.5, 8), 0xb7a98d, 0, 0.15, 0);
      drill.rotation.x = Math.PI;
      group.add(drill);
      group.userData.spinPart = drill;
      break;
    case 'water':
      group.add(createMesh(new THREE.CylinderGeometry(2.3, 2.5, 0.8, 12), dark, 0, 0.4, 0));
      group.add(createMesh(new THREE.CylinderGeometry(0.32, 0.38, 3.1, 12), 0x82b8ca, 0, 2, 0));
      for (const x of [-1.3, 1.3]) {
        group.add(createMesh(new THREE.CylinderGeometry(0.5, 0.55, 2.1, 12), 0x91aeb0, x, 1.35, 0));
        group.add(createMesh(new THREE.SphereGeometry(0.5, 12, 8), 0x9dc9ce, x, 2.4, 0));
      }
      break;
    case 'oxygen':
      group.add(createMesh(new THREE.BoxGeometry(3.5, 0.4, 2.6), dark, 0, 0.2, 0));
      for (const x of [-0.9, 0.9]) {
        group.add(createMesh(new THREE.CylinderGeometry(0.62, 0.7, 2.7, 12), white, x, 1.7, 0));
        group.add(createMesh(new THREE.SphereGeometry(0.62, 12, 8), 0xc5ddd8, x, 3.05, 0));
        group.add(createMesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 8), teal, x, 3.6, 0));
      }
      break;
    case 'greenhouse':
      group.add(createMesh(new THREE.CylinderGeometry(2.65, 2.9, 0.45, 16), dark, 0, 0.25, 0));
      group.add(createMesh(new THREE.SphereGeometry(2.7, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), 0x8eb5a0, 0, 0.35, 0, { transparent: true, opacity: 0.67, roughness: 0.28 }));
      for (const x of [-1.1, 0, 1.1]) {
        const sprout = createMesh(new THREE.CylinderGeometry(0.12, 0.18, 1.5, 7), 0x809459, x, 1, 0.5);
        group.add(sprout);
        group.add(createMesh(new THREE.SphereGeometry(0.48, 10, 8), 0x9eb474, x - 0.22, 1.9, 0.5));
      }
      break;
    case 'habitat':
      group.add(createMesh(new THREE.CylinderGeometry(2.8, 3.2, 0.7, 12), dark, 0, 0.35, 0));
      group.add(createMesh(new THREE.CylinderGeometry(2.45, 2.7, 2.6, 12), white, 0, 1.95, 0));
      group.add(createMesh(new THREE.SphereGeometry(2.45, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), glass, 0, 3.2, 0, { transparent: true, opacity: 0.75 }));
      group.add(createMesh(new THREE.BoxGeometry(1.25, 0.75, 0.13), teal, 0, 1.7, 2.43, { emissive: 0x142d31 }));
      break;
    case 'lab':
      group.add(createMesh(new THREE.CylinderGeometry(2.7, 3, 0.65, 10), dark, 0, 0.32, 0));
      group.add(createMesh(new THREE.CylinderGeometry(2.1, 2.4, 2.7, 10), white, 0, 2, 0));
      group.add(createMesh(new THREE.SphereGeometry(1.65, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2), 0x8aa9aa, 0, 3.35, 0, { transparent: true, opacity: 0.8 }));
      group.add(createMesh(new THREE.BoxGeometry(1.3, 0.75, 0.12), 0xba99dc, 0, 1.9, 2.08, { emissive: 0x332649, emissiveIntensity: 0.7 }));
      break;
    case 'comms': {
      group.add(createMesh(new THREE.CylinderGeometry(1.8, 2.2, 0.7, 10), dark, 0, 0.35, 0));
      const mast = createMesh(new THREE.CylinderGeometry(0.13, 0.2, 5, 8), metal, 0, 2.7, 0);
      group.add(mast);
      const dish = createMesh(new THREE.SphereGeometry(2.0, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), white, 0, 4.4, 0);
      dish.rotation.x = -0.7;
      group.add(dish);
      group.add(createMesh(new THREE.SphereGeometry(0.2, 8, 6), 0xd8f279, 0, 5.3, 0, { emissive: 0x647522, emissiveIntensity: 1 }));
      break;
    }
    case 'shield':
      group.add(createMesh(new THREE.CylinderGeometry(2.8, 3.2, 0.8, 10), dark, 0, 0.4, 0));
      group.add(createMesh(new THREE.CylinderGeometry(2.35, 2.55, 2.4, 10), 0xb1ad9e, 0, 2, 0));
      group.add(createMesh(new THREE.BoxGeometry(1.3, 1.1, 0.13), 0x789995, 0, 1.8, 2.45, { emissive: 0x19302c }));
      for (const x of [-2.5, 2.5]) group.add(createMesh(new THREE.BoxGeometry(0.2, 2.2, 0.2), 0xabb09d, x, 1.2, 0));
      break;
    case 'elevator':
      group.add(createMesh(new THREE.CylinderGeometry(3.1, 3.7, 1.2, 10), dark, 0, 0.6, 0));
      group.add(createMesh(new THREE.CylinderGeometry(0.55, 0.75, 25, 10), 0xd4d5c5, 0, 13.4, 0, { metalness: 0.25 }));
      group.add(createMesh(new THREE.CylinderGeometry(0.15, 0.15, 24, 8), 0xd8f279, 0, 14.5, 0, { emissive: 0x6a7925, emissiveIntensity: 1.1 }));
      group.add(createMesh(new THREE.SphereGeometry(1.6, 16, 12), 0xc1b989, 0, 27, 0, { emissive: 0x514529, emissiveIntensity: 0.8 }));
      break;
  }

  group.traverse(object => {
    if (object.isMesh) object.userData.building = null;
  });
  return group;
}

function addBuilding(type, x, z, free = false) {
  const definition = BUILDINGS[type];
  if (!definition || (!free && state.level < definition.level)) return null;
  const building = {
    id: state.nextBuildingId++,
    type,
    x,
    z,
    level: 1,
    damaged: false,
    crew: null,
    group: buildingModel(type),
  };
  building.group.position.set(x, 0, z);
  building.group.userData.building = building;
  building.group.traverse(object => { object.userData.building = building; });
  scene.add(building.group);
  state.buildings.push(building);
  return building;
}

function buildInitialColony() {
  addBuilding('base', 0, 0, true);
  addBuilding('solar', -10, -6, true);
  addBuilding('mine', 10, -7, true);
  addBuilding('water', -10, 9, true);
  addBuilding('oxygen', 10, 9, true);
  addBuilding('greenhouse', 0, 14, true);
}

function buildAstronauts() {
  const colors = [0xd4d5cf, 0xe1c89b, 0xb7c9ca];
  astronauts = CREW.map((person, index) => {
    const astronaut = new THREE.Group();
    astronaut.add(createMesh(new THREE.CylinderGeometry(0.28, 0.35, 1.05, 9), colors[index], 0, 0.85, 0));
    astronaut.add(createMesh(new THREE.SphereGeometry(0.31, 12, 9), colors[index], 0, 1.57, 0));
    astronaut.add(createMesh(new THREE.SphereGeometry(0.21, 10, 7), 0x344b54, 0, 1.58, 0.17, { metalness: 0.35, roughness: 0.28 }));
    astronaut.add(createMesh(new THREE.BoxGeometry(0.4, 0.5, 0.26), [0x819354, 0x897a5a, 0x718c8c][index], 0, 0.95, -0.32));
    astronaut.position.set(-4 + index * 3.7, 0, -3.2);
    astronaut.userData.crewId = person.id;
    scene.add(astronaut);
    return astronaut;
  });
}

function buildRover() {
  rover = new THREE.Group();
  rover.add(createMesh(new THREE.BoxGeometry(2.4, 0.75, 1.7), 0xc2b89f, 0, 1.05, 0));
  rover.add(createMesh(new THREE.BoxGeometry(1.05, 0.67, 1.2), 0x697d7d, 0.15, 1.72, 0, { roughness: 0.35 }));
  for (const [x, z] of [[-0.85, -0.91], [0.85, -0.91], [-0.85, 0.91], [0.85, 0.91]]) {
    const wheel = createMesh(new THREE.CylinderGeometry(0.42, 0.42, 0.28, 10), 0x393b3b, x, 0.5, z);
    wheel.rotation.x = Math.PI / 2;
    rover.add(wheel);
  }
  rover.position.set(17, 0, -17);
  rover.userData.origin = new THREE.Vector3(17, 0, -17);
  rover.userData.phase = 0;
  scene.add(rover);
}

function onResize() {
  if (!camera || !renderer) return;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
}

function getGroundPosition(event) {
  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.set(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
  );
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObject(ground, false)[0];
  if (!hit) return null;
  return new THREE.Vector3(Math.round(hit.point.x / 3.5) * 3.5, 0, Math.round(hit.point.z / 3.5) * 3.5);
}

function onWorldPointerMove(event) {
  if (!state.placement || !renderer || !placementMarker) return;
  hoveredPosition = getGroundPosition(event);
  if (!hoveredPosition) {
    placementMarker.visible = false;
    return;
  }
  placementMarker.visible = true;
  placementMarker.position.set(hoveredPosition.x, 0.12, hoveredPosition.z);
  const allowed = isPlacementValid(state.placement, hoveredPosition.x, hoveredPosition.z);
  placementMarker.material.color.setHex(allowed ? 0xd8f279 : 0xff7768);
}

function onWorldClick(event) {
  if (!state.started || state.paused || state.won || !renderer) return;
  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.set(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
  );
  raycaster.setFromCamera(pointer, camera);

  const clickable = state.buildings.map(building => building.group);
  const buildingHit = raycaster.intersectObjects(clickable, true).find(hit => hit.object.userData.building);
  if (buildingHit) {
    const building = buildingHit.object.userData.building;
    if (state.selectedCrew) {
      assignCrew(state.selectedCrew, building);
      return;
    }
    if (state.placement) {
      cancelPlacement();
    }
    selectBuilding(building);
    return;
  }

  const position = getGroundPosition(event);
  if (!position) return;
  if (state.selectedCrew) {
    showToast('Clique em um módulo para designar a pessoa selecionada.');
    return;
  }
  if (state.placement) {
    placeSelectedBuilding(position.x, position.z);
    return;
  }
  selectBuilding(null);
}

function isPlacementValid(type, x, z) {
  if (Math.hypot(x, z) > 47) return false;
  if (state.buildings.some(building => Math.hypot(building.x - x, building.z - z) < 8.2)) return false;
  return canAfford(BUILDINGS[type].cost);
}

function placeSelectedBuilding(x, z) {
  const type = state.placement;
  const definition = BUILDINGS[type];
  if (!definition || !isPlacementValid(type, x, z)) {
    showToast('Área ocupada ou recursos insuficientes. Escolha outro lugar.');
    return;
  }
  if (!canAfford(definition.cost)) {
    showToast('Ainda faltam recursos para construir esse módulo.');
    return;
  }
  spend(definition.cost);
  const building = addBuilding(type, x, z);
  if (!building) {
    giveResources(definition.cost);
    return;
  }
  addLog(`${definition.icon} <strong>${definition.name}</strong> construído.`);
  if (definition.final) {
    finishMission();
    return;
  }
  cancelPlacement();
  selectBuilding(building);
  updateInterface();
}

function chooseBuilding(type) {
  if (!state.started || state.paused || state.won) return;
  const definition = BUILDINGS[type];
  if (!definition || state.level < definition.level) {
    showToast('Esse módulo fica disponível em uma etapa posterior.');
    return;
  }
  if (!canAfford(definition.cost)) {
    showToast('Você ainda não tem recursos suficientes.');
    return;
  }
  state.selectedCrew = null;
  renderCrew();
  state.selectedBuilding = null;
  $('#building-info').classList.add('hidden');
  state.placement = type;
  controls.enableRotate = false;
  placementMarker.visible = false;
  $('#placement-hint').classList.remove('hidden');
  $$('.build-option').forEach(button => button.classList.toggle('selected', button.dataset.type === type));
}

function cancelPlacement() {
  state.placement = null;
  hoveredPosition = null;
  if (controls) controls.enableRotate = true;
  if (placementMarker) placementMarker.visible = false;
  $('#placement-hint').classList.add('hidden');
  $$('.build-option').forEach(button => button.classList.remove('selected'));
}

function selectBuilding(building) {
  state.selectedBuilding = building;
  if (!building) {
    $('#building-info').classList.add('hidden');
    return;
  }
  const definition = BUILDINGS[building.type];
  $('#info-category').textContent = building.damaged ? 'PRECISA DE REPAROS' : definition.category;
  $('#info-title').textContent = `${definition.name}${building.type !== 'base' ? ` · NÍVEL ${building.level}` : ''}`;
  $('#info-description').textContent = definition.description;
  const stats = $('#info-stats');
  stats.replaceChildren();
  if (building.damaged) {
    addStatChip(stats, '⚠ Danificado · não produz');
  } else {
    for (const [resource, amount] of Object.entries(definition.production)) {
      addStatChip(stats, `+${Math.floor(amount * productionMultiplier(building))} ${RESOURCE_LABELS[resource]}`);
    }
    for (const [resource, amount] of Object.entries(definition.consumes)) {
      addStatChip(stats, `−${amount} ${RESOURCE_LABELS[resource]}`);
    }
    if (definition.final) addStatChip(stats, 'Projeto de encerramento');
    if (!stats.children.length) addStatChip(stats, 'Gera progresso de missão');
  }

  const actions = $('#info-actions');
  actions.replaceChildren();
  if (building.damaged) {
    const repair = makeButton('Reparar · 8 minérios', () => repairBuilding(building));
    repair.disabled = state.resources.minerals < 8;
    actions.append(repair);
  }
  if (building.type !== 'base' && building.type !== 'elevator') {
    const cost = 12 * building.level;
    const upgrade = makeButton(`Melhorar · ${cost} minérios`, () => upgradeBuilding(building));
    upgrade.disabled = state.resources.minerals < cost;
    actions.append(upgrade);
    const remove = makeButton('Desmontar', () => dismantleBuilding(building));
    actions.append(remove);
  }
  $('#building-info').classList.remove('hidden');
}

function addStatChip(container, text) {
  const chip = document.createElement('span');
  chip.className = 'stat-chip';
  chip.textContent = text;
  container.append(chip);
}

function makeButton(label, action) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.addEventListener('click', action);
  return button;
}

function assignCrew(crewId, building) {
  if (building.type === 'base' || building.type === 'elevator') {
    showToast('Essa pessoa precisa de um módulo de trabalho.');
    return;
  }
  const person = CREW.find(member => member.id === crewId);
  if (!person) return;
  for (const other of state.buildings) {
    if (other.crew === crewId) other.crew = null;
  }
  building.crew = crewId;
  state.selectedCrew = null;
  $('#crew-list').classList.remove('assigning');
  addLog(`${person.icon} <strong>${person.name}</strong> agora trabalha em ${BUILDINGS[building.type].name}.`);
  showToast(`${person.name} designado: produção do módulo +30%.`);
  renderCrew();
  selectBuilding(building);
}

function productionMultiplier(building) {
  let multiplier = 1 + (building.level - 1) * 0.35;
  const person = CREW.find(member => member.id === building.crew);
  if (person && person.specialty === BUILDINGS[building.type].specialty) multiplier *= 1.3;
  else if (person) multiplier *= 1.15;
  return multiplier;
}

function upgradeBuilding(building) {
  const cost = 12 * building.level;
  if (state.resources.minerals < cost) {
    showToast('Faltam minérios para melhorar este módulo.');
    return;
  }
  state.resources.minerals -= cost;
  building.level++;
  building.group.scale.setScalar(1 + (building.level - 1) * 0.08);
  addLog(`${BUILDINGS[building.type].icon} <strong>${BUILDINGS[building.type].name}</strong> melhorado para nível ${building.level}.`);
  selectBuilding(building);
  updateInterface();
}

function repairBuilding(building) {
  if (!building.damaged || state.resources.minerals < 8) return;
  state.resources.minerals -= 8;
  building.damaged = false;
  building.group.traverse(object => {
    if (!object.isMesh || !object.material?.color) return;
    if (object.userData.originalColor !== undefined) object.material.color.setHex(object.userData.originalColor);
    object.material.transparent = object.userData.originalTransparent || false;
    object.material.opacity = object.userData.originalOpacity ?? 1;
  });
  addLog(`${BUILDINGS[building.type].icon} <strong>${BUILDINGS[building.type].name}</strong> reparado e em operação.`);
  selectBuilding(building);
  updateInterface();
}

function dismantleBuilding(building) {
  if (!building || building.type === 'base') return;
  const refund = Math.floor((BUILDINGS[building.type].cost.minerals || 0) * 0.35);
  state.resources.minerals += refund;
  state.buildings = state.buildings.filter(item => item !== building);
  for (const person of CREW) {
    if (building.crew === person.id) building.crew = null;
  }
  scene.remove(building.group);
  selectBuilding(null);
  addLog(`${BUILDINGS[building.type].icon} <strong>${BUILDINGS[building.type].name}</strong> desmontado · +${refund} minérios.`);
  renderCrew();
  updateInterface();
}

function canAfford(cost) {
  return Object.entries(cost).every(([resource, amount]) => state.resources[resource] >= amount);
}

function spend(cost) {
  for (const [resource, amount] of Object.entries(cost)) state.resources[resource] -= amount;
}

function giveResources(gains) {
  for (const [resource, amount] of Object.entries(gains)) state.resources[resource] += amount;
}

function tick() {
  if (!state.started || state.paused || state.won) return;
  state.ticks++;
  state.expeditionCooldown = Math.max(0, state.expeditionCooldown - 1);

  for (const building of state.buildings) {
    const definition = BUILDINGS[building.type];
    if (building.damaged) continue;
    const multiplier = productionMultiplier(building);
    const hasInputs = Object.entries(definition.consumes).every(([resource, amount]) => state.resources[resource] >= amount);
    if (!hasInputs) continue;
    spend(definition.consumes);
    for (const [resource, amount] of Object.entries(definition.production)) {
      state.resources[resource] += amount * multiplier;
    }
    for (const [route, amount] of Object.entries(definition.route)) {
      state.routes[route] += amount * multiplier;
    }
  }

  consumeCrewNeeds();
  advanceLevel();
  if (state.ticks === 22) triggerMeteorIncident();
  if (state.ticks % 16 === 0) updateMissionDay();
  updateInterface();
}

function consumeCrewNeeds() {
  const needs = { oxygen: 1, water: 1, food: 1.5 };
  for (const [resource, amount] of Object.entries(needs)) {
    state.resources[resource] = Math.max(0, state.resources[resource] - amount);
    if (state.resources[resource] === 0 && !state.lowResourceWarnings.has(resource)) {
      state.lowResourceWarnings.add(resource);
      showToast(`${RESOURCE_LABELS[resource]} está acabando. Construa ou reabasteça a produção.`);
      addLog(`⚠ <strong>${RESOURCE_LABELS[resource]}</strong> acabou. A tripulação precisa de suprimentos.`);
    }
    if (state.resources[resource] > 5) state.lowResourceWarnings.delete(resource);
  }
}

function advanceLevel() {
  const total = Object.values(state.routes).reduce((sum, amount) => sum + amount, 0);
  const unlocked = Math.min(5, LEVELS.reduce((level, milestone, index) => total >= milestone.threshold ? index + 1 : level, 1));
  if (unlocked <= state.level) return;
  state.level = unlocked;
  const level = LEVELS[unlocked - 1];
  $('#objective-title').textContent = level.goal;
  addLog(`✦ <strong>Etapa ${unlocked} liberada:</strong> ${level.name}.`);
  showToast(`Etapa ${unlocked}: ${level.name} — ${unlockHint(unlocked)}`);
  updateBuildOptions();
}

function unlockHint(level) {
  return ({
    2: 'o laboratório agora está disponível.',
    3: 'construa uma antena e abra a colônia para a Terra.',
    4: 'a segurança contra radiação está disponível.',
    5: 'construa o Elevador Orbital para concluir a missão.',
  })[level] || 'novas possibilidades aguardam.';
}

function triggerMeteorIncident() {
  const candidates = state.buildings.filter(building => !['base', 'elevator'].includes(building.type) && !building.damaged);
  if (!candidates.length) return;
  const building = candidates[Math.floor(Math.random() * candidates.length)];
  building.damaged = true;
  building.group.traverse(object => {
    if (!object.isMesh || !object.material?.color) return;
    object.userData.originalColor = object.material.color.getHex();
    object.userData.originalTransparent = object.material.transparent;
    object.userData.originalOpacity = object.material.opacity;
    object.material.color.setHex(0x8f4f43);
    object.material.transparent = true;
    object.material.opacity = 0.78;
  });
  addLog(`☄ <strong>Micrometeorito:</strong> ${BUILDINGS[building.type].name} danificado. Repare-o no painel do módulo.`);
  showToast(`Micrometeorito atingiu ${BUILDINGS[building.type].name}. Clique no módulo para repará-lo.`);
  updateInterface();
}

function startExpedition() {
  if (!state.started || state.paused || state.won) return;
  if (state.expeditionCooldown > 0) {
    showToast(`O rover ainda está fora. Aguarde ${state.expeditionCooldown * 2} segundos.`);
    return;
  }
  if (state.resources.energy < 6 || state.resources.credits < 4) {
    showToast('A expedição precisa de 6 de energia e 4 créditos.');
    return;
  }
  state.resources.energy -= 6;
  state.resources.credits -= 4;
  state.expeditionCooldown = 6;
  const outcomes = {
    science: { score: 8, reward: { science: 5, minerals: 3 }, label: 'amostra antiga e novos dados científicos' },
    industry: { score: 10, reward: { minerals: 9, energy: 3 }, label: 'veios de minerais e sucata reaproveitável' },
    community: { score: 9, reward: { food: 8, credits: 5 }, label: 'sementes e suprimentos deixados por uma missão anterior' },
  };
  const outcome = outcomes[state.expeditionPath];
  state.routes[state.expeditionPath] += outcome.score;
  giveResources(outcome.reward);
  const resourceText = Object.entries(outcome.reward).map(([resource, amount]) => `+${amount} ${RESOURCE_LABELS[resource].toLowerCase()}`).join(', ');
  addLog(`🚙 <strong>Expedição de ${pathLabel(state.expeditionPath).toLowerCase()}:</strong> ${outcome.label} · ${resourceText}.`);
  showToast(`Expedição concluída: +${outcome.score} progresso · ${resourceText}.`);
  advanceLevel();
  updateInterface();
}

function pathLabel(path) {
  return ({ science: 'Pesquisa', industry: 'Indústria', community: 'Comunidade' })[path] || path;
}

function finishMission() {
  state.won = true;
  state.paused = true;
  addLog('✦ <strong>MISSÃO CONCLUÍDA:</strong> o Elevador Orbital está operacional.');
  openModal(
    'A Lua agora é o começo.',
    'A Cidade Horizonte está conectada à órbita. Sua tripulação construiu uma casa longe de casa — pela pesquisa, pela indústria, pela comunidade ou por um pouco de cada.',
    'Jogar novamente',
    () => window.location.reload(),
    `PESQUISA ${Math.floor(state.routes.science)} <span>·</span> INDÚSTRIA ${Math.floor(state.routes.industry)} <span>·</span> COMUNIDADE ${Math.floor(state.routes.community)}`,
  );
}

function buildConstructionOptions() {
  const container = $('#build-options');
  container.replaceChildren();
  for (const [type, definition] of Object.entries(BUILDINGS)) {
    if (type === 'base') continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'build-option';
    button.dataset.type = type;
    button.innerHTML = `<span class="build-icon">${definition.icon}</span><span class="build-copy"><span class="build-name">${definition.name}</span><span class="build-cost">${formatCost(definition.cost)}</span></span>`;
    button.addEventListener('click', () => chooseBuilding(type));
    container.append(button);
  }
  updateBuildOptions();
}

function formatCost(cost) {
  return Object.entries(cost).map(([resource, amount]) => `${amount} ${RESOURCE_ICONS[resource]}`).join(' · ');
}

function updateBuildOptions() {
  $$('.build-option').forEach(button => {
    const definition = BUILDINGS[button.dataset.type];
    const locked = state.level < definition.level;
    const affordable = canAfford(definition.cost);
    button.disabled = locked || !affordable || !state.started || state.paused || state.won;
    const cost = button.querySelector('.build-cost');
    cost.textContent = locked
      ? `NÍVEL ${definition.level}`
      : formatCost(definition.cost);
    button.title = locked ? `Disponível no nível ${definition.level}` : `${definition.name} · ${formatCost(definition.cost)}`;
  });
}

function renderCrew() {
  const list = $('#crew-list');
  list.replaceChildren();
  for (const person of CREW) {
    const assigned = state.buildings.find(building => building.crew === person.id);
    const member = document.createElement('div');
    member.className = 'crew-member';
    const avatar = document.createElement('span');
    avatar.className = 'crew-avatar';
    avatar.textContent = person.icon;
    const copy = document.createElement('span');
    copy.className = 'crew-text';
    const name = document.createElement('span');
    name.className = 'crew-name';
    name.textContent = person.name;
    const role = document.createElement('span');
    role.className = 'crew-role';
    role.textContent = person.role;
    const ability = document.createElement('span');
    ability.className = 'crew-role';
    ability.textContent = person.bonus;
    copy.append(name, role, ability);
    if (assigned) {
      const assignment = document.createElement('span');
      assignment.className = 'crew-assignment';
      assignment.textContent = `↳ ${BUILDINGS[assigned.type].name}`;
      copy.append(assignment);
    }
    const select = document.createElement('button');
    select.type = 'button';
    select.className = `crew-select${state.selectedCrew === person.id ? ' active' : ''}`;
    select.textContent = state.selectedCrew === person.id ? 'Escolhida' : 'Designar';
    select.disabled = !state.started || state.paused || state.won;
    select.addEventListener('click', () => {
      cancelPlacement();
      state.selectedCrew = state.selectedCrew === person.id ? null : person.id;
      $('#crew-list').classList.toggle('assigning', Boolean(state.selectedCrew));
      renderCrew();
      if (state.selectedCrew) showToast(`Agora clique em um módulo para designar ${person.name}.`);
    });
    member.append(avatar, copy, select);
    list.append(member);
  }
}

function updateInterface() {
  updateResources();
  updateProgress();
  updateBuildOptions();
  updateExpeditionButton();
  $('#building-count').textContent = `${state.buildings.length.toString().padStart(2, '0')} MÓDULOS`;
  renderCrew();
  if (state.selectedBuilding) selectBuilding(state.selectedBuilding);
}

function updateResources() {
  for (const resource of RESOURCES) {
    const value = $('#resource-' + resource);
    if (!value) continue;
    value.textContent = Math.floor(state.resources[resource]);
    const box = value.closest('.resource');
    box.classList.toggle('low', ['energy', 'oxygen', 'water', 'food'].includes(resource) && state.resources[resource] < 8);
  }
}

function updateProgress() {
  const total = Object.values(state.routes).reduce((sum, amount) => sum + amount, 0);
  const current = LEVELS[state.level - 1];
  const next = LEVELS[state.level] || null;
  const start = current.threshold;
  const end = next ? next.threshold : current.threshold + 70;
  const progress = Math.min(100, Math.max(0, ((total - start) / (end - start)) * 100));
  $('#level-name').innerHTML = `NÍVEL ${state.level} <i>·</i> ${current.name.toUpperCase()}`;
  $('#level-count').textContent = `${state.level} / 5`;
  $('#level-progress').style.width = `${progress}%`;
  $('#next-level').textContent = next
    ? `Próximo: ${next.name} · ${Math.max(0, Math.ceil(next.threshold - total))} pontos`
    : 'Próximo: construir o Elevador Orbital';
  $('#objective-title').textContent = current.goal;
  $('#objective-copy').textContent = state.level < 5
    ? levelDescription(state.level)
    : 'Tudo pronto. Construa o Elevador Orbital e conecte a colônia às estrelas.';
  for (const route of ['science', 'industry', 'community']) {
    const value = state.routes[route];
    $('#path-' + route).style.width = `${Math.min(100, value / 130 * 100)}%`;
    $('#path-' + route + '-value').textContent = Math.floor(value);
  }
  $('#route-note').textContent = state.level < 5
    ? `Faltam ${Math.max(0, Math.ceil(next.threshold - total))} pontos para ${next.name}. Use módulos ou envie o rover.`
    : 'A última etapa começou. Prepare o Elevador Orbital.';
}

function levelDescription(level) {
  return ({
    1: 'Construa módulos no terreno. Equilibre água, ar, energia e alimento.',
    2: 'A colônia respira. Pesquise, amplie a produção ou explore com o rover.',
    3: 'Uma comunidade cresce. Abra um canal de comunicação com a Terra.',
    4: 'Proteja a tripulação e prepare os recursos para alcançar a órbita.',
  })[level];
}

function updateExpeditionButton() {
  const button = $('#expedition-button');
  const cooldownLabel = $('#expedition-cooldown');
  const canLaunch = state.resources.energy >= 6 && state.resources.credits >= 4;
  button.disabled = state.expeditionCooldown > 0 || !canLaunch || !state.started || state.paused || state.won;
  cooldownLabel.textContent = state.expeditionCooldown > 0
    ? `${state.expeditionCooldown * 2}s`
    : canLaunch ? '4 ◈ + 6 ϟ' : 'sem recursos';
}

function addLog(message) {
  const log = $('#mission-log');
  const row = document.createElement('div');
  row.className = 'log-entry';
  const time = document.createElement('time');
  time.textContent = `${String(Math.floor(state.ticks / 16) + 1).padStart(2, '0')}:${String(state.ticks % 16 * 2).padStart(2, '0')}`;
  const text = document.createElement('span');
  text.innerHTML = message;
  row.append(time, text);
  log.prepend(row);
  while (log.children.length > 5) log.lastElementChild.remove();
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 3400);
}

function updateMissionDay() {
  const day = Math.floor(state.ticks / 16) + 1;
  $('#mission-day').textContent = `DIA ${day.toString().padStart(2, '0')}`;
}

function openModal(title, copy, buttonText, action, extra = '') {
  $('#modal-title').textContent = title;
  $('#modal-copy').textContent = copy;
  $('#modal-extra').innerHTML = extra;
  const button = $('#modal-button');
  button.replaceChildren(document.createTextNode(buttonText));
  const arrow = document.createElement('span');
  arrow.textContent = '→';
  button.append(arrow);
  button.onclick = action;
  $('#modal').classList.remove('hidden');
}

function startMission() {
  if (state.won) {
    window.location.reload();
    return;
  }
  state.started = true;
  state.paused = false;
  $('#modal').classList.add('hidden');
  tickTimer = window.setInterval(tick, 2000);
  addLog('◉ <strong>Comms:</strong> conexão com a Terra estabelecida. A missão começou.');
  addLog('✦ <strong>Bem-vindos ao polo sul lunar.</strong> A equipe está em segurança.');
  updateInterface();
}

function togglePause() {
  if (!state.started || state.won) return;
  setPaused(!state.paused);
}

function setPaused(paused) {
  state.paused = paused;
  $('#pause-button').textContent = state.paused ? '▶' : 'Ⅱ';
  $('#pause-button').setAttribute('aria-label', state.paused ? 'Continuar jogo' : 'Pausar jogo');
  $('#pause-button').title = state.paused ? 'Continuar' : 'Pausar';
  showToast(state.paused ? 'Missão pausada.' : 'Missão retomada.');
  updateBuildOptions();
  renderCrew();
  updateExpeditionButton();
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.06);
  if (controls) controls.update();
  if (rover && state.started && !state.paused) {
    rover.userData.phase += delta * 0.16;
    rover.position.x = 17 + Math.sin(rover.userData.phase) * 6;
    rover.position.z = -17 + Math.cos(rover.userData.phase) * 4;
    rover.rotation.y = Math.atan2(Math.cos(rover.userData.phase) * 4, Math.cos(rover.userData.phase) * 6);
  }
  for (let index = 0; index < astronauts.length; index++) {
    const astronaut = astronauts[index];
    const assigned = state.buildings.find(building => building.crew === astronaut.userData.crewId);
    const targetX = assigned ? assigned.x + 4 : -4 + index * 3.7;
    const targetZ = assigned ? assigned.z + 4 : -3.2;
    astronaut.position.x += (targetX - astronaut.position.x) * Math.min(1, delta * 0.15);
    astronaut.position.z += (targetZ - astronaut.position.z) * Math.min(1, delta * 0.15);
    astronaut.position.y = Math.sin(performance.now() * 0.0015 + index * 2) * 0.045;
  }
  for (const building of state.buildings) {
    if (building.group.userData.spinPart && !building.damaged && !state.paused) {
      building.group.userData.spinPart.rotation.y += delta * 1.1;
    }
  }
  renderer.render(scene, camera);
}

function showInstructions() {
  const wasPaused = state.paused;
  if (state.started && !wasPaused) setPaused(true);
  openModal(
    'Uma missão feita de escolhas.',
    'MÓDULOS: escolha uma construção abaixo e clique numa área livre do terreno. Clique num módulo construído para ver detalhes, melhorar, desmontar ou reparar.',
    'Voltar à missão',
    () => {
      $('#modal').classList.add('hidden');
      if (state.started && !wasPaused && !state.won) setPaused(false);
    },
    'TRIPULAÇÃO: selecione uma pessoa e clique num módulo para aumentar sua produção.<br><br>ROVER: escolha Pesquisa, Indústria ou Comunidade e envie uma expedição. Todas as rotas podem levar ao nível 5.',
  );
}

function setupControls() {
  $('#pause-button').addEventListener('click', togglePause);
  $('#help-button').addEventListener('click', showInstructions);
  $('#restart-button').addEventListener('click', () => {
    if (window.confirm('Começar uma nova missão? O progresso atual será perdido.')) window.location.reload();
  });
  $('#close-info').addEventListener('click', () => selectBuilding(null));
  $('#expedition-button').addEventListener('click', startExpedition);
  $$('.expedition-path').forEach(button => {
    button.addEventListener('click', () => {
      state.expeditionPath = button.dataset.path;
      $$('.expedition-path').forEach(option => option.classList.toggle('selected', option === button));
    });
  });

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (!$('#modal').classList.contains('hidden')) return;
      cancelPlacement();
      state.selectedCrew = null;
      $('#crew-list').classList.remove('assigning');
      renderCrew();
      return;
    }
    if (!state.started || state.paused || !$('#modal').classList.contains('hidden')) return;
    if (/^[0-9]$/.test(event.key)) {
      const index = event.key === '0' ? 9 : Number(event.key) - 1;
      const option = $$('.build-option')[index];
      if (option && !option.disabled) chooseBuilding(option.dataset.type);
    }
  });
}

buildConstructionOptions();
renderCrew();
setupControls();
updateInterface();
addLog('⌖ <strong>Coordenadas confirmadas.</strong> Pouso no polo sul.');

if (initScene()) {
  openModal(
    'Uma casa entre as estrelas.',
    'A Lua não precisa ser só um destino. Vamos torná-la um lar.',
    'Começar missão',
    startMission,
    'GERENCIE RECURSOS. CUIDE DA TRIPULAÇÃO.<br>ESCOLHA COMO CHEGAR ÀS ESTRELAS.',
  );
}

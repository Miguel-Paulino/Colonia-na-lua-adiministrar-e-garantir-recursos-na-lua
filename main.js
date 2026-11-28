// COLÔNIA LUNAR: SOBREVIVÊNCIA
// Estrutura baseada nas sete etapas do material: narrativas, movimentos,
// troca de caminho, Game Over, vitória, The End e créditos.

const $ = (seletor) => document.querySelector(seletor);

const telas = {
  intro: $("#introScreen"),
  jogo: $("#gameScreen"),
  resultado: $("#resultScreen"),
  creditos: $("#creditsScreen")
};

const elementos = {
  iniciar: $("#startBtn"),
  pergunta: $("#questionText"),
  descricao: $("#storyDescription"),
  escolhas: $("#choices"),
  titulo: $("#chapterTitle"),
  capitulo: $("#chapterLabel"),
  caminho: $("#pathBadge"),
  etapa: $("#stepCounter"),
  comandante: $("#commanderName"),
  log: $("#logText"),
  kicker: $("#storyKicker"),
  resultadoTitulo: $("#resultTitle"),
  resultadoMensagem: $("#resultMessage"),
  simbolo: $("#resultSymbol"),
  eyebrow: $("#resultEyebrow"),
  historico: $("#historyList"),
  recursosFinais: $("#finalResources"),
  creditos: $("#creditsBtn"),
  reiniciar: $("#restartBtn"),
  voltar: $("#homeBtn")
};

const nomes = ["NOVA", "ATLAS", "ÍRIS", "VEGA", "ORION"];
const nomeComandante = nomes[Math.floor(Math.random() * nomes.length)];

const recursosIniciais = {
  energia: 72,
  agua: 64,
  oxigenio: 81,
  alimentos: 58
};

let recursos = { ...recursosIniciais };
let atual = 0;
let historico = [];
let faseDaPartida = "inicio";
let dia = 1;

const perguntas = [
  {
    caminho: "INÍCIO",
    titulo: "Chegada à LUNARIS",
    kicker: "TRANSMISSÃO DA CENTRAL",
    enunciado: "Você acaba de chegar à colônia LUNARIS.",
    descricao: "Os sistemas de sobrevivência apresentam problemas. Qual será sua primeira atitude?",
    alternativas: [
      {
        texto: "Assumir o controle da infraestrutura e investigar energia e oxigênio.",
        afirmacao: "Você assumiu a infraestrutura e iniciou a investigação dos sistemas vitais.",
        tipo: "entrada",
        proxima: 1,
        efeito: { energia: 5, oxigenio: 3 }
      },
      {
        texto: "Organizar os recursos disponíveis e investigar a escassez.",
        afirmacao: "Você organizou os estoques e iniciou a análise da escassez de recursos.",
        tipo: "entrada",
        proxima: 2,
        efeito: { agua: 5, alimentos: 4 }
      }
    ]
  },
  {
    caminho: "CAMINHO A · ENGENHARIA",
    titulo: "O sistema de energia",
    kicker: "SETOR DE ENGENHARIA",
    enunciado: "Os painéis solares foram parcialmente danificados.",
    descricao: "A energia armazenada está diminuindo. Sem eletricidade, os sistemas de suporte à vida podem parar. Como agir?",
    alternativas: [
      {
        texto: "Priorizar o conserto dos painéis solares.",
        afirmacao: "Você priorizou o conserto dos painéis solares e recuperou parte da capacidade energética.",
        tipo: "avancar",
        proxima: 3,
        efeito: { energia: 12 }
      },
      {
        texto: "Utilizar equipamentos reservas para estabilizar a energia.",
        afirmacao: "Você ativou equipamentos reservas e estabilizou temporariamente a energia.",
        tipo: "salto",
        proxima: 4,
        efeito: { energia: -5, oxigenio: 3 }
      },
      {
        texto: "Investigar um relatório sobre uma falha de oxigênio em outro setor.",
        afirmacao: "Você encaminhou a investigação para o setor de recursos e recebeu um alerta sobre os estoques.",
        tipo: "trocar",
        proxima: 2,
        efeito: { oxigenio: 2 }
      }
    ]
  },
  {
    caminho: "CAMINHO B · RECURSOS",
    titulo: "A escassez de água",
    kicker: "SETOR DE ABASTECIMENTO",
    enunciado: "Os sensores identificaram uma queda no reservatório de água.",
    descricao: "A colônia precisa controlar o consumo e encontrar novas fontes de abastecimento. Qual será sua decisão?",
    alternativas: [
      {
        texto: "Racionar a água e revisar os estoques.",
        afirmacao: "Você iniciou o racionamento e organizou uma revisão dos estoques.",
        tipo: "avancar",
        proxima: 7,
        efeito: { agua: 12, alimentos: -2 }
      },
      {
        texto: "Investigar depósitos de gelo próximos à base.",
        afirmacao: "Você enviou uma equipe para investigar possíveis depósitos de gelo.",
        tipo: "salto",
        proxima: 8,
        efeito: { agua: 8, energia: -3 }
      },
      {
        texto: "Consultar a equipe de engenharia sobre os sistemas de energia.",
        afirmacao: "Você consultou a engenharia e recebeu informações sobre a instabilidade dos painéis solares.",
        tipo: "trocar",
        proxima: 1,
        efeito: { energia: 2 }
      }
    ]
  },
  {
    caminho: "CAMINHO A · ENGENHARIA",
    titulo: "Reparos na estrutura",
    kicker: "OFICINA TÉCNICA",
    enunciado: "A equipe encontrou danos no sistema de distribuição de energia.",
    descricao: "Os reparos podem levar algumas horas. É necessário decidir como manter os equipamentos essenciais funcionando.",
    alternativas: [
      {
        texto: "Desligar equipamentos não essenciais e concentrar energia nos sistemas vitais.",
        afirmacao: "Você reorganizou o consumo de energia e priorizou os sistemas vitais.",
        tipo: "avancar",
        proxima: 4,
        efeito: { energia: 8, oxigenio: 4 }
      },
      {
        texto: "Solicitar ajuda da equipe responsável pelos estoques.",
        afirmacao: "Você solicitou apoio ao setor de recursos para manter os reparos.",
        tipo: "trocar",
        proxima: 8,
        efeito: { alimentos: 2 }
      },
      {
        texto: "Ignorar os alertas e continuar usando todos os equipamentos.",
        afirmacao: "A equipe ignorou os alertas de consumo e a situação ficou fora de controle.",
        tipo: "gameover",
        final: "energia"
      }
    ]
  },
  {
    caminho: "CAMINHO A · ENGENHARIA",
    titulo: "Alerta no suporte à vida",
    kicker: "CENTRAL DE OXIGÊNIO",
    enunciado: "Um sensor detectou instabilidade no sistema de circulação de oxigênio.",
    descricao: "A equipe precisa verificar os filtros e a ventilação da base. Qual será a prioridade?",
    alternativas: [
      {
        texto: "Inspecionar os filtros e realizar manutenção preventiva.",
        afirmacao: "A equipe realizou a manutenção dos filtros e estabilizou a circulação de oxigênio.",
        tipo: "avancar",
        proxima: 5,
        efeito: { oxigenio: 12, energia: -2 }
      },
      {
        texto: "Pedir uma análise ao setor de recursos e abastecimento.",
        afirmacao: "Você pediu uma análise conjunta dos recursos para apoiar o sistema de suporte à vida.",
        tipo: "trocar",
        proxima: 8,
        efeito: { oxigenio: 3, agua: 2 }
      },
      {
        texto: "Desativar o suporte à vida para economizar energia.",
        afirmacao: "O suporte à vida foi desativado e a colônia perdeu suas condições de sobrevivência.",
        tipo: "gameover",
        final: "oxigenio"
      }
    ]
  },
  {
    caminho: "CAMINHO A · ENGENHARIA",
    titulo: "A tempestade solar",
    kicker: "ALERTA EXTERNO",
    enunciado: "Uma tempestade solar está se aproximando da região da colônia.",
    descricao: "A equipe precisa proteger os equipamentos e garantir que a comunicação continue funcionando.",
    alternativas: [
      {
        texto: "Ativar o protocolo de proteção e preservar os equipamentos essenciais.",
        afirmacao: "A equipe ativou a proteção e manteve os equipamentos essenciais funcionando.",
        tipo: "avancar",
        proxima: 6,
        efeito: { energia: 6, oxigenio: 3 }
      },
      {
        texto: "Consultar o setor de abastecimento para coordenar os estoques.",
        afirmacao: "Você coordenou a proteção da base com o setor de abastecimento.",
        tipo: "trocar",
        proxima: 9,
        efeito: { agua: 2, alimentos: 2 }
      },
      {
        texto: "Ignorar o alerta e manter as operações externas.",
        afirmacao: "A colônia ignorou o alerta e perdeu o controle de equipamentos importantes.",
        tipo: "gameover",
        final: "tempestade"
      }
    ]
  },
  {
    caminho: "CAMINHO A · ENGENHARIA",
    titulo: "Um novo começo",
    kicker: "RELATÓRIO DE ENGENHARIA",
    enunciado: "Os sistemas essenciais foram estabilizados.",
    descricao: "A equipe conseguiu recuperar a infraestrutura da colônia. Agora, é necessário definir o futuro da base.",
    alternativas: [
      {
        texto: "Concluir a missão e estabelecer uma base lunar sustentável.",
        afirmacao: "Você concluiu a missão de engenharia e garantiu uma infraestrutura mais estável.",
        tipo: "vitoria",
        final: "engenharia"
      },
      {
        texto: "Consultar o setor de recursos antes de concluir a missão.",
        afirmacao: "Você decidiu consultar o setor de recursos antes de finalizar a missão.",
        tipo: "trocar",
        proxima: 10,
        efeito: { energia: 2, agua: 2 }
      }
    ]
  },
  {
    caminho: "CAMINHO B · RECURSOS",
    titulo: "Controle dos estoques",
    kicker: "CENTRAL DE ABASTECIMENTO",
    enunciado: "A equipe encontrou diferenças entre os registros e os estoques reais.",
    descricao: "A colônia precisa de informações confiáveis para distribuir água e alimentos. Como você vai agir?",
    alternativas: [
      {
        texto: "Fazer um inventário completo e corrigir os registros.",
        afirmacao: "Você organizou um inventário e corrigiu os registros dos estoques.",
        tipo: "avancar",
        proxima: 8,
        efeito: { agua: 6, alimentos: 8 }
      },
      {
        texto: "Pedir ajuda à engenharia para verificar os sensores.",
        afirmacao: "Você solicitou ajuda da engenharia para verificar os sensores dos reservatórios.",
        tipo: "trocar",
        proxima: 3,
        efeito: { energia: 2, agua: 2 }
      },
      {
        texto: "Esconder a falta de recursos para evitar preocupação.",
        afirmacao: "A falta de transparência prejudicou o planejamento e a distribuição dos recursos.",
        tipo: "gameover",
        final: "estoque"
      }
    ]
  },
  {
    caminho: "CAMINHO B · RECURSOS",
    titulo: "Produção de alimentos",
    kicker: "ESTUFA HIDROPÔNICA",
    enunciado: "A produção de alimentos está abaixo do esperado.",
    descricao: "A estufa precisa de água, energia e manutenção. A equipe apresenta algumas alternativas.",
    alternativas: [
      {
        texto: "Ajustar o consumo de água e energia da estufa.",
        afirmacao: "Você reorganizou o consumo da estufa e melhorou o planejamento da produção.",
        tipo: "avancar",
        proxima: 9,
        efeito: { alimentos: 10, agua: -2, energia: -2 }
      },
      {
        texto: "Pedir suporte técnico à equipe de engenharia.",
        afirmacao: "A engenharia iniciou uma avaliação técnica da estufa.",
        tipo: "trocar",
        proxima: 4,
        efeito: { alimentos: 3, energia: 2 }
      },
      {
        texto: "Descartar os registros de consumo e produção.",
        afirmacao: "A equipe perdeu informações importantes para administrar os alimentos.",
        tipo: "gameover",
        final: "registros"
      }
    ]
  },
  {
    caminho: "CAMINHO B · RECURSOS",
    titulo: "Distribuição de suprimentos",
    kicker: "SETOR DE LOGÍSTICA",
    enunciado: "Os suprimentos precisam ser distribuídos entre os 48 colonos.",
    descricao: "A distribuição deve considerar as necessidades de todos e manter uma reserva para emergências.",
    alternativas: [
      {
        texto: "Criar um plano de distribuição equilibrado.",
        afirmacao: "Você organizou a distribuição de suprimentos de forma equilibrada.",
        tipo: "avancar",
        proxima: 10,
        efeito: { agua: 5, alimentos: 6 }
      },
      {
        texto: "Consultar a engenharia sobre a capacidade dos sistemas.",
        afirmacao: "Você consultou a engenharia para alinhar a distribuição com a capacidade da base.",
        tipo: "trocar",
        proxima: 5,
        efeito: { energia: 2, oxigenio: 2 }
      },
      {
        texto: "Distribuir os suprimentos sem verificar as necessidades.",
        afirmacao: "A distribuição sem planejamento provocou uma crise de abastecimento.",
        tipo: "gameover",
        final: "distribuicao"
      }
    ]
  },
  {
    caminho: "CAMINHO B · RECURSOS",
    titulo: "Planejamento do futuro",
    kicker: "REUNIÃO DE COLONOS",
    enunciado: "A colônia conseguiu organizar seus estoques e melhorar a produção.",
    descricao: "Os colonos querem saber como será o futuro da comunidade lunar. Você precisa tomar uma decisão final.",
    alternativas: [
      {
        texto: "Concluir a missão e estabelecer um plano sustentável de abastecimento.",
        afirmacao: "Você concluiu a missão de recursos e estabeleceu um plano de abastecimento sustentável.",
        tipo: "vitoria",
        final: "recursos"
      },
      {
        texto: "Consultar a engenharia para confirmar a estabilidade da base.",
        afirmacao: "Você decidiu confirmar a estabilidade da infraestrutura antes de encerrar a missão.",
        tipo: "trocar",
        proxima: 6,
        efeito: { agua: 2, alimentos: 2 }
      }
    ]
  }
];

const finais = {
  energia: {
    titulo: "GAME OVER",
    simbolo: "⚠",
    mensagem: "A colônia perdeu o controle do sistema de energia. Os equipamentos essenciais deixaram de funcionar e a missão foi encerrada. Uma nova tentativa exigirá planejamento e manutenção preventiva."
  },
  oxigenio: {
    titulo: "GAME OVER",
    simbolo: "⚠",
    mensagem: "O sistema de suporte à vida foi comprometido. A colônia não conseguiu manter as condições necessárias para a sobrevivência. A missão foi encerrada."
  },
  tempestade: {
    titulo: "GAME OVER",
    simbolo: "⚠",
    mensagem: "A tempestade solar atingiu equipamentos que deveriam estar protegidos. A comunicação e os sistemas da base foram comprometidos. A missão foi encerrada."
  },
  estoque: {
    titulo: "GAME OVER",
    simbolo: "⚠",
    mensagem: "A falta de informações confiáveis impediu a distribuição adequada dos recursos. A colônia entrou em crise de abastecimento. A missão foi encerrada."
  },
  registros: {
    titulo: "GAME OVER",
    simbolo: "⚠",
    mensagem: "Sem os registros de consumo e produção, a equipe não conseguiu planejar o abastecimento. A missão foi encerrada."
  },
  distribuicao: {
    titulo: "GAME OVER",
    simbolo: "⚠",
    mensagem: "A distribuição sem planejamento comprometeu os estoques da colônia. A missão foi encerrada."
  },
  engenharia: {
    titulo: "MISSÃO CONCLUÍDA",
    simbolo: "✦",
    mensagem: "A infraestrutura da LUNARIS foi recuperada. Os sistemas de energia e oxigênio estão mais estáveis, permitindo que a colônia continue funcionando. A engenharia abriu caminho para o futuro da humanidade na Lua."
  },
  recursos: {
    titulo: "MISSÃO CONCLUÍDA",
    simbolo: "✦",
    mensagem: "A colônia conseguiu organizar seus estoques, melhorar a produção e planejar a distribuição de suprimentos. Com uma administração responsável, LUNARIS está preparada para crescer e receber novos habitantes."
  }
};

function mostrarTela(telaAtiva) {
  Object.values(telas).forEach((tela) => {
    tela.hidden = tela !== telaAtiva;
  });
}

function atualizarRecursos() {
  const dados = [
    ["energia", "energyValue", "energyBar"],
    ["agua", "waterValue", "waterBar"],
    ["oxigenio", "oxygenValue", "oxygenBar"],
    ["alimentos", "foodValue", "foodBar"]
  ];

  dados.forEach(([chave, valorId, barraId]) => {
    const valor = Math.max(0, Math.min(100, recursos[chave]));
    recursos[chave] = valor;
    document.getElementById(valorId).textContent = `${valor}%`;
    document.getElementById(barraId).style.width = `${valor}%`;
  });
}

function aplicarEfeito(efeito = {}) {
  Object.entries(efeito).forEach(([recurso, quantidade]) => {
    recursos[recurso] += quantidade;
  });

  atualizarRecursos();
}

function atualizarHistoria() {
  const pergunta = perguntas[atual];

  elementos.titulo.textContent = pergunta.titulo;
  elementos.capitulo.textContent = `DIÁRIO DE BORDO · DIA ${String(dia).padStart(2, "0")}`;
  elementos.caminho.textContent = pergunta.caminho;
  elementos.etapa.textContent = `ETAPA ${String(atual + 1).padStart(2, "0")} / 11`;
  elementos.kicker.textContent = pergunta.kicker;
  elementos.pergunta.textContent = pergunta.enunciado;
  elementos.descricao.textContent = pergunta.descricao;
  elementos.comandante.textContent = nomeComandante;

  elementos.escolhas.innerHTML = "";

  pergunta.alternativas.forEach((alternativa, indice) => {
    const botao = document.createElement("button");
    botao.className = "choice-btn";

    const numero = document.createElement("span");
    numero.className = "choice-number";
    numero.textContent = String(indice + 1).padStart(2, "0");

    const texto = document.createElement("span");
    texto.textContent = alternativa.texto;

    botao.append(numero, texto);
    botao.addEventListener("click", () => escolher(alternativa));

    elementos.escolhas.appendChild(botao);
  });
}

function escolher(alternativa) {
  historico.push(alternativa.afirmacao);
  elementos.log.textContent = alternativa.afirmacao;

  aplicarEfeito(alternativa.efeito);

  if (alternativa.tipo === "gameover") {
    encerrar(alternativa.final, false);
    return;
  }

  if (alternativa.tipo === "vitoria") {
    encerrar(alternativa.final, true);
    return;
  }

  if (alternativa.tipo === "entrada") {
    faseDaPartida = alternativa.proxima === 1 ? "engenharia" : "recursos";
  }

  if (alternativa.tipo === "trocar") {
    dia++;
  }

  if (alternativa.tipo === "salto") {
    dia++;
  }

  atual = alternativa.proxima;
  atualizarHistoria();
}

function encerrar(tipoFinal, venceu) {
  const final = finais[tipoFinal];

  faseDaPartida = venceu ? "vitoria" : "gameover";

  elementos.resultadoTitulo.textContent = final.titulo;
  elementos.resultadoTitulo.className = venceu ? "success" : "failure";
  elementos.resultadoMensagem.textContent = final.mensagem;
  elementos.simbolo.textContent = final.simbolo;
  elementos.eyebrow.textContent = venceu ? "RELATÓRIO DE SUCESSO" : "RELATÓRIO DE FALHA";

  elementos.recursosFinais.innerHTML = `
    <span>⚡ ENERGIA: ${recursos.energia}%</span>
    <span>💧 ÁGUA: ${recursos.agua}%</span>
    <span>◉ OXIGÊNIO: ${recursos.oxigenio}%</span>
    <span>▦ ALIMENTOS: ${recursos.alimentos}%</span>
  `;

  elementos.historico.innerHTML = "";

  historico.forEach((registro) => {
    const item = document.createElement("li");
    item.textContent = registro;
    elementos.historico.appendChild(item);
  });

  elementos.creditos.hidden = !venceu;
  elementos.reiniciar.hidden = venceu;

  mostrarTela(telas.resultado);
}

function iniciarJogo() {
  recursos = { ...recursosIniciais };
  atual = 0;
  historico = [];
  dia = 1;
  faseDaPartida = "jogando";

  elementos.log.textContent = "Comandante, aguardamos suas instruções.";

  atualizarRecursos();
  atualizarHistoria();
  mostrarTela(telas.jogo);
}

function mostrarCreditos() {
  mostrarTela(telas.creditos);
}

function voltarInicio() {
  mostrarTela(telas.intro);
}

elementos.iniciar.addEventListener("click", iniciarJogo);
elementos.creditos.addEventListener("click", mostrarCreditos);
elementos.reiniciar.addEventListener("click", iniciarJogo);
elementos.voltar.addEventListener("click", voltarInicio);

atualizarRecursos();
'use strict';

const $ = (seletor) => document.querySelector(seletor);

const perguntas = [
  {
    categoria: 'Operações básicas',
    pergunta: 'Quanto é 7 + 8?',
    alternativas: ['14', '15', '16', '17'],
    correta: '15'
  },
  {
    categoria: 'Multiplicação',
    pergunta: 'Quanto é 9 × 6?',
    alternativas: ['54', '56', '63', '69'],
    correta: '54'
  },
  {
    categoria: 'Frações',
    pergunta: 'Quanto vale 1/2 + 1/4?',
    alternativas: ['1/6', '1/3', '2/6', '3/4'],
    correta: '3/4'
  },
  {
    categoria: 'Potências',
    pergunta: 'Quanto é 3 elevado ao quadrado?',
    alternativas: ['6', '9', '12', '27'],
    correta: '9'
  },
  {
    categoria: 'Porcentagem',
    pergunta: 'Quanto é 25% de 80?',
    alternativas: ['20', '25', '32', '40'],
    correta: '20'
  },
  {
    categoria: 'Geometria',
    pergunta: 'Qual é a área de um quadrado de lado 5 cm?',
    alternativas: ['10 cm²', '20 cm²', '25 cm²', '25 cm'],
    correta: '25 cm²'
  },
  {
    categoria: 'Divisão',
    pergunta: 'Quanto é 144 ÷ 12?',
    alternativas: ['10', '12', '14', '16'],
    correta: '12'
  },
  {
    categoria: 'Expressões',
    pergunta: 'Qual é o valor de 2 + 3 × 4?',
    alternativas: ['14', '20', '24', '32'],
    correta: '14'
  },
  {
    categoria: 'Números negativos',
    pergunta: 'Quanto é -8 + 15?',
    alternativas: ['-23', '-7', '7', '23'],
    correta: '7'
  },
  {
    categoria: 'Geometria',
    pergunta: 'Quanto mede a soma dos ângulos internos de um triângulo?',
    alternativas: ['90°', '180°', '270°', '360°'],
    correta: '180°'
  },
  {
    categoria: 'Equações',
    pergunta: 'Se 3x = 21, qual é o valor de x?',
    alternativas: ['6', '7', '8', '9'],
    correta: '7'
  },
  {
    categoria: 'Raiz quadrada',
    pergunta: 'Qual é a raiz quadrada de 81?',
    alternativas: ['8', '9', '10', '18'],
    correta: '9'
  }
];

let indice = 0;
let travado = false;

function embaralhar(lista) {
  const novaLista = [...lista];
  for (let i = novaLista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [novaLista[i], novaLista[j]] = [novaLista[j], novaLista[i]];
  }
  return novaLista;
}

function atualizarProgresso() {
  if (indice >= perguntas.length) {
    $('#progressoTopo').textContent = 'Missão concluída';
  } else {
    $('#progressoTopo').textContent = `Pergunta ${indice + 1} de ${perguntas.length}`;
  }
}

function telaInicial() {
  indice = 0;
  travado = false;
  atualizarProgresso();
  $('#palco').innerHTML = `
    <article class="cartao">
      <span class="etiqueta">Simulação lunar</span>
      <h1>Missão Selene</h1>
      <p>Você precisa concluir o protocolo matemático da colônia. Responda todas as perguntas corretamente.</p>
      <p>Uma resposta errada encerra a missão imediatamente.</p>
      <div class="acoes">
        <button class="acao" id="iniciar">Iniciar quiz</button>
      </div>
    </article>
  `;
  $('#iniciar').addEventListener('click', mostrarPergunta);
}

function mostrarPergunta() {
  travado = false;
  atualizarProgresso();

  const atual = perguntas[indice];
  const alternativas = embaralhar(atual.alternativas);
  const porcentagem = (indice / perguntas.length) * 100;

  $('#palco').innerHTML = `
    <article class="cartao">
      <span class="etiqueta">${atual.categoria}</span>
      <div class="barra" aria-hidden="true"><span style="width:${porcentagem}%"></span></div>
      <h2 class="pergunta">${atual.pergunta}</h2>
      <div class="alternativas">
        ${alternativas.map((alternativa) =>
          `<button class="alternativa" type="button" data-resposta="${alternativa}">${alternativa}</button>`
        ).join('')}
      </div>
      <div class="status" id="status" aria-live="assertive"></div>
    </article>
  `;

  document.querySelectorAll('[data-resposta]').forEach((botao) => {
    botao.addEventListener('click', () => responder(botao, atual));
  });
}

function responder(botao, atual) {
  if (travado) return;

  if (botao.dataset.resposta === atual.correta) {
    travado = true;
    botao.classList.add('certa');
    document.querySelectorAll('[data-resposta]').forEach((item) => item.disabled = true);
    $('#status').textContent = 'Resposta correta.';
    indice++;

    window.setTimeout(() => {
      if (indice === perguntas.length) {
        telaVitoria();
      } else {
        mostrarPergunta();
      }
    }, 650);
  } else {
    travado = true;
    botao.classList.add('errada');
    document.querySelectorAll('[data-resposta]').forEach((item) => item.disabled = true);
    document.querySelectorAll('[data-resposta]').forEach((item) => {
      if (item.dataset.resposta === atual.correta) item.classList.add('certa');
    });
    telaDerrota(atual);
  }
}

function telaDerrota(atual) {
  window.setTimeout(() => {
    $('#progressoTopo').textContent = 'Missão encerrada';
    $('#palco').innerHTML = `
      <article class="cartao">
        <div class="resultado-icone derrota" aria-hidden="true">×</div>
        <span class="etiqueta">Missão falhou</span>
        <h2>Resposta incorreta</h2>
        <p>A resposta correta era <strong>${atual.correta}</strong>. Você perdeu o jogo.</p>
        <div class="acoes">
          <button class="acao" id="reiniciar">Tentar novamente</button>
        </div>
      </article>
    `;
    $('#reiniciar').addEventListener('click', telaInicial);
  }, 750);
}

function telaVitoria() {
  travado = true;
  atualizarProgresso();
  $('#palco').innerHTML = `
    <article class="cartao">
      <div class="resultado-icone vitoria" aria-hidden="true">✓</div>
      <span class="etiqueta">Missão concluída</span>
      <h2>Colônia Selene salva!</h2>
      <p>Você acertou todas as perguntas e completou o protocolo matemático da colônia.</p>
      <div class="acoes">
        <button class="acao" id="jogarNovamente">Jogar novamente</button>
      </div>
    </article>
  `;
  $('#jogarNovamente').addEventListener('click', telaInicial);
}

telaInicial();

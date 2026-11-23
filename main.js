'use strict';

const $ = (seletor) => document.querySelector(seletor);

const perguntas = [
  {
    categoria: 'Suprimentos',
    pergunta: 'A estação recebeu 7 caixas de água e depois mais 8 caixas. Quantas caixas existem agora?',
    alternativas: ['14 caixas', '15 caixas', '16 caixas', '17 caixas'],
    correta: '15 caixas'
  },
  {
    categoria: 'Painéis solares',
    pergunta: 'Se 9 painéis solares geram 6 unidades cada, quantas unidades são geradas no total?',
    alternativas: ['54 unidades', '56 unidades', '63 unidades', '69 unidades'],
    correta: '54 unidades'
  },
  {
    categoria: 'Reservatório',
    pergunta: 'Um reservatório está com 1/2 da capacidade e recebe mais 1/4. Qual fração ficou cheia?',
    alternativas: ['1/6', '1/3', '2/6', '3/4'],
    correta: '3/4'
  },
  {
    categoria: 'Energia',
    pergunta: 'O reator lunar tem 3 módulos, e cada módulo pode armazenar 3 cargas. Quantas cargas cabem no reator?',
    alternativas: ['6 cargas', '9 cargas', '12 cargas', '27 cargas'],
    correta: '9 cargas'
  },
  {
    categoria: 'Oxigênio',
    pergunta: 'A colônia possui 80 unidades de oxigênio. A reserva de emergência precisa de 25%. Quantas unidades serão separadas?',
    alternativas: ['20 unidades', '25 unidades', '32 unidades', '40 unidades'],
    correta: '20 unidades'
  },
  {
    categoria: 'Base lunar',
    pergunta: 'Um módulo quadrado da estação tem 5 metros de lado. Qual é sua área?',
    alternativas: ['10 m²', '20 m²', '25 m²', '25 m'],
    correta: '25 m²'
  },
  {
    categoria: 'Distribuição',
    pergunta: 'A colônia recebeu 144 refeições para dividir igualmente entre 12 colonos. Quantas refeições cada um recebe?',
    alternativas: ['10 refeições', '12 refeições', '14 refeições', '16 refeições'],
    correta: '12 refeições'
  },
  {
    categoria: 'Missão',
    pergunta: 'Para carregar uma nave, somamos 2 unidades de oxigênio a 3 módulos com 4 unidades cada. Qual é o total?',
    alternativas: ['14 unidades', '20 unidades', '24 unidades', '32 unidades'],
    correta: '14 unidades'
  },
  {
    categoria: 'Temperatura',
    pergunta: 'A temperatura externa está em -8 °C. Ela aumenta 15 °C ao entrar no módulo aquecido. Qual será a temperatura?',
    alternativas: ['-23 °C', '-7 °C', '7 °C', '23 °C'],
    correta: '7 °C'
  },
  {
    categoria: 'Navegação',
    pergunta: 'A rota da nave forma um triângulo. Quanto mede a soma dos ângulos internos dessa trajetória?',
    alternativas: ['90°', '180°', '270°', '360°'],
    correta: '180°'
  },
  {
    categoria: 'Estufa',
    pergunta: 'Três estufas produzem juntas 21 caixas de alimento. Quantas caixas produz cada estufa?',
    alternativas: ['6 caixas', '7 caixas', '8 caixas', '9 caixas'],
    correta: '7 caixas'
  },
  {
    categoria: 'Comunicação',
    pergunta: 'A antena identificou 81 sinais iguais em 9 setores. Quantos sinais existem em cada setor?',
    alternativas: ['8 sinais', '9 sinais', '10 sinais', '18 sinais'],
    correta: '9 sinais'
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

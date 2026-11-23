'use strict';

const $ = (seletor) => document.querySelector(seletor);

const perguntas = [
  {
    enunciado:
      'Ao sair da escola, você descobre uma inteligência ' +
      'artificial capaz de criar textos, imagens e vozes. ' +
      'Qual é sua primeira reação?',
    alternativas: [
      {
        texto: 'Quero experimentar e descobrir o que ela consegue fazer.',
        afirmacao: ['Decidiu experimentar a inteligência artificial.'],
        proxima: 1
      },
      {
        texto: 'Quero entender os riscos antes de utilizar.',
        afirmacao: ['Decidiu investigar os riscos da inteligência artificial.'],
        proxima: 2
      }
    ]
  },
  {
    enunciado:
      'Você decide experimentar a ferramenta. Na mesma semana, ' +
      'a professora solicita um trabalho sobre inteligência ' +
      'artificial. Como você pretende começar?',
    alternativas: []
  },
  {
    enunciado:
      'Antes de experimentar a ferramenta, você procura entender ' +
      'seus riscos. Nesse momento, recebe um áudio suspeito ' +
      'atribuído à diretora da escola. O que você pretende fazer?',
    alternativas: []
  }
];

let atual = 0;
let historiaFinal = '';

function aleatorio(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function atualizarProgresso(texto) {
  $('#progressoTopo').textContent = texto;
}

function telaInicial() {
  atualizarProgresso('');
  $('#palco').innerHTML = `
    <article class="cartao">
      <span class="etiqueta">História interativa</span>
      <h1>Dois caminhos para a história</h1>
      <p>Uma descoberta sobre inteligência artificial coloca você diante de uma escolha.</p>
      <div class="acoes">
        <button class="acao" id="iniciar" type="button">Iniciar</button>
      </div>
    </article>
  `;

  $('#iniciar').addEventListener('click', iniciaJogo);
}

function iniciaJogo() {
  historiaFinal = '';
  atual = 0;
  mostraPergunta();
}

function mostraPergunta() {
  const pergunta = perguntas[atual];
  atualizarProgresso(`Pergunta ${atual + 1}`);

  const alternativas = pergunta.alternativas.length
    ? `<div class="alternativas">
        ${pergunta.alternativas.map((opcao, indice) =>
          `<button class="alternativa" type="button" data-opcao="${indice}">${opcao.texto}</button>`
        ).join('')}
      </div>`
    : '<p>A continuação desta narrativa será desenvolvida na próxima parte.</p>';

  $('#palco').innerHTML = `
    <article class="cartao">
      <span class="etiqueta">História</span>
      <h2 class="pergunta">${pergunta.enunciado}</h2>
      ${alternativas}
    </article>
  `;

  document.querySelectorAll('[data-opcao]').forEach((botao) => {
    botao.addEventListener('click', () => {
      respostaSelecionada(pergunta.alternativas[Number(botao.dataset.opcao)]);
    });
  });
}

function respostaSelecionada(opcaoSelecionada) {
  const afirmacao = aleatorio(opcaoSelecionada.afirmacao);
  historiaFinal += afirmacao + ' ';

  if (opcaoSelecionada.proxima !== undefined) {
    atual = opcaoSelecionada.proxima;
    mostraPergunta();
  }
}

telaInicial();

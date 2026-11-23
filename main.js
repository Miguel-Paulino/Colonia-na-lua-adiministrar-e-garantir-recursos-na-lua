'use strict';

const $ = (seletor) => document.querySelector(seletor);

const rotas = {
  terra: {
    nome: 'Aliança com a Terra',
    subtitulo: 'Seguir as ordens da missão ATLAS',
    perguntas: [
      {
        categoria: 'Comunicação',
        pergunta: 'Qual equipamento deve ser usado para estabelecer contato com a Terra?',
        alternativas: ['Antena de transmissão', 'Estufa atmosférica', 'Painel do reator'],
        correta: 'Antena de transmissão'
      },
      {
        categoria: 'Navegação',
        pergunta: 'Quem deve receber prioridade ao coordenar uma missão de resgate orbital?',
        alternativas: ['O centro de controle da ATLAS', 'A tripulação turística', 'O fornecedor de suprimentos'],
        correta: 'O centro de controle da ATLAS'
      },
      {
        categoria: 'Cultura',
        pergunta: 'O que representa a bandeira enviada pela missão da Terra?',
        alternativas: ['Um acordo coletivo', 'Uma ameaça direta', 'Um arquivo perdido'],
        correta: 'Um acordo coletivo'
      }
    ],
    final: 'A missão ATLAS aprova Selene como nova base científica permanente da humanidade.',
    titulo: 'Parceria Terra-Lua'
  },
  hélio: {
    nome: 'Expedição do Hélio-3',
    subtitulo: 'Explorar recursos valiosos no subsolo',
    perguntas: [
      {
        categoria: 'Geologia',
        pergunta: 'Qual estrutura subterrânea pode concentrar hélio-3 na Lua?',
        alternativas: ['Cratera com solo lunar antigo', 'Nuvem de poeira solar', 'Reservatório de oxigênio'],
        correta: 'Cratera com solo lunar antigo'
      },
      {
        categoria: 'Segurança',
        pergunta: 'Antes de iniciar uma perfuração profunda, o que a equipe deve verificar?',
        alternativas: ['A estabilidade do túnel', 'A quantidade de turistas', 'A cor dos uniformes'],
        correta: 'A estabilidade do túnel'
      },
      {
        categoria: 'Extração',
        pergunta: 'Qual atitude torna a extração responsável?',
        alternativas: ['Planear o limite de produção', 'Usar toda a reserva imediatamente', 'Cancelar o monitoramento'],
        correta: 'Planear o limite de produção'
      }
    ],
    final: 'A rota segura transforma o hélio-3 em energia estável e mantém a colônia próspera.',
    titulo: 'Império do Hélio-3'
  },
  independência: {
    nome: 'Independência Lunar',
    subtitulo: 'Construir uma comunidade livre na Lua',
    perguntas: [
      {
        categoria: 'Governo',
        pergunta: 'Qual decisão representa melhor uma comunidade independente?',
        alternativas: ['Criar uma assembleia dos colonos', 'Entregar todas as decisões à Helion', 'Cancelar o registro de cada habitante'],
        correta: 'Criar uma assembleia dos colonos'
      },
      {
        categoria: 'Convivência',
        pergunta: 'Diante de uma greve dos trabalhadores, o que o conselho deve fazer primeiro?',
        alternativas: ['Ouvir as exigências', 'Fechar os dormitórios', 'Ignorar a equipe médica'],
        correta: 'Ouvir as exigências'
      },
      {
        categoria: 'Futuro',
        pergunta: 'Qual símbolo mais representa a unidade da nova colônia?',
        alternativas: ['Uma bandeira escolhida em votação', 'Um contrato secreto', 'A ausência de regras'],
        correta: 'Uma bandeira escolhida em votação'
      }
    ],
    final: 'Os colonos aprovam a República de Selene e a colônia passa a decidir o próprio destino.',
    titulo: 'República Lunar'
  }
};

let rotaAtual = null;
let indice = 0;
let travado = false;

function atualizarProgresso(texto) {
  $('#progressoTopo').textContent = texto;
}

function embaralhar(lista) {
  const novaLista = [...lista];
  for (let i = novaLista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [novaLista[i], novaLista[j]] = [novaLista[j], novaLista[i]];
  }
  return novaLista;
}

function telaInicial() {
  rotaAtual = null;
  indice = 0;
  travado = false;
  atualizarProgresso('3 caminhos disponíveis');

  const caminhos = Object.entries(rotas).map(([chave, rota]) => `
    <button class="caminho" type="button" data-rota="${chave}">
      <strong>${rota.nome}</strong>
      <span>${rota.subtitulo}</span>
    </button>
  `).join('');

  $('#palco').innerHTML = `
    <article class="cartao">
      <span class="etiqueta">Escolha o destino</span>
      <h1>Missão Selene</h1>
      <p>Decida o caminho da colônia. Depois, responda às três perguntas desse percurso.</p>
      <p class="aviso">Cada resposta incorreta elimina a missão.</p>
      <div class="caminhos">${caminhos}</div>
    </article>
  `;

  document.querySelectorAll('[data-rota]').forEach((botao) => {
    botao.addEventListener('click', () => iniciarRota(botao.dataset.rota));
  });
}

function iniciarRota(chave) {
  rotaAtual = rotas[chave];
  indice = 0;
  travado = false;
  mostrarPergunta();
}

function mostrarPergunta() {
  travado = false;
  atualizarProgresso(`${rotaAtual.nome} · desafio ${indice + 1} de ${rotaAtual.perguntas.length}`);

  const atual = rotaAtual.perguntas[indice];
  const alternativas = embaralhar(atual.alternativas);
  const porcentagem = (indice / rotaAtual.perguntas.length) * 100;

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
    $('#status').textContent = 'Decisão correta. O caminho continua.';
    indice++;

    window.setTimeout(() => {
      if (indice === rotaAtual.perguntas.length) {
        telaVitoria();
      } else {
        mostrarPergunta();
      }
    }, 700);
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
    atualizarProgresso('Missão encerrada');
    $('#palco').innerHTML = `
      <article class="cartao">
        <div class="resultado-icone derrota" aria-hidden="true">×</div>
        <span class="etiqueta">Missão falhou</span>
        <h2>A decisão terminou o percurso</h2>
        <p>A resposta correta era <strong>${atual.correta}</strong>. Qualquer erro apaga o progresso da missão.</p>
        <div class="acoes">
          <button class="acao" id="reiniciar">Escolher outro caminho</button>
        </div>
      </article>
    `;
    $('#reiniciar').addEventListener('click', telaInicial);
  }, 750);
}

function telaVitoria() {
  travado = true;
  atualizarProgresso('Missão concluída');
  $('#palco').innerHTML = `
    <article class="cartao">
      <div class="resultado-icone vitoria" aria-hidden="true">✓</div>
      <span class="etiqueta">${rotaAtual.titulo}</span>
      <h2>O destino de Selene foi decidido</h2>
      <p>${rotaAtual.final}</p>
      <div class="acoes">
        <button class="acao" id="jogarNovamente">Escolher outro caminho</button>
      </div>
    </article>
  `;
  $('#jogarNovamente').addEventListener('click', telaInicial);
}

telaInicial();

const express = require('express');
const pool = require('../config/db');
const { readFile } = require('node:fs/promises');
const path = require('node:path');

const router = express.Router();
const BASE_URL = 'https://raw.githubusercontent.com/hudl/open-data/master/data';
const FONTE = 'StatsBomb Open Data';
const FINAL = 3869685;

const percentual = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1,
});

async function lerArquivo(caminho) {
  const resposta = await fetch(`${BASE_URL}/${caminho}`, {
    signal: AbortSignal.timeout(15000),
  });

  if (resposta.status === 404) return null;
  if (!resposta.ok) throw new Error(`StatsBomb HTTP ${resposta.status}`);

  const dados = await resposta.json();
  if (!Array.isArray(dados)) {
    throw new Error('Resposta inválida do StatsBomb.');
  }

  return dados;
}

function lerId(valor) {
  if (typeof valor !== 'string' && typeof valor !== 'number') return null;
  if (!/^\d+$/.test(String(valor))) return null;

  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function normalizar(nome) {
  return nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function rota(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (erro) {
      console.error('Erro ao consultar StatsBomb:', erro.message);
      return res.status(502).json({
        erro: 'Não foi possível consultar os dados do StatsBomb.',
      });
    }
  };
}

async function elenco(partidaId) {
  const equipes = await lerArquivo(`lineups/${partidaId}.json`);

  return equipes?.flatMap((equipe) =>
    equipe.lineup.map((atleta) => ({
      id: atleta.player_id,
      nome: atleta.player_nickname || atleta.player_name,
      nomeCompleto: atleta.player_name,
      equipe: equipe.team_name,
      entrouEmCampo: (atleta.positions ?? []).some(
        ({ from_period }) => from_period >= 1 && from_period <= 4
      ),
    }))
  );
}

async function calcularComparacao(partidaId, atletas) {
  const eventos = await lerArquivo(`events/${partidaId}.json`);
  if (!eventos) return null;

  const jogadores = atletas.map((atleta) => ({
    ...atleta,
    gols: 0,
    finalizacoes: 0,
  }));
  const porId = new Map(jogadores.map((atleta) => [atleta.id, atleta]));

  for (const evento of eventos) {
    if (evento.type?.name !== 'Shot' || evento.period < 1 || evento.period > 4) {
      continue;
    }

    const atleta = porId.get(evento.player?.id);
    if (!atleta) continue;

    atleta.finalizacoes += 1;
    if (evento.shot?.outcome?.name === 'Goal') atleta.gols += 1;
  }

  return { fonte: FONTE, partidaId, jogadores };
}

async function salvarRelatorio(res, dados) {
  const [atletaA, atletaB] = dados.jogadores;
  const resumo = dados.jogadores.map((atleta) => {
    const nome = `${atleta.nome} (${atleta.equipe})`;

    if (!atleta.entrouEmCampo && atleta.finalizacoes === 0) {
      return `${nome}: não entrou em campo.`;
    }

    const conversao = atleta.finalizacoes > 0
      ? percentual.format(atleta.gols / atleta.finalizacoes)
      : 'indisponível';

    return `${nome}: ${atleta.finalizacoes} finalizações e ${atleta.gols} gols. ` +
      `Conversão: ${conversao}.`;
  });

  const analise = [
    `Comparativo estatístico · ${atletaA.nome} × ${atletaB.nome}`,
    `Fonte: ${dados.fonte}`,
`Partida de ${atletaA.nome}: ${atletaA.partidaId ?? dados.partidaId}`,
`Partida de ${atletaB.nome}: ${atletaB.partidaId ?? dados.partidaId}`,
    'Recorte: tempo regulamentar e prorrogação, quando disputada. Disputa de pênaltis excluída.',
    '',
    ...resumo,
    '',
    'O relatório descreve o desempenho nas finalizações desta partida.',
  ].join('\n');

  try {
    const { rows } = await pool.query(
      `INSERT INTO relatorios_ia
        (tipo_relatorio, atleta_a_id, atleta_b_id, atleta_a_nome,
         atleta_b_nome, conteudo_analise, dados_comparacao)
       VALUES ($1, NULL, NULL, $2, $3, $4, $5::jsonb)
       RETURNING *`,
      [
        'Comparativo estatístico · StatsBomb',
        atletaA.nome,
        atletaB.nome,
        analise,
        JSON.stringify(dados),
      ]
    );

    return res.status(201).json({ ...rows[0], analise });
  } catch (erro) {
    console.error('Erro ao salvar relatório StatsBomb:', erro.message);
    return res.status(500).json({
      erro: 'Não foi possível salvar o relatório no histórico.',
    });
  }
}

router.get('/catalogo', rota(async (_req, res) => {
  const catalogo = await lerArquivo('competitions.json');
  if (!catalogo) throw new Error('Catálogo indisponível.');

  const temporadas = catalogo.map((item) => ({
    id: `${item.competition_id}:${item.season_id}`,
    pais: item.country_name,
    competicao: item.competition_name,
    temporada: item.season_name,
  }));

  return res.json({ fonte: FONTE, temporadas });
}));

router.get('/partidas', rota(async (req, res) => {
  const competicaoId = lerId(req.query.competicaoId ?? '43');
  const temporadaId = lerId(req.query.temporadaId ?? '106');

  if (!competicaoId || !temporadaId) {
    return res.status(400).json({
      erro: 'Selecione uma competição e uma temporada válidas.',
    });
  }

  const jogos = await lerArquivo(`matches/${competicaoId}/${temporadaId}.json`);
  if (!jogos) {
    return res.status(404).json({ erro: 'Temporada não encontrada.' });
  }

  const partidas = jogos.map((jogo) => ({
    id: jogo.match_id,
    data: jogo.match_date,
    mandante: jogo.home_team.home_team_name,
    visitante: jogo.away_team.away_team_name,
  })).sort((a, b) => b.data.localeCompare(a.data));

  return res.json({ fonte: FONTE, partidas });
}));

router.get('/jogadores', rota(async (req, res) => {
  const partidaId = lerId(req.query.partidaId ?? FINAL);
  const nome = typeof req.query.nome === 'string'
    ? normalizar(req.query.nome)
    : '';

  if (!partidaId || nome.length < 2 || nome.length > 100) {
    return res.status(400).json({
      erro: 'Informe um nome de 2 a 100 caracteres e uma partida válida.',
    });
  }

  const atletas = await elenco(partidaId);
  if (!atletas) {
    return res.status(404).json({ erro: 'Escalação não encontrada.' });
  }

  const jogadores = atletas.filter((atleta) =>
    normalizar(atleta.nome).includes(nome) ||
    normalizar(atleta.nomeCompleto).includes(nome)
  );

  return res.json({ fonte: FONTE, partidaId, jogadores });
}));

const consultarDupla = rota(async (req, res) => {
  const salvar = req.method === 'POST';
  const parametros = salvar ? (req.body ?? {}) : req.query;
  const partidaId = lerId(parametros.partidaId ?? (salvar ? null : FINAL));
  const idA = lerId(parametros.atletaA);
  const idB = lerId(parametros.atletaB);

  if (!partidaId || !idA || !idB || idA === idB) {
    return res.status(400).json({
      erro: 'Selecione uma partida e dois atletas diferentes.',
    });
  }

  const atletas = await elenco(partidaId);
  const atletaA = atletas?.find((atleta) => atleta.id === idA);
  const atletaB = atletas?.find((atleta) => atleta.id === idB);

  if (!atletaA || !atletaB) {
    return res.status(404).json({
      erro: 'Atleta ou escalação não encontrados.',
    });
  }

  const dados = await calcularComparacao(partidaId, [atletaA, atletaB]);
  if (!dados) {
    return res.status(404).json({ erro: 'Eventos não encontrados.' });
  }

  return salvar ? salvarRelatorio(res, dados) : res.json(dados);
});

router.get('/comparar', consultarDupla);
router.post('/relatorios', consultarDupla);

router.get('/final-2022', rota(async (_req, res) => {
  const dados = await calcularComparacao(FINAL, [
    { id: 5503, nome: 'Lionel Messi' },
    { id: 3009, nome: 'Kylian Mbappé' },
  ]);

  if (!dados) {
    return res.status(404).json({ erro: 'Eventos da final não encontrados.' });
  }

  return res.json(dados);
}));

router.get('/busca-global', async (req, res) => {
  const nome = typeof req.query.nome === 'string'
    ? normalizar(req.query.nome)
    : '';

  if (nome.length < 2 || nome.length > 100) {
    return res.status(400).json({
      erro: 'Digite um nome com 2 a 100 caracteres.',
    });
  }

  try {
    const arquivo = path.resolve(__dirname, '../../statsbomb-indice.json');
    const atletas = JSON.parse(await readFile(arquivo, 'utf8'));

    const jogadores = atletas
      .filter((atleta) =>
        [atleta.nome, ...atleta.nomes].some(
          (apelido) => normalizar(apelido).includes(nome)
        )
      )
      .slice(0, 20)
      .map((atleta) => ({
        id: atleta.id,
        nome: atleta.nome,
        totalEscalacoes: atleta.partidas.length,
      }));

    return res.json({ fonte: FONTE, jogadores });
  } catch (erro) {
    console.error('Erro ao ler o índice StatsBomb:', erro.message);
    return res.status(503).json({
      erro: 'Índice de atletas indisponível. Gere o índice e tente novamente.',
    });
  }
});

router.get('/jogadores/:id/partidas', async (req, res) => {
  const id = lerId(req.params.id);

  if (!id) {
    return res.status(400).json({ erro: 'Informe um ID de atleta válido.' });
  }

  try {
    const arquivo = path.resolve(__dirname, '../../statsbomb-indice.json');
    const atletas = JSON.parse(await readFile(arquivo, 'utf8'));
    const atleta = atletas.find((item) => item.id === id);

    if (!atleta) {
      return res.status(404).json({ erro: 'Atleta não encontrado no catálogo.' });
    }

    return res.json({
      fonte: FONTE,
      jogador: { id: atleta.id, nome: atleta.nome },
      partidas: atleta.partidas,
    });
  } catch (erro) {
    console.error('Erro ao listar partidas do atleta:', erro.message);
    return res.status(503).json({ erro: 'Índice de atletas indisponível.' });
  }
});

async function consultarAtletaNaPartida(atletaId, partidaId) {
  const atletas = await elenco(partidaId);
  const atleta = atletas?.find((item) => item.id === atletaId);
  if (!atleta) return null;

  const resultado = await calcularComparacao(partidaId, [atleta]);
  if (!resultado) return null;

  return { ...resultado.jogadores[0], partidaId };
}

router.get('/comparar-partidas', rota(async (req, res) => {
  const atletaA = lerId(req.query.atletaA);
  const partidaA = lerId(req.query.partidaA);
  const atletaB = lerId(req.query.atletaB);
  const partidaB = lerId(req.query.partidaB);

  if (!atletaA || !partidaA || !atletaB || !partidaB || atletaA === atletaB) {
    return res.status(400).json({
      erro: 'Selecione dois atletas diferentes e uma partida para cada um.',
    });
  }

  const [jogadorA, jogadorB] = await Promise.all([
    consultarAtletaNaPartida(atletaA, partidaA),
    consultarAtletaNaPartida(atletaB, partidaB),
  ]);

  if (!jogadorA || !jogadorB) {
    return res.status(404).json({
      erro: 'Um dos atletas não consta na partida escolhida ou o jogo está sem eventos.',
    });
  }

  return res.json({ fonte: FONTE, jogadores: [jogadorA, jogadorB] });
}));

router.post('/relatorios-partidas', rota(async (req, res) => {
  const { atletaA, partidaA, atletaB, partidaB } = req.body ?? {};
  const idA = lerId(atletaA);
  const jogoA = lerId(partidaA);
  const idB = lerId(atletaB);
  const jogoB = lerId(partidaB);

  if (!idA || !jogoA || !idB || !jogoB || idA === idB) {
    return res.status(400).json({
      erro: 'Selecione dois atletas diferentes e uma partida para cada um.',
    });
  }

  const [jogadorA, jogadorB] = await Promise.all([
    consultarAtletaNaPartida(idA, jogoA),
    consultarAtletaNaPartida(idB, jogoB),
  ]);

  if (!jogadorA || !jogadorB) {
    return res.status(404).json({
      erro: 'Um dos atletas não consta no jogo escolhido ou faltam os eventos.',
    });
  }

  return salvarRelatorio(res, {
    fonte: FONTE,
    jogadores: [jogadorA, jogadorB],
  });
}));

module.exports = router;
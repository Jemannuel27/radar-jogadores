const pool = require('../config/db');

function lerId(valor) {
  if (typeof valor !== 'string' && typeof valor !== 'number') return null;
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function lerContagem(valor) {
  if (typeof valor !== 'string' && typeof valor !== 'number') return null;
  if (typeof valor === 'string' && !/^\d+$/.test(valor.trim())) return null;

  const numero = Number(valor);
  return Number.isSafeInteger(numero) && numero >= 0 ? numero : null;
}

function conversao(gols, finalizacoes) {
  if (gols === null || !finalizacoes || gols > finalizacoes) return null;
  return gols / finalizacoes;
}

const percentual = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1,
});

function formatarContagem(valor) {
  return valor ?? 'Indisponível';
}

function formatarConversao(valor) {
  return valor === null ? 'Indisponível' : percentual.format(valor);
}

function montarRelatorio(nomeA, nomeB, atletaA, atletaB) {
  const golsA = lerContagem(atletaA.gols);
  const golsB = lerContagem(atletaB.gols);
  const assistenciasA = lerContagem(atletaA.assistencias);
  const assistenciasB = lerContagem(atletaB.assistencias);
  const finalizacoesA = lerContagem(atletaA.finalizacoes);
  const finalizacoesB = lerContagem(atletaB.finalizacoes);
  const conversaoA = conversao(golsA, finalizacoesA);
  const conversaoB = conversao(golsB, finalizacoesB);

  const linhas = [
    `Comparativo estatístico · ${nomeA} × ${nomeB}`,
    '',
    `${nomeA}: ${formatarContagem(golsA)} em gols, ` +
      `${formatarContagem(assistenciasA)} em assistências, ` +
      `${formatarContagem(finalizacoesA)} em finalizações. ` +
      `Conversão: ${formatarConversao(conversaoA)}.`,
    `${nomeB}: ${formatarContagem(golsB)} em gols, ` +
      `${formatarContagem(assistenciasB)} em assistências, ` +
      `${formatarContagem(finalizacoesB)} em finalizações. ` +
      `Conversão: ${formatarConversao(conversaoB)}.`,
    '',
  ];

  if (golsA !== null && golsB !== null) {
    if (golsA === golsB) {
      linhas.push('Os dois atletas têm o mesmo total de gols nos dados recebidos.');
    } else {
      const lider = golsA > golsB ? nomeA : nomeB;
      linhas.push(`${lider} tem o maior total de gols nos dados recebidos.`);
    }
  }

  if (conversaoA !== null && conversaoB !== null) {
    if (conversaoA === conversaoB) {
      linhas.push('Os dois atletas têm a mesma taxa de conversão.');
    } else {
      const lider = conversaoA > conversaoB ? nomeA : nomeB;
      linhas.push(`${lider} converteu uma proporção maior das finalizações em gols.`);
    }
  }

  linhas.push(
    '',
    'Fonte: métricas enviadas pela tela do Radar. O período e a quantidade ' +
      'de partidas não foram verificados. Se a tela usa dados simulados, ' +
      'este relatório também é demonstrativo.',
    'A comparação descreve as métricas disponíveis. Avaliar pressão, ' +
      'movimentação sem bola e função tática exige dados adicionais.'
  );

  return linhas.join('\n');
}

async function gerarRelatorio(req, res) {
  const { atletaA, atletaB } = req.body ?? {};
  const idA = lerId(atletaA?.id);
  const idB = lerId(atletaB?.id);

  if (!idA || !idB || idA === idB) {
    return res.status(400).json({
      erro: 'Selecione dois atletas diferentes do plantel.',
    });
  }

  try {
    const { rows: jogadores } = await pool.query(
      'SELECT id, nome FROM jogadores WHERE id IN ($1, $2)',
      [idA, idB]
    );

    const jogadorA = jogadores.find((jogador) => Number(jogador.id) === idA);
    const jogadorB = jogadores.find((jogador) => Number(jogador.id) === idB);

    if (!jogadorA || !jogadorB) {
      return res.status(404).json({
        erro: 'Um dos atletas selecionados não foi encontrado no plantel.',
      });
    }

    const analise = montarRelatorio(
      jogadorA.nome, jogadorB.nome, atletaA, atletaB
    );

    const { rows } = await pool.query(
      `INSERT INTO relatorios_ia
        (tipo_relatorio, atleta_a_id, atleta_b_id, atleta_a_nome,
         atleta_b_nome, conteudo_analise)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [ 'Comparativo estatístico', idA, idB, jogadorA.nome, jogadorB.nome, analise ]
    );

    return res.status(201).json({ ...rows[0], analise });
  } catch (erro) {
    console.error('Erro ao gerar relatório estatístico:', erro.message);
    return res.status(500).json({
      erro: 'Não foi possível salvar o relatório no histórico.',
    });
  }
}

async function listarRelatorios(_req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM relatorios_ia ORDER BY id DESC'
    );
    return res.json(rows);
  } catch (erro) {
    console.error('Erro ao buscar histórico:', erro.message);
    return res.status(500).json({ erro: 'Erro ao buscar histórico.' });
  }
}

module.exports = { gerarRelatorio, listarRelatorios };
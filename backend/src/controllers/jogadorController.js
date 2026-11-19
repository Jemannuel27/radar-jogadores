const pool = require('../config/db');

const CAMPOS_TEXTO = {
  nome: 100,
  posicao: 50,
  nome_esportivo: 100,
  nacionalidade: 100,
  posicao_secundaria: 50,
  observacoes: 3000,
};

const CAMPOS_NUMERICOS = {
  idade: { inteiro: true, minimo: 1 },
  equipe_id: { inteiro: true, minimo: 1 },
  altura_cm: { inteiro: false, minimo: 0.01, maximo: 999.99 },
  peso_kg: { inteiro: false, minimo: 0.01, maximo: 999.99 },
  numero_camisa: { inteiro: true, minimo: 1, maximo: 99 },
};

const SELECT_JOGADORES = `
  SELECT
    j.*,
    CASE
      WHEN j.data_nascimento IS NOT NULL
      THEN EXTRACT(YEAR FROM age(CURRENT_DATE, j.data_nascimento))::integer
      ELSE j.idade
    END AS idade,
    e.nome AS equipe_nome
  FROM jogadores j
  LEFT JOIN equipes e ON e.id = j.equipe_id
`;

function idValido(valor) {
  return (
    /^\d+$/.test(String(valor)) &&
    Number.isSafeInteger(Number(valor)) &&
    Number(valor) > 0
  );
}

function validarDados(body, cadastro) {
  const dados = {};

  for (const [campo, limite] of Object.entries(CAMPOS_TEXTO)) {
    if (!Object.hasOwn(body, campo)) continue;

    const valor = body[campo];
    const obrigatorio = campo === 'nome' || campo === 'posicao';

    if (valor == null || valor === '') {
      if (obrigatorio) {
        return { erro: 'Nome e posição são obrigatórios.' };
      }
      dados[campo] = null;
      continue;
    }

    if (typeof valor !== 'string') {
      return { erro: `O campo ${campo} deve ser um texto.` };
    }

    const texto = valor.trim();

    if (obrigatorio && !texto) {
      return { erro: 'Nome e posição são obrigatórios.' };
    }

    const textoFormatado = campo === 'observacoes'
      ? texto
      : texto.toLocaleUpperCase('pt-BR');

    if (textoFormatado.length > limite) {
      return {
        erro: `O campo ${campo} aceita até ${limite} caracteres.`,
      };
    }

    dados[campo] = textoFormatado || null;
  }

  if (cadastro && (!dados.nome || !dados.posicao)) {
    return { erro: 'Nome e posição são obrigatórios.' };
  }

  for (const [campo, regra] of Object.entries(CAMPOS_NUMERICOS)) {
    if (!Object.hasOwn(body, campo)) continue;

    const valor = body[campo];

    if (
      valor == null ||
      (typeof valor === 'string' && valor.trim() === '')
    ) {
      dados[campo] = null;
      continue;
    }

    if (
      typeof valor !== 'number' &&
      typeof valor !== 'string'
    ) {
      return { erro: `Informe um número válido em ${campo}.` };
    }

    const numero = Number(valor);

    if (
      !Number.isFinite(numero) ||
      numero < regra.minimo ||
      (regra.maximo != null && numero > regra.maximo) ||
      (regra.inteiro && !Number.isSafeInteger(numero))
    ) {
      return { erro: `Informe um valor válido em ${campo}.` };
    }

    // Evita que o banco arredonde silenciosamente altura e peso.
    if (
      !regra.inteiro &&
      Math.abs(numero * 100 - Math.round(numero * 100)) > 0.000001
    ) {
      return {
        erro: `O campo ${campo} aceita até duas casas decimais.`,
      };
    }

    dados[campo] = numero;
  }

  if (Object.hasOwn(body, 'pe_dominante')) {
    const valor = body.pe_dominante;

    if (valor == null || valor === '') {
      dados.pe_dominante = null;
    } else {
      if (typeof valor !== 'string') {
        return { erro: 'Selecione um pé dominante válido.' };
      }

      const pe = valor.trim().toUpperCase();

      if (!['DIREITO', 'ESQUERDO', 'AMBOS'].includes(pe)) {
        return {
          erro: 'O pé dominante deve ser DIREITO, ESQUERDO ou AMBOS.',
        };
      }

      dados.pe_dominante = pe;
    }
  }

  if (Object.hasOwn(body, 'data_nascimento')) {
    const valor = body.data_nascimento;

    if (valor == null || valor === '') {
      dados.data_nascimento = null;
    } else {
      if (
        typeof valor !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(valor)
      ) {
        return {
          erro: 'Informe a data de nascimento no formato AAAA-MM-DD.',
        };
      }

      const data = new Date(`${valor}T00:00:00Z`);

      if (
        !Number.isFinite(data.getTime()) ||
        data.toISOString().slice(0, 10) !== valor
      ) {
        return { erro: 'Data de nascimento inválida.' };
      }

      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = hoje.getMonth() + 1;
      const dia = hoje.getDate();
      const [anoNascimento, mesNascimento, diaNascimento] =
        valor.split('-').map(Number);

      let idade = ano - anoNascimento;

      if (
        mes < mesNascimento ||
        (mes === mesNascimento && dia < diaNascimento)
      ) {
        idade -= 1;
      }

      if (idade < 1) {
        return {
          erro: 'A data de nascimento deve corresponder a pelo menos 1 ano de idade.',
        };
      }

      dados.data_nascimento = valor;
      dados.idade = idade;
    }
  }

  return { dados };
}

function responderErro(res, erro) {
  console.error('Erro na operação com jogador:', erro.message);

  if (erro.code === '23503') {
    return res.status(409).json({
      erro: 'Confira o clube selecionado ou os registros vinculados ao atleta.',
    });
  }

  return res.status(500).json({
    erro: 'Não foi possível concluir a operação com o jogador.',
  });
}

exports.listarJogadores = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `${SELECT_JOGADORES} ORDER BY j.id DESC`
    );

    return res.json(rows);
  } catch (erro) {
    return responderErro(res, erro);
  }
};

exports.criarJogador = async (req, res) => {
  const resultado = validarDados(req.body ?? {}, true);

  if (resultado.erro) {
    return res.status(400).json({ erro: resultado.erro });
  }

  const campos = Object.keys(resultado.dados);
  const valores = Object.values(resultado.dados);
  const parametros = campos.map((_, indice) => `$${indice + 1}`);

  try {
    // Os nomes das colunas vêm exclusivamente dos campos validados acima.
    const { rows } = await pool.query(
      `INSERT INTO jogadores (${campos.join(', ')})
       VALUES (${parametros.join(', ')})
       RETURNING *`,
      valores
    );

    return res.status(201).json(rows[0]);
  } catch (erro) {
    return responderErro(res, erro);
  }
};

exports.atualizarJogador = async (req, res) => {
  const { id } = req.params;

  if (!idValido(id)) {
    return res.status(400).json({ erro: 'ID de jogador inválido.' });
  }

  const resultado = validarDados(req.body ?? {}, false);

  if (resultado.erro) {
    return res.status(400).json({ erro: resultado.erro });
  }

  const campos = Object.keys(resultado.dados);

  if (campos.length === 0) {
    return res.status(400).json({
      erro: 'Envie pelo menos um campo para atualizar.',
    });
  }

  const valores = Object.values(resultado.dados);
  const alteracoes = campos.map(
    (campo, indice) => `${campo} = $${indice + 1}`
  );

  valores.push(Number(id));

  try {
    const { rows, rowCount } = await pool.query(
      `UPDATE jogadores
       SET ${alteracoes.join(', ')},
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $${valores.length}
       RETURNING *`,
      valores
    );

    if (!rowCount) {
      return res.status(404).json({
        erro: 'Jogador não encontrado.',
      });
    }

    return res.json(rows[0]);
  } catch (erro) {
    return responderErro(res, erro);
  }
};

exports.deletarJogador = async (req, res) => {
  const { id } = req.params;

  if (!idValido(id)) {
    return res.status(400).json({ erro: 'ID de jogador inválido.' });
  }

  try {
    const { rowCount } = await pool.query(
      'DELETE FROM jogadores WHERE id = $1 RETURNING id',
      [Number(id)]
    );

    if (!rowCount) {
      return res.status(404).json({
        erro: 'Jogador não encontrado.',
      });
    }

    return res.json({
      mensagem: 'Jogador removido com sucesso.',
    });
  } catch (erro) {
    return responderErro(res, erro);
  }
};
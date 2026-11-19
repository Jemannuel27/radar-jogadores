const pool = require('../config/db');

const CAMPOS_TEXTO = {
  nome: 150,
  cidade: 150,
  nome_abreviado: 100,
  sigla: 10,
  estado: 100,
  pais: 100,
  estadio: 150,
  cores: 100,
  email: 254,
  telefone: 30,
  site: 255,
  observacoes: 3000,
};

const CAMPOS_MAIUSCULOS = new Set([
  'nome',
  'cidade',
  'nome_abreviado',
  'sigla',
  'estado',
  'pais',
  'estadio',
  'cores',
]);

function validarId(valor) {
  if (typeof valor !== 'string' || !/^\d+$/.test(valor)) {
    return null;
  }

  const id = Number(valor);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function validarDados(body, criacao = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { erro: 'Envie os dados em formato JSON.' };
  }

  const dados = {};

  for (const [campo, limite] of Object.entries(CAMPOS_TEXTO)) {
    if (!Object.prototype.hasOwnProperty.call(body, campo)) {
      continue;
    }

    const valor = body[campo];

    if (valor !== null && typeof valor !== 'string') {
      return { erro: `O campo "${campo}" deve ser um texto.` };
    }

    const texto = valor === null ? '' : valor.trim();

    if (texto.length > limite) {
      return {
        erro: `O campo "${campo}" permite até ${limite} caracteres.`,
      };
    }

    dados[campo] = texto
      ? CAMPOS_MAIUSCULOS.has(campo)
        ? texto.toLocaleUpperCase('pt-BR')
        : texto
      : null;
  }

  if (
    (criacao && !dados.nome) ||
    (Object.prototype.hasOwnProperty.call(dados, 'nome') && !dados.nome)
  ) {
    return { erro: 'O nome do clube é obrigatório.' };
  }

  if (dados.email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      return { erro: 'Informe um e-mail válido.' };
    }
  }

  if (dados.site) {
    try {
      const url = new URL(dados.site);

      if (!['http:', 'https:'].includes(url.protocol)) {
        return { erro: 'O site deve começar com http:// ou https://.' };
      }
    } catch {
      return {
        erro: 'Informe um site válido, como https://meuclube.com.br.',
      };
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'ano_fundacao')) {
    const valor = body.ano_fundacao;

    if (
      valor === null ||
      (typeof valor === 'string' && valor.trim() === '')
    ) {
      dados.ano_fundacao = null;
    } else {
      if (
        !['string', 'number'].includes(typeof valor) ||
        !/^\d+$/.test(String(valor).trim())
      ) {
        return { erro: 'O ano de fundação deve ser um número inteiro.' };
      }

      const ano = Number(valor);
      const anoAtual = new Date().getFullYear();

      if (!Number.isInteger(ano) || ano < 1 || ano > anoAtual) {
        return {
          erro: `O ano de fundação deve estar entre 1 e ${anoAtual}.`,
        };
      }

      dados.ano_fundacao = ano;
    }
  }

  return { dados };
}

function tratarErro(res, error, mensagem) {
  console.error(mensagem, error);

  if (error.code === '23503') {
    return res.status(409).json({
      erro: 'Não foi possível concluir: o clube possui registros vinculados.',
    });
  }

  if (error.code === '23505') {
    return res.status(409).json({
      erro: 'Já existe um registro com um dos dados únicos informados.',
    });
  }

  return res.status(500).json({ erro: mensagem });
}

// Listar clubes
async function listarEquipes(_req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM equipes ORDER BY id DESC'
    );

    return res.json(result.rows);
  } catch (error) {
    return tratarErro(res, error, 'Erro ao buscar clubes.');
  }
}

// Criar clube com todos os campos enviados
async function criarEquipe(req, res) {
  const { dados, erro } = validarDados(req.body, true);

  if (erro) {
    return res.status(400).json({ erro });
  }

  const campos = Object.keys(dados);
  const valores = Object.values(dados);
  const parametros = campos.map((_, indice) => `$${indice + 1}`);

  try {
    // Os nomes das colunas vêm exclusivamente da lista permitida acima.
    const result = await pool.query(
      `INSERT INTO equipes (${campos.join(', ')})
       VALUES (${parametros.join(', ')})
       RETURNING *`,
      valores
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return tratarErro(res, error, 'Erro ao cadastrar clube.');
  }
}

// Atualizar somente os campos enviados, preservando os demais
async function atualizarEquipe(req, res) {
  const id = validarId(req.params.id);

  if (!id) {
    return res.status(400).json({ erro: 'ID do clube inválido.' });
  }

  const { dados, erro } = validarDados(req.body);

  if (erro) {
    return res.status(400).json({ erro });
  }

  const campos = Object.keys(dados);

  if (campos.length === 0) {
    return res.status(400).json({
      erro: 'Envie pelo menos um campo do clube para atualizar.',
    });
  }

  const valores = Object.values(dados);
  const atribuicoes = campos.map(
    (campo, indice) => `${campo} = $${indice + 1}`
  );

  valores.push(id);

  try {
    const result = await pool.query(
      `UPDATE equipes
       SET ${atribuicoes.join(', ')},
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $${valores.length}
       RETURNING *`,
      valores
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Clube não encontrado.' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return tratarErro(res, error, 'Erro ao atualizar clube.');
  }
}

// Excluir clube
async function deletarEquipe(req, res) {
  const id = validarId(req.params.id);

  if (!id) {
    return res.status(400).json({ erro: 'ID do clube inválido.' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM equipes WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Clube não encontrado.' });
    }

    return res.json({ mensagem: 'Clube removido com sucesso.' });
  } catch (error) {
    return tratarErro(res, error, 'Erro ao excluir clube.');
  }
}

module.exports = {
  listarEquipes,
  criarEquipe,
  atualizarEquipe,
  deletarEquipe,
};
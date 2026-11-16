
const pool = require('../config/db');

// 1. Listar todos os jogadores
exports.listarJogadores = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        j.id,
        j.nome,
        j.posicao,
        j.idade,
        j.equipe_id,
        e.nome AS equipe_nome,
        j.created_at,
        j.updated_at
      FROM jogadores j
      LEFT JOIN equipes e ON e.id = j.equipe_id
      ORDER BY j.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar jogadores:', error);
    res.status(500).json({
      erro: 'Erro ao buscar jogadores do banco de dados.'
    });
  }
};

// 2. Criar novo jogador
exports.criarJogador = async (req, res) => {
  const { nome, posicao, equipe_id, idade } = req.body;

  if (!nome || !posicao) {
    return res.status(400).json({
      erro: 'Nome e posição são obrigatórios.'
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO jogadores (nome, posicao, equipe_id, idade)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nome, posicao, equipe_id || null, idade ?? null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar jogador:', error);
    res.status(500).json({
      erro: 'Erro ao cadastrar jogador.'
    });
  }
};

// 3. Atualizar jogador
exports.atualizarJogador = async (req, res) => {
  const { id } = req.params;
  const { nome, posicao, equipe_id, idade } = req.body;

  try {
    const result = await pool.query(
      `UPDATE jogadores
       SET nome = $1,
           posicao = $2,
           equipe_id = $3,
           idade = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [nome, posicao, equipe_id || null, idade ?? null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        erro: 'Jogador não encontrado.'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar jogador:', error);
    res.status(500).json({
      erro: 'Erro ao atualizar jogador.'
    });
  }
};

// 4. Deletar jogador
exports.deletarJogador = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM jogadores WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        erro: 'Jogador não encontrado.'
      });
    }

    res.json({
      mensagem: 'Jogador removido com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao deletar jogador:', error);
    res.status(500).json({
      erro: 'Erro ao deletar jogador.'
    });
  }
};

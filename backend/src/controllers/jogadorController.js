const pool = require('../config/db');

exports.listarJogadores = async (req, res) => {
  try {
    const query = `
      SELECT j.*, e.nome AS equipe_nome 
      FROM jogadores j 
      LEFT JOIN equipes e ON j.equipe_id = e.id 
      ORDER BY j.id DESC
    `;
    const { rows } = await pool.query(query);
    return res.json(rows);
  } catch (err) {
    console.error('Erro ao listar jogadores:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.cadastrarJogador = async (req, res) => {
  const { nome, posicao, idade, equipe_id } = req.body;
  try {
    const query = `
      INSERT INTO jogadores (nome, posicao, idade, equipe_id) 
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
    const values = [nome, posicao, idade, equipe_id || null];
    const { rows } = await pool.query(query, values);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro ao cadastrar jogador:', err);
    return res.status(500).json({ error: 'Erro ao cadastrar jogador' });
  }
};

exports.excluirJogador = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM jogadores WHERE id = $1', [id]);
    return res.status(200).json({ message: 'Jogador excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir jogador:', err);
    return res.status(500).json({ error: 'Erro ao excluir jogador' });
  }
};
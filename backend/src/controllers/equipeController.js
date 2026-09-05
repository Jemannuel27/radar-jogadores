const pool = require('../config/db');

// Listar todas as equipes
async function listarEquipes(req, res) {
  try {
    const result = await pool.query('SELECT * FROM equipes ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar equipes:', error);
    res.status(500).json({ erro: 'Erro ao buscar equipes.' });
  }
}

// Criar nova equipe
async function criarEquipe(req, res) {
  const { nome, cidade } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO equipes (nome, cidade) VALUES ($1, $2) RETURNING *',
      [nome, cidade]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar equipe:', error);
    res.status(500).json({ erro: 'Erro ao criar equipe.' });
  }
}

// Atualizar equipe
async function atualizarEquipe(req, res) {
  const { id } = req.params;
  const { nome, cidade } = req.body;
  try {
    const result = await pool.query(
      'UPDATE equipes SET nome = $1, cidade = $2 WHERE id = $3 RETURNING *',
      [nome, cidade, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar equipe:', error);
    res.status(500).json({ erro: 'Erro ao atualizar equipe.' });
  }
}

// Deletar equipe
async function deletarEquipe(req, res) {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM equipes WHERE id = $1', [id]);
    res.json({ mensagem: 'Equipe removida com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar equipe:', error);
    res.status(500).json({ erro: 'Erro ao deletar equipe.' });
  }
}

// Exportando todas as funções explicitamente
module.exports = {
  listarEquipes,
  criarEquipe,
  atualizarEquipe,
  deletarEquipe
};
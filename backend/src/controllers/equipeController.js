const pool = require('../config/db');

// Listar todas as equipes/clubes cadastrados
exports.listarEquipes = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM equipes ORDER BY nome ASC');
    return res.json(rows);
  } catch (err) {
    console.error('Erro ao listar equipes:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar equipes' });
  }
};

// Cadastrar uma nova equipe/clube
exports.cadastrarEquipe = async (req, res) => {
  const { nome, cidade } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'O nome do clube é obrigatório.' });
  }

  try {
    const query = `
      INSERT INTO equipes (nome, cidade) 
      VALUES ($1, $2) 
      RETURNING *
    `;
    const values = [nome, cidade || null];
    const { rows } = await pool.query(query, values);
    
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro ao cadastrar equipe:', err);
    return res.status(500).json({ error: 'Erro ao cadastrar equipe' });
  }
};

// Buscar uma equipe específica por ID (incluindo seus jogadores)
exports.obterEquipePorId = async (req, res) => {
  const { id } = req.params;

  try {
    const equipe = await pool.query('SELECT * FROM equipes WHERE id = $1', [id]);

    if (equipe.rows.length === 0) {
      return res.status(404).json({ error: 'Equipe não encontrada' });
    }

    const jogadores = await pool.query('SELECT * FROM jogadores WHERE equipe_id = $1 ORDER BY nome ASC', [id]);

    return res.json({
      ...equipe.rows[0],
      jogadores: jogadores.rows
    });
  } catch (err) {
    console.error('Erro ao buscar detalhes da equipe:', err);
    return res.status(500).json({ error: 'Erro ao buscar detalhes da equipe' });
  }
};

// Excluir uma equipe
exports.excluirEquipe = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM equipes WHERE id = $1', [id]);
    return res.status(200).json({ message: 'Equipe excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir equipe:', err);
    return res.status(500).json({ error: 'Erro ao excluir equipe' });
  }
};
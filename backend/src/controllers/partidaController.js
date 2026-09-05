const pool = require('../config/db');

async function listarPartidas(req, res) {
  try {
    const result = await pool.query('SELECT * FROM partidas ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar partidas:', error);
    res.status(500).json({ erro: 'Erro ao buscar partidas.' });
  }
}

async function criarPartida(req, res) {
  const { equipe_casa_id, equipe_fora_id, gols_casa, gols_fora, data_partida } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO partidas (equipe_casa_id, equipe_fora_id, gols_casa, gols_fora, data_partida) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [equipe_casa_id, equipe_fora_id, gols_casa || 0, gols_fora || 0, data_partida || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar partida:', error);
    res.status(500).json({ erro: 'Erro ao criar partida.' });
  }
}

async function atualizarPartida(req, res) {
  const { id } = req.params;
  const { equipe_casa_id, equipe_fora_id, gols_casa, gols_fora, data_partida } = req.body;
  try {
    const result = await pool.query(
      'UPDATE partidas SET equipe_casa_id = $1, equipe_fora_id = $2, gols_casa = $3, gols_fora = $4, data_partida = $5 WHERE id = $6 RETURNING *',
      [equipe_casa_id, equipe_fora_id, gols_casa, gols_fora, data_partida, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar partida:', error);
    res.status(500).json({ erro: 'Erro ao atualizar partida.' });
  }
}

async function deletarPartida(req, res) {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM partidas WHERE id = $1', [id]);
    res.json({ mensagem: 'Partida removida com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar partida:', error);
    res.status(500).json({ erro: 'Erro ao deletar partida.' });
  }
}

module.exports = {
  listarPartidas,
  criarPartida,
  atualizarPartida,
  deletarPartida
};
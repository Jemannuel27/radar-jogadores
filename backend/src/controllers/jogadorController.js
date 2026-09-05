const pool = require('../config/db');

// 1. Listar todos os jogadores
exports.listarJogadores = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jogadores ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar jogadores:', error);
    res.status(500).json({ erro: 'Erro ao buscar jogadores do banco de dados.' });
  }
};

// 2. Criar novo jogador
exports.criarJogador = async (req, res) => {
  const { nome, posicao, clube_id, idade, gols, assistencias } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO jogadores (nome, posicao, clube_id, idade, gols, assistencias) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nome, posicao, clube_id, idade, gols || 0, assistencias || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar jogador:', error);
    res.status(500).json({ erro: 'Erro ao cadastrar jogador.' });
  }
};

// 3. Atualizar jogador
exports.atualizarJogador = async (req, res) => {
  const { id } = req.params;
  const { nome, posicao, clube_id, idade, gols, assistencias } = req.body;
  try {
    const result = await pool.query(
      'UPDATE jogadores SET nome = $1, posicao = $2, clube_id = $3, idade = $4, gols = $5, assistencias = $6 WHERE id = $7 RETURNING *',
      [nome, posicao, clube_id, idade, gols, assistencias, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar jogador:', error);
    res.status(500).json({ erro: 'Erro ao atualizar jogador.' });
  }
};

// 4. Deletar jogador
exports.deletarJogador = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM jogadores WHERE id = $1', [id]);
    res.json({ mensagem: 'Jogador removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar jogador:', error);
    res.status(500).json({ erro: 'Erro ao deletar jogador.' });
  }
};
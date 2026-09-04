const pool = require('../config/db');

// Listar todas as partidas
const listarPartidas = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT p.*, e.nome as nome_equipe 
            FROM partidas p
            LEFT JOIN equipes e ON p.equipe_id = e.id
            ORDER BY p.data_partida DESC
        `);
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Erro ao listar partidas:', error);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

// Cadastrar nova partida
const criarPartida = async (req, res) => {
    const { equipe_id, adversario, data_partida, competicao, local_partida, gols_pro, gols_contra, status_partida } = req.body;

    try {
        const query = `
            INSERT INTO partidas (equipe_id, adversario, data_partida, competicao, local_partida, gols_pro, gols_contra, status_partida)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const valores = [
            equipe_id, 
            adversario, 
            data_partida, 
            competicao, 
            local_partida, 
            gols_pro || 0, 
            gols_contra || 0, 
            status_partida || 'Agendada'
        ];

        const novaPartida = await pool.query(query, valores);
        res.status(201).json({
            mensagem: 'Partida cadastrada com sucesso!',
            partida: novaPartida.rows[0]
        });
    } catch (error) {
        console.error('Erro ao cadastrar partida:', error);
        res.status(500).json({ erro: 'Erro interno ao salvar partida' });
    }
};

module.exports = {
    listarPartidas,
    criarPartida
};
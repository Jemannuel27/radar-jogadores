const pool = require('../config/db');

// Salvar ou atualizar as estatísticas dos jogadores para uma partida
const salvarEstatisticasPartida = async (req, res) => {
    const { partida_id, estatisticas } = req.body; 
    // 'estatisticas' é um array de objetos contendo os dados de cada jogador

    if (!partida_id || !Array.isArray(estatisticas)) {
        return res.status(400).json({ erro: 'Dados inválidos fornecidos.' });
    }

    // Adquire um cliente do pool para gerenciar a transação com segurança
    const client = await pool.connect();

    try {
        // Inicia a transação
        await client.query('BEGIN');

        // Remove estatísticas anteriores desta partida caso esteja editando
        await client.query('DELETE FROM estatisticas_partida WHERE partida_id = $1', [partida_id]);

        // Insere as novas estatísticas de cada atleta
        const query = `
            INSERT INTO estatisticas_partida 
            (partida_id, jogador_id, gols, assistencias, finalizacoes, passes_certos, passes_errados, desarmes, interceptacoes, cartoes_amarelos, cartoes_vermelhos, minutos_jogados)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `;

        for (let stat of estatisticas) {
            const values = [
                partida_id,
                stat.jogador_id,
                stat.gols || 0,
                stat.assistencias || 0,
                stat.finalizacoes || 0,
                stat.passes_certos || 0,
                stat.passes_errados || 0,
                stat.desarmes || 0,
                stat.interceptacoes || 0,
                stat.cartoes_amarelos || 0,
                stat.cartoes_vermelhos || 0,
                stat.minutos_jogados || 0
            ];
            await client.query(query, values);
        }

        // Confirma a transação
        await client.query('COMMIT');
        res.status(201).json({ mensagem: 'Estatísticas da partida salvas com sucesso!' });
    } catch (error) {
        // Desfaz a transação em caso de falha
        await client.query('ROLLBACK');
        console.error('Erro ao salvar estatísticas:', error);
        res.status(500).json({ erro: 'Erro interno ao salvar estatísticas da partida' });
    } finally {
        // Libera o cliente de volta para o pool de conexões
        client.release();
    }
};

// Buscar estatísticas de uma partida específica
const listarEstatisticasPorPartida = async (req, res) => {
    const { partida_id } = req.params;
    try {
        const query = `
            SELECT 
                e.*, 
                j.nome AS jogador_nome, 
                j.posicao AS jogador_posicao
            FROM estatisticas_partida e
            JOIN jogadores j ON e.jogador_id = j.id
            WHERE e.partida_id = $1
            ORDER BY j.nome ASC
        `;
        const resultado = await pool.query(query, [partida_id]);
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ erro: 'Erro ao buscar estatísticas' });
    }
};

module.exports = {
    salvarEstatisticasPartida,
    listarEstatisticasPorPartida
};
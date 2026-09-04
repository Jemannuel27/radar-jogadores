const pool = require('../config/db');

// Indicadores Gerais da Equipe
const getResumoEquipe = async (req, res) => {
    try {
        // Busca partidas finalizadas para calcular estatísticas de W/D/L e gols
        const partidasRes = await pool.query(`
            SELECT * FROM partidas WHERE status_partida = 'Finalizada'
        `);
        const partidas = partidasRes.rows;

        let vitorias = 0;
        let empates = 0;
        let derrotas = 0;
        let golsMarcados = 0;
        let golsSofridos = 0;

        partidas.forEach(p => {
            golsMarcados += p.gols_pro;
            golsSofridos += p.gols_contra;
            if (p.gols_pro > p.gols_contra) vitorias++;
            else if (p.gols_pro === p.gols_contra) empates++;
            else derrotas++;
        });

        const totalJogos = partidas.length;
        const pontosPossiveis = totalJogos * 3;
        const pontosGanhos = (vitorias * 3) + (empates * 1);
        const aproveitamento = pontosPossiveis > 0 ? ((pontosGanhos / pontosPossiveis) * 100).toFixed(1) : 0;

        res.status(200).json({
            totalJogos,
            vitorias,
            empates,
            derrotas,
            golsMarcados,
            golsSofridos,
            saldoGols: golsMarcados - golsSofridos,
            aproveitamento: Number(aproveitamento),
            historicoPartidas: partidas // útil para gráficos de evolução
        });
    } catch (error) {
        console.error('Erro ao gerar resumo da equipe:', error);
        res.status(500).json({ erro: 'Erro ao calcular dashboard da equipe' });
    }
};

// Indicadores Individuais de Desempenho dos Atletas
const getDesempenhoAtletas = async (req, res) => {
    try {
        const query = `
            SELECT 
                j.id as jogador_id,
                j.nome,
                j.posicao,
                COALESCE(SUM(e.gols), 0) as total_gols,
                COALESCE(SUM(e.assistencias), 0) as total_assistencias,
                COALESCE(SUM(e.finalizacoes), 0) as total_finalizacoes,
                COALESCE(SUM(e.passes_certos), 0) as total_passes_certos,
                COALESCE(SUM(e.passes_errados), 0) as total_passes_errados,
                COALESCE(SUM(e.desarmes), 0) as total_desarmes,
                COALESCE(SUM(e.cartoes_amarelos), 0) as total_amarelos,
                COALESCE(SUM(e.cartoes_vermelhos), 0) as total_vermelhos,
                COUNT(e.id) as jogos_disputados
            FROM jogadores j
            LEFT JOIN estatisticas_partida e ON j.id = e.jogador_id
            GROUP BY j.id, j.nome, j.posicao
            ORDER BY total_gols DESC, total_assistencias DESC
        `;
        const resultado = await pool.query(query);
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error('Erro ao buscar desempenho individual:', error);
        res.status(500).json({ erro: 'Erro ao buscar desempenho individual' });
    }
};

module.exports = {
    getResumoEquipe,
    getDesempenhoAtletas
};
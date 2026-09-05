const { GoogleGenAI } = require('@google/genai');
const pool = require('../config/db.js');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Função utilitária para pausar a execução
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const gerarParecerTecnicoIA = async (req, res) => {
    const id = req.params.id || req.params.jogador_id || req.params.jogadorId;

    try {
        console.log(`\n--- INICIANDO GERAÇÃO DE RELATÓRIO PARA O JOGADOR ID: ${id} ---`);

        if (!id || id === 'undefined') {
            return res.status(400).json({ error: "ID do jogador não foi fornecido na requisição." });
        }

        // 1. Busca os dados do jogador no PostgreSQL
        const playerQuery = await pool.query(
            `SELECT j.*, 
                    e.nome as nome_equipe,
                    COALESCE(SUM(est.gols), 0) as total_gols,
                    COALESCE(SUM(est.assistencias), 0) as total_assistencias,
                    COALESCE(SUM(est.finalizacoes), 0) as total_finalizacoes,
                    COALESCE(SUM(est.passes_certos), 0) as total_passes_certos,
                    COALESCE(SUM(est.desarmes), 0) as total_desarmes,
                    COUNT(est.id) as partidas_jogadas
             FROM jogadores j
             LEFT JOIN equipes e ON j.equipe_id = e.id
             LEFT JOIN estatisticas_partida est ON j.id = est.jogador_id
             WHERE j.id = $1
             GROUP BY j.id, e.id`,
            [id]
        );

        if (playerQuery.rows.length === 0) {
            return res.status(404).json({ error: "Jogador não encontrado." });
        }

        const jogador = playerQuery.rows[0];

        // 2. Monta o prompt
        const prompt = `Você é um analista de scout de futebol profissional. Analise o seguinte atleta e gere um parecer em formato JSON estrito:
        Nome: ${jogador.nome}
        Posição: ${jogador.posicao}
        Idade: ${jogador.idade}
        Time: ${jogador.nome_equipe || 'Sem time'}
        Partidas Analisadas: ${jogador.partidas_jogadas}
        Gols: ${jogador.total_gols}
        Assistências: ${jogador.total_assistencias}
        Finalizações: ${jogador.total_finalizacoes}
        Passes Certos: ${jogador.total_passes_certos}
        Desarmes: ${jogador.total_desarmes}

        Responda APENAS com um objeto JSON válido contendo exatamente as seguintes chaves:
        {
          "parecerTecnico": "texto com a análise geral em linguagem natural",
          "tendencia": "Alta, Estável ou Baixa",
          "pontosFortes": ["ponto 1", "ponto 2"],
          "pontosMelhoria": ["alerta 1", "alerta 2"],
          "classificacaoPerfil": "Perfil tático sucinto"
        }`;

        // 3. Chamada resiliente com Retry para contornar o Erro 503 (Servidor Ocupado)
        let response = null;
        const maxTentativas = 3;
        const modelos = ['gemini-3.6-flash', 'gemini-2.5-flash'];

        for (const modelName of modelos) {
            for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
                try {
                    console.log(`Tentativa ${tentativa} no modelo ${modelName}...`);
                    response = await ai.models.generateContent({
                        model: modelName,
                        contents: prompt,
                    });

                    if (response) break; // Sucesso, sai do loop interno
                } catch (err) {
                    const status = err.status || err.statusCode;
                    if (status === 503 && tentativa < maxTentativas) {
                        const tempoEspera = tentativa * 2000; // 2s na 1ª, 4s na 2ª
                        console.warn(`⚠️ Modelo ${modelName} ocupado (503). Aguardando ${tempoEspera / 1000}s para tentar novamente...`);
                        await sleep(tempoEspera);
                    } else {
                        console.warn(`Falha na tentativa ${tentativa} do modelo ${modelName}.`);
                        if (tentativa === maxTentativas && modelName === modelos[modelos.length - 1]) {
                            throw err; // Lança o erro se todas as tentativas falharem em todos os modelos
                        }
                        break; // Pula para o próximo modelo se esgotar as tentativas
                    }
                }
            }
            if (response) break; // Se já obteve resposta, sai do loop de modelos
        }

        const rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            throw new Error("A IA não retornou nenhum texto.");
        }

        const cleanJsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const analise = JSON.parse(cleanJsonText);

        console.log("--- RELATÓRIO GERADO COM SUCESSO! ---");
        console.log(JSON.stringify(analise, null, 2));

        return res.json(analise);

    } catch (error) {
        console.error("\n================ ERRO DETALHADO DA IA ================");
        console.error(error);
        console.error("======================================================\n");

        return res.status(500).json({ 
            error: "Falha ao processar relatório técnico com IA.",
            detalhes: error.message 
        });
    }
};

module.exports = {
    gerarParecerTecnicoIA
};

// Adicione esta função ao final do arquivo iaController.js
const listarJogadoresParaIa = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nome, posicao FROM jogadores ORDER BY nome ASC');
        return res.json(result.rows);
    } catch (error) {
        console.error("Erro ao listar jogadores:", error);
        return res.status(500).json({ error: "Erro ao buscar lista de jogadores." });
    }
};

module.exports = {
    gerarParecerTecnicoIA,
    listarJogadoresParaIa
};

const compararAtletasIA = async (req, res) => {
    const { j1, j2 } = req.query;

    try {
        if (!j1 || !j2) {
            return res.status(400).json({ error: "É necessário selecionar dois atletas para comparação." });
        }

        // Busca dados dos dois atletas no banco
        const query = `
            SELECT j.*, 
                   e.nome as nome_equipe,
                   COALESCE(SUM(est.gols), 0) as total_gols,
                   COALESCE(SUM(est.assistencias), 0) as total_assistencias,
                   COALESCE(SUM(est.finalizacoes), 0) as total_finalizacoes,
                   COALESCE(SUM(est.passes_certos), 0) as total_passes_certos,
                   COALESCE(SUM(est.desarmes), 0) as total_desarmes,
                   COUNT(est.id) as partidas_jogadas
            FROM jogadores j
            LEFT JOIN equipes e ON j.equipe_id = e.id
            LEFT JOIN estatisticas_partida est ON j.id = est.jogador_id
            WHERE j.id IN ($1, $2)
            GROUP BY j.id, e.id
        `;

        const { rows } = await pool.query(query, [j1, j2]);

        if (rows.length < 2) {
            return res.status(404).json({ error: "Um ou ambos os jogadores não foram encontrados." });
        }

        const atleta1 = rows.find(r => String(r.id) === String(j1));
        const atleta2 = rows.find(r => String(r.id) === String(j2));

        const prompt = `Você é um analista tático de scout. Faça um confronto direto (Head-to-Head) entre estes dois atletas e retorne um JSON com a chave "analiseGeral":

        Atleta 1: ${atleta1.nome} (${atleta1.posicao})
        Partidas: ${atleta1.partidas_jogadas} | Gols: ${atleta1.total_gols} | Assistências: ${atleta1.total_assistencias} | Finalizações: ${atleta1.total_finalizacoes} | Passes: ${atleta1.total_passes_certos} | Desarmes: ${atleta1.total_desarmes}

        Atleta 2: ${atleta2.nome} (${atleta2.posicao})
        Partidas: ${atleta2.partidas_jogadas} | Gols: ${atleta2.total_gols} | Assistências: ${atleta2.total_assistencias} | Finalizações: ${atleta2.total_finalizacoes} | Passes: ${atleta2.total_passes_certos} | Desarmes: ${atleta2.total_desarmes}

        Responda APENAS com este formato JSON:
        {
          "analiseGeral": "texto detalhado comparando o desempenho, estilo de jogo e qual atleta se destaca em cada quesito."
        }`;

        let response = null;
        for (let tentativa = 1; tentativa <= 3; tentativa++) {
            try {
                response = await ai.models.generateContent({
                    model: 'gemini-3.6-flash',
                    contents: prompt,
                });
                if (response) break;
            } catch (err) {
                if (err.status === 503 && tentativa < 3) {
                    await new Promise(r => setTimeout(r, 2000));
                } else {
                    throw err;
                }
            }
        }

        const rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
        const cleanJsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const analise = JSON.parse(cleanJsonText);

        return res.json(analise);

    } catch (error) {
        console.error("Erro na comparação de IA:", error);
        return res.status(500).json({ error: "Falha ao processar comparação com IA.", detalhes: error.message });
    }
};

module.exports = {
    gerarParecerTecnicoIA,
    listarJogadoresParaIa,
    compararAtletasIA
};
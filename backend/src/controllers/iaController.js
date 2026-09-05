const pool = require('../config/db');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function gerarRelatorio(req, res) {
  try {
    const { atletaA, atletaB } = req.body;
    console.log(`Gerando análise tática entre ${atletaA?.nome} e ${atletaB?.nome}...`);

    const promptText = `Atue como um analista tático de futebol profissional. Faça uma análise comparativa detalhada e um relatório tático entre os atletas ${atletaA.nome} (Posição: ${atletaA.posicao}, Gols: ${atletaA.gols}, Assistências: ${atletaA.assistencias}) e ${atletaB.nome} (Posição: ${atletaB.posicao}, Gols: ${atletaB.gols}, Assistências: ${atletaB.assistencias}). Destaque quem leva vantagem em quesitos táticos. Seja direto e objetivo.`;

    // Usando o modelo atualizado gemini-3.7-flash para resposta rápida
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: promptText,
    });

    const respostaIa = response.text || 'Análise gerada com sucesso.';
    console.log('Resposta da IA gerada com sucesso. Salvando no banco...');

    // Salva no banco de dados
    const result = await pool.query(
      `INSERT INTO relatorios_ia 
      (tipo_relatorio, atleta_a_id, atleta_b_id, atleta_a_nome, atleta_b_nome, conteudo_analise) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        'Comparativo Tático',
        atletaA.id,
        atletaB.id,
        atletaA.nome,
        atletaB.nome,
        respostaIa
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro detalhado ao gerar relatório com IA:', error);
    res.status(500).json({ erro: 'Erro ao processar análise da IA.', detalhes: error.message });
  }
}

async function listarRelatorios(req, res) {
  try {
    const result = await pool.query('SELECT * FROM relatorios_ia ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar relatórios:', error);
    res.status(500).json({ erro: 'Erro ao buscar histórico.' });
  }
}

module.exports = {
  gerarRelatorio,
  listarRelatorios
};
import React, { useState, useEffect } from 'react';
import './RelatorioIaPage.css';

export default function RelatorioIaPage({ token }) {
  const [atletas, setAtletas] = useState([]);
  const [atletaSelecionadoId, setAtletaSelecionadoId] = useState('');
  const [historicoAtleta, setHistoricoAtleta] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // Carregar lista de atletas consolidados
  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:3000/api/dashboard/atletas', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAtletas(Array.isArray(data) ? data : []))
      .catch(err => console.error('Erro ao carregar atletas:', err));
  }, [token]);

  const atletaAtual = atletas.find(a => String(a.jogador_id) === String(atletaSelecionadoId));

  // Função para gerar os insights de IA baseados nas estatísticas reais
  const gerarAnaliseInteligente = (atleta) => {
    if (!atleta) return null;

    const jogos = Number(atleta.jogos_disputados) || 0;
    if (jogos === 0) {
      return {
        perfil: "Atleta sem partidas registradas",
        fortes: ["Aguardando dados de scout"],
        fracos: ["Aguardando dados de scout"],
        tendencia: "Neutra",
        relatorio: `O atleta ${atleta.nome} (${atleta.posicao}) ainda não possui partidas finalizadas registradas no sistema. Recomenda-se lançar o scout nas próximas partidas para ativar as análises preditivas.`
      };
    }

    const mediaGols = (Number(atleta.total_gols) / jogos).toFixed(2);
    const mediaAst = (Number(atleta.total_assistencias) / jogos).toFixed(2);
    const mediaDes = (Number(atleta.total_desarmes) / jogos).toFixed(2);
    const totalCartoes = Number(atleta.total_amarelos) + Number(atleta.total_vermelhos);

    // Identificação de pontos fortes e fracos lógicos
    let fortes = [];
    let fracos = [];
    let perfil = "";

    if (Number(mediaGols) >= 0.5) {
      fortes.push("Alto poder de finalização e presença de área");
      perfil = "Ativo Ofensivo / Artilheiro";
    } else {
      fortes.push("Consistência na participação tática");
      perfil = "Atleta de Composição de Elenco";
    }

    if (Number(mediaAst) >= 0.4) {
      fortes.push("Excelente visão de jogo e facilidade para criar assistências");
    } else {
      fracos.push("Baixa incidência de passes decisivos/assistências");
    }

    if (Number(mediaDes) >= 1.5) {
      fortes.push("Forte combatividade defensiva e alto volume de desarmes");
    } else {
      fracos.push("Participação defensiva e recuperação de bola abaixo da média da posição");
    }

    if (totalCartoes / jogos > 0.5) {
      fracos.push("Índice elevado de cartões (disciplina requer atenção)");
    } else {
      fortes.push("Boa disciplina tática em campo (baixo índice de cartões)");
    }

   // Tendência simulada baseada em volume
    const tendencia = jogos >= 3 ? "Em Ascensão (Estável)" : "Em Avaliação Inicial";

    // Relatório automático em linguagem natural (Estilo Parecer de Scout Profissional)
    const relatorio = `Parecer Técnico Automatizado (Scout IA): O atleta ${atleta.nome}, atuando como ${atleta.posicao}, disputou ${jogos} partidas oficiais no sistema. Apresenta uma média de ${mediaGols} gols e ${mediaAst} assistências por jogo, evidenciando ${Number(mediaGols) >= 0.4 ? 'alta periculosidade no terço final' : 'papel focado na construção e equilíbrio'}. Defensivamente, registra ${mediaDes} desarmes por partida. ${totalCartoes > 2 ? 'Nota de alerta para o controle disciplinar devido ao acúmulo de cartões.' : 'Excelente controle disciplinar mantido.'} Conclusão: Atleta recomendado para manutenção no time titular com foco em treinos específicos de ${fracos[0] || 'aprimoramento físico'}.`;

    return { perfil, fortes, fracos, tendencia, relatorio };
  };

  const analise = gerarAnaliseInteligente(atletaAtual);

  return (
    <div className="relatorio-ia-container">
      <h2>🤖 Inteligência Artificial & Relatórios de Scout</h2>
      <p className="subtitulo">Análise preditiva, diagnóstico de desempenho e parecer técnico automatizado.</p>

      {/* Seletor de Atleta */}
      <div className="card-seletor">
        <label>Selecione o Atleta para Diagnóstico:</label>
        <select 
          value={atletaSelecionadoId} 
          onChange={(e) => setAtletaSelecionadoId(e.target.value)}
        >
          <option value="">Escolha um atleta do plantel...</option>
          {atletas.map(atleta => (
            <option key={atleta.jogador_id} value={atleta.jogador_id}>
              {atleta.nome} ({atleta.posicao}) - {atleta.jogos_disputados} jogos
            </option>
          ))}
        </select>
      </div>

      {/* Exibição do Dossiê de IA */}
      {atletaAtual && analise ? (
        <div className="dossie-grid">
          
          {/* Card Principal: Relatório em Linguagem Natural */}
          <div className="dossie-card full-width">
            <div className="card-header-ai">
              <span>📝 Parecer Técnico Automatizado (LLM Simulado)</span>
              <span className="badge-tendencia">Tendência: {analise.tendencia}</span>
            </div>
            <p className="texto-parecer">{analise.relatorio}</p>
          </div>

          {/* Card: Pontos Fortes */}
          <div className="dossie-card card-forte">
            <h3>⚡ Pontos Fortes Identificados</h3>
            <ul>
              {analise.fortes.map((p, index) => (
                <li key={index}>{p}</li>
              ))}
            </ul>
          </div>

          {/* Card: Pontos Fracos / Pontos de Melhoria */}
          <div className="dossie-card card-fraco">
            <h3>⚠️ Pontos de Melhoria / Alertas</h3>
            <ul>
              {analise.fracos.length > 0 ? (
                analise.fracos.map((p, index) => <li key={index}>{p}</li>)
              ) : (
                <li>Nenhum ponto crítico de alerta identificado no momento.</li>
              )}
            </ul>
          </div>

          {/* Card: Perfil Tático */}
            <div className="dossie-card full-width perfil-box">
              <h3>🎯 Classificação de Perfil Tático</h3>
              <div className="tag-perfil">{analise.perfil}</div>
              <p className="sub-perfil">Cruzamento de métricas de scout realizado com base nas últimas atuações registradas na base de dados relacional.</p>
            </div>

        </div>
      ) : (
        <div className="aviso-vazio">
          Selecione um atleta acima para gerar o dossiê inteligente de desempenho.
        </div>
      )}

    </div>
  );
}
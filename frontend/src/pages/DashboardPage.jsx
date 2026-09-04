import React, { useState, useEffect } from 'react';
import './DashboardPage.css';

export default function DashboardPage({ token }) {
  const [resumoEquipe, setResumoEquipe] = useState(null);
  const [atletasStats, setAtletasStats] = useState([]);

  useEffect(() => {
    if (!token) return;

    // Buscar resumo da equipe
    fetch('http://localhost:3000/api/dashboard/equipe', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setResumoEquipe(data))
      .catch(err => console.error('Erro ao carregar resumo da equipe:', err));

    // Buscar estatísticas individuais
    fetch('http://localhost:3000/api/dashboard/atletas', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAtletasStats(Array.isArray(data) ? data : []))
      .catch(err => console.error('Erro ao carregar atletas stats:', err));
  }, [token]);

  return (
    <div className="dashboard-container">
      <h2>📈 Dashboard Analítico - Desempenho Geral</h2>

      {/* Seção 1: Métricas Gerais da Equipe */}
      {resumoEquipe && (
        <div className="metrics-grid">
          <div className="metric-card">
            <span>Jogos Finalizados</span>
            <h3>{resumoEquipe.totalJogos}</h3>
          </div>
          <div className="metric-card">
            <span>Aproveitamento</span>
            <h3 style={{ color: '#38bdf8' }}>{resumoEquipe.aproveitamento}%</h3>
          </div>
          <div className="metric-card">
            <span>Retrospecto (V - E - D)</span>
            <h3 style={{ color: '#fbbf24' }}>
              {resumoEquipe.vitorias} - {resumoEquipe.empates} - {resumoEquipe.derrotas}
            </h3>
          </div>
          <div className="metric-card">
            <span>Gols (Marcados / Sofridos)</span>
            <h3>{resumoEquipe.golsMarcados} / {resumoEquipe.golsSofridos}</h3>
          </div>
          <div className="metric-card">
            <span>Saldo de Gols</span>
            <h3 style={{ color: resumoEquipe.saldoGols >= 0 ? '#4ade80' : '#f87171' }}>
              {resumoEquipe.saldoGols > 0 ? `+${resumoEquipe.saldoGols}` : resumoEquipe.saldoGols}
            </h3>
          </div>
        </div>
      )}

      {/* Seção 2: Ranking e Estatísticas Individuais (Scout Consolidado) */}
      <div className="section-ranking">
        <h3>⭐ Ranking e Participação Individual dos Atletas</h3>

        {atletasStats.length === 0 ? (
          <p className="empty-text">Nenhum dado de scout registrado nas partidas ainda.</p>
        ) : (
          <div className="tabela-wrapper">
            <table className="tabela-dashboard">
              <thead>
                <tr>
                  <th>Atleta</th>
                  <th>Pos</th>
                  <th>Jogos</th>
                  <th>⚽ Gols</th>
                  <th>🎯 Ast</th>
                  <th>💡 Part. Gols</th>
                  <th>👟 Fin</th>
                  <th>🛡️ Des</th>
                  <th>🟨</th>
                  <th>🟥</th>
                </tr>
              </thead>
              <tbody>
                {atletasStats.map(atleta => {
                  const participacaoGols = Number(atleta.total_gols) + Number(atleta.total_assistencias);
                  return (
                    <tr key={atleta.jogador_id}>
                      <td className="nome-atleta"><strong>{atleta.nome}</strong></td>
                      <td><span className="badge-pos">{atleta.posicao}</span></td>
                      <td>{atleta.jogos_disputados}</td>
                      <td style={{ color: '#fbbf24', fontWeight: 'bold' }}>{atleta.total_gols}</td>
                      <td style={{ color: '#38bdf8', fontWeight: 'bold' }}>{atleta.total_assistencias}</td>
                      <td style={{ color: '#4ade80', fontWeight: 'bold' }}>{participacaoGols}</td>
                      <td>{atleta.total_finalizacoes}</td>
                      <td>{atleta.total_desarmes}</td>
                      <td>{atleta.total_amarelos}</td>
                      <td>{atleta.total_vermelhos}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
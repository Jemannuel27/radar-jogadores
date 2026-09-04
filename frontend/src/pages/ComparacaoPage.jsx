import React, { useState, useEffect } from 'react';
import './ComparacaoPage.css';

export default function ComparacaoPage({ token }) {
  const [atletas, setAtletas] = useState([]);
  const [jogadorAId, setJogadorAId] = useState('');
  const [jogadorBId, setJogadorBId] = useState('');

  // Carregar dados consolidados dos atletas do dashboard
  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:3000/api/dashboard/atletas', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAtletas(Array.isArray(data) ? data : []))
      .catch(err => console.error('Erro ao carregar atletas para comparação:', err));
  }, [token]);

  const jogadorA = atletas.find(a => String(a.jogador_id) === String(jogadorAId));
  const jogadorB = atletas.find(a => String(a.jogador_id) === String(jogadorBId));

  // Função para gerar a análise inteligente comparativa
  const gerarConclusao = (a, b) => {
    if (!a || !b) return null;

    const golsA = Number(a.total_gols) || 0;
    const golsB = Number(b.total_gols) || 0;
    const astA = Number(a.total_assistencias) || 0;
    const astB = Number(b.total_assistencias) || 0;

    let textoA = '';
    let textoB = '';

    if (golsA > golsB) {
      textoA = 'maior eficiência ofensiva e faro de gol';
    } else if (golsA < golsB) {
      textoB = 'maior eficiência ofensiva e faro de gol';
    } else {
      textoA = 'boa presença ofensiva';
      textoB = 'boa presença ofensiva';
    }

    if (astA > astB) {
      textoB ? (textoB += ' e destaque em finalizações/passes') : (textoB = 'destaque em passes');
      textoA = 'melhor visão de jogo e construção de jogadas, unindo ' + textoA;
    } else if (astB > astA) {
      textoB = 'melhor visão de jogo e construção de jogadas';
    }

    return `${a.nome} apresenta ${textoA}, enquanto ${b.nome} destaca-se por ${textoB}.`;
  };

  return (
    <div className="comparacao-container">
      <h2>⚔️ Comparador Head-to-Head (Scout IA)</h2>
      <p className="subtitulo">Selecione dois atletas para confrontar as estatísticas e gerar uma análise de perfil.</p>

      {/* Seletores de Atletas */}
      <div className="selects-wrapper">
        <div className="select-box">
          <label>Jogador A:</label>
          <select value={jogadorAId} onChange={(e) => setJogadorAId(e.target.value)}>
            <option value="">Selecione o Atleta A...</option>
            {atletas.map(atleta => (
              <option key={atleta.jogador_id} value={atleta.jogador_id}>
                {atleta.nome} ({atleta.posicao})
              </option>
            ))}
          </select>
        </div>

        <div className="vs-badge">VS</div>

        <div className="select-box">
          <label>Jogador B:</label>
          <select value={jogadorBId} onChange={(e) => setJogadorBId(e.target.value)}>
            <option value="">Selecione o Atleta B...</option>
            {atletas.map(atleta => (
              <option key={atleta.jogador_id} value={atleta.jogador_id}>
                {atleta.nome} ({atleta.posicao})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Comparação */}
      {jogadorA && jogadorB ? (
        <div className="resultado-comparacao">
          <div className="tabela-wrapper">
            <table className="tabela-head">
              <thead>
                <tr>
                  <th>Estatística</th>
                  <th className="th-jogador">{jogadorA.nome}</th>
                  <th className="th-jogador">{jogadorB.nome}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Posição</td>
                  <td><span className="badge-pos">{jogadorA.posicao}</span></td>
                  <td><span className="badge-pos">{jogadorB.posicao}</span></td>
                </tr>
                <tr>
                  <td>Jogos Disputados</td>
                  <td>{jogadorA.jogos_disputados}</td>
                  <td>{jogadorB.jogos_disputados}</td>
                </tr>
                <tr className={Number(jogadorA.total_gols) > Number(jogadorB.total_gols) ? 'destaque-vencedor' : ''}>
                  <td>⚽ Gols</td>
                  <td>{jogadorA.total_gols}</td>
                  <td>{jogadorB.total_gols}</td>
                </tr>
                <tr className={Number(jogadorA.total_assistencias) > Number(jogadorB.total_assistencias) ? 'destaque-vencedor' : ''}>
                  <td>🎯 Assistências</td>
                  <td>{jogadorA.total_assistencias}</td>
                  <td>{jogadorB.total_assistencias}</td>
                </tr>
                <tr className={Number(jogadorA.total_finalizacoes) > Number(jogadorB.total_finalizacoes) ? 'destaque-vencedor' : ''}>
                  <td>👟 Finalizações</td>
                  <td>{jogadorA.total_finalizacoes}</td>
                  <td>{jogadorB.total_finalizacoes}</td>
                </tr>
                <tr className={Number(jogadorA.total_desarmes) > Number(jogadorB.total_desarmes) ? 'destaque-vencedor' : ''}>
                  <td>🛡️ Desarmes</td>
                  <td>{jogadorA.total_desarmes}</td>
                  <td>{jogadorB.total_desarmes}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Conclusão Gerada por IA / Lógica */}
          <div className="card-conclusao">
            <h4>🤖 Conclusão do Analista (Scout IA)</h4>
            <p>{gerarConclusao(jogadorA, jogadorB)}</p>
          </div>
        </div>
      ) : (
        <div className="aviso-selecao">
          Selecione ambos os atletas acima para visualizar a comparação detalhada.
        </div>
      )}
    </div>
  );
}
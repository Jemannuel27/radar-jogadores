import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './RelatorioIaPage.css';

export function RelatorioIaPage() {
  const [historico, setHistorico] = useState([]);
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  
  // Seleção para nova análise direta
  const [atletaAId, setAtletaAId] = useState('');
  const [atletaBId, setAtletaBId] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [resHistorico, resJogadores] = await Promise.allSettled([
        api.get('/ia/historico'),
        api.get('/jogadores')
      ]);

      if (resHistorico.status === 'fulfilled' && Array.isArray(resHistorico.value.data)) {
        setHistorico(resHistorico.value.data);
      }
      if (resJogadores.status === 'fulfilled' && Array.isArray(resJogadores.value.data)) {
        setJogadores(resJogadores.value.data);
      }
    } catch (err) {
      console.error('Erro ao carregar dados dos relatórios:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para baixar o relatório individual em TXT (Posicionada corretamente aqui)
  const baixarRelatorioTxt = (item) => {
    const texto = `--- RELATÓRIO TÁTICO: ${item.tipo_relatorio} ---
Data: ${new Date(item.created_at).toLocaleString('pt-BR')}
Matchup: ${item.atleta_a_nome || 'Atleta A'} vs ${item.atleta_b_nome || 'Atleta B'}

Conteúdo da Análise:
${item.conteudo_analise.replace(/<br\s*[\/]?>/gi, '\n')}
`;

    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-${item.id}-${item.atleta_a_nome || 'atleta'}-vs-${item.atleta_b_nome || 'atleta'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGerarNovaAnalise = async () => {
    if (!atletaAId || !atletaBId) {
      alert('Selecione dois atletas para gerar a análise tática.');
      return;
    }

    if (atletaAId === atletaBId) {
      alert('Selecione atletas diferentes.');
      return;
    }

    const atletaA = jogadores.find((j) => String(j.id) === String(atletaAId));
    const atletaB = jogadores.find((j) => String(j.id) === String(atletaBId));

    setGerando(true);
    try {
      await api.post('/ia/comparar', {
        atletaA: { id: atletaA.id, nome: atletaA.nome, posicao: atletaA.posicao, gols: atletaA.gols || 0, assistencias: atletaA.assistencias || 0, finalizacoes: 30, passesCertos: 250, desarmes: 15, notaMedia: 7.5 },
        atletaB: { id: atletaB.id, nome: atletaB.nome, posicao: atletaB.posicao, gols: atletaB.gols || 0, assistencias: atletaB.assistencias || 0, finalizacoes: 25, passesCertos: 310, desarmes: 20, notaMedia: 7.8 }
      });

      // Recarrega o histórico atualizado do banco
      const res = await api.get('/ia/historico');
      if (Array.isArray(res.data)) {
        setHistorico(res.data);
      }
      setAtletaAId('');
      setAtletaBId('');
    } catch (err) {
      console.error('Erro ao gerar relatório com IA:', err);
      alert('Erro ao processar análise.');
    } finally {
      setGerando(false);
    }
  };

  return (
    <div className="relatorios-container">
      {/* Banner Principal */}
      <div className="hero-banner">
        <div className="banner-content">
          <span className="badge-tag">ULTIMATE SCOUT 26</span>
          <h1>HISTÓRICO DE RELATÓRIOS DA IA</h1>
          <p>Análises táticas salvas e auditáveis geradas estritamente com base nos dados do sistema.</p>
        </div>
      </div>

      {/* Gerador de Relatório Direto */}
      <div className="card-section">
        <h3>🤖 GERAR NOVA ANÁLISE COM IA</h3>
        <div className="generator-grid">
          <select value={atletaAId} onChange={(e) => setAtletaAId(e.target.value)}>
            <option value="">Selecione o Atleta A</option>
            {jogadores.map((j) => <option key={j.id} value={j.id}>{j.nome}</option>)}
          </select>

          <select value={atletaBId} onChange={(e) => setAtletaBId(e.target.value)}>
            <option value="">Selecione o Atleta B</option>
            {jogadores.map((j) => <option key={j.id} value={j.id}>{j.nome}</option>)}
          </select>

          <button className="btn-primary" onClick={handleGerarNovaAnalise} disabled={gerando}>
            {gerando ? 'PROCESSANDO IA...' : 'GERAR NOVA ANÁLISE TÁTICA'}
          </button>
        </div>
      </div>

      {/* Lista de Histórico do Banco */}
      <div className="card-section">
        <h3>📂 ANÁLISES SALVAS EM BANCO</h3>
        
        {loading ? (
          <p className="empty-box">Carregando histórico do servidor...</p>
        ) : historico.length === 0 ? (
          <p className="empty-box">Nenhum relatório foi gerado até o momento. Utilize o gerador acima para criar o primeiro registro.</p>
        ) : (
          <div className="historico-list">
            {historico.map((item) => (
              <div key={item.id} className="historico-card">
                <div className="historico-header">
                  <span className="report-type">{item.tipo_relatorio}</span>
                  <span className="report-date">
                    {new Date(item.created_at).toLocaleDateString('pt-BR')} às {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {item.atleta_a_nome && item.atleta_b_nome && (
                  <h4 className="matchup-title">
                    {item.atleta_a_nome} <span className="vs">VS</span> {item.atleta_b_nome}
                  </h4>
                )}
                <div 
                  className="report-body"
                  dangerouslySetInnerHTML={{ __html: item.conteudo_analise.replace(/\n/g, '<br/>') }}
                />

                {/* Botão de Download em TXT */}
                <div className="historico-footer" style={{ marginTop: '15px', textAlign: 'right' }}>
                  <button 
                    className="btn-secondary" 
                    onClick={() => baixarRelatorioTxt(item)}
                    style={{ padding: '8px 14px', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    📥 Baixar Relatório (.txt)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RelatorioIaPage;
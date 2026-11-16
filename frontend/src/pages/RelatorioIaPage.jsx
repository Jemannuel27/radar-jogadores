import { useEffect, useState } from 'react';
import { api } from '../services/api';
import './RelatorioIaPage.css';

function formatarConteudo(conteudo) {
  return String(conteudo ?? '').replace(/<br\s*\/?\s*>/gi, '\n').replace(/\*\*/g, '');
}

function baixarRelatorioTxt(item) {
  const texto = [
    'RELATÓRIO TÁTICO',
    item.tipo_relatorio,
    new Date(item.created_at).toLocaleString('pt-BR'),
    [item.atleta_a_nome || 'Atleta A', item.atleta_b_nome || 'Atleta B'].join(' vs '),
    '',
    formatarConteudo(item.conteudo_analise),
  ].join('\n');

  const url = URL.createObjectURL(new Blob([texto], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = ['relatorio', item.id].join('-') + '.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function RelatorioIaPage() {
  const [historico, setHistorico] = useState([]);
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [erroHistorico, setErroHistorico] = useState('');
  const [erroJogadores, setErroJogadores] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [atletaAId, setAtletaAId] = useState('');
  const [atletaBId, setAtletaBId] = useState('');

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      const [relatorios, atletas] = await Promise.allSettled([
        api.get('/ia/historico'),
        api.get('/jogadores'),
      ]);

      if (!ativo) return;

      if (relatorios.status === 'fulfilled' && Array.isArray(relatorios.value.data)) {
        setHistorico(relatorios.value.data);
      } else {
        setErroHistorico('Não foi possível carregar o histórico.');
      }

      if (atletas.status === 'fulfilled' && Array.isArray(atletas.value.data)) {
        setJogadores(atletas.value.data);
      } else {
        setErroJogadores('Não foi possível carregar os atletas.');
      }

      setLoading(false);
    }

    carregarDados();
    return () => {
      ativo = false;
    };
  }, []);

  async function handleGerarNovaAnalise(e) {
    e.preventDefault();
    const atletaA = jogadores.find((j) => String(j.id) === atletaAId);
    const atletaB = jogadores.find((j) => String(j.id) === atletaBId);
    if (gerando || !atletaA || !atletaB || atletaAId === atletaBId) return;

    setGerando(true);
    setMensagem('');
    try {
      await api.post('/ia/comparar', {
        atletaA: {
          id: atletaA.id, nome: atletaA.nome, posicao: atletaA.posicao,
          gols: atletaA.gols || 0, assistencias: atletaA.assistencias || 0,
          finalizacoes: 30, passesCertos: 250, desarmes: 15, notaMedia: 7.5,
        },
        atletaB: {
          id: atletaB.id, nome: atletaB.nome, posicao: atletaB.posicao,
          gols: atletaB.gols || 0, assistencias: atletaB.assistencias || 0,
          finalizacoes: 25, passesCertos: 310, desarmes: 20, notaMedia: 7.8,
        },
      });
    } catch (err) {
      setMensagem(err.response?.data?.erro || 'Não foi possível gerar a análise.');
      setGerando(false);
      return;
    }

    setAtletaAId('');
    setAtletaBId('');
    try {
      const { data } = await api.get('/ia/historico');
      if (!Array.isArray(data)) throw new Error('Histórico em formato inesperado.');
      setHistorico(data);
      setErroHistorico('');
      setMensagem('Histórico atualizado.');
    } catch {
      setErroHistorico('A solicitação foi processada, mas o histórico não pôde ser atualizado. Recarregue a página para conferir.');
    } finally {
      setGerando(false);
    }
  }

  const mesmoAtleta = atletaAId && atletaAId === atletaBId;

  return (
    <div className="relatorios-container">
      <header className="relatorios-banner">
     
        <h1>IA E RELATÓRIOS</h1>
        <p>Gere análises comparativas, consulte o histórico e baixe os relatórios em TXT.</p>
      </header>

      <section className="relatorios-painel">
        <h2>Nova análise tática</h2>
        <p className="relatorios-aviso">
          Este gerador usa valores simulados para finalizações, passes certos, desarmes e nota média.
        </p>
        <form className="generator-grid" onSubmit={handleGerarNovaAnalise}>
          <label>
            Atleta A
            <select value={atletaAId} onChange={(e) => setAtletaAId(e.target.value)} disabled={loading || gerando} required>
              <option value="">Selecione o Atleta A</option>
              {jogadores.map((j) => <option key={j.id} value={j.id}>{j.nome}</option>)}
            </select>
          </label>
          <label>
            Atleta B
            <select value={atletaBId} onChange={(e) => setAtletaBId(e.target.value)} disabled={loading || gerando} required>
              <option value="">Selecione o Atleta B</option>
              {jogadores.map((j) => <option key={j.id} value={j.id}>{j.nome}</option>)}
            </select>
          </label>
          <button type="submit" className="relatorios-gerar" disabled={loading || gerando || !atletaAId || !atletaBId || Boolean(mesmoAtleta)}>
            {gerando ? 'Gerando análise…' : 'Gerar análise'}
          </button>
        </form>
        {mesmoAtleta && <p role="status">Selecione dois atletas diferentes.</p>}
        {erroJogadores && <p role="alert">{erroJogadores}</p>}
        {mensagem && <p role="status">{mensagem}</p>}
      </section>

      <section className="relatorios-painel">
        <h2>Histórico de análises</h2>
        {erroHistorico && <p role="alert">{erroHistorico}</p>}
        {loading && <p role="status">Carregando histórico…</p>}
        {!loading && !erroHistorico && historico.length === 0 && <p>Nenhum relatório no histórico.</p>}
        <div className="historico-list">
          {historico.map((item) => (
            <article key={item.id} className="historico-card">
              <div className="historico-header">
                <span className="relatorios-tag">{item.tipo_relatorio || 'Relatório tático'}</span>
                <span>{new Date(item.created_at).toLocaleString('pt-BR')}</span>
              </div>
              {item.atleta_a_nome && item.atleta_b_nome && (
                <h3>{item.atleta_a_nome} <span className="relatorios-vs">VS</span> {item.atleta_b_nome}</h3>
              )}
              <div className="report-body">{formatarConteudo(item.conteudo_analise)}</div>
              <button type="button" onClick={() => baixarRelatorioTxt(item)}>Baixar TXT</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default RelatorioIaPage;

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './DashboardPage.css';

// Registrar componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function DashboardPage() {
  const [partidas, setPartidas] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Filtros Globais
  const [filtroEquipe, setFiltroEquipe] = useState('TODAS');
  const [filtroCompeticao, setFiltroCompeticao] = useState('TODAS');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroJogador, setFiltroJogador] = useState('TODOS');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    setErro('');
    try {
      const [resPartidas, resEquipes, resJogadores] = await Promise.allSettled([
        api.get('/partidas'),
        api.get('/equipes'),
        api.get('/jogadores')
      ]);

      if (resPartidas.status === 'fulfilled' && Array.isArray(resPartidas.value.data)) {
        setPartidas(resPartidas.value.data);
      }
      if (resEquipes.status === 'fulfilled' && Array.isArray(resEquipes.value.data)) {
        setEquipes(resEquipes.value.data);
      }
      if (resJogadores.status === 'fulfilled' && Array.isArray(resJogadores.value.data)) {
        setJogadores(resJogadores.value.data);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setErro('Erro ao carregar métricas.');
    } finally {
      setLoading(false);
    }
  };

  // Competições Únicas
  const competicoesUnicas = useMemo(() => {
    const lista = (partidas || []).map((p) => p.competicao).filter(Boolean);
    return Array.from(new Set(lista));
  }, [partidas]);

  // Filtragem Dinâmica das Partidas
  const partidasFiltradas = useMemo(() => {
    return (partidas || []).filter((p) => {
      if (filtroEquipe !== 'TODAS' && String(p.equipe_id) !== String(filtroEquipe)) return false;
      if (filtroCompeticao !== 'TODAS' && p.competicao !== filtroCompeticao) return false;
      if (p.data_partida) {
        const dataStr = p.data_partida.substring(0, 10);
        if (filtroDataInicio && dataStr < filtroDataInicio) return false;
        if (filtroDataFim && dataStr > filtroDataFim) return false;
      }
      return true;
    });
  }, [partidas, filtroEquipe, filtroCompeticao, filtroDataInicio, filtroDataFim]);

  // Cálculos de KPIs
  const kpis = useMemo(() => {
    const total = partidasFiltradas.length;
    let vitorias = 0;
    let empates = 0;
    let derrotas = 0;
    let golsPro = 0;
    let golsContra = 0;

    partidasFiltradas.forEach((p) => {
      const gp = p.gols_pro || 0;
      const gc = p.gols_contra || 0;
      golsPro += gp;
      golsContra += gc;

      if (gp > gc) vitorias++;
      else if (gp === gc) empates++;
      else derrotas++;
    });

    const pontosDisputados = total * 3;
    const pontosConquistados = vitorias * 3 + empates * 1;
    const aproveitamento = pontosDisputados > 0 ? ((pontosConquistados / pontosDisputados) * 100).toFixed(1) : 0;

    return { total, vitorias, empates, derrotas, golsPro, golsContra, aproveitamento };
  }, [partidasFiltradas]);

  // Gráfico 1: Evolução de Gols por Partida
  const chartEvolucaoGols = useMemo(() => {
    const partidasOrdenadas = [...partidasFiltradas].sort(
      (a, b) => new Date(a.data_partida) - new Date(b.data_partida)
    );

    return {
      labels: partidasOrdenadas.map((p) =>
        p.data_partida ? new Date(p.data_partida).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '-'
      ),
      datasets: [
        {
          label: 'Gols Pró',
          data: partidasOrdenadas.map((p) => p.gols_pro || 0),
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0, 212, 255, 0.15)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Gols Contra',
          data: partidasOrdenadas.map((p) => p.gols_contra || 0),
          borderColor: '#ff4d4d',
          backgroundColor: 'rgba(255, 77, 77, 0.15)',
          fill: true,
          tension: 0.3
        }
      ]
    };
  }, [partidasFiltradas]);

  // Gráfico 2: Vitórias x Empates x Derrotas (Doughnut)
  const chartResultados = useMemo(() => {
    return {
      labels: ['Vitórias', 'Empates', 'Derrotas'],
      datasets: [
        {
          data: [kpis.vitorias, kpis.empates, kpis.derrotas],
          backgroundColor: ['#2ecc71', '#ffb703', '#e63946'],
          borderWidth: 2,
          borderColor: '#101426'
        }
      ]
    };
  }, [kpis]);

  // Gráfico 3: Top 5 Jogadores (Amostra / Mock com base nos atletas do plantel)
  const chartTopJogadores = useMemo(() => {
    const listaJogadores = (jogadores || []).slice(0, 5);
    return {
      labels: listaJogadores.map((j) => j.nome),
      datasets: [
        {
          label: 'Participações em Gols',
          data: listaJogadores.map((_, idx) => (5 - idx) * 3 + Math.floor(Math.random() * 2)),
          backgroundColor: '#ffb703',
          borderRadius: 6
        }
      ]
    };
  }, [jogadores]);

  // Gráfico 4: Evolução Individual do Atleta Selecionado
  const chartEvolucaoIndividual = useMemo(() => {
    const atleta = jogadores.find((j) => String(j.id) === String(filtroJogador));
    const nomeAtleta = atleta ? atleta.nome : 'Atleta Selecionado';

    return {
      labels: ['Rodada 1', 'Rodada 2', 'Rodada 3', 'Rodada 4', 'Rodada 5'],
      datasets: [
        {
          label: `Nota de Atuação - ${nomeAtleta}`,
          data: [6.5, 7.2, 8.0, 7.5, 9.1],
          borderColor: '#9b59b6',
          backgroundColor: 'rgba(155, 89, 182, 0.2)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [jogadores, filtroJogador]);

  const limparFiltros = () => {
    setFiltroEquipe('TODAS');
    setFiltroCompeticao('TODAS');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setFiltroJogador('TODOS');
  };

  if (loading) return <div className="loading-container">Carregando painel de estatísticas...</div>;

  return (
    <div className="dashboard-container">
      {/* Banner Principal */}
      <div className="hero-banner">
        <div className="banner-content">
          <span className="badge-tag">ULTIMATE SCOUT 26</span>
          <h1>DASHBOARD DE ANALYTICS</h1>
          <p>Acompanhe o desempenho tático, evolução de gols e índice de aproveitamento da equipe.</p>
        </div>
      </div>

      {erro && <div className="error-badge">{erro}</div>}

      {/* Painel de Filtros Avançados */}
      <div className="card-section filter-section">
        <div className="filter-header">
          <h3>🔍 FILTROS ANALÍTICOS</h3>
          <button className="btn-link" onClick={limparFiltros}>LIMPAR FILTROS</button>
        </div>
        <div className="filter-grid">
          <div>
            <label>Equipe</label>
            <select value={filtroEquipe} onChange={(e) => setFiltroEquipe(e.target.value)}>
              <option value="TODAS">Todas as Equipes</option>
              {equipes.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          </div>

          <div>
            <label>Competição</label>
            <select value={filtroCompeticao} onChange={(e) => setFiltroCompeticao(e.target.value)}>
              <option value="TODAS">Todas as Competições</option>
              {competicoesUnicas.map((comp, idx) => (
                <option key={idx} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

          <div>
            <label>De (Data Inicial)</label>
            <input type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} />
          </div>

          <div>
            <label>Até (Data Final)</label>
            <input type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} />
          </div>

          <div>
            <label>Jogador Em Destaque</label>
            <select value={filtroJogador} onChange={(e) => setFiltroJogador(e.target.value)}>
              <option value="TODOS">Selecione um Atleta</option>
              {jogadores.map((j) => <option key={j.id} value={j.id}>{j.nome}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Cards de Métricas (KPIs) */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span>PARTIDAS</span>
          <h2>{kpis.total}</h2>
        </div>
        <div className="kpi-card highlight-green">
          <span>VITÓRIAS</span>
          <h2>{kpis.vitorias}</h2>
        </div>
        <div className="kpi-card highlight-yellow">
          <span>EMPATES</span>
          <h2>{kpis.empates}</h2>
        </div>
        <div className="kpi-card highlight-red">
          <span>DERROTAS</span>
          <h2>{kpis.derrotas}</h2>
        </div>
        <div className="kpi-card highlight-blue">
          <span>GOLS PRÓ / CONTRA</span>
          <h2>{kpis.golsPro} / {kpis.golsContra}</h2>
        </div>
        <div className="kpi-card highlight-gold">
          <span>APROVEITAMENTO</span>
          <h2>{kpis.aproveitamento}%</h2>
        </div>
      </div>

      {/* Grid de Gráficos (4 Gráficos) */}
      <div className="charts-grid">
        {/* Gráfico 1: Evolução de Gols */}
        <div className="card-section chart-card">
          <h3>📈 EVOLUÇÃO DE GOLS</h3>
          <div className="chart-wrapper">
            <Line
              data={chartEvolucaoGols}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#8f9bba' } } },
                scales: {
                  x: { ticks: { color: '#8f9bba' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                  y: { ticks: { color: '#8f9bba' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
              }}
            />
          </div>
        </div>

        {/* Gráfico 2: Distribuição de Resultados */}
        <div className="card-section chart-card">
          <h3>📊 VITÓRIAS X EMPATES X DERROTAS</h3>
          <div className="chart-wrapper doughnut-wrapper">
            <Doughnut
              data={chartResultados}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#8f9bba' } } }
              }}
            />
          </div>
        </div>

        {/* Gráfico 3: Top 5 Jogadores */}
        <div className="card-section chart-card">
          <h3>⭐ TOP 5 JOGADORES (AÇÕES EM GOL)</h3>
          <div className="chart-wrapper">
            <Bar
              data={chartTopJogadores}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: '#8f9bba' }, grid: { display: false } },
                  y: { ticks: { color: '#8f9bba' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
              }}
            />
          </div>
        </div>

        {/* Gráfico 4: Evolução Individual */}
        <div className="card-section chart-card">
          <h3>👤 EVOLUÇÃO INDIVIDUAL DO ATLETA</h3>
          <div className="chart-wrapper">
            <Line
              data={chartEvolucaoIndividual}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#8f9bba' } } },
                scales: {
                  x: { ticks: { color: '#8f9bba' }, grid: { display: false } },
                  y: { min: 0, max: 10, ticks: { color: '#8f9bba' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
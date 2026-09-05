import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import PlantelPage from './pages/PlantelPage';
import PartidasPage from './pages/PartidasPage';
import DashboardPage from './pages/DashboardPage';
import ComparacaoPage from './pages/ComparacaoPage';
import RelatorioIaPage from './pages/RelatorioIaPage';
import './App.css';

function App() {
  const [sessao, setSessao] = useState(() => {
    try { return JSON.parse(localStorage.getItem('radar_sessao')) || null; }
    catch { return null; }
  });
  const token = sessao?.token;

  // Aba ativa: 'plantel', 'partidas', 'dashboard', 'comparacao' ou 'relatorio_ia'
  const [abaAtiva, setAbaAtiva] = useState('plantel');

  const [jogadores, setJogadores] = useState([]);
  const [equipes, setEquipes] = useState([]);

  const carregarDados = () => {
    fetch('http://localhost:3000/jogadores', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setJogadores(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Erro ao carregar jogadores:', err));

    fetch('http://localhost:3000/equipes', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setEquipes(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Erro ao carregar equipes:', err));
  };

  useEffect(() => {
    if (token) carregarDados();
  }, [token]);

  const entrarNoSistema = (data) => {
    localStorage.setItem('radar_sessao', JSON.stringify(data));
    setSessao(data);
  };

  const sair = () => {
    localStorage.removeItem('radar_sessao');
    setSessao(null);
    setJogadores([]);
    setEquipes([]);
  };

  if (!sessao) {
    return <AuthPage onLogin={entrarNoSistema} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: 'Inter, sans-serif', paddingBottom: '60px' }}>
      <Navbar usuario={sessao.usuario} onLogout={sair} />

      <main style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* Navegação entre as Abas */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setAbaAtiva('plantel')}
            style={{
              background: abaAtiva === 'plantel' ? '#0284c7' : '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: '800',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            🛡️ Gestão de Plantel
          </button>
          
          <button 
            onClick={() => setAbaAtiva('partidas')}
            style={{
              background: abaAtiva === 'partidas' ? '#0284c7' : '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: '800',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            ⚽ Gestão de Partidas
          </button>

          <button 
            onClick={() => setAbaAtiva('dashboard')}
            style={{
              background: abaAtiva === 'dashboard' ? '#0284c7' : '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: '800',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            📈 Dashboard
          </button>

          <button 
            onClick={() => setAbaAtiva('comparacao')}
            style={{
              background: abaAtiva === 'comparacao' ? '#0284c7' : '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: '800',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            ⚔️ Comparar Atletas
          </button>

          <button 
            onClick={() => setAbaAtiva('relatorio_ia')}
            style={{
              background: abaAtiva === 'relatorio_ia' ? '#0284c7' : '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: '800',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            🤖 IA & Relatórios
          </button>
        </div>

        {/* Renderização Condicional das Abas */}
        {abaAtiva === 'partidas' ? (
          <PartidasPage token={token} equipes={equipes} />
        ) : abaAtiva === 'dashboard' ? (
          <DashboardPage token={token} />
        ) : abaAtiva === 'comparacao' ? (
          <ComparacaoPage token={token} />
        ) : abaAtiva === 'relatorio_ia' ? (
          <RelatorioIaPage token={token} />
        ) : (
          <PlantelPage 
            token={token} 
            jogadores={jogadores} 
            equipes={equipes} 
            carregarDados={carregarDados} 
          />
        )}

      </main>
    </div>
  );
}

export default App;
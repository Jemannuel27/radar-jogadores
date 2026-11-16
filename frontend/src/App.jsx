import PerfilPage from './pages/PerfilPage';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import PlantelPage from './pages/PlantelPage';
import PartidasPage from './pages/PartidasPage';
import DashboardPage from './pages/DashboardPage';
import ComparacaoPage from './pages/ComparacaoPage';
import RelatorioIaPage from './pages/RelatorioIaPage';
import { api } from './services/api';
import './App.css';

export function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem('token') || null
  );
  const [activeTab, setActiveTab] = useState('plantel');

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setActiveTab('plantel');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setActiveTab('plantel');
  };

  // Verifica se o token salvo ainda é aceito pelo backend.
  useEffect(() => {
    if (!token) return;

    let ativo = true;

    async function verificarSessao() {
      try {
        await api.get('/jogadores');
      } catch (err) {
        if (
          ativo &&
          (err.response?.status === 401 ||
            err.response?.status === 403)
        ) {
          localStorage.removeItem('token');
          setToken(null);
        } else if (!err.response) {
          console.error(
            'Não foi possível conectar ao backend:',
            err.message
          );
        }
      }
    }

    verificarSessao();

    return () => {
      ativo = false;
    };
  }, [token]);

  if (!token) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-layout">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="main-content">
        <div style={{ display: activeTab === 'plantel' ? 'block' : 'none' }}>
          <PlantelPage />
        </div>

        <div style={{ display: activeTab === 'partidas' ? 'block' : 'none' }}>
          <PartidasPage />
        </div>

        <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
          <DashboardPage />
        </div>

        <div style={{ display: activeTab === 'comparacao' ? 'block' : 'none' }}>
          <ComparacaoPage />
        </div>

        <div style={{ display: activeTab === 'relatorios' ? 'block' : 'none' }}>
          <RelatorioIaPage />
        </div>
{activeTab === 'perfil' && <PerfilPage onLogout={handleLogout} />}
      </main>
    </div>
  );
}

export default App;

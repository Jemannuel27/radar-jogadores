import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import PlantelPage from './pages/PlantelPage';
import PartidasPage from './pages/PartidasPage';
import DashboardPage from './pages/DashboardPage';
import ComparacaoPage from './pages/ComparacaoPage';
import RelatorioIaPage from './pages/RelatorioIaPage';
import './App.css';

export function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [activeTab, setActiveTab] = useState('plantel');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Se não houver token ativo, renderiza a tela de Auth (Login/Cadastro)
  if (!token) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Se o token estiver presente, renderiza a estrutura completa do sistema
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
      </main>
    </div>
  );
}

export default App;
import React from 'react';
import './Navbar.css'; // Ou App.css se não usar arquivo separado

export function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="navbar-container">
      <div className="navbar-brand">
        <span className="brand-logo">⚽</span>
        <h2>RADAR DE JOGADORES</h2>
      </div>

      <nav className="navbar-links">
        <button 
          className={`nav-btn ${activeTab === 'plantel' ? 'active' : ''}`}
          onClick={() => setActiveTab && setActiveTab('plantel')}
        >
          🛡️ GESTÃO DE PLANTEL
        </button>

        <button 
          className={`nav-btn ${activeTab === 'partidas' ? 'active' : ''}`}
          onClick={() => setActiveTab && setActiveTab('partidas')}
        >
          ⚽ GESTÃO DE PARTIDAS
        </button>

        <button 
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab && setActiveTab('dashboard')}
        >
          📊 DASHBOARD
        </button>

        <button 
          className={`nav-btn ${activeTab === 'comparacao' ? 'active' : ''}`}
          onClick={() => setActiveTab && setActiveTab('comparacao')}
        >
          ⚔️ COMPARAR ATLETAS
        </button>

        <button 
          className={`nav-btn ${activeTab === 'relatorios' ? 'active' : ''}`}
          onClick={() => setActiveTab && setActiveTab('relatorios')}
        >
          🤖 IA & RELATÓRIOS
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
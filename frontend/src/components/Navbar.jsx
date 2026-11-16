import radarLogo from '../assets/radar-logo.png';
import './Navbar.css';

const abas = [
  {
    id: 'plantel',
    texto: 'GESTÃO DE PLANTEL',
    icone: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M22 21v-2a4 4 0 0 0-3-3.87 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M16 3.13a4 4 0 0 1 0 7.75',
  },
  {
    id: 'partidas',
    texto: 'GESTÃO DE PARTIDAS',
    icone: 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z M16 3v4 M8 3v4 M3 10h18 M8 15h2 M14 15h2',
  },
  {
    id: 'dashboard',
    texto: 'DASHBOARD',
    icone: 'M3 3v18h18 M8 16v-4 M13 16V8 M18 16V5',
  },
  {
    id: 'comparacao',
    texto: 'COMPARAR ATLETAS',
    icone: 'M4 7h16 M16 3l4 4-4 4 M20 17H4 M8 13l-4 4 4 4',
  },
  {
    id: 'relatorios',
    texto: 'IA & RELATÓRIOS',
    icone: 'M6 3h8l4 4v14H6z M14 3v5h4 M9 12h6 M9 16h6',
  },
  {
    id: 'perfil',
    texto: 'MEU PERFIL',
    icone: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  },
];

export function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="navbar-container">
      <div className="navbar-brand">
        <img
          className="navbar-brand-image"
          src={radarLogo}
          alt="Radar de Jogadores"
        />
      </div>

      <nav className="navbar-links" aria-label="Navegação principal">
        {abas.map(({ id, texto, icone }) => (
          <button
            key={id}
            type="button"
            className={`nav-btn ${activeTab === id ? 'active' : ''}`}
            aria-current={activeTab === id ? 'page' : undefined}
            onClick={() => setActiveTab(id)}
          >
            <svg
              className="nav-icon"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={icone} />
            </svg>
            <span>{texto}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
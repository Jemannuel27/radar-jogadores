function Navbar({ usuario, onLogout }) {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 30px',
      backgroundColor: '#1e293b',
      color: '#fff',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      gap: '20px',
      flexWrap: 'wrap'
    }}>
      <h2 style={{ margin: 0, fontSize: '1.25rem' }}>⚽ Radar de Jogadores</h2>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500' }}>Início</a>
        <a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500' }}>Jogadores</a>
        <a href="#" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500' }}>Equipes</a>
        <span style={{ color: '#64748b' }}>|</span>
        <span style={{ color: '#38bdf8', fontWeight: '700' }}>Olá, {usuario?.nome}</span>
        <button
          onClick={onLogout}
          style={{
            background: '#7f1d1d', color: '#fecaca', border: '1px solid #991b1b',
            padding: '7px 12px', borderRadius: '7px', cursor: 'pointer', fontWeight: '800'
          }}
        >
          SAIR
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

import { useState } from 'react';

export default function PlantelPage({ token, jogadores, equipes, carregarDados }) {
  const [nome, setNome] = useState('');
  const [posicao, setPosicao] = useState('');
  const [idade, setIdade] = useState('');
  const [equipeId, setEquipeId] = useState('');

  const [nomeEquipe, setNomeEquipe] = useState('');
  const [cidadeEquipe, setCidadeEquipe] = useState('');

  const handleCadastrarJogador = (e) => {
    e.preventDefault();
    fetch('http://localhost:3000/jogadores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        nome,
        posicao,
        idade: Number(idade),
        equipe_id: equipeId ? Number(equipeId) : null
      })
    })
      .then(() => {
        setNome('');
        setPosicao('');
        setIdade('');
        setEquipeId('');
        carregarDados();
      })
      .catch((err) => console.error('Erro ao cadastrar jogador:', err));
  };

  const handleCadastrarEquipe = (e) => {
    e.preventDefault();
    fetch('http://localhost:3000/equipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nome: nomeEquipe, cidade: cidadeEquipe })
    })
      .then(() => {
        setNomeEquipe('');
        setCidadeEquipe('');
        carregarDados();
      })
      .catch((err) => console.error('Erro ao cadastrar equipe:', err));
  };

  const excluirJogador = (id) => {
    if (!window.confirm('Deseja liberar este atleta do plantel?')) return;
    fetch(`http://localhost:3000/jogadores/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      .then(() => carregarDados())
      .catch((err) => console.error('Erro ao excluir:', err));
  };

  return (
    <>
      {/* Header estilo EA Sports / FUT */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', 
        padding: '30px', 
        borderRadius: '16px', 
        border: '1px solid #312e81', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        marginBottom: '35px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'inline-block', background: '#fbbf24', color: '#090d16', fontWeight: '900', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '4px', letterSpacing: '1px', marginBottom: '8px' }}>
            ULTIMATE SCOUT 26
          </div>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 5px 0', color: '#fff', fontWeight: '900', letterSpacing: '-1px', textTransform: 'uppercase' }}>
            Radar de Jogadores
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0, fontFamily: 'Inter, sans-serif' }}>
            Gerencie seu plantel, contrate novos talentos e domine o campeonato.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ background: '#1e293b', padding: '15px 25px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '800', color: '#fbbf24' }}>{jogadores.length}</span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Inter, sans-serif' }}>Atletas</span>
          </div>
          <div style={{ background: '#1e293b', padding: '15px 25px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '800', color: '#38bdf8' }}>{equipes.length}</span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Inter, sans-serif' }}>Equipes</span>
          </div>
        </div>
      </div>

      {/* Grid de Cadastros */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '25px', marginBottom: '40px' }}>
        
        {/* Card Form: Equipe */}
        <div style={{ background: '#111827', padding: '25px', borderRadius: '16px', border: '1px solid #1f2937', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
          <h3 style={{ marginTop: 0, color: '#38bdf8', fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🛡️ Cadastro de Clube
          </h3>
          <form onSubmit={handleCadastrarEquipe} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <input 
              type="text" placeholder="Nome do Clube (ex: Real Madrid)" value={nomeEquipe} 
              onChange={(e) => setNomeEquipe(e.target.value)} required 
              style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #374151', background: '#030712', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
            />
            <input 
              type="text" placeholder="Cidade / Sede" value={cidadeEquipe} 
              onChange={(e) => setCidadeEquipe(e.target.value)} 
              style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #374151', background: '#030712', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
            />
            <button type="submit" style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'background 0.2s', fontSize: '1.1rem' }}>
              Criar Clube
            </button>
          </form>
        </div>

        {/* Card Form: Jogador */}
        <div style={{ background: '#111827', padding: '25px', borderRadius: '16px', border: '1px solid #1f2937', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
          <h3 style={{ marginTop: 0, color: '#fbbf24', fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⭐ Contratar Atleta
          </h3>
          <form onSubmit={handleCadastrarJogador} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
            <input 
              type="text" placeholder="Nome do Jogador" value={nome} 
              onChange={(e) => setNome(e.target.value)} required 
              style={{ width: '100%', padding: '11px 15px', borderRadius: '10px', border: '1px solid #374151', background: '#030712', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
            />
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', width: '100%' }}>
              <input 
                type="text" placeholder="Posição (ex: ATA)" value={posicao} 
                onChange={(e) => setPosicao(e.target.value)} required 
                style={{ width: '100%', padding: '11px 15px', borderRadius: '10px', border: '1px solid #374151', background: '#030712', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
              <input 
                type="number" placeholder="Idade" value={idade} 
                onChange={(e) => setIdade(e.target.value)} required 
                style={{ width: '100%', padding: '11px 15px', borderRadius: '10px', border: '1px solid #374151', background: '#030712', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <select 
              value={equipeId} onChange={(e) => setEquipeId(e.target.value)}
              style={{ width: '100%', padding: '11px 15px', borderRadius: '10px', border: '1px solid #374151', background: '#030712', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
            >
              <option value="">Vincular a um Clube (Opcional)</option>
              {equipes.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.nome}</option>
              ))}
            </select>
            
            <button type="submit" style={{ backgroundColor: '#d97706', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px', fontSize: '1.1rem' }}>
              Assinar Contrato
            </button>
          </form>
        </div>

      </div>

      {/* Listagem de Atletas */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.6rem', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            Plantel Escoteiro
          </h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'Inter, sans-serif' }}>Exibindo todos os registros do banco</span>
        </div>

        {jogadores.length === 0 ? (
          <div style={{ background: '#111827', padding: '40px', borderRadius: '16px', border: '1px solid #1f2937', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0, fontFamily: 'Inter, sans-serif' }}>Nenhum atleta contratado no momento. Use o formulário acima para adicionar.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {jogadores.map((j) => (
              <div key={j.id} style={{ 
                background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)', 
                borderRadius: '14px', 
                border: '1px solid #374151', 
                padding: '20px',
                position: 'relative',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <span style={{ 
                      background: '#fbbf24', 
                      color: '#030712', 
                      fontWeight: '900', 
                      fontSize: '0.8rem', 
                      padding: '4px 8px', 
                      borderRadius: '6px',
                      textTransform: 'uppercase' 
                    }}>
                      {j.posicao}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
                      {j.idade} anos
                    </span>
                  </div>

                  <h4 style={{ color: '#fff', fontSize: '1.3rem', margin: '0 0 8px 0', fontWeight: '800', lineHeight: '1.2' }}>
                    {j.nome}
                  </h4>

                  <div style={{ marginBottom: '20px' }}>
                    <span style={{ 
                      display: 'inline-block',
                      background: '#030712', 
                      color: '#38bdf8', 
                      border: '1px solid #1e3a8a', 
                      padding: '4px 10px', 
                      borderRadius: '6px', 
                      fontSize: '0.75rem', 
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {j.equipe_nome ? j.equipe_nome : 'Agente Livre'}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => excluirJogador(j.id)}
                  style={{ 
                    backgroundColor: '#7f1d1d', 
                    color: '#fca5a5', 
                    border: '1px solid #991b1b', 
                    padding: '8px', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontSize: '0.8rem', 
                    fontWeight: '800', 
                    width: '100%', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Dispensar Atleta
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
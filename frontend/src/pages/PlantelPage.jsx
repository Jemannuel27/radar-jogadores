import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function PlantelPage() {
  const [jogadores, setJogadores] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Formulário de Jogador
  const [formJogador, setFormJogador] = useState({
    nome: '',
    posicao: '',
    idade: '',
    equipe_id: ''
  });

  // Formulário de Clube/Equipe
  const [formClube, setFormClube] = useState({
    nome: '',
    cidade: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    setErro('');
    try {
      const [resJogadores, resEquipes] = await Promise.allSettled([
        api.get('/jogadores'),
        api.get('/equipes')
      ]);

      if (resJogadores.status === 'fulfilled' && Array.isArray(resJogadores.value.data)) {
        setJogadores(resJogadores.value.data);
      } else {
        setJogadores([]);
      }

      if (resEquipes.status === 'fulfilled' && Array.isArray(resEquipes.value.data)) {
        setEquipes(resEquipes.value.data);
      } else {
        setEquipes([]);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setErro('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClube = async (e) => {
    e.preventDefault();
    try {
      await api.post('/equipes', formClube);
      setFormClube({ nome: '', cidade: '' });
      carregarDados();
    } catch (err) {
      console.error('Erro ao criar clube:', err);
      alert('Erro ao cadastrar clube.');
    }
  };

  const handleCreateJogador = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jogadores', formJogador);
      setFormJogador({ nome: '', posicao: '', idade: '', equipe_id: '' });
      carregarDados();
    } catch (err) {
      console.error('Erro ao contratar atleta:', err);
      alert('Erro ao cadastrar jogador.');
    }
  };

  if (loading) {
    return (
      <div style={{ color: '#fff', textAlign: 'center', padding: '3rem' }}>
        <h2>Carregando plantel...</h2>
      </div>
    );
  }

  return (
    <div style={{ color: '#fff' }}>
      {/* Banner Principal */}
      <div style={{
        backgroundColor: '#13182e',
        border: '1px solid #252d54',
        borderRadius: '12px',
        padding: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <span style={{
            backgroundColor: '#ffb703',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '0.75rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '4px'
          }}>
            ULTIMATE SCOUT 26
          </span>
          <h1 style={{ margin: '0.5rem 0', fontSize: '2.2rem', letterSpacing: '1px' }}>
            RADAR DE JOGADORES
          </h1>
          <p style={{ color: '#8f9bba', margin: 0 }}>
            Gerencie seu plantel, contrate novos talentos e domine o campeonato.
          </p>
        </div>

        {/* Contadores - Protegidos contra undefined */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: 0, color: '#00d4ff', fontSize: '1.8rem' }}>
              {(jogadores && jogadores.length) || 0}
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#8f9bba', fontWeight: 'bold' }}>ATLETAS</span>
          </div>

          <div style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: 0, color: '#00d4ff', fontSize: '1.8rem' }}>
              {(equipes && equipes.length) || 0}
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#8f9bba', fontWeight: 'bold' }}>EQUIPES</span>
          </div>
        </div>
      </div>

      {erro && (
        <div style={{ backgroundColor: '#e63946', color: '#fff', padding: '0.8rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
          {erro}
        </div>
      )}

      {/* Seção de Formulários */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Card: Cadastro de Clube */}
        <div style={{ backgroundColor: '#101426', border: '1px solid #1c2340', borderRadius: '10px', padding: '1.5rem' }}>
          <h3 style={{ color: '#00d4ff', marginTop: 0, fontSize: '1.1rem' }}>🛡️ CADASTRO DE CLUBE</h3>
          <form onSubmit={handleCreateClube} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Nome do Clube (ex: Real Madrid)"
              value={formClube.nome}
              onChange={(e) => setFormClube({ ...formClube, nome: e.target.value })}
              required
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Cidade / Sede"
              value={formClube.cidade}
              onChange={(e) => setFormClube({ ...formClube, cidade: e.target.value })}
              style={inputStyle}
            />
            <button type="submit" style={btnPrimaryStyle}>CRIAR CLUBE</button>
          </form>
        </div>

        {/* Card: Contratar Atleta */}
        <div style={{ backgroundColor: '#101426', border: '1px solid #1c2340', borderRadius: '10px', padding: '1.5rem' }}>
          <h3 style={{ color: '#ffb703', marginTop: 0, fontSize: '1.1rem' }}>⭐ CONTRATAR ATLETA</h3>
          <form onSubmit={handleCreateJogador} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Nome do Jogador"
              value={formJogador.nome}
              onChange={(e) => setFormJogador({ ...formJogador, nome: e.target.value })}
              required
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Posição (ex: ATA)"
                value={formJogador.posicao}
                onChange={(e) => setFormJogador({ ...formJogador, posicao: e.target.value })}
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                type="number"
                placeholder="Idade"
                value={formJogador.idade}
                onChange={(e) => setFormJogador({ ...formJogador, idade: e.target.value })}
                style={{ ...inputStyle, width: '100px' }}
              />
            </div>
            <select
              value={formJogador.equipe_id}
              onChange={(e) => setFormJogador({ ...formJogador, equipe_id: e.target.value })}
              style={inputStyle}
            >
              <option value="">Vincular a um Clube (Opcional)</option>
              {equipes && equipes.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.nome}</option>
              ))}
            </select>
            <button type="submit" style={btnOrangeStyle}>ASSINAR CONTRATO</button>
          </form>
        </div>
      </div>

      {/* Seção: Lista / Plantel */}
      <div style={{ backgroundColor: '#101426', border: '1px solid #1c2340', borderRadius: '10px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, letterSpacing: '1px' }}>PLANTEL ESCOTEIRO</h3>
          <span style={{ color: '#8f9bba', fontSize: '0.85rem' }}>Exibindo todos os registros do banco</span>
        </div>

        {(!jogadores || jogadores.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6a789c', backgroundColor: '#0b0e1b', borderRadius: '8px' }}>
            Nenhum atleta contratado no momento. Use o formulário acima para adicionar.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {jogadores.map((j) => (
              <div key={j.id} style={{
                backgroundColor: '#0b0e1b',
                border: '1px solid #1f2747',
                padding: '1rem',
                borderRadius: '8px'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#ffb703' }}>{j.nome}</h4>
                <p style={{ margin: '0.2rem 0', color: '#8f9bba', fontSize: '0.9rem' }}>Posição: {j.posicao || 'N/I'}</p>
                <p style={{ margin: '0.2rem 0', color: '#8f9bba', fontSize: '0.9rem' }}>Idade: {j.idade || 'N/I'}</p>
                <p style={{ margin: '0.2rem 0', color: '#00d4ff', fontSize: '0.9rem' }}>Clube: {j.equipe_nome || 'Livre'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  backgroundColor: '#070912',
  border: '1px solid #21294a',
  color: '#fff',
  padding: '0.75rem',
  borderRadius: '6px',
  outline: 'none'
};

const btnPrimaryStyle = {
  backgroundColor: '#0088cc',
  color: '#fff',
  border: 'none',
  padding: '0.8rem',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const btnOrangeStyle = {
  backgroundColor: '#e67e22',
  color: '#fff',
  border: 'none',
  padding: '0.8rem',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

export default PlantelPage;
import React, { useState, useEffect } from 'react';
import EstatisticasPartidaModal from './EstatisticasPartidaModal';
import './PartidasPage.css';

export default function PartidasPage({ token, equipes }) {
  const [partidas, setPartidas] = useState([]);
  const [formData, setFormData] = useState({
    equipe_id: '',
    adversario: '',
    data_partida: '',
    competicao: '',
    local_partida: 'Casa',
    gols_pro: 0,
    gols_contra: 0,
    status_partida: 'Agendada'
  });
  const [mensagem, setMensagem] = useState('');
  const [partidaSelecionadaParaScout, setPartidaSelecionadaParaScout] = useState(null);

  // Buscar partidas cadastradas
  const carregarPartidas = () => {
    fetch('http://localhost:3000/api/partidas', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPartidas(Array.isArray(data) ? data : []))
      .catch(err => console.error('Erro ao carregar partidas:', err));
  };

  useEffect(() => {
    if (token) carregarPartidas();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/partidas', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (response.ok) {
        setMensagem('Partida cadastrada com sucesso!');
        setFormData({
          equipe_id: '',
          adversario: '',
          data_partida: '',
          competicao: '',
          local_partida: 'Casa',
          gols_pro: 0,
          gols_contra: 0,
          status_partida: 'Agendada'
        });
        carregarPartidas();
      } else {
        setMensagem(`Erro: ${data.erro}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setMensagem('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
      
      {/* Formulário de Cadastro */}
      <div className="partidas-container">
        <h2>➕ Cadastrar Nova Partida</h2>
        {mensagem && <p className="mensagem">{mensagem}</p>}
        
        <form onSubmit={handleSubmit} className="partida-form">
          <label>Equipe:</label>
          <select name="equipe_id" value={formData.equipe_id} onChange={handleChange} required>
            <option value="">Selecione a equipe...</option>
            {equipes.map(eq => (
              <option key={eq.id} value={eq.id}>{eq.nome}</option>
            ))}
          </select>

          <label>Adversário:</label>
          <input type="text" name="adversario" value={formData.adversario} onChange={handleChange} required placeholder="Nome do time adversário" />

          <label>Data e Horário:</label>
          <input type="datetime-local" name="data_partida" value={formData.data_partida} onChange={handleChange} required />

          <label>Competição:</label>
          <input type="text" name="competicao" value={formData.competicao} onChange={handleChange} placeholder="Ex: Campeonato Estadual" />

          <label>Local:</label>
          <select name="local_partida" value={formData.local_partida} onChange={handleChange}>
            <option value="Casa">Casa</option>
            <option value="Fora">Fora</option>
          </select>

          <label>Status:</label>
          <select name="status_partida" value={formData.status_partida} onChange={handleChange}>
            <option value="Agendada">Agendada</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Finalizada">Finalizada</option>
          </select>

          {formData.status_partida === 'Finalizada' && (
            <div className="placar-container">
              <div>
                <label>Gols Pró:</label>
                <input type="number" name="gols_pro" value={formData.gols_pro} onChange={handleChange} min="0" />
              </div>
              <div>
                <label>Gols Contra:</label>
                <input type="number" name="gols_contra" value={formData.gols_contra} onChange={handleChange} min="0" />
              </div>
            </div>
          )}

          <button type="submit" className="btn-salvar">Salvar Partida</button>
        </form>
      </div>

      {/* Listagem de Partidas com Ação de Scout */}
      <div>
        <h3 style={{ color: '#fff', fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '20px' }}>
          Calendário e Confrontos
        </h3>

        {partidas.length === 0 ? (
          <div style={{ background: '#111827', padding: '30px', borderRadius: '16px', border: '1px solid #1f2937', textAlign: 'center', color: '#64748b' }}>
            Nenhuma partida cadastrada.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {partidas.map(p => (
              <div key={p.id} style={{
                background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
                borderRadius: '14px',
                border: '1px solid #374151',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '15px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.4)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ background: '#312e81', color: '#818cf8', fontSize: '0.75rem', fontWeight: '800', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                      {p.competicao || 'Amistoso'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>
                      {p.local_partida}
                    </span>
                  </div>

                  <h4 style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 10px 0', fontWeight: '800' }}>
                    {p.nome_equipe || 'Minha Equipe'} vs {p.adversario}
                  </h4>

                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 10px 0' }}>
                    📅 {new Date(p.data_partida).toLocaleString('pt-BR')}
                  </p>

                  <div style={{ background: '#030712', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: '700' }}>Status: {p.status_partida}</span>
                    {p.status_partida === 'Finalizada' && (
                      <span style={{ fontSize: '1rem', color: '#38bdf8', fontWeight: '900' }}>
                        {p.gols_pro} x {p.gols_contra}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setPartidaSelecionadaParaScout(p)}
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  📊 Lançar / Ver Scout
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Estatísticas */}
      {partidaSelecionadaParaScout && (
        <EstatisticasPartidaModal
          partida={partidaSelecionadaParaScout}
          token={token}
          onClose={() => setPartidaSelecionadaParaScout(null)}
        />
      )}

    </div>
  );
}
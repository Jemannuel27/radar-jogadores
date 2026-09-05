import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import './PartidasPage.css';

export function PartidasPage() {
  const [partidas, setPartidas] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Estados dos Filtros
  const [filtroEquipe, setFiltroEquipe] = useState('TODAS');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [filtroCompeticao, setFiltroCompeticao] = useState('TODAS');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  // Form State
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
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    setErro('');
    try {
      const [resPartidas, resEquipes] = await Promise.allSettled([
        api.get('/partidas'),
        api.get('/equipes')
      ]);

      if (resPartidas.status === 'fulfilled' && Array.isArray(resPartidas.value.data)) {
        setPartidas(resPartidas.value.data);
      } else {
        setPartidas([]);
      }

      if (resEquipes.status === 'fulfilled' && Array.isArray(resEquipes.value.data)) {
        setEquipes(resEquipes.value.data);
      } else {
        setEquipes([]);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setErro('Erro ao carregar partidas do servidor.');
    } finally {
      setLoading(false);
    }
  };

  const competicoesUnicas = useMemo(() => {
    const lista = (partidas || [])
      .map((p) => p.competicao)
      .filter((comp) => comp && comp.trim() !== '');
    return Array.from(new Set(lista));
  }, [partidas]);

  const partidasFiltradas = useMemo(() => {
    return (partidas || []).filter((p) => {
      if (filtroEquipe !== 'TODAS' && String(p.equipe_id) !== String(filtroEquipe)) return false;
      if (filtroStatus !== 'TODOS' && p.status_partida !== filtroStatus) return false;
      if (filtroCompeticao !== 'TODAS' && p.competicao !== filtroCompeticao) return false;

      if (p.data_partida) {
        const dataPartidaFormat = p.data_partida.substring(0, 10);
        if (filtroDataInicio && dataPartidaFormat < filtroDataInicio) return false;
        if (filtroDataFim && dataPartidaFormat > filtroDataFim) return false;
      }

      return true;
    });
  }, [partidas, filtroEquipe, filtroStatus, filtroCompeticao, filtroDataInicio, filtroDataFim]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      if (editId) {
        await api.put(`/partidas/${editId}`, formData);
      } else {
        await api.post('/partidas', formData);
      }
      resetForm();
      carregarDados();
    } catch (err) {
      console.error('Erro ao salvar partida:', err);
      setErro('Erro ao salvar a partida.');
    }
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setFormData({
      equipe_id: p.equipe_id || '',
      adversario: p.adversario || '',
      data_partida: p.data_partida ? p.data_partida.substring(0, 10) : '',
      competicao: p.competicao || '',
      local_partida: p.local_partida || 'Casa',
      gols_pro: p.gols_pro ?? 0,
      gols_contra: p.gols_contra ?? 0,
      status_partida: p.status_partida || 'Agendada'
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir esta partida?')) {
      try {
        await api.delete(`/partidas/${id}`);
        carregarDados();
      } catch (err) {
        console.error('Erro ao excluir partida:', err);
      }
    }
  };

  const resetForm = () => {
    setEditId(null);
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
  };

  const limparFiltros = () => {
    setFiltroEquipe('TODAS');
    setFiltroStatus('TODOS');
    setFiltroCompeticao('TODAS');
    setFiltroDataInicio('');
    setFiltroDataFim('');
  };

  if (loading) {
    return <div className="loading-container">Carregando dados das partidas...</div>;
  }

  return (
    <div className="partidas-container">
      {/* Banner Principal no padrão EA Sports */}
      <div className="hero-banner">
        <div className="banner-content">
          <span className="badge-tag">ULTIMATE SCOUT 26</span>
          <h1>GESTÃO DE PARTIDAS</h1>
          <p>Cadastre confrontos, acompanhe placares e mantenha o histórico atualizado.</p>
        </div>
        <div className="banner-stats">
          <div className="stat-card">
            <h2>{partidasFiltradas.length} / {partidas.length}</h2>
            <span>CONFRONTOS</span>
          </div>
        </div>
      </div>

      {erro && <div className="error-badge">{erro}</div>}

      {/* Formulário de Cadastro */}
      <div className="card-section">
        <h3>⚽ {editId ? 'EDITAR CONFRONTO' : 'CADASTRAR PARTIDA'}</h3>
        <form onSubmit={handleSubmit} className="fut-form">
          <div className="form-group">
            <label>Equipe</label>
            <select value={formData.equipe_id} onChange={(e) => setFormData({...formData, equipe_id: e.target.value})} required>
              <option value="">Selecione a Equipe</option>
              {equipes.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Adversário</label>
            <input type="text" placeholder="ex: Flamengo" value={formData.adversario} onChange={(e) => setFormData({...formData, adversario: e.target.value})} required />
          </div>

          <div className="form-group">
            <label>Data</label>
            <input type="date" value={formData.data_partida} onChange={(e) => setFormData({...formData, data_partida: e.target.value})} required />
          </div>

          <div className="form-group">
            <label>Competição</label>
            <input type="text" placeholder="ex: Brasileirão" value={formData.competicao} onChange={(e) => setFormData({...formData, competicao: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Mando de Campo</label>
            <select value={formData.local_partida} onChange={(e) => setFormData({...formData, local_partida: e.target.value})}>
              <option value="Casa">Casa</option>
              <option value="Fora">Fora</option>
              <option value="Neutro">Neutro</option>
            </select>
          </div>

          <div className="form-group row-score">
            <div>
              <label>Gols Pró</label>
              <input type="number" value={formData.gols_pro} onChange={(e) => setFormData({...formData, gols_pro: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <label>Gols Contra</label>
              <input type="number" value={formData.gols_contra} onChange={(e) => setFormData({...formData, gols_contra: parseInt(e.target.value) || 0})} />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select value={formData.status_partida} onChange={(e) => setFormData({...formData, status_partida: e.target.value})}>
              <option value="Agendada">Agendada</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-primary">{editId ? 'ATUALIZAR PARTIDA' : 'SALVAR CONFRONTO'}</button>
            {editId && <button type="button" className="btn-secondary" onClick={resetForm}>CANCELAR</button>}
          </div>
        </form>
      </div>

      {/* Seção de Filtros Avançados */}
      <div className="card-section filter-section">
        <div className="filter-header">
          <h3>🔍 FILTROS E PESQUISA</h3>
          <button type="button" className="btn-link" onClick={limparFiltros}>LIMPAR FILTROS</button>
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
            <label>Status</label>
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
              <option value="TODOS">Todos os Status</option>
              <option value="Agendada">Agendada</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Finalizada">Finalizada</option>
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
        </div>
      </div>

      {/* Histórico e Tabela */}
      <div className="card-section">
        <h3>HISTÓRICO DE JOGOS</h3>
        {partidasFiltradas.length === 0 ? (
          <div className="empty-box">Nenhuma partida encontrada com os filtros atuais.</div>
        ) : (
          <div className="table-responsive">
            <table className="fut-table">
              <thead>
                <tr>
                  <th>DATA</th>
                  <th>EQUIPE</th>
                  <th>ADVERSÁRIO</th>
                  <th style={{ textAlign: 'center' }}>PLACAR</th>
                  <th>COMPETIÇÃO</th>
                  <th>LOCAL</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {partidasFiltradas.map((p) => (
                  <tr key={p.id}>
                    <td>{p.data_partida ? new Date(p.data_partida).toLocaleDateString('pt-BR') : '-'}</td>
                    <td className="team-name">{p.equipe_nome || 'N/I'}</td>
                    <td className="team-name">{p.adversario || '-'}</td>
                    <td className="score-cell">{p.gols_pro ?? 0} x {p.gols_contra ?? 0}</td>
                    <td>{p.competicao || '-'}</td>
                    <td><span className="location-tag">{p.local_partida || 'Casa'}</span></td>
                    <td>
                      <span className={`status-badge ${(p.status_partida || 'agendada').toLowerCase().replace(' ', '-')}`}>
                        {p.status_partida || 'Agendada'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-action edit" onClick={() => handleEdit(p)}>EDITAR</button>
                      <button className="btn-action delete" onClick={() => handleDelete(p.id)}>EXCLUIR</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PartidasPage;
import React, { useState, useEffect } from 'react';
import './EstatisticasPartidaModal.css';

export default function EstatisticasPartidaModal({ partida, token, onClose }) {
  const [jogadores, setJogadores] = useState([]);
  const [stats, setStats] = useState({});
  const [mensagem, setMensagem] = useState('');

  // 1. Carregar jogadores do plantel para lançar estatísticas
  useEffect(() => {
    fetch('http://localhost:3000/jogadores', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const lista = Array.isArray(data) ? data : [];
        setJogadores(lista);

        // Inicializa o estado de estatísticas com zeros para cada jogador
        const inicial = {};
        lista.forEach(j => {
          inicial[j.id] = {
            jogador_id: j.id,
            gols: 0,
            assistencias: 0,
            finalizacoes: 0,
            passes_certos: 0,
            passes_errados: 0,
            desarmes: 0,
            interceptacoes: 0,
            cartoes_amarelos: 0,
            cartoes_vermelhos: 0,
            minutos_jogados: 90
          };
        });
        setStats(inicial);
      })
      .catch(err => console.error('Erro ao carregar jogadores:', err));
  }, [token]);

  const handleChange = (jogadorId, campo, valor) => {
    setStats(prev => ({
      ...prev,
      [jogadorId]: {
        ...prev[jogadorId],
        [campo]: Number(valor) || 0
      }
    }));
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    const estatisticasArray = Object.values(stats);

    try {
      const response = await fetch('http://localhost:3000/api/estatisticas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          partida_id: partida.id,
          estatisticas: estatisticasArray
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMensagem('Estatísticas salvas com sucesso!');
        setTimeout(() => onClose(), 1500);
      } else {
        setMensagem(`Erro: ${data.erro}`);
      }
    } catch (error) {
      console.error('Erro ao enviar estatísticas:', error);
      setMensagem('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>📊 Scout Pós-Jogo: vs {partida.adversario}</h2>
          <button onClick={onClose} className="btn-fechar">✕</button>
        </div>

        {mensagem && <p className="modal-mensagem">{mensagem}</p>}

        <form onSubmit={handleSalvar}>
          <div className="tabela-scout-container">
            <table className="tabela-scout">
              <thead>
                <tr>
                  <th>Atleta</th>
                  <th>Min</th>
                  <th>Gols</th>
                  <th>Ast</th>
                  <th>Fin</th>
                  <th>P.C</th>
                  <th>P.E</th>
                  <th>Des</th>
                  <th>Int</th>
                  <th>🟨</th>
                  <th>🟥</th>
                </tr>
              </thead>
              <tbody>
                {jogadores.map(j => {
                  const s = stats[j.id] || {};
                  return (
                    <tr key={j.id}>
                      <td className="atleta-nome">
                        <strong>{j.nome}</strong>
                        <span>{j.posicao}</span>
                      </td>
                      <td><input type="number" value={s.minutos_jogados ?? 90} onChange={e => handleChange(j.id, 'minutos_jogados', e.target.value)} /></td>
                      <td><input type="number" value={s.gols ?? 0} onChange={e => handleChange(j.id, 'gols', e.target.value)} /></td>
                      <td><input type="number" value={s.assistencias ?? 0} onChange={e => handleChange(j.id, 'assistencias', e.target.value)} /></td>
                      <td><input type="number" value={s.finalizacoes ?? 0} onChange={e => handleChange(j.id, 'finalizacoes', e.target.value)} /></td>
                      <td><input type="number" value={s.passes_certos ?? 0} onChange={e => handleChange(j.id, 'passes_certos', e.target.value)} /></td>
                      <td><input type="number" value={s.passes_errados ?? 0} onChange={e => handleChange(j.id, 'passes_errados', e.target.value)} /></td>
                      <td><input type="number" value={s.desarmes ?? 0} onChange={e => handleChange(j.id, 'desarmes', e.target.value)} /></td>
                      <td><input type="number" value={s.interceptacoes ?? 0} onChange={e => handleChange(j.id, 'interceptacoes', e.target.value)} /></td>
                      <td><input type="number" value={s.cartoes_amarelos ?? 0} onChange={e => handleChange(j.id, 'cartoes_amarelos', e.target.value)} /></td>
                      <td><input type="number" value={s.cartoes_vermelhos ?? 0} onChange={e => handleChange(j.id, 'cartoes_vermelhos', e.target.value)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancelar">Cancelar</button>
            <button type="submit" className="btn-salvar-scout">Salvar Desempenho</button>
          </div>
        </form>
      </div>
    </div>
  );
}
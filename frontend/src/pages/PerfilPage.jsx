import { useEffect, useState } from 'react';
import { api } from '../services/api';

const painelStyle = {
  maxWidth: '680px',
  margin: '0 auto',
  padding: 'clamp(1rem, 4vw, 2rem)',
  border: '1px solid #293440',
  borderRadius: '18px',
  background: 'radial-gradient(ellipse at top right, #b8f34a22, transparent 60%), #151c25',
  color: '#ffffff',
  overflowWrap: 'anywhere',
};

const dadosStyle = {
  margin: '1.25rem 0',
  padding: '1rem',
  border: '1px solid #293440',
  borderRadius: '12px',
  background: '#0d1117',
};

const rotuloStyle = {
  color: '#aebaca',
  fontSize: '0.85rem',
};

const valorStyle = {
  margin: '0.3rem 0 0',
  fontWeight: 600,
};

const sairStyle = {
  padding: '0.65rem 1rem',
  border: '1px solid #ff9caa66',
  borderRadius: '8px',
  background: '#2b171e',
  color: '#ffb4bf',
  font: 'inherit',
  fontWeight: 700,
  cursor: 'pointer',
};

export default function PerfilPage({ onLogout }) {
  const [usuario, setUsuario] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    async function carregarPerfil() {
      try {
        const { data } = await api.get('/auth/me');

        if (!ativo) return;

        if (data?.usuario) {
          setUsuario(data.usuario);
        } else {
          setErro('O servidor não retornou os dados da conta.');
        }
      } catch (err) {
        if (ativo) {
          setErro(
            err.response?.data?.erro || 'Não foi possível carregar o perfil.'
          );
        }
      }
    }

    carregarPerfil();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <section aria-labelledby="perfil-titulo" style={painelStyle}>
      
      <h1 id="perfil-titulo" style={{ color: '#ffffff', margin: '0.5rem 0' }}>
        MEU PERFIL
      </h1>

      <p style={{ color: '#aebaca' }}>Consulte os dados da sua conta.</p>

      {erro && <p role="alert" style={{ color: '#ffb4bf' }}>{erro}</p>}
      {!usuario && !erro && <p role="status">Carregando perfil...</p>}

      {usuario && (
        <dl style={dadosStyle}>
          <dt style={rotuloStyle}>Nome</dt>
          <dd style={valorStyle}>{usuario.nome}</dd>

          <dt style={{ ...rotuloStyle, marginTop: '0.85rem' }}>E-mail</dt>
          <dd style={valorStyle}>{usuario.email}</dd>
        </dl>
      )}

      <button type="button" onClick={onLogout} style={sairStyle}>
        Sair da conta
      </button>
    </section>
  );
}
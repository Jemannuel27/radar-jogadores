import { useState, useEffect } from 'react';
import { api } from '../services/api';

const POSICOES = [
  'GOLEIRO', 'ZAGUEIRO', 'LATERAL-DIREITO', 'LATERAL-ESQUERDO',
  'ALA-DIREITO', 'ALA-ESQUERDO', 'VOLANTE', 'MEIO-CAMPISTA',
  'MEIA-ATACANTE', 'PONTA-DIREITA', 'PONTA-ESQUERDA',
  'SEGUNDO ATACANTE', 'CENTROAVANTE',
];

export function PlantelPage() {
  const [jogadores, setJogadores] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [formJogador, setFormJogador] = useState({
    nome: '',
    posicao: '',
    idade: '',
    equipe_id: '',
  });

  const [formClube, setFormClube] = useState({
    nome: '',
    cidade: '',
  });

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    setErro('');

    try {
      const [resJogadores, resEquipes] = await Promise.all([
        api.get('/jogadores'),
        api.get('/equipes'),
      ]);

      setJogadores(
        Array.isArray(resJogadores.data) ? resJogadores.data : []
      );

      setEquipes(
        Array.isArray(resEquipes.data) ? resEquipes.data : []
      );
    } catch (err) {
      console.error(
        'Erro ao carregar dados:',
        err.response?.status,
        err.response?.data || err.message
      );

      if ([401, 403].includes(err.response?.status)) {
        setErro(
          'Sua sessão expirou ou é inválida. Entre novamente na sua conta.'
        );
      } else {
        setErro(
          'Não foi possível carregar os dados. Verifique o servidor e tente novamente.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateClube(e) {
    e.preventDefault();
    setErro('');
    setMensagem('');

    const nome = formClube.nome.trim().toLocaleUpperCase('pt-BR');

    if (!nome) {
      setErro('Informe o nome da equipe.');
      return;
    }

    setSalvando(true);

    try {
      await api.post('/equipes', {
        nome,
        cidade: formClube.cidade.trim().toLocaleUpperCase('pt-BR') || null,
      });

      setFormClube({ nome: '', cidade: '' });
      setMensagem('Equipe cadastrada com sucesso!');

      await carregarDados();
    } catch (err) {
      console.error(
        'Erro ao criar equipe:',
        err.response?.data || err.message
      );

      setErro(
        err.response?.data?.erro ||
        'Não foi possível cadastrar a equipe.'
      );
    } finally {
      setSalvando(false);
    }
  }

  async function handleCreateJogador(e) {
    e.preventDefault();
    setErro('');
    setMensagem('');

    const nome = formJogador.nome.trim().toLocaleUpperCase('pt-BR');
    const posicao = formJogador.posicao.trim();

    if (!nome || !posicao) {
      setErro('Informe o nome e a posição do jogador.');
      return;
    }

    if (!POSICOES.includes(posicao)) {
      setErro('Escolha uma posição da lista.');
      return;
    }

    const idade = formJogador.idade.trim();

    if (
      idade &&
      (!Number.isSafeInteger(Number(idade)) || Number(idade) < 1)
    ) {
      setErro('Informe uma idade inteira a partir de 1.');
      return;
    }

    setSalvando(true);

    try {
      await api.post('/jogadores', {
        nome,
        posicao,
        idade: idade ? Number(idade) : null,
        equipe_id: formJogador.equipe_id
          ? Number(formJogador.equipe_id)
          : null,
      });

      setFormJogador({
        nome: '',
        posicao: '',
        idade: '',
        equipe_id: '',
      });

      setMensagem('Jogador cadastrado com sucesso!');

      await carregarDados();
    } catch (err) {
      console.error(
        'Erro ao criar jogador:',
        err.response?.data || err.message
      );

      setErro(
        err.response?.data?.erro ||
        'Não foi possível cadastrar o jogador.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={pageStyle}>
      <div style={bannerStyle}>
        <div>
         

          <h1 style={{ ...titleStyle, color: '#ffffff' }}>GESTÃO DE PLANTEL</h1>
          <p style={subtitleStyle}>
            Cadastre clubes e atletas e acompanhe a composição do plantel.
          </p>
        </div>

        <div style={countersStyle}>
          <div style={counterCardStyle}>
            <h2 style={counterNumberStyle}>{jogadores.length}</h2>
            <span style={counterLabelStyle}>ATLETAS</span>
          </div>

          <div style={counterCardStyle}>
            <h2 style={counterNumberStyle}>{equipes.length}</h2>
            <span style={counterLabelStyle}>EQUIPES</span>
          </div>
        </div>
      </div>

      {erro && (
        <div role="alert" style={errorStyle}>
          {erro}
          <button
            type="button"
            onClick={() => {
              setErro('');
              carregarDados();
            }}
            style={smallButtonStyle}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {mensagem && (
        <div role="status" style={successStyle}>
          {mensagem}
        </div>
      )}

      <div style={formsGridStyle}>
        <section style={cardStyle}>
          <h3 style={clubTitleStyle}>🛡️ CADASTRO DE CLUBE</h3>

          <form
            onSubmit={handleCreateClube}
            style={formStyle}
          >
            <input
              type="text"
              placeholder="Nome do Clube (ex: Real Madrid)"
              value={formClube.nome}
              onChange={(e) =>
                setFormClube({
                  ...formClube,
                  nome: e.target.value.toLocaleUpperCase('pt-BR'),
                })
              }
              required
              maxLength={100}
              style={inputStyle}
            />

            <input
              type="text"
              placeholder="Cidade / Sede"
              value={formClube.cidade}
              onChange={(e) =>
                setFormClube({
                  ...formClube,
                  cidade: e.target.value.toLocaleUpperCase('pt-BR'),
                })
              }
              maxLength={100}
              style={inputStyle}
            />

            <button
              type="submit"
              disabled={salvando}
              style={{
                ...btnPrimaryStyle,
                opacity: salvando ? 0.6 : 1,
              }}
            >
              {salvando ? 'SALVANDO...' : 'CRIAR CLUBE'}
            </button>
          </form>
        </section>

        <section style={cardStyle}>
          <h3 style={playerTitleStyle}>⭐ CADASTRO DE ATLETA</h3>

          <form
            onSubmit={handleCreateJogador}
            style={formStyle}
          >
            <input
              type="text"
              placeholder="Nome do Jogador"
              value={formJogador.nome}
              onChange={(e) =>
                setFormJogador({
                  ...formJogador,
                  nome: e.target.value.toLocaleUpperCase('pt-BR'),
                })
              }
              required
              maxLength={100}
              style={inputStyle}
            />

            <div style={fieldsRowStyle}>
              <select
                aria-label="Posição do jogador"
                value={formJogador.posicao}
                onChange={(e) =>
                  setFormJogador({
                    ...formJogador,
                    posicao: e.target.value,
                  })
                }
                required
                style={{ ...inputStyle, flex: '1 1 180px', minWidth: 0 }}
              >
                <option value="">Selecione a posição</option>
                {POSICOES.map((posicao) => (
                  <option key={posicao} value={posicao}>{posicao}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Idade"
                aria-label="Idade do jogador (opcional)"
                min="1"
                step="1"
                value={formJogador.idade}
                onChange={(e) =>
                  setFormJogador({
                    ...formJogador,
                    idade: e.target.value,
                  })
                }
                style={{ ...inputStyle, width: '100px' }}
              />
            </div>

            <select
              value={formJogador.equipe_id}
              onChange={(e) =>
                setFormJogador({
                  ...formJogador,
                  equipe_id: e.target.value,
                })
              }
              style={inputStyle}
            >
              <option value="">Vincular a um clube (opcional)</option>

              {equipes.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nome}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={salvando}
              style={{
                ...btnOrangeStyle,
                opacity: salvando ? 0.6 : 1,
              }}
            >
              {salvando ? 'SALVANDO...' : 'CADASTRAR ATLETA'}
            </button>
          </form>
        </section>
      </div>

      <section style={cardStyle}>
        <div style={listHeaderStyle}>
          <h3 style={listTitleStyle}>ATLETAS CADASTRADOS</h3>

          <button
            type="button"
            onClick={carregarDados}
            disabled={loading}
            style={refreshButtonStyle}
          >
            {loading ? 'Carregando...' : '↻ Atualizar lista'}
          </button>
        </div>

        {loading ? (
          <div style={emptyStyle}>Carregando jogadores e equipes...</div>
        ) : jogadores.length === 0 ? (
          <div style={emptyStyle}>
            Nenhum atleta encontrado. Use o formulário acima para cadastrar
            o primeiro jogador.
          </div>
        ) : (
          <div style={playersGridStyle}>
            {jogadores.map((j) => (
              <article key={j.id} style={playerCardStyle}>
                <div style={playerAvatarStyle}>
                  {j.nome?.trim()?.charAt(0)?.toUpperCase() || '?'}
                </div>

                <h4 style={playerNameStyle}>{j.nome}</h4>

                <p style={playerInfoStyle}>
                  Posição: {j.posicao || 'Não informada'}
                </p>

                <p style={playerInfoStyle}>
                  Idade: {j.idade ?? 'Não informada'}
                </p>

                <p style={teamInfoStyle}>
                  Clube: {j.equipe_nome || 'Sem equipe'}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const pageStyle = {
  color: '#fff',
  width: '100%',
  boxSizing: 'border-box',
};

const bannerStyle = {
  background: 'radial-gradient(ellipse at top right, #b8f34a26, transparent 60%), #131d1c',
  border: '1px solid #293440',
  borderRadius: '12px',
  padding: '2rem',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1.5rem',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
};

const badgeStyle = {
  display: 'inline-block',
  backgroundColor: '#b8f34a',
  color: '#000',
  fontWeight: 'bold',
  fontSize: '0.75rem',
  padding: '0.3rem 0.6rem',
  borderRadius: '4px',
};

const titleStyle = {
  margin: '0.7rem 0',
  fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
  letterSpacing: '1px',
};

const subtitleStyle = {
  color: '#aebaca',
  margin: 0,
  lineHeight: 1.6,
};

const countersStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
};

const counterCardStyle = {
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '1rem 1.5rem',
  borderRadius: '8px',
  textAlign: 'center',
  minWidth: '75px',
};

const counterNumberStyle = {
  margin: 0,
  color: '#7cbfff',
  fontSize: '1.8rem',
  fontFamily: 'Rajdhani, system-ui, sans-serif',
};

const counterLabelStyle = {
  fontSize: '0.75rem',
  color: '#aebaca',
  fontWeight: 'bold',
};

const formsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
  gap: '1.5rem',
  marginBottom: '2rem',
};

const cardStyle = {
  backgroundColor: '#151c25',
  border: '1px solid #293440',
  borderRadius: '10px',
  padding: '1.5rem',
  marginBottom: '1.5rem',
  minWidth: 0,
};

const clubTitleStyle = {
  color: '#7cbfff',
  marginTop: 0,
  fontSize: '1.1rem',
};

const playerTitleStyle = {
  color: '#b8f34a',
  marginTop: 0,
  fontSize: '1.1rem',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const inputStyle = {
  boxSizing: 'border-box',
  width: '100%',
  backgroundColor: '#0d1117',
  border: '1px solid #293440',
  color: '#fff',
  padding: '0.85rem',
  borderRadius: '6px',
  colorScheme: 'dark',
};

const fieldsRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
};

const btnPrimaryStyle = {
  backgroundColor: '#0088cc',
  color: '#fff',
  border: 'none',
  padding: '0.9rem',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const btnOrangeStyle = {
  backgroundColor: '#b8f34a',
  color: '#101608',
  border: 'none',
  padding: '0.9rem',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const errorStyle = {
  backgroundColor: '#55202a',
  border: '1px solid #e63946',
  color: '#fff',
  padding: '1rem',
  borderRadius: '6px',
  marginBottom: '1.5rem',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
};

const successStyle = {
  backgroundColor: '#103d32',
  border: '1px solid #20a779',
  color: '#b6ffe1',
  padding: '1rem',
  borderRadius: '6px',
  marginBottom: '1.5rem',
};

const smallButtonStyle = {
  backgroundColor: '#151c25',
  color: '#fff',
  border: '1px solid #667085',
  borderRadius: '5px',
  padding: '0.5rem 0.75rem',
  cursor: 'pointer',
};

const listHeaderStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem',
  marginBottom: '1.5rem',
};

const listTitleStyle = {
  margin: 0,
  letterSpacing: '1px',
};

const refreshButtonStyle = {
  backgroundColor: '#171e37',
  color: '#7cbfff',
  border: '1px solid #26365d',
  borderRadius: '6px',
  padding: '0.6rem 0.9rem',
  cursor: 'pointer',
};

const emptyStyle = {
  textAlign: 'center',
  padding: '3rem 1rem',
  color: '#aebaca',
  backgroundColor: '#0d1117',
  borderRadius: '8px',
  lineHeight: 1.6,
};

const playersGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 230px), 1fr))',
  gap: '1rem',
};

const playerCardStyle = {
  backgroundColor: '#0d1117',
  border: '1px solid #293440',
  padding: '1.2rem',
  borderRadius: '8px',
  overflowWrap: 'anywhere',
};

const playerAvatarStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '46px',
  height: '46px',
  borderRadius: '50%',
  backgroundColor: '#182441',
  color: '#7cbfff',
  fontSize: '1.3rem',
  fontWeight: 'bold',
  marginBottom: '0.8rem',
};

const playerNameStyle = {
  margin: '0 0 0.8rem',
  color: '#b8f34a',
  fontSize: '1.05rem',
};

const playerInfoStyle = {
  margin: '0.4rem 0',
  color: '#aebaca',
  fontSize: '0.9rem',
};

const teamInfoStyle = {
  margin: '0.4rem 0',
  color: '#7cbfff',
  fontSize: '0.9rem',
};

export default PlantelPage;

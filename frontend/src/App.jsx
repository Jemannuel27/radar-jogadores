import { useEffect, useState } from 'react';
import PerfilPage from './pages/PerfilPage';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import PlantelPage from './pages/PlantelPage';
import PartidasPage from './pages/PartidasPage';
import DashboardPage from './pages/DashboardPage';
import ComparacaoPage from './pages/ComparacaoPage';
import RelatorioIaPage from './pages/RelatorioIaPage';
import radarLogo from './assets/radar-logo.png';
import { api } from './services/api';
import './App.css';
import './InicioPage.css';

function PaginaInicial({ onEntrar, onCadastrar }) {
  return (
    <div className="inicio-radar">
      <header className="inicio-header">
        <img src={radarLogo} alt="Radar Scout" />

        <nav
          className="inicio-menu"
          aria-label="Navegação da apresentação"
        >
          <a href="#como-funciona">Como funciona</a>
          <a href="#recursos">Recursos</a>
          <a href="#sobre">Sobre o projeto</a>
        </nav>
      </header>

      <main className="inicio-conteudo">
        <section className="inicio-hero">
          <div>
            <h1>
              Encontre os números.
              <span>Entenda o desempenho.</span>
            </h1>

            <p>
              Explore atuações, compare jogadores e organize suas
              análises em relatórios. Escolha os atletas e as partidas
              para acompanhar cada comparação.
            </p>

            <div className="inicio-acoes">
              <button
                type="button"
                className="inicio-destaque"
                onClick={onCadastrar}
              >
                Começar agora
              </button>

              <button type="button" onClick={onEntrar}>
                Já tenho uma conta
              </button>
            </div>
          </div>

          <article className="inicio-previa">
            <div className="previa-cabecalho">
              <h2>Compare além do placar</h2>
              <span>Prévia ilustrativa</span>
            </div>

            <div className="previa-atletas">
              <div>
                <strong>Atleta A</strong>
                <span>Meio-campista</span>
              </div>

              <span className="previa-versus">×</span>

              <div>
                <strong>Atleta B</strong>
                <span>Meio-campista</span>
              </div>
            </div>

            <div className="previa-tabela">
              <table>
                <caption>
                  Exemplo visual de indicadores por partida
                </caption>

                <thead>
                  <tr>
                    <th scope="col">Indicador</th>
                    <th scope="col">Atleta A</th>
                    <th scope="col">Atleta B</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <th scope="row">Passes completos</th>
                    <td className="previa-maior">62</td>
                    <td>54</td>
                  </tr>

                  <tr>
                    <th scope="row">Desarmes ganhos</th>
                    <td>3</td>
                    <td className="previa-maior">5</td>
                  </tr>

                  <tr>
                    <th scope="row">Interceptações</th>
                    <td className="previa-maior">4</td>
                    <td>2</td>
                  </tr>

                  <tr>
                    <th scope="row">Dribles completos</th>
                    <td>2</td>
                    <td className="previa-maior">4</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <small>
              Valores ilustrativos. O destaque indica o maior total
              em cada linha.
            </small>
          </article>
        </section>

        <section
          id="como-funciona"
          className="inicio-explicacao"
          aria-labelledby="como-funciona-titulo"
        >
          <h2 id="como-funciona-titulo">Da busca ao relatório</h2>

          <ol className="inicio-etapas">
            <li>
              <h3>Busque os jogadores</h3>
              <p>
                Encontre dois atletas pelo nome entre os registros
                disponíveis no catálogo.
              </p>
            </li>

            <li>
              <h3>Escolha as partidas</h3>
              <p>
                Selecione uma atuação para cada jogador e consulte
                seus indicadores lado a lado.
              </p>
            </li>

            <li>
              <h3>Salve a comparação</h3>
              <p>
                Gere um relatório estatístico e baixe o resultado
                em TXT.
              </p>
            </li>
          </ol>
        </section>

        <section
          id="recursos"
          className="inicio-recursos"
          aria-label="Funcionalidades"
        >
          <article>
            <h2>Encontre atletas</h2>
            <p>
              Pesquise pelo nome entre os jogadores disponíveis
              no catálogo integrado.
            </p>
          </article>

          <article>
            <h2>Compare atuações</h2>
            <p>
              Selecione uma partida para cada atleta e consulte
              os indicadores lado a lado.
            </p>
          </article>

          <article>
            <h2>Guarde os resultados</h2>
            <p>
              Gere relatórios estatísticos, consulte o histórico
              e baixe suas comparações em TXT.
            </p>
          </article>
        </section>

        <section
          id="sobre"
          className="inicio-sobre"
          aria-labelledby="sobre-titulo"
        >
          <h2 id="sobre-titulo">Sobre o Radar Scout</h2>

          <p>
            Desenvolvido como projeto de conclusão do curso de
            Engenharia de Software, o Radar Scout reúne busca de
            atletas, comparação de partidas e relatórios estatísticos
            em uma plataforma web. As consultas utilizam os registros
            disponíveis no catálogo integrado, com identificação
            dos jogos analisados.
          </p>
        </section>
      </main>

      <footer className="inicio-footer">
        Radar Scout · Análise de desempenho no futebol
      </footer>
    </div>
  );
}

export function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem('token') || null
  );
  const [activeTab, setActiveTab] = useState('plantel');
  const [telaPublica, setTelaPublica] = useState('inicio');

  function handleLoginSuccess(newToken) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setActiveTab('plantel');
    setTelaPublica('inicio');
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setToken(null);
    setActiveTab('plantel');
    setTelaPublica('inicio');
  }

  useEffect(() => {
    if (!token) return;

    let ativo = true;

    async function verificarSessao() {
      try {
        await api.get('/jogadores');
      } catch (err) {
        if (!ativo) return;

        if ([401, 403].includes(err.response?.status)) {
          localStorage.removeItem('token');
          setToken(null);
        } else if (!err.response) {
          console.error(
            'Não foi possível conectar ao backend:',
            err.message
          );
        }
      }
    }

    verificarSessao();

    return () => {
      ativo = false;
    };
  }, [token]);

  if (!token) {
    if (telaPublica === 'inicio') {
      return (
        <PaginaInicial
          onEntrar={() => setTelaPublica('login')}
          onCadastrar={() => setTelaPublica('cadastro')}
        />
      );
    }

    return (
      <div className="acesso-publico">
        <button
          type="button"
          className="voltar-inicio"
          onClick={() => setTelaPublica('inicio')}
        >
          ← Voltar ao início
        </button>

        <AuthPage
          key={telaPublica}
          initialIsLogin={telaPublica === 'login'}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="main-content">
        <div
          style={{
            display: activeTab === 'plantel' ? 'block' : 'none',
          }}
        >
          <PlantelPage />
        </div>

        <div
          style={{
            display: activeTab === 'partidas' ? 'block' : 'none',
          }}
        >
          <PartidasPage />
        </div>

        <div
          style={{
            display: activeTab === 'dashboard' ? 'block' : 'none',
          }}
        >
          <DashboardPage />
        </div>

        <div
          style={{
            display: activeTab === 'comparacao' ? 'block' : 'none',
          }}
        >
          <ComparacaoPage />
        </div>

        <div
          style={{
            display: activeTab === 'relatorios' ? 'block' : 'none',
          }}
        >
          <RelatorioIaPage />
        </div>

        {activeTab === 'perfil' && (
          <PerfilPage onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
}

export default App;
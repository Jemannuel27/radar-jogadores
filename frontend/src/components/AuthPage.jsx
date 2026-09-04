import { useState } from 'react';
import './AuthPage.css';

function AuthPage({ onLogin }) {
  const [modo, setModo] = useState('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const alternarModo = () => {
    setModo(modo === 'login' ? 'cadastro' : 'login');
    setErro('');
    setSenha('');
    setConfirmarSenha('');
  };

  const enviar = async (e) => {
    e.preventDefault();
    setErro('');

    if (modo === 'cadastro' && senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);
    try {
      const resposta = await fetch(`http://localhost:3000/auth/${modo === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          modo === 'login'
            ? { email, senha }
            : { nome, email, senha }
        ),
      });

      const data = await resposta.json();
      if (!resposta.ok) {
        throw new Error(data.erro || 'Não foi possível realizar a operação.');
      }

      onLogin(data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="auth-ball">⚽</span>
          <span>RADAR DE JOGADORES</span>
        </div>

        <div className="auth-badge">ULTIMATE SCOUT 26</div>
        <h1>{modo === 'login' ? 'Bem-vindo de volta' : 'Criar sua conta'}</h1>
        <p className="auth-subtitle">
          {modo === 'login'
            ? 'Entre para gerenciar seus atletas e equipes.'
            : 'Cadastre-se para começar a montar seu radar.'}
        </p>

        <form onSubmit={enviar} className="auth-form">
          {modo === 'cadastro' && (
            <label>
              Nome completo
              <input
                type="text"
                placeholder="Ex: João Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </label>
          )}

          <label>
            E-mail
            <input
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              placeholder="Mínimo de 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={6}
              required
            />
          </label>

          {modo === 'cadastro' && (
            <label>
              Confirmar senha
              <input
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                minLength={6}
                required
              />
            </label>
          )}

          {erro && <div className="auth-error">⚠️ {erro}</div>}

          <button type="submit" disabled={carregando}>
            {carregando
              ? 'AGUARDE...'
              : modo === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
          </button>
        </form>

        <div className="auth-switch">
          {modo === 'login' ? 'Ainda não possui uma conta?' : 'Já possui uma conta?'}
          <button type="button" onClick={alternarModo}>
            {modo === 'login' ? 'Cadastre-se' : 'Fazer login'}
          </button>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;

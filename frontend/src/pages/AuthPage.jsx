
import { useState } from 'react';
import { api } from '../services/api';
import './AuthPage.css';
import radarLogo from '../assets/radar-logo.png';

export function AuthPage({ onLoginSuccess, initialIsLogin = true }) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';

      const payload = isLogin
        ? { email: email.trim(), senha }
        : { nome: nome.trim(), email: email.trim(), senha };

      const res = await api.post(endpoint, payload);

      if (isLogin) {
        const token = res.data?.token;

        if (!token || typeof token !== 'string') {
          setErro('O servidor não retornou um token válido.');
          return;
        }

        // Salva o token usado pelo interceptor do api.js.
        localStorage.setItem('token', token);

        // Informa ao aplicativo que o login foi concluído.
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(token);
        } else {
          setErro(
            'Login realizado, mas a navegação do aplicativo não foi configurada.'
          );
        }
      } else {
        setNome('');
        setSenha('');
        setIsLogin(true);
        setErro('');
        alert('Cadastro realizado com sucesso! Agora entre com sua conta.');
      }
    } catch (err) {
      console.error(
        'Erro na autenticação:',
        err.response?.status,
        err.response?.data || err.message
      );

      setErro(
        err.response?.data?.erro ||
        'Falha ao autenticar. Verifique suas credenciais e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <img
  className="auth-brand-image"
  src={radarLogo}
  alt="Radar Scout"
/>
          <p>
            {isLogin
              ? 'Acesse o painel de gerenciamento'
              : 'Crie sua conta para acessar'}
          </p>
        </div>

        {erro && (
          <div className="auth-error-box" role="alert">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                type="text"
                placeholder="Ex: João Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? 'PROCESSANDO...'
              : isLogin
                ? 'ENTRAR NO SISTEMA'
                : 'CRIAR CONTA'}
          </button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            className="auth-switch-btn"
            onClick={() => {
              setIsLogin((atual) => !atual);
              setErro('');
            }}
          >
            {isLogin
              ? 'Não tem uma conta? Cadastre-se'
              : 'Já possui conta? Faça Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

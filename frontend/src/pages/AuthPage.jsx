import React, { useState } from 'react';
import { api } from '../services/api';
import './AuthPage.css';

export function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
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
      const payload = isLogin ? { email, senha } : { nome, email, senha };

      const res = await api.post(endpoint, payload);

      if (isLogin) {
        if (res.data && res.data.token) {
          onLoginSuccess(res.data.token);
        } else {
          setErro('Token não retornado pelo servidor.');
        }
      } else {
        alert('Cadastro realizado com sucesso! Faça login para continuar.');
        setIsLogin(true);
      }
    } catch (err) {
      console.error('Erro na autenticação:', err);
      const mensagem = err.response?.data?.erro || 'Falha ao autenticar. Verifique suas credenciais.';
      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">⚽</span>
          <h2>RADAR DE JOGADORES</h2>
          <p>{isLogin ? 'Acesse o painel de gerenciamento' : 'Crie sua conta para acessar'}</p>
        </div>

        {erro && <div className="auth-error-box">{erro}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Nome Completo</label>
              <input
                type="text"
                placeholder="Ex: João Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'PROCESSANDO...' : isLogin ? 'ENTRAR NO SISTEMA' : 'CRIAR CONTA'}
          </button>
        </form>

        <div className="auth-footer">
          <button 
            type="button" 
            className="auth-switch-btn" 
            onClick={() => {
              setIsLogin(!isLogin);
              setErro('');
            }}
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já possui conta? Faça Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
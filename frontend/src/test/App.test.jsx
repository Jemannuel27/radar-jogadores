
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';

vi.mock('../components/Navbar', () => ({
  default: ({ onLogout }) => (
    <nav>
      <button onClick={onLogout}>Sair</button>
    </nav>
  ),
}));

vi.mock('../pages/AuthPage', () => ({
  default: ({ onLoginSuccess }) => (
    <div>
      <h1>Tela de Login/Cadastro</h1>
      <button onClick={() => onLoginSuccess('token-teste')}>
        Entrar
      </button>
    </div>
  ),
}));

vi.mock('../pages/PlantelPage', () => ({
  default: () => <h2>Plantel de jogadores</h2>,
}));

vi.mock('../pages/PartidasPage', () => ({
  default: () => <h2>Partidas</h2>,
}));

vi.mock('../pages/DashboardPage', () => ({
  default: () => <h2>Dashboard</h2>,
}));

vi.mock('../pages/ComparacaoPage', () => ({
  default: () => <h2>Comparação de jogadores</h2>,
}));

vi.mock('../pages/RelatorioIaPage', () => ({
  default: () => <h2>Relatórios</h2>,
}));

describe('Autenticação do Radar de Jogadores', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve mostrar Login/Cadastro quando não existe token', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', {
        name: 'Tela de Login/Cadastro',
      }),
    ).toBeInTheDocument();
  });

  it('deve salvar o token e abrir o sistema após o login', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(localStorage.getItem('token')).toBe('token-teste');

    expect(
      screen.getByRole('heading', { name: 'Plantel de jogadores' }),
    ).toBeInTheDocument();
  });

  it('deve remover o token e voltar para Login/Cadastro ao sair', () => {
    localStorage.setItem('token', 'token-existente');

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));

    expect(localStorage.getItem('token')).toBeNull();

    expect(
      screen.getByRole('heading', {
        name: 'Tela de Login/Cadastro',
      }),
    ).toBeInTheDocument();
  });
});

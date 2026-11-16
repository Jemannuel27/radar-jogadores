
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AuthPage from '../pages/AuthPage';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('Testes do Login e Cadastro', () => {
  const onLoginSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve exibir os campos obrigatórios do login', () => {
    render(<AuthPage onLoginSuccess={onLoginSuccess} />);

    expect(screen.getByPlaceholderText('seuemail@exemplo.com')).toBeRequired();
    expect(screen.getByPlaceholderText('••••••••')).toBeRequired();
    expect(
      screen.getByRole('button', { name: 'ENTRAR NO SISTEMA' }),
    ).toBeInTheDocument();
  });

  it('deve enviar e-mail e senha para o endpoint de login', async () => {
    api.post.mockResolvedValue({
      data: { token: 'token-valido' },
    });

    render(<AuthPage onLoginSuccess={onLoginSuccess} />);

    fireEvent.change(screen.getByPlaceholderText('seuemail@exemplo.com'), {
      target: { value: 'teste@email.com' },
    });

    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'senha123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'ENTRAR NO SISTEMA' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'teste@email.com',
        senha: 'senha123',
      });

      expect(onLoginSuccess).toHaveBeenCalledWith('token-valido');
    });
  });

  it('deve exibir erro quando o servidor não retorna um token', async () => {
    api.post.mockResolvedValue({ data: {} });

    render(<AuthPage onLoginSuccess={onLoginSuccess} />);

    fireEvent.change(screen.getByPlaceholderText('seuemail@exemplo.com'), {
      target: { value: 'teste@email.com' },
    });

    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'senha123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'ENTRAR NO SISTEMA' }));

    expect(
      await screen.findByText('Token não retornado pelo servidor.'),
    ).toBeInTheDocument();

    expect(onLoginSuccess).not.toHaveBeenCalled();
  });

  it('deve exibir a mensagem de erro retornada pela API', async () => {
    api.post.mockRejectedValue({
      response: {
        data: { erro: 'Credenciais inválidas.' },
      },
    });

    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<AuthPage onLoginSuccess={onLoginSuccess} />);

    fireEvent.change(screen.getByPlaceholderText('seuemail@exemplo.com'), {
      target: { value: 'teste@email.com' },
    });

    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'senha-errada' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'ENTRAR NO SISTEMA' }));

    expect(
      await screen.findByText('Credenciais inválidas.'),
    ).toBeInTheDocument();
  });

  it('deve enviar nome, e-mail e senha no cadastro', async () => {
    api.post.mockResolvedValue({ data: {} });

    vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AuthPage onLoginSuccess={onLoginSuccess} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Não tem uma conta? Cadastre-se' }),
    );

    fireEvent.change(screen.getByPlaceholderText('Ex: João Silva'), {
      target: { value: 'João Silva' },
    });

    fireEvent.change(screen.getByPlaceholderText('seuemail@exemplo.com'), {
      target: { value: 'joao@email.com' },
    });

    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'senha123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'CRIAR CONTA' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        nome: 'João Silva',
        email: 'joao@email.com',
        senha: 'senha123',
      });
    });

    expect(window.alert).toHaveBeenCalledWith(
      'Cadastro realizado com sucesso! Faça login para continuar.',
    );

    expect(
      screen.getByRole('button', { name: 'ENTRAR NO SISTEMA' }),
    ).toBeInTheDocument();
  });
});

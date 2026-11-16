
import { describe, it, expect } from 'vitest';

describe('Testes iniciais do Radar de Jogadores', () => {
  it('deve executar os testes automatizados', () => {
    expect(1 + 1).toBe(2);
  });

  it('deve identificar um jogador com nome válido', () => {
    const jogador = {
      nome: 'Vinicius Junior',
      idade: 25,
      posicao: 'Atacante',
    };

    expect(jogador.nome).toBeTruthy();
    expect(jogador.idade).toBeGreaterThan(0);
    expect(jogador.posicao).toBe('Atacante');
  });
});


import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const express = require('express');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const proxyquire = require('proxyquire').noCallThru();

const pool = {
  query: vi.fn(),
};

// Carrega o controlador com o banco simulado.
const authController = proxyquire(
  '../src/controllers/authController.js',
  {
    '../config/db.js': pool,
    '../config/db': pool,
  }
);

const app = express();
app.use(express.json());
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);

describe('Testes de autenticação', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'segredo-de-teste-radar';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('cadastro deve rejeitar campos obrigatórios ausentes', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'ana@email.com' });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe(
      'Preencha todos os campos obrigatórios.'
    );
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('cadastro deve rejeitar e-mail já cadastrado', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: 'ana@email.com' }],
    });

    const res = await request(app)
      .post('/auth/register')
      .send({
        nome: 'Ana',
        email: 'ana@email.com',
        senha: 'senha123',
      });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe('E-mail já cadastrado.');
  });

  test('cadastro deve armazenar a senha criptografada', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ id: 2, nome: 'Ana', email: 'ana@email.com' }],
      });

    const res = await request(app)
      .post('/auth/register')
      .send({
        nome: 'Ana',
        email: 'ana@email.com',
        senha: 'senha123',
      });

    expect(res.status).toBe(201);
    expect(res.body.usuario.email).toBe('ana@email.com');

    const parametros = pool.query.mock.calls[1][1];

    expect(parametros[0]).toBe('Ana');
    expect(parametros[1]).toBe('ana@email.com');
    expect(parametros[2]).not.toBe('senha123');

    await expect(
      bcrypt.compare('senha123', parametros[2])
    ).resolves.toBe(true);
  });

  test('login deve rejeitar campos obrigatórios ausentes', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'ana@email.com' });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe(
      'E-mail e senha são obrigatórios.'
    );
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('login deve rejeitar usuário inexistente', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'inexistente@email.com',
        senha: 'senha123',
      });

    expect(res.status).toBe(401);
    expect(res.body.erro).toBe(
      'E-mail ou senha incorretos.'
    );
  });

  test('login deve rejeitar senha incorreta', async () => {
    const senhaHash = await bcrypt.hash('senha-correta', 10);

    pool.query.mockResolvedValueOnce({
      rows: [{
        id: 1,
        nome: 'Ana',
        email: 'ana@email.com',
        senha: senhaHash,
      }],
    });

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'ana@email.com',
        senha: 'senha-errada',
      });

    expect(res.status).toBe(401);
    expect(res.body.erro).toBe(
      'E-mail ou senha incorretos.'
    );
  });

  test('login deve retornar JWT com credenciais válidas', async () => {
    const senhaHash = await bcrypt.hash('senha123', 10);

    pool.query.mockResolvedValueOnce({
      rows: [{
        id: 1,
        nome: 'Ana',
        email: 'ana@email.com',
        senha: senhaHash,
      }],
    });

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'ana@email.com',
        senha: 'senha123',
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();

    const payload = jwt.verify(
      res.body.token,
      process.env.JWT_SECRET
    );

    expect(payload.id).toBe(1);
    expect(payload.email).toBe('ana@email.com');
    expect(res.body.usuario.senha).toBeUndefined();
  });
});

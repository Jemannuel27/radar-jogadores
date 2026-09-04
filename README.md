# Radar de Jogadores

## Login e cadastro

O projeto agora possui autenticação com cadastro, login, sessão persistida no navegador e proteção das rotas de jogadores/equipes.

### 1. Banco de dados

Execute o conteúdo de `database/init.sql` no PostgreSQL para criar a tabela `usuarios` (e manter as tabelas existentes).

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

O backend roda em `http://localhost:3000`.

As configurações do PostgreSQL podem ser definidas por variáveis de ambiente. Veja `backend/.env.example`.

### 3. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite.

### Fluxo

- Primeiro acesso: tela de Login/Cadastro.
- Cadastro cria o usuário e inicia a sessão.
- Login cria uma sessão de 24 horas.
- Jogadores e equipes só podem ser acessados com autenticação.
- O botão `SAIR` encerra a sessão no navegador.

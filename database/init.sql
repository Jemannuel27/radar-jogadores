-- Usuários do sistema
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de Equipes
CREATE TABLE IF NOT EXISTS equipes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cidade VARCHAR(100),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de Jogadores
CREATE TABLE IF NOT EXISTS jogadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    posicao VARCHAR(50) NOT NULL,
    idade INT,
    equipe_id INT REFERENCES equipes(id) ON DELETE SET NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Partidas Completa
CREATE TABLE IF NOT EXISTS partidas (
    id SERIAL PRIMARY KEY,
    equipe_id INT REFERENCES equipes(id) ON DELETE CASCADE,
    adversario VARCHAR(100) NOT NULL,
    data_partida TIMESTAMP NOT NULL,
    competicao VARCHAR(100),
    local_partida VARCHAR(20) CHECK (local_partida IN ('Casa', 'Fora')),
    gols_pro INT DEFAULT 0,
    gols_contra INT DEFAULT 0,
    status_partida VARCHAR(20) DEFAULT 'Agendada' CHECK (status_partida IN ('Agendada', 'Em andamento', 'Finalizada')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Tabela de Estatísticas Individuais Detalhada por Partida
CREATE TABLE IF NOT EXISTS estatisticas_partida (
    id SERIAL PRIMARY KEY,
    partida_id INT REFERENCES partidas(id) ON DELETE CASCADE,
    jogador_id INT REFERENCES jogadores(id) ON DELETE CASCADE,
    gols INT DEFAULT 0,
    assistencias INT DEFAULT 0,
    finalizacoes INT DEFAULT 0,
    passes_certos INT DEFAULT 0,
    passes_errados INT DEFAULT 0,
    desarmes INT DEFAULT 0,
    interceptacoes INT DEFAULT 0,
    cartoes_amarelos INT DEFAULT 0,
    cartoes_vermelhos INT DEFAULT 0,
    minutos_jogados INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
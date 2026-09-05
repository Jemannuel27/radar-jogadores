-- =============================================================================
-- INICIALIZAÇÃO DO BANCO DE DADOS - RADAR DE JOGADORES (ULTIMATE SCOUT)
-- =============================================================================

-- Limpeza preventiva de estruturas existentes (em ordem reversa de dependência)
DROP TABLE IF EXISTS estatisticas_partida CASCADE;
DROP TABLE IF EXISTS partidas CASCADE;
DROP TABLE IF EXISTS jogadores CASCADE;
DROP TABLE IF EXISTS equipes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- =============================================================================
-- 1. FUNÇÃO GENÉRICA DE TRIGGER PARA 'updated_at'
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 2. TABELA DE USUÁRIOS
-- =============================================================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_usuarios
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. TABELA DE EQUIPES (CLUBES)
-- =============================================================================
CREATE TABLE equipes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cidade VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_equipes
BEFORE UPDATE ON equipes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 4. TABELA DE JOGADORES (ATLETAS)
-- =============================================================================
CREATE TABLE jogadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    posicao VARCHAR(50) NOT NULL,
    idade INT CHECK (idade > 0 AND idade < 60),
    equipe_id INT REFERENCES equipes(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_jogadores
BEFORE UPDATE ON jogadores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índice de performance para consultas de jogadores por clube
CREATE INDEX idx_jogadores_equipe_id ON jogadores(equipe_id);

-- =============================================================================
-- 5. TABELA DE PARTIDAS
-- =============================================================================
CREATE TABLE partidas (
    id SERIAL PRIMARY KEY,
    data_partida DATE NOT NULL,
    equipe_mandante_id INT REFERENCES equipes(id) ON DELETE CASCADE,
    equipe_visitante_id INT REFERENCES equipes(id) ON DELETE CASCADE,
    gols_mandante INT DEFAULT 0 CHECK (gols_mandante >= 0),
    gols_visitante INT DEFAULT 0 CHECK (gols_visitante >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_equipes_diferentes CHECK (equipe_mandante_id <> equipe_visitante_id)
);

CREATE TRIGGER set_timestamp_partidas
BEFORE UPDATE ON partidas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices de performance para cruzamento de partidas
CREATE INDEX idx_partidas_equipe_mandante ON partidas(equipe_mandante_id);
CREATE INDEX idx_partidas_equipe_visitante ON partidas(equipe_visitante_id);

-- =============================================================================
-- 6. TABELA DE ESTATÍSTICAS DE PARTIDA
-- =============================================================================
CREATE TABLE estatisticas_partida (
    id SERIAL PRIMARY KEY,
    partida_id INT NOT NULL REFERENCES partidas(id) ON DELETE CASCADE,
    jogador_id INT NOT NULL REFERENCES jogadores(id) ON DELETE CASCADE,
    gols INT DEFAULT 0 CHECK (gols >= 0),
    assistencias INT DEFAULT 0 CHECK (assistencias >= 0),
    finalizacoes INT DEFAULT 0 CHECK (finalizacoes >= 0),
    passes_certos INT DEFAULT 0 CHECK (passes_certos >= 0),
    desarmes INT DEFAULT 0 CHECK (desarmes >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Restrição de integridade: Impede cadastrar estatísticas duplicadas para o mesmo atleta na mesma partida
    CONSTRAINT uq_partida_jogador UNIQUE (partida_id, jogador_id)
);

CREATE TRIGGER set_timestamp_estatisticas_partida
BEFORE UPDATE ON estatisticas_partida
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para agilizar buscas e relatórios analíticos/IA
CREATE INDEX idx_estatisticas_partida_id ON estatisticas_partida(partida_id);
CREATE INDEX idx_estatisticas_jogador_id ON estatisticas_partida(jogador_id);
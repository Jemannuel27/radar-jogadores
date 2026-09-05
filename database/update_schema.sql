-- =============================================================================
-- 1. RESTRIÇÃO DE ESTATÍSTICA ÚNICA POR JOGADOR EM UMA PARTIDA
-- =============================================================================
-- Impede que o mesmo jogador receba mais de um registro de estatística na mesma partida
ALTER TABLE estatisticas_partida
ADD CONSTRAINT uq_partida_jogador UNIQUE (partida_id, jogador_id);


-- =============================================================================
-- 2. ADICIONAR COLUNA 'updated_at' E CRIAR TRIGGERS AUTOMÁTICAS
-- =============================================================================
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE equipes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE jogadores ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE estatisticas_partida ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Função genérica para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicação das Triggers
DROP TRIGGER IF EXISTS set_timestamp_usuarios ON usuarios;
CREATE TRIGGER set_timestamp_usuarios BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_timestamp_equipes ON equipes;
CREATE TRIGGER set_timestamp_equipes BEFORE UPDATE ON equipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_timestamp_jogadores ON jogadores;
CREATE TRIGGER set_timestamp_jogadores BEFORE UPDATE ON jogadores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_timestamp_partidas ON partidas;
CREATE TRIGGER set_timestamp_partidas BEFORE UPDATE ON partidas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_timestamp_estatisticas ON estatisticas_partida;
CREATE TRIGGER set_timestamp_estatisticas BEFORE UPDATE ON estatisticas_partida FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =============================================================================
-- 3. ÍNDICES DE PERFORMANCE NAS CHAVES ESTRANGEIRAS
-- =============================================================================
-- Jogadores por equipe
CREATE INDEX IF NOT EXISTS idx_jogadores_equipe_id ON jogadores(equipe_id);

-- Partidas por equipe
CREATE INDEX IF NOT EXISTS idx_partidas_equipe_id ON partidas(equipe_id);

-- Estatísticas por partida e por jogador
CREATE INDEX IF NOT EXISTS idx_estatisticas_partida_id ON estatisticas_partida(partida_id);
CREATE INDEX IF NOT EXISTS idx_estatisticas_jogador_id ON estatisticas_partida(jogador_id);
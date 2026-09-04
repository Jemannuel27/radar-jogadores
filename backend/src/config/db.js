const { Pool } = require('pg');

// Configuração da conexão com o PostgreSQL
// (Ajuste a senha e o usuário de acordo com o que você configurou no seu computador)
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'radar_jogadores',
    password: 'jemannuel10', 
    port: 5432,
});

module.exports = pool;
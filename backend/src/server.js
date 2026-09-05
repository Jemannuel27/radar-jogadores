const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const partidaRoutes = require('./routes/partidaRoutes');
// ... logo abaixo das outras rotas (como equipes ou jogadores):
app.use('/api/partidas', partidaRoutes);

const estatisticaRoutes = require('./routes/estatisticaRoutes');
app.use('/api/estatisticas', estatisticaRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

const iaRoutes = require('./routes/iaRoutes');
app.use('/api/ia', iaRoutes);

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'radar_jogadores',
    password: process.env.DB_PASSWORD || 'jemannuel10',
    port: Number(process.env.DB_PORT || 5432),
});

const JWT_SECRET = process.env.JWT_SECRET || 'radar-jogadores-dev-secret-troque-em-producao';

// ---------------- AUTENTICAÇÃO ----------------
function base64url(value) {
    return Buffer.from(value).toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function createToken(user) {
    const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = base64url(JSON.stringify({
        id: user.id,
        nome: user.nome,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
    }));
    const signature = crypto.createHmac('sha256', JWT_SECRET)
        .update(`${header}.${payload}`)
        .digest('base64url');
    return `${header}.${payload}.${signature}`;
}

function verifyToken(token) {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) throw new Error('Token inválido');

    const expected = crypto.createHmac('sha256', JWT_SECRET)
        .update(`${header}.${payload}`)
        .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
        throw new Error('Assinatura inválida');
    }

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expirado');
    return data;
}

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
    const [salt, storedHash] = storedPassword.split(':');
    if (!salt || !storedHash) return false;
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ erro: 'Não autenticado' });
    }

    try {
        req.usuario = verifyToken(auth.slice(7));
        next();
    } catch (erro) {
        return res.status(401).json({ erro: 'Sessão inválida ou expirada' });
    }
}

// Teste de conexão
pool.connect()
    .then((client) => {
        client.release();
        console.log('Conectado ao PostgreSQL com sucesso!');
    })
    .catch((err) => console.error('Erro ao conectar ao banco de dados:', err.message));

app.get('/', (req, res) => {
    res.json({ mensagem: 'API do Radar de Jogadores online!' });
});

// ---------------- USUÁRIOS ----------------
app.post('/auth/register', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
    }

    if (senha.length < 6) {
        return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const emailNormalizado = email.trim().toLowerCase();

    try {
        const existente = await pool.query('SELECT id FROM usuarios WHERE email = $1', [emailNormalizado]);
        if (existente.rowCount > 0) {
            return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
        }

        const senhaHash = hashPassword(senha);
        const resultado = await pool.query(
            'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, criado_em',
            [nome.trim(), emailNormalizado, senhaHash]
        );

        const usuario = resultado.rows[0];
        const token = createToken(usuario);

        res.status(201).json({ mensagem: 'Conta criada com sucesso!', token, usuario });
    } catch (erro) {
        console.error('Erro ao cadastrar usuário:', erro);
        res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
    }
});

app.post('/auth/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email.trim().toLowerCase()]);
        if (resultado.rowCount === 0 || !verifyPassword(senha, resultado.rows[0].senha_hash)) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        const usuario = resultado.rows[0];
        const dadosUsuario = { id: usuario.id, nome: usuario.nome, email: usuario.email };
        const token = createToken(dadosUsuario);

        res.json({ mensagem: 'Login realizado com sucesso!', token, usuario: dadosUsuario });
    } catch (erro) {
        console.error('Erro ao fazer login:', erro);
        res.status(500).json({ erro: 'Erro ao fazer login.' });
    }
});

app.get('/auth/me', authMiddleware, async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT id, nome, email, criado_em FROM usuarios WHERE id = $1',
            [req.usuario.id]
        );
        if (resultado.rowCount === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
        res.json(resultado.rows[0]);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao buscar usuário.' });
    }
});

// ---------------- ROTAS DE EQUIPES ----------------
app.post('/equipes', authMiddleware, async (req, res) => {
    const { nome, cidade } = req.body;
    try {
        const novaEquipe = await pool.query(
            'INSERT INTO equipes (nome, cidade) VALUES ($1, $2) RETURNING *',
            [nome, cidade]
        );
        res.status(201).json(novaEquipe.rows[0]);
    } catch (erro) {
        console.error('Erro ao cadastrar equipe:', erro);
        res.status(500).json({ erro: 'Erro ao cadastrar equipe' });
    }
});

app.get('/equipes', authMiddleware, async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM equipes ORDER BY id DESC');
        res.json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar equipes:', erro);
        res.status(500).json({ erro: 'Erro ao buscar equipes' });
    }
});

// ---------------- ROTAS DE JOGADORES ----------------
app.post('/jogadores', authMiddleware, async (req, res) => {
    const { nome, posicao, idade, equipe_id } = req.body;
    try {
        const novoJogador = await pool.query(
            'INSERT INTO jogadores (nome, posicao, idade, equipe_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, posicao, idade, equipe_id || null]
        );
        res.status(201).json(novoJogador.rows[0]);
    } catch (erro) {
        console.error('Erro ao cadastrar jogador:', erro);
        res.status(500).json({ erro: 'Erro ao cadastrar jogador no banco' });
    }
});

app.get('/jogadores', authMiddleware, async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT jogadores.*, equipes.nome as equipe_nome
            FROM jogadores
            LEFT JOIN equipes ON jogadores.equipe_id = equipes.id
            ORDER BY jogadores.id DESC
        `);
        res.json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar jogadores:', erro);
        res.status(500).json({ erro: 'Erro ao buscar jogadores' });
    }
});

app.delete('/jogadores/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query('DELETE FROM jogadores WHERE id = $1 RETURNING *', [id]);
        if (resultado.rowCount === 0) {
            return res.status(404).json({ erro: 'Jogador não encontrado' });
        }
        res.json({ mensagem: 'Jogador excluído com sucesso!' });
    } catch (erro) {
        console.error('Erro ao excluir jogador:', erro);
        res.status(500).json({ erro: 'Erro ao excluir jogador' });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

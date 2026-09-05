const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }

  try {
    const userExists = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ erro: 'E-mail já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const newUser = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome, email, senhaHash]
    );

    return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', usuario: newUser.rows[0] });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const userQuery = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (userQuery.rows.length === 0) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const usuario = userQuery.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET || 'chave_secreta_tcc',
      { expiresIn: '8h' }
    );

    return res.json({ mensagem: 'Login realizado com sucesso!', token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};
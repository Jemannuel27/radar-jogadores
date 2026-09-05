const jwt = require('jsonwebtoken');

exports.autenticarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'chave_secreta_tcc', (err, user) => {
    if (err) {
      return res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }
    req.user = user;
    next();
  });
};
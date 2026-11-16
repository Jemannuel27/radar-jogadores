
const express = require('express');
const router = express.Router();

const iaController = require('../controllers/iaController');
const { autenticarToken } = require('../middlewares/authMiddleware');

// As rotas de IA exigem autenticação.
router.get('/historico', autenticarToken, iaController.listarRelatorios);
router.post('/comparar', autenticarToken, iaController.gerarRelatorio);

module.exports = router;

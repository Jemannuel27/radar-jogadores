const express = require('express');
const router = express.Router();
const iaController = require('../controllers/iaController');

// Rotas ajustadas para bater exatamente com o que o front-end chama
router.get('/historico', iaController.listarRelatorios);
router.post('/comparar', iaController.gerarRelatorio);

module.exports = router;
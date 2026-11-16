
const express = require('express');
const router = express.Router();

const {
  getResumoEquipe,
  getDesempenhoAtletas,
} = require('../controllers/dashboardController');

const { autenticarToken } = require('../middlewares/authMiddleware');

// As rotas do dashboard exigem autenticação.
router.get('/equipe', autenticarToken, getResumoEquipe);
router.get('/atletas', autenticarToken, getDesempenhoAtletas);

module.exports = router;

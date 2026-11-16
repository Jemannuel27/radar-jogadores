
const express = require('express');
const router = express.Router();

const {
  salvarEstatisticasPartida,
  listarEstatisticasPorPartida,
} = require('../controllers/estatisticaController');

const { autenticarToken } = require('../middlewares/authMiddleware');

// Todas as rotas de estatísticas exigem autenticação.
router.post('/', autenticarToken, salvarEstatisticasPartida);
router.get('/:partida_id', autenticarToken, listarEstatisticasPorPartida);

module.exports = router;

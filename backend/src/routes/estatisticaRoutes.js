const express = require('express');
const router = express.Router();
const { salvarEstatisticasPartida, listarEstatisticasPorPartida } = require('../controllers/estatisticaController');

router.post('/', salvarEstatisticasPartida);
router.get('/:partida_id', listarEstatisticasPorPartida);

module.exports = router;
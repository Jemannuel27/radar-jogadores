const express = require('express');
const router = express.Router();
const { listarPartidas, criarPartida } = require('../controllers/partidaController');

router.get('/', listarPartidas);
router.post('/', criarPartida);

module.exports = router;
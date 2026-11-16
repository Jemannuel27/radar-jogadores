
const express = require('express');
const router = express.Router();

const partidaController = require('../controllers/partidaController');
const { autenticarToken } = require('../middlewares/authMiddleware');

// Verifica se as funções do controlador existem.
if (typeof partidaController.listarPartidas !== 'function') {
  console.error("ERRO: A função 'listarPartidas' não foi encontrada.");
}

if (typeof partidaController.criarPartida !== 'function') {
  console.error("ERRO: A função 'criarPartida' não foi encontrada.");
}

if (typeof partidaController.atualizarPartida !== 'function') {
  console.error("ERRO: A função 'atualizarPartida' não foi encontrada.");
}

if (typeof partidaController.deletarPartida !== 'function') {
  console.error("ERRO: A função 'deletarPartida' não foi encontrada.");
}

// Todas as rotas de partidas exigem autenticação.
router.get('/', autenticarToken, partidaController.listarPartidas);
router.post('/', autenticarToken, partidaController.criarPartida);
router.put('/:id', autenticarToken, partidaController.atualizarPartida);
router.delete('/:id', autenticarToken, partidaController.deletarPartida);

module.exports = router;

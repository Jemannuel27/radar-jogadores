const express = require('express');
const router = express.Router();
const partidaController = require('../controllers/partidaController');

// Verificação de segurança para garantir que as funções existem no controller
if (typeof partidaController.listarPartidas !== 'function') {
  console.error("ERRO: A função 'listarPartidas' não foi encontrada em partidaController.js");
}
if (typeof partidaController.criarPartida !== 'function') {
  console.error("ERRO: A função 'criarPartida' não foi encontrada em partidaController.js");
}
if (typeof partidaController.atualizarPartida !== 'function') {
  console.error("ERRO: A função 'atualizarPartida' não foi encontrada em partidaController.js");
}
if (typeof partidaController.deletarPartida !== 'function') {
  console.error("ERRO: A função 'deletarPartida' não foi encontrada em partidaController.js");
}

router.get('/', partidaController.listarPartidas);
router.post('/', partidaController.criarPartida);
router.put('/:id', partidaController.atualizarPartida);
router.delete('/:id', partidaController.partidaController ? partidaController.deletarPartida : partidaController.deletarPartida); // ajuste seguro

module.exports = router;
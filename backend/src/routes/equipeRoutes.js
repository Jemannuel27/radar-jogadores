const express = require('express');
const router = express.Router();
const equipeController = require('../controllers/equipeController');

// Verificação de segurança para identificar qual função está faltando no controller
if (typeof equipeController.listarEquipes !== 'function') {
  console.error("ERRO: A função 'listarEquipes' não foi encontrada em equipeController.js");
}
if (typeof equipeController.criarEquipe !== 'function') {
  console.error("ERRO: A função 'criarEquipe' não foi encontrada em equipeController.js");
}
if (typeof equipeController.atualizarEquipe !== 'function') {
  console.error("ERRO: A função 'atualizarEquipe' não foi encontrada em equipeController.js");
}
if (typeof equipeController.deletarEquipe !== 'function') {
  console.error("ERRO: A função 'deletarEquipe' não foi encontrada em equipeController.js");
}

router.get('/', equipeController.listarEquipes);
router.post('/', equipeController.criarEquipe);
router.put('/:id', equipeController.atualizarEquipe);
router.delete('/:id', equipeController.deletarEquipe);

module.exports = router;
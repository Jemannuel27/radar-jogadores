
const express = require('express');
const router = express.Router();

const equipeController = require('../controllers/equipeController');
const { autenticarToken } = require('../middlewares/authMiddleware');

// Verifica se as funções do controlador existem.
if (typeof equipeController.listarEquipes !== 'function') {
  console.error("ERRO: A função 'listarEquipes' não foi encontrada.");
}

if (typeof equipeController.criarEquipe !== 'function') {
  console.error("ERRO: A função 'criarEquipe' não foi encontrada.");
}

if (typeof equipeController.atualizarEquipe !== 'function') {
  console.error("ERRO: A função 'atualizarEquipe' não foi encontrada.");
}

if (typeof equipeController.deletarEquipe !== 'function') {
  console.error("ERRO: A função 'deletarEquipe' não foi encontrada.");
}

// Todas as rotas de equipes exigem autenticação.
router.get('/', autenticarToken, equipeController.listarEquipes);
router.post('/', autenticarToken, equipeController.criarEquipe);
router.put('/:id', autenticarToken, equipeController.atualizarEquipe);
router.delete('/:id', autenticarToken, equipeController.deletarEquipe);

module.exports = router;

const express = require('express');
const router = express.Router();
const jogadorController = require('../controllers/jogadorController');
const { autenticarToken } = require('../middlewares/authMiddleware'); // Certifique-se do caminho correto

// Se você usa o middleware de autenticação, passe-o antes do controller
// Caso queira testar sem o middleware primeiro, você pode remover 'autenticarToken' das rotas

router.get('/', autenticarToken, jogadorController.listarJogadores);
router.post('/', autenticarToken, jogadorController.criarJogador);
router.put('/:id', autenticarToken, jogadorController.atualizarJogador);
router.delete('/:id', autenticarToken, jogadorController.deletarJogador);

module.exports = router;
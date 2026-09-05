const express = require('express');
const router = express.Router();
const jogadorController = require('../controllers/jogadorController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', jogadorController.listarJogadores);
router.post('/', jogadorController.cadastrarJogador);
router.delete('/:id', jogadorController.excluirJogador);

module.exports = router;
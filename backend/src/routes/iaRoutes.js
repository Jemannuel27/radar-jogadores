const express = require('express');
const router = express.Router();
const { 
    gerarParecerTecnicoIA, 
    listarJogadoresParaIa, 
    compararAtletasIA 
} = require('../controllers/iaController');

router.get('/jogadores', listarJogadoresParaIa);
router.get('/parecer/:id', gerarParecerTecnicoIA);
router.get('/comparar', compararAtletasIA);

module.exports = router;
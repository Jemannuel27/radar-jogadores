const express = require('express');
const router = express.Router();
const { getResumoEquipe, getDesempenhoAtletas } = require('../controllers/dashboardController');

router.get('/equipe', getResumoEquipe);
router.get('/atletas', getDesempenhoAtletas);

module.exports = router;
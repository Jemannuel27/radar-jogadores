const express = require('express');
const router = express.Router();
const equipeController = require('../controllers/equipeController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', equipeController.listarEquipes);
router.post('/', equipeController.cadastrarEquipe);

module.exports = router;
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Verificação de segurança para evitar o erro caso alguma função venha undefined
if (typeof authController.login !== 'function') {
  console.error("ERRO: A função 'login' não foi encontrada em authController.js");
}
if (typeof authController.register !== 'function') {
  console.error("ERRO: A função 'register' não foi encontrada em authController.js");
}

router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;
const express = require('express');
const router = express.Router();
const { login } = require('../controladores/registrologin/loginController');

router.post('/inicio', login);

module.exports = router;

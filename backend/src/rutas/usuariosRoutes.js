const express = require('express');
const router = express.Router();
const { crearUsuario, obtenerUsuarios } = require('../controladores/registrologin/usuariosController');
router.post('/crear', crearUsuario);
router.get('/listausuario', obtenerUsuarios);
module.exports = router;

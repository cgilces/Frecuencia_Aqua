const express = require('express');
const router = express.Router();
const clientesControlador = require('../controladores/clientesControlador');

router.get('/buscar', clientesControlador.buscarClientes);
router.post('/agregar', clientesControlador.agregarCliente);
router.get('/:codigo', clientesControlador.obtenerCliente);

module.exports = router;

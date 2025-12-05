const { Cliente } = require('../modelos'); // importa todos los modelos
const { Op } = require('sequelize');

// ==========================================================
// BUSCAR CLIENTES
// GET /api/clientes/buscar?term=xxxx
// ==========================================================
exports.buscarClientes = async (req, res) => {
    try {
        const { term } = req.query;

        if (!term || term.trim() === "") {
            return res.status(400).json({ error: "Debe enviar un término de búsqueda." });
        }

        const clientes = await Cliente.findAll({
            where: {
                [Op.or]: [
                    { nombre: { [Op.iLike]: `%${term}%` } },
                    { identificacion: { [Op.iLike]: `%${term}%` } },
                    { codigo: { [Op.iLike]: `%${term}%` } }
                ]
            },
            limit: 50
        });

        if (!clientes.length) {
            return res.json([]);
        }

        res.json(clientes);

    } catch (error) {
        console.error("❌ Error al buscar clientes:", error);
        res.status(500).json({ error: "Error interno al buscar clientes." });
    }
};

// ==========================================================
// OBTENER CLIENTE POR SU CÓDIGO
// GET /api/clientes/:codigo
// ==========================================================
exports.obtenerCliente = async (req, res) => {
    try {
        const { codigo } = req.params;

        const cliente = await Cliente.findByPk(codigo);

        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado." });
        }

        res.json(cliente);

    } catch (error) {
        console.error("❌ Error al obtener cliente:", error);
        res.status(500).json({ error: "Error interno al obtener cliente." });
    }
};

// ==========================================================
// AGREGAR UN NUEVO CLIENTE
// POST /api/clientes/agregar
// ==========================================================
exports.agregarCliente = async (req, res) => {
    try {
        const data = req.body;

        if (!data["Cliente"] || !data["Cliente (Nombre)"]) {
            return res.status(400).json({ error: "Faltan campos obligatorios para registrar el cliente." });
        }

        // Verificar si ya existe en la DB
        const existe = await Cliente.findByPk(data["Cliente"]);

        if (existe) {
            // -----------------------------------------------------------------
            // ⭐ ACTUALIZAR CLIENTE EXISTENTE
            // -----------------------------------------------------------------
            const updated = await Cliente.update(
                {
                    identificacion: data["Cliente (Identificación)"],
                    nombre: data["Cliente (Nombre)"],
                    nombre_empresa: data["Nombre a Mostrar"],
                    contacto: data["Teléfono"],
                    categoria_precio: data["Categoria"],
                    vendedor_asignado: data["Ruta"],
                    estado: data["Cliente (Estatus)"],
                    fecha_ultima_sincronizacion: new Date()
                },
                {
                    where: { codigo: data["Cliente"] }
                }
            );

            return res.json({
                mensaje: "Cliente actualizado correctamente",
                updated
            });
        }

        // ---------------------------------------------------------------------
        // ⭐ CREAR UN NUEVO CLIENTE (si no existe)
        // ---------------------------------------------------------------------
        const nuevoCliente = await Cliente.create({
            codigo: data["Cliente"],
            identificacion: data["Cliente (Identificación)"] || "",
            nombre: data["Cliente (Nombre)"],
            nombre_empresa: data["Nombre a Mostrar"] || null,
            contacto: data["Teléfono"] || null,
            categoria_precio: data["Categoria"] || null,
            vendedor_asignado: data["Ruta"] || null,
            estado: data["Cliente (Estatus)"] || "1",
            correo: data["Correo"] || null,
            saldo: 0,
            fecha_ultima_sincronizacion: new Date()
        });

        res.json({
            mensaje: "Cliente creado correctamente",
            cliente: nuevoCliente
        });

    } catch (error) {
        console.error("❌ Error al agregar/actualizar cliente:", error);
        res.status(500).json({ error: "Error interno en el servidor." });
    }
};



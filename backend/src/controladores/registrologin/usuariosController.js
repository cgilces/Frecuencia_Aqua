const bcrypt = require('bcryptjs');
const { UsuarioApp } = require('../../modelos');

/* =============================
   CREAR USUARIO
============================= */
const crearUsuario = async (req, res) => {
  try {
    let { usuario, clave, rol, rutasAsignadas } = req.body;

    if (!usuario || !clave || !rol) {
      return res.status(400).json({
        ok: false,
        msg: "Usuario, clave y rol son obligatorios"
      });
    }

    usuario = usuario.toString().trim().toUpperCase();
    clave = clave.toString().trim();

    // Verificar si existe
    const existente = await UsuarioApp.findOne({ where: { usuario } });

    if (existente) {
      return res.status(409).json({
        ok: false,
        msg: "El usuario ya existe"
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const claveHasheada = await bcrypt.hash(clave, salt);

    // Crear usuario
    const nuevo = await UsuarioApp.create({
      usuario,
      clave: claveHasheada,
      rol,
      rutasAsignadas: rutasAsignadas || []
    });

    return res.status(201).json({
      ok: true,
      msg: "Usuario creado exitosamente",
      user: {
        id: nuevo.id,
        usuario: nuevo.usuario,
        rol: nuevo.rol,
        rutas_asignadas: nuevo.rutasAsignadas
      }
    });

  } catch (error) {
    console.error("Error al crear usuario:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor"
    });
  }
};


/* =============================
   OBTENER TODOS LOS USUARIOS
============================= */
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await UsuarioApp.findAll({
      attributes: ['id', 'usuario', 'rol', 'rutasAsignadas'], // solo columnas públicas
      order: [['id', 'ASC']]
    });

    return res.status(200).json({
      ok: true,
      total: usuarios.length,
      usuarios
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor"
    });
  }
};


module.exports = { 
  crearUsuario,
  obtenerUsuarios
};

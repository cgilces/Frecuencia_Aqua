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
      attributes: ['id', 'usuario', 'rol', 'rutasAsignadas'], 
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


/* =============================
   EDITAR USUARIO
============================= */
const editarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    let { usuario, clave, rol, rutasAsignadas } = req.body;

    const user = await UsuarioApp.findByPk(id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado"
      });
    }

    // Si viene un nuevo usuario, validarlo
    if (usuario) {
      usuario = usuario.toString().trim().toUpperCase();

      // verificar duplicado
      const duplicado = await UsuarioApp.findOne({
        where: { usuario },
      });

      if (duplicado && duplicado.id != id) {
        return res.status(409).json({
          ok: false,
          msg: "Ese nombre de usuario ya existe"
        });
      }

      user.usuario = usuario;
    }

    // Si clave vino, entonces re-hashearla
    if (clave && clave.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      user.clave = await bcrypt.hash(clave.trim(), salt);
    }

    if (rol) user.rol = rol;
    if (rutasAsignadas) user.rutasAsignadas = rutasAsignadas;

    await user.save();

    return res.status(200).json({
      ok: true,
      msg: "Usuario actualizado exitosamente",
      usuario: user
    });

  } catch (error) {
    console.error("Error al editar usuario:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor"
    });
  }
};


/* =============================
   ELIMINAR USUARIO
============================= */
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UsuarioApp.findByPk(id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado"
      });
    }

    await user.destroy();

    return res.status(200).json({
      ok: true,
      msg: "Usuario eliminado correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor"
    });
  }
};



module.exports = { 
  crearUsuario,
  obtenerUsuarios,
  editarUsuario,
  eliminarUsuario
};

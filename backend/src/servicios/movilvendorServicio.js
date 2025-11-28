const axios = require('axios');
require('dotenv').config();

const urlMovilVendor = process.env.MV_URL;  // URL de MovilVendor

// Función para hacer login en MovilVendor
async function loginMovilVendor() {
  const usuario = process.env.MV_USUARIO;
  const clave = process.env.MV_CLAVE;
  const context = process.env.MV_CONTEXT || "grupoaqua";

  try {
    const respuesta = await axios.post(urlMovilVendor, {
      action: 'login',
      login: usuario,
      password: clave,
      context: context
    });

    if (!respuesta.data || !respuesta.data.session_id) {
      throw new Error('No se pudo obtener session_id de MovilVendor');
    }

    return respuesta.data.session_id;
  } catch (error) {
    console.error("Error al realizar login en MovilVendor:", error);
    throw error;
  }
}

// Función para enviar las rutas a MovilVendor
async function enviarRoutes(sessionId, registrosRoutes) {
  try {
    const records = registrosRoutes.map(ruta => ({
      code: ruta.code,
      description: ruta.description || ''
    }));

    const respuesta = await axios.post(urlMovilVendor, {
      session_id: sessionId,
      action: 'put',
      schema: 'routes',
      records: records
    });

    if (!respuesta.data || respuesta.data.errors > 0) {
      throw new Error(`Error al enviar las rutas a MovilVendor. Respuesta de API: ${JSON.stringify(respuesta.data)}`);
    }

    return respuesta.data;
  } catch (error) {
    console.error('Error al enviar las rutas:', error);
    throw new Error('Error al enviar las rutas a MovilVendor: ' + error.message);
  }
}

// Función para enviar los detalles de las rutas a MovilVendor
// Función para enviar los detalles de las rutas a MovilVendor
async function enviarRouteDetails(sessionId, registrosRouteDetails) {
  try {
    // Filtrar y mapear los registros, asegurándonos de que 'week' sea válido
    const records = registrosRouteDetails.map(detail => {
      // Asegurarse de que 'week' esté en el rango válido (1-52)
      const validWeek = (detail.week >= 1 && detail.week <= 52) ? detail.week : 1; // Si 'week' no es válido, asignamos el valor 1

      return {
        code: detail.code,
        route_code: detail.route_code,
        customer_code: detail.customer_code,
        description: detail.description,
        customer_address_code: detail.customer_address_code,
        week: validWeek,  // Usamos 'validWeek' para garantizar un valor válido
        sequence: detail.sequence,
        day: detail.day
      };
    });

    // Log para verificar los datos antes de enviarlos
    console.log("Registros de detalles de rutas a enviar:", JSON.stringify(records, null, 2));

    // Realizamos la petición POST a MovilVendor para enviar los detalles de las rutas
    const respuesta = await axios.post(urlMovilVendor, {
      session_id: sessionId,
      action: 'put',
      schema: 'route_details',
      records: records
    });

    // Verificar si la respuesta tiene un estado exitoso
    if (!respuesta.data || respuesta.data.errors > 0) {
      throw new Error(`Error al enviar los detalles de las rutas a MovilVendor. Respuesta de API: ${JSON.stringify(respuesta.data)}`);
    }

    return respuesta.data;  // Retorna la respuesta de MovilVendor
  } catch (error) {
    console.error('Error al enviar los detalles de las rutas:', error.response ? error.response.data : error.message);
    throw new Error('Error al enviar los detalles de las rutas a MovilVendor: ' + error.message);
  }
}


module.exports = {
  loginMovilVendor,
  enviarRoutes,
  enviarRouteDetails
};

export const putUser = async (payload) => {
    const res = await fetch("http://localhost:5000/api/usuarios/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    return data;
}

export const getUsers = async (page = 1, limit = 10) => {
    // Obtener todos los usuarios de la API
    const res = await fetch("http://localhost:5000/api/usuarios/listausuario");
    const data = await res.json();

    // Si la API retorna un array directamente
    const allUsers = Array.isArray(data) ? data : (data.usuarios || []);

    // Calcular paginación del lado del cliente
    const total = allUsers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    console.log(`Página ${page} de ${totalPages} - Total: ${total} usuarios`);

    // Retornar en el formato esperado
    return {
        usuarios: paginatedUsers,
        total: total,
        totalPages: totalPages,
        currentPage: page
    };
}

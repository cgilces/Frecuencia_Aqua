import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Spinner } from '../components/common/Spinner';
import Button from '../components/elements/Button';
import PanelButtons from '../components/elements/PanelButtons';
import { UserAddIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/common/Icons';
import { useAuth } from '../components/auth/AuthContext';
import { LoginScreen } from '../components/LoginScreen';
import { Table, Column } from '../components/elements/Table';
import Input from '@/components/elements/Input';
import { User } from '../types';
import { getUsers, putUser } from '../services/users';
import { Toast } from '@/components/common/Toast';

const CreateUser: React.FC = () => {
    const { user, loading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });
    const [role, setRole] = useState('VENDEDOR');
    const [assignedRoutes, setAssignedRoutes] = useState<string[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const cargarUsuariosDesdeBD = () => {
        // Cargar TODOS los usuarios sin paginación
        getUsers(1, 999999).then((data: any) => {
            if (data && data.usuarios && Array.isArray(data.usuarios)) {
                const mappedUsers: User[] = data.usuarios.map((u: any) => ({
                    id: u.id,
                    username: u.usuario,
                    role: u.rol,
                    assigned_routes: u.rutasAsignadas
                }));
                setAllUsers(mappedUsers);
            }
        }).catch(err => console.error(err));
    }

    useEffect(() => {
        cargarUsuariosDesdeBD();
    }, []);

    // Filtrar usuarios según el término de búsqueda
    const filteredUsers = React.useMemo(() => {
        if (!searchTerm.trim()) {
            return allUsers;
        }

        const term = searchTerm.toLowerCase();
        return allUsers.filter(user => {
            const username = user.username?.toLowerCase() || '';
            const role = user.role?.toLowerCase() || '';
            const routes = Array.isArray(user.assigned_routes)
                ? user.assigned_routes.join(' ').toLowerCase()
                : (user.assigned_routes?.toLowerCase() || '');

            return username.includes(term) ||
                role.includes(term) ||
                routes.includes(term);
        });
    }, [allUsers, searchTerm]);

    // Calcular paginación sobre usuarios filtrados
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const totalUsers = filteredUsers.length;

    // Usuarios paginados
    const paginatedUsers = React.useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredUsers.slice(startIndex, endIndex);
    }, [filteredUsers, currentPage, itemsPerPage]);

    // Resetear a página 1 cuando cambia el término de búsqueda
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleEditUser = (user: User) => {
        setUsername(user.username);
        setRole(user.role);
        setAssignedRoutes(Array.isArray(user.assigned_routes) ? user.assigned_routes : []);
    };

    const handleSaveToDatabase = async () => {
        const payload = {
            usuario: username,
            clave: password,
            rol: role,
            rutaAsignada: assignedRoutes
        };

        try {
            await putUser(payload);
            // Recargar lista
            cargarUsuariosDesdeBD();
            setToast({ show: true, message: "Usuario guardado exitosamente", type: 'success' });

            // Limpiar formulario
            setUsername('');
            setPassword('');
            setAssignedRoutes([]);
        } catch (error) {
            console.error(error);
            setToast({ show: true, message: "Error al guardar el usuario", type: 'error' });
        }
    }

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const userColumns: Column<User>[] = [
        {
            header: "Usuario",
            headerClassName: "text-center",
            className: "text-center",
            accessorKey: "username"
        },
        {
            header: "Rol",
            headerClassName: "text-center",
            className: "text-center",
            render: (u) => (
                <span className="bg-[#BEDACC] text-[#19322f] font-semibold px-2 py-0.5 rounded text-xs">
                    {u.role}
                </span>
            )
        },
        {
            header: "Rutas Asignadas",
            headerClassName: "text-center",
            className: "text-center",
            render: (u) => (
                <span className="text-[#b2e1d8]/70">
                    {Array.isArray(u.assigned_routes) ? u.assigned_routes.join(", ") : u.assigned_routes}
                </span>
            )
        },
        {
            header: "Acciones",
            headerClassName: "text-center",
            className: "text-center flex justify-center",
            render: (u) => (
                <Button onClick={() => handleEditUser(u)} className="text-[#19322f] bg-[#B2E1D8] py-1 px-2 hover:bg-[#9adfd3] mx-1">
                    Editar
                </Button>
            )
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (!user) {
        return <LoginScreen />;
    }

    return (
        <div className="min-h-screen text-[#b2e1d8] font-sans">
            <main className="space-y-6">

                {/* Panel de Botones Unificado */}
                <PanelButtons
                    title="Gestión de Usuarios"
                    subtitle="Administra los usuarios y sus roles"
                    itemCount={totalUsers}
                    itemLabel={totalUsers === 1 ? 'usuario' : 'usuarios'}
                />

                {/* Contenido Principal: Tabla y Formulario */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Columna Izquierda: Lista de Usuarios (2/3 del ancho) */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card className="overflow-hidden bg-[#19322f] border-[#b2e1d8]/20">
                            <div className="p-4 border-b border-[#b2e1d8]/20 flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-[#b2e1d8]">Usuarios Registrados</h2>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar usuario..."
                                        className="bg-[#19322f] border border-[#b2e1d8]/30 text-[#b2e1d8] text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b2e1d8]"
                                    />
                                </div>
                            </div>

                            <Table
                                data={paginatedUsers}
                                columns={userColumns}
                                keyExtractor={(u) => u.id || u.username}
                            />

                            {/* Controles de Paginación */}
                            <div className="p-3 border-t border-[#b2e1d8]/20 flex justify-between items-center">
                                <span className="text-xs text-[#b2e1d8]/50">
                                    Mostrando {totalUsers > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} - {Math.min(currentPage * itemsPerPage, totalUsers)} de {totalUsers}
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={goToPrevPage}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 bg-[#b2e1d8]/10 hover:bg-[#b2e1d8]/20 text-[#b2e1d8] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                    >
                                        <ChevronLeftIcon className="w-4 h-4" />
                                        Anterior
                                    </button>

                                    <span className="text-sm text-[#b2e1d8]/70 px-3">
                                        Página {currentPage} de {totalPages || 1}
                                    </span>

                                    <button
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="px-3 py-1.5 bg-[#b2e1d8]/10 hover:bg-[#b2e1d8]/20 text-[#b2e1d8] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                    >
                                        Siguiente
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Columna Derecha: Formulario de Creación/Edición (1/3 del ancho) */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 bg-[#19322f] border-[#b2e1d8]/20 sticky top-6">
                            <h2 className="text-lg font-bold text-[#b2e1d8] mb-4 flex items-center gap-2">
                                <UserAddIcon className="w-5 h-5" />
                                Nuevo Usuario
                            </h2>

                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#b2e1d8]/80 mb-1">Nombre de Usuario</label>
                                    <Input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-[#19322f] border border-[#b2e1d8]/30 rounded-lg p-2.5 text-[#b2e1d8] focus:ring-1 focus:ring-[#b2e1d8] focus:border-[#b2e1d8] outline-none transition-all"
                                        placeholder="Ej: juan.perez"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#b2e1d8]/80 mb-1">Contraseña</label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#19322f] border border-[#b2e1d8]/30 rounded-lg p-2.5 text-[#b2e1d8] focus:ring-1 focus:ring-[#b2e1d8] focus:border-[#b2e1d8] outline-none transition-all"
                                        placeholder="Ingrese una contraseña"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#b2e1d8]/80 mb-1">Rol</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full bg-[#19322f] border border-[#b2e1d8]/30 rounded-lg p-2.5 text-[#b2e1d8] focus:ring-1 focus:ring-[#b2e1d8] focus:border-[#b2e1d8] outline-none transition-all"
                                    >
                                        <option value="VENDEDOR">Vendedor</option>
                                        <option value="ADMIN">Administrador</option>
                                        <option value="DESPACHADOR">Despachador</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#b2e1d8]/80 mb-1">Rutas Asignadas</label>
                                    <Input
                                        type="text"
                                        value={assignedRoutes.join(", ")}
                                        onChange={(e) => setAssignedRoutes(e.target.value.split(", ").map(r => r.trim()).filter(r => r))}
                                        className="w-full bg-[#19322f] border border-[#b2e1d8]/30 rounded-lg p-2.5 text-[#b2e1d8] focus:ring-1 focus:ring-[#b2e1d8] focus:border-[#b2e1d8] outline-none transition-all"
                                        placeholder="Ej: R1, R2 (separadas por coma)"
                                    />
                                    <p className="text-xs text-[#b2e1d8]/50 mt-1">Separa las rutas con comas</p>
                                </div>

                                <div className="flex justify-center gap-2">
                                    <Button
                                        onClick={handleSaveToDatabase}
                                        color="claroaqua"
                                        className="w-32 h-10 px-4 py-2"
                                    >
                                        Guardar
                                    </Button>

                                    <Button
                                        className="w-32 h-10 px-4 py-2"
                                        onClick={() => {
                                            setUsername('');
                                            setPassword('');
                                            setAssignedRoutes([]);
                                            setRole('VENDEDOR');
                                        }}
                                        color="claroaqua"
                                    >
                                        Nuevo
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>

                </div>
            </main>

            {/* Toast Component */}
            <Toast
                message={toast.message}
                type={toast.type}
                show={toast.show}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
};

export default CreateUser;
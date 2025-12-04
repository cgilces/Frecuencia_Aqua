import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/common/Card';
import { Spinner } from '../components/common/Spinner';
import Button from '../components/elements/Button';
import PanelButtons from '../components/elements/PanelButtons';
import { UserAddIcon, ChevronLeftIcon, ChevronRightIcon, editIcon, deleteIcon } from '../components/common/Icons';
import { useAuth } from '../components/auth/AuthContext';
import { LoginScreen } from '../components/LoginScreen';
import { Table, Column } from '../components/elements/Table';
import Modal from '../components/elements/Modal';
import Input from '@/components/elements/Input';
import { User } from '../types';
import { getUsers, putUser, editUser, deleteUser } from '../services/users';
import { Toast } from '@/components/common/Toast';

const CreateUser: React.FC = () => {
    const { user, loading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [esedicion, setEsedicion] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });
    const [role, setRole] = useState('VENDEDOR');
    const [tempRoute, setTempRoute] = useState('');
    const [modaleliminacion, setModaleliminacion] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [assignedRoutes, setAssignedRoutes] = useState<string[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
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
        setEditingUserId(user.id);
        setUsername(user.username);
        setRole(user.role);
        setPassword('');
        setAssignedRoutes(Array.isArray(user.assigned_routes) ? user.assigned_routes : []);
    };
    const handleNewUser = () => {
        setEditingUserId(null);
        setUsername('');
        setPassword('');
        setRole('VENDEDOR');
        setAssignedRoutes([]);
    };

    // Funciones para manejar el modal de eliminación
    const openDeleteModal = (user: User) => {
        setUserToDelete(user);
        setModaleliminacion(true);
    };

    const closeModal = () => {
        setModaleliminacion(false);
        setUserToDelete(null);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            await deleteUser(userToDelete.id);
            setToast({ show: true, message: "Usuario eliminado exitosamente", type: 'success' });
            cargarUsuariosDesdeBD();
            closeModal();
        } catch (error) {
            console.error(error);
            setToast({ show: true, message: "Error al eliminar el usuario", type: 'error' });
            closeModal();
        }
    };

    const handleSaveToDatabase = async () => {
        if (!username.trim()) {
            setToast({ show: true, message: "El nombre de usuario es requerido", type: 'error' });
            return;
        }

        if (!editingUserId && !password.trim()) {
            setToast({ show: true, message: "La contraseña es requerida para nuevos usuarios", type: 'error' });
            return;
        }

        // Limpia rutas antes de enviar
        const cleanRoutes = assignedRoutes
            .map(r => r.trim())           // Elimina espacios
            .filter(r => r.length > 0)    // Elimina vacíos
            .filter((r, i, arr) => arr.indexOf(r) === i); // Elimina duplicados

        const payload: any = {
            usuario: username,
            rol: role,
            rutasAsignadas: cleanRoutes,
        };

        if (password.trim()) {
            payload.clave = password;
        }

        if (editingUserId) {
            payload.id = editingUserId;
        }

        try {
            if (editingUserId) {
                await editUser(payload);
            } else {
                await putUser(payload);
            }
            cargarUsuariosDesdeBD();
            setToast({
                show: true,
                message: editingUserId ? "Usuario actualizado exitosamente" : "Usuario creado exitosamente",
                type: 'success'
            });

            handleNewUser();
        } catch (error) {
            console.error(error);
            setToast({
                show: true,
                message: editingUserId ? "Error al actualizar el usuario" : "Error al crear el usuario",
                type: 'error'
            });
        }
    };



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
                <span className="text-[#162b25]">
                    {Array.isArray(u.assigned_routes) ? u.assigned_routes.join(", ") : u.assigned_routes}
                </span>
            )
        },
        {
            header: "Acciones",
            headerClassName: "text-center",
            className: "text-center",
            render: (u) => (
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => handleEditUser(u)}
                        className="text-sm text-[#162b25] font-medium    py-1 px-6 gap-2 flex items-center rounded no-underline"
                    >
                        {editIcon({ className: "w-4 h-4" })}

                    </button>
                    <button
                        onClick={() => openDeleteModal(u)}
                        className="text-sm text-[#162b25] font-medium  py-1 px-6 gap-2 flex items-center rounded no-underline"
                    >
                        {deleteIcon({ className: "w-4 h-4" })}

                    </button>
                </div>
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
        <div className="min-h-screen text-[#162a25] font-sans">
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
                        <Card className="overflow-hidden shadow-[#ffffff] border-[#ffffff]/20">
                            <div className="p-4  flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-[#162a25]">Usuarios Registrados</h2>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar usuario..."
                                        className=" border border-[#162a25]/20 text-[#162a25] text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#b2e1d8]"
                                    />
                                </div>
                            </div>

                            <Table
                                data={paginatedUsers}

                                columns={userColumns}

                                keyExtractor={(u) => u.id || u.username}
                                renderMobileItem={(u) => (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-[#162b25]">{u.username}</p>
                                                <span className="bg-[#BEDACC] text-[#19322f] font-semibold px-2 py-0.5 rounded text-xs inline-block mt-1">
                                                    {u.role}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#162b25]/60 mb-1">Rutas Asignadas:</p>
                                            <p className="text-sm text-[#162b25]">
                                                {Array.isArray(u.assigned_routes) ? u.assigned_routes.join(", ") : u.assigned_routes}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 pt-2 border-t border-[#162b25]/10">
                                            <button
                                                onClick={() => handleEditUser(u)}
                                                className="flex-1 text-sm text-[#162b25] font-medium py-2 px-4 bg-[#bedacc]/20 hover:bg-[#bedacc]/30 rounded flex items-center justify-center gap-2 transition-colors"
                                            >
                                                {editIcon({ className: "w-4 h-4" })}
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(u)}
                                                className="flex-1 text-sm text-[#162b25] font-medium py-2 px-4 bg-red-100 hover:bg-red-200 rounded flex items-center justify-center gap-2 transition-colors"
                                            >
                                                {deleteIcon({ className: "w-4 h-4" })}
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            />

                            {/* Controles de Paginación */}
                            <div className="p-2 sm:p-3 flex flex-col sm:flex-row justify-between items-center gap-2">
                                <span className="text-xs text-[#162b25] order-2 sm:order-1">
                                    <span className="hidden sm:inline">Mostrando </span>
                                    {totalUsers > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} - {Math.min(currentPage * itemsPerPage, totalUsers)} de {totalUsers}
                                </span>

                                <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                                    <Button
                                        onClick={goToPrevPage}
                                        variant="verdeaqua"
                                        disabled={currentPage === 1}
                                        className="px-2 sm:px-3 py-1.5 bg-[#162b25] hover:bg-[#162b25]/10 text-[#b2e1d8] rounded-lg disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        <ChevronLeftIcon className="w-4 h-4" />
                                        <span className="hidden sm:inline">Anterior</span>
                                    </Button>

                                    <span className="text-xs sm:text-sm text-[#162b25] px-2 sm:px-3">
                                        <span className="hidden sm:inline">Página </span>
                                        {currentPage}/{totalPages || 1}
                                    </span>

                                    <Button
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        variant="verdeaqua"
                                        className="px-2 sm:px-3 py-1.5 hover:bg-[#162b25]/10 text-[#b2e1d8] rounded-lg flex items-center gap-1"
                                    >
                                        <span className="hidden sm:inline">Siguiente</span>
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Columna Derecha: Formulario de Creación/Edición (1/3 del ancho) */}
                    <div className="lg:col-span-1">
                        <Card className="p-6  sticky top-6" color="bg-[#162b25]">
                            <h2 className="text-lg font-bold text-[#bedacc] mb-4 flex items-center gap-2">
                                <UserAddIcon className="w-5 h-5" />
                                {editingUserId ? "Editar Usuario" : "Nuevo Usuario"}
                            </h2>

                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#bedacc] mb-1">Nombre de Usuario</label>
                                    <Input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full  border border-[#162b25]/30 rounded-lg p-2.5 text-[#162b25] focus:ring-1 focus:ring-[#b2e1d8] focus:border-[#b2e1d8] outline-none transition-all"
                                        placeholder="Ej: juan.perez"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#bedacc] mb-1">
                                        Contraseña {editingUserId && "(dejar en blanco para mantener la actual)"}
                                    </label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full  border border-[#162b25]/30 rounded-lg p-2.5 text-[#162b25] focus:ring-1 focus:ring-[#b2e1d8] focus:border-[#b2e1d8] outline-none transition-all"
                                        placeholder={editingUserId ? "Nueva contraseña (opcional)" : "Ingrese una contraseña"}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#bedacc] mb-1">Rol</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full  rounded-lg p-2.5 text-[#162b25] focus:ring-1 focus:ring-[#b2e1d8] focus:border-[#b2e1d8] outline-none transition-all"
                                    >
                                        <option value="VENDEDOR">Vendedor</option>
                                        <option value="ADMIN">Administrador</option>
                                        <option value="DESPACHADOR">Despachador</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#b2e1d8] mb-1">Rutas Asignadas</label>

                                    {/* Contenedor de chips */}
                                    <div className="flex flex-wrap gap-2 mb-2 min-h-[36px]">
                                        {assignedRoutes.map((route, index) => (
                                            <div
                                                key={index}
                                                className="bg-[#bedacc] text-[#162b25] font-bold px-2 py-1 rounded flex items-center gap-1"
                                            >
                                                {route}
                                                <button
                                                    type="button"
                                                    onClick={() => setAssignedRoutes(assignedRoutes.filter((_, i) => i !== index))}
                                                    className="text-[#b2e1d8] hover:text-white text-xs font-bold"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Campo de entrada con botón */}
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            value={tempRoute}
                                            onChange={(e) => setTempRoute(e.target.value)}
                                            placeholder="Ej: R1"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ',') {
                                                    e.preventDefault();
                                                    if (tempRoute.trim() && !assignedRoutes.includes(tempRoute.trim())) {
                                                        setAssignedRoutes([...assignedRoutes, tempRoute.trim()]);
                                                        setTempRoute('');
                                                    }
                                                }
                                            }}
                                            onBlur={() => {
                                                if (tempRoute.trim() && !assignedRoutes.includes(tempRoute.trim())) {
                                                    setAssignedRoutes([...assignedRoutes, tempRoute.trim()]);
                                                    setTempRoute('');
                                                }
                                            }}
                                            className="flex-1 border border-[#162b25]/30 rounded-lg p-2.5 text-[#162b25] focus:ring-1 focus:ring-[#b2e1d8] focus:border-[#b2e1d8] outline-none transition-all"
                                        />
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                if (tempRoute.trim() && !assignedRoutes.includes(tempRoute.trim())) {
                                                    setAssignedRoutes([...assignedRoutes, tempRoute.trim()]);
                                                    setTempRoute('');
                                                }
                                            }}
                                            variant="claroaqua"
                                            className="px-3 py-2 rounded"
                                        >
                                            +
                                        </Button>
                                    </div>

                                    <p className="text-xs text-[#b2e1d8]/50 mt-1">
                                        Presiona Enter, coma o el botón "+" para agregar rutas
                                    </p>
                                </div>

                                <div className="flex justify-center gap-2">
                                    <Button
                                        onClick={handleSaveToDatabase}
                                        variant="claroaqua"
                                        className="w-32 h-10 px-4 py-2 rounded-lg"
                                    >
                                        {editingUserId ? "Actualizar" : "Guardar"}
                                    </Button>

                                    {editingUserId && (
                                        <Button
                                            onClick={handleNewUser}
                                            variant="claroaqua"
                                            className="w-32 h-10 px-4 py-2 rounded-lg"
                                        >
                                            Nuevo
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </Card>
                    </div>

                </div>
            </main>
            {/* Modal de Confirmación de Eliminación */}
            <Modal
                isOpen={modaleliminacion}
                itemToDelete={userToDelete?.username || ''}
                onClose={closeModal}
                onConfirm={handleDeleteUser}
            />

            {/* Global CSS for Animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Smooth easing */
        }
      `}} />
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
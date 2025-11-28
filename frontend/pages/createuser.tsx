import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Spinner } from '../components/common/Spinner';
import Button from '../components/elements/Button';
import PanelButtons from '../components/elements/PanelButtons'; // Re-importing to fix cache
import { UserAddIcon } from '../components/common/Icons';
import { useAuth } from '../components/auth/AuthContext';
import { LoginScreen } from '../components/LoginScreen';
import { Table, Column } from '../components/elements/Table';
import Input from '@/components/elements/Input';
import { User } from '../types';
import { putUser } from '../services/users';
import { Toast } from '@/components/common/Toast';

declare const XLSX: any;

const CreateUser: React.FC = () => {
    const { user, loading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [message, setMessage] = useState('');
    const [role, setRole] = useState('VENDEDOR');
    const [assignedRoutes, setAssignedRoutes] = useState<string[]>([]);
    const [usersList, setUsersList] = useState<User[]>([
        // Dummy data for visualization until backend is connected
        { id: '1', username: 'ejemplo_user', role: 'VENDEDOR', assigned_routes: ['Ruta 1', 'Ruta 2'] }
    ]);
    const [searchTerm, setSearchTerm] = useState('');

    const userColumns: Column<User>[] = [
        { header: "Usuario", accessorKey: "username" },
        {
            header: "Rol",
            render: (u) => (
                <span className="bg-blue-900/50 text-blue-200 px-2 py-0.5 rounded text-xs">
                    {u.role}
                </span>
            )
        },
        {
            header: "Rutas Asignadas",
            render: (u) => (
                <span className="text-[#b2e1d8]/70">
                    {Array.isArray(u.assigned_routes) ? u.assigned_routes.join(", ") : u.assigned_routes}
                </span>
            )
        },
        {
            header: "Acciones",
            headerClassName: "text-center",
            className: "text-center",
            render: (u) => (
                <button className="text-[#b2e1d8] hover:text-white mx-1">Editar</button>
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

    const cargarUsuariosDesdeBD = () => {
        // TODO: Implementar carga de usuarios
        console.log("Cargar usuarios...");
    }

    const handleSaveToDatabase = () => {
        // TODO: Implementar guardado
        console.log("Guardar cambios...");
        const payload = {
            usuario: username,
            clave: password,
            rol: role,
            rutaAsignada: assignedRoutes
        };
        putUser(payload);

        try {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setMessage("Usuario guardado exitosamente");
        } catch (error) {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setMessage("Error al guardar el usuario");
        }

    }

    return (
        <div className="min-h-screen text-[#b2e1d8] font-sans">
            <main className="space-y-6">

                {/* Panel de Botones Unificado */}
                <PanelButtons
                    title="Gestión de Usuarios"
                    subtitle="Administra los usuarios y sus roles"
                    cargarDesdeBD={cargarUsuariosDesdeBD}
                    handleSaveToDatabase={handleSaveToDatabase}
                    itemCount={usersList.length}
                    itemLabel={usersList.length === 1 ? 'usuario' : 'usuarios'}
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
                                data={usersList}
                                columns={userColumns}
                                keyExtractor={(u) => u.id || u.username}
                            />

                            {/* Paginación simple si es necesaria */}
                            <div className="p-3 border-t border-[#b2e1d8]/20 flex justify-end">
                                <span className="text-xs text-[#b2e1d8]/50">Mostrando {usersList.length} de {usersList.length}</span>
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
                                    <select className="w-full bg-[#19322f] border border-[#b2e1d8]/30 rounded-lg p-2.5 text-[#b2e1d8] focus:ring-1 focus:ring-[#b2e1d8] focus:border-[#b2e1d8] outline-none transition-all">
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
                                        onChange={(e) => setAssignedRoutes(e.target.value.split(", ").map(r => r.trim()))}
                                        className="w-full bg-[#19322f] border border-[#b2e1d8]/30 rounded-lg p-2.5 text-[#b2e1d8] focus:ring-1 focus:ring-[#b2e1d8] focus:border-[#b2e1d8] outline-none transition-all"
                                        placeholder="Ej: R1, R2 (separadas por coma)"
                                    />
                                    <p className="text-xs text-[#b2e1d8]/50 mt-1">Separa las rutas con comas</p>
                                </div>


                            </form>
                        </Card>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default CreateUser;
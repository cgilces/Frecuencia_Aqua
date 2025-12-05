/****************************************************************************************
 *  AddClientModal.tsx – Modal con búsqueda + creación de cliente nuevo
 ****************************************************************************************/
import React, { useState } from 'react';
import { RawClientData } from '../types';
import { SearchIcon, XCircleIcon } from './common/Icons';
import { Spinner } from './common/Spinner';

interface AddClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddClient: (clientData: RawClientData) => void;
    availableRoutes?: string[];
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
    isOpen,
    onClose,
    onAddClient,
    availableRoutes = []
}) => {

    const BACKEND = "http://localhost:5000";

    // estado general
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any | null>(null);
    const [selectedRoute, setSelectedRoute] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loadingProgress, setLoadingProgress] = useState('');

    const [showNewClientForm, setShowNewClientForm] = useState(false);

    /**************************************************************************
     * 🔍 BUSCAR CLIENTES EN BACKEND
     **************************************************************************/
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchTerm.trim()) return;

        setIsLoading(true);
        setErrorMessage('');
        setSearchResults([]);
        setSelectedClient(null);
        setShowNewClientForm(false);
        setLoadingProgress('Buscando clientes...');

        try {
            const res = await fetch(`${BACKEND}/api/clientes/buscar?term=${encodeURIComponent(searchTerm)}`);
            const data = await res.json();

            if (!res.ok) throw new Error("Error al buscar en backend");

            if (Array.isArray(data) && data.length > 0) {
                setSearchResults(data);
            } else {
                setErrorMessage("No se encontraron clientes.");
            }

        } catch (error: any) {
            setErrorMessage(error.message || "Error inesperado.");
        } finally {
            setIsLoading(false);
            setLoadingProgress('');
        }
    };

    /**************************************************************************
     * 📌 OBTENER DIRECCIÓN (BACKEND)
     **************************************************************************/
    const handleSelectClient = async (client: any) => {
        setSelectedClient(null);
        setIsLoading(true);
        setErrorMessage('');
        setLoadingProgress("Obteniendo dirección...");

        try {
            const res = await fetch(`${BACKEND}/api/movilvendor/get/direccion/${client.codigo}`);
            const data = await res.json();

            setSelectedClient({
                ...client,
                addressData: data || null
            });

        } catch (err) {
            setErrorMessage("No se pudo obtener la dirección.");
            setSelectedClient({ ...client, addressData: null });
        } finally {
            setIsLoading(false);
            setLoadingProgress('');
        }
    };

    /**************************************************************************
     * 💾 GUARDAR CLIENTE EXISTENTE EN POSTGRES
     **************************************************************************/
    const handleConfirmAdd = async () => {
        if (!selectedClient) return;
        if (!selectedRoute) return alert("Seleccione una ruta.");

        const payload: RawClientData = {
            "RUC": selectedClient.identificacion,
            "Nombre a Mostrar": selectedClient.nombre,
            "Cliente (Nombre)": selectedClient.nombre,
            "Cliente (Identificación)": selectedClient.identificacion,
            "Cliente": selectedClient.codigo,
            "Teléfono": selectedClient.addressData?.phone || "",
            "Categoria": selectedClient.categoria_precio || "",
            "Ruta": selectedRoute,
            "Cliente (Estatus)": "1",
            "Estatus": "Activo",
            "Dirección (Descripción)": selectedClient.addressData?.address || "",
            "Dirección (Calle principal)": selectedClient.addressData?.main_street || "",
            "Dirección (Calle secundaria)": selectedClient.addressData?.secondary_street || "",
            "Dirección (Referencia)": selectedClient.addressData?.reference || "",
            "Dirección (Nombre)": selectedClient.addressData?.code || selectedClient.codigo,
            "Dirección": selectedClient.addressData?.code || selectedClient.codigo,
        };

        try {
            const res = await fetch(`${BACKEND}/api/clientes/agregar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al guardar cliente");

            onAddClient(payload);
            handleClose();

        } catch (error: any) {
            setErrorMessage(error.message);
        }
    };

    /**************************************************************************
     * FORMULARIO PARA CREAR UN CLIENTE NUEVO
     **************************************************************************/
    const NewClientForm = () => {

        const [form, setForm] = useState({
            identificacion: "",
            nombre: "",
            telefono: "",
            categoria_precio: "",
            correo: "",
            ruta: "",
            direccion_principal: "",
            direccion_secundaria: "",
            referencia: ""
        });

        const handleChange = (e: any) => {
            setForm({ ...form, [e.target.name]: e.target.value });
        };

        const handleCreate = async () => {
            if (!form.nombre || !form.identificacion || !form.ruta) {
                alert("Complete los campos obligatorios.");
                return;
            }

            // -----------------------------------------------------------
            // 🔥 TRANSFORMACIÓN AL FORMATO QUE EL BACKEND ESPERA
            // -----------------------------------------------------------

            const codigoGenerado = String(Date.now()).slice(-6); // genera código único
            const direccionCodigo = "DIR-" + codigoGenerado;

            const payload: RawClientData = {
                "RUC": form.identificacion,
                "Nombre a Mostrar": form.nombre,
                "Cliente (Nombre)": form.nombre,
                "Cliente (Identificación)": form.identificacion,
                "Cliente": codigoGenerado,
                "Teléfono": form.telefono || "",
                "Categoria": form.categoria_precio || "",
                "Ruta": form.ruta,
                "Cliente (Estatus)": "1",
                "Estatus": "Activo",
                "Correo": form.correo || "",

                // Dirección completa
                "Dirección (Descripción)": `${form.direccion_principal} ${form.direccion_secundaria}`,
                "Dirección (Calle principal)": form.direccion_principal,
                "Dirección (Calle secundaria)": form.direccion_secundaria,
                "Dirección (Referencia)": form.referencia,
                "Dirección (Nombre)": direccionCodigo,
                "Dirección": direccionCodigo
            };

            console.log("📦 Payload enviado al backend (/api/clientes/agregar):", payload);

            try {
                const res = await fetch(`${BACKEND}/api/clientes/agregar`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "No se pudo crear el cliente");

                alert("Cliente creado correctamente.");
                handleClose();

            } catch (err: any) {
                alert(err.message);
            }
        };



        return (
            <div className="bg-[#1f2d29] p-4 rounded-lg border border-[#b2e1d8]/20">
                <h3 className="text-[#b2e1d8] font-bold text-lg mb-3">Crear Cliente Nuevo</h3>

                <div className="grid grid-cols-2 gap-3 text-white">

                    <input name="identificacion" placeholder="Identificación*" value={form.identificacion} onChange={handleChange}
                        className="bg-[#0f1a18] px-3 py-2 rounded" />

                    <input name="nombre" placeholder="Nombre Completo*" value={form.nombre} onChange={handleChange}
                        className="bg-[#0f1a18] px-3 py-2 rounded" />

                    <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange}
                        className="bg-[#0f1a18] px-3 py-2 rounded" />

                    <input name="correo" placeholder="Correo" value={form.correo} onChange={handleChange}
                        className="bg-[#0f1a18] px-3 py-2 rounded" />

                    <input name="categoria_precio" placeholder="Categoría Precio" value={form.categoria_precio} onChange={handleChange}
                        className="bg-[#0f1a18] px-3 py-2 rounded" />

                </div>

                <label className="text-[#b2e1d8] block mt-3">Ruta *</label>
                <select
                    name="ruta"
                    value={form.ruta}
                    onChange={handleChange}
                    className="w-full bg-[#0f1a18] text-white rounded px-3 py-2"
                >
                    <option value="">Seleccione ruta...</option>
                    {availableRoutes.map(r => (
                        <option key={r} value={r}>Ruta {r}</option>
                    ))}
                </select>

                <h4 className="text-[#b2e1d8] font-semibold mt-4 mb-2">Dirección</h4>

                <input name="direccion_principal" placeholder="Calle principal" value={form.direccion_principal}
                    onChange={handleChange} className="w-full bg-[#0f1a18] text-white rounded px-3 py-2 mb-2" />

                <input name="direccion_secundaria" placeholder="Calle secundaria" value={form.direccion_secundaria}
                    onChange={handleChange} className="w-full bg-[#0f1a18] text-white rounded px-3 py-2 mb-2" />

                <input name="referencia" placeholder="Referencia" value={form.referencia}
                    onChange={handleChange} className="w-full bg-[#0f1a18] text-white rounded px-3 py-2 mb-2" />

                <button onClick={handleCreate}
                    className="mt-4 w-full py-3 rounded bg-[#b2e1d8] text-[#19322f] font-bold">
                    Guardar Cliente Nuevo
                </button>
            </div>
        );
    };

    /**************************************************************************
     * RESET
     **************************************************************************/
    const handleClose = () => {
        setSearchTerm('');
        setSearchResults([]);
        setSelectedClient(null);
        setSelectedRoute('');
        setErrorMessage('');
        setShowNewClientForm(false);
        onClose();
    };

    if (!isOpen) return null;

    /**************************************************************************
     * RENDER DEL MODAL
     **************************************************************************/
    return (
        <div className="fixed inset-0 bg-[#bedacc]/90 flex items-center justify-center z-50 backdrop-blur-sm p-4">

            <div className="bg-[#16221f] w-full max-w-2xl rounded-xl border border-[#b2e1d8]/30 flex flex-col max-h-[90vh]">

                {/* HEADER */}
                <div className="p-4 border-b border-[#b2e1d8]/20 flex justify-between">
                    <h2 className="text-xl font-bold text-[#b2e1d8]">Agregar Cliente</h2>
                    <button onClick={handleClose} className="text-[#b2e1d8]/50 hover:text-[#b2e1d8]">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-4 overflow-y-auto flex-1">

                    {/* FORMULARIO DE NUEVO CLIENTE */}
                    {showNewClientForm && <NewClientForm />}

                    {/* BÚSQUEDA */}
                    {!selectedClient && !showNewClientForm && (
                        <>
                            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                                <input
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Buscar por nombre o RUC..."
                                    className="flex-1 bg-white border text-black rounded-lg px-4 py-2"
                                />
                                <button className="bg-[#b2e1d8] px-4 py-2 rounded-lg flex items-center gap-2 text-black font-semibold">
                                    {isLoading ? <Spinner /> : <SearchIcon className="w-5 h-5" />}
                                    Buscar
                                </button>
                            </form>

                            {errorMessage && (
                                <div className="text-red-300 bg-red-900/30 p-3 rounded mb-4">
                                    <p>{errorMessage}</p>

                                    <button
                                        className="mt-3 bg-[#b2e1d8] text-[#1a2a26] px-4 py-2 rounded font-bold"
                                        onClick={() => setShowNewClientForm(true)}
                                    >
                                        Crear Cliente Nuevo
                                    </button>
                                </div>
                            )}

                            {searchResults.map(client => (
                                <div
                                    key={client.codigo}
                                    onClick={() => handleSelectClient(client)}
                                    className="bg-[#b2e1d8]/10 p-3 rounded cursor-pointer border mb-2 border-[#b2e1d8]/20"
                                >
                                    <div className="font-bold text-[#b2e1d8]">{client.nombre}</div>
                                    <div className="text-[#b2e1d8]/60 text-sm">{client.identificacion}</div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* SELECCIÓN DE CLIENTE */}
                    {selectedClient && !showNewClientForm && (
                        <>
                            <h3 className="text-lg font-semibold text-[#b2e1d8] mb-3">
                                {selectedClient.nombre}
                            </h3>

                            <label className="block text-[#b2e1d8] mb-1">Asignar Ruta *</label>
                            <select
                                value={selectedRoute}
                                onChange={e => setSelectedRoute(e.target.value)}
                                className="w-full bg-[#19322f] border border-[#b2e1d8]/40 text-white rounded px-4 py-2"
                            >
                                <option value="">Seleccione ruta...</option>
                                {availableRoutes.map(route => (
                                    <option key={route} value={route}>
                                        Ruta {route}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}

                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-[#b2e1d8]/20 flex justify-end gap-2">
                    <button onClick={handleClose} className="text-[#b2e1d8] hover:text-white">Cancelar</button>

                    {selectedClient && (
                        <button
                            onClick={handleConfirmAdd}
                            className="bg-[#b2e1d8] text-[#19322f] px-6 py-2 rounded font-bold"
                        >
                            Guardar Cliente
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

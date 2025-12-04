
import React, { useState } from 'react';
import { RawClientData } from '../types';
import { SearchIcon, XCircleIcon } from './common/Icons';
import { Spinner } from './common/Spinner';
import { supabase } from '../supabaseClient';

interface AddClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddClient: (clientData: RawClientData) => void;
    existingSessionId: string | null;
    availableRoutes?: string[];
}

export const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onAddClient, existingSessionId, availableRoutes = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any | null>(null);
    const [selectedRoute, setSelectedRoute] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loadingProgress, setLoadingProgress] = useState('');
    const [localSessionId, setLocalSessionId] = useState<string | null>(existingSessionId);

    // Helper para CORS
    const fetchWithCors = async (url: string, options: RequestInit) => {
        try {
            const res = await fetch(url, options);
            return res;
        } catch (error: any) {
            const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(url);
            return await fetch(proxyUrl, options);
        }
    };

    const handleLoginIfNeeded = async () => {
        if (localSessionId) return localSessionId;

        const loginBody = JSON.stringify({
            "action": "login",
            "login": "7",
            "password": "Aqua2026.",
            "context": "grupoaqua"
        });

        const res = await fetchWithCors('https://s31.mobilvendor.com/web-service', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: loginBody
        });

        if (!res.ok) throw new Error('Error de conexión al hacer login');
        const data = await res.json();

        if (data.status === false || data.type === 'error') {
            throw new Error(data.message || 'Error de credenciales en API');
        }

        if (!data.session_id) throw new Error('No se obtuvo session_id');

        setLocalSessionId(data.session_id);
        return data.session_id;
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setIsLoading(true);
        setErrorMessage('');
        setSearchResults([]);
        setSelectedClient(null);
        setLoadingProgress('Buscando en base de datos...');

        try {
            const sanitizedTerm = searchTerm.trim();

            const { data, error } = await supabase
                .from('api_customers')
                .select('*')
                .or(`name.ilike.%${sanitizedTerm}%,identity_.ilike.%${sanitizedTerm}%`)
                .limit(50);

            if (error) throw error;

            if (data && data.length > 0) {
                const activeClients = data.filter(c => String(c.status) === '1');
                if (activeClients.length > 0) {
                    setSearchResults(activeClients);
                } else {
                    setErrorMessage('Se encontraron clientes, pero ninguno está activo.');
                }
            } else {
                setErrorMessage('No se encontraron resultados en el catálogo local. Asegúrate de haber sincronizado.');
            }

        } catch (err: any) {
            console.error("Error search DB:", err);
            setErrorMessage(err.message || 'Error al buscar en base de datos');
        } finally {
            setIsLoading(false);
            setLoadingProgress('');
        }
    };

    const handleSelectClient = async (client: any) => {
        setIsLoading(true);
        setErrorMessage('');
        setLoadingProgress('Obteniendo dirección desde API...');

        try {
            const sid = await handleLoginIfNeeded();

            const addressBody = JSON.stringify({
                "session_id": sid,
                "action": "get",
                "schema": "customer_addresses",
                "page": 1,
                "limit": 5,
                "filter": `customer_code = '${client.code}'`
            });

            const res = await fetchWithCors('https://s31.mobilvendor.com/web-service', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: addressBody
            });

            const addrData = await res.json();
            let address = null;

            if (addrData.records && addrData.records.length > 0) {
                address = addrData.records[0];
            }

            const fullClientData = {
                ...client,
                addressData: address
            };

            setSelectedClient(fullClientData);
            setSelectedRoute('');

        } catch (err: any) {
            setErrorMessage('Error al obtener detalles: ' + err.message);
            setSelectedClient({ ...client, addressData: null });
        } finally {
            setIsLoading(false);
            setLoadingProgress('');
        }
    };

    const handleConfirmAdd = () => {
        if (!selectedClient) return;
        if (!selectedRoute) {
            alert('Debes asignar una ruta.');
            return;
        }

        const rawData: RawClientData = {
            'RUC': selectedClient.identity_,
            'Nombre a Mostrar': selectedClient.name,
            'Cliente (Nombre)': selectedClient.name,
            'Cliente (Identificación)': selectedClient.identity_,
            'Cliente': selectedClient.code,
            'Teléfono': selectedClient.addressData?.phone || selectedClient.contact || '',
            'Categoria': selectedClient.price_list_code_lookup || '',
            'Ruta': selectedRoute,
            'Ruta (Nombre)': selectedRoute,
            'Cliente (Estatus)': '1',
            'Estatus': 'Activo',
            'Dirección (Descripción)': selectedClient.addressData?.address || '',
            'Dirección (Calle principal)': selectedClient.addressData?.main_street || '',
            'Dirección (Calle secundaria)': selectedClient.addressData?.secondary_street || '',
            'Dirección (Referencia)': selectedClient.addressData?.reference || '',
            'Dirección (Nombre)': selectedClient.addressData?.code || selectedClient.code,
            'Dirección': selectedClient.addressData?.code || selectedClient.code,
        };

        onAddClient(rawData);
        handleClose();
    };

    const handleClose = () => {
        setSearchTerm('');
        setSearchResults([]);
        setSelectedClient(null);
        setSelectedRoute('');
        setErrorMessage('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#bedacc]/90 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-[#16221f] w-full max-w-2xl rounded-xl border border-[#b2e1d8]/30 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 sm:p-6 border-b border-[#b2e1d8]/20 flex justify-between items-center">
                    <h2 className="text-base sm:text-xl font-bold text-[#b2e1d8]">Agregar Cliente</h2>
                    <button onClick={handleClose} className="text-[#b2e1d8]/50 hover:text-[#b2e1d8]">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                    {!selectedClient ? (
                        <>
                            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-6">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1 bg-[#ffffff] border border-[#b2e1d8]/40 text-[#162b25] rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-[#b2e1d8] outline-none placeholder-[#162b25]/70 text-sm sm:text-base"
                                    placeholder="Buscar por Nombre o RUC..."
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-[#b2e1d8] hover:bg-[#bedacc] text-[#162b25] px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 font-semibold w-full sm:w-auto"
                                >
                                    {isLoading ? <Spinner /> : <SearchIcon className="w-5 h-5" />}
                                    <span>Buscar</span>
                                </button>
                            </form>

                            {isLoading && loadingProgress && (
                                <p className="text-[#b2e1d8] text-sm mb-4 animate-pulse text-center">
                                    {loadingProgress}
                                </p>
                            )}

                            {errorMessage && (
                                <p className="text-red-300 bg-red-900/20 p-3 rounded mb-4 border border-red-800/50 text-sm break-words">
                                    {errorMessage}
                                </p>
                            )}

                            <div className="space-y-2">
                                {searchResults.map(client => (
                                    <div
                                        key={client.code}
                                        onClick={() => handleSelectClient(client)}
                                        className="bg-[#b2e1d8]/5 hover:bg-[#bedacc]/10 p-3 rounded-lg cursor-pointer border border-[#b2e1d8]/20 transition-colors group"
                                    >
                                        <div className="font-bold text-[#b2e1d8] group-hover:text-white">{client.name}</div>
                                        <div className="text-sm text-[#b2e1d8]/60 flex justify-between mt-1">
                                            <span>RUC: {client.identity_}</span>
                                            <span>Código: {client.code}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-[#19322f] p-4 rounded-lg border border-[#b2e1d8]/30">
                                <h3 className="text-lg font-semibold text-[#b2e1d8] mb-2">{selectedClient.name}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm text-[#b2e1d8]/80">
                                    <p><span className="text-[#b2e1d8]/50">RUC:</span> {selectedClient.identity_}</p>
                                    <p><span className="text-[#b2e1d8]/50">Teléfono:</span> {selectedClient.addressData?.phone || 'N/A'}</p>
                                    <p className="col-span-1 sm:col-span-2"><span className="text-[#b2e1d8]/50">Dirección:</span> {selectedClient.addressData?.address || 'Sin dirección registrada'}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#b2e1d8] mb-1">Asignar Ruta *</label>
                                <select
                                    value={selectedRoute}
                                    onChange={(e) => setSelectedRoute(e.target.value)}
                                    className="w-full bg-[#19322f] border border-[#b2e1d8]/40 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#b2e1d8] outline-none"
                                >
                                    <option value="">Seleccionar ruta...</option>
                                    {availableRoutes.map(route => (
                                        <option key={route} value={route}>
                                            Ruta {route}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-[#b2e1d8]/50 mt-1">Selecciona la ruta para este cliente.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 sm:p-6 border-t border-[#b2e1d8]/20 bg-[#16221f] rounded-b-xl flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                    <button
                        onClick={selectedClient ? () => setSelectedClient(null) : handleClose}
                        className="px-4 py-2 text-[#b2e1d8] hover:text-white hover:bg-[#b2e1d8]/10 rounded-lg w-full sm:w-auto order-2 sm:order-1"
                    >
                        {selectedClient ? 'Volver a buscar' : 'Cancelar'}
                    </button>
                    {selectedClient && (
                        <button
                            onClick={handleConfirmAdd}
                            className="bg-[#b2e1d8] hover:bg-[#9adfd3] text-[#19322f] px-6 py-2 rounded-lg font-bold w-full sm:w-auto order-1 sm:order-2"
                        >
                            Agregar Cliente
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

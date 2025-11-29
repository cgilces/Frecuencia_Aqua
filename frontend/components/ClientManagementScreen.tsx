// =============================================================
//  CLIENT MANAGEMENT SCREEN – Versión corregida y optimizada
// =============================================================

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { RawClientData, DisplayClient, DAY_MAP, DAY_NAMES, User } from '../types';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import PanelButtons from './elements/PanelButtons';
import { Table, Column } from './elements/Table';
import {
    FilterIcon, ChevronLeftIcon, ChevronRightIcon,
    SaveIcon, CloudIcon, UserAddIcon, DatabaseIcon,
    UploadIcon, DownloadIcon
} from './common/Icons';
import Button from './elements/Button';

declare const XLSX: any;

interface Props {
    user: User;
}

const itemsPerPage = 50;

const VISIT_PATTERNS = [
    { id: 'lunes-jueves', label: 'Lunes y Jueves' },
    { id: 'martes-viernes', label: 'Martes y Viernes' },
    { id: 'miercoles-sabado', label: 'Miércoles y Sábado' },
    { id: 'lunes', label: 'Solo Lunes' },
    { id: 'martes', label: 'Solo Martes' },
    { id: 'miercoles', label: 'Solo Miércoles' },
    { id: 'jueves', label: 'Solo Jueves' },
    { id: 'viernes', label: 'Solo Viernes' },
    { id: 'sabado', label: 'Solo Sábado' },
];

const ClientManagementScreen: React.FC<Props> = ({ user }) => {

    // =============================================================
    // STATE GLOBAL
    // =============================================================
    const [clients, setClients] = useState<DisplayClient[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const isAdmin =
        (user as any).rol === 'ADMIN' || (user as any).role === 'ADMIN';

    const rutasAsignadas: string[] =
        (user as any).rutas_asignadas || (user as any).assigned_routes || [];


    // =============================================================
    // TOGGLE DAY
    // =============================================================
    const toggleDay = (ruc: string, day: string) => {
        setClients(prev =>
            prev.map(c =>
                c.ruc === ruc
                    ? {
                        ...c,
                        days: {
                            ...c.days,
                            [day]: !c.days?.[day as keyof typeof c.days]
                        },
                        [day]: !c[day as keyof typeof c]
                    }
                    : c
            )
        );
    };

    const getClientPattern = (client: DisplayClient) => {
        if (client.inactivo) return 'inactivo';

        const d = client.days;
        if (!d) return 'none';

        // Check for common patterns
        if (d.lunes && d.jueves && !d.martes && !d.miercoles && !d.viernes && !d.sabado) return 'lunes-jueves';
        if (d.martes && d.viernes && !d.lunes && !d.miercoles && !d.jueves && !d.sabado) return 'martes-viernes';
        if (d.miercoles && d.sabado && !d.lunes && !d.martes && !d.jueves && !d.viernes) return 'miercoles-sabado';

        // Check for single days
        const activeDays = Object.entries(d).filter(([_, v]) => v).map(([k]) => k);
        if (activeDays.length === 1) return activeDays[0];

        if (activeDays.length === 0) return 'none';

        return 'custom';
    };

    const handlePatternChange = (clientId: string, patternId: string) => {
        if (patternId === 'custom') return;

        setClients(prev => prev.map(c => {
            if (c.id !== clientId) return c;

            if (patternId === 'inactivo') {
                return { ...c, inactivo: true };
            }

            const newDays = {
                lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false
            };

            if (patternId === 'lunes-jueves') { newDays.lunes = true; newDays.jueves = true; }
            else if (patternId === 'martes-viernes') { newDays.martes = true; newDays.viernes = true; }
            else if (patternId === 'miercoles-sabado') { newDays.miercoles = true; newDays.sabado = true; }
            else if (['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'].includes(patternId)) {
                newDays[patternId as keyof typeof newDays] = true;
            }

            return { ...c, inactivo: false, days: newDays };
        }));
    };


    // =============================================================
    // FILTROS
    // =============================================================
    const allowedClients = useMemo(() => {
        if (isAdmin) return clients;

        if (!rutasAsignadas || rutasAsignadas.length === 0) {
            console.warn("Usuario sin rutas → se muestran todos");
            return clients;
        }

        return clients.filter(c => rutasAsignadas.includes(c.ruta));
    }, [clients, isAdmin, rutasAsignadas]);

    const filteredClients = useMemo(() => {
        if (!selectedRoute) return allowedClients;
        return allowedClients.filter(c => c.ruta === selectedRoute);
    }, [allowedClients, selectedRoute]);


    const uniqueRoutes = useMemo(() => {
        const set = new Set(
            allowedClients
                .map(c => c.ruta)
                .filter(r => r && r.trim() !== '')
        );
        return [...set].sort();
    }, [allowedClients]);


    // =============================================================
    // PAGINACIÓN
    // =============================================================
    const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));

    const paginatedClients = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredClients.slice(start, start + itemsPerPage);
    }, [filteredClients, currentPage]);

    const goToNextPage = () =>
        setCurrentPage(p => Math.min(p + 1, totalPages));

    const goToPrevPage = () =>
        setCurrentPage(p => Math.max(p - 1, 1));


    // =============================================================
    // GENERAR PLANILLA (YA SIN ERRORES)
    // =============================================================
    const generatedSchedule = useMemo(() => {

        return filteredClients.flatMap(client => {
            if (client.inactivo) return [];

            const safeDays = client.days || {
                lunes: false,
                martes: false,
                miercoles: false,
                jueves: false,
                viernes: false,
                sabado: false
            };

            return Object.entries(safeDays)
                .filter(([_, v]) => v)
                .map(([dayKey]) => ({
                    ...client.originalData ?? {},
                    "Día": DAY_NAMES[dayKey as keyof typeof DAY_NAMES],
                    "Ruta": client.ruta,
                    "Dirección": client.addressDescription ?? "",
                    "Cliente (Nombre)": client.nombre,
                    "Dirección (Descripción)": client.addressDescription ?? "",
                    "generatedId": `${client.ruc}-${dayKey}`,
                }));
        });

    }, [filteredClients]);


    // =============================================================
    // DESCARGAR EXCEL
    // =============================================================
    const handleDownloadExcel = useCallback(() => {
        if (generatedSchedule.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }

        const ws = XLSX.utils.json_to_sheet(generatedSchedule);
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, "Planilla");

        XLSX.writeFile(wb, `Planilla_Rutas_${selectedRoute || 'Completa'}.xlsx`);
    }, [generatedSchedule, selectedRoute]);


    // =============================================================
    // GUARDAR EN BASE DE DATOS
    // =============================================================


    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000); // <-- DESAPARECE SOLO
    };




    const handleSaveToDatabase = async () => {
        if (clients.length === 0) {
            alert('No hay datos para guardar.');
            return;
        }

        setIsLoading(true);
        setLoadingMessage('Guardando en la base de datos...');

        try {
            const payload = clients.map(client => ({
                "RUC": client.ruc || "",
                "Nombre a Mostrar": client.nombre || "",
                "Teléfono": client.telefono || "",
                "Categoria": client.categoria || "",
                "Latitud geográfica": client.originalData?.["Latitud geográfica"] || null,
                "Longitud geográfica": client.originalData?.["Longitud geográfica"] || null,
                "ZONA": client.originalData?.["ZONA"] || null,
                "Ruta": client.ruta || "",
                "L": client.days?.lunes || false,
                "M": client.days?.martes || false,
                "X": client.days?.miercoles || false,
                "J": client.days?.jueves || false,
                "V": client.days?.viernes || false,
                "S": client.days?.sabado || false,
                "INACTIVO": client.inactivo || false,
                "Novedad": client.originalData?.["Novedad"] || ""
            }));

            // 📌 **AQUÍ LA CONSOLA PARA VER EXACTAMENTE LO QUE SE ENVÍA**
            console.log("=== PAYLOAD ENVIADO A BD ===");
            console.log(JSON.stringify(payload, null, 2));
            console.log("Total de registros:", payload.length);

            const res = await fetch("http://localhost:5000/api/rutas/guardar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rutas: payload })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.msg || "Error al guardar");

            showToast("Datos guardados correctamente en PostgreSQL.", "success");


        } catch (error: any) {
            alert(`Error al guardar: ${error.message}`);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };



    // =============================================================
    // SINCRONIZAR API
    // =============================================================
    const handleApiSync = async () => {
        setIsLoading(true);
        setLoadingMessage("Sincronizando catálogo desde el servidor...");

        try {
            const res = await fetch("http://localhost:5000/api/mobilvendor/sync-clientes", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || data.msg);

            setToast({ message: "Sincronización completada.", type: "success" });

        } catch (err: any) {
            alert("Error en sincronización: " + err.message);
        } finally {
            setIsLoading(false);
            setLoadingMessage("");
        }
    };


    // =============================================================
    // PROCESAR EXCEL
    // =============================================================
    const processRawData = useCallback((data: RawClientData[]) => {
        const map = new Map<string, DisplayClient>();

        const REVERSE_DAY_NAMES: Record<string, keyof DisplayClient['days']> = {};
        Object.entries(DAY_NAMES).forEach(([k, v]) => {
            REVERSE_DAY_NAMES[v] = k as keyof DisplayClient['days'];
            REVERSE_DAY_NAMES[v.toLowerCase()] = k as keyof DisplayClient['days'];
        });

        data.forEach(row => {
            const id =
                row['Cliente (Identificación)'] ||
                row['RUC'] ||
                row['ruc'] ||
                row['code'];

            if (!id) return;

            if (!map.has(id)) {
                map.set(id, {
                    id,
                    ruc: id,
                    nombre: row['Cliente (Nombre)'] || row['Nombre a Mostrar'] || 'Sin Nombre',
                    telefono: row['Teléfono'] || "",
                    categoria: row['Categoria'] || "",
                    ruta: row['Ruta'] || "",
                    days: {
                        lunes: false,
                        martes: false,
                        miercoles: false,
                        jueves: false,
                        viernes: false,
                        sabado: false
                    },
                    inactivo: row['INACTIVO'] || false,
                    originalData: row,
                    addressDescription: row['Dirección (Descripción)'] || ''
                });
            }

            const client = map.get(id)!;

            if (row['Día']) {
                const v = row['Día'];
                const key = REVERSE_DAY_NAMES[String(v).trim()];
                if (key) client.days[key] = true;
            }
        });

        return [...map.values()];
    }, []);


    const loadDataIntoState = useCallback((data: RawClientData[]) => {
        setClients(processRawData(data));
        setSelectedRoute('');
    }, [processRawData]);


    // =============================================================
    // SUBIR ARCHIVO EXCEL
    // =============================================================
    const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setLoadingMessage("Procesando archivo Excel...");

        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json: RawClientData[] = XLSX.utils.sheet_to_json(sheet);

            if (json.length === 0)
                return alert("El archivo está vacío.");

            loadDataIntoState(json);

        } finally {
            event.target.value = "";
            setIsLoading(false);
            setLoadingMessage("");
        }
    }, [loadDataIntoState]);


    // =============================================================
    // CARGAR DESDE BD
    // =============================================================
    const cargarClientesDesdeBD = async () => {
        try {
            setIsLoading(true);

            const stored = localStorage.getItem("app_user_session");
            if (!stored) return;

            const u = JSON.parse(stored);

            const url =
                u.role === "ADMIN"
                    ? "http://localhost:5000/api/rutas/filtrar?rol=ADMIN"
                    : `http://localhost:5000/api/rutas/filtrar?rol=${u.role}&ruta=${u.username}`;

            const res = await fetch(url);
            const data = await res.json();

            const clientesConvertidos = data.map((item: any) => ({
                id: item.ruc,
                ruc: item.ruc,
                nombre: item.nombreMostrar,

                ruta: item.ruta,
                telefono: item.telefono,
                categoria: item.categoria,
                addressDescription: item.direccion ?? "",

                // Unificamos las columnas de días
                days: {
                    lunes: item.l ?? false,
                    martes: item.m ?? false,
                    miercoles: item.x ?? false,
                    jueves: item.j ?? false,
                    viernes: item.v ?? false,
                    sabado: item.s ?? false,
                },

                inactivo: item.inactivo ?? false,

                // Para que el guardado funcione como si viniera de Excel
                originalData: {
                    "Cliente (Identificación)": item.ruc,
                    "Cliente (Nombre)": item.nombreMostrar,
                    "Teléfono": item.telefono,
                    "Categoria": item.categoria,
                    "Ruta": item.ruta,
                    "Dirección (Descripción)": item.direccion,
                    "INACTIVO": item.inactivo,
                }
            }));

            setClients(clientesConvertidos);

        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarClientesDesdeBD();
    }, [user]);



    // =============================================================
    // COLUMNAS TABLA
    // =============================================================
    const dayColumns: Column<DisplayClient>[] = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"].map(d => {
        const labelMap: Record<string, string> = { lunes: 'L', martes: 'M', miercoles: 'X', jueves: 'J', viernes: 'V', sabado: 'S' };
        return {
            header: labelMap[d],
            headerClassName: "text-center",
            className: "text-center",
            render: (client) => (
                <input
                    type="checkbox"
                    checked={client.days?.[d as keyof typeof client.days] || false}
                    onChange={() => toggleDay(client.ruc, d)}
                    className="w-4 h-4 accent-[#7cac3c]"
                />
            )
        };
    });

    const columns: Column<DisplayClient>[] = [
        { header: "RUC", accessorKey: "ruc" },
        {
            header: "Cliente",
            render: (client) => (
                <>
                    <div className="font-bold text-[#b2e1d8]">{client.nombre}</div>
                    <div className="text-xs text-[#b2e1d8]/60">{client.addressDescription}</div>
                </>
            )
        },
        { header: "Ruta", accessorKey: "ruta" },
        ...dayColumns,
        {
            header: "Inactivo",
            headerClassName: "text-center",
            className: "text-center",
            render: (client) => (
                <input
                    type="checkbox"
                    checked={client.inactivo}
                    onChange={() => toggleDay(client.ruc, "inactivo")}
                    className="w-4 h-4 accent-[#7cac3c]"
                />
            )
        }
    ];

    const renderMobileItem = (client: DisplayClient) => (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <div>
                    <div className="font-bold text-[#b2e1d8] text-lg">{client.nombre}</div>
                    <div className="text-[#b2e1d8]/60 text-sm">{client.ruc}</div>
                </div>
                <div className="text-right">
                    <div className="text-[#b2e1d8] font-medium">{client.ruta}</div>
                    {client.inactivo && (
                        <span className="text-red-400 text-xs font-bold px-2 py-0.5 bg-red-400/10 rounded-full">
                            INACTIVO
                        </span>
                    )}
                </div>
            </div>

            <div className="text-sm text-[#b2e1d8]/80">
                {client.addressDescription}
            </div>

            {/* Selector de Patrones Móvil */}
            <div className="mt-4 mb-2">
                <label className="block text-xs font-medium text-[#b2e1d8]/60 mb-1">Asignar Días de Visita</label>
                <select
                    className="w-full bg-[#19322f] border border-[#b2e1d8]/30 text-[#b2e1d8] rounded-lg text-sm p-2 focus:ring-1 focus:ring-[#b2e1d8] outline-none"
                    value={getClientPattern(client)}
                    onChange={(e) => handlePatternChange(client.id, e.target.value)}
                >
                    <option value="none">Sin visitas asignadas</option>
                    <optgroup label="Combinaciones Comunes">
                        {VISIT_PATTERNS.filter(p => p.id.includes('-')).map(p => (
                            <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                    </optgroup>
                    <optgroup label="Días Individuales">
                        {VISIT_PATTERNS.filter(p => !p.id.includes('-')).map(p => (
                            <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                    </optgroup>
                    <option value="inactivo">Inactivo (Sin Ruta)</option>
                    <option value="custom" disabled>Personalizado (Selección manual)</option>
                </select>
            </div>

            <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#b2e1d8]/10">
                {/* Indicadores Visuales de Días */}
                <div className="flex gap-1.5">
                    {(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as const).map((day) => (
                        <button
                            key={day}
                            onClick={() => !client.inactivo && toggleDay(client.ruc, day)}
                            disabled={client.inactivo}
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors border ${client.days?.[day]
                                ? 'bg-[#b2e1d8] text-[#19322f] border-[#b2e1d8]'
                                : 'bg-transparent text-[#b2e1d8]/30 border-[#b2e1d8]/10'
                                }`}
                        >
                            {day.charAt(0).toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    // =============================================================
    // RENDER
    // =============================================================
    return (
        <div className="space-y-6">

            {/* ======================= OVERLAY LOADING ======================= */}
            {isLoading && (
                <div className="fixed inset-0 bg-[#19322f]/90 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-[#19322f] p-6 rounded-xl shadow-2xl flex flex-col items-center border border-[#b2e1d8]/30">
                        <Spinner />
                        <p className="mt-4 text-[#b2e1d8] font-medium animate-pulse">
                            {loadingMessage || 'Cargando...'}
                        </p>
                    </div>
                </div>
            )}




            {toast && (
                <div
                    className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white
      ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}
      transition-all duration-300 z-50`}
                >
                    {toast.message}
                </div>
            )}



            <PanelButtons
                isAdmin={isAdmin}
                rutasAsignadas={rutasAsignadas}
                handleFileUpload={handleFileUpload}
                handleApiSync={handleApiSync}
                handleSaveToDatabase={handleSaveToDatabase}
                selectedRoute={selectedRoute}
                setSelectedRoute={setSelectedRoute}
                setCurrentPage={setCurrentPage}
                uniqueRoutes={uniqueRoutes}
                itemCount={filteredClients.length}
                itemLabel={filteredClients.length === 1 ? 'cliente' : 'clientes'}
            />

            {/* ======================= TABLA PRINCIPAL ======================= */}
            <Table
                data={paginatedClients}
                columns={columns}
                keyExtractor={(client) => client.ruc}
                currentPage={currentPage}
                totalPages={totalPages}
                onNextPage={goToNextPage}
                onPrevPage={goToPrevPage}
                renderMobileItem={renderMobileItem}
            />

            {/* ======================= PLANILLA EXPORTACIÓN ======================= */}
            {isAdmin && (
                <Card className="p-6 bg-[#162b25] border-[#b2e1d8]/20">

                    <div className="flex justify-between mb-4">
                        <div>
                            <h2 className="text-lg text-[#b2e1d8] font-bold">
                                Planilla Generada {selectedRoute && `(Ruta ${selectedRoute})`}
                            </h2>
                            <p className="text-sm text-[#b2e1d8]/60">
                                Registros: {generatedSchedule.length}
                            </p>
                        </div>

                        <Button
                            value="Exportar Excel"
                            onClick={handleDownloadExcel}
                            disabled={generatedSchedule.length === 0}
                            className="bg-[#b2e1d8] hover:bg-[#9adfd3] text-[#19322f] px-4 py-2 rounded-lg font-bold"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            Exportar Excel
                        </Button>
                    </div>

                    <div className="max-h-96 overflow-y-auto border border-[#b2e1d8]/20 rounded-lg">
                        <table className="w-full text-xs text-[#b2e1d8]/80">
                            <thead className="bg-[#19322f] sticky top-0 text-[#b2e1d8]/60 uppercase text-center">
                                <tr className="text-center">
                                    <th className="px-4 py-2">Ruta</th>
                                    <th className="px-4 py-2">Cliente</th>
                                    <th className="px-4 py-2">Día</th>
                                    <th className="px-4 py-2">Dirección</th>
                                    <th className="px-4 py-2">Descripción</th>
                                </tr>
                            </thead>

                            <tbody>
                                {generatedSchedule.slice(0, 100).map((row: any) => (
                                    <tr key={row.generatedId} className="hover:bg-[#b2e1d8]/5">
                                        <td className="px-4 py-2 text-center">{row["Ruta"]}</td>
                                        <td className="px-4 py-2 text-center">{row["Cliente (Nombre)"]}</td>
                                        <td className="px-4 py-2 text-center">{row["Día"]}</td>
                                        <td className="px-4 py-2 text-center">{row["Dirección"]}</td>
                                        <td className="px-4 py-2 text-center">{row["Dirección (Descripción)"]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )
            }
        </div >
    );
};

export default ClientManagementScreen;



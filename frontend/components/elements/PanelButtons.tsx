import React from 'react';
import { UploadIcon, CloudIcon, SaveIcon, DatabaseIcon } from '../common/Icons';
import Button from './Button';

interface PanelButtonsProps {
    title?: string;
    subtitle?: string;
    isAdmin?: boolean;
    rutasAsignadas?: string[];
    handleFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    cargarDesdeBD?: () => void;
    handleApiSync?: () => void;
    handleSaveToDatabase?: () => void;
    selectedRoute?: string;
    setSelectedRoute?: (route: string) => void;
    setCurrentPage?: (page: number) => void;
    uniqueRoutes?: string[];
    itemCount?: number;
    itemLabel?: string;
}

const PanelButtons: React.FC<PanelButtonsProps> = ({
    title,
    subtitle,
    isAdmin,
    rutasAsignadas,
    handleFileUpload,
    cargarDesdeBD,
    handleApiSync,
    handleSaveToDatabase,
    selectedRoute,
    setSelectedRoute,
    setCurrentPage,
    uniqueRoutes,
    itemCount,
    itemLabel = 'items',
}) => {
    return (
        <div className="flex flex-col gap-4 bg-[#162b25] p-4 rounded-xl shadow-sm border border-[#b2e1d8]/20">
            {/* Header Row */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                {/* Title / Admin Info */}
                <div>
                    {title ? (
                        <>
                            <h1 className="text-2xl font-bold text-[#b2e1d8]">{title}</h1>
                            {subtitle && <p className="text-[#b2e1d8]/60 text-sm">{subtitle}</p>}
                        </>
                    ) : (
                        <div className="text-[#b2e1d8] font-semibold text-sm">
                            {isAdmin ? 'Vista de administrador' : `Ruta asignada: ${rutasAsignadas?.[0] ?? 'N/A'}`}
                        </div>
                    )}
                </div>

                {/* Action Buttons - uniform size, responsive */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                    {handleFileUpload && (
                        <label className="flex items-center justify-center gap-2 cursor-pointer bg-[#b2e1d8] hover:bg-[#9adfd3] text-[#19322f] font-bold rounded-lg h-8 px-3 text-sm w-full sm:w-auto min-w-[130px] shadow-sm transition-colors">
                            <UploadIcon className="w-4 h-4" />
                            Importar Excel
                            <input type="file" className="hidden" onChange={handleFileUpload} accept=".xlsx,.csv" />
                        </label>
                    )}

                    {cargarDesdeBD && (
                        <Button
                            onClick={cargarDesdeBD}
                            color="claroaqua"
                            className="flex items-center justify-center gap-2 bg-[#b2e1d8]/20 hover:bg-[#b2e1d8]/30 text-[#b2e1d8] rounded-lg h-8 px-3 text-sm w-full sm:w-auto min-w-[130px] transition-colors"
                        >
                            <DatabaseIcon className="w-4 h-4" />
                            {title ? 'Recargar Usuarios' : 'Recargar BD'}
                        </Button>
                    )}

                    {handleApiSync && (
                        <Button
                            onClick={handleApiSync}
                            color="claroaqua"
                            className="flex items-center justify-center gap-2  border border-[#b2e1d8]/50 hover:border-[#b2e1d8] text-[#b2e1d8] rounded-lg h-8 px-3 text-sm w-full sm:w-auto min-w-[130px] transition-colors"
                        >
                            <CloudIcon className="w-4 h-4" />
                            Sincronizar API
                        </Button>
                    )}

                    {handleSaveToDatabase && (
                        <Button
                            onClick={handleSaveToDatabase}
                            color="claroaqua"
                            className="flex items-center justify-center gap-2 bg-[#b2e1d8] hover:bg-[#9adfd3] text-[#19322f] font-bold rounded-lg h-8 px-3 text-sm w-full sm:w-auto min-w-[130px] shadow-sm transition-colors"
                        >
                            <SaveIcon className="w-4 h-4" />
                            {title ? 'Guardar Cambios' : 'Guardar BD'}
                        </Button>
                    )}

                    {itemCount !== undefined && (
                        <span className="text-[#b2e1d8]/60 text-sm whitespace-nowrap">
                            {itemCount} {itemLabel}
                        </span>
                    )}
                </div>
            </div>

            {/* Filter Row (only for Clientes) */}
            {uniqueRoutes && selectedRoute !== undefined && setSelectedRoute && (
                <div className="flex items-center gap-3 pt-2 border-t border-[#b2e1d8]/10">
                    <select
                        value={selectedRoute}
                        onChange={e => {
                            setSelectedRoute(e.target.value);
                            if (setCurrentPage) setCurrentPage(1);
                        }}
                        className="bg-[#19322f] border border-[#b2e1d8]/30 text-[#b2e1d8] text-sm rounded-lg px-3 py-2"
                    >
                        <option value="">Todas</option>
                        {uniqueRoutes.map(r => (
                            <option key={r} value={r}>
                                Ruta {r}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default PanelButtons;
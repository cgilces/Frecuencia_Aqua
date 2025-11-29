import React from 'react';
import { UploadIcon, CloudIcon, SaveIcon, DatabaseIcon } from '../common/Icons';
import Button from './Button';
import Input from './Input';

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full md:w-auto">
                    {handleFileUpload && (
                        <label className="bg-[#BEDACC] hover:bg-[#9adfd3] disabled:opacity-70 text-[#19322f] font-bold rounded-lg transition-colors flex justify-center items-center shadow-lg uppercase tracking-wider text-xs w-full h-8 gap-2 cursor-pointer">
                            <UploadIcon className="w-3 h-3" />
                            Importar Excel
                            <Input type="file" onChange={handleFileUpload} accept=".xlsx,.csv" value={''} />
                        </label>
                    )}

                    {cargarDesdeBD && (
                        <Button
                            onClick={cargarDesdeBD}
                            color="claroaqua"
                            className="w-full h-8 gap-2 text-xs"
                        >
                            <DatabaseIcon className="w-3 h-3" />
                            {title ? 'Recargar Usuarios' : 'Recargar BD'}
                        </Button>
                    )}

                    {handleApiSync && (
                        <Button
                            onClick={handleApiSync}
                            color="claroaqua"
                            className="w-full h-8 gap-2 text-xs"
                        >
                            <CloudIcon className="w-3 h-3" />
                            Sincronizar API
                        </Button>
                    )}

                    {handleSaveToDatabase && (
                        <Button
                            onClick={handleSaveToDatabase}
                            color="claroaqua"
                            className="w-full h-8 gap-2 text-xs"
                        >
                            <SaveIcon className="w-3 h-3" />
                            {title ? 'Guardar Cambios' : 'Guardar BD'}
                        </Button>
                    )}

                    {itemCount !== undefined && (
                        <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-center md:justify-end">
                            <span className="text-[#b2e1d8]/60 text-xs whitespace-nowrap px-2">
                                {itemCount} {itemLabel}
                            </span>
                        </div>
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
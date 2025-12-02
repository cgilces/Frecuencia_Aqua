import React from 'react';
import { UploadIcon, CloudIcon, SaveIcon, DatabaseIcon, RefreshIcon } from '../common/Icons';
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
        <div className="flex flex-col gap-4 bg-[#ffffff] p-6 rounded-xl shadow-lg border border-gray-300 w-full">
            {/* Header Row */}
            <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
                {/* Title / Admin Info */}
                <div className="min-w-[200px]">
                    {title ? (
                        <>
                            <h1 className="text-2xl font-bold text-[#162b25]">{title}</h1>
                            {subtitle && <p className="text-[#162b25]/60 text-sm">{subtitle}</p>}
                        </>
                    ) : (
                        <div className="text-[#162b25] font-semibold text-sm">
                            {isAdmin ? 'Vista de administrador' : `Ruta asignada: ${rutasAsignadas?.[0] ?? 'N/A'}`}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
                    {handleFileUpload && (
                        <>
                            {/* Input Oculto */}
                            <input
                                type="file"
                                id="file-upload-panel"
                                className="hidden"
                                onChange={handleFileUpload}
                            />

                            {/* Label que parece Botón */}
                            <Button
                                as="label"
                                htmlFor="file-upload-panel"
                                variant="verdeclaroaqua"
                                size="sm"
                                icon={<UploadIcon className="w-3 h-3" />}
                                className="w-full sm:w-48 h-12 border-[#b2e1d8] text-[#b2e1d8] hover:bg-[#b2e1d8]/10"
                            >
                                Subir
                            </Button>
                        </>
                    )}

                    {cargarDesdeBD && (
                        <Button
                            onClick={cargarDesdeBD}
                            variant="claroaqua"
                            size="sm"
                            className="w-full sm:w-48 h-12"
                            icon={<DatabaseIcon className="w-3 h-3" />}
                        >
                            {title ? 'Recargar Usuarios' : 'Recargar BD'}
                        </Button>
                    )}

                    {handleApiSync && (
                        <Button
                            onClick={handleApiSync}
                            variant="claroaqua"
                            size="sm"
                            className="w-full sm:w-48 h-12 shadow-md border border-[#b2e1d8]"
                            icon={<RefreshIcon className="w-3 h-3" />}
                        >
                            Sincronizar API
                        </Button>
                    )}

                    {handleSaveToDatabase && (
                        <Button
                            variant="verdeaqua"
                            icon={<SaveIcon className="w-5 h-5" />}
                            onClick={handleSaveToDatabase}
                            size="sm"
                            className="w-full sm:w-48 h-12 shadow-md border border-[#b2e1d8]/20"
                        >
                            Guardar
                        </Button>
                    )}
                </div>

                {itemCount !== undefined && (
                    <div className="flex-shrink-0">
                        <span className="text-[#b2e1d8]/60 text-xs font-mono px-3 py-1 bg-[#0f1f1b] rounded-full border border-[#b2e1d8]/10">
                            {itemCount} {itemLabel}
                        </span>
                    </div>
                )}
            </div>

            {/* Filter Row (only for Clientes) */}
            {uniqueRoutes && selectedRoute !== undefined && setSelectedRoute && (
                <div className="flex items-center gap-3 pt-4 border-t border-[#b2e1d8]/10 mt-2">
                    <label className="text-[#162b25] text-sm font-medium">Filtrar por Ruta:</label>
                    <div className="relative">
                        <select
                            value={selectedRoute}
                            onChange={e => {
                                setSelectedRoute(e.target.value);
                                if (setCurrentPage) setCurrentPage(1);
                            }}
                            className="bg-[#0f1f1b] hover:bg-[#0f1f1b]/80 border border-[#b2e1d8]/30 text-[#b6c6c1] text-sm rounded-lg pl-3 pr-8 py-2 appearance-none focus:outline-none focus:ring-1 focus:ring-[#b2e1d8]"
                        >
                            <option value="">Todas las rutas</option>
                            {uniqueRoutes.map(r => (
                                <option key={r} value={r}>
                                    Ruta {r}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#b2e1d8]">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PanelButtons;


import React, { useState, useCallback } from 'react';
import { RawClientData } from '../types';
import { UploadIcon, CheckCircleIcon, XCircleIcon } from './common/Icons';
import { Spinner } from './common/Spinner';

declare const XLSX: any;

interface FileUploadScreenProps {
  onDataLoaded: (data: RawClientData[]) => void;
}

const FileUploadScreen: React.FC<FileUploadScreenProps> = ({ onDataLoaded }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      const data = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target?.result as ArrayBuffer);
        reader.onerror = err => reject(err);
        reader.readAsArrayBuffer(file);
      });

      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: RawClientData[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new Error('El archivo Excel está vacío o tiene un formato incorrecto.');
      }
      
      // Simple validation for a few key columns
      const firstRow = jsonData[0];
      const requiredCols = ['Ruta', 'Cliente (Nombre)', 'Cliente (Identificación)'];
      for (const col of requiredCols) {
        if (!(col in firstRow)) {
          throw new Error(`El archivo no contiene la columna requerida: "${col}".`);
        }
      }

      onDataLoaded(jsonData);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error inesperado al procesar el archivo.';
      setError(errorMessage);
      setFileName(null);
    } finally {
      setIsLoading(false);
       // Reset file input value to allow re-uploading the same file
       event.target.value = '';
    }
  }, [onDataLoaded]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 shadow-lg rounded-xl p-8 border border-gray-700">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Cargar Datos de Rutas</h1>
          <p className="mt-2 text-gray-400">Sube tu plantilla de Excel para comenzar a gestionar las rutas de tus clientes.</p>
        </div>

        <div className="mt-8">
          <label
            htmlFor="file-upload"
            className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold text-indigo-400">Haz clic para subir</span> o arrastra y suelta
                  </p>
                  <p className="text-xs text-gray-500">XLSX, XLS, o CSV</p>
                </>
              )}
            </div>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".xlsx, .xls, .csv" />
          </label>
        </div>

        <div className="mt-6 h-12">
          {fileName && !error && (
            <div className="flex items-center justify-center bg-green-900/50 text-green-300 p-3 rounded-lg border border-green-700">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              <span>Archivo cargado: <span className="font-medium">{fileName}</span>. Redirigiendo...</span>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center bg-red-900/50 text-red-300 p-3 rounded-lg border border-red-700">
              <XCircleIcon className="w-5 h-5 mr-2" />
              <span>Error: <span className="font-medium">{error}</span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadScreen;

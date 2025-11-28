
export interface RawClientData {
  'Ruta'?: string;
  'Ruta (Nombre)'?: string;
  'Cliente'?: string;
  'Cliente (Nombre)'?: string;
  'Cliente (Identificación)'?: string;
  'Cliente (Comentario)'?: string;
  'Cliente (Estatus)'?: string;
  'Dirección'?: string;
  'Dirección (Nombre)'?: string;
  'Dirección (Descripción)'?: string;
  'Dirección (Calle principal)'?: string;
  'Dirección (Calle secundaria)'?: string;
  'Dirección (Nomenclatura)'?: string;
  'Dirección (Referencia)'?: string;
  'Dirección (Teléfono)'?: string;
  'Dirección (Fax)'?: string;
  'Semana'?: number;
  'Día'?: number | string;
  'Secuencia'?: number;
  'Estatus'?: string;
  [key: string]: any; // Allow other properties
}

export interface DisplayClient {
  id: string; // Composite key: RUC
  ruc: string;
  nombre: string;
  telefono: string;
  categoria: string;
  ruta: string;
  addressDescription?: string;
  days: {
    lunes: boolean;
    martes: boolean;
    miercoles: boolean;
    jueves: boolean;
    viernes: boolean;
    sabado: boolean;
  };
  inactivo: boolean;
  originalData: RawClientData; // Template for generating new rows
}

export interface User {
    id: string;
    username: string;
    role: 'ADMIN' | 'VENDEDOR' | 'DESPACHADOR';
    assigned_routes: string[] | null;
}

export const DAY_MAP: { [key: number]: keyof DisplayClient['days'] } = {
  2: 'lunes',
  3: 'martes',
  4: 'miercoles',
  5: 'jueves',
  6: 'viernes',
  7: 'sabado',
};

export const DAY_NAMES: { [key in keyof DisplayClient['days']]: string } = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
};

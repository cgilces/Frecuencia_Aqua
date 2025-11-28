-- 1. Crear tabla de usuarios de la aplicación
CREATE TABLE IF NOT EXISTS public.app_users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username text UNIQUE NOT NULL,
    password text NOT NULL, -- Nota: Para producción real, esto debería estar encriptado.
    role text NOT NULL CHECK (role IN ('ADMIN', 'VENDEDOR', 'DESPACHADOR')),
    assigned_routes text[] DEFAULT NULL, -- Array de rutas permitidas ej: ['R1', 'R2']
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar seguridad
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

EATE POLICY "Lectura publica de usuarios" ON public.app_users FOR SELECT TO anon USING (true);
CREATE POLICY "Escritura publica de usuarios" ON public.app_users FOR INSERT TO anon WITH CHECK (true);

-- 4. Insertar USUARIOS DE PRUEBA (¡Puedes modificarlos!)
INSERT INTO public.app_users (username, password, role, assigned_routes)
VALUES 
    ('admin', '1234', 'ADMIN', NULL),                               
    ('PV1', '1234', 'VENDEDOR', ARRAY['PV1']), 
     ('PV2', '1234', 'VENDEDOR', ARRAY['PV2']),
     ('PV3', '1234', 'VENDEDOR', ARRAY['PV3']),
     ('PV4', '1234', 'VENDEDOR', ARRAY['PV4']),
     ('PV5', '1234', 'VENDEDOR', ARRAY['PV5']), 
     ('PV6', '1234', 'VENDEDOR', ARRAY['PV6']),
     ('PV8', '1234', 'VENDEDOR', ARRAY['PV8']),
     ('PV9', '1234', 'VENDEDOR', ARRAY['PV9']),
     ('PV10', '1234', 'VENDEDOR', ARRAY['PV10']),
     ('PV11', '1234', 'VENDEDOR', ARRAY['PV11']),
     ('PV12', '1234', 'VENDEDOR', ARRAY['PV12']),
     ('PV13', '1234', 'VENDEDOR', ARRAY['PV13']),
     ('PV14', '1234', 'VENDEDOR', ARRAY['PV14']),        
    ('T1', '1234', 'DESPACHADOR', ARRAY['T1']),
     ('T2', '1234', 'DESPACHADOR', ARRAY['T2']),
      ('T3', '1234', 'DESPACHADOR', ARRAY['T3']),
       ('T4', '1234', 'DESPACHADOR', ARRAY['T4']),
        ('T5', '1234', 'DESPACHADOR', ARRAY['T5']),
         ('T6', '1234', 'DESPACHADOR', ARRAY['T6']),
          ('T8', '1234', 'DESPACHADOR', ARRAY['T8']),
           ('T9', '1234', 'DESPACHADOR', ARRAY['T9']),
            ('T10', '1234', 'DESPACHADOR', ARRAY['T10']),
             ('T11', '1234', 'DESPACHADOR', ARRAY['T11']),
              ('T12', '1234', 'DESPACHADOR', ARRAY['T12']),
               ('T13', '1234', 'DESPACHADOR', ARRAY['T13']),
                ('T14', '1234', 'DESPACHADOR', ARRAY['T14'])
    ;   


    -- 1. Crear la tabla 'routes' con las columnas exactas usadas en la App
CREATE TABLE IF NOT EXISTS public.routes (
    "RUC" text PRIMARY KEY,
    "Nombre a Mostrar" text,
    "Teléfono" text,
    "Categoria" text,
    "Latitud geográfica" text,
    "Longitud geográfica" text,
    "ZONA" text,
    "Ruta" text,
    "L" boolean DEFAULT false,
    "M" boolean DEFAULT false,
    "X" boolean DEFAULT false,
    "J" boolean DEFAULT false,
    "V" boolean DEFAULT false,
    "S" boolean DEFAULT false,
    "INACTIVO" boolean DEFAULT false,
    "Novedad" text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar Row Level Security (RLS) es buena práctica en Supabase
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas de acceso
-- IMPORTANTE: Como tu app usa la 'anon key' sin un sistema de login de usuarios de Supabase,
-- necesitamos permitir el acceso público (o anónimo) para que el botón 'Guardar' funcione.

-- Permitir lectura a todos (anon)
CREATE POLICY "Permitir lectura publica" 
ON public.routes FOR SELECT 
TO anon 
USING (true);

-- Permitir inserción a todos (anon)
CREATE POLICY "Permitir insercion publica" 
ON public.routes FOR INSERT 
TO anon 
WITH CHECK (true);

-- Permitir actualización a todos (anon) basado en el RUC
CREATE POLICY "Permitir actualizacion publica" 
ON public.routes FOR UPDATE 
TO anon 
USING (true);

-- 1. Crear la tabla 'api_addresses' para almacenar direcciones de clientes
CREATE TABLE IF NOT EXISTS public.api_addresses (
    code text PRIMARY KEY,
    customer_code text,
    address text, -- La descripción de la dirección
    main_street text, -- Calle principal
    secondary_street text,
    reference text,
    phone text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Habilitar permisos
ALTER TABLE public.api_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso publico api_addresses" ON public.api_addresses FOR ALL TO anon USING (true) WITH CHECK (true);

-- 1. Crear la tabla 'api_customers' para almacenar información de clientes

CREATE TABLE IF NOT EXISTS public.api_customers (
    code text PRIMARY KEY,                 -- Código único del cliente (ej. "108712")
    identity_ text,                        -- RUC o Cédula (ej. "0917632325")
    name text,                             -- Nombre Fiscal/Legal
    company_name text,                     -- Nombre de la Compañía
    contact text,                          -- Persona de contacto / Teléfono
    price_list_code_lookup text,           -- Categoría legible (ej. "MINORISTAS PET")
    user_code_lookup text,                 -- Vendedor asignado (ej. "Cristian Gilces")
    status text,                           -- Estatus ("1" = Activo)
    email text,                            -- Correo (si viene en la respuesta)
    balance numeric DEFAULT 0,             -- Saldo (opcional)
    last_synced_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Habilitar seguridad y acceso público (para que la app pueda escribir)
ALTER TABLE public.api_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica api_customers" ON public.api_customers FOR SELECT TO anon USING (true);
CREATE POLICY "Escritura publica api_customers" ON public.api_customers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Actualizacion publica api_customers" ON public.api_customers FOR UPDATE TO anon USING (true);
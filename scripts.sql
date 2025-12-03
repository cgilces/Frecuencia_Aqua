------------------------------------------------------------
-- BASE DE DATOS: planillas_rutas
-- IMPORTANTE: Crear primero la base:
  CREATE DATABASE planillas_rutas;
  \c planillas_rutas;
------------------------------------------------------------

------------------------------------------------------------
--  TABLA: clientes
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
    codigo VARCHAR(50) PRIMARY KEY,
    identificacion VARCHAR(50),
    nombre VARCHAR(200),
    nombre_empresa VARCHAR(200),
    contacto VARCHAR(200),
    categoria_precio VARCHAR(50),
    vendedor_asignado VARCHAR(50),
    estado VARCHAR(50),
    correo VARCHAR(150),
    saldo DECIMAL(18,2) DEFAULT 0,
    fecha_ultima_sincronizacion TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clientes_identificacion
    ON clientes(identificacion);

CREATE INDEX IF NOT EXISTS idx_clientes_vendedor
    ON clientes(vendedor_asignado);


------------------------------------------------------------
--  TABLA: direcciones_clientes
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS direcciones_clientes (
    codigo TEXT PRIMARY KEY,
    codigo_cliente TEXT,
    direccion TEXT,
    calle_principal TEXT,
    calle_secundaria TEXT,
    referencia TEXT,
    telefono TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dir_cliente
    ON direcciones_clientes(codigo_cliente);


------------------------------------------------------------
--  TABLA: log_sincronizacion
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS log_sincronizacion (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT NOW(),
    rutas_enviadas INTEGER,
    detalles_enviados INTEGER,
    estado TEXT,
    mensaje TEXT,
    session_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_log_fecha
    ON log_sincronizacion(fecha);


------------------------------------------------------------
-- 4️⃣ TABLA: route_details
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS route_details (
    code TEXT PRIMARY KEY,
    route_code TEXT,
    customer_code TEXT,
    customer_address_code TEXT DEFAULT 'PRINCIPAL',
    week INTEGER DEFAULT 1,
    sequence INTEGER,
    day INTEGER
);

CREATE INDEX IF NOT EXISTS idx_route_details_route
    ON route_details(route_code);

CREATE INDEX IF NOT EXISTS idx_route_details_customer
    ON route_details(customer_code);


------------------------------------------------------------
--  TABLA: routes
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS routes (
    ruc TEXT PRIMARY KEY,
    nombre_mostrar TEXT,
    telefono TEXT,
    categoria TEXT,
    latitud_geografica TEXT,
    longitud_geografica TEXT,
    zona TEXT,
    ruta TEXT,
    l BOOLEAN DEFAULT false,
    m BOOLEAN DEFAULT false,
    x BOOLEAN DEFAULT false,
    j BOOLEAN DEFAULT false,
    v BOOLEAN DEFAULT false,
    s BOOLEAN DEFAULT false,
    inactivo BOOLEAN DEFAULT false,
    novedad TEXT,
    creado_en TIMESTAMP DEFAULT NOW(),
    actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_routes_categoria
    ON routes(categoria);

CREATE INDEX IF NOT EXISTS idx_routes_zona
    ON routes(zona);


------------------------------------------------------------
-- 6️TABLA: app_users
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_users (
    id SERIAL PRIMARY KEY,
    usuario TEXT UNIQUE NOT NULL,
    clave TEXT NOT NULL,
    rol TEXT CHECK (rol IN ('ADMIN', 'VENDEDOR', 'DESPACHADOR')) NOT NULL,
    rutas_asignadas TEXT[],
    creado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_users_rol
    ON app_users(rol);



















--. Insertar USUARIOS DE PRUEBA (¡Puedes modificarlos!)
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


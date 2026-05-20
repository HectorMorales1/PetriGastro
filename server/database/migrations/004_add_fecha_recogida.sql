-- Añadir columna fecha_recogida a pedidos
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fecha_recogida DATE;

-- Tabla para gestionar fechas disponibles (admin las configura)
CREATE TABLE IF NOT EXISTS fechas_disponibles (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para gestionar horarios disponibles por fecha
CREATE TABLE IF NOT EXISTS horarios_disponibles (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    disponible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fecha, hora)
);
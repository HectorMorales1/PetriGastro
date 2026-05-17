-- Tabla para configurar días de la semana disponibles
CREATE TABLE IF NOT EXISTS config_dias (
    id SERIAL PRIMARY KEY,
    dia_semana INT NOT NULL UNIQUE, -- 0=domingo, 1=lunes, ..., 6=sábado
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para configurar horarios por día de semana
CREATE TABLE IF NOT EXISTS config_horarios_dia (
    id SERIAL PRIMARY KEY,
    dia_semana INT NOT NULL,
    hora TIME NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(dia_semana, hora)
);

-- Insertar configuración por defecto (lunes a sábado)
INSERT INTO config_dias (dia_semana, activo) VALUES 
(1, true), -- lunes
(2, true), -- martes
(3, true), -- miércoles
(4, true), -- jueves
(5, true), -- viernes
(6, true)  -- sábado
ON CONFLICT (dia_semana) DO NOTHING;

-- Insertar horarios por defecto para todos los días
INSERT INTO config_horarios_dia (dia_semana, hora) VALUES
(1, '12:00:00'), (1, '13:00:00'), (1, '14:00:00'), (1, '19:00:00'), (1, '20:00:00'), (1, '21:00:00'),
(2, '12:00:00'), (2, '13:00:00'), (2, '14:00:00'), (2, '19:00:00'), (2, '20:00:00'), (2, '21:00:00'),
(3, '12:00:00'), (3, '13:00:00'), (3, '14:00:00'), (3, '19:00:00'), (3, '20:00:00'), (3, '21:00:00'),
(4, '12:00:00'), (4, '13:00:00'), (4, '14:00:00'), (4, '19:00:00'), (4, '20:00:00'), (4, '21:00:00'),
(5, '12:00:00'), (5, '13:00:00'), (5, '14:00:00'), (5, '19:00:00'), (5, '20:00:00'), (5, '21:00:00'), (5, '22:00:00'),
(6, '12:00:00'), (6, '13:00:00'), (6, '14:00:00'), (6, '19:00:00'), (6, '20:00:00'), (6, '21:00:00'), (6, '22:00:00')
ON CONFLICT DO NOTHING;
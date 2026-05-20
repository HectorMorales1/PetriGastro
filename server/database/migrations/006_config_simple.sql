-- Tabla simple de configuración: días activos y horarios por defecto
CREATE TABLE IF NOT EXISTS configuracion_pedidos (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(50) UNIQUE NOT NULL,
    valor TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Por defecto: todos los días activos excepto domingo
INSERT INTO configuracion_pedidos (clave, valor) VALUES 
('dias_activos', '1,2,3,4,5,6'),
('horarios_defecto', '12:00,13:00,14:00,19:00,20:00,21:00')
ON CONFLICT (clave) DO NOTHING;
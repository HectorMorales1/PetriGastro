TRUNCATE TABLE pedido_feedback CASCADE;
TRUNCATE TABLE config_horarios_dia CASCADE;
TRUNCATE TABLE config_dias CASCADE;
TRUNCATE TABLE horarios_disponibles CASCADE;
TRUNCATE TABLE fechas_disponibles CASCADE;
TRUNCATE TABLE configuracion_pedidos CASCADE;
TRUNCATE TABLE pedido_detalles CASCADE;
TRUNCATE TABLE pedidos CASCADE;
TRUNCATE TABLE reservas CASCADE;
TRUNCATE TABLE platos CASCADE;
TRUNCATE TABLE categorias CASCADE;
TRUNCATE TABLE usuarios CASCADE;

INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Administrador', 'abc', '$2b$10$5OHe64FAO8LYAg4/xE.1G.HiqB0yIYgQ1vF4vd72PPiIQ61owO766', 'admin');

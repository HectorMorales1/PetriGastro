-- ============================================================
-- PetriGastro - Migration 001: Initial schema + seed data
-- ============================================================

-- 1. USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id                       SERIAL PRIMARY KEY,
    nombre                   VARCHAR(100) NOT NULL,
    apellidos                VARCHAR(100) NOT NULL DEFAULT '',
    email                    VARCHAR(255) NOT NULL UNIQUE,
    password_hash            VARCHAR(255) NOT NULL,
    rol                      VARCHAR(20) NOT NULL DEFAULT 'cliente'
                             CHECK (rol IN ('cliente', 'admin')),
    estado_solicitud         VARCHAR(30) NOT NULL DEFAULT 'pendiente_verificacion'
                             CHECK (estado_solicitud IN (
                                 'pendiente_verificacion', 'pendiente',
                                 'aprobado', 'rechazado'
                             )),
    email_verificado         BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    fecha_solicitud          TIMESTAMP,
    motivo_rechazo           TEXT,
    telefono                 VARCHAR(20),
    token_version            INTEGER NOT NULL DEFAULT 0,
    created_at               TIMESTAMP NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM usuarios) THEN
    INSERT INTO usuarios (nombre, apellidos, email, password_hash, rol, estado_solicitud, email_verificado, fecha_solicitud) VALUES
    ('Admin', 'PetriGastro', 'admin@petrigastro.com', '$2b$10$LhNu3t3pWFATRZo6IxJ4eeTyWFXFKmCKdUzjcEYX2rrwZF160fKrO', 'admin', 'aprobado', TRUE, NOW()),
    ('Juan', 'Pérez', 'juan@email.com', '$2b$10$LhNu3t3pWFATRZo6IxJ4eeTyWFXFKmCKdUzjcEYX2rrwZF160fKrO', 'cliente', 'aprobado', TRUE, NOW());
  END IF;
END $$;

-- 2. CATEGORIAS
CREATE TABLE IF NOT EXISTS categorias (
    id     SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    icono  VARCHAR(20) NOT NULL DEFAULT '🍽️',
    orden  INTEGER NOT NULL DEFAULT 0
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categorias) THEN
    INSERT INTO categorias (nombre, icono, orden) VALUES
    ('Entrantes', '🥗', 1),
    ('Principales', '🍝', 2),
    ('Postres', '🍰', 3),
    ('Bebidas', '🥤', 4);
  END IF;
END $$;

-- 3. PLATOS
CREATE TABLE IF NOT EXISTS platos (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    descripcion   TEXT,
    precio        NUMERIC(10,2) NOT NULL,
    categoria_id  INTEGER NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    imagen_url    VARCHAR(500),
    disponible    BOOLEAN NOT NULL DEFAULT TRUE,
    destacado     BOOLEAN NOT NULL DEFAULT FALSE
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM platos) THEN
    INSERT INTO platos (nombre, descripcion, precio, categoria_id, disponible, destacado) VALUES
    ('Ensalada César', 'Lechuga, pollo, croutons y parmesano', 9.50, 1, TRUE, FALSE),
    ('Spaghetti Bolognese', 'Pasta con salsa de carne tradicional', 12.00, 2, TRUE, TRUE),
    ('Tiramisú', 'Postre italiano clásico de café', 6.50, 3, TRUE, FALSE),
    ('Agua mineral', 'Botella 500ml', 2.00, 4, TRUE, FALSE);
  END IF;
END $$;

-- 4. PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
    id             SERIAL PRIMARY KEY,
    usuario_id     INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    total          NUMERIC(10,2) NOT NULL,
    notas          TEXT,
    fecha_recogida DATE,
    estado         VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                   CHECK (estado IN ('pendiente', 'confirmado', 'preparando',
                                     'preparado', 'entregado', 'cancelado')),
    created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pedidos) THEN
    INSERT INTO pedidos (usuario_id, total, notas, fecha_recogida, estado) VALUES
    (2, 21.50, 'Sin cebolla', CURRENT_DATE + 1, 'pendiente');
  END IF;
END $$;

-- 5. PEDIDO_DETALLES
CREATE TABLE IF NOT EXISTS pedido_detalles (
    id              SERIAL PRIMARY KEY,
    pedido_id       INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    plato_id        INTEGER NOT NULL REFERENCES platos(id) ON DELETE RESTRICT,
    cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pedido_detalles) THEN
    INSERT INTO pedido_detalles (pedido_id, plato_id, cantidad, precio_unitario) VALUES
    (1, 2, 1, 12.00),
    (1, 3, 1, 6.50),
    (1, 4, 1, 2.00);
  END IF;
END $$;

-- 6. PEDIDO_FEEDBACK
CREATE TABLE IF NOT EXISTS pedido_feedback (
    pedido_id    INTEGER PRIMARY KEY REFERENCES pedidos(id) ON DELETE CASCADE,
    usuario_id   INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario   TEXT
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pedido_feedback) THEN
    INSERT INTO pedido_feedback (pedido_id, usuario_id, calificacion, comentario) VALUES
    (1, 2, 5, 'Todo excelente, muy buena comida');
  END IF;
END $$;

-- 7. FECHAS_DISPONIBLES
CREATE TABLE IF NOT EXISTS fechas_disponibles (
    id     SERIAL PRIMARY KEY,
    fecha  DATE NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM fechas_disponibles) THEN
    INSERT INTO fechas_disponibles (fecha, activo) VALUES
    (CURRENT_DATE + 1, TRUE),
    (CURRENT_DATE + 2, TRUE);
  END IF;
END $$;

-- 9. HORARIOS_DISPONIBLES
CREATE TABLE IF NOT EXISTS horarios_disponibles (
    id          SERIAL PRIMARY KEY,
    fecha       DATE NOT NULL REFERENCES fechas_disponibles(fecha) ON DELETE CASCADE,
    hora        TIME NOT NULL,
    disponible  BOOLEAN NOT NULL DEFAULT TRUE
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM horarios_disponibles) THEN
    INSERT INTO horarios_disponibles (fecha, hora, disponible) VALUES
    (CURRENT_DATE + 1, '12:00', TRUE),
    (CURRENT_DATE + 1, '13:00', TRUE),
    (CURRENT_DATE + 1, '14:00', TRUE),
    (CURRENT_DATE + 1, '19:00', TRUE),
    (CURRENT_DATE + 1, '20:00', TRUE),
    (CURRENT_DATE + 1, '21:00', TRUE),
    (CURRENT_DATE + 2, '12:00', TRUE),
    (CURRENT_DATE + 2, '13:00', TRUE),
    (CURRENT_DATE + 2, '14:00', TRUE),
    (CURRENT_DATE + 2, '19:00', TRUE),
    (CURRENT_DATE + 2, '20:00', TRUE),
    (CURRENT_DATE + 2, '21:00', TRUE);
  END IF;
END $$;

-- 10. CONFIGURACION_PEDIDOS
CREATE TABLE IF NOT EXISTS configuracion_pedidos (
    clave      VARCHAR(100) PRIMARY KEY,
    valor      TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO configuracion_pedidos (clave, valor) VALUES
('dias_activos', '1,2,3,4,5,6'),
('horarios_defecto', '12:00,13:00,14:00,19:00,20:00,21:00')
ON CONFLICT (clave) DO NOTHING;

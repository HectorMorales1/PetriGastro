-- Tabla para almacenar feedback de pedidos
CREATE TABLE IF NOT EXISTS pedido_feedback (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pedido_id)
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_pedido_feedback_pedido ON pedido_feedback(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_feedback_usuario ON pedido_feedback(usuario_id);
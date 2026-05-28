DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pedidos_usuario_id') THEN
    CREATE INDEX idx_pedidos_usuario_id ON pedidos(usuario_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pedido_detalles_pedido_id') THEN
    CREATE INDEX idx_pedido_detalles_pedido_id ON pedido_detalles(pedido_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fechas_disponibles_fecha') THEN
    CREATE INDEX idx_fechas_disponibles_fecha ON fechas_disponibles(fecha);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pedidos_estado') THEN
    CREATE INDEX idx_pedidos_estado ON pedidos(estado);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_usuarios_email') THEN
    CREATE INDEX idx_usuarios_email ON usuarios(email);
  END IF;
END $$;

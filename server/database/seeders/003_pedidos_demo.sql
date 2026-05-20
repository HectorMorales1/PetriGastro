-- Pedidos de ejemplo para pruebas

-- Pedido 1: Pendiente
INSERT INTO pedidos (usuario_id, total, estado, notas, fecha_recogida, created_at)
SELECT id, 45.50, 'pendiente', 'Sin cebolla por favor', CURRENT_DATE + INTERVAL '1 day', NOW() - INTERVAL '2 hours'
FROM usuarios WHERE email = 'admin@petrigastro.com' LIMIT 1;

-- Pedido 2: Preparando
INSERT INTO pedidos (usuario_id, total, estado, notas, fecha_recogida, created_at)
SELECT id, 32.00, 'preparando', '', CURRENT_DATE + INTERVAL '1 day', NOW() - INTERVAL '1 day'
FROM usuarios WHERE email = 'admin@petrigastro.com' LIMIT 1;

-- Pedido 3: Preparado
INSERT INTO pedidos (usuario_id, total, estado, notas, fecha_recogida, created_at)
SELECT id, 28.50, 'preparado', 'Para llevar', CURRENT_DATE, NOW() - INTERVAL '2 days'
FROM usuarios WHERE email = 'admin@petrigastro.com' LIMIT 1;

-- Pedido 4: Entregado
INSERT INTO pedidos (usuario_id, total, estado, notas, fecha_recogida, created_at)
SELECT id, 55.00, 'entregado', '', CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '3 days'
FROM usuarios WHERE email = 'admin@petrigastro.com' LIMIT 1;

-- Detalles de pedidos
INSERT INTO pedido_detalles (pedido_id, plato_id, cantidad, precio_unitario)
SELECT 1, id, 2, 12.50 FROM platos WHERE nombre = 'Ensalada César';

INSERT INTO pedido_detalles (pedido_id, plato_id, cantidad, precio_unitario)
SELECT 1, id, 1, 22.00 FROM platos WHERE nombre = 'Paella Valenciana';

INSERT INTO pedido_detalles (pedido_id, plato_id, cantidad, precio_unitario)
SELECT 2, id, 1, 22.00 FROM platos WHERE nombre = 'Paella Valenciana';

INSERT INTO pedido_detalles (pedido_id, plato_id, cantidad, precio_unitario)
SELECT 3, id, 1, 12.50 FROM platos WHERE nombre = 'Ensalada César';

INSERT INTO pedido_detalles (pedido_id, plato_id, cantidad, precio_unitario)
SELECT 4, id, 2, 22.00 FROM platos WHERE nombre = 'Paella Valenciana';
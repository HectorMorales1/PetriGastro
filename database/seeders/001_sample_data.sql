-- Seed data para PetriGastro

-- Categorías
INSERT INTO categorias (nombre, icono, orden) VALUES
('Entrantes', '🥗', 1),
('Principales', '🍽️', 2),
('Postres', '🍰', 3),
('Bebidas', '🥤', 4)
ON CONFLICT DO NOTHING;

-- Platos de ejemplo
INSERT INTO platos (nombre, descripcion, precio, categoria_id, disponible, destacado) VALUES
('Ensalada César', 'Lechuga romana, pollo grille, parmesano, crutones, salsa César', 12.50, 1, true, true),
('Croquetas de Jamón', '8 unidades de croquetas caseras de jamón ibérico', 10.00, 1, true, false),
('Patatas Bravas', 'Patatas fritas con salsa brava y alioli', 8.50, 1, true, false),
('Gambas al Ajillo', 'Gambas sauté con ajo, guindilla y pan', 14.00, 1, true, true),

('Paella Valenciana', 'Arroz tradicional con marisco, pollo y conejo', 22.00, 2, true, true),
('Lomo de Merluza', 'Merluza fresca con verduras y patatas', 19.50, 2, true, false),
('Entrecot de Ternera', '300g de entrecot con verduras asadas', 26.00, 2, true, true),
('Risotto de Setas', 'Risotto italiano con setas silvestres', 16.00, 2, true, false),
('Arroz Negro', 'Arroz con calamares y tinta de calamar', 18.00, 2, true, true),

('Tiramisú', 'Postre italiano con café, mascarpone y cacao', 9.00, 3, true, false),
('Flan de Caramelo', 'Flan casero con crema de vainilla', 7.50, 3, true, false),
('Brownie de Chocolate', 'Brownie con nueces y helado de vainilla', 8.50, 3, true, true),
('Crema Catalana', 'Crema quemada tradicional', 7.00, 3, true, false),

('Coca-Cola', 'Refresco 33cl', 3.00, 4, true, false),
('Fanta Naranja', 'Refresco 33cl', 3.00, 4, true, false),
('Agua Mineral', 'Agua 50cl', 2.50, 4, true, false),
('Cerveza', 'Cerveza nacional 33cl', 4.00, 4, true, false),
('Vino Tinto', 'Copa de vino tinto de la casa', 4.50, 4, true, false)
ON CONFLICT DO NOTHING;

-- Usuario admin de ejemplo (password: admin123)
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Administrador', 'admin@petrigastro.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eX5J8fG4I6y', 'admin')
ON CONFLICT DO NOTHING;
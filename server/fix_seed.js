const pool = require('./config/db')

async function main() {
  try {
    // Insertar categorías
    await pool.query(`
      INSERT INTO categorias (nombre, icono, orden) VALUES
      ('Entrantes', '🥗', 1),
      ('Principales', '🍽️', 2),
      ('Postres', '🍰', 3),
      ('Bebidas', '🥤', 4)
      ON CONFLICT DO NOTHING
    `)
    console.log('Categorías insertadas')

    // Ver categorías existentes
    const cats = await pool.query('SELECT id, nombre FROM categorias ORDER BY orden')
    console.log('Categorías:', cats.rows)

    // Insertar platos uno por uno usando los IDs correctos
    const platos = [
      ['Ensalada César', 'Lechuga romana, pollo grille, parmesano, crutones, salsa César', 12.50, cats.rows[0].id, true, true],
      ['Croquetas de Jamón', '8 unidades de croquetas caseras de jamón ibérico', 10.00, cats.rows[0].id, true, false],
      ['Patatas Bravas', 'Patatas fritas con salsa brava y alioli', 8.50, cats.rows[0].id, true, false],
      ['Paella Valenciana', 'Arroz tradicional con marisco, pollo y conejo', 22.00, cats.rows[1].id, true, true],
      ['Lomo de Merluza', 'Merluza fresca con verduras y patatas', 19.50, cats.rows[1].id, true, false],
      ['Entrecot de Ternera', '300g de entrecot con verduras asadas', 26.00, cats.rows[1].id, true, true],
      ['Risotto de Setas', 'Risotto italiano con setas silvestres', 16.00, cats.rows[1].id, true, false],
      ['Tiramisú', 'Postre italiano con café, mascarpone y cacao', 9.00, cats.rows[2].id, true, false],
      ['Flan de Caramelo', 'Flan casero con crema de vainilla', 7.50, cats.rows[2].id, true, false],
      ['Cerveza', 'Cerveza nacional 33cl', 4.00, cats.rows[3].id, true, false]
    ]

    for (const p of platos) {
      await pool.query(
        'INSERT INTO platos (nombre, descripcion, precio, categoria_id, disponible, destacado) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
        p
      )
    }
    console.log('Platos insertados')

    // Admin
    await pool.query(`
      INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
      ('Administrador', 'admin@petrigastro.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eX5J8fG4I6y', 'admin')
      ON CONFLICT DO NOTHING
    `)
    console.log('Admin insertado')

    // Config
    await pool.query(`
      INSERT INTO configuracion_pedidos (clave, valor) VALUES
      ('dias_activos', '1,2,3,4,5'),
      ('horarios_defecto', '12:00,13:00,14:00,19:00,20:00,21:00')
      ON CONFLICT DO NOTHING
    `)
    console.log('Config insertada')

    console.log('Seed completado!')
  } catch (e) {
    console.error('Error:', e.message)
  } finally {
    await pool.end()
  }
}

main()
require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function insertPedidosDemo() {
  const client = await pool.connect()
  
  try {
    // Obtener algunos platos
    const platos = await client.query('SELECT id, precio FROM platos LIMIT 5')
    
    if (platos.rows.length === 0) {
      console.log('No hay platos en la BD')
      return
    }
    
    console.log('Insertando pedidos demo...')
    
    // Pedido 1 - hace 2 días
    const pedido1 = await client.query(
      'INSERT INTO pedidos (usuario_id, total, notas, fecha_recogida, estado, created_at) VALUES (1, 0, \'Primer pedido de prueba\', CURRENT_DATE, \'entregado\', CURRENT_DATE - 2) RETURNING id',
      []
    )
    
    // Detalles pedido 1
    await client.query(
      'INSERT INTO pedido_detalles (pedido_id, plato_id, cantidad, precio_unitario) VALUES ($1, $2, 2, $3)',
      [pedido1.rows[0].id, platos.rows[0].id, platos.rows[0].precio]
    )
    await client.query(
      'INSERT INTO pedido_detalles (pedido_id, plato_id, cantidad, precio_unitario) VALUES ($1, $2, 1, $3)',
      [pedido1.rows[0].id, platos.rows[1].id, platos.rows[1].precio]
    )
    
    // Actualizar total
    await client.query(
      'UPDATE pedidos SET total = (SELECT SUM(cantidad * precio_unitario) FROM pedido_detalles WHERE pedido_id = $1) WHERE id = $1',
      [pedido1.rows[0].id]
    )
    
    console.log('✅ Pedido 1 insertado')
    
    // Pedido 2 - ayer
    const pedido2 = await client.query(
      'INSERT INTO pedidos (usuario_id, total, notas, fecha_recogida, estado, created_at) VALUES (1, 0, \'\', CURRENT_DATE, \'preparado\', CURRENT_DATE - 1) RETURNING id',
      []
    )
    
    await client.query(
      'INSERT INTO pedido_detalles (pedido_id, plato_id, cantidad, precio_unitario) VALUES ($1, $2, 3, $3)',
      [pedido2.rows[0].id, platos.rows[2].id, platos.rows[2].precio]
    )
    
    await client.query(
      'UPDATE pedidos SET total = (SELECT SUM(cantidad * precio_unitario) FROM pedido_detalles WHERE pedido_id = $1) WHERE id = $1',
      [pedido2.rows[0].id]
    )
    
    console.log('✅ Pedido 2 insertado')
    
    // Pedido 3 - hoy
    const pedido3 = await client.query(
      'INSERT INTO pedidos (usuario_id, total, notas, fecha_recogida, estado, created_at) VALUES (1, 0, \'\', CURRENT_DATE + 1, \'pendiente\', CURRENT_DATE) RETURNING id',
      []
    )
    
    await client.query(
      'INSERT INTO pedido_detalles (pedido_id, plato_id, cantidad, precio_unitario) VALUES ($1, $2, 1, $3)',
      [pedido3.rows[0].id, platos.rows[3].id, platos.rows[3].precio]
    )
    await client.query(
      'INSERT INTO pedido_detalles (pedido_id, plato_id, cantidad, precio_unitario) VALUES ($1, $2, 2, $3)',
      [pedido3.rows[0].id, platos.rows[4].id, platos.rows[4].precio]
    )
    
    await client.query(
      'UPDATE pedidos SET total = (SELECT SUM(cantidad * precio_unitario) FROM pedido_detalles WHERE pedido_id = $1) WHERE id = $1',
      [pedido3.rows[0].id]
    )
    
    console.log('✅ Pedido 3 insertado')
    
    console.log('\n🎉 Pedidos demo insertados correctamente!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

insertPedidosDemo()
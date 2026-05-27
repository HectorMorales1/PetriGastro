import pool from '../config/db'

interface PedidoItem {
  pedido_id: number
  cantidad: number
  precio_unitario: number
  nombre: string
  imagen_url: string
}

export async function attachItemsToPedidos(pedidos: Record<string, unknown>[]): Promise<void> {
  if (pedidos.length === 0) return

  const ids = pedidos.map(p => (p as { id: number }).id)
  const result = await pool.query(`
    SELECT pd.pedido_id, pd.cantidad, pd.precio_unitario, pl.nombre, pl.imagen_url
    FROM pedido_detalles pd
    JOIN platos pl ON pd.plato_id = pl.id
    WHERE pd.pedido_id = ANY($1::int[])
    ORDER BY pd.pedido_id
  `, [ids])

  const itemsByPedido: Record<number, PedidoItem[]> = {}
  for (const item of result.rows) {
    const pid = (item as PedidoItem).pedido_id
    if (!itemsByPedido[pid]) itemsByPedido[pid] = []
    itemsByPedido[pid].push(item)
  }

  for (const pedido of pedidos) {
    (pedido as { items: PedidoItem[] }).items = itemsByPedido[(pedido as { id: number }).id] || []
  }
}

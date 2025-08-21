const API_BASE = 'https://back-viviapp.onrender.com/api';

export interface Pedido {
  id?: number;
  distribuidor: string;
  fecha_pedido: string;
  descripcion?: string;
  valor_pedido: number;
}

export async function obtenerPedidos(): Promise<Pedido[]> {
  const res = await fetch(`${API_BASE}/pedidos`);
  if (!res.ok) throw new Error('Error al obtener pedidos');
  const data = await res.json();
  return data.pedidos;
}

export async function agregarPedido(pedido: Pedido): Promise<Pedido> {
  const res = await fetch(`https:127.0.0.1:8000/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pedido),
  });
  if (!res.ok) throw new Error('Error al agregar pedido');
  return res.json();
}

export async function eliminarPedido(id: number) {
  const res = await fetch(`${API_BASE}/pedidos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar pedido');
}

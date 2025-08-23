// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://back-viviapp.onrender.com', // Cambia si tu backend tiene otra URL base
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

export const addPagado = async (pedido: any) => {
  await api.post('/pagados/agregar', pedido);
};

export const exportPagados = async () => {
  const response = await api.get('/pagados/exportar', {
    responseType: 'blob'
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'pagados.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
};
export interface Pedido {
  distribuidor: string;
  valor: number;
  fecha: string;
  descripcion?: string;
}

export async function createPedido(pedido: { distribuidor: string, valor: number, fecha: string, descripcion?: string }) {
  const response = await fetch('https://back-viviapp.onrender.com/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pedido),
  });

  if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  return response.json();
}

// src/services/pedidosService.ts
const API_URL = "https://back-viviapp.onrender.com/pedidos";

export async function getPedidos() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Error al obtener pedidos");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updatePedido(id: number, pedido: Pedido) {
  const res = await fetch(`${API_URL}/pedidos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      distribuidor: pedido.distribuidor,
      valor_pedido: pedido.valor,
      fecha_pedido: pedido.fecha,
      descripcion: pedido.descripcion || '',
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Error al actualizar el pedido');
  }

  return res.json();
}

// pedidosService.ts
export const deletePedido = async (id: string | number): Promise<void> => {
  // Tu lógica de eliminación
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Error al eliminar el pedido');
  }
};

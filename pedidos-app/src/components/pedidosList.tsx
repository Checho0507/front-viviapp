import { useEffect, useState, useCallback } from 'react';
import { getPedidos, deletePedido, addPagado } from '../services/pedidosService'; // Asegúrate de importar deletePedido

// Definir tipos para los datos
interface Pedido {
  id: string | number;
  distribuidor: string;
  valor: number;
  fecha: string;
  descripcion?: string;
}

interface PedidoListProps {
  refresh: number;
  onPedidoDeleted?: () => void; // Callback opcional para notificar eliminación
}

export default function PedidoList({ refresh, onPedidoDeleted }: PedidoListProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  // Función para cargar pedidos
  const loadPedidos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getPedidos();
      setPedidos(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar pedidos';
      console.error('Error al obtener pedidos:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para eliminar pedido
  const handleDeletePedido = async (pedidoId: string | number, distribuidor: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar el pedido de "${distribuidor}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmDelete) return;

    setDeletingId(pedidoId);

    try {
      await deletePedido((pedidoId));

      // Actualizar la lista local removiendo el pedido eliminado
      setPedidos(prev => prev.filter(pedido => pedido.id !== pedidoId));

      // Notificar al componente padre si existe el callback
      onPedidoDeleted?.();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar pedido';
      console.error('Error al eliminar pedido:', errorMessage);
      alert(`Error al eliminar pedido: ${errorMessage}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePedido = async (pedidoId: string | number, distribuidor: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres marcar el pedido de "${distribuidor} como pagado"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmDelete) return;

    setDeletingId(pedidoId);

    try {
      await deletePedido((pedidoId));

      // Actualizar la lista local removiendo el pedido eliminado
      setPedidos(prev => prev.filter(pedido => pedido.id !== pedidoId));

      // Notificar al componente padre si existe el callback
      onPedidoDeleted?.();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar pedido';
      console.error('Error al eliminar pedido:', errorMessage);
      alert(`Error al eliminar pedido: ${errorMessage}`);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    loadPedidos();
  }, [refresh, loadPedidos]);

  // Función para formatear valores monetarios
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Función para formatear fechas
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Componente de estado de carga
  if (isLoading) {
    return (
      <div className="p-6 bg-white shadow-md rounded-lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando pedidos...</span>
        </div>
      </div>
    );
  }

  // Componente de error
  if (error) {
    return (
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Lista de Pedidos</h2>
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p className="font-medium">Error al cargar los pedidos</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={loadPedidos}
            className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Lista de Pedidos</h2>
        <span className="text-sm text-gray-600">
          {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {pedidos.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No hay pedidos</h3>
          <p className="text-gray-600">Agrega tu primer pedido para comenzar.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distribuidor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pedidos.map((pedido, index) => (
                <tr
                  key={pedido.id || index}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {pedido.distribuidor}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-semibold">
                      {formatCurrency(pedido.valor)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(pedido.fecha)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {pedido.descripcion || (
                        <span className="text-gray-400 italic">Sin descripción</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex space-x-2">
                    <button
                      onClick={() => handleDeletePedido(pedido.id, pedido.distribuidor)}
                      disabled={deletingId === pedido.id}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title="Eliminar pedido"
                    >
                      🗑
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          await addPagado(pedido);
                          await handlePedido(pedido.id, pedido.distribuidor);
                        } catch (error) {
                          alert('Error marcando como pagado');
                        }
                      }}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50"
                      title="Marcar como pagado"
                    >
                      ✅
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resumen total */}
      {pedidos.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total general:</span>
            <span className="text-lg font-bold text-blue-600">
              {formatCurrency(
                pedidos.reduce((total, pedido) => total + pedido.valor, 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

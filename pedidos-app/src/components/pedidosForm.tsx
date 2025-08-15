import { useState, useCallback } from 'react';
import { createPedido } from '../services/pedidosService';

interface PedidoFormData {
  distribuidor: string;
  valor: number;
  fecha: string;
  descripcion?: string; // Ahora obligatorio en la estructura, pero no en validación
}

interface PedidoFormProps {
  onPedidoAdded: () => void;
}

const INITIAL_STATE: PedidoFormData = {
  distribuidor: '',
  valor: 0,
  fecha: '',
  descripcion: '',
};

export default function PedidoForm({ onPedidoAdded }: PedidoFormProps) {
  const [formData, setFormData] = useState<PedidoFormData>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = useCallback((field: keyof PedidoFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  }, [error]);

  const validateForm = (): boolean => {
    const { distribuidor, valor, fecha, descripcion } = formData;
    
    if (!distribuidor.trim()) {
      setError('El distribuidor es requerido');
      return false;
    }
    
    if (!valor || valor <= 0) {
      setError('El valor debe ser mayor a 0');
      return false;
    }
    
    if (!fecha) {
      setError('La fecha es requerida');
      return false;
    }

    if (descripcion && descripcion.length > 500) {
      setError('La descripción no puede exceder los 500 caracteres');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      await createPedido({
        distribuidor: formData.distribuidor.trim(),
        valor: formData.valor,
        fecha: formData.fecha,
        descripcion: formData.descripcion?.trim() || '',
      });

      setFormData(INITIAL_STATE);
      onPedidoAdded();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error al crear pedido:', errorMessage);
      setError(`Error al crear pedido: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white shadow-md rounded-lg">
      <div className="space-y-4">
        <div>
          <label htmlFor="distribuidor" className="block text-sm font-medium text-gray-700 mb-1">
            Distribuidor *
          </label>
          <input
            id="distribuidor"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nombre del distribuidor"
            value={formData.distribuidor}
            onChange={(e) => updateField('distribuidor', e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
            Valor ($) *
          </label>
          <input
            id="valor"
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
            value={formData.valor || ''}
            onChange={(e) => updateField('valor', e.target.value ? Number(e.target.value) : 0)}
            min={0.01}
            step={0.01}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha *
          </label>
          <input
            id="fecha"
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.fecha}
            onChange={(e) => updateField('fecha', e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción (opcional)
          </label>
          <textarea
            id="descripcion"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Descripción del pedido (máx. 500 caracteres)"
            value={formData.descripcion}
            onChange={(e) => updateField('descripcion', e.target.value)}
            disabled={isLoading}
            maxLength={500}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        } text-white`}
      >
        {isLoading ? 'Agregando...' : 'Agregar Pedido'}
      </button>
    </form>
  );
}

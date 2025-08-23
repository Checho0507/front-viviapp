import { useState, useEffect } from 'react';
import PedidoForm from './components/pedidosForm';
import PedidoList from './components/pedidosList';
import { exportPagados } from './services/pedidosService';

interface Pedido {
  id: number;
  distribuidor: string;
  fecha: string;
  valor: string | number; // Puede venir como string
}

function App() {
  const [refresh, setRefresh] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [totalHoy, setTotalHoy] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        // Usar el endpoint de resumen en lugar de calcular manualmente
        const response = await fetch('https://back-viviapp.onrender.com/pedidos/resumen-general');
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        setTotalPedidos(data.total_pedidos);
        setTotalHoy(parseFloat(data.total_hoy) || 0); // ✅ Conversión segura
        setValorTotal(parseFloat(data.total_general) || 0); // ✅ Conversión segura

      } catch (error) {
        console.error('Error al cargar resumen:', error);
        // Fallback: usar el método actual
        fetchPedidosManual();
      }
    };

    const fetchPedidosManual = async () => {
      // Tu código actual como fallback
      try {
        const response = await fetch('https://back-viviapp.onrender.com/pedidos');
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data: Pedido[] = await response.json();
        setTotalPedidos(data.length);

        const hoy = new Date().toISOString().split('T')[0];

        let sumaHoy = 0;
        let sumaTotal = 0;

        data.forEach((pedido) => {
          let valor = parseFloat(String(pedido.valor).replace(/,/g, '').trim());
          if (isNaN(valor)) valor = 0;

          sumaTotal += valor;

          if (pedido.fecha.slice(0, 10) === hoy) {
            sumaHoy += valor;
          }
        });

        setTotalHoy(sumaHoy);
        setValorTotal(sumaTotal);
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
      }
    };

    fetchResumen();
  }, [refresh]);


  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Sistema de Pedidos</h1>
        <button
          onClick={exportPagados}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
        >
          Exportar Pagados
        </button>
      </div>



      {/* Panel de estadísticas */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-100 p-4 rounded-lg text-center shadow">
          <p className="text-lg font-semibold">Pedidos Totales</p>
          <p className="text-2xl font-bold">{totalPedidos}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg text-center shadow">
          <p className="text-lg font-semibold">Valor Hoy</p>
          <p className="text-2xl font-bold">
            {totalHoy.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
          </p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg text-center shadow">
          <p className="text-lg font-semibold">Valor Total</p>
          <p className="text-2xl font-bold">
            {valorTotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
          </p>
        </div>
      </div>

      <PedidoForm onPedidoAdded={() => setRefresh((prev) => prev + 1)} />
      <PedidoList refresh={refresh} />
    </div>
  );
}

export default App;

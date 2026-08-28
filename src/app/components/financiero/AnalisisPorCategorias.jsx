import { obtenerInfoCategoria } from '@/constants/categorias';
import DistribucionCategorias from './graficos/DistribucionCategorias';

export default function AnalisisPorCategorias({ datosResumen, formatCOP }) {
  // Calcular totales por categoría
  const calcularTotalesPorCategoria = () => {
    const totales = {};

    datosResumen.forEach((mes) => {
      // Procesar obligaciones de ambas quincenas
      ['quincena1', 'quincena2'].forEach((quincena) => {
        const datosQuincena = mes.datosQuincenales?.[quincena];
        if (!datosQuincena) return;

        // Procesar obligaciones
        datosQuincena.obligaciones?.forEach((item) => {
          const categoria = item.categoria || 'otros';
          if (!totales[categoria]) {
            totales[categoria] = {
              nombre: categoria,
              tipo: 'obligaciones',
              total: 0,
              items: [],
            };
          }
          totales[categoria].total += item.monto || 0;
          totales[categoria].items.push({
            concepto: item.concepto,
            monto: item.monto,
            mes: mes.mes,
            quincena,
          });
        });

        // Procesar gastos personales
        datosQuincena.gastosPersonales?.forEach((item) => {
          const categoria = item.categoria || 'otros';
          if (!totales[categoria]) {
            totales[categoria] = {
              nombre: categoria,
              tipo: 'gastosPersonales',
              total: 0,
              items: [],
            };
          }
          totales[categoria].total += item.monto || 0;
          totales[categoria].items.push({
            concepto: item.concepto,
            monto: item.monto,
            mes: mes.mes,
            quincena,
          });
        });
      });
    });

    return totales;
  };

  const totalesPorCategoria = calcularTotalesPorCategoria();

  // Convertir a array y ordenar por total descendente
  const categoriasOrdenadas = Object.entries(totalesPorCategoria)
    .map(([key, data]) => ({
      key,
      ...data,
      info: obtenerInfoCategoria(data.tipo, key),
    }))
    .sort((a, b) => b.total - a.total);

  // Calcular total general
  const totalGeneral = categoriasOrdenadas.reduce((sum, cat) => sum + cat.total, 0);

  // Top 3 categorías
  const top3 = categoriasOrdenadas.slice(0, 3);

  if (categoriasOrdenadas.length === 0) {
    return (
      <div className='bg-gray-50 p-6 rounded-lg border border-gray-200'>
        <h3 className='font-bold text-xl mb-4 text-black'>📊 Análisis por Categorías</h3>
        <p className='text-gray-600'>No hay datos de gastos categorizados aún.</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Encabezado */}
      <div className='bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200'>
        <h3 className='font-bold text-xl mb-4 text-black'>📊 Análisis por Categorías</h3>
        <p className='text-sm text-gray-700'>
          Analiza cómo se distribuyen tus gastos por categoría y descubre dónde puedes optimizar.
        </p>
      </div>

      {/* Top 3 Categorías */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {top3.map((cat, idx) => {
          const porcentaje = totalGeneral > 0 ? ((cat.total / totalGeneral) * 100).toFixed(1) : 0;
          const medallas = ['🥇', '🥈', '🥉'];
          const colores = ['bg-yellow-100 border-yellow-300', 'bg-gray-100 border-gray-300', 'bg-orange-100 border-orange-300'];

          return (
            <div key={cat.key} className={`${colores[idx]} border-2 p-4 rounded-lg`}>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-2xl'>{medallas[idx]}</span>
                <span className='text-lg font-bold text-black'>Top {idx + 1}</span>
              </div>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-2xl'>{cat.info.icono}</span>
                <span className='font-semibold text-black'>{cat.info.nombre}</span>
              </div>
              <p className='text-2xl font-bold text-black mb-1'>{formatCOP(cat.total)}</p>
              <p className='text-sm text-gray-600'>{porcentaje}% del total</p>
              <p className='text-xs text-gray-500 mt-1'>{cat.items.length} transacciones</p>
            </div>
          );
        })}
      </div>

      {/* Gráfico de distribución (Pie Chart) */}
      <DistribucionCategorias datosResumen={datosResumen} formatCOP={formatCOP} />

      {/* Tabla de todas las categorías */}
      <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
        <h4 className='font-bold text-lg mb-4 text-black'>💰 Distribución Completa</h4>
        <div className='space-y-3'>
          {categoriasOrdenadas.map((cat) => {
            const porcentaje = totalGeneral > 0 ? ((cat.total / totalGeneral) * 100).toFixed(1) : 0;

            return (
              <div key={cat.key} className='border-b border-gray-100 pb-3 last:border-b-0'>
                <div className='flex justify-between items-center mb-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-xl'>{cat.info.icono}</span>
                    <span className='font-semibold text-black'>{cat.info.nombre}</span>
                    <span className='text-xs text-gray-500'>({cat.items.length})</span>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold text-black'>{formatCOP(cat.total)}</p>
                    <p className='text-xs text-gray-600'>{porcentaje}%</p>
                  </div>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-3'>
                  <div
                    className='h-3 rounded-full transition-all'
                    style={{
                      width: `${porcentaje}%`,
                      backgroundColor: cat.info.color,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className='mt-4 pt-4 border-t-2 border-gray-300'>
          <div className='flex justify-between items-center'>
            <span className='font-bold text-lg text-black'>Total General</span>
            <span className='font-bold text-xl text-black'>{formatCOP(totalGeneral)}</span>
          </div>
        </div>
      </div>

      {/* Insights y Recomendaciones */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
          <h4 className='font-bold text-md mb-2 text-black flex items-center gap-2'>
            💡 Insight Principal
          </h4>
          {top3.length > 0 && (
            <p className='text-sm text-gray-700'>
              Tu mayor gasto es en <span className='font-bold'>{top3[0].info.icono} {top3[0].info.nombre}</span> con{' '}
              <span className='font-bold'>{formatCOP(top3[0].total)}</span>, representando el{' '}
              <span className='font-bold'>{((top3[0].total / totalGeneral) * 100).toFixed(1)}%</span> del total.
            </p>
          )}
        </div>

        <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
          <h4 className='font-bold text-md mb-2 text-black flex items-center gap-2'>
            ✅ Oportunidad de Ahorro
          </h4>
          {top3.length > 0 && (
            <p className='text-sm text-gray-700'>
              Reduciendo un 10% en <span className='font-bold'>{top3[0].info.nombre}</span>, podrías ahorrar{' '}
              <span className='font-bold text-green-700'>{formatCOP(top3[0].total * 0.1)}</span> adicionales.
            </p>
          )}
        </div>
      </div>

      {/* Promedio Mensual por Categoría */}
      <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
        <h4 className='font-bold text-lg mb-4 text-black'>📅 Promedio Mensual por Categoría</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
          {categoriasOrdenadas.slice(0, 6).map((cat) => {
            const mesesUnicos = new Set(cat.items.map((item) => item.mes)).size;
            const promedioMensual = mesesUnicos > 0 ? cat.total / mesesUnicos : cat.total;

            return (
              <div key={cat.key} className='bg-gray-50 p-3 rounded-lg border border-gray-200'>
                <div className='flex items-center gap-2 mb-1'>
                  <span>{cat.info.icono}</span>
                  <span className='font-semibold text-sm text-black'>{cat.info.nombre}</span>
                </div>
                <p className='text-lg font-bold text-black'>{formatCOP(promedioMensual)}</p>
                <p className='text-xs text-gray-600'>Promedio/mes ({mesesUnicos} meses)</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

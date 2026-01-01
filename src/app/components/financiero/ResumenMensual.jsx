import { obtenerInfoCategoria } from '@/constants/categorias';

export default function ResumenMensual({ datosResumen, formatCOP }) {
  // Función para calcular la categoría con mayor gasto en un mes
  const calcularTopCategoria = (mes) => {
    const totalesPorCategoria = {};

    // Procesar ambas quincenas
    ['quincena1', 'quincena2'].forEach((quincena) => {
      const datosQuincena = mes.datosQuincenales?.[quincena];
      if (!datosQuincena) return;

      // Sumar obligaciones
      datosQuincena.obligaciones?.forEach((item) => {
        const cat = item.categoria || 'otros';
        if (!totalesPorCategoria[cat]) {
          totalesPorCategoria[cat] = { total: 0, tipo: 'obligaciones' };
        }
        totalesPorCategoria[cat].total += item.monto || 0;
      });

      // Sumar gastos personales
      datosQuincena.gastosPersonales?.forEach((item) => {
        const cat = item.categoria || 'otros';
        if (!totalesPorCategoria[cat]) {
          totalesPorCategoria[cat] = { total: 0, tipo: 'gastosPersonales' };
        }
        totalesPorCategoria[cat].total += item.monto || 0;
      });
    });

    // Encontrar la categoría con mayor total
    let topCategoria = null;
    let maxTotal = 0;

    Object.entries(totalesPorCategoria).forEach(([key, data]) => {
      if (data.total > maxTotal) {
        maxTotal = data.total;
        topCategoria = { key, ...data };
      }
    });

    if (!topCategoria) return null;

    const info = obtenerInfoCategoria(topCategoria.tipo, topCategoria.key);
    return {
      ...info,
      total: topCategoria.total,
    };
  };

  return (
    <div className='overflow-x-auto'>
      <table className='w-full border-collapse border border-gray-300'>
        <thead className='bg-blue-600 text-white'>
          <tr>
            <th className='border border-gray-300 p-3'>Mes</th>
            <th className='border border-gray-300 p-3'>Ingreso Total</th>
            <th className='border border-gray-300 p-3'>Obligaciones</th>
            <th className='border border-gray-300 p-3'>Gastos Personales</th>
            <th className='border border-gray-300 p-3'>Ahorro Total</th>
            <th className='border border-gray-300 p-3'>% Ahorro</th>
            <th className='border border-gray-300 p-3'>Top Categoría</th>
          </tr>
        </thead>
        <tbody>
          {datosResumen.map((row, idx) => {
            const topCat = calcularTopCategoria(row);

            return (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className='border border-gray-300 p-3 font-medium text-black'>{row.mes}</td>
                <td className='border border-gray-300 p-3 text-right text-black'>{formatCOP(row.ingresoTotal)}</td>
                <td className='border border-gray-300 p-3 text-right text-red-600'>{formatCOP(row.obligaciones)}</td>
                <td className='border border-gray-300 p-3 text-right text-orange-600'>{formatCOP(row.gastosPersonales)}</td>
                <td className={`border border-gray-300 p-3 text-right font-bold ${row.ahorroEnCuenta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCOP(row.ahorroEnCuenta)}
                </td>
                <td className='border border-gray-300 p-3 text-right font-bold text-blue-600'>{row.porcentajeAhorro}%</td>
                <td className='border border-gray-300 p-3 text-center text-black'>
                  {topCat ? (
                    <div className='flex flex-col items-center'>
                      <span className='text-lg'>{topCat.icono}</span>
                      <span className='text-xs font-semibold'>{topCat.nombre}</span>
                      <span className='text-xs text-gray-600'>{formatCOP(topCat.total)}</span>
                    </div>
                  ) : (
                    <span className='text-gray-400 text-xs'>Sin datos</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

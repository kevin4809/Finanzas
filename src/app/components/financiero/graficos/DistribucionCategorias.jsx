'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { obtenerInfoCategoria } from '@/constants/categorias';

export default function DistribucionCategorias({ datosResumen, formatCOP }) {
  // Calcular totales por categoría
  const calcularTotalesPorCategoria = () => {
    const totales = {};

    datosResumen.forEach((mes) => {
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
            };
          }
          totales[categoria].total += item.monto || 0;
        });

        // Procesar gastos personales
        datosQuincena.gastosPersonales?.forEach((item) => {
          const categoria = item.categoria || 'otros';
          if (!totales[categoria]) {
            totales[categoria] = {
              nombre: categoria,
              tipo: 'gastosPersonales',
              total: 0,
            };
          }
          totales[categoria].total += item.monto || 0;
        });
      });
    });

    return totales;
  };

  const totalesPorCategoria = calcularTotalesPorCategoria();

  // Convertir a array y agregar info de categorías
  const datosGrafico = Object.entries(totalesPorCategoria)
    .map(([key, data]) => {
      const info = obtenerInfoCategoria(data.tipo, key);
      return {
        name: info.nombre,
        value: data.total,
        color: info.color,
        icono: info.icono,
      };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalGeneral = datosGrafico.reduce((sum, item) => sum + item.value, 0);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const porcentaje = totalGeneral > 0 ? ((data.value / totalGeneral) * 100).toFixed(1) : 0;

      return (
        <div className='bg-white p-4 border-2 border-gray-300 rounded-lg shadow-lg'>
          <p className='font-bold text-black mb-1 flex items-center gap-2'>
            <span className='text-xl'>{data.payload.icono}</span>
            {data.name}
          </p>
          <p className='text-sm text-gray-700'>
            <span className='font-semibold'>Total:</span> {formatCOP(data.value)}
          </p>
          <p className='text-sm text-gray-700'>
            <span className='font-semibold'>Porcentaje:</span> {porcentaje}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Renderizar etiqueta personalizada
  const renderLabel = (entry) => {
    const porcentaje = totalGeneral > 0 ? ((entry.value / totalGeneral) * 100).toFixed(0) : 0;
    return `${entry.icono} ${porcentaje}%`;
  };

  if (datosGrafico.length === 0) {
    return (
      <div className='bg-gray-50 p-6 rounded-lg border border-gray-200'>
        <h3 className='font-bold text-xl mb-4 text-black'>📊 Distribución por Categorías</h3>
        <p className='text-gray-600'>No hay datos de gastos categorizados aún.</p>
      </div>
    );
  }

  return (
    <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
      <h3 className='font-bold text-xl mb-4 text-black'>📊 Distribución por Categorías</h3>
      <p className='text-sm text-gray-600 mb-4'>Porcentaje de gasto por categoría</p>

      <ResponsiveContainer width='100%' height={400}>
        <PieChart>
          <Pie
            data={datosGrafico}
            cx='50%'
            cy='50%'
            labelLine={true}
            label={renderLabel}
            outerRadius={120}
            fill='#8884d8'
            dataKey='value'
          >
            {datosGrafico.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign='bottom'
            height={36}
            formatter={(value, entry) => (
              <span className='text-sm'>
                {entry.payload.icono} {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Resumen de totales */}
      <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
        <p className='text-center text-sm text-gray-700'>
          <span className='font-bold'>Total de gastos:</span> {formatCOP(totalGeneral)}
        </p>
      </div>
    </div>
  );
}

'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { obtenerInfoCategoria } from '@/constants/categorias';

export default function DistribucionCategorias({ datosResumen, formatCOP }) {
  const calcularTotalesPorCategoria = () => {
    const totales = {};

    datosResumen.forEach((mes) => {
      ['quincena1', 'quincena2'].forEach((quincena) => {
        const datosQuincena = mes.datosQuincenales?.[quincena];
        if (!datosQuincena) return;

        datosQuincena.obligaciones?.forEach((item) => {
          const categoria = item.categoria || 'otros';
          if (!totales[categoria]) {
            totales[categoria] = { nombre: categoria, tipo: 'obligaciones', total: 0 };
          }
          totales[categoria].total += item.monto || 0;
        });

        datosQuincena.gastosPersonales?.forEach((item) => {
          const categoria = item.categoria || 'otros';
          if (!totales[categoria]) {
            totales[categoria] = { nombre: categoria, tipo: 'gastosPersonales', total: 0 };
          }
          totales[categoria].total += item.monto || 0;
        });
      });
    });

    return totales;
  };

  const totalesPorCategoria = calcularTotalesPorCategoria();

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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const porcentaje = totalGeneral > 0 ? ((data.value / totalGeneral) * 100).toFixed(1) : 0;

      return (
        <div className='bg-white dark:bg-slate-800 p-4 border-2 border-gray-300 dark:border-slate-600 rounded-lg shadow-lg'>
          <p className='font-bold text-primary mb-1 flex items-center gap-2'>
            <span className='text-xl'>{data.payload.icono}</span>
            {data.name}
          </p>
          <p className='text-sm text-muted'>
            <span className='font-semibold text-primary'>Total:</span> {formatCOP(data.value)}
          </p>
          <p className='text-sm text-muted'>
            <span className='font-semibold text-primary'>Porcentaje:</span> {porcentaje}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = (entry) => {
    const porcentaje = totalGeneral > 0 ? ((entry.value / totalGeneral) * 100).toFixed(0) : 0;
    return `${entry.icono} ${porcentaje}%`;
  };

  if (datosGrafico.length === 0) {
    return (
      <div className='card p-6'>
        <h3 className='font-bold text-xl mb-4 text-primary'>📊 Distribución por Categorías</h3>
        <p className='text-muted'>No hay datos de gastos categorizados aún.</p>
      </div>
    );
  }

  return (
    <div className='card p-6'>
      <h3 className='font-bold text-xl mb-4 text-primary'>📊 Distribución por Categorías</h3>
      <p className='text-sm text-muted mb-4'>Porcentaje de gasto por categoría</p>

      <div className='[&_.recharts-pie-label-text]:fill-slate-700 dark:[&_.recharts-pie-label-text]:fill-slate-200 [&_.recharts-legend-item-text]:!text-slate-700 dark:[&_.recharts-legend-item-text]:!text-slate-300'>
        <ResponsiveContainer width='100%' height={400}>
          <PieChart>
            <Pie
              data={datosGrafico}
              cx='50%'
              cy='50%'
              labelLine={{ stroke: 'currentColor', className: 'text-slate-400 dark:text-slate-500' }}
              label={renderLabel}
              outerRadius={120}
              fill='#8884d8'
              dataKey='value'
            >
              {datosGrafico.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke='transparent' />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign='bottom'
              height={36}
              formatter={(value, entry) => (
                <span className='text-sm text-primary'>
                  {entry.payload.icono} {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className='mt-4 p-4 bg-gray-50 dark:bg-slate-800/60 rounded-lg border border-gray-200 dark:border-slate-600'>
        <p className='text-center text-sm text-muted'>
          <span className='font-bold text-primary'>Total de gastos:</span> {formatCOP(totalGeneral)}
        </p>
      </div>
    </div>
  );
}

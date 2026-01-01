'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function EvolucionMensual({ datosResumen, formatCOP, mesesTranscurridos }) {
  // Preparar datos para el gráfico
  const datosGrafico = datosResumen.map((mes) => ({
    nombre: mes.mes.slice(0, 3), // Abreviar nombre del mes
    mesCompleto: mes.mes,
    Ingresos: mes.ingresoTotal,
    Gastos: mes.obligaciones + mes.gastosPersonales,
    Ahorro: mes.ahorroEnCuenta,
  }));

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-4 border-2 border-gray-300 rounded-lg shadow-lg'>
          <p className='font-bold text-black mb-2'>{payload[0].payload.mesCompleto}</p>
          {payload.map((entry, index) => (
            <p key={index} className='text-sm' style={{ color: entry.color }}>
              <span className='font-semibold'>{entry.name}:</span> {formatCOP(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Formatear valores del eje Y
  const formatYAxis = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
      <h3 className='font-bold text-xl mb-4 text-black'>📊 Evolución Mensual</h3>
      <p className='text-sm text-gray-600 mb-4'>
        Mostrando {mesesTranscurridos} {mesesTranscurridos === 1 ? 'mes transcurrido' : 'meses transcurridos'} de 12
      </p>

      <ResponsiveContainer width='100%' height={400}>
        <LineChart data={datosGrafico} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
          <XAxis dataKey='nombre' stroke='#6b7280' style={{ fontSize: '12px' }} />
          <YAxis tickFormatter={formatYAxis} stroke='#6b7280' style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line type='monotone' dataKey='Ingresos' stroke='#3b82f6' strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
          <Line type='monotone' dataKey='Gastos' stroke='#ef4444' strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
          <Line type='monotone' dataKey='Ahorro' stroke='#10b981' strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
        </LineChart>
      </ResponsiveContainer>

      <div className='mt-4 flex justify-center gap-6 text-sm'>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 bg-blue-500 rounded'></div>
          <span className='text-gray-600'>Ingresos</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 bg-red-500 rounded'></div>
          <span className='text-gray-600'>Gastos</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 bg-green-500 rounded'></div>
          <span className='text-gray-600'>Ahorro</span>
        </div>
      </div>
    </div>
  );
}

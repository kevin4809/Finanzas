import InputNumero from './InputNumero';

function SeccionMontos({ titulo, items, onCambioMonto, colorClase, formatCOP }) {
  const total = items.reduce((sum, item) => sum + item.monto, 0);

  if (items.length === 0) return null;

  return (
    <div className={`${colorClase} p-3 rounded-lg`}>
      <h5 className='font-semibold mb-2 text-primary text-sm'>{titulo}</h5>
      <div className='space-y-2'>
        {items.map((item, idx) => (
          <div key={idx} className='flex items-center justify-between gap-3'>
            <span className='text-primary text-sm truncate flex-1' title={item.concepto}>
              {item.concepto}
              {item.recurrente && <span className='ml-1 text-blue-500 dark:text-blue-400 text-xs'>(recurrente)</span>}
            </span>
            <InputNumero
              valor={item.monto}
              onChange={(valor) => onCambioMonto(idx, valor)}
              className='w-28 input-field text-right text-sm py-1.5'
            />
          </div>
        ))}
      </div>
      <div className='border-t border-gray-200 dark:border-slate-600 mt-2 pt-2 flex justify-between text-sm font-semibold text-primary'>
        <span>Subtotal</span>
        <span>{formatCOP(total)}</span>
      </div>
    </div>
  );
}

export default function VistaRapidaMontos({
  mesNombre,
  datosQuincenales,
  onActualizarMonto,
  formatCOP,
}) {
  const q1 = datosQuincenales.quincena1;
  const q2 = datosQuincenales.quincena2;

  const totalQ1 =
    q1.obligaciones.reduce((s, i) => s + i.monto, 0) + q1.gastosPersonales.reduce((s, i) => s + i.monto, 0);
  const totalQ2 =
    q2.obligaciones.reduce((s, i) => s + i.monto, 0) + q2.gastosPersonales.reduce((s, i) => s + i.monto, 0);

  return (
    <div className='space-y-6'>
      <p className='text-sm text-muted'>
        Vista rápida de <strong className='text-primary'>{mesNombre}</strong> — solo edita montos. Usa Enter para saltar al siguiente campo.
      </p>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='space-y-4'>
          <h4 className='font-bold text-primary'>Quincena 1</h4>
          <SeccionMontos
            titulo='Obligaciones'
            items={q1.obligaciones}
            onCambioMonto={(idx, valor) => onActualizarMonto('quincena1', 'obligaciones', idx, valor)}
            colorClase='section-red'
            formatCOP={formatCOP}
          />
          <SeccionMontos
            titulo='Gastos Personales'
            items={q1.gastosPersonales}
            onCambioMonto={(idx, valor) => onActualizarMonto('quincena1', 'gastosPersonales', idx, valor)}
            colorClase='section-personal'
            formatCOP={formatCOP}
          />
          <div className='text-sm font-semibold text-primary text-right'>Total Q1: {formatCOP(totalQ1)}</div>
        </div>

        <div className='space-y-4'>
          <h4 className='font-bold text-primary'>Quincena 2</h4>
          <SeccionMontos
            titulo='Obligaciones'
            items={q2.obligaciones}
            onCambioMonto={(idx, valor) => onActualizarMonto('quincena2', 'obligaciones', idx, valor)}
            colorClase='section-red'
            formatCOP={formatCOP}
          />
          <SeccionMontos
            titulo='Gastos Personales'
            items={q2.gastosPersonales}
            onCambioMonto={(idx, valor) => onActualizarMonto('quincena2', 'gastosPersonales', idx, valor)}
            colorClase='section-personal'
            formatCOP={formatCOP}
          />
          <div className='text-sm font-semibold text-primary text-right'>Total Q2: {formatCOP(totalQ2)}</div>
        </div>
      </div>
    </div>
  );
}

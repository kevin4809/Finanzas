import SeccionGastos from './SeccionGastos';
import InputNumero from './InputNumero';

export default function FormularioQuincena({
  numQuincena,
  mesNombre,
  datos,
  conceptosSugeridos,
  onActualizarIngreso,
  onActualizarMonto,
  onActualizarConcepto,
  onAgregarItem,
  onEliminarItem,
  onToggleRecurrente,
  formatCOP,
}) {
  const ingresoQuincenal = datos.ingreso || 0;
  const totalObligaciones = datos.obligaciones.reduce((sum, item) => sum + item.monto, 0);
  const totalGastos = datos.gastosPersonales.reduce((sum, item) => sum + item.monto, 0);
  const ahorro = ingresoQuincenal - totalObligaciones - totalGastos;

  return (
    <div className='space-y-4'>
      <div className='section-blue p-4 rounded-lg border-2'>
        <h3 className='font-bold text-base sm:text-lg mb-3 text-primary'>
          Quincena {numQuincena} - {mesNombre}
        </h3>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3'>
          <label className='font-medium text-primary text-sm sm:text-base'>Ingreso quincenal:</label>
          <InputNumero
            valor={ingresoQuincenal}
            onChange={onActualizarIngreso}
            className='w-full sm:w-40 input-field text-right font-bold'
          />
          <span className='text-xs sm:text-sm text-muted'>({formatCOP(ingresoQuincenal)})</span>
        </div>
      </div>

      <SeccionGastos
        titulo='Obligaciones'
        items={datos.obligaciones}
        conceptosSugeridos={conceptosSugeridos}
        onCambioMonto={(idx, valor) => onActualizarMonto('obligaciones', idx, valor)}
        onCambioConcepto={(idx, valor) => onActualizarConcepto('obligaciones', idx, valor)}
        onAgregar={(concepto, recurrente, monto) => onAgregarItem('obligaciones', concepto, recurrente, monto)}
        onEliminar={(idx) => onEliminarItem('obligaciones', idx)}
        onToggleRecurrente={(idx, recurrente) => onToggleRecurrente('obligaciones', idx, recurrente)}
        colorClase='section-red'
        formatCOP={formatCOP}
      />

      <SeccionGastos
        titulo='Gastos Personales'
        items={datos.gastosPersonales}
        conceptosSugeridos={conceptosSugeridos}
        onCambioMonto={(idx, valor) => onActualizarMonto('gastosPersonales', idx, valor)}
        onCambioConcepto={(idx, valor) => onActualizarConcepto('gastosPersonales', idx, valor)}
        onAgregar={(concepto, recurrente, monto) => onAgregarItem('gastosPersonales', concepto, recurrente, monto)}
        onEliminar={(idx) => onEliminarItem('gastosPersonales', idx)}
        onToggleRecurrente={(idx, recurrente) => onToggleRecurrente('gastosPersonales', idx, recurrente)}
        colorClase='section-personal'
        formatCOP={formatCOP}
      />

      <div className='section-green p-4 rounded-lg border-2'>
        <div className='flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 mb-2'>
          <span className='font-bold text-base sm:text-lg text-primary'>Ahorro Quincenal:</span>
          <span className={`font-bold text-lg sm:text-xl ${ahorro >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
            {formatCOP(ahorro)}
          </span>
        </div>
        <p className='text-xs sm:text-sm text-muted'>(Lo que no se gastó = Ahorro automático)</p>
      </div>
    </div>
  );
}

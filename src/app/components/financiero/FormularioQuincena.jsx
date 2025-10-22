import SeccionGastos from './SeccionGastos';
import InputNumero from './InputNumero';

export default function FormularioQuincena({
  numQuincena,
  mesNombre,
  datos,
  onActualizarIngreso,
  onActualizarMonto,
  onActualizarConcepto,
  onAgregarItem,
  onEliminarItem,
  // onActualizarAhorro eliminado - ahorro es automático
  formatCOP,
}) {
  const ingresoQuincenal = datos.ingreso || 0;
  const totalObligaciones = datos.obligaciones.reduce((sum, item) => sum + item.monto, 0);
  const totalGastos = datos.gastosPersonales.reduce((sum, item) => sum + item.monto, 0);

  // El ahorro es lo que NO se gastó (calculado automáticamente)
  const ahorro = ingresoQuincenal - totalObligaciones - totalGastos;

  return (
    <div className='space-y-4'>
      <div className='bg-blue-50 p-4 rounded-lg border-2 border-blue-300'>
        <h3 className='font-bold text-base sm:text-lg mb-3 text-black'>
          Quincena {numQuincena} - {mesNombre}
        </h3>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3'>
          <label className='font-medium text-black text-sm sm:text-base'>Ingreso quincenal:</label>
          <InputNumero
            valor={ingresoQuincenal}
            onChange={onActualizarIngreso}
            className='w-full sm:w-40 p-2 border-2 border-blue-400 rounded-lg text-right text-black font-bold bg-white'
          />
          <span className='text-xs sm:text-sm text-gray-600'>({formatCOP(ingresoQuincenal)})</span>
        </div>
      </div>

      <SeccionGastos
        titulo='Obligaciones'
        items={datos.obligaciones}
        onCambioMonto={(idx, valor) => onActualizarMonto('obligaciones', idx, valor)}
        onCambioConcepto={(idx, valor) => onActualizarConcepto('obligaciones', idx, valor)}
        onAgregar={(concepto) => onAgregarItem('obligaciones', concepto)}
        onEliminar={(idx) => onEliminarItem('obligaciones', idx)}
        colorClase='bg-red-50'
        formatCOP={formatCOP}
      />

      <SeccionGastos
        titulo='Gastos Personales'
        items={datos.gastosPersonales}
        onCambioMonto={(idx, valor) => onActualizarMonto('gastosPersonales', idx, valor)}
        onCambioConcepto={(idx, valor) => onActualizarConcepto('gastosPersonales', idx, valor)}
        onAgregar={(concepto) => onAgregarItem('gastosPersonales', concepto)}
        onEliminar={(idx) => onEliminarItem('gastosPersonales', idx)}
        colorClase='bg-orange-50'
        formatCOP={formatCOP}
      />

      <div className='bg-green-50 p-4 rounded-lg border-2 border-green-300'>
        <div className='flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 mb-2'>
          <span className='font-bold text-base sm:text-lg text-black'>Ahorro Quincenal:</span>
          <span className={`font-bold text-lg sm:text-xl ${ahorro >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCOP(ahorro)}
          </span>
        </div>
        <p className='text-xs sm:text-sm text-gray-600'>
          (Lo que no se gastó = Ahorro automático)
        </p>
      </div>
    </div>
  );
}

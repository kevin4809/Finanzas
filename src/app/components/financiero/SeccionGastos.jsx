import { useState, useId } from 'react';
import { Trash2, Plus, Repeat } from 'lucide-react';
import InputNumero from './InputNumero';

export default function SeccionGastos({
  titulo,
  items,
  onCambioMonto,
  onCambioConcepto,
  onAgregar,
  onEliminar,
  onToggleRecurrente,
  conceptosSugeridos = [],
  colorClase,
  formatCOP,
}) {
  const [nuevoConcepto, setNuevoConcepto] = useState('');
  const [nuevoMonto, setNuevoMonto] = useState(0);
  const [nuevoRecurrente, setNuevoRecurrente] = useState(false);
  const datalistId = useId();
  const total = items.reduce((sum, item) => sum + item.monto, 0);

  const handleAgregar = () => {
    if (nuevoConcepto.trim()) {
      onAgregar(nuevoConcepto.trim(), nuevoRecurrente, nuevoMonto);
      setNuevoConcepto('');
      setNuevoMonto(0);
      setNuevoRecurrente(false);
    }
  };

  return (
    <div className={`${colorClase} p-3 sm:p-4 rounded-lg`}>
      <h4 className='font-bold mb-3 text-primary text-sm sm:text-base'>{titulo}</h4>

      <datalist id={datalistId}>
        {conceptosSugeridos.map((concepto) => (
          <option key={concepto} value={concepto} />
        ))}
      </datalist>

      {items.map((item, idx) => (
        <div key={idx} className='flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-3 sm:mb-2 gap-2'>
          <input
            type='text'
            list={datalistId}
            value={item.concepto}
            onChange={(e) => onCambioConcepto(idx, e.target.value)}
            className='input-field flex-1 text-sm sm:text-base'
            placeholder='Concepto'
          />
          <div className='flex items-center gap-2'>
            <InputNumero
              valor={item.monto}
              onChange={(valor) => onCambioMonto(idx, valor)}
              className='flex-1 sm:w-32 input-field text-right text-sm sm:text-base'
            />
            <button
              onClick={() => onToggleRecurrente(idx, !item.recurrente)}
              className={`p-2 rounded transition shrink-0 ${
                item.recurrente
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900/70'
                  : 'text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
              title={item.recurrente ? 'Suscripción recurrente (se repite cada mes)' : 'Marcar como suscripción recurrente'}
            >
              <Repeat size={18} />
            </button>
            <button
              onClick={() => onEliminar(idx)}
              className='p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 rounded transition shrink-0'
              title='Eliminar'
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}

      <div className='flex flex-col gap-2 mt-3 mb-3'>
        <div className='flex flex-col sm:flex-row gap-2'>
          <input
            type='text'
            list={datalistId}
            value={nuevoConcepto}
            onChange={(e) => setNuevoConcepto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAgregar()}
            className='input-field flex-1 text-sm sm:text-base'
            placeholder='Nuevo concepto...'
          />
          <InputNumero
            valor={nuevoMonto}
            onChange={setNuevoMonto}
            className='w-full sm:w-32 input-field text-right text-sm sm:text-base'
          />
          <button
            onClick={handleAgregar}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm sm:text-base'
          >
            <Plus size={18} />
            Agregar
          </button>
        </div>
        <label className='flex items-center gap-2 text-xs sm:text-sm text-muted cursor-pointer'>
          <input
            type='checkbox'
            checked={nuevoRecurrente}
            onChange={(e) => setNuevoRecurrente(e.target.checked)}
            className='rounded'
          />
          Repetir cada mes (suscripción)
        </label>
      </div>

      <div className='border-t border-gray-200 dark:border-slate-600 pt-2 mt-2 font-bold flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-1'>
        <span className='text-primary text-sm sm:text-base'>Subtotal {titulo}:</span>
        <span className='text-primary text-base sm:text-lg'>{formatCOP(total)}</span>
      </div>
    </div>
  );
}

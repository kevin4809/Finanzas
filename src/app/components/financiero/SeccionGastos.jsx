import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import InputNumero from './InputNumero';

export default function SeccionGastos({
  titulo,
  items,
  onCambioMonto,
  onCambioConcepto,
  onAgregar,
  onEliminar,
  colorClase,
  formatCOP
}) {
  const [nuevoConcepto, setNuevoConcepto] = useState('');
  const total = items.reduce((sum, item) => sum + item.monto, 0);

  const handleAgregar = () => {
    if (nuevoConcepto.trim()) {
      onAgregar(nuevoConcepto.trim());
      setNuevoConcepto('');
    }
  };

  return (
    <div className={`${colorClase} p-3 sm:p-4 rounded-lg`}>
      <h4 className='font-bold mb-3 text-black text-sm sm:text-base'>{titulo}</h4>

      {items.map((item, idx) => (
        <div key={idx} className='flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-3 sm:mb-2 gap-2'>
          <input
            type='text'
            value={item.concepto}
            onChange={(e) => onCambioConcepto(idx, e.target.value)}
            className='flex-1 p-2 border rounded text-black text-sm sm:text-base'
            placeholder='Concepto'
          />
          <div className='flex items-center gap-2'>
            <InputNumero
              valor={item.monto}
              onChange={(valor) => onCambioMonto(idx, valor)}
              className='flex-1 sm:w-32 p-2 border rounded text-right text-black text-sm sm:text-base'
            />
            <button
              onClick={() => onEliminar(idx)}
              className='p-2 text-red-600 hover:bg-red-100 rounded transition flex-shrink-0'
              title='Eliminar'
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}

      <div className='flex flex-col sm:flex-row gap-2 mt-3 mb-3'>
        <input
          type='text'
          value={nuevoConcepto}
          onChange={(e) => setNuevoConcepto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAgregar()}
          className='flex-1 p-2 border rounded text-black text-sm sm:text-base'
          placeholder='Nuevo concepto...'
        />
        <button
          onClick={handleAgregar}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm sm:text-base'
        >
          <Plus size={18} />
          Agregar
        </button>
      </div>

      <div className='border-t pt-2 mt-2 font-bold flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-1'>
        <span className='text-black text-sm sm:text-base'>Subtotal {titulo}:</span>
        <span className='text-black text-base sm:text-lg'>{formatCOP(total)}</span>
      </div>
    </div>
  );
}
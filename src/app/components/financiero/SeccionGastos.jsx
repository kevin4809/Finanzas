import { useState, useId } from 'react';
import { Trash2, Plus } from 'lucide-react';
import InputNumero from './InputNumero';
import { obtenerCategoriasPorTipo } from '@/constants/categorias';
import { formatearConceptoConDia } from '../hooks/suscripcionesRecurrentes';

function SelectCategoria({ value, onChange, categorias, className = '' }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`input-compact w-full font-normal truncate ${className}`}
      title='Categoría'
    >
      {Object.entries(categorias).map(([key, cat]) => (
        <option key={key} value={key}>
          {cat.icono} {cat.nombre}
        </option>
      ))}
    </select>
  );
}

export default function SeccionGastos({
  titulo,
  items,
  onCambioMonto,
  onCambioConcepto,
  onCambioCategoria,
  onAgregar,
  onEliminar,
  conceptosSugeridos = [],
  colorClase,
  formatCOP,
  tipoCategoria = 'gastosPersonales',
}) {
  const [nuevoDia, setNuevoDia] = useState('');
  const [nuevoConcepto, setNuevoConcepto] = useState('');
  const [nuevoMonto, setNuevoMonto] = useState(0);
  const [nuevaCategoria, setNuevaCategoria] = useState('otros');
  const datalistId = useId();
  const categorias = obtenerCategoriasPorTipo(tipoCategoria);
  const total = items.reduce((sum, item) => sum + item.monto, 0);

  const handleAgregar = () => {
    const conceptoFinal = formatearConceptoConDia(nuevoDia, nuevoConcepto);
    if (conceptoFinal) {
      onAgregar(conceptoFinal, nuevoMonto, nuevaCategoria);
      setNuevoDia('');
      setNuevoConcepto('');
      setNuevoMonto(0);
      setNuevaCategoria('otros');
    }
  };

  return (
    <div className={`gastos-panel ${colorClase} p-3 sm:p-4 rounded-lg min-w-0 overflow-hidden`}>
      <h4 className='font-bold mb-2 text-primary text-sm sm:text-base'>{titulo}</h4>

      <datalist id={datalistId}>
        {conceptosSugeridos.map((concepto) => (
          <option key={concepto} value={concepto} />
        ))}
      </datalist>

      {items.length > 0 && (
        <div className='gastos-header'>
          <span>Categoría</span>
          <span>Concepto</span>
          <span>Monto</span>
          <span></span>
        </div>
      )}

      <div>
        {items.map((item, idx) => (
          <div key={idx} className='gasto-row'>
            <div className='gasto-row-fields'>
              <SelectCategoria
                value={item.categoria || 'otros'}
                onChange={(e) => onCambioCategoria?.(idx, e.target.value)}
                categorias={categorias}
              />
              <input
                type='text'
                value={item.concepto}
                onChange={(e) => onCambioConcepto(idx, e.target.value)}
                className='input-compact w-full min-w-0'
                placeholder='Concepto'
              />
            </div>
            <div className='gasto-row-footer'>
              <InputNumero
                valor={item.monto}
                onChange={(valor) => onCambioMonto(idx, valor)}
                className='flex-1 min-w-0 input-compact text-right tabular-nums'
              />
              <div className='gasto-actions'>
                <button
                  type='button'
                  onClick={() => onEliminar(idx)}
                  className='gasto-icon-btn is-danger'
                  title='Eliminar'
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='gasto-add-panel'>
        <div className='gasto-add-grid'>
          <SelectCategoria
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            categorias={categorias}
          />
          <input
            type='text'
            inputMode='numeric'
            maxLength={2}
            value={nuevoDia}
            onChange={(e) => setNuevoDia(e.target.value.replace(/\D/g, '').slice(0, 2))}
            className='input-compact text-center'
            placeholder='Día'
            title='Día del mes (opcional)'
          />
          <input
            type='text'
            list={datalistId}
            value={nuevoConcepto}
            onChange={(e) => setNuevoConcepto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAgregar()}
            className='input-compact min-w-0'
            placeholder='Concepto'
          />
          <InputNumero
            valor={nuevoMonto}
            onChange={setNuevoMonto}
            className='input-compact text-right tabular-nums'
          />
          <button type='button' onClick={handleAgregar} className='btn-indigo px-3 py-1.5 text-sm shrink-0'>
            <Plus size={16} />
            Agregar
          </button>
        </div>

        <div className='gasto-add-stack space-y-2'>
          <SelectCategoria
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            categorias={categorias}
          />
          <div className='grid grid-cols-[3.25rem_minmax(0,1fr)] gap-2'>
            <input
              type='text'
              inputMode='numeric'
              maxLength={2}
              value={nuevoDia}
              onChange={(e) => setNuevoDia(e.target.value.replace(/\D/g, '').slice(0, 2))}
              className='input-compact text-center'
              placeholder='Día'
            />
            <input
              type='text'
              list={datalistId}
              value={nuevoConcepto}
              onChange={(e) => setNuevoConcepto(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAgregar()}
              className='input-compact min-w-0'
              placeholder='Concepto (ej. Pago luz)'
            />
          </div>
          <div className='flex gap-2'>
            <InputNumero
              valor={nuevoMonto}
              onChange={setNuevoMonto}
              className='flex-1 min-w-0 input-compact text-right tabular-nums'
            />
            <button type='button' onClick={handleAgregar} className='btn-indigo px-3 py-1.5 text-sm shrink-0'>
              <Plus size={16} />
            </button>
          </div>
        </div>

        <p className='gasto-add-extra mt-2 text-[11px] text-muted leading-snug'>
          {nuevoDia && nuevoConcepto.trim()
            ? `→ ${formatearConceptoConDia(nuevoDia, nuevoConcepto)}`
            : 'Día opcional · Enter para agregar'}
        </p>
      </div>

      <div className='border-t border-gray-200/80 dark:border-slate-600/80 pt-2.5 mt-2 flex justify-between items-center gap-2'>
        <span className='text-primary text-sm font-semibold'>Subtotal {titulo}</span>
        <span className='text-primary text-base font-bold tabular-nums'>{formatCOP(total)}</span>
      </div>
    </div>
  );
}

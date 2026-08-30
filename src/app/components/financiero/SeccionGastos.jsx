import { useState, useId, useCallback, memo } from 'react';
import { Trash2, Plus } from 'lucide-react';
import InputNumero from './InputNumero';
import { obtenerCategoriasPorTipo } from '@/constants/categorias';
import { formatearConceptoConDia, etiquetaQuincena, quincenaPorDia } from '../hooks/suscripcionesRecurrentes';

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

// Fila memoizada: si onCambioMonto/onCambioConcepto/onCambioCategoria/onEliminar
// son estables (useCallback en los padres) y solo se edita el item de ESTA fila,
// las demás filas conservan la misma referencia de `item` y React.memo evita
// re-renderizarlas — antes, escribir en una fila reconciliaba las 30+ filas
// del mes en cada tecla.
const FilaGasto = memo(function FilaGasto({ item, idx, seccion, categorias, onCambioMonto, onCambioConcepto, onCambioCategoria, onEliminar }) {
  return (
    <div className='gasto-row'>
      <div className='gasto-row-fields'>
        <SelectCategoria
          value={item.categoria || 'otros'}
          onChange={(e) => onCambioCategoria?.(seccion, idx, e.target.value)}
          categorias={categorias}
        />
        <input
          type='text'
          value={item.concepto}
          onChange={(e) => onCambioConcepto(seccion, idx, e.target.value)}
          className='input-compact w-full min-w-0'
          placeholder='Concepto'
        />
      </div>
      <div className='gasto-row-footer'>
        <InputNumero
          valor={item.monto}
          onChange={(valor) => onCambioMonto(seccion, idx, valor)}
          className='flex-1 min-w-0 input-compact text-right tabular-nums'
        />
        <div className='gasto-actions'>
          <button
            type='button'
            onClick={() => onEliminar(seccion, idx)}
            className='gasto-icon-btn is-danger'
            title='Eliminar'
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});

function SeccionGastos({
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
  mostrarAgregar = true,
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
    if (conceptoFinal && onAgregar) {
      onAgregar(conceptoFinal, nuevoMonto, nuevaCategoria, nuevoDia);
      setNuevoDia('');
      setNuevoConcepto('');
      setNuevoMonto(0);
      setNuevaCategoria('otros');
    }
  };

  const quincenaDestino = quincenaPorDia(nuevoDia);

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
          <FilaGasto
            key={idx}
            item={item}
            idx={idx}
            seccion={tipoCategoria}
            categorias={categorias}
            onCambioMonto={onCambioMonto}
            onCambioConcepto={onCambioConcepto}
            onCambioCategoria={onCambioCategoria}
            onEliminar={onEliminar}
          />
        ))}
      </div>

      {mostrarAgregar && (
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
          {nuevoDia && nuevoConcepto.trim() && quincenaDestino ? (
            <>
              → {formatearConceptoConDia(nuevoDia, nuevoConcepto)} ·{' '}
              <span className='text-indigo-600 dark:text-indigo-400 font-medium'>
                {etiquetaQuincena(quincenaDestino)} automático
              </span>
            </>
          ) : (
            'Día 1-15 → Q1 · 16-31 → Q2 · Enter para agregar'
          )}
        </p>
      </div>
      )}

      <div className='border-t border-gray-200/80 dark:border-slate-600/80 pt-2.5 mt-2 flex justify-between items-center gap-2'>
        <span className='text-primary text-sm font-semibold'>Subtotal {titulo}</span>
        <span className='text-primary text-base font-bold tabular-nums'>{formatCOP(total)}</span>
      </div>
    </div>
  );
}

export default memo(SeccionGastos);

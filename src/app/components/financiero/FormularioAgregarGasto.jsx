'use client';

import { useState, useId } from 'react';
import { Plus } from 'lucide-react';
import InputNumero from './InputNumero';
import { obtenerCategoriasPorTipo } from '@/constants/categorias';
import {
  formatearConceptoConDia,
  etiquetaQuincena,
  quincenaPorDia,
} from '@/lib/conceptosTexto';

function SelectCategoria({ value, onChange, categorias, className = '' }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`input-field font-normal ${className}`}
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

export default function FormularioAgregarGasto({ conceptosSugeridos, onAgregar, mesNombre }) {
  const [tipo, setTipo] = useState('obligaciones');
  const [dia, setDia] = useState('');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState(0);
  const [categoria, setCategoria] = useState('otros');
  const [error, setError] = useState('');
  const datalistId = useId();

  const categorias = obtenerCategoriasPorTipo(tipo);
  const quincenaDestino = quincenaPorDia(dia);

  const handleAgregar = () => {
    const conceptoFinal = formatearConceptoConDia(dia, concepto);
    if (!concepto.trim()) {
      setError('Escribe un concepto.');
      return;
    }
    if (!quincenaDestino) {
      setError('Ingresa el día del mes (1-31) para ubicarlo en Q1 o Q2.');
      return;
    }
    if (!conceptoFinal) return;

    onAgregar(tipo, conceptoFinal, monto, categoria, dia);
    setDia('');
    setConcepto('');
    setMonto(0);
    setCategoria('otros');
    setError('');
  };

  const handleCambioTipo = (nuevoTipo) => {
    setTipo(nuevoTipo);
    setCategoria('otros');
  };

  return (
    <div className='card p-4 sm:p-5 mb-6 border-2 border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/20'>
      <h3 className='font-bold text-primary text-base sm:text-lg mb-1'>
        Agregar gasto — {mesNombre}
      </h3>
      <p className='text-xs sm:text-sm text-muted mb-4'>
        Un solo formulario: el día define la quincena (1-15 → Q1, 16-31 → Q2).
      </p>

      <datalist id={datalistId}>
        {conceptosSugeridos.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className='flex flex-wrap gap-2 mb-4'>
        <button
          type='button'
          onClick={() => handleCambioTipo('obligaciones')}
          className={tipo === 'obligaciones' ? 'toggle-active' : 'toggle-inactive'}
        >
          Obligaciones
        </button>
        <button
          type='button'
          onClick={() => handleCambioTipo('gastosPersonales')}
          className={tipo === 'gastosPersonales' ? 'toggle-active' : 'toggle-inactive'}
        >
          Gastos personales
        </button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[4rem_minmax(0,1fr)_8rem_minmax(0,1fr)_auto] gap-2 sm:gap-3 items-end'>
        <div className='flex flex-col gap-1'>
          <label className='text-[10px] uppercase tracking-wide text-muted font-semibold'>Día *</label>
          <input
            type='text'
            inputMode='numeric'
            maxLength={2}
            value={dia}
            onChange={(e) => {
              setDia(e.target.value.replace(/\D/g, '').slice(0, 2));
              setError('');
            }}
            className='input-field text-center'
            placeholder='15'
            title='Día del mes'
          />
        </div>
        <div className='flex flex-col gap-1 sm:col-span-1'>
          <label className='text-[10px] uppercase tracking-wide text-muted font-semibold'>Concepto *</label>
          <input
            type='text'
            list={datalistId}
            value={concepto}
            onChange={(e) => {
              setConcepto(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAgregar()}
            className='input-field min-w-0'
            placeholder='Ej. Pago luz'
          />
        </div>
        <div className='flex flex-col gap-1'>
          <label className='text-[10px] uppercase tracking-wide text-muted font-semibold'>Monto</label>
          <InputNumero valor={monto} onChange={setMonto} className='input-field text-right tabular-nums' />
        </div>
        <div className='flex flex-col gap-1'>
          <label className='text-[10px] uppercase tracking-wide text-muted font-semibold'>Categoría</label>
          <SelectCategoria
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            categorias={categorias}
          />
        </div>
        <button
          type='button'
          onClick={handleAgregar}
          className='btn-indigo flex items-center justify-center gap-2 px-4 py-2.5 text-sm w-full sm:w-auto'
        >
          <Plus size={18} />
          Agregar
        </button>
      </div>

      <div className='mt-3 text-xs text-muted'>
        {error && <p className='text-red-600 dark:text-red-400 font-medium mb-1'>{error}</p>}
        {dia && concepto.trim() && quincenaDestino ? (
          <p>
            → {formatearConceptoConDia(dia, concepto)} ·{' '}
            <span className='text-indigo-600 dark:text-indigo-400 font-semibold'>
              {etiquetaQuincena(quincenaDestino)} automático
            </span>
          </p>
        ) : (
          <p>El gasto aparecerá en la columna Q1 o Q2 según el día.</p>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import InputNumero from './InputNumero';
import { suscripcionActivaEnMes } from '../hooks/suscripcionesRecurrentes';
import {
  formatearConceptoConDia,
  parsearConceptoConDia,
  etiquetaQuincena,
  quincenaPorDia,
} from '@/lib/conceptosTexto';

const CATEGORIA_LABEL = {
  obligaciones: 'Obligación',
  gastosPersonales: 'Gasto Personal',
};

const mesDefectoInicio = (anio) => {
  const hoy = new Date();
  return anio === hoy.getFullYear() ? hoy.getMonth() : 0;
};

const formatearPeriodo = (meses, mesInicio, mesFin) => {
  const desde = meses[mesInicio] ?? '';
  if (mesFin === null || mesFin === undefined) {
    return `${desde} → activa`;
  }
  return `${desde} → ${meses[mesFin]}`;
};

function SelectMes({ value, onChange, meses, className = '', allowEmpty = false, emptyLabel = 'Sin fin (activa)' }) {
  return (
    <select value={value ?? ''} onChange={onChange} className={`input-field font-normal py-1.5 text-sm ${className}`}>
      {allowEmpty && (
        <option value=''>{emptyLabel}</option>
      )}
      {meses.map((nombre, idx) => (
        <option key={idx} value={idx}>
          {nombre}
        </option>
      ))}
    </select>
  );
}

function FilaSuscripcion({ sub, meses, onActualizar, onEliminar }) {
  const { dia, base } = parsearConceptoConDia(sub.concepto);
  const [diaLocal, setDiaLocal] = useState(dia);
  const [baseLocal, setBaseLocal] = useState(base);

  const guardarConcepto = () => {
    const nuevo = formatearConceptoConDia(diaLocal, baseLocal);
    if (nuevo !== sub.concepto) {
      const cambios = { concepto: nuevo };
      const nuevaQuincena = quincenaPorDia(diaLocal);
      if (nuevaQuincena && nuevaQuincena !== sub.quincena) {
        cambios.quincena = nuevaQuincena;
      }
      onActualizar(sub.quincena, sub.categoria, sub.concepto, cambios);
    }
  };

  const cambiarInicio = (valor) => {
    const mesInicio = valor;
    let mesFin = sub.mesFin;
    if (mesFin !== null && mesFin !== undefined && mesInicio > mesFin) {
      mesFin = mesInicio;
    }
    onActualizar(sub.quincena, sub.categoria, sub.concepto, { mesInicio, mesFin });
  };

  const cambiarFin = (valorStr) => {
    const mesFin = valorStr === '' ? null : parseInt(valorStr, 10);
    let mesInicio = sub.mesInicio;
    if (mesFin !== null && mesInicio > mesFin) {
      mesInicio = mesFin;
    }
    onActualizar(sub.quincena, sub.categoria, sub.concepto, { mesInicio, mesFin });
  };

  return (
    <tr className='hover:bg-gray-50 dark:hover:bg-slate-700/50'>
      <td className='border border-gray-300 dark:border-slate-600 p-2'>
        <input
          type='text'
          inputMode='numeric'
          maxLength={2}
          value={diaLocal}
          onChange={(e) => setDiaLocal(e.target.value.replace(/\D/g, '').slice(0, 2))}
          onBlur={guardarConcepto}
          placeholder='—'
          className='input-field w-14 text-center py-1.5 text-sm'
          title='Día del mes'
        />
      </td>
      <td className='border border-gray-300 dark:border-slate-600 p-2'>
        <input
          type='text'
          value={baseLocal}
          onChange={(e) => setBaseLocal(e.target.value)}
          onBlur={guardarConcepto}
          className='input-field w-full py-1.5 text-sm min-w-[120px]'
        />
      </td>
      <td className='border border-gray-300 dark:border-slate-600 p-2'>
        <div className='flex flex-col gap-1 min-w-[140px]'>
          <div>
            <span className='text-[10px] text-muted uppercase font-semibold'>Desde</span>
            <SelectMes
              value={sub.mesInicio}
              onChange={(e) => cambiarInicio(parseInt(e.target.value, 10))}
              meses={meses}
            />
          </div>
          <div>
            <span className='text-[10px] text-muted uppercase font-semibold'>Hasta</span>
            <SelectMes
              value={sub.mesFin ?? ''}
              onChange={(e) => cambiarFin(e.target.value)}
              meses={meses}
              allowEmpty
            />
          </div>
          <span className='text-[10px] text-muted'>{formatearPeriodo(meses, sub.mesInicio, sub.mesFin)}</span>
        </div>
      </td>
      <td className='border border-gray-300 dark:border-slate-600 p-3 whitespace-nowrap'>{CATEGORIA_LABEL[sub.categoria]}</td>
      <td className='border border-gray-300 dark:border-slate-600 p-3'>{sub.quincena === 'quincena1' ? 'Q1' : 'Q2'}</td>
      <td className='border border-gray-300 dark:border-slate-600 p-2'>
        <InputNumero
          valor={sub.monto}
          onChange={(valor) => onActualizar(sub.quincena, sub.categoria, sub.concepto, { monto: valor })}
          className='w-full input-field text-right py-1.5'
        />
      </td>
      <td className='border border-gray-300 dark:border-slate-600 p-3 text-center'>
        <button
          onClick={() => onEliminar(sub.quincena, sub.categoria, sub.concepto)}
          className='p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 rounded transition inline-flex'
          title='Eliminar suscripción'
        >
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
}

export default function PanelSuscripciones({
  anio,
  meses,
  suscripciones,
  conceptosSugeridos,
  onAgregar,
  onActualizar,
  onEliminar,
  formatCOP,
}) {
  const mesInicioDefecto = mesDefectoInicio(anio);
  const [dia, setDia] = useState('');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState(0);
  const [categoria, setCategoria] = useState('obligaciones');
  const [mesInicio, setMesInicio] = useState(mesInicioDefecto);
  const [mesFin, setMesFin] = useState('');
  const [error, setError] = useState('');

  const mesActual = anio === new Date().getFullYear() ? new Date().getMonth() : null;
  const suscripcionesActivasMes = mesActual !== null
    ? suscripciones.filter((s) => suscripcionActivaEnMes(mesActual, s.mesInicio, s.mesFin))
    : suscripciones;
  const totalMesReferencia = suscripcionesActivasMes.reduce((sum, s) => sum + s.monto, 0);

  const handleCambioDia = (valor) => {
    setDia(valor);
    setError('');
  };

  const handleAgregar = () => {
    const conceptoFinal = formatearConceptoConDia(dia, concepto);
    const quincenaFinal = quincenaPorDia(dia);
    if (!concepto.trim()) {
      setError('Escribe un concepto.');
      return;
    }
    if (!quincenaFinal) {
      setError('Ingresa el día del mes (1-31) para ubicarlo en Q1 o Q2.');
      return;
    }
    if (!conceptoFinal) return;
    const fin = mesFin === '' ? null : parseInt(mesFin, 10);
    onAgregar({
      concepto: conceptoFinal,
      monto,
      quincena: quincenaFinal,
      categoria,
      mesInicio,
      mesFin: fin,
    });
    setDia('');
    setConcepto('');
    setMonto(0);
    setMesFin('');
    setError('');
  };

  return (
    <div className='space-y-6'>
      <div className='section-blue border rounded-lg p-4'>
        <h3 className='font-bold text-primary mb-1'>Suscripciones {anio}</h3>
        <p className='text-sm text-muted'>
          Elige <strong>Desde</strong> cuándo empieza. <strong>Hasta</strong> es opcional: si no lo llenas, la
          suscripción sigue activa mes a mes. El <strong>día</strong> define la quincena (1-15 → Q1, 16-31 → Q2).
        </p>
        <p className='text-lg font-bold text-blue-700 dark:text-blue-400 mt-2'>
          {mesActual !== null
            ? `Total activo en ${meses[mesActual]}: ${formatCOP(totalMesReferencia)}`
            : `Suscripciones registradas: ${suscripciones.length}`}
        </p>
      </div>

      <div className='card p-4 bg-gray-50 dark:bg-slate-800/80'>
        <h4 className='font-semibold text-primary mb-3'>Nueva suscripción</h4>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
          <input
            type='text'
            inputMode='numeric'
            maxLength={2}
            value={dia}
            onChange={(e) => handleCambioDia(e.target.value.replace(/\D/g, '').slice(0, 2))}
            placeholder='Día'
            title='Día del mes (1-15 → Q1, 16-31 → Q2)'
            className='input-field text-center'
          />
          <input
            type='text'
            list='suscripciones-conceptos'
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAgregar()}
            placeholder='Concepto (ej. Netflix)'
            className='input-field sm:col-span-2 lg:col-span-2'
          />
          <datalist id='suscripciones-conceptos'>
            {conceptosSugeridos.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <InputNumero valor={monto} onChange={setMonto} className='input-field text-right' />
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className='input-field font-normal'>
            <option value='obligaciones'>Obligación</option>
            <option value='gastosPersonales'>Gasto Personal</option>
          </select>
          <div className='flex flex-col gap-1'>
            <label className='text-[10px] uppercase tracking-wide text-muted font-semibold'>Desde *</label>
            <SelectMes value={mesInicio} onChange={(e) => setMesInicio(parseInt(e.target.value, 10))} meses={meses} />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-[10px] uppercase tracking-wide text-muted font-semibold'>Hasta (opcional)</label>
            <SelectMes
              value={mesFin}
              onChange={(e) => setMesFin(e.target.value)}
              meses={meses}
              allowEmpty
            />
          </div>
        </div>
        {error && <p className='text-xs text-red-600 dark:text-red-400 font-medium mt-2'>{error}</p>}
        {concepto.trim() && (
          <p className='text-xs text-muted mt-2'>
            {dia ? `Se guardará como: ${formatearConceptoConDia(dia, concepto)} · ` : ''}
            {quincenaPorDia(dia) ? `${etiquetaQuincena(quincenaPorDia(dia))} automático · ` : 'Ingresa el día · '}
            {formatearPeriodo(meses, mesInicio, mesFin === '' ? null : parseInt(mesFin, 10))}
          </p>
        )}
        <button
          onClick={handleAgregar}
          className='mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
        >
          <Plus size={18} />
          Agregar suscripción
        </button>
      </div>

      {suscripciones.length === 0 ? (
        <p className='text-muted text-center py-8'>No hay suscripciones registradas. Agrega una arriba.</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-primary'>
            <thead>
              <tr className='bg-gray-100 dark:bg-slate-700'>
                <th className='border border-gray-300 dark:border-slate-600 p-3 text-left w-16'>Día</th>
                <th className='border border-gray-300 dark:border-slate-600 p-3 text-left'>Concepto</th>
                <th className='border border-gray-300 dark:border-slate-600 p-3 text-left'>Periodo</th>
                <th className='border border-gray-300 dark:border-slate-600 p-3 text-left'>Categoría</th>
                <th className='border border-gray-300 dark:border-slate-600 p-3 text-left'>Quincena</th>
                <th className='border border-gray-300 dark:border-slate-600 p-3 text-right'>Monto</th>
                <th className='border border-gray-300 dark:border-slate-600 p-3 text-center'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {suscripciones.map((sub) => (
                <FilaSuscripcion
                  key={`${sub.key}|${sub.concepto}|${sub.mesInicio}|${sub.mesFin}`}
                  sub={sub}
                  meses={meses}
                  onActualizar={onActualizar}
                  onEliminar={onEliminar}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

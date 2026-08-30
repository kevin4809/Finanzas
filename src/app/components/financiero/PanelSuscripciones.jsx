import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import InputNumero from './InputNumero';

const CATEGORIA_LABEL = {
  obligaciones: 'Obligación',
  gastosPersonales: 'Gasto Personal',
};

export default function PanelSuscripciones({
  anio,
  suscripciones,
  conceptosSugeridos,
  onAgregar,
  onActualizar,
  onEliminar,
  formatCOP,
}) {
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState(0);
  const [quincena, setQuincena] = useState('quincena1');
  const [categoria, setCategoria] = useState('obligaciones');

  const handleAgregar = () => {
    if (!concepto.trim()) return;
    onAgregar({ concepto: concepto.trim(), monto, quincena, categoria });
    setConcepto('');
    setMonto(0);
  };

  const totalMensual = suscripciones.reduce((sum, s) => sum + s.monto, 0);

  return (
    <div className='space-y-6'>
      <div className='section-blue border rounded-lg p-4'>
        <h3 className='font-bold text-primary mb-1'>Suscripciones {anio}</h3>
        <p className='text-sm text-muted'>
          Administra aquí los gastos fijos mensuales. Se aplican automáticamente a los 12 meses en la quincena
          seleccionada.
        </p>
        <p className='text-lg font-bold text-blue-700 dark:text-blue-400 mt-2'>
          Total mensual: {formatCOP(totalMensual)}
        </p>
      </div>

      <div className='card p-4 bg-gray-50 dark:bg-slate-800/80'>
        <h4 className='font-semibold text-primary mb-3'>Nueva suscripción</h4>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3'>
          <input
            type='text'
            list='suscripciones-conceptos'
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAgregar()}
            placeholder='Concepto (ej. Netflix)'
            className='input-field sm:col-span-2'
          />
          <datalist id='suscripciones-conceptos'>
            {conceptosSugeridos.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <InputNumero valor={monto} onChange={setMonto} className='input-field text-right' />
          <select value={quincena} onChange={(e) => setQuincena(e.target.value)} className='input-field font-normal'>
            <option value='quincena1'>Quincena 1</option>
            <option value='quincena2'>Quincena 2</option>
          </select>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className='input-field font-normal'>
            <option value='obligaciones'>Obligación</option>
            <option value='gastosPersonales'>Gasto Personal</option>
          </select>
        </div>
        <button
          onClick={handleAgregar}
          className='mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
        >
          <Plus size={18} />
          Agregar suscripción
        </button>
      </div>

      {suscripciones.length === 0 ? (
        <p className='text-muted text-center py-8'>
          No hay suscripciones registradas. Agrega una arriba o marca items como recurrentes en el detalle quincenal.
        </p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-primary'>
            <thead>
              <tr className='bg-gray-100 dark:bg-slate-700'>
                <th className='border border-gray-300 dark:border-slate-600 p-3 text-left'>Concepto</th>
                <th className='border border-gray-300 dark:border-slate-600 p-3 text-left'>Categoría</th>
                <th className='border border-gray-300 dark:border-slate-600 p-3 text-left'>Quincena</th>
                <th className='border border-gray-300 dark:border-slate-600 p-3 text-right'>Monto</th>
                <th className='border border-gray-300 dark:border-slate-600 p-3 text-center'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {suscripciones.map((sub) => (
                <tr key={sub.key} className='hover:bg-gray-50 dark:hover:bg-slate-700/50'>
                  <td className='border border-gray-300 dark:border-slate-600 p-3'>{sub.concepto}</td>
                  <td className='border border-gray-300 dark:border-slate-600 p-3'>{CATEGORIA_LABEL[sub.categoria]}</td>
                  <td className='border border-gray-300 dark:border-slate-600 p-3'>{sub.quincena === 'quincena1' ? 'Q1' : 'Q2'}</td>
                  <td className='border border-gray-300 dark:border-slate-600 p-3'>
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
                      title='Eliminar de todos los meses'
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

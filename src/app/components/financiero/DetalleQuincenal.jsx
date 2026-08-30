'use client';

import { useState, useCallback } from 'react';
import FormularioQuincena from './FormularioQuincena';
import FormularioAgregarGasto from './FormularioAgregarGasto';
import VistaRapidaMontos from './VistaRapidaMontos';
import AnalisisMesQuincenal from './AnalisisMesQuincenal';
import { quincenaPorDia } from '@/lib/conceptosTexto';

export default function DetalleQuincenal({
  mesSeleccionado,
  meses,
  datosQuincenales,
  conceptosSugeridos,
  ingresoMensual,
  onCambiarMes,
  onActualizarIngresoQuincenal,
  onActualizarMontoQuincenal,
  onActualizarConceptoQuincenal,
  onActualizarCategoriaQuincenal,
  onAgregarItemQuincenal,
  onEliminarItemQuincenal,
  datosResumen,
  formatCOP,
}) {
  const [vistaRapida, setVistaRapida] = useState(false);

  // Los useCallback deben ir antes de cualquier return condicional (reglas de
  // hooks) — por eso el "if (!datosQuincenales)" está después de todos ellos.
  // Todos estos handlers van con useCallback para que FormularioQuincena/
  // SeccionGastos reciban props estables: son memo() y sin esto, cada tecla
  // recreaba las funciones y forzaba a reconciliar TODAS las filas del mes,
  // no solo la que se estaba editando.
  const handleAgregarUnificado = useCallback((seccion, concepto, monto, categoriaItem, dia) => {
    const destino = quincenaPorDia(dia);
    if (!destino) return;
    onAgregarItemQuincenal(destino, seccion, concepto, monto, categoriaItem);
  }, [onAgregarItemQuincenal]);

  const handleActualizarMontoQ1 = useCallback((categoria, idx, valor) => {
    onActualizarMontoQuincenal('quincena1', categoria, idx, valor);
  }, [onActualizarMontoQuincenal]);

  const handleActualizarMontoQ2 = useCallback((categoria, idx, valor) => {
    onActualizarMontoQuincenal('quincena2', categoria, idx, valor);
  }, [onActualizarMontoQuincenal]);

  const handleActualizarConceptoQ1 = useCallback((categoria, idx, valor) => {
    onActualizarConceptoQuincenal('quincena1', categoria, idx, valor);
  }, [onActualizarConceptoQuincenal]);

  const handleActualizarConceptoQ2 = useCallback((categoria, idx, valor) => {
    onActualizarConceptoQuincenal('quincena2', categoria, idx, valor);
  }, [onActualizarConceptoQuincenal]);

  const handleActualizarCategoriaQ1 = useCallback((categoria, idx, valor) => {
    onActualizarCategoriaQuincenal('quincena1', categoria, idx, valor);
  }, [onActualizarCategoriaQuincenal]);

  const handleActualizarCategoriaQ2 = useCallback((categoria, idx, valor) => {
    onActualizarCategoriaQuincenal('quincena2', categoria, idx, valor);
  }, [onActualizarCategoriaQuincenal]);

  const handleEliminarItemQ1 = useCallback((categoria, idx) => {
    onEliminarItemQuincenal('quincena1', categoria, idx);
  }, [onEliminarItemQuincenal]);

  const handleEliminarItemQ2 = useCallback((categoria, idx) => {
    onEliminarItemQuincenal('quincena2', categoria, idx);
  }, [onEliminarItemQuincenal]);

  const handleActualizarIngresoQ1 = useCallback((valor) => onActualizarIngresoQuincenal('quincena1', valor), [onActualizarIngresoQuincenal]);
  const handleActualizarIngresoQ2 = useCallback((valor) => onActualizarIngresoQuincenal('quincena2', valor), [onActualizarIngresoQuincenal]);

  if (!datosQuincenales) {
    return <div className='p-6 text-primary'>Cargando datos...</div>;
  }

  const datosQuincena1 = datosQuincenales.quincena1;
  const datosQuincena2 = datosQuincenales.quincena2;

  return (
    <div>
      <div className='mb-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center flex-wrap'>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3'>
          <label className='font-medium text-primary text-sm sm:text-base'>Seleccionar mes:</label>
          <select
            value={mesSeleccionado}
            onChange={(e) => onCambiarMes(parseInt(e.target.value))}
            className='select-field w-full sm:w-auto font-normal'
          >
            {meses.map((mes, idx) => (
              <option key={idx} value={idx}>
                {mes}
              </option>
            ))}
          </select>
        </div>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 section-blue px-4 py-3 sm:py-2 rounded-lg border-2'>
          <label className='font-medium text-primary text-sm sm:text-base'>Ingreso mensual total:</label>
          <span className='text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-300'>{formatCOP(ingresoMensual)}</span>
        </div>
        <div className='toggle-group ml-auto'>
          <button
            onClick={() => setVistaRapida(false)}
            className={!vistaRapida ? 'toggle-active' : 'toggle-inactive'}
          >
            Vista completa
          </button>
          <button
            onClick={() => setVistaRapida(true)}
            className={vistaRapida ? 'toggle-active' : 'toggle-inactive'}
          >
            Solo montos
          </button>
        </div>
      </div>

      {vistaRapida ? (
        <VistaRapidaMontos
          mesNombre={meses[mesSeleccionado]}
          datosQuincenales={datosQuincenales}
          onActualizarMonto={onActualizarMontoQuincenal}
          formatCOP={formatCOP}
        />
      ) : (
        <>
          <FormularioAgregarGasto
            mesNombre={meses[mesSeleccionado]}
            conceptosSugeridos={conceptosSugeridos}
            onAgregar={handleAgregarUnificado}
          />

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0'>
            <FormularioQuincena
              numQuincena={1}
              mesNombre={meses[mesSeleccionado]}
              datos={datosQuincena1}
              conceptosSugeridos={conceptosSugeridos}
              onActualizarIngreso={handleActualizarIngresoQ1}
              onActualizarMonto={handleActualizarMontoQ1}
              onActualizarConcepto={handleActualizarConceptoQ1}
              onActualizarCategoria={handleActualizarCategoriaQ1}
              onEliminarItem={handleEliminarItemQ1}
              formatCOP={formatCOP}
            />
            <FormularioQuincena
              numQuincena={2}
              mesNombre={meses[mesSeleccionado]}
              datos={datosQuincena2}
              conceptosSugeridos={conceptosSugeridos}
              onActualizarIngreso={handleActualizarIngresoQ2}
              onActualizarMonto={handleActualizarMontoQ2}
              onActualizarConcepto={handleActualizarConceptoQ2}
              onActualizarCategoria={handleActualizarCategoriaQ2}
              onEliminarItem={handleEliminarItemQ2}
              formatCOP={formatCOP}
            />
          </div>
        </>
      )}

      <AnalisisMesQuincenal
        mesNombre={meses[mesSeleccionado]}
        mesSeleccionado={mesSeleccionado}
        datosQuincenales={datosQuincenales}
        datosResumen={datosResumen}
        formatCOP={formatCOP}
      />
    </div>
  );
}

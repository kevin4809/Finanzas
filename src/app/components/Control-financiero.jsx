'use client';

import React from 'react';
import { useFinanzas } from './hooks/useFinanzas';
import BarraAcciones from './financiero/BarraAcciones';
import ResumenMensual from './financiero/ResumenMensual';
import DetalleQuincenal from './financiero/DetalleQuincenal';
import AnalisisAnual from './financiero/AnalisisAnual';

const ControlFinanciero = () => {
  const {
    MESES,
    datosResumen,
    datosQuincenales,
    mesSeleccionado,
    anioSeleccionado,
    aniosDisponibles,
    activeSheet,
    ingresoMensualActual,
    isLoading,
    isSaving,
    setMesSeleccionado,
    setAnioSeleccionado,
    setActiveSheet,
    crearNuevoAnio,
    actualizarIngresoQuincenal,
    actualizarMontoQuincenal,
    actualizarConcepto,
    actualizarCategoria,
    agregarItem,
    eliminarItem,
    formatCOP,
    exportarACSV,
    guardarDatos,
    cargarDatos,
  } = useFinanzas();

  const handleCrearNuevoAnio = () => {
    const nuevoAnio = parseInt(prompt('Ingrese el año a crear:', new Date().getFullYear() + 1));
    if (nuevoAnio && !isNaN(nuevoAnio)) {
      crearNuevoAnio(nuevoAnio);
      setAnioSeleccionado(nuevoAnio);
    }
  };

  // Mostrar pantalla de carga mientras se cargan los datos
  if (isLoading) {
    return (
      <div className='max-w-7xl mx-auto p-6 bg-white min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4'></div>
          <p className='text-xl text-gray-700 font-medium'>Cargando datos financieros...</p>
          <p className='text-sm text-gray-500 mt-2'>Conectando con MongoDB</p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto p-6 bg-white min-h-screen'>
      <div className='mb-6 flex justify-between items-start'>
        <div>
          <h1 className='text-4xl font-bold text-black mb-2'>Control Financiero Personal</h1>
          <div className='flex items-center gap-3'>
            <p className='text-black'>Año: {anioSeleccionado}</p>
            {isSaving && (
              <span className='flex items-center gap-2 text-sm text-blue-600 animate-pulse'>
                <svg className='animate-spin h-4 w-4' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
                Guardando en MongoDB...
              </span>
            )}
          </div>
        </div>
        <div className='flex gap-2 items-center'>
          <label className='font-medium text-black'>Año:</label>
          <select
            value={anioSeleccionado}
            onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
            className='p-2 border rounded-lg text-black font-bold'
          >
            {aniosDisponibles.map((anio) => (
              <option key={anio} value={anio}>
                {anio}
              </option>
            ))}
          </select>
          <button
            onClick={handleCrearNuevoAnio}
            className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium'
          >
            + Nuevo Año
          </button>
        </div>
      </div>

      <BarraAcciones onExportarCSV={exportarACSV} onGuardarDatos={guardarDatos} onCargarDatos={cargarDatos} />

      <div className='flex gap-2 mb-6 border-b'>
        <button
          onClick={() => setActiveSheet('resumen')}
          className={`px-6 py-3 font-medium transition ${
            activeSheet === 'resumen' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-black hover:text-gray-900'
          }`}
        >
          Resumen Mensual
        </button>
        <button
          onClick={() => setActiveSheet('quincenal')}
          className={`px-6 py-3 font-medium transition ${
            activeSheet === 'quincenal' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-black hover:text-gray-900'
          }`}
        >
          Detalle Quincenal
        </button>
        <button
          onClick={() => setActiveSheet('analisis')}
          className={`px-6 py-3 font-medium transition ${
            activeSheet === 'analisis' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-black hover:text-gray-900'
          }`}
        >
          Análisis Anual
        </button>
      </div>

      {activeSheet === 'resumen' && <ResumenMensual datosResumen={datosResumen} formatCOP={formatCOP} />}

      {activeSheet === 'quincenal' && (
        <DetalleQuincenal
          mesSeleccionado={mesSeleccionado}
          meses={MESES}
          datosQuincenales={datosQuincenales}
          ingresoMensual={ingresoMensualActual}
          onCambiarMes={setMesSeleccionado}
          onActualizarIngresoQuincenal={actualizarIngresoQuincenal}
          onActualizarMontoQuincenal={actualizarMontoQuincenal}
          onActualizarConceptoQuincenal={actualizarConcepto}
          onActualizarCategoriaQuincenal={actualizarCategoria}
          onAgregarItemQuincenal={agregarItem}
          onEliminarItemQuincenal={eliminarItem}
          formatCOP={formatCOP}
        />
      )}

      {activeSheet === 'analisis' && <AnalisisAnual datosResumen={datosResumen} formatCOP={formatCOP} anioSeleccionado={anioSeleccionado} />}
    </div>
  );
};

export default ControlFinanciero;

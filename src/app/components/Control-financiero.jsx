'use client';

import React from 'react';
import { Wallet, TrendingUp, CalendarDays, Repeat, BarChart3, LineChart } from 'lucide-react';
import { useFinanzas } from './hooks/useFinanzas';
import BarraAcciones from './financiero/BarraAcciones';
import ResumenMensual from './financiero/ResumenMensual';
import DetalleQuincenal from './financiero/DetalleQuincenal';
import AnalisisAnual from './financiero/AnalisisAnual';
import PanelSuscripciones from './financiero/PanelSuscripciones';
import PanelInversiones from './financiero/PanelInversiones';
import ThemeToggle from './ThemeToggle';

const TABS = [
  { id: 'resumen', label: 'Resumen Mensual', icon: CalendarDays },
  { id: 'quincenal', label: 'Detalle Quincenal', icon: Wallet },
  { id: 'suscripciones', label: 'Suscripciones', icon: Repeat },
  { id: 'analisis', label: 'Análisis Anual', icon: BarChart3 },
  { id: 'inversiones', label: 'Inversiones y Crédito', icon: LineChart },
];

const ControlFinanciero = () => {
  const {
    MESES,
    datosResumen,
    datosQuincenales,
    conceptosSugeridos,
    suscripciones,
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
    agregarItem,
    eliminarItem,
    toggleRecurrente,
    agregarSuscripcion,
    actualizarSuscripcion,
    eliminarSuscripcion,
    guardarManualmente,
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

  if (isLoading) {
    return (
      <div className='app-shell max-w-7xl mx-auto p-6 flex items-center justify-center min-h-screen'>
        <div className='text-center card p-10'>
          <div className='loader-ring h-16 w-16 mb-6 mx-auto'></div>
          <p className='text-xl font-display font-bold text-primary'>Cargando datos financieros...</p>
          <p className='text-sm text-muted mt-2'>Conectando con MongoDB</p>
        </div>
      </div>
    );
  }

  return (
    <div className='app-shell max-w-7xl mx-auto p-4 sm:p-6'>
      <header className='card p-6 mb-6'>
        <div className='flex justify-between items-start gap-4 flex-wrap'>
          <div className='flex items-start gap-4'>
            <div className='hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30'>
              <TrendingUp className='w-7 h-7 text-white' />
            </div>
            <div>
              <h1 className='font-display text-3xl sm:text-4xl font-bold text-primary tracking-tight'>
                Control Financiero
              </h1>
              <div className='flex items-center gap-3 mt-2 flex-wrap'>
                <span className='badge'>
                  <CalendarDays size={12} />
                  {anioSeleccionado}
                </span>
                {isSaving && (
                  <span className='badge badge-saving'>
                    <svg className='animate-spin h-3 w-3' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Guardando...
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className='flex gap-2 items-center flex-wrap'>
            <ThemeToggle />
            <select value={anioSeleccionado} onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))} className='select-field'>
              {aniosDisponibles.map((anio) => (
                <option key={anio} value={anio}>
                  {anio}
                </option>
              ))}
            </select>
            <button onClick={handleCrearNuevoAnio} className='btn-success'>
              + Nuevo Año
            </button>
          </div>
        </div>
      </header>

      <BarraAcciones
        onExportarCSV={exportarACSV}
        onGuardarDatos={guardarDatos}
        onCargarDatos={cargarDatos}
        onGuardarManual={guardarManualmente}
      />

      <nav className='tab-bar mb-6'>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSheet(id)}
            className={activeSheet === id ? 'tab-active flex items-center gap-2' : 'tab-inactive flex items-center gap-2'}
          >
            <Icon size={16} />
            <span className='hidden sm:inline'>{label}</span>
            <span className='sm:hidden'>{label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>

      <main className='card p-4 sm:p-6'>
        {activeSheet === 'resumen' && <ResumenMensual datosResumen={datosResumen} formatCOP={formatCOP} />}

        {activeSheet === 'quincenal' && (
          <DetalleQuincenal
            mesSeleccionado={mesSeleccionado}
            meses={MESES}
            datosQuincenales={datosQuincenales}
            conceptosSugeridos={conceptosSugeridos}
            ingresoMensual={ingresoMensualActual}
            onCambiarMes={setMesSeleccionado}
            onActualizarIngresoQuincenal={actualizarIngresoQuincenal}
            onActualizarMontoQuincenal={actualizarMontoQuincenal}
            onActualizarConceptoQuincenal={actualizarConcepto}
            onAgregarItemQuincenal={agregarItem}
            onEliminarItemQuincenal={eliminarItem}
            onToggleRecurrenteQuincenal={toggleRecurrente}
            formatCOP={formatCOP}
          />
        )}

        {activeSheet === 'suscripciones' && (
          <PanelSuscripciones
            anio={anioSeleccionado}
            suscripciones={suscripciones}
            conceptosSugeridos={conceptosSugeridos}
            onAgregar={agregarSuscripcion}
            onActualizar={actualizarSuscripcion}
            onEliminar={eliminarSuscripcion}
            formatCOP={formatCOP}
          />
        )}

        {activeSheet === 'analisis' && <AnalisisAnual datosResumen={datosResumen} formatCOP={formatCOP} />}

        {activeSheet === 'inversiones' && (
          <PanelInversiones datosResumen={datosResumen} formatCOP={formatCOP} />
        )}
      </main>
    </div>
  );
};

export default ControlFinanciero;

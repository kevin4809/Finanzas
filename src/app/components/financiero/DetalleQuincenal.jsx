import FormularioQuincena from './FormularioQuincena';

export default function DetalleQuincenal({
  mesSeleccionado,
  meses,
  datosQuincenales,
  ingresoMensual,
  onCambiarMes,
  onActualizarIngresoQuincenal,
  onActualizarMontoQuincenal,
  onActualizarConceptoQuincenal,
  onActualizarCategoriaQuincenal,
  onAgregarItemQuincenal,
  onEliminarItemQuincenal,
  // onActualizarAhorroQuincenal eliminado - ahorro es automático
  formatCOP,
}) {
  // Validar que datosQuincenales existe antes de acceder
  if (!datosQuincenales) {
    return <div className='p-6 text-black'>Cargando datos...</div>;
  }

  const datosQuincena1 = datosQuincenales.quincena1;
  const datosQuincena2 = datosQuincenales.quincena2;

  const handleActualizarMontoQ1 = (categoria, idx, valor) => {
    onActualizarMontoQuincenal('quincena1', categoria, idx, valor);
  };

  const handleActualizarMontoQ2 = (categoria, idx, valor) => {
    onActualizarMontoQuincenal('quincena2', categoria, idx, valor);
  };

  const handleActualizarConceptoQ1 = (categoria, idx, valor) => {
    onActualizarConceptoQuincenal('quincena1', categoria, idx, valor);
  };

  const handleActualizarConceptoQ2 = (categoria, idx, valor) => {
    onActualizarConceptoQuincenal('quincena2', categoria, idx, valor);
  };

  const handleActualizarCategoriaQ1 = (categoria, idx, valor) => {
    onActualizarCategoriaQuincenal('quincena1', categoria, idx, valor);
  };

  const handleActualizarCategoriaQ2 = (categoria, idx, valor) => {
    onActualizarCategoriaQuincenal('quincena2', categoria, idx, valor);
  };

  const handleAgregarItemQ1 = (categoria, concepto) => {
    onAgregarItemQuincenal('quincena1', categoria, concepto);
  };

  const handleAgregarItemQ2 = (categoria, concepto) => {
    onAgregarItemQuincenal('quincena2', categoria, concepto);
  };

  const handleEliminarItemQ1 = (categoria, idx) => {
    onEliminarItemQuincenal('quincena1', categoria, idx);
  };

  const handleEliminarItemQ2 = (categoria, idx) => {
    onEliminarItemQuincenal('quincena2', categoria, idx);
  };

  // handleActualizarAhorroQ1 y Q2 eliminados - ahorro es automático

  return (
    <div>
      <div className='mb-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center'>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3'>
          <label className='font-medium text-black text-sm sm:text-base'>Seleccionar mes:</label>
          <select value={mesSeleccionado} onChange={(e) => onCambiarMes(parseInt(e.target.value))} className='p-2 border rounded-lg text-black w-full sm:w-auto'>
            {meses.map((mes, idx) => (
              <option key={idx} value={idx}>
                {mes}
              </option>
            ))}
          </select>
        </div>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-blue-50 px-4 py-3 sm:py-2 rounded-lg border-2 border-blue-200'>
          <label className='font-medium text-black text-sm sm:text-base'>Ingreso mensual total:</label>
          <span className='text-lg sm:text-xl font-bold text-blue-600'>{formatCOP(ingresoMensual)}</span>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <FormularioQuincena
          numQuincena={1}
          mesNombre={meses[mesSeleccionado]}
          datos={datosQuincena1}
          onActualizarIngreso={(valor) => onActualizarIngresoQuincenal('quincena1', valor)}
          onActualizarMonto={handleActualizarMontoQ1}
          onActualizarConcepto={handleActualizarConceptoQ1}
          onActualizarCategoria={handleActualizarCategoriaQ1}
          onAgregarItem={handleAgregarItemQ1}
          onEliminarItem={handleEliminarItemQ1}
          formatCOP={formatCOP}
        />
        <FormularioQuincena
          numQuincena={2}
          mesNombre={meses[mesSeleccionado]}
          datos={datosQuincena2}
          onActualizarIngreso={(valor) => onActualizarIngresoQuincenal('quincena2', valor)}
          onActualizarMonto={handleActualizarMontoQ2}
          onActualizarConcepto={handleActualizarConceptoQ2}
          onActualizarCategoria={handleActualizarCategoriaQ2}
          onAgregarItem={handleAgregarItemQ2}
          onEliminarItem={handleEliminarItemQ2}
          formatCOP={formatCOP}
        />
      </div>
    </div>
  );
}

export default function AnalisisAnual({ datosResumen, formatCOP }) {
  // Determinar el mes actual del año (0-11) y calcular meses transcurridos
  const mesActual = new Date().getMonth();
  const mesesTranscurridos = mesActual + 1;

  // Filtrar solo los meses que ya han pasado
  const datosReales = datosResumen.slice(0, mesesTranscurridos);
  const mesesRestantes = 12 - mesesTranscurridos;

  // Totales anuales (solo meses transcurridos)
  const totalIngresoAnual = datosReales.reduce((sum, mes) => sum + mes.ingresoTotal, 0);
  const totalObligaciones = datosReales.reduce((sum, mes) => sum + mes.obligaciones, 0);
  const totalGastosPersonales = datosReales.reduce((sum, mes) => sum + mes.gastosPersonales, 0);
  const totalAhorrado = datosReales.reduce((sum, mes) => sum + mes.ahorroEnCuenta, 0);
  const totalGastosAnual = totalObligaciones + totalGastosPersonales;

  // Promedios (basados en meses transcurridos)
  const promedioIngresoMensual = mesesTranscurridos > 0 ? totalIngresoAnual / mesesTranscurridos : 0;
  const promedioAhorroMensual = mesesTranscurridos > 0 ? totalAhorrado / mesesTranscurridos : 0;
  const promedioGastosMensual = mesesTranscurridos > 0 ? totalGastosAnual / mesesTranscurridos : 0;

  // Análisis de tendencias - Mejor y peor mes (solo meses transcurridos)
  const mejorMesAhorro = datosReales.length > 0 ? datosReales.reduce((max, mes) =>
    mes.ahorroEnCuenta > max.ahorroEnCuenta ? mes : max, datosReales[0]
  ) : { mes: 'N/A', ahorroEnCuenta: 0 };

  const peorMesAhorro = datosReales.length > 0 ? datosReales.reduce((min, mes) =>
    mes.ahorroEnCuenta < min.ahorroEnCuenta ? mes : min, datosReales[0]
  ) : { mes: 'N/A', ahorroEnCuenta: 0 };

  const mesMaxGastos = datosReales.length > 0 ? datosReales.reduce((max, mes) => {
    const gastoTotal = mes.obligaciones + mes.gastosPersonales;
    const maxGastoTotal = max.obligaciones + max.gastosPersonales;
    return gastoTotal > maxGastoTotal ? mes : max;
  }, datosReales[0]) : { mes: 'N/A', obligaciones: 0, gastosPersonales: 0 };

  const mesMinGastos = datosReales.length > 0 ? datosReales.reduce((min, mes) => {
    const gastoTotal = mes.obligaciones + mes.gastosPersonales;
    const minGastoTotal = min.obligaciones + min.gastosPersonales;
    return gastoTotal < minGastoTotal ? mes : min;
  }, datosReales[0]) : { mes: 'N/A', obligaciones: 0, gastosPersonales: 0 };

  // Ratios financieros
  const tasaAhorroPromedio = totalIngresoAnual > 0 ? ((totalAhorrado / totalIngresoAnual) * 100).toFixed(1) : '0.0';
  const ratioObligaciones = totalIngresoAnual > 0 ? ((totalObligaciones / totalIngresoAnual) * 100).toFixed(1) : '0.0';
  const ratioGastosPersonales = totalIngresoAnual > 0 ? ((totalGastosPersonales / totalIngresoAnual) * 100).toFixed(1) : '0.0';

  // Comparativas (solo meses transcurridos)
  const mesesConAhorroPositivo = datosReales.filter(mes => mes.ahorroEnCuenta > 0).length;
  const mesesConAhorroNegativo = datosReales.filter(mes => mes.ahorroEnCuenta < 0).length;

  // Variabilidad (desviación estándar del ahorro - solo meses transcurridos)
  const mediaAhorro = mesesTranscurridos > 0 ? totalAhorrado / mesesTranscurridos : 0;
  const varianza = mesesTranscurridos > 0 ? datosReales.reduce((sum, mes) => {
    return sum + Math.pow(mes.ahorroEnCuenta - mediaAhorro, 2);
  }, 0) / mesesTranscurridos : 0;
  const desviacionEstandar = Math.sqrt(varianza);

  // Proyección (basado en meses transcurridos)
  const proyeccionAhorroAnual = mesesTranscurridos > 0 ? (totalAhorrado / mesesTranscurridos) * 12 : 0;

  // Tendencia de ahorro (comparar primera mitad vs segunda mitad - solo de meses transcurridos)
  let tendencia = 'N/A';
  let tendenciaColor = 'text-gray-600';

  if (mesesTranscurridos >= 2) {
    const mitad = Math.floor(mesesTranscurridos / 2);
    const primeraMetad = datosReales.slice(0, mitad);
    const segundaMetad = datosReales.slice(mitad);

    const ahorroPrimeraMetad = primeraMetad.length > 0 ?
      primeraMetad.reduce((sum, mes) => sum + mes.ahorroEnCuenta, 0) / primeraMetad.length : 0;
    const ahorroSegundaMetad = segundaMetad.length > 0 ?
      segundaMetad.reduce((sum, mes) => sum + mes.ahorroEnCuenta, 0) / segundaMetad.length : 0;

    tendencia = ahorroSegundaMetad > ahorroPrimeraMetad ? 'Creciente' :
                ahorroSegundaMetad < ahorroPrimeraMetad ? 'Decreciente' : 'Estable';
    tendenciaColor = tendencia === 'Creciente' ? 'text-green-600 dark:text-green-400' :
                     tendencia === 'Decreciente' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-slate-400';
  }

  const categorias = [
    {
      nombre: 'Obligaciones',
      valor: totalObligaciones / 12,
      color: 'bg-red-500',
    },
    {
      nombre: 'Gastos Personales',
      valor: totalGastosPersonales / 12,
      color: 'bg-orange-500',
    },
    {
      nombre: 'Ahorro',
      valor: totalAhorrado / 12,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Indicador de meses transcurridos */}
      <div className='section-blue border p-4 rounded-lg'>
        <p className='text-sm text-muted'>
          📅 <span className='font-semibold'>Análisis basado en {mesesTranscurridos} {mesesTranscurridos === 1 ? 'mes transcurrido' : 'meses transcurridos'}</span> de 12
          {mesesRestantes > 0 && <span className='text-gray-500 dark:text-slate-500'> ({mesesRestantes} {mesesRestantes === 1 ? 'mes restante' : 'meses restantes'})</span>}
        </p>
      </div>

      {/* Tarjetas de totales anuales */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='stat-card stat-card-blue'>
          <h3 className='text-sm font-medium mb-2 opacity-90 relative z-10'>Total Ingresos ({mesesTranscurridos} meses)</h3>
          <p className='text-3xl font-bold font-display relative z-10'>{formatCOP(totalIngresoAnual)}</p>
          <p className='text-xs mt-2 opacity-75 relative z-10'>Promedio: {formatCOP(promedioIngresoMensual)}/mes</p>
        </div>
        <div className='stat-card stat-card-red'>
          <h3 className='text-sm font-medium mb-2 opacity-90 relative z-10'>Total Obligaciones</h3>
          <p className='text-3xl font-bold font-display relative z-10'>{formatCOP(totalObligaciones)}</p>
          <p className='text-xs mt-2 opacity-75 relative z-10'>{ratioObligaciones}% del ingreso</p>
        </div>
        <div className='stat-card stat-card-orange'>
          <h3 className='text-sm font-medium mb-2 opacity-90 relative z-10'>Total Gastos Personales</h3>
          <p className='text-3xl font-bold font-display relative z-10'>{formatCOP(totalGastosPersonales)}</p>
          <p className='text-xs mt-2 opacity-75 relative z-10'>{ratioGastosPersonales}% del ingreso</p>
        </div>
        <div className='stat-card stat-card-green'>
          <h3 className='text-sm font-medium mb-2 opacity-90 relative z-10'>Total Ahorrado</h3>
          <p className='text-3xl font-bold font-display relative z-10'>{formatCOP(totalAhorrado)}</p>
          <p className='text-xs mt-2 opacity-75 relative z-10'>Tasa: {tasaAhorroPromedio}%</p>
        </div>
      </div>

      {/* Ratios Financieros */}
      <div className='card p-6'>
        <h3 className='font-display font-bold text-xl mb-4 text-primary'>Ratios Financieros</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='card p-4 shadow-sm'>
            <p className='text-sm text-muted mb-1'>Tasa de Ahorro</p>
            <p className='text-2xl font-bold text-green-600 dark:text-green-400'>{tasaAhorroPromedio}%</p>
            <div className='mt-2 w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2'>
              <div className='bg-green-500 h-2 rounded-full' style={{ width: `${tasaAhorroPromedio}%` }}></div>
            </div>
          </div>
          <div className='card p-4 shadow-sm'>
            <p className='text-sm text-muted mb-1'>Ratio Obligaciones</p>
            <p className='text-2xl font-bold text-red-600 dark:text-red-400'>{ratioObligaciones}%</p>
            <div className='mt-2 w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2'>
              <div className='bg-red-500 h-2 rounded-full' style={{ width: `${ratioObligaciones}%` }}></div>
            </div>
          </div>
          <div className='card p-4 shadow-sm'>
            <p className='text-sm text-muted mb-1'>Ratio Gastos Personales</p>
            <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>{ratioGastosPersonales}%</p>
            <div className='mt-2 w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2'>
              <div className='bg-orange-500 h-2 rounded-full' style={{ width: `${ratioGastosPersonales}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis de Tendencias */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='card p-6 shadow-sm'>
          <h3 className='font-bold text-lg mb-4 text-gray-800 dark:text-slate-100'>📈 Mejor Desempeño</h3>
          <div className='space-y-3'>
            <div className='section-green p-3 rounded-lg border'>
              <p className='text-sm text-muted'>Mejor mes de ahorro</p>
              <p className='text-lg font-bold text-green-700 dark:text-green-400'>{mejorMesAhorro.mes}</p>
              <p className='text-xl font-bold text-green-600 dark:text-green-400'>{formatCOP(mejorMesAhorro.ahorroEnCuenta)}</p>
            </div>
            <div className='section-blue p-3 rounded-lg border'>
              <p className='text-sm text-muted'>Mes más austero</p>
              <p className='text-lg font-bold text-blue-700 dark:text-blue-400'>{mesMinGastos.mes}</p>
              <p className='text-xl font-bold text-blue-600 dark:text-blue-400'>{formatCOP(mesMinGastos.obligaciones + mesMinGastos.gastosPersonales)}</p>
            </div>
          </div>
        </div>

        <div className='card p-6 shadow-sm'>
          <h3 className='font-bold text-lg mb-4 text-gray-800 dark:text-slate-100'>📉 Áreas de Mejora</h3>
          <div className='space-y-3'>
            <div className='bg-red-50 dark:bg-red-950/40 p-3 rounded-lg border border-red-200 dark:border-red-800'>
              <p className='text-sm text-muted'>Peor mes de ahorro</p>
              <p className='text-lg font-bold text-red-700 dark:text-red-400'>{peorMesAhorro.mes}</p>
              <p className='text-xl font-bold text-red-600 dark:text-red-400'>{formatCOP(peorMesAhorro.ahorroEnCuenta)}</p>
            </div>
            <div className='bg-orange-50 dark:bg-orange-950/40 p-3 rounded-lg border border-orange-200 dark:border-orange-800'>
              <p className='text-sm text-muted'>Mes más gastador</p>
              <p className='text-lg font-bold text-orange-700 dark:text-orange-400'>{mesMaxGastos.mes}</p>
              <p className='text-xl font-bold text-orange-600 dark:text-orange-400'>{formatCOP(mesMaxGastos.obligaciones + mesMaxGastos.gastosPersonales)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparativas y Tendencias */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='card p-6 shadow-sm'>
          <h3 className='font-bold text-lg mb-4 text-gray-800 dark:text-slate-100'>🎯 Comparativa de Meses</h3>
          <div className='space-y-4'>
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm text-muted'>Meses con ahorro positivo</span>
                <span className='font-bold text-green-600 dark:text-green-400'>{mesesConAhorroPositivo} de {mesesTranscurridos}</span>
              </div>
              <div className='w-full bg-gray-200 dark:bg-slate-600 rounded-full h-3'>
                <div className='bg-green-500 h-3 rounded-full' style={{ width: `${mesesTranscurridos > 0 ? (mesesConAhorroPositivo / mesesTranscurridos) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm text-muted'>Meses con ahorro negativo</span>
                <span className='font-bold text-red-600 dark:text-red-400'>{mesesConAhorroNegativo} de {mesesTranscurridos}</span>
              </div>
              <div className='w-full bg-gray-200 dark:bg-slate-600 rounded-full h-3'>
                <div className='bg-red-500 h-3 rounded-full' style={{ width: `${mesesTranscurridos > 0 ? (mesesConAhorroNegativo / mesesTranscurridos) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div className='pt-3 border-t border-gray-200 dark:border-slate-600'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted'>Tendencia de ahorro</span>
                <span className={`font-bold text-lg ${tendenciaColor}`}>{tendencia}</span>
              </div>
              {mesesTranscurridos < 2 && (
                <p className='text-xs text-gray-500 dark:text-slate-500 mt-1'>Se necesitan al menos 2 meses para calcular tendencia</p>
              )}
            </div>
          </div>
        </div>

        <div className='card p-6 shadow-sm'>
          <h3 className='font-bold text-lg mb-4 text-gray-800 dark:text-slate-100'>🔮 Proyecciones</h3>
          <div className='space-y-4'>
            <div className='bg-purple-50 dark:bg-purple-950/40 p-4 rounded-lg border border-purple-200 dark:border-purple-800'>
              <p className='text-sm text-muted mb-2'>Proyección Ahorro Anual</p>
              <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>{formatCOP(proyeccionAhorroAnual)}</p>
              <p className='text-xs text-gray-500 dark:text-slate-500 mt-1'>Basado en {mesesTranscurridos} meses transcurridos</p>
            </div>
            <div className='bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800'>
              <p className='text-sm text-muted mb-2'>Variabilidad del Ahorro</p>
              <p className='text-xl font-bold text-indigo-600 dark:text-indigo-400'>{formatCOP(desviacionEstandar)}</p>
              <p className='text-xs text-gray-500 dark:text-slate-500 mt-1'>Desviación estándar mensual</p>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución Promedio Mensual */}
      <div className='bg-gray-50 dark:bg-slate-800/80 p-6 rounded-lg border border-gray-200 dark:border-slate-700'>
        <h3 className='font-bold text-xl mb-6 text-primary'>💰 Distribución Promedio Mensual</h3>
        <div className='space-y-4'>
          {categorias.map((categoria, idx) => {
            const porcentaje = promedioIngresoMensual > 0 ? ((categoria.valor / promedioIngresoMensual) * 100).toFixed(1) : '0.0';

            return (
              <div key={idx}>
                <div className='flex justify-between mb-2'>
                  <span className='font-semibold text-primary'>{categoria.nombre}</span>
                  <span className='text-primary'>
                    {formatCOP(categoria.valor)} ({porcentaje}%)
                  </span>
                </div>
                <div className='w-full bg-gray-200 dark:bg-slate-600 rounded-full h-6'>
                  <div className={`h-6 rounded-full transition-all ${categoria.color}`} style={{ width: `${Math.abs(porcentaje)}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráfico de evolución mensual */}
      <div className='card p-6 shadow-sm'>
        <h3 className='font-bold text-xl mb-4 text-primary'>📊 Evolución Mensual del Ahorro</h3>
        <p className='text-sm text-muted mb-4'>Mostrando {mesesTranscurridos} {mesesTranscurridos === 1 ? 'mes transcurrido' : 'meses transcurridos'} de 12</p>
        <div className='relative'>
          {/* Eje Y (valores) */}
          <div className='flex gap-2 h-64'>
            {datosReales.map((mes, idx) => {
              const maxAhorro = Math.max(...datosReales.map(m => Math.abs(m.ahorroEnCuenta)));
              const altura = maxAhorro > 0 ? (Math.abs(mes.ahorroEnCuenta) / maxAhorro) * 100 : 0;
              const esPositivo = mes.ahorroEnCuenta >= 0;

              return (
                <div key={idx} className='flex-1 flex flex-col justify-end items-center'>
                  <div className='relative w-full flex flex-col justify-end' style={{ height: '100%' }}>
                    {/* Línea de referencia cero */}
                    <div className='absolute bottom-0 w-full h-px bg-gray-400 dark:bg-slate-500'></div>
                    {/* Barra */}
                    <div
                      className={`w-full rounded-t transition-all ${esPositivo ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                      style={{ height: `${altura}%` }}
                      title={`${mes.mes}: ${formatCOP(mes.ahorroEnCuenta)}`}
                    ></div>
                  </div>
                  <p className='text-xs mt-2 text-gray-600 dark:text-slate-400 transform -rotate-45 origin-top-left'>{mes.mes.slice(0, 3)}</p>
                </div>
              );
            })}
            {/* Mostrar meses futuros en gris (sin datos) */}
            {mesesRestantes > 0 && Array.from({ length: mesesRestantes }).map((_, idx) => {
              const mesIdx = mesesTranscurridos + idx;
              return (
                <div key={`futuro-${idx}`} className='flex-1 flex flex-col justify-end items-center opacity-30'>
                  <div className='relative w-full flex flex-col justify-end' style={{ height: '100%' }}>
                    <div className='absolute bottom-0 w-full h-px bg-gray-400 dark:bg-slate-500'></div>
                    <div className='w-full h-2 rounded-t bg-gray-300 dark:bg-slate-600'></div>
                  </div>
                  <p className='text-xs mt-2 text-gray-400 transform -rotate-45 origin-top-left'>{datosResumen[mesIdx]?.mes.slice(0, 3) || ''}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className='mt-4 flex justify-center gap-6 text-sm'>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 bg-green-500 rounded'></div>
            <span className='text-muted'>Ahorro Positivo</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 bg-red-500 rounded'></div>
            <span className='text-muted'>Ahorro Negativo</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 bg-gray-300 dark:bg-slate-600 rounded'></div>
            <span className='text-gray-400 dark:text-slate-500'>Meses futuros</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import AnalisisPorCategorias from './AnalisisPorCategorias';
import EvolucionMensual from './graficos/EvolucionMensual';

export default function AnalisisAnual({ datosResumen, formatCOP, anioSeleccionado }) {
  // Determinar el año actual del sistema
  const fechaActual = new Date();
  const anioActual = fechaActual.getFullYear();
  const mesActualDelSistema = fechaActual.getMonth();

  // Calcular meses transcurridos según el año que se está visualizando
  let mesesTranscurridos;
  let datosReales;

  if (anioSeleccionado < anioActual) {
    // Año pasado: mostrar todos los 12 meses
    mesesTranscurridos = 12;
    datosReales = datosResumen;
  } else if (anioSeleccionado === anioActual) {
    // Año actual: mostrar solo los meses transcurridos
    mesesTranscurridos = mesActualDelSistema + 1;
    datosReales = datosResumen.slice(0, mesesTranscurridos);
  } else {
    // Año futuro: no mostrar datos (o mostrar solo lo que hay)
    mesesTranscurridos = 0;
    datosReales = [];
  }

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
    tendenciaColor = tendencia === 'Creciente' ? 'text-green-600' :
                     tendencia === 'Decreciente' ? 'text-red-600' : 'text-gray-600';
  }

  const categorias = [
    {
      nombre: 'Obligaciones',
      valor: mesesTranscurridos > 0 ? totalObligaciones / mesesTranscurridos : 0,
      color: 'bg-red-500',
    },
    {
      nombre: 'Gastos Personales',
      valor: mesesTranscurridos > 0 ? totalGastosPersonales / mesesTranscurridos : 0,
      color: 'bg-orange-500',
    },
    {
      nombre: 'Ahorro',
      valor: mesesTranscurridos > 0 ? totalAhorrado / mesesTranscurridos : 0,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Indicador de meses transcurridos */}
      <div className='bg-blue-50 border border-blue-200 p-4 rounded-lg'>
        <p className='text-sm text-gray-700'>
          📅 <span className='font-semibold'>Análisis basado en {mesesTranscurridos} {mesesTranscurridos === 1 ? 'mes transcurrido' : 'meses transcurridos'}</span> de 12
          {mesesRestantes > 0 && <span className='text-gray-500'> ({mesesRestantes} {mesesRestantes === 1 ? 'mes restante' : 'meses restantes'})</span>}
        </p>
      </div>

      {/* Tarjetas de totales anuales */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-blue-600 text-white p-6 rounded-lg shadow-lg'>
          <h3 className='text-sm font-medium mb-2 opacity-90'>Total Ingresos ({mesesTranscurridos} meses)</h3>
          <p className='text-3xl font-bold'>{formatCOP(totalIngresoAnual)}</p>
          <p className='text-xs mt-2 opacity-75'>Promedio: {formatCOP(promedioIngresoMensual)}/mes</p>
        </div>
        <div className='bg-red-600 text-white p-6 rounded-lg shadow-lg'>
          <h3 className='text-sm font-medium mb-2 opacity-90'>Total Obligaciones</h3>
          <p className='text-3xl font-bold'>{formatCOP(totalObligaciones)}</p>
          <p className='text-xs mt-2 opacity-75'>{ratioObligaciones}% del ingreso</p>
        </div>
        <div className='bg-orange-600 text-white p-6 rounded-lg shadow-lg'>
          <h3 className='text-sm font-medium mb-2 opacity-90'>Total Gastos Personales</h3>
          <p className='text-3xl font-bold'>{formatCOP(totalGastosPersonales)}</p>
          <p className='text-xs mt-2 opacity-75'>{ratioGastosPersonales}% del ingreso</p>
        </div>
        <div className='bg-green-600 text-white p-6 rounded-lg shadow-lg'>
          <h3 className='text-sm font-medium mb-2 opacity-90'>Total Ahorrado</h3>
          <p className='text-3xl font-bold'>{formatCOP(totalAhorrado)}</p>
          <p className='text-xs mt-2 opacity-75'>Tasa: {tasaAhorroPromedio}%</p>
        </div>
      </div>

      {/* Ratios Financieros */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200'>
        <h3 className='font-bold text-xl mb-4 text-gray-800'>📊 Ratios Financieros</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-white p-4 rounded-lg shadow-sm'>
            <p className='text-sm text-gray-600 mb-1'>Tasa de Ahorro</p>
            <p className='text-2xl font-bold text-green-600'>{tasaAhorroPromedio}%</p>
            <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
              <div className='bg-green-500 h-2 rounded-full' style={{ width: `${tasaAhorroPromedio}%` }}></div>
            </div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-sm'>
            <p className='text-sm text-gray-600 mb-1'>Ratio Obligaciones</p>
            <p className='text-2xl font-bold text-red-600'>{ratioObligaciones}%</p>
            <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
              <div className='bg-red-500 h-2 rounded-full' style={{ width: `${ratioObligaciones}%` }}></div>
            </div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-sm'>
            <p className='text-sm text-gray-600 mb-1'>Ratio Gastos Personales</p>
            <p className='text-2xl font-bold text-orange-600'>{ratioGastosPersonales}%</p>
            <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
              <div className='bg-orange-500 h-2 rounded-full' style={{ width: `${ratioGastosPersonales}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis de Tendencias */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
          <h3 className='font-bold text-lg mb-4 text-gray-800'>📈 Mejor Desempeño</h3>
          <div className='space-y-3'>
            <div className='bg-green-50 p-3 rounded-lg border border-green-200'>
              <p className='text-sm text-gray-600'>Mejor mes de ahorro</p>
              <p className='text-lg font-bold text-green-700'>{mejorMesAhorro.mes}</p>
              <p className='text-xl font-bold text-green-600'>{formatCOP(mejorMesAhorro.ahorroEnCuenta)}</p>
            </div>
            <div className='bg-blue-50 p-3 rounded-lg border border-blue-200'>
              <p className='text-sm text-gray-600'>Mes más austero</p>
              <p className='text-lg font-bold text-blue-700'>{mesMinGastos.mes}</p>
              <p className='text-xl font-bold text-blue-600'>{formatCOP(mesMinGastos.obligaciones + mesMinGastos.gastosPersonales)}</p>
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
          <h3 className='font-bold text-lg mb-4 text-gray-800'>📉 Áreas de Mejora</h3>
          <div className='space-y-3'>
            <div className='bg-red-50 p-3 rounded-lg border border-red-200'>
              <p className='text-sm text-gray-600'>Peor mes de ahorro</p>
              <p className='text-lg font-bold text-red-700'>{peorMesAhorro.mes}</p>
              <p className='text-xl font-bold text-red-600'>{formatCOP(peorMesAhorro.ahorroEnCuenta)}</p>
            </div>
            <div className='bg-orange-50 p-3 rounded-lg border border-orange-200'>
              <p className='text-sm text-gray-600'>Mes más gastador</p>
              <p className='text-lg font-bold text-orange-700'>{mesMaxGastos.mes}</p>
              <p className='text-xl font-bold text-orange-600'>{formatCOP(mesMaxGastos.obligaciones + mesMaxGastos.gastosPersonales)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparativas y Tendencias */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
          <h3 className='font-bold text-lg mb-4 text-gray-800'>🎯 Comparativa de Meses</h3>
          <div className='space-y-4'>
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm text-gray-600'>Meses con ahorro positivo</span>
                <span className='font-bold text-green-600'>{mesesConAhorroPositivo} de {mesesTranscurridos}</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-3'>
                <div className='bg-green-500 h-3 rounded-full' style={{ width: `${mesesTranscurridos > 0 ? (mesesConAhorroPositivo / mesesTranscurridos) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm text-gray-600'>Meses con ahorro negativo</span>
                <span className='font-bold text-red-600'>{mesesConAhorroNegativo} de {mesesTranscurridos}</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-3'>
                <div className='bg-red-500 h-3 rounded-full' style={{ width: `${mesesTranscurridos > 0 ? (mesesConAhorroNegativo / mesesTranscurridos) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div className='pt-3 border-t border-gray-200'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>Tendencia de ahorro</span>
                <span className={`font-bold text-lg ${tendenciaColor}`}>{tendencia}</span>
              </div>
              {mesesTranscurridos < 2 && (
                <p className='text-xs text-gray-500 mt-1'>Se necesitan al menos 2 meses para calcular tendencia</p>
              )}
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
          <h3 className='font-bold text-lg mb-4 text-gray-800'>🔮 Proyecciones</h3>
          <div className='space-y-4'>
            <div className='bg-purple-50 p-4 rounded-lg border border-purple-200'>
              <p className='text-sm text-gray-600 mb-2'>Proyección Ahorro Anual</p>
              <p className='text-2xl font-bold text-purple-600'>{formatCOP(proyeccionAhorroAnual)}</p>
              <p className='text-xs text-gray-500 mt-1'>Basado en {mesesTranscurridos} meses transcurridos</p>
            </div>
            <div className='bg-indigo-50 p-4 rounded-lg border border-indigo-200'>
              <p className='text-sm text-gray-600 mb-2'>Variabilidad del Ahorro</p>
              <p className='text-xl font-bold text-indigo-600'>{formatCOP(desviacionEstandar)}</p>
              <p className='text-xs text-gray-500 mt-1'>Desviación estándar mensual</p>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución Promedio Mensual */}
      <div className='bg-gray-50 p-6 rounded-lg border border-gray-200'>
        <h3 className='font-bold text-xl mb-6 text-black'>💰 Distribución Promedio Mensual</h3>
        <div className='space-y-4'>
          {categorias.map((categoria, idx) => {
            const porcentaje = promedioIngresoMensual > 0 ? ((categoria.valor / promedioIngresoMensual) * 100).toFixed(1) : '0.0';

            return (
              <div key={idx}>
                <div className='flex justify-between mb-2'>
                  <span className='font-semibold text-black'>{categoria.nombre}</span>
                  <span className='text-black'>
                    {formatCOP(categoria.valor)} ({porcentaje}%)
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-6'>
                  <div className={`h-6 rounded-full transition-all ${categoria.color}`} style={{ width: `${Math.abs(porcentaje)}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráfico de evolución mensual - Recharts */}
      <EvolucionMensual datosResumen={datosReales} formatCOP={formatCOP} mesesTranscurridos={mesesTranscurridos} />

      {/* Análisis por Categorías */}
      <AnalisisPorCategorias datosResumen={datosReales} formatCOP={formatCOP} />
    </div>
  );
}

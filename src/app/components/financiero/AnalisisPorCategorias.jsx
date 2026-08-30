import { obtenerInfoCategoria } from '@/constants/categorias';
import DistribucionCategorias from './graficos/DistribucionCategorias';

const TOP3_CARD_STYLES = [
  'bg-yellow-100 border-yellow-300 dark:bg-yellow-950/40 dark:border-yellow-600/50',
  'bg-gray-100 border-gray-300 dark:bg-slate-800/80 dark:border-slate-600',
  'bg-orange-100 border-orange-300 dark:bg-orange-950/40 dark:border-orange-600/50',
];

export default function AnalisisPorCategorias({ datosResumen, formatCOP }) {
  const calcularTotalesPorCategoria = () => {
    const totales = {};

    datosResumen.forEach((mes) => {
      ['quincena1', 'quincena2'].forEach((quincena) => {
        const datosQuincena = mes.datosQuincenales?.[quincena];
        if (!datosQuincena) return;

        datosQuincena.obligaciones?.forEach((item) => {
          const categoria = item.categoria || 'otros';
          if (!totales[categoria]) {
            totales[categoria] = {
              nombre: categoria,
              tipo: 'obligaciones',
              total: 0,
              items: [],
            };
          }
          totales[categoria].total += item.monto || 0;
          totales[categoria].items.push({
            concepto: item.concepto,
            monto: item.monto,
            mes: mes.mes,
            quincena,
          });
        });

        datosQuincena.gastosPersonales?.forEach((item) => {
          const categoria = item.categoria || 'otros';
          if (!totales[categoria]) {
            totales[categoria] = {
              nombre: categoria,
              tipo: 'gastosPersonales',
              total: 0,
              items: [],
            };
          }
          totales[categoria].total += item.monto || 0;
          totales[categoria].items.push({
            concepto: item.concepto,
            monto: item.monto,
            mes: mes.mes,
            quincena,
          });
        });
      });
    });

    return totales;
  };

  const totalesPorCategoria = calcularTotalesPorCategoria();

  const categoriasOrdenadas = Object.entries(totalesPorCategoria)
    .map(([key, data]) => ({
      key,
      ...data,
      info: obtenerInfoCategoria(data.tipo, key),
    }))
    .sort((a, b) => b.total - a.total);

  const totalGeneral = categoriasOrdenadas.reduce((sum, cat) => sum + cat.total, 0);
  const top3 = categoriasOrdenadas.slice(0, 3);

  if (categoriasOrdenadas.length === 0) {
    return (
      <div className='bg-gray-50 dark:bg-slate-800/80 p-6 rounded-lg border border-gray-200 dark:border-slate-600'>
        <h3 className='font-bold text-xl mb-4 text-primary'>📊 Análisis por Categorías</h3>
        <p className='text-muted'>No hay datos de gastos categorizados aún.</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/30 p-6 rounded-lg border border-purple-200 dark:border-purple-700/40'>
        <h3 className='font-bold text-xl mb-4 text-primary'>📊 Análisis por Categorías</h3>
        <p className='text-sm text-muted'>
          Analiza cómo se distribuyen tus gastos por categoría y descubre dónde puedes optimizar.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {top3.map((cat, idx) => {
          const porcentaje = totalGeneral > 0 ? ((cat.total / totalGeneral) * 100).toFixed(1) : 0;
          const medallas = ['🥇', '🥈', '🥉'];

          return (
            <div key={cat.key} className={`${TOP3_CARD_STYLES[idx]} border-2 p-4 rounded-lg`}>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-2xl'>{medallas[idx]}</span>
                <span className='text-lg font-bold text-primary'>Top {idx + 1}</span>
              </div>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-2xl'>{cat.info.icono}</span>
                <span className='font-semibold text-primary'>{cat.info.nombre}</span>
              </div>
              <p className='text-2xl font-bold text-primary mb-1'>{formatCOP(cat.total)}</p>
              <p className='text-sm text-muted'>{porcentaje}% del total</p>
              <p className='text-xs text-muted mt-1 opacity-80'>{cat.items.length} transacciones</p>
            </div>
          );
        })}
      </div>

      <DistribucionCategorias datosResumen={datosResumen} formatCOP={formatCOP} />

      <div className='card p-6'>
        <h4 className='font-bold text-lg mb-4 text-primary'>💰 Distribución Completa</h4>
        <div className='space-y-3'>
          {categoriasOrdenadas.map((cat) => {
            const porcentaje = totalGeneral > 0 ? ((cat.total / totalGeneral) * 100).toFixed(1) : 0;

            return (
              <div key={cat.key} className='border-b border-gray-100 dark:border-slate-700 pb-3 last:border-b-0'>
                <div className='flex justify-between items-center mb-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-xl'>{cat.info.icono}</span>
                    <span className='font-semibold text-primary'>{cat.info.nombre}</span>
                    <span className='text-xs text-muted'>({cat.items.length})</span>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold text-primary'>{formatCOP(cat.total)}</p>
                    <p className='text-xs text-muted'>{porcentaje}%</p>
                  </div>
                </div>
                <div className='w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3'>
                  <div
                    className='h-3 rounded-full transition-all'
                    style={{
                      width: `${porcentaje}%`,
                      backgroundColor: cat.info.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className='mt-4 pt-4 border-t-2 border-gray-300 dark:border-slate-600'>
          <div className='flex justify-between items-center'>
            <span className='font-bold text-lg text-primary'>Total General</span>
            <span className='font-bold text-xl text-primary'>{formatCOP(totalGeneral)}</span>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-blue-50 dark:bg-blue-950/35 p-4 rounded-lg border border-blue-200 dark:border-blue-700/40'>
          <h4 className='font-bold text-md mb-2 text-primary flex items-center gap-2'>
            💡 Insight Principal
          </h4>
          {top3.length > 0 && (
            <p className='text-sm text-muted'>
              Tu mayor gasto es en <span className='font-bold text-primary'>{top3[0].info.icono} {top3[0].info.nombre}</span> con{' '}
              <span className='font-bold text-primary'>{formatCOP(top3[0].total)}</span>, representando el{' '}
              <span className='font-bold text-primary'>{((top3[0].total / totalGeneral) * 100).toFixed(1)}%</span> del total.
            </p>
          )}
        </div>

        <div className='bg-green-50 dark:bg-emerald-950/35 p-4 rounded-lg border border-green-200 dark:border-emerald-700/40'>
          <h4 className='font-bold text-md mb-2 text-primary flex items-center gap-2'>
            ✅ Oportunidad de Ahorro
          </h4>
          {top3.length > 0 && (
            <p className='text-sm text-muted'>
              Reduciendo un 10% en <span className='font-bold text-primary'>{top3[0].info.nombre}</span>, podrías ahorrar{' '}
              <span className='font-bold text-emerald-600 dark:text-emerald-400'>{formatCOP(top3[0].total * 0.1)}</span> adicionales.
            </p>
          )}
        </div>
      </div>

      <div className='card p-6'>
        <h4 className='font-bold text-lg mb-4 text-primary'>📅 Promedio Mensual por Categoría</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
          {categoriasOrdenadas.slice(0, 6).map((cat) => {
            const mesesUnicos = new Set(cat.items.map((item) => item.mes)).size;
            const promedioMensual = mesesUnicos > 0 ? cat.total / mesesUnicos : cat.total;

            return (
              <div key={cat.key} className='bg-gray-50 dark:bg-slate-800/60 p-3 rounded-lg border border-gray-200 dark:border-slate-600'>
                <div className='flex items-center gap-2 mb-1'>
                  <span>{cat.info.icono}</span>
                  <span className='font-semibold text-sm text-primary'>{cat.info.nombre}</span>
                </div>
                <p className='text-lg font-bold text-primary'>{formatCOP(promedioMensual)}</p>
                <p className='text-xs text-muted'>Promedio/mes ({mesesUnicos} meses)</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

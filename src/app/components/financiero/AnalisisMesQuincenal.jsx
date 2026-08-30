import { obtenerInfoCategoria } from '@/constants/categorias';
import { TrendingDown, TrendingUp, Award, AlertCircle, Lightbulb } from 'lucide-react';

const sumItems = (items) => (items ?? []).reduce((sum, item) => sum + (item.monto || 0), 0);

const SECCION_LABEL = {
  obligaciones: 'Obligación',
  gastosPersonales: 'Gasto personal',
};

const calcularAnalisis = (datosQuincenales, datosResumen, mesSeleccionado) => {
  const q1 = datosQuincenales.quincena1;
  const q2 = datosQuincenales.quincena2;

  const ingresoQ1 = q1.ingreso || 0;
  const ingresoQ2 = q2.ingreso || 0;
  const obligQ1 = sumItems(q1.obligaciones);
  const obligQ2 = sumItems(q2.obligaciones);
  const gastosQ1 = sumItems(q1.gastosPersonales);
  const gastosQ2 = sumItems(q2.gastosPersonales);

  const ingresoTotal = ingresoQ1 + ingresoQ2;
  const obligaciones = obligQ1 + obligQ2;
  const gastosPersonales = gastosQ1 + gastosQ2;
  const gastosTotal = obligaciones + gastosPersonales;
  const ahorro = ingresoTotal - gastosTotal;
  const porcentajeAhorro = ingresoTotal > 0 ? ((ahorro / ingresoTotal) * 100).toFixed(1) : '0.0';
  const pctObligaciones = gastosTotal > 0 ? ((obligaciones / gastosTotal) * 100).toFixed(0) : 0;
  const pctPersonales = gastosTotal > 0 ? ((gastosPersonales / gastosTotal) * 100).toFixed(0) : 0;

  const movimientos = [];
  const categorias = {};

  for (const [quincenaKey, quincenaLabel] of [
    ['quincena1', 'Q1'],
    ['quincena2', 'Q2'],
  ]) {
    const quincena = datosQuincenales[quincenaKey];
    for (const seccion of ['obligaciones', 'gastosPersonales']) {
      for (const item of quincena[seccion] ?? []) {
        if (!item.monto) continue;
        movimientos.push({
          concepto: item.concepto,
          monto: item.monto,
          seccion,
          quincena: quincenaLabel,
          categoria: item.categoria || 'otros',
        });
        const catKey = `${seccion}|${item.categoria || 'otros'}`;
        if (!categorias[catKey]) {
          categorias[catKey] = { seccion, categoria: item.categoria || 'otros', total: 0, count: 0 };
        }
        categorias[catKey].total += item.monto;
        categorias[catKey].count += 1;
      }
    }
  }

  const topCategorias = Object.values(categorias).sort((a, b) => b.total - a.total).slice(0, 3);
  const topGastos = [...movimientos].sort((a, b) => b.monto - a.monto).slice(0, 5);

  const gastoQ1 = obligQ1 + gastosQ1;
  const gastoQ2 = obligQ2 + gastosQ2;
  const ahorroQ1 = ingresoQ1 - gastoQ1;
  const ahorroQ2 = ingresoQ2 - gastoQ2;

  const quincenaMasGasto =
    gastoQ1 === gastoQ2 ? null : gastoQ1 > gastoQ2 ? { label: 'Quincena 1', monto: gastoQ1, diff: gastoQ1 - gastoQ2 } : { label: 'Quincena 2', monto: gastoQ2, diff: gastoQ2 - gastoQ1 };

  const quincenaMejorAhorro =
    ahorroQ1 === ahorroQ2 ? null : ahorroQ1 > ahorroQ2 ? { label: 'Quincena 1', ahorro: ahorroQ1 } : { label: 'Quincena 2', ahorro: ahorroQ2 };

  const mayorGasto = topGastos[0] ?? null;
  const promedioMovimiento = movimientos.length > 0 ? gastosTotal / movimientos.length : 0;

  // Comparación con mes anterior
  let comparacionMesAnterior = null;
  if (datosResumen && mesSeleccionado > 0) {
    const mesAnterior = datosResumen[mesSeleccionado - 1];
    const gastoAnterior = (mesAnterior?.obligaciones ?? 0) + (mesAnterior?.gastosPersonales ?? 0);
    const ahorroAnterior = mesAnterior?.ahorroEnCuenta ?? 0;
    if (gastoAnterior > 0) {
      const diffGasto = gastosTotal - gastoAnterior;
      const pctDiff = ((diffGasto / gastoAnterior) * 100).toFixed(0);
      comparacionMesAnterior = {
        mes: mesAnterior.mes,
        gastoAnterior,
        diffGasto,
        pctDiff,
        ahorroAnterior,
        diffAhorro: ahorro - ahorroAnterior,
        gasteMas: diffGasto > 0,
      };
    }
  }

  const insights = [];

  if (mayorGasto) {
    const pct = gastosTotal > 0 ? ((mayorGasto.monto / gastosTotal) * 100).toFixed(0) : 0;
    insights.push({
      icon: Award,
      tone: 'amber',
      tipo: 'mayorGasto',
      titulo: 'Mayor gasto del mes',
      concepto: mayorGasto.concepto,
      monto: mayorGasto.monto,
      pct,
      detalle: `${SECCION_LABEL[mayorGasto.seccion]} · ${mayorGasto.quincena}`,
    });
  }

  if (topCategorias[0]) {
    const cat = topCategorias[0];
    const info = obtenerInfoCategoria(cat.seccion, cat.categoria);
    const pct = gastosTotal > 0 ? ((cat.total / gastosTotal) * 100).toFixed(0) : 0;
    insights.push({
      icon: TrendingUp,
      tone: 'violet',
      tipo: 'categoria',
      titulo: 'Categoría dominante',
      nombre: `${info.icono} ${info.nombre}`,
      monto: cat.total,
      pct,
      detalle: `${cat.count} movimiento${cat.count !== 1 ? 's' : ''}`,
    });
  }

  if (quincenaMasGasto) {
    insights.push({
      icon: AlertCircle,
      tone: 'rose',
      tipo: 'quincenaCostosa',
      titulo: 'Quincena más costosa',
      label: quincenaMasGasto.label,
      monto: quincenaMasGasto.monto,
      diff: quincenaMasGasto.diff,
    });
  }

  if (quincenaMejorAhorro && ahorroQ1 >= 0 && ahorroQ2 >= 0) {
    insights.push({
      icon: TrendingDown,
      tone: 'emerald',
      tipo: 'mejorQuincena',
      titulo: 'Mejor quincena',
      label: quincenaMejorAhorro.label,
      monto: quincenaMejorAhorro.ahorro,
      detalle: 'Mayor margen entre ingreso y gastos',
    });
  }

  if (comparacionMesAnterior) {
    insights.push({
      icon: Lightbulb,
      tone: comparacionMesAnterior.gasteMas ? 'rose' : 'emerald',
      tipo: 'vsAnterior',
      titulo: `Vs. ${comparacionMesAnterior.mes}`,
      gasteMas: comparacionMesAnterior.gasteMas,
      monto: Math.abs(comparacionMesAnterior.diffGasto),
      pct: Math.abs(comparacionMesAnterior.pctDiff),
      diffAhorro: comparacionMesAnterior.diffAhorro,
    });
  }

  if (movimientos.length > 0) {
    insights.push({
      icon: Lightbulb,
      tone: 'indigo',
      tipo: 'promedio',
      titulo: 'Promedio por movimiento',
      monto: promedioMovimiento,
      count: movimientos.length,
      detalle: `${pctObligaciones}% obligaciones · ${pctPersonales}% personales`,
    });
  }

  return {
    ingresoTotal,
    obligaciones,
    gastosPersonales,
    gastosTotal,
    ahorro,
    porcentajeAhorro,
    pctObligaciones,
    pctPersonales,
    quincenas: {
      q1: { ingreso: ingresoQ1, obligaciones: obligQ1, gastos: gastosQ1, ahorro: ahorroQ1, gastoTotal: gastoQ1 },
      q2: { ingreso: ingresoQ2, obligaciones: obligQ2, gastos: gastosQ2, ahorro: ahorroQ2, gastoTotal: gastoQ2 },
    },
    topCategorias,
    topGastos,
    mayorGasto,
    promedioMovimiento,
    quincenaMasGasto,
    quincenaMejorAhorro,
    comparacionMesAnterior,
    insights,
    numItems: movimientos.length,
  };
};

function StatMini({ label, value, tone = 'default' }) {
  const tones = {
    default: 'text-primary',
    income: 'text-indigo-600 dark:text-indigo-300',
    expense: 'text-rose-500 dark:text-rose-400',
    personal: 'text-amber-600 dark:text-amber-400',
    savings: 'text-emerald-600 dark:text-emerald-400',
    savingsBad: 'text-rose-500 dark:text-rose-400',
  };

  return (
    <div className='rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2.5'>
      <p className='text-[10px] uppercase tracking-wider text-muted font-semibold mb-0.5'>{label}</p>
      <p className={`text-base sm:text-lg font-bold tabular-nums ${tones[tone]}`}>{value}</p>
    </div>
  );
}

const INSIGHT_TONES = {
  amber: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-700/40 text-amber-900 dark:text-amber-100',
  violet: 'bg-violet-50 dark:bg-violet-950/30 border-violet-200/60 dark:border-violet-700/40 text-violet-900 dark:text-violet-100',
  rose: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-700/40 text-rose-900 dark:text-rose-100',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-700/40 text-emerald-900 dark:text-emerald-100',
  indigo: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200/60 dark:border-indigo-700/40 text-indigo-900 dark:text-indigo-100',
};

function InsightCard({ icon: Icon, tone, tipo, titulo, formatCOP, ...data }) {
  let cuerpo = '';
  let detalleFinal = data.detalle ?? '';

  switch (tipo) {
    case 'mayorGasto':
      cuerpo = `${data.concepto} — ${formatCOP(data.monto)} (${data.pct}% del total)`;
      break;
    case 'categoria':
      cuerpo = `${data.nombre} — ${formatCOP(data.monto)} (${data.pct}% del gasto)`;
      break;
    case 'quincenaCostosa':
      cuerpo = `${data.label} · ${formatCOP(data.monto)}`;
      detalleFinal = `${formatCOP(data.diff)} más que la otra quincena`;
      break;
    case 'mejorQuincena':
      cuerpo = `${data.label} · ${formatCOP(data.monto)} ahorrados`;
      break;
    case 'vsAnterior':
      cuerpo = data.gasteMas
        ? `Gastaste ${formatCOP(data.monto)} más (${data.pct}%)`
        : `Gastaste ${formatCOP(data.monto)} menos (${data.pct}%)`;
      detalleFinal = data.diffAhorro >= 0
        ? `Ahorro +${formatCOP(data.diffAhorro)} vs mes anterior`
        : `Ahorro ${formatCOP(data.diffAhorro)} vs mes anterior`;
      break;
    case 'promedio':
      cuerpo = `${formatCOP(data.monto)} en ${data.count} registros`;
      break;
    default:
      cuerpo = data.texto ?? '';
  }

  return (
    <div className={`rounded-xl border p-3 ${INSIGHT_TONES[tone]}`}>
      <div className='flex items-start gap-2.5'>
        <Icon size={18} className='shrink-0 mt-0.5 opacity-70' />
        <div className='min-w-0'>
          <p className='text-[10px] uppercase tracking-wider font-bold opacity-60 mb-0.5'>{titulo}</p>
          <p className='text-sm font-semibold leading-snug'>{cuerpo}</p>
          {detalleFinal && <p className='text-xs opacity-60 mt-0.5'>{detalleFinal}</p>}
        </div>
      </div>
    </div>
  );
}

export default function AnalisisMesQuincenal({
  mesNombre,
  mesSeleccionado,
  datosQuincenales,
  datosResumen,
  formatCOP,
}) {
  if (!datosQuincenales) return null;

  const stats = calcularAnalisis(datosQuincenales, datosResumen, mesSeleccionado);
  const ahorroTone = stats.ahorro >= 0 ? 'savings' : 'savingsBad';

  return (
    <div className='mt-8 rounded-2xl border border-indigo-200/60 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50/80 to-violet-50/50 dark:from-indigo-950/30 dark:to-violet-950/20 p-4 sm:p-5'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4'>
        <div>
          <h3 className='font-display font-bold text-primary text-lg'>Análisis de {mesNombre}</h3>
          <p className='text-xs text-muted'>{stats.numItems} movimientos registrados</p>
        </div>
        <div className={`text-right ${stats.ahorro >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
          <p className='text-xs uppercase tracking-wide font-semibold opacity-70'>Ahorro del mes</p>
          <p className='text-2xl font-bold tabular-nums'>{formatCOP(stats.ahorro)}</p>
          <p className='text-sm font-semibold'>{stats.porcentajeAhorro}% del ingreso</p>
        </div>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4'>
        <StatMini label='Ingreso' value={formatCOP(stats.ingresoTotal)} tone='income' />
        <StatMini label='Obligaciones' value={formatCOP(stats.obligaciones)} tone='expense' />
        <StatMini label='Gastos personales' value={formatCOP(stats.gastosPersonales)} tone='personal' />
        <StatMini label='Total gastado' value={formatCOP(stats.gastosTotal)} tone='expense' />
        <StatMini label='Balance' value={formatCOP(stats.ahorro)} tone={ahorroTone} />
      </div>

      {stats.insights.length > 0 && (
        <div className='mb-4'>
          <p className='text-xs uppercase tracking-wider text-muted font-semibold mb-2'>Insights del mes</p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'>
            {stats.insights.map((insight, idx) => (
              <InsightCard key={idx} {...insight} formatCOP={formatCOP} />
            ))}
          </div>
        </div>
      )}

      {stats.topGastos.length > 0 && (
        <div className='mb-4 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-black/5 dark:border-white/10 p-3'>
          <p className='text-xs uppercase tracking-wider text-muted font-semibold mb-2'>Top 5 gastos del mes</p>
          <div className='space-y-1.5'>
            {stats.topGastos.map((gasto, idx) => {
              const pct = stats.gastosTotal > 0 ? ((gasto.monto / stats.gastosTotal) * 100).toFixed(0) : 0;
              const barWidth = stats.mayorGasto ? (gasto.monto / stats.mayorGasto.monto) * 100 : 0;
              return (
                <div key={`${gasto.concepto}-${idx}`} className='flex items-center gap-3'>
                  <span className='text-xs font-bold text-muted w-4 shrink-0'>{idx + 1}</span>
                  <div className='flex-1 min-w-0'>
                    <div className='flex justify-between items-baseline gap-2 mb-0.5'>
                      <span className='text-sm font-medium text-primary truncate' title={gasto.concepto}>
                        {gasto.concepto}
                      </span>
                      <span className='text-sm font-mono font-bold text-primary shrink-0'>{formatCOP(gasto.monto)}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='flex-1 h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden'>
                        <div
                          className='h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500'
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className='text-[10px] text-muted shrink-0 w-16 text-right'>
                        {pct}% · {gasto.quincena}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-4'>
        {[
          { label: 'Quincena 1', data: stats.quincenas.q1 },
          { label: 'Quincena 2', data: stats.quincenas.q2 },
        ].map(({ label, data }) => (
          <div key={label} className='rounded-xl bg-white/60 dark:bg-slate-900/40 border border-black/5 dark:border-white/10 px-3 py-2.5'>
            <p className='text-xs font-bold text-primary mb-2'>{label}</p>
            <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-xs'>
              <span className='text-muted'>Ingreso</span>
              <span className='text-right font-mono text-primary'>{formatCOP(data.ingreso)}</span>
              <span className='text-muted'>Obligaciones</span>
              <span className='text-right font-mono text-rose-500'>{formatCOP(data.obligaciones)}</span>
              <span className='text-muted'>Gastos pers.</span>
              <span className='text-right font-mono text-amber-600 dark:text-amber-400'>{formatCOP(data.gastos)}</span>
              <span className='text-muted font-semibold'>Ahorro Q</span>
              <span className={`text-right font-mono font-bold ${data.ahorro >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {formatCOP(data.ahorro)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {stats.topCategorias.length > 0 && (
        <div>
          <p className='text-xs uppercase tracking-wider text-muted font-semibold mb-2'>Distribución por categoría</p>
          <div className='flex flex-wrap gap-2'>
            {stats.topCategorias.map((cat) => {
              const info = obtenerInfoCategoria(cat.seccion, cat.categoria);
              const pct = stats.gastosTotal > 0 ? ((cat.total / stats.gastosTotal) * 100).toFixed(0) : 0;
              return (
                <span
                  key={`${cat.seccion}-${cat.categoria}`}
                  className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/70 dark:bg-slate-800/80 border border-black/5 dark:border-white/10 text-primary'
                >
                  <span>{info.icono}</span>
                  <span>{info.nombre}</span>
                  <span className='text-muted'>·</span>
                  <span className='font-mono'>{formatCOP(cat.total)}</span>
                  <span className='text-muted'>({pct}%)</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

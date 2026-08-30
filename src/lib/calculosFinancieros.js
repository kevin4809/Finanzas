/** Convierte tasa efectiva anual (%) a tasa mensual efectiva (decimal) */
export function tasaEfectivaAnualAMensual(ea) {
  return Math.pow(1 + ea / 100, 1 / 12) - 1;
}

/** Cuota mensual — amortización francés */
export function calcularCuotaCredito(monto, tasaEA, plazoMeses) {
  if (!monto || monto <= 0 || !plazoMeses || plazoMeses <= 0) return 0;
  const r = tasaEfectivaAnualAMensual(tasaEA);
  if (r === 0) return monto / plazoMeses;
  const factor = Math.pow(1 + r, plazoMeses);
  return (monto * r * factor) / (factor - 1);
}

/** Valor futuro con capitalización mensual */
export function proyeccionInversion(capital, tasaEA, meses) {
  if (!capital || capital <= 0 || !meses || meses <= 0) return capital || 0;
  const r = tasaEfectivaAnualAMensual(tasaEA);
  return capital * Math.pow(1 + r, meses);
}

export function parseTasaPorcentaje(valor) {
  if (typeof valor === 'number') return valor;
  return parseFloat(String(valor).replace('%', '').replace(',', '.').trim()) || 0;
}

/** Perfil financiero a partir del resumen mensual del usuario */
export function calcularPerfilUsuario(datosResumen) {
  const mesActual = new Date().getMonth();
  const datos = datosResumen.slice(0, mesActual + 1);
  const n = datos.length || 1;

  const promedioIngreso = datos.reduce((s, m) => s + m.ingresoTotal, 0) / n;
  const promedioObligaciones = datos.reduce((s, m) => s + m.obligaciones, 0) / n;
  const promedioGastosPersonales = datos.reduce((s, m) => s + m.gastosPersonales, 0) / n;
  const promedioGastosTotal = promedioObligaciones + promedioGastosPersonales;
  const promedioAhorro = datos.reduce((s, m) => s + m.ahorroEnCuenta, 0) / n;
  const ahorroAcumulado = datos.reduce((s, m) => s + Math.max(0, m.ahorroEnCuenta), 0);
  const tasaAhorroPromedio = promedioIngreso > 0 ? (promedioAhorro / promedioIngreso) * 100 : 0;

  return {
    promedioIngreso,
    promedioObligaciones,
    promedioGastosPersonales,
    promedioGastosTotal,
    promedioAhorro,
    ahorroAcumulado,
    tasaAhorroPromedio,
    mesesAnalizados: n,
  };
}

/** Evalúa si un crédito es viable según ingresos y gastos promedio */
export function evaluarViabilidadCredito({ cuotaMensual, perfil, bufferPorcentaje = 0.1 }) {
  const balance = perfil.promedioIngreso - perfil.promedioGastosTotal - cuotaMensual;
  const bufferMinimo = perfil.promedioIngreso * bufferPorcentaje;
  const viable = balance >= bufferMinimo;
  const margenSeguridad = perfil.promedioIngreso > 0 ? (balance / perfil.promedioIngreso) * 100 : 0;
  const cuotaSobreIngreso = perfil.promedioIngreso > 0 ? (cuotaMensual / perfil.promedioIngreso) * 100 : 0;
  const gastosTotalesConCredito = perfil.promedioGastosTotal + cuotaMensual;

  return {
    balance,
    viable,
    margenSeguridad,
    cuotaSobreIngreso,
    bufferMinimo,
    gastosTotalesConCredito,
    nivel: viable
      ? cuotaSobreIngreso <= 30
        ? 'comodo'
        : 'ajustado'
      : 'no_viable',
  };
}

/** Sugerencias educativas basadas en tasas reales — no es asesoría financiera */
export function generarSugerenciasInversion({ capital, indicadores, perfil }) {
  const sugerencias = [];
  const inflacion = indicadores.inflacion?.valor ?? 0;
  const tasaDeposito = indicadores.tasaDeposito?.valor ?? 0;
  const tpm = indicadores.tpm?.valor ?? 0;
  const ibcConsumo = indicadores.tasasCredito?.find((t) => t.modalidad === 'CONSUMO Y ORDINARIO')?.tasa ?? 0;
  const ibcProductivo = indicadores.tasasCredito?.find((t) => t.modalidad === 'CREDITO PRODUCTIVO MAYOR MONTO')?.tasa ?? 0;

  const fondoEmergencia = perfil.promedioGastosTotal * 6;

  if (capital < fondoEmergencia && perfil.promedioGastosTotal > 0) {
    sugerencias.push({
      id: 'emergencia',
      prioridad: 'alta',
      titulo: 'Fondo de emergencia primero',
      descripcion: `Se recomienda tener 6 meses de gastos (~${Math.round(fondoEmergencia).toLocaleString('es-CO')} COP) antes de invertir agresivamente. Tu capital actual cubre ${fondoEmergencia > 0 ? ((capital / fondoEmergencia) * 100).toFixed(0) : 0}% del fondo ideal.`,
      color: 'section-orange',
    });
  }

  if (capital >= 500000 && tasaDeposito > 0) {
    const proyeccion12 = proyeccionInversion(capital, tasaDeposito, 12);
    const rendReal = tasaDeposito - inflacion;
    sugerencias.push({
      id: 'cdt',
      prioridad: capital >= fondoEmergencia ? 'media' : 'baja',
      titulo: 'CDT / Depósito a término (conservador)',
      tasaEA: tasaDeposito,
      proyeccion12m: proyeccion12,
      rendimientoReal: rendReal,
      descripcion: `Tasa referencia depósitos ${tasaDeposito.toFixed(2)}% EA (${indicadores.tasaDeposito?.fuente}). Rendimiento real estimado vs inflación: ${rendReal >= 0 ? '+' : ''}${rendReal.toFixed(1)} pp. Las tasas de CDT varían por banco y plazo.`,
      color: 'section-green',
      fuente: indicadores.tasaDeposito?.fuente,
    });
  }

  if (inflacion > 0) {
    sugerencias.push({
      id: 'inflacion',
      prioridad: 'media',
      titulo: 'Meta mínima: superar la inflación',
      tasaEA: inflacion,
      descripcion: `IPC anual Colombia ~${inflacion.toFixed(1)}% (${indicadores.inflacion?.fuente}). Cualquier inversión debe rendir por encima de esto para no perder poder adquisitivo.`,
      color: 'section-blue',
      fuente: indicadores.inflacion?.fuente,
    });
  }

  if (capital >= 1000000 && tpm > 0) {
    sugerencias.push({
      id: 'referencia-tpm',
      prioridad: 'baja',
      titulo: 'Referencia: tasa BanRep (TPM)',
      tasaEA: tpm,
      descripcion: `La TPM está en ${tpm}% EA (${indicadores.tpm?.fuente}). Los CDT y bonos de deuda pública suelen moverse en relación con esta tasa. Consulta opciones en tu banco.`,
      color: 'section-blue',
      fuente: indicadores.tpm?.fuente,
    });
  }

  if (ibcProductivo > 0 && ibcConsumo > 0) {
    sugerencias.push({
      id: 'costo-deuda',
      prioridad: 'media',
      titulo: 'Costo de endeudamiento vs inversión',
      descripcion: `Crédito consumo IBC: ${ibcConsumo.toFixed(2)}% EA · Productivo mayor monto: ${ibcProductivo.toFixed(2)}% EA (Superfinanciera). Si inviertes al ${tasaDeposito.toFixed(1)}% pero debes al ${ibcConsumo.toFixed(1)}%, pierdes. Prioriza pagar deudas caras primero.`,
      color: 'section-red',
      fuente: 'Superfinanciera — datos.gov.co',
    });
  }

  if (perfil.tasaAhorroPromedio >= 15 && capital >= fondoEmergencia) {
    sugerencias.push({
      id: 'diversificacion',
      prioridad: 'baja',
      titulo: 'Diversificación progresiva',
      descripcion: `Tu tasa de ahorro promedio es ${perfil.tasaAhorroPromedio.toFixed(1)}%, por encima del 10-15% recomendado. Con ${capital.toLocaleString('es-CO')} COP podrías considerar: 50% CDT, 30% fondos indexados (consultar comisiones), 20% liquidez.`,
      color: 'section-green',
    });
  }

  return sugerencias.sort((a, b) => {
    const orden = { alta: 0, media: 1, baja: 2 };
    return orden[a.prioridad] - orden[b.prioridad];
  });
}

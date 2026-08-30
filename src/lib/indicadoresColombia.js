/** Indicadores económicos de fuentes oficiales — solo server-side */

const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 horas
let cache = { data: null, ts: 0 };

/** Valores oficiales anuales — actualizar cuando cambien decretos/resoluciones */
export const INDICADORES_ESTATICOS = {
  smmlv: {
    valor: 1750905,
    auxilioTransporte: 249095,
    totalConAuxilio: 2000000,
    vigencia: '2026',
    fuente: 'Decreto 1469/2025 — MinTrabajo',
  },
  uvt: {
    valor: 52374,
    vigencia: '2026',
    fuente: 'DIAN Resolución 000238/2025',
  },
  tpm: {
    valor: 12,
    unidad: '% EA',
    fecha: '2026-07-01',
    fuente: 'Banco de la República — Comunicado Junta Directiva jun/2026',
    nota: 'API SDMX BanRep en mantenimiento; valor de comunicado oficial',
  },
};

async function fetchJson(url, revalidate = 14400) {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json();
}

function parseTibc(data) {
  const vigentes = [];
  const seen = new Set();

  for (const row of data) {
    const modalidad = row.modalidad;
    if (seen.has(modalidad)) continue;
    seen.add(modalidad);

    const tasa = parseFloat(String(row.interes_bancario_corriente).replace('%', ''));
    vigentes.push({
      modalidad,
      tasa,
      tasaUsura: parseFloat((tasa * 1.5).toFixed(2)),
      resolucion: row.resolucion,
      vigenciaDesde: row.vigencia_desde,
      vigenciaHasta: row.vigencia_hasta,
    });
  }

  return vigentes;
}

export async function obtenerIndicadoresEconomicos() {
  if (cache.data && Date.now() - cache.ts < CACHE_TTL_MS) {
    return cache.data;
  }

  const errores = [];

  const [trmResult, tibcResult, inflacionResult, depositoResult] = await Promise.allSettled([
    fetchJson('https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciadesde DESC'),
    fetchJson('https://www.datos.gov.co/resource/pare-7x5i.json?$limit=20&$order=vigencia_desde DESC'),
    fetchJson('https://api.worldbank.org/v2/country/COL/indicator/FP.CPI.TOTL.ZG?format=json&per_page=1'),
    fetchJson('https://api.worldbank.org/v2/country/COL/indicator/FR.INR.DPST?format=json&per_page=1'),
  ]);

  let trm = null;
  if (trmResult.status === 'fulfilled' && trmResult.value?.[0]) {
    const row = trmResult.value[0];
    trm = {
      valor: parseFloat(row.valor),
      unidad: row.unidad,
      vigenciaDesde: row.vigenciadesde,
      vigenciaHasta: row.vigenciahasta,
      fuente: 'Superfinanciera — datos.gov.co (TRM oficial)',
    };
  } else {
    errores.push('TRM: no disponible');
  }

  let tasasCredito = [];
  if (tibcResult.status === 'fulfilled') {
    tasasCredito = parseTibc(tibcResult.value);
  } else {
    errores.push('Tasas IBC: no disponibles');
  }

  let inflacion = null;
  if (inflacionResult.status === 'fulfilled' && inflacionResult.value?.[1]?.[0]) {
    const row = inflacionResult.value[1][0];
    inflacion = {
      valor: row.value,
      anio: row.date,
      fuente: 'Banco Mundial (FP.CPI.TOTL.ZG) — basado en IPC DANE',
    };
  } else {
    errores.push('Inflación: no disponible');
  }

  let tasaDeposito = null;
  if (depositoResult.status === 'fulfilled' && depositoResult.value?.[1]?.[0]) {
    const row = depositoResult.value[1][0];
    tasaDeposito = {
      valor: row.value,
      anio: row.date,
      fuente: 'Banco Mundial (FR.INR.DPST) — tasa promedio depósitos Colombia',
    };
  } else {
    errores.push('Tasa depósitos: no disponible');
  }

  const resultado = {
    actualizadoEn: new Date().toISOString(),
    trm,
    tasasCredito,
    inflacion,
    tasaDeposito,
    tpm: INDICADORES_ESTATICOS.tpm,
    smmlv: INDICADORES_ESTATICOS.smmlv,
    uvt: INDICADORES_ESTATICOS.uvt,
    errores,
    disclaimer:
      'Datos informativos de fuentes públicas. No constituye asesoría financiera. Verifica tasas con tu entidad antes de invertir o solicitar crédito.',
  };

  cache = { data: resultado, ts: Date.now() };
  return resultado;
}

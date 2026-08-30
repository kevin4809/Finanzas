import {
  extraerBaseConcepto,
  etiquetaQuincena,
  formatearConceptoConDia,
  parsearConceptoConDia,
  quincenaPorConcepto,
  quincenaPorDia,
} from '@/lib/conceptosTexto';

const QUINCENAS = ['quincena1', 'quincena2'];
const CATEGORIAS = ['obligaciones', 'gastosPersonales'];
const ULTIMO_MES = 11;

const normalizarConcepto = (concepto) => concepto.trim().toLowerCase();

export {
  extraerBaseConcepto,
  etiquetaQuincena,
  formatearConceptoConDia,
  parsearConceptoConDia,
  quincenaPorConcepto,
  quincenaPorDia,
};

/** null = sin fecha de fin → activa desde mesInicio en adelante */
export const suscripcionActivaEnMes = (mesIndex, mesInicio, mesFin) => {
  const inicio = mesInicio ?? 0;
  if (mesIndex < inicio) return false;
  if (mesFin === null || mesFin === undefined) return true;
  return mesIndex <= mesFin;
};

const existeConcepto = (items, concepto) =>
  items.some((item) => normalizarConcepto(item.concepto) === normalizarConcepto(concepto));

const clonarMes = (mes) => ({
  ...mes,
  datosQuincenales: {
    quincena1: {
      ...mes.datosQuincenales.quincena1,
      obligaciones: [...mes.datosQuincenales.quincena1.obligaciones],
      gastosPersonales: [...mes.datosQuincenales.quincena1.gastosPersonales],
    },
    quincena2: {
      ...mes.datosQuincenales.quincena2,
      obligaciones: [...mes.datosQuincenales.quincena2.obligaciones],
      gastosPersonales: [...mes.datosQuincenales.quincena2.gastosPersonales],
    },
  },
});

const normalizarMesFin = (mesFin) => {
  if (mesFin === '' || mesFin === undefined) return null;
  if (mesFin === null) return null;
  return Math.max(0, Math.min(mesFin, ULTIMO_MES));
};

const crearItemSuscripcion = ({ concepto, monto, categoria, mesInicio, mesFin }) => ({
  concepto,
  monto: monto || 0,
  recurrente: true,
  categoria: categoria || 'otros',
  mesInicio: Math.max(0, Math.min(mesInicio ?? 0, ULTIMO_MES)),
  mesFin: normalizarMesFin(mesFin),
});

/** Infiere mesInicio/mesFin según en qué meses existe la suscripción */
export const inferirRangoSuscripcion = (meses, quincena, categoria, concepto) => {
  const norm = normalizarConcepto(concepto);
  let mesInicio = null;
  let mesFinInferido = null;
  let mesFinExplicito = undefined;

  meses.forEach((mes, index) => {
    const items = mes.datosQuincenales?.[quincena]?.[categoria] ?? [];
    const item = items.find((i) => i.recurrente && normalizarConcepto(i.concepto) === norm);
    if (item) {
      if (mesInicio === null) mesInicio = index;
      mesFinInferido = index;
      if (item.mesFin === null) mesFinExplicito = null;
      else if (item.mesFin !== undefined && mesFinExplicito === undefined) {
        mesFinExplicito = item.mesFin;
      }
    }
  });

  if (mesFinExplicito !== undefined) {
    return { mesInicio: mesInicio ?? 0, mesFin: mesFinExplicito };
  }

  // Termina antes de diciembre → fin explícito; llega a diciembre → sin fin (sigue activa)
  const mesFin = mesFinInferido !== null && mesFinInferido < ULTIMO_MES ? mesFinInferido : null;

  return { mesInicio: mesInicio ?? 0, mesFin };
};

/** Asigna mesInicio/mesFin y limpia meses fuera de rango */
export const migrarRangosSuscripciones = (meses) => {
  if (!meses?.length) return meses;

  const rangos = new Map();

  meses.forEach((mes) => {
    for (const quincena of QUINCENAS) {
      for (const categoria of CATEGORIAS) {
        for (const item of mes.datosQuincenales?.[quincena]?.[categoria] ?? []) {
          if (!item.recurrente) continue;
          const key = `${quincena}|${categoria}|${normalizarConcepto(item.concepto)}`;
          if (!rangos.has(key)) {
            rangos.set(key, inferirRangoSuscripcion(meses, quincena, categoria, item.concepto));
          }
        }
      }
    }
  });

  return meses.map(clonarMes).map((mes, index) => {
    for (const quincena of QUINCENAS) {
      for (const categoria of CATEGORIAS) {
        mes.datosQuincenales[quincena][categoria] = mes.datosQuincenales[quincena][categoria]
          .filter((item) => {
            if (!item.recurrente) return true;
            const key = `${quincena}|${categoria}|${normalizarConcepto(item.concepto)}`;
            const { mesInicio, mesFin } = rangos.get(key) ?? { mesInicio: 0, mesFin: null };
            return suscripcionActivaEnMes(index, mesInicio, mesFin);
          })
          .map((item) => {
            if (!item.recurrente) return item;
            const key = `${quincena}|${categoria}|${normalizarConcepto(item.concepto)}`;
            const { mesInicio, mesFin } = rangos.get(key) ?? { mesInicio: 0, mesFin: null };
            return { ...item, mesInicio, mesFin };
          });
      }
    }
    return mes;
  });
};

export const actualizarMontoRecurrenteEnMesesSiguientes = (meses, desdeMesIndex, quincena, categoria, concepto, monto) => {
  const mesesSync = meses.map(clonarMes);
  const conceptoNormalizado = normalizarConcepto(concepto);

  for (let i = desdeMesIndex + 1; i < mesesSync.length; i++) {
    const items = mesesSync[i].datosQuincenales[quincena][categoria];
    const idx = items.findIndex((item) => normalizarConcepto(item.concepto) === conceptoNormalizado && item.recurrente);

    if (idx !== -1) {
      const { mesFin, mesInicio } = items[idx];
      if (!suscripcionActivaEnMes(i, mesInicio, mesFin)) continue;
      items[idx] = { ...items[idx], monto };
    }
  }

  return mesesSync;
};

export const propagarRecurrentesEntreMeses = (mesOrigen, mesDestino) => {
  const destinoIndex = mesDestino.index ?? 0;
  const destino = clonarMes(mesDestino);

  for (const quincena of QUINCENAS) {
    for (const categoria of CATEGORIAS) {
      const itemsOrigen = mesOrigen.datosQuincenales[quincena][categoria];
      const itemsDestino = destino.datosQuincenales[quincena][categoria];
      const recurrentes = itemsOrigen.filter((item) => item.recurrente);

      for (const item of recurrentes) {
        const mesInicio = item.mesInicio ?? 0;
        const mesFin = item.mesFin ?? null;
        if (!suscripcionActivaEnMes(destinoIndex, mesInicio, mesFin)) continue;

        if (!existeConcepto(itemsDestino, item.concepto)) {
          itemsDestino.push({
            concepto: item.concepto,
            monto: item.monto,
            recurrente: true,
            categoria: item.categoria || 'otros',
            mesInicio,
            mesFin,
          });
        }
      }
    }
  }

  return destino;
};

export const sincronizarRecurrentesEnAnio = (meses) => {
  if (!meses?.length) return meses;

  const mesesSync = meses.map(clonarMes);

  for (let i = 1; i < mesesSync.length; i++) {
    mesesSync[i] = propagarRecurrentesEntreMeses(mesesSync[i - 1], mesesSync[i]);
  }

  return mesesSync;
};

export const propagarRecurrentesAMesesSiguientes = (meses, desdeMesIndex) => {
  if (!meses?.length || desdeMesIndex >= meses.length - 1) return meses;

  const mesesSync = meses.map(clonarMes);

  for (let i = desdeMesIndex + 1; i < mesesSync.length; i++) {
    mesesSync[i] = propagarRecurrentesEntreMeses(mesesSync[i - 1], mesesSync[i]);
  }

  return mesesSync;
};

export const propagarRecurrentesDesdeMes = (mesOrigen, mesesDestino) => {
  if (!mesOrigen || !mesesDestino?.length) return mesesDestino;

  return mesesDestino.map((mes) => propagarRecurrentesEntreMeses(mesOrigen, mes));
};

export const extraerConceptosUnicos = (meses) => {
  if (!meses?.length) return [];

  const conceptos = new Set();
  for (const mes of meses) {
    for (const quincena of QUINCENAS) {
      for (const categoria of CATEGORIAS) {
        for (const item of mes.datosQuincenales[quincena][categoria]) {
          if (item.concepto?.trim()) conceptos.add(item.concepto.trim());
        }
      }
    }
  }
  return Array.from(conceptos).sort((a, b) => a.localeCompare(b, 'es'));
};

export const extraerConceptosBaseUnicos = (meses) => {
  if (!meses?.length) return [];

  const bases = new Set();
  for (const mes of meses) {
    for (const quincena of QUINCENAS) {
      for (const categoria of CATEGORIAS) {
        for (const item of mes.datosQuincenales[quincena][categoria]) {
          const base = extraerBaseConcepto(item.concepto);
          if (base) bases.add(base);
        }
      }
    }
  }
  return Array.from(bases).sort((a, b) => a.localeCompare(b, 'es'));
};

export const extraerSuscripciones = (meses) => {
  if (!meses?.length) return [];

  const map = new Map();
  for (const mes of meses) {
    for (const quincena of QUINCENAS) {
      for (const categoria of CATEGORIAS) {
        for (const item of mes.datosQuincenales[quincena][categoria]) {
          if (!item.recurrente) continue;
          const key = `${quincena}|${categoria}|${normalizarConcepto(item.concepto)}`;
          if (!map.has(key)) {
            const rango = inferirRangoSuscripcion(meses, quincena, categoria, item.concepto);
            map.set(key, {
              key,
              concepto: item.concepto,
              monto: item.monto,
              quincena,
              categoria,
              mesInicio: item.mesInicio ?? rango.mesInicio,
              mesFin: item.mesFin !== undefined ? item.mesFin : rango.mesFin,
            });
          }
        }
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.concepto.localeCompare(b.concepto, 'es'));
};

export const agregarSuscripcionEnRango = (meses, { concepto, monto, quincena, categoria, mesInicio, mesFin }) => {
  const itemBase = crearItemSuscripcion({ concepto, monto, categoria, mesInicio, mesFin });

  return meses.map(clonarMes).map((mes, index) => {
    if (!suscripcionActivaEnMes(index, itemBase.mesInicio, itemBase.mesFin)) return mes;

    const items = mes.datosQuincenales[quincena][categoria];
    if (!existeConcepto(items, concepto)) {
      items.push({ ...itemBase, concepto });
    }
    return mes;
  });
};

/** @deprecated alias */
export const agregarSuscripcionATodosLosMeses = agregarSuscripcionEnRango;

export const eliminarSuscripcionDeTodosLosMeses = (meses, quincena, categoria, concepto) => {
  const norm = normalizarConcepto(concepto);
  return meses.map(clonarMes).map((mes) => {
    mes.datosQuincenales[quincena][categoria] = mes.datosQuincenales[quincena][categoria].filter(
      (item) => !(item.recurrente && normalizarConcepto(item.concepto) === norm)
    );
    return mes;
  });
};

export const actualizarSuscripcionEnTodosLosMeses = (meses, quincena, categoria, conceptoAnterior, cambios) => {
  const normAnterior = normalizarConcepto(conceptoAnterior);

  let ref = null;
  outer: for (const mes of meses) {
    for (const item of mes.datosQuincenales[quincena][categoria]) {
      if (item.recurrente && normalizarConcepto(item.concepto) === normAnterior) {
        ref = item;
        break outer;
      }
    }
  }

  const concepto = cambios.concepto ?? ref?.concepto ?? conceptoAnterior;
  const monto = cambios.monto ?? ref?.monto ?? 0;
  const mesInicio = cambios.mesInicio ?? ref?.mesInicio ?? 0;
  const mesFin = 'mesFin' in cambios ? normalizarMesFin(cambios.mesFin) : (ref?.mesFin ?? null);
  const quincenaDestino = cambios.quincena ?? quincena;

  const itemBase = crearItemSuscripcion({ concepto, monto, categoria, mesInicio, mesFin });

  return meses.map(clonarMes).map((mes, index) => {
    mes.datosQuincenales[quincena][categoria] = mes.datosQuincenales[quincena][categoria].filter(
      (item) => !(item.recurrente && normalizarConcepto(item.concepto) === normAnterior)
    );

    if (suscripcionActivaEnMes(index, itemBase.mesInicio, itemBase.mesFin)) {
      mes.datosQuincenales[quincenaDestino][categoria].push({ ...itemBase, concepto });
    }

    return mes;
  });
};

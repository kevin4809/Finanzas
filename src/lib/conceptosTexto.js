const PREFIJO_DIA_REGEX = /^\d{1,2}\s*-\s*/;
const STOP_WORDS = /\b(de|del|la|el|los|las|y|a|en|por|para|un|una)\b/g;

/** Quita prefijo tipo "07 - " para agrupar sugerencias */
export const extraerBaseConcepto = (concepto) => {
  const trimmed = concepto?.trim() ?? '';
  const base = trimmed.replace(PREFIJO_DIA_REGEX, '').trim();
  return base || trimmed;
};

/** Formatea "07" + "Pago luz" → "07 - Pago luz" */
export const formatearConceptoConDia = (dia, conceptoBase) => {
  const base = conceptoBase.trim();
  if (!base) return '';

  const diaNum = parseInt(String(dia).trim(), 10);
  if (!diaNum || diaNum < 1 || diaNum > 31) return base;

  return `${String(diaNum).padStart(2, '0')} - ${base}`;
};

/** Intenta separar "07 - Pago luz" en { dia: "07", base: "Pago luz" } */
export const parsearConceptoConDia = (concepto) => {
  const trimmed = concepto?.trim() ?? '';
  const match = trimmed.match(/^(\d{1,2})\s*-\s*(.+)$/);
  if (!match) return { dia: '', base: trimmed };
  return { dia: match[1], base: match[2].trim() };
};

/** Días 1-15 → Q1, 16-31 → Q2. Sin día válido → null */
export const quincenaPorDia = (dia) => {
  const diaNum = parseInt(String(dia ?? '').trim(), 10);
  if (!diaNum || diaNum < 1 || diaNum > 31) return null;
  return diaNum <= 15 ? 'quincena1' : 'quincena2';
};

export const quincenaPorConcepto = (concepto) => {
  const { dia } = parsearConceptoConDia(concepto);
  return quincenaPorDia(dia);
};

export const etiquetaQuincena = (quincena) => (quincena === 'quincena2' ? 'Q2' : 'Q1');

/** Clave para agrupar variantes similares (mayúsculas, acentos, "de", etc.) */
export const claveAgrupacionConcepto = (concepto) => {
  const base = extraerBaseConcepto(concepto);
  return base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(STOP_WORDS, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const QUINCENAS = ['quincena1', 'quincena2'];
const CATEGORIAS = ['obligaciones', 'gastosPersonales'];

const recorrerItems = (meses, callback) => {
  for (const mes of meses) {
    for (const quincena of QUINCENAS) {
      for (const categoria of CATEGORIAS) {
        const items = mes.datosQuincenales?.[quincena]?.[categoria] ?? [];
        for (const item of items) {
          callback(item);
        }
      }
    }
  }
};

const limpiarBase = (base) => base.trim().replace(/\s+/g, ' ');

/** Mapa clave → nombre canónico (el más usado en los datos) */
export const construirMapaCanonico = (listaDeMeses) => {
  const grupos = new Map();

  for (const meses of listaDeMeses) {
    recorrerItems(meses, (item) => {
      const base = limpiarBase(extraerBaseConcepto(item.concepto));
      if (!base) return;

      const clave = claveAgrupacionConcepto(base);
      if (!grupos.has(clave)) grupos.set(clave, new Map());
      const variantes = grupos.get(clave);
      variantes.set(base, (variantes.get(base) || 0) + 1);
    });
  }

  const mapa = new Map();
  for (const [clave, variantes] of grupos) {
    const elegido = limpiarBase(
      [...variantes.entries()].sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es')
      )[0][0]
    );
    mapa.set(clave, elegido);
  }

  return mapa;
};

const aplicarCanonico = (concepto, mapa) => {
  const { dia, base } = parsearConceptoConDia(concepto);
  if (!base) return concepto?.trim() ?? '';

  const clave = claveAgrupacionConcepto(base);
  const canonico = mapa.get(clave) || base;

  return dia ? formatearConceptoConDia(dia, canonico) : canonico;
};

/** Unifica conceptos similares dentro de un año */
export const unificarConceptosEnMeses = (meses, mapaExterno = null) => {
  if (!meses?.length) return { meses, cambios: 0, unificaciones: [] };

  const mapa = mapaExterno ?? construirMapaCanonico([meses]);
  let cambios = 0;
  const unificaciones = [];

  const mesesNuevos = meses.map((mes) => {
    const datosQuincenales = {};

    for (const quincena of QUINCENAS) {
      datosQuincenales[quincena] = { ...mes.datosQuincenales[quincena] };

      for (const categoria of CATEGORIAS) {
        datosQuincenales[quincena][categoria] = mes.datosQuincenales[quincena][categoria].map((item) => {
          const nuevoConcepto = aplicarCanonico(item.concepto, mapa);
          if (nuevoConcepto !== item.concepto) {
            cambios += 1;
            unificaciones.push({ antes: item.concepto, despues: nuevoConcepto });
          }
          return { ...item, concepto: nuevoConcepto };
        });
      }
    }

    return { ...mes, datosQuincenales };
  });

  const reporte = [...new Map(unificaciones.map((u) => [`${u.antes}→${u.despues}`, u])).values()];

  return { meses: mesesNuevos, cambios, unificaciones: reporte };
};

/** Unifica conceptos usando un mapa global (todos los años) */
export const unificarConceptosGlobal = (documentosPorAnio) => {
  const listaDeMeses = Object.values(documentosPorAnio)
    .map((doc) => doc.meses)
    .filter(Boolean);

  if (!listaDeMeses.length) {
    return { documentos: documentosPorAnio, cambios: 0, unificaciones: [] };
  }

  const mapa = construirMapaCanonico(listaDeMeses);
  let cambiosTotal = 0;
  const unificaciones = [];
  const documentos = {};

  for (const [anio, doc] of Object.entries(documentosPorAnio)) {
    const { meses, cambios, unificaciones: u } = unificarConceptosEnMeses(doc.meses, mapa);
    documentos[anio] = { ...doc, meses };
    cambiosTotal += cambios;
    unificaciones.push(...u);
  }

  const reporte = [...new Map(unificaciones.map((u) => [`${u.antes}→${u.despues}`, u])).values()];

  return { documentos, cambios: cambiosTotal, unificaciones: reporte, mapaCanonico: mapa };
};

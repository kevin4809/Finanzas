const QUINCENAS = ['quincena1', 'quincena2'];
const CATEGORIAS = ['obligaciones', 'gastosPersonales'];

const normalizarConcepto = (concepto) => concepto.trim().toLowerCase();

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

export const actualizarMontoRecurrenteEnMesesSiguientes = (meses, desdeMesIndex, quincena, categoria, concepto, monto) => {
  const mesesSync = meses.map(clonarMes);
  const conceptoNormalizado = normalizarConcepto(concepto);

  for (let i = desdeMesIndex + 1; i < mesesSync.length; i++) {
    const items = mesesSync[i].datosQuincenales[quincena][categoria];
    const idx = items.findIndex((item) => normalizarConcepto(item.concepto) === conceptoNormalizado && item.recurrente);

    if (idx !== -1) {
      items[idx] = { ...items[idx], monto };
    }
  }

  return mesesSync;
};

export const propagarRecurrentesEntreMeses = (mesOrigen, mesDestino) => {
  const destino = clonarMes(mesDestino);

  for (const quincena of QUINCENAS) {
    for (const categoria of CATEGORIAS) {
      const itemsOrigen = mesOrigen.datosQuincenales[quincena][categoria];
      const itemsDestino = destino.datosQuincenales[quincena][categoria];
      const recurrentes = itemsOrigen.filter((item) => item.recurrente);

      for (const item of recurrentes) {
        if (!existeConcepto(itemsDestino, item.concepto)) {
          itemsDestino.push({
            concepto: item.concepto,
            monto: item.monto,
            recurrente: true,
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

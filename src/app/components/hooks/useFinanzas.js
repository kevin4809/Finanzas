import { useState, useMemo, useEffect, useRef } from 'react';

const INGRESO_MENSUAL_DEFECTO = 4000000;

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const ESTRUCTURA_QUINCENA_INICIAL = {
  ingreso: INGRESO_MENSUAL_DEFECTO / 2,
  obligaciones: [],
  gastosPersonales: [],
  // ahorro se calcula automáticamente, no se guarda
};

const crearEstructuraAnio = (anio) => ({
  anio,
  meses: MESES.map((mes, index) => ({
    mes,
    index,
    ingresoTotal: INGRESO_MENSUAL_DEFECTO,
    obligaciones: 0,
    gastosPersonales: 0,
    ahorroEnCuenta: 0,
    balanceFinal: 0,
    porcentajeAhorro: 0,
    datosQuincenales: {
      quincena1: JSON.parse(JSON.stringify(ESTRUCTURA_QUINCENA_INICIAL)),
      quincena2: JSON.parse(JSON.stringify(ESTRUCTURA_QUINCENA_INICIAL)),
    },
  })),
});

export const useFinanzas = () => {
  // Estados
  const [datosAnios, setDatosAnios] = useState({});
  const [anioSeleccionado, setAnioSeleccionado] = useState(() => new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState(() => new Date().getMonth());
  const [activeSheet, setActiveSheet] = useState('resumen');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [aniosDisponiblesDB, setAniosDisponiblesDB] = useState([]);

  // Refs para debounce
  const saveTimeoutRef = useRef(null);
  const isFirstLoadRef = useRef(true);

  // Cargar años disponibles desde MongoDB
  const cargarAniosDisponibles = async () => {
    try {
      const response = await fetch('/api/finanzas/anios');
      const data = await response.json();
      if (data.anios && data.anios.length > 0) {
        setAniosDisponiblesDB(data.anios);
        return data.anios;
      }
      return [];
    } catch (error) {
      console.error('Error al cargar años disponibles:', error);
      return [];
    }
  };

  // Cargar datos de un año desde MongoDB
  const cargarDatosAnio = async (anio) => {
    try {
      const response = await fetch(`/api/finanzas?anio=${anio}`);
      const data = await response.json();

      if (data.datos && data.datos.length > 0) {
        // Datos encontrados en MongoDB
        setDatosAnios((prev) => ({
          ...prev,
          [anio]: { anio, meses: data.datos },
        }));
        return true;
      } else {
        // No hay datos, crear estructura inicial
        const nuevaEstructura = crearEstructuraAnio(anio);
        setDatosAnios((prev) => ({
          ...prev,
          [anio]: nuevaEstructura,
        }));
        return false;
      }
    } catch (error) {
      console.error('Error al cargar datos del año:', error);
      // En caso de error, crear estructura inicial
      setDatosAnios((prev) => ({
        ...prev,
        [anio]: crearEstructuraAnio(anio),
      }));
      return false;
    }
  };

  // Guardar datos en MongoDB con debounce
  const guardarEnMongoDB = async (anio, meses) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/finanzas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anio, meses }),
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Error al guardar:', result.error);
      }
    } catch (error) {
      console.error('Error al guardar en MongoDB:', error);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  // Crear nuevo año
  const crearNuevoAnio = async (anio) => {
    if (!datosAnios[anio]) {
      const nuevaEstructura = crearEstructuraAnio(anio);
      setDatosAnios((prev) => ({
        ...prev,
        [anio]: nuevaEstructura,
      }));
      // Guardar inmediatamente el nuevo año
      await guardarEnMongoDB(anio, nuevaEstructura.meses);
      await cargarAniosDisponibles();
    }
  };

  // Calcular resumen con valores derivados usando useMemo
  const datosResumen = useMemo(() => {
    const anio = datosAnios[anioSeleccionado];
    if (!anio) return [];

    return anio.meses.map((mesData) => {
      const quincenales = mesData.datosQuincenales;

      // Calcular ingreso total desde las quincenas
      const ingresoQ1 = quincenales.quincena1.ingreso || 0;
      const ingresoQ2 = quincenales.quincena2.ingreso || 0;
      const ingresoTotal = ingresoQ1 + ingresoQ2;

      const obligacionesQ1 = quincenales.quincena1.obligaciones.reduce((sum, item) => sum + item.monto, 0);
      const obligacionesQ2 = quincenales.quincena2.obligaciones.reduce((sum, item) => sum + item.monto, 0);
      const gastosQ1 = quincenales.quincena1.gastosPersonales.reduce((sum, item) => sum + item.monto, 0);
      const gastosQ2 = quincenales.quincena2.gastosPersonales.reduce((sum, item) => sum + item.monto, 0);

      const obligacionesTotales = obligacionesQ1 + obligacionesQ2;
      const gastosTotales = gastosQ1 + gastosQ2;

      // El ahorro es lo que NO se gastó (calculado automáticamente)
      const ahorroTotal = ingresoTotal - obligacionesTotales - gastosTotales;

      return {
        ...mesData,
        ingresoTotal,
        obligaciones: obligacionesTotales,
        gastosPersonales: gastosTotales,
        ahorroEnCuenta: ahorroTotal,
        // balanceFinal eliminado - el ahorro ES el balance
        porcentajeAhorro: ingresoTotal > 0 ? ((ahorroTotal / ingresoTotal) * 100).toFixed(1) : '0.0',
      };
    });
  }, [datosAnios, anioSeleccionado]);

  const mesData = datosResumen[mesSeleccionado];

  const actualizarIngresoQuincenal = (quincena, nuevoIngreso) => {
    setDatosAnios((prev) => {
      const anio = { ...prev[anioSeleccionado] };
      anio.meses = [...anio.meses];
      const mes = { ...anio.meses[mesSeleccionado] };
      mes.datosQuincenales = { ...mes.datosQuincenales };
      mes.datosQuincenales[quincena] = {
        ...mes.datosQuincenales[quincena],
        ingreso: parseFloat(nuevoIngreso) || 0,
      };
      anio.meses[mesSeleccionado] = mes;
      return { ...prev, [anioSeleccionado]: anio };
    });
  };

  const actualizarMontoQuincenal = (quincena, categoria, index, nuevoMonto) => {
    setDatosAnios((prev) => {
      const anio = { ...prev[anioSeleccionado] };
      anio.meses = [...anio.meses];
      const mes = { ...anio.meses[mesSeleccionado] };
      mes.datosQuincenales = { ...mes.datosQuincenales };
      mes.datosQuincenales[quincena] = { ...mes.datosQuincenales[quincena] };
      mes.datosQuincenales[quincena][categoria] = [...mes.datosQuincenales[quincena][categoria]];
      mes.datosQuincenales[quincena][categoria][index] = {
        ...mes.datosQuincenales[quincena][categoria][index],
        monto: parseFloat(nuevoMonto) || 0,
      };
      anio.meses[mesSeleccionado] = mes;
      return { ...prev, [anioSeleccionado]: anio };
    });
  };

  // actualizarAhorroQuincenal eliminado - el ahorro se calcula automáticamente

  const agregarItem = (quincena, categoria, concepto) => {
    setDatosAnios((prev) => {
      const anio = { ...prev[anioSeleccionado] };
      anio.meses = [...anio.meses];
      const mes = { ...anio.meses[mesSeleccionado] };
      mes.datosQuincenales = { ...mes.datosQuincenales };
      mes.datosQuincenales[quincena] = { ...mes.datosQuincenales[quincena] };
      mes.datosQuincenales[quincena][categoria] = [...mes.datosQuincenales[quincena][categoria]];
      mes.datosQuincenales[quincena][categoria].push({ concepto, monto: 0 });
      anio.meses[mesSeleccionado] = mes;
      return { ...prev, [anioSeleccionado]: anio };
    });
  };

  const eliminarItem = (quincena, categoria, index) => {
    setDatosAnios((prev) => {
      const anio = { ...prev[anioSeleccionado] };
      anio.meses = [...anio.meses];
      const mes = { ...anio.meses[mesSeleccionado] };
      mes.datosQuincenales = { ...mes.datosQuincenales };
      mes.datosQuincenales[quincena] = { ...mes.datosQuincenales[quincena] };
      mes.datosQuincenales[quincena][categoria] = [...mes.datosQuincenales[quincena][categoria]];
      mes.datosQuincenales[quincena][categoria].splice(index, 1);
      anio.meses[mesSeleccionado] = mes;
      return { ...prev, [anioSeleccionado]: anio };
    });
  };

  const actualizarConcepto = (quincena, categoria, index, nuevoConcepto) => {
    setDatosAnios((prev) => {
      const anio = { ...prev[anioSeleccionado] };
      anio.meses = [...anio.meses];
      const mes = { ...anio.meses[mesSeleccionado] };
      mes.datosQuincenales = { ...mes.datosQuincenales };
      mes.datosQuincenales[quincena] = { ...mes.datosQuincenales[quincena] };
      mes.datosQuincenales[quincena][categoria] = [...mes.datosQuincenales[quincena][categoria]];
      mes.datosQuincenales[quincena][categoria][index] = {
        ...mes.datosQuincenales[quincena][categoria][index],
        concepto: nuevoConcepto,
      };
      anio.meses[mesSeleccionado] = mes;
      return { ...prev, [anioSeleccionado]: anio };
    });
  };

  // useEffect: Cargar datos iniciales
  useEffect(() => {
    const inicializar = async () => {
      setIsLoading(true);
      try {
        // Cargar años disponibles
        const anios = await cargarAniosDisponibles();

        // Si hay años en la DB, cargar el año seleccionado
        if (anios.length > 0) {
          await cargarDatosAnio(anioSeleccionado);
        } else {
          // Si no hay años, crear el año actual
          await cargarDatosAnio(anioSeleccionado);
        }
      } catch (error) {
        console.error('Error en inicialización:', error);
      } finally {
        setIsLoading(false);
        isFirstLoadRef.current = false;
      }
    };

    inicializar();
  }, []); // Solo ejecutar al montar

  // useEffect: Cargar datos cuando cambia el año seleccionado
  useEffect(() => {
    if (!isFirstLoadRef.current && anioSeleccionado) {
      const cargarAnio = async () => {
        if (!datosAnios[anioSeleccionado]) {
          setIsLoading(true);
          await cargarDatosAnio(anioSeleccionado);
          setIsLoading(false);
        }
      };
      cargarAnio();
    }
  }, [anioSeleccionado]);

  // useEffect: Auto-guardar cambios con debounce (2 segundos)
  useEffect(() => {
    if (isFirstLoadRef.current || Object.keys(datosAnios).length === 0) {
      return;
    }

    // Cancelar timeout anterior si existe
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Programar guardado después de 2 segundos de inactividad
    saveTimeoutRef.current = setTimeout(() => {
      if (datosAnios[anioSeleccionado]?.meses) {
        guardarEnMongoDB(anioSeleccionado, datosAnios[anioSeleccionado].meses);
      }
    }, 2000);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [datosAnios, anioSeleccionado]);

  const formatCOP = (num) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const exportarACSV = () => {
    let csvContent = `CONTROL FINANCIERO - AÑO ${anioSeleccionado}\n\n`;
    csvContent += 'RESUMEN MENSUAL\n\n';
    csvContent += 'Mes,Ingreso Total,Obligaciones,Gastos Personales,Ahorro Total,% Ahorro\n';

    datosResumen.forEach((row) => {
      csvContent += `${row.mes},${row.ingresoTotal},${row.obligaciones},${row.gastosPersonales},${row.ahorroEnCuenta},${row.porcentajeAhorro}%\n`;
    });

    csvContent += '\n\nDETALLE QUINCENAL\n\n';

    datosResumen.forEach((mesData) => {
      const quincenales = mesData.datosQuincenales;
      csvContent += `\n${mesData.mes} ${anioSeleccionado}\n`;
      csvContent += `Ingreso Mensual: ${mesData.ingresoTotal}\n`;
      csvContent += '\nQUINCENA 1\n';
      csvContent += 'Obligaciones\n';
      quincenales.quincena1.obligaciones.forEach((item) => {
        csvContent += `${item.concepto},${item.monto}\n`;
      });
      csvContent += 'Gastos Personales\n';
      quincenales.quincena1.gastosPersonales.forEach((item) => {
        csvContent += `${item.concepto},${item.monto}\n`;
      });
      const ingresoQ1 = quincenales.quincena1.ingreso || 0;
      const obligacionesQ1 = quincenales.quincena1.obligaciones.reduce((sum, item) => sum + item.monto, 0);
      const gastosQ1 = quincenales.quincena1.gastosPersonales.reduce((sum, item) => sum + item.monto, 0);
      const ahorroQ1 = ingresoQ1 - obligacionesQ1 - gastosQ1;
      csvContent += `Ahorro,${ahorroQ1}\n`;

      csvContent += '\nQUINCENA 2\n';
      csvContent += 'Obligaciones\n';
      quincenales.quincena2.obligaciones.forEach((item) => {
        csvContent += `${item.concepto},${item.monto}\n`;
      });
      csvContent += 'Gastos Personales\n';
      quincenales.quincena2.gastosPersonales.forEach((item) => {
        csvContent += `${item.concepto},${item.monto}\n`;
      });
      const ingresoQ2 = quincenales.quincena2.ingreso || 0;
      const obligacionesQ2 = quincenales.quincena2.obligaciones.reduce((sum, item) => sum + item.monto, 0);
      const gastosQ2 = quincenales.quincena2.gastosPersonales.reduce((sum, item) => sum + item.monto, 0);
      const ahorroQ2 = ingresoQ2 - obligacionesQ2 - gastosQ2;
      csvContent += `Ahorro,${ahorroQ2}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `control_financiero_${anioSeleccionado}.csv`;
    link.click();
  };

  const guardarDatos = () => {
    const dataStr = JSON.stringify(datosAnios, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'control_financiero_backup.json';
    link.click();
  };

  const cargarDatos = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setDatosAnios(data);
        } catch (error) {
          alert('Error al cargar el archivo');
        }
      };
      reader.readAsText(file);
    }
  };

  return {
    // Constantes
    MESES,
    // Estado
    datosResumen,
    datosQuincenales: mesData?.datosQuincenales,
    mesSeleccionado,
    anioSeleccionado,
    aniosDisponibles: aniosDisponiblesDB.length > 0 ? aniosDisponiblesDB : Object.keys(datosAnios).map(Number).sort(),
    activeSheet,
    ingresoMensualActual: mesData?.ingresoTotal || 0,
    isLoading,
    isSaving,
    // Setters
    setMesSeleccionado,
    setAnioSeleccionado,
    setActiveSheet,
    crearNuevoAnio,
    // Funciones
    actualizarIngresoQuincenal,
    actualizarMontoQuincenal,
    // actualizarAhorroQuincenal eliminado - ahorro es automático
    actualizarConcepto,
    agregarItem,
    eliminarItem,
    formatCOP,
    exportarACSV,
    guardarDatos,
    cargarDatos,
  };
};

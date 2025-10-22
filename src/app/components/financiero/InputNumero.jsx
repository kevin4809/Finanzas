'use client';

import { useState, useEffect } from 'react';

// Formatear número con separadores de miles
function formatearNumero(num) {
  if (!num && num !== 0) return '';
  const numero = typeof num === 'string' ? parseFloat(num.replace(/\./g, '')) : num;
  if (isNaN(numero)) return '';
  return numero.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

export default function InputNumero({ valor, onChange, placeholder = '0', className = '' }) {
  const [valorFormateado, setValorFormateado] = useState(() => formatearNumero(valor));

  // Actualizar cuando cambie el valor externo
  useEffect(() => {
    setValorFormateado(formatearNumero(valor));
  }, [valor]);

  const handleChange = (e) => {
    const input = e.target.value;

    // Permitir solo números y puntos
    const soloNumeros = input.replace(/[^\d]/g, '');

    if (soloNumeros === '') {
      setValorFormateado('');
      onChange(0);
      return;
    }

    const numeroLimpio = parseFloat(soloNumeros);
    const formateado = formatearNumero(numeroLimpio);

    setValorFormateado(formateado);
    onChange(numeroLimpio);
  };

  const handleBlur = () => {
    // Re-formatear al perder el foco
    setValorFormateado(formatearNumero(valor));
  };

  return (
    <input
      type='text'
      value={valorFormateado}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
    />
  );
}

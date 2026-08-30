'use client';

import { useState, useEffect } from 'react';

// Formatear número con separadores de miles
function formatearNumero(num) {
  if (!num && num !== 0) return '';
  const numero = typeof num === 'string' ? parseFloat(num.replace(/\./g, '')) : num;
  if (isNaN(numero)) return '';
  return numero.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

export default function InputNumero({ valor, onChange, placeholder = '0', className = '', onEnterKey, inputClassName = 'monto-input' }) {
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const inputs = Array.from(document.querySelectorAll(`input.${inputClassName}`));
      const currentIndex = inputs.indexOf(e.target);
      if (currentIndex !== -1 && currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
        inputs[currentIndex + 1].select();
      }
      onEnterKey?.(e);
    }
  };

  return (
    <input
      type='text'
      value={valorFormateado}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`${inputClassName} ${className}`}
    />
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { Lock } from 'lucide-react';

export default function LoginPIN({ onLoginSuccess }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    // Focus en el primer input al montar
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index, value) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto-focus al siguiente input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Si se completaron los 4 dígitos, intentar login
    if (index === 3 && value) {
      const completePin = [...newPin.slice(0, 3), value].join('');
      handleSubmit(completePin);
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: ir al input anterior si está vacío
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);

    if (/^\d{4}$/.test(pastedData)) {
      const newPin = pastedData.split('');
      setPin(newPin);
      inputRefs[3].current?.focus();
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (pinToSubmit) => {
    const pinValue = pinToSubmit || pin.join('');

    if (pinValue.length !== 4) {
      setError('Ingresa los 4 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinValue }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar token en localStorage
        localStorage.setItem('auth_token', data.token);
        onLoginSuccess();
      } else {
        setError(data.error || 'PIN incorrecto');
        setPin(['', '', '', '']);
        inputRefs[0].current?.focus();
      }
    } catch (error) {
      setError('Error de conexión');
      setPin(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4'>
            <Lock className='w-8 h-8 text-blue-600' />
          </div>
          <h1 className='text-2xl font-bold text-gray-800 mb-2'>Control Financiero</h1>
          <p className='text-gray-600'>Ingresa tu PIN de 4 dígitos</p>
        </div>

        <div className='mb-6'>
          <div className='flex gap-3 justify-center' onPaste={handlePaste}>
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type='text'
                inputMode='numeric'
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading}
                className='w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-100'
                autoComplete='off'
              />
            ))}
          </div>
        </div>

        {error && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-red-600 text-sm text-center'>{error}</p>
          </div>
        )}

        {loading && (
          <div className='text-center'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent'></div>
            <p className='text-gray-600 mt-2 text-sm'>Verificando...</p>
          </div>
        )}

        <div className='mt-6 pt-6 border-t border-gray-200'>
          <p className='text-xs text-gray-500 text-center'>
            Tus datos financieros están protegidos con autenticación
          </p>
        </div>
      </div>
    </div>
  );
}

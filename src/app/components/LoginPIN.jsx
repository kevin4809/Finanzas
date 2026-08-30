'use client';

import { useState, useRef, useEffect } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function LoginPIN({ onLoginSuccess }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (index === 3 && value) {
      const completePin = [...newPin.slice(0, 3), value].join('');
      handleSubmit(completePin);
    }
  };

  const handleKeyDown = (index, e) => {
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
        localStorage.setItem('auth_token', data.token);
        onLoginSuccess();
      } else {
        setError(data.error || 'PIN incorrecto');
        setPin(['', '', '', '']);
        inputRefs[0].current?.focus();
      }
    } catch {
      setError('Error de conexión');
      setPin(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4 relative'>
      <div className='absolute top-4 right-4 z-10'>
        <ThemeToggle />
      </div>

      <div className='login-card'>
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-5 shadow-xl shadow-indigo-500/30' style={{ animation: 'float 3s ease-in-out infinite' }}>
            <Lock className='w-9 h-9 text-white' />
          </div>
          <h1 className='font-display text-3xl font-bold text-primary mb-2'>Control Financiero</h1>
          <p className='text-muted'>Ingresa tu PIN de 4 dígitos</p>
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
                className='pin-input disabled:opacity-50'
                autoComplete='off'
              />
            ))}
          </div>
        </div>

        {error && (
          <div className='mb-4 p-3 section-red rounded-xl'>
            <p className='text-rose-600 dark:text-rose-400 text-sm text-center font-medium'>{error}</p>
          </div>
        )}

        {loading && (
          <div className='text-center'>
            <div className='loader-ring h-8 w-8 mx-auto'></div>
            <p className='text-muted mt-3 text-sm'>Verificando...</p>
          </div>
        )}

        <div className='mt-8 pt-6 border-t border-[var(--border)]'>
          <div className='flex items-center justify-center gap-2 text-muted'>
            <ShieldCheck size={14} className='text-emerald-500' />
            <p className='text-xs'>Tus datos financieros están protegidos</p>
          </div>
        </div>
      </div>
    </div>
  );
}

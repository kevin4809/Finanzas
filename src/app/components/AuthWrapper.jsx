'use client';

import { useState, useEffect } from 'react';
import LoginPIN from './LoginPIN';
import { LogOut } from 'lucide-react';

export default function AuthWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setIsAuthenticated(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Mostrar loading mientras verifica
  if (isChecking) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent'></div>
          <p className='text-white mt-4 text-lg'>Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Mostrar login si no está autenticado
  if (!isAuthenticated) {
    return <LoginPIN onLoginSuccess={handleLoginSuccess} />;
  }

  // Mostrar la aplicación con botón de logout
  return (
    <div>
      <div className='bg-gray-800 text-white px-4 py-2 flex justify-between items-center'>
        <h1 className='text-sm font-semibold'>Control Financiero</h1>
        <button
          onClick={handleLogout}
          className='flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg transition text-sm'
          title='Cerrar sesión'
        >
          <LogOut size={16} />
          Salir
        </button>
      </div>
      {children}
    </div>
  );
}

'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className='p-2.5 rounded-xl backdrop-blur-xl transition-all duration-200 hover:scale-105'
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        color: 'var(--foreground)',
      }}
      title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

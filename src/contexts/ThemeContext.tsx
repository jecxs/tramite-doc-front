'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { THEME } from '@/lib/constants';

interface ThemeContextType {
  theme: THEME;
  toggleTheme: () => void;
  setTheme: (theme: THEME) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<THEME>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as THEME | null;
      return saved || THEME.DARK;
    }
    return THEME.DARK;
  });

  // Aplicar tema al documento
  useEffect(() => {
    const root = document.documentElement;

    // Remover la clase anterior
    root.classList.remove(THEME.LIGHT, THEME.DARK);

    // Agregar la clase del tema actual
    root.classList.add(theme);

    // Guardar en localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === THEME.DARK ? THEME.LIGHT : THEME.DARK));
  };

  const setTheme = (newTheme: THEME) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return context;
}

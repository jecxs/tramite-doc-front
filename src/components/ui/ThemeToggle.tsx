'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { THEME } from '@/lib/constants';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className='relative p-2 rounded-lg hover:bg-slate-700/50 dark:hover:bg-slate-700/50 transition-colors'
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label='Cambiar tema'
    >
      <div className='relative w-5 h-5'>
        <motion.div
          initial={false}
          animate={{
            scale: theme === THEME.DARK ? 1 : 0,
            rotate: theme === THEME.DARK ? 0 : 180,
            opacity: theme === THEME.DARK ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className='absolute inset-0'
        >
          <Moon className='w-5 h-5 text-slate-300' />
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            scale: theme === THEME.LIGHT ? 1 : 0,
            rotate: theme === THEME.LIGHT ? 0 : -180,
            opacity: theme === THEME.LIGHT ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className='absolute inset-0'
        >
          <Sun className='w-5 h-5 text-amber-500' />
        </motion.div>
      </div>
    </motion.button>
  );
}

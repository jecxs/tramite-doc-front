'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
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
            scale: theme === 'dark' ? 1 : 0,
            rotate: theme === 'dark' ? 0 : 180,
            opacity: theme === 'dark' ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className='absolute inset-0'
        >
          <Moon className='w-5 h-5 text-slate-300' />
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            scale: theme === 'light' ? 1 : 0,
            rotate: theme === 'light' ? 0 : -180,
            opacity: theme === 'light' ? 1 : 0,
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

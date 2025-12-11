'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className='relative p-2 rounded-lg hover:bg-slate-700/50 dark:hover:bg-slate-700/50 transition-colors'
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label='Cambiar tema'
    >
      <div className='relative w-5 h-5'>
        <div className='absolute inset-0 transition-all duration-200 opacity-100 scale-100 rotate-0 dark:opacity-0 dark:scale-0 dark:rotate-180'>
          <Sun className='w-5 h-5 text-amber-500' />
        </div>
        <div className='absolute inset-0 transition-all duration-200 opacity-0 scale-0 rotate-180 dark:opacity-100 dark:scale-100 dark:rotate-0'>
          <Moon className='w-5 h-5 text-slate-300' />
        </div>
      </div>
    </motion.button>
  );
}

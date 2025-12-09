'use client';

import { User, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

type SendMode = 'individual' | 'bulk' | 'auto-lote';

interface ModeSelectorProps {
  currentMode: SendMode;
  onModeChange: (mode: SendMode) => void;
}

const modes = [
  {
    id: 'individual' as SendMode,
    icon: User,
    title: 'Envío Individual',
    description: 'Enviar a un solo trabajador',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    borderColor: 'border-blue-500/30',
    iconBg: 'bg-blue-500/20',
  },
  {
    id: 'bulk' as SendMode,
    icon: Users,
    title: 'Envío Masivo',
    description: 'Mismo documento a múltiples trabajadores',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/10 to-pink-500/10',
    borderColor: 'border-purple-500/30',
    iconBg: 'bg-purple-500/20',
  },
  {
    id: 'auto-lote' as SendMode,
    icon: Zap,
    title: 'Envío Automático',
    description: 'Detección por DNI en nombres de archivos',
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-500/10 to-orange-500/10',
    borderColor: 'border-amber-500/30',
    iconBg: 'bg-amber-500/20',
  },
];

export default function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <div className='h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent' />
        <h2 className='text-lg font-semibold text-foreground/80'>Seleccione el modo de envío</h2>
        <div className='h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent' />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {modes.map((mode, index) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;

          return (
            <motion.button
              // 1. Eliminamos el style hardcoded backgroundColor
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onModeChange(mode.id)}
              className={`
                relative group p-6 rounded-2xl border-2 transition-all duration-300 text-left w-full

                ${
                isActive
                  ? `bg-gradient-to-br ${mode.bgGradient} ${mode.borderColor} shadow-lg`
                  // 2. Usamos bg-card para el fondo normal y border-border
                  : 'bg-card border-border hover:border-primary/30 hover:bg-accent/50 shadow-sm'
              }
              `}
            >

              {/* Indicador de activo */}
              {isActive && (
                <motion.div
                  layoutId='activeMode'
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${mode.gradient} opacity-5`}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              <div className='relative z-10'>
                {/* Icono */}
                <div
                  className={`
                  w-12 h-12 rounded-xl mb-4 flex items-center justify-center
                  ${isActive ? mode.iconBg : 'bg-secondary text-muted-foreground'}
                  transition-colors duration-300
                `}
                >
                  <Icon
                    className={`
                    w-6 h-6 transition-colors duration-300
                    ${isActive ? `text-${mode.gradient.split('-')[1]}-400` : 'text-muted-foreground group-hover:text-foreground'}
                  `}
                  />
                </div>

                {/* Título - Cambiamos text-slate-300 por text-foreground */}
                <h3
                  className={`
                  text-lg font-semibold mb-2 transition-colors duration-300
                  ${isActive ? 'text-primary' : 'text-foreground group-hover:text-primary'}
                `}
                >
                  {mode.title}
                </h3>

                {/* Descripción - Cambiamos text-slate-500 por text-muted-foreground */}
                <p
                  className={`
                  text-sm transition-colors duration-300
                  ${isActive ? 'text-foreground/70' : 'text-muted-foreground group-hover:text-foreground/70'}
                `}
                >
                  {mode.description}
                </p>

                {/* Badge de seleccionado */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className='absolute top-4 right-4'
                  >
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${mode.gradient}`}>
                      <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`w-full h-full rounded-full bg-gradient-to-r ${mode.gradient} opacity-50`}
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

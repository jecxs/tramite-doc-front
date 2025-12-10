// src/components/tramites/detalle/HistorialTramite.tsx
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
  Send,
  Eye,
  FileCheck,
  PenTool,
  MessageSquare,
  XCircle,
  RefreshCw,
  History,
  ArrowRight,
} from 'lucide-react';
import ExportarHistorialButton from '@/components/tramites/ExportarHistorialButton';
import { PROCEDURE_STATE_LABELS } from '@/lib/constants';
import { Procedure } from '@/types';

interface HistorialTramiteProps {
  procedure: Procedure;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function HistorialTramite({
                                           procedure,
                                           isLoading,
                                           onRefresh,
                                         }: HistorialTramiteProps) {
  const getAccionConfig = (accion: string) => {
    const configs = {
      CREACION: {
        icon: Send,
        color: 'from-blue-500 to-cyan-500',
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        border: 'border-blue-200 dark:border-blue-800/50',
        text: 'text-blue-700 dark:text-blue-300',
        dot: 'bg-blue-500',
      },
      APERTURA: {
        icon: Eye,
        color: 'from-purple-500 to-pink-500',
        bg: 'bg-purple-50 dark:bg-purple-950/30',
        border: 'border-purple-200 dark:border-purple-800/50',
        text: 'text-purple-700 dark:text-purple-300',
        dot: 'bg-purple-500',
      },
      LECTURA: {
        icon: FileCheck,
        color: 'from-indigo-500 to-blue-500',
        bg: 'bg-indigo-50 dark:bg-indigo-950/30',
        border: 'border-indigo-200 dark:border-indigo-800/50',
        text: 'text-indigo-700 dark:text-indigo-300',
        dot: 'bg-indigo-500',
      },
      FIRMA: {
        icon: PenTool,
        color: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        border: 'border-emerald-200 dark:border-emerald-800/50',
        text: 'text-emerald-700 dark:text-emerald-300',
        dot: 'bg-emerald-500',
      },
      OBSERVACION: {
        icon: MessageSquare,
        color: 'from-orange-500 to-amber-500',
        bg: 'bg-orange-50 dark:bg-orange-950/30',
        border: 'border-orange-200 dark:border-orange-800/50',
        text: 'text-orange-700 dark:text-orange-300',
        dot: 'bg-orange-500',
      },
      ANULACION: {
        icon: XCircle,
        color: 'from-red-500 to-rose-500',
        bg: 'bg-red-50 dark:bg-red-950/30',
        border: 'border-red-200 dark:border-red-800/50',
        text: 'text-red-700 dark:text-red-300',
        dot: 'bg-red-500',
      },
      REENVIO: {
        icon: RefreshCw,
        color: 'from-amber-500 to-yellow-500',
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        border: 'border-amber-200 dark:border-amber-800/50',
        text: 'text-amber-700 dark:text-amber-300',
        dot: 'bg-amber-500',
      },
    };

    const defaultConfig = {
      icon: History,
      color: 'from-slate-500 to-gray-500',
      bg: 'bg-slate-50 dark:bg-slate-950/30',
      border: 'border-slate-200 dark:border-slate-800/50',
      text: 'text-slate-700 dark:text-slate-300',
      dot: 'bg-slate-500',
    };

    return configs[accion as keyof typeof configs] || defaultConfig;
  };

  return (
    <div className='max-w-4xl mx-auto px-4 py-6'>
      {/* Header Minimalista */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex items-center justify-between mb-8'
      >
        <div>
          <h2 className='text-xl font-semibold text-slate-900 dark:text-white'>
            Historial del Trámite
          </h2>
          <p className='text-sm text-slate-500 dark:text-slate-400 mt-0.5'>
            Seguimiento de acciones realizadas
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <ExportarHistorialButton
            procedure={procedure}
            variant='outline'
            size='sm'
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            disabled={isLoading}
            className='p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors disabled:opacity-50'
            title='Actualizar'
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* Timeline */}
      {!procedure.historial || procedure.historial.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='text-center py-16'
        >
          <div className='w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4'>
            <History className='w-8 h-8 text-slate-400 dark:text-slate-600' />
          </div>
          <p className='text-slate-600 dark:text-slate-400 text-sm'>
            No hay historial disponible
          </p>
        </motion.div>
      ) : (
        <div className='relative'>
          {/* Línea vertical */}
          <div className='absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800' />

          <div className='space-y-4'>
            {procedure.historial.map((item, index) => {
              const config = getAccionConfig(item.accion);
              const Icon = config.icon;

              return (
                <motion.div
                  key={item.id_historial}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className='relative pl-16 group'
                >
                  {/* Punto timeline */}
                  <div className={`absolute left-4 top-3 w-5 h-5 rounded-full ${config.dot} ring-4 ring-white dark:ring-slate-900 z-10`} />

                  {/* Card */}
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden transition-all hover:shadow-md dark:hover:shadow-none`}
                  >
                    <div className='p-4'>
                      {/* Header con icono y fecha */}
                      <div className='flex items-start gap-3 mb-3'>
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <Icon className='w-4 h-4 text-white' />
                        </div>

                        <div className='flex-1 min-w-0'>
                          <div className='flex items-start justify-between gap-2'>
                            <h3 className={`text-sm font-semibold ${config.text} uppercase tracking-wide`}>
                              {item.accion.replace('_', ' ')}
                            </h3>
                            <time className='text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono'>
                              {format(new Date(item.fecha), 'dd/MM/yy HH:mm', { locale: es })}
                            </time>
                          </div>

                          {/* Detalle */}
                          {item.detalle && (
                            <p className='text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed'>
                              {item.detalle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Usuario */}
                      {item.usuario && (
                        <div className='flex items-center gap-2 mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50'>
                          <div className='w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center'>
                            <span className='text-xs font-medium text-white'>
                              {item.usuario.nombres.charAt(0)}{item.usuario.apellidos.charAt(0)}
                            </span>
                          </div>
                          <p className='text-xs text-slate-600 dark:text-slate-400 font-medium'>
                            {item.usuario.nombres} {item.usuario.apellidos}
                          </p>
                        </div>
                      )}

                      {/* Cambio de estados */}
                      {(item.estado_anterior || item.estado_nuevo) && (
                        <div className='flex items-center gap-2 mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50'>
                          {item.estado_anterior && (
                            <span className='text-xs px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md font-medium'>
                              {PROCEDURE_STATE_LABELS[item.estado_anterior as keyof typeof PROCEDURE_STATE_LABELS] || item.estado_anterior}
                            </span>
                          )}
                          {item.estado_anterior && item.estado_nuevo && (
                            <ArrowRight className='w-3.5 h-3.5 text-slate-400' />
                          )}
                          {item.estado_nuevo && (
                            <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${config.text} ${config.bg} border ${config.border}`}>
                              {PROCEDURE_STATE_LABELS[item.estado_nuevo as keyof typeof PROCEDURE_STATE_LABELS] || item.estado_nuevo}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

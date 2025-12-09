// src/components/tramites/detalle/HistorialTramite.tsx
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Send,
  Eye,
  FileCheck,
  PenTool,
  MessageSquare,
  XCircle,
  RefreshCw,
  History,
} from 'lucide-react';
import Button from '@/components/ui/Button';
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
  // Configuración unificada de acciones
  const getAccionConfig = (accion: string) => {
    const configs = {
      CREACION: {
        icon: <Send className='w-4 h-4' />,
        iconBox: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-gradient-to-br dark:from-blue-500/20 dark:to-blue-600/20 dark:border-blue-500/30 dark:text-blue-700',
        dot: 'bg-blue-600 dark:bg-blue-400',
        activeCardBg: 'bg-blue-50/80 border-blue-200 dark:bg-blue-500/5 dark:border-blue-500/30',
        badgeState: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
      },
      APERTURA: {
        icon: <Eye className='w-4 h-4' />,
        iconBox: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-gradient-to-br dark:from-purple-500/20 dark:to-purple-600/20 dark:border-purple-500/30 dark:text-purple-700',
        dot: 'bg-purple-600 dark:bg-purple-400',
        activeCardBg: 'bg-purple-50/80 border-purple-200 dark:bg-purple-500/5 dark:border-purple-500/30',
        badgeState: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
      },
      LECTURA: {
        icon: <FileCheck className='w-4 h-4' />,
        iconBox: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-gradient-to-br dark:from-indigo-500/20 dark:to-indigo-600/20 dark:border-indigo-500/30 dark:text-indigo-700',
        dot: 'bg-indigo-600 dark:bg-indigo-400',
        activeCardBg: 'bg-indigo-50/80 border-indigo-200 dark:bg-indigo-500/5 dark:border-indigo-500/30',
        badgeState: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30',
      },
      FIRMA: {
        icon: <PenTool className='w-4 h-4' />,
        iconBox: 'bg-green-100 text-green-700 border-green-200 dark:bg-gradient-to-br dark:from-green-500/20 dark:to-green-600/20 dark:border-green-500/30 dark:text-green-700',
        dot: 'bg-green-600 dark:bg-green-400',
        activeCardBg: 'bg-green-50/80 border-green-200 dark:bg-green-500/5 dark:border-green-500/30',
        badgeState: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30',
      },
      OBSERVACION: {
        icon: <MessageSquare className='w-4 h-4' />,
        iconBox: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-gradient-to-br dark:from-orange-500/20 dark:to-orange-600/20 dark:border-orange-500/30 dark:text-orange-300',
        dot: 'bg-orange-600 dark:bg-orange-400',
        activeCardBg: 'bg-orange-50/80 border-orange-200 dark:bg-orange-500/5 dark:border-orange-500/30',
        badgeState: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30',
      },
      ANULACION: {
        icon: <XCircle className='w-4 h-4' />,
        iconBox: 'bg-red-100 text-red-800 border-red-200 dark:bg-gradient-to-br dark:from-red-500/20 dark:to-red-600/20 dark:border-red-500/30 dark:text-red-700',
        dot: 'bg-red-600 dark:bg-red-400',
        activeCardBg: 'bg-red-50/80 border-red-200 dark:bg-red-500/5 dark:border-red-500/30',
        badgeState: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30',
      },
      REENVIO: {
        icon: <RefreshCw className='w-4 h-4' />,
        iconBox: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-gradient-to-br dark:from-yellow-500/20 dark:to-yellow-600/20 dark:border-yellow-500/30 dark:text-yellow-700',
        dot: 'bg-yellow-600 dark:bg-yellow-400',
        activeCardBg: 'bg-yellow-50/80 border-yellow-200 dark:bg-yellow-500/5 dark:border-yellow-500/30',
        badgeState: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30',
      },
    };
    const defaultConfig = {
      icon: <History className='w-4 h-4' />,
      iconBox: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gradient-to-br dark:from-gray-500/20 dark:to-gray-600/20 dark:border-gray-500/30 dark:text-gray-700',
      dot: 'bg-gray-500 dark:bg-gray-400',
      activeCardBg: 'bg-gray-50/80 border-gray-200 dark:bg-gray-500/5 dark:border-gray-500/30',
      badgeState: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/30',
    };

    return configs[accion as keyof typeof configs] || defaultConfig;
  };

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          {/* Adaptado para texto oscuro en light mode */}
          <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-1'>Historial del Trámite</h2>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Seguimiento completo de todas las acciones realizadas
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <ExportarHistorialButton
            procedure={procedure}
            variant='outline'
            size='sm'
            className='hover:bg-gray-100 dark:hover:bg-slate-700/50 border-gray-200 dark:border-slate-700/50 text-gray-700 dark:text-gray-300'
          />
          <button
            onClick={onRefresh}
            disabled={isLoading}
            // Botón actualizado: fondo blanco y borde gris en light, oscuro en dark. Añadida sombra suave.
            className='group w-9 h-9 rounded-xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 shadow-sm dark:shadow-none flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            title='Actualizar historial'
          >
            <RefreshCw className={`w-4 h-4 transition-transform ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          </button>
        </div>
      </div>

      {/* Historial Items */}
      {!procedure.historial || procedure.historial.length === 0 ? (
        <div className='text-center py-16'>
          {/* Icono de estado vacío adaptado */}
          <div className='w-20 h-20 rounded-2xl bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 flex items-center justify-center mx-auto mb-5'>
            <History className='w-10 h-10 text-gray-400 dark:text-gray-600' />
          </div>
          <p className='text-base font-medium text-gray-900 dark:text-gray-400 mb-2'>
            No hay historial disponible
          </p>
          <p className='text-sm text-gray-500 dark:text-gray-500'>
            Las acciones del trámite aparecerán aquí
          </p>
        </div>
      ) : (
        <div className='relative'>
          {/* Línea vertical del timeline */}
          {/* En light mode es una línea gris sólida sutil. En dark mode mantenemos el gradiente si te gusta, o lo hacemos un gris oscuro sólido. */}
          <div className='absolute left-[21px] top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-slate-700' />

          <div className='space-y-4'>
            {procedure.historial.map((item, index) => {
              const config = getAccionConfig(item.accion);
              const isFirst = index === 0;

              return (
                <div
                  key={item.id_historial}
                  className='relative group'
                >
                  {/* Punto en la línea de tiempo */}
                  <div className={`absolute left-[17px] top-[18px] w-2.5 h-2.5 rounded-full ${config.dot} ring-4 ring-background z-10`} />

                  {/* Contenido */}
                  <div className='ml-12'>
                    {/* Tarjeta Principal */}
                    <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
                      isFirst
                        ? `${config.activeCardBg} shadow-sm dark:shadow-none`
                        : 'bg-white dark:bg-slate-800/30 border-gray-200 dark:border-slate-700/30 hover:bg-gray-50 dark:hover:bg-slate-800/50 shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-none'
                    }`}>
                      <div className='p-5'>
                        <div className='flex gap-4'>
                          {/* Icono Box - Usa las clases configuradas arriba */}
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border backdrop-blur-sm ${config.iconBox}`}>
                            {config.icon}
                          </div>

                          {/* Contenido principal */}
                          <div className='flex-1 min-w-0'>
                            {/* Header con título y fecha */}
                            <div className='flex items-start justify-between gap-3 mb-3'>
                              <h3 className='text-sm font-bold text-gray-900 dark:text-white'>
                                {item.accion.charAt(0) + item.accion.slice(1).toLowerCase().replace('_', ' ')}
                              </h3>
                              <time className='text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap'>
                                {format(new Date(item.fecha), 'dd/MM/yy HH:mm', { locale: es })}
                              </time>
                            </div>

                            {/* Detalle - Texto legible en ambos modos */}
                            {item.detalle && (
                              <p className='text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed'>
                                {item.detalle}
                              </p>
                            )}

                            {/* Usuario */}
                            {item.usuario && (
                              <div className='flex items-center gap-2 mb-3'>
                                {/* Avatar bg adaptado */}
                                <div className='w-6 h-6 rounded-lg bg-gray-100 dark:bg-slate-700/50 flex items-center justify-center'>
                                  <span className='text-xs font-semibold text-gray-600 dark:text-gray-400'>
                                    {item.usuario.nombres.charAt(0)}{item.usuario.apellidos.charAt(0)}
                                  </span>
                                </div>
                                <p className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                                  {item.usuario.nombres} {item.usuario.apellidos}
                                </p>
                              </div>
                            )}

                            {/* Cambio de estados (Footer de la tarjeta) */}
                            {(item.estado_anterior || item.estado_nuevo) && (
                              <div className='flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-slate-700/50'>
                                {item.estado_anterior && (
                                  <span className='text-xs px-3 py-1.5 bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-700/50 dark:text-gray-300 rounded-lg border dark:border-slate-600/50 font-medium'>
                                    {PROCEDURE_STATE_LABELS[
                                      item.estado_anterior as keyof typeof PROCEDURE_STATE_LABELS
                                      ] || item.estado_anterior}
                                  </span>
                                )}
                                {item.estado_anterior && item.estado_nuevo && (
                                  <svg className='w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                                  </svg>
                                )}
                                {item.estado_nuevo && (
                                  <span className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${config.badgeState}`}>
                                    {PROCEDURE_STATE_LABELS[
                                      item.estado_nuevo as keyof typeof PROCEDURE_STATE_LABELS
                                      ] || item.estado_nuevo}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

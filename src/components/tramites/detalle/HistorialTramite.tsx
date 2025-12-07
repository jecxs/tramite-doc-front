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
        gradient: 'from-blue-500/20 to-blue-600/20',
        border: 'border-blue-500/30',
        text: 'text-blue-300',
        bg: 'bg-blue-500/5',
      },
      APERTURA: {
        icon: <Eye className='w-4 h-4' />,
        gradient: 'from-purple-500/20 to-purple-600/20',
        border: 'border-purple-500/30',
        text: 'text-purple-300',
        bg: 'bg-purple-500/5',
      },
      LECTURA: {
        icon: <FileCheck className='w-4 h-4' />,
        gradient: 'from-indigo-500/20 to-indigo-600/20',
        border: 'border-indigo-500/30',
        text: 'text-indigo-300',
        bg: 'bg-indigo-500/5',
      },
      FIRMA: {
        icon: <PenTool className='w-4 h-4' />,
        gradient: 'from-green-500/20 to-green-600/20',
        border: 'border-green-500/30',
        text: 'text-green-300',
        bg: 'bg-green-500/5',
      },
      OBSERVACION: {
        icon: <MessageSquare className='w-4 h-4' />,
        gradient: 'from-orange-500/20 to-orange-600/20',
        border: 'border-orange-500/30',
        text: 'text-orange-300',
        bg: 'bg-orange-500/5',
      },
      ANULACION: {
        icon: <XCircle className='w-4 h-4' />,
        gradient: 'from-red-500/20 to-red-600/20',
        border: 'border-red-500/30',
        text: 'text-red-300',
        bg: 'bg-red-500/5',
      },
      REENVIO: {
        icon: <RefreshCw className='w-4 h-4' />,
        gradient: 'from-yellow-500/20 to-yellow-600/20',
        border: 'border-yellow-500/30',
        text: 'text-yellow-300',
        bg: 'bg-yellow-500/5',
      },
    };
    return configs[accion as keyof typeof configs] || {
      icon: <History className='w-4 h-4' />,
      gradient: 'from-gray-500/20 to-gray-600/20',
      border: 'border-gray-500/30',
      text: 'text-gray-300',
      bg: 'bg-gray-500/5',
    };
  };

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h2 className='text-xl font-bold text-white mb-1'>Historial del Trámite</h2>
          <p className='text-sm text-gray-400'>
            Seguimiento completo de todas las acciones realizadas
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <ExportarHistorialButton
            procedure={procedure}
            variant='ghost'
            size='sm'
            className='hover:bg-slate-700/50'
          />
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className='group w-9 h-9 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            title='Actualizar historial'
          >
            <RefreshCw className={`w-4 h-4 transition-transform ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          </button>
        </div>
      </div>

      {/* Historial Items */}
      {!procedure.historial || procedure.historial.length === 0 ? (
        <div className='text-center py-16'>
          <div className='w-20 h-20 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mx-auto mb-5'>
            <History className='w-10 h-10 text-gray-600' />
          </div>
          <p className='text-base font-medium text-gray-400 mb-2'>
            No hay historial disponible
          </p>
          <p className='text-sm text-gray-500'>
            Las acciones del trámite aparecerán aquí
          </p>
        </div>
      ) : (
        <div className='relative'>
          {/* Línea vertical del timeline */}
          <div className='absolute left-[21px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700' />

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
                  <div className={`absolute left-[17px] top-[18px] w-2.5 h-2.5 rounded-full ${config.text} ring-4 ring-slate-900 z-10`} />

                  {/* Contenido */}
                  <div className='ml-12'>
                    <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
                      isFirst
                        ? `${config.bg} border-${config.border} shadow-lg`
                        : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-700/50'
                    }`}>
                      <div className='p-5'>
                        <div className='flex gap-4'>
                          {/* Icono */}
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br border backdrop-blur-sm ${config.gradient} ${config.border} ${config.text}`}>
                            {config.icon}
                          </div>

                          {/* Contenido principal */}
                          <div className='flex-1 min-w-0'>
                            {/* Header con título y fecha */}
                            <div className='flex items-start justify-between gap-3 mb-3'>
                              <h3 className='text-sm font-bold text-white'>
                                {item.accion.charAt(0) + item.accion.slice(1).toLowerCase().replace('_', ' ')}
                              </h3>
                              <time className='text-xs font-medium text-gray-400 whitespace-nowrap'>
                                {format(new Date(item.fecha), 'dd/MM/yy HH:mm', { locale: es })}
                              </time>
                            </div>

                            {/* Detalle */}
                            {item.detalle && (
                              <p className='text-sm text-gray-300 mb-3 leading-relaxed'>
                                {item.detalle}
                              </p>
                            )}

                            {/* Usuario */}
                            {item.usuario && (
                              <div className='flex items-center gap-2 mb-3'>
                                <div className='w-6 h-6 rounded-lg bg-slate-700/50 flex items-center justify-center'>
                                  <span className='text-xs font-semibold text-gray-400'>
                                    {item.usuario.nombres.charAt(0)}{item.usuario.apellidos.charAt(0)}
                                  </span>
                                </div>
                                <p className='text-xs font-medium text-gray-400'>
                                  {item.usuario.nombres} {item.usuario.apellidos}
                                </p>
                              </div>
                            )}

                            {/* Cambio de estados */}
                            {(item.estado_anterior || item.estado_nuevo) && (
                              <div className='flex items-center gap-2 pt-3 border-t border-slate-700/50'>
                                {item.estado_anterior && (
                                  <span className='text-xs px-3 py-1.5 bg-slate-700/50 text-gray-300 rounded-lg border border-slate-600/50 font-medium'>
                                    {PROCEDURE_STATE_LABELS[
                                      item.estado_anterior as keyof typeof PROCEDURE_STATE_LABELS
                                      ] || item.estado_anterior}
                                  </span>
                                )}
                                {item.estado_anterior && item.estado_nuevo && (
                                  <svg className='w-4 h-4 text-gray-500 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                                  </svg>
                                )}
                                {item.estado_nuevo && (
                                  <span className='text-xs px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 rounded-lg border border-blue-500/30 font-medium'>
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

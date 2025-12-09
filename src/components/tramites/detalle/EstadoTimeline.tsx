// src/components/tramites/detalle/EstadoTimeline.tsx
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Send, Eye, FileCheck, PenTool, XCircle, Clock } from 'lucide-react';
import { ProcedureStateBadge } from '@/components/ui/Badge';
import { PROCEDURE_STATE_LABELS } from '@/lib/constants';
import { Procedure } from '@/types';

interface EstadoTimelineProps {
  procedure: Procedure;
}

export default function EstadoTimeline({ procedure }: EstadoTimelineProps) {
  // Colores consistentes con HistorialTramite
  const getEstadoConfig = (estado: string) => {
    const configs = {
      ENVIADO: {
        icon: <Send className='w-5 h-5' />,
        gradient: 'from-blue-500 to-blue-600',
        bgActive: 'bg-gradient-to-br from-blue-500/20 to-blue-600/20',
        border: 'border-blue-500/30',
        text: 'text-blue-300',
        shadow: 'shadow-blue-500/20',
        line: 'from-blue-500 to-purple-500',
      },
      ABIERTO: {
        icon: <Eye className='w-5 h-5' />,
        gradient: 'from-purple-500 to-purple-600',
        bgActive: 'bg-gradient-to-br from-purple-500/20 to-purple-600/20',
        border: 'border-purple-500/30',
        text: 'text-purple-300',
        shadow: 'shadow-purple-500/20',
        line: 'from-purple-500 to-indigo-500',
      },
      LEIDO: {
        icon: <FileCheck className='w-5 h-5' />,
        gradient: 'from-indigo-500 to-indigo-600',
        bgActive: 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/20',
        border: 'border-indigo-500/30',
        text: 'text-indigo-300',
        shadow: 'shadow-indigo-500/20',
        line: 'from-indigo-500 to-green-500',
      },
      FIRMADO: {
        icon: <PenTool className='w-5 h-5' />,
        gradient: 'from-green-500 to-green-600',
        bgActive: 'bg-gradient-to-br from-green-500/20 to-green-600/20',
        border: 'border-green-500/30',
        text: 'text-green-300',
        shadow: 'shadow-green-500/20',
        line: 'from-green-500 to-emerald-500',
      },
      ANULADO: {
        icon: <XCircle className='w-5 h-5' />,
        gradient: 'from-red-500 to-red-600',
        bgActive: 'bg-gradient-to-br from-red-500/20 to-red-600/20',
        border: 'border-red-500/30',
        text: 'text-red-300',
        shadow: 'shadow-red-500/20',
        line: 'from-red-500 to-red-600',
      },
    };
    return configs[estado as keyof typeof configs] || configs.ENVIADO;
  };

  const TimelineStep = ({
    estado,
    label,
    fecha,
    isActive,
  }: {
    estado: string;
    label: string;
    fecha?: string;
    isActive: boolean;
  }) => {
    const config = getEstadoConfig(estado);

    return (
      <div className='flex flex-col items-center flex-1 min-w-[90px] relative'>
        {/* Icono */}
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 border backdrop-blur-sm ${
            isActive
              ? `${config.bgActive} ${config.border} ${config.text} shadow-lg ${config.shadow} scale-100`
              : 'bg-slate-800/30 border-slate-700/30 text-gray-600 scale-90'
          }`}
        >
          {config.icon}
        </div>

        {/* Label */}
        <p
          className={`text-xs font-semibold mt-3 transition-colors ${
            isActive ? 'text-white' : 'text-gray-500'
          }`}
        >
          {label}
        </p>

        {/* Fecha */}
        {fecha && (
          <p
            className={`text-xs mt-1 font-medium transition-colors ${
              isActive ? config.text : 'text-gray-600'
            }`}
          >
            {format(new Date(fecha), 'dd/MM/yy HH:mm', { locale: es })}
          </p>
        )}
      </div>
    );
  };

  const estadoConfig = getEstadoConfig(procedure.estado);

  return (
    <div className='p-6 space-y-8'>
      {/* Estado Actual - Rediseñado más minimalista */}
      <div className='relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-r from-slate-800/40 via-slate-700/20 to-slate-800/40 rounded-2xl blur-xl' />
        <div className='relative flex items-center justify-between p-6 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50'>
          <div className='flex items-center gap-5'>
            <div
              className={`w-14 h-14 rounded-xl ${estadoConfig.bgActive} border ${estadoConfig.border} flex items-center justify-center shadow-lg ${estadoConfig.shadow}`}
            >
              {estadoConfig.icon}
            </div>
            <div>
              <p className='text-xs text-gray-400 uppercase tracking-widest mb-1.5 font-medium'>
                Estado Actual
              </p>
              <p className='text-xl font-bold text-white'>
                {PROCEDURE_STATE_LABELS[procedure.estado]}
              </p>
            </div>
          </div>
          <ProcedureStateBadge estado={procedure.estado} />
        </div>
      </div>

      {/* Timeline Horizontal - Mejorado */}
      <div className='relative py-6 px-2'>
        <div className='flex items-center justify-between gap-3'>
          <TimelineStep
            estado='ENVIADO'
            label='Enviado'
            fecha={procedure.fecha_envio}
            isActive={!!procedure.fecha_envio}
          />

          <div className='relative flex-1 h-1.5 mx-2'>
            <div className='absolute inset-0 bg-slate-800/50 rounded-full' />
            <div
              className={`absolute inset-0 rounded-full transition-all duration-500 ${
                procedure.fecha_abierto
                  ? `bg-gradient-to-r ${getEstadoConfig('ENVIADO').line}`
                  : 'bg-transparent'
              }`}
              style={{
                width: procedure.fecha_abierto ? '100%' : '0%',
              }}
            />
          </div>

          <TimelineStep
            estado='ABIERTO'
            label='Abierto'
            fecha={procedure.fecha_abierto}
            isActive={!!procedure.fecha_abierto}
          />

          <div className='relative flex-1 h-1.5 mx-2'>
            <div className='absolute inset-0 bg-slate-800/50 rounded-full' />
            <div
              className={`absolute inset-0 rounded-full transition-all duration-500 ${
                procedure.fecha_leido
                  ? `bg-gradient-to-r ${getEstadoConfig('ABIERTO').line}`
                  : 'bg-transparent'
              }`}
              style={{
                width: procedure.fecha_leido ? '100%' : '0%',
              }}
            />
          </div>

          <TimelineStep
            estado='LEIDO'
            label='Leído'
            fecha={procedure.fecha_leido}
            isActive={!!procedure.fecha_leido}
          />

          {procedure.requiere_firma && (
            <>
              <div className='relative flex-1 h-1.5 mx-2'>
                <div className='absolute inset-0 bg-slate-800/50 rounded-full' />
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-500 ${
                    procedure.fecha_firmado
                      ? `bg-gradient-to-r ${getEstadoConfig('LEIDO').line}`
                      : 'bg-transparent'
                  }`}
                  style={{
                    width: procedure.fecha_firmado ? '100%' : '0%',
                  }}
                />
              </div>
              <TimelineStep
                estado='FIRMADO'
                label='Firmado'
                fecha={procedure.fecha_firmado}
                isActive={!!procedure.fecha_firmado}
              />
            </>
          )}
        </div>
      </div>

      {/* Alertas - Rediseñadas */}
      {procedure.estado === 'ANULADO' && (
        <div className='relative overflow-hidden rounded-2xl'>
          <div className='absolute inset-0 bg-gradient-to-r from-red-500/5 via-red-500/10 to-red-500/5' />
          <div className='relative flex items-start gap-4 p-5 bg-slate-800/40 backdrop-blur-sm border border-red-500/20 rounded-2xl'>
            <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center flex-shrink-0'>
              <XCircle className='w-6 h-6 text-red-400' />
            </div>
            <div className='flex-1 pt-1'>
              <p className='text-sm font-bold text-red-300 mb-1'>Trámite Anulado</p>
              {procedure.motivo_anulacion && (
                <p className='text-sm text-gray-300 leading-relaxed'>
                  {procedure.motivo_anulacion}
                </p>
              )}
              {procedure.fecha_anulado && (
                <p className='text-xs text-red-400/70 mt-3 font-medium'>
                  {format(
                    new Date(procedure.fecha_anulado),
                    "dd 'de' MMMM 'de' yyyy 'a las' HH:mm",
                    { locale: es },
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {procedure.requiere_firma && !procedure.firma && procedure.estado === 'LEIDO' && (
        <div className='relative overflow-hidden rounded-2xl'>
          <div className='absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-yellow-500/10 to-yellow-500/5' />
          <div className='relative flex items-start gap-4 p-5 bg-slate-800/40 backdrop-blur-sm border border-yellow-500/20 rounded-2xl'>
            <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0'>
              <Clock className='w-6 h-6 text-yellow-400' />
            </div>
            <div className='flex-1 pt-1'>
              <p className='text-sm font-bold text-yellow-300 mb-1'>Esperando firma electrónica</p>
              <p className='text-sm text-gray-300 leading-relaxed'>
                Este documento requiere la firma del trabajador para completar el trámite.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

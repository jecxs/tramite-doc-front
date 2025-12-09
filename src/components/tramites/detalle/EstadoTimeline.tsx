// src/components/tramites/detalle/EstadoTimeline.tsx
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Send, Eye, FileCheck, PenTool, XCircle, Clock } from 'lucide-react';
import { ProcedureStateBadge } from '@/components/ui/Badge';
import { PROCEDURE_STATE_LABELS, PROCEDURE_STATES } from '@/lib/constants';
import { Procedure } from '@/types';

interface EstadoTimelineProps {
  procedure: Procedure;
}
const getEstadoConfig = (estado: PROCEDURE_STATES) => {
  const configs = {
    ENVIADO: {
      icon: <Send className='w-5 h-5' />,
      bgActive: 'bg-blue-100 dark:bg-blue-500/20',
      border: 'border-blue-200 dark:border-blue-500/30',
      text: 'text-blue-700 dark:text-blue-300',
      subText: 'text-blue-600/80 dark:text-blue-300/70',
      shadow: 'shadow-blue-500/10 dark:shadow-blue-500/20',
      line: 'from-blue-500 to-purple-500',
    },
    ABIERTO: {
      icon: <Eye className='w-5 h-5' />,
      bgActive: 'bg-purple-100 dark:bg-purple-500/20',
      border: 'border-purple-200 dark:border-purple-500/30',
      text: 'text-purple-700 dark:text-purple-300',
      subText: 'text-purple-600/80 dark:text-purple-300/70',
      shadow: 'shadow-purple-500/10 dark:shadow-purple-500/20',
      line: 'from-purple-500 to-indigo-500',
    },
    LEIDO: {
      icon: <FileCheck className='w-5 h-5' />,
      bgActive: 'bg-indigo-100 dark:bg-indigo-500/20',
      border: 'border-indigo-200 dark:border-indigo-500/30',
      text: 'text-indigo-700 dark:text-indigo-300',
      subText: 'text-indigo-600/80 dark:text-indigo-300/70',
      shadow: 'shadow-indigo-500/10 dark:shadow-indigo-500/20',
      line: 'from-indigo-500 to-green-500',
    },
    FIRMADO: {
      icon: <PenTool className='w-5 h-5' />,
      bgActive: 'bg-emerald-100 dark:bg-green-500/20',
      border: 'border-emerald-200 dark:border-green-500/30',
      text: 'text-emerald-700 dark:text-green-300',
      subText: 'text-emerald-600/80 dark:text-green-300/70',
      shadow: 'shadow-emerald-500/10 dark:shadow-green-500/20',
      line: 'from-green-500 to-emerald-500',
    },
    ANULADO: {
      icon: <XCircle className='w-5 h-5' />,
      bgActive: 'bg-red-100 dark:bg-red-500/20',
      border: 'border-red-200 dark:border-red-500/30',
      text: 'text-red-700 dark:text-red-300',
      subText: 'text-red-600/80 dark:text-red-300/70',
      shadow: 'shadow-red-500/10 dark:shadow-red-500/20',
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
  estado: PROCEDURE_STATES;
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
            : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800/30 dark:border-slate-700/30 dark:text-slate-600 scale-90'
        }`}
      >
        {config.icon}
      </div>

      {/* Label */}
      <p
        className={`text-xs font-semibold mt-3 transition-colors ${
          isActive
            ? 'text-slate-900 dark:text-white'
            : 'text-slate-400 dark:text-slate-600'
        }`}
      >
        {label}
      </p>

      {/* Fecha */}
      {fecha && (
        <p
          className={`text-xs mt-1 font-medium transition-colors ${
            isActive ? config.subText : 'text-slate-400 dark:text-slate-600'
          }`}
        >
          {format(new Date(fecha), 'dd/MM/yy HH:mm', { locale: es })}
        </p>
      )}
    </div>
  );
};
export default function EstadoTimeline({ procedure }: EstadoTimelineProps) {


  const estadoConfig = getEstadoConfig(procedure.estado);

  return (
    <div className='p-6 space-y-8'>
      {/* Estado Actual - Rediseñado más minimalista */}
      <div className='relative overflow-hidden rounded-2xl'>
        <div className='absolute inset-0 bg-gradient-to-r from-slate-200/50 via-slate-100/50 to-slate-200/50 dark:from-slate-800/40 dark:via-slate-700/20 dark:to-slate-800/40 blur-xl opacity-50' />
        <div className='relative flex items-center justify-between p-6
                        bg-white/60 dark:bg-slate-800/50
                        backdrop-blur-xl
                        rounded-2xl
                        border border-slate-200/60 dark:border-slate-700/50
                        shadow-sm'>
          <div className='flex items-center gap-5'>
            <div
              className={`w-14 h-14 rounded-xl ${estadoConfig.bgActive} border ${estadoConfig.border} flex items-center justify-center shadow-lg ${estadoConfig.shadow}`}
            >
              {estadoConfig.icon}
            </div>
            <div>
              <p className='text-xs text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 font-medium'>
                Estado Actual
              </p>
              <p className='text-xl font-bold text-slate-900 dark:text-white'>
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
            estado={PROCEDURE_STATES.ENVIADO}
            label='Enviado'
            fecha={procedure.fecha_envio}
            isActive={!!procedure.fecha_envio}
          />

          <div className='relative flex-1 h-1.5 mx-2'>
            {/* Fondo de la línea (Inactivo) */}
            <div className='absolute inset-0 rounded-full bg-slate-100 dark:bg-slate-800/50' />
            {/* Línea de progreso (Activo) */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-500 ${
                procedure.fecha_abierto
                  ? `bg-gradient-to-r ${getEstadoConfig(PROCEDURE_STATES.ENVIADO).line}`
                  : 'bg-transparent'
              }`}
              style={{
                width: procedure.fecha_abierto ? '100%' : '0%',
              }}
            />
          </div>

          <TimelineStep
            estado={PROCEDURE_STATES.ABIERTO}
            label='Abierto'
            fecha={procedure.fecha_abierto}
            isActive={!!procedure.fecha_abierto}
          />

          <div className='relative flex-1 h-1.5 mx-2'>
            <div className='absolute inset-0 rounded-full bg-slate-100 dark:bg-slate-800/50' />
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
            estado={PROCEDURE_STATES.LEIDO}
            label='Leído'
            fecha={procedure.fecha_leido}
            isActive={!!procedure.fecha_leido}
          />

          {procedure.requiere_firma && (
            <>
              <div className='relative flex-1 h-1.5 mx-2'>
                <div className='absolute inset-0 rounded-full bg-slate-100 dark:bg-slate-800/50' />
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
                estado={PROCEDURE_STATES.FIRMADO}
                label='Firmado'
                fecha={procedure.fecha_firmado}
                isActive={!!procedure.fecha_firmado}
              />
            </>
          )}
        </div>
      </div>

      {/* Alertas - Rediseñadas */}
      {procedure.estado === PROCEDURE_STATES.ANULADO && (
        <div className='relative overflow-hidden rounded-2xl'>
          <div className='absolute inset-0 bg-red-50/50 dark:bg-gradient-to-r dark:from-red-500/5 dark:via-red-500/10 dark:to-red-500/5' />
          <div className='relative flex items-start gap-4 p-5
                          bg-red-50/50 dark:bg-slate-800/40
                          backdrop-blur-sm
                          border border-red-200 dark:border-red-500/20
                          rounded-2xl'>
            <div className='w-12 h-12 rounded-xl bg-red-100 border border-red-200 dark:bg-gradient-to-br dark:from-red-500/20 dark:to-red-600/20 dark:border-red-500/30 flex items-center justify-center flex-shrink-0'>
              <XCircle className='w-6 h-6 text-red-600 dark:text-red-400' />
            </div>
            <div className='flex-1 pt-1'>
              <p className='text-sm font-bold text-red-800 dark:text-red-300 mb-1'>Trámite Anulado</p>
              {procedure.motivo_anulacion && (
                <p className='text-sm text-red-700 dark:text-gray-300 leading-relaxed'>
                  {procedure.motivo_anulacion}
                </p>
              )}
              {procedure.fecha_anulado && (
                <p className='text-xs text-red-500 dark:text-red-400/70 mt-3 font-medium'>
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

      {procedure.requiere_firma &&
        !procedure.firma &&
        procedure.estado === PROCEDURE_STATES.LEIDO && (
          <div className='relative overflow-hidden rounded-2xl'>
            <div className='absolute inset-0 bg-yellow-50/50 dark:bg-gradient-to-r dark:from-yellow-500/5 dark:via-yellow-500/10 dark:to-yellow-500/5' />
            <div className='relative flex items-start gap-4 p-5
                            bg-yellow-50/50 dark:bg-slate-800/40
                            backdrop-blur-sm
                            border border-yellow-200 dark:border-yellow-500/20
                            rounded-2xl'>
              <div className='w-12 h-12 rounded-xl bg-yellow-100 border border-yellow-200 dark:bg-gradient-to-br dark:from-yellow-500/20 dark:to-yellow-600/20 dark:border-yellow-500/30 flex items-center justify-center flex-shrink-0'>
                <Clock className='w-6 h-6 text-yellow-600 dark:text-yellow-400' />
              </div>
              <div className='flex-1 pt-1'>
                <p className='text-sm font-bold text-yellow-800 dark:text-yellow-300 mb-1'>
                  Esperando firma electrónica
                </p>
                <p className='text-sm text-yellow-700 dark:text-gray-300 leading-relaxed'>
                  Este documento requiere la firma del trabajador para completar el trámite.
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

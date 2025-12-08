'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {Calendar, Clock, EyeIcon, FileCheck, SendIcon, Shield} from 'lucide-react';
import { Procedure } from '@/types';

interface FechasInfoProps {
  procedure: Procedure;
}

export default function FechasInfo({ procedure }: FechasInfoProps) {
  const fechas = [
    {
      icon: <SendIcon className='w-4 h-4 text-blue-400' />,
      label: 'Enviado',
      fecha: procedure.fecha_envio,
      show: true,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      icon: <EyeIcon className='w-4 h-4 text-purple-400' />,
      label: 'Abierto',
      fecha: procedure.fecha_abierto,
      show: !!procedure.fecha_abierto,
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      icon: <FileCheck className='w-4 h-4 text-indigo-400' />,
      label: 'Leído',
      fecha: procedure.fecha_leido,
      show: !!procedure.fecha_leido,
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
    },
    {
      icon: <Shield className='w-4 h-4 text-green-400' />,
      label: 'Firmado',
      fecha: procedure.fecha_firmado,
      show: !!procedure.fecha_firmado,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
  ];

  return (
    <div style={{ backgroundColor: '#272d34' }} className='rounded-2xl p-6 shadow-2xl border border-slate-700/50'>
      <h3 className='text-lg font-semibold text-white mb-4'>Fechas</h3>

      <div className='space-y-3'>
        {fechas
          .filter((f) => f.show)
          .map((fecha, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg border ${fecha.bgColor} ${fecha.borderColor}`}
            >
              <div className='flex-shrink-0'>
                {fecha.icon}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-xs text-slate-400 mb-0.5'>{fecha.label}</p>
                <p className='text-sm text-white font-medium'>
                  {fecha.fecha &&
                    format(new Date(fecha.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

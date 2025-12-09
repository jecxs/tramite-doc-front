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
      // Usamos un tono más fuerte para claro (600) y el original para oscuro (400)
      icon: <SendIcon className='w-4 h-4 text-blue-600 dark:text-blue-400' />,
      label: 'Enviado',
      fecha: procedure.fecha_envio,
      show: true,
      // Fondos y bordes más sutiles
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      borderColor: 'border-blue-200 dark:border-blue-500/20',
    },
    {
      icon: <EyeIcon className='w-4 h-4 text-purple-600 dark:text-purple-400' />,
      label: 'Abierto',
      fecha: procedure.fecha_abierto,
      show: !!procedure.fecha_abierto,
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      borderColor: 'border-purple-200 dark:border-purple-500/20',
    },
    {
      icon: <FileCheck className='w-4 h-4 text-indigo-600 dark:text-indigo-400' />,
      label: 'Leído',
      fecha: procedure.fecha_leido,
      show: !!procedure.fecha_leido,
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
      borderColor: 'border-indigo-200 dark:border-indigo-500/20',
    },
    {
      icon: <Shield className='w-4 h-4 text-green-600 dark:text-green-400' />,
      label: 'Firmado',
      fecha: procedure.fecha_firmado,
      show: !!procedure.fecha_firmado,
      bgColor: 'bg-green-50 dark:bg-green-500/10',
      borderColor: 'border-green-200 dark:border-green-500/20',
    },
  ];

  return (
    // Uso de variables de tema para el contenedor y borde
    <div className='bg-card rounded-2xl p-6 shadow-sm border border-border dark:shadow-2xl dark:border-slate-700/50'>
      <h3 className='text-lg font-semibold text-foreground mb-4'>Fechas</h3>

      <div className='space-y-3'>
        {fechas
          .filter((f) => f.show)
          .map((fecha, index) => (
            <div
              key={index}
              // Aplicamos las clases dinámicas
              className={`flex items-center gap-3 p-3 rounded-lg border ${fecha.bgColor} ${fecha.borderColor}`}
            >
              <div className='flex-shrink-0'>
                {fecha.icon}
              </div>
              <div className='flex-1 min-w-0'>
                {/* Textos adaptables al tema */}
                <p className='text-xs text-muted-foreground mb-0.5'>{fecha.label}</p>
                <p className='text-sm text-foreground font-medium'>
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

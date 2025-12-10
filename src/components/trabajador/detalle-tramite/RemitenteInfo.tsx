// src/components/trabajador/detalle-tramite/RemitenteInfo.tsx
'use client';

import { User, Building2, Mail, Phone } from 'lucide-react';

interface RemitenteInfoProps {
  remitente: {
    nombres: string;
    apellidos: string;
    correo: string;
    telefono?: string;
  };
  area?: {
    id_area: string;
    nombre: string;
  };
}

export default function RemitenteInfo({ remitente, area }: RemitenteInfoProps) {
  const contactos = [
    {
      icon: <User className='w-4 h-4 text-purple-600 dark:text-purple-400' />,
      label: 'Nombre completo',
      value: `${remitente.nombres} ${remitente.apellidos}`,
      show: true,
    },
    {
      icon: <Building2 className='w-4 h-4 text-blue-600 dark:text-blue-400' />,
      label: 'Área/Departamento',
      value: area?.nombre || 'No especificada',
      show: true,
      isArea: true,
    },
    {
      icon: <Mail className='w-4 h-4 text-teal-600 dark:text-teal-400' />,
      label: 'Correo electrónico',
      value: remitente.correo,
      show: true,
    },
    {
      icon: <Phone className='w-4 h-4 text-green-600 dark:text-green-400' />,
      label: 'Teléfono',
      value: remitente.telefono || 'No especificado',
      show: !!remitente.telefono,
    },
  ];

  return (
    <div className='bg-card rounded-2xl p-6 shadow-sm border border-border dark:shadow-2xl dark:border-slate-700/50'>
      <div className='flex items-center gap-3 mb-5'>
        <div className='bg-purple-100 dark:bg-purple-500/20 p-2.5 rounded-lg'>
          <User className='w-5 h-5 text-purple-600 dark:text-purple-400' />
        </div>
        <h3 className='text-lg font-semibold text-foreground'>Remitente</h3>
      </div>

      <div className='space-y-3'>
        {contactos
          .filter((c) => c.show)
          .map((contacto, index) => (
            <div
              key={index}
              className='flex items-start gap-3 p-3.5 bg-muted/50 rounded-lg border border-border/50 hover:bg-muted/70 transition-colors dark:bg-slate-800/40 dark:border-slate-700/30 dark:hover:bg-slate-800/60'
            >
              <div className='flex-shrink-0 mt-0.5'>{contacto.icon}</div>
              <div className='flex-1 min-w-0'>
                <p className='text-xs text-muted-foreground font-medium mb-0.5 uppercase tracking-wide'>
                  {contacto.label}
                </p>
                <p
                  className={`text-sm font-medium break-words ${
                    contacto.isArea && area
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-foreground'
                  }`}
                >
                  {contacto.value}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

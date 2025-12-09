'use client';

import { User, Building2, Mail, Phone } from 'lucide-react';

interface RemitenteInfoProps {
  remitente: {
    nombres: string;
    apellidos: string;
    correo: string;
    telefono?: string;
    area?: {
      nombre: string;
    };
  };
}

export default function RemitenteInfo({ remitente }: RemitenteInfoProps) {
  const contactos = [
    {
      // Iconos más oscuros en modo claro
      icon: <User className='w-4 h-4 text-purple-600 dark:text-purple-400' />,
      value: `${remitente.nombres} ${remitente.apellidos}`,
      show: true,
    },
    {
      icon: <Building2 className='w-4 h-4 text-blue-600 dark:text-blue-400' />,
      value: remitente.area?.nombre,
      show: !!remitente.area,
    },
    {
      icon: <Mail className='w-4 h-4 text-teal-600 dark:text-teal-400' />,
      value: remitente.correo,
      show: true,
    },
    {
      icon: <Phone className='w-4 h-4 text-green-600 dark:text-green-400' />,
      value: remitente.telefono,
      show: !!remitente.telefono,
    },
  ];

  return (
    // Contenedor adaptable
    <div className='bg-card rounded-2xl p-6 shadow-sm border border-border dark:shadow-2xl dark:border-slate-700/50'>
      <h3 className='text-lg font-semibold text-foreground mb-4'>Remitente</h3>

      <div className='space-y-3'>
        {contactos
          .filter((c) => c.show)
          .map((contacto, index) => (
            <div
              key={index}
              // Usamos bg-muted/50 para un fondo gris muy suave en modo claro, border-border para el borde
              className='flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border/50 dark:bg-slate-800/40 dark:border-slate-700/30'
            >
              <div className='flex-shrink-0 mt-0.5'>
                {contacto.icon}
              </div>
              {/* Texto foreground */}
              <p className='text-sm text-foreground font-medium break-words flex-1'>
                {contacto.value}
              </p>

            </div>
          ))}
      </div>
    </div>
  );
}

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
      icon: <User className='w-4 h-4 text-purple-400' />,
      value: `${remitente.nombres} ${remitente.apellidos}`,
      show: true,
    },
    {
      icon: <Building2 className='w-4 h-4 text-blue-400' />,
      value: remitente.area?.nombre,
      show: !!remitente.area,
    },
    {
      icon: <Mail className='w-4 h-4 text-teal-400' />,
      value: remitente.correo,
      show: true,
    },
    {
      icon: <Phone className='w-4 h-4 text-green-400' />,
      value: remitente.telefono,
      show: !!remitente.telefono,
    },
  ];

  return (
    <div style={{ backgroundColor: '#272d34' }} className='rounded-2xl p-6 shadow-2xl border border-slate-700/50'>
      <h3 className='text-lg font-semibold text-white mb-4'>Remitente</h3>

      <div className='space-y-3'>
        {contactos
          .filter((c) => c.show)
          .map((contacto, index) => (
            <div
              key={index}
              className='flex items-start gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/30'
            >
              <div className='flex-shrink-0 mt-0.5'>
                {contacto.icon}
              </div>
              <p className='text-sm text-white font-medium break-words flex-1'>
                {contacto.value}
              </p>

            </div>
          ))}
      </div>
    </div>
  );
}

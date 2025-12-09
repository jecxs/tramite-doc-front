// src/components/tramites/detalle/InformacionPersona.tsx
import { User, Mail, Phone, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface InformacionPersonaProps {
  tipo: 'remitente' | 'receptor';
  persona: {
    nombres: string;
    apellidos: string;
    correo: string;
    telefono?: string;
  };
  area?: {
    nombre: string;
  };
}

export default function InformacionPersona({ tipo, persona, area }: InformacionPersonaProps) {
  const isRemitente = tipo === 'remitente';

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>
          {isRemitente ? 'Remitente' : 'Receptor'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <div
              className={`w-12 h-12 ${isRemitente ? 'bg-blue-100' : 'bg-green-100'} rounded-full flex items-center justify-center flex-shrink-0`}
            >
              <User className={`w-6 h-6 ${isRemitente ? 'text-blue-600' : 'text-green-600'}`} />
            </div>
            <div>
              <p className='text-sm font-medium text-foreground-900'>
                {persona.nombres} {persona.apellidos}
              </p>
              <p className='text-xs text-gray-500'>{isRemitente ? 'Remitente' : 'Receptor'}</p>
            </div>
          </div>
          <div className='pt-3 border-t space-y-2'>
            <div className='flex items-center gap-2 text-sm'>
              <Mail className='w-4 h-4 text-gray-400' />
              <span className='text-muted-foreground'>{persona.correo}</span>
            </div>
            {persona.telefono && (
              <div className='flex items-center gap-2 text-sm'>
                <Phone className='w-4 h-4 text-gray-400' />
                <span className='text-muted-foreground'>{persona.telefono}</span>
              </div>
            )}
            {area && (
              <div className='flex items-center gap-2 text-sm'>
                <Building2 className='w-4 h-4 text-gray-400' />
                <span className='text-muted-foreground'>{area.nombre}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

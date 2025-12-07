// src/components/tramites/detalle/ObservacionesList.tsx
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Procedure } from '@/types';

interface ObservacionesListProps {
  observaciones: Procedure['observaciones'];
}

export default function ObservacionesList({ observaciones }: ObservacionesListProps) {
  if (!observaciones || observaciones.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Observaciones ({observaciones.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {observaciones.map((obs) => (
            <div
              key={obs.id_observacion}
              className={`p-4 rounded-lg border ${
                obs.resuelta ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
              }`}
            >
              <div className='flex items-start justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <MessageSquare
                    className={`w-4 h-4 ${obs.resuelta ? 'text-green-600' : 'text-orange-600'}`}
                  />
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      obs.resuelta
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {obs.tipo.replace('_', ' ')}
                  </span>
                </div>
                <span className='text-xs text-gray-500'>
                  {format(new Date(obs.fecha_creacion), 'dd/MM/yyyy HH:mm', { locale: es })}
                </span>
              </div>
              <p className='text-sm text-gray-900 mb-2'>{obs.descripcion}</p>
              {obs.resuelta && obs.respuesta && (
                <div className='mt-3 pt-3 border-t border-green-200'>
                  <p className='text-xs font-medium text-green-900 mb-1'>Respuesta:</p>
                  <p className='text-sm text-green-800'>{obs.respuesta}</p>
                  {obs.fecha_resolucion && (
                    <p className='text-xs text-green-600 mt-2'>
                      Resuelta el{' '}
                      {format(new Date(obs.fecha_resolucion), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

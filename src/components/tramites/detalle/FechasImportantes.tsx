// src/components/tramites/detalle/FechasImportantes.tsx
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, FileCheck, PenTool } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Procedure } from '@/types';

interface FechasImportantesProps {
  fechas: {
    fecha_envio: string;
    fecha_abierto?: string;
    fecha_leido?: string;
    fecha_firmado?: string;
  };
}

export default function FechasImportantes({ fechas }: FechasImportantesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Fechas Importantes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          <div className='flex items-start gap-2'>
            <Calendar className='w-4 h-4 text-gray-400 mt-0.5' />
            <div className='flex-1'>
              <p className='text-xs text-gray-500'>Fecha de Envío</p>
              <p className='text-sm font-medium text-gray-900'>
                {format(new Date(fechas.fecha_envio), 'dd/MM/yyyy HH:mm', { locale: es })}
              </p>
            </div>
          </div>

          {fechas.fecha_abierto && (
            <div className='flex items-start gap-2'>
              <Clock className='w-4 h-4 text-gray-400 mt-0.5' />
              <div className='flex-1'>
                <p className='text-xs text-gray-500'>Fecha de Apertura</p>
                <p className='text-sm font-medium text-gray-900'>
                  {format(new Date(fechas.fecha_abierto), 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
              </div>
            </div>
          )}

          {fechas.fecha_leido && (
            <div className='flex items-start gap-2'>
              <FileCheck className='w-4 h-4 text-gray-400 mt-0.5' />
              <div className='flex-1'>
                <p className='text-xs text-gray-500'>Fecha de Lectura</p>
                <p className='text-sm font-medium text-gray-900'>
                  {format(new Date(fechas.fecha_leido), 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
              </div>
            </div>
          )}

          {fechas.fecha_firmado && (
            <div className='flex items-start gap-2'>
              <PenTool className='w-4 h-4 text-gray-400 mt-0.5' />
              <div className='flex-1'>
                <p className='text-xs text-gray-500'>Fecha de Firma</p>
                <p className='text-sm font-medium text-gray-900'>
                  {format(new Date(fechas.fecha_firmado), 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

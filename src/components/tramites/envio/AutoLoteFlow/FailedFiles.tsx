import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DeteccionDestinatarioDto } from '@/types';

interface FailedFilesProps {
  fallidos: DeteccionDestinatarioDto[];
}

export default function FailedFiles({ fallidos }: FailedFilesProps) {
  return (
    <Card className='border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50'>
      <CardHeader>
        <CardTitle className='text-base flex items-center gap-2'>
          <AlertCircle className='w-5 h-5 text-amber-600' />
          Archivos No Procesados ({fallidos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          {fallidos.map((fallido, idx) => (
            <div
              key={idx}
              className='flex items-start gap-2 p-3 bg-white border border-amber-200 rounded-lg hover:shadow-sm transition-shadow'
            >
              <AlertCircle className='w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0' />
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-900'>{fallido.nombre_archivo}</p>
                <p className='text-xs text-amber-700 mt-0.5'>{fallido.error}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

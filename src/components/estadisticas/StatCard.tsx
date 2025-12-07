import { Card, CardContent } from '@/components/ui/Card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  titulo: string;
  valor: string | number;
  descripcion?: string;
  icono?: LucideIcon;
  colorIcono?: string;
  tendencia?: {
    valor: number;
    esPositiva: boolean;
  };
}

export default function StatCard({
  titulo,
  valor,
  descripcion,
  icono: Icono,
  colorIcono = 'text-blue-600',
  tendencia,
}: StatCardProps) {
  return (
    <Card hover>
      <CardContent className='pt-6'>
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <p className='text-sm font-medium text-gray-600'>{titulo}</p>
            <p className='text-3xl font-bold text-gray-900 mt-2'>{valor}</p>
            {descripcion && <p className='text-sm text-gray-500 mt-1'>{descripcion}</p>}
            {tendencia && (
              <div className='flex items-center gap-1 mt-2'>
                <span
                  className={`text-sm font-medium ${
                    tendencia.esPositiva ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {tendencia.esPositiva ? '↑' : '↓'} {tendencia.valor}%
                </span>
                <span className='text-xs text-gray-500'>vs. anterior</span>
              </div>
            )}
          </div>
          {Icono && (
            <div className='p-3 bg-gray-50 rounded-lg'>
              <Icono className={`w-6 h-6 ${colorIcono}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, FileCheck, Loader2, LayoutGrid } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Procedure } from '@/types';
import { PROCEDURE_STATES } from '@/lib/constants';

interface TramiteHeaderProps {
  procedure: Procedure;
  viewMode: 'viewer' | 'details';
  onViewModeChange: (mode: 'viewer' | 'details') => void;
  onMarkAsRead: () => void;
  isMarking: boolean;
}

export default function TramiteHeader({
                                        procedure,
                                        viewMode,
                                        onViewModeChange,
                                        onMarkAsRead,
                                        isMarking,
                                      }: TramiteHeaderProps) {
  const router = useRouter();

  return (
    // Contenedor principal adaptable: bg-card con borde suave en claro
    <div className='bg-card border border-border rounded-2xl p-6 shadow-sm dark:shadow-2xl dark:border-slate-700/50'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.back()}
            // Botón volver adaptable
            className='text-muted-foreground hover:text-foreground hover:bg-muted dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700/50 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            Volver
          </Button>
          <div className='border-l border-border pl-4 dark:border-slate-700'>
            <h1 className='text-2xl font-bold text-foreground'>Detalles del Documento</h1>
            <p className='text-sm text-muted-foreground mt-1'>
              Código:{' '}
              {/* Código púrpura oscuro en claro, neón en oscuro */}
              <span className='font-mono font-medium text-purple-700 dark:text-purple-400'>{procedure.codigo}</span>
            </p>
          </div>
        </div>

        <div className='flex gap-3 w-full sm:w-auto'>
          {/* Contenedor del Toggle: bg-muted en claro se ve muy elegante */}
          <div className='flex gap-2 bg-muted rounded-xl p-1.5 flex-1 sm:flex-initial dark:bg-slate-900/60'>
            <button
              onClick={() => onViewModeChange('details')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex-1 sm:flex-initial ${
                viewMode === 'details'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
              }`}
            >
              <LayoutGrid className='w-4 h-4' />
              Detalles
            </button>
            <button
              onClick={() => onViewModeChange('viewer')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex-1 sm:flex-initial ${
                viewMode === 'viewer'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
              }`}
            >
              <Eye className='w-4 h-4' />
              Visor
            </button>
          </div>

          {procedure.estado === PROCEDURE_STATES.ABIERTO && viewMode === 'details' && (
            <Button
              onClick={onMarkAsRead}
              disabled={isMarking}
              // Botón de acción secundaria adaptable
              className='bg-background hover:bg-muted text-foreground border border-border dark:bg-slate-700/50 dark:hover:bg-slate-600/50 dark:text-white dark:border-slate-600/50'
            >
              {isMarking ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <FileCheck className='w-4 h-4' />
              )}
              Marcar como Leído
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

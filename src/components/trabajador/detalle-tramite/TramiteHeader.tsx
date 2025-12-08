'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, FileCheck, Loader2, LayoutGrid } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Procedure } from '@/types';

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
    <div className='bg-[#272d34] border border-slate-700/50 rounded-2xl p-6 shadow-2xl'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.back()}
            className='text-slate-300 hover:text-white hover:bg-slate-700/50'
          >
            <ArrowLeft className='w-4 h-4' />
            Volver
          </Button>
          <div className='border-l border-slate-700 pl-4'>
            <h1 className='text-2xl font-bold text-white'>Detalles del Documento</h1>
            <p className='text-sm text-slate-400 mt-1'>
              Código: <span className='font-mono font-medium text-purple-400'>{procedure.codigo}</span>
            </p>
          </div>
        </div>

        <div className='flex gap-3 w-full sm:w-auto'>
          <div className='flex gap-2 bg-slate-900/60 rounded-xl p-1.5 flex-1 sm:flex-initial'>
            <button
              onClick={() => onViewModeChange('details')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex-1 sm:flex-initial ${
                viewMode === 'details'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
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
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Eye className='w-4 h-4' />
              Visor
            </button>
          </div>

          {procedure.estado === 'ABIERTO' && viewMode === 'details' && (
            <Button
              onClick={onMarkAsRead}
              disabled={isMarking}
              className='bg-slate-700/50 hover:bg-slate-600/50 text-white border border-slate-600/50'
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

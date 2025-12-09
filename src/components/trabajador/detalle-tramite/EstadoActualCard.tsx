'use client';

import { Send, Eye, FileCheck, CheckCircle, XCircle, FileText, PenTool } from 'lucide-react';
import { ProcedureStateBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import FirmaElectronicaInfo from '@/components/firma/FirmaElectronicaInfo';
import { PROCEDURE_STATE_LABELS, PROCEDURE_STATES } from '@/lib/constants';
import { Procedure } from '@/types';

interface EstadoActualCardProps {
  procedure: Procedure;
  onFirmarClick: () => void;
}

export default function EstadoActualCard({ procedure, onFirmarClick }: EstadoActualCardProps) {
  const getEstadoIcon = (estado: string) => {
    // Ajustamos los iconos para que sean un poco más oscuros en modo claro
    const icons = {
      ENVIADO: <Send className='w-5 h-5 text-blue-600 dark:text-blue-400' />,
      ABIERTO: <Eye className='w-5 h-5 text-purple-600 dark:text-purple-400' />,
      LEIDO: <FileCheck className='w-5 h-5 text-indigo-600 dark:text-indigo-400' />,
      FIRMADO: <CheckCircle className='w-5 h-5 text-green-600 dark:text-green-400' />,
      RESPONDIDO: <CheckCircle className='w-5 h-5 text-teal-600 dark:text-teal-400' />,
      ANULADO: <XCircle className='w-5 h-5 text-red-600 dark:text-red-400' />,
    };
    return icons[estado as keyof typeof icons] || <FileText className='w-5 h-5 text-muted-foreground' />;
  };

  const canSign =
    procedure.requiere_firma && procedure.estado === PROCEDURE_STATES.LEIDO && !procedure.firma;

  return (
    // Contenedor principal adaptable
    <div className='bg-card border border-border rounded-2xl p-6 shadow-sm dark:shadow-2xl dark:border-slate-700/50'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          {/* Fondo del icono adaptable (bg-muted) */}
          <div className='bg-muted p-3 rounded-xl dark:bg-slate-900/60'>{getEstadoIcon(procedure.estado)}</div>
          <div>
            <p className='text-sm text-muted-foreground mb-1'>Estado actual</p>
            <p className='text-xl font-semibold text-foreground'>
              {PROCEDURE_STATE_LABELS[procedure.estado as keyof typeof PROCEDURE_STATE_LABELS]}
            </p>
          </div>
        </div>
        <ProcedureStateBadge estado={procedure.estado} />
      </div>

      {canSign && (
        <div className='bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5 dark:from-purple-900/40 dark:to-purple-800/30 dark:border-purple-500/30'>
          <div className='flex items-start gap-4'>
            <div className='bg-purple-200/50 p-2.5 rounded-lg flex-shrink-0 dark:bg-purple-500/20'>
              <PenTool className='w-5 h-5 text-purple-700 dark:text-purple-300' />
            </div>
            <div className='flex-1'>
              <p className='text-base font-semibold text-purple-900 mb-1 dark:text-white'>
                Este documento requiere tu firma electrónica
              </p>
              <p className='text-sm text-purple-700 mb-4 dark:text-purple-200'>
                Una vez que lo hayas leído completamente, haz clic en el botón para firmar.
              </p>
              <Button
                onClick={onFirmarClick}
                size='sm'
                // El botón se ve bien en ambos modos, lo dejamos igual
                className='bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-md hover:shadow-lg transition-all'
              >
                <PenTool className='w-4 h-4' />
                Firmar Documento
              </Button>
            </div>
          </div>
        </div>
      )}

      {procedure.firma && (
        <div className='mt-6 pt-6 border-t border-border dark:border-slate-700/50'>
          <FirmaElectronicaInfo firma={procedure.firma} procedure={procedure} />
        </div>
      )}
    </div>
  );
}

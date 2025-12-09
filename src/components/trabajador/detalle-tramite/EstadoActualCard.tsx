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
    const icons = {
      ENVIADO: <Send className='w-5 h-5 text-blue-400' />,
      ABIERTO: <Eye className='w-5 h-5 text-purple-400' />,
      LEIDO: <FileCheck className='w-5 h-5 text-indigo-400' />,
      FIRMADO: <CheckCircle className='w-5 h-5 text-green-400' />,
      RESPONDIDO: <CheckCircle className='w-5 h-5 text-teal-400' />,
      ANULADO: <XCircle className='w-5 h-5 text-red-400' />,
    };
    return icons[estado as keyof typeof icons] || <FileText className='w-5 h-5 text-slate-400' />;
  };

  const canSign =
    procedure.requiere_firma && procedure.estado === PROCEDURE_STATES.LEIDO && !procedure.firma;

  return (
    <div className='bg-[#272d34] border border-slate-700/50 rounded-2xl p-6 shadow-2xl'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <div className='bg-slate-900/60 p-3 rounded-xl'>{getEstadoIcon(procedure.estado)}</div>
          <div>
            <p className='text-sm text-slate-400 mb-1'>Estado actual</p>
            <p className='text-xl font-semibold text-white'>
              {PROCEDURE_STATE_LABELS[procedure.estado as keyof typeof PROCEDURE_STATE_LABELS]}
            </p>
          </div>
        </div>
        <ProcedureStateBadge estado={procedure.estado} />
      </div>

      {canSign && (
        <div className='bg-gradient-to-br from-purple-900/40 to-purple-800/30 border border-purple-500/30 rounded-xl p-5'>
          <div className='flex items-start gap-4'>
            <div className='bg-purple-500/20 p-2.5 rounded-lg flex-shrink-0'>
              <PenTool className='w-5 h-5 text-purple-300' />
            </div>
            <div className='flex-1'>
              <p className='text-base font-semibold text-white mb-1'>
                Este documento requiere tu firma electrónica
              </p>
              <p className='text-sm text-purple-200 mb-4'>
                Una vez que lo hayas leído completamente, haz clic en el botón para firmar.
              </p>
              <Button
                onClick={onFirmarClick}
                size='sm'
                className='bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white'
              >
                <PenTool className='w-4 h-4' />
                Firmar Documento
              </Button>
            </div>
          </div>
        </div>
      )}

      {procedure.firma && (
        <div className='mt-6 pt-6 border-t border-slate-700/50'>
          <FirmaElectronicaInfo firma={procedure.firma} procedure={procedure} />
        </div>
      )}
    </div>
  );
}

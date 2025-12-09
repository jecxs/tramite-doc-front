'use client';

import Link from 'next/link';
import { PenTool, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Procedure } from '@/types';
import { PROCEDURE_STATES } from '@/lib/constants';

interface AccionesRapidasProps {
  procedure: Procedure;
  onFirmarClick: () => void;
}

export default function AccionesRapidas({ procedure, onFirmarClick }: AccionesRapidasProps) {
  const canSign =
    procedure.requiere_firma && procedure.estado === PROCEDURE_STATES.LEIDO && !procedure.firma;

  const canAddObservation = procedure.estado !== PROCEDURE_STATES.FIRMADO;

  if (!canSign && !canAddObservation) {
    return null;
  }

  return (
    <div className='bg-card rounded-2xl p-6 shadow-2xl border border-slate-700/50' >
      <h3 className='text-lg font-semibold text-foreground mb-4'>Acciones Rápidas</h3>

      <div className='space-y-3'>
        {canSign && (
          <Button
            onClick={onFirmarClick}
            className='w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-foreground shadow-lg shadow-purple-500/20 h-11'
          >
            <PenTool className='w-4 h-4' />
            Firmar Documento
          </Button>
        )}

        {canAddObservation && (
          <Link href={`/trabajador/tramites/${procedure.id_tramite}/observacion`} className='block'>
            <Button
              variant='outline'
              className='w-full bg-slate-700/30 hover:bg-slate-600/40 text-foreground border border-slate-600/50 h-11'
            >
              <MessageSquare className='w-4 h-4' />
              Hacer Observación
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

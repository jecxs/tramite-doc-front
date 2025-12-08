'use client';

import { MessageSquare, Info } from 'lucide-react';
import VisualizarRespuesta from '@/components/respuesta/VisualizarRespuesta';
import ConfirmarConformidad from '@/components/respuesta/ConfirmarConformidad';
import { Procedure } from '@/types';

interface SeccionRespuestaProps {
  procedure: Procedure;
  onUpdate: (updatedProcedure: Procedure) => void;
}

export default function SeccionRespuesta({ procedure, onUpdate }: SeccionRespuestaProps) {
  if (!procedure.requiere_respuesta) return null;

  return (
    <div className='space-y-6'>
      {procedure.respuesta ? (
        <div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl'>
          <VisualizarRespuesta respuesta={procedure.respuesta} mostrarDetallesTecnicos={true} />
        </div>
      ) : (
        <>
          {procedure.estado === 'LEIDO' && (
            <>
              <div className='bg-gradient-to-br from-teal-900/40 to-teal-800/30 border border-teal-500/30 rounded-2xl p-5 shadow-2xl'>
                <div className='flex items-start gap-4'>
                  <div className='bg-teal-500/20 p-2.5 rounded-lg flex-shrink-0'>
                    <MessageSquare className='w-5 h-5 text-teal-300' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-base font-semibold text-white mb-1'>
                      Este documento requiere tu confirmación
                    </p>
                    <p className='text-sm text-teal-200'>
                      Por favor, revisa el documento completamente antes de confirmar.
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl'>
                <ConfirmarConformidad
                  idTramite={procedure.id_tramite}
                  asuntoTramite={procedure.asunto}
                  onConformidadConfirmada={(resultado) => {
                    onUpdate({
                      ...resultado.tramiteActualizado,
                      respuesta: resultado.respuesta,
                    });
                  }}
                />
              </div>
            </>
          )}

          {(procedure.estado === 'ENVIADO' || procedure.estado === 'ABIERTO') && (
            <div className='bg-gradient-to-br from-blue-900/40 to-blue-800/30 border border-blue-500/30 rounded-2xl p-5 shadow-2xl'>
              <div className='flex items-start gap-4'>
                <div className='bg-blue-500/20 p-2.5 rounded-lg flex-shrink-0'>
                  <Info className='w-5 h-5 text-blue-300' />
                </div>
                <p className='text-sm text-blue-200 flex-1'>
                  Debes leer completamente el documento antes de poder confirmar tu conformidad. El
                  sistema detectará automáticamente cuando hayas terminado de leerlo.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

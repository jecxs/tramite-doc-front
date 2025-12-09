'use client';

import { MessageSquare, Info } from 'lucide-react';
import VisualizarRespuesta from '@/components/respuesta/VisualizarRespuesta';
import ConfirmarConformidad from '@/components/respuesta/ConfirmarConformidad';
import { Procedure } from '@/types';
import { PROCEDURE_STATES } from '@/lib/constants';

interface SeccionRespuestaProps {
  procedure: Procedure;
  onUpdate: (updatedProcedure: Procedure) => void;
}

export default function SeccionRespuesta({ procedure, onUpdate }: SeccionRespuestaProps) {
  if (!procedure.requiere_respuesta) return null;

  return (
    <div className='space-y-6'>
      {procedure.respuesta ? (
        // Contenedor de respuesta ya enviada
        <div className='bg-card border border-border rounded-2xl p-6 shadow-sm dark:bg-slate-800/50 dark:backdrop-blur-sm dark:border-slate-700/50 dark:shadow-2xl'>
          <VisualizarRespuesta respuesta={procedure.respuesta} mostrarDetallesTecnicos={true} />
        </div>
      ) : (
        <>
          {procedure.estado === PROCEDURE_STATES.LEIDO && (
            <>
              {/* ALERT CARD TEAL (Confirmación) - Dual Theme */}
              <div className='bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-2xl p-5 shadow-sm dark:from-teal-900/40 dark:to-teal-800/30 dark:border-teal-500/30 dark:shadow-2xl'>
                <div className='flex items-start gap-4'>
                  <div className='bg-teal-200/50 p-2.5 rounded-lg flex-shrink-0 dark:bg-teal-500/20'>
                    <MessageSquare className='w-5 h-5 text-teal-700 dark:text-teal-300' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-base font-semibold text-teal-900 mb-1 dark:text-white'>
                      Este documento requiere tu confirmación
                    </p>
                    <p className='text-sm text-teal-800/80 dark:text-teal-200'>
                      Por favor, revisa el documento completamente antes de confirmar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenedor del formulario */}
              <div className='bg-card border border-border rounded-2xl p-6 shadow-sm dark:bg-slate-800/50 dark:backdrop-blur-sm dark:border-slate-700/50 dark:shadow-2xl'>
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

          {(procedure.estado === PROCEDURE_STATES.ENVIADO ||
            procedure.estado === PROCEDURE_STATES.ABIERTO) && (
            /* INFO CARD BLUE (Lectura pendiente) - Dual Theme */
            <div className='bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5 shadow-sm dark:from-blue-900/40 dark:to-blue-800/30 dark:border-blue-500/30 dark:shadow-2xl'>
              <div className='flex items-start gap-4'>
                <div className='bg-blue-200/50 p-2.5 rounded-lg flex-shrink-0 dark:bg-blue-500/20'>
                  <Info className='w-5 h-5 text-blue-700 dark:text-blue-300' />
                </div>
                <p className='text-sm text-blue-800 dark:text-blue-200 flex-1'>
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

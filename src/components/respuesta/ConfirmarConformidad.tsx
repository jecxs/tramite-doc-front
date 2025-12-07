'use client';

import { useState } from 'react';
import { CheckCircle, Shield, MessageSquare } from 'lucide-react';
import { crearRespuestaTramite } from '@/lib/api/respuesta-tramite';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import { Procedure, RespuestaTramite } from '@/types';

interface ConfirmarConformidadProps {
  idTramite: string;
  asuntoTramite: string;
  onConformidadConfirmada: (resultado: {
    respuesta: RespuestaTramite;
    tramiteActualizado: Procedure;
  }) => void;
}

export default function ConfirmarConformidad({
  idTramite,
  asuntoTramite,
  onConformidadConfirmada,
}: ConfirmarConformidadProps) {
  const [aceptaConformidad, setAceptaConformidad] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmar = async () => {
    if (!aceptaConformidad) {
      toast.error('Debes marcar la casilla de confirmación');
      return;
    }

    try {
      setIsSubmitting(true);

      const resultado = await crearRespuestaTramite(idTramite, {
        acepta_conformidad: true,
      });

      toast.success('Conformidad confirmada', {
        description: 'El responsable ha sido notificado',
      });

      // Pasar el resultado completo al callback
      onConformidadConfirmada(resultado);
    } catch (error: unknown) {
      toast.error('Error al confirmar conformidad', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      {/* Encabezado */}
      <div className='flex items-center gap-3 mb-6'>
        <div className='flex-shrink-0 w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center'>
          <CheckCircle className='w-5 h-5 text-teal-600' />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>Confirmación de Conformidad</h3>
          <p className='text-sm text-gray-600'>Este documento requiere tu confirmación</p>
        </div>
      </div>

      {/* Información del documento */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
        <div className='flex items-start gap-3'>
          <Shield className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
          <div className='text-sm text-blue-800'>
            <p className='font-medium mb-2'>Documento a confirmar:</p>
            <p className='font-semibold'>{asuntoTramite}</p>
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6'>
        <h4 className='text-sm font-semibold text-gray-900 mb-3'>Instrucciones Importantes:</h4>
        <ul className='space-y-2 text-sm text-gray-700'>
          <li className='flex items-start gap-2'>
            <CheckCircle className='w-4 h-4 text-green-600 flex-shrink-0 mt-0.5' />
            <span>
              <strong>Si estás conforme:</strong> Marca la casilla y confirma tu aceptación.
            </span>
          </li>
          <li className='flex items-start gap-2'>
            <MessageSquare className='w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5' />
            <span>
              <strong>Si NO estás conforme:</strong> Debes crear una observación detallada usando el
              botón &ldquo;Hacer Observación&rdquo; para que el documento sea corregido.
            </span>
          </li>
        </ul>
      </div>

      {/* Checkbox de confirmación */}
      <div className='bg-teal-50 border-2 border-teal-200 rounded-lg p-4 mb-6'>
        <label className='flex items-start gap-3 cursor-pointer'>
          <input
            type='checkbox'
            checked={aceptaConformidad}
            onChange={(e) => setAceptaConformidad(e.target.checked)}
            className='mt-1 h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer'
          />
          <span className='flex-1 text-sm text-gray-900'>
            <strong className='block mb-1'>
              Confirmo que he leído el documento completo y estoy conforme con su contenido
            </strong>
            <span className='text-gray-600'>
              Al marcar esta casilla y confirmar, acepto que la información presentada es correcta
              según mi conocimiento.
            </span>
          </span>
        </label>
      </div>

      {/* Botones de acción */}
      <div className='flex gap-3'>
        <Button
          onClick={handleConfirmar}
          disabled={!aceptaConformidad || isSubmitting}
          className={`flex-1 ${
            !aceptaConformidad || isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
              Procesando...
            </>
          ) : (
            <>
              <CheckCircle className='w-5 h-5 mr-2' />
              Estoy conforme
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

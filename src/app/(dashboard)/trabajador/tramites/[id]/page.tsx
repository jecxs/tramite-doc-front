// src/app/(dashboard)/trabajador/tramites/[id]/page.tsx
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';

import Button from '@/components/ui/Button';
import DocumentViewer from '@/components/documents/DocumentViewer';
import FirmaElectronicaModal from '@/components/firma/FirmaElectronicaModal';

import { getProcedureById, markProcedureAsOpened, markProcedureAsRead } from '@/lib/api/tramites';
import { solicitarCodigoVerificacion, verificarYFirmar } from '@/lib/api/firma-electronica';

import TramiteHeader from '@/components/trabajador/detalle-tramite/TramiteHeader';
import EstadoActualCard from '@/components/trabajador/detalle-tramite/EstadoActualCard';
import DocumentoInfo from '@/components/trabajador/detalle-tramite/DocumentoInfo';
import RemitenteInfo from '@/components/trabajador/detalle-tramite/RemitenteInfo';
import FechasInfo from '@/components/trabajador/detalle-tramite/FechasInfo';
import AccionesRapidas from '@/components/trabajador/detalle-tramite/AccionesRapidas';
import SeccionRespuesta from '@/components/trabajador/detalle-tramite/SeccionRespuesta';
import SeccionObservaciones from '@/components/trabajador/detalle-tramite/SeccionObservaciones';
import TramiteObsoletoAlert from '@/components/trabajador/detalle-tramite/TramiteObsoletoAlert';

import { Procedure } from '@/types';
import { PROCEDURE_STATES } from '@/lib/constants';
import apiClient from '@/lib/api-client';

export default function WorkerProcedureDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [viewMode, setViewMode] = useState<'viewer' | 'details'>('details');
  const [showFirmaModal, setShowFirmaModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const hasMarkedAsOpenedRef = useRef(false);

  // Verificar si el trámite está obsoleto (tiene versiones más recientes)
  const isObsoleto = useMemo(() => {
    if (!procedure) return false;
    return procedure.reenvios && procedure.reenvios.length > 0;
  }, [procedure]);

  useEffect(() => {
    if (id) fetchProcedure();
    return () => {
      hasMarkedAsOpenedRef.current = false;
    };
  }, [id]);

  const fetchProcedure = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getProcedureById(id);

      if (!data.documento?.tipo) {
        throw new Error('El documento no tiene la información completa');
      }

      setProcedure(data);
      await fetchDocumentUrl(data.id_documento);

      // Solo marcar como abierto si NO es obsoleto
      const tieneReenvios = data.reenvios && data.reenvios.length > 0;
      if (
        data.estado === PROCEDURE_STATES.ENVIADO &&
        !hasMarkedAsOpenedRef.current &&
        !tieneReenvios
      ) {
        hasMarkedAsOpenedRef.current = true;
        await handleMarkAsOpened(data);
      }
    } catch (err) {
      console.error('❌ Error fetching procedure:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el trámite');
      toast.error('Error al cargar el trámite');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocumentUrl = async (documentId: string) => {
    try {
      const proxyUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/documentos/${documentId}/content`;
      setDocumentUrl(proxyUrl);
    } catch (err) {
      console.error('Error setting document URL:', err);
      toast.error('Error al obtener la URL del documento');
    }
  };

  const handleMarkAsOpened = async (proc: Procedure) => {
    try {
      const updated = await markProcedureAsOpened(proc.id_tramite);
      setProcedure(updated);
    } catch (err) {
      console.error('❌ Error marking as opened:', err);
      hasMarkedAsOpenedRef.current = false;
    }
  };

  const handleMarkAsRead = async () => {
    if (!procedure || procedure.estado !== PROCEDURE_STATES.ABIERTO) return;

    // Bloquear si es obsoleto
    if (isObsoleto) {
      toast.error('Este documento ha sido actualizado', {
        description: 'Por favor, revisa la versión más reciente.',
      });
      return;
    }

    try {
      setIsMarking(true);
      const updated = await markProcedureAsRead(procedure.id_tramite);
      setProcedure(updated);
      toast.success('Documento marcado como leído');
    } catch (err) {
      console.error('Error marking as read:', err);
      toast.error('Error al marcar como leído');
    } finally {
      setIsMarking(false);
    }
  };

  const handleReadThresholdReached = async () => {
    if (procedure && procedure.estado === PROCEDURE_STATES.ABIERTO && !isObsoleto) {
      await handleMarkAsRead();
    }
  };

  const handleDownload = async () => {
    if (!procedure) return;

    try {
      setIsDownloading(true);
      const response = await apiClient.get(`/documentos/${procedure.id_documento}/download`);

      if (response.data.download_url) {
        window.open(response.data.download_url, '_blank');
        toast.success('Descargando documento...');

        const extension = procedure.documento.extension.toLowerCase();
        if (
          !['.pdf'].includes(extension) &&
          procedure.estado === PROCEDURE_STATES.ABIERTO &&
          !isObsoleto
        ) {
          setTimeout(() => handleMarkAsRead(), 1000);
        }
      }
    } catch (err) {
      console.error('Error downloading document:', err);
      toast.error('Error al descargar el documento');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSolicitarCodigo = async () => {
    if (!procedure) {
      throw new Error('No se pudo obtener la información del trámite.');
    }

    // Bloquear si es obsoleto
    if (isObsoleto) {
      toast.error('Este documento ha sido actualizado', {
        description: 'No puedes firmar una versión obsoleta. Revisa la versión más reciente.',
        duration: 5000,
      });
      throw new Error('Trámite obsoleto');
    }

    try {
      const resultado = await solicitarCodigoVerificacion(procedure.id_tramite);
      toast.success('Código enviado', {
        description: `Se ha enviado un código de verificación a ${resultado.email_enviado_a}`,
      });
      return resultado;
    } catch (err) {
      console.error('Error al solicitar código:', err);
      toast.error('Error al enviar código', {
        description:
          err instanceof Error ? err.message : 'No se pudo enviar el código de verificación',
      });
      throw err;
    }
  };

  const handleVerificarYFirmar = async (codigo: string) => {
    if (!procedure) return;

    // Bloquear si es obsoleto
    if (isObsoleto) {
      toast.error('Este documento ha sido actualizado', {
        description: 'No puedes firmar una versión obsoleta.',
      });
      throw new Error('Trámite obsoleto');
    }

    try {
      const result = await verificarYFirmar(procedure.id_tramite, {
        codigo,
        acepta_terminos: true,
      });

      setProcedure(result.tramite);
      toast.success('Documento firmado correctamente', {
        description: 'El responsable ha sido notificado de tu firma electrónica.',
        duration: 5000,
      });
      setShowFirmaModal(false);
    } catch (err) {
      console.error('Error al verificar y firmar:', err);

      if (err instanceof Error && err.message.includes('código')) {
        toast.error('Código incorrecto', { description: err.message });
      } else if (err instanceof Error && err.message.includes('expirado')) {
        toast.error('Código expirado', {
          description: 'Solicita un nuevo código de verificación',
        });
      } else if (err instanceof Error && err.message.includes('bloqueado')) {
        toast.error('Cuenta bloqueada temporalmente', {
          description: err.message,
          duration: 8000,
        });
      } else {
        toast.error('Error al firmar documento', {
          description: err instanceof Error ? err.message : 'Ocurrió un error inesperado',
        });
      }
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
        <div className='text-center'>
          <Loader2 className='w-10 h-10 animate-spin text-purple-400 mx-auto mb-4' />
          <p className='text-slate-300 font-medium'>Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (error || !procedure) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8'>
        <div className='max-w-2xl mx-auto'>
          <div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl'>
            <div className='text-center'>
              <AlertCircle className='w-16 h-16 text-red-400 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-white mb-2'>
                Error al cargar el documento
              </h3>
              <p className='text-slate-400 mb-6'>{error}</p>
              <Button
                onClick={() => window.history.back()}
                className='bg-purple-600 hover:bg-purple-700 text-white'
              >
                Volver
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='min-h-screen py-8 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto space-y-6'>
          <TramiteHeader
            procedure={procedure}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onMarkAsRead={handleMarkAsRead}
            isMarking={isMarking}
          />

          {viewMode === 'viewer' ? (
            <div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl'>
              {documentUrl && procedure.documento ? (
                <DocumentViewer
                  documentUrl={documentUrl}
                  documentId={procedure.id_documento}
                  procedureId={procedure.id_tramite}
                  fileName={procedure.documento.nombre_archivo}
                  fileExtension={procedure.documento.extension}
                  onReadThresholdReached={handleReadThresholdReached}
                  onDownload={handleDownload}
                  readThreshold={50}
                  autoMarkAsRead={procedure.estado === PROCEDURE_STATES.ABIERTO && !isObsoleto}
                />
              ) : (
                <div className='bg-slate-900/50 border border-slate-700 rounded-xl p-12 text-center'>
                  <Loader2 className='w-8 h-8 animate-spin text-purple-400 mx-auto mb-3' />
                  <p className='text-slate-400'>Cargando documento...</p>
                </div>
              )}
            </div>
          ) : (
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              <div className='lg:col-span-2 space-y-6'>
                {/* Alerta de Trámite Obsoleto - PRIORIDAD MÁXIMA */}
                {isObsoleto && <TramiteObsoletoAlert procedure={procedure} />}

                {/* Solo mostrar el resto de contenido si NO es obsoleto */}
                {!isObsoleto && (
                  <>
                    <EstadoActualCard
                      procedure={procedure}
                      onFirmarClick={() => setShowFirmaModal(true)}
                    />

                    <SeccionObservaciones procedure={procedure} />

                    <DocumentoInfo
                      procedure={procedure}
                      onDownload={handleDownload}
                      isDownloading={isDownloading}
                    />

                    <SeccionRespuesta procedure={procedure} onUpdate={setProcedure} />
                  </>
                )}

                {/* Si es obsoleto, mostrar solo info básica */}
                {isObsoleto && (
                  <DocumentoInfo
                    procedure={procedure}
                    onDownload={handleDownload}
                    isDownloading={isDownloading}
                  />
                )}
              </div>

              <div className='space-y-6'>
                <RemitenteInfo
                  remitente={procedure.remitente}
                  area={procedure.areaRemitente}
                />
                <FechasInfo procedure={procedure} />

                {/* Solo mostrar acciones rápidas si NO es obsoleto */}
                {!isObsoleto && (
                  <AccionesRapidas
                    procedure={procedure}
                    onFirmarClick={() => setShowFirmaModal(true)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de firma - solo si NO es obsoleto */}
      {!isObsoleto && (
        <FirmaElectronicaModal
          isOpen={showFirmaModal}
          onClose={() => setShowFirmaModal(false)}
          onConfirm={handleVerificarYFirmar}
          onSolicitarCodigo={handleSolicitarCodigo}
          procedure={procedure}
        />
      )}
    </>
  );
}

/* eslint-disable react-hooks/exhaustive-deps */
// src/app/(dashboard)/trabajador/tramites/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  FileText,
  User,
  Building2,
  Calendar,
  Clock,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
  Mail,
  Phone,
  PenTool,
  MessageSquare,
  FileCheck,
  Loader2,
  Shield,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ProcedureStateBadge } from '@/components/ui/Badge';
import { getProcedureById, markProcedureAsOpened, markProcedureAsRead } from '@/lib/api/tramites';

import { Procedure } from '@/types';
import { PROCEDURE_STATE_LABELS } from '@/lib/constants';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import DocumentViewer from '@/components/documents/DocumentViewer';
import FirmaElectronicaModal from '@/components/firma/FirmaElectronicaModal';
import FirmaElectronicaInfo from '@/components/firma/FirmaElectronicaInfo';
import VisualizarRespuesta from '@/components/respuesta/VisualizarRespuesta';
import ConfirmarConformidad from '@/components/respuesta/ConfirmarConformidad';
import { solicitarCodigoVerificacion, verificarYFirmar } from '@/lib/api/firma-electronica';

export default function WorkerProcedureDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [error, setError] = useState<string>('');
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [viewMode, setViewMode] = useState<'viewer' | 'details'>('details');
  const [showFirmaModal, setShowFirmaModal] = useState(false);
  const hasMarkedAsOpenedRef = useRef(false);

  useEffect(() => {
    if (id) {
      fetchProcedure();
    }
    // ✅ Limpiar el ref cuando cambie el ID
    return () => {
      hasMarkedAsOpenedRef.current = false;
    };
  }, [id]);

  const fetchProcedure = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getProcedureById(id);

      console.log('✅ Trámite cargado:', data);

      if (!data.documento || !data.documento.tipo) {
        console.error('❌ Documento incompleto:', data.documento);
        throw new Error('El documento no tiene la información completa');
      }

      setProcedure(data);
      await fetchDocumentUrl(data.id_documento);

      // ✅ SOLUCIÓN: Solo marcar como abierto si no se ha hecho antes
      if (data.estado === 'ENVIADO' && !hasMarkedAsOpenedRef.current) {
        hasMarkedAsOpenedRef.current = true; // 🔒 Bloquear futuras llamadas
        await handleMarkAsOpened(data);
      }
    } catch (err: unknown) {
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
      console.log('📄 Usando proxy URL:', proxyUrl);
      setDocumentUrl(proxyUrl);
    } catch (err: unknown) {
      console.error('Error setting document URL:', err);
      toast.error('Error al obtener la URL del documento');
    }
  };

  const handleMarkAsOpened = async (proc: Procedure) => {
    try {
      console.log('📤 Marcando trámite como abierto...');
      const updated = await markProcedureAsOpened(proc.id_tramite);
      setProcedure(updated);
      console.log('✅ Trámite marcado como abierto');
    } catch (err: unknown) {
      console.error('❌ Error marking as opened:', err);
      // ✅ Si falla, permitir reintento
      hasMarkedAsOpenedRef.current = false;
    }
  };

  const handleMarkAsRead = async () => {
    if (!procedure || procedure.estado !== 'ABIERTO') return;

    try {
      setIsMarking(true);
      const updated = await markProcedureAsRead(procedure.id_tramite);
      setProcedure(updated);
      toast.success('Documento marcado como leído');
    } catch (err: unknown) {
      console.error('Error marking as read:', err);
      toast.error('Error al marcar como leído');
    } finally {
      setIsMarking(false);
    }
  };

  const handleReadThresholdReached = async () => {
    if (procedure && procedure.estado === 'ABIERTO') {
      await handleMarkAsRead();
    }
  };

  const handleDownload = async () => {
    if (!procedure) return;

    try {
      setIsDownloading(true);

      // Usar el endpoint de URL firmada
      const response = await apiClient.get(`/documentos/${procedure.id_documento}/download`);

      if (response.data.download_url) {
        window.open(response.data.download_url, '_blank');
        toast.success('Descargando documento...');

        const extension = procedure.documento.extension.toLowerCase();
        if (!['.pdf'].includes(extension) && procedure.estado === 'ABIERTO') {
          setTimeout(() => {
            handleMarkAsRead();
          }, 1000);
        }
      }
    } catch (err: unknown) {
      console.error('Error downloading document:', err);
      toast.error('Error al descargar el documento');
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Handler para solicitar código de verificación
   */
  const handleSolicitarCodigo = async () => {
    if (!procedure) {
      // Manejo de caso borde si procedure es null/undefined antes de llamar
      throw new Error('No se pudo obtener la información del trámite.');
    }

    try {
      const resultado = await solicitarCodigoVerificacion(procedure.id_tramite);

      toast.success('Código enviado', {
        description: `Se ha enviado un código de verificación a ${resultado.email_enviado_a}`,
      });

      return resultado;
    } catch (err: unknown) {
      console.error('Error al solicitar código:', err);
      toast.error('Error al enviar código', {
        description:
          err instanceof Error ? err.message : 'No se pudo enviar el código de verificación',
      });
      // ✅ SOLUCIÓN: Relanzar el error para que la función no retorne undefined
      throw err;
    }
  };

  /**
   * Handler para verificar código y firmar documento
   */
  const handleVerificarYFirmar = async (codigo: string) => {
    if (!procedure) return;

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
    } catch (err: unknown) {
      console.error('Error al verificar y firmar:', err);

      // Mensajes de error personalizados según el tipo de error
      if (err instanceof Error && err.message.includes('código')) {
        toast.error('Código incorrecto', {
          description: err.message,
        });
        return;
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

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'ENVIADO':
        return <Send className='w-5 h-5 text-blue-600' />;
      case 'ABIERTO':
        return <Eye className='w-5 h-5 text-purple-600' />;
      case 'LEIDO':
        return <FileCheck className='w-5 h-5 text-indigo-600' />;
      case 'FIRMADO':
        return <CheckCircle className='w-5 h-5 text-green-600' />;
      case 'ANULADO':
        return <XCircle className='w-5 h-5 text-red-600' />;
      default:
        return <FileText className='w-5 h-5 text-gray-600' />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const canSign = procedure?.requiere_firma && procedure?.estado === 'LEIDO' && !procedure?.firma;

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin text-blue-600 mx-auto mb-4' />
          <p className='text-gray-600'>Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (error || !procedure) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center py-12'>
              <AlertCircle className='w-16 h-16 text-red-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Error al cargar el documento
              </h3>
              <p className='text-gray-600 mb-6'>{error}</p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className='w-4 h-4' />
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='sm' onClick={() => router.back()}>
              <ArrowLeft className='w-4 h-4' />
              Volver
            </Button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Detalles del Documento</h1>
              <p className='text-sm text-gray-600 mt-1'>
                Código: <span className='font-mono font-medium'>{procedure.codigo}</span>
              </p>
            </div>
          </div>
          <div className='flex gap-2'>
            <div className='flex gap-1 bg-gray-100 rounded-lg p-1'>
              <button
                onClick={() => setViewMode('details')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'details'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Detalles
              </button>
              <button
                onClick={() => setViewMode('viewer')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'viewer'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className='w-4 h-4 inline mr-1' />
                Ver Documento
              </button>
            </div>

            {procedure.estado === 'ABIERTO' && viewMode === 'details' && (
              <Button onClick={handleMarkAsRead} disabled={isMarking} variant='outline'>
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

        {/* Estado actual */}
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                {getEstadoIcon(procedure.estado)}
                <div>
                  <p className='text-sm text-gray-600'>Estado actual</p>
                  <p className='text-lg font-semibold text-gray-900'>
                    {
                      PROCEDURE_STATE_LABELS[
                        procedure.estado as keyof typeof PROCEDURE_STATE_LABELS
                      ]
                    }
                  </p>
                </div>
              </div>
              <ProcedureStateBadge estado={procedure.estado} />
            </div>

            {/* Alerta si requiere firma */}
            {canSign && (
              <div className='mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4'>
                <div className='flex items-start gap-3'>
                  <PenTool className='w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5' />
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-purple-900'>
                      Este documento requiere tu firma electrónica
                    </p>
                    <p className='text-sm text-purple-700 mt-1'>
                      Una vez que lo hayas leído completamente, haz clic en el botón para firmar.
                    </p>
                    <Button
                      onClick={() => setShowFirmaModal(true)}
                      size='sm'
                      className='mt-3 bg-purple-600 hover:bg-purple-700 text-white'
                    >
                      <PenTool className='w-4 h-4' />
                      Firmar Documento
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Información de Firma */}
            {procedure.firma && (
              <div className='mt-4'>
                <FirmaElectronicaInfo firma={procedure.firma} procedure={procedure} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contenido condicional */}
        {viewMode === 'viewer' ? (
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Visualización del Documento</CardTitle>
              {/* ✅ NUEVO: Botón de descarga en el header del visor */}
              <Button onClick={handleDownload} disabled={isDownloading} variant='outline' size='sm'>
                {isDownloading ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Download className='w-4 h-4' />
                )}
                Descargar
              </Button>
            </CardHeader>
            <CardContent>
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
                  autoMarkAsRead={procedure.estado === 'ABIERTO'}
                />
              ) : (
                <div className='bg-gray-50 border border-gray-200 rounded-lg p-8 text-center'>
                  <Loader2 className='w-8 h-8 animate-spin text-gray-400 mx-auto mb-3' />
                  <p className='text-gray-600'>Cargando documento...</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Columna Principal */}
            <div className='lg:col-span-2 space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Información del Documento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div>
                      <label className='text-sm font-medium text-gray-700'>Asunto</label>
                      <p className='text-base text-gray-900 mt-1'>{procedure.asunto}</p>
                    </div>

                    {procedure.mensaje && (
                      <div>
                        <label className='text-sm font-medium text-gray-700'>Mensaje</label>
                        {procedure.es_reenvio ? (
                          // Formato especial para reenvíos
                          <div className='mt-2 p-4 bg-orange-30 border-l-4 border-blue-200 rounded-r-lg'>
                            <div className='flex items-start gap-3'>
                              <RefreshCw className='w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5' />
                              <div className='flex-1'>
                                <p className='text-sm font-semibold text-blue-900 mb-2'>
                                  Documento Corregido - Versión {procedure.numero_version}
                                </p>
                                <p className='text-sm text-gray-700 leading-relaxed'>
                                  {procedure.mensaje}
                                </p>
                                {procedure.motivo_reenvio && (
                                  <div className='mt-3 pt-3 border-t border-orange-100'>
                                    <p className='text-xs font-medium text-green-800 mb-1'>
                                      Corrección:
                                    </p>
                                    <p className='text-xs text-gray-600 italic'>
                                      {procedure.motivo_reenvio}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Formato normal para trámites regulares
                          <p className='text-sm text-gray-600 mt-1 whitespace-pre-wrap'>
                            {procedure.mensaje}
                          </p>
                        )}
                      </div>
                    )}

                    <div className='grid grid-cols-2 gap-4 pt-4 border-t'>
                      <div>
                        <label className='text-sm font-medium text-gray-700'>
                          Tipo de Documento
                        </label>
                        <p className='text-sm text-gray-900 mt-1'>
                          {procedure.documento?.tipo?.nombre || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className='text-sm font-medium text-gray-700'>Código del Tipo</label>
                        <p className='text-sm text-gray-900 mt-1 font-mono'>
                          {procedure.documento?.tipo?.codigo || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className='grid grid-cols-3 gap-4 pt-4 border-t'>
                      <div>
                        <label className='text-sm font-medium text-gray-700'>Archivo</label>
                        <p className='text-sm text-gray-900 mt-1'>
                          {procedure.documento?.nombre_archivo || 'Cargando...'}
                        </p>
                      </div>
                      <div>
                        <label className='text-sm font-medium text-gray-700'>Tamaño</label>
                        <p className='text-sm text-gray-900 mt-1'>
                          {procedure.documento?.tamano_bytes
                            ? formatBytes(parseInt(procedure.documento.tamano_bytes))
                            : 'Cargando...'}
                        </p>
                      </div>
                      <div>
                        <label className='text-sm font-medium text-gray-700'>Extensión</label>
                        <p className='text-sm text-gray-900 mt-1 uppercase'>
                          {procedure.documento?.extension || 'Cargando...'}
                        </p>
                      </div>
                    </div>

                    <div className='flex gap-2 pt-4 border-t flex-wrap'>
                      <Button onClick={handleDownload} disabled={isDownloading} variant='outline'>
                        {isDownloading ? (
                          <Loader2 className='w-4 h-4 animate-spin' />
                        ) : (
                          <Download className='w-4 h-4' />
                        )}
                        Descargar Documento
                      </Button>

                      {procedure.requiere_firma && (
                        <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800'>
                          <PenTool className='w-3 h-3 mr-1.5' />
                          Requiere Firma
                        </span>
                      )}
                      {procedure.requiere_respuesta && (
                        <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                          <MessageSquare className='w-3 h-3 mr-1.5' />
                          Requiere Respuesta
                        </span>
                      )}
                      {procedure.es_reenvio && (
                        <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800'>
                          <RefreshCw className='w-3 h-3 mr-1.5' />
                          Reenvío v{procedure.numero_version}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* SECCIÓN DE RESPUESTA DE CONFORMIDAD */}
              {procedure.requiere_respuesta && (
                <div className='space-y-6'>
                  {/* Si ya respondió, mostrar la respuesta */}
                  {procedure.respuesta ? (
                    <VisualizarRespuesta
                      respuesta={procedure.respuesta}
                      mostrarDetallesTecnicos={true}
                    />
                  ) : (
                    /* Si no ha respondido y el trámite está LEIDO, mostrar formulario */
                    procedure.estado === 'LEIDO' && (
                      <>
                        {/* Alert indicando que debe responder */}
                        <div className='bg-teal-50 border border-teal-200 rounded-lg p-4'>
                          <div className='flex items-start gap-3'>
                            <MessageSquare className='w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5' />
                            <div className='flex-1'>
                              <p className='text-sm font-medium text-teal-900 mb-1'>
                                Este documento requiere tu confirmación
                              </p>
                              <p className='text-sm text-teal-800'>
                                Por favor, revisa el documento completamente antes de confirmar.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Componente de confirmación simplificado */}
                        <ConfirmarConformidad
                          idTramite={procedure.id_tramite}
                          asuntoTramite={procedure.asunto}
                          onConformidadConfirmada={(resultado) => {
                            // Actualizar el estado local inmediatamente
                            setProcedure({
                              ...resultado.tramiteActualizado,
                              respuesta: resultado.respuesta,
                            });
                          }}
                        />
                      </>
                    )
                  )}

                  {/* Si está en estado ENVIADO o ABIERTO, mostrar mensaje */}
                  {!procedure.respuesta &&
                    (procedure.estado === 'ENVIADO' || procedure.estado === 'ABIERTO') && (
                      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                        <div className='flex items-center gap-3'>
                          <Info className='w-5 h-5 text-blue-600' />
                          <p className='text-sm text-blue-800'>
                            Debes leer completamente el documento antes de poder confirmar tu
                            conformidad. El sistema detectará automáticamente cuando hayas terminado
                            de leerlo.
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              )}
              {procedure.observaciones && procedure.observaciones.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <MessageSquare className='w-5 h-5' />
                      Observaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {procedure.observaciones.map((obs) => (
                        <div
                          key={obs.id_observacion}
                          className='bg-gray-50 rounded-lg p-4 border border-gray-200'
                        >
                          <div className='flex items-start justify-between mb-2'>
                            <span className='inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800'>
                              {obs.tipo}
                            </span>
                            <span className='text-xs text-gray-500'>
                              {format(new Date(obs.fecha_creacion), 'dd/MM/yyyy HH:mm', {
                                locale: es,
                              })}
                            </span>
                          </div>
                          <p className='text-sm text-gray-900 whitespace-pre-wrap'>
                            {obs.descripcion}
                          </p>
                          {obs.resuelta && obs.respuesta && (
                            <div className='mt-3 pt-3 border-t border-gray-300'>
                              <p className='text-xs font-medium text-green-700 mb-1'>Respuesta:</p>
                              <p className='text-sm text-gray-800'>{obs.respuesta}</p>
                              {obs.fecha_resolucion && (
                                <p className='text-xs text-gray-500 mt-1'>
                                  Resuelta el{' '}
                                  {format(new Date(obs.fecha_resolucion), 'dd/MM/yyyy HH:mm', {
                                    locale: es,
                                  })}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Columna Lateral */}
            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Remitente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div className='flex items-start gap-3'>
                      <User className='w-5 h-5 text-gray-400 mt-0.5' />
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-gray-900'>
                          {procedure.remitente.nombres} {procedure.remitente.apellidos}
                        </p>
                      </div>
                    </div>

                    {procedure.remitente.area && (
                      <div className='flex items-start gap-3'>
                        <Building2 className='w-5 h-5 text-gray-400 mt-0.5' />
                        <div className='flex-1'>
                          <p className='text-sm text-gray-900'>{procedure.remitente.area.nombre}</p>
                        </div>
                      </div>
                    )}

                    <div className='flex items-start gap-3'>
                      <Mail className='w-5 h-5 text-gray-400 mt-0.5' />
                      <div className='flex-1'>
                        <p className='text-sm text-gray-900'>{procedure.remitente.correo}</p>
                      </div>
                    </div>

                    {procedure.remitente.telefono && (
                      <div className='flex items-start gap-3'>
                        <Phone className='w-5 h-5 text-gray-400 mt-0.5' />
                        <div className='flex-1'>
                          <p className='text-sm text-gray-900'>{procedure.remitente.telefono}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Fechas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div className='flex items-start gap-3'>
                      <Calendar className='w-5 h-5 text-gray-400 mt-0.5' />
                      <div className='flex-1'>
                        <p className='text-xs text-gray-600'>Enviado</p>
                        <p className='text-sm text-gray-900'>
                          {format(new Date(procedure.fecha_envio), 'dd/MM/yyyy HH:mm', {
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>

                    {procedure.fecha_abierto && (
                      <div className='flex items-start gap-3'>
                        <Clock className='w-5 h-5 text-gray-400 mt-0.5' />
                        <div className='flex-1'>
                          <p className='text-xs text-gray-600'>Abierto</p>
                          <p className='text-sm text-gray-900'>
                            {format(new Date(procedure.fecha_abierto), 'dd/MM/yyyy HH:mm', {
                              locale: es,
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {procedure.fecha_leido && (
                      <div className='flex items-start gap-3'>
                        <FileCheck className='w-5 h-5 text-gray-400 mt-0.5' />
                        <div className='flex-1'>
                          <p className='text-xs text-gray-600'>Leído</p>
                          <p className='text-sm text-gray-900'>
                            {format(new Date(procedure.fecha_leido), 'dd/MM/yyyy HH:mm', {
                              locale: es,
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {procedure.fecha_firmado && (
                      <div className='flex items-start gap-3'>
                        <Shield className='w-5 h-5 text-green-600 mt-0.5' />
                        <div className='flex-1'>
                          <p className='text-xs text-gray-600'>Firmado</p>
                          <p className='text-sm text-gray-900'>
                            {format(new Date(procedure.fecha_firmado), 'dd/MM/yyyy HH:mm', {
                              locale: es,
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Acciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    {canSign && (
                      <Button
                        onClick={() => setShowFirmaModal(true)}
                        className='w-full bg-purple-600 hover:bg-purple-700 text-white'
                      >
                        <PenTool className='w-4 h-4' />
                        Firmar Documento
                      </Button>
                    )}

                    <Link
                      href={`/trabajador/tramites/${procedure.id_tramite}/observacion`}
                      className='block'
                    >
                      <Button variant='outline' className='w-full'>
                        <MessageSquare className='w-4 h-4' />
                        Hacer Observación
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Firma Electrónica - ACTUALIZADO */}
      <FirmaElectronicaModal
        isOpen={showFirmaModal}
        onClose={() => setShowFirmaModal(false)}
        onConfirm={handleVerificarYFirmar}
        onSolicitarCodigo={handleSolicitarCodigo}
        procedure={procedure}
      />
    </>
  );
}

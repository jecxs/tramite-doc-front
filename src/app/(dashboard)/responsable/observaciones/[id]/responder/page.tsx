/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Send,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FileText,
  User,
  Calendar,
} from 'lucide-react';
import { getObservationById, resolveObservation } from '@/lib/api/observaciones';
import { uploadDocument } from '@/lib/api/documents';
import { getDocumentTypes } from '@/lib/api/document-type';
import { Observation, DocumentType, ResponderObservacionDto } from '@/types';

interface ObservationWithTramite extends Observation {
  tramite: {
    codigo: string;
    asunto: string;
    estado: string;
    documento: {
      titulo: string;
      nombre_archivo: string;
      version: number;
    };
  };
}

export default function ResponderObservacionPage() {
  const router = useRouter();
  const params = useParams();
  const observacionId = params.id as string;

  const [observacion, setObservacion] = useState<ObservationWithTramite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [respuestaText, setRespuestaText] = useState('');
  const [incluyeReenvio, setIncluyeReenvio] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [asuntoReenvio, setAsuntoReenvio] = useState('');

  // Upload state
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [documentoCorregidoId, setDocumentoCorregidoId] = useState<string | null>(null);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<string>('');

  useEffect(() => {
    fetchObservacion();
    fetchDocumentTypes();
  }, [observacionId]);

  const fetchObservacion = async () => {
    try {
      setIsLoading(true);
      const data = await getObservationById(observacionId);
      setObservacion(data as ObservationWithTramite);

      if ((data as ObservationWithTramite).tramite?.asunto) {
        setAsuntoReenvio((data as ObservationWithTramite).tramite.asunto);
      }
    } catch (err: unknown) {
      console.error('Error fetching observation:', err);
      toast.error(err instanceof Error ? err.message : 'Error al cargar la observación');
      router.push('/responsable/observaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const types = await getDocumentTypes();
      setDocumentTypes(types);
    } catch (err) {
      console.error('Error fetching document types:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error('Solo se permiten archivos PDF, DOC o DOCX');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo no debe superar 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile || !selectedDocType) {
      toast.error('Selecciona un documento y su tipo');
      return;
    }

    try {
      setIsUploadingDoc(true);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('titulo', selectedFile.name);
      formData.append('id_tipo', selectedDocType);

      const documento = await uploadDocument(formData);
      setDocumentoCorregidoId(documento.id_documento);
      toast.success('Documento cargado correctamente');
    } catch (err: unknown) {
      console.error('Error uploading document:', err);
      toast.error(err instanceof Error ? err.message : 'Error al cargar el documento');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleSubmitRespuesta = async () => {
    if (!respuestaText.trim()) {
      toast.error('Debes escribir una respuesta');
      return;
    }

    if (incluyeReenvio && !documentoCorregidoId) {
      toast.error('Debes cargar el documento corregido antes de enviar');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: ResponderObservacionDto = {
        respuesta: respuestaText.trim(),
      };

      if (incluyeReenvio) {
        payload.incluye_reenvio = true;
        payload.id_documento_corregido = documentoCorregidoId ?? '';
        payload.asunto_reenvio = asuntoReenvio.trim() || undefined;
      }

      await resolveObservation(observacionId, payload);

      const mensaje = incluyeReenvio
        ? 'Observación resuelta y documento reenviado correctamente'
        : 'Observación resuelta correctamente';

      toast.success(mensaje);
      router.push('/responsable/observaciones');
    } catch (err: unknown) {
      console.error('Error resolving observation:', err);
      toast.error(err instanceof Error ? err.message : 'Error al responder la observación');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
        <div className='text-center'>
          <div className='relative'>
            <div className='w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-6'></div>
            <div
              className='absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-500 rounded-full animate-spin mx-auto'
              style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
            ></div>
          </div>
          <p className='text-slate-300 text-lg font-medium'>Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!observacion) {
    return null;
  }

  return (
    <div className='min-h-screen py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header con gradiente */}
        <div className='relative overflow-hidden rounded-2xl bg-[#272d34] p-8'>
          <div className='absolute inset-0 bg-black/20'></div>
          <div className='relative z-10'>
            <button
              onClick={() => router.back()}
              className='mb-4 p-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl transition-all duration-300 border border-white/20'
            >
              <ArrowLeft className='w-5 h-5 text-white' />
            </button>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-white mb-2'>Responder Observación</h1>
                <p className='text-blue-100 flex items-center gap-2'>
                  <span className='px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium'>
                    {observacion.tramite?.codigo}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Columna Izquierda - Información de la Observación */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Card de Observación */}
            <div className='relative overflow-hidden rounded-2xl bg-card backdrop-blur-sm border border-slate-700/50 shadow-xl'>
              <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-red-500 to-red-800'></div>
              <div className='p-6'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='p-3 bg-gradient-to-br from-red-500 to-red-500 rounded-xl shadow-lg'>
                    <AlertCircle className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <p className='text-xs text-slate-400 uppercase tracking-wide'>Tipo</p>
                    <span className='inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-semibold border border-yellow-500/30'>
                      {observacion.tipo.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <h3 className='text-lg font-bold text-white mb-3 leading-tight'>
                  {observacion.tramite?.asunto}
                </h3>

                <div className='p-4 bg-slate-900/50 rounded-xl mb-4 border border-slate-700/30'>
                  <p className='text-slate-300 text-sm leading-relaxed'>
                    {observacion.descripcion}
                  </p>
                </div>

                <div className='space-y-3'>
                  <div className='flex items-start gap-3 p-3 bg-slate-900/30 rounded-xl'>
                    <User className='w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0' />
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs text-slate-400 mb-1'>Creada por</p>
                      <p className='font-medium text-white truncate'>
                        {observacion.creador?.nombres} {observacion.creador?.apellidos}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3 p-3 bg-slate-900/30 rounded-xl'>
                    <FileText className='w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0' />
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs text-slate-400 mb-1'>Documento</p>
                      <p className='font-medium text-white text-sm'>
                        {observacion.tramite?.documento?.titulo}
                      </p>
                      <span className='inline-block mt-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs border border-blue-500/30'>
                        v{observacion.tramite?.documento?.version}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Formulario de Respuesta */}
          <div className='lg:col-span-2 space-y-6 '>
            {/* Card de Respuesta */}
            <div className='rounded-2xl bg-[#272d34] backdrop-blur-sm border border-slate-700/50 shadow-xl overflow-hidden'>
              <div className='bg-[#272d34] px-6 py-4 border-b border-slate-700/50'>
                <h2 className='text-xl font-bold text-white'>Tu Respuesta</h2>
              </div>

              <div className='p-6 space-y-6'>
                {/* Textarea de Respuesta */}
                <div>
                  <label className='block text-sm font-semibold text-slate-300 mb-3'>
                    Mensaje de respuesta <span className='text-red-400'>*</span>
                  </label>
                  <textarea
                    value={respuestaText}
                    onChange={(e) => setRespuestaText(e.target.value)}
                    rows={6}
                    placeholder='Explica al trabajador cómo has resuelto su observación...'
                    className='w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-300'
                  />
                </div>

                {/* Opción de Reenvío */}
                <div className='rounded-xl bg-slate-900/30 border border-slate-700/30 p-6'>
                  <label className='flex items-start gap-4 cursor-pointer group'>
                    <div className='relative flex items-center'>
                      <input
                        type='checkbox'
                        checked={incluyeReenvio}
                        onChange={(e) => setIncluyeReenvio(e.target.checked)}
                        className='w-5 h-5 text-blue-600 bg-slate-900 border-slate-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-slate-900 cursor-pointer'
                      />
                    </div>
                    <div className='flex-1'>
                      <span className='text-base font-semibold text-white group-hover:text-blue-400 transition-colors'>
                        Incluir documento corregido
                      </span>
                      <p className='text-sm text-slate-400 mt-1'>
                        El trabajador recibirá una nueva versión del documento
                      </p>
                    </div>
                  </label>

                  {/* Sección de Upload */}
                  {incluyeReenvio && (
                    <div className='mt-6 space-y-5 pl-9 border-l-2 border-blue-500/50'>
                      {/* Asunto del Reenvío */}
                      <div>
                        <label className='block text-sm font-semibold text-slate-300 mb-2'>
                          Asunto <span className='text-slate-500'>(opcional)</span>
                        </label>
                        <input
                          type='text'
                          value={asuntoReenvio}
                          onChange={(e) => setAsuntoReenvio(e.target.value)}
                          placeholder='Deja vacío para usar el mismo asunto'
                          className='w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300'
                        />
                      </div>

                      {/* Tipo de Documento */}
                      <div>
                        <label className='block text-sm font-semibold text-slate-300 mb-2'>
                          Tipo de documentos<span className='text-red-400'>*</span>
                        </label>
                        <select
                          value={selectedDocType}
                          onChange={(e) => setSelectedDocType(e.target.value)}
                          className='w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300'
                          disabled={!!documentoCorregidoId}
                        >
                          <option value=''>Selecciona un tipo</option>
                          {documentTypes.map((type) => (
                            <option key={type.id_tipo} value={type.id_tipo}>
                              {type.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Upload de Archivo */}
                      {!documentoCorregidoId ? (
                        <div>
                          <label className='block text-sm font-semibold text-slate-300 mb-2'>
                            Archivo corregido <span className='text-red-400'>*</span>
                            <span className='text-slate-500 font-normal ml-2'>
                              (PDF, DOC, DOCX - Máx 10MB)
                            </span>
                          </label>
                          <div className='flex gap-3'>
                            <div className='flex-1 relative'>
                              <input
                                type='file'
                                accept='.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                onChange={handleFileSelect}
                                className='w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-600 file:to-blue-700 file:text-white hover:file:from-blue-700 hover:file:to-blue-800 file:cursor-pointer file:transition-all file:duration-300 file:shadow-lg cursor-pointer'
                              />
                            </div>
                            <button
                              onClick={handleUploadDocument}
                              disabled={!selectedFile || !selectedDocType || isUploadingDoc}
                              className='px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg font-semibold'
                            >
                              {isUploadingDoc ? (
                                <>
                                  <Loader2 className='w-4 h-4 animate-spin' />
                                  <span>Cargando...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className='w-4 h-4' />
                                  <span>Cargar</span>
                                </>
                              )}
                            </button>
                          </div>
                          {selectedFile && (
                            <p className='mt-2 text-sm text-slate-400 flex items-center gap-2'>
                              <FileText className='w-4 h-4' />
                              {selectedFile.name}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className='relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 p-4'>
                          <div className='flex items-center gap-3'>
                            <div className='p-2 bg-green-500/20 rounded-lg'>
                              <CheckCircle2 className='w-5 h-5 text-green-400' />
                            </div>
                            <div className='flex-1'>
                              <p className='text-sm font-semibold text-green-400'>
                                Documento cargado correctamente
                              </p>
                              <p className='text-xs text-green-500/80 mt-0.5'>
                                {selectedFile?.name}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setDocumentoCorregidoId(null);
                                setSelectedFile(null);
                              }}
                              className='p-2 hover:bg-green-500/20 rounded-lg transition-colors'
                            >
                              <X className='w-4 h-4 text-green-400' />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className='flex justify-end gap-4'>
              <button
                onClick={() => router.back()}
                className='px-8 py-3.5 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700/50 hover:border-slate-600/50 transition-all duration-300 font-semibold shadow-lg'
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitRespuesta}
                disabled={
                  isSubmitting || !respuestaText.trim() || (incluyeReenvio && !documentoCorregidoId)
                }
                className='px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed flex items-center gap-3 transition-all duration-300 shadow-xl font-semibold'
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className='w-5 h-5' />
                    <span>{incluyeReenvio ? 'Responder y Reenviar' : 'Enviar Respuesta'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

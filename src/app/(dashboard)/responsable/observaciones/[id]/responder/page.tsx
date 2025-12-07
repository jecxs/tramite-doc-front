/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Send, Upload, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
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

      // Pre-llenar asunto con el del trámite original
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

      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error('Solo se permiten archivos PDF, DOC o DOCX');
        return;
      }

      // Validar tamaño (máx 10MB)
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
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin text-blue-600 mx-auto mb-4' />
          <p className='text-gray-600'>Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!observacion) {
    return null;
  }

  return (
    <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <button
          onClick={() => router.back()}
          className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
        >
          <ArrowLeft className='w-5 h-5' />
        </button>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Responder Observación</h1>
          <p className='text-sm text-gray-600'>Trámite: {observacion.tramite?.codigo}</p>
        </div>
      </div>

      {/* Información de la Observación */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
        <div className='flex items-start gap-4 mb-4'>
          <div className='p-3 bg-yellow-100 rounded-lg'>
            <AlertCircle className='w-6 h-6 text-yellow-600' />
          </div>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-sm font-medium text-gray-600'>Tipo:</span>
              <span className='px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium'>
                {observacion.tipo.replace('_', ' ')}
              </span>
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              {observacion.tramite?.asunto}
            </h3>
            <p className='text-gray-700 mb-4'>{observacion.descripcion}</p>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-gray-600'>Creada por:</span>
                <p className='font-medium'>
                  {observacion.creador?.nombres} {observacion.creador?.apellidos}
                </p>
              </div>
              <div>
                <span className='text-gray-600'>Documento:</span>
                <p className='font-medium'>
                  {observacion.tramite?.documento?.titulo} (v
                  {observacion.tramite?.documento?.version})
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de Respuesta */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6'>
        <h2 className='text-lg font-semibold text-gray-900'>Tu Respuesta</h2>

        {/* Textarea de Respuesta */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Mensaje de respuesta *
          </label>
          <textarea
            value={respuestaText}
            onChange={(e) => setRespuestaText(e.target.value)}
            rows={6}
            placeholder='Explica al trabajador cómo has resuelto su observación...'
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
          />
        </div>

        {/* Opción de Reenvío */}
        <div className='border-t pt-6'>
          <label className='flex items-center gap-3 cursor-pointer'>
            <input
              type='checkbox'
              checked={incluyeReenvio}
              onChange={(e) => setIncluyeReenvio(e.target.checked)}
              className='w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
            />
            <div>
              <span className='text-sm font-medium text-gray-900'>Incluir documento corregido</span>
              <p className='text-xs text-gray-600'>
                El trabajador recibirá una nueva versión del documento
              </p>
            </div>
          </label>

          {/* Sección de Upload (solo si está marcado) */}
          {incluyeReenvio && (
            <div className='mt-6 space-y-4 pl-8 border-l-2 border-blue-200'>
              {/* Asunto del Reenvío */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Asunto (opcional)
                </label>
                <input
                  type='text'
                  value={asuntoReenvio}
                  onChange={(e) => setAsuntoReenvio(e.target.value)}
                  placeholder='Deja vacío para usar el mismo asunto'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>

              {/* Tipo de Documento */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Tipo de documento *
                </label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Archivo corregido * (PDF, DOC, DOCX - Máx 10MB)
                  </label>
                  <div className='flex gap-3'>
                    <input
                      type='file'
                      accept='.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                      onChange={handleFileSelect}
                      className='flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                    />
                    <button
                      onClick={handleUploadDocument}
                      disabled={!selectedFile || !selectedDocType || isUploadingDoc}
                      className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors'
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
                    <p className='mt-2 text-sm text-gray-600'>
                      Archivo seleccionado: {selectedFile.name}
                    </p>
                  )}
                </div>
              ) : (
                <div className='flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg'>
                  <CheckCircle2 className='w-5 h-5 text-green-600' />
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-green-900'>
                      Documento cargado correctamente
                    </p>
                    <p className='text-xs text-green-700'>{selectedFile?.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setDocumentoCorregidoId(null);
                      setSelectedFile(null);
                    }}
                    className='p-1 hover:bg-green-100 rounded transition-colors'
                  >
                    <X className='w-4 h-4 text-green-700' />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Botones de Acción */}
      <div className='flex justify-end gap-4'>
        <button
          onClick={() => router.back()}
          className='px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmitRespuesta}
          disabled={
            isSubmitting || !respuestaText.trim() || (incluyeReenvio && !documentoCorregidoId)
          }
          className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors'
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
  );
}

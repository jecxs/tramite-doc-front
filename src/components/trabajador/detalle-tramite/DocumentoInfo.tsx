// src/components/trabajador/detalle-tramite/DocumentoInfo.tsx
'use client';

import { Download, Loader2, PenTool, MessageSquare, RefreshCw, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Procedure } from '@/types';

interface DocumentoInfoProps {
  procedure: Procedure;
  onDownload: () => void;
  isDownloading: boolean;
}

export default function DocumentoInfo({ procedure, onDownload, isDownloading }: DocumentoInfoProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Buscar la observación resuelta más reciente (si existe)
  const observacionResuelta = procedure.observaciones?.find(obs => obs.resuelta);

  return (
    <div className='bg-card rounded-2xl p-6 shadow-sm border border-border dark:shadow-2xl dark:border-slate-700/50'>
      {/* Header */}
      <div className='flex items-center gap-3 mb-6'>
        <div className='bg-muted p-2.5 rounded-lg dark:bg-slate-700/50'>
          <FileText className='w-5 h-5 text-muted-foreground dark:text-slate-300' />
        </div>
        <h3 className='text-lg font-semibold text-foreground'>Información del Documento</h3>
      </div>

      <div className='space-y-5'>
        {/* Asunto */}
        <div>
          <label className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>Asunto</label>
          <p className='text-base text-foreground mt-2 leading-relaxed'>{procedure.asunto}</p>
        </div>

        {/* NUEVO: Sección de Reenvío Mejorada */}
        {procedure.es_reenvio && (
          <div className='pt-5 border-t border-border dark:border-slate-700/50'>
            <div className='bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl p-4 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800/30'>
              {/* Header de Reenvío */}
              <div className='flex items-start gap-3 mb-3'>
                <div className='bg-amber-100 p-2 rounded-lg flex-shrink-0 dark:bg-amber-900/30'>
                  <RefreshCw className='w-4 h-4 text-amber-700 dark:text-amber-400' />
                </div>
                <div className='flex-1'>
                  <h4 className='text-sm font-semibold text-amber-900 dark:text-amber-200'>
                    Documento Corregido - Versión {procedure.numero_version}
                  </h4>
                  <p className='text-xs text-amber-700/80 mt-0.5 dark:text-amber-400/70'>
                    Este documento reemplaza a una versión anterior
                  </p>
                </div>
              </div>

              {/* Mensaje de Reenvío */}
              {procedure.mensaje && (
                <div className='mb-3 p-3 bg-white/60 rounded-lg dark:bg-slate-800/40 border border-amber-100 dark:border-amber-900/30'>
                  <p className='text-sm text-slate-700 leading-relaxed dark:text-slate-200'>
                    {procedure.mensaje}
                  </p>
                </div>
              )}

              {/* Motivo de Corrección */}
              {procedure.motivo_reenvio && (
                <div className='mb-3 p-3 bg-white/60 rounded-lg border-l-3 border-l-amber-400 dark:bg-slate-800/40 dark:border-l-amber-600'>
                  <p className='text-xs font-medium text-amber-800 mb-1 dark:text-amber-300'>
                    Motivo de la corrección:
                  </p>
                  <p className='text-sm text-slate-700 dark:text-slate-200'>
                    {procedure.motivo_reenvio}
                  </p>
                </div>
              )}

              {/* NUEVO: Información de Observación Resuelta */}
              {observacionResuelta && (
                <div className='space-y-2 mb-3'>
                  {/* Tu Observación */}
                  <div className='p-3 bg-white/70 rounded-lg dark:bg-slate-800/50 border border-amber-100 dark:border-amber-900/30'>
                    <div className='flex items-start gap-2'>
                      <AlertCircle className='w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5 dark:text-amber-400' />
                      <div className='flex-1'>
                        <p className='text-xs font-medium text-amber-800 mb-1 dark:text-amber-300'>
                          Tu observación ({observacionResuelta.tipo}):
                        </p>
                        <p className='text-sm text-slate-700 dark:text-slate-200'>
                          {observacionResuelta.descripcion}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Respuesta del Responsable */}
                  {observacionResuelta.respuesta && (
                    <div className='p-3 bg-white/70 rounded-lg dark:bg-slate-800/50 border border-emerald-100 dark:border-emerald-900/30'>
                      <div className='flex items-start gap-2'>
                        <CheckCircle className='w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5 dark:text-emerald-400' />
                        <div className='flex-1'>
                          <p className='text-xs font-medium text-emerald-800 mb-1 dark:text-emerald-300'>
                            Respuesta del responsable:
                          </p>
                          <p className='text-sm text-slate-700 dark:text-slate-200'>
                            {observacionResuelta.respuesta}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* NUEVO: Información del Documento Original - MINIMALISTA */}
              {procedure.tramiteOriginal && (
                <div className='pt-3 border-t border-amber-200/50 dark:border-amber-800/30'>
                  <p className='text-xs font-medium text-amber-700 mb-2 dark:text-amber-400'>
                    Documento original:
                  </p>
                  <div className='flex items-center gap-3 text-xs'>
                    <div className='flex items-center gap-1.5'>
                      <span className='text-amber-600 dark:text-amber-400'>Código:</span>
                      <span className='font-mono text-slate-700 dark:text-slate-300'>
                {procedure.tramiteOriginal.codigo}
              </span>
                    </div>
                    <span className='text-amber-300 dark:text-amber-700'>•</span>
                    <div className='flex items-center gap-1.5 flex-1 min-w-0'>
                      <span className='text-amber-600 dark:text-amber-400'>Asunto:</span>
                      <span className='text-slate-700 truncate dark:text-slate-300'>
                {procedure.tramiteOriginal.asunto}
              </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mensaje Normal (cuando NO es reenvío) */}
        {procedure.mensaje && !procedure.es_reenvio && (
          <div className='pt-5 border-t border-border dark:border-slate-700/50'>
            <label className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>Mensaje</label>
            <p className='text-sm text-foreground mt-2 whitespace-pre-wrap leading-relaxed dark:text-slate-300'>
              {procedure.mensaje}
            </p>
          </div>
        )}

        {/* Tipo de Documento */}
        <div className='pt-5 border-t border-border dark:border-slate-700/50'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2'>
                Tipo de Documento
              </label>
              <p className='text-sm text-foreground font-medium'>{procedure.documento?.tipo?.nombre || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2'>
                Código del Tipo
              </label>
              <p className='text-sm text-purple-600 font-mono font-medium dark:text-purple-400'>
                {procedure.documento?.tipo?.codigo || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Detalles del Archivo */}
        <div className='pt-5 border-t border-border dark:border-slate-700/50'>
          <label className='text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-3'>
            Detalles del Archivo
          </label>
          <div className='grid grid-cols-3 gap-4'>
            <div className='bg-muted rounded-lg p-3 dark:bg-slate-800/50'>
              <p className='text-xs text-muted-foreground mb-1'>Archivo</p>
              <p className='text-sm text-foreground font-medium truncate'>
                {procedure.documento?.nombre_archivo || 'Cargando...'}
              </p>
            </div>
            <div className='bg-muted rounded-lg p-3 dark:bg-slate-800/50'>
              <p className='text-xs text-muted-foreground mb-1'>Tamaño</p>
              <p className='text-sm text-foreground font-medium'>
                {procedure.documento?.tamano_bytes
                  ? formatBytes(parseInt(procedure.documento.tamano_bytes))
                  : 'Cargando...'}
              </p>
            </div>
            <div className='bg-muted rounded-lg p-3 dark:bg-slate-800/50'>
              <p className='text-xs text-muted-foreground mb-1'>Extensión</p>
              <p className='text-sm text-foreground font-medium uppercase'>
                {procedure.documento?.extension || 'Cargando...'}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones y Badges */}
        <div className='pt-5 border-t border-border dark:border-slate-700/50'>
          <div className='flex items-center gap-3 flex-wrap'>
            <Button
              onClick={onDownload}
              disabled={isDownloading}
              className='border border-border bg-background hover:bg-muted text-foreground dark:bg-slate-700/50 dark:hover:bg-slate-600/50 dark:text-white dark:border-slate-600/50 transition-colors'
            >
              {isDownloading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Download className='w-4 h-4' />
              )}
              Descargar Documento
            </Button>

            {procedure.requiere_firma && (
              <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30'>
                <PenTool className='w-3 h-3 mr-1.5' />
                Requiere Firma
              </span>
            )}
            {procedure.requiere_respuesta && (
              <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30'>
                <MessageSquare className='w-3 h-3 mr-1.5' />
                Requiere Respuesta
              </span>
            )}
            {procedure.es_reenvio && (
              <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30'>
                <RefreshCw className='w-3 h-3 mr-1.5' />
                Reenvío v{procedure.numero_version}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

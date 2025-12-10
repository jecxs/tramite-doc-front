// src/components/trabajador/detalle-tramite/DocumentoInfo.tsx
'use client';

import { Download, Loader2, PenTool, MessageSquare, RefreshCw, FileText, AlertCircle, CheckCircle, History } from 'lucide-react';
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

        {/* SECCIÓN DE REENVÍO - VERSIÓN MINIMALISTA */}
        {procedure.es_reenvio && (
          <div className='mt-4 p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/40 dark:border-amber-800/30'>
            {/* Header compacto */}
            <div className='flex items-center gap-2 mb-3'>
              <div className='flex items-center gap-2 flex-1'>
                <RefreshCw className='w-4 h-4 text-amber-600 dark:text-amber-400' />
                <span className='text-sm font-semibold text-amber-900 dark:text-amber-200'>
          Documento Actualizado
        </span>
                <span className='text-xs px-1.5 py-0.5 rounded bg-amber-500 text-white font-medium'>
          v{procedure.numero_version}
        </span>
              </div>
            </div>

            {/* Stack compacto de información */}
            <div className='space-y-2 text-sm'>
              {/* Mensaje del responsable */}
              {procedure.mensaje && (
                <p className='text-slate-700 dark:text-slate-300'>
                  {procedure.mensaje}
                </p>
              )}

              {/* Motivo (si existe) */}
              {procedure.motivo_reenvio && (
                <div className='flex gap-2 text-xs'>
                  <span className='text-amber-700 dark:text-amber-400 font-medium'>Motivo:</span>
                  <span className='text-slate-600 dark:text-slate-400'>{procedure.motivo_reenvio}</span>
                </div>
              )}

              {/* Observación resuelta (compacta) */}
              {observacionResuelta && (
                <div className='pt-2 border-t border-amber-200/40 dark:border-amber-800/30 space-y-1.5'>
                  <div className='flex gap-2 text-xs'>
                    <span className='text-amber-700 dark:text-amber-400 font-medium'>Tu observación:</span>
                    <span className='text-slate-600 dark:text-slate-400'>{observacionResuelta.descripcion}</span>
                  </div>
                  {observacionResuelta.respuesta && (
                    <div className='flex gap-2 text-xs'>
                      <span className='text-emerald-700 dark:text-emerald-400 font-medium'>Respuesta:</span>
                      <span className='text-slate-600 dark:text-slate-400'>{observacionResuelta.respuesta}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Info del original (inline compacto) */}
              {procedure.tramiteOriginal && (
                <div className='pt-2 border-t border-amber-200/40 dark:border-amber-800/30'>
                  <div className='flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400'>
                    <span>Reemplaza a:</span>
                    <span className='font-mono text-amber-700 dark:text-amber-400'>
              {procedure.tramiteOriginal.codigo}
                    </span>
                    <span>{procedure.tramiteOriginal.asunto}</span>
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

'use client';

import { Download, Loader2, PenTool, MessageSquare, RefreshCw, FileText } from 'lucide-react';
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

  return (
    // Contenedor principal adaptable
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

        {/* Mensaje */}
        {procedure.mensaje && (
          <div className='pt-5 border-t border-border dark:border-slate-700/50'>
            <label className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>Mensaje</label>
            {procedure.es_reenvio ? (
              // CAJA NARANJA DE REENVÍO: Adaptación dual
              <div className='mt-3 p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl dark:from-orange-900/30 dark:to-orange-800/20 dark:border-orange-500/30'>
                <div className='flex items-start gap-3'>
                  <div className='bg-orange-200/50 p-2 rounded-lg flex-shrink-0 dark:bg-orange-500/20'>
                    <RefreshCw className='w-4 h-4 text-orange-700 dark:text-orange-300' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-semibold text-orange-900 mb-2 dark:text-orange-200'>
                      Documento Corregido - Versión {procedure.numero_version}
                    </p>
                    <p className='text-sm text-orange-800 leading-relaxed dark:text-slate-300'>{procedure.mensaje}</p>
                    {procedure.motivo_reenvio && (
                      <div className='mt-3 pt-3 border-t border-orange-200 dark:border-orange-500/20'>
                        <p className='text-xs font-medium text-orange-700 mb-1 dark:text-orange-300'>Motivo de corrección:</p>
                        <p className='text-xs text-orange-800/80 italic dark:text-slate-400'>{procedure.motivo_reenvio}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className='text-sm text-foreground mt-2 whitespace-pre-wrap leading-relaxed dark:text-slate-300'>{procedure.mensaje}</p>
            )}
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
            {/* Cajas de detalles usando bg-muted */}
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
              // Botón adaptable: Borde y texto oscuro en claro, fondo semi-transparente en oscuro
              className='border border-border bg-background hover:bg-muted text-foreground dark:bg-slate-700/50 dark:hover:bg-slate-600/50 dark:text-white dark:border-slate-600/50 transition-colors'
            >
              {isDownloading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Download className='w-4 h-4' />
              )}
              Descargar Documento
            </Button>

            {/* Badges adaptables */}
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

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
    <div style={{ backgroundColor: '#272d34' }} className='rounded-2xl p-6 shadow-2xl border border-slate-700/50'>
      {/* Header */}
      <div className='flex items-center gap-3 mb-6'>
        <div className='bg-slate-700/50 p-2.5 rounded-lg'>
          <FileText className='w-5 h-5 text-slate-300' />
        </div>
        <h3 className='text-lg font-semibold text-white'>Información del Documento</h3>
      </div>

      <div className='space-y-5'>
        {/* Asunto */}
        <div>
          <label className='text-xs font-medium text-slate-400 uppercase tracking-wider'>Asunto</label>
          <p className='text-base text-white mt-2 leading-relaxed'>{procedure.asunto}</p>
        </div>

        {/* Mensaje */}
        {procedure.mensaje && (
          <div className='pt-5 border-t border-slate-700/50'>
            <label className='text-xs font-medium text-slate-400 uppercase tracking-wider'>Mensaje</label>
            {procedure.es_reenvio ? (
              <div className='mt-3 p-4 bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-500/30 rounded-xl'>
                <div className='flex items-start gap-3'>
                  <div className='bg-orange-500/20 p-2 rounded-lg flex-shrink-0'>
                    <RefreshCw className='w-4 h-4 text-orange-300' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-semibold text-orange-200 mb-2'>
                      Documento Corregido - Versión {procedure.numero_version}
                    </p>
                    <p className='text-sm text-slate-300 leading-relaxed'>{procedure.mensaje}</p>
                    {procedure.motivo_reenvio && (
                      <div className='mt-3 pt-3 border-t border-orange-500/20'>
                        <p className='text-xs font-medium text-orange-300 mb-1'>Motivo de corrección:</p>
                        <p className='text-xs text-slate-400 italic'>{procedure.motivo_reenvio}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className='text-sm text-slate-300 mt-2 whitespace-pre-wrap leading-relaxed'>{procedure.mensaje}</p>
            )}
          </div>
        )}

        {/* Tipo de Documento */}
        <div className='pt-5 border-t border-slate-700/50'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2'>
                Tipo de Documento
              </label>
              <p className='text-sm text-white font-medium'>{procedure.documento?.tipo?.nombre || 'N/A'}</p>
            </div>
            <div>
              <label className='text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2'>
                Código del Tipo
              </label>
              <p className='text-sm text-purple-400 font-mono font-medium'>
                {procedure.documento?.tipo?.codigo || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Detalles del Archivo */}
        <div className='pt-5 border-t border-slate-700/50'>
          <label className='text-xs font-medium text-slate-400 uppercase tracking-wider block mb-3'>
            Detalles del Archivo
          </label>
          <div className='grid grid-cols-3 gap-4'>
            <div className='bg-slate-800/50 rounded-lg p-3'>
              <p className='text-xs text-slate-500 mb-1'>Archivo</p>
              <p className='text-sm text-white font-medium truncate'>
                {procedure.documento?.nombre_archivo || 'Cargando...'}
              </p>
            </div>
            <div className='bg-slate-800/50 rounded-lg p-3'>
              <p className='text-xs text-slate-500 mb-1'>Tamaño</p>
              <p className='text-sm text-white font-medium'>
                {procedure.documento?.tamano_bytes
                  ? formatBytes(parseInt(procedure.documento.tamano_bytes))
                  : 'Cargando...'}
              </p>
            </div>
            <div className='bg-slate-800/50 rounded-lg p-3'>
              <p className='text-xs text-slate-500 mb-1'>Extensión</p>
              <p className='text-sm text-white font-medium uppercase'>
                {procedure.documento?.extension || 'Cargando...'}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones y Badges */}
        <div className='pt-5 border-t border-slate-700/50'>
          <div className='flex items-center gap-3 flex-wrap'>
            <Button
              onClick={onDownload}
              disabled={isDownloading}
              className='bg-slate-700/50 hover:bg-slate-600/50 text-white border border-slate-600/50'
            >
              {isDownloading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Download className='w-4 h-4' />
              )}
              Descargar Documento
            </Button>

            {procedure.requiere_firma && (
              <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30'>
                <PenTool className='w-3 h-3 mr-1.5' />
                Requiere Firma
              </span>
            )}
            {procedure.requiere_respuesta && (
              <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30'>
                <MessageSquare className='w-3 h-3 mr-1.5' />
                Requiere Respuesta
              </span>
            )}
            {procedure.es_reenvio && (
              <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30'>
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

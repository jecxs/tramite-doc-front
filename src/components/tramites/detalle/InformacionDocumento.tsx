// src/components/tramites/detalle/InformacionDocumento.tsx
import { PenTool, MessageSquare, RefreshCw, FileText, HardDrive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Procedure } from '@/types';

interface InformacionDocumentoProps {
  procedure: Procedure;
}

export default function InformacionDocumento({ procedure }: InformacionDocumentoProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className='p-6'>
      <div className="flex items-center justify-between mb-6">
        <h2 className='text-lg font-bold text-slate-900 dark:text-white'>
          Información del Documento
        </h2>
        {/* Pequeño badge decorativo del tipo de archivo */}
        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          {procedure.documento.extension}
        </span>
      </div>

      <div className='space-y-6'>
        {/* Asunto destacado - Diseño "Hero" */}
        {/* Light: Gradiente azul muy suave, borde azulado, texto oscuro */}
        {/* Dark: Tu diseño original oscuro */}
        <div className='p-5 rounded-xl border transition-all duration-300
                        bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-100
                        dark:from-slate-800/60 dark:to-slate-800/40 dark:border-slate-700/50'>
          <label className='text-xs font-bold uppercase tracking-wider block mb-2
                          text-blue-600/80 dark:text-blue-300/70'>
            Asunto Principal
          </label>
          <p className='text-lg font-semibold leading-relaxed
                        text-slate-900 dark:text-white'>
            {procedure.asunto}
          </p>
        </div>

        {/* Mensaje */}
        {procedure.mensaje && (
          <div>
            <label className='text-xs font-bold uppercase tracking-wider block mb-3 ml-1
                            text-slate-500 dark:text-slate-400'>
              Mensaje Adjunto
            </label>
            <div className='p-5 rounded-xl border text-sm leading-relaxed whitespace-pre-wrap shadow-sm
                            bg-white border-slate-200 text-slate-700
                            dark:bg-slate-800/40 dark:border-slate-700/50 dark:text-slate-300'>
              {procedure.mensaje}
            </div>
          </div>
        )}

        {/* Grid de detalles del documento */}
        {/* Usamos bg-slate-50 para diferenciar estos cuadros del fondo blanco del card principal */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='p-4 rounded-xl border transition-colors
                          bg-slate-50 border-slate-200/60
                          dark:bg-slate-800/40 dark:border-slate-700/50'>
            <div className='flex items-center gap-2 mb-2'>
              <FileText className='w-4 h-4 text-blue-600 dark:text-blue-400' />
              <label className='text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
                Tipo
              </label>
            </div>
            <p className='text-sm font-semibold text-slate-900 dark:text-white'>
              {procedure.documento.tipo.nombre}
            </p>
          </div>

          <div className='p-4 rounded-xl border transition-colors
                          bg-slate-50 border-slate-200/60
                          dark:bg-slate-800/40 dark:border-slate-700/50'>
            <div className='flex items-center gap-2 mb-2'>
              <HardDrive className='w-4 h-4 text-purple-600 dark:text-purple-400' />
              <label className='text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
                Tamaño
              </label>
            </div>
            <p className='text-sm font-semibold text-slate-900 dark:text-white'>
              {formatBytes(parseInt(procedure.documento.tamano_bytes))}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4'>
          {/* Nombre del archivo - Full width para nombres largos */}
          <div className='p-4 rounded-xl border transition-colors
                          bg-slate-50 border-slate-200/60
                          dark:bg-slate-800/40 dark:border-slate-700/50'>
            <label className='text-xs font-bold uppercase tracking-wider block mb-2 text-slate-500 dark:text-slate-400'>
              Nombre del Archivo Original
            </label>
            <p className='text-sm font-mono break-all text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/50 p-2 rounded border border-slate-200 dark:border-slate-700/50'>
              {procedure.documento.nombre_archivo}
            </p>
          </div>
        </div>

        {/* Badges de requisitos - Colores vibrantes pero limpios en Light */}
        <div className='flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2'>
          {procedure.requiere_firma && (
            <span className='inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors
                            bg-purple-50 text-purple-700 border-purple-200
                            dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20'>
              <PenTool className='w-3.5 h-3.5' />
              Requiere Firma
            </span>
          )}
          {procedure.requiere_respuesta && (
            <span className='inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors
                            bg-blue-50 text-blue-700 border-blue-200
                            dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20'>
              <MessageSquare className='w-3.5 h-3.5' />
              Requiere Respuesta
            </span>
          )}
          {procedure.es_reenvio && (
            <span className='inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors
                            bg-orange-50 text-orange-700 border-orange-200
                            dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20'>
              <RefreshCw className='w-3.5 h-3.5' />
              Versión {procedure.numero_version}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

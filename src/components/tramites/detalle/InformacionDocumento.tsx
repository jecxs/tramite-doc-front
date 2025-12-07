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
      <h2 className='text-lg font-bold text-white mb-6'>Información del Documento</h2>

      <div className='space-y-6'>
        {/* Asunto destacado */}
        <div className='p-4 bg-gradient-to-r from-slate-700/50 to-slate-700/30 rounded-xl border border-slate-600/50'>
          <label className='text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2'>
            Asunto
          </label>
          <p className='text-base text-white font-medium leading-relaxed'>{procedure.asunto}</p>
        </div>

        {/* Mensaje */}
        {procedure.mensaje && (
          <div>
            <label className='text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3'>
              Mensaje
            </label>
            <p className='text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-slate-700/30 p-4 rounded-xl border border-slate-700/50'>
              {procedure.mensaje}
            </p>
          </div>
        )}

        {/* Grid de detalles del documento */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='p-4 bg-slate-700/30 rounded-xl border border-slate-700/50'>
            <div className='flex items-center gap-2 mb-2'>
              <FileText className='w-4 h-4 text-blue-400' />
              <label className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>
                Tipo
              </label>
            </div>
            <p className='text-sm text-white font-medium'>{procedure.documento.tipo.nombre}</p>
          </div>

          <div className='p-4 bg-slate-700/30 rounded-xl border border-slate-700/50'>
            <div className='flex items-center gap-2 mb-2'>
              <HardDrive className='w-4 h-4 text-purple-400' />
              <label className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>
                Tamaño
              </label>
            </div>
            <p className='text-sm text-white font-medium'>
              {formatBytes(parseInt(procedure.documento.tamano_bytes))}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='col-span-2 sm:col-span-1 p-4 bg-slate-700/30 rounded-xl border border-slate-700/50'>
            <label className='text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2'>
              Nombre del Archivo
            </label>
            <p className='text-sm text-white font-mono break-all'>
              {procedure.documento.nombre_archivo}
            </p>
          </div>

          <div className='p-4 bg-slate-700/30 rounded-xl border border-slate-700/50'>
            <label className='text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2'>
              Extensión
            </label>
            <p className='text-sm text-white font-medium uppercase'>{procedure.documento.extension}</p>
          </div>
        </div>

        {/* Badges de requisitos */}
        <div className='flex flex-wrap gap-2 pt-2'>
          {procedure.requiere_firma && (
            <span className='inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border border-purple-500/30'>
              <PenTool className='w-3.5 h-3.5' />
              Requiere Firma
            </span>
          )}
          {procedure.requiere_respuesta && (
            <span className='inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-500/30'>
              <MessageSquare className='w-3.5 h-3.5' />
              Requiere Respuesta
            </span>
          )}
          {procedure.es_reenvio && (
            <span className='inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 border border-orange-500/30'>
              <RefreshCw className='w-3.5 h-3.5' />
              Versión {procedure.numero_version}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

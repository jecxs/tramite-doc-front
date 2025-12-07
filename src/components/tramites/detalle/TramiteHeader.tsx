// src/components/tramites/detalle/TramiteHeader.tsx
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface TramiteHeaderProps {
  codigo: string;
  isDownloading: boolean;
  onDownload: () => void;
}

export default function TramiteHeader({ codigo, isDownloading, onDownload }: TramiteHeaderProps) {
  const router = useRouter();

  return (
    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
      <div className='flex items-center gap-4'>
        <button
          onClick={() => router.back()}
          className='flex items-center gap-2 text-gray-400 hover:text-white transition-colors group'
        >
          <div className='w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center group-hover:bg-slate-700 transition-colors'>
            <ArrowLeft className='w-4 h-4' />
          </div>
          <span className='text-sm font-medium'>Volver</span>
        </button>
        <div className='h-8 w-px bg-slate-700'></div>
        <div>
          <h1 className='text-xl sm:text-2xl font-bold text-white'>Detalles del Trámite</h1>
          <p className='text-sm text-gray-400 mt-0.5'>
            <span className='font-mono font-medium text-blue-400'>{codigo}</span>
          </p>
        </div>
      </div>
      <button
        onClick={onDownload}
        disabled={isDownloading}
        className='flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {isDownloading ? (
          <Loader2 className='w-4 h-4 animate-spin' />
        ) : (
          <Download className='w-4 h-4' />
        )}
        <span>Descargar</span>
      </button>
    </div>
  );
}

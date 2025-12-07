// src/components/tramite/ExportarHistorialButton.tsx
'use client';

import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Procedure } from '@/types';
import { exportarHistorialPDF } from '@/lib/utils/export-historial-pdf';
import { toast } from 'sonner';

interface ExportarHistorialButtonProps {
  procedure: Procedure;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export default function ExportarHistorialButton({
  procedure,
  variant = 'outline',
  size = 'sm',
  showIcon = true,
  showText = true,
  className = '',
}: ExportarHistorialButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Pequeño delay para mostrar el loader (mejor UX)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Exportar a PDF
      exportarHistorialPDF(procedure);

      toast.success('Historial exportado correctamente', {
        description: `Se ha descargado el PDF del trámite ${procedure.codigo}`,
        icon: <FileText className='w-4 h-4' />,
      });
    } catch (error) {
      console.error('Error al exportar historial:', error);
      toast.error('Error al exportar historial', {
        description: 'No se pudo generar el PDF. Intente nuevamente.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-[#1e82ae] hover:bg-[#8922A8] text-white border border-[#2596be] ${className}`}
      title='Descargar historial en PDF'
    >
      {isExporting ? (
        <>
          <Loader2 className='w-4 h-4 animate-spin' />
          {showText && <span>Exportando...</span>}
        </>
      ) : (
        <>
          {showIcon && <Download className='w-4 h-4' />}
          {showText && <span>Exportar PDF</span>}
        </>
      )}
    </button>
  );
}

// src/components/documents/PDFViewer.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

// Configurar worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  documentUrl?: string;
  documentId: string;
  procedureId?: string;
  onReadThresholdReached?: () => void;
  onDownload?: () => void;
  readThreshold?: number;
  autoMarkAsRead?: boolean;
}

export default function PDFViewer({
  documentUrl,
  documentId,
  procedureId,
  onReadThresholdReached,
  onDownload,
  readThreshold = 80,
  autoMarkAsRead = true,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState<boolean>(false);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState<boolean>(false);

  const [visitedPages, setVisitedPages] = useState<Set<number>>(new Set([1]));
  const [readPercentage, setReadPercentage] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Cargar PDF al montar el componente
  useEffect(() => {
    loadPDF();
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [documentId]);

  // Actualizar porcentaje de lectura
  useEffect(() => {
    if (numPages > 0) {
      const percentage = (visitedPages.size / numPages) * 100;
      setReadPercentage(percentage);

      console.log('📊 Progreso de lectura:', {
        visitedPages: Array.from(visitedPages),
        totalPages: numPages,
        percentage: Math.round(percentage),
        threshold: readThreshold,
      });

      if (
        percentage >= readThreshold &&
        !hasMarkedAsRead &&
        autoMarkAsRead &&
        onReadThresholdReached
      ) {
        handleMarkAsRead();
      }
    }
  }, [visitedPages, numPages, readThreshold, hasMarkedAsRead, autoMarkAsRead]);

  // Registrar página visitada
  useEffect(() => {
    if (pageNumber > 0) {
      setVisitedPages((prev) => new Set(prev).add(pageNumber));
    }
  }, [pageNumber]);

  const handleMarkAsRead = async () => {
    if (isMarkingAsRead || hasMarkedAsRead) return;

    try {
      setIsMarkingAsRead(true);
      console.log('📖 Alcanzado umbral de lectura, marcando como leído...');

      if (onReadThresholdReached) {
        await onReadThresholdReached();
      }

      setHasMarkedAsRead(true);
      toast.success('Documento marcado como leído automáticamente');
      console.log('✅ Documento marcado como leído');
    } catch (error) {
      console.error('❌ Error al marcar como leído:', error);
    } finally {
      setIsMarkingAsRead(false);
    }
  };

  const loadPDF = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('📥 Cargando PDF del documento:', documentId);

      // ✅ Cargar el PDF como blob usando apiClient autenticado
      const response = await apiClient.get(`/documentos/${documentId}/content`, {
        responseType: 'blob',
      });

      console.log('✅ Blob recibido:', response.data);

      // Crear URL del blob
      const blob = response.data;
      const url = URL.createObjectURL(blob);

      setPdfUrl(url);
      setLoading(false);
      console.log('✅ PDF cargado correctamente');
    } catch (err: unknown) {
      console.error('❌ Error cargando PDF:', err);

      // Mensaje de error más específico
      let errorMessage = 'Error al cargar el documento';
      if (err instanceof Error && err.message.includes('401')) {
        errorMessage = 'No tienes autorización para ver este documento';
      } else if (err instanceof Error && err.message.includes('404')) {
        errorMessage = 'Documento no encontrado';
      } else if (err instanceof Error && err.message.includes('403')) {
        errorMessage = 'No tienes permisos para acceder a este documento';
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    console.log('📄 PDF cargado:', { numPages });
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('❌ Error al renderizar PDF:', error);
    setError('No se pudo renderizar el documento PDF');
  };

  const changePage = (offset: number) => {
    const newPage = pageNumber + offset;
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  };

  const changeScale = (delta: number) => {
    setScale((prevScale) => Math.max(0.5, Math.min(prevScale + delta, 2.0)));
  };

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center h-96'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600 mx-auto mb-4' />
        <p className='text-gray-600'>Cargando documento PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-96 text-center px-4'>
        <AlertCircle className='w-16 h-16 text-red-400 mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>Error al cargar el documento</h3>
        <p className='text-gray-600 mb-4'>{error}</p>
        {onDownload && (
          <button
            onClick={onDownload}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2'
          >
            <Download className='w-4 h-4' />
            Descargar PDF
          </button>
        )}
      </div>
    );
  }

  return (
    <div className='flex flex-col h-[800px] border border-gray-200 rounded-lg overflow-hidden bg-white'>
      {/* Header con controles */}
      <div className='flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200'>
        {/* Navegación de páginas */}
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className='p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            title='Página anterior'
          >
            <ChevronLeft className='w-5 h-5' />
          </button>

          <div className='flex items-center space-x-2'>
            <span className='text-sm text-gray-700'>Página</span>
            <input
              type='number'
              value={pageNumber}
              onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
              min={1}
              max={numPages}
              className='w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
            <span className='text-sm text-gray-700'>de {numPages}</span>
          </div>

          <button
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
            className='p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            title='Página siguiente'
          >
            <ChevronRight className='w-5 h-5' />
          </button>
        </div>

        {/* Controles de zoom */}
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => changeScale(-0.1)}
            disabled={scale <= 0.5}
            className='px-3 py-1 text-sm bg-white rounded hover:bg-gray-100 disabled:opacity-50 transition-colors border border-gray-300'
            title='Reducir zoom'
          >
            −
          </button>
          <span className='text-sm font-medium min-w-[60px] text-center'>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => changeScale(0.1)}
            disabled={scale >= 2.0}
            className='px-3 py-1 text-sm bg-white rounded hover:bg-gray-100 disabled:opacity-50 transition-colors border border-gray-300'
            title='Aumentar zoom'
          >
            +
          </button>
        </div>

        {/* Indicador de progreso - SOLO mostrar si NO está marcado como leído */}
        {!hasMarkedAsRead && autoMarkAsRead && (
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <span className='text-xs text-gray-600'>Progreso:</span>
              <div className='w-32 h-2 bg-gray-200 rounded-full overflow-hidden'>
                <div
                  className='h-full transition-all duration-300 bg-blue-500'
                  style={{ width: `${Math.min(readPercentage, 100)}%` }}
                />
              </div>
              <span className='text-xs font-medium text-gray-700'>
                {Math.round(readPercentage)}%
              </span>
            </div>

            {isMarkingAsRead && (
              <div className='flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs'>
                <Loader2 className='w-3 h-3 animate-spin' />
                Marcando...
              </div>
            )}
          </div>
        )}

        {/* Badge "Leído" - SOLO mostrar cuando ya se marcó como leído */}
        {hasMarkedAsRead && (
          <div className='flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium'>
            <CheckCircle className='w-4 h-4' />
            Documento Leído
          </div>
        )}
      </div>

      {/* Contenedor del PDF */}
      <div ref={containerRef} className='flex-1 overflow-auto bg-gray-100 p-4'>
        <div className='flex flex-col items-center'>
          {pdfUrl && (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className='flex items-center justify-center p-8'>
                  <Loader2 className='w-6 h-6 animate-spin text-blue-600' />
                  <span className='ml-2 text-gray-600'>Cargando PDF...</span>
                </div>
              }
              error={
                <div className='text-center p-8'>
                  <AlertCircle className='w-12 h-12 text-red-400 mx-auto mb-3' />
                  <p className='text-red-600'>Error al renderizar el PDF</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className='shadow-lg'
                loading={
                  <div className='flex items-center justify-center p-8 bg-white'>
                    <Loader2 className='w-6 h-6 animate-spin text-blue-600' />
                  </div>
                }
              />
            </Document>
          )}
        </div>
      </div>

      {/* Footer con ayuda - SOLO mostrar si NO está marcado como leído */}
      {autoMarkAsRead && !hasMarkedAsRead && (
        <div className='px-4 py-2 bg-blue-50 border-t border-blue-200 text-xs text-blue-800'>
          💡 El documento se marcará como leído automáticamente cuando visites al menos el{' '}
          {readThreshold}% de las páginas
        </div>
      )}

      {/* Footer cuando ya está leído */}
      {hasMarkedAsRead && (
        <div className='px-4 py-2 bg-green-50 border-t border-green-200 text-xs text-green-800'>
          ✅ Este documento ya ha sido marcado como leído
        </div>
      )}
    </div>
  );
}

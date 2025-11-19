'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { getDocumentBlob } from '@/lib/api/documents';
import { Loader2, ChevronLeft, ChevronRight, Download, AlertCircle } from 'lucide-react';

// Configurar worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    documentId: string;
    onReadComplete?: () => void; // Callback cuando se considera "leído"
    readThreshold?: number; // % de scroll para considerar leído (default: 50)
}

export default function PDFViewer({
                                      documentId,
                                      onReadComplete,
                                      readThreshold = 50
                                  }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [scale, setScale] = useState<number>(1.0);
    const [hasMarkedAsRead, setHasMarkedAsRead] = useState<boolean>(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollPercentage, setScrollPercentage] = useState<number>(0);

    // Cargar PDF al montar el componente
    useEffect(() => {
        loadPDF();
        return () => {
            // Limpiar URL blob al desmontar
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [documentId]);

    // Detectar scroll para marcar como leído
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const percentage = ((scrollTop + clientHeight) / scrollHeight) * 100;
            setScrollPercentage(percentage);

            // Marcar como leído si alcanza el umbral
            if (percentage >= readThreshold && !hasMarkedAsRead && onReadComplete) {
                setHasMarkedAsRead(true);
                onReadComplete();
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [readThreshold, hasMarkedAsRead, onReadComplete]);

    const loadPDF = async () => {
        setLoading(true);
        setError(null);

        try {
            const blob = await getDocumentBlob(documentId);
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            setLoading(false);
        } catch (err: any) {
            console.error('Error cargando PDF:', err);
            setError(err.message || 'Error al cargar el documento');
            setLoading(false);
        }
    };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const onDocumentLoadError = (error: Error) => {
        console.error('Error al renderizar PDF:', error);
        setError('No se pudo renderizar el documento PDF');
    };

    const changePage = (offset: number) => {
        setPageNumber(prevPage => Math.max(1, Math.min(prevPage + offset, numPages)));
    };

    const changeScale = (delta: number) => {
        setScale(prevScale => Math.max(0.5, Math.min(prevScale + delta, 2.0)));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Cargando documento...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-red-600">
                <AlertCircle className="w-12 h-12 mb-3" />
                <p className="text-lg font-semibold">Error al cargar el documento</p>
                <p className="text-sm text-gray-600 mt-2">{error}</p>
                <button
                    onClick={loadPDF}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Barra de herramientas */}
            <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => changePage(-1)}
                        disabled={pageNumber <= 1}
                        className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <span className="text-sm font-medium">
                        Página {pageNumber} de {numPages}
                    </span>

                    <button
                        onClick={() => changePage(1)}
                        disabled={pageNumber >= numPages}
                        className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => changeScale(-0.1)}
                        disabled={scale <= 0.5}
                        className="px-3 py-1 text-sm bg-white rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        −
                    </button>
                    <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
                    <button
                        onClick={() => changeScale(0.1)}
                        disabled={scale >= 2.0}
                        className="px-3 py-1 text-sm bg-white rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        +
                    </button>
                </div>

                {/* Indicador de progreso de lectura */}
                {onReadComplete && (
                    <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-300 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${
                                    hasMarkedAsRead ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(scrollPercentage, 100)}%` }}
                            />
                        </div>
                        {hasMarkedAsRead && (
                            <span className="text-xs text-green-600 font-medium">
                                ✓ Leído
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Contenedor del PDF con scroll */}
            <div
                ref={containerRef}
                className="flex-1 overflow-auto bg-gray-50 p-4"
            >
                <div className="flex flex-col items-center space-y-4">
                    {pdfUrl && (
                        <Document
                            file={pdfUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                </div>
                            }
                            error={
                                <div className="text-center p-8 text-red-600">
                                    Error al renderizar el PDF
                                </div>
                            }
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                className="shadow-lg"
                            />
                        </Document>
                    )}
                </div>
            </div>
        </div>
    );
}
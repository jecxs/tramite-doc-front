// src/components/documents/PDFViewer.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Download,
    Loader2,
    FileText,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';
import Button from '@/components/ui/Button';

// Configurar worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
    documentUrl: string;
    documentId: string;
    procedureId: string;
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
                                      readThreshold = 50,
                                      autoMarkAsRead = true,
                                  }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [pagesViewed, setPagesViewed] = useState<Set<number>>(new Set([1]));
    const [hasMarkedAsRead, setHasMarkedAsRead] = useState<boolean>(false);
    const [isMarkingAsRead, setIsMarkingAsRead] = useState<boolean>(false);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    // Calcular si ha leído suficiente del documento
    const hasReadEnough = useCallback(() => {
        if (numPages === 0) return false;
        const readPercentage = (pagesViewed.size / numPages) * 100;
        return readPercentage >= readThreshold;
    }, [pagesViewed, numPages, readThreshold]);

    // Marcar como leído cuando alcanza el threshold
    useEffect(() => {
        const markAsReadIfNeeded = async () => {
            if (!hasMarkedAsRead && hasReadEnough() && !isMarkingAsRead && autoMarkAsRead && onReadThresholdReached) {
                try {
                    setIsMarkingAsRead(true);
                    onReadThresholdReached();
                    setHasMarkedAsRead(true);
                } catch (error) {
                    console.error('Error marking as read:', error);
                } finally {
                    setIsMarkingAsRead(false);
                }
            }
        };

        markAsReadIfNeeded();
    }, [pagesViewed, hasMarkedAsRead, hasReadEnough, onReadThresholdReached, autoMarkAsRead, isMarkingAsRead]);

    // Intersection Observer para detectar páginas visibles
    useEffect(() => {
        if (numPages === 0) return;

        const observerOptions = {
            root: scrollContainerRef.current,
            threshold: 0.5, // 50% de la página visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const pageNum = parseInt(entry.target.getAttribute('data-page') || '0');
                    if (pageNum > 0) {
                        setPagesViewed(prev => new Set([...prev, pageNum]));
                    }
                }
            });
        }, observerOptions);

        // Observar todas las páginas
        pageRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [numPages]);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
        setError('');
        console.log('✅ PDF cargado:', numPages, 'páginas');
    };

    const onDocumentLoadError = (error: Error) => {
        console.error('❌ Error loading PDF:', error);
        setError('Error al cargar el documento PDF. Intenta descargarlo.');
        setLoading(false);
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= numPages) {
            setPageNumber(page);
            const pageElement = pageRefs.current.get(page);
            if (pageElement) {
                pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    const changePage = (offset: number) => {
        goToPage(pageNumber + offset);
    };

    const zoomIn = () => {
        setScale(prev => Math.min(prev + 0.2, 2.0));
    };

    const zoomOut = () => {
        setScale(prev => Math.max(prev - 0.2, 0.5));
    };

    const readPercentage = numPages > 0 ? Math.round((pagesViewed.size / numPages) * 100) : 0;

    return (
        <div className="flex flex-col h-[800px] bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-900">
                                Documento PDF
                            </span>
                        </div>

                        {!loading && !error && (
                            <>
                                <div className="h-6 w-px bg-gray-300" />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => changePage(-1)}
                                        disabled={pageNumber <= 1}
                                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        type="button"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Página {pageNumber} de {numPages}
                                    </span>
                                    <button
                                        onClick={() => changePage(1)}
                                        disabled={pageNumber >= numPages}
                                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        type="button"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {!loading && !error && (
                            <>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={zoomOut}
                                        disabled={scale <= 0.5}
                                        className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                                        type="button"
                                    >
                                        <ZoomOut className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                                        {Math.round(scale * 100)}%
                                    </span>
                                    <button
                                        onClick={zoomIn}
                                        disabled={scale >= 2.0}
                                        className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                                        type="button"
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="h-6 w-px bg-gray-300" />
                            </>
                        )}

                        {onDownload && (
                            <Button
                                onClick={onDownload}
                                size="sm"
                                type="button"
                            >
                                <Download className="w-4 h-4" />
                                Descargar
                            </Button>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                {!loading && !error && autoMarkAsRead && (
                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">
                                Progreso de lectura: {readPercentage}% ({pagesViewed.size} de {numPages} páginas)
                            </span>
                            {hasMarkedAsRead ? (
                                <span className="flex items-center gap-1 text-xs text-green-600">
                                    <CheckCircle className="w-3 h-3" />
                                    Marcado como leído
                                </span>
                            ) : readPercentage >= readThreshold ? (
                                <span className="flex items-center gap-1 text-xs text-blue-600">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Marcando como leído...
                                </span>
                            ) : (
                                <span className="text-xs text-gray-500">
                                    Lee al menos el {readThreshold}% para marcar como leído
                                </span>
                            )}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    readPercentage >= readThreshold ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${readPercentage}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* PDF Content */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-auto bg-gray-100 p-4"
            >
                {loading && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-600">Cargando documento...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-md">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <p className="text-gray-900 font-medium mb-2">Error al cargar el documento</p>
                            <p className="text-gray-600 text-sm mb-4">{error}</p>
                            {onDownload && (
                                <Button onClick={onDownload}>
                                    <Download className="w-4 h-4" />
                                    Descargar PDF
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {!loading && !error && documentUrl && (
                    <Document
                        file={documentUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        }
                        className="flex flex-col items-center gap-4"
                    >
                        {Array.from(new Array(numPages), (_, index) => {
                            const pageNum = index + 1;
                            return (
                                <div
                                    key={`page_${pageNum}`}
                                    ref={(el) => {
                                        if (el) pageRefs.current.set(pageNum, el);
                                    }}
                                    data-page={pageNum}
                                    className="bg-white shadow-lg"
                                >
                                    <Page
                                        pageNumber={pageNum}
                                        scale={scale}
                                        renderTextLayer={true}
                                        renderAnnotationLayer={true}
                                        loading={
                                            <div className="flex items-center justify-center p-8">
                                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                            </div>
                                        }
                                    />
                                    <div className="text-center py-2 text-sm text-gray-500 bg-white border-t">
                                        Página {pageNum}
                                    </div>
                                </div>
                            );
                        })}
                    </Document>
                )}
            </div>
        </div>
    );
}
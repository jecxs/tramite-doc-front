// src/components/documents/PDFViewer.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Download,
    Maximize2,
    Minimize2,
    Loader2,
    AlertCircle,
    CheckCircle,
    Eye,
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface PDFViewerProps {
    pdfUrl: string;
    documentName: string;
    onReadDetected?: () => void; // Callback cuando se detecta lectura
    readThreshold?: number; // Porcentaje para considerar "leído" (default: 50%)
    procedureId?: string;
}

export default function PDFViewer({
                                      pdfUrl,
                                      documentName,
                                      onReadDetected,
                                      readThreshold = 50,
                                      procedureId,
                                  }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [scrollPercentage, setScrollPercentage] = useState(0);
    const [hasBeenRead, setHasBeenRead] = useState(false);
    const [readNotified, setReadNotified] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Detectar scroll y calcular porcentaje de lectura
    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        // Calcular porcentaje de scroll
        const percentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollPercentage(Math.min(100, Math.max(0, percentage)));

        // Si alcanzó el threshold y no se ha notificado, marcar como leído
        if (percentage >= readThreshold && !readNotified && onReadDetected) {
            console.log(`✅ Documento leído al ${percentage.toFixed(1)}%`);
            setHasBeenRead(true);
            setReadNotified(true);
            onReadDetected();
        }
    }, [readThreshold, readNotified, onReadDetected]);

    // Agregar listener de scroll
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = documentName || 'documento.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));

    return (
        <div className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-300 p-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                        {documentName}
                    </span>
                    {hasBeenRead && !readNotified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Leído
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Progress Indicator */}
                    {scrollPercentage > 0 && (
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg border border-blue-200">
                            <Eye className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-900">
                                {scrollPercentage.toFixed(0)}% leído
                            </span>
                        </div>
                    )}

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
                        <button
                            onClick={zoomOut}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="Alejar"
                        >
                            <ZoomOut className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-xs font-medium text-gray-700 px-2 min-w-[50px] text-center">
                            {(scale * 100).toFixed(0)}%
                        </span>
                        <button
                            onClick={zoomIn}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="Acercar"
                        >
                            <ZoomIn className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>

                    {/* Download Button */}
                    <button
                        onClick={handleDownload}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Descargar"
                    >
                        <Download className="w-4 h-4 text-gray-600" />
                    </button>

                    {/* Fullscreen Button */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                    >
                        {isFullscreen ? (
                            <Minimize2 className="w-4 h-4 text-gray-600" />
                        ) : (
                            <Maximize2 className="w-4 h-4 text-gray-600" />
                        )}
                    </button>
                </div>
            </div>

            {/* PDF Container */}
            <div
                ref={containerRef}
                className="flex-1 overflow-auto bg-gray-200 p-4"
                style={{ height: 'calc(100vh - 200px)' }}
            >
                {error ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center p-8 bg-white rounded-lg border border-red-200">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <p className="text-red-900 font-medium mb-2">Error al cargar el PDF</p>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <iframe
                            ref={iframeRef}
                            src={`${pdfUrl}#view=FitH`}
                            className="bg-white shadow-lg"
                            style={{
                                width: `${100 * scale}%`,
                                minHeight: '800px',
                                height: 'auto',
                                border: 'none',
                            }}
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                setIsLoading(false);
                                setError('No se pudo cargar el PDF. Intente descargarlo.');
                            }}
                            title={documentName}
                        />
                    </div>
                )}

                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Cargando PDF...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Reading Progress Bar */}
            {scrollPercentage > 0 && scrollPercentage < 100 && (
                <div className="bg-white border-t border-gray-300 px-4 py-2">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-700 min-w-[80px]">
                            Progreso de lectura
                        </span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${
                                    scrollPercentage >= readThreshold
                                        ? 'bg-green-500'
                                        : 'bg-blue-500'
                                }`}
                                style={{ width: `${scrollPercentage}%` }}
                            />
                        </div>
                        <span className="text-xs font-medium text-gray-700 min-w-[40px] text-right">
                            {scrollPercentage.toFixed(0)}%
                        </span>
                    </div>
                    {scrollPercentage >= readThreshold && !readNotified && (
                        <p className="text-xs text-green-600 mt-1 text-center">
                            ✓ Has leído suficiente del documento. Se marcará como leído automáticamente.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
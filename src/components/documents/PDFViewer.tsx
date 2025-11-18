// src/components/documents/PDFViewer.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, AlertCircle, ZoomIn, ZoomOut, Download, Maximize2, FileCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

interface PDFViewerProps {
    documentUrl: string;
    documentId: string;
    procedureId: string;
    onReadThresholdReached?: () => void;
    onDownload?: () => void;
    readThreshold?: number; // Porcentaje de scroll para considerar "leído" (default: 50%)
    autoMarkAsRead?: boolean; // Si debe marcar como leído automáticamente
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [scrollPercentage, setScrollPercentage] = useState(0);
    const [hasReachedThreshold, setHasReachedThreshold] = useState(false);
    const [zoom, setZoom] = useState(100);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Rastrear scroll del PDF
    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;

            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            const maxScroll = scrollHeight - clientHeight;

            if (maxScroll <= 0) {
                // Si el documento es más pequeño que el contenedor, se considera leído
                setScrollPercentage(100);
                return;
            }

            const percentage = Math.round((scrollTop / maxScroll) * 100);
            setScrollPercentage(Math.min(percentage, 100));
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            // Calcular porcentaje inicial
            handleScroll();
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    // Detectar cuando se alcanza el umbral de lectura
    useEffect(() => {
        if (scrollPercentage >= readThreshold && !hasReachedThreshold) {
            setHasReachedThreshold(true);

            if (autoMarkAsRead && onReadThresholdReached) {
                onReadThresholdReached();
                toast.success(`Has leído el ${readThreshold}% del documento`);
            }
        }
    }, [scrollPercentage, readThreshold, hasReachedThreshold, autoMarkAsRead, onReadThresholdReached]);

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 10, 200));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 10, 50));
    };

    const handleFullscreen = () => {
        if (containerRef.current) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            }
        }
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setError('Error al cargar el documento PDF');
    };

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <p className="text-red-800 font-medium">{error}</p>
                <p className="text-red-600 text-sm mt-2">
                    Intenta descargar el documento si el problema persiste
                </p>
                {onDownload && (
                    <Button onClick={onDownload} variant="outline" size="sm" className="mt-4">
                        <Download className="w-4 h-4" />
                        Descargar PDF
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Barra de controles */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Indicador de progreso de lectura */}
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-700">
                            Progreso de lectura:
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${
                                        scrollPercentage >= readThreshold
                                            ? 'bg-green-600'
                                            : 'bg-blue-600'
                                    }`}
                                    style={{ width: `${scrollPercentage}%` }}
                                />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                                {scrollPercentage}%
                            </span>
                            {hasReachedThreshold && (
                                <FileCheck className="w-4 h-4 text-green-600" />
                            )}
                        </div>
                    </div>

                    {/* Controles de zoom */}
                    <div className="flex items-center gap-2 border-l pl-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleZoomOut}
                            disabled={zoom <= 50}
                        >
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium text-gray-700 min-w-[50px] text-center">
                            {zoom}%
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleZoomIn}
                            disabled={zoom >= 200}
                        >
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleFullscreen}>
                        <Maximize2 className="w-4 h-4" />
                        Pantalla completa
                    </Button>
                    {onDownload && (
                        <Button variant="outline" size="sm" onClick={onDownload}>
                            <Download className="w-4 h-4" />
                            Descargar
                        </Button>
                    )}
                </div>
            </div>

            {/* Advertencia sobre el umbral de lectura */}
            {!hasReachedThreshold && autoMarkAsRead && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-blue-900">
                            Debes leer al menos el <strong>{readThreshold}%</strong> del documento para marcarlo como leído.
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                            Desplázate hacia abajo para continuar leyendo.
                        </p>
                    </div>
                </div>
            )}

            {/* Visor de PDF */}
            <div
                ref={containerRef}
                className="relative bg-gray-100 border border-gray-300 rounded-lg overflow-auto"
                style={{ height: '800px' }}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                            <p className="text-gray-600">Cargando documento PDF...</p>
                        </div>
                    </div>
                )}

                <iframe
                    ref={iframeRef}
                    src={`${documentUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    className="w-full h-full border-0"
                    style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top left',
                        width: `${(100 / zoom) * 100}%`,
                        height: `${(100 / zoom) * 100}%`,
                    }}
                    onLoad={handleLoad}
                    onError={handleError}
                    title="PDF Viewer"
                />
            </div>

            {/* Indicador visual de lectura completada */}
            {hasReachedThreshold && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <FileCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-green-900">
                            ¡Documento leído exitosamente!
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                            Has alcanzado el {readThreshold}% del documento y se ha marcado como leído automáticamente.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
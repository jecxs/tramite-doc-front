// src/components/documents/DocumentViewer.tsx
'use client';

import { useState, useEffect } from 'react';
import { FileText, FileSpreadsheet, AlertCircle, Download, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';
import PDFViewer from './PDFViewer';
import { toast } from 'sonner';

interface DocumentViewerProps {
    documentUrl: string;
    documentId: string;
    procedureId: string;
    fileName: string;
    fileExtension: string;
    onReadThresholdReached?: () => void;
    onDownload?: () => void;
    readThreshold?: number;
    autoMarkAsRead?: boolean;
}

// Tipos de archivo que se pueden visualizar en el navegador
const VIEWABLE_EXTENSIONS = ['.pdf'];

// Tipos de archivo que requieren descarga
const DOWNLOADABLE_EXTENSIONS = ['.xlsx', '.xls', '.doc', '.docx', '.csv', '.zip'];

export default function DocumentViewer({
                                           documentUrl,
                                           documentId,
                                           procedureId,
                                           fileName,
                                           fileExtension,
                                           onReadThresholdReached,
                                           onDownload,
                                           readThreshold = 50,
                                           autoMarkAsRead = true,
                                       }: DocumentViewerProps) {
    const extension = fileExtension.toLowerCase();
    const isViewable = VIEWABLE_EXTENSIONS.includes(extension);
    const requiresDownload = DOWNLOADABLE_EXTENSIONS.includes(extension);

    // Si es PDF, usar el visor especializado
    if (extension === '.pdf' && isViewable) {
        return (
            <PDFViewer
                documentUrl={documentUrl}
                documentId={documentId}
                procedureId={procedureId}
                onReadThresholdReached={onReadThresholdReached}
                onDownload={onDownload}
                readThreshold={readThreshold}
                autoMarkAsRead={autoMarkAsRead}
            />
        );
    }

    // Para archivos que requieren descarga (Excel, Word, etc.)
    if (requiresDownload) {
        return (
            <DownloadableDocument
                fileName={fileName}
                fileExtension={extension}
                onDownload={onDownload}
                onMarkAsRead={onReadThresholdReached}
                autoMarkAsRead={autoMarkAsRead}
            />
        );
    }

    // Para otros tipos de archivo no soportados
    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-yellow-900 font-medium">
                Este tipo de archivo no se puede visualizar en el navegador
            </p>
            <p className="text-yellow-700 text-sm mt-2">
                Extensión: <span className="font-mono font-semibold">{fileExtension}</span>
            </p>
            {onDownload && (
                <Button onClick={onDownload} className="mt-4">
                    <Download className="w-4 h-4" />
                    Descargar Archivo
                </Button>
            )}
        </div>
    );
}

// Componente para archivos que deben descargarse
interface DownloadableDocumentProps {
    fileName: string;
    fileExtension: string;
    onDownload?: () => void;
    onMarkAsRead?: () => void;
    autoMarkAsRead?: boolean;
}

function DownloadableDocument({
                                  fileName,
                                  fileExtension,
                                  onDownload,
                                  onMarkAsRead,
                                  autoMarkAsRead,
                              }: DownloadableDocumentProps) {
    const [hasDownloaded, setHasDownloaded] = useState(false);

    const getFileIcon = () => {
        if (['.xlsx', '.xls', '.csv'].includes(fileExtension)) {
            return <FileSpreadsheet className="w-16 h-16 text-green-600" />;
        }
        return <FileText className="w-16 h-16 text-blue-600" />;
    };

    const getFileTypeLabel = () => {
        switch (fileExtension) {
            case '.xlsx':
            case '.xls':
                return 'Hoja de Cálculo Excel';
            case '.csv':
                return 'Archivo CSV';
            case '.doc':
            case '.docx':
                return 'Documento Word';
            case '.zip':
                return 'Archivo Comprimido';
            default:
                return 'Archivo';
        }
    };

    const handleDownload = () => {
        if (onDownload) {
            onDownload();
            setHasDownloaded(true);

            // Para archivos no visualizables, marcar como leído al descargar
            if (autoMarkAsRead && onMarkAsRead && !hasDownloaded) {
                // Esperar un momento para que el usuario sepa que se descargó
                setTimeout(() => {
                    onMarkAsRead();
                    toast.success('Documento marcado como leído al descargar');
                }, 1000);
            }
        }
    };

    return (
        <div className="space-y-4">
            {/* Información sobre archivos descargables */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                        Este tipo de archivo debe descargarse para visualizarlo
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                        El documento se marcará como leído automáticamente al descargarlo.
                    </p>
                </div>
            </div>

            {/* Preview del archivo */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12">
                <div className="text-center">
                    {getFileIcon()}
                    <h3 className="text-lg font-semibold text-gray-900 mt-4">
                        {fileName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {getFileTypeLabel()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Extensión: <span className="font-mono">{fileExtension}</span>
                    </p>

                    <div className="flex items-center justify-center gap-3 mt-6">
                        <Button onClick={handleDownload} size="lg">
                            <Download className="w-5 h-5" />
                            {hasDownloaded ? 'Descargar Nuevamente' : 'Descargar Archivo'}
                        </Button>
                    </div>

                    {hasDownloaded && (
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
                            <Eye className="w-4 h-4" />
                            Archivo descargado
                        </div>
                    )}
                </div>
            </div>

            {/* Instrucciones adicionales */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    📌 Instrucciones para visualizar:
                </h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    {['.xlsx', '.xls'].includes(fileExtension) && (
                        <>
                            <li>Abre el archivo con Microsoft Excel, Google Sheets o LibreOffice Calc</li>
                            <li>Si no tienes Excel, puedes usar Google Sheets (gratuito)</li>
                        </>
                    )}
                    {['.doc', '.docx'].includes(fileExtension) && (
                        <>
                            <li>Abre el archivo con Microsoft Word, Google Docs o LibreOffice Writer</li>
                            <li>Si no tienes Word, puedes usar Google Docs (gratuito)</li>
                        </>
                    )}
                    {fileExtension === '.csv' && (
                        <>
                            <li>Abre el archivo con Excel, Google Sheets o cualquier editor de texto</li>
                            <li>Los datos están separados por comas</li>
                        </>
                    )}
                    {fileExtension === '.zip' && (
                        <>
                            <li>Extrae el contenido con WinRAR, 7-Zip o la herramienta de tu sistema</li>
                            <li>Revisa los archivos extraídos</li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
}
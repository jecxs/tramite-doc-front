// src/app/(dashboard)/trabajador/tramites/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    ArrowLeft,
    FileText,
    User,
    Building2,
    Calendar,
    Clock,
    Download,
    Eye,
    AlertCircle,
    CheckCircle,
    XCircle,
    RefreshCw,
    Send,
    Mail,
    Phone,
    PenTool,
    MessageSquare,
    History,
    FileCheck,
    Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ProcedureStateBadge } from '@/components/ui/Badge';
import {
    getProcedureById,
    markProcedureAsOpened,
    markProcedureAsRead,
} from '@/lib/api/tramites';
import { Procedure } from '@/types';
import { PROCEDURE_STATE_LABELS } from '@/lib/constants';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import DocumentViewer from '@/components/documents/DocumentViewer';

export default function WorkerProcedureDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [procedure, setProcedure] = useState<Procedure | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isMarking, setIsMarking] = useState(false);
    const [error, setError] = useState<string>('');
    const [documentUrl, setDocumentUrl] = useState<string>('');
    const [viewMode, setViewMode] = useState<'viewer' | 'details'>('details');

    useEffect(() => {
        if (id) {
            fetchProcedure();
        }
    }, [id]);

    const fetchProcedure = async () => {
        try {
            setIsLoading(true);
            setError('');
            const data = await getProcedureById(id);

            console.log('✅ Trámite cargado:', data);

            // Verificar que el documento tenga la estructura completa
            if (!data.documento || !data.documento.tipo) {
                console.error('❌ Documento incompleto:', data.documento);
                throw new Error('El documento no tiene la información completa');
            }

            setProcedure(data);

            // Obtener URL del documento
            await fetchDocumentUrl(data.id_documento);

            // Marcar como abierto automáticamente si está en estado ENVIADO
            if (data.estado === 'ENVIADO') {
                await handleMarkAsOpened(data);
            }
        } catch (err: any) {
            console.error('❌ Error fetching procedure:', err);
            setError(err.message || 'Error al cargar el trámite');
            toast.error('Error al cargar el trámite');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDocumentUrl = async (documentId: string) => {
        try {
            // Usar endpoint proxy en lugar de URL firmada
            const proxyUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/documentos/${documentId}/content`;

            console.log('📄 Usando proxy URL:', proxyUrl);
            setDocumentUrl(proxyUrl);
        } catch (err: any) {
            console.error('Error setting document URL:', err);
            toast.error('Error al obtener la URL del documento');
        }
    };

    const handleMarkAsOpened = async (proc: Procedure) => {
        try {
            const updated = await markProcedureAsOpened(proc.id_tramite);
            setProcedure(updated);
        } catch (err: any) {
            console.error('Error marking as opened:', err);
        }
    };

    const handleMarkAsRead = async () => {
        if (!procedure || procedure.estado !== 'ABIERTO') return;

        try {
            setIsMarking(true);
            const updated = await markProcedureAsRead(procedure.id_tramite);
            setProcedure(updated);
            toast.success('Documento marcado como leído');
        } catch (err: any) {
            console.error('Error marking as read:', err);
            toast.error('Error al marcar como leído');
        } finally {
            setIsMarking(false);
        }
    };

    const handleReadThresholdReached = async () => {
        // Solo marcar como leído si está en estado ABIERTO
        if (procedure && procedure.estado === 'ABIERTO') {
            await handleMarkAsRead();
        }
    };

    const handleDownload = async () => {
        if (!procedure) return;

        try {
            setIsDownloading(true);

            if (documentUrl) {
                // Abrir la URL firmada en una nueva ventana para descargar
                window.open(documentUrl, '_blank');
                toast.success('Descargando documento...');

                // Si es un archivo no visualizable (Excel, etc.) y está en ABIERTO, marcar como leído
                const extension = procedure.documento.extension.toLowerCase();
                if (!['.pdf'].includes(extension) && procedure.estado === 'ABIERTO') {
                    setTimeout(() => {
                        handleMarkAsRead();
                    }, 1000);
                }
            } else {
                throw new Error('No se pudo obtener la URL de descarga');
            }
        } catch (err: any) {
            console.error('Error downloading document:', err);
            toast.error('Error al descargar el documento');
        } finally {
            setIsDownloading(false);
        }
    };

    const getEstadoIcon = (estado: string) => {
        switch (estado) {
            case 'ENVIADO':
                return <Send className="w-5 h-5 text-blue-600" />;
            case 'ABIERTO':
                return <Eye className="w-5 h-5 text-purple-600" />;
            case 'LEIDO':
                return <FileCheck className="w-5 h-5 text-indigo-600" />;
            case 'FIRMADO':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'ANULADO':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <FileText className="w-5 h-5 text-gray-600" />;
        }
    };

    const getAccionIcon = (accion: string) => {
        switch (accion) {
            case 'CREACION':
                return <Send className="w-4 h-4" />;
            case 'APERTURA':
                return <Eye className="w-4 h-4" />;
            case 'LECTURA':
                return <FileCheck className="w-4 h-4" />;
            case 'FIRMA':
                return <PenTool className="w-4 h-4" />;
            case 'OBSERVACION':
                return <MessageSquare className="w-4 h-4" />;
            case 'REENVIO':
                return <RefreshCw className="w-4 h-4" />;
            case 'ANULACION':
                return <XCircle className="w-4 h-4" />;
            default:
                return <History className="w-4 h-4" />;
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando documento...</p>
                </div>
            </div>
        );
    }

    if (error || !procedure) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Error al cargar el documento
                            </h3>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <Button onClick={() => router.back()}>
                                <ArrowLeft className="w-4 h-4" />
                                Volver
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Detalles del Documento
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Código: <span className="font-mono font-medium">{procedure.codigo}</span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Toggle entre visor y detalles */}
                    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('details')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                viewMode === 'details'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Detalles
                        </button>
                        <button
                            onClick={() => setViewMode('viewer')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                viewMode === 'viewer'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Eye className="w-4 h-4 inline mr-1" />
                            Ver Documento
                        </button>
                    </div>

                    {procedure.estado === 'ABIERTO' && viewMode === 'details' && (
                        <Button
                            onClick={handleMarkAsRead}
                            disabled={isMarking}
                            variant="outline"
                        >
                            {isMarking ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <FileCheck className="w-4 h-4" />
                            )}
                            Marcar como Leído
                        </Button>
                    )}
                </div>
            </div>

            {/* Estado actual */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {getEstadoIcon(procedure.estado)}
                            <div>
                                <p className="text-sm text-gray-600">Estado actual</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {PROCEDURE_STATE_LABELS[procedure.estado as keyof typeof PROCEDURE_STATE_LABELS]}
                                </p>
                            </div>
                        </div>
                        <ProcedureStateBadge estado={procedure.estado} />
                    </div>

                    {/* Alerta si requiere firma */}
                    {procedure.requiere_firma && procedure.estado === 'LEIDO' && (
                        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <PenTool className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-purple-900">
                                        Este documento requiere tu firma electrónica
                                    </p>
                                    <p className="text-sm text-purple-700 mt-1">
                                        Una vez que lo hayas leído completamente, dirígete a la sección de firma.
                                    </p>
                                    <Link href={`/trabajador/firmar?tramite=${procedure.id_tramite}`}>
                                        <Button size="sm" className="mt-3">
                                            <PenTool className="w-4 h-4" />
                                            Ir a Firmar
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Contenido condicional según el modo de vista */}
            {viewMode === 'viewer' ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Visualización del Documento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {documentUrl && procedure.documento ? (
                            <DocumentViewer
                                documentUrl={documentUrl}
                                documentId={procedure.id_documento}
                                procedureId={procedure.id_tramite}
                                fileName={procedure.documento.nombre_archivo}
                                fileExtension={procedure.documento.extension}
                                onReadThresholdReached={handleReadThresholdReached}
                                onDownload={handleDownload}
                                readThreshold={50}
                                autoMarkAsRead={procedure.estado === 'ABIERTO'}
                            />
                        ) : (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">Cargando documento...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                /* MODO DETALLES */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna Principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Información del Documento */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Documento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Asunto</label>
                                        <p className="text-base text-gray-900 mt-1">{procedure.asunto}</p>
                                    </div>

                                    {procedure.mensaje && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Mensaje</label>
                                            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                                                {procedure.mensaje}
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Tipo de Documento</label>
                                            <p className="text-sm text-gray-900 mt-1">
                                                {procedure.documento?.tipo?.nombre || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Código del Tipo</label>
                                            <p className="text-sm text-gray-900 mt-1 font-mono">
                                                {procedure.documento?.tipo?.codigo || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Archivo</label>
                                            <p className="text-sm text-gray-900 mt-1">
                                                {procedure.documento?.nombre_archivo || 'Cargando...'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Tamaño</label>
                                            <p className="text-sm text-gray-900 mt-1">
                                                {procedure.documento?.tamano_bytes
                                                    ? formatBytes(parseInt(procedure.documento.tamano_bytes))
                                                    : 'Cargando...'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Extensión</label>
                                            <p className="text-sm text-gray-900 mt-1 uppercase">
                                                {procedure.documento?.extension || 'Cargando...'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t">
                                        <Button onClick={handleDownload} disabled={isDownloading} variant="outline">
                                            {isDownloading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Download className="w-4 h-4" />
                                            )}
                                            Descargar Documento
                                        </Button>

                                        {procedure.requiere_firma && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                <PenTool className="w-3 h-3 mr-1.5" />
                                                Requiere Firma
                                            </span>
                                        )}
                                        {procedure.requiere_respuesta && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                <MessageSquare className="w-3 h-3 mr-1.5" />
                                                Requiere Respuesta
                                            </span>
                                        )}
                                        {procedure.es_reenvio && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                <RefreshCw className="w-3 h-3 mr-1.5" />
                                                Reenvío v{procedure.numero_version}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                        {/* Observaciones */}
                        {procedure.observaciones && procedure.observaciones.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5" />
                                        Observaciones
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {procedure.observaciones.map((obs) => (
                                            <div
                                                key={obs.id_observacion}
                                                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                        {obs.tipo}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {format(new Date(obs.fecha_creacion), 'dd/MM/yyyy HH:mm', { locale: es })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                                    {obs.descripcion}
                                                </p>
                                                {obs.resuelta && obs.respuesta && (
                                                    <div className="mt-3 pt-3 border-t border-gray-300">
                                                        <p className="text-xs font-medium text-green-700 mb-1">
                                                            Respuesta:
                                                        </p>
                                                        <p className="text-sm text-gray-800">
                                                            {obs.respuesta}
                                                        </p>
                                                        {obs.fecha_resolucion && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Resuelta el {format(new Date(obs.fecha_resolucion), 'dd/MM/yyyy HH:mm', { locale: es })}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Columna Lateral */}
                    <div className="space-y-6">
                        {/* Información del Remitente */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Remitente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {procedure.remitente.nombres} {procedure.remitente.apellidos}
                                            </p>
                                        </div>
                                    </div>

                                    {procedure.remitente.area && (
                                        <div className="flex items-start gap-3">
                                            <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900">{procedure.remitente.area.nombre}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900">{procedure.remitente.correo}</p>
                                        </div>
                                    </div>

                                    {procedure.remitente.telefono && (
                                        <div className="flex items-start gap-3">
                                            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900">{procedure.remitente.telefono}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Fechas importantes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Fechas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-600">Enviado</p>
                                            <p className="text-sm text-gray-900">
                                                {format(new Date(procedure.fecha_envio), 'dd/MM/yyyy HH:mm', { locale: es })}
                                            </p>
                                        </div>
                                    </div>

                                    {procedure.fecha_abierto && (
                                        <div className="flex items-start gap-3">
                                            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-600">Abierto</p>
                                                <p className="text-sm text-gray-900">
                                                    {format(new Date(procedure.fecha_abierto), 'dd/MM/yyyy HH:mm', { locale: es })}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {procedure.fecha_leido && (
                                        <div className="flex items-start gap-3">
                                            <FileCheck className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-600">Leído</p>
                                                <p className="text-sm text-gray-900">
                                                    {format(new Date(procedure.fecha_leido), 'dd/MM/yyyy HH:mm', { locale: es })}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Acciones Rápidas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Acciones</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Link
                                        href={`/trabajador/tramites/${procedure.id_tramite}/observacion`}
                                        className="block"
                                    >
                                        <Button variant="outline" className="w-full">
                                            <MessageSquare className="w-4 h-4" />
                                            Hacer Observación
                                        </Button>
                                    </Link>

                                    {procedure.requiere_firma && ['ABIERTO', 'LEIDO'].includes(procedure.estado) && (
                                        <Link
                                            href={`/trabajador/firmar?tramite=${procedure.id_tramite}`}
                                            className="block"
                                        >
                                            <Button className="w-full">
                                                <PenTool className="w-4 h-4" />
                                                Firmar Documento
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
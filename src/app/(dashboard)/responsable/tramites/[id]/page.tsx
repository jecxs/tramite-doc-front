// src/app/(dashboard)/responsable/tramites/[id]/page.tsx
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

export default function ProcedureDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [procedure, setProcedure] = useState<Procedure | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string>('');

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
            setProcedure(data);
        } catch (err: any) {
            console.error('Error fetching procedure:', err);
            setError(err.message || 'Error al cargar el trámite');
            toast.error('Error al cargar el trámite');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!procedure) return;

        try {
            setIsDownloading(true);
            // Usar el endpoint de documentos, no de trámites
            const response = await apiClient.get(
                `/documentos/${procedure.id_documento}/download`,
                { responseType: 'json' } // Primero obtenemos la URL firmada
            );

            // La respuesta contiene una URL firmada temporal
            if (response.data && response.data.download_url) {
                // Abrir la URL firmada en una nueva ventana para descargar
                window.open(response.data.download_url, '_blank');
                toast.success('Descargando documento...');
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
            case 'ANULACION':
                return <XCircle className="w-4 h-4" />;
            case 'REENVIO':
                return <RefreshCw className="w-4 h-4" />;
            default:
                return <History className="w-4 h-4" />;
        }
    };

    const getAccionColor = (accion: string) => {
        switch (accion) {
            case 'CREACION':
                return 'bg-blue-100 text-blue-700';
            case 'APERTURA':
                return 'bg-purple-100 text-purple-700';
            case 'LECTURA':
                return 'bg-indigo-100 text-indigo-700';
            case 'FIRMA':
                return 'bg-green-100 text-green-700';
            case 'OBSERVACION':
                return 'bg-orange-100 text-orange-700';
            case 'ANULACION':
                return 'bg-red-100 text-red-700';
            case 'REENVIO':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-gray-100 text-gray-700';
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
                    <p className="text-gray-600">Cargando trámite...</p>
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
                                Error al cargar el trámite
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
                            Detalles del Trámite
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Código: <span className="font-mono font-medium">{procedure.codigo}</span>
                        </p>
                    </div>
                </div>
                <Button onClick={handleDownload} disabled={isDownloading}>
                    {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    Descargar Documento
                </Button>
            </div>

            {/* Estado y Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Estado del Trámite</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Estado Actual */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                {getEstadoIcon(procedure.estado)}
                                <div>
                                    <p className="text-sm text-gray-600">Estado Actual</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {PROCEDURE_STATE_LABELS[procedure.estado]}
                                    </p>
                                </div>
                            </div>
                            <ProcedureStateBadge estado={procedure.estado} />
                        </div>

                        {/* Timeline Horizontal */}
                        <div className="relative">
                            <div className="flex items-center justify-between">
                                {/* Enviado */}
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        procedure.fecha_envio ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        <Send className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-medium mt-2 text-gray-700">Enviado</p>
                                    {procedure.fecha_envio && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {format(new Date(procedure.fecha_envio), 'dd/MM/yyyy HH:mm', { locale: es })}
                                        </p>
                                    )}
                                </div>

                                {/* Línea de conexión */}
                                <div className={`h-0.5 flex-1 ${
                                    procedure.fecha_abierto ? 'bg-blue-400' : 'bg-gray-300'
                                }`} />

                                {/* Abierto */}
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        procedure.fecha_abierto ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        <Eye className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-medium mt-2 text-gray-700">Abierto</p>
                                    {procedure.fecha_abierto && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {format(new Date(procedure.fecha_abierto), 'dd/MM/yyyy HH:mm', { locale: es })}
                                        </p>
                                    )}
                                </div>

                                {/* Línea de conexión */}
                                <div className={`h-0.5 flex-1 ${
                                    procedure.fecha_leido ? 'bg-purple-400' : 'bg-gray-300'
                                }`} />

                                {/* Leído */}
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        procedure.fecha_leido ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        <FileCheck className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-medium mt-2 text-gray-700">Leído</p>
                                    {procedure.fecha_leido && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {format(new Date(procedure.fecha_leido), 'dd/MM/yyyy HH:mm', { locale: es })}
                                        </p>
                                    )}
                                </div>

                                {procedure.requiere_firma && (
                                    <>
                                        {/* Línea de conexión */}
                                        <div className={`h-0.5 flex-1 ${
                                            procedure.fecha_firmado ? 'bg-indigo-400' : 'bg-gray-300'
                                        }`} />

                                        {/* Firmado */}
                                        <div className="flex flex-col items-center flex-1">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                procedure.fecha_firmado ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                                <PenTool className="w-5 h-5" />
                                            </div>
                                            <p className="text-xs font-medium mt-2 text-gray-700">Firmado</p>
                                            {procedure.fecha_firmado && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {format(new Date(procedure.fecha_firmado), 'dd/MM/yyyy HH:mm', { locale: es })}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Alerta si está anulado */}
                        {procedure.estado === 'ANULADO' && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-900">Trámite Anulado</p>
                                    {procedure.motivo_anulacion && (
                                        <p className="text-sm text-red-700 mt-1">{procedure.motivo_anulacion}</p>
                                    )}
                                    {procedure.fecha_anulado && (
                                        <p className="text-xs text-red-600 mt-2">
                                            {format(new Date(procedure.fecha_anulado), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

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
                                        <p className="text-sm text-gray-900 mt-1">{procedure.documento.tipo.nombre}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Archivo</label>
                                        <p className="text-sm text-gray-900 mt-1">{procedure.documento.nombre_archivo}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Tamaño</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {formatBytes(parseInt(procedure.documento.tamano_bytes))}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Extensión</label>
                                        <p className="text-sm text-gray-900 mt-1 uppercase">{procedure.documento.extension}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t">
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
                                            Versión {procedure.numero_version}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Historial del Trámite */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Historial del Trámite</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={fetchProcedure}
                                    disabled={isLoading}
                                >
                                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {!procedure.historial || procedure.historial.length === 0 ? (
                                <div className="text-center py-8">
                                    <History className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">No hay historial disponible</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {procedure.historial.map((item: any, index: number) => (
                                        <div key={item.id_historial} className="relative">
                                            {/* Línea conectora */}
                                            {index !== procedure.historial!.length - 1 && (
                                                <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200" />
                                            )}

                                            <div className="flex gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getAccionColor(item.accion)}`}>
                                                    {getAccionIcon(item.accion)}
                                                </div>
                                                <div className="flex-1 pb-4">
                                                    <div className="flex items-start justify-between mb-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {item.accion.charAt(0) + item.accion.slice(1).toLowerCase().replace('_', ' ')}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {format(new Date(item.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                                                        </p>
                                                    </div>
                                                    {item.detalle && (
                                                        <p className="text-sm text-gray-600 mb-2">{item.detalle}</p>
                                                    )}
                                                    {item.usuario && (
                                                        <p className="text-xs text-gray-500">
                                                            Por: {item.usuario.nombres} {item.usuario.apellidos}
                                                        </p>
                                                    )}
                                                    {(item.estado_anterior || item.estado_nuevo) && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {item.estado_anterior && (
                                                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                                                    {PROCEDURE_STATE_LABELS[item.estado_anterior as keyof typeof PROCEDURE_STATE_LABELS] || item.estado_anterior}
                                                                </span>
                                                            )}
                                                            {item.estado_anterior && item.estado_nuevo && (
                                                                <span className="text-xs text-gray-400">→</span>
                                                            )}
                                                            {item.estado_nuevo && (
                                                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                                                    {PROCEDURE_STATE_LABELS[item.estado_nuevo as keyof typeof PROCEDURE_STATE_LABELS] || item.estado_nuevo}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Observaciones */}
                    {procedure.observaciones && procedure.observaciones.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Observaciones ({procedure.observaciones.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {procedure.observaciones.map((obs) => (
                                        <div
                                            key={obs.id_observacion}
                                            className={`p-4 rounded-lg border ${
                                                obs.resuelta
                                                    ? 'bg-green-50 border-green-200'
                                                    : 'bg-orange-50 border-orange-200'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <MessageSquare className={`w-4 h-4 ${
                                                        obs.resuelta ? 'text-green-600' : 'text-orange-600'
                                                    }`} />
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                                        obs.resuelta
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                        {obs.tipo.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {format(new Date(obs.fecha_creacion), 'dd/MM/yyyy HH:mm', { locale: es })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-900 mb-2">{obs.descripcion}</p>
                                            {obs.resuelta && obs.respuesta && (
                                                <div className="mt-3 pt-3 border-t border-green-200">
                                                    <p className="text-xs font-medium text-green-900 mb-1">Respuesta:</p>
                                                    <p className="text-sm text-green-800">{obs.respuesta}</p>
                                                    {obs.fecha_resolucion && (
                                                        <p className="text-xs text-green-600 mt-2">
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

                    {/* Firma Electrónica */}
                    {procedure.firma && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Información de Firma Electrónica</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium text-green-900">
                                                Documento Firmado Electrónicamente
                                            </p>
                                            <p className="text-xs text-green-700 mt-1">
                                                {format(new Date(procedure.firma.fecha_firma), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-700">Dirección IP</label>
                                            <p className="text-sm text-gray-900 mt-1 font-mono">{procedure.firma.ip_address}</p>
                                        </div>
                                        {procedure.firma.navegador && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-700">Navegador</label>
                                                <p className="text-sm text-gray-900 mt-1">{procedure.firma.navegador}</p>
                                            </div>
                                        )}
                                        {procedure.firma.dispositivo && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-700">Dispositivo</label>
                                                <p className="text-sm text-gray-900 mt-1">{procedure.firma.dispositivo}</p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-xs font-medium text-gray-700">Términos Aceptados</label>
                                            <p className="text-sm text-gray-900 mt-1">
                                                {procedure.firma.acepta_terminos ? 'Sí' : 'No'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Columna Lateral */}
                <div className="space-y-6">
                    {/* Remitente */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Remitente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {procedure.remitente.nombres} {procedure.remitente.apellidos}
                                        </p>
                                        <p className="text-xs text-gray-500">Remitente</p>
                                    </div>
                                </div>
                                <div className="pt-3 border-t space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{procedure.remitente.correo}</span>
                                    </div>
                                    {procedure.remitente.telefono && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">{procedure.remitente.telefono}</span>
                                        </div>
                                    )}
                                    {procedure.areaRemitente && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Building2 className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">{procedure.areaRemitente.nombre}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Receptor */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Receptor</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {procedure.receptor.nombres} {procedure.receptor.apellidos}
                                        </p>
                                        <p className="text-xs text-gray-500">Receptor</p>
                                    </div>
                                </div>
                                <div className="pt-3 border-t space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{procedure.receptor.correo}</span>
                                    </div>
                                    {procedure.receptor.telefono && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">{procedure.receptor.telefono}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fechas Importantes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Fechas Importantes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Fecha de Envío</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {format(new Date(procedure.fecha_envio), 'dd/MM/yyyy HH:mm', { locale: es })}
                                        </p>
                                    </div>
                                </div>

                                {procedure.fecha_abierto && (
                                    <div className="flex items-start gap-2">
                                        <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Fecha de Apertura</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {format(new Date(procedure.fecha_abierto), 'dd/MM/yyyy HH:mm', { locale: es })}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {procedure.fecha_leido && (
                                    <div className="flex items-start gap-2">
                                        <FileCheck className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Fecha de Lectura</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {format(new Date(procedure.fecha_leido), 'dd/MM/yyyy HH:mm', { locale: es })}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {procedure.fecha_firmado && (
                                    <div className="flex items-start gap-2">
                                        <PenTool className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500">Fecha de Firma</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {format(new Date(procedure.fecha_firmado), 'dd/MM/yyyy HH:mm', { locale: es })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información de Reenvío */}
                    {procedure.es_reenvio && procedure.motivo_reenvio && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Información de Reenvío</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-3">
                                        <RefreshCw className="w-4 h-4 text-orange-600" />
                                        <span className="text-sm font-medium text-gray-900">
                                            Versión {procedure.numero_version}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700">Motivo del Reenvío</label>
                                        <p className="text-sm text-gray-600 mt-1">{procedure.motivo_reenvio}</p>
                                    </div>
                                    {procedure.tramiteOriginal && (
                                        <div className="pt-3 border-t">
                                            <label className="text-xs font-medium text-gray-700">Trámite Original</label>
                                            <Link
                                                href={`/responsable/tramites/${procedure.tramiteOriginal.id_tramite}`}
                                                className="text-sm text-blue-600 hover:text-blue-700 mt-1 block"
                                            >
                                                {procedure.tramiteOriginal.codigo}
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Versiones (si hay reenvíos) */}
                    {procedure.reenvios && procedure.reenvios.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Versiones del Documento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Link
                                        href={`/responsable/tramites/${procedure.id_tramite}`}
                                        className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-900">
                                                Versión {procedure.numero_version} (Actual)
                                            </span>
                                        </div>
                                        <CheckCircle className="w-4 h-4 text-blue-600" />
                                    </Link>
                                    {procedure.reenvios.map((reenvio: any) => (
                                        <Link
                                            key={reenvio.id_tramite}
                                            href={`/responsable/tramites/${reenvio.id_tramite}`}
                                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-600" />
                                                <span className="text-sm text-gray-900">
                                                    Versión {reenvio.numero_version}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {format(new Date(reenvio.fecha_envio), 'dd/MM', { locale: es })}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
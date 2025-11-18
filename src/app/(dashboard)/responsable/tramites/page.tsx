// src/app/(dashboard)/responsable/tramites/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Send,
    Eye,
    FileText,
    Calendar,
    User,
    AlertCircle,
    RefreshCcw,
    CheckCircle,
    Clock,
    PenTool
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ProcedureStateBadge } from '@/components/ui/Badge';
import TramitesFilters from '@/components/tramites/TramitesFilters';
import { useTramites } from '@/hooks/useTramites';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ResponsableTramitesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { tramites, isLoading, error, refetch, applyFilters } = useTramites();
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Mostrar mensaje de éxito si viene del formulario de envío
    useEffect(() => {
        if (searchParams.get('success') === 'true') {
            setShowSuccessMessage(true);
            // Limpiar el parámetro de la URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);

            // Ocultar mensaje después de 5 segundos
            setTimeout(() => setShowSuccessMessage(false), 5000);
        }
    }, [searchParams]);

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
        } catch {
            return dateString;
        }
    };

    const getEstadoIcon = (estado: string) => {
        switch (estado) {
            case 'ENVIADO':
                return <Send className="w-4 h-4" />;
            case 'ABIERTO':
            case 'LEIDO':
                return <Eye className="w-4 h-4" />;
            case 'FIRMADO':
                return <CheckCircle className="w-4 h-4" />;
            case 'ANULADO':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    if (isLoading && tramites.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando trámites...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mis Trámites</h1>
                    <p className="text-gray-600 mt-1">
                        Documentos enviados a trabajadores
                    </p>
                </div>
                <Link href="/responsable/tramites/nuevo">
                    <Button>
                        <Send className="w-4 h-4" />
                        Enviar Documento
                    </Button>
                </Link>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">
                            Documento enviado exitosamente
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                            El trabajador recibirá una notificación sobre el nuevo documento.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowSuccessMessage(false)}
                        className="text-green-600 hover:text-green-700"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Error al cargar trámites</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={refetch}>
                        <RefreshCcw className="w-4 h-4" />
                        Reintentar
                    </Button>
                </div>
            )}

            {/* Filters */}
            <TramitesFilters onApplyFilters={applyFilters} />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Enviados</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {tramites.length}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Send className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pendientes</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {tramites.filter(t => ['ENVIADO', 'ABIERTO', 'LEIDO'].includes(t.estado)).length}
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Firmados</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {tramites.filter(t => t.estado === 'FIRMADO').length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Con Observaciones</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {tramites.filter(t => t.observaciones && t.observaciones.length > 0).length}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tramites List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Lista de Trámites</CardTitle>
                        <Button variant="ghost" size="sm" onClick={refetch}>
                            <RefreshCcw className="w-4 h-4" />
                            Actualizar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {tramites.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No hay trámites
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Comienza enviando tu primer documento a un trabajador
                            </p>
                            <Link href="/responsable/tramites/nuevo">
                                <Button>
                                    <Send className="w-4 h-4" />
                                    Enviar Documento
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                                        Código
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                                        Asunto
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                                        Destinatario
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                                        Estado
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                                        Fecha Envío
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                                        Acciones
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {tramites.map((tramite) => (
                                    <tr
                                        key={tramite.id_tramite}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="text-blue-600">
                                                    {getEstadoIcon(tramite.estado)}
                                                </div>
                                                <span className="font-mono text-sm font-medium text-gray-900">
                                                        {tramite.codigo}
                                                    </span>
                                                {tramite.es_reenvio && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                                            v{tramite.numero_version}
                                                        </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="max-w-xs">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {tramite.asunto}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-500">
                                                            {tramite.documento.tipo.nombre}
                                                        </span>
                                                    {tramite.requiere_firma && (
                                                        <span className="inline-flex items-center text-xs text-purple-600">
                                                                <PenTool className="w-3 h-3 mr-1" />
                                                                Firma
                                                            </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {tramite.receptor.apellidos}, {tramite.receptor.nombres}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {tramite.receptor.correo}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <ProcedureStateBadge estado={tramite.estado} />
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(tramite.fecha_envio)}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Link href={`/responsable/tramites/${tramite.id_tramite}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="w-4 h-4" />
                                                    Ver
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
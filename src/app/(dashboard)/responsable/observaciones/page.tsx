// src/app/(dashboard)/responsable/observaciones/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    MessageSquare,
    AlertCircle,
    CheckCircle,
    Clock,
    FileText,
    User,
    Send,
    Loader2,
    RefreshCw,
    Search,
    Filter,
    X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getPendingObservations, resolveObservation } from '@/lib/api/observaciones';
import { Observation } from '@/types';
import { toast } from 'sonner';
import Link from 'next/link';

interface ObservationWithTramite extends Observation {
    tramite?: {
        codigo: string;
        asunto: string;
        estado: string;
        documento?: {
            titulo: string;
        };
    };
}

export default function ResponsableObservacionesPage() {
    const router = useRouter();
    const [observaciones, setObservaciones] = useState<ObservationWithTramite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isResponding, setIsResponding] = useState<string | null>(null);
    const [selectedObservation, setSelectedObservation] = useState<ObservationWithTramite | null>(null);
    const [respuestaText, setRespuestaText] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchObservaciones();
    }, []);

    const fetchObservaciones = async () => {
        try {
            setIsLoading(true);
            const data = await getPendingObservations();
            setObservaciones(data as ObservationWithTramite[]);
        } catch (err: any) {
            console.error('Error fetching observaciones:', err);
            toast.error('Error al cargar las observaciones');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResponder = async (observacion: ObservationWithTramite) => {
        setSelectedObservation(observacion);
        setRespuestaText('');
    };

    const handleSubmitRespuesta = async () => {
        if (!selectedObservation || !respuestaText.trim()) {
            toast.error('Por favor, ingrese una respuesta');
            return;
        }

        try {
            setIsResponding(selectedObservation.id_observacion);
            await resolveObservation(selectedObservation.id_observacion, {
                respuesta: respuestaText.trim(),
            });
            toast.success('Observación resuelta correctamente');
            setSelectedObservation(null);
            setRespuestaText('');
            fetchObservaciones();
        } catch (err: any) {
            console.error('Error resolving observation:', err);
            toast.error(err.message || 'Error al responder la observación');
        } finally {
            setIsResponding(null);
        }
    };

    const getTipoLabel = (tipo: string) => {
        const labels: Record<string, string> = {
            CONSULTA: 'Consulta',
            CORRECCION_REQUERIDA: 'Corrección Requerida',
            INFORMACION_ADICIONAL: 'Información Adicional',
        };
        return labels[tipo] || tipo;
    };

    const getTipoColor = (tipo: string) => {
        const colors: Record<string, string> = {
            CONSULTA: 'bg-blue-100 text-blue-800',
            CORRECCION_REQUERIDA: 'bg-red-100 text-red-800',
            INFORMACION_ADICIONAL: 'bg-yellow-100 text-yellow-800',
        };
        return colors[tipo] || 'bg-gray-100 text-gray-800';
    };

    const filteredObservaciones = observaciones.filter((obs) => {
        const matchesType = filterType === 'all' || obs.tipo === filterType;
        const matchesSearch =
            searchQuery === '' ||
            obs.tramite?.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            obs.tramite?.asunto.toLowerCase().includes(searchQuery.toLowerCase()) ||
            obs.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    const pendientesCount = observaciones.filter((o) => !o.resuelta).length;
    const resueltasCount = observaciones.filter((o) => o.resuelta).length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando observaciones...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Observaciones</h1>
                <p className="text-gray-600 mt-1">
                    Gestiona las observaciones de tus trámites enviados
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {observaciones.length}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <MessageSquare className="w-6 h-6 text-blue-600" />
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
                                    {pendientesCount}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Resueltas</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {resueltasCount}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por código, asunto o descripción..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Filter by Type */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Todos los tipos</option>
                            <option value="CONSULTA">Consulta</option>
                            <option value="CORRECCION_REQUERIDA">Corrección Requerida</option>
                            <option value="INFORMACION_ADICIONAL">Información Adicional</option>
                        </select>

                        {/* Refresh */}
                        <Button
                            variant="outline"
                            onClick={fetchObservaciones}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Observaciones List */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Observaciones Pendientes ({filteredObservaciones.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredObservaciones.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No hay observaciones pendientes
                            </h3>
                            <p className="text-gray-600">
                                Todas las observaciones han sido resueltas
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredObservaciones.map((observacion) => (
                                <div
                                    key={observacion.id_observacion}
                                    className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTipoColor(observacion.tipo)}`}
                                                >
                                                    {getTipoLabel(observacion.tipo)}
                                                </span>
                                                {observacion.resuelta && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Resuelta
                                                    </span>
                                                )}
                                            </div>
                                            <Link
                                                href={`/responsable/tramites/${observacion.id_tramite}`}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                            >
                                                <FileText className="w-4 h-4 inline mr-1" />
                                                {observacion.tramite?.codigo || 'N/A'} - {observacion.tramite?.asunto}
                                            </Link>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {format(new Date(observacion.fecha_creacion), 'dd/MM/yyyy HH:mm', { locale: es })}
                                        </p>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-700 mb-1">
                                            Descripción:
                                        </p>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                            {observacion.descripcion}
                                        </p>
                                    </div>

                                    {/* Creator */}
                                    {observacion.creador && (
                                        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                                            <User className="w-4 h-4" />
                                            <span>
                                                Creado por: {observacion.creador.nombres} {observacion.creador.apellidos}
                                            </span>
                                        </div>
                                    )}

                                    {/* Response Section */}
                                    {observacion.resuelta ? (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-green-900 mb-1">
                                                        Respuesta:
                                                    </p>
                                                    <p className="text-sm text-green-800">
                                                        {observacion.respuesta}
                                                    </p>
                                                    {observacion.fecha_resolucion && (
                                                        <p className="text-xs text-green-600 mt-2">
                                                            Resuelta el {format(new Date(observacion.fecha_resolucion), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <Button
                                                onClick={() => handleResponder(observacion)}
                                                size="sm"
                                            >
                                                <Send className="w-4 h-4" />
                                                Responder Observación
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal de Respuesta */}
            {selectedObservation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Responder Observación
                                </h3>
                                <button
                                    onClick={() => setSelectedObservation(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Observación Info */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTipoColor(selectedObservation.tipo)}`}
                                    >
                                        {getTipoLabel(selectedObservation.tipo)}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                    Trámite: {selectedObservation.tramite?.codigo}
                                </p>
                                <p className="text-sm text-gray-600 mb-3">
                                    {selectedObservation.tramite?.asunto}
                                </p>
                                <div className="border-t border-gray-200 pt-3 mt-3">
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                        Observación del trabajador:
                                    </p>
                                    <p className="text-sm text-gray-900">
                                        {selectedObservation.descripcion}
                                    </p>
                                </div>
                            </div>

                            {/* Response Form */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tu Respuesta *
                                </label>
                                <textarea
                                    value={respuestaText}
                                    onChange={(e) => setRespuestaText(e.target.value)}
                                    rows={6}
                                    placeholder="Escribe tu respuesta a la observación..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Esta respuesta será enviada al trabajador y la observación se marcará como resuelta.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedObservation(null)}
                                    disabled={!!isResponding}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSubmitRespuesta}
                                    disabled={!respuestaText.trim() || !!isResponding}
                                >
                                    {isResponding ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Enviar Respuesta
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
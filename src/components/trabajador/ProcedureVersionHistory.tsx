// src/components/procedures/ProcedureVersionHistory.tsx
'use client'

import React from 'react';
import { FileText, Calendar, User, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Version {
    id_tramite: string;
    codigo: string;
    numero_version: number;
    fecha_envio: string;
    motivo_reenvio?: string;
    documento: {
        titulo: string;
        version: number;
        nombre_archivo: string;
    };
    es_version_actual: boolean;
}

interface ProcedureVersionHistoryProps {
    versions: Version[];
    currentVersion: number;
    onSelectVersion?: (idTramite: string) => void;
}

export default function ProcedureVersionHistory({
                                                    versions,
                                                    currentVersion,
                                                    onSelectVersion,
                                                }: ProcedureVersionHistoryProps) {
    if (!versions || versions.length === 0) {
        return (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No hay historial de versiones disponible</p>
            </div>
        );
    }

    // Ordenar versiones de más reciente a más antigua
    const sortedVersions = [...versions].sort((a, b) => b.numero_version - a.numero_version);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    Historial de Versiones
                </h3>
                <span className="text-sm text-gray-600">
                    {versions.length} {versions.length === 1 ? 'versión' : 'versiones'}
                </span>
            </div>

            <div className="space-y-3">
                {sortedVersions.map((version, index) => {
                    const isLatest = version.es_version_actual || version.numero_version === currentVersion;
                    const isFirst = version.numero_version === 1;

                    return (
                        <div
                            key={version.id_tramite}
                            className={`relative border rounded-lg p-4 transition-all ${
                                isLatest
                                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                        >
                            {/* Timeline line (excepto para el último) */}
                            {index < sortedVersions.length - 1 && (
                                <div className="absolute left-6 top-full h-3 w-0.5 bg-gray-300" />
                            )}

                            <div className="flex items-start gap-4">
                                {/* Icono de versión */}
                                <div
                                    className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                                        isLatest
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    {isLatest ? (
                                        <CheckCircle className="w-6 h-6" />
                                    ) : (
                                        <Clock className="w-6 h-6" />
                                    )}
                                </div>

                                {/* Contenido */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-base font-semibold text-gray-900">
                                                Versión {version.numero_version}
                                            </h4>
                                            {isLatest && (
                                                <span className="px-2.5 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                                                    Actual
                                                </span>
                                            )}
                                            {isFirst && (
                                                <span className="px-2.5 py-1 bg-gray-500 text-white text-xs font-medium rounded-full">
                                                    Original
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {version.codigo}
                                        </span>
                                    </div>

                                    {/* Información del documento */}
                                    <div className="space-y-2 mb-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            <span className="truncate">{version.documento.titulo}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span>
                                                {format(new Date(version.fecha_envio), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                                                    locale: es,
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Motivo del reenvío (solo para versiones > 1) */}
                                    {version.motivo_reenvio && !isFirst && (
                                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-xs font-medium text-yellow-900 mb-1">
                                                        Motivo de corrección:
                                                    </p>
                                                    <p className="text-xs text-yellow-800">
                                                        {version.motivo_reenvio}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Botón para ver esta versión (solo si no es la actual) */}
                                    {!isLatest && onSelectVersion && (
                                        <button
                                            onClick={() => onSelectVersion(version.id_tramite)}
                                            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                        >
                                            Ver esta versión →
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Información adicional */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">Acerca de las versiones:</p>
                        <ul className="space-y-1 text-blue-800">
                            <li>• Solo puedes ver y firmar la versión más reciente (actual)</li>
                            <li>• Las versiones anteriores se conservan como historial</li>
                            <li>• Cada corrección genera una nueva versión del documento</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
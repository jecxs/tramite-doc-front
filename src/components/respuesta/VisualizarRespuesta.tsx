// src/components/respuesta/VisualizarRespuesta.tsx
'use client';

import { CheckCircle, AlertCircle, MessageSquare, Monitor, Calendar } from 'lucide-react';
import { RespuestaTramite } from '@/types';

interface VisualizarRespuestaProps {
    respuesta: RespuestaTramite;
    mostrarDetallesTecnicos?: boolean;
}

export default function VisualizarRespuesta({
                                                respuesta,
                                                mostrarDetallesTecnicos = true,
                                            }: VisualizarRespuestaProps) {
    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleString('es-PE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Encabezado */}
            <div className="flex items-center gap-3 mb-6">
                <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        respuesta.esta_conforme
                            ? 'bg-green-100'
                            : 'bg-orange-100'
                    }`}
                >
                    {respuesta.esta_conforme ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                    )}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Respuesta Registrada
                    </h3>
                    <p className="text-sm text-gray-600">
                        {respuesta.esta_conforme
                            ? 'Usuario conforme con el documento'
                            : 'Usuario con observaciones'}
                    </p>
                </div>
            </div>

            {/* Badge de estado */}
            <div className="mb-4">
                <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                        respuesta.esta_conforme
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                    }`}
                >
                    {respuesta.esta_conforme ? (
                        <>
                            <CheckCircle className="w-4 h-4" />
                            Conforme
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-4 h-4" />
                            Con Observaciones
                        </>
                    )}
                </span>
            </div>

            {/* Contenido de la respuesta */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3 mb-2">
                    <MessageSquare className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                            Respuesta del trabajador:
                        </p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {respuesta.texto_respuesta}
                        </p>
                    </div>
                </div>
            </div>

            {/* Fecha de respuesta */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Calendar className="w-4 h-4" />
                <span>
                    Respondido el {formatFecha(respuesta.fecha_respuesta)}
                </span>
            </div>

            {/* Detalles técnicos (metadata legal) */}
            {mostrarDetallesTecnicos && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                    <p className="text-xs font-medium text-gray-700 mb-3">
                        Información técnica y legal:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {respuesta.ip_address && (
                            <div className="flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">
                                        IP Address
                                    </p>
                                    <p className="text-xs font-mono text-gray-700">
                                        {respuesta.ip_address}
                                    </p>
                                </div>
                            </div>
                        )}
                        {respuesta.navegador && (
                            <div className="flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Navegador
                                    </p>
                                    <p className="text-xs font-medium text-gray-700">
                                        {respuesta.navegador}
                                    </p>
                                </div>
                            </div>
                        )}
                        {respuesta.dispositivo && (
                            <div className="flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Dispositivo
                                    </p>
                                    <p className="text-xs font-medium text-gray-700">
                                        {respuesta.dispositivo}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
// src/components/firma/FirmaElectronicaInfo.tsx
'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Shield,
    CheckCircle,
    Calendar,
    Clock,
    Monitor,
    Globe,
    User,
    FileCheck,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ElectronicSignature, Procedure } from '@/types';
import ExportarFirmaButton from './ExportarFirmaButton';
interface FirmaElectronicaInfoProps {
    firma: ElectronicSignature;
    procedure: Procedure;
}

export default function FirmaElectronicaInfo({ firma, procedure }: FirmaElectronicaInfoProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card className="border-green-200 bg-green-50">
            <CardHeader className="border-b border-green-200">
                <div className="flex items-center justify-between gap-3">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity flex-1"
                    >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-green-900">
                                Documento Firmado Electrónicamente
                            </CardTitle>
                            <p className="text-sm text-green-700 mt-1">
                                {format(new Date(firma.fecha_firma), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                                    locale: es,
                                })}{' '}
                                hrs
                            </p>
                        </div>
                    </button>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Botón de exportar firma */}
                        <ExportarFirmaButton
                            firma={firma}
                            procedure={procedure}
                            variant="outline"
                            size="sm"
                        />

                        {/* Ícono de check y expansión */}
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="hover:opacity-80 transition-opacity"
                        >
                            {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-green-600" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-green-600" />
                            )}
                        </button>
                    </div>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        {/* Información del Firmante */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Información del Firmante
                            </h4>
                            <div className="bg-white rounded-lg p-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Nombre:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                    {procedure.receptor.nombres} {procedure.receptor.apellidos}
                                </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">DNI:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                    {procedure.receptor.dni}
                                </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Correo:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                    {procedure.receptor.correo}
                                </span>
                                </div>
                            </div>
                        </div>

                        {/* Información de la Firma */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <FileCheck className="w-4 h-4" />
                                Detalles de la Firma
                            </h4>
                            <div className="bg-white rounded-lg p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600">Fecha de Firma</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {format(new Date(firma.fecha_firma), "dd 'de' MMMM 'de' yyyy", {
                                                locale: es,
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600">Hora de Firma</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {format(new Date(firma.fecha_firma), 'HH:mm:ss', {
                                                locale: es,
                                            })}{' '}
                                            hrs
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600">Dirección IP</p>
                                        <p className="text-sm font-medium text-gray-900 font-mono">
                                            {firma.ip_address}
                                        </p>
                                    </div>
                                </div>

                                {firma.navegador && (
                                    <div className="flex items-start gap-3">
                                        <Monitor className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600">Navegador</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {firma.navegador}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {firma.dispositivo && (
                                    <div className="flex items-start gap-3">
                                        <Monitor className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600">Dispositivo</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {firma.dispositivo}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600">Términos Aceptados</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {firma.acepta_terminos ? 'Sí' : 'No'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FileCheck className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600">ID de Firma</p>
                                        <p className="text-xs font-medium text-gray-900 font-mono break-all">
                                            {firma.id_firma}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Nota Legal */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-xs text-blue-800">
                                <span className="font-semibold">Validez Legal:</span> Esta firma electrónica
                                tiene plena validez jurídica conforme a la Ley N° 27269 - Ley de Firmas y
                                Certificados Digitales y su Reglamento. El registro de firma constituye prueba
                                fehaciente de la manifestación de voluntad del firmante.
                            </p>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
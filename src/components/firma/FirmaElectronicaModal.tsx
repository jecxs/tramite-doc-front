// src/components/firma/FirmaElectronicaModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, FileCheck, Shield, Mail, Clock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Procedure } from '@/types';

interface FirmaElectronicaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (codigo: string) => Promise<void>;
    onSolicitarCodigo: () => Promise<{ mensaje: string; expira_en: string; email_enviado_a: string }>;
    procedure: Procedure;
}

export default function FirmaElectronicaModal({
                                                  isOpen,
                                                  onClose,
                                                  onConfirm,
                                                  onSolicitarCodigo,
                                                  procedure,
                                              }: FirmaElectronicaModalProps) {
    const [paso, setPaso] = useState<'terminos' | 'verificacion'>('terminos');
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [codigo, setCodigo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mostrarTerminos, setMostrarTerminos] = useState(false);
    const [emailEnviadoA, setEmailEnviadoA] = useState('');
    const [expiraEn, setExpiraEn] = useState<Date | null>(null);
    const [tiempoRestante, setTiempoRestante] = useState<string>('');

    // Resetear estado al abrir/cerrar modal
    useEffect(() => {
        if (!isOpen) {
            setPaso('terminos');
            setAceptaTerminos(false);
            setCodigo('');
            setEmailEnviadoA('');
            setExpiraEn(null);
        }
    }, [isOpen]);

    // Countdown timer
    useEffect(() => {
        if (!expiraEn) return;

        const interval = setInterval(() => {
            const ahora = new Date();
            const diff = expiraEn.getTime() - ahora.getTime();

            if (diff <= 0) {
                setTiempoRestante('Código expirado');
                clearInterval(interval);
            } else {
                const minutos = Math.floor(diff / 60000);
                const segundos = Math.floor((diff % 60000) / 1000);
                setTiempoRestante(`${minutos}:${segundos.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiraEn]);

    const handleSolicitarCodigo = async () => {
        if (!aceptaTerminos) return;

        try {
            setIsSubmitting(true);
            const resultado = await onSolicitarCodigo();
            setEmailEnviadoA(resultado.email_enviado_a);
            setExpiraEn(new Date(resultado.expira_en));
            setPaso('verificacion');
        } catch (error: any) {
            console.error('Error al solicitar código:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerificarYFirmar = async () => {
        if (codigo.length !== 6) return;

        try {
            setIsSubmitting(true);
            await onConfirm(codigo);
            onClose();
        } catch (error) {
            console.error('Error al verificar y firmar:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setCodigo(value);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                {paso === 'terminos' ? (
                                    <FileCheck className="w-6 h-6 text-purple-600" />
                                ) : (
                                    <Mail className="w-6 h-6 text-purple-600" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {paso === 'terminos' ? 'Firma Electrónica' : 'Verificación por Email'}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {paso === 'terminos'
                                        ? 'Paso 1: Aceptar términos'
                                        : 'Paso 2: Ingresar código de verificación'
                                    }
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {paso === 'terminos' ? (
                            <>
                                {/* Información del Documento */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-blue-900 mb-2">
                                                Está a punto de firmar electrónicamente el siguiente documento:
                                            </p>
                                            <div className="space-y-1">
                                                <p className="text-sm text-blue-800">
                                                    <span className="font-medium">Código:</span> {procedure.codigo}
                                                </p>
                                                <p className="text-sm text-blue-800">
                                                    <span className="font-medium">Asunto:</span> {procedure.asunto}
                                                </p>
                                                <p className="text-sm text-blue-800">
                                                    <span className="font-medium">Tipo:</span>{' '}
                                                    {procedure.documento.tipo.nombre}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Advertencia Legal */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-yellow-900 mb-1">
                                                Importante: Validez Legal
                                            </p>
                                            <p className="text-sm text-yellow-800">
                                                Su firma electrónica tiene la misma validez legal que una firma manuscrita
                                                según la legislación peruana vigente. Al firmar, usted confirma que ha leído
                                                y comprende el contenido del documento.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Términos y Condiciones */}
                                <div className="space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => setMostrarTerminos(!mostrarTerminos)}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        {mostrarTerminos ? '▼' : '▶'} Ver términos y condiciones
                                    </button>

                                    {mostrarTerminos && (
                                        <Card className="p-4 bg-gray-50 max-h-60 overflow-y-auto">
                                            <div className="space-y-3 text-sm text-gray-700">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-1">
                                                        1. Aceptación de Términos
                                                    </h4>
                                                    <p>
                                                        Al marcar la casilla de aceptación y solicitar el código de verificación,
                                                        usted acepta que:
                                                    </p>
                                                    <ul className="list-disc ml-5 mt-1 space-y-1">
                                                        <li>Ha leído completamente el documento adjunto</li>
                                                        <li>Comprende el contenido y las implicaciones del documento</li>
                                                        <li>Su firma electrónica tiene validez legal plena</li>
                                                    </ul>
                                                </div>

                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-1">
                                                        2. Verificación de Identidad
                                                    </h4>
                                                    <p>
                                                        Se enviará un código de verificación de 6 dígitos a su correo electrónico
                                                        registrado. Este código expira en 5 minutos y es de un solo uso.
                                                    </p>
                                                </div>

                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-1">
                                                        3. Validez Legal de la Firma Electrónica
                                                    </h4>
                                                    <p>
                                                        Conforme a la Ley N° 27269 - Ley de Firmas y Certificados Digitales
                                                        y su Reglamento, la firma electrónica es la manifestación de voluntad
                                                        cierta de una persona en medios electrónicos y tiene la misma validez
                                                        y eficacia jurídica que el uso de una firma manuscrita.
                                                    </p>
                                                </div>

                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-1">
                                                        4. Registro de la Firma
                                                    </h4>
                                                    <p>El sistema registrará automáticamente:</p>
                                                    <ul className="list-disc ml-5 mt-1 space-y-1">
                                                        <li>Fecha y hora exacta de la firma</li>
                                                        <li>Dirección IP desde donde se realizó la firma</li>
                                                        <li>Información del navegador y dispositivo utilizado</li>
                                                        <li>Código de verificación utilizado</li>
                                                    </ul>
                                                </div>

                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-1">
                                                        5. No Repudio
                                                    </h4>
                                                    <p>
                                                        Una vez firmado el documento con el código de verificación, la firma no
                                                        puede ser repudiada. El registro de firma constituye prueba fehaciente
                                                        de su manifestación de voluntad.
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    )}
                                </div>

                                {/* Checkbox de Aceptación */}
                                <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="acepta-terminos"
                                        checked={aceptaTerminos}
                                        onChange={(e) => setAceptaTerminos(e.target.checked)}
                                        className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <label
                                        htmlFor="acepta-terminos"
                                        className="text-sm text-gray-700 cursor-pointer"
                                    >
                                        <span className="font-medium text-gray-900">
                                            Declaro que he leído y acepto los términos y condiciones
                                        </span>
                                        <br />
                                        Confirmo que he revisado el documento completo y entiendo que mi firma
                                        electrónica tiene validez legal conforme a la legislación peruana vigente.
                                    </label>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Paso de Verificación */}
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <Mail className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-purple-900 mb-2">
                                                Código de verificación enviado
                                            </p>
                                            <p className="text-sm text-purple-800">
                                                Hemos enviado un código de 6 dígitos a: <strong>{emailEnviadoA}</strong>
                                            </p>
                                            <p className="text-xs text-purple-700 mt-2">
                                                Revisa tu bandeja de entrada y tu carpeta de spam.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Timer */}
                                {tiempoRestante && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm text-blue-900">
                                                    Tiempo restante:
                                                </span>
                                            </div>
                                            <span className={`text-lg font-mono font-bold ${
                                                tiempoRestante === 'Código expirado'
                                                    ? 'text-red-600'
                                                    : 'text-blue-600'
                                            }`}>
                                                {tiempoRestante}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Campo de Código */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Código de Verificación
                                    </label>
                                    <input
                                        type="text"
                                        value={codigo}
                                        onChange={handleCodigoChange}
                                        placeholder="000000"
                                        maxLength={6}
                                        className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-500 text-center">
                                        Ingresa el código de 6 dígitos que recibiste por email
                                    </p>
                                </div>

                                {/* Reenviar código */}
                                <div className="text-center">
                                    <button
                                        onClick={handleSolicitarCodigo}
                                        disabled={isSubmitting}
                                        className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                                    >
                                        ¿No recibiste el código? Reenviar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer - Botones */}
                    <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
                        {paso === 'verificacion' && (
                            <Button
                                variant="ghost"
                                onClick={() => setPaso('terminos')}
                                disabled={isSubmitting}
                            >
                                Volver
                            </Button>
                        )}
                        <div className="flex-1" />
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        {paso === 'terminos' ? (
                            <Button
                                onClick={handleSolicitarCodigo}
                                disabled={!aceptaTerminos || isSubmitting}
                                className="bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                        Enviando código...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4" />
                                        Solicitar Código
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleVerificarYFirmar}
                                disabled={codigo.length !== 6 || isSubmitting}
                                className="bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                        Verificando...
                                    </>
                                ) : (
                                    <>
                                        <FileCheck className="w-4 h-4" />
                                        Verificar y Firmar
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
// src/components/firma/FirmaElectronicaModal.tsx
'use client';

import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, FileCheck, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Procedure } from '@/types';

interface FirmaElectronicaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    procedure: Procedure;
}

export default function FirmaElectronicaModal({
                                                  isOpen,
                                                  onClose,
                                                  onConfirm,
                                                  procedure,
                                              }: FirmaElectronicaModalProps) {
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mostrarTerminos, setMostrarTerminos] = useState(false);

    const handleFirmar = async () => {
        if (!aceptaTerminos) {
            return;
        }

        try {
            setIsSubmitting(true);
            await onConfirm();
            onClose();
        } catch (error) {
            console.error('Error al firmar:', error);
        } finally {
            setIsSubmitting(false);
        }
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
                                <FileCheck className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Firma Electrónica
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Firma digital del documento
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
                                                Al marcar la casilla de aceptación y hacer clic en "Firmar Documento",
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
                                                2. Validez Legal de la Firma Electrónica
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
                                                3. Registro de la Firma
                                            </h4>
                                            <p>El sistema registrará automáticamente:</p>
                                            <ul className="list-disc ml-5 mt-1 space-y-1">
                                                <li>Fecha y hora exacta de la firma</li>
                                                <li>Dirección IP desde donde se realizó la firma</li>
                                                <li>Información del navegador y dispositivo utilizado</li>
                                                <li>Identificación del usuario firmante</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                4. No Repudio
                                            </h4>
                                            <p>
                                                Una vez firmado el documento, la firma no puede ser repudiada.
                                                El registro de firma constituye prueba fehaciente de su manifestación
                                                de voluntad.
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                5. Responsabilidad
                                            </h4>
                                            <p>
                                                Usted es responsable de mantener la confidencialidad de sus credenciales
                                                de acceso y de todas las acciones realizadas bajo su cuenta de usuario.
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

                        {/* Información Adicional */}
                        <div className="text-xs text-gray-500 space-y-1">
                            <p>• Su firma será registrada con información de trazabilidad completa</p>
                            <p>• El documento firmado será notificado al remitente</p>
                            <p>• Podrá consultar el comprobante de firma en cualquier momento</p>
                        </div>
                    </div>

                    {/* Footer - Botones */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleFirmar}
                            disabled={!aceptaTerminos || isSubmitting}
                            className="bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                    Firmando...
                                </>
                            ) : (
                                <>
                                    <FileCheck className="w-4 h-4" />
                                    Firmar Documento
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
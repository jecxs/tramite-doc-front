// src/components/respuesta/FormularioRespuesta.tsx
'use client';

import { useState } from 'react';
import { MessageSquare, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { crearRespuestaTramite } from '@/lib/api/respuesta-tramite';

interface FormularioRespuestaProps {
    idTramite: string;
    asuntoTramite: string;
    onRespuestaEnviada: () => void;
}

export default function FormularioRespuesta({
                                                idTramite,
                                                asuntoTramite,
                                                onRespuestaEnviada,
                                            }: FormularioRespuestaProps) {
    const [textoRespuesta, setTextoRespuesta] = useState('');
    const [estaConforme, setEstaConforme] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validaciones
        if (textoRespuesta.trim().length < 10) {
            setError('La respuesta debe tener al menos 10 caracteres');
            return;
        }

        if (textoRespuesta.length > 2000) {
            setError('La respuesta no puede exceder 2000 caracteres');
            return;
        }

        try {
            setIsSubmitting(true);

            await crearRespuestaTramite(idTramite, {
                texto_respuesta: textoRespuesta.trim(),
                esta_conforme: estaConforme,
            });

            // Limpiar formulario
            setTextoRespuesta('');
            setEstaConforme(true);

            // Notificar al componente padre
            onRespuestaEnviada();
        } catch (err: any) {
            setError(err.message || 'Error al enviar la respuesta');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Respuesta de Conformidad
                    </h3>
                    <p className="text-sm text-gray-600">
                        Este documento requiere tu confirmación
                    </p>
                </div>
            </div>

            {/* Información importante */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">Instrucciones:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>
                                Si estás <strong>conforme</strong> con el documento,
                                escribe tu confirmación en el campo de texto.
                            </li>
                            <li>
                                Si <strong>NO estás conforme</strong>, desmarca la casilla y crea una observación formal
                                en la pestaña correspondiente.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Checkbox de conformidad */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                        type="checkbox"
                        id="esta_conforme"
                        checked={estaConforme}
                        onChange={(e) => setEstaConforme(e.target.checked)}
                        className="mt-1 h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="esta_conforme" className="flex-1">
                        <span className="text-sm font-medium text-gray-900 block mb-1">
                            Estoy conforme con el contenido del documento
                        </span>
                        <span className="text-xs text-gray-600">
                            {estaConforme
                                ? 'Confirmas que estás de acuerdo con la información del documento'
                                : 'Indica que tienes observaciones sobre el documento'}
                        </span>
                    </label>
                </div>

                {/* Campo de texto para respuesta */}
                <div>
                    <label
                        htmlFor="texto_respuesta"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        {estaConforme
                            ? 'Confirma tu conformidad por escrito'
                            : 'Describe tus observaciones'}
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                        id="texto_respuesta"
                        value={textoRespuesta}
                        onChange={(e) => setTextoRespuesta(e.target.value)}
                        rows={6}
                        maxLength={2000}
                        required
                        placeholder={
                            estaConforme
                                ? 'Ejemplo: "He revisado el reporte de horas trabajadas del mes de octubre 2024 y confirmo que la información es correcta según mi registro personal."'
                                : 'Describe aquí tus observaciones sobre el documento...'
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                            Mínimo 10 caracteres requeridos
                        </p>
                        <p
                            className={`text-xs ${
                                textoRespuesta.length > 1900
                                    ? 'text-red-600 font-medium'
                                    : 'text-gray-500'
                            }`}
                        >
                            {textoRespuesta.length}/2000 caracteres
                        </p>
                    </div>
                </div>

                {/* Mensaje de error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                )}

                {/* Botón de envío */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || textoRespuesta.trim().length < 10}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                            isSubmitting || textoRespuesta.trim().length < 10
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : estaConforme
                                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Enviando...
                            </>
                        ) : (
                            <>
                                {estaConforme ? (
                                    <CheckCircle className="w-5 h-5" />
                                ) : (
                                    <AlertCircle className="w-5 h-5" />
                                )}
                                Enviar Respuesta
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
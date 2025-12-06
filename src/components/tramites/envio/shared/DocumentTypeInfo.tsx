import { FileText, PenTool, MessageSquare, Info } from 'lucide-react';
import { DocumentType } from '@/types';

interface DocumentTypeInfoProps {
    documentType: DocumentType;
}

export default function DocumentTypeInfo({ documentType }: DocumentTypeInfoProps) {
    return (
        <div className="space-y-3">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <FileText className="w-3 h-3 mr-1" />
                    {documentType.codigo}
                </span>

                {documentType.requiere_firma && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <PenTool className="w-3 h-3 mr-1" />
                        Requiere Firma
                    </span>
                )}

                {documentType.requiere_respuesta && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Requiere Respuesta
                    </span>
                )}
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-3">
                        <div>
                            <p className="text-sm font-semibold text-blue-900 mb-2">
                                Características de este tipo de documento
                            </p>

                            {documentType.descripcion && (
                                <p className="text-sm text-blue-800 mb-3 italic">
                                    {documentType.descripcion}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            {documentType.requiere_firma && (
                                <div className="flex items-start gap-2">
                                    <PenTool className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Firma Electrónica
                                        </p>
                                        <p className="text-xs text-gray-700 mt-0.5">
                                            El trabajador deberá aceptar los términos y firmar electrónicamente este documento.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {documentType.requiere_respuesta && (
                                <div className="flex items-start gap-2">
                                    <MessageSquare className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Respuesta de Conformidad
                                        </p>
                                        <p className="text-xs text-gray-700 mt-0.5">
                                            El trabajador deberá leer el documento completamente y marcar su conformidad.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
// src/app/(dashboard)/responsable/tramites/nuevo/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import FileUpload from '@/components/ui/FileUpload';
import WorkerSelector from '@/components/ui/WorkerSelector';
import MultiWorkerSelector from '@/components/ui/MultiWorkerSelector';
import { ArrowLeft, Send, Loader2, AlertCircle, FileText, PenTool, Info, Users } from 'lucide-react';
import Link from 'next/link';
import { getWorkers } from '@/lib/api/usuarios';
import { getDocumentTypes } from '@/lib/api/document-type';
import { User, DocumentType } from '@/types';
import apiClient, { handleApiError } from '@/lib/api-client';

type SendMode = 'individual' | 'bulk';

interface SendDocumentForm {
    asunto: string;
    mensaje: string;
    id_destinatario: string; // Para modo individual
    id_destinatarios: string[]; // Para modo masivo
    titulo_documento: string;
    id_tipo_documento: string;
    file: File | null;
}

interface FormErrors {
    asunto?: string;
    id_destinatario?: string;
    id_destinatarios?: string;
    titulo_documento?: string;
    id_tipo_documento?: string;
    file?: string;
}

export default function SendDocumentPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [workers, setWorkers] = useState<User[]>([]);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [apiError, setApiError] = useState<string>('');
    const [sendMode, setSendMode] = useState<SendMode>('individual');

    const [formData, setFormData] = useState<SendDocumentForm>({
        asunto: '',
        mensaje: '',
        id_destinatario: '',
        id_destinatarios: [],
        titulo_documento: '',
        id_tipo_documento: '',
        file: null,
    });

    // Cargar trabajadores y tipos de documento
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingData(true);
                const [workersData, documentTypesData] = await Promise.all([
                    getWorkers(),
                    getDocumentTypes(),
                ]);

                setWorkers(workersData);
                setDocumentTypes(documentTypesData);
            } catch (error) {
                console.error('❌ Error loading data:', error);
                setApiError('Error al cargar los datos necesarios. Por favor, recargue la página.');
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.asunto.trim()) {
            newErrors.asunto = 'El asunto es obligatorio';
        }

        if (sendMode === 'individual') {
            if (!formData.id_destinatario) {
                newErrors.id_destinatario = 'Debe seleccionar un destinatario';
            }
        } else {
            if (formData.id_destinatarios.length === 0) {
                newErrors.id_destinatarios = 'Debe seleccionar al menos un destinatario';
            }
        }

        if (!formData.titulo_documento.trim()) {
            newErrors.titulo_documento = 'El título del documento es obligatorio';
        }

        if (!formData.id_tipo_documento) {
            newErrors.id_tipo_documento = 'Debe seleccionar un tipo de documento';
        }

        if (!formData.file) {
            newErrors.file = 'Debe seleccionar un archivo PDF';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);

            // Paso 1: Subir el documento
            const documentFormData = new FormData();
            documentFormData.append('titulo', formData.titulo_documento);
            documentFormData.append('id_tipo', formData.id_tipo_documento);
            if (formData.file) {
                documentFormData.append('file', formData.file);
            }

            console.log('📤 Subiendo documento...');
            const documentResponse = await apiClient.post('/documentos/upload', documentFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const documentoCreado = documentResponse.data;
            console.log('✅ Documento subido:', documentoCreado.id_documento);

            // Paso 2: Crear el trámite (individual o masivo)
            if (sendMode === 'individual') {
                const tramiteData = {
                    asunto: formData.asunto,
                    mensaje: formData.mensaje || undefined,
                    id_documento: documentoCreado.id_documento,
                    id_receptor: formData.id_destinatario,
                };

                console.log('📤 Creando trámite individual...');
                await apiClient.post('/tramites', tramiteData);
                console.log('✅ Trámite creado exitosamente');
            } else {
                const tramiteBulkData = {
                    asunto: formData.asunto,
                    mensaje: formData.mensaje || undefined,
                    id_documento: documentoCreado.id_documento,
                    id_receptores: formData.id_destinatarios,
                };

                console.log('📤 Creando trámites masivos...');
                const response = await apiClient.post('/tramites/bulk', tramiteBulkData);
                console.log(`✅ ${response.data.total} trámites creados exitosamente`);
            }

            // Redirigir a la lista de trámites con mensaje de éxito
            router.push('/responsable/tramites?success=true');
        } catch (error) {
            console.error('❌ Error sending document:', error);
            setApiError(handleApiError(error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof SendDocumentForm, value: string | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleFileSelect = (file: File | null) => {
        setFormData((prev) => ({ ...prev, file }));
        if (errors.file) {
            setErrors((prev) => ({ ...prev, file: undefined }));
        }
    };

    const selectedDocType = documentTypes.find(
        (dt) => dt.id_tipo === formData.id_tipo_documento
    );

    const handleModeChange = (mode: SendMode) => {
        setSendMode(mode);
        // Limpiar selecciones al cambiar de modo
        setFormData(prev => ({
            ...prev,
            id_destinatario: '',
            id_destinatarios: [],
        }));
        setErrors({});
    };

    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando formulario...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/responsable/tramites">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Enviar Documento</h1>
                    <p className="text-gray-600 mt-1">
                        Complete el formulario para enviar un documento
                    </p>
                </div>
            </div>

            {/* Error general de API */}
            {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Error</p>
                        <p className="text-sm text-red-700 mt-1">{apiError}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Selector de Modo de Envío */}
                <Card>
                    <CardHeader>
                        <CardTitle>Modo de Envío</CardTitle>
                        <CardDescription>
                            Elija cómo desea enviar el documento
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => handleModeChange('individual')}
                                className={`
                                    p-4 border-2 rounded-lg transition-all
                                    ${sendMode === 'individual'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }
                                `}
                            >
                                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                <p className="font-medium text-gray-900">Individual</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Enviar a un trabajador
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleModeChange('bulk')}
                                className={`
                                    p-4 border-2 rounded-lg transition-all
                                    ${sendMode === 'bulk'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }
                                `}
                            >
                                <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
                                <p className="font-medium text-gray-900">Masivo</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Enviar a múltiples trabajadores
                                </p>
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Información del Trámite */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información del Trámite</CardTitle>
                        <CardDescription>
                            Datos básicos del envío de documento
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Asunto"
                            placeholder="Ej: Contrato Laboral 2025"
                            value={formData.asunto}
                            onChange={(e) => handleInputChange('asunto', e.target.value)}
                            error={errors.asunto}
                            required
                            maxLength={255}
                            helperText="Resumen breve del documento a enviar"
                        />

                        {/* Selector de Destinatarios según modo */}
                        {sendMode === 'individual' ? (
                            <WorkerSelector
                                workers={workers}
                                selectedWorkerId={formData.id_destinatario}
                                onSelect={(workerId) => handleInputChange('id_destinatario', workerId)}
                                error={errors.id_destinatario}
                                required
                            />
                        ) : (
                            <MultiWorkerSelector
                                workers={workers}
                                selectedWorkerIds={formData.id_destinatarios}
                                onSelect={(workerIds) => handleInputChange('id_destinatarios', workerIds)}
                                error={errors.id_destinatarios}
                                required
                            />
                        )}

                        <Textarea
                            label="Mensaje (Opcional)"
                            placeholder="Agregue un mensaje o instrucciones adicionales para el/los destinatario(s)"
                            value={formData.mensaje}
                            onChange={(e) => handleInputChange('mensaje', e.target.value)}
                            rows={4}
                            maxLength={1000}
                            showCharCount
                        />
                    </CardContent>
                </Card>

                {/* Información del Documento */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información del Documento</CardTitle>
                        <CardDescription>
                            Detalles del archivo a enviar
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select
                            label="Tipo de Documento"
                            placeholder="Seleccione un tipo"
                            value={formData.id_tipo_documento}
                            onChange={(value) => handleInputChange('id_tipo_documento', value)}
                            options={documentTypes.map((type) => ({
                                value: type.id_tipo,
                                label: type.nombre,
                            }))}
                            error={errors.id_tipo_documento}
                            required
                        />

                        {selectedDocType && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        <FileText className="w-3 h-3 mr-1" />
                                        {selectedDocType.codigo}
                                    </span>
                                    {selectedDocType.requiere_firma && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            <PenTool className="w-3 h-3 mr-1" />
                                            Requiere Firma
                                        </span>
                                    )}
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-blue-900 mb-1">
                                                Información sobre este tipo de documento
                                            </p>
                                            {selectedDocType.requiere_firma && (
                                                <p className="text-sm text-blue-800 mb-2">
                                                    📝 Este documento requerirá firma electrónica del trabajador.
                                                </p>
                                            )}
                                            {selectedDocType.descripcion && (
                                                <p className="text-xs text-blue-700 mt-2 italic">
                                                    {selectedDocType.descripcion}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Input
                            label="Título del Documento"
                            placeholder="Ej: Contrato de Trabajo - Juan Pérez"
                            value={formData.titulo_documento}
                            onChange={(e) => handleInputChange('titulo_documento', e.target.value)}
                            error={errors.titulo_documento}
                            required
                            maxLength={255}
                            helperText="Este será el nombre que verán los trabajadores"
                        />

                        <FileUpload
                            label="Archivo PDF"
                            required
                            onFileSelect={handleFileSelect}
                            error={errors.file}
                            helperText="Seleccione el archivo PDF que desea enviar (máximo 10MB)"
                        />
                    </CardContent>
                </Card>

                {/* Resumen */}
                {formData.id_tipo_documento && formData.file && (
                    (sendMode === 'individual' && formData.id_destinatario) ||
                    (sendMode === 'bulk' && formData.id_destinatarios.length > 0)
                ) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Resumen del Envío</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Modo:</span>
                                    <span className="font-medium">
                                        {sendMode === 'individual' ? 'Individual' : 'Masivo'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        {sendMode === 'individual' ? 'Destinatario:' : 'Destinatarios:'}
                                    </span>
                                    <span className="font-medium">
                                        {sendMode === 'individual'
                                            ? workers.find(w => w.id_usuario === formData.id_destinatario)?.nombre_completo
                                            : `${formData.id_destinatarios.length} trabajadores`
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tipo de documento:</span>
                                    <span className="font-medium">{selectedDocType?.nombre}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Archivo:</span>
                                    <span className="font-medium">{formData.file.name}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Botones de acción */}
                <div className="flex items-center justify-end gap-4">
                    <Link href="/responsable/tramites">
                        <Button type="button" variant="ghost" disabled={isLoading}>
                            Cancelar
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        disabled={isLoading || workers.length === 0}
                    >
                        <Send className="w-4 h-4" />
                        {isLoading ? 'Enviando...' : 'Enviar Documento'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
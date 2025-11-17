'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import FileUpload from '@/components/ui/FileUpload';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getWorkers } from '@/lib/api/usuarios';
import { getDocumentTypes } from '@/lib/api/document-type';
import { User, DocumentType } from '@/types';
import apiClient, { handleApiError } from '@/lib/api-client';

interface SendDocumentForm {
    asunto: string;
    mensaje: string;
    id_destinatario: string;
    titulo_documento: string;
    descripcion_documento: string;
    id_tipo_documento: string;
    file: File | null;
}

interface FormErrors {
    asunto?: string;
    id_destinatario?: string;
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

    const [formData, setFormData] = useState<SendDocumentForm>({
        asunto: '',
        mensaje: '',
        id_destinatario: '',
        titulo_documento: '',
        descripcion_documento: '',
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
                console.error('Error loading data:', error);
                setApiError('Error al cargar los datos necesarios');
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

        if (!formData.id_destinatario) {
            newErrors.id_destinatario = 'Debe seleccionar un destinatario';
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

            // Crear FormData para envío multipart
            const submitFormData = new FormData();
            submitFormData.append('asunto', formData.asunto);
            if (formData.mensaje) {
                submitFormData.append('mensaje', formData.mensaje);
            }
            submitFormData.append('id_destinatario', formData.id_destinatario);
            submitFormData.append('titulo_documento', formData.titulo_documento);
            if (formData.descripcion_documento) {
                submitFormData.append('descripcion_documento', formData.descripcion_documento);
            }
            submitFormData.append('id_tipo_documento', formData.id_tipo_documento);
            if (formData.file) {
                submitFormData.append('file', formData.file);
            }

            // Enviar a través del endpoint de trámites
            await apiClient.post('/tramites', submitFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Redirigir a la lista de trámites con mensaje de éxito
            router.push('/responsable/tramites?success=true');
        } catch (error) {
            console.error('Error sending document:', error);
            setApiError(handleApiError(error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof SendDocumentForm, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Limpiar error del campo al cambiar
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
                        Complete el formulario para enviar un documento a un trabajador
                    </p>
                </div>
            </div>

            {/* Error general de API */}
            {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{apiError}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                        />

                        <Select
                            label="Destinatario"
                            placeholder="Seleccione un trabajador"
                            value={formData.id_destinatario}
                            onChange={(value) => handleInputChange('id_destinatario', value)}
                            options={workers.map((worker) => ({
                                value: worker.id_usuario,
                                label: `${worker.nombres} ${worker.apellidos} (${worker.correo})`,
                            }))}
                            error={errors.id_destinatario}
                            required
                        />

                        <Textarea
                            label="Mensaje (Opcional)"
                            placeholder="Agregue un mensaje o instrucciones adicionales para el destinatario"
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
                        <Input
                            label="Título del Documento"
                            placeholder="Ej: Contrato de Trabajo - Juan Pérez"
                            value={formData.titulo_documento}
                            onChange={(e) => handleInputChange('titulo_documento', e.target.value)}
                            error={errors.titulo_documento}
                            required
                            maxLength={255}
                        />

                        <Select
                            label="Tipo de Documento"
                            placeholder="Seleccione un tipo"
                            value={formData.id_tipo_documento}
                            onChange={(value) => handleInputChange('id_tipo_documento', value)}
                            options={documentTypes.map((type) => ({
                                value: type.id_tipo_documento,
                                label: `${type.nombre_tipo}${type.requiere_firma ? ' (Requiere Firma)' : ''}`,
                            }))}
                            error={errors.id_tipo_documento}
                            required
                        />

                        <Textarea
                            label="Descripción (Opcional)"
                            placeholder="Agregue una descripción o notas sobre el documento"
                            value={formData.descripcion_documento}
                            onChange={(e) =>
                                handleInputChange('descripcion_documento', e.target.value)
                            }
                            rows={3}
                            maxLength={500}
                            showCharCount
                        />

                        <FileUpload
                            label="Archivo PDF"
                            required
                            onFileSelect={handleFileSelect}
                            error={errors.file}
                            helperText="Seleccione el archivo PDF que desea enviar"
                        />
                    </CardContent>
                </Card>

                {/* Botones de acción */}
                <div className="flex items-center justify-end gap-4">
                    <Link href="/responsable/tramites">
                        <Button type="button" variant="ghost" disabled={isLoading}>
                            Cancelar
                        </Button>
                    </Link>
                    <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                        <Send className="w-4 h-4" />
                        {isLoading ? 'Enviando...' : 'Enviar Documento'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
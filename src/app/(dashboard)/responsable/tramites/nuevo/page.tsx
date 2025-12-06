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
import AutoLoteFileUpload from '@/components/ui/AutoLoteFileUpload';
import {
    ArrowLeft, Send, Loader2, AlertCircle, FileText, PenTool,
    Info, Users, MessageSquare, CheckCircle, Zap, Edit2, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { getWorkers } from '@/lib/api/usuarios';
import { getDocumentTypes } from '@/lib/api/document-type';
import { uploadDocumentsBatch } from '@/lib/api/documents';
import { detectarDestinatarios, crearTramitesAutoLote, generarMensajePredeterminado } from '@/lib/api/tramites-auto';
import { User, DocumentType, DeteccionDestinatarioDto, DocumentoConDestinatarioDto } from '@/types';
import apiClient, { handleApiError } from '@/lib/api-client';

type SendMode = 'individual' | 'bulk' | 'auto-lote';

interface SendDocumentForm {
    asunto: string;
    mensaje: string;
    id_destinatario: string;
    id_destinatarios: string[];
    titulo_documento: string;
    id_tipo_documento: string;
    file: File | null;
    // Auto-lote
    archivos_lote: File[];
}

interface FormErrors {
    asunto?: string;
    id_destinatario?: string;
    id_destinatarios?: string;
    titulo_documento?: string;
    id_tipo_documento?: string;
    file?: string;
    archivos_lote?: string;
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

    // Estados para auto-lote
    const [deteccionResultado, setDeteccionResultado] = useState<{
        exitosos: DeteccionDestinatarioDto[];
        fallidos: DeteccionDestinatarioDto[];
    } | null>(null);
    const [documentosSubidos, setDocumentosSubidos] = useState<any[]>([]);
    const [tramitesListos, setTramitesListos] = useState<DocumentoConDestinatarioDto[]>([]);
    const [isDetecting, setIsDetecting] = useState(false);

    const [formData, setFormData] = useState<SendDocumentForm>({
        asunto: '',
        mensaje: '',
        id_destinatario: '',
        id_destinatarios: [],
        titulo_documento: '',
        id_tipo_documento: '',
        file: null,
        archivos_lote: [],
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

    // ========== LÓGICA PARA AUTO-LOTE ==========

    const handleDetectarDestinatarios = async () => {
        if (formData.archivos_lote.length === 0) {
            setErrors({ archivos_lote: 'Debe seleccionar al menos un archivo' });
            return;
        }

        if (!formData.id_tipo_documento) {
            setErrors({ id_tipo_documento: 'Debe seleccionar un tipo de documento' });
            return;
        }

        try {
            setIsDetecting(true);
            setApiError('');

            console.log('🔍 Detectando destinatarios...');
            const resultado = await detectarDestinatarios(
                formData.archivos_lote,
                formData.id_tipo_documento
            );

            setDeteccionResultado(resultado);
            console.log('✅ Detección completa:', resultado);

            // Si hay exitosos, generar la lista de trámites listos para enviar
            if (resultado.exitosos.length > 0) {
                await prepararTramitesParaEnvio(resultado.exitosos, resultado.tipo_documento);
            }
        } catch (error) {
            console.error('❌ Error en detección:', error);
            setApiError(handleApiError(error));
        } finally {
            setIsDetecting(false);
        }
    };

    const prepararTramitesParaEnvio = async (
        exitosos: DeteccionDestinatarioDto[],
        tipoDocumento: DocumentType
    ) => {
        try {
            console.log('📤 Subiendo documentos en lote...');
            const documentosSubidosRes = await uploadDocumentsBatch(
                formData.archivos_lote,
                tipoDocumento.id_tipo
            );

            setDocumentosSubidos(documentosSubidosRes);
            console.log('✅ Documentos subidos:', documentosSubidosRes);

            // Generar mensajes predeterminados para cada trabajador
            const tramitesPreparados: DocumentoConDestinatarioDto[] = [];

            for (let i = 0; i < exitosos.length; i++) {
                const trabajador = exitosos[i];
                const documento = documentosSubidosRes[i];

                // Generar mensaje predeterminado
                const template = await generarMensajePredeterminado(
                    tipoDocumento.codigo,
                    trabajador.nombre_completo || 'Trabajador'
                );

                tramitesPreparados.push({
                    dni: trabajador.dni,
                    id_usuario: trabajador.id_usuario!,
                    id_documento: documento.id_documento,
                    asunto: template.asunto,
                    mensaje: template.mensaje,
                    nombre_trabajador: trabajador.nombre_completo!,
                    nombre_archivo: trabajador.nombre_archivo,
                });
            }

            setTramitesListos(tramitesPreparados);
        } catch (error) {
            console.error('❌ Error preparando trámites:', error);
            setApiError(handleApiError(error));
        }
    };

    const handleEditarTramite = (index: number, field: keyof DocumentoConDestinatarioDto, value: string) => {
        const nuevosTramites = [...tramitesListos];
        nuevosTramites[index] = {
            ...nuevosTramites[index],
            [field]: value,
        };
        setTramitesListos(nuevosTramites);
    };

    const handleEliminarTramite = (index: number) => {
        setTramitesListos(tramitesListos.filter((_, i) => i !== index));
    };

    const handleEnviarLoteAutomatico = async () => {
        if (tramitesListos.length === 0) {
            setApiError('No hay trámites listos para enviar');
            return;
        }

        try {
            setIsLoading(true);
            console.log('📤 Enviando trámites en lote...');

            const response = await crearTramitesAutoLote({
                id_tipo_documento: formData.id_tipo_documento,
                documentos: tramitesListos,
            });

            console.log(`✅ ${response.total} trámites creados exitosamente`);
            router.push('/responsable/tramites?success=true');
        } catch (error) {
            console.error('❌ Error enviando trámites:', error);
            setApiError(handleApiError(error));
        } finally {
            setIsLoading(false);
        }
    };

    // ========== LÓGICA PARA MODOS INDIVIDUAL Y BULK (YA EXISTENTE) ==========

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (sendMode === 'auto-lote') {
            // Validación para auto-lote se hace en handleDetectarDestinatarios
            return true;
        }

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

            router.push('/responsable/tramites?success=true');
        } catch (error) {
            console.error('❌ Error sending document:', error);
            setApiError(handleApiError(error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof SendDocumentForm, value: string | string[] | File[]) => {
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
        setFormData({
            asunto: '',
            mensaje: '',
            id_destinatario: '',
            id_destinatarios: [],
            titulo_documento: '',
            id_tipo_documento: '',
            file: null,
            archivos_lote: [],
        });
        setErrors({});
        setDeteccionResultado(null);
        setTramitesListos([]);
        setDocumentosSubidos([]);
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

            {/* Selector de Modo de Envío */}
            <Card>
                <CardHeader>
                    <CardTitle>Modo de Envío</CardTitle>
                    <CardDescription>
                        Elija cómo desea enviar el documento
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
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

                        <button
                            type="button"
                            onClick={() => handleModeChange('auto-lote')}
                            className={`
                                p-4 border-2 rounded-lg transition-all
                                ${sendMode === 'auto-lote'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }
                            `}
                        >
                            <Zap className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                            <p className="font-medium text-gray-900">Auto-Lote</p>
                            <p className="text-sm text-gray-600 mt-1">
                                Detección automática por DNI
                            </p>
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* ========== MODO AUTO-LOTE ========== */}
            {sendMode === 'auto-lote' ? (
                <>
                    {/* Paso 1: Selección de tipo y archivos */}
                    {!deteccionResultado && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Paso 1: Seleccionar Documentos</CardTitle>
                                <CardDescription>
                                    Elija el tipo de documento y suba los archivos. Los nombres deben iniciar con el DNI del destinatario.
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
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <div className="flex items-start gap-2">
                                            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                                            <div className="text-sm text-blue-800">
                                                <p className="font-medium mb-1">Tipo seleccionado: {selectedDocType.nombre}</p>
                                                <p className="text-xs">{selectedDocType.descripcion}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <AutoLoteFileUpload
                                    label="Archivos PDF"
                                    required
                                    onFilesSelect={(files) => handleInputChange('archivos_lote', files)}
                                    error={errors.archivos_lote}
                                    helperText="Los archivos deben iniciar con el DNI del trabajador (8 dígitos). Ejemplo: 12345678_Contrato.pdf"
                                    maxFiles={50}
                                />

                                <Button
                                    type="button"
                                    onClick={handleDetectarDestinatarios}
                                    isLoading={isDetecting}
                                    disabled={isDetecting || formData.archivos_lote.length === 0 || !formData.id_tipo_documento}
                                    className="w-full"
                                >
                                    <Zap className="w-4 h-4" />
                                    {isDetecting ? 'Detectando...' : 'Detectar Destinatarios'}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Paso 2: Resultado de detección y edición */}
                    {deteccionResultado && tramitesListos.length > 0 && (
                        <>
                            {/* Resumen de detección */}
                            <Card className="border-2 border-green-200 bg-green-50/30">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        Detección Completa
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-3xl font-bold text-green-600">
                                                {deteccionResultado.exitosos.length}
                                            </p>
                                            <p className="text-sm text-gray-600">Detectados</p>
                                        </div>
                                        <div>
                                            <p className="text-3xl font-bold text-red-600">
                                                {deteccionResultado.fallidos.length}
                                            </p>
                                            <p className="text-sm text-gray-600">Fallidos</p>
                                        </div>
                                        <div>
                                            <p className="text-3xl font-bold text-blue-600">
                                                {tramitesListos.length}
                                            </p>
                                            <p className="text-sm text-gray-600">Listos para enviar</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tabla de trámites listos */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Paso 2: Revisar y Enviar</CardTitle>
                                    <CardDescription>
                                        Revise los datos generados automáticamente. Puede editarlos antes de enviar.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {tramitesListos.map((tramite, index) => (
                                            <div
                                                key={index}
                                                className="border border-gray-200 rounded-lg p-4 space-y-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {tramite.nombre_trabajador}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            DNI: {tramite.dni} • {tramite.nombre_archivo}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEliminarTramite(index)}
                                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </div>

                                                <Input
                                                    label="Asunto"
                                                    value={tramite.asunto}
                                                    onChange={(e) => handleEditarTramite(index, 'asunto', e.target.value)}
                                                    maxLength={255}
                                                />

                                                <Textarea
                                                    label="Mensaje"
                                                    value={tramite.mensaje || ''}
                                                    onChange={(e) => handleEditarTramite(index, 'mensaje', e.target.value)}
                                                    rows={2}
                                                    maxLength={500}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => {
                                                setDeteccionResultado(null);
                                                setTramitesListos([]);
                                            }}
                                        >
                                            Volver
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleEnviarLoteAutomatico}
                                            isLoading={isLoading}
                                            disabled={isLoading || tramitesListos.length === 0}
                                            className="flex-1"
                                        >
                                            <Send className="w-4 h-4" />
                                            Enviar {tramitesListos.length} Trámite{tramitesListos.length !== 1 ? 's' : ''}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Mostrar fallidos si existen */}
                            {deteccionResultado.fallidos.length > 0 && (
                                <Card className="border-2 border-amber-200 bg-amber-50/30">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-amber-600" />
                                            Archivos No Procesados ({deteccionResultado.fallidos.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {deteccionResultado.fallidos.map((fallido, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-start gap-2 p-2 bg-white border border-amber-200 rounded"
                                                >
                                                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {fallido.nombre_archivo}
                                                        </p>
                                                        <p className="text-xs text-amber-700">
                                                            {fallido.error}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </>
            ) : (
                // ========== MODOS INDIVIDUAL Y BULK (CÓDIGO EXISTENTE) ==========
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
                                helperText="Resumen breve del documento a enviar"
                            />

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

                                        {selectedDocType.requiere_respuesta && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                                                <MessageSquare className="w-3 h-3 mr-1" />
                                                Requiere Respuesta
                                            </span>
                                        )}
                                    </div>

                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 space-y-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-blue-900 mb-2">
                                                        Características de este tipo de documento
                                                    </p>

                                                    {selectedDocType.descripcion && (
                                                        <p className="text-sm text-blue-800 mb-3 italic">
                                                            {selectedDocType.descripcion}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    {selectedDocType.requiere_firma && (
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

                                                    {selectedDocType.requiere_respuesta && (
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
                            disabled={isLoading}
                        >
                            <Send className="w-4 h-4" />
                            {isLoading ? 'Enviando...' : 'Enviar Documento'}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
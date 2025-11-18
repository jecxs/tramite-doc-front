// src/app/(dashboard)/trabajador/tramites/[id]/observacion/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    ArrowLeft,
    FileText,
    MessageSquare,
    AlertTriangle,
    HelpCircle,
    Info,
    Send,
    Loader2,
    User,
    Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getProcedureById } from '@/lib/api/tramites';
import { createObservation } from '@/lib/api/observaciones';
import { Procedure } from '@/types';
import { toast } from 'sonner';

type ObservationType = 'CONSULTA' | 'CORRECCION_REQUERIDA' | 'INFORMACION_ADICIONAL';

interface ObservationForm {
    tipo: ObservationType | '';
    descripcion: string;
}

interface FormErrors {
    tipo?: string;
    descripcion?: string;
}

export default function CreateObservationPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [procedure, setProcedure] = useState<Procedure | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const [formData, setFormData] = useState<ObservationForm>({
        tipo: '',
        descripcion: '',
    });

    useEffect(() => {
        if (id) {
            fetchProcedure();
        }
    }, [id]);

    const fetchProcedure = async () => {
        try {
            setIsLoading(true);
            const data = await getProcedureById(id);
            setProcedure(data);
        } catch (err: any) {
            console.error('Error fetching procedure:', err);
            toast.error('Error al cargar el trámite');
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.tipo) {
            newErrors.tipo = 'Seleccione el tipo de observación';
        }

        if (!formData.descripcion.trim()) {
            newErrors.descripcion = 'La descripción es obligatoria';
        } else if (formData.descripcion.trim().length < 10) {
            newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Por favor, corrija los errores del formulario');
            return;
        }

        try {
            setIsSubmitting(true);
            await createObservation(id, {
                tipo: formData.tipo as ObservationType,
                descripcion: formData.descripcion.trim(),
            });
            toast.success('Observación creada correctamente');
            toast.info('El responsable será notificado de tu observación');
            router.push(`/trabajador/tramites/${id}`);
        } catch (err: any) {
            console.error('Error creating observation:', err);
            toast.error(err.message || 'Error al crear la observación');
        } finally {
            setIsSubmitting(false);
        }
    };

    const observationTypes = [
        {
            value: 'CONSULTA',
            label: 'Consulta',
            icon: <HelpCircle className="w-5 h-5" />,
            description: 'Tienes una pregunta o necesitas aclaración sobre el documento',
            color: 'border-blue-200 hover:border-blue-400 bg-blue-50',
            selectedColor: 'border-blue-500 bg-blue-100',
        },
        {
            value: 'CORRECCION_REQUERIDA',
            label: 'Corrección Requerida',
            icon: <AlertTriangle className="w-5 h-5" />,
            description: 'Has encontrado un error que debe ser corregido',
            color: 'border-red-200 hover:border-red-400 bg-red-50',
            selectedColor: 'border-red-500 bg-red-100',
        },
        {
            value: 'INFORMACION_ADICIONAL',
            label: 'Información Adicional',
            icon: <Info className="w-5 h-5" />,
            description: 'Necesitas información complementaria para proceder',
            color: 'border-yellow-200 hover:border-yellow-400 bg-yellow-50',
            selectedColor: 'border-yellow-500 bg-yellow-100',
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando información...</p>
                </div>
            </div>
        );
    }

    if (!procedure) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Crear Observación
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Reporta dudas, errores o solicita información adicional
                    </p>
                </div>
            </div>

            {/* Información del Trámite */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Información del Trámite</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700">Código</p>
                                <p className="text-sm text-gray-900 font-mono">{procedure.codigo}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700">Asunto</p>
                                <p className="text-sm text-gray-900">{procedure.asunto}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700">Enviado por</p>
                                <p className="text-sm text-gray-900">
                                    {procedure.remitente.nombres} {procedure.remitente.apellidos}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700">Fecha de envío</p>
                                <p className="text-sm text-gray-900">
                                    {format(new Date(procedure.fecha_envio), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipo de Observación */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Tipo de Observación *
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {observationTypes.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => {
                                        setFormData({ ...formData, tipo: type.value as ObservationType });
                                        setErrors({ ...errors, tipo: undefined });
                                    }}
                                    className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                                        formData.tipo === type.value
                                            ? type.selectedColor
                                            : type.color
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`${
                                            formData.tipo === type.value
                                                ? 'text-gray-700'
                                                : 'text-gray-500'
                                        }`}>
                                            {type.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className={`text-sm font-medium ${
                                                    formData.tipo === type.value
                                                        ? 'text-gray-900'
                                                        : 'text-gray-700'
                                                }`}>
                                                    {type.label}
                                                </p>
                                                {formData.tipo === type.value && (
                                                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <p className={`text-xs ${
                                                formData.tipo === type.value
                                                    ? 'text-gray-700'
                                                    : 'text-gray-600'
                                            }`}>
                                                {type.description}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {errors.tipo && (
                            <p className="text-sm text-red-600 mt-2">{errors.tipo}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Descripción */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Descripción de la Observación *
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            value={formData.descripcion}
                            onChange={(e) => {
                                setFormData({ ...formData, descripcion: e.target.value });
                                setErrors({ ...errors, descripcion: undefined });
                            }}
                            rows={6}
                            placeholder="Describe detalladamente tu observación, duda o solicitud..."
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none ${
                                errors.descripcion ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                                Mínimo 10 caracteres. Sé claro y específico.
                            </p>
                            <p className="text-xs text-gray-500">
                                {formData.descripcion.length} caracteres
                            </p>
                        </div>
                        {errors.descripcion && (
                            <p className="text-sm text-red-600 mt-2">{errors.descripcion}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Info Alert */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                            ¿Qué sucede después?
                        </p>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>El responsable recibirá una notificación inmediata</li>
                            <li>Revisará tu observación y te responderá</li>
                            <li>Recibirás una notificación cuando sea resuelta</li>
                            <li>Podrás ver la respuesta en los detalles del trámite</li>
                        </ul>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Enviar Observación
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
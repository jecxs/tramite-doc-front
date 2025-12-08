/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  HelpCircle,
  Info,
  Send,
  Loader2,
  User,
  Calendar,
  CheckCircle,
} from 'lucide-react';
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
    } catch (err: unknown) {
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
    } catch (err: unknown) {
      console.error('Error creating observation:', err);
      toast.error(
        err instanceof Error
          ? err.message || 'Error al crear la observación'
          : 'Error al crear la observación',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const observationTypes = [
    {
      value: 'CONSULTA',
      label: 'Consulta',
      icon: <HelpCircle className='w-5 h-5' />,
      description: 'Tienes una pregunta o necesitas aclaración sobre el documento',
      color: 'from-blue-500/20 to-blue-400/10',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      selectedBg: 'from-blue-500/30 to-blue-400/20',
      selectedBorder: 'border-blue-400',
    },
    {
      value: 'CORRECCION_REQUERIDA',
      label: 'Corrección Requerida',
      icon: <AlertTriangle className='w-5 h-5' />,
      description: 'Has encontrado un error que debe ser corregido',
      color: 'from-red-500/20 to-red-400/10',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-400',
      selectedBg: 'from-red-500/30 to-red-400/20',
      selectedBorder: 'border-red-400',
    }

  ];

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
        <div className='text-center'>
          <Loader2 className='w-10 h-10 animate-spin text-purple-400 mx-auto mb-4' />
          <p className='text-slate-300 font-medium'>Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!procedure) {
    return null;
  }

  return (
    <div className='min-h-screen py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div style={{ backgroundColor: '#272d34' }} className='rounded-2xl p-6 shadow-2xl border border-slate-700/50'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => router.back()}
              className='text-slate-300 hover:text-white hover:bg-slate-700/50'
            >
              <ArrowLeft className='w-4 h-4' />
              Volver
            </Button>
            <div className='border-l border-slate-700 pl-4 flex-1'>
              <h1 className='text-2xl font-bold text-white'>Crear Observación</h1>
              <p className='text-sm text-slate-400 mt-1'>
                Reporta dudas, errores o solicita información adicional
              </p>
            </div>
          </div>
        </div>

        {/* Layout de 2 Columnas */}
        <form onSubmit={handleSubmit} className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Columna Izquierda - Información del Trámite */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Información del Trámite */}
            <div style={{ backgroundColor: '#272d34' }} className='rounded-2xl p-6 shadow-2xl border border-slate-700/50'>
              <h3 className='text-lg font-semibold text-white mb-4'>Información del Trámite</h3>

              <div className='space-y-4'>
                <div className='flex items-start gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/30'>
                  <FileText className='w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5' />
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs text-slate-400 mb-1'>Código</p>
                    <p className='text-sm text-white font-mono font-medium truncate'>{procedure.codigo}</p>
                  </div>
                </div>

                <div className='flex items-start gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/30'>
                  <Calendar className='w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5' />
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs text-slate-400 mb-1'>Fecha de envío</p>
                    <p className='text-sm text-white font-medium'>
                      {format(new Date(procedure.fecha_envio), "dd 'de' MMM 'de' yyyy", { locale: es })}
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/30'>
                  <FileText className='w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5' />
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs text-slate-400 mb-1'>Asunto</p>
                    <p className='text-sm text-white font-medium leading-relaxed'>{procedure.asunto}</p>
                  </div>
                </div>

                <div className='flex items-start gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/30'>
                  <User className='w-5 h-5 text-green-400 flex-shrink-0 mt-0.5' />
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs text-slate-400 mb-1'>Enviado por</p>
                    <p className='text-sm text-white font-medium'>
                      {procedure.remitente.nombres} {procedure.remitente.apellidos}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Alert */}
            <div className='bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-2xl p-5 shadow-2xl'>
              <div className='flex items-start gap-3'>
                <div className='bg-blue-500/20 p-2 rounded-lg flex-shrink-0'>
                  <Info className='w-5 h-5 text-blue-300' />
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-semibold text-white mb-3'>¿Qué sucede después?</p>
                  <ul className='space-y-2'>
                    <li className='flex items-start gap-2 text-xs text-blue-200'>
                      <CheckCircle className='w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5' />
                      El responsable recibirá notificación inmediata
                    </li>
                    <li className='flex items-start gap-2 text-xs text-blue-200'>
                      <CheckCircle className='w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5' />
                      Revisará y responderá tu observación
                    </li>
                    <li className='flex items-start gap-2 text-xs text-blue-200'>
                      <CheckCircle className='w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5' />
                      Recibirás notificación al resolverse
                    </li>
                    <li className='flex items-start gap-2 text-xs text-blue-200'>
                      <CheckCircle className='w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5' />
                      Verás la respuesta en detalles del trámite
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Formulario Principal */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Columna Derecha - Formulario Principal */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Tipo de Observación */}
              <div style={{ backgroundColor: '#272d34' }} className='rounded-2xl p-6 shadow-2xl border border-slate-700/50'>
                <div className='mb-5'>
                  <h3 className='text-lg font-semibold text-white'>Tipo de Observación</h3>
                  <p className='text-sm text-slate-400 mt-1'>Selecciona la categoría que mejor describa tu observación</p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {observationTypes.map((type) => (
                    <button
                      key={type.value}
                      type='button'
                      onClick={() => {
                        setFormData({ ...formData, tipo: type.value as ObservationType });
                        setErrors({ ...errors, tipo: undefined });
                      }}
                      className={`relative p-5 rounded-xl border-2 transition-all duration-200 ${
                        formData.tipo === type.value
                          ? `bg-gradient-to-br ${type.selectedBg} ${type.selectedBorder}`
                          : `bg-gradient-to-br ${type.color} ${type.borderColor} hover:${type.selectedBorder}`
                      }`}
                    >
                      <div className='text-center'>
                        <div className={`inline-flex p-3 rounded-lg mb-3 ${
                          formData.tipo === type.value ? 'bg-slate-900/40' : 'bg-slate-800/40'
                        }`}>
                          <div className={type.iconColor}>{type.icon}</div>
                        </div>
                        <p className='text-sm font-semibold text-white mb-2'>{type.label}</p>
                        <p className='text-xs text-slate-300 leading-relaxed'>{type.description}</p>
                      </div>

                      {formData.tipo === type.value && (
                        <div className='absolute top-3 right-3'>
                          <div className='w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-lg'>
                            <CheckCircle className='w-4 h-4 text-white' />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {errors.tipo && (
                  <div className='mt-4 flex items-center gap-2 text-red-400 text-sm'>
                    <AlertTriangle className='w-4 h-4' />
                    {errors.tipo}
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div style={{ backgroundColor: '#272d34' }} className='rounded-2xl p-6 shadow-2xl border border-slate-700/50'>
                <div className='mb-4'>
                  <h3 className='text-lg font-semibold text-white'>Descripción de la Observación</h3>
                  <p className='text-sm text-slate-400 mt-1'>Describe detalladamente tu observación, duda o solicitud</p>
                </div>

                <textarea
                  value={formData.descripcion}
                  onChange={(e) => {
                    setFormData({ ...formData, descripcion: e.target.value });
                    setErrors({ ...errors, descripcion: undefined });
                  }}
                  rows={10}
                  placeholder='Escribe aquí tu observación de forma clara y detallada...'
                  className={`w-full px-4 py-3 bg-slate-800/40 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-white placeholder-slate-500 transition-all ${
                    errors.descripcion ? 'border-red-500/50' : 'border-slate-700/50'
                  }`}
                />

                <div className='flex items-center justify-between mt-3'>
                  <p className='text-xs text-slate-500'>Mínimo 10 caracteres. Sé claro y específico.</p>
                  <p className={`text-xs font-medium ${
                    formData.descripcion.length >= 10 ? 'text-green-400' : 'text-slate-500'
                  }`}>
                    {formData.descripcion.length} caracteres
                  </p>
                </div>

                {errors.descripcion && (
                  <div className='mt-3 flex items-center gap-2 text-red-400 text-sm'>
                    <AlertTriangle className='w-4 h-4' />
                    {errors.descripcion}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ backgroundColor: '#272d34' }} className='rounded-2xl p-6 shadow-2xl border border-slate-700/50'>
                <div className='flex items-center justify-end gap-3'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    className='bg-slate-700/30 hover:bg-slate-600/40 text-white border border-slate-600/50'
                  >
                    Cancelar
                  </Button>
                  <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-500/30'
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className='w-4 h-4 animate-spin' />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className='w-4 h-4' />
                        Enviar Observación
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
);
}

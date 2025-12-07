'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import FileUpload from '@/components/ui/FileUpload';
import WorkerSelector from '@/components/ui/WorkerSelector';
import DocumentTypeInfo from './shared/DocumentTypeInfo';
import { User, DocumentType } from '@/types';
import apiClient, { handleApiError } from '@/lib/api-client';

interface SendIndividualFormProps {
  workers: User[];
  documentTypes: DocumentType[];
  onError: (error: string) => void;
}

interface FormData {
  asunto: string;
  mensaje: string;
  id_destinatario: string;
  titulo_documento: string;
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

export default function SendIndividualForm({
  workers,
  documentTypes,
  onError,
}: SendIndividualFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    asunto: '',
    mensaje: '',
    id_destinatario: '',
    titulo_documento: '',
    id_tipo_documento: '',
    file: null,
  });

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
    onError('');

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

      // Paso 2: Crear el trámite
      const tramiteData = {
        asunto: formData.asunto,
        mensaje: formData.mensaje || undefined,
        id_documento: documentoCreado.id_documento,
        id_receptor: formData.id_destinatario,
      };

      console.log('📤 Creando trámite individual...');
      await apiClient.post('/tramites', tramiteData);
      console.log('✅ Trámite creado exitosamente');

      router.push('/responsable/tramites?success=true');
    } catch (error) {
      console.error('❌ Error sending document:', error);
      onError(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const selectedDocType = documentTypes.find((dt) => dt.id_tipo === formData.id_tipo_documento);

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Información del Trámite */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Trámite</CardTitle>
          <CardDescription>Datos básicos del envío de documento</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Input
            label='Asunto'
            placeholder='Ej: Contrato Laboral 2025'
            value={formData.asunto}
            onChange={(e) => handleInputChange('asunto', e.target.value)}
            error={errors.asunto}
            required
            maxLength={255}
            helperText='Resumen breve del documento a enviar'
          />

          <WorkerSelector
            workers={workers}
            selectedWorkerId={formData.id_destinatario}
            onSelect={(workerId) => handleInputChange('id_destinatario', workerId)}
            error={errors.id_destinatario}
            required
          />

          <Textarea
            label='Mensaje (Opcional)'
            placeholder='Agregue un mensaje o instrucciones adicionales para el destinatario'
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
          <CardDescription>Detalles del archivo a enviar</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Select
            label='Tipo de Documento'
            placeholder='Seleccione un tipo'
            value={formData.id_tipo_documento}
            onChange={(value) => handleInputChange('id_tipo_documento', value)}
            options={documentTypes.map((type) => ({
              value: type.id_tipo,
              label: type.nombre,
            }))}
            error={errors.id_tipo_documento}
            required
          />

          {selectedDocType && <DocumentTypeInfo documentType={selectedDocType} />}

          <Input
            label='Título del Documento'
            placeholder='Ej: Contrato de Trabajo - Juan Pérez'
            value={formData.titulo_documento}
            onChange={(e) => handleInputChange('titulo_documento', e.target.value)}
            error={errors.titulo_documento}
            required
            maxLength={255}
            helperText='Este será el nombre que verá el trabajador'
          />

          <FileUpload
            label='Archivo PDF'
            required
            onFileSelect={(file) => handleInputChange('file', file)}
            error={errors.file}
            helperText='Seleccione el archivo PDF que desea enviar (máximo 10MB)'
          />
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className='flex items-center justify-end gap-4'>
        <Link href='/responsable/tramites'>
          <Button type='button' variant='ghost' disabled={isLoading}>
            Cancelar
          </Button>
        </Link>
        <Button type='submit' isLoading={isLoading} disabled={isLoading}>
          <Send className='w-4 h-4' />
          {isLoading ? 'Enviando...' : 'Enviar Documento'}
        </Button>
      </div>
    </form>
  );
}

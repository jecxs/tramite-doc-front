'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, FileText, User, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import FileUpload from '@/components/ui/FileUpload';
import WorkerSelector from '@/components/ui/WorkerSelector';
import DocumentTypeInfo from './shared/DocumentTypeInfo';
import { User as UserType, DocumentType } from '@/types';
import apiClient, { handleApiError } from '@/lib/api-client';

interface SendIndividualFormProps {
  workers: UserType[];
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as const
    }
  },
};

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

      console.log(' Creando trámite individual...');
      await apiClient.post('/tramites', tramiteData);
      console.log(' Trámite creado exitosamente');

      router.push('/responsable/tramites?success=true');
    } catch (error) {
      console.error(' Error sending document:', error);
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
    <motion.form
      onSubmit={handleSubmit}
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='space-y-6 mx-auto'
    >
      {/* Información del Trámite */}
      <motion.div variants={itemVariants}>
        <Card className='bg-[#272d34] backdrop-blur-md shadow-2xl'>
          <CardHeader className='border-b border-[#3D4153]/40 pb-5'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/15 to-blue-600/15 flex items-center justify-center border border-blue-500/20'>
                <MessageSquare className='w-5 h-5 text-blue-400' />
              </div>
              <div>
                <CardTitle className='text-white text-base font-medium'>Datos básicos del envío de documento</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-5 pt-6'>
            <Input
              label='Asunto'
              placeholder='Ej: Contrato Laboral 2025'
              value={formData.asunto}
              onChange={(e) => handleInputChange('asunto', e.target.value)}
              error={errors.asunto}
              required
              maxLength={255}
              helperText='Resumen breve del documento a enviar'
              className='bg-[#1E2029]/60 border-[#3D4153]/50 text-white placeholder:text-gray-500 focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200'
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
              className='bg-[#1E2029]/60 border-[#3D4153]/50 text-white placeholder:text-gray-500 focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200 resize-none'
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Información del Documento */}
      <motion.div variants={itemVariants}>
        <Card className='bg-[#272d34] backdrop-blur-md shadow-2xl'>
          <CardHeader className='border-b border-[#3D4153]/40 pb-5'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/15 to-purple-600/15 flex items-center justify-center border border-purple-500/20'>
                <FileText className='w-5 h-5 text-purple-400' />
              </div>
              <div>
                <CardTitle className='text-white text-base font-medium'>Detalles del archivo a enviar</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-5 pt-6'>
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
              className='bg-[#1E2029]/60 border-[#3D4153]/50 text-white focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/30 transition-all duration-200'
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
              className='bg-[#1E2029]/60 border-[#3D4153]/50 text-white placeholder:text-gray-500 focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/30 transition-all duration-200'
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
      </motion.div>

      {/* Botones de acción */}
      <motion.div variants={itemVariants} className='flex items-center justify-end gap-3 pt-2'>
        <Link href='/responsable/tramites'>
          <Button
            type='button'
            variant='ghost'
            disabled={isLoading}
            className='bg-[#2A2D3A]/60 hover:bg-[#2A2D3A]/80 text-gray-300 hover:text-white border border-[#3D4153]/60 transition-all duration-200 px-6 h-11'
          >
            Cancelar
          </Button>
        </Link>
        <Button
          type='submit'
          isLoading={isLoading}
          disabled={isLoading}
          className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all duration-200 px-6 h-11 font-medium'
        >
          <Send className='w-4 h-4' />
          {isLoading ? 'Enviando...' : 'Enviar Documento'}
        </Button>
      </motion.div>
    </motion.form>
  );
}

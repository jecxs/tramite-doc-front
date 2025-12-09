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
        {/* CAMBIO 1: bg-card en lugar de color fijo, text-card-foreground */}
        <Card className='bg-card backdrop-blur-md shadow-lg border border-border'>
          <CardHeader className='border-b border-border/50 pb-5'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20'>
                <MessageSquare className='w-5 h-5 text-blue-500 dark:text-blue-400' />
              </div>
              <div>
                {/* CAMBIO 2: text-foreground en lugar de text-white */}
                <CardTitle className='text-card-foreground text-base font-medium'>Datos básicos del envío de documento</CardTitle>
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
              // CAMBIO 3: Estilos de input adaptables
              className='bg-secondary/50 border-input text-foreground placeholder:text-muted-foreground focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200'
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
              // CAMBIO 4: Estilos de textarea adaptables
              className='bg-secondary/50 border-input text-foreground placeholder:text-muted-foreground focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 resize-none'
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Información del Documento */}
      <motion.div variants={itemVariants}>
        <Card className='bg-card backdrop-blur-md shadow-lg border border-border'>
          <CardHeader className='border-b border-border/50 pb-5'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20'>
                <FileText className='w-5 h-5 text-purple-500 dark:text-purple-400' />
              </div>
              <div>
                <CardTitle className='text-card-foreground text-base font-medium'>Detalles del archivo a enviar</CardTitle>
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
              // CAMBIO 5: Select adaptable
              className='bg-secondary/50 border-input text-foreground focus:border-purple-500/50 focus:ring-purple-500/20 transition-all duration-200'
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
              className='bg-secondary/50 border-input text-foreground placeholder:text-muted-foreground focus:border-purple-500/50 focus:ring-purple-500/20 transition-all duration-200'
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
            // CAMBIO 6: Botón cancelar adaptable
            className='bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border transition-all duration-200 px-6 h-11'
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

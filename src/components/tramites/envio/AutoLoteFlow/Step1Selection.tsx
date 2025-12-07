'use client';

import { useState } from 'react';
import { Zap, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import AutoLoteFileUpload from '@/components/ui/AutoLoteFileUpload';
import { DocumentType, DeteccionDestinatarioDto, DocumentoConDestinatarioDto } from '@/types';
import { detectarDestinatarios, generarMensajePredeterminado } from '@/lib/api/tramites-auto';
import { uploadDocumentsBatch } from '@/lib/api/documents';
import { handleApiError } from '@/lib/api-client';

interface Step1SelectionProps {
  documentTypes: DocumentType[];
  selectedDocType: string;
  onDocTypeChange: (value: string) => void;
  onDetectionComplete: (
    resultado: {
      exitosos: DeteccionDestinatarioDto[];
      fallidos: DeteccionDestinatarioDto[];
      tipo_documento: DocumentType;
    },
    tramites: DocumentoConDestinatarioDto[],
  ) => void;
  onError: (error: string) => void;
}

export default function Step1Selection({
                                         documentTypes,
                                         selectedDocType,
                                         onDocTypeChange,
                                         onDetectionComplete,
                                         onError,
                                       }: Step1SelectionProps) {
  const [archivos, setArchivos] = useState<File[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [errors, setErrors] = useState<{ id_tipo_documento?: string; archivos_lote?: string }>({});

  const selectedDoc = documentTypes.find((dt) => dt.id_tipo === selectedDocType);

  const handleDetectar = async () => {
    const newErrors: { id_tipo_documento?: string; archivos_lote?: string } = {};

    if (!selectedDocType) {
      newErrors.id_tipo_documento = 'Debe seleccionar un tipo de documento';
    }

    if (archivos.length === 0) {
      newErrors.archivos_lote = 'Debe seleccionar al menos un archivo';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsDetecting(true);
      onError('');

      console.log('🔍 Detectando destinatarios...');
      const resultado = await detectarDestinatarios(archivos, selectedDocType);
      console.log('✅ Detección completa:', resultado);

      if (resultado.exitosos.length === 0) {
        onError('No se detectaron destinatarios válidos en los archivos proporcionados');
        return;
      }

      console.log('📤 Subiendo documentos en lote...');
      const documentosSubidos = await uploadDocumentsBatch(
        archivos,
        resultado.tipo_documento.id_tipo,
      );
      console.log('✅ Documentos subidos:', documentosSubidos);

      const tramitesPreparados: DocumentoConDestinatarioDto[] = [];

      for (let i = 0; i < resultado.exitosos.length; i++) {
        const trabajador = resultado.exitosos[i];
        const documento = documentosSubidos[i];

        const template = await generarMensajePredeterminado(
          resultado.tipo_documento.codigo,
          trabajador.nombre_completo || 'Trabajador',
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

      onDetectionComplete(resultado, tramitesPreparados);
    } catch (error) {
      console.error('❌ Error en detección:', error);
      onError(handleApiError(error));
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <Card className='bg-[#272d34] backdrop-blur-md shadow-2xl'>
      <CardHeader className='border-b border-[#3D4153]/40 pb-5'>
        <CardTitle className='text-white text-lg font-medium'>Paso 1: Seleccionar Documentos</CardTitle>
        <CardDescription className='text-gray-400 text-sm mt-2'>
          Elija el tipo de documento y suba los archivos. Los nombres deben iniciar con el DNI del
          destinatario.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-5 pt-6'>
        <Select
          label='Tipo de Documento'
          placeholder='Seleccione un tipo'
          value={selectedDocType}
          onChange={(value) => {
            onDocTypeChange(value);
            setErrors((prev) => ({ ...prev, id_tipo_documento: undefined }));
          }}
          options={documentTypes.map((type) => ({
            value: type.id_tipo,
            label: type.nombre,
          }))}
          error={errors.id_tipo_documento}
          required
          className='bg-[#1E2029]/60 border-[#3D4153]/50 text-white focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 transition-all duration-200'
        />

        {selectedDoc && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className='bg-blue-500/10 border border-blue-400/30 rounded-xl p-4'
          >
            <div className='flex items-start gap-3'>
              <div className='w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0 border border-blue-400/20'>
                <Info className='w-4.5 h-4.5 text-blue-300' />
              </div>
              <div className='text-sm'>
                <p className='font-medium text-white mb-1'>Tipo seleccionado: {selectedDoc.nombre}</p>
                {selectedDoc.descripcion && <p className='text-xs text-gray-400'>{selectedDoc.descripcion}</p>}
              </div>
            </div>
          </motion.div>
        )}

        <AutoLoteFileUpload
          label='Archivos PDF'
          required
          onFilesSelect={(files) => {
            setArchivos(files);
            setErrors((prev) => ({ ...prev, archivos_lote: undefined }));
          }}
          error={errors.archivos_lote}
          helperText='Los archivos deben iniciar con el DNI del trabajador (8 dígitos). Ejemplo: 12345678_Contrato.pdf'
          maxFiles={50}
        />

        <Button
          type='button'
          onClick={handleDetectar}
          isLoading={isDetecting}
          disabled={isDetecting || archivos.length === 0 || !selectedDocType}
          className='w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all duration-200 h-11 font-medium'
        >
          <Zap className='w-4 h-4' />
          {isDetecting ? 'Detectando...' : 'Detectar Destinatarios'}
        </Button>
      </CardContent>
    </Card>
  );
}

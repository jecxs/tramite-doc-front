'use client';

import { useState } from 'react';
import { DocumentType, DeteccionDestinatarioDto, DocumentoConDestinatarioDto } from '@/types';
import Step1Selection from './Step1Selection';
import Step2Review from './Step2Review';

interface AutoLoteFlowProps {
  documentTypes: DocumentType[];
  onError: (error: string) => void;
}

export default function AutoLoteFlow({ documentTypes, onError }: AutoLoteFlowProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [deteccionResultado, setDeteccionResultado] = useState<{
    exitosos: DeteccionDestinatarioDto[];
    fallidos: DeteccionDestinatarioDto[];
    tipo_documento: DocumentType;
  } | null>(null);
  const [tramitesListos, setTramitesListos] = useState<DocumentoConDestinatarioDto[]>([]);

  const handleDetectionComplete = (
    resultado: {
      exitosos: DeteccionDestinatarioDto[];
      fallidos: DeteccionDestinatarioDto[];
      tipo_documento: DocumentType;
    },
    tramites: DocumentoConDestinatarioDto[],
  ) => {
    setDeteccionResultado(resultado);
    setTramitesListos(tramites);
    setCurrentStep(2);
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setDeteccionResultado(null);
    setTramitesListos([]);
  };

  return (
    <>
      {currentStep === 1 ? (
        <Step1Selection
          documentTypes={documentTypes}
          selectedDocType={selectedDocType}
          onDocTypeChange={setSelectedDocType}
          onDetectionComplete={handleDetectionComplete}
          onError={onError}
        />
      ) : (
        <Step2Review
          deteccionResultado={deteccionResultado!}
          tramitesListos={tramitesListos}
          onTramitesChange={setTramitesListos}
          onBack={handleBackToStep1}
          onError={onError}
        />
      )}
    </>
  );
}

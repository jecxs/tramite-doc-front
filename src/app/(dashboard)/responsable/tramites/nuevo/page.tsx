'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { getWorkers } from '@/lib/api/usuarios';
import { getDocumentTypes } from '@/lib/api/document-type';
import { User, DocumentType } from '@/types';
import ModeSelector from '@/components/tramites/envio/ModeSelector';
import SendIndividualForm from '@/components/tramites/envio/SendIndividualForm';
import SendBulkForm from '@/components/tramites/envio/SendBulkForm';
import AutoLoteFlow from '@/components/tramites/envio/AutoLoteFlow';

type SendMode = 'individual' | 'bulk' | 'auto-lote';

export default function SendDocumentPage() {
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [workers, setWorkers] = useState<User[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [apiError, setApiError] = useState<string>('');
  const [sendMode, setSendMode] = useState<SendMode>('individual');

  // Cargar datos iniciales
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

  const handleModeChange = (mode: SendMode) => {
    setSendMode(mode);
    setApiError('');
  };

  if (isLoadingData) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className='text-center'>
          <div className='relative mb-6'>
            <Loader2 className='w-14 h-14 animate-spin text-blue-600 mx-auto' />
            <Sparkles className='w-6 h-6 text-amber-500 absolute top-0 right-1/4 animate-pulse' />
          </div>
          <p className='text-gray-600 font-medium'>Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='space-y-8'>
          {/* Header mejorado */}
          <div className='flex items-start gap-6'>
            <Link href='/responsable/tramites'>
              <Button
                variant='ghost'
                size='sm'
                className='hover:bg-white/80 transition-all duration-200'
              >
                <ArrowLeft className='w-4 h-4' />
                Volver
              </Button>
            </Link>
            <div className='flex-1'>
              <div className='flex items-center gap-3 mb-2'>
                <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex items-center justify-center'>
                  <svg
                    className='w-6 h-6 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                </div>
                <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>
                  Enviar Documento
                </h1>
              </div>
              <p className='text-gray-500 text-sm pl-15'>
                Complete el formulario para enviar un documento a los trabajadores
              </p>
            </div>
          </div>

          {/* Error general de API - Mejorado */}
          {apiError && (
            <div className='bg-white border-l-4 border-red-500 rounded-lg shadow-sm overflow-hidden'>
              <div className='p-4 flex items-start gap-3'>
                <div className='flex-shrink-0 w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center'>
                  <AlertCircle className='w-5 h-5 text-red-600' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold text-red-800 mb-1'>Error en la operación</p>
                  <p className='text-sm text-red-700'>{apiError}</p>
                </div>
                <button
                  onClick={() => setApiError('')}
                  className='flex-shrink-0 p-1 hover:bg-red-50 rounded transition-colors'
                >
                  <svg
                    className='w-5 h-5 text-red-600'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Selector de Modo */}
          <ModeSelector currentMode={sendMode} onModeChange={handleModeChange} />

          {/* Renderizar formulario según modo */}
          <div className='animate-fadeIn'>
            {sendMode === 'individual' && (
              <SendIndividualForm
                workers={workers}
                documentTypes={documentTypes}
                onError={setApiError}
              />
            )}

            {sendMode === 'bulk' && (
              <SendBulkForm workers={workers} documentTypes={documentTypes} onError={setApiError} />
            )}

            {sendMode === 'auto-lote' && (
              <AutoLoteFlow documentTypes={documentTypes} onError={setApiError} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

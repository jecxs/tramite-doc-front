'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle, Sparkles, FileText } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
            <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-200 via-blue-100 to-slate-200'>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className='text-center'
                >
                    <div className='relative mb-6'>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                            <Loader2 className='w-16 h-16 text-blue-400 mx-auto' />
                        </motion.div>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className='absolute top-0 right-1/4'
                        >
                            <Sparkles className='w-6 h-6 text-amber-400' />
                        </motion.div>
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className='text-slate-300 font-medium text-lg'
                    >
                        Cargando formulario...
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className='min-h-screen'>
            {/* Patrón de fondo decorativo */}
            <div className='fixed inset-0 bg-[url("/grid.svg")] bg-center opacity-5 pointer-events-none' />

            <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                <div className='space-y-8'>
                    {/* Header mejorado con animación */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='flex items-center gap-6'
                        style={{padding:'15px', backgroundImage: 'linear-gradient(#8922A8, #53378C)', borderRadius: '15px'}}
                    >
                        <Link href='/responsable/tramites'>
                            <Button
                                variant='ghost'
                                size='sm'
                                className='bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 border border-white backdrop-blur-sm transition-all duration-200'
                            >
                                <ArrowLeft className='w-4 h-4' />
                                Volver
                            </Button>
                        </Link>

                        <div className='flex-1'>
                            <div className='flex items-center gap-4 mb-3'>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                    className='relative'
                                >
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.5, 0.8, 0.5],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className='absolute inset-0 rounded-2xl bg-blue-400/20 blur-xl'
                                    />
                                </motion.div>

                                <div>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className='text-2xl font-bold text-white tracking-tight'
                                    >
                                        Enviar Documento
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className='text-slate-400 text-sm mt-1'
                                    >
                                        Complete el formulario para enviar documentos a los trabajadores
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Error general de API - Mejorado con animación */}
                    <AnimatePresence>
                        {apiError && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                className='overflow-hidden'
                            >
                                <div className='bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-2xl shadow-lg backdrop-blur-sm'>
                                    <div className='p-4 flex items-start gap-3'>
                                        <div className='flex-shrink-0 w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center'>
                                            <AlertCircle className='w-5 h-5 text-red-400' />
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-sm font-semibold text-red-300 mb-1'>
                                                Error en la operación
                                            </p>
                                            <p className='text-sm text-red-400/90'>{apiError}</p>
                                        </div>
                                        <button
                                            onClick={() => setApiError('')}
                                            className='flex-shrink-0 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors'
                                        >
                                            <svg
                                                className='w-5 h-5 text-red-400'
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
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Selector de Modo con animación */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <ModeSelector currentMode={sendMode} onModeChange={handleModeChange} />
                    </motion.div>

                    {/* Renderizar formulario según modo con transición */}
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={sendMode}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {sendMode === 'individual' && (
                                <SendIndividualForm
                                    workers={workers}
                                    documentTypes={documentTypes}
                                    onError={setApiError}
                                />
                            )}

                            {sendMode === 'bulk' && (
                                <SendBulkForm
                                    workers={workers}
                                    documentTypes={documentTypes}
                                    onError={setApiError}
                                />
                            )}

                            {sendMode === 'auto-lote' && (
                                <AutoLoteFlow documentTypes={documentTypes} onError={setApiError} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

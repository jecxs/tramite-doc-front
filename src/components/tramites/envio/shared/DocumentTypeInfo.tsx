'use client';

import { CheckCircle2, FileSignature, MessageSquareReply, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { DocumentType } from '@/types';

interface DocumentTypeInfoProps {
  documentType: DocumentType;
}

export default function DocumentTypeInfo({ documentType }: DocumentTypeInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className='bg-gradient-to-br from-blue-500/8 to-cyan-500/8 border border-blue-400/20 rounded-xl overflow-hidden backdrop-blur-sm'
    >
      <div className='p-5'>
        {/* Header */}
        <div className='flex items-start gap-3 mb-5'>
          <div className='w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0 border border-blue-400/20'>
            <Info className='w-5 h-5 text-blue-300' />
          </div>
          <div className='flex-1 min-w-0'>
            <h4 className='text-xs font-medium text-foreground-400 mb-1'>
              Tipo de Documento Seleccionado
            </h4>
            <p className='text-base font-semibold text-foreground'>{documentType.nombre}</p>
            {documentType.descripcion && (
              <p className='text-xs text-foreground-400 mt-1.5 leading-relaxed'>{documentType.descripcion}</p>
            )}
          </div>
        </div>

        {/* Características */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {/* Requiere Firma */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`
              flex items-center gap-3 p-3.5 rounded-lg border transition-all duration-200
              ${
              documentType.requiere_firma
                ? 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20'
                : 'bg-muted/50 border-border/50'
            }
            `}
          >
            <div
              className={`
              w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border
              ${documentType.requiere_firma ? 'bg-purple-500/15 border-purple-500/20' : 'bg-background/60 border-border/50'}
            `}
            >
              <FileSignature className={`w-4.5 h-4.5 ${documentType.requiere_firma ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground/70'}`} />
            </div>
            <div className='flex-1 min-w-0'>
              <p
                className={`text-xs font-medium ${documentType.requiere_firma ? 'text-purple-700 dark:text-purple-300' : 'text-muted-foreground'}`}
              >
                Firma Electrónica
              </p>
              <p
                className={`text-xs mt-0.5 ${documentType.requiere_firma ? 'text-purple-600/80 dark:text-purple-400/80' : 'text-muted-foreground/60'}`}
              >
                {documentType.requiere_firma ? 'Requerida' : 'No requerida'}
              </p>
            </div>
            {documentType.requiere_firma && (
              <CheckCircle2 className='w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0' />
            )}
          </motion.div>

          {/* Requiere Respuesta */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className={`
              flex items-center gap-3 p-3.5 rounded-lg border transition-all duration-200
              ${
              documentType.requiere_respuesta
                ? 'bg-blue-600/10 border-blue-400/30 hover:bg-blue-500/20'
                : 'bg-muted/10 border-border/50'
            }
            `}
          >
            <div
              className={`
              w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border
              ${documentType.requiere_respuesta ? 'bg-blue-500/15 border-blue-500/20' : 'bg-background/60 border-border/50'}
            `}
            >
              <MessageSquareReply className={`w-4.5 h-4.5 ${documentType.requiere_respuesta ? 'text-blue-600' : 'text-muted-foreground/70'}`} />
            </div>
            <div className='flex-1 min-w-0'>
              <p
                className={`text-xs font-medium ${documentType.requiere_respuesta ? 'text-blue-700 dark:text-blue-300' : 'text-muted-foreground'}`}
              >
                Conformidad
              </p>
              <p
                className={`text-xs mt-0.5 ${documentType.requiere_respuesta ? 'text-blue-600/80 dark:text-blue-400/80' : 'text-muted-foreground/60'}`}
              >
                {documentType.requiere_respuesta ? 'Requerida' : 'No requerida'}
              </p>
            </div>
            {documentType.requiere_respuesta && (
              <CheckCircle2 className='w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0' />
            )}
          </motion.div>
        </div>

        {/* Nota informativa */}
        {(documentType.requiere_firma || documentType.requiere_respuesta) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='mt-4 p-3.5 bg-[#1E2029]/60 rounded-lg border border-[#3D4153]/40'
          >
            <p className='text-xs text-gray-400 leading-relaxed'>
              <span className='font-semibold text-white'>Nota:</span>{' '}
              {documentType.requiere_firma && documentType.requiere_respuesta
                ? 'Este documento requiere tanto firma electrónica como confirmación de conformidad por parte del trabajador.'
                : documentType.requiere_firma
                  ? 'Este documento requiere firma electrónica del trabajador para completar el trámite.'
                  : 'Este documento requiere que el trabajador confirme su conformidad.'}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

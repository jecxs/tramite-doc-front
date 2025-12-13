'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, FileType, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { createDocumentType } from '@/lib/api/document-type';
import { CreateDocumentTypeDto, DocumentType } from '@/types';
import { handleApiError } from '@/lib/api-client';

interface CreateDocumentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDocType: DocumentType) => void;
}

export default function CreateDocumentTypeModal({
                                                  isOpen,
                                                  onClose,
                                                  onSuccess,
                                                }: CreateDocumentTypeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<CreateDocumentTypeDto>({
    codigo: '',
    nombre: '',
    descripcion: '',
    requiere_firma: false,
    requiere_respuesta: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateDocumentTypeDto, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateDocumentTypeDto, string>> = {};

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es obligatorio';
    } else if (!/^[A-Z_]+$/.test(formData.codigo)) {
      newErrors.codigo = 'Solo letras mayúsculas y guiones bajos';
    } else if (formData.codigo.length > 20) {
      newErrors.codigo = 'Máximo 20 caracteres';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = 'Máximo 100 caracteres';
    }

    if (formData.descripcion && formData.descripcion.length > 255) {
      newErrors.descripcion = 'Máximo 255 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const newDocType = await createDocumentType(formData);

      // Resetear formulario
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        requiere_firma: false,
        requiere_respuesta: false,
      });

      onSuccess(newDocType);
      onClose();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateDocumentTypeDto, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setError('');
  };

  const handleCodigoChange = (value: string) => {
    // Auto-convertir a mayúsculas y reemplazar caracteres inválidos
    const formatted = value.toUpperCase().replace(/[^A-Z_]/g, '');
    handleInputChange('codigo', formatted);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-border/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center border border-purple-500/20">
                      <FileType className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        Crear Tipo de Documento
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Registre un nuevo tipo de documento
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Error general */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-300">Error</p>
                        <p className="text-sm text-red-400/90 mt-1">{error}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Código */}
                <Input
                  label="Código"
                  placeholder="Ej: CONTRATO_ANUAL"
                  value={formData.codigo}
                  onChange={(e) => handleCodigoChange(e.target.value)}
                  error={errors.codigo}
                  required
                  maxLength={20}
                  helperText="Solo mayúsculas y guiones bajos (ej: CONTRATO_ANUAL)"
                  className="bg-secondary/50 border-input text-foreground placeholder:text-muted-foreground"
                />

                {/* Nombre */}
                <Input
                  label="Nombre"
                  placeholder="Ej: Contrato de Trabajo Anual"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  error={errors.nombre}
                  required
                  maxLength={100}
                  helperText="Nombre descriptivo del tipo de documento"
                  className="bg-secondary/50 border-input text-foreground placeholder:text-muted-foreground"
                />

                {/* Descripción */}
                <Textarea
                  label="Descripción (Opcional)"
                  placeholder="Describe para qué se usa este tipo de documento..."
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  error={errors.descripcion}
                  rows={3}
                  maxLength={255}
                  showCharCount
                  className="bg-secondary/50 border-input text-foreground placeholder:text-muted-foreground resize-none"
                />

                {/* Switches */}
                <div className="space-y-3">
                  {/* Requiere Firma */}
                  <label className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        ¿Requiere firma electrónica?
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        El trabajador deberá firmar el documento
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.requiere_firma}
                      onChange={(e) => handleInputChange('requiere_firma', e.target.checked)}
                      className="w-5 h-5 rounded border-input text-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </label>

                  {/* Requiere Respuesta */}
                  <label className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        ¿Requiere respuesta del trabajador?
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        El trabajador podrá responder al documento
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.requiere_respuesta}
                      onChange={(e) => handleInputChange('requiere_respuesta', e.target.checked)}
                      className="w-5 h-5 rounded border-input text-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </label>
                </div>

                {/* Botones */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={isLoading}
                    className="bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Plus className="w-4 h-4" />
                    {isLoading ? 'Creando...' : 'Crear Tipo'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

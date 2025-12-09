'use client';

import React, { useRef, useState } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface AutoLoteFileUploadProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  onFilesSelect: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

const AutoLoteFileUpload: React.FC<AutoLoteFileUploadProps> = ({
  label,
  required = false,
  error,
  helperText,
  onFilesSelect,
  maxFiles = 50,
  disabled = false,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validar que empiece con 8 dígitos (DNI)
    const nombreArchivo = file.name;
    const dniMatch = nombreArchivo.match(/^(\d{8})/);

    if (!dniMatch) {
      return `${file.name}: Debe iniciar con 8 dígitos (DNI)`;
    }

    // Validar extensión PDF
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return `${file.name}: Solo se permiten archivos PDF`;
    }

    // Validar tamaño (10MB)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `${file.name}: No debe exceder 10MB`;
    }

    return null;
  };

  const handleFilesChange = (files: FileList | null) => {
    if (!files) return;

    const filesArray = Array.from(files);
    const errors: string[] = [];
    const validFiles: File[] = [];

    // Validar cada archivo
    filesArray.forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
      } else {
        validFiles.push(file);
      }
    });

    // Verificar límite de archivos
    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > maxFiles) {
      errors.push(`No puede exceder ${maxFiles} archivos en total`);
      return;
    }

    setFileErrors(errors);
    const newSelectedFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newSelectedFiles);
    onFilesSelect(newSelectedFiles);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesChange(e.target.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    handleFilesChange(e.dataTransfer.files);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setFileErrors([]);
    onFilesSelect(newFiles);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className='w-full'>
      {label && (
        <label className='block text-sm font-medium text-foreground-700 mb-2'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}

      <div
        className={`
                    relative border-2 border-dashed rounded-lg p-6
                    transition-colors
                    ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                    ${error ? 'border-red-300 bg-red-50' : ''}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}
                `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type='file'
          accept='.pdf'
          multiple
          onChange={handleInputChange}
          disabled={disabled}
          className='hidden'
        />

        {selectedFiles.length === 0 ? (
          <div className='text-center'>
            <Upload className='w-12 h-12 mx-auto text-gray-400 mb-3' />
            <p className='text-sm text-gray-600 mb-1'>
              <span className='font-medium text-blue-600'>Haz clic para seleccionar</span> o
              arrastra múltiples archivos
            </p>
            <p className='text-xs text-gray-500'>
              Los archivos deben iniciar con el DNI del destinatario (8 dígitos)
            </p>
            <p className='text-xs text-gray-500 mt-1'>
              Ejemplo: <code className='bg-gray-100 px-1 rounded'>12345678_Contrato.pdf</code>
            </p>
          </div>
        ) : (
          <div className='space-y-2 max-h-60 overflow-y-auto'>
            {selectedFiles.map((file, index) => {
              const dni = file.name.substring(0, 8);

              return (
                <div
                  key={index}
                  className='flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg'
                >
                  <div className='flex items-center gap-3 flex-1 min-w-0'>
                    <div className='p-2 bg-blue-100 rounded-lg flex-shrink-0'>
                      <File className='w-5 h-5 text-blue-600' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate'>{file.name}</p>
                      <div className='flex items-center gap-2 text-xs text-gray-500'>
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span className='font-mono'>DNI: {dni}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    disabled={disabled}
                    className='p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0'
                  >
                    <X className='w-5 h-5 text-gray-500' />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contador de archivos */}
      {selectedFiles.length > 0 && (
        <div className='mt-2 flex items-center gap-2 text-sm'>
          <CheckCircle className='w-4 h-4 text-green-600' />
          <span className='text-gray-700'>
            {selectedFiles.length} archivo{selectedFiles.length !== 1 ? 's' : ''} seleccionado
            {selectedFiles.length !== 1 ? 's' : ''}
            {maxFiles && ` (máx. ${maxFiles})`}
          </span>
        </div>
      )}

      {/* Errores de validación */}
      {fileErrors.length > 0 && (
        <div className='mt-2 space-y-1'>
          {fileErrors.map((err, idx) => (
            <div key={idx} className='flex items-start gap-1 text-sm text-red-600'>
              <AlertTriangle className='w-4 h-4 mt-0.5 flex-shrink-0' />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error general */}
      {error && (
        <div className='mt-2 flex items-start gap-1 text-sm text-red-600'>
          <AlertCircle className='w-4 h-4 mt-0.5 flex-shrink-0' />
          <span>{error}</span>
        </div>
      )}

      {/* Helper text */}
      {helperText && !error && fileErrors.length === 0 && (
        <p className='mt-2 text-sm text-gray-500'>{helperText}</p>
      )}
    </div>
  );
};

export default AutoLoteFileUpload;

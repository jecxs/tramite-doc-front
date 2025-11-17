'use client';

import React, { useRef, useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { FILE_UPLOAD } from '@/lib/constants';

interface FileUploadProps {
    label?: string;
    required?: boolean;
    error?: string;
    helperText?: string;
    onFileSelect: (file: File | null) => void;
    accept?: string;
    maxSizeMB?: number;
    disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
                                                   label,
                                                   required = false,
                                                   error,
                                                   helperText,
                                                   onFileSelect,
                                                   accept = FILE_UPLOAD.ACCEPTED_TYPES.join(','),
                                                   maxSizeMB = FILE_UPLOAD.MAX_SIZE_MB,
                                                   disabled = false,
                                               }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [fileError, setFileError] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        // Validar tamaño
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return `El archivo no debe exceder ${maxSizeMB}MB`;
        }

        // Validar tipo
        if (!FILE_UPLOAD.ACCEPTED_TYPES.includes(file.type)) {
            return 'Solo se permiten archivos PDF';
        }

        return null;
    };

    const handleFileChange = (file: File | null) => {
        setFileError('');

        if (!file) {
            setSelectedFile(null);
            onFileSelect(null);
            return;
        }

        const validationError = validateFile(file);
        if (validationError) {
            setFileError(validationError);
            setSelectedFile(null);
            onFileSelect(null);
            return;
        }

        setSelectedFile(file);
        onFileSelect(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        handleFileChange(file);
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

        const file = e.dataTransfer.files?.[0] || null;
        handleFileChange(file);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFileError('');
        onFileSelect(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const displayError = error || fileError;

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div
                className={`
                    relative border-2 border-dashed rounded-lg p-6
                    transition-colors
                    ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                    ${displayError ? 'border-red-300 bg-red-50' : ''}
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
                    type="file"
                    accept={accept}
                    onChange={handleInputChange}
                    disabled={disabled}
                    className="hidden"
                />

                {!selectedFile ? (
                    <div className="text-center">
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium text-blue-600">
                                Haz clic para seleccionar
                            </span>{' '}
                            o arrastra un archivo
                        </p>
                        <p className="text-xs text-gray-500">
                            Solo archivos PDF (máx. {maxSizeMB}MB)
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <File className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile();
                            }}
                            disabled={disabled}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                )}
            </div>

            {displayError && (
                <div className="mt-2 flex items-start gap-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{displayError}</span>
                </div>
            )}

            {helperText && !displayError && (
                <p className="mt-2 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
};

export default FileUpload;
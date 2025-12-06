// src/lib/api/documents.ts
import apiClient, { handleApiError } from '../api-client';
import { Document } from '@/types';

const DOCUMENTS_ENDPOINT = '/documentos';

/**
 * Subir un nuevo documento
 * POST /api/documentos/upload
 * Acceso: ADMIN, RESP
 */
export const uploadDocument = async (formData: FormData): Promise<Document> => {
    try {
        const response = await apiClient.post<Document>(
            `${DOCUMENTS_ENDPOINT}/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener todos los documentos con filtros opcionales
 */
export const getDocuments = async (params?: {
    search?: string;
    id_tipo?: string;
    page?: number;
    limit?: number;
}): Promise<Document[]> => {
    try {
        const response = await apiClient.get<Document[]>(
            DOCUMENTS_ENDPOINT,
            { params }
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener un documento por ID (UUID)
 */
export const getDocumentById = async (id: string): Promise<Document> => {
    try {
        const response = await apiClient.get<Document>(`${DOCUMENTS_ENDPOINT}/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Crear nueva versión de un documento existente
 * POST /api/documentos/:id/version
 */
export const createDocumentVersion = async (
    id: string,
    formData: FormData
): Promise<Document> => {
    try {
        const response = await apiClient.post<Document>(
            `${DOCUMENTS_ENDPOINT}/${id}/version`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener URL de descarga de un documento
 * GET /api/documentos/:id/download
 */
export const getDocumentDownloadUrl = async (id: string): Promise<{ url: string; expires_in: number }> => {
    try {
        const response = await apiClient.get<{ url: string; expires_in: number }>(
            `${DOCUMENTS_ENDPOINT}/${id}/download`
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Descargar un documento directamente como Blob
 */
export const downloadDocument = async (id: string): Promise<Blob> => {
    try {
        // Primero obtener la URL pre-firmada
        const { url } = await getDocumentDownloadUrl(id);

        // Luego descargar desde la URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al descargar el documento');
        }
        return await response.blob();
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Eliminar un documento
 * DELETE /api/documentos/:id
 * Solo para desarrollo/testing
 */
export const deleteDocument = async (id: string): Promise<{ message: string }> => {
    try {
        const response = await apiClient.delete<{ message: string }>(
            `${DOCUMENTS_ENDPOINT}/${id}`
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener contenido del documento a través del proxy del backend
 * Esto evita problemas de CORS con Cloudflare R2
 */
export const getDocumentContentUrl = (documentId: string): string => {
    // Retorna la URL completa del endpoint que sirve como proxy
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}${DOCUMENTS_ENDPOINT}/${documentId}/content`;
};

/**
 * Cargar documento como Blob para react-pdf a través del proxy
 */
export const getDocumentBlob = async (documentId: string): Promise<Blob> => {
    try {
        const response = await apiClient.get(
            `${DOCUMENTS_ENDPOINT}/${documentId}/content`,
            {
                responseType: 'blob',
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener estadísticas de documentos
 * GET /api/documentos/statistics
 * Solo ADMIN
 */
export const getDocumentsStatistics = async (): Promise<any> => {
    try {
        const response = await apiClient.get(`${DOCUMENTS_ENDPOINT}/statistics`);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Subir múltiples documentos en lote
 * POST /api/documentos/upload-batch
 */
export const uploadDocumentsBatch = async (
    archivos: File[],
    idTipoDocumento: string
): Promise<Document[]> => {
    try {
        const formData = new FormData();

        archivos.forEach((archivo) => {
            formData.append('archivos', archivo);
        });

        formData.append('id_tipo_documento', idTipoDocumento);

        const response = await apiClient.post<Document[]>(
            `${DOCUMENTS_ENDPOINT}/upload-batch`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

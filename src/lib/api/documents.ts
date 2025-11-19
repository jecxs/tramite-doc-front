import apiClient, { handleApiError } from '../api-client';
import { Document, PaginatedResponse } from '@/types';

const DOCUMENTS_ENDPOINT = '/documentos';

/**
 * Obtener todos los documentos con paginación
 */
export const getDocuments = async (params?: {
    page?: number;
    limit?: number;
}): Promise<PaginatedResponse<Document>> => {
    try {
        const response = await apiClient.get<PaginatedResponse<Document>>(
            DOCUMENTS_ENDPOINT,
            { params }
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener un documento por ID
 */
export const getDocumentById = async (id: number): Promise<Document> => {
    try {
        const response = await apiClient.get<Document>(`${DOCUMENTS_ENDPOINT}/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Crear un nuevo documento con archivo
 * Este endpoint se usa cuando se crea un documento independiente
 */
export const createDocument = async (
    titulo_documento: string,
    descripcion_documento: string | undefined,
    id_tipo_documento: number,
    file: File
): Promise<Document> => {
    try {
        const formData = new FormData();
        formData.append('titulo_documento', titulo_documento);
        if (descripcion_documento) {
            formData.append('descripcion_documento', descripcion_documento);
        }
        formData.append('id_tipo_documento', id_tipo_documento.toString());
        formData.append('file', file);

        const response = await apiClient.post<Document>(
            DOCUMENTS_ENDPOINT,
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
 * Actualizar un documento (crear nueva versión)
 */
export const updateDocument = async (
    id: number,
    titulo_documento?: string,
    descripcion_documento?: string,
    id_tipo_documento?: number,
    file?: File
): Promise<Document> => {
    try {
        const formData = new FormData();

        if (titulo_documento) {
            formData.append('titulo_documento', titulo_documento);
        }
        if (descripcion_documento) {
            formData.append('descripcion_documento', descripcion_documento);
        }
        if (id_tipo_documento) {
            formData.append('id_tipo_documento', id_tipo_documento.toString());
        }
        if (file) {
            formData.append('file', file);
        }

        const response = await apiClient.patch<Document>(
            `${DOCUMENTS_ENDPOINT}/${id}`,
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
 * Eliminar un documento
 */
export const deleteDocument = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`${DOCUMENTS_ENDPOINT}/${id}`);
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Descargar un documento
 */
export const downloadDocument = async (id: number): Promise<Blob> => {
    try {
        const response = await apiClient.get(
            `${DOCUMENTS_ENDPOINT}/${id}/download`,
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
 * Obtener todas las versiones de un documento
 */
export const getDocumentVersions = async (id: number): Promise<Document[]> => {
    try {
        const response = await apiClient.get<Document[]>(
            `${DOCUMENTS_ENDPOINT}/${id}/versiones`
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
    return `${DOCUMENTS_ENDPOINT}/${documentId}/content`;
};

/**
 * Cargar documento como Blob para react-pdf
 */
export const getDocumentBlob = async (documentId: string): Promise<Blob> => {
    try {
        const response = await apiClient.get(
            `/documentos/${documentId}/content`,
            {
                responseType: 'blob',
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};
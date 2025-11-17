import apiClient, { handleApiError } from '../api-client';
import {
    DocumentType,
    CreateDocumentTypeDto,
    UpdateDocumentTypeDto,
    PaginatedResponse,
} from '@/types';

const DOCUMENT_TYPES_ENDPOINT = '/tipo-documento';

/**
 * Obtener todos los tipos de documento
 */
export const getDocumentTypes = async (): Promise<DocumentType[]> => {
    try {
        const response = await apiClient.get<DocumentType[]>(DOCUMENT_TYPES_ENDPOINT);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener un tipo de documento por ID
 */
export const getDocumentTypeById = async (id: number): Promise<DocumentType> => {
    try {
        const response = await apiClient.get<DocumentType>(`${DOCUMENT_TYPES_ENDPOINT}/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Crear un nuevo tipo de documento (solo ADMIN)
 */
export const createDocumentType = async (data: CreateDocumentTypeDto): Promise<DocumentType> => {
    try {
        const response = await apiClient.post<DocumentType>(DOCUMENT_TYPES_ENDPOINT, data);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Actualizar un tipo de documento (solo ADMIN)
 */
export const updateDocumentType = async (
    id: number,
    data: UpdateDocumentTypeDto
): Promise<DocumentType> => {
    try {
        const response = await apiClient.patch<DocumentType>(
            `${DOCUMENT_TYPES_ENDPOINT}/${id}`,
            data
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Eliminar un tipo de documento (solo ADMIN)
 */
export const deleteDocumentType = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`${DOCUMENT_TYPES_ENDPOINT}/${id}`);
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};
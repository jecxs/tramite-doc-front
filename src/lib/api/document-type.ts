// src/lib/api/document-type.ts
import apiClient, { handleApiError } from '../api-client';
import {
  DocumentType,
  CreateDocumentTypeDto,
  UpdateDocumentTypeDto,
  EstadisticasTiposDocumentos,
} from '@/types';

const DOCUMENT_TYPES_ENDPOINT = '/tipo-documento';

export const getDocumentTypes = async (): Promise<DocumentType[]> => {
  try {
    const response = await apiClient.get<DocumentType[]>(DOCUMENT_TYPES_ENDPOINT);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getDocumentTypeById = async (id: string): Promise<DocumentType> => {
  try {
    const response = await apiClient.get<DocumentType>(`${DOCUMENT_TYPES_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getDocumentTypeByCodigo = async (codigo: string): Promise<DocumentType> => {
  try {
    const response = await apiClient.get<DocumentType>(
      `${DOCUMENT_TYPES_ENDPOINT}/codigo/${codigo}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getDocumentTypesRequireFirma = async (): Promise<DocumentType[]> => {
  try {
    const response = await apiClient.get<DocumentType[]>(
      `${DOCUMENT_TYPES_ENDPOINT}/requiere-firma`,
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getDocumentTypesRequireRespuesta = async (): Promise<DocumentType[]> => {
  try {
    const response = await apiClient.get<DocumentType[]>(
      `${DOCUMENT_TYPES_ENDPOINT}/requiere-respuesta`,
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const createDocumentType = async (data: CreateDocumentTypeDto): Promise<DocumentType> => {
  try {
    const response = await apiClient.post<DocumentType>(DOCUMENT_TYPES_ENDPOINT, data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const updateDocumentType = async (
  id: string,
  data: UpdateDocumentTypeDto,
): Promise<DocumentType> => {
  try {
    const response = await apiClient.patch<DocumentType>(`${DOCUMENT_TYPES_ENDPOINT}/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const deleteDocumentType = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`${DOCUMENT_TYPES_ENDPOINT}/${id}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getDocumentTypeStatistics = async (): Promise<EstadisticasTiposDocumentos> => {
  try {
    const response = await apiClient.get<EstadisticasTiposDocumentos>(
      `${DOCUMENT_TYPES_ENDPOINT}/statistics`,
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

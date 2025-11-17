import apiClient, { handleApiError } from '../api-client';
import {
    Procedure,
    CreateProcedureDto,
    UpdateProcedureStateDto,
    PaginatedResponse,
    ProcedureFilters,
} from '@/types';

const PROCEDURES_ENDPOINT = '/tramites';

/**
 * Obtener todos los trámites con filtros opcionales
 */
export const getProcedures = async (
    filters?: ProcedureFilters
): Promise<PaginatedResponse<Procedure>> => {
    try {
        const response = await apiClient.get<PaginatedResponse<Procedure>>(
            PROCEDURES_ENDPOINT,
            {
                params: filters,
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener un trámite por ID
 */
export const getProcedureById = async (id: string): Promise<Procedure> => {
    try {
        const response = await apiClient.get<Procedure>(`${PROCEDURES_ENDPOINT}/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Crear un nuevo trámite (enviar documento)
 */
export const createProcedure = async (data: CreateProcedureDto): Promise<Procedure> => {
    try {
        const response = await apiClient.post<Procedure>(PROCEDURES_ENDPOINT, data);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Marcar trámite como abierto (solo TRAB)
 */
export const markProcedureAsOpened = async (id: string): Promise<Procedure> => {
    try {
        const response = await apiClient.patch<Procedure>(
            `${PROCEDURES_ENDPOINT}/${id}/abrir`
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Marcar trámite como leído (solo TRAB)
 */
export const markProcedureAsRead = async (id: string): Promise<Procedure> => {
    try {
        const response = await apiClient.patch<Procedure>(
            `${PROCEDURES_ENDPOINT}/${id}/leer`
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Actualizar el estado de un trámite
 */
export const updateProcedureState = async (
    id: string,
    data: UpdateProcedureStateDto
): Promise<Procedure> => {
    try {
        const response = await apiClient.patch<Procedure>(
            `${PROCEDURES_ENDPOINT}/${id}/estado`,
            data
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Reenviar trámite con documento corregido (solo RESP)
 */
export const resendProcedure = async (
    id: string,
    formData: FormData
): Promise<Procedure> => {
    try {
        const response = await apiClient.post<Procedure>(
            `${PROCEDURES_ENDPOINT}/${id}/reenviar`,
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
 * Obtener historial de un trámite
 */
export const getProcedureHistory = async (id: string): Promise<any[]> => {
    try {
        const response = await apiClient.get<any[]>(
            `${PROCEDURES_ENDPOINT}/${id}/historial`
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener estadísticas de trámites (solo ADMIN)
 */
export const getProcedureStats = async (): Promise<any> => {
    try {
        const response = await apiClient.get(`${PROCEDURES_ENDPOINT}/stats`);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Descargar documento de un trámite
 */
export const downloadProcedureDocument = async (procedureId: string): Promise<Blob> => {
    try {
        const response = await apiClient.get(
            `${PROCEDURES_ENDPOINT}/${procedureId}/documento/download`,
            {
                responseType: 'blob',
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};
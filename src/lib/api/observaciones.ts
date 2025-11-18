// src/lib/api/observaciones.ts
import apiClient, { handleApiError } from '../api-client';
import { Observation, CreateObservationDto, ResponderObservacionDto } from '@/types';

const OBSERVACIONES_ENDPOINT = '/observaciones';

/**
 * Crear una observación en un trámite (solo TRAB)
 */
export const createObservation = async (
    idTramite: string,
    data: CreateObservationDto
): Promise<Observation> => {
    try {
        const response = await apiClient.post<Observation>(
            `${OBSERVACIONES_ENDPOINT}/tramite/${idTramite}`,
            data
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Listar observaciones de un trámite específico
 */
export const getObservationsByProcedure = async (
    idTramite: string
): Promise<Observation[]> => {
    try {
        const response = await apiClient.get<Observation[]>(
            `${OBSERVACIONES_ENDPOINT}/tramite/${idTramite}`
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Listar observaciones pendientes (sin resolver)
 */
export const getPendingObservations = async (): Promise<Observation[]> => {
    try {
        const response = await apiClient.get<Observation[]>(
            `${OBSERVACIONES_ENDPOINT}/pendientes`
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener estadísticas de observaciones
 */
export const getObservationsStats = async (): Promise<any> => {
    try {
        const response = await apiClient.get(`${OBSERVACIONES_ENDPOINT}/statistics`);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener una observación por ID
 */
export const getObservationById = async (id: string): Promise<Observation> => {
    try {
        const response = await apiClient.get<Observation>(
            `${OBSERVACIONES_ENDPOINT}/${id}`
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Responder/resolver una observación (solo RESP)
 */
export const resolveObservation = async (
    id: string,
    data: ResponderObservacionDto
): Promise<Observation> => {
    try {
        const response = await apiClient.patch<Observation>(
            `${OBSERVACIONES_ENDPOINT}/${id}/responder`,
            data
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};
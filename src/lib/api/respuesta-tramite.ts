// src/lib/api/respuesta-tramite.ts
import apiClient, { handleApiError } from '../api-client';
import {
    RespuestaTramite,
    CreateRespuestaTramiteDto,
    EstadisticasRespuestas,
} from '@/types';

const RESPUESTA_TRAMITE_ENDPOINT = '/respuesta-tramite';

/**
 * Crear respuesta de conformidad para un trámite
 */
export const crearRespuestaTramite = async (
    idTramite: string,
    data: CreateRespuestaTramiteDto
): Promise<{ respuesta: RespuestaTramite; tramiteActualizado: any }> => {
    try {
        const response = await apiClient.post(
            `${RESPUESTA_TRAMITE_ENDPOINT}/${idTramite}`,
            data
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener respuesta de un trámite
 */
export const obtenerRespuestaTramite = async (
    idTramite: string
): Promise<RespuestaTramite> => {
    try {
        const response = await apiClient.get<RespuestaTramite>(
            `${RESPUESTA_TRAMITE_ENDPOINT}/${idTramite}`
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener estadísticas de respuestas
 */
export const obtenerEstadisticasRespuestas = async (filtros?: {
    id_remitente?: string;
    id_area?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
}): Promise<EstadisticasRespuestas> => {
    try {
        const response = await apiClient.get<EstadisticasRespuestas>(
            `${RESPUESTA_TRAMITE_ENDPOINT}/estadisticas/general`,
            { params: filtros }
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};
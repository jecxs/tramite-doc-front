import apiClient, { handleApiError } from '../api-client';
import {
    EstadisticasGenerales,
    EstadisticasPorPeriodo,
    EstadisticasPorTrabajador,
    TiemposRespuesta,
    EstadisticasTiposDocumentos,
    RankingEficiencia,
    EstadisticasObservaciones,
    ActividadReciente,
} from '@/types';

const ESTADISTICAS_ENDPOINT = '/estadisticas/responsable';

/**
 * Obtener estadísticas generales
 */
export const getEstadisticasGenerales = async (): Promise<EstadisticasGenerales> => {
    try {
        const response = await apiClient.get<EstadisticasGenerales>(
            `${ESTADISTICAS_ENDPOINT}/general`
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener estadísticas por período
 */
export const getEstadisticasPorPeriodo = async (
    periodo: 'semana' | 'mes' | 'trimestre' | 'anio' = 'mes'
): Promise<EstadisticasPorPeriodo> => {
    try {
        const response = await apiClient.get<EstadisticasPorPeriodo>(
            `${ESTADISTICAS_ENDPOINT}/por-periodo`,
            { params: { periodo } }
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener estadísticas por trabajador
 */
export const getEstadisticasPorTrabajador = async (): Promise<EstadisticasPorTrabajador> => {
    try {
        const response = await apiClient.get<EstadisticasPorTrabajador>(
            `${ESTADISTICAS_ENDPOINT}/por-trabajador`
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener tiempos de respuesta
 */
export const getTiemposRespuesta = async (): Promise<TiemposRespuesta> => {
    try {
        const response = await apiClient.get<TiemposRespuesta>(
            `${ESTADISTICAS_ENDPOINT}/tiempos-respuesta`
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener estadísticas de tipos de documentos
 */
export const getEstadisticasTiposDocumentos = async (): Promise<EstadisticasTiposDocumentos> => {
    try {
        const response = await apiClient.get<EstadisticasTiposDocumentos>(
            `${ESTADISTICAS_ENDPOINT}/tipos-documentos`
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener ranking de eficiencia
 */
export const getRankingEficiencia = async (): Promise<RankingEficiencia> => {
    try {
        const response = await apiClient.get<RankingEficiencia>(
            `${ESTADISTICAS_ENDPOINT}/ranking-eficiencia`
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener estadísticas de observaciones
 */
export const getEstadisticasObservaciones = async (): Promise<EstadisticasObservaciones> => {
    try {
        const response = await apiClient.get<EstadisticasObservaciones>(
            `${ESTADISTICAS_ENDPOINT}/observaciones`
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener actividad reciente
 */
export const getActividadReciente = async (): Promise<ActividadReciente> => {
    try {
        const response = await apiClient.get<ActividadReciente>(
            `${ESTADISTICAS_ENDPOINT}/actividad-reciente`
        );
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};
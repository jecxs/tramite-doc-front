// src/lib/api/tramites-auto.ts
import apiClient, { handleApiError } from '../api-client';
import {
    DeteccionResultado,
    CreateTramiteAutoLoteDto,
} from '@/types';

const TRAMITES_ENDPOINT = '/tramites';

/**
 * PASO 1: Detectar destinatarios automáticamente (PREVIEW)
 * POST /api/tramites/auto-lote/detectar
 */
export const detectarDestinatarios = async (
    archivos: File[],
    idTipoDocumento: string
): Promise<DeteccionResultado> => {
    try {
        const formData = new FormData();

        // Agregar todos los archivos
        archivos.forEach((archivo) => {
            formData.append('archivos', archivo);
        });

        // Agregar el tipo de documento
        formData.append('id_tipo_documento', idTipoDocumento);

        const response = await apiClient.post<DeteccionResultado>(
            `${TRAMITES_ENDPOINT}/auto-lote/detectar`,
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
 * PASO 2: Crear trámites automáticos en lote (CONFIRMACIÓN)
 * POST /api/tramites/auto-lote
 */
export const crearTramitesAutoLote = async (
    data: CreateTramiteAutoLoteDto
): Promise<{ mensaje: string; total: number; tramites: any[] }> => {
    try {
        const response = await apiClient.post(
            `${TRAMITES_ENDPOINT}/auto-lote`,
            data
        );

        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Generar mensaje predeterminado según tipo de documento
 * GET /api/tramites/auto-lote/template/:codigoTipo
 */
export const generarMensajePredeterminado = async (
    codigoTipo: string,
    nombreTrabajador: string
): Promise<{ asunto: string; mensaje: string }> => {
    try {
        const response = await apiClient.get(
            `${TRAMITES_ENDPOINT}/auto-lote/template/${codigoTipo}`,
            {
                params: { nombreTrabajador },
            }
        );

        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};
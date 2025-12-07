// src/lib/api/firma-electronica.ts
import apiClient, { handleApiError } from '../api-client';
import { ElectronicSignature } from '@/types';

const FIRMA_ENDPOINT = '/firma-electronica';

/**
 * PASO 1: Solicitar código de verificación por email
 */
export const solicitarCodigoVerificacion = async (
  idTramite: string,
): Promise<{
  mensaje: string;
  expira_en: string;
  email_enviado_a: string;
}> => {
  try {
    const response = await apiClient.post(
      `${FIRMA_ENDPOINT}/tramite/${idTramite}/solicitar-codigo`,
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * PASO 2: Verificar código y firmar documento
 */
export const verificarYFirmar = async (
  idTramite: string,
  data: {
    codigo: string;
    acepta_terminos: boolean;
  },
): Promise<{ firma: ElectronicSignature; tramite: any }> => {
  try {
    const response = await apiClient.post<{ firma: ElectronicSignature; tramite: any }>(
      `${FIRMA_ENDPOINT}/tramite/${idTramite}/verificar-y-firmar`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Obtener firma electrónica de un trámite
 */
export const getFirmaByTramite = async (idTramite: string): Promise<ElectronicSignature> => {
  try {
    const response = await apiClient.get<ElectronicSignature>(
      `${FIRMA_ENDPOINT}/tramite/${idTramite}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Verificar firma de un trámite
 */
export const verificarFirma = async (idTramite: string): Promise<any> => {
  try {
    const response = await apiClient.get<any>(`${FIRMA_ENDPOINT}/tramite/${idTramite}/verificar`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Obtener estadísticas de firmas electrónicas (solo ADMIN)
 */
export const getEstadisticasFirmas = async (): Promise<any> => {
  try {
    const response = await apiClient.get(`${FIRMA_ENDPOINT}/estadisticas`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

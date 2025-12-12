import apiClient, { handleApiError } from '../api-client';
import { ReportePersonalizado, FiltrosReporte } from '@/types';

const REPORTES_ENDPOINT = '/reportes/responsable';

/**
 * Generar reporte personalizado con filtros
 */
export const generarReportePersonalizado = async (
  filtros: FiltrosReporte,
): Promise<ReportePersonalizado> => {
  try {
    const response = await apiClient.get<ReportePersonalizado>(
      `${REPORTES_ENDPOINT}/personalizado`,
      { params: filtros },
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

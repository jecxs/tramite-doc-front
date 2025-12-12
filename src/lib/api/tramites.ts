import apiClient, { handleApiError } from '../api-client';
import {
  Procedure,
  CreateProcedureDto,
  UpdateProcedureStateDto,
  PaginatedResponse,
  ProcedureFilters,
  ProcedureStats,
  Observation,
  ElectronicSignature,
  DeteccionDestinatarioDto,
  CreateTramiteAutoLoteDto,
  AnularTramiteDto,
} from '@/types';

const PROCEDURES_ENDPOINT = '/tramites';

/**
 * Helper para limpiar parámetros vacíos antes de enviarlos al backend
 * Evita enviar strings vacíos que pueden causar errores de validación
 */
const cleanParams = (params: ProcedureFilters): Partial<ProcedureFilters> => {
  const cleaned: Record<string, unknown> = {};

  // Iteramos sobre las entradas del objeto de filtros
  (Object.entries(params) as Array<[keyof ProcedureFilters, unknown]>).forEach(([key, value]) => {
    // Solo incluir el parámetro si tiene un valor válido
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      !(Array.isArray(value) && value.length === 0)
    ) {
      cleaned[key] = value;
    }
  });

  return cleaned as Partial<ProcedureFilters>;
};

/**
 * Obtener todos los trámites con filtros opcionales
 * GET /api/tramites
 */
export const getProcedures = async (
  filters?: ProcedureFilters,
): Promise<PaginatedResponse<Procedure>> => {
  try {
    // Limpiar parámetros vacíos para evitar errores de validación en el backend
    const cleanedParams = filters ? cleanParams(filters) : undefined;

    const response = await apiClient.get<PaginatedResponse<Procedure>>(
      PROCEDURES_ENDPOINT,
      {
        params: cleanedParams,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Obtener un trámite por ID
 * GET /api/tramites/:id
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
 * POST /api/tramites
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
 * Crear trámites en lote automático
 * POST /api/tramites/auto-lote
 */
export const createTramitesAutoLote = async (
  data: CreateTramiteAutoLoteDto,
): Promise<{
  exitosos: number;
  fallidos: number;
  tramites: Procedure[];
}> => {
  try {
    const response = await apiClient.post<{
      exitosos: number;
      fallidos: number;
      tramites: Procedure[];
    }>(`${PROCEDURES_ENDPOINT}/auto-lote`, data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Detectar destinatarios por DNI desde nombres de archivos
 * POST /api/tramites/detectar-destinatarios
 */
export const detectarDestinatarios = async (
  dnis: string[],
): Promise<DeteccionDestinatarioDto[]> => {
  try {
    const response = await apiClient.post<DeteccionDestinatarioDto[]>(
      `${PROCEDURES_ENDPOINT}/detectar-destinatarios`,
      { dnis },
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Marcar trámite como abierto (solo TRAB)
 * PATCH /api/tramites/:id/abrir
 */
export const markProcedureAsOpened = async (id: string): Promise<Procedure> => {
  try {
    const response = await apiClient.patch<Procedure>(`${PROCEDURES_ENDPOINT}/${id}/abrir`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Marcar trámite como leído (solo TRAB)
 * PATCH /api/tramites/:id/leer
 */
export const markProcedureAsRead = async (id: string): Promise<Procedure> => {
  try {
    const response = await apiClient.patch<Procedure>(`${PROCEDURES_ENDPOINT}/${id}/leer`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Actualizar el estado de un trámite
 * PATCH /api/tramites/:id/estado
 */
export const updateProcedureState = async (
  id: string,
  data: UpdateProcedureStateDto,
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
 * POST /api/tramites/:id/reenviar
 */
export const resendProcedure = async (id: string, formData: FormData): Promise<Procedure> => {
  try {
    const response = await apiClient.post<Procedure>(
      `${PROCEDURES_ENDPOINT}/${id}/reenviar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Anular un trámite
 * POST /api/tramites/:id/anular
 */
export const anularTramite = async (
  id: string,
  data: AnularTramiteDto,
): Promise<Procedure> => {
  try {
    const response = await apiClient.post<Procedure>(
      `${PROCEDURES_ENDPOINT}/${id}/anular`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Obtener historial de un trámite
 * GET /api/tramites/:id/historial
 */
export const getProcedureHistory = async (
  id: string,
): Promise<NonNullable<Procedure['historial']>> => {
  try {
    const response = await apiClient.get<NonNullable<Procedure['historial']>>(
      `${PROCEDURES_ENDPOINT}/${id}/historial`
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Obtener observaciones de un trámite
 * GET /api/tramites/:id/observaciones
 */
export const getProcedureObservations = async (id: string): Promise<Observation[]> => {
  try {
    const response = await apiClient.get<Observation[]>(
      `${PROCEDURES_ENDPOINT}/${id}/observaciones`,
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Obtener firma electrónica de un trámite
 * GET /api/tramites/:id/firma
 */
export const getProcedureSignature = async (id: string): Promise<ElectronicSignature> => {
  try {
    const response = await apiClient.get<ElectronicSignature>(
      `${PROCEDURES_ENDPOINT}/${id}/firma`
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Obtener estadísticas de trámites (solo ADMIN)
 * GET /api/tramites/stats
 */
export const getProcedureStats = async (): Promise<ProcedureStats> => {
  try {
    const response = await apiClient.get<ProcedureStats>(`${PROCEDURES_ENDPOINT}/stats`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Descargar documento de un trámite
 * GET /api/tramites/:id/documento/download
 */
export const downloadProcedureDocument = async (procedureId: string): Promise<Blob> => {
  try {
    const response = await apiClient.get<Blob>(
      `${PROCEDURES_ENDPOINT}/${procedureId}/documento/download`,
      {
        responseType: 'blob',
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

import apiClient, { handleApiError } from '../api-client';
import { Area, CreateAreaDto, UpdateAreaDto } from '@/types';

const AREAS_ENDPOINT = '/areas';

/**
 * Obtener todas las áreas
 * GET /api/areas
 */
export const getAreas = async (includeInactive = false): Promise<Area[]> => {
  try {
    const response = await apiClient.get<Area[]>(AREAS_ENDPOINT, {
      params: { includeInactive },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Obtener un área por ID
 * GET /api/areas/:id
 */
export const getAreaById = async (id: string): Promise<Area> => {
  try {
    const response = await apiClient.get<Area>(`${AREAS_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Crear una nueva área (solo ADMIN)
 * POST /api/areas
 */
export const createArea = async (data: CreateAreaDto): Promise<Area> => {
  try {
    const response = await apiClient.post<Area>(AREAS_ENDPOINT, data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Actualizar un área (solo ADMIN)
 * PATCH /api/areas/:id
 */
export const updateArea = async (id: string, data: UpdateAreaDto): Promise<Area> => {
  try {
    const response = await apiClient.patch<Area>(`${AREAS_ENDPOINT}/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Desactivar un área (solo ADMIN)
 * DELETE /api/areas/:id/deactivate
 */
export const deactivateArea = async (id: string): Promise<Area> => {
  try {
    const response = await apiClient.delete<Area>(`${AREAS_ENDPOINT}/${id}/deactivate`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Activar un área (solo ADMIN)
 * PATCH /api/areas/:id/activate
 */
export const activateArea = async (id: string): Promise<Area> => {
  try {
    const response = await apiClient.patch<Area>(`${AREAS_ENDPOINT}/${id}/activate`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Eliminar permanentemente un área (solo desarrollo)
 * DELETE /api/areas/:id
 */
export const deleteArea = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<{ message: string }>(`${AREAS_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Obtener usuarios de un área
 * GET /api/areas/:id/users
 */
export const getAreaUsers = async (id: string): Promise<any> => {
  try {
    const response = await apiClient.get(`${AREAS_ENDPOINT}/${id}/users`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Obtener responsables de un área (usuarios con rol RESP)
 * GET /api/areas/:id/responsables
 */
export const getAreaResponsables = async (id: string): Promise<any> => {
  try {
    const response = await apiClient.get(`${AREAS_ENDPOINT}/${id}/responsables`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Obtener trabajadores de un área (usuarios con rol TRAB)
 * GET /api/areas/:id/trabajadores
 */
export const getAreaTrabajadores = async (id: string): Promise<any> => {
  try {
    const response = await apiClient.get(`${AREAS_ENDPOINT}/${id}/trabajadores`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Obtener estadísticas de áreas (solo ADMIN)
 * GET /api/areas/statistics
 */
export const getAreasStatistics = async (): Promise<any> => {
  try {
    const response = await apiClient.get(`${AREAS_ENDPOINT}/statistics`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

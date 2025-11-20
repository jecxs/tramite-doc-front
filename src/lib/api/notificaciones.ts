// src/lib/api/notificaciones.ts
import apiClient, { handleApiError } from '../api-client';
import { Notification, NotificationFilters, PaginatedResponse } from '@/types';

const NOTIFICACIONES_ENDPOINT = '/notificaciones';

/**
 * Obtener todas las notificaciones del usuario actual
 * 🔥 FIX: Simplificado para coincidir con el DTO del backend
 */
export async function getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
    try {
        const params = new URLSearchParams();

        // Solo parámetros que el backend acepta
        if (filters?.visto !== undefined) params.append('visto', String(filters.visto));
        if (filters?.tipo) params.append('tipo', filters.tipo);

        const url = `${NOTIFICACIONES_ENDPOINT}${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await apiClient.get(url);

        // 🔥 IMPORTANTE: Devolver SIEMPRE un array
        return Array.isArray(response.data) ? response.data : (response.data.data || []);
    } catch (error) {
        throw handleApiError(error);
    }
}

/**
 * Obtener notificaciones no leídas
 */
export async function getUnreadNotifications(): Promise<Notification[]> {
    try {
        const response = await apiClient.get(`${NOTIFICACIONES_ENDPOINT}/unread`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}

/**
 * Obtener contador de notificaciones no leídas
 */
export async function getUnreadCount(): Promise<{ count: number }> {
    try {
        const response = await apiClient.get(`${NOTIFICACIONES_ENDPOINT}/unread/count`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}


/**
 * Obtener estadísticas de notificaciones
 */
export async function getNotificationStatistics(): Promise<{
    total: number;
    no_leidas: number;
    leidas: number;
    por_tipo: Array<{ tipo: string; cantidad: number }>;
}> {
    try {
        const response = await apiClient.get(`${NOTIFICACIONES_ENDPOINT}/statistics`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}

/**
 * Obtener una notificación por ID
 */
export async function getNotificationById(id: string): Promise<Notification> {
    try {
        const response = await apiClient.get(`${NOTIFICACIONES_ENDPOINT}/${id}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}

/**
 * Marcar una notificación como leída
 */
export async function markNotificationAsRead(id: string): Promise<Notification> {
    try {
        const response = await apiClient.patch(`${NOTIFICACIONES_ENDPOINT}/${id}/read`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function markAllNotificationsAsRead(): Promise<{ message: string; count: number }> {
    try {
        const response = await apiClient.patch(`${NOTIFICACIONES_ENDPOINT}/read-all`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}
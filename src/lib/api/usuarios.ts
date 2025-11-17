import apiClient, { handleApiError } from '../api-client';
import {
    User,
    CreateUserDto,
    UpdateUserDto,
    PaginatedResponse,
    UserFilters,
} from '@/types';

const USERS_ENDPOINT = '/usuarios';

/**
 * Obtener todos los usuarios con filtros opcionales
 */
export const getUsers = async (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    try {
        const response = await apiClient.get<PaginatedResponse<User>>(USERS_ENDPOINT, {
            params: filters,
        });
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener un usuario por ID
 */
export const getUserById = async (id: string): Promise<User> => {
    try {
        const response = await apiClient.get<User>(`${USERS_ENDPOINT}/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Crear un nuevo usuario (solo ADMIN)
 */
export const createUser = async (data: CreateUserDto): Promise<User> => {
    try {
        const response = await apiClient.post<User>(USERS_ENDPOINT, data);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Actualizar un usuario
 */
export const updateUser = async (id: string, data: UpdateUserDto): Promise<User> => {
    try {
        const response = await apiClient.patch<User>(`${USERS_ENDPOINT}/${id}`, data);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Eliminar un usuario (soft delete)
 */
export const deleteUser = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`${USERS_ENDPOINT}/${id}`);
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Obtener trabajadores (usuarios con rol TRAB)
 */
export const getWorkers = async (): Promise<User[]> => {
    try {
        const response = await apiClient.get<User[]>(`${USERS_ENDPOINT}/rol/trabajadores`);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Cambiar contraseña del usuario
 */
export const changePassword = async (
    id: string,
    currentPassword: string,
    newPassword: string
): Promise<void> => {
    try {
        await apiClient.patch(`${USERS_ENDPOINT}/${id}/password`, {
            currentPassword,
            newPassword,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};
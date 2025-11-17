import { STORAGE_KEYS, Role, ROLES } from './constants';
import { User } from '@/types';

/**
 * Obtener el token de acceso del localStorage
 */
export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Obtener el token de refresh del localStorage
 */
export function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Obtener el usuario del localStorage
 */
export function getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;

    try {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error parsing stored user:', error);
        return null;
    }
}

/**
 * Verificar si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
    return !!getAccessToken() && !!getStoredUser();
}

/**
 * Limpiar todos los datos de autenticación
 */
export function clearAuthData(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
}

/**
 * Guardar datos de autenticación
 */
export function saveAuthData(accessToken: string, refreshToken: string, user: User): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

/**
 * Verificar si el usuario tiene un rol específico
 */
export function hasRole(user: User | null, requiredRole: Role | Role[]): boolean {
    if (!user) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.some(role => user.roles.includes(role));
}


/**
 * Verificar si el usuario es administrador
 */
export function isAdmin(user: User | null): boolean {
    return hasRole(user, ROLES.ADMIN);
}

/**
 * Verificar si el usuario es responsable de área
 */
export function isResponsible(user: User | null): boolean {
    return hasRole(user, ROLES.RESP);
}

/**
 * Verificar si el usuario es trabajador
 */
export function isWorker(user: User | null): boolean {
    return hasRole(user, ROLES.TRAB);
}

/**
 * Obtener el nombre completo del usuario
 */
export function getFullName(user: User | null): string {
    if (!user) return '';
    return `${user.nombres} ${user.apellidos}`; // ✅ Cambiar aquí también
}

/**
 * Obtener las iniciales del usuario
 */
export function getUserInitials(user: User | null): string {
    if (!user) return '';

    const firstInitial = user.nombres.charAt(0).toUpperCase();
    const lastInitial = user.apellidos.charAt(0).toUpperCase();

    return `${firstInitial}${lastInitial}`;
}

/**
 * Formatear el rol para mostrar
 */
export function formatRole(role: Role): string {
    const roleLabels: Record<Role, string> = {
        ADMIN: 'Administrador',
        RESP: 'Responsable',
        TRAB: 'Trabajador',
    };

    return roleLabels[role] || role;
}
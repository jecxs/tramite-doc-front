'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, AuthResponse, LoginDto } from '@/types';
import { STORAGE_KEYS, DEFAULT_ROUTE_BY_ROLE, ROUTE_PATHS, Role, ROLES } from '@/lib/constants';
import apiClient, { handleApiError } from '@/lib/api-client';
import { setCookie, deleteCookie } from '@/lib/cookies';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginDto) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

export function isRole(value: string): value is Role {
    return Object.values(ROLES).includes(value as Role);
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const isAuthenticated = !!user;

    // Cargar usuario desde localStorage al montar
    useEffect(() => {
        const loadUser = () => {
            try {
                const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
                const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

                if (storedUser && accessToken) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    console.log('✅ Usuario cargado desde localStorage:', parsedUser);
                }
            } catch (error) {
                console.error('❌ Error loading user from storage:', error);
                localStorage.removeItem(STORAGE_KEYS.USER);
                localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                deleteCookie('access_token');
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    // Redirigir automáticamente cuando el usuario esté autenticado
    useEffect(() => {
        if (!isLoading && user && pathname === ROUTE_PATHS.LOGIN) {
            const userRoleString = user.roles[0];

            if (isRole(userRoleString)) {
                const defaultRoute = DEFAULT_ROUTE_BY_ROLE[userRoleString];
                console.log('🔄 Redirigiendo desde login a:', defaultRoute);
                router.replace(defaultRoute);
            }
        }
    }, [user, isLoading, pathname, router]);

    // Login
    const login = useCallback(async (credentials: LoginDto) => {
        try {
            setIsLoading(true);

            console.log('🔵 Intentando login con:', { correo: credentials.correo });
            console.log('🔵 API URL:', apiClient.defaults.baseURL);

            const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

            console.log('✅ Respuesta completa del servidor:', response.data);

            const { access_token, user: userData } = response.data;

            // Validar que userData tenga roles
            if (!userData.roles || !Array.isArray(userData.roles) || userData.roles.length === 0) {
                throw new Error('Usuario sin roles asignados');
            }

            // Guardar token en localStorage Y cookies
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

            // 🔥 Guardar en cookies para el middleware
            setCookie('access_token', access_token, 7); // 7 días

            console.log('✅ Token guardado en localStorage y cookies');
            console.log('✅ Usuario guardado:', userData);
            console.log('✅ Roles:', userData.roles);

            const userRoleString = userData.roles[0];

            if (!isRole(userRoleString)) {
                console.error("❌ Rol inválido:", userRoleString);
                throw new Error(`Rol inválido recibido del servidor: ${userRoleString}`);
            }

            // Actualizar state
            setUser(userData);

            // Pequeño delay para asegurar que las cookies se guarden
            await new Promise(resolve => setTimeout(resolve, 100));

            // Redirigir según el rol
            const defaultRoute = DEFAULT_ROUTE_BY_ROLE[userRoleString];
            console.log('🔄 Redirigiendo después del login a:', defaultRoute);

            // Usar window.location para forzar recarga completa y que el middleware procese
            window.location.href = defaultRoute;

        } catch (error) {
            console.error('❌ Error en login:', error);
            const errorMessage = handleApiError(error);
            console.error('❌ Mensaje de error:', errorMessage);

            // Limpiar estado en caso de error
            setUser(null);
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            deleteCookie('access_token');

            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    // Logout
    const logout = useCallback(() => {
        console.log('🔵 Cerrando sesión...');

        // Limpiar storage y cookies
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        deleteCookie('access_token');

        setUser(null);

        // Redirigir a login
        window.location.href = ROUTE_PATHS.LOGIN;
    }, []);

    // Refrescar información del usuario
    const refreshUser = useCallback(async () => {
        try {
            const response = await apiClient.get<User>('/auth/profile');
            const userData = response.data;

            // Actualizar usuario en storage y state
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error('❌ Error refreshing user:', error);
            logout();
        }
    }, [logout]);

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

export function useRole() {
    const { user } = useAuth();

    const hasRole = useCallback(
        (requiredRole: string | string[]) => {
            if (!user) return false;

            const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
            return roles.some(role => user.roles.includes(role));
        },
        [user]
    );

    const primaryRole = user?.roles[0];

    const isAdmin = primaryRole === ROLES.ADMIN;
    const isResponsible = primaryRole === ROLES.RESP;
    const isWorker = primaryRole === ROLES.TRAB;

    return {
        hasRole,
        isAdmin,
        isResponsible,
        isWorker,
        currentRole: primaryRole,
    };
}
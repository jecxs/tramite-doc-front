// src/hooks/useTramites.ts
import { useState, useEffect, useCallback } from 'react';
import { getProcedures } from '@/lib/api/tramites';
import { Procedure, ProcedureFilters, PaginatedResponse, PaginationMetadata } from '@/types';
import { handleApiError } from '@/lib/api-client';

interface UseTramitesReturn {
    tramites: Procedure[];
    isLoading: boolean;
    error: string | null;
    paginacion?: PaginationMetadata;
    refetch: () => Promise<void>;
    applyFilters: (filters: ProcedureFilters) => void;
    clearFilters: () => void;
    currentFilters: ProcedureFilters;
    // Helpers para paginación
    goToPage: (page: number) => void;
    changeLimit: (limit: number) => void;
}

export function useTramites(initialFilters?: ProcedureFilters): UseTramitesReturn {
    const [tramites, setTramites] = useState<Procedure[]>([]);
    const [paginacion, setPaginacion] = useState<PaginationMetadata>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<ProcedureFilters>({
        pagina: 1,
        limite: 20,
        ordenar_por: 'fecha_envio',
        orden: 'desc',
        ...initialFilters,
    });

    const fetchTramites = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // ✅ Ahora getProcedures retorna PaginatedResponse
            const response: PaginatedResponse<Procedure> = await getProcedures(filters);

            setTramites(response.data);
            setPaginacion(response.paginacion);
        } catch (err) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            console.error('Error fetching tramites:', err);
            setTramites([]);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchTramites();
    }, [fetchTramites]);

    const applyFilters = useCallback((newFilters: ProcedureFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters,
            pagina: 1, // Reset a página 1 cuando se aplican filtros
        }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            pagina: 1,
            limite: 20,
            ordenar_por: 'fecha_envio',
            orden: 'desc',
        });
    }, []);

    const goToPage = useCallback((page: number) => {
        setFilters(prev => ({ ...prev, pagina: page }));
    }, []);

    const changeLimit = useCallback((limit: number) => {
        setFilters(prev => ({
            ...prev,
            limite: limit,
            pagina: 1, // Reset a página 1 al cambiar el límite
        }));
    }, []);

    return {
        tramites,
        isLoading,
        error,
        paginacion,
        refetch: fetchTramites,
        applyFilters,
        clearFilters,
        currentFilters: filters,
        goToPage,
        changeLimit,
    };
}
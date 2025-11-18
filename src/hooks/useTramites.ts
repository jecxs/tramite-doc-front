// src/hooks/useTramites.ts
import { useState, useEffect, useCallback } from 'react';
import { getProcedures } from '@/lib/api/tramites';
import { Procedure, ProcedureFilters } from '@/types';
import { handleApiError } from '@/lib/api-client';

interface UseTramitesReturn {
    tramites: Procedure[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    applyFilters: (filters: ProcedureFilters) => void;
}

export function useTramites(initialFilters?: ProcedureFilters): UseTramitesReturn {
    const [tramites, setTramites] = useState<Procedure[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<ProcedureFilters>(initialFilters || {});

    const fetchTramites = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getProcedures(filters);
            setTramites(data);
        } catch (err) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            console.error('Error fetching tramites:', err);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchTramites();
    }, [fetchTramites]);

    const applyFilters = useCallback((newFilters: ProcedureFilters) => {
        setFilters(newFilters);
    }, []);

    return {
        tramites,
        isLoading,
        error,
        refetch: fetchTramites,
        applyFilters,
    };
}
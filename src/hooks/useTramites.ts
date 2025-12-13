// src/hooks/useTramites.ts
import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Ref para evitar fetch en el primer render si no es necesario
  const isFirstRender = useRef(true);
  const previousFiltersRef = useRef<string>('');

  const fetchTramites = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

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
    // Serializar filtros para comparación profunda
    const currentFiltersString = JSON.stringify(filters);

    // Solo hacer fetch si los filtros realmente cambiaron
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousFiltersRef.current = currentFiltersString;
      fetchTramites();
    } else if (previousFiltersRef.current !== currentFiltersString) {
      previousFiltersRef.current = currentFiltersString;
      fetchTramites();
    }
  }, [filters, fetchTramites]);

  const applyFilters = useCallback((newFilters: ProcedureFilters) => {
    setFilters((prev) => {
      // Merge inteligente: mantener filtros existentes y agregar/sobrescribir nuevos
      const merged = { ...prev, ...newFilters };

      // Si se están aplicando filtros nuevos (no solo búsqueda), resetear página
      const hasNonSearchFilters = Object.keys(newFilters).some(
        key => key !== 'search' && key !== 'pagina' && key !== 'limite'
      );

      if (hasNonSearchFilters) {
        merged.pagina = 1;
      }

      return merged;
    });
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
    setFilters((prev) => ({ ...prev, pagina: page }));
  }, []);

  const changeLimit = useCallback((limit: number) => {
    setFilters((prev) => ({
      ...prev,
      limite: limit,
      pagina: 1,
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

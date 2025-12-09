// src/hooks/useWorkerStats.ts
import { useState, useEffect } from 'react';
import { getProcedures } from '@/lib/api/tramites';
import { getPendingObservations } from '@/lib/api/observaciones';
import { Procedure } from '@/types';
import { PROCEDURE_STATES } from '@/lib/constants';

interface WorkerStats {
  total_recibidos: number;
  sin_leer: number;
  para_firmar: number;
  firmados: number;
  observaciones_pendientes: number;
}

interface UseWorkerStatsReturn {
  stats: WorkerStats;
  recentProcedures: Procedure[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWorkerStats(): UseWorkerStatsReturn {
  const [stats, setStats] = useState<WorkerStats>({
    total_recibidos: 0,
    sin_leer: 0,
    para_firmar: 0,
    firmados: 0,
    observaciones_pendientes: 0,
  });
  const [recentProcedures, setRecentProcedures] = useState<Procedure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener todos los trámites del trabajador (últimos 20)
      const { data: allProcedures } = await getProcedures({
        pagina: 1,
        limite: 20,
        ordenar_por: 'fecha_envio',
        orden: 'desc',
      });

      // Calcular estadísticas
      const total = allProcedures.length;
      const sinLeer = allProcedures.filter((p) => p.estado === PROCEDURE_STATES.ENVIADO).length;
      const paraFirmar = allProcedures.filter(
        (p) => p.requiere_firma && p.estado === PROCEDURE_STATES.LEIDO,
      ).length;
      const firmados = allProcedures.filter((p) => p.estado === PROCEDURE_STATES.FIRMADO).length;

      // Obtener observaciones pendientes
      const observacionesPendientes = await getPendingObservations();

      setStats({
        total_recibidos: total,
        sin_leer: sinLeer,
        para_firmar: paraFirmar,
        firmados: firmados,
        observaciones_pendientes: observacionesPendientes.length,
      });

      // Solo mostrar los 5 más recientes
      setRecentProcedures(allProcedures.slice(0, 5));
    } catch (err) {
      setError('Error al cargar las estadísticas');
      console.error('Error fetching worker stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    recentProcedures,
    isLoading,
    error,
    refetch: fetchStats,
  };
}

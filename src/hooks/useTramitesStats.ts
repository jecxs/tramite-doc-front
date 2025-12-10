import { useMemo } from 'react';
import { PROCEDURE_STATES } from '@/lib/constants';
import { Procedure} from '@/types'

export interface TramiteStats {
  total: number;
  pendientes: number;
  firmados: number;
  conObservaciones: number;
  totalRequiereFirma: number;
  totalRequiereRespuesta: number;
  sinAccionPendiente: number;
}

export function useTramitesStats(tramites: Procedure[], isLoading: boolean): TramiteStats {
  return useMemo(() => {
    if (isLoading || tramites.length === 0) {
      return {
        total: 0,
        pendientes: 0,
        firmados: 0,
        conObservaciones: 0,
        totalRequiereFirma: 0,
        totalRequiereRespuesta: 0,
        sinAccionPendiente: 0,
      };
    }

    const totalRequiereFirma = tramites.filter((t) => t.requiere_firma).length;
    const totalRequiereRespuesta = tramites.filter((t) => t.requiere_respuesta).length;
    const estadosPendientes: PROCEDURE_STATES[] = [
      PROCEDURE_STATES.ENVIADO,
      PROCEDURE_STATES.ABIERTO,
      PROCEDURE_STATES.LEIDO,
    ];

    const pendientes = tramites.filter((t) => estadosPendientes.includes(t.estado)).length;

    const firmados = tramites.filter((t) => t.estado === PROCEDURE_STATES.FIRMADO).length;
    const conObservaciones = tramites.filter((t) => (t.observaciones_count || 0) > 0).length;

    const sinAccionPendiente = tramites.filter(
      (t) => !t.requiere_firma && !t.requiere_respuesta
    ).length;

    return {
      total: tramites.length,
      pendientes,
      firmados,
      conObservaciones,
      totalRequiereFirma,
      totalRequiereRespuesta,
      sinAccionPendiente,
    };
  }, [tramites, isLoading]);
}

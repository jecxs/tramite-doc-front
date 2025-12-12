// Tipos adicionales para el módulo de reportes mejorado

import { Procedure } from '@/types';

/**
 * Análisis detallado de trabajadores con problemas específicos
 */
export interface AnalisisDetalladoTrabajadores {
  trabajadoresSinAbrir: TrabajadorConProblema[];
  trabajadoresSinLeer: TrabajadorConProblema[];
  trabajadoresSinFirmar: TrabajadorConProblema[];
  trabajadoresSinResponder: TrabajadorConProblema[];
  tramitesAtrasados: TramiteAtrasado[];
}

/**
 * Información de un trabajador con algún tipo de problema en sus trámites
 */
export interface TrabajadorConProblema {
  nombre: string;
  dni: string;
  tramites: number;
  detalle: Procedure[];
}

/**
 * Información de un trámite atrasado (más de 3 días sin respuesta)
 */
export interface TramiteAtrasado extends Procedure {
  diasSinRespuesta: number;
}

/**
 * Estadísticas de cumplimiento por trabajador
 */
export interface EstadisticasTrabajadorDetallado {
  id_usuario: string;
  nombre_completo: string;
  dni: string;
  correo: string;

  // Métricas generales
  total_recibidos: number;
  total_abiertos: number;
  total_leidos: number;
  total_firmados: number;
  total_respondidos: number;
  total_completados: number;

  // Pendientes por categoría
  pendientes_abrir: number;
  pendientes_leer: number;
  pendientes_firmar: number;
  pendientes_responder: number;

  // Porcentajes
  porcentaje_completado: number;
  porcentaje_abiertos: number;
  porcentaje_leidos: number;

  // Tiempos
  tiempo_promedio_apertura_horas: number;
  tiempo_promedio_lectura_horas: number;
  tiempo_promedio_firma_horas: number;
  tiempo_promedio_respuesta_horas: number;

  // Trámites atrasados
  tramites_atrasados: number;
  dias_promedio_atraso: number;
}

/**
 * Resumen de acciones requeridas
 */
export interface ResumenAccionesRequeridas {
  total_trabajadores_con_problemas: number;
  total_documentos_sin_abrir: number;
  total_documentos_sin_leer: number;
  total_documentos_sin_firmar: number;
  total_documentos_sin_responder: number;
  total_tramites_atrasados: number;

  trabajadores_criticos: string[]; // IDs de trabajadores con más problemas
  tramites_urgentes: string[]; // IDs de trámites más atrasados
}

/**
 * Recomendaciones generadas automáticamente
 */
export interface Recomendacion {
  tipo: 'CRITICO' | 'IMPORTANTE' | 'SUGERENCIA';
  categoria: 'ENTREGA' | 'FIRMA' | 'RESPUESTA' | 'TIEMPO' | 'GENERAL';
  titulo: string;
  descripcion: string;
  trabajadores_afectados?: string[];
  tramites_afectados?: string[];
  accion_sugerida: string;
}

/**
 * Plan de acción sugerido
 */
export interface PlanAccion {
  prioridad_alta: Recomendacion[];
  prioridad_media: Recomendacion[];
  prioridad_baja: Recomendacion[];
  resumen_ejecutivo: string;
}

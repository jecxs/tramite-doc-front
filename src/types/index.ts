// src/types/index.ts

import { PROCEDURE_STATES, ROLES } from '@/lib/constants';

// ==================== AUTH ====================
export interface LoginDto {
  correo: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

// ==================== USER ====================
export interface User {
  id_usuario: string;
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  telefono?: string;
  fecha_creacion?: string;
  roles: ROLES[];
  area?: {
    id_area: string;
    nombre: string;
  };
  nombre_completo?: string;
}

export interface CreateUserDto {
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  password: string;
  telefono?: string;
  id_area: string;
  id_roles: string[];
}

export interface UpdateUserDto {
  nombres?: string;
  apellidos?: string;
  dni?: string;
  correo?: string;
  telefono?: string;
  id_area?: string;
  id_roles?: string[];
  activo?: boolean;
}

// ==================== AREAS ====================
export interface Area {
  id_area: string;
  nombre: string;
  activo: boolean;
  fecha_creacion?: string;
  usuarios_count?: number;
  tramites_count?: number;
}

export interface CreateAreaDto {
  nombre: string;
}

export interface UpdateAreaDto {
  nombre?: string;
  activo?: boolean;
}

// ==================== ROLES ====================
export interface RoleType {
  id_rol: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  usuarios_count?: number;
}

export interface CreateRoleDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface UpdateRoleDto {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

// ==================== DOCUMENT TYPE ====================
export interface DocumentType {
  id_tipo: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  requiere_firma: boolean;
  requiere_respuesta: boolean;
  fecha_creacion?: string;
  documentos_count?: number;
}

export interface CreateDocumentTypeDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  requiere_firma?: boolean;
  requiere_respuesta?: boolean;
}

export interface UpdateDocumentTypeDto {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  requiere_firma?: boolean;
  requiere_respuesta?: boolean;
}

// ==================== DOCUMENT ====================
export interface Document {
  id_documento: string;
  titulo: string;
  ruta_archivo: string;
  nombre_archivo: string;
  extension: string;
  tamano_bytes: string;
  id_tipo: string;
  version: number;
  id_documento_anterior?: string;
  fecha_creacion: string;
  creado_por: string;
  tipo: DocumentType;
  creador?: {
    id_usuario: string;
    nombres: string;
    apellidos: string;
    correo: string;
  };
}

export interface UploadDocumentoDto {
  titulo: string;
  id_tipo: string;
}

// ==================== PROCEDURE ====================
export interface Procedure {
  id_tramite: string;
  codigo: string;
  id_documento: string;
  id_remitente: string;
  id_area_remitente: string;
  id_receptor: string;
  asunto: string;
  mensaje?: string;
  estado: PROCEDURE_STATES;
  requiere_firma: boolean;
  requiere_respuesta: boolean;
  fecha_envio: string;
  fecha_abierto?: string;
  fecha_leido?: string;
  fecha_firmado?: string;
  fecha_anulado?: string;
  es_reenvio: boolean;
  id_tramite_original?: string;
  motivo_reenvio?: string;
  numero_version: number;
  anulado_por?: string;
  motivo_anulacion?: string;
  documento: Document;
  remitente: User;
  receptor: User;
  areaRemitente?: Area;
  tramiteOriginal?: {
    id_tramite: string;
    codigo: string;
    asunto: string;
    documento?: {
      titulo: string;
      version: number;
    };
  };
  reenvios?: {
    id_tramite: string;
    codigo: string;
    numero_version: number;
    fecha_envio: string;
    documento: {
      titulo: string;
      version: number;
    };
  }[];
  anuladoPorUsuario?: {
    id_usuario: string;
    nombres: string;
    apellidos: string;
  };
  historial?: {
    id_historial: string;
    accion: string;
    detalle: string | null;
    estado_anterior: string | null;
    estado_nuevo: string | null;
    fecha: string;
    realizado_por: string | null;
    usuario?: {
      id_usuario: string;
      nombres: string;
      apellidos: string;
    };
  }[];
  observaciones?: Observation[];
  firma?: ElectronicSignature;
  respuesta?: RespuestaTramite;
  observaciones_count?: number;
  reenvios_count?: number;
}

export interface CreateProcedureDto {
  asunto: string;
  mensaje?: string;
  id_documento: string;
  id_receptor: string;
}
// ==================== AUTO LOTE TRAMITES ====================
export interface DocumentoConDestinatarioDto {
  dni: string;
  id_usuario: string;
  id_documento: string;
  asunto: string;
  mensaje?: string;
  nombre_trabajador: string;
  nombre_archivo: string;
}

export interface CreateTramiteAutoLoteDto {
  id_tipo_documento: string;
  documentos: DocumentoConDestinatarioDto[];
}

export interface DeteccionDestinatarioDto {
  dni: string;
  nombre_archivo: string;
  encontrado: boolean;
  id_usuario?: string;
  nombre_completo?: string;
  area?: string;
  error?: string;
  // Datos temporales del archivo (no se envían al backend)
  archivo_buffer?: ArrayBuffer;
  archivo_mimetype?: string;
  archivo_size?: number;
}

export interface DeteccionResultado {
  exitosos: DeteccionDestinatarioDto[];
  fallidos: DeteccionDestinatarioDto[];
  tipo_documento: DocumentType;
}

export interface UpdateProcedureStateDto {
  estado: PROCEDURE_STATES;
}

export interface ReenviarTramiteDto {
  motivo_reenvio: string;
  titulo_documento: string;
  file: File;
}

export interface AnularTramiteDto {
  motivo_anulacion: string;
}

// ==================== OBSERVATION ====================
export interface Observation {
  id_observacion: string;
  id_tramite: string;
  creado_por: string;
  tipo: 'CONSULTA' | 'CORRECCION_REQUERIDA' | 'INFORMACION_ADICIONAL';
  descripcion: string;
  fecha_creacion: string;
  resuelta: boolean;
  fecha_resolucion?: string;
  resuelto_por?: string;
  respuesta?: string;
  creador?: {
    id_usuario: string;
    nombres: string;
    apellidos: string;
  };
  resolutor?: {
    id_usuario: string;
    nombres: string;
    apellidos: string;
  };
}

export interface CreateObservationDto {
  tipo: 'CONSULTA' | 'CORRECCION_REQUERIDA' | 'INFORMACION_ADICIONAL';
  descripcion: string;
}

export interface ResponderObservacionDto {
  respuesta: string;
  incluye_reenvio?: boolean;
  id_documento_corregido?: string;
  asunto_reenvio?: string;
}
// ==================== ELECTRONIC SIGNATURE ====================
export interface ElectronicSignature {
  id_firma: string;
  id_tramite: string;
  acepta_terminos: boolean;
  ip_address: string;
  navegador?: string;
  dispositivo?: string;
  fecha_firma: string;
}

export interface CreateElectronicSignatureDto {
  acepta_terminos: boolean;
}

// ==================== NOTIFICATION ====================
export interface Notification {
  id_notificacion: string;
  id_usuario: string;
  id_tramite?: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  visto: boolean;
  fecha_creacion: string;
  fecha_visto?: string;
}

// ==================== PAGINATION ====================
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ==================== FILTERS ====================

// ==================== PAGINATION ====================
export interface PaginationParams {
  pagina?: number;
  limite?: number;
}

export interface PaginationMetadata {
  pagina_actual: number;
  limite: number;
  total_registros: number;
  total_paginas: number;
  tiene_siguiente: boolean;
  tiene_anterior: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  paginacion: PaginationMetadata;
}

// ==================== PROCEDURE FILTERS ====================
export interface ProcedureFilters extends PaginationParams {
  // Búsqueda básica
  search?: string;

  // Filtros de usuarios y áreas
  id_remitente?: string;
  id_receptor?: string;
  id_area_remitente?: string;

  // Filtros de estado y tipo
  estado?: PROCEDURE_STATES;
  requiere_firma?: boolean;
  requiere_respuesta?: boolean;
  es_reenvio?: boolean;

  id_tipo_documento?: string;

  fecha_envio_desde?: string; // YYYY-MM-DD
  fecha_envio_hasta?: string; // YYYY-MM-DD
  fecha_leido_desde?: string;
  fecha_leido_hasta?: string;
  fecha_firmado_desde?: string;
  fecha_firmado_hasta?: string;

  tiene_observaciones?: boolean;
  observaciones_pendientes?: boolean;
  con_respuesta?: boolean;

  ordenar_por?: 'fecha_envio' | 'fecha_leido' | 'fecha_firmado' | 'asunto' | 'codigo' | 'estado';
  orden?: 'asc' | 'desc';
}

export interface SimpleUser {
  id_usuario: string;
  nombres: string;
  apellidos: string;
  correo: string;
}
export interface UserFilters extends PaginationParams {
  search?: string;
  id_area?: string;
  id_rol?: string;
  activo?: boolean;
}
// ==================== NOTIFICATION FILTERS ====================
export interface NotificationFilters {
  visto?: boolean;
  tipo?: string;
}

// ==================== API RESPONSES ====================
export interface ApiResponse<T = object> {
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface ApiError {
  message: string | string[];
  error: string;
  statusCode: number;
}

// ==================== FORM TYPES ====================
export interface LoginFormData {
  correo: string;
  password: string;
}

export interface SendDocumentFormData {
  asunto: string;
  mensaje?: string;
  id_destinatario: string;
  titulo_documento: string;
  descripcion_documento?: string;
  id_tipo_documento: string;
  file: File;
}

// ==================== UI STATE ====================
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
}
// ==================== RESPUESTA TRAMITE ====================
export interface RespuestaTramite {
  id_respuesta: string;
  id_tramite: string;
  texto_respuesta: string;
  esta_conforme: boolean;
  fecha_respuesta: string;
  ip_address?: string;
  navegador?: string;
  dispositivo?: string;
  tramite?: Procedure;
}

export interface CreateRespuestaTramiteDto {
  acepta_conformidad: boolean;
}

export interface EstadisticasRespuestas {
  total: number;
  conformes: number;
  noConformes: number;
  porcentajeConformes: number;
  porcentajeNoConformes: number;
}
// ==================== ESTADÍSTICAS RESPONSABLE ====================
export interface EstadisticasGenerales {
  resumen: {
    total_enviados: number;
    pendientes: number;
    completados: number;
    anulados: number;
    porcentaje_pendientes: number;
    porcentaje_completados: number;
  };
  rendimiento: {
    promedio_tiempo_respuesta_horas: number;
    tasa_firmas_porcentaje: number;
    observaciones_pendientes: number;
  };
}

export interface EstadisticasPorPeriodo {
  periodo: 'semana' | 'mes' | 'trimestre' | 'anio';
  fecha_inicio: string;
  fecha_fin: string;
  total_tramites: number;
  datos_grafico: Array<{
    fecha: string;
    cantidad: number;
  }>;
  distribucion_estados: Array<{
    estado: string;
    cantidad: number;
  }>;
}

export interface EstadisticasTrabajador {
  id_usuario: string;
  nombre_completo: string;
  dni: string;
  total_recibidos: number;
  pendientes: number;
  completados: number;
  porcentaje_completado: number;
  promedio_tiempo_respuesta_horas: number;
}

export interface EstadisticasPorTrabajador {
  total_trabajadores: number;
  trabajadores: EstadisticasTrabajador[];
}

export interface TiemposRespuesta {
  envio_a_apertura: {
    promedio: number;
    minimo: number;
    maximo: number;
  };
  apertura_a_lectura: {
    promedio: number;
    minimo: number;
    maximo: number;
  };
  lectura_a_firma: {
    promedio: number;
    minimo: number;
    maximo: number;
  };
  tiempo_total: {
    promedio: number;
    minimo: number;
    maximo: number;
  };
  total_muestras: number;
}

export interface EstadisticasTiposDocumentos {
  total_tipos: number;
  distribucion: Array<{
    nombre: string;
    codigo: string;
    total: number;
    firmados: number;
    pendientes: number;
  }>;
}

export interface RankingEficiencia {
  top_completado: EstadisticasTrabajador[];
  top_velocidad: EstadisticasTrabajador[];
}

export interface EstadisticasObservaciones {
  total: number;
  pendientes: number;
  resueltas: number;
  tasa_resolucion: number;
  distribucion_por_tipo: Array<{
    tipo: string;
    cantidad: number;
  }>;
}

export interface ProcedureStats {
  total_enviados?: number;
  pendientes?: number;
  leidos?: number;
  firmados?: number;
  anulados?: number;
  distribucion_por_estado?: Array<{ estado: string; cantidad: number }>;
  requiere_firma?: { si: number; no: number };
  requiere_respuesta?: { si: number; no: number };
  [key: string]: unknown;
}

export interface ActividadReciente {
  ultimas_actividades: Array<{
    id: string;
    accion: string;
    detalle: string;
    fecha: string;
    tramite_codigo: string;
    tramite_asunto: string;
    usuario: string;
  }>;
  actividad_diaria: Array<{
    fecha: string;
    cantidad: number;
  }>;
}
// ==================== REPORTES PERSONALIZADOS ====================
export interface FiltrosReporte {
  fecha_inicio: string;
  fecha_fin?: string;
  id_tipo_documento?: string;
  id_area?: string;
}

export interface ReportePersonalizado {
  periodo: {
    fecha_inicio: string;
    fecha_fin: string;
  };
  tipo_documento?: {
    id_tipo: string;
    codigo: string;
    nombre: string;
  };
  area?: {
    id_area: string;
    nombre: string;
  };
  resumen: {
    total_enviados: number;
    total_entregados: number;
    total_pendientes: number;
    total_abiertos: number;
    total_leidos: number;
    total_firmados: number;
    total_respondidos: number;
    total_anulados: number;
    porcentaje_entregados: number;
    porcentaje_pendientes: number;
  };
  metricas_firma: {
    requieren_firma: number;
    firmados: number;
    pendientes_firma: number;
    porcentaje_firmados: number;
  };
  metricas_respuesta: {
    requieren_respuesta: number;
    respondidos: number;
    pendientes_respuesta: number;
    porcentaje_respondidos: number;
  };
  tiempos_promedio: {
    envio_a_apertura_horas: number;
    envio_a_lectura_horas: number;
    envio_a_firma_horas: number;
    envio_a_respuesta_horas: number;
  };
  distribucion_por_dia: Array<{
    fecha: string;
    enviados: number;
    abiertos: number;
    leidos: number;
    firmados: number;
  }>;
  trabajadores_top: Array<{
    id_usuario: string;
    nombre_completo: string;
    total_recibidos: number;
    completados: number;
    porcentaje_completado: number;
  }>;
}

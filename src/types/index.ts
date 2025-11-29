// src/types/index.ts

import { Role, ProcedureState, NotificationType } from '@/lib/constants';

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
    roles: string[];
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
    estado: ProcedureState;
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

export interface UpdateProcedureStateDto {
    estado: ProcedureState;
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
export interface UserFilters extends PaginationParams {
    search?: string;
    id_area?: string;
    id_rol?: string;
    activo?: boolean;
}

export interface ProcedureFilters extends PaginationParams {
    search?: string;
    id_remitente?: string;
    id_receptor?: string;
    id_area_remitente?: string;
    estado?: ProcedureState;
    requiere_firma?: boolean;
    requiere_respuesta?: boolean;
    es_reenvio?: boolean;
}

export interface NotificationFilters {
    visto?: boolean;
    tipo?: string;

}

// ==================== API RESPONSES ====================
export interface ApiResponse<T = any> {
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
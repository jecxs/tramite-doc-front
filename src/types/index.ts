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

export interface RefreshTokenDto {
    refresh_token: string;
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
    fecha_actualizacion?: string;
    roles: string[];
    area?: {
        id_area: string;
        nombre: string;
    };
}

export interface CreateUserDto {
    nombre_usuario: string;
    apellido_usuario: string;
    email: string;
    password: string;
    telefono?: string;
    id_rol: number;
    id_area?: number;
}

export interface UpdateUserDto {
    nombre_usuario?: string;
    apellido_usuario?: string;
    email?: string;
    password?: string;
    telefono?: string;
    id_rol?: number;
    id_area?: number;
}

// ==================== ROLE ====================
export interface RoleType {
    id_rol: number;
    nombre_rol: Role;
    descripcion_rol?: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
}

export interface CreateRoleDto {
    nombre_rol: Role;
    descripcion_rol?: string;
}

export interface UpdateRoleDto {
    nombre_rol?: Role;
    descripcion_rol?: string;
}

// ==================== AREA ====================
export interface Area {
    id_area: number;
    nombre_area: string;
    descripcion_area?: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
}

export interface CreateAreaDto {
    nombre_area: string;
    descripcion_area?: string;
}

export interface UpdateAreaDto {
    nombre_area?: string;
    descripcion_area?: string;
}

// ==================== DOCUMENT TYPE ====================
export interface DocumentType {
    id_tipo_documento: number;
    nombre_tipo: string;
    descripcion_tipo?: string;
    requiere_firma: boolean;
    fecha_creacion: string;
    fecha_actualizacion: string;
}

export interface CreateDocumentTypeDto {
    nombre_tipo: string;
    descripcion_tipo?: string;
    requiere_firma: boolean;
}

export interface UpdateDocumentTypeDto {
    nombre_tipo?: string;
    descripcion_tipo?: string;
    requiere_firma?: boolean;
}

// ==================== DOCUMENT ====================
export interface Document {
    id_documento: number;
    titulo_documento: string;
    descripcion_documento?: string;
    url_documento: string;
    version: number;
    es_ultima_version: boolean;
    id_documento_padre?: number;
    fecha_creacion: string;
    fecha_actualizacion: string;
    tipo_documento: DocumentType;
}

export interface CreateDocumentDto {
    titulo_documento: string;
    descripcion_documento?: string;
    id_tipo_documento: number;
    file: File;
}

export interface UpdateDocumentDto {
    titulo_documento?: string;
    descripcion_documento?: string;
    id_tipo_documento?: number;
    file?: File;
}

// ==================== PROCEDURE ====================
export interface Procedure {
    id_tramite: number;
    asunto: string;
    mensaje?: string;
    estado_actual: ProcedureState;
    fecha_envio: string;
    fecha_entrega?: string;
    fecha_apertura?: string;
    fecha_lectura?: string;
    fecha_firma?: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
    remitente: User;
    destinatario: User;
    documento: Document;
    observaciones?: Observation[];
    firma_electronica?: ElectronicSignature;
    historial?: ProcedureHistory[];
}

export interface CreateProcedureDto {
    asunto: string;
    mensaje?: string;
    id_remitente: number;
    id_destinatario: number;
    id_documento: number;
}

export interface UpdateProcedureStateDto {
    estado_actual: ProcedureState;
}

// ==================== OBSERVATION ====================
export interface Observation {
    id_observacion: number;
    contenido_observacion: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
    tramite: Procedure;
    usuario_observador: User;
}

export interface CreateObservationDto {
    contenido_observacion: string;
    id_tramite: number;
    id_usuario_observador: number;
}

export interface UpdateObservationDto {
    contenido_observacion?: string;
}

// ==================== ELECTRONIC SIGNATURE ====================
export interface ElectronicSignature {
    id_firma: number;
    ip_address: string;
    user_agent: string;
    dispositivo: string;
    navegador: string;
    sistema_operativo: string;
    fecha_firma: string;
    fecha_creacion: string;
    tramite: Procedure;
    firmante: User;
}

export interface CreateElectronicSignatureDto {
    id_tramite: number;
    id_firmante: number;
}

// ==================== PROCEDURE HISTORY ====================
export interface ProcedureHistory {
    id_historial: number;
    estado_anterior: ProcedureState;
    estado_nuevo: ProcedureState;
    fecha_cambio: string;
    notas?: string;
    tramite: Procedure;
}

// ==================== NOTIFICATION ====================
export interface Notification {
    id_notificacion: number;
    tipo_notificacion: NotificationType;
    titulo: string;
    mensaje: string;
    leida: boolean;
    fecha_lectura?: string;
    fecha_creacion: string;
    usuario: User;
    tramite?: Procedure;
}

export interface UpdateNotificationDto {
    leida: boolean;
}

export interface NotificationEvent {
    tipo: NotificationType;
    titulo: string;
    mensaje: string;
    id_tramite?: number;
    id_usuario: number;
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
    nombre_usuario?: string;
    email?: string;
    id_rol?: number;
    id_area?: number;
}

export interface ProcedureFilters extends PaginationParams {
    estado_actual?: ProcedureState;
    id_remitente?: number;
    id_destinatario?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
}

export interface NotificationFilters extends PaginationParams {
    tipo_notificacion?: NotificationType;
    leida?: boolean;
    id_usuario?: number;
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
    id_destinatario: number;
    titulo_documento: string;
    descripcion_documento?: string;
    id_tipo_documento: number;
    file: File;
}

export interface CreateUserFormData extends Omit<CreateUserDto, 'password'> {
    password: string;
    confirmPassword: string;
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
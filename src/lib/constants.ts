import { config } from '@/config';

// API Base URL
export const API_URL = config.API_URL;
export const WS_URL = config.SOCKET_URL;

// User Roles
export const ROLES = {
  ADMIN: 'ADMIN',
  RESP: 'RESP',
  TRAB: 'TRAB',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function isRole(value: string): value is Role {
  return Object.values(ROLES).includes(value as Role);
}

// Procedure States
export const PROCEDURE_STATES = {
  ENVIADO: 'ENVIADO',
  ABIERTO: 'ABIERTO',
  LEIDO: 'LEIDO',
  RESPONDIDO: 'RESPONDIDO',
  FIRMADO: 'FIRMADO',
  ANULADO: 'ANULADO',
} as const;

export type ProcedureState = (typeof PROCEDURE_STATES)[keyof typeof PROCEDURE_STATES];

// Estado labels en español
export const PROCEDURE_STATE_LABELS: Record<ProcedureState, string> = {
  ENVIADO: 'Enviado',
  ABIERTO: 'Abierto',
  LEIDO: 'Leído',
  RESPONDIDO: 'Respondido',
  FIRMADO: 'Firmado',
  ANULADO: 'Anulado',
};

// Estado colors para badges
export const PROCEDURE_STATE_COLORS: Record<ProcedureState, string> = {
  ENVIADO: 'bg-blue-100 text-blue-800',
  ABIERTO: 'bg-purple-100 text-purple-800',
  LEIDO: 'bg-indigo-100 text-indigo-800',
  RESPONDIDO: 'bg-teal-100 text-teal-800',
  FIRMADO: 'bg-green-100 text-green-800',
  ANULADO: 'bg-red-100 text-red-800',
};
// Notification Types
export const NOTIFICATION_TYPES = {
  TRAMITE_RECIBIDO: 'TRAMITE_RECIBIDO',
  TRAMITE_FIRMADO: 'TRAMITE_FIRMADO',
  TRAMITE_ANULADO: 'TRAMITE_ANULADO',
  OBSERVACION_CREADA: 'OBSERVACION_CREADA',
  OBSERVACION_RESUELTA: 'OBSERVACION_RESUELTA',
  DOCUMENTO_REQUIERE_FIRMA: 'DOCUMENTO_REQUIERE_FIRMA',
  TRAMITE_REENVIADO: 'TRAMITE_REENVIADO',
  RESPUESTA_RECIBIDA: 'RESPUESTA_RECIBIDA',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

// Notification labels
export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  TRAMITE_RECIBIDO: 'Documento recibido',
  TRAMITE_FIRMADO: 'Documento firmado',
  TRAMITE_ANULADO: 'Trámite anulado',
  OBSERVACION_CREADA: 'Observación recibida',
  OBSERVACION_RESUELTA: 'Observación resuelta',
  DOCUMENTO_REQUIERE_FIRMA: 'Requiere firma',
  TRAMITE_REENVIADO: 'Documento actualizado',
  RESPUESTA_RECIBIDA: 'Respuesta recibida',
};

// Route paths según rol
export const ROUTE_PATHS = {
  LOGIN: '/login',

  // Admin routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/usuarios',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_AREAS: '/admin/areas',
  ADMIN_DOCUMENT_TYPES: '/admin/tipo-documentos',

  // Responsible routes
  RESP_DASHBOARD: '/responsable',
  RESP_SEND_DOCUMENT: '/responsable/tramites/nuevo',
  RESP_PROCEDURES: '/responsable/tramites',
  RESP_NOTIFICATIONS: '/responsable/notificaciones',
  RESP_ESTADISTICAS: '/responsable/estadisticas',

  // Worker routes
  WORKER_DASHBOARD: '/trabajador',
  WORKER_DOCUMENTS: '/trabajador/tramites',
  WORKER_NOTIFICATIONS: '/trabajador/notificaciones',
} as const;

export const ROUTE_BUILDERS = {
  respProcedureDetail: (id: string) => `/responsable/tramites/${id}`,
  workerProcedureDetail: (id: string) => `/trabajador/tramites/${id}`,
  workerObservationCreate: (id: string) => `/trabajador/tramites/${id}/observacion`,
} as const;

// Rutas permitidas por rol
export const ROLE_ROUTES: Record<Role, string[]> = {
  ADMIN: [
    ROUTE_PATHS.ADMIN_DASHBOARD,
    ROUTE_PATHS.ADMIN_USERS,
    ROUTE_PATHS.ADMIN_ROLES,
    ROUTE_PATHS.ADMIN_AREAS,
    ROUTE_PATHS.ADMIN_DOCUMENT_TYPES,
  ],
  RESP: [
    ROUTE_PATHS.RESP_DASHBOARD,
    ROUTE_PATHS.RESP_SEND_DOCUMENT,
    ROUTE_PATHS.RESP_PROCEDURES,
    ROUTE_PATHS.RESP_NOTIFICATIONS,
  ],
  TRAB: [
    ROUTE_PATHS.WORKER_DASHBOARD,
    ROUTE_PATHS.WORKER_DOCUMENTS,
    ROUTE_PATHS.WORKER_NOTIFICATIONS,
  ],
};

// Default route después del login según rol
export const DEFAULT_ROUTE_BY_ROLE: Record<Role, string> = {
  ADMIN: ROUTE_PATHS.ADMIN_DASHBOARD,
  RESP: ROUTE_PATHS.RESP_DASHBOARD,
  TRAB: ROUTE_PATHS.WORKER_DASHBOARD,
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [5, 10, 20, 50],
} as const;

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: ['application/pdf'] as string[],
  ACCEPTED_EXTENSIONS: ['.pdf'],
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  API: 'yyyy-MM-dd',
} as const;

// Validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es obligatorio',
  EMAIL: 'Debe ser un email válido',
  MIN_LENGTH: (length: number) => `Debe tener al menos ${length} caracteres`,
  MAX_LENGTH: (length: number) => `No debe exceder ${length} caracteres`,
  PASSWORD_MISMATCH: 'Las contraseñas no coinciden',
  INVALID_FILE_TYPE: 'Tipo de archivo no permitido',
  FILE_TOO_LARGE: (sizeMB: number) => `El archivo no debe exceder ${sizeMB}MB`,
} as const;

// src/components/trabajador/detalle-tramite/SeccionObservaciones.tsx
'use client';

import { Procedure, Observation } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  MessageSquare,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Eye,
} from 'lucide-react';
import { useMemo } from 'react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface SeccionObservacionesProps {
  procedure: Procedure;
}

const OBSERVATION_TYPES = {
  CONSULTA: {
    label: 'Consulta',
    icon: MessageSquare,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    iconBg: 'bg-blue-500/20',
  },
  CORRECCION_REQUERIDA: {
    label: 'Corrección Requerida',
    icon: AlertTriangle,
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    iconBg: 'bg-orange-500/20',
  },
  INFORMACION_ADICIONAL: {
    label: 'Información Adicional',
    icon: Info,
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    iconBg: 'bg-purple-500/20',
  },
};

export default function SeccionObservaciones({ procedure }: SeccionObservacionesProps) {
  const observaciones = useMemo(() => {
    return procedure.observaciones || [];
  }, [procedure.observaciones]);

  const observacionesPendientes = useMemo(() => {
    return observaciones.filter((obs) => !obs.resuelta);
  }, [observaciones]);

  const observacionesResueltas = useMemo(() => {
    return observaciones.filter((obs) => obs.resuelta);
  }, [observaciones]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return dateString;
    }
  };

  if (observaciones.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-3xl p-6 shadow-2xl border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Observaciones</h3>
            <p className="text-sm text-muted-foreground">
              {observaciones.length} observación{observaciones.length !== 1 ? 'es' : ''} •{' '}
              {observacionesPendientes.length} pendiente
              {observacionesPendientes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Link href="/trabajador/observaciones">
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Ver todas
          </Button>
        </Link>
      </div>

      {/* Alerta si hay observaciones pendientes */}
      {observacionesPendientes.length > 0 && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-400">
                {observacionesPendientes.length} observación
                {observacionesPendientes.length !== 1 ? 'es' : ''} pendiente
                {observacionesPendientes.length !== 1 ? 's' : ''} de respuesta
              </p>
              <p className="text-xs text-yellow-500 mt-1">
                El responsable del área revisará tu{observacionesPendientes.length !== 1 ? 's' : ''}{' '}
                observación{observacionesPendientes.length !== 1 ? 'es' : ''} y te responderá
                pronto.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Observaciones Pendientes */}
        {observacionesPendientes.map((obs) => {
          const typeConfig = OBSERVATION_TYPES[obs.tipo];
          const TypeIcon = typeConfig.icon;

          return (
            <div
              key={obs.id_observacion}
              className="bg-card border border-border rounded-2xl p-5 hover:border-indigo-500/50 transition-all"
            >
              <div className="space-y-4">
                {/* Header de la observación */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-xl ${typeConfig.iconBg}`}>
                      <TypeIcon className="w-5 h-5 text-current" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${typeConfig.color}`}
                        >
                          {typeConfig.label}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          <Clock className="w-3 h-3 mr-1.5" />
                          Pendiente
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {obs.descripcion}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info adicional */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pl-11">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Enviada: {formatDate(obs.fecha_creacion)}</span>
                  </div>
                  {obs.creador && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>
                        Por: {obs.creador.nombres} {obs.creador.apellidos}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Observaciones Resueltas */}
        {observacionesResueltas.length > 0 && (
          <>
            {observacionesPendientes.length > 0 && (
              <div className="border-t border-border my-4" />
            )}
            {observacionesResueltas.map((obs) => {
              const typeConfig = OBSERVATION_TYPES[obs.tipo];
              const TypeIcon = typeConfig.icon;

              return (
                <div
                  key={obs.id_observacion}
                  className="bg-card border border-green-500/30 rounded-2xl p-5 opacity-75 hover:opacity-100 transition-all"
                >
                  <div className="space-y-4">
                    {/* Header de la observación */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-xl ${typeConfig.iconBg}`}>
                          <TypeIcon className="w-5 h-5 text-current" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${typeConfig.color}`}
                            >
                              {typeConfig.label}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                              <CheckCircle2 className="w-3 h-3 mr-1.5" />
                              Resuelta
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{obs.descripcion}</p>

                          {/* Respuesta */}
                          {obs.respuesta && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mt-3">
                              <div className="flex items-start gap-2 mb-2">
                                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                <span className="text-xs font-medium text-green-400">
                                  Respuesta del responsable:
                                </span>
                              </div>
                              <p className="text-sm text-foreground pl-6">{obs.respuesta}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Info adicional */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pl-11">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Enviada: {formatDate(obs.fecha_creacion)}</span>
                      </div>
                      {obs.fecha_resolucion && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          <span>Resuelta: {formatDate(obs.fecha_resolucion)}</span>
                        </div>
                      )}
                      {obs.resolutor && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>
                            Por: {obs.resolutor.nombres} {obs.resolutor.apellidos}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Footer con botón para crear nueva observación */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {observacionesPendientes.length > 0 ? (
              <>
                <AlertTriangle className="inline w-4 h-4 mr-1 text-yellow-400" />
                Espera la respuesta del responsable antes de crear una nueva observación
              </>
            ) : procedure.reenvios && procedure.reenvios.length > 0 ? (
              <>
                <AlertTriangle className="inline w-4 h-4 mr-1 text-orange-400" />
                Este trámite ha sido actualizado. No puedes crear nuevas observaciones en esta versión.
              </>
            ) : (
              <>
                <Info className="inline w-4 h-4 mr-1 text-blue-400" />
                ¿Tienes alguna duda o necesitas una corrección?
              </>
            )}
          </p>
          {observacionesPendientes.length === 0 && (!procedure.reenvios || procedure.reenvios.length === 0) && (
            <Link href={`/trabajador/tramites/${procedure.id_tramite}/observacion`}>
              <Button
                size="sm"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Nueva Observación
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

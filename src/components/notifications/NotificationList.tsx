/* eslint-disable react-hooks/exhaustive-deps */
// src/components/notifications/NotificationList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Bell,
  CheckCheck,
  FileText,
  MessageSquare,
  PenTool,
  XCircle,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Notification } from '@/types';
import { getNotifications, markNotificationAsRead } from '@/lib/api/notificaciones';
import { NOTIFICATION_LABELS, ROLES, ROUTE_BUILDERS } from '@/lib/constants';
import { toast } from 'sonner';
import { useRole } from '@/contexts/AuthContext';

interface NotificationListProps {
  initialNotifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationList({
  initialNotifications = [],
  onNotificationClick,
}: NotificationListProps) {
  const router = useRouter();
  const { currentRole } = useRole();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isLoading, setIsLoading] = useState(!initialNotifications.length);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!initialNotifications.length) {
      loadNotifications();
    }
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await getNotifications({
        visto: filter === 'unread' ? false : filter === 'read' ? true : undefined,
      });
      setNotifications(data);
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      toast.error('Error al cargar las notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadNotifications();
      toast.success('Notificaciones actualizadas');
    } catch (error) {
      console.error('❌ Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Marcar como leída si no lo está
      if (!notification.visto) {
        await markNotificationAsRead(notification.id_notificacion);

        // Actualizar estado local
        setNotifications((prev) =>
          prev.map((n) =>
            n.id_notificacion === notification.id_notificacion
              ? { ...n, visto: true, fecha_visto: new Date().toISOString() }
              : n,
          ),
        );
      }

      // Callback personalizado o navegación por defecto
      if (onNotificationClick) {
        onNotificationClick(notification);
      } else if (notification.id_tramite) {
        // Navegar al trámite
        if (currentRole === ROLES.RESP) {
          router.push(ROUTE_BUILDERS.respProcedureDetail(notification.id_tramite));
        } else if (currentRole === ROLES.TRAB) {
          router.push(ROUTE_BUILDERS.workerProcedureDetail(notification.id_tramite));
        }
      }
    } catch (error) {
      console.error('❌ Error handling notification:', error);
      toast.error('Error al procesar la notificación');
    }
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'TRAMITE_RECIBIDO':
        return <FileText className='w-5 h-5 text-blue-600' />;
      case 'TRAMITE_FIRMADO':
        return <PenTool className='w-5 h-5 text-green-600' />;
      case 'TRAMITE_ANULADO':
        return <XCircle className='w-5 h-5 text-red-600' />;
      case 'OBSERVACION_CREADA':
        return <MessageSquare className='w-5 h-5 text-orange-600' />;
      case 'OBSERVACION_RESUELTA':
        return <CheckCheck className='w-5 h-5 text-green-600' />;
      case 'DOCUMENTO_REQUIERE_FIRMA':
        return <AlertTriangle className='w-5 h-5 text-yellow-600' />;
      case 'TRAMITE_REENVIADO':
        return <RefreshCw className='w-5 h-5 text-purple-600' />;
      default:
        return <Info className='w-5 h-5 text-gray-600' />;
    }
  };

  const getNotificationBgColor = (tipo: string, visto: boolean) => {
    if (visto) return 'bg-white';

    switch (tipo) {
      case 'TRAMITE_RECIBIDO':
        return 'bg-blue-50';
      case 'TRAMITE_FIRMADO':
        return 'bg-green-50';
      case 'TRAMITE_ANULADO':
        return 'bg-red-50';
      case 'OBSERVACION_CREADA':
        return 'bg-orange-50';
      case 'OBSERVACION_RESUELTA':
        return 'bg-green-50';
      case 'DOCUMENTO_REQUIERE_FIRMA':
        return 'bg-yellow-50';
      case 'TRAMITE_REENVIADO':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  };

  const filteredNotifications = notifications;

  if (isLoading) {
    return (
      <Card>
        <CardContent className='py-12'>
          <div className='text-center'>
            <Loader2 className='w-12 h-12 text-blue-600 animate-spin mx-auto mb-3' />
            <p className='text-gray-600'>Cargando notificaciones...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Notificaciones</CardTitle>
          <Button variant='ghost' size='sm' onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filtros */}
        <div className='flex gap-2 mb-4'>
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size='sm'
            onClick={() => setFilter('all')}
          >
            Todas
          </Button>
          <Button
            variant={filter === 'unread' ? 'primary' : 'outline'}
            size='sm'
            onClick={() => setFilter('unread')}
          >
            No leídas
          </Button>
          <Button
            variant={filter === 'read' ? 'primary' : 'outline'}
            size='sm'
            onClick={() => setFilter('read')}
          >
            Leídas
          </Button>
        </div>

        {/* Lista */}
        {filteredNotifications.length === 0 ? (
          <div className='text-center py-12'>
            <Bell className='w-12 h-12 text-gray-400 mx-auto mb-3' />
            <p className='text-gray-600'>No hay notificaciones</p>
          </div>
        ) : (
          <div className='space-y-2'>
            {filteredNotifications.map((notification) => (
              <button
                key={notification.id_notificacion}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left p-4 rounded-lg border transition-all hover:shadow-md ${getNotificationBgColor(
                  notification.tipo,
                  notification.visto,
                )} ${!notification.visto ? 'border-blue-200' : 'border-gray-200'}`}
              >
                <div className='flex items-start gap-3'>
                  {/* Icono */}
                  <div className='flex-shrink-0 mt-0.5'>
                    {getNotificationIcon(notification.tipo)}
                  </div>

                  {/* Contenido */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-gray-900'>{notification.titulo}</p>
                        <p className='text-sm text-gray-600 mt-1'>{notification.mensaje}</p>
                      </div>
                      {!notification.visto && (
                        <div className='w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2' />
                      )}
                    </div>

                    {/* Footer */}
                    <div className='flex items-center gap-3 mt-2 text-xs text-gray-500'>
                      <span>
                        {formatDistanceToNow(new Date(notification.fecha_creacion), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                      <span className='text-gray-400'>•</span>
                      <span>
                        {NOTIFICATION_LABELS[
                          notification.tipo as keyof typeof NOTIFICATION_LABELS
                        ] || notification.tipo}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

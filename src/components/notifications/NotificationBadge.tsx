// src/components/notifications/NotificationBadge.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useRole } from '@/contexts/AuthContext';
import { ROUTE_PATHS, ROUTE_BUILDERS, ROLES } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function NotificationBadge() {
  const router = useRouter();
  const { currentRole } = useRole();
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Determinar ruta según rol
  const getNotificationsRoute = () => {
    if (currentRole === ROLES.RESP) return ROUTE_PATHS.RESP_NOTIFICATIONS;
    if (currentRole === ROLES.TRAB) return ROUTE_PATHS.WORKER_NOTIFICATIONS;
    return '/notificaciones';
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsMarkingAll(true);
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNotificationClick = async (id: string, idTramite?: string) => {
    try {
      await markAsRead(id);
      setShowDropdown(false);

      // Navegar al trámite si existe
      if (idTramite) {
        if (currentRole === ROLES.RESP) {
          router.push(ROUTE_BUILDERS.respProcedureDetail(idTramite));
        } else if (currentRole === ROLES.TRAB) {
          router.push(ROUTE_BUILDERS.workerProcedureDetail(idTramite));
        }
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  return (
    <div className='relative'>
      {/* Bell button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className='relative p-2 rounded-md hover:bg-muted transition-colors'
        aria-label='Notificaciones'
      >
        <Bell className='w-6 h-6 text-muted-foreground' />

        {/* Badge de contador */}
        {unreadCount > 0 && (
          <span className='absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold bg-primary text-primary-foreground rounded-full'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Indicador de conexión WebSocket */}
        {isConnected && (
          <span className='absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse' />
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Overlay */}
          <div className='fixed inset-0 z-40' onClick={() => setShowDropdown(false)} />

          {/* Dropdown content */}
          <div className='absolute right-0 mt-2 w-80 sm:w-96 bg-card rounded-lg shadow-lg border border-border z-50 max-h-[500px] overflow-hidden flex flex-col'>
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b border-border'>
              <h3 className='text-lg font-semibold text-foreground'>Notificaciones</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAll}
                  className='flex items-center gap-1 text-sm text-primary hover:opacity-80 disabled:opacity-50'
                >
                  {isMarkingAll ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <Check className='w-4 h-4' />
                  )}
                  Marcar todas
                </button>
              )}
            </div>

            {/* Lista de notificaciones */}
            <div className='overflow-y-auto flex-1'>
              {notifications.length === 0 ? (
                <div className='p-8 text-center'>
                  <Bell className='w-12 h-12 text-muted-foreground mx-auto mb-3' />
                  <p className='text-muted-foreground mb-4'>No tienes notificaciones nuevas</p>
                  <Link
                    href={getNotificationsRoute()}
                    onClick={() => setShowDropdown(false)}
                    className='inline-flex items-center gap-2 px-4 py-2 text-sm text-primary hover:opacity-80 font-medium hover:bg-muted rounded-lg transition-colors'
                  >
                    <Bell className='w-4 h-4' />
                    Ver notificaciones anteriores
                  </Link>
                </div>
              ) : (
                <div className='divide-y divide-border'>
                  {notifications.slice(0, 5).map((notification) => (
                    <button
                      key={notification.id_notificacion}
                      onClick={() =>
                        handleNotificationClick(
                          notification.id_notificacion,
                          notification.id_tramite,
                        )
                      }
                      className={`w-full text-left p-4 hover:bg-muted transition-colors ${
                        !notification.visto ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className='flex items-start gap-3'>
                        {!notification.visto && (
                          <div className='w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0' />
                        )}
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-foreground'>
                            {notification.titulo}
                          </p>
                          <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                            {notification.mensaje}
                          </p>
                          <p className='text-xs text-muted-foreground mt-1'>
                            {formatDistanceToNow(new Date(notification.fecha_creacion), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - Siempre visible */}
            {notifications.length > 0 && (
              <div className='p-3 border-t border-border'>
                <Link
                  href={getNotificationsRoute()}
                  onClick={() => setShowDropdown(false)}
                  className='block w-full text-center text-sm text-primary hover:opacity-80 font-medium'
                >
                  Ver todas las notificaciones
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

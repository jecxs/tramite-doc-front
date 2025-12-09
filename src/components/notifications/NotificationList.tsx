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
import { Notification } from '@/types';
import { getNotifications, markNotificationAsRead } from '@/lib/api/notificaciones';
import { NOTIFICATION_LABELS, ROLES, ROUTE_BUILDERS } from '@/lib/constants';
import { toast } from 'sonner';
import { useRole } from '@/contexts/AuthContext';
import clsx from 'clsx';

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
      if (!notification.visto) {
        await markNotificationAsRead(notification.id_notificacion);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id_notificacion === notification.id_notificacion
              ? { ...n, visto: true, fecha_visto: new Date().toISOString() }
              : n,
          ),
        );
      }

      if (onNotificationClick) {
        onNotificationClick(notification);
      } else if (notification.id_tramite) {
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
    const iconClass = 'w-5 h-5';
    switch (tipo) {
      case 'TRAMITE_RECIBIDO':
        return <FileText className={`${iconClass} text-blue-400`} />;
      case 'TRAMITE_FIRMADO':
        return <PenTool className={`${iconClass} text-green-400`} />;
      case 'TRAMITE_ANULADO':
        return <XCircle className={`${iconClass} text-red-400`} />;
      case 'OBSERVACION_CREADA':
        return <MessageSquare className={`${iconClass} text-orange-400`} />;
      case 'OBSERVACION_RESUELTA':
        return <CheckCheck className={`${iconClass} text-green-400`} />;
      case 'DOCUMENTO_REQUIERE_FIRMA':
        return <AlertTriangle className={`${iconClass} text-yellow-400`} />;
      case 'TRAMITE_REENVIADO':
        return <RefreshCw className={`${iconClass} text-purple-400`} />;
      default:
        return <Info className={`${iconClass} text-gray-400`} />;
    }
  };

  const getNotificationAccent = (tipo: string) => {
    switch (tipo) {
      case 'TRAMITE_RECIBIDO':
        return 'border-blue-500/40 hover:border-blue-400/60';
      case 'TRAMITE_FIRMADO':
        return 'border-green-500/40 hover:border-green-400/60';
      case 'TRAMITE_ANULADO':
        return 'border-red-500/40 hover:border-red-400/60';
      case 'OBSERVACION_CREADA':
        return 'border-orange-500/40 hover:border-orange-400/60';
      case 'OBSERVACION_RESUELTA':
        return 'border-green-500/40 hover:border-green-400/60';
      case 'DOCUMENTO_REQUIERE_FIRMA':
        return 'border-yellow-500/40 hover:border-yellow-400/60';
      case 'TRAMITE_REENVIADO':
        return 'border-purple-500/40 hover:border-purple-400/60';
      default:
        return 'border-gray-600 hover:border-gray-500';
    }
  };

  const filteredNotifications = notifications;

  if (isLoading) {
    return (
      <div className='bg-[#242b34] rounded-3xl p-16 shadow-2xl backdrop-blur-sm'>
        <div className='text-center'>
          <Loader2 className='w-14 h-14 text-blue-400 animate-spin mx-auto mb-4' />
          <p className='text-gray-400 text-lg'>Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-[#242b34] rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm'>
      {/* Header */}
      <div className='border-b border-gray-700/50 px-8 py-6'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-white'>Todas las notificaciones</h2>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className='group flex items-center gap-2.5 px-5 py-2.5 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-gray-900/50'
          >
            <RefreshCw
              className={clsx(
                'w-4 h-4 transition-transform duration-500',
                isRefreshing ? 'animate-spin' : 'group-hover:rotate-180',
              )}
            />
            <span className='font-medium'>Actualizar</span>
          </button>
        </div>

        {/* Filtros */}
        <div className='flex gap-3'>
          <button
            onClick={() => setFilter('all')}
            className={clsx(
              'relative px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
              filter === 'all'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50 hover:text-white',
            )}
          >
            {filter === 'all' && (
              <div className='absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-xl animate-pulse' />
            )}
            <span className='relative z-10'>Todas</span>
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={clsx(
              'relative px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
              filter === 'unread'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50 hover:text-white',
            )}
          >
            {filter === 'unread' && (
              <div className='absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-xl animate-pulse' />
            )}
            <span className='relative z-10'>No leídas</span>
          </button>
          <button
            onClick={() => setFilter('read')}
            className={clsx(
              'relative px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
              filter === 'read'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50 hover:text-white',
            )}
          >
            {filter === 'read' && (
              <div className='absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-xl animate-pulse' />
            )}
            <span className='relative z-10'>Leídas</span>
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className='p-6'>
        {filteredNotifications.length === 0 ? (
          <div className='text-center py-20'>
            <div className='w-20 h-20 bg-gray-700/30 rounded-2xl flex items-center justify-center mx-auto mb-5 backdrop-blur-sm'>
              <Bell className='w-10 h-10 text-gray-500' />
            </div>
            <p className='text-gray-400 text-lg font-medium'>No hay notificaciones</p>
            <p className='text-gray-500 text-sm mt-2'>Tus notificaciones aparecerán aquí</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {filteredNotifications.map((notification) => (
              <button
                key={notification.id_notificacion}
                onClick={() => handleNotificationClick(notification)}
                className={clsx(
                  'group w-full text-left p-5 rounded-2xl transition-all duration-300 hover:scale-[1.01] hover:shadow-xl relative overflow-hidden',
                  !notification.visto
                    ? ['bg-gray-800/80', 'border-l-4', getNotificationAccent(notification.tipo)]
                    : [
                        'bg-gray-800/40',
                        'border',
                        'border-gray-700/30',
                        'hover:bg-gray-800/60',
                        'hover:border-gray-600/50',
                      ],
                )}
              >
                {/* Hover effect overlay */}
                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700' />

                <div className='relative z-10 flex items-start gap-4'>
                  {/* Icono */}
                  <div className='flex-shrink-0 w-12 h-12 bg-gray-900/60 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-700/50'>
                    {getNotificationIcon(notification.tipo)}
                  </div>

                  {/* Contenido */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-3 mb-2'>
                      <h3 className='text-base font-semibold text-white group-hover:text-blue-300 transition-colors duration-300'>
                        {notification.titulo}
                      </h3>
                      {!notification.visto && (
                        <div className='relative flex-shrink-0 mt-1'>
                          <div className='w-3 h-3 bg-blue-500 rounded-full' />
                          <div className='absolute inset-0 w-3 h-3 bg-blue-500 rounded-full animate-ping' />
                        </div>
                      )}
                    </div>

                    <p className='text-sm text-gray-400 leading-relaxed mb-3'>
                      {notification.mensaje}
                    </p>

                    {/* Footer */}
                    <div className='flex items-center gap-3 text-xs'>
                      <span className='text-gray-500 font-medium'>
                        {formatDistanceToNow(new Date(notification.fecha_creacion), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                      <div className='w-1 h-1 bg-gray-600 rounded-full' />
                      <span className='text-gray-500 bg-gray-700/30 px-3 py-1 rounded-lg'>
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
      </div>
    </div>
  );
}

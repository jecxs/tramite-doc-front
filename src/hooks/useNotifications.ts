// src/hooks/useNotifications.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Notification } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/api/notificaciones';
import { toast } from 'sonner';
import { config } from '@/config';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const buildToastId = useCallback((type: string, data: unknown) => {
    const obj =
      typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : undefined;
    const candidate =
      obj?.id ?? obj?.id_observacion ?? obj?.idNotificacion ?? obj?.id_notificacion ?? obj?.uuid;
    if (candidate !== undefined) return `${type}:${String(candidate)}`;
    const str = typeof data === 'string' ? data : JSON.stringify(obj ?? {});
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return `${type}:${h}`;
  }, []);

  // Cargar notificaciones iniciales
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const [notifData, countData] = await Promise.all([
        getNotifications({ visto: false }),
        getUnreadCount(),
      ]);

      setNotifications(notifData);
      setUnreadCount(countData.count);
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Conectar WebSocket
  useEffect(() => {
    if (!user?.id_usuario) return;

    const SOCKET_URL = config.SOCKET_URL;

    console.log('🔌 Connecting to WebSocket...', SOCKET_URL);

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      query: {
        userId: user.id_usuario,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Event handlers
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Escuchar nuevas observaciones (se envían como notificaciones)
    socket.on('nueva_observacion', (data) => {
      console.log('📩 Nueva observación recibida:', data);

      // Actualizar contador
      setUnreadCount((prev) => prev + 1);

      // Mostrar toast
      toast.info('Nueva observación recibida', {
        description: data.descripcion?.substring(0, 100) || 'Tiene una nueva observación',
        duration: 5000,
        id: buildToastId('nueva_observacion', data),
      });

      // Recargar notificaciones
      loadNotifications();
    });

    // Escuchar observaciones resueltas
    socket.on('observacion_resuelta', (data) => {
      console.log('✅ Observación resuelta:', data);

      // Actualizar contador
      setUnreadCount((prev) => prev + 1);

      // Mostrar toast
      toast.success('Observación resuelta', {
        description: 'Su observación ha sido respondida',
        duration: 5000,
        id: buildToastId('observacion_resuelta', data),
      });

      // Recargar notificaciones
      loadNotifications();
    });

    // Cargar notificaciones iniciales
    loadNotifications();

    // Cleanup
    return () => {
      console.log('🔌 Disconnecting WebSocket...');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, loadNotifications, buildToastId]);

  // Refrescar notificaciones manualmente
  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  // Marcar como leída
  const markAsRead = useCallback(async (id: string) => {
    try {
      await markNotificationAsRead(id);

      // Actualizar estado local
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id_notificacion === id
            ? { ...notif, visto: true, fecha_visto: new Date().toISOString() }
            : notif,
        ),
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();

      // Actualizar estado local
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          visto: true,
          fecha_visto: new Date().toISOString(),
        })),
      );

      setUnreadCount(0);
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
      toast.error('Error al marcar notificaciones como leídas');
      throw error;
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  };
}

// src/app/(dashboard)/trabajador/notificaciones/page.tsx
'use client';

import React from 'react';
import { Bell, FileText, MessageSquare, PenTool } from 'lucide-react';
import NotificationList from '@/components/notifications/NotificationList';
import { useNotifications } from '@/hooks/useNotifications';
import { PROCEDURE_TYPES } from '@/lib/constants';

export default function TrabajadorNotificationsPage() {
  const { notifications, unreadCount, isConnected } = useNotifications();

  // Calcular estadísticas por tipo
  const documentosRecibidos = notifications.filter(
    (n) => n.tipo === PROCEDURE_TYPES.TRAMITE_RECIBIDO,
  ).length;
  const observacionesResueltas = notifications.filter(
    (n) => n.tipo === PROCEDURE_TYPES.OBSERVACION_RESUELTA,
  ).length;
  const documentosRequierenFirma = notifications.filter(
    (n) => n.tipo === PROCEDURE_TYPES.DOCUMENTO_REQUIERE_FIRMA && !n.visto,
  ).length;

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-[1400px] mx-auto px-8 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-10'>
          <div>
            <h1 className='text-4xl font-bold text-foreground mb-2'>Notificaciones</h1>
            <p className='text-muted-foreground'>Centro de notificaciones y alertas</p>
          </div>
        </div>

        {/* Stats Cards Grid Compacto */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5'>
          {/* Card 1 - No leídas */}
          <div className='group relative bg-gradient-to-br from-[#5b7fff] to-[#4a67ff] rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 cursor-pointer overflow-hidden'>
            {/* Decoración de fondo reducida */}
            <div className='absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10 transition-transform duration-300 group-hover:scale-150' />

            <div className='relative z-10 flex flex-col justify-between h-full'>
              <div className='flex items-start justify-between'>
                <div>
                  <div className='text-3xl font-bold text-white mb-1'>{unreadCount}</div>
                  <p className='text-blue-100 text-sm font-medium'>No leídas</p>
                </div>
                {/* Icono más pequeño y movido a la derecha para ahorrar altura vertical */}
                <div className='w-10 h-10 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-12'>
                  <Bell className='w-5 h-5 text-white' />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 - Documentos Recibidos */}
          <div className='group relative bg-gradient-to-br from-[#a855f7] to-[#9333ea] rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden'>
            <div className='absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10 transition-transform duration-300 group-hover:scale-150' />
            <div className='relative z-10'>
              <div className='flex items-start justify-between'>
                <div>
                  <div className='text-3xl font-bold text-white mb-1'>{documentosRecibidos}</div>
                  <p className='text-purple-100 text-sm font-medium'>Doc. recibidos</p>
                </div>
                <div className='w-10 h-10 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-12'>
                  <FileText className='w-5 h-5 text-white' />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 - Observaciones */}
          <div className='group relative bg-gradient-to-br from-[#10b981] to-[#059669] rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/20 cursor-pointer overflow-hidden'>
            <div className='absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10 transition-transform duration-300 group-hover:scale-150' />
            <div className='relative z-10'>
              <div className='flex items-start justify-between'>
                <div>
                  <div className='text-3xl font-bold text-white mb-1'>{observacionesResueltas}</div>
                  <p className='text-green-100 text-sm font-medium'>Obs. resueltas</p>
                </div>
                <div className='w-10 h-10 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-12'>
                  <MessageSquare className='w-5 h-5 text-white' />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 - Requieren Firma */}
          <div className='group relative bg-gradient-to-br from-[#f97316] to-[#ea580c] rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/20 cursor-pointer overflow-hidden'>
            <div className='absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10 transition-transform duration-300 group-hover:scale-150' />
            <div className='relative z-10'>
              <div className='flex items-start justify-between'>
                <div>
                  <div className='text-3xl font-bold text-white mb-1'>
                    {documentosRequierenFirma}
                  </div>
                  <p className='text-orange-100 text-sm font-medium'>Requieren firma</p>
                </div>
                <div className='w-10 h-10 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-12'>
                  <PenTool className='w-5 h-5 text-white' />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification List */}
        <NotificationList />
      </div>
    </div>
  );
}

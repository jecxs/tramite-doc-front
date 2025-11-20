// src/app/(dashboard)/trabajador/notificaciones/page.tsx
'use client';

import React from 'react';
import { Bell, TrendingUp, FileText, MessageSquare, PenTool } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import NotificationList from '@/components/notifications/NotificationList';
import { useNotifications } from '@/hooks/useNotifications';

export default function TrabajadorNotificationsPage() {
    const { notifications, unreadCount, isConnected } = useNotifications();

    // Calcular estadísticas por tipo
    const documentosRecibidos = notifications.filter(n => n.tipo === 'TRAMITE_RECIBIDO').length;
    const observacionesResueltas = notifications.filter(n => n.tipo === 'OBSERVACION_RESUELTA').length;
    const documentosRequierenFirma = notifications.filter(n => n.tipo === 'DOCUMENTO_REQUIERE_FIRMA' && !n.visto).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
                    <p className="text-gray-600 mt-1">
                        Centro de notificaciones y alertas
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {isConnected && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                            <span>Conectado en tiempo real</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            No leídas
                        </CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{unreadCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Notificaciones pendientes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Documentos Recibidos
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{documentosRecibidos}</div>
                        <p className="text-xs text-muted-foreground">
                            Nuevos documentos
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Observaciones
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{observacionesResueltas}</div>
                        <p className="text-xs text-muted-foreground">
                            Respuestas recibidas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Requieren Firma
                        </CardTitle>
                        <PenTool className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{documentosRequierenFirma}</div>
                        <p className="text-xs text-muted-foreground">
                            Pendientes de firma
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Notification List */}
            <NotificationList />
        </div>
    );
}
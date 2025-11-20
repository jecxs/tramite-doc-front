// src/app/(dashboard)/responsable/notificaciones/page.tsx
'use client';

import React from 'react';
import { Bell, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import NotificationList from '@/components/notifications/NotificationList';
import { useNotifications } from '@/hooks/useNotifications';

export default function ResponsableNotificationsPage() {
    const { unreadCount, isConnected } = useNotifications();

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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                            Estado
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isConnected ? 'Activo' : 'Desconectado'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            WebSocket en tiempo real
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Notification List */}
            <NotificationList />
        </div>
    );
}
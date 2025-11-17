'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProcedureStateBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function ResponsableDashboard() {
    const { user } = useAuth();

    // Mock data - esto después se obtendrá de la API
    const stats = [
        {
            title: 'Trámites Enviados',
            value: '45',
            icon: <Send className="w-6 h-6 text-blue-600" />,
            description: 'Este mes',
        },
        {
            title: 'En Proceso',
            value: '12',
            icon: <FileText className="w-6 h-6 text-yellow-600" />,
            description: 'Pendientes de firma',
        },
        {
            title: 'Completados',
            value: '28',
            icon: <CheckCircle className="w-6 h-6 text-green-600" />,
            description: 'Finalizados',
        },
        {
            title: 'Con Observaciones',
            value: '5',
            icon: <AlertCircle className="w-6 h-6 text-red-600" />,
            description: 'Requieren corrección',
        },
    ];

    // Mock recent procedures
    const recentProcedures = [
        {
            id: '1',
            codigo: 'TRAM-2025-001',
            asunto: 'Contrato Laboral Q1 2025',
            receptor: 'Juan Pérez',
            estado: 'READ' as const,
            fecha: '2025-11-15',
        },
        {
            id: '2',
            codigo: 'TRAM-2025-002',
            asunto: 'Renovación de Contrato',
            receptor: 'María García',
            estado: 'SIGNED' as const,
            fecha: '2025-11-14',
        },
        {
            id: '3',
            codigo: 'TRAM-2025-003',
            asunto: 'Boleta de Pago',
            receptor: 'Ana López',
            estado: 'SENT' as const,
            fecha: '2025-11-13',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Bienvenido, {user?.nombres}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Área: {user?.area?.nombre || 'No asignada'}
                    </p>
                </div>
                <Link href="/responsable/tramites/nuevo">
                    <Button>
                        <Send className="w-4 h-4" />
                        Enviar Documento
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} hover>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        {stat.title}
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {stat.description}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    {stat.icon}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Procedures */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Trámites Recientes</CardTitle>
                        <Link
                            href="/responsable/tramites"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Ver todos →
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentProcedures.map((procedure) => (
                            <div
                                key={procedure.id}
                                className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <p className="text-sm font-medium text-gray-900">
                                            {procedure.codigo}
                                        </p>
                                        <ProcedureStateBadge estado={procedure.estado} />
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {procedure.asunto}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Destinatario: {procedure.receptor} • {procedure.fecha}
                                    </p>
                                </div>
                                <Link href={`/responsable/tramites/${procedure.id}`}>
                                    <Button variant="ghost" size="sm">
                                        Ver detalles
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Observaciones pendientes */}
            <Card>
                <CardHeader>
                    <CardTitle>Observaciones Pendientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No hay observaciones pendientes</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
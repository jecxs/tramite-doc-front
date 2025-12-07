'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, Eye, PenTool, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProcedureStateBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function TrabajadorDashboard() {
  const { user } = useAuth();

  // Mock data - esto después se obtendrá de la API
  const stats = [
    {
      title: 'Documentos Recibidos',
      value: '18',
      icon: <FileText className='w-6 h-6 text-blue-600' />,
      description: 'Total',
    },
    {
      title: 'Sin Leer',
      value: '3',
      icon: <Eye className='w-6 h-6 text-yellow-600' />,
      description: 'Pendientes',
    },
    {
      title: 'Para Firmar',
      value: '2',
      icon: <PenTool className='w-6 h-6 text-red-600' />,
      description: 'Requieren firma',
    },
    {
      title: 'Firmados',
      value: '13',
      icon: <FileText className='w-6 h-6 text-green-600' />,
      description: 'Completados',
    },
  ];

  // Mock recent procedures
  const recentProcedures = [
    {
      id: '1',
      codigo: 'TRAM-2025-001',
      asunto: 'Contrato Laboral Q1 2025',
      remitente: 'María García',
      area: 'Recursos Humanos',
      estado: 'SENT' as const,
      fecha: '2025-11-15',
      requiere_firma: true,
    },
    {
      id: '2',
      codigo: 'TRAM-2025-002',
      asunto: 'Boleta de Pago Noviembre',
      remitente: 'Juan Pérez',
      area: 'Finanzas',
      estado: 'READ' as const,
      fecha: '2025-11-14',
      requiere_firma: false,
    },
    {
      id: '3',
      codigo: 'TRAM-2025-003',
      asunto: 'Notificación de Capacitación',
      remitente: 'Ana López',
      area: 'RRHH',
      estado: 'SIGNED' as const,
      fecha: '2025-11-13',
      requiere_firma: true,
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Bienvenido, {user?.nombres}</h1>
        <p className='text-gray-600 mt-1'>
          Aquí encontrarás todos los documentos que han sido enviados para ti
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map((stat, index) => (
          <Card key={index} hover>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>{stat.title}</p>
                  <p className='text-3xl font-bold text-gray-900 mt-2'>{stat.value}</p>
                  <p className='text-sm text-gray-500 mt-1'>{stat.description}</p>
                </div>
                <div className='p-3 bg-gray-50 rounded-lg'>{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Documentos Pendientes */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Documentos Recientes</CardTitle>
            <Link
              href='/trabajador/tramites'
              className='text-sm text-blue-600 hover:text-blue-700 font-medium'
            >
              Ver todos →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {recentProcedures.map((procedure) => (
              <div
                key={procedure.id}
                className='flex items-center justify-between py-4 border-b border-gray-100 last:border-0'
              >
                <div className='flex-1'>
                  <div className='flex items-center gap-3'>
                    <p className='text-sm font-medium text-gray-900'>{procedure.codigo}</p>
                    <ProcedureStateBadge estado={procedure.estado} />
                    {procedure.requiere_firma && (
                      <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800'>
                        Requiere Firma
                      </span>
                    )}
                  </div>
                  <p className='text-sm text-gray-600 mt-1'>{procedure.asunto}</p>
                  <p className='text-xs text-gray-500 mt-1'>
                    De: {procedure.remitente} ({procedure.area}) • {procedure.fecha}
                  </p>
                </div>
                <Link href={`/trabajador/tramites/${procedure.id}`}>
                  <Button variant='ghost' size='sm'>
                    {procedure.estado === 'SENT' ? 'Ver ahora' : 'Ver detalles'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Documentos para firmar */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos para Firmar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-3xl font-bold text-gray-900'>2</p>
                <p className='text-sm text-gray-600 mt-1'>Requieren tu firma electrónica</p>
              </div>
              <Link href='/trabajador/firmar'>
                <Button>
                  <PenTool className='w-4 h-4' />
                  Firmar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Mis Observaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-3xl font-bold text-gray-900'>0</p>
                <p className='text-sm text-gray-600 mt-1'>Observaciones realizadas</p>
              </div>
              <Link href='/trabajador/observaciones'>
                <Button variant='outline'>
                  <MessageSquare className='w-4 h-4' />
                  Ver
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

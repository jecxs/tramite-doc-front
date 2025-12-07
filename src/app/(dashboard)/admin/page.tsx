'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, Building2, FileText, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  // Mock data - esto después se obtendrá de la API
  const stats = [
    {
      title: 'Total Usuarios',
      value: '156',
      icon: <Users className='w-6 h-6 text-blue-600' />,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Áreas Activas',
      value: '24',
      icon: <Building2 className='w-6 h-6 text-green-600' />,
      change: '+3',
      changeType: 'positive' as const,
    },
    {
      title: 'Trámites Totales',
      value: '1,234',
      icon: <FileText className='w-6 h-6 text-purple-600' />,
      change: '+18%',
      changeType: 'positive' as const,
    },
    {
      title: 'Tasa de Finalización',
      value: '94%',
      icon: <TrendingUp className='w-6 h-6 text-orange-600' />,
      change: '+2%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Bienvenido, {user?.nombres}</h1>
        <p className='text-gray-600 mt-1'>Panel de administración del sistema</p>
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
                  <p
                    className={`text-sm mt-2 ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change} desde el último mes
                  </p>
                </div>
                <div className='p-3 bg-gray-50 rounded-lg'>{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Usuarios Recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className='flex items-center justify-between py-3 border-b border-gray-100 last:border-0'
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                      <Users className='w-5 h-5 text-blue-600' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>Usuario {i}</p>
                      <p className='text-xs text-gray-500'>usuario{i}@universidad.edu</p>
                    </div>
                  </div>
                  <span className='text-xs text-gray-500'>Hace 2h</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actividad del Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {[
                {
                  action: 'Nuevo trámite creado',
                  user: 'María García',
                  time: 'Hace 5m',
                },
                {
                  action: 'Documento firmado',
                  user: 'Juan Pérez',
                  time: 'Hace 15m',
                },
                {
                  action: 'Observación creada',
                  user: 'Ana López',
                  time: 'Hace 30m',
                },
                {
                  action: 'Usuario creado',
                  user: 'Admin',
                  time: 'Hace 1h',
                },
                {
                  action: 'Área actualizada',
                  user: 'Admin',
                  time: 'Hace 2h',
                },
              ].map((activity, i) => (
                <div
                  key={i}
                  className='flex items-start justify-between py-3 border-b border-gray-100 last:border-0'
                >
                  <div>
                    <p className='text-sm font-medium text-gray-900'>{activity.action}</p>
                    <p className='text-xs text-gray-500'>por {activity.user}</p>
                  </div>
                  <span className='text-xs text-gray-500'>{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

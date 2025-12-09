'use client';

import { FileText, Eye, PenTool, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProcedureStateBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useWorkerStats } from '@/hooks/useWorkerStats';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PROCEDURE_STATES } from '@/lib/constants';

export default function TrabajadorDashboard() {
  const { user } = useAuth();
  const { stats, recentProcedures, isLoading, error, refetch } = useWorkerStats();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
        <AlertCircle className='w-12 h-12 text-red-600' />
        <p className='text-gray-600'>{error}</p>
        <Button onClick={refetch}>Reintentar</Button>
      </div>
    );
  }

  const statsData = [
    {
      title: 'Documentos Recibidos',
      value: stats.total_recibidos.toString(),
      icon: <FileText className='w-5 h-5' />,
      description: 'Total',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Sin Leer',
      value: stats.sin_leer.toString(),
      icon: <Eye className='w-5 h-5' />,
      description: 'Pendientes',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      highlight: stats.sin_leer > 0,
    },
    {
      title: 'Para Firmar',
      value: stats.para_firmar.toString(),
      icon: <PenTool className='w-5 h-5' />,
      description: 'Requieren firma',
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      highlight: stats.para_firmar > 0,
    },
    {
      title: 'Firmados',
      value: stats.firmados.toString(),
      icon: <FileText className='w-5 h-5' />,
      description: 'Completados',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-foreground mb-2'>Bienvenido, {user?.nombres}</h1>
          <p className='text-muted-foreground'>
            Aquí encontrarás todos los documentos que han sido enviados para ti
          </p>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {statsData.map((stat, index) => (
            <div
              key={index}
              className={`bg-card rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl border border-border ${
                stat.highlight ? 'ring-2 ring-amber-400/50' : ''
              }`}
            >
              <div className='flex items-start justify-between mb-4'>
                <div className={`p-3 ${stat.bgColor} rounded-xl ${stat.color}`}>{stat.icon}</div>
              </div>
              <div>
                <p className='text-muted-foreground text-sm font-medium mb-1'>{stat.title}</p>
                <p className='text-foreground text-3xl font-bold mb-1'>{stat.value}</p>
                <p className='text-muted-foreground text-xs'>{stat.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Documentos Recientes - Takes 2 columns */}
          <div className='lg:col-span-2'>
            <div className='bg-card rounded-2xl p-6 h-full border border-border'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-bold text-foreground'>Documentos Recientes</h2>
                <Link
                  href='/trabajador/tramites'
                  className='text-sm text-blue-600 dark:text-blue-400 hover:opacity-80 font-medium transition-colors'
                >
                  Ver todos →
                </Link>
              </div>

              {recentProcedures.length === 0 ? (
                <div className='text-center py-12'>
                  <FileText className='w-12 h-12 text-muted-foreground mx-auto mb-3' />
                  <p className='text-muted-foreground'>No hay documentos recientes</p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {recentProcedures.map((procedure) => (
                    <div
                      key={procedure.id_tramite}
                      className='bg-card rounded-xl p-4 border border-border hover:bg-muted transition-all duration-200 group'
                    >
                      <div className='flex items-start justify-between gap-4'>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 flex-wrap mb-2'>
                            <span className='text-foreground font-semibold text-sm'>
                              {procedure.codigo}
                            </span>
                            <ProcedureStateBadge estado={procedure.estado} />
                            {procedure.requiere_firma &&
                              procedure.estado !== PROCEDURE_STATES.FIRMADO && (
                                <span className='inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-rose-500/20 text-rose-300'>
                                  <PenTool className='w-3 h-3 mr-1' />
                                  Requiere Firma
                                </span>
                              )}
                            {procedure.observaciones_count !== undefined &&
                              procedure.observaciones_count > 0 && (
                                <span className='inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-500/20 text-purple-300'>
                                  <MessageSquare className='w-3 h-3 mr-1' />
                                  {procedure.observaciones_count}
                                </span>
                              )}
                          </div>
                          <p className='text-muted-foreground text-sm mb-2 line-clamp-1'>
                            {procedure.asunto}
                          </p>
                          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                            <span>
                              {procedure.remitente.nombres} {procedure.remitente.apellidos}
                            </span>
                            <span>•</span>
                            <span>{procedure.areaRemitente?.nombre}</span>
                            <span>•</span>
                            <span>
                              {format(new Date(procedure.fecha_envio), "d 'de' MMM, yyyy", {
                                locale: es,
                              })}
                            </span>
                          </div>
                        </div>
                        <Link href={`/trabajador/tramites/${procedure.id_tramite}`}>
                          <Button
                            variant={
                              procedure.estado === PROCEDURE_STATES.ENVIADO ? 'primary' : 'ghost'
                            }
                            size='sm'
                          >
                            {procedure.estado === PROCEDURE_STATES.ENVIADO
                              ? 'Ver ahora'
                              : 'Ver detalles'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className='space-y-4'>
            {/* Documentos para firmar */}
            <div className='bg-card rounded-2xl p-6 border border-border'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-3 bg-rose-500/10 rounded-xl'>
                  <PenTool className='w-5 h-5 text-rose-400' />
                </div>
                <h3 className='text-lg font-bold text-foreground'>Para Firmar</h3>
              </div>
              <div className='mb-4'>
                <p className='text-4xl font-bold text-foreground mb-1'>{stats.para_firmar}</p>
                <p className='text-muted-foreground text-sm'>Requieren tu firma electrónica</p>
              </div>
              <Link href='/trabajador/tramites?requiere_firma=true&estado=LEIDO' className='block'>
                <Button disabled={stats.para_firmar === 0} className='w-full'>
                  {stats.para_firmar > 0 ? 'Firmar ahora' : 'Sin pendientes'}
                </Button>
              </Link>
            </div>

            {/* Mis Observaciones */}
            <div className='bg-card rounded-2xl p-6 border border-border'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-3 bg-purple-500/10 rounded-xl'>
                  <MessageSquare className='w-5 h-5 text-purple-400' />
                </div>
                <h3 className='text-lg font-bold text-foreground'>Observaciones</h3>
              </div>
              <div className='mb-4'>
                <p className='text-4xl font-bold text-foreground mb-1'>
                  {stats.observaciones_pendientes}
                </p>
                <p className='text-muted-foreground text-sm'>Observaciones pendientes</p>
              </div>
              <Link href='/trabajador/observaciones' className='block'>
                <Button variant='outline' className='w-full'>
                  Ver observaciones
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

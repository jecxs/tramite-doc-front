'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProcedureStateBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTramites } from '@/hooks/useTramites';
import { getPendingObservations } from '@/lib/api/observaciones';
import { getEstadisticasGenerales, getActividadReciente } from '@/lib/api/estadisticas-responsable';
import type { EstadisticasGenerales, ActividadReciente, Observation } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = {
  primary: '#267992',
  secondary: '#122547',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

export default function ResponsableDashboard() {
  const { user } = useAuth();
  const { tramites, isLoading: tramitesLoading } = useTramites({
    pagina: 1,
    limite: 5,
    ordenar_por: 'fecha_envio',
    orden: 'desc',
  });

  const [estadisticas, setEstadisticas] = useState<EstadisticasGenerales | null>(null);
  const [actividad, setActividad] = useState<ActividadReciente | null>(null);
  const [observacionesPendientes, setObservacionesPendientes] = useState<Observation[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoadingStats(true);
        const [statsData, actividadData, observaciones] = await Promise.all([
          getEstadisticasGenerales(),
          getActividadReciente(),
          getPendingObservations(),
        ]);

        setEstadisticas(statsData);
        setActividad(actividadData);
        setObservacionesPendientes(observaciones);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  const statsCards = [
    {
      title: 'Trámites Enviados',
      value: estadisticas?.resumen.total_enviados || 0,
      icon: <Send className='w-6 h-6' />,
      description: 'Total este mes',
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      glowColor: 'shadow-blue-500/20',
    },
    {
      title: 'En Proceso',
      value: estadisticas?.resumen.pendientes || 0,
      icon: <Clock className='w-6 h-6' />,
      description: `${estadisticas?.resumen.porcentaje_pendientes.toFixed(1) || 0}% del total`,
      gradient: 'from-amber-500 via-orange-500 to-amber-600',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      glowColor: 'shadow-amber-500/20',
    },
    {
      title: 'Completados',
      value: estadisticas?.resumen.completados || 0,
      icon: <CheckCircle className='w-6 h-6' />,
      description: `${estadisticas?.resumen.porcentaje_completados.toFixed(1) || 0}% del total`,
      gradient: 'from-emerald-500 via-green-500 to-emerald-600',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      glowColor: 'shadow-emerald-500/20',
    },
    {
      title: 'Con Observaciones',
      value: observacionesPendientes.length,
      icon: <AlertCircle className='w-6 h-6' />,
      description: 'Requieren atención',
      gradient: 'from-red-500 via-pink-500 to-red-600',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      glowColor: 'shadow-red-500/20',
    },
  ];

  const actividadChartData =
    actividad?.actividad_diaria.map((item) => ({
      fecha: format(new Date(item.fecha), 'dd MMM', { locale: es }),
      cantidad: item.cantidad,
    })) || [];

  return (
    <div className='min-h-screen '>
      <div className='max-w-7xl mx-auto p-6 space-y-6'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8'
        >
          <div>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2'>
              Bienvenido, {user?.nombres}
            </h1>
            <p className='text-slate-400 flex items-center gap-2'>
              <Users className='w-4 h-4' />
              Área: {user?.area?.nombre || 'No asignada'}
            </p>
          </div>
          <Link href='/responsable/tramites/nuevo'>
            <Button className=' hover:from-blue-700 hover:to-purple-700 transition-all duration-300 border-0'>
              <Send className='w-4 h-4' />
              Enviar Documento
            </Button>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              custom={index}
              initial='hidden'
              animate='visible'
              variants={cardVariants}
            >
              <div className={`relative overflow-hidden rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300 group ${stat.glowColor} hover:shadow-xl`} style={{backgroundColor: '#272d34' }}>
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                <div className='relative flex items-start justify-between'>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-slate-400 mb-2'>{stat.title}</p>
                    <p className='text-4xl font-bold text-white mb-1'>
                      {isLoadingStats ? <span className='animate-pulse'>--</span> : stat.value}
                    </p>
                    <p className='text-xs text-slate-500'>{stat.description}</p>
                  </div>
                  <div className={`p-3 ${stat.iconBg} rounded-xl ${stat.iconColor} backdrop-blur-sm transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    {stat.icon}
                  </div>
                </div>

                {/* Animated border on hover */}
                <div className='absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Gráficos */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Actividad Reciente */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className='rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300'>
              <div className='p-6 border-b border-slate-700/50'>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-white'>
                  <div className='p-2 bg-blue-500/20 rounded-lg'>
                    <TrendingUp className='w-5 h-5 text-blue-400' />
                  </div>
                  Actividad de los últimos 7 días
                </h3>
              </div>
              <div className='p-6'>
                {isLoadingStats ? (
                  <div className='h-64 flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
                  </div>
                ) : (
                  <ResponsiveContainer width='100%' height={250}>
                    <LineChart data={actividadChartData}>
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray='3 3' stroke='#334155' strokeOpacity={0.3} />
                      <XAxis dataKey='fecha' stroke='#64748b' style={{ fontSize: '12px' }} />
                      <YAxis stroke='#64748b' style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#fff',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                        }}
                      />
                      <Line
                        type='monotone'
                        dataKey='cantidad'
                        stroke='#3b82f6'
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#1e293b' }}
                        activeDot={{ r: 7, strokeWidth: 2, stroke: '#1e293b' }}
                        fill="url(#colorGradient)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </motion.div>

          {/* Métricas de Rendimiento */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className='rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300'>
              <div className='p-6 border-b border-slate-700/50'>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-white'>
                  <div className='p-2 bg-emerald-500/20 rounded-lg'>
                    <BarChart3 className='w-5 h-5 text-emerald-400' />
                  </div>
                  Métricas de Rendimiento
                </h3>
              </div>
              <div className='p-6'>
                <div className='space-y-6'>
                  {/* Tiempo Promedio */}
                  <div>
                    <div className='flex items-center justify-between mb-3'>
                      <span className='text-sm font-medium text-slate-300'>
                        Tiempo Promedio de Respuesta
                      </span>
                      <span className='text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
                        {isLoadingStats
                          ? '--'
                          : estadisticas?.rendimiento.promedio_tiempo_respuesta_horas.toFixed(1)}
                        h
                      </span>
                    </div>
                    <div className='w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden'>
                      <div
                        className='bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/50'
                        style={{
                          width: `${Math.min((estadisticas?.rendimiento.promedio_tiempo_respuesta_horas || 0) * 2, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Tasa de Firmas */}
                  <div>
                    <div className='flex items-center justify-between mb-3'>
                      <span className='text-sm font-medium text-slate-300'>
                        Tasa de Firmas Completadas
                      </span>
                      <span className='text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent'>
                        {isLoadingStats
                          ? '--'
                          : estadisticas?.rendimiento.tasa_firmas_porcentaje.toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className='w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden'>
                      <div
                        className='bg-gradient-to-r from-emerald-500 to-green-500 h-2.5 rounded-full transition-all duration-500 shadow-lg shadow-emerald-500/50'
                        style={{
                          width: `${estadisticas?.rendimiento.tasa_firmas_porcentaje || 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div>
                    <div className='flex items-center justify-between mb-3'>
                      <span className='text-sm font-medium text-slate-300'>
                        Observaciones Pendientes
                      </span>
                      <span
                        className={`text-2xl font-bold bg-gradient-to-r ${
                          (estadisticas?.rendimiento.observaciones_pendientes || 0) > 5
                            ? 'from-red-400 to-pink-400'
                            : 'from-amber-400 to-orange-400'
                        } bg-clip-text text-transparent`}
                      >
                        {isLoadingStats ? '--' : estadisticas?.rendimiento.observaciones_pendientes}
                      </span>
                    </div>
                    <div className='w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden'>
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          (estadisticas?.rendimiento.observaciones_pendientes || 0) > 5
                            ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/50'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/50'
                        }`}
                        style={{
                          width: `${Math.min((estadisticas?.rendimiento.observaciones_pendientes || 0) * 10, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <Link href='/responsable/estadisticas'>
                    <Button variant='outline' className='w-full mt-4 bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300'>
                      Ver Estadísticas Detalladas
                      <ArrowRight className='w-4 h-4 ml-2' />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trámites Recientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className='rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300'>
            <div className='p-6 border-b border-slate-700/50 flex items-center justify-between'>
              <h3 className='flex items-center gap-2 text-lg font-semibold text-white'>
                <div className='p-2 bg-slate-500/20 rounded-lg'>
                  <FileText className='w-5 h-5 text-slate-400' />
                </div>
                Trámites Recientes
              </h3>
              <Link
                href='/responsable/tramites'
                className='text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-1 group'
              >
                Ver todos
                <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
              </Link>
            </div>
            <div>
              {tramitesLoading ? (
                <div className='p-8 flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
                </div>
              ) : tramites.length === 0 ? (
                <div className='text-center py-12'>
                  <FileText className='w-12 h-12 mx-auto mb-3 text-slate-600' />
                  <p className='text-slate-400'>No hay trámites recientes</p>
                </div>
              ) : (
                <div className='divide-y divide-slate-700/50'>
                  {tramites.map((tramite, index) => (
                    <motion.div
                      key={tramite.id_tramite}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className='p-4 hover:bg-slate-700/30 transition-all duration-200 group'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-3 mb-2'>
                            <span className='text-sm font-mono font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg'>
                              {tramite.codigo}
                            </span>
                            <ProcedureStateBadge estado={tramite.estado} />
                          </div>
                          <p className='text-sm font-medium text-white mb-1 truncate group-hover:text-blue-300 transition-colors'>
                            {tramite.asunto}
                          </p>
                          <p className='text-xs text-slate-500'>
                            Destinatario: {tramite.receptor.nombres} {tramite.receptor.apellidos} •{' '}
                            {format(new Date(tramite.fecha_envio), "dd 'de' MMMM, yyyy", {
                              locale: es,
                            })}
                          </p>
                        </div>
                        <Link href={`/responsable/tramites/${tramite.id_tramite}`}>
                          <Button variant='ghost' size='sm' className='ml-4 text-slate-400 hover:text-white hover:bg-slate-700/50'>
                            Ver
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Observaciones Pendientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className='rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300'>
            <div className='p-6 border-b border-slate-700/50'>
              <h3 className='flex items-center gap-2 text-lg font-semibold text-white'>
                <div className='p-2 bg-red-500/20 rounded-lg'>
                  <AlertCircle className='w-5 h-5 text-red-400' />
                </div>
                Observaciones Pendientes
                {observacionesPendientes.length > 0 && (
                  <span className='ml-2 px-3 py-1 text-xs font-semibold bg-red-500/20 text-red-400 rounded-full border border-red-500/30'>
                    {observacionesPendientes.length}
                  </span>
                )}
              </h3>
            </div>
            <div>
              {isLoadingStats ? (
                <div className='p-8 flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-red-500' />
                </div>
              ) : observacionesPendientes.length === 0 ? (
                <div className='text-center py-12'>
                  <CheckCircle className='w-12 h-12 mx-auto mb-3 text-emerald-600' />
                  <p className='text-slate-400'>No hay observaciones pendientes</p>
                  <p className='text-sm text-slate-500 mt-1'>¡Todo está al día!</p>
                </div>
              ) : (
                <div className='divide-y divide-slate-700/50'>
                  {observacionesPendientes.slice(0, 5).map((obs, index) => (
                    <motion.div
                      key={obs.id_observacion}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className='p-4 hover:bg-red-500/5 transition-all duration-200 group'
                    >
                      <div className='flex items-start gap-3'>
                        <div className='flex-shrink-0 w-2 h-2 mt-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse' />
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-white mb-1 group-hover:text-red-300 transition-colors'>
                            {obs.descripcion}
                          </p>
                          <p className='text-xs text-slate-500'>
                            {obs.creador?.nombres} {obs.creador?.apellidos} •{' '}
                            {format(new Date(obs.fecha_creacion), 'dd MMM yyyy', { locale: es })}
                          </p>
                        </div>
                        <Link href={`/responsable/observaciones/${obs.id_observacion}`}>
                          <Button variant='ghost' size='sm' className='text-slate-400 hover:text-white hover:bg-slate-700/50'>
                            Responder
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

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
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProcedureStateBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import {motion, Variants} from 'framer-motion';
import { formatearFechaSinZonaHoraria, formatearFechaHora } from '@/lib/date-utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTramites } from '@/hooks/useTramites';
import { getPendingObservations } from '@/lib/api/observaciones';
import { getEstadisticasGenerales, getActividadReciente } from '@/lib/api/estadisticas-responsable';
import type { EstadisticasGenerales, ActividadReciente, Observation } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


// Colores del tema
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
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Animación de las tarjetas
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: any) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  // Stats cards data
  const statsCards = [
    {
      title: 'Trámites Enviados',
      value: estadisticas?.resumen.total_enviados || 0,
      icon: <Send className="w-6 h-6" />,
      description: 'Total este mes',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      title: 'En Proceso',
      value: estadisticas?.resumen.pendientes || 0,
      icon: <Clock className="w-6 h-6" />,
      description: `${estadisticas?.resumen.porcentaje_pendientes.toFixed(1) || 0}% del total`,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-200 dark:border-amber-800',
    },
    {
      title: 'Completados',
      value: estadisticas?.resumen.completados || 0,
      icon: <CheckCircle className="w-6 h-6" />,
      description: `${estadisticas?.resumen.porcentaje_completados.toFixed(1) || 0}% del total`,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      title: 'Con Observaciones',
      value: observacionesPendientes.length,
      icon: <AlertCircle className="w-6 h-6" />,
      description: 'Requieren atención',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      iconColor: 'text-red-600 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-800',
    },
  ];

  const actividadChartData = actividad?.actividad_diaria.map(item => ({
    fecha: formatearFechaSinZonaHoraria(item.fecha, 'EEE dd'),
    cantidad: item.cantidad,
    fechaCompleta: formatearFechaSinZonaHoraria(item.fecha, "dd 'de' MMM"),
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-light">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
              Bienvenido, {user?.nombres}
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Área: {user?.area?.nombre || 'No asignada'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/responsable/tramites/nuevo">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all duration-300">
                <Send className="w-4 h-4" />
                Enviar Documento
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <Card className={`card-light-shadow card-hover-effect border-l-4 ${stat.borderColor} bg-card`}>
                <CardContent className="pt-6 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-foreground mb-2">
                        {isLoadingStats ? (
                          <span className="animate-pulse">--</span>
                        ) : (
                          stat.value
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                    <div className={`p-3 ${stat.bgColor} rounded-xl ${stat.iconColor} transform transition-transform duration-300 hover:scale-110`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Gráficos y Rendimiento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actividad Reciente - Gráfico de Líneas */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="card-light-shadow bg-card">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Actividad de los últimos 7 días
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoadingStats ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={actividadChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis
                        dataKey="fecha"
                        stroke="var(--color-muted-foreground)"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis
                        stroke="var(--color-muted-foreground)"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-popover)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          color: 'var(--color-foreground)',
                        }}
                        labelFormatter={(label) => {
                          const item = actividadChartData.find(d => d.fecha === label);
                          return item?.fechaCompleta || label;
                        }}
                        formatter={(value: any) => [`${value} acciones`, 'Actividad']}
                      />
                      <Line
                        type="monotone"
                        dataKey="cantidad"
                        stroke={COLORS.primary}
                        strokeWidth={3}
                        dot={{ fill: COLORS.primary, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Métricas de Rendimiento */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="card-light-shadow bg-card">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Métricas de Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Tiempo Promedio de Respuesta */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-foreground">
                                                Tiempo Promedio de Respuesta
                                            </span>
                      <span className="text-2xl font-bold text-foreground">
                                                {isLoadingStats ? '--' : estadisticas?.rendimiento.promedio_tiempo_respuesta_horas.toFixed(1)}h
                                            </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((estadisticas?.rendimiento.promedio_tiempo_respuesta_horas || 0) * 2, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Tasa de Firmas */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-foreground">
                                                Tasa de Firmas Completadas
                                            </span>
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                                {isLoadingStats ? '--' : estadisticas?.rendimiento.tasa_firmas_porcentaje.toFixed(1)}%
                                            </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${estadisticas?.rendimiento.tasa_firmas_porcentaje || 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Observaciones Pendientes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-foreground">
                                                Observaciones Pendientes
                                            </span>
                      <span className={`text-2xl font-bold ${
                        (estadisticas?.rendimiento.observaciones_pendientes || 0) > 5
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                                                {isLoadingStats ? '--' : estadisticas?.rendimiento.observaciones_pendientes}
                                            </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          (estadisticas?.rendimiento.observaciones_pendientes || 0) > 5
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600'
                        }`}
                        style={{
                          width: `${Math.min((estadisticas?.rendimiento.observaciones_pendientes || 0) * 10, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Botón Ver Estadísticas Detalladas */}
                  <Link href="/responsable/estadisticas">
                    <Button variant="outline" className="w-full mt-4 border-border hover:bg-accent">
                      Ver Estadísticas Detalladas →
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Trámites Recientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="card-light-shadow bg-card">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <FileText className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  Trámites Recientes
                </CardTitle>
                <Link
                  href="/responsable/tramites"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors flex items-center gap-1"
                >
                  Ver todos
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {tramitesLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : tramites.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay trámites recientes</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {tramites.map((tramite, index) => (
                    <motion.div
                      key={tramite.id_tramite}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-sm font-mono font-semibold text-foreground">
                                                            {tramite.codigo}
                                                        </span>
                            <ProcedureStateBadge estado={tramite.estado} />
                          </div>
                          <p className="text-sm font-medium text-foreground mb-1 truncate">
                            {tramite.asunto}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Destinatario: {tramite.receptor.nombres} {tramite.receptor.apellidos} •{' '}
                            {formatearFechaHora(tramite.fecha_envio, "dd 'de' MMMM, yyyy")}
                          </p>
                        </div>
                        <Link href={`/responsable/tramites/${tramite.id_tramite}`}>
                          <Button variant="ghost" size="sm" className="ml-4">
                            Ver
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Observaciones Pendientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="card-light-shadow bg-card">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                Observaciones Pendientes
                {observacionesPendientes.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-200 rounded-full">
                                        {observacionesPendientes.length}
                                    </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingStats ? (
                <div className="p-8 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
                </div>
              ) : observacionesPendientes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay observaciones pendientes</p>
                  <p className="text-sm mt-1">¡Todo está al día!</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {observacionesPendientes.slice(0, 5).map((obs, index) => (
                    <motion.div
                      key={obs.id_observacion}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="p-4 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 mt-2 bg-red-500 rounded-full" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground mb-1">
                            {obs.descripcion}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {obs.creador?.nombres} {obs.creador?.apellidos} •{' '}
                            {formatearFechaHora(obs.fecha_creacion, "dd MMM yyyy")}
                          </p>
                        </div>
                        <Link href={`/responsable/observaciones/${obs.id_observacion}`}>
                          <Button variant="ghost" size="sm">
                            Responder
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

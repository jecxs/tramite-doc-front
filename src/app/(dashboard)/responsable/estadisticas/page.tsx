/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import GraficoBarras from '@/components/estadisticas/GraficoBarras';
import GraficoLineas from '@/components/estadisticas/GraficoLineas';
import GraficoPastel from '@/components/estadisticas/GraficoPastel';
import Loading from '@/components/ui/Loading';
import {
  getEstadisticasGenerales,
  getEstadisticasPorPeriodo,
  getEstadisticasPorTrabajador,
  getEstadisticasTiposDocumentos,
  getRankingEficiencia,
  getTiemposRespuesta,
} from '@/lib/api/estadisticas-responsable';
import { exportarEstadisticasAPDF } from '@/lib/utils/pdf-export-stats';
import {
  EstadisticasGenerales,
  EstadisticasPorPeriodo,
  EstadisticasPorTrabajador,
  EstadisticasTiposDocumentos,
  RankingEficiencia,
  TiemposRespuesta,
} from '@/types';
import {
  AlertCircle,
  Award,
  CheckCircle,
  Clock,
  FileDown,
  FileText,
  Send,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type PeriodoType = 'semana' | 'mes' | 'trimestre' | 'anio';

// Componente de Card Flotante con tokens del tema (light/dark)
const FloatingCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-card rounded-3xl p-6 shadow-2xl border border-border ${className}`}>
    {children}
  </div>
);

// Componente StatCard mejorado con el nuevo estilo
const ModernStatCard = ({ titulo, valor, descripcion, icono: Icon, gradient }: any) => (
  <FloatingCard className='relative overflow-hidden'>
    <div className='relative z-10'>
      <div className='flex items-start justify-between mb-4'>
        <div className={`p-3 rounded-2xl ${gradient} bg-opacity-20`}>
          <Icon className='w-6 h-6 text-foreground' />
        </div>
      </div>
      <div className='space-y-1'>
        <p className='text-muted-foreground text-sm font-medium'>{titulo}</p>
        <p className='text-foreground text-3xl font-bold'>{valor}</p>
        <p className='text-muted-foreground text-xs'>{descripcion}</p>
      </div>
    </div>
  </FloatingCard>
);

export default function EstadisticasPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [periodo, setPeriodo] = useState<PeriodoType>('mes');

  const [generales, setGenerales] = useState<EstadisticasGenerales | null>(null);
  const [porPeriodo, setPorPeriodo] = useState<EstadisticasPorPeriodo | null>(null);
  const [porTrabajador, setPorTrabajador] = useState<EstadisticasPorTrabajador | null>(null);
  const [tiempos, setTiempos] = useState<TiemposRespuesta | null>(null);
  const [tiposDocumentos, setTiposDocumentos] = useState<EstadisticasTiposDocumentos | null>(null);
  const [ranking, setRanking] = useState<RankingEficiencia | null>(null);

  useEffect(() => {
    cargarEstadisticas();
  }, [periodo]);

  const cargarEstadisticas = async () => {
    try {
      setIsLoading(true);
      const [
        dataGenerales,
        dataPorPeriodo,
        dataPorTrabajador,
        dataTiempos,
        dataTiposDocumentos,
        dataRanking,
      ] = await Promise.all([
        getEstadisticasGenerales(),
        getEstadisticasPorPeriodo(periodo),
        getEstadisticasPorTrabajador(),
        getTiemposRespuesta(),
        getEstadisticasTiposDocumentos(),
        getRankingEficiencia(),
      ]);

      setGenerales(dataGenerales);
      setPorPeriodo(dataPorPeriodo);
      setPorTrabajador(dataPorTrabajador);
      setTiempos(dataTiempos);
      setTiposDocumentos(dataTiposDocumentos);
      setRanking(dataRanking);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading label='Cargando estadísticas...' height='h-96' />;
  }
  const handleExportarPDF = async () => {
    try {
      await exportarEstadisticasAPDF({
        generales,
        porPeriodo,
        porTrabajador,
        tiempos,
        tiposDocumentos,
        ranking,
        periodo,
      });
    } catch (error) {
      console.error('Error exportando PDF:', error);
      // Aquí podrías mostrar un toast de error
    }
  };
  const datosEstados =
    porPeriodo?.distribucion_estados.map((item) => ({
      name: item.estado,
      value: item.cantidad,
    })) || [];

  const datosTipos =
    tiposDocumentos?.distribucion.map((item) => ({
      nombre: item.nombre,
      valor: item.total,
    })) || [];

  return (
    <div className='min-h-screen p-8'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-4xl font-bold text-foreground mb-2'>Estadísticas</h1>
            <p className='text-muted-foreground'>Panel de control y análisis de trámites</p>
          </div>

          <div className='flex gap-3'>
            {/* BOTÓN DE EXPORTAR PDF */}
            <button
              onClick={handleExportarPDF}
              disabled={isLoading}
              className='flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all bg-gradient-to-r from-purple-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <FileDown className='w-4 h-4' />
              Exportar PDF
            </button>

            {/* Botones de período existentes */}
            <div className='flex gap-2'>
              {(['semana', 'mes', 'trimestre', 'anio'] as PeriodoType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    periodo === p
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
                  }`}
                >
                  {p === 'semana' && 'Semana'}
                  {p === 'mes' && 'Mes'}
                  {p === 'trimestre' && 'Trimestre'}
                  {p === 'anio' && 'Año'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className='grid grid-cols-12 gap-6'>
        {/* Stats cards principales */}
        <div className='col-span-12 lg:col-span-3'>
          <ModernStatCard
            titulo='Total Enviados'
            valor={generales?.resumen.total_enviados || 0}
            descripcion={`${generales?.resumen.porcentaje_completados.toFixed(1)}% completados`}
            icono={Send}
            gradient='bg-gradient-to-br from-blue-500 to-blue-700'
          />
        </div>

        <div className='col-span-12 lg:col-span-3'>
          <ModernStatCard
            titulo='Pendientes'
            valor={generales?.resumen.pendientes || 0}
            descripcion={`${generales?.resumen.porcentaje_pendientes.toFixed(1)}% del total`}
            icono={Clock}
            gradient='bg-gradient-to-br from-yellow-500 to-orange-600'
          />
        </div>

        <div className='col-span-12 lg:col-span-3'>
          <ModernStatCard
            titulo='Completados'
            valor={generales?.resumen.completados || 0}
            descripcion='Finalizados exitosamente'
            icono={CheckCircle}
            gradient='bg-gradient-to-br from-green-500 to-emerald-600'
          />
        </div>

        <div className='col-span-12 lg:col-span-3'>
          <ModernStatCard
            titulo='Observaciones'
            valor={generales?.rendimiento.observaciones_pendientes || 0}
            descripcion='Pendientes de resolver'
            icono={AlertCircle}
            gradient='bg-gradient-to-br from-red-500 to-pink-600'
          />
        </div>

        {/* Gráficos principales */}
        <div className='col-span-12 lg:col-span-8 '>
          <FloatingCard className='bg-card'>
            <h3 className='text-foreground text-xl font-bold mb-6'>Tendencia de Trámites</h3>
            <GraficoLineas data={porPeriodo?.datos_grafico || []} altura={300} />
          </FloatingCard>
        </div>

        <div className='col-span-12 lg:col-span-4'>
          <FloatingCard className='bg-card'>
            <h3 className='text-foreground text-xl font-bold mb-4'>Distribución por Estados</h3>
            <GraficoPastel data={datosEstados} altura={300} />
          </FloatingCard>
        </div>

        {/* Métricas de rendimiento compactas */}
        <div className='col-span-12 lg:col-span-4'>
          <FloatingCard>
            <div className='flex items-center gap-4 mb-3'>
              <div className='p-3 rounded-2xl bg-purple-500 bg-opacity-20'>
                <TrendingUp className='w-5 h-5 text-purple-400' />
              </div>
              <div>
                <p className='text-gray-400 text-xs'>Tiempo Promedio</p>
                <p className='text-foreground text-2xl font-bold'>
                  {generales?.rendimiento.promedio_tiempo_respuesta_horas.toFixed(1)}h
                </p>
              </div>
            </div>
            <p className='text-gray-500 text-xs'>Desde envío hasta lectura</p>
          </FloatingCard>
        </div>

        <div className='col-span-12 lg:col-span-4'>
          <FloatingCard>
            <div className='flex items-center gap-4 mb-3'>
              <div className='p-3 rounded-2xl bg-indigo-500 bg-opacity-20'>
                <FileText className='w-5 h-5 text-indigo-400' />
              </div>
              <div>
                <p className='text-gray-400 text-xs'>Tasa de Firmas</p>
                <p className='text-foreground text-2xl font-bold'>
                  {generales?.rendimiento.tasa_firmas_porcentaje.toFixed(1)}%
                </p>
              </div>
            </div>
            <p className='text-gray-500 text-xs'>Documentos firmados</p>
          </FloatingCard>
        </div>

        <div className='col-span-12 lg:col-span-4'>
          <FloatingCard>
            <div className='flex items-center gap-4 mb-3'>
              <div className='p-3 rounded-2xl bg-teal-500 bg-opacity-20'>
                <Users className='w-5 h-5 text-teal-400' />
              </div>
              <div>
                <p className='text-gray-400 text-xs'>Trabajadores Activos</p>
                <p className='text-foreground text-2xl font-bold'>
                  {porTrabajador?.total_trabajadores || 0}
                </p>
              </div>
            </div>
            <p className='text-gray-500 text-xs'>En el área</p>
          </FloatingCard>
        </div>

        {/* Tipos de documentos */}
        <div className='col-span-12'>
          <FloatingCard className='bg-card'>
            <h3 className='text-foreground text-xl font-bold mb-6'>Tipos de Documentos Enviados</h3>
            <GraficoBarras data={datosTipos} altura={300} color='#3b82f6' />
          </FloatingCard>
        </div>

        {/* Rankings */}
        <div className='col-span-12 lg:col-span-6'>
          <FloatingCard>
            <div className='flex items-center gap-3 mb-6'>
              <Award className='w-6 h-6 text-yellow-400' />
              <h3 className='text-xl font-bold'>Top Trabajadores - % Completado</h3>
            </div>
            <div className='space-y-3'>
              {ranking?.top_completado.slice(0, 5).map((trabajador, index) => (
                <div
                  key={trabajador.id_usuario}
                  className='flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-border hover:border-purple-500 transition-all'
                >
                  <div className='flex items-center gap-4'>
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm ${
                        index === 0
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900'
                          : index === 1
                            ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900'
                            : index === 2
                              ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                              : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className='font-medium text-foreground'>{trabajador.nombre_completo}</p>
                      <p className='text-sm text-gray-400'>
                        {trabajador.completados} de {trabajador.total_recibidos} trámites
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-xl font-bold text-green-400'>
                      {trabajador.porcentaje_completado.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FloatingCard>
        </div>

        <div className='col-span-12 lg:col-span-6'>
          <FloatingCard>
            <div className='flex items-center gap-3 mb-6'>
              <Zap className='w-6 h-6 text-purple-400' />
              <h3 className='text-xl font-bold'>Top Trabajadores - Velocidad</h3>
            </div>
            <div className='space-y-3'>
              {ranking?.top_velocidad.slice(0, 5).map((trabajador, index) => (
                <div
                  key={trabajador.id_usuario}
                  className='flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-border hover:border-purple-500 transition-all'
                >
                  <div className='flex items-center gap-4'>
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm ${
                        index === 0
                          ? 'bg-gradient-to-br from-purple-400 to-purple-600'
                          : index === 1
                            ? 'bg-gradient-to-br from-purple-300 to-purple-500 text-white'
                            : index === 2
                              ? 'bg-gradient-to-br from-purple-200 to-purple-400 text-gray-900'
                              : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className='font-medium text-foreground'>{trabajador.nombre_completo}</p>
                      <p className='text-sm text-gray-400'>Promedio de respuesta</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-xl font-bold text-blue-400'>
                      {trabajador.promedio_tiempo_respuesta_horas.toFixed(1)}h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FloatingCard>
        </div>

        {/* Análisis de tiempos */}
        <div className='col-span-12'>
          <FloatingCard className='bg-card'>
            <h3 className='text-foreground text-xl font-bold mb-6'>
              Análisis de Tiempos de Procesamiento
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='p-5 bg-muted/50 rounded-2xl border border-blue-500/20'>
                <p className='text-gray-400 text-sm mb-2'>Envío → Apertura</p>
                <p className='text-3xl font-bold text-blue-400 mb-2'>
                  {tiempos?.envio_a_apertura.promedio.toFixed(1)}h
                </p>
                <p className='text-xs text-gray-500'>
                  Rango: {tiempos?.envio_a_apertura.minimo.toFixed(1)}h -{' '}
                  {tiempos?.envio_a_apertura.maximo.toFixed(1)}h
                </p>
              </div>
              <div className='p-5 bg-muted/50 rounded-2xl border border-purple-500/20'>
                <p className='text-gray-400 text-sm mb-2'>Apertura → Lectura</p>
                <p className='text-3xl font-bold text-purple-400 mb-2'>
                  {tiempos?.apertura_a_lectura.promedio.toFixed(1)}h
                </p>
                <p className='text-xs text-gray-500'>
                  Rango: {tiempos?.apertura_a_lectura.minimo.toFixed(1)}h -{' '}
                  {tiempos?.apertura_a_lectura.maximo.toFixed(1)}h
                </p>
              </div>
              <div className='p-5 bg-muted/50 rounded-2xl border border-green-500/20'>
                <p className='text-gray-400 text-sm mb-2'>Lectura → Firma</p>
                <p className='text-3xl font-bold text-green-400 mb-2'>
                  {tiempos?.lectura_a_firma.promedio.toFixed(1)}h
                </p>
                <p className='text-xs text-gray-500'>
                  Rango: {tiempos?.lectura_a_firma.minimo.toFixed(1)}h -{' '}
                  {tiempos?.lectura_a_firma.maximo.toFixed(1)}h
                </p>
              </div>
              <div className='p-5 bg-muted/50 rounded-2xl border border-indigo-500/20'>
                <p className='text-gray-400 text-sm mb-2'>Tiempo Total</p>
                <p className='text-3xl font-bold text-indigo-400 mb-2'>
                  {tiempos?.tiempo_total.promedio.toFixed(1)}h
                </p>
                <p className='text-xs text-gray-500'>
                  Basado en {tiempos?.total_muestras} muestras
                </p>
              </div>
            </div>
          </FloatingCard>
        </div>
      </div>
    </div>
  );
}

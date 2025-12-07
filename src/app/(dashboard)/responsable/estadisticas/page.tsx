/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatCard from '@/components/estadisticas/StatCard';
import GraficoLineas from '@/components/estadisticas/GraficoLineas';
import GraficoBarras from '@/components/estadisticas/GraficoBarras';
import GraficoPastel from '@/components/estadisticas/GraficoPastel';
import { FileText, Send, CheckCircle, Clock, TrendingUp, Users, AlertCircle } from 'lucide-react';
import {
  getEstadisticasGenerales,
  getEstadisticasPorPeriodo,
  getEstadisticasPorTrabajador,
  getTiemposRespuesta,
  getEstadisticasTiposDocumentos,
  getRankingEficiencia,
} from '@/lib/api/estadisticas-responsable';
import {
  EstadisticasGenerales,
  EstadisticasPorPeriodo,
  EstadisticasPorTrabajador,
  TiemposRespuesta,
  EstadisticasTiposDocumentos,
  RankingEficiencia,
} from '@/types';

type PeriodoType = 'semana' | 'mes' | 'trimestre' | 'anio';

export default function EstadisticasPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [periodo, setPeriodo] = useState<PeriodoType>('mes');

  // Estados para cada tipo de estadística
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
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='text-gray-600 mt-4'>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  // Preparar datos para gráficos
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
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Estadísticas</h1>
          <p className='text-gray-600 mt-1'>Panel de control y análisis de trámites</p>
        </div>
        <div className='flex gap-2'>
          {(['semana', 'mes', 'trimestre', 'anio'] as PeriodoType[]).map((p) => (
            <Button
              key={p}
              variant={periodo === p ? 'primary' : 'outline'}
              size='sm'
              onClick={() => setPeriodo(p)}
            >
              {p === 'semana' && 'Semana'}
              {p === 'mes' && 'Mes'}
              {p === 'trimestre' && 'Trimestre'}
              {p === 'anio' && 'Año'}
            </Button>
          ))}
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatCard
          titulo='Total Enviados'
          valor={generales?.resumen.total_enviados || 0}
          descripcion={`${generales?.resumen.porcentaje_completados.toFixed(1)}% completados`}
          icono={Send}
          colorIcono='text-blue-600'
        />
        <StatCard
          titulo='Pendientes'
          valor={generales?.resumen.pendientes || 0}
          descripcion={`${generales?.resumen.porcentaje_pendientes.toFixed(1)}% del total`}
          icono={Clock}
          colorIcono='text-yellow-600'
        />
        <StatCard
          titulo='Completados'
          valor={generales?.resumen.completados || 0}
          descripcion='Finalizados exitosamente'
          icono={CheckCircle}
          colorIcono='text-green-600'
        />
        <StatCard
          titulo='Observaciones'
          valor={generales?.rendimiento.observaciones_pendientes || 0}
          descripcion='Pendientes de resolver'
          icono={AlertCircle}
          colorIcono='text-red-600'
        />
      </div>

      {/* Gráficos principales */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Tendencia temporal */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Trámites</CardTitle>
          </CardHeader>
          <CardContent>
            <GraficoLineas data={porPeriodo?.datos_grafico || []} altura={300} />
          </CardContent>
        </Card>

        {/* Distribución por estados */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estados</CardTitle>
          </CardHeader>
          <CardContent>
            <GraficoPastel data={datosEstados} altura={300} />
          </CardContent>
        </Card>
      </div>

      {/* Rendimiento */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <StatCard
          titulo='Tiempo Promedio de Respuesta'
          valor={`${generales?.rendimiento.promedio_tiempo_respuesta_horas.toFixed(1)}h`}
          descripcion='Desde envío hasta lectura'
          icono={TrendingUp}
          colorIcono='text-purple-600'
        />
        <StatCard
          titulo='Tasa de Firmas'
          valor={`${generales?.rendimiento.tasa_firmas_porcentaje.toFixed(1)}%`}
          descripcion='Documentos firmados'
          icono={FileText}
          colorIcono='text-indigo-600'
        />
        <StatCard
          titulo='Trabajadores Activos'
          valor={porTrabajador?.total_trabajadores || 0}
          descripcion='En el área'
          icono={Users}
          colorIcono='text-teal-600'
        />
      </div>

      {/* Tipos de documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Documentos Enviados</CardTitle>
        </CardHeader>
        <CardContent>
          <GraficoBarras data={datosTipos} altura={300} color='#3b82f6' />
        </CardContent>
      </Card>

      {/* Ranking de trabajadores */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Top por completado */}
        <Card>
          <CardHeader>
            <CardTitle>Top Trabajadores - % Completado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {ranking?.top_completado.slice(0, 5).map((trabajador, index) => (
                <div
                  key={trabajador.id_usuario}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-bold'>
                      {index + 1}
                    </div>
                    <div>
                      <p className='font-medium text-gray-900'>{trabajador.nombre_completo}</p>
                      <p className='text-sm text-gray-500'>
                        {trabajador.completados} de {trabajador.total_recibidos} trámites
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-lg font-bold text-green-600'>
                      {trabajador.porcentaje_completado.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top por velocidad */}
        <Card>
          <CardHeader>
            <CardTitle>Top Trabajadores - Velocidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {ranking?.top_velocidad.slice(0, 5).map((trabajador, index) => (
                <div
                  key={trabajador.id_usuario}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full font-bold'>
                      {index + 1}
                    </div>
                    <div>
                      <p className='font-medium text-gray-900'>{trabajador.nombre_completo}</p>
                      <p className='text-sm text-gray-500'>Promedio de respuesta</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-lg font-bold text-blue-600'>
                      {trabajador.promedio_tiempo_respuesta_horas.toFixed(1)}h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tiempos detallados */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Tiempos de Procesamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='p-4 bg-blue-50 rounded-lg'>
              <p className='text-sm text-gray-600 mb-1'>Envío → Apertura</p>
              <p className='text-2xl font-bold text-blue-700'>
                {tiempos?.envio_a_apertura.promedio.toFixed(1)}h
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                Rango: {tiempos?.envio_a_apertura.minimo.toFixed(1)}h -{' '}
                {tiempos?.envio_a_apertura.maximo.toFixed(1)}h
              </p>
            </div>
            <div className='p-4 bg-purple-50 rounded-lg'>
              <p className='text-sm text-gray-600 mb-1'>Apertura → Lectura</p>
              <p className='text-2xl font-bold text-purple-700'>
                {tiempos?.apertura_a_lectura.promedio.toFixed(1)}h
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                Rango: {tiempos?.apertura_a_lectura.minimo.toFixed(1)}h -{' '}
                {tiempos?.apertura_a_lectura.maximo.toFixed(1)}h
              </p>
            </div>
            <div className='p-4 bg-green-50 rounded-lg'>
              <p className='text-sm text-gray-600 mb-1'>Lectura → Firma</p>
              <p className='text-2xl font-bold text-green-700'>
                {tiempos?.lectura_a_firma.promedio.toFixed(1)}h
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                Rango: {tiempos?.lectura_a_firma.minimo.toFixed(1)}h -{' '}
                {tiempos?.lectura_a_firma.maximo.toFixed(1)}h
              </p>
            </div>
            <div className='p-4 bg-indigo-50 rounded-lg'>
              <p className='text-sm text-gray-600 mb-1'>Tiempo Total</p>
              <p className='text-2xl font-bold text-indigo-700'>
                {tiempos?.tiempo_total.promedio.toFixed(1)}h
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                Basado en {tiempos?.total_muestras} muestras
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

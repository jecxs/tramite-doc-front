'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  Calendar,
  FileText,
  Download,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  PieChart,
  List,
  Eye,
  FileCheck,
  FileSignature,
  MessageSquare,
  Ban,
} from 'lucide-react';
import { generarReportePersonalizado } from '@/lib/api/reportes-responsable';
import { getDocumentTypes } from '@/lib/api/document-type';
import { getAreas } from '@/lib/api/areas';
import { getProcedures } from '@/lib/api/tramites';
import { FiltrosReporte, ReportePersonalizado, DocumentType, Area, Procedure, ProcedureFilters } from '@/types';
import Loading from '@/components/ui/Loading';
import GraficoLineas from '@/components/estadisticas/GraficoLineas';
import GraficoPastel from '@/components/estadisticas/GraficoPastel';
import { exportarReporteAPDF } from '@/lib/utils/pdf-export-reportes';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES, PROCEDURE_STATES, PROCEDURE_STATE_LABELS } from '@/lib/constants';
import { formatearFechaSinZonaHoraria } from '@/lib/date-utils';

interface FormularioFiltrosReporte {
  fecha_inicio: string;
  fecha_fin?: string;
  id_tipo_documento?: string;
  id_area?: string;
}

// Función helper para calcular diferencia de días
const calcularDiferenciaEnDias = (fechaInicio: string, fechaFin?: string): number => {
  const inicio = new Date(fechaInicio);
  const fin = fechaFin ? new Date(fechaFin) : new Date(fechaInicio);
  const diferencia = Math.abs(fin.getTime() - inicio.getTime());
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24)) + 1;
};

const FloatingCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card rounded-3xl p-6 shadow-2xl border border-border ${className}`}>
    {children}
  </div>
);

interface MetricCardProps {
  titulo: string;
  valor: number | string;
  icono: React.ComponentType<{ className?: string }>;
  color: string;
  subtitulo?: string;
}

const MetricCard = ({
                      titulo,
                      valor,
                      icono: Icon,
                      color,
                      subtitulo
                    }: MetricCardProps) => (
  <FloatingCard>
    <div className='flex items-start justify-between mb-2'>
      <div className={`p-3 rounded-2xl ${color} bg-opacity-20`}>
        <Icon className='w-6 h-6' />
      </div>
    </div>
    <div className='space-y-1'>
      <p className='text-muted-foreground text-sm font-medium'>{titulo}</p>
      <p className='text-foreground text-3xl font-bold'>{valor}</p>
      {subtitulo && <p className='text-muted-foreground text-xs'>{subtitulo}</p>}
    </div>
  </FloatingCard>
);

export default function ReportesPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes(ROLES.ADMIN);

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoadingTramites, setIsLoadingTramites] = useState(false);
  const [reporte, setReporte] = useState<ReportePersonalizado | null>(null);
  const [tramitesDetalle, setTramitesDetalle] = useState<Procedure[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<DocumentType[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormularioFiltrosReporte>();

  const watchFechaInicio = watch('fecha_inicio');
  const watchFechaFin = watch('fecha_fin');

  // Calcular número de días en el reporte
  const diasEnReporte = useMemo(() => {
    if (!reporte) return 0;
    if (reporte.periodo.fecha_inicio === 'N/A') return 0;

    return calcularDiferenciaEnDias(
      reporte.periodo.fecha_inicio,
      reporte.periodo.fecha_fin !== 'N/A' ? reporte.periodo.fecha_fin : undefined
    );
  }, [reporte]);

  // Cargar tipos de documento y áreas al montar
  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        const [tipos, areasData] = await Promise.all([
          getDocumentTypes(),
          isAdmin ? getAreas() : Promise.resolve([]),
        ]);
        setTiposDocumento(tipos);
        setAreas(areasData);
      } catch (error) {
        console.error('Error cargando opciones:', error);
      }
    };

    cargarOpciones();
  }, [isAdmin]);

  // Cargar trámites detallados cuando se genera el reporte
  const cargarTramitesDetalle = async (filtros: FiltrosReporte) => {
    try {
      setIsLoadingTramites(true);

      const [year, month, day] = filtros.fecha_inicio.split('-').map(Number);

      const fecha_inicio_utc = new Date(Date.UTC(year, month - 1, day, 5, 0, 0, 0));

      let fecha_fin_utc: Date;
      if (filtros.fecha_fin) {
        const [yearFin, monthFin, dayFin] = filtros.fecha_fin.split('-').map(Number);
        fecha_fin_utc = new Date(Date.UTC(yearFin, monthFin - 1, dayFin + 1, 4, 59, 59, 999));
      } else {
        fecha_fin_utc = new Date(Date.UTC(year, month - 1, day + 1, 4, 59, 59, 999));
      }

      const filtrosProcedures: ProcedureFilters = {
        fecha_envio_desde: fecha_inicio_utc.toISOString(),
        fecha_envio_hasta: fecha_fin_utc.toISOString(),
        limite: 1000,
      };

      if (filtros.id_tipo_documento) {
        filtrosProcedures.id_tipo_documento = filtros.id_tipo_documento;
      }

      if (filtros.id_area && isAdmin) {
        filtrosProcedures.id_area_remitente = filtros.id_area;
      }

      console.log('🔍 [FRONTEND] Filtros enviados a getProcedures:', {
        ...filtrosProcedures,
        fecha_envio_desde_readable: fecha_inicio_utc.toISOString(),
        fecha_envio_hasta_readable: fecha_fin_utc.toISOString(),
      });

      const response = await getProcedures(filtrosProcedures);

      console.log('✅ [FRONTEND] Trámites recibidos:', response.data.length);

      setTramitesDetalle(response.data);
    } catch (error) {
      console.error('❌ [FRONTEND] Error cargando trámites:', error);
      setTramitesDetalle([]);
    } finally {
      setIsLoadingTramites(false);
    }
  };

  const onSubmit = async (data: FormularioFiltrosReporte) => {
    try {
      setIsLoading(true);

      // Construir filtros - solo incluir campos con valores
      const filtrosAjustados: FiltrosReporte = {
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin || data.fecha_inicio,
      };

      // Solo agregar id_tipo_documento si tiene un valor válido
      if (data.id_tipo_documento && data.id_tipo_documento.trim() !== '') {
        filtrosAjustados.id_tipo_documento = data.id_tipo_documento;
      }

      // Solo agregar id_area si tiene un valor válido
      if (data.id_area && data.id_area.trim() !== '') {
        filtrosAjustados.id_area = data.id_area;
      }

      console.log('📊 [FRONTEND] Generando reporte con filtros:', filtrosAjustados);

      const reporteData = await generarReportePersonalizado(filtrosAjustados);

      console.log('✅ [FRONTEND] Reporte generado:', {
        total_enviados: reporteData.resumen.total_enviados,
        periodo: reporteData.periodo,
      });

      setReporte(reporteData);

      // Cargar trámites detallados
      await cargarTramitesDetalle(filtrosAjustados);
    } catch (error) {
      console.error('❌ [FRONTEND] Error generando reporte:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportarPDF = async () => {
    if (!reporte) return;

    try {
      setIsGeneratingPDF(true);
      await exportarReporteAPDF(reporte, tramitesDetalle);
    } catch (error) {
      console.error('Error exportando PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleLimpiarFiltros = () => {
    reset();
    setReporte(null);
    setTramitesDetalle([]);
  };

  // Preparar datos para gráficos según el número de días
  const datosDistribucionDiaria = useMemo(() => {
    if (!reporte || diasEnReporte <= 1) return [];

    return reporte.distribucion_por_dia.map((d) => ({
      fecha: formatearFechaSinZonaHoraria(d.fecha),
      cantidad: d.enviados,
    }));
  }, [reporte, diasEnReporte]);

  const datosEstados = useMemo(() => {
    if (!reporte) return [];

    return [
      { name: 'Pendientes', value: reporte.resumen.total_pendientes, color: '#f59e0b' },
      { name: 'Abiertos', value: reporte.resumen.total_abiertos, color: '#3b82f6' },
      { name: 'Leídos', value: reporte.resumen.total_leidos, color: '#8b5cf6' },
      { name: 'Firmados', value: reporte.resumen.total_firmados, color: '#10b981' },
      { name: 'Respondidos', value: reporte.resumen.total_respondidos, color: '#06b6d4' },
      { name: 'Anulados', value: reporte.resumen.total_anulados, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [reporte]);

  // Función para obtener el icono del estado
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case PROCEDURE_STATES.ENVIADO:
        return <Clock className='w-4 h-4 text-yellow-500' />;
      case PROCEDURE_STATES.ENTREGADO:
        return <CheckCircle className='w-4 h-4 text-blue-500' />;
      case PROCEDURE_STATES.ABIERTO:
        return <Eye className='w-4 h-4 text-indigo-500' />;
      case PROCEDURE_STATES.LEIDO:
        return <FileCheck className='w-4 h-4 text-purple-500' />;
      case PROCEDURE_STATES.FIRMADO:
        return <FileSignature className='w-4 h-4 text-green-500' />;
      case PROCEDURE_STATES.RESPONDIDO:
        return <MessageSquare className='w-4 h-4 text-cyan-500' />;
      case PROCEDURE_STATES.ANULADO:
        return <Ban className='w-4 h-4 text-red-500' />;
      default:
        return <FileText className='w-4 h-4 text-gray-500' />;
    }
  };

  // Función para obtener el color del badge del estado
  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case PROCEDURE_STATES.ENVIADO:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case PROCEDURE_STATES.ENTREGADO:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case PROCEDURE_STATES.ABIERTO:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case PROCEDURE_STATES.LEIDO:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case PROCEDURE_STATES.FIRMADO:
        return 'bg-green-100 text-green-800 border-green-200';
      case PROCEDURE_STATES.RESPONDIDO:
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case PROCEDURE_STATES.ANULADO:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className='min-h-screen p-8'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-4xl font-bold text-foreground mb-2'>Reportes Personalizados</h1>
            <p className='text-muted-foreground'>
              Genera reportes específicos con filtros personalizados y visualiza métricas detalladas
            </p>
          </div>

          {reporte && (
            <button
              onClick={handleExportarPDF}
              disabled={isGeneratingPDF}
              className='flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all bg-gradient-to-r from-purple-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <Download className='w-5 h-5' />
              {isGeneratingPDF ? 'Generando PDF...' : 'Exportar PDF'}
            </button>
          )}
        </div>
      </div>

      {/* Formulario de Filtros */}
      <FloatingCard className='mb-8'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='flex items-center gap-3 mb-4'>
            <Calendar className='w-6 h-6 text-primary' />
            <h2 className='text-xl font-bold text-foreground'>Filtros del Reporte</h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* Fecha Inicio */}
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>
                Fecha Inicio <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                {...register('fecha_inicio', { required: 'La fecha de inicio es requerida' })}
                className='w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent'
              />
              {errors.fecha_inicio && (
                <p className='text-red-500 text-xs mt-1'>{errors.fecha_inicio.message}</p>
              )}
            </div>

            {/* Fecha Fin */}
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>
                Fecha Fin <span className='text-muted-foreground text-xs'>(Opcional)</span>
              </label>
              <input
                type='date'
                {...register('fecha_fin', {
                  validate: (value) => {
                    if (value && watchFechaInicio && new Date(value) < new Date(watchFechaInicio)) {
                      return 'La fecha fin no puede ser anterior a la fecha inicio';
                    }
                    return true;
                  }
                })}
                className='w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent'
              />
              {errors.fecha_fin && (
                <p className='text-red-500 text-xs mt-1'>{errors.fecha_fin.message}</p>
              )}
              <p className='text-muted-foreground text-xs mt-1'>
                Si no se especifica, se consultará solo la fecha de inicio
              </p>
            </div>

            {/* Tipo de Documento */}
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>
                Tipo de Documento
              </label>
              <select
                {...register('id_tipo_documento')}
                className='w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent'
              >
                <option value=''>Todos los tipos</option>
                {tiposDocumento.map((tipo) => (
                  <option key={tipo.id_tipo} value={tipo.id_tipo}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Área (solo para ADMIN) */}
            {isAdmin && (
              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>
                  Área
                </label>
                <select
                  {...register('id_area')}
                  className='w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent'
                >
                  <option value=''>Todas las áreas</option>
                  {areas.map((area) => (
                    <option key={area.id_area} value={area.id_area}>
                      {area.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className='flex gap-3'>
            <button
              type='submit'
              disabled={isLoading}
              className='flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <BarChart3 className='w-5 h-5' />
              {isLoading ? 'Generando...' : 'Generar Reporte'}
            </button>

            <button
              type='button'
              onClick={handleLimpiarFiltros}
              className='px-6 py-3 rounded-xl font-medium transition-all bg-muted text-muted-foreground hover:bg-muted/80'
            >
              Limpiar Filtros
            </button>
          </div>
        </form>
      </FloatingCard>

      {/* Loading */}
      {isLoading && <Loading label='Generando reporte...' height='h-96' />}

      {/* Resultados del Reporte */}
      {!isLoading && reporte && (
        <div className='space-y-6'>
          {/* Información del Periodo */}
          <FloatingCard>
            <div className='flex items-center gap-3 mb-4'>
              <FileText className='w-6 h-6 text-primary' />
              <h2 className='text-xl font-bold text-foreground'>Información del Reporte</h2>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Periodo</p>
                <p className='text-foreground font-medium'>
                  {reporte.periodo.fecha_inicio !== 'N/A'
                    ? diasEnReporte === 1
                      ? `${formatearFechaSinZonaHoraria(reporte.periodo.fecha_inicio)} (1 día)`
                      : `${formatearFechaSinZonaHoraria(reporte.periodo.fecha_inicio)} → ${formatearFechaSinZonaHoraria(reporte.periodo.fecha_fin)} (${diasEnReporte} días)`
                    : 'Sin filtro de fechas'}
                </p>
              </div>
              {reporte.tipo_documento && (
                <div>
                  <p className='text-sm text-muted-foreground'>Tipo de Documento</p>
                  <p className='text-foreground font-medium'>{reporte.tipo_documento.nombre}</p>
                </div>
              )}
              {reporte.area && (
                <div>
                  <p className='text-sm text-muted-foreground'>Área</p>
                  <p className='text-foreground font-medium'>{reporte.area.nombre}</p>
                </div>
              )}
            </div>
          </FloatingCard>

          {/* Métricas Principales */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <MetricCard
              titulo='Total Enviados'
              valor={reporte.resumen.total_enviados}
              icono={FileText}
              color='bg-blue-500'
            />
            <MetricCard
              titulo='Entregados'
              valor={reporte.resumen.total_entregados}
              subtitulo={`${reporte.resumen.porcentaje_entregados.toFixed(1)}% del total`}
              icono={CheckCircle}
              color='bg-green-500'
            />
            <MetricCard
              titulo='Anulados'
              valor={reporte.resumen.total_anulados}
              icono={AlertCircle}
              color='bg-red-500'
            />
          </div>

          {/* Métricas de Firma */}
          {reporte.metricas_firma.requieren_firma > 0 && (
            <FloatingCard>
              <h3 className='text-xl font-bold text-foreground mb-4 flex items-center gap-2'>
                <FileSignature className='w-6 h-6 text-green-600' />
                Métricas de Firma Electrónica
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <div className='p-4 bg-muted/50 rounded-xl'>
                  <p className='text-sm text-muted-foreground mb-1'>Requieren Firma</p>
                  <p className='text-2xl font-bold text-foreground'>
                    {reporte.metricas_firma.requieren_firma}
                  </p>
                </div>
                <div className='p-4 bg-green-500/10 rounded-xl border border-green-500/20'>
                  <p className='text-sm text-muted-foreground mb-1'>Firmados</p>
                  <p className='text-2xl font-bold text-green-600'>
                    {reporte.metricas_firma.firmados}
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {reporte.metricas_firma.porcentaje_firmados.toFixed(1)}% completado
                  </p>
                </div>
                <div className='p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20'>
                  <p className='text-sm text-muted-foreground mb-1'>Pendientes</p>
                  <p className='text-2xl font-bold text-yellow-600'>
                    {reporte.metricas_firma.pendientes_firma}
                  </p>
                </div>
              </div>
            </FloatingCard>
          )}

          {/* Métricas de Respuesta */}
          {reporte.metricas_respuesta.requieren_respuesta > 0 && (
            <FloatingCard>
              <h3 className='text-xl font-bold text-foreground mb-4 flex items-center gap-2'>
                <MessageSquare className='w-6 h-6 text-purple-600' />
                Métricas de Respuesta de Conformidad
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <div className='p-4 bg-muted/50 rounded-xl'>
                  <p className='text-sm text-muted-foreground mb-1'>Requieren Respuesta</p>
                  <p className='text-2xl font-bold text-foreground'>
                    {reporte.metricas_respuesta.requieren_respuesta}
                  </p>
                </div>
                <div className='p-4 bg-purple-500/10 rounded-xl border border-purple-500/20'>
                  <p className='text-sm text-muted-foreground mb-1'>Respondidos</p>
                  <p className='text-2xl font-bold text-purple-600'>
                    {reporte.metricas_respuesta.respondidos}
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {reporte.metricas_respuesta.porcentaje_respondidos.toFixed(1)}% completado
                  </p>
                </div>
                <div className='p-4 bg-orange-500/10 rounded-xl border border-orange-500/20'>
                  <p className='text-sm text-muted-foreground mb-1'>Pendientes</p>
                  <p className='text-2xl font-bold text-orange-600'>
                    {reporte.metricas_respuesta.pendientes_respuesta}
                  </p>
                </div>
              </div>
            </FloatingCard>
          )}

          {/* Gráficos - Solo mostrar distribución temporal si hay más de 1 día */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {diasEnReporte > 1 && datosDistribucionDiaria.length > 0 && (
              <FloatingCard>
                <h3 className='text-xl font-bold text-foreground mb-4 flex items-center gap-2'>
                  <TrendingUp className='w-6 h-6 text-blue-600' />
                  Distribución Temporal ({diasEnReporte} días)
                </h3>
                <GraficoLineas data={datosDistribucionDiaria} altura={300} />
              </FloatingCard>
            )}

            {datosEstados.length > 0 && (
              <FloatingCard>
                <h3 className='text-xl font-bold text-foreground mb-4 flex items-center gap-2'>
                  <PieChart className='w-6 h-6 text-purple-600' />
                  Distribución por Estados
                </h3>
                <GraficoPastel data={datosEstados} altura={300} />
              </FloatingCard>
            )}
          </div>

          {/* Tiempos Promedio */}
          {(reporte.tiempos_promedio.envio_a_apertura_horas > 0 ||
            reporte.tiempos_promedio.envio_a_lectura_horas > 0 ||
            reporte.tiempos_promedio.envio_a_firma_horas > 0 ||
            reporte.tiempos_promedio.envio_a_respuesta_horas > 0) && (
            <FloatingCard>
              <h3 className='text-xl font-bold text-foreground mb-4 flex items-center gap-2'>
                <Clock className='w-6 h-6 text-orange-600' />
                Tiempos Promedio de Procesamiento
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                {reporte.tiempos_promedio.envio_a_apertura_horas > 0 && (
                  <div className='p-4 bg-blue-500/10 rounded-xl border border-blue-500/20'>
                    <p className='text-sm text-muted-foreground mb-1'>Envío → Apertura</p>
                    <p className='text-2xl font-bold text-blue-600'>
                      {reporte.tiempos_promedio.envio_a_apertura_horas.toFixed(1)}h
                    </p>
                  </div>
                )}
                {reporte.tiempos_promedio.envio_a_lectura_horas > 0 && (
                  <div className='p-4 bg-purple-500/10 rounded-xl border border-purple-500/20'>
                    <p className='text-sm text-muted-foreground mb-1'>Envío → Lectura</p>
                    <p className='text-2xl font-bold text-purple-600'>
                      {reporte.tiempos_promedio.envio_a_lectura_horas.toFixed(1)}h
                    </p>
                  </div>
                )}
                {reporte.tiempos_promedio.envio_a_firma_horas > 0 && (
                  <div className='p-4 bg-green-500/10 rounded-xl border border-green-500/20'>
                    <p className='text-sm text-muted-foreground mb-1'>Envío → Firma</p>
                    <p className='text-2xl font-bold text-green-600'>
                      {reporte.tiempos_promedio.envio_a_firma_horas.toFixed(1)}h
                    </p>
                  </div>
                )}
                {reporte.tiempos_promedio.envio_a_respuesta_horas > 0 && (
                  <div className='p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20'>
                    <p className='text-sm text-muted-foreground mb-1'>Envío → Respuesta</p>
                    <p className='text-2xl font-bold text-indigo-600'>
                      {reporte.tiempos_promedio.envio_a_respuesta_horas.toFixed(1)}h
                    </p>
                  </div>
                )}
              </div>
            </FloatingCard>
          )}

          {/* Tabla de Trámites Detallados */}
          <FloatingCard>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-3'>
                <List className='w-6 h-6 text-primary' />
                <h3 className='text-xl font-bold text-foreground'>
                  Trámites del Periodo ({tramitesDetalle.length})
                </h3>
              </div>
            </div>

            {isLoadingTramites ? (
              <Loading label='Cargando trámites...' height='h-64' />
            ) : tramitesDetalle.length === 0 ? (
              <div className='text-center py-12'>
                <FileText className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
                <p className='text-muted-foreground'>No hay trámites en este periodo</p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                  <tr className='border-b border-border'>
                    <th className='text-left p-3 text-sm font-semibold text-foreground'>Código</th>
                    <th className='text-left p-3 text-sm font-semibold text-foreground'>Asunto</th>
                    <th className='text-left p-3 text-sm font-semibold text-foreground'>Destinatario</th>
                    <th className='text-left p-3 text-sm font-semibold text-foreground'>Tipo Doc.</th>
                    <th className='text-left p-3 text-sm font-semibold text-foreground'>Estado</th>
                    <th className='text-left p-3 text-sm font-semibold text-foreground'>Fecha Envío</th>
                    <th className='text-center p-3 text-sm font-semibold text-foreground'>Acciones</th>
                  </tr>
                  </thead>
                  <tbody>
                  {tramitesDetalle.map((tramite) => (
                    <tr
                      key={tramite.id_tramite}
                      className='border-b border-border hover:bg-muted/50 transition-colors'
                    >
                      <td className='p-3'>
                          <span className='font-mono text-sm text-foreground'>
                            {tramite.codigo}
                          </span>
                      </td>
                      <td className='p-3'>
                        <div className='max-w-xs'>
                          <p className='text-sm font-medium text-foreground truncate'>
                            {tramite.asunto}
                          </p>
                          <p className='text-xs text-muted-foreground truncate'>
                            {tramite.documento.titulo}
                          </p>
                        </div>
                      </td>
                      <td className='p-3'>
                        <p className='text-sm text-foreground'>
                          {tramite.receptor.nombres} {tramite.receptor.apellidos}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {tramite.receptor.correo}
                        </p>
                      </td>
                      <td className='p-3'>
                          <span className='text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-800'>
                            {tramite.documento.tipo.nombre}
                          </span>
                      </td>
                      <td className='p-3'>
                        <div className='flex items-center gap-2'>
                          {getEstadoIcon(tramite.estado)}
                          <span className={`text-xs px-2 py-1 rounded-lg border ${getEstadoBadgeColor(tramite.estado)}`}>
                              {PROCEDURE_STATE_LABELS[tramite.estado as keyof typeof PROCEDURE_STATE_LABELS]}
                            </span>
                        </div>
                      </td>
                      <td className='p-3'>
                        <p className='text-sm text-foreground'>
                          {formatearFechaSinZonaHoraria(tramite.fecha_envio)}
                        </p>
                      </td>
                      <td className='p-3 text-center'>
                        <a
                          href={`/responsable/tramites/${tramite.id_tramite}`}
                          className='inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
                        >
                          <Eye className='w-3 h-3' />
                          Ver
                        </a>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            )}
          </FloatingCard>

          {/* Top Trabajadores */}
          {reporte.trabajadores_top.length > 0 && (
            <FloatingCard>
              <div className='flex items-center gap-3 mb-6'>
                <Users className='w-6 h-6 text-primary' />
                <h3 className='text-xl font-bold text-foreground'>Top 10 Trabajadores</h3>
              </div>
              <div className='space-y-3'>
                {reporte.trabajadores_top.map((trabajador, index) => (
                  <div
                    key={trabajador.id_usuario}
                    className='flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-border hover:border-primary transition-all'
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
                                : 'bg-muted text-foreground'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className='font-medium text-foreground'>{trabajador.nombre_completo}</p>
                        <p className='text-sm text-muted-foreground'>
                          {trabajador.completados} de {trabajador.total_recibidos} completados
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-xl font-bold text-primary'>
                        {trabajador.porcentaje_completado.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </FloatingCard>
          )}
        </div>
      )}

      {/* Estado Vacío */}
      {!isLoading && !reporte && (
        <FloatingCard className='text-center py-12'>
          <BarChart3 className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
          <h3 className='text-xl font-bold text-foreground mb-2'>
            Genera tu Primer Reporte
          </h3>
          <p className='text-muted-foreground mb-2'>
            Selecciona al menos la fecha de inicio y haz clic en Generar Reporte
          </p>
          <p className='text-sm text-muted-foreground'>
            💡 Tip: La fecha fin es opcional. Si no la especificas, se consultará solo la fecha de inicio
          </p>
        </FloatingCard>
      )}
    </div>
  );
}

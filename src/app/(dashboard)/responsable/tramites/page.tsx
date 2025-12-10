// src/app/(dashboard)/responsable/tramites/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  Eye,
  FileText,
  Calendar,
  User,
  AlertCircle,
  RefreshCcw,
  CheckCircle,
  Clock,
  PenTool,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { ProcedureStateBadge } from '@/components/ui/Badge';
import TramitesFiltersInline from '@/components/tramites/TramitesFiltersInline';
import TramitesAdvancedFilters from '@/components/tramites/TramitesAdvancedFilters';

import { useTramites } from '@/hooks/useTramites';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PROCEDURE_STATES } from '@/lib/constants';
import {useTramitesStats} from "@/hooks/useTramitesStats";
import { motion } from "framer-motion";
import StatCard from "@/components/tramites/StatCard";

export default function ResponsableTramitesPage() {
  const searchParams = useSearchParams();
  const {
    tramites,
    isLoading,
    error,
    paginacion,
    refetch,
    applyFilters,
    clearFilters,
    currentFilters,
    goToPage,
    changeLimit,
  } = useTramites();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return dateString;
    }
  };

  const getEstadoIcon = (estado: PROCEDURE_STATES) => {
    switch (estado) {
      case PROCEDURE_STATES.ENVIADO:
        return <Send className='w-4 h-4' />;
      case PROCEDURE_STATES.ABIERTO:
      case PROCEDURE_STATES.LEIDO:
        return <Eye className='w-4 h-4' />;
      case PROCEDURE_STATES.FIRMADO:
        return <CheckCircle className='w-4 h-4' />;
      case PROCEDURE_STATES.ANULADO:
        return <AlertCircle className='w-4 h-4' />;
      default:
        return <FileText className='w-4 h-4' />;
    }
  };
  const stats = useTramitesStats(tramites, isLoading);

  const getStatDescription = (type: 'total' | 'pendientes' | 'firmados' | 'observaciones') => {
    if (isLoading) return 'Cargando...';
    if (tramites.length === 0) return 'No hay datos';

    const hasFilters = currentFilters.search || Object.keys(currentFilters).length > 2;

    switch (type) {
      case 'total':
        return hasFilters ? 'Resultados filtrados' : 'Documentos enviados';

      case 'pendientes': {
        if (stats.pendientes === 0) return '¡Todo completado!';
        const estadosPendientes: PROCEDURE_STATES[] = [
          PROCEDURE_STATES.ENVIADO,
          PROCEDURE_STATES.ABIERTO,
          PROCEDURE_STATES.LEIDO,
        ];

        const parts: string[] = [];

        const pendientesConFirma = tramites.filter(
          (t) => t.requiere_firma && estadosPendientes.includes(t.estado)
        ).length;

        const pendientesConRespuesta = tramites.filter(
          (t) =>
            t.requiere_respuesta &&
            !t.respuesta &&
            estadosPendientes.includes(t.estado)
        ).length;

        if (pendientesConFirma > 0) {
          parts.push(`${pendientesConFirma} sin firmar`);
        }
        if (pendientesConRespuesta > 0) {
          parts.push(`${pendientesConRespuesta} sin responder`);
        }

        return parts.length > 0 ? parts.join(', ') : 'Esperando acción';
      }

      case 'firmados': {
        if (stats.totalRequiereFirma === 0) {
          return 'Sin documentos que requieran firma';
        }
        if (stats.firmados === 0) {
          return `0 de ${stats.totalRequiereFirma} firmados`;
        }
        return `${stats.firmados} de ${stats.totalRequiereFirma} que requieren firma`;
      }

      case 'observaciones': {
        if (stats.conObservaciones === 0) {
          return 'Sin observaciones registradas';
        }

        const pendientes = tramites.filter(
          (t) =>
            (t.observaciones_count || 0) > 0 &&
            t.observaciones?.some((obs) => !obs.resuelta),
        ).length;

        if (pendientes > 0) {
          return `${pendientes} con observaciones pendientes`;
        }else{ }
        return 'Todas resueltas';
      }

      default:
        return '';
    }
  };
  if (isLoading && tramites.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4'></div>
          <p className='text-gray-400'>Cargando trámites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-foreground mb-2'>Mis Trámites</h1>
          <p className='text-muted-400'>Documentos enviados a trabajadores</p>
        </div>
        <Link href='/responsable/tramites/nuevo'>
          <Button className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200'>
            <Send className='w-4 h-4 mr-2' />
            Enviar Documento
          </Button>
        </Link>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className='bg-gradient-to-r from-green-900/40 to-green-800/40 backdrop-blur-sm border border-green-700/50 rounded-2xl p-4 flex items-start gap-3 shadow-lg'>
          <CheckCircle className='w-5 h-5 text-green-400 flex-shrink-0 mt-0.5' />
          <div className='flex-1'>
            <p className='text-sm font-medium text-green-300'>Documento enviado exitosamente</p>
            <p className='text-sm text-green-400 mt-1'>
              El trabajador recibirá una notificación sobre el nuevo documento.
            </p>
          </div>
          <button
            onClick={() => setShowSuccessMessage(false)}
            className='text-green-400 hover:text-green-300 transition-colors'
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className='bg-gradient-to-r from-red-900/40 to-red-800/40 backdrop-blur-sm border border-red-700/50 rounded-2xl p-4 flex items-start gap-3 shadow-lg'>
          <AlertCircle className='w-5 h-5 text-red-400 flex-shrink-0 mt-0.5' />
          <div className='flex-1'>
            <p className='text-sm font-medium text-red-300'>Error al cargar trámites</p>
            <p className='text-sm text-red-400 mt-1'>{error}</p>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={refetch}
            className='text-red-400 hover:text-red-300 hover:bg-red-900/30'
          >
            <RefreshCcw className='w-4 h-4 mr-2' />
            Reintentar
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className='space-y-4'>
        <TramitesFiltersInline
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
          currentFilters={currentFilters}
          showAdvanced={showAdvancedFilters}
          onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
        />

        <TramitesAdvancedFilters
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
          currentFilters={currentFilters}
          isOpen={showAdvancedFilters}
        />
      </div>

      {/* Stats Cards */}
      <motion.div
        key={`stats-${stats.total}-${stats.pendientes}-${stats.firmados}-${stats.conObservaciones}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className='grid grid-cols-1 md:grid-cols-4 gap-6'
      >
        <StatCard
          label='Total'
          value={paginacion?.total_registros || 0}
          icon={Send}
          gradient='from-purple-600/20 to-blue-600/20'
          borderColor='border-slate-700/50'
          iconColor='text-purple-400'
          description={getStatDescription('total')}
          isEmpty={stats.total === 0}
        />

        <StatCard
          label='Pendientes'
          value={stats.pendientes}
          icon={Clock}
          gradient='from-yellow-600/20 to-orange-600/20'
          borderColor='border-slate-700/50'
          iconColor='text-yellow-400'
          description={getStatDescription('pendientes')}
          isEmpty={stats.total > 0 && stats.pendientes === 0}
        />

        <StatCard
          label='Firmados'
          value={stats.firmados}
          icon={CheckCircle}
          gradient='from-green-600/20 to-emerald-600/20'
          borderColor='border-slate-700/50'
          iconColor='text-green-400'
          description={getStatDescription('firmados')}
          isEmpty={stats.totalRequiereFirma > 0 && stats.firmados === 0}
        />

        <StatCard
          label='Con Observaciones'
          value={stats.conObservaciones}
          icon={AlertCircle}
          gradient='from-orange-600/20 to-red-600/20'
          borderColor='border-slate-700/50'
          iconColor='text-orange-400'
          description={getStatDescription('observaciones')}
          isEmpty={stats.conObservaciones === 0}
        />
      </motion.div>

      {/* Tramites List - VERSIÓN MEJORADA */}
      <div className='bg-card backdrop-blur-sm border border-border rounded-2xl shadow-lg dark:shadow-2xl overflow-hidden card-light-shadow'>
        <div className='p-6 border-b border-border bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-bold text-foreground'>Lista de Trámites</h2>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground font-medium'>Mostrar:</span>
                <select
                  value={currentFilters.limit || 20}
                  onChange={(e) => changeLimit(Number(e.target.value))}
                  className='px-3 py-2 bg-white dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600/50 rounded-lg text-foreground text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm'
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <Button
                variant='ghost'
                size='sm'
                onClick={refetch}
                className='text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-600'
              >
                <RefreshCcw className='w-4 h-4 mr-2' />
                Actualizar
              </Button>
            </div>
          </div>
        </div>

        <div className='p-6'>
          {tramites.length === 0 ? (
            <div className='text-center py-16'>
              <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700/30 dark:to-slate-800/30 rounded-2xl mb-6 shadow-md'>
                <FileText className='w-10 h-10 text-slate-400 dark:text-gray-500' />
              </div>
              <h3 className='text-xl font-semibold text-foreground mb-2'>No hay trámites</h3>
              <p className='text-muted-foreground mb-8 max-w-md mx-auto'>
                {currentFilters.search || Object.keys(currentFilters).length > 2
                  ? 'No se encontraron trámites con los filtros aplicados'
                  : 'Comienza enviando tu primer documento a un trabajador'}
              </p>
              {currentFilters.search || Object.keys(currentFilters).length > 2 ? (
                <Button
                  variant='outline'
                  onClick={clearFilters}
                  className='border-2 border-slate-300 dark:border-slate-600 text-foreground hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm'
                >
                  Limpiar filtros
                </Button>
              ) : (
                <Link href='/responsable/tramites/nuevo'>
                  <Button className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl'>
                    <Send className='w-4 h-4 mr-2' />
                    Enviar Documento
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className='overflow-x-auto rounded-xl border border-border'>
                <table className='w-full'>
                  <thead className='bg-slate-50 dark:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700/50'>
                  <tr>
                    <th className='text-left py-4 px-4 text-sm font-bold text-slate-700 dark:text-foreground uppercase tracking-wide'>
                      Código
                    </th>
                    <th className='text-left py-4 px-4 text-sm font-bold text-slate-700 dark:text-foreground uppercase tracking-wide'>
                      Asunto
                    </th>
                    <th className='text-left py-4 px-4 text-sm font-bold text-slate-700 dark:text-foreground uppercase tracking-wide'>
                      Destinatario
                    </th>
                    <th className='text-left py-4 px-4 text-sm font-bold text-slate-700 dark:text-foreground uppercase tracking-wide'>
                      Estado
                    </th>
                    <th className='text-left py-4 px-4 text-sm font-bold text-slate-700 dark:text-foreground uppercase tracking-wide'>
                      Fecha Envío
                    </th>
                    <th className='text-left py-4 px-4 text-sm font-bold text-slate-700 dark:text-foreground uppercase tracking-wide'>
                      Acciones
                    </th>
                  </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100 dark:divide-slate-700/30'>
                  {tramites.map((tramite) => (
                    <tr
                      key={tramite.id_tramite}
                      className='hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors'
                    >
                      <td className='py-4 px-4'>
                        <div className='flex items-center gap-2'>
                          <div className='text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-1.5 rounded-lg'>
                            {getEstadoIcon(tramite.estado)}
                          </div>
                          <span className='font-mono text-sm font-semibold text-slate-700 dark:text-foreground bg-slate-100 dark:bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700'>
                        {tramite.codigo}
                      </span>
                          {tramite.es_reenvio && (
                            <span className='inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-700/50'>
                          v{tramite.numero_version}
                        </span>
                          )}
                        </div>
                      </td>
                      <td className='py-4 px-4'>
                        <div className='max-w-xs'>
                          <p className='text-sm font-semibold text-slate-800 dark:text-foreground truncate'>
                            {tramite.asunto}
                          </p>
                          <div className='flex items-center gap-2 mt-1'>
                        <span className='text-xs font-medium text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded'>
                          {tramite.documento.tipo.nombre}
                        </span>
                            {tramite.requiere_firma && (
                              <span className='inline-flex items-center text-xs font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded'>
                            <PenTool className='w-3 h-3 mr-1' />
                            Firma
                          </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='py-4 px-4'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-600/30 dark:to-blue-600/30 rounded-full flex items-center justify-center border-2 border-purple-200 dark:border-purple-500/30 shadow-sm'>
                            <User className='w-5 h-5 text-purple-700 dark:text-purple-300' />
                          </div>
                          <div>
                            <p className='text-sm font-semibold text-slate-800 dark:text-foreground'>
                              {tramite.receptor.apellidos}, {tramite.receptor.nombres}
                            </p>
                            <p className='text-xs text-slate-500 dark:text-gray-400'>{tramite.receptor.correo}</p>
                          </div>
                        </div>
                      </td>
                      <td className='py-4 px-4'>
                        <ProcedureStateBadge estado={tramite.estado} />
                      </td>
                      <td className='py-4 px-4'>
                        <div className='flex items-center gap-2 text-sm text-slate-600 dark:text-foreground-300'>
                          <Calendar className='w-4 h-4 text-slate-400 dark:text-gray-400' />
                          <span className='font-medium'>{formatDate(tramite.fecha_envio)}</span>
                        </div>
                      </td>
                      <td className='py-4 px-4'>
                        <Link href={`/responsable/tramites/${tramite.id_tramite}`}>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-transparent hover:border-purple-200 dark:hover:border-purple-700/50 font-medium'
                          >
                            <Eye className='w-4 h-4 mr-2' />
                            Ver
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación mejorada */}
              {paginacion && paginacion.total_paginas > 1 && (
                <div className='flex items-center justify-between mt-6 pt-6 border-t-2 border-slate-100 dark:border-slate-700/50'>
                  <div className='text-sm text-slate-600 dark:text-gray-400'>
                    Mostrando <span className='text-foreground font-bold'>{tramites.length}</span> de{' '}
                    <span className='text-foreground font-bold'>{paginacion.total_registros}</span>{' '}
                    trámites
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => goToPage(paginacion.pagina_actual - 1)}
                      disabled={!paginacion.tiene_anterior}
                      className='border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-30 font-medium shadow-sm'
                    >
                      <ChevronLeft className='w-4 h-4 mr-1' />
                      Anterior
                    </Button>

                    <div className='flex items-center gap-2'>
                      {Array.from({ length: Math.min(5, paginacion.total_paginas) }, (_, i) => {
                        let pageNum;
                        if (paginacion.total_paginas <= 5) {
                          pageNum = i + 1;
                        } else if (paginacion.pagina_actual <= 3) {
                          pageNum = i + 1;
                        } else if (paginacion.pagina_actual >= paginacion.total_paginas - 2) {
                          pageNum = paginacion.total_paginas - 4 + i;
                        } else {
                          pageNum = paginacion.pagina_actual - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${
                              pageNum === paginacion.pagina_actual
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                                : 'bg-white dark:bg-slate-700/30 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600/50 shadow-sm'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => goToPage(paginacion.pagina_actual + 1)}
                      disabled={!paginacion.tiene_siguiente}
                      className='border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-30 font-medium shadow-sm'
                    >
                      Siguiente
                      <ChevronRight className='w-4 h-4 ml-1' />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

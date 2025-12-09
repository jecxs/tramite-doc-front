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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ProcedureStateBadge } from '@/components/ui/Badge';
import TramitesFiltersInline from '@/components/tramites/TramitesFiltersInline';
import TramitesAdvancedFilters from '@/components/tramites/TramitesAdvancedFilters';

import { useTramites } from '@/hooks/useTramites';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
      setShowSuccessMessage(true);
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

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'ENVIADO':
        return <Send className='w-4 h-4' />;
      case 'ABIERTO':
      case 'LEIDO':
        return <Eye className='w-4 h-4' />;
      case 'FIRMADO':
        return <CheckCircle className='w-4 h-4' />;
      case 'ANULADO':
        return <AlertCircle className='w-4 h-4' />;
      default:
        return <FileText className='w-4 h-4' />;
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
          currentFilters={currentFilters}
          isOpen={showAdvancedFilters}
        />
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-card backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 shadow-lg'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-foreground-400 mb-2'>Total</p>
              <p className='text-3xl font-bold text-foreground'>
                {paginacion?.total_registros || 0}
              </p>
            </div>
            <div className='p-4 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl'>
              <Send className='w-7 h-7 text-purple-400' />
            </div>
          </div>
        </div>

        <div className='bg-card  backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-yellow-500/50 transition-all duration-300 shadow-lg'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-foreground-400 mb-2'>Pendientes</p>
              <p className='text-3xl font-bold text-foreground'>
                {
                  tramites.filter((t) => ['ENVIADO', 'ABIERTO', 'LEIDO'].includes(t.estado))
                    .length
                }
              </p>
            </div>
            <div className='p-4 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-xl'>
              <Clock className='w-7 h-7 text-yellow-400' />
            </div>
          </div>
        </div>

        <div className='bg-card backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300 shadow-lg'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-foreground-400 mb-2'>Firmados</p>
              <p className='text-3xl font-bold text-foreground'>
                {tramites.filter((t) => t.estado === 'FIRMADO').length}
              </p>
            </div>
            <div className='p-4 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl'>
              <CheckCircle className='w-7 h-7 text-green-400' />
            </div>
          </div>
        </div>

        <div className='bg-card backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 shadow-lg'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-foreground-400 mb-2'>Con Observaciones</p>
              <p className='text-3xl font-bold text-foreground'>
                {tramites.filter((t) => (t.observaciones_count || 0) > 0).length}
              </p>
            </div>
            <div className='p-4 bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-xl'>
              <AlertCircle className='w-7 h-7 text-orange-400' />
            </div>
          </div>
        </div>
      </div>

      {/* Tramites List */}
      <div className='bg-card  backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden'>
        <div className='p-6 border-b border-slate-700/50'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-bold text-foreground'>Lista de Trámites</h2>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>Mostrar:</span>
                <select
                  value={currentFilters.limit || 20}
                  onChange={(e) => changeLimit(Number(e.target.value))}
                  className='px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all'
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
                className='text-gray-400 hover:text-white hover:bg-slate-700/50'
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
              <div className='inline-flex items-center justify-center w-20 h-20 bg-slate-700/30 rounded-2xl mb-6'>
                <FileText className='w-10 h-10 text-gray-500' />
              </div>
              <h3 className='text-xl font-semibold text-white mb-2'>No hay trámites</h3>
              <p className='text-gray-400 mb-8 max-w-md mx-auto'>
                {currentFilters.search || Object.keys(currentFilters).length > 2
                  ? 'No se encontraron trámites con los filtros aplicados'
                  : 'Comienza enviando tu primer documento a un trabajador'}
              </p>
              {currentFilters.search || Object.keys(currentFilters).length > 2 ? (
                <Button
                  variant='outline'
                  onClick={clearFilters}
                  className='border-slate-600 text-gray-300 hover:bg-slate-700/50'
                >
                  Limpiar filtros
                </Button>
              ) : (
                <Link href='/responsable/tramites/nuevo'>
                  <Button className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl'>
                    <Send className='w-4 h-4 mr-2' />
                    Enviar Documento
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                  <tr className='border-b border-slate-700/50'>
                    <th className='text-left py-4 px-4 text-sm font-semibold text-foreground-300'>
                      Código
                    </th>
                    <th className='text-left py-4 px-4 text-sm font-semibold text-foreground-300'>
                      Asunto
                    </th>
                    <th className='text-left py-4 px-4 text-sm font-semibold text-foreground-300'>
                      Destinatario
                    </th>
                    <th className='text-left py-4 px-4 text-sm font-semibold text-foreground-300'>
                      Estado
                    </th>
                    <th className='text-left py-4 px-4 text-sm font-semibold text-foreground-300'>
                      Fecha Envío
                    </th>
                    <th className='text-left py-4 px-4 text-sm font-semibold text-foreground-300'>
                      Acciones
                    </th>
                  </tr>
                  </thead>
                  <tbody>
                  {tramites.map((tramite) => (
                    <tr
                      key={tramite.id_tramite}
                      className='border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors'
                    >
                      <td className='py-4 px-4'>
                        <div className='flex items-center gap-2'>
                          <div className='text-purple-400'>{getEstadoIcon(tramite.estado)}</div>
                          <span className='font-mono text-sm font-medium text-foreground'>
                              {tramite.codigo}
                            </span>
                          {tramite.es_reenvio && (
                            <span className='inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-orange-900/30 text-orange-400 border border-orange-700/50'>
                                v{tramite.numero_version}
                              </span>
                          )}
                        </div>
                      </td>
                      <td className='py-4 px-4'>
                        <div className='max-w-xs'>
                          <p className='text-sm font-medium text-foreground truncate'>
                            {tramite.asunto}
                          </p>
                          <div className='flex items-center gap-2 mt-1'>
                              <span className='text-xs text-gray-400'>
                                {tramite.documento.tipo.nombre}
                              </span>
                            {tramite.requiere_firma && (
                              <span className='inline-flex items-center text-xs text-purple-400'>
                                  <PenTool className='w-3 h-3 mr-1' />
                                  Firma
                                </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='py-4 px-4'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-full flex items-center justify-center border border-purple-500/30'>
                            <User className='w-5 h-5 text-purple-300' />
                          </div>
                          <div>
                            <p className='text-sm font-medium text-foreground'>
                              {tramite.receptor.apellidos}, {tramite.receptor.nombres}
                            </p>
                            <p className='text-xs text-gray-400'>{tramite.receptor.correo}</p>
                          </div>
                        </div>
                      </td>
                      <td className='py-4 px-4'>
                        <ProcedureStateBadge estado={tramite.estado} />
                      </td>
                      <td className='py-4 px-4'>
                        <div className='flex items-center gap-2 text-sm text-foreground-300'>
                          <Calendar className='w-4 h-4 text-gray-400' />
                          {formatDate(tramite.fecha_envio)}
                        </div>
                      </td>
                      <td className='py-4 px-4'>
                        <Link href={`/responsable/tramites/${tramite.id_tramite}`}>
                          <Button
                            variant='ghost'
                            size='sm'
                            className=' text-purple-400 hover:text-purple-300 hover:bg-purple-900/20'
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

              {/* Paginación */}
              {paginacion && paginacion.total_paginas > 1 && (
                <div className='flex items-center justify-between mt-6 pt-6 border-t border-slate-700/50'>
                  <div className='text-sm text-gray-400'>
                    Mostrando <span className='text-white font-medium'>{tramites.length}</span> de{' '}
                    <span className='text-white font-medium'>{paginacion.total_registros}</span> trámites
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => goToPage(paginacion.pagina_actual - 1)}
                      disabled={!paginacion.tiene_anterior}
                      className='border-slate-600 text-gray-300 hover:bg-slate-700/50 disabled:opacity-30'
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
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              pageNum === paginacion.pagina_actual
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                : 'bg-slate-700/30 text-gray-300 hover:bg-slate-700/50 border border-slate-600/50'
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
                      className='border-slate-600 text-gray-300 hover:bg-slate-700/50 disabled:opacity-30'
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

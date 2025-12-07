// src/app/(dashboard)/trabajador/tramites/page.tsx
'use client';

import TramitesFilters from '@/components/tramites/TramitesFilters';
import { ProcedureStateBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useTramites } from '@/hooks/useTramites';
import { Procedure } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  Eye,
  FileText,
  Mail,
  PenTool,
  RefreshCcw,
} from 'lucide-react';
import Link from 'next/link';

export default function TrabajadorTramitesPage() {
  const { tramites, isLoading, error, refetch, applyFilters } = useTramites();

  const tramitesFiltrados = tramites.filter((tramite) => {
    // Si no es reenvío, mostrarlo (es versión 1 sin reenvíos)
    if (!tramite.es_reenvio) {
      // Verificar que no tenga reenvíos
      return tramite.reenvios_count === 0;
    }
    // Si es reenvío, siempre mostrarlo (es la versión más reciente)
    return true;
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return dateString;
    }
  };

  const getPriorityInfo = (tramite: Procedure) => {
    if (tramite.estado === 'ENVIADO') {
      return {
        label: 'Nuevo',
        color: 'bg-blue-100 text-blue-800',
        icon: <Mail className='w-3 h-3' />,
      };
    }
    if (tramite.requiere_firma && tramite.estado === 'LEIDO') {
      return {
        label: 'Requiere Firma',
        color: 'bg-purple-100 text-purple-800',
        icon: <PenTool className='w-3 h-3' />,
      };
    }
    if (tramite.estado === 'FIRMADO') {
      return {
        label: 'Completado',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className='w-3 h-3' />,
      };
    }
    return null;
  };

  if (isLoading && tramites.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Cargando documentos...</p>
        </div>
      </div>
    );
  }

  const tramitesNoLeidos = tramitesFiltrados.filter((t) => t.estado === 'ENVIADO').length;
  const tramitesParaFirmar = tramitesFiltrados.filter(
    (t) => t.requiere_firma && ['ABIERTO', 'LEIDO'].includes(t.estado),
  ).length;
  const tramitesFirmados = tramitesFiltrados.filter((t) => t.estado === 'FIRMADO').length;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Mis Documentos</h1>
        <p className='text-gray-600 mt-1'>Documentos recibidos de las diferentes áreas</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
          <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
          <div className='flex-1'>
            <p className='text-sm font-medium text-red-800'>Error al cargar documentos</p>
            <p className='text-sm text-red-700 mt-1'>{error}</p>
          </div>
          <Button variant='ghost' size='sm' onClick={refetch}>
            <RefreshCcw className='w-4 h-4' />
            Reintentar
          </Button>
        </div>
      )}

      {/* Alerts */}
      {tramitesNoLeidos > 0 && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3'>
          <Mail className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
          <div className='flex-1'>
            <p className='text-sm font-medium text-blue-800'>
              Tienes {tramitesNoLeidos} documento{tramitesNoLeidos !== 1 ? 's' : ''} nuevo
              {tramitesNoLeidos !== 1 ? 's' : ''}
            </p>
            <p className='text-sm text-blue-700 mt-1'>Revisa los documentos que te han enviado</p>
          </div>
        </div>
      )}

      {tramitesParaFirmar > 0 && (
        <div className='bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3'>
          <PenTool className='w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5' />
          <div className='flex-1'>
            <p className='text-sm font-medium text-purple-800'>
              {tramitesParaFirmar} documento{tramitesParaFirmar !== 1 ? 's' : ''} pendiente
              {tramitesParaFirmar !== 1 ? 's' : ''} de firma
            </p>
            <p className='text-sm text-purple-700 mt-1'>
              Estos documentos requieren tu firma electrónica
            </p>
          </div>
          <Link href='/trabajador/firmar'>
            <Button size='sm'>Firmar ahora</Button>
          </Link>
        </div>
      )}

      {/* Filters */}
      <TramitesFilters onApplyFilters={applyFilters} />

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Total Recibidos</p>
                <p className='text-2xl font-bold text-gray-900 mt-1'>{tramites.length}</p>
              </div>
              <div className='p-3 bg-blue-100 rounded-lg'>
                <FileText className='w-6 h-6 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Sin Leer</p>
                <p className='text-2xl font-bold text-gray-900 mt-1'>{tramitesNoLeidos}</p>
              </div>
              <div className='p-3 bg-yellow-100 rounded-lg'>
                <Mail className='w-6 h-6 text-yellow-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Para Firmar</p>
                <p className='text-2xl font-bold text-gray-900 mt-1'>{tramitesParaFirmar}</p>
              </div>
              <div className='p-3 bg-purple-100 rounded-lg'>
                <PenTool className='w-6 h-6 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Firmados</p>
                <p className='text-2xl font-bold text-gray-900 mt-1'>{tramitesFirmados}</p>
              </div>
              <div className='p-3 bg-green-100 rounded-lg'>
                <CheckCircle className='w-6 h-6 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tramites List */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Lista de Documentos</CardTitle>
            <Button variant='ghost' size='sm' onClick={refetch}>
              <RefreshCcw className='w-4 h-4' />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tramitesFiltrados.length === 0 ? (
            <div className='text-center py-12'>
              <FileText className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>No hay documentos</h3>
              <p className='text-gray-600'>Aún no has recibido ningún documento</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {tramitesFiltrados.map((tramite) => {
                const priorityInfo = getPriorityInfo(tramite);

                return (
                  <div
                    key={tramite.id_tramite}
                    className='border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all'
                  >
                    <div className='flex items-start justify-between gap-4'>
                      {/* Left Side - Document Info */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-2'>
                          <span className='font-mono text-sm font-medium text-gray-900'>
                            {tramite.codigo}
                          </span>
                          <ProcedureStateBadge estado={tramite.estado} />
                          {priorityInfo && (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium gap-1 ${priorityInfo.color}`}
                            >
                              {priorityInfo.icon}
                              {priorityInfo.label}
                            </span>
                          )}
                          {tramite.es_reenvio && (
                            <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800'>
                              Versión {tramite.numero_version}
                            </span>
                          )}
                        </div>

                        <h3 className='text-base font-semibold text-gray-900 mb-2'>
                          {tramite.asunto}
                        </h3>

                        <div className='grid grid-cols-2 gap-3 text-sm'>
                          <div className='flex items-center gap-2 text-gray-600'>
                            <Building2 className='w-4 h-4' />
                            <span className='truncate'>
                              De: {tramite.remitente.apellidos}, {tramite.remitente.nombres}
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-gray-600'>
                            <FileText className='w-4 h-4' />
                            <span className='truncate'>{tramite.documento.tipo.nombre}</span>
                          </div>
                          <div className='flex items-center gap-2 text-gray-600'>
                            <Calendar className='w-4 h-4' />
                            <span>{formatDate(tramite.fecha_envio)}</span>
                          </div>
                          {tramite.requiere_firma && (
                            <div className='flex items-center gap-2 text-purple-600'>
                              <PenTool className='w-4 h-4' />
                              <span className='font-medium'>Requiere Firma</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side - Actions */}
                      <div className='flex flex-col gap-2'>
                        <Link href={`/trabajador/tramites/${tramite.id_tramite}`}>
                          <Button size='sm' className='w-full'>
                            <Eye className='w-4 h-4' />
                            {tramite.estado === 'ENVIADO' ? 'Abrir' : 'Ver'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

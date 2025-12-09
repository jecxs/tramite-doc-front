// src/app/(dashboard)/trabajador/tramites/page.tsx
'use client';

import TramitesFilters from '@/components/tramites/TramitesFilters';
import { ProcedureStateBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useTramites } from '@/hooks/useTramites';
import { PROCEDURE_STATES } from '@/lib/constants';
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
  LucideProps,
  Mail,
  PenTool,
  RefreshCcw,
} from 'lucide-react';
import Link from 'next/link';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

// Componente de Card Flotante
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

// Componente de Alerta moderna
const ModernAlert = ({
  children,
  icon: Icon,
  variant = 'blue',
}: {
  children: React.ReactNode;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  variant?: string;
}) => {
  const variants: Record<string, string> = {
    blue: 'border-blue-500/30 bg-blue-500/10',
    purple: 'border-purple-500/30 bg-purple-500/10',
    red: 'border-red-500/30 bg-red-500/10',
  };

  return (
    <FloatingCard className={`${variants[variant]} flex items-start gap-4`}>
      <div
        className={`p-2 rounded-xl ${variant === 'blue' ? 'bg-blue-500/20' : variant === 'purple' ? 'bg-purple-500/20' : 'bg-red-500/20'}`}
      >
        <Icon
          className={`w-5 h-5 ${variant === 'blue' ? 'text-blue-400' : variant === 'purple' ? 'text-purple-400' : 'text-red-400'}`}
        />
      </div>
      <div className='flex-1'>{children}</div>
    </FloatingCard>
  );
};

// Componente de StatCard compacto
const CompactStatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  color: string;
}) => {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <FloatingCard className={`${colors.border}`}>
      <div className='flex items-center gap-4'>
        <div className={`p-3 rounded-2xl ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        <div>
          <p className='text-muted-foreground text-sm'>{label}</p>
          <p className='text-foreground text-2xl font-bold'>{value}</p>
        </div>
      </div>
    </FloatingCard>
  );
};

export default function TrabajadorTramitesPage() {
  const { tramites, isLoading, error, refetch, applyFilters } = useTramites();

  const tramitesFiltrados = tramites.filter((tramite) => {
    if (!tramite.es_reenvio) {
      return tramite.reenvios_count === 0;
    }
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
    if (tramite.estado === PROCEDURE_STATES.ENVIADO) {
      return {
        label: 'Nuevo',
        color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        icon: <Mail className='w-3 h-3' />,
      };
    }
    if (tramite.requiere_firma && tramite.estado === PROCEDURE_STATES.LEIDO) {
      return {
        label: 'Requiere Firma',
        color: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
        icon: <PenTool className='w-3 h-3' />,
      };
    }
    if (tramite.estado === PROCEDURE_STATES.FIRMADO) {
      return {
        label: 'Completado',
        color: 'bg-green-500/20 text-green-400 border border-green-500/30',
        icon: <CheckCircle className='w-3 h-3' />,
      };
    }
    return null;
  };

  if (isLoading && tramites.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4'></div>
          <p className='text-gray-400'>Cargando documentos...</p>
        </div>
      </div>
    );
  }

  const tramitesNoLeidos = tramitesFiltrados.filter(
    (t) => t.estado === PROCEDURE_STATES.ENVIADO,
  ).length;
  const tramitesParaFirmar = tramitesFiltrados.filter(
    (t) =>
      t.requiere_firma &&
      ([PROCEDURE_STATES.ABIERTO, PROCEDURE_STATES.LEIDO] as PROCEDURE_STATES[]).includes(t.estado),
  ).length;
  const tramitesFirmados = tramitesFiltrados.filter(
    (t) => t.estado === PROCEDURE_STATES.FIRMADO,
  ).length;

  return (
    <div className='min-h-screen bg-background p-8 space-y-6'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-4xl font-bold text-foreground mb-2'>Mis Documentos</h1>
        <p className='text-muted-foreground'>Documentos recibidos de las diferentes áreas</p>
      </div>

      {/* Error Message */}
      {error && (
        <ModernAlert icon={AlertCircle} variant='red'>
          <div>
            <p className='text-sm font-medium text-red-400'>Error al cargar documentos</p>
            <p className='text-sm text-red-500 mt-1'>{error}</p>
          </div>
          <Button variant='ghost' size='sm' onClick={refetch} className='ml-auto'>
            <RefreshCcw className='w-4 h-4' />
          </Button>
        </ModernAlert>
      )}

      {/* Alerts */}
      {tramitesNoLeidos > 0 && (
        <ModernAlert icon={Mail} variant='blue'>
          <div>
            <p className='text-sm font-medium text-blue-400'>
              Tienes {tramitesNoLeidos} documento{tramitesNoLeidos !== 1 ? 's' : ''} nuevo
              {tramitesNoLeidos !== 1 ? 's' : ''}
            </p>
            <p className='text-sm text-blue-500 mt-1'>Revisa los documentos que te han enviado</p>
          </div>
        </ModernAlert>
      )}

      {tramitesParaFirmar > 0 && (
        <ModernAlert icon={PenTool} variant='purple'>
          <div className='flex items-center justify-between w-full'>
            <div>
              <p className='text-sm font-medium text-purple-400'>
                {tramitesParaFirmar} documento{tramitesParaFirmar !== 1 ? 's' : ''} pendiente
                {tramitesParaFirmar !== 1 ? 's' : ''} de firma
              </p>
              <p className='text-sm text-purple-500 mt-1'>
                Estos documentos requieren tu firma electrónica
              </p>
            </div>
            <Link href='/trabajador/firmar'>
              <Button
                size='sm'
                className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              >
                Firmar ahora
              </Button>
            </Link>
          </div>
        </ModernAlert>
      )}

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <CompactStatCard
          label='Total Recibidos'
          value={tramites.length}
          icon={FileText}
          color='blue'
        />
        <CompactStatCard label='Sin Leer' value={tramitesNoLeidos} icon={Mail} color='yellow' />
        <CompactStatCard
          label='Para Firmar'
          value={tramitesParaFirmar}
          icon={PenTool}
          color='purple'
        />
        <CompactStatCard
          label='Firmados'
          value={tramitesFirmados}
          icon={CheckCircle}
          color='green'
        />
      </div>

      {/* Filters */}
      <TramitesFilters onApplyFilters={applyFilters} />

      {/* Tramites List */}
      <FloatingCard>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-foreground text-xl font-bold'>Lista de Documentos</h3>
          <button
            onClick={refetch}
            className='flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-foreground hover:opacity-90 transition-all border border-border'
          >
            <RefreshCcw className='w-4 h-4' />
            Actualizar
          </button>
        </div>

        {tramitesFiltrados.length === 0 ? (
          <div className='text-center py-12'>
            <FileText className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-medium text-foreground mb-2'>No hay documentos</h3>
            <p className='text-muted-foreground'>Aún no has recibido ningún documento</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {tramitesFiltrados.map((tramite) => {
              const priorityInfo = getPriorityInfo(tramite);

              return (
                <div
                  key={tramite.id_tramite}
                  className='bg-card border border-border rounded-2xl p-5 hover:border-purple-500/50 transition-all'
                >
                  <div className='flex items-start justify-between gap-4'>
                    {/* Left Side - Document Info */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-3 flex-wrap'>
                        <span className='font-mono text-sm font-medium text-foreground bg-muted px-3 py-1 rounded-lg'>
                          {tramite.codigo}
                        </span>
                        <ProcedureStateBadge estado={tramite.estado} />
                        {priorityInfo && (
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium gap-1.5 ${priorityInfo.color}`}
                          >
                            {priorityInfo.icon}
                            {priorityInfo.label}
                          </span>
                        )}
                        {tramite.es_reenvio && (
                          <span className='inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30'>
                            Versión {tramite.numero_version}
                          </span>
                        )}
                      </div>

                      <h3 className='text-base font-semibold text-foreground mb-3'>
                        {tramite.asunto}
                      </h3>

                      <div className='grid grid-cols-2 gap-3 text-sm'>
                        <div className='flex items-center gap-2 text-muted-foreground'>
                          <Building2 className='w-4 h-4' />
                          <span className='truncate'>
                            De: {tramite.remitente.apellidos}, {tramite.remitente.nombres}
                          </span>
                        </div>
                        <div className='flex items-center gap-2 text-muted-foreground'>
                          <FileText className='w-4 h-4' />
                          <span className='truncate'>{tramite.documento.tipo.nombre}</span>
                        </div>
                        <div className='flex items-center gap-2 text-muted-foreground'>
                          <Calendar className='w-4 h-4' />
                          <span>{formatDate(tramite.fecha_envio)}</span>
                        </div>
                        {tramite.requiere_firma && (
                          <div className='flex items-center gap-2 text-purple-400'>
                            <PenTool className='w-4 h-4' />
                            <span className='font-medium'>Requiere Firma</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className='flex flex-col gap-2'>
                      <Link href={`/trabajador/tramites/${tramite.id_tramite}`}>
                        <Button
                          size='sm'
                          className={`${tramite.estado === PROCEDURE_STATES.ENVIADO ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' : 'bg-muted hover:opacity-90'}`}
                        >
                          <Eye className='w-4 h-4 mr-2' />
                          {tramite.estado === PROCEDURE_STATES.ENVIADO ? 'Abrir' : 'Ver'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </FloatingCard>
    </div>
  );
}

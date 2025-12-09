// src/app/(dashboard)/trabajador/observaciones/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  MessageSquare,
  CheckCircle,
  Clock,
  FileText,
  HelpCircle,
  AlertTriangle,
  Info,
  Loader2,
  RefreshCw,
  Search,
  Eye,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { getPendingObservations } from '@/lib/api/observaciones';
import { Observation } from '@/types';
import { toast } from 'sonner';
import Link from 'next/link';

interface ObservationWithTramite extends Observation {
  tramite?: {
    codigo: string;
    asunto: string;
    estado: string;
    documento?: {
      titulo: string;
    };
  };
}

// Componente de Card Flotante
const FloatingCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-card rounded-2xl p-6 shadow-2xl border border-border ${className}`}>
    {children}
  </div>
);

// Componente de StatCard compacto
const CompactStatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
}) => {
  const colorMap: any = {
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
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
          <p className='text-gray-400 text-sm'>{label}</p>
          <p className='text-white text-2xl font-bold'>{value}</p>
        </div>
      </div>
    </FloatingCard>
  );
};

export default function TrabajadorObservacionesPage() {
  const [observaciones, setObservaciones] = useState<ObservationWithTramite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchObservaciones();
  }, []);

  const fetchObservaciones = async () => {
    try {
      setIsLoading(true);
      const data = await getPendingObservations();
      setObservaciones(data as ObservationWithTramite[]);
    } catch (err: unknown) {
      console.error('Error fetching observaciones:', err);
      toast.error('Error al cargar las observaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      CONSULTA: 'Consulta',
      CORRECCION_REQUERIDA: 'Corrección Requerida',
      INFORMACION_ADICIONAL: 'Información Adicional',
    };
    return labels[tipo] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      CONSULTA: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      CORRECCION_REQUERIDA: 'bg-red-500/20 text-red-400 border-red-500/30',
      INFORMACION_ADICIONAL: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return colors[tipo] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, React.ReactNode> = {
      CONSULTA: <HelpCircle className='w-4 h-4' />,
      CORRECCION_REQUERIDA: <AlertTriangle className='w-4 h-4' />,
      INFORMACION_ADICIONAL: <Info className='w-4 h-4' />,
    };
    return icons[tipo] || <MessageSquare className='w-4 h-4' />;
  };

  const filteredObservaciones = observaciones.filter((obs) => {
    const matchesType = filterType === 'all' || obs.tipo === filterType;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pendiente' && !obs.resuelta) ||
      (filterStatus === 'resuelta' && obs.resuelta);
    const matchesSearch =
      searchQuery === '' ||
      obs.tramite?.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obs.tramite?.asunto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obs.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const totalCount = observaciones.length;
  const pendientesCount = observaciones.filter((o) => !o.resuelta).length;
  const resueltasCount = observaciones.filter((o) => o.resuelta).length;

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-background'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin text-purple-600 mx-auto mb-4' />
          <p className='text-muted-foreground'>Cargando observaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background p-8 space-y-6'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-4xl font-bold text-foreground mb-2'>Mis Observaciones</h1>
        <p className='text-muted-foreground'>
          Consulta el estado de tus observaciones y las respuestas recibidas
        </p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <CompactStatCard label='Total' value={totalCount} icon={MessageSquare} color='blue' />
        <CompactStatCard label='Pendientes' value={pendientesCount} icon={Clock} color='orange' />
        <CompactStatCard
          label='Resueltas'
          value={resueltasCount}
          icon={CheckCircle}
          color='green'
        />
      </div>

      {/* Filters */}
      <FloatingCard>
        <div className='flex flex-col sm:flex-row gap-4'>
          {/* Search */}
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
            <input
              type='text'
              placeholder='Buscar por código, asunto o descripción...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary'
            />
          </div>

          {/* Filter by Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className='px-4 py-2.5 bg-input border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary'
          >
            <option value='all'>Todos los tipos</option>
            <option value='CONSULTA'>Consulta</option>
            <option value='CORRECCION_REQUERIDA'>Corrección Requerida</option>
            <option value='INFORMACION_ADICIONAL'>Información Adicional</option>
          </select>

          {/* Filter by Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className='px-4 py-2.5 bg-input border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary'
          >
            <option value='all'>Todos los estados</option>
            <option value='pendiente'>Pendientes</option>
            <option value='resuelta'>Resueltas</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchObservaciones}
            disabled={isLoading}
            className='px-4 py-2.5 bg-muted border border-border rounded-xl text-foreground hover:opacity-90 transition-all disabled:opacity-50'
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </FloatingCard>

      {/* Observaciones List */}
      <FloatingCard>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-foreground text-xl font-bold'>
            Mis Observaciones ({filteredObservaciones.length})
          </h3>
        </div>

        {filteredObservaciones.length === 0 ? (
          <div className='text-center py-12'>
            <MessageSquare className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-medium text-foreground mb-2'>No hay observaciones</h3>
            <p className='text-muted-foreground'>
              {observaciones.length === 0
                ? 'Aún no has creado ninguna observación'
                : 'No se encontraron observaciones con los filtros aplicados'}
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {filteredObservaciones.map((observacion) => (
              <div
                key={observacion.id_observacion}
                className='bg-card border border-border rounded-2xl p-5 hover:border-purple-500/50 transition-all'
              >
                {/* Header */}
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-3 flex-wrap'>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${getTipoColor(observacion.tipo)}`}
                      >
                        {getTipoIcon(observacion.tipo)}
                        {getTipoLabel(observacion.tipo)}
                      </span>
                      {observacion.resuelta ? (
                        <span className='inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30'>
                          <CheckCircle className='w-3 h-3 mr-1' />
                          Resuelta
                        </span>
                      ) : (
                        <span className='inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30'>
                          <Clock className='w-3 h-3 mr-1' />
                          Pendiente
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/trabajador/tramites/${observacion.id_tramite}`}
                      className='text-sm font-medium text-blue-600 dark:text-blue-400 hover:opacity-80 hover:underline flex items-center gap-1'
                    >
                      <FileText className='w-4 h-4' />
                      {observacion.tramite?.codigo || 'N/A'} - {observacion.tramite?.asunto}
                    </Link>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {format(new Date(observacion.fecha_creacion), 'dd/MM/yyyy HH:mm', {
                      locale: es,
                    })}
                  </p>
                </div>

                {/* Tu Observación */}
                <div className='mb-4'>
                  <p className='text-sm font-medium text-foreground mb-2'>Tu observación:</p>
                  <p className='text-sm text-foreground bg-muted p-4 rounded-xl border border-border'>
                    {observacion.descripcion}
                  </p>
                </div>

                {/* Respuesta */}
                {observacion.resuelta && observacion.respuesta ? (
                  <div className='mt-4 pt-4 border-t border-border'>
                    <div className='flex items-start gap-3 p-4 bg-green-500/10 rounded-xl border border-green-500/30'>
                      <CheckCircle className='w-5 h-5 text-green-400 mt-0.5 flex-shrink-0' />
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-green-400 mb-2'>
                          Respuesta del responsable:
                        </p>
                        <p className='text-sm text-foreground'>{observacion.respuesta}</p>
                        {observacion.fecha_resolucion && (
                          <p className='text-xs text-muted-foreground mt-2'>
                            Respondida el{' '}
                            {format(
                              new Date(observacion.fecha_resolucion),
                              "dd 'de' MMMM 'de' yyyy 'a las' HH:mm",
                              { locale: es },
                            )}
                          </p>
                        )}
                        {observacion.resolutor && (
                          <p className='text-xs text-muted-foreground'>
                            Por: {observacion.resolutor.nombres} {observacion.resolutor.apellidos}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='mt-4 pt-4 border-t border-border'>
                    <div className='flex items-start gap-3 p-4 bg-orange-500/10 rounded-xl border border-orange-500/30'>
                      <Clock className='w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0' />
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-orange-400 mb-1'>
                          Esperando respuesta
                        </p>
                        <p className='text-sm text-foreground'>
                          El responsable ha sido notificado y te responderá pronto.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ver Trámite */}
                <div className='mt-4 pt-4 border-t border-border'>
                  <Link href={`/trabajador/tramites/${observacion.id_tramite}`}>
                    <button className='flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-foreground hover:opacity-90 transition-all border border-border'>
                      <Eye className='w-4 h-4' />
                      Ver Trámite Completo
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </FloatingCard>

      {/* Info Card */}
      <FloatingCard className='border-blue-500/30 bg-blue-500/10'>
        <div className='flex items-start gap-4'>
          <div className='p-2 rounded-xl bg-blue-500/20'>
            <Info className='w-5 h-5 text-blue-400' />
          </div>
          <div className='flex-1'>
            <p className='text-sm font-medium text-blue-400 mb-1'>
              ¿Necesitas crear una observación?
            </p>
            <p className='text-sm text-muted-foreground'>
              Ve al detalle del trámite y haz clic en &ldquo;Crear Observación&rdquo; para reportar
              dudas o solicitar correcciones.
            </p>
          </div>
        </div>
      </FloatingCard>
    </div>
  );
}

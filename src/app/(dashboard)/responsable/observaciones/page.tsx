'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  MessageSquare,
  CheckCircle,
  Clock,
  FileText,
  User,
  Send,
  Loader2,
  RefreshCw,
  Search,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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

export default function ResponsableObservacionesPage() {
  const [observaciones, setObservaciones] = useState<ObservationWithTramite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
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
      CONSULTA: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      CORRECCION_REQUERIDA: 'bg-red-500/10 text-red-400 border border-red-500/20',
      INFORMACION_ADICIONAL: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    };
    return colors[tipo] || 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  };

  const getTipoIcon = (tipo: string) => {
    if (tipo === 'CORRECCION_REQUERIDA') return <AlertCircle className="w-4 h-4" />;
    if (tipo === 'INFORMACION_ADICIONAL') return <FileText className="w-4 h-4" />;
    return <MessageSquare className="w-4 h-4" />;
  };

  const filteredObservaciones = observaciones.filter((obs) => {
    const matchesType = filterType === 'all' || obs.tipo === filterType;
    const matchesSearch =
      searchQuery === '' ||
      obs.tramite?.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obs.tramite?.asunto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obs.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const pendientesCount = observaciones.filter((o) => !o.resuelta).length;
  const resueltasCount = observaciones.filter((o) => o.resuelta).length;

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin text-violet-400 mx-auto mb-4' />
          <p className='text-slate-400'>Cargando observaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen p-8'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header flotante */}
        <div className='bg-[#272d34] backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl shadow-black/20'>
          <h1 className='text-3xl font-bold text-white mb-1'>Observaciones</h1>
          <p className='text-slate-400'>Gestiona las observaciones de tus trámites enviados</p>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-[#272d34] backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6 shadow-2xl shadow-blue-500/5 hover:shadow-blue-500/10 transition-all duration-300'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-400 mb-1'>Total</p>
                <p className='text-3xl font-bold text-white'>{observaciones.length}</p>
              </div>
              <div className='p-4 bg-blue-500/20 rounded-xl'>
                <MessageSquare className='w-8 h-8 text-blue-400' />
              </div>
            </div>
          </div>

          <div className='bg-[#272d34] backdrop-blur-xl rounded-2xl border border-amber-500/20 p-6 shadow-2xl shadow-amber-500/5 hover:shadow-amber-500/10 transition-all duration-300'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-400 mb-1'>Pendientes</p>
                <p className='text-3xl font-bold text-white'>{pendientesCount}</p>
              </div>
              <div className='p-4 bg-amber-500/20 rounded-xl'>
                <Clock className='w-8 h-8 text-amber-400' />
              </div>
            </div>
          </div>

          <div className='bg-[#272d34] backdrop-blur-xl rounded-2xl border border-green-500/20 p-6 shadow-2xl shadow-green-500/5 hover:shadow-green-500/10 transition-all duration-300'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-400 mb-1'>Resueltas</p>
                <p className='text-3xl font-bold text-white'>{resueltasCount}</p>
              </div>
              <div className='p-4 bg-green-500/20 rounded-xl'>
                <CheckCircle className='w-8 h-8 text-green-400' />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className='bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl shadow-black/20'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1 relative'>
              <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500' />
              <input
                type='text'
                placeholder='Buscar por código, asunto o descripción...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all outline-none'
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className='px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all outline-none'
            >
              <option value='all'>Todos los tipos</option>
              <option value='CONSULTA'>Consulta</option>
              <option value='CORRECCION_REQUERIDA'>Corrección Requerida</option>
              <option value='INFORMACION_ADICIONAL'>Información Adicional</option>
            </select>

            <button
              onClick={fetchObservaciones}
              disabled={isLoading}
              className='px-6 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white hover:bg-slate-700/50 transition-all disabled:opacity-50'
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Observaciones List */}
        <div className='bg-[#272d34] backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl shadow-black/20 overflow-hidden'>
          <div className='p-6 border-b border-slate-700/50'>
            <h2 className='text-xl font-semibold text-white'>
              Observaciones Pendientes ({filteredObservaciones.length})
            </h2>
          </div>

          <div className='p-6'>
            {filteredObservaciones.length === 0 ? (
              <div className='text-center py-16'>
                <CheckCircle className='w-20 h-20 text-slate-600 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-white mb-2'>
                  No hay observaciones pendientes
                </h3>
                <p className='text-slate-400'>Todas las observaciones han sido resueltas</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {filteredObservaciones.map((observacion) => (
                  <div
                    key={observacion.id_observacion}
                    className='bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300'
                  >
                    {/* Header */}
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-3'>
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${getTipoColor(observacion.tipo)}`}>
                            {getTipoIcon(observacion.tipo)}
                            {getTipoLabel(observacion.tipo)}
                          </span>
                          {observacion.resuelta && (
                            <span className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20'>
                              <CheckCircle className='w-3.5 h-3.5' />
                              Resuelta
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/responsable/tramites/${observacion.id_tramite}`}
                          className='text-sm font-medium text-violet-400 hover:text-violet-300 hover:underline inline-flex items-center gap-2'
                        >
                          <FileText className='w-4 h-4' />
                          {observacion.tramite?.codigo || 'N/A'} - {observacion.tramite?.asunto}
                        </Link>
                      </div>
                      <p className='text-xs text-slate-500'>
                        {format(new Date(observacion.fecha_creacion), 'dd/MM/yyyy HH:mm', {
                          locale: es,
                        })}
                      </p>
                    </div>

                    {/* Description */}
                    <div className='mb-4'>
                      <p className='text-sm font-medium text-slate-300 mb-2'>Descripción:</p>
                      <p className='text-sm text-slate-400 bg-slate-800/50 p-4 rounded-lg border border-slate-700/30'>
                        {observacion.descripcion}
                      </p>
                    </div>

                    {/* Creator */}
                    {observacion.creador && (
                      <div className='flex items-center gap-2 mb-4 text-sm text-slate-400'>
                        <User className='w-4 h-4' />
                        <span>
                          Creado por: {observacion.creador.nombres} {observacion.creador.apellidos}
                        </span>
                      </div>
                    )}

                    {/* Response Section */}
                    {observacion.resuelta ? (
                      <div className='mt-4 pt-4 border-t border-slate-700/50'>
                        <div className='flex items-start gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20'>
                          <CheckCircle className='w-5 h-5 text-green-400 mt-0.5 flex-shrink-0' />
                          <div className='flex-1'>
                            <p className='text-sm font-medium text-green-300 mb-1'>Respuesta:</p>
                            <p className='text-sm text-green-400/90'>{observacion.respuesta}</p>
                            {observacion.fecha_resolucion && (
                              <p className='text-xs text-green-400/70 mt-2'>
                                Resuelta el{' '}
                                {format(
                                  new Date(observacion.fecha_resolucion),
                                  "dd 'de' MMMM 'de' yyyy 'a las' HH:mm",
                                  { locale: es },
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className='mt-4 pt-4 border-t border-slate-700/50 flex gap-3'>
                        <Link
                          href={`/responsable/tramites/${observacion.id_tramite}`}
                          className='flex-1'
                        >
                          <button className='w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white hover:bg-slate-700/50 transition-all flex items-center justify-center gap-2'>
                            <FileText className='w-4 h-4' />
                            Ver Trámite
                          </button>
                        </Link>

                        <Link
                          href={`/responsable/observaciones/${observacion.id_observacion}/responder`}
                          className='flex-1'
                        >
                          <button className='w-full px-4 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 rounded-lg text-white hover:from-violet-500 hover:to-violet-400 transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 font-medium'>
                            <Send className='w-4 h-4' />
                            Responder Observación
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

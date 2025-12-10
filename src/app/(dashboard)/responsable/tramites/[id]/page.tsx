// src/app/(dashboard)/responsable/tramites/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getProcedureById } from '@/lib/api/tramites';
import { Procedure } from '@/types';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

import TramiteHeader from '@/components/tramites/detalle/TramiteHeader';
import EstadoTimeline from '@/components/tramites/detalle/EstadoTimeline';
import InformacionDocumento from '@/components/tramites/detalle/InformacionDocumento';
import HistorialTramite from '@/components/tramites/detalle/HistorialTramite';
import ObservacionesList from '@/components/tramites/detalle/ObservacionesList';
import InformacionPersona from '@/components/tramites/detalle/InformacionPersona';
import FechasImportantes from '@/components/tramites/detalle/FechasImportantes';
import FirmaElectronicaInfo from '@/components/firma/FirmaElectronicaInfo';
import VisualizarRespuesta from '@/components/respuesta/VisualizarRespuesta';
import InformacionReenvio from "@/components/tramites/detalle/InformacionReenvio";
import VersionesDocumento from "@/components/tramites/detalle/VersionesDocumento";

export default function ProcedureDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchProcedure();
    }
  }, [id]);

  const fetchProcedure = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getProcedureById(id);
      setProcedure(data);
    } catch (err: unknown) {
      console.error('Error fetching procedure:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el trámite');
      toast.error('Error al cargar el trámite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!procedure) return;

    try {
      setIsDownloading(true);
      const response = await apiClient.get(`/documentos/${procedure.id_documento}/download`, {
        responseType: 'json',
      });

      if (response.data && response.data.download_url) {
        window.open(response.data.download_url, '_blank');
        toast.success('Descargando documento...');
      } else {
        throw new Error('No se pudo obtener la URL de descarga');
      }
    } catch (err: unknown) {
      console.error('Error downloading document:', err);
      setError(err instanceof Error ? err.message : 'Error al descargar el documento');
      toast.error('Error al descargar el documento');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-background'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin text-primary mx-auto mb-4' />
          <p className='text-muted-foreground'>Cargando trámite...</p>
        </div>
      </div>
    );
  }

  if (error || !procedure) {
    return (
      <div className='min-h-screen bg-background p-8'>
        <div className='max-w-2xl mx-auto'>
          <div className='bg-card backdrop-blur-xl rounded-2xl border border-border shadow-2xl p-8'>
            <div className='text-center'>
              <AlertCircle className='w-16 h-16 text-destructive mx-auto mb-4' />
              <h3 className='text-lg font-medium text-foreground mb-2'>
                Error al cargar el trámite
              </h3>
              <p className='text-muted-foreground mb-6'>{error}</p>
              <Button onClick={() => router.back()}>Volver</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const cardClasses = 'bg-card backdrop-blur-xl rounded-2xl border border-border shadow-lg';
  return (
    <div className='min-h-screen bg-background p-6 lg:p-8 transition-colors duration-300'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header flotante */}
        <div className='bg-card-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-6'>
          <TramiteHeader
            codigo={procedure.codigo}
            isDownloading={isDownloading}
            onDownload={handleDownload}
          />
        </div>

        {/* Timeline de estado */}
        <div className={cardClasses}>
          <EstadoTimeline procedure={procedure} />
        </div>

        {/* Grid responsive de contenido */}
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
          {/* COLUMNA PRINCIPAL */}
          <div className='xl:col-span-2 space-y-6'>
            {/* Información del documento */}
            <div className={cardClasses}>
              <InformacionDocumento procedure={procedure} />
            </div>

            {/* Historial */}
            <div className={cardClasses}>
              <HistorialTramite
                procedure={procedure}
                isLoading={isLoading}
                onRefresh={fetchProcedure}
              />
            </div>

            {/* Respuesta del trabajador */}
            {procedure.requiere_respuesta && (
              <div className={cardClasses} style={{padding: '15px'}}>
                <h3 className='text-lg font-semibold text-foreground mb-4'>
                  Respuesta del Trabajador
                </h3>
                {procedure.respuesta ? (
                  <VisualizarRespuesta respuesta={procedure.respuesta} mostrarDetallesTecnicos />
                ) : (
                  <p className='text-sm text-muted-foreground'>El trabajador aún no ha respondido</p>
                )}
              </div>
            )}

            {/* Observaciones */}
            <div className={cardClasses}>
              <ObservacionesList observaciones={procedure.observaciones} />
            </div>

            {/* Firma electrónica */}
            {procedure.firma && (
              <div className={cardClasses}>
                <FirmaElectronicaInfo firma={procedure.firma} procedure={procedure} />
              </div>
            )}
          </div>

          {/* COLUMNA LATERAL */}
          <div className='space-y-6'>
            {/* Información del remitente */}
            <div className={cardClasses}>
              <InformacionPersona
                tipo='remitente'
                persona={procedure.remitente}
                area={procedure.areaRemitente}
              />
            </div>

            {/* Información del receptor */}
            <div className={cardClasses}>
              <InformacionPersona tipo='receptor' persona={procedure.receptor} />
            </div>

            {/* Fechas importantes */}
            <div className={cardClasses}>
              <FechasImportantes
                fechas={{
                  fecha_envio: procedure.fecha_envio,
                  fecha_abierto: procedure.fecha_abierto,
                  fecha_leido: procedure.fecha_leido,
                  fecha_firmado: procedure.fecha_firmado,
                }}
              />
            </div>

            {/* Información de Reenvío */}
            <InformacionReenvio procedure={procedure} />

            {/* Versiones del Documento */}
            <VersionesDocumento procedure={procedure} />
          </div>
        </div>
      </div>
    </div>
  );
}

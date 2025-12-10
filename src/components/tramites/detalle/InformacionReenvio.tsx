// src/components/tramites/detalle/InformacionReenvio.tsx
import Link from 'next/link';
import { RefreshCw, Info, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Procedure } from '@/types';

interface InformacionReenvioProps {
  procedure: Procedure;
}

export default function InformacionReenvio({ procedure }: InformacionReenvioProps) {
  // Solo mostrar si es un reenvío
  if (!procedure.es_reenvio || !procedure.motivo_reenvio) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className='flex items-center gap-2.5'>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <RefreshCw className='w-4 h-4 text-primary' />
          </div>
          <CardTitle className='text-base font-semibold text-foreground'>
            Información de Reenvío
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Badge de versión simplificado */}
        <div className='flex items-center justify-between p-3 rounded-lg bg-muted/50'>
          <div className='flex items-center gap-2'>
            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            <span className='text-sm font-medium text-foreground'>
              Versión {procedure.numero_version}
            </span>
          </div>
          <span className='text-xs font-medium text-muted-foreground px-2.5 py-1 rounded-md bg-background/60'>
            Documento corregido
          </span>
        </div>

        {/* Motivo del reenvío - diseño limpio */}
        <div className='space-y-2'>
          <div className='flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
            <Info className="w-3.5 h-3.5" />
            <span>Motivo del Reenvío</span>
          </div>
          <div className='p-4 rounded-lg bg-muted/30 border border-border'>
            <p className='text-sm text-foreground leading-relaxed'>
              {procedure.motivo_reenvio}
            </p>
          </div>
        </div>

        {/* Link al trámite original - diseño consistente */}
        {procedure.tramiteOriginal && (
          <div className='space-y-2 pt-2'>
            <div className='flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Trámite Original</span>
            </div>
            <Link
              href={`/responsable/tramites/${procedure.tramiteOriginal.id_tramite}`}
              className='flex items-center justify-between p-3.5 rounded-lg transition-all duration-200
                bg-muted/30 border border-border
                hover:bg-muted/50 hover:border-primary/30 hover:shadow-sm
                group'
            >
              <div className='flex items-center gap-3 flex-1 min-w-0'>
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-background/80 border border-border group-hover:border-primary/30 transition-colors">
                  <RefreshCw className='w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors' />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-semibold text-foreground group-hover:text-primary transition-colors'>
                    {procedure.tramiteOriginal.codigo}
                  </p>
                  <p className='text-xs text-muted-foreground mt-0.5 truncate'>
                    {procedure.tramiteOriginal.asunto}
                  </p>
                </div>
              </div>
              <ChevronRight className='w-5 h-5 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-2 group-hover:translate-x-0.5 transition-all' />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

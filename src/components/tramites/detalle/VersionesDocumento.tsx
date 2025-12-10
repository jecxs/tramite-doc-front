// src/components/tramites/detalle/VersionesDocumento.tsx
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { FileText, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Procedure } from '@/types';

interface VersionesDocumentoProps {
  procedure: Procedure;
}

export default function VersionesDocumento({ procedure }: VersionesDocumentoProps) {
  // Solo mostrar si hay reenvíos (versiones adicionales)
  if (!procedure.reenvios || procedure.reenvios.length === 0) {
    return null;
  }

  // ✅ FIX: Calcular la versión MÁS ALTA en toda la cadena
  const versionesNumeros = [
    procedure.numero_version,
    ...procedure.reenvios.map(r => r.numero_version)
  ];
  const versionMasAlta = Math.max(...versionesNumeros);

  // La versión actual en la VISTA es la del procedure que estamos viendo
  const versionActualVista = procedure.numero_version;

  // Esta vista ES la versión más alta?
  const esVersionMasReciente = versionActualVista === versionMasAlta;

  // Calcular total de versiones
  const totalVersiones = procedure.reenvios.length + 1;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base font-semibold text-foreground'>
            Versiones del Documento
          </CardTitle>
          <span className='text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20'>
            {totalVersiones} {totalVersiones === 1 ? 'versión' : 'versiones'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className='space-y-2.5'>
          {/* ✅ Versión de la vista actual (puede o no ser la más reciente) */}
          <Link
            href={`/responsable/tramites/${procedure.id_tramite}`}
            className={`flex items-center justify-between p-3.5 rounded-xl transition-all duration-200
              ${esVersionMasReciente
              ? 'bg-gradient-to-r from-blue-50 to-blue-100/80 dark:from-blue-950/40 dark:to-blue-900/40 border-2 border-blue-300 dark:border-blue-700'
              : 'bg-card border border-border'
            }
              hover:shadow-lg hover:scale-[1.02]
              ${esVersionMasReciente ? 'hover:border-blue-400 dark:hover:border-blue-600' : 'hover:bg-accent hover:border-accent-foreground/20'}
              group`}
          >
            <div className='flex items-center gap-3 flex-1 min-w-0'>
              <div className={`p-2 rounded-lg transition-transform group-hover:scale-110
                ${esVersionMasReciente
                ? 'bg-blue-600 dark:bg-blue-500'
                : 'bg-muted group-hover:bg-muted-foreground/10'
              }`}>
                <FileText className={`w-5 h-5 flex-shrink-0
                  ${esVersionMasReciente
                  ? 'text-white'
                  : 'text-muted-foreground group-hover:text-foreground'
                }`}
                />
              </div>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <span className={`text-sm font-semibold
                    ${esVersionMasReciente
                    ? 'text-blue-900 dark:text-blue-100'
                    : 'text-foreground'
                  }`}>
                    Versión {versionActualVista}
                  </span>
                  {esVersionMasReciente && (
                    <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                      bg-green-600 dark:bg-green-500 text-white shadow-sm'>
                      <CheckCircle className='w-3 h-3' />
                      Actual
                    </span>
                  )}
                  {!esVersionMasReciente && (
                    <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                      bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'>
                      <Clock className='w-3 h-3' />
                      {versionMasAlta - versionActualVista === 1
                        ? 'Anterior'
                        : `${versionMasAlta - versionActualVista} versiones atrás`}
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 truncate font-medium
                  ${esVersionMasReciente
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-muted-foreground'
                }`}>
                  {procedure.documento.nombre_archivo}
                </p>
              </div>
            </div>
            <svg
              className={`w-5 h-5 flex-shrink-0 ml-2 group-hover:translate-x-1 transition-transform
                ${esVersionMasReciente
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-muted-foreground group-hover:text-foreground'
              }`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5l7 7-7 7'
              />
            </svg>
          </Link>

          {/* ✅ Otras versiones (reenvíos) - ordenadas de mayor a menor */}
          {[...procedure.reenvios]
            .sort((a, b) => b.numero_version - a.numero_version) // Mayor a menor
            .map((reenvio) => {
              // Es esta la versión más reciente de todas?
              const esLaMasReciente = reenvio.numero_version === versionMasAlta;
              const versionDiff = versionMasAlta - reenvio.numero_version;

              return (
                <Link
                  key={reenvio.id_tramite}
                  href={`/responsable/tramites/${reenvio.id_tramite}`}
                  className={`flex items-center justify-between p-3.5 rounded-xl transition-all duration-200
                    ${esLaMasReciente
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100/80 dark:from-blue-950/40 dark:to-blue-900/40 border-2 border-blue-300 dark:border-blue-700'
                    : 'bg-card border border-border'
                  }
                    hover:shadow-lg hover:scale-[1.02]
                    ${esLaMasReciente ? 'hover:border-blue-400 dark:hover:border-blue-600' : 'hover:bg-accent hover:border-accent-foreground/20'}
                    group`}
                >
                  <div className='flex items-center gap-3 flex-1 min-w-0'>
                    <div className={`p-2 rounded-lg transition-transform group-hover:scale-110
                      ${esLaMasReciente
                      ? 'bg-blue-600 dark:bg-blue-500'
                      : 'bg-muted group-hover:bg-muted-foreground/10'
                    }`}>
                      <FileText className={`w-4.5 h-4.5 flex-shrink-0 transition-colors
                        ${esLaMasReciente
                        ? 'text-white'
                        : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                      />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-2 flex-wrap'>
                        <span className={`text-sm font-semibold
                          ${esLaMasReciente
                          ? 'text-blue-900 dark:text-blue-100'
                          : 'text-foreground'
                        }`}>
                          Versión {reenvio.numero_version}
                        </span>
                        {esLaMasReciente && (
                          <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                            bg-green-600 dark:bg-green-500 text-white shadow-sm'>
                            <CheckCircle className='w-3 h-3' />
                            Actual
                          </span>
                        )}
                        {!esLaMasReciente && (
                          <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                            bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'>
                            <Clock className='w-3 h-3' />
                            {versionDiff === 1 ? 'Anterior' : `${versionDiff} versiones atrás`}
                          </span>
                        )}
                      </div>
                      <div className='flex items-center gap-2 mt-1 text-xs'>
                        <p className={`truncate flex-1 font-medium
                          ${esLaMasReciente
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-muted-foreground group-hover:text-foreground/70'
                        }`}>
                          {reenvio.documento.titulo}
                        </p>
                        <span className='text-muted-foreground'>•</span>
                        <span className='text-muted-foreground flex-shrink-0 font-medium'>
                          {format(new Date(reenvio.fecha_envio), 'dd/MM/yyyy', { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 flex-shrink-0 ml-2 group-hover:translate-x-1 transition-all
                      ${esLaMasReciente
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                </Link>
              );
            })}
        </div>

        {/* Footer informativo con mejor diseño */}
        <div className='mt-4 pt-4 border-t border-border'>
          <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <p className='text-xs text-muted-foreground font-medium'>
              {procedure.reenvios.length === 1
                ? 'Se realizó 1 reenvío con correcciones'
                : `Se realizaron ${procedure.reenvios.length} reenvíos con correcciones`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

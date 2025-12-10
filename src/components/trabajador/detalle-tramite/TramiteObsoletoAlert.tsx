// src/components/trabajador/detalle-tramite/TramiteObsoletoAlert.tsx
'use client';

import { Procedure } from '@/types';
import { AlertTriangle, ArrowRight, FileCheck } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface TramiteObsoletoAlertProps {
  procedure: Procedure;
  versionActualId?: string;
}

export default function TramiteObsoletoAlert({
                                               procedure,
                                             }: TramiteObsoletoAlertProps) {
  const reenvios = procedure.reenvios ?? [];
  const tieneVersionNueva = reenvios.length > 0;
  if (!tieneVersionNueva) {
    return null;
  }

  const versionMasReciente = reenvios[reenvios.length - 1];

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-slate-800/40 dark:via-orange-950/20 dark:to-slate-800/40 border border-amber-200 dark:border-orange-900/30 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
      <div className="flex items-start gap-4">
        {/* Icono minimalista */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-600 flex items-center justify-center shadow-md">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Versión Desactualizada
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Este documento ha sido actualizado a la <span className="font-medium text-slate-900 dark:text-slate-200">Versión {versionMasReciente.numero_version}</span> en respuesta a tu observación.
            </p>
          </div>

          {/* Nueva versión info */}
          <div className="bg-white/60 dark:bg-slate-900/40 border border-amber-100 dark:border-slate-700/50 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                  Nueva versión disponible
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  <span className="font-mono font-semibold text-primary">
                    {versionMasReciente.codigo}
                  </span>
                  {' • '}
                  {versionMasReciente.documento.titulo}
                </p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/trabajador/tramites/${versionMasReciente.id_tramite}`}>
              <Button
                size="sm"
                className="bg-blue-600 hover:from-primary/90 hover:to-blue-700 text-foreground shadow-sm hover:shadow-md transition-all"
              >
                <FileCheck className="w-4 h-4 mr-1.5" />
                Ver Versión Actual
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500"></div>
              <span>Versión anterior bloqueada</span>
            </div>
          </div>

          {/* Restricciones - Colapsable visualmente */}
          <details className="mt-4 group">
            <summary className="cursor-pointer list-none flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              ¿Qué acciones están restringidas?
            </summary>
            <div className="mt-2 ml-6 pl-3 border-l-2 border-amber-200 dark:border-slate-700">
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 dark:text-amber-400 mt-0.5">•</span>
                  <span>Firma electrónica deshabilitada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 dark:text-amber-400 mt-0.5">•</span>
                  <span>No se pueden crear observaciones</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 dark:text-amber-400 mt-0.5">•</span>
                  <span>Cambios de estado bloqueados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 dark:text-amber-400 mt-0.5">•</span>
                  <span>Respuestas inhabilitadas</span>
                </li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

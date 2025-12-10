// src/components/modals/FirmarDocumentosModal.tsx
'use client';

import { Procedure } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  X,
  FileText,
  Calendar,
  Building2,
  PenTool,
  Eye,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { ProcedureStateBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface FirmarDocumentosModalProps {
  isOpen: boolean;
  onClose: () => void;
  tramites: Procedure[];
}

export default function FirmarDocumentosModal({
                                                isOpen,
                                                onClose,
                                                tramites,
                                              }: FirmarDocumentosModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-card rounded-3xl shadow-2xl border border-border w-full max-w-4xl max-h-[85vh] flex flex-col pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/20">
                <PenTool className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Documentos para Firmar
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {tramites.length} documento{tramites.length !== 1 ? 's' : ''} requiere
                  {tramites.length !== 1 ? 'n' : ''} tu firma electrónica
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {tramites.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 rounded-2xl bg-green-500/20 inline-block mb-4">
                  <AlertCircle className="w-12 h-12 text-green-400" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No hay documentos pendientes
                </h3>
                <p className="text-muted-foreground">
                  Todos tus documentos están firmados
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tramites.map((tramite) => (
                  <div
                    key={tramite.id_tramite}
                    className="bg-card border border-border rounded-2xl p-5 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left Side - Document Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="font-mono text-sm font-medium text-foreground bg-muted px-3 py-1.5 rounded-lg">
                            {tramite.codigo}
                          </span>
                          <ProcedureStateBadge estado={tramite.estado} />
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium gap-1.5 bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            <PenTool className="w-3 h-3" />
                            Firma Requerida
                          </span>
                          {tramite.es_reenvio && (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                              Versión {tramite.numero_version}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-semibold text-foreground mb-3">
                          {tramite.asunto}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              De: {tramite.remitente.apellidos}, {tramite.remitente.nombres}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              {tramite.documento.tipo.nombre}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>Enviado: {formatDate(tramite.fecha_envio)}</span>
                          </div>
                          {tramite.fecha_leido && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Eye className="w-4 h-4 flex-shrink-0" />
                              <span>Leído: {formatDate(tramite.fecha_leido)}</span>
                            </div>
                          )}
                        </div>

                        {tramite.mensaje && (
                          <div className="mt-3 p-3 rounded-xl bg-muted/50 border border-border">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {tramite.mensaje}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right Side - Action */}
                      <div className="flex flex-col gap-2">
                        <Link href={`/trabajador/tramites/${tramite.id_tramite}`}>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 whitespace-nowrap"
                            onClick={onClose}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver y Firmar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {tramites.length > 0 && (
                  <>
                    <AlertCircle className="inline w-4 h-4 mr-1 text-purple-400" />
                    Haz clic en "Ver y Firmar" para revisar y firmar cada documento
                  </>
                )}
              </p>
              <Button variant="ghost" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

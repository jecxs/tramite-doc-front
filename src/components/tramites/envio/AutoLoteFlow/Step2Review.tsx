'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import { DocumentoConDestinatarioDto, DeteccionDestinatarioDto, DocumentType } from '@/types';
import { crearTramitesAutoLote } from '@/lib/api/tramites-auto';
import { handleApiError } from '@/lib/api-client';
import DetectionSummary from './DetectionSummary';
import TramiteCard from '../shared/TramiteCard';
import FailedFiles from './FailedFiles';

interface Step2ReviewProps {
    deteccionResultado: {
        exitosos: DeteccionDestinatarioDto[];
        fallidos: DeteccionDestinatarioDto[];
        tipo_documento: DocumentType;
    };
    tramitesListos: DocumentoConDestinatarioDto[];
    onTramitesChange: (tramites: DocumentoConDestinatarioDto[]) => void;
    onBack: () => void;
    onError: (error: string) => void;
}

export default function Step2Review({
                                        deteccionResultado,
                                        tramitesListos,
                                        onTramitesChange,
                                        onBack,
                                        onError,
                                    }: Step2ReviewProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleEditarTramite = (
        index: number,
        field: keyof DocumentoConDestinatarioDto,
        value: string
    ) => {
        const nuevosTramites = [...tramitesListos];
        nuevosTramites[index] = {
            ...nuevosTramites[index],
            [field]: value,
        };
        onTramitesChange(nuevosTramites);
    };

    const handleEliminarTramite = (index: number) => {
        onTramitesChange(tramitesListos.filter((_, i) => i !== index));
    };

    const handleEnviar = async () => {
        if (tramitesListos.length === 0) {
            onError('No hay trámites listos para enviar');
            return;
        }

        try {
            setIsLoading(true);
            console.log('📤 Enviando trámites en lote...');

            const response = await crearTramitesAutoLote({
                id_tipo_documento: deteccionResultado.tipo_documento.id_tipo,
                documentos: tramitesListos,
            });

            console.log(`✅ ${response.total} trámites creados exitosamente`);
            router.push('/responsable/tramites?success=true');
        } catch (error) {
            console.error('❌ Error enviando trámites:', error);
            onError(handleApiError(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Resumen de detección */}
            <DetectionSummary
                exitososCount={deteccionResultado.exitosos.length}
                fallidosCount={deteccionResultado.fallidos.length}
                listosCount={tramitesListos.length}
            />

            {/* Tabla de trámites listos */}
            <TramiteCard
                tramites={tramitesListos}
                onEdit={handleEditarTramite}
                onDelete={handleEliminarTramite}
            />

            {/* Archivos fallidos */}
            {deteccionResultado.fallidos.length > 0 && (
                <FailedFiles fallidos={deteccionResultado.fallidos} />
            )}

            {/* Botones de acción */}
            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onBack}
                    disabled={isLoading}
                >
                    Volver
                </Button>
                <Button
                    type="button"
                    onClick={handleEnviar}
                    isLoading={isLoading}
                    disabled={isLoading || tramitesListos.length === 0}
                    className="flex-1"
                >
                    <Send className="w-4 h-4" />
                    Enviar {tramitesListos.length} Trámite{tramitesListos.length !== 1 ? 's' : ''}
                </Button>
            </div>
        </div>
    );
}
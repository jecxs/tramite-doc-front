// src/components/firma/ExportarFirmaButton.tsx
'use client';

import { useState } from 'react';
import { Download, Shield, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ElectronicSignature, Procedure } from '@/types';
import { exportarFirmaElectronicaPDF } from '@/lib/utils/export-firma-pdf';
import { toast } from 'sonner';

interface ExportarFirmaButtonProps {
    firma: ElectronicSignature;
    procedure: Procedure;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    showText?: boolean;
    className?: string;
}

export default function ExportarFirmaButton({
                                                firma,
                                                procedure,
                                                variant = 'outline',
                                                size = 'sm',
                                                showIcon = true,
                                                showText = true,
                                                className = '',
                                            }: ExportarFirmaButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        try {
            setIsExporting(true);

            // Pequeño delay para mostrar el loader
            await new Promise(resolve => setTimeout(resolve, 500));

            // Exportar a PDF
            exportarFirmaElectronicaPDF(firma, procedure);

            toast.success('Certificado de firma exportado correctamente', {
                description: `Se ha descargado el certificado del trámite ${procedure.codigo}`,
                icon: <Shield className="w-4 h-4" />,
            });
        } catch (error) {
            console.error('Error al exportar certificado de firma:', error);
            toast.error('Error al exportar certificado', {
                description: 'No se pudo generar el PDF. Intente nuevamente.',
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleExport}
            disabled={isExporting}
            className={className}
            title="Descargar certificado de firma electrónica"
        >
            {isExporting ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {showText && <span className="ml-2">Exportando...</span>}
                </>
            ) : (
                <>
                    {showIcon && <Download className="w-4 h-4" />}
                    {showText && <span className={showIcon ? 'ml-2' : ''}>Certificado PDF</span>}
                </>
            )}
        </Button>
    );
}
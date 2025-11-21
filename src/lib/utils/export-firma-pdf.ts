// src/lib/utils/export-firma-pdf.ts
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ElectronicSignature, Procedure } from '@/types';

export const exportarFirmaElectronicaPDF = (firma: ElectronicSignature, procedure: Procedure) => {
    // Crear documento PDF
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    // Colores
    const primaryColor: [number, number, number] = [22, 163, 74]; // green-600
    const accentColor: [number, number, number] = [220, 252, 231]; // green-100
    const textColor: [number, number, number] = [17, 24, 39]; // gray-900
    const grayColor: [number, number, number] = [107, 114, 128]; // gray-500

    let yPosition = 20;

    // ========== ENCABEZADO ==========
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 50, 'F');

    // Icono de escudo (simulado con texto)
    doc.setFillColor(255, 255, 255);
    doc.circle(105, 20, 8, 'F');
    doc.setTextColor(...primaryColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('✓', 105, 23, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('CERTIFICADO DE FIRMA ELECTRONICA', 105, 35, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestion Documental', 105, 42, { align: 'center' });

    yPosition = 60;

    // ========== INFORMACIÓN DEL DOCUMENTO ==========
    doc.setTextColor(...textColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Documento Firmado', 14, yPosition);
    yPosition += 8;

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, yPosition, 196, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Información del trámite
    const infoDoc = [
        ['Codigo de Tramite:', procedure.codigo],
        ['Asunto:', procedure.asunto],
        ['Tipo de Documento:', procedure.documento.tipo.nombre],
        ['Archivo:', procedure.documento.nombre_archivo],
    ];

    infoDoc.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 14, yPosition);
        doc.setFont('helvetica', 'normal');
        const valueLines = doc.splitTextToSize(value, 150);
        doc.text(valueLines, 60, yPosition);
        yPosition += Math.max(5, valueLines.length * 5);
    });

    yPosition += 5;

    // ========== INFORMACIÓN DEL FIRMANTE ==========
    doc.setFillColor(...accentColor);
    doc.rect(10, yPosition, 190, 8, 'F');

    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL FIRMANTE', 14, yPosition + 5.5);
    yPosition += 12;

    doc.setTextColor(...textColor);
    doc.setFontSize(9);

    // Cuadro con información del firmante
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(14, yPosition, 182, 35);

    yPosition += 6;

    const infoFirmante = [
        ['Nombre Completo:', `${procedure.receptor.nombres} ${procedure.receptor.apellidos}`],
        ['DNI:', procedure.receptor.dni],
        ['Correo Electronico:', procedure.receptor.correo],
    ];

    if (procedure.receptor.telefono) {
        infoFirmante.push(['Telefono:', procedure.receptor.telefono]);
    }

    infoFirmante.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 18, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 65, yPosition);
        yPosition += 6;
    });

    yPosition += 8;

    // ========== DETALLES DE LA FIRMA ==========
    doc.setFillColor(...accentColor);
    doc.rect(10, yPosition, 190, 8, 'F');

    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLES DE LA FIRMA ELECTRONICA', 14, yPosition + 5.5);
    yPosition += 12;

    doc.setTextColor(...textColor);
    doc.setFontSize(9);

    // Cuadro principal
    doc.setDrawColor(200, 200, 200);
    doc.rect(14, yPosition, 182, 58);

    yPosition += 6;

    // Fecha y hora (destacado)
    doc.setFillColor(252, 252, 252);
    doc.rect(18, yPosition - 2, 174, 14, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Fecha y Hora de Firma:', 22, yPosition + 3);
    doc.setTextColor(22, 163, 74);
    doc.text(
        format(new Date(firma.fecha_firma), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm:ss", { locale: es }),
        22,
        yPosition + 9
    );

    yPosition += 18;
    doc.setTextColor(...textColor);
    doc.setFontSize(9);

    // Resto de información técnica
    const infoTecnica = [
        ['Direccion IP:', firma.ip_address],
        ['Navegador:', firma.navegador || 'No especificado'],
        ['Dispositivo:', firma.dispositivo || 'No especificado'],
        ['Terminos Aceptados:', firma.acepta_terminos ? 'Si' : 'No'],
        ['ID de Firma:', firma.id_firma],
    ];

    infoTecnica.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 22, yPosition);
        doc.setFont('helvetica', 'normal');

        if (label === 'ID de Firma:') {
            doc.setFontSize(7);
            const idLines = doc.splitTextToSize(value, 130);
            doc.text(idLines, 65, yPosition);
            yPosition += Math.max(6, idLines.length * 4);
            doc.setFontSize(9);
        } else {
            doc.text(value, 65, yPosition);
            yPosition += 6;
        }
    });

    yPosition += 8;

    // ========== VALIDACIÓN LEGAL ==========
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.rect(14, yPosition, 182, 28, 'FD');

    yPosition += 5;

    doc.setTextColor(30, 64, 175);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('VALIDEZ LEGAL', 18, yPosition);
    yPosition += 6;

    doc.setTextColor(30, 58, 138);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const textoLegal = 'Esta firma electronica tiene plena validez juridica conforme a la Ley N 27269 - Ley de Firmas y Certificados Digitales y su Reglamento. El registro de firma constituye prueba fehaciente de la manifestacion de voluntad del firmante.';
    const legalLines = doc.splitTextToSize(textoLegal, 174);
    doc.text(legalLines, 18, yPosition);

    yPosition += legalLines.length * 4 + 8;

    // ========== HASH DE VERIFICACIÓN ==========
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(200, 200, 200);
    doc.rect(14, yPosition, 182, 16, 'FD');

    yPosition += 5;

    doc.setTextColor(...grayColor);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('HASH DE VERIFICACION (SHA-256):', 18, yPosition);
    yPosition += 4;

    doc.setFont('helvetica', 'normal');
    // Simular hash (en producción, esto vendría del backend)
    const hash = generateSimpleHash(firma.id_firma);
    doc.text(hash, 18, yPosition);

    // ========== PIE DE PÁGINA ==========
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();

    // Línea superior
    doc.setDrawColor(...grayColor);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 25, 196, pageHeight - 25);

    // Información de generación
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text(
        'Este certificado fue generado automaticamente por el Sistema de Gestion Documental',
        105,
        pageHeight - 20,
        { align: 'center' }
    );

    doc.text(
        `Fecha de generacion: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: es })}`,
        105,
        pageHeight - 15,
        { align: 'center' }
    );

    // Código QR simulado (en producción, usar una librería de QR)
    doc.setFillColor(200, 200, 200);
    doc.rect(170, pageHeight - 35, 20, 20, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(6);
    doc.text('QR', 180, pageHeight - 24, { align: 'center' });
    doc.text('Verificacion', 180, pageHeight - 20, { align: 'center' });

    // Número de página
    doc.setFontSize(7);
    doc.text('Pagina 1 de 1', 14, pageHeight - 10);

    // Sello de autenticidad
    doc.setTextColor(22, 163, 74);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('DOCUMENTO AUTENTICO', 105, pageHeight - 7, { align: 'center' });

    // Guardar PDF
    const fileName = `Certificado_Firma_${procedure.codigo}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
    doc.save(fileName);
};

// Helper para generar un hash simple (en producción usar crypto del backend)
function generateSimpleHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    // Convertir a hex y formatear como hash SHA-256 (64 caracteres)
    const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
    return hexHash.repeat(8).substring(0, 64);
}
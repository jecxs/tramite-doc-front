// src/lib/utils/export-historial-pdf.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Procedure } from '@/types';
import { PROCEDURE_STATE_LABELS } from '@/lib/constants';

export const exportarHistorialPDF = (procedure: Procedure) => {
    // Crear nuevo documento PDF
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    // Configuración de colores
    const primaryColor: [number, number, number] = [37, 99, 235]; // blue-600
    const secondaryColor: [number, number, number] = [243, 244, 246]; // gray-100
    const textColor: [number, number, number] = [17, 24, 39]; // gray-900

    let yPosition = 20;

    // ========== ENCABEZADO ==========
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('HISTORIAL DE TRAMITE', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestion Documental', 105, 28, { align: 'center' });
    doc.text(
        `Generado el ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}`,
        105,
        34,
        { align: 'center' }
    );

    yPosition = 50;

    // ========== INFORMACIÓN DEL TRÁMITE ==========
    doc.setTextColor(...textColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Informacion del Tramite', 14, yPosition);
    yPosition += 8;

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, yPosition, 196, yPosition);
    yPosition += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const xLeft = 14;
    const xRight = 110;

    // Código y Estado
    doc.setFont('helvetica', 'bold');
    doc.text('Codigo:', xLeft, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(procedure.codigo, xLeft + 20, yPosition);

    doc.setFont('helvetica', 'bold');
    doc.text('Estado:', xRight, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(PROCEDURE_STATE_LABELS[procedure.estado], xRight + 20, yPosition);
    yPosition += 6;

    // Asunto
    doc.setFont('helvetica', 'bold');
    doc.text('Asunto:', xLeft, yPosition);
    doc.setFont('helvetica', 'normal');
    const asuntoLines = doc.splitTextToSize(procedure.asunto, 170);
    doc.text(asuntoLines, xLeft + 20, yPosition);
    yPosition += asuntoLines.length * 5 + 2;

    // Remitente y Receptor
    doc.setFont('helvetica', 'bold');
    doc.text('Remitente:', xLeft, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(
        `${procedure.remitente.nombres} ${procedure.remitente.apellidos}`,
        xLeft + 25,
        yPosition
    );

    doc.setFont('helvetica', 'bold');
    doc.text('Receptor:', xRight, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(
        `${procedure.receptor.nombres} ${procedure.receptor.apellidos}`,
        xRight + 25,
        yPosition
    );
    yPosition += 6;

    // Área
    if (procedure.areaRemitente) {
        doc.setFont('helvetica', 'bold');
        doc.text('Area:', xLeft, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(procedure.areaRemitente.nombre, xLeft + 15, yPosition);
        yPosition += 6;
    }

    // Documento
    doc.setFont('helvetica', 'bold');
    doc.text('Documento:', xLeft, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(procedure.documento.nombre_archivo, xLeft + 28, yPosition);
    yPosition += 6;

    // Características
    const caracteristicas: string[] = [];
    if (procedure.requiere_firma) caracteristicas.push('Requiere Firma');
    if (procedure.requiere_respuesta) caracteristicas.push('Requiere Respuesta');
    if (procedure.es_reenvio) caracteristicas.push(`Version ${procedure.numero_version}`);

    if (caracteristicas.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Caracteristicas:', xLeft, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(caracteristicas.join(' | '), xLeft + 35, yPosition);
        yPosition += 8;
    } else {
        yPosition += 6;
    }

    // ========== FECHAS IMPORTANTES ==========
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Fechas Importantes', 14, yPosition);
    yPosition += 6;

    doc.setDrawColor(...primaryColor);
    doc.line(14, yPosition, 196, yPosition);
    yPosition += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const fechas = [
        { label: 'Fecha de Envio', valor: procedure.fecha_envio },
        { label: 'Fecha de Apertura', valor: procedure.fecha_abierto },
        { label: 'Fecha de Lectura', valor: procedure.fecha_leido },
        { label: 'Fecha de Firma', valor: procedure.fecha_firmado },
        { label: 'Fecha de Anulacion', valor: procedure.fecha_anulado },
    ];

    fechas.forEach((fecha) => {
        if (fecha.valor) {
            doc.setFont('helvetica', 'bold');
            doc.text(`${fecha.label}:`, xLeft, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(
                format(new Date(fecha.valor), "dd/MM/yyyy 'a las' HH:mm", { locale: es }),
                xLeft + 45,
                yPosition
            );
            yPosition += 5;
        }
    });

    yPosition += 5;

    // ========== HISTORIAL DE ACCIONES ==========
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Historial de Acciones', 14, yPosition);
    yPosition += 6;

    doc.setDrawColor(...primaryColor);
    doc.line(14, yPosition, 196, yPosition);
    yPosition += 2;

    // Preparar datos para la tabla - SIN caracteres especiales
    const historialData = procedure.historial?.map((item) => {
        const accion = item.accion.charAt(0) + item.accion.slice(1).toLowerCase().replace(/_/g, ' ');
        const fecha = format(new Date(item.fecha), 'dd/MM/yyyy HH:mm', { locale: es });
        const usuario = item.usuario
            ? `${item.usuario.nombres} ${item.usuario.apellidos}`
            : 'Sistema';
        const detalle = item.detalle || '-';

        // IMPORTANTE: Usar solo caracteres ASCII simples
        let estado = '-';
        if (item.estado_anterior && item.estado_nuevo) {
            const estadoAnt = PROCEDURE_STATE_LABELS[item.estado_anterior as keyof typeof PROCEDURE_STATE_LABELS] || item.estado_anterior;
            const estadoNuevo = PROCEDURE_STATE_LABELS[item.estado_nuevo as keyof typeof PROCEDURE_STATE_LABELS] || item.estado_nuevo;
            estado = `${estadoAnt} > ${estadoNuevo}`;
        } else if (item.estado_nuevo) {
            estado = PROCEDURE_STATE_LABELS[item.estado_nuevo as keyof typeof PROCEDURE_STATE_LABELS] || item.estado_nuevo;
        }

        return [fecha, accion, usuario, detalle, estado];
    }) || [];

    // Crear tabla con autoTable
    autoTable(doc, {
        startY: yPosition,
        head: [['Fecha', 'Accion', 'Usuario', 'Detalle', 'Estado']],
        body: historialData,
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center',
        },
        bodyStyles: {
            fontSize: 7.5,
            textColor: textColor,
            cellPadding: 2,
        },
        alternateRowStyles: {
            fillColor: secondaryColor,
        },
        columnStyles: {
            0: { cellWidth: 28, halign: 'center' },
            1: { cellWidth: 22, halign: 'left' },
            2: { cellWidth: 32, halign: 'left' },
            3: { cellWidth: 55, halign: 'left' },
            4: { cellWidth: 45, halign: 'left' },
        },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height || pageSize.getHeight();

            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(
                `Pagina ${data.pageNumber}`,
                pageSize.width / 2,
                pageHeight - 10,
                { align: 'center' }
            );

            doc.text(
                `Codigo de Tramite: ${procedure.codigo}`,
                14,
                pageHeight - 10
            );
        },
    });

    // ========== OBSERVACIONES ==========
    if (procedure.observaciones && procedure.observaciones.length > 0) {
        const finalY = (doc as any).lastAutoTable.finalY || yPosition;
        yPosition = finalY + 10;

        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...textColor);
        doc.text('Observaciones', 14, yPosition);
        yPosition += 6;

        doc.setDrawColor(...primaryColor);
        doc.line(14, yPosition, 196, yPosition);
        yPosition += 6;

        procedure.observaciones.forEach((obs, index) => {
            if (yPosition > 260) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`Observacion ${index + 1}:`, 14, yPosition);
            yPosition += 5;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');

            doc.setFont('helvetica', 'bold');
            doc.text('Tipo:', 18, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(obs.tipo.replace(/_/g, ' '), 32, yPosition);
            yPosition += 5;

            doc.setFont('helvetica', 'bold');
            doc.text('Estado:', 18, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(obs.resuelta ? 'Resuelta' : 'Pendiente', 32, yPosition);
            yPosition += 5;

            doc.setFont('helvetica', 'bold');
            doc.text('Descripcion:', 18, yPosition);
            doc.setFont('helvetica', 'normal');
            const descripcionLines = doc.splitTextToSize(obs.descripcion, 160);
            doc.text(descripcionLines, 18, yPosition + 5);
            yPosition += descripcionLines.length * 5 + 5;

            if (obs.respuesta) {
                doc.setFont('helvetica', 'bold');
                doc.text('Respuesta:', 18, yPosition);
                doc.setFont('helvetica', 'normal');
                const respuestaLines = doc.splitTextToSize(obs.respuesta, 160);
                doc.text(respuestaLines, 18, yPosition + 5);
                yPosition += respuestaLines.length * 5 + 5;
            }

            yPosition += 3;
        });
    }

    // ========== PIE DE PÁGINA ==========
    const pageSize = doc.internal.pageSize;
    const pageHeight = pageSize.height || pageSize.getHeight();

    doc.setFillColor(...secondaryColor);
    doc.rect(0, pageHeight - 20, 210, 20, 'F');

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
        'Este documento es una copia fiel del historial registrado en el Sistema de Gestion Documental',
        105,
        pageHeight - 12,
        { align: 'center' }
    );
    doc.text(
        `Documento generado automaticamente - ${format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: es })}`,
        105,
        pageHeight - 7,
        { align: 'center' }
    );

    // Guardar el PDF
    const fileName = `Historial_Tramite_${procedure.codigo}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
    doc.save(fileName);
};
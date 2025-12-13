import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportePersonalizado, Procedure } from '@/types';
import { formatearFechaSinZonaHoraria } from '../date-utils';
import { PROCEDURE_STATE_LABELS } from '@/lib/constants';

export const exportarReporteAPDF = async (
  reporte: ReportePersonalizado,
  tramites?: Procedure[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // === HEADER ===
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Trámites Documentarios', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, pageWidth / 2, yPos, {
    align: 'center',
  });
  yPos += 15;

  // === PERIODO Y FILTROS ===
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Período del Reporte', 14, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const fechaInicioTexto = reporte.periodo.fecha_inicio !== 'N/A'
    ? formatearFechaSinZonaHoraria(reporte.periodo.fecha_inicio)
    : 'Sin filtro';
  const fechaFinTexto = reporte.periodo.fecha_fin !== 'N/A'
    ? formatearFechaSinZonaHoraria(reporte.periodo.fecha_fin)
    : fechaInicioTexto;

  doc.text(`Desde: ${fechaInicioTexto}`, 14, yPos);
  yPos += 6;
  doc.text(`Hasta: ${fechaFinTexto}`, 14, yPos);
  yPos += 6;

  if (reporte.tipo_documento) {
    doc.text(`Tipo de Documento: ${reporte.tipo_documento.nombre}`, 14, yPos);
    yPos += 6;
  }

  if (reporte.area) {
    doc.text(`Área: ${reporte.area.nombre}`, 14, yPos);
    yPos += 6;
  }

  yPos += 5;

  // === RESUMEN GENERAL ===
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen General', 14, yPos);
  yPos += 7;

  autoTable(doc, {
    startY: yPos,
    head: [['Métrica', 'Cantidad', 'Porcentaje']],
    body: [
      ['Total Enviados', reporte.resumen.total_enviados.toString(), '-'],
      [
        'Completados (finalizados correctamente)',
        reporte.resumen.total_completados.toString(),
        `${reporte.resumen.porcentaje_completados.toFixed(1)}%`,
      ],
      [
        'Entregados (llegaron al trabajador)',
        reporte.resumen.total_entregados.toString(),
        `${reporte.resumen.porcentaje_entregados.toFixed(1)}%`,
      ],
      [
        'Pendientes (sin abrir)',
        reporte.resumen.total_pendientes.toString(),
        `${reporte.resumen.porcentaje_pendientes.toFixed(1)}%`,
      ],
      ['Abiertos', reporte.resumen.total_abiertos.toString(), '-'],
      ['Leídos', reporte.resumen.total_leidos.toString(), '-'],
      ['Firmados', reporte.resumen.total_firmados.toString(), '-'],
      ['Respondidos', reporte.resumen.total_respondidos.toString(), '-'],
      ['Anulados', reporte.resumen.total_anulados.toString(), '-'],
    ],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // === MÉTRICAS DE FIRMA ===
  if (reporte.metricas_firma.requieren_firma > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Métricas de Firma Electrónica', 14, yPos);
    yPos += 7;

    autoTable(doc, {
      startY: yPos,
      head: [['Métrica', 'Cantidad', 'Porcentaje']],
      body: [
        ['Requieren Firma', reporte.metricas_firma.requieren_firma.toString(), '-'],
        [
          'Firmados',
          reporte.metricas_firma.firmados.toString(),
          `${reporte.metricas_firma.porcentaje_firmados.toFixed(1)}%`,
        ],
        ['Pendientes de Firma', reporte.metricas_firma.pendientes_firma.toString(), '-'],
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // === MÉTRICAS DE RESPUESTA ===
  if (reporte.metricas_respuesta.requieren_respuesta > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Métricas de Respuesta de Conformidad', 14, yPos);
    yPos += 7;

    autoTable(doc, {
      startY: yPos,
      head: [['Métrica', 'Cantidad', 'Porcentaje']],
      body: [
        ['Requieren Respuesta', reporte.metricas_respuesta.requieren_respuesta.toString(), '-'],
        [
          'Respondidos',
          reporte.metricas_respuesta.respondidos.toString(),
          `${reporte.metricas_respuesta.porcentaje_respondidos.toFixed(1)}%`,
        ],
        [
          'Pendientes de Respuesta',
          reporte.metricas_respuesta.pendientes_respuesta.toString(),
          '-',
        ],
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // === NUEVA PÁGINA PARA TIEMPOS ===
  doc.addPage();
  yPos = 20;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Tiempos Promedio de Procesamiento', 14, yPos);
  yPos += 7;

  const tiemposBody: any[] = [];
  if (reporte.tiempos_promedio.envio_a_apertura_horas > 0) {
    tiemposBody.push([
      'Envío → Apertura',
      reporte.tiempos_promedio.envio_a_apertura_horas.toFixed(2) + ' h',
    ]);
  }
  if (reporte.tiempos_promedio.envio_a_lectura_horas > 0) {
    tiemposBody.push([
      'Envío → Lectura',
      reporte.tiempos_promedio.envio_a_lectura_horas.toFixed(2) + ' h',
    ]);
  }
  if (reporte.tiempos_promedio.envio_a_firma_horas > 0) {
    tiemposBody.push([
      'Envío → Firma',
      reporte.tiempos_promedio.envio_a_firma_horas.toFixed(2) + ' h',
    ]);
  }
  if (reporte.tiempos_promedio.envio_a_respuesta_horas > 0) {
    tiemposBody.push([
      'Envío → Respuesta',
      reporte.tiempos_promedio.envio_a_respuesta_horas.toFixed(2) + ' h',
    ]);
  }

  if (tiemposBody.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Métrica', 'Tiempo (horas)']],
      body: tiemposBody,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold' },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // === TABLA DE TRÁMITES DETALLADOS ===
  if (tramites && tramites.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Trámites del Periodo (${tramites.length})`, 14, yPos);
    yPos += 7;

    autoTable(doc, {
      startY: yPos,
      head: [['Código', 'Asunto', 'Destinatario', 'Estado', 'Fecha']],
      body: tramites.slice(0, 100).map((t) => [
        t.codigo,
        t.asunto.length > 30 ? t.asunto.substring(0, 27) + '...' : t.asunto,
        `${t.receptor.nombres} ${t.receptor.apellidos}`.substring(0, 25),
        PROCEDURE_STATE_LABELS[t.estado] || t.estado,
        formatearFechaSinZonaHoraria(t.fecha_envio),
      ]),
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 50 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    if (tramites.length > 100) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Nota: Se muestran los primeros 100 trámites de ${tramites.length} totales`,
        14,
        yPos
      );
    }
  }

  // === TOP TRABAJADORES ===
  if (reporte.trabajadores_top.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Top 10 Trabajadores (por tasa de finalización)', 14, yPos);
    yPos += 7;

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Trabajador', 'Recibidos', 'Completados', 'Pendientes', '% Completado']],
      body: reporte.trabajadores_top.map((t, index) => [
        (index + 1).toString(),
        t.nombre_completo,
        t.total_recibidos.toString(),
        t.completados.toString(),
        t.pendientes.toString(),
        `${t.porcentaje_completado.toFixed(1)}%`,
      ]),
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
    });
  }

  // === GUARDAR PDF ===
  const fileName = `Reporte_Tramites_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

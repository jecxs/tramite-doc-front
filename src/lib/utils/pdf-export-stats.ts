// src/lib/utils/pdf-export-stats.ts
import { formatearFechaSinZonaHoraria } from '@/lib/date-utils';
import {
  EstadisticasGenerales,
  EstadisticasPorPeriodo,
  EstadisticasPorTrabajador,
  EstadisticasTiposDocumentos,
  RankingEficiencia,
  TiemposRespuesta,
} from '@/types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DatosParaPDF {
  generales: EstadisticasGenerales | null;
  porPeriodo: EstadisticasPorPeriodo | null;
  porTrabajador: EstadisticasPorTrabajador | null;
  tiempos: TiemposRespuesta | null;
  tiposDocumentos: EstadisticasTiposDocumentos | null;
  ranking: RankingEficiencia | null;
  periodo: string;
}

interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

interface CardData {
  titulo: string;
  valor: number;
  color: [number, number, number];
  simbolo: string;
}

export const exportarEstadisticasAPDF = async (datos: DatosParaPDF): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4') as ExtendedJsPDF;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // ==================== PORTADA ====================
  pdf.setFillColor(117, 36, 133);
  pdf.rect(0, 0, pageWidth, 80, 'F');

  pdf.setFillColor(55, 17, 66);
  pdf.rect(0, 80, pageWidth, 40, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Reporte de Estadísticas', pageWidth / 2, 40, { align: 'center' });

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  const periodoLabel: Record<string, string> = {
    semana: 'Última Semana',
    mes: 'Último Mes',
    trimestre: 'Último Trimestre',
    anio: 'Último Año',
  };

  pdf.text(periodoLabel[datos.periodo] || 'Período Seleccionado', pageWidth / 2, 55, {
    align: 'center',
  });

  pdf.setFontSize(10);
  const fechaActual = formatearFechaSinZonaHoraria(new Date().toISOString(), 'dd/MM/yyyy HH:mm');
  pdf.text(`Generado el: ${fechaActual}`, pageWidth / 2, 70, { align: 'center' });

  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.5);
  pdf.line(margin, 85, pageWidth - margin, 85);

  pdf.setFontSize(12);
  pdf.text('Sistema de Gestión de Trámites Documentarios', pageWidth / 2, 100, {
    align: 'center',
  });

  // ==================== PÁGINA 2: RESUMEN EJECUTIVO ====================
  pdf.addPage();
  yPosition = margin;

  pdf.setFillColor(117, 36, 133);
  pdf.rect(0, yPosition, pageWidth, 12, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RESUMEN EJECUTIVO', margin, yPosition + 8);

  yPosition += 20;
  pdf.setTextColor(0, 0, 0);

  if (datos.generales) {
    const cardWidth = (pageWidth - 3 * margin) / 2;
    const cardHeight = 35;

    const cards: CardData[] = [
      {
        titulo: 'Total Enviados',
        valor: datos.generales.resumen.total_enviados,
        color: [59, 130, 246],
        simbolo: '>',
      },
      {
        titulo: 'Pendientes',
        valor: datos.generales.resumen.pendientes,
        color: [251, 146, 60],
        simbolo: '...',
      },
      {
        titulo: 'Completados',
        valor: datos.generales.resumen.completados,
        color: [34, 197, 94],
        simbolo: 'OK',
      },
      {
        titulo: 'Anulados',
        valor: datos.generales.resumen.anulados,
        color: [239, 68, 68],
        simbolo: 'X',
      },
    ];

    cards.forEach((card, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + col * (cardWidth + margin);
      const y = yPosition + row * (cardHeight + 10);

      pdf.setFillColor(200, 200, 200);
      pdf.roundedRect(x + 2, y + 2, cardWidth, cardHeight, 3, 3, 'F');

      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');

      const [r, g, b] = card.color;
      pdf.setFillColor(r, g, b);
      pdf.rect(x, y, cardWidth, 4, 'F');

      pdf.setFontSize(14);
      pdf.setTextColor(r, g, b);
      pdf.setFont('helvetica', 'bold');
      pdf.text(card.simbolo, x + 8, y + 18);

      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('helvetica', 'normal');
      pdf.text(card.titulo, x + 20, y + 14);

      pdf.setFontSize(24);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(card.valor.toString(), x + 20, y + 27);
    });

    yPosition += 90;

    pdf.setFillColor(240, 240, 240);
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 45, 3, 3, 'F');

    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INDICADORES DE RENDIMIENTO', margin + 5, yPosition + 10);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const metricas: string[] = [
      `Tiempo promedio de respuesta: ${datos.generales.rendimiento.promedio_tiempo_respuesta_horas.toFixed(1)}h`,
      `Tasa de firmas: ${datos.generales.rendimiento.tasa_firmas_porcentaje.toFixed(1)}%`,
      `Observaciones pendientes: ${datos.generales.rendimiento.observaciones_pendientes}`,
      `Tasa de completado: ${datos.generales.resumen.porcentaje_completados.toFixed(1)}%`,
    ];

    metricas.forEach((metrica, index) => {
      pdf.text(`• ${metrica}`, margin + 10, yPosition + 20 + index * 8);
    });
  }

  // ==================== PÁGINA 3: GRÁFICOS ====================
  pdf.addPage();
  yPosition = margin;

  pdf.setFillColor(117, 36, 133);
  pdf.rect(0, yPosition, pageWidth, 12, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ANÁLISIS GRÁFICO', margin, yPosition + 8);

  yPosition += 20;

  // GRÁFICO DE LÍNEAS CON ENCABEZADO
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tendencia de Trámites en el Tiempo', margin, yPosition);
  yPosition += 5;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Evolución diaria del número de trámites enviados', margin, yPosition);
  yPosition += 10;

  const graficoLineas = document.querySelector('[data-chart="lineas"]') as HTMLElement | null;
  if (graficoLineas) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(graficoLineas, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: graficoLineas.scrollWidth,
        height: graficoLineas.scrollHeight,
        windowWidth: graficoLineas.scrollWidth,
        windowHeight: graficoLineas.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, 100);

      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 15;
    } catch (error) {
      console.error('Error capturando gráfico de líneas:', error);
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(10);
      pdf.text('Error al capturar gráfico de tendencias', margin, yPosition);
      yPosition += 15;
    }
  }

  // GRÁFICO DE PASTEL CON ENCABEZADO
  if (yPosition + 100 > pageHeight - margin) {
    pdf.addPage();
    yPosition = margin;
  }

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Distribución por Estados', margin, yPosition);
  yPosition += 5;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Proporción de trámites según su estado actual', margin, yPosition);
  yPosition += 10;

  const graficoPastel = document.querySelector('[data-chart="pastel"]') as HTMLElement | null;
  if (graficoPastel) {
    try {
      const canvas = await html2canvas(graficoPastel, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: graficoPastel.scrollWidth,
        height: graficoPastel.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, 100);

      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 15;
    } catch (error) {
      console.error('Error capturando gráfico de pastel:', error);
    }
  }

  // ==================== PÁGINA 4: RANKING DE TRABAJADORES ====================
  if (datos.ranking) {
    pdf.addPage();
    yPosition = margin;

    pdf.setFillColor(117, 36, 133);
    pdf.rect(0, yPosition, pageWidth, 12, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RANKING DE EFICIENCIA', margin, yPosition + 8);

    yPosition += 20;

    // TOP COMPLETADO
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top Trabajadores - Porcentaje Completado', margin, yPosition);
    yPosition += 5;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Trabajadores con mayor tasa de trámites completados', margin, yPosition);
    yPosition += 10;

    const tableData = datos.ranking.top_completado
      .slice(0, 5)
      .map((t, index) => [
        `${index + 1}°`,
        t.nombre_completo,
        `${t.completados}/${t.total_recibidos}`,
        `${t.porcentaje_completado.toFixed(1)}%`,
      ]);

    autoTable(pdf, {
      startY: yPosition,
      head: [['Pos.', 'Trabajador', 'Completados', '% Completado']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [117, 36, 133],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
      },
    });

    yPosition = pdf.lastAutoTable?.finalY ? pdf.lastAutoTable.finalY + 20 : yPosition + 80;

    // TOP VELOCIDAD
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Top Trabajadores - Velocidad de Respuesta', margin, yPosition);
    yPosition += 5;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Trabajadores con menor tiempo promedio de respuesta', margin, yPosition);
    yPosition += 10;

    const tableData2 = datos.ranking.top_velocidad
      .slice(0, 5)
      .map((t, index) => [
        `${index + 1}°`,
        t.nombre_completo,
        `${t.promedio_tiempo_respuesta_horas.toFixed(1)}h`,
      ]);

    autoTable(pdf, {
      startY: yPosition,
      head: [['Pos.', 'Trabajador', 'Tiempo Promedio']],
      body: tableData2,
      theme: 'striped',
      headStyles: {
        fillColor: [117, 36, 133],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 35, halign: 'center' },
      },
    });
  }

  // ==================== PÁGINA 5: TIPOS DE DOCUMENTOS ====================
  if (datos.tiposDocumentos) {
    pdf.addPage();
    yPosition = margin;

    pdf.setFillColor(117, 36, 133);
    pdf.rect(0, yPosition, pageWidth, 12, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TIPOS DE DOCUMENTOS', margin, yPosition + 8);

    yPosition += 20;

    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Distribución de Documentos por Tipo', margin, yPosition);
    yPosition += 5;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Cantidad de trámites según tipo de documento', margin, yPosition);
    yPosition += 10;

    const tiposTableData = datos.tiposDocumentos.distribucion
      .slice(0, 10)
      .map((tipo) => [
        tipo.nombre,
        tipo.total.toString(),
        tipo.firmados.toString(),
        tipo.pendientes.toString(),
      ]);

    autoTable(pdf, {
      startY: yPosition,
      head: [['Tipo de Documento', 'Total', 'Firmados', 'Pendientes']],
      body: tiposTableData,
      theme: 'striped',
      headStyles: {
        fillColor: [117, 36, 133],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
      },
    });
  }

  // ==================== PÁGINA 6: ANÁLISIS DE TIEMPOS ====================
  if (datos.tiempos) {
    pdf.addPage();
    yPosition = margin;

    pdf.setFillColor(117, 36, 133);
    pdf.rect(0, yPosition, pageWidth, 12, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ANÁLISIS DE TIEMPOS', margin, yPosition + 8);

    yPosition += 20;

    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Tiempos de Procesamiento de Trámites', margin, yPosition);
    yPosition += 5;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      `Análisis basado en ${datos.tiempos.total_muestras} trámites completados`,
      margin,
      yPosition,
    );
    yPosition += 15;

    const tiemposTableData = [
      [
        'Envío → Apertura',
        `${datos.tiempos.envio_a_apertura.promedio.toFixed(1)}h`,
        `${datos.tiempos.envio_a_apertura.minimo.toFixed(1)}h`,
        `${datos.tiempos.envio_a_apertura.maximo.toFixed(1)}h`,
      ],
      [
        'Apertura → Lectura',
        `${datos.tiempos.apertura_a_lectura.promedio.toFixed(1)}h`,
        `${datos.tiempos.apertura_a_lectura.minimo.toFixed(1)}h`,
        `${datos.tiempos.apertura_a_lectura.maximo.toFixed(1)}h`,
      ],
      [
        'Lectura → Firma',
        `${datos.tiempos.lectura_a_firma.promedio.toFixed(1)}h`,
        `${datos.tiempos.lectura_a_firma.minimo.toFixed(1)}h`,
        `${datos.tiempos.lectura_a_firma.maximo.toFixed(1)}h`,
      ],
      [
        'Tiempo Total',
        `${datos.tiempos.tiempo_total.promedio.toFixed(1)}h`,
        `${datos.tiempos.tiempo_total.minimo.toFixed(1)}h`,
        `${datos.tiempos.tiempo_total.maximo.toFixed(1)}h`,
      ],
    ];

    autoTable(pdf, {
      startY: yPosition,
      head: [['Fase', 'Promedio', 'Mínimo', 'Máximo']],
      body: tiemposTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [117, 36, 133],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: { fontSize: 10, cellPadding: 4 },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold' },
        1: { cellWidth: 35, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
      },
    });
  }

  // ==================== PIE DE PÁGINA ====================
  const totalPages = pdf.internal.pages.length - 1;

  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.setFont('helvetica', 'normal');

    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    pdf.text('Sistema de Gestión de Trámites Documentarios', margin, pageHeight - 10);

    pdf.text(fechaActual, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  // Guardar PDF
  const nombreArchivo = `estadisticas_${datos.periodo}_${new Date().getTime()}.pdf`;
  pdf.save(nombreArchivo);
};

// src/lib/date-utils.ts
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha string (YYYY-MM-DD) SIN interpretarla como UTC
 * Esto previene el bug de zona horaria en date-fns
 */
export const formatearFechaSinZonaHoraria = (fechaStr: string, formato: string = 'dd MMM'): string => {
  try {
    // Dividir la fecha en partes (YYYY-MM-DD)
    const [year, month, day] = fechaStr.split('-').map(Number);

    // Crear fecha local (sin interpretación UTC)
    const fecha = new Date(year, month - 1, day);

    return format(fecha, formato, { locale: es });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return fechaStr;
  }
};

/**
 * Alternativa usando parseISO + ajuste manual
 */
export const formatearFechaV2 = (fechaStr: string, formato: string = 'dd MMM'): string => {
  try {
    // Agregar hora local para evitar interpretación UTC
    const fecha = parseISO(fechaStr + 'T12:00:00');
    return format(fecha, formato, { locale: es });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return fechaStr;
  }
};

/**
 * Para fechas completas con hora (ISO string)
 */
export const formatearFechaHora = (fechaISO: string, formato: string = 'dd MMM yyyy, HH:mm'): string => {
  try {
    const fecha = parseISO(fechaISO);
    return format(fecha, formato, { locale: es });
  } catch (error) {
    console.error('Error formateando fecha-hora:', error);
    return fechaISO;
  }
};

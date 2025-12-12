// src/lib/date-utils.ts
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha sin considerar zona horaria
 * Acepta: string (YYYY-MM-DD o ISO), Date object, null, undefined
 */
export const formatearFechaSinZonaHoraria = (
  fechaInput: string | Date | null | undefined,
  formato: string = 'dd MMM'
): string => {
  try {
    // Manejar null/undefined
    if (!fechaInput) {
      return 'N/A';
    }

    // Si ya es un Date object
    if (fechaInput instanceof Date) {
      if (isNaN(fechaInput.getTime())) {
        return 'Fecha inválida';
      }
      return format(fechaInput, formato, { locale: es });
    }

    // Convertir a string si no lo es
    const fechaStr = String(fechaInput).trim();

    // Si está vacío después del trim
    if (!fechaStr) {
      return 'N/A';
    }

    // Caso 1: Formato ISO completo con timestamp (2025-12-07T15:02:12.825Z)
    if (fechaStr.includes('T')) {
      const fecha = parseISO(fechaStr);
      if (isNaN(fecha.getTime())) {
        return 'Fecha inválida';
      }
      return format(fecha, formato, { locale: es });
    }

    // Caso 2: Formato YYYY-MM-DD
    if (fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = fechaStr.split('-').map(Number);

      // Validar rangos
      if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
        console.warn('Fecha fuera de rango:', fechaStr);
        return 'Fecha inválida';
      }

      // Crear fecha local (sin interpretación UTC)
      const fecha = new Date(year, month - 1, day);

      if (isNaN(fecha.getTime())) {
        return 'Fecha inválida';
      }

      return format(fecha, formato, { locale: es });
    }

    // Caso 3: Intentar parseISO como último recurso
    const fecha = parseISO(fechaStr);
    if (isNaN(fecha.getTime())) {
      console.warn('Formato de fecha no reconocido:', fechaStr);
      return fechaStr; // Retornar el string original
    }

    return format(fecha, formato, { locale: es });

  } catch (error) {
    console.error('Error formateando fecha:', error, 'Input:', fechaInput);
    return fechaInput ? String(fechaInput) : 'N/A';
  }
};

/**
 * Alternativa usando parseISO + ajuste manual
 */
export const formatearFechaV2 = (
  fechaInput: string | Date | null | undefined,
  formato: string = 'dd MMM'
): string => {
  try {
    if (!fechaInput) return 'N/A';

    let fechaStr: string;

    if (fechaInput instanceof Date) {
      if (isNaN(fechaInput.getTime())) return 'Fecha inválida';
      return format(fechaInput, formato, { locale: es });
    }

    fechaStr = String(fechaInput);

    // Si ya tiene timestamp, parsearlo directamente
    if (fechaStr.includes('T')) {
      const fecha = parseISO(fechaStr);
      return format(fecha, formato, { locale: es });
    }

    // Agregar hora local para evitar interpretación UTC
    const fecha = parseISO(fechaStr + 'T12:00:00');
    return format(fecha, formato, { locale: es });
  } catch (error) {
    console.error('Error formateando fecha V2:', error);
    return fechaInput ? String(fechaInput) : 'N/A';
  }
};

/**
 * Para fechas completas con hora (ISO string o Date)
 */
export const formatearFechaHora = (
  fechaInput: string | Date | null | undefined,
  formato: string = 'dd MMM yyyy, HH:mm'
): string => {
  try {
    if (!fechaInput) return 'N/A';

    if (fechaInput instanceof Date) {
      if (isNaN(fechaInput.getTime())) return 'Fecha inválida';
      return format(fechaInput, formato, { locale: es });
    }

    const fecha = parseISO(String(fechaInput));
    if (isNaN(fecha.getTime())) {
      return 'Fecha inválida';
    }
    return format(fecha, formato, { locale: es });
  } catch (error) {
    console.error('Error formateando fecha-hora:', error);
    return fechaInput ? String(fechaInput) : 'N/A';
  }
};

/**
 * Formatea fecha completa con formato largo
 */
export const formatearFechaLarga = (
  fechaInput: string | Date | null | undefined
): string => {
  return formatearFechaSinZonaHoraria(fechaInput, 'dd/MM/yyyy');
};

/**
 * Formatea solo la fecha sin año
 */
export const formatearFechaCorta = (
  fechaInput: string | Date | null | undefined
): string => {
  return formatearFechaSinZonaHoraria(fechaInput, 'dd MMM');
};

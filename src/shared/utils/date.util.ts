import { ComplaintDateFields } from '../interfaces/complaint-date.interrface';

export class DateUtil {
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }

  static addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  static isExpired(date: Date): boolean {
    return new Date() > date;
  }

  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static formatDateTime(date: Date): string {
    return date.toISOString();
  }

  static startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  static endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  static minutesUntil(date: Date): number {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
  }

  static hoursUntil(date: Date): number {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  }

  static daysUntil(date: Date): number {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  /**
   * Convierte de manera segura cualquier valor a Date o null
   * @param dateValue - Valor que puede ser Date, string, number o null/undefined
   * @returns Date válido, null si no se puede convertir, o null si es null/undefined
   */
  static ensureDate(dateValue: unknown): Date | null {
    // Si es null o undefined, retornar null
    if (dateValue == null) {
      return null;
    }

    // Si ya es una instancia de Date válida, retornarla
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }

    // Si es string, intentar parsear
    if (typeof dateValue === 'string') {
      if (dateValue.trim() === '') {
        return null;
      }
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    // Si es number (timestamp), convertir
    if (typeof dateValue === 'number') {
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    // Para cualquier otro tipo, retornar null
    return null;
  }

  /**
   * Convierte de manera segura una entidad complaint asegurando que todas las fechas sean Date
   * @param complaint - Entidad complaint que puede tener fechas como strings
   * @returns Entidad con todas las fechas convertidas a Date
   */
  static ensureComplaintDates<T extends ComplaintDateFields>(complaint: T): T {
    if (!complaint) {
      return complaint;
    }

    // Crear una copia mutable del objeto
    const result = { ...complaint };

    // Lista de campos de fecha tipados
    const dateFields: (keyof ComplaintDateFields)[] = [
      'complaintDate',
      'responseCommunicationDate',
      'responseDate',
      'closureDate',
      'purchaseDate',
      'indecopiNotificationDate',
      'createdAt',
      'updatedAt',
    ] as const;

    // ✅ CORRECCIÓN: Convertir cada campo de fecha de manera tipada y segura
    dateFields.forEach((field) => {
      if (field in complaint && complaint[field] !== undefined) {
        const currentValue = complaint[field];
        const convertedDate = this.ensureDate(currentValue);

        // Usar Object.assign para asignación segura
        Object.assign(result, { [field]: convertedDate });
      }
    });

    return result;
  }
}

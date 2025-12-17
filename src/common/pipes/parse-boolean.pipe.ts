import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Pipe personalizado para transformar query parameters string a boolean correctamente.
 * Resuelve el problema de enableImplicitConversion que convierte "false" a true.
 */
@Injectable()
export class ParseBooleanPipe implements PipeTransform {
  transform(value: any): boolean | undefined {
    // Si el valor es undefined, null o string vacía, retornar undefined
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    // Si ya es boolean, retornarlo tal como está
    if (typeof value === 'boolean') {
      return value;
    }

    // Si es string, convertir explícitamente
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();

      if (lowerValue === 'true' || lowerValue === '1') {
        return true;
      }

      if (lowerValue === 'false' || lowerValue === '0') {
        return false;
      }

      // Si no es un valor booleano válido, lanzar error
      throw new BadRequestException(`Invalid boolean value: "${value}". Expected: true, false, 1, 0`);
    }

    // Para números
    if (typeof value === 'number') {
      if (value === 1) return true;
      if (value === 0) return false;
      throw new BadRequestException(`Invalid boolean number: ${value}. Expected: 1 or 0`);
    }

    // Para cualquier otro tipo, lanzar error
    throw new BadRequestException(`Cannot convert ${typeof value} to boolean`);
  }
}

import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

/**
 * Decorador personalizado para transformar query parameters a boolean correctamente
 * Maneja explícitamente los casos de "true", "false" y valores undefined/null
 */
export function BooleanTransform() {
  return Transform(({ value, key }) => {
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

      // Lanzar error para valores inválidos
      throw new BadRequestException(`Invalid boolean value for ${key}: "${value}". Expected: true, false, 1, or 0`);
    }

    // Para cualquier otro tipo, lanzar error
    throw new BadRequestException(`Invalid type for ${key}: expected boolean, got ${typeof value}`);
  });
}

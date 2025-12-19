import { ApiProperty } from '@nestjs/swagger';
import { TrabajadorResponseDto } from '../../trabajadores/dto/trabajador-response.dto';
import { LogResponseDto } from './log-response.dto';

export class TrabajadorFlujoResponseDto {
  @ApiProperty({ description: 'Información del trabajador' })
  trabajador: TrabajadorResponseDto;

  @ApiProperty({ description: 'Lista de logs ordenados cronológicamente', type: [LogResponseDto] })
  logs: LogResponseDto[];

  @ApiProperty({ description: 'Resumen del flujo' })
  resumen: {
    totalLogs: number;
    primeraAccion: Date | null;
    ultimaAccion: Date | null;
    estadoCanasta: string;
    estadoRegalos: string;
    usuariosInvolucrados: {
      id: string;
      nombreCompleto: string;
      rol: string;
      cantidadAcciones: number;
    }[];
  };

  constructor(partial: Partial<TrabajadorFlujoResponseDto>) {
    Object.assign(this, partial);
  }
}
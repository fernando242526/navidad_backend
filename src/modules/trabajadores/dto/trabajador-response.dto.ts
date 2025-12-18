import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoCanasta, EstadoRegalos, AuditorioCanasta, AuditorioJuguetes } from '../entities/trabajador.entity';

export class TrabajadorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  dni: string;

  @ApiProperty()
  nombresCompletos: string;

  @ApiProperty()
  fechaIngreso: Date;

  @ApiPropertyOptional({ nullable: true })
  funcion: string | null;

  @ApiPropertyOptional({ nullable: true })
  tipoCanasta: string | null;

  @ApiProperty({ enum: EstadoCanasta })
  estadoCanasta: EstadoCanasta;

  @ApiProperty({ enum: EstadoRegalos })
  estadoRegalos: EstadoRegalos;

  @ApiProperty({ enum: AuditorioCanasta })
  auditorioCanasta: AuditorioCanasta;

  @ApiPropertyOptional({ enum: AuditorioJuguetes, nullable: true })
  auditorioJuguetes: AuditorioJuguetes | null;

  @ApiPropertyOptional({ nullable: true })
  idCanasta: string | null;

  @ApiPropertyOptional({ nullable: true })
  fechaHoraEntregaCanasta: Date | null;

  @ApiPropertyOptional({ nullable: true })
  fechaHoraEntregaJuguetes: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<TrabajadorResponseDto>) {
    Object.assign(this, partial);
  }
}
import { IsNotEmpty, IsString, IsDateString, MaxLength, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditorioCanasta, AuditorioJuguetes } from '../entities/trabajador.entity';

export class CreateTrabajadorDto {
  @ApiProperty({ description: 'DNI del trabajador', example: '12345678' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  dni: string;

  @ApiProperty({ description: 'Nombres completos del trabajador', example: 'Juan Pérez García' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  nombresCompletos: string;

  @ApiProperty({ description: 'Fecha de ingreso del trabajador', example: '2024-01-15' })
  @IsNotEmpty()
  @IsDateString()
  fechaIngreso: string;

  @ApiPropertyOptional({ description: 'Función del trabajador', example: 'Operario de campo', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  funcion?: string | null;

  @ApiPropertyOptional({ description: 'Tipo de canasta asignada', example: 'Canasta Tipo 1', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipoCanasta?: string | null;

  @ApiProperty({ 
    description: 'Auditorio asignado para entrega de canasta', 
    enum: AuditorioCanasta,
    example: AuditorioCanasta.AUDITORIO_2 
  })
  @IsNotEmpty()
  @IsEnum(AuditorioCanasta)
  auditorioCanasta: AuditorioCanasta;

  @ApiPropertyOptional({ 
    description: 'Auditorio asignado para entrega de juguetes (si aplica)', 
    enum: AuditorioJuguetes,
    example: AuditorioJuguetes.AUDITORIO_1,
    nullable: true 
  })
  @IsOptional()
  @IsEnum(AuditorioJuguetes)
  auditorioJuguetes?: AuditorioJuguetes | null;
}
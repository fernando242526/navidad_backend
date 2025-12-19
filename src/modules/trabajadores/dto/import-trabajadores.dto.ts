import { IsNotEmpty, IsString, IsDateString, MaxLength, MinLength, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { AuditorioCanasta, AuditorioJuguetes } from '../entities/trabajador.entity';

export class ImportTrabajadorRowDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  dni: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  correlativo: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  nombresCompletos: string;

  @IsNotEmpty()
  @IsDateString()
  fechaIngreso: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  funcion?: string | null;
  
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipoCanasta?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipoJuguete?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0) 
  hijos?: number | null;

  @IsNotEmpty()
  @IsEnum(AuditorioCanasta)
  auditorioCanasta: AuditorioCanasta;

  @IsOptional()
  @IsEnum(AuditorioJuguetes)
  auditorioJuguetes?: AuditorioJuguetes | null;
}
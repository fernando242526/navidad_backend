import { IsOptional, IsEnum, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { EstadoCanasta, EstadoRegalos, AuditorioCanasta } from '../entities/trabajador.entity';

export class TrabajadorFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado de canasta',
    enum: EstadoCanasta,
  })
  @IsOptional()
  @IsEnum(EstadoCanasta)
  estadoCanasta?: EstadoCanasta;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de regalos',
    enum: EstadoRegalos,
  })
  @IsOptional()
  @IsEnum(EstadoRegalos)
  estadoRegalos?: EstadoRegalos;

  @ApiPropertyOptional({
    description: 'Filtrar por auditorio de canasta',
    enum: AuditorioCanasta,
  })
  @IsOptional()
  @IsEnum(AuditorioCanasta)
  auditorioCanasta?: AuditorioCanasta;

  @ApiPropertyOptional({
    description: 'Buscar por DNI o nombres',
    example: 'Juan',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;
}
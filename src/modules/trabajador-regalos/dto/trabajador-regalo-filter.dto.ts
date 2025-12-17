import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class TrabajadorRegaloFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de trabajador',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  idTrabajador?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de regalo',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  idRegalo?: string;
}
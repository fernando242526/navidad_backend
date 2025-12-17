import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class RegaloFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Buscar por código QR',
    example: 'REGALO-001',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;
}
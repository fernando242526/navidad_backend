import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TrabajadorResponseDto } from '../../trabajadores/dto/trabajador-response.dto';
import { RegaloResponseDto } from '../../regalos/dto/regalo-response.dto';

export class TrabajadorRegaloResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  idTrabajador: string;

  @ApiProperty()
  idRegalo: string;

  @ApiPropertyOptional({ type: () => TrabajadorResponseDto })
  trabajador?: TrabajadorResponseDto;

  @ApiPropertyOptional({ type: () => RegaloResponseDto })
  regalo?: RegaloResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<TrabajadorRegaloResponseDto>) {
    Object.assign(this, partial);
  }
}
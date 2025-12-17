import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TrabajadorResponseDto } from '../../trabajadores/dto/trabajador-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class LogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  idTrabajador: string;

  @ApiProperty()
  idUsuario: string;

  @ApiProperty()
  peticionHecha: string;

  @ApiProperty()
  fechaHora: Date;

  @ApiPropertyOptional({ type: () => TrabajadorResponseDto })
  trabajador?: TrabajadorResponseDto;

  @ApiPropertyOptional({ type: () => UserResponseDto })
  usuario?: UserResponseDto;

  @ApiProperty()
  createdAt: Date;

  constructor(partial: Partial<LogResponseDto>) {
    Object.assign(this, partial);
  }
}
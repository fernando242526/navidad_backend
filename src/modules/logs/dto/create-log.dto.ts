import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLogDto {
  @ApiProperty({ 
    description: 'ID del trabajador', 
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @IsNotEmpty()
  @IsUUID()
  idTrabajador: string;

  @ApiProperty({ 
    description: 'ID del usuario que hizo la petición', 
    example: '123e4567-e89b-12d3-a456-426614174001' 
  })
  @IsNotEmpty()
  @IsUUID()
  idUsuario: string;

  @ApiProperty({ 
    description: 'Descripción de la petición realizada', 
    example: 'GET /trabajadores/dni/12345678' 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  peticionHecha: string;
}
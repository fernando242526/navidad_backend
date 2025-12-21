import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrarObservacionDto {
  @ApiProperty({ 
    description: 'Observación del trabajador', 
    example: 'Trabajador presentó documentación incompleta' 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  observacion: string;
}
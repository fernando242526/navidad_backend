import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrarIngresoAuditorioDto {
  @ApiProperty({ 
    description: 'DNI del trabajador escaneado', 
    example: '12345678' 
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  dni: string;
}
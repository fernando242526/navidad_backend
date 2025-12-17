import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegaloDto {
  @ApiProperty({ 
    description: 'Código QR único del regalo', 
    example: 'REGALO-001-2024' 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  codigoQr: string;
}
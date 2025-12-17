import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidarRegaloDto {
  @ApiProperty({ 
    description: 'Código QR del regalo', 
    example: 'REGALO-001-2024' 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  codigoQr: string;
}
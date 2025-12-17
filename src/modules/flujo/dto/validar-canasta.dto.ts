import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidarCanastaDto {
  @ApiProperty({ 
    description: 'Código QR de la canasta', 
    example: 'CANASTA-001-2024' 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  codigoQr: string;
}
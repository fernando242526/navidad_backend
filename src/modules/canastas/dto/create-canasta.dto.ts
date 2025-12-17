import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCanastaDto {
  @ApiProperty({ 
    description: 'Código QR único de la canasta', 
    example: 'CANASTA-001-2024' 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  codigoQr: string;
}
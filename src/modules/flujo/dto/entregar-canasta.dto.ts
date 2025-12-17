import { IsNotEmpty, IsString, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EntregarCanastaDto {
  @ApiProperty({ 
    description: 'DNI del trabajador', 
    example: '12345678' 
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  dni: string;

  @ApiProperty({ 
    description: 'ID de la canasta a entregar', 
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @IsNotEmpty()
  @IsUUID()
  idCanasta: string;
}
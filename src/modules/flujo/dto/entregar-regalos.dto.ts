import { IsNotEmpty, IsString, IsArray, ArrayMinSize, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EntregarRegalosDto {
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
    description: 'Array de IDs de regalos a entregar', 
    example: ['123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002'],
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  regalos: string[];
}
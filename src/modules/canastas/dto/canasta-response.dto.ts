import { ApiProperty } from '@nestjs/swagger';

export class CanastaResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  codigoQr: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<CanastaResponseDto>) {
    Object.assign(this, partial);
  }
}
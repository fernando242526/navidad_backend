import { ApiProperty } from '@nestjs/swagger';

export class RegaloResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  codigoQr: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<RegaloResponseDto>) {
    Object.assign(this, partial);
  }
}
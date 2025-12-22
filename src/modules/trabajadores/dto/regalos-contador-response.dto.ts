import { ApiProperty } from '@nestjs/swagger';

export class RegalosContadorResponseDto {
  @ApiProperty({ description: 'Total de regalos (hijos) entregados' })
  totalRegalosEntregados: number;

  constructor(totalRegalosEntregados: number) {
    this.totalRegalosEntregados = totalRegalosEntregados;
  }
}
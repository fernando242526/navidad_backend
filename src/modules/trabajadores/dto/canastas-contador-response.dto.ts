import { ApiProperty } from '@nestjs/swagger';

export class CanastasContadorResponseDto {
  @ApiProperty({ description: 'Total de canastas entregadas en Auditorio 2' })
  auditorio2: number;

  @ApiProperty({ description: 'Total de canastas entregadas en Auditorio 3' })
  auditorio3: number;

  @ApiProperty({ description: 'Total general de canastas entregadas' })
  totalEntregadas: number;

  constructor(auditorio2: number, auditorio3: number) {
    this.auditorio2 = auditorio2;
    this.auditorio3 = auditorio3;
    this.totalEntregadas = auditorio2 + auditorio3;
  }
}
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TrabajadorResponseDto } from '../../trabajadores/dto/trabajador-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class LogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  idTrabajador: string;

  @ApiProperty()
  idUsuario: string;

  @ApiProperty()
  peticionHecha: string;

  @ApiProperty()
  fechaHora: Date;

  @ApiPropertyOptional({ type: () => TrabajadorResponseDto })
  trabajador?: TrabajadorResponseDto;

  @ApiPropertyOptional({ type: () => UserResponseDto })
  usuario?: UserResponseDto;

  @ApiProperty()
  createdAt: Date;

  // ✅ NUEVAS PROPIEDADES OPCIONALES
  @ApiPropertyOptional({ 
    enum: ['VENTANILLA', 'SEGURIDAD_CANASTA', 'SEGURIDAD_REGALOS', 'ENTREGA_CANASTA', 'ENTREGA_REGALOS', 'CONSULTA'],
    description: 'Tipo de acción realizada'
  })
  accionTipo?: 'VENTANILLA' | 'SEGURIDAD_CANASTA' | 'SEGURIDAD_REGALOS' | 'ENTREGA_CANASTA' | 'ENTREGA_REGALOS' | 'CONSULTA';

  @ApiPropertyOptional({ 
    description: 'Descripción legible de la acción',
    example: 'Registró en ventanilla'
  })
  descripcionLegible?: string;

  constructor(partial: Partial<LogResponseDto>) {
    Object.assign(this, partial);
    
    // ✅ Generar descripción legible automáticamente
    if (this.peticionHecha) {
      this.descripcionLegible = this.generarDescripcionLegible(this.peticionHecha);
      this.accionTipo = this.determinarTipoAccion(this.peticionHecha);
    }
  }

  // ✅ MÉTODOS HELPER PRIVADOS
  private generarDescripcionLegible(peticion: string): string {
    if (peticion.includes('ventanilla/registrar')) return 'Registró en ventanilla';
    if (peticion.includes('seguridad-canasta/ingreso')) return 'Validó ingreso a auditorio de canastas';
    if (peticion.includes('seguridad-regalos/ingreso')) return 'Validó ingreso a auditorio de regalos';
    if (peticion.includes('encargado-canasta/entregar')) return 'Entregó canasta';
    if (peticion.includes('encargado-regalos/entregar')) return 'Entregó regalos';
    if (peticion.includes('GET /flujo/trabajador/dni')) return 'Consultó información';
    return 'Acción registrada';
  }

  private determinarTipoAccion(peticion: string): 'VENTANILLA' | 'SEGURIDAD_CANASTA' | 'SEGURIDAD_REGALOS' | 'ENTREGA_CANASTA' | 'ENTREGA_REGALOS' | 'CONSULTA' {
    if (peticion.includes('ventanilla/registrar')) return 'VENTANILLA';
    if (peticion.includes('seguridad-canasta/ingreso')) return 'SEGURIDAD_CANASTA';
    if (peticion.includes('seguridad-regalos/ingreso')) return 'SEGURIDAD_REGALOS';
    if (peticion.includes('encargado-canasta/entregar')) return 'ENTREGA_CANASTA';
    if (peticion.includes('encargado-regalos/entregar')) return 'ENTREGA_REGALOS';
    return 'CONSULTA';
  }
}
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

export enum EstadoCanasta {
  PENDIENTE = 'PENDIENTE',
  VENTANILLA_ESCANEADO = 'VENTANILLA_ESCANEADO',
  AUDITORIO_INGRESADO = 'AUDITORIO_INGRESADO',
  CANASTA_ENTREGADA = 'CANASTA_ENTREGADA',
}

export enum EstadoRegalos {
  PENDIENTE = 'PENDIENTE',
  VENTANILLA_ESCANEADO = 'VENTANILLA_ESCANEADO',
  AUDITORIO_INGRESADO = 'AUDITORIO_INGRESADO',
  JUGUETES_ENTREGADOS = 'JUGUETES_ENTREGADOS',
}

export enum AuditorioCanasta {
  AUDITORIO_2 = 'AUDITORIO_2',
  AUDITORIO_3 = 'AUDITORIO_3',
}

export enum AuditorioJuguetes {
  AUDITORIO_1 = 'AUDITORIO_1',
}

@Entity('trabajadores')
@Index(['dni'], { unique: true })
export class Trabajador extends BaseEntity {
  @Column({ type: 'varchar', length: 20, unique: true })
  dni: string;

  @Column({ type: 'varchar', length: 255, name: 'nombres_completos' })
  nombresCompletos: string;

  @Column({ type: 'date', name: 'fecha_ingreso' })
  fechaIngreso: Date;

  @Column({ type: 'varchar', length: 100 })
  funcion: string;

  @Column({ type: 'varchar', length: 50, name: 'tipo_canasta' })
  tipoCanasta: string;

  @Column({
    type: 'enum',
    enum: EstadoCanasta,
    default: EstadoCanasta.PENDIENTE,
    name: 'estado_canasta',
  })
  estadoCanasta: EstadoCanasta;

  @Column({
    type: 'enum',
    enum: EstadoRegalos,
    default: EstadoRegalos.PENDIENTE,
    name: 'estado_regalos',
  })
  estadoRegalos: EstadoRegalos;

  @Column({
    type: 'enum',
    enum: AuditorioCanasta,
    name: 'auditorio_canasta',
  })
  auditorioCanasta: AuditorioCanasta;

  @Column({
    type: 'enum',
    enum: AuditorioJuguetes,
    nullable: true,
    name: 'auditorio_juguetes',
  })
  auditorioJuguetes: AuditorioJuguetes | null;

  @Column({ type: 'uuid', nullable: true, name: 'id_canasta' })
  idCanasta: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'fecha_hora_entrega_canasta' })
  fechaHoraEntregaCanasta: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'fecha_hora_entrega_juguetes' })
  fechaHoraEntregaJuguetes: Date | null;
}
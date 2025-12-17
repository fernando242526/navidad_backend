import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';
import { Regalo } from '../../regalos/entities/regalo.entity';

@Entity('trabajador_regalos')
@Index(['idTrabajador', 'idRegalo'], { unique: true })
export class TrabajadorRegalo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'id_trabajador' })
  idTrabajador: string;

  @Column({ type: 'uuid', name: 'id_regalo' })
  idRegalo: string;

  @ManyToOne(() => Trabajador, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_trabajador' })
  trabajador: Trabajador;

  @ManyToOne(() => Regalo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_regalo' })
  regalo: Regalo;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
    name: 'updated_at',
  })
  updatedAt: Date;
}
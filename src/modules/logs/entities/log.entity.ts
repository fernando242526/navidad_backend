import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Trabajador } from '../../trabajadores/entities/trabajador.entity';
import { User } from '../../users/entities/user.entity';

@Entity('logs')
@Index(['idTrabajador'])
@Index(['idUsuario'])
@Index(['fechaHora'])
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'id_trabajador' })
  idTrabajador: string;

  @Column({ type: 'uuid', name: 'id_usuario' })
  idUsuario: string;

  @Column({ type: 'varchar', length: 500, name: 'peticion_hecha' })
  peticionHecha: string;

  @Column({ 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP',
    name: 'fecha_hora' 
  })
  fechaHora: Date;

  @ManyToOne(() => Trabajador, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_trabajador' })
  trabajador: Trabajador;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: User;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    name: 'created_at',
  })
  createdAt: Date;
}
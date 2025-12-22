import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  Like,
  EntityManager,
  Not,
  IsNull,
} from 'typeorm';
import {
  Trabajador,
  EstadoCanasta,
  EstadoRegalos,
  AuditorioCanasta,
} from '../entities/trabajador.entity';

@Injectable()
export class TrabajadoresRepository {
  constructor(
    @InjectRepository(Trabajador)
    private readonly repository: Repository<Trabajador>,
  ) {}

  // =========================
  // CREATE
  // =========================
  async create(
    createData: Partial<Trabajador>,
    manager?: EntityManager,
  ): Promise<Trabajador> {
    const repo = manager
      ? manager.getRepository(Trabajador)
      : this.repository;

    const trabajador = repo.create(createData);
    return repo.save(trabajador);
  }

  // =========================
  // FIND ALL (PAGINADO)
  // =========================
  async findAll(
    page = 1,
    limit = 10,
    estadoCanasta?: EstadoCanasta,
    estadoRegalos?: EstadoRegalos,
    auditorioCanasta?: AuditorioCanasta,
    search?: string,
    manager?: EntityManager,
  ): Promise<{ trabajadores: Trabajador[]; total: number }> {
    const repo = manager
      ? manager.getRepository(Trabajador)
      : this.repository;

    const validatedPage = page > 0 ? page : 1;
    const validatedLimit = limit > 0 ? limit : 10;

    const whereConditions: FindOptionsWhere<Trabajador> = {};

    if (estadoCanasta !== undefined) {
      whereConditions.estadoCanasta = estadoCanasta;
    }

    if (estadoRegalos !== undefined) {
      whereConditions.estadoRegalos = estadoRegalos;
    }

    if (auditorioCanasta !== undefined) {
      whereConditions.auditorioCanasta = auditorioCanasta;
    }

    if (search?.trim()) {
      whereConditions.nombresCompletos = Like(`%${search.trim()}%`);
    }

    const [trabajadores, total] = await repo.findAndCount({
      where: whereConditions,
      skip: (validatedPage - 1) * validatedLimit,
      take: validatedLimit,
      order: { createdAt: 'DESC' },
    });

    return { trabajadores, total };
  }

  // =========================
  // FIND ONE
  // =========================
  async findOne(
    id: string,
    manager?: EntityManager,
  ): Promise<Trabajador | null> {
    if (!id) return null;

    const repo = manager
      ? manager.getRepository(Trabajador)
      : this.repository;

    return repo.findOne({ where: { id } });
  }

  // =========================
  // FIND BY DNI
  // =========================
  async findByDni(
    dni: string,
    manager?: EntityManager,
  ): Promise<Trabajador | null> {
    if (!dni) return null;

    const repo = manager
      ? manager.getRepository(Trabajador)
      : this.repository;

    return repo.findOne({ where: { dni } });
  }

  // =========================
  // UPDATE
  // =========================
  async update(
    id: string,
    updateData: Partial<Trabajador>,
    manager?: EntityManager,
  ): Promise<Trabajador | null> {
    if (!id) return null;

    const repo = manager
      ? manager.getRepository(Trabajador)
      : this.repository;

    await repo.update(id, updateData);
    return repo.findOne({ where: { id } });
  }

  // =========================
  // DELETE
  // =========================
  async remove(
    id: string,
    manager?: EntityManager,
  ): Promise<void> {
    if (!id) return;

    const repo = manager
      ? manager.getRepository(Trabajador)
      : this.repository;

    await repo.delete(id);
  }

  // =========================
  // COUNTS
  // =========================
  async count(manager?: EntityManager): Promise<number> {
    const repo = manager
      ? manager.getRepository(Trabajador)
      : this.repository;

    return repo.count();
  }

  async countByEstadoCanasta(
    estadoCanasta: EstadoCanasta,
    manager?: EntityManager,
  ): Promise<number> {
    const repo = manager
      ? manager.getRepository(Trabajador)
      : this.repository;

    return repo.count({ where: { estadoCanasta } });
  }

  async countByEstadoRegalos(
    estadoRegalos: EstadoRegalos,
    manager?: EntityManager,
  ): Promise<number> {
    const repo = manager
      ? manager.getRepository(Trabajador)
      : this.repository;

    return repo.count({ where: { estadoRegalos } });
  }

  // =========================
  // CONTADOR DE CANASTAS ENTREGADAS
  // =========================
  async contarCanastasEntregadasPorAuditorio(
    manager?: EntityManager,
  ): Promise<{ auditorio2: number; auditorio3: number }> {
    const repo = manager
      ? manager.getRepository(Trabajador)
      : this.repository;

    const [auditorio2Count, auditorio3Count] = await Promise.all([
      repo.count({
        where: {
          auditorioCanasta: AuditorioCanasta.AUDITORIO_2,
          idCanasta: Not(IsNull()),
        },
      }),
      repo.count({
        where: {
          auditorioCanasta: AuditorioCanasta.AUDITORIO_3,
          idCanasta: Not(IsNull()),
        },
      }),
    ]);

    return {
      auditorio2: auditorio2Count,
      auditorio3: auditorio3Count,
    };
  }

  // =========================
  // CONTADOR DE REGALOS ENTREGADOS (SUMA DE HIJOS)
  // =========================
  async contarRegalosEntregados(
    manager?: EntityManager,
  ): Promise<number> {
    const repo = manager
      ? manager.getRepository(Trabajador)
      : this.repository;

    const result = await repo
      .createQueryBuilder('trabajador')
      .select('SUM(trabajador.hijos)', 'total')
      .where('trabajador.fechaHoraEntregaJuguetes IS NOT NULL')
      .andWhere('trabajador.hijos IS NOT NULL')
      .getRawOne();

    return result?.total ? parseInt(result.total, 10) : 0;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  EntityManager,
} from 'typeorm';
import { TrabajadorRegalo } from '../entities/trabajador-regalo.entity';

@Injectable()
export class TrabajadorRegalosRepository {
  constructor(
    @InjectRepository(TrabajadorRegalo)
    private readonly repository: Repository<TrabajadorRegalo>,
  ) {}

  // =========================
  // CREATE
  // =========================
  async create(
    createData: Partial<TrabajadorRegalo>,
    manager?: EntityManager,
  ): Promise<TrabajadorRegalo> {
    const repo = manager
      ? manager.getRepository(TrabajadorRegalo)
      : this.repository;

    const trabajadorRegalo = repo.create(createData);
    return repo.save(trabajadorRegalo);
  }

  async createMany(
    createDataArray: Partial<TrabajadorRegalo>[],
    manager?: EntityManager,
  ): Promise<TrabajadorRegalo[]> {
    if (!createDataArray || createDataArray.length === 0) {
      return [];
    }

    const repo = manager
      ? manager.getRepository(TrabajadorRegalo)
      : this.repository;

    const trabajadorRegalos = repo.create(createDataArray);
    return repo.save(trabajadorRegalos);
  }

  // =========================
  // FIND ALL (PAGINADO)
  // =========================
  async findAll(
    page = 1,
    limit = 10,
    idTrabajador?: string,
    idRegalo?: string,
    manager?: EntityManager,
  ): Promise<{ trabajadorRegalos: TrabajadorRegalo[]; total: number }> {
    const repo = manager
      ? manager.getRepository(TrabajadorRegalo)
      : this.repository;

    const validatedPage = page > 0 ? page : 1;
    const validatedLimit = limit > 0 ? limit : 10;

    const whereConditions: FindOptionsWhere<TrabajadorRegalo> = {};

    if (idTrabajador) {
      whereConditions.idTrabajador = idTrabajador;
    }

    if (idRegalo) {
      whereConditions.idRegalo = idRegalo;
    }

    const [trabajadorRegalos, total] = await repo.findAndCount({
      where: whereConditions,
      relations: ['trabajador', 'regalo'],
      skip: (validatedPage - 1) * validatedLimit,
      take: validatedLimit,
      order: { createdAt: 'DESC' },
    });

    return { trabajadorRegalos, total };
  }

  // =========================
  // FIND ONE
  // =========================
  async findOne(
    id: string,
    manager?: EntityManager,
  ): Promise<TrabajadorRegalo | null> {
    if (!id) return null;

    const repo = manager
      ? manager.getRepository(TrabajadorRegalo)
      : this.repository;

    return repo.findOne({
      where: { id },
      relations: ['trabajador', 'regalo'],
    });
  }

  // =========================
  // FIND BY TRABAJADOR
  // =========================
  async findByTrabajadorId(
    idTrabajador: string,
    manager?: EntityManager,
  ): Promise<TrabajadorRegalo[]> {
    if (!idTrabajador) return [];

    const repo = manager
      ? manager.getRepository(TrabajadorRegalo)
      : this.repository;

    return repo.find({
      where: { idTrabajador },
      relations: ['regalo'],
      order: { createdAt: 'ASC' },
    });
  }

  // =========================
  // FIND BY REGALO
  // =========================
  async findByRegaloId(
    idRegalo: string,
    manager?: EntityManager,
  ): Promise<TrabajadorRegalo[]> {
    if (!idRegalo) return [];

    const repo = manager
      ? manager.getRepository(TrabajadorRegalo)
      : this.repository;

    return repo.find({
      where: { idRegalo },
      relations: ['trabajador'],
      order: { createdAt: 'ASC' },
    });
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
      ? manager.getRepository(TrabajadorRegalo)
      : this.repository;

    await repo.delete(id);
  }

  async removeByTrabajadorId(
    idTrabajador: string,
    manager?: EntityManager,
  ): Promise<void> {
    if (!idTrabajador) return;

    const repo = manager
      ? manager.getRepository(TrabajadorRegalo)
      : this.repository;

    await repo.delete({ idTrabajador });
  }

  // =========================
  // COUNTS
  // =========================
  async count(manager?: EntityManager): Promise<number> {
    const repo = manager
      ? manager.getRepository(TrabajadorRegalo)
      : this.repository;

    return repo.count();
  }

  async countByTrabajadorId(
    idTrabajador: string,
    manager?: EntityManager,
  ): Promise<number> {
    if (!idTrabajador) return 0;

    const repo = manager
      ? manager.getRepository(TrabajadorRegalo)
      : this.repository;

    return repo.count({ where: { idTrabajador } });
  }
}

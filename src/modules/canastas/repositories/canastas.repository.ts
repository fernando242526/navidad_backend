import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  Like,
  EntityManager,
} from 'typeorm';
import { Canasta } from '../entities/canasta.entity';

@Injectable()
export class CanastasRepository {
  constructor(
    @InjectRepository(Canasta)
    private readonly repository: Repository<Canasta>,
  ) {}

  // =========================
  // CREATE
  // =========================
  async create(
    createData: Partial<Canasta>,
    manager?: EntityManager,
  ): Promise<Canasta> {
    const repo = manager
      ? manager.getRepository(Canasta)
      : this.repository;

    const canasta = repo.create(createData);
    return repo.save(canasta);
  }

  // =========================
  // FIND ALL (PAGINADO)
  // =========================
  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    manager?: EntityManager,
  ): Promise<{ canastas: Canasta[]; total: number }> {
    const repo = manager
      ? manager.getRepository(Canasta)
      : this.repository;

    const validatedPage = page > 0 ? page : 1;
    const validatedLimit = limit > 0 ? limit : 10;

    const whereConditions: FindOptionsWhere<Canasta> = {};

    if (search?.trim()) {
      whereConditions.codigoQr = Like(`%${search.trim()}%`);
    }

    const [canastas, total] = await repo.findAndCount({
      where: whereConditions,
      skip: (validatedPage - 1) * validatedLimit,
      take: validatedLimit,
      order: { createdAt: 'DESC' },
    });

    return { canastas, total };
  }

  // =========================
  // FIND ONE
  // =========================
  async findOne(
    id: string,
    manager?: EntityManager,
  ): Promise<Canasta | null> {
    if (!id) return null;

    const repo = manager
      ? manager.getRepository(Canasta)
      : this.repository;

    return repo.findOne({ where: { id } });
  }

  // =========================
  // FIND BY QR
  // =========================
  async findByCodigoQr(
    codigoQr: string,
    manager?: EntityManager,
  ): Promise<Canasta | null> {
    if (!codigoQr) return null;

    const repo = manager
      ? manager.getRepository(Canasta)
      : this.repository;

    return repo.findOne({ where: { codigoQr } });
  }

  // =========================
  // UPDATE
  // =========================
  async update(
    id: string,
    updateData: Partial<Canasta>,
    manager?: EntityManager,
  ): Promise<Canasta | null> {
    if (!id) return null;

    const repo = manager
      ? manager.getRepository(Canasta)
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
      ? manager.getRepository(Canasta)
      : this.repository;

    await repo.delete(id);
  }

  // =========================
  // COUNT
  // =========================
  async count(manager?: EntityManager): Promise<number> {
    const repo = manager
      ? manager.getRepository(Canasta)
      : this.repository;

    return repo.count();
  }
}

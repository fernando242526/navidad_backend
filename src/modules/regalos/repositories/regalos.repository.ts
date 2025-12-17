import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  Like,
  In,
  EntityManager,
} from 'typeorm';
import { Regalo } from '../entities/regalo.entity';

@Injectable()
export class RegalosRepository {
  constructor(
    @InjectRepository(Regalo)
    private readonly repository: Repository<Regalo>,
  ) {}

  // =========================
  // CREATE
  // =========================
  async create(
    createData: Partial<Regalo>,
    manager?: EntityManager,
  ): Promise<Regalo> {
    const repo = manager
      ? manager.getRepository(Regalo)
      : this.repository;

    const regalo = repo.create(createData);
    return repo.save(regalo);
  }

  // =========================
  // FIND ALL (PAGINADO)
  // =========================
  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    manager?: EntityManager,
  ): Promise<{ regalos: Regalo[]; total: number }> {
    const repo = manager
      ? manager.getRepository(Regalo)
      : this.repository;

    const validatedPage = page > 0 ? page : 1;
    const validatedLimit = limit > 0 ? limit : 10;

    const whereConditions: FindOptionsWhere<Regalo> = {};

    if (search?.trim()) {
      whereConditions.codigoQr = Like(`%${search.trim()}%`);
    }

    const [regalos, total] = await repo.findAndCount({
      where: whereConditions,
      skip: (validatedPage - 1) * validatedLimit,
      take: validatedLimit,
      order: { createdAt: 'DESC' },
    });

    return { regalos, total };
  }

  // =========================
  // FIND ONE
  // =========================
  async findOne(
    id: string,
    manager?: EntityManager,
  ): Promise<Regalo | null> {
    if (!id) return null;

    const repo = manager
      ? manager.getRepository(Regalo)
      : this.repository;

    return repo.findOne({ where: { id } });
  }

  // =========================
  // FIND BY QR
  // =========================
  async findByCodigoQr(
    codigoQr: string,
    manager?: EntityManager,
  ): Promise<Regalo | null> {
    if (!codigoQr) return null;

    const repo = manager
      ? manager.getRepository(Regalo)
      : this.repository;

    return repo.findOne({ where: { codigoQr } });
  }

  // =========================
  // FIND BY IDS (IN)
  // =========================
  async findByIds(
    ids: string[],
    manager?: EntityManager,
  ): Promise<Regalo[]> {
    if (!ids || ids.length === 0) return [];

    const repo = manager
      ? manager.getRepository(Regalo)
      : this.repository;

    return repo.find({
      where: { id: In(ids) },
    });
  }

  // =========================
  // UPDATE
  // =========================
  async update(
    id: string,
    updateData: Partial<Regalo>,
    manager?: EntityManager,
  ): Promise<Regalo | null> {
    if (!id) return null;

    const repo = manager
      ? manager.getRepository(Regalo)
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
      ? manager.getRepository(Regalo)
      : this.repository;

    await repo.delete(id);
  }

  // =========================
  // COUNT
  // =========================
  async count(manager?: EntityManager): Promise<number> {
    const repo = manager
      ? manager.getRepository(Regalo)
      : this.repository;

    return repo.count();
  }
}

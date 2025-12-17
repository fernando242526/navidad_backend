import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { Canasta } from '../entities/canasta.entity';

@Injectable()
export class CanastasRepository {
  constructor(
    @InjectRepository(Canasta)
    private readonly canastaRepository: Repository<Canasta>,
  ) {}

  async create(createData: Partial<Canasta>): Promise<Canasta> {
    const canasta = this.canastaRepository.create(createData);
    return await this.canastaRepository.save(canasta);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ canastas: Canasta[]; total: number }> {
    const validatedPage = page > 0 ? page : 1;
    const validatedLimit = limit > 0 ? limit : 10;

    const whereConditions: FindOptionsWhere<Canasta> = {};

    if (search !== undefined && search.trim() !== '') {
      whereConditions.codigoQr = Like(`%${search.trim()}%`);
    }

    const [canastas, total] = await this.canastaRepository.findAndCount({
      where: whereConditions,
      skip: (validatedPage - 1) * validatedLimit,
      take: validatedLimit,
      order: { createdAt: 'DESC' },
    });

    return { canastas, total };
  }

  async findOne(id: string): Promise<Canasta | null> {
    if (!id) {
      return null;
    }

    return await this.canastaRepository.findOne({
      where: { id },
    });
  }

  async findByCodigoQr(codigoQr: string): Promise<Canasta | null> {
    if (!codigoQr) {
      return null;
    }

    return await this.canastaRepository.findOne({
      where: { codigoQr },
    });
  }

  async update(id: string, updateData: Partial<Canasta>): Promise<Canasta | null> {
    if (!id) {
      return null;
    }

    await this.canastaRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    if (!id) {
      return;
    }

    await this.canastaRepository.delete(id);
  }

  async count(): Promise<number> {
    return await this.canastaRepository.count();
  }
}